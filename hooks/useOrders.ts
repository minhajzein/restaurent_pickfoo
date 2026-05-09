'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  _id: string;
  pickfooId?: string;
  status:
    | 'awaiting-owner'
    | 'accepted-awaiting-payment'
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out-for-delivery'
    | 'delivered'
    | 'cancelled'
    | 'rejected';
  orderType?: 'pickup' | 'delivery';
  user?: { name: string };
  restaurant?: { name: string };
  deliveryAddress: string;
  totalAmount: number;
  items: OrderItem[];
}

export const useOrders = () => {
  const queryClient = useQueryClient();

  const useMyOrders = (options?: { refetchInterval?: number }) =>
    useQuery<Order[]>({
      queryKey: ['my-orders'],
      queryFn: async () => {
        const { data } = await api.get('/orders/my-orders');
        return data.data;
      },
      refetchInterval: options?.refetchInterval ?? 30_000,
    });

  /** Owner updates status: preparing | ready */
  const updateOrderStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      orderType,
    }: {
      id: string;
      status: string;
      orderType?: 'pickup' | 'delivery';
    }) => {
      const body: Record<string, unknown> = { status };
      if (orderType) body.orderType = orderType;
      const { data } = await api.put(`/orders/${id}/status`, body);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  /** Accept or reject a new order request (awaiting-owner) */
  const decideOrder = useMutation({
    mutationFn: async ({
      id,
      decision,
      reason,
      orderType,
    }: {
      id: string;
      decision: 'accepted' | 'rejected';
      reason?: string;
      orderType?: 'pickup' | 'delivery';
    }) => {
      const body: Record<string, unknown> = { decision };
      if (reason) body.reason = reason;
      if (orderType) body.orderType = orderType;
      const { data } = await api.put(`/orders/${id}/decision`, body);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  return { useMyOrders, updateOrderStatus, decideOrder };
};
