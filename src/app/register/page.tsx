/**
 * User registration page for new users to create an IrishConnect account.
 * This file provides a registration form for ND ID and password creation,
 * with password confirmation validation. Upon successful registration,
 * users are redirected to the profile creation page.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  // State for registration form fields and error handling
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!studentId || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Mock authentication - in production this would validate against a database
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUserId', studentId); 
    router.push("/create-profile");
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
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Registration Form Container */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <h1 className="text-xl font-semibold text-[#0C2340] text-center mb-4">Create your account</h1>
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-[#0C2340] text-sm font-medium mb-2">ND ID</label>
                <div className="border-b border-[#0C2340]/30">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-transparent text-[#0C2340] placeholder-gray-400 border-none outline-none py-2"
                    placeholder="e.g. 902xxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0C2340] text-sm font-medium mb-2">Password</label>
                <div className="border-b border-[#0C2340]/30">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-[#0C2340] placeholder-gray-400 border-none outline-none py-2"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#0C2340] text-sm font-medium mb-2">Confirm password</label>
                <div className="border-b border-[#0C2340]/30">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-[#0C2340] placeholder-gray-400 border-none outline-none py-2"
                    placeholder="Re-enter your password"
                  />
                </div>
              </div>

              {error && <div className="text-red-400 text-sm text-center">{error}</div>}

              <button
                type="submit"
                className="w-full bg-[#0C2340] hover:bg-[#0C2340]/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Create account
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#0C2340] hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
