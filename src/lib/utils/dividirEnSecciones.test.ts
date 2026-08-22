import { dividirEnSecciones } from './dividirEnSecciones'

describe('dividirEnSecciones', () => {
  it('divide el markdown en secciones por encabezado de nivel 2', () => {
    const markdown = [
      '## Qué es y para qué sirve',
      '',
      'Texto de la primera sección.',
      '',
      '## Cómo se usa',
      '',
      'Texto de la segunda sección.',
    ].join('\n')

    expect(dividirEnSecciones(markdown)).toEqual([
      {
        id: 'que-es-y-para-que-sirve',
        titulo: 'Qué es y para qué sirve',
        cuerpo: 'Texto de la primera sección.',
      },
      {
        id: 'como-se-usa',
        titulo: 'Cómo se usa',
        cuerpo: 'Texto de la segunda sección.',
      },
    ])
  })

  it('conserva encabezados de nivel 3 dentro del cuerpo de su sección', () => {
    const markdown = ['## Sección', '', '### Subsección', '', 'Texto.'].join('\n')

    expect(dividirEnSecciones(markdown)).toEqual([
      { id: 'seccion', titulo: 'Sección', cuerpo: '### Subsección\n\nTexto.' },
    ])
  })

  it('ignora líneas que empiezan por ## dentro de un bloque de código', () => {
    const markdown = [
      '## Sección real',
      '',
      '```bash',
      '## esto es un comentario de shell, no un encabezado',
      '```',
      '',
      'Después del bloque.',
    ].join('\n')

    expect(dividirEnSecciones(markdown)).toEqual([
      {
        id: 'seccion-real',
        titulo: 'Sección real',
        cuerpo: '```bash\n## esto es un comentario de shell, no un encabezado\n```\n\nDespués del bloque.',
      },
    ])
  })

  it('descarta cualquier contenido anterior al primer encabezado', () => {
    const markdown = ['Texto previo sin encabezado.', '', '## Sección', '', 'Cuerpo.'].join('\n')

    expect(dividirEnSecciones(markdown)).toEqual([
      { id: 'seccion', titulo: 'Sección', cuerpo: 'Cuerpo.' },
    ])
  })

  it('devuelve una lista vacía cuando no hay encabezados de nivel 2', () => {
    expect(dividirEnSecciones('Solo texto plano, sin secciones.')).toEqual([])
  })
})
