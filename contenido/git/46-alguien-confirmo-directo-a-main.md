# Alguien confirmó directo a `main` por error: cómo deshacerlo sin liarla más

- **Módulo:** Trabajo en equipo: casos reales
- **Slug:** `alguien-confirmo-directo-a-main-por-error-como-deshacerlo-sin-liarla-mas` (autogenerado del título)
- **Orden:** 460
- **Fuentes:** [git-revert](https://git-scm.com/docs/git-revert) — ver `contenido/git/TEMARIO.md` #46

---

## El commit ya está en el remoto — otros ya pudieron verlo

Saltarse el flujo normal (rama → PR → revisión, Módulo 13) y confirmar directo a `main`, con un bug de por medio, pasa. El error real no es haberlo hecho — es intentar arreglarlo con `reset --hard` sobre el remoto: eso es exactamente el peligro del Módulo 6, aplicado a un commit que otras personas ya pueden haber descargado.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un commit directo a master, ya empujado",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    { "escribir": { "ruta": "a.txt", "contenido": "cambio directo sin revisar, con un bug\n" } }, "add a.txt", "commit -m 'cambio directo a master, sin revisar'", "push"
  ],
  "comando": "log --oneline",
  "anotaciones": [
    { "fragmento": "log", "nota": "El commit ya está confirmado Y empujado — cualquiera que haya hecho fetch entre medias ya lo tiene. Reescribir el historial para que \"nunca pasara\" (reset --hard + push --force) le rompería la copia a cualquiera en esa situación, tal y como se vio en la lección anterior." }
  ]
}
```

## La solución segura: `revert`, no `reset`

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "revert deshace el efecto sin tocar el commit original",
  "esquemaGit": [
    "init --bare /remoto", "clone /remoto /repo",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base", "push",
    { "escribir": { "ruta": "a.txt", "contenido": "cambio directo sin revisar, con un bug\n" } }, "add a.txt", "commit -m 'cambio directo a master, sin revisar'", "push"
  ],
  "comando": "revert HEAD",
  "anotaciones": [
    { "fragmento": "revert", "nota": "El commit del bug sigue existiendo, visible en el historial — pero su efecto queda anulado por uno nuevo. Nadie que ya tuviera el commit malo se encuentra con una historia distinta a la que esperaba: simplemente le llega un commit más al hacer su próximo fetch." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esto es exactamente la comparación reset frente a revert del Módulo 7.", "texto": "\"El commit ya lo tienen otras personas\" es precisamente la condición que hace correcto usar revert en vez de reset --hard — este caso de equipo es la versión real de esa misma regla." },
    { "titulo": "Después de revert, un push normal (no --force) es todo lo que hace falta.", "texto": "revert crea un commit nuevo, más adelante en la historia — no reescribe nada existente, así que el push que lo comparte es un fast-forward normal, sin ningún riesgo para nadie más." }
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
