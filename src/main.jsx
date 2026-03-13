import { StrictMode, Component } from 'react'
import { Analytics } from '@vercel/analytics/react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('EduNest Error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '2rem', background: '#f8fafc'
        }}>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>
            ⚠️ Something went wrong
          </h1>
          <p style={{ color: '#64748b', maxWidth: '500px', textAlign: 'center', marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Please check your Supabase credentials in the <code>.env</code> file.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </StrictMode>,
)
