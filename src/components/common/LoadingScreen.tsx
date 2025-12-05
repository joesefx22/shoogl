// src/components/common/LoadingScreen.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingScreenProps {
  /** نص التحميل */
  text?: string;
  /** نص فرعي */
  subtitle?: string;
  /** حجم التحميل */
  size?: "sm" | "md" | "lg" | "xl";
  /** نوع التحميل */
  type?: "spinner" | "dots" | "pulse" | "progress";
  /** شفافية الخلفية */
  withOverlay?: boolean;
  /** ملء الشاشة */
  fullScreen?: boolean;
  /** className إضافي */
  className?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = "جاري التحميل...",
  subtitle,
  size = "md",
  type = "spinner",
  withOverlay = true,
  fullScreen = true,
  className,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const renderLoader = () => {
    switch (type) {
      case "dots":
        return (
          <div className="flex space-x-2 rtl:space-x-reverse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-3 w-3 animate-bounce rounded-full bg-primary-600",
                  sizeClasses[size]
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div className="relative">
            <div
              className={cn(
                "animate-ping rounded-full bg-primary-600 opacity-75",
                sizeClasses[size]
              )}
            />
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-primary-600",
                sizeClasses[size]
              )}
            />
          </div>
        );

      case "progress":
        return (
          <div className="w-48">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full animate-progress rounded-full bg-primary-600"
                style={{ animation: "progress 2s ease-in-out infinite" }}
              />
            </div>
          </div>
        );

      default: // spinner
        return <Loader2 className={cn("animate-spin text-primary-600", sizeClasses[size])} />;
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8",
        fullScreen && "min-h-screen",
        className
      )}
    >
      <div className="mb-4">{renderLoader()}</div>
      {text && (
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          {text}
        </h3>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );

  if (withOverlay) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        {content}
      </div>
    );
  }

  return content;
};

// CSS animation for progress bar
const progressStyles = `
  @keyframes progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`;

// Add to global styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = progressStyles;
  document.head.appendChild(style);
}

export default LoadingScreen;
