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
}

export const ExecutionControls: React.FC<Props> = ({
  onRun, onReset, onStepForward, onStepBackward,
  onPlay, onPause, onStop, onSpeedChange,
  speed, executionStatus, currentStepIndex, totalSteps, hasCode,
}) => {
  const isLoading = executionStatus === 'loading';
  const isPlaying = executionStatus === 'playing';
  const hasSteps = totalSteps > 0;
  const atEnd = currentStepIndex >= totalSteps - 1;
  const atStart = currentStepIndex <= -1;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Run */}
      <ControlBtn
        onClick={onRun}
        disabled={isLoading || !hasCode}
        title="Run — generate all execution steps"
        className="bg-emerald-600 hover:bg-emerald-500 text-white"
      >
        {isLoading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <ChevronRight size={13} />
        )}
        <span className="text-[11px] font-semibold">Run</span>
      </ControlBtn>

      <Divider />

      {/* Previous Step */}
      <ControlBtn
        onClick={onStepBackward}
        disabled={!hasSteps || atStart}
        title="Previous step — rewinds full runtime state (PRD §18)"
      >
        <SkipBack size={12} />
      </ControlBtn>

      {/* Step Forward */}
      <ControlBtn
        onClick={onStepForward}
        disabled={!hasSteps || atEnd}
        title="Step — one meaningful execution event"
      >
        <SkipForward size={12} />
      </ControlBtn>

      <Divider />

      {/* Play */}
      {!isPlaying ? (
        <ControlBtn
          onClick={onPlay}
          disabled={!hasSteps || atEnd}
          title="Play — auto-execute steps"
          className="text-blue-300 hover:text-blue-200"
        >
          <Play size={13} />
        </ControlBtn>
      ) : (
        <ControlBtn
          onClick={onPause}
          title="Pause"
          className="text-yellow-300 hover:text-yellow-200"
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
      >
        <Square size={12} />
      </ControlBtn>

      {/* Reset */}
      <ControlBtn
        onClick={onReset}
        title="Reset — clear all steps"
        className="text-zinc-400 hover:text-zinc-200"
      >
        <RotateCcw size={12} />
      </ControlBtn>

      <Divider />

      {/* Speed selector */}
      <div className="flex items-center gap-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`
              text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold transition-colors
              ${speed === s
                ? 'bg-zinc-600 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
              }
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
}

const ControlBtn: React.FC<BtnProps> = ({ children, className = '', disabled, ...rest }) => (
  <button
    {...rest}
    disabled={disabled}
    className={`
      flex items-center gap-1 px-2 py-1.5 rounded text-zinc-300
      bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700
      disabled:opacity-30 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);

const Divider: React.FC = () => (
  <div className="w-px h-5 bg-zinc-700 mx-0.5" />
);
