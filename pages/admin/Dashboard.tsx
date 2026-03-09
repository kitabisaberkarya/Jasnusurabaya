
// @ts-nocheck
import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Users, Calendar, UserCheck, FileText, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard: React.FC = () => {
  const { users, registrations, news, attendanceSessions } = useApp();

  const memberGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];
    const months: Record<string, number> = {};
    const sortedUsers = [...users].sort((a, b) => {
        const dateA = new Date((a as any).joined_at || a.joinedAt || '2024-01-01').getTime();
        const dateB = new Date((b as any).joined_at || b.joinedAt || '2024-01-01').getTime();
        return dateA - dateB;
    });
    sortedUsers.forEach(user => {
       if (user.role === UserRole.MEMBER) {
           const rawDate = (user as any).joined_at || user.joinedAt || new Date().toISOString();
           const date = new Date(rawDate);
           if (!isNaN(date.getTime())) {
               const key = date.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
               months[key] = (months[key] || 0) + 1;
           }
       }
    });
    let total = 0;
    return Object.entries(months).map(([name, count]) => {
        total += count;
        return { name, Anggota: total, Baru: count };
    });
  }, [users]);

  const wilayahData = useMemo(() => {
      if (!users || users.length === 0) return [];
      const counts: Record<string, number> = {};
      users.forEach(u => {
          if (u.role === UserRole.MEMBER) {
              const w = u.wilayah || 'Lainnya';
              counts[w] = (counts[w] || 0) + 1;
          }
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); 
  }, [users]);

  const COLORS = ['#059669', '#d97706', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 border border-white/20 rounded-xl shadow-xl">
          <p className="font-bold text-primary-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const pendingCount = registrations.filter(r => r.status === 'pending' || r.status === 'verified_korwil').length;

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider relative z-10">Total Anggota</p>
                <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{users.filter(u => (u.status === 'active' || !u.status || u.status === '') && (u.role === UserRole.MEMBER || !u.role || u.role === '')).length}</h3>
                <div className="absolute bottom-4 right-4 text-white opacity-20"><Users size={40}/></div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold text-amber-100 uppercase tracking-wider relative z-10">Total Kegiatan</p>
                <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{attendanceSessions.length}</h3>
                <div className="absolute bottom-4 right-4 text-white opacity-20"><Calendar size={40}/></div>
            </div>
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold text-rose-100 uppercase tracking-wider relative z-10">Menunggu Verifikasi</p>
                <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{pendingCount}</h3>
                <div className="absolute bottom-4 right-4 text-white opacity-20"><UserCheck size={40}/></div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold text-blue-100 uppercase tracking-wider relative z-10">Berita Terbit</p>
                <h3 className="text-4xl font-serif font-bold mt-2 relative z-10">{news.length}</h3>
                <div className="absolute bottom-4 right-4 text-white opacity-20"><FileText size={40}/></div>
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 shadow-lg p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div><h3 className="font-bold text-lg text-primary-900">Pertumbuhan Anggota</h3><p className="text-xs text-neutral-400">Akumulasi anggota terdaftar per bulan (Realtime)</p></div>
                    <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl"><BarChart2 size={20}/></div>
                </div>
                <div className="h-[300px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%"><AreaChart data={memberGrowthData}><defs><linearGradient id="colorAnggota" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.4}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="Anggota" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorAnggota)" animationDuration={1500}/></AreaChart></ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-1 bg-white rounded-3xl border border-neutral-100 shadow-lg p-6 relative overflow-hidden flex flex-col">
                <div className="mb-4 relative z-10"><h3 className="font-bold text-lg text-primary-900">Sebaran Wilayah</h3><p className="text-xs text-neutral-400">Top 5 Korwil dengan anggota terbanyak</p></div>
                <div className="flex-1 min-h-[250px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={wilayahData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">{wilayahData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))'}} />))}</Pie><Tooltip content={<CustomTooltip />} /><Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px', paddingTop: '20px'}}/></PieChart></ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
