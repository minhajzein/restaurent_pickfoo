export interface Transaction {
  _id: string;
  order: string | { _id: string; status: string };
  restaurant: { _id: string; name: string };
  owner: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentGateway: string;
  gatewayTransactionId: string;
  type: 'credit' | 'debit' | 'payout';
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  totalRevenue: number;
  totalTransactions: number;
}
