
// @ts-nocheck
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User, MemberStatus } from '../../types';
import { Search, RefreshCw, Edit3, Key, Trash2, X, CheckSquare, Square, Trash } from 'lucide-react';

const DataAnggota: React.FC = () => {
  const { users, currentUser, updateMember, resetMemberPassword, deleteMember, deleteMembersBulk, isLoading, korwils } = useApp();
  const [memberSearch, setMemberSearch] = useState('');
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editMemberForm, setEditMemberForm] = useState({ name: '', nik: '', email: '', phone: '', address: '', wilayah: '', role: '' });
  const [deleteMemberData, setDeleteMemberData] = useState<{id: number, name: string} | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  
  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isKorwil = currentUser?.role === UserRole.ADMIN_KORWIL;

  // Filter users based on search and role constraints
  const filteredUsers = users.filter(u => {
      if (isKorwil) return u.wilayah === currentUser?.wilayah && u.role === UserRole.MEMBER;
      return true; 
  }).filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()));

  // Filter out admins from being selectable for bulk operations
  // We only allow selecting members, pengurus, korwil (but not Super Admin)
  // Or simpler: filter out Super Admins from selection logic
  const selectableUsers = filteredUsers.filter(u => u.role !== UserRole.SUPER_ADMIN);

  const handleEditMember = (member: User) => {
    setEditingMember(member);
    setEditMemberForm({ name: member.name, nik: member.nik || '', email: member.email, phone: member.phone || '', address: member.address || '', wilayah: member.wilayah || '', role: member.role || 'member' });
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
        const updateData: any = { ...editMemberForm };
        if (updateData.role === 'pengurus' && !updateData.wilayah) { updateData.wilayah = 'Pusat'; }
        updateMember(editingMember.id, updateData);
        setEditingMember(null);
    }
  };

  const handleDeleteMember = (id: number, name: string) => setDeleteMemberData({ id, name });
  
  const confirmDeleteMember = async () => { 
      if (deleteMemberData) { 
          setIsDeletingMember(true); 
          await deleteMember(deleteMemberData.id); 
          setIsDeletingMember(false); 
          setDeleteMemberData(null); 
          // Remove from selection if exists
          setSelectedIds(prev => prev.filter(id => id !== deleteMemberData.id));
      } 
  };

  // --- Bulk Actions Handlers ---

  const handleSelectAll = () => {
      if (selectedIds.length === selectableUsers.length) {
          setSelectedIds([]); // Deselect All
      } else {
          setSelectedIds(selectableUsers.map(u => u.id)); // Select All Visible & Selectable
      }
  };

  const handleSelectOne = (id: number) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(prev => prev.filter(sid => sid !== id));
      } else {
          setSelectedIds(prev => [...prev, id]);
      }
  };

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return;
      if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} anggota terpilih secara permanen?`)) {
          setIsBulkDeleting(true);
          await deleteMembersBulk(selectedIds);
          setIsBulkDeleting(false);
          setSelectedIds([]);
      }
  };

  return (
    <>
        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-center bg-neutral-50 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <input type="text" placeholder="Cari anggota..." className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:border-primary-500 outline-none" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                        <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                    </div>
                    {isKorwil && <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold border border-blue-100 whitespace-nowrap">Wilayah: {currentUser?.wilayah}</span>}
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-200 px-3 py-1 rounded-full">Total: {filteredUsers.length} Data</span>
                </div>

                {/* Bulk Delete Action Button */}
                {selectedIds.length > 0 && (
                    <button 
                        onClick={handleBulkDelete}
                        disabled={isBulkDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 shadow-md flex items-center gap-2 animate-bounce-in transition-all"
                    >
                        {isBulkDeleting ? <RefreshCw className="animate-spin" size={14}/> : <Trash size={14}/>}
                        Hapus {selectedIds.length} Terpilih
                    </button>
                )}
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white text-neutral-500 text-xs uppercase font-bold border-b border-neutral-100">
                        <tr>
                            <th className="px-4 py-4 w-10 text-center">
                                <button onClick={handleSelectAll} className="text-neutral-400 hover:text-primary-600 transition">
                                    {selectableUsers.length > 0 && selectedIds.length === selectableUsers.length ? <CheckSquare size={18} className="text-primary-600"/> : <Square size={18}/>}
                                </button>
                            </th>
                            <th className="px-6 py-4">Nama</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Wilayah</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400"><RefreshCw className="animate-spin mx-auto mb-2"/>Memuat data anggota...</td></tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(u => {
                                const isSelectable = u.role !== UserRole.SUPER_ADMIN;
                                const isSelected = selectedIds.includes(u.id);
                                return (
                                    <tr key={u.id} className={`transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}>
                                        <td className="px-4 py-4 text-center">
                                            {isSelectable && (
                                                <button onClick={() => handleSelectOne(u.id)} className="text-neutral-300 hover:text-primary-600 transition">
                                                    {isSelected ? <CheckSquare size={18} className="text-primary-600"/> : <Square size={18}/>}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-neutral-800">
                                            {u.name}
                                            <div className="text-xs text-neutral-400 font-mono font-normal">{u.nia}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                u.role === 'admin' ? 'bg-neutral-800 text-white' : 
                                                u.role === 'korwil' ? 'bg-blue-100 text-blue-700' :
                                                u.role === 'pengurus' ? 'bg-secondary-100 text-secondary-700' :
                                                'bg-neutral-100 text-neutral-600'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">{u.wilayah}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleEditMember(u)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit3 size={16}/></button>
                                            <button onClick={() => resetMemberPassword(u.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Reset Password"><Key size={16}/></button>
                                            {u.role !== UserRole.SUPER_ADMIN && (
                                                <button onClick={() => handleDeleteMember(u.id, u.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={16}/></button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">Belum ada data anggota.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Edit Modal */}
        {editingMember && (
            <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"><div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50"><h3 className="font-bold text-lg">Edit Data Anggota</h3><button onClick={() => setEditingMember(null)}><X size={20}/></button></div><form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4">{isSuperAdmin && (<div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4"><label className="block text-xs uppercase font-bold text-amber-700 mb-2">Role / Hak Akses</label><select className="w-full border-2 border-amber-200 rounded-lg p-2 font-bold text-neutral-800 focus:border-amber-500 outline-none" value={editMemberForm.role} onChange={e => setEditMemberForm({...editMemberForm, role: e.target.value})}><option value="member">Member (Anggota Biasa)</option><option value="korwil">Admin Korwil</option><option value="pengurus">Pengurus Pusat</option><option value="admin">Super Admin</option></select></div>)}<div><label className="text-xs font-bold text-neutral-500">Nama Lengkap</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.name} onChange={e => setEditMemberForm({...editMemberForm, name: e.target.value})} required /></div><div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-neutral-500">NIK</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.nik} onChange={e => setEditMemberForm({...editMemberForm, nik: e.target.value})} /></div><div><label className="text-xs font-bold text-neutral-500">No. HP</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.phone} onChange={e => setEditMemberForm({...editMemberForm, phone: e.target.value})} /></div></div><div><label className="text-xs font-bold text-neutral-500">Alamat</label><input type="text" className="w-full border rounded-lg p-2" value={editMemberForm.address} onChange={e => setEditMemberForm({...editMemberForm, address: e.target.value})} /></div><div><label className="text-xs font-bold text-neutral-500">Wilayah</label><select className="w-full border rounded-lg p-2" value={editMemberForm.wilayah} onChange={e => setEditMemberForm({...editMemberForm, wilayah: e.target.value})}>{korwils.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}<option value="Pusat">Pusat</option></select></div><div className="flex justify-end pt-4 border-t border-neutral-100"><button type="submit" className="bg-primary-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-800 shadow-lg">Simpan Perubahan</button></div></form></div></div>
        )}

        {/* Delete Confirmation */}
        {deleteMemberData && (
            <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl max-w-sm w-full"><h3 className="font-bold text-lg mb-2">Hapus Anggota?</h3><p className="text-neutral-500 mb-6">Tindakan ini akan menghapus anggota "{deleteMemberData.name}" dan riwayat absensinya.</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteMemberData(null)} className="px-4 py-2 rounded-lg bg-neutral-100 font-bold">Batal</button><button onClick={confirmDeleteMember} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">{isDeletingMember ? 'Menghapus...' : 'Ya, Hapus'}</button></div></div></div>
        )}
    </>
  );
};

export default DataAnggota;
