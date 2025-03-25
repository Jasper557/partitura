import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { ArrowLeft, Bell, Calendar, Clock, Globe, Mail, CheckSquare, AlertCircle } from 'lucide-react'
import { Page } from '../types/index'
import { useAuth } from '../context/AuthContext'
import ToggleSwitch from '../components/ToggleSwitch'
import SettingRow from '../components/SettingRow'
import InfoBox from '../components/InfoBox'
import useScrollReset from '../hooks/useScrollReset'
import PageTransition from '../components/PageTransition'

const NotificationSettings: React.FC<{
  onNavigate?: (page: Page) => void
}> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme()
  const { user } = useAuth()
  
  // Notification preference states
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [practiceReminders, setPracticeReminders] = useState(true)
  const [systemNotifications, setSystemNotifications] = useState(true)
  const [calendarReminders, setCalendarReminders] = useState(true)
  const [savedChanges, setSavedChanges] = useState(false)
  
  // Reset scroll position when component mounts
  useScrollReset()
  
  // Show success message temporarily when settings are saved
  useEffect(() => {
    if (savedChanges) {
      const timer = setTimeout(() => setSavedChanges(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [savedChanges])

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to your backend
    console.log('Saving notification settings:', {
      emailNotifications,
      inAppNotifications,
      practiceReminders,
      systemNotifications,
      calendarReminders
    })
    
    setSavedChanges(true)
  }

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
            <h1 className="text-2xl font-bold">Notification Settings</h1>
          </div>
          
          {/* Information box */}
          <InfoBox icon={<Bell size={20} />}>
            Customize how and when you want to receive notifications from Partitura.
            Your preferences will be applied across all your devices.
          </InfoBox>
          
          {/* Success message */}
          {savedChanges && (
            <InfoBox icon={<CheckSquare size={20} />} variant="success">
              Your notification settings have been saved successfully.
            </InfoBox>
          )}
          
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Communication Channels
            </h2>
            
            <SettingRow
              icon={<Mail size={20} />}
              title="Email Notifications"
              description="Receive important updates and reminders via email"
              control={<ToggleSwitch isOn={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />}
            />
            
            <SettingRow
              icon={<Bell size={20} />}
              title="In-App Notifications"
              description="Show notifications within the Partitura app"
              control={<ToggleSwitch isOn={inAppNotifications} onToggle={() => setInAppNotifications(!inAppNotifications)} />}
            />
            
            <SettingRow
              icon={<Globe size={20} />}
              title="System Notifications"
              description="Allow Partitura to send notifications through your device's notification system"
              control={<ToggleSwitch isOn={systemNotifications} onToggle={() => setSystemNotifications(!systemNotifications)} />}
            />
          </div>
          
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Reminders
            </h2>
            
            <SettingRow
              icon={<Clock size={20} />}
              title="Practice Reminders"
              description="Get reminders about your scheduled practice sessions"
              control={<ToggleSwitch isOn={practiceReminders} onToggle={() => setPracticeReminders(!practiceReminders)} />}
            />
            
            <SettingRow
              icon={<Calendar size={20} />}
              title="Calendar Reminders"
              description="Receive notifications about upcoming calendar events"
              control={<ToggleSwitch isOn={calendarReminders} onToggle={() => setCalendarReminders(!calendarReminders)} />}
            />
          </div>
          
          {/* Save button */}
          <div className="mt-8">
            <button
              onClick={handleSaveSettings}
              className={`
                px-6 py-2 rounded-lg font-medium
                ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
                text-white transition-colors duration-200
              `}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default NotificationSettings 