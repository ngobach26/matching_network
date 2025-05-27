"use client"

import * as React from "react"
import PostCard, { Post } from "../../posts/post-card"

interface ProfilePostsProps {
    posts: Post[]
}

export const mockPosts: Post[] = [
    {
        id: "p1",
        userId: "u12345",
        userName: "Nguyen Van A",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        content: "Chuyến đi Đà Lạt quá tuyệt vời 🚗🌲! Cảm ơn mọi người đã đồng hành.",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=cover&w=800&q=80",
        createdAt: "2024-05-21T10:22:00Z",
        reactions: { like: 24, love: 7 },
        comments: [
            {
                id: "c1",
                userId: "u2",
                userName: "Le Thi B",
                avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
                content: "Ảnh đẹp quá anh ơi, lần sau cho em đi ké nhé! 😍",
                createdAt: "2024-05-21T11:00:00Z"
            },
            {
                id: "c2",
                userId: "u3",
                userName: "Tran Van C",
                avatarUrl: "https://randomuser.me/api/portraits/men/33.jpg",
                content: "Chuyến này có gặp mưa không anh?",
                createdAt: "2024-05-21T11:10:00Z"
            }
        ]
    },
    {
        id: "p2",
        userId: "u12345",
        userName: "Nguyen Van A",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        content: "Nhận chuyến xe đi Hà Đông giá cực tốt, an toàn, đúng giờ! Liên hệ mình qua app hoặc inbox nhé.",
        createdAt: "2024-05-18T08:30:00Z",
        reactions: { like: 14 },
        comments: []
    },
    {
        id: "p3",
        userId: "u12345",
        userName: "Nguyen Van A",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        content: "Mình vừa đạt mốc 200 chuyến xe, cảm ơn mọi người đã tin tưởng và ủng hộ 🏆",
        createdAt: "2024-05-10T20:00:00Z",
        reactions: { like: 10, wow: 3 },
        comments: [
            {
                id: "c3",
                userId: "u4",
                userName: "Pham D",
                avatarUrl: "https://randomuser.me/api/portraits/men/77.jpg",
                content: "Chúc mừng anh nhé! Xứng đáng lắm 👍",
                createdAt: "2024-05-10T21:01:00Z"
            }
        ]
    }
]


const ProfilePosts: React.FC<ProfilePostsProps> = ({ posts }) => {
    if (!posts || posts.length === 0) {
        return (
            <div className="text-gray-400 italic p-4 text-center">
                Chưa có bài viết nào.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}

export default ProfilePosts
