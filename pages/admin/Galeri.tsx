
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, RefreshCcw, UploadCloud, Edit3 } from 'lucide-react';

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

const Galeri: React.FC = () => {
  const { gallery, addGalleryItem, deleteGalleryItem, uploadFile, showToast } = useApp();
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const [galleryFile, setGalleryFile] = useState<File | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  const handleGallerySubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!galleryFile && !galleryForm.imageUrl) { showToast("Pilih foto atau masukkan URL", "error"); return; }
      setIsUploading(true);
      try {
          let finalUrl = galleryForm.imageUrl;
          if (galleryFile) {
              const uploadedUrl = await uploadFile(galleryFile, 'gallery');
              if (uploadedUrl) finalUrl = uploadedUrl;
          }
          if(finalUrl) {
              addGalleryItem({ type: 'image', url: finalUrl, caption: galleryForm.caption });
              setGalleryForm({ imageUrl: '', caption: '' });
              setGalleryFile(null);
          }
      } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };

  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-6">
            <h3 className="font-bold text-neutral-800 mb-4">Tambah Foto Galeri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FileUploader 
                        label="Upload Foto Galeri" 
                        currentImage="" 
                        onFileSelect={(file) => setGalleryFile(file)} 
                        hint="Format: JPG/PNG/WEBP. Resolusi HD disarankan. Max 5MB."
                    />
                </div>
                <div className="flex flex-col justify-end space-y-4">
                    <input type="text" placeholder="Caption / Keterangan" className="w-full border rounded-lg p-3" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} />
                    <button onClick={handleGallerySubmit} disabled={isUploading} className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-700 hover:bg-primary-800'}`}>{isUploading ? <><RefreshCcw className="animate-spin" size={16}/> Mengupload...</> : 'Tambah ke Galeri'}</button>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map(item => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden border border-neutral-200">
                    <img src={item.url} alt={item.caption} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button onClick={() => deleteGalleryItem(item.id)} className="bg-red-600 text-white p-2 rounded-full"><Trash2 size={16}/></button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-xs font-bold truncate">{item.caption || 'Tanpa Caption'}</div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default Galeri;
