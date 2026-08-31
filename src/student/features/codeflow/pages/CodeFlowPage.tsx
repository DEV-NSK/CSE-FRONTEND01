/**
 * CODEFLOW — Main Page
 *
 * 3-panel layout:
 *   LEFT:   Code Editor (Monaco, dynamic language, dynamic theme)
 *   MIDDLE: Execution Visualizer (Global Context, Call Stack, Web APIs, Queues, Event Loop)
 *   RIGHT:  Output (Console, Variables, Call Stack summary, Status)
 *
 * Fixes applied:
 *  - All 6 languages selectable (JS / Python / C / C++ / C# / Java)
 *  - Theme respects global themeStore (light/dark)
 *  - Fixed desktop viewport — no page scroll
 *  - Monaco language + theme reactive
 *  - Language sent correctly to backend on execute
 */

import React, { useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

import { useThemeStore } from '@/shared/store/themeStore';
import { useCodeflowStore, CODEFLOW_LANGUAGES } from '../store/codeflowStore';
import { codeflowService } from '../services/codeflow.service';

import { ExecutionControls } from '../components/ExecutionControls';
import { ExamplesDropdown } from '../components/ExamplesDropdown';
import { LanguageSelector } from '../components/LanguageSelector';
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

  // ── Theme ────────────────────────────────────────────────────────────────────
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';
  const monacoTheme = isDark ? 'vs-dark' : 'light';

  // ── Store ────────────────────────────────────────────────────────────────────
  const {
    code, setCode,
    language, setLanguage,
    steps, totalSteps, currentStepIndex, currentState,
    executionStatus, speed, parseError,
    loadResult, setLoading, setParseError,
    stepForward, stepBackward, play, pause, stop, reset,
    setSpeed, jumpToStep,
  } = useCodeflowStore();

  // Derived language config
  const langConfig = CODEFLOW_LANGUAGES.find((l) => l.id === language) ?? CODEFLOW_LANGUAGES[0];

  // ── Monaco editor mount ──────────────────────────────────────────────────────
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection([]);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void handleRun();
    });
  };

  // ── Sync Monaco theme when app theme changes ─────────────────────────────────
  useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(monacoTheme);
  }, [monacoTheme]);

  // ── Highlight current line in editor ─────────────────────────────────────────
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;

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
      editorRef.current.revealLineInCenterIfOutsideViewport(line);
    } else {
      decorationsRef.current?.set([]);
    }
  }, [currentState.currentLine, currentState.error]);

  // ── Run handler ──────────────────────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!code?.trim()) return;
    setLoading(true);
    try {
      const res = await codeflowService.execute(code, language);
      if (res.data?.data) {
        loadResult(res.data.data);
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
  }, [code, language, setLoading, loadResult, setParseError]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const currentEvent = currentStep?.event ?? null;

  // ── Theme-based class helpers ────────────────────────────────────────────────
  const pageBg = isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900';
  const headerBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const dividerColor = isDark ? 'bg-zinc-700' : 'bg-slate-300';
  const timelineBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-100/80 border-slate-200';
  const explanationBg = isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white/70 border-slate-200';
  const panelHeaderBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200';
  const panelHeaderText = isDark ? 'text-zinc-400' : 'text-slate-500';
  const panelHeaderSub = isDark ? 'text-zinc-600' : 'text-slate-400';
  const sectionHeaderText = isDark ? 'text-zinc-600' : 'text-slate-400';
  const resizeHandle = isDark
    ? 'bg-zinc-800 hover:bg-zinc-600'
    : 'bg-slate-200 hover:bg-slate-300';
  const resizeHandleV = isDark
    ? 'bg-zinc-800 hover:bg-zinc-600'
    : 'bg-slate-200 hover:bg-slate-300';

  return (
    <div className={`flex flex-col h-full ${pageBg} overflow-hidden`} style={{ minHeight: 0 }}>
      {/* Monaco line highlight CSS */}
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

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className={`flex items-center gap-2 px-3 py-1.5 border-b ${headerBg} shrink-0 flex-wrap`}>
        {/* Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap size={14} className="text-yellow-400" />
          <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            CODEFLOW
          </span>
        </div>

        <div className={`w-px h-4 ${dividerColor} shrink-0`} />

        {/* Language selector */}
        <LanguageSelector
          language={language}
          onSelect={(lang) => setLanguage(lang)}
          isDark={isDark}
        />

        <div className={`w-px h-4 ${dividerColor} shrink-0`} />

        {/* Execution controls */}
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
          hasCode={!!(code?.trim())}
          isDark={isDark}
        />

        <div className={`w-px h-4 ${dividerColor} shrink-0`} />

        {/* Examples */}
        <ExamplesDropdown
          language={language}
          onSelect={(c) => { setCode(c); reset(); }}
          isDark={isDark}
        />

        {/* Status indicator */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <StatusBadge
            status={executionStatus}
            hasError={!!parseError || !!currentState.error}
            isDark={isDark}
          />
        </div>
      </header>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      {steps.length > 0 && (
        <div className={`px-4 py-1.5 border-b ${timelineBg} shrink-0`}>
          <StepTimeline
            steps={steps}
            currentStepIndex={currentStepIndex}
            onJump={jumpToStep}
            isDark={isDark}
          />
        </div>
      )}

      {/* ── Explanation bar ───────────────────────────────────────────────────── */}
      <div className={`px-4 py-1.5 border-b ${explanationBg} shrink-0`}>
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
          isDark={isDark}
        />
      </div>

      {/* ── Main 3-panel area ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">

          {/* ── LEFT: Code Editor ───────────────────────────────────────────── */}
          <Panel defaultSize={33} minSize={20} className="flex flex-col min-h-0">
            <PanelHeader
              label="CODE EDITOR"
              sublabel={langConfig.name}
              bgClass={panelHeaderBg}
              textClass={panelHeaderText}
              subClass={panelHeaderSub}
            />
            <div className="flex-1 overflow-hidden relative min-h-0">
              <Editor
                language={langConfig.monacoLanguage}
                value={code}
                onChange={(val) => setCode(val ?? '')}
                onMount={handleEditorMount}
                theme={monacoTheme}
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
                  renderLineHighlight: 'none',
                  scrollbar: { verticalScrollbarSize: 6 },
                  suggest: { showWords: false },
                }}
              />
            </div>
          </Panel>

          <PanelResizeHandle className={`w-1 ${resizeHandle} transition-colors cursor-col-resize`} />

          {/* ── MIDDLE: Execution Visualizer ────────────────────────────────── */}
          <Panel defaultSize={37} minSize={24} className="flex flex-col min-h-0">
            <PanelHeader
              label="EXECUTION VISUALIZER"
              sublabel={langConfig.runtimeLabel}
              bgClass={panelHeaderBg}
              textClass={panelHeaderText}
              subClass={panelHeaderSub}
            />
            <div className="flex-1 overflow-hidden min-h-0 p-2">
              <PanelGroup direction="vertical" className="h-full">
                {/* Global Context + Call Stack (top) */}
                <Panel defaultSize={55} minSize={30} className="overflow-hidden min-h-0">
                  <PanelGroup direction="horizontal" className="h-full">
                    <Panel defaultSize={55} className="flex flex-col pr-1 overflow-hidden min-h-0">
                      <SectionHeader label="Global Context / Variables" textClass={sectionHeaderText} />
                      <div className="flex-1 overflow-y-auto min-h-0">
                        <VariablePanel
                          scopes={currentState.scopes}
                          currentStepIndex={currentStepIndex}
                          isDark={isDark}
                        />
                      </div>
                    </Panel>
                    <PanelResizeHandle className={`w-px ${resizeHandleV} cursor-col-resize`} />
                    <Panel defaultSize={45} className="flex flex-col pl-1 overflow-hidden min-h-0">
                      <SectionHeader label="Call Stack" textClass={sectionHeaderText} />
                      <div className="flex-1 overflow-y-auto min-h-0">
                        <CallStackPanel callStack={currentState.callStack} isDark={isDark} />
                      </div>
                    </Panel>
                  </PanelGroup>
                </Panel>

                <PanelResizeHandle className={`h-px ${resizeHandleV} cursor-row-resize my-0.5`} />

                {/* Async runtime (bottom) — JS only; other languages show their runtime model */}
                <Panel defaultSize={45} minSize={20} className="overflow-y-auto min-h-0">
                  {language === 'javascript' ? (
                    <>
                      <SectionHeader label="Async Runtime" textClass={sectionHeaderText} />
                      <AsyncRuntimePanel
                        webApis={currentState.webApis}
                        microtaskQueue={currentState.microtaskQueue}
                        taskQueue={currentState.taskQueue}
                        eventLoopPhase={currentState.eventLoopPhase}
                        isDark={isDark}
                      />
                    </>
                  ) : (
                    <>
                      <SectionHeader label="Runtime Model" textClass={sectionHeaderText} />
                      <LanguageRuntimeInfo language={language} isDark={isDark} />
                    </>
                  )}
                </Panel>
              </PanelGroup>
            </div>
          </Panel>

          <PanelResizeHandle className={`w-1 ${resizeHandle} transition-colors cursor-col-resize`} />

          {/* ── RIGHT: Output ────────────────────────────────────────────────── */}
          <Panel defaultSize={30} minSize={18} className="flex flex-col min-h-0">
            <PanelHeader
              label="OUTPUT"
              bgClass={panelHeaderBg}
              textClass={panelHeaderText}
              subClass={panelHeaderSub}
            />
            <div className="flex-1 overflow-hidden min-h-0 p-2 flex flex-col gap-2">
              {/* Console — takes most space */}
              <div className="flex-1 overflow-hidden min-h-0">
                <ConsolePanel
                  entries={currentState.consoleOutput}
                  currentStepIndex={currentStepIndex}
                  isDark={isDark}
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
                  isDark={isDark}
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

interface PanelHeaderProps {
  label: string;
  sublabel?: string;
  bgClass: string;
  textClass: string;
  subClass: string;
}
const PanelHeader: React.FC<PanelHeaderProps> = ({ label, sublabel, bgClass, textClass, subClass }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${bgClass} shrink-0`}>
    <span className={`text-[10px] font-bold uppercase tracking-widest ${textClass}`}>{label}</span>
    {sublabel && (
      <span className={`text-[9px] font-mono ${subClass}`}>{sublabel}</span>
    )}
  </div>
);

const SectionHeader: React.FC<{ label: string; textClass: string }> = ({ label, textClass }) => (
  <div className={`text-[9px] uppercase tracking-widest font-semibold px-1 py-1 mb-1 ${textClass}`}>
    {label}
  </div>
);

const StatusBadge: React.FC<{ status: string; hasError: boolean; isDark: boolean }> = ({ status, hasError, isDark }) => {
  const dim = isDark ? 'text-zinc-500' : 'text-slate-400';
  if (hasError) return (
    <div className="flex items-center gap-1 text-red-400 text-xs">
      <AlertTriangle size={12} /> Error
    </div>
  );
  if (status === 'loading') return (
    <div className="flex items-center gap-1 text-yellow-500 text-xs">
      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Parsing…
    </div>
  );
  if (status === 'ready' || status === 'paused') return (
    <div className="flex items-center gap-1 text-blue-500 text-xs">
      <CheckCircle2 size={12} /> Ready
    </div>
  );
  if (status === 'playing') return (
    <div className="flex items-center gap-1 text-emerald-500 text-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Playing
    </div>
  );
  return (
    <div className={`flex items-center gap-1 text-xs ${dim}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-50" /> Idle
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
  isDark: boolean;
}> = ({ executionStatus, error, parseError, currentStep, totalSteps, currentLine, isDark }) => {
  const blockClass = isDark
    ? 'border-zinc-800 bg-zinc-900'
    : 'border-slate-200 bg-slate-50';
  const labelClass = isDark ? 'text-zinc-500' : 'text-slate-400';
  const valueClass = isDark ? 'text-zinc-300' : 'text-slate-700';
  const headingClass = isDark ? 'text-zinc-500' : 'text-slate-400';

  return (
    <div className={`rounded-lg border ${blockClass} px-3 py-2 text-[10px] font-mono`}>
      <div className={`uppercase tracking-widest mb-1.5 text-[9px] font-semibold ${headingClass}`}>Status</div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className={labelClass}>Status</span>
          <span className={valueClass}>
            {error || parseError ? '⛔ Error' :
              executionStatus === 'completed' ? '✓ Complete' :
              executionStatus === 'running' || executionStatus === 'playing' ? '▶ Running' :
              executionStatus === 'paused' || executionStatus === 'ready' ? '⏸ Paused' :
              '○ Idle'}
          </span>
        </div>
        {totalSteps > 0 && (
          <div className="flex justify-between">
            <span className={labelClass}>Step</span>
            <span className={valueClass}>{currentStep} / {totalSteps}</span>
          </div>
        )}
        {currentLine > 0 && (
          <div className="flex justify-between">
            <span className={labelClass}>Line</span>
            <span className={valueClass}>{currentLine}</span>
          </div>
        )}
        {(error || parseError) && (
          <div className="mt-1 text-red-400 text-[9px] break-all leading-relaxed">
            {error ? `${error.type}: ${error.message}` : parseError}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeFlowPage;

// ── Language Runtime Info Panel ────────────────────────────────────────────────
// Shown in the "Async Runtime" slot for non-JS languages.

interface RuntimeStage {
  icon: string;
  label: string;
  description: string;
}

const RUNTIME_STAGES: Record<string, RuntimeStage[]> = {
  python: [
    { icon: '📄', label: 'Source Code', description: '.py file' },
    { icon: '⚙️', label: 'Compilation', description: 'CPython compiler' },
    { icon: '💾', label: 'Bytecode', description: '.pyc / __pycache__' },
    { icon: '🐍', label: 'Python VM', description: 'CPython interpreter' },
    { icon: '📦', label: 'Execution Frames', description: 'Call stack frames' },
    { icon: '🗂️', label: 'Variables / Objects', description: 'Heap & namespace dicts' },
  ],
  c: [
    { icon: '📄', label: 'Source (.c)', description: 'C source file' },
    { icon: '🔧', label: 'Preprocessor', description: '#include, #define' },
    { icon: '⚙️', label: 'Compiler (gcc/clang)', description: 'Generates assembly' },
    { icon: '📋', label: 'Object Code (.o)', description: 'Compiled object file' },
    { icon: '🔗', label: 'Linker', description: 'Links libraries' },
    { icon: '▶️', label: 'Executable', description: 'Native binary' },
    { icon: '🏃', label: 'Runtime', description: 'Stack & Heap' },
  ],
  cpp: [
    { icon: '📄', label: 'Source (.cpp)', description: 'C++ source file' },
    { icon: '🔧', label: 'Preprocessor', description: '#include, templates' },
    { icon: '⚙️', label: 'Compiler (g++/clang++)', description: 'Assembly + objects' },
    { icon: '🔗', label: 'Linker', description: 'Links std & libs' },
    { icon: '▶️', label: 'Executable', description: 'Native binary' },
    { icon: '🏃', label: 'Runtime', description: 'Stack, Heap, Objects' },
    { icon: '📌', label: 'References/Pointers', description: 'Manual memory' },
  ],
  csharp: [
    { icon: '📄', label: 'Source (.cs)', description: 'C# source file' },
    { icon: '⚙️', label: 'Roslyn Compiler', description: 'Microsoft C# compiler' },
    { icon: '💾', label: 'MSIL / CIL', description: 'Intermediate Language' },
    { icon: '🔧', label: 'CLR', description: 'Common Language Runtime' },
    { icon: '⚡', label: 'JIT Compiler', description: 'Just-In-Time compilation' },
    { icon: '▶️', label: 'Native Execution', description: 'Managed code runs' },
    { icon: '🗂️', label: 'Managed Heap', description: 'GC-managed objects' },
  ],
  java: [
    { icon: '📄', label: 'Source (.java)', description: 'Java source file' },
    { icon: '⚙️', label: 'javac', description: 'Java compiler' },
    { icon: '💾', label: 'Bytecode (.class)', description: 'Platform-neutral' },
    { icon: '☕', label: 'JVM', description: 'Java Virtual Machine' },
    { icon: '⚡', label: 'JIT Compiler', description: 'Hotspot optimization' },
    { icon: '📦', label: 'Stack Frames', description: 'Method call frames' },
    { icon: '🗂️', label: 'Heap / Objects', description: 'GC-managed objects' },
  ],
};

const LanguageRuntimeInfo: React.FC<{ language: string; isDark: boolean }> = ({ language, isDark }) => {
  const stages = RUNTIME_STAGES[language] ?? [];
  if (stages.length === 0) return null;

  const containerBg = isDark ? 'bg-zinc-900/40' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-white border-slate-200';
  const labelText = isDark ? 'text-zinc-200' : 'text-slate-700';
  const descText = isDark ? 'text-zinc-500' : 'text-slate-400';
  const arrowColor = isDark ? 'text-zinc-600' : 'text-slate-300';

  return (
    <div className={`rounded-lg ${containerBg} p-2 flex flex-col gap-1 overflow-y-auto`}>
      {stages.map((stage, idx) => (
        <React.Fragment key={stage.label}>
          <div className={`flex items-center gap-2 rounded border px-2 py-1.5 ${cardBg}`}>
            <span className="text-sm shrink-0">{stage.icon}</span>
            <div className="min-w-0">
              <div className={`text-[10px] font-semibold font-mono ${labelText}`}>{stage.label}</div>
              <div className={`text-[9px] ${descText}`}>{stage.description}</div>
            </div>
          </div>
          {idx < stages.length - 1 && (
            <div className={`text-center text-[10px] leading-none ${arrowColor}`}>↓</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
