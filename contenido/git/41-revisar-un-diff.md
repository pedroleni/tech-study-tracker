# Revisar un diff: qué mirar antes de aprobar un cambio ajeno

- **Módulo:** Flujo real con GitHub
- **Slug:** `revisar-un-diff-que-mirar-antes-de-aprobar-un-cambio-ajeno` (autogenerado del título)
- **Orden:** 410
- **Fuentes:** [GitHub Docs — Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request) — ver `contenido/git/TEMARIO.md` #41

---

## El diff (Módulo 2) es la base de toda revisión real

Revisar un pull request es, en el fondo, leer un `git diff` con comentarios encima. GitHub organiza esto en la pestaña **Files changed** — el mismo formato de diff ya visto (`-`/`+` por línea), fichero a fichero.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Comentar una línea concreta, no solo el PR entero.", "texto": "Al pasar el ratón sobre cualquier línea del diff aparece un icono de comentario — la observación queda anclada exactamente a esa línea, no perdida en un comentario general al final." },
    { "titulo": "Marcar ficheros como \"Viewed\" para no perder el sitio.", "texto": "En un PR con muchos ficheros cambiados, marcarlos como revisados los colapsa y actualiza una barra de progreso — pensado explícitamente para revisar \"un fichero cada vez\", como recomienda la propia documentación." }
  ]
}
```

## Tres formas de cerrar una revisión

```laboratorio
{
  "tipo": "roles",
  "titulo": "El tipo de revisión que envías, al terminar",
  "roles": [
    { "etiqueta": "Comment", "rol": "Feedback general, sin postura", "descripcion": "Dejas observaciones sin aprobar ni bloquear — útil cuando tienes dudas pero no un veto claro." },
    { "etiqueta": "Approve", "rol": "Apruebas el cambio para fusionarse", "descripcion": "Confirmas que, tal y como está, el cambio te parece correcto." },
    { "etiqueta": "Request changes", "rol": "Hay algo que debe corregirse antes de fusionar", "descripcion": "El feedback queda marcado como bloqueante — muchos equipos configuran GitHub para no permitir el merge hasta que se resuelva." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Qué mirar, no solo cómo mirarlo",
  "contenido": "El diff dice QUÉ cambió línea a línea — pero una revisión real pregunta además: ¿este cambio hace lo que dice el mensaje del commit? ¿Rompe algo que no se ve en este fichero? ¿El propio cambio necesita un test nuevo? La herramienta muestra el diff; el criterio de qué es un buen cambio sigue siendo humano."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "GitHub Docs — Reviewing proposed changes in a pull request",
      "descripcion": "Cómo navegar el diff de un PR, comentar líneas concretas, y los tres tipos de revisión.",
      "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/reviewing-proposed-changes-in-a-pull-request",
      "etiqueta": "GitHub Docs"
    }
  ]
}
```
