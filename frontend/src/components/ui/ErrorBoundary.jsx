import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <AlertTriangle size={28} className="mx-auto mb-3 text-rust" />
            <p className="text-sm font-medium text-ink mb-1">Something went wrong</p>
            <p className="text-sm text-ink-faint mb-4">
              This part of the app hit an unexpected error. Try reloading — your data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-ink text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
