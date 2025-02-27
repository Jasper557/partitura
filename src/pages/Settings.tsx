import React from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { 
  Sun, 
  Moon, 
  LogOut, 
  ChevronRight, 
  Mail, 
  Bell, 
  Shield, 
  HelpCircle,
  Keyboard
} from 'lucide-react'

const SettingSection: React.FC<{
  title: string
  children: React.ReactNode
  isDarkMode: boolean
}> = ({ title, children, isDarkMode }) => (
  <div className="mb-8">
    <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      {title}
    </h2>
    <div className="space-y-2">
      {children}
    </div>
  </div>
)

const SettingRow: React.FC<{
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  onClick?: () => void
  isDarkMode: boolean
}> = ({ icon, title, description, action, onClick, isDarkMode }) => (
  <div
    className={`
      flex items-center justify-between p-4 rounded-lg
      ${onClick ? 'cursor-pointer' : ''}
      ${isDarkMode 
        ? 'bg-gray-800 hover:bg-gray-700' 
        : 'bg-white hover:bg-gray-50'
      }
      transition-colors duration-200
    `}
    onClick={onClick}
  >
    <div className="flex items-center gap-4">
      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon}
      </div>
      <div>
        <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          {title}
        </div>
        {description && (
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </div>
        )}
      </div>
    </div>
    {action && (
      <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
        {action}
      </div>
    )}
  </div>
)

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <div className={`
      p-6 min-h-screen
      ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}
    `}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Settings
        </h1>

        <SettingSection title="Account" isDarkMode={isDarkMode}>
          <div className={`
            p-4 rounded-lg
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
          `}>
            <div className="flex items-center gap-4">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/default-avatar.png';
                  }}
                />
              ) : (
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}
                `}>
                  <span className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => logout()}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  ${isDarkMode 
                    ? 'hover:bg-gray-700 text-red-400' 
                    : 'hover:bg-gray-100 text-red-500'
                  }
                  transition-colors duration-200
                `}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Appearance" isDarkMode={isDarkMode}>
          <SettingRow
            icon={isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            title="Theme"
            description={`Currently using ${isDarkMode ? 'dark' : 'light'} theme`}
            action={
              <button
                onClick={toggleTheme}
                className={`
                  p-2 rounded-lg
                  ${isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200'
                  }
                  transition-colors duration-200
                `}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            }
            isDarkMode={isDarkMode}
          />
        </SettingSection>

        <SettingSection title="Preferences" isDarkMode={isDarkMode}>
          <SettingRow
            icon={<Bell size={20} />}
            title="Notifications"
            description="Manage notification preferences"
            action={<ChevronRight size={18} />}
            onClick={() => {}}
            isDarkMode={isDarkMode}
          />
          <SettingRow
            icon={<Keyboard size={20} />}
            title="Keyboard Shortcuts"
            description="Customize keyboard shortcuts"
            action={<ChevronRight size={18} />}
            onClick={() => {}}
            isDarkMode={isDarkMode}
          />
        </SettingSection>

        <SettingSection title="Support" isDarkMode={isDarkMode}>
          <SettingRow
            icon={<HelpCircle size={20} />}
            title="Help & Documentation"
            description="Learn how to use Partitura"
            action={<ChevronRight size={18} />}
            onClick={() => {}}
            isDarkMode={isDarkMode}
          />
          <SettingRow
            icon={<Mail size={20} />}
            title="Contact Support"
            description="Get help with any issues"
            action={<ChevronRight size={18} />}
            onClick={() => {}}
            isDarkMode={isDarkMode}
          />
        </SettingSection>

        <SettingSection title="Privacy & Security" isDarkMode={isDarkMode}>
          <SettingRow
            icon={<Shield size={20} />}
            title="Privacy Settings"
            description="Manage your data and privacy preferences"
            action={<ChevronRight size={18} />}
            onClick={() => {}}
            isDarkMode={isDarkMode}
          />
        </SettingSection>
      </div>
    </div>
  )
}

export default Settings