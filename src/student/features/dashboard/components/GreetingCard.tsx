import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { text: 'Good Morning', emoji: '☀️' }
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
  if (h >= 17 && h < 21) return { text: 'Good Evening', emoji: '🌆' }
  return { text: 'Good Night', emoji: '🌙' }
}

// Simple SVG cartoon avatar — not a user photo
function CartoonAvatar() {
  return (
    <svg
      width="88"
      height="88"
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="select-none"
    >
      {/* Body */}
      <circle cx="44" cy="44" r="44" fill="#A78BFA" />
      {/* Shirt */}
      <ellipse cx="44" cy="76" rx="22" ry="14" fill="#7C5CFC" />
      {/* Head */}
      <circle cx="44" cy="36" r="20" fill="#FDE68A" />
      {/* Hair */}
      <ellipse cx="44" cy="18" rx="18" ry="9" fill="#1F1F3A" />
      <ellipse cx="28" cy="28" rx="7" ry="11" fill="#1F1F3A" />
      <ellipse cx="60" cy="28" rx="7" ry="11" fill="#1F1F3A" />
      {/* Eyes */}
      <circle cx="37" cy="35" r="3" fill="#1F1F3A" />
      <circle cx="51" cy="35" r="3" fill="#1F1F3A" />
      <circle cx="38" cy="34" r="1" fill="white" />
      <circle cx="52" cy="34" r="1" fill="white" />
      {/* Smile */}
      <path d="M 37 43 Q 44 50 51 43" stroke="#1F1F3A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export const GreetingCard = memo(function GreetingCard() {
  const { user } = useAuthStore()
  const { text, emoji } = getGreeting()
  const firstName = user?.fullName?.split(' ')[0] ?? 'there'
  const department = user?.branch ?? 'Computer Science'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[18px] p-6 flex items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #A78BFA 100%)',
        boxShadow: '0 8px 32px rgba(124, 92, 252, 0.35)',
      }}
      role="region"
      aria-label="Welcome greeting"
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translateY(30%)' }}
        aria-hidden="true"
      />

      {/* Left text */}
      <div className="relative z-10 flex flex-col gap-1">
        <p className="text-white/80 text-sm font-medium tracking-wide">
          {text} {emoji}
        </p>
        <h1 className="text-white text-2xl font-bold tracking-tight">
          Hi, {firstName} 👋
        </h1>
        <p className="text-white/70 text-xs mt-0.5">
          Department · {department}
        </p>

        {/* Online badge */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_6px_#22C55E]" aria-hidden="true" />
          <span className="text-white/80 text-xs font-medium">Online</span>
        </div>

        <Link
          to="/dashboard/profile/edit"
          className="mt-3 text-white/70 text-xs hover:text-white transition-colors duration-200 w-fit"
          aria-label="Edit your profile"
        >
          Edit Profile →
        </Link>
      </div>

      {/* Right avatar */}
      <div className="relative z-10 shrink-0 hidden sm:block">
        <CartoonAvatar />
      </div>
    </motion.div>
  )
})
