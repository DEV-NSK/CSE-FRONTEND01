/**
 * CODEFLOW — Call Stack Panel
 * Displays function call frames stacked top-to-bottom.
 * PRD §9 — Call Stack
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CallFrame } from '../types/codeflow.types';

interface Props {
  callStack: CallFrame[];
  isDark?: boolean;
}

export const CallStackPanel: React.FC<Props> = ({ callStack, isDark = true }) => {
  // Show newest frame on top (last in array)
  const frames = [...callStack].reverse();

  const emptyText = isDark ? 'text-zinc-500' : 'text-slate-400';

  return (
    <div className="flex flex-col gap-1.5 h-full overflow-y-auto">
      <AnimatePresence mode="popLayout">
        {frames.map((frame, idx) => (
          <motion.div
            key={frame.id}
            layout
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
            className={`
              rounded-lg border px-3 py-2
              ${idx === 0
                ? 'border-purple-500/60 bg-purple-900/20 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
                : isDark
                  ? 'border-zinc-700/60 bg-zinc-900/40'
                  : 'border-slate-200 bg-slate-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono font-semibold ${idx === 0 ? 'text-purple-300' : isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                {frame.functionName === 'Global' ? '🌐 Global' : `ƒ ${frame.functionName}`}
              </span>
              {frame.line > 0 && (
                <span className={`text-[9px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                  line {frame.line}
                </span>
              )}
            </div>
            {idx === 0 && (
              <div className="mt-0.5 text-[9px] text-purple-400 uppercase tracking-widest">
                ▶ executing
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {callStack.length === 0 && (
        <p className={`text-xs text-center mt-4 ${emptyText}`}>Call stack empty.</p>
      )}
    </div>
  );
};
