
// @ts-nocheck
import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, MemberStatus } from '../../types';
import { MapPin, Phone } from 'lucide-react';

const Approval: React.FC = () => {
  const { registrations, currentUser, verifyMemberByKorwil, approveMemberFinal, rejectMember } = useApp();
  
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;
  const isPengurus = currentUser?.role === UserRole.ADMIN_PENGURUS;

  const getPendingRegistrations = () => {
     if (isKorwil) {
        return registrations.filter(r => r.status === MemberStatus.PENDING && r.wilayah === currentUser?.wilayah);
     } else if (isPengurus) {
        return registrations.filter(r => r.status === MemberStatus.VERIFIED_KORWIL);
     } else {
        return registrations.filter(r => r.status === MemberStatus.PENDING || r.status === MemberStatus.VERIFIED_KORWIL);
     }
  };

  const filteredRegistrations = getPendingRegistrations();

  return (
    <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
            <h3 className="font-bold text-lg text-neutral-700">Approval Pendaftaran</h3>
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">{filteredRegistrations.length} Menunggu</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100">
                    <tr><th className="px-6 py-4">Nama Pendaftar</th><th className="px-6 py-4">Data Diri</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Tindakan</th></tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                    {filteredRegistrations.map(r => (
                        <tr key={r.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 font-bold text-neutral-800">{r.name}<div className="text-xs text-neutral-400 font-normal">{r.date}</div></td>
                            <td className="px-6 py-4 text-xs space-y-1">
                                <div className="flex items-center gap-2"><MapPin size={12}/> {r.wilayah}</div>
                                <div className="flex items-center gap-2"><Phone size={12}/> {r.phone}</div>
                                <div className="text-neutral-400 truncate max-w-[200px]">{r.address}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {r.status === 'pending' ? 'Menunggu Korwil' : 'Menunggu Pusat'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                {r.status === MemberStatus.PENDING && (isKorwil || isSuperAdmin) && (
                                    <button onClick={() => verifyMemberByKorwil(r.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 mr-2 shadow-sm">Verifikasi</button>
                                )}
                                {r.status === MemberStatus.VERIFIED_KORWIL && (isPengurus || isSuperAdmin) && (
                                    <button onClick={() => approveMemberFinal(r.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 mr-2 shadow-sm">Terbitkan NIA</button>
                                )}
                                <button onClick={() => rejectMember(r.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded text-xs font-bold transition">Tolak</button>
                            </td>
                        </tr>
                    ))}
                    {filteredRegistrations.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Tidak ada pendaftaran baru.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Approval;
