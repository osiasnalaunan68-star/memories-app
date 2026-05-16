// src/components/PostCard.js
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMessageCircle, FiMoreHorizontal, FiTrash2, FiBookmark, FiShare2 } from 'react-icons/fi'
import { BsFillPinFill } from 'react-icons/bs'
import { supabase } from '../supabase/client'
import { useAuth } from '../context/AuthContext'
import { format } from 'timeago.js'

const REACTIONS = [
  { key: 'heart', emoji: '🤍', label: 'Love' },
  { key: 'haha', emoji: '😂', label: 'Haha' },
  { key: 'wow', emoji: '😮', label: 'Wow' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'hundred', emoji: '💯', label: '100' },
]

function SkeletonLoader() {
  return (
    <div className="card" style={{ marginBottom: 16, padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 13, width: '40%', marginBottom: 7 }} />
          <div className="skeleton" style={{ height: 11, width: '25%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 220, borderRadius: 14 }} />
    </div>
  )
}

export default function PostCard({ post, onDelete }) {
  const { currentUser, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [showReactions, setShowReactions] = useState(false)
  const [reactions, setReactions] = useState(post.reactions || {})
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [pinned, setPinned] = useState(post.pinned || false)
  const [mediaIndex, setMediaIndex] = useState(0)

  useEffect(() => {
    if (!showComments) return
    const load = async () => {
      const { data } = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
      if (data) setComments(data)
    }
    load()
    const ch = supabase.channel('c-' + post.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: 'post_id=eq.' + post.id }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [showComments, post.id])

  const handleReact = async (key) => {
    const uid = currentUser.id
    const cur = reactions[key] || []
    const updated = cur.includes(uid)
      ? { ...reactions, [key]: cur.filter(x => x !== uid) }
      : { ...reactions, [key]: [...cur, uid] }
    setReactions(updated)
    await supabase.from('posts').update({ reactions: updated }).eq('id', post.id)
    setShowReactions(false)
  }

  const total = Object.values(reactions).reduce((a, b) => a + b.length, 0)
  const myReaction = REACTIONS.find(r => (reactions[r.key] || []).includes(currentUser?.id))

  const addComment = async () => {
    if (!commentText.trim()) return
    await supabase.from('comments').insert({
      post_id: post.id,
      uid: currentUser.id,
      username: currentUser.user_metadata?.display_name || 'User',
      text: commentText,
    })
    await supabase.from('posts').update({ comment_count: (post.comment_count || 0) + 1 }).eq('id', post.id)
    setCommentText('')
  }

  const addReply = async (comment) => {
    if (!replyText.trim()) return
    const reply = { uid: currentUser.id, username: currentUser.user_metadata?.display_name || 'User', text: replyText, at: new Date().toISOString() }
    const replies = [...(comment.replies || []), reply]
    await supabase.from('comments').update({ replies }).eq('id', comment.id)
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, replies } : c))
    setReplyTo(null)
    setReplyText('')
  }

  const likeComment = async (comment) => {
    const uid = currentUser.id
    const likes = comment.likes || []
    const updated = likes.includes(uid) ? likes.filter(x => x !== uid) : [...likes, uid]
    await supabase.from('comments').update({ likes: updated }).eq('id', comment.id)
    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes: updated } : c))
  }

  const handlePin = async () => {
    await supabase.from('posts').update({ pinned: !pinned }).eq('id', post.id)
    setPinned(v => !v)
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    onDelete && onDelete(post.id)
  }

  const initials = (post.display_name || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="card fade-up" style={{ marginBottom: 16 }}>
      {pinned && (
        <div style={{ padding: '7px 18px', background: 'rgba(124,108,252,0.1)', borderBottom: '1px solid var(--border)', fontSize: '0.76rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <BsFillPinFill size={11} /> Pinned Post
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile/' + post.uid)}>
          {post.photo_url ? <img src={post.photo_url} alt="" /> : initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => navigate('/profile/' + post.uid)}>
            {post.display_name}
            {post.uid === currentUser?.id && <span style={{ fontSize: '0.65rem', background: 'rgba(124,108,252,0.2)', color: 'var(--accent)', borderRadius: 6, padding: '2px 7px', fontFamily: 'Clash Display' }}>You</span>}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
            @{post.username} · {post.created_at ? format(post.created_at) : 'just now'}
          </div>
        </div>
        {(isAdmin || post.uid === currentUser?.id) && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(v => !v)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 6, borderRadius: 8 }}>
              <FiMoreHorizontal size={19} />
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 14, padding: 6, zIndex: 30, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                {isAdmin && (
                  <button onClick={handlePin} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderRadius: 10, background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', width: '100%', fontSize: '0.87rem' }}>
                    <BsFillPinFill size={14} /> {pinned ? 'Unpin' : 'Pin Post'}
                  </button>
                )}
                <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderRadius: 10, background: 'none', border: 'none', color: '#ff6b8a', cursor: 'pointer', width: '100%', fontSize: '0.87rem' }}>
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div style={{ padding: '0 18px 14px', fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text)' }}>
          {post.caption}
        </div>
      )}

      {/* Media */}
      {post.media_urls?.length > 0 && (
        <div style={{ position: 'relative', background: 'var(--bg3)' }}>
          {post.media_types?.[mediaIndex] === 'video'
            ? <video src={post.media_urls[mediaIndex]} controls style={{ width: '100%', maxHeight: 440, objectFit: 'contain', display: 'block' }} />
            : <img src={post.media_urls[mediaIndex]} alt="" style={{ width: '100%', maxHeight: 440, objectFit: 'cover', display: 'block' }} />
          }
          {post.media_urls.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
              {post.media_urls.map((_, i) => (
                <button key={i} onClick={() => setMediaIndex(i)} style={{
                  width: i === mediaIndex ? 18 : 6, height: 6, borderRadius: 3,
                  background: i === mediaIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0,
                }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reaction count */}
      {total > 0 && (
        <div style={{ padding: '10px 18px 0', display: 'flex', gap: 3, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {REACTIONS.filter(r => (reactions[r.key] || []).length > 0).map(r => (
              <span key={r.key} style={{ fontSize: '0.95rem' }}>{r.emoji}</span>
            ))}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 5 }}>{total}</span>
        </div>
      )}

      {/* Action bar */}
      <div style={{ padding: '10px 18px 14px', display: 'flex', gap: 6, borderTop: '1px solid var(--border)', marginTop: 10, position: 'relative' }}>

        {/* React */}
        <div style={{ position: 'relative', flex: 1 }}>
          <button onClick={() => setShowReactions(v => !v)} style={{
            width: '100%', padding: '8px 6px', border: '1px solid var(--border2)', borderRadius: 12,
            background: myReaction ? 'rgba(124,108,252,0.1)' : 'transparent',
            color: myReaction ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer',
            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: '1rem' }}>{myReaction ? myReaction.emoji : '🤍'}</span>
            <span style={{ fontSize: '0.8rem' }}>React</span>
          </button>
          {showReactions && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 4, background: 'var(--bg3)', border: '1px solid var(--border2)',
              borderRadius: 20, padding: '8px 12px', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
            }}>
              {REACTIONS.map(r => (
                <button key={r.key} onClick={() => handleReact(r.key)} title={r.label} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem',
                  transform: (reactions[r.key] || []).includes(currentUser?.id) ? 'scale(1.25)' : 'scale(1)',
                  transition: 'transform 0.15s', padding: '2px 4px',
                }}>
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <button onClick={() => setShowComments(v => !v)} style={{
          flex: 1, padding: '8px 6px', border: '1px solid var(--border2)', borderRadius: 12,
          background: showComments ? 'rgba(124,108,252,0.1)' : 'transparent',
          color: showComments ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          <FiMessageCircle size={16} />
          <span>{post.comment_count || 0}</span>
        </button>

        {/* Save */}
        <button style={{
          flex: 1, padding: '8px 6px', border: '1px solid var(--border2)', borderRadius: 12,
          background: 'transparent', color: 'var(--muted2)', cursor: 'pointer',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          <FiBookmark size={16} />
          <span>Save</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              onKeyDown={e => e.key === 'Enter' && addComment()}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 50, fontSize: '0.88rem' }}
            />
            <button className="btn-primary" onClick={addComment} style={{ padding: '10px 18px', borderRadius: 50, fontSize: '0.84rem' }}>Send</button>
          </div>

          {comments.map(c => (
            <div key={c.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 9 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.72rem', flexShrink: 0 }}>
                  {(c.username || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: 'var(--bg3)', borderRadius: '4px 16px 16px 16px', padding: '9px 14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 3, color: 'var(--accent)' }}>{c.username}</div>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{c.text}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 5, paddingLeft: 4 }}>
                    <button onClick={() => likeComment(c)} style={{ background: 'none', border: 'none', color: (c.likes || []).includes(currentUser?.id) ? 'var(--accent2)' : 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                      🤍 {(c.likes || []).length || ''}
                    </button>
                    <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                      Reply
                    </button>
                  </div>

                  {(c.replies || []).map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 7, marginTop: 9, marginLeft: 14 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: '0.62rem', flexShrink: 0 }}>
                        {(r.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ background: 'var(--bg3)', borderRadius: '4px 14px 14px 14px', padding: '7px 12px', flex: 1, border: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.76rem', color: 'var(--accent)', marginBottom: 2 }}>{r.username}</div>
                        <div style={{ fontSize: '0.86rem' }}>{r.text}</div>
                      </div>
                    </div>
                  ))}

                  {replyTo === c.id && (
                    <div style={{ display: 'flex', gap: 7, marginTop: 9, marginLeft: 14 }}>
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={'Reply to ' + c.username + '...'}
                        onKeyDown={e => e.key === 'Enter' && addReply(c)}
                        style={{ flex: 1, padding: '8px 14px', borderRadius: 50, fontSize: '0.84rem' }}
                      />
                      <button className="btn-primary" onClick={() => addReply(c)} style={{ padding: '8px 14px', borderRadius: 50, fontSize: '0.8rem' }}>↩</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { SkeletonLoader }
