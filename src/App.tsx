import React, { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ShortcutProvider } from './context/ShortcutContext'
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
        return <Settings onNavigate={setCurrentPage} />
      case 'documentation':
        return <Documentation onNavigate={setCurrentPage} />
      case 'keyboard-shortcuts':
        return <KeyboardShortcuts onNavigate={setCurrentPage} />
      case 'contact-support':
        return <ContactSupport onNavigate={setCurrentPage} />
      case 'privacy-settings':
        return <PrivacySettings onNavigate={setCurrentPage} />
      case 'notifications':
        return <NotificationSettings onNavigate={setCurrentPage} />
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