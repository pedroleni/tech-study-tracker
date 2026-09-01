# Three-way merge: combinar dos historias que sí divergieron

- **Módulo:** Merge
- **Slug:** `three-way-merge-combinar-dos-historias-que-si-divergieron` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [git-merge](https://git-scm.com/docs/git-merge) — ver `contenido/git/TEMARIO.md` #13

---

## Cuando las dos ramas avanzaron

Si `master` también avanzó mientras trabajabas en `feature` (como en la lección anterior sobre ramas divergentes), ya no hay un simple "avanzar el puntero" — Git tiene que combinar de verdad los cambios de las dos ramas en un commit nuevo, con **dos padres**.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un commit de merge real, con dos padres",
  "esquemaGit": [
    "init .",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } },
    "add a.txt",
    "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "b.txt", "contenido": "feature\n" } },
    "add b.txt",
    "commit -m 'feature: añade b.txt'",
    "checkout master",
    { "escribir": { "ruta": "c.txt", "contenido": "master\n" } },
    "add c.txt",
    "commit -m 'master: añade c.txt'"
  ],
  "comando": "merge feature",
  "mostrarGrafo": true,
  "anotaciones": [
    { "fragmento": "merge feature", "nota": "\"Merge made\" — a diferencia de la lección anterior, aquí sí se crea un commit nuevo. En el grafo verás ese commit con dos líneas entrando en él: una desde master, otra desde feature." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "\"Three-way\" viene de los tres commits que Git compara.", "texto": "El commit común de ambas ramas (base), la punta de master y la punta de feature — de ahí sale el contenido final combinado, fichero a fichero." },
    { "titulo": "Como b.txt y c.txt son ficheros distintos, no hay ningún conflicto posible.", "texto": "Cada rama tocó un fichero diferente — Git puede combinar los dos sin ambigüedad. Cuando ambas ramas tocan la MISMA línea del MISMO fichero, eso es un conflicto real, y es el tema de la siguiente lección." }
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
      "titulo": "git-merge",
      "descripcion": "Referencia oficial de git merge.",
      "url": "https://git-scm.com/docs/git-merge",
      "etiqueta": "Git Reference"
    }
  ]
}
```
