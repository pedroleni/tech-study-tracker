# Hotfix urgente con una feature a medias: aislar lo urgente de lo que no lo es

- **Módulo:** Trabajo en equipo: casos reales
- **Slug:** `hotfix-urgente-con-una-feature-a-medias-aislar-lo-urgente-de-lo-que-no-lo-es` (autogenerado del título)
- **Orden:** 470
- **Fuentes:** [git-stash](https://git-scm.com/docs/git-stash) — ver `contenido/git/TEMARIO.md` #47

---

## Un cambio sin terminar, y algo urgente que no puede esperar

Estás a mitad de una funcionalidad, con cambios sin confirmar, cuando aparece un bug urgente en producción que hay que arreglar ya — sobre `master`, no sobre tu rama a medias.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Trabajo real, sin confirmar, en mitad de una rama feature",
  "esquemaGit": [
    "init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "feature.txt", "contenido": "a medias, no listo\n" } }, "add feature.txt",
    { "escribir": { "ruta": "a.txt", "contenido": "cambio a medias sin confirmar\n" } }
  ],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Un fichero nuevo en el staging, y otro modificado sin ni siquiera stagear — justo el tipo de estado intermedio que no quieres mezclar con un hotfix urgente, ni tampoco confirmar a medias solo para \"guardarlo\"." }
  ]
}
```

## `stash`, cambiar de rama, resolver lo urgente

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Tras stash, master está limpio para el hotfix",
  "esquemaGit": [
    "init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "feature.txt", "contenido": "a medias, no listo\n" } }, "add feature.txt",
    { "escribir": { "ruta": "a.txt", "contenido": "cambio a medias sin confirmar\n" } },
    "stash",
    "checkout master"
  ],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "master, completamente limpio — como si el trabajo en feature no existiera. A partir de aquí: rama para el hotfix, commit, PR urgente, merge (todo lo ya visto en módulos anteriores)." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El trabajo de feature no se pierde ni se mezcla con el hotfix.", "texto": "Sigue guardado en el stash — checkout master no lo toca, porque stash ya lo había apartado antes de cambiar de rama." },
    { "titulo": "Al volver a feature, stash pop (Módulo 10) lo recupera exactamente donde estaba.", "texto": "El fichero en staging sigue en staging, el modificado sigue modificado sin stagear — el estado intermedio completo vuelve tal cual, no solo el contenido final." }
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
      "titulo": "git-stash",
      "descripcion": "Referencia oficial de git stash.",
      "url": "https://git-scm.com/docs/git-stash",
      "etiqueta": "Git Reference"
    }
  ]
}
```
