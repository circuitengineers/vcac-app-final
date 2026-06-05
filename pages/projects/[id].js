
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
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

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
  const screenshots = project.screenshots || (project.thumbnail_url ? [project.thumbnail_url] : [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        ← Back to projects
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        {/* Left */}
        <div>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <span className="tag tag-cyan">{project.category}</span>
                {project.featured && <span className="badge badge-gold">⭐ Featured</span>}
                {project.has_source && <span className="badge badge-violet">💻 Source available</span>}
              </div>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>{project.title}</h1>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.9rem', marginTop: 6 }}>
                by <span style={{ color: 'var(--white)' }}>{project.profiles?.username}</span>
                {project.profiles?.role === 'president' && <span className="badge badge-gold" style={{ marginLeft: 8 }}>🍁 President</span>}
                {project.profiles?.role === 'pro' && <span className="badge badge-cyan" style={{ marginLeft: 8 }}>⚡ Pro</span>}
              </p>
            </div>
            <button onClick={handleLike} className="btn btn-ghost" style={{ gap: 6, color: liked ? 'var(--maple)' : undefined, borderColor: liked ? 'rgba(255,63,63,0.4)' : undefined }}>
              ♥ {project.likes || 0}
            </button>
          </div>

          {/* Screenshots gallery */}
          {screenshots.length > 0 && (
            <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--deep)', position: 'relative', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={screenshots[activeImg]}
                  alt={project.title}
                  style={{ width: '100%', maxHeight: 420, objectFit: 'contain' }}
                  onError={e => e.target.style.display='none'}
                />
              </div>
              {screenshots.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '0.75rem', background: 'var(--panel)', overflowX: 'auto' }}>
                  {screenshots.map((s, i) => (
                    <img key={i} src={s} alt="" onClick={() => setActiveImg(i)} style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: activeImg === i ? '2px solid var(--maple)' : '2px solid transparent', flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No screenshots fallback */}
          {screenshots.length === 0 && (
            <div className="card" style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', background: 'var(--panel)' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚀</div>
                {project.title}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-cyan" style={{ fontSize: '0.9rem' }}>
                🌐 Try it live →
              </a>
            )}
            {project.download_url && (
              <a href={project.download_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>
                ⬇️ Download
              </a>
            )}
          </div>

          {/* Description */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>About this project</h3>
            <p style={{ color: 'var(--text-mid)', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{project.description}</p>
          </div>

          {/* Source code */}
          {project.has_source && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>Source Code</h3>
              {isPro || isOwner || isAdmin ? (
                <div>
                  <p style={{ color: 'var(--text-mid)', fontSize: '0.85rem', marginBottom: '1rem' }}>You have Pro access — here's the source code:</p>
                  <a href={project.source_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                    View source code on GitHub →
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--panel)', borderRadius: 8, border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🔒</div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>Pro members only</div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Upgrade to Pro to unlock source code. The creator earns a cut every time their code is unlocked.
                  </p>
                  <Link href="/pricing" className="btn btn-cyan">Upgrade to Pro — $9/mo</Link>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1.25rem' }}>Comments ({comments.length})</h3>
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
              { label: 'Views', value: project.runs || 0 },
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

          {/* Links card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-cyan" style={{ fontSize: '0.82rem', padding: '8px' }}>🌐 Try live</a>
              )}
              {project.download_url && (
                <a href={project.download_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px' }}>⬇️ Download</a>
              )}
              {!project.demo_url && !project.download_url && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>No links provided</div>
              )}
            </div>
          </div>

          {(isOwner || isAdmin) && (
  <div className="card" style={{ padding: '1.25rem' }}>
    <h4 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>⚡ Owner actions</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Link href={`/edit/${project.id}`} className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px', textAlign: 'center' }}>✏️ Edit project</Link>
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
