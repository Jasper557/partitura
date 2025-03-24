import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth()
  const { isDarkMode } = useTheme()

  return (
    <div className={`
      min-h-screen flex items-center justify-center
      ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
      p-4
    `}>
      <div className={`
        max-w-md w-full space-y-8
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        p-8 rounded-xl shadow-lg
      `}>
        <div className="text-center">
          <img
            src="/partitura/assets/icon.png"
            alt="Partitura Logo"
            className="mx-auto h-16 w-16"
          />
          <h2 className={`
            mt-6 text-3xl font-bold
            ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}
          `}>
            Welcome to Partitura
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sign in to access your sheet music from anywhere
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={signInWithGoogle}
            className={`
              group relative w-full flex justify-center
              py-3 px-4 rounded-lg text-sm font-medium
              ${isDarkMode 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
              }
              border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              transition-colors duration-200
            `}
          >
            <span className="flex items-center">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5 mr-3"
              />
              Sign in with Google
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your sheet music, synchronized across all devices
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 