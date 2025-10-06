/**
 * Reusable modal component for displaying overlay dialogs.
 * This file provides a flexible modal component with backdrop click-to-close
 * functionality, title support, and scrollable content area. Used throughout
 * the application for confirmations, detailed views, and form dialogs.
 */
"use client";

import { useEffect, useRef } from "react";

// Props interface for the Modal component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  title,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    
    // Handle clicking outside modal to close it
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={ref}
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          <button 
            onClick={onClose} 
            className="ml-auto text-gray-500 hover:text-gray-800"
            aria-label="Close modal"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="mt-4 max-h-[70vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
