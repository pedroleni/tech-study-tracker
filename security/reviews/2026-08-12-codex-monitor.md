# Revisión de seguridad — 2026-08-12

**Alcance:** `scripts/dev/codex-monitor.mjs` y `scripts/dev/codex-task.sh`
(PR #12, dev tooling — servidor HTTP local que muestra en vivo el log
`--json` de una tarea de Codex). Revisión hecha **después** de mergear
la PR — se detectó al releer el código a petición del usuario, que echó
en falta la revisión documentada antes de dar la tarea por cerrada. No
vuelve a pasar: cualquier código nuevo, aunque sea "solo tooling local",
pasa por esto antes de mergear, no después.

Revisión manual contra los checklists `security-code-vulns.md` e
`security-injection.md` (no requiere subagentes de auth/RLS/secrets —
no hay superficie de esos dominios aquí) + los scanners de
`scripts/security/`.

## Resumen ejecutivo

- **Nivel de riesgo:** Bajo tras el fix (era Medio antes — herramienta
  de desarrollo, no parte de la app desplegada, pero con dos fallos
  reales).
- **Risk score:** MEDIUM×3 = 3/100 antes del fix; 0/100 después.
- **Top 3:**
  1. El servidor escuchaba en todas las interfaces de red, no solo
     localhost (MEDIUM) — arreglado.
  2. XSS reflejado vía `innerHTML` sin escapar en un campo derivado del
     propio log JSONL (MEDIUM) — arreglado.
  3. Scanners de secretos y prompt-injection: limpio.

## Hallazgos

### 1. Servidor HTTP escuchando en todas las interfaces — MEDIUM (arreglado)
- **Archivo:** `scripts/dev/codex-monitor.mjs`, `server.listen(port, ...)`
  (antes del fix, sin segundo argumento de host).
- **Descripción:** `http.Server.listen(port)` sin especificar `host` en
  Node.js escucha en `0.0.0.0` (todas las interfaces), no solo
  `127.0.0.1`. El log que sirve (`.codex-logs/*.jsonl`) puede contener
  comandos ejecutados, su output completo y contenido de archivos
  tocados por Codex durante la tarea — potencialmente sensible. Cualquier
  otro dispositivo en la misma red (wifi compartida, red de oficina)
  podía acceder a `http://<ip-local>:4545` mientras el monitor estaba
  corriendo.
- **Exploit:** alguien en la misma red local abre el puerto y lee en
  vivo lo que Codex está ejecutando/generando, incluyendo posibles
  fragmentos de código, rutas del sistema, o cualquier dato que
  aparezca en la salida de un comando durante esa sesión.
- **Fix:** `server.listen(port, '127.0.0.1', ...)` — solo accesible
  desde la propia máquina.
- **Verificación:** smoke test manual confirmando bind explícito a
  `127.0.0.1`.

### 2. XSS reflejado en el badge de tipo de evento desconocido — MEDIUM (arreglado)
- **Archivo:** `scripts/dev/codex-monitor.mjs`, función `badge(type)`
  (rama `else`) y su uso en `renderItem()` vía `div.innerHTML = ... +
  badge(item.type || evt.type) + ...`.
- **Descripción:** para tipos de evento distintos de
  `command_execution`/`agent_message`, el valor de `type` (que viene
  del JSON parseado del log, no de un enum cerrado en el cliente) se
  concatenaba sin escapar dentro de un string HTML asignado a
  `.innerHTML`. Si ese campo contuviera algo como
  `"><script>...</script>`, se ejecutaría en la página del monitor.
  El log lo genera `codex exec` localmente (no es input de red de
  terceros), así que el riesgo práctico es bajo, pero el patrón en sí
  (`innerHTML` con datos no controlados por el propio código) es
  exactamente lo que marca `security-injection.md` como HIGH si
  alguna vez ese log incorporase datos de una fuente menos confiable
  (p. ej. si Codex llegase a procesar contenido web y lo reflejase en
  el log tal cual).
- **Exploit:** JS arbitrario ejecutándose en el contexto de
  `localhost:4545`, con acceso a lo que haya en esa página (no hay
  sesión ni cookies sensibles hoy, pero sí una superficie que no debería
  existir).
- **Fix:** `badge()` ahora construye el badge por defecto vía
  `document.createElement` + `.textContent`, igual que ya se hacía
  para `.msgtext`, `.cmdline` y `.out` — nunca concatenación de string
  con datos externos hacia `innerHTML`.
- **Verificación:** test manual sirviendo un log sintético con
  `{"item":{"type":"weird_type"}}` — confirmado que el badge se genera
  vía `span.className` (DOM real), no concatenación de string.

### 3. Scanners automáticos — sin hallazgos
- `scan_secrets.sh` y `scan_prompt_injection.sh`: 0 hallazgos sobre el
  árbol actual (incluye los dos scripts nuevos).
- No hay dependencias nuevas (`codex-monitor.mjs` usa solo `node:http`,
  `node:fs`, `node:path`, `node:url` — librería estándar, sin
  `npm install`), así que no aplica `security-supply-chain.md`.

## Prioridad de remediación

- P0/P1: ninguno pendiente — ambos hallazgos arreglados antes de
  documentar esta revisión.
- P2: ninguno.

## Estado

- [x] Hallazgo 1 — arreglado (bind a `127.0.0.1`), verificado con
      smoke test.
- [x] Hallazgo 2 — arreglado (`textContent` en vez de concatenación a
      `innerHTML`), verificado con smoke test.
- [x] Hallazgo 3 — revisado, sin acción necesaria.

**Nota de proceso:** esta revisión se hizo **después** del merge de la
PR #12, no antes — un incumplimiento real del flujo que describe
`AGENTS.md` ("guarda cada auditoría completa... antes de dar por
terminada una tarea"). El fix va en su propia rama (`fix/codex-monitor-security`)
y PR, siguiendo el mismo flujo de ramas que cualquier otro cambio — el
hecho de que el hallazgo se detectara tarde no es motivo para saltarse
el proceso también en el fix.
