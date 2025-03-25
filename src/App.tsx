import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ShortcutProvider } from './context/ShortcutContext'
import { AnimatePresence } from 'framer-motion'
import MainLayout from './layouts/MainLayout'
import SheetMusic from './pages/SheetMusic'
import Practice from './pages/Practice'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import Documentation from './pages/Documentation'
import KeyboardShortcuts from './pages/KeyboardShortcuts'
import ContactSupport from './pages/ContactSupport'
import PrivacySettings from './pages/PrivacySettings'
import NotificationSettings from './pages/NotificationSettings'
import Login from './components/Login'
import { Page } from './types/index'
import { useAuth } from './context/AuthContext'

// Auth callback handler component
const AuthCallback = () => {
  const { hash, search } = useLocation();
  
  // The hash and search params are automatically processed by Supabase
  // when auth.detectSessionInUrl is true
  
  return <Navigate to="/" replace />;
};

const ProtectedContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('sheet-music')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const { user, loading } = useAuth()
  const location = useLocation()

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
        return <SheetMusic key="sheet-music" />
      case 'practice':
        return <Practice key="practice" />
      case 'calendar':
        return <Calendar key="calendar" />
      case 'settings':
        return <Settings key="settings" onNavigate={setCurrentPage} />
      case 'documentation':
        return <Documentation key="documentation" onNavigate={setCurrentPage} />
      case 'keyboard-shortcuts':
        return <KeyboardShortcuts key="keyboard-shortcuts" onNavigate={setCurrentPage} />
      case 'contact-support':
        return <ContactSupport key="contact-support" onNavigate={setCurrentPage} />
      case 'privacy-settings':
        return <PrivacySettings key="privacy-settings" onNavigate={setCurrentPage} />
      case 'notifications':
        return <NotificationSettings key="notifications" onNavigate={setCurrentPage} />
      default:
        return <SheetMusic key="sheet-music-default" />
    }
  }

  return (
    <MainLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      isSidebarExpanded={isSidebarExpanded}
      onSidebarExpandedChange={setIsSidebarExpanded}
    >
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </MainLayout>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ShortcutProvider>
        <ToastProvider>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<ProtectedContent />} />
            </Routes>
          </ToastProvider>
        </ShortcutProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App 