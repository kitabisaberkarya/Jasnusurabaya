
// @ts-nocheck
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Youtube, Instagram, Trash2 } from 'lucide-react';

const VideoMedia: React.FC = () => {
  const { mediaPosts, addMediaPost, deleteMediaPost } = useApp();
  const [mediaForm, setMediaForm] = useState({ type: 'youtube' as 'youtube' | 'instagram', url: '', caption: '', embedUrl: '' });

  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-neutral-800 mb-4">Tambah Media (YouTube / Instagram)</h3>
            <div className="flex gap-4 mb-4">
                <button onClick={() => setMediaForm({...mediaForm, type: 'youtube'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${mediaForm.type === 'youtube' ? 'border-red-500 bg-red-50 text-red-600' : 'border-neutral-200 text-neutral-400'}`}><Youtube className="inline mr-2"/> YouTube</button>
                <button onClick={() => setMediaForm({...mediaForm, type: 'instagram'})} className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${mediaForm.type === 'instagram' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-neutral-200 text-neutral-400'}`}><Instagram className="inline mr-2"/> Instagram</button>
            </div>
            <input type="text" placeholder={`Tempel Link ${mediaForm.type === 'youtube' ? 'YouTube' : 'Instagram'} di sini...`} className="w-full border rounded-lg p-3 mb-4" value={mediaForm.url} onChange={e => {
                let embed = e.target.value;
                if (mediaForm.type === 'youtube') {
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = e.target.value.match(regExp);
                    if (match && match[2].length === 11) embed = `https://www.youtube.com/embed/${match[2]}`;
                } else {
                    if (!embed.includes('/embed')) embed = embed.replace(/\/$/, "") + "/embed";
                }
                setMediaForm({...mediaForm, url: e.target.value, embedUrl: embed});
            }} />
            <input type="text" placeholder="Judul / Caption Video" className="w-full border rounded-lg p-3 mb-4" value={mediaForm.caption} onChange={e => setMediaForm({...mediaForm, caption: e.target.value})} />
            <button onClick={() => { if(mediaForm.embedUrl) { addMediaPost(mediaForm); setMediaForm({...mediaForm, url:'', embedUrl:'', caption:''}); } }} className="w-full py-3 bg-primary-900 text-white font-bold rounded-xl hover:bg-primary-800">Simpan Video</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl overflow-hidden border border-neutral-200 relative group">
                    <div className="aspect-video bg-black">
                        <iframe src={post.embedUrl} className="w-full h-full" allowFullScreen></iframe>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-1"><span className={`text-xs font-bold uppercase ${post.type === 'youtube' ? 'text-red-600' : 'text-pink-600'}`}>{post.type}</span></div>
                        <p className="font-bold text-neutral-800 line-clamp-1">{post.caption}</p>
                    </div>
                    <button onClick={() => deleteMediaPost(post.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default VideoMedia;
