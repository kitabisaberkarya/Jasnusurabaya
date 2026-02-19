
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, RefreshCcw, UploadCloud, Database, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BackupData } from '../../types';
import { supabase } from '../../lib/supabase';
import XLSX from 'xlsx-js-style';

const BackupRestore: React.FC = () => {
  const { downloadBackup, restoreData, showToast } = useApp();
  const [isRestoring, setIsRestoring] = useState(false);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  // CSV Import States
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTable, setSelectedTable] = useState('users');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const TABLES = [
    { value: 'users', label: 'Users (Anggota)' },
    { value: 'registrations', label: 'Registrations (Pendaftaran)' },
    { value: 'attendance_sessions', label: 'Attendance Sessions (Kegiatan)' },
    { value: 'attendance_records', label: 'Attendance Records (Data Absensi)' },
    { value: 'news', label: 'News (Berita)' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'sliders', label: 'Sliders' },
    { value: 'media_posts', label: 'Media Posts' },
    { value: 'korwils', label: 'Korwils (Wilayah)' },
    { value: 'site_config', label: 'Site Config' },
    { value: 'profile_pages', label: 'Profile Pages' }
  ];

  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (!window.confirm("PERINGATAN: Restore akan menimpa/menambah data yang ada di database. Apakah Anda yakin ingin melanjutkan?")) { e.target.value = ''; return; }
        setIsRestoring(true);
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text) as BackupData;
            if (!jsonData.version || !jsonData.data) { throw new Error("Format file backup tidak valid"); }
            const success = await restoreData(jsonData);
            if (success) { showToast("Database berhasil direstore!", "success"); }
        } catch (error) { console.error(error); showToast("Gagal membaca file backup", "error"); } finally { setIsRestoring(false); e.target.value = ''; }
    }
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
              try {
                  const bstr = evt.target?.result;
                  const wb = XLSX.read(bstr, { type: 'binary' });
                  const wsname = wb.SheetNames[0];
                  const ws = wb.Sheets[wsname];
                  // Raw parsing
                  const data = XLSX.utils.sheet_to_json(ws);
                  setImportPreview(data);
                  if (data.length > 0) {
                      showToast(`File dibaca: ${data.length} baris data ditemukan`, "info");
                  } else {
                      showToast("File kosong atau format salah", "error");
                  }
              } catch (err) {
                  console.error(err);
                  showToast("Gagal membaca file CSV. Pastikan format benar.", "error");
              }
          };
          reader.readAsBinaryString(file);
      }
  };

  const executeImport = async () => {
      if (importPreview.length === 0) return;
      
      setIsImporting(true);
      try {
          // Batch insert/upsert
          const BATCH_SIZE = 100;
          let successCount = 0;
          
          for (let i = 0; i < importPreview.length; i += BATCH_SIZE) {
              const chunk = importPreview.slice(i, i + BATCH_SIZE);
              
              // Cleaning keys (remove spaces, etc if needed, but assuming headers match DB columns)
              const { error } = await supabase.from(selectedTable).upsert(chunk);
              if (error) throw error;
              successCount += chunk.length;
          }

          showToast(`Sukses mengimport ${successCount} data ke tabel ${selectedTable}`, "success");
          setImportPreview([]);
          if (importFileInputRef.current) importFileInputRef.current.value = '';

          // Special notification for ID sequence reset
          if (selectedTable === 'users' || selectedTable === 'registrations' || selectedTable === 'attendance_sessions') {
             alert(`PENTING: Karena Anda mengimport data ke tabel '${selectedTable}', disarankan untuk mereset Sequence ID database agar data baru tidak error.\n\nSilakan jalankan script: SELECT setval(pg_get_serial_sequence('${selectedTable}', 'id'), coalesce(max(id),0) + 1, false) FROM ${selectedTable};`);
          }

      } catch (error: any) {
          console.error(error);
          showToast(`Gagal Import: ${error.message || 'Unknown error'}`, "error");
      } finally {
          setIsImporting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
        
        {/* EXISTING: JSON BACKUP/RESTORE */}
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Download size={32} />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Backup JSON</h3>
                <p className="text-sm text-neutral-500 mb-6">Backup lengkap seluruh data aplikasi.</p>
                <button onClick={downloadBackup} className="mt-auto bg-primary-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-800 shadow-lg w-full transition transform hover:-translate-y-1">
                    Download Backup
                </button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                    <RefreshCcw size={32} />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">Restore JSON</h3>
                <p className="text-sm text-neutral-500 mb-6">Pulihkan sistem dari file JSON backup.</p>
                <div className="relative w-full mt-auto">
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={restoreFileInputRef}
                        onChange={handleRestoreFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <button className={`bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 shadow-lg w-full transition transform hover:-translate-y-1 flex items-center justify-center gap-2 ${isRestoring ? 'opacity-70' : ''}`}>
                        {isRestoring ? <RefreshCcw className="animate-spin" size={20}/> : <UploadCloud size={20} />} 
                        {isRestoring ? 'Memulihkan...' : 'Pilih File JSON'}
                    </button>
                </div>
            </div>
        </div>

        {/* NEW: CSV IMPORT SECTION */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden">
             <div className="bg-neutral-50 px-8 py-6 border-b border-neutral-200 flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                     <FileSpreadsheet size={24} />
                 </div>
                 <div>
                     <h3 className="text-xl font-bold text-neutral-800">Import Data CSV</h3>
                     <p className="text-sm text-neutral-500">Fitur untuk migrasi data lama atau import massal via Excel/CSV.</p>
                 </div>
             </div>
             
             <div className="p-8">
                 <div className="grid md:grid-cols-2 gap-8 items-start">
                     <div className="space-y-4">
                         <div>
                             <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">1. Pilih Tabel Tujuan</label>
                             <select 
                                className="w-full border border-neutral-300 rounded-xl p-3 font-bold text-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                             >
                                 {TABLES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                             </select>
                         </div>

                         <div>
                             <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">2. Upload File CSV</label>
                             <div className="relative border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:bg-neutral-50 transition">
                                 <input 
                                     type="file" 
                                     accept=".csv, .xlsx, .xls"
                                     ref={importFileInputRef}
                                     onChange={handleCsvFileSelect}
                                     className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                 />
                                 <UploadCloud className="mx-auto text-neutral-400 mb-2" size={32} />
                                 <p className="text-sm font-bold text-neutral-600">Klik untuk pilih file</p>
                                 <p className="text-xs text-neutral-400 mt-1">Format: CSV atau Excel (Header baris pertama harus sesuai nama kolom database)</p>
                             </div>
                         </div>
                     </div>

                     <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 h-full flex flex-col">
                         <h4 className="font-bold text-neutral-700 mb-4 flex items-center gap-2">
                             <Database size={18} /> Preview Data
                         </h4>
                         
                         <div className="flex-grow overflow-auto max-h-[200px] border border-neutral-200 rounded-lg bg-white mb-4">
                             {importPreview.length > 0 ? (
                                 <table className="w-full text-xs text-left">
                                     <thead className="bg-neutral-100 font-bold text-neutral-600 sticky top-0">
                                         <tr>
                                             {Object.keys(importPreview[0]).map(key => (
                                                 <th key={key} className="px-3 py-2 border-b">{key}</th>
                                             ))}
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {importPreview.slice(0, 5).map((row, idx) => (
                                             <tr key={idx} className="border-b last:border-0 hover:bg-neutral-50">
                                                 {Object.values(row).map((val: any, vIdx) => (
                                                     <td key={vIdx} className="px-3 py-2 truncate max-w-[100px]">{String(val)}</td>
                                                 ))}
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             ) : (
                                 <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8">
                                     <p>Belum ada file dipilih.</p>
                                 </div>
                             )}
                         </div>
                         
                         {importPreview.length > 0 && (
                             <p className="text-xs text-neutral-500 mb-4 text-center">
                                Menampilkan 5 dari {importPreview.length} baris data.
                             </p>
                         )}

                         <button 
                             onClick={executeImport}
                             disabled={isImporting || importPreview.length === 0}
                             className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 ${isImporting || importPreview.length === 0 ? 'bg-neutral-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                         >
                             {isImporting ? <RefreshCcw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                             {isImporting ? 'Mengimport Data...' : 'Import Data Sekarang'}
                         </button>
                     </div>
                 </div>
                 
                 <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                     <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                     <p>
                        <strong>PENTING:</strong> Pastikan header kolom di file CSV sama persis dengan nama kolom di database (misal: <code>name</code>, <code>email</code>, <code>role</code>). 
                        Data dengan ID yang sama akan ditimpa (Upsert). <br/>
                        Jika terjadi error <code>Identity Column</code>, jalankan script SQL perbaikan di Supabase Editor.
                     </p>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default BackupRestore;
