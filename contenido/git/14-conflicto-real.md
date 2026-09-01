# Conflicto real: los marcadores `<<<<<<<`/`=======`/`>>>>>>>` y cómo resolverlos a mano

- **Módulo:** Merge
- **Slug:** `conflicto-real-los-marcadores-y-como-resolverlos-a-mano` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [git-merge](https://git-scm.com/docs/git-merge) + [Pro Git — Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging) — ver `contenido/git/TEMARIO.md` #14

---

## Cuando las dos ramas tocan exactamente lo mismo

Un three-way merge combina automáticamente cambios en ficheros o líneas distintas. Pero si **las dos ramas modificaron la misma línea del mismo fichero**, Git no tiene forma de decidir cuál de las dos versiones es la correcta — y no lo intenta. Deja el fichero con las dos versiones marcadas, y te pide a ti que decidas.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un merge que no puede resolverse solo",
  "esquemaGit": [
    "init .",
    { "escribir": { "ruta": "a.txt", "contenido": "linea original\n" } },
    "add a.txt",
    "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "a.txt", "contenido": "linea cambiada en feature\n" } },
    "add a.txt",
    "commit -m 'feature: cambia la linea'",
    "checkout master",
    { "escribir": { "ruta": "a.txt", "contenido": "linea cambiada en master\n" } },
    "add a.txt",
    "commit -m 'master: cambia la linea tambien'",
    "merge feature"
  ],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"conflict: a.txt\" — Git se ha detenido a mitad del merge. El merge en sí (arriba, en esquemaGit) no imprime ningún aviso de conflicto; hay que consultar status para enterarte de que hay algo que resolver." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El propio merge conflictivo no avisa por su cuenta",
  "contenido": "Esto es real y sorprende: un git merge que termina en conflicto no imprime ningún mensaje de error en la mayoría de motores (incluido este) — simplemente deja el repositorio a medio resolver. La única forma fiable de saberlo es mirar git status justo después de cualquier merge."
}
```

## Lo que queda escrito en el fichero

El fichero en disco no se queda vacío ni roto — Git escribe las dos versiones, una detrás de otra, separadas por marcadores de texto. Este es el formato real, documentado en Pro Git:

```text
<<<<<<< HEAD:index.html
<div id="footer">contact : email.support@github.com</div>
=======
<div id="footer">
 please contact us at support@github.com
</div>
>>>>>>> iss53:index.html
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué significa cada parte",
  "roles": [
    { "etiqueta": "<<<<<<< HEAD", "rol": "Empieza tu versión", "descripcion": "Todo lo que hay entre esta línea y ======= es como está el fichero en la rama en la que estabas (aquí, master)." },
    { "etiqueta": "=======", "rol": "Separador", "descripcion": "Marca dónde termina tu versión y empieza la otra." },
    { "etiqueta": ">>>>>>> feature", "rol": "Termina la otra versión", "descripcion": "Todo lo que hay entre ======= y esta línea viene de la rama que estabas fusionando." }
  ]
}
```

## Resolver: editar, marcar como resuelto, confirmar

Resolver un conflicto es manual: abres el fichero, decides qué contenido final quieres (una de las dos versiones, la otra, o algo distinto combinando ambas) y borras los tres marcadores a mano. Después, el resto es exactamente el flujo normal de un commit.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Una vez editado el fichero a mano, se marca como resuelto",
  "esquemaGit": [
    "init .",
    { "escribir": { "ruta": "a.txt", "contenido": "linea original\n" } },
    "add a.txt",
    "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "a.txt", "contenido": "linea cambiada en feature\n" } },
    "add a.txt",
    "commit -m 'feature: cambia la linea'",
    "checkout master",
    { "escribir": { "ruta": "a.txt", "contenido": "linea cambiada en master\n" } },
    "add a.txt",
    "commit -m 'master: cambia la linea tambien'",
    "merge feature",
    { "escribir": { "ruta": "a.txt", "contenido": "linea resuelta a mano\n" } }
  ],
  "comando": "add a.txt",
  "anotaciones": [
    { "fragmento": "add", "nota": "add ya no significa \"añadir al staging\" en el sentido normal — durante un merge en conflicto, add sobre el fichero resuelto le dice a Git \"este conflicto ya está resuelto, considéralo listo para el commit\"." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "status confirma que ya no queda ningún conflicto pendiente",
  "esquemaGit": [
    "init .",
    { "escribir": { "ruta": "a.txt", "contenido": "linea original\n" } },
    "add a.txt",
    "commit -m base",
    "checkout -b feature",
    { "escribir": { "ruta": "a.txt", "contenido": "linea cambiada en feature\n" } },
    "add a.txt",
    "commit -m 'feature: cambia la linea'",
    "checkout master",
    { "escribir": { "ruta": "a.txt", "contenido": "linea cambiada en master\n" } },
    "add a.txt",
    "commit -m 'master: cambia la linea tambien'",
    "merge feature",
    { "escribir": { "ruta": "a.txt", "contenido": "linea resuelta a mano\n" } },
    "add a.txt"
  ],
  "comando": "status",
  "anotaciones": [
    { "fragmento": "status", "nota": "\"Changes to be committed: modified: a.txt\" — ya no aparece como conflicto, solo como un cambio normal en el staging, listo para el paso final: git commit." }
  ]
}
```

Ese commit final (sin -m adicional necesario, aunque puedes añadir uno) cierra el merge exactamente igual que el three-way merge de la lección anterior — solo que esta vez el contenido combinado lo decidiste tú, no Git.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "git-merge",
      "descripcion": "Referencia oficial de git merge.",
      "url": "https://git-scm.com/docs/git-merge",
      "etiqueta": "Git Reference"
    },
    {
      "titulo": "Pro Git — Basic Branching and Merging",
      "descripcion": "Incluye el ejemplo real de marcadores de conflicto usado en esta lección, y el flujo completo de resolución.",
      "url": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
      "etiqueta": "Pro Git"
    }
  ]
}
```
