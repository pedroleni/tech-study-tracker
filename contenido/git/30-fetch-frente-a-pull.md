# `fetch` frente a `pull`: traer cambios y decidir cuándo integrarlos

- **Módulo:** Remotos
- **Slug:** `fetch-frente-a-pull-traer-cambios-y-decidir-cuando-integrarlos` (autogenerado del título)
- **Orden:** 300
- **Fuentes:** [git-fetch](https://git-scm.com/docs/git-fetch) + [git-pull](https://git-scm.com/docs/git-pull) — ver `contenido/git/TEMARIO.md` #30

---

## Traer sin tocar tu rama, y traer integrando de una vez

`git fetch` descarga los commits nuevos del remoto — pero **no** los mezcla con tu trabajo. Tu rama actual se queda exactamente donde estaba. `git pull` hace lo mismo que fetch, y además los integra automáticamente.

> **Nota sobre este módulo:** el motor de este curso (`wasm-git`) no implementa `pull` como comando propio. Por eso esta lección muestra `pull` descompuesto en sus dos pasos reales — que es, literalmente, lo que `pull` hace por dentro (ver la cita de la documentación oficial más abajo).

## `fetch` no mueve tu rama

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un compañero ya empujó un commit nuevo al remoto",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "clone /remoto /companero",
    { "escribir": { "ruta": "b.txt", "contenido": "nuevo desde companero\n" } },
    "--git-dir=/companero/.git --work-tree=/companero add b.txt",
    "--git-dir=/companero/.git --work-tree=/companero commit -m 'companero: nuevo fichero'",
    "--git-dir=/companero/.git push"
  ],
  "comando": "log --oneline",
  "anotaciones": [
    { "fragmento": "log", "nota": "Tu copia local (esta) todavía solo ve el commit base — no sabe nada del commit que tu compañero acaba de empujar. Nada se descarga solo, hay que pedirlo." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "fetch trae el commit — pero a origin/master, no a tu master",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "clone /remoto /companero",
    { "escribir": { "ruta": "b.txt", "contenido": "nuevo desde companero\n" } },
    "--git-dir=/companero/.git --work-tree=/companero add b.txt",
    "--git-dir=/companero/.git --work-tree=/companero commit -m 'companero: nuevo fichero'",
    "--git-dir=/companero/.git push"
  ],
  "comando": "fetch origin",
  "anotaciones": [
    { "fragmento": "fetch", "nota": "\"[updated] ... refs/heads/master -> refs/remotes/origin/master\" — fetch actualizó tu copia de \"dónde está master en el remoto\" (origin/master), sin tocar tu propia rama master." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Tu rama sigue igual; origin/master ya tiene el commit nuevo",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "clone /remoto /companero",
    { "escribir": { "ruta": "b.txt", "contenido": "nuevo desde companero\n" } },
    "--git-dir=/companero/.git --work-tree=/companero add b.txt",
    "--git-dir=/companero/.git --work-tree=/companero commit -m 'companero: nuevo fichero'",
    "--git-dir=/companero/.git push",
    "fetch origin"
  ],
  "comando": "log --oneline origin/master",
  "anotaciones": [
    { "fragmento": "origin/master", "nota": "Ahí está el commit del compañero — visible bajo el nombre origin/master, pero todavía fuera de tu propia rama master. Puedes inspeccionarlo, compararlo, todo lo que quieras, antes de decidir integrarlo." }
  ]
}
```

## El segundo paso de `pull`: integrar de verdad

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "merge origin/master: el paso que pull haría automáticamente",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "clone /remoto /companero",
    { "escribir": { "ruta": "b.txt", "contenido": "nuevo desde companero\n" } },
    "--git-dir=/companero/.git --work-tree=/companero add b.txt",
    "--git-dir=/companero/.git --work-tree=/companero commit -m 'companero: nuevo fichero'",
    "--git-dir=/companero/.git push",
    "fetch origin"
  ],
  "comando": "merge origin/master",
  "anotaciones": [
    { "fragmento": "merge", "nota": "\"Fast-forward\" — ahora sí, tu master avanza hasta incluir el commit del compañero. fetch + este merge es exactamente lo que pull hace en un único comando." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo dice la propia documentación de pull",
  "contenido": "Cita textual de git-pull: \"First, git pull runs git fetch (...) Then it decides which remote branch to integrate (...) Then it integrates that branch into the current branch.\" Por defecto integra con un fast-forward (--ff-only); con --rebase usa rebase en vez de merge."
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Ya se hizo fetch origin y el commit nuevo está en origin/master. Intégralo en tu rama.",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "clone /remoto /companero",
    { "escribir": { "ruta": "b.txt", "contenido": "nuevo\n" } },
    "--git-dir=/companero/.git --work-tree=/companero add b.txt",
    "--git-dir=/companero/.git --work-tree=/companero commit -m 'companero: nuevo'",
    "--git-dir=/companero/.git push",
    "fetch origin"
  ],
  "comandoInicial": "",
  "comandoSolucion": "merge origin/master"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-fetch",
      "descripcion": "Referencia oficial de git fetch.",
      "url": "https://git-scm.com/docs/git-fetch",
      "etiqueta": "Git Reference"
    },
    {
      "titulo": "git-pull",
      "descripcion": "Referencia oficial de git pull, incluida la explicación de que ejecuta fetch y después integra.",
      "url": "https://git-scm.com/docs/git-pull",
      "etiqueta": "Git Reference"
    }
  ]
}
```
