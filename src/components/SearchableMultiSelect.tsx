/**
 * Advanced multi-select dropdown component with search functionality.
 * This file provides a sophisticated multi-select component that allows users
 * to search through options, select multiple values, and manage selected items
 * with tags. Features include real-time filtering, keyboard navigation,
 * and customizable styling.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableMultiSelectProps {
  label?: string;
  placeholder?: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}

export default function SearchableMultiSelect({
  label,
  placeholder = "Select one or more options",
  options,
  values,
  onChange,
}: SearchableMultiSelectProps) {
  // State for dropdown visibility, search query, and refs for handling clicks
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Handle clicking outside component to close dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Focus input when dropdown opens, clear query when it closes
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  // Filter options based on search query - real-time search as user types
  const filtered = useMemo(() => {
    const searchQuery = query.trim().toLowerCase();
    const validOptions = options.filter(Boolean);
    
    if (!searchQuery) return validOptions;
    
    return validOptions.filter((option) => 
      option.toLowerCase().includes(searchQuery)
    );
  }, [query, options]);

  // Toggle option selection - add if not selected, remove if already selected
  function toggle(option: string) {
    const isSelected = values.includes(option);
    const newValues = isSelected 
      ? values.filter((value) => value !== option) 
      : [...values, option];
    onChange(newValues);
  }

  // Clear all selected values
  function clear() {
    onChange([]);
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="mt-1 relative" onClick={() => setOpen(true)}>
        <div className="min-h-[44px] w-full cursor-text rounded-md border border-gray-300 bg-white px-3 pr-8 py-0 shadow-sm focus-within:border-[#0C2340] flex items-center">
          <div className="flex-1 flex flex-nowrap items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {values.map((value) => (
              <span 
                key={value} 
                className="inline-flex items-center gap-1 rounded bg-[#0C2340]/5 px-2 py-0.5 text-xs text-[#0C2340] whitespace-nowrap"
              >
                {value}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(value);
                  }}
                  className="text-[#0C2340]/70 hover:text-[#0C2340]"
                  aria-label={`Remove ${value}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              className="flex-1 min-w-[120px] h-7 leading-6 border-none bg-transparent outline-none placeholder:text-gray-400 text-sm px-1"
              placeholder={values.length ? "" : placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              aria-label="Search options"
            />
          </div>
          {!!values.length && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="ml-2 rounded px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            aria-label={open ? "Close dropdown" : "Open dropdown"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((isOpen) => !isOpen);
            }}
            className="absolute inset-y-0 right-2 my-auto flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-gray-600 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Dropdown panel with filtered options */}
        {open && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No results</div>
            ) : (
              filtered.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={(e) => {
                    e.preventDefault();
                    toggle(option);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    values.includes(option) ? "bg-[#0C2340]/5" : ""
                  }`}
                  role="option"
                  aria-selected={values.includes(option)}
                >
                  <span className="truncate">{option}</span>
                  {values.includes(option) && (
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-[#0C2340]"
                    >
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}


