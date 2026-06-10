'use client';

import Link from '@/components/ui/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'activity' },
    { name: 'Research Assistant', href: '/ai-research-assistant', icon: 'message-circle' },
    { name: 'Literature', href: '/literature-ingestion', icon: 'database' },
    { name: 'Knowledge Graph', href: '/knowledge-graph', icon: 'share-2' },
    { name: 'Workspace', href: '/research-workspace', icon: 'settings' },
    { name: 'Hypothesis Generator', href: '/hypothesis-generator', icon: 'zap' },
    { name: 'Paper Explorer', href: '/paper-explorer', icon: 'search' },
    { name: 'Settings', href: '/settings', icon: 'sliders' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50">
      <div className="flex h-full flex-col">
        {/* Sidebar Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              BRAHMA
            </span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Open sidebar"
          >
            <Menu className={isOpen ? 'h-6 w-6' : 'h-5 w-5'} />
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${
                  isOpen ? '' : 'justify-center'
                }`}
              >
                {/* Icon placeholder - would be replaced with actual Lucide icon */}
                {!isOpen && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    {/* Icon would go here */}
                  </div>
                )}
                {isOpen && (
                  <>
                    <div className="shrink-0 flex w-8 h-8 items-center justify-center">
                      {/* Icon would go here */}
                    </div>
                    <span className="ml-3">{item.name}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 flex items-center px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          {isOpen && (
            <>
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {/* User avatar placeholder */}
              </div>
              <div className="ml-3 space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Welcome, Researcher
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  researcher@lab.example.com
                </p>
              </div>
            </>
          )}
          {!isOpen && (
            <div className="w-8 h-8 flex items-center justify-center">
              {/* User avatar placeholder */}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}