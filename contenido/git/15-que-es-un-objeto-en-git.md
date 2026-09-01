# Qué es un objeto en Git: SHA-1 como hash del contenido, no un identificador arbitrario

- **Módulo:** Git por dentro: objetos y referencias
- **Slug:** `que-es-un-objeto-en-git-sha-1-como-hash-del-contenido-no-un-identificador-arbitrario` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [Pro Git — Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) — ver `contenido/git/TEMARIO.md` #15

---

## El hash no lo inventa Git — lo calcula

Cada commit tiene un identificador larguísimo (el hash) que hasta ahora has visto como una etiqueta rara. No es aleatorio ni secuencial — es el resultado de aplicar SHA-1 al contenido exacto de ese objeto. Mismo contenido, mismo hash, siempre. Contenido distinto, hash completamente distinto.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Preguntarle a Git qué tipo de objeto es un hash",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "hola\n" } }, "add a.txt", "commit -m 'Primer commit'"],
  "comando": "cat-file -t HEAD",
  "anotaciones": [
    { "fragmento": "-t", "nota": "El flag -t (type) le pregunta a Git de qué tipo es el objeto al que apunta HEAD, sin mostrar su contenido todavía. La respuesta — commit — confirma que, por dentro, HEAD apunta a un objeto real guardado con ese hash." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El hash identifica el contenido, no una posición en una lista.", "texto": "No hay un \"commit número 1, número 2, número 3\" — cada commit se identifica por el hash de su propio contenido. Por eso dos repositorios distintos que llegan al mismo estado exacto pueden producir el mismo hash." },
    { "titulo": "Cambiar una sola letra cambia el hash entero.", "texto": "SHA-1 no tiene \"cambios pequeños, hashes parecidos\" — un cambio mínimo en el contenido produce un hash completamente distinto, sin ningún parecido visual con el anterior. Es justo la propiedad que hace útil un hash: dos objetos con el mismo hash son, con altísima probabilidad, el mismo contenido exacto." }
  ]
}
```

## Tres tipos de objeto, un mismo mecanismo

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Git solo guarda cuatro tipos de objeto",
  "contenido": "blob (el contenido de un fichero), tree (una lista de ficheros y carpetas, como un directorio), commit (un snapshot con metadatos y un puntero a un tree) y tag (una etiqueta con nombre sobre otro objeto). Los tres primeros son los que sostienen todo lo visto hasta ahora — se ven en detalle, con contenido real, en la siguiente lección."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pro Git — Git Objects",
      "descripcion": "El capítulo de Pro Git sobre el modelo de objetos de Git: blob, tree, commit y cómo se calcula su hash.",
      "url": "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
      "etiqueta": "Pro Git"
    }
  ]
}
```
