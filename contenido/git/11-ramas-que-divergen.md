# Ramas que divergen: dos historias que crecen por separado

- **Módulo:** Branching real
- **Slug:** `ramas-que-divergen-dos-historias-que-crecen-por-separado` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) — ver `contenido/git/TEMARIO.md` #11

---

## Dos ramas, cada una con su propio commit nuevo

Nada impide que dos ramas avancen a la vez, cada una con sus propios commits. Cuando eso pasa, se dice que las ramas **divergen** — comparten un pasado común, pero ya no apuntan al mismo sitio.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "feature y master, cada una con un commit que la otra no tiene",
  "esquemaGit": [
    "init .",
    { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } },
    "add a.txt",
    "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "b.txt", "contenido": "feature\n" } },
    "add b.txt",
    "commit -m 'feature: añade b.txt'",
    "checkout master",
    { "escribir": { "ruta": "c.txt", "contenido": "master\n" } },
    "add c.txt",
    "commit -m 'master: añade c.txt'"
  ],
  "comando": "status",
  "mostrarGrafo": true,
  "anotaciones": [
    { "fragmento": "status", "nota": "El grafo de abajo muestra lo que status no dice directamente: master y feature comparten el commit base, pero cada una añadió un commit distinto después. Ninguna de las dos contiene el commit de la otra." }
  ]
}
```

## Por qué esto es normal, no un problema

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Divergir no es un error — es lo que hace posible trabajar en paralelo.", "texto": "Cada rama avanza de forma completamente independiente. Nada se rompe por tener dos historias distintas al mismo tiempo; el problema (si lo hay) aparece solo cuando intentas juntarlas — eso es exactamente lo que se ve en el Módulo 4." },
    { "titulo": "El commit común (base) sigue siendo el punto de partida de ambas.", "texto": "Ninguna rama \"pierde\" ese commit — las dos lo tienen en su historial. Lo único que cambia es lo que cada una añadió después." }
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
      "titulo": "Pro Git — Branches in a Nutshell",
      "descripcion": "El capítulo de Pro Git sobre ramas, con el mismo modelo de commits y punteros usado aquí.",
      "url": "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
      "etiqueta": "Pro Git"
    }
  ]
}
```
