import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

const TIERS = [
  { min: 15000, title: 'Hall of Fame Creator',  tier: 'Hall of Fame',   color: '#9b59ff' },
  { min: 5000,  title: 'Master Creator',         tier: 'Master Creator', color: '#ff3f3f' },
  { min: 1500,  title: 'Distinguished Creator',  tier: 'Distinguished',  color: '#ffd166' },
  { min: 500,   title: 'Recognized Creator',     tier: 'Recognized',     color: '#00e5ff' },
  { min: 100,   title: 'Rising Creator',         tier: 'Rising',         color: '#06d6a0' },
]

function vibeScore(views, likes) { return (views || 0) + (likes || 0) * 10 }
function getTier(score) { return TIERS.find(t => score >= t.min) || null }

export default function MyCertificates() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      const { data: projs } = await supabase.from('projects').select('*').eq('user_id', session.user.id).eq('status', 'approved').order('likes', { ascending: false })
      setProjects(projs || [])
      const total = (projs || []).reduce((sum, p) => sum + vibeScore(p.runs, p.likes), 0)
      setTotalScore(total)
      setLoading(false)
    })
  }, [])

  const earnedProjects = projects.filter(p => vibeScore(p.runs, p.likes) >= 100)
  const topTier = getTier(totalScore)

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>
      Loading certificates...
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Your achievements</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>My Certificates</h1>
        <p style={{ color: 'var(--text-mid)', marginTop: 8, fontSize: '0.9rem' }}>Your official VCAC certificates earned across all projects.</p>
      </div>

      {/* Total score card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: topTier ? 'linear-gradient(135deg, ' + topTier.color + '10, var(--surface))' : undefined, borderColor: topTier ? topTier.color + '44' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 8 }}>Total Vibe Score</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '3rem', color: topTier ? topTier.color : 'var(--white)', lineHeight: 1 }}>{totalScore.toLocaleString()}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 6 }}>
              across {projects.length} approved project{projects.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {topTier ? (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: 8 }}>Highest tier</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: topTier.color }}>VCAC {topTier.title}</div>
              </>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No tier yet — need 100 pts</div>
            )}
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.5rem', color: 'var(--cyan)' }}>{projects.reduce((s, p) => s + (p.runs || 0), 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>Total views</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.5rem', color: 'var(--maple)' }}>{projects.reduce((s, p) => s + (p.likes || 0), 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>Total likes</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.5rem', color: 'var(--gold)' }}>{earnedProjects.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>Certificates earned</div>
          </div>
        </div>
      </div>

      {/* Earned certificates */}
      {earnedProjects.length > 0 ? (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: 'var(--white)', marginBottom: '1.25rem' }}>
            Earned certificates ({earnedProjects.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {earnedProjects.map(p => {
              const s = vibeScore(p.runs, p.likes)
              const t = getTier(s)
              return (
                <div key={p.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', borderColor: t ? t.color + '44' : undefined }}>
                  {/* Tier indicator */}
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: t ? t.color + '18' : 'var(--panel)', border: '2px solid ' + (t ? t.color : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: t ? t.color : 'var(--text-dim)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', fontSize: '1rem', marginBottom: 4 }}>{p.title}</div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: t ? t.color : 'var(--text-dim)', fontWeight: 600 }}>
                        {t ? 'VCAC ' + t.title : 'No tier'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Vibe Score: {s.toLocaleString()}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>👁 {p.runs || 0} · ♥ {p.likes || 0}</span>
                    </div>
                  </div>
                  <Link href={'/certificates/' + p.id} className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '8px 16px', flexShrink: 0, borderColor: t ? t.color + '44' : undefined, color: t ? t.color : undefined }}>
                    🏆 View & Download
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12, marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>No certificates yet</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
            Get your projects to a Vibe Score of 100+ to earn your first certificate. Share your projects and get likes!
          </p>
          <Link href="/submit" className="btn btn-primary">Submit a project</Link>
        </div>
      )}

      {/* Projects not yet earning */}
      {projects.filter(p => vibeScore(p.runs, p.likes) < 100).length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-mid)', marginBottom: '1rem' }}>In progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.filter(p => vibeScore(p.runs, p.likes) < 100).map(p => {
              const s = vibeScore(p.runs, p.likes)
              const pct = Math.min((s / 100) * 100, 100)
              return (
                <div key={p.id} className="card" style={{ padding: '1.25rem', opacity: 0.7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.9rem' }}>{p.title}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>{s} / 100 pts</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--panel)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct + '%', background: 'var(--green)', borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>{100 - s} more points needed for VCAC Rising Creator</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All tiers reference */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1rem', fontSize: '1rem' }}>Certificate tiers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[...TIERS].reverse().map(t => (
            <div key={t.tier} className="card" style={{ padding: '1rem', borderColor: totalScore >= t.min ? t.color + '55' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: totalScore >= t.min ? t.color : 'var(--text-dim)' }}>
                  {totalScore >= t.min ? '✓ ' : ''}{t.tier}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>{t.min.toLocaleString()}+ pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
