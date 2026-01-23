'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Store, 
  UtensilsCrossed, 
  ClipboardList, 
  Wallet, 
  Star, 
  LogOut,
  Menu as MenuIcon,
  X
} from 'lucide-react';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isInitialized, logout } = useAuthStore();
  const router = useRouter();

  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== 'owner')) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-[#013644] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#98E32F]"></div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'My Restaurants', icon: Store, href: '/restaurants' },
    { name: 'Menu Items', icon: UtensilsCrossed, href: '/menu' },
    { name: 'Orders', icon: ClipboardList, href: '/orders' },
    { name: 'Transactions', icon: Wallet, href: '/transactions' },
    { name: 'Reviews', icon: Star, href: '/reviews' },
  ];

  return (
    <div className="h-dvh bg-[#013644] text-white flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-[#002833] border-r border-white/5 flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <Link href="/" className="relative h-8 w-32 block">
              <Image 
                src="/logo.png" 
                alt="Pickfoo" 
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg text-[#98E32F]"
          >
            {isSidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-[#98E32F] text-[#013644] shadow-[0_0_20px_rgba(152,227,47,0.2)]' 
                    : 'hover:bg-[#98E32F]/10 hover:text-[#98E32F] text-white/60'
                }`}
              >
                <item.icon size={22} className={`min-w-[22px] ${isActive ? 'scale-110' : ''}`} />
                {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <LogOut size={22} className="min-w-[22px]" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-white/5 bg-[#013644]/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Owner Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-white/50 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#98E32F] flex items-center justify-center text-[#013644] font-bold">
              {user.name[0]}
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
