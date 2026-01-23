'use client';

import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Search,
  IndianRupee
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';

export default function OwnerTransactionsPage() {
  const { useMyTransactions, useTransactionStats } = useTransactions();
  const { data: transactions, isLoading: isListLoading } = useMyTransactions();
  const { data: stats, isLoading: isStatsLoading } = useTransactionStats();

  const getStatusStyle = (status: Transaction['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'refunded': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'failed': return <XCircle size={12} />;
      case 'refunded': return <AlertCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Library</h2>
          <p className="text-white/60">Manage your earnings, payouts, and digital settlements.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#98E32F] p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(152,227,47,0.2)] text-[#013644] relative overflow-hidden group">
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
            <TrendingUp size={140} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-60">Total Revenue</p>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-4xl font-black">
                {isStatsLoading ? (
                  <span className="opacity-20 animate-pulse">----</span>
                ) : (
                  `₹${stats?.totalRevenue?.toLocaleString() || '0'}`
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#013644]/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold">
              <ArrowUpRight size={14} />
              +12.5% from last month
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Total Transactions</p>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-4xl font-black">
                {isStatsLoading ? (
                  <span className="opacity-20 animate-pulse">--</span>
                ) : (
                  stats?.totalTransactions || '0'
                )}
              </span>
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase">Across all registered restaurants</p>
          </div>
          <div className="absolute right-8 bottom-8 text-[#98E32F]/10 group-hover:rotate-12 transition-transform duration-500">
            <Wallet size={48} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Pending Settlement</p>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-4xl font-black">₹0</span>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold">
              <Clock size={14} />
              In process: 2 orders
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden">
        {/* Table Filters */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01]">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search by order ID or restaurant..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-2.5 focus:border-[#98E32F]/50 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold text-white/60">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Transaction Details</th>
                <th className="px-8 py-5">Restaurant</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isListLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                      <div className="h-4 bg-white/5 rounded-lg w-full"></div>
                    </td>
                  </tr>
                ))
              ) : transactions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10">
                        <IndianRupee size={32} />
                      </div>
                      <h4 className="text-xl font-bold">No transactions found</h4>
                      <p className="text-white/30 text-sm max-w-xs">Once you start receiving orders, your financial data will be generated here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions?.map((tx) => (
                  <tr key={tx._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold">{format(new Date(tx.createdAt), 'MMM dd, yyyy')}</p>
                      <p className="text-[10px] text-white/30 font-medium uppercase tracking-tighter">{format(new Date(tx.createdAt), 'hh:mm a')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-[#98E32F]/10 text-[#98E32F]' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">Order Payment</p>
                          <p className="text-[10px] text-white/30 font-mono">#{tx.order?.toString().slice(-8) || tx.gatewayTransactionId?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-white/70">{tx.restaurant?.name || 'My Kitchen'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-lg font-black ${tx.type === 'credit' ? 'text-[#98E32F]' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#98E32F] opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Showing 1-10 of {transactions?.length || 0} entries</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white/30 disabled:opacity-50">Prev</button>
            <button className="px-4 py-2 bg-[#98E32F] rounded-xl text-[10px] font-black uppercase text-[#013644]">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

