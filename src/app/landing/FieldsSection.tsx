'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Stadium } from '@/types';

interface FieldsSectionProps {
  title: string;
  stadiums: Stadium[];
  loading: boolean;
  onViewAll: () => void;
  onViewStadium: (id: string) => void;
  sportType: 'football' | 'paddle';
}

/**
 * مقطع يعرض الملاعب المميزة
 */
const FieldsSection: React.FC<FieldsSectionProps> = ({
  title,
  stadiums,
  loading,
  onViewAll,
  onViewStadium,
  sportType,
}) => {
  const router = useRouter();

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // إذا لم توجد ملاعب
  if (stadiums.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {title}
        </h2>
        <Card className="p-12 max-w-md mx-auto">
          <div className="text-5xl mb-4">🏟️</div>
          <h3 className="text-xl font-semibold mb-2">لا توجد ملاعب حالياً</h3>
          <p className="text-gray-600 mb-6">
            {sportType === 'football' 
              ? 'سيتم إضافة ملاعب كرة قدم قريباً'
              : 'سيتم إضافة ملاعب بادل قريباً'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/owner/stadiums/new')}
          >
            أضف ملعبك الأول
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          {title}
        </h2>
        <Button 
          variant="ghost" 
          onClick={onViewAll}
          className="text-primary hover:text-primary/80"
        >
          عرض جميع الملاعب →
        </Button>
      </div>

      {/* Stadiums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => (
          <Card 
            key={stadium.id} 
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
            onClick={() => onViewStadium(stadium.id)}
          >
            {/* Stadium Image */}
            <div className="relative h-48 overflow-hidden">
              <div 
                className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:scale-105 transition-transform duration-500"
                style={{
                  backgroundImage: stadium.image 
                    ? `url(${stadium.image})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {!stadium.image && (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                    {sportType === 'football' ? '⚽' : '🎾'}
                  </div>
                )}
              </div>
              
              {/* Rating Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900">
                  {stadium.rating || '4.5'}
                </span>
              </div>
              
              {/* Sport Type Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold text-white ${
                sportType === 'football' 
                  ? 'bg-primary' 
                  : 'bg-secondary'
              }`}>
                {sportType === 'football' ? 'كرة قدم' : 'بادل'}
              </div>
            </div>

            {/* Stadium Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {stadium.name}
              </h3>
              
              {/* Location */}
              <div className="flex items-center text-gray-600 mb-3">
                <MapPin className="w-4 h-4 ml-1" />
                <span className="text-sm truncate">{stadium.location || 'موقع غير محدد'}</span>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {stadium.features?.slice(0, 3).map((feature, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
                {stadium.features && stadium.features.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{stadium.features.length - 3} أكثر
                  </span>
                )}
              </div>
              
              {/* Price and Availability */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stadium.pricePerHour?.toLocaleString() || '--'} 
                    <span className="text-sm font-normal text-gray-600"> ج.م/ساعة</span>
                  </div>
                  <div className="text-xs text-gray-500">سعر الساعة</div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">متاح</span>
                  </div>
                  <div className="text-xs text-gray-500">اليوم</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View All Button (Mobile) */}
      <div className="mt-8 text-center md:hidden">
        <Button 
          variant="primary" 
          onClick={onViewAll}
          className="w-full"
        >
          عرض جميع الملاعب
        </Button>
      </div>
    </div>
  );
};

export default FieldsSection;
