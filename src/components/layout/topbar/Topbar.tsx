// src/components/layout/topbar/Topbar.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import {
  Bell,
  Search,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Menu,
  X,
  User,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

export interface TopbarProps {
  /** className إضافي */
  className?: string;
  /** إظهار زر القائمة */
  showMenuButton?: boolean;
  /** حدث عند الضغط على زر القائمة */
  onMenuClick?: () => void;
  /** إظهار بحث */
  showSearch?: boolean;
  /** إظهار إشعارات */
  showNotifications?: boolean;
  /** إظهار وضع الليل */
  showDarkModeToggle?: boolean;
  /** إظهار الساعة */
  showClock?: boolean;
  /** إظهار التاريخ */
  showDate?: boolean;
  /** إظهار الموقع */
  showLocation?: boolean;
  /** شفافية */
  transparent?: boolean;
  /** مع حدود */
  bordered?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({
  className,
  showMenuButton = false,
  onMenuClick,
  showSearch = true,
  showNotifications = true,
  showDarkModeToggle = true,
  showClock = true,
  showDate = true,
  showLocation = false,
  transparent = false,
  bordered = true,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pathname = usePathname();
  const { user } = useAuth();

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format time
  const formattedTime = currentTime.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format date
  const formattedDate = currentTime.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format short date
  const shortDate = currentTime.toLocaleDateString("ar-EG", {
    month: "short",
    day: "numeric",
  });

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === "/") return "الرئيسية";
    if (pathname.startsWith("/stadiums")) return "الملاعب";
    if (pathname.startsWith("/player")) return "لوحة اللاعب";
    if (pathname.startsWith("/staff")) return "لوحة الموظف";
    if (pathname.startsWith("/owner")) return "لوحة المالك";
    if (pathname.startsWith("/admin")) return "لوحة المدير";
    if (pathname.startsWith("/bookings")) return "الحجوزات";
    if (pathname.startsWith("/play")) return "طلبات اللاعبين";
    if (pathname.startsWith("/profile")) return "الملف الشخصي";
    if (pathname.startsWith("/settings")) return "الإعدادات";
    return "احجزلي";
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search logic
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        transparent ? "bg-transparent" : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md",
        bordered && "border-b border-gray-200 dark:border-gray-800",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Menu Button */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
            {user && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                مرحبًا، {user.name || "مستخدم"}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="hidden items-center space-x-4 text-sm rtl:space-x-reverse md:flex">
            {showDate && (
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 rtl:space-x-reverse">
                <Calendar className="h-4 w-4" />
                <span>{shortDate}</span>
              </div>
            )}
            {showClock && (
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 rtl:space-x-reverse">
                <Clock className="h-4 w-4" />
                <span>{formattedTime}</span>
              </div>
            )}
            {showLocation && (
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 rtl:space-x-reverse">
                <MapPin className="h-4 w-4" />
                <span>القاهرة</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Search (Desktop) */}
        {showSearch && !isSearchOpen && (
          <div className="hidden flex-1 max-w-md px-6 lg:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن ملعب، لاعب، أو مدينة..."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white rtl:pl-4 rtl:pr-10"
              />
            </form>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Search Button (Mobile) */}
          {showSearch && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden"
                aria-label="بحث"
              >
                {isSearchOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>

              {/* Mobile Search Overlay */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-14 z-50 border-b border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900 lg:hidden">
                  <form onSubmit={handleSearch} className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن ملعب، لاعب، أو مدينة..."
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white rtl:pl-4 rtl:pr-10"
                      autoFocus
                    />
                  </form>
                </div>
              )}
            </>
          )}

          {/* Dark Mode Toggle */}
          {showDarkModeToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="الإشعارات"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs font-medium text-white">
                3
              </span>
            </div>
          )}

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="المساعدة"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="الإعدادات"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Avatar */}
          {user && (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full Date (Mobile) */}
      {(showDate || showClock) && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400 md:hidden">
          {showDate && <span>{formattedDate}</span>}
          {showClock && <span>{formattedTime}</span>}
        </div>
      )}
    </header>
  );
};

// Variants
export const DashboardTopbar: React.FC<Omit<TopbarProps, "showMenuButton" | "showSearch">> = (
  props
) => (
  <Topbar
    {...props}
    showMenuButton={true}
    showSearch={false}
    showClock={true}
    showDate={true}
    showLocation={true}
  />
);

export const PublicTopbar: React.FC<Omit<TopbarProps, "showMenuButton" | "showNotifications">> = (
  props
) => (
  <Topbar
    {...props}
    showMenuButton={false}
    showNotifications={false}
    showSearch={true}
    showClock={false}
    showDate={false}
    transparent={true}
  />
);

export default Topbar;
