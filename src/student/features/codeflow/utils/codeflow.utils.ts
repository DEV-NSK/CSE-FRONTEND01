/**
 * CODEFLOW — Frontend utilities
 */

import type { RuntimeState, RuntimeValue, ExecutionEventType } from '../types/codeflow.types';

/** Creates a blank runtime state for the "before run" display */
export function createInitialRuntimeState(): RuntimeState {
  return {
    currentLine: 0,
    currentStep: 0,
    scopes: [{ id: 'global', type: 'global', name: 'Global', parentId: null, variables: [] }],
    callStack: [{ id: 'frame-global', functionName: 'Global', line: 0, scopeId: 'global' }],
    webApis: [],
    taskQueue: [],
    microtaskQueue: [],
    consoleOutput: [],
    executionStatus: 'idle',
    eventLoopPhase: 'idle',
    error: null,
    explanation: 'Press Run to start execution.',
  };
}

/** Format a RuntimeValue to a readable string for the UI */
export function formatValue(value: RuntimeValue, depth = 0): string {
  if (depth > 2) return '...';
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return isNaN(value) ? 'NaN' : String(value);
  if (typeof value === 'boolean') return String(value);

  const v = value as { __type: string };
  if (v.__type === 'function') {
    return `ƒ ${(value as { name: string }).name}()`;
  }
  if (v.__type === 'array') {
    const arr = value as { elements: RuntimeValue[] };
    const items = arr.elements.slice(0, 5).map((e) => formatValue(e, depth + 1));
    const suffix = arr.elements.length > 5 ? `, +${arr.elements.length - 5} more` : '';
    return `[${items.join(', ')}${suffix}]`;
  }
  if (v.__type === 'object') {
    const obj = value as { properties: Record<string, RuntimeValue> };
    const keys = Object.keys(obj.properties).slice(0, 3);
    const pairs = keys.map((k) => `${k}: ${formatValue(obj.properties[k], depth + 1)}`);
    const suffix = Object.keys(obj.properties).length > 3 ? ', ...' : '';
    return `{${pairs.join(', ')}${suffix}}`;
  }
  return String(value);
}

/** Returns a color class for the value type (for syntax-highlighting in variable panels) */
export function valueColorClass(value: RuntimeValue): string {
  if (value === null || value === undefined) return 'text-zinc-500';
  if (typeof value === 'boolean') return 'text-blue-400';
  if (typeof value === 'number') return 'text-green-400';
  if (typeof value === 'string') return 'text-amber-400';
  const v = value as { __type: string };
  if (v.__type === 'function') return 'text-purple-400';
  return 'text-cyan-400';
}

/** Map event type to a short badge color */
export function eventBadgeColor(type: ExecutionEventType): string {
  const map: Partial<Record<ExecutionEventType, string>> = {
    DECLARE_VARIABLE: 'bg-blue-600',
    ASSIGN_VARIABLE: 'bg-green-600',
    HOISTING: 'bg-orange-600',
    ENTER_FUNCTION: 'bg-purple-600',
    EXIT_FUNCTION: 'bg-purple-800',
    PUSH_CALL_STACK: 'bg-violet-600',
    POP_CALL_STACK: 'bg-violet-800',
    EVALUATE_CONDITION: 'bg-yellow-600',
    LOOP_START: 'bg-teal-600',
    LOOP_ITERATION: 'bg-teal-500',
    LOOP_END: 'bg-teal-800',
    CONSOLE_OUTPUT: 'bg-emerald-600',
    REGISTER_TIMER: 'bg-sky-600',
    MOVE_TO_TASK_QUEUE: 'bg-sky-500',
    MOVE_TO_MICROTASK_QUEUE: 'bg-indigo-500',
    EVENT_LOOP_CHECK: 'bg-indigo-600',
    PROCESS_MICROTASK: 'bg-indigo-400',
    PROCESS_TASK: 'bg-sky-400',
    PROMISE_CREATED: 'bg-pink-600',
    CREATION_PHASE: 'bg-orange-500',
    EXECUTION_PHASE: 'bg-blue-500',
    PROGRAM_START: 'bg-gray-600',
    PROGRAM_END: 'bg-gray-700',
    ERROR: 'bg-red-600',
    RETURN_VALUE: 'bg-purple-500',
    BREAK_STATEMENT: 'bg-red-500',
    CONTINUE_STATEMENT: 'bg-yellow-500',
  };
  return map[type] ?? 'bg-zinc-600';
}

/** Shorter human-readable event type label */
export function eventLabel(type: ExecutionEventType): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The CODEFLOW example programs */
export const EXAMPLE_PROGRAMS: Array<{ label: string; code: string }> = [
  {
    label: 'Variables & Functions',
    code: `let x = 10;
let y = 20;

function add(a, b) {
  return a + b;
}

let result = add(x, y);
console.log(result);`,
  },
  {
    label: 'Hoisting',
    code: `console.log(x);
var x = 10;
console.log(x);`,
  },
  {
    label: 'If / Else',
    code: `let score = 85;

if (score >= 90) {
  console.log("A grade");
} else if (score >= 80) {
  console.log("B grade");
} else {
  console.log("C grade");
}`,
  },
  {
    label: 'for Loop',
    code: `for (let i = 1; i <= 5; i++) {
  console.log(i);
}`,
  },
  {
    label: 'while Loop',
    code: `let i = 10;
while (i < 15) {
  console.log(i);
  i++;
}`,
  },
  {
    label: 'Recursion',
    code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

let result = factorial(5);
console.log(result);`,
  },
  {
    label: 'setTimeout (Async)',
    code: `console.log("Start");

setTimeout(() => {
  console.log("Timeout callback");
}, 1000);

console.log("End");`,
  },
  {
    label: 'Promise Microtask',
    code: `console.log("A");

Promise.resolve().then(() => {
  console.log("B");
});

console.log("C");`,
  },
  {
    label: 'Scope',
    code: `let x = "global";

function outer() {
  let x = "outer";
  function inner() {
    let x = "inner";
    console.log(x);
  }
  inner();
  console.log(x);
}

outer();
console.log(x);`,
  },
];
