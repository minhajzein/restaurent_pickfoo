'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { RestaurantFormData } from '@/schemas';
import { Restaurant } from '@/types/restaurant';

export const useRestaurants = () => {
  const queryClient = useQueryClient();

  const useMyRestaurants = () => useQuery<Restaurant[]>({
    queryKey: ['my-restaurants'],
    queryFn: async () => {
      const { data } = await api.get('/restaurants/my-restaurants');
      return data.data;
    },
  });

  const createRestaurant = useMutation({
    mutationFn: async (restaurantData: RestaurantFormData) => {
      const { data } = await api.post('/restaurants', restaurantData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] });
    },
  });

  const updateRestaurant = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Restaurant> }) => {
      const response = await api.put(`/restaurants/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] });
    },
  });

  const submitForVerification = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/restaurants/${id}/submit-verification`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] });
    },
  });

  const deleteRestaurant = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/restaurants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-restaurants'] });
    },
  });

  return {
    useMyRestaurants,
    createRestaurant,
    updateRestaurant,
    submitForVerification,
    deleteRestaurant,
  };
};
