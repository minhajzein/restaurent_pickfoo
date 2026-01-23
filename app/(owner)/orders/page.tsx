'use client';

import { 
  ClipboardList, 
  Clock, 
  MapPin, 
  User, 
  Store,
  CheckCircle2,
  Package,
  Truck,
  ExternalLink
} from 'lucide-react';
import { useOrders, Order, OrderItem } from '@/hooks/useOrders';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export default function OwnerOrdersPage() {
  const { useMyOrders, updateOrderStatus } = useOrders();
  const { data: orders, isLoading } = useMyOrders();

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const statusColors: Record<Order['status'], string> = {
    'pending': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'confirmed': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'preparing': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'out-for-delivery': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'delivered': 'bg-[#98E32F]/10 text-[#98E32F] border-[#98E32F]/20',
    'cancelled': 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'preparing': return <Package size={14} />;
      case 'out-for-delivery': return <Truck size={14} />;
      case 'delivered': return <CheckCircle2 size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
        <p className="text-white/60">Real-time order tracking and management across all your restaurants.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-[2rem] border border-white/10 animate-pulse"></div>
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/10">
            <ClipboardList size={40} />
          </div>
          <h3 className="text-2xl font-bold mb-2">No orders found</h3>
          <p className="text-white/40 max-w-md">When customers place orders at your restaurants, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order: Order) => (
            <div key={order._id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-[#98E32F]/30 transition-all group">
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Order #{order._id.slice(-6)}</span>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${statusColors[order.status]}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/-/g, ' ')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#98E32F]">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-white/30 font-bold uppercase tracking-tighter leading-none mb-1">Customer</p>
                        <p className="font-bold text-sm">{order.user?.name || 'Guest User'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#98E32F]">
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-white/30 font-bold uppercase tracking-tighter leading-none mb-1">Restaurant</p>
                        <p className="font-bold text-sm">{order.restaurant?.name || 'Unknown'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#98E32F]">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-white/30 font-bold uppercase tracking-tighter leading-none mb-1">Delivery Address</p>
                        <p className="font-bold text-sm truncate max-w-[200px]">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px lg:h-12 lg:w-px bg-white/10"></div>

                <div className="w-full lg:w-48">
                  <div className="mb-4">
                    <p className="text-xs text-white/30 font-bold uppercase text-right leading-none mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-[#98E32F] text-right">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                        className="bg-[#98E32F] text-[#013644] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'preparing')}
                        className="bg-[#98E32F] text-[#013644] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'out-for-delivery')}
                        className="bg-[#98E32F] text-[#013644] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {order.status === 'out-for-delivery' && (
                      <button 
                        onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        className="bg-[#98E32F] text-[#013644] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-white/30 hover:text-white transition-all">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-4">
                {order.items?.map((item: OrderItem, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-[10px] font-black text-[#98E32F]">{item.quantity}x</span>
                    <span className="text-[11px] font-bold text-white/50">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
