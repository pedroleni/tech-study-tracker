# `git add` y el staging: por qué existe un paso intermedio antes de confirmar

- **Módulo:** Commits de verdad
- **Slug:** `git-add-y-el-staging-por-que-existe-un-paso-intermedio-antes-de-confirmar` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [git-add](https://git-scm.com/docs/git-add) — ver `contenido/git/TEMARIO.md` #5

---

## Un fichero nuevo, antes de tocar nada

Crea un fichero dentro de un repositorio y Git se entera al instante — pero no hace nada con él todavía. Lo marca como "sin seguimiento" (untracked) y espera.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "tareas.txt existe, pero Git todavía no lo sigue",
  "esquemaGit": ["init .", { "escribir": { "ruta": "tareas.txt", "contenido": "comprar pan\n" } }],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"Untracked files\" — Git ve el fichero en el disco, pero no forma parte de ningún commit ni está en camino de estarlo. Es solo texto en tu carpeta, ajeno por completo al historial." }
  ]
}
```

## `git add`: la lista de la compra del próximo commit

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El mismo fichero, después de add tareas.txt",
  "esquemaGit": ["init .", { "escribir": { "ruta": "tareas.txt", "contenido": "comprar pan\n" } }, "add tareas.txt"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Ahora aparece bajo \"Changes to be committed\" — tareas.txt está en el staging area (el índice). Todavía no hay ningún commit nuevo; solo se ha marcado como candidato al próximo." }
  ]
}
```

## Por qué no basta con "guardar" directamente

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que el staging permite hacer",
  "roles": [
    { "etiqueta": "Confirmar por partes", "rol": "No todo lo que has tocado va en el mismo commit", "descripcion": "Puedes haber cambiado tres ficheros por tres razones distintas — el staging deja meter en el commit solo los que de verdad pertenecen juntos." },
    { "etiqueta": "Revisar antes de guardar", "rol": "Ver qué vas a confirmar, antes de confirmarlo", "descripcion": "El staging es el punto en el que puedes comprobar (con git diff --staged) que lo que vas a guardar es de verdad lo que querías guardar." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Ya existe un fichero notas.md sin seguimiento. Añádelo al staging.",
  "esquemaGit": ["init .", { "escribir": { "ruta": "notas.md", "contenido": "# Notas\n" } }],
  "comandoInicial": "",
  "comandoSolucion": "add notas.md"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-add",
      "descripcion": "Referencia oficial de git add: qué hace exactamente y sus opciones.",
      "url": "https://git-scm.com/docs/git-add",
      "etiqueta": "Git Reference"
    }
  ]
}
```
