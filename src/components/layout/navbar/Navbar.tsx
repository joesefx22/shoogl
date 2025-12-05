// src/components/layout/navbar/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import { SearchInput } from "@/components/common/inputs/InputField";
import {
  Home,
  Search,
  Calendar,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  Settings,
  Shield,
  Building,
  Trophy,
  MapPin,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: string[];
  subItems?: NavItem[];
}

export interface NavbarProps {
  /** className إضافي */
  className?: string;
  /** شفافية */
  transparent?: boolean;
  /** ثابت في الأعلى */
  fixed?: boolean;
  /** مع حدود */
  bordered?: boolean;
  /** إظهار شريط البحث */
  showSearch?: boolean;
  /** إظهار إشعارات */
  showNotifications?: boolean;
  /** إظتبار رسائل */
  showMessages?: boolean;
  /** مخصص */
  customItems?: NavItem[];
}

const Navbar: React.FC<NavbarProps> = ({
  className,
  transparent = false,
  fixed = true,
  bordered = true,
  showSearch = true,
  showNotifications = true,
  showMessages = true,
  customItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Handle scroll for background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Default navigation items
  const defaultItems: NavItem[] = [
    {
      label: "الرئيسية",
      href: "/",
      icon: <Home className="h-4 w-4" />,
      roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
    },
    {
      label: "ملاعب كرة قدم",
      href: "/stadiums?type=football",
      icon: <Trophy className="h-4 w-4" />,
      roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
    },
    {
      label: "ملاعب بادل",
      href: "/stadiums?type=paddle",
      icon: <MapPin className="h-4 w-4" />,
      roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
    },
    {
      label: "لاعبوني معاكم",
      href: "/play-search",
      icon: <Users className="h-4 w-4" />,
      roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
    },
    {
      label: "حجوزاتي",
      href: "/player/bookings",
      icon: <Calendar className="h-4 w-4" />,
      roles: ["PLAYER"],
    },
  ];

  // Dashboard links based on role
  const dashboardLinks: NavItem[] = [
    {
      label: "لوحة اللاعب",
      href: "/player/dashboard",
      icon: <User className="h-4 w-4" />,
      roles: ["PLAYER"],
    },
    {
      label: "لوحة الموظف",
      href: "/staff/dashboard",
      icon: <Shield className="h-4 w-4" />,
      roles: ["STAFF"],
    },
    {
      label: "لوحة المالك",
      href: "/owner/dashboard",
      icon: <Building className="h-4 w-4" />,
      roles: ["OWNER"],
    },
    {
      label: "لوحة المدير",
      href: "/admin/dashboard",
      icon: <Settings className="h-4 w-4" />,
      roles: ["ADMIN"],
    },
  ];

  // Filter items based on user role
  const filteredItems = (customItems || defaultItems).filter((item) => {
    if (!item.roles) return true;
    if (!user) return item.roles.includes("PLAYER"); // Show player items for guests
    return item.roles.includes(user.role);
  });

  const filteredDashboardLinks = dashboardLinks.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Check if item is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={cn(
          "z-50 w-full transition-all duration-300",
          fixed && "fixed top-0 left-0 right-0",
          transparent && !scrolled
            ? "bg-transparent"
            : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md",
          bordered && "border-b border-gray-200 dark:border-gray-800",
          scrolled && "shadow-lg",
          className
        )}
      >
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    احجزلي
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    نظام حجز الملاعب
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4 rtl:space-x-reverse">
              {/* Navigation Items */}
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {filteredItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 rtl:space-x-reverse",
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    )}
                  >
                    {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Search Bar */}
              {showSearch && (
                <form onSubmit={handleSearch} className="hidden md:block">
                  <SearchInput
                    placeholder="ابحث عن ملعب أو لاعب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    size="sm"
                  />
                </form>
              )}

              {/* User Actions */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {user ? (
                  <>
                    {/* Notifications */}
                    {showNotifications && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                        aria-label="الإشعارات"
                      >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-xs text-white">
                          3
                        </span>
                      </Button>
                    )}

                    {/* Messages */}
                    {showMessages && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="الرسائل"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    )}

                    {/* User Menu */}
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 rtl:space-x-reverse"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <span className="hidden md:inline">{user.name || "مستخدم"}</span>
                      </Button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dark:bg-gray-800 dark:ring-gray-700">
                        <div className="py-2">
                          {/* Dashboard Link */}
                          {filteredDashboardLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rtl:space-x-reverse dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              {link.icon}
                              <span>{link.label}</span>
                            </Link>
                          ))}

                          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                          {/* Profile */}
                          <Link
                            href="/profile"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rtl:space-x-reverse dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <User className="h-4 w-4" />
                            <span>الملف الشخصي</span>
                          </Link>

                          {/* Settings */}
                          <Link
                            href="/settings"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rtl:space-x-reverse dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Settings className="h-4 w-4" />
                            <span>الإعدادات</span>
                          </Link>

                          <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 rtl:space-x-reverse dark:text-danger-400 dark:hover:bg-danger-900/20"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => router.push("/login")}
                    >
                      تسجيل الدخول
                    </Button>
                    <Button
                      onClick={() => router.push("/signup")}
                    >
                      إنشاء حساب
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              {showSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  onClick={() => router.push("/search")}
                  aria-label="بحث"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="القائمة"
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl dark:bg-gray-800">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold">القائمة</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="h-[calc(100%-4rem)] overflow-y-auto p-4">
              {/* Mobile Search */}
              {showSearch && (
                <form onSubmit={handleSearch} className="mb-4">
                  <SearchInput
                    placeholder="ابحث عن ملعب أو لاعب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                  />
                </form>
              )}

              {/* Navigation Items */}
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 rtl:space-x-reverse",
                      isActive(item.href)
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    )}
                  >
                    {item.icon && <span className="h-5 w-5">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* User Section */}
              {user ? (
                <>
                  <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
                  
                  <div className="mb-4 flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name || "مستخدم"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Dashboard Links */}
                    {filteredDashboardLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rtl:space-x-reverse dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    ))}

                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rtl:space-x-reverse dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <User className="h-5 w-5" />
                      <span>الملف الشخصي</span>
                    </Link>

                    {showNotifications && (
                      <button className="flex w-full items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rtl:space-x-reverse dark:text-gray-300 dark:hover:bg-gray-700">
                        <Bell className="h-5 w-5" />
                        <span>الإشعارات</span>
                        <span className="ml-auto rounded-full bg-danger-500 px-2 py-0.5 text-xs text-white">
                          3
                        </span>
                      </button>
                    )}

                    <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-danger-600 hover:bg-danger-50 rtl:space-x-reverse dark:text-danger-400 dark:hover:bg-danger-900/20"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      onClick={() => {
                        router.push("/login");
                        setIsOpen(false);
                      }}
                    >
                      تسجيل الدخول
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        router.push("/signup");
                        setIsOpen(false);
                      }}
                    >
                      إنشاء حساب
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
