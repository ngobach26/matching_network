"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface WebSocketHookOptions {
  url: string
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number // ms giữa các lần thử lại
  reconnectAttempts?: number // số lần thử lại tối đa
  autoConnect?: boolean // mặc định TRUE
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectInterval = 5_000,
  reconnectAttempts = 5,
  autoConnect = true,
}: WebSocketHookOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [error, setError] = useState<Event | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectCountRef = useRef(0)
  const previousUrlRef = useRef<string>("")

  // Thêm tham chiếu để lưu trữ các handlers
  const handlersRef = useRef({
    onMessage,
    onOpen,
    onClose,
    onError,
  })

  // Cập nhật handlers khi props thay đổi
  useEffect(() => {
    handlersRef.current = {
      onMessage,
      onOpen,
      onClose,
      onError,
    }
  }, [onMessage, onOpen, onClose, onError])

  /* ───────── helpers ───────── */
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  /* ───────── connect ───────── */
  const connect = useCallback(() => {
    const connectUrl = url?.trim()

    // Không kết nối nếu URL trống
    if (!connectUrl) {
      console.log("Not connecting: no URL provided", { url: connectUrl })
      return
    }

    // Tránh kết nối lặp lại với cùng một URL
    if (connectUrl === previousUrlRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("Already connected to this URL:", connectUrl)
      return
    }

    // Lưu URL hiện tại để so sánh sau này
    previousUrlRef.current = connectUrl

    // Đóng kết nối cũ (nếu có)
    if (wsRef.current) {
      console.log("Closing existing connection before opening new one")
      wsRef.current.close(1000, "Creating new connection")
      wsRef.current = null
    }

    // Xóa timeout tái kết nối hiện tại (nếu có)
    clearReconnectTimeout()

    try {
      console.log("Opening WebSocket →", connectUrl)
      const ws = new WebSocket(connectUrl)

      ws.onopen = () => {
        console.log("WebSocket connected successfully to:", connectUrl)
        setIsConnected(true)
        setError(null)
        reconnectCountRef.current = 0
        handlersRef.current.onOpen?.()
      }

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data)
          setLastMessage(data)
          handlersRef.current.onMessage?.(data)
        } catch {
          setLastMessage(ev.data)
          handlersRef.current.onMessage?.(ev.data)
        }
      }

      ws.onclose = (ev) => {
        console.log("WebSocket closed, clean:", ev.wasClean, "code:", ev.code, "reason:", ev.reason)
        setIsConnected(false)
        wsRef.current = null
        handlersRef.current.onClose?.()

        // Chỉ tái kết nối nếu kết nối bị ngắt không chủ ý và chưa đạt số lần thử tối đa
        if (!ev.wasClean && reconnectCountRef.current < reconnectAttempts && connectUrl) {
          reconnectCountRef.current += 1
          console.log(
            `Attempting reconnect ${reconnectCountRef.current}/${reconnectAttempts} in ${reconnectInterval}ms`,
          )
          reconnectTimeoutRef.current = setTimeout(() => connect(), reconnectInterval)
        }
      }

      ws.onerror = (ev) => {
        console.error("WebSocket error:", ev)
        setError(ev)
        handlersRef.current.onError?.(ev)
      }

      wsRef.current = ws
    } catch (e) {
      console.error("WebSocket connect error:", e)
      setError(e as Event)
      handlersRef.current.onError?.(e as Event)
    }
  }, [url, reconnectAttempts, reconnectInterval, clearReconnectTimeout])

  /* ───────── disconnect ───────── */
  const disconnect = useCallback(() => {
    clearReconnectTimeout()
    if (wsRef.current) {
      console.log("Manually disconnecting WebSocket")
      wsRef.current.close(1000, "Client disconnect")
      wsRef.current = null
      setIsConnected(false)
      // Xóa URL đã lưu để cho phép kết nối lại với URL tương tự sau này
      previousUrlRef.current = ""
    }
  }, [clearReconnectTimeout])

  /* ───────── send message ───────── */
  const sendMessage = useCallback((payload: string | object) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected")
      return false
    }
    const msg = typeof payload === "string" ? payload : JSON.stringify(payload)
    wsRef.current.send(msg)
    return true
  }, [])

  /* ───────── auto-connect / cleanup ───────── */
  useEffect(() => {
    let isMounted = true

    if (isMounted && autoConnect && url && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
      connect()
    }

    return () => {
      isMounted = false
      if (wsRef.current) {
        console.log("Cleaning up WebSocket connection on effect cleanup")
        wsRef.current.close(1000, "Effect cleanup")
        wsRef.current = null
      }
      clearReconnectTimeout()
    }
  }, [url, autoConnect, connect, clearReconnectTimeout])

  // Thêm một cleanup riêng chỉ chạy khi component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        console.log("Cleaning up WebSocket connection on component unmount")
        wsRef.current.close(1000, "Component unmounting")
        wsRef.current = null
      }
      clearReconnectTimeout()
    }
  }, [clearReconnectTimeout])

  return { isConnected, lastMessage, error, connect, disconnect, sendMessage }
}
