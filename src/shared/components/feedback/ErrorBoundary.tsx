import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

// ─── Full-page Error Boundary ─────────────────────────────────────────────────

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-16 text-center">
          <div className="p-4 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-2">
            An unexpected error occurred while rendering this page.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <details className="mb-6 max-w-lg text-left">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40 text-destructive">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack?.split('\n').slice(1, 5).join('\n')}
              </pre>
            </details>
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button className="gap-2" onClick={() => { window.location.href = '/dashboard' }}>
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ─── Widget Error Boundary ────────────────────────────────────────────────────
// Use this for isolated sections so a single widget failure never crashes the page.

interface WidgetBoundaryProps {
  children: ReactNode
  /** Optional label shown in the inline fallback, e.g. "Recent Activity" */
  label?: string
  /** Custom fallback to show instead of the default inline error */
  fallback?: ReactNode
  /** Minimum height for the error placeholder (default 120px) */
  minHeight?: number
}

interface WidgetBoundaryState {
  hasError: boolean
  retryKey: number
}

export class WidgetErrorBoundary extends Component<WidgetBoundaryProps, WidgetBoundaryState> {
  private retryTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(props: WidgetBoundaryProps) {
    super(props)
    this.state = { hasError: false, retryKey: 0 }
  }

  static getDerivedStateFromError(): WidgetBoundaryState {
    return { hasError: true, retryKey: 0 }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WidgetErrorBoundary${this.props.label ? ` (${this.props.label})` : ''}]`, error, info)
    // Auto-retry once after 3 seconds
    this.retryTimeout = setTimeout(() => {
      this.setState((s) => ({ hasError: false, retryKey: s.retryKey + 1 }))
    }, 3000)
  }

  componentWillUnmount() {
    if (this.retryTimeout) clearTimeout(this.retryTimeout)
  }

  handleManualRetry = () => {
    if (this.retryTimeout) clearTimeout(this.retryTimeout)
    this.setState((s) => ({ hasError: false, retryKey: s.retryKey + 1 }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const minH = this.props.minHeight ?? 120
      const label = this.props.label

      return (
        <div
          className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/20 text-center px-4"
          style={{ minHeight: minH }}
          role="alert"
          aria-label={label ? `${label} failed to load` : 'Widget failed to load'}
        >
          <AlertTriangle className="h-5 w-5 text-muted-foreground/40 mb-2" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            {label ? `${label} couldn't be loaded` : 'This section couldn\'t be loaded'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs h-7 gap-1"
            onClick={this.handleManualRetry}
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )
    }

    // Re-mount children on retry via key
    return (
      <div key={this.state.retryKey}>
        {this.props.children}
      </div>
    )
  }
}
