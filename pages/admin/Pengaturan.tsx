
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Lock, Settings, Stamp, PenTool, Edit3, UploadCloud, Save, RefreshCw } from 'lucide-react';

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

const Pengaturan: React.FC = () => {
  const { currentUser, siteConfig, updateSiteConfig, changePassword, uploadFile, showToast } = useApp();
  const [changePasswordForm, setChangePasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [configForm, setConfigForm] = useState(siteConfig);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    setConfigForm(siteConfig);
  }, [siteConfig]);

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (changePasswordForm.new !== changePasswordForm.confirm) { showToast("Konfirmasi password tidak cocok", "error"); return; }
      if (changePasswordForm.new.length < 6) { showToast("Password minimal 6 karakter", "error"); return; }
      if (!currentUser) return;
      const success = await changePassword(currentUser.id, changePasswordForm.new);
      if (success) setChangePasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleUpdateConfigWithFiles = async () => {
    setIsUploading(true);
    try {
        let finalSignatureUrl = configForm.signatureUrl;
        let finalStampUrl = configForm.stampUrl;

        if (signatureFile) {
            const url = await uploadFile(signatureFile, 'signatures');
            if (url) finalSignatureUrl = url;
        }

        if (stampFile) {
            const url = await uploadFile(stampFile, 'stamps');
            if (url) finalStampUrl = url;
        }

        await updateSiteConfig({
            ...configForm,
            signatureUrl: finalSignatureUrl,
            stampUrl: finalStampUrl
        });
        
        setSignatureFile(null);
        setStampFile(null);
    } catch (e) {
        console.error(e);
        showToast("Gagal menyimpan konfigurasi aset digital", "error");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
        {/* Password Change */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2"><Lock size={20}/> Ganti Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div><label className="block text-xs font-bold text-neutral-500 mb-1">Password Baru</label><input type="password" className="w-full border rounded-lg p-3" value={changePasswordForm.new} onChange={e => setChangePasswordForm({...changePasswordForm, new: e.target.value})} required placeholder="Minimal 6 karakter" /></div>
                <div><label className="block text-xs font-bold text-neutral-500 mb-1">Konfirmasi Password Baru</label><input type="password" className="w-full border rounded-lg p-3" value={changePasswordForm.confirm} onChange={e => setChangePasswordForm({...changePasswordForm, confirm: e.target.value})} required /></div>
                <button type="submit" className="bg-primary-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-800">Simpan Password Baru</button>
            </form>
        </div>
        
        {isSuperAdmin && (
        <>
            {/* General Config */}
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center gap-2"><Settings size={20}/> Konfigurasi Website</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Nama Aplikasi</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.appName} onChange={e => setConfigForm({...configForm, appName: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Nama Organisasi</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.orgName} onChange={e => setConfigForm({...configForm, orgName: e.target.value})} /></div>
                    <div className="col-span-2"><label className="text-xs font-bold text-neutral-500 mb-1 block">Deskripsi</label><textarea className="w-full border rounded-lg p-3" value={configForm.description} onChange={e => setConfigForm({...configForm, description: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Alamat</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.address} onChange={e => setConfigForm({...configForm, address: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Email</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.email} onChange={e => setConfigForm({...configForm, email: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Telepon</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.phone} onChange={e => setConfigForm({...configForm, phone: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-neutral-500 mb-1 block">Logo URL</label><input type="text" className="w-full border rounded-lg p-3" value={configForm.logoUrl} onChange={e => setConfigForm({...configForm, logoUrl: e.target.value})} /></div>
                </div>
                
                {/* NEW: Digital Assets Configuration */}
                <div className="mt-8 pt-6 border-t border-neutral-100">
                    <h4 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2"><Stamp size={20} className="text-amber-600"/> Aset Digital E-KTA</h4>
                    <p className="text-sm text-neutral-500 mb-4">Unggah Tanda Tangan dan Stempel digital (format PNG Transparan) untuk ditampilkan pada Kartu Anggota.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <FileUploader 
                            label="Tanda Tangan Pengurus" 
                            currentImage={configForm.signatureUrl} 
                            onFileSelect={(file) => setSignatureFile(file)} 
                            hint="PNG Transparan. Rasio 2:1."
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <PenTool size={16} className="text-neutral-400"/>
                            <span className="text-xs text-neutral-500">Akan muncul di kolom TTD E-KTA.</span>
                        </div>
                    </div>
                    <div>
                        <FileUploader 
                            label="Stempel Organisasi" 
                            currentImage={configForm.stampUrl} 
                            onFileSelect={(file) => setStampFile(file)} 
                            hint="PNG Transparan. Rasio 1:1."
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <Stamp size={16} className="text-neutral-400"/>
                            <span className="text-xs text-neutral-500">Akan menimpa tanda tangan.</span>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 text-right">
                    <button onClick={handleUpdateConfigWithFiles} disabled={isUploading} className={`bg-primary-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary-800 transition flex items-center justify-center gap-2 ml-auto ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isUploading ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>} 
                        {isUploading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                    </button>
                </div>
            </div>
        </>
        )}
    </div>
  );
};

export default Pengaturan;
