export type Page = 'sheet-music' | 'practice' | 'calendar' | 'settings'

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

export interface SheetMusicItem {
  id: string
  title: string
  composer: string
  pdfPath: string | File
  isFavorite: boolean
  dateAdded: Date
}

export interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export interface NavItemProps {
  icon: React.ReactNode
  text: string
  isExpanded: boolean
  isActive?: boolean
  onClick: () => void
} 