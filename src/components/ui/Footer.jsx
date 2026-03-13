import { Link } from 'react-router-dom'
import { BookOpen, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Edu<span className="text-primary-600 dark:text-primary-400">Nest</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              A distraction-free academic platform where students collaborate through knowledge, not noise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Platform</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/notes', label: 'Notes Library' },
                { to: '/feed', label: 'EduFeed' },
                { to: '/upload', label: 'Upload Notes' },
                { to: '/dashboard', label: 'Dashboard' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Subjects</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Computer Science:</h4>
                <ul className="space-y-1">
                  {['Data Structures', 'Operating Systems', 'Web Development'].map(s => (
                    <li key={s} className="text-sm text-slate-500 dark:text-slate-400">{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Commerce:</h4>
                <ul className="space-y-1">
                  {['Financial Accounting', 'Business Management', 'Business Economics'].map(s => (
                    <li key={s} className="text-sm text-slate-500 dark:text-slate-400">{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Other Courses:</h4>
                <ul className="space-y-1">
                  {['Mathematics', 'Statistics', 'English Communication'].map(s => (
                    <li key={s} className="text-sm text-slate-500 dark:text-slate-400">{s}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 italic">And many more subjects...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-dark-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} EduNest. All rights reserved.
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Built for students, by students 🎓
          </p>
        </div>
      </div>
    </footer>
  )
}
