import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, DollarSign, ArrowRight, Briefcase, Code, Headphones, TrendingUp } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const CareersPage = () => {
  const benefits = [
    { icon: DollarSign, title: 'Competitive Salary', description: 'Industry-leading compensation packages with equity options.' },
    { icon: MapPin, title: 'Remote First', description: 'Work from anywhere in the world with flexible hours.' },
    { icon: Clock, title: 'Unlimited PTO', description: 'Take the time you need to recharge and stay productive.' },
    { icon: Briefcase, title: 'Career Growth', description: 'Clear career paths and continuous learning opportunities.' },
  ]

  const jobs = [
    {
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$150K - $200K',
      icon: Code,
    },
    {
      title: 'Frontend Developer (React)',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120K - $160K',
      icon: Code,
    },
    {
      title: 'Senior Product Manager',
      department: 'Product',
      location: 'New York, USA',
      type: 'Full-time',
      salary: '$140K - $180K',
      icon: Briefcase,
    },
    {
      title: 'Customer Support Specialist',
      department: 'Support',
      location: 'Remote',
      type: 'Full-time',
      salary: '$50K - $70K',
      icon: Headphones,
    },
    {
      title: 'Quantitative Analyst',
      department: 'Trading',
      location: 'London, UK',
      type: 'Full-time',
      salary: '$180K - $250K',
      icon: TrendingUp,
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$130K - $170K',
      icon: Code,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0D17]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0D17]/90 backdrop-blur-xl border-b border-[rgba(108,92,231,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo_edited.png" alt="VEDIEX" className="h-10 w-auto" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-[#8892B0] hover:text-white transition-colors">
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#00B894] bg-[#00B894]/10 rounded-full border border-[#00B894]/20 mb-6">
              Careers
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Join Our <span className="text-[#00B894]">Growing Team</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-3xl mx-auto">
              Help us build the future of digital trading. We're looking for passionate individuals who want to make a difference in the fintech industry.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-[#12152B]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Why Work at VEDIEX?</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">We offer competitive benefits and a culture that values innovation and work-life balance.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <motion.div key={benefit.title} variants={fadeUp} className="p-6 rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#00B894]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-[#00B894]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#8892B0]">{benefit.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Open Positions</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">Find your next opportunity and join our mission to democratize trading.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
            {jobs.map((job) => {
              const Icon = job.icon
              return (
                <motion.div key={job.title} variants={fadeUp} className="group p-6 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] hover:border-[#6C5CE7]/30 transition-all cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={22} className="text-[#6C5CE7]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-[#6C5CE7] transition-colors">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#8892B0]">
                          <span>{job.department}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#00B894] font-medium">{job.salary}</span>
                      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#6C5CE7] rounded-lg hover:bg-[#5B4BD5] transition-colors">
                        Apply <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#12152B]/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Don't See a Perfect Fit?</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] mb-8">We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.</motion.p>
            <motion.div variants={fadeUp}>
              <a href="mailto:careers@vediex.com" className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all">
                Send Your Resume
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[rgba(108,92,231,0.15)]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-[#8892B0]">&copy; {new Date().getFullYear()} VEDIEX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default CareersPage
