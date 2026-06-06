import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const TIERS = [
  { min: 15000, title: 'Hall of Fame Creator',  tier: 'Hall of Fame',   color: '#9b59ff', bg: '#0d0a1a', accent: '#7b3fe4' },
  { min: 5000,  title: 'Master Creator',         tier: 'Master Creator', color: '#ff3f3f', bg: '#1a0a0a', accent: '#cc2020' },
  { min: 1500,  title: 'Distinguished Creator',  tier: 'Distinguished',  color: '#ffd166', bg: '#1a1500', accent: '#c9a400' },
  { min: 500,   title: 'Recognized Creator',     tier: 'Recognized',     color: '#00e5ff', bg: '#001a1f', accent: '#00aac0' },
  { min: 100,   title: 'Rising Creator',         tier: 'Rising',         color: '#06d6a0', bg: '#001a12', accent: '#04a87d' },
]

function getTier(score) { return TIERS.find(t => score >= t.min) || null }
function vibeScore(views, likes) { return (views || 0) + (likes || 0) * 10 }

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let lines = []
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      lines.push(line.trim())
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line.trim())
  const totalH = lines.length * lineHeight
  const startY = y - (totalH / 2) + lineHeight / 2
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight))
  return lines.length
}

function drawOfficialSeal(ctx, cx, cy, r, color) {
  // Outer circle
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.stroke()

  // Inner circle
  ctx.beginPath()
  ctx.arc(cx, cy, r - 8, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()

  // Star points
  ctx.save()
  ctx.translate(cx, cy)
  ctx.fillStyle = color
  for (let i = 0; i < 12; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / 12)
    ctx.beginPath()
    ctx.moveTo(0, -(r - 12))
    ctx.lineTo(3, -(r - 20))
    ctx.lineTo(-3, -(r - 20))
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()

  // Center maple leaf shape
  ctx.save()
  ctx.translate(cx, cy - 8)
  ctx.fillStyle = color
  ctx.font = 'bold 24px serif'
  ctx.textAlign = 'center'
  ctx.fillText('*', 0, 8)
  ctx.restore()

  // OFFICIAL text curved
  ctx.fillStyle = color
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('OFFICIAL', cx, cy + 6)
  ctx.fillText('VCAC', cx, cy + 18)
}

function drawCertificate(canvas, data) {
  const ctx = canvas.getContext('2d')
  const W = 1200
  const H = 850
  canvas.width = W
  canvas.height = H

  const { tier, fullName, projectTitle, score, date } = data

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0a0a0f')
  bgGrad.addColorStop(0.5, tier.bg)
  bgGrad.addColorStop(1, '#0a0a0f')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Outer border
  ctx.strokeStyle = tier.color
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, W - 40, H - 40)

  // Inner border
  ctx.strokeStyle = tier.accent
  ctx.lineWidth = 1
  ctx.strokeRect(32, 32, W - 64, H - 64)

  // Corner ornaments
  const corners = [[44, 44], [W - 44, 44], [44, H - 44], [W - 44, H - 44]]
  const signs = [[-1,-1],[1,-1],[-1,1],[1,1]]
  corners.forEach(([cx, cy], i) => {
    ctx.strokeStyle = tier.color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + signs[i][0] * 30, cy)
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx, cy + signs[i][1] * 30)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fillStyle = tier.color
    ctx.fill()
  })

  // Header band
  const headerGrad = ctx.createLinearGradient(0, 40, 0, 180)
  headerGrad.addColorStop(0, tier.bg + 'cc')
  headerGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = headerGrad
  ctx.fillRect(33, 33, W - 66, 160)

  // Top decorative line
  ctx.fillStyle = tier.color
  ctx.fillRect(100, 55, W - 200, 1.5)
  ctx.fillRect(100, H - 57, W - 200, 1.5)

  // Maple leaf - drawn properly
  ctx.save()
  ctx.translate(W / 2, 100)
  ctx.scale(1.8, 1.8)
  ctx.fillStyle = tier.color
  // Draw maple leaf path
  ctx.beginPath()
  ctx.moveTo(0, -20)
  ctx.lineTo(3, -12)
  ctx.lineTo(10, -14)
  ctx.lineTo(7, -8)
  ctx.lineTo(14, -4)
  ctx.lineTo(9, -2)
  ctx.lineTo(10, 4)
  ctx.lineTo(4, 2)
  ctx.lineTo(3, 10)
  ctx.lineTo(0, 8)
  ctx.lineTo(-3, 10)
  ctx.lineTo(-4, 2)
  ctx.lineTo(-10, 4)
  ctx.lineTo(-9, -2)
  ctx.lineTo(-14, -4)
  ctx.lineTo(-7, -8)
  ctx.lineTo(-10, -14)
  ctx.lineTo(-3, -12)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Organization name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 17px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('VIBE CODERS ASSOCIATION OF CANADA', W / 2, 175)

  // Divider
  const divGrad = ctx.createLinearGradient(W/2 - 250, 0, W/2 + 250, 0)
  divGrad.addColorStop(0, 'transparent')
  divGrad.addColorStop(0.5, tier.color)
  divGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = divGrad
  ctx.fillRect(W/2 - 250, 188, 500, 1.5)

  // Certificate of Achievement
  ctx.fillStyle = tier.color
  ctx.font = 'italic 24px Georgia'
  ctx.textAlign = 'center'
  ctx.fillText('Certificate of Achievement', W / 2, 230)

  // This certifies
  ctx.fillStyle = '#7070a0'
  ctx.font = '15px Arial'
  ctx.fillText('This certificate is proudly awarded to', W / 2, 278)

  // Full name - big
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 56px Georgia'
  ctx.textAlign = 'center'
  // Scale down if name too long
  const nameWidth = ctx.measureText(fullName).width
  if (nameWidth > 900) {
    ctx.font = 'bold 38px Georgia'
  } else if (nameWidth > 600) {
    ctx.font = 'bold 46px Georgia'
  }
  ctx.fillText(fullName, W / 2, 355)

  // Name underline
  const nw = ctx.measureText(fullName).width
  const lineGrad = ctx.createLinearGradient(W/2 - nw/2, 0, W/2 + nw/2, 0)
  lineGrad.addColorStop(0, 'transparent')
  lineGrad.addColorStop(0.5, tier.color)
  lineGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = lineGrad
  ctx.fillRect(W/2 - nw/2, 368, nw, 2)

  // "for the outstanding vibe coded project"
  ctx.fillStyle = '#7070a0'
  ctx.font = '15px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('for the outstanding vibe coded project', W / 2, 410)

  // Project title - with text wrapping
  ctx.fillStyle = '#e0e0f0'
  ctx.font = 'bold 30px Georgia'
  const maxTitleWidth = 800
  const titleWidth = ctx.measureText('"' + projectTitle + '"').width
  if (titleWidth > maxTitleWidth) ctx.font = 'bold 22px Georgia'
  ctx.textAlign = 'center'
  wrapText(ctx, '"' + projectTitle + '"', W / 2, 455, maxTitleWidth, 36)

  // Tier badge
  const badgeY = 520
  ctx.fillStyle = tier.bg
  ctx.beginPath()
  ctx.roundRect(W/2 - 220, badgeY, 440, 54, 6)
  ctx.fill()
  ctx.strokeStyle = tier.color
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = tier.color
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '3px'
  ctx.fillText('VCAC ' + tier.title.toUpperCase(), W / 2, badgeY + 34)

  // Vibe score
  ctx.fillStyle = '#7070a0'
  ctx.font = '13px Arial'
  ctx.letterSpacing = '1px'
  ctx.fillText('VIBE SCORE: ' + score.toLocaleString(), W / 2, 598)

  // Bottom section
  // Date (left)
  ctx.fillStyle = '#7070a0'
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2px'
  ctx.fillText('DATE ISSUED', 230, 668)
  ctx.fillStyle = '#ffffff'
  ctx.font = '15px Georgia'
  ctx.letterSpacing = '0px'
  ctx.fillText(date, 230, 690)
  // signature line
  const sigGrad1 = ctx.createLinearGradient(120, 0, 340, 0)
  sigGrad1.addColorStop(0, 'transparent')
  sigGrad1.addColorStop(0.5, tier.accent)
  sigGrad1.addColorStop(1, 'transparent')
  ctx.fillStyle = sigGrad1
  ctx.fillRect(120, 705, 220, 1)

  // Official seal (center)
  drawOfficialSeal(ctx, W / 2, 685, 52, tier.color)

  // President signature (right)
  ctx.fillStyle = '#7070a0'
  ctx.font = 'bold 11px Arial'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2px'
  ctx.fillText('PRESIDENT, VCAC', W - 230, 668)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 18px Georgia'
  ctx.letterSpacing = '0px'
  ctx.fillText('president_vcac', W - 230, 690)
  const sigGrad2 = ctx.createLinearGradient(W-340, 0, W-120, 0)
  sigGrad2.addColorStop(0, 'transparent')
  sigGrad2.addColorStop(0.5, tier.accent)
  sigGrad2.addColorStop(1, 'transparent')
  ctx.fillStyle = sigGrad2
  ctx.fillRect(W - 340, 705, 220, 1)

  // Fine print
  ctx.fillStyle = '#2a2a3f'
  ctx.font = '11px Arial'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '0.5px'
  ctx.fillText('Vibe Coders Association of Canada  ·  vcac-app.vercel.app  ·  ' + new Date().getFullYear(), W / 2, 810)
}

export default function CertificatePage() {
  const router = useRouter()
  const { id } = router.query
  const canvasRef = useRef(null)
  const [project, setProject] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tier, setTier] = useState(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rendered, setRendered] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  useEffect(() => {
    if (project && tier && canvasRef.current && fullName && !rendered) {
      drawCertificate(canvasRef.current, {
        tier, fullName,
        projectTitle: project.title,
        score,
        date: new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
      })
      setRendered(true)
    }
  }, [project, tier, fullName, rendered])

  async function fetchData() {
    const { data: proj } = await supabase.from('projects').select('*, profiles(username, role, full_name)').eq('id', id).single()
    if (!proj) { setLoading(false); return }
    setProject(proj)
    setProfile(proj.profiles)
    const s = vibeScore(proj.runs, proj.likes)
    setScore(s)
    setTier(getTier(s))
    // Pre-fill name if already saved
    if (proj.profiles?.full_name) {
      setFullName(proj.profiles.full_name)
      setNameInput(proj.profiles.full_name)
    } else {
      setShowNameModal(true)
    }
    setLoading(false)
  }

  async function confirmName() {
    if (!nameInput.trim()) return
    setFullName(nameInput.trim())
    // Save to profile
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('profiles').update({ full_name: nameInput.trim() }).eq('id', session.user.id)
    }
    setShowNameModal(false)
    setRendered(false)
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

      {/* Name modal */}
      {showNameModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'var(--white)', marginBottom: '0.5rem' }}>Your name on the certificate</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Enter your full name exactly as you want it to appear on your official VCAC certificate. This will be saved to your profile.
            </p>
            <label>Full name</label>
            <input
              type="text"
              placeholder="e.g. Akshaj Chadha"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmName()}
              style={{ marginBottom: '1.25rem' }}
              autoFocus
            />
            <button onClick={confirmName} className="btn btn-primary" disabled={!nameInput.trim()} style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>
              Generate Certificate
            </button>
          </div>
        </div>
      )}

      <Link href={'/projects/' + id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>
        ← Back to project
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Official VCAC</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Certificate of Achievement</h1>
        <p style={{ color: 'var(--text-mid)', marginTop: 8 }}>For <strong style={{ color: 'var(--white)' }}>{project.title}</strong></p>
      </div>

      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Views', value: (project.runs || 0).toLocaleString(), color: 'var(--cyan)' },
          { label: 'Likes', value: (project.likes || 0).toLocaleString(), color: 'var(--maple)' },
          { label: 'Vibe Score', value: score.toLocaleString(), color: tier ? tier.color : 'var(--text-dim)' },
          { label: 'Certificate', value: tier ? tier.tier : 'Not earned', color: tier ? tier.color : 'var(--text-dim)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {tier ? (
        <>
          <div style={{ background: 'var(--panel)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={downloadCertificate} className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 32px' }}>
              ⬇️ Download Certificate (PNG)
            </button>
            <button onClick={() => { setShowNameModal(true) }} className="btn btn-ghost" style={{ fontSize: '0.9rem', padding: '13px 20px' }}>
              ✏️ Change name
            </button>
          </div>

          {nextTier && (
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 6 }}>
                Next tier: <strong style={{ color: nextTier.color }}>VCAC {nextTier.title}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>
                Need <strong style={{ color: 'var(--white)' }}>{pointsNeeded.toLocaleString()}</strong> more Vibe Score
                ({Math.ceil(pointsNeeded / 10)} more likes or {pointsNeeded} more views)
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12, marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>Not yet earned</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
            Needs a Vibe Score of at least 100. Currently at <strong style={{ color: 'var(--white)' }}>{score}</strong> — need <strong style={{ color: 'var(--white)' }}>{100 - score}</strong> more points.
          </p>
          <div className="card" style={{ padding: '1rem', maxWidth: 300, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vibe Score formula</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.8, fontFamily: 'DM Mono' }}>
              views × 1<br />
              likes × 10<br />
              score = views + (likes × 10)
            </div>
          </div>
        </div>
      )}

      {/* All tiers */}
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1rem', fontSize: '1.1rem' }}>All certificate tiers</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {[...TIERS].reverse().map(t => (
          <div key={t.tier} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: score >= t.min ? t.color : undefined, opacity: score >= t.min ? 1 : 0.45 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: score >= t.min ? 'var(--white)' : 'var(--text-dim)', fontSize: '0.9rem' }}>VCAC {t.title}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>{t.min.toLocaleString()}+ pts</div>
            {score >= t.min && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Earned</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
