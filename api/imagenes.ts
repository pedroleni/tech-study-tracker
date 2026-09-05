import { createClient } from '@supabase/supabase-js'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createHash } from 'node:crypto'

// SVG queda fuera a propósito: puede llevar <script> embebido, y visitar
// /img/<hash>.svg directamente (documento de nivel superior, no <img>) lo
// ejecutaría en el origen de techstudytracker.com — un XSS evitable del
// todo simplemente no aceptando ese formato.
const EXTENSIONES_PERMITIDAS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const TAMANO_MAXIMO_BYTES = 4 * 1024 * 1024

function empiezaCon(bytes: Uint8Array, firma: readonly number[], offset = 0): boolean {
  return firma.every((byte, indice) => bytes[offset + indice] === byte)
}

function tieneFirmaValida(bytes: Uint8Array, contentType: string): boolean {
  switch (contentType) {
    case 'image/png':
      return empiezaCon(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    case 'image/jpeg':
      return empiezaCon(bytes, [0xff, 0xd8, 0xff])
    case 'image/webp':
      return (
        empiezaCon(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        empiezaCon(bytes, [0x57, 0x45, 0x42, 0x50], 8)
      )
    default:
      return false
  }
}

function nombreFormato(contentType: string): string {
  if (contentType === 'image/jpeg') return 'JPEG'
  if (contentType === 'image/webp') return 'WebP'
  return 'PNG'
}

function jsonError(mensaje: string, status: number): Response {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return jsonError('Método no permitido', 405)

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return jsonError('Falta autenticación', 401)

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonError('Configuración de Supabase ausente', 500)
    }

    // Un único cliente, con el token del usuario en las cabeceras: getUser()
    // valida ese token explícitamente contra Supabase Auth, y el select de
    // profiles que sigue lo usa para que auth.uid() se resuelva a este
    // usuario dentro de la política RLS profiles_select_own — nunca puede
    // devolver el perfil de otra persona, aunque este código tuviera un bug.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData.user) return jsonError('Sesión no válida', 401)

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (perfilError || perfil?.role !== 'admin') {
      return jsonError('Solo un admin puede subir imágenes', 403)
    }

    const contentType = request.headers.get('content-type') ?? ''
    const extension = Object.hasOwn(EXTENSIONES_PERMITIDAS, contentType)
      ? EXTENSIONES_PERMITIDAS[contentType]
      : undefined
    if (!extension) {
      return jsonError(
        'El Content-Type debe ser image/png, image/jpeg o image/webp',
        400,
      )
    }

    const bytes = new Uint8Array(await request.arrayBuffer())
    if (bytes.byteLength === 0) return jsonError('El cuerpo de la petición está vacío', 400)
    if (bytes.byteLength > TAMANO_MAXIMO_BYTES) {
      // Vercel ya limita el cuerpo de cualquier función a 4.5 MB — este
      // límite propio (4 MB) deja margen y da un mensaje claro en vez de
      // que Vercel corte la petición con un 413 genérico antes de llegar
      // aquí.
      return jsonError('La imagen no puede superar 4 MB', 413)
    }
    if (!tieneFirmaValida(bytes, contentType)) {
      return jsonError(
        `El archivo no es una imagen ${nombreFormato(contentType)} válida`,
        400,
      )
    }

    const sha256 = createHash('sha256').update(bytes).digest('hex')
    const clave = `${sha256}.${extension}`

    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    const bucketName = process.env.R2_BUCKET_NAME
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return jsonError('Configuración de R2 ausente', 500)
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })

    // Subir con la misma clave (derivada del hash) dos veces es idempotente
    // — mismo contenido, mismo objeto final — así que no hace falta
    // comprobar antes si ya existe.
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: clave,
        Body: bytes,
        ContentType: contentType,
      }),
    )

    return new Response(
      JSON.stringify({ publicUrl: `https://www.techstudytracker.com/img/${clave}` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  },
}
