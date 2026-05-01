'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Workshop Info', href: '/qdw/2026/info' },
  { label: 'Schedule', href: '/qdw/2026/schedule' },
  { label: 'Speakers', href: '/qdw/2026/speakers' },
  { label: 'Registration', href: '/qdw/2026/registration' },
  { label: 'FAQ', href: '/qdw/2026/faq' },
  { label: 'Design Tools', href: '/design-tools' },
  { label: 'Team', href: '/qdw/2026/team' },
];

export default function QDW2026Nav() {
  const pathname = usePathname();

  return (
    <section className="sticky top-16 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname === href || (href !== '/design-tools' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? 'text-purple-300 font-semibold px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-full border border-white/20 hover:border-white/40'
                }
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
