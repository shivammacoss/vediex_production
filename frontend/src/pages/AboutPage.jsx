import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Building2, Users, Globe, Shield, Award, TrendingUp } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const AboutPage = () => {
  const stats = [
    { value: '500K+', label: 'Active Traders' },
    { value: '$2B+', label: 'Daily Volume' },
    { value: '150+', label: 'Countries' },
    { value: '24/7', label: 'Support' },
  ]

  const values = [
    { icon: Shield, title: 'Security First', description: 'We prioritize the security of your assets with enterprise-grade encryption and cold storage solutions.' },
    { icon: Globe, title: 'Global Access', description: 'Trade from anywhere in the world with our platform available in 150+ countries.' },
    { icon: Users, title: 'Community Driven', description: 'We listen to our community and continuously improve based on trader feedback.' },
    { icon: Award, title: 'Excellence', description: 'Award-winning platform recognized for innovation and user experience.' },
  ]

  const team = [
    { name: 'Michael Chen', role: 'CEO & Founder', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Sarah Johnson', role: 'CTO', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'David Williams', role: 'Head of Trading', image: 'https://randomuser.me/api/portraits/men/67.jpg' },
    { name: 'Emily Brown', role: 'Head of Compliance', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
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
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full border border-[#6C5CE7]/20 mb-6">
              About Us
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Building the Future of <span className="text-[#6C5CE7]">Digital Trading</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-3xl mx-auto">
              VEDIEX is a next-generation digital trading platform built for the modern investor. We provide cutting-edge technology, competitive spreads, and 24/7 customer support to help you succeed in the global markets.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-[#12152B]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#6C5CE7] mb-2">{stat.value}</div>
                <div className="text-sm text-[#8892B0]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-[#8892B0]">
                <p>Founded in 2020, VEDIEX was born from a simple idea: trading should be accessible, secure, and efficient for everyone. Our founders, experienced traders and technologists, saw the gaps in existing platforms and set out to build something better.</p>
                <p>Today, VEDIEX serves over 500,000 active traders across 150+ countries. We've processed billions in trading volume and continue to innovate with new features, products, and services.</p>
                <p>Our mission is to democratize access to global financial markets and empower individuals to take control of their financial future.</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="relative">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#00D2FF]/20 flex items-center justify-center">
                <Building2 size={80} className="text-[#6C5CE7]/50" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-[#12152B]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Values</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">The principles that guide everything we do.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <motion.div key={value.title} variants={fadeUp} className="p-6 rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#6C5CE7]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-[#6C5CE7]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-sm text-[#8892B0]">{value.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Leadership Team</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">Meet the people driving VEDIEX forward.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeUp} className="p-6 rounded-2xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-center">
                <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-[#6C5CE7]">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#12152B]/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Trading?</motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] mb-8">Join thousands of traders who trust VEDIEX for their trading needs.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://trade.vediex.com/user/signup" className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-xl hover:shadow-[#6C5CE7]/30 transition-all">Create Free Account</a>
              <Link to="/contact" className="px-8 py-4 text-base font-semibold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Contact Us</Link>
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

export default AboutPage
