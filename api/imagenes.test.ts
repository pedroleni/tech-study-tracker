import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

const mockSend = vi.fn()
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: mockSend })),
  PutObjectCommand: vi.fn((input: unknown) => ({ __tipo: 'PutObjectCommand', input })),
  GetObjectCommand: vi.fn((input: unknown) => ({ __tipo: 'GetObjectCommand', input })),
}))

const { default: handler } = await import('./imagenes')

function crearPeticion(
  bytes: Uint8Array,
  headers: Record<string, string> = {},
) {
  return new Request('https://techstudytracker.com/api/imagenes', {
    method: 'POST',
    headers: { 'content-type': 'image/png', ...headers },
    body: bytes,
  })
}

const BYTES_DE_PRUEBA = new Uint8Array([1, 2, 3, 4])
const PNG_VALIDO = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
])

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VITE_SUPABASE_URL = 'https://proyecto.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'anon-key-de-prueba'
  process.env.R2_ACCOUNT_ID = 'cuenta123'
  process.env.R2_ACCESS_KEY_ID = 'clave-de-prueba'
  process.env.R2_SECRET_ACCESS_KEY = 'secreto-de-prueba'
  process.env.R2_BUCKET_NAME = 'techstudytracker-imagenes'
})

describe('POST /api/imagenes', () => {
  it('rechaza sin cabecera Authorization', async () => {
    const respuesta = await handler.fetch(crearPeticion(BYTES_DE_PRUEBA))
    expect(respuesta.status).toBe(401)
  })

  it('rechaza un token que Supabase no reconoce', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('inválido') })

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, { authorization: 'Bearer token-malo' }),
    )
    expect(respuesta.status).toBe(401)
  })

  it('rechaza un usuario autenticado que no es admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'user' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, { authorization: 'Bearer token-user' }),
    )
    expect(respuesta.status).toBe(403)
  })

  it('rechaza un Content-Type no soportado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, {
        authorization: 'Bearer token-admin',
        'content-type': 'application/pdf',
      }),
    )
    expect(respuesta.status).toBe(400)
  })

  it('rechaza una propiedad heredada como Content-Type', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, {
        authorization: 'Bearer token-admin',
        'content-type': '__proto__',
      }),
    )

    expect(respuesta.status).toBe(400)
    await expect(respuesta.json()).resolves.toEqual({
      error: 'El Content-Type debe ser image/png, image/jpeg o image/webp',
    })
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('rechaza específicamente image/svg+xml (riesgo de XSS vía script embebido)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, {
        authorization: 'Bearer token-admin',
        'content-type': 'image/svg+xml',
      }),
    )
    expect(respuesta.status).toBe(400)
  })

  it('rechaza un cuerpo vacío', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(new Uint8Array(0), { authorization: 'Bearer token-admin' }),
    )
    expect(respuesta.status).toBe(400)
  })

  it('rechaza un archivo por encima de 4 MB', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const archivoEnorme = new Uint8Array(4 * 1024 * 1024 + 1)
    const respuesta = await handler.fetch(
      crearPeticion(archivoEnorme, { authorization: 'Bearer token-admin' }),
    )
    expect(respuesta.status).toBe(413)
  })

  it.each([
    ['PNG', 'image/png'],
    ['JPEG', 'image/jpeg'],
    ['WebP', 'image/webp'],
  ])('rechaza bytes que no corresponden a una imagen %s', async (tipo, contentType) => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, {
        authorization: 'Bearer token-admin',
        'content-type': contentType,
      }),
    )

    expect(respuesta.status).toBe(400)
    await expect(respuesta.json()).resolves.toEqual({
      error: `El archivo no es una imagen ${tipo} válida`,
    })
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('un admin con bytes PNG válidos sube a R2 y devuelve la URL pública', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
    mockSend.mockResolvedValue({})

    const respuesta = await handler.fetch(
      crearPeticion(PNG_VALIDO, { authorization: 'Bearer token-admin' }),
    )
    const cuerpo = await respuesta.json()

    expect(respuesta.status).toBe(200)
    expect(cuerpo.publicUrl).toMatch(
      /^https:\/\/www.techstudytracker\.com\/img\/[0-9a-f]{64}\.png$/,
    )
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})
