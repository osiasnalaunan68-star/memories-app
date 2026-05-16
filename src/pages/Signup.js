// src/pages/Signup.js
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // Step 1: name, Step 2: account details
  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '',
    username: '', phone: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleNext = (e) => {
    e.preventDefault()
    setError('')
    if (!form.firstName.trim()) { setError('First name is required.'); return }
    if (!form.lastName.trim()) { setError('Last name is required.'); return }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username.match(/^[a-zA-Z0-9_]+$/)) {
      setError('Username: letters, numbers, underscores only.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.phone.match(/^[0-9+\-\s()]{10,}$/)) {
      setError('Enter a valid mobile number.')
      return
    }
    setLoading(true)
    try {
      await signup(form)
      navigate('/feed')
    } catch (err) {
      if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
        setError('Email or username already taken.')
      } else {
        setError(err.message || 'Signup failed. Try again.')
      }
    }
    setLoading(false)
  }

  const inputStyle = { marginBottom: 0 }
  const labelStyle = {
    fontSize: '0.75rem',
    color: 'var(--muted2)',
    fontWeight: 600,
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
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
        minHeight: 560,
      }} className="fade-up">

        {/* LEFT — Class photo panel */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          background: 'var(--bg3)',
          overflow: 'hidden',
          padding: 28,
        }} className="auth-photo-panel">
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
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,18,0) 0%, rgba(10,10,18,0.65) 100%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'Clash Display', fontSize: '1.5rem', fontWeight: 700, color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
              Join the Batch! ✨
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 6 }}>
              SHS Batch Memories
            </div>
          </div>
        </div>

        {/* RIGHT — Signup form */}
        <div style={{
          width: 400,
          flexShrink: 0,
          background: 'var(--card)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflowY: 'auto',
        }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: 3, borderRadius: 3,
                background: s <= step ? 'var(--grad)' : 'var(--border2)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }} className="grad-text">
              {step === 1 ? 'Your Name' : 'Account Details'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {step === 1 ? 'Step 1 of 2 — Tell us who you are' : 'Step 2 of 2 — Set up your login'}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Juan" required />
              </div>
              <div>
                <label style={labelStyle}>Middle Name</label>
                <input style={inputStyle} value={form.middleName} onChange={e => set('middleName', e.target.value)} placeholder="Santos (optional)" />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="dela Cruz" required />
              </div>
              {error && (
                <div style={{ color: '#ff6b8a', fontSize: '0.84rem', background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', padding: '10px 14px', borderRadius: 12 }}>
                  {error}
                </div>
              )}
              <button className="btn-primary" type="submit" style={{ justifyContent: 'center', marginTop: 6, height: 46 }}>
                Next →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label style={labelStyle}>Username *</label>
                <input style={inputStyle} value={form.username} onChange={e => set('username', e.target.value)} placeholder="juan_dc" required />
              </div>
              <div>
                <label style={labelStyle}>Mobile Number *</label>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="09xxxxxxxxx" required />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="juan@gmail.com" required />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 6 characters" required />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input style={inputStyle} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" required />
              </div>
              {error && (
                <div style={{ color: '#ff6b8a', fontSize: '0.84rem', background: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', padding: '10px 14px', borderRadius: 12 }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn-ghost" onClick={() => { setStep(1); setError('') }} style={{ flex: 1, height: 46 }}>← Back</button>
                <button className="btn-primary" type="submit" disabled={loading} style={{ flex: 2, justifyContent: 'center', height: 46 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      Creating...
                    </span>
                  ) : 'Create Account 🎓'}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
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
