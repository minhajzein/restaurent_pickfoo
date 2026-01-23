'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { MenuItemFormData } from '@/schemas';
import { MenuItem } from '@/types/menu';

export const useMenu = () => {
  const queryClient = useQueryClient();

  const useMyMenu = () => useQuery<MenuItem[]>({
    queryKey: ['my-menu'],
    queryFn: async () => {
      const { data } = await api.get('/menu');
      return data.data;
    },
  });

  const createMenuItem = useMutation({
    mutationFn: async (itemData: MenuItemFormData) => {
      const { data } = await api.post('/menu', itemData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menu'] });
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MenuItemFormData> }) => {
      const response = await api.put(`/menu/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menu'] });
    },
  });

  const assignToRestaurants = useMutation({
    mutationFn: async ({ id, restaurantIds }: { id: string; restaurantIds: string[] }) => {
      const { data } = await api.put(`/menu/${id}/assign-restaurants`, { restaurantIds });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menu'] });
    },
  });

  const deleteMenuItem = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-menu'] });
    },
  });

  return {
    useMyMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    assignToRestaurants,
  };
};
