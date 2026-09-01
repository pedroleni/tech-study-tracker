# `git stash`: guardar trabajo a medias sin comprometerlo

- **Módulo:** Stash y tags
- **Slug:** `git-stash-guardar-trabajo-a-medias-sin-comprometerlo` (autogenerado del título)
- **Orden:** 320
- **Fuentes:** [git-stash](https://git-scm.com/docs/git-stash) — ver `contenido/git/TEMARIO.md` #32

---

## Un cambio a medias, y una interrupción urgente

Estás en mitad de algo, sin terminar de decidir cómo confirmarlo, y necesitas cambiar de rama o probar otra cosa sin ensuciar ese trabajo con un commit a medio hacer. `git stash` guarda el estado actual del directorio de trabajo aparte, y lo deja todo limpio otra vez — sin confirmar nada.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un cambio sin confirmar, guardado aparte",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", { "escribir": { "ruta": "a.txt", "contenido": "cambio a medias, no listo para commit\n" } }],
  "comando": "stash",
  "anotaciones": [
    { "fragmento": "stash", "nota": "\"Saved working directory WIP on master\" — el cambio queda guardado en un sitio aparte (no es un commit normal del historial), y el directorio de trabajo vuelve a estar limpio, como si el cambio nunca hubiera existido." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El directorio de trabajo, ya limpio",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", { "escribir": { "ruta": "a.txt", "contenido": "cambio a medias, no listo para commit\n" } }, "stash"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Sin ningún cambio pendiente — puedes cambiar de rama, hacer pull, lo que necesites, sin que este cambio a medias se interponga." }
  ]
}
```

## Recuperarlo cuando estés listo

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "stash pop devuelve el cambio guardado",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", { "escribir": { "ruta": "a.txt", "contenido": "cambio a medias, no listo para commit\n" } }, "stash"],
  "comando": "stash pop",
  "anotaciones": [
    { "fragmento": "pop", "nota": "\"Dropped refs/stash@{0}\" — el cambio vuelve al directorio de trabajo, exactamente como estaba, y desaparece de la lista de guardados. \"Pop\" es literal: sacar el último elemento guardado." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Puede haber más de un stash guardado a la vez.", "texto": "git stash list los muestra todos, numerados (stash@{0} el más reciente, stash@{1} el anterior...). Cada git stash nuevo añade uno más a la pila, sin tocar los que ya había." },
    { "titulo": "stash pop quita el guardado; stash apply lo deja.", "texto": "Si quieres aplicar el mismo cambio guardado más de una vez (por ejemplo, en dos ramas distintas), apply lo copia sin borrarlo de la lista — pop sí lo borra tras aplicarlo." }
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
      "titulo": "git-stash",
      "descripcion": "Referencia oficial de git stash.",
      "url": "https://git-scm.com/docs/git-stash",
      "etiqueta": "Git Reference"
    }
  ]
}
```
