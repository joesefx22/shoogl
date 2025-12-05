/**
 * مكتبة إدارة المصادقة والصلاحيات
 * توفر دوال لإدارة حالة المستخدم، التوكن، والأدوار
 */

import { User, UserRole } from '@/types';

// مفتاح التخزين المحلي
const STORAGE_KEYS = {
  TOKEN: 'ehgzly_auth_token',
  USER: 'ehgzly_user_data',
  ROLE: 'ehgzly_user_role',
  EXPIRY: 'ehgzly_token_expiry',
};

/**
 * حفظ بيانات المصادقة في التخزين المحلي
 */
export const setAuthData = (token: string, user: User): void => {
  try {
    // حفظ التوكن
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    // حفظ بيانات المستخدم
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // حفظ الدور الرئيسي
    localStorage.setItem(STORAGE_KEYS.ROLE, user.primaryRole);
    
    // حساب وتخزين انتهاء صلاحية التوكن (24 ساعة)
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.EXPIRY, expiry.toString());
    
  } catch (error) {
    console.error('Failed to save auth data:', error);
  }
};

/**
 * استرجاع التوكن من التخزين المحلي
 */
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.EXPIRY);
    
    // التحقق من انتهاء الصلاحية
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }
    
    // التوكن منتهي أو غير موجود
    clearAuthData();
    return null;
    
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
};

/**
 * استرجاع بيانات المستخدم من التخزين المحلي
 */
export const getUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) return null;
    
    const user = JSON.parse(userData) as User;
    
    // التحقق من صلاحية التوكن
    const token = getToken();
    if (!token) return null;
    
    return user;
    
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

/**
 * التحقق مما إذا كان المستخدم مسجل الدخول
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null && getUser() !== null;
};

/**
 * الحصول على دور المستخدم الحالي
 */
export const getUserRole = (): UserRole | null => {
  try {
    const user = getUser();
    return user?.primaryRole || null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
};

/**
 * الحصول على جميع أدوار المستخدم
 */
export const getUserRoles = (): UserRole[] => {
  try {
    const user = getUser();
    return user?.roles || [];
  } catch (error) {
    console.error('Failed to get user roles:', error);
    return [];
  }
};

/**
 * التحقق مما إذا كان المستخدم له دور محدد
 */
export const hasRole = (role: UserRole): boolean => {
  const roles = getUserRoles();
  return roles.includes(role);
};

/**
 * التحقق مما إذا كان المستخدم له أي من الأدوار المحددة
 */
export const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
  const userRoles = getUserRoles();
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * التحقق مما إذا كان المستخدم له جميع الأدوار المطلوبة
 */
export const hasAllRoles = (requiredRoles: UserRole[]): boolean => {
  const userRoles = getUserRoles();
  return requiredRoles.every(role => userRoles.includes(role));
};

/**
 * الحصول على المسار المناسب للداشبورد حسب الدور
 */
export const getDashboardPath = (role?: UserRole): string => {
  const userRole = role || getUserRole();
  
  switch (userRole) {
    case 'player':
      return '/player';
    case 'staff':
      return '/staff';
    case 'owner':
      return '/owner';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
};

/**
 * التحقق من صلاحيات الوصول إلى صفحة محددة
 */
export const canAccess = (
  path: string, 
  userRole?: UserRole
): boolean => {
  const role = userRole || getUserRole();
  
  // تعريف قواعد الوصول
  const accessRules: Record<string, UserRole[]> = {
    '/player': ['player', 'admin'],
    '/staff': ['staff', 'admin'],
    '/owner': ['owner', 'admin'],
    '/admin': ['admin'],
    '/dashboard': ['player', 'staff', 'owner', 'admin'],
  };

  // البحث عن القاعدة الأكثر تطابقاً
  let allowedRoles: UserRole[] = [];
  
  Object.entries(accessRules).forEach(([rulePath, roles]) => {
    if (path.startsWith(rulePath)) {
      allowedRoles = roles;
    }
  });

  // إذا لم توجد قاعدة، السماح للجميع
  if (allowedRoles.length === 0) {
    return true;
  }

  // التحقق من الدور
  return role ? allowedRoles.includes(role) : false;
};

/**
 * تحديث بيانات المستخدم
 */
export const updateUserData = (updates: Partial<User>): void => {
  try {
    const currentUser = getUser();
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    
  } catch (error) {
    console.error('Failed to update user data:', error);
  }
};

/**
 * تحديث التوكن
 */
export const updateToken = (newToken: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    
    // تحديث تاريخ الانتهاء
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.EXPIRY, expiry.toString());
    
  } catch (error) {
    console.error('Failed to update token:', error);
  }
};

/**
 * مسح بيانات المصادقة
 */
export const clearAuthData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

/**
 * التحقق من صلاحية التوكن مع الخادم
 */
export const validateTokenWithServer = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) return false;

    // هنا يمكن إضافة طلب إلى الخادم للتحقق من صلاحية التوكن
    // const response = await fetch('/api/auth/validate', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // return response.ok;
    
    // حالياً نكتفي بالتحقق المحلي
    return true;
    
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

/**
 * تجديد التوكن تلقائياً
 */
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  try {
    const expiry = localStorage.getItem(STORAGE_KEYS.EXPIRY);
    
    if (!expiry) return false;
    
    const expiryTime = parseInt(expiry);
    const currentTime = Date.now();
    const timeLeft = expiryTime - currentTime;
    
    // إذا بقي أقل من 5 دقائق، نحاول تجديد التوكن
    if (timeLeft < 5 * 60 * 1000) {
      // هنا يمكن إضافة منطق تجديد التوكن
      console.log('Token needs refresh');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * إضافة التوكن إلى رؤوس الطلبات
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * مصفوفة الأدوار مرتبة حسب الصلاحيات (من الأعلى إلى الأدنى)
 */
export const ROLES_HIERARCHY: UserRole[] = ['admin', 'owner', 'staff', 'player'];

/**
 * التحقق مما إذا كان المستخدم له صلاحيات أعلى أو مساوية لدور محدد
 */
export const hasRoleOrHigher = (requiredRole: UserRole): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  const requiredIndex = ROLES_HIERARCHY.indexOf(requiredRole);
  const userIndex = ROLES_HIERARCHY.indexOf(userRole);
  
  // إذا لم يتم العثور على الدور في المصفوفة
  if (requiredIndex === -1 || userIndex === -1) return false;
  
  // المستخدم له صلاحيات إذا كان في نفس المستوى أو أعلى
  return userIndex <= requiredIndex;
};

/**
 * تعيين دور جديد للمستخدم
 */
export const switchRole = (newRole: UserRole): boolean => {
  try {
    const user = getUser();
    if (!user) return false;
    
    // التحقق من أن المستخدم له هذا الدور
    if (!user.roles.includes(newRole)) {
      console.error('User does not have this role');
      return false;
    }
    
    // تحديث الدور الرئيسي
    const updatedUser = { ...user, primaryRole: newRole };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
    
    return true;
    
  } catch (error) {
    console.error('Failed to switch role:', error);
    return false;
  }
};

export default {
  setAuthData,
  getToken,
  getUser,
  isAuthenticated,
  getUserRole,
  getUserRoles,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getDashboardPath,
  canAccess,
  updateUserData,
  updateToken,
  clearAuthData,
  validateTokenWithServer,
  refreshTokenIfNeeded,
  getAuthHeaders,
  hasRoleOrHigher,
  switchRole,
  ROLES_HIERARCHY,
};
