# El árbol DOM y cómo recorrerlo

- **Módulo:** El DOM
- **Slug:** `el-arbol-dom-y-como-recorrerlo` (autogenerado del título)
- **Orden:** 116
- **Fuentes:** [Node (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Node) + [Element (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element) — ver `contenido/javascript/TEMARIO.md` #39

---

## Qué es y para qué sirve

La lección anterior presentó el vocabulario (padre, hijo, hermano). Esta cubre las propiedades REALES para moverse por el árbol desde un nodo cualquiera — y el gotcha más clásico del DOM: casi todas tienen dos versiones, una que incluye texto de formato y otra que solo ve elementos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita moverse por el árbol desde un nodo",
  "roles": [
    { "etiqueta": "Quien sube al padre", "rol": "parentNode / parentElement", "descripcion": "Casi siempre devuelven lo mismo — el nodo (o elemento) que contiene a este." },
    { "etiqueta": "Quien baja a los hijos", "rol": "childNodes / children", "descripcion": "childNodes incluye nodos de texto de formato; children solo cuenta elementos reales." },
    { "etiqueta": "Quien se mueve a un hermano", "rol": "nextSibling / nextElementSibling", "descripcion": "Mismo patrón: la versión con Element se salta el texto de formato entre etiquetas." }
  ]
}
```

## Subir al padre: parentElement

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // HTML: <ul id=\"lista\"><li>Uno</li><li>Dos</li></ul>\n  const lista = document.querySelector('#lista');\n  const primerItem = lista.firstElementChild;\n\n  console.log(primerItem.parentElement === lista); // true\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(primerItem.parentElement === lista); // true", "nota": "parentElement devuelve el ELEMENTO que contiene a este nodo. parentNode hace casi lo mismo — difieren solo en casos raros, como el propio document, cuyo 'padre' conceptual no es un elemento." }
  ]
}
```

## Bajar a los hijos: el gotcha del texto de formato

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // HTML:\n  // <ul id=\"lista\">\n  //   <li>Uno</li>\n  //   <li>Dos</li>\n  // </ul>\n\n  const lista = document.querySelector('#lista');\n\n  console.log(lista.childNodes.length); // 5 — incluye los saltos de línea como nodos de texto\n  console.log(lista.children.length);   // 2 — solo los dos <li>, sin texto\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(lista.childNodes.length); // 5 — incluye los saltos de línea como nodos de texto", "nota": "Entre las etiquetas, cada salto de línea y cada espacio de formato del HTML se convierte en un NODO DE TEXTO real — childNodes los incluye todos: 3 nodos de texto + 2 <li> = 5." },
    { "fragmento": "console.log(lista.children.length);   // 2 — solo los dos <li>, sin texto", "nota": "children se SALTA esos nodos de texto, contando solo elementos reales — 2, uno por cada <li>, sin importar cómo esté indentado el HTML original." }
  ]
}
```

## Primero, último y siguiente: el mismo patrón

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const lista = document.querySelector('#lista');\n\n  console.log(lista.firstChild);        // el nodo de texto del salto de línea, no el primer <li>\n  console.log(lista.firstElementChild); // <li>Uno</li> — el primer ELEMENTO real\n\n  const primero = lista.firstElementChild;\n  console.log(primero.nextSibling);        // el nodo de texto entre los dos <li>\n  console.log(primero.nextElementSibling); // <li>Dos</li> — el siguiente ELEMENTO real\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(lista.firstChild);        // el nodo de texto del salto de línea, no el primer <li>", "nota": "firstChild, igual que childNodes, puede devolver un nodo de texto en vez del elemento esperado si hay espacio en blanco antes del primer hijo real." },
    { "fragmento": "console.log(primero.nextElementSibling); // <li>Dos</li> — el siguiente ELEMENTO real", "nota": "nextElementSibling se salta el nodo de texto entre los dos <li> — el mismo patrón de firstElementChild y children, aplicado a moverse hacia un hermano." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "En la práctica, casi siempre se prefieren las versiones con Element",
  "contenido": "children, firstElementChild, lastElementChild, nextElementSibling y previousElementSibling se saltan los nodos de texto de formato, dejando solo elementos reales con los que trabajar — evitan el gotcha de toparse con un nodo de texto donde se esperaba un elemento."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  // HTML:\n  // <ul id=\"lista\">\n  //   <li>Uno</li>\n  //   <li>Dos</li>\n  // </ul>\n  const lista = document.querySelector('#lista');\n  console.log(lista.childNodes.length);\n  console.log(lista.children.length);\n</script>",
  "opciones": [
    "5 y 2 — childNodes incluye los nodos de texto de los saltos de línea entre etiquetas; children solo cuenta los <li> reales",
    "2 y 2 — ambas propiedades cuentan solo los elementos, ignorando el formato del HTML",
    "5 y 5 — ambas propiedades cuentan absolutamente todos los nodos, incluidos los de texto"
  ],
  "correcta": 0,
  "explicacion": "Entre las etiquetas de <ul> y cada <li>, el navegador crea un nodo de TEXTO por cada salto de línea o espacio de formato. childNodes los incluye todos: 3 nodos de texto + 2 <li> = 5. children se salta esos nodos de texto, contando solo los elementos reales: 2."
}
```

## Lo que estas propiedades NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "childNodes y children devuelven exactamente lo mismo, solo con nombres distintos",
      "realidad": "childNodes incluye nodos de texto (saltos de línea, espacios); children solo cuenta elementos."
    },
    {
      "mito": "firstChild siempre devuelve el primer elemento hijo",
      "realidad": "Puede devolver un nodo de texto si hay espacio en blanco antes del primer elemento — firstElementChild es la alternativa segura."
    },
    {
      "mito": "parentNode y parentElement siempre devuelven exactamente lo mismo",
      "realidad": "Casi siempre coinciden, pero difieren en casos donde el 'padre' conceptual no es un elemento, como document."
    },
    {
      "mito": "Recorrer el DOM con las versiones sin Element en el nombre es más preciso",
      "realidad": "Es justo lo contrario — las versiones con Element evitan toparse con nodos de texto inesperados."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar childNodes/firstChild/nextSibling esperando encontrar solo elementos.", "texto": "Pueden devolver nodos de texto de formato, no siempre el elemento que se busca." },
    { "titulo": "No usar por defecto las versiones con Element (children, firstElementChild, nextElementSibling).", "texto": "Evitan el gotcha de los nodos de texto en la mayoría de los casos reales." },
    { "titulo": "Confundir parentNode con parentElement sin conocer el caso raro donde difieren.", "texto": "Casi siempre son intercambiables, pero no siempre." },
    { "titulo": "Olvidar que el formato del HTML (saltos de línea, indentación) se convierte en nodos de texto reales.", "texto": "Es la causa directa de la diferencia entre childNodes.length y children.length." }
  ]
}
```

## Ejercicios

1. Dado un elemento con varios hijos formateados con saltos de línea, compara `childNodes.length` con `children.length`.
2. Usa `firstChild` y `firstElementChild` sobre el mismo elemento, y explica la diferencia en el resultado.
3. Usa `nextElementSibling` para recorrer todos los elementos hermanos de una lista, sin toparte con nodos de texto.
4. Explica por qué se prefieren las propiedades con "Element" en el nombre al trabajar con elementos del DOM.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Compara childNodes.length con children.length en este elemento (ejercicio 1). Usa firstChild y firstElementChild y observa la diferencia (ejercicio 2). Usa nextElementSibling para recorrer los hermanos (ejercicio 3).",
  "html": "<ul id=\"lista\">\n  <li>Uno</li>\n  <li>Dos</li>\n  <li>Tres</li>\n</ul>\n<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst lista = document.getElementById('lista');\nmostrar('childNodes: ' + lista.childNodes.length);\nmostrar('children: ' + lista.children.length);\nmostrar('firstChild: ' + lista.firstChild.nodeName);\nmostrar('firstElementChild: ' + lista.firstElementChild.nodeName);\n\nlet hermano = lista.firstElementChild;\nwhile (hermano) {\n  mostrar(hermano.textContent);\n  hermano = hermano.nextElementSibling;\n}",
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
      "titulo": "Node",
      "descripcion": "Referencia de MDN sobre parentNode, childNodes, firstChild, lastChild, nextSibling y previousSibling — y por qué childNodes incluye nodos de texto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Node",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element",
      "descripcion": "Referencia de MDN sobre children, firstElementChild, lastElementChild, nextElementSibling, previousElementSibling y parentElement — las versiones que solo ven elementos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element",
      "etiqueta": "MDN"
    }
  ]
}
```
