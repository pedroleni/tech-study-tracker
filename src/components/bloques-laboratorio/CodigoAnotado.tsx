import { MessageSquareText } from 'lucide-react'
import { useId, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { NotasAnotadas } from '@/components/bloques-laboratorio/NotasAnotadas'
import { useAnotacionesConLinea } from '@/components/bloques-laboratorio/useAnotacionesConLinea'
import type { DatosCodigoAnotado } from '@/lib/laboratorio/schemas'

const NOMBRE = { html: 'HTML', jsx: 'JSX', tsx: 'TSX' }

export function CodigoAnotado({
  codigo,
  lenguaje,
  anotaciones,
  etiquetaSeccion = 'Código anotado',
}: DatosCodigoAnotado & { etiquetaSeccion?: string }) {
  const idNota = useId()
  const anotacionesValidas = useAnotacionesConLinea(anotaciones, codigo)
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  const activa = anotacionesValidas[anotacionActiva]

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-50 dark:bg-amber-950/40">
          <MessageSquareText
            aria-hidden="true"
            className="size-4.75 text-amber-600 dark:text-amber-400"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
            Código anotado
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            Selecciona un número para destacar su línea y leer la nota
          </h3>
        </div>
      </div>

      <CodigoResaltado
        codigo={codigo}
        lenguaje={lenguaje}
        numerarLineas
        lineasDestacadas={activa ? [activa.linea] : []}
        etiqueta={`Código ${NOMBRE[lenguaje]} anotado`}
      />

      <NotasAnotadas
        anotaciones={anotacionesValidas}
        activa={anotacionActiva}
        onActivar={setAnotacionActiva}
        idNota={idNota}
        etiqueta="Anotaciones del código"
        color="amber"
      />
    </section>
  )
}
