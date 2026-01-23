'use client';

import {
  Store,
  UtensilsCrossed,
  ClipboardList,
  Wallet,
  Clock,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import * as useAuthStore from '@/store/useAuthStore';
import { Restaurant } from '@/types/restaurant';
import { MenuItem } from '@/types/menu';
import { Order } from '@/hooks/useOrders';

export default function OwnerDashboardPage() {
  const { user } = useAuthStore.useAuthStore();
  const { useMyRestaurants } = useRestaurants();
  const { useMyMenu } = useMenu();
  const { useMyOrders } = useOrders();

  const { data: restaurants } = useMyRestaurants();
  const { data: menuItems } = useMyMenu();
  const { data: orders } = useMyOrders();

  const stats = [
    { 
      name: 'Total Restaurants', 
      value: restaurants?.length || '0', 
      icon: Store, 
      trend: `${restaurants?.filter((r: Restaurant) => r.status === 'active').length || 0} active` 
    },
    { 
      name: 'Total Menu Items', 
      value: menuItems?.length || '0', 
      icon: UtensilsCrossed, 
      trend: `${menuItems?.filter((m: MenuItem) => m.isActive).length || 0} available` 
    },
    { 
      name: 'Live Orders', 
      value: orders?.filter((o: Order) => o.status !== 'delivered' && o.status !== 'cancelled').length || '0', 
      icon: ClipboardList, 
      trend: 'Awaiting fulfillment' 
    },
    { 
      name: 'Total Revenue', 
      value: `₹${orders?.reduce((acc: number, o: Order) => o.status === 'delivered' ? acc + o.totalAmount : acc, 0).toLocaleString() || '0'}`, 
      icon: Wallet, 
      trend: 'Lifetime earnings' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h2>
        <p className="text-white/60 text-lg">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-[#98E32F]/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[#98E32F]/10 rounded-2xl text-[#98E32F] group-hover:scale-110 transition-transform">
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#98E32F] bg-[#98E32F]/10 px-3 py-1.5 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.name}</p>
              <p className="text-4xl font-bold mt-1 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                 <ClipboardList className="text-[#98E32F]" size={20} />
              </div>
              <h3 className="text-xl font-bold">Pending Actions</h3>
            </div>
            <Link href="/orders" className="text-[#98E32F] text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {orders?.slice(0, 4).map((order: Order) => (
              <div key={order._id} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#98E32F]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Order #{order._id.slice(-6)}</p>
                    <p className="text-xs text-white/40">{order.restaurant?.name} • {order.items.length} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#98E32F]">₹{order.totalAmount}</p>
                  <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full ${
                    order.status === 'pending' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <div className="py-12 text-center">
                 <p className="text-white/20 italic">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                <Store className="text-[#98E32F]" size={20} />
             </div>
             <h3 className="text-xl font-bold">Network Status</h3>
          </div>
          <div className="space-y-6">
            {restaurants?.slice(0, 3).map((res: Restaurant) => (
               <div key={res._id} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl ${res.status === 'active' ? 'bg-[#98E32F]/20 text-[#98E32F]' : 'bg-white/10 text-white/30'}`}>
                      <Store size={16} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm leading-tight">{res.name}</h4>
                        <p className="text-[10px] text-white/30">{res.address.city}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                    res.status === 'active' ? 'text-[#98E32F]' : 
                    res.status === 'pending' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        res.status === 'active' ? 'bg-[#98E32F]' : 
                        res.status === 'pending' ? 'bg-orange-400' : 'bg-red-400'
                    }`} />
                    {res.status}
                  </div>
               </div>
            ))}
            {restaurants?.length === 0 && (
               <div className="py-8 text-center text-white/20 italic text-sm">
                  Register your first restaurant to start.
               </div>
            )}
            <Link href="/restaurants" className="block w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
               Manage Network
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
