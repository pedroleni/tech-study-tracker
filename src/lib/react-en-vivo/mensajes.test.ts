import { afterEach, describe, expect, it } from 'vitest'

import { leerMensajeReactEnVivo } from './mensajes'

function prepararIframe() {
  const iframe = document.createElement('iframe')
  document.body.append(iframe)
  const evento = (data: unknown, source: unknown = iframe.contentWindow) =>
    new MessageEvent('message', { data, source: source as Window })
  return { iframe, evento }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('leerMensajeReactEnVivo', () => {
  it('acepta un mensaje válido de su propio iframe', () => {
    const { iframe, evento } = prepararIframe()

    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'commit', numero: 2 }),
        iframe.contentWindow,
      ),
    ).toEqual({ canal: 'react-en-vivo', tipo: 'commit', numero: 2 })
    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'error-render', texto: 'Roto', archivo: 'App.jsx', linea: 3 }),
        iframe.contentWindow,
      ),
    ).toEqual({ canal: 'react-en-vivo', tipo: 'error-render', texto: 'Roto', archivo: 'App.jsx', linea: 3 })
  })

  it('rechaza mensajes de otra ventana, de otro canal o sin ventana esperada', () => {
    const { iframe, evento } = prepararIframe()
    const commit = { canal: 'react-en-vivo', tipo: 'commit', numero: 2 }

    expect(leerMensajeReactEnVivo(evento(commit, window), iframe.contentWindow)).toBeNull()
    expect(
      leerMensajeReactEnVivo(evento({ ...commit, canal: 'otro' }), iframe.contentWindow),
    ).toBeNull()
    expect(leerMensajeReactEnVivo(evento(commit), null)).toBeNull()
  })

  it('rechaza mensajes que superan los límites', () => {
    const { iframe, evento } = prepararIframe()

    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'consola', nivel: 'log', texto: 'a'.repeat(2001), commit: 0 }),
        iframe.contentWindow,
      ),
    ).toBeNull()
    expect(
      leerMensajeReactEnVivo(
        evento({
          canal: 'react-en-vivo',
          tipo: 'resultado-comprobaciones',
          resultados: Array(9).fill({ descripcion: 'd', ok: true }),
        }),
        iframe.contentWindow,
      ),
    ).toBeNull()
    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'alto', alto: Number.POSITIVE_INFINITY }),
        iframe.contentWindow,
      ),
    ).toBeNull()
    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'consola', nivel: 'debug', texto: 'x', commit: 0 }),
        iframe.contentWindow,
      ),
    ).toBeNull()
  })
})
