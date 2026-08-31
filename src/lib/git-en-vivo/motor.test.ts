import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  crearMotorGit,
  dividirComando,
  ejecutarComandosGit,
  obtenerGrafo,
} from './motor'

async function cargarWasmDesdeDisco(): Promise<WebAssembly.Module> {
  const buffer = await readFile(
    join(process.cwd(), 'node_modules', 'wasm-git', 'lg2_async.wasm'),
  )
  return WebAssembly.compile(
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
  )
}

describe('dividirComando', () => {
  it('divide un comando simple por espacios', () => {
    expect(dividirComando('log --oneline')).toEqual(['log', '--oneline'])
  })

  it('respeta un argumento entre comillas dobles', () => {
    expect(dividirComando('commit -m "mensaje con espacios"')).toEqual([
      'commit',
      '-m',
      'mensaje con espacios',
    ])
  })

  it('respeta un argumento entre comillas simples', () => {
    expect(dividirComando("commit -m 'mensaje con espacios'")).toEqual([
      'commit',
      '-m',
      'mensaje con espacios',
    ])
  })

  it('un solo argumento sin espacios', () => {
    expect(dividirComando('status')).toEqual(['status'])
  })
})

describe('ejecutarComandosGit', () => {
  it('ejecuta init + commit y devuelve la salida real de log', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(
      motor,
      [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
        'add a.txt',
        "commit -m 'primer commit'",
      ],
      'log --oneline',
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.salida).toContain('primer commit')
  })

  it('checkout -b crea una rama real (sustituto de branch, que no existe en wasm-git)', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(
      motor,
      [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'v1\n' } },
        'add a.txt',
        'commit -m v1',
        'checkout -b feature',
      ],
      'rev-parse HEAD',
    )
    expect(resultado.ok).toBe(true)
  })

  it('un merge con conflicto real deja el repositorio en estado de conflicto', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const setupComun = [
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'linea original\n' } },
      'add a.txt',
      'commit -m base',
      'checkout -b feature',
      { escribir: { ruta: 'a.txt', contenido: 'cambiado en FEATURE\n' } },
      'add a.txt',
      'commit -m feature-cambia-a',
      'checkout master',
      { escribir: { ruta: 'a.txt', contenido: 'cambiado en MASTER\n' } },
      'add a.txt',
      'commit -m master-cambia-a',
      'merge feature',
    ]
    const resultado = await ejecutarComandosGit(motor, setupComun, 'status')

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.salida).toContain('conflict: a:a.txt o:a.txt t:a.txt')
    }
  })

  it('un comando que falla de verdad propaga el mensaje real de error', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(
      motor,
      ['init .'],
      'checkout rama-inexistente',
    )
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.mensaje).toContain('rama-inexistente')
  })

  it('dos ejecuciones están aisladas: un commit de una no aparece en la otra', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    await ejecutarComandosGit(
      motor,
      [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'x\n' } },
        'add a.txt',
        "commit -m 'solo en la primera ejecucion'",
      ],
      'log --oneline',
    )
    const segunda = await ejecutarComandosGit(motor, ['init .'], 'log --oneline')
    expect(segunda.ok).toBe(false)
  })
})

describe('obtenerGrafo', () => {
  it('un historial lineal de 2 commits tiene el segundo con el primero como único padre', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const grafo = await obtenerGrafo(motor, [
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'v1\n' } },
      'add a.txt',
      'commit -m v1',
      { escribir: { ruta: 'a.txt', contenido: 'v2\n' } },
      'add a.txt',
      'commit -m v2',
    ])

    expect(grafo.commits).toHaveLength(2)
    const v1 = grafo.commits.find((commit) => commit.mensaje === 'v1')
    const v2 = grafo.commits.find((commit) => commit.mensaje === 'v2')
    expect(v1?.padres).toEqual([])
    expect(v2?.padres).toEqual([v1?.hash])
    expect(grafo.ramas).toEqual([{ nombre: 'master', hash: v2?.hash }])
    expect(grafo.ramaActual).toBe('master')
  })

  it('una rama divergente: dos ramas distintas apuntan a commits distintos con base común', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const grafo = await obtenerGrafo(motor, [
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'base\n' } },
      'add a.txt',
      'commit -m base',
      'checkout -b feature',
      { escribir: { ruta: 'b.txt', contenido: 'x\n' } },
      'add b.txt',
      'commit -m feature-commit',
      'checkout master',
      { escribir: { ruta: 'c.txt', contenido: 'y\n' } },
      'add c.txt',
      'commit -m master-commit',
    ])

    expect(grafo.commits).toHaveLength(3)
    expect(grafo.ramas.map((rama) => rama.nombre).sort()).toEqual([
      'feature',
      'master',
    ])
    expect(grafo.ramaActual).toBe('master')

    const base = grafo.commits.find((commit) => commit.mensaje === 'base')
    const feature = grafo.commits.find(
      (commit) => commit.mensaje === 'feature-commit',
    )
    const master = grafo.commits.find(
      (commit) => commit.mensaje === 'master-commit',
    )
    expect(feature?.padres).toEqual([base?.hash])
    expect(master?.padres).toEqual([base?.hash])

    const ramaFeature = grafo.ramas.find((rama) => rama.nombre === 'feature')
    const ramaMaster = grafo.ramas.find((rama) => rama.nombre === 'master')
    expect(ramaFeature?.hash).toBe(feature?.hash)
    expect(ramaMaster?.hash).toBe(master?.hash)
  })
})
