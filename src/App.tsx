import React, { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import SheetMusic from './pages/SheetMusic'
import Practice from './pages/Practice'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import Login from './components/Login'
import { Page } from './types'
import { useAuth } from './context/AuthContext'

const ProtectedContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('sheet-music')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'sheet-music':
        return <SheetMusic />
      case 'practice':
        return <Practice />
      case 'calendar':
        return <Calendar />
      case 'settings':
        return <Settings />
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
    <AuthProvider>
      <ThemeProvider>
        <ProtectedContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App 