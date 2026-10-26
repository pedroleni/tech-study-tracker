import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { esquemaUrlRouter } from '@/lib/laboratorio/schemas'
import type { MensajeUbicacion } from '@/lib/react-en-vivo/mensajes'

export type AccionNavegador = 'atras' | 'adelante' | 'recargar' | 'ir'

function descripcionHistorial(origen: MensajeUbicacion['origen']) {
  if (origen === 'createMemoryRouter' || origen === 'MemoryRouter') {
    return <>Historial en memoria (<code translate="no">{origen}</code>)</>
  }
  if (origen === 'createBrowserRouter' || origen === 'BrowserRouter') {
    return <>
      Historial en memoria · en tu proyecto, <code translate="no">{origen}</code> usa la dirección del navegador
    </>
  }
  return <>
    Historial en memoria · en tu proyecto, <code translate="no">{origen}</code> guarda la ruta detrás de #
  </>
}

function ContenidoBarraDirecciones({
  ubicacion,
  onAccion,
}: {
  ubicacion: MensajeUbicacion
  onAccion: (accion: AccionNavegador, url?: string) => void
}) {
  const [borrador, setBorrador] = useState<{ origen: string; valor: string } | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<{ origen: string; texto: string } | null>(null)
  const idError = useId()
  const url = borrador?.origen === ubicacion.url ? borrador.valor : ubicacion.url
  const error = errorGuardado?.origen === ubicacion.url ? errorGuardado.texto : null

  return (
    <form
      aria-label="Barra de direcciones de la vista previa"
      className="rounded-lg border bg-muted/50 p-2"
      onSubmit={(evento) => {
        evento.preventDefault()
        const resultado = esquemaUrlRouter.safeParse(url)
        if (!resultado.success) {
          setErrorGuardado({
            origen: ubicacion.url,
            texto: 'La dirección tiene que empezar por una sola / y no llevar espacios.',
          })
          return
        }
        setErrorGuardado(null)
        onAccion('ir', resultado.data)
      }}
    >
      <div className="grid grid-cols-[auto_auto_auto_1fr] gap-1.5 sm:grid-cols-[auto_auto_auto_minmax(0,1fr)_auto]">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Atrás"
          disabled={!ubicacion.puedeAtras}
          onClick={() => onAccion('atras')}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Adelante"
          disabled={!ubicacion.puedeAdelante}
          onClick={() => onAccion('adelante')}
        >
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Recargar"
          onClick={() => onAccion('recargar')}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
        <label className="col-span-4 row-start-2 min-w-0 sm:col-span-1 sm:row-start-auto">
          <span className="sr-only">Dirección de la vista previa</span>
          <input
            type="text"
            name="direccion-vista-previa"
            autoComplete="off"
            spellCheck={false}
            value={url}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
            onChange={(evento) => {
              setBorrador({ origen: ubicacion.url, valor: evento.target.value })
              if (error) setErrorGuardado(null)
            }}
            className="h-8 w-full rounded-md border bg-background px-2.5 font-mono text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </label>
        <Button type="submit" variant="outline" size="sm" className="col-start-4 row-start-1 sm:col-start-auto sm:row-start-auto">
          Ir
        </Button>
      </div>
      {error && (
        <p id={idError} aria-live="polite" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="mt-1.5 text-xs break-words text-muted-foreground">
        {descripcionHistorial(ubicacion.origen)}
      </p>
    </form>
  )
}

export function BarraDirecciones(props: {
  ubicacion: MensajeUbicacion
  onAccion: (accion: AccionNavegador, url?: string) => void
}) {
  // Una ubicación nueva descarta el texto sin enviar, como en un navegador.
  return <ContenidoBarraDirecciones key={props.ubicacion.url} {...props} />
}
