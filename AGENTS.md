# AGENTS.md — Tech Study Tracker

Instrucciones para cualquier agente de código (Codex, Claude Code u otro)
que trabaje en este repo.

## Proyecto

App personal para organizar tecnologías en estudio: dashboard + índice por
categorías. Stack: React + TypeScript + Vite + Tailwind CSS + Vitest en el
frontend, Supabase (Postgres + Auth) como backend, desplegado en Vercel.

Especificación funcional completa: `specs/spec.md`.
Plan técnico (cuando exista): `specs/plan.md`.
Design system (paleta de status/priority/difficulty, inventario de
componentes): `specs/design-system.md` — léelo antes de crear o tocar
cualquier componente en `src/components/`.

## Skills de Supabase

`.agents/skills/supabase/` y `.agents/skills/supabase-postgres-best-practices/`
(symlinked en `.claude/skills/`) son skills oficiales de Supabase
(`npx skills add supabase/agent-skills`, ver `skills-lock.json` para el
hash de integridad). Léelas antes de tocar el esquema, migraciones,
políticas RLS, o diagnosticar queries lentas — cubren exactamente los
gotchas de este proyecto (RLS en `categories`/`technologies`,
`SECURITY DEFINER`, índices en foreign keys). Para actualizarlas:
`npx skills add supabase/agent-skills` de nuevo.

## Skill de diseño UI/UX

`.agents/skills/web-design-guidelines/` (oficial de Vercel,
`npx skills add vercel-labs/agent-skills --skill web-design-guidelines`)
— úsala al escribir o revisar cualquier componente nuevo en
`src/components/`: accesibilidad, estados de foco, formularios,
animación, tipografía, rendimiento, i18n. A diferencia de las skills de
Supabase, **esta no trae las guías dentro** — su `SKILL.md` obtiene el
contenido en tiempo real desde `vercel-labs/web-interface-guidelines` en
cada uso, así que no está fijada por hash como las demás. Revisado el contenido real (no solo el
wrapper) el 2026-08-12, ver
`security/reviews/2026-08-12-web-design-guidelines-skill.md` — aceptado
porque el impacto máximo de un contenido comprometido sería sugerir
CSS/HTML incorrecto, no ejecución de comandos, y de todas formas pasa
por revisión humana antes de mergear.

Estas tres carpetas (`supabase`, `supabase-postgres-best-practices`,
`web-design-guidelines`) están explícitamente exceptuadas del check de
"Agent-Targeted Instructions" de `scan_prompt_injection.sh` (revisadas a
mano, ver el comentario en el script) — cualquier otra skill que se
añada después NO lo está hasta que alguien la revise igual.

## Seguridad — obligatorio antes de dar por terminada una tarea

Este proyecto tiene una auditoría de seguridad multi-dominio (8 áreas),
pensada originalmente como 8 subagentes de Claude Code
(`.claude/agents/security-*.md`) orquestados por `/security-review`. Tú
(Codex) no tienes ese mecanismo de subagentes, pero puedes seguir la misma
auditoría de forma secuencial: cada archivo `.claude/agents/security-*.md`
es un checklist de dominio autocontenido, escrito para ser leído por
cualquier agente, no solo por Claude Code.

Antes de considerar terminada cualquier tarea que toque:
- autenticación o sesiones (Supabase Auth) o políticas RLS →
  `.claude/agents/security-auth-crypto.md`,
- claves/variables de entorno →
  `.claude/agents/security-secrets.md`,
- renderizado de contenido de usuario (`notes`, `resources`) →
  `.claude/agents/security-injection.md`,
- dependencias nuevas (`npm install ...`) →
  `.claude/agents/security-supply-chain.md`,
- código general nuevo → `.claude/agents/security-code-vulns.md`,

lee el/los checklist(s) relevante(s) + `security/security-review-instructions.md`
(precedentes específicos de este proyecto) y revisa tu propio diff contra
ellos antes de responder. Para una auditoría completa, ejecuta también los
scanners de `scripts/security/*.sh` (bash puro, sin dependencias de
Claude Code) y recorre los 8 checklists uno a uno:
`security-agent-env`, `security-secrets`, `security-code-vulns`,
`security-supply-chain`, `security-injection`, `security-auth-crypto`,
`security-infrastructure`, `security-prompt-injection`.

Reporta solo hallazgos High/Medium (o CRITICAL) con >80% de confianza —
no generes ruido con hallazgos teóricos. Si quieres el mismo formato de
salida que usa Claude Code (resumen ejecutivo + risk score
CRITICAL×25 + HIGH×10 + MEDIUM×3 + LOW×1), sigue el formato descrito en
`.claude/commands/security-review.md`.

Guarda cada auditoría completa (no un chequeo puntual de una tarea) como
`security/reviews/YYYY-MM-DD-<tema-corto>.md`, siguiendo
`security/reviews/README.md`. No lo dejes solo en tu respuesta — no
queda versionado ni buscable ahí.

## Enforcement (no es solo advisory)

Esto ya no depende únicamente de que el agente se acuerde de leer este
archivo:
- **Pre-commit local**: `git config core.hooksPath .githooks` (instalado
  vía `bash scripts/security/install_hooks.sh`) corre `scan_secrets.sh`
  antes de cada commit y lo bloquea si hay hallazgos CRITICAL/HIGH.
- **CI en GitHub Actions** (`.github/workflows/security-scan.yml`): en
  cada push a `main` y cada PR corre los 5 scanners de
  `scripts/security/` y falla el check si hay CRITICAL/HIGH — bloquea el
  merge independientemente de qué agente escribió el código.

Sigue usando los checklists de abajo como guía *antes* de escribir código
(evita retrabajo), pero el hook y el CI son los que de verdad impiden que
algo inseguro llegue a `main`.

## Flujo de ramas — obligatorio, nunca commits directos a `main`

Cada feature se desarrolla en su propia rama, se prueba ahí, y solo
después se integra en `main`:

1. Parte siempre de `main` actualizado, rama `feat/<nombre-corto>` (o
   `fix/<nombre-corto>` para bugs). Una rama = una feature del
   `specs/plan.md` sección 8, no varias mezcladas.
2. Implementa. Corre `npm run test`, `npm run build` y `npm run lint` — la
   rama debe quedar verde antes de darla por terminada.
3. Commit(s) normales en la rama (varios está bien, no hace falta squash).
4. Push de la rama y PR contra `main` (nunca push directo a `main`). El
   workflow `.github/workflows/security-scan.yml` ya corre
   automáticamente en cada PR (trigger `pull_request`), así que el gate
   de seguridad se valida ahí antes de mergear.
5. Solo se mergea a `main` una vez la rama está verde en CI y revisada.

No crees una rama gigante que intente todo `specs/plan.md` de una vez.
Una rama por paso (o por un grupo pequeño y cohesionado de pasos) — así
cada feature se puede probar, revisar y revertir de forma independiente.

**Restricción conocida de Codex:** el sandbox `workspace-write` de Codex
CLI no permite escribir dentro de `.git` — ni `checkout -b`, ni `add`, ni
`commit`, ni `push` funcionan ahí (falla con "Operation not permitted").
En la práctica esto significa que Codex debe limitarse a **implementar
código y tests** en el árbol de trabajo; los pasos 1, 3 y 4 de arriba
(crear rama, commitear, hacer push/PR) los completa quien sí tenga acceso
de escritura a `.git` — normalmente Claude Code o el propio usuario. Si
eres Codex y no puedes crear la rama al principio, implementa igualmente
sobre el working tree tal cual está y dilo explícitamente en tu resumen
final para que el siguiente agente cree la rama y mueva los cambios ahí.

## Reglas generales

- No metas la `service_role key` de Supabase en código de frontend ni en
  variables `VITE_*`.
- RLS debe estar habilitado en toda tabla nueva desde su primera
  migración, no como paso posterior.
- Sigue el modelo de datos y las decisiones ya cerradas en `specs/spec.md`
  salvo que el usuario pida explícitamente cambiarlas.
