import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/')
    })
  }, [])

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleEmailAuth(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      if (!username.trim()) { setError('Username is required'); setLoading(false); return }
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: username.trim().toLowerCase().replace(/\s+/g, '_'),
          email: email,
          role: 'member'
        })
        setMessage('Check your email to confirm your account!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,63,63,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="56" height="56" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto 1rem', display: 'block' }}>
            <rect width="36" height="36" rx="8" fill="#0f0f1a"/>
            <path d="M18 4L22 10H28L23.5 14.5L25.5 21L18 17L10.5 21L12.5 14.5L8 10H14L18 4Z" fill="#ff3f3f"/>
            <path d="M11 24H25M14 28H22" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>
            VCAC<span style={{ color: 'var(--maple)' }}>.</span>
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 6 }}>
            {mode === 'signin' ? 'Welcome back, vibe coder' : 'Join Canada\'s vibe coding community'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--panel)', borderRadius: 8, padding: 4, marginBottom: '1.5rem' }}>
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setMessage(null) }} style={{
                flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, fontFamily: 'DM Sans',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--white)' : 'var(--text-dim)',
                transition: 'all 0.2s'
              }}>
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogleLogin} disabled={loading} style={{
            width: '100%', padding: '11px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontFamily: 'DM Sans', fontSize: '0.9rem',
            fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, marginBottom: '1.25rem', transition: 'all 0.2s'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <div>
                <label>Username</label>
                <input type="text" placeholder="vibemaster_99" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            )}
            <div>
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div style={{ background: 'rgba(255,63,63,0.1)', border: '1px solid rgba(255,63,63,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--maple-soft)' }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--green)' }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: 4 }}>
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1.5rem' }}>
          By joining you agree to the VCAC Code of Vibes 🍁
        </p>
      </div>
    </div>
  )
}
