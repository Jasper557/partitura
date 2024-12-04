import { ReactNode } from 'react'

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

export type Page = 'sheet-music' | 'practice' | 'calendar'

export interface SheetMusicItem {
  id: string
  title: string
  composer: string
  pdfPath: string | File
  isFavorite: boolean
  dateAdded: Date
} 