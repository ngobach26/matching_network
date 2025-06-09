import { Users } from "lucide-react"
export default function CommunityCard({ community }: any) {
  return (
    <div className="flex items-center bg-card rounded-lg shadow p-4 mb-2 border">
      <Users className="w-8 h-8 text-orange-500 mr-4" />
      <div className="flex-1">
        <div className="font-semibold">{community.name}</div>
        <div className="text-xs text-gray-500">{community.memberCount} thành viên</div>
        <div className="text-xs text-gray-400">{community.location}</div>
      </div>
      {/* Action: Tham gia/Đã tham gia */}
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs">
        {community.isJoined ? 'Đã tham gia' : 'Tham gia'}
      </button>
    </div>
  )
}