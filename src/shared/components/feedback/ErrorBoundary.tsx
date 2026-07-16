import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

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
    // Log to error monitoring service in production
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
