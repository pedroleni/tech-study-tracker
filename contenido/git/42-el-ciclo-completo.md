# El ciclo completo: rama → PR → revisión → merge → borrar rama

- **Módulo:** Flujo real con GitHub
- **Slug:** `el-ciclo-completo-rama-pr-revision-merge-borrar-rama` (autogenerado del título)
- **Orden:** 420
- **Fuentes:** [GitHub Docs — GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow) — ver `contenido/git/TEMARIO.md` #42

---

## Todo lo del módulo, en un único flujo

Cada lección anterior de este módulo es una pieza suelta. GitHub flow es cómo encajan todas, de principio a fin — y GitHub Docs lo resume en seis pasos concretos.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "GitHub flow, paso a paso",
  "items": [
    { "fecha": "1", "titulo": "Crear una rama", "texto": "checkout -b (Módulo 3), con un nombre descriptivo — no rama-nueva, sino algo que diga qué cambia." },
    { "fecha": "2", "titulo": "Hacer los cambios", "texto": "Commits normales (Módulo 2), con mensajes claros — el Módulo 15 entra en el estándar concreto." },
    { "fecha": "3", "titulo": "Abrir un pull request", "texto": "La propuesta de merge de la lección anterior — con la rama ya empujada al remoto (Módulo 9)." },
    { "fecha": "4", "titulo": "Atender comentarios de la revisión", "texto": "Nuevos commits en la misma rama, respondiendo a lo que salió al revisar el diff (lección anterior)." },
    { "fecha": "5", "titulo": "Fusionar el pull request", "texto": "El merge real (Módulo 4) — fast-forward, three-way, o squash, según la convención del proyecto." },
    { "fecha": "6", "titulo": "Borrar la rama", "texto": "Ya cumplió su función — el commit de merge (o los commits individuales) queda para siempre en el historial de la rama principal." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"Lightweight, branch-based workflow\"",
  "contenido": "Así lo describe la propia documentación: un flujo ligero basado en ramas, pensado para desplegar con frecuencia. A diferencia de flujos más elaborados (el Módulo 15 compara varios), GitHub flow asume que main siempre está en un estado desplegable — cada rama vive poco tiempo, se fusiona, y desaparece."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Borrar la rama no borra su historia.", "texto": "Los commits que aportó siguen formando parte del historial de main para siempre (Módulo 5: un objeto no desaparece solo porque una rama deje de apuntarle) — borrar la rama es limpieza, no pérdida de información." },
    { "titulo": "El ciclo se repite constantemente, no es un proceso especial.", "texto": "En un equipo activo, este flujo de seis pasos ocurre varias veces al día, en paralelo, para features distintas — es el ritmo normal de trabajo, no una excepción." }
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
      "titulo": "GitHub Docs — GitHub flow",
      "descripcion": "Los seis pasos oficiales del flujo de GitHub.",
      "url": "https://docs.github.com/en/get-started/using-github/github-flow",
      "etiqueta": "GitHub Docs"
    }
  ]
}
```
