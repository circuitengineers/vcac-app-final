import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { AvatarDisplay } from '../lib/avatars'

export default function Messages() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      fetchConversations(session.user.id)
    })
  }, [])

  useEffect(() => {
    if (selected) fetchMessages(selected)
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchConversations(userId) {
    const { data } = await supabase.from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, avatar_id), receiver:profiles!messages_receiver_id_fkey(id, username, avatar_id)')
      .or('sender_id.eq.' + userId + ',receiver_id.eq.' + userId)
      .order('created_at', { ascending: false })

    const convMap = {}
    ;(data || []).forEach(m => {
      const partner = m.sender_id === userId ? m.receiver : m.sender
      if (!partner) return
      if (!convMap[partner.id]) convMap[partner.id] = { partner, lastMessage: m, unread: 0 }
      if (!m.read && m.receiver_id === userId) convMap[partner.id].unread++
    })
    setConversations(Object.values(convMap))
    setLoading(false)
  }

  async function fetchMessages(partnerId) {
    const { data: { session } } = await supabase.auth.getSession()
    const uid = session.user.id
    const { data } = await supabase.from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, username, avatar_id)')
      .or('and(sender_id.eq.' + uid + ',receiver_id.eq.' + partnerId + '),and(sender_id.eq.' + partnerId + ',receiver_id.eq.' + uid + ')')
      .order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ read: true }).eq('receiver_id', uid).eq('sender_id', partnerId)
    fetchConversations(uid)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMsg.trim() || !selected) return
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('messages').insert({ sender_id: session.user.id, receiver_id: selected, content: newMsg.trim() })
    setNewMsg('')
    fetchMessages(selected)
  }

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading messages...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Inbox</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Messages</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', minHeight: 520 }}>
        {/* Sidebar */}
        <div className="card" style={{ overflow: 'hidden', alignSelf: 'start' }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              No messages yet.<br />
              <Link href="/search" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Find users →</Link>
            </div>
          ) : conversations.map(c => (
            <div key={c.partner.id} onClick={() => { setSelected(c.partner.id); setSelectedPartner(c.partner) }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '1rem',
              cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: selected === c.partner.id ? 'var(--panel)' : 'transparent',
              transition: 'background 0.2s'
            }}>
              <AvatarDisplay avatarId={c.partner.avatar_id} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.88rem', marginBottom: 2 }}>{c.partner.username}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage.content}</div>
              </div>
              {c.unread > 0 && (
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--maple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{c.unread}</div>
              )}
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.88rem', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '2rem' }}>✉️</div>
              Select a conversation or <Link href="/search" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>find someone to message</Link>
            </div>
          ) : (
            <>
              {/* Chat header with clickable username */}
              {selectedPartner && (
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AvatarDisplay avatarId={selectedPartner.avatar_id} size={36} />
                  <Link href={'/user/' + selectedPartner.username} style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', textDecoration: 'none', fontSize: '0.95rem' }}>
                    {selectedPartner.username}
                  </Link>
                  <Link href={'/user/' + selectedPartner.username} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textDecoration: 'none', marginLeft: 'auto' }}>
                    View profile →
                  </Link>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 380 }}>
                {messages.map(m => {
                  const isMe = m.sender_id === user?.id
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                      {!isMe && (
                        <Link href={'/user/' + m.sender?.username} title={'View ' + m.sender?.username + "'s profile"}>
                          <AvatarDisplay avatarId={m.sender?.avatar_id} size={28} style={{ cursor: 'pointer' }} />
                        </Link>
                      )}
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px',
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: isMe ? 'var(--maple)' : 'var(--panel)',
                        color: isMe ? 'white' : 'var(--text)',
                        fontSize: '0.88rem', lineHeight: 1.5
                      }}>
                        {m.content}
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <input type="text" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" disabled={!newMsg.trim()} style={{ flexShrink: 0, padding: '10px 20px' }}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
