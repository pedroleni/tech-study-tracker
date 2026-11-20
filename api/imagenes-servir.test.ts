import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSend = vi.fn()
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: mockSend })),
  GetObjectCommand: vi.fn((input: unknown) => ({ __tipo: 'GetObjectCommand', input })),
  HeadObjectCommand: vi.fn((input: unknown) => ({ __tipo: 'HeadObjectCommand', input })),
}))

const { default: handler } = await import('./imagenes-servir')

function crearPeticion(clave: string, headers: Record<string, string> = {}) {
  return new Request(
    `https://techstudytracker.com/api/imagenes-servir?clave=${encodeURIComponent(clave)}`,
    { headers },
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.R2_ACCOUNT_ID = 'cuenta123'
  process.env.R2_ACCESS_KEY_ID = 'clave-de-prueba'
  process.env.R2_SECRET_ACCESS_KEY = 'secreto-de-prueba'
  process.env.R2_BUCKET_NAME = 'techstudytracker-imagenes'
})

const HASH_VALIDO = 'a'.repeat(64)

describe('GET /img/:clave (vía /api/imagenes-servir)', () => {
  it('devuelve 404 si la clave no tiene el formato esperado', async () => {
    const respuesta = await handler.fetch(crearPeticion('../../etc/passwd'))
    expect(respuesta.status).toBe(404)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('devuelve 404 para una clave .svg bien formada (riesgo de XSS vía script embebido)', async () => {
    const respuesta = await handler.fetch(crearPeticion(`${HASH_VALIDO}.svg`))
    expect(respuesta.status).toBe(404)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('devuelve 404 si R2 no tiene ese objeto', async () => {
    mockSend.mockRejectedValue(new Error('NoSuchKey'))
    const respuesta = await handler.fetch(crearPeticion(`${HASH_VALIDO}.png`))
    expect(respuesta.status).toBe(404)
  })

  it('sirve el objeto real con Content-Type y caché larga', async () => {
    const bytesReales = new Uint8Array([137, 80, 78, 71])
    mockSend.mockResolvedValue({
      Body: { transformToByteArray: async () => bytesReales },
    })

    const respuesta = await handler.fetch(crearPeticion(`${HASH_VALIDO}.png`))

    expect(respuesta.status).toBe(200)
    expect(respuesta.headers.get('content-type')).toBe('image/png')
    expect(respuesta.headers.get('cache-control')).toBe(
      'public, max-age=31536000, immutable',
    )
    const cuerpo = new Uint8Array(await respuesta.arrayBuffer())
    expect(cuerpo).toEqual(bytesReales)
  })

  it('sirve un rango válido con 206 y sus cabeceras', async () => {
    const bytesParciales = new Uint8Array([137, 80])
    mockSend.mockResolvedValue({
      Body: { transformToByteArray: async () => bytesParciales },
      ContentRange: 'bytes 0-1/4',
      ContentLength: 2,
    })

    const respuesta = await handler.fetch(
      crearPeticion(`${HASH_VALIDO}.mp4`, { range: 'bytes=0-1' }),
    )

    expect(respuesta.status).toBe(206)
    expect(mockSend).toHaveBeenCalledWith({
      __tipo: 'GetObjectCommand',
      input: {
        Bucket: 'techstudytracker-imagenes',
        Key: `${HASH_VALIDO}.mp4`,
        Range: 'bytes=0-1',
      },
    })
    expect(respuesta.headers.get('content-type')).toBe('video/mp4')
    expect(respuesta.headers.get('content-range')).toBe('bytes 0-1/4')
    expect(respuesta.headers.get('content-length')).toBe('2')
    expect(respuesta.headers.get('accept-ranges')).toBe('bytes')
    expect(respuesta.headers.get('cache-control')).toBe(
      'public, max-age=31536000, immutable',
    )
  })

  it('responde 416 a un rango mal formado sin descargar el objeto', async () => {
    mockSend.mockResolvedValue({ ContentLength: 10 })

    const respuesta = await handler.fetch(
      crearPeticion(`${HASH_VALIDO}.mp4`, { range: 'bytes=0-1,3-4' }),
    )

    expect(respuesta.status).toBe(416)
    expect(respuesta.headers.get('content-range')).toBe('bytes */10')
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ __tipo: 'HeadObjectCommand' }),
    )
  })
})
