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
  const [submitType, setSubmitType] = useState('link') // 'link' | 'code'
  const [form, setForm] = useState({
    title: '', description: '', category: 'Game',
    demo_url: '', source_url: '', html_code: '', thumbnail_url: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
    })
  }, [])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description are required'); return }
    if (submitType === 'link' && !form.demo_url.trim()) { setError('Please provide a demo URL'); return }
    if (submitType === 'code' && !form.html_code.trim()) { setError('Please paste your HTML/JS code'); return }
    setLoading(true); setError(null)
    const { error } = await supabase.from('projects').insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      demo_url: form.demo_url.trim() || null,
      source_url: form.source_url.trim() || null,
      html_code: submitType === 'code' ? form.html_code.trim() : null,
      thumbnail_url: form.thumbnail_url.trim() || null,
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
          The VCAC president will review your project and approve it shortly. You'll see it in the gallery once it's live.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/projects" className="btn btn-primary">Browse projects</a>
          <a href="/submit" className="btn btn-ghost" onClick={() => { setSuccess(false); setForm({ title:'',description:'',category:'Game',demo_url:'',source_url:'',html_code:'',thumbnail_url:'' }) }}>Submit another</a>
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

        {/* Submit type toggle */}
        <div>
          <label>How do you want to share it? *</label>
          <div style={{ display: 'flex', background: 'var(--panel)', borderRadius: 8, padding: 4, marginTop: 2 }}>
            {[{ v: 'link', l: '🔗 Paste a link (GitHub, CodePen, etc.)' }, { v: 'code', l: '💻 Paste HTML/JS code directly' }].map(opt => (
              <button type="button" key={opt.v} onClick={() => setSubmitType(opt.v)} style={{
                flex: 1, padding: '10px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s',
                background: submitType === opt.v ? 'var(--surface)' : 'transparent',
                color: submitType === opt.v ? 'var(--white)' : 'var(--text-dim)'
              }}>{opt.l}</button>
            ))}
          </div>
        </div>

        {submitType === 'link' ? (
          <div>
            <label>Demo / live URL *</label>
            <input type="url" placeholder="https://your-project.vercel.app" value={form.demo_url} onChange={e => update('demo_url', e.target.value)} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>Must be a publicly accessible URL that runs in an iframe (CodePen, Vercel, GitHub Pages, etc.)</div>
          </div>
        ) : (
          <div>
            <label>HTML / JavaScript code *</label>
            <textarea placeholder="<!DOCTYPE html>&#10;<html>&#10;  <!-- your vibe coded project -->&#10;</html>" value={form.html_code} onChange={e => update('html_code', e.target.value)} rows={10} style={{ fontFamily: 'DM Mono', fontSize: '0.78rem', resize: 'vertical' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>Paste your full HTML file. It will run in a sandboxed iframe.</div>
          </div>
        )}

        {/* Optional fields */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Optional</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Source code / GitHub URL</label>
              <input type="url" placeholder="https://github.com/you/your-project" value={form.source_url} onChange={e => update('source_url', e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>Pro members will be able to view this</div>
            </div>
            <div>
              <label>Thumbnail image URL</label>
              <input type="url" placeholder="https://i.imgur.com/yourimage.png" value={form.thumbnail_url} onChange={e => update('thumbnail_url', e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>A screenshot of your project (hosted anywhere)</div>
            </div>
          </div>
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
