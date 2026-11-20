import { type Dispatch, type SetStateAction } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { cn } from '@/lib/utils'

import { hallazgosDeV4 } from './laboratorio-v4-analisis'
import {
  VACIOS_V4,
  type AnalisisV4,
  type CapaV4,
  type HallazgoV4,
} from './laboratorio-v4-datos'

function TarjetaTrampaV4({ trampa }: { trampa: HallazgoV4 }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
      <h3 className="text-sm font-semibold text-destructive">El botón que no es un botón</h3>
      <p className="mt-1 text-xs text-muted-foreground">Esto es lo que hay en tu HTML:</p>
      <CodigoResaltado
        codigo={trampa.codigo ?? ''}
        lenguaje="html"
        etiqueta="El elemento que parece un botón"
        className="mt-1.5"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Cámbialo por un <code>&lt;button&gt;</code> y entra solo en el recorrido del teclado, se
        activa con Intro y con Espacio, y se anuncia como botón:
      </p>
      <CodigoResaltado
        codigo={(trampa.codigo ?? '')
          .replace(/^<\s*[a-z0-9]+/i, '<button')
          .replace(/<\/\s*[a-z0-9]+\s*>$/i, '</button>')}
        lenguaje="html"
        etiqueta="El mismo elemento, con la etiqueta correcta"
        className="mt-1.5"
      />
    </div>
  )
}

function HallazgoV4({
  hallazgo,
  capa,
  seleccionado,
  setSeleccion,
}: {
  hallazgo: HallazgoV4
  capa: CapaV4
  seleccionado: boolean
  setSeleccion: Dispatch<SetStateAction<string | null>>
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={seleccionado}
        onClick={() => setSeleccion(seleccionado ? null : hallazgo.ruta)}
        style={{ paddingLeft: `${8 + (hallazgo.sangria ?? 0) * 10}px` }}
        className={cn(
          'flex min-h-11 w-full touch-manipulation items-start gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors',
          seleccionado ? 'border-transparent ring-2 ring-ring' : 'border-transparent hover:bg-muted',
          hallazgo.gravedad === 'error' && 'bg-destructive/10',
          hallazgo.gravedad === 'aviso' && 'bg-muted/60'
        )}
      >
        <span
          className={cn(
            'mt-px shrink-0 rounded px-1.5 py-0.5 text-[10px] leading-4 font-bold',
            hallazgo.gravedad === 'error' && 'text-destructive'
          )}
          style={
            hallazgo.gravedad === 'error'
              ? undefined
              : { backgroundColor: capa.rotulo, color: '#ffffff' }
          }
        >
          {hallazgo.gravedad === 'error' ? '!' : hallazgo.detalle}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate">{hallazgo.texto}</span>
          {hallazgo.gravedad !== 'ok' && (
            <span className="block text-[11px] text-muted-foreground">{hallazgo.detalle}</span>
          )}
        </span>
        <span className="shrink-0 font-mono text-[11px] opacity-50">&lt;{hallazgo.etiqueta}&gt;</span>
      </button>
    </li>
  )
}

function GrupoLecturaV4({
  capa,
  analisis,
  seleccion,
  setSeleccion,
}: {
  capa: CapaV4
  analisis: AnalisisV4
  seleccion: string | null
  setSeleccion: Dispatch<SetStateAction<string | null>>
}) {
  const hallazgos = hallazgosDeV4(analisis, capa.id)
  return (
    <div className="rounded-lg border p-2">
      <h3 className="mb-1.5 flex items-center gap-2 px-1 text-sm font-semibold">
        <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border" style={{ backgroundColor: capa.color }} />
        {capa.nombre}
      </h3>
      {hallazgos.length === 0 ? (
        <p className="px-1 pb-1 text-xs text-muted-foreground">{VACIOS_V4[capa.id]}</p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {hallazgos.map((hallazgo) => (
            <HallazgoV4
              key={`${capa.id}-${hallazgo.ruta}-${hallazgo.detalle}`}
              hallazgo={hallazgo}
              capa={capa}
              seleccionado={seleccion === hallazgo.ruta}
              setSeleccion={setSeleccion}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

type PropiedadesLecturasV4 = {
  idLecturas: string
  capasActivas: CapaV4[]
  analisis: AnalisisV4
  seleccion: string | null
  setSeleccion: Dispatch<SetStateAction<string | null>>
}

export function LecturasV4(props: PropiedadesLecturasV4) {
  const trampaPrincipal = props.analisis.trampas[0]
  return (
    <section
      aria-labelledby={props.idLecturas}
      className="min-w-0 lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1"
    >
      <h2 id={props.idLecturas} className="mb-2 text-sm font-semibold">Lecturas</h2>
      <div className="space-y-3">
        {trampaPrincipal && <TarjetaTrampaV4 trampa={trampaPrincipal} />}
        {props.capasActivas.length === 0 && (
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Enciende una capa para que el escáner tenga algo que contar.
          </p>
        )}
        {props.capasActivas.map((capa) => (
          <GrupoLecturaV4
            key={capa.id}
            capa={capa}
            analisis={props.analisis}
            seleccion={props.seleccion}
            setSeleccion={props.setSeleccion}
          />
        ))}
        <p className="text-xs text-muted-foreground">
          Pulsa cualquier hallazgo para señalarlo sobre la página: se apaga todo lo demás y solo
          queda ese elemento iluminado.
        </p>
      </div>
    </section>
  )
}
