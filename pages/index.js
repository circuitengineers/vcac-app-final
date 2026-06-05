import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['All', 'Game', 'Art', 'Tool', 'AI', 'Simulation', 'Music', 'Other']

function ProjectCard({ project, onLike }) {
  const tagColors = {
    Game: 'tag-green', Art: 'tag-gold', Tool: 'tag-maple',
    AI: 'tag-cyan', Simulation: 'tag-violet', Music: 'tag-violet', Other: 'tag-cyan'
  }
  return (
    <div className="card" style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--muted)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Preview */}
      <div style={{ height: 160, background: 'var(--panel)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ fontFamily: 'DM Mono', fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem', lineHeight: 2 }}>
            <div style={{ color: 'var(--cyan)' }}>▸ {project.title}</div>
            <div style={{ color: 'var(--green)' }}>✓ Ready to run</div>
            <div style={{ color: 'var(--text-dim)' }}>by {project.profiles?.username || 'anon'}</div>
          </div>
        )}
        {/* Run overlay */}
        <Link href={`/projects/${project.id}`} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.2s', textDecoration: 'none'
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </Link>
        {project.featured && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span className="badge badge-gold">⭐ Featured</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <span className={`tag ${tagColors[project.category] || 'tag-cyan'}`}>{project.category}</span>
        </div>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: 'var(--white)', marginBottom: 4 }}>{project.title}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--maple)' }}>
              {(project.profiles?.username || '?')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{project.profiles?.username || 'anon'}</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onLike(project.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
              ♥ {project.likes || 0}
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              ▸ {project.runs || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [projects, setProjects] = useState([])
  const [featured, setFeatured] = useState(null)
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ members: 0, projects: 0 })

  useEffect(() => { fetchProjects() }, [category])

  async function fetchProjects() {
    setLoading(true)
    let query = supabase.from('projects').select('*, profiles(username)').eq('status', 'approved').order('created_at', { ascending: false })
    if (category !== 'All') query = query.eq('category', category)
    const { data } = await query.limit(12)
    setProjects(data || [])

    const feat = (data || []).find(p => p.featured)
    setFeatured(feat || (data || [])[0] || null)

    const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    setStats({ members: memberCount || 0, projects: projCount || 0 })
    setLoading(false)
  }

  async function handleLike(projectId) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    await supabase.rpc('increment_likes', { project_id: projectId })
    fetchProjects()
  }

  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem 3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(255,63,63,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="animate-fadeup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'var(--maple-glow)', border: '1px solid rgba(255,63,63,0.3)', borderRadius: 100, fontSize: '0.75rem', fontWeight: 500, color: 'var(--maple-soft)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--maple)', animation: 'pulse 1.5s ease infinite', display: 'inline-block' }} />
          Canada's vibe coding community
        </div>

        <svg className="animate-fadeup-1" width="100" height="100" viewBox="0 0 120 120" fill="none" style={{ marginBottom: '2rem' }}>
          <circle cx="60" cy="60" r="58" stroke="#2a2a3f" strokeWidth="1.5"/>
          <circle cx="60" cy="60" r="50" stroke="#ff3f3f" strokeWidth="0.5" strokeDasharray="4 6"/>
          <path d="M60 14L64 24H74L67 30L70 40L60 34L50 40L53 30L46 24H56Z" fill="#ff3f3f"/>
          <path d="M60 44V55" stroke="#ff3f3f" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M30 65H45M45 65V75" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="30" cy="65" r="3" fill="#00e5ff"/>
          <circle cx="45" cy="75" r="3" fill="#00e5ff"/>
          <path d="M90 65H75M75 65V75" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="90" cy="65" r="3" fill="#00e5ff"/>
          <circle cx="75" cy="75" r="3" fill="#00e5ff"/>
          <circle cx="60" cy="60" r="8" fill="#0f0f1a" stroke="#ff3f3f" strokeWidth="1.5"/>
          <circle cx="60" cy="60" r="3" fill="#ff3f3f"/>
          <path d="M45 75L60 85L75 75" stroke="#9b59ff" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="60" cy="85" r="3" fill="#9b59ff"/>
          <text x="60" y="108" textAnchor="middle" fontFamily="Syne" fontWeight="800" fontSize="9" fill="#e0e0f0" letterSpacing="3">VCAC</text>
        </svg>

        <h1 className="animate-fadeup-2" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.0, letterSpacing: '-0.03em', color: 'var(--white)', marginBottom: '1.25rem' }}>
          Build wild.<br/>
          <span style={{ color: 'var(--maple)' }}>Ship fast.</span><br/>
          <span style={{ color: 'var(--cyan)' }}>Vibe harder.</span>
        </h1>

        <p className="animate-fadeup-3" style={{ fontSize: '1.05rem', color: 'var(--text-mid)', maxWidth: 520, margin: '0 auto 2.5rem', fontWeight: 300, lineHeight: 1.8 }}>
          The Vibe Coders Association of Canada — run projects live, share your builds, and see what astonishing things people make with AI.
        </p>

        <div className="animate-fadeup-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <Link href="/projects" className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 30px' }}>Explore Projects</Link>
          <Link href="/submit" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '13px 30px' }}>Submit Your Build →</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
          {[
            { num: stats.members, label: 'Members', suffix: '' },
            { num: stats.projects, label: 'Projects', suffix: '' },
            { num: '🍁', label: 'Made in Canada', suffix: '' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>{s.num}{s.suffix}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 6 }}>Community builds</div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Latest projects</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`btn ${category === c ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.78rem', padding: '6px 14px' }}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
            <div style={{ color: 'var(--text-mid)', marginBottom: '1.5rem' }}>No projects yet — be the first to submit!</div>
            <Link href="/submit" className="btn btn-primary">Submit the first project</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {projects.map(p => <ProjectCard key={p.id} project={p} onLike={handleLike} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.82rem', fontFamily: 'DM Mono', color: 'var(--maple)', background: 'var(--maple-glow)', border: '1px solid rgba(255,63,63,0.2)', padding: '6px 16px', borderRadius: 6, display: 'inline-block', marginBottom: '1.5rem' }}>
          vcac.ca/submit
        </div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--white)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '1.25rem' }}>
          Built something wild?<br/>Show Canada.
        </h2>
        <p style={{ color: 'var(--text-mid)', fontSize: '1rem', maxWidth: 440, margin: '0 auto 2.5rem', fontWeight: 300 }}>
          Submit your vibe coded project and let thousands of builders run it and be inspired by it.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 30px' }}>Join VCAC free →</Link>
          <Link href="/projects" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '13px 30px' }}>Browse first</Link>
        </div>
      </section>
    </div>
  )
}
