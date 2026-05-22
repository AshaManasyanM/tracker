import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[App]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0d1219] px-6 py-10 text-slate-100" role="alert">
          <h1 className="font-display text-xl font-bold text-accent-glow">App error</h1>
          <p className="mt-2 text-sm text-slate-400">
            The page crashed. Fix the error below, save, and refresh.
          </p>
          <pre className="mt-4 max-h-64 overflow-auto rounded-lg border border-danger/40 bg-black/40 p-3 text-xs text-danger">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="mt-4 rounded-lg border border-line bg-canvas-overlay px-4 py-2 text-sm text-slate-200"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
