# `git commit`: fotografiar el staging, y qué hace un buen mensaje

- **Módulo:** Commits de verdad
- **Slug:** `git-commit-fotografiar-el-staging-y-que-hace-un-buen-mensaje` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [git-commit](https://git-scm.com/docs/git-commit) — ver `contenido/git/TEMARIO.md` #6

---

## Confirmar lo que está en el staging

`git commit` toma exactamente lo que hay en el staging area (ni más, ni menos) y lo guarda para siempre como un snapshot nuevo del proyecto, con su propio hash.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El primer commit de un repositorio",
  "esquemaGit": ["init .", { "escribir": { "ruta": "tareas.txt", "contenido": "comprar pan\n" } }, "add tareas.txt"],
  "comando": "commit -m 'Añade la primera tarea'",
  "anotaciones": [
    { "fragmento": "-m", "nota": "El flag -m escribe el mensaje del commit directamente en el comando, sin abrir un editor de texto aparte. Es la forma más habitual de confirmar desde la terminal." },
    { "fragmento": "'Añade la primera tarea'", "nota": "El mensaje debería explicar qué cambia y, si no es obvio, por qué — no \"cambios\" o \"arreglos\", que no dicen nada dentro de un mes." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "\"HEAD not found. Creating first commit\" no es un error",
  "contenido": "El motor que ejecuta estos ejercicios (wasm-git) imprime ese aviso de diagnóstico la primera vez que confirmas un commit en un repositorio nuevo — es su forma de decir \"todavía no había ningún commit al que enlazar este, así que empiezo el historial\". El commit se ha creado igualmente; en tu terminal real, con el Git de línea de comandos, verías en su lugar un resumen tipo [master (root-commit) a1b2c3d] mensaje."
}
```

## Comprobando que el commit existe de verdad

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El commit ya forma parte del historial",
  "esquemaGit": ["init .", { "escribir": { "ruta": "tareas.txt", "contenido": "comprar pan\n" } }, "add tareas.txt", "commit -m 'Añade la primera tarea'"],
  "comando": "log --oneline",
  "anotaciones": [
    { "fragmento": "log", "nota": "Ahí está: un commit real, con su hash (identificador único) y el mensaje que escribiste. A partir de aquí, ese estado del proyecto queda guardado para siempre — puedes volver a él cuando quieras." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "nota.txt ya está en el staging. Confirma un commit con el mensaje \"Primer commit\".",
  "esquemaGit": ["init .", { "escribir": { "ruta": "nota.txt", "contenido": "hola\n" } }, "add nota.txt"],
  "comandoInicial": "",
  "comandoSolucion": "commit -m 'Primer commit'"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-commit",
      "descripcion": "Referencia oficial de git commit.",
      "url": "https://git-scm.com/docs/git-commit",
      "etiqueta": "Git Reference"
    }
  ]
}
```
