/**
 * CODEFLOW — Execution Controls
 * Run | Reset | Previous | Step | Play | Pause | Stop | Speed
 * PRD §5 — Execution Controls
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

  const btnBase = isDark
    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900';

  const dividerCls = isDark ? 'bg-zinc-700' : 'bg-slate-200';

  const speedActiveCls = isDark ? 'bg-zinc-600 text-white' : 'bg-slate-200 text-slate-900';
  const speedInactiveCls = isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-700';

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Run */}
      <ControlBtn
        onClick={onRun}
        disabled={isLoading || !hasCode}
        title="Run — generate all execution steps"
        className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700"
        baseClass={btnBase}
      >
        {isLoading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <ChevronRight size={13} />
        )}
        <span className="text-[11px] font-semibold">Run</span>
      </ControlBtn>

      <div className={`w-px h-4 ${dividerCls}`} />

      {/* Previous Step */}
      <ControlBtn
        onClick={onStepBackward}
        disabled={!hasSteps || atStart}
        title="Previous step"
        baseClass={btnBase}
      >
        <SkipBack size={12} />
      </ControlBtn>

      {/* Step Forward */}
      <ControlBtn
        onClick={onStepForward}
        disabled={!hasSteps || atEnd}
        title="Step — one meaningful execution event"
        baseClass={btnBase}
      >
        <SkipForward size={12} />
      </ControlBtn>

      <div className={`w-px h-4 ${dividerCls}`} />

      {/* Play / Pause */}
      {!isPlaying ? (
        <ControlBtn
          onClick={onPlay}
          disabled={!hasSteps || atEnd}
          title="Play — auto-execute steps"
          className="text-blue-500 hover:text-blue-400"
          baseClass={btnBase}
        >
          <Play size={13} />
        </ControlBtn>
      ) : (
        <ControlBtn
          onClick={onPause}
          title="Pause"
          className="text-yellow-500 hover:text-yellow-400"
          baseClass={btnBase}
        >
          <Pause size={13} />
        </ControlBtn>
      )}

      {/* Stop */}
      <ControlBtn
        onClick={onStop}
        disabled={!hasSteps}
        title="Stop — return to beginning"
        className="text-red-400 hover:text-red-300"
        baseClass={btnBase}
      >
        <Square size={12} />
      </ControlBtn>

      {/* Reset */}
      <ControlBtn
        onClick={onReset}
        title="Reset — clear all steps"
        className={isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-400 hover:text-slate-700'}
        baseClass={btnBase}
      >
        <RotateCcw size={12} />
      </ControlBtn>

      <div className={`w-px h-4 ${dividerCls}`} />

      {/* Speed selector */}
      <div className="flex items-center gap-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`
              text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors
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
  className?: string;
  baseClass?: string;
}

const ControlBtn: React.FC<BtnProps> = ({ children, className = '', baseClass = '', disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled}
    className={`
      flex items-center gap-1 px-2 py-1.5 rounded border transition-colors
      disabled:opacity-30 disabled:cursor-not-allowed
      ${baseClass} ${className}
    `}
  >
    {children}
  </button>
);
