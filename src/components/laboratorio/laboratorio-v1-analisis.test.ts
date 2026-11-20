import { describe, expect, it } from 'vitest'

import { analizarHtmlV1 } from './laboratorio-v1-analisis'

function reglas(html: string) {
  return analizarHtmlV1(html).diagnosticos.map((diagnostico) => diagnostico.regla)
}

describe('analizarHtmlV1: tabindex', () => {
  it('avisa de un tabindex mayor que cero', () => {
    expect(reglas('<div tabindex="2">x</div>')).toContain('a11y/tabindex-positivo')
  })

  it.each(['0', '-1', 'abc', ''])('no avisa con tabindex="%s"', (valor) => {
    expect(reglas(`<div tabindex="${valor}">x</div>`)).not.toContain('a11y/tabindex-positivo')
  })
})
