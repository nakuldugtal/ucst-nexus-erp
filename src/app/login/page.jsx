'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaUniversity, FaLock, FaUser } from 'react-icons/fa';
import { fadeUp } from '@/animations/fade';
import { CaptchaField } from '@/components/auth/captcha-field';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedUserId = userId.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUserId || !trimmedPassword) {
      setError('Enter your User ID and password.');
      return;
    }

    if (!captchaValid) {
      setError('Please verify the CAPTCHA.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { userId: trimmedUserId, password: trimmedPassword });
      window.localStorage.setItem('ucst_token', data.token);
      window.localStorage.setItem('ucst_user', JSON.stringify(data.user));
      setError('');
      router.push('/dashboard');
    } catch (loginError) {
      setError(loginError?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center blur-[2px]" />
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 grid-mesh opacity-35" />

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="glass-panel relative z-10 w-full max-w-md rounded-[28px] border border-white/10 p-6 shadow-glow sm:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-indigo-200 shadow-[0_0_40px_rgba(99,102,241,0.18)]">
            <FaUniversity />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">UCST Nexus ERP</p>
            <h1 className="text-xl font-semibold text-white">Student Sign In</h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-400">Use your assigned User ID and password issued by the administration. Self-registration is not enabled.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">User ID</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 focus-within:border-indigo-400/40">
              <FaUser className="text-zinc-500" />
              <Input value={userId} onChange={(event) => {
                setUserId(event.target.value);
                if (error) setError('');
              }} className="border-0 bg-transparent px-0 focus:border-0" placeholder="Enter your user ID" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Password</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 focus-within:border-indigo-400/40">
              <FaLock className="text-zinc-500" />
              <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError('');
              }} className="border-0 bg-transparent px-0 focus:border-0" placeholder="Enter password" />
              <button type="button" className="text-zinc-500 transition hover:text-white" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          <CaptchaField onValidityChange={setCaptchaValid} />

          {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

          <button disabled={loading || !captchaValid || !userId.trim() || !password.trim()} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Signing in...' : 'Login to Portal'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <Link href="/forgot-password" className="transition hover:text-zinc-300">Forgot password?</Link>
          <span>Admin access is hidden at /ucst-core</span>
        </div>
      </motion.section>
    </main>
  );
}