/**
 * CODEFLOW — Async Runtime Panel
 * Shows Web APIs, Microtask Queue, Task Queue, and Event Loop state.
 * PRD §13 — JavaScript Asynchronous Runtime
 * PRD §14 — setTimeout Visualization
 * PRD §15 — Promise / Microtask Visualization
 * PRD §16 — Task Queue vs Microtask Queue
 * PRD §17 — Event Loop
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WebApiEntry, QueueEntry, EventLoopPhase } from '../types/codeflow.types';

interface Props {
  webApis: WebApiEntry[];
  microtaskQueue: QueueEntry[];
  taskQueue: QueueEntry[];
  eventLoopPhase: EventLoopPhase;
  isDark?: boolean;
}

export const AsyncRuntimePanel: React.FC<Props> = ({
  webApis,
  microtaskQueue,
  taskQueue,
  eventLoopPhase,
  isDark = true,
}) => {
  const eventLoopActive = eventLoopPhase !== 'idle';

  const loopActiveBorder = 'border-emerald-500/60 bg-emerald-900/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  const loopIdleBorder = isDark ? 'border-zinc-700/40 bg-zinc-900/30' : 'border-slate-200 bg-slate-50';

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {/* Web APIs */}
      <ZoneBlock
        title="Web APIs"
        color="sky"
        items={webApis.map((w) => ({ id: w.id, label: w.label }))}
        emptyText="No active Web APIs"
        icon="🌐"
        isDark={isDark}
      />

      {/* Microtask Queue */}
      <ZoneBlock
        title="Microtask Queue"
        subtitle="Promise .then / .catch / .finally"
        color="indigo"
        items={microtaskQueue}
        emptyText="Empty"
        icon="⚡"
        isDark={isDark}
      />

      {/* Task Queue */}
      <ZoneBlock
        title="Task Queue"
        subtitle="setTimeout / setInterval callbacks"
        color="amber"
        items={taskQueue}
        emptyText="Empty"
        icon="📋"
        isDark={isDark}
      />

      {/* Event Loop indicator */}
      <div className={`rounded-lg border px-3 py-2 transition-all duration-300 ${eventLoopActive ? loopActiveBorder : loopIdleBorder}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${eventLoopActive ? 'animate-spin' : ''}`}>🔄</span>
          <span className={`text-xs font-semibold ${eventLoopActive ? 'text-emerald-400' : isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
            Event Loop
          </span>
          {eventLoopActive && (
            <span className="ml-auto text-[9px] bg-emerald-600 text-white rounded px-1.5 py-0.5 uppercase font-bold">
              active
            </span>
          )}
        </div>
        {eventLoopActive && (
          <p className="mt-1 text-[10px] text-emerald-300">
            {phaseLabel(eventLoopPhase)}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Internal components ──────────────────────────────────────────────────────

interface ZoneBlockProps {
  title: string;
  subtitle?: string;
  color: 'sky' | 'indigo' | 'amber';
  items: QueueEntry[];
  emptyText: string;
  icon: string;
  isDark?: boolean;
}

const colorMapDark = {
  sky: {
    border: 'border-sky-500/40',
    label: 'text-sky-400',
    header: 'bg-sky-950/40',
    item: 'bg-sky-900/30 border-sky-700/50 text-sky-300',
    empty: 'text-zinc-600',
  },
  indigo: {
    border: 'border-indigo-500/40',
    label: 'text-indigo-400',
    header: 'bg-indigo-950/40',
    item: 'bg-indigo-900/30 border-indigo-700/50 text-indigo-300',
    empty: 'text-zinc-600',
  },
  amber: {
    border: 'border-amber-500/40',
    label: 'text-amber-400',
    header: 'bg-amber-950/20',
    item: 'bg-amber-900/20 border-amber-700/40 text-amber-300',
    empty: 'text-zinc-600',
  },
};

const colorMapLight = {
  sky: {
    border: 'border-sky-200',
    label: 'text-sky-600',
    header: 'bg-sky-50',
    item: 'bg-sky-50 border-sky-200 text-sky-700',
    empty: 'text-slate-400',
  },
  indigo: {
    border: 'border-indigo-200',
    label: 'text-indigo-600',
    header: 'bg-indigo-50',
    item: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    empty: 'text-slate-400',
  },
  amber: {
    border: 'border-amber-200',
    label: 'text-amber-600',
    header: 'bg-amber-50',
    item: 'bg-amber-50 border-amber-200 text-amber-700',
    empty: 'text-slate-400',
  },
};

const ZoneBlock: React.FC<ZoneBlockProps> = ({ title, subtitle, color, items, emptyText, icon, isDark = true }) => {
  const c = isDark ? colorMapDark[color] : colorMapLight[color];
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden`}>
      <div className={`px-3 py-1.5 ${c.header} flex items-center gap-1.5`}>
        <span className="text-sm">{icon}</span>
        <div>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${c.label}`}>
            {title}
          </span>
          {subtitle && (
            <p className={`text-[9px] mt-px ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>{subtitle}</p>
          )}
        </div>
        {items.length > 0 && (
          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.item}`}>
            {items.length}
          </span>
        )}
      </div>
      <div className="px-2 py-1.5 flex flex-col gap-1 min-h-[28px]">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <p className={`text-[10px] italic px-1 ${c.empty}`}>{emptyText}</p>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2 }}
                className={`text-[10px] font-mono px-2 py-1 rounded border ${c.item}`}
              >
                {item.label}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function phaseLabel(phase: EventLoopPhase): string {
  switch (phase) {
    case 'checking': return 'Checking Call Stack…';
    case 'stack_empty': return 'Call Stack is empty';
    case 'processing_microtasks': return 'Processing Microtask Queue…';
    case 'processing_tasks': return 'Processing Task Queue…';
    default: return '';
  }
}
