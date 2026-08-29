# Introducción al scripting del DOM

- **Módulo:** El DOM
- **Slug:** `introduccion-al-scripting-del-dom` (autogenerado del título)
- **Orden:** 113
- **Fuentes:** [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) — ver `contenido/javascript/TEMARIO.md` #38

---

## Qué es y para qué sirve

Abre el módulo del DOM. El **scripting del DOM** es manipular con JavaScript la representación en forma de árbol de un documento HTML ya cargado — así es como una página cambia lo que se ve en pantalla DESPUÉS de haberse renderizado, sin recargar nada.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién representa qué en el navegador",
  "roles": [
    { "etiqueta": "Quien representa la ventana", "rol": "window", "descripcion": "La pestaña del navegador en sí — su tamaño, temporizadores, almacenamiento del lado cliente." },
    { "etiqueta": "Quien representa la página cargada", "rol": "document", "descripcion": "El árbol DOM manipulable — accesible como una propiedad de window, no como un objeto aparte." },
    { "etiqueta": "Quien representa el navegador mismo", "rol": "navigator", "descripcion": "Información sobre el propio navegador — idioma preferido, y otros datos del entorno." }
  ]
}
```

## window, document y navigator: tres objetos distintos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(window.innerWidth);  // el ancho visible de la ventana, en píxeles\n  console.log(document.title);     // el contenido de <title> — parte del DOCUMENTO\n  console.log(navigator.language); // el idioma preferido del navegador, p. ej. 'es-ES'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(window.innerWidth);  // el ancho visible de la ventana, en píxeles", "nota": "window es la ventana o pestaña en sí — sus propiedades hablan del CONTENEDOR (tamaño, scroll, temporizadores), no del contenido cargado dentro." },
    { "fragmento": "console.log(document.title);     // el contenido de <title> — parte del DOCUMENTO", "nota": "document es la página cargada DENTRO de esa ventana — sus propiedades y métodos operan sobre el árbol DOM. Distinguirlo de window evita buscar una propiedad en el objeto equivocado." }
  ]
}
```

## El HTML se convierte en un árbol de nodos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // El HTML cargado:\n  // <section>\n  //   <img src=\"dinosaurio.png\" alt=\"Un T-Rex rojo\" />\n  //   <p>Aquí añadiremos un enlace a la <a href=\"https://www.mozilla.org/\">web de Mozilla</a></p>\n  // </section>\n\n  const enlace = document.querySelector('a');\n  enlace.textContent = 'Red de desarrolladores de Mozilla';\n  enlace.href = 'https://developer.mozilla.org';\n</script>",
  "anotaciones": [
    { "fragmento": "const enlace = document.querySelector('a');", "nota": "document.querySelector('a') encuentra el primer <a> del árbol DOM — su cobertura completa, junto a sus alternativas, llega en la próxima lección. Aquí basta con ver que el árbol es accesible y modificable desde JavaScript." },
    { "fragmento": "enlace.textContent = 'Red de desarrolladores de Mozilla';\n  enlace.href = 'https://developer.mozilla.org';", "nota": "Modificar enlace cambia lo que se ve en pantalla AL INSTANTE — el DOM no es una copia estática del HTML original, es una representación viva." }
  ]
}
```

## El vocabulario de un árbol

| Término | Qué significa |
|---|---|
| Nodo raíz | El nodo superior del árbol — normalmente el elemento `<html>` |
| Nodo hijo | Un nodo situado directamente dentro de otro |
| Nodo descendiente | Un nodo situado en cualquier punto dentro de otro, no necesariamente de forma directa |
| Nodo padre | El nodo que contiene a otro |
| Nodos hermanos | Nodos al mismo nivel, bajo el mismo padre |

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esta es solo una primera vista",
  "contenido": "Recorrer el árbol DOM en profundidad (padres, hijos, hermanos) tiene su propia lección justo a continuación; los distintos métodos de selección (querySelector y compañía) tienen la suya inmediatamente después. Aquí basta con entender la idea general."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log(document === window.document);\n  document.title = 'Nueva página';\n  console.log(window.document.title);\n</script>",
  "opciones": [
    "true y 'Nueva página' — document es, literalmente, una propiedad del objeto window; modificarlo desde cualquiera de las dos referencias afecta al mismo objeto",
    "false y 'Nueva página' — son dos objetos independientes que casualmente muestran el mismo valor",
    "true y el título original — window.document es una copia congelada del document real"
  ],
  "correcta": 0,
  "explicacion": "document no es un objeto aparte — es, literalmente, la propiedad document del objeto global window. document === window.document siempre es true. Modificar document.title también se refleja al leerlo a través de window.document.title, porque ambas expresiones apuntan a la MISMA referencia."
}
```

## Lo que el DOM NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "document y window son dos formas distintas de referirse a lo mismo",
      "realidad": "window es la ventana o pestaña; document es la página cargada dentro, accesible como window.document."
    },
    {
      "mito": "El árbol DOM es una copia estática del HTML original, que no cambia",
      "realidad": "Es una representación VIVA y manipulable — modificarlo con JavaScript cambia lo que se ve en pantalla al instante."
    },
    {
      "mito": "querySelector() es la única forma de acceder a un elemento del DOM",
      "realidad": "Existen varios métodos (getElementById, getElementsByTagName...) — su cobertura completa llega en la próxima lección."
    },
    {
      "mito": "Un nodo descendiente y un nodo hijo son exactamente lo mismo",
      "realidad": "Hijo es directo; descendiente puede estar en cualquier nivel de profundidad dentro de otro."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir propiedades de window (tamaño de la ventana) con propiedades de document (contenido de la página).", "texto": "Cada objeto representa una capa distinta del navegador." },
    { "titulo": "Pensar en el DOM como algo estático, en vez de una representación viva y manipulable.", "texto": "Cualquier cambio hecho con JavaScript se refleja de inmediato en pantalla." },
    { "titulo": "No distinguir nodo hijo (directo) de nodo descendiente (cualquier profundidad).", "texto": "Es un vocabulario que se usará constantemente al recorrer el árbol." },
    { "titulo": "Olvidar que document es, literalmente, una propiedad de window, no un objeto aparte.", "texto": "document === window.document es siempre true." }
  ]
}
```

## Ejercicios

1. Accede a `window.innerWidth`, `document.title` y `navigator.language` en la consola del navegador, y explica qué representa cada uno.
2. Dado un fragmento de HTML sencillo, identifica su nodo raíz y al menos un par de nodos hermanos.
3. Comprueba en la consola que `document === window.document` da `true`.
4. Usa `document.querySelector()` para seleccionar un elemento cualquiera de una página, y modifica su `textContent`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Muestra window.innerWidth, document.title y navigator.language (ejercicio 1, aquí en la salida en vez de la consola). Selecciona un elemento con querySelector() y modifica su textContent (ejercicio 4).",
  "html": "<title>Página de prueba</title>\n<p id=\"saludo\">Texto original</p>\n<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nmostrar('Ancho de ventana: ' + window.innerWidth);\nmostrar('Título: ' + document.title);\nmostrar('Idioma: ' + navigator.language);\nmostrar('document === window.document: ' + (document === window.document));\n\ndocument.querySelector('#saludo').textContent = 'Texto modificado por JS';",
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
      "descripcion": "Guía de MDN sobre qué es el scripting del DOM, los objetos window, document y navigator, y una primera vista del árbol DOM y su vocabulario.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting",
      "etiqueta": "MDN"
    }
  ]
}
```
