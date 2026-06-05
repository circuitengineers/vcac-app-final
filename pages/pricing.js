import Link from 'next/link'

export default function Pricing() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Membership</div>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.8rem', color: 'var(--white)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>Simple pricing</h1>
      <p style={{ color: 'var(--text-mid)', fontSize: '1rem', maxWidth: 480, margin: '0 auto 3rem', fontWeight: 300 }}>
        Free to browse, submit, and get discovered. Upgrade to Pro to put your projects in front of everyone.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left', marginBottom: '4rem' }}>

        {/* Free */}
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Free</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.8rem', color: 'var(--white)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.25rem' }}>$0</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>forever</div>
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            {[
              { icon: '✓', text: 'Browse all projects', color: 'var(--green)' },
              { icon: '✓', text: 'Submit unlimited projects', color: 'var(--green)' },
              { icon: '✓', text: 'Like and comment', color: 'var(--green)' },
              { icon: '✓', text: 'Public profile', color: 'var(--green)' },
              { icon: '✓', text: 'Leaderboard ranking', color: 'var(--green)' },
              { icon: '—', text: 'Promote projects', color: 'var(--text-dim)' },
            ].map(f => (
              <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: f.icon === '—' ? 'var(--text-dim)' : 'var(--text-mid)' }}>
                <span style={{ color: f.color, fontWeight: 700, minWidth: 16 }}>{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn btn-ghost" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px' }}>Get started free</Link>
        </div>

        {/* Pro */}
        <div className="card" style={{ padding: '2.5rem 2rem', border: '1px solid var(--cyan)', background: 'linear-gradient(180deg, rgba(0,229,255,0.06) 0%, var(--surface) 100%)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--cyan)', color: 'var(--black)', fontSize: '0.7rem', fontWeight: 700, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Most popular
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '0.5rem' }}>Pro</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.8rem', color: 'var(--white)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.25rem' }}>$9</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>per month · cancel anytime</div>
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            {[
              { icon: '✓', text: 'Everything in Free', bold: false },
              { icon: '🔥', text: 'Promote 3 projects per month', bold: true },
              { icon: '✓', text: 'Projects appear at top of gallery', bold: false },
              { icon: '✓', text: 'Promoted badge on your projects', bold: false },
              { icon: '✓', text: '30 days per promotion slot', bold: false },
              { icon: '✓', text: 'Pro badge on your profile', bold: false },
            ].map(f => (
              <li key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-mid)' }}>
                <span style={{ color: f.icon === '🔥' ? 'var(--gold)' : 'var(--green)', fontWeight: 700, minWidth: 16 }}>{f.icon}</span>
                {f.bold ? <strong style={{ color: 'var(--white)' }}>{f.text}</strong> : f.text}
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn btn-cyan" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px' }}>Upgrade to Pro</Link>
        </div>

      </div>

      {/* How promotion works */}
      <div className="card" style={{ padding: '2.5rem', textAlign: 'left', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'var(--white)', marginBottom: '1.5rem' }}>🔥 How project promotion works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { num: '1', title: 'Upgrade to Pro', desc: 'Pay $9/month and get 3 promotion slots per 30-day period.' },
            { num: '2', title: 'Pick a project to promote', desc: 'Go to any of your approved projects and click the "Promote this project" button.' },
            { num: '3', title: 'Your project goes to the top', desc: 'Your project appears at the top of the gallery with a 🔥 Promoted badge for 30 days. Everyone who visits VCAC sees it first.' },
            { num: '4', title: 'Slots refresh every 30 days', desc: 'After 30 days your promotion expires and you get that slot back to use on another project.' },
          ].map(s => (
            <div key={s.num} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--maple-glow)', border: '1px solid rgba(255,63,63,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, color: 'var(--maple)', flexShrink: 0, fontSize: '0.85rem' }}>{s.num}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
