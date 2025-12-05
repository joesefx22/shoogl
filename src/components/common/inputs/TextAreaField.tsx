// src/components/common/inputs/TextAreaField.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Check } from "lucide-react";

export interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label للـ textarea */
  label?: string;
  /** مساعدة أو وصف تحت الـ textarea */
  helperText?: string;
  /** رسالة خطأ */
  error?: string;
  /** وضع full width */
  fullWidth?: boolean;
  /** أيقونة في البداية */
  startIcon?: React.ReactNode;
  /** حجم الـ textarea */
  size?: "sm" | "md" | "lg";
  /** حالة الـ textarea */
  status?: "default" | "success" | "warning" | "error";
  /** مطلوب */
  required?: boolean;
  /** عداد الأحرف */
  showCharCount?: boolean;
  /** الحد الأقصى للأحرف */
  maxLength?: number;
  /** الحد الأدنى للأحرف */
  minLength?: number;
  /** عدد الصفوف */
  rows?: number;
  /** توسيع تلقائي مع النص */
  autoResize?: boolean;
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      size = "md",
      status = "default",
      required = false,
      showCharCount = false,
      maxLength,
      minLength,
      rows = 3,
      autoResize = false,
      disabled = false,
      readOnly = false,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    // Handle auto resize
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Handle character count
    React.useEffect(() => {
      if (value) {
        const count = typeof value === "string" ? value.length : 0;
        setCharCount(count);
      } else {
        setCharCount(0);
      }
    }, [value]);

    // Size styles
    const sizeStyles = {
      sm: "text-sm px-2 py-1",
      md: "px-3 py-2",
      lg: "text-lg px-4 py-3",
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

    // Base textarea styles
    const baseTextareaStyles = cn(
      "block w-full rounded-lg border bg-white text-gray-900",
      "placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
      "dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400",
      "transition-colors duration-200 resize-none",
      sizeStyles[size],
      status === "error" ? statusStyles.error : statusStyles[status],
      readOnly && "bg-gray-50 dark:bg-gray-800/50 cursor-default",
      startIcon && "pl-10"
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

    // Character count color
    const getCharCountColor = () => {
      if (!maxLength) return "text-gray-500";
      const percentage = (charCount / maxLength) * 100;
      if (percentage >= 90) return "text-danger-500";
      if (percentage >= 75) return "text-warning-500";
      return "text-success-500";
    };

    return (
      <div className={containerStyles}>
        {/* Label and char count */}
        <div className="flex items-center justify-between">
          {/* Label */}
          {label && (
            <label
              htmlFor={textareaId}
              className={cn(
                "block text-sm font-medium text-gray-700 dark:text-gray-300",
                required && "after:content-['*'] after:ml-1 after:text-danger-500"
              )}
            >
              {label}
            </label>
          )}

          {/* Character count */}
          {showCharCount && maxLength && (
            <span className={cn("text-xs", getCharCountColor())}>
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        {/* Textarea Container */}
        <div className="relative">
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="text-gray-400">{startIcon}</span>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              textareaRef.current = node;
            }}
            id={textareaId}
            rows={rows}
            className={baseTextareaStyles}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e);
              if (autoResize && textareaRef.current) {
                const textarea = textareaRef.current;
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
              }
            }}
            maxLength={maxLength}
            minLength={minLength}
            aria-invalid={status === "error" || !!error}
            aria-describedby={
              helperText ? `${textareaId}-helper` : error ? `${textareaId}-error` : undefined
            }
            {...props}
          />

          {/* Status Icon */}
          {renderStatusIcon() && (
            <div className="absolute top-3 right-3 pointer-events-none">
              {renderStatusIcon()}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${textareaId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${textareaId}-error`}
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

TextAreaField.displayName = "TextAreaField";

// Specialized TextArea Components
export const NotesTextArea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<TextAreaFieldProps, "placeholder" | "rows">
>((props, ref) => (
  <TextAreaField
    ref={ref}
    placeholder="أضف ملاحظات إضافية..."
    rows={2}
    maxLength={500}
    showCharCount
    {...props}
  />
));
NotesTextArea.displayName = "NotesTextArea";

export const DescriptionTextArea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<TextAreaFieldProps, "placeholder" | "rows">
>((props, ref) => (
  <TextAreaField
    ref={ref}
    placeholder="أضف وصفًا مفصلاً..."
    rows={4}
    maxLength={1000}
    showCharCount
    {...props}
  />
));
DescriptionTextArea.displayName = "DescriptionTextArea";

export const AddressTextArea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<TextAreaFieldProps, "placeholder" | "rows">
>((props, ref) => (
  <TextAreaField
    ref={ref}
    placeholder="أدخل العنوان الكامل..."
    rows={2}
    maxLength={200}
    {...props}
  />
));
AddressTextArea.displayName = "AddressTextArea";

export default TextAreaField;
