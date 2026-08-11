# AGENTS.md — Tech Study Tracker

Instrucciones para cualquier agente de código (Codex, Claude Code u otro)
que trabaje en este repo.

## Proyecto

App personal para organizar tecnologías en estudio: dashboard + índice por
categorías. Stack: React + TypeScript + Vite + Tailwind CSS + Vitest en el
frontend, Supabase (Postgres + Auth) como backend, desplegado en Vercel.

Especificación funcional completa: `specs/spec.md`.
Plan técnico (cuando exista): `specs/plan.md`.

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

## Reglas generales

- No metas la `service_role key` de Supabase en código de frontend ni en
  variables `VITE_*`.
- RLS debe estar habilitado en toda tabla nueva desde su primera
  migración, no como paso posterior.
- Sigue el modelo de datos y las decisiones ya cerradas en `specs/spec.md`
  salvo que el usuario pida explícitamente cambiarlas.
