'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  _id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  user?: {
    name: string;
  };
  restaurant?: {
    name: string;
  };
  deliveryAddress: string;
  totalAmount: number;
  items: OrderItem[];
}

export const useOrders = () => {
  const queryClient = useQueryClient();

  const useMyOrders = () => useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data.data;
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  return {
    useMyOrders,
    updateOrderStatus,
  };
};
