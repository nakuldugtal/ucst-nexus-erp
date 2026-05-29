'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBookOpen, FaCalendarAlt, FaChartLine, FaClipboardList, FaCogs, FaHome, FaLayerGroup, FaPowerOff, FaRegBell, FaUserCircle, FaChevronLeft, FaChevronRight, FaUsers } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: FaHome },
  { href: '/dashboard/notes', label: 'Notes & PYQs', icon: FaBookOpen },
  { href: '/dashboard/notices', label: 'Notices', icon: FaRegBell },
  { href: '/dashboard/complaints', label: 'Complaints', icon: FaClipboardList },
  { href: '/dashboard/events', label: 'Events', icon: FaCalendarAlt },
  { href: '/dashboard/profile', label: 'Profile', icon: FaUserCircle }
];

const adminLinks = [
  { href: '/ucst-core#overview', label: 'Overview', icon: FaHome },
  { href: '/ucst-core#students', label: 'Students', icon: FaUsers },
  { href: '/ucst-core#notes', label: 'Notes', icon: FaBookOpen },
  { href: '/ucst-core#notices', label: 'Notices', icon: FaRegBell },
  { href: '/ucst-core#complaints', label: 'Complaints', icon: FaClipboardList },
  { href: '/ucst-core#events', label: 'Events', icon: FaCalendarAlt },
  { href: '/ucst-core#analytics', label: 'Analytics', icon: FaChartLine },
  { href: '/ucst-core#settings', label: 'Settings', icon: FaCogs }
];

export function Sidebar({ role = 'student' }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={cn('glass-panel sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[28px] border border-white/10 p-4 transition-all duration-300', collapsed ? 'w-24' : 'w-full lg:w-72')}>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="mb-4 ml-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/10"
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500">UCST Nexus ERP</p>
        <h2 className="mt-2 text-lg font-semibold text-white">{role === 'admin' ? 'Control Center' : 'Student Portal'}</h2>
        <p className="mt-1 text-xs text-zinc-500">Premium dark campus workflow</p>
      </div>

      <nav className="mt-5 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href.includes('#') ? pathname === '/ucst-core' : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center rounded-2xl border px-4 py-3 text-sm transition duration-200',
                collapsed ? 'justify-center' : 'gap-3',
                active ? 'border-indigo-400/35 bg-indigo-500/15 text-white shadow-[0_0_28px_rgba(99,102,241,0.12)]' : 'border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
              )}
            >
              <Icon />
              {!collapsed ? label : null}
            </Link>
          );
        })}
      </nav>

      <button onClick={handleLogout} className={cn('mt-auto flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-white', collapsed ? 'justify-center' : 'gap-3')}>
        <FaPowerOff />
        {!collapsed ? 'Logout' : null}
      </button>
    </aside>
  );
}