// Preset non-human avatars using emoji + background color combos
export const AVATARS = [
  { id: 'bear',     emoji: '🐻', bg: '#8B4513', label: 'Bear' },
  { id: 'fox',      emoji: '🦊', bg: '#D2691E', label: 'Fox' },
  { id: 'wolf',     emoji: '🐺', bg: '#708090', label: 'Wolf' },
  { id: 'owl',      emoji: '🦉', bg: '#4B4B8F', label: 'Owl' },
  { id: 'dragon',   emoji: '🐉', bg: '#8B0000', label: 'Dragon' },
  { id: 'phoenix',  emoji: '🦅', bg: '#FF4500', label: 'Phoenix' },
  { id: 'lion',     emoji: '🦁', bg: '#DAA520', label: 'Lion' },
  { id: 'tiger',    emoji: '🐯', bg: '#CC5500', label: 'Tiger' },
  { id: 'panda',    emoji: '🐼', bg: '#2F4F4F', label: 'Panda' },
  { id: 'penguin',  emoji: '🐧', bg: '#1C1C4F', label: 'Penguin' },
  { id: 'shark',    emoji: '🦈', bg: '#4682B4', label: 'Shark' },
  { id: 'octopus',  emoji: '🐙', bg: '#8B008B', label: 'Octopus' },
  { id: 'robot',    emoji: '🤖', bg: '#2F4F4F', label: 'Robot' },
  { id: 'alien',    emoji: '👾', bg: '#006400', label: 'Alien' },
  { id: 'ghost',    emoji: '👻', bg: '#483D8B', label: 'Ghost' },
  { id: 'comet',    emoji: '☄️', bg: '#191970', label: 'Comet' },
  { id: 'saturn',   emoji: '🪐', bg: '#4B0082', label: 'Saturn' },
  { id: 'crystal',  emoji: '💎', bg: '#008B8B', label: 'Crystal' },
  { id: 'maple',    emoji: '🍁', bg: '#8B0000', label: 'Maple' },
  { id: 'thunder',  emoji: '⚡', bg: '#4B4B00', label: 'Thunder' },
]

export function getAvatar(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0]
}

export function AvatarDisplay({ avatarId, size = 36, style = {} }) {
  const av = getAvatar(avatarId)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: av.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5,
      flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.1)',
      ...style
    }}>
      {av.emoji}
    </div>
  )
}
