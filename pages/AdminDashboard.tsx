
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, MemberStatus } from '../types';
import { 
  Users, Calendar, FileText, Settings, LayoutDashboard, 
  CheckCircle, XCircle, Trash2, Edit, Plus, Save, 
  Download, Upload, RefreshCw, Search, ChevronDown, 
  Menu, X, LogOut, Shield, MapPin, Info, Database,
  Image as ImageIcon, PlayCircle
} from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';

export const AdminDashboard: React.FC = () => {
    const { 
        currentUser, users, registrations, attendanceSessions, attendanceRecords,
        verifyMemberByKorwil, approveMemberFinal, rejectMember, deleteMember,
        createSession, updateSession, deleteSession, toggleSession,
        profilePages, updateProfilePage,
        korwils, addKorwil, deleteKorwil,
        uploadFile, showToast
    } = useApp();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Profile Tab State
    const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
    const [profileTitle, setProfileTitle] = useState('');
    const [profileContent, setProfileContent] = useState('');
    const [newKorwilName, setNewKorwilName] = useState('');

    const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

    // Sync Profile Data when slug changes
    useEffect(() => {
        const page = profilePages.find(p => p.slug === selectedProfileSlug);
        if (page) {
            setProfileTitle(page.title);
            setProfileContent(page.content);
        } else {
            setProfileTitle('');
            setProfileContent('');
        }
    }, [selectedProfileSlug, profilePages]);

    const handleProfileSave = () => {
        if (!profileTitle) return showToast("Judul tidak boleh kosong", "error");
        updateProfilePage(selectedProfileSlug, profileTitle, profileContent);
    };

    const handleEditorImageUpload = async (file: File) => {
        return await uploadFile(file, 'profile-content');
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-neutral-100 flex font-sans">
             {/* Mobile Sidebar Overlay */}
             {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
             )}

             {/* Sidebar */}
             <div className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-neutral-200 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                    <h2 className="font-serif font-bold text-xl text-primary-900">Admin Panel</h2>
                    <button className="md:hidden text-neutral-500" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                        <Users size={20} /> Anggota & Approval
                    </button>
                    <button onClick={() => { setActiveTab('attendance'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'attendance' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                        <Calendar size={20} /> Absensi & Sesi
                    </button>
                    
                    {isSuperAdmin && (
                        <>
                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Content Management</div>
                        <button onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                            <FileText size={20} /> Profil & Halaman
                        </button>
                        </>
                    )}
                </nav>
                <div className="p-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50">
                        <div className="w-8 h-8 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-xs">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-neutral-900 truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-neutral-500 uppercase">{currentUser.role}</p>
                        </div>
                    </div>
                </div>
             </div>

             {/* Main Content */}
             <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-4 md:px-8">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-neutral-600">
                        <Menu size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-neutral-800 capitalize">{activeTab}</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                                <div className="text-neutral-500 text-sm font-medium mb-1">Total Anggota</div>
                                <div className="text-3xl font-bold text-primary-900">{users.length}</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                                <div className="text-neutral-500 text-sm font-medium mb-1">Menunggu Verifikasi</div>
                                <div className="text-3xl font-bold text-amber-500">{registrations.filter(r => r.status === MemberStatus.PENDING).length}</div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                                <div className="text-neutral-500 text-sm font-medium mb-1">Sesi Absensi Aktif</div>
                                <div className="text-3xl font-bold text-emerald-500">{attendanceSessions.filter(s => s.isOpen).length}</div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB (Simple Placeholder Implementation) */}
                    {activeTab === 'users' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            <div className="p-6 border-b border-neutral-200">
                                <h3 className="font-bold text-lg">Daftar Pendaftaran Baru</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Nama</th>
                                            <th className="px-6 py-4">Wilayah</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {registrations.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">Tidak ada pendaftaran baru.</td>
                                            </tr>
                                        ) : registrations.map(reg => (
                                            <tr key={reg.id}>
                                                <td className="px-6 py-4 font-medium">{reg.name}</td>
                                                <td className="px-6 py-4">{reg.wilayah}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${reg.status === MemberStatus.PENDING ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {reg.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    {reg.status === MemberStatus.PENDING && (
                                                        <button onClick={() => verifyMemberByKorwil(reg.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700">
                                                            Verif Korwil
                                                        </button>
                                                    )}
                                                    {reg.status === MemberStatus.VERIFIED_KORWIL && isSuperAdmin && (
                                                        <button onClick={() => approveMemberFinal(reg.id)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700">
                                                            Approve
                                                        </button>
                                                    )}
                                                    <button onClick={() => rejectMember(reg.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200">
                                                        Tolak
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ATTENDANCE TAB (Simple Placeholder) */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Sesi Absensi</h3>
                                <button onClick={() => createSession('Sesi Baru ' + new Date().toLocaleDateString())} className="bg-primary-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                    <Plus size={16} /> Buat Sesi Baru
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {attendanceSessions.map(session => (
                                    <div key={session.id} className="bg-white p-4 rounded-xl border border-neutral-200 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold">{session.name}</h4>
                                            <p className="text-xs text-neutral-500">{session.date} • {session.attendees.length} Hadir</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleSession(session.id)} className={`px-3 py-1 rounded-lg text-xs font-bold ${session.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                                {session.isOpen ? 'Terbuka' : 'Tertutup'}
                                            </button>
                                            <button onClick={() => deleteSession(session.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB (Fixing the errors here) */}
                    {activeTab === 'profile' && isSuperAdmin && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1 space-y-2">
                                {['sejarah', 'pengurus', 'korwil', 'amaliyah', 'tentang-kami'].map(slug => (
                                    <button key={slug} onClick={() => setSelectedProfileSlug(slug)} className={`w-full text-left px-4 py-3 rounded-xl font-bold capitalize transition ${selectedProfileSlug === slug ? 'bg-primary-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}>
                                        {slug.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg">Edit Halaman: {selectedProfileSlug.toUpperCase()}</h3>
                                    <button onClick={handleProfileSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
                                        <Save size={16}/> Simpan
                                    </button>
                                </div>
                                <input type="text" placeholder="Judul Halaman" className="w-full border rounded-lg p-3 mb-4 font-bold text-lg" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} />
                                {selectedProfileSlug === 'korwil' && (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4 flex gap-3 items-start">
                                        <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5"><Info size={16}/></div>
                                        <div>
                                            <p className="text-sm text-blue-800 font-bold">Info Halaman Korwil</p>
                                            <p className="text-xs text-blue-600 mt-1">
                                                Konten di bawah ini adalah teks pengantar. Daftar nama Korwil akan dimunculkan secara otomatis di bawah teks ini pada halaman publik (mengambil dari database).
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <RichTextEditor 
                                    value={profileContent} 
                                    onChange={setProfileContent}
                                    placeholder="Tulis konten profil di sini..."
                                    onUpload={(file) => handleEditorImageUpload(file)}
                                />
                                <p className="text-xs text-neutral-400 mt-2">* Gunakan format HTML sederhana. Paste dari Word mungkin perlu perapian.</p>

                                {/* LIVE PREVIEW & QUICK MANAGE SECTION FOR KORWIL */}
                                {selectedProfileSlug === 'korwil' && (
                                    <div className="mt-8 border-t border-neutral-200 pt-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <h4 className="font-bold text-neutral-800 flex items-center gap-2">
                                                <Database size={18} className="text-secondary-500"/> Data Live Wilayah
                                            </h4>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <input
                                                    type="text"
                                                    placeholder="Nama Wilayah Baru..."
                                                    className="flex-1 md:w-64 border rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none"
                                                    value={newKorwilName}
                                                    onChange={e => setNewKorwilName(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => { if(newKorwilName) { addKorwil(newKorwilName); setNewKorwilName(''); } }}
                                                    className="bg-primary-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-800 transition flex items-center gap-1 shadow-sm"
                                                >
                                                    <Plus size={16} /> Tambah
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                                            {korwils.length > 0 ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {korwils.map((k, i) => (
                                                        <div key={k.id} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-neutral-200 text-xs shadow-sm group hover:border-primary-200 transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="bg-primary-100 text-primary-700 min-w-[20px] h-5 flex items-center justify-center rounded-full font-bold text-[10px]">{i + 1}</span>
                                                                <span className="truncate font-medium text-neutral-700">{k.name}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => deleteKorwil(k.id)}
                                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition opacity-0 group-hover:opacity-100"
                                                                title="Hapus Wilayah"
                                                            >
                                                                <X size={14}/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-neutral-400 italic mb-2">Belum ada data wilayah tersimpan.</p>
                                                    <p className="text-xs text-neutral-300">Silakan tambahkan menggunakan form di atas.</p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-2 text-right">* Data ini tersinkronisasi dengan Menu Data Wilayah & Formulir Pendaftaran.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
             </div>
        </div>
    );
};
