'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StadiumList from '@/components/stadiums/StadiumList';
import FilterBar from '@/components/stadiums/FilterBar';
import { Stadium } from '@/types/stadium.types';
import { stadiumService } from '@/lib/services/stadium.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

export default function StadiumsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'football' | 'paddle' | undefined;
  
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState({
    type: type || 'football',
    city: '',
    minPrice: 0,
    maxPrice: 1000,
    features: [] as string[],
  });

  useEffect(() => {
    loadStadiums();
  }, [filters]);

  const loadStadiums = async () => {
    try {
      setLoading(true);
      const data = await stadiumService.getStadiums(filters);
      setStadiums(data);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في تحميل الملاعب');
      console.error('Error loading stadiums:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const breadcrumbItems = [
    { label: 'الرئيسية', href: '/' },
    { 
      label: filters.type === 'football' ? 'ملاعب كرة القدم' : 'ملاعب البادل', 
      href: `/stadiums?type=${filters.type}` 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {filters.type === 'football' ? 'ملاعب كرة القدم' : 'ملاعب البادل'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              اكتشف أفضل الملاعب واحجز وقتك المفضل
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <FilterBar 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={loadStadiums}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  حاول مرة أخرى
                </button>
              </div>
            ) : stadiums.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد ملاعب متاحة
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  حاول تغيير فلترات البحث
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    عرض {stadiums.length} ملعب
                  </p>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-gray-600 dark:text-gray-300">ترتيب حسب:</span>
                    <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <option value="distance">الأقرب</option>
                      <option value="price">السعر</option>
                      <option value="rating">التقييم</option>
                      <option value="popular">الأكثر حجزاً</option>
                    </select>
                  </div>
                </div>
                <StadiumList stadiums={stadiums} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
