# `git init`: crear un repositorio desde cero

- **Módulo:** Commits de verdad
- **Slug:** `git-init-crear-un-repositorio-desde-cero` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [git-init](https://git-scm.com/docs/git-init) — ver `contenido/git/TEMARIO.md` #4

---

## Convertir una carpeta cualquiera en un repositorio

`git init` no crea ficheros de tu proyecto ni pide nada — solo añade una carpeta oculta, `.git`, dentro del directorio actual. Ahí es donde Git va a guardar todo: el historial completo, las ramas, la configuración. El resto de tus ficheros no cambia en absoluto.

A partir de aquí, todos los ejercicios de este curso ejecutan comandos Git reales, contra un motor real (`wasm-git`) que corre en tu propio navegador — nada de esto es una simulación dibujada a mano.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Justo después de init, antes de cualquier commit",
  "esquemaGit": ["init ."],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Fíjate en la salida de abajo: dice \"Not currently on any branch\". Aunque acabas de inicializar el repositorio, todavía no existe ninguna rama de verdad — una rama no es más que un nombre que apunta a un commit, y todavía no hay ningún commit al que apuntar." }
  ]
}
```

## Por qué ninguna rama existe todavía

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una rama necesita al menos un commit para existir",
  "contenido": "Esto sorprende a quien viene de pensar que \"la rama principal\" es lo primero que hay. En realidad Git no crea master (o main) hasta que confirmas tu primer commit — antes de eso, el repositorio existe, pero no apunta a ningún sitio. En el Módulo 3 se ve con detalle qué es exactamente una rama."
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Inicializa un repositorio y comprueba su estado con status.",
  "esquemaGit": ["init ."],
  "comandoInicial": "",
  "comandoSolucion": "status"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-init",
      "descripcion": "Referencia oficial de git init: qué crea exactamente y sus opciones.",
      "url": "https://git-scm.com/docs/git-init",
      "etiqueta": "Git Reference"
    }
  ]
}
```
