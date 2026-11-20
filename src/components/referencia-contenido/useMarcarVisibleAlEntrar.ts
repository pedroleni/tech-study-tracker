import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'

// Común a ContadorEnScroll y LineaComparativaAnimada: marca el contenedor como visible la
// primera vez que entra un 35 % en pantalla y deja de observarlo (la entrada se anima una
// sola vez). El estado sigue en cada componente para no cambiar el orden de sus hooks.
export function useMarcarVisibleAlEntrar(
  contenedorRef: RefObject<HTMLElement | null>,
  setVisible: Dispatch<SetStateAction<boolean>>,
) {
  // La ref y el setter de useState son estables: el efecto solo se ejecuta al montar.
  useEffect(() => {
    const elemento = contenedorRef.current
    if (!elemento) return
    if (typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [contenedorRef, setVisible])
}
