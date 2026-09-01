# `git reset`: los tres modos (`--soft`, `--mixed`, `--hard`) y qué mueve cada uno

- **Módulo:** Deshacer cosas
- **Slug:** `git-reset-los-tres-modos-soft-mixed-hard-y-que-mueve-cada-uno` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [git-reset](https://git-scm.com/docs/git-reset) — ver `contenido/git/TEMARIO.md` #24

---

## Un mismo comando, tres alcances distintos

`git reset` mueve el puntero de la rama actual a otro commit — pero lo que hace con las tres áreas (Módulo 1) cambia según el modo. Partiendo de dos commits (`v1`, `v2`) y volviendo a `v1` con `reset HEAD~1`:

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El punto de partida: dos commits",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'v1'", { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } }, "add a.txt", "commit -m 'v2'"],
  "comando": "log --oneline",
  "anotaciones": [
    { "fragmento": "log", "nota": "Dos commits reales. Las tres variantes de reset que siguen parten todas de aquí, y todas terminan con el puntero de la rama en el commit v1 — lo que cambia es el estado del staging y del directorio de trabajo." }
  ]
}
```

## `--soft`: mueve el puntero, deja todo en el staging

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El cambio de v2 sigue listo para confirmar",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'v1'", { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } }, "add a.txt", "commit -m 'v2'", "reset --soft HEAD~1"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"Changes to be committed: modified: a.txt\" — el commit v2 ya no existe como tal, pero su cambio no se ha perdido: está en el staging, como si acabaras de hacer add. Ideal para deshacer un commit y confirmarlo de otra forma." }
  ]
}
```

## `--mixed` (el modo por defecto): mueve el puntero y vacía el staging

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El cambio sigue en el fichero, pero ya no está en el staging",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'v1'", { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } }, "add a.txt", "commit -m 'v2'", "reset --mixed HEAD~1"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"Changes not staged for commit\" — un paso más atrás que --soft: el contenido de v2 sigue en el fichero (nada se pierde), pero hay que volver a hacer git add antes de poder confirmarlo." }
  ]
}
```

## `--hard`: mueve el puntero y descarta todo, incluido el directorio de trabajo

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El cambio de v2 desaparece del todo",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'v1'", { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } }, "add a.txt", "commit -m 'v2'", "reset --hard HEAD~1"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Repositorio completamente limpio — ni staging ni directorio de trabajo tienen rastro de v2. Es el único de los tres modos que toca el directorio de trabajo, y por eso es el más peligroso." }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los tres modos, de menos a más agresivo",
  "roles": [
    { "etiqueta": "--soft", "rol": "Solo mueve el puntero de la rama", "descripcion": "Staging y directorio de trabajo quedan intactos, con el cambio deshecho ya preparado para confirmar." },
    { "etiqueta": "--mixed", "rol": "Mueve el puntero y vacía el staging", "descripcion": "El directorio de trabajo conserva el cambio; hay que volver a añadirlo a mano. Es el modo que usa reset si no le das ningún flag." },
    { "etiqueta": "--hard", "rol": "Mueve el puntero y descarta también el directorio de trabajo", "descripcion": "El único modo que puede perder trabajo sin confirmar de verdad — aunque el commit original al que apuntaba la rama sigue recuperable vía reflog (Módulo 8)." }
  ]
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-reset",
      "descripcion": "Referencia oficial de git reset y sus tres modos.",
      "url": "https://git-scm.com/docs/git-reset",
      "etiqueta": "Git Reference"
    }
  ]
}
```
