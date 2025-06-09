// components/community/community-people.tsx
import PersonCard from "@/components/search/person-card"
import { mockUsers } from "../search/search-results"

export default function CommunityPeople({ community }: any) {
  return (
    <div>
      <div className="font-bold text-lg mb-4">Thành viên ({community.memberCount.toLocaleString("vi-VN")})</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockUsers.map(user => (
          <PersonCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}
