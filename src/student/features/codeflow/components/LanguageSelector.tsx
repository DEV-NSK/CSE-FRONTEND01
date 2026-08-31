/**
 * CODEFLOW — Language Selector
 * Dropdown to select from all 6 supported languages.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Code2 } from 'lucide-react';
import { CODEFLOW_LANGUAGES, type CodeflowLanguage } from '../store/codeflowStore';

interface Props {
  language: CodeflowLanguage;
  onSelect: (lang: CodeflowLanguage) => void;
  isDark: boolean;
}

export const LanguageSelector: React.FC<Props> = ({ language, onSelect, isDark }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = CODEFLOW_LANGUAGES.find((l) => l.id === language) ?? CODEFLOW_LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const btnClass = isDark
    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900';

  const dropdownClass = isDark
    ? 'bg-zinc-900 border-zinc-700 shadow-xl'
    : 'bg-white border-slate-200 shadow-lg';

  const itemClass = isDark
    ? 'text-zinc-300 hover:bg-zinc-800 hover:text-white border-zinc-800/50'
    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-slate-100';

  const activeClass = isDark
    ? 'bg-cyan-900/30 text-cyan-300'
    : 'bg-cyan-50 text-cyan-700';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs transition-colors font-medium ${btnClass}`}
        aria-label="Select language"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Code2 size={12} />
        <span className="min-w-[60px]">{currentLang.name}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full mt-1 w-44 rounded-lg border z-50 overflow-hidden ${dropdownClass}`}
          role="listbox"
          aria-label="Language options"
        >
          {CODEFLOW_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              role="option"
              aria-selected={lang.id === language}
              onClick={() => {
                onSelect(lang.id);
                setOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-xs transition-colors border-b last:border-0 font-medium
                ${lang.id === language ? activeClass : itemClass}
              `}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
