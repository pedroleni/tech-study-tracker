# Un commit es una fotografía, no una diferencia: cómo almacena datos Git de verdad

- **Módulo:** Qué es Git y por qué
- **Slug:** `un-commit-es-una-fotografia-no-una-diferencia-como-almacena-datos-git-de-verdad` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) — ver `contenido/git/TEMARIO.md` #2

---

## Dos formas distintas de guardar un historial

La intuición más común es que un sistema de control de versiones guarda una lista de "diferencias" — este sistema hizo esto, luego alguien cambió esto otro. Es como funcionan de verdad varios sistemas anteriores a Git. Pero Git no funciona así.

```text
Modelo por diferencias:

v1 (fichero completo)
  + diff1 (cambios de v1 a v2)
    + diff2 (cambios de v2 a v3)
      + diff3 (cambios de v3 a v4)

Para ver v4 hace falta aplicar v1 + diff1 + diff2 + diff3, en orden.
```

```text
Modelo de Git (snapshots):

commit-1 → snapshot completo del proyecto en ese momento
commit-2 → snapshot completo del proyecto en ese momento
commit-3 → snapshot completo del proyecto en ese momento
commit-4 → snapshot completo del proyecto en ese momento

Para ver cualquier commit, Git lo lee directamente. No hace falta reconstruir nada.
```

"Diferencia" (arriba) es el modelo de sistemas de control de versiones anteriores a Git. "Fotografía" (abajo) es el modelo real de Git — cada commit es autosuficiente.

## Lo que dice la fuente, literal

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"Git thinks about its data more like a series of snapshots\"",
  "contenido": "Cita textual de Pro Git: \"Conceptually, most other systems store information as a list of file-based changes (...) Git doesn't think of or store its data this way. Instead, Git thinks of its data more like a series of snapshots of a miniature filesystem.\" Cada vez que confirmas un commit, Git guarda una foto de cómo están todos tus ficheros en ese instante."
}
```

## Un detalle importante: los ficheros sin cambios no se duplican

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "\"Fotografía completa\" no significa \"copia completa cada vez\".", "texto": "Si un fichero no cambió entre un commit y el siguiente, Git no guarda una segunda copia de su contenido — el nuevo commit simplemente vuelve a apuntar al mismo contenido ya guardado. La eficiencia se resuelve por debajo, sin que afecte a la idea central: cada commit representa el proyecto entero, no un parche." },
    { "titulo": "Esto es lo que hace posible moverse instantáneamente entre commits.", "texto": "Como cada commit ya es un estado completo, cambiar de un commit a otro (algo que se ve en el Módulo 3 con las ramas) no exige reconstruir nada aplicando una cadena de diferencias — Git solo tiene que leer el snapshot de destino." }
  ]
}
```

Este documento se queda en la idea, sin comandos todavía — cómo se ve esto de verdad por dentro (los objetos concretos que guarda Git, con su hash) tiene su propio módulo más adelante, el Módulo 5, una vez ya hay commits y ramas reales con los que trabajar.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pro Git — What is Git?",
      "descripcion": "Explica en detalle el modelo de snapshots frente al de diferencias, con el diagrama original del libro.",
      "url": "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F",
      "etiqueta": "Pro Git"
    }
  ]
}
```
