# Imágenes en lecciones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Nota específica de este proyecto:** en `tech-study-tracker`, el código
> (TypeScript/React) lo escribe Codex, no el ejecutor de este plan
> directamente — cada Task de código se pasa a Codex vía
> `npm run codex:task -- "<prompt>" <effort>` (monitor real en
> `npm run codex:monitor`, `localhost:4545`; confírmalo arrancado antes de
> lanzar la primera tarea), y quien ejecuta este plan hace la verificación
> real después (Codex no tiene red/Chromium en su sandbox). Task 1 la
> ejecuta el usuario (Cloudflare/Vercel, fuera del repo).

**Goal:** Los admins pueden embeber imágenes reales (capturas, diagramas) en
el contenido de las lecciones, alojadas en Cloudflare R2, sin exponer nunca
credenciales de R2 en el navegador.

**Architecture:** Una función serverless de Vercel genera URLs prefirmadas de
R2 tras verificar (vía Supabase Auth + RLS existente en `profiles`) que quien
pide la URL es admin. El navegador (drag&drop en el editor de la lección) y
un script de CLI usan esa misma función para subir directamente a R2. Un
bloque nuevo `imagen` en `esquemaBloqueLaboratorio` + su componente
`Imagen.tsx` renderizan el resultado.

**Tech Stack:** Vite + React + TypeScript, Zod, Supabase (`@supabase/supabase-js`),
Vercel Functions (Web `Request`/`Response`, sin `@vercel/node`),
`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (SDK de AWS, compatible
con R2), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-imagenes-en-lecciones-design.md`

## Global Constraints

- Las credenciales de R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) nunca
  viven en código de frontend ni en variables `VITE_*` — solo como variables
  de entorno de Vercel (server-side) y en un `.env` local gitignored.
- El bloque `imagen` restringe `src` a `https://img.techstudytracker.com/` —
  nunca una URL externa arbitraria.
- `alt` es obligatorio en el esquema del bloque `imagen`; `titulo` es
  opcional.
- La comprobación de admin se apoya en la política RLS ya existente
  `profiles_select_own` (`id = auth.uid()`) — nunca en `user_metadata` ni en
  claims del JWT sin pasar por esa tabla, y nunca con la `service_role key`.
- Cada dependencia nueva se instala con versión exacta fijada (sin `^` ni
  `~`) y su `package-lock.json` se commitea.
- Nunca commits directos a `main` para código: cada Task vive en su propia
  rama `feat/<nombre>`, con PR contra `main`, y el CI
  (`.github/workflows/security-scan.yml`) debe estar en verde antes de
  mergear.
- Antes de dar cualquier Task de código por terminada, repasa el checklist
  de seguridad correspondiente de `.claude/agents/security-*.md` contra tu
  propio diff (indicado dentro de cada Task).

---

## Task 1: Bucket de R2, dominio, credenciales y variables de entorno

**Quién ejecuta esto:** el usuario, con las instrucciones exactas de abajo —
no es código, vive en los paneles de Cloudflare y Vercel.

**Archivos:**
- Modificar: `.env.example` (documentar los nombres de las variables nuevas,
  sin valores reales)

- [ ] **Paso 1: Crear el bucket de R2**

En el panel de Cloudflare → R2 → **Create bucket**:
- Nombre: `techstudytracker-imagenes`
- Ubicación: automática (Cloudflare la elige)

- [ ] **Paso 2: Conectar `img.techstudytracker.com` al bucket**

Dentro del bucket recién creado → pestaña **Settings** → **Custom Domains**
→ **Connect Domain** → escribe `img.techstudytracker.com` → Cloudflare crea
el registro DNS proxied necesario automáticamente (no hay que tocar la
pestaña DNS a mano para esto).

Verificación real: espera 1-2 minutos y sube un archivo de prueba
arrastrándolo directamente en la pestaña **Objects** del bucket (nombre
libre, p. ej. `prueba.txt` con cualquier contenido). Abre
`https://img.techstudytracker.com/prueba.txt` en el navegador — debe
mostrar el contenido del archivo. Si da 404 o error de certificado, espera
otros 2 minutos y reintenta antes de seguir (la propagación del dominio
personalizado no es instantánea). Borra `prueba.txt` del bucket cuando lo
confirmes.

- [ ] **Paso 3: Crear el token de API de R2**

Panel de Cloudflare → R2 → **Manage API tokens** → **Create API token**:
- Permisos: **Object Read & Write**
- Alcance: **Apply to specific buckets only** → selecciona
  `techstudytracker-imagenes` (nunca "Apply to all buckets")
- Crea el token y copia los tres valores que te muestra UNA sola vez:
  Account ID, Access Key ID, Secret Access Key.

- [ ] **Paso 4: Variables de entorno en Vercel**

Vercel → Project → Settings → **Environment Variables**, añade estas cinco
(marca **Production** y **Preview**, NO las prefijes con `VITE_` — deben
quedar solo del lado servidor):

| Nombre | Valor |
|---|---|
| `R2_ACCOUNT_ID` | el Account ID del Paso 3 |
| `R2_ACCESS_KEY_ID` | el Access Key ID del Paso 3 |
| `R2_SECRET_ACCESS_KEY` | el Secret Access Key del Paso 3 |
| `R2_BUCKET_NAME` | `techstudytracker-imagenes` |
| `R2_PUBLIC_URL_BASE` | `https://img.techstudytracker.com` |

- [ ] **Paso 5: Variables de entorno locales**

En tu `.env` local (ya gitignored, no lo toques en git) añade las mismas
cinco variables con los mismos valores reales, más estas dos para el script
de subida de la Task 4 (usa la cuenta admin que ya usas para el resto del
proyecto):

```
ADMIN_EMAIL=tu-email-de-admin
ADMIN_PASSWORD=tu-contraseña-de-admin
```

- [ ] **Paso 6: Documentar las variables en `.env.example` (esto sí es código)**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare R2 — solo servidor, nunca prefijadas con VITE_
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL_BASE=https://img.example.com

# Solo para scripts/dev/subir-imagen.mjs
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

- [ ] **Paso 7: Commit**

```bash
git checkout main && git pull
git checkout -b feat/r2-variables-entorno
git add .env.example
git commit -m "docs: documentar variables de entorno de R2 en .env.example"
git push -u origin feat/r2-variables-entorno
gh pr create --fill
```

Espera a que el CI de ese PR esté en verde, mergéalo, y confirma que
`.env.example` en `main` NO contiene ningún valor real (solo placeholders)
antes de pasar a la Task 2.

---

## Task 2: Esquema Zod del bloque `imagen` y su componente

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts`
- Modify: `src/lib/laboratorio/schemas.test.ts`
- Create: `src/components/bloques-laboratorio/Imagen.tsx`
- Create: `src/components/bloques-laboratorio/Imagen.test.tsx`
- Modify: `src/components/bloques-laboratorio/registro.ts`

**Interfaces:**
- Produces: `esquemaImagen` (Zod schema, tipo literal `'imagen'`) y
  `DatosImagen` (`{ tipo: 'imagen'; src: string; alt: string; titulo?: string }`)
  en `src/lib/laboratorio/schemas.ts`, consumidos por `Imagen.tsx` y por
  cualquier `.md` de contenido que use `"tipo": "imagen"`.
- Produces: `Imagen` (componente React) en
  `src/components/bloques-laboratorio/Imagen.tsx`, registrado en
  `registroBloquesLaboratorio['imagen']`.

- [ ] **Paso 1: Rama nueva**

```bash
git checkout main && git pull
git checkout -b feat/bloque-imagen
```

- [ ] **Paso 2: Test del esquema (falla primero)**

Añade al final de `src/lib/laboratorio/schemas.test.ts` (y añade
`esquemaImagen` al bloque de `import` de arriba del archivo, junto a los
demás):

```typescript
describe('esquemaImagen', () => {
  it('acepta un bloque válido con src en nuestro dominio y alt', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://img.techstudytracker.com/abc123.png',
      alt: 'Captura de la pestaña Network de DevTools',
    })

    expect(resultado.success).toBe(true)
  })

  it('acepta titulo opcional', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://img.techstudytracker.com/abc123.png',
      alt: 'Captura',
      titulo: 'Figura 1: la pestaña Network',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.titulo).toBe('Figura 1: la pestaña Network')
    }
  })

  it('rechaza un src fuera de nuestro dominio de R2', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://otro-sitio.com/imagen.png',
      alt: 'Captura',
    })

    expect(resultado.success).toBe(false)
  })

  it('rechaza sin alt', () => {
    const resultado = esquemaImagen.safeParse({
      tipo: 'imagen',
      src: 'https://img.techstudytracker.com/abc123.png',
    })

    expect(resultado.success).toBe(false)
  })

  it('participa en esquemaBloqueLaboratorio', () => {
    const resultado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'imagen',
      src: 'https://img.techstudytracker.com/abc123.png',
      alt: 'Captura',
    })

    expect(resultado.success).toBe(true)
  })
})
```

- [ ] **Paso 3: Confirmar que falla**

Run: `npm run test -- schemas.test.ts`
Expected: FAIL — `esquemaImagen` no existe todavía (error de importación).

- [ ] **Paso 4: Implementar el esquema**

En `src/lib/laboratorio/schemas.ts`, añade (cerca de los demás `esquemaX`,
por ejemplo justo antes de `esquemaBloqueLaboratorio`):

```typescript
export const esquemaImagen = z.object({
  tipo: z.literal('imagen'),
  src: z.string().url().startsWith('https://img.techstudytracker.com/'),
  alt: z.string().min(1).max(200),
  titulo: z.string().min(1).max(160).optional(),
})
```

Añádelo al array de `esquemaBloqueLaboratorio`:

```typescript
export const esquemaBloqueLaboratorio = z.discriminatedUnion('tipo', [
  esquemaPrediceElResultado,
  esquemaCodigoAnotado,
  esquemaComparadorAntesDespues,
  esquemaNotasClave,
  esquemaDiagramaEtiqueta,
  esquemaCallout,
  esquemaLineaDeTiempo,
  esquemaRoles,
  esquemaRecursos,
  esquemaMitos,
  esquemaVistaPreviaSocial,
  esquemaMapaDeRegiones,
  esquemaEsquemaDePagina,
  esquemaCapasDeCaja,
  esquemaEditorEnVivo,
  esquemaSqlAnotado,
  esquemaSqlEnVivo,
  esquemaGitAnotado,
  esquemaGitEnVivo,
  esquemaImagen,
])
```

Y añade el tipo exportado junto a los demás `export type DatosX`:

```typescript
export type DatosImagen = z.infer<typeof esquemaImagen>
```

- [ ] **Paso 5: Confirmar que el test del esquema pasa**

Run: `npm run test -- schemas.test.ts`
Expected: PASS

- [ ] **Paso 6: Test del componente (falla primero)**

Crea `src/components/bloques-laboratorio/Imagen.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Imagen } from './Imagen'

describe('Imagen', () => {
  it('renderiza la imagen con su alt y loading lazy', () => {
    render(
      <Imagen
        tipo="imagen"
        src="https://img.techstudytracker.com/abc123.png"
        alt="Captura de la pestaña Network de DevTools"
      />,
    )

    const img = screen.getByRole('img', {
      name: 'Captura de la pestaña Network de DevTools',
    })
    expect(img).toHaveAttribute('src', 'https://img.techstudytracker.com/abc123.png')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('muestra el pie de foto cuando hay titulo', () => {
    render(
      <Imagen
        tipo="imagen"
        src="https://img.techstudytracker.com/abc123.png"
        alt="Captura"
        titulo="Figura 1: la pestaña Network"
      />,
    )

    expect(screen.getByText('Figura 1: la pestaña Network')).toBeInTheDocument()
  })

  it('no renderiza figcaption sin titulo', () => {
    const { container } = render(
      <Imagen
        tipo="imagen"
        src="https://img.techstudytracker.com/abc123.png"
        alt="Captura"
      />,
    )

    expect(container.querySelector('figcaption')).toBeNull()
  })
})
```

- [ ] **Paso 7: Confirmar que falla**

Run: `npm run test -- Imagen.test.tsx`
Expected: FAIL — el módulo `./Imagen` no existe.

- [ ] **Paso 8: Implementar el componente**

Crea `src/components/bloques-laboratorio/Imagen.tsx`:

```tsx
import type { DatosImagen } from '@/lib/laboratorio/schemas'

export function Imagen({ src, alt, titulo }: DatosImagen) {
  return (
    <figure className="my-6 space-y-2">
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-xl border" />
      {titulo && (
        <figcaption className="text-center text-sm text-muted-foreground">
          {titulo}
        </figcaption>
      )}
    </figure>
  )
}
```

- [ ] **Paso 9: Confirmar que el test del componente pasa**

Run: `npm run test -- Imagen.test.tsx`
Expected: PASS

- [ ] **Paso 10: Registrar el componente**

En `src/components/bloques-laboratorio/registro.ts`, añade el import
(alfabético, junto a los demás) y la entrada en el registro:

```typescript
import { Imagen } from '@/components/bloques-laboratorio/Imagen'
```

```typescript
export const registroBloquesLaboratorio: Record<string, ComponentType<any>> = {
  // ...las entradas existentes, sin tocarlas...
  imagen: Imagen,
}
```

- [ ] **Paso 11: Suite completa + build + lint**

Run: `npm run test && npm run build && npm run lint`
Expected: los tres en verde. Si `npm run lint` marca el
`eslint-disable-next-line @typescript-eslint/no-explicit-any` de
`registro.ts`, es preexistente — no lo toques, no es parte de esta Task.

- [ ] **Paso 12: Commit y PR**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts \
  src/components/bloques-laboratorio/Imagen.tsx \
  src/components/bloques-laboratorio/Imagen.test.tsx \
  src/components/bloques-laboratorio/registro.ts
git commit -m "feat(laboratorio): añadir bloque imagen y su componente"
git push -u origin feat/bloque-imagen
gh pr create --fill
```

Espera a que el CI esté en verde y mergea antes de pasar a la Task 3.

---

## Task 3: Función serverless que autoriza y genera la URL prefirmada

**Files:**
- Create: `api/imagenes-url-subida.ts`
- Create: `api/imagenes-url-subida.test.ts`
- Modify: `package.json` (nuevas dependencias)
- Modify: `vercel.json` (excluir `api/` del rewrite catch-all)

**Interfaces:**
- Consumes: `DatosImagen`/`esquemaImagen` de la Task 2 solo como referencia
  del formato de `src` esperado (`R2_PUBLIC_URL_BASE` + clave); no importa
  nada de esa Task directamente.
- Produces: endpoint `POST /api/imagenes-url-subida`. Petición:
  `{ contentType: string, sha256: string }` con cabecera
  `Authorization: Bearer <access_token>`. Respuesta 200:
  `{ publicUrl: string, yaExistia: boolean, uploadUrl?: string }`
  (`uploadUrl` solo presente cuando `yaExistia` es `false`). Usado por la
  Task 4 (script) y la Task 5 (drag&drop en el editor).

- [ ] **Paso 1: Rama nueva**

```bash
git checkout main && git pull
git checkout -b feat/imagenes-url-subida-api
```

- [ ] **Paso 2: Instalar las dependencias, versión exacta fijada**

```bash
npm install --save-exact @aws-sdk/client-s3@3.1126.0 @aws-sdk/s3-request-presigner@3.1126.0
```

Verifica que `package.json` guardó las versiones SIN `^` delante (por el
`--save-exact`), y que `package-lock.json` cambió.

- [ ] **Paso 3: Excluir `api/` del rewrite catch-all**

`vercel.json` actual tiene un rewrite `"source": "/(.*)"` → `/index.html`
para servir la SPA en cualquier ruta. Sin excluir `api/`, no hay garantía
documentada de que Vercel priorice la función sobre ese rewrite — para no
dejarlo a la suerte, exclúyelo explícitamente. Cambia:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  ...
}
```

por:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  ...
}
```

- [ ] **Paso 4: Test de la función (falla primero)**

Crea `api/imagenes-url-subida.test.ts`:

```typescript
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
  HeadObjectCommand: vi.fn((input: unknown) => ({ __tipo: 'HeadObjectCommand', input })),
}))

const mockGetSignedUrl = vi.fn()
vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}))

const { default: handler } = await import('./imagenes-url-subida')

const HASH_VALIDO = 'a'.repeat(64)

function crearPeticion(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://techstudytracker.com/api/imagenes-url-subida', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.VITE_SUPABASE_URL = 'https://proyecto.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'anon-key-de-prueba'
  process.env.R2_ACCOUNT_ID = 'cuenta123'
  process.env.R2_ACCESS_KEY_ID = 'clave-de-prueba'
  process.env.R2_SECRET_ACCESS_KEY = 'secreto-de-prueba'
  process.env.R2_BUCKET_NAME = 'techstudytracker-imagenes'
  process.env.R2_PUBLIC_URL_BASE = 'https://img.techstudytracker.com'
})

describe('POST /api/imagenes-url-subida', () => {
  it('rechaza sin cabecera Authorization', async () => {
    const respuesta = await handler.fetch(
      crearPeticion({ contentType: 'image/png', sha256: HASH_VALIDO }),
    )
    expect(respuesta.status).toBe(401)
  })

  it('rechaza un token que Supabase no reconoce', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('inválido') })

    const respuesta = await handler.fetch(
      crearPeticion(
        { contentType: 'image/png', sha256: HASH_VALIDO },
        { authorization: 'Bearer token-malo' },
      ),
    )
    expect(respuesta.status).toBe(401)
  })

  it('rechaza un usuario autenticado que no es admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'user' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(
        { contentType: 'image/png', sha256: HASH_VALIDO },
        { authorization: 'Bearer token-user' },
      ),
    )
    expect(respuesta.status).toBe(403)
  })

  it('rechaza un contentType no soportado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(
        { contentType: 'application/pdf', sha256: HASH_VALIDO },
        { authorization: 'Bearer token-admin' },
      ),
    )
    expect(respuesta.status).toBe(400)
  })

  it('rechaza un sha256 con formato inválido', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    const respuesta = await handler.fetch(
      crearPeticion(
        { contentType: 'image/png', sha256: 'no-es-un-hash' },
        { authorization: 'Bearer token-admin' },
      ),
    )
    expect(respuesta.status).toBe(400)
  })

  it('si el objeto ya existe en R2, no genera uploadUrl y devuelve yaExistia', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
    mockSend.mockResolvedValueOnce({})

    const respuesta = await handler.fetch(
      crearPeticion(
        { contentType: 'image/png', sha256: HASH_VALIDO },
        { authorization: 'Bearer token-admin' },
      ),
    )
    const cuerpo = await respuesta.json()

    expect(respuesta.status).toBe(200)
    expect(cuerpo.yaExistia).toBe(true)
    expect(cuerpo.uploadUrl).toBeUndefined()
    expect(cuerpo.publicUrl).toBe(`https://img.techstudytracker.com/${HASH_VALIDO}.png`)
    expect(mockGetSignedUrl).not.toHaveBeenCalled()
  })

  it('si el objeto no existe, genera una URL prefirmada', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
    mockSend.mockRejectedValueOnce(new Error('404 Not Found'))
    mockGetSignedUrl.mockResolvedValue('https://cuenta123.r2.cloudflarestorage.com/firmado')

    const respuesta = await handler.fetch(
      crearPeticion(
        { contentType: 'image/png', sha256: HASH_VALIDO },
        { authorization: 'Bearer token-admin' },
      ),
    )
    const cuerpo = await respuesta.json()

    expect(respuesta.status).toBe(200)
    expect(cuerpo.yaExistia).toBe(false)
    expect(cuerpo.uploadUrl).toBe('https://cuenta123.r2.cloudflarestorage.com/firmado')
    expect(cuerpo.publicUrl).toBe(`https://img.techstudytracker.com/${HASH_VALIDO}.png`)
  })
})
```

- [ ] **Paso 5: Confirmar que falla**

Run: `npm run test -- api/imagenes-url-subida.test.ts`
Expected: FAIL — `./imagenes-url-subida` no existe.

- [ ] **Paso 6: Implementar la función**

Crea `api/imagenes-url-subida.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const EXTENSIONES_PERMITIDAS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

const SHA256_HEX = /^[0-9a-f]{64}$/

function jsonError(mensaje: string, status: number): Response {
  return new Response(JSON.stringify({ error: mensaje }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function objetoExiste(s3: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch {
    return false
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return jsonError('Método no permitido', 405)
    }

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

    let body: { contentType?: unknown; sha256?: unknown }
    try {
      body = await request.json()
    } catch {
      return jsonError('Cuerpo JSON inválido', 400)
    }

    const contentType = typeof body.contentType === 'string' ? body.contentType : ''
    const extension = EXTENSIONES_PERMITIDAS[contentType]
    if (!extension) {
      return jsonError(
        'contentType debe ser image/png, image/jpeg, image/webp o image/svg+xml',
        400,
      )
    }

    const sha256 = typeof body.sha256 === 'string' ? body.sha256.toLowerCase() : ''
    if (!SHA256_HEX.test(sha256)) {
      return jsonError('sha256 debe ser el hash SHA-256 del archivo, en hexadecimal', 400)
    }

    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    const bucketName = process.env.R2_BUCKET_NAME
    const publicUrlBase = process.env.R2_PUBLIC_URL_BASE
    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrlBase) {
      return jsonError('Configuración de R2 ausente', 500)
    }

    const clave = `${sha256}.${extension}`
    const publicUrl = `${publicUrlBase}/${clave}`

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })

    if (await objetoExiste(s3, bucketName, clave)) {
      return new Response(JSON.stringify({ publicUrl, yaExistia: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucketName, Key: clave, ContentType: contentType }),
      { expiresIn: 300 },
    )

    return new Response(JSON.stringify({ uploadUrl, publicUrl, yaExistia: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
```

- [ ] **Paso 7: Confirmar que el test pasa**

Run: `npm run test -- api/imagenes-url-subida.test.ts`
Expected: PASS (los 7 casos)

- [ ] **Paso 8: Autorrevisión de seguridad (obligatoria, toca auth + secretos + dependencia nueva)**

Antes de abrir el PR, repasa tu propio diff contra:
- `.claude/agents/security-auth-crypto.md` (verificación de admin vía RLS,
  no vía JWT claims propios)
- `.claude/agents/security-secrets.md` (ninguna de las cinco variables de
  R2 lleva prefijo `VITE_`; no hay ningún valor real hardcodeado en el
  código ni en el test)
- `.claude/agents/security-supply-chain.md` (las dos dependencias nuevas
  quedaron con versión exacta en `package.json`, sin `^`)

- [ ] **Paso 9: Suite completa + build + lint**

Run: `npm run test && npm run build && npm run lint`
Expected: los tres en verde.

- [ ] **Paso 10: Commit y PR**

```bash
git add api/imagenes-url-subida.ts api/imagenes-url-subida.test.ts \
  package.json package-lock.json vercel.json
git commit -m "feat(api): función serverless que autoriza y firma subidas a R2"
git push -u origin feat/imagenes-url-subida-api
gh pr create --fill
```

Espera a que el CI esté en verde y mergea.

- [ ] **Paso 11: Verificación real contra producción**

Tras el deploy de `main` (confirma con
`gh run list --branch main --limit 1` como en el resto de la sesión), llama
al endpoint real sin token para confirmar el 401 real (no solo el mock):

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://techstudytracker.com/api/imagenes-url-subida \
  -H "content-type: application/json" -d '{"contentType":"image/png","sha256":"'"$(printf 'a%.0s' {1..64})"'"}'
```

Expected: `401` (no `200` de `index.html`, lo que confirmaría que el
rewrite se está comiendo la ruta — si sale eso, revisa el Paso 3).

---

## Task 4: Script de subida para Claude

**Files:**
- Create: `scripts/dev/subir-imagen.mjs`
- Modify: `package.json` (nuevo script npm)

**Interfaces:**
- Consumes: `POST /api/imagenes-url-subida` de la Task 3 (mismo contrato de
  petición/respuesta).
- Produces: imprime por stdout un bloque ```laboratorio``` con
  `{ tipo: 'imagen', src, alt, titulo? }` listo para pegar en un `.md` de
  `contenido/`.

- [ ] **Paso 1: Rama nueva**

```bash
git checkout main && git pull
git checkout -b feat/script-subir-imagen
```

- [ ] **Paso 2: Implementar el script**

Crea `scripts/dev/subir-imagen.mjs`:

```javascript
#!/usr/bin/env node
// Sube una imagen a Cloudflare R2 a través de la función serverless
// api/imagenes-url-subida, y deja listo el bloque `imagen` para pegar en
// un fichero .md de contenido.
//
// Uso: node scripts/dev/subir-imagen.mjs <ruta-al-archivo> <alt> [titulo]
//
// Necesita en el entorno (carga tu .env local antes, p. ej. con
// `set -a && source .env && set +a`):
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
// Opcional:
//   API_BASE_URL (por defecto https://techstudytracker.com)

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

const TIPOS_POR_EXTENSION = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

const [, , rutaArchivo, alt, titulo] = process.argv

if (!rutaArchivo || !alt) {
  console.error('Uso: node scripts/dev/subir-imagen.mjs <ruta-al-archivo> <alt> [titulo]')
  process.exit(1)
}

const contentType = TIPOS_POR_EXTENSION[extname(rutaArchivo).toLowerCase()]
if (!contentType) {
  console.error(
    `Extensión no soportada: ${extname(rutaArchivo)}. Usa png, jpg, jpeg, webp o svg.`,
  )
  process.exit(1)
}

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_BASE_URL = 'https://techstudytracker.com',
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
const sha256 = createHash('sha256').update(bytes).digest('hex')

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
const { data: sesion, error: errorSesion } = await supabase.auth.signInWithPassword({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
})
if (errorSesion || !sesion.session) {
  console.error('No se pudo iniciar sesión de admin:', errorSesion?.message)
  process.exit(1)
}

const respuestaFirma = await fetch(`${API_BASE_URL}/api/imagenes-url-subida`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${sesion.session.access_token}`,
  },
  body: JSON.stringify({ contentType, sha256 }),
})

if (!respuestaFirma.ok) {
  console.error(`La función devolvió ${respuestaFirma.status}: ${await respuestaFirma.text()}`)
  process.exit(1)
}

const { uploadUrl, publicUrl, yaExistia } = await respuestaFirma.json()

if (!yaExistia) {
  const respuestaSubida = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': contentType },
    body: bytes,
  })
  if (!respuestaSubida.ok) {
    console.error(`La subida a R2 falló con estado ${respuestaSubida.status}`)
    process.exit(1)
  }
  console.log(`Subida nueva: ${publicUrl}`)
} else {
  console.log(`Ya existía, reutilizada: ${publicUrl}`)
}

const bloque = { tipo: 'imagen', src: publicUrl, alt, ...(titulo ? { titulo } : {}) }

console.log('\nBloque listo para pegar en el .md:\n')
console.log('```laboratorio')
console.log(JSON.stringify(bloque, null, 2))
console.log('```')

await supabase.auth.signOut()
```

- [ ] **Paso 3: Registrar el script en `package.json`**

Añade en `"scripts"`:

```json
"subir-imagen": "node scripts/dev/subir-imagen.mjs"
```

- [ ] **Paso 4: Verificación real (end-to-end, contra producción — necesita la Task 1 y la Task 3 ya mergeadas y desplegadas)**

Crea una imagen de prueba pequeña y ejecútalo de verdad:

```bash
set -a && source .env && set +a
npm run subir-imagen -- /tmp/prueba.png "Imagen de prueba del pipeline de subida"
```

Expected: imprime `Subida nueva: https://img.techstudytracker.com/<hash>.png`
seguido del bloque JSON. Copia esa URL y ábrela directamente en el
navegador — debe mostrar la imagen. Vuelve a ejecutar el mismo comando con
el mismo archivo: debe imprimir `Ya existía, reutilizada: ...` con la MISMA
URL (confirma la deduplicación por hash).

- [ ] **Paso 5: Commit y PR**

```bash
git add scripts/dev/subir-imagen.mjs package.json
git commit -m "feat(scripts): script de subida de imágenes a R2 para Claude"
git push -u origin feat/script-subir-imagen
gh pr create --fill
```

Espera a que el CI esté en verde y mergea.

---

## Task 5: Drag&drop y pegado de imágenes en el editor de la lección

**Files:**
- Modify: `src/components/leccion/LeccionForm.tsx`
- Modify: `src/components/leccion/LeccionForm.test.tsx` (si no existe,
  créalo — comprueba primero con `find src -iname "LeccionForm.test*"`)

**Interfaces:**
- Consumes: `POST /api/imagenes-url-subida` de la Task 3 (mismo contrato).
- Consumes: `supabase` (cliente ya existente, `@/lib/supabaseClient`) para
  leer la sesión activa vía `supabase.auth.getSession()`.

- [ ] **Paso 1: Rama nueva**

```bash
git checkout main && git pull
git checkout -b feat/subir-imagen-en-editor
```

- [ ] **Paso 2: Test (falla primero)**

`src/components/leccion/LeccionForm.test.tsx` no existe todavía (verificado
al escribir este plan) — créalo con este contenido:

```tsx
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

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            uploadUrl: 'https://cuenta123.r2.cloudflarestorage.com/firmado',
            publicUrl: 'https://img.techstudytracker.com/abc123.png',
            yaExistia: false,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))

    render(<LeccionForm pending={false} onSubmit={vi.fn()} />)

    const textarea = screen.getByLabelText('Contenido en Markdown') as HTMLTextAreaElement
    const archivo = new File([new Uint8Array([1, 2, 3])], 'captura.png', {
      type: 'image/png',
    })

    fireEvent.drop(textarea, { dataTransfer: { files: [archivo] } })

    await waitFor(() => expect(textarea.value).toContain('"tipo": "imagen"'))
    expect(textarea.value).toContain('https://img.techstudytracker.com/abc123.png')
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/imagenes-url-subida',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
```

- [ ] **Paso 3: Confirmar que falla**

Run: `npm run test -- LeccionForm.test.tsx`
Expected: FAIL — el textarea no reacciona todavía al `drop`.

Si el test falla con un error relacionado con `crypto.subtle` no definido
en el entorno de test (jsdom), añade este stub al principio del archivo de
test, antes del `describe`:

```tsx
import { webcrypto } from 'node:crypto'

if (!globalThis.crypto?.subtle) {
  vi.stubGlobal('crypto', webcrypto)
}
```

- [ ] **Paso 4: Implementar el manejador de subida**

En `src/components/leccion/LeccionForm.tsx`, añade a los imports:

```typescript
import { useCallback, useRef, type ClipboardEvent, type DragEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
```

(fusiona el `useCallback, useRef` con el `useEffect, useState` que ya se
importa de `'react'` en una sola línea de import).

Dentro del componente `LeccionForm`, justo después de la desestructuración
de `useForm` existente (`const { register, handleSubmit, setError, reset, control, formState } = ...`),
añade `setValue` a esa misma desestructuración, y el resto de este bloque:

```typescript
const { register, handleSubmit, setError, reset, control, formState, setValue } =
  useForm<LeccionFields>({ defaultValues: defaults(leccion) })

const textareaRef = useRef<HTMLTextAreaElement | null>(null)
const [subiendoImagen, setSubiendoImagen] = useState(false)
const [errorImagen, setErrorImagen] = useState('')

const subirImagenEnCursor = useCallback(
  async (archivo: File) => {
    setErrorImagen('')
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!tiposPermitidos.includes(archivo.type)) {
      setErrorImagen('Solo se admiten imágenes PNG, JPEG, WebP o SVG.')
      return
    }

    setSubiendoImagen(true)
    try {
      const bytes = await archivo.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
      const sha256 = Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')

      const { data: sesion } = await supabase.auth.getSession()
      const token = sesion.session?.access_token
      if (!token) throw new Error('No hay sesión activa.')

      const respuestaFirma = await fetch('/api/imagenes-url-subida', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentType: archivo.type, sha256 }),
      })
      if (!respuestaFirma.ok) {
        throw new Error(`La función devolvió ${respuestaFirma.status}`)
      }
      const { uploadUrl, publicUrl, yaExistia } = await respuestaFirma.json()

      if (!yaExistia) {
        const respuestaSubida = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': archivo.type },
          body: bytes,
        })
        if (!respuestaSubida.ok) {
          throw new Error(`La subida a R2 falló con estado ${respuestaSubida.status}`)
        }
      }

      const bloque = `\`\`\`laboratorio\n${JSON.stringify(
        { tipo: 'imagen', src: publicUrl, alt: archivo.name.replace(/\.[^.]+$/, '') },
        null,
        2,
      )}\n\`\`\`\n`

      const textarea = textareaRef.current
      const valorActual = textarea?.value ?? ''
      const inicio = textarea?.selectionStart ?? valorActual.length
      const fin = textarea?.selectionEnd ?? valorActual.length
      const nuevoValor = valorActual.slice(0, inicio) + bloque + valorActual.slice(fin)
      setValue('contenido', nuevoValor, { shouldDirty: true })
    } catch (error) {
      setErrorImagen(error instanceof Error ? error.message : 'No se pudo subir la imagen.')
    } finally {
      setSubiendoImagen(false)
    }
  },
  [setValue],
)

const manejarDrop = useCallback(
  (event: DragEvent<HTMLTextAreaElement>) => {
    const archivo = event.dataTransfer.files[0]
    if (!archivo) return
    event.preventDefault()
    void subirImagenEnCursor(archivo)
  },
  [subirImagenEnCursor],
)

const manejarPaste = useCallback(
  (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const archivo = [...event.clipboardData.items]
      .find((item) => item.type.startsWith('image/'))
      ?.getAsFile()
    if (!archivo) return
    event.preventDefault()
    void subirImagenEnCursor(archivo)
  },
  [subirImagenEnCursor],
)

const { ref: contenidoRef, ...contenidoRegister } = register('contenido')
```

- [ ] **Paso 5: Conectar el manejador al textarea**

Sustituye el `<textarea id="leccion-contenido" ...>` existente (el que
lleva `{...register('contenido')}`) por:

```tsx
<textarea
  id="leccion-contenido"
  rows={20}
  maxLength={200_000}
  placeholder="Escribe la lección en Markdown…"
  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
  aria-invalid={Boolean(formState.errors.contenido)}
  aria-describedby="leccion-contenido-error leccion-contenido-imagen-ayuda"
  onDrop={manejarDrop}
  onPaste={manejarPaste}
  ref={(el) => {
    contenidoRef(el)
    textareaRef.current = el
  }}
  {...contenidoRegister}
/>
{subiendoImagen && (
  <p role="status" className="text-sm text-muted-foreground">
    Subiendo imagen…
  </p>
)}
{errorImagen && (
  <p role="alert" className="text-sm text-destructive">
    {errorImagen}
  </p>
)}
<p id="leccion-contenido-imagen-ayuda" className="text-xs text-muted-foreground">
  Arrastra o pega una imagen aquí para subirla e insertar el bloque
  automáticamente.
</p>
```

- [ ] **Paso 6: Confirmar que el test pasa**

Run: `npm run test -- LeccionForm.test.tsx`
Expected: PASS

- [ ] **Paso 7: Autorrevisión de seguridad**

Repasa el diff contra `.claude/agents/security-code-vulns.md` (código
nuevo en un componente ya existente, manejo de `File`/`fetch` desde el
navegador).

- [ ] **Paso 8: Suite completa + build + lint**

Run: `npm run test && npm run build && npm run lint`
Expected: los tres en verde.

- [ ] **Paso 9: Commit y PR**

```bash
git add src/components/leccion/LeccionForm.tsx src/components/leccion/LeccionForm.test.tsx
git commit -m "feat(admin): subir imágenes arrastrándolas o pegándolas en el editor"
git push -u origin feat/subir-imagen-en-editor
gh pr create --fill
```

Espera a que el CI esté en verde y mergea.

---

## Task 6: Auditoría de seguridad final y verificación end-to-end real

**Files:**
- Create: `security/reviews/2026-09-04-imagenes-en-lecciones.md`

- [ ] **Paso 1: Auditoría completa**

Con todas las Tasks anteriores ya mergeadas en `main`, ejecuta
`/security-review` (o, si el entorno no lo permite, recorre a mano los 8
checklists de `.claude/agents/security-*.md` contra el diff completo de
`main` desde antes de la Task 1) centrado en: RLS/autenticación de la Task
3, secretos/variables de entorno de las Tasks 1 y 3, la dependencia nueva
de la Task 3, e inyección/XSS en cómo se renderiza `src`/`alt`/`titulo` en
`Imagen.tsx` de la Task 2.

Guarda el resultado en `security/reviews/2026-09-04-imagenes-en-lecciones.md`
siguiendo `security/reviews/README.md`. Si aparece algún hallazgo
High/Medium, arréglalo antes de continuar (nueva rama corta,
`fix/<hallazgo>`, PR, merge) y vuelve a este paso.

- [ ] **Paso 2: Verificación end-to-end real — camino del navegador**

Entra al admin real (`https://techstudytracker.com/admin/...`) con tu
cuenta de admin, abre una lección de prueba (o crea un borrador), arrastra
una imagen real al textarea de contenido. Confirma con tus propios ojos:
aparece "Subiendo imagen…", luego el bloque `imagen` en el textarea, y al
guardar y abrir la lección publicada, la imagen se ve en la página real
(usa Playwright para la captura, no solo lo que veas tú en el navegador).

- [ ] **Paso 3: Verificación end-to-end real — camino del script**

Repite el Paso 4 de la Task 4 con una imagen distinta, y añade el bloque
resultante a un `.md` real de `contenido/` de una lección de prueba,
sincronízalo con el flujo Playwright ya establecido en esta sesión, y
confirma visualmente que se ve bien en la lección real.

- [ ] **Paso 4: Limpieza**

Borra de R2 (pestaña Objects del bucket) cualquier imagen de prueba que
hayas subido durante las verificaciones de este plan que no vaya a quedar
referenciada por contenido real.
