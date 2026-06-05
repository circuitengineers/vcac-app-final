import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Game', 'Art', 'Tool', 'AI', 'Simulation', 'Music', 'Other']

export default function EditProject() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Game',
    live_url: '', download_url: '', source_url: '',
    screenshots: ['', '', ''],
    has_source: false
  })

  useEffect(() => {
    if (!id) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
      if (!project) { router.push('/projects'); return }
      if (project.user_id !== session.user.id) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (prof?.role !== 'president') { router.push('/projects'); return }
      }
      const screenshots = project.screenshots || (project.thumbnail_url ? [project.thumbnail_url] : ['', '', ''])
      while (screenshots.length < 3) screenshots.push('')
      setForm({
        title: project.title || '',
        description: project.description || '',
        category: project.category || 'Game',
        live_url: project.demo_url || '',
        download_url: project.download_url || '',
        source_url: project.source_url || '',
        screenshots: screenshots.slice(0, 3),
        has_source: project.has_source || false
      })
      setLoading(false)
    })
  }, [id])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  function updateScreenshot(i, value) {
    const s = [...form.screenshots]
    s[i] = value
    setForm(f => ({ ...f, screenshots: s }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError(null)
    const screenshots = form.screenshots.filter(s => s.trim())
    const { error } = await supabase.from('projects').update({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      demo_url: form.live_url.trim() || null,
      download_url: form.download_url.trim() || null,
      source_url: form.has_source ? (form.source_url.trim() || null) : null,
      has_source: form.has_source,
      screenshots: screenshots,
      thumbnail_url: screenshots[0] || null,
    }).eq('id', id)
    if (error) { setError(error.message); setSaving(false); return }
    setSuccess(true); setSaving(false)
    setTimeout(() => router.push(`/projects/${id}`), 1500)
  }

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Edit your build</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Edit project</h1>
      </div>

      {success && (
        <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: 'var(--green)', marginBottom: '1.5rem' }}>
          ✓ Saved! Redirecting...
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div>
          <label>Project title *</label>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)} maxLength={80} required />
        </div>

        <div>
          <label>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} style={{ resize: 'vertical' }} />
        </div>

        <div>
          <label>Category</label>
          <select value={form.category} onChange={e => update('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>🔗 Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Live URL</label>
              <input type="url" placeholder="https://your-project.vercel.app" value={form.live_url} onChange={e => update('live_url', e.target.value)} />
            </div>
            <div>
              <label>Download link</label>
              <input type="url" placeholder="https://github.com/you/project/releases/..." value={form.download_url} onChange={e => update('download_url', e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>📸 Screenshots</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>Paste direct image URLs (e.g. from i.imgur.com). First image is your thumbnail.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {form.screenshots.map((s, i) => (
              <div key={i}>
                <label>Screenshot {i + 1}{i === 0 ? ' (thumbnail)' : ''}</label>
                <input type="url" placeholder="https://i.imgur.com/yourimage.png" value={s} onChange={e => updateScreenshot(i, e.target.value)} />
              </div>
            ))}
          </div>
          {form.screenshots[0] && (
            <div style={{ marginTop: '1rem', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', maxHeight: 200 }}>
              <img src={form.screenshots[0]} alt="Preview" style={{ width: '100%', objectFit: 'cover', maxHeight: 200 }} onError={e => e.target.style.display='none'} />
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>💰 Source Code</div>
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
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(255,63,63,0.1)', border: '1px solid rgba(255,63,63,0.3)', borderRadius: 8, padding: '12px 16px', fontSize: '0.85rem', color: 'var(--maple-soft)' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, padding: '13px', fontSize: '0.95rem' }}>
            {saving ? 'Saving...' : '💾 Save changes'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => router.push(`/projects/${id}`)} style={{ padding: '13px 20px' }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
