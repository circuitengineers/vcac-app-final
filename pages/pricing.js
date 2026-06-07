import Link from 'next/link'

export default function Pricing() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Membership</div>
      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.8rem', color: 'var(--white)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>Simple pricing</h1>
      <p style={{ color: 'var(--text-mid)', fontSize: '1rem', maxWidth: 480, margin: '0 auto 3rem', fontWeight: 300 }}>
        Free to browse, submit, and get discovered. Pro membership is coming soon.
      </p>

      {/* Coming soon banner */}
      <div style={{ background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.3)', borderRadius: 12, padding: '1.25rem 2rem', marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.2rem' }}>🚧</span>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--gold)', fontSize: '0.95rem' }}>Pro membership is not yet available</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 3 }}>We are actively building it. Early members will be notified first and may receive free Pro access.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'left', marginBottom: '4rem' }}>

        {/* Free */}
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Free</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.8rem', color: 'var(--white)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.25rem' }}>$0</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>forever — available now</div>
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            {[
              'Browse all projects',
              'Submit unlimited projects',
              'Like and comment',
              'Public profile + avatar',
              'Follow other creators',
              'Direct messaging',
              'Leaderboard ranking',
              'Earn certificates (with admin review)',
            ].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-mid)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700, minWidth: 16 }}>✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '12px' }}>Get started free</Link>
        </div>

        {/* Pro - coming soon */}
        <div className="card" style={{ padding: '2.5rem 2rem', border: '1px solid var(--border)', position: 'relative', opacity: 0.75 }}>
          <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--black)', fontSize: '0.7rem', fontWeight: 700, padding: '4px 14px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Coming soon
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Pro</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.8rem', color: 'var(--white)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.25rem' }}>$9</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>per month · not yet available</div>
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            {[
              'Everything in Free',
              '🔥 Promote 3 projects per month',
              'Projects appear at top of gallery',
              'Promoted badge for 30 days',
              'Pro badge on your profile',
              'Early access to new features',
            ].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                <span style={{ color: 'var(--text-dim)', minWidth: 16 }}>—</span>{f}
              </li>
            ))}
          </ul>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            🚧 Not yet available — check back soon
          </div>
        </div>

      </div>

      {/* How promotion works */}
      <div className="card" style={{ padding: '2.5rem', textAlign: 'left', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: 'var(--white)', marginBottom: '1.5rem' }}>🔥 How project promotion will work</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { num: '1', title: 'Upgrade to Pro (coming soon)', desc: 'Pay $9/month and get 3 promotion slots per 30-day period.' },
            { num: '2', title: 'Pick a project to promote', desc: 'Go to any of your approved projects and click the Promote button.' },
            { num: '3', title: 'Your project goes to the top', desc: 'It appears at the top of the gallery with a 🔥 Promoted badge for 30 days. Everyone who visits VCAC sees it first.' },
            { num: '4', title: 'Slots refresh every 30 days', desc: 'After 30 days your promotion expires and you get that slot back.' },
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
