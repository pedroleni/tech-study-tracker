# Fast-forward merge: cuando una rama no ha hecho más que avanzar

- **Módulo:** Merge
- **Slug:** `fast-forward-merge-cuando-una-rama-no-ha-hecho-mas-que-avanzar` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [git-merge](https://git-scm.com/docs/git-merge) — ver `contenido/git/TEMARIO.md` #12

---

## El caso más simple de merge

Si `master` no se movió mientras trabajabas en `feature`, fusionar es trivial: Git solo tiene que mover el puntero de `master` hasta donde ya está `feature`. No hace falta combinar nada, porque no hay nada con lo que combinar — a esto se le llama **fast-forward**.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "master avanza directamente hasta feature",
  "esquemaGit": [
    "init .",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } },
    "add a.txt",
    "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "b.txt", "contenido": "feature\n" } },
    "add b.txt",
    "commit -m 'feature: añade b.txt'",
    "checkout master"
  ],
  "comando": "merge feature",
  "mostrarGrafo": true,
  "anotaciones": [
    { "fragmento": "merge", "nota": "\"Fast-forward\" es la única salida — no hay ningún commit de merge nuevo. El grafo de abajo lo confirma: master y feature acaban apuntando exactamente al mismo commit." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La condición es que master no se haya movido",
  "contenido": "Un fast-forward solo es posible si el commit de master es un antepasado directo del commit de feature — es decir, si nadie hizo commits nuevos en master mientras tú trabajabas. En cuanto master avanza también, ya no hay un camino recto que seguir: eso es un three-way merge, la siguiente lección."
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
