'use client';

import { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Store,
  MessageSquare,
  ThumbsUp,
  MoreVertical,
  ChevronDown,
  Calendar,
  User,
  Reply,
  Activity
} from 'lucide-react';
import Image from 'next/image';
import { useReviews } from '@/hooks/useReviews';
import { formatDistanceToNow } from 'date-fns';
import { Review } from '@/types/review';

export default function OwnerReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const { useMyReviews } = useReviews();
  const { data: reviews, isLoading } = useMyReviews();

  // Calculate stats from real data
  const totalReviews = reviews?.length || 0;
  const avgRating = (reviews && totalReviews > 0) 
    ? (reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const ratingStats = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews?.filter((r: Review) => r.rating === stars).length || 0;
    return {
      stars,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Customer Reviews</h2>
          <p className="text-white/60 text-sm sm:text-base">Listen to what your customers are saying and engage with their feedback.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:px-6 sm:py-4 flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
          <div className="text-center sm:text-left">
            <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">Average Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#98E32F]">{avgRating}</span>
              <div className="flex text-[#98E32F] hidden sm:flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(Number(avgRating)) ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="text-center sm:text-left">
            <p className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1">Total Reviews</p>
            <p className="text-2xl sm:text-3xl font-black text-white">{totalReviews}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Filters */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-sm sm:text-base">
              <Activity className="text-[#98E32F]" size={18} />
              Rating Distribution
            </h3>
            <div className="space-y-4">
              {ratingStats.map((stat) => (
                <div key={stat.stars} className="flex items-center gap-4 group cursor-pointer">
                  <div className="flex items-center gap-1 w-10 sm:w-12 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-white/60">{stat.stars}</span>
                    <Star size={10} className="text-[#98E32F]" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#98E32F] rounded-full transition-all duration-1000 group-hover:bg-[#86c929]"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-white/40 font-mono w-8 text-right">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#98E32F]/5 border border-[#98E32F]/20 rounded-[2.5rem] p-8">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-[#98E32F]">
              <MessageSquare size={18} />
              Quick Filters
            </h3>
            <div className="space-y-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#98E32F] transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search keywords..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#013644] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#98E32F]/50 outline-none transition-all"
                />
              </div>
              <button className="w-full bg-[#013644] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between hover:border-[#98E32F]/30 transition-all text-white/60 hover:text-white">
                <span className="flex items-center gap-2"><Store size={14} /> All Restaurants</span>
                <ChevronDown size={14} />
              </button>
              <button className="w-full bg-[#013644] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between hover:border-[#98E32F]/30 transition-all text-white/60 hover:text-white">
                <span className="flex items-center gap-2"><Calendar size={14} /> Last 30 Days</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-4">
              <button className="text-sm font-bold text-[#98E32F] border-b-2 border-[#98E32F] pb-1">All Reviews</button>
              <button className="text-sm font-bold text-white/40 hover:text-white transition-colors pb-1">Unanswered</button>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/20">
              Sort By: <span className="text-white/60">Newest First</span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-44 bg-white/5 border border-white/10 rounded-[2rem] animate-pulse"></div>
               ))}
            </div>
          ) : reviews?.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/10">
                <MessageSquare size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No reviews yet</h3>
              <p className="text-white/40 max-w-md">Feedback from your customers will appear here once they start rating their orders.</p>
            </div>
          ) : (
            reviews?.map((review: Review) => (
              <div key={review._id} className="bg-white/5 border border-white/10 rounded-3xl sm:rounded-[2rem] p-5 sm:p-6 hover:border-[#98E32F]/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/5 relative bg-white/5">
                      {review.user?.profilePicture ? (
                        <Image src={review.user.profilePicture} alt={review.user.name} fill className="object-cover" />
                      ) : (
                        <User className="m-auto text-white/20 sm:w-6 sm:h-6" size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-[#98E32F] transition-colors">{review.user?.name || 'Anonymous User'}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex text-[#98E32F]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={8} className="sm:w-[10px] sm:h-[10px]" fill={i < review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <span className="text-[10px] text-white/20 font-bold">•</span>
                        <span className="text-[10px] text-white/40 font-medium">
                          {isMounted ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="bg-white/5 px-2 sm:px-3 py-1 rounded-lg border border-white/5 flex items-center gap-1.5 shrink-0">
                        <Store size={10} className="text-[#98E32F] sm:w-3 sm:h-3" />
                        <span className="text-[8px] sm:text-[10px] font-bold text-white/30 truncate max-w-[60px] sm:max-w-[100px]">{review.restaurant?.name || 'Unknown'}</span>
                    </div>
                    <button className="p-1 sm:p-2 hover:bg-white/5 rounded-xl text-white/20">
                      <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-6 sm:pl-16 italic">
                  &quot;{review.comment}&quot;
                </p>

                <div className="sm:pl-16 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-6">
                    <button className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-white/30 hover:text-white transition-colors">
                      <ThumbsUp size={12} className="sm:w-[14px] sm:h-[14px]" /> Helpful
                    </button>
                    <button className={`flex items-center gap-2 text-[10px] sm:text-[11px] font-bold transition-colors ${review.replied ? 'text-[#98E32F]' : 'text-white/30 hover:text-white'}`}>
                      <Reply size={12} className="sm:w-[14px] sm:h-[14px]" /> {review.replied ? 'Replied' : 'Reply'}
                    </button>
                  </div>
                  {!review.replied && (
                    <button className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest text-[#98E32F] bg-[#98E32F]/10 px-4 py-2.5 rounded-xl hover:bg-[#98E32F]/20 transition-all">
                        Write Reply
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {reviews && reviews.length > 5 && (
            <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-white/20 text-xs font-bold uppercase tracking-[.2em] hover:bg-white/5 hover:border-[#98E32F]/50 hover:text-white transition-all">
              Load More Reviews
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
