# Historial de revisiones de seguridad

Cada vez que se corre una auditoría de seguridad completa (vía
`/security-review` en Claude Code, o el equivalente manual descrito en
`AGENTS.md` para Codex), el informe se guarda aquí — no solo se muestra
en el chat, que no queda buscable ni versionado.

## Convención

- Un archivo por revisión: `YYYY-MM-DD-<tema-corto>.md`
  (ej. `2026-08-11-full-audit.md`, `2026-08-20-auth-rls.md` si es una
  revisión acotada a un área tras `/security-review solo RLS`).
- Cada archivo sigue el formato de salida de
  `.claude/commands/security-review.md`: resumen ejecutivo (nivel de
  riesgo, risk score, top 3), hallazgos por severidad con
  archivo/línea/descripción/recomendación, y prioridad de remediación.
- Añade al final una sección **Estado** marcando qué hallazgos se
  arreglaron (con el commit/PR), cuáles se aceptaron como falso positivo
  (y por qué), y cuáles quedan pendientes.
- No edites revisiones pasadas para "corregirlas" — si un hallazgo
  resulta ser falso positivo, anótalo en la sección Estado de esa misma
  revisión. El historial debe reflejar qué se sabía en cada momento.

## Índice

| Fecha | Archivo | Alcance | Resultado |
|---|---|---|---|
| 2026-08-18 | [2026-08-18-progress.md](2026-08-18-progress.md) | Progreso personal: tabla `user_technology_progress` (RLS) + primera función RPC del proyecto (`security invoker`) | 0 High/Medium; 150 tests, build y lint verdes; verificado con curl real en producción, 12/12 casos (3 identidades) |
| 2026-08-15 | [2026-08-15-password-recovery-scope.md](2026-08-15-password-recovery-scope.md) | Sesión de `PASSWORD_RECOVERY` restringida a `/nueva-password` (`useAuth.ts`, `ProtectedRoute.tsx`) | 0 High/Medium; revisión completa (toca sesión/auth); 140 tests, build y lint verdes; 2 notas informativas no bloqueantes |
| 2026-08-14 | [2026-08-14-icons.md](2026-08-14-icons.md) | Iconos de categoría/tecnología: migración `0005` (columna nullable + GRANT), `IconPicker`, listas curadas, `react-icons` nuevo | 0 High/Medium; revisión ligera (sin RLS nueva); 136 tests, build y lint verdes tras sincronizar con `main` |
| 2026-08-14 | [2026-08-14-auth-rls-fix-lecciones.md](2026-08-14-auth-rls-fix-lecciones.md) | `solo RLS`, fix de ordering en `0004` (drop policy antes de drop column) + relectura de `lecciones`/`comments` ya aplicados en remoto | 0 High/Medium; verificado con curl real contra las 3 identidades en producción |
| 2026-08-14 | [2026-08-14-lecciones.md](2026-08-14-lecciones.md) | Lecciones: migración `0004`, RLS/GRANTs, comentarios por `leccion_id`, caché, Markdown, formulario y rutas | 0 High/Medium residuales conocidos; 132 tests y build verdes; validación remota pendiente |
| 2026-08-13 | [2026-08-13-public-docs.md](2026-08-13-public-docs.md) | Pivote público/admin: migración `0003`, RLS/GRANT, caché de sesión, Markdown, comentarios/favoritos y rutas, antes del PR | 4 MEDIUM corregidos localmente; 0 High/Medium residuales conocidos; validación remota pendiente |
| 2026-08-12 | [2026-08-12-auth-flows.md](2026-08-12-auth-flows.md) | Registro con OTP, recuperación de contraseña, `useAuth`, migración `profiles` (feature `specs/features/auth.md`), antes del PR | 5 MEDIUM + 2 LOW arreglados; 1 hallazgo MEDIUM refutado contra la API real. La autorrevisión del implementador daba 0 hallazgos |
| 2026-08-12 | [2026-08-12-codex-monitor.md](2026-08-12-codex-monitor.md) | `scripts/dev/codex-monitor.mjs` / `codex-task.sh` (PR #12) — revisión hecha post-merge | 2 hallazgos MEDIUM (bind a todas las interfaces, XSS reflejado) arreglados en `main` |
| 2026-08-12 | [2026-08-12-web-design-guidelines-skill.md](2026-08-12-web-design-guidelines-skill.md) | Skill de terceros `web-design-guidelines` (Vercel) antes de usarla | Aceptada con nota — contenido no fijado por hash, fetch dinámico documentado |
| 2026-08-12 | [2026-08-12-supabase-auth.md](2026-08-12-supabase-auth.md) | Migración inicial (RLS) + cliente Supabase/auth, antes de mergear | 1 hallazgo MEDIUM (enumeración de cuentas) arreglado antes de mergear |
| 2026-08-11 | [2026-08-11-tooling-bugs.md](2026-08-11-tooling-bugs.md) | Bugs reales en los propios scripts de `scripts/security/` (no en el código de la app, que aún no existe) | 2 bugs críticos de detección arreglados, 1 clase de falso positivo mitigada |
