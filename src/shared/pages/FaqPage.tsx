import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const faqs = [
  { q: 'Is the platform free to use?', a: 'Yes, we offer a free forever plan with access to core features. Premium plans with advanced content will be available in the future.' },
  { q: 'Who is this platform for?', a: 'CSE Platform is designed primarily for Computer Science Engineering students, from first-year to final year, looking to improve their technical skills and placement readiness.' },
  { q: 'How is this different from other platforms?', a: 'Unlike fragmented tools, we bring learning, coding practice, project management, and placement prep under one roof, tailored specifically to the CSE curriculum.' },
  { q: 'Can I use this on mobile?', a: 'Absolutely. The platform is fully responsive and works great on mobile, tablet, laptop, and desktop.' },
  { q: 'How do I reset my password?', a: 'Click "Forgot password?" on the login page, enter your email, and we\'ll send you a reset link within a few minutes.' },
  { q: 'Is my data secure?', a: 'Yes. We use industry-standard encryption for all data in transit and at rest. We never sell personal information.' },
  { q: 'How often is new content added?', a: 'We continuously add new problems, courses, and resources. Major content updates are announced via notifications.' },
  { q: 'Can I access the platform offline?', a: 'Currently, the platform requires an internet connection. Offline support is on our roadmap for future releases.' },
]

function FaqItem({ q, a, isOpen, toggle }: { q: string; a: string; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
        onClick={toggle}
        aria-expanded={isOpen}
      >
        <span>{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-heading-1 mb-3">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Can't find an answer? <a href="/contact" className="text-primary hover:underline">Contact us</a>.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-border bg-card px-6"
      >
        {faqs.map((faq, i) => (
          <FaqItem
            key={i}
            q={faq.q}
            a={faq.a}
            isOpen={openIndex === i}
            toggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.div>
    </div>
  )
}
