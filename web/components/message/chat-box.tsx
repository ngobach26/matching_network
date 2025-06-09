"use client"

import { useRef, useEffect, useState } from "react"
import { Send, Smile } from "lucide-react"
import clsx from "clsx"

export interface ChatMessage {
    sender_id: string
    receiver_id: string
    role: string
    message: string
    ride_id: string
    timestamp?: string
    fromMe: boolean
    // Optional: You can add name/avatar if needed for display
}

interface ChatBoxProps {
    messages: ChatMessage[]
    myAvatar: string
    theirAvatar: string
    theirName: string
    theirOnline?: boolean
    onSendMessage: (msg: string) => void
}

export default function ChatBox({
    messages,
    myAvatar,
    theirAvatar,
    theirName,
    theirOnline = true,
    onSendMessage
}: ChatBoxProps) {
    const [input, setInput] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-orange-50/80">
                <div className="relative">
                    <img src={theirAvatar} className="w-10 h-10 rounded-full border" alt="Avatar" />
                    {theirOnline && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
                    )}
                </div>
                <div>
                    <div className="font-semibold">{theirName}</div>
                    <div className="text-xs text-gray-500">
                        {theirOnline ? "Đang hoạt động" : "Offline"}
                    </div>
                </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                <div className="flex flex-col gap-3">
                    {messages.map((m, idx) => (
                        <div key={idx} className={clsx(
                            "flex",
                            m.fromMe ? "justify-end" : "justify-start"
                        )}>
                            <div className={clsx(
                                "max-w-xs px-4 py-2 rounded-lg shadow text-sm flex flex-col",
                                m.fromMe
                                    ? "bg-orange-100 text-right text-gray-800"
                                    : "bg-gray-100 text-left text-gray-800"
                            )}>
                                <div className="flex items-center mb-0.5">
                                    <img
                                        src={m.fromMe ? myAvatar : theirAvatar}
                                        className="w-5 h-5 rounded-full mr-1 border inline"
                                        alt="Avatar"
                                    />
                                    {!m.fromMe && (
                                        <span className="font-bold text-xs text-orange-600">{theirName}</span>
                                    )}
                                    <span className="ml-2 text-[10px] text-gray-400">
                                        {m.timestamp
                                            ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                            : ""}
                                    </span>
                                </div>
                                <div>{m.message}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {/* Input */}
            <form
                className="flex items-center gap-2 border-t border-border px-6 py-3 bg-background"
                onSubmit={e => {
                    e.preventDefault()
                    if (!input.trim()) return
                    onSendMessage(input)
                    setInput("")
                }}
            >
                <button type="button" className="p-1 text-gray-400 hover:text-orange-500" tabIndex={-1}>
                    <Smile className="w-6 h-6" />
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
        </div>
    )
}
