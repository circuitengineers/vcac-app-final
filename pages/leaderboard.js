import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Leaderboard() {
  const [projects, setProjects] = useState([])
  const [builders, setBuilders] = useState([])
  const [tab, setTab] = useState('projects')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: projs } = await supabase.from('projects').select('*, profiles(username, role)').eq('status', 'approved').order('likes', { ascending: false }).limit(20)
    setProjects(projs || [])

    // aggregate by user
    const userMap = {}
    ;(projs || []).forEach(p => {
      const u = p.profiles?.username || 'anon'
      if (!userMap[u]) userMap[u] = { username: u, role: p.profiles?.role, likes: 0, runs: 0, projects: 0 }
      userMap[u].likes += p.likes || 0
      userMap[u].runs += p.runs || 0
      userMap[u].projects += 1
    })
    const sorted = Object.values(userMap).sort((a, b) => b.likes - a.likes)
    setBuilders(sorted)
    setLoading(false)
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Hall of fame</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Leaderboard</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem' }}>The most loved projects and builders in the VCAC community.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: '2rem' }}>
        <button onClick={() => setTab('projects')} className={`btn ${tab === 'projects' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 20px' }}>🚀 Top Projects</button>
        <button onClick={() => setTab('builders')} className={`btn ${tab === 'builders' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 20px' }}>👑 Top Builders</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading leaderboard...</div>
      ) : tab === 'projects' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {projects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)' }}
              >
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: i < 3 ? '1.5rem' : '1rem', minWidth: 40, textAlign: 'center', color: i < 3 ? undefined : 'var(--text-dim)' }}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1rem', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>by {p.profiles?.username} · {p.category}</div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--maple)', fontSize: '1.1rem' }}>{p.likes || 0}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Likes</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--cyan)', fontSize: '1.1rem' }}>{p.runs || 0}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Runs</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>No projects yet — be the first!</div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {builders.map((b, i) => (
            <div key={b.username} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: i < 3 ? '1.5rem' : '1rem', minWidth: 40, textAlign: 'center', color: i < 3 ? undefined : 'var(--text-dim)' }}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--maple-glow)', border: '1px solid rgba(255,63,63,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--maple)', flexShrink: 0 }}>
                {b.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)' }}>{b.username}</span>
                  {b.role === 'president' && <span className="badge badge-gold">🍁 President</span>}
                  {b.role === 'pro' && <span className="badge badge-cyan">⚡ Pro</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.projects} project{b.projects !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--maple)', fontSize: '1.1rem' }}>{b.likes}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Likes</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--cyan)', fontSize: '1.1rem' }}>{b.runs}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Runs</div>
                </div>
              </div>
            </div>
          ))}
          {builders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>No builders yet — be the first to submit!</div>
          )}
        </div>
      )}
    </div>
  )
}
