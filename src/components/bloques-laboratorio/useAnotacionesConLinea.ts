import { useMemo } from 'react'

// Anotaciones cuyo fragmento aparece en el texto, con la línea (desde 1) donde
// empieza su primera aparición. Las que no aparecen se descartan. Lo usan los
// bloques anotados que numeran líneas (código, React y SQL); Git solo filtra y
// no busca líneas, por eso no pasa por aquí.
export function useAnotacionesConLinea<T extends { fragmento: string }>(
  anotaciones: readonly T[],
  texto: string,
): (T & { linea: number })[] {
  return useMemo(
    () =>
      anotaciones.flatMap((anotacion) => {
        const posicion = texto.indexOf(anotacion.fragmento)
        if (posicion === -1) return []
        return [{ ...anotacion, linea: texto.slice(0, posicion).split('\n').length }]
      }),
    [anotaciones, texto],
  )
}
