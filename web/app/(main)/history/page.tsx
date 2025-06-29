"use client"

import { useState } from "react"
import { RideHistory } from "@/components/history/RideHistory"
import { DriveHistory } from "@/components/history/DriveHistory"

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"ride" | "drive">("ride")

  return (
    <div className="flex flex-col items-center min-h-[80vh] w-full bg-white">
      <div className="w-full max-w-4xl mt-10 bg-white px-4 sm:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center">History</h1>
        <div className="flex justify-center mb-8">
          <nav className="flex gap-6 border-b border-gray-200 w-full max-w-md" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("ride")}
              className={`flex-1 text-base font-semibold pb-3 transition border-b-2
                ${activeTab === "ride"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-orange-500"}
              `}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("drive")}
              className={`flex-1 text-base font-semibold pb-3 transition border-b-2
                ${activeTab === "drive"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-orange-500"}
              `}
            >
              Drive History
            </button>
          </nav>
        </div>
        <div className="min-h-[200px]">
          {activeTab === "ride" ? <RideHistory /> : <DriveHistory />}
        </div>
      </div>
    </div>
  )
}
