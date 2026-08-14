# Revisión de seguridad — fix de RLS en `0004_lecciones.sql` (post-aplicación real)

**Alcance:** `/security-review solo RLS`, acotada al commit
`41afcda` (`fix(lecciones): dropear políticas de comments antes de
quitar technology_id`) sobre `feat/lecciones`, más una relectura
independiente del resto de la superficie RLS que ese commit toca
(`lecciones`, `comments`), ahora que la migración ya está aplicada de
verdad en el proyecto Supabase remoto.

**Metodología — nota honesta:** el entorno activo de esta sesión no
expone los 8 subagentes de `.claude/agents/security-*.md` como agentes
lanzables de forma independiente (no aparecen en la lista de tipos de
agente disponibles). Sigo el fallback ya documentado en `AGENTS.md`
para este caso: leo `.claude/agents/security-auth-crypto.md` y
`security/security-review-instructions.md` como checklist, y reviso el
diff/código yo mismo en vez de delegarlo. Esto es más débil que una
pasada verdaderamente independiente (mismo contexto, no uno limpio),
pero se complementa con algo que la revisión estática de
`security/reviews/2026-08-14-lecciones.md` (hecha antes de aplicar la
migración) no tenía: **verificación real contra la API de Supabase en
producción con `curl`, las tres identidades (anónimo, registrado, admin
dueño), tras aplicar la migración corregida** — ver detalle abajo.

## Resumen ejecutivo

- **Nivel de riesgo:** Bajo.
- **Risk score:** 0/100.
- **Hallazgos High/Medium:** 0.
- El fix en sí (`drop policy if exists` × 3 antes del `alter table ...
  drop column`) es puramente de *ordering* de DDL — no cambia el
  significado de ninguna política, solo permite que la migración se
  aplique. No introduce superficie nueva.

## Verificación real (no solo lectura de SQL)

Contra el proyecto Supabase real, con JWT reales de una cuenta admin
(`profiles.role='admin'`), una cuenta registrada normal y sin sesión
(anon):

| Caso | Resultado |
|---|---|
| Lección en `borrador` — anónimo | No visible ✓ |
| Lección en `borrador` — registrado | No visible ✓ |
| Lección en `borrador` — admin dueño | Visible ✓ |
| Insertar lección — registrado | Rechazado (`42501`, RLS) ✓ |
| Insertar lección — anónimo | Rechazado (permission denied a nivel de `GRANT`) ✓ |
| Editar/borrar lección ajena — registrado | Rechazado (0 filas) ✓ |
| Lección `publicado` + tecnología `completado` — anónimo/registrado | Visible ✓ |
| Comentar lección publicada — registrado | Permitido ✓ |
| Ver comentario vía `leccion_id` (el rename de este fix) — anónimo | Visible ✓ |
| Insertar comentario — anónimo | Rechazado ✓ |
| Editar comentario ajeno — admin (no autor) | Rechazado (0 filas) ✓ |

Datos de prueba creados y borrados en cascada tras la verificación, sin
residuo.

## Puntos del checklist de `security-auth-crypto.md` revisados

- **`enable row level security` en `lecciones`:** presente
  (`0004_lecciones.sql`) — este fue justo el hallazgo que la primera
  ronda de crítica adversarial de la spec detectó antes de implementar;
  confirmado que sigue presente en el SQL final aplicado.
- **`private.comment_write_is_valid()`:** recreada con
  `security invoker`, `set search_path = ''`, nombres cualificados —
  mismo patrón que la versión anterior, solo cambia `technology_id` →
  `leccion_id` en los tres sitios que lo referenciaban. Los cinco campos
  inmutables (`id`, `user_id`, `leccion_id`, `parent_comment_id`,
  `created_at`) coinciden exactamente con el precedente documentado en
  `security-review-instructions.md`.
- **`GRANT` por columna (`lecciones`, `comments`):** ni `id` ni
  `created_at`/`updated_at` son escribibles; `technology_id` está en
  `insert` pero no en `update` de `lecciones` (no reparenting);
  `leccion_id` está en `insert` pero no en `update` de `comments`
  (comentario no se puede mover de lección) — coincide con la decisión
  documentada en `specs/features/lecciones.md`.
- **Caché separada por identidad / vaciado en `SIGNED_OUT`:**
  `src/lib/hooks/useAuth.ts:18` llama `queryClient.clear()` en el
  evento `SIGNED_OUT` de `supabase.auth.onAuthStateChange`, con test
  dedicado (`useAuth.test.ts:84`, "clears cached private data when
  Supabase emits SIGNED_OUT"). Cubre el precedente de
  `security-review-instructions.md` sobre no reutilizar borradores de
  admin cacheados tras cerrar sesión — no es un hallazgo nuevo de este
  fix, pero es un punto explícito del checklist y no estaba verificado
  todavía en esta sesión.
- **`private.is_admin`:** sin cambios en este commit, sigue sin ser
  invocable como RPC expuesta (`revoke all ... from public`, sin
  `grant execute` a `anon`/`authenticated` directamente sobre la
  función salvo el ya existente y ya revisado en `0003`).

## Prioridad de remediación

Ninguna — sin hallazgos High/Medium.

## Estado

- No hay hallazgos pendientes de esta revisión.
- Pendiente real, no de seguridad: merge de `feat/lecciones` a `main`
  (PR #18), a la espera de confirmación explícita del usuario.
