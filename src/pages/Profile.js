// src/pages/Profile.js
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import PostCard, { SkeletonLoader } from '../components/PostCard'
import { FiEdit2, FiCamera, FiArrowLeft, FiLock } from 'react-icons/fi'

export default function Profile() {
  const { uid } = useParams()
  const { currentUser, userProfile, fetchProfile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [tab, setTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [displayName, setDisplayName] = useState('')
  const isOwn = currentUser?.id === uid
  const isFollowing = userProfile?.following?.includes(uid)

  useEffect(() => {
    setLoading(true)
    setPostsLoading(true)
    loadProfile()
    loadPosts()
  }, [uid])

  const loadProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    if (data) { setProfile(data); setBio(data.bio || ''); setDisplayName(data.display_name || '') }
    setLoading(false)
  }

  const loadPosts = async () => {
    let q = supabase.from('posts').select('*').eq('uid', uid).order('created_at', { ascending: false })
    if (currentUser?.id !== uid) q = q.eq('is_private_memory', false)
    const { data } = await q
    if (data) setPosts(data)
    setPostsLoading(false)
  }

  const handleFollow = async () => {
    const myF = userProfile?.following || []
    const theirF = profile?.followers || []
    const newMy = isFollowing ? myF.filter(x => x !== uid) : [...myF, uid]
    const newTheir = isFollowing ? theirF.filter(x => x !== currentUser.id) : [...theirF, currentUser.id]
    await supabase.from('profiles').update({ following: newMy }).eq('id', currentUser.id)
    await supabase.from('profiles').update({ followers: newTheir }).eq('id', uid)
    await fetchProfile(currentUser.id)
    setProfile(p => ({ ...p, followers: newTheir }))
  }

  const handleSave = async () => {
    await supabase.from('profiles').update({ bio, display_name: displayName }).eq('id', currentUser.id)
    await fetchProfile(currentUser.id)
    setProfile(p => ({ ...p, bio, display_name: displayName }))
    setEditMode(false)
  }

  const uploadPhoto = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = currentUser.id + '/' + type + '_' + Date.now() + '.' + ext
    await supabase.storage.from('media').upload(path, file, { upsert: true })
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    const field = type === 'avatar' ? 'photo_url' : 'cover_url'
    await supabase.from('profiles').update({ [field]: urlData.publicUrl }).eq('id', currentUser.id)
    await fetchProfile(currentUser.id)
    setProfile(p => ({ ...p, [field]: urlData.publicUrl }))
  }

  const regularPosts = posts.filter(p => !p.is_private_memory)
  const memoryPosts = isOwn ? posts.filter(p => p.is_private_memory) : []
  const photoPosts = regularPosts.filter(p => p.media_urls && p.media_urls.length > 0)

  const tabs = [
    { key: 'posts', label: 'Posts', count: regularPosts.length },
    { key: 'photos', label: 'Photos', count: photoPosts.length },
    ...(isOwn ? [{ key: 'memories', label: 'My Memories', count: memoryPosts.length }] : []),
  ]

  const shown = tab === 'posts' ? regularPosts : tab === 'photos' ? photoPosts : memoryPosts

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 20, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 14, padding: '0 20px' }}>
          <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%' }} />
          <div style={{ flex: 1, paddingTop: 14 }}>
            <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 13, width: '25%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>Profile not found.</div>

  const initials = (profile.display_name || 'U').slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 60 }}>

      {/* Cover */}
      <div style={{
        position: 'relative', height: 220,
        background: profile.cover_url ? 'url(' + profile.cover_url + ') center/cover no-repeat' : 'linear-gradient(135deg, #7c6cfc, #fc6c8f, #fcb86c)',
      }}>
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: 14, left: 14, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%',
          width: 38, height: 38, color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiArrowLeft size={18} />
        </button>
        {isOwn && (
          <label style={{
            position: 'absolute', bottom: 12, right: 14, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 12px',
            cursor: 'pointer', fontSize: '0.78rem', color: 'white',
            display: 'flex', gap: 5, alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <FiCamera size={13} /> Change Cover
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadPhoto(e, 'cover')} />
          </label>
        )}
      </div>

      <div style={{ padding: '0 22px' }}>
        {/* Avatar row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -48, marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              border: '4px solid var(--bg)', overflow: 'hidden',
              background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Clash Display', fontWeight: 800, fontSize: '1.8rem', color: 'white',
            }}>
              {profile.photo_url ? <img src={profile.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
            </div>
            {isOwn && (
              <label style={{
                position: 'absolute', bottom: 4, right: 0,
                background: 'var(--accent)', borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white', border: '2px solid var(--bg)',
              }}>
                <FiCamera size={13} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadPhoto(e, 'avatar')} />
              </label>
            )}
          </div>

          <div style={{ paddingBottom: 4 }}>
            {isOwn
              ? editMode
                ? <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-primary" onClick={handleSave} style={{ padding: '8px 18px', fontSize: '0.85rem', borderRadius: 12 }}>Save</button>
                    <button className="btn-ghost" onClick={() => setEditMode(false)} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>Cancel</button>
                  </div>
                : <button className="btn-ghost" onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiEdit2 size={14} /> Edit Profile
                  </button>
              : <button
                  onClick={handleFollow}
                  className={isFollowing ? 'btn-ghost' : 'btn-primary'}
                  style={{ borderRadius: 12 }}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
            }
          </div>
        </div>

        {/* Name & info */}
        {editMode
          ? <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ fontSize: '1.25rem', fontFamily: 'Clash Display', fontWeight: 700, marginBottom: 8 }} />
          : <div style={{ fontFamily: 'Clash Display', fontSize: '1.25rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              {profile.display_name}
              {profile.is_admin && <span style={{ fontSize: '0.65rem', background: 'var(--grad)', borderRadius: 6, padding: '3px 8px', color: 'white', fontFamily: 'Clash Display' }}>ADMIN</span>}
            </div>
        }
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 12 }}>@{profile.username}</div>

        {editMode
          ? <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write your bio... 📝" rows={3} style={{ resize: 'none', marginBottom: 14 }} />
          : profile.bio
            ? <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text)', marginBottom: 16 }}>{profile.bio}</p>
            : <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16, fontStyle: 'italic' }}>No bio yet... 🌸</p>
        }

        {/* Stats */}
        <div style={{ display: 'flex', gap: 28, paddingBottom: 18, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          {[
            { label: 'Posts', val: regularPosts.length },
            { label: 'Followers', val: (profile.followers || []).length },
            { label: 'Following', val: (profile.following || []).length },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Clash Display', fontWeight: 800, fontSize: '1.25rem' }}>{s.val}</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.76rem', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.key ? 'var(--text)' : 'var(--muted)',
              padding: '13px 0', cursor: 'pointer',
              fontFamily: 'Clash Display', fontWeight: tab === t.key ? 700 : 400,
              fontSize: '0.88rem', transition: 'all 0.2s',
            }}>
              {t.label}
              <span style={{ fontSize: '0.72rem', opacity: 0.6, marginLeft: 5 }}>({t.count})</span>
            </button>
          ))}
        </div>

        {tab === 'memories' && isOwn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--muted)', fontSize: '0.8rem', background: 'rgba(252,184,108,0.08)', border: '1px solid rgba(252,184,108,0.15)', borderRadius: 12, padding: '9px 14px' }}>
            <FiLock size={13} /> These memories are private — only you can see them
          </div>
        )}

        {postsLoading
          ? <><SkeletonLoader /><SkeletonLoader /></>
          : shown.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 60 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📭</div>
                <div>No {tab} yet</div>
              </div>
            : shown.map(p => <PostCard key={p.id} post={p} onDelete={loadPosts} />)
        }
      </div>
    </div>
  )
}
