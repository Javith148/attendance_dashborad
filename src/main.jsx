import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>MAAS Attendance System</h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Choose which portal you would like to open:</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#1a237e', color: '#ffffff', border: 'none', cursor: 'pointer' }}
              >
                Staff Portal
              </button>
              <button 
                onClick={() => { window.location.href = '/admin'; }}
                style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', cursor: 'pointer' }}
              >
                Admin Portal
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
