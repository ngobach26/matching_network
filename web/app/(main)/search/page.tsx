'use client'

import SearchResults from '@/components/search/search-results'
import SearchSidebar from '@/components/search/search-sidebar'
import React, { useState } from 'react'

const SEARCH_TABS = [
  { key: 'all', label: 'All', icon: 'lucide:search' },
  { key: 'people', label: 'People', icon: 'lucide:user' },
  { key: 'post', label: 'Posts', icon: 'lucide:file-text' },
  { key: 'community', label: 'Community', icon: 'lucide:users' },
  // Có thể thêm Marketplace, Video, v.v.
]

export default function SearchPage() {
  // State control tab + filter (nên đưa lên đây để pass xuống cả sidebar + content)
  const [tab, setTab] = useState('all')
  const [filters, setFilters] = useState<any>({})

  return (
    <div className="flex min-h-screen bg-muted/50">
      {/* Sidebar */}
      <SearchSidebar
        currentTab={tab}
        setTab={setTab}
        filters={filters}
        setFilters={setFilters}
      />
      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <SearchResults tab={tab} filters={filters} />
      </main>
    </div>
  )
}
