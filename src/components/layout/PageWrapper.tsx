// src/components/layout/PageWrapper.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/navbar/Navbar";
import Sidebar from "@/components/layout/sidebar/Sidebar";
import Topbar from "@/components/layout/topbar/Topbar";
import Footer from "@/components/layout/footer/Footer";
import { Toaster } from "react-hot-toast";
import LoadingScreen from "@/components/common/LoadingScreen";

export interface PageWrapperProps {
  /** محتوى الصفحة */
  children: React.ReactNode;
  /** className إضافي */
  className?: string;
  /** بدون navbar */
  noNavbar?: boolean;
  /** بدون sidebar */
  noSidebar?: boolean;
  /** بدون topbar */
  noTopbar?: boolean;
  /** بدون footer */
  noFooter?: boolean;
  /** بدون padding */
  noPadding?: boolean;
  /** مع scroll */
  withScroll?: boolean;
  /** الحالة */
  status?: "loading" | "error" | "success";
  /** رسالة خطأ */
  errorMessage?: string;
  /** إعادة المحاولة */
  onRetry?: () => void;
  /** layout مخصص */
  customLayout?: {
    navbar?: React.ReactNode;
    sidebar?: React.ReactNode;
    topbar?: React.ReactNode;
    footer?: React.ReactNode;
  };
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className,
  noNavbar = false,
  noSidebar = false,
  noTopbar = false,
  noFooter = false,
  noPadding = false,
  withScroll = true,
  status,
  errorMessage,
  onRetry,
  customLayout,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Determine layout based on route and user role
  const isPublicRoute = [
    "/",
    "/login",
    "/signup",
    "/about",
    "/contact",
    "/stadiums",
    "/play",
    "/play-search",
  ].some((route) => pathname.startsWith(route));

  const isDashboardRoute = [
    "/player",
    "/staff",
    "/owner",
    "/admin",
    "/dashboard",
    "/profile",
    "/settings",
  ].some((route) => pathname.startsWith(route));

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Show loading state
  if (authLoading || status === "loading") {
    return <LoadingScreen />;
  }

  // Show error state
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">😢</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            حدث خطأ
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {errorMessage || "عذرًا، حدث خطأ ما. يرجى المحاولة مرة أخرى."}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-primary-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-primary-700"
            >
              إعادة المحاولة
            </button>
          )}
        </div>
      </div>
    );
  }

  // Auth pages layout (login/signup)
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <Toaster position="top-center" />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    );
  }

  // Public pages layout
  if (isPublicRoute && !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Toaster position="top-center" />
        {!noNavbar && (customLayout?.navbar || <Navbar />)}
        <main
          className={cn(
            "flex-1",
            !noPadding && "px-4 py-6 sm:px-6 lg:px-8",
            withScroll && "overflow-y-auto",
            className
          )}
        >
          {children}
        </main>
        {!noFooter && (customLayout?.footer || <Footer />)}
      </div>
    );
  }

  // Dashboard layout
  if (isDashboardRoute && user) {
    return (
      <div className="flex min-h-screen">
        <Toaster position="top-center" />
        
        {/* Sidebar */}
        {!noSidebar && (
          customLayout?.sidebar || (
            <div className="hidden lg:block">
              <Sidebar collapsed={false} />
            </div>
          )
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs">
              <Sidebar mobile onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Topbar */}
          {!noTopbar && (
            customLayout?.topbar || (
              <Topbar
                showMenuButton={true}
                onMenuClick={() => setSidebarOpen(true)}
                showSearch={false}
                showClock={true}
                showDate={true}
              />
            )
          )}

          {/* Page Content */}
          <main
            className={cn(
              "flex-1",
              !noPadding && "p-4 md:p-6",
              withScroll && "overflow-y-auto",
              className
            )}
          >
            {children}
          </main>

          {/* Footer for dashboard */}
          {!noFooter && (
            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} احجزلي - لوحة التحكم
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default layout (for other pages)
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="top-center" />
      {!noNavbar && (customLayout?.navbar || <Navbar />)}
      {!noTopbar && customLayout?.topbar}
      <main
        className={cn(
          "flex-1",
          !noPadding && "container-custom py-8",
          withScroll && "overflow-y-auto",
          className
        )}
      >
        {children}
      </main>
      {!noFooter && (customLayout?.footer || <Footer />)}
    </div>
  );
};

// Layout variants
export const PublicPageWrapper: React.FC<Omit<PageWrapperProps, "noNavbar" | "noFooter">> = (
  props
) => <PageWrapper {...props} noNavbar={false} noFooter={false} />;

export const DashboardPageWrapper: React.FC<Omit<PageWrapperProps, "noSidebar" | "noTopbar">> = (
  props
) => <PageWrapper {...props} noSidebar={false} noTopbar={false} />;

export const AuthPageWrapper: React.FC<Omit<PageWrapperProps, "noNavbar" | "noFooter" | "noTopbar">> = (
  props
) => <PageWrapper {...props} noNavbar={true} noFooter={true} noTopbar={true} />;

export const FullWidthPageWrapper: React.FC<Omit<PageWrapperProps, "noPadding">> = (
  props
) => <PageWrapper {...props} noPadding={true} />;

export default PageWrapper;
