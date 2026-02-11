import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setForm({ name: '', email: '', password: '' });
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder — integrate with backend later
    alert(`${mode === 'login' ? 'Login' : 'Sign Up'} submitted for ${form.email}`);
    onClose();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setForm({ name: '', email: '', password: '' });
    setShowPassword(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md rounded-2xl bg-dark-card border border-border-subtle shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-text hover:text-white hover:bg-white/10 transition-colors z-10"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="px-8 pt-8 pb-2 text-center">
              <img src="/logo_edited.png" alt="VEDIEX" className="h-12 w-auto mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-gray-text">
                {mode === 'login'
                  ? 'Sign in to access your trading dashboard'
                  : 'Join VEDIEX and start trading today'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-gray-text mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-text" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                      className="w-full pl-10 pr-4 py-3 text-sm text-white bg-dark-surface border border-border-subtle rounded-xl placeholder:text-gray-text/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-text mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-text" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm text-white bg-dark-surface border border-border-subtle rounded-xl placeholder:text-gray-text/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-text mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-text" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-11 py-3 text-sm text-white bg-dark-surface border border-border-subtle rounded-xl placeholder:text-gray-text/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-text hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-border-subtle accent-primary" />
                    <span className="text-xs text-gray-text">Remember me</span>
                  </label>
                  <a href="#" className="text-xs text-primary-light hover:text-white transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              {mode === 'signup' && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="w-3.5 h-3.5 mt-0.5 rounded border-border-subtle accent-primary" />
                  <span className="text-xs text-gray-text leading-relaxed">
                    I agree to the <a href="#" className="text-primary-light hover:text-white">Terms of Service</a> and <a href="#" className="text-primary-light hover:text-white">Privacy Policy</a>
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Footer */}
            <div className="px-8 pb-8 text-center">
              <p className="text-sm text-gray-text">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={switchMode}
                  className="text-primary-light hover:text-white font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
