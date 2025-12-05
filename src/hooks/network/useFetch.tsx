'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/toast/useToast';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * واجهة خيارات الطلب
 */
interface FetchOptions<T = any> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: T;
  params?: Record<string, string | number | boolean>;
  requiresAuth?: boolean;
  retryCount?: number;
  timeout?: number;
  cache?: 'no-store' | 'force-cache' | 'reload';
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
  skip?: boolean;
}

/**
 * حالة الطلب
 */
interface FetchState<T = any> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * خطاف (Hook) للطلبات الشبكية
 */
export function useFetch<T = any>(
  url?: string,
  options: FetchOptions = {}
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });
  
  const [retryCount, setRetryCount] = useState(0);
  const { getAuthHeaders, logout } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    requiresAuth = true,
    retryCount: maxRetries = 3,
    timeout = 30000,
    cache = 'no-store',
    onSuccess,
    onError,
    showToast = true,
    skip = false,
  } = options;

  /**
   * بناء URL مع المعلمات
   */
  const buildUrl = useCallback((endpoint: string) => {
    if (!params) return endpoint;
    
    const url = new URL(endpoint, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    
    return url.toString();
  }, [params]);

  /**
   * إعداد الرؤوس
   */
  const getHeaders = useCallback(() => {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    
    if (requiresAuth) {
      const authHeaders = getAuthHeaders();
      Object.assign(defaultHeaders, authHeaders);
    }
    
    return defaultHeaders;
  }, [requiresAuth, headers, getAuthHeaders]);

  /**
   * تنفيذ الطلب
   */
  const execute = useCallback(async (
    fetchUrl?: string,
    fetchOptions?: Partial<FetchOptions>
  ) => {
    // إذا لم يتم توفير URL، استخدم الافتراضي
    const targetUrl = fetchUrl || url;
    if (!targetUrl) {
      console.error('No URL provided');
      return;
    }
    
    // إذا كان الطلب مرفوضاً (skip)
    if (skip) return;
    
    // إلغاء أي طلب سابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // إنشاء وحدة تحكم جديدة
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // تهيئة حالة التحميل
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    }));
    
    try {
      // بناء URL النهائي
      const finalUrl = buildUrl(targetUrl);
      
      // إعداد خيارات الطلب
      const finalOptions: RequestInit = {
        method,
        headers: getHeaders(),
        signal,
        cache,
        ...fetchOptions,
      };
      
      // إضافة الجسم إذا كان موجوداً
      if (body && method !== 'GET' && method !== 'HEAD') {
        finalOptions.body = JSON.stringify(body);
      }
      
      // ضبط المهلة
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('انتهت مهلة الطلب'));
        }, timeout);
      });
      
      // تنفيذ الطلب مع المهلة
      const fetchPromise = fetch(finalUrl, finalOptions);
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      // التحقق من حالة الاستجابة
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // تحليل البيانات
      const data = await response.json();
      
      // تحديث الحالة بالبيانات
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });
      
      // استدعاء callback النجاح
      if (onSuccess) {
        onSuccess(data);
      }
      
      // عرض إشعار النجاح إذا كان مطلوباً
      if (showToast && method !== 'GET') {
        toast({
          title: 'تم بنجاح',
          description: 'تم تنفيذ العملية بنجاح',
          variant: 'success',
        });
      }
      
      return data;
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      
      // التعامل مع الأخطاء المختلفة
      let errorMessage = 'حدث خطأ أثناء تنفيذ الطلب';
      
      if (error.name === 'AbortError') {
        errorMessage = 'تم إلغاء الطلب';
      } else if (error.message === 'انتهت مهلة الطلب') {
        errorMessage = 'انتهت مهلة الطلب، يرجى المحاولة مرة أخرى';
      } else if (error.message.includes('HTTP error')) {
        const status = error.message.split('status: ')[1];
        
        switch (status) {
          case '401':
            errorMessage = 'غير مصرح، يرجى تسجيل الدخول';
            logout();
            break;
          case '403':
            errorMessage = 'ليس لديك الصلاحيات الكافية';
            break;
          case '404':
            errorMessage = 'لم يتم العثور على المورد المطلوب';
            break;
          case '500':
            errorMessage = 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً';
            break;
          default:
            errorMessage = `خطأ في الخادم (${status})`;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      // تحديث الحالة بالخطأ
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isSuccess: false,
        isError: true,
      }));
      
      // استدعاء callback الخطأ
      if (onError) {
        onError(error);
      }
      
      // عرض إشعار الخطأ
      if (showToast) {
        toast({
          title: 'حدث خطأ',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      // إعادة المحاولة إذا كان ذلك ممكناً
      if (retryCount < maxRetries && !error.message.includes('401')) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          execute(fetchUrl, fetchOptions);
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
      
      throw error;
      
    } finally {
      // تنظيف وحدة التحكم
      abortControllerRef.current = null;
    }
  }, [
    url,
    method,
    body,
    skip,
    buildUrl,
    getHeaders,
    cache,
    timeout,
    onSuccess,
    onError,
    showToast,
    toast,
    logout,
    retryCount,
    maxRetries,
  ]);

  /**
   * إعادة تعيين الحالة
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
    setRetryCount(0);
  }, []);

  /**
   * إلغاء الطلب الحالي
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * تنفيذ طلب GET
   */
  const get = useCallback((getUrl?: string, getOptions?: Partial<FetchOptions>) => {
    return execute(getUrl, { method: 'GET', ...getOptions });
  }, [execute]);

  /**
   * تنفيذ طلب POST
   */
  const post = useCallback((postUrl?: string, postData?: any, postOptions?: Partial<FetchOptions>) => {
    return execute(postUrl, { 
      method: 'POST', 
      body: postData, 
      ...postOptions 
    });
  }, [execute]);

  /**
   * تنفيذ طلب PUT
   */
  const put = useCallback((putUrl?: string, putData?: any, putOptions?: Partial<FetchOptions>) => {
    return execute(putUrl, { 
      method: 'PUT', 
      body: putData, 
      ...putOptions 
    });
  }, [execute]);

  /**
   * تنفيذ طلب DELETE
   */
  const del = useCallback((deleteUrl?: string, deleteOptions?: Partial<FetchOptions>) => {
    return execute(deleteUrl, { 
      method: 'DELETE', 
      ...deleteOptions 
    });
  }, [execute]);

  /**
   * تنفيذ طلب PATCH
   */
  const patch = useCallback((patchUrl?: string, patchData?: any, patchOptions?: Partial<FetchOptions>) => {
    return execute(patchUrl, { 
      method: 'PATCH', 
      body: patchData, 
      ...patchOptions 
    });
  }, [execute]);

  /**
   * إعادة تحميل الطلب الحالي
   */
  const refetch = useCallback(() => {
    reset();
    return execute();
  }, [execute, reset]);

  // التنفيذ التلقائي إذا كان هناك URL ولم يكن مرفوضاً
  useEffect(() => {
    if (url && !skip && method === 'GET') {
      execute();
    }
  }, [url, skip, method, execute]);

  // التنظيف عند إلغاء التثبيت
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    ...state,
    retryCount,
    
    // Actions
    execute,
    get,
    post,
    put,
    del: del,
    patch,
    refetch,
    reset,
    abort,
    
    // Helpers
    isIdle: !state.isLoading && !state.isSuccess && !state.isError,
    isFetching: state.isLoading,
  };
}

/**
 * خطاف (Hook) للاستعلامات (مثل useFetch لكن مع cache)
 */
export function useQuery<T = any>(
  url: string,
  options: Omit<FetchOptions, 'cache'> & { enabled?: boolean } = {}
) {
  const { enabled = true, ...fetchOptions } = options;
  
  const fetchState = useFetch<T>(enabled ? url : undefined, {
    cache: 'force-cache',
    ...fetchOptions,
    skip: !enabled,
  });
  
  return fetchState;
}

/**
 * خطاف (Hook) للطفرات (مثل useFetch لكن بدون تنفيذ تلقائي)
 */
export function useMutation<T = any, V = any>(
  url?: string,
  options: Omit<FetchOptions<V>, 'method'> = {}
) {
  const fetchState = useFetch<T>(undefined, {
    ...options,
    skip: true,
  });
  
  const mutate = useCallback(async (
    mutationUrl?: string,
    data?: V,
    mutationOptions?: Partial<FetchOptions<V>>
  ) => {
    const targetUrl = mutationUrl || url;
    if (!targetUrl) {
      throw new Error('No URL provided for mutation');
    }
    
    return fetchState.execute(targetUrl, {
      method: 'POST',
      body: data,
      ...mutationOptions,
    });
  }, [url, fetchState]);
  
  const mutateAsync = useCallback(async (
    mutationUrl?: string,
    data?: V,
    mutationOptions?: Partial<FetchOptions<V>>
  ) => {
    return mutate(mutationUrl, data, mutationOptions);
  }, [mutate]);
  
  return {
    ...fetchState,
    mutate,
    mutateAsync,
  };
}

export default useFetch;
