"use client"

import { useState } from "react"
import { Send, Smile, Image as ImageIcon, Search, ArrowLeft } from "lucide-react"
import clsx from "clsx"
import { mockChats } from "./message-desktop"

export default function MessageMobilePage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [input, setInput] = useState("")

  // Lấy chat đang chọn
  const chat = mockChats.find(c => c.id === selectedChatId)

  // Mobile: width full, hide/show từng màn theo selectedChatId
  return (
    <div className="w-full max-w-md mx-auto h-[100dvh] bg-muted relative">
      {/* List chat */}
      {!selectedChatId && (
        <div className="absolute inset-0 flex flex-col bg-background">
          <div className="p-2 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full rounded-full pl-10 pr-3 py-2 bg-muted/70 border border-border text-sm focus:ring-1 focus:ring-orange-200"
                placeholder="Tìm kiếm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {mockChats.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChatId(c.id)}
                className={clsx(
                  "flex w-full items-center gap-3 px-4 py-3 border-b border-border hover:bg-muted/80 transition",
                )}
              >
                <div className="relative">
                  <img src={c.avatar} className="w-10 h-10 rounded-full border" />
                  {c.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-sm">{c.name}</div>
                  {/* Hiển thị tin nhắn cuối cùng */}
                  <div className="text-xs text-gray-500 truncate">
                    {c.messages.at(-1)?.text}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-xs px-1.5 rounded-full">{c.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat detail */}
      {selectedChatId && chat && (
        <div className="absolute inset-0 flex flex-col bg-background">
          {/* Header chat với nút Back */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-orange-50">
            <button onClick={() => setSelectedChatId(null)} className="p-1 -ml-2">
              <ArrowLeft className="w-6 h-6 text-orange-500" />
            </button>
            <div className="relative mr-2">
              <img src={chat.avatar} className="w-9 h-9 rounded-full border" />
              {chat.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
            </div>
            <div>
              <div className="font-semibold">{chat.name}</div>
              <div className="text-xs text-gray-500">{chat.online ? "Đang hoạt động" : "Offline"}</div>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 bg-[url('https://img.freepik.com/premium-vector/badminton-pattern-seamless-background-shuttlecock-racket_113680-279.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="flex flex-col gap-2">
              {chat.messages.map((m, idx) => (
                <div key={idx} className={clsx(
                  "flex",
                  m.fromMe ? "justify-end" : "justify-start"
                )}>
                  <div className={clsx(
                    "max-w-[70%] px-3 py-2 rounded-lg shadow text-sm break-words",
                    m.fromMe
                      ? "bg-orange-100 text-gray-800"
                      : "bg-white border text-gray-800"
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
            className="flex items-center gap-2 border-t border-border px-3 py-2 bg-background"
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
        </div>
      )}
    </div>
  )
}
