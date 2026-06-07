import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [needsUsername, setNeedsUsername] = useState(false)
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { router.push('/login'); return }

      const user = session.user
      setUserId(user.id)
      setUserEmail(user.email)

      // Check if profile already exists
      const { data: existing } = await supabase.from('profiles').select('id, username').eq('id', user.id).single()

      if (existing?.username) {
        // Already has profile, go home
        router.push('/')
      } else {
        // Google user — needs to pick a username
        // Pre-fill from Google name if available
        const googleName = user.user_metadata?.name || user.user_metadata?.full_name || ''
        const suggested = googleName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20)
        setUsername(suggested)
        setNeedsUsername(true)
      }
    })
  }, [])

  async function handleUsernameSubmit(e) {
    e.preventDefault()
    if (!username.trim() || username.trim().length < 3) { setError('Username must be at least 3 characters'); return }

    setSaving(true)
    setError(null)

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')

    // Check availability
    const { data: taken } = await supabase.from('profiles').select('id').eq('username', clean).single()
    if (taken) { setError('Username already taken — try another'); setSaving(false); return }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      username: clean,
      email: userEmail,
      role: 'member',
      avatar_id: 'bear'
    })

    if (error) { setError(error.message); setSaving(false); return }
    router.push('/')
  }

  if (needsUsername) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍁</div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--white)', marginBottom: '0.5rem' }}>One last thing!</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>Pick a username for your VCAC profile.</p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleUsernameSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label>Choose your username *</label>
                <input
                  type="text"
                  placeholder="vibemaster_99"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  minLength={3}
                  maxLength={30}
                  autoFocus
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                  3–30 characters. Letters, numbers, underscores only.
                </div>
              </div>

              {username && (
                <div style={{ padding: '10px 14px', background: 'var(--panel)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-mid)' }}>
                  Your profile will be at: <span style={{ color: 'var(--cyan)' }}>vcac-app.vercel.app/user/{username}</span>
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(255,63,63,0.1)', border: '1px solid rgba(255,63,63,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--maple-soft)' }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={saving || username.length < 3} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
                {saving ? 'Setting up your profile...' : 'Join VCAC 🍁'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: 'DM Mono', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍁</div>
        Signing you in...
      </div>
    </div>
  )
}
