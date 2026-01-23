export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  restaurant?: {
    _id: string;
    name: string;
  };
  replied?: boolean;
}
