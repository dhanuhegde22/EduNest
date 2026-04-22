import { useState, useEffect } from 'react'
import { Shield, Trash2, FileText, MessageSquare, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/ui/Navbar'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function AdminPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const fetchReports = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('reports')
      .select('id, content_type, content_id, reported_by, reason, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setReports(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleDelete = async (report) => {
    if (!window.confirm(`Delete this ${report.content_type} and remove the report?`)) return
    setDeletingId(report.id)

    const table = report.content_type === 'post' ? 'posts' : 'notes'

    // 1. Delete the reported content
    const { error: contentError } = await supabase
      .from(table)
      .delete()
      .eq('id', report.content_id)

    if (contentError) {
      alert(`Error deleting ${report.content_type}: ${contentError.message}`)
      setDeletingId(null)
      return
    }

    // 2. Delete the report entry
    const { error: reportError } = await supabase
      .from('reports')
      .delete()
      .eq('id', report.id)

    if (reportError) {
      alert(`Content deleted but report entry could not be removed: ${reportError.message}`)
    }

    // 3. Remove from local state
    setReports(prev => prev.filter(r => r.id !== report.id))
    setDeletingId(null)
  }

  const reportedPosts = reports.filter(r => r.content_type === 'post')
  const reportedNotes = reports.filter(r => r.content_type === 'note')

  const ReportCard = ({ report }) => (
    <div className="glass-card p-4 flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          Content ID: <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{report.content_id}</span>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          <span className="font-medium">Reason:</span> {report.reason}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
          {new Date(report.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>
      <button
        onClick={() => handleDelete(report)}
        disabled={deletingId === report.id}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        title={`Delete ${report.content_type} and remove report`}
      >
        {deletingId === report.id
          ? <LoadingSpinner size="sm" />
          : <><Trash2 size={14} /> Delete</>
        }
      </button>
    </div>
  )

  return (
    <div className="page-container flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-2">
            <Shield className="text-primary-600 dark:text-primary-400" size={28} />
            Admin Panel
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review and moderate reported content.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            <AlertCircle size={16} /> {error}
          </div>
        ) : (
          <div className="space-y-10">

            {/* Reported Posts */}
            <section>
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-purple-500" />
                Reported Posts
                <span className="ml-1 text-sm font-normal text-slate-400">({reportedPosts.length})</span>
              </h2>
              {reportedPosts.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <MessageSquare size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No reported posts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportedPosts.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </section>

            {/* Reported Notes */}
            <section>
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                <FileText size={18} className="text-primary-500" />
                Reported Notes
                <span className="ml-1 text-sm font-normal text-slate-400">({reportedNotes.length})</span>
              </h2>
              {reportedNotes.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <FileText size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No reported notes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportedNotes.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  )
}
