import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { type ProfileData } from '../data/portfolioData';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  profile: ProfileData;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  profile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'My Projects', href: '#projects' },
    { label: 'Certificates', href: '#certificates' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0B0C10]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] transition-colors">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-6 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#header"
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-[#E11D48] dark:hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 font-serif-editorial italic"
        >
          {profile.name}
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-zinc-300"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-slate-950 dark:hover:text-white underline-offset-8 hover:underline decoration-[#E11D48] dark:decoration-[#F59E0B] transition-colors whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Hire Me + Light/Dark Corner Icon Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-white bg-[#E11D48] hover:bg-[#BE123C] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            Hire Me
          </a>

          {/* Corner Light/Dark Icon Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-[#161923] text-slate-700 dark:text-amber-400 hover:border-[#E11D48] dark:hover:border-[#F59E0B] transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-white/15 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#11131A] px-6 py-4 space-y-2"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-[#E11D48] dark:hover:text-[#F59E0B] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
