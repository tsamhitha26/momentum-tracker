import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <div className="p-4 rounded-md bg-red-50 text-red-700 border border-red-100">
          <div className="font-semibold mb-2">Component error</div>
          <div className="text-xs whitespace-pre-wrap">{String(error?.message || error)}</div>
          {info?.componentStack && (
            <details className="mt-2 text-xs text-red-600">
              <summary>Stack</summary>
              <pre className="text-xs">{info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}