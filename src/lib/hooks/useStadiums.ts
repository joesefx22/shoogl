import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCacheService } from '@/lib/services/cache.service';

const cache = getCacheService();

export function useStadiums(filters?: any) {
  const queryKey = ['stadiums', filters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cacheKey = `stadiums:${JSON.stringify(filters)}`;
      
      // محاولة جلب البيانات من الكاش
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // جلب البيانات من API
      const response = await api.get('/stadiums', { params: filters });
      const data = response.data;

      // تخزين في الكاش لمدة 5 دقائق
      await cache.set(cacheKey, data, 5 * 60);

      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 دقيقة قبل اعتبار البيانات قديمة
    gcTime: 10 * 60 * 1000, // 10 دقائق قبل إزالة البيانات من الذاكرة
  });
}
