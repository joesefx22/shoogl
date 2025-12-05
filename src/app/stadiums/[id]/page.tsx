'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Stadium, StadiumSlot } from '@/types/stadium.types';
import { stadiumService } from '@/lib/services/stadium.service';
import SlotPicker from '@/components/stadiums/SlotPicker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { MapPin, Phone, Mail, Star, Clock, Users } from 'lucide-react';
import ImageGallery from '@/components/stadiums/ImageGallery';

export default function StadiumDetailsPage() {
  const params = useParams();
  const stadiumId = params.id as string;
  
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [slots, setSlots] = useState<StadiumSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    loadStadiumDetails();
  }, [stadiumId]);

  useEffect(() => {
    if (selectedDate && stadium) {
      loadSlots();
    }
  }, [selectedDate, stadium]);

  const loadStadiumDetails = async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      
      const [stadiumData, slotsData] = await Promise.all([
        stadiumService.getStadiumById(stadiumId),
        stadiumService.getAvailableSlots(stadiumId, dateStr)
      ]);
      
      setStadium(stadiumData);
      setSlots(slotsData || []);
      setSelectedDate(dateStr);
    } catch (error) {
      console.error('Error loading stadium details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!stadium) return;
    
    try {
      setLoadingSlots(true);
      const slotsData = await stadiumService.getAvailableSlots(stadium.id, selectedDate);
      setSlots(slotsData || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الملعب غير موجود</h2>
          <p className="text-gray-600 dark:text-gray-400">قد يكون الملعب قد تم إزالته أو الرابط غير صحيح</p>
        </div>
      </div>
    );
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum < 12 ? `${time} ص` : `${time} م`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 rtl:space-x-reverse md:space-x-3">
              <li>
                <a href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  الرئيسية
                </a>
              </li>
              <li>
                <span className="mx-2 text-gray-400">/</span>
                <a 
                  href={`/stadiums?type=${stadium.type}`} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {stadium.type === 'football' ? 'ملاعب كرة القدم' : 'ملاعب البادل'}
                </a>
              </li>
              <li>
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-700 dark:text-gray-300">{stadium.name}</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Stadium Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Images */}
              <div className="lg:w-1/2">
                <ImageGallery images={stadium.images || []} stadiumName={stadium.name} />
              </div>
              
              {/* Details */}
              <div className="lg:w-1/2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {stadium.name}
                    </h1>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                      <MapPin className="h-5 w-5 ml-1 rtl:mr-1 rtl:ml-0" />
                      <span>{stadium.location.address}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stadium.type === 'football' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {stadium.type === 'football' ? 'كرة قدم' : 'بادل'}
                  </span>
                </div>

                {/* Rating & Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center text-yellow-500 mb-1">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="mr-1 rtl:ml-1 rtl:mr-0 font-bold">4.8</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">التقييم العام</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
                      <Clock className="h-5 w-5" />
                      <span className="mr-1 rtl:ml-1 rtl:mr-0 font-bold">{stadium.pricePerHour}</span>
                      <span className="text-sm">ج.م/ساعة</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">السعر</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1">
                      <Users className="h-5 w-5" />
                      <span className="mr-1 rtl:ml-1 rtl:mr-0 font-bold">22</span>
                      <span className="text-sm">لاعب</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">سعة الملعب</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">المميزات</h3>
                  <div className="flex flex-wrap gap-2">
                    {stadium.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">معلومات الاتصال</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Phone className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                      <span>+20 123 456 7890</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                      <span>info@{stadium.name.replace(/\s+/g, '').toLowerCase()}.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">احجز موعدك</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              اختر التاريخ والوقت المناسبين
            </div>
          </div>

          {/* Date Picker */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              اختر التاريخ
            </label>
            <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2">
              {[...Array(7)].map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' });
                const dayNumber = date.getDate();
                const month = date.toLocaleDateString('ar-EG', { month: 'short' });
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 transition-all ${
                      selectedDate === dateStr
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                    }`}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">{dayName}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{dayNumber}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{month}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">الأوقات المتاحة</h3>
              {loadingSlots && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <LoadingSpinner size="sm" className="ml-2 rtl:mr-2 rtl:ml-0" />
                  جاري تحميل الأوقات...
                </div>
              )}
            </div>
            
            <SlotPicker 
              slots={slots} 
              stadium={stadium}
              date={selectedDate}
              onSlotsUpdate={loadSlots}
            />
            
            {slots.length === 0 && !loadingSlots && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">لا توجد أوقات متاحة لهذا اليوم</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  حاول اختيار يوم آخر أو التواصل مع إدارة الملعب
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" size="lg">
                ⚡ احجز الآن
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
                📞 تواصل مع الإدارة
              </Button>
              <Button variant="outline" className="flex-1" size="lg">
                📍 افتح في خرائط جوجل
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section (Placeholder) */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">تقييمات المستخدمين</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              سيتم إضافة قسم التقييمات قريباً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
