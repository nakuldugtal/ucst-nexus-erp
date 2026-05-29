'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

export function CaptchaField({ onValidityChange }) {
  const [CaptchaCanvas, setCaptchaCanvas] = useState(null);
  const [validateCaptcha, setValidateCaptcha] = useState(null);
  const [reloadCaptcha, setReloadCaptcha] = useState(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadCaptcha() {
      const module = await import('react-simple-captcha');
      if (!mounted) return;

      setCaptchaCanvas(() => module.LoadCanvasTemplateNoReload);
      setValidateCaptcha(() => module.validateCaptcha);
      setReloadCaptcha(() => module.loadCaptchaEnginge);
    }

    loadCaptcha();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!CaptchaCanvas || !reloadCaptcha) return;

    const timer = window.setTimeout(() => {
      reloadCaptcha(6, '#0b0f19', '#f8fafc');
      onValidityChange(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [CaptchaCanvas, onValidityChange, reloadCaptcha]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setValue(nextValue);

    if (validateCaptcha) {
      onValidityChange(validateCaptcha(nextValue, false));
    }
  };

  const handleReload = () => {
    if (!reloadCaptcha) return;
    reloadCaptcha(6, '#0b0f19', '#f8fafc');
    setValue('');
    onValidityChange(false);
  };

  const Canvas = CaptchaCanvas;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">CAPTCHA</p>
        <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
          {Canvas ? <Canvas /> : <div className="flex h-[68px] items-center justify-center text-xs text-zinc-500">Loading CAPTCHA...</div>}
        </div>
        <button type="button" onClick={handleReload} className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-500 transition hover:text-zinc-200">
          Reload Code
        </button>
      </div>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-500">Verify CAPTCHA</span>
        <Input value={value} onChange={handleChange} placeholder="Type the code" />
      </label>
    </div>
  );
}