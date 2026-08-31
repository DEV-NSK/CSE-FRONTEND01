/**
 * CODEFLOW — Examples Dropdown
 * Lets students pick from preset programs to visualize.
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { EXAMPLE_PROGRAMS } from '../utils/codeflow.utils';

interface Props {
  onSelect: (code: string) => void;
}

export const ExamplesDropdown: React.FC<Props> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700
          border border-zinc-700 text-zinc-300 text-xs transition-colors"
      >
        <BookOpen size={12} />
        <span>Examples</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-zinc-900 border border-zinc-700
          rounded-lg shadow-xl z-50 overflow-hidden">
          {EXAMPLE_PROGRAMS.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { onSelect(ex.code); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-zinc-300
                hover:bg-zinc-800 hover:text-white transition-colors border-b border-zinc-800/50 last:border-0"
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
