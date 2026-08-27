import { fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

import { SafeMarkdown } from '@/components/content/SafeMarkdown'

function bloqueLaboratorio(datos: unknown) {
  return `\`\`\`laboratorio\n${JSON.stringify(datos)}\n\`\`\``
}

describe('SafeMarkdown con laboratorios', () => {
  it('renderiza predice-el-resultado y revela la vista real', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'predice-el-resultado',
          codigo: '<p>Hola      mundo</p>',
          opciones: ['6 espacios', '1 espacio', '0 espacios'],
          correcta: 1,
          explicacion: 'HTML colapsa los espacios en blanco.',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Código HTML para predecir' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: '1 espacio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Revelar resultado' }))

    expect(screen.getByText('Respuesta correcta')).toBeInTheDocument()
    const vista = screen.getByTitle('Resultado real del código HTML')
    expect(vista).toHaveAttribute('sandbox', '')
    expect(vista).toHaveAttribute('srcdoc', '<p>Hola      mundo</p>')
  })

  it('renderiza codigo-anotado y cambia la línea activa', () => {
    const { container } = render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'codigo-anotado',
          codigo: '<main>\n  <h1>Título</h1>\n  <p>Texto</p>\n</main>',
          anotaciones: [
            { fragmento: '<h1>', nota: 'Este es el título principal.' },
            { fragmento: '<p>', nota: 'Este es el párrafo.' },
            { fragmento: '<footer>', nota: 'Este fragmento no existe.' },
          ],
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('Este es el título principal.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /fragmento no existe/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Ver anotación 2/i }))
    expect(screen.getByText('Este es el párrafo.')).toBeInTheDocument()
    expect(container.querySelector('.sintaxis-linea-destacada')).toHaveTextContent('<p>Texto</p>')
  })

  it('renderiza comparador-antes-despues y permite cambiar de versión', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'comparador-antes-despues',
          antes: '<div>Antes</div>',
          despues: '<main>Después</main>',
          nota: 'Compara ambas estructuras.',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Código HTML de la versión Antes' })).toHaveTextContent(
      '<div>Antes</div>',
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Después' }))
    expect(
      screen.getByRole('region', { name: 'Código HTML de la versión Después' }),
    ).toHaveTextContent('<main>Después</main>')
    expect(screen.getByTitle('Vista previa de la versión Después')).toHaveAttribute('sandbox', '')
  })

  it('renderiza notas-clave con todos sus items', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'notas-clave',
          items: [
            { titulo: 'Primer punto.', texto: 'Explicación del primer punto.' },
            { titulo: 'Segundo punto.', texto: 'Explicación del segundo punto.' },
          ],
        })}
      </SafeMarkdown>,
    )

    const region = screen.getByRole('region', { name: 'Puntos clave' })
    expect(region).toHaveTextContent('Primer punto.')
    expect(region).toHaveTextContent('Segundo punto.')
  })

  it('renderiza diagrama-etiqueta con sus partes y etiquetas de rol', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'diagrama-etiqueta',
          partes: [
            { texto: '<', rol: 'simbolo' },
            { texto: 'p', rol: 'apertura' },
            { texto: ' ', rol: 'simbolo' },
            { texto: 'class', rol: 'atributo-nombre' },
            { texto: '=', rol: 'simbolo' },
            { texto: '"intro"', rol: 'atributo-valor' },
            { texto: '>', rol: 'simbolo' },
            { texto: 'Hola', rol: 'contenido' },
            { texto: '</p>', rol: 'cierre' },
          ],
        })}
      </SafeMarkdown>,
    )

    const region = screen.getByRole('region', { name: 'Diagrama de etiqueta' })
    expect(region).toHaveTextContent('Etiqueta de apertura')
    expect(region).toHaveTextContent('Nombre del atributo')
    expect(region).toHaveTextContent('Valor del atributo')
    expect(region).toHaveTextContent('Contenido')
    expect(region).toHaveTextContent('Etiqueta de cierre')
    expect(screen.getByText('<')).toBeInTheDocument()
    expect(screen.getByText('p')).toBeInTheDocument()
    expect(screen.getByText('class')).toBeInTheDocument()
    expect(screen.getByText('=')).toBeInTheDocument()
    expect(screen.getByText('"intro"')).toBeInTheDocument()
    expect(screen.getByText('>')).toBeInTheDocument()
    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('</p>')).toBeInTheDocument()
  })

  it('renderiza callout con su variante y contenido', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'callout',
          variante: 'aviso',
          titulo: 'Orden importante',
          contenido: 'Coloca meta charset antes de cualquier texto con tildes.',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('Orden importante')).toBeInTheDocument()
    expect(
      screen.getByText('Coloca meta charset antes de cualquier texto con tildes.'),
    ).toBeInTheDocument()
  })

  it('renderiza linea-de-tiempo con todos sus hitos', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'linea-de-tiempo',
          titulo: 'Cómo llegó HTML hasta aquí',
          items: [
            {
              fecha: '1991',
              titulo: 'Tim Berners-Lee publica HTML',
              texto: 'Nace para conectar documentos entre sí.',
            },
            {
              fecha: 'Hoy',
              titulo: 'Living standard del WHATWG',
              texto:
                'Especificación viva, con los navegadores implicados en su evolución.',
            },
          ],
        })}
      </SafeMarkdown>,
    )

    const region = screen.getByRole('region', { name: 'Línea de tiempo' })
    expect(region).toHaveTextContent('1991')
    expect(region).toHaveTextContent('Tim Berners-Lee publica HTML')
    expect(region).toHaveTextContent('Nace para conectar documentos entre sí.')
    expect(region).toHaveTextContent('Hoy')
    expect(region).toHaveTextContent('Living standard del WHATWG')
    expect(region).toHaveTextContent(
      'Especificación viva, con los navegadores implicados en su evolución.',
    )
  })

  it('renderiza roles con sus tarjetas', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'roles',
          titulo: 'Quién hace qué en una página web',
          roles: [
            {
              etiqueta: 'HTML',
              rol: 'Estructura',
              descripcion: '"Esto es un botón".',
            },
            {
              etiqueta: 'CSS',
              rol: 'Presentación',
              descripcion: 'Decide de qué color y tamaño se ve.',
            },
            {
              etiqueta: 'JavaScript',
              rol: 'Comportamiento',
              descripcion: 'Decide qué pasa cuando alguien hace clic.',
            },
          ],
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('HTML')).toBeInTheDocument()
    expect(screen.getByText('CSS')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Estructura')).toBeInTheDocument()
    expect(screen.getByText('Presentación')).toBeInTheDocument()
    expect(screen.getByText('Comportamiento')).toBeInTheDocument()
    expect(screen.getByText('"Esto es un botón".')).toBeInTheDocument()
    expect(screen.getByText('Decide de qué color y tamaño se ve.')).toBeInTheDocument()
    expect(screen.getByText('Decide qué pasa cuando alguien hace clic.')).toBeInTheDocument()
  })

  it('renderiza mapa-de-regiones con sus landmarks', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'mapa-de-regiones',
          regiones: [
            {
              etiqueta: 'Navegación',
              elemento: 'nav',
              landmark: 'navigation',
              contenido: 'Inicio · Precios',
            },
            {
              etiqueta: 'Contenido principal',
              elemento: 'main',
              landmark: 'main',
              contenido: 'Suscríbete al boletín',
            },
            {
              etiqueta: 'Pie',
              elemento: 'footer',
              landmark: 'contentinfo',
              contenido: '© 2026',
            },
          ],
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('Navegación')).toBeInTheDocument()
    expect(screen.getByText('Contenido principal')).toBeInTheDocument()
    expect(screen.getByText('Pie')).toBeInTheDocument()
    expect(screen.getByText(/^<nav>$/)).toBeInTheDocument()
    expect(screen.getByText(/^<main>$/)).toBeInTheDocument()
    expect(screen.getByText(/^<footer>$/)).toBeInTheDocument()
    expect(screen.getByText(/^role: navigation$/)).toBeInTheDocument()
    expect(screen.getByText(/^role: main$/)).toBeInTheDocument()
    expect(screen.getByText(/^role: contentinfo$/)).toBeInTheDocument()
  })

  it('renderiza esquema-de-pagina con main y aside lado a lado', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'esquema-de-pagina',
          header: 'Logo y nombre del sitio',
          nav: 'Inicio · Blog · Contacto',
          main: 'Contenido único de la página',
          aside: 'Enlaces relacionados',
          footer: '© 2026',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('Logo y nombre del sitio')).toBeInTheDocument()
    expect(screen.getByText('Inicio · Blog · Contacto')).toBeInTheDocument()
    expect(screen.getByText('Contenido único de la página')).toBeInTheDocument()
    expect(screen.getByText('Enlaces relacionados')).toBeInTheDocument()
    expect(screen.getByText('© 2026')).toBeInTheDocument()
  })

  it('esquema-de-pagina funciona sin nav ni aside', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'esquema-de-pagina',
          header: 'Cabecera mínima',
          main: 'Contenido principal',
          footer: 'Pie mínimo',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('Cabecera mínima')).toBeInTheDocument()
    expect(screen.getByText('Contenido principal')).toBeInTheDocument()
    expect(screen.getByText('Pie mínimo')).toBeInTheDocument()
  })

  it('renderiza capas-de-caja con las cuatro capas anidadas del modelo de caja', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'capas-de-caja',
          margin: '16px',
          border: '2px solid',
          padding: '12px',
          content: '320 × 180',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('16px')).toBeInTheDocument()
    expect(screen.getByText('2px solid')).toBeInTheDocument()
    expect(screen.getByText('12px')).toBeInTheDocument()
    expect(screen.getByText('320 × 180')).toBeInTheDocument()
  })

  it('renderiza recursos como tarjetas de enlace y filtra URLs inseguras', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'recursos',
          recursos: [
            {
              titulo: 'Sintaxis de HTML',
              descripcion: 'Reglas del estándar para escribir elementos y atributos.',
              url: 'https://html.spec.whatwg.org/multipage/syntax.html',
              etiqueta: 'Estándar WHATWG',
            },
            {
              titulo: 'Enlace peligroso',
              descripcion: 'No debería renderizarse.',
              url: 'javascript:alert(1)',
            },
          ],
        })}
      </SafeMarkdown>,
    )

    const region = screen.getByRole('region', { name: 'Recursos para profundizar' })
    const enlace = screen.getByRole('link', { name: /Sintaxis de HTML/ })
    expect(enlace).toHaveAttribute('href', 'https://html.spec.whatwg.org/multipage/syntax.html')
    expect(enlace).toHaveAttribute('target', '_blank')
    expect(enlace).toHaveAttribute('rel', 'noreferrer')
    expect(region).toHaveTextContent('Estándar WHATWG')
    expect(screen.queryByText('Enlace peligroso')).not.toBeInTheDocument()
  })

  it('renderiza vista-previa-social con dominio, título y descripción', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'vista-previa-social',
          dominio: 'tech-study-tracker.vercel.app',
          ogTitulo: 'Anatomía de una etiqueta — Tech Study Tracker',
          ogDescripcion:
            'Qué es un elemento, qué son los atributos, y por qué unas pocas etiquetas se cierran solas.',
          imagenEtiqueta: 'og:image · 1200×630',
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('tech-study-tracker.vercel.app')).toBeInTheDocument()
    expect(
      screen.getByText('Anatomía de una etiqueta — Tech Study Tracker'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Qué es un elemento, qué son los atributos, y por qué unas pocas etiquetas se cierran solas.',
      ),
    ).toBeInTheDocument()
  })

  it('renderiza mitos con tarjetas volteables', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({
          tipo: 'mitos',
          mitos: [
            {
              mito: 'HTML no es CSS',
              realidad: 'HTML dice qué es cada cosa; CSS decide cómo se ve.',
            },
            {
              mito: 'Un doctype es solo decorativo',
              realidad:
                'Sin él el navegador activa el modo quirks, con resultados inconsistentes.',
            },
          ],
        })}
      </SafeMarkdown>,
    )

    expect(screen.getByText('HTML no es CSS')).toBeInTheDocument()
    expect(screen.getByText('Un doctype es solo decorativo')).toBeInTheDocument()
    expect(
      screen.getByText('HTML dice qué es cada cosa; CSS decide cómo se ve.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Sin él el navegador activa el modo quirks, con resultados inconsistentes.',
      ),
    ).toBeInTheDocument()

    const primeraTarjeta = screen.getByRole('button', {
      name: 'Girar tarjeta: HTML no es CSS',
    })
    const segundaTarjeta = screen.getByRole('button', {
      name: 'Girar tarjeta: Un doctype es solo decorativo',
    })

    expect(primeraTarjeta).toHaveAttribute('aria-pressed', 'false')
    expect(segundaTarjeta).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(primeraTarjeta)
    expect(primeraTarjeta).toHaveAttribute('aria-pressed', 'true')
    expect(segundaTarjeta).toHaveAttribute('aria-pressed', 'false')
  })

  it('usa código plano cuando el JSON es inválido', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {'```laboratorio\n{"tipo":"predice-el-resultado"\n```'}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código laboratorio' })).toHaveTextContent(
      '{"tipo":"predice-el-resultado"',
    )
    expect(screen.queryByRole('button', { name: 'Revelar resultado' })).not.toBeInTheDocument()
  })

  it('usa código plano cuando el tipo no pertenece al registro', () => {
    render(
      <SafeMarkdown permitirLaboratorios>
        {bloqueLaboratorio({ tipo: 'laboratorio-inventado', codigo: '<p>Hola</p>' })}
      </SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código laboratorio' })).toHaveTextContent(
      'laboratorio-inventado',
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('usa CodigoResaltado para bloques normales y conserva el código inline', () => {
    const { container } = render(
      <SafeMarkdown>{'Usa `main` aquí.\n\n```html\n<main>Contenido</main>\n```'}</SafeMarkdown>,
    )

    expect(screen.getByRole('region', { name: 'Bloque de código html' })).toHaveTextContent(
      '<main>Contenido</main>',
    )
    expect(container.querySelector('p code')).toHaveTextContent('main')
  })

  it('no tiene violaciones de accesibilidad con los catorce tipos', async () => {
    const markdown = [
      bloqueLaboratorio({
        tipo: 'predice-el-resultado',
        codigo: '<p>Hola</p>',
        opciones: ['Hola', 'Adiós'],
        correcta: 0,
        explicacion: 'El párrafo muestra Hola.',
      }),
      bloqueLaboratorio({
        tipo: 'codigo-anotado',
        codigo: '<p>Hola</p>',
        anotaciones: [{ fragmento: '<p>', nota: 'Un párrafo.' }],
      }),
      bloqueLaboratorio({
        tipo: 'comparador-antes-despues',
        antes: '<div>Hola</div>',
        despues: '<p>Hola</p>',
      }),
      bloqueLaboratorio({
        tipo: 'notas-clave',
        items: [
          { titulo: 'Primer punto.', texto: 'Explicación.' },
          { titulo: 'Segundo punto.', texto: 'Explicación.' },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'diagrama-etiqueta',
        partes: [
          { texto: '<', rol: 'simbolo' },
          { texto: 'p', rol: 'apertura' },
          { texto: ' ', rol: 'simbolo' },
          { texto: 'class', rol: 'atributo-nombre' },
          { texto: '=', rol: 'simbolo' },
          { texto: '"intro"', rol: 'atributo-valor' },
          { texto: '>', rol: 'simbolo' },
          { texto: 'Hola', rol: 'contenido' },
          { texto: '</p>', rol: 'cierre' },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'callout',
        variante: 'info',
        titulo: 'Dato',
        contenido: 'El navegador construye un árbol a partir del HTML.',
      }),
      bloqueLaboratorio({
        tipo: 'linea-de-tiempo',
        titulo: 'Cómo llegó HTML hasta aquí',
        items: [
          {
            fecha: '1991',
            titulo: 'Tim Berners-Lee publica HTML',
            texto: 'Nace para conectar documentos entre sí.',
          },
          {
            fecha: 'Hoy',
            titulo: 'Living standard del WHATWG',
            texto: 'Especificación viva, con los navegadores implicados en su evolución.',
          },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'roles',
        titulo: 'Quién hace qué en una página web',
        roles: [
          {
            etiqueta: 'HTML',
            rol: 'Estructura',
            descripcion: '"Esto es un botón".',
          },
          {
            etiqueta: 'CSS',
            rol: 'Presentación',
            descripcion: 'Decide de qué color y tamaño se ve.',
          },
          {
            etiqueta: 'JavaScript',
            rol: 'Comportamiento',
            descripcion: 'Decide qué pasa cuando alguien hace clic.',
          },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'mapa-de-regiones',
        regiones: [
          {
            etiqueta: 'Navegación',
            elemento: 'nav',
            landmark: 'navigation',
            contenido: 'Inicio · Precios',
          },
          {
            etiqueta: 'Contenido principal',
            elemento: 'main',
            landmark: 'main',
            contenido: 'Suscríbete al boletín',
          },
          {
            etiqueta: 'Pie',
            elemento: 'footer',
            landmark: 'contentinfo',
            contenido: '© 2026',
          },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'esquema-de-pagina',
        header: 'Logo y nombre del sitio',
        nav: 'Inicio · Blog · Contacto',
        main: 'Contenido único de la página',
        aside: 'Enlaces relacionados',
        footer: '© 2026',
      }),
      bloqueLaboratorio({
        tipo: 'recursos',
        recursos: [
          {
            titulo: 'Sintaxis de HTML',
            descripcion: 'Reglas del estándar para escribir elementos y atributos.',
            url: 'https://html.spec.whatwg.org/multipage/syntax.html',
            etiqueta: 'Estándar WHATWG',
          },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'mitos',
        mitos: [
          {
            mito: 'HTML no es CSS',
            realidad: 'HTML dice qué es cada cosa; CSS decide cómo se ve.',
          },
          {
            mito: 'Un doctype es solo decorativo',
            realidad:
              'Sin él el navegador activa el modo quirks, con resultados inconsistentes.',
          },
        ],
      }),
      bloqueLaboratorio({
        tipo: 'vista-previa-social',
        dominio: 'tech-study-tracker.vercel.app',
        ogTitulo: 'Anatomía de una etiqueta — Tech Study Tracker',
        ogDescripcion:
          'Qué es un elemento, qué son los atributos, y por qué unas pocas etiquetas se cierran solas.',
        imagenEtiqueta: 'og:image · 1200×630',
      }),
      bloqueLaboratorio({
        tipo: 'capas-de-caja',
        margin: '16px',
        border: '2px solid',
        padding: '12px',
        content: '320 × 180',
      }),
    ].join('\n\n')
    const { container } = render(
      <SafeMarkdown permitirLaboratorios>{markdown}</SafeMarkdown>,
    )

    const resultados = await axe(container, {
      iframes: false,
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })
})
