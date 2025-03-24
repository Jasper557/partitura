import { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => Promise<void>
}

export interface UserPreferences {
  id: string
  user_id: string
  theme: Theme
  created_at: string
  updated_at: string
}

export interface NavItemProps {
  icon: ReactNode
  text: string
  isExpanded: boolean
  isActive?: boolean
  onClick: () => void
}

export interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export type Page = 'sheet-music' | 'practice' | 'calendar' | 'settings' | 'documentation' | 'keyboard-shortcuts' | 'contact-support' | 'privacy-settings' | 'notifications'

export interface SheetMusicItem {
  id: string
  title: string
  composer: string
  pdfPath: string | File
  isFavorite: boolean
  dateAdded: Date
}
 
export interface PracticeEvent {
  id: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  isCompleted: boolean
  sheetMusicId?: string
  color?: string
} 