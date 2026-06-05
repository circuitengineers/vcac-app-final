import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      setUsername(prof?.username || '')
      setBio(prof?.bio || '')
      const { data: projs } = await supabase.from('projects').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      setProjects(projs || [])
    })
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ username: username.trim(), bio: bio.trim() }).eq('id', user.id)
    if (error) setMsg({ type: 'error', text: error.message })
    else { setMsg({ type: 'success', text: 'Profile updated!' }); setEditing(false); setProfile(p => ({ ...p, username, bio })) }
    setSaving(false)
  }

  if (!profile) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading...</div>

  const statusColor = { approved: 'var(--green)', pending: 'var(--gold)', rejected: 'var(--maple)' }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Profile card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--maple-glow)', border: '2px solid rgba(255,63,63,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'var(--maple)', flexShrink: 0 }}>
          {(profile.username || '?')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          {editing ? (
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} maxLength={30} />
              </div>
              <div>
                <label>Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell the community about yourself..." style={{ resize: 'vertical' }} />
              </div>
              {msg && <div style={{ fontSize: '0.82rem', color: msg.type === 'error' ? 'var(--maple)' : 'var(--green)' }}>{msg.text}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '8px 20px' }}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} style={{ padding: '8px 20px' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--white)' }}>{profile.username}</h1>
                {profile.role === 'president' && <span className="badge badge-gold">🍁 President</span>}
                {profile.role === 'pro' && <span className="badge badge-cyan">⚡ Pro</span>}
                {profile.role === 'member' && <span className="badge badge-violet">Member</span>}
              </div>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.6 }}>{profile.bio || 'No bio yet — click edit to add one!'}</p>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', color: 'var(--white)' }}>{projects.filter(p => p.status === 'approved').length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projects</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', color: 'var(--white)' }}>{projects.reduce((s, p) => s + (p.likes || 0), 0)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total likes</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.3rem', color: 'var(--white)' }}>{projects.reduce((s, p) => s + (p.runs || 0), 0)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total runs</div>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '7px 16px' }}>Edit profile</button>
            </>
          )}
        </div>
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
            <p style={{ color: 'var(--text-mid)', marginBottom: '1.25rem' }}>You haven't submitted any projects yet.</p>
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
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>♥ {p.likes || 0} likes · ▸ {p.runs || 0} runs · {new Date(p.created_at).toLocaleDateString()}</div>
                </div>
                {p.status === 'approved' && (
                  <Link href={`/projects/${p.id}`} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', flexShrink: 0 }}>View →</Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
