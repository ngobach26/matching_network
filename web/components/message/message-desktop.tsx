"use client"

import { useState } from "react"
import { Send, Smile, Image as ImageIcon, Search } from "lucide-react"
import clsx from "clsx"

export const mockChats = [
    // 1. Rider & Driver (đã có ở trên)
    {
        id: "driver-rider-1",
        name: "Ngọc Trần",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        role: "Rider",
        unread: 0,
        online: true,
        messages: [
            {
                fromMe: false,
                name: "Ngọc Trần",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "Chào anh, anh đã đến địa điểm đón chưa ạ?",
                time: "08:15"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Chào bạn, mình vừa tới cổng trường rồi nhé.",
                time: "08:16"
            },
            {
                fromMe: false,
                name: "Ngọc Trần",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "Ok anh, em mặc áo xanh, đang đứng gần cây ATM ạ.",
                time: "08:16"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Thấy bạn rồi nhé, mình dừng xe gần đó.",
                time: "08:17"
            },
            {
                fromMe: false,
                name: "Ngọc Trần",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "Dạ, em ra ngay ạ.",
                time: "08:17"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Ok bạn.",
                time: "08:18"
            },
        ]
    },

    // 2. User hỏi về tính năng app
    {
        id: "feature-question",
        name: "Huyền Nguyễn",
        avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        role: "User",
        unread: 1,
        online: false,
        messages: [
            {
                fromMe: false,
                name: "Huyền Nguyễn",
                avatar: "https://randomuser.me/api/portraits/women/45.jpg",
                text: "Anh ơi, làm thế nào để đăng ký làm tài xế ạ?",
                time: "09:11"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Bạn vào phần Hồ sơ > Đăng ký tài xế nhé, điền thông tin và upload giấy tờ là được duyệt!",
                time: "09:12"
            },
            {
                fromMe: false,
                name: "Huyền Nguyễn",
                avatar: "https://randomuser.me/api/portraits/women/45.jpg",
                text: "Cảm ơn anh nhiều ạ!",
                time: "09:12"
            }
        ]
    },

    // 3. Một rider hỏi lại về chuyến đi, user xã giao
    {
        id: "friendly-chat",
        name: "Quốc Minh",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        role: "Rider",
        unread: 0,
        online: true,
        messages: [
            {
                fromMe: false,
                name: "Quốc Minh",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                text: "Anh Tuấn ơi, anh tới trễ khoảng mấy phút nữa vậy ạ?",
                time: "10:05"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Anh đang tắc đường chút, khoảng 5 phút nữa tới nhé em!",
                time: "10:06"
            },
            {
                fromMe: false,
                name: "Quốc Minh",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                text: "Dạ, không sao đâu anh. Em đợi được mà 😄",
                time: "10:06"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Cảm ơn em, hôm nay đông quá. Em uống nước chờ anh chút nha!",
                time: "10:07"
            },
            {
                fromMe: false,
                name: "Quốc Minh",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                text: "Em ổn mà, anh cẩn thận nha 🚗",
                time: "10:07"
            }
        ]
    },

    // 4. Một user chat xã giao (không liên quan ride)
    {
        id: "social-chat",
        name: "Phạm Linh",
        avatar: "https://randomuser.me/api/portraits/women/55.jpg",
        role: "User",
        unread: 0,
        online: false,
        messages: [
            {
                fromMe: false,
                name: "Phạm Linh",
                avatar: "https://randomuser.me/api/portraits/women/55.jpg",
                text: "Hi Tuấn, hôm nay anh rảnh không, đi cafe không? 😁",
                time: "11:20"
            },
            {
                fromMe: true,
                name: "Anh Tuấn",
                avatar: "https://randomuser.me/api/portraits/men/12.jpg",
                text: "Chắc hôm nay anh bận chạy xe rồi, cuối tuần anh rảnh nhé!",
                time: "11:22"
            },
            {
                fromMe: false,
                name: "Phạm Linh",
                avatar: "https://randomuser.me/api/portraits/women/55.jpg",
                text: "Ok anh! Khi nào rảnh báo em nhé ☕",
                time: "11:23"
            }
        ]
    },
]

export default function MessageDesktopPage() {
    const [selectedChatId, setSelectedChatId] = useState(mockChats[0].id)
    const [input, setInput] = useState("")

    const chat = mockChats.find(c => c.id === selectedChatId) || mockChats[0]

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-muted">
            {/* Left: Chat list */}
            <aside className="w-80 border-r border-border bg-background flex flex-col">
                <div className="px-4 py-4 border-b border-border font-bold text-lg">Đoạn chat</div>
                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full rounded-full pl-10 pr-3 py-2 bg-muted/70 border border-border text-sm focus:ring-1 focus:ring-orange-200"
                            placeholder=""
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {mockChats.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedChatId(c.id)}
                            className={clsx(
                                "flex w-full items-center gap-3 px-4 py-2 border-b border-border hover:bg-muted/80 transition",
                                c.id === selectedChatId ? "bg-orange-50" : "bg-transparent"
                            )}
                        >
                            <div className="relative">
                                <img src={c.avatar} className="w-10 h-10 rounded-full border" />
                                {c.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-sm">{c.name}</div>
                                {/* <div className="text-xs text-gray-500 truncate">{c.messages}</div> */}
                            </div>
                            {c.unread > 0 && (
                                <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 rounded-full">{c.unread}</span>
                            )}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Right: Chat box */}
            <main className="flex-1 flex flex-col bg-background">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-orange-50/80">
                    <div className="relative">
                        <img src={chat.avatar} className="w-10 h-10 rounded-full border" />
                        {chat.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
                    </div>
                    <div>
                        <div className="font-semibold">{chat.name}</div>
                        <div className="text-xs text-gray-500">Đang hoạt động</div>
                    </div>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-[url('https://img.freepik.com/premium-vector/badminton-pattern-seamless-background-shuttlecock-racket_113680-279.jpg')] bg-cover bg-center bg-no-repeat">
                    <div className="flex flex-col gap-3">
                        {chat.messages.map((m, idx) => (
                            <div key={idx} className={clsx(
                                "flex",
                                m.fromMe ? "justify-end" : "justify-start"
                            )}>
                                <div className={clsx(
                                    "max-w-xs px-4 py-2 rounded-lg shadow text-sm",
                                    m.fromMe
                                        ? "bg-orange-100 text-right text-gray-800"
                                        : "bg-gray-100 text-left text-gray-800"
                                )}>
                                    <div>
                                        {!m.fromMe && <span className="font-bold text-xs text-orange-600">{m.name}</span>}
                                        <span className="ml-2 text-[10px] text-gray-400">{m.time}</span>
                                    </div>
                                    <div>{m.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Input */}
                <form
                    className="flex items-center gap-2 border-t border-border px-6 py-3 bg-background"
                    onSubmit={e => {
                        e.preventDefault()
                        // handle send message here (mock)
                        setInput("")
                    }}
                >
                    <button type="button" className="p-1 text-gray-400 hover:text-orange-500">
                        <Smile className="w-6 h-6" />
                    </button>
                    <button type="button" className="p-1 text-gray-400 hover:text-orange-500">
                        <ImageIcon className="w-6 h-6" />
                    </button>
                    <input
                        className="flex-1 rounded-full px-4 py-2 border border-border bg-muted text-sm focus:ring-1 focus:ring-orange-200"
                        placeholder="Aa"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </main>
        </div>
    )
}
