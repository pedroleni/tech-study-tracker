# Revisión de seguridad — lecciones

**Fecha:** 2026-08-14  
**Alcance:** rama `feat/lecciones`: migración `0004`, nueva tabla y RLS de
`lecciones`, cambio de comentarios a `leccion_id`, GRANTs por columna, capa de
datos, caché, formulario/rutas y renderizado Markdown.  
**Método:** precedentes de `security/security-review-instructions.md`, revisión
manual con los checklists `security-auth-crypto`, `security-injection` y
`security-code-vulns`, y los 5 scanners de `scripts/security/`.

## Resumen ejecutivo

- **Nivel de riesgo residual local:** LOW.
- **Risk score:** **0/100** (0 CRITICAL, 0 HIGH, 0 MEDIUM, 0 LOW).
- **Hallazgos High/Medium con >80% de confianza:** ninguno.
- **Top 3:** no aplica; ningún hallazgo superó el umbral de reporte.
- **Estado remoto:** la migración no se aplicó ni se intentó aplicar. Las
  pruebas con anónimo, usuario registrado y admin siguen siendo un gate manual
  después de ejecutar `0004` en el SQL Editor.

## Hallazgos por severidad

No se identificaron hallazgos CRITICAL, HIGH ni MEDIUM en el diff revisado.

## Controles verificados

### RLS, relaciones y privilegios

- `public.lecciones` habilita RLS antes de conceder acceso al Data API
  (`supabase/migrations/0004_lecciones.sql:19`).
- La lectura pública exige simultáneamente lección `publicado`, tecnología
  `completado` y propietario admin; la segunda rama solo concede al admin la
  auto-vista de sus borradores (`0004_lecciones.sql:23`).
- INSERT/UPDATE/DELETE de lecciones comprueban propiedad y rol admin sin exigir
  que la tecnología padre ya esté publicada (`0004_lecciones.sql:46`).
- `technology_id` no está concedido para UPDATE y `status` no está concedido
  para INSERT. El cliente también construye allowlists distintas para alta y
  edición, por lo que el alta no envía `status`
  (`src/lib/queries/lecciones.ts:11`).
- El cambio `comments.technology_id` → `comments.leccion_id`, el reemplazo de
  `private.comment_write_is_valid()` y las policies nuevas están en la misma
  transacción (`0004_lecciones.sql:1`, `0004_lecciones.sql:90`,
  `0004_lecciones.sql:98`, `0004_lecciones.sql:212`).
- El trigger conserva inmutables identidad, propietario, lección, padre y fecha
  de creación, y mantiene el límite de un nivel de respuestas
  (`0004_lecciones.sql:108`).
- Las policies de SELECT/INSERT/UPDATE de comentarios repiten explícitamente
  los gates de lección y tecnología publicadas; `comments_delete_own_or_admin`
  no se modifica (`0004_lecciones.sql:139`).
- Los GRANTs de ambas tablas son explícitos por operación y columna
  (`0004_lecciones.sql:200`).

### Caché y rutas

- Las listas y detalles de lecciones usan query keys separadas por identidad;
  los borradores descargados por el admin no comparten key con la vista pública
  (`src/lib/queries/queryKeys.ts:8`). El borrado global de caché en
  `SIGNED_OUT` ya existente también cubre estas claves.
- Las rutas de administración nuevas están dentro de `AdminRoute`; la
  autorización efectiva continúa en RLS.
- Los comentarios reciben e invalidan caché por `leccionId`, sin referencias
  residuales a `technology_id` en su capa de datos.

### Inyección y contenido no confiable

- `lecciones.contenido` y `comments.body` se renderizan con `SafeMarkdown`
  (`src/routes/LeccionPage.tsx:89`,
  `src/components/comment/CommentsSection.tsx:155`).
- `SafeMarkdown` sigue sin `rehype-raw` ni `dangerouslySetInnerHTML`, permite
  enlaces solo `http:`/`https:` y sustituye cualquier imagen Markdown por su
  texto alternativo (`src/components/content/SafeMarkdown.tsx:8`).
- Los parámetros de ruta llegan a filtros de `supabase-js`; no existe SQL ni
  RPC construido por concatenación.
- El formulario valida título, resumen, contenido, orden y estado con Zod; el
  servidor conserva además los límites y checks de la migración.

## Evidencia de validación local

Ejecutados en el orden requerido después de terminar el código:

- `npx tsc --noEmit`: correcto.
- `npm run lint`: correcto, sin warnings.
- `npx vitest run`: **132/132 tests**, 22 archivos.
- `npm run build`: correcto; Vite solo informa del warning no relacionado con
  seguridad de un chunk de 801.19 kB (234.42 kB gzip).

Scanners:

- `scan_code_patterns.sh`: sin patrones vulnerables.
- `scan_configs.sh`: sin problemas de configuración.
- `scan_dependencies.sh`: sin problemas de supply chain; 0 vulnerabilidades
  critical/high/moderate reportadas por `npm audit`.
- `scan_prompt_injection.sh`: sin indicadores.
- `scan_secrets.sh`: 0 hallazgos.

## Validación remota pendiente

Por instrucción del alcance no se accedió a Supabase remoto. Tras aplicar la
migración manualmente, aún hay que probar contra la API real:

- borrador de lección invisible para no-admin incluso con UUID/slug conocido;
- lección publicada invisible si la tecnología no está `completado`;
- comentario nuevo contra borrador e ID inexistente rechazados sin oráculo;
- PATCH de comentario sin posibilidad de mover `leccion_id`;
- SELECT de lecciones con anónimo, usuario registrado y admin;
- rechazo de columnas ausentes en los GRANTs de INSERT/UPDATE.

## Prioridad de remediación

- **P0/P1/P2:** ningún hallazgo pendiente.
- **Gate de despliegue:** aplicar `0004` manualmente y completar la matriz de
  identidades/GRANTs anterior antes de considerar verificado el entorno remoto.

## Estado

- [x] Revisión estática de RLS, roles, relaciones y GRANTs completada.
- [x] Revisión de Markdown, URLs e inyección completada.
- [x] Scanners y suite local completos y verdes.
- [ ] Validación contra la API real pendiente de que el usuario aplique `0004`.
