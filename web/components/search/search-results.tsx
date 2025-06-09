import PostCard from "@/components/posts/post-card"
import PersonCard from "./person-card"
import CommunityCard from "./community-card"
export const mockUsers = [
    {
        id: "1",
        name: "Minh Le",
        avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        bio: "Tài xế · Sống tại Hà Nội",
        mutualFriends: 10,
        isFriend: false,
    },
    {
        id: "2",
        name: "Ngọc Trần",
        avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
        bio: "Người dùng · TP Hồ Chí Minh",
        mutualFriends: 4,
        isFriend: true,
    },
    {
        id: "3",
        name: "Duy Nguyễn",
        avatarUrl: "https://randomuser.me/api/portraits/men/21.jpg",
        bio: "Tài xế · Đà Nẵng",
        mutualFriends: 7,
        isFriend: false,
    },
    {
        id: "4",
        name: "Thu Phạm",
        avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
        bio: "Người dùng · Hải Phòng",
        mutualFriends: 2,
        isFriend: false,
    },
]
export const mockPosts = [
    {
        id: "p1",
        userId: "1",
        userName: "Minh Le",
        avatarUrl: "https://randomuser.me/api/portraits/men/12.jpg",
        content: "Có ai biết quán cafe nào đẹp ở Hà Nội không nhỉ?",
        imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
        createdAt: "2024-05-20T08:25:00Z",
        reactions: { like: 4, love: 2, haha: 1 },
        comments: [
            {
                id: "c1",
                userId: "2",
                userName: "Ngọc Trần",
                avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
                content: "Đi thử The Coffee House đi bạn!",
                createdAt: "2024-05-20T09:00:00Z"
            },
        ]
    },
    {
        id: "p2",
        userId: "3",
        userName: "Duy Nguyễn",
        avatarUrl: "https://randomuser.me/api/portraits/men/21.jpg",
        content: "Hôm nay lái xe được 5 chuyến, cảm ơn mọi người đã ủng hộ!",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        createdAt: "2024-05-19T16:40:00Z",
        reactions: { like: 7, star: 2 },
        comments: []
    },
    {
        id: "p3",
        userId: "4",
        userName: "Thu Phạm",
        avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
        content: "Có ai đi Thanh Hóa cuối tuần này không, share xe với mình nhé!",
        imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
        createdAt: "2024-05-18T13:30:00Z",
        reactions: { like: 3 },
        comments: []
    },
]
export const mockCommunities = [
    {
        id: "cm1",
        name: "Cộng đồng Tài xế Hà Nội",
        location: "Hà Nội",
        memberCount: 2524,
        isJoined: true,
        imageUrl: "https://images.unsplash.com/photo-1465101178521-c1a9136a162b?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "cm2",
        name: "Hội chia sẻ kinh nghiệm lái xe",
        location: "Toàn quốc",
        memberCount: 1032,
        isJoined: false,
        imageUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: "cm3",
        name: "Chia sẻ quán cafe đẹp",
        location: "TP HCM",
        memberCount: 814,
        isJoined: false,
        imageUrl: "https://images.unsplash.com/photo-1465101178521-c1a9136a162b?auto=format&fit=crop&w=400&q=80"
    },
]


export default function SearchResults({ tab, filters }: any) {
    // Dữ liệu mock, bạn sẽ lấy từ API hoặc redux/store sau
    if (tab === "post") {
        // Render danh sách post
        const posts: any[] = mockPosts // gọi api/filter sau
        return (
            <div className="space-y-4">
                {posts.map((post, i) => (
                    <PostCard key={post.id} post={post} />
                ))}
                {posts.length === 0 && <div className="text-gray-500 mt-8">Không tìm thấy bài viết nào.</div>}
            </div>
        )
    }
    if (tab === "people") {
        // Render danh sách người
        const people: any[] = mockUsers // gọi api/filter sau
        return (
            <div className="space-y-3">
                {people.map(person => (
                    <PersonCard key={person.id} user={person} />
                ))}
                {people.length === 0 && <div className="text-gray-500 mt-8">Không tìm thấy người dùng phù hợp.</div>}
            </div>
        )
    }
    if (tab === "community") {
        // Render danh sách community
        const communities: any[] = mockCommunities
        return (
            <div className="space-y-3">
                {communities.map(community => (
                    <CommunityCard key={community.id} community={community} />
                ))}
                {communities.length === 0 && <div className="text-gray-500 mt-8">Không tìm thấy cộng đồng phù hợp.</div>}
            </div>
        )
    }
    // Tab "all": mix nhiều loại
    return (
        <div className="space-y-6">
            {/* Có thể render gộp top 3 Post + People + Community */}
            <div>
                <div className="font-bold mb-2 text-lg">Mọi người</div>
                <div className="space-y-3">
                    {mockUsers.map(person => (
                        <PersonCard key={person.id} user={person} />
                    ))}
                    {mockUsers.length === 0 && <div className="text-gray-500 mt-8">Không tìm thấy người dùng phù hợp.</div>}
                </div>
            </div>
            <div>
                <div className="font-bold mb-2 text-lg">Cộng đồng</div>
                <div className="space-y-3">
                    {mockCommunities.map(community => (
                        <CommunityCard key={community.id} community={community} />
                    ))}
                    {mockCommunities.length === 0 && <div className="text-gray-500 mt-8">Không tìm thấy cộng đồng phù hợp.</div>}
                </div>
            </div>
            <div>
                <div className="font-bold mb-2 text-lg">Bài viết</div>
                {/* <div className="space-y-4">
                    {mockPosts.map((post, i) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                    {mockPosts.length === 0 && <div className="text-gray-500 mt-8">Không tìm thấy bài viết nào.</div>}
                </div> */}
            </div>
        </div>
    )
}
