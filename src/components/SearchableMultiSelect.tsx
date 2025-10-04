"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableMultiSelectProps = {
  label?: string;
  placeholder?: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
};

export default function SearchableMultiSelect({
  label,
  placeholder = "Select one or more options",
  options,
  values,
  onChange,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = options.filter(Boolean);
    if (!q) return base;
    return base.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const toggle = (option: string) => {
    const exists = values.includes(option);
    const next = exists ? values.filter((v) => v !== option) : [...values, option];
    onChange(next);
  };

  const clear = () => onChange([]);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="mt-1 relative" onClick={() => setOpen(true)}>
        <div className="min-h-[44px] w-full cursor-text rounded-md border border-gray-300 bg-white px-3 pr-8 py-0 shadow-sm focus-within:border-[#0C2340] flex items-center">
          <div className="flex-1 flex flex-nowrap items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {values.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded bg-[#0C2340]/5 px-2 py-0.5 text-xs text-[#0C2340] whitespace-nowrap">
                {v}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                  className="text-[#0C2340]/70 hover:text-[#0C2340]"
                  aria-label={`Remove ${v}`}
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
            aria-label={open ? "Close" : "Open"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
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
                >
                  <span className="truncate">{option}</span>
                  {values.includes(option) && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0C2340]"><path d="M20 6L9 17l-5-5"/></svg>
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


