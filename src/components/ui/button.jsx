import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Button({ className, asChild, children, ...props }) {
  const Comp = asChild ? Link : 'button';
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition duration-200 hover:border-white/20 hover:bg-white/10',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}