# Revisión de seguridad — 2026-08-12 (skill de terceros)

**Alcance:** `.agents/skills/web-design-guidelines/` — skill instalada
vía `npx skills add vercel-labs/agent-skills --skill
web-design-guidelines`, antes de darla por segura para usar.

## Resumen ejecutivo

- **Nivel de riesgo:** Bajo, con una salvedad estructural (ver hallazgo 1).
- **Top hallazgo:** el `SKILL.md` no contiene las guías en sí — instruye
  al agente a descargarlas de una URL en cada uso (`WebFetch` sobre
  `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`).
  Es exactamente el patrón que `.claude/agents/security-agent-env.md`
  marca como señal de alarma ("referencia una URL externa para más
  instrucciones") — aquí es intencional y de una fuente pública
  verificable, no oculta, pero merece quedar documentado en vez de
  aceptarse sin más.

## Hallazgos

### 1. Contenido no fijado (fetch dinámico) — INFO, aceptado con nota
- **Archivo:** `.agents/skills/web-design-guidelines/SKILL.md`
- **Descripción:** a diferencia de las skills de Supabase (contenido
  estático, hash fijado en `skills-lock.json`), esta skill vuelve a
  descargar `command.md` cada vez que se invoca. El contenido puede
  cambiar entre revisiones sin que nadie lo note.
- **Verificación hecha:** se descargó el contenido real de esa URL (no
  solo se leyó el `SKILL.md` wrapper) y se revisó entero — son guías
  legítimas de accesibilidad, formularios, animación, tipografía,
  rendimiento, i18n e hydration safety para React/Tailwind. Sin
  instrucciones ocultas, sin intento de ampliar permisos del agente,
  sin payloads codificados.
- **Riesgo residual:** si el repo `vercel-labs/web-interface-guidelines`
  se viera comprometido, el contenido fetcheado podría cambiar sin que
  quede registrado aquí — la revisión de hoy cubre el `SKILL.md` (que sí
  está fijado por hash) y el contenido de `command.md` *tal como estaba
  en el momento de esta revisión*, no una garantía permanente.
- **Decisión:** aceptado. Impacto máximo en caso de compromiso es que el
  agente reciba consejos de UI incorrectos (sugerir CSS/HTML erróneos),
  no ejecución de comandos ni exfiltración — sigue pasando por revisión
  humana normal de cualquier cambio de código antes de mergear. No se
  justifica fijar una copia estática y perder las actualizaciones.
- **Mitigación aplicada:** excepción acotada por ruta exacta en
  `POST_EXCLUDE_FILES` (`scan_prompt_injection.sh`), no un blindaje
  genérico de `.agents/skills/` — ver comentario en el script.

## Estado

- [x] Hallazgo 1 — revisado y aceptado con nota, excepción de scanner
      añadida y documentada en el propio código.
