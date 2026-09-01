# Qué es una rama de verdad: un puntero, no una copia del proyecto

- **Módulo:** Branching real
- **Slug:** `que-es-una-rama-de-verdad-un-puntero-no-una-copia-del-proyecto` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [git-branch](https://git-scm.com/docs/git-branch) — ver `contenido/git/TEMARIO.md` #9

---

## La intuición equivocada

Es fácil imaginar una rama como una copia completa del proyecto que se separa de la principal. No es así — y esa idea equivocada hace parecer que crear una rama debería ser lento o costoso, cuando en realidad es instantáneo.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El hash del commit actual",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base"],
  "comando": "rev-parse HEAD",
  "anotaciones": [
    { "fragmento": "HEAD", "nota": "Esto es el hash real del commit al que apunta la rama actual ahora mismo. Un puñado de caracteres — nada que se parezca a una copia de ningún fichero." }
  ]
}
```

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Ese mismo hash, visto desde la rama",
  "esquemaGit": ["init .", { "escribir": { "ruta": "a.txt", "contenido": "v1\n" } }, "add a.txt", "commit -m base"],
  "comando": "for-each-ref",
  "anotaciones": [
    { "fragmento": "for-each-ref", "nota": "refs/heads/master es la rama master — y lo único que guarda es exactamente el mismo hash de arriba. Una rama es, literalmente, un nombre apuntando a un commit." }
  ]
}
```

## Lo que esto hace posible

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Crear una rama es instantáneo, sea cual sea el tamaño del proyecto.", "texto": "No hay que copiar ningún fichero — solo escribir un nuevo nombre que apunte al mismo commit en el que estabas. Por dentro es literalmente eso, algo que se ve con detalle en el Módulo 5." },
    { "titulo": "Una rama se mueve sola cuando confirmas un commit nuevo.", "texto": "Cada vez que haces commit estando en una rama, esa rama actualiza automáticamente su puntero para apuntar al nuevo commit — es lo único que \"avanzar\" significa aquí." }
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
      "titulo": "git-branch",
      "descripcion": "Referencia oficial de git branch.",
      "url": "https://git-scm.com/docs/git-branch",
      "etiqueta": "Git Reference"
    }
  ]
}
```
