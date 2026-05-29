import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-10 text-center shadow-glow">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">UCST College</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">UCST Nexus ERP</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
          Modern university ERP for students and administrators with hidden control center access, premium dashboards, notices, notes, complaints, and events.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10">
            Student Login
          </Link>
        </div>
      </div>
    </main>
  );
}