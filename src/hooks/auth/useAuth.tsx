'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/types';
import * as authLib from '@/lib/auth/auth';
import { useToast } from '@/components/ui/toast/useToast';

/**
 * خطاف (Hook) لإدارة حالة المصادقة
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // تحميل بيانات المصادقة عند التهيئة
  useEffect(() => {
    loadAuthData();
  }, []);

  // تحميل بيانات المصادقة من التخزين المحلي
  const loadAuthData = useCallback(() => {
    try {
      const token = authLib.getToken();
      const userData = authLib.getUser();
      const role = authLib.getUserRole();
      const roles = authLib.getUserRoles();
      
      setIsAuthenticated(!!token && !!userData);
      setUser(userData);
      setUserRole(role);
      setUserRoles(roles);
      
      // التحقق من صلاحية التوكن
      if (token) {
        authLib.validateTokenWithServer().then(isValid => {
          if (!isValid) {
            logout();
            toast({
              title: 'انتهت الجلسة',
              description: 'يرجى تسجيل الدخول مرة أخرى',
              variant: 'warning',
            });
          }
        });
      }
      
    } catch (error) {
      console.error('Failed to load auth data:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * تسجيل الدخول
   */
  const login = useCallback(async (token: string, userData: User) => {
    try {
      authLib.setAuthData(token, userData);
      
      setUser(userData);
      setUserRole(userData.primaryRole);
      setUserRoles(userData.roles);
      setIsAuthenticated(true);
      
      toast({
        title: 'تم تسجيل الدخول بنجاح',
        description: `مرحباً ${userData.name}!`,
        variant: 'success',
      });
      
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'فشل تسجيل الدخول',
        description: 'حدث خطأ أثناء تسجيل الدخول',
        variant: 'destructive',
      });
      
      return { success: false, error };
    }
  }, [toast]);

  /**
   * تسجيل الخروج
   */
  const logout = useCallback(() => {
    try {
      authLib.clearAuthData();
      
      setUser(null);
      setUserRole(null);
      setUserRoles([]);
      setIsAuthenticated(false);
      
      toast({
        title: 'تم تسجيل الخروج',
        description: 'تم تسجيل خروجك بنجاح',
        variant: 'info',
      });
      
      // إعادة التوجيه إلى الصفحة الرئيسية
      router.push('/');
      router.refresh();
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router, toast]);

  /**
   * تحديث بيانات المستخدم
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...updates };
      authLib.updateUserData(updates);
      
      setUser(updatedUser);
      
      toast({
        title: 'تم تحديث البيانات',
        description: 'تم تحديث بيانات حسابك بنجاح',
        variant: 'success',
      });
      
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'فشل التحديث',
        description: 'حدث خطأ أثناء تحديث البيانات',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  /**
   * التحقق من الصلاحيات
   */
  const hasRole = useCallback((role: UserRole): boolean => {
    return authLib.hasRole(role);
  }, []);

  const hasAnyRole = useCallback((requiredRoles: UserRole[]): boolean => {
    return authLib.hasAnyRole(requiredRoles);
  }, []);

  const hasAllRoles = useCallback((requiredRoles: UserRole[]): boolean => {
    return authLib.hasAllRoles(requiredRoles);
  }, []);

  const hasRoleOrHigher = useCallback((requiredRole: UserRole): boolean => {
    return authLib.hasRoleOrHigher(requiredRole);
  }, []);

  /**
   * تبديل الدور
   */
  const switchRole = useCallback((newRole: UserRole): boolean => {
    const success = authLib.switchRole(newRole);
    
    if (success) {
      const updatedUser = { ...user!, primaryRole: newRole };
      setUser(updatedUser);
      setUserRole(newRole);
      
      toast({
        title: 'تم تغيير الدور',
        description: `تم التبديل إلى حساب ${newRole}`,
        variant: 'info',
      });
      
      // إعادة التوجيه إلى الداشبورد المناسب
      router.push(authLib.getDashboardPath(newRole));
    }
    
    return success;
  }, [user, router, toast]);

  /**
   * التحقق من الوصول إلى الصفحة الحالية
   */
  const canAccessCurrentPage = useCallback((): boolean => {
    return authLib.canAccess(pathname, userRole || undefined);
  }, [pathname, userRole]);

  /**
   * تجديد التوكن
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authLib.refreshTokenIfNeeded();
      
      if (success) {
        // إعادة تحميل بيانات المستخدم بعد التجديد
        const refreshedUser = authLib.getUser();
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
      
      return success;
      
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }, []);

  /**
   * الحصول على رؤوس المصادقة للطلبات
   */
  const getAuthHeaders = useCallback((): Record<string, string> => {
    return authLib.getAuthHeaders();
  }, []);

  /**
   * إعادة تحميل بيانات المصادقة
   */
  const reloadAuth = useCallback(() => {
    loadAuthData();
  }, [loadAuthData]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    userRole,
    userRoles,
    
    // Actions
    login,
    logout,
    updateUser,
    
    // Role Checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasRoleOrHigher,
    
    // Role Management
    switchRole,
    
    // Access Control
    canAccessCurrentPage,
    
    // Token Management
    refreshToken,
    getAuthHeaders,
    
    // Utils
    reloadAuth,
    getDashboardPath: authLib.getDashboardPath,
  };
}

/**
 * خطاف (Hook) للتحقق من الصلاحيات
 */
export function useAuthGuard(requiredRoles?: UserRole[], redirectTo = '/login') {
  const { isAuthenticated, userRole, hasAnyRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // التحقق من المصادقة
    if (!isAuthenticated) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // التحقق من الصلاحيات إذا كانت مطلوبة
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(requiredRoles)) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, userRole, requiredRoles, isLoading, router, pathname, redirectTo, hasAnyRole]);

  return {
    isAuthenticated,
    userRole,
    isLoading,
    hasAccess: !requiredRoles || hasAnyRole(requiredRoles),
  };
}

/**
 * خطاف (Hook) للتحقق من الوصول إلى صفحة محددة
 */
export function useRouteGuard() {
  const { canAccessCurrentPage, userRole, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!canAccessCurrentPage()) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      } else {
        router.push('/unauthorized');
      }
    }
  }, [canAccessCurrentPage, isAuthenticated, isLoading, router]);

  return {
    hasAccess: canAccessCurrentPage(),
    userRole,
    isAuthenticated,
    isLoading,
  };
}

export default useAuth;
