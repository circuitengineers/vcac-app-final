import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { AvatarDisplay } from '../../lib/avatars'

const TIERS = [
  { min: 15000, title: 'Hall of Fame Creator', color: '#9b59ff' },
  { min: 5000,  title: 'Master Creator',        color: '#ff3f3f' },
  { min: 1500,  title: 'Distinguished Creator', color: '#ffd166' },
  { min: 500,   title: 'Recognized Creator',    color: '#00e5ff' },
  { min: 100,   title: 'Rising Creator',         color: '#06d6a0' },
]
function getTier(s) { return TIERS.find(t => s >= t.min) || null }

export default function UserProfile() {
  const router = useRouter()
  const { username } = router.query
  const [viewedProfile, setViewedProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [currentProfile, setCurrentProfile] = useState(null)
  const [totalVibe, setTotalVibe] = useState(0)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    if (!username) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setCurrentUser(session?.user ?? null)
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        setCurrentProfile(prof)
      }
    })
    fetchProfile()
  }, [username])

  async function fetchProfile() {
    const { data: prof } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (!prof) { setLoading(false); return }
    setViewedProfile(prof)
    setFollowerCount(prof.follower_count || 0)

    const { data: projs } = await supabase.from('projects').select('*').eq('user_id', prof.id).eq('status', 'approved').order('likes', { ascending: false })
    setProjects(projs || [])
    const total = (projs || []).reduce((sum, p) => sum + (p.runs || 0) + (p.likes || 0) * 10, 0)
    setTotalVibe(total)

    // Check if current user follows this profile
    const { data: { session } } = await supabase.auth.getSession()
    if (session && session.user.id !== prof.id) {
      const { data: followData } = await supabase.from('follows').select('id').eq('follower_id', session.user.id).eq('following_id', prof.id).single()
      setFollowing(!!followData)
    }
    setLoading(false)
  }

  async function handleFollow() {
    if (!currentUser) { router.push('/login'); return }
    setFollowLoading(true)
    if (following) {
      await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', viewedProfile.id)
      await supabase.from('profiles').update({ follower_count: Math.max((followerCount - 1), 0) }).eq('id', viewedProfile.id)
      await supabase.from('profiles').update({ following_count: Math.max((currentProfile?.following_count || 1) - 1, 0) }).eq('id', currentUser.id)
      setFollowing(false)
      setFollowerCount(c => Math.max(c - 1, 0))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: viewedProfile.id })
      await supabase.from('profiles').update({ follower_count: (followerCount + 1) }).eq('id', viewedProfile.id)
      await supabase.from('profiles').update({ following_count: (currentProfile?.following_count || 0) + 1 }).eq('id', currentUser.id)
      setFollowing(true)
      setFollowerCount(c => c + 1)
    }
    setFollowLoading(false)
  }

  async function sendReport(e) {
    e.preventDefault()
    if (!reportReason.trim()) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    await supabase.from('reports').insert({ reporter_id: session.user.id, reported_id: viewedProfile.id, reason: reportReason, details: reportDetails.trim() || null })
    setReportSent(true)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!messageText.trim()) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    await supabase.from('messages').insert({ sender_id: session.user.id, receiver_id: viewedProfile.id, content: messageText.trim() })
    setMessageSent(true)
    setMessageText('')
  }

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading profile...</div>
  if (!viewedProfile) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>User not found</div>

  const topTier = getTier(totalVibe)
  const isOwnProfile = currentUser && viewedProfile && currentUser.id === viewedProfile.id

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>

      {/* Report modal */}
      {showReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2rem' }}>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>Report submitted</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>The VCAC president will review this.</p>
                <button onClick={() => { setShowReport(false); setReportSent(false); setReportReason(''); setReportDetails('') }} className="btn btn-ghost" style={{ width: '100%' }}>Close</button>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>Report {viewedProfile.username}</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Sent directly to the VCAC president for review.</p>
                <form onSubmit={sendReport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Reason *</label>
                    <select value={reportReason} onChange={e => setReportReason(e.target.value)} required>
                      <option value="">Select a reason</option>
                      <option value="Spam">Spam</option>
                      <option value="Inappropriate content">Inappropriate content</option>
                      <option value="Fake project">Fake / stolen project</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label>Additional details (optional)</label>
                    <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} rows={3} placeholder="Tell us more..." style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-danger" style={{ flex: 1 }}>Submit report</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowReport(false)} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Message modal */}
      {showMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2rem' }}>
            {messageSent ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>Message sent!</h3>
                <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>They can reply from their messages.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setMessageSent(false); setMessageText('') }} className="btn btn-ghost" style={{ flex: 1 }}>Send another</button>
                  <button onClick={() => setShowMessage(false)} className="btn btn-ghost" style={{ flex: 1 }}>Close</button>
                </div>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1.5rem' }}>Message {viewedProfile.username}</h3>
                <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4} placeholder="Write your message..." style={{ resize: 'vertical' }} required autoFocus />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowMessage(false)} style={{ flex: 1 }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile header */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <AvatarDisplay avatarId={viewedProfile.avatar_id || 'bear'} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--white)' }}>{viewedProfile.username}</h1>
              {viewedProfile.role === 'president' && <span className="badge badge-gold">🍁 President</span>}
              {viewedProfile.role === 'pro' && <span className="badge badge-cyan">⚡ Pro</span>}
              {topTier && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: topTier.color, border: '1px solid ' + topTier.color + '44', padding: '2px 10px', borderRadius: 100 }}>VCAC {topTier.title}</span>}
            </div>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>{viewedProfile.bio || 'No bio yet.'}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Projects', val: projects.length },
                { label: 'Followers', val: followerCount },
                { label: 'Total likes', val: projects.reduce((s, p) => s + (p.likes || 0), 0) },
                { label: 'Vibe Score', val: totalVibe.toLocaleString(), color: topTier?.color || 'var(--gold)' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: s.color || 'var(--white)' }}>{s.val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {!isOwnProfile && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={handleFollow} disabled={followLoading} className={following ? 'btn btn-ghost' : 'btn btn-primary'} style={{ fontSize: '0.85rem', padding: '8px 20px', minWidth: 120 }}>
                  {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
                </button>
                {currentUser && (
                  <button onClick={() => setShowMessage(true)} className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
                    ✉️ Message
                  </button>
                )}
                {currentUser && (
                  <button onClick={() => setShowReport(true)} className="btn btn-danger" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
                    ⚑ Report
                  </button>
                )}
              </div>
            )}
            {isOwnProfile && (
              <Link href="/profile" className="btn btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 18px' }}>
                Edit my profile →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Projects */}
      <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.25rem', color: 'var(--white)', marginBottom: '1.25rem' }}>
        Projects by {viewedProfile.username}
      </h2>
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>No approved projects yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {projects.map(p => (
            <Link key={p.id} href={'/projects/' + p.id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--muted)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {p.thumbnail_url && (
                  <div style={{ height: 140, overflow: 'hidden' }}>
                    <img src={p.thumbnail_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>♥ {p.likes || 0} · 👁 {p.runs || 0}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
