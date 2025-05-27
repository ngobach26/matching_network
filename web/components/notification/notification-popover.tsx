"use client"

import { useState } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { Bell, CheckCircle } from "lucide-react"
import clsx from "clsx"
import { Button } from "../ui/button"

const mockNotifications = [
    {
        id: "1",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        content: <><span className="font-semibold">Chi Linh</span> đã chia sẻ bài viết của <span className="font-semibold">One cup of Thi</span>: "Chỉ cần gồng hết sức để đi qua cơn bão..."</>,
        time: "22 giờ",
        unread: true,
    },
    {
        id: "2",
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        content: <><span className="font-semibold">Nguyễn Thành</span> đã thêm một ảnh trong <span className="font-semibold">Hội Review đồ ăn có tâm!!!</span>.</>,
        time: "1 ngày",
        unread: true,
    },
    {
        id: "3",
        avatar: "https://randomuser.me/api/portraits/men/30.jpg",
        content: <><span className="font-semibold">Nguyễn Đạt</span> đã chia sẻ bài viết của <span className="font-semibold">DAV PROM.</span></>,
        time: "1 ngày",
        unread: false,
    },
    {
        id: "4",
        avatar: "https://randomuser.me/api/portraits/women/50.jpg",
        content: <><span className="font-semibold">Tổng Phúc Thảo Nguyên</span> đã đăng 2 liên kết: Ngon phết mà</>,
        time: "2 ngày",
        unread: false,
    },
    {
        id: "5",
        avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80",
        content: <><span className="font-semibold">Không Giỏi Tiếng Anh - Xóa Group!!!</span>: ai học r rv cho mik với, học có ok k ạ</>,
        time: "2 ngày",
        unread: true,
    },
    {
        id: "6",
        avatar: "https://images.unsplash.com/photo-1465101178521-c1a9136a162b?auto=format&fit=crop&w=80&q=80",
        content: <><span className="font-semibold">Cầu Lông THANH HOÁ:</span> 😢bán xả giá cho ace cây Vs Blade 8300...</>,
        time: "2 ngày",
        unread: false,
    },
]

export default function NotificationPopover() {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState<"all" | "unread">("all")

    const notifications =
        tab === "all"
            ? mockNotifications
            : mockNotifications.filter(n => n.unread)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {mockNotifications.some(n => n.unread) && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-orange-500 rounded-full"></span>
                    )}
                    <span className="sr-only">Thông báo</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-96 p-0 rounded-xl shadow-xl border border-border bg-white"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <div className="font-bold text-lg">Thông báo</div>
                    <button className="text-gray-500 hover:text-orange-600 text-xs">...</button>
                </div>
                {/* Tabs */}
                <div className="flex gap-4 px-5 border-b border-gray-100">
                    <button
                        className={clsx(
                            "py-2 text-sm font-medium transition",
                            tab === "all"
                                ? "text-orange-600 border-b-2 border-orange-500"
                                : "text-gray-600 hover:text-orange-600"
                        )}
                        onClick={() => setTab("all")}
                    >
                        Tất cả
                    </button>
                    <button
                        className={clsx(
                            "py-2 text-sm font-medium transition",
                            tab === "unread"
                                ? "text-orange-600 border-b-2 border-orange-500"
                                : "text-gray-600 hover:text-orange-600"
                        )}
                        onClick={() => setTab("unread")}
                    >
                        Chưa đọc
                    </button>
                </div>
                {/* Danh sách thông báo */}
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 && (
                        <div className="text-center text-gray-400 py-8">Không có thông báo.</div>
                    )}
                    {notifications.length > 0 && (
                        <ul className="divide-y divide-gray-100">
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className={clsx(
                                        "flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-orange-50 transition group",
                                        n.unread && "bg-orange-50"
                                    )}
                                >
                                    <img src={n.avatar} className="w-10 h-10 rounded-full border" alt="avatar" />
                                    <div className="flex-1">
                                        <div className="text-sm">{n.content}</div>
                                        <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                                    </div>
                                    {n.unread && <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Footer */}
                <div className="border-t border-gray-100 text-center px-5 py-2">
                    <button className="w-full bg-muted hover:bg-gray-100 text-gray-800 text-sm font-medium rounded px-4 py-2 transition">
                        Xem thông báo trước đó
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
