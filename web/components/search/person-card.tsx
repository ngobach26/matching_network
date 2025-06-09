import { UserPlus, MessageCircle } from "lucide-react"
export default function PersonCard({ user }: any) {
  return (
    <div className="flex items-center bg-card rounded-lg shadow p-4 mb-2 border">
      <img
        src={user.avatarUrl || '/avatar.png'}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover border mr-4"
      />
      <div className="flex-1">
        <div className="font-semibold">{user.name}</div>
        <div className="text-xs text-gray-500">{user.bio}</div>
        <div className="text-xs text-gray-400">{user.mutualFriends} bạn chung</div>
      </div>
      {/* Action: Thêm bạn/Nhắn tin ... */}
      {user.isFriend ? (
        <button className="bg-muted text-gray-600 px-3 py-1 rounded text-xs">Nhắn tin</button>
      ) : (
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
          <UserPlus className="w-4 h-4" /> Thêm bạn
        </button>
      )}
    </div>
  )
}