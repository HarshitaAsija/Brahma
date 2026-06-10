import Sidebar from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-4">
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Dashboard
                </span>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-4">
                {/* User profile and settings would go here */}
                <div className="relative">
                  <button className="flex items-center space-x-2 rounded-full bg-gray-100 dark:bg-gray-700 py-1.5 px-3 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none">
                    <span className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                    <span className="truncate">Welcome, Researcher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}