"use client"

import * as React from "react"
import * as Tabs from "@radix-ui/react-tabs"
import clsx from "clsx"

// Optionally, bạn có thể nhận thêm icon cho từng tab
interface TabItem {
  key: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface ProfileTabsProps {
  defaultTab?: string
  tabItems: TabItem[]
  children: { [key: string]: React.ReactNode }
  className?: string
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  defaultTab,
  tabItems,
  children,
  className,
}) => {
  const firstTab = tabItems.find(t => !t.disabled)?.key || tabItems[0]?.key
  const [value, setValue] = React.useState(defaultTab || firstTab)

  React.useEffect(() => {
    if (defaultTab) setValue(defaultTab)
  }, [defaultTab])

  return (
    <Tabs.Root
      value={value}
      onValueChange={setValue}
      className={clsx("w-full", className)}
    >
      <Tabs.List className="flex gap-1 border-b bg-background rounded-t-lg px-2">
        {tabItems.map(tab => (
          <Tabs.Trigger
            key={tab.key}
            value={tab.key}
            disabled={tab.disabled}
            className={clsx(
              "relative px-4 py-2 text-sm font-medium whitespace-nowrap transition border-b-2 border-transparent rounded-t focus-visible:outline-none",
              "data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400",
              "hover:bg-orange-50 dark:hover:bg-orange-950",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {tab.icon && <span className="inline-block mr-2">{tab.icon}</span>}
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <div className="mt-2">
        {tabItems.map(tab => (
          <Tabs.Content key={tab.key} value={tab.key} className="w-full">
            {children[tab.key] ?? null}
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  )
}

export default ProfileTabs
