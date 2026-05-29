import { cn } from '@/lib/utils';

export function Badge({ className, children }) {
  return <span className={cn('inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200', className)}>{children}</span>;
}