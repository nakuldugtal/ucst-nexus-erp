export function Panel({ title, action, children }) {
  return (
    <section className="glass-panel rounded-3xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}