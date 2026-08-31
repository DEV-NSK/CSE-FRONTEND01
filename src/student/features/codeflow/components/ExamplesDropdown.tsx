/**
 * CODEFLOW — Examples Dropdown
 * Shows language-specific preset programs based on the currently selected language.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { CODEFLOW_LANGUAGES, type CodeflowLanguage } from '../store/codeflowStore';

interface Props {
  language: CodeflowLanguage;
  onSelect: (code: string) => void;
  isDark?: boolean;
}

export const ExamplesDropdown: React.FC<Props> = ({ language, onSelect, isDark = true }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Get examples for the currently selected language
  const langConfig = CODEFLOW_LANGUAGES.find((l) => l.id === language) ?? CODEFLOW_LANGUAGES[0];
  const examples = langConfig.examples;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown when language changes
  useEffect(() => {
    setOpen(false);
  }, [language]);

  const btnClass = isDark
    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900';

  const dropdownClass = isDark
    ? 'bg-zinc-900 border-zinc-700 shadow-xl'
    : 'bg-white border-slate-200 shadow-lg';

  const itemClass = isDark
    ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white border-zinc-800/50'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-100';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors ${btnClass}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <BookOpen size={12} />
        <span>Examples</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full mt-1 w-56 rounded-lg border z-50 overflow-hidden ${dropdownClass}`}
          role="listbox"
        >
          {examples.map((ex) => (
            <button
              key={ex.label}
              role="option"
              onClick={() => { onSelect(ex.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors border-b last:border-0 ${itemClass}`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
