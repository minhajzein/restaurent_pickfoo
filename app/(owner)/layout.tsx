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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && (!isAuthenticated || user?.role !== 'owner')) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // Close mobile menu on path change
  useEffect(() => {
    const timer = setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

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
    <div className="h-dvh bg-[#013644] text-white flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#002833] border-r border-white/5 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'w-64' : 'w-64 lg:w-20'}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          {(isSidebarOpen || isMobileMenuOpen) ? (
            <Link href="/" className="relative h-8 w-32 block">
              <Image 
                src="/logo.png" 
                alt="Pickfoo" 
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          ) : (
            <div className="lg:w-8 h-8 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-[#98E32F]/10 flex items-center justify-center">
                <Store size={18} className="text-[#98E32F]" />
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex p-2 hover:bg-white/5 rounded-lg text-[#98E32F] transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-[#98E32F]"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
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
                {(isSidebarOpen || isMobileMenuOpen) && (
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                )}
                {isActive && (isSidebarOpen || isMobileMenuOpen) && (
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
            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-[#013644]/50 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg text-[#98E32F]"
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {navItems.find(item => item.href === pathname)?.name || 'Owner Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none mb-1">{user.name}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-black leading-none">{user.role}</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#98E32F] to-[#7dbb26] flex items-center justify-center text-[#013644] font-bold shadow-lg shadow-[#98E32F]/20">
              {user.name[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
