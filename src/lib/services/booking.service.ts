import { api } from '@/lib/api';

export interface BookingRequest {
  stadiumId: string;
  slotId: string;
  date: string;
  user: {
    name: string;
    phone: string;
    email?: string;
  };
  playersCount?: number;
  notes?: string;
  paymentMethod: 'online' | 'cash' | 'code';
  voucherCode?: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  data?: {
    bookingId: string;
    requiresPayment: boolean;
    paymentUrl?: string;
    amount?: number;
  };
}

class BookingService {
  async createBooking(data: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await api.post<BookingResponse>('/api/bookings/create', data);
      return response;
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء إنشاء الحجز',
      };
    }
  }

  async getBookingById(id: string) {
    return api.get(`/api/bookings/${id}`);
  }

  async cancelBooking(id: string, reason?: string) {
    return api.post(`/api/bookings/${id}/cancel`, { reason });
  }

  async getUserBookings(userId: string) {
    return api.get(`/api/users/${userId}/bookings`);
  }

  async updateBookingStatus(id: string, status: string) {
    return api.patch(`/api/bookings/${id}/status`, { status });
  }

  async checkSlotAvailability(stadiumId: string, date: string, slotId: string) {
    return api.get(`/api/stadiums/${stadiumId}/slots/${slotId}/availability?date=${date}`);
  }
}

export const bookingService = new BookingService();
