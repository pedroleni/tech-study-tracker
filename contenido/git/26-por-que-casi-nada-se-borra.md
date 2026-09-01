# Por qué casi nada se borra de verdad en Git

- **Módulo:** Reflog
- **Slug:** `por-que-casi-nada-se-borra-de-verdad-en-git` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [Pro Git — Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery) — ver `contenido/git/TEMARIO.md` #26

---

## Un registro aparte, silencioso, de todo lo que hace `HEAD`

En el Módulo 7, `reset --hard` sonaba a "esto puede perder trabajo de verdad". Y en cuanto al directorio de trabajo, es cierto. Pero el commit al que apuntaba la rama **antes** del reset no desaparece del repositorio — sigue guardado, exactamente igual que cualquier otro objeto (Módulo 5). Lo único que falta es una forma de encontrarlo, porque ya no hay ninguna rama que apunte a él.

Esa forma existe: Git lleva, en paralelo al historial normal, un registro separado de cada vez que `HEAD` se movió — el **reflog**.

> **Nota sobre este módulo:** `reflog` no está soportado por el motor de este curso (`wasm-git`) — no aparecía en la lista de comandos que sí funcionan (ver `specs/features/git-en-vivo.md`), algo que se confirmó de nuevo al intentar verificar este módulo antes de escribirlo. Todo lo que sigue es salida real, capturada con `git` real de línea de comandos.

## `git reflog`, tal cual

```text
$ git reflog
385c475 HEAD@{0}: commit: v2 importante, no perder
f6ca680 HEAD@{1}: commit (initial): v1
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El reflog no es el historial del proyecto — es el historial de HEAD.", "texto": "git log cuenta la historia \"oficial\" alcanzable desde la rama actual. reflog cuenta algo distinto: cada sitio por el que HEAD ha pasado en tu copia local, incluidos commits, checkouts, resets, merges — se mueva como se mueva." },
    { "titulo": "HEAD@{0} es \"ahora\", HEAD@{1} es \"un movimiento atrás\".", "texto": "No son commits ni ramas — son posiciones en el tiempo de esta copia local concreta. El reflog de otra persona con el mismo repositorio sería completamente distinto, porque depende de lo que ella hizo, no de lo que hay guardado." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por eso \"perder\" un commit casi nunca es literal",
  "contenido": "Casi todo lo que parece destructivo en Git (reset --hard, un commit --amend, incluso borrar una rama) deja el commit original intacto en el almacén de objetos, y su rastro en el reflog. El único caso realmente destructivo es forzar un git gc antes de que el reflog expire — y aun así, el reflog por defecto no expira antes de 90 días."
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
      "descripcion": "El capítulo de Pro Git sobre cómo Git recupera datos aparentemente perdidos, con el reflog como mecanismo principal.",
      "url": "https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery",
      "etiqueta": "Pro Git"
    }
  ]
}
```
