import Link from 'next/link'

const FAQS = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'What is VCAC?',
        a: 'The Vibe Coders Association of Canada (VCAC) is Canada\'s first community for vibe coders — people who build projects using AI assistance tools like Claude, ChatGPT, Cursor, and others. We\'re a place to share what you\'ve built, get recognized for it, and connect with other builders.'
      },
      {
        q: 'Who can join?',
        a: 'Anyone! You don\'t need to be Canadian. You don\'t need to be a professional developer. If you\'ve built something cool with AI assistance, this is your home. Sign up for free and start exploring.'
      },
      {
        q: 'What is vibe coding?',
        a: 'Vibe coding is the practice of building software using AI tools — writing prompts, describing what you want, iterating with the AI until you have something that works. You don\'t need to know every line of code. The vibe is the vision. The AI is the tool.'
      },
      {
        q: 'Is VCAC free?',
        a: 'Yes — browsing, submitting projects, liking, commenting, messaging, and earning certificates are all completely free. Pro membership (coming soon at $9/month) will allow you to promote your projects to the top of the gallery.'
      },
    ]
  },
  {
    section: 'Submitting Projects',
    items: [
      {
        q: 'What kinds of projects can I submit?',
        a: 'Games, art, tools, AI projects, simulations, music generators, productivity apps — anything you built with AI assistance. It should be something others can visit or download. We accept links to Vercel, GitHub Pages, CodePen, Scratch, itch.io, or any public URL.'
      },
      {
        q: 'How does the review process work?',
        a: 'Every submission is reviewed by the VCAC president before going live. We check that the project is genuine, functional, and appropriate for the community. Most projects are reviewed within 24–48 hours. You\'ll see "pending" status until it\'s approved.'
      },
      {
        q: 'What gets a project rejected?',
        a: 'Projects get rejected if they don\'t work, aren\'t actually vibe coded, contain inappropriate content, or are spam. We\'re not strict — we want to approve everything genuine. If rejected, you can fix and resubmit.'
      },
      {
        q: 'Can I submit a Scratch project?',
        a: 'Yes! If you vibe coded it using AI assistance and then built it in Scratch or any other platform, it counts. Just paste the share link as your live URL.'
      },
    ]
  },
  {
    section: 'Vibe Score & Certificates',
    items: [
      {
        q: 'What is a Vibe Score?',
        a: 'Your Vibe Score measures the community impact of a project. The formula is simple: Vibe Score = Views + (Likes × 10). Likes are worth 10x more than views because they require intentional action. Each project has its own Vibe Score.'
      },
      {
        q: 'What are the certificate tiers?',
        a: 'There are 5 tiers, all requiring admin review and approval:\n\n• Rising Creator — 300+ Vibe Score\n• Recognized Creator — 1,500+ Vibe Score\n• Distinguished Creator — 5,000+ Vibe Score\n• Master Creator — 15,000+ Vibe Score\n• Hall of Fame Creator — 50,000+ Vibe Score\n\nThese are intentionally hard to reach. A certificate from VCAC means something.'
      },
      {
        q: 'How do I earn a certificate?',
        a: 'When your project reaches a tier threshold, a "Request Certificate" button appears on your project page. You submit a request, and the VCAC president manually reviews it to verify the score is genuine (not inflated by bots or self-manipulation). If approved, you can download an official VCAC certificate as a PNG.'
      },
      {
        q: 'Why does the certificate require admin review?',
        a: 'Because we want VCAC certificates to actually mean something. Anyone can game a view counter. The admin review step ensures every certificate is earned legitimately. This is what makes them worth sharing on LinkedIn, your portfolio, or social media.'
      },
      {
        q: 'Can I put the certificate on my resume or LinkedIn?',
        a: 'Absolutely — that\'s the whole point. A VCAC certificate is proof that the Canadian vibe coding community recognized your work as genuinely impactful.'
      },
      {
        q: 'Can I inflate my own Vibe Score?',
        a: 'We have systems to detect this. Self-inflation will result in certificate denial and potential removal from the platform. The score only means something if it\'s real.'
      },
    ]
  },
  {
    section: 'Pro Membership',
    items: [
      {
        q: 'What is Pro membership?',
        a: 'Pro membership is coming soon at $9/month. Pro members will be able to promote up to 3 projects per month — promoted projects appear at the top of the gallery with a 🔥 Promoted badge for 30 days, giving them maximum visibility.'
      },
      {
        q: 'Is Pro membership available now?',
        a: 'Not yet. It is actively being developed. When it launches, existing members will get advance notice. Some early members may be granted Pro status for free as a thank-you for being early adopters.'
      },
      {
        q: 'Does Pro affect certificates?',
        a: 'No. Certificates are based purely on community Vibe Score. Pro membership only affects promotion visibility — it gives no advantage in earning certificates.'
      },
    ]
  },
  {
    section: 'Community & Safety',
    items: [
      {
        q: 'How do I report a user or project?',
        a: 'Visit any user\'s public profile and click the "Report" button. Choose a reason and optionally add details. Reports go directly to the VCAC president for review. You can also report a project by contacting us through a user profile.'
      },
      {
        q: 'What happens when someone is reported?',
        a: 'The VCAC president reviews every report. Depending on severity, actions range from a warning to permanent removal. We take harassment, spam, and fake projects seriously.'
      },
      {
        q: 'Can I message other users?',
        a: 'Yes! Visit any user\'s public profile and click "Message". Your full inbox is at /messages. Avatars and usernames in messages are clickable and link to profiles.'
      },
      {
        q: 'Can I follow other creators?',
        a: 'Yes — hit the Follow button on any public profile. This shows your support and increases their visible follower count. Following is public.'
      },
    ]
  },
  {
    section: 'Profiles & Accounts',
    items: [
      {
        q: 'How do I set my avatar?',
        a: 'Go to your profile (/profile) and click "Edit profile". You\'ll see a grid of 20 preset non-human avatars — animals, space, and mythical creatures. Pick one and save. We use preset avatars to keep the community fun and anonymous.'
      },
      {
        q: 'How do I find other users?',
        a: 'Use the Search page (link in the nav bar) to search by username. You can also click any username on project pages, leaderboard, or comments to visit their public profile.'
      },
      {
        q: 'What is the leaderboard?',
        a: 'The leaderboard ranks the most liked projects and top builders by total likes across all their projects. It updates in real time as the community interacts with projects.'
      },
    ]
  },
]

export default function FAQ() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--maple)', marginBottom: 8 }}>Help & Information</div>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2.5rem', color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Frequently Asked Questions</h1>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 560 }}>
          Everything you need to know about VCAC — how it works, how certificates are earned, and how to make the most of the community.
        </p>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '3rem' }}>
        {FAQS.map(s => (
          <a key={s.section} href={'#' + s.section.replace(/\s+/g, '-').toLowerCase()} style={{ fontSize: '0.8rem', padding: '6px 14px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 100, color: 'var(--text-mid)', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--maple)'; e.target.style.color = 'var(--white)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-mid)' }}
          >
            {s.section}
          </a>
        ))}
      </div>

      {FAQS.map(section => (
        <div key={section.section} id={section.section.replace(/\s+/g, '-').toLowerCase()} style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: 'var(--white)' }}>{section.section}</h2>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {section.items.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}

      {/* Contact */}
      <div className="card" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>Still have questions?</h3>
        <p style={{ color: 'var(--text-mid)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Find the VCAC president on the platform and send a message directly.
        </p>
        <Link href="/user/president_vcac" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '10px 24px' }}>
          Message the President →
        </Link>
      </div>
    </div>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ overflow: 'hidden', transition: 'all 0.2s' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', gap: 12
      }}>
        <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.92rem', lineHeight: 1.5 }}>{q}</span>
        <span style={{ color: 'var(--maple)', fontSize: '1.1rem', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: '1rem', fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{a}</div>
        </div>
      )}
    </div>
  )
}
