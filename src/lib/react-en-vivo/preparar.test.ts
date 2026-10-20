import { expect, it, vi } from 'vitest'

import { prepararDocumento } from './preparar'
import { transformarParaMostrar } from './transformar'

// Un chunk caducado tras un despliegue: el import() de Sucrase falla.
vi.mock('sucrase', () => {
  throw new Error('No se pudo descargar el chunk')
})

const opciones = { origen: 'https://ejemplo.test', strictMode: true, conPruebas: false }
const archivos = [{ nombre: 'App.jsx', codigo: 'export default function App() { return <p /> }' }]

it('si no se puede cargar Sucrase, lo dice en vez de quedarse cargando', async () => {
  const esperado = {
    ok: false,
    error: 'No se pudo cargar el editor de React. Recarga la página para intentarlo de nuevo.',
  }
  expect(await prepararDocumento(archivos, opciones)).toEqual(esperado)
  // Y no se queda cacheado el fallo: el segundo intento vuelve a pedirlo.
  expect(await prepararDocumento(archivos, opciones)).toEqual(esperado)
})

it('la pestaña de JavaScript generado también lo explica', async () => {
  expect(await transformarParaMostrar(archivos)).toBe(
    '// No se pudo cargar el editor de React. Recarga la página para intentarlo de nuevo.',
  )
})
