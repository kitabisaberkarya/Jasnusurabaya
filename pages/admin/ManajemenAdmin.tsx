
// @ts-nocheck
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ShieldCheck, Trash2 } from 'lucide-react';

const ManajemenAdmin: React.FC = () => {
  const { users, currentUser, createAdminUser, deleteMember, korwils, showToast } = useApp();
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', role: 'korwil', wilayah: '', password: '' });
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  const handleCreateAdmin = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAdminForm.password.length < 6) { showToast("Password minimal 6 karakter", "error"); return; }
      createAdminUser(newAdminForm.name, newAdminForm.email, newAdminForm.role as UserRole, newAdminForm.wilayah, newAdminForm.password);
      setNewAdminForm({ name: '', email: '', role: 'korwil', wilayah: '', password: '' });
  };

  const handleDeleteAdmin = async (id: number) => {
      if (window.confirm("Hapus admin ini?")) {
          deleteMember(id);
      }
  };

  if (!isSuperAdmin) return <div>Access Denied</div>;

  return (
    <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg text-primary-900 mb-6 flex items-center gap-2"><ShieldCheck size={20}/> Tambah Admin Baru</h3>
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nama Admin" className="border rounded-lg p-3" value={newAdminForm.name} onChange={e => setNewAdminForm({...newAdminForm, name: e.target.value})} required />
                <input type="email" placeholder="Email Login" className="border rounded-lg p-3" value={newAdminForm.email} onChange={e => setNewAdminForm({...newAdminForm, email: e.target.value})} required />
                <select className="border rounded-lg p-3" value={newAdminForm.role} onChange={e => setNewAdminForm({...newAdminForm, role: e.target.value})}>
                    <option value="korwil">Admin Korwil</option>
                    <option value="pengurus">Pengurus Pusat</option>
                    <option value="admin">Super Admin</option>
                </select>
                <select className="border rounded-lg p-3" value={newAdminForm.wilayah} onChange={e => setNewAdminForm({...newAdminForm, wilayah: e.target.value})} required={newAdminForm.role === 'korwil'}>
                    <option value="">Pilih Wilayah (Wajib untuk Korwil)</option>
                    {korwils.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                    <option value="Pusat">Pusat</option>
                </select>
                <input type="password" placeholder="Password (Min. 6 Karakter)" className="border rounded-lg p-3" value={newAdminForm.password} onChange={e => setNewAdminForm({...newAdminForm, password: e.target.value})} required />
                <button type="submit" className="bg-primary-900 text-white font-bold rounded-lg p-3 hover:bg-primary-800 shadow-lg">Buat Akun Admin</button>
            </form>
        </div>
        
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <h3 className="px-6 py-4 font-bold border-b border-neutral-100 bg-neutral-50">Daftar Admin Sistem</h3>
            <table className="w-full text-left">
                <thead className="text-xs uppercase text-neutral-500 font-bold border-b border-neutral-100"><tr><th className="px-6 py-3">Nama</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Wilayah</th><th className="px-6 py-3 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-neutral-50">
                    {users.filter(u => u.role !== 'member').map(admin => (
                        <tr key={admin.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4 font-bold text-neutral-800">{admin.name}<div className="text-xs text-neutral-400 font-normal">{admin.email}</div></td>
                            <td className="px-6 py-4"><span className="bg-neutral-100 px-2 py-1 rounded text-xs font-bold uppercase text-neutral-600">{admin.role}</span></td>
                            <td className="px-6 py-4 text-sm text-neutral-600">{admin.wilayah}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ManajemenAdmin;
