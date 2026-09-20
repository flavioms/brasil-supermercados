'use client';

import { useEffect, useRef, useState } from 'react';
import { AutocompleteController, type Suggestion } from '@/controllers/AutocompleteController';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: Suggestion) => void;
  placeholder?: string;
  minChars?: number;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Nome do produto',
  minChars = 2,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value.length < minChars) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await AutocompleteController.getSuggestions(value, 5);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, minChars]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: Suggestion) => {
    onSelect(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="autocomplete-listbox"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      {isOpen && (
        <ul
          id="autocomplete-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              aria-selected={false}
              onMouseDown={() => handleSelect(s)}
              className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-gray-50"
            >
              <span className="text-body">{s.name}</span>
              <span className="text-caption text-on-surface-muted">{s.unit}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
