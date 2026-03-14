import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, Download, FileText, Filter, Grid, List, X, Trash2, Eye } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/ui/Navbar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { subjects, categories } from './Dashboard'

export default function NotesLibrary() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [noteToDelete, setNoteToDelete] = useState(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    
    const buildQuery = (selectCols) => {
      let q = supabase
        .from('notes')
        .select(selectCols)
        .order('created_at', { ascending: false })

      if (selectedSubject) {
        q = q.eq('subject_id', selectedSubject)
      } else if (selectedCategory) {
        const categorySubjectIds = subjects.filter(s => s.category === selectedCategory).map(s => s.id)
        q = q.in('subject_id', categorySubjectIds)
      }

      if (searchQuery) {
        q = q.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }
      return q
    }

    try {
      let { data, error } = await buildQuery('id, title, description, subject_id, tags, file_url, file_name, created_at, user_id, views, downloads, profiles(full_name)')
      
      // Fallback if columns "views" or "downloads" do not exist yet (Often PGRST204 or 42703)
      if (error) {
        console.warn('Primary query failed, falling back to legacy query without views/downloads:', error)
        const fallback = await buildQuery('id, title, description, subject_id, tags, file_url, file_name, created_at, user_id, profiles(full_name)')
        data = fallback.data
        error = fallback.error
      }

      if (error) {
        console.error('Error fetching notes:', error)
      }
      setNotes(data || [])
    } catch (e) {
      console.error('Unexpected error fetching notes:', e)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedSubject, searchQuery])

  useEffect(() => {
    const timeout = setTimeout(fetchNotes, 300)
    return () => clearTimeout(timeout)
  }, [fetchNotes])

  const getSubject = (id) => subjects.find(s => s.id === id)

  const handleDownload = async (note) => {
    if (!note.file_url) return
    const link = document.createElement('a')
    link.href = note.file_url
    link.download = note.file_name || `${note.title}.pdf`
    link.target = '_blank'
    link.click()

    const newDownloads = parseInt(note.downloads || 0, 10) + 1

    // Optimistically update UI so it doesn't flicker
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, downloads: newDownloads } : n))
    
    // Use RPC to bypass RLS. Regular .update() fails if the user didn't upload the note!
    const { error } = await supabase.rpc('increment_download', { note_id: note.id })
    if (error) {
       console.error("RPC increment_download failed. Ensure you ran the SQL script in Supabase!", error)
    }
  }

  const handleView = async (note) => {
    if (!note.file_url) return
    window.open(note.file_url, '_blank', 'noopener,noreferrer')

    const newViews = parseInt(note.views || 0, 10) + 1

    // Optimistically update UI
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, views: newViews } : n))
    
    // Use RPC to bypass RLS
    const { error } = await supabase.rpc('increment_view', { note_id: note.id })
    if (error) {
       console.error("RPC increment_view failed. Ensure you ran the SQL script in Supabase!", error)
    }
  }

  const handleDeleteNote = (note) => {
    setNoteToDelete(note)
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return
    const note = noteToDelete

    // First remove the file from storage if we have the file_name
    if (note.file_name) {
      const { error: storageError } = await supabase.storage.from('notes').remove([note.file_name])
      if (storageError) console.error('Error deleting file from storage:', storageError)
    }

    // Then delete the database record
    const { error } = await supabase.from('notes').delete().eq('id', note.id).eq('user_id', user.id)
    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== note.id))
    } else {
      console.error('Error deleting note record:', error)
    }
    setNoteToDelete(null)
  }

  return (
    <div className="page-container flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <BookOpen className="text-primary-600 dark:text-primary-400" size={28} />
              Notes Library
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {notes.length} notes available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
            >
              <List size={18} />
            </button>
            <Link to="/upload" className="btn-primary text-sm">
              <FileText size={16} /> Upload Notes
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes by title or description..."
              className="input-field pl-11"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => {
              setSelectedCategory(null)
              setSelectedSubject(null)
            }}
            className={`badge px-4 py-1.5 text-sm transition-all ${!selectedCategory ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
          >
            <Filter size={13} className="mr-1" /> All Subjects
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(selectedCategory === category ? null : category)
                setSelectedSubject(null)
              }}
              className={`badge px-4 py-1.5 text-sm transition-all ${selectedCategory === category ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:opacity-80'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Subject Pills (2nd Level) */}
        {selectedCategory && (
          <div className="flex flex-wrap gap-2 mb-8 -mt-4">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`badge px-4 py-1.5 text-sm transition-all ${!selectedSubject ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
            >
              All in {selectedCategory}
            </button>
            {subjects.filter(s => s.category === selectedCategory).map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
                className={`badge px-4 py-1.5 text-sm transition-all ${selectedSubject === s.id ? 'bg-primary-600 text-white shadow-md' : `${s.color} hover:opacity-80`}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* Notes Grid/List */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No notes found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {searchQuery || selectedCategory ? 'Try adjusting your filters.' : 'Be the first to upload notes!'}
            </p>
            <Link to="/upload" className="btn-primary">Upload Notes</Link>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
            : 'space-y-4'
          }>
            {notes.map(note => {
              const subject = getSubject(note.subject_id)
              return viewMode === 'grid' ? (
                <div key={note.id} className="glass-card-hover p-5 flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                      <FileText size={22} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    {subject && (
                      <span className={`badge ${subject.color} text-xs`}>{subject.name}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">{note.title}</h3>
                  {note.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 flex-1">{note.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-dark-600">
                    <span className="text-xs text-slate-400">
                      by {note.profiles?.full_name || 'Anonymous'}
                    </span>
                    <div className="flex items-center gap-2">
                      {note.user_id === user?.id && (
                        <button
                          onClick={() => handleDeleteNote(note)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {note.file_url && (
                        <button
                          onClick={() => handleView(note)}
                          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                        >
                          <Eye size={14} /> View
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(note)}
                        className="flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium group-hover:underline ml-1"
                      >
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {note.views || 0} Views
                    </span>
                    <span className="flex items-center gap-1">
                      <Download size={12} /> {note.downloads || 0} Downloads
                    </span>
                  </div>
                  {note.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div key={note.id} className="glass-card-hover p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{note.title}</h3>
                      {subject && <span className={`badge ${subject.color} text-xs`}>{subject.name}</span>}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {note.description || 'No description'} · by {note.profiles?.full_name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {note.views || 0} Views
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={12} /> {note.downloads || 0} Downloads
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {note.user_id === user?.id && (
                      <button
                        onClick={() => handleDeleteNote(note)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {note.file_url && (
                      <button
                        onClick={() => handleView(note)}
                        className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        title="View note"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(note)}
                      className="btn-secondary text-sm ml-1"
                    >
                      <Download size={15} /> Download
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all opacity-100">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in border border-slate-100 dark:border-dark-600">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Delete Note</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{noteToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setNoteToDelete(null)}
                className="btn-secondary px-5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg shadow-red-600/20 active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
