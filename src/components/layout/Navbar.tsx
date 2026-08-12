import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'

import { DarkModeToggle } from './DarkModeToggle'

export function Navbar() {
  const { session, signOut } = useAuth()

  return (
    <nav className="border-b bg-background" aria-label="Navegación principal">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <span className="font-semibold">Tech Study Tracker</span>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          {session && (
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
