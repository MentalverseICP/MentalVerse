import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Check if window is defined to avoid SSR issues
    return typeof window !== "undefined" ? window.innerWidth < 768 : false
  })

  useEffect(() => {
    // Only run the effect if window is defined
    if (typeof window === "undefined") return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
} 