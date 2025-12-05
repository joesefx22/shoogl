'use client';

import React, { useState, useEffect } from 'react';
import BookingsList from './components/BookingsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Filter, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

export default function PlayerBookingsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });

  const filters = [
    { id: 'all', label: 'كل الحجوزات', count: stats.total },
    { id: 'pending', label: 'قيد الانتظار', count: stats.pending },
    { id: 'confirmed', label: 'مؤكدة', count: stats.confirmed },
    { id: 'cancelled', label: 'ملغية', count: stats.cancelled },
    { id: 'completed', label: 'مكتملة', count: stats.completed },
  ];

  const loadBookings = async () => {
    try {
      setLoading(true);
      // سيتم جلب البيانات من API في الـ hook
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, activeFilter]);

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
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button>
                <Calendar className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
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
            <BookingsList filter={activeFilter} onRefresh={loadBookings} />
          </>
        )}
      </div>
    </div>
  );
}
