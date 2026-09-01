# Un caso real de esta sesión: rama, PR y merge a `main` de este proyecto

- **Módulo:** Cierre: así usa Git este propio proyecto
- **Slug:** `un-caso-real-de-esta-sesion-rama-pr-y-merge-a-main-de-este-proyecto` (autogenerado del título)
- **Orden:** 550
- **Fuentes:** Historial real de `tech-study-tracker` (rama, PR y commits reales de esta sesión) — ver `contenido/git/TEMARIO.md` #55

---

## El propio mecanismo de este curso, construido con lo que acabas de aprender

Todo lo visto en este temario — ramas, commits, merge, PR, revisión — no es un ejercicio de laboratorio aislado. Es exactamente cómo se construyó **este mismo curso de Git**. El motor `wasm-git` que ha ejecutado cada comando real de este temario llegó al proyecto a través de un pull request real, con su propia rama, sus propios commits, y su propio merge.

> **Nota sobre esta lección:** nada de lo que sigue está inventado ni es un ejemplo de libro — es el historial real de este repositorio, consultado con `git log` y `gh pr view` sobre el proyecto de verdad.

## La rama: `feature/git-en-vivo`

```text
$ git log --oneline feature/git-en-vivo
19d4cb6 Merge pull request #44 from pedroleni/feature/git-en-vivo
2d65191 feat(referencia): ejemplos de GitAnotado/GitEnVivo/GrafoCommits
06fc6c3 fix(git-en-vivo): usar instantiateWasm real en vez de wasmBinary (no leído)
fb77c40 feat(git-en-vivo): registrar bloques, instalar wasm-git, generar assets
2a0611a feat(bloques-laboratorio): GitEnVivo
4eecd91 feat(bloques-laboratorio): GitAnotado
c33d1a8 feat(bloques-laboratorio): GrafoCommits — grafo real con layout por carriles
7ff2305 feat(bloques-laboratorio): SalidaTerminal
f2c4b69 feat(git-en-vivo): motor real con wasm-git — ejecutarComandosGit + obtenerGrafo
39e01cd feat(laboratorio): esquemas git-anotado y git-en-vivo
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El orden de los commits cuenta su propia historia.", "texto": "Primero los esquemas de datos (39e01cd), luego el motor que los ejecuta (f2c4b69), luego cada componente visual uno a uno (SalidaTerminal, GrafoCommits, GitAnotado, GitEnVivo), y un fix real (06fc6c3) encontrado durante el propio desarrollo — antes de llegar al merge." },
    { "titulo": "Los mensajes siguen el formato del Módulo 16, sin excepción.", "texto": "feat(...)/fix(...) con alcance entre paréntesis, en cada uno de los 10 commits — la misma convención que se acaba de estudiar, aplicada de verdad, no como ejemplo aislado." }
  ]
}
```

## El pull request real (Módulo 13)

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "PR #44 — datos reales, consultados con gh pr view",
  "contenido": "\"feat: Git en vivo — mecanismo (motor wasm-git, bloques, grafo de commits)\" — 11 commits, 25 ficheros cambiados, 4949 líneas añadidas, fusionado el 31 de agosto de 2026. El propio motor que ejecutó el comando que acabas de ver arriba llegó a este proyecto exactamente así."
}
```

## El merge (Módulo 4 y Módulo 14)

```text
$ git show --stat 19d4cb6
commit 19d4cb664b63320a47d8e593e9821cb4f7461f4d
Merge: 2f08493 2d65191
Author: Pedro Lérida Nieto <...>
Date:   Mon Aug 31 23:52:47 2026 +0200

    Merge pull request #44 from pedroleni/feature/git-en-vivo

    feat: Git en vivo — mecanismo (motor wasm-git, bloques, grafo de commits)

 docs/superpowers/plans/2026-08-31-git-en-vivo.md   | 1942 ++++++++++
 public/lg2-async.wasm                              |  Bin 0 -> 1625649 bytes
 src/components/bloques-laboratorio/GitAnotado.tsx  |  127 ++
 ...
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"Merge: 2f08493 2d65191\" — dos padres, tal cual el Módulo 4",
  "contenido": "Exactamente el mismo patrón visto con wasm-git al principio de este temario: un commit de merge real, con dos padres — uno la punta de main en ese momento, el otro la punta de la rama feature/git-en-vivo. No hay ninguna diferencia mecánica entre esto y los ejercicios de las primeras lecciones; solo la escala del cambio real."
}
```

## De vuelta al principio

```laboratorio
{
  "tipo": "roles",
  "titulo": "Este temario, resumido en lo que ya sabes",
  "roles": [
    { "etiqueta": "El commit (Módulo 1-2)", "rol": "Cada uno de los 10 commits de arriba", "descripcion": "Una fotografía real del proyecto en un momento concreto, con su propio hash, su autor y su mensaje." },
    { "etiqueta": "La rama (Módulo 3)", "rol": "feature/git-en-vivo", "descripcion": "Un puntero que avanzó de forma independiente mientras main seguía su propio camino." },
    { "etiqueta": "El merge (Módulo 4)", "rol": "19d4cb6", "descripcion": "Un commit real con dos padres, uniendo semanas de trabajo en un único historial." }
  ]
}
```

No hay un "modo avanzado" distinto al que ya conoces — el flujo real de un proyecto real es exactamente esto, repetido cientos de veces.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "El propio repositorio de este curso",
  "recursos": [
    {
      "titulo": "tech-study-tracker en GitHub",
      "descripcion": "El repositorio real cuyo historial se ha usado en esta lección.",
      "url": "https://github.com/pedroleni/tech-study-tracker",
      "etiqueta": "GitHub"
    }
  ]
}
```
