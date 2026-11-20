import { css as lenguajeCss } from '@codemirror/lang-css'
import { javascript as lenguajeJavascript } from '@codemirror/lang-javascript'
import { Atom, ListChecks, RotateCcw } from 'lucide-react'
import type { RefObject } from 'react'

import { EditorCodeMirror } from '@/components/bloques-laboratorio/EditorCodeMirror'
import { PanelDiagnosticosTs } from '@/components/bloques-laboratorio/PanelDiagnosticosTs'
import { PanelLint } from '@/components/bloques-laboratorio/PanelLint'
import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import type { DiagnosticoLint } from '@/lib/react-kit/cliente'
import { cn } from '@/lib/utils'

const extensionJsx = lenguajeJavascript({ jsx: true })
const extensionTsx = lenguajeJavascript({ jsx: true, typescript: true })
const extensionCss = lenguajeCss()

function extensionArchivo(nombre: string) {
  if (nombre.endsWith('.css')) return extensionCss
  if (/\.(ts|tsx)$/.test(nombre)) return extensionTsx
  return extensionJsx
}

export function CabeceraReactEnVivo({
  titulo,
  mostrarComprobar,
  comprobandoDeshabilitado,
  etiquetaComprobar,
  botonComprobarRef,
  onComprobar,
  onReiniciar,
}: {
  titulo: string
  mostrarComprobar: boolean
  comprobandoDeshabilitado: boolean
  etiquetaComprobar: string
  botonComprobarRef: RefObject<HTMLButtonElement | null>
  onComprobar: () => void
  onReiniciar: () => void
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 dark:bg-sky-950/40">
          <Atom aria-hidden="true" className="size-4.75 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-sky-600 uppercase dark:text-sky-400">
            React en vivo
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">{titulo}</h3>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {mostrarComprobar && (
          <Button
            ref={botonComprobarRef}
            type="button"
            size="sm"
            onClick={onComprobar}
            // aria-disabled y no disabled: un botón desactivado pierde el foco
            // del teclado y lo manda a <body>.
            aria-disabled={comprobandoDeshabilitado}
            className="aria-disabled:cursor-wait aria-disabled:opacity-60"
          >
            <ListChecks aria-hidden="true" />
            {etiquetaComprobar}
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={onReiniciar}>
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>
    </div>
  )
}

export function PanelCodigoReactEnVivo({
  pestanas,
  pestana,
  archivoActivo,
  jsGenerado,
  compilador,
  errorSintaxis,
  explicacionErrorSintaxis,
  usaTypeScript,
  idErroresTipos,
  etiquetaPanelTipos,
  estadoPanelTipos,
  diagnosticosTipos,
  errorTipos,
  mostrarLint,
  estadoPanelLint,
  diagnosticosLint,
  errorLint,
  onCambiarPestana,
  onCambiarCodigo,
}: {
  pestanas: string[]
  pestana: string
  archivoActivo?: ArchivoReact
  jsGenerado: string
  compilador: boolean
  errorSintaxis: string | null
  explicacionErrorSintaxis: string | null
  usaTypeScript: boolean
  idErroresTipos: string
  etiquetaPanelTipos: string
  estadoPanelTipos: 'cargando' | 'listo' | 'error'
  diagnosticosTipos: Parameters<typeof PanelDiagnosticosTs>[0]['diagnosticos']
  errorTipos?: string
  mostrarLint: boolean
  estadoPanelLint: 'cargando' | 'listo' | 'error'
  diagnosticosLint: DiagnosticoLint[]
  errorLint?: string
  onCambiarPestana: (pestana: string) => void
  onCambiarCodigo: (codigo: string) => void
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div
        role="group"
        aria-label="Archivo que quieres ver"
        className="flex max-w-full gap-1 overflow-x-auto rounded-lg border bg-muted p-1"
      >
        {pestanas.map((nombre) => (
          <button
            key={nombre}
            type="button"
            aria-pressed={pestana === nombre}
            onClick={() => onCambiarPestana(nombre)}
            className={cn(
              'min-h-10 shrink-0 touch-manipulation rounded-md px-3 py-1.5 font-mono text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              pestana === nombre
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {nombre}
          </button>
        ))}
      </div>

      {archivoActivo ? (
        <EditorCodeMirror
          key={archivoActivo.nombre}
          etiqueta={`Editor de ${archivoActivo.nombre}`}
          extension={extensionArchivo(archivoActivo.nombre)}
          valor={archivoActivo.codigo}
          onChange={onCambiarCodigo}
        />
      ) : (
        <CodigoResaltado
          codigo={jsGenerado || '// Preparando el JavaScript…'}
          lenguaje="js"
          numerarLineas
          etiqueta={
            compilador
              ? 'JavaScript generado por React Compiler y Sucrase'
              : 'JavaScript generado por Sucrase'
          }
        />
      )}

      {errorSintaxis && (
        <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400">
          <p className="font-mono">{errorSintaxis}</p>
          {explicacionErrorSintaxis && (
            <p>{`Qué suele significar: ${explicacionErrorSintaxis}`}</p>
          )}
        </div>
      )}

      {usaTypeScript && (
        <section aria-labelledby={idErroresTipos} className="space-y-2">
          <h4 id={idErroresTipos} className="text-sm font-semibold">
            {etiquetaPanelTipos}
          </h4>
          <PanelDiagnosticosTs
            estado={estadoPanelTipos}
            diagnosticos={diagnosticosTipos}
            error={errorTipos}
            agruparPorArchivo
          />
        </section>
      )}

      {mostrarLint && (
        <PanelLint estado={estadoPanelLint} diagnosticos={diagnosticosLint} error={errorLint} />
      )}
    </div>
  )
}
