import React, { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import MainLayout from './layouts/MainLayout'
import SheetMusic from './pages/SheetMusic'
import Practice from './pages/Practice'
import Calendar from './pages/Calendar'
import { Page } from './types'

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('sheet-music')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  const renderPage = () => {
    switch (currentPage) {
      case 'sheet-music':
        return <SheetMusic />
      case 'practice':
        return <Practice />
      case 'calendar':
        return <Calendar />
      default:
        return <SheetMusic />
    }
  }

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      isSidebarExpanded={isSidebarExpanded}
      onSidebarExpandedChange={setIsSidebarExpanded}
    >
      {renderPage()}
    </MainLayout>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App 