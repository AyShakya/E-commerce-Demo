import React from "react";
import { Link } from "react-router-dom";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
          <div className="max-w-xl text-center space-y-8 border border-white/15 bg-white/[0.02] p-10">
            <h1 className="text-3xl md:text-4xl font-serif italic tracking-tight">
              Something went wrong
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              The page hit an unexpected error. Please retry your action.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-white/30 text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
              >
                Reload Page
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-white/30 text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
