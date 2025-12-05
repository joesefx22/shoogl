// src/components/common/Card.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** عنوان الكارت */
  title?: string | React.ReactNode;
  /** وصف فرعي */
  subtitle?: string | React.ReactNode;
  /** أيقونة في الهيدر */
  icon?: React.ReactNode;
  /** Actions في الهيدر */
  actions?: React.ReactNode;
  /** حاوية للـ footer */
  footer?: React.ReactNode;
  /** بدون padding */
  noPadding?: boolean;
  /** كارت قابل للنقر */
  clickable?: boolean;
  /** مع ظل عند التحويم */
  hoverable?: boolean;
  /** لون الحدود */
  border?: "default" | "primary" | "success" | "warning" | "danger" | "none";
  /** نوع الكارت */
  variant?: "default" | "elevated" | "outlined" | "filled";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      title,
      subtitle,
      icon,
      actions,
      footer,
      noPadding = false,
      clickable = false,
      hoverable = false,
      border = "default",
      variant = "default",
      children,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = cn(
      "overflow-hidden transition-all duration-200",
      clickable && "cursor-pointer select-none",
      hoverable && "hover:shadow-lg hover:-translate-y-1"
    );

    // Variant styles
    const variantStyles = {
      default: "bg-white dark:bg-gray-800",
      elevated: "bg-white dark:bg-gray-800 shadow-lg",
      outlined: "bg-transparent border",
      filled: "bg-gray-50 dark:bg-gray-800/50",
    };

    // Border styles
    const borderStyles = {
      default: "border border-gray-200 dark:border-gray-700",
      primary: "border-2 border-primary-500 dark:border-primary-400",
      success: "border-2 border-success-500 dark:border-success-400",
      warning: "border-2 border-warning-500 dark:border-warning-400",
      danger: "border-2 border-danger-500 dark:border-danger-400",
      none: "border-0",
    };

    // Rounded styles
    const roundedStyles = "rounded-xl";

    // Header section
    const renderHeader = () => {
      if (!title && !subtitle && !icon && !actions) return null;

      return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
        </div>
      );
    };

    // Footer section
    const renderFooter = () => {
      if (!footer) return null;

      return (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          {footer}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          borderStyles[border],
          roundedStyles,
          className
        )}
        role={clickable ? "button" : "article"}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {renderHeader()}
        <div className={cn(!noPadding && "p-4", !title && "first:pt-0")}>
          {children}
        </div>
        {renderFooter()}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Components
export const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700", className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-gray-500 dark:text-gray-400 mt-1", className)}
    {...props}
  >
    {children}
  </p>
);

export const CardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center p-4 border-t border-gray-100 dark:border-gray-700", className)}
    {...props}
  >
    {children}
  </div>
);

// Pre-built card variants
export const ElevatedCard = React.forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
  (props, ref) => <Card ref={ref} variant="elevated" {...props} />
);
ElevatedCard.displayName = "ElevatedCard";

export const OutlinedCard = React.forwardRef<HTMLDivElement, Omit<CardProps, "variant">>(
  (props, ref) => <Card ref={ref} variant="outlined" {...props} />
);
OutlinedCard.displayName = "OutlinedCard";

export default Card;
