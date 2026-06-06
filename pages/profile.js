import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { AVATARS, getAvatar, AvatarDisplay } from '../lib/avatars'

const TIERS = [
  { min: 15000, title: 'Hall of Fame Creator', color: '#9b59ff' },
  { min: 5000,  title: 'Master Creator',        color: '#ff3f3f' },
  { min: 1500,  title: 'Distinguished Creator', color: '#ffd166' },
  { min: 500,   title: 'Recognized Creator',    color: '#00e5ff' },
  { min: 100,   title: 'Rising Creator',         color: '#06d6a0' },
]
function getTier(score) { return TIERS.find(t => score >= t.min) || null }

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('bear')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [totalVibe, setTotalVibe] = useState(0)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      setUsername(prof?.username || '')
      setBio(prof?.bio || '')
      setFullName(prof?.full_name || '')
      setSelectedAvatar(prof?.avatar_id || 'bear')
      const { data: projs } = await supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      setProjects(projs || [])
      const approved = (projs || []).filter(p => p.status === 'approved')
      const total = approved.reduce((sum, p) => sum + (p.runs || 0) + (p.likes || 0) * 10, 0)
      setTotalVibe(total)
    })
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      username: username.trim(),
      bio: bio.trim(),
      full_name: fullName.trim(),
      avatar_id: selectedAvatar
    }).eq('id', user.id)
    if (error) setMsg({ type: 'error', text: error.message })
    else {
      setMsg({ type: 'success', text: 'Profile updated!' })
      setEditing(false)
      setShowAvatarPicker(false)
      setProfile(p => ({ ...p, username, bio, full_name: fullName, avatar_id: selectedAvatar }))
    }
    setSaving(false)
  }

  if (!profile) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading...</div>

  const statusColor = { approved: 'var(--green)', pending: 'var(--gold)', rejected: 'var(--maple)' }
  const topTier = getTier(totalVibe)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Profile card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {editing ? (
          <form onSubmit={saveProfile}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {/* Avatar picker */}
              <div style={{ textAlign: 'center' }}>
                <AvatarDisplay avatarId={selectedAvatar} size={72} />
                <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="btn btn-ghost" style={{ fontSize: '0.72rem', padding: '5px 10px', marginTop: 8 }}>
                  Change
                </button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label>Full name (for certificates)</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your real name" />
                </div>
                <div>
                  <label>Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} maxLength={30} />
                </div>
                <div>
                  <label>Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell the community about yourself..." style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Avatar grid */}
            {showAvatarPicker && (
              <div style={{ background: 'var(--panel)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Choose your avatar</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '0.5rem' }}>
                  {AVATARS.map(av => (
                    <button key={av.id} type="button" onClick={() => setSelectedAvatar(av.id)} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '8px', borderRadius: 8, border: selectedAvatar === av.id ? '2px solid var(--maple)' : '2px solid transparent',
                      background: selectedAvatar === av.id ? 'var(--maple-glow)' : 'transparent', cursor: 'pointer'
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: av.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{av.emoji}</div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msg && <div style={{ fontSize: '0.82rem', color: msg.type === 'error' ? 'var(--maple)' : 'var(--green)', marginBottom: '1rem' }}>{msg.text}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '8px 20px' }}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setShowAvatarPicker(false) }} style={{ padding: '8px 20px' }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <AvatarDisplay avatarId={profile.avatar_id || 'bear'} size={80} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--white)' }}>{profile.username}</h1>
                {profile.role === 'president' && <span className="badge badge-gold">🍁 President</span>}
                {profile.role === 'pro' && <span className="badge badge-cyan">⚡ Pro</span>}
                {profile.role === 'member' && <span className="badge badge-violet">Member</span>}
                {topTier && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: topTier.color, border: '1px solid ' + topTier.color + '44', padding: '2px 10px', borderRadius: 100 }}>VCAC {topTier.title}</span>}
              </div>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>{profile.bio || 'No bio yet.'}</p>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Projects', val: projects.filter(p => p.status === 'approved').length },
                  { label: 'Total likes', val: projects.reduce((s, p) => s + (p.likes || 0), 0) },
                  { label: 'Total views', val: projects.reduce((s, p) => s + (p.runs || 0), 0) },
                  { label: 'Vibe Score', val: totalVibe.toLocaleString(), color: topTier?.color || 'var(--gold)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', color: s.color || 'var(--white)' }}>{s.val}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>Edit profile</button>
                <Link href="/my-certificates" className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '7px 16px', color: 'var(--gold)', borderColor: 'rgba(255,209,102,0.3)' }}>🏆 My Certificates</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.25rem', color: 'var(--white)' }}>My projects</h2>
          <Link href="/submit" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>+ Submit new</Link>
        </div>
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🚀</div>
            <p style={{ color: 'var(--text-mid)', marginBottom: '1.25rem' }}>No projects yet.</p>
            <Link href="/submit" className="btn btn-primary">Submit your first build</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)' }}>{p.title}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: statusColor[p.status], textTransform: 'uppercase', letterSpacing: '0.06em' }}>● {p.status}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>♥ {p.likes || 0} · 👁 {p.runs || 0} · Vibe Score: {((p.runs||0)+(p.likes||0)*10).toLocaleString()}</div>
                </div>
                {p.status === 'approved' && (
                  <Link href={'/projects/' + p.id} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', flexShrink: 0 }}>View →</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
