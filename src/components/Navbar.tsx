'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(event.target as Node)) {
        setIsContactDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target as Node)) {
        setIsResourcesDropdownOpen(false);
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

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsContactDropdownOpen(false);
        setIsToolsDropdownOpen(false);
        setIsResourcesDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const contactLinks = [
    {
      name: 'Member Interest Form',
      href: 'https://docs.google.com/forms/d/e/1FAIpQLSdIjYlL-Bc9mDbAtzYaoFJJMZwLFPZx048jhwuIz_rvDkCbrw/viewform',
      external: true,
    },
    {
      name: 'Contact Us',
      href: '/contact',
      external: false,
    },
  ];

  const toolsLinks = [
    { name: 'Qiskit Metal', href: '/design-tools#qiskit-metal' },
    { name: 'AWS Palace', href: '/design-tools#aws-palace' },
    { name: 'SQUAADS', href: '/design-tools#squaads' },
    { name: 'scqubits', href: '/design-tools#scqubits' },
    { name: 'SuperQubit', href: '/design-tools#superqubit' },
    { name: 'View All Tools', href: '/design-tools' },
  ];

  const resourcesLinks = [
    {
      name: 'EE194/290 - Superconducting Quantum Circuits',
      description: 'UC Berkeley • Prof. Alp Sipahigil',
      href: 'https://qudev.notion.site/ee290',
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
            
            {/* Design & Simulation Tools Dropdown */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                onClick={() => {
                  setIsToolsDropdownOpen(!isToolsDropdownOpen);
                  setIsContactDropdownOpen(false);
                  setIsResourcesDropdownOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsToolsDropdownOpen(!isToolsDropdownOpen);
                    setIsContactDropdownOpen(false);
                    setIsResourcesDropdownOpen(false);
                  }
                }}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black/80 rounded-md px-2 py-1"
                aria-expanded={isToolsDropdownOpen}
                aria-haspopup="true"
              >
                Design & Simulation
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Tools Dropdown Menu */}
              {isToolsDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in">
                  {toolsLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className={`block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 text-sm ${
                        link.name === 'View All Tools' ? 'border-t border-gray-100 font-medium' : ''
                      }`}
                      onClick={() => setIsToolsDropdownOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Resources Dropdown */}
            <div className="relative" ref={resourcesDropdownRef}>
              <button
                onClick={() => {
                  setIsResourcesDropdownOpen(!isResourcesDropdownOpen);
                  setIsContactDropdownOpen(false);
                  setIsToolsDropdownOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsResourcesDropdownOpen(!isResourcesDropdownOpen);
                    setIsContactDropdownOpen(false);
                    setIsToolsDropdownOpen(false);
                  }
                }}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black/80 rounded-md px-2 py-1"
                aria-expanded={isResourcesDropdownOpen}
                aria-haspopup="true"
              >
                Learning
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isResourcesDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Learning Resources Dropdown Menu */}
              {isResourcesDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Materials</span>
                  </div>
                  {resourcesLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      onClick={() => setIsResourcesDropdownOpen(false)}
                    >
            
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{link.name}</div>
                        <div className="text-xs text-gray-500">{link.description}</div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Dropdown */}
            <div className="relative" ref={contactDropdownRef}>
              <button
                onClick={() => {
                  setIsContactDropdownOpen(!isContactDropdownOpen);
                  setIsToolsDropdownOpen(false);
                  setIsResourcesDropdownOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsContactDropdownOpen(!isContactDropdownOpen);
                    setIsToolsDropdownOpen(false);
                    setIsResourcesDropdownOpen(false);
                  }
                }}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black/80 rounded-md px-2 py-1"
                aria-expanded={isContactDropdownOpen}
                aria-haspopup="true"
              >
                Contact
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isContactDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Contact Dropdown Menu */}
              {isContactDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in">
                  {contactLinks.map((link, index) => (
                    link.external ? (
                      <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 text-sm"
                        onClick={() => setIsContactDropdownOpen(false)}
                      >
                        {link.name}
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <Link
                        key={index}
                        href={link.href}
                        className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150 text-sm"
                        onClick={() => setIsContactDropdownOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
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
                
                {/* Mobile Design & Simulation Tools Section */}
                <div className="px-4 py-2 mt-2">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Design & Simulation
                  </span>
                </div>
                {toolsLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm font-medium px-6 py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Learning Resources Section */}
                <div className="px-4 py-2 mt-2">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Learning Resources
                  </span>
                </div>
                {resourcesLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm font-medium px-6 py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      {link.name}
                      <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </span>
                    <span className="text-xs text-white/40 mt-1">{link.description}</span>
                  </a>
                ))}

                {/* Mobile Contact Section */}
                <div className="px-4 py-2 mt-2">
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                    Contact
                  </span>
                </div>
                {contactLinks.map((link, index) => (
                  link.external ? (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm font-medium px-6 py-3 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                      <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm font-medium px-6 py-3 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
