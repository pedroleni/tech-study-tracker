import { describe, expect, it } from 'vitest'

import { esquemaEditorEnVivo } from './schemas'

describe('esquemaEditorEnVivo', () => {
  it('acepta un bloque que solo trae contenido en ts', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x: number = 1;',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('const x: number = 1;')
      expect(resultado.data.html).toBe('')
      expect(resultado.data.pestañaInicial).toBe('html')
    }
  })

  it('acepta pestañaInicial: "ts"', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x = 1;',
      pestañaInicial: 'ts',
    })

    expect(resultado.success).toBe(true)
  })

  it('sigue rechazando un bloque sin contenido en ningún campo', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
    })

    expect(resultado.success).toBe(false)
  })

  it('sigue validando bloques ya publicados sin el campo ts (retrocompatible)', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      html: '<p>Hola</p>',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('')
    }
  })
})
