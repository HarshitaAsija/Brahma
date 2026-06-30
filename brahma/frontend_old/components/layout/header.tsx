'use client'

import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/ui-store'

export default function Header({ className }: { className?: string }) {
  const { sidebarCollapsed, sidebarOpen, setSidebarCollapsed, setSidebarOpen } = useUIStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  return (
    <header className={`${className} flex h-16 items-center justify-between px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20`}>
      {/* Sidebar toggle button */}
      <button
        onClick={handleToggle}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Toggle sidebar"
      >
        {isMobile ? (
          <> {/* Hamburger icon for mobile */}
            <span className="block h-0.5 w-4 bg-gray-600 dark:bg-gray-300 mb-1.5"></span>
            <span className="block h-0.5 w-4 bg-gray-600 dark:bg-gray-300 mb-1.5"></span>
            <span className="block h-0.5 w-4 bg-gray-600 dark:bg-gray-300"></span>
          </>
        ) : (
          <> {/* Arrow icon for desktop */}
            <span className={`h-4 w-4 ${sidebarCollapsed ? 'rotate-90' : ''}`} />
          </>
        )}
      </button>

      {/* Brand - centered */}
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded"></div>
        <span className="font-semibold text-xl">BRAHMA</span>
      </div>

      {/* User profile placeholder */}
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        {/* Optional: username or dropdown */}
        {/* <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">John Doe</span>
          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="h-4 w-4">∨</span>
          </button>
        </div> */}
      </div>
    </header>
  )
}