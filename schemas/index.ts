import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z.string().min(3, 'Restaurant name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email('Invalid support email'),
  contactNumber: z.string().min(10, 'Invalid contact number'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'Invalid zip code'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  legalDocs: z.object({
    fssaiLicenseNumber: z.string().min(14, '14-digit FSSAI number is required').max(14),
    fssaiCertificateUrl: z.string().optional(),
    panNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    gstCertificateUrl: z.string().optional(),
    tradeLicenseNumber: z.string().optional(),
    tradeLicenseUrl: z.string().optional(),
    healthCertificateUrl: z.string().optional(),
  }),
  image: z.string().optional(),
  isManualOverride: z.boolean(),
  openingHours: z.array(z.object({
    day: z.number().min(0).max(6),
    openTime: z.string(),
    closeTime: z.string(),
    isClosed: z.boolean(),
  })),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(10, 'Description is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().min(0, 'Variant price cannot be negative'),
  })).optional(),
  category: z.string().min(1, 'Category is required'),
  isVeg: z.boolean(),
  isActive: z.boolean(),
  image: z.string().optional(),
  ingredients: z.array(z.string().min(1, 'Ingredient name is required')).optional(),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;
