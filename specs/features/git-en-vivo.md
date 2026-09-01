# Git: nueva tecnología + ejecución real de comandos en el navegador (wasm-git/libgit2)

**Estado:** 📝 diseño aprobado (brainstorming + validación empírica),
pendiente de implementar. El temario (49 lecciones en 16 módulos +
módulo de Proyectos) está aprobado a nivel de índice — el contenido en
detalle se escribe después, módulo a módulo, sin plan formal (mismo
patrón que SQL/PostgreSQL).

**Configuración manual requerida:** ninguna. La tecnología "Git" se
crea vía el flujo de admin ya existente, dentro de la categoría
"Herramientas" (existe, actualmente con 0 fichas) — no hace falta
migración SQL, `technologies`/`lecciones` no ganan columnas nuevas.

## Por qué existe esta feature

"Herramientas" es la única categoría del catálogo sin ninguna ficha.
Git es la pieza de infraestructura más universalmente necesaria y la
que esta propia sesión ha usado sin parar (creación de rama, PR #43,
merge a `main`) — un candidato natural para llenar ese hueco, con el
mismo nivel de "de verdad" que ya tienen SQL/PostgreSQL: no
`codigo-anotado` inventado, sino comandos reales con salida real.

Decisión de alcance confirmada con el usuario (brainstorming +
`AskUserQuestion`, 2026-08-31):

1. **Motor real en el navegador** (no solo contenido anotado + proyectos,
   aunque esa era la opción "simple"): `wasm-git` (libgit2 real
   compilado a WebAssembly), tras verificar en vivo que es
   sustancialmente más fiel que la alternativa (`isomorphic-git`).
2. **Remotos simulados en local**, sin red real ni credenciales: un
   "remoto" es un repo `--bare` en otra ruta del mismo sandbox WASM —
   `clone`/`fetch`/`push` reales, sin exponer nada.
3. **`rebase` queda como contenido anotado** (con salida real capturada
   por Claude fuera del navegador, mismo patrón que Node.js para
   `fs`/red) — ningún motor de navegador viable lo soporta, verificado
   en los dos candidatos.
4. Un componente visual nuevo (`GrafoCommits`) para el grafo de
   commits/ramas, **derivado de datos reales** (nunca dibujado a mano)
   vía comandos de plumbing ya verificados.

## Validación

Antes de fijar el diseño se probaron en vivo (script Node aislado, sin
mocks) las dos alternativas reales de "Git ejecutándose de verdad en
el navegador":

### `isomorphic-git` (JS puro, MIT) — descartado como motor principal

Funciona correctamente para `init`/`add`/`commit`/`branch`/`checkout`/
`merge` fast-forward/`tag`/`stash`, pero con huecos que rompen el
temario planeado:

- **Sin `rebase`** en absoluto (`Object.keys(git)` no contiene ningún
  método con ese nombre).
- **Sin `reset` real** — solo `resetIndex` (equivalente a `reset
  --mixed` sobre el índice, sin los tres modos reales).
- **Un merge con conflicto lanza `MergeConflictError` y aborta**, sin
  dejar el fichero con marcadores `<<<<<<<`/`=======`/`>>>>>>>` para
  resolver a mano — no reproduce el flujo real de un conflicto, que es
  precisamente el momento más importante del módulo de Merge.

### `wasm-git` (libgit2 real vía Emscripten) — elegido

- **Licencia**: GPLv2 + excepción de enlace explícita (el `COPYING` del
  paquete lo confirma) — permite enlazar/distribuir sin restricción
  junto a otro software. npm lo etiqueta "Proprietary" solo porque el
  `package.json` no declara el campo `license`; no es una restricción
  real. Usado en producción por terceros reales (Y42, AutoDev, según su
  propio README).
- **Tamaño**: variante `lg2_async.wasm` (recomendada — corre en el hilo
  principal, sin Web Worker) pesa **1.6 MB**, más ligero que PGlite
  (~10 MB WASM + 6 MB data).
- **Comandos reales confirmados con `callMain`/`callWithOutput`**: `add`,
  `blame`, `cat-file`, `checkout` (incluido `checkout -b` para crear
  ramas), `clone`, `commit`, `config`, `describe`, `diff`, `fetch`,
  `for-each-ref`, `index-pack`, `init`, `log`, `ls-files`, `ls-remote`,
  `merge`, `push`, `remote`, `reset`, `revert`, `rev-list`, `rev-parse`,
  `show-index`, `stash`, `status`, `tag`.
- **Sin `branch`** como comando suelto ("Command not found: branch") —
  se cubre con `checkout -b`, que sí funciona igual que en git real.
- **Sin `rebase`** ("Command not found: rebase") — mismo hueco que
  `isomorphic-git`, confirma que ningún motor de navegador lo soporta
  hoy.
- **Merge con conflicto real, verificado**: el fichero en disco queda
  con marcadores **idénticos** a git real: `<<<<<<< HEAD` /
  `=======` / `>>>>>>> feature`. `git status` muestra el estado de
  conflicto (`conflict: a:a.txt o:a.txt t:a.txt`).
- **`reset --soft/--mixed/--hard`, verificado con semántica correcta**:
  `--hard` descarta el working directory; `--mixed` mueve `HEAD` pero
  deja el fichero sin tocar en disco (confirmado: el contenido seguía
  siendo la versión posterior, con `git status` mostrándolo como
  "Changes not staged"); `--hard` tras `HEAD~1` recupera exactamente el
  commit anterior.
- **`diff` real**: formato unificado estándar (`diff --git a/... b/...`,
  `index ...`, `@@ ... @@`), no una aproximación.
- **`push` no admite argumentos** ("sorry, no arguments supported yet")
  — solo `git push` a secas, usando el tracking que `clone`/`checkout
  -b` configuran automáticamente (confirmado: "Branch 'feature' set up
  to track remote branch 'origin/feature'").
- **`rev-parse --abbrev-ref HEAD` no soportado** — la rama actual se lee
  directamente del fichero `.git/HEAD` vía la API `FS` de Emscripten
  (`ref: refs/heads/<rama>`), confirmado funcionando.
- **Remotos simulados con rutas locales, verificado de punta a punta**:
  `git init --bare /servidor` + `git clone /servidor /local` + commit +
  `git push` (sin argumentos) + un segundo `git clone /servidor
  /local2` que sí trae el fichero recién empujado — todo sin red ni
  credenciales.
- **Aislamiento entre ejecuciones, verificado**: dos llamadas
  independientes al factory (`initGit()`) producen instancias con
  sistemas de ficheros completamente separados — misma garantía que ya
  tienen sql.js/PGlite.
- **Captura de salida real ya integrada**: el propio módulo expone
  `Module.callWithOutput(args)` (visible en el código fuente
  distribuido), que ejecuta el comando, captura `stdout`/`stderr` como
  texto y **lanza con el mensaje de error real si el exit code no es
  0** — no hace falta interceptar `console.log` a mano.
- **Grafo de commits derivable de datos reales**: `rev-list --parents`
  no está soportado ("unable to parse OID"), pero `cat-file -p <hash>`
  sí (devuelve el objeto commit real en texto plano, con una línea
  `parent <hash>` por cada padre — 0 en la raíz, 2+ en un merge) y
  `for-each-ref` da la lista real de ramas con el hash al que apunta
  cada una. Combinado con leer `.git/HEAD` (rama actual), es suficiente
  para reconstruir un grafo real sin necesitar `--parents`.

## Alcance

### 1. Motor: `wasm-git` (variante `lg2_async`)

- Sin licencia npm declarada (ver "Validación") — documentar en el
  spot-check de seguridad que la licencia real (GPLv2 + excepción de
  enlace, ver `COPYING` del paquete) es compatible.
- Se carga una sola vez por sesión del navegador (mismo patrón de caché
  que sql.js/PGlite): el fetch/instanciación del WASM (~1.6 MB) se
  comparte entre bloques; cada ejecución llama de nuevo al factory
  (`initGit()`) para obtener una instancia con sistema de ficheros
  aislado — confirmado que esto no reinstancia el WASM entero, solo
  crea un nuevo estado de `FS`.

### 2. Dos tipos de bloque nuevos: `git-anotado` / `git-en-vivo`

Mismo espíritu que `sql-anotado`/`sql-en-vivo`, sin reutilizar esos
tipos (el dominio es distinto: comandos de shell, no consultas, y el
resultado es texto de terminal, no filas/columnas):

```ts
export const esquemaGitAnotado = z.object({
  tipo: z.literal('git-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  esquemaGit: z.array(z.string().min(1).max(200)).min(1).max(15),
  comando: z.string().min(1).max(200),
  anotaciones: z
    .array(z.object({ fragmento: z.string().min(1), nota: z.string().min(1).max(500) }))
    .min(1)
    .max(8),
})

export const esquemaGitEnVivo = z.object({
  tipo: z.literal('git-en-vivo'),
  consigna: z.string().min(1).max(600).optional(),
  esquemaGit: z.array(z.string().min(1).max(200)).min(1).max(15),
  comandoInicial: z.string().max(200).default(''),
  comandoSolucion: z.string().max(200).optional(),
})
```

`esquemaGit` es un array de comandos (sin el prefijo `git`, ya
implícito) ejecutados en silencio como setup — equivalente a
`esquemaSql`, pero como lista de comandos discretos en vez de un único
bloque de SQL, porque wasm-git ejecuta un comando por llamada a
`callMain`/`callWithOutput`, no un script multi-sentencia.

### 3. Simulación de "equipo" para el módulo de casos reales

Para las lecciones de trabajo en equipo (conflictos entre dos personas,
`push --force` ajeno, hotfix urgente), `esquemaGit` puede incluir
comandos que operan sobre **dos rutas de repo dentro del mismo
sandbox** (p. ej. `/equipo-a` y `/equipo-b`, ambos clonados del mismo
`--bare` en `/remoto`) — no hace falta ningún mecanismo nuevo en el
motor: es el mismo patrón de "remoto local" ya verificado, aplicado dos
veces. El componente no necesita saber que hay "dos personas"; solo ve
comandos y rutas.

### 4. `GrafoCommits`: visualización derivada de datos reales

Nuevo componente (no forma parte del bloque `git-anotado`/`git-en-vivo`
en sí — se activa con un campo opcional `mostrarGrafo: z.boolean()
.default(false)` en ambos esquemas). Cuando está activo, tras ejecutar
`esquemaGit` + `comando`, el motor ejecuta además:

1. `for-each-ref` → parsear `<hash> commit\trefs/heads/<rama>` por
   línea.
2. Para cada hash único alcanzable (unión de `log <cada-rama>
   --oneline`), `cat-file -p <hash>` → parsear `parent <hash>` (0, 1 o
   varias líneas) y el mensaje (texto tras la línea en blanco).
3. Leer `.git/HEAD` vía `FS.readFile` → rama actual.

El resultado (`{ commits: {hash, mensaje, padres}[], ramas: {nombre,
hash}[], ramaActual }`) se pasa a `GrafoCommits`, que calcula un layout
simple (una fila/lane por rama, commits ordenados topológicamente) y
dibuja nodos + líneas con SVG — sin ninguna librería de grafos externa,
dado que los grafos de una lección son pequeños (2-6 commits, 1-3
ramas).

### 5. Resaltado de comandos: reutilizar `'texto'`, sin tokenizador nuevo

`resaltador.ts` ya tiene un modo `'texto'` (sin colorear) en su tipo
`Lenguaje`. El comando y su salida se muestran dentro de
`SalidaTerminal` con estilo de terminal (fondo oscuro, prompt `$`
verde) sin pasar por ningún tokenizador — más simple que SQL/Postgres,
que sí necesitaron ampliar palabras clave.

## Esquema (Zod)

Dos tipos nuevos en el discriminated union de
`src/lib/laboratorio/schemas.ts` (ver "Alcance", punto 2) — a diferencia
de PostgreSQL, aquí SÍ hacen falta tipos nuevos porque el dominio
(comandos + salida de terminal) no encaja en la forma de
`sql-anotado`/`sql-en-vivo` (una única consulta contra filas/columnas).

## Componentes

- `src/lib/git-en-vivo/motor.ts` (+ `.test.ts`, sin mocks, contra
  wasm-git real): `crearMotorGit()` (caché del módulo WASM),
  `ejecutarComandosGit(motor, esquemaGit, comando)` →
  `{ok: true, salida} | {ok: false, mensaje}`, `obtenerGrafo(motor,
  esquemaGit)` → estructura de grafo (ver punto 4), usando
  `callWithOutput` internamente en ambas.
- `src/components/bloques-laboratorio/GitAnotado.tsx` — mismo patrón
  que `SqlAnotado.tsx` (cabecera con icono, botones de anotación
  numerados, nota activa), sustituyendo `CodigoResaltado`+
  `TablaResultado` por `SalidaTerminal` (y `GrafoCommits` si
  `mostrarGrafo`).
- `src/components/bloques-laboratorio/GitEnVivo.tsx` — mismo patrón que
  `SqlEnVivo.tsx` (campo editable, debounce, comparación con la
  solución, botón "Reiniciar").
- `src/components/bloques-laboratorio/SalidaTerminal.tsx` — nuevo,
  renderiza comando + salida/error como bloque de terminal (texto
  monoespaciado, sin tokenizador).
- `src/components/bloques-laboratorio/GrafoCommits.tsx` — nuevo,
  renderiza el grafo real (ver punto 4) como SVG.
- `scripts/dev/generar-wasmgit-assets.mjs` — copia `lg2_async.js` +
  `lg2_async.wasm` (y `COPYING`, por completitud de licencia) a
  `public/`, mismo patrón que `generar-sql-wasm.mjs`/
  `generar-pglite-wasm.mjs`.

## Cambios en archivos existentes

- `src/lib/laboratorio/schemas.ts` — dos tipos nuevos en el
  discriminated union (ver "Esquema").
- `src/lib/git-en-vivo/motor.ts` — nuevo.
- `src/components/bloques-laboratorio/{GitAnotado,GitEnVivo,
  SalidaTerminal,GrafoCommits}.tsx` — nuevos.
- `scripts/dev/generar-wasmgit-assets.mjs` — nuevo.
- `public/` — nuevos assets de wasm-git comiteados (~1.6 MB).
- `package.json` — nueva dependencia: `wasm-git` (fijar versión exacta,
  `0.0.17` o la vigente al implementar, sin `^` — mismo criterio que
  `sql.js`/`@electric-sql/pglite`).
- Tecnología "Git" nueva en el catálogo (vía admin), categoría
  "Herramientas" (existe, hoy con 0 fichas).
- `contenido/git/TEMARIO.md` — nuevo, con el índice ya aprobado (ver
  "Temario aprobado"); las lecciones se escriben después, módulo a
  módulo, sin plan formal.
- `specs/features/README.md` — fila nueva en el índice.

## Temario aprobado (índice — el contenido en detalle se escribe después)

Aprobado por el usuario en brainstorming (2026-08-31). `[vivo]` = se
ejecuta de verdad contra wasm-git; `[anotado]` = salida real capturada
por Claude fuera del navegador (rebase, GitHub, hooks — nada
inventado, pero no ejecutable en un solo sandbox de un navegador).

1. **Qué es Git y por qué** `[anotado]` — el problema real que
   resuelve; un commit como snapshot en un DAG, no "una versión"; las
   tres áreas (working directory/staging/repositorio).
2. **Commits de verdad** `[vivo]` — `init`, `add`, `commit`, `log`,
   `diff`.
3. **Branching real** `[vivo]` — qué es una rama (un puntero), `checkout
   -b`, ramas divergentes.
4. **Merge** `[vivo]` — fast-forward, three-way merge, conflicto real
   (marcadores), resolverlo a mano.
5. **Rebase** `[anotado]` — rebase frente a merge, cuándo usar cada
   uno, el peligro de rebasear algo compartido, rebase interactivo.
6. **Deshacer cosas** `[vivo]` — descartar cambios locales, `reset`
   (los tres modos), `revert`, cuándo usar cada uno.
7. **Reflog** `[vivo]` — por qué casi nada se borra de verdad,
   recuperar un commit "perdido" tras un `reset --hard`.
8. **Remotos** `[vivo, local]` — qué es un remoto, `clone`, `fetch`
   frente a `pull`, `push` y el tracking de ramas.
9. **Stash y tags** `[vivo]`.
10. **`.gitignore` y config** `[vivo]` — patrones reales, `git config`
    por repo/global.
11. **Worktrees y hooks** `[anotado]`.
12. **Flujo real con GitHub** `[anotado]` — fork frente a rama, qué es
    un PR de verdad, revisar un diff.
13. **Trabajo en equipo: casos reales** `[vivo, simulado con 2 clones
    del mismo remoto local]` — integrar `main` con frecuencia; dos
    personas tocan el mismo fichero; `push --force` ajeno rompe tu
    copia; alguien confirmó directo a `main` por error; hotfix urgente
    con una feature a medias; merge/squash/rebase al fusionar un PR;
    reescribir historia ya compartida.
14. **Un equipo grande, varias features** `[anotado]` — Git Flow,
    GitHub Flow y trunk-based development comparados, con fuentes
    reales.
15. **Estándares reales de mensajes de commit** `[vivo]` — Conventional
    Commits (`feat`/`fix` obligatorios + tipos extendidos de Angular),
    el formato completo (`alcance`, `!`, `BREAKING CHANGE:` y su
    relación con SemVer), las reglas clásicas de un buen mensaje
    (asunto en imperativo, 50/72).
16. **Cierre: así usa Git este propio proyecto** `[anotado]` — caso
    real de esta misma sesión (rama `feature/editor-en-vivo-proyectos-
    html`, PR #43, merge a `main`).
17. **Proyectos** — 4 proyectos avanzados con repos reales (mismo
    patrón que SQL/Node.js/PostgreSQL); diseño pendiente hasta llegar a
    esa fase.

**Total: 49 lecciones en 16 módulos, más el módulo de Proyectos.**

**Nota posterior (ampliación del temario, 2026-09-01):** al escribir
`contenido/git/TEMARIO.md`, una revisión conjunta con el usuario sobre
si este índice era "suficientemente completo y avanzado" detectó huecos
reales, verificados contra el motor (no asumidos): `git blame` funciona
en `wasm-git` y no estaba cubierto; `cherry-pick`/`commit --amend` son
comandos del día a día ausentes del temario (el primero no soportado
por este motor, el segundo con un bug real de este build concreto —
ver la "Nota técnica" de `contenido/git/TEMARIO.md`); y no había ningún
módulo sobre cómo funciona Git por dentro (objetos/SHA-1/referencias),
pese a que `GrafoCommits` ya depende de esos mismos comandos de
plumbing. Resultado aprobado: **55 lecciones en 17 módulos** (más el
módulo de Proyectos) — un módulo nuevo "Git por dentro: objetos y
referencias" `[vivo]` insertado tras Merge, `blame` añadido al módulo de
Commits, y `commit --amend`/`cherry-pick` añadidos como `[anotado]`
junto a Rebase (módulo renombrado a "Reescribir historia: rebase,
amend y cherry-pick"). El índice de más abajo queda como registro
histórico de lo aprobado en el brainstorming original;
`contenido/git/TEMARIO.md` es la fuente de verdad actual.

## Checkpoints de seguridad

- **Una dependencia npm nueva** → aplica
  `security-code-vulns.md`/`security-supply-chain.md`: confirmar que
  `wasm-git` en npm resuelve al mismo repositorio
  `petersalomonsen/wasm-git` de GitHub (sin typosquatting). Fijar
  versión exacta (sin `^`).
- **Licencia sin declarar en `package.json`** — documentar
  explícitamente en el PR que la licencia real (ver `COPYING`
  distribuido con el paquete: GPLv2 + excepción de enlace) es
  compatible con el uso en este proyecto; no bloquea el checkpoint pero
  debe quedar por escrito, no asumido.
- **Ejecución de comandos arbitrarios**: `esquemaGit`/`comando` vienen
  del propio contenido de la lección (autoría interna, no input de un
  usuario final) — mismo modelo de confianza que `esquemaSql`. El motor
  corre enteramente en el sandbox WASM del navegador del alumno, sobre
  un `FS` en memoria (MEMFS) que no toca el disco real ni hace red
  real — ni siquiera con `clone`/`fetch`/`push`, que solo hablan con
  otra ruta dentro del mismo `FS` en memoria.
- **`SalidaTerminal`/`GrafoCommits` renderizan texto/SVG generado desde
  datos parseados, nunca HTML crudo** — mismo checkpoint ya verificado
  para `TablaResultado`.
- **El motor corre en el hilo principal, fuera de cualquier iframe** —
  mismo argumento que SQL/PostgreSQL.
- Límites de longitud en los campos nuevos del esquema Zod, mismo
  criterio que el resto de tipos de bloque.

## Checklist de implementación

- [ ] Esquema Zod: `esquemaGitAnotado`/`esquemaGitEnVivo` nuevos en el
  discriminated union, con tests — Claude, TDD
- [ ] `src/lib/git-en-vivo/motor.ts` + tests con wasm-git real (sin
  mocks): `crearMotorGit`, `ejecutarComandosGit`, `obtenerGrafo`,
  incluido un test explícito de merge con conflicto real (marcadores) y
  uno de aislamiento entre ejecuciones — Codex
- [ ] `scripts/dev/generar-wasmgit-assets.mjs` — Codex
- [ ] `npm install wasm-git@<versión fijada>` — Claude (sandbox de
  Codex sin acceso a red)
- [ ] `src/components/bloques-laboratorio/SalidaTerminal.tsx` — Codex
- [ ] `src/components/bloques-laboratorio/GrafoCommits.tsx` — Codex
- [ ] `src/components/bloques-laboratorio/GitAnotado.tsx`/
  `GitEnVivo.tsx` — Codex
- [ ] Añadidos al catálogo de referencia
  (`AdminReferenciaContenidoPage`) para verificación visual sin
  necesitar contenido todavía
- [ ] Verificación visual (Playwright, credenciales reales de admin):
  un bloque `git-anotado` normal, un `git-en-vivo` con conflicto real
  resuelto, y un `GrafoCommits` mostrando una divergencia de ramas real
- [ ] `npm run build`/`lint`/`test` en verde
- [x] Tecnología "Git" creada vía admin, categoría "Herramientas"
- [x] `contenido/git/TEMARIO.md` escrito con el índice ya aprobado (ver
  "Temario aprobado" — ampliado a 55 lecciones/17 módulos tras la
  revisión de completitud, ver la nota posterior más arriba)
- [x] Lecciones escritas e insertadas como borrador — cada comando
  ejecutado de verdad contra wasm-git antes de escribirse (no
  asumido); rebase/amend/cherry-pick/reflog/push --force/GitHub/hooks/
  Git Flow con salida real capturada fuera del navegador (git de línea
  de comandos, o documentación oficial citada), nunca inventada.
  Pendiente: publicación (decisión del usuario)
- [ ] `specs/features/README.md` — fila añadida, estado actualizado
- [ ] Spot-check de seguridad final: `wasm-git` es el paquete oficial;
  licencia documentada por escrito; sin `dangerouslySetInnerHTML`
  nuevo; sin migraciones nuevas (sin superficie RLS nueva en Supabase)
