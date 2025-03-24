import { useEffect } from 'react'

/**
 * Hook to reset scroll position when a component mounts
 */
const useScrollReset = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}

export default useScrollReset 