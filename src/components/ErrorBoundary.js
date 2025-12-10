import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      const dev = process.env.NODE_ENV === 'development';
      return (
        <div style={{ padding: 20, textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Please try again later.</p>
          {dev && this.state.error && (
            <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>
              {String(this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
