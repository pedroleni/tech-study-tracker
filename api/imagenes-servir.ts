import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

const EXTENSION_A_CONTENT_TYPE: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

// La clave siempre es un hash sha256 (64 hex) + una de las extensiones
// permitidas — cualquier otra cosa (incluidos intentos de path traversal
// como ../../algo) se rechaza sin llegar a tocar R2. SVG queda fuera a
// propósito (ver api/imagenes.ts) para no poder servir jamás un XSS vía
// script embebido en el propio origen.
const CLAVE_VALIDA = /^[0-9a-f]{64}\.(png|jpg|jpeg|webp)$/

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
      const objeto = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: clave }))
      const bytes = await objeto.Body?.transformToByteArray()
      if (!bytes) return new Response('No encontrada', { status: 404 })

      const extension = clave.split('.').pop() ?? ''
      return new Response(bytes, {
        status: 200,
        headers: {
          'Content-Type': EXTENSION_A_CONTENT_TYPE[extension] ?? 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      return new Response('No encontrada', { status: 404 })
    }
  },
}
