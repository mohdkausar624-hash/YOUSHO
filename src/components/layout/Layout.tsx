import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarExpand = () => setSidebarExpanded(!sidebarExpanded);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onMenuClick={toggleSidebar} />
      <Sidebar
        isOpen={sidebarOpen}
        isExpanded={sidebarExpanded}
        onToggleExpand={toggleSidebarExpand}
      />
      <main
        className={`pt-14 transition-all duration-300 ${
          sidebarOpen ? (sidebarExpanded ? 'ml-60' : 'ml-[72px]') : 'ml-0'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
