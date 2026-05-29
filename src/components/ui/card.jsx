import { cn } from '@/lib/utils';

export function Card({ className, children }) {
  return <div className={cn('glass-panel rounded-3xl border border-white/10', className)}>{children}</div>;
}

export function CardHeader({ className, children }) {
  return <div className={cn('border-b border-white/5 p-5', className)}>{children}</div>;
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}