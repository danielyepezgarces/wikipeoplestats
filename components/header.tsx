'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  Flag,
  Calendar,
  Book,
  User,
  BookOpen,
  UserPlus,
  GlobeIcon,
  Code,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { LanguageSelector } from './language-selector';
import { UserMenu } from './auth/user-menu';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/hooks/use-i18n';

interface HeaderProps {
  currentLang: string;
  onLanguageChange: (lang: string) => void;
}

export function Header({ currentLang, onLanguageChange }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { t } = useI18n(currentLang);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-gray-100 dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center hover:scale-105 transition-transform">
              <Link
                href="/"
                className="text-2xl font-bold text-primary-600 dark:text-primary-400"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {t('sitename')}
              </Link>
              <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md uppercase">
                Beta
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Link href="/search/genders" className="nav-link">
                {t('genders')}
              </Link>
              <Link href="#" className="nav-link">
                {t('countries')}
              </Link>
              <Link href="/search/users" className="nav-link">
                {t('users')}
              </Link>
              <Link href="/events" className="nav-link">
                {t('events')}
              </Link>

              <Dropdown
                label={t('rankings')}
                items={[
                  { href: '/rankings/wikis', label: t('ranking_wikis') },
                  { href: '/rankings/users', label: t('ranking_users') },
                  {
                    href: '/rankings/countries',
                    label: t('ranking_countries'),
                  },
                ]}
              />

              <Dropdown
                label={t('compare')}
                items={[
                  { href: '/compare/wikis', label: t('compare_wikis') },
                  { href: '/compare/users', label: t('compare_users') },
                  { href: '/compare/countries', label: t('compare_countries') },
                ]}
              />

              <a
                href="https://github.com/danielyepezgarces/wikipeoplestats"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                {t('source_code')}
              </a>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageSelector(true)}
                className="hidden md:flex items-center"
              >
                <Globe className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden md:flex p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {isAuthenticated && user ? (
                <UserMenu
                  user={user}
                  onLogout={handleLogout}
                  onDashboard={() => router.push('/dashboard')}
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="hidden md:flex items-center space-x-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg rounded-md mt-2 space-y-2 px-4 py-4">
              <MobileLink href="/" icon={<Home />} label={t('home')} />
              <MobileLink
                href="/search/genders"
                icon={<Users />}
                label={t('genders')}
              />
              <MobileLink href="#" icon={<Flag />} label={t('countries')} />
              <MobileLink
                href="/search/users"
                icon={<Users />}
                label={t('users')}
              />
              <MobileLink
                href="/events"
                icon={<Calendar />}
                label={t('events')}
              />

              <MobileDropdown
                label={t('rankings')}
                items={[
                  {
                    href: '/rankings/wikis',
                    icon: <Book />,
                    label: t('ranking_wikis'),
                  },
                  {
                    href: '/rankings/users',
                    icon: <User />,
                    label: t('ranking_users'),
                  },
                  {
                    href: '/rankings/countries',
                    icon: <Flag />,
                    label: t('ranking_countries'),
                  },
                ]}
              />

              <MobileDropdown
                label={t('compare')}
                items={[
                  {
                    href: '/compare/wikis',
                    icon: <BookOpen />,
                    label: t('compare_wikis'),
                  },
                  {
                    href: '/compare/users',
                    icon: <UserPlus />,
                    label: t('compare_users'),
                  },
                  {
                    href: '/compare/countries',
                    icon: <GlobeIcon />,
                    label: t('compare_countries'),
                  },
                ]}
              />

              <MobileLink
                href="https://github.com/danielyepezgarces/wikipeoplestats"
                icon={<Code />}
                label={t('source_code')}
                external
              />

              {isAuthenticated && user ? (
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {user.email}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/login')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        currentLang={currentLang}
        onLanguageChange={onLanguageChange}
      />
    </>
  );
}

// Dropdown for desktop
function Dropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div className="relative group">
      <button className="nav-link">{label}</button>
      <ul className="absolute left-0 hidden group-hover:block bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50">
        {items.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Mobile link
function MobileLink({
  href,
  icon,
  label,
  external = false,
}: {
  href: string;
  icon: JSX.Element;
  label: string;
  external?: boolean;
}) {
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {icon}
      <span>{label}</span>
    </a>
  ) : (
    <Link
      href={href}
      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Mobile dropdown
function MobileDropdown({
  label,
  items,
}: {
  label: string;
  items: { href: string; icon: JSX.Element; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
      >
        <span>{label}</span>
        <ChevronDown className="h-5 w-5" />
      </button>
      {open && (
        <ul className="mt-2 pl-4 space-y-1">
          {items.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
