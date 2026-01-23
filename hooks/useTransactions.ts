'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Transaction, TransactionStats } from '@/types/transaction';

export const useTransactions = () => {
  const useMyTransactions = () => useQuery<Transaction[]>({
    queryKey: ['my-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/transactions');
      return data.data;
    },
  });

  const useTransactionStats = () => useQuery<TransactionStats>({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/stats');
      return data.data;
    },
  });

  return {
    useMyTransactions,
    useTransactionStats,
  };
};
