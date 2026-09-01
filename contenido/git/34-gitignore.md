# `.gitignore`: qué ignorar y por qué (patrones reales)

- **Módulo:** .gitignore y config
- **Slug:** `gitignore-que-ignorar-y-por-que-patrones-reales` (autogenerado del título)
- **Orden:** 340
- **Fuentes:** [gitignore](https://git-scm.com/docs/gitignore) — ver `contenido/git/TEMARIO.md` #34

---

## No todo lo que hay en la carpeta debería acabar en el historial

Ficheros generados (`.log`, carpetas de dependencias, binarios compilados) no aportan nada al historial — y además cambian constantemente, ensuciando cada `status` con ruido que no es trabajo real. `.gitignore` le dice a Git qué patrones de fichero ignorar por completo.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Sin .gitignore, todo aparece como candidato",
  "esquemaGit": ["init .", { "escribir": { "ruta": "app.js", "contenido": "console.log(1)\n" } }, { "escribir": { "ruta": "debug.log", "contenido": "log de depuracion\n" } }],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Untracked files: app.js Y debug.log — Git no sabe todavía que debug.log es un fichero generado que no debería confirmarse nunca." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Con un .gitignore de una línea, debug.log desaparece de la lista",
  "esquemaGit": ["init .", { "escribir": { "ruta": ".gitignore", "contenido": "*.log\n" } }, { "escribir": { "ruta": "app.js", "contenido": "console.log(1)\n" } }, { "escribir": { "ruta": "debug.log", "contenido": "log de depuracion\n" } }],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "Ahora solo aparecen .gitignore y app.js. debug.log sigue en el disco (nadie lo ha borrado) — simplemente Git ha dejado de ofrecértelo como candidato a confirmar." }
  ]
}
```

## Patrones habituales

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "*.log ignora por extensión, en cualquier carpeta.", "texto": "El asterisco es un comodín — cualquier fichero terminado en .log, esté donde esté dentro del proyecto, queda ignorado." },
    { "titulo": "node_modules/ (con la barra) ignora una carpeta entera.", "texto": "Sin necesidad de listar cada fichero de dentro — cualquier cosa que exista dentro de esa carpeta, ahora o en el futuro, queda fuera." },
    { "titulo": "Un patrón que empieza por ! es una excepción.", "texto": "Por ejemplo, *.log seguido de !importante.log ignora todos los .log salvo ese uno concreto — útil cuando la mayoría de un tipo de fichero es ruido, pero hay una excepción real." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": ".gitignore no afecta a ficheros que YA están confirmados",
  "contenido": "Si un fichero ya forma parte del historial antes de añadirlo a .gitignore, seguirá apareciendo en status como modificado cada vez que cambie — el patrón solo evita que ficheros NUEVOS, todavía sin seguimiento, se ofrezcan como candidatos. Sacar del seguimiento algo que ya estaba confirmado necesita un paso aparte (git rm --cached), fuera del alcance de este módulo."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "gitignore",
      "descripcion": "Referencia oficial de los patrones de .gitignore.",
      "url": "https://git-scm.com/docs/gitignore",
      "etiqueta": "Git Reference"
    }
  ]
}
```
