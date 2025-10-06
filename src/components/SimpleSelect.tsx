/**
 * Simple dropdown select component for single-value selection.
 * This file provides a clean, accessible dropdown component for selecting
 * a single option from a list. Features include click-to-open/close functionality,
 * visual selection indicators, and support for both upward and downward dropdown
 * positioning.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Option = { label: string; value: string };

type SimpleSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  direction?: "up" | "down";
};

export default function SimpleSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  direction = "down",
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = useMemo(() => {
    return options.find((o) => o.value === value)?.label ?? "";
  }, [options, value]);

  return (
    <div ref={ref} className="w-full">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-8 text-left shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          <span className={`block text-sm ${selectedLabel ? "text-gray-900" : "text-gray-400"}`}>
            {selectedLabel || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-2 my-auto flex h-6 w-6 items-center justify-center">
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
          </span>
        </button>

        {open && (
          <div
            className={`absolute z-20 w-full rounded-md border border-gray-200 bg-white shadow-lg ${
              direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            <div className="max-h-60 overflow-auto">
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    value === o.value ? "bg-[#0C2340]/5" : ""
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {value === o.value && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C2340]"><path d="M20 6L9 17l-5-5"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


