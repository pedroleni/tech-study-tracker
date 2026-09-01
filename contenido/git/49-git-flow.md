# Git Flow: ramas `main`/`develop`/`feature`/`release`/`hotfix`

- **Módulo:** Un equipo grande, varias features
- **Slug:** `git-flow-ramas-main-develop-feature-release-hotfix` (autogenerado del título)
- **Orden:** 490
- **Fuentes:** [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) — ver `contenido/git/TEMARIO.md` #49

---

## El modelo que popularizó las "estrategias de branching"

> **Nota sobre este módulo:** GitHub Flow (Módulo 13) ya cubrió un flujo real, ligero. Este módulo compara estrategias más elaboradas, pensadas para otro tipo de proyecto — basado en fuentes reales citadas en cada lección, sin motor ejecutable de por medio.

Publicado por Vincent Driessen en 2010, Git Flow fue durante años el modelo de referencia para proyectos con ciclos de release formales — no despliegue continuo, sino versiones numeradas que se publican de vez en cuando.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las cinco ramas de Git Flow",
  "roles": [
    { "etiqueta": "main", "rol": "Siempre en estado de producción", "descripcion": "Cada commit en main es una versión ya publicada — nunca se trabaja aquí directamente." },
    { "etiqueta": "develop", "rol": "La rama principal de integración", "descripcion": "Donde convergen todas las features terminadas, en camino hacia la próxima release — pero todavía no publicada." },
    { "etiqueta": "feature/*", "rol": "Una funcionalidad en desarrollo", "descripcion": "Sale de develop, y vuelve a develop cuando está lista — nunca toca main directamente." }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las otras dos, para preparar y arreglar releases",
  "roles": [
    { "etiqueta": "release/*", "rol": "Preparar una versión concreta", "descripcion": "Sale de develop cuando ya está lista para publicarse — aquí solo se corrigen bugs menores, sin nueva funcionalidad. Termina fusionándose en main Y en develop." },
    { "etiqueta": "hotfix/*", "rol": "Arreglar producción sin esperar al ciclo normal", "descripcion": "Sale directamente de main para un bug urgente, y también termina fusionándose en main Y en develop — para que el arreglo no se pierda en el próximo release." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cita textual del propio autor, con una reflexión posterior real",
  "contenido": "La fuente original explica: \"the master branch (...) the source code of HEAD always reflects a production-ready state\". El propio Driessen añadió en 2020 una nota reconociendo que Git Flow puede no encajar bien en entornos de entrega continua — precisamente el terreno de GitHub Flow (Módulo 13) y trunk-based development (siguiente lección)."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "A successful Git branching model",
      "descripcion": "El artículo original de Vincent Driessen (2010) que define Git Flow, incluida su reflexión posterior de 2020.",
      "url": "https://nvie.com/posts/a-successful-git-branching-model/",
      "etiqueta": "nvie.com"
    }
  ]
}
```
