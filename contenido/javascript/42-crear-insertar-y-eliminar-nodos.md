# Crear, insertar y eliminar nodos

- **Módulo:** El DOM
- **Slug:** `crear-insertar-y-eliminar-nodos` (autogenerado del título)
- **Orden:** 125
- **Fuentes:** [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [Challenge: Image gallery (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Image_gallery) — ver `contenido/javascript/TEMARIO.md` #42

---

## Qué es y para qué sirve

Hasta ahora, todo lo visto en el módulo operaba sobre elementos que ya existían en el HTML. Esta lección cubre construir elementos DESDE CERO con JavaScript, insertarlos en el árbol, y quitarlos cuando ya no hacen falta — con un gotcha clásico incluido: mover no es lo mismo que copiar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita construir el DOM, no solo leerlo",
  "roles": [
    { "etiqueta": "Quien crea elementos nuevos", "rol": "createElement() / createTextNode()", "descripcion": "Crean un nodo en memoria, sin ningún efecto visible hasta insertarlo en el árbol." },
    { "etiqueta": "Quien inserta (o mueve) un nodo", "rol": "appendChild()", "descripcion": "Si el nodo ya existe en el DOM, lo MUEVE a su nueva posición — no lo duplica." },
    { "etiqueta": "Quien necesita una copia real", "rol": "cloneNode()", "descripcion": "Crea un duplicado independiente, sin tocar el original — la alternativa cuando mover no sirve." }
  ]
}
```

## Crear nodos: en memoria, sin efecto todavía

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafo = document.createElement('p');\n  const texto = document.createTextNode('Contenido creado desde JavaScript');\n\n  parrafo.appendChild(texto);\n  console.log(parrafo.outerHTML); // '<p>Contenido creado desde JavaScript</p>'\n</script>",
  "anotaciones": [
    { "fragmento": "const parrafo = document.createElement('p');", "nota": "createElement() crea un elemento VACÍO — no forma parte del documento todavía, solo existe en memoria hasta que se inserte en algún sitio del árbol." },
    { "fragmento": "const texto = document.createTextNode('Contenido creado desde JavaScript');", "nota": "createTextNode() crea un nodo de TEXTO plano — la alternativa más explícita a textContent para construir el contenido pieza a pieza." }
  ]
}
```

## appendChild(): inserta, pero MUEVE si el nodo ya existía

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const seccion = document.querySelector('section');\n  const parrafo = document.querySelector('p'); // ya existe en el documento\n\n  seccion.appendChild(parrafo); // si parrafo ya estaba en otro sitio, se MUEVE, no se duplica\n</script>",
  "anotaciones": [
    { "fragmento": "seccion.appendChild(parrafo); // si parrafo ya estaba en otro sitio, se MUEVE, no se duplica", "nota": "appendChild() con un nodo que YA existe en el DOM no lo copia — lo MUEVE de donde estaba a su nueva posición, como último hijo de seccion." }
  ]
}
```

## Configurar antes de insertar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const imagen = document.createElement('img');\n  imagen.src = 'foto.jpg';\n  imagen.alt = 'Descripción de la foto';\n\n  document.querySelector('.galeria').appendChild(imagen);\n</script>",
  "anotaciones": [
    { "fragmento": "imagen.src = 'foto.jpg';\n  imagen.alt = 'Descripción de la foto';", "nota": "Es habitual crear un elemento, configurar varias de sus propiedades, y solo INSERTARLO en el DOM al final — mientras no se inserta, los cambios no provocan ningún repintado visible en pantalla." }
  ]
}
```

## Eliminar: remove() frente a removeChild()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafo = document.querySelector('p');\n\n  parrafo.remove(); // forma moderna — se elimina a sí mismo\n\n  // Equivalente más antiguo:\n  // parrafo.parentNode.removeChild(parrafo);\n</script>",
  "anotaciones": [
    { "fragmento": "parrafo.remove(); // forma moderna — se elimina a sí mismo", "nota": "remove() (más moderno) elimina el elemento directamente sobre sí mismo — más directo cuando ya se tiene la referencia al propio nodo." },
    { "fragmento": "// parrafo.parentNode.removeChild(parrafo);", "nota": "removeChild() (más antiguo) necesita llamarse desde el PADRE, pasándole el hijo a eliminar — funciona igual, pero exige tener a mano una referencia al contenedor." }
  ]
}
```

## cloneNode(): una copia real, sin mover nada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const original = document.querySelector('.tarjeta');\n  const copia = original.cloneNode(true); // true: clona también sus hijos\n\n  document.body.appendChild(copia);\n  console.log(document.querySelectorAll('.tarjeta').length); // 2 — el original sigue en su sitio\n</script>",
  "anotaciones": [
    { "fragmento": "const copia = original.cloneNode(true); // true: clona también sus hijos", "nota": "cloneNode() crea una COPIA sin tocar el original ni el DOM — para duplicar de verdad, en vez de mover. El argumento true clona también todos sus nodos descendientes; sin él, clona solo el elemento en sí, vacío." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const secciones = document.querySelectorAll('section');\n  const seccionA = secciones[0];\n  const seccionB = secciones[1];\n  const parrafo = seccionA.querySelector('p');\n\n  seccionB.appendChild(parrafo);\n\n  console.log(seccionA.querySelector('p'));\n  console.log(seccionB.querySelector('p'));\n</script>",
  "opciones": [
    "null y el párrafo — appendChild() con un nodo que ya existe lo MUEVE, no lo duplica; deja de estar en seccionA",
    "el párrafo y el párrafo — appendChild() siempre duplica el nodo insertado",
    "el párrafo y null — appendChild() no tiene efecto sobre un nodo que ya existe en otro sitio"
  ],
  "correcta": 0,
  "explicacion": "appendChild() con un nodo que YA está en el DOM no lo copia — lo MUEVE de donde estaba a su nuevo contenedor. Tras la llamada, parrafo deja de estar dentro de seccionA (null) y pasa a ser el último hijo de seccionB."
}
```

## Lo que estos métodos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "appendChild() siempre crea una copia del nodo insertado",
      "realidad": "Si el nodo ya existe en el DOM, lo MUEVE, sin duplicarlo."
    },
    {
      "mito": "createElement() añade el elemento al documento automáticamente",
      "realidad": "Crea un elemento en memoria, sin ningún efecto visible hasta insertarlo con appendChild() o similar."
    },
    {
      "mito": "remove() y removeChild() se llaman exactamente de la misma forma",
      "realidad": "remove() se llama sobre el propio elemento; removeChild() se llama desde su padre, pasándole el hijo."
    },
    {
      "mito": "cloneNode() clona también los hijos por defecto, sin necesitar ningún argumento",
      "realidad": "Sin el argumento true, clona solo el elemento en sí, vacío de descendientes."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que appendChild() duplique un nodo que ya existe en el DOM.", "texto": "Lo mueve a su nueva posición, en vez de copiarlo — para copiar hace falta cloneNode()." },
    { "titulo": "Insertar un elemento antes de terminar de configurar sus propiedades.", "texto": "Provoca repintados innecesarios frente a configurarlo todo antes de insertarlo." },
    { "titulo": "Usar removeChild() sin tener a mano una referencia al nodo padre.", "texto": "remove() es más directo cuando ya se tiene la referencia al propio elemento." },
    { "titulo": "Llamar a cloneNode() sin el argumento true cuando también hacían falta los hijos.", "texto": "Sin él, la copia queda completamente vacía por dentro." }
  ]
}
```

## Ejercicios

1. Crea un elemento con `createElement()`, configura su contenido y al menos un atributo, e insértalo en el documento.
2. Mueve un elemento ya existente de un contenedor a otro con `appendChild()`, y comprueba que no se duplica.
3. Elimina un elemento con `remove()`, y reescribe el mismo efecto usando `removeChild()` desde su padre.
4. Duplica un elemento con hijos usando `cloneNode(true)`, e inserta la copia junto al original.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "DOM scripting introduction",
      "descripcion": "Guía de MDN sobre createElement(), createTextNode(), appendChild() (incluido su comportamiento de mover en vez de copiar), removeChild(), remove() y cloneNode().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Challenge: Image gallery",
      "descripcion": "Ejercicio de MDN que ilustra el patrón práctico de crear un elemento y configurar varias de sus propiedades (src, alt) antes de insertarlo en el DOM.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Image_gallery",
      "etiqueta": "MDN"
    }
  ]
}
```
