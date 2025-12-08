'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // Check if click is outside both the menu and the button
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const memberLinks = [
    {
      name: 'Member Interest Form',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSdIjYlL-Bc9mDbAtzYaoFJJMZwLFPZx048jhwuIz_rvDkCbrw/viewform',
      external: true,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10" style={{ touchAction: 'manipulation' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/qdcLogo.png"
              alt="QDC Logo"
              width={40}
              height={40}
              className="w-10 h-10 transition-transform duration-200 group-hover:scale-110"
            />
            <span className="text-white font-semibold text-lg hidden sm:block">
              QDC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Home
            </Link>
            
            {/* Members Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black/80 rounded-md px-2 py-1"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                Members
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in">
                  {memberLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 text-sm"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {link.name}
                      {link.external && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/join"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Join Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="md:hidden text-white p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay to capture clicks */}
            <div 
              className="fixed inset-0 top-16 bg-black/50 md:hidden z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div 
              ref={mobileMenuRef} 
              className="absolute left-0 right-0 top-16 md:hidden py-4 bg-black/95 backdrop-blur-md border-t border-white/10 animate-fade-in z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-2 px-4">
                <Link
                  href="/"
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm font-medium px-4 py-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {/* Mobile Members Section */}
                <div className="px-4 py-2">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Members
                  </span>
                </div>
                {memberLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm font-medium px-6 py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                    {link.external && (
                      <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </a>
                ))}
                
                <Link
                  href="/join"
                  className="mt-2 text-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm px-4 py-3 rounded-full transition-all duration-200 shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join Us
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
