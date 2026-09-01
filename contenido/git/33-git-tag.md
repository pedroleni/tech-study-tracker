# `git tag`: marcar un commit concreto como un punto fijo (versiones, releases)

- **Módulo:** Stash y tags
- **Slug:** `git-tag-marcar-un-commit-concreto-como-un-punto-fijo-versiones-releases` (autogenerado del título)
- **Orden:** 330
- **Fuentes:** [git-tag](https://git-scm.com/docs/git-tag) — ver `contenido/git/TEMARIO.md` #33

---

## Un nombre que no se mueve

Una rama (Módulo 3) es un puntero que avanza solo con cada commit nuevo. Un **tag** es distinto: apunta a un commit concreto, para siempre, sin moverse — pensado para marcar un punto que ya no va a cambiar, como una versión publicada.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Marcar el commit actual como v1.0.0",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'Version 1.0'"],
  "comando": "tag v1.0.0",
  "anotaciones": [
    { "fragmento": "tag", "nota": "Sin salida — igual que add, una operación silenciosa que solo confirma con su ausencia de error. El tag ya existe, apuntando exactamente al commit que era HEAD en ese momento." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Los tags existentes",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'Version 1.0'", "tag v1.0.0"],
  "comando": "tag",
  "anotaciones": [
    { "fragmento": "tag", "nota": "git tag sin argumentos lista los tags existentes — aquí, solo v1.0.0. Por muchos commits nuevos que se hagan después, este tag sigue apuntando exactamente al mismo commit de siempre." }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Rama frente a tag: mismo mecanismo, propósito distinto",
  "roles": [
    { "etiqueta": "Rama", "rol": "Un puntero que se espera que avance", "descripcion": "Cada commit nuevo mientras estás en esa rama la mueve automáticamente — representa \"el trabajo en curso\"." },
    { "etiqueta": "Tag", "rol": "Un puntero que NO se espera que se mueva", "descripcion": "Marca un commit concreto de forma permanente — representa \"este punto exacto, para siempre\", típicamente una versión publicada." }
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
      "titulo": "git-tag",
      "descripcion": "Referencia oficial de git tag.",
      "url": "https://git-scm.com/docs/git-tag",
      "etiqueta": "Git Reference"
    }
  ]
}
```
