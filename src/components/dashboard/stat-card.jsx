export function StatCard({ title, value, delta, hint }) {
  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-sm text-zinc-500">{hint}</p>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">{delta}</span>
      </div>
    </div>
  );
}