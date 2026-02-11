
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Edit3, Plus, Save, CheckCircle2, RefreshCcw, FileText, Trash2, UploadCloud } from 'lucide-react';

const FileUploader = ({ currentImage, onFileSelect, label, hint }: any) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  useEffect(() => { setPreview(currentImage || null); }, [currentImage]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-neutral-500 uppercase">{label}</label>
      <div className="border-2 border-dashed border-neutral-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition cursor-pointer relative overflow-hidden group min-h-[160px]">
        <input type="file" accept="image/*" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer z-20"/>
        {preview ? (
          <div className="relative w-full h-full min-h-[160px] rounded-lg overflow-hidden bg-neutral-100">
             <img src={preview} alt="Preview" className="w-full h-full object-contain" />
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                <span className="text-white font-bold flex items-center gap-2"><Edit3 size={16}/> Ganti Foto</span>
             </div>
          </div>
        ) : (
          <div className="py-8 px-4">
             <UploadCloud className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
             <p className="text-sm text-neutral-500 font-medium mb-1">Klik untuk upload foto</p>
             <p className="text-[10px] text-neutral-400 leading-tight max-w-[200px] mx-auto">{hint || "JPG, PNG, WEBP (Max 2MB)"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Berita: React.FC = () => {
  const { news, addNews, updateNews, deleteNews, uploadFile, showToast } = useApp();
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '' });
  const [newsFile, setNewsFile] = useState<File | null>(null); 
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
        let finalImageUrl = newsForm.imageUrl;
        if (newsFile) {
            const uploadedUrl = await uploadFile(newsFile, 'news');
            if (uploadedUrl) finalImageUrl = uploadedUrl;
        }
        const payload = { ...newsForm, imageUrl: finalImageUrl };
        if (editingNewsId) {
            await updateNews(editingNewsId, payload);
        } else {
            await addNews({ ...payload, date: new Date().toISOString().split('T')[0] });
        }
        setNewsForm({ title: '', excerpt: '', content: '', imageUrl: '' });
        setNewsFile(null);
        setEditingNewsId(null);
    } catch (error) { console.error(error); showToast("Gagal menyimpan berita", "error"); } finally { setIsUploading(false); }
  };

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
    <div className="flex flex-col gap-10">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm group/editor">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-neutral-800 flex items-center gap-2">
                    {editingNewsId ? <Edit3 size={24} className="text-amber-500"/> : <Plus size={24} className="text-primary-600"/>}
                    {editingNewsId ? 'Mode Edit Berita' : 'Tulis Berita Baru'}
                </h3>
                {editingNewsId && (
                        <button type="button" onClick={() => { setEditingNewsId(null); setNewsForm({title:'', excerpt:'', content:'', imageUrl:''}); setNewsFile(null); }} className="text-sm bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg font-bold hover:bg-neutral-200">
                        Batal Edit
                        </button>
                )}
            </div>
            <form onSubmit={handleNewsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Judul Berita</label>
                            <input type="text" placeholder="Masukkan judul berita yang menarik..." className="w-full border border-neutral-300 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} required />
                        </div>
                        <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Ringkasan Singkat</label>
                                <textarea placeholder="Tulis ringkasan singkat untuk tampilan kartu..." className="w-full border border-neutral-300 rounded-xl p-3 text-sm h-24 focus:ring-2 focus:ring-primary-500 outline-none resize-none" value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <FileUploader 
                            label="Foto Sampul (Cover)" 
                            currentImage={newsForm.imageUrl} 
                            onFileSelect={(file) => setNewsFile(file)} 
                            hint="Format: JPG/PNG. Rasio Landscape (16:9). Min. 800x450px. Max 2MB."
                        />
                    </div>
                </div>
                <div className="pt-2">
                    <RichTextEditor 
                        label="Konten Artikel Lengkap" 
                        value={newsForm.content} 
                        onChange={(html) => setNewsForm({...newsForm, content: html})} 
                        placeholder="Mulai menulis artikel lengkap di sini..."
                        onUpload={(file) => handleEditorImageUpload(file)}
                    />
                </div>
                <div className="flex justify-end pt-4 border-t border-neutral-100">
                    <button type="submit" disabled={isUploading} className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition transform active:scale-95 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-700 hover:bg-primary-800'}`}>
                        {isUploading ? (<><RefreshCcw className="animate-spin" size={20} /> Memproses...</>) : (editingNewsId ? <><Save size={20}/> Simpan Perubahan</> : <><CheckCircle2 size={20}/> Terbitkan Berita</>)}
                    </button>
                </div>
            </form>
        </div>
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-neutral-600 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-200 pb-2">
                <FileText size={20}/> Riwayat Berita ({news.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {news.map(n => (
                    <div key={n.id} className={`bg-white border rounded-xl p-4 flex gap-4 hover:shadow-lg transition group ${editingNewsId === n.id ? 'border-amber-400 ring-2 ring-amber-100' : 'border-neutral-200'}`}>
                        <img src={n.imageUrl} className="w-24 h-24 object-cover rounded-lg bg-neutral-100 shadow-sm group-hover:scale-105 transition duration-500" />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-neutral-800 line-clamp-2 leading-tight text-sm mb-1">{n.title}</h3>
                                <p className="text-[10px] text-neutral-500 bg-neutral-50 inline-block px-2 py-0.5 rounded border border-neutral-100">{n.date}</p>
                            </div>
                            <div className="flex gap-2 text-xs mt-3">
                                <button onClick={() => { setNewsForm({ title: n.title, excerpt: n.excerpt, content: n.content, imageUrl: n.imageUrl }); setEditingNewsId(n.id); document.querySelector('.group\\/editor')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 text-center text-amber-600 font-bold bg-amber-50 hover:bg-amber-100 py-1.5 rounded transition flex items-center justify-center gap-1"><Edit3 size={14}/> Edit</button>
                                <button onClick={() => deleteNews(n.id)} className="flex-1 text-center text-red-600 font-bold bg-red-50 hover:bg-red-100 py-1.5 rounded transition flex items-center justify-center gap-1"><Trash2 size={14}/> Hapus</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Berita;
