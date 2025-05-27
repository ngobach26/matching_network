// components/community/community-tabs.tsx
export default function CommunityTabs({ activeTab, setActiveTab }: any) {
    const TABS = [
      { key: "introduction", label: "Giới thiệu" },
      { key: "discussion", label: "Thảo luận" },
      { key: "people", label: "Mọi người" },
      // { key: "event", label: "Sự kiện" }, ...
    ]
    return (
      <nav className="flex gap-4 px-8 pt-2 bg-background">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`relative px-3 pb-2 text-sm font-semibold
              ${activeTab === tab.key
                ? "text-orange-600 border-b-2 border-orange-500"
                : "text-gray-600 hover:text-orange-600"
              }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    )
  }
  