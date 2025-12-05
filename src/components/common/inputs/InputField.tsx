// src/components/common/inputs/InputField.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff, Check, Search, Calendar, Clock } from "lucide-react";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label للـ input */
  label?: string;
  /** مساعدة أو وصف تحت الـ input */
  helperText?: string;
  /** رسالة خطأ */
  error?: string;
  /** وضع full width */
  fullWidth?: boolean;
  /** أيقونة في البداية */
  startIcon?: React.ReactNode;
  /** أيقونة في النهاية */
  endIcon?: React.ReactNode;
  /** Input إضافي */
  addonBefore?: React.ReactNode;
  /** Input إضافي */
  addonAfter?: React.ReactNode;
  /** حجم الـ input */
  size?: "sm" | "md" | "lg";
  /** حالة الـ input */
  status?: "default" | "success" | "warning" | "error";
  /** مطلوب */
  required?: boolean;
  /** مرفق ملف */
  withFile?: boolean;
  /** بحث */
  isSearch?: boolean;
  /** كلمة مرور */
  isPassword?: boolean;
  /** تاريخ */
  isDate?: boolean;
  /** وقت */
  isTime?: boolean;
  /** قراءة فقط */
  readOnly?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      addonBefore,
      addonAfter,
      size = "md",
      status = "default",
      required = false,
      withFile = false,
      isSearch = false,
      isPassword = false,
      isDate = false,
      isTime = false,
      readOnly = false,
      disabled = false,
      type = "text",
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determine actual type
    const inputType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : isDate
      ? "date"
      : isTime
      ? "time"
      : type;

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-2 text-sm",
      md: "h-10 px-3",
      lg: "h-12 px-4 text-lg",
    };

    // Status styles
    const statusStyles = {
      default: cn(
        "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
        "dark:border-gray-600 dark:focus:border-primary-400 dark:focus:ring-primary-400"
      ),
      success: cn(
        "border-success-500 focus:border-success-500 focus:ring-success-500",
        "dark:border-success-400 dark:focus:border-success-400 dark:focus:ring-success-400"
      ),
      warning: cn(
        "border-warning-500 focus:border-warning-500 focus:ring-warning-500",
        "dark:border-warning-400 dark:focus:border-warning-400 dark:focus:ring-warning-400"
      ),
      error: cn(
        "border-danger-500 focus:border-danger-500 focus:ring-danger-500",
        "dark:border-danger-400 dark:focus:border-danger-400 dark:focus:ring-danger-400"
      ),
    };

    // Base input styles
    const baseInputStyles = cn(
      "flex w-full rounded-lg border bg-white text-gray-900",
      "placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
      "dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400",
      "transition-colors duration-200",
      sizeStyles[size],
      status === "error" ? statusStyles.error : statusStyles[status],
      readOnly && "bg-gray-50 dark:bg-gray-800/50 cursor-default",
      fullWidth && "w-full"
    );

    // Container styles
    const containerStyles = cn("space-y-1", fullWidth && "w-full", className);

    // Status icon
    const renderStatusIcon = () => {
      if (status === "error") {
        return <AlertCircle className="h-4 w-4 text-danger-500" aria-hidden="true" />;
      }
      if (status === "success") {
        return <Check className="h-4 w-4 text-success-500" aria-hidden="true" />;
      }
      if (status === "warning") {
        return <AlertCircle className="h-4 w-4 text-warning-500" aria-hidden="true" />;
      }
      return null;
    };

    // Password toggle
    const passwordToggle = isPassword ? (
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    ) : null;

    // Search icon
    const searchIcon = isSearch ? (
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
    ) : null;

    // Date/Time icon
    const datetimeIcon = isDate || isTime ? (
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {isDate ? (
          <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
        ) : (
          <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
        )}
      </div>
    ) : null;

    return (
      <div className={containerStyles}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700 dark:text-gray-300",
              required && "after:content-['*'] after:ml-1 after:text-danger-500"
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative flex rounded-lg shadow-sm">
          {/* Addon Before */}
          {addonBefore && (
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {addonBefore}
            </span>
          )}

          {/* Input with icons */}
          <div className="relative flex-1">
            {/* Start Icon */}
            {startIcon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-400">{startIcon}</span>
              </div>
            )}

            {/* Search/Date/Time Icon */}
            {searchIcon || datetimeIcon}

            {/* Input */}
            <input
              ref={ref}
              id={inputId}
              type={inputType}
              className={cn(
                baseInputStyles,
                startIcon && "pl-10",
                (isSearch || isDate || isTime) && "pl-10",
                isPassword && "pr-10",
                (endIcon || renderStatusIcon()) && "pr-10",
                addonBefore && "rounded-l-none",
                addonAfter && "rounded-r-none"
              )}
              disabled={disabled}
              readOnly={readOnly}
              aria-invalid={status === "error" || !!error}
              aria-describedby={
                helperText ? `${inputId}-helper` : error ? `${inputId}-error` : undefined
              }
              {...props}
            />

            {/* End Icon or Status Icon */}
            {(endIcon || renderStatusIcon()) && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {endIcon || renderStatusIcon()}
              </div>
            )}

            {/* Password Toggle */}
            {passwordToggle}
          </div>

          {/* Addon After */}
          {addonAfter && (
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {addonAfter}
            </span>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-danger-600 dark:text-danger-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = "InputField";

// Specialized Input Components
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "isSearch" | "startIcon">
>((props, ref) => (
  <InputField ref={ref} isSearch startIcon={<Search className="h-4 w-4" />} {...props} />
));
SearchInput.displayName = "SearchInput";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "isPassword" | "type">
>((props, ref) => <InputField ref={ref} isPassword type="password" {...props} />);
PasswordInput.displayName = "PasswordInput";

export const DateInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "isDate" | "type">
>((props, ref) => <InputField ref={ref} isDate type="date" {...props} />);
DateInput.displayName = "DateInput";

export const TimeInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "isTime" | "type">
>((props, ref) => <InputField ref={ref} isTime type="time" {...props} />);
TimeInput.displayName = "TimeInput";

export const EmailInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "type">
>((props, ref) => <InputField ref={ref} type="email" {...props} />);
EmailInput.displayName = "EmailInput";

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "type">
>((props, ref) => <InputField ref={ref} type="number" {...props} />);
NumberInput.displayName = "NumberInput";

export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputFieldProps, "type">
>((props, ref) => (
  <InputField
    ref={ref}
    type="tel"
    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
    placeholder="010-123-4567"
    {...props}
  />
));
PhoneInput.displayName = "PhoneInput";

export default InputField;
