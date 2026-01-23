export interface Category {
  _id: string;
  name: string;
  image?: string;
  parent?: string | null;
  owner: string;
  createdAt: string;
  updatedAt: string;
}
