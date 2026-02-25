'use client';

import {
  Store,
  UtensilsCrossed,
  ClipboardList,
  Wallet,
  Clock,
  ChevronRight,
  Star,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import * as useAuthStore from '@/store/useAuthStore';
import { Restaurant } from '@/types/restaurant';
import { MenuItem } from '@/types/menu';
import { Order } from '@/hooks/useOrders';
import { useReviews } from '@/hooks/useReviews';
import { Review } from '@/types/review';

export default function OwnerDashboardPage() {
  const { user } = useAuthStore.useAuthStore();
  const { useMyRestaurants } = useRestaurants();
  const { useMyMenu } = useMenu();
  const { useMyOrders } = useOrders();
  const { useMyReviews } = useReviews();

  const { data: restaurants } = useMyRestaurants();
  const { data: menuItems } = useMyMenu();
  const { data: orders } = useMyOrders();
  const { data: reviews } = useMyReviews();

  const totalReviews = reviews?.length || 0;
  const averageRating =
    reviews && totalReviews > 0
      ? (
          reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) /
          totalReviews
        ).toFixed(1)
      : '0.0';

  const statusBuckets: Order['status'][] = [
    'pending',
    'confirmed',
    'preparing',
    'out-for-delivery',
    'delivered',
    'cancelled',
  ];

  const statusStats = statusBuckets.map((status) => ({
    status,
    count:
      orders?.filter((o: Order) => o.status === status).length ??
      0,
  }));

  const maxStatusCount =
    statusStats.reduce(
      (max, s) => (s.count > max ? s.count : max),
      0,
    ) || 1;

  const stats = [
    {
      name: 'My Restaurant',
      value: restaurants?.[0]?.name || 'Not created',
      icon: Store,
      trend:
        restaurants?.length
          ? restaurants[0]?.status === 'active'
            ? 'Active'
            : restaurants[0]?.status === 'pending'
              ? 'Pending verification'
              : 'Inactive'
          : 'Create your restaurant'
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
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h2>
        <p className="text-white/60 text-base sm:text-lg">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/5 border border-white/10 p-5 sm:p-6 rounded-3xl hover:border-[#98E32F]/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[#98E32F]/10 rounded-2xl text-[#98E32F] group-hover:scale-110 transition-transform">
                <stat.icon size={22} className="sm:w-6 sm:h-6" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#98E32F] bg-[#98E32F]/10 px-3 py-1.5 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.name}</p>
              <p className="text-3xl sm:text-4xl font-bold mt-1 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                 <ClipboardList className="text-[#98E32F]" size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Pending Actions</h3>
            </div>
            <Link href="/orders" className="text-[#98E32F] text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {orders?.slice(0, 4).map((order: Order) => (
              <div key={order._id} className="flex items-center justify-between p-4 sm:p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#98E32F]">
                    <Clock size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm sm:text-base truncate">Order #{order._id.slice(-6)}</p>
                    <p className="text-[10px] sm:text-xs text-white/40 truncate">{order.restaurant?.name} • {order.items.length} items</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-[#98E32F] text-sm sm:text-base">₹{order.totalAmount}</p>
                  <span className={`text-[8px] sm:text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-full ${
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

        {/* Insights: Orders graph + Reviews */}
        <div className="space-y-6">
          {/* Order status graph */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                  <Activity className="text-[#98E32F]" size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Order Pipeline</h3>
                  <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest font-black">
                    Volume by status
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                {orders?.length || 0} orders
              </span>
            </div>
            <div className="space-y-3">
              {statusStats.map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="w-28 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 truncate">
                    {s.status.replace(/-/g, ' ')}
                  </span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#98E32F] rounded-full transition-all"
                      style={{ width: `${(s.count / maxStatusCount) * 100 || 0}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[10px] font-mono text-white/60">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews snapshot */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                  <Star className="text-[#98E32F]" size={18} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Latest Reviews</h3>
                  <p className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest font-black">
                    What customers are saying
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                  Average Rating
                </p>
                <p className="text-xl sm:text-2xl font-black text-[#98E32F]">
                  {averageRating}
                </p>
              </div>
            </div>

            {totalReviews === 0 ? (
              <p className="text-white/30 text-sm italic">
                You don&apos;t have any reviews yet. As customers rate their orders, a snapshot will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {reviews?.slice(0, 3).map((review: Review) => (
                  <div
                    key={review._id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between items-center gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {review.user?.name || 'Customer'}
                      </p>
                      <p className="text-[10px] text-white/40 truncate max-w-[180px]">
                        {review.comment}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star
                        size={14}
                        className="text-[#98E32F]"
                        fill="currentColor"
                      />
                      <span className="text-sm font-bold text-white">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/reviews"
              className="block w-full mt-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              View All Reviews
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
