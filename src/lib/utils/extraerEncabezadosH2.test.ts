import { extraerEncabezadosH2 } from './extraerEncabezadosH2'

describe('extraerEncabezadosH2', () => {
  it('extrae los encabezados de nivel 2 con su id', () => {
    const markdown = [
      '# Título de la lección',
      '',
      '## Qué es y para qué sirve',
      '',
      'Texto de la sección.',
      '',
      '## Cómo se usa',
      '',
      'Más texto.',
    ].join('\n')

    expect(extraerEncabezadosH2(markdown)).toEqual([
      { id: 'que-es-y-para-que-sirve', titulo: 'Qué es y para qué sirve' },
      { id: 'como-se-usa', titulo: 'Cómo se usa' },
    ])
  })

  it('ignora encabezados de nivel 1 y 3', () => {
    const markdown = '# Uno\n\n### Tres\n\n## Dos'
    expect(extraerEncabezadosH2(markdown)).toEqual([{ id: 'dos', titulo: 'Dos' }])
  })

  it('ignora líneas que empiezan por ## dentro de un bloque de código', () => {
    const markdown = [
      '## Sección real',
      '',
      '```bash',
      '## esto es un comentario de shell, no un encabezado',
      '```',
      '',
      '## Otra sección real',
    ].join('\n')

    expect(extraerEncabezadosH2(markdown)).toEqual([
      { id: 'seccion-real', titulo: 'Sección real' },
      { id: 'otra-seccion-real', titulo: 'Otra sección real' },
    ])
  })

  it('devuelve una lista vacía cuando no hay encabezados', () => {
    expect(extraerEncabezadosH2('Solo texto plano, sin secciones.')).toEqual([])
  })
})
