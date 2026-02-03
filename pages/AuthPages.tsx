
// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { RegistrationInput, UserRole } from '../types';
import { KORWIL_LIST } from '../constants';

export const Login: React.FC = () => {
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
    const user = await login(id, pass);
    
    if (user) {
      // Check for any admin role to redirect to dashboard
      if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN_KORWIL || user.role === UserRole.ADMIN_PENGURUS) {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } else {
      setError('NIA/Email atau Password salah.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 pattern-bg relative">
      <div className="absolute inset-0 bg-primary-900/90 z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold text-primary-900">Selamat Datang</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Masuk untuk mengakses layanan anggota
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">NIA atau Email</label>
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Contoh: JSN-2024-001"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white ${loading ? 'bg-neutral-400' : 'bg-primary-700 hover:bg-primary-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition shadow-lg shadow-primary-700/20`}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData);
    setSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 3000);
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
                <input type="text" name="nik" required className="w-full rounded-lg border-neutral-300 border px-3 py-2 focus:ring-primary-500 focus:border-primary-500" onChange={handleChange} />
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
              <button type="submit" className="px-8 py-3 bg-secondary-600 text-white font-medium rounded-xl hover:bg-secondary-700 transition shadow-lg shadow-secondary-600/20">
                Kirim Pendaftaran
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
