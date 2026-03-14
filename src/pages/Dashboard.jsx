import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Library, Upload, Rss, User, BookOpen, FileText,
  MessageSquare, ArrowRight, Clock, Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const quickLinks = [
  { to: '/notes', label: 'Notes Library', desc: 'Browse all uploaded notes', icon: Library, color: 'from-primary-500 to-primary-700', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  { to: '/upload', label: 'Upload Notes', desc: 'Share your PDFs with peers', icon: Upload, color: 'from-accent-500 to-accent-700', bg: 'bg-accent-50 dark:bg-accent-900/20' },
  { to: '/feed', label: 'EduFeed', desc: 'Ask questions & share resources', icon: Rss, color: 'from-purple-500 to-purple-700', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { to: '/profile', label: 'My Profile', desc: 'Manage your account', icon: User, color: 'from-rose-500 to-rose-700', bg: 'bg-rose-50 dark:bg-rose-900/20' },
]

const subjects = [
  // Computer Science
  { id: 1, name: 'Data Structures', slug: 'ds', category: 'Computer Science', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 2, name: 'Operating Systems', slug: 'os', category: 'Computer Science', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { id: 3, name: 'Database Management Systems', slug: 'dbms', category: 'Computer Science', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  { id: 4, name: 'Web Development', slug: 'web', category: 'Computer Science', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 5, name: 'Computer Networks', slug: 'cn', category: 'Computer Science', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { id: 6, name: 'Artificial Intelligence', slug: 'ai', category: 'Computer Science', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 17, name: 'Java', slug: 'java', category: 'Computer Science', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { id: 18, name: 'Python', slug: 'python', category: 'Computer Science', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  
  // Commerce
  { id: 7, name: 'Financial Accounting', slug: 'fa', category: 'Commerce', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: 8, name: 'Business Economics', slug: 'be', category: 'Commerce', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { id: 9, name: 'Income Tax', slug: 'it', category: 'Commerce', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  { id: 10, name: 'Cost Accounting', slug: 'ca', category: 'Commerce', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' },
  { id: 11, name: 'Business Law', slug: 'bl', category: 'Commerce', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { id: 12, name: 'Banking and Insurance', slug: 'bi', category: 'Commerce', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },

  // Mathematics
  { id: 13, name: 'Mathematics', slug: 'math', category: 'Mathematics', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { id: 14, name: 'Statistics', slug: 'stats', category: 'Mathematics', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  { id: 19, name: 'Discrete Mathematics', slug: 'dmath', category: 'Mathematics', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' },
  { id: 20, name: 'Linear Algebra', slug: 'la', category: 'Mathematics', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 21, name: 'Calculus', slug: 'calc', category: 'Mathematics', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },

  // Other
  { id: 15, name: 'Environmental Studies', slug: 'evs', category: 'Other', color: 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300' },
  { id: 16, name: 'Other', slug: 'other', category: 'Other', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
]

const categories = ['Computer Science', 'Commerce', 'Mathematics', 'Other']

export { subjects, categories }

export default function Dashboard() {
  const { user } = useAuth()
  const [recentNotes, setRecentNotes] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('notes')
        .select('id, title, subject_id, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(4)
      setRecentNotes(data || [])
      setLoadingNotes(false)
    }

    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, content, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(4)
      setRecentPosts(data || [])
      setLoadingPosts(false)
    }

    fetchNotes()
    fetchPosts()
  }, [])

  const getSubjectBadge = (subjId) => {
    const s = subjects.find(s => s.id === subjId)
    if (!s) return null
    return <span className={`badge ${s.color}`}>{s.name}</span>
  }

  return (
    <div className="page-container flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 md:p-10 mb-10 shadow-xl shadow-primary-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-16 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl font-bold text-white">
                {displayName[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-primary-200 text-sm font-medium flex items-center gap-1.5">
                <Sparkles size={13} className="fill-current" /> {greeting}!
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5">
                Welcome, {displayName} 👋
              </h1>
              <p className="text-primary-200 text-sm mt-1">Ready to explore or share some knowledge today?</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map(link => {
              const Icon = link.icon
              return (
                <Link key={link.to} to={link.to} className="glass-card-hover p-5 group block">
                  <div className={`w-11 h-11 rounded-xl ${link.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center`}>
                      <Icon size={14} className="text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{link.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{link.desc}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText size={18} className="text-primary-500" /> Recent Notes
              </h2>
              <Link to="/notes" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {loadingNotes ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : recentNotes.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <BookOpen size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No notes yet. Be the first to upload!</p>
                  <Link to="/upload" className="btn-primary text-sm mt-4 inline-flex">Upload Notes</Link>
                </div>
              ) : (
                recentNotes.map(note => (
                  <div key={note.id} className="glass-card-hover p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{note.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {note.subject_id && getSubjectBadge(note.subject_id)}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={11} /> {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageSquare size={18} className="text-purple-500" /> EduFeed
              </h2>
              <Link to="/feed" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {loadingPosts ? (
                <div className="flex justify-center py-8"><LoadingSpinner /></div>
              ) : recentPosts.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Rss size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No posts yet. Start the conversation!</p>
                  <Link to="/feed" className="btn-primary text-sm mt-4 inline-flex">Go to EduFeed</Link>
                </div>
              ) : (
                recentPosts.map(post => (
                  <div key={post.id} className="glass-card-hover p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {(post.profiles?.full_name || 'A')[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{post.profiles?.full_name || 'Anonymous'}</span>
                      <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                        <Clock size={11} /> {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Minimal Footer for Dashboard */}
      <footer className="py-6 mt-auto">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} EduNest. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
