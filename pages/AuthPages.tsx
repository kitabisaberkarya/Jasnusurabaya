// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { RegistrationInput, UserRole } from '../types';
import { KORWIL_LIST } from '../constants';
import { User, ShieldCheck, Users, Lock, Loader2 } from 'lucide-react';

type LoginTab = 'member' | 'staff' | 'super';

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LoginTab>('member');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptLogin(identifier, password);
  };

  const attemptLogin = async (id: string, pass: string) => {
    setLoading(true);
    setError('');
    
    // Attempt login
    const user = await login(id, pass);
    
    if (user) {
      // Role Validation based on Active Tab (Case Insensitive)
      // Normalisasi role ke lowercase untuk menghindari error jika di DB tertulis 'Admin' bukan 'admin'
      const role = (user.role || '').toLowerCase();
      
      const isSuper = role === UserRole.SUPER_ADMIN;
      const isStaff = role === UserRole.ADMIN_KORWIL || role === UserRole.ADMIN_PENGURUS;
      
      // Smart Redirect Logic
      if (isSuper || isStaff) {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } else {
      // Custom error message based on tab
      if (activeTab === 'member') setError('NIA atau Password salah.');
      else setError('Email atau Password salah.');
      
      setLoading(false);
    }
  };

  // Dynamic UI Text based on Tab
  const getInputLabel = () => {
    switch (activeTab) {
      case 'member': return 'Nomor Induk Anggota (NIA)';
      case 'staff': return 'Email Pengurus / Korwil';
      case 'super': return 'Email Super Admin';
      default: return 'Identifier';
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'member': return 'Contoh: JSN-2024-xxx';
      case 'staff': return 'nama@jsn-surabaya.com';
      case 'super': return 'admin.master@jsn.com';
      default: return '...';
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 pattern-bg relative">
      <div className="absolute inset-0 bg-primary-900/90 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-primary-900">Selamat Datang</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Silakan pilih jenis akun Anda untuk masuk
          </p>
        </div>

        {/* Custom Tab Selector */}
        <div className="bg-neutral-100 p-1.5 rounded-xl flex relative">
           {/* Animated Background Pill */}
           <motion.div 
             className="absolute top-1.5 bottom-1.5 bg-white rounded-lg shadow-sm z-0"
             initial={false}
             animate={{
               left: activeTab === 'member' ? '6px' : activeTab === 'staff' ? '33.3%' : '66.6%',
               width: '32%' // slightly less than 33% for spacing
             }}
             transition={{ type: "spring", stiffness: 300, damping: 30 }}
           />

           <button 
             onClick={() => { setActiveTab('member'); setError(''); }}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg relative z-10 transition-colors ${activeTab === 'member' ? 'text-primary-800' : 'text-neutral-500 hover:text-neutral-700'}`}
           >
             <Users size={14} /> Anggota
           </button>
           <button 
             onClick={() => { setActiveTab('staff'); setError(''); }}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg relative z-10 transition-colors ${activeTab === 'staff' ? 'text-secondary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
           >
             <ShieldCheck size={14} /> Pengurus
           </button>
           <button 
             onClick={() => { setActiveTab('super'); setError(''); }}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg relative z-10 transition-colors ${activeTab === 'super' ? 'text-red-600' : 'text-neutral-500 hover:text-neutral-700'}`}
           >
             <Lock size={14} /> Master
           </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl text-center border border-red-100 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> {error}
            </motion.div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5 ml-1">{getInputLabel()}</label>
              <div className="relative">
                 <input
                  type="text"
                  required
                  className="appearance-none rounded-xl block w-full px-4 py-3.5 border border-neutral-200 placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
                  placeholder={getPlaceholder()}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3.5 border border-neutral-200 placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5
                ${activeTab === 'super' 
                    ? 'bg-neutral-800 hover:bg-neutral-900 shadow-neutral-900/20' 
                    : activeTab === 'staff'
                    ? 'bg-secondary-600 hover:bg-secondary-700 shadow-secondary-600/20'
                    : 'bg-primary-700 hover:bg-primary-800 shadow-primary-700/20'
                }
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </div>
          
          {activeTab === 'member' && (
             <div className="text-center pt-2">
                <p className="text-xs text-neutral-500">
                   Belum punya akun? <a href="#/register" className="font-bold text-primary-700 hover:underline">Daftar Anggota Baru</a>
                </p>
             </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export const Register: React.FC = () => {
  const { register, korwils } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationInput>({
    name: '', nik: '', email: '', phone: '', address: '', wilayah: '', password: ''
  });
  const [isCustomWilayah, setIsCustomWilayah] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWilayahSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Lainnya') {
      setIsCustomWilayah(true);
      setFormData(prev => ({ ...prev, wilayah: '' })); // Reset value to allow manual input
    } else {
      setIsCustomWilayah(false);
      setFormData(prev => ({ ...prev, wilayah: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call register logic which now returns a Promise<boolean>
    const success = await register(formData);
    
    setIsSubmitting(false);

    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    // If failed, toast is already handled in Context
  };

  // Use korwils from DB if available, otherwise fallback to static list
  const displayKorwils = korwils.length > 0 ? korwils : KORWIL_LIST.map((k, i) => ({ id: i, name: k }));

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-primary-800 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-neutral-600">Data Anda telah kami terima dan sedang dalam proses verifikasi admin. Mohon tunggu konfirmasi selanjutnya.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary-900 px-8 py-6">
            <h1 className="text-2xl font-serif font-bold text-white">Formulir Pendaftaran Anggota</h1>
            <p className="text-primary-200 text-sm mt-1">Isi data diri dengan benar sesuai KTP.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
                <input type="text" name="name" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">NIK</label>
                <input type="text" name="nik" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} placeholder="16 digit angka" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input type="email" name="email" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">No. HP (WhatsApp)</label>
                <input type="text" name="phone" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Alamat Lengkap</label>
                <input type="text" name="address" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Wilayah / Korwil</label>
                <select 
                  name="wilayah_select" 
                  required={!isCustomWilayah} 
                  className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" 
                  onChange={handleWilayahSelect}
                  defaultValue=""
                >
                  <option value="">Pilih Korwil (Kecamatan)</option>
                  {displayKorwils.map((korwil) => (
                    <option key={korwil.name} value={korwil.name}>{korwil.name}</option>
                  ))}
                  <option value="Lainnya" className="font-bold text-secondary-600 bg-secondary-50">+ Lainnya (Isi Manual)</option>
                </select>
                
                {isCustomWilayah && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <label className="block text-xs font-bold text-secondary-600 mb-1">Tulis Nama Wilayah / Korwil:</label>
                    <input 
                      type="text" 
                      name="wilayah" 
                      placeholder="Contoh: Luar Surabaya / Korwil Baru"
                      required={isCustomWilayah}
                      value={formData.wilayah}
                      className="w-full rounded-lg border-secondary-300 border-2 px-3 py-2 focus:ring-secondary-500 focus:border-secondary-500 bg-secondary-50/30" 
                      onChange={handleChange} 
                    />
                  </motion.div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Buat Password</label>
                <input type="password" name="password" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} />
              </div>
            </div>
            
            <div className="pt-6 border-t border-neutral-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`px-8 py-3 bg-secondary-600 text-white font-medium rounded-xl hover:bg-secondary-700 transition shadow-lg shadow-secondary-600/20 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                {isSubmitting ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};