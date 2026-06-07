import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { AvatarDisplay } from '../lib/avatars'

export default function Admin() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [members, setMembers] = useState([])
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [memberSearch, setMemberSearch] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!prof || prof.role !== 'president') { router.push('/'); return }
      setProfile(prof)
      fetchAll()
    })
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: pend }, { data: appr }, { data: memb }, { data: reps }] = await Promise.all([
      supabase.from('projects').select('*, profiles(username, email)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('projects').select('*, profiles(username)').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(username), reported:profiles!reports_reported_id_fkey(username, id)').order('created_at', { ascending: false })
    ])
    setPending(pend || [])
    setApproved(appr || [])
    setMembers(memb || [])
    setReports(reps || [])
    setStats({
      pending: (pend || []).length,
      approved: (appr || []).length,
      members: (memb || []).length,
      pros: (memb || []).filter(m => m.role === 'pro').length,
      reports: (reps || []).filter(r => r.status === 'pending').length,
    })
    setLoading(false)
  }

  async function approveProject(id) {
    await supabase.from('projects').update({ status: 'approved' }).eq('id', id)
    fetchAll()
  }

  async function rejectProject(id) {
    await supabase.from('projects').update({ status: 'rejected' }).eq('id', id)
    fetchAll()
  }

  async function featureProject(id, featured) {
    await supabase.from('projects').update({ featured: !featured }).eq('id', id)
    fetchAll()
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project permanently?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchAll()
  }

  async function changeRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    fetchAll()
  }

  async function markReportReviewed(id) {
    await supabase.from('reports').update({ status: 'reviewed' }).eq('id', id)
    fetchAll()
  }

  async function banUser(userId) {
    if (!confirm('Ban this user? They will lose access.')) return
    await supabase.from('profiles').update({ role: 'banned' }).eq('id', userId)
    fetchAll()
  }

  const filteredMembers = memberSearch
    ? members.filter(m => m.username?.toLowerCase().includes(memberSearch.toLowerCase()) || m.email?.toLowerCase().includes(memberSearch.toLowerCase()))
    : members

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading admin panel...</div>

  const TABS = [
    { id: 'pending', label: '⏳ Pending (' + stats.pending + ')' },
    { id: 'approved', label: '✅ Approved (' + stats.approved + ')' },
    { id: 'members', label: '👥 Members (' + stats.members + ')' },
    { id: 'reports', label: '⚑ Reports (' + stats.reports + ')' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className="badge badge-gold">🍁 President</span>
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Welcome back, {profile?.username}.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Pending review', value: stats.pending, color: 'var(--gold)' },
          { label: 'Live projects', value: stats.approved, color: 'var(--green)' },
          { label: 'Total members', value: stats.members, color: 'var(--cyan)' },
          { label: 'Pro members', value: stats.pros, color: 'var(--violet)' },
          { label: 'Open reports', value: stats.reports, color: 'var(--maple)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={'btn ' + (tab === t.id ? 'btn-primary' : 'btn-ghost')} style={{ fontSize: '0.82rem', padding: '8px 16px' }}>{t.label}</button>
        ))}
      </div>

      {/* PENDING */}
      {tab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>🎉 No pending submissions!</div>
          ) : pending.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1rem' }}>{p.title}</span>
                  <span className="tag tag-cyan">{p.category}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: 8 }}>{p.description}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  by <Link href={'/user/' + p.profiles?.username} style={{ color: 'var(--white)', textDecoration: 'none' }}>{p.profiles?.username}</Link>
                  {' · '}{new Date(p.created_at).toLocaleDateString()}
                  {p.demo_url && <> · <a href={p.demo_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>Preview →</a></>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => approveProject(p.id)} className="btn btn-ghost" style={{ color: 'var(--green)', borderColor: 'rgba(6,214,160,0.3)', fontSize: '0.82rem', padding: '8px 14px' }}>✓ Approve</button>
                <button onClick={() => rejectProject(p.id)} className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPROVED */}
      {tab === 'approved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {approved.map(p => (
            <div key={p.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1rem' }}>{p.title}</span>
                  <span className="tag tag-cyan">{p.category}</span>
                  {p.featured && <span className="badge badge-gold">⭐ Featured</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  by <Link href={'/user/' + p.profiles?.username} style={{ color: 'var(--white)', textDecoration: 'none' }}>{p.profiles?.username}</Link>
                  {' · '}♥ {p.likes || 0} · 👁 {p.runs || 0}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => featureProject(p.id, p.featured)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 12px', color: 'var(--gold)' }}>
                  {p.featured ? '★ Unfeature' : '⭐ Feature'}
                </button>
                <Link href={'/projects/' + p.id} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>View</Link>
                <button onClick={() => deleteProject(p.id)} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MEMBERS */}
      {tab === 'members' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <input type="text" placeholder="Search by username or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ maxWidth: 360 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>No members found</div>
            ) : filteredMembers.map(m => (
              <div key={m.id} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AvatarDisplay avatarId={m.avatar_id || 'bear'} size={36} />
                <div style={{ flex: 1 }}>
                  <Link href={'/user/' + m.username} style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.9rem', textDecoration: 'none' }}>{m.username}</Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{m.email} · joined {new Date(m.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.role === 'president' ? (
                    <span className="badge badge-gold">🍁 President</span>
                  ) : (
                    <select value={m.role || 'member'} onChange={e => changeRole(m.id, e.target.value)} style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }}>
                      <option value="member">Member</option>
                      <option value="pro">Pro</option>
                      <option value="banned">Banned</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTS */}
      {tab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>🎉 No reports!</div>
          ) : reports.map(r => (
            <div key={r.id} className="card" style={{ padding: '1.25rem', borderColor: r.status === 'pending' ? 'rgba(255,63,63,0.3)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--maple)', fontSize: '0.9rem' }}>⚑ {r.reason}</span>
                    <span style={{ fontSize: '0.72rem', color: r.status === 'pending' ? 'var(--gold)' : 'var(--green)', textTransform: 'uppercase', fontWeight: 600, border: '1px solid', borderColor: r.status === 'pending' ? 'rgba(255,209,102,0.3)' : 'rgba(6,214,160,0.3)', padding: '2px 8px', borderRadius: 100 }}>
                      {r.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', marginBottom: 6 }}>
                    <Link href={'/user/' + r.reporter?.username} style={{ color: 'var(--white)', textDecoration: 'none', fontWeight: 600 }}>{r.reporter?.username}</Link>
                    <span style={{ color: 'var(--text-dim)' }}> reported </span>
                    <Link href={'/user/' + r.reported?.username} style={{ color: 'var(--maple)', textDecoration: 'none', fontWeight: 600 }}>{r.reported?.username}</Link>
                  </div>
                  {r.details && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', fontStyle: 'italic', background: 'var(--panel)', padding: '8px 12px', borderRadius: 6, marginBottom: 6 }}>
                      "{r.details}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()} · {new Date(r.created_at).toLocaleTimeString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                  {r.status === 'pending' && (
                    <button onClick={() => markReportReviewed(r.id)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', color: 'var(--green)', borderColor: 'rgba(6,214,160,0.3)', whiteSpace: 'nowrap' }}>
                      ✓ Mark reviewed
                    </button>
                  )}
                  <Link href={'/user/' + r.reported?.username} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap' }}>
                    View profile
                  </Link>
                  {r.reported?.id && (
                    <button onClick={() => banUser(r.reported.id)} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap' }}>
                      Ban user
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
