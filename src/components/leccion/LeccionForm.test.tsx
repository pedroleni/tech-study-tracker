import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LeccionForm } from './LeccionForm'
import { supabase } from '@/lib/supabaseClient'

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
