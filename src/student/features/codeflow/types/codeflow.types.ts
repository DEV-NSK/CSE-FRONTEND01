/**
 * CODEFLOW — Frontend TypeScript types
 * Mirrors the backend types exactly.
 * PRD-CODEFLOW-01
 */

export type ExecutionEventType =
  | 'PROGRAM_START'
  | 'CREATION_PHASE'
  | 'EXECUTION_PHASE'
  | 'PROGRAM_END'
  | 'HOISTING'
  | 'DECLARE_VARIABLE'
  | 'ASSIGN_VARIABLE'
  | 'ENTER_FUNCTION'
  | 'EXIT_FUNCTION'
  | 'RETURN_VALUE'
  | 'EVALUATE_CONDITION'
  | 'LOOP_START'
  | 'LOOP_ITERATION'
  | 'LOOP_END'
  | 'BREAK_STATEMENT'
  | 'CONTINUE_STATEMENT'
  | 'PUSH_CALL_STACK'
  | 'POP_CALL_STACK'
  | 'REGISTER_TIMER'
  | 'MOVE_TO_TASK_QUEUE'
  | 'MOVE_TO_MICROTASK_QUEUE'
  | 'EVENT_LOOP_CHECK'
  | 'PROCESS_MICROTASK'
  | 'PROCESS_TASK'
  | 'PROMISE_CREATED'
  | 'PROMISE_RESOLVED'
  | 'CONSOLE_OUTPUT'
  | 'ERROR';

export type VariableKind = 'var' | 'let' | 'const';
export type VariableState = 'hoisted_undefined' | 'tdz' | 'initialized';

export interface Variable {
  name: string;
  value: RuntimeValue;
  kind: VariableKind;
  state: VariableState;
  scopeId: string;
  changedAtStep?: number;
}

export type RuntimeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | RuntimeObject
  | RuntimeArray
  | RuntimeFunction;

export interface RuntimeObject {
  __type: 'object';
  properties: Record<string, RuntimeValue>;
}

export interface RuntimeArray {
  __type: 'array';
  elements: RuntimeValue[];
}

export interface RuntimeFunction {
  __type: 'function';
  name: string;
  params: string[];
}

export type ScopeType = 'global' | 'function' | 'block';

export interface Scope {
  id: string;
  type: ScopeType;
  name: string;
  parentId: string | null;
  variables: Variable[];
}

export interface CallFrame {
  id: string;
  functionName: string;
  line: number;
  scopeId: string;
  returnValue?: RuntimeValue;
}

export interface WebApiEntry {
  id: string;
  label: string;
  type: 'setTimeout' | 'setInterval' | 'Promise';
  delay?: number;
}

export interface QueueEntry {
  id: string;
  label: string;
}

export type EventLoopPhase =
  | 'idle'
  | 'checking'
  | 'stack_empty'
  | 'processing_microtasks'
  | 'processing_tasks';

export interface ConsoleEntry {
  id: string;
  value: string;
  line: number;
  stepIndex: number;
}

export interface ExecutionEvent {
  type: ExecutionEventType;
  line: number;
  description: string;
  detail: Record<string, unknown>;
}

export interface RuntimeState {
  currentLine: number;
  currentStep: number;
  scopes: Scope[];
  callStack: CallFrame[];
  webApis: WebApiEntry[];
  taskQueue: QueueEntry[];
  microtaskQueue: QueueEntry[];
  consoleOutput: ConsoleEntry[];
  executionStatus: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  eventLoopPhase: EventLoopPhase;
  error: { type: string; message: string; line: number } | null;
  explanation: string;
}

export interface ExecutionStep {
  index: number;
  event: ExecutionEvent;
  state: RuntimeState;
}

export interface ExecutionResult {
  steps: ExecutionStep[];
  totalSteps: number;
  finalState: RuntimeState;
  hasError: boolean;
  parseError?: string;
}

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;
