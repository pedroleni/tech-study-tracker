// Registro de efectos (fase 3) con el React REAL del sandbox. Igual que el
// árbol de renders, esta prueba avisa si cambia el comportamiento de React.
import { fireEvent, waitFor, within } from '@testing-library/dom'
import { readFileSync } from 'node:fs'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'

import type { MensajeEfecto } from './mensajes'
import efectos from './runtime/efectos.js?raw'
import montaje from './runtime/montaje.js?raw'
import puente from './runtime/puente.js?raw'
import { transformarArchivos } from './transformar'

type Ventana = typeof window & Record<string, unknown>
const ventana = window as Ventana

const APP = `import { useEffect, useLayoutEffect, useState } from 'react'
function useConexion(sala) {
  useEffect(() => {
    return () => {}
  }, [sala])
}
function Chat({ sala }) {
  useConexion(sala)
  useEffect(() => {
    document.title = sala
  }, [sala])
  useLayoutEffect(() => {})
  return <p>Sala {sala}</p>
}
export default function App() {
  const [sala, setSala] = useState('general')
  const [ver, setVer] = useState(true)
  return (
    <main>
      <button onClick={() => setSala('viaje')}>Viaje</button>
      <button onClick={() => setVer(false)}>Ocultar</button>
      {ver && <Chat sala={sala} />}
    </main>
  )
}
`

let enviar: ReturnType<typeof vi.fn>

beforeAll(() => {
  // Orden del documento real: puente → react.js → configuración → efectos → montaje.
  new Function(puente)()
  new Function(readFileSync('public/vendor/react-en-vivo/19.3.1/react.js', 'utf8'))()
})

beforeEach(() => {
  document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
  enviar = vi.fn()
  ventana.__enviarReactEnVivo = enviar
  new Function(efectos)()
})

async function montar(codigo = APP, mostrarEfectos = true) {
  const archivos: ArchivoReact[] = [{ nombre: 'App.jsx', codigo }]
  const resultado = await transformarArchivos(archivos)
  if (!resultado.ok) throw new Error(resultado.mensaje)
  ventana.__configReactEnVivo = {
    modulos: resultado.modulos,
    archivosCss: resultado.archivosCss,
    strictMode: true,
    efectos: mostrarEfectos,
  }
  new Function(montaje)()
  await within(document.body).findByRole('button', { name: 'Viaje' }).catch(() => undefined)
}

async function montarConOpciones(codigo: string, efectosActivos: boolean, strictMode: boolean) {
  const resultado = await transformarArchivos([{ nombre: 'App.jsx', codigo }])
  if (!resultado.ok) throw new Error(resultado.mensaje)
  ventana.__configReactEnVivo = {
    modulos: resultado.modulos,
    archivosCss: resultado.archivosCss,
    strictMode,
    efectos: efectosActivos,
  }
  new Function(montaje)()
  await within(document.body).findByRole('button').catch(() => undefined)
}

const mensajes = () =>
  enviar.mock.calls
    .map(([mensaje]) => mensaje as { tipo: string })
    .filter((mensaje): mensaje is MensajeEfecto => mensaje.tipo === 'efecto')

const delGancho = () => mensajes().filter((mensaje) => mensaje.gancho === 'useConexion')
const deChat = () =>
  mensajes().filter(
    (mensaje) => mensaje.componente === 'Chat' && !mensaje.gancho && mensaje.clase === 'useEffect',
  )

describe('registro de efectos', () => {
  it('conserva avisos y ejecuciones de React con retornos y dependencias inválidos', async () => {
    const casos = [
      `import { useEffect } from 'react'; export default function App(){ useEffect(async () => { window.__ejecuciones += 1 }, []); return <button>ok</button> }`,
      `import { useEffect } from 'react'; const sala='x'; export default function App(){ useEffect(() => { window.__ejecuciones += 1 }, sala); return <button>ok</button> }`,
      `import { useEffect } from 'react'; const sala={}; export default function App(){ useEffect(() => { window.__ejecuciones += 1 }, sala); return <button>ok</button> }`,
    ]
    for (const codigo of casos) {
      const ejecutar = async (activos: boolean) => {
        document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
        ventana.__ejecuciones = 0
        enviar.mockClear()
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        await montarConOpciones(codigo, activos, false)
        await waitFor(() => expect(error).toHaveBeenCalled())
        await waitFor(() => expect(ventana.__ejecuciones).toBe(1))
        const avisos = error.mock.calls.map((argumentos) => String(argumentos[0]))
        error.mockRestore()
        return { avisos, ejecuciones: ventana.__ejecuciones }
      }
      expect(await ejecutar(true)).toEqual(await ejecutar(false))
    }
  })

  it('no registra ni devuelve una limpieza si el efecto no la creó', async () => {
    const codigo = `import { useEffect, useState } from 'react'
export default function App(){ const [ver,setVer]=useState(true); return <>{ver && <Hijo/>}<button onClick={()=>setVer(false)}>ocultar</button></> }
function Hijo(){ useEffect(() => {}, []); return <p>hijo</p> }`
    await montarConOpciones(codigo, true, false)
    await waitFor(() => expect(mensajes().some((mensaje) => mensaje.accion === 'efecto')).toBe(true))
    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button'))
    await Promise.resolve()
    expect(mensajes().filter((mensaje) => mensaje.accion === 'limpieza')).toEqual([])
  })

  it('numera igual los efectos de layout y pasivos en cada commit', async () => {
    const codigo = `import { useEffect, useLayoutEffect, useState } from 'react'
export default function App(){ const [n,setN]=useState(0); useLayoutEffect(()=>{},[n]); useEffect(()=>{},[n]); return <button onClick={()=>setN(n+1)}>{n}</button> }`
    const antes = (ventana.__numeroCommitReactEnVivo as () => number)()
    await montarConOpciones(codigo, true, false)
    await waitFor(() => expect(mensajes().filter((m) => m.accion === 'efecto')).toHaveLength(2))
    const commitMontaje = mensajes().find((m) => m.clase === 'useEffect')?.commit
    expect(commitMontaje).toBe(antes + 1)
    expect(mensajes().filter((m) => m.accion === 'efecto').map((m) => m.commit)).toEqual([
      commitMontaje,
      commitMontaje,
    ])
    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button'))
    await waitFor(() => expect(mensajes().filter((m) => m.accion === 'efecto')).toHaveLength(2))
    expect(mensajes().filter((m) => m.accion === 'efecto').map((m) => m.commit)).toEqual([
      Number(commitMontaje) + 1,
      Number(commitMontaje) + 1,
    ])
    expect(mensajes().some((m) => m.commit === 0)).toBe(false)
  })

  it('mantiene en el commit de montaje la repetición de useLayoutEffect por StrictMode', async () => {
    const codigo = `import { useLayoutEffect, useState } from 'react'
export default function App(){ const [sala]=useState('general'); useLayoutEffect(()=>{},[sala]); return <button>ok</button> }`
    const antes = (ventana.__numeroCommitReactEnVivo as () => number)()

    await montarConOpciones(codigo, true, true)

    await waitFor(() => expect(mensajes()).toHaveLength(2))
    expect(mensajes().map(({ accion, commit, motivo }) => ({ accion, commit, motivo }))).toEqual([
      { accion: 'efecto', commit: antes + 1, motivo: 'montaje' },
      { accion: 'efecto', commit: antes + 1, motivo: 'strict-mode' },
    ])
  })

  it('alinea la limpieza de useLayoutEffect de StrictMode y conserva los cambios posteriores', async () => {
    const codigo = `import { useLayoutEffect, useState } from 'react'
export default function App(){ const [sala,setSala]=useState('general'); useLayoutEffect(()=>()=>{},[sala]); return <button onClick={()=>setSala('viaje')}>{sala}</button> }`
    const antes = (ventana.__numeroCommitReactEnVivo as () => number)()

    await montarConOpciones(codigo, true, true)

    await waitFor(() => expect(mensajes()).toHaveLength(3))
    expect(mensajes().map(({ accion, commit, motivo }) => ({ accion, commit, motivo }))).toEqual([
      { accion: 'efecto', commit: antes + 1, motivo: 'montaje' },
      { accion: 'limpieza', commit: antes + 1, motivo: undefined },
      { accion: 'efecto', commit: antes + 1, motivo: 'strict-mode' },
    ])

    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button'))

    await waitFor(() => expect(mensajes()).toHaveLength(2))
    expect(mensajes().map(({ accion, commit, motivo, cambios }) => ({ accion, commit, motivo, cambios }))).toEqual([
      { accion: 'limpieza', commit: antes + 2, motivo: undefined, cambios: [] },
      {
        accion: 'efecto',
        commit: antes + 2,
        motivo: 'dependencias',
        cambios: [{ nombre: 'sala', antes: '"general"', ahora: '"viaje"' }],
      },
    ])
  })

  it('mantiene en el montaje un useLayoutEffect de StrictMode que actualiza estado', async () => {
    const codigo = `import { useLayoutEffect, useState } from 'react'
export default function App(){ const [alto,setAlto]=useState(0); useLayoutEffect(()=>{ setAlto(42) },[]); return <button>{alto}</button> }`
    const antes = (ventana.__numeroCommitReactEnVivo as () => number)()

    await montarConOpciones(codigo, true, true)

    await waitFor(() => expect(within(document.body).getByRole('button').textContent).toBe('42'))
    await waitFor(() => expect(mensajes()).toHaveLength(2))
    expect(mensajes().map(({ accion, commit, motivo }) => ({ accion, commit, motivo }))).toEqual([
      { accion: 'efecto', commit: antes + 1, motivo: 'montaje' },
      { accion: 'efecto', commit: antes + 1, motivo: 'strict-mode' },
    ])
  })

  it('un efecto sin dependencias distingue montaje, StrictMode y renders siguientes', async () => {
    const codigo = `import { useEffect, useState } from 'react'
export default function App(){ const [n,setN]=useState(0); useEffect(()=>{}); return <button onClick={()=>setN(n+1)}>{n}</button> }`
    await montarConOpciones(codigo, true, true)
    await waitFor(() => expect(mensajes().filter((m) => m.accion === 'efecto')).toHaveLength(2))
    expect(mensajes().filter((m) => m.accion === 'efecto').map((m) => m.motivo)).toEqual(['montaje','strict-mode'])
    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button'))
    await waitFor(() => expect(mensajes().some((m) => m.motivo === 'cada-render')).toBe(true))
  })

  it('lee dependencias multilínea con coma final', async () => {
    const codigo = `import { useEffect, useState } from 'react'
export default function App(){ const [a,setA]=useState(0); const b=1; useEffect(()=>{}, [
  a,
  b,
]); return <button onClick={()=>setA(1)}>cambiar</button> }`
    await montarConOpciones(codigo, true, false)
    await waitFor(() => expect(mensajes().some((m) => m.accion === 'efecto')).toBe(true))
    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button'))
    await waitFor(() => expect(mensajes().some((m) => m.motivo === 'dependencias')).toBe(true))
    expect(mensajes().find((m) => m.motivo === 'dependencias')?.cambios[0].nombre).toBe('a')
  })
  it('al montar con StrictMode: efecto, limpieza y efecto repetido', async () => {
    await montar()

    await waitFor(() => expect(delGancho()).toHaveLength(3))
    expect(delGancho().map(({ accion, motivo }) => ({ accion, motivo }))).toEqual([
      { accion: 'efecto', motivo: 'montaje' },
      { accion: 'limpieza', motivo: undefined },
      { accion: 'efecto', motivo: 'strict-mode' },
    ])
    expect(delGancho().every((mensaje) => mensaje.componente === 'Chat')).toBe(true)
    expect(delGancho().every((mensaje) => mensaje.linea === 3)).toBe(true)

    expect(deChat().map(({ accion, motivo }) => ({ accion, motivo }))).toEqual([
      { accion: 'efecto', motivo: 'montaje' },
      { accion: 'efecto', motivo: 'strict-mode' },
    ])
    expect(deChat().every((mensaje) => mensaje.linea === 9)).toBe(true)
    expect(new Set([...delGancho(), ...deChat()].map((mensaje) => mensaje.commit)).size).toBe(1)
  })

  it('respeta el orden real de efectos y limpiezas', async () => {
    const codigo = `import { useEffect, useState } from 'react'
function useConexion(sala) {
  useEffect(() => {
    return () => {}
  }, [sala])
}
function Chat({ sala }) {
  useConexion(sala)
  useEffect(() => {
    return () => {}
  }, [sala])
  return <p>Sala {sala}</p>
}
export default function App() {
  const [sala, setSala] = useState('general')
  const [ver, setVer] = useState(true)
  return (
    <main>
      <button onClick={() => setSala('viaje')}>Viaje</button>
      <button onClick={() => setVer(false)}>Ocultar</button>
      {ver && <Chat sala={sala} />}
    </main>
  )
}`
    const secuencia = () =>
      mensajes().map(({ accion, componente, gancho, motivo }) => ({
        accion,
        origen: gancho ?? componente,
        motivo,
      }))

    await montar(codigo)

    await waitFor(() => expect(mensajes()).toHaveLength(6))
    expect(secuencia()).toEqual([
      { accion: 'efecto', origen: 'useConexion', motivo: 'montaje' },
      { accion: 'efecto', origen: 'Chat', motivo: 'montaje' },
      { accion: 'limpieza', origen: 'useConexion', motivo: undefined },
      { accion: 'limpieza', origen: 'Chat', motivo: undefined },
      { accion: 'efecto', origen: 'useConexion', motivo: 'strict-mode' },
      { accion: 'efecto', origen: 'Chat', motivo: 'strict-mode' },
    ])

    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button', { name: 'Viaje' }))

    await waitFor(() => expect(mensajes()).toHaveLength(4))
    expect(secuencia()).toEqual([
      { accion: 'limpieza', origen: 'useConexion', motivo: undefined },
      { accion: 'limpieza', origen: 'Chat', motivo: undefined },
      { accion: 'efecto', origen: 'useConexion', motivo: 'dependencias' },
      { accion: 'efecto', origen: 'Chat', motivo: 'dependencias' },
    ])

    enviar.mockClear()
    fireEvent.click(within(document.body).getByRole('button', { name: 'Ocultar' }))

    await waitFor(() => expect(mensajes()).toHaveLength(2))
    expect(secuencia()).toEqual([
      { accion: 'limpieza', origen: 'useConexion', motivo: 'desmontaje' },
      { accion: 'limpieza', origen: 'Chat', motivo: 'desmontaje' },
    ])
  })

  it('al cambiar la sala: limpieza y efecto con la dependencia que cambió', async () => {
    await montar()
    await waitFor(() => expect(delGancho()).toHaveLength(3))
    enviar.mockClear()

    fireEvent.click(within(document.body).getByRole('button', { name: 'Viaje' }))

    await waitFor(() => expect(delGancho()).toHaveLength(2))
    expect(delGancho().map((mensaje) => mensaje.accion)).toEqual(['limpieza', 'efecto'])
    expect(delGancho().at(-1)).toEqual(
      expect.objectContaining({
        motivo: 'dependencias',
        cambios: [{ nombre: 'sala', antes: '"general"', ahora: '"viaje"' }],
      }),
    )
    expect(deChat().at(-1)).toEqual(
      expect.objectContaining({
        motivo: 'dependencias',
        cambios: [{ nombre: 'sala', antes: '"general"', ahora: '"viaje"' }],
      }),
    )
  })

  it('el efecto de layout sin dependencias se registra tras cada render', async () => {
    await montar()
    await waitFor(() => expect(mensajes().length).toBeGreaterThanOrEqual(7))
    enviar.mockClear()

    fireEvent.click(within(document.body).getByRole('button', { name: 'Viaje' }))

    await waitFor(() =>
      expect(
        mensajes().some(
          (mensaje) =>
            mensaje.clase === 'useLayoutEffect' &&
            mensaje.accion === 'efecto' &&
            mensaje.accion === 'efecto',
        ),
      ).toBe(true),
    )
  })

  it('al desmontar, las limpiezas llevan motivo desmontaje', async () => {
    await montar()
    await waitFor(() => expect(delGancho()).toHaveLength(3))
    enviar.mockClear()

    fireEvent.click(within(document.body).getByRole('button', { name: 'Ocultar' }))

    await waitFor(() => expect(delGancho()).toHaveLength(1))
    expect(delGancho()[0]).toEqual(expect.objectContaining({ accion: 'limpieza', motivo: 'desmontaje' }))
    expect(deChat()).toEqual([])
  })

  it('al desmontar desde un padre sin efectos alinea las limpiezas layout y pasiva', async () => {
    const codigo = `import { useEffect, useLayoutEffect, useState } from 'react'
function Hijo(){ useLayoutEffect(()=>()=>{},[]); useEffect(()=>()=>{},[]); return <p>hijo</p> }
export default function App(){ const [ver,setVer]=useState(true); return <>{ver && <Hijo/>}<button onClick={()=>setVer(false)}>ocultar</button></> }`

    await montarConOpciones(codigo, true, false)
    await waitFor(() => expect(mensajes().filter((mensaje) => mensaje.accion === 'efecto')).toHaveLength(2))
    const commitMontaje = mensajes().find((mensaje) => mensaje.accion === 'efecto')?.commit
    enviar.mockClear()

    fireEvent.click(within(document.body).getByRole('button'))

    await waitFor(() => expect(mensajes()).toHaveLength(2))
    expect(mensajes().map(({ accion, clase, commit, motivo }) => ({ accion, clase, commit, motivo }))).toEqual([
      {
        accion: 'limpieza',
        clase: 'useLayoutEffect',
        commit: Number(commitMontaje) + 1,
        motivo: 'desmontaje',
      },
      {
        accion: 'limpieza',
        clase: 'useEffect',
        commit: Number(commitMontaje) + 1,
        motivo: 'desmontaje',
      },
    ])
  })

  it('dependencias calculadas sin nombre legible dan «dependencia 1»', async () => {
    const codigo = `import { useEffect, useState } from 'react'
export default function App() {
  const [sala, setSala] = useState('general')
  useEffect(() => {}, [sala.length + 1])
  return <button onClick={() => setSala('viaje')}>Viaje</button>
}`
    await montar(codigo)
    await waitFor(() => expect(mensajes().length).toBeGreaterThanOrEqual(2))
    enviar.mockClear()

    fireEvent.click(within(document.body).getByRole('button', { name: 'Viaje' }))

    await waitFor(() => expect(mensajes().some((mensaje) => mensaje.motivo === 'dependencias')).toBe(true))
    expect(mensajes().find((mensaje) => mensaje.motivo === 'dependencias')?.cambios).toEqual([
      { nombre: 'dependencia 1', antes: '8', ahora: '6' },
    ])
  })

  it('sin mostrarEfectos, react no está envuelto', async () => {
    const codigo = `import React, { useEffect } from 'react'
window.__useEffectDelAlumno = useEffect
export default function App() {
  return <button>Viaje</button>
}`

    await montar(codigo, false)

    const reactReal = (ventana.__reactEnVivo as { React: { useEffect: unknown } }).React
    expect(ventana.__useEffectDelAlumno).toBe(reactReal.useEffect)
    expect(mensajes()).toEqual([])
  })

  it('un fallo dentro del registro no rompe el efecto', async () => {
    enviar.mockImplementation((mensaje: { tipo: string }) => {
      if (mensaje.tipo === 'efecto') throw new Error('registro roto')
    })
    const codigo = `import { useEffect } from 'react'
export default function App() {
  useEffect(() => {
    document.body.dataset.efectoEjecutado = 'sí'
  }, [])
  return <button>Viaje</button>
}`

    await montar(codigo)

    await waitFor(() => expect(document.body.dataset.efectoEjecutado).toBe('sí'))
  })
})
