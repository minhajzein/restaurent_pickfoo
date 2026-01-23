import { MenuItemFormData } from '@/schemas';
import { Restaurant } from './restaurant';

export interface MenuItem extends MenuItemFormData {
  _id: string;
  owner: string;
  restaurants: (string | Restaurant)[];
  createdAt: string;
  updatedAt: string;
}
