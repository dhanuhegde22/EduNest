import { useState, useEffect } from 'react'
import { Heart, MessageSquare, Send, Rss, ChevronDown, ChevronUp, AlertCircle, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/ui/Navbar'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function PostCard({ post, currentUserId, onLike, onComment, onDeletePost }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [postingComment, setPostingComment] = useState(false)

  const fetchComments = async () => {
    if (comments.length > 0) { setShowComments(true); return }
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, user_id, profiles(full_name)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoadingComments(false)
    setShowComments(true)
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', currentUserId)
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    } else {
      console.error('Error deleting comment:', error)
    }
  }

  const handleCommentToggle = () => {
    if (!showComments) { fetchComments() } else { setShowComments(false) }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setPostingComment(true)
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, user_id: currentUserId, content: newComment.trim() })
      .select('id, content, created_at, profiles(full_name)')
      .single()
    if (data) {
      setComments(prev => [...prev, data])
      onComment(post.id)
    }
    setNewComment('')
    setPostingComment(false)
  }

  const isLiked = post.liked_by_me
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="glass-card p-5 md:p-6">
      {/* Author */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white font-bold text-sm">
            {(post.profiles?.full_name || 'A')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{post.profiles?.full_name || 'Anonymous'}</p>
          <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
        </div>
        {post.user_id === currentUserId && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="ml-auto p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-dark-600">
        <button
          onClick={() => onLike(post.id, isLiked)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg ${isLiked
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
        >
          <Heart size={16} className={isLiked ? 'fill-current' : ''} />
          {post.like_count || 0}
        </button>
        <button
          onClick={handleCommentToggle}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-all duration-200"
        >
          <MessageSquare size={16} />
          {post.comment_count || 0}
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-600">
          {loadingComments ? (
            <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-2">No comments yet. Start the discussion!</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">
                        {(c.profiles?.full_name || 'A')[0]}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-dark-700 rounded-xl px-3 py-2 flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {c.profiles?.full_name || 'Anonymous'}
                        </p>
                        {c.user_id === currentUserId && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                            title="Delete comment"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="input-field text-sm py-2 flex-1"
            />
            <button
              type="submit"
              disabled={postingComment || !newComment.trim()}
              className="btn-primary text-sm px-4 py-2 shrink-0"
            >
              {postingComment ? <LoadingSpinner size="sm" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function EduFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const fetchPosts = async () => {
    setLoading(true)
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, content, created_at, user_id, profiles(full_name)')
      .order('created_at', { ascending: false })

    if (!postsData) { setLoading(false); return }

    // Fetch likes and comments count for each post
    const postsWithMeta = await Promise.all(postsData.map(async (post) => {
      const [{ count: likeCount }, { count: commentCount }, { data: userLike }] = await Promise.all([
        supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
        supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle(),
      ])
      return { ...post, like_count: likeCount, comment_count: commentCount, liked_by_me: !!userLike }
    }))

    setPosts(postsWithMeta)
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    setError('')
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      content: newPost.trim(),
    })
    if (error) {
      setError(error.message)
      setPosting(false)
    } else {
      setNewPost('')
      setPosting(false)
      fetchPosts()
    }
  }

  const handleLike = async (postId, isLiked) => {
    if (isLiked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
    }
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked_by_me: !isLiked, like_count: isLiked ? (p.like_count - 1) : (p.like_count + 1) }
        : p
    ))
  }

  const handleComment = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
    ))
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId))
    } else {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <div className="page-container flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-2">
            <Rss className="text-purple-600 dark:text-purple-400" size={28} />
            EduFeed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Share knowledge, ask questions, engage academically.</p>
        </div>

        {/* Compose */}
        <div className="glass-card p-5 mb-6">
          <form onSubmit={handleCreatePost}>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">
                  {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share a resource, ask a question, or post a tip..."
                rows={3}
                className="input-field resize-none flex-1 text-sm"
              />
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="btn-primary text-sm"
              >
                {posting ? <LoadingSpinner size="sm" /> : <><Send size={15} /> Post</>}
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Rss size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No posts yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onLike={handleLike}
                onComment={handleComment}
                onDeletePost={handleDeletePost}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
