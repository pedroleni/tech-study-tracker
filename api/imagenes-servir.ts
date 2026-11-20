import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  type GetObjectCommandOutput,
} from '@aws-sdk/client-s3'

const EXTENSION_A_CONTENT_TYPE: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  webm: 'video/webm',
  mp4: 'video/mp4',
}

// La clave siempre es un hash sha256 (64 hex) + una de las extensiones
// permitidas — cualquier otra cosa (incluidos intentos de path traversal
// como ../../algo) se rechaza sin llegar a tocar R2. SVG queda fuera a
// propósito (ver api/imagenes.ts) para no poder servir jamás un XSS vía
// script embebido en el propio origen.
// El vídeo necesita peticiones Range para permitir búsquedas y funcionar en Safari.
const CLAVE_VALIDA = /^[0-9a-f]{64}\.(png|jpg|jpeg|webp|webm|mp4)$/

const RANGO_VALIDO = /^bytes=\d*-\d*$/
const CACHE_CONTROL = 'public, max-age=31536000, immutable'

type ClienteR2 = { s3: S3Client; bucketName: string }

function crearClienteR2(): ClienteR2 | Response {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucketName = process.env.R2_BUCKET_NAME
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return new Response('Configuración de R2 ausente', { status: 500 })
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return { s3, bucketName }
}

function contentTypeDe(clave: string): string {
  const extension = clave.split('.').pop() ?? ''
  return EXTENSION_A_CONTENT_TYPE[extension] ?? 'application/octet-stream'
}

async function responderRangoNoSatisfacible(
  { s3, bucketName }: ClienteR2,
  clave: string,
): Promise<Response> {
  const metadata = await s3.send(
    new HeadObjectCommand({ Bucket: bucketName, Key: clave }),
  )
  return new Response(null, {
    status: 416,
    headers: {
      'Content-Range': `bytes */${metadata.ContentLength ?? 0}`,
      'Accept-Ranges': 'bytes',
    },
  })
}

function responderParcial(
  bytes: Uint8Array,
  objeto: GetObjectCommandOutput,
  contentType: string,
): Response {
  if (!objeto.ContentRange || objeto.ContentLength === undefined) {
    return new Response('Respuesta parcial no válida', { status: 502 })
  }

  return new Response(bytes, {
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Range': objeto.ContentRange,
      'Content-Length': objeto.ContentLength.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': CACHE_CONTROL,
    },
  })
}

async function servirObjeto(
  r2: ClienteR2,
  clave: string,
  range: string | null,
): Promise<Response> {
  if (range && !RANGO_VALIDO.test(range)) {
    return responderRangoNoSatisfacible(r2, clave)
  }

  const objeto = await r2.s3.send(
    new GetObjectCommand({
      Bucket: r2.bucketName,
      Key: clave,
      Range: range ?? undefined,
    }),
  )
  const bytes = await objeto.Body?.transformToByteArray()
  if (!bytes) return new Response('No encontrada', { status: 404 })

  const contentType = contentTypeDe(clave)
  if (range) return responderParcial(bytes, objeto, contentType)

  return new Response(bytes, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': CACHE_CONTROL,
    },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    const clave = new URL(request.url).searchParams.get('clave') ?? ''
    if (!CLAVE_VALIDA.test(clave)) {
      return new Response('No encontrada', { status: 404 })
    }

    const r2 = crearClienteR2()
    if (r2 instanceof Response) return r2

    try {
      // El await es necesario: sin él, un fallo de R2 escaparía del catch.
      return await servirObjeto(r2, clave, request.headers.get('range'))
    } catch {
      return new Response('No encontrada', { status: 404 })
    }
  },
}
