// components/community/community-header.tsx
import { Users, Globe, Lock } from "lucide-react"

export default function CommunityHeader({ community }: any) {
  return (
    <div className="relative h-52 w-full mb-8">
      {/* Cover image */}
      <img
        src={community.coverImage}
        alt={community.name}
        className="w-full h-52 object-cover rounded-lg"
      />
      {/* Overlay info */}
      <div className="absolute bottom-2 left-8 text-white drop-shadow-lg">
        <div className="text-2xl font-bold">{community.name}</div>
        <div className="flex items-center gap-4 mt-1 text-sm">
          <span className="flex items-center gap-1">
            {community.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {community.isPublic ? "Nhóm công khai" : "Nhóm kín"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" /> {community.memberCount.toLocaleString("vi-VN")} thành viên
          </span>
        </div>
      </div>
      {/* Action button (nên đặt cố định góc phải) */}
      <div className="absolute bottom-4 right-8 flex gap-2">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded px-4 py-1 shadow text-sm">+ Mời</button>
        <button className="bg-muted text-gray-800 rounded px-4 py-1 shadow text-sm border border-border">Chia sẻ</button>
        <button className="bg-muted text-gray-800 rounded px-4 py-1 shadow text-sm border border-border">Đã tham gia</button>
      </div>
    </div>
  )
}
