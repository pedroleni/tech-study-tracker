# Revisión de seguridad — 2026-08-12

**Alcance:** `supabase/migrations/0001_init.sql` (esquema + RLS) y la
capa de auth (`src/lib/supabaseClient.ts`, `src/lib/hooks/useAuth.ts`,
`src/components/auth/*`, `src/routes/LoginPage.tsx`,
`src/routes/RegisterPage.tsx`) — PRs #5 y #6, antes de mergear.

Ejecutada con los subagentes reales (`security-auth-crypto`,
`security-injection`, `security-code-vulns`), no solo los scripts bash
de `scripts/security/` — esos ya se habían corrido por separado y
salieron limpios, pero no sustituyen la revisión de dominio que hace
cada checklist en `.claude/agents/`.

## Resumen ejecutivo

- **Nivel de riesgo:** Bajo tras el fix (era Medio antes).
- **Risk score:** MEDIUM×3 = 3/100 antes del fix; 0/100 después.
- **Top 3:**
  1. Enumeración de cuentas en el formulario de registro (MEDIUM) —
     arreglado en este mismo PR antes de mergear.
  2. RLS y los triggers de la migración, verificados correctos (no solo
     asumidos): `SECURITY INVOKER` en `category_belongs_to_user()` es la
     elección correcta, no un descuido.
  3. Superficie de inyección (XSS, URLs, logs) limpia — no hay nada que
     este diff toque que renderice contenido sin escapar.

## Hallazgos

### 1. Enumeración de cuentas vía mensaje de error de registro — MEDIUM (arreglado)
- **Archivo:** `src/components/auth/AuthForm.tsx` (antes de este fix, línea ~44)
- **Descripción:** el error de Supabase al registrarse con un email ya
  existente ("User already registered") se mostraba literal en el
  formulario, distinto del caso de registro nuevo. Un atacante podía
  probar una lista de emails contra `/register` y saber cuáles ya
  tienen cuenta.
- **Exploit:** enumeración de usuarios → phishing dirigido, credential
  stuffing, o desanonimización de quién usa la app.
- **Fix:** `isAccountEnumerationError()` detecta el error específico
  (`code === 'user_already_exists'` + fallback por mensaje) y en ese
  caso muestra el mismo mensaje genérico que un registro exitoso
  ("revisa tu email para confirmar"), en vez de un error distinto.
  Otros errores (contraseña débil, fallo de red) se siguen mostrando
  tal cual, porque no revelan nada sobre cuentas existentes.
- **Verificación:** dos tests nuevos en `AuthPages.test.tsx` —
  confirman que un registro nuevo y uno duplicado producen el mismo
  mensaje, y que un error genuino (no de enumeración) sigue
  mostrándose.

### 2. RLS y triggers de la migración — verificado correcto, sin hallazgo
- `categories`/`technologies`: RLS habilitado, política `for all` con
  `using`/`with check` sobre `user_id = (select auth.uid())` — cubre
  las 4 operaciones, deniega por defecto a anónimos (`auth.uid()` es
  `NULL` sin sesión).
- `category_belongs_to_user()`: se comprobó (no se asumió) que
  `SECURITY INVOKER` es la opción correcta aquí — el `select` interno
  ya queda acotado por la RLS de `categories`, así que no hace falta
  `SECURITY DEFINER` y usarlo habría sido estrictamente peor (bypassea
  RLS innecesariamente, justo el antipatrón que documenta
  `.agents/skills/supabase-postgres-best-practices`).

### 3. Superficie de inyección — sin hallazgos
- Sin `dangerouslySetInnerHTML`, sin construcción de URLs desde input
  de usuario, sin `email`/`password` en logs. La validación manual con
  `zod` + `react-hook-form` (`register(..., { validate })` en vez de
  `zodResolver`) es funcionalmente equivalente — no hay hueco entre lo
  validado y lo que llega a `supabase.auth.signInWithPassword`.

## Prioridad de remediación

- P0/P1: ninguno pendiente.
- P2: ninguno.

## Estado

- [x] Hallazgo 1 — arreglado en este mismo PR (#6) antes de mergear,
      con tests de regresión.
- [x] Hallazgo 2 — revisado, sin acción necesaria.
- [x] Hallazgo 3 — revisado, sin acción necesaria.
