import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { getInitials } from '@/shared/lib/utils'

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return { text: 'Good Morning',   emoji: '☀️' }
  if (h >= 12 && h < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
  if (h >= 17 && h < 21) return { text: 'Good Evening',   emoji: '🌆' }
  return                         { text: 'Good Night',     emoji: '🌙' }
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

      {/* Right — user profile picture or default avatar */}
      <div className="relative z-10 shrink-0 hidden sm:flex items-center justify-center">
        <div className="p-1 rounded-full bg-white/20">
          <Avatar className="h-20 w-20 border-4 border-white/30">
            <AvatarImage
              src={user?.profileImage}
              alt={user?.fullName ?? 'User'}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
              {getInitials(user?.fullName ?? 'U')}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* Online dot on avatar */}
        <span
          className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-white shadow-md"
          aria-hidden="true"
        />
      </div>
    </motion.div>
  )
})
