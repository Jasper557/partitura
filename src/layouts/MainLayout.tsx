import React, { ReactNode } from 'react'
import { useTheme } from '../context/ThemeContext'
import Sidebar from '../components/Sidebar'
import { Page } from '../types/index'

interface MainLayoutProps {
  children: ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
  isSidebarExpanded: boolean
  onSidebarExpandedChange: (expanded: boolean) => void
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  isSidebarExpanded,
  onSidebarExpandedChange
}) => {
  const { isDarkMode } = useTheme()

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate}
        isExpanded={isSidebarExpanded}
        onExpandedChange={onSidebarExpandedChange}
      />
      <main className={`
        transition-all duration-300
        ${isSidebarExpanded ? 'ml-72' : 'ml-28'}
        p-8
      `}>
        {children}
      </main>
    </div>
  )
}

export default MainLayout 