# `git push` y el tracking de ramas: qué rama remota sigue a cuál local

- **Módulo:** Remotos
- **Slug:** `git-push-y-el-tracking-de-ramas-que-rama-remota-sigue-a-cual-local` (autogenerado del título)
- **Orden:** 310
- **Fuentes:** [git-push](https://git-scm.com/docs/git-push) + [Pro Git — Remote Branches](https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches) — ver `contenido/git/TEMARIO.md` #31

---

## Subir tus commits al remoto

`git push` es el sentido contrario de `fetch`: envía los commits que tienes localmente y el remoto no tiene todavía.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Empujar un commit nuevo al remoto",
  "esquemaGit": ["init --bare /remoto", "clone /remoto /repo", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base"],
  "comando": "push",
  "anotaciones": [
    { "fragmento": "push", "nota": "\"pushed\" — el commit ya existe en /remoto. Cualquiera que clone ese remoto a partir de ahora lo recibirá (exactamente lo que ya viste en la lección de clone)." }
  ]
}
```

## Una rama nueva también se empuja — y queda registrada en el remoto

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Una rama feature, creada y empujada, vista desde otro clon",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "checkout -b feature",
    { "escribir": { "ruta": "b.txt", "contenido": "nueva funcionalidad\n" } }, "add b.txt", "commit -m 'feature: nueva funcionalidad'",
    "push",
    "clone /remoto /companero"
  ],
  "comando": "--git-dir=/companero/.git for-each-ref",
  "anotaciones": [
    { "fragmento": "for-each-ref", "nota": "refs/remotes/origin/feature — la rama feature, creada solo en tu copia local, ahora también existe en el remoto y es visible para cualquiera que clone o haga fetch a partir de aquí." }
  ]
}
```

## El tracking: qué rama local sigue a cuál remota

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "\"Tracking\" es solo recordar la pareja rama-local ↔ rama-remota.", "texto": "Cuando master (local) sigue a origin/master, Git sabe automáticamente contra qué comparar al hacer fetch, push o pull, sin que tengas que escribir el nombre remoto cada vez." },
    { "titulo": "clone configura el tracking de la rama principal automáticamente.", "texto": "Por eso un simple git push o git pull, sin argumentos, ya sabe a qué remoto y qué rama te refieres — el tracking se estableció en el momento del clone." },
    { "titulo": "checkout -b crear una rama nueva no la empuja sola.", "texto": "Hace falta un push explícito (como en el ejemplo de arriba) para que esa rama exista también en el remoto — hasta entonces, es puramente local." }
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
      "titulo": "git-push",
      "descripcion": "Referencia oficial de git push.",
      "url": "https://git-scm.com/docs/git-push",
      "etiqueta": "Git Reference"
    },
    {
      "titulo": "Pro Git — Remote Branches",
      "descripcion": "El capítulo de Pro Git sobre ramas remotas y tracking.",
      "url": "https://git-scm.com/book/en/v2/Git-Branching-Remote-Branches",
      "etiqueta": "Pro Git"
    }
  ]
}
```
