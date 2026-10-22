import { javascript as lenguajeJavascript } from '@codemirror/lang-javascript'
import { Braces, RotateCcw } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

import { EditorCodeMirror } from '@/components/bloques-laboratorio/EditorCodeMirror'
import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import type { DatosCompiladorReact } from '@/lib/laboratorio/schemas'
import {
  clienteReactKitCompartido,
  type ClienteReactKit,
  type EventoCompilador,
} from '@/lib/react-kit/cliente'

const extensionJsx = lenguajeJavascript({ jsx: true })
const ESPERA_COMPILADOR_MS = 300

type EstadoCompilador =
  | { estado: 'cargando' }
  | { estado: 'listo'; codigo: string; eventos: EventoCompilador[] }
  | { estado: 'error'; error: string }

function describirEvento(evento: EventoCompilador) {
  const componente = evento.componente ??
    (evento.linea === null ? 'Componente' : `Línea ${evento.linea}`)
  const estado = evento.estado === 'compilado' ? 'compilado' : 'no se compiló'
  return `${componente}: ${estado}${evento.motivo ? ` · ${evento.motivo}` : ''}`
}

export function CompiladorReact({
  titulo = 'Mira qué cambia React Compiler.',
  consigna,
  codigo: codigoOriginal,
  clienteReactKit = clienteReactKitCompartido,
}: DatosCompiladorReact & { clienteReactKit?: ClienteReactKit }) {
  const [codigo, setCodigo] = useState(codigoOriginal)
  const [resultado, setResultado] = useState<EstadoCompilador>({ estado: 'cargando' })
  const sesion = useMemo(() => clienteReactKit.crearSesionCompilador(), [clienteReactKit])
  const idTitulo = useId()

  useEffect(() => {
    // Una edición invalida de inmediato cualquier respuesta anterior, aunque
    // todavía no hayan transcurrido los 300 ms del nuevo debounce.
    sesion.descartar()
    const temporizador = window.setTimeout(() => {
      void sesion.compilar(codigo, { nombre: 'App.jsx' }).then((respuesta) => {
        if (!respuesta) return
        if (respuesta.ok) {
          setResultado({ estado: 'listo', codigo: respuesta.codigo, eventos: respuesta.eventos })
        } else {
          setResultado({ estado: 'error', error: respuesta.error })
        }
      })
    }, ESPERA_COMPILADOR_MS)
    return () => window.clearTimeout(temporizador)
  }, [codigo, sesion])

  useEffect(() => () => sesion.descartar(), [sesion])

  return (
    <section
      aria-labelledby={idTitulo}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 dark:bg-violet-950/40">
            <Braces aria-hidden="true" className="size-4.75 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-bold tracking-wider text-violet-600 uppercase dark:text-violet-400">
              React Compiler
            </p>
            <h3 id={idTitulo} className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCodigo(codigoOriginal)}
        >
          <RotateCcw aria-hidden="true" />
          Restablecer
        </Button>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <h4 className="text-sm font-semibold">Componente</h4>
          <EditorCodeMirror
            etiqueta="Editor del componente JSX"
            extension={extensionJsx}
            valor={codigo}
            onChange={setCodigo}
          />
        </div>

        <div
          aria-live="off"
          className="min-w-0 space-y-2"
        >
          <h4 className="text-sm font-semibold">Código compilado</h4>
          {resultado.estado === 'cargando' && (
            <p className="text-sm text-muted-foreground">Cargando el compilador…</p>
          )}
          {resultado.estado === 'error' && (
            <p className="rounded-lg bg-red-50 p-3 font-mono text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400">
              {resultado.error}
            </p>
          )}
          {resultado.estado === 'listo' && (
            <CodigoResaltado
              codigo={resultado.codigo}
              lenguaje="jsx"
              numerarLineas
              etiqueta="Código compilado"
              alturaMaxima="24rem"
              esRegion={false}
            />
          )}
        </div>
      </div>

      {resultado.estado === 'listo' && resultado.eventos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Qué compiló React</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {resultado.eventos.map((evento, indice) => (
              <li key={`${evento.componente ?? evento.linea ?? 'componente'}-${indice}`}>
                {describirEvento(evento)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
