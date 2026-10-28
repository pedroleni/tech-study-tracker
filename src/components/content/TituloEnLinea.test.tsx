import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'

import { TituloEnLinea } from '@/components/content/TituloEnLinea'
import { dividirEnSecciones } from '@/lib/utils/dividirEnSecciones'
import { textoPlanoDeTitulo } from '@/lib/utils/tituloEnLinea'

const contenido = import.meta.glob('/contenido/*/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('TituloEnLinea', () => {
  it('conserva literal el caso real con asteriscos sin pareja', () => {
    const texto = 'El formato exacto: /** con dos asteriscos'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container).toHaveTextContent(texto)
    expect(container.querySelector('strong, em, code')).toBeNull()
    expect(textoPlanoDeTitulo(texto)).toBe(texto)
  })

  it('renderiza el asterisco dentro de código sin interpretarlo', () => {
    const texto = '`*` frente a columnas explícitas'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container.querySelector('code')).toHaveTextContent('*')
    expect(container).not.toHaveTextContent('`')
    expect(textoPlanoDeTitulo(texto)).toBe('* frente a columnas explícitas')
  })

  it('conserva los asteriscos dentro del código', () => {
    const texto = 'Tu propia animación: clases y `::view-transition-*`'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container.querySelector('code')).toHaveTextContent('::view-transition-*')
    expect(container.querySelector('em')).toBeNull()
    expect(textoPlanoDeTitulo(texto)).toBe(
      'Tu propia animación: clases y ::view-transition-*',
    )
  })

  it('renderiza cursiva con asteriscos', () => {
    const texto = 'Mensajes *flash*: un aviso que sale una vez'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container.querySelector('em')).toHaveTextContent('flash')
    expect(textoPlanoDeTitulo(texto)).toBe('Mensajes flash: un aviso que sale una vez')
  })

  it('combina cursiva y código en el mismo título', () => {
    const texto = 'CSP con *nonce*: por petición, en `entry.server.tsx`'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container.querySelector('em')).toHaveTextContent('nonce')
    expect(container.querySelector('code')).toHaveTextContent('entry.server.tsx')
    expect(textoPlanoDeTitulo(texto)).toBe(
      'CSP con nonce: por petición, en entry.server.tsx',
    )
  })

  it('admite negrita y escapes', () => {
    const texto = String.raw`**Importante**, \*literal\* y \`literal\``
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container.querySelector('strong')).toHaveTextContent('Importante')
    expect(container.querySelector('code')).toBeNull()
    expect(container).toHaveTextContent('Importante, *literal* y `literal`')
    expect(textoPlanoDeTitulo(texto)).toBe('Importante, *literal* y `literal`')
  })

  it('deja literales los guiones bajos de los identificadores', () => {
    for (const texto of [
      'worker_threads: paralelismo real de JavaScript',
      'Resolución de módulos: rutas, node_modules y exports maps',
      'Object.getPrototypeOf() / setPrototypeOf(), no __proto__',
      'Roles predefinidos: pg_read_all_data y compañía',
    ]) {
      const { container, unmount } = render(<TituloEnLinea texto={texto} />)

      expect(container).toHaveTextContent(texto)
      expect(container.querySelector('strong, em')).toBeNull()
      expect(textoPlanoDeTitulo(texto)).toBe(texto)
      unmount()
    }
  })

  it('quita la barra de cualquier signo de puntuación escapado', () => {
    const texto = String.raw`target=\"_blank\" y un riesgo de seguridad real`

    expect(textoPlanoDeTitulo(texto)).toBe('target="_blank" y un riesgo de seguridad real')
    const { container } = render(<TituloEnLinea texto={texto} />)
    expect(container).toHaveTextContent('target="_blank" y un riesgo de seguridad real')
  })

  it('no interpreta nada dentro de código', () => {
    const texto = '`const patron = "**/*"`'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container.querySelector('code')).toHaveTextContent('const patron = "**/*"')
    expect(container.querySelector('strong, em')).toBeNull()
  })

  it('deja literales todos los marcadores sin pareja', () => {
    const texto = 'Texto con *cursiva, **negrita y `código sin cerrar'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container).toHaveTextContent(texto)
    expect(container.querySelector('strong, em, code')).toBeNull()
    expect(textoPlanoDeTitulo(texto)).toBe(texto)
  })

  it('trata un intento de inyección como texto y no como HTML', () => {
    const texto = '<img src=x onerror=alert(1)>'
    const { container } = render(<TituloEnLinea texto={texto} />)

    expect(container).toHaveTextContent(texto)
    expect(container.querySelector('img')).toBeNull()
  })

  it('no tiene violaciones de accesibilidad detectables', async () => {
    const { container } = render(
      <h2>
        <TituloEnLinea texto="CSP con *nonce* en `entry.server.tsx`" />
      </h2>,
    )

    expect((await axe(container)).violations).toEqual([])
  })
})

describe('títulos H2 del contenido real', () => {
  it('los convierte a texto plano y los renderiza sin lanzar', () => {
    const titulos = Object.entries(contenido).flatMap(([ruta, markdown]) =>
      dividirEnSecciones(markdown).map((seccion) => ({ ruta, ...seccion })),
    )

    expect(titulos.length).toBeGreaterThan(400)
    titulos.forEach(({ ruta, titulo }) => {
      expect(textoPlanoDeTitulo(titulo), `${ruta}: ${titulo}`).not.toContain('`')
    })

    expect(() => {
      const vista = render(
        <>
          {titulos.map(({ ruta, id, titulo }, indice) => (
            <TituloEnLinea key={`${ruta}-${id}-${indice}`} texto={titulo} />
          ))}
        </>,
      )
      vista.unmount()
    }).not.toThrow()
  })
})
