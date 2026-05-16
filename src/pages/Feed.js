// src/pages/Feed.js
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import PostCard, { SkeletonLoader } from '../components/PostCard'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PROMPTS = [
  'This is your chance to say your unsaid feelings for your crush... 🌸',
  'What is your most unforgettable SHS moment? 🎓',
  'Describe your batch in 3 words! 💭',
  'Drop a hot take about SHS life! 🔥',
  'Who deserves the Most Memorable award? 👑',
  'Song of your SHS era? 🎵',
  'What would you tell your freshman self? 💌',
  'Best SHS memory with your barkada? 🥹',
]

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [pinned, setPinned] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  useEffect(() => {
    fetchPosts()
    fetchUsers()
    const ch = supabase.channel('feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('is_private_memory', false)
      .order('created_at', { ascending: false })
    if (data) {
      setPinned(data.filter(p => p.pinned))
      setPosts(data.filter(p => !p.pinned))
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUser?.id)
      .limit(6)
    if (data) setUsers(data)
  }

  return (
    <div style={{ display: 'flex', maxWidth: 1080, margin: '0 auto', padding: '28px 16px', gap: 24, alignItems: 'flex-start' }}>

      {/* Main feed */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Prompt card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,108,252,0.12), rgba(252,108,143,0.08))',
          border: '1px solid rgba(124,108,252,0.2)',
          borderRadius: 20, padding: '18px 22px', marginBottom: 20,
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Clash Display' }}>
            Prompt of the Day
          </div>
          <div style={{ fontSize: '0.97rem', color: 'var(--text)', lineHeight: 1.55 }}>{prompt}</div>
        </div>

        {loading ? (
          <>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </>
        ) : (
          <>
            {pinned.map(p => <PostCard key={p.id} post={p} onDelete={fetchPosts} />)}
            {posts.length === 0 && pinned.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '80px 20px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>📭</div>
                <div style={{ fontFamily: 'Clash Display', fontSize: '1.15rem', marginBottom: 8 }}>No posts yet!</div>
                <div style={{ fontSize: '0.88rem' }}>Be the first to share a memory ✨</div>
              </div>
            ) : posts.map(p => <PostCard key={p.id} post={p} onDelete={fetchPosts} />)}
          </>
        )}
      </div>

      {/* Right sidebar */}
      <aside style={{ width: 256, flexShrink: 0, position: 'sticky', top: 28 }} className="right-sidebar">
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontFamily: 'Clash Display', fontWeight: 700, fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Classmates
          </div>
          {users.map(user => (
            <div key={user.id}
              onClick={() => navigate('/profile/' + user.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13, cursor: 'pointer', padding: '6px 8px', borderRadius: 12, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                {user.photo_url ? <img src={user.photo_url} alt="" /> : (user.display_name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.display_name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>@{user.username}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.8 }}>
          SHS Batch 2025 · Made with 💜<br />
          <span style={{ opacity: 0.5 }}>Memories never fade</span>
        </div>
      </aside>

      <style>{`@media (max-width: 768px) { .right-sidebar { display: none !important; } }`}</style>
    </div>
  )
}
