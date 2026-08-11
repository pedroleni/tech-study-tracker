# CLAUDE.md

Las instrucciones de proyecto (contexto, stack, y requisitos de seguridad
obligatorios antes de cerrar una tarea) viven en [AGENTS.md](AGENTS.md) —
léelo, aplica igualmente aquí.

## Auditoría de seguridad

Usa `/security-review` para una auditoría completa: orquesta los 8
subagentes especializados en `.claude/agents/security-*.md`
(entorno del agente, secretos, vulnerabilidades de código, cadena de
suministro, inyección, auth/RLS, infraestructura, prompt injection) en
paralelo, y sintetiza un informe único con severidad y risk score.

Cada subagente lee primero `security/security-review-instructions.md`
para los precedentes específicos de este proyecto (RLS como capa de
autorización, manejo seguro de `notes`/`resources`, etc.) antes de
reportar un hallazgo, para minimizar falsos positivos.

Si solo necesitas un dominio concreto, pásalo como argumento, p. ej.
`/security-review solo RLS` o `/security-review solo secretos`.
