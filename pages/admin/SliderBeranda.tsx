
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, Edit3, UploadCloud } from 'lucide-react';

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

const SliderBeranda: React.FC = () => {
  const { sliders, addSliderItem, deleteSliderItem, uploadFile, showToast } = useApp();
  const [sliderForm, setSliderForm] = useState({ imageUrl: '', title: '', description: '' });
  const [sliderFile, setSliderFile] = useState<File | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  const handleSliderSubmit = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!sliderFile && !sliderForm.imageUrl) { showToast("Pilih gambar slider", "error"); return; }
      setIsUploading(true);
      try {
          let finalUrl = sliderForm.imageUrl;
          if (sliderFile) {
              const uploadedUrl = await uploadFile(sliderFile, 'sliders');
              if (uploadedUrl) finalUrl = uploadedUrl;
          }
          if(finalUrl) {
              addSliderItem({ ...sliderForm, imageUrl: finalUrl });
              setSliderForm({ imageUrl: '', title: '', description: '' });
              setSliderFile(null);
          }
      } catch (error) { console.error(error); } finally { setIsUploading(false); }
  };

  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-6">
            <h3 className="font-bold text-neutral-800 mb-4">Tambah Slider Beranda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FileUploader 
                        label="Upload Gambar Slider" 
                        currentImage="" 
                        onFileSelect={(file) => setSliderFile(file)} 
                        hint="Landscape (16:9). Resolusi tinggi disarankan."
                    />
                </div>
                <div className="flex flex-col space-y-4">
                    <input type="text" placeholder="Judul Utama" className="w-full border rounded-lg p-3" value={sliderForm.title} onChange={e => setSliderForm({...sliderForm, title: e.target.value})} />
                    <textarea placeholder="Deskripsi Singkat" className="w-full border rounded-lg p-3 h-24" value={sliderForm.description} onChange={e => setSliderForm({...sliderForm, description: e.target.value})} />
                    <button onClick={handleSliderSubmit} disabled={isUploading} className={`w-full py-3 rounded-lg font-bold text-white shadow-lg ${isUploading ? 'bg-gray-400' : 'bg-primary-900 hover:bg-primary-800'}`}>{isUploading ? 'Mengupload...' : 'Tambahkan Slider'}</button>
                </div>
            </div>
        </div>
        <div className="space-y-4">
            {sliders.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex h-32 relative group">
                    <img src={item.imageUrl} className="w-48 h-full object-cover" />
                    <div className="p-4 flex-1">
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                    </div>
                    <button onClick={() => deleteSliderItem(item.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default SliderBeranda;
