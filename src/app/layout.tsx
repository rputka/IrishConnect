"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata is handled in the head via document.title in useEffect

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set document title
    document.title = "IrishConnect";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'A clean, modern student directory for discovering classmates by academics, interests, and experiences.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'A clean, modern student directory for discovering classmates by academics, interests, and experiences.';
      document.head.appendChild(meta);
    }

    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated');
    const userId = localStorage.getItem('currentUserId');
    if (authStatus === 'true' && userId) {
      setIsAuthenticated(true);
      setCurrentUserId(userId);
    } else if (pathname !== '/login' && pathname !== '/register') {
      router.push('/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {pathname !== '/login' && pathname !== '/register' && pathname !== '/create-profile' && (
          <header className="sticky top-0 z-40 bg-[#0C2340] text-white">
          <div className="mx-auto grid h-16 max-w-none grid-cols-3 items-center px-2 sm:px-4 lg:px-18">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
              </Link>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="font-serif tracking-wide text-2xl">IrishConnect</span>
              <Image 
                src="/shamrock.webp" 
                alt="Shamrock" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#017f4e] text-white text-sm font-semibold">R</div>
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link 
                      href={currentUserId ? `/profile/${currentUserId}` : "#"} 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      My Profile
                    </Link>
                    <a 
                      href="mailto:rputka@nd.edu"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      Contact Us
                    </a>
                    <Link 
                      href="/tutorial" 
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Tutorial & Help
                    </Link>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        localStorage.removeItem('isAuthenticated');
                        localStorage.removeItem('currentUserId');
                        setIsAuthenticated(false);
                        setCurrentUserId(null);
                        router.push('/login');
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16,17 21,12 16,7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        )}
        <main className={`mx-auto max-w-none ${pathname !== '/login' && pathname !== '/register' && pathname !== '/create-profile' ? 'px-2 sm:px-4 lg:px-18 py-4 bg-transparent' : ''}`}>{children}</main>
      </body>
    </html>
  );
}
