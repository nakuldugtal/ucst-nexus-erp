import { cn } from '@/lib/utils';

export function Input({ className, ...props }) {
  return <input className={cn('w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-500 transition focus:border-indigo-400/40', className)} {...props} />;
}