
// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, MemberStatus } from '../../types';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileSpreadsheet } from 'lucide-react';
import XLSX from 'xlsx-js-style';

const RecapData: React.FC = () => {
  const { attendanceSessions, attendanceRecords, users, showToast } = useApp();
  const [recapType, setRecapType] = useState<'attendance' | 'members'>('attendance');

  const attendanceStatsData = useMemo(() => {
     if (!attendanceSessions || attendanceSessions.length === 0) return [];
     return [...attendanceSessions]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7)
        .map(s => ({
            name: s.date.split('-').slice(1).reverse().join('/'), 
            Hadir: s.attendees ? s.attendees.length : 0,
            fullDate: s.date,
            title: s.name
        }));
  }, [attendanceSessions]);

  const wilayahData = useMemo(() => {
      if (!users || users.length === 0) return [];
      const counts: Record<string, number> = {};
      users.forEach(u => {
          if (u.role === UserRole.MEMBER && u.status === MemberStatus.ACTIVE) {
              const w = u.wilayah || 'Lainnya';
              counts[w] = (counts[w] || 0) + 1;
          }
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); 
  }, [users]);

  const handleExportAttendance = () => {
    try {
        const wb = XLSX.utils.book_new();
        const summaryData = attendanceSessions.map(s => ({ 'ID Sesi': s.id, 'Tanggal': s.date, 'Kegiatan': s.name, 'Total Hadir': s.attendees.length, 'Status': s.isOpen ? 'Buka' : 'Tutup' }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Ringkasan");
        const detailData = attendanceRecords.map(r => {
             const session = attendanceSessions.find(s => s.id === r.sessionId);
             const user = users.find(u => u.id === r.userId);
             return { 'Waktu': r.timestamp, 'Nama': r.userName, 'NIA': user?.nia || '-', 'Kegiatan': session?.name || '-', 'Lokasi': r.location };
        });
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailData), "Detail");
        XLSX.writeFile(wb, `Absensi_JSN_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast("Export berhasil!", "success");
    } catch (e) { showToast("Gagal export data", "error"); }
  };

  const handleExportMembers = () => {
     try {
         const data = users.filter(u => u.role === UserRole.MEMBER).map(u => ({ 'Nama': u.name, 'NIA': u.nia, 'NIK': u.nik, 'Wilayah': u.wilayah, 'HP': u.phone, 'Alamat': u.address }));
         const wb = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "Anggota");
         XLSX.writeFile(wb, `Anggota_JSN.xlsx`);
         showToast("Export berhasil!", "success");
     } catch (e) { showToast("Gagal export data", "error"); }
  };

  return (
    <div className="space-y-6">
        <div className="flex gap-4">
            <button onClick={() => setRecapType('attendance')} className={`px-4 py-2 rounded-xl font-bold text-sm ${recapType === 'attendance' ? 'bg-primary-900 text-white' : 'bg-white border text-neutral-600'}`}>Rekap Absensi</button>
            <button onClick={() => setRecapType('members')} className={`px-4 py-2 rounded-xl font-bold text-sm ${recapType === 'members' ? 'bg-primary-900 text-white' : 'bg-white border text-neutral-600'}`}>Rekap Anggota</button>
        </div>
        {recapType === 'attendance' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h3 className="font-bold text-lg mb-4">Statistik Kehadiran</h3>
                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={attendanceStatsData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}} /><YAxis tick={{fontSize:10}} /><Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} /><Bar dataKey="Hadir" fill="#059669" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
                <div className="mt-6 flex justify-end"><button onClick={handleExportAttendance} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-emerald-700"><FileSpreadsheet size={16}/> Download Laporan Lengkap</button></div>
            </div>
        )}
        {recapType === 'members' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h3 className="font-bold text-lg mb-4">Sebaran Wilayah</h3>
                <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={wilayahData} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" tick={{fontSize:10}} /><YAxis dataKey="name" type="category" width={100} tick={{fontSize:10}} /><Tooltip /><Bar dataKey="value" fill="#d97706" radius={[0,4,4,0]} barSize={20} /></BarChart></ResponsiveContainer></div>
                <div className="mt-6 flex justify-end"><button onClick={handleExportMembers} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-emerald-700"><FileSpreadsheet size={16}/> Download Database Anggota</button></div>
            </div>
        )}
    </div>
  );
};

export default RecapData;
