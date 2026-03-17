import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Copy, CheckCircle, MessageCircle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const ContactPage = () => {
  const [emailCopied, setEmailCopied] = useState(false)

  const supportEmail = 'support@vediex.com'

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: supportEmail,
      description: 'We typically respond within 2 hours',
      action: 'copy',
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+1 (800) 833-4439',
      description: 'Mon-Fri, 9am-6pm EST',
      action: 'call',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: '123 Financial District, Suite 500',
      description: 'New York, NY 10004, USA',
      action: 'map',
    },
    {
      icon: Clock,
      title: 'Support Hours',
      value: '24/7 Available',
      description: 'We\'re always here to help',
      action: null,
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
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#00B894] bg-[#00B894]/10 rounded-full border border-[#00B894]/20 mb-6">
              Contact Us
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Get in Touch
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0]">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => {
              const Icon = info.icon
              return (
                <motion.div key={info.title} variants={fadeUp} className="p-6 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#00B894]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-[#00B894]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {info.action === 'copy' ? (
                      <>
                        <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${info.value}`} target="_blank" rel="noopener noreferrer" className="text-[#00B894] hover:text-white transition-colors">{info.value}</a>
                        <button onClick={copyEmail} className="p-1 rounded hover:bg-white/10 transition-colors relative" title="Copy email">
                          {emailCopied ? <CheckCircle size={14} className="text-[#00B894]" /> : <Copy size={14} className="text-[#8892B0]" />}
                        </button>
                      </>
                    ) : info.action === 'call' ? (
                      <a href={`tel:${info.value.replace(/[^0-9+]/g, '')}`} className="text-[#00B894] hover:text-white transition-colors">{info.value}</a>
                    ) : (
                      <span className="text-[#00B894]">{info.value}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#8892B0]">{info.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-6">
            {/* Quick Support */}
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)]">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Support</h3>
                <p className="text-[#8892B0] mb-4">For faster assistance, try these resources:</p>
                <div className="space-y-3">
                  <Link to="/help-center" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <MessageCircle size={18} className="text-[#6C5CE7]" />
                    <span className="text-white">Visit Help Center</span>
                  </Link>
                  <Link to="/faq" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <MessageCircle size={18} className="text-[#00D2FF]" />
                    <span className="text-white">Browse FAQ</span>
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#00B894]/20 border border-[rgba(108,92,231,0.15)]">
                <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
                <p className="text-[#8892B0] mb-4">Prefer email? Reach us directly at:</p>
                <div className="flex items-center gap-3">
                  <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}`} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-[#00B894] hover:text-white transition-colors">
                    {supportEmail}
                  </a>
                  <button onClick={copyEmail} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors relative" title="Copy email">
                    {emailCopied ? <CheckCircle size={16} className="text-[#00B894]" /> : <Copy size={16} className="text-white" />}
                    {emailCopied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-[#00B894] text-white rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)]">
                <h3 className="text-lg font-semibold text-white mb-2">Office Location</h3>
                <p className="text-[#8892B0]">
                  123 Financial District, Suite 500<br />
                  New York, NY 10004<br />
                  United States
                </p>
              </div>
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

export default ContactPage
