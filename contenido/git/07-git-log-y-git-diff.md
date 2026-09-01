# `git log` y `git diff`: ver el historial y lo que ha cambiado

- **Módulo:** Commits de verdad
- **Slug:** `git-log-y-git-diff-ver-el-historial-y-lo-que-ha-cambiado` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [git-log](https://git-scm.com/docs/git-log) + [git-diff](https://git-scm.com/docs/git-diff) — ver `contenido/git/TEMARIO.md` #7

---

## `git log`: el historial completo, commit a commit

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Dos commits, uno detrás de otro",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'Primera versión de a.txt'", { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } }, "add a.txt", "commit -m 'Actualiza a.txt a la versión 2'"],
  "comando": "log --oneline",
  "anotaciones": [
    { "fragmento": "--oneline", "nota": "Una línea por commit: hash + mensaje. El más reciente aparece primero. (En tu terminal real verías el hash acortado a 7 caracteres — aquí el motor del navegador lo muestra completo, pero es exactamente el mismo hash.)" }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El orden es siempre del más nuevo al más antiguo.", "texto": "El primer commit que ves en git log es el último que se hizo — no el primero del proyecto." },
    { "titulo": "El hash identifica el commit sin ambigüedad.", "texto": "Dos commits nunca comparten hash. Sirve para referenciar un commit exacto en cualquier otro comando (checkout, reset, diff…), algo que se ve a partir del Módulo 3." }
  ]
}
```

## `git diff`: lo que ha cambiado, todavía sin confirmar

`git diff` (sin argumentos) compara el directorio de trabajo con lo último que hay en el staging — es la forma de ver, línea a línea, qué cambió antes de decidir si lo confirmas.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un cambio real, todavía sin stagear",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'Primera versión de a.txt'", { "escribir": { "ruta": "a.txt", "contenido": "v2\n" } }],
  "comando": "diff",
  "anotaciones": [
    { "fragmento": "diff", "nota": "El formato es el estándar de Git: -v1 marca la línea que desaparece, +v2 la que la sustituye. Es exactamente el mismo formato que verías con git real en tu terminal." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Ya hay dos commits sobre b.txt. Mira el historial en una línea por commit con log --oneline (este ejercicio no comprueba automáticamente el resultado — cada commit real lleva su propio hash, que depende del instante exacto en que se creó, así que no hay una única salida \"correcta\" con la que comparar).",
  "esquemaGit": ["init .", { "escribir": { "ruta": "b.txt", "contenido": "primera\n" } }, "add b.txt", "commit -m 'Primer commit de b.txt'", { "escribir": { "ruta": "b.txt", "contenido": "primera\nsegunda\n" } }, "add b.txt", "commit -m 'Añade una segunda línea'"],
  "comandoInicial": ""
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-log",
      "descripcion": "Referencia oficial de git log.",
      "url": "https://git-scm.com/docs/git-log",
      "etiqueta": "Git Reference"
    },
    {
      "titulo": "git-diff",
      "descripcion": "Referencia oficial de git diff.",
      "url": "https://git-scm.com/docs/git-diff",
      "etiqueta": "Git Reference"
    }
  ]
}
```
