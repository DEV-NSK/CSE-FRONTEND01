/**
 * CODEFLOW — Step Timeline
 * Horizontal scrubber showing all execution steps.
 * PRD §18 — Execution Timeline
 * Click any step to jump directly to it.
 */

import React, { useRef } from 'react';
import type { ExecutionStep } from '../types/codeflow.types';
import { eventBadgeColor } from '../utils/codeflow.utils';

interface Props {
  steps: ExecutionStep[];
  currentStepIndex: number;
  onJump: (idx: number) => void;
}

export const StepTimeline: React.FC<Props> = ({ steps, currentStepIndex, onJump }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-semibold">
          Execution Timeline
        </span>
        <span className="text-[9px] text-zinc-600 font-mono">
          {steps.length} steps
        </span>
      </div>

      {/* Step dots row */}
      <div
        ref={scrollRef}
        className="flex items-center gap-0.5 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isPast = idx < currentStepIndex;
          const colorClass = eventBadgeColor(step.event.type);

          return (
            <button
              key={step.index}
              onClick={() => onJump(idx)}
              title={`Step ${idx + 1}: ${step.event.description}`}
              className={`
                shrink-0 rounded-full transition-all duration-150
                ${isCurrent
                  ? `w-3 h-3 ring-2 ring-white ring-offset-1 ring-offset-zinc-950 ${colorClass}`
                  : isPast
                    ? `w-2 h-2 opacity-60 ${colorClass}`
                    : 'w-1.5 h-1.5 bg-zinc-700 opacity-40 hover:opacity-70'
                }
              `}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-200"
          style={{
            width: steps.length > 0
              ? `${((currentStepIndex + 1) / steps.length) * 100}%`
              : '0%',
          }}
        />
      </div>
    </div>
  );
};
