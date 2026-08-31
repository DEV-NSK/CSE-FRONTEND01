/**
 * CODEFLOW — Explanation Panel  ("What's happening?")
 * PRD §20 — Beginner Explanation
 *
 * Redesigned as a prominent, high-visibility banner so students
 * immediately understand what the engine is doing at each step.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExecutionEvent } from '../types/codeflow.types';
import { eventBadgeColor, eventLabel } from '../utils/codeflow.utils';

interface Props {
  explanation: string;
  currentEvent: ExecutionEvent | null;
  currentStepIndex: number;
  totalSteps: number;
  isDark?: boolean;
}

export const ExplanationPanel: React.FC<Props> = ({
  explanation,
  currentEvent,
  currentStepIndex,
  totalSteps,
  isDark = true,
}) => {
  const hasContent = !!explanation && explanation !== 'Press Run to start execution.';
  const isIdle = !hasContent;

  // Container styles — more prominent, taller, visually distinct
  const containerCls = isDark
    ? isIdle
      ? 'bg-zinc-900/60 border-zinc-700/50'
      : 'bg-zinc-900 border-zinc-600/60 shadow-[0_0_12px_rgba(139,92,246,0.12)]'
    : isIdle
      ? 'bg-slate-100 border-slate-200'
      : 'bg-white border-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.10)]';

  const labelCls = isDark ? 'text-zinc-400' : 'text-slate-500';
  const counterCls = isDark ? 'text-zinc-500' : 'text-slate-400';
  const bodyTextCls = isDark
    ? isIdle ? 'text-zinc-600 italic' : 'text-zinc-100'
    : isIdle ? 'text-slate-400 italic' : 'text-slate-800';

  // Left accent bar color tied to event type
  const accentBar = currentEvent
    ? `${eventBadgeColor(currentEvent.type)} opacity-90`
    : isDark ? 'bg-zinc-700' : 'bg-slate-300';

  return (
    <div className={`flex items-stretch gap-0 rounded-lg border overflow-hidden transition-all duration-300 ${containerCls}`}>
      {/* Left accent stripe */}
      <div className={`w-1 shrink-0 rounded-l-lg ${accentBar}`} />

      {/* Main content */}
      <div className="flex-1 px-3 py-2.5 min-w-0">
        {/* Top row: label + badge + counter */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[9px] uppercase tracking-widest font-bold ${labelCls}`}>
            What's happening?
          </span>

          {currentEvent && (
            <span className={`
              inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full text-white
              tracking-wide uppercase ${eventBadgeColor(currentEvent.type)}
            `}>
              {eventLabel(currentEvent.type)}
            </span>
          )}

          {totalSteps > 0 && (
            <span className={`ml-auto text-[10px] font-mono font-semibold shrink-0 ${counterCls}`}>
              Step {currentStepIndex < 0 ? 0 : currentStepIndex + 1}
              <span className="opacity-50"> / {totalSteps}</span>
            </span>
          )}
        </div>

        {/* Explanation body — animated on change */}
        <AnimatePresence mode="wait">
          <motion.p
            key={explanation}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.18 }}
            className={`text-[12px] leading-relaxed font-medium min-h-[16px] ${bodyTextCls}`}
          >
            {explanation || 'Press Run to start execution.'}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
