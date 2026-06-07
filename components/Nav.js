import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Nav() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isAdmin = profile?.role === 'president'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '64px',
      background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)'
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="8" fill="#0f0f1a"/>
          <path d="M18 4L22 10H28L23.5 14.5L25.5 21L18 17L10.5 21L12.5 14.5L8 10H14L18 4Z" fill="#ff3f3f"/>
          <path d="M11 24H25M14 28H22" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, color: 'var(--white)', fontSize: '1rem' }}>
          VCAC<span style={{ color: 'var(--maple)' }}>.</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/projects" style={{ fontSize: '0.85rem', color: 'var(--text-mid)', textDecoration: 'none' }}>Projects</Link>
        <Link href="/leaderboard" style={{ fontSize: '0.85rem', color: 'var(--text-mid)', textDecoration: 'none' }}>Leaderboard</Link>
        <Link href="/search" style={{ fontSize: '0.85rem', color: 'var(--text-mid)', textDecoration: 'none' }}>Search</Link>
        <Link href="/pricing" style={{ fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none' }}>⚡ Pro</Link>
        {isAdmin && (
          <Link href="/admin" style={{ fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none' }}>⚡ Admin</Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/submit" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
              + Submit
            </Link>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--maple-glow)', border: '1px solid rgba(255,63,63,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--maple)'
                }}
              >
                {(profile?.username || user.email)?.[0]?.toUpperCase()}
              </div>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '44px', right: 0, width: 200,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--white)' }}>
                      {profile?.username || 'Vibe Coder'}
                    </div>
                    {profile?.role === 'president' && (
                      <span className="badge badge-gold" style={{ marginTop: 4 }}>🍁 President</span>
                    )}
                    {profile?.role === 'pro' && (
                      <span className="badge badge-cyan" style={{ marginTop: 4 }}>⚡ Pro</span>
                    )}
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-mid)', textDecoration: 'none' }}>
                    My Profile
                  </Link>
                  <Link href="/my-projects" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-mid)', textDecoration: 'none' }}>
                    My Projects
                  </Link>
                  <Link href="/my-certificates" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none' }}>
                    🏆 My Certificates
                  </Link>
                  <Link href="/messages" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--cyan)', textDecoration: 'none' }}>
                    ✉️ Messages
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none' }}>
                      ⚡ Admin Panel
                    </Link>
                  )}
                  <button onClick={signOut} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--maple)', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--border)' }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>Sign in</Link>
            <Link href="/login" className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>Join VCAC</Link>
          </>
        )}
      </div>
    </nav>
  )
}
