/**
 * Script Setup Spreadsheet JSN
 * Membuat sheet dengan tampilan otomatis, estetik, dan modern.
 */

function createModernSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Konfigurasi Nama Sheet dan Kolom beserta Tema Warna (Hex Code)
  const sheetsToCreate = [
    {
      name: "DATA ANGGOTA",
      themeColor: "#2563EB", // Modern Blue
      columns: ["No", "Waktu Daftar", "Nama Lengkap", "NIA", "NIK", "Email", "Nomor HP", "Wilayah", "Role", "Status"]
    },
    {
      name: "REKAP ABSENSI",
      themeColor: "#059669", // Emerald Green
      columns: ["No", "Waktu Absen", "Nama Acara/Sesi", "Nama Anggota", "Jarak Geofencing", "Lokasi", "Bukti Foto"]
    },
    {
      name: "PENDAFTARAN BARU",
      themeColor: "#D97706", // Amber / Orange
      columns: ["No", "Waktu Masuk", "Nama Pendaftar", "NIK", "Email", "Nomor HP", "Wilayah Asal", "Status Verifikasi"]
    }
  ];

  sheetsToCreate.forEach(config => {
    let sheet = ss.getSheetByName(config.name);
    // Jika sheet belum ada, buat baru. Jika sudah ada, hapus isinya untuk di-reset.
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    } else {
      sheet.clear();
      // Hapus desain sebelumnya jika ada
      sheet.getBandings().forEach(b => b.remove());
    }

    // 1. Tulis Judul Kolom (Header)
    sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns]);

    // 2. Format Seluruh Tabel (100 baris pertama untuk template)
    const maxRows = 100;
    const fullRange = sheet.getRange(1, 1, maxRows, config.columns.length);
    fullRange.setFontFamily("Inter") // Font UI modern
             .setVerticalAlignment("middle")
             .setHorizontalAlignment("center"); // Bisa diubah "left" jika teks kepanjangan

    // 3. Terapkan Tema Belang-Belang (Banded Rows) pada Range
    const banding = fullRange.applyRowBanding();
    banding.setHeaderRowColor(config.themeColor) 
           .setFirstRowColor("#FFFFFF") // Baris Ganjil: Putih Murni
           .setSecondRowColor("#F8FAFC"); // Baris Genap: Abu kebiruan minimalis
    
    // 4. Styling Spesifik untuk Header (Baris ke-1)
    const headerRange = sheet.getRange(1, 1, 1, config.columns.length);
    headerRange.setFontColor("#FFFFFF")
               .setFontWeight("bold")
               .setFontSize(11);
    
    // 5. Freeze Pane (Kunci Header) & Lebar Baris
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 45); // Header lebih tebal
    
    for(let r=2; r<=maxRows; r++) {
      sheet.setRowHeight(r, 36); // Baris data tinggi agar "bernafas" (clean UI)
    }

    // 6. Pasang Filter Dropdown otomatis
    if (sheet.getFilter() != null) {
      sheet.getFilter().remove();
    }
    headerRange.createFilter();

    // 7. Auto-Resize Kolom & Tambah Padding (Lebar/Spasi ekstra)
    for (let c = 1; c <= config.columns.length; c++) {
      sheet.autoResizeColumn(c);
      const currentWidth = sheet.getColumnWidth(c);
      // Memaksa kolom minimal 120px agar tidak terlalu mepet dengan teks
      sheet.setColumnWidth(c, currentWidth < 100 ? 130 : currentWidth + 30);
    }
    
    // Opsional: Buat kolom "Nama Lengkap" rata kiri agar rapi
    sheet.getRange(2, 3, maxRows - 1, 1).setHorizontalAlignment("left");
  });

  // Hapus "Sheet1" bawaan yang kosong secara otomatis jika masih ada
  const sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(sheet1); } catch (e) {}
  }

  // Notifikasi Selesai
  SpreadsheetApp.getUi().alert(
    'Berhasil! 🎉', 
    'Semua sheet telah dibuat dengan desain kelas Enterprise. Spreadsheet siap dihubungkan dengan Google Cloud / Firebase.', 
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// Fungsi ini memunculkan tombol custom di menu atas Spreadsheet Anda
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 JSN TOOLS')
    .addItem('Generate Desain Database', 'createModernSpreadsheet')
    .addToUi();
}

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1SSf3p2bhbWUm0W6MBdNWVsKUiA4bORzZRbbJqmHFh1o"; // URL Spreadsheet Anda

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    
    if (payload.action === "sync") {
      // 1. Sync Data Absensi
      if (payload.absensi && payload.absensi.length > 0) {
        syncToSheet(ss, "Absensi", payload.absensi, ["Waktu", "Nama", "NIA", "Kegiatan", "Lokasi"], "#059669"); // Hijau elegan
      }
      
      // 2. Sync Data Anggota
      if (payload.anggota && payload.anggota.length > 0) {
        syncToSheet(ss, "Anggota", payload.anggota, ["Nama", "NIA", "NIK", "Wilayah", "HP", "Alamat"], "#2563EB"); // Biru elegan
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data tersinkronisasi" }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// === Fungsi Pembuat Sheet dengan Desain Warna-Warni & Modern ===
function syncToSheet(ss, sheetName, dataList, headers, headerColor) {
  let sheet = ss.getSheetByName(sheetName);
  
  // Jika sheet belum ada, buat baru
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    // Jika sudah ada, hapus data lama untuk direkap ulang
    sheet.clear(); 
  }
  
  // === 1. TULIS HEADERS ===
  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  
  // Gaya untuk Header (Warna background custom, font putih, bold)
  headerRange.setBackground(headerColor);
  headerRange.setFontColor("white");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 40); // Tinggi baris header
  
  // === 2. TULIS DATA ===
  const dataRows = dataList.map(item => headers.map(h => {
    // Menghindari error jika ada data yang kosong (null/undefined)
    return item[h] !== undefined && item[h] !== null ? item[h] : "-";
  }));
  
  if (dataRows.length > 0) {
    const dataRange = sheet.getRange(2, 1, dataRows.length, headers.length);
    dataRange.setValues(dataRows);
    dataRange.setVerticalAlignment("middle");
    
    // Memberikan style selang-seling pada baris data (Zebra striping)
    for (let i = 0; i < dataRows.length; i++) {
       const row = sheet.getRange(i + 2, 1, 1, headers.length);
       if (i % 2 === 0) {
         row.setBackground("#f8fafc"); // Warna abu-abu sangat muda
       } else {
         row.setBackground("#ffffff"); // Putih
       }
    }
    
    // Menambah border luar pada data (rapi)
    dataRange.setBorder(true, true, true, true, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }
  
  // Membekukan Header agar tidak ikut ter-scroll
  sheet.setFrozenRows(1);
  
  // Auto-resize lebar kolom secara cerdas
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
    // Tambah sedikit ruang extra agar tidak terlalu sesak
    const currentWidth = sheet.getColumnWidth(i);
    sheet.setColumnWidth(i, currentWidth + 20); 
  }
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    if (data.action === "sync") {
      // Setup Sheet Absensi
      var absensiSheet = sheet.getSheetByName("Data Absensi");
      if (!absensiSheet) { absensiSheet = sheet.insertSheet("Data Absensi"); } 
      
      // Setup Sheet Anggota
      var anggotaSheet = sheet.getSheetByName("Data Anggota");
      if (!anggotaSheet) { anggotaSheet = sheet.insertSheet("Data Anggota"); } 
      
      // Format dan Isi Data Absensi (Warna Header: Biru Elegan)
      formatAndFillSheet(absensiSheet, data.absensi, "Laporan Data Absensi Kehadiran", ["Waktu", "Nama", "NIA", "Kegiatan", "Lokasi"], "#4F46E5");
      
      // Format dan Isi Data Anggota (Warna Header: Hijau Emerald)
      formatAndFillSheet(anggotaSheet, data.anggota, "Laporan Data Anggota JSN", ["Nama", "NIA", "NIK", "Wilayah", "HP", "Alamat"], "#059669");
      
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Data tersinkron!"}))
             .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.toString()}))
           .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi Pemanis Tabel (Auto-styling)
function formatAndFillSheet(sheet, recordArray, titleText, headers, headerColor) {
  sheet.clear(); // Bersihkan yang lama
  
  // Header Judul Laporan
  sheet.getRange(1, 1).setValue(titleText).setFontSize(16).setFontWeight("bold").setFontColor("#1F2937");
  sheet.getRange(1, 1, 1, headers.length).merge();
  sheet.getRange(2, 1).setValue("Update Terakhir: " + new Date().toLocaleString("id-ID")).setFontStyle("italic").setFontColor("#6B7280");
  sheet.getRange(2, 1, 1, headers.length).merge();
  
  // Styling Header Tabel (Warna, Font, dll)
  var headerRange = sheet.getRange(4, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground(headerColor).setFontColor("#ffffff").setFontWeight("bold")
             .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(4, 30);
  
  if (!recordArray || recordArray.length === 0) {
    sheet.getRange(5, 1).setValue("Belum ada data.");
    return;
  }
  
  // Mapping Data menjadi Baris
  var rows = [];
  for (var i = 0; i < recordArray.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      row.push(recordArray[i][headers[j]] || "-");
    }
    rows.push(row);
  }
  
  // Set Data ke Sheet
  var dataRange = sheet.getRange(5, 1, rows.length, headers.length);
  dataRange.setValues(rows);
  
  // Styling Baris Data (Garis pembatas & Selang-seling Warna)
  dataRange.setVerticalAlignment("middle");
  dataRange.setBorder(true, true, true, true, true, true, "#E5E7EB", SpreadsheetApp.BorderStyle.SOLID);
  
  for (var k = 5; k < 5 + rows.length; k++) {
    if (k % 2 === 1) sheet.getRange(k, 1, 1, headers.length).setBackground("#F9FAFB"); // Abu-abu sangat tipis
    else sheet.getRange(k, 1, 1, headers.length).setBackground("#FFFFFF");
  }
  
  // Auto Resize Kolom agar tidak ada teks terpotong
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}