"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ClipboardList,
  Wallet,
  Star,
  LogOut,
  Menu as MenuIcon,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import api from "@/lib/axios";

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
    if (isInitialized && (!isAuthenticated || user?.role !== "owner")) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // Redirect owners without a restaurant to onboarding
  useEffect(() => {
    const shouldCheckRestaurants =
      isInitialized &&
      isAuthenticated &&
      user?.role === "owner" &&
      pathname !== "/restaurants";

    if (!shouldCheckRestaurants) return;

    let cancelled = false;

    const checkRestaurants = async () => {
      try {
        const { data } = await api.get("/restaurants/my-restaurants");
        if (cancelled) return;

        const restaurants = data?.data as unknown[] | undefined;
        if (!restaurants || restaurants.length === 0) {
          router.push("/restaurants?onboard=1");
        }
      } catch {
        // Silently ignore; auth/layout guard will handle unauthorized states
      }
    };

    void checkRestaurants();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, isAuthenticated, user, pathname, router]);

  // Close mobile menu on path change
  useEffect(() => {
    const timer = setTimeout(() => setIsMobileMenuOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Connect to Restaurant Backend (port 5000)
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        withCredentials: true,
      },
    );

    socket.on("connect", () => {
      console.log("Connected to notification service");
      if (user?.id) {
        // Build the room name using the user ID (which corresponds to ownerId in backend)
        socket.emit("join-owner-room", user.id);
      }
    });

    socket.on(
      "restaurant-status-update",
      (data: { message: string; status: string }) => {
        // Determine icon based on status
        let Icon = Bell;
        let iconColor = "text-blue-500";

        if (data.status === "active" || data.status === "verified") {
          Icon = CheckCircle2;
          iconColor = "text-green-500";
        } else if (data.status === "suspended" || data.status === "rejected") {
          Icon = AlertCircle;
          iconColor = "text-red-500";
        }

        toast.message("Restaurant Status Update", {
          description: data.message,
          icon: <Icon className={`h-5 w-5 ${iconColor}`} />,
          duration: 8000,
          action: {
            label: "View",
            onClick: () => router.push("/restaurants"),
          },
        });

        // Play notification sound
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      },
    );

    // Listen for new orders (future proofing)
    socket.on("new-order", (data: { orderId: string }) => {
      toast.message("New Order Received", {
        description: `New order #${data.orderId ? data.orderId.slice(-6) : ""} received!`,
        icon: <ClipboardList className="h-5 w-5 text-green-500" />,
        duration: 10000,
        action: {
          label: "View",
          onClick: () => router.push("/orders"),
        },
      });
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user, router]);

  if (!isInitialized || !user || user.role !== "owner") {
    return (
      <div className="min-h-screen bg-[#013644] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#98E32F]"></div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "My Restaurant", icon: Store, href: "/restaurants" },
    { name: "Menu Items", icon: UtensilsCrossed, href: "/menu" },
    { name: "Orders", icon: ClipboardList, href: "/orders" },
    { name: "Transactions", icon: Wallet, href: "/transactions" },
    { name: "Reviews", icon: Star, href: "/reviews" },
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
          transition-[width,transform] duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? "w-64" : "w-20"}
        `}
      >
        <div className="p-6 h-20 flex items-center relative overflow-hidden">
          {/* Logo - Expanded State */}
          <div
            className={`transition-all duration-300 ease-in-out ${isSidebarOpen || isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 pointer-events-none"}`}
          >
            <Link href="/" className="relative h-8 w-32 block">
              <Image
                src="/logo.png"
                alt="Pickfoo"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          {/* Favicon - Minimized State */}
          <div
            className={`absolute left-5 transition-all duration-300 ease-in-out ${!isSidebarOpen && !isMobileMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"}`}
          >
            <Link
              href="/"
              className="relative w-10 h-10 flex items-center justify-center group/favicon"
            >
              <div className="absolute inset-0 bg-[#98E32F]/10 rounded-xl blur-sm group-hover/favicon:bg-[#98E32F]/20 transition-colors" />
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/favicon.ico"
                  alt="Pickfoo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Mobile close button */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 absolute right-6 hover:bg-white/5 rounded-lg text-[#98E32F]"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center p-3 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? "bg-[#98E32F] text-[#013644] shadow-[0_0_20px_rgba(152,227,47,0.2)]"
                    : "hover:bg-[#98E32F]/10 hover:text-[#98E32F] text-white/60"
                }`}
              >
                <div
                  className={`flex items-center justify-center transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "w-auto" : "w-full"}`}
                >
                  <item.icon
                    size={22}
                    className={`min-w-[22px] transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
                  />
                </div>
                <span
                  className={`font-bold text-sm tracking-tight whitespace-nowrap transition-all duration-300 overflow-hidden ${
                    isSidebarOpen || isMobileMenuOpen
                      ? "opacity-100 max-w-[200px] ml-4"
                      : "opacity-0 max-w-0 ml-0"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full transition-opacity duration-300 ${isSidebarOpen || isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => logout()}
            className="w-full flex items-center p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all duration-300"
          >
            <div
              className={`flex items-center justify-center transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "w-auto" : "w-full"}`}
            >
              <LogOut size={22} className="min-w-[22px]" />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isSidebarOpen || isMobileMenuOpen
                  ? "opacity-100 max-w-[200px] ml-4"
                  : "opacity-0 max-w-0 ml-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-[#013644]/50 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Desktop toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 -ml-2 hover:bg-white/5 rounded-lg text-[#98E32F] transition-all duration-300 items-center justify-center w-10 h-10"
            >
              <div className="relative w-6 h-6">
                <MenuIcon
                  size={24}
                  className={`absolute inset-0 transition-all duration-500 ${isSidebarOpen ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}`}
                />
                <X
                  size={24}
                  className={`absolute inset-0 transition-all duration-500 ${isSidebarOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"}`}
                />
              </div>
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-white/5 rounded-lg text-[#98E32F]"
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {navItems.find((item) => item.href === pathname)?.name ||
                "Owner Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none mb-1">
                {user.name}
              </p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-black leading-none">
                {user.role}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#98E32F] to-[#7dbb26] flex items-center justify-center text-[#013644] font-bold shadow-lg shadow-[#98E32F]/20">
              {user.name[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
