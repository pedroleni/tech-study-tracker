# Fork frente a rama: cuándo hace falta cada uno

- **Módulo:** Flujo real con GitHub
- **Slug:** `fork-frente-a-rama-cuando-hace-falta-cada-uno` (autogenerado del título)
- **Orden:** 390
- **Fuentes:** [GitHub Docs — About collaborative development models](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models) — ver `contenido/git/TEMARIO.md` #39

---

## Dos formas reales de colaborar en GitHub

> **Nota sobre este módulo:** GitHub real no existe dentro del sandbox de este curso — este contenido se basa en la documentación oficial de GitHub, citada explícitamente en cada lección.

Todo lo visto hasta ahora (ramas, merge, remotos) funciona igual dentro de un mismo repositorio. Pero cuando quien contribuye no tiene permiso de escritura directo sobre ese repositorio, hace falta un paso más: un **fork**.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los dos modelos que usa GitHub",
  "roles": [
    { "etiqueta": "Repositorio compartido", "rol": "Todo el mundo tiene acceso de escritura", "descripcion": "Cada persona crea ramas directamente en el mismo repositorio. Habitual en equipos pequeños trabajando en proyectos privados — no hace falta ningún fork." },
    { "etiqueta": "Fork y pull", "rol": "Cada persona trabaja en su propia copia", "descripcion": "Quien contribuye crea su propia copia del repositorio, trabaja ahí con libertad, y propone sus cambios con un pull request — sin permiso previo del original." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un fork no es un clon distinto — es una copia con memoria de su origen",
  "contenido": "Cita de GitHub Docs: cualquiera puede hacer fork de un repositorio con acceso de lectura, y \"no need permission from the upstream repository to push to a fork you created\" — empujas a TU copia sin pedir permiso a nadie. Lo que sí necesitas es que el proyecto original acepte tu pull request si quieres que tu cambio llegue allí."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "El modelo fork-and-pull reduce fricción para gente nueva.", "texto": "Es el modelo dominante en proyectos open source: cualquiera puede proponer un cambio sin coordinación previa, y quien mantiene el proyecto decide si lo acepta — sin tener que dar acceso de escritura a cada persona que quiera contribuir una vez." },
    { "titulo": "Dentro de un equipo con acceso compartido, una rama normal ya basta.", "texto": "No hace falta forkear tu propio proyecto de trabajo — el fork resuelve un problema de permisos que, dentro de un equipo con acceso compartido, simplemente no existe." }
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
      "titulo": "GitHub Docs — About collaborative development models",
      "descripcion": "Explica los dos modelos de colaboración de GitHub: repositorio compartido y fork-and-pull.",
      "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/about-collaborative-development-models",
      "etiqueta": "GitHub Docs"
    }
  ]
}
```
