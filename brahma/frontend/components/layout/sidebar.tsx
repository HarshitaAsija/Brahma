'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/ui-store'
import { useState, useEffect } from 'react'

// Define navigation items
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
  { name: 'Research Assistant', href: '/research-assistant', icon: 'Search' },
  { name: 'Literature', href: '/literature', icon: 'BookOpen' },
  { name: 'Knowledge Graph', href: '/knowledge-graph', icon: 'CircleNodes' },
  { name: 'Workspace', href: '/workspace', icon: 'Folder' },
  { name: 'Hypothesis Generator', href: '/hypothesis-generator', icon: 'Lightbulb' },
  { name: 'Paper Explorer', href: '/paper-explorer', icon: 'FileText' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
]

// Placeholder icons - in a real app, you would import actual icons from a library like Lucide React
// For now, we'll use a simple span to represent the icon placeholder
const IconPlaceholder = ({ name }: { name: string }) => (
  <span className="h-5 w-5">{name}</span>
)

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <aside
      className={`${className} fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-x-hidden`}
      style={{
        width: isMobile ? '256px' : sidebarCollapsed ? '80px' : '256px',
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'none',
        transition: 'width 200ms, transform 200ms',
        zIndex: isMobile && sidebarOpen ? 40 : 30,
      }}
    >
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex h-16 items-center px-3 border-b border-gray-200 dark:border-gray-700">
        {/* Brand/Logo - only visible when sidebar is expanded (not collapsed) */}
        {(!sidebarCollapsed || !isMobile) && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded"></div>
            <span className="font-semibold text-lg">BRAHMA</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="mt-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium
                  ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                  ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                {/* Icon placeholder */}
                <div className={`${sidebarCollapsed ? 'h-10 w-10 flex items-center justify-center' : 'h-8 w-8 flex-shrink-0'}`}>
                  <IconPlaceholder name={item.icon} />
                </div>
                {!sidebarCollapsed && (
                  <>
                    <span className="mx-3">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto h-0.5 w-3 bg-blue-600 dark:bg-blue-500 rounded"></span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </ul>
      </nav>

      {/* We can add a footer if needed */}
      <div className="h-14 border-t border-gray-200 dark:border-gray-700">
        {/* Optional: footer content */}
      </div>
    </aside>
  )
}