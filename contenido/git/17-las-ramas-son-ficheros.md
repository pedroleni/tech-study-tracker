# Las ramas son ficheros: cómo son de verdad las referencias (`.git/refs`, `.git/HEAD`)

- **Módulo:** Git por dentro: objetos y referencias
- **Slug:** `las-ramas-son-ficheros-como-son-de-verdad-las-referencias-git-refs-git-head` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [Pro Git — Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References) + [git-for-each-ref](https://git-scm.com/docs/git-for-each-ref) — ver `contenido/git/TEMARIO.md` #17

---

## Una rama no es un objeto — es un puntero a uno

En el Módulo 3 se dijo que una rama es "un nombre que apunta a un commit". Ahora que ya conoces los objetos reales (blob, tree, commit), se puede ser mucho más concreto: una rama **ni siquiera es un objeto Git** — es un fichero de texto plano, en una carpeta normal del sistema de ficheros, que contiene un hash.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Todas las ramas, con el hash exacto al que apunta cada una",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m 'Primer commit'"],
  "comando": "for-each-ref",
  "anotaciones": [
    { "fragmento": "for-each-ref", "nota": "refs/heads/master es literalmente la ruta de un fichero real: .git/refs/heads/master. Ese fichero no contiene nada más que el hash que ves a la izquierda — nada de metadatos, nada de estructura especial." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Se puede comprobar literalmente con cat",
  "contenido": "Pro Git lo muestra tal cual: cat .git/refs/heads/master imprime solo el hash. Y cat .git/HEAD imprime algo distinto: ref: refs/heads/master — no un hash, sino el NOMBRE de la rama actual. Por eso moverte de rama con checkout es tan barato: solo reescribe esa línea de HEAD."
}
```

## Por qué esto importa para todo lo demás

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Crear una rama es escribir un fichero de una línea.", "texto": "checkout -b no copia nada del proyecto — crea un fichero nuevo en refs/heads/ con el hash del commit actual dentro. Por eso es instantáneo sin importar el tamaño del repositorio." },
    { "titulo": "\"Estar en una rama\" es solo el contenido de HEAD.", "texto": "HEAD normalmente apunta a un nombre de rama (ref: refs/heads/master), no directamente a un hash — así, cuando confirmas un commit nuevo, Git sabe qué fichero de refs/heads/ tiene que actualizar. (Cuando HEAD apunta directamente a un hash, sin pasar por una rama, se le llama \"detached HEAD\" — un caso especial fuera del alcance de este módulo.)" },
    { "titulo": "for-each-ref es, en el fondo, listar una carpeta.", "texto": "No hay ninguna base de datos aparte guardando qué ramas existen — son los ficheros que hay dentro de .git/refs/heads/, uno por rama." }
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
      "titulo": "Pro Git — Git References",
      "descripcion": "Muestra en vivo el contenido real de .git/refs/heads/* y .git/HEAD con cat.",
      "url": "https://git-scm.com/book/en/v2/Git-Internals-Git-References",
      "etiqueta": "Pro Git"
    },
    {
      "titulo": "git-for-each-ref",
      "descripcion": "Referencia oficial de git for-each-ref.",
      "url": "https://git-scm.com/docs/git-for-each-ref",
      "etiqueta": "Git Reference"
    }
  ]
}
```
