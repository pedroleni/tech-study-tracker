import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/hooks/useProfile'
import { Link } from 'react-router-dom'

import { DarkModeToggle } from './DarkModeToggle'

export function Navbar() {
  const { session, signOut } = useAuth()
  const { isAdmin } = useProfile()

  return (
    <nav className="border-b bg-background" aria-label="Navegación principal">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="rounded-sm font-semibold hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Tech Study Tracker
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            to="/#categorias"
            className="rounded-sm px-2 py-1 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Categorías
          </Link>
          {session && (
            <Link
              to="/favoritos"
              className="rounded-sm px-2 py-1 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Favoritos
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-sm px-2 py-1 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Administración
            </Link>
          )}
          <DarkModeToggle />
          {session ? (
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              Cerrar sesión
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
