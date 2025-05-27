// components/community/community-discussion.tsx
import PostCard from "../posts/post-card"
import { mockPosts } from "../users/profile-tabs/profile-posts"

export default function CommunityDiscussion({ community }: any) {
  // Có thể filter post theo community_id
  return (
    <div className="space-y-4">
      {/* Box nhập status */}
      <div className="bg-card border rounded-lg p-4 mb-4">
        <input className="w-full rounded bg-muted/50 border px-3 py-2 mb-2 text-sm" placeholder="Bạn viết gì đi..." />
        <div className="flex gap-2 text-xs">
          <button className="bg-muted text-gray-600 rounded px-2 py-1">Bài viết ẩn danh</button>
          <button className="bg-muted text-gray-600 rounded px-2 py-1">Thăm dò ý kiến</button>
          <button className="bg-muted text-gray-600 rounded px-2 py-1">Cảm xúc/hoạt động</button>
        </div>
      </div>
      {/* Danh sách post */}
      {mockPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
