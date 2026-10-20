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
  document.body.replaceChildren()
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

  it('acepta el progreso de una comprobación', () => {
    const { iframe, evento } = prepararIframe()
    const progreso = {
      canal: 'react-en-vivo',
      tipo: 'progreso-comprobaciones',
      resultado: { descripcion: 'd', ok: false, motivo: 'm' },
    }

    expect(leerMensajeReactEnVivo(evento(progreso), iframe.contentWindow)).toEqual(progreso)
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

describe('mensaje arbol', () => {
  const nodo = {
    id: 1,
    nivel: 0,
    nombre: 'App',
    estado: 'renderizado',
    renders: 2,
    motivos: [
      { tipo: 'prop', nombre: 'alPulsar', detalle: 'funcion-nueva' },
      { tipo: 'gancho' },
    ],
    props: [{ nombre: 'titulo', valor: '"Hola"' }],
    estados: [{ valor: '0' }],
  }
  const arbol = (cambios: Record<string, unknown> = {}, nodos: unknown[] = [nodo]) => ({
    canal: 'react-en-vivo',
    tipo: 'arbol',
    commit: 3,
    nodos,
    truncado: false,
    cambiosDom: 1,
    ...cambios,
  })
  const leer = (datos: unknown) => {
    const { iframe, evento } = prepararIframe()
    return leerMensajeReactEnVivo(evento(datos), iframe.contentWindow)
  }

  it('acepta un mensaje arbol válido', () => {
    expect(leer(arbol())).toEqual(arbol())
    expect(leer(arbol({}, [{ ...nodo, clave: 'a', marca: 'memo', estado: 'desmontado', motivos: [] }]))).not.toBeNull()
  })

  it('rechaza un arbol con 201 nodos', () => {
    expect(leer(arbol({}, Array.from({ length: 201 }, (_, i) => ({ ...nodo, id: i + 1 }))))).toBeNull()
  })

  it('rechaza un nombre de 61 caracteres', () => {
    expect(leer(arbol({}, [{ ...nodo, nombre: 'a'.repeat(61) }]))).toBeNull()
  })

  it('rechaza un estado desconocido', () => {
    expect(leer(arbol({}, [{ ...nodo, estado: 'repintado' }]))).toBeNull()
  })

  it('rechaza un valor de prop de 81 caracteres', () => {
    expect(leer(arbol({}, [{ ...nodo, props: [{ nombre: 'x', valor: 'a'.repeat(81) }] }]))).toBeNull()
  })

  it('rechaza un motivo prop sin nombre', () => {
    expect(leer(arbol({}, [{ ...nodo, motivos: [{ tipo: 'prop' }] }]))).toBeNull()
  })
})
