cat > /home/claude/vcac/pages/submit.js << 'EOF'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Game', 'Art', 'Tool', 'AI', 'Simulation', 'Music', 'Other']

export default function Submit() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Game',
    live_url: '', download_url: '', source_url: '',
    screenshots: ['', '', ''],
    has_source: false
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
    })
  }, [])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  function updateScreenshot(i, value) {
    const s = [...form.screenshots]
    s[i] = value
    setForm(f => ({ ...f, screenshots: s }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.live_url.trim() && !form.download_url.trim()) { setError('Please provide at least a live URL or download link'); return }
    setLoading(true); setError(null)

    const screenshots = form.screenshots.filter(s => s.trim())
    const thumbnail = screenshots[0] || null

    const { error } = await supabase.from('projects').insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      demo_url: form.live_url.trim() || null,
      download_url: form.download_url.trim() || null,
      source_url: form.has_source ? (form.source_url.trim() || null) : null,
      has_source: form.has_source,
      screenshots: screenshots,
      thumbnail_url: thumbnail,
      status: 'pending',
      likes: 0, runs: 0, featured: false
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🍁</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', marginBottom: '0.75rem' }}>Project submitted!</h1>
        <p style={{ color: 'var(--text-mid)', maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.8 }}>
          The VCAC president will review your project and approve it shortly.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/projects" className="btn btn-primary">Browse projects</a>
          <a href="/submit" className="btn btn-ghost" onClick={() => { setSuccess(false); setForm({ title:'',description:'',category:'Game',live_url:'',download_url:'',source_url:'',screenshots:['','',''],has_source:false }) }}>Submit another</a>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Share your build</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Submit a project</h1>
        <p style={{ color: 'var(--text-mid)', marginTop: 8, fontSize: '0.9rem' }}>All submissions are reviewed by the VCAC president before going live.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Title */}
        <div>
          <label>Project title *</label>
          <input type="text" placeholder="My Awesome Vibe Project" value={form.title} onChange={e => update('title', e.target.value)} maxLength={80} required />
        </div>

        {/* Description */}
        <div>
          <label>Description *</label>
          <textarea placeholder="What did you build? What makes it cool? How did you vibe code it?" value={form.description} onChange={e => update('description', e.target.value)} rows={4} required style={{ resize: 'vertical' }} />
        </div>

        {/* Category */}
        <div>
          <label>Category *</label>
          <select value={form.category} onChange={e => update('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Links */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>🔗 Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Live URL</label>
              <input type="url" placeholder="https://your-project.vercel.app" value={form.live_url} onChange={e => update('live_url', e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>A link people can click to try your project (Vercel, GitHub Pages, CodePen, etc.)</div>
            </div>
            <div>
              <label>Download link</label>
              <input type="url" placeholder="https://github.com/you/project/releases/download/..." value={form.download_url} onChange={e => update('download_url', e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>A direct download link (zip file, exe, etc.)</div>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>📸 Screenshots</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Paste image URLs (upload to imgur.com for free, then paste the link). First image is your thumbnail.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.screenshots.map((s, i) => (
              <div key={i}>
                <label>Screenshot {i + 1}{i === 0 ? ' (thumbnail)' : ''}</label>
                <input type="url" placeholder="https://i.imgur.com/yourimage.png" value={s} onChange={e => updateScreenshot(i, e.target.value)} />
              </div>
            ))}
          </div>
          {/* Preview */}
          {form.screenshots[0] && (
            <div style={{ marginTop: '1rem', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', maxHeight: 200 }}>
              <img src={form.screenshots[0]} alt="Preview" style={{ width: '100%', objectFit: 'cover', maxHeight: 200 }} onError={e => e.target.style.display='none'} />
            </div>
          )}
        </div>

        {/* Source code */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>💰 Source Code (optional)</div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <input type="checkbox" id="has_source" checked={form.has_source} onChange={e => update('has_source', e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
              <label htmlFor="has_source" style={{ cursor: 'pointer', marginBottom: 0 }}>
                <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.9rem' }}>Include source code for Pro members</span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.6 }}>
                  Pro members pay $9/mo to unlock source code. You earn a percentage every time someone unlocks yours. 🍁
                </div>
              </label>
            </div>
          </div>

          {form.has_source && (
            <div>
              <label>GitHub / source code URL</label>
              <input type="url" placeholder="https://github.com/you/your-project" value={form.source_url} onChange={e => update('source_url', e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>Only visible to Pro members</div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(255,63,63,0.1)', border: '1px solid rgba(255,63,63,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: 'var(--maple-soft)' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: '13px', fontSize: '0.95rem' }}>
            {loading ? 'Submitting...' : '🚀 Submit project'}
          </button>
          <a href="/projects" className="btn btn-ghost" style={{ padding: '13px 20px' }}>Cancel</a>
        </div>
      </form>
    </div>
  )
}
EOF
echo "submit.js done"
