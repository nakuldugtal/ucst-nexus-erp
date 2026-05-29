'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export function RoleGate({ allowedRoles = ['student'], children, denyRedirect = '/access-denied' }) {
  const router = useRouter();
  const { ready, user } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(denyRedirect);
      return;
    }

  }, [allowedRoles, denyRedirect, ready, router, user]);

  if (!ready) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-400">Loading secured portal...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-400">Routing to secure area...</div>;
  }

  return children;
}