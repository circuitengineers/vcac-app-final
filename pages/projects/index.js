import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['All', 'Game', 'Art', 'Tool', 'AI', 'Simulation', 'Music', 'Other']
const SORTS = [{ value: 'promoted', label: '🔥 Top' }, { value: 'newest', label: 'Newest' }, { value: 'popular', label: 'Most liked' }, { value: 'runs', label: 'Most viewed' }]
const TAG_COLORS = { Game: 'tag-green', Art: 'tag-gold', Tool: 'tag-maple', AI: 'tag-cyan', Simulation: 'tag-violet', Music: 'tag-violet', Other: 'tag-cyan' }

function ProjectCard({ project }) {
  const isPromoted = project.promoted_until && new Date(project.promoted_until) > new Date()
  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{
        overflow: 'hidden', transition: 'all 0.25s', height: '100%', cursor: 'pointer',
        borderColor: isPromoted ? 'rgba(255,209,102,0.4)' : undefined,
        background: isPromoted ? 'linear-gradient(180deg, rgba(255,209,102,0.05) 0%, var(--surface) 100%)' : undefined
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
      >
        <div style={{ height: 170, background: 'var(--panel)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {project.thumbnail_url
            ? <img src={project.thumbnail_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (
              <div style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem', lineHeight: 2 }}>
                <div style={{ color: 'var(--cyan)' }}>▸ {project.title}</div>
                <div style={{ color: 'var(--green)' }}>✓ Click to view</div>
              </div>
            )
          }
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {isPromoted && <span className="badge badge-gold">🔥 Promoted</span>}
            {project.featured && <span className="badge badge-maple">⭐ Featured</span>}
          </div>
          <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
            <span className={`tag ${TAG_COLORS[project.category] || 'tag-cyan'}`}>{project.category}</span>
          </div>
        </div>
        <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'var(--white)', marginBottom: 4 }}>{project.title}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <Link href={'/user/' + (project.profiles?.username || '')} onClick={e => e.stopPropagation()} style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textDecoration: 'none' }}>by {project.profiles?.username || 'anon'}</Link>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>♥ {project.likes || 0}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>👁 {project.runs || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [promoted, setPromoted] = useState([])
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('promoted')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProjects() }, [category, sort])

  async function fetchProjects() {
    setLoading(true)
    const now = new Date().toISOString()

    // Fetch promoted projects first
    let promoQuery = supabase.from('projects').select('*, profiles(username)').eq('status', 'approved').gt('promoted_until', now)
    if (category !== 'All') promoQuery = promoQuery.eq('category', category)
    const { data: promoData } = await promoQuery.order('promoted_until', { ascending: false })
    setPromoted(promoData || [])

    // Fetch regular projects
    let query = supabase.from('projects').select('*, profiles(username)').eq('status', 'approved')
    if (category !== 'All') query = query.eq('category', category)

    if (sort === 'promoted') query = query.order('created_at', { ascending: false })
    else if (sort === 'newest') query = query.order('created_at', { ascending: false })
    else if (sort === 'popular') query = query.order('likes', { ascending: false })
    else if (sort === 'runs') query = query.order('runs', { ascending: false })

    const { data } = await query.limit(24)
    // Filter out promoted from regular list
    const promoIds = new Set((promoData || []).map(p => p.id))
    setProjects((data || []).filter(p => !promoIds.has(p.id)))
    setLoading(false)
  }

  const filterProjects = (list) => search
    ? list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    : list

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Community builds</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>All Projects</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.95rem' }}>Everything the VCAC community has built. Click any project to view it.</p>
      </div>

      {/* Search + sort */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280, flex: 1 }} />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', flex: 'none' }}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`btn ${category === c ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.78rem', padding: '6px 14px' }}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading projects...</div>
      ) : (
        <>
          {/* Promoted section */}
          {filterProjects(promoted).length > 0 && (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)' }}>🔥 Promoted projects</span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,209,102,0.3), transparent)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filterProjects(promoted).map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
            </div>
          )}

          {/* All projects */}
          {filterProjects(promoted).length > 0 && filterProjects(projects).length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>All projects</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          )}

          {filterProjects(projects).length === 0 && filterProjects(promoted).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <div style={{ color: 'var(--text-mid)', marginBottom: '1.5rem' }}>No projects found</div>
              <Link href="/submit" className="btn btn-primary">Be the first to submit one!</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filterProjects(projects).map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
