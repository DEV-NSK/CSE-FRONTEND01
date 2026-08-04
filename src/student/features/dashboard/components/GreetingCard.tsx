import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return { text: 'Good Morning',   emoji: '☀️' }
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
  if (h >= 17 && h < 21) return { text: 'Good Evening',   emoji: '🌆' }
  return                         { text: 'Good Night',     emoji: '🌙' }
}

/**
 * Professional student avatar — flat-design illustration of a student
 * wearing a hoodie/shirt, sitting at a desk with a laptop.
 */
function StudentAvatar() {
  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="select-none drop-shadow-lg"
    >
      {/* ── Laptop base ── */}
      <rect x="18" y="74" width="74" height="6" rx="3" fill="#C4B5FD" opacity="0.5" />
      {/* ── Laptop screen body ── */}
      <rect x="26" y="50" width="58" height="36" rx="4" fill="#1E1B4B" />
      {/* ── Screen glow ── */}
      <rect x="30" y="54" width="50" height="28" rx="2" fill="#4F46E5" opacity="0.8" />
      {/* ── Code lines on screen ── */}
      <rect x="34" y="59" width="24" height="2.5" rx="1.2" fill="#A5F3FC" opacity="0.9" />
      <rect x="34" y="64" width="32" height="2.5" rx="1.2" fill="#86EFAC" opacity="0.9" />
      <rect x="34" y="69" width="18" height="2.5" rx="1.2" fill="#FCA5A5" opacity="0.9" />
      <rect x="34" y="74" width="28" height="2.5" rx="1.2" fill="#FDE68A" opacity="0.9" />
      {/* ── Cursor blink ── */}
      <rect x="63" y="74" width="2" height="2.5" rx="0.8" fill="#fff" opacity="0.9" />

      {/* ── Shoulders / hoodie ── */}
      <path d="M 30 52 Q 30 44 55 44 Q 80 44 80 52" fill="#6D28D9" />
      {/* ── Hoodie front panel ── */}
      <rect x="47" y="44" width="16" height="8" rx="2" fill="#5B21B6" />

      {/* ── Neck ── */}
      <rect x="49" y="33" width="12" height="12" rx="4" fill="#FCD34D" />

      {/* ── Head ── */}
      <circle cx="55" cy="27" r="16" fill="#FCD34D" />

      {/* ── Hair ── */}
      <path d="M 39 22 Q 40 10 55 9 Q 70 10 71 22 Q 68 16 55 15 Q 42 16 39 22 Z" fill="#1F2937" />
      {/* ── Hair side left ── */}
      <ellipse cx="40" cy="24" rx="3.5" ry="5" fill="#1F2937" />
      {/* ── Hair side right ── */}
      <ellipse cx="70" cy="24" rx="3.5" ry="5" fill="#1F2937" />

      {/* ── Eyebrows ── */}
      <path d="M 47 22 Q 50 20 53 22" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M 57 22 Q 60 20 63 22" stroke="#1F2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* ── Eyes ── */}
      <ellipse cx="50" cy="26" rx="2.5" ry="2.8" fill="#1F2937" />
      <ellipse cx="60" cy="26" rx="2.5" ry="2.8" fill="#1F2937" />
      {/* ── Eye shine ── */}
      <circle cx="51.2" cy="25" r="0.9" fill="white" />
      <circle cx="61.2" cy="25" r="0.9" fill="white" />

      {/* ── Nose ── */}
      <path d="M 54 29 Q 55 31 56 29" stroke="#E5A84B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* ── Smile ── */}
      <path d="M 49 33 Q 55 38 61 33" stroke="#1F2937" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* ── Left arm ── */}
      <path d="M 30 50 Q 20 58 22 68" stroke="#6D28D9" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* ── Left hand on keyboard ── */}
      <ellipse cx="23" cy="70" rx="5" ry="3.5" fill="#FCD34D" />

      {/* ── Right arm ── */}
      <path d="M 80 50 Q 90 58 88 68" stroke="#6D28D9" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* ── Right hand on keyboard ── */}
      <ellipse cx="87" cy="70" rx="5" ry="3.5" fill="#FCD34D" />

      {/* ── Headphones ── */}
      <path d="M 40 22 Q 40 8 55 8 Q 70 8 70 22" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <rect x="36" y="20" width="7" height="9" rx="3" fill="#7C3AED" />
      <rect x="67" y="20" width="7" height="9" rx="3" fill="#7C3AED" />
    </svg>
  )
}

export const GreetingCard = memo(function GreetingCard() {
  const { user } = useAuthStore()
  const { text, emoji } = getGreeting()
  const firstName  = user?.fullName?.split(' ')[0] ?? 'there'
  const department = user?.branch ?? 'Computer Science'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[18px] p-6 flex items-center justify-between gap-4 w-full h-full"
      style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #A78BFA 100%)',
        boxShadow: '0 8px 32px rgba(124,92,252,0.35)',
      }}
      role="region"
      aria-label="Welcome greeting"
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translate(30%,-35%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/4 w-36 h-36 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)', transform: 'translateY(40%)' }}
        aria-hidden="true"
      />

      {/* Left — text */}
      <div className="relative z-10 flex flex-col gap-1.5 min-w-0">
        <p className="text-white/75 text-sm font-medium tracking-wide">
          {text} {emoji}
        </p>
        <h1 className="text-white text-2xl font-bold tracking-tight leading-tight">
          Hi, {firstName} 👋
        </h1>
        <p className="text-white/65 text-xs">
          Department · {department}
        </p>
        {/* Online badge */}
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]"
            aria-hidden="true"
          />
          <span className="text-white/75 text-xs font-medium">Online</span>
        </div>
        <Link
          to="/dashboard/profile/edit"
          className="mt-2 text-white/60 text-xs hover:text-white transition-colors duration-200 w-fit"
          aria-label="Edit your profile"
        >
          Edit Profile →
        </Link>
      </div>

      {/* Right — professional student avatar */}
      <div className="relative z-10 shrink-0 hidden sm:flex items-end justify-center">
        <StudentAvatar />
      </div>
    </motion.div>
  )
})
