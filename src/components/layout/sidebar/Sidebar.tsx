// src/components/layout/sidebar/Sidebar.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building,
  Settings,
  Shield,
  Trophy,
  MapPin,
  Bell,
  User,
  FileText,
  BarChart,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  Star,
} from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  subItems?: SidebarItem[];
  badge?: number | string;
}

export interface SidebarProps {
  /** className إضافي */
  className?: string;
  /** متقلص */
  collapsed?: boolean;
  /** قابل للطي */
  collapsible?: boolean;
  /** وضع mobile */
  mobile?: boolean;
  /** مخصص */
  customItems?: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  collapsed: defaultCollapsed = false,
  collapsible = true,
  mobile = false,
  customItems,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Default sidebar items based on role
  const getDefaultItems = (): SidebarItem[] => {
    if (!user) return [];

    const commonItems: SidebarItem[] = [
      {
        label: "الرئيسية",
        href: "/",
        icon: <Home className="h-5 w-5" />,
        roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
      },
      {
        label: "الملف الشخصي",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
        roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
      },
      {
        label: "الإشعارات",
        href: "/notifications",
        icon: <Bell className="h-5 w-5" />,
        roles: ["PLAYER", "STAFF", "OWNER", "ADMIN"],
        badge: 3,
      },
    ];

    const playerItems: SidebarItem[] = [
      {
        label: "لوحة اللاعب",
        href: "/player/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        roles: ["PLAYER"],
      },
      {
        label: "حجوزاتي",
        href: "/player/bookings",
        icon: <Calendar className="h-5 w-5" />,
        roles: ["PLAYER"],
      },
      {
        label: "طلبات اللاعبين",
        href: "/player/play-requests",
        icon: <Users className="h-5 w-5" />,
        roles: ["PLAYER"],
      },
      {
        label: "المدفوعات",
        href: "/player/payments",
        icon: <CreditCard className="h-5 w-5" />,
        roles: ["PLAYER"],
      },
    ];

    const staffItems: SidebarItem[] = [
      {
        label: "لوحة الموظف",
        href: "/staff/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        roles: ["STAFF"],
      },
      {
        label: "حجوزات الملعب",
        href: "/staff/bookings",
        icon: <Calendar className="h-5 w-5" />,
        roles: ["STAFF"],
      },
      {
        label: "طلبات اللاعبين",
        href: "/staff/play-requests",
        icon: <Users className="h-5 w-5" />,
        roles: ["STAFF"],
      },
      {
        label: "تقارير اليوم",
        href: "/staff/reports",
        icon: <BarChart className="h-5 w-5" />,
        roles: ["STAFF"],
      },
    ];

    const ownerItems: SidebarItem[] = [
      {
        label: "لوحة المالك",
        href: "/owner/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        roles: ["OWNER"],
      },
      {
        label: "ملاعب",
        href: "/owner/stadiums",
        icon: <Building className="h-5 w-5" />,
        roles: ["OWNER"],
        subItems: [
          {
            label: "جميع الملاعب",
            href: "/owner/stadiums",
            icon: <Trophy className="h-4 w-4" />,
            roles: ["OWNER"],
          },
          {
            label: "إضافة ملعب",
            href: "/owner/stadiums/new",
            icon: <MapPin className="h-4 w-4" />,
            roles: ["OWNER"],
          },
          {
            label: "تقييمات",
            href: "/owner/stadiums/ratings",
            icon: <Star className="h-4 w-4" />,
            roles: ["OWNER"],
          },
        ],
      },
      {
        label: "الحجوزات",
        href: "/owner/bookings",
        icon: <Calendar className="h-5 w-5" />,
        roles: ["OWNER"],
      },
      {
        label: "التقارير",
        href: "/owner/analytics",
        icon: <BarChart className="h-5 w-5" />,
        roles: ["OWNER"],
      },
      {
        label: "الموظفون",
        href: "/owner/staff",
        icon: <Shield className="h-5 w-5" />,
        roles: ["OWNER"],
      },
    ];

    const adminItems: SidebarItem[] = [
      {
        label: "لوحة المدير",
        href: "/admin/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        roles: ["ADMIN"],
      },
      {
        label: "المستخدمون",
        href: "/admin/users",
        icon: <Users className="h-5 w-5" />,
        roles: ["ADMIN"],
      },
      {
        label: "الملاعب",
        href: "/admin/stadiums",
        icon: <Building className="h-5 w-5" />,
        roles: ["ADMIN"],
      },
      {
        label: "التقارير",
        href: "/admin/reports",
        icon: <BarChart className="h-5 w-5" />,
        roles: ["ADMIN"],
      },
      {
        label: "الأكواد",
        href: "/admin/codes",
        icon: <FileText className="h-5 w-5" />,
        roles: ["ADMIN"],
      },
      {
        label: "الإعدادات",
        href: "/admin/settings",
        icon: <Settings className="h-5 w-5" />,
        roles: ["ADMIN"],
      },
    ];

    return [
      ...commonItems,
      ...(user.role === "PLAYER" ? playerItems : []),
      ...(user.role === "STAFF" ? staffItems : []),
      ...(user.role === "OWNER" ? ownerItems : []),
      ...(user.role === "ADMIN" ? adminItems : []),
    ];
  };

  const items = customItems || getDefaultItems();
  const filteredItems = items.filter((item) => item.roles.includes(user?.role || ""));

  // Check if item is active
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  const sidebarWidth = collapsed ? "w-16" : "w-64";
  const isExpanded = hovered && collapsed && !mobile;

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900",
        sidebarWidth,
        mobile ? "w-full" : "h-screen sticky top-0",
        className
      )}
      onMouseEnter={() => collapsible && setHovered(true)}
      onMouseLeave={() => collapsible && setHovered(false)}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        {!collapsed || isExpanded ? (
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">احجزلي</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.role === "PLAYER" && "لاعب"}
                {user?.role === "STAFF" && "موظف"}
                {user?.role === "OWNER" && "مالك"}
                {user?.role === "ADMIN" && "مدير"}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
            <Trophy className="h-5 w-5 text-white" />
          </div>
        )}

        {/* Collapse Button */}
        {collapsible && !mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
            aria-label={collapsed ? "توسيع الشريط الجانبي" : "طي الشريط الجانبي"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* User Profile */}
      {user && (!collapsed || isExpanded) && (
        <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-white">
                {user.name || "مستخدم"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const active = isActive(item.href);
            const showLabel = !collapsed || isExpanded;

            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                >
                  <span className={cn("flex-shrink-0", showLabel ? "mr-3" : "mx-auto")}>
                    {item.icon}
                  </span>
                  {showLabel && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 rounded-full bg-danger-500 px-2 py-0.5 text-xs font-medium text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Sub Items */}
                {item.subItems && showLabel && (
                  <div className="ml-7 mt-1 space-y-1 border-l border-gray-200 pl-3 dark:border-gray-700">
                    {item.subItems
                      .filter((subItem) => subItem.roles.includes(user?.role || ""))
                      .map((subItem) => {
                        const subActive = isActive(subItem.href);

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors duration-200",
                              subActive
                                ? "text-primary-700 dark:text-primary-400"
                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            )}
                          >
                            <span className="mr-2 h-4 w-4">{subItem.icon}</span>
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        {/* Help */}
        <Link
          href="/help"
          className={cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
            (!collapsed || isExpanded) ? "justify-start" : "justify-center"
          )}
        >
          <HelpCircle className="h-5 w-5" />
          {(!collapsed || isExpanded) && <span className="mr-3">المساعدة</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "mt-2 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/20",
            (!collapsed || isExpanded) ? "justify-start" : "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {(!collapsed || isExpanded) && <span className="mr-3">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
