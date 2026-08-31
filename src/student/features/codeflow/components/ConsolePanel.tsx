/**
 * CODEFLOW — Console Output Panel
 * Shows console.log() output at the exact step it was produced.
 * PRD §12 — Console Output
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConsoleEntry } from '../types/codeflow.types';

interface Props {
  entries: ConsoleEntry[];
  currentStepIndex: number;
}

export const ConsolePanel: React.FC<Props> = ({ entries, currentStepIndex }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new outputs appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800 bg-zinc-900">
        <span className="text-emerald-400 text-xs font-semibold font-mono">CONSOLE</span>
        {entries.length > 0 && (
          <span className="ml-auto text-[9px] text-zinc-500">{entries.length} output{entries.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <p className="text-zinc-600 italic text-[11px] p-2">No output yet.</p>
          ) : (
            entries.map((entry) => {
              const isNew = entry.stepIndex === currentStepIndex;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    flex items-start gap-2 px-2 py-1 rounded mb-0.5 border-l-2
                    ${isNew
                      ? 'bg-emerald-900/20 border-emerald-500 text-emerald-300'
                      : 'border-zinc-800 text-zinc-300'
                    }
                  `}
                >
                  <span className="text-zinc-600 text-[9px] shrink-0 mt-0.5">
                    {String(entry.stepIndex).padStart(3, '0')}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{entry.value}</span>
                  <span className="ml-auto text-zinc-600 text-[9px] shrink-0">
                    L{entry.line}
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
