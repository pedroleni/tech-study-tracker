# Descartar cambios locales antes de confirmar nada

- **Módulo:** Deshacer cosas
- **Slug:** `descartar-cambios-locales-antes-de-confirmar-nada` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [git-checkout](https://git-scm.com/docs/git-checkout) — ver `contenido/git/TEMARIO.md` #23

---

## Volver a la última versión guardada, sin staging de por medio

Si un cambio en el directorio de trabajo (todavía sin `add`) resulta ser un desastre, `git checkout -- <fichero>` lo descarta por completo y recupera exactamente la última versión confirmada.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un cambio sin confirmar, antes de descartarlo",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "version guardada\n" } }, "add a.txt", "commit -m base", { "escribir": { "ruta": "a.txt", "contenido": "cambio sin confirmar, un desastre\n" } }],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"Changes not staged for commit: modified: a.txt\" — el propio Git ya sugiere el comando exacto entre paréntesis: git checkout -- <file> para descartarlo." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Tras checkout -- a.txt, el fichero vuelve a estar limpio",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "version guardada\n" } }, "add a.txt", "commit -m base", { "escribir": { "ruta": "a.txt", "contenido": "cambio sin confirmar, un desastre\n" } }, "checkout -- a.txt"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Limpio otra vez — el contenido del fichero ha vuelto exactamente al del último commit. El cambio que había en el directorio de trabajo desapareció sin dejar rastro." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Es la única operación de esta lección que no se puede deshacer",
  "contenido": "reset y revert (el resto de esta lección) sí dejan huella en el historial o el reflog, y son recuperables incluso si te equivocas. checkout -- descarta contenido que NUNCA llegó a confirmarse — no hay ningún commit, ni ningún reflog, del que recuperarlo. Antes de usarlo conviene estar seguro."
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "config.txt tiene un cambio sin confirmar que quieres descartar por completo.",
  "esquemaGit": ["init .", { "escribir": { "ruta": "config.txt", "contenido": "modo=produccion\n" } }, "add config.txt", "commit -m base", { "escribir": { "ruta": "config.txt", "contenido": "modo=debug-olvidado\n" } }],
  "comandoInicial": "",
  "comandoSolucion": "checkout -- config.txt"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-checkout",
      "descripcion": "Referencia oficial de git checkout.",
      "url": "https://git-scm.com/docs/git-checkout",
      "etiqueta": "Git Reference"
    }
  ]
}
```
