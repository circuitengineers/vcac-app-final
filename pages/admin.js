import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { AvatarDisplay } from '../lib/avatars'

export default function Admin() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('analytics')
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [members, setMembers] = useState([])
  const [reports, setReports] = useState([])
  const [certRequests, setCertRequests] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [memberSearch, setMemberSearch] = useState('')
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!prof || prof.role !== 'president') { router.push('/'); return }
      setProfile(prof)
      fetchAll()
      fetchAnalytics()
    })
  }, [])

  async function fetchAnalytics() {
    setAnalyticsLoading(true)
    const now = new Date()
    const day1 = new Date(now - 24*60*60*1000).toISOString()
    const day7 = new Date(now - 7*24*60*60*1000).toISOString()
    const day30 = new Date(now - 30*24*60*60*1000).toISOString()

    const [
      { count: totalUsers },
      { count: newUsersDay },
      { count: newUsersWeek },
      { count: totalProjects },
      { count: projectsDay },
      { count: projectsWeek },
      { data: allProjects },
      { count: totalComments },
      { count: totalMessages },
      { count: totalLikes },
      { data: multiProjectUsers },
      { count: deadAccounts },
      { count: proMembers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', day1),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', day7),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', day1),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved').gte('created_at', day7),
      supabase.from('projects').select('likes, runs').eq('status', 'approved'),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('likes').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('user_id').eq('status', 'approved'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).lt('created_at', day30),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pro'),
    ])

    const totalViews = (allProjects || []).reduce((s, p) => s + (p.runs || 0), 0)
    const avgProjectsPerUser = totalUsers > 0 ? ((totalProjects || 0) / totalUsers).toFixed(1) : 0

    // Users with more than 1 project
    const userProjectCount = {}
    ;(multiProjectUsers || []).forEach(p => { userProjectCount[p.user_id] = (userProjectCount[p.user_id] || 0) + 1 })
    const multiProjectUserCount = Object.values(userProjectCount).filter(c => c > 1).length

    setAnalytics({
      totalUsers: totalUsers || 0,
      newUsersDay: newUsersDay || 0,
      newUsersWeek: newUsersWeek || 0,
      totalProjects: totalProjects || 0,
      projectsDay: projectsDay || 0,
      projectsWeek: projectsWeek || 0,
      totalViews,
      totalLikes: totalLikes || 0,
      totalComments: totalComments || 0,
      totalMessages: totalMessages || 0,
      avgProjectsPerUser,
      multiProjectUserCount,
      deadAccounts: deadAccounts || 0,
      proMembers: proMembers || 0,
    })
    setAnalyticsLoading(false)
  }

  async function fetchAll() {
    setLoading(true)
    const [{ data: pend }, { data: appr }, { data: memb }, { data: reps }, { data: certs }] = await Promise.all([
      supabase.from('projects').select('*, profiles(username, email)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('projects').select('*, profiles(username)').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(username), reported:profiles!reports_reported_id_fkey(username, id)').order('created_at', { ascending: false }),
      supabase.from('certificate_requests').select('*, project:projects(title, id), user:profiles(username)').eq('status', 'pending').order('created_at', { ascending: false })
    ])
    setPending(pend || [])
    setApproved(appr || [])
    setMembers(memb || [])
    setReports(reps || [])
    setCertRequests(certs || [])
    setStats({
      pending: (pend || []).length,
      approved: (appr || []).length,
      members: (memb || []).length,
      pros: (memb || []).filter(m => m.role === 'pro').length,
      reports: (reps || []).filter(r => r.status === 'pending').length,
      certs: (certs || []).length,
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
    const { error } = await supabase.from('profiles').update({ role: role }).eq('id', userId)
    if (error) {
      alert('Error: ' + error.message)
    } else {
      // Update local state immediately
      setMembers(prev => prev.map(m => m.id === userId ? { ...m, role } : m))
      setStats(prev => ({ ...prev, pros: members.filter(m => m.id === userId ? role === 'pro' : m.role === 'pro').length }))
      fetchAll()
    }
  }

  async function markReportReviewed(id) {
    const { error } = await supabase.from('reports').update({ status: 'reviewed' }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    // Update local state immediately
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'reviewed' } : r))
    setStats(prev => ({ ...prev, reports: prev.reports - 1 }))
  }

  async function banUser(userId) {
    if (!confirm('Ban this user?')) return
    await supabase.from('profiles').update({ role: 'banned' }).eq('id', userId)
    fetchAll()
  }

  async function approveCert(id) {
    await supabase.from('certificate_requests').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', id)
    fetchAll()
  }

  async function rejectCert(id) {
    await supabase.from('certificate_requests').update({ status: 'rejected' }).eq('id', id)
    fetchAll()
  }

  const filteredMembers = memberSearch
    ? members.filter(m => m.username?.toLowerCase().includes(memberSearch.toLowerCase()) || m.email?.toLowerCase().includes(memberSearch.toLowerCase()))
    : members

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading admin panel...</div>

  const TABS = [
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'pending', label: '⏳ Pending (' + stats.pending + ')' },
    { id: 'approved', label: '✅ Projects (' + stats.approved + ')' },
    { id: 'members', label: '👥 Members (' + stats.members + ')' },
    { id: 'reports', label: '⚑ Reports (' + stats.reports + ')' },
    { id: 'certs', label: '🏆 Certs (' + stats.certs + ')' },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: 8, display: 'inline-flex' }}>🍁 President</span>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Welcome back, {profile?.username}.</p>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total members', value: stats.members, color: 'var(--cyan)' },
          { label: 'Pro members', value: stats.pros, color: 'var(--gold)' },
          { label: 'Live projects', value: stats.approved, color: 'var(--green)' },
          { label: 'Pending review', value: stats.pending, color: 'var(--text-dim)' },
          { label: 'Open reports', value: stats.reports, color: 'var(--maple)' },
          { label: 'Cert requests', value: stats.certs, color: 'var(--violet)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.1rem' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={'btn ' + (tab === t.id ? 'btn-primary' : 'btn-ghost')} style={{ fontSize: '0.78rem', padding: '7px 14px' }}>{t.label}</button>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {tab === 'analytics' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1.2rem' }}>Live Analytics</h2>
            <button onClick={fetchAnalytics} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>↻ Refresh</button>
          </div>

          {analyticsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading analytics...</div>
          ) : analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* User Growth */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>👥 User Growth</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Total users', value: analytics.totalUsers, color: 'var(--white)' },
                    { label: 'New today', value: analytics.newUsersDay, color: 'var(--green)', suffix: analytics.newUsersDay > 0 ? ' 🔥' : '' },
                    { label: 'New this week', value: analytics.newUsersWeek, color: 'var(--cyan)' },
                    { label: 'Pro members', value: analytics.proMembers, color: 'var(--gold)', suffix: ' ⚡' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}{s.suffix || ''}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Activity */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: '1rem' }}>🚀 Content Activity</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Total live projects', value: analytics.totalProjects, color: 'var(--white)' },
                    { label: 'Projects today', value: analytics.projectsDay, color: 'var(--green)' },
                    { label: 'Projects this week', value: analytics.projectsWeek, color: 'var(--cyan)' },
                    { label: 'Avg projects/user', value: analytics.avgProjectsPerUser, color: 'var(--text-mid)' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: '1rem' }}>❤️ Engagement</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Total views', value: analytics.totalViews.toLocaleString(), color: 'var(--cyan)' },
                    { label: 'Total likes', value: analytics.totalLikes.toLocaleString(), color: 'var(--maple)' },
                    { label: 'Total comments', value: analytics.totalComments.toLocaleString(), color: 'var(--text-mid)' },
                    { label: 'Total messages', value: analytics.totalMessages.toLocaleString(), color: 'var(--violet)' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>🔄 Retention</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Multi-project users', value: analytics.multiProjectUserCount, color: 'var(--green)', desc: 'Submitted 2+ projects' },
                    { label: 'Accounts 30d+ old', value: analytics.deadAccounts, color: 'var(--text-dim)', desc: 'Joined over 30 days ago' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>{s.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 3 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── PENDING ── */}
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

      {/* ── APPROVED ── */}
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

      {/* ── MEMBERS ── */}
      {tab === 'members' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
            <input type="text" placeholder="Search by username or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ maxWidth: 320 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--gold)' }}>{stats.pros}</span> Pro · <span style={{ color: 'var(--cyan)' }}>{stats.members}</span> total
            </div>
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
                    <select
                      value={m.role || 'member'}
                      onChange={e => changeRole(m.id, e.target.value)}
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 6, color: m.role === 'pro' ? 'var(--gold)' : m.role === 'banned' ? 'var(--maple)' : 'var(--text)' }}
                    >
                      <option value="member">Member</option>
                      <option value="pro">⚡ Pro</option>
                      <option value="banned">🚫 Banned</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REPORTS ── */}
      {tab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>🎉 No reports!</div>
          ) : reports.map(r => (
            <div key={r.id} className="card" style={{ padding: '1.25rem', borderColor: r.status === 'pending' ? 'rgba(255,63,63,0.3)' : 'var(--border)', opacity: r.status === 'reviewed' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: r.status === 'reviewed' ? 'var(--text-dim)' : 'var(--maple)', fontSize: '0.9rem' }}>⚑ {r.reason}</span>
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexDirection: 'column', alignItems: 'flex-end' }}>
                    <button onClick={() => markReportReviewed(r.id)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', color: 'var(--green)', borderColor: 'rgba(6,214,160,0.3)', whiteSpace: 'nowrap' }}>
                      ✓ Mark reviewed
                    </button>
                    <Link href={'/user/' + r.reported?.username} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap' }}>
                      View profile
                    </Link>
                    {r.reported?.id && (
                      <button onClick={() => banUser(r.reported.id)} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                        Ban user
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CERTIFICATES ── */}
      {tab === 'certs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {certRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>🎉 No pending certificate requests!</div>
          ) : certRequests.map(r => (
            <div key={r.id} className="card" style={{ padding: '1.25rem', borderColor: 'rgba(255,209,102,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--gold)', fontSize: '0.95rem' }}>🏆 {r.tier}</span>
                    <span className="badge badge-gold">Pending review</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--white)', marginBottom: 4, fontWeight: 600 }}>{r.project?.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                    by <Link href={'/user/' + r.user?.username} style={{ color: 'var(--white)', textDecoration: 'none' }}>{r.user?.username}</Link>
                    {' · '}Vibe Score: <strong style={{ color: 'var(--gold)' }}>{r.vibe_score?.toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Requested {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                  <Link href={'/projects/' + r.project?.id} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>View project</Link>
                  <button onClick={() => approveCert(r.id)} className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 14px', color: 'var(--green)', borderColor: 'rgba(6,214,160,0.3)', whiteSpace: 'nowrap' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => rejectCert(r.id)} className="btn btn-danger" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
