import { RestaurantFormData } from '@/schemas';

export interface Restaurant extends RestaurantFormData {
  _id: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected' | 'inactive';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Metadata
  isOpen: boolean;
  resetOverride?: boolean;
  rating?: number;
  numReviews?: number;
}
