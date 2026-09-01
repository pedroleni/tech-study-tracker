# Blob, tree y commit: viendo los objetos reales con `cat-file -p`

- **Módulo:** Git por dentro: objetos y referencias
- **Slug:** `blob-tree-y-commit-viendo-los-objetos-reales-con-cat-file-p` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [Pro Git — Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) + [git-cat-file](https://git-scm.com/docs/git-cat-file) — ver `contenido/git/TEMARIO.md` #16

---

## El commit: metadatos + un puntero a un tree

`cat-file -p` (print) muestra el contenido real de cualquier objeto. Empezando por el commit al que apunta HEAD ahora mismo:

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El contenido real de un objeto commit",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "hola mundo\n" } }, "add a.txt", "commit -m 'Primer commit'"],
  "comando": "cat-file -p HEAD",
  "anotaciones": [
    { "fragmento": "-p", "nota": "tree — el commit no guarda ficheros directamente; guarda el hash de un objeto tree, que es quien lista los ficheros. author/committer llevan quién y cuándo. Y al final, el mensaje que escribiste con -m." }
  ]
}
```

## El tree: una lista de ficheros, con su propio hash cada uno

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El tree al que apunta ese commit",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "hola mundo\n" } }, "add a.txt", "commit -m 'Primer commit'"],
  "comando": "cat-file -p HEAD^{tree}",
  "anotaciones": [
    { "fragmento": "^{tree}", "nota": "Esta notación le pide a Git \"el tree de este commit\", sin que tengas que copiar su hash a mano. La salida es una lista: permisos, tipo de objeto (blob), su propio hash, y el nombre del fichero." }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los tres objetos, cada uno con su trabajo",
  "roles": [
    { "etiqueta": "blob", "rol": "El contenido de un fichero, sin nombre", "descripcion": "Solo bytes — el nombre del fichero no vive aquí, vive en el tree que lo referencia. Dos ficheros con el mismo contenido comparten el mismo blob, aunque se llamen distinto." },
    { "etiqueta": "tree", "rol": "Una lista de nombres apuntando a blobs (u otros trees)", "descripcion": "Es literalmente un directorio: cada línea dice \"este nombre de fichero apunta a este hash\". Una carpeta con subcarpetas es un tree apuntando a otros trees." },
    { "etiqueta": "commit", "rol": "Un snapshot con metadatos, apuntando a un tree", "descripcion": "Quién, cuándo, por qué (el mensaje) — y el hash del tree que representa el estado completo del proyecto en ese momento." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Ya hay un commit. Mira el tree que contiene la lista de ficheros de ese commit.",
  "esquemaGit": ["init .", { "escribir": { "ruta": "info.txt", "contenido": "version 1\n" } }, "add info.txt", "commit -m 'Primera version'"],
  "comandoInicial": "",
  "comandoSolucion": "cat-file -p HEAD^{tree}"
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
      "descripcion": "Explica en detalle blob, tree y commit, con ejemplos reales de cat-file -p.",
      "url": "https://git-scm.com/book/en/v2/Git-Internals-Git-Objects",
      "etiqueta": "Pro Git"
    },
    {
      "titulo": "git-cat-file",
      "descripcion": "Referencia oficial de git cat-file.",
      "url": "https://git-scm.com/docs/git-cat-file",
      "etiqueta": "Git Reference"
    }
  ]
}
```
