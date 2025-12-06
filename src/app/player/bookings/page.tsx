'use client';

import React, { useState, useEffect } from 'react';
import BookingsList from './components/BookingsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Filter, Calendar, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { getNotificationService } from '@/lib/services/notification.service';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export default function PlayerBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const filters = [
    { id: 'all', label: 'كل الحجوزات', count: stats.total },
    { id: 'pending', label: 'قيد الانتظار', count: stats.pending },
    { id: 'confirmed', label: 'مؤكدة', count: stats.confirmed },
    { id: 'cancelled', label: 'ملغية', count: stats.cancelled },
    { id: 'completed', label: 'مكتملة', count: stats.completed },
  ];

  const loadBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/player/bookings?status=${activeFilter}`);
      
      if (!response.ok) {
        throw new Error('فشل في تحميل الحجوزات');
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'حدث خطأ في جلب البيانات');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    if (!user) return;
    
    try {
      const notificationService = getNotificationService();
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBookings(), loadUnreadNotifications()]);
    setRefreshing(false);
  };

  const handleBookNew = () => {
    router.push('/stadiums');
  };

  useEffect(() => {
    if (user) {
      Promise.all([loadBookings(), loadUnreadNotifications()]);
    }
  }, [user, activeFilter]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            يرجى تسجيل الدخول
          </h2>
          <Button onClick={() => router.push('/login')}>
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                حجوزاتي
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                إدارة وتتبع جميع حجوزاتك
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3 rtl:space-x-reverse">
              {unreadNotifications > 0 && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/notifications')}
                  className="relative"
                >
                  🔔
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button onClick={handleBookNew}>
                <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                احجز جديدة
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  activeFilter === filter.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                onClick={() => setActiveFilter(filter.id as BookingStatus)}
              >
                <div className="text-2xl font-bold">{filter.count}</div>
                <div className="text-sm mt-1">{filter.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as BookingStatus)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Bookings List */}
            <BookingsList 
              filter={activeFilter} 
              onRefresh={() => {
                loadBookings();
                loadUnreadNotifications();
              }} 
            />
          </>
        )}
      </div>
    </div>
  );
}
