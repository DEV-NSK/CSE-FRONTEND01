/**
 * CODEFLOW — Main Page
 *
 * 3-panel layout as specified in PRD §3:
 *   LEFT:   Code Editor (Monaco, JS syntax highlight, line highlight, error highlight)
 *   MIDDLE: Execution Visualizer (Global Context, Call Stack, Web APIs, Queues, Event Loop)
 *   RIGHT:  Output (Console, Variables, Call Stack summary, Status)
 *
 * PRD §26: No gamification, no competitions, no badges.
 * PRD §4:  Monaco Editor, dark theme, line highlight
 * PRD §5:  Run | Reset | Prev | Step | Play | Pause | Stop | Speed
 */

import React, { useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

import { useCodeflowStore } from '../store/codeflowStore';
import { codeflowService } from '../services/codeflow.service';

import { ExecutionControls } from '../components/ExecutionControls';
import { ExamplesDropdown } from '../components/ExamplesDropdown';
import { VariablePanel } from '../components/VariablePanel';
import { CallStackPanel } from '../components/CallStackPanel';
import { AsyncRuntimePanel } from '../components/AsyncRuntimePanel';
import { ConsolePanel } from '../components/ConsolePanel';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { StepTimeline } from '../components/StepTimeline';
import type { PlaybackSpeed } from '../types/codeflow.types';

export const CodeFlowPage: React.FC = () => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const decorationsRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(null);

  const {
    code, setCode,
    steps, totalSteps, currentStepIndex, currentState,
    executionStatus, speed, parseError,
    loadResult, setLoading, setParseError,
    stepForward, stepBackward, play, pause, stop, reset,
    setSpeed, jumpToStep,
  } = useCodeflowStore();

  // ── Monaco editor mount ──────────────────────────────────────────────────────
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection([]);

    // PRD §4: keyboard shortcut Ctrl+Enter → Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void handleRun();
    });
  };

  // ── Highlight current line in editor (PRD §4) ────────────────────────────────
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;

    // Error highlight (PRD §19)
    if (currentState.error) {
      decorationsRef.current?.set([{
        range: new monaco.Range(currentState.error.line, 1, currentState.error.line, 9999),
        options: {
          isWholeLine: true,
          className: 'codeflow-error-line',
          glyphMarginClassName: 'codeflow-error-glyph',
        },
      }]);
      return;
    }

    const line = currentState.currentLine;
    if (line > 0) {
      decorationsRef.current?.set([{
        range: new monaco.Range(line, 1, line, 9999),
        options: {
          isWholeLine: true,
          className: 'codeflow-current-line',
        },
      }]);
      // Reveal the line in editor (PRD §4: highlight moves as execution progresses)
      editorRef.current.revealLineInCenterIfOutsideViewport(line);
    } else {
      decorationsRef.current?.set([]);
    }
  }, [currentState.currentLine, currentState.error]);

  // ── Run handler ──────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await codeflowService.execute(code);
      if (res.data?.data) {
        loadResult(res.data.data);
        // Auto-step to first step
        setTimeout(() => {
          useCodeflowStore.getState().stepForward();
        }, 50);
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? (e as Error)?.message
        ?? 'Execution failed';
      setParseError(msg);
    }
  }, [code, setLoading, loadResult, setParseError]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const currentEvent = currentStep?.event ?? null;

  // All variables across all scopes flattened (for right panel summary)
  const globalScope = currentState.scopes.find((s) => s.type === 'global');

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-bold tracking-tight text-white">CODEFLOW</span>
          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800 px-1.5 py-0.5 rounded">
            JavaScript
          </span>
        </div>

        <div className="w-px h-5 bg-zinc-700" />

        {/* Controls */}
        <ExecutionControls
          onRun={handleRun}
          onReset={reset}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onPlay={play}
          onPause={pause}
          onStop={stop}
          onSpeedChange={(s: PlaybackSpeed) => setSpeed(s)}
          speed={speed}
          executionStatus={executionStatus}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          hasCode={!!code.trim()}
        />

        <div className="w-px h-5 bg-zinc-700" />

        {/* Examples */}
        <ExamplesDropdown onSelect={(c) => { setCode(c); reset(); }} />

        {/* Status indicator */}
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge
            status={executionStatus}
            hasError={!!parseError || !!currentState.error}
          />
        </div>
      </header>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      {steps.length > 0 && (
        <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <StepTimeline
            steps={steps}
            currentStepIndex={currentStepIndex}
            onJump={jumpToStep}
          />
        </div>
      )}

      {/* ── Explanation bar ───────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/30 shrink-0">
        <ExplanationPanel
          explanation={
            parseError
              ? `Parse Error: ${parseError}`
              : currentState.error
                ? `${currentState.error.type}: ${currentState.error.message}`
                : currentState.explanation
          }
          currentEvent={currentEvent}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
        />
      </div>

      {/* ── Main 3-panel area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* ── LEFT: Code Editor (PRD §4) ──────────────────────────────────── */}
          <Panel defaultSize={33} minSize={20} className="flex flex-col">
            <PanelHeader label="CODE EDITOR" sublabel="JavaScript" />
            <div className="flex-1 overflow-hidden relative">
              <Editor
                language="javascript"
                value={code}
                onChange={(val) => setCode(val ?? '')}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
                  fontLigatures: true,
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  padding: { top: 8, bottom: 8 },
                  glyphMargin: true,
                  folding: false,
                  lineDecorationsWidth: 4,
                  renderLineHighlight: 'none', // we do it via decorations
                  scrollbar: { verticalScrollbarSize: 6 },
                  suggest: { showWords: false },
                }}
              />
              {/* Monaco line highlight CSS injected globally */}
              <style>{`
                .codeflow-current-line {
                  background: rgba(234, 179, 8, 0.12) !important;
                  border-left: 3px solid #eab308 !important;
                }
                .codeflow-error-line {
                  background: rgba(239, 68, 68, 0.12) !important;
                  border-left: 3px solid #ef4444 !important;
                }
              `}</style>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-col-resize" />

          {/* ── MIDDLE: Execution Visualizer (PRD §7) ───────────────────────── */}
          <Panel defaultSize={37} minSize={24} className="flex flex-col">
            <PanelHeader label="EXECUTION VISUALIZER" sublabel="Runtime Environment" />
            <div className="flex-1 overflow-hidden p-2">
              <PanelGroup direction="vertical" className="h-full">
                {/* Global Context + Call Stack (top) */}
                <Panel defaultSize={55} minSize={30} className="overflow-hidden">
                  <PanelGroup direction="horizontal" className="h-full">
                    <Panel defaultSize={55} className="flex flex-col pr-1 overflow-hidden">
                      <SectionHeader label="Global Context / Variables" />
                      <div className="flex-1 overflow-y-auto">
                        <VariablePanel
                          scopes={currentState.scopes}
                          currentStepIndex={currentStepIndex}
                        />
                      </div>
                    </Panel>
                    <PanelResizeHandle className="w-px bg-zinc-800 hover:bg-zinc-600 cursor-col-resize" />
                    <Panel defaultSize={45} className="flex flex-col pl-1 overflow-hidden">
                      <SectionHeader label="Call Stack" />
                      <div className="flex-1 overflow-y-auto">
                        <CallStackPanel callStack={currentState.callStack} />
                      </div>
                    </Panel>
                  </PanelGroup>
                </Panel>

                <PanelResizeHandle className="h-px bg-zinc-800 hover:bg-zinc-600 cursor-row-resize my-0.5" />

                {/* Async runtime (bottom) */}
                <Panel defaultSize={45} minSize={20} className="overflow-y-auto">
                  <SectionHeader label="Async Runtime" />
                  <AsyncRuntimePanel
                    webApis={currentState.webApis}
                    microtaskQueue={currentState.microtaskQueue}
                    taskQueue={currentState.taskQueue}
                    eventLoopPhase={currentState.eventLoopPhase}
                  />
                </Panel>
              </PanelGroup>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-zinc-600 transition-colors cursor-col-resize" />

          {/* ── RIGHT: Output (PRD §12 / §3) ────────────────────────────────── */}
          <Panel defaultSize={30} minSize={18} className="flex flex-col">
            <PanelHeader label="OUTPUT" />
            <div className="flex-1 overflow-hidden p-2 flex flex-col gap-2">
              {/* Console — takes most space */}
              <div className="flex-1 overflow-hidden">
                <ConsolePanel
                  entries={currentState.consoleOutput}
                  currentStepIndex={currentStepIndex}
                />
              </div>

              {/* Status */}
              <div className="shrink-0">
                <StatusBlock
                  executionStatus={currentState.executionStatus}
                  error={currentState.error}
                  parseError={parseError}
                  currentStep={currentStepIndex + 1}
                  totalSteps={totalSteps}
                  currentLine={currentState.currentLine}
                />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const PanelHeader: React.FC<{ label: string; sublabel?: string }> = ({ label, sublabel }) => (
  <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
    {sublabel && (
      <span className="text-[9px] text-zinc-600 font-mono">{sublabel}</span>
    )}
  </div>
);

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-semibold px-1 py-1 mb-1">
    {label}
  </div>
);

const StatusBadge: React.FC<{ status: string; hasError: boolean }> = ({ status, hasError }) => {
  if (hasError) return (
    <div className="flex items-center gap-1 text-red-400 text-xs">
      <AlertTriangle size={12} /> Error
    </div>
  );
  if (status === 'loading') return (
    <div className="flex items-center gap-1 text-yellow-400 text-xs">
      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Parsing…
    </div>
  );
  if (status === 'ready' || status === 'paused') return (
    <div className="flex items-center gap-1 text-blue-400 text-xs">
      <CheckCircle2 size={12} /> Ready
    </div>
  );
  if (status === 'playing') return (
    <div className="flex items-center gap-1 text-emerald-400 text-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Playing
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-zinc-500 text-xs">
      <span className="w-2 h-2 rounded-full bg-zinc-600" /> Idle
    </div>
  );
};

const StatusBlock: React.FC<{
  executionStatus: string;
  error: { type: string; message: string; line: number } | null;
  parseError: string | null;
  currentStep: number;
  totalSteps: number;
  currentLine: number;
}> = ({ executionStatus, error, parseError, currentStep, totalSteps, currentLine }) => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[10px] font-mono">
    <div className="text-zinc-500 uppercase tracking-widest mb-1.5 text-[9px] font-semibold">Status</div>
    <div className="flex flex-col gap-1">
      <Row label="Status" value={
        error || parseError ? '⛔ Error' :
        executionStatus === 'completed' ? '✓ Complete' :
        executionStatus === 'running' || executionStatus === 'playing' ? '▶ Running' :
        executionStatus === 'paused' || executionStatus === 'ready' ? '⏸ Paused' :
        '○ Idle'
      } />
      {totalSteps > 0 && (
        <Row label="Step" value={`${currentStep} / ${totalSteps}`} />
      )}
      {currentLine > 0 && (
        <Row label="Line" value={String(currentLine)} />
      )}
      {(error || parseError) && (
        <div className="mt-1 text-red-400 text-[9px] break-all leading-relaxed">
          {error ? `${error.type}: ${error.message}` : parseError}
        </div>
      )}
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-zinc-600">{label}</span>
    <span className="text-zinc-300">{value}</span>
  </div>
);

export default CodeFlowPage;
