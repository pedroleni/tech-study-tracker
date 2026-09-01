# Rebase frente a merge: mismo resultado final, historia distinta

- **Módulo:** Reescribir historia: rebase, amend y cherry-pick
- **Slug:** `rebase-frente-a-merge-mismo-resultado-final-historia-distinta` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [Pro Git — Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) + [git-rebase](https://git-scm.com/docs/git-rebase) — ver `contenido/git/TEMARIO.md` #18

---

## Un motor distinto para el mismo problema

`merge` (Módulo 4) integra dos ramas creando un commit nuevo con dos padres — la historia queda tal cual pasó, con la divergencia visible. `rebase` resuelve el mismo problema de otra forma completamente distinta: **reescribe** los commits de una rama para que parezcan haber empezado desde un punto más reciente, como si nunca hubieran divergido.

> **Nota sobre este módulo:** ningún motor de navegador soporta `rebase` — ni el de este curso (`wasm-git`), ni ninguna alternativa evaluada (ver `specs/features/git-en-vivo.md`). Todo lo que sigue es salida **real**, capturada ejecutando el `git` real de línea de comandos — nada inventado, pero tampoco ejecutable dentro de este mismo navegador.

## Antes: dos ramas divergentes

```text
$ git log --oneline --all --graph
* c896459 master: correccion urgente
| * c49915a feature: segunda funcionalidad
| * 3d822a6 feature: primera funcionalidad
|/
* 316ee3f Actualiza a.txt a la version 2
* 8e2e33d Primera version de a.txt
```

## Después de `git rebase master` (estando en `feature`)

```text
$ git rebase master
Rebasing (1/2)
Rebasing (2/2)
Successfully rebased and updated refs/heads/feature.

$ git log --oneline --all --graph
* 88d7615 feature: segunda funcionalidad
* f84e2d5 feature: primera funcionalidad
* c896459 master: correccion urgente
* 316ee3f Actualiza a.txt a la version 2
* 8e2e33d Primera version de a.txt
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los hashes cambiaron: 3d822a6 → f84e2d5, c49915a → 88d7615",
  "contenido": "Esto no es un detalle menor — son commits NUEVOS. Rebase no mueve los commits originales; crea copias con el mismo contenido pero un padre distinto (ahora c896459 en vez de 316ee3f), y esas copias tienen hashes nuevos porque el hash depende de quién es el padre. Los commits originales de feature quedan huérfanos, sin ninguna rama que los señale."
}
```

## El resultado final se parece al de un merge — pero la historia no

```text
MERGE (Módulo 4):

* c3f2a91 Merge branch 'feature'
|\
| * c49915a feature: segunda
| * 3d822a6 feature: primera
* | c896459 master: urgente
|/
* 316ee3f base

Dos padres, historia real preservada.
```

```text
REBASE (esta lección):

* 88d7615 feature: segunda
* f84e2d5 feature: primera
* c896459 master: urgente
* 316ee3f base

Un solo padre por commit, historia lineal — pero reescrita.
```

El contenido final del proyecto es el mismo en los dos casos. Lo que cambia es cómo queda contado el historial: con ramas visibles y un commit de merge, o como si `feature` se hubiera escrito de un tirón sobre la versión más reciente de `master`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pro Git — Rebasing",
      "descripcion": "El capítulo de Pro Git sobre rebase, con ejemplos y el mismo modelo usado aquí.",
      "url": "https://git-scm.com/book/en/v2/Git-Branching-Rebasing",
      "etiqueta": "Pro Git"
    },
    {
      "titulo": "git-rebase",
      "descripcion": "Referencia oficial de git rebase.",
      "url": "https://git-scm.com/docs/git-rebase",
      "etiqueta": "Git Reference"
    }
  ]
}
```
