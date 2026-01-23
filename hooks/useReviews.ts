'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Review } from '@/types/review';

export const useReviews = () => {
  const useMyReviews = () => useQuery<Review[]>({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const { data } = await api.get('/reviews/my-reviews');
      return data.data;
    },
  });

  return {
    useMyReviews,
  };
};
