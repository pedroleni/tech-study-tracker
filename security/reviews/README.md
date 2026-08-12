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
| 2026-08-12 | [2026-08-12-auth-flows.md](2026-08-12-auth-flows.md) | Registro con OTP, recuperación de contraseña, `useAuth`, migración `profiles` (feature `specs/features/auth.md`), antes del PR | 5 MEDIUM + 2 LOW arreglados; 1 hallazgo MEDIUM refutado contra la API real. La autorrevisión del implementador daba 0 hallazgos |
| 2026-08-12 | [2026-08-12-codex-monitor.md](2026-08-12-codex-monitor.md) | `scripts/dev/codex-monitor.mjs` / `codex-task.sh` (PR #12) — revisión hecha post-merge | 2 hallazgos MEDIUM (bind a todas las interfaces, XSS reflejado) arreglados en `main` |
| 2026-08-12 | [2026-08-12-web-design-guidelines-skill.md](2026-08-12-web-design-guidelines-skill.md) | Skill de terceros `web-design-guidelines` (Vercel) antes de usarla | Aceptada con nota — contenido no fijado por hash, fetch dinámico documentado |
| 2026-08-12 | [2026-08-12-supabase-auth.md](2026-08-12-supabase-auth.md) | Migración inicial (RLS) + cliente Supabase/auth, antes de mergear | 1 hallazgo MEDIUM (enumeración de cuentas) arreglado antes de mergear |
| 2026-08-11 | [2026-08-11-tooling-bugs.md](2026-08-11-tooling-bugs.md) | Bugs reales en los propios scripts de `scripts/security/` (no en el código de la app, que aún no existe) | 2 bugs críticos de detección arreglados, 1 clase de falso positivo mitigada |
