import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// استخدامات للمكونات الثقيلة
export const LazyStadiumMap = withLazyLoading(
  () => import('@/components/stadiums/StadiumMap')
);

export const LazyBookingCalendar = withLazyLoading(
  () => import('@/components/bookings/BookingCalendar')
);

export const LazyPaymentForm = withLazyLoading(
  () => import('@/components/payment/PaymentForm')
);

export const LazyReviewsList = withLazyLoading(
  () => import('@/components/reviews/ReviewsList')
);
