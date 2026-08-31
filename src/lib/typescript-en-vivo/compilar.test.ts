import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { compilarEnEntorno, crearEntornoTypeScript } from './compilar'

async function cargarLibDesdeDisco(nombre: string): Promise<string> {
  return readFile(join(process.cwd(), 'public', 'ts-libs', nombre), 'utf8')
}

describe('compilarEnEntorno', () => {
  it('detecta un error real de tipos y no emite JS', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const resultado = compilarEnEntorno(entorno, 'const x: number = "hola";')

    expect(resultado.js).toBe('')
    expect(resultado.diagnosticos).toHaveLength(1)
    expect(resultado.diagnosticos[0].severidad).toBe('error')
    expect(resultado.diagnosticos[0].mensaje).toContain('not assignable')
  })

  it('emite JS cuando el código es válido', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const resultado = compilarEnEntorno(entorno, 'const x: number = 5;')

    expect(resultado.diagnosticos).toEqual([])
    expect(resultado.js).toContain('5')
  })

  it('reconoce los tipos del DOM (confirma que lib.dom.d.ts se cargó bien)', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const resultado = compilarEnEntorno(
      entorno,
      'const el: HTMLElement | null = document.querySelector("div");',
    )

    expect(resultado.diagnosticos).toEqual([])
  })

  it('detecta un switch no exhaustivo sobre una unión discriminada', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const codigo = `
type Estado = { tipo: 'a' } | { tipo: 'b' };
function f(e: Estado): number {
  switch (e.tipo) {
    case 'a': return 1;
    default:
      const _exhaustivo: never = e;
      return _exhaustivo;
  }
}
`
    const resultado = compilarEnEntorno(entorno, codigo)

    expect(resultado.diagnosticos.some((d) => d.severidad === 'error')).toBe(true)
  })

  it('no revienta con código vacío, ni al pasar de vacío a válido y de vuelta', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)

    expect(compilarEnEntorno(entorno, '')).toEqual({ js: '', diagnosticos: [] })
    expect(compilarEnEntorno(entorno, 'const x = 1;').diagnosticos).toEqual([])
    expect(compilarEnEntorno(entorno, '   ')).toEqual({ js: '', diagnosticos: [] })
  })
})
