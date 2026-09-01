# `git blame`: quién cambió cada línea y cuándo

- **Módulo:** Commits de verdad
- **Slug:** `git-blame-quien-cambio-cada-linea-y-cuando` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [git-blame](https://git-scm.com/docs/git-blame) — ver `contenido/git/TEMARIO.md` #8

---

## Cada línea, con su propio commit

`git log` muestra el historial completo del proyecto. `git blame` responde una pregunta más concreta: de un fichero, línea por línea, ¿en qué commit se escribió cada una por última vez?

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Dos líneas, escritas en dos commits distintos",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "linea uno\n" } }, "add a.txt", "commit -m 'Primera línea'", { "escribir": { "ruta": "a.txt", "contenido": "linea uno\nlinea dos\n" } }, "add a.txt", "commit -m 'Añade la segunda línea'"],
  "comando": "blame a.txt",
  "anotaciones": [
    { "fragmento": "blame", "nota": "Cada línea de la salida empieza con el hash del commit donde se escribió esa línea concreta, quién lo hizo y el número de línea. La línea 1 y la línea 2 tienen hashes distintos — se escribieron en commits distintos." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"Blame\" no es solo para buscar culpables",
  "contenido": "El nombre sugiere buscar quién rompió algo, pero el uso real más habitual es al revés: entender por qué una línea concreta existe. Si una línea parece rara o innecesaria, blame te lleva directo al commit que la introdujo — y ese commit trae su propio mensaje explicando el motivo."
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "config.txt tiene una línea escrita en cada uno de dos commits. Mira quién escribió cada línea con blame config.txt (este ejercicio no comprueba automáticamente el resultado — cada línea de blame incluye el hash real del commit, que depende del instante exacto en que se creó).",
  "esquemaGit": ["init .", { "escribir": { "ruta": "config.txt", "contenido": "modo=produccion\n" } }, "add config.txt", "commit -m 'Configura el modo de producción'", { "escribir": { "ruta": "config.txt", "contenido": "modo=produccion\ntimeout=30\n" } }, "add config.txt", "commit -m 'Añade el timeout'"],
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
      "titulo": "git-blame",
      "descripcion": "Referencia oficial de git blame.",
      "url": "https://git-scm.com/docs/git-blame",
      "etiqueta": "Git Reference"
    }
  ]
}
```
