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
  it('acepta una ubicacion válida', () => {
    const { iframe, evento } = prepararIframe()
    const ubicacion = {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/recetas?q=pan#lista',
      puedeAtras: true,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    }
    expect(leerMensajeReactEnVivo(evento(ubicacion), iframe.contentWindow)).toEqual(ubicacion)
  })

  it('rechaza una ubicacion con url sin / inicial, con //, de más de 500 caracteres o con un origen desconocido', () => {
    const { iframe, evento } = prepararIframe()
    const baseUbicacion = {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/',
      puedeAtras: false,
      puedeAdelante: false,
      origen: 'MemoryRouter',
    }
    for (const cambios of [
      { url: 'recetas' },
      { url: '//otro.example' },
      { url: `/${'a'.repeat(500)}` },
      { origen: 'createStaticRouter' },
    ]) {
      expect(
        leerMensajeReactEnVivo(evento({ ...baseUbicacion, ...cambios }), iframe.contentWindow),
      ).toBeNull()
    }
  })

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
        evento({ canal: 'react-en-vivo', tipo: 'runtime-no-cargado', libreria: 'react-router' }),
        iframe.contentWindow,
      ),
    ).toEqual({ canal: 'react-en-vivo', tipo: 'runtime-no-cargado', libreria: 'react-router' })
    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'runtime-no-cargado', libreria: 'otra' }),
        iframe.contentWindow,
      ),
    ).toBeNull()
    expect(
      leerMensajeReactEnVivo(
        evento({ canal: 'react-en-vivo', tipo: 'error-render', texto: 'Roto', archivo: 'App.jsx', linea: 3 }),
        iframe.contentWindow,
      ),
    ).toEqual({ canal: 'react-en-vivo', tipo: 'error-render', texto: 'Roto', archivo: 'App.jsx', linea: 3 })
    for (const archivo of ['App.tsx', 'datos.ts']) {
      expect(
        leerMensajeReactEnVivo(
          evento({ canal: 'react-en-vivo', tipo: 'error-render', texto: 'Roto', archivo, linea: 3 }),
          iframe.contentWindow,
        ),
      ).toEqual({ canal: 'react-en-vivo', tipo: 'error-render', texto: 'Roto', archivo, linea: 3 })
    }
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

  it('acepta un mensaje peticion válido y rechaza una ruta de 201 caracteres', () => {
    const { iframe, evento } = prepararIframe()
    const peticion = {
      canal: 'react-en-vivo',
      tipo: 'peticion',
      id: 1,
      metodo: 'GET',
      ruta: '/api/recetas?q=pan',
      estado: 'ok',
      codigo: 200,
      ms: 612,
    }

    expect(leerMensajeReactEnVivo(evento(peticion), iframe.contentWindow)).toEqual(peticion)
    expect(
      leerMensajeReactEnVivo(evento({ ...peticion, ruta: `/${'a'.repeat(200)}` }), iframe.contentWindow),
    ).toBeNull()
    expect(leerMensajeReactEnVivo(evento({ ...peticion, metodo: 'HEAD' }), iframe.contentWindow)).not.toBeNull()
    expect(leerMensajeReactEnVivo(evento({ ...peticion, metodo: 'MAL' }), iframe.contentWindow)).not.toBeNull()
    expect(leerMensajeReactEnVivo(evento({ ...peticion, metodo: 'demasiadolargo' }), iframe.contentWindow)).toBeNull()
  })

  it('acepta un mensaje efecto válido y rechaza 9 cambios', () => {
    const { iframe, evento } = prepararIframe()
    const efecto = {
      canal: 'react-en-vivo',
      tipo: 'efecto',
      commit: 4,
      componente: 'Chat',
      gancho: 'useConexion',
      archivo: 'App.jsx',
      linea: 3,
      accion: 'efecto',
      clase: 'useEffect',
      motivo: 'dependencias',
      cambios: [{ nombre: 'sala', antes: '"general"', ahora: '"viaje"' }],
    }

    expect(leerMensajeReactEnVivo(evento(efecto), iframe.contentWindow)).toEqual(efecto)
    for (const archivo of ['App.tsx', 'efectos.ts']) {
      expect(leerMensajeReactEnVivo(evento({ ...efecto, archivo }), iframe.contentWindow)).toEqual({
        ...efecto,
        archivo,
      })
    }
    expect(
      leerMensajeReactEnVivo(
        evento({
          ...efecto,
          cambios: Array.from({ length: 9 }, (_, indice) => ({
            nombre: `dependencia ${indice + 1}`,
            antes: '0',
            ahora: '1',
          })),
        }),
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

describe('mensajes del registro del router', () => {
  const paso = {
    tipo: 'loader',
    ruta: 'recetas',
    fase: 'revalidacion',
    inicio: 6,
    duracion: 42,
    estado: 'ok',
  }
  const operacion = {
    canal: 'react-en-vivo',
    tipo: 'router-operacion',
    id: 2,
    clase: 'envio',
    metodo: 'POST',
    destino: '/recetas',
    estado: 'terminada',
    duracion: 47,
    urlFinal: '/recetas?guardada=1',
    pasos: [paso],
    truncado: false,
    sinEjecutar: ['/'],
    errores: [{ ruta: 'raiz', texto: '404 No existe' }],
  }
  const leer = (datos: unknown) => {
    const { iframe, evento } = prepararIframe()
    return leerMensajeReactEnVivo(evento(datos), iframe.contentWindow)
  }

  it('acepta una router-operacion completa y router-lleno', () => {
    expect(leer(operacion)).toEqual(operacion)
    expect(leer({ canal: 'react-en-vivo', tipo: 'router-lleno' })).toEqual({
      canal: 'react-en-vivo',
      tipo: 'router-lleno',
    })
  })

  it('rechaza más de 40 pasos, un id 0, una clase o fase desconocidas, un destino de más de 200 caracteres y un error de más de 200', () => {
    for (const mensaje of [
      { ...operacion, pasos: Array.from({ length: 41 }, () => paso) },
      { ...operacion, id: 0 },
      { ...operacion, clase: 'prefetch' },
      { ...operacion, pasos: [{ ...paso, fase: 'hidratacion' }] },
      { ...operacion, destino: `/${'a'.repeat(200)}` },
      { ...operacion, pasos: [{ ...paso, error: 'a'.repeat(201) }] },
    ]) {
      expect(leer(mensaje)).toBeNull()
    }
  })
})
