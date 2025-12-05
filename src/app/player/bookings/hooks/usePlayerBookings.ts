import { useState, useEffect, useCallback } from 'react';
import { Booking } from '@/types/stadium.types';
import { useAuth } from '@/hooks/auth/useAuth';

interface UsePlayerBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  refreshBookings: () => Promise<void>;
}

export const usePlayerBookings = (filter: string = 'all'): UsePlayerBookingsReturn => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/player/bookings?userId=${user.id}&filter=${filter}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل الحجوزات');
      }

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
        setStats(data.stats || stats);
      } else {
        throw new Error(data.message || 'حدث خطأ');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const refreshBookings = async () => {
    await loadBookings();
  };

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter.toLowerCase();
  });

  return {
    bookings: filteredBookings,
    loading,
    error,
    stats,
    refreshBookings,
  };
};

// API Helper function
export const playerBookingsAPI = {
  async getBookings(userId: string, filter?: string) {
    const params = new URLSearchParams({ userId });
    if (filter && filter !== 'all') params.append('status', filter);
    
    const response = await fetch(`/api/player/bookings?${params.toString()}`);
    return response.json();
  },

  async cancelBooking(bookingId: string, reason: string) {
    const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  async rescheduleBooking(bookingId: string, newDate: string, newSlotId: string) {
    const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDate, newSlotId }),
    });
    return response.json();
  },
};
