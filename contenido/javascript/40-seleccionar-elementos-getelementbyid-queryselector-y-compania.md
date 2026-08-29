# Seleccionar elementos: getElementById, querySelector y compañía

- **Módulo:** El DOM
- **Slug:** `seleccionar-elementos-getelementbyid-queryselector-y-compania` (autogenerado del título)
- **Orden:** 119
- **Fuentes:** [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [HTMLCollection (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection) + [NodeList (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) — ver `contenido/javascript/TEMARIO.md` #40

---

## Qué es y para qué sirve

Cuatro formas de encontrar elementos en el DOM: dos modernas basadas en selectores CSS (`querySelector`/`querySelectorAll`), y dos más antiguas pero todavía comunes (`getElementById`/`getElementsByTagName`). La elección importa más de lo que parece — sus resultados se comportan de forma distinta cuando el DOM cambia después.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita encontrar un elemento (o varios)",
  "roles": [
    { "etiqueta": "Quien busca uno solo", "rol": "querySelector() / getElementById()", "descripcion": "Devuelven un único elemento — el primero que coincide, o el que tiene ese id exacto." },
    { "etiqueta": "Quien busca varios a la vez", "rol": "querySelectorAll() / getElementsByTagName()", "descripcion": "Devuelven una colección — pero de tipos distintos, con comportamientos distintos ante cambios del DOM." },
    { "etiqueta": "Quien pregunta si se actualiza sola", "rol": "Vivo frente a estático", "descripcion": "Algunas colecciones reflejan cambios del DOM automáticamente; querySelectorAll() es la única que no lo hace." }
  ]
}
```

## querySelector(): el primero que coincide

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const enlace = document.querySelector('a');             // el primer <a> del documento\n  const primerItem = document.querySelector('#lista li'); // CSS: el primer li dentro de #lista\n\n  console.log(enlace.tagName); // 'A'\n</script>",
  "anotaciones": [
    { "fragmento": "const primerItem = document.querySelector('#lista li'); // CSS: el primer li dentro de #lista", "nota": "querySelector() acepta cualquier selector CSS válido — desde uno simple ('a') hasta uno compuesto ('#lista li') — y devuelve siempre el PRIMER elemento que coincide, o null si no hay ninguno." }
  ]
}
```

## querySelectorAll(): todos los que coinciden

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafos = document.querySelectorAll('p');\n  console.log(parrafos.length);              // el número de <p> en el documento\n  console.log(parrafos instanceof NodeList);  // true\n\n  parrafos.forEach((p) => console.log(p.textContent));\n</script>",
  "anotaciones": [
    { "fragmento": "parrafos.forEach((p) => console.log(p.textContent));", "nota": "querySelectorAll() devuelve un NodeList — soporta forEach() directamente, algo que un HTMLCollection (visto más abajo) no soporta sin convertirlo antes." }
  ]
}
```

## getElementById(): el método más antiguo, sin #

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const elemento = document.getElementById('miId'); // sin el # que usa querySelector\n  console.log(elemento);\n</script>",
  "anotaciones": [
    { "fragmento": "const elemento = document.getElementById('miId'); // sin el # que usa querySelector", "nota": "getElementById() es un método más antiguo, específico para buscar por id — recibe el id TAL CUAL, sin el # que sí hace falta en un selector CSS como el de querySelector()." }
  ]
}
```

## getElementsByTagName(): una colección que se actualiza sola

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const parrafos = document.getElementsByTagName('p');\n  console.log(parrafos.length); // supongamos 2\n\n  const nuevoParrafo = document.createElement('p');\n  document.body.appendChild(nuevoParrafo);\n\n  console.log(parrafos.length); // 3 — ¡la colección se actualizó sola!\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(parrafos.length); // 3 — ¡la colección se actualizó sola!", "nota": "getElementsByTagName() devuelve un HTMLCollection VIVO — se actualiza automáticamente cuando el DOM cambia, sin necesitar volver a llamar al método." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "querySelectorAll() es la única API que devuelve algo estático",
  "contenido": "querySelectorAll() devuelve un NodeList ESTÁTICO — una foto fija del momento de la consulta, que no cambia aunque el DOM cambie después. getElementsByTagName() (y childNodes, visto en la lección anterior) devuelven colecciones VIVAS, que se actualizan solas. Mezclar ambos comportamientos sin saberlo es una fuente clásica de bugs sutiles."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const porTag = document.getElementsByTagName('li');\n  const porQuery = document.querySelectorAll('li');\n\n  console.log(porTag.length, porQuery.length); // supongamos 2 y 2\n\n  const nuevo = document.createElement('li');\n  document.querySelector('ul').appendChild(nuevo);\n\n  console.log(porTag.length, porQuery.length);\n</script>",
  "opciones": [
    "3 y 2 — porTag es un HTMLCollection VIVO que se actualiza solo; porQuery es un NodeList ESTÁTICO, congelado en el momento de la consulta",
    "3 y 3 — ambas colecciones se actualizan automáticamente al cambiar el DOM",
    "2 y 2 — ninguna colección se actualiza después de haberse creado"
  ],
  "correcta": 0,
  "explicacion": "getElementsByTagName() devuelve un HTMLCollection VIVO — porTag.length pasa de 2 a 3 automáticamente al añadir el nuevo <li>. querySelectorAll() es la única API del DOM que devuelve un NodeList ESTÁTICO — porQuery sigue siendo 2, una foto fija tomada en el momento de la consulta original."
}
```

## Lo que estos métodos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "querySelectorAll() y getElementsByTagName() devuelven el mismo tipo de colección, solo con sintaxis distinta",
      "realidad": "Una es un NodeList estático; la otra, un HTMLCollection vivo — comportamientos genuinamente distintos ante cambios del DOM."
    },
    {
      "mito": "Cualquier colección devuelta por el DOM se actualiza sola al cambiar el documento",
      "realidad": "querySelectorAll() es la ÚNICA API que devuelve algo estático — la mayoría del resto son vivas."
    },
    {
      "mito": "getElementById() necesita el símbolo # delante del id, igual que querySelector()",
      "realidad": "Recibe el id tal cual, sin ningún símbolo delante."
    },
    {
      "mito": "Un NodeList y un HTMLCollection soportan exactamente los mismos métodos",
      "realidad": "Un NodeList soporta forEach() directamente; un HTMLCollection no, hay que convertirlo antes (por ejemplo, con Array.from())."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir un NodeList estático con un HTMLCollection vivo.", "texto": "Solo querySelectorAll() devuelve algo que no se actualiza solo." },
    { "titulo": "Añadir el # al id al usar getElementById(), como si fuera un selector CSS.", "texto": "Ese método no usa sintaxis de selector, solo el id tal cual." },
    { "titulo": "Modificar el DOM mientras se recorre un HTMLCollection vivo, sin copiarlo antes.", "texto": "Puede saltarse elementos o entrar en un bucle inesperado — conviene copiarlo con Array.from()." },
    { "titulo": "Llamar a forEach() directamente sobre un HTMLCollection.", "texto": "No lo soporta de forma nativa, a diferencia de un NodeList." }
  ]
}
```

## Ejercicios

1. Usa `querySelector()` con un selector CSS compuesto (por ejemplo, `'#id .clase'`) para seleccionar un elemento concreto.
2. Usa `querySelectorAll()` y recorre el resultado con `forEach()`.
3. Compara el comportamiento de `getElementsByTagName()` y `querySelectorAll()` al añadir un elemento nuevo al DOM después de hacer la consulta.
4. Explica por qué se recomienda copiar un `HTMLCollection` (por ejemplo con `Array.from()`) antes de añadir o quitar elementos mientras se recorre.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Usa querySelector() con un selector compuesto (ejercicio 1). Usa querySelectorAll() y recorre el resultado con forEach() (ejercicio 2).",
  "html": "<div id=\"panel\">\n  <p class=\"item\">Uno</p>\n  <p class=\"item\">Dos</p>\n  <p class=\"item\">Tres</p>\n</div>\n<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst primero = document.querySelector('#panel .item');\nmostrar('Primer item: ' + primero.textContent);\n\ndocument.querySelectorAll('.item').forEach((item, indice) => {\n  mostrar(indice + ': ' + item.textContent);\n});",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "DOM scripting introduction",
      "descripcion": "Guía de MDN sobre querySelector(), querySelectorAll(), getElementById() y getElementsByTagName().",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting",
      "etiqueta": "MDN"
    },
    {
      "titulo": "HTMLCollection",
      "descripcion": "Referencia de MDN confirmando que un HTMLCollection es una colección VIVA, que se actualiza automáticamente al cambiar el DOM.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection",
      "etiqueta": "MDN"
    },
    {
      "titulo": "NodeList",
      "descripcion": "Referencia de MDN confirmando que querySelectorAll() es la única API que devuelve un NodeList ESTÁTICO, a diferencia de la mayoría de NodeLists (vivas).",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/NodeList",
      "etiqueta": "MDN"
    }
  ]
}
```
