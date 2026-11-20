import { Fragment, type Dispatch, type SetStateAction } from 'react'

import { CLASES_TOKEN, CodigoResaltado, type tokenizarLineas } from '@/components/codigo'
import { cn } from '@/lib/utils'

import {
  ANOTACIONES_V2,
  type AnalisisV2,
  type AnotacionV2,
} from './laboratorio-v2-modelo'

type LineaV2 = ReturnType<typeof tokenizarLineas>[number]
export type NotaPorLineaV2 = { nota: AnotacionV2; numero: number }

type InteraccionNotaV2 = {
  activa: AnotacionV2 | null
  anclada: string | null
  setAnclada: Dispatch<SetStateAction<string | null>>
  setSenalada: Dispatch<SetStateAction<string | null>>
  senalar: (id: string) => () => void
  soltar: (id: string) => (evento: { currentTarget: HTMLElement }) => void
}

function MarcaV2({ numero, activa, grande }: { numero: number; activa: boolean; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border font-sans font-semibold tabular-nums transition-colors',
        grande ? 'size-6 text-xs' : 'size-[1.125rem] text-[10px]',
        activa
          ? 'border-transparent bg-foreground text-background'
          : 'border-border bg-muted text-foreground'
      )}
    >
      {numero}
    </span>
  )
}

function NotaMargenV2({
  marcada,
  numeroLinea,
  analisis,
  interaccion,
}: {
  marcada: NotaPorLineaV2
  numeroLinea: number
  analisis: AnalisisV2
  interaccion: InteraccionNotaV2
}) {
  const estaActiva = interaccion.activa?.id === marcada.nota.id
  return (
    <div
      onMouseEnter={interaccion.senalar(marcada.nota.id)}
      onMouseLeave={interaccion.soltar(marcada.nota.id)}
      onFocus={interaccion.senalar(marcada.nota.id)}
      onBlur={(evento) => {
        if (evento.currentTarget.contains(evento.relatedTarget)) return
        interaccion.setSenalada((actual) => (actual === marcada.nota.id ? null : actual))
      }}
      className={cn(
        'my-3 ml-[1.875rem] rounded-lg border p-3 font-sans transition-colors',
        estaActiva ? 'border-foreground/30 bg-muted/70' : 'bg-muted/25'
      )}
    >
      <div className="flex items-start gap-3">
        <MarcaV2 numero={marcada.numero} activa={estaActiva} grande />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-[11px] font-semibold tracking-[0.14em] uppercase">
            <span className={cn(marcada.nota.problema ? 'text-destructive' : 'text-muted-foreground')}>
              {marcada.nota.rotulo}
            </span>
            <span aria-hidden="true" className="text-muted-foreground/50">·</span>
            <span className="font-normal tracking-normal text-muted-foreground normal-case">
              línea {numeroLinea}
            </span>
          </p>
          <h3 className="mt-1 text-sm font-semibold">{marcada.nota.titulo}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{marcada.nota.texto}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Señala a{' '}<code className="font-mono">{analisis.objetivos[marcada.nota.id]}</code>
          </p>
        </div>
        <button
          type="button"
          aria-pressed={interaccion.anclada === marcada.nota.id}
          aria-label={`Fijar en la página la nota ${marcada.numero}: ${marcada.nota.titulo}`}
          onClick={() =>
            interaccion.setAnclada((actual) =>
              actual === marcada.nota.id ? null : marcada.nota.id
            )
          }
          className={cn(
            'min-h-11 shrink-0 touch-manipulation rounded-full border px-3 py-2 text-xs whitespace-nowrap transition-colors',
            interaccion.anclada === marcada.nota.id
              ? 'border-transparent bg-primary text-primary-foreground'
              : 'hover:bg-background'
          )}
        >
          En la página
        </button>
      </div>
      {marcada.nota.arreglo && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium">{marcada.nota.arreglo.titulo}</p>
          <CodigoResaltado
            codigo={marcada.nota.arreglo.codigo}
            lenguaje="html"
            etiqueta={`${marcada.nota.arreglo.titulo}, nota ${marcada.numero}`}
            className="bg-background"
          />
        </div>
      )}
    </div>
  )
}

function LineaAnotadaV2({
  linea,
  marcada,
  lineaActiva,
  analisis,
  interaccion,
}: {
  linea: LineaV2
  marcada: NotaPorLineaV2 | undefined
  lineaActiva: number
  analisis: AnalisisV2
  interaccion: InteraccionNotaV2
}) {
  return (
    <Fragment>
      <div
        onMouseEnter={marcada ? interaccion.senalar(marcada.nota.id) : undefined}
        onMouseLeave={marcada ? interaccion.soltar(marcada.nota.id) : undefined}
        className={cn(
          'flex min-h-[1.625em] gap-3 rounded-sm',
          lineaActiva === linea.numero && 'sintaxis-linea-destacada'
        )}
      >
        <span aria-hidden="true" className="flex w-[1.125rem] shrink-0 justify-end select-none">
          {marcada && (
            <MarcaV2 numero={marcada.numero} activa={interaccion.activa?.id === marcada.nota.id} />
          )}
        </span>
        <code className="min-w-0 flex-1 break-words whitespace-pre-wrap">
          {linea.tokens.map((token, indice) => (
            <span key={indice} className={CLASES_TOKEN[token.tipo]}>{token.texto}</span>
          ))}
        </code>
      </div>
      {marcada && (
        <NotaMargenV2
          marcada={marcada}
          numeroLinea={linea.numero}
          analisis={analisis}
          interaccion={interaccion}
        />
      )}
    </Fragment>
  )
}

type PropiedadesCodigoV2 = InteraccionNotaV2 & {
  idCodigo: string
  lineas: LineaV2[]
  notasPorLinea: Map<number, NotaPorLineaV2>
  lineaActiva: number
  analisis: AnalisisV2
}

export function PanelCodigoV2(props: PropiedadesCodigoV2) {
  const interaccion: InteraccionNotaV2 = props
  return (
    <section aria-labelledby={props.idCodigo} className="min-w-0">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={props.idCodigo} className="text-sm font-semibold">El código, comentado</h2>
        <p className="text-xs text-muted-foreground">{ANOTACIONES_V2.length} notas al margen</p>
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">suscripcion.html</span>
          <span className="text-xs text-muted-foreground">solo lectura</span>
        </div>
        <div className="p-3 font-mono text-xs leading-relaxed">
          {props.lineas.map((linea) => (
            <LineaAnotadaV2
              key={linea.numero}
              linea={linea}
              marcada={props.notasPorLinea.get(linea.numero)}
              lineaActiva={props.lineaActiva}
              analisis={props.analisis}
              interaccion={interaccion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

type PropiedadesPaginaV2 = {
  idPagina: string
  mostrarTodas: boolean
  setMostrarTodas: Dispatch<SetStateAction<boolean>>
  documento: string
  activa: AnotacionV2 | null
  analisis: AnalisisV2
}

export function PanelPaginaV2(props: PropiedadesPaginaV2) {
  return (
    <section aria-labelledby={props.idPagina} className="min-w-0 lg:sticky lg:top-6 lg:self-start">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 id={props.idPagina} className="text-sm font-semibold">La página</h2>
        <label className="inline-flex min-h-11 cursor-pointer touch-manipulation items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            className="size-4"
            checked={props.mostrarTodas}
            onChange={(evento) => props.setMostrarTodas(evento.target.checked)}
          />
          Ver las cinco anclas a la vez
        </label>
      </div>
      <iframe
        className="mt-2 block h-72 w-full max-w-full rounded-xl border bg-card sm:h-80 lg:h-[20rem]"
        sandbox=""
        srcDoc={props.documento}
        title="Vista previa del formulario de suscripción"
      />
      <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground">
        {props.activa ? (
          <>
            Señalando la nota {ANOTACIONES_V2.indexOf(props.activa) + 1}:{' '}
            <span className="text-foreground">{props.activa.titulo}</span>.
          </>
        ) : (
          'Pasa el ratón por una nota, o tabula hasta ella, y su elemento aparece rodeado aquí mismo.'
        )}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <dt className="text-xs text-muted-foreground">Paradas del tabulador</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{props.analisis.paradas}</dd>
        </div>
        <div className={cn('rounded-xl border p-3', props.analisis.trampas.length > 0 && 'border-destructive/40 bg-destructive/10')}>
          <dt className="text-xs text-muted-foreground">Parecen pulsables y quedan fuera</dt>
          <dd className={cn('mt-1 text-2xl font-semibold tabular-nums', props.analisis.trampas.length > 0 && 'text-destructive')}>
            {props.analisis.trampas.length}
          </dd>
        </div>
      </dl>
      {props.analisis.trampas.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          La que se queda fuera dice «{props.analisis.trampas.join('», «')}».
        </p>
      )}
      <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
        La vista previa se muestra en un iframe sin permiso para ejecutar scripts, y las cuentas de
        arriba salen de leer el HTML con DOMParser, que no ejecuta nada.
      </p>
    </section>
  )
}
