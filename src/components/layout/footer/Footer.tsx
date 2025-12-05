// src/components/layout/footer/Footer.tsx
import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  CreditCard,
  Headphones,
  Globe,
} from "lucide-react";

export interface FooterProps {
  /** className إضافي */
  className?: string;
  /** مع حدود */
  bordered?: boolean;
  /** حجم */
  size?: "default" | "compact" | "expanded";
  /** إظهار معلومات الشركة */
  showCompanyInfo?: boolean;
  /** إظهار روابط سريعة */
  showQuickLinks?: boolean;
  /** إظهار التواصل الاجتماعي */
  showSocialLinks?: boolean;
  /** إظهار سياسات */
  showPolicies?: boolean;
  /** إظهار النشرة الإخبارية */
  showNewsletter?: boolean;
}

const Footer: React.FC<FooterProps> = ({
  className,
  bordered = true,
  size = "default",
  showCompanyInfo = true,
  showQuickLinks = true,
  showSocialLinks = true,
  showPolicies = true,
  showNewsletter = true,
}) => {
  // Quick links
  const quickLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "ملاعب كرة قدم", href: "/stadiums?type=football" },
    { label: "ملاعب بادل", href: "/stadiums?type=paddle" },
    { label: "لاعبوني معاكم", href: "/play-search" },
    { label: "كيفية الحجز", href: "/how-to-book" },
    { label: "الأسعار", href: "/pricing" },
    { label: "عن احجزلي", href: "/about" },
    { label: "اتصل بنا", href: "/contact" },
  ];

  // Social links
  const socialLinks = [
    {
      label: "Facebook",
      href: "https://facebook.com/ehgzly",
      icon: <Facebook className="h-5 w-5" />,
    },
    {
      label: "Twitter",
      href: "https://twitter.com/ehgzly",
      icon: <Twitter className="h-5 w-5" />,
    },
    {
      label: "Instagram",
      href: "https://instagram.com/ehgzly",
      icon: <Instagram className="h-5 w-5" />,
    },
    {
      label: "YouTube",
      href: "https://youtube.com/ehgzly",
      icon: <Youtube className="h-5 w-5" />,
    },
  ];

  // Policy links
  const policyLinks = [
    { label: "شروط الاستخدام", href: "/terms" },
    { label: "سياسة الخصوصية", href: "/privacy" },
    { label: "سياسة الاسترداد", href: "/refund" },
    { label: "سياسة الحجز", href: "/booking-policy" },
    { label: "الأسئلة الشائعة", href: "/faq" },
  ];

  // Contact info
  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5" />,
      label: "الهاتف",
      value: "01012345678",
      href: "tel:+201012345678",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "البريد الإلكتروني",
      value: "support@ehgzly.com",
      href: "mailto:support@ehgzly.com",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "العنوان",
      value: "القاهرة، مصر",
      href: "https://maps.google.com/?q=القاهرة،+مصر",
    },
  ];

  // Payment methods
  const paymentMethods = [
    { name: "Visa", icon: "/icons/payments/visa.svg" },
    { name: "Mastercard", icon: "/icons/payments/mastercard.svg" },
    { name: "Paymob", icon: "/icons/payments/paymob.svg" },
    { name: "Vodafone Cash", icon: "/icons/payments/vodafone.svg" },
    { name: "Orange Money", icon: "/icons/payments/orange.svg" },
    { name: "Etisalat Cash", icon: "/icons/payments/etisalat.svg" },
  ];

  return (
    <footer
      className={cn(
        "bg-gray-50 dark:bg-gray-900 transition-colors duration-300",
        bordered && "border-t border-gray-200 dark:border-gray-800",
        size === "compact" && "py-6",
        size === "expanded" && "py-12",
        !size && "py-8",
        className
      )}
    >
      <div className="container-custom">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          {showCompanyInfo && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    احجزلي
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نظام حجز الملاعب الرياضية
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                منصة متكاملة لحجز الملاعب الرياضية بكرة القدم والبادةل في جميع أنحاء
                مصر. نوفر لك أفضل تجربة حجز مع ضمان الجودة والكفاءة.
              </p>
              {showSocialLinks && (
                <div className="flex space-x-3 rtl:space-x-reverse">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 transition-colors duration-200 hover:bg-primary-500 hover:text-white dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary-600"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          {showQuickLinks && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                روابط سريعة
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors duration-200 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              تواصل معنا
            </h4>
            <div className="space-y-3">
              {contactInfo.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  className="flex items-center space-x-3 text-sm text-gray-600 transition-colors duration-200 hover:text-primary-600 rtl:space-x-reverse dark:text-gray-400 dark:hover:text-primary-400"
                >
                  <span className="flex-shrink-0 text-gray-400">{info.icon}</span>
                  <div>
                    <div className="font-medium">{info.label}</div>
                    <div>{info.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                اشترك في النشرة الإخبارية
              </h4>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                اشترك للحصول على آخر العروض والتحديثات.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  اشتراك
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-800" />

        {/* Middle Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Features */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Shield className="h-8 w-8 text-primary-500" />
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                آمن وسهل
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                حجوزات آمنة مع نظام دفع متكامل
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Headphones className="h-8 w-8 text-primary-500" />
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                دعم 24/7
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                فريق دعم متاح على مدار الساعة
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <CreditCard className="h-8 w-8 text-primary-500" />
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                وسائل دفع متعددة
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                دفع إلكتروني ونقدي عند الوصول
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8">
          <h5 className="mb-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            وسائل الدفع المقبولة
          </h5>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex h-10 w-16 items-center justify-center rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800"
                title={method.name}
              >
                <div className="h-6 w-12 bg-gray-300 dark:bg-gray-600" />
                {/* In real app, use: <Image src={method.icon} alt={method.name} width={48} height={24} /> */}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-800" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} احجزلي. جميع الحقوق محفوظة.
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              صنع ب <Heart className="inline h-3 w-3 text-danger-500" /> في مصر
            </p>
          </div>

          {/* Policy Links */}
          {showPolicies && (
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
              {policyLinks.map((policy) => (
                <Link
                  key={policy.href}
                  href={policy.href}
                  className="text-sm text-gray-600 transition-colors duration-200 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  {policy.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* App Download */}
        <div className="mt-8 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-center text-white">
          <h4 className="mb-2 text-xl font-bold">حمل تطبيق احجزلي الآن!</h4>
          <p className="mb-4 opacity-90">
            احجز ملاعبك المفضلة من أي مكان وفي أي وقت.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.ehgzly.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-lg bg-black/20 px-4 py-2 transition-colors duration-200 hover:bg-black/30 rtl:space-x-reverse"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
                />
              </svg>
              <span>Google Play</span>
            </a>
            <a
              href="https://apps.apple.com/app/id1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-lg bg-black/20 px-4 py-2 transition-colors duration-200 hover:bg-black/30 rtl:space-x-reverse"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"
                />
              </svg>
              <span>App Store</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Variants
export const CompactFooter: React.FC<Omit<FooterProps, "size">> = (props) => (
  <Footer {...props} size="compact" showNewsletter={false} />
);

export const ExpandedFooter: React.FC<Omit<FooterProps, "size">> = (props) => (
  <Footer {...props} size="expanded" />
);

export default Footer;
