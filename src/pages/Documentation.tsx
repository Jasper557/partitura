import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { 
  ArrowLeft, 
  File, 
  Settings, 
  BookOpen, 
  Calendar, 
  Music, 
  Search, 
  Star, 
  Upload,
  Maximize2,
  ZoomIn,
  Download,
  HelpCircle,
  MousePointer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Page } from '../types/index'
import useScrollReset from '../hooks/useScrollReset'
import InfoBox from '../components/InfoBox'
import PageTransition from '../components/PageTransition'

const Documentation: React.FC<{
  onNavigate?: (page: Page) => void
}> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme()
  
  // Reset scroll position when component mounts
  useScrollReset()
  
  const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
      <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <BookOpen size={18} />
        {title}
      </h2>
      <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {children}
      </div>
    </div>
  )
  
  const Subsection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-6">
      <h3 className={`text-base font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {icon}
        {title}
      </h3>
      <div className="space-y-2 ml-6">
        {children}
      </div>
    </div>
  )
  
  const Feature: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className={`
      p-4 rounded-lg
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
      shadow-sm
      mb-4
    `}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          {icon}
        </div>
        <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{title}</h4>
      </div>
      <div className={`ml-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {children}
      </div>
    </div>
  )
  
  const Shortcut: React.FC<{ keys: string, action: string }> = ({ keys, action }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-0 border-gray-700">
      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{action}</span>
      <kbd className={`
        px-2 py-1 rounded text-sm font-mono
        ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
      `}>{keys}</kbd>
    </div>
  )

  return (
    <PageTransition>
      <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button 
              onClick={() => onNavigate && onNavigate('settings')}
              className={`
                p-2 rounded-full mr-2
                ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}
                transition-colors duration-200
              `}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Documentation</h1>
          </div>
          
          {/* Information box */}
          <InfoBox icon={<HelpCircle size={20} />}>
            Welcome to Partitura documentation. Here you'll find helpful information about how to use the application
            and get the most out of its features.
          </InfoBox>
          
          <Section title="Getting Started">
            <p>
              Partitura is a comprehensive sheet music management application designed for musicians. 
              It helps you organize, practice, and schedule your musical repertoire in one place.
            </p>
          </Section>
          
          <Section title="Navigation">
            <p className="mb-4">
              Partitura uses a sidebar navigation system to access different sections of the app.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Feature icon={<Music size={20} />} title="Sheet Music">
                Access your sheet music library, upload new scores, and manage your collection.
              </Feature>
              
              <Feature icon={<BookOpen size={20} />} title="Practice">
                Track your practice sessions, set goals, and monitor your progress.
              </Feature>
              
              <Feature icon={<Calendar size={20} />} title="Calendar">
                Plan your practice schedule and musical events in a calendar view.
              </Feature>
              
              <Feature icon={<Settings size={20} />} title="Settings">
                Customize your app preferences, change themes, and manage your account.
              </Feature>
            </div>
          </Section>
          
          <Section title="Sheet Music Library">
            <Subsection title="Managing Your Collection" icon={<File size={18} />}>
              <p className="mb-3">
                The Sheet Music page is where you can view and manage your entire collection.
              </p>
              
              <Feature icon={<Upload size={20} />} title="Adding Music">
                Click the "Add Sheet Music" button to upload new PDF files to your collection.
                You can provide details like composer, title, and other metadata.
              </Feature>
              
              <Feature icon={<Search size={20} />} title="Searching">
                Use the search bar to quickly find sheet music by title, composer, or other details.
                Press Ctrl+F to activate the search box.
              </Feature>
              
              <Feature icon={<Star size={20} />} title="Favorites">
                Mark your most used sheet music as favorites for quick access.
              </Feature>
            </Subsection>
            
            <Subsection title="PDF Viewer" icon={<File size={18} />}>
              <p className="mb-3">
                Partitura includes a built-in PDF viewer with several useful features:
              </p>
              
              <Feature icon={<ZoomIn size={20} />} title="Zoom Controls">
                <p>Several options for zooming in and out:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Use the zoom buttons in the header (+/-)</li>
                  <li>Keyboard shortcuts: Ctrl++ (plus) and Ctrl+- (minus)</li>
                  <li>Hold Ctrl while using mouse wheel to zoom in/out</li>
                </ul>
                <p className="mt-2">Visual feedback shows zoom percentage and displays helpful indicators when you reach minimum or maximum zoom levels.</p>
              </Feature>
              
              <Feature icon={<MousePointer size={20} />} title="Mouse Wheel Zoom">
                Hold the Ctrl key while scrolling your mouse wheel to zoom in and out with precision. 
                A subtle indicator appears during zooming to show your current zoom level.
                This feature can be enabled or disabled in keyboard shortcut settings.
              </Feature>
              
              <Feature icon={<ChevronLeft size={20} />} title="Page Navigation">
                <p>Navigate through multi-page documents:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Use the arrow buttons at the bottom of the viewer</li>
                  <li>Keyboard shortcuts: Left Arrow for previous page, Right Arrow for next page</li>
                </ul>
                <p className="mt-2">The current page number and total pages are displayed at the bottom of the viewer.</p>
              </Feature>
              
              <Feature icon={<Maximize2 size={20} />} title="Fullscreen Mode">
                Open the PDF in fullscreen mode for distraction-free viewing. Press the fullscreen button
                or use the keyboard shortcut (F) to toggle between normal and fullscreen views.
              </Feature>
              
              <Feature icon={<Download size={20} />} title="Download">
                Download the current PDF to your device for offline use by clicking the download button
                in the bottom toolbar.
              </Feature>
            </Subsection>
          </Section>
          
          <div className="mt-8 mb-12">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              For additional help or support, please <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => onNavigate && onNavigate('contact-support')}>contact our support team</span>.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Documentation 