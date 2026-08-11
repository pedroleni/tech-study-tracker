# Revisión de seguridad — 2026-08-11

**Alcance:** no el código de la app (aún no existe más allá de tipos y
utilidades puras) — los propios scripts en `scripts/security/` que
implementan la auditoría. Encontrados de forma incidental mientras se
verificaba que el tooling funcionaba de verdad, no en una pasada
dedicada.

## Resumen ejecutivo

- **Nivel de riesgo:** Alto (a nivel de tooling — el código de producto
  en sí no tiene hallazgos porque apenas existe todavía).
- **Risk score:** no aplica el cálculo estándar (CRITICAL×25 + HIGH×10 +
  ...) porque los "hallazgos" aquí son bugs en el detector, no en el
  código detectado.
- **Top 3:**
  1. `scan_secrets.sh` no detectaba ningún secreto, nunca, por dos bugs
     de sintaxis independientes — "sin hallazgos" llevaba toda la
     sesión significando "el scanner nunca buscó", no "está limpio".
  2. El mismo patrón de bug (`grep | wc -l || echo 0` bajo `pipefail`)
     aparecía repetido en 4 scripts distintos.
  3. `scan_prompt_injection.sh` se disparaba contra su propia
     documentación y contra hashes de `package-lock.json` — ruido que,
     sin revisar, se habría silenciado con una exclusión demasiado
     amplia.

## Hallazgos

### 1. `scan_secrets.sh`: sintaxis de `find` pasada a `grep` — CRITICAL
- **Archivo:** `scripts/security/scan_secrets.sh` (variable `EXCLUDE_DIRS`, ~12 sitios de uso)
- **Descripción:** `EXCLUDE_DIRS` se definía con sintaxis de `find`
  (`-not -path '*/.git/*'`) pero se pasaba a `grep -rnP`, que no la
  entiende (`grep: invalid option -- 't'`). El error se tragaba con
  `2>/dev/null || true`. Resultado: **ningún patrón de secreto
  (AWS, Anthropic, OpenAI, GitHub, Stripe, Slack, Google, SendGrid,
  contraseñas genéricas, JWT) se buscó jamás**, en ninguna ejecución.
- **Cómo se detectó:** al aparecer un `.env` real con credenciales de
  Supabase en el árbol de trabajo, se probó a mano si el scanner lo
  detectaría — no detectó nada, lo que disparó la investigación.
- **Fix:** `EXCLUDE_DIRS` reescrito con la sintaxis correcta de grep
  (`--exclude-dir=DIR`). El único uso legítimo de la sintaxis de `find`
  (la comprobación de archivos `.env` committeados) se separó en su
  propia variable `FIND_EXCLUDE_DIRS`, como array bash para evitar el
  hallazgo 4.

### 2. `scan_secrets.sh`: brace-expansion dentro de comillas dobles — CRITICAL
- **Archivo:** `scripts/security/scan_secrets.sh:53` (y 11 sitios más)
- **Descripción:** `--include="*.{$SCAN_EXTENSIONS}"` usa expansión de
  llaves de shell, que bash **nunca expande dentro de comillas
  dobles** — grep recibía el string literal con llaves como un único
  glob, que no coincide con ningún nombre de archivo real. Combinado
  con el hallazgo 1, el scanner escaneaba cero archivos en todas sus
  comprobaciones basadas en extensión.
- **Fix:** un flag `--include=*.ext` por extensión, construido en
  tiempo de ejecución a partir de `SCAN_EXTENSIONS` (para que la lista
  no pueda desincronizarse otra vez).

### 3. Patrón `grep | wc -l || echo 0` bajo `pipefail` — HIGH
- **Archivos:** `scan_configs.sh`, `scan_dependencies.sh`,
  `scan_secrets.sh`, más un pipeline suelto en `scan_configs.sh`
  (chequeo de CORS).
- **Descripción:** bajo `set -o pipefail` (que GitHub Actions activa
  por defecto en los `run:` de bash, además de nuestro propio
  `set -uo pipefail`), que `grep` no encuentre nada es su código de
  salida normal (1), no un error — pero `pipefail` propaga ese 1 como
  fallo del pipeline completo. El fallback `|| echo 0` entonces se
  ejecuta *además* del conteo real de `wc -l`, produciendo un valor de
  dos líneas que rompe la comparación numérica siguiente bajo `set -e`,
  abortando el script entero con un "exit code 1" sin contexto.
- **Fix:** `; true` en vez de `|| echo 0` (neutraliza el código de
  salida sin duplicar la salida), y `|| true` en el pipeline suelto de
  CORS.
- **Impacto real:** esto rompió el CI dos veces en runs anteriores
  antes de identificarse — ver commits del 2026-08-11 en el historial
  de `scripts/security/`.

### 4. Exclusiones de `.claude/`/lockfiles/skills — MEDIUM (ruido, no fuga)
- **Archivo:** `scripts/security/scan_prompt_injection.sh`
- **Descripción:** el check de "Agent-Targeted Instructions" se
  disparaba contra: sus propios patrones documentados en
  `.claude/agents/security-*.md`, hashes `integrity` de
  `package-lock.json` (base64 aleatorio que por azar contiene "//"), y
  documentación oficial de RLS de Supabase (`.agents/skills/`) que
  legítimamente describe mecanismos de *bypass* de RLS.
- **Revisión:** cada hallazgo se leyó a mano antes de excluir nada.
  Ninguno era una instrucción real dirigida a un agente.
- **Fix:** exclusiones acotadas por ruta exacta (no por nombre de
  carpeta genérico) — ver comentarios en `POST_EXCLUDE_FILES` dentro
  del script para el razonamiento completo, incluyendo dos intentos
  fallidos (`--exclude=GLOB` silenciosamente ignorado por `--include`;
  `--exclude-dir` con ruta que funcionaba en local pero no en el
  runner de CI) antes de llegar al fix correcto (post-filtrado sobre la
  salida de grep, no sobre sus flags).

## Prioridad de remediación

Todo lo anterior ya está arreglado y en `main` (PRs #2 y #3, más los
commits directos del fix de `perl -CSD`/locale y de los patrones
`\bnc\b`/`\bskip\b` etc. con límites de palabra). No queda nada
pendiente de esta revisión.

## Estado

- [x] Hallazgo 1 — arreglado, PR #3, verificado con GNU grep real +
      secretos sintéticos (AWS/Anthropic/DB connection string) detectados
      correctamente como CRITICAL tras el fix.
- [x] Hallazgo 2 — arreglado en el mismo PR #3.
- [x] Hallazgo 3 — arreglado en commits previos (ver `git log` sobre
      `scripts/security/*.sh`), verificado bajo `bash -eo pipefail`
      replicando el runner de GitHub Actions.
- [x] Hallazgo 4 — arreglado, PR #2, verificado que una carpeta de
      skill con nombre distinto sigue escaneada por completo (no es una
      exención genérica).

**Lección para futuras revisiones:** el grep del sistema en macOS no
soporta `-P` y falla en silencio — cualquier verificación local de
estos scripts debe forzar GNU grep (`brew install grep`, anteponer
`/opt/homebrew/opt/grep/libexec/gnubin` al `PATH`) o los resultados no
son fiables. Los hallazgos 1 y 2 estuvieron presentes toda la sesión sin
detectarse hasta que se verificó contra GNU grep real.
