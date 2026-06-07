import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { AvatarDisplay } from '../lib/avatars'

export default function Search() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const [{ data: userResults }, { data: projectResults }] = await Promise.all([
      supabase.from('profiles').select('*').ilike('username', '%' + query.trim() + '%').limit(10),
      supabase.from('projects').select('*, profiles(username, avatar_id)').eq('status', 'approved').ilike('title', '%' + query.trim() + '%').limit(10)
    ])

    setUsers(userResults || [])
    setProjects(projectResults || [])
    setLoading(false)
  }

  const TIER_COLOR = { 'Hall of Fame': '#9b59ff', 'Master': '#ff3f3f', 'Distinguished': '#ffd166', 'Recognized': '#00e5ff', 'Rising': '#06d6a0' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>VCAC</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Search</h1>
        <p style={{ color: 'var(--text-mid)', marginTop: 8, fontSize: '0.9rem' }}>Find users and projects across VCAC.</p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: '2.5rem' }}>
        <input
          type="text"
          placeholder="Search users or projects..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, fontSize: '1rem', padding: '12px 16px' }}
          autoFocus
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
          Search
        </button>
      </form>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Searching...</div>
      )}

      {!loading && searched && (
        <>
          {/* Users */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: 'var(--white)', marginBottom: '1rem' }}>
              Users ({users.length})
            </h2>
            {users.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>No users found for "{query}"</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map(u => (
                  <Link key={u.id} href={'/user/' + u.username} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)' }}
                    >
                      <AvatarDisplay avatarId={u.avatar_id || 'bear'} size={44} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '0.95rem' }}>{u.username}</span>
                          {u.role === 'president' && <span className="badge badge-gold">🍁 President</span>}
                          {u.role === 'pro' && <span className="badge badge-cyan">⚡ Pro</span>}
                        </div>
                        {u.bio && <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 3 }}>{u.bio.slice(0, 80)}{u.bio.length > 80 ? '...' : ''}</div>}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{u.follower_count || 0} followers</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: 'var(--white)', marginBottom: '1rem' }}>
              Projects ({projects.length})
            </h2>
            {projects.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.88rem' }}>No projects found for "{query}"</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {projects.map(p => (
                  <Link key={p.id} href={'/projects/' + p.id} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)' }}
                    >
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.title} style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 52, height: 40, background: 'var(--panel)', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🚀</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '0.95rem', marginBottom: 3 }}>{p.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          by <Link href={'/user/' + p.profiles?.username} onClick={e => e.stopPropagation()} style={{ color: 'var(--text-mid)', textDecoration: 'none' }}>{p.profiles?.username}</Link>
                          {' · '}{p.category}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                        <span>♥ {p.likes || 0}</span>
                        <span>👁 {p.runs || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <div style={{ fontSize: '0.9rem' }}>Search for a username or project name</div>
        </div>
      )}
    </div>
  )
}
