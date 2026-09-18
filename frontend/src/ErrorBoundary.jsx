import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'inherit', color: 'var(--text-primary)' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>We apologize for the inconvenience. An unexpected error occurred and has been logged.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
