// src/pages/Memories.js
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import { FiLock } from 'react-icons/fi'

export default function Memories() {
  const { currentUser } = useAuth()
  const [memories, setMemories] = useState([])
  const [groups, setGroups] = useState({})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    supabase.from('posts').select('*')
      .eq('uid', currentUser.id)
      .eq('is_private_memory', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setMemories(data)
          const g = {}
          data.forEach(p => {
            const k = p.memory_group || 'My Memories'
            if (!g[k]) g[k] = []
            g[k].push(p)
          })
          setGroups(g)
        }
        setLoading(false)
      })
  }, [currentUser])

  const groupNames = Object.keys(groups)

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: 160, borderRadius: 18 }} />
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.7rem', marginBottom: 6 }}>
          <span className="grad-text">My Memories</span> 🔒
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--muted)', fontSize: '0.86rem' }}>
          <FiLock size={13} />
          Only you can see these memories
        </div>
        <div style={{ marginTop: 5, color: 'var(--muted)', fontSize: '0.8rem' }}>
          {memories.length} memories · {groupNames.length} album{groupNames.length !== 1 ? 's' : ''}
        </div>
      </div>

      {groupNames.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>📸</div>
          <div style={{ fontFamily: 'Clash Display', fontSize: '1.1rem', marginBottom: 8 }}>No memories yet!</div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
            Click <strong style={{ color: 'var(--accent2)' }}>Create Post</strong> and choose<br />
            <strong style={{ color: 'var(--accent2)' }}>Memory</strong> to save private memories here ✨
          </div>
        </div>
      ) : !selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {groupNames.map(g => {
            const items = groups[g]
            const cover = items.find(p => p.media_urls && p.media_urls[0])
            const coverUrl = cover ? cover.media_urls[0] : null
            return (
              <div
                key={g}
                className="card"
                onClick={() => setSelected(g)}
                style={{ cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{
                  height: 145,
                  background: coverUrl ? 'url(' + coverUrl + ') center/cover no-repeat' : 'linear-gradient(135deg,#7c6cfc,#fc6c8f)',
                  position: 'relative',
                }}>
                  {!coverUrl && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem' }}>📸</div>
                  )}
                  <div style={{ position: 'absolute', top: 9, right: 9, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', borderRadius: 20, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'white' }}>
                    <FiLock size={9} /> Private
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 14px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)' }}>
                    <div style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{g}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="btn-ghost" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 7 }}>
            ← Back to Albums
          </button>
          <h2 style={{ fontFamily: 'Clash Display', fontSize: '1.2rem', marginBottom: 18 }}>📂 {selected}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
            {groups[selected].map(post => {
              if (post.media_urls && post.media_urls.length > 0) {
                return post.media_urls.map((url, i) => {
                  const isVideo = post.media_types && post.media_types[i] === 'video'
                  return isVideo
                    ? <video key={post.id + '_' + i} src={url} controls style={{ width: '100%', height: 155, objectFit: 'cover', borderRadius: 14, display: 'block' }} />
                    : <img key={post.id + '_' + i} src={url} alt="" style={{ width: '100%', height: 155, objectFit: 'cover', borderRadius: 14, cursor: 'pointer', display: 'block' }} />
                })
              }
              return (
                <div key={post.id} style={{
                  height: 155, borderRadius: 14, background: 'var(--bg3)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: 14, textAlign: 'center',
                  fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.5,
                }}>
                  {post.caption ? post.caption.slice(0, 80) : 'No caption'}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
