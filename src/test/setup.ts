import '@testing-library/jest-dom/vitest'
import 'vitest-axe/extend-expect'
import * as axeMatchers from 'vitest-axe/matchers'
import { expect } from 'vitest'

expect.extend(axeMatchers)

// CodeMirror mide rangos y observa el tamaño del editor. jsdom no implementa
// todavía estas APIs de layout; estos stubs solo evitan que el entorno de test
// falle antes de poder comprobar el DOM y la accesibilidad del componente.
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList
}
if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () => new DOMRect()
}
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// jsdom no implementa window.matchMedia de verdad: devuelve un objeto sin
// addEventListener ni el addListener obsoleto. CodeMirror lo usa en su
// DOMObserver para detectar cambios de zoom/impresión (comprueba primero
// addEventListener y solo cae a addListener si no existe) — sin ninguno de
// los dos, crear un EditorView revienta con "addListener is not a function".
// Se sustituye entera, no se parchea encima, porque la de jsdom ya "existe"
// pero no sirve.
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia
