import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Copy, CheckCircle, MessageCircle, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [emailCopied, setEmailCopied] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowSuccessPopup(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const closePopup = () => {
    setShowSuccessPopup(false)
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
      {/* Success Popup Modal */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={closePopup}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md p-8 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 p-2 rounded-lg text-[#8892B0] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#00B894] to-[#00D2FF] flex items-center justify-center">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Message Sent Successfully!</h3>
                <p className="text-[#8892B0] mb-6">
                  Thank you for reaching out. Our support team will get back to you within 2 hours.
                </p>
                <button
                  onClick={closePopup}
                  className="w-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#8892B0] mb-2">Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#8892B0] mb-2">Your Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#8892B0] mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#8892B0] mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all"
                >
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Additional Info */}
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
