/**
 * خدمات المصادقة والموضوعات المتعلقة بالمستخدم
 */

import { apiClient, apiPost, apiGet, apiPut, apiPatch } from '@/lib/api';
import { User, UserRole } from '@/types';

/**
 * واجهة تسجيل الدخول
 */
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * واجهة إنشاء حساب
 */
interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  primaryRole: UserRole;
  stadiums?: string[];
}

interface SignupResponse {
  success: boolean;
  message: string;
  user?: User;
}

/**
 * واجهة تحديث الملف الشخصي
 */
interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  settings?: Record<string, any>;
}

/**
 * دوال خدمات المصادقة
 */

/**
 * تسجيل الدخول
 */
export async function loginUser(
  email: string, 
  password: string
): Promise<LoginResponse> {
  try {
    const response = await apiPost<LoginResponse>('/auth/login', {
      email,
      password,
    }, { requiresAuth: false });
    
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * إنشاء حساب جديد
 */
export async function signupUser(
  userData: SignupRequest
): Promise<SignupResponse> {
  try {
    const response = await apiPost<SignupResponse>('/auth/signup', userData, {
      requiresAuth: false,
    });
    
    return response;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
}

/**
 * تسجيل الخروج
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/logout', {}, { requiresAuth: true });
    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    // حتى لو فشل الطلب، نعتبر أن المستخدم قد خرج
    return { success: true, message: 'تم تسجيل الخروج' };
  }
}

/**
 * الحصول على بيانات المستخدم الحالي
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiGet<User>('/auth/me');
    return response;
  } catch (error) {
    console.error('Failed to get current user:', error);
    throw error;
  }
}

/**
 * تحديث الملف الشخصي
 */
export async function updateProfile(
  updates: UpdateProfileRequest
): Promise<User> {
  try {
    const response = await apiPut<User>('/auth/profile', updates);
    return response;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

/**
 * تغيير كلمة المرور
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  } catch (error) {
    console.error('Failed to change password:', error);
    throw error;
  }
}

/**
 * طلب إعادة تعيين كلمة المرور
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/forgot-password', { email }, {
      requiresAuth: false,
    });
    return response;
  } catch (error) {
    console.error('Failed to request password reset:', error);
    throw error;
  }
}

/**
 * إعادة تعيين كلمة المرور
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/reset-password', {
      token,
      newPassword,
    }, { requiresAuth: false });
    return response;
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
}

/**
 * التحقق من صحة التوكن
 */
export async function validateToken(): Promise<{ valid: boolean; user?: User }> {
  try {
    const response = await apiGet('/auth/validate');
    return response;
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false };
  }
}

/**
 * تحديث التوكن
 */
export async function refreshToken(): Promise<{ token: string }> {
  try {
    const response = await apiPost('/auth/refresh', {}, { requiresAuth: true });
    return response;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
}

/**
 * تحديث إعدادات المستخدم
 */
export async function updateUserSettings(
  settings: Record<string, any>
): Promise<User> {
  try {
    const response = await apiPatch<User>('/auth/settings', { settings });
    return response;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

/**
 * تحديث صورة الملف الشخصي
 */
export async function uploadAvatar(
  file: File
): Promise<{ avatarUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.uploadFile('/auth/avatar', file, 'avatar');
    return response;
  } catch (error) {
    console.error('Failed to upload avatar:', error);
    throw error;
  }
}

/**
 * ربط حساب الموظف بملاعب
 */
export async function linkStaffToStadiums(
  staffId: string,
  stadiumIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/link-staff', {
      staffId,
      stadiumIds,
    });
    return response;
  } catch (error) {
    console.error('Failed to link staff to stadiums:', error);
    throw error;
  }
}

/**
 * الحصول على موظفين ملعب محدد
 */
export async function getStadiumStaff(
  stadiumId: string
): Promise<User[]> {
  try {
    const response = await apiGet(`/auth/staff/${stadiumId}`);
    return response;
  } catch (error) {
    console.error('Failed to get stadium staff:', error);
    throw error;
  }
}

/**
 * تغيير الدور الرئيسي للمستخدم
 */
export async function switchPrimaryRole(
  newRole: UserRole
): Promise<{ success: boolean; user: User }> {
  try {
    const response = await apiPost('/auth/switch-role', { newRole });
    return response;
  } catch (error) {
    console.error('Failed to switch role:', error);
    throw error;
  }
}

/**
 * التحقق من صلاحية البريد الإلكتروني
 */
export async function checkEmailAvailability(
  email: string
): Promise<{ available: boolean }> {
  try {
    const response = await apiPost('/auth/check-email', { email }, {
      requiresAuth: false,
    });
    return response;
  } catch (error) {
    console.error('Failed to check email:', error);
    throw error;
  }
}

/**
 * التحقق من صلاحية رقم الهاتف
 */
export async function checkPhoneAvailability(
  phone: string
): Promise<{ available: boolean }> {
  try {
    const response = await apiPost('/auth/check-phone', { phone }, {
      requiresAuth: false,
    });
    return response;
  } catch (error) {
    console.error('Failed to check phone:', error);
    throw error;
  }
}

/**
 * إرسال رمز التحقق
 */
export async function sendVerificationCode(
  phoneOrEmail: string,
  method: 'sms' | 'email' = 'sms'
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/send-verification', {
      contact: phoneOrEmail,
      method,
    }, { requiresAuth: false });
    return response;
  } catch (error) {
    console.error('Failed to send verification code:', error);
    throw error;
  }
}

/**
 * التحقق من رمز التحقق
 */
export async function verifyCode(
  contact: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiPost('/auth/verify-code', {
      contact,
      code,
    }, { requiresAuth: false });
    return response;
  } catch (error) {
    console.error('Failed to verify code:', error);
    throw error;
  }
}

/**
 * تصدير جميع دوال الخدمة
 */
export const authService = {
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  validateToken,
  refreshToken,
  updateUserSettings,
  uploadAvatar,
  linkStaffToStadiums,
  getStadiumStaff,
  switchPrimaryRole,
  checkEmailAvailability,
  checkPhoneAvailability,
  sendVerificationCode,
  verifyCode,
};

export default authService;
