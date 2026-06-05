import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['All', 'Game', 'Art', 'Tool', 'AI', 'Simulation', 'Music', 'Other']
const SORTS = [{ value: 'newest', label: 'Newest' }, { value: 'popular', label: 'Most liked' }, { value: 'runs', label: 'Most run' }]
const TAG_COLORS = { Game: 'tag-green', Art: 'tag-gold', Tool: 'tag-maple', AI: 'tag-cyan', Simulation: 'tag-violet', Music: 'tag-violet', Other: 'tag-cyan' }

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProjects() }, [category, sort])

  async function fetchProjects() {
    setLoading(true)
    let query = supabase.from('projects').select('*, profiles(username, avatar_url)').eq('status', 'approved')
    if (category !== 'All') query = query.eq('category', category)
    if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'popular') query = query.order('likes', { ascending: false })
    else if (sort === 'runs') query = query.order('runs', { ascending: false })
    const { data } = await query.limit(24)
    setProjects(data || [])
    setLoading(false)
  }

  const filtered = search
    ? projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    : projects

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Community builds</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>All Projects</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.95rem' }}>Everything the VCAC community has built. Run any project live in your browser.</p>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
        <input
          type="text" placeholder="Search projects..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280, flex: 1 }}
        />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', flex: 'none' }}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`btn ${category === c ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.78rem', padding: '6px 14px' }}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <div style={{ color: 'var(--text-mid)', marginBottom: '1.5rem' }}>No projects found</div>
          <Link href="/submit" className="btn btn-primary">Be the first to submit one!</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(p => (
            <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ overflow: 'hidden', transition: 'all 0.25s', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ height: 160, background: 'var(--panel)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.thumbnail_url
                    ? <img src={p.thumbnail_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (
                      <div style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem', lineHeight: 2 }}>
                        <div style={{ color: 'var(--cyan)' }}>▸ {p.title}</div>
                        <div style={{ color: 'var(--green)' }}>✓ Click to run</div>
                      </div>
                    )
                  }
                  {p.featured && <div style={{ position: 'absolute', top: 8, left: 8 }}><span className="badge badge-gold">⭐ Featured</span></div>}
                  <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                    <span className={`tag ${TAG_COLORS[p.category] || 'tag-cyan'}`}>{p.category}</span>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'var(--white)', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>by {p.profiles?.username || 'anon'}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>♥ {p.likes || 0}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>▸ {p.runs || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
