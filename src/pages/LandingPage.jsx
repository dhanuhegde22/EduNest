import { Link } from 'react-router-dom'
import { 
  BookOpen, Upload, Search, Shield, Moon, Rss, 
  ArrowRight, CheckCircle, GraduationCap, Users, Zap
} from 'lucide-react'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'

const features = [
  {
    icon: <Upload size={22} className="text-primary-600 dark:text-primary-400" />,
    title: 'Upload Notes',
    desc: 'Share PDF notes with your peers instantly. Organized by subject for easy discovery.',
    color: 'bg-primary-50 dark:bg-primary-900/20',
  },
  {
    icon: <BookOpen size={22} className="text-accent-600 dark:text-accent-400" />,
    title: 'Subject Library',
    desc: 'Browse notes categorized by subjects — DS, OS, DBMS, Networks, AI, Web Dev & more.',
    color: 'bg-accent-50 dark:bg-accent-900/20',
  },
  {
    icon: <Rss size={22} className="text-purple-600 dark:text-purple-400" />,
    title: 'EduFeed',
    desc: 'Academic-only feed. Ask questions, share resources, and interact without distractions.',
    color: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: <Shield size={22} className="text-rose-600 dark:text-rose-400" />,
    title: 'Secure Auth',
    desc: 'Your data is protected with Supabase Auth. No ads, no tracking, no noise.',
    color: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: <Moon size={22} className="text-indigo-600 dark:text-indigo-400" />,
    title: 'Dark Mode',
    desc: 'Seamless light/dark mode toggle. Study comfortably at any hour.',
    color: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    icon: <Search size={22} className="text-orange-600 dark:text-orange-400" />,
    title: 'Smart Search',
    desc: 'Find notes instantly by title, subject, or tags across the entire library.',
    color: 'bg-orange-50 dark:bg-orange-900/20',
  },
]

const stats = [
  { icon: <GraduationCap size={20} />, label: 'Distraction-Free', value: '100%' },
  { icon: <Zap size={20} />, label: 'Lightning Fast', value: 'Instant' },
  { icon: <Users size={20} />, label: 'Student-First', value: 'Always' },
]

export default function LandingPage() {
  return (
    <div className="page-container flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 -z-10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl -z-10" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
                <Zap size={14} className="fill-current" />
                A distraction-free academic platform
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                Learn Together,
                <span className="block bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                  Grow Together
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
                EduNest is where serious students share knowledge. Upload notes, explore subject-wise resources, and collaborate academically — zero noise, pure learning.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="btn-primary text-base px-8 py-3.5">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/notes" className="btn-secondary text-base px-8 py-3.5">
                  Browse Notes <BookOpen size={18} />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-slate-500 dark:text-slate-400">
                {['No Ads', 'Free Forever', 'Secure & Private'].map(badge => (
                  <div key={badge} className="flex items-center gap-1.5">
                    <CheckCircle size={15} className="text-accent-500" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white dark:bg-dark-800 border-y border-slate-100 dark:border-dark-700">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">Everything You Need to Study Smarter</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                Six powerful modules designed entirely around academic productivity.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(f => (
                <div key={f.title} className="glass-card-hover p-6 group cursor-default">
                  <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-center shadow-2xl shadow-primary-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform How You Study?
                </h2>
                <p className="text-primary-100 mb-8 text-lg">
                  Join EduNest today — it's free, fast, and built for students like you.
                </p>
                <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Start Learning <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-16 bg-white dark:bg-dark-800 border-t border-slate-100 dark:border-dark-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="section-title mb-4">Developed With ❤️</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              EduNest was built with a passion for education and clean, purposeful design.
            </p>
            <div className="inline-block glass-card px-10 py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">EduNest Team</h3>
              <p className="text-primary-600 dark:text-primary-400 font-medium text-sm mb-3">Full-Stack Developer</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                Built with React, Vite, Tailwind CSS, and Supabase — all for the love of learning.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
