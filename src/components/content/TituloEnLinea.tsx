import { Fragment } from 'react'

import {
  parsearTituloEnLinea,
  type FragmentoTitulo,
} from '@/lib/utils/tituloEnLinea'

export interface PropiedadesTituloEnLinea {
  texto: string
}

function renderizarFragmentos(fragmentos: FragmentoTitulo[], clavePadre = '') {
  return fragmentos.map((fragmento, indice) => {
    const clave = `${clavePadre}${indice}`

    if (fragmento.tipo === 'texto') return <Fragment key={clave}>{fragmento.contenido}</Fragment>
    if (fragmento.tipo === 'codigo') {
      return (
        <code
          key={clave}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-rose-700 dark:text-rose-300"
        >
          {fragmento.contenido}
        </code>
      )
    }

    const contenido = renderizarFragmentos(fragmento.contenido, `${clave}-`)
    return fragmento.tipo === 'negrita' ? (
      <strong key={clave}>{contenido}</strong>
    ) : (
      <em key={clave}>{contenido}</em>
    )
  })
}

export function TituloEnLinea({ texto }: PropiedadesTituloEnLinea) {
  // Parser propio: limita la sintaxis a títulos y nunca habilita HTML ni enlaces.
  return <>{renderizarFragmentos(parsearTituloEnLinea(texto))}</>
}
