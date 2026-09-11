import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
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

export default {
  async fetch(request: Request): Promise<Response> {
    const clave = new URL(request.url).searchParams.get('clave') ?? ''
    if (!CLAVE_VALIDA.test(clave)) {
      return new Response('No encontrada', { status: 404 })
    }

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

    try {
      const range = request.headers.get('range')
      if (range && !/^bytes=\d*-\d*$/.test(range)) {
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

      const objeto = await s3.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: clave,
          Range: range ?? undefined,
        }),
      )
      const bytes = await objeto.Body?.transformToByteArray()
      if (!bytes) return new Response('No encontrada', { status: 404 })

      const extension = clave.split('.').pop() ?? ''
      const contentType = EXTENSION_A_CONTENT_TYPE[extension] ?? 'application/octet-stream'
      const cacheControl = 'public, max-age=31536000, immutable'

      if (range) {
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
            'Cache-Control': cacheControl,
          },
        })
      }

      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': cacheControl,
        },
      })
    } catch {
      return new Response('No encontrada', { status: 404 })
    }
  },
}
