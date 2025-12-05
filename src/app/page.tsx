'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InputField } from '@/components/ui/InputField';
import { useToast } from '@/components/ui/toast/useToast';
import { useFetch } from '@/hooks/network/useFetch';
import { Stadium } from '@/types';

// Lazy load components
const Hero = dynamic(() => import('@/app/landing/Hero'));
const SportsToggle = dynamic(() => import('@/app/landing/SportsToggle'));
const FieldsSection = dynamic(() => import('@/app/landing/FieldsSection'));
const CTAAddFieldButton = dynamic(() => import('@/app/landing/CTAAddFieldButton'));

/**
 * الصفحة الرئيسية - Landing Page
 * أول صفحة يراها المستخدم عند زيارة الموقع
 */
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<'football' | 'paddle'>('football');
  const [featuredStadiums, setFeaturedStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();
  
  // جلب الملاعب المميزة
  const { data: stadiumsData, isLoading: isLoadingStadiums } = useFetch<{ stadiums: Stadium[] }>(
    '/api/stadiums/featured',
    {
      params: { limit: 6, sportType: selectedSport },
      showToast: false,
    }
  );
  
  // جلب الملاعب عند تغيير نوع الرياضة
  useEffect(() => {
    if (stadiumsData?.stadiums) {
      setFeaturedStadiums(stadiumsData.stadiums);
      setLoading(false);
    }
  }, [stadiumsData]);
  
  // البحث عن الملاعب
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: 'أدخل كلمة للبحث',
        description: 'يرجى إدخال كلمة للبحث عن الملاعب',
        variant: 'warning',
      });
      return;
    }
    
    router.push(`/stadiums?search=${encodeURIComponent(searchQuery)}&type=${selectedSport}`);
  };
  
  // تصفية حسب نوع الرياضة
  const handleSportChange = (sport: 'football' | 'paddle') => {
    setSelectedSport(sport);
    setLoading(true);
  };
  
  // عرض ملعب مميز
  const handleViewStadium = (stadiumId: string) => {
    router.push(`/stadiums/${stadiumId}`);
  };
  
  // الانتقال لصفحة جميع الملاعب
  const handleViewAllStadiums = () => {
    router.push(`/stadiums?type=${selectedSport}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <Hero 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Sports Toggle */}
        <div className="mb-10">
          <SportsToggle 
            selectedSport={selectedSport}
            onSportChange={handleSportChange}
          />
        </div>
        
        {/* Add Field CTA */}
        <div className="mb-12 text-center">
          <CTAAddFieldButton />
        </div>
        
        {/* Featured Fields Section */}
        <FieldsSection 
          title={selectedSport === 'football' ? 'ملاعب كرة قدم مميزة' : 'ملاعب بادل مميزة'}
          stadiums={featuredStadiums}
          loading={loading || isLoadingStadiums}
          onViewAll={handleViewAllStadiums}
          onViewStadium={handleViewStadium}
          sportType={selectedSport}
        />
        
        {/* Stats Section */}
        <div className="mt-16 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">ملعب متاح</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-gray-600">حجز مكتمل</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8</div>
              <div className="text-gray-600">تقييم المستخدمين</div>
            </Card>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            كيف تعمل منصة احجزلي؟
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ابحث عن ملعب</h3>
              <p className="text-gray-600">
                ابحث عن الملاعب القريبة منك حسب الموقع والنوع والسعر
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">اختر التاريخ والوقت</h3>
              <p className="text-gray-600">
                اختر التاريخ والوقت المناسبين من الأوقات المتاحة
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ادفع العربون</h3>
              <p className="text-gray-600">
                ادفع العربون عبر الإنترنت أو باستخدام كود الخصم
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary">⚽</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">العب واستمتع</h3>
              <p className="text-gray-600">
                احضر للملعب في الوقت المحدد واستمتع بلعبتك
              </p>
            </Card>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">جاهز للعب؟</h2>
          <p className="text-xl mb-8 opacity-90">
            ابدأ الآن بحجز أول ملعب لك وانضم إلى آلاف اللاعبين
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/stadiums')}
              className="bg-white text-primary hover:bg-gray-100"
            >
              تصفح الملاعب
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/signup')}
              className="border-white text-white hover:bg-white/10"
            >
              إنشاء حساب مجاني
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
