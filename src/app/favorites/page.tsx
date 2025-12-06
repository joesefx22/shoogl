'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StadiumCard } from '@/components/stadiums/StadiumCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Heart, Trash2, Filter } from 'lucide-react';

export default function FavoritesPage() {
  const [filters, setFilters] = useState({
    sortBy: 'recent',
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites', filters],
    queryFn: async () => {
      const response = await api.get('/favorites');
      return response.data;
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (stadiumId: string) => {
      await api.delete(`/favorites?stadiumId=${stadiumId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleRemoveFavorite = (stadiumId: string) => {
    if (confirm('هل تريد إزالة هذا الملعب من المفضلة؟')) {
      removeFavoriteMutation.mutate(stadiumId);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            حدث خطأ في جلب المفضلة
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message}
          </p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  const favorites = data?.favorites || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            المفضلة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {favorites.length} ملعب في قائمة المفضلة
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Filter className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              ترتيب حسب
            </Button>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-20 w-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد ملاعب في المفضلة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              قم بإضافة ملاعب إلى المفضلة للعثور عليها بسهولة لاحقاً
            </p>
            <Button href="/stadiums">
              تصفح الملاعب
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite: any) => (
              <div key={favorite.id} className="relative">
                <StadiumCard stadium={favorite.stadium} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 left-2 z-10 bg-red-500 text-white hover:bg-red-600"
                  onClick={() => handleRemoveFavorite(favorite.stadiumId)}
                  loading={removeFavoriteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
