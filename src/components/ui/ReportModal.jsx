import { useState } from 'react'
import { X, Flag, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'

const REPORT_REASONS = [
  'Not educational content',
  'Spam or irrelevant',
  'Wrong subject',
  'Other',
]

/**
 * ReportModal
 * Props:
 *   contentType  – 'note' | 'post'
 *   contentId    – UUID string
 *   onClose      – called when modal should close
 */
export default function ReportModal({ contentType, contentId, onClose }) {
  const { user } = useAuth()
  const [selectedReason, setSelectedReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'duplicate' | 'error'

  const handleSubmit = async () => {
    if (!selectedReason) return
    setSubmitting(true)
    setStatus(null)

    const { error } = await supabase.from('reports').insert({
      content_type: contentType,
      content_id: contentId,
      reported_by: user.id,
      reason: selectedReason,
    })

    setSubmitting(false)

    if (!error) {
      setStatus('success')
      setTimeout(onClose, 1800)
    } else if (error.code === '23505') {
      // Postgres unique violation — already reported
      setStatus('duplicate')
    } else {
      console.error('Error submitting report:', error)
      setStatus('error')
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-dark-600 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <Flag size={18} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-tight">
                Report Content
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{contentType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status messages */}
        {status === 'success' && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl mb-4">
            <CheckCircle size={16} className="shrink-0" />
            Report submitted successfully
          </div>
        )}
        {status === 'duplicate' && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} className="shrink-0" />
            You have already reported this content
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} className="shrink-0" />
            Something went wrong. Please try again.
          </div>
        )}

        {/* Reason selection (hidden after success) */}
        {status !== 'success' && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Why are you reporting this {contentType}?
            </p>
            <div className="space-y-2 mb-5">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left text-sm px-4 py-3 rounded-xl border transition-all duration-150 ${
                    selectedReason === reason
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium'
                      : 'border-slate-200 dark:border-dark-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-dark-500 hover:bg-slate-50 dark:hover:bg-dark-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="btn-secondary px-5">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || submitting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg shadow-red-600/20 active:scale-[0.98] text-sm"
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
