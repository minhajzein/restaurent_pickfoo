'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  _id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  orderType?: 'pickup' | 'delivery';
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
    mutationFn: async ({ id, status, orderType }: { id: string; status: string; orderType?: 'pickup' | 'delivery' }) => {
      const body: Record<string, unknown> = { status };
      if (orderType) body.orderType = orderType;
      const { data } = await api.put(`/orders/${id}/status`, body);
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
