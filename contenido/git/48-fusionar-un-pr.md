# Fusionar un PR: merge, squash o rebase — y reescribir historia ya compartida

- **Módulo:** Trabajo en equipo: casos reales
- **Slug:** `fusionar-un-pr-merge-squash-o-rebase-y-reescribir-historia-ya-compartida` (autogenerado del título)
- **Orden:** 480
- **Fuentes:** [git-merge](https://git-scm.com/docs/git-merge) — ver `contenido/git/TEMARIO.md` #48

---

## El mismo botón de "fusionar", tres resultados distintos

Cuando un pull request (Módulo 13) está listo, GitHub (y `git` en tu terminal) no ofrecen una única forma de fusionarlo — ofrecen tres, con consecuencias distintas para el historial de `main`.

## Merge normal: la historia completa de la rama, con un commit de más

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Merge normal — dos commits de feature, más el commit de merge",
  "esquemaGit": [
    "init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "b.txt", "contenido": "paso 1\n" } }, "add b.txt", "commit -m 'feature: paso 1'",
    { "escribir": { "ruta": "b.txt", "contenido": "paso 1\npaso 2\n" } }, "add b.txt", "commit -m 'feature: paso 2'",
    "checkout master",
    "merge feature"
  ],
  "comando": "log --oneline",
  "anotaciones": [
    { "fragmento": "log", "nota": "Los dos commits de feature llegan intactos a master, más un commit de merge que los junta — historia completa y real (Módulo 4), pero con el ruido de los \"paso 1\"/\"paso 2\" intermedios visible para siempre." }
  ]
}
```

## Squash: los mismos cambios, en un único commit limpio

```text
$ git log --oneline
33e2088 base

$ git merge --squash feature
Updating 33e2088..0f82d42
Fast-forward
Squash commit -- not updating HEAD

$ git status
On branch master
Changes to be committed:
	new file:   b.txt

$ git commit -m "feat: integra los dos pasos de feature en uno"
$ git log --oneline
fd65ff9 feat: integra los dos pasos de feature en uno
33e2088 base
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "\"Squash commit -- not updating HEAD\" — igual que merge --squash, esto no funciona en este motor",
  "contenido": "El texto de arriba está capturado con git real de línea de comandos (mismo bug de esta lección que push --force y commit --amend en este build de wasm-git). Nótese lo intermedio del proceso: --squash deja el resultado en el staging, sin confirmar — el commit final, con el mensaje que quieras, es un paso aparte."
}
```

## Rebase (y fast-forward): sin ningún commit de merge

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres opciones, comparadas",
  "roles": [
    { "etiqueta": "Merge normal", "rol": "Preserva toda la historia real", "descripcion": "Cada commit de la rama queda visible, más uno de merge — el más informativo, pero también el más ruidoso si la rama tuvo muchos commits de \"voy probando\" (Módulo 6)." },
    { "etiqueta": "Squash", "rol": "Un commit limpio por PR", "descripcion": "Todo el trabajo de la rama se convierte en un único commit en master — ideal cuando los commits intermedios de la rama no aportan nada por separado." },
    { "etiqueta": "Rebase", "rol": "Historia lineal, sin commit de merge", "descripcion": "Los commits de la rama se reescriben (Módulo 6) para que parezcan haberse hecho justo encima del último commit de master — sin ningún commit de merge extra, pero con hashes nuevos." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Squash y rebase reescriben la historia de la rama que se fusiona.", "texto": "Aplica la regla de oro del Módulo 6: seguro si esa rama es solo tuya (el caso normal de un PR, antes de fusionar) — el problema aparecería si alguien más ya hubiera basado trabajo sobre esos commits concretos de la rama." },
    { "titulo": "La elección suele ser una convención del equipo, no una decisión por PR.", "texto": "La mayoría de proyectos fijan una sola estrategia (a menudo squash, por simplicidad del historial de main) en vez de dejar que cada persona elija libremente en cada fusión." }
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
      "descripcion": "Referencia oficial de git merge, incluida la opción --squash.",
      "url": "https://git-scm.com/docs/git-merge",
      "etiqueta": "Git Reference"
    }
  ]
}
```
