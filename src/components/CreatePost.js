// src/components/CreatePost.js
import React, { useState, useRef } from 'react'
import { FiX, FiImage, FiVideo, FiLock, FiGlobe } from 'react-icons/fi'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'

const PROMPTS = [
  'Say your unsaid feelings for your crush... 🌸',
  'What is your favorite SHS memory? 🎓',
  'If you could relive one SHS moment, what would it be? 💭',
  'Drop your most iconic SHS story! 🔥',
  'Confess something you never told your batch! 👀',
  'What song best describes your SHS journey? 🎵',
  'Who deserves the Most Memorable Classmate award? 🏆',
  'Write a message to your future self... 💌',
  'What are you most proud of in SHS? 🎉',
  'Best memory with your barkada? 🥹',
]

export default function CreatePost({ onClose }) {
  const { currentUser, userProfile } = useAuth()
  const [caption, setCaption] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [postType, setPostType] = useState('post')
  const [memoryGroup, setMemoryGroup] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const fileRef = useRef()

  const addFiles = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected])
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))])
  }

  const removeFile = (i) => {
    setFiles(f => f.filter((_, j) => j !== i))
    setPreviews(p => p.filter((_, j) => j !== i))
  }

  const handleSubmit = async () => {
    if (!caption.trim() && files.length === 0) return
    setLoading(true)
    try {
      const mediaUrls = []
      const mediaTypes = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop()
        const path = currentUser.id + '/' + Date.now() + '_' + i + '.' + ext
        const { error: upErr } = await supabase.storage.from('media').upload(path, file, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
        mediaUrls.push(urlData.publicUrl)
        mediaTypes.push(file.type.startsWith('video') ? 'video' : 'image')
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }
      const isMemory = postType === 'memory'
      const { error: insertErr } = await supabase.from('posts').insert({
        uid: currentUser.id,
        display_name: userProfile.display_name,
        username: userProfile.username,
        photo_url: userProfile.photo_url || '',
        caption: caption.trim(),
        media_urls: mediaUrls,
        media_types: mediaTypes,
        is_memory: isMemory,
        is_private_memory: isMemory,
        memory_group: isMemory ? (memoryGroup.trim() || 'My Memories') : '',
        pinned: false,
        reactions: {},
        comment_count: 0,
      })
      if (insertErr) throw insertErr
      onClose()
    } catch (err) {
      alert('Failed: ' + err.message)
    }
    setLoading(false)
  }

  const isMemory = postType === 'memory'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', padding: 0, border: '1px solid var(--border2)' }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--card)', zIndex: 5,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
              {userProfile && userProfile.photo_url
                ? <img src={userProfile.photo_url} alt="" />
                : (userProfile ? userProfile.display_name : 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Clash Display' }}>{userProfile ? userProfile.display_name : ''}</div>
              <div style={{ fontSize: '0.7rem', color: isMemory ? 'var(--accent2)' : 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {isMemory
                  ? <><FiLock size={10} /> Only visible on your profile</>
                  : <><FiGlobe size={10} /> Visible to everyone</>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 6 }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ padding: '18px 20px' }}>
          {/* Toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: 'var(--bg3)', borderRadius: 14, padding: 5 }}>
            <button
              onClick={() => setPostType('post')}
              style={{
                flex: 1, border: 'none', borderRadius: 10, padding: '10px 0',
                background: postType === 'post' ? 'var(--grad)' : 'transparent',
                color: postType === 'post' ? 'white' : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'Clash Display', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              Post
              <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8, marginTop: 1 }}>Everyone sees this</div>
            </button>
            <button
              onClick={() => setPostType('memory')}
              style={{
                flex: 1, border: 'none', borderRadius: 10, padding: '10px 0',
                background: postType === 'memory' ? 'linear-gradient(135deg,#fc6c8f,#fcb86c)' : 'transparent',
                color: postType === 'memory' ? 'white' : 'var(--muted)',
                cursor: 'pointer', fontFamily: 'Clash Display', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              Memory
              <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8, marginTop: 1 }}>Only on your profile</div>
            </button>
          </div>

          {/* Prompt */}
          <div style={{
            background: 'rgba(124,108,252,0.08)', border: '1px dashed rgba(124,108,252,0.3)',
            borderRadius: 14, padding: '10px 14px', marginBottom: 16,
            fontSize: '0.84rem', color: 'var(--muted2)', fontStyle: 'italic', lineHeight: 1.5,
          }}>
            {prompt}
          </div>

          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder={isMemory ? 'Caption this memory...' : "What's on your mind?"}
            rows={4}
            style={{ resize: 'none', marginBottom: 14, borderRadius: 16 }}
          />

          {isMemory && (
            <input
              value={memoryGroup}
              onChange={e => setMemoryGroup(e.target.value)}
              placeholder='Album name e.g. JS Prom 2025'
              style={{ marginBottom: 14 }}
            />
          )}

          {previews.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: previews.length === 1 ? '1fr' : '1fr 1fr',
              gap: 8, marginBottom: 14,
            }}>
              {previews.map((url, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                  {files[i] && files[i].type.startsWith('video')
                    ? <video src={url} controls style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                    : <img src={url} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  }
                  <button
                    onClick={() => removeFile(i)}
                    style={{
                      position: 'absolute', top: 7, right: 7,
                      background: 'rgba(0,0,0,0.72)', border: 'none', borderRadius: '50%',
                      width: 26, height: 26, color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem',
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-ghost"
            onClick={() => fileRef.current.click()}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 14, borderRadius: 14 }}
          >
            <FiImage size={17} />
            <FiVideo size={17} />
            {previews.length > 0 ? previews.length + ' file(s) selected — add more' : 'Add Photo / Video'}
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={addFiles} />

          {loading && files.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>Uploading... {progress}%</div>
              <div style={{ background: 'var(--bg3)', borderRadius: 6, height: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progress + '%', background: 'var(--grad)', transition: 'width 0.3s', borderRadius: 6 }} />
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || (!caption.trim() && files.length === 0)}
            style={{ width: '100%', justifyContent: 'center', height: 46, borderRadius: 14 }}
          >
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Uploading...</span>
              : isMemory ? 'Save to My Memories' : 'Share Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
