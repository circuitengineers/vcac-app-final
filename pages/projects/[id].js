import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function ProjectPage() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [running, setRunning] = useState(false)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchProject()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })
  }, [id])

  async function fetchProject() {
    const { data } = await supabase.from('projects').select('*, profiles(username, avatar_url, role)').eq('id', id).single()
    setProject(data)
    setLoading(false)
    if (data) {
      // increment runs
      await supabase.from('projects').update({ runs: (data.runs || 0) + 1 }).eq('id', id)
      fetchComments()
    }
  }

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  async function fetchComments() {
    const { data } = await supabase.from('comments').select('*, profiles(username)').eq('project_id', id).order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function handleLike() {
    if (!user) { router.push('/login'); return }
    if (liked) return
    setLiked(true)
    await supabase.from('projects').update({ likes: (project.likes || 0) + 1 }).eq('id', id)
    setProject(p => ({ ...p, likes: (p.likes || 0) + 1 }))
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!user || !comment.trim()) return
    await supabase.from('comments').insert({ project_id: id, user_id: user.id, content: comment.trim() })
    setComment('')
    fetchComments()
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading project...</div>
  if (!project) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Project not found</div>

  const isPro = profile?.role === 'pro' || profile?.role === 'president'
  const isOwner = user?.id === project.user_id
  const isAdmin = profile?.role === 'president'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        ← Back to projects
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Left — runner */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className={`tag tag-cyan`}>{project.category}</span>
                {project.featured && <span className="badge badge-gold">⭐ Featured</span>}
              </div>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>{project.title}</h1>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginTop: 6 }}>
                by <span style={{ color: 'var(--white)' }}>{project.profiles?.username}</span>
                {project.profiles?.role === 'president' && <span className="badge badge-gold" style={{ marginLeft: 8 }}>🍁 President</span>}
                {project.profiles?.role === 'pro' && <span className="badge badge-cyan" style={{ marginLeft: 8 }}>⚡ Pro</span>}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleLike} className="btn btn-ghost" style={{ gap: 6, color: liked ? 'var(--maple)' : undefined, borderColor: liked ? 'rgba(255,63,63,0.4)' : undefined }}>
                ♥ {project.likes || 0}
              </button>
              <button onClick={() => setRunning(true)} className="btn btn-cyan">▶ Run Project</button>
            </div>
          </div>

          {/* Runner */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--panel)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ fontFamily: 'DM Mono', fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: 8 }}>
                {running ? `Running: ${project.title}` : 'Click "Run Project" to launch'}
              </span>
            </div>
            <div style={{ height: 480, background: 'var(--deep)', position: 'relative' }}>
              {running ? (
                project.demo_url ? (
                  <iframe src={project.demo_url} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts allow-same-origin allow-forms" title={project.title} />
                ) : project.html_code ? (
                  <iframe srcDoc={project.html_code} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts" title={project.title} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontFamily: 'DM Mono', fontSize: '0.85rem' }}>
                    No runnable code provided for this project.
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem' }}>
                  {project.thumbnail_url
                    ? <img src={project.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.3 }} />
                    : null
                  }
                  <button onClick={() => setRunning(true)} style={{
                    width: 72, height: 72, borderRadius: '50%', background: 'var(--cyan)',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, transition: 'transform 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-mid)', zIndex: 1 }}>Click to run this project</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>About this project</h3>
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.8, fontSize: '0.9rem' }}>{project.description}</p>
          </div>

          {/* Source code */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>Source Code</h3>
            {isPro || isOwner || isAdmin ? (
              <div>
                <div style={{ background: 'var(--black)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.25rem', fontFamily: 'DM Mono', fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.8, maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {project.html_code || project.source_url || 'No source code provided.'}
                </div>
                {project.source_url && (
                  <a href={project.source_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                    View on GitHub →
                  </a>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--panel)', borderRadius: 8, border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🔒</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>Pro members only</div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Upgrade to Pro to view source code for every project on VCAC.</p>
                <Link href="/pricing" className="btn btn-cyan">Upgrade to Pro — $9/mo</Link>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1.25rem' }}>
              Comments ({comments.length})
            </h3>
            {user ? (
              <form onSubmit={handleComment} style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
                <input type="text" placeholder="Leave a comment..." value={comment} onChange={e => setComment(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Post</button>
              </form>
            ) : (
              <div style={{ marginBottom: '1.5rem', padding: '12px', background: 'var(--panel)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                <Link href="/login" style={{ color: 'var(--maple)' }}>Sign in</Link> to leave a comment
              </div>
            )}
            {comments.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No comments yet. Be the first!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--maple)', flexShrink: 0 }}>
                      {(c.profiles?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--white)' }}>{c.profiles?.username}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 8 }}>{new Date(c.created_at).toLocaleDateString()}</span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', marginTop: 3, lineHeight: 1.6 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Project stats</h4>
            {[
              { label: 'Runs', value: project.runs || 0 },
              { label: 'Likes', value: project.likes || 0 },
              { label: 'Comments', value: comments.length },
              { label: 'Submitted', value: new Date(project.created_at).toLocaleDateString() },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>{s.label}</span>
                <span style={{ color: 'var(--white)', fontWeight: 500 }}>{s.value}</span>
              </div>
            ))}
          </div>

          {(isOwner || isAdmin) && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>⚡ Owner actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href={`/edit/${project.id}`} className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px' }}>Edit project</Link>
                {isAdmin && (
                  <button onClick={async () => {
                    await supabase.from('projects').update({ featured: !project.featured }).eq('id', id)
                    setProject(p => ({ ...p, featured: !p.featured }))
                  }} className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px' }}>
                    {project.featured ? '★ Unfeature' : '⭐ Feature this'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
