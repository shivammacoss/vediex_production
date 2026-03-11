import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, ArrowRight, TrendingUp, BookOpen, BarChart3, Coins, GraduationCap, LineChart, Search } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const BlogPage = () => {
  const featuredPost = {
    title: 'Understanding Market Volatility: A Comprehensive Guide for Traders',
    excerpt: 'Learn how to navigate volatile markets and turn uncertainty into opportunity with proven strategies and risk management techniques.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    author: 'Michael Chen',
    date: 'March 10, 2026',
    readTime: '8 min read',
    category: 'Trading Strategy',
  }

  const posts = [
    {
      title: 'Top 10 Cryptocurrency Trends to Watch in 2026',
      excerpt: 'Discover the emerging trends shaping the crypto landscape this year.',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
      author: 'Sarah Johnson',
      date: 'March 8, 2026',
      readTime: '5 min read',
      category: 'Crypto',
    },
    {
      title: 'DeFi Explained: A Beginner\'s Guide to Decentralized Finance',
      excerpt: 'Understanding the fundamentals of DeFi and how to get started safely.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      author: 'Emily Brown',
      date: 'March 9, 2026',
      readTime: '6 min read',
      category: 'Crypto',
    },
    {
      title: 'Advanced Trading Strategies for Volatile Markets',
      excerpt: 'Learn how professional traders navigate high volatility with proven techniques.',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
      author: 'Michael Chen',
      date: 'March 7, 2026',
      readTime: '7 min read',
      category: 'Trading Strategy',
    },
    {
      title: 'Risk Management 101: Protecting Your Portfolio',
      excerpt: 'Essential risk management strategies every trader should know.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      author: 'David Williams',
      date: 'March 5, 2026',
      readTime: '6 min read',
      category: 'Education',
    },
    {
      title: 'Technical Analysis: Reading Chart Patterns',
      excerpt: 'Master the art of technical analysis with this beginner-friendly guide.',
      image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400',
      author: 'Emily Brown',
      date: 'March 3, 2026',
      readTime: '7 min read',
      category: 'Technical Analysis',
    },
    {
      title: 'The Psychology of Trading: Mastering Your Emotions',
      excerpt: 'How to control fear and greed to become a more disciplined trader.',
      image: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400',
      author: 'Michael Chen',
      date: 'February 28, 2026',
      readTime: '6 min read',
      category: 'Psychology',
    },
    {
      title: 'Forex vs Crypto: Which Market is Right for You?',
      excerpt: 'A detailed comparison of forex and cryptocurrency trading.',
      image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400',
      author: 'Sarah Johnson',
      date: 'February 25, 2026',
      readTime: '5 min read',
      category: 'Markets',
    },
    {
      title: 'Building a Trading Plan That Works',
      excerpt: 'Step-by-step guide to creating your personalized trading strategy.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
      author: 'David Williams',
      date: 'February 22, 2026',
      readTime: '8 min read',
      category: 'Trading Strategy',
    },
  ]

  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const getCategoryCount = (categoryName) => {
    if (categoryName === 'All') return posts.length + 1
    const postCount = posts.filter(p => p.category === categoryName).length
    return categoryName === featuredPost.category ? postCount + 1 : postCount
  }

  const categories = [
    { name: 'All', icon: null },
    { name: 'Trading Strategy', icon: TrendingUp },
    { name: 'Crypto', icon: Coins },
    { name: 'Education', icon: GraduationCap },
    { name: 'Technical Analysis', icon: LineChart },
    { name: 'Markets', icon: BarChart3 },
    { name: 'Psychology', icon: BookOpen },
  ]

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-[#00D2FF] bg-[#00D2FF]/10 rounded-full border border-[#00D2FF]/20 mb-6">
              Blog & Insights
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Trading Insights & Market Analysis
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-[#8892B0] max-w-2xl mx-auto">
              Stay informed with the latest market trends, trading strategies, and educational content from our expert analysts.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Search & Categories */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8892B0]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7] transition-colors"
              />
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    activeCategory === category.name
                      ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-lg shadow-[#6C5CE7]/25'
                      : 'bg-[#12152B] text-[#8892B0] hover:text-white hover:bg-[#1A1D35] border border-[rgba(108,92,231,0.15)]'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span>{category.name}</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-md ${
                    activeCategory === category.name
                      ? 'bg-white/20'
                      : 'bg-[#6C5CE7]/20 text-[#A29BFE]'
                  }`}>
                    {getCategoryCount(category.name)}
                  </span>
                </button>
              )
            })}
          </div>
          
          {/* Results Count */}
          <div className="text-center mt-6">
            <p className="text-sm text-[#8892B0]">
              Showing <span className="text-white font-medium">{filteredPosts.length + (activeCategory === 'All' || featuredPost.category === activeCategory ? 1 : 0)}</span> articles
              {activeCategory !== 'All' && <span> in <span className="text-[#6C5CE7]">{activeCategory}</span></span>}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="grid lg:grid-cols-2 gap-8 p-6 rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)]">
              <div className="aspect-video rounded-xl overflow-hidden">
                <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="inline-block px-3 py-1 text-xs font-medium text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full w-fit mb-4">
                  {featuredPost.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{featuredPost.title}</h2>
                <p className="text-[#8892B0] mb-6">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#8892B0] mb-6">
                  <span className="flex items-center gap-2"><User size={14} /> {featuredPost.author}</span>
                  <span className="flex items-center gap-2"><Calendar size={14} /> {featuredPost.date}</span>
                  <span className="flex items-center gap-2"><Clock size={14} /> {featuredPost.readTime}</span>
                </div>
                <button className="inline-flex items-center gap-2 text-[#6C5CE7] hover:text-white transition-colors font-medium">
                  Read Article <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.article 
                key={post.title} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group rounded-2xl bg-[#12152B] border border-[rgba(108,92,231,0.15)] overflow-hidden hover:border-[#6C5CE7]/30 transition-all cursor-pointer"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-[#00D2FF] bg-[#00D2FF]/10 rounded-full mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#6C5CE7] transition-colors">{post.title}</h3>
                  <p className="text-sm text-[#8892B0] mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#8892B0]">
                    <span>{post.author}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#8892B0] text-lg">No articles found in this category.</p>
              <button onClick={() => setActiveCategory('All')} className="mt-4 text-[#6C5CE7] hover:text-white transition-colors">
                View all articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-4 bg-[#12152B]/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</motion.h2>
            <motion.p variants={fadeUp} className="text-[#8892B0] mb-8">Get the latest trading insights and market analysis delivered to your inbox.</motion.p>
            <motion.form variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-[#1A1D35] border border-[rgba(108,92,231,0.15)] text-white placeholder-[#8892B0] focus:outline-none focus:border-[#6C5CE7]"
              />
              <button type="submit" className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl hover:shadow-lg hover:shadow-[#6C5CE7]/30 transition-all">
                Subscribe
              </button>
            </motion.form>
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

export default BlogPage
