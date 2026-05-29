'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function OverviewChart({ data }) {
  return (
    <div className="h-72 w-full rounded-3xl border border-white/10 bg-black/20 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" />
          <YAxis stroke="rgba(255,255,255,0.35)" />
          <Tooltip contentStyle={{ background: 'rgba(10, 12, 18, 0.96)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} />
          <Area type="monotone" dataKey="students" stroke="#8b5cf6" fill="rgba(139,92,246,0.18)" strokeWidth={2} />
          <Area type="monotone" dataKey="complaints" stroke="#38bdf8" fill="rgba(56,189,248,0.12)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}