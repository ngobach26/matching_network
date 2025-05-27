import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "SmartMatching",
  webDir: "out",
  server: {
    url: "http://192.168.1.2:3002", // ← Địa chỉ LAN máy bạn
    cleartext: true,
  },
}

export default config
