# Alcance, `!` y `BREAKING CHANGE:` — y su relación directa con SemVer

- **Módulo:** Estándares reales de mensajes de commit
- **Slug:** `alcance-y-breaking-change-y-su-relacion-directa-con-semver` (autogenerado del título)
- **Orden:** 530
- **Fuentes:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) — ver `contenido/git/TEMARIO.md` #53

---

## El formato completo, más allá de "tipo: descripción"

La lección anterior mostró la forma mínima. La especificación permite añadir más precisión: en qué parte del proyecto afecta el cambio, y si rompe compatibilidad con lo anterior.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un commit con alcance (scope)",
  "esquemaGit": ["init .", { "escribir": { "ruta": "login.js", "contenido": "// login\n" } }, "add login.js"],
  "comando": "commit -m 'fix(auth): corrige el token que expiraba antes de tiempo'",
  "anotaciones": [
    { "fragmento": "(auth)", "nota": "El alcance, entre paréntesis justo después del tipo, dice EN QUÉ PARTE del proyecto ocurre el cambio — útil en proyectos grandes, con muchos módulos distintos cambiando en paralelo." }
  ]
}
```

## Marcar un cambio que rompe compatibilidad

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El signo ! antes de los dos puntos",
  "esquemaGit": ["init .", { "escribir": { "ruta": "api.js", "contenido": "// api\n" } }, "add api.js"],
  "comando": "commit -m 'feat(api)!: cambia el formato de respuesta de /usuarios'",
  "anotaciones": [
    { "fragmento": "!", "nota": "El ! justo antes de los dos puntos marca el commit como un cambio que rompe compatibilidad — quien actualice a esta versión puede necesitar cambiar su propio código." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dos formas válidas de marcar lo mismo, citadas literalmente",
  "contenido": "\"breaking changes MUST be indicated by a ! immediately before the :\" — o, alternativa, un pie de página: \"a breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon, space, and description\". La especificación aclara que si usas !, BREAKING CHANGE: en el pie es opcional — la propia descripción del commit ya puede explicar el cambio."
}
```

## La relación directa con SemVer

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada tipo de commit, traducido a un número de versión",
  "roles": [
    { "etiqueta": "fix", "rol": "PATCH (x.x.N)", "descripcion": "Una corrección — el número más a la derecha sube." },
    { "etiqueta": "feat", "rol": "MINOR (x.N.0)", "descripcion": "Funcionalidad nueva, sin romper nada existente — el número del medio sube." },
    { "etiqueta": "BREAKING CHANGE", "rol": "MAJOR (N.0.0)", "descripcion": "Rompe compatibilidad — el número de la izquierda sube, sea cual sea el tipo del commit." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esta traducción no la hace Git — la hacen herramientas encima de Git.", "texto": "semantic-release y similares leen el historial de commits con este formato y calculan automáticamente el próximo número de versión, sin que nadie lo decida a mano." },
    { "titulo": "Un solo commit BREAKING CHANGE sube la versión mayor, aunque el tipo sea fix.", "texto": "El ! o el pie BREAKING CHANGE: manda por encima del tipo — un fix! sigue siendo un cambio MAJOR, no PATCH." }
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
      "titulo": "Conventional Commits 1.0.0",
      "descripcion": "La especificación completa: alcance, !, BREAKING CHANGE: y su relación con SemVer.",
      "url": "https://www.conventionalcommits.org/en/v1.0.0/",
      "etiqueta": "conventionalcommits.org"
    }
  ]
}
```
