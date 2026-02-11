
// @ts-nocheck
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DETAILED_KORWIL_DATA } from '../../constants';
import { supabase } from '../../lib/supabase';
import { Korwil } from '../../types';
import { Plus, Save, Map, Edit3, Trash2, Check, X, RefreshCw, Database } from 'lucide-react';

const DataWilayah: React.FC = () => {
  const { korwils, addKorwil, updateKorwil, deleteKorwil, showToast, refreshData } = useApp();
  const [newKorwilName, setNewKorwilName] = useState('');
  const [editingKorwilId, setEditingKorwilId] = useState<number | null>(null);
  const [editingKorwilData, setEditingKorwilData] = useState<Partial<Korwil>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleEditKorwil = (k: Korwil) => {
    setEditingKorwilId(k.id);
    setEditingKorwilData({ 
        name: k.name, 
        coordinatorName: k.coordinatorName || '', 
        contact: k.contact || '' 
    });
  };

  const handleSaveKorwil = (id: number) => {
    updateKorwil(id, editingKorwilData);
    setEditingKorwilId(null);
    setEditingKorwilData({});
  };

  const handleSeedKorwils = async () => {
    if (!window.confirm("Akan mengisi database wilayah dengan data default. Lanjutkan?")) return;
    setIsUploading(true);
    try {
        const { error } = await supabase.from('korwils').upsert(
            DETAILED_KORWIL_DATA.map(k => ({
                name: k.name,
                coordinator_name: k.coordinatorName,
                contact: k.contact
            })),
            { onConflict: 'name' }
        );
        
        if (error) throw error;
        
        refreshData();
        showToast("Data Korwil berhasil di-reset ke default", "success");
    } catch (e) {
        console.error(e);
        showToast("Gagal mengisi data", "error");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
        {/* FORM INPUT KORWIL BARU */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm group hover:shadow-md transition-shadow duration-300">
            <h3 className="font-bold text-lg text-primary-900 mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Plus size={20} className="text-emerald-600"/> Tambah Wilayah Baru
            </h3>
            <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-1">
                    <label className="block text-xs font-bold text-neutral-500 uppercase">Nama Korwil / Kecamatan</label>
                    <input 
                        type="text" 
                        placeholder="Contoh: Rungkut Kidul, Wonorejo" 
                        className="w-full border border-neutral-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" 
                        value={newKorwilName} 
                        onChange={e => setNewKorwilName(e.target.value)} 
                    />
                </div>
                <button 
                    onClick={() => { if(newKorwilName) { addKorwil(newKorwilName); setNewKorwilName(''); } }} 
                    className="bg-primary-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-800 shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Save size={18} /> Simpan
                </button>
            </div>
        </div>

        {/* TABLE DATA KORWIL */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-primary-900 border-b border-primary-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white flex items-center gap-2 font-serif">
                    Daftar Koordinator Wilayah
                </h3>
                {korwils.length === 0 && (
                    <button onClick={handleSeedKorwils} className="bg-secondary-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-secondary-700 flex items-center gap-2 transition">
                        {isUploading ? <RefreshCw className="animate-spin" size={14}/> : <Database size={14}/>}
                        Load Data Default
                    </button>
                )}
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#064e3b] text-white text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-1/3 border-b border-primary-800">WILAYAH / JABATAN</th>
                            <th className="px-6 py-4 w-1/3 border-b border-primary-800">NAMA KOORDINATOR</th>
                            <th className="px-6 py-4 w-1/4 border-b border-primary-800">KONTAK / KETERANGAN</th>
                            <th className="px-6 py-4 text-right border-b border-primary-800">AKSI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {korwils.map((k, index) => (
                            <React.Fragment key={k.id}>
                                {editingKorwilId === k.id ? (
                                    <tr className="bg-amber-50">
                                        <td className="px-6 py-4">
                                            <input type="text" className="w-full border border-amber-300 rounded p-2 text-sm font-bold" value={editingKorwilData.name ?? k.name} onChange={e => setEditingKorwilData({...editingKorwilData, name: e.target.value})} placeholder="Wilayah" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="text" className="w-full border border-amber-300 rounded p-2 text-sm" value={editingKorwilData.coordinatorName ?? (k.coordinatorName || '')} onChange={e => setEditingKorwilData({...editingKorwilData, coordinatorName: e.target.value})} placeholder="Nama Koordinator" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input type="text" className="w-full border border-amber-300 rounded p-2 text-sm" value={editingKorwilData.contact ?? (k.contact || '')} onChange={e => setEditingKorwilData({...editingKorwilData, contact: e.target.value})} placeholder="Kontak" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleSaveKorwil(k.id)} className="bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700" title="Simpan"><Check size={16}/></button>
                                                <button onClick={() => { setEditingKorwilId(null); setEditingKorwilData({}); }} className="bg-neutral-400 text-white p-2 rounded hover:bg-neutral-500" title="Batal"><X size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className={`hover:bg-neutral-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}>
                                        <td className="px-6 py-4 font-bold text-primary-900 text-sm">
                                            {k.name}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-700 text-sm">
                                            {k.coordinatorName || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 text-sm font-mono">
                                            {k.contact || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditKorwil(k)} className="p-2 text-amber-600 hover:bg-amber-50 rounded transition" title="Edit"><Edit3 size={16}/></button>
                                                <button onClick={() => deleteKorwil(k.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Hapus"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {korwils.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-neutral-400 border-dashed border-2 border-neutral-100 rounded-lg m-4">
                                    <Map size={48} className="mx-auto text-neutral-200 mb-2"/>
                                    <p>Belum ada data wilayah. Silakan tambah atau load default.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default DataWilayah;
