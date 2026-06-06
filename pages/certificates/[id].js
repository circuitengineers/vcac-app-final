import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const TIERS = [
  { min: 15000, title: 'Hall of Fame Creator',     tier: 'Hall of Fame',    color: '#9b59ff', bg: '#0d0a1a', accent: '#7b3fe4' },
  { min: 5000,  title: 'Master Creator',            tier: 'Master Creator',  color: '#ff3f3f', bg: '#1a0a0a', accent: '#cc2020' },
  { min: 1500,  title: 'Distinguished Creator',     tier: 'Distinguished',   color: '#ffd166', bg: '#1a1500', accent: '#c9a400' },
  { min: 500,   title: 'Recognized Creator',        tier: 'Recognized',      color: '#00e5ff', bg: '#001a1f', accent: '#00aac0' },
  { min: 100,   title: 'Rising Creator',            tier: 'Rising',          color: '#06d6a0', bg: '#001a12', accent: '#04a87d' },
]

function getTier(score) {
  return TIERS.find(t => score >= t.min) || null
}

function vibeScore(views, likes) {
  return (views || 0) + (likes || 0) * 10
}

function drawCertificate(canvas, data) {
  const ctx = canvas.getContext('2d')
  const W = 1200
  const H = 850
  canvas.width = W
  canvas.height = H

  const { tier, username, projectTitle, score, date } = data

  // Background
  ctx.fillStyle = '#0a0a0f'
  ctx.fillRect(0, 0, W, H)

  // Outer border
  ctx.strokeStyle = tier.color
  ctx.lineWidth = 3
  ctx.strokeRect(24, 24, W - 48, H - 48)

  // Inner border
  ctx.strokeStyle = tier.accent
  ctx.lineWidth = 1
  ctx.strokeRect(36, 36, W - 72, H - 72)

  // Corner decorations
  const corners = [[48, 48], [W - 48, 48], [48, H - 48], [W - 48, H - 48]]
  corners.forEach(([x, y]) => {
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = tier.color
    ctx.fill()
  })

  // Top decorative line
  ctx.fillStyle = tier.color
  ctx.fillRect(120, 60, W - 240, 2)
  ctx.fillRect(120, H - 62, W - 240, 2)

  // Header area background
  const grad = ctx.createLinearGradient(0, 0, 0, 200)
  grad.addColorStop(0, tier.bg)
  grad.addColorStop(1, '#0a0a0f')
  ctx.fillStyle = grad
  ctx.fillRect(37, 37, W - 74, 200)

  // VCAC Logo (maple leaf shape approximation)
  ctx.save()
  ctx.translate(W / 2, 120)
  ctx.fillStyle = tier.color
  ctx.font = 'bold 48px serif'
  ctx.textAlign = 'center'
  ctx.fillText('🍁', 0, 16)
  ctx.restore()

  // Organization name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 18px Arial'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '8px'
  ctx.fillText('VIBE CODERS ASSOCIATION OF CANADA', W / 2, 195)

  // Decorative divider
  ctx.fillStyle = tier.color
  ctx.fillRect(W / 2 - 200, 210, 400, 1)

  // "Certificate of Achievement"
  ctx.fillStyle = tier.color
  ctx.font = 'italic 22px Georgia'
  ctx.textAlign = 'center'
  ctx.fillText('Certificate of Achievement', W / 2, 258)

  // "This certifies that"
  ctx.fillStyle = '#a0a0c0'
  ctx.font = '16px Arial'
  ctx.fillText('This certificate is proudly awarded to', W / 2, 310)

  // Username - big
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px Georgia'
  ctx.fillText(username, W / 2, 385)

  // Underline username
  const nameWidth = ctx.measureText(username).width
  ctx.fillStyle = tier.color
  ctx.fillRect(W / 2 - nameWidth / 2, 395, nameWidth, 2)

  // "for the project"
  ctx.fillStyle = '#a0a0c0'
  ctx.font = '16px Arial'
  ctx.fillText('for the outstanding vibe coded project', W / 2, 440)

  // Project title
  ctx.fillStyle = '#e0e0f0'
  ctx.font = 'bold 28px Georgia'
  ctx.fillText('"' + projectTitle + '"', W / 2, 490)

  // Achievement tier badge area
  ctx.fillStyle = tier.bg
  ctx.beginPath()
  ctx.roundRect(W / 2 - 200, 520, 400, 60, 8)
  ctx.fill()
  ctx.strokeStyle = tier.color
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Tier title
  ctx.fillStyle = tier.color
  ctx.font = 'bold 22px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('VCAC ' + tier.title.toUpperCase(), W / 2, 558)

  // Vibe score
  ctx.fillStyle = '#a0a0c0'
  ctx.font = '14px Arial'
  ctx.fillText('Vibe Score: ' + score.toLocaleString(), W / 2, 610)

  // Bottom section - signature area
  // Left: Date
  ctx.fillStyle = '#a0a0c0'
  ctx.font = '13px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('DATE ISSUED', 260, 680)
  ctx.fillStyle = '#ffffff'
  ctx.font = '16px Georgia'
  ctx.fillText(date, 260, 705)
  ctx.fillStyle = '#a0a0c0'
  ctx.fillRect(160, 720, 200, 1)

  // Center: Official seal
  ctx.beginPath()
  ctx.arc(W / 2, 700, 50, 0, Math.PI * 2)
  ctx.fillStyle = tier.bg
  ctx.fill()
  ctx.strokeStyle = tier.color
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = tier.color
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('OFFICIAL', W / 2, 694)
  ctx.fillText('VCAC SEAL', W / 2, 710)

  // Right: President signature
  ctx.fillStyle = '#a0a0c0'
  ctx.font = '13px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('PRESIDENT, VCAC', W - 260, 680)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 18px Georgia'
  ctx.fillText('president_vcac', W - 260, 705)
  ctx.fillStyle = '#a0a0c0'
  ctx.fillRect(W - 360, 720, 200, 1)

  // Bottom fine print
  ctx.fillStyle = '#3a3a55'
  ctx.font = '11px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Vibe Coders Association of Canada · vcac-app.vercel.app · ' + new Date().getFullYear(), W / 2, 800)
}

export default function CertificatePage() {
  const router = useRouter()
  const { id } = router.query
  const canvasRef = useRef(null)
  const [project, setProject] = useState(null)
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [tier, setTier] = useState(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchData()
  }, [id])

  useEffect(() => {
    if (project && tier && canvasRef.current && !rendered) {
      drawCertificate(canvasRef.current, {
        tier,
        username: profile?.username || 'Vibe Coder',
        projectTitle: project.title,
        score,
        date: new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
      })
      setRendered(true)
    }
  }, [project, tier, rendered])

  async function fetchData() {
    const { data: proj } = await supabase.from('projects').select('*, profiles(username, role)').eq('id', id).single()
    if (!proj) { setLoading(false); return }
    setProject(proj)
    setProfile(proj.profiles)
    const s = vibeScore(proj.runs, proj.likes)
    setScore(s)
    setTier(getTier(s))
    setLoading(false)
  }

  function downloadCertificate() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'VCAC-Certificate-' + project.title.replace(/\s+/g, '-') + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>
      Generating certificate...
    </div>
  )

  if (!project) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
      Project not found
    </div>
  )

  const nextTier = tier ? TIERS[TIERS.indexOf(tier) - 1] : TIERS[TIERS.length - 1]
  const pointsNeeded = nextTier ? nextTier.min - score : 0

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
      <Link href={'/projects/' + id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        ← Back to project
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Official VCAC</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Certificate of Achievement</h1>
        <p style={{ color: 'var(--text-mid)', marginTop: 8 }}>For <strong style={{ color: 'var(--white)' }}>{project.title}</strong> by {profile?.username}</p>
      </div>

      {/* Score card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Views', value: project.runs || 0, color: 'var(--cyan)' },
          { label: 'Likes', value: project.likes || 0, color: 'var(--maple)' },
          { label: 'Vibe Score', value: score.toLocaleString(), color: tier ? tier.color : 'var(--text-dim)' },
          { label: 'Certificate Tier', value: tier ? tier.tier : 'Not yet earned', color: tier ? tier.color : 'var(--text-dim)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {tier ? (
        <>
          {/* Canvas certificate */}
          <div style={{ background: 'var(--panel)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '2rem' }}>
            <button onClick={downloadCertificate} className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 32px' }}>
              ⬇️ Download Certificate (PNG)
            </button>
            <Link href={'/projects/' + id} className="btn btn-ghost" style={{ fontSize: '1rem', padding: '13px 24px' }}>
              Back to project
            </Link>
          </div>

          {nextTier && (
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 8 }}>
                Next tier: <strong style={{ color: nextTier.color }}>VCAC {nextTier.title}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>
                Need <strong style={{ color: 'var(--white)' }}>{pointsNeeded.toLocaleString()}</strong> more Vibe Score points
                ({Math.ceil(pointsNeeded / 10)} more likes or {pointsNeeded} more views)
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>Not yet earned</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
            This project needs a Vibe Score of at least 100 to earn its first certificate.
            Currently at <strong style={{ color: 'var(--white)' }}>{score}</strong> — need <strong style={{ color: 'var(--white)' }}>{100 - score}</strong> more points.
          </p>
          <div className="card" style={{ padding: '1rem', maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How Vibe Score works</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
              1 view = 1 point<br />
              1 like = 10 points<br />
              Score = views + (likes × 10)
            </div>
          </div>
        </div>
      )}

      {/* All tiers */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>All certificate tiers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...TIERS].reverse().map(t => (
            <div key={t.tier} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: score >= t.min ? t.color : undefined, opacity: score >= t.min ? 1 : 0.5 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: score >= t.min ? 'var(--white)' : 'var(--text-dim)' }}>VCAC {t.title}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>
                {t.min.toLocaleString()}+ points
              </div>
              {score >= t.min && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Earned</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
