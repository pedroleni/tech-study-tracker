import { useId, useState } from 'react'

import { ArbolVisual, LeyendaArbol } from '@/components/bloques-laboratorio/ArbolVisual'
import type { MensajeArbol, MotivoRender, NodoArbolRender } from '@/lib/react-en-vivo/mensajes'

// Panel del árbol de renders (fase 2) debajo de la vista previa de React:
// qué componentes se ejecutaron en el último commit, por qué, y cuántos
// nodos del DOM cambiaron de verdad. Los datos vienen del iframe (arbol.js),
// ya validados con Zod, y se pintan solo como texto.

const DETALLES: Record<NonNullable<Extract<MotivoRender, { tipo: 'prop' }>['detalle']>, string> = {
  'funcion-nueva': 'función nueva',
  'objeto-nuevo': 'objeto nuevo',
  'array-nuevo': 'array nuevo',
}

function textoMotivo(motivo: MotivoRender, nodo: NodoArbolRender) {
  switch (motivo.tipo) {
    case 'estado':
      return nodo.estados.length > 1 ? `cambió su estado n.º ${motivo.indice}` : 'cambió su estado'
    case 'prop':
      return `cambió la prop «${motivo.nombre}»` + (motivo.detalle ? ` (${DETALLES[motivo.detalle]})` : '')
    case 'contexto':
      return `cambió el contexto «${motivo.nombre}»`
    case 'padre':
      return 'se renderizó su padre'
    case 'gancho':
      return 'cambió otro de sus ganchos'
  }
}

const contar = (cantidad: number, singular: string, plural: string) =>
  `${cantidad} ${cantidad === 1 ? singular : plural}`

function resumen(arbol: MensajeArbol) {
  const cuantos = (estado: NodoArbolRender['estado']) => arbol.nodos.filter((nodo) => nodo.estado === estado).length
  const montados = cuantos('montado')
  const desmontados = cuantos('desmontado')
  return [
    `Commit ${arbol.commit}`,
    contar(cuantos('renderizado'), 'renderizado', 'renderizados'),
    ...(montados > 0 ? [contar(montados, 'montado', 'montados')] : []),
    ...(desmontados > 0 ? [contar(desmontados, 'desmontado', 'desmontados')] : []),
    contar(arbol.cambiosDom, 'cambio en el DOM', 'cambios en el DOM'),
  ].join(' · ')
}

export function ArbolDeRenders({ arbol }: { arbol: MensajeArbol | null }) {
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const idDetalle = useId()
  // Los ids empiezan de nuevo en cada documento. Se limpia durante el render
  // que recibe null para no abrir por accidente otro nodo con el mismo id.
  if (arbol === null && seleccionado !== null) setSeleccionado(null)
  const nodoSeleccionado = arbol?.nodos.find((nodo) => nodo.id === seleccionado)

  return (
    <div className="min-w-0 space-y-2">
      <h4 className="text-sm font-semibold">Árbol de renders</h4>
      <div className="min-w-0 space-y-2 rounded-lg border bg-muted/40 p-2 text-xs">
        {arbol === null ? (
          <p className="px-1 py-0.5 text-muted-foreground">
            Usa la vista previa para ver qué se vuelve a renderizar.
          </p>
        ) : (
          <>
            <p className="px-1 font-medium">{resumen(arbol)}</p>
            {arbol.nodos.length === 0 ? (
              <p className="px-1 text-muted-foreground">No hay ningún componente montado.</p>
            ) : (
              <div className="min-w-0 overflow-x-auto">
                <ArbolVisual
                  etiqueta="Árbol de renders del último commit"
                  destello={arbol.commit}
                  seleccionado={seleccionado}
                  idDetalle={idDetalle}
                  onSeleccionar={(id) => setSeleccionado((actual) => (actual === id ? null : Number(id)))}
                  nodos={arbol.nodos.map((nodo) => ({
                    ...nodo,
                    motivo:
                      nodo.estado === 'renderizado'
                        ? nodo.motivos.map((motivo) => textoMotivo(motivo, nodo)).join(' · ')
                        : undefined,
                  }))}
                />
              </div>
            )}
            {arbol.truncado && (
              <p className="px-1 text-muted-foreground">Solo se muestran los primeros 200 componentes.</p>
            )}
            {nodoSeleccionado && (
              <div
                id={idDetalle}
                className="grid min-w-0 gap-3 rounded-md border bg-background p-2 font-mono sm:grid-cols-2"
              >
                <h5 className="font-sans font-semibold sm:col-span-2">
                  Detalle de {nodoSeleccionado.nombre}
                </h5>
                <div className="min-w-0 space-y-1">
                  <p className="font-sans font-semibold">Props</p>
                  {nodoSeleccionado.props.length === 0 ? (
                    <p className="font-sans text-muted-foreground">Sin props</p>
                  ) : (
                    <ul className="space-y-0.5">
                      {nodoSeleccionado.props.map((prop) => (
                        <li key={prop.nombre} className="break-words">{`${prop.nombre}: ${prop.valor}`}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-sans font-semibold">Estado</p>
                  {nodoSeleccionado.estados.length === 0 ? (
                    <p className="font-sans text-muted-foreground">Sin estado</p>
                  ) : (
                    <ul className="space-y-0.5">
                      {nodoSeleccionado.estados.map((estado, indice) => (
                        <li key={indice} className="break-words">
                          {estado.valor}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            <LeyendaArbol />
          </>
        )}
      </div>
    </div>
  )
}
