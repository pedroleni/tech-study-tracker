// Árbol de renders (fase 2) con el React REAL del sandbox
// (public/vendor/react-en-vivo/19.3.1/react.js), no con el de la web: arbol.js
// lee internos de React (fibers) y este archivo es la alarma si una versión
// nueva los cambia. Ver "Alcance de la fase 2" en specs/features/react-en-vivo.md.
import { fireEvent, waitFor, within } from '@testing-library/dom'
import { readFileSync } from 'node:fs'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import codigoCompilado from '@/lib/react-kit/__fixtures__/compilador-app.compilado.jsx?raw'
import codigoOriginal from '@/lib/react-kit/__fixtures__/compilador-app.jsx?raw'

import type { MensajeArbol, NodoArbolRender } from './mensajes'
import { esquemaMensajeReactEnVivo } from './mensajes'
import arbol from './runtime/arbol.js?raw'
import montaje from './runtime/montaje.js?raw'
import puente from './runtime/puente.js?raw'
import { transformarArchivos } from './transformar'

type Ventana = typeof window & Record<string, unknown>
const ventana = window as Ventana

const APP = `import { createContext, memo, useContext, useState } from 'react'

export const Tema = createContext('claro')
Tema.displayName = 'Tema'

function Cabecera() {
  return <h1>Tareas</h1>
}

function Tarea({ texto }) {
  return <li>{texto}</li>
}

const Pie = memo(function Pie() {
  return <footer>pie</footer>
})

function Etiqueta() {
  return <span>{useContext(Tema)}</span>
}

function Contador() {
  const [n, setN] = useState(0)
  return (
    <p>
      Contador: {n} <button onClick={() => setN(n + 1)}>Sumar</button>
    </p>
  )
}

export default function App() {
  const [tareas, setTareas] = useState(['a', 'b'])
  const [tema, setTema] = useState('claro')
  return (
    <Tema value={tema}>
      <Cabecera />
      <ul>
        {tareas.map((t) => (
          <Tarea key={t} texto={t} alPulsar={() => {}} />
        ))}
      </ul>
      <Contador />
      <Pie />
      <Etiqueta />
      <button onClick={() => setTareas([...tareas, 'c'])}>Añadir</button>
      <button onClick={() => setTareas(tareas.filter((t) => t !== 'a'))}>Quitar a</button>
      <button onClick={() => setTema('oscuro')}>Oscuro</button>
    </Tema>
  )
}
`

let enviar: ReturnType<typeof vi.fn>

beforeAll(() => {
  // Orden del documento real: puente (instala el hook) → react.js → arbol.js → montaje.
  new Function(puente)()
  new Function(readFileSync('public/vendor/react-en-vivo/19.3.1/react.js', 'utf8'))()
})

beforeEach(() => {
  document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
  enviar = vi.fn()
  ventana.__enviarReactEnVivo = enviar
  // Cada ejecución de arbol.js empieza de cero (ids, contadores, árbol anterior).
  new Function(arbol)()
})

async function montar(archivos: ArchivoReact[]) {
  const t = await transformarArchivos(archivos)
  if (!t.ok) throw new Error(t.mensaje)
  ventana.__configReactEnVivo = { modulos: t.modulos, archivosCss: t.archivosCss, strictMode: true }
  new Function(montaje)()
  return siguienteArbol(0)
}

const arboles = () =>
  enviar.mock.calls.map(([m]) => m as { tipo: string }).filter((m) => m.tipo === 'arbol') as MensajeArbol[]

async function siguienteArbol(vistos: number) {
  await waitFor(() => expect(arboles().length).toBeGreaterThan(vistos))
  return arboles().at(-1)!
}

async function pulsar(nombre: string) {
  const vistos = arboles().length
  fireEvent.click(within(document.body).getByRole('button', { name: nombre }))
  return siguienteArbol(vistos)
}

// Una línea por nodo: nivel, nombre, key, marca y estado. Comparar estas
// líneas con las esperadas es la alarma ante cambios de los internos.
const forma = (n: NodoArbolRender) =>
  `${'  '.repeat(n.nivel)}${n.nombre}${n.clave !== undefined ? ` key=${n.clave}` : ''}${n.marca ? ` [${n.marca}]` : ''}: ${n.estado}`

const nodo = (mensaje: MensajeArbol, nombre: string, clave?: string) =>
  mensaje.nodos.find((n) => n.nombre === nombre && n.clave === clave)!

describe('árbol de renders', () => {
  it('sin React Compiler, el clic vuelve a renderizar Fila porque se renderizó su padre', async () => {
    await montar([{ nombre: 'App.jsx', codigo: codigoOriginal }])
    const sinCompilar = await pulsar('Pulsado 0')
    expect(nodo(sinCompilar, 'Fila', 'Pan')).toMatchObject({
      estado: 'renderizado',
      motivos: [{ tipo: 'padre' }],
    })
    expect(nodo(sinCompilar, 'Fila', 'Leche')).toMatchObject({
      estado: 'renderizado',
      motivos: [{ tipo: 'padre' }],
    })
  })

  it('con React Compiler, el mismo clic deja Fila sin cambios', async () => {
    await montar([{ nombre: 'App.jsx', codigo: codigoCompilado }])
    const compilado = await pulsar('Pulsado 0')
    expect(nodo(compilado, 'Fila', 'Pan').estado).toBe('sin-cambios')
    expect(nodo(compilado, 'Fila', 'Leche').estado).toBe('sin-cambios')
  })

  it('al montar, todos los componentes salen montados con su nivel y su estado', async () => {
    const montaje = await montar([{ nombre: 'App.jsx', codigo: APP }])

    expect(esquemaMensajeReactEnVivo.safeParse({ ...montaje, canal: 'react-en-vivo' }).success).toBe(true)
    expect(montaje.nodos.map(forma)).toEqual([
      'App: montado',
      '  Tema [proveedor]: montado',
      '    Cabecera: montado',
      '    Tarea key=a: montado',
      '    Tarea key=b: montado',
      '    Contador: montado',
      '    Pie [memo]: montado',
      '    Etiqueta: montado',
    ])
    expect(montaje.nodos.every((n) => n.renders === 1)).toBe(true)
    expect(nodo(montaje, 'App').estados).toEqual([{ valor: '["a","b"]' }, { valor: '"claro"' }])
    expect(nodo(montaje, 'Contador').estados).toEqual([{ valor: '0' }])
    expect(montaje.truncado).toBe(false)
  })

  it('pulsar Sumar solo re-renderiza Contador, por su estado', async () => {
    await montar([{ nombre: 'App.jsx', codigo: APP }])
    const commit = await pulsar('Sumar')

    expect(commit.nodos.map(forma)).toEqual([
      'App: sin-cambios',
      '  Tema [proveedor]: sin-cambios',
      '    Cabecera: sin-cambios',
      '    Tarea key=a: sin-cambios',
      '    Tarea key=b: sin-cambios',
      '    Contador: renderizado',
      '    Pie [memo]: sin-cambios',
      '    Etiqueta: sin-cambios',
    ])
    const contador = nodo(commit, 'Contador')
    expect(contador.renders).toBe(2)
    expect(contador.motivos).toEqual([{ tipo: 'estado', indice: 1 }])
    expect(contador.estados).toEqual([{ valor: '1' }])
    expect(commit.cambiosDom).toBe(1)
  })

  it('añadir una tarea monta la nueva y explica cada re-render', async () => {
    await montar([{ nombre: 'App.jsx', codigo: APP }])
    const commit = await pulsar('Añadir')

    expect(commit.nodos.map(forma)).toEqual([
      'App: renderizado',
      '  Tema [proveedor]: renderizado',
      '    Cabecera: renderizado',
      '    Tarea key=a: renderizado',
      '    Tarea key=b: renderizado',
      '    Tarea key=c: montado',
      '    Contador: renderizado',
      '    Pie [memo]: sin-cambios',
      '    Etiqueta: renderizado',
    ])
    expect(nodo(commit, 'App').motivos).toEqual([{ tipo: 'estado', indice: 1 }])
    for (const clave of ['a', 'b']) {
      expect(nodo(commit, 'Tarea', clave).motivos).toEqual([
        { tipo: 'prop', nombre: 'alPulsar', detalle: 'funcion-nueva' },
      ])
    }
    for (const nombre of ['Cabecera', 'Contador', 'Etiqueta']) {
      expect(nodo(commit, nombre).motivos).toEqual([{ tipo: 'padre' }])
    }
  })

  it('quitar una tarea la emite desmontada una sola vez', async () => {
    await montar([{ nombre: 'App.jsx', codigo: APP }])
    const quitar = await pulsar('Quitar a')

    expect(quitar.nodos.map(forma)).toEqual([
      'App: renderizado',
      '  Tema [proveedor]: renderizado',
      '    Cabecera: renderizado',
      '    Tarea key=a: desmontado',
      '    Tarea key=b: renderizado',
      '    Contador: renderizado',
      '    Pie [memo]: sin-cambios',
      '    Etiqueta: renderizado',
    ])
    const siguiente = await pulsar('Sumar')
    expect(siguiente.nodos.some((n) => n.clave === 'a')).toBe(false)
  })

  it('conserva la key y el nombre de un memo con comparador, también al desmontarlo', async () => {
    const codigo = `import { memo, useState } from 'react'

const Fila = memo(function Fila({ texto }) {
  return <li>{texto}</li>
}, (a, b) => a.texto === b.texto)
Fila.displayName = 'Fila'

export default function App() {
  const [items, setItems] = useState(['a', 'b'])
  return (
    <>
      <ul>{items.map((t) => <Fila key={t} texto={t} />)}</ul>
      <button onClick={() => setItems(items.filter((t) => t !== 'b'))}>Quitar b</button>
    </>
  )
}
`
    const montaje = await montar([{ nombre: 'App.jsx', codigo }])

    expect(montaje.nodos.map(forma)).toContain('  Fila key=a [memo]: montado')
    expect(montaje.nodos.map(forma)).toContain('  Fila key=b [memo]: montado')

    const quitar = await pulsar('Quitar b')
    expect(quitar.nodos.map(forma)).toContain('  Fila key=b [memo]: desmontado')
  })

  it('cambiar el contexto lo dice una sola vez', async () => {
    await montar([{ nombre: 'App.jsx', codigo: APP }])
    const commit = await pulsar('Oscuro')

    expect(nodo(commit, 'Etiqueta').motivos).toEqual([{ tipo: 'contexto', nombre: 'Tema' }])
    expect(nodo(commit, 'Tema').motivos).toContainEqual({ tipo: 'prop', nombre: 'value' })
  })

  it('atribuye a otro gancho el cambio de isPending de useTransition', async () => {
    const codigo = `import { useState, useTransition } from 'react'

export default function App() {
  const [pendiente, iniciar] = useTransition()
  const [n, setN] = useState(0)
  return (
    <button onClick={() => iniciar(() => setN(n + 1))}>
      {pendiente ? 'Pendiente' : 'Iniciar'} {n}
    </button>
  )
}
`
    await montar([{ nombre: 'App.jsx', codigo }])
    const vistos = arboles().length
    fireEvent.click(within(document.body).getByRole('button', { name: 'Iniciar 0' }))

    await waitFor(() => {
      const appConGancho = arboles()
        .slice(vistos)
        .map((mensaje) => nodo(mensaje, 'App'))
        .find((app) => app?.motivos.some((motivo) => motivo.tipo === 'gancho'))
      expect(appConGancho?.motivos).toContainEqual({ tipo: 'gancho' })
      expect(appConGancho?.motivos).not.toContainEqual({ tipo: 'padre' })
    })
  })

  it('los valores raros no rompen el recorrido', async () => {
    const codigo = `function Tarjeta() {
  return <p>tarjeta</p>
}

function Ficha(props) {
  return <p>ficha</p>
}

const ciclo = { nombre: 'ciclo' }
ciclo.yo = ciclo
const traicionero = {}
Object.defineProperty(traicionero, 'x', { enumerable: true, get() { throw new Error('no') } })

export default function App() {
  function guardar() {}
  return (
    <Ficha
      ciclo={ciclo}
      traicionero={traicionero}
      simbolo={Symbol('x')}
      guardar={guardar}
      icono={<Tarjeta />}
      largo={'x'.repeat(500)}
      lista={Array.from({ length: 300 }, (_, i) => i)}
    />
  )
}
`
    const montaje = await montar([{ nombre: 'App.jsx', codigo }])
    const props = Object.fromEntries(nodo(montaje, 'Ficha').props.map((p) => [p.nombre, p.valor]))

    expect(props.guardar).toBe('ƒ guardar()')
    expect(props.icono).toBe('<Tarjeta />')
    expect(props.simbolo).toBe('Symbol(x)')
    expect(props.lista).toBe('[300 elementos]')
    for (const valor of Object.values(props)) expect(valor.length).toBeLessThanOrEqual(80)
    expect(esquemaMensajeReactEnVivo.safeParse({ ...montaje, canal: 'react-en-vivo' }).success).toBe(true)
  })

  it('más de 200 componentes se truncan', async () => {
    const codigo = `function Hoja() {
  return <i>·</i>
}

export default function App() {
  return <div>{Array.from({ length: 250 }, (_, i) => <Hoja key={i} />)}</div>
}
`
    const montaje = await montar([{ nombre: 'App.jsx', codigo }])

    expect(montaje.nodos).toHaveLength(200)
    expect(montaje.truncado).toBe(true)
  })

  it('los cambios del DOM se resaltan desde el segundo commit', async () => {
    await montar([
      { nombre: 'App.jsx', codigo: APP },
      { nombre: 'estilos.css', codigo: 'div { background: hotpink; margin: 4px; padding: 8px; }' },
    ])
    expect(document.getElementById('__resaltados-react-en-vivo')?.childElementCount ?? 0).toBe(0)

    await pulsar('Sumar')
    const resaltados = document.getElementById('__resaltados-react-en-vivo')!
    expect(resaltados.getAttribute('aria-hidden')).toBe('true')
    expect(resaltados.style.position).toBe('fixed')
    expect(resaltados.style.overflow).toBe('hidden')
    expect(resaltados.childElementCount).toBeGreaterThan(0)
    expect(document.getElementById('root')!.contains(resaltados)).toBe(false)
    for (const marco of Array.from(resaltados.children) as HTMLElement[]) {
      expect(['0', '0px']).toContain(marco.style.margin)
      expect(marco.style.background).toBe('transparent')
      expect(marco.style.pointerEvents).toBe('none')
    }
    await waitFor(() => expect(resaltados.childElementCount).toBe(0), { timeout: 2000 })
  })

  it('un fallo dentro del árbol no rompe la app', async () => {
    enviar.mockImplementation((mensaje: { tipo: string }) => {
      if (mensaje.tipo === 'arbol') throw new Error('panel roto')
    })
    const t = await transformarArchivos([{ nombre: 'App.jsx', codigo: APP }])
    if (!t.ok) throw new Error(t.mensaje)
    ventana.__configReactEnVivo = { modulos: t.modulos, archivosCss: t.archivosCss, strictMode: true }
    new Function(montaje)()

    const boton = await within(document.body).findByRole('button', { name: 'Sumar' })
    fireEvent.click(boton)
    expect(await within(document.body).findByText('Contador: 1', { exact: false })).toBeInTheDocument()
  })
})
