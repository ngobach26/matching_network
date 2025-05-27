import * as React from "react"
import { ThumbsUp, Heart, Smile, Star, MessageCircle } from "lucide-react"
import clsx from "clsx"

export interface Post {
  id: string
  userId: string
  userName: string
  avatarUrl?: string
  content: string
  imageUrl?: string
  createdAt: string
  reactions?: { [key: string]: number }
  comments?: Comment[]
}
export interface Comment {
  id: string
  userId: string
  userName: string
  avatarUrl?: string
  content: string
  createdAt: string
}

const REACTION_TYPES = [
  { key: "like", icon: <ThumbsUp className="w-4 h-4" />, label: "Like" },
  { key: "love", icon: <Heart className="w-4 h-4 text-red-500" />, label: "Love" },
  { key: "haha", icon: <Smile className="w-4 h-4 text-yellow-500" />, label: "Haha" },
  { key: "wow", icon: <span className="inline-block text-xl">😮</span>, label: "Wow" },
  { key: "star", icon: <Star className="w-4 h-4 text-yellow-500" />, label: "Star" },
]

const reactionIcons: Record<string, React.ReactNode> = {
  like: <ThumbsUp className="w-4 h-4 text-blue-500 inline" />,
  love: <Heart className="w-4 h-4 text-red-500 inline" />,
  haha: <Smile className="w-4 h-4 text-yellow-500 inline" />,
  wow: <span className="inline-block text-xl">😮</span>,
  star: <Star className="w-4 h-4 text-yellow-500 inline" />,
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  // mock: user đã react chưa
  const [userReact, setUserReact] = React.useState<string | null>(null)
  const [reactions, setReactions] = React.useState<{ [key: string]: number }>({ ...post.reactions })

  // Bấm react: toggle hoặc chuyển loại khác
  const handleReact = (type: string) => {
    setReactions(prev => {
      let newReactions = { ...prev }
      if (userReact) {
        // Giảm count react cũ
        if (newReactions[userReact]) newReactions[userReact] -= 1
        if (newReactions[userReact] === 0) delete newReactions[userReact]
      }
      // Nếu bấm lại loại cũ => bỏ react
      if (userReact === type) {
        setUserReact(null)
      } else {
        // Thêm react mới
        newReactions[type] = (newReactions[type] || 0) + 1
        setUserReact(type)
      }
      return newReactions
    })
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <img
          src={post.avatarUrl}
          alt={post.userName}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
        />
        <div>
          <div className="font-semibold">{post.userName}</div>
          <div className="text-xs text-gray-400">{formatTime(post.createdAt)}</div>
        </div>
      </div>
      {/* Content */}
      <div className="mb-2 text-[15px]">{post.content}</div>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post image"
          className="rounded-lg w-full max-h-80 object-cover mb-2 border"
        />
      )}

      {/* Reaction Buttons */}
      <div className="flex gap-2 mt-2 mb-1">
        {REACTION_TYPES.map(({ key, icon, label }) => (
          <button
            key={key}
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-gray-800 text-xs font-medium border transition",
              userReact === key
                ? "bg-orange-100 dark:bg-orange-950 text-orange-600 border-orange-400"
                : "bg-transparent border-transparent text-gray-500"
            )}
            onClick={() => handleReact(key)}
            type="button"
            aria-label={label}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Reaction Counts */}
      <div className="flex gap-4 items-center text-sm mb-1">
        {Object.entries(reactions).length > 0 &&
          Object.entries(reactions).map(([type, count]) => (
            <span className="flex items-center gap-1" key={type}>
              {reactionIcons[type] ?? null} {count}
            </span>
          ))}
        <span className="flex items-center gap-1 ml-auto text-gray-500">
          <MessageCircle className="w-4 h-4" /> {post.comments?.length || 0} bình luận
        </span>
      </div>

      {/* Comments */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-2 space-y-3">
          {post.comments.map(comment => (
            <div key={comment.id} className="flex gap-2 items-start">
              <img
                src={comment.avatarUrl}
                alt={comment.userName}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800"
              />
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                <div className="font-semibold text-sm">{comment.userName}</div>
                <div className="text-xs text-gray-500 mb-1">{formatTime(comment.createdAt)}</div>
                <div className="text-sm">{comment.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostCard
