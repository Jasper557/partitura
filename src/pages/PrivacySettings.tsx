import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { ArrowLeft, Download, Trash2, Bell, Share2, CheckSquare, Eye, Lock, AlertTriangle } from 'lucide-react'
import { Page } from '../types/index'
import { useAuth } from '../context/AuthContext'
import ToggleSwitch from '../components/ToggleSwitch'
import SettingRow from '../components/SettingRow'
import InfoBox from '../components/InfoBox'
import useScrollReset from '../hooks/useScrollReset'
import PageTransition from '../components/PageTransition'

const PrivacySettings: React.FC<{
  onNavigate?: (page: Page) => void
}> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme()
  const { user } = useAuth()
  
  // Privacy preference states
  const [dataCollection, setDataCollection] = useState(true)
  const [personalization, setPersonalization] = useState(true)
  const [thirdPartySharing, setThirdPartySharing] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)
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
    console.log('Saving privacy settings:', {
      dataCollection,
      personalization,
      thirdPartySharing,
      marketingEmails
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
            <h1 className="text-2xl font-bold">Privacy Settings</h1>
          </div>
          
          {/* Information box */}
          <InfoBox icon={<Lock size={20} />}>
            Control how your data is collected, used, and shared. Your privacy is important to us,
            and we're committed to keeping your data secure.
          </InfoBox>
          
          {/* Success message */}
          {savedChanges && (
            <InfoBox icon={<CheckSquare size={20} />} variant="success">
              Your privacy settings have been saved successfully.
            </InfoBox>
          )}
          
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Data Collection and Use
            </h2>
            
            <SettingRow
              icon={<Eye size={20} />}
              title="Usage Data Collection"
              description="Allow Partitura to collect data about how you use the app to improve features and fix bugs"
              control={<ToggleSwitch isOn={dataCollection} onToggle={() => setDataCollection(!dataCollection)} />}
            />
            
            <SettingRow
              icon={<CheckSquare size={20} />}
              title="Personalization"
              description="Allow Partitura to analyze your practice habits and music preferences to provide personalized recommendations"
              control={<ToggleSwitch isOn={personalization} onToggle={() => setPersonalization(!personalization)} />}
            />
          </div>
          
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Communications and Sharing
            </h2>
            
            <SettingRow
              icon={<Bell size={20} />}
              title="Marketing Communications"
              description="Receive emails about new features, tips, and offers from Partitura"
              control={<ToggleSwitch isOn={marketingEmails} onToggle={() => setMarketingEmails(!marketingEmails)} />}
            />
            
            <SettingRow
              icon={<Share2 size={20} />}
              title="Data Sharing with Third Parties"
              description="Allow Partitura to share anonymized usage data with trusted third parties for analytics and marketing purposes"
              control={<ToggleSwitch isOn={thirdPartySharing} onToggle={() => setThirdPartySharing(!thirdPartySharing)} />}
            />
          </div>
          
          <div className="mb-8">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Data Management
            </h2>
            
            <SettingRow
              icon={<Download size={20} />}
              title="Download Your Data"
              description="Get a copy of all the data Partitura has stored about you"
              onClick={() => console.log('Download data requested')}
            />
            
            <InfoBox icon={<AlertTriangle size={20} />} variant="warning">
              Deleting your account will permanently remove all your data from our servers. This action cannot be undone.
            </InfoBox>
            
            <SettingRow
              icon={<Trash2 size={20} />}
              title="Delete Account"
              description="Permanently delete your account and all associated data"
              onClick={() => console.log('Delete account requested')}
            />
          </div>
          
          {/* Save button */}
          <div className="mt-8 mb-12">
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

export default PrivacySettings 