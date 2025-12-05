/**
 * مكتبة API الرئيسية
 * توفر واجهة موحدة للتواصل مع الخادم
 */

import { getAuthHeaders, clearAuthData } from '@/lib/auth/auth';

/**
 * إعدادات API
 */
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000, // 30 ثانية
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 ثانية
};

/**
 * واجهة خيارات الطلب
 */
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
  retry?: number;
  timeout?: number;
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * واجهة الاستجابة
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

/**
 * خطأ مخصص للـ API
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * فئة API الرئيسية
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private abortControllers: Map<string, AbortController>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    this.abortControllers = new Map();
  }

  /**
   * بناء URL كامل
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  /**
   * إعداد الرؤوس
   */
  private getHeaders(requiresAuth: boolean = true): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    
    if (requiresAuth) {
      const authHeaders = getAuthHeaders();
      Object.assign(headers, authHeaders);
    }
    
    return headers;
  }

  /**
   * معالجة الاستجابة
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // التحقق من حالة الاستجابة
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      
      try {
        const errorText = await response.text();
        if (errorText) {
          try {
            errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorText;
          } catch {
            errorMessage = errorText;
          }
        }
      } catch {
        // تجاهل الأخطاء في تحليل الخطأ
      }
      
      // التعامل مع أخطاء المصادقة
      if (response.status === 401) {
        clearAuthData();
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      
      throw new ApiError(response.status, errorMessage, errorData);
    }
    
    // تحليل البيانات الناجحة
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as any;
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
      throw new ApiError(500, 'فشل في تحليل الاستجابة من الخادم');
    }
  }

  /**
   * إلغاء الطلبات السابقة لنفس المفتاح
   */
  abortPreviousRequest(key: string) {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(key);
    }
  }

  /**
   * تنفيذ طلب API
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      requiresAuth = true,
      retry = API_CONFIG.RETRY_COUNT,
      timeout = API_CONFIG.TIMEOUT,
      cache = 'no-store',
      signal,
    } = options;

    // إعداد وحدة التحكم
    const controller = new AbortController();
    const requestSignal = signal || controller.signal;
    
    // إعداد المهلة
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      // بناء URL النهائي
      const url = this.buildUrl(endpoint, params);
      
      // إعداد خيارات الطلب
      const requestOptions: RequestInit = {
        method,
        headers: { ...this.getHeaders(requiresAuth), ...headers },
        signal: requestSignal,
        cache,
      };
      
      // إضافة الجسم إذا كان موجوداً
      if (body && method !== 'GET' && method !== 'HEAD') {
        requestOptions.body = JSON.stringify(body);
      }
      
      // تنفيذ الطلب مع إعادة المحاولة
      let lastError: any;
      
      for (let attempt = 0; attempt <= retry; attempt++) {
        try {
          const response = await fetch(url, requestOptions);
          clearTimeout(timeoutId);
          return await this.handleResponse<T>(response);
          
        } catch (error: any) {
          lastError = error;
          
          // إذا كان الخطأ بسبب الإلغاء، لا نعيد المحاولة
          if (error.name === 'AbortError') {
            throw new ApiError(0, 'تم إلغاء الطلب');
          }
          
          // إعادة المحاولة إذا لم تكن المحاولة الأخيرة
          if (attempt < retry) {
            await new Promise(resolve => 
              setTimeout(resolve, API_CONFIG.RETRY_DELAY * Math.pow(2, attempt))
            );
            continue;
          }
        }
      }
      
      // إذا فشلت جميع المحاولات
      throw lastError;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // تحويل الأخطاء الأخرى إلى ApiError
      throw new ApiError(
        error.status || 0,
        error.message || 'حدث خطأ أثناء التواصل مع الخادم',
        error.data
      );
    }
  }

  /**
   * طلب GET
   */
  get<T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    options?: Omit<ApiRequestOptions, 'method' | 'params'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params,
      ...options,
    });
  }

  /**
   * طلب POST
   */
  post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      ...options,
    });
  }

  /**
   * طلب PUT
   */
  put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      ...options,
    });
  }

  /**
   * طلب DELETE
   */
  delete<T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * طلب PATCH
   */
  patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
      ...options,
    });
  }

  /**
   * رفع ملف
   */
  async uploadFile(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData: Record<string, any> = {}
  ): Promise<any> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // إضافة البيانات الإضافية
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // لا نضيف Content-Type لتلقائياً عند استخدام FormData
      },
    });
  }

  /**
   * تنزيل ملف
   */
  async downloadFile(
    endpoint: string,
    filename: string = 'download',
    params?: Record<string, string | number | boolean>
  ): Promise<void> {
    const url = this.buildUrl(endpoint, params);
    const headers = this.getHeaders();
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new ApiError(response.status, 'فشل في تنزيل الملف');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * الاستعلام بمقاطع (للبيانات الكبيرة)
   */
  async *paginate<T = any>(
    endpoint: string,
    pageParam: string = 'page',
    pageSizeParam: string = 'limit',
    initialPage: number = 1,
    pageSize: number = 20,
    options?: ApiRequestOptions
  ): AsyncGenerator<T[], void, unknown> {
    let currentPage = initialPage;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const params = {
          ...options?.params,
          [pageParam]: currentPage,
          [pageSizeParam]: pageSize,
        };
        
        const response = await this.request<any>(endpoint, {
          ...options,
          params,
        });
        
        const data = response.data || response;
        const items = Array.isArray(data) ? data : data.items || [];
        const total = response.total || response.count || 0;
        
        yield items;
        
        // التحقق مما إذا كان هناك المزيد من الصفحات
        const totalPages = Math.ceil(total / pageSize);
        hasMore = currentPage < totalPages;
        currentPage++;
        
      } catch (error) {
        console.error('Pagination error:', error);
        hasMore = false;
        throw error;
      }
    }
  }
}

// إنشاء نسخة وحيدة من العميل
export const apiClient = new ApiClient();

/**
 * دوال مساعدة للاستخدام المباشر
 */
export const apiRequest = apiClient.request.bind(apiClient);
export const apiGet = apiClient.get.bind(apiClient);
export const apiPost = apiClient.post.bind(apiClient);
export const apiPut = apiClient.put.bind(apiClient);
export const apiDelete = apiClient.delete.bind(apiClient);
export const apiPatch = apiClient.patch.bind(apiClient);
export const apiUpload = apiClient.uploadFile.bind(apiClient);
export const apiDownload = apiClient.downloadFile.bind(apiClient);

/**
 * إنشاء دوال API لنماذج معينة
 */
export const createApiForResource = (resourcePath: string) => ({
  getAll: (params?: any) => apiGet(`${resourcePath}`, params),
  getById: (id: string | number) => apiGet(`${resourcePath}/${id}`),
  create: (data: any) => apiPost(`${resourcePath}`, data),
  update: (id: string | number, data: any) => apiPut(`${resourcePath}/${id}`, data),
  delete: (id: string | number) => apiDelete(`${resourcePath}/${id}`),
  patch: (id: string | number, data: any) => apiPatch(`${resourcePath}/${id}`, data),
});

/**
 * دوال API مسبقة التجهيز
 */
export const stadiumsApi = createApiForResource('/stadiums');
export const bookingsApi = createApiForResource('/bookings');
export const usersApi = createApiForResource('/users');
export const paymentsApi = createApiForResource('/payments');
export const playRequestsApi = createApiForResource('/play-requests');
export const notificationsApi = createApiForResource('/notifications');
export const adminApi = createApiForResource('/admin');

export default {
  client: apiClient,
  request: apiRequest,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  patch: apiPatch,
  upload: apiUpload,
  download: apiDownload,
  createApiForResource,
  stadiumsApi,
  bookingsApi,
  usersApi,
  paymentsApi,
  playRequestsApi,
  notificationsApi,
  adminApi,
};
