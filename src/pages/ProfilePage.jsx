import { useState, useEffect } from 'react'
import { User, FileText, MessageSquare, Mail, Calendar, Edit2, Camera, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { subjects } from './Dashboard'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [notes, setNotes] = useState([])
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('notes')
  const [loading, setLoading] = useState(true)
  const [editBio, setEditBio] = useState(false)
  const [bioValue, setBioValue] = useState('')
  const [savingBio, setSavingBio] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchAll = async () => {
      const [{ data: profileData }, { data: notesData }, { data: postsData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('notes').select('id, title, description, subject_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('posts').select('id, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setProfile(profileData)
      setBioValue(profileData?.bio || '')
      setNotes(notesData || [])
      setPosts(postsData || [])
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const handleSaveBio = async () => {
    setSavingBio(true)
    await supabase.from('profiles').update({ bio: bioValue }).eq('id', user.id)
    setProfile(prev => ({ ...prev, bio: bioValue }))
    setSavingBio(false)
    setEditBio(false)
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''

  const getSubject = (id) => subjects.find(s => s.id === id)

  if (loading) {
    return (
      <div className="page-container flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
      </div>
    )
  }

  return (
    <div className="page-container flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-3xl object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{displayName[0].toUpperCase()}</span>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white dark:bg-dark-700 border border-slate-200 dark:border-dark-600 shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera size={14} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{displayName}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Mail size={14} /> {user?.email}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {joinDate}</span>
              </div>

              {/* Bio */}
              <div className="mt-4">
                {editBio ? (
                  <div className="flex gap-2 items-start">
                    <textarea
                      value={bioValue}
                      onChange={e => setBioValue(e.target.value)}
                      rows={2}
                      placeholder="Tell others about yourself..."
                      className="input-field text-sm resize-none flex-1"
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={handleSaveBio} disabled={savingBio} className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 hover:bg-accent-200 transition-colors">
                        {savingBio ? <LoadingSpinner size="sm" /> : <Check size={16} />}
                      </button>
                      <button onClick={() => { setEditBio(false); setBioValue(profile?.bio || '') }} className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                      {profile?.bio || 'No bio yet. Tell others about yourself!'}
                    </p>
                    <button onClick={() => setEditBio(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 shrink-0 transition-colors">
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-6 sm:gap-4 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{notes.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Notes Shared</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{posts.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Posts Made</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-dark-800 rounded-2xl p-1.5 mb-6 w-fit">
          {[
            { id: 'notes', label: 'My Notes', icon: FileText },
            { id: 'posts', label: 'My Posts', icon: MessageSquare },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'notes' && (
          <div>
            {notes.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <FileText size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">No notes uploaded yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Share your knowledge with the community!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => {
                  const subject = getSubject(note.subject_id)
                  return (
                    <div key={note.id} className="glass-card-hover p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{note.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {subject && <span className={`badge ${subject.color} text-xs`}>{subject.name}</span>}
                          <span className="text-xs text-slate-400">{new Date(note.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <MessageSquare size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">No posts yet</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Share your thoughts on the EduFeed!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="glass-card p-5">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    <p className="text-xs text-slate-400 mt-3">{new Date(post.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <div className="mt-8"><Footer /></div>
    </div>
  )
}
