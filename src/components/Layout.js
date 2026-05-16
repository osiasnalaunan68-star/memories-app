// src/components/Layout.js
import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiImage, FiUser, FiLogOut, FiPlus, FiMenu, FiX, FiShield } from 'react-icons/fi'
import CreatePost from './CreatePost'

export default function Layout() {
  const { currentUser, userProfile, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }
  const initials = (userProfile?.display_name || 'U').slice(0, 2).toUpperCase()

  const navItems = [
    { to: '/feed', icon: <FiHome size={20} />, label: 'Home' },
    { to: '/memories', icon: <FiImage size={20} />, label: 'Memories' },
    { to: '/profile/' + currentUser?.id, icon: <FiUser size={20} />, label: 'Profile' },
    ...(isAdmin ? [{ to: '/admin', icon: <FiShield size={20} />, label: 'Admin' }] : []),
  ]

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 14px',
    borderRadius: 14,
    textDecoration: 'none',
    color: isActive ? 'var(--text)' : 'var(--muted)',
    background: isActive ? 'rgba(124,108,252,0.15)' : 'transparent',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
    border: isActive ? '1px solid rgba(124,108,252,0.2)' : '1px solid transparent',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside style={{
        width: 250,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        gap: 4,
        zIndex: 10,
      }} className="desktop-sidebar">

        <div style={{ padding: '4px 14px 24px' }}>
          <div style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: '1.3rem' }} className="grad-text">
            Memories
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>SHS Batch '25</div>
        </div>

        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => navLinkStyle(isActive)}>
            {item.icon} {item.label}
          </NavLink>
        ))}

        <button
          className="btn-primary"
          style={{ marginTop: 12, justifyContent: 'center' }}
          onClick={() => setShowCreate(true)}
        >
          <FiPlus size={18} /> Create Post
        </button>

        {/* Profile at bottom */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: 'var(--bg3)',
            borderRadius: 14,
            marginBottom: 8,
            cursor: 'pointer',
            border: '1px solid var(--border)',
          }} onClick={() => navigate('/profile/' + currentUser?.id)}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.78rem' }}>
              {userProfile?.photo_url
                ? <img src={userProfile.photo_url} alt="" />
                : initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile?.display_name}
              </div>
              <div style={{ fontSize: '0.71rem', color: 'var(--muted)' }}>@{userProfile?.username}</div>
            </div>
            {isAdmin && <span style={{ fontSize: '0.65rem', background: 'var(--grad)', borderRadius: 6, padding: '2px 6px', color: 'white', fontFamily: 'Clash Display', flexShrink: 0 }}>ADMIN</span>}
          </div>
          <button className="btn-ghost" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.85rem' }}>
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(10,10,18,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }} className="mobile-topbar">
        <span style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: '1.2rem' }} className="grad-text">Memories</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: 10 }} onClick={() => setShowCreate(true)}>
            <FiPlus size={15} />
          </button>
          <button onClick={() => setMenuOpen(v => !v)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4 }}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setMenuOpen(false)}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 240, height: '100%',
            background: 'var(--bg2)', padding: '70px 14px 24px',
            display: 'flex', flexDirection: 'column', gap: 4,
            borderLeft: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={({ isActive }) => navLinkStyle(isActive)}>
                {item.icon} {item.label}
              </NavLink>
            ))}
            <div style={{ marginTop: 'auto' }}>
              <button className="btn-ghost" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }} className="main-content">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav style={{
        display: 'none',
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: 'rgba(10,10,18,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }} className="mobile-bottom-nav">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            textDecoration: 'none',
            flex: 1,
            fontSize: '0.6rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '4px 0',
          })}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {showCreate && <CreatePost onClose={() => setShowCreate(false)} />}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          .main-content { padding-top: 58px; padding-bottom: 72px; }
        }
      `}</style>
    </div>
  )
}
