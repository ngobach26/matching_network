import { User, Search, FileText, Users } from "lucide-react"

const SEARCH_TABS = [
  { key: 'all', label: 'Tất cả', icon: <Search className="w-5 h-5 mr-2" /> },
  { key: 'people', label: 'Mọi người', icon: <User className="w-5 h-5 mr-2" /> },
  { key: 'post', label: 'Bài viết', icon: <FileText className="w-5 h-5 mr-2" /> },
  { key: 'community', label: 'Cộng đồng', icon: <Users className="w-5 h-5 mr-2" /> },
]

export default function SearchSidebar({ currentTab, setTab, filters, setFilters }: any) {
  // Render filter option theo từng tab (có thể tách thành hàm riêng)
  return (
    <aside className="w-80 bg-background border-r border-border px-6 py-8">
      <h2 className="text-xl font-bold mb-4">Kết quả tìm kiếm</h2>
      {/* Tabs */}
      <nav className="space-y-2 mb-8">
        {SEARCH_TABS.map(tab => (
          <button
            key={tab.key}
            className={`flex items-center w-full rounded px-3 py-2 text-sm font-medium 
              ${currentTab === tab.key
                ? "bg-orange-100 text-orange-600"
                : "hover:bg-muted/60 text-gray-700"}`}
            onClick={() => setTab(tab.key)}
            type="button"
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
      {/* Filter option */}
      <SidebarFilters tab={currentTab} filters={filters} setFilters={setFilters} />
    </aside>
  )
}

// Example sidebar filter content
function SidebarFilters({ tab, filters, setFilters }: any) {
  if (tab === "people") {
    return (
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-gray-500 mb-2">Vai trò</label>
        <select
          className="w-full bg-background border rounded px-3 py-2 text-sm"
          value={filters.role || ''}
          onChange={e => setFilters((f: any) => ({ ...f, role: e.target.value }))}
        >
          <option value="">Tất cả</option>
          <option value="user">Người dùng</option>
          <option value="driver">Tài xế</option>
        </select>
        <label className="block text-xs font-semibold text-gray-500 mb-2 mt-4">Tỉnh/Thành phố</label>
        <input
          className="w-full bg-background border rounded px-3 py-2 text-sm"
          placeholder="Nhập tỉnh/thành"
          value={filters.location || ''}
          onChange={e => setFilters((f: any) => ({ ...f, location: e.target.value }))}
        />
      </div>
    )
  }
  if (tab === "community") {
    return (
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-gray-500 mb-2">Tỉnh/Thành phố</label>
        <input
          className="w-full bg-background border rounded px-3 py-2 text-sm"
          placeholder="Nhập tỉnh/thành"
          value={filters.location || ''}
          onChange={e => setFilters((f: any) => ({ ...f, location: e.target.value }))}
        />
        <label className="inline-flex items-center mt-2">
          <input
            type="checkbox"
            className="accent-orange-500 mr-2"
            checked={!!filters.nearby}
            onChange={e => setFilters((f: any) => ({ ...f, nearby: e.target.checked }))}
          />
          Gần tôi
        </label>
      </div>
    )
  }
  // Có thể thêm filter cho post (ngày, loại,...)
  return null
}
