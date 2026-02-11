
// @ts-nocheck
import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, RefreshCcw, UploadCloud } from 'lucide-react';
import { BackupData } from '../../types';

const BackupRestore: React.FC = () => {
  const { downloadBackup, restoreData, showToast } = useApp();
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (!window.confirm("PERINGATAN: Restore akan menimpa/menambah data yang ada di database. Apakah Anda yakin ingin melanjutkan?")) { e.target.value = ''; return; }
        setIsRestoring(true);
        try {
            const text = await file.text();
            const jsonData = JSON.parse(text) as BackupData;
            if (!jsonData.version || !jsonData.data) { throw new Error("Format file backup tidak valid"); }
            const success = await restoreData(jsonData);
            if (success) { showToast("Database berhasil direstore!", "success"); }
        } catch (error) { console.error(error); showToast("Gagal membaca file backup", "error"); } finally { setIsRestoring(false); e.target.value = ''; }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download size={40} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-2">Backup Database</h3>
            <p className="text-neutral-500 mb-8">Unduh seluruh data sistem dalam format JSON aman.</p>
            <button onClick={downloadBackup} className="bg-primary-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-800 shadow-lg flex items-center justify-center gap-2 mx-auto w-full max-w-xs transition transform hover:-translate-y-1">
                <Download size={20} /> Download Backup
            </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCcw size={40} />
            </div>
            <h3 className="text-2xl font-bold text-neutral-800 mb-2">Restore Database</h3>
            <p className="text-neutral-500 mb-8">Pulihkan data dari file backup JSON sebelumnya.</p>
            <div className="relative w-full max-w-xs mx-auto">
                <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef}
                    onChange={handleRestoreFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <button className={`bg-amber-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-amber-600 shadow-lg flex items-center justify-center gap-2 w-full transition transform hover:-translate-y-1 ${isRestoring ? 'opacity-70' : ''}`}>
                    {isRestoring ? <RefreshCcw className="animate-spin" size={20}/> : <UploadCloud size={20} />} 
                    {isRestoring ? 'Memulihkan...' : 'Pilih File Backup'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default BackupRestore;
