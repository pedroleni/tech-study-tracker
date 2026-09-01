# GitHub Flow: un único `main` siempre desplegable, todo lo demás en rama corta

- **Módulo:** Un equipo grande, varias features
- **Slug:** `github-flow-un-unico-main-siempre-desplegable-todo-lo-demas-en-rama-corta` (autogenerado del título)
- **Orden:** 500
- **Fuentes:** [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) — ver `contenido/git/TEMARIO.md` #50

---

## El mismo flujo del Módulo 13, ahora comparado con Git Flow

Ya se vio en detalle: crear rama, cambios, PR, revisión, merge, borrar rama (Módulo 13, "El ciclo completo"). Puesto junto a Git Flow (lección anterior), la diferencia es de fondo, no solo de nombres.

```text
GIT FLOW:

main (produccion) + develop (integracion)
  + feature/* (sale de develop)
  + release/* (prepara una version)
  + hotfix/* (arregla produccion)

Cinco tipos de rama, ciclo de release formal.
```

```text
GITHUB FLOW:

main (siempre desplegable)
  + rama-corta (sale de main, vuelve a main)

Un solo tipo de rama, sin ciclo de release aparte.
```

Estas dos no son un cambio en el tiempo — son dos estrategias distintas para el mismo problema, comparadas lado a lado.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No hay rama develop — main ES la rama de integración.", "texto": "Cada PR fusionado en main se asume desplegable de inmediato. No existe un estado intermedio \"integrado pero no publicado\" como el develop de Git Flow." },
    { "titulo": "No hay ramas release ni hotfix como categorías aparte.", "texto": "Un hotfix urgente (Módulo 14) es simplemente una rama corta más, igual que cualquier feature — el mismo camino para todo, sin un proceso especial distinto." }
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
      "titulo": "GitHub Docs — GitHub flow",
      "descripcion": "El flujo oficial, ya citado en detalle en el Módulo 13.",
      "url": "https://docs.github.com/en/get-started/using-github/github-flow",
      "etiqueta": "GitHub Docs"
    }
  ]
}
```
