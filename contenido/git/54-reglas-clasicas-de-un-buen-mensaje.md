# Las reglas clásicas de un buen mensaje: asunto en imperativo, 50/72

- **Módulo:** Estándares reales de mensajes de commit
- **Slug:** `las-reglas-clasicas-de-un-buen-mensaje-asunto-en-imperativo-50-72` (autogenerado del título)
- **Orden:** 540
- **Fuentes:** [git-commit — Discussion](https://git-scm.com/docs/git-commit#_discussion) — ver `contenido/git/TEMARIO.md` #54

---

## Más antiguas que Conventional Commits, y todavía vigentes

Antes de que existiera Conventional Commits, la propia documentación oficial de `git commit` ya daba una recomendación concreta de formato — y sigue siendo la base sobre la que se apoya casi cualquier convención posterior, incluida la de las dos lecciones anteriores.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La cita completa, textual",
  "contenido": "\"it's a good idea to begin the commit message with a single short (no more than 50 characters) line summarizing the change, followed by a blank line and then a more thorough description (...) The text up to the first blank line in a commit message is treated as the commit title, and that title is used throughout Git.\""
}
```

## Tres reglas concretas

```laboratorio
{
  "tipo": "roles",
  "titulo": "50/72 y el modo imperativo",
  "roles": [
    { "etiqueta": "50 caracteres", "rol": "Límite del asunto (la primera línea)", "descripcion": "No es arbitrario — muchas herramientas (log --oneline, interfaces de PR) truncan o muestran mal un asunto más largo. Corto y directo se lee mejor en todas partes." },
    { "etiqueta": "72 caracteres", "rol": "Ancho recomendado para el cuerpo", "descripcion": "El cuerpo (después de la línea en blanco) se envuelve a 72 columnas — pensado para que se vea bien incluso en herramientas que no hacen wrap automático de texto largo." },
    { "etiqueta": "Modo imperativo", "rol": "\"Arregla\", no \"Arreglado\" ni \"Arregla(ndo)\"", "descripcion": "La convención es escribir como si el commit fuera una orden: \"Fix bug\", no \"Fixed bug\" ni \"Fixes bug\" — coincide con cómo Git nombra sus propios commits automáticos (merge, revert)." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Asunto corto, línea en blanco, cuerpo con el porqué",
  "esquemaGit": ["init .", { "escribir": { "ruta": "login.js", "contenido": "// login\n" } }, "add login.js"],
  "comando": "commit -m 'Corrige el timeout de login en conexiones lentas' -m 'El endpoint fallaba a los 30s en conexiones lentas. Sube el limite a 60s y anade reintento con backoff.'",
  "anotaciones": [
    { "fragmento": "-m 'Corrige el timeout de login en conexiones lentas'", "nota": "El asunto: corto, en modo imperativo (\"Corrige\", no \"Corregido\"), sin punto final." },
    { "fragmento": "-m 'El endpoint fallaba a los 30s en conexiones lentas. Sube el limite a 60s y anade reintento con backoff.'", "nota": "El cuerpo: el PORQUÉ del cambio, no solo el qué — información que el propio diff ya muestra por sí solo, así que repetirla aquí no aporta nada." }
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
      "titulo": "git-commit — Discussion",
      "descripcion": "La sección de la referencia oficial de git commit con estas reglas.",
      "url": "https://git-scm.com/docs/git-commit#_discussion",
      "etiqueta": "Git Reference"
    }
  ]
}
```
