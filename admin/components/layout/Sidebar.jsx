'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCog, List,
  Zap, Target, Trophy
} from 'lucide-react';

const navGroups = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'MANAGEMENT',
    items: [
      { label: 'Users', href: '/users', icon: Users },
      { label: 'Admins', href: '/admins', icon: UserCog },
      { label: 'Eco Action Categories', href: '/categories', icon: List },
      { label: 'Eco Actions', href: '/actions', icon: Zap },
      { label: 'Challenges', href: '/challenges', icon: Target },
      { label: 'Achievements & Badges', href: '/achievements', icon: Trophy },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col"
      style={{ backgroundColor: '#0f172a' }}>

      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image
            src="/app_logo.png"
            alt="LetzEco"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <p className="text-white font-bold text-sm leading-tight">
              LetzEco Admin
            </p>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-500
              uppercase tracking-wider mb-2 px-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5
                      rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-green-500 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

    </aside>
  );
}