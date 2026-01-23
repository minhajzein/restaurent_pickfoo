'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Category } from '@/types/category';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const useMyCategories = () => useQuery<Category[]>({
    queryKey: ['my-categories'],
    queryFn: async () => {
      const { data } = await api.get('/menu/categories');
      return data.data;
    },
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: { name: string; image?: string; parent?: string | null }) => {
      const { data } = await api.post('/menu/categories', categoryData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-categories'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; image?: string; parent?: string | null }> }) => {
      const response = await api.put(`/menu/categories/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/menu/categories/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-categories'] });
    },
  });

  return {
    useMyCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
