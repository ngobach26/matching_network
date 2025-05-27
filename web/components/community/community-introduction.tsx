// components/community/community-introduction.tsx
export default function CommunityIntroduction({ community }: any) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <div className="font-bold text-lg mb-2">Giới thiệu về nhóm này</div>
        <div className="mb-2">{community.description}</div>
        <div className="text-sm text-gray-500 mb-1">Loại nhóm: {community.isPublic ? "Công khai" : "Kín"}</div>
        <div className="text-sm text-gray-500 mb-1">Địa điểm: {community.location}</div>
        <div className="text-sm text-gray-500 mb-1">Thành viên: {community.memberCount.toLocaleString("vi-VN")}</div>
      </div>
    )
  }
  