/**
 * CODEFLOW — Execution Controls
 * Run | Reset | Previous | Step | Play | Pause | Stop | Speed
 * PRD §5 — Execution Controls
 *
 * All buttons use semantic light-theme-compatible colors that work
 * on both dark and light themes.
 */

import React from 'react';
import {
  Play, Pause, Square, SkipBack, SkipForward,
  RotateCcw, ChevronRight, Loader2,
} from 'lucide-react';
import type { PlaybackSpeed } from '../types/codeflow.types';

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

interface Props {
  onRun: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (s: PlaybackSpeed) => void;

  speed: PlaybackSpeed;
  executionStatus: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';
  currentStepIndex: number;
  totalSteps: number;
  hasCode: boolean;
  isDark?: boolean;
}

export const ExecutionControls: React.FC<Props> = ({
  onRun, onReset, onStepForward, onStepBackward,
  onPlay, onPause, onStop, onSpeedChange,
  speed, executionStatus, currentStepIndex, totalSteps, hasCode,
  isDark = true,
}) => {
  const isLoading = executionStatus === 'loading';
  const isPlaying = executionStatus === 'playing';
  const hasSteps = totalSteps > 0;
  const atEnd = currentStepIndex >= totalSteps - 1;
  const atStart = currentStepIndex <= -1;

  const dividerCls = isDark ? 'bg-zinc-700' : 'bg-slate-300';

  // Speed button classes
  const speedActiveCls = 'bg-violet-600 text-white border-violet-500 shadow-sm';
  const speedInactiveCls = isDark
    ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-800';

  return (
    <div className="flex items-center gap-1 flex-wrap">

      {/* ── Run ── green */}
      <ControlBtn
        onClick={onRun}
        disabled={isLoading || !hasCode}
        title="Run — generate all execution steps (Ctrl+Enter)"
        colorCls="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white border-emerald-600"
      >
        {isLoading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <ChevronRight size={13} />
        )}
        <span className="text-[11px] font-bold">Run</span>
      </ControlBtn>

      <div className={`w-px h-4 mx-0.5 ${dividerCls}`} />

      {/* ── Step Back ── slate/neutral */}
      <ControlBtn
        onClick={onStepBackward}
        disabled={!hasSteps || atStart}
        title="Previous step"
        colorCls={isDark
          ? 'bg-zinc-700 hover:bg-zinc-600 border-zinc-600 text-zinc-200'
          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'}
      >
        <SkipBack size={12} />
      </ControlBtn>

      {/* ── Step Forward ── blue */}
      <ControlBtn
        onClick={onStepForward}
        disabled={!hasSteps || atEnd}
        title="Step forward — one execution event"
        colorCls="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white border-blue-600"
      >
        <SkipForward size={12} />
      </ControlBtn>

      <div className={`w-px h-4 mx-0.5 ${dividerCls}`} />

      {/* ── Play / Pause ── indigo / amber */}
      {!isPlaying ? (
        <ControlBtn
          onClick={onPlay}
          disabled={!hasSteps || atEnd}
          title="Play — auto-step through execution"
          colorCls="bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white border-indigo-600"
        >
          <Play size={13} />
        </ControlBtn>
      ) : (
        <ControlBtn
          onClick={onPause}
          title="Pause"
          colorCls="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white border-amber-600"
        >
          <Pause size={13} />
        </ControlBtn>
      )}

      {/* ── Stop ── red */}
      <ControlBtn
        onClick={onStop}
        disabled={!hasSteps}
        title="Stop — return to beginning"
        colorCls="bg-red-500 hover:bg-red-400 active:bg-red-600 text-white border-red-600"
      >
        <Square size={12} />
      </ControlBtn>

      {/* ── Reset ── slate/neutral */}
      <ControlBtn
        onClick={onReset}
        title="Reset — clear all steps"
        colorCls={isDark
          ? 'bg-zinc-700 hover:bg-zinc-600 border-zinc-600 text-zinc-300 hover:text-white'
          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'}
      >
        <RotateCcw size={12} />
      </ControlBtn>

      <div className={`w-px h-4 mx-0.5 ${dividerCls}`} />

      {/* ── Speed selector ── violet accent */}
      <div className="flex items-center gap-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`
              text-[10px] px-1.5 py-1 rounded border font-mono font-bold transition-colors
              ${speed === s ? speedActiveCls : speedInactiveCls}
            `}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  colorCls?: string;
}

const ControlBtn: React.FC<BtnProps> = ({ children, colorCls = '', disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled}
    className={`
      flex items-center gap-1 px-2 py-1.5 rounded border font-medium transition-all
      disabled:opacity-30 disabled:cursor-not-allowed
      ${colorCls}
    `}
  >
    {children}
  </button>
);
