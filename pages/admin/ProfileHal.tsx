
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Save } from 'lucide-react';

const ProfileHal: React.FC = () => {
  const { profilePages, updateProfilePage, uploadFile, showToast } = useApp();
  const [selectedProfileSlug, setSelectedProfileSlug] = useState('sejarah');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileContent, setProfileContent] = useState('');

  useEffect(() => {
    const page = profilePages.find(p => p.slug === selectedProfileSlug);
    const content = page ? page.content : '';
    setProfileContent(content);
    
    const defaultTitles: Record<string, string> = {
        'sejarah': 'Sejarah Jamiyah', 'pengurus': 'Susunan Pengurus Pusat',
        'korwil': 'Daftar Koordinator Wilayah', 'amaliyah': 'Amaliyah & Wirid Rutin',
        'tentang-kami': 'Membangun Ukhuwah Islamiyah'
    };
    setProfileTitle(page ? page.title : defaultTitles[selectedProfileSlug] || '');
  }, [selectedProfileSlug, profilePages]);

  const handleProfileSave = () => { updateProfilePage(selectedProfileSlug, profileTitle, profileContent); };

  const handleEditorImageUpload = async (file: File) => {
      try {
          const url = await uploadFile(file, 'content_images');
          return url;
      } catch (error) {
          console.error("Editor upload error", error);
          showToast("Gagal upload gambar editor", "error");
          return null;
      }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm min-h-[800px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    {id: 'sejarah', label: 'Sejarah'}, 
                    {id: 'pengurus', label: 'Struktur Pengurus'}, 
                    {id: 'korwil', label: 'Info Korwil'},
                    {id: 'amaliyah', label: 'Amaliyah Rutin'},
                    {id: 'tentang-kami', label: 'Tentang Kami (Home)'}
                ].map(p => (
                    <button key={p.id} onClick={() => setSelectedProfileSlug(p.id)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${selectedProfileSlug === p.id ? 'bg-primary-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p.label}</button>
                ))}
            </div>
            <button onClick={handleProfileSave} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center gap-2"><Save size={18}/> Simpan</button>
        </div>
        <div className="mb-4">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Judul Halaman</label>
            <input type="text" className="w-full border rounded-lg p-3 font-bold text-lg" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} />
        </div>
        <div className="flex-grow">
            <RichTextEditor 
                value={profileContent} 
                onChange={setProfileContent} 
                label="Konten Halaman"
                placeholder="Tulis konten lengkap di sini..."
                onUpload={handleEditorImageUpload}
            />
        </div>
    </div>
  );
};

export default ProfileHal;
