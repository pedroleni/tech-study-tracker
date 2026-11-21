import { css as lenguajeCss } from '@codemirror/lang-css'
import { javascript as lenguajeJavascript } from '@codemirror/lang-javascript'

import { EditorCodeMirror } from '@/components/bloques-laboratorio/EditorCodeMirror'
import { PanelDiagnosticosTs } from '@/components/bloques-laboratorio/PanelDiagnosticosTs'
import { PanelLint } from '@/components/bloques-laboratorio/PanelLint'
import { CodigoResaltado } from '@/components/codigo'
import type { ArchivoReact } from '@/lib/laboratorio/schemasReact'
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
