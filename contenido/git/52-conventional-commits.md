# Conventional Commits: `feat`/`fix` obligatorios y el resto de tipos

- **Módulo:** Estándares reales de mensajes de commit
- **Slug:** `conventional-commits-feat-fix-obligatorios-y-el-resto-de-tipos` (autogenerado del título)
- **Orden:** 520
- **Fuentes:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) — ver `contenido/git/TEMARIO.md` #52

---

## Git no exige ningún formato — la convención sí

`git commit -m` acepta literalmente cualquier texto. "asdf", "arreglos", un poema — todo es un mensaje válido para Git. Conventional Commits es una convención **por encima** de Git, adoptada por muchísimos proyectos reales, que sí impone estructura — no porque Git la exija, sino porque un historial consistente es más útil para las personas (y las herramientas) que lo leen después.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un commit real con el formato de Conventional Commits",
  "esquemaGit": ["init .", { "escribir": { "ruta": "login.js", "contenido": "// login\n" } }, "add login.js"],
  "comando": "commit -m 'feat: anade el formulario de login'",
  "anotaciones": [
    { "fragmento": "feat", "nota": "El tipo va antes de los dos puntos, en minúsculas. Git lo trata como texto normal — es la convención, no Git, la que le da significado a esa palabra concreta." },
    { "fragmento": ": anade el formulario de login", "nota": "Descripción en minúscula, sin punto final — la forma que recomienda la propia especificación." }
  ]
}
```

## Los dos tipos obligatorios, y el resto

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Solo dos tipos son parte formal de la especificación",
  "contenido": "Cita textual de Conventional Commits 1.0.0: \"a commit of the type feat introduces a new feature\" y \"a commit of the type fix patches a bug\". Son los únicos dos que la especificación define — el resto (docs, style, refactor, test, chore...) son una extensión popular, tomada de Angular, no parte del estándar formal."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los tipos más habituales de la extensión de Angular",
  "roles": [
    { "etiqueta": "feat / fix", "rol": "Los dos formales de la especificación", "descripcion": "Nueva funcionalidad, o corrección de un bug — los únicos que tienen efecto directo en el versionado semántico (siguiente lección)." },
    { "etiqueta": "docs / style / test", "rol": "Cambios sin efecto en el comportamiento", "descripcion": "Documentación, formato de código, tests — cambios reales, pero que no alteran lo que el software hace." },
    { "etiqueta": "refactor / chore", "rol": "Reorganización o mantenimiento", "descripcion": "refactor cambia cómo está escrito el código sin cambiar su comportamiento; chore cubre tareas de mantenimiento que no encajan en ninguna otra categoría." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "git-en-vivo",
  "consigna": "Confirma un commit para un fichero nuevo, con un mensaje que empiece por feat: o fix: (o cualquier otro tipo de la lista de arriba).",
  "esquemaGit": ["init .", { "escribir": { "ruta": "api.js", "contenido": "// api\n" } }, "add api.js"],
  "comandoInicial": ""
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
      "descripcion": "La especificación completa, incluidos los dos tipos formales.",
      "url": "https://www.conventionalcommits.org/en/v1.0.0/",
      "etiqueta": "conventionalcommits.org"
    }
  ]
}
```
