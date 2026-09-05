# Auditoría de seguridad — Imágenes en lecciones

**Fecha:** 2026-09-06
**Alcance:** feature completa "imágenes en lecciones" — subida y lectura
de imágenes vía Cloudflare R2 intermediado por Vercel, sin exponer nunca
credenciales de R2 ni ninguna IP de Cloudflare al navegador (pivote de
diseño tras el bloqueo judicial de LaLiga sobre IPs compartidas de
Cloudflare). Commits `6c28dec..434e52a` (Tasks 1-5 de
`docs/superpowers/plans/2026-09-04-imagenes-en-lecciones.md`).
**Método:** 8 subagentes especializados (`.claude/agents/security-*.md`)
en paralelo, cada uno acotado explícitamente al conjunto de ficheros de
esta feature (no al repo completo).

Ficheros auditados:

```
.env.example                                        (modificado)
api/imagenes.ts                                      (nuevo)
api/imagenes.test.ts                                 (nuevo)
api/imagenes-servir.ts                               (nuevo)
api/imagenes-servir.test.ts                          (nuevo)
package.json                                         (modificado — @aws-sdk/client-s3@3.1126.0)
package-lock.json                                    (modificado)
scripts/dev/subir-imagen.mjs                         (nuevo)
src/components/bloques-laboratorio/Imagen.tsx        (nuevo)
src/components/bloques-laboratorio/Imagen.test.tsx   (nuevo)
src/components/bloques-laboratorio/registro.ts       (modificado)
src/components/leccion/LeccionForm.tsx               (modificado)
src/components/leccion/LeccionForm.test.tsx          (nuevo)
src/lib/laboratorio/schemas.ts                       (modificado — esquemaImagen)
src/lib/laboratorio/schemas.test.ts                  (modificado)
vercel.json                                          (modificado — rewrite /img/:clave)
docs/superpowers/plans/2026-09-04-imagenes-en-lecciones.md    (nuevo)
docs/superpowers/specs/2026-09-04-imagenes-en-lecciones-design.md (nuevo)
```

Contexto de precedente consultado por varios subagentes (no modificado
por esta feature): `src/lib/hooks/useProfile.ts`,
`src/components/auth/AdminRoute.tsx`,
`supabase/migrations/0002_profiles.sql`,
`src/components/bloques-laboratorio/BloqueLaboratorio.tsx`,
`src/components/content/SafeMarkdown.tsx`.

---

## Resumen ejecutivo

- **Nivel de riesgo global: LOW** (sin hallazgos CRITICAL, HIGH ni MEDIUM)
- **Risk score: 2/100** (2 hallazgos LOW × 1)
- **Conteo de hallazgos por severidad:** 0 CRITICAL, 0 HIGH, 0 MEDIUM, 2 LOW, 2 INFO
- **Top hallazgos:**
  1. LOW — lookup de objeto plano en `EXTENSIONES_PERMITIDAS[contentType]` sin `Object.hasOwn`, forma de prototype-pollution-lookup sin explotación real encontrada.
  2. LOW — el `Content-Type` declarado por el cliente al subir no se valida contra los bytes reales (magic numbers); mitigado por 3 capas independientes ya presentes (SVG excluido, Content-Type recalculado por extensión al servir, `nosniff` global).
  3. INFO — una imagen de una lección todavía en borrador es accesible por su URL pública (sin sesión) si se conoce el hash exacto — diseño deliberado (ruta de lectura pública, como cualquier imagen embebida en la web), no un bug.

## Hallazgos por severidad

### LOW

**1. Lookup de objeto plano sin `Object.hasOwn` — `api/imagenes.ts:58`**
- **Descripción:** `EXTENSIONES_PERMITIDAS[contentType]` indexa un objeto
  literal directamente con el `Content-Type` que declara el llamante. Con
  `Content-Type: __proto__`, el lookup devuelve `Object.prototype`
  (veraz), lo que en teoría evita el `if (!extension)`.
- **Por qué no es explotable hoy:** la `clave` resultante
  (`<hash>.[object Object]`) nunca matchea `CLAVE_VALIDA` en
  `api/imagenes-servir.ts` (`^[0-9a-f]{64}\.(png|jpg|jpeg|webp)$`), así
  que el objeto ni se podría leer de vuelta ni el ataque tiene ningún
  efecto observable. Solo un admin ya autenticado puede llegar a esta
  línea.
- **Recomendación (endurecimiento, no urgente):** sustituir por
  `Object.hasOwn(EXTENSIONES_PERMITIDAS, contentType) ? EXTENSIONES_PERMITIDAS[contentType] : undefined`,
  o usar un `Map` en vez de un objeto literal. Cambio mecánico, sin
  impacto de comportamiento en ningún caso real.

**2. Content-Type declarado sin verificar magic bytes — `api/imagenes.ts:57-64`**
- **Descripción:** la función confía en la cabecera `Content-Type` que
  envía el llamante para decidir la extensión con la que se guarda el
  archivo, sin comprobar los bytes reales del archivo.
- **Por qué no es explotable hoy:** tres capas independientes ya
  presentes neutralizan el único vector real (XSS vía tipo servido
  incorrecto): (a) `image/svg+xml` está excluido explícitamente de
  `EXTENSIONES_PERMITIDAS`, el único formato de imagen con ejecución de
  script; (b) `api/imagenes-servir.ts` recalcula el `Content-Type` de
  respuesta siempre a partir de la extensión de la *clave* de R2, nunca
  de un metadato que el subidor pudiera controlar; (c) `vercel.json`
  fija `X-Content-Type-Options: nosniff` en todas las rutas, impidiendo
  que el navegador reinterprete el contenido por sniffing.
- **Recomendación (opcional):** validar magic bytes (p. ej. cabecera
  `\x89PNG`, `\xFF\xD8\xFF` para JPEG, `RIFF...WEBP`) antes de subir,
  como defensa en profundidad adicional — no urgente dado el actor único
  (admin ya autorizado) y las tres capas ya existentes.

### INFO

**3. Imagen de una lección en borrador accesible sin sesión por su URL directa**
- `GET /img/:clave` es pública por diseño (documentado explícitamente en
  el spec: cacheable para siempre, sin auth, como cualquier imagen
  normal de una web). Esto significa que una imagen subida a una lección
  aún no publicada es accesible por cualquiera que conozca su URL exacta
  (p. ej. visible en el Network tab durante una preview de admin).
- Impacto bajo: la clave es `sha256(contenido)` — no adivinable ni
  enumerable — y el contenido son capturas/diagramas ilustrativos de una
  lección técnica pública, no datos de otro usuario. Es arquitectura
  consciente (URL content-addressed, coherente con el resto del diseño),
  no un bug. Señalado para que quede documentado, en línea con la
  preferencia ya registrada de mostrar un borrador antes de publicar
  (`feedback_leccion-preview-antes-de-publicar`) — decisión de producto,
  no de seguridad, sobre si algún día importara ese matiz.

**4. Alcance del token de API de R2 no verificable desde el repo**
- El plan documenta correctamente (Task 1) que el token debe crearse con
  alcance "Apply to specific buckets only" → solo
  `techstudytracker-imagenes`, nunca toda la cuenta. Ese paso se ejecuta
  a mano en el panel de Cloudflare, fuera de control de versiones, así
  que esta auditoría (solo ficheros del repo) no puede confirmar que el
  token real respeta ese alcance. Recomendado: reconfirmar en Cloudflare
  → R2 → Manage API tokens que el token en uso sigue escopeado solo a
  ese bucket.

## Verificación activa de los vectores de mayor riesgo teórico

Además de leer el código, los subagentes probaron activamente romper los
puntos de mayor riesgo aparente, sin éxito:

- **Bypass de `esquemaImagen.src.startsWith('https://www.techstudytracker.com/img/')`**:
  probado contra userinfo (`user@host`), subdominio/dominio similar,
  puerto explícito y trailing dot — ninguno pasa la validación con un
  host distinto, porque el prefijo exigido incluye el primer `/` tras el
  hostname, cerrando la sección de autoridad antes de que pueda
  aparecer un `@` de userinfo.
- **Path traversal / SSRF en `CLAVE_VALIDA`**: probado con
  `../../etc/passwd`, percent-encoding, longitud, sin flag `m` en el
  regex (evita bypass de fin de cadena con newline) — ninguno elude la
  validación; confirmado también con tests explícitos en el propio
  código.
- **Auth/RLS de `api/imagenes.ts`**: confirmado que usa
  `supabase.auth.getUser(token)` (validación real contra Supabase Auth,
  no decode local) + un cliente con el JWT del usuario en cabeceras para
  que `profiles_select_own` (`id = auth.uid()`) se aplique de verdad —
  mismo patrón ya aprobado en el resto del proyecto, sin atajos vía
  `service_role` ni `user_metadata`.

## Prioridad de remediación

- **P0/P1 (inmediato/este sprint):** ninguno — no hay hallazgos CRITICAL,
  HIGH ni MEDIUM.
- **P2 (opcional, cuando convenga):** los dos LOW de endurecimiento
  (`Object.hasOwn`, validación de magic bytes) — ninguno bloquea nada.

## Estado

- [x] Auditoría completa realizada — 8/8 dominios, 0 hallazgos High/Medium/Critical.
- [ ] Hallazgo LOW #1 (`Object.hasOwn`) — pendiente, opcional.
- [ ] Hallazgo LOW #2 (magic bytes) — pendiente, opcional.
- [x] Hallazgo INFO #3 (imagen de borrador accesible sin sesión) — aceptado como diseño consciente, sin acción.
- [ ] Hallazgo INFO #4 (alcance real del token de R2) — pendiente de reconfirmación manual del usuario en el panel de Cloudflare.
