import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const THEME_STORAGE_KEY = 'theme'

function getInitialDarkMode() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme === 'dark'
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => {
    const nextIsDark = !isDark
    localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light')
    setIsDark(nextIsDark)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggleTheme}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
