# Revisión de seguridad — 2026-08-19

**Alcance:** no el código de la app — los propios scripts de
`scripts/security/*.sh` que implementan la auditoría de seguridad de
este proyecto. Encontrado de forma incidental: CI (Linux) rechazó el
PR #29 por un hallazgo HIGH que ninguna ejecución local había visto,
lo que disparó la investigación.

Es la misma clase de bug que ya documentó
[`2026-08-11-tooling-bugs.md`](2026-08-11-tooling-bugs.md) — su propia
sección "Lección para futuras revisiones" ya avisaba de esto — pero
resulta que aquella vez el arreglo **no se completó ni se propagó**.
Se deja constancia aquí con más detalle para que no se repita una
tercera vez sin dejar rastro escrito de por qué falla concretamente en
Mac.

## Resumen ejecutivo

- **Nivel de riesgo:** Alto, a nivel de tooling (el código de producto
  auditado por estos scripts no tiene hallazgos nuevos — el problema
  es que la auditoría local sobre macOS no se puede confiar tal como
  estaba).
- **Risk score:** no aplica el cálculo estándar — son bugs en el
  detector, no en el código detectado.
- **Top 3:**
  1. Los 5 scanners de `scripts/security/` dependen de `grep -P`
     (PCRE) para casi todos sus patrones. El grep de BSD que trae
     macOS no soporta `-P`, y el error queda silenciado por
     `2>/dev/null || true` en cada llamada — así que en un Mac
     cualquiera de estos scanners puede reportar "sin hallazgos" pase
     lo que pase, sin ninguna señal visible de que algo fue mal.
  2. `scan_prompt_injection.sh` **ya tenía** el diagnóstico y el
     preámbulo correctos de un incidente anterior (comentario propio
     citando el PR #14) — calculaba una variable `$GREP` con `ggrep`
     como fallback — pero la sustitución real nunca se completó: las
     ~24 comprobaciones del cuerpo del script seguían llamando a
     `grep` a secas. El preámbulo daba una falsa sensación de "esto ya
     está arreglado" sin estarlo.
  3. Los otros 4 scanners (`scan_code_patterns.sh`, `scan_secrets.sh`,
     `scan_dependencies.sh`, `scan_configs.sh`) no tenían ni el
     preámbulo — ninguno de sus patrones con `-P` funcionaba nunca en
     local sobre macOS.

## Hallazgos

### 1. `grep -P` sin soporte en macOS, silenciado en los 5 scanners — HIGH
- **Archivos:** `scripts/security/scan_code_patterns.sh`,
  `scan_secrets.sh`, `scan_dependencies.sh`, `scan_configs.sh`,
  `scan_prompt_injection.sh` (decenas de sitios de uso en total).
- **Descripción:** todas las llamadas usan `grep -P`/`-qP`/`-qiP`/
  `-cP`/`-nP`/`-rnP` para patrones con sintaxis PCRE (`\s`, `\d`,
  `(?:...)`, lookahead negativo `(?!...)`). El `grep` de BSD que trae
  macOS por defecto no reconoce `-P` — falla con
  `grep: invalid option -- P` — y como cada llamada está envuelta en
  `2>/dev/null` (a veces además con `|| true`), ese error se traga por
  completo. El resultado observable es idéntico a "no hay
  coincidencias": el scanner termina limpio, sin ningún aviso de que
  en realidad nunca ejecutó la comprobación.
- **Cómo se detectó:** un comentario de test en
  `CodigoResaltado.test.tsx` que citaba literalmente
  `dangerouslySetInnerHTML` (para documentar que el componente
  **nunca** lo usa) disparó el patrón HIGH de XSS de
  `scan_code_patterns.sh` en CI (Ubuntu, GNU grep real) — pero ninguna
  ejecución local en este Mac lo había visto nunca, pese a haberse
  corrido varias veces sobre el mismo diff minutos antes.
- **Impacto real durante esta sesión:** cualquier "5 scanners en verde
  en local" reportado en esta conversación fue, para `scan_secrets.sh`,
  `scan_dependencies.sh` y `scan_configs.sh`, en gran medida un
  placebo — no verificaban nada que dependiera de `-P`. La red de
  seguridad real que sí funcionó todo este tiempo fue **CI** (corre en
  Ubuntu, con GNU grep nativo), que se esperó en verde antes de cada
  merge. No hay indicios de que ningún hallazgo real llegara a
  mergearse sin pasar por CI — lo que se pierde es la fiabilidad de la
  verificación *local* en esta máquina concreta, no la del código ya
  mergeado.
- **Fix:** en los 5 scripts, un preámbulo que prueba `grep -qP` con
  una entrada real (no `/dev/null`, que da el mismo código de salida
  con o sin soporte `-P` y por tanto no sirve como test), usa `ggrep`
  si está disponible (`brew install grep`) cuando el `grep` nativo no
  vale, y si ninguno de los dos soporta `-P`, **aborta con `exit 2` y
  un mensaje explícito** en vez de continuar en silencio. Todas las
  invocaciones con alguna variante de `-P` pasan por esa variable
  (`$GREP`), no por `grep` directo.

### 2. El preámbulo de `scan_prompt_injection.sh` nunca se conectó al cuerpo del script — HIGH (falsa sensación de seguridad)
- **Archivo:** `scripts/security/scan_prompt_injection.sh` (antes del
  fix: líneas 13-32 calculaban `GREP`, pero ninguna de las ~24 líneas
  siguientes lo usaba).
- **Descripción:** distinto del hallazgo 1 en un matiz importante: no
  es solo que faltara el fix, es que el fix **parecía existir** —
  había un comentario extenso citando un incidente real (PR #14) y
  código que calculaba correctamente la variable `GREP` con su
  fallback a `ggrep`. Pero la variable calculada nunca se sustituía en
  ninguna llamada real. Quien leyera el script (incluido yo, en
  sesiones anteriores) podía asumir razonablemente que este scanner en
  concreto ya estaba a salvo del problema — y no lo estaba.
- **Fix:** las ~24 llamadas del cuerpo (comprobaciones de
  `CLAUDE.md`/`.cursorrules`/hooks de git/SVG ocultos/etc.) reescritas
  para usar `$GREP` en vez de `grep` donde el patrón depende de `-P`.

### 3. Chequeo de Terraform en `scan_configs.sh` sin `-P` pese a necesitarlo — MEDIUM (bug independiente, no específico de Mac)
- **Archivo:** `scripts/security/scan_configs.sh` (chequeo de grupos
  de seguridad `0.0.0.0/0` en archivos `.tf`).
- **Descripción:** `grep -B10 'cidr_blocks\s*=\s*...'` usaba sintaxis
  PCRE (`\s`) sin el flag `-P` **incluso antes de este fix** — no es
  un caso que mi sustitución automática debiera tocar (no había `-P`
  que reemplazar), lo encontré al revisar el diff a mano. El
  comportamiento de `\s` sin `-P` en un patrón básico/extendido de
  grep no está definido de forma consistente entre implementaciones:
  es un bug latente independiente del problema de macOS, presente
  probablemente en cualquier plataforma.
- **Fix:** añadido `-P` (`$GREP -PB10 ...`) igual que el resto de
  llamadas del archivo.

## Prioridad de remediación

Todo lo anterior ya está arreglado y en `main`:
- Hallazgo del PR #29 en sí (el comentario que disparaba el falso
  positivo XSS): PR #29, commit `357f442`.
- Hallazgos 1, 2 y 3 de esta revisión: PR #30, commit `a152b3a`.

No queda nada pendiente de esta revisión.

## Estado

- [x] Hallazgo 1 — arreglado, PR #30. Verificado ejecutando los 5
      scanners en local tras el fix: ahora detectan de verdad lo mismo
      que ya detectaba CI (2 acciones de CI/CD ancladas a tag en vez
      de SHA en `.github/workflows/security-scan.yml`, paquetes con
      scope sin `.npmrc`), más un hallazgo esperado y no accionable
      (el propio `.env` local — gitignored, nunca commiteado, target
      legítimo para desarrollo local).
- [x] Hallazgo 2 — arreglado en el mismo PR #30.
- [x] Hallazgo 3 — arreglado en el mismo PR #30.

**Lección para futuras revisiones (segunda vez que se escribe esta
lección — la primera está en `2026-08-11-tooling-bugs.md` y no bastó):**
un comentario que documenta un fix no es el fix. Antes de confiar en
que un scanner "ya soluciona X", hay que comprobar que la variable o
el flag correctivo se usa en **todas** las llamadas reales, no solo en
el preámbulo — y conviene un test explícito (`bash -n` no basta; hace
falta ejecutar el scanner contra una entrada sintética que debería
disparar un hallazgo, y confirmar que lo dispara) tras cualquier
cambio en `scripts/security/*.sh`, no solo mirar que la sintaxis sea
válida.
