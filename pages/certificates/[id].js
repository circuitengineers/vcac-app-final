import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const TIERS = [
  { min: 50000, title: 'Hall of Fame Creator',  tier: 'Hall of Fame',   color: '#9b59ff', bg: '#0d0a1a', accent: '#7b3fe4' },
  { min: 15000, title: 'Master Creator',         tier: 'Master Creator', color: '#ff3f3f', bg: '#1a0a0a', accent: '#cc2020' },
  { min: 5000,  title: 'Distinguished Creator',  tier: 'Distinguished',  color: '#ffd166', bg: '#1a1500', accent: '#c9a400' },
  { min: 1500,  title: 'Recognized Creator',     tier: 'Recognized',     color: '#00e5ff', bg: '#001a1f', accent: '#00aac0' },
  { min: 300,   title: 'Rising Creator',          tier: 'Rising',         color: '#06d6a0', bg: '#001a12', accent: '#04a87d' },
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
      lines.push(line.trim()); line = words[n] + ' '
    } else { line = testLine }
  }
  lines.push(line.trim())
  const startY = y - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight))
}

function drawOfficialSeal(ctx, cx, cy, r, color) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke()
  ctx.beginPath(); ctx.arc(cx, cy, r - 8, 0, Math.PI * 2)
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke()
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = color
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate((i * Math.PI * 2) / 12)
    ctx.beginPath(); ctx.moveTo(0, -(r - 12)); ctx.lineTo(3, -(r - 20)); ctx.lineTo(-3, -(r - 20))
    ctx.closePath(); ctx.fill(); ctx.restore()
  }
  ctx.restore()
  ctx.fillStyle = color; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center'
  ctx.fillText('OFFICIAL', cx, cy + 4); ctx.fillText('VCAC', cx, cy + 17)
}

function drawCertificate(canvas, data) {
  const ctx = canvas.getContext('2d')
  const W = 1200, H = 850
  canvas.width = W; canvas.height = H
  const { tier, fullName, projectTitle, score, date } = data

  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0a0a0f'); bgGrad.addColorStop(0.5, tier.bg); bgGrad.addColorStop(1, '#0a0a0f')
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = tier.color; ctx.lineWidth = 4; ctx.strokeRect(20, 20, W - 40, H - 40)
  ctx.strokeStyle = tier.accent; ctx.lineWidth = 1; ctx.strokeRect(32, 32, W - 64, H - 64)

  const corners = [[44,44],[W-44,44],[44,H-44],[W-44,H-44]]
  const signs = [[-1,-1],[1,-1],[-1,1],[1,1]]
  corners.forEach(([cx,cy],i) => {
    ctx.strokeStyle = tier.color; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+signs[i][0]*30,cy)
    ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+signs[i][1]*30); ctx.stroke()
    ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fillStyle = tier.color; ctx.fill()
  })

  const divGrad = ctx.createLinearGradient(W/2-250,0,W/2+250,0)
  divGrad.addColorStop(0,'transparent'); divGrad.addColorStop(0.5,tier.color); divGrad.addColorStop(1,'transparent')

  // Maple leaf
  ctx.save(); ctx.translate(W/2, 100); ctx.scale(1.8,1.8); ctx.fillStyle = tier.color
  ctx.beginPath()
  ctx.moveTo(0,-20); ctx.lineTo(3,-12); ctx.lineTo(10,-14); ctx.lineTo(7,-8)
  ctx.lineTo(14,-4); ctx.lineTo(9,-2); ctx.lineTo(10,4); ctx.lineTo(4,2)
  ctx.lineTo(3,10); ctx.lineTo(0,8); ctx.lineTo(-3,10); ctx.lineTo(-4,2)
  ctx.lineTo(-10,4); ctx.lineTo(-9,-2); ctx.lineTo(-14,-4); ctx.lineTo(-7,-8)
  ctx.lineTo(-10,-14); ctx.lineTo(-3,-12); ctx.closePath(); ctx.fill(); ctx.restore()

  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 17px Arial'; ctx.textAlign = 'center'
  ctx.fillText('VIBE CODERS ASSOCIATION OF CANADA', W/2, 175)
  ctx.fillStyle = divGrad; ctx.fillRect(W/2-250,188,500,1.5)

  ctx.fillStyle = tier.color; ctx.font = 'italic 24px Georgia'; ctx.textAlign = 'center'
  ctx.fillText('Certificate of Achievement', W/2, 230)

  ctx.fillStyle = '#7070a0'; ctx.font = '15px Arial'
  ctx.fillText('This certificate is proudly awarded to', W/2, 278)

  ctx.fillStyle = '#ffffff'
  const nameWidth = ctx.measureText(fullName).width
  ctx.font = nameWidth > 900 ? 'bold 38px Georgia' : nameWidth > 600 ? 'bold 46px Georgia' : 'bold 56px Georgia'
  ctx.fillText(fullName, W/2, 355)

  const nw = ctx.measureText(fullName).width
  const lineGrad = ctx.createLinearGradient(W/2-nw/2,0,W/2+nw/2,0)
  lineGrad.addColorStop(0,'transparent'); lineGrad.addColorStop(0.5,tier.color); lineGrad.addColorStop(1,'transparent')
  ctx.fillStyle = lineGrad; ctx.fillRect(W/2-nw/2,368,nw,2)

  ctx.fillStyle = '#7070a0'; ctx.font = '15px Arial'; ctx.textAlign = 'center'
  ctx.fillText('for the outstanding vibe coded project', W/2, 410)

  ctx.fillStyle = '#e0e0f0'
  const titleText = '"' + projectTitle + '"'
  const titleWidth = ctx.measureText(titleText).width
  ctx.font = titleWidth > 800 ? 'bold 22px Georgia' : 'bold 30px Georgia'
  wrapText(ctx, titleText, W/2, 455, 800, 36)

  const badgeY = 520
  ctx.fillStyle = tier.bg
  ctx.beginPath(); ctx.roundRect(W/2-220,badgeY,440,54,6); ctx.fill()
  ctx.strokeStyle = tier.color; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.fillStyle = tier.color; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'
  ctx.fillText('VCAC ' + tier.title.toUpperCase(), W/2, badgeY+34)

  ctx.fillStyle = '#7070a0'; ctx.font = '13px Arial'
  ctx.fillText('VIBE SCORE: ' + score.toLocaleString(), W/2, 598)

  // Date
  ctx.fillStyle = '#7070a0'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.letterSpacing = '2px'
  ctx.fillText('DATE ISSUED', 230, 668)
  ctx.fillStyle = '#ffffff'; ctx.font = '15px Georgia'; ctx.letterSpacing = '0px'
  ctx.fillText(date, 230, 690)
  const sg1 = ctx.createLinearGradient(120,0,340,0)
  sg1.addColorStop(0,'transparent'); sg1.addColorStop(0.5,tier.accent); sg1.addColorStop(1,'transparent')
  ctx.fillStyle = sg1; ctx.fillRect(120,705,220,1)

  drawOfficialSeal(ctx, W/2, 685, 52, tier.color)

  ctx.fillStyle = '#7070a0'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.letterSpacing = '2px'
  ctx.fillText('PRESIDENT, VCAC', W-230, 668)
  ctx.fillStyle = '#ffffff'; ctx.font = 'italic 18px Georgia'; ctx.letterSpacing = '0px'
  ctx.fillText('president_vcac', W-230, 690)
  const sg2 = ctx.createLinearGradient(W-340,0,W-120,0)
  sg2.addColorStop(0,'transparent'); sg2.addColorStop(0.5,tier.accent); sg2.addColorStop(1,'transparent')
  ctx.fillStyle = sg2; ctx.fillRect(W-340,705,220,1)

  ctx.fillStyle = '#2a2a3f'; ctx.font = '11px Arial'; ctx.textAlign = 'center'; ctx.letterSpacing = '0.5px'
  ctx.fillText('Vibe Coders Association of Canada  ·  vcac-app.vercel.app  ·  ' + new Date().getFullYear(), W/2, 810)
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
  const [isOwner, setIsOwner] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [certRequest, setCertRequest] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  useEffect(() => {
    if (project && tier && canvasRef.current && fullName && !rendered && certRequest?.status === 'approved') {
      drawCertificate(canvasRef.current, {
        tier, fullName,
        projectTitle: project.title,
        score,
        date: new Date(certRequest.reviewed_at || Date.now()).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
      })
      setRendered(true)
    }
  }, [project, tier, fullName, rendered, certRequest])

  async function fetchData() {
    const { data: { session } } = await supabase.auth.getSession()
    const { data: proj } = await supabase.from('projects').select('*, profiles(username, role, full_name)').eq('id', id).single()
    if (!proj) { setLoading(false); return }
    setProject(proj)
    setProfile(proj.profiles)
    const s = vibeScore(proj.runs, proj.likes)
    setScore(s)
    const t = getTier(s)
    setTier(t)

    if (session && proj.user_id === session.user.id) setIsOwner(true)

    if (proj.profiles?.full_name) {
      setFullName(proj.profiles.full_name)
      setNameInput(proj.profiles.full_name)
    }

    if (t) {
      const { data: req } = await supabase.from('certificate_requests').select('*').eq('project_id', id).eq('tier', t.tier).single()
      setCertRequest(req || null)
      if (req?.status === 'approved' && !proj.profiles?.full_name) setShowNameModal(true)
    }
    setLoading(false)
  }

  async function confirmName() {
    if (!nameInput.trim()) return
    setFullName(nameInput.trim())
    const { data: { session } } = await supabase.auth.getSession()
    if (session) await supabase.from('profiles').update({ full_name: nameInput.trim() }).eq('id', session.user.id)
    setShowNameModal(false)
    setRendered(false)
  }

  async function requestCertificate() {
    if (!isOwner) return
    setRequesting(true)
    const { data: { session } } = await supabase.auth.getSession()
    await supabase.from('certificate_requests').insert({
      project_id: id,
      user_id: session.user.id,
      tier: tier.tier,
      vibe_score: score,
      status: 'pending'
    })
    setCertRequest({ status: 'pending' })
    setRequesting(false)
    setRequestSent(true)
  }

  function downloadCertificate() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'VCAC-Certificate-' + project.title.replace(/\s+/g, '-') + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>Loading...</div>
  if (!project) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>Project not found</div>

  const nextTier = tier ? TIERS[TIERS.indexOf(tier) - 1] : TIERS[TIERS.length - 1]
  const pointsNeeded = nextTier ? nextTier.min - score : 0

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>

      {showNameModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'var(--white)', marginBottom: '0.5rem' }}>Your name on the certificate</h2>
            <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>Enter your full name exactly as you want it on your official VCAC certificate.</p>
            <label>Full name</label>
            <input type="text" placeholder="e.g. Akshaj Chadha" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmName()} style={{ marginBottom: '1.25rem' }} autoFocus />
            <button onClick={confirmName} className="btn btn-primary" disabled={!nameInput.trim()} style={{ width: '100%', padding: '12px' }}>Generate Certificate</button>
          </div>
        </div>
      )}

      <Link href={'/projects/' + id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '2rem' }}>← Back to project</Link>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Official VCAC</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.2rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>Certificate of Achievement</h1>
        <p style={{ color: 'var(--text-mid)', marginTop: 8 }}>For <strong style={{ color: 'var(--white)' }}>{project.title}</strong></p>
      </div>

      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Views', value: (project.runs||0).toLocaleString(), color: 'var(--cyan)' },
          { label: 'Likes', value: (project.likes||0).toLocaleString(), color: 'var(--maple)' },
          { label: 'Vibe Score', value: score.toLocaleString(), color: tier ? tier.color : 'var(--text-dim)' },
          { label: 'Tier', value: tier ? tier.tier : 'Not earned', color: tier ? tier.color : 'var(--text-dim)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.8rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {tier ? (
        <>
          {/* Certificate request status */}
          {isOwner && !certRequest && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(255,209,102,0.3)', background: 'rgba(255,209,102,0.05)' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.75rem' }}>🏆 You qualify for a certificate!</h3>
              <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Your project has reached the <strong style={{ color: 'var(--white)' }}>VCAC {tier.title}</strong> tier with a Vibe Score of {score.toLocaleString()}. Submit a certificate request — the VCAC president will review it to ensure the score is genuine, then approve your official certificate.
              </p>
              <button onClick={requestCertificate} disabled={requesting} className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
                {requesting ? 'Submitting...' : '📋 Request certificate review'}
              </button>
            </div>
          )}

          {certRequest?.status === 'pending' && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(255,209,102,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--gold)' }}>Certificate request pending</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4 }}>The VCAC president is reviewing your request. You'll be able to download your certificate once approved.</div>
                </div>
              </div>
            </div>
          )}

          {certRequest?.status === 'rejected' && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(255,63,63,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>❌</span>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--maple)' }}>Certificate request not approved</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4 }}>Contact the president for more information.</div>
                </div>
              </div>
            </div>
          )}

          {certRequest?.status === 'approved' && (
            <>
              <div style={{ background: 'var(--panel)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {isOwner ? (
                  <>
                    <button onClick={downloadCertificate} className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 32px' }}>⬇️ Download Certificate (PNG)</button>
                    <button onClick={() => setShowNameModal(true)} className="btn btn-ghost" style={{ fontSize: '0.9rem', padding: '13px 20px' }}>✏️ Change name</button>
                  </>
                ) : (
                  <div style={{ padding: '1rem', background: 'var(--panel)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-dim)' }}>
                    🔒 Only the project owner can download this certificate
                  </div>
                )}
              </div>
            </>
          )}

          {nextTier && (
            <div className="card" style={{ padding: '1.25rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 6 }}>Next tier: <strong style={{ color: nextTier.color }}>VCAC {nextTier.title}</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>
                Need <strong style={{ color: 'var(--white)' }}>{(nextTier.min - score).toLocaleString()}</strong> more Vibe Score points
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 12, marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.75rem' }}>Not yet earned</h2>
          <p style={{ color: 'var(--text-mid)', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.8 }}>
            Needs a Vibe Score of at least 300 for the first tier. Currently at <strong style={{ color: 'var(--white)' }}>{score}</strong>.
          </p>
          <div className="card" style={{ padding: '1rem', maxWidth: 300, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Formula</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.8, fontFamily: 'DM Mono' }}>views × 1{'\n'}likes × 10{'\n'}score = views + (likes × 10)</div>
          </div>
        </div>
      )}

      {/* All tiers */}
      <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '1rem', fontSize: '1.1rem' }}>All certificate tiers</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[...TIERS].reverse().map(t => (
          <div key={t.tier} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderColor: score >= t.min ? t.color + '44' : undefined, opacity: score >= t.min ? 1 : 0.45 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: score >= t.min ? 'var(--white)' : 'var(--text-dim)', fontSize: '0.9rem' }}>VCAC {t.title}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'DM Mono' }}>{t.min.toLocaleString()}+ pts</div>
            {score >= t.min && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Qualified</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
