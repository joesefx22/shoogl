'use client';

import React, { useState, useEffect } from 'react';
import BookingCard from './BookingCard';
import { usePlayerBookings } from '../hooks/usePlayerBookings';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar, Filter, Search } from 'lucide-react';
import { InputField } from '@/components/ui/InputField';

interface BookingsListProps {
  filter: string;
  onRefresh: () => void;
}

const BookingsList: React.FC<BookingsListProps> = ({ filter, onRefresh }) => {
  const { bookings, loading, error, refreshBookings } = usePlayerBookings(filter);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bookings based on search
  const filteredBookings = bookings.filter(booking =>
    booking.stadiumName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.date.includes(searchQuery)
  );

  const handleBookingUpdated = () => {
    refreshBookings();
    onRefresh();
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refreshBookings}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          حاول مرة أخرى
        </button>
      </div>
    );
  }

  if (bookings.length === 0 && !loading) {
    return (
      <EmptyState
        icon={<Calendar className="h-12 w-12 text-gray-400" />}
        title="لا توجد حجوزات"
        description={filter === 'all' 
          ? 'لم تقم بأي حجوزات بعد'
          : `لا توجد حجوزات ${getFilterLabel(filter)}`
        }
        action={{
          label: 'احجز الآن',
          href: '/stadiums',
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن حجز باسم الملعب أو الرقم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onUpdated={handleBookingUpdated}
          />
        ))}
      </div>

      {/* Pagination (if needed) */}
      {bookings.length > 0 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            عرض {filteredBookings.length} من أصل {bookings.length} حجز
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              السابق
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function getFilterLabel(filter: string): string {
  const labels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكدة',
    cancelled: 'ملغية',
    completed: 'مكتملة',
    all: 'جميع',
  };
  return labels[filter] || filter;
}

export default BookingsList;
