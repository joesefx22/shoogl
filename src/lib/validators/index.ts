/**
 * مكتبة التحقق من المدخلات والبيانات
 * توفر دوال تحقق متنوعة لأنواع البيانات المختلفة
 */

/**
 * تحقق من البريد الإلكتروني
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * تحقق من رقم الهاتف المصري
 */
export const validateEgyptianPhone = (phone: string): boolean => {
  // يقبل: 01012345678، 01112345678، 01212345678، +201012345678
  const phoneRegex = /^(?:\+20|0)?1[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * تحقق من كلمة المرور
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
  }

  if (password.length > 50) {
    errors.push('يجب أن لا تزيد كلمة المرور عن 50 حرف');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * تحقق من الاسم
 */
export const validateName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!name.trim()) {
    return {
      isValid: false,
      error: 'الاسم مطلوب',
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'الاسم يجب أن يكون على الأقل حرفين',
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: 'الاسم يجب أن لا يزيد عن 100 حرف',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من السعر
 */
export const validatePrice = (price: number | string): {
  isValid: boolean;
  error?: string;
} => {
  const numPrice = Number(price);
  
  if (isNaN(numPrice) || numPrice <= 0) {
    return {
      isValid: false,
      error: 'السعر يجب أن يكون رقم موجب',
    };
  }

  if (numPrice > 100000) {
    return {
      isValid: false,
      error: 'السعر لا يمكن أن يتعدى 100,000 جنيه',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من التاريخ
 */
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj >= new Date();
};

/**
 * تحقق من وقت البداية والنهاية
 */
export const validateTimeSlot = (start: string, end: string): {
  isValid: boolean;
  error?: string;
} => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59) {
    return {
      isValid: false,
      error: 'وقت البداية غير صالح',
    };
  }

  if (endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59) {
    return {
      isValid: false,
      error: 'وقت النهاية غير صالح',
    };
  }

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    return {
      isValid: false,
      error: 'وقت النهاية يجب أن يكون بعد وقت البداية',
    };
  }

  if ((endMinutes - startMinutes) < 30) {
    return {
      isValid: false,
      error: 'المدة يجب أن تكون 30 دقيقة على الأقل',
    };
  }

  if ((endMinutes - startMinutes) > 4 * 60) {
    return {
      isValid: false,
      error: 'المدة لا يمكن أن تزيد عن 4 ساعات',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من كود الخصم
 */
export const validateDiscountCode = (code: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!code.trim()) {
    return {
      isValid: false,
      error: 'كود الخصم مطلوب',
    };
  }

  if (code.length < 3 || code.length > 20) {
    return {
      isValid: false,
      error: 'كود الخصم يجب أن يكون بين 3 و 20 حرف',
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return {
      isValid: false,
      error: 'يمكن أن يحتوي كود الخصم على أحرف إنجليزية وأرقام فقط',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من اسم الملعب
 */
export const validateStadiumName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!name.trim()) {
    return {
      isValid: false,
      error: 'اسم الملعب مطلوب',
    };
  }

  if (name.trim().length < 3) {
    return {
      isValid: false,
      error: 'اسم الملعب يجب أن يكون 3 أحرف على الأقل',
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      error: 'اسم الملعب لا يمكن أن يتعدى 100 حرف',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من العنوان
 */
export const validateAddress = (address: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!address.trim()) {
    return {
      isValid: false,
      error: 'العنوان مطلوب',
    };
  }

  if (address.trim().length < 5) {
    return {
      isValid: false,
      error: 'العنوان يجب أن يكون 5 أحرف على الأقل',
    };
  }

  if (address.trim().length > 500) {
    return {
      isValid: false,
      error: 'العنوان لا يمكن أن يتعدى 500 حرف',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من الإحداثيات
 */
export const validateCoordinates = (lat: number, lng: number): {
  isValid: boolean;
  error?: string;
} => {
  if (lat < -90 || lat > 90 || isNaN(lat)) {
    return {
      isValid: false,
      error: 'خط العرض غير صالح',
    };
  }

  if (lng < -180 || lng > 180 || isNaN(lng)) {
    return {
      isValid: false,
      error: 'خط الطول غير صالح',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * تحقق من عدد اللاعبين
 */
export const validatePlayersCount = (count: number): {
  isValid: boolean;
  error?: string;
} => {
  if (count < 1) {
    return {
      isValid: false,
      error: 'عدد اللاعبين يجب أن يكون 1 على الأقل',
    };
  }

  if (count > 50) {
    return {
      isValid: false,
      error: 'عدد اللاعبين لا يمكن أن يزيد عن 50',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * مصفوفة تحقق شاملة للنموذج
 */
export const validateForm = (formData: Record<string, any>, rules: Record<string, Function>) => {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, validator]) => {
    const value = formData[field];
    const result = validator(value);
    
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * إنشاء قواعد تحقق للنماذج الشائعة
 */
export const validationRules = {
  auth: {
    email: (email: string) => ({
      isValid: validateEmail(email),
      error: validateEmail(email) ? undefined : 'بريد إلكتروني غير صالح',
    }),
    phone: (phone: string) => ({
      isValid: validateEgyptianPhone(phone),
      error: validateEgyptianPhone(phone) ? undefined : 'رقم هاتف مصري غير صالح',
    }),
    password: (password: string) => validatePassword(password),
    name: validateName,
  },
  stadium: {
    name: validateStadiumName,
    price: validatePrice,
    address: validateAddress,
  },
  booking: {
    playersCount: validatePlayersCount,
    date: (date: string) => ({
      isValid: validateDate(date),
      error: validateDate(date) ? undefined : 'تاريخ غير صالح',
    }),
  },
};

export default {
  validateEmail,
  validateEgyptianPhone,
  validatePassword,
  validateName,
  validatePrice,
  validateDate,
  validateTimeSlot,
  validateDiscountCode,
  validateStadiumName,
  validateAddress,
  validateCoordinates,
  validatePlayersCount,
  validateForm,
  validationRules,
};
