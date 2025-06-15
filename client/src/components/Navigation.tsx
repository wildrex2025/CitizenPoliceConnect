import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { 
  Home, 
  Shield, 
  Phone, 
  Users, 
  Baby, 
  Globe, 
  Car,
  BarChart,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigationItems = [
  { path: '/', icon: Home, key: 'nav.home' },
  { path: '/traffic-guard', icon: Shield, key: 'nav.traffic_guard' },
  { path: '/emergency', icon: Phone, key: 'nav.emergency_sos' },
  { path: '/women-safety', icon: Users, key: 'nav.women_safety' },
  { path: '/child-safety', icon: Baby, key: 'nav.child_safety' },
  { path: '/vehicle-tracking', icon: Car, key: 'nav.vehicle_tracking' },
  { path: '/analytics', icon: BarChart, key: 'nav.analytics' },
];

export const Navigation: React.FC = () => {
  const { t } = useLanguage();
  const [location] = useLocation();

  const NavLinks = () => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <Icon className="h-4 w-4" />
              {t(item.key)}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t('app.title')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <NavLinks />
            </div>
            <LanguageSwitcher />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};