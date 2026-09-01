# `git reflog`: recuperar un commit "perdido" tras un `reset --hard`

- **Módulo:** Reflog
- **Slug:** `git-reflog-recuperar-un-commit-perdido-tras-un-reset-hard` (autogenerado del título)
- **Orden:** 270
- **Fuentes:** [Pro Git — Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery) — ver `contenido/git/TEMARIO.md` #27

---

## El escenario: un `reset --hard` por error

```text
$ git log --oneline
385c475 v2 importante, no perder
f6ca680 v1

$ git reset --hard HEAD~1
HEAD is now at f6ca680 v1

$ git log --oneline
f6ca680 v1
```

El commit `385c475` ("v2 importante, no perder") ha desaparecido del historial visible. Entrar en pánico aquí es el error — no hace falta.

## El reflog todavía lo tiene

```text
$ git reflog
f6ca680 HEAD@{0}: reset: moving to HEAD~1
385c475 HEAD@{1}: commit: v2 importante, no perder
f6ca680 HEAD@{2}: commit (initial): v1
```

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "El propio reset queda registrado en el reflog",
  "contenido": "HEAD@{0} es el reset en sí — HEAD acaba de moverse a f6ca680. Pero HEAD@{1}, justo debajo, es el estado ANTERIOR al reset: el commit 385c475, con su mensaje intacto. Ahí está el hash que hace falta para recuperarlo."
}
```

## Recuperarlo: una rama nueva apuntando a ese hash

```text
$ git checkout -b recuperada 385c475

$ git log --oneline
385c475 v2 importante, no perder
f6ca680 v1
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "checkout -b <nombre> <hash> funciona con cualquier hash, no solo con nombres de rama.", "texto": "Ya lo viste en el Módulo 3 con nombres de rama — pero un hash de commit vale exactamente igual. En cuanto una rama apunta a él, ese commit vuelve a ser \"alcanzable\" y ya no depende del reflog para sobrevivir." },
    { "titulo": "Esto funciona porque el commit nunca se borró — solo dejó de tener una rama que apuntara a él.", "texto": "Es la misma idea del Módulo 5: un commit es un objeto guardado por su hash. reset --hard mueve el puntero de la rama, no borra el objeto al que apuntaba antes." }
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
      "titulo": "Pro Git — Maintenance and Data Recovery",
      "descripcion": "Incluye el ejemplo real de recuperación de un commit tras un reset --hard usado como base de esta lección.",
      "url": "https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery",
      "etiqueta": "Pro Git"
    }
  ]
}
```
