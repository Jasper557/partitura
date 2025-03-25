import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { ArrowLeft, Send, CheckCircle, MessageSquare, Mail, User, FileText } from 'lucide-react'
import { Page } from '../types/index'
import { useAuth } from '../context/AuthContext'
import useScrollReset from '../hooks/useScrollReset'
import InfoBox from '../components/InfoBox'
import PageTransition from '../components/PageTransition'

const ContactSupport: React.FC<{
  onNavigate?: (page: Page) => void
}> = ({ onNavigate }) => {
  const { isDarkMode } = useTheme()
  const { user } = useAuth()
  const [formState, setFormState] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Reset scroll position when component mounts
  useScrollReset()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real app, you would send this data to your backend
    console.log('Support request:', formState)
    
    setIsSubmitting(false)
    setIsSubmitted(true)
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
            <h1 className="text-2xl font-bold">Contact Support</h1>
          </div>
          
          {/* Information box */}
          <InfoBox icon={<MessageSquare size={20} />}>
            Need help with Partitura? Our support team is here to assist you.
            Fill out the form below and we'll get back to you as soon as possible.
          </InfoBox>
          
          {isSubmitted ? (
            <InfoBox icon={<CheckCircle size={20} />} variant="success">
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-2">Message Sent Successfully</h2>
                <p className="text-center mb-4">
                  Thank you for contacting us. We've received your message and will respond to your inquiry within 24-48 hours.
                </p>
                <button
                  onClick={() => onNavigate && onNavigate('settings')}
                  className={`
                    px-6 py-2 rounded-lg font-medium
                    ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
                    text-white transition-colors duration-200
                  `}
                >
                  Return to Settings
                </button>
              </div>
            </InfoBox>
          ) : (
            <div className={`
              p-6 rounded-lg mb-8
              ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
              shadow-sm
            `}>
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="name" 
                    className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>Your Name</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className={`
                      w-full px-3 py-2 rounded-lg border
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-1 focus:ring-blue-500
                    `}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="email" 
                    className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>Your Email</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className={`
                      w-full px-3 py-2 rounded-lg border
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-1 focus:ring-blue-500
                    `}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="category" 
                    className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <span>Issue Category</span>
                    </div>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formState.category}
                    onChange={handleChange}
                    required
                    className={`
                      w-full px-3 py-2 rounded-lg border
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-1 focus:ring-blue-500
                    `}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="account">Account Issues</option>
                    <option value="sheet-music">Sheet Music</option>
                    <option value="practice">Practice Features</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>
                
                <div>
                  <label 
                    htmlFor="message" 
                    className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span>Your Message</span>
                    </div>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`
                      w-full px-3 py-2 rounded-lg border
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }
                      focus:outline-none focus:ring-1 focus:ring-blue-500
                    `}
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`
                      flex items-center gap-2 px-6 py-2 rounded-lg font-medium
                      ${isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-500 hover:bg-blue-600'
                      }
                      text-white transition-colors duration-200
                      disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-12">
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Other Ways to Contact Us
            </h2>
            
            <div className={`
              p-5 rounded-lg 
              ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
            `}>
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="mb-2">For immediate assistance, you can:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email us directly at <span className="text-blue-400">support@partitura.app</span></li>
                  <li>Chat with our support team during business hours (9am-5pm PST)</li>
                  <li>Check our <span className="text-blue-400 cursor-pointer hover:underline">Help Center</span> for frequently asked questions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default ContactSupport 