import { useRef, useCallback, lazy, Suspense } from 'react'
import type { editor } from 'monaco-editor'
import { useThemeStore } from '@/shared/store/themeStore'
import { MONACO_LANGUAGE_MAP } from '@/shared/hooks/useCoding'
import { LoadingSpinner } from '@/shared/components/feedback/LoadingSpinner'
import type { Language } from '@/shared/types/coding'
import type { EditorTheme } from '@/shared/store/codingStore'

// Lazy load Monaco Editor for performance
const MonacoEditor = lazy(() =>
  import('@monaco-editor/react').then((m) => ({ default: m.default }))
)

export interface MonacoEditorWrapperProps {
  value: string
  language: Language
  theme?: EditorTheme
  fontSize?: number
  wordWrap?: 'on' | 'off'
  minimap?: boolean
  readOnly?: boolean
  onChange?: (value: string) => void
  onMount?: (editor: editor.IStandaloneCodeEditor) => void
  className?: string
  height?: string
}

export function MonacoEditorWrapper({
  value,
  language,
  theme,
  fontSize = 14,
  wordWrap = 'on',
  minimap = false,
  readOnly = false,
  onChange,
  onMount,
  height = '100%',
}: MonacoEditorWrapperProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const { resolvedTheme } = useThemeStore()

  // Determine Monaco theme: respect explicit override, else match app theme
  const monacoTheme = theme ?? (resolvedTheme === 'dark' ? 'vs-dark' : 'light')

  const handleEditorDidMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor) => {
      editorRef.current = editorInstance

      // Keyboard shortcuts
      editorInstance.addCommand(
        // Ctrl+Enter / Cmd+Enter → trigger run (custom action)
        (window as unknown as { monaco?: { KeyMod?: { CtrlCmd: number }; KeyCode?: { Enter: number } } }).monaco
          ? 0 : 0,
        () => {
          // Will be overridden by parent if needed
        }
      )

      if (onMount) onMount(editorInstance)
    },
    [onMount]
  )

  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
          <LoadingSpinner size="md" label="Loading editor..." />
        </div>
      }
    >
      <MonacoEditor
        height={height}
        language={MONACO_LANGUAGE_MAP[language] ?? 'javascript'}
        value={value}
        theme={monacoTheme}
        onChange={(val) => onChange?.(val ?? '')}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          wordWrap,
          minimap: { enabled: minimap },
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'blink',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          contextmenu: true,
          selectOnLineNumbers: true,
          roundedSelection: true,
          bracketPairColorization: { enabled: true },
          'semanticHighlighting.enabled': true,
          accessibilitySupport: 'auto',
          ariaLabel: 'Code editor',
        }}
        loading={
          <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
            <LoadingSpinner size="md" label="Loading editor..." />
          </div>
        }
      />
    </Suspense>
  )
}
