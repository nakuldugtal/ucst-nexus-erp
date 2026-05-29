import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">403</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Access Denied</h1>
        <p className="mt-3 text-sm text-zinc-400">This route is restricted by role-based access control.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm text-white transition hover:bg-white/10">Return to Dashboard</Link>
      </div>
    </main>
  );
}
