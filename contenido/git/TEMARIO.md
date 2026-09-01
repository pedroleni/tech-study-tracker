# Temario de Git — planteado desde cero

**Alcance:** temario completo de la tecnología "Git" nueva en el
catálogo, categoría "Herramientas" (hasta ahora sin ninguna ficha). Nada
de memoria: todo verificado en vivo (`WebFetch` + ejecución real contra
el motor) el 2026-09-01 contra fuentes oficiales — la documentación de
referencia de Git (`git-scm.com/docs`), el libro Pro Git
(`git-scm.com/book`, gratuito y con licencia libre), la especificación
de Conventional Commits (`conventionalcommits.org`) y la documentación
de GitHub (`docs.github.com`). El motor real que ejecuta cada
`git-anotado`/`git-en-vivo` de este temario es `wasm-git` (libgit2 real
compilado a WebAssembly, variante `lg2_async`) — ver
`specs/features/git-en-vivo.md` para la validación empírica original, y
la "Nota técnica" al final de este documento para la ronda adicional de
verificación (`blame`, `cherry-pick`, `bisect`, `commit --amend`, `rm`,
`mv`) hecha al ampliar este temario.

**Por qué el índice mezcla `[vivo]` y `[anotado]`:** a diferencia de SQL
(donde todo se ejecuta en el navegador), Git tiene comandos que ningún
motor de navegador soporta hoy — `rebase` está confirmado ausente tanto
en `wasm-git` como en `isomorphic-git` (mensaje real: "Command not
found: rebase") — y flujos que no existen dentro de un único sandbox
aislado (GitHub de verdad, hooks que requieren un binario externo,
worktrees múltiples con semántica de proceso). Para esos casos, la
lección usa `git-anotado` con salida real capturada por Claude fuera del
navegador (mismo patrón ya usado en Node.js para `fs`/red), nunca salida
inventada.

**De dónde sale el contenido:**

- **[Git Reference Manual](https://git-scm.com/docs)** — patrón de URL
  `https://git-scm.com/docs/git-<comando>`, verificado en vivo. Cubre
  los 27 comandos usados en este temario (`init`, `add`, `commit`,
  `log`, `diff`, `blame`, `status`, `checkout`, `branch`, `merge`,
  `rebase`, `cherry-pick`, `reset`, `revert`, `reflog`, `remote`,
  `clone`, `fetch`, `pull`, `push`, `stash`, `tag`, `config`,
  `gitignore`, `worktree`, `githooks`, `cat-file`, `for-each-ref`).
  Fuente principal de todas las lecciones `[vivo]`.
- **[Pro Git — Getting Started: What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)**
  — verificado en vivo: Git almacena una serie de instantáneas
  (snapshots), no una lista de diferencias por fichero; las tres áreas
  reales son directorio de trabajo, staging area (índice) y directorio
  `.git` (repositorio).
- **[Pro Git — About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control)**
  — verificado en vivo: el problema real que resuelve el control de
  versiones y por qué un sistema distribuido (cada clon es una copia
  completa) es distinto de uno centralizado.
- **[Pro Git — Git Internals: Plumbing and Porcelain](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)**,
  **[Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)**
  y **[Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References)**
  — verificado en vivo: cómo Git guarda blob/tree/commit como objetos
  direccionados por su hash SHA-1, y cómo una rama es literalmente un
  fichero de texto con un hash dentro. Base del Módulo 5 nuevo (Git por
  dentro).
- **[Pro Git — Git Internals: Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)**
  — verificado en vivo: ejemplo real de recuperar un commit "perdido"
  tras un `reset --hard` usando `git reflog`.
- **[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)**
  — verificado en vivo: `feat`/`fix` como tipos obligatorios, estructura
  completa (`tipo(alcance)!: descripción` + cuerpo + pie), `BREAKING
  CHANGE:` en el pie o `!` antes de los dos puntos, y su traducción
  directa a SemVer (`fix`→PATCH, `feat`→MINOR, `BREAKING CHANGE`→MAJOR).
- **[GitHub Docs — About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)**
  y **[GitHub Docs — GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)**
  — verificado en vivo: qué es un pull request, cómo un fork comparte
  datos de Git con su upstream, y los 6 pasos reales del flujo (crear
  rama, cambios, PR, revisión, merge, borrar rama).
- **[A successful Git branching model (nvie.com)](https://nvie.com/posts/a-successful-git-branching-model/)**
  — verificado en vivo, Vincent Driessen, 2010 — fuente primaria
  original de Git Flow (`master`/`develop`/`feature`/`release`/
  `hotfix`), incluida su propia reflexión posterior (2020) de que no
  encaja bien en entornos de entrega continua.
- **[Trunk Based Development](https://trunkbaseddevelopment.com/)** —
  verificado en vivo — fuente de referencia del término: una única rama
  compartida ("trunk"), evitando ramas de desarrollo de larga duración.

## Convenciones compartidas con el resto de temarios

- **`[vivo]` se ejecuta de verdad contra `wasm-git`** dentro del
  sandbox WASM del navegador (`MEMFS`, sin red ni disco real) — cada
  bloque `git-anotado`/`git-en-vivo` embebe su propio `esquemaGit`
  (lista de comandos de setup, autocontenida), igual que `esquemaSql`.
- **`[anotado]` usa salida real capturada fuera del navegador** —
  nunca inventada: comandos ejecutados de verdad por Claude en una
  terminal real (rebase, amend, cherry-pick, hooks, worktrees) o
  fuentes citadas explícitamente (GitHub, Git Flow/GitHub Flow/
  trunk-based).
- **Dos clones del mismo remoto local** para simular trabajo en
  equipo (Módulo 14) — mismo mecanismo de "remoto simulado" ya
  verificado (`git init --bare` + dos `git clone`), sin mecanismo nuevo
  en el motor: el componente solo ve comandos y rutas, no "personas".
- Validar cada lección con el mismo pipeline ya en uso: JSON de cada
  bloque parseado y comprobado contra el Zod real, además de una
  ejecución real de `esquemaGit`+`comando`/`comandoSolucion` contra
  `wasm-git` (Node, sin mocks) antes de publicarse.
- Ningún `comandoSolucion` (comparado en vivo contra lo que teclea el
  alumno) depende de una salida que embeba un **hash o timestamp de
  commit** — `log`, `blame`, `rev-parse`, `for-each-ref`, `reflog`,
  `cat-file -p` sobre un objeto commit, `revert` (su resumen incluye el
  hash revertido)... El hash de un commit se deriva de su timestamp
  real (segundo a segundo); `comandoSolucion` y lo que teclea el alumno
  se ejecutan en dos instantes distintos (uno al montar el bloque, otro
  al escribir), así que dos ejecuciones separadas por más de un segundo
  producen hashes distintos y la comparación falla sin que el alumno
  haya hecho nada mal (lección aprendida dos veces: arreglando un test
  flaky de `GitEnVivo.test.tsx`, y de nuevo al escribir la lección 16
  de este mismo temario, donde `cat-file -p HEAD` se coló con un
  timestamp en `author`/`committer`). **Sí son deterministas** —
  seguros para `comandoSolucion` — `status`, `add`, `checkout -b`,
  `merge` (su mensaje de resultado, "Fast-forward"/"Merge made", no
  lleva hash), `diff` (los hashes que muestra son de **blob**,
  derivados solo del contenido, no del tiempo) y `cat-file -p`/`-t`
  sobre un **blob o tree** (tampoco llevan timestamp — solo el objeto
  commit lo lleva). Cuando la lección quiere enseñar un comando
  inherentemente no determinista (log, blame, reflog...), el bloque
  `git-en-vivo` se usa sin `comandoSolucion` (campo opcional): sandbox
  abierto, sin insignia de acierto/fallo — o directamente como
  `git-anotado`, que no compara nada.

## Módulo 1 — Qué es Git y por qué

**`[anotado]`**

| # | Lección | Fuentes |
|---|---|---|
| 1 | Qué problema real resuelve el control de versiones (y por qué "guardar copias" no basta) | [About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) |
| 2 | Un commit es una fotografía, no una diferencia: cómo almacena datos Git de verdad | [What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) |
| 3 | Las tres áreas: directorio de trabajo, staging (índice) y repositorio | [What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) |

## Módulo 2 — Commits de verdad

**`[vivo]`**

| # | Lección | Fuentes |
|---|---|---|
| 4 | `git init`: crear un repositorio desde cero | [git-init](https://git-scm.com/docs/git-init) |
| 5 | `git add` y el staging: por qué existe un paso intermedio antes de confirmar | [git-add](https://git-scm.com/docs/git-add) |
| 6 | `git commit`: fotografiar el staging, y qué hace un buen mensaje | [git-commit](https://git-scm.com/docs/git-commit) |
| 7 | `git log` y `git diff`: ver el historial y lo que ha cambiado | [git-log](https://git-scm.com/docs/git-log) + [git-diff](https://git-scm.com/docs/git-diff) |
| 8 | `git blame`: quién cambió cada línea y cuándo | [git-blame](https://git-scm.com/docs/git-blame) |

## Módulo 3 — Branching real

**`[vivo]`**

| # | Lección | Fuentes |
|---|---|---|
| 9 | Qué es una rama de verdad: un puntero, no una copia del proyecto | [git-branch](https://git-scm.com/docs/git-branch) |
| 10 | `git checkout -b`: crear y moverte entre ramas | [git-checkout](https://git-scm.com/docs/git-checkout) |
| 11 | Ramas que divergen: dos historias que crecen por separado | [Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) |

## Módulo 4 — Merge

**`[vivo]`**

| # | Lección | Fuentes |
|---|---|---|
| 12 | Fast-forward merge: cuando una rama no ha hecho más que avanzar | [git-merge](https://git-scm.com/docs/git-merge) |
| 13 | Three-way merge: combinar dos historias que sí divergieron | [git-merge](https://git-scm.com/docs/git-merge) |
| 14 | Conflicto real: los marcadores `<<<<<<<`/`=======`/`>>>>>>>` y cómo resolverlos a mano | [git-merge](https://git-scm.com/docs/git-merge) |

## Módulo 5 — Git por dentro: objetos y referencias

**`[vivo]`** — módulo nuevo (añadido tras revisar el temario con el
usuario). Usa exactamente los mismos comandos de plumbing que ya
verificó `specs/features/git-en-vivo.md` para construir `GrafoCommits`
(`cat-file -p`, `for-each-ref`, leer `.git/HEAD`) — aquí se enseñan
explícitamente en vez de quedar ocultos dentro del componente.

| # | Lección | Fuentes |
|---|---|---|
| 15 | Qué es un objeto en Git: SHA-1 como hash del contenido, no un identificador arbitrario | [Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) |
| 16 | Blob, tree y commit: viendo los objetos reales con `cat-file -p` | [Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) + [git-cat-file](https://git-scm.com/docs/git-cat-file) |
| 17 | Las ramas son ficheros: cómo son de verdad las referencias (`.git/refs`, `.git/HEAD`) | [Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References) + [git-for-each-ref](https://git-scm.com/docs/git-for-each-ref) |

## Módulo 6 — Reescribir historia: rebase, amend y cherry-pick

**`[anotado]`** — ninguno de los tres funciona `[vivo]` en este motor,
por tres razones distintas y verificadas por separado (ver "Nota
técnica"): `rebase` no está implementado, `cherry-pick` tampoco, y
`commit --amend` existe pero falla con un bug real de este build
concreto. Salida real capturada fuera del navegador en los tres casos.

| # | Lección | Fuentes |
|---|---|---|
| 18 | Rebase frente a merge: mismo resultado final, historia distinta | [Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) + [git-rebase](https://git-scm.com/docs/git-rebase) |
| 19 | Cuándo usar cada uno (y el peligro real de rebasear algo ya compartido) | [Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) |
| 20 | Rebase interactivo: reescribir, combinar y reordenar commits | [git-rebase](https://git-scm.com/docs/git-rebase) |
| 21 | `commit --amend`: corregir el último commit sin crear uno nuevo | [git-commit](https://git-scm.com/docs/git-commit) |
| 22 | `cherry-pick`: traer un commit concreto de otra rama, sin traerte la rama entera | [git-cherry-pick](https://git-scm.com/docs/git-cherry-pick) |

## Módulo 7 — Deshacer cosas

**`[vivo]`**

| # | Lección | Fuentes |
|---|---|---|
| 23 | Descartar cambios locales antes de confirmar nada | [git-checkout](https://git-scm.com/docs/git-checkout) + [Undoing Things](https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things) |
| 24 | `git reset`: los tres modos (`--soft`, `--mixed`, `--hard`) y qué mueve cada uno | [git-reset](https://git-scm.com/docs/git-reset) |
| 25 | `git revert`: deshacer un commit ya compartido sin reescribir historia | [git-revert](https://git-scm.com/docs/git-revert) |

## Módulo 8 — Reflog

**`[anotado]`** — hallazgo real al verificar contra el motor antes de escribir
este módulo: `reflog` no está soportado por `wasm-git`
("Command not found: reflog", no aparecía en la lista de comandos
validados de `specs/features/git-en-vivo.md` — quedó fuera del `[vivo]`
original por un supuesto no verificado, corregido aquí). Salida real
capturada con el `git` de línea de comandos, mismo patrón que el
Módulo 6.

| # | Lección | Fuentes |
|---|---|---|
| 26 | Por qué casi nada se borra de verdad en Git | [Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery) |
| 27 | `git reflog`: recuperar un commit "perdido" tras un `reset --hard` | [git-reflog](https://git-scm.com/docs/git-reflog) + [Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery) |

## Módulo 9 — Remotos

**`[vivo, local]`** — remoto simulado como repo `--bare` en otra ruta
del mismo sandbox WASM, sin red ni credenciales reales.

| # | Lección | Fuentes |
|---|---|---|
| 28 | Qué es un remoto: otro repositorio, no un servidor mágico | [git-remote](https://git-scm.com/docs/git-remote) |
| 29 | `git clone`: traerte un repositorio completo, no solo su último estado | [git-clone](https://git-scm.com/docs/git-clone) |
| 30 | `fetch` frente a `pull`: traer cambios y decidir cuándo integrarlos | [git-fetch](https://git-scm.com/docs/git-fetch) + [git-pull](https://git-scm.com/docs/git-pull) |
| 31 | `git push` y el tracking de ramas: qué rama remota sigue a cuál local | [git-push](https://git-scm.com/docs/git-push) + [Remote Branches](https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches) |

## Módulo 10 — Stash y tags

**`[vivo]`**

| # | Lección | Fuentes |
|---|---|---|
| 32 | `git stash`: guardar trabajo a medias sin comprometerlo | [git-stash](https://git-scm.com/docs/git-stash) |
| 33 | `git tag`: marcar un commit concreto como un punto fijo (versiones, releases) | [git-tag](https://git-scm.com/docs/git-tag) |

## Módulo 11 — .gitignore y config

**`[vivo]`**

| # | Lección | Fuentes |
|---|---|---|
| 34 | `.gitignore`: qué ignorar y por qué (patrones reales) | [gitignore](https://git-scm.com/docs/gitignore) |
| 35 | `git config`: configuración por repositorio frente a global | [git-config](https://git-scm.com/docs/git-config) |

## Módulo 12 — Worktrees y hooks

**`[anotado]`** — `worktree` y hooks reales (ejecución de un binario
externo) no encajan en un único sandbox WASM; salida real capturada
fuera del navegador.

| # | Lección | Fuentes |
|---|---|---|
| 36 | `git worktree`: varias copias de trabajo del mismo repositorio a la vez | [git-worktree](https://git-scm.com/docs/git-worktree) |
| 37 | Hooks de Git: código que se ejecuta solo, en momentos concretos | [githooks](https://git-scm.com/docs/githooks) |
| 38 | Un hook real: bloquear un commit que no cumple una regla | [githooks](https://git-scm.com/docs/githooks) + [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) |

## Módulo 13 — Flujo real con GitHub

**`[anotado]`** — GitHub real no existe dentro del sandbox; contenido
basado en la documentación oficial de GitHub, citada explícitamente.

| # | Lección | Fuentes |
|---|---|---|
| 39 | Fork frente a rama: cuándo hace falta cada uno | [About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) |
| 40 | Qué es un pull request de verdad (no "una petición", una propuesta de merge) | [About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) |
| 41 | Revisar un diff: qué mirar antes de aprobar un cambio ajeno | [About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) |
| 42 | El ciclo completo: rama → PR → revisión → merge → borrar rama | [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) |

## Módulo 14 — Trabajo en equipo: casos reales

**`[vivo, simulado con 2 clones del mismo remoto local]`** — con una
excepción: la lección 45 (`push --force`) es `[anotado]`, porque
`push --force` en este motor falla con el mismo bug real de
`commit --amend` (ver "Nota técnica" — busca `.git/shallow`, inexistente
incluso en un repo normal). Confirmado al verificar este módulo antes
de escribirlo, igual que el hallazgo de `reflog` en el Módulo 8.

| # | Lección | Fuentes |
|---|---|---|
| 43 | Integrar `main` con frecuencia: por qué esperar empeora el conflicto | [git-merge](https://git-scm.com/docs/git-merge) + [Distributed Workflows](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows) |
| 44 | Dos personas tocan el mismo fichero: qué pasa de verdad al hacer push | [git-push](https://git-scm.com/docs/git-push) |
| 45 | `push --force` ajeno: cuando alguien reescribe una historia que ya tenías | [git-push](https://git-scm.com/docs/git-push) + [git-reflog](https://git-scm.com/docs/git-reflog) |
| 46 | Alguien confirmó directo a `main` por error: cómo deshacerlo sin liarla más | [git-revert](https://git-scm.com/docs/git-revert) |
| 47 | Hotfix urgente con una feature a medias: aislar lo urgente de lo que no lo es | [git-stash](https://git-scm.com/docs/git-stash) + [git-branch](https://git-scm.com/docs/git-branch) |
| 48 | Fusionar un PR: merge, squash o rebase — y reescribir historia ya compartida | [git-merge](https://git-scm.com/docs/git-merge) + [git-rebase](https://git-scm.com/docs/git-rebase) |

## Módulo 15 — Un equipo grande, varias features

**`[anotado]`**

| # | Lección | Fuentes |
|---|---|---|
| 49 | Git Flow: ramas `main`/`develop`/`feature`/`release`/`hotfix` | [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) |
| 50 | GitHub Flow: un único `main` siempre desplegable, todo lo demás en rama corta | [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) |
| 51 | Trunk-based development: integrar en el tronco varias veces al día | [Trunk Based Development](https://trunkbaseddevelopment.com/) |

## Módulo 16 — Estándares reales de mensajes de commit

**`[vivo]`** — corregido tras verificar contra el motor antes de
escribir el módulo: `log` en este build no soporta `--format`/
`--pretty=format:...` (solo `--oneline` o el formato completo, ambos
con hash y fecha reales incrustados) — así que no hay ninguna salida
de comando que muestre "solo el mensaje" de forma determinista para
comparar con `comandoSolucion` (mismo problema de fondo que el hash de
`log --oneline`, documentado en "Convenciones compartidas"). `wasm-git`
tampoco valida el formato del mensaje por sí mismo — acepta cualquier
texto. Las lecciones usan `git-anotado` (comandos reales, mostrados sin
comparar) para ejemplos, y `git-en-vivo` sin `comandoSolucion` (sandbox
abierto) para practicar escribiendo mensajes reales.

| # | Lección | Fuentes |
|---|---|---|
| 52 | Conventional Commits: `feat`/`fix` obligatorios y el resto de tipos | [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) |
| 53 | Alcance, `!` y `BREAKING CHANGE:` — y su relación directa con SemVer | [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) |
| 54 | Las reglas clásicas de un buen mensaje: asunto en imperativo, 50/72 | [git-commit](https://git-scm.com/docs/git-commit) |

## Módulo 17 — Cierre: así usa Git este propio proyecto

**`[anotado]`** — caso real, no un ejemplo de libro: historial real de
este mismo repositorio.

| # | Lección | Fuentes |
|---|---|---|
| 55 | Un caso real de esta sesión: rama, PR y merge a `main` de este proyecto | Historial real de `tech-study-tracker` (rama, PR y commits reales de esta sesión) |

**Total: 55 lecciones en 17 módulos.** Cada lección `[vivo]` trae su
propio ejercicio ejecutable contra `wasm-git` (con verificación de
resultado cuando aplica); cada lección `[anotado]` trae su propia salida
real capturada fuera del navegador. Mismo criterio que SQL/PostgreSQL:
el diseño del Módulo 18 — Proyectos queda pendiente hasta llegar a esa
fase (repos reales en GitHub, un proyecto por escenario que combine
varios módulos — p. ej. montar un flujo de equipo completo con
conflictos, rebase y un hook, o reconstruir el historial de un repo
roto con `reflog`).

## Módulo 18 — Proyectos

Diseño pendiente hasta llegar a esa fase (mismo patrón que
SQL/Node.js/PostgreSQL/TypeScript/JavaScript: repos reales en
`github.com/pedroleni/git-proyectos`, rama `main` con TODOs + rama
`solucion` completa).

## Nota técnica: comandos "avanzados" comprobados contra el motor real

Antes de decidir qué entraba en el Módulo 5 (Git por dentro) y el
Módulo 6 (Reescribir historia), se probaron en vivo contra `wasm-git`
(script Node aislado, sin mocks, mismo patrón que
`specs/features/git-en-vivo.md`) los candidatos que no estaban en la
lista original de comandos verificados:

- **`blame`: funciona de verdad** — salida real confirmada
  (`ba75313ec ( Ana <ana@example.com>            1) v1`), formato
  estándar de `git blame`. Por eso el Módulo 2 lo incluye como `[vivo]`.
- **`cherry-pick`: no soportado** — `"Command not found: cherry-pick"`.
  Por eso el Módulo 6 lo trata como `[anotado]`.
- **`bisect`: no soportado** — `"Command not found: bisect"`. Excluido
  conscientemente de este temario (uso mucho menos frecuente en el día
  a día que rebase/amend/cherry-pick; no compensa el coste de un
  módulo `[anotado]` propio solo para esto).
- **`rm`/`mv`: no soportados** — `"Command not found: rm"` / `"...mv"`.
  Excluidos: se cubren de facto borrando/renombrando el fichero
  directamente en el `FS` (`escribir`) y haciendo `add`, sin que el
  alumno necesite el atajo de `git rm`/`git mv` para entender el
  concepto.
- **`reflog`: no soportado** — `"Command not found: reflog"`. No estaba
  en la lista de comandos validados del spec original; el índice
  aprobado lo etiquetó `[vivo]` por un supuesto nunca comprobado. Al
  intentar escribir el Módulo 8 contra el motor real, la ejecución
  falló — se corrigió el módulo a `[anotado]` antes de escribir
  ninguna lección, no después.
- **`commit --amend`: el comando existe pero falla con un bug real de
  este build concreto** (`lg2_async` 0.0.17) — error real reproducido:
  `"Bad news:\n could not find '/repo/.git/shallow' to stat: No such
  file or directory"`, incluso sobre un repo normal (no shallow). Por
  eso el Módulo 6 lo trata como `[anotado]`, no como `[vivo]` — no es
  una decisión de alcance, es una limitación real y verificada de este
  motor concreto (documentar en la propia lección, igual que se
  documenta el hueco de `rebase` en el spec).
- **`push --force`: el mismo bug exacto que `commit --amend`** — error
  real reproducido: idéntico mensaje sobre `.git/shallow`. Ambos
  comparan probablemente el mismo camino de código interno de
  `lg2_async` 0.0.17 (reescribir una referencia existente). Por eso la
  lección 45 (Módulo 14) es `[anotado]`, con salida real capturada con
  `git` de línea de comandos (dos clones reales, uno reescribe con
  `--amend` + `push --force`, el otro hace `fetch` y ve la divergencia).

## Pendiente antes de escribir la primera lección

- [x] Crear la tecnología "Git" vía el flujo de admin, categoría
  "Herramientas".
- [ ] Confirmar el orden de publicación con el usuario.

## Estado

**Las 55 lecciones están escritas, validadas (Zod real + ejecución
real contra `wasm-git` para cada bloque `[vivo]`, fuente real citada
para cada `[anotado]`) e insertadas como borrador** — verificadas
visualmente con Playwright, sin errores de consola, ninguna publicada
todavía. Dos correcciones reales de alcance surgieron al verificar
contra el motor antes de escribir cada módulo (no asumidas del índice
aprobado): `reflog` no soportado (Módulo 8, pasó a `[anotado]`) y
`push --force` con el mismo bug de `.git/shallow` que `commit --amend`
(lección 45, `[anotado]` dentro de un módulo por lo demás `[vivo]`).
Pendiente: revisión del usuario y decisión de publicación.
