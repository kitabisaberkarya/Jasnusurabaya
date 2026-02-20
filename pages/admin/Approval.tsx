
// @ts-nocheck
import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, MemberStatus } from '../../types';
import { MapPin, Phone } from 'lucide-react';

const Approval: React.FC = () => {
  const { registrations, currentUser, verifyMemberByKorwil, approveMemberFinal, rejectMember, deleteRegistration } = useApp();
  const [activeTab, setActiveTab] = React.useState<'pending' | 'rejected'>('pending');
  
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;
  const isPengurus = currentUser?.role === UserRole.ADMIN_PENGURUS;

  const getRegistrations = () => {
     let filtered = registrations;
     
     if (activeTab === 'pending') {
        if (isKorwil) {
           filtered = registrations.filter(r => r.status === MemberStatus.PENDING && r.wilayah === currentUser?.wilayah);
        } else if (isPengurus) {
           filtered = registrations.filter(r => r.status === MemberStatus.VERIFIED_KORWIL);
        } else {
           filtered = registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL);
        }
     } else {
        // Rejected Tab
        if (isKorwil) {
           filtered = registrations.filter(r => r.status === MemberStatus.REJECTED && r.wilayah === currentUser?.wilayah);
        } else {
           filtered = registrations.filter(r => r.status === MemberStatus.REJECTED);
        }
     }
     return filtered;
  };

  const filteredRegistrations = getRegistrations();
  const pendingTotal = registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL).length;
  const rejectedTotal = registrations.filter(r => r.status === MemberStatus.REJECTED).length;

  return (
    <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-center bg-neutral-50 gap-4">
            <div className="flex bg-neutral-200 p-1 rounded-xl w-full md:w-auto">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                    Menunggu ({pendingTotal})
                </button>
                <button 
                    onClick={() => setActiveTab('rejected')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                    Ditolak ({rejectedTotal})
                </button>
            </div>
            <h3 className="font-bold text-lg text-neutral-700 hidden md:block">Verifikasi Pendaftaran</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100">
                    <tr><th className="px-6 py-4">Nama Pendaftar</th><th className="px-6 py-4">Data Diri</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Tindakan</th></tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {filteredRegistrations.map(r => (
                        <tr key={r.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 font-bold text-neutral-800">
                                {r.name}
                                <div className="text-[10px] text-neutral-400 font-mono font-normal">NIK: {r.nik}</div>
                                <div className="text-[10px] text-neutral-400 font-normal">{r.date}</div>
                            </td>
                            <td className="px-6 py-4 text-xs space-y-1">
                                <div className="flex items-center gap-2 font-medium text-neutral-700"><MapPin size={12}/> {r.wilayah}</div>
                                <div className="flex items-center gap-2 text-neutral-500"><Phone size={12}/> {r.phone}</div>
                                <div className="text-neutral-400 truncate max-w-[200px]">{r.address}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                    r.status === MemberStatus.PENDING ? 'bg-amber-100 text-amber-700' : 
                                    r.status === MemberStatus.VERIFIED_KORWIL ? 'bg-blue-100 text-blue-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {r.status === MemberStatus.PENDING ? 'Menunggu Korwil' : 
                                     r.status === MemberStatus.VERIFIED_KORWIL ? 'Menunggu Pusat' : 
                                     'Ditolak'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {activeTab === 'pending' ? (
                                    <>
                                        {r.status === MemberStatus.PENDING && (isKorwil || isSuperAdmin) && (
                                            <button onClick={() => verifyMemberByKorwil(r.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 mr-2 shadow-sm">Verifikasi</button>
                                        )}
                                        {r.status === MemberStatus.VERIFIED_KORWIL && (isPengurus || isSuperAdmin) && (
                                            <button onClick={() => approveMemberFinal(r.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 mr-2 shadow-sm">Terbitkan NIA</button>
                                        )}
                                        <button onClick={() => rejectMember(r.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded text-xs font-bold transition">Tolak</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => verifyMemberByKorwil(r.id)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold mr-2">Pulihkan</button>
                                        {isSuperAdmin && (
                                            <button onClick={() => deleteRegistration(r.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded text-xs font-bold transition">Hapus Permanen</button>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredRegistrations.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Tidak ada data {activeTab === 'pending' ? 'pendaftaran baru' : 'pendaftaran ditolak'}.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Approval;
