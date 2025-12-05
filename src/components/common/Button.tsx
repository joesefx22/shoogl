// src/components/common/Button.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** نوع الزر */
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline" | "link";
  /** حجم الزر */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  /** حالة التحميل */
  isLoading?: boolean;
  /** أيقونة تظهر قبل النص */
  startIcon?: React.ReactNode;
  /** أيقونة تظهر بعد النص */
  endIcon?: React.ReactNode;
  /** عرض كامل */
  fullWidth?: boolean;
  /** شكل مستدير (pill) */
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  /** تأثير عند التحويم */
  hoverEffect?: "scale" | "shadow" | "glow" | "none";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      children,
      startIcon,
      endIcon,
      fullWidth = false,
      rounded = "md",
      hoverEffect = "scale",
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = cn(
      "inline-flex items-center justify-center font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
      "whitespace-nowrap",
      fullWidth && "w-full"
    );

    // Variant styles
    const variantStyles = {
      primary: cn(
        "bg-primary-600 text-white",
        "hover:bg-primary-700 active:bg-primary-800",
        "focus:ring-primary-500",
        "border border-primary-600"
      ),
      secondary: cn(
        "bg-secondary-200 text-secondary-800",
        "hover:bg-secondary-300 active:bg-secondary-400",
        "focus:ring-secondary-500",
        "border border-secondary-300",
        "dark:bg-secondary-700 dark:text-secondary-200 dark:hover:bg-secondary-600"
      ),
      success: cn(
        "bg-success-500 text-white",
        "hover:bg-success-600 active:bg-success-700",
        "focus:ring-success-500",
        "border border-success-500"
      ),
      warning: cn(
        "bg-warning-500 text-white",
        "hover:bg-warning-600 active:bg-warning-700",
        "focus:ring-warning-500",
        "border border-warning-500"
      ),
      danger: cn(
        "bg-danger-500 text-white",
        "hover:bg-danger-600 active:bg-danger-700",
        "focus:ring-danger-500",
        "border border-danger-500"
      ),
      ghost: cn(
        "bg-transparent text-primary-600",
        "hover:bg-primary-50 active:bg-primary-100",
        "focus:ring-primary-500",
        "dark:text-primary-400 dark:hover:bg-primary-900/20"
      ),
      outline: cn(
        "bg-transparent text-primary-600 border-2 border-primary-600",
        "hover:bg-primary-50 active:bg-primary-100",
        "focus:ring-primary-500",
        "dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-900/20"
      ),
      link: cn(
        "bg-transparent text-primary-600 underline-offset-4",
        "hover:underline hover:text-primary-800",
        "focus:ring-primary-500",
        "dark:text-primary-400 dark:hover:text-primary-300"
      ),
    };

    // Size styles
    const sizeStyles = {
      xs: cn("h-6 px-2 text-xs", rounded !== "full" && "rounded"),
      sm: cn("h-8 px-3 text-sm", rounded !== "full" && "rounded-md"),
      md: cn("h-10 px-4 py-2", rounded !== "full" && "rounded-lg"),
      lg: cn("h-12 px-6 text-lg", rounded !== "full" && "rounded-lg"),
      xl: cn("h-14 px-8 text-xl", rounded !== "full" && "rounded-xl"),
      icon: cn("h-10 w-10 p-0", rounded !== "full" && "rounded-lg"),
    };

    // Rounded styles
    const roundedStyles = {
      none: "rounded-none",
      sm: "rounded",
      md: "rounded-lg",
      lg: "rounded-xl",
      full: "rounded-full",
    };

    // Hover effects
    const hoverEffects = {
      scale: "hover:scale-[1.02] active:scale-[0.98]",
      shadow: "hover:shadow-lg hover:-translate-y-0.5",
      glow: "hover:shadow-lg hover:shadow-primary-500/30",
      none: "",
    };

    // Loading styles
    const loadingStyles = isLoading ? "cursor-wait" : "";

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          roundedStyles[rounded],
          hoverEffects[hoverEffect],
          loadingStyles,
          className
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2
            className={cn(
              "h-4 w-4 animate-spin",
              children ? (startIcon ? "ml-2" : "mr-2") : "",
              "rtl:ml-2 rtl:mr-0"
            )}
            aria-hidden="true"
          />
        )}
        {!isLoading && startIcon && (
          <span className="mr-2 rtl:mr-0 rtl:ml-2" aria-hidden="true">
            {startIcon}
          </span>
        )}
        {children && <span className="truncate">{children}</span>}
        {!isLoading && endIcon && (
          <span className="ml-2 rtl:ml-0 rtl:mr-2" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Variants for different uses
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
);
PrimaryButton.displayName = "PrimaryButton";

export const SuccessButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="success" {...props} />
);
SuccessButton.displayName = "SuccessButton";

export const DangerButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="danger" {...props} />
);
DangerButton.displayName = "DangerButton";

export const OutlineButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />
);
OutlineButton.displayName = "OutlineButton";

export default Button;
