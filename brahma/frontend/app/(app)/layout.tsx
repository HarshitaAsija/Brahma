'use client'

import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { sidebarCollapsed, sidebarOpen } = useUIStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const marginLeft = isMobile
    ? sidebarOpen
      ? '256px'
      : '0px'
    : sidebarCollapsed
    ? '80px'
    : '256px'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="flex-shrink-0" />
      <div className="flex-1 flex flex-col transition-[margin] duration-200" style={{ marginLeft }}>
        <Header className="z-20" />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}