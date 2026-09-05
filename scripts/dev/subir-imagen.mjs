#!/usr/bin/env node
// Sube una imagen a través de POST /api/imagenes (que la guarda en
// Cloudflare R2 desde el servidor) y deja listo el bloque `imagen` para
// pegar en un fichero .md de contenido.
//
// Uso: node scripts/dev/subir-imagen.mjs <ruta-al-archivo> <alt> [titulo]
//
// Necesita en el entorno (carga tu .env local antes, p. ej. con
// `set -a && source .env && set +a`):
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
// Opcional:
//   API_BASE_URL (por defecto https://www.techstudytracker.com — el
//   dominio raíz redirige ahí con 308, evita el salto de más)

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

// Mismo conjunto que api/imagenes.ts — SVG queda fuera a propósito (riesgo
// de XSS vía script embebido si alguien visita /img/<hash>.svg directo).
const TIPOS_POR_EXTENSION = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

const [, , rutaArchivo, alt, titulo] = process.argv

if (!rutaArchivo || !alt) {
  console.error('Uso: node scripts/dev/subir-imagen.mjs <ruta-al-archivo> <alt> [titulo]')
  process.exit(1)
}

const contentType = TIPOS_POR_EXTENSION[extname(rutaArchivo).toLowerCase()]
if (!contentType) {
  console.error(
    `Extensión no soportada: ${extname(rutaArchivo)}. Usa png, jpg, jpeg o webp.`,
  )
  process.exit(1)
}

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_BASE_URL = 'https://www.techstudytracker.com',
} = process.env

for (const [nombre, valor] of Object.entries({
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
})) {
  if (!valor) {
    console.error(`Falta la variable de entorno ${nombre}.`)
    process.exit(1)
  }
}

const bytes = await readFile(rutaArchivo)
if (bytes.byteLength > 4 * 1024 * 1024) {
  console.error('La imagen supera los 4 MB permitidos por la función de subida.')
  process.exit(1)
}

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
const { data: sesion, error: errorSesion } = await supabase.auth.signInWithPassword({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
})
if (errorSesion || !sesion.session) {
  console.error('No se pudo iniciar sesión de admin:', errorSesion?.message)
  process.exit(1)
}

const respuesta = await fetch(`${API_BASE_URL}/api/imagenes`, {
  method: 'POST',
  headers: {
    'content-type': contentType,
    authorization: `Bearer ${sesion.session.access_token}`,
  },
  body: bytes,
})

if (!respuesta.ok) {
  console.error(`La función devolvió ${respuesta.status}: ${await respuesta.text()}`)
  process.exit(1)
}

const { publicUrl } = await respuesta.json()
console.log(`Subida: ${publicUrl}`)

const bloque = { tipo: 'imagen', src: publicUrl, alt, ...(titulo ? { titulo } : {}) }

console.log('\nBloque listo para pegar en el .md:\n')
console.log('```laboratorio')
console.log(JSON.stringify(bloque, null, 2))
console.log('```')

await supabase.auth.signOut()
