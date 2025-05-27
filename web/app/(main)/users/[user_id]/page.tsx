import ProfileActions from "@/components/users/profile-actions"
import ProfileAvatar from "@/components/users/profile-avatar"
import ProfileCover from "@/components/users/profile-cover"
import ProfileTabs from "@/components/users/profile-tabs/profile-tabs"
import { BookOpen, Info, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs"
import ProfileIntroduction, { mockUser } from "@/components/users/profile-tabs/profile-introduction"
import ProfilePosts, { mockPosts } from "@/components/users/profile-tabs/profile-posts"

export default function UserProfilePage() {
  // fetch user info, posts, loading state...
  // const user = ...
  // const posts = ...

  return (
    <div>
      <ProfileCover
      //   coverUrl={user.coverUrl} 
      />
      {/* Avatar overlay – absolute center-bottom cover, dịch translate-y */}
      <div className="relative w-full flex justify-center">
        <div className="absolute -bottom-14">
          <ProfileAvatar
            // avatarUrl={user.avatarUrl}
            // alt={user.name}
            size={128}
          // editable={user.isCurrentUser} // chỉ cho chính chủ sửa
          // onEditClick={() => {/* mở modal upload avatar */}}
          />
        </div>
      </div>
      <div className="flex justify-end mt-20 pr-5">
      </div>
      <ProfileTabs
        tabItems={[
          { key: "introduction", label: "Introduction" },
          { key: "posts", label: "Posts" },
        ]}
        children={{
          introduction: <ProfileIntroduction user={mockUser} />,
          posts: <ProfilePosts posts={mockPosts} />,
        }}
      />
    </div>
  )
}
