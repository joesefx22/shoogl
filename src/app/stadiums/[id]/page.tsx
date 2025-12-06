'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StadiumHeader } from './components/StadiumHeader';
import { SlotsGrid } from './components/SlotsGrid';
import { MapDirections } from './components/MapDirections';
import { BookingModal } from '@/components/stadiums/BookingModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useStadiumDetail } from './hooks/useStadiumDetail';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Users,
  ChevronLeft,
  Share2,
  Heart,
  AlertCircle
} from 'lucide-react';
import { getNotificationService } from '@/lib/services/notification.service';

export default function StadiumDetailPage() {
  const params = useParams();
  const stadiumId = params.id as string;
  const { user } = useAuth();
  
  const {
    stadium,
    days,
    selectedDay,
    selectedSlot,
    loading,
    error,
    selectDay,
    selectSlot,
    loadStadiumData,
  } = useStadiumDetail(stadiumId);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, [stadiumId, user]);

  const checkIfFavorite = async () => {
    if (!user || !stadiumId) return;
    
    try {
      const response = await fetch(`/api/favorites/check?stadiumId=${stadiumId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('يجب تسجيل الدخول لإضافة إلى المفضلة');
      return;
    }

    setFavoriteLoading(true);
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stadiumId }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && stadium) {
      try {
        await navigator.share({
          title: stadium.name,
          text: `احجز ${stadium.name} عبر احجزلي - ${stadium.location.address}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('تم نسخ الرابط إلى الحافظة');
  };

  const handleBookNow = () => {
    if (!user) {
      alert('يجب تسجيل الدخول لحجز ملعب');
      return;
    }
    
    if (selectedSlot) {
      setIsBookingModalOpen(true);
    } else {
      alert('يرجى اختيار وقت للحجز أولاً');
    }
  };

  const handleBookingSuccess = () => {
    loadStadiumData(); // إعادة تحميل البيانات
    selectSlot(null); // إعادة تعيين الساعة المختارة
    
    // إرسال إشعار
    if (user && stadium) {
      const notificationService = getNotificationService();
      notificationService.createNotification(user.id, {
        type: 'BOOKING_CREATED',
        title: 'تم إنشاء الحجز',
        message: `تم إنشاء حجز في ${stadium.name}`,
        sendEmail: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !stadium) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'الملعب غير موجود'}
          </h2>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="mt-4"
          >
            <ChevronLeft className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
            العودة للخلف
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <StadiumHeader stadium={stadium} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                  مشاركة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                >
                  <Heart className={`h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'مفضل' : 'حفظ'}
                </Button>
              </div>
              
              <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500 fill-current ml-2 rtl:mr-2 rtl:ml-0" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {stadium.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 mr-2 rtl:ml-2 rtl:mr-0">
                  ({stadium.totalRatings} تقييم)
                </span>
              </div>
            </div>

            {/* Booking Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    اختر موعدك
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    اختر اليوم والوقت المناسبين
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
                  <span>عرض 7 أيام قادمة</span>
                </div>
              </div>

              {/* Days Selection */}
              <div className="mb-8">
                <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-4">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => selectDay(day.date)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-24 rounded-xl border-2 transition-all ${
                        selectedDay === day.date
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary'
                      }`}
                    >
                      <span className={`text-sm ${
                        day.isToday 
                          ? 'text-primary font-bold' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {day.isToday ? 'اليوم' : day.dayName}
                      </span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white my-1">
                        {day.dayNumber}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {day.monthShort} {day.year}
                      </span>
                      {day.hasAvailableSlots && (
                        <div className="mt-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Slots */}
              <SlotsGrid
                slots={days.find(d => d.date === selectedDay)?.slots || []}
                selectedSlot={selectedSlot}
                onSelectSlot={selectSlot}
                stadium={stadium}
              />

              {/* Booking Actions */}
              {selectedSlot && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedSlot.startTime} - {selectedSlot.endTime}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stadium.name} • {new Date(selectedDay).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stadium.pricePerHour} ج.م
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          شامل {stadium.deposit}% عربون
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="px-8"
                        onClick={handleBookNow}
                      >
                        تأكيد الحجز
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                معلومات الاتصال
              </h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary ml-3 rtl:mr-3 rtl:ml-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الهاتف</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stadium.contact.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary ml-3 rtl:mr-3 rtl:ml-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stadium.contact.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary ml-3 rtl:mr-3 rtl:ml-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">السعة القصوى</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {stadium.capacity} لاعب
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-primary ml-2 rtl:mr-2 rtl:ml-0" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  الموقع
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {stadium.location.address}
              </p>
              <MapDirections
                location={stadium.location}
                stadiumName={stadium.name}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        stadium={stadium}
        selectedSlot={selectedSlot}
        selectedDate={selectedDay}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
