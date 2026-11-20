import { type Dispatch, type SetStateAction } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { cn } from '@/lib/utils'

import { IconoV3, LineaDiffV3, ListaRecorridoV3 } from './LaboratorioV3Piezas'
import {
  CAMBIOS_V3,
  COLOR_TONO_V3,
  HOJA_DE_ESTILOS_V3,
  LINEAS_CAMBIADAS_V3,
  VERSIONES_V3,
  type AnalisisV3,
  type FilaV3,
  type IdVersionV3,
  type VersionV3,
} from './laboratorio-v3-modelo'

function claseOpcionV3(activa: boolean, id: IdVersionV3): string {
  if (!activa) return 'text-muted-foreground'
  if (id === 'antes') return 'text-destructive'
  return 'text-primary-foreground'
}

export function SelectorVersionV3({
  versionActiva,
  setVersionActiva,
}: {
  versionActiva: IdVersionV3
  setVersionActiva: Dispatch<SetStateAction<IdVersionV3>>
}) {
  const esAntes = versionActiva === 'antes'
  return (
    <fieldset className="mt-6 w-full min-w-0 max-w-md border-0 p-0">
      <legend className="sr-only">Versión del formulario que quieres ver</legend>
      <div className="relative flex rounded-xl border bg-muted p-1">
        {/* La pastilla se desliza al cambiar: el movimiento está aquí, y no
            en la vista previa, que es exactamente lo que hay que notar. */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg transition-transform duration-300 ease-out',
            esAntes ? 'bg-destructive/15' : 'bg-primary',
            !esAntes && 'translate-x-full',
          )}
        />
        {VERSIONES_V3.map((opcion) => {
          const activa = opcion.id === versionActiva
          return (
            <label key={opcion.id} className="relative z-10 flex-1">
              <input
                type="radio"
                name="laboratorio-v3-version"
                value={opcion.id}
                checked={activa}
                onChange={() => setVersionActiva(opcion.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex min-h-11 cursor-pointer touch-manipulation items-center justify-center rounded-lg px-2 py-2 text-center text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring sm:px-3',
                  claseOpcionV3(activa, opcion.id),
                )}
              >
                {opcion.nombre}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function CodigoYResultadoV3({ version }: { version: VersionV3 }) {
  return (
    <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-4">
      <section aria-labelledby="v3-titulo-codigo" className="min-w-0">
        <h2 id="v3-titulo-codigo" className="mb-2 text-sm font-semibold">
          El código{' '}
          <span className="font-normal text-muted-foreground">— versión «{version.nombre}»</span>
        </h2>
        <CodigoResaltado
          codigo={version.cuerpo}
          lenguaje="html"
          numerarLineas
          lineasDestacadas={LINEAS_CAMBIADAS_V3}
          etiqueta={`Código HTML de la versión ${version.nombre}`}
          alturaMaxima="25rem"
          className="h-72 max-w-full sm:h-88 lg:h-[25rem]"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Resaltadas, las líneas {LINEAS_CAMBIADAS_V3.join(' y ')}: las únicas que se mueven.
        </p>
      </section>
      <section aria-labelledby="v3-titulo-vista" className="min-w-0">
        <h2 id="v3-titulo-vista" className="mb-2 text-sm font-semibold">
          El resultado{' '}
          <span className="font-normal text-muted-foreground">— no cambia nunca</span>
        </h2>
        {/* sandbox="" (vacío, sin scripts): el ejemplo se pinta, no se ejecuta. */}
        <iframe
          className="block h-72 w-full max-w-full rounded-lg border bg-card sm:h-88 lg:h-[25rem]"
          sandbox=""
          srcDoc={HOJA_DE_ESTILOS_V3 + version.cuerpo}
          title={`Vista previa de la versión ${version.nombre}`}
        />
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          Versión «{version.nombre}» en pantalla. Los mismos píxeles en las dos: por eso este fallo
          llega a producción.
        </p>
      </section>
    </div>
  )
}

export function DiferenciasV3() {
  return (
    <section aria-labelledby="v3-titulo-diff" className="mt-8">
      <h2 id="v3-titulo-diff" className="text-sm font-semibold">
        Lo único que cambia
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {CAMBIOS_V3.map((cambio) => (
          <div key={cambio.numero} className="min-w-0 rounded-xl border p-3">
            <p className="mb-2 font-mono text-xs text-muted-foreground">línea {cambio.numero}</p>
            <div className="space-y-2">
              <LineaDiffV3
                signo="−"
                descripcion="Línea quitada"
                codigo={cambio.antes}
                etiqueta={`Línea ${cambio.numero} antes`}
                destructivo
              />
              <LineaDiffV3
                signo="+"
                descripcion="Línea añadida"
                codigo={cambio.despues}
                etiqueta={`Línea ${cambio.numero} después`}
                destructivo={false}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{cambio.motivo}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function VeredictoV3({ filas, esAntes }: { filas: FilaV3[]; esAntes: boolean }) {
  return (
    <section aria-labelledby="v3-titulo-veredicto" className="mt-8">
      <h2 id="v3-titulo-veredicto" className="text-sm font-semibold">
        El veredicto, fila a fila
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Una sola fila dice «idéntico». Todas las demás cambian de bando.
      </p>
      {/*
        role + tabIndex: si la tabla no cabe, la caja se desplaza, y una caja
        que se desplaza tiene que poder recorrerse también con el teclado.
      */}
      <div
        role="region"
        aria-label="Tabla comparativa entre las dos versiones"
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- sin tabIndex, axe marca «scrollable-region-focusable» cuando la tabla desborda */
        tabIndex={0}
        className="mt-3 overflow-x-auto rounded-xl border focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <table className="min-w-[32rem] border-collapse text-sm sm:w-full">
          <caption className="sr-only">
            Comparación entre la versión «Antes» y la versión «Después» del mismo formulario
          </caption>
          <thead>
            <tr className="bg-muted/50">
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
              >
                Lo que se mide
              </th>
              <th
                scope="col"
                className={cn(
                  'px-3 py-2 text-left text-xs font-semibold whitespace-nowrap',
                  esAntes && 'bg-destructive/10 text-destructive',
                )}
              >
                Antes
              </th>
              <th
                scope="col"
                className={cn(
                  'px-3 py-2 text-left text-xs font-semibold whitespace-nowrap',
                  !esAntes && 'bg-primary/10',
                )}
              >
                Después
              </th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr key={fila.titulo} className="border-t">
                <th scope="row" className="px-3 py-2 text-left text-xs font-normal">
                  {fila.titulo}
                </th>
                <td className={cn('px-3 py-2', esAntes && 'bg-destructive/5')}>
                  <span
                    className={cn(
                      'flex items-center gap-1.5 text-xs whitespace-nowrap',
                      COLOR_TONO_V3[fila.antes.tono],
                    )}
                  >
                    <IconoV3 tono={fila.antes.tono} />
                    {fila.antes.texto}
                  </span>
                </td>
                <td className={cn('px-3 py-2', !esAntes && 'bg-primary/5')}>
                  <span
                    className={cn(
                      'flex items-center gap-1.5 text-xs whitespace-nowrap',
                      COLOR_TONO_V3[fila.despues.tono],
                    )}
                  >
                    <IconoV3 tono={fila.despues.tono} />
                    {fila.despues.texto}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function RecorridosV3({
  analisis,
}: {
  analisis: { antes: AnalisisV3; despues: AnalisisV3 }
}) {
  return (
    <section aria-labelledby="v3-titulo-teclado" className="mt-8">
      <h2 id="v3-titulo-teclado" className="text-sm font-semibold">
        Los dos recorridos, uno al lado del otro
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <ListaRecorridoV3 analisis={analisis.antes} titulo="Antes" destructivo />
        <ListaRecorridoV3 analisis={analisis.despues} titulo="Después" destructivo={false} />
      </div>
      <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
        El botón «Enviar» está en la pantalla en las dos versiones. En una de ellas, quien navega
        con el teclado nunca llega a él: puede leer el formulario entero y no puede enviarlo.
      </p>
    </section>
  )
}
