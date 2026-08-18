import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/hooks/useProfile'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Popover } from 'radix-ui'
import { Link } from 'react-router-dom'

import { DarkModeToggle } from './DarkModeToggle'
import { Logo } from './Logo'

export function Navbar() {
  const { session, signOut } = useAuth()
  const { isAdmin } = useProfile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { to: '/#categorias', label: 'Categorías', visible: true },
    { to: '/favoritos', label: 'Favoritos', visible: Boolean(session) },
    { to: '/admin', label: 'Administración', visible: isAdmin },
  ]

  const navigationLinks = (className: string, onClick?: () => void) =>
    navigationItems
      .filter(({ visible }) => visible)
      .map(({ to, label }) => (
        <Link key={to} to={to} className={className} onClick={onClick}>
          {label}
        </Link>
      ))

  return (
    <nav className="border-b bg-background" aria-label="Navegación principal">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-sm font-semibold hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo aria-hidden="true" className="size-5" />
          Tech Study Tracker
        </Link>
        <div className="hidden flex-wrap items-center justify-end gap-2 sm:flex">
          {navigationLinks(
            'rounded-sm px-2 py-1 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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

        <Popover.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <div className="flex items-center gap-2 sm:hidden">
            <DarkModeToggle />
            <Popover.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X aria-hidden="true" />
                ) : (
                  <Menu aria-hidden="true" />
                )}
              </Button>
            </Popover.Trigger>
          </div>
          <Popover.Portal>
            <Popover.Content
              aria-label="Menú de navegación móvil"
              align="end"
              sideOffset={8}
              className="z-50 w-56 rounded-xl border bg-popover p-2 text-popover-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-col gap-1">
                {navigationLinks(
                  'w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  () => setMobileMenuOpen(false),
                )}
                {session ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      void signOut()
                    }}
                  >
                    Cerrar sesión
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Iniciar sesión
                    </Link>
                  </Button>
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </nav>
  )
}
