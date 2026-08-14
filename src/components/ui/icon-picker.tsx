import { CircleHelp, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Popover } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { categoryIcons } from '@/lib/icons/categoryIcons'

export function IconPicker({
  icons,
  value,
  onChange,
}: {
  icons: typeof categoryIcons
  value: string | null
  onChange: (key: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const selected = value ? icons[value] : undefined
  const SelectedIcon = selected?.Icon ?? CircleHelp
  const visibleIcons = useMemo(() => {
    const normalizedFilter = filter.trim().toLocaleLowerCase('es')
    return Object.entries(icons).filter(([, item]) =>
      item.label.toLocaleLowerCase('es').includes(normalizedFilter),
    )
  }, [filter, icons])

  function choose(key: string | null) {
    onChange(key)
    setOpen(false)
    setFilter('')
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setFilter('')
      }}
    >
      <Popover.Trigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start">
          <SelectedIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 truncate">
            {selected?.label ? `${selected.label} · Cambiar icono` : 'Cambiar icono'}
          </span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          aria-label="Selector de iconos"
          sideOffset={8}
          align="start"
          className="z-50 w-[min(22rem,var(--radix-popover-content-available-width))] rounded-xl border bg-popover p-3 text-popover-foreground shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              name="icon-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              autoComplete="off"
              aria-label="Filtrar iconos"
              placeholder="Filtrar iconos…"
              className="pl-9"
            />
          </div>

          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto overscroll-contain">
            {visibleIcons.map(([key, item]) => {
              const ItemIcon = item.Icon
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={value === key}
                  className="flex min-h-9 w-full touch-manipulation items-center gap-2 rounded-md px-3 py-2 text-left text-sm [content-visibility:auto] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => choose(key)}
                >
                  <ItemIcon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              )
            })}
            {visibleIcons.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No hay iconos que coincidan.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full justify-start"
            onClick={() => choose(null)}
          >
            <CircleHelp aria-hidden="true" className="size-4" />
            Quitar icono
          </Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
