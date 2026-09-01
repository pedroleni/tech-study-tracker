# Dos personas tocan el mismo fichero: qué pasa de verdad al hacer push

- **Módulo:** Trabajo en equipo: casos reales
- **Slug:** `dos-personas-tocan-el-mismo-fichero-que-pasa-de-verdad-al-hacer-push` (autogenerado del título)
- **Orden:** 440
- **Fuentes:** [git-push](https://git-scm.com/docs/git-push) — ver `contenido/git/TEMARIO.md` #44

---

## Un compañero empuja primero, sin que tú lo sepas

Los dos partís del mismo commit. Tu compañero cambia `a.txt` y hace push. Tú, sin saberlo, cambias el mismo fichero y confirmas tu propio commit — y entonces intentas empujar.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "push rechazado — el remoto ya no es el que tú crees",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    "clone /remoto /companero",
    { "escribir": { "ruta": "a.txt", "contenido": "cambio de companero\n" } },
    "--git-dir=/companero/.git --work-tree=/companero add a.txt",
    "--git-dir=/companero/.git --work-tree=/companero commit -m 'companero: cambia a.txt'",
    "--git-dir=/companero/.git push",
    { "escribir": { "ruta": "a.txt", "contenido": "mi propio cambio\n" } },
    "add a.txt",
    "commit -m 'yo: cambio a.txt tambien'"
  ],
  "comando": "push",
  "anotaciones": [
    { "fragmento": "push", "nota": "\"cannot push because a reference (...) contains commits that are not present locally\" — Git rechaza el push en vez de sobrescribir en silencio el commit de tu compañero. No hay pérdida de trabajo: simplemente no te deja avanzar así." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Un push nunca sobrescribe commits ajenos por accidente.", "texto": "Git exige que tu rama local ya contenga todo lo que hay en el remoto antes de aceptar el push — es una comprobación automática, no algo que tengas que acordarte de hacer tú." },
    { "titulo": "La solución es la de siempre: fetch, y luego integrar.", "texto": "Exactamente el flujo del Módulo 9 — fetch trae el commit del compañero sin tocar el tuyo, y un merge (o rebase, con las reglas del Módulo 6) los junta antes de volver a intentar el push." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esto no es un conflicto de contenido — todavía",
  "contenido": "El rechazo del push pasa ANTES de que Git intente combinar nada — es un chequeo de \"tu rama está actualizada de verdad\", no una comparación línea a línea. El conflicto real de contenido (si lo hay) solo aparece después, al hacer el merge — y podría no haberlo, si los cambios no tocan las mismas líneas."
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
      "descripcion": "Referencia oficial de git push, incluidas las comprobaciones que hace antes de aceptar un push.",
      "url": "https://git-scm.com/docs/git-push",
      "etiqueta": "Git Reference"
    }
  ]
}
```
