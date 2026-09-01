# `git worktree`: varias copias de trabajo del mismo repositorio a la vez

- **Módulo:** Worktrees y hooks
- **Slug:** `git-worktree-varias-copias-de-trabajo-del-mismo-repositorio-a-la-vez` (autogenerado del título)
- **Orden:** 360
- **Fuentes:** [git-worktree](https://git-scm.com/docs/git-worktree) — ver `contenido/git/TEMARIO.md` #36

---

## El problema: solo puedes estar en una rama a la vez

Un repositorio normal tiene un único directorio de trabajo — cambiar de rama con `checkout` reescribe esos ficheros en el sitio. Si tienes cambios sin terminar en `feature` y necesitas atender un hotfix urgente en `master`, la opción tradicional es `stash` (Módulo 10) o confirmar algo a medias. `git worktree` ofrece otra: **una segunda carpeta**, con su propia rama activa, apuntando al mismo repositorio.

> **Nota sobre este módulo:** `git worktree` implica varios procesos/directorios reales del sistema de ficheros, algo que no encaja en un único sandbox de navegador. Salida real, capturada con `git` de línea de comandos.

## Crear un worktree nuevo

```text
$ git worktree list
/ruta/al/proyecto  656bf2b [master]

$ git worktree add ../hotfix-wt -b hotfix
Preparing worktree (new branch 'hotfix')
HEAD is now at 656bf2b base

$ git worktree list
/ruta/al/proyecto        656bf2b [master]
/ruta/al/hotfix-wt        656bf2b [hotfix]
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "-b hotfix crea la rama a la vez que el worktree",
  "contenido": "Es el mismo checkout -b de siempre (Módulo 3), solo que en vez de moverte tú a esa rama en el mismo sitio, Git prepara una carpeta nueva completa con esa rama ya activa — tu carpeta original se queda exactamente como estaba, en master."
}
```

## Dos carpetas, completamente independientes

```text
$ cd ../hotfix-wt
$ echo "cambio urgente" > a.txt
$ git status
On branch hotfix
Changes not staged for commit:
	modified:   a.txt

$ cd /ruta/al/proyecto
$ git status
On branch master
nothing to commit, working tree clean
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Un cambio en un worktree no aparece en el otro.", "texto": "Aunque ambas carpetas apuntan al mismo repositorio (mismo .git, mismos objetos, mismo historial), cada una tiene su propio directorio de trabajo y su propio staging — completamente aislados." },
    { "titulo": "No se puede tener la misma rama activa en dos worktrees a la vez.", "texto": "Git lo bloquea explícitamente — cada rama solo puede estar \"en uso\" en un sitio, para evitar que dos carpetas se pisen entre sí sin saberlo." },
    { "titulo": "Cuando ya no hace falta, se retira con worktree remove.", "texto": "A diferencia de simplemente borrar la carpeta a mano, remove también limpia la referencia interna que Git guarda de ese worktree." }
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
      "titulo": "git-worktree",
      "descripcion": "Referencia oficial de git worktree.",
      "url": "https://git-scm.com/docs/git-worktree",
      "etiqueta": "Git Reference"
    }
  ]
}
```
