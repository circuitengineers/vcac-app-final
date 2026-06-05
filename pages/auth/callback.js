import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Create profile if first time signing in with Google
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (!existing) {
          const emailName = session.user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')
          await supabase.from('profiles').insert({
            id: session.user.id,
            username: emailName,
            email: session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            role: 'member'
          })
        }
      }
      router.push('/')
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', fontFamily: 'DM Mono', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍁</div>
        Signing you in...
      </div>
    </div>
  )
}
