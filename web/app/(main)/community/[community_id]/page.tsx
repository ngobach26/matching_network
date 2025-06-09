"use client"

import CommunityDiscussion from "@/components/community/community-discussion"
import CommunityHeader from "@/components/community/community-header"
import CommunityIntroduction from "@/components/community/community-introduction"
import CommunityPeople from "@/components/community/community-people"
import CommunitySidebar from "@/components/community/community-sidebar"
import CommunityTabs from "@/components/community/community-tabs"
import { useState } from "react"
// Bạn sẽ tách từng tab component, mock data mẫu cho từng tab

export default function CommunityPage({ params }: { params: { community_id: string } }) {
  // mock: lấy từ params hoặc API
  const [activeTab, setActiveTab] = useState("discussion")

  // mock data group info
  const community = {
    id: params.community_id,
    name: "Cầu Lông Thanh Hóa",
    coverImage: "https://images.unsplash.com/photo-1465101178521-c1a9136a162b?auto=format&fit=crop&w=1000&q=80",
    memberCount: 15400,
    isPublic: true,
    description: "Nơi trao đổi giao lưu AE cầu lông Thanh Hóa",
    location: "Thanh Hóa",
    admins: [
      // mock
      { name: "Khánh Hương", avatar: "https://randomuser.me/api/portraits/women/45.jpg", role: "Quản trị viên" },
      { name: "Hương Hương", avatar: "https://randomuser.me/api/portraits/women/42.jpg", role: "Quản trị viên" },
    ],
    recentMedia: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    ],
    // Thêm field khác nếu cần
  }

  return (
    <div>
      <CommunityHeader community={community} />
      <div className="border-b border-border">
        <CommunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
        {/* Main tab content */}
        <div className="lg:col-span-2">
          {activeTab === "introduction" && <CommunityIntroduction community={community} />}
          {activeTab === "discussion" && <CommunityDiscussion community={community} />}
          {activeTab === "people" && <CommunityPeople community={community} />}
        </div>
        {/* Sidebar phải */}
        <div className="hidden lg:block">
          <CommunitySidebar community={community} />
        </div>
      </div>
    </div>
  )
}
