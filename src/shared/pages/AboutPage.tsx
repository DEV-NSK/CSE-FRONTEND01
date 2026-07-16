import { motion } from 'framer-motion'
import { GraduationCap, Target, Heart, Users } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We exist to bridge the gap between academic education and industry requirements for CSE students.' },
  { icon: Heart, title: 'Student First', description: 'Every feature is designed with students in mind — accessible, practical, and effective.' },
  { icon: Users, title: 'Community', description: 'Learning is better together. We foster collaboration and peer learning.' },
  { icon: GraduationCap, title: 'Excellence', description: 'We set high standards for quality content and learning outcomes.' },
]

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-heading-1 mb-4">About CSE Platform</h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
          We're building the most comprehensive platform for Computer Science Engineering students
          to learn, grow, and land their dream jobs.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="prose dark:prose-invert max-w-none mb-12 text-muted-foreground">
        <p className="text-body leading-relaxed">
          CSE Student Platform was born from a simple observation: computer science students have incredible
          potential, but lack a unified environment to develop and showcase their skills. From fragmented
          resources to disconnected tools, the journey from freshman to placement-ready professional is
          unnecessarily difficult.
        </p>
        <p className="text-body leading-relaxed mt-4">
          Our platform brings together structured learning paths, competitive coding practice, project management,
          and placement preparation — all tailored specifically for the CSE curriculum and job market.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {values.map((value, i) => {
          const Icon = value.icon
          return (
            <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
