# `git checkout -b`: crear y moverte entre ramas

- **Módulo:** Branching real
- **Slug:** `git-checkout-b-crear-y-moverte-entre-ramas` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [git-checkout](https://git-scm.com/docs/git-checkout) — ver `contenido/git/TEMARIO.md` #10

---

## Un comando, dos cosas a la vez

`git checkout -b <nombre>` crea la rama nueva y te mueve a ella en un solo paso — es la forma más habitual de empezar a trabajar en algo nuevo sin tocar la rama en la que ya estabas.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Crear la rama feature y moverte a ella",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base"],
  "comando": "checkout -b feature",
  "anotaciones": [
    { "fragmento": "-b", "nota": "El flag -b es lo que le dice a checkout que la rama no existe todavía y hay que crearla. Sin -b, checkout solo sirve para moverte a una rama que ya existe." },
    { "fragmento": "feature", "nota": "El nombre de la nueva rama. A partir de este momento, cualquier commit que hagas avanza feature, no la rama en la que estabas antes." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "\"track remote branch\" en la salida es un artefacto de este motor",
  "contenido": "El motor de este curso (wasm-git) menciona un remoto (\"origin\") en su mensaje aunque no exista ningún remoto real configurado — es un detalle interno de cómo construye internamente la nueva rama. En tu terminal real, con git checkout -b, verías simplemente Switched to a new branch 'feature'."
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Crea una rama llamada experimento y muévete a ella.",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base"],
  "comandoInicial": "",
  "comandoSolucion": "checkout -b experimento"
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
