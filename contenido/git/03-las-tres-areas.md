# Las tres áreas: directorio de trabajo, staging (índice) y repositorio

- **Módulo:** Qué es Git y por qué
- **Slug:** `las-tres-areas-directorio-de-trabajo-staging-indice-y-repositorio` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [What is Git?](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F) — ver `contenido/git/TEMARIO.md` #3

---

## Un fichero pasa por tres sitios distintos antes de quedar guardado

Cuando modificas un fichero en un proyecto con Git, ese cambio no queda "guardado" de golpe. Pasa por tres áreas reales, una detrás de otra — y entender esto es la base de por qué `git add` y `git commit` son dos pasos separados, no uno solo (eso se ve con comandos reales en el Módulo 2).

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "El camino de un cambio",
  "items": [
    { "fecha": "1", "titulo": "Directorio de trabajo", "texto": "Los ficheros tal y como los ves y editas en tu carpeta del proyecto. Un cambio aquí es solo texto en disco — Git sabe que el fichero cambió, pero todavía no ha hecho nada con ese cambio." },
    { "fecha": "2", "titulo": "Staging area (el índice)", "texto": "Una zona intermedia donde eliges, de entre todo lo que has cambiado, exactamente qué va a formar parte del próximo commit. Es la lista de la compra del próximo commit — se construye a mano, con git add." },
    { "fecha": "3", "titulo": "Repositorio", "texto": "Una vez confirmas con git commit, lo que había en el staging area queda guardado para siempre como un snapshot con su propio hash — ya forma parte del historial real del proyecto." }
  ]
}
```

## Por qué existe un paso intermedio (el staging)

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que el staging permite hacer, que sin él no se podría",
  "roles": [
    { "etiqueta": "Confirmar por partes", "rol": "No todo lo que has tocado tiene que ir en el mismo commit", "descripcion": "Puedes haber cambiado tres ficheros distintos por tres razones distintas — el staging deja meter en el commit solo los que de verdad pertenecen juntos." },
    { "etiqueta": "Revisar antes de confirmar", "rol": "Ver exactamente qué vas a guardar, antes de guardarlo", "descripcion": "El staging es el punto en el que puedes comprobar (con git diff --staged) que lo que estás a punto de confirmar es de verdad lo que querías confirmar." }
  ]
}
```

## Lo que dice la fuente, literal

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las tres secciones, con sus nombres reales",
  "contenido": "Pro Git las llama así: \"working tree\" (\"a single checkout of one version of the project\"), \"staging area\" (\"stores information about what will go into your next commit\", también llamada índice), y \"Git directory\" (\"where Git stores the metadata and object database for your project\") — el repositorio en sí."
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pro Git — What is Git?",
      "descripcion": "Sección \"The Three States\", con el diagrama original de las tres áreas y el flujo entre ellas.",
      "url": "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F",
      "etiqueta": "Pro Git"
    }
  ]
}
```
