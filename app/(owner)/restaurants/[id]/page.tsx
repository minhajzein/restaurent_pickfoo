'use client';

import { useParams} from 'next/navigation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenu } from '@/hooks/useMenu';
import { 
  ArrowLeft,
  MapPin, 
  Phone, 
  UtensilsCrossed,
  Layers,
  Search,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RestaurantDashboardPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { useMyRestaurants } = useRestaurants();
  const { useMyMenu, assignToRestaurants } = useMenu();

  const { data: restaurants, isLoading: isRestaurantsLoading } = useMyRestaurants();
  const { data: menuItems, isLoading: isMenuLoading } = useMyMenu();

  const [activeTab, setActiveTab] = useState<'overview' | 'menu'>('menu');
  const [searchQuery, setSearchQuery] = useState('');

  if (isRestaurantsLoading || isMenuLoading) {
    return (
      <div className="flex bg-[#013644] animate-pulse h-full rounded-center items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#98E32F] rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const restaurant = restaurants?.find(r => r._id === restaurantId);

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Restaurant Not Found</h2>
        <Link href="/restaurants" className="text-[#98E32F] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Restaurants
        </Link>
      </div>
    );
  }

  // Filter menu items assigned to this restaurant
  const restaurantItems = menuItems?.filter(item => 
    item.restaurants.some(r => (typeof r === 'string' ? r : r._id) === restaurantId) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRemoveFromRestaurant = async (itemId: string) => {
    try {
      const item = menuItems?.find(i => i._id === itemId);
      if (!item) return;

      const currentRestaurantIds = item.restaurants.map(r => typeof r === 'string' ? r : r._id);
      const newRestaurantIds = currentRestaurantIds.filter((id: string) => id !== restaurantId);

      await assignToRestaurants.mutateAsync({
        id: itemId,
        restaurantIds: newRestaurantIds
      });
      toast.success("Item removed from restaurant");
    } catch (err) {
      toast.error("Failed to remove item");
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header / Banner */}
      <div className="relative h-64 rounded-[3rem] overflow-hidden border border-white/10 group">
        <Image 
          src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#013644] via-[#013644]/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="flex-1">
             <div className="flex items-center gap-4 mb-3">
               <Link href="/restaurants" className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white backdrop-blur-md">
                 <ArrowLeft size={20} />
               </Link>
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                 restaurant.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
               }`}>
                 {restaurant.status}
               </span>
             </div>
             <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{restaurant.name}</h1>
             <div className="flex items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                   <MapPin size={16} className="text-[#98E32F]" />
                   {restaurant.address.street}, {restaurant.address.city}
                </div>
                <div className="flex items-center gap-2">
                   <Phone size={16} className="text-[#98E32F]" />
                   {restaurant.contactNumber}
                </div>
             </div>
          </div>
          
          <div className="flex gap-3">
             {/* Action Buttons could go here */}
          </div>
        </div>
      </div>

      {/* Tabs / Navigation */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-1">
        <button 
          onClick={() => setActiveTab('menu')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'menu' ? 'text-[#98E32F]' : 'text-white/40 hover:text-white'}`}
        >
          Menu Management
          {activeTab === 'menu' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#98E32F] rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'overview' ? 'text-[#98E32F]' : 'text-white/40 hover:text-white'}`}
        >
          Overview & Stats
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#98E32F] rounded-t-full"></div>}
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <UtensilsCrossed className="text-[#98E32F]" /> 
                Active Menu 
                <span className="text-sm font-normal text-white/40 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{restaurantItems?.length || 0} Items</span>
              </h2>

              <div className="relative group w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#98E32F] transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..." 
                  className="w-full bg-[#002833] border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:border-[#98E32F]/50 outline-none transition-all placeholder:text-white/20 text-sm"
                />
              </div>
           </div>

           {restaurantItems?.length === 0 ? (
             <div className="bg-white/5 border border-dashed border-white/10 rounded-[2rem] p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
                  <UtensilsCrossed size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">No Items Assigned</h3>
                <p className="text-white/40 max-w-md mx-auto mb-6">This restaurant doesn&apos;t have any menu items assigned to it yet. Go to the main Menu Library to assign items.</p>

                <Link href="/menu" className="inline-flex items-center gap-2 bg-[#98E32F] text-[#013644] px-6 py-3 rounded-xl font-bold hover:bg-[#86c929] transition-all">
                   Go to Menu Library <ArrowLeft size={16} className="rotate-180" />
                </Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {restaurantItems?.map(item => (
                  <div key={item._id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl p-4 flex gap-4 group transition-all">
                     <div className="w-24 h-24 bg-white/5 rounded-2xl relative overflow-hidden shrink-0">
                        {item.image ? (
                           <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-white/20">
                              <UtensilsCrossed size={24} />
                           </div>
                        )}
                     </div>
                     <div className="flex-1 py-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#98E32F] uppercase tracking-wider mb-1 block">{item.category}</span>
                            <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                          </div>
                          <div className={`w-2 h-2 rounded-full mt-2 ${item.isActive ? 'bg-[#98E32F] shadow-[0_0_10px_#98E32F]' : 'bg-red-500'}`}></div>
                        </div>
                        
                        <p className="text-white/40 text-xs line-clamp-2 mt-1 mb-3">{item.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                           <span className="font-bold text-lg">₹{item.price}</span>
                           <button
                              onClick={() => handleRemoveFromRestaurant(item._id)}
                              className="p-2 rounded-xl transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              title="Remove from Restaurant"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="text-center py-20 bg-white/2 border border-dashed border-white/5 rounded-[3rem]">
           <Layers className="mx-auto text-white/20 mb-4" size={48} />
           <h3 className="text-2xl font-bold mb-2">Overview Coming Soon</h3>
           <p className="text-white/40">Performance stats and order analytics will appear here.</p>
        </div>
      )}
    </div>
  );
}
