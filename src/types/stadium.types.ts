export interface Stadium {
  id: string;
  name: string;
  type: 'football' | 'paddle';
  description?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    district?: string;
  };
  pricePerHour: number;
  deposit: number; // percentage or fixed amount
  features: string[];
  images: string[];
  amenities: string[];
  rules?: string[];
  ownerId: string;
  staffIds: string[];
  slots?: StadiumSlot[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Statistics
  averageRating?: number;
  totalRatings?: number;
  totalBookings?: number;
  capacity: number;
  openingHours: {
    from: string;
    to: string;
  };
}

export interface StadiumSlot {
  id: string;
  stadiumId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'reserved' | 'maintenance';
  price: number;
  capacity: number;
  bookedBy?: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StadiumFilters {
  type?: 'football' | 'paddle';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  date?: string;
  time?: string;
  sortBy?: 'price' | 'rating' | 'distance' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StadiumSearchResult {
  stadiums: Stadium[];
  total: number;
  page: number;
  totalPages: number;
  filters: StadiumFilters;
}

export interface Booking {
  id: string;
  stadiumId: string;
  userId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  price: number;
  depositPaid: number;
  totalPaid: number;
  paymentMethod: 'online' | 'cash' | 'code';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  playersCount: number;
  notes?: string;
  voucherCode?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  stadium?: Stadium;
  user?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}
