# Auditoría de seguridad — SQL en vivo (sql.js/WASM)

**Fecha:** 2026-08-31
**Alcance:** feature completa "SQL en vivo" — ejecución real de SQL en el
navegador vía sql.js (SQLite compilado a WebAssembly), commits
`9535de7^..41b1851`. Motivo: 3 dependencias npm nuevas
(`sql.js@1.14.2`, `@types/sql.js@1.4.11`, `@codemirror/lang-sql@6.10.0`)
más ejecución de código SQL arbitrario escrito por el alumno.
**Método:** 8 subagentes especializados (`.claude/agents/security-*.md`)
en paralelo, orquestados vía `/security-review`.

Ficheros auditados (20, diff completo `9535de7~1..41b1851`):

```
docs/superpowers/plans/2026-08-30-sql-en-vivo.md   (nuevo)
package-lock.json                                  (modificado)
package.json                                       (modificado)
public/sql-wasm.wasm                               (nuevo, binario)
scripts/dev/generar-sql-wasm.mjs                   (nuevo)
specs/features/README.md                           (modificado)
specs/features/sql-en-vivo.md                      (nuevo)
src/components/bloques-laboratorio/SqlAnotado.tsx  (nuevo)
src/components/bloques-laboratorio/SqlEnVivo.tsx   (nuevo)
src/components/bloques-laboratorio/TablaResultado.test.tsx (nuevo)
src/components/bloques-laboratorio/TablaResultado.tsx (nuevo)
src/components/bloques-laboratorio/registro.ts     (modificado)
src/components/codigo/resaltador.test.ts           (modificado)
src/components/codigo/resaltador.ts                (modificado)
src/lib/laboratorio/schemas.test.ts                (modificado)
src/lib/laboratorio/schemas.ts                     (modificado)
src/lib/sql-en-vivo/motor.test.ts                  (nuevo)
src/lib/sql-en-vivo/motor.ts                       (nuevo)
src/routes/AdminReferenciaContenidoPage.test.tsx   (modificado)
src/routes/AdminReferenciaContenidoPage.tsx        (modificado)
```

---

## Resumen ejecutivo

- **Nivel de riesgo global: LOW** (sin hallazgos reales)
- **Risk score: 0/100**
- **Conteo de hallazgos por severidad:** 0 CRITICAL, 0 HIGH, 0 MEDIUM, 0 LOW, 0 INFO
- **Top hallazgos:** ninguno — los 8 subagentes reportaron 0 hallazgos con confianza >80% en sus respectivos dominios.

## Hallazgos por severidad

Ninguno. Cada uno de los 8 dominios se reporta con la evidencia concreta
recogida (no como una simple ausencia de resultado):

**1. `security-agent-env`** — 0 hallazgos. El feature no tocó
`CLAUDE.md`, `AGENTS.md`, ningún fichero bajo `.claude/`, config de MCP
ni `scripts/security/`. El nuevo `scripts/dev/generar-sql-wasm.mjs` solo
copia un binario (`fs.copyFileSync`) dentro de `public/`, sin red, sin
`eval`, sin engancharse a ningún lifecycle hook de npm (`postinstall`/
`preinstall`) — se invoca solo manualmente.

**2. `security-secrets`** — 0 hallazgos. `scan_secrets.sh` limpio + grep
manual de patrones de `SUPABASE_SERVICE_ROLE_KEY`/AWS/claves privadas sin
coincidencias. El binario `public/sql-wasm.wasm` tiene el mismo SHA-256
(`38c14f6e...`) que `node_modules/sql.js/dist/sql-wasm.wasm` — copia
íntegra del artefacto oficial, sin datos embebidos. La feature no importa
`@supabase/supabase-js` ni variables `VITE_*` en ningún fichero.

**3. `security-code-vulns`** — 0 hallazgos. Carga de sql.js vía `import()`
estático + `fetch('/sql-wasm.wasm')` same-origin fijo (sin SSRF). Cada
`ejecutarConsulta()` crea y cierra una `Database` en memoria nueva
(aislamiento real alumno/solución, verificado con test propio sin mocks).
Mensajes de error de SQLite y resultados se renderizan siempre como
children de JSX. Regexes nuevas del tokenizador SQL (`resaltador.ts`)
ancladas con `^`, sin riesgo de ReDoS; longitudes ya acotadas por Zod.

**4. `security-supply-chain`** — 0 hallazgos. Los 3 paquetes son los
oficiales (verificado publisher/repo: `sql-js/sql.js`,
`DefinitelyTyped/DefinitelyTyped`, `codemirror/lang-sql`), fijados a
versión exacta, integridad del lockfile verificada byte a byte contra el
registro público. `npm audit --production`: 0 hallazgos en 230
dependencias. El script `prepare` de `@codemirror/lang-sql` no se ejecuta
al instalarse como dependencia (mismo patrón ya presente con
`lang-html`/`lang-css`).

**5. `security-injection`** — 0 hallazgos. `TablaResultado.tsx` renderiza
cabeceras y celdas exclusivamente como children de React (`{columna}`,
`{String(valor)}`), con test de regresión propio que inyecta
`<img src=x onerror=alert(1)>` como valor de celda y confirma que no se
interpreta como HTML. Cero apariciones reales de `dangerouslySetInnerHTML`
en todo el árbol del feature (solo un comentario explicando por qué se
evita).

**6. `security-auth-crypto`** — 0 hallazgos, confirmado explícitamente:
feature 100% client-side. Sin migraciones nuevas, sin tablas nuevas, sin
tocar RLS (`git log` sobre `supabase/migrations` en el rango del feature:
vacío). `AdminReferenciaContenidoPage.tsx` solo añade dos entradas al
catálogo de referencia ya existente, sin tocar el guard de admin
(`AdminRoute`/`useProfile().isAdmin`, intacto).

**7. `security-infrastructure`** — 0 hallazgos. Sin cambios a
`.github/workflows`, `vercel.json` ni migraciones. El binario `.wasm` se
carga vía `fetch` + `.arrayBuffer()` (no streaming), por lo que no
depende del `Content-Type` que sirva el host — evita precisamente el
problema de MIME que rompe `WebAssembly.instantiateStreaming` en hosts
mal configurados. 658 KB, muy por debajo de cualquier límite de Vercel.

**8. `security-prompt-injection`** — 0 hallazgos. Sin caracteres Unicode
invisibles/bidi, sin instrucciones dirigidas a agentes ocultas en specs,
plan o código. Las menciones a "Claude"/"Codex" en la spec y el plan son
asignación de tareas legítima del propio flujo de trabajo del proyecto.
Confirmado que ningún resultado de consulta SQL ni contenido de lección
tiene, hoy, ningún camino hacia un agente de IA (sql.js corre 100% en el
hilo principal del navegador, sin red ni LLM en el flujo).

## Prioridad de remediación

Ninguna — no hay hallazgos CRITICAL, HIGH ni MEDIUM que remediar.

## Estado

- [x] Auditoría completa realizada — 8/8 dominios, 0 hallazgos reales, sin necesidad de remediación.
