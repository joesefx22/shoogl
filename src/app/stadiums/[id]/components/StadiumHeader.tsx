import React from 'react';
import { Stadium } from '@/types/stadium.types';
import { ArrowLeft, Share2, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ImageGallery from '@/components/stadiums/ImageGallery';

interface StadiumHeaderProps {
  stadium: Stadium;
}

export const StadiumHeader: React.FC<StadiumHeaderProps> = ({ stadium }) => {
  const handleBack = () => {
    window.history.back();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stadium.name,
        text: `احجز ${stadium.name} عبر احجزلي`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-primary to-primary-dark">
        {stadium.images && stadium.images.length > 0 ? (
          <img
            src={stadium.images[0]}
            alt={stadium.name}
            className="w-full h-full object-cover opacity-30"
          />
        ) : null}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Header Content */}
        <div className="absolute inset-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                العودة
              </Button>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stadium Info */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stadium.type === 'football' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {stadium.type === 'football' ? 'كرة قدم' : 'بادل'}
                  </span>
                  <div className="flex items-center mr-4 rtl:ml-4 rtl:mr-0">
                    <Star className="h-4 w-4 text-yellow-400 fill-current ml-1 rtl:mr-1 rtl:ml-0" />
                    <span className="text-white font-bold">{stadium.rating.toFixed(1)}</span>
                    <span className="text-white/80 mr-1 rtl:ml-1 rtl:mr-0">({stadium.totalRatings})</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stadium.name}
                </h1>
                
                <p className="text-white/90 text-lg">
                  {stadium.location.address}
                </p>
              </div>

              <div className="hidden md:block text-right">
                <p className="text-4xl font-bold text-white">
                  {stadium.pricePerHour} <span className="text-lg">ج.م/ساعة</span>
                </p>
                <p className="text-white/80">
                  شامل {stadium.deposit}% عربون
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {stadium.images && stadium.images.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <ImageGallery 
            images={stadium.images} 
            stadiumName={stadium.name} 
          />
        </div>
      )}
    </div>
  );
};
