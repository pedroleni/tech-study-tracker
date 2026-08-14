# Security Review Instructions — Tech Study Tracker

Apéndice de **precedentes y decisiones de seguridad específicas de este
proyecto**. Es la fuente única de verdad sobre "qué es correcto en este
stack" — los 8 subagentes de `.claude/agents/security-*.md`, el comando
`/security-review`, y Codex (vía `AGENTS.md`) lo leen antes de reportar
nada, para no generar falsos positivos sobre decisiones ya tomadas
(RLS como capa de autorización, `react-markdown` sin `rehype-raw`, etc.).
No lo dupliques en otros archivos: referéncialo.

Adaptado de la metodología de
[claude-code-security-review](https://github.com/anthropics/claude-code-security-review)
al stack concreto de este proyecto (React + TypeScript + Vite + Supabase).

## Rol

Actúa como un ingeniero de seguridad senior revisando los cambios del diff
actual (o del código indicado). Esto NO es una code review general: céntrate
solo en implicaciones de seguridad introducidas por el cambio. No comentes
problemas de seguridad preexistentes salvo que el diff los toque.

## Reglas críticas

1. Minimiza falsos positivos: solo reporta hallazgos con >80% de confianza
   de explotabilidad real.
2. Prioriza impacto: acceso no autorizado a datos de otro usuario, fuga de
   datos, bypass de autenticación.
3. No reportes: DoS, rate limiting, agotamiento de recursos, falta de
   hardening genérico, hallazgos solo en tests o documentación.

## Categorías a examinar (específicas de este stack)

**Row Level Security (RLS) — la capa de autorización principal del
proyecto, ya que no hay backend propio:**
- Toda tabla expuesta de Supabase (`profiles`, `categories`, `technologies`,
  `lecciones`, `comments`, `favorites`) debe tener RLS habilitado y privilegios del Data
  API explícitos. RLS y `GRANT` son controles distintos; hacen falta ambos.
  Para escritura, concede solo las columnas que el cliente puede gestionar;
  IDs y timestamps generados por el servidor no deben quedar escribibles.
- El modelo vigente tiene tres niveles: lectura pública de categorías del
  admin, tecnologías completadas del admin y lecciones publicadas dentro de
  esas tecnologías; escritura de contenido solo por su admin propietario;
  comentarios sobre lecciones publicadas para usuarios autenticados;
  favoritos de tecnologías estrictamente propios. La definición exacta vive
  en `specs/features/public-docs.md`, `specs/features/lecciones.md` y las
  migraciones `0003_public_docs.sql`/`0004_lecciones.sql`.
- `profiles` solo permite a cada usuario leer su propia fila. Cualquier helper
  `security definer` usado por RLS debe vivir en `private`, fijar
  `search_path = ''`, usar nombres cualificados y exponer el privilegio mínimo.
- La identidad y relaciones inmutables de comentarios (`id`, `user_id`,
  `leccion_id`, `parent_comment_id`, `created_at`) deben reforzarse en
  Postgres, no solo en el cliente.
- Cualquier query que dependa solo de un filtro `.eq('user_id', ...)` en el
  cliente, sin política RLS equivalente en el servidor, es un hallazgo
  HIGH (IDOR: un cliente malicioso puede llamar a la API de Supabase
  directamente sin pasar por el filtro del frontend).
- `technologies.category_id` debe validarse (vía policy o constraint) para
  que apunte solo a categorías del mismo `user_id` — evita asignar
  tecnologías a categorías de otro usuario.

**Autenticación (Supabase Auth):**
- La `anon key` de Supabase es pública por diseño: no reportar su presencia
  en el bundle del frontend como fuga de secreto.
- La `service_role key` NUNCA debe aparecer en código de frontend, en
  variables `VITE_*`, ni en el bundle compilado — solo en entornos server-side
  de confianza. Si aparece, es HIGH.
- El registro es abierto. Un usuario normal solo puede comentar lecciones
  publicadas y gestionar sus favoritos; crear o mutar categorías,
  tecnologías o lecciones exige rol admin en RLS.
- Las rutas de lectura son públicas a propósito. `/favoritos` requiere sesión
  y `/admin/*` requiere sesión + rol, aunque esos guards sean solo UX y la
  autorización real siga en RLS.
- La caché de tecnologías y lecciones debe estar separada por identidad y
  vaciarse ante `SIGNED_OUT`: el admin recibe borradores que nunca pueden
  reutilizarse en la vista pública después de una expiración o revocación de
  sesión.

**XSS / Renderizado de contenido de usuario:**
- Los campos `notes`, `lecciones.contenido` y `comments.body` admiten texto
  libre/markdown. Si se
  renderizan como HTML
  (librería de markdown + `dangerouslySetInnerHTML` o equivalente) sin
  sanitizar (p. ej. con DOMPurify), es un hallazgo HIGH de XSS almacenado.
- Las imágenes Markdown remotas se omiten: un comentario no debe poder hacer
  que el navegador de cada lector contacte un host de tracking arbitrario.
- El campo `resources` (lista de `{label, url}`) se renderiza como enlaces:
  valida que solo se acepten esquemas `http:`/`https:` antes de usarlos en
  `href`, para evitar `javascript:` URIs.

**Gestión de configuración y secretos:**
- `.env` con credenciales reales debe estar en `.gitignore`; debe existir
  un `.env.example` sin valores reales.
- No loguear tokens de sesión, emails de usuario ni claves en consola en
  build de producción.

**Inyección:**
- Las queries van vía `supabase-js` (parametrizadas por defecto). Si
  aparece SQL/RPC con concatenación de strings de input de usuario, es un
  hallazgo HIGH.

## Precedentes (no reportar)

- La falta de comprobaciones de auth/permisos en código cliente (React/TS)
  no es una vulnerabilidad por sí sola: la responsabilidad de validar y
  autorizar recae en RLS/Supabase server-side. Solo reporta si falta la
  política RLS equivalente en el servidor.
- React es seguro frente a XSS por defecto (auto-escaping en JSX). En Markdown,
  el patrón aprobado es `react-markdown` sin `rehype-raw`, enlaces limitados a
  `http:`/`https:` e imágenes omitidas.
- Los UUID generados por Supabase se asumen no adivinables; no hace falta
  validarlos como si fueran predecibles.
- Vulnerabilidades en dependencias de terceros (npm audit) se gestionan
  aparte, no las reportes aquí.

## Formato de salida

Para cada hallazgo:

```
# Vuln N: <categoría>: `archivo:línea`
- Severity: High | Medium | Low
- Description: ...
- Exploit Scenario: ...
- Recommendation: ...
```

Solo incluye hallazgos con severidad High o Medium. Ante la duda, no lo
reportes — mejor pasar por alto algo teórico que llenar el informe de
ruido.

## Metodología

1. Identifica posibles vulnerabilidades revisando el diff/código con las
   categorías de arriba.
2. Para cada hallazgo candidato, vuelve a evaluarlo con la sección
   "Precedentes" — descarta lo que no supere el 80% de confianza real. Si
   tu agente soporta sub-tareas en paralelo, usa una por hallazgo para este
   paso; si no, hazlo de forma secuencial.
3. Entrega solo los hallazgos que sobrevivan al filtro, en el formato de
   salida indicado.

## Arquitectura de la auditoría completa

Este documento cubre el "qué es específico de este proyecto". La
metodología multi-dominio completa (8 subagentes especializados +
síntesis con risk score) vive en:

- `.claude/agents/security-agent-env.md` — integridad de CLAUDE.md/AGENTS.md/`.claude/`
- `.claude/agents/security-secrets.md` — claves hardcodeadas (`service_role` incluida)
- `.claude/agents/security-code-vulns.md` — OWASP Top 10 / React-TS
- `.claude/agents/security-supply-chain.md` — dependencias npm
- `.claude/agents/security-injection.md` — XSS en `notes`/comentarios, URLs y tracking remoto
- `.claude/agents/security-auth-crypto.md` — Supabase Auth y **RLS**
- `.claude/agents/security-infrastructure.md` — Vercel, migraciones, CI/CD
- `.claude/agents/security-prompt-injection.md` — instrucciones ocultas para agentes IA

Los scanners automatizados que cada subagente usa como primer paso están
en `scripts/security/*.sh` (bash puro, sin dependencia de Claude Code —
cualquier agente o humano puede ejecutarlos directamente).

## Cómo invocarlo

- **Claude Code:** ejecuta `/security-review` — orquesta los 8 subagentes
  en paralelo (ver `.claude/commands/security-review.md`).
- **Codex / otros agentes sin subagentes:** sigue `AGENTS.md` — recorre
  cada `.claude/agents/security-*.md` como checklist de dominio, ejecuta
  los scripts de `scripts/security/`, y aplica los precedentes de este
  archivo antes de reportar un hallazgo.
