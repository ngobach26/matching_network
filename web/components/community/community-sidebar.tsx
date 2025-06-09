// components/community/community-sidebar.tsx
import { Globe, Eye, MapPin } from "lucide-react"

export default function CommunitySidebar({ community }: any) {
  return (
    <aside className="space-y-6">
      {/* Giới thiệu ngắn */}
      <div className="bg-card rounded-lg border p-4">
        <div className="font-bold mb-2">Giới thiệu</div>
        <div className="text-sm text-gray-700 mb-2">{community.description}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Globe className="w-4 h-4" /> {community.isPublic ? "Công khai" : "Kín"}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Eye className="w-4 h-4" /> Hiển thị: Ai cũng có thể tìm thấy nhóm này
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <MapPin className="w-4 h-4" /> {community.location}
        </div>
      </div>
      {/* Media gần đây */}
      <div className="bg-card rounded-lg border p-4">
        <div className="font-bold mb-2">File phương tiện mới đây</div>
        <div className="flex gap-2 flex-wrap">
          {community.recentMedia?.map((url: string, idx: number) => (
            <img key={idx} src={url} alt="" className="w-16 h-16 rounded object-cover border" />
          ))}
        </div>
      </div>
      {/* Quản trị viên */}
      <div className="bg-card rounded-lg border p-4">
        <div className="font-bold mb-2">Quản trị viên</div>
        <div className="flex gap-2">
          {community.admins?.map((ad: any) => (
            <div key={ad.name} className="flex flex-col items-center">
              <img src={ad.avatar} className="w-10 h-10 rounded-full border mb-1" alt={ad.name} />
              <div className="text-xs">{ad.name}</div>
              <span className="text-[10px] text-orange-500">{ad.role}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
