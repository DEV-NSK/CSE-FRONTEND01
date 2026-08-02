import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Code2, FolderKanban, Briefcase, ArrowRight,
  Zap, Shield, TrendingUp, CheckCircle2, Sparkles,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

const features = [
  {
    icon: BookOpen,
    title: 'Structured Learning',
    description: 'Follow curated learning paths designed specifically for CSE students with hands-on exercises.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Code2,
    title: 'Coding Practice',
    description: 'Solve algorithmic problems with an integrated editor, test cases, and detailed solutions.',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: FolderKanban,
    title: 'Project Showcase',
    description: 'Build real-world projects, track your progress, and showcase your portfolio to recruiters.',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Briefcase,
    title: 'Placement Prep',
    description: 'Interviews, aptitude tests, resume builder, and company-specific preparation guides.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Detailed insights into your learning journey with actionable recommendations.',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  {
    icon: Zap,
    title: 'Fast & Responsive',
    description: 'Works seamlessly on any device — mobile, tablet, or desktop.',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-20 px-4 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
                🎓 Built for CSE Students
              </Badge>
              <h1 className="text-display mb-6 text-foreground">
                Your Complete Platform for{' '}
                <span className="text-primary">Tech Success</span>
              </h1>
              <p className="text-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Learn, code, build projects, and land your dream job — all in one place.
                The ultimate platform for Computer Science Engineering students.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" onClick={() => navigate('/auth/register')} className="gap-2 w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="xl" variant="outline" onClick={() => navigate('/auth/login')} className="w-full sm:w-auto">
                  Sign In
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                {['No credit card required', 'Free forever plan', 'Early access now'].map((text) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Status / Coming Soon Stats */}
      <section className="py-16 bg-muted/30 px-4 sm:px-6 lg:px-8" aria-label="Platform status">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-background border border-border/60 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Platform launching soon</span>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto">
              Real platform metrics and community stats will appear here as we grow. 
              Be among the first students to join and shape the future of CSE learning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Features">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <Badge variant="secondary" className="mb-4">Everything you need</Badge>
            <h2 className="text-heading-1 mb-4">Features built for students</h2>
            <p className="text-muted-foreground text-body">
              From your first year to placement, we've got every step covered.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                  <Card className="h-full hover:shadow-md transition-shadow border-border/60">
                    <CardContent className="p-6">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Coming Soon */}
      <section className="py-20 bg-muted/30 px-4 sm:px-6 lg:px-8" aria-label="Student stories">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-heading-1 mb-4">What students say</h2>
            <p className="text-muted-foreground text-body mb-8">
              Student stories and testimonials are coming soon. 
              Be the first to share your experience once you start your journey with us.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => navigate('/auth/register')} className="gap-2">
                Create Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/learning/roadmaps/python">
                  Explore Python Roadmap
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Call to action">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="h-12 w-12 text-primary mx-auto mb-6 opacity-80" aria-hidden="true" />
            <h2 className="text-heading-1 mb-4">Ready to start your journey?</h2>
            <p className="text-muted-foreground text-body mb-8">
              Join CSE students who are accelerating their careers with our platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={() => navigate('/auth/register')} className="gap-2 w-full sm:w-auto">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate('/about')} className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
