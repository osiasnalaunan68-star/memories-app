// src/pages/Login.js
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(identifier.trim(), password)
      navigate('/feed')
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        display: 'flex',
        borderRadius: 28,
        overflow: 'hidden',
        border: '1px solid var(--border2)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
        minHeight: 540,
      }} className="fade-up">

        {/* LEFT — Class photo panel */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg3)',
          overflow: 'hidden',
          minHeight: 300,
        }} className="auth-photo-panel">
          {/* Placeholder — replace logo.png with your class photo */}
          <img
            src="/logo.png"
            alt="Class Photo"
            onError={(e) => { e.target.style.display = 'none' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.85,
            }}
          />
          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,18,0) 0%, rgba(10,10,18,0.6) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 28,
            left: 24,
            right: 24,
          }}>
            <div style={{
              fontFamily: 'Clash Display',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
            }}>
              Our Story,<br/>Forever. 🎓
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 6 }}>
              SHS Batch Memories
            </div>
          </div>
        </div>

        {/* RIGHT — Login form */}
        <div style={{
          width: 380,
          flexShrink: 0,
          background: 'var(--card)',
          padding: '44px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>👋</div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 4 }} className="grad-text">Welcome back!</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted2)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Username or Mobile Number
              </label>
              <input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="juan_dc or 09xxxxxxxxx"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted2)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                color: '#ff6b8a',
                fontSize: '0.84rem',
                background: 'rgba(255,107,138,0.1)',
                border: '1px solid rgba(255,107,138,0.2)',
                padding: '10px 14px',
                borderRadius: 12,
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ justifyContent: 'center', marginTop: 6, height: 46 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Logging in...
                </span>
              ) : 'Login →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--muted)' }}>
            No account yet?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .auth-photo-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
