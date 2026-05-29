'use client';

import { FaBell, FaSearch } from 'react-icons/fa';
import { Input } from '@/components/ui/input';

export function Topbar({ title, subtitle }) {
  return (
    <header className="glass-panel flex flex-col gap-4 rounded-[28px] border border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">UCST Nexus ERP</p>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input className="pl-11" placeholder="Search portal" />
        </div>
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/10">
          <FaBell />
        </button>
      </div>
    </header>
  );
}