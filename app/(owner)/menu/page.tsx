'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Plus,
  Search,
  Store,
  ImageIcon,
  X,
  IndianRupee,
  ChevronRight,
  UtensilsCrossed,
  Tag,
  AlignLeft,
  Edit2,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, type MenuItemFormData } from '@/schemas';
import { useMenu } from '@/hooks/useMenu';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { Restaurant } from '@/types/restaurant';
import { MenuItem } from '@/types/menu';
import { uploadFile } from '@/lib/upload';


import ConfirmationModal from '@/components/ConfirmationModal';

export default function OwnerMenuPage() {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ 
    isOpen: boolean; 
    type: 'item' | 'category'; 
    id: string; 
    name: string 
  }>({
    isOpen: false,
    type: 'item',
    id: '',
    name: ''
  });

  const { useMyMenu, createMenuItem, updateMenuItem, deleteMenuItem, assignToRestaurants } = useMenu();
  const { useMyRestaurants } = useRestaurants();
  const { useMyCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const { data: menuItems, isLoading: isMenuLoading } = useMyMenu();
  const { data: restaurants } = useMyRestaurants();
  const { data: categories } = useMyCategories();

  // ... (keep categories state) ...
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('root');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryImage, setEditingCategoryImage] = useState('');
  
  // Image states
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Sync state
  const [selectedItemForSync, setSelectedItemForSync] = useState<MenuItem | null>(null);
  const [syncedRestaurants, setSyncedRestaurants] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    control // Add control to destructured properties
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      variants: [],
      isVeg: true,
      isActive: true,
      image: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const handleCloseModal = () => {
    setIsAddItemModalOpen(false);
    reset();
    setEditingItemId(null);
    setImageUrl('');
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItemId(item._id);
    setValue('name', item.name);
    setValue('description', item.description);
    setValue('category', item.category);
    setValue('price', item.price);
    setValue('isVeg', item.isVeg);
    setValue('isActive', item.isActive);
    
    // Check if variants exist and set them, otherwise empty array
    if (item.variants && item.variants.length > 0) {
      setValue('variants', item.variants);
    } else {
      setValue('variants', []);
    }
    
    if (item.image) {
      setImageUrl(item.image);
      setValue('image', item.image);
    } else {
      setImageUrl('');
      setValue('image', '');
    }

    setIsAddItemModalOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'item',
      id: item._id,
      name: item.name
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirmation.type === 'item') {
        await deleteMenuItem.mutateAsync(deleteConfirmation.id);
         toast.success('Menu item deleted');
      } else if (deleteConfirmation.type === 'category') {
        await deleteCategory.mutateAsync(deleteConfirmation.id);
        toast.success('Category deleted');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const url = await uploadFile(file, 'menu-items');
      setImageUrl(url);
      setValue('image', url);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      if (editingItemId) {
        await updateMenuItem.mutateAsync({ id: editingItemId, data });
        toast.success('Menu item updated successfully!');
      } else {
        await createMenuItem.mutateAsync(data);
        toast.success('Master item created successfully!');
      }
      handleCloseModal();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save menu item';
      toast.error(errorMessage);
    }
  };


  const handleSync = async (itemId: string) => {
    try {
      await assignToRestaurants.mutateAsync({ id: itemId, restaurantIds: syncedRestaurants });
      toast.success('Synced successfully!');
      setSelectedItemForSync(null);
      setSyncedRestaurants([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Sync failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Menu Library</h2>
          <p className="text-white/60">Manage items and sync them across all your restaurants.</p>
        </div>
        <button 
          onClick={() => {
            setEditingItemId(null);
            reset();
            setImageUrl('');
            setIsAddItemModalOpen(true)
          }}
          className="bg-[#98E32F] text-[#013644] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#86c929] transition-all"
        >
          <Plus size={20} />
          Add Item to Library
        </button>
      </div>

      {/* Filters (Can be expanded functionality later) */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* ... existing filters ... */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:border-[#98E32F] outline-none transition-colors"
          />
        </div>
         <div className="flex gap-2">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl hover:bg-white/10"
          >
            <Tag size={18} />
            Categories
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {isMenuLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl h-44 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {menuItems?.map((item: MenuItem) => (
            <div key={item._id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex gap-6 group hover:border-[#98E32F]/30 transition-all relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden shrink-0 relative bg-white/5">
                <Image 
                  src={item.image || 'https://images.unsplash.com/photo-1626132646529-500637532537'} 
                  alt={item.name} 
                  fill
                  className={`object-cover group-hover:scale-110 transition-transform duration-500 ${!item.isActive ? 'grayscale' : ''}`} 
                />
                {!item.isActive && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <span className="text-[10px] font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Draft</span>
                   </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold truncate" title={item.name}>{item.name}</h3>
                        <div className={`shrink-0 w-3 h-3 rounded-sm border ${item.isVeg ? 'border-green-500 flex items-center justify-center p-[1px]' : 'border-red-500 flex items-center justify-center p-[1px]'}`}>
                          <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                      <p className="text-white/40 text-xs truncate">{item.category}</p>
                    </div>
                    <div>
                      {item.variants && item.variants.length > 0 ? (
                         <div className="text-right">
                           <p className="text-lg font-bold text-[#98E32F] whitespace-nowrap">
                             <span className="text-[10px] text-white/40 font-normal mr-1">From</span>
                             ₹{Math.min(...item.variants.map(v => v.price))}
                           </p>
                         </div>
                      ) : (
                        <p className="text-lg font-bold text-[#98E32F] whitespace-nowrap">₹{item.price}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 mb-2">
                    {item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.variants.map((v, idx) => (
                           <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-white/50">
                             {v.name}
                           </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5 h-16 overflow-y-auto custom-scrollbar content-start">
                    {item.restaurants?.length === 0 && (
                      <span className="text-[10px] text-white/20 italic">Not synced to any restaurant</span>
                    )}
                    {item.restaurants?.map((res) => {
                      if (typeof res === 'string') return null;
                      return (
                        <span key={res._id} className="bg-white/5 border border-white/5 text-[10px] text-white/50 px-2 py-1 rounded-lg flex items-center gap-1 whitespace-nowrap">
                          <Store size={10} /> {res.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                   <button 
                      onClick={() => {
                        setSelectedItemForSync(item);
                        setSyncedRestaurants(item.restaurants?.map((r) => (typeof r === 'string' ? r : r._id)) || []);
                      }}
                      className="text-[10px] text-[#98E32F] hover:underline font-bold flex items-center gap-1"
                    >
                      + Sync
                    </button>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Item Placeholder */}
          <button 
            onClick={() => setIsAddItemModalOpen(true)}
            className="bg-white/2 border-2 border-dashed border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-2 text-white/20 hover:border-[#98E32F]/50 hover:bg-[#98E32F]/5 transition-all group min-h-[176px]"
          >
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <span className="font-bold text-lg">Add New Menu Item</span>
            <span className="text-xs">Create once, use everywhere</span>
          </button>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#013644]/95 backdrop-blur-md" onClick={() => setIsAddItemModalOpen(false)}></div>
          
          <div className="relative bg-[#002833] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                    <UtensilsCrossed size={24} className="text-[#98E32F]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Add Item to Library</h3>
                    <p className="text-white/40 text-[11px] uppercase tracking-widest font-bold">Master Menu Creation</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Media Section */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98E32F]">Item Preview</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#98E32F]/20 to-transparent"></div>
                  </div>
                  
                   <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative group">
                      <input 
                        type="file" 
                        id="menu-item-image"
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label 
                        htmlFor="menu-item-image"
                        className={`w-full md:w-44 h-44 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden ${
                          imageUrl ? 'border-[#98E32F]/50 bg-[#98E32F]/5' : 'bg-white/5 border-white/10 hover:border-[#98E32F]/50 hover:bg-[#98E32F]/5'
                        }`}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="animate-spin text-[#98E32F]" size={24} />
                        ) : imageUrl ? (
                          <div className="relative w-full h-full group">
                            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-[#013644]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Plus className="text-white" size={24} />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-white/5 rounded-full text-white/20 group-hover:text-[#98E32F] group-hover:bg-[#98E32F]/10 transition-all">
                              <ImageIcon size={24} />
                            </div>
                            <div className="text-center px-4">
                              <span className="text-[10px] text-white/40 font-bold group-hover:text-white">Upload Image</span>
                              <p className="text-[8px] text-white/20 mt-1 uppercase">1:1 Ratio Recommended</p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase tracking-wider ml-1">Item Name</label>
                        <div className="relative group">
                          <UtensilsCrossed className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-red-500' : 'text-white/20 group-focus-within:text-[#98E32F]'}`} size={18} />
                          <input 
                            {...register('name')}
                            type="text" 
                            className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-3.5 focus:bg-[#98E32F]/5 outline-none transition-all placeholder:text-white/10 ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-[#98E32F]/50'}`}
                            placeholder="e.g. Traditional Malabar Biryani" 
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.name.message}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-white/30 block uppercase tracking-wider ml-1">Category</label>
                            <button 
                              type="button" 
                              onClick={() => setIsCategoryModalOpen(true)}
                              className="text-[10px] font-bold text-[#98E32F] hover:underline flex items-center gap-1"
                            >
                              <Plus size={10} /> Manage
                            </button>
                          </div>
                          <div className="relative group">
                            <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.category ? 'text-red-500' : 'text-white/20 group-focus-within:text-[#98E32F]'}`} size={18} />
                            <select 
                              {...register('category')}
                              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-3.5 focus:bg-[#98E32F]/5 outline-none appearance-none cursor-pointer ${errors.category ? 'border-red-500/50' : 'border-white/10 focus:border-[#98E32F]/50'}`}
                            >
                              <option className="bg-[#002833]" value="">Select Category</option>
                              {categories?.map((cat) => (
                                <option key={cat._id} className="bg-[#002833]" value={cat.name}>{cat.name}</option>
                              ))}
                              {(!categories || categories.length === 0) && (
                                <>
                                  <option className="bg-[#002833]">Main Course</option>
                                  <option className="bg-[#002833]">Starters</option>
                                  <option className="bg-[#002833]">Breads</option>
                                  <option className="bg-[#002833]">Beverages</option>
                                </>
                              )}
                            </select>
                          </div>
                          {errors.category && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.category.message}</p>}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase tracking-wider ml-1">Base Price</label>
                          <div className="relative group">
                            <IndianRupee className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.price ? 'text-red-500' : 'text-white/20 group-focus-within:text-[#98E32F]'}`} size={18} />
                            <input 
                              {...register('price', { valueAsNumber: true })}
                              type="number" 
                              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-3.5 focus:bg-[#98E32F]/5 outline-none transition-all ${errors.price ? 'border-red-500/50' : 'border-white/10 focus:border-[#98E32F]/50'}`}
                              placeholder="0.00" 
                            />
                          </div>
                          {errors.price && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.price.message}</p>}
                        </div>
                      </div>

                      {/* Variants Section */}
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider ml-1">Portion Sizes / Variants</label>
                          <button
                            type="button"
                            onClick={() => append({ name: '', price: 0 })}
                            className="text-[10px] font-bold text-[#98E32F] hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} /> Add Variant
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-center">
                              <div className="flex-1">
                                <input
                                  {...register(`variants.${index}.name`)} 
                                  placeholder="Size (e.g. Half)" 
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-[#98E32F]/50 outline-none"
                                />
                                {errors.variants?.[index]?.name && (
                                  <p className="text-red-500 text-[9px] mt-0.5 ml-1">{errors.variants[index]?.name?.message}</p>
                                )}
                              </div>
                              <div className="w-24">
                                <input
                                  {...register(`variants.${index}.price`, { valueAsNumber: true })}
                                  type="number"
                                  placeholder="Price"
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-[#98E32F]/50 outline-none"
                                />
                                {errors.variants?.[index]?.price && (
                                  <p className="text-red-500 text-[9px] mt-0.5 ml-1">{errors.variants[index]?.price?.message}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/50 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {fields.length === 0 && (
                            <p className="text-center text-[10px] text-white/20 py-2 italic">Standard pricing (Base Price only)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Details Section */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#98E32F]">Item Composition</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#98E32F]/20 to-transparent"></div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase tracking-wider ml-1">Detailed Description</label>
                      <div className="relative group">
                        <AlignLeft className={`absolute left-4 top-4 transition-colors ${errors.description ? 'text-red-500' : 'text-white/20 group-focus-within:text-[#98E32F]'}`} size={18} />
                        <textarea 
                          {...register('description')}
                          rows={3} 
                          className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all resize-none placeholder:text-white/10 text-sm ${errors.description ? 'border-red-500/50' : 'border-white/10 focus:border-[#98E32F]/50'}`}
                          placeholder="Slow-cooked aromatic basmati rice with farm-fresh spices..." 
                        />
                      </div>
                      {errors.description && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-white/30 mb-3 block uppercase tracking-wider ml-1">Dietary Type</label>
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setValue('isVeg', true)}
                            className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${watch('isVeg') ? 'bg-[#98E32F] text-[#013644] shadow-[0_0_20px_rgba(152,227,47,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                          >
                            Veg
                          </button>
                          <button 
                            type="button"
                            onClick={() => setValue('isVeg', false)}
                            className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${!watch('isVeg') ? 'bg-[#98E32F] text-[#013644] shadow-[0_0_20px_rgba(152,227,47,0.2)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                          >
                            Non-Veg
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/30 mb-3 block uppercase tracking-wider ml-1">Serving Availability</label>
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setValue('isActive', true)}
                            className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${watch('isActive') ? 'bg-[#98E32F]/20 text-[#98E32F] border border-[#98E32F]/20' : 'text-white/40 hover:bg-white/10'}`}
                          >
                            Active
                          </button>
                          <button 
                            type="button"
                            onClick={() => setValue('isActive', false)}
                            className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${!watch('isActive') ? 'bg-[#98E32F]/20 text-[#98E32F] border border-[#98E32F]/20' : 'text-white/40 hover:bg-white/10'}`}
                          >
                            Draft
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-white/5 flex items-center justify-end gap-4 bg-white/[0.02]">
                <button 
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-6 py-3 rounded-2xl font-bold text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#98E32F] text-[#013644] px-10 py-3 rounded-2xl font-black text-sm hover:shadow-[0_0_30px_rgba(152,227,47,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingItemId ? 'Update Master Item' : 'Create Master Item')} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {selectedItemForSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#013644]/95 backdrop-blur-md" onClick={() => setSelectedItemForSync(null)}></div>
          <div className="relative bg-[#002833] border border-white/10 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center gap-4">
              <div className="p-3 bg-[#98E32F]/20 rounded-2xl text-[#98E32F]">
                <Store size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Sync to Restaurants</h3>
                <p className="text-white/40 text-xs">Select restaurants to list &quot;{selectedItemForSync.name}&quot;</p>
              </div>
            </div>

            <div className="p-8 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {restaurants?.map((res: Restaurant) => (
                <button 
                  key={res._id}
                  onClick={() => {
                    if (syncedRestaurants.includes(res._id)) {
                      setSyncedRestaurants(syncedRestaurants.filter(id => id !== res._id));
                    } else {
                      setSyncedRestaurants([...syncedRestaurants, res._id]);
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${syncedRestaurants.includes(res._id) ? 'bg-[#98E32F]/10 border-[#98E32F]/30 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <Store size={18} />
                    <span className="font-bold text-sm tracking-tight">{res.name}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${syncedRestaurants.includes(res._id) ? 'bg-[#98E32F] border-[#98E32F] text-[#013644]' : 'border-white/10 group-hover:border-white/20'}`}>
                    {syncedRestaurants.includes(res._id) && <Check size={14} strokeWidth={4} />}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-8 border-t border-white/5 flex items-center justify-end gap-4">
              <button 
                onClick={() => setSelectedItemForSync(null)}
                className="px-6 py-3 rounded-2xl font-bold text-white/40 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSync(selectedItemForSync._id)}
                disabled={assignToRestaurants.isPending}
                className="bg-[#98E32F] text-[#013644] px-10 py-3 rounded-2xl font-black text-sm hover:shadow-[0_0_30px_rgba(152,227,47,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {assignToRestaurants.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Sync Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#013644]/95 backdrop-blur-md" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="relative bg-[#002833] border border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                  <Tag size={24} className="text-[#98E32F]" />
                </div>
                <h3 className="text-xl font-bold">Manage Categories</h3>
              </div>
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              {/* Add New Category */}
              {/* Add New Category */}
              <div className="space-y-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Add New Category</label>
                
                <div className="flex gap-4">
                  {/* Image Upload */}
                  <div className="relative group shrink-0">
                    <input 
                      type="file" 
                      id="cat-image"
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           try {
                             const url = await uploadFile(file, 'categories');
                             setNewCategoryImage(url);
                             toast.success('Image uploaded');
                           } catch {
                             toast.error('Upload failed');
                           }
                         }
                      }}
                    />
                    <label 
                      htmlFor="cat-image"
                      className={`w-14 h-14 rounded-2xl border border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                        newCategoryImage ? 'border-[#98E32F]/50' : 'border-white/20 hover:border-[#98E32F]/50 hover:bg-white/5'
                      }`}
                    >
                      {newCategoryImage ? (
                        <Image src={newCategoryImage} alt="Cat" width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-white/20" />
                      )}
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                     <select
                        value={newCategoryParent}
                        onChange={(e) => setNewCategoryParent(e.target.value)}
                        className="w-full bg-[#013644] border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#98E32F]/50"
                     >
                       <option value="root">No Parent (Root Category)</option>
                       {categories?.map(cat => (
                         <option key={cat._id} value={cat._id}>{cat.name}</option>
                       ))}
                     </select>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category Name"
                        className="flex-1 bg-[#013644] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-[#98E32F]/50 outline-none transition-all placeholder:text-white/10"
                      />
                      <button 
                        onClick={async () => {
                          if (!newCategoryName.trim()) return;
                          try {
                            await createCategory.mutateAsync({ 
                              name: newCategoryName,
                              image: newCategoryImage,
                              parent: newCategoryParent === 'root' ? null : newCategoryParent
                            });
                            setNewCategoryName('');
                            setNewCategoryImage('');
                            setNewCategoryParent('root');
                            toast.success('Category added!');
                          } catch {
                            toast.error('Failed to add category');
                          }
                        }}
                        disabled={createCategory.isPending}
                        className="bg-[#98E32F] text-[#013644] px-3 rounded-xl font-bold hover:bg-[#86c929] transition-all disabled:opacity-50"
                      >
                        {createCategory.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category List */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Existing Categories</label>
                <div className="grid gap-2">
                  {(() => {
                    const renderCategoryItem = (cat: any, level: number = 0) => {
                      const children = categories?.filter(c => c.parent === cat._id) || [];
                      const isEditing = editingCategoryId === cat._id;
                      
                      return (
                        <div key={cat._id}>
                          <div 
                            className={`bg-white/5 border p-3 rounded-2xl flex items-center justify-between group transition-all mb-2 ${
                              isEditing ? 'border-[#98E32F]/30 bg-[#98E32F]/5' : 'border-white/5 hover:border-white/10'
                            }`}
                            style={{ marginLeft: `${level * 24}px` }}
                          >
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                              {/* Image or Placeholder */}
                              <div className="relative group/image shrink-0">
                                {isEditing && (
                                  <input 
                                    type="file" 
                                    id={`edit-cat-image-${cat._id}`}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={async (e) => {
                                       const file = e.target.files?.[0];
                                       if (file) {
                                         try {
                                           const url = await uploadFile(file, 'categories');
                                           setEditingCategoryImage(url);
                                           toast.success('Image uploaded');
                                         } catch {
                                           toast.error('Upload failed');
                                         }
                                       }
                                    }}
                                  />
                                )}
                                <label 
                                  htmlFor={isEditing ? `edit-cat-image-${cat._id}` : undefined}
                                  className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center ${
                                    isEditing ? 'cursor-pointer hover:border-[#98E32F]/50 ring-2 ring-transparent hover:ring-[#98E32F]/20 transition-all' : ''
                                  }`}
                                >
                                  {(isEditing ? editingCategoryImage : cat.image) ? (
                                    <Image 
                                      src={isEditing ? editingCategoryImage : cat.image} 
                                      alt={cat.name} 
                                      fill 
                                      className="object-cover" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20 font-bold bg-[#013644]">
                                      {cat.name[0]}
                                    </div>
                                  )}
                                  
                                  {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <ImageIcon size={14} className="text-white" />
                                    </div>
                                  )}
                                </label>
                              </div>

                              <div className="flex-1 min-w-0">
                                {isEditing ? (
                                  <input 
                                    autoFocus
                                    type="text"
                                    value={editingCategoryName}
                                    onChange={(e) => setEditingCategoryName(e.target.value)}
                                    className="bg-transparent border-b border-[#98E32F]/30 px-0 py-1 text-sm outline-none w-full text-white font-medium placeholder:text-white/20"
                                    placeholder="Category Name"
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        try {
                                          await updateCategory.mutateAsync({ 
                                            id: cat._id, 
                                            data: { 
                                              name: editingCategoryName,
                                              image: editingCategoryImage 
                                            } 
                                          });
                                          toast.success('Category updated');
                                          setEditingCategoryId(null);
                                        } catch {
                                          toast.error('Failed to update category');
                                        }
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                     <span className="font-medium text-sm truncate">{cat.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await updateCategory.mutateAsync({ 
                                          id: cat._id, 
                                          data: { 
                                            name: editingCategoryName,
                                            image: editingCategoryImage 
                                          } 
                                        });
                                        toast.success('Category updated');
                                        setEditingCategoryId(null);
                                      } catch {
                                        toast.error('Failed to update category');
                                      }
                                    }}
                                    className="p-2 text-[#98E32F] hover:bg-[#98E32F]/10 rounded-xl transition-all"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={() => setEditingCategoryId(null)}
                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setEditingCategoryId(cat._id);
                                      setEditingCategoryName(cat.name);
                                      setEditingCategoryImage(cat.image || '');
                                    }}
                                    className="p-2 text-white/20 hover:text-[#98E32F] hover:bg-[#98E32F]/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setDeleteConfirmation({
                                        isOpen: true,
                                        type: 'category',
                                        id: cat._id,
                                        name: cat.name
                                      });
                                    }}
                                    className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Render Children */}
                          {children.map(child => renderCategoryItem(child, level + 1))}
                        </div>
                      );
                    };

                    const roots = categories?.filter(c => !c.parent) || [];
                    if (roots.length === 0 && (!categories || categories.length === 0)) {
                       return (
                        <div className="text-center py-8 bg-white/2 border border-dashed border-white/5 rounded-3xl">
                          <p className="text-white/20 text-xs italic">No custom categories yet</p>
                        </div>
                       );
                    }
                    
                    return roots.map(root => renderCategoryItem(root));
                  })()}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmation.type === 'item' ? "Delete Menu Item" : "Delete Category"}
        message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
}
