import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { LeccionForm } from './LeccionForm'
import { supabase } from '@/lib/supabaseClient'
import type { Leccion } from '@/types'

const CLAVE_IMAGEN = `${'e'.repeat(64)}.png`
const BLOQUE_IMAGEN = `\`\`\`laboratorio
{
  "tipo": "imagen",
  "src": "https://www.techstudytracker.com/img/${CLAVE_IMAGEN}",
  "alt": "Diagrama de prueba"
}
\`\`\``

function crearLeccionConImagen(): Leccion {
  return {
    id: 'leccion-1',
    technologyId: 'technology-1',
    slug: 'leccion-con-imagen',
    modulo: null,
    titulo: 'Lección con imagen',
    resumen: '',
    contenido: `Antes\n\n${BLOQUE_IMAGEN}\n\nDespués`,
    orden: 10,
    status: 'borrador',
    esProyecto: false,
    createdAt: '2026-09-06T00:00:00.000Z',
    updatedAt: '2026-09-06T00:00:00.000Z',
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LeccionForm — subir imagen arrastrándola al editor', () => {
  it('sube el archivo e inserta el bloque imagen en el cursor', async () => {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { access_token: 'token-de-prueba' } },
      error: null,
    } as never)

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({ publicUrl: 'https://www.techstudytracker.com/img/abc123.png' }),
        { status: 200 },
      ),
    )

    render(<LeccionForm pending={false} onSubmit={vi.fn()} />)

    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement
    const archivo = new File([new Uint8Array([1, 2, 3])], 'captura.png', {
      type: 'image/png',
    })

    fireEvent.drop(textarea, { dataTransfer: { files: [archivo] } })

    await waitFor(() => expect(textarea.value).toContain('"tipo": "imagen"'))
    expect(textarea.value).toContain('https://www.techstudytracker.com/img/abc123.png')
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/imagenes',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('previene el comportamiento por defecto del navegador al arrastrar un archivo encima', () => {
    render(<LeccionForm pending={false} onSubmit={vi.fn()} />)
    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement

    // fireEvent devuelve false cuando algún manejador llamó a
    // preventDefault() en un evento cancelable — así se detecta, sin un
    // navegador real, que el elemento se registra como zona de soltar
    // válida. Sin esto, el navegador ejecutaría su propia acción por
    // defecto al soltar (abrir/navegar al archivo) en vez de disparar
    // drop con los datos utilizables — el bug real que motivó este test.
    const noPrevenido = fireEvent.dragOver(textarea, {
      dataTransfer: { types: ['Files'], files: [] },
    })

    expect(noPrevenido).toBe(false)
  })

  it('no interfiere con un dragover que no lleva archivos', () => {
    render(<LeccionForm pending={false} onSubmit={vi.fn()} />)
    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement

    const noPrevenido = fireEvent.dragOver(textarea, {
      dataTransfer: { types: ['text/plain'], files: [] },
    })

    expect(noPrevenido).toBe(true)
  })
})

describe('LeccionForm — galería de imágenes', () => {
  function prepararSesion() {
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: { access_token: 'token-de-prueba' } },
      error: null,
    } as never)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  }

  it('muestra la miniatura y el botón de borrado para una imagen del contenido inicial', async () => {
    const { container } = render(
      <LeccionForm
        leccion={crearLeccionConImagen()}
        pending={false}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Imágenes en esta lección' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'Diagrama de prueba' })).toHaveAttribute(
      'src',
      `https://www.techstudytracker.com/img/${CLAVE_IMAGEN}`,
    )
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeVisible()
    const resultados = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(resultados.violations).toEqual([])
  })

  it('no borra nada si se cancela la confirmación', async () => {
    // Sesión válida a propósito: si el código no respetara confirm() y
    // siguiera adelante, SÍ llegaría a llamar a fetch — así este test
    // detecta de verdad la ausencia del guard, no por casualidad (una
    // sesión sin mockear habría dado el mismo resultado observable por
    // un motivo distinto).
    prepararSesion()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ borradoDeR2: true }), { status: 200 }))
    render(
      <LeccionForm
        leccion={crearLeccionConImagen()}
        pending={false}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    // Nada de esto tiene un await propio en el componente si confirm()
    // devuelve false (la función retorna antes de tocar la sesión) — pero
    // si el guard faltara, el código SÍ seguiría hasta llamar a fetch tras
    // resolver getSession(). Vaciamos la cola de microtareas para que, si
    // eso ocurriera, ya se hubiera reflejado en fetchMock antes de mirar.
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement
    expect(textarea.value).toContain(BLOQUE_IMAGEN)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('quita el bloque del textarea cuando el servidor lo borra de R2', async () => {
    prepararSesion()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ borradoDeR2: true }), { status: 200 }),
    )
    render(
      <LeccionForm
        leccion={crearLeccionConImagen()}
        pending={false}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement
    await waitFor(() => expect(textarea.value).not.toContain(BLOQUE_IMAGEN))
    expect(fetchMock).toHaveBeenCalledWith('/api/imagenes', {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token-de-prueba',
      },
      body: JSON.stringify({ clave: CLAVE_IMAGEN, leccionId: 'leccion-1' }),
    })
  })

  it('quita el bloque y avisa cuando la imagen sigue en uso en otra lección', async () => {
    prepararSesion()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ borradoDeR2: false }), { status: 200 }),
    )
    render(
      <LeccionForm
        leccion={crearLeccionConImagen()}
        pending={false}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement
    await waitFor(() => expect(textarea.value).not.toContain(BLOQUE_IMAGEN))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Imagen quitada de esta lección — sigue en uso en otra',
    )
  })

  it('conserva las ediciones hechas en el textarea mientras se procesa el borrado', async () => {
    prepararSesion()
    let resolverRespuesta!: (respuesta: Response) => void
    const promesaRespuesta = new Promise<Response>((resolve) => {
      resolverRespuesta = resolve
    })
    vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(promesaRespuesta)
    render(
      <LeccionForm
        leccion={crearLeccionConImagen()}
        pending={false}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: `${textarea.value}\nEdición reciente` } })
    await act(async () => {
      resolverRespuesta(
        new Response(JSON.stringify({ borradoDeR2: true }), { status: 200 }),
      )
    })

    await waitFor(() => expect(textarea.value).not.toContain(BLOQUE_IMAGEN))
    expect(textarea.value).toContain('Edición reciente')
  })
})
