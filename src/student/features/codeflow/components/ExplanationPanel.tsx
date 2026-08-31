/**
 * CODEFLOW — Explanation Panel  ("What's happening?")
 * PRD §20 — Beginner Explanation
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
}

export const ExplanationPanel: React.FC<Props> = ({
  explanation,
  currentEvent,
  currentStepIndex,
  totalSteps,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {/* What's happening label */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">
          What's happening?
        </span>
        {currentEvent && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded text-white ${eventBadgeColor(currentEvent.type)}`}>
            {eventLabel(currentEvent.type)}
          </span>
        )}
        {totalSteps > 0 && (
          <span className="ml-auto text-[9px] text-zinc-500 font-mono">
            {currentStepIndex < 0 ? 0 : currentStepIndex + 1} / {totalSteps}
          </span>
        )}
      </div>

      {/* Explanation text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={explanation}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] text-zinc-200 leading-relaxed min-h-[20px]"
        >
          {explanation || 'Press Run to start.'}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
