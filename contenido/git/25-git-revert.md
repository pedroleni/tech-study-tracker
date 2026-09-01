# `git revert`: deshacer un commit ya compartido sin reescribir historia

- **Módulo:** Deshacer cosas
- **Slug:** `git-revert-deshacer-un-commit-ya-compartido-sin-reescribir-historia` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [git-revert](https://git-scm.com/docs/git-revert) — ver `contenido/git/TEMARIO.md` #25

---

## El opuesto seguro de `reset --hard`

`reset` mueve el puntero de la rama — cambia qué commit es el último, y (en `--hard`) puede descartar contenido. Eso está bien mientras esos commits sean solo tuyos (misma regla de oro que rebase, Módulo 6). Pero si el commit que quieres deshacer **ya lo tienen otras personas**, mover el puntero no vale: ellas seguirían teniendo el commit "malo". `git revert` resuelve esto sin tocar ni un commit existente — añade uno **nuevo**, cuyo contenido es exactamente el opuesto del que quieres deshacer.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Deshaciendo el último commit con revert",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'v1'", { "escribir": { "ruta": "a.txt", "contenido": "v2 con un bug\n" } }, "add a.txt", "commit -m 'v2 con un bug'"],
  "comando": "revert HEAD",
  "anotaciones": [
    { "fragmento": "revert", "nota": "En este motor, revert calcula el cambio opuesto y lo deja preparado en el staging, sin confirmarlo todavía — ahora mismo el historial (log) sigue teniendo los dos commits originales, sin ninguno nuevo. En tu terminal real, git revert suele abrir un editor y confirmar automáticamente." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El cambio opuesto, listo para confirmar",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'v1'", { "escribir": { "ruta": "a.txt", "contenido": "v2 con un bug\n" } }, "add a.txt", "commit -m 'v2 con un bug'", "revert HEAD"],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"Changes to be committed: modified: a.txt\" — el contenido de a.txt ha vuelto a v1, y ese cambio ya está en el staging. Falta el último paso: un commit normal para que quede registrado como un commit más." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El commit original nunca desaparece",
  "contenido": "Después de completar el revert con un commit, el historial tiene TRES commits: v1, v2 con un bug, y uno nuevo que deshace v2. El commit \"malo\" sigue ahí, visible en el historial — solo que su efecto queda anulado por el siguiente. Es la razón por la que revert es seguro sobre historia compartida: nadie pierde ningún commit que ya tuviera."
}
```

## `reset` frente a `revert`

```laboratorio
{
  "tipo": "roles",
  "titulo": "Mismo objetivo, momento distinto para usarlos",
  "roles": [
    { "etiqueta": "reset --hard", "rol": "El commit todavía es solo tuyo", "descripcion": "Nadie más lo ha visto — puedes borrarlo del historial sin que le afecte a nadie más." },
    { "etiqueta": "revert", "rol": "El commit ya lo tienen otras personas", "descripcion": "No puedes hacerlo desaparecer sin liarla (Módulo 6) — en su lugar, añades un commit nuevo que deshace su efecto, sin tocar nada de lo que ya existía." }
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
      "titulo": "git-revert",
      "descripcion": "Referencia oficial de git revert.",
      "url": "https://git-scm.com/docs/git-revert",
      "etiqueta": "Git Reference"
    }
  ]
}
```
