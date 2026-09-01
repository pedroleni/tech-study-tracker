# Qué es un pull request de verdad (no "una petición", una propuesta de merge)

- **Módulo:** Flujo real con GitHub
- **Slug:** `que-es-un-pull-request-de-verdad-no-una-peticion-una-propuesta-de-merge` (autogenerado del título)
- **Orden:** 400
- **Fuentes:** [GitHub Docs — About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) — ver `contenido/git/TEMARIO.md` #40

---

## El nombre confunde: no es una petición de "traer" nada

"Pull request" suena a pedirle algo a alguien. Lo que es de verdad: una **propuesta de merge**, con todo el contexto de git ya incorporado — una rama concreta, comparada contra otra, con su diff completo visible, discutible línea a línea antes de fusionarse.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La definición literal de GitHub Docs",
  "contenido": "\"Pull requests\" son \"proposals to merge code changes into a project\" — la funcionalidad de colaboración principal de GitHub para discutir y revisar cambios antes de fusionarlos. No es una capa nueva sobre Git: por debajo sigue siendo exactamente el merge que ya conoces del Módulo 4, solo que con una interfaz para hablar de él antes de que ocurra."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Un PR compara dos ramas, no dos commits sueltos.", "texto": "\"rama a fusionar\" contra \"rama de destino\" — el mismo par que le pasarías a git merge si lo hicieras a mano en tu terminal." },
    { "titulo": "Abrir un PR no fusiona nada todavía.", "texto": "Es una propuesta, revisable y discutible, con comentarios y aprobaciones — el merge real solo pasa cuando alguien pulsa el botón de fusionar (o el propio autor, si tiene permiso)." },
    { "titulo": "Sigue existiendo aunque la rama se borre después.", "texto": "Un PR ya fusionado queda como registro permanente de la discusión — comentarios, commits, y el diff exacto que se aprobó — incluso después de borrar la rama origen." }
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
      "titulo": "GitHub Docs — About pull requests",
      "descripcion": "La documentación oficial de qué es un pull request y cómo funciona.",
      "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",
      "etiqueta": "GitHub Docs"
    }
  ]
}
```
