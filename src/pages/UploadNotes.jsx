import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, CheckCircle, BookOpen, Tag, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/ui/Navbar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { subjects } from './Dashboard'

export default function UploadNotes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', tags: '' })
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError('')
    } else {
      setError('Only PDF files are allowed.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a PDF file to upload.'); return }
    if (!form.title.trim()) { setError('Title is required.'); return }
    setError('')
    setLoading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('notes')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (storageError) throw storageError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('notes').getPublicUrl(fileName)

      // Insert into DB
      const { error: dbError } = await supabase.from('notes').insert({
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        subject_id: form.subjectId ? parseInt(form.subjectId) : null,
        tags: form.tags.trim(),
        file_url: publicUrl,
        file_name: file.name,
      })

      if (dbError) throw dbError

      setSuccess(true)
      setTimeout(() => navigate('/notes'), 2500)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page-container flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-accent-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Notes Uploaded! 🎉</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Your notes are now live in the library.</p>
            <LoadingSpinner />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page-container flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-2">
            <Upload className="text-primary-600 dark:text-primary-400" size={28} />
            Upload Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Share your knowledge with the EduNest community.</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* PDF Drop Zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">PDF File *</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('pdf-input').click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${dragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : file
                      ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/20'
                      : 'border-slate-300 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'
                  }`}
              >
                <input
                  id="pdf-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                      <FileText size={24} className="text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="ml-auto p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Drop your PDF here or click to browse</p>
                    <p className="text-xs text-slate-400 mt-1">PDF files only, up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
              <input
                type="text" name="title" required
                value={form.title} onChange={handleChange}
                placeholder="e.g. Complete Data Structures Notes — Unit 3"
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                name="description" rows={3}
                value={form.description} onChange={handleChange}
                placeholder="Brief description of what these notes cover..."
                className="input-field resize-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <BookOpen size={15} className="inline mr-1" /> Subject
              </label>
              <select
                name="subjectId" value={form.subjectId} onChange={handleChange}
                className="input-field"
              >
                <option value="">Select a subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Tag size={15} className="inline mr-1" /> Tags
              </label>
              <input
                type="text" name="tags"
                value={form.tags} onChange={handleChange}
                placeholder="trees, graphs, recursion (comma-separated)"
                className="input-field"
              />
              <p className="text-xs text-slate-400 mt-1">Separate tags with commas to help others find your notes</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-base"
            >
              {loading ? (
                <><LoadingSpinner size="sm" /> Uploading...</>
              ) : (
                <><Upload size={18} /> Upload Notes</>
              )}
            </button>
          </form>
        </div>
      </main>

    </div>
  )
}
