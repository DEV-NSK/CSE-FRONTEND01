/**
 * CODEFLOW — Zustand Store
 * PRD-CODEFLOW-01 §5 — Execution Controls
 * PRD-CODEFLOW-01 §18 — Execution Timeline (Previous Step restores full state)
 */

import { create } from 'zustand';
import type {
  ExecutionStep,
  RuntimeState,
  PlaybackSpeed,
  ExecutionResult,
} from '../types/codeflow.types';
import { createInitialRuntimeState } from '../utils/codeflow.utils';

type ExecutionStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

interface CodeflowState {
  // Editor
  code: string;
  language: 'javascript';

  // Execution data
  steps: ExecutionStep[];
  totalSteps: number;
  currentStepIndex: number;
  currentState: RuntimeState;
  parseError: string | null;

  // Playback
  executionStatus: ExecutionStatus;
  speed: PlaybackSpeed;
  playIntervalId: ReturnType<typeof setInterval> | null;

  // Actions
  setCode: (code: string) => void;
  loadResult: (result: ExecutionResult) => void;
  setLoading: (v: boolean) => void;
  setParseError: (msg: string) => void;

  // Controls (PRD §5)
  stepForward: () => void;
  stepBackward: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  jumpToStep: (idx: number) => void;
}

export const useCodeflowStore = create<CodeflowState>((set, get) => ({
  code: DEFAULT_CODE,
  language: 'javascript',

  steps: [],
  totalSteps: 0,
  currentStepIndex: -1,
  currentState: createInitialRuntimeState(),
  parseError: null,

  executionStatus: 'idle',
  speed: 1,
  playIntervalId: null,

  setCode: (code) => set({ code }),

  loadResult: (result) => {
    set({
      steps: result.steps,
      totalSteps: result.totalSteps,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
      parseError: result.parseError ?? null,
      executionStatus: result.parseError ? 'error' : 'ready',
    });
  },

  setLoading: (v) => set({ executionStatus: v ? 'loading' : 'idle' }),

  setParseError: (msg) => set({ parseError: msg, executionStatus: 'error' }),

  stepForward: () => {
    const { steps, currentStepIndex, totalSteps } = get();
    if (currentStepIndex >= totalSteps - 1) return;
    const next = currentStepIndex + 1;
    set({
      currentStepIndex: next,
      currentState: steps[next]!.state,
    });
  },

  stepBackward: () => {
    const { steps, currentStepIndex } = get();
    if (currentStepIndex <= 0) {
      set({ currentStepIndex: -1, currentState: createInitialRuntimeState() });
      return;
    }
    const prev = currentStepIndex - 1;
    set({
      currentStepIndex: prev,
      currentState: steps[prev]!.state,
    });
  },

  play: () => {
    const { executionStatus } = get();
    if (executionStatus === 'playing') return;

    // Start from beginning if at end
    const { currentStepIndex, totalSteps } = get();
    if (currentStepIndex >= totalSteps - 1) {
      set({ currentStepIndex: -1, currentState: createInitialRuntimeState() });
    }

    set({ executionStatus: 'playing' });
    const id = setInterval(() => {
      const { currentStepIndex: idx, totalSteps: total, steps } = get();
      const next = idx + 1;
      if (next >= total) {
        clearInterval(id);
        set({
          playIntervalId: null,
          executionStatus: 'paused',
          currentStepIndex: total - 1,
          currentState: steps[total - 1]!.state,
        });
        return;
      }
      set({ currentStepIndex: next, currentState: steps[next]!.state });
    }, getIntervalMs(get().speed));

    set({ playIntervalId: id });
  },

  pause: () => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    set({ executionStatus: 'paused', playIntervalId: null });
  },

  stop: () => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    set({
      executionStatus: 'ready',
      playIntervalId: null,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
    });
  },

  reset: () => {
    const { playIntervalId } = get();
    if (playIntervalId) clearInterval(playIntervalId);
    set({
      steps: [],
      totalSteps: 0,
      currentStepIndex: -1,
      currentState: createInitialRuntimeState(),
      parseError: null,
      executionStatus: 'idle',
      playIntervalId: null,
    });
  },

  setSpeed: (speed) => {
    const { playIntervalId, executionStatus } = get();
    set({ speed });
    // Restart interval at new speed if playing
    if (executionStatus === 'playing' && playIntervalId) {
      clearInterval(playIntervalId);
      const id = setInterval(() => {
        const { currentStepIndex: idx, totalSteps: total, steps } = get();
        const next = idx + 1;
        if (next >= total) {
          clearInterval(id);
          set({ playIntervalId: null, executionStatus: 'paused' });
          return;
        }
        set({ currentStepIndex: next, currentState: steps[next]!.state });
      }, getIntervalMs(speed));
      set({ playIntervalId: id });
    }
  },

  jumpToStep: (idx) => {
    const { steps, totalSteps } = get();
    const safe = Math.max(-1, Math.min(idx, totalSteps - 1));
    if (safe === -1) {
      set({ currentStepIndex: -1, currentState: createInitialRuntimeState() });
      return;
    }
    set({ currentStepIndex: safe, currentState: steps[safe]!.state });
  },
}));

function getIntervalMs(speed: PlaybackSpeed): number {
  // Base delay 900ms at 1x
  return Math.round(900 / speed);
}

/** Default starter code shown in the editor */
const DEFAULT_CODE = `// CODEFLOW — JavaScript Execution Visualizer
// Press Run to generate all steps, then use Step / Play to walk through them.

let x = 10;
let y = 20;

function add(a, b) {
  return a + b;
}

let result = add(x, y);
console.log(result);
`;
