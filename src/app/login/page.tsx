/**
 * User login page for the IrishConnect student directory.
 * This file provides a login form with ND ID and password fields, authentication
 * logic against the mock student data, and redirects users to the main directory
 * upon successful login. Includes Notre Dame branding and campus background imagery.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { STUDENTS } from "../../data/students";

export default function LoginPage() {
  // State for login form fields and error handling
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      router.push('/');
    }
  }, [router]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    // Simple authentication check against mock data
    const user = STUDENTS.find(
      (student) => student.id === username && student.id === password
    );

    if (user) {
      // Store authentication state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserId', user.id);
      router.push("/");
    } else {
      setError("Invalid username or password. Hint: use student ID for both.");
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Header */}
      <header className="relative z-10 bg-[#0C2340] text-white py-4">
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
      </header>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/campus_aerial2.jpg"
          alt="Notre Dame Campus Aerial"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Login Form Container */}
      <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Profile Image - positioned to be half in, half out */}
        <div className="flex justify-center mb-0">
          <div className="relative z-20">
            <div className="w-24 h-24 rounded-full bg-[#0C2340] flex items-center justify-center border-4 border-white overflow-hidden">
              <Image 
                src="/Notre_Dame_Fighting_Irish_logo.png" 
                alt="Notre Dame Fighting Irish" 
                width={80} 
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-2xl p-8 -mt-12">

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-[#0C2340] text-sm font-medium mb-2">
                ND ID
              </label>
              <div className="border-b border-[#0C2340]/30">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent text-[#0C2340] placeholder-gray-400 border-none outline-none py-2"
                  placeholder="Enter your ND ID"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#0C2340] text-sm font-medium mb-2">
                Password
              </label>
              <div className="border-b border-[#0C2340]/30">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[#0C2340] placeholder-gray-400 border-none outline-none py-2"
                  placeholder="Enter your password"
                />
              </div>
            </div>


            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#0C2340] hover:bg-[#0C2340]/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-[#AE9142] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
