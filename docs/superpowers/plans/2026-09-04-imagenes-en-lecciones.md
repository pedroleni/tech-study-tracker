# Imágenes en lecciones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Nota específica de este proyecto:** en `tech-study-tracker`, el código
> (TypeScript/React) lo escribe Codex, no el ejecutor de este plan
> directamente — cada Task de código se pasa a Codex vía
> `npm run codex:task -- "<prompt>" <effort>` (monitor real en
> `npm run codex:monitor`, `localhost:4545`; confírmalo arrancado antes de
> lanzar la primera tarea), y quien ejecuta este plan hace la verificación
> real después (Codex no tiene red/Chromium en su sandbox, y tampoco puede
> escribir en `.git` ni hacer push — deja el handoff exacto y hay que
> completarlo a mano). Task 1 la ejecuta el usuario (panel de Cloudflare,
> fuera del repo).
>
> **Revisión 2026-09-05:** este plan sustituye el diseño original de la
> Task 3 (URL prefirmada + dominio personalizado de R2). Al ejecutar la
> Task 1 se descubrió que `img.techstudytracker.com` resolvía a IPs
> (`188.114.96.5`/`97.5`) bloqueadas por el auto judicial de LaLiga contra
> la piratería en España, documentadas públicamente en la comunidad de
> Cloudflare — confirmado con el certificado autofirmado real servido en
> esa conexión y la página de bloqueo real del ISP. R2 no permite poner un
> dominio personalizado en modo "DNS only" (a diferencia de una zona
> normal), así que no hay forma de esquivarlo dentro del propio R2. Nuevo
> diseño: el navegador nunca resuelve una IP de Cloudflare — sube y lee las
> imágenes exclusivamente a través de `techstudytracker.com` (Vercel), que
> hace de intermediario con R2 por la API S3 autenticada. Ver
> `docs/superpowers/specs/2026-09-04-imagenes-en-lecciones-design.md`
> (ya actualizado) para el detalle completo. **La Task 2 (esquema +
> componente) ya está implementada con el diseño ANTIGUO del dominio — su
> último paso en este plan revisado la corrige.**

**Goal:** Los admins pueden embeber imágenes reales (capturas, diagramas) en
el contenido de las lecciones, alojadas en Cloudflare R2 pero servidas
siempre a través de `techstudytracker.com`, sin exponer nunca credenciales
de R2 en el navegador y sin depender de ninguna IP de Cloudflare alcanzable
directamente desde España.

**Architecture:** Dos funciones serverless de Vercel: `POST /api/imagenes`
recibe el archivo, verifica (vía Supabase Auth + la RLS ya existente en
`profiles`) que quien sube es admin, y lo guarda en R2 directamente desde el
servidor. `GET /img/:clave` (vía rewrite a una función) lee ese mismo objeto
de R2 y lo sirve con caché larga — el navegador del visitante solo habla con
Vercel. Un bloque nuevo `imagen` en `esquemaBloqueLaboratorio` + su
componente `Imagen.tsx` renderizan el resultado.

**Tech Stack:** Vite + React + TypeScript, Zod, Supabase (`@supabase/supabase-js`),
Vercel Functions (Web `Request`/`Response`, sin `@vercel/node`),
`@aws-sdk/client-s3` (SDK de AWS, compatible con R2 vía su API S3), Vitest +
Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-04-imagenes-en-lecciones-design.md`

## Global Constraints

- Las credenciales de R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) nunca
  viven en código de frontend ni en variables `VITE_*` — solo como
  variables de entorno de Vercel (server-side) y en un `.env` local
  gitignored. R2 no tiene ningún dominio público conectado — solo se accede
  vía su API S3, autenticada, desde las funciones de Vercel.
- El bloque `imagen` restringe `src` a `https://www.techstudytracker.com/img/`
  — nunca una URL externa arbitraria, y nunca un dominio de R2/Cloudflare
  directamente.
- `alt` es obligatorio en el esquema del bloque `imagen`; `titulo` es
  opcional.
- La comprobación de admin se apoya en la política RLS ya existente
  `profiles_select_own` (`id = auth.uid()`) — nunca en `user_metadata` ni en
  claims del JWT sin pasar por esa tabla, y nunca con la `service_role key`.
- **Límite real de Vercel Functions: 4.5 MB como máximo, tanto en el cuerpo
  de la petición como en el de la respuesta** (verificado contra la
  documentación oficial de Vercel, no supuesto). La función de subida
  rechaza cualquier archivo por encima de 4 MB (con margen de seguridad),
  y esa misma cota garantiza que la función de lectura nunca intente
  devolver una respuesta por encima del límite.
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

## Task 1: Bucket de R2, token y variables de entorno (sin dominio)

**Quién ejecuta esto:** el usuario, con las instrucciones exactas de abajo
— no es código, vive en los paneles de Cloudflare y Vercel. **Ya NO hace
falta ningún dominio personalizado** (`img.techstudytracker.com` queda
descartado por el hallazgo del bloqueo de LaLiga, ver la nota de arriba) —
el bucket se queda privado, solo accesible vía su API S3 desde las
funciones de la Task 3.

**Archivos:**
- Modificar: `.env.example` (documentar los nombres de las variables
  nuevas, sin valores reales)

- [ ] **Paso 1: Crear el bucket de R2**

Panel de Cloudflare → R2 → **Create bucket**:
- Nombre: `techstudytracker-imagenes`
- Ubicación: automática (Cloudflare la elige)

Si ya lo creaste en el intento anterior (con el diseño del dominio), no
hace falta recrearlo — solo asegúrate de que la pestaña **Custom Domains**
del bucket no tenga ningún dominio conectado (si `img.techstudytracker.com`
quedó conectado, desconéctalo desde ahí: **Custom Domains** →
`img.techstudytracker.com` → **Disable/Remove**).

- [ ] **Paso 2: Crear el token de API de R2**

Panel de Cloudflare → R2 → **Manage API tokens** → **Create API token**:
- Permisos: **Object Read & Write**
- Alcance: **Apply to specific buckets only** → selecciona
  `techstudytracker-imagenes` (nunca "Apply to all buckets")
- Crea el token y copia los tres valores que te muestra UNA sola vez:
  Account ID, Access Key ID, Secret Access Key.

- [ ] **Paso 3: Variables de entorno en Vercel**

Vercel → Project → Settings → **Environment Variables**, añade estas
cuatro (marca **Production** y **Preview**, NO las prefijes con `VITE_` —
deben quedar solo del lado servidor):

| Nombre | Valor |
|---|---|
| `R2_ACCOUNT_ID` | el Account ID del Paso 2 |
| `R2_ACCESS_KEY_ID` | el Access Key ID del Paso 2 |
| `R2_SECRET_ACCESS_KEY` | el Secret Access Key del Paso 2 |
| `R2_BUCKET_NAME` | `techstudytracker-imagenes` |

- [ ] **Paso 4: Variables de entorno locales**

En tu `.env` local (ya gitignored, no lo toques en git) añade las mismas
cuatro variables con los mismos valores reales, más estas dos para el
script de subida de la Task 4 (usa la cuenta admin que ya usas para el
resto del proyecto):

```
ADMIN_EMAIL=tu-email-de-admin
ADMIN_PASSWORD=tu-contraseña-de-admin
```

- [ ] **Paso 5: Documentar las variables en `.env.example` (esto sí es código)**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare R2 — solo servidor, nunca prefijadas con VITE_. Sin dominio
# público: se accede solo vía la API S3 desde api/imagenes.ts y
# api/imagenes-servir.ts.
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-bucket-name

# Solo para scripts/dev/subir-imagen.mjs
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

- [ ] **Paso 6: Commit**

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
antes de pasar a la Task 3. La verificación real de que el bucket + token
funcionan de verdad se hace en la Task 3 (leer y escribir un objeto real),
no hace falta un paso de verificación manual aparte aquí.

---

## Task 2: Esquema Zod del bloque `imagen` y su componente (implementada — falta corregir el dominio)

**Estado:** implementada por Codex el 2026-09-04 con el diseño ANTIGUO
(dominio de R2). Commit `743b2c0` en la rama `feat/bloque-imagen`, PR #45
abierto, CI en verde, TDD completo (5+3 tests nuevos, 355 tests en total,
build y lint verdes). **No hace falta repetir la Task 2 entera** — solo
falta este último paso para alinearla con el diseño revisado:

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts` (rama `feat/bloque-imagen`)
- Modify: `src/lib/laboratorio/schemas.test.ts` (misma rama)

- [ ] **Paso 1: Corregir el dominio restringido en el esquema**

En `src/lib/laboratorio/schemas.ts`, cambia:

```typescript
src: z.string().url().startsWith('https://img.techstudytracker.com/'),
```

por:

```typescript
src: z.string().url().startsWith('https://www.techstudytracker.com/img/'),
```

En `src/lib/laboratorio/schemas.test.ts`, sustituye las tres apariciones de
`https://img.techstudytracker.com/abc123.png` (en los tests
`esquemaImagen` que usan ese dominio, incluido el que espera rechazo por
dominio ajeno — ESE no lo toques, sigue usando `https://otro-sitio.com/...`
como ya estaba) por `https://www.techstudytracker.com/img/abc123.png`.

- [ ] **Paso 2: Confirmar que los tests siguen en verde**

Run: `npm run test -- schemas.test.ts`
Expected: PASS (los mismos 5 casos de `esquemaImagen`, ahora con el
dominio correcto)

- [ ] **Paso 3: Commit en la misma rama y push**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "fix(laboratorio): servir imagen desde techstudytracker.com/img, no un dominio de R2"
git push
```

Esto añade un commit al PR #45 ya abierto — espera a que el CI se
re-ejecute en verde antes de mergear.

---

## Task 3: Subir y servir imágenes a través de Vercel (sin exponer R2 al navegador)

**Files:**
- Create: `api/imagenes.ts` (subida)
- Create: `api/imagenes.test.ts`
- Create: `api/imagenes-servir.ts` (lectura)
- Create: `api/imagenes-servir.test.ts`
- Modify: `package.json` (nueva dependencia)
- Modify: `vercel.json` (rewrite de `/img/:clave` + excluir `api/` e
  `img/` del rewrite catch-all)

**Interfaces:**
- Produces: `POST /api/imagenes` — cuerpo: los bytes crudos del archivo,
  cabecera `Content-Type` con el mime real de la imagen (`image/png`,
  `image/jpeg` o `image/webp` — SVG queda fuera a propósito, ver la nota
  de seguridad más abajo) y
  `Authorization: Bearer <access_token>`. Respuesta 200:
  `{ publicUrl: "https://www.techstudytracker.com/img/<hash>.<ext>" }`. Usado
  por la Task 4 (script) y la Task 5 (drag&drop en el editor).
- Produces: `GET /img/<clave>` (público, sin autenticación — cualquiera
  puede VER una imagen ya subida, igual que cualquier imagen normal de una
  página web) — sirve los bytes con el `Content-Type` real y
  `Cache-Control: public, max-age=31536000, immutable`.

- [ ] **Paso 1: Rama nueva**

```bash
git checkout main && git pull
git checkout -b feat/imagenes-api
```

- [ ] **Paso 2: Instalar la dependencia, versión exacta fijada**

```bash
npm install --save-exact @aws-sdk/client-s3@3.1126.0
```

(Ya no hace falta `@aws-sdk/s3-request-presigner` — no hay URLs
prefirmadas en este diseño, las dos funciones hablan con R2 directamente
desde el servidor.)

Verifica que `package.json` guardó la versión SIN `^` delante, y que
`package-lock.json` cambió.

- [ ] **Paso 3: Rewrites en `vercel.json`**

Cambia:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  ...
}
```

por (el orden importa: la regla de `/img/` va ANTES del catch-all, y el
catch-all excluye explícitamente `api/` e `img/` como cinturón de
seguridad):

```json
{
  "rewrites": [
    { "source": "/img/:clave", "destination": "/api/imagenes-servir?clave=:clave" },
    { "source": "/((?!api/|img/).*)", "destination": "/index.html" }
  ],
  ...
}
```

- [ ] **Paso 4: Test de la función de subida (falla primero)**

Crea `api/imagenes.test.ts`:

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

  it('un admin con un archivo válido sube a R2 y devuelve la URL pública', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null })
    mockSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })
    mockSend.mockResolvedValue({})

    const respuesta = await handler.fetch(
      crearPeticion(BYTES_DE_PRUEBA, { authorization: 'Bearer token-admin' }),
    )
    const cuerpo = await respuesta.json()

    expect(respuesta.status).toBe(200)
    expect(cuerpo.publicUrl).toMatch(
      /^https:\/\/www\.techstudytracker\.com\/img\/[0-9a-f]{64}\.png$/,
    )
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Paso 5: Confirmar que falla**

Run: `npm run test -- api/imagenes.test.ts`
Expected: FAIL — `./imagenes` no existe.

- [ ] **Paso 6: Implementar la función de subida**

Crea `api/imagenes.ts`:

```typescript
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
    const extension = EXTENSIONES_PERMITIDAS[contentType]
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
```

- [ ] **Paso 7: Confirmar que el test de subida pasa**

Run: `npm run test -- api/imagenes.test.ts`
Expected: PASS (los 7 casos)

- [ ] **Paso 8: Test de la función de lectura (falla primero)**

Crea `api/imagenes-servir.test.ts`:

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSend = vi.fn()
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({ send: mockSend })),
  GetObjectCommand: vi.fn((input: unknown) => ({ __tipo: 'GetObjectCommand', input })),
}))

const { default: handler } = await import('./imagenes-servir')

function crearPeticion(clave: string) {
  return new Request(
    `https://techstudytracker.com/api/imagenes-servir?clave=${encodeURIComponent(clave)}`,
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
})
```

- [ ] **Paso 9: Confirmar que falla**

Run: `npm run test -- api/imagenes-servir.test.ts`
Expected: FAIL — `./imagenes-servir` no existe.

- [ ] **Paso 10: Implementar la función de lectura**

Crea `api/imagenes-servir.ts`:

```typescript
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
```

- [ ] **Paso 11: Confirmar que el test de lectura pasa**

Run: `npm run test -- api/imagenes-servir.test.ts`
Expected: PASS (los 3 casos)

- [ ] **Paso 12: Autorrevisión de seguridad (obligatoria, toca auth + secretos + dependencia nueva + una ruta pública nueva)**

Antes de abrir el PR, repasa tu propio diff contra:
- `.claude/agents/security-auth-crypto.md` (verificación de admin vía RLS
  en `api/imagenes.ts`, no vía JWT claims propios)
- `.claude/agents/security-secrets.md` (ninguna de las cuatro variables de
  R2 lleva prefijo `VITE_`; no hay ningún valor real hardcodeado en el
  código ni en los tests)
- `.claude/agents/security-supply-chain.md` (la dependencia nueva queda
  con versión exacta en `package.json`, sin `^`)
- `.claude/agents/security-code-vulns.md`, con atención concreta a
  `api/imagenes-servir.ts`: es una ruta PÚBLICA sin autenticación (a
  propósito, como cualquier imagen normal) — confirma que `CLAVE_VALIDA`
  hace imposible cualquier path traversal o acceso a una clave de R2 que
  no siga el patrón `<hash>.<extension>` exacto.

- [ ] **Paso 13: Suite completa + build + lint**

Run: `npm run test && npm run build && npm run lint`
Expected: los tres en verde.

- [ ] **Paso 14: Commit y PR**

```bash
git add api/imagenes.ts api/imagenes.test.ts \
  api/imagenes-servir.ts api/imagenes-servir.test.ts \
  package.json package-lock.json vercel.json
git commit -m "feat(api): subir y servir imágenes a través de Vercel, sin exponer R2"
git push -u origin feat/imagenes-api
gh pr create --fill
```

Espera a que el CI esté en verde y mergea.

- [ ] **Paso 15: Verificación real contra producción**

Tras el deploy de `main` (confirma con
`gh run list --branch main --limit 1` como en el resto de la sesión):

```bash
# El dominio raíz redirige (308) a www, que es el canónico real — usa
# siempre www aquí para no confundir un 308 esperado con un fallo real.

# Sin token: debe dar 401, no un 200 de index.html (si diera 200, revisa
# el Paso 3 — el rewrite se estaría comiendo la ruta).
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://www.techstudytracker.com/api/imagenes \
  -H "content-type: image/png" --data-binary @/dev/null

# Una clave inventada en /img/ debe dar 404 real, no la SPA.
curl -s -o /dev/null -w "%{http_code}\n" https://www.techstudytracker.com/img/no-existe.png
```

Expected: `401` y `404` respectivamente.

---

## Task 4: Script de subida para Claude

**Files:**
- Create: `scripts/dev/subir-imagen.mjs`
- Modify: `package.json` (nuevo script npm)

**Interfaces:**
- Consumes: `POST /api/imagenes` de la Task 3 (cuerpo = bytes crudos,
  cabecera `Content-Type` + `Authorization`).
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

Expected: imprime `Subida: https://www.techstudytracker.com/img/<hash>.png`
seguido del bloque JSON. Abre esa URL directamente en el navegador — debe
mostrar la imagen (servida por `api/imagenes-servir.ts`, no por R2
directamente). Vuelve a ejecutar el mismo comando con el mismo archivo:
debe devolver la MISMA URL sin error (confirma que subir el mismo
contenido dos veces no rompe nada).

- [ ] **Paso 5: Commit y PR**

```bash
git add scripts/dev/subir-imagen.mjs package.json
git commit -m "feat(scripts): script de subida de imágenes para Claude"
git push -u origin feat/script-subir-imagen
gh pr create --fill
```

Espera a que el CI esté en verde y mergea.

---

## Task 5: Drag&drop y pegado de imágenes en el editor de la lección

**Files:**
- Modify: `src/components/leccion/LeccionForm.tsx`
- Create: `src/components/leccion/LeccionForm.test.tsx` (no existe
  todavía — verificado al escribir este plan)

**Interfaces:**
- Consumes: `POST /api/imagenes` de la Task 3 (cuerpo = bytes crudos del
  `File`, cabecera `Content-Type` = `archivo.type`).
- Consumes: `supabase` (cliente ya existente, `@/lib/supabaseClient`) para
  leer la sesión activa vía `supabase.auth.getSession()`.

- [ ] **Paso 1: Rama nueva**

```bash
git checkout main && git pull
git checkout -b feat/subir-imagen-en-editor
```

- [ ] **Paso 2: Test (falla primero)**

Crea `src/components/leccion/LeccionForm.test.tsx`:

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
})
```

- [ ] **Paso 3: Confirmar que falla**

Run: `npm run test -- LeccionForm.test.tsx`
Expected: FAIL — el textarea no reacciona todavía al `drop`.

- [ ] **Paso 4: Implementar el manejador de subida**

En `src/components/leccion/LeccionForm.tsx`, añade a los imports:

```typescript
import { useCallback, useRef, type ClipboardEvent, type DragEvent } from 'react'
import { supabase } from '@/lib/supabaseClient'
```

(fusiona el `useCallback, useRef` con el `useEffect, useState` que ya se
importa de `'react'` en una sola línea de import).

Dentro del componente `LeccionForm`, añade `setValue` a la
desestructuración existente de `useForm`
(`const { register, handleSubmit, setError, reset, control, formState } = ...`),
y el resto de este bloque justo después:

```typescript
const { register, handleSubmit, setError, reset, control, formState, setValue } =
  useForm<LeccionFields>({ defaultValues: defaults(leccion) })

const textareaRef = useRef<HTMLTextAreaElement | null>(null)
const [subiendoImagen, setSubiendoImagen] = useState(false)
const [errorImagen, setErrorImagen] = useState('')

const subirImagenEnCursor = useCallback(
  async (archivo: File) => {
    setErrorImagen('')
    // Mismo conjunto que api/imagenes.ts — SVG queda fuera a propósito
    // (riesgo de XSS vía script embebido si alguien visita /img/<hash>.svg
    // directo, no como <img>).
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp']
    if (!tiposPermitidos.includes(archivo.type)) {
      setErrorImagen('Solo se admiten imágenes PNG, JPEG o WebP.')
      return
    }
    if (archivo.size > 4 * 1024 * 1024) {
      setErrorImagen('La imagen no puede superar 4 MB.')
      return
    }

    setSubiendoImagen(true)
    try {
      const { data: sesion } = await supabase.auth.getSession()
      const token = sesion.session?.access_token
      if (!token) throw new Error('No hay sesión activa.')

      const respuesta = await fetch('/api/imagenes', {
        method: 'POST',
        headers: { 'content-type': archivo.type, authorization: `Bearer ${token}` },
        body: archivo,
      })
      if (!respuesta.ok) {
        throw new Error(`La función devolvió ${respuesta.status}`)
      }
      const { publicUrl } = await respuesta.json()

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

Nótese que, al recibir el `File` directamente en `body: archivo` (en vez
de leerlo antes con `arrayBuffer()`), ya no hace falta calcular ningún
hash en el navegador — lo calcula el servidor a partir de los bytes que
recibe.

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
navegador, validación de tamaño en el cliente que además ya está aplicada
en el servidor — nunca confiar solo en el check del navegador).

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
- Create: `security/reviews/2026-09-05-imagenes-en-lecciones.md`

- [ ] **Paso 1: Auditoría completa**

Con todas las Tasks anteriores ya mergeadas en `main`, ejecuta
`/security-review` (o, si el entorno no lo permite, recorre a mano los 8
checklists de `.claude/agents/security-*.md` contra el diff completo de
`main` desde antes de la Task 1) centrado en: RLS/autenticación de
`api/imagenes.ts`, la ruta pública sin autenticación de
`api/imagenes-servir.ts` (path traversal, DoS por claves inválidas
repetidas), secretos/variables de entorno de las Tasks 1 y 3, la
dependencia nueva, e inyección/XSS en cómo se renderiza
`src`/`alt`/`titulo` en `Imagen.tsx` de la Task 2.

Guarda el resultado en `security/reviews/2026-09-05-imagenes-en-lecciones.md`
siguiendo `security/reviews/README.md`. Si aparece algún hallazgo
High/Medium, arréglalo antes de continuar (nueva rama corta,
`fix/<hallazgo>`, PR, merge) y vuelve a este paso.

- [ ] **Paso 2: Verificación end-to-end real — camino del navegador**

Entra al admin real (`https://www.techstudytracker.com/admin/...`) con tu
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

- [ ] **Paso 4: Confirmar que el bloqueo de LaLiga ya no aplica**

Repite la comprobación que originó el pivote de este plan: desde la misma
red donde se detectó el bloqueo, visita cualquier URL real de
`https://www.techstudytracker.com/img/...` y confirma que carga con
normalidad (candado válido, sin ningún aviso de "no seguro"). Es la
prueba definitiva de que el nuevo diseño resuelve el problema real, no
solo sobre el papel.

- [ ] **Paso 5: Limpieza**

Borra de R2 (pestaña Objects del bucket) cualquier imagen de prueba que
hayas subido durante las verificaciones de este plan que no vaya a quedar
referenciada por contenido real.
