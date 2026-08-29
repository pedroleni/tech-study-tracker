# ¿Qué es JavaScript y cómo se conecta a HTML?

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `que-es-javascript-y-como-se-conecta-a-html` (autogenerado del título)
- **Orden:** 2
- **Fuentes:** [What is JavaScript? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript) + [Introduction to JavaScript (web.dev)](https://web.dev/learn/javascript/introduction) — ver `contenido/javascript/TEMARIO.md` #1

---

## Qué es y para qué sirve

Cada vez que una página web hace algo más que quedarse ahí, quieta, mostrando información — un mapa interactivo, un contenido que se actualiza sin recargar, un formulario que valida mientras escribes — hay JavaScript de por medio. Cierra el trío de tecnologías estándar de la web: HTML da estructura, CSS da estilo, JavaScript da comportamiento.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que estructura y estilo",
  "roles": [
    { "etiqueta": "Quien añade comportamiento a una página", "rol": "Reaccionar a lo que hace la persona", "descripcion": "Crear, quitar y cambiar HTML sobre la marcha, responder a clics, validar un formulario mientras se escribe." },
    { "etiqueta": "Quien conecta JS con el HTML", "rol": "Elegir entre script interno o externo", "descripcion": "Un archivo .js aparte, o un bloque directamente en la página — cada uno con su sitio." },
    { "etiqueta": "Quien evita bloquear el HTML", "rol": "Cargar el script sin frenar la página", "descripcion": "Un script mal colocado puede dejar la página en blanco mientras se descarga y ejecuta, antes de que el HTML termine de cargar." }
  ]
}
```

## Las tres capas: estructura, estilo, comportamiento

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "HTML + CSS + JavaScript, cada uno con su trabajo",
  "contenido": "HTML da estructura y significado al contenido (párrafos, encabezados, imágenes). CSS aplica el estilo visual (colores, tipografía, layout). JavaScript añade lo que ninguno de los dos puede: actualizar contenido de forma dinámica, controlar audio y vídeo, animar gráficos, y reaccionar a lo que la persona hace en la página."
}
```

## Script interno: al final del body, no en el head

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<body>\n  <button>Haz clic</button>\n\n  <script>\n    function crearParrafo() {\n      const parrafo = document.createElement('p');\n      parrafo.textContent = 'Has hecho clic';\n      document.body.appendChild(parrafo);\n    }\n\n    const boton = document.querySelector('button');\n    boton.addEventListener('click', crearParrafo);\n  </script>\n</body>",
  "anotaciones": [
    { "fragmento": "<script>\n    function crearParrafo() {", "nota": "Colocar el script justo antes de cerrar </body> garantiza que TODO el HTML de arriba (aquí, el botón) ya existe en la página cuando el script se ejecuta — document.querySelector('button') no encontraría nada si el script fuera lo primero en cargar." }
  ]
}
```

## Script externo: type="module" o defer

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<head>\n  <script type=\"module\" src=\"guion.js\"></script>\n</head>",
  "anotaciones": [
    { "fragmento": "<script type=\"module\" src=\"guion.js\"></script>", "nota": "type=\"module\" permite colocar el script incluso en el head sin bloquear nada — el navegador lo descarga en paralelo y lo ejecuta solo después de terminar de parsear el HTML, igual que hace defer." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "JavaScript directamente en atributos HTML: evitarlo",
  "contenido": "<button onclick=\"crearParrafo()\">Haz clic</button> funciona, pero mezcla HTML y lógica en el mismo sitio, y obliga a repetir el mismo atributo en cada elemento que lo necesite. Un script externo con addEventListener() separa las dos cosas — y solo hace falta escribir la lógica una vez."
}
```

## De dónde viene el nombre (y por qué engaña)

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "LiveScript, Netscape, y una decisión de marketing",
  "contenido": "JavaScript nació en 1995 como LiveScript, en Netscape. El cambio de nombre a JavaScript fue una decisión comercial, para aprovechar la popularidad de Java en ese momento — comparten poco más que el nombre y una sintaxis superficialmente parecida. Netscape envió el trabajo a Ecma International, y de ahí salió el estándar real: ECMAScript (ES5, ES6/ES2015, y una versión nueva cada año desde entonces)."
}
```

## Tipado débil: la coerción de tipos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log('1' + 1); // '11'\n  console.log(1 + 1);   // 2\n  console.log('5' - 3); // 2\n</script>",
  "anotaciones": [
    { "fragmento": "console.log('1' + 1); // '11'", "nota": "+ con una cadena de texto y un número CONCATENA — convierte el número a texto y los pega. JavaScript es de tipado débil: convierte entre tipos automáticamente, sin pedir permiso." },
    { "fragmento": "console.log('5' - 3); // 2", "nota": "Con -, en cambio, JavaScript convierte la cadena a número y RESTA — el mismo tipo de coerción automática, pero con un resultado distinto según el operador." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cada pestaña, su propio entorno aislado",
  "contenido": "El código de una página se ejecuta dentro de un entorno de ejecución — la propia pestaña del navegador, como una fábrica que convierte código en la página que ves. Cada pestaña tiene el suyo, separado: el código de una pestaña no puede afectar directamente al código de otra pestaña abierta."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  console.log('1' + 1);\n  console.log(1 + 1);\n</script>",
  "opciones": [
    "\"11\" y luego 2 — el + con una cadena concatena, con dos números suma",
    "2 las dos veces — JavaScript siempre convierte todo a número antes de operar",
    "Un error, porque no se puede sumar una cadena de texto con un número"
  ],
  "correcta": 0,
  "explicacion": "'1' + 1 concatena (la cadena obliga a + a comportarse como concatenación, convirtiendo el 1 a texto): \"11\". 1 + 1, con dos números, suma con normalidad: 2. El mismo operador, dos comportamientos distintos según los tipos."
}
```

## Lo que JavaScript NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "JavaScript y Java son básicamente el mismo lenguaje",
      "realidad": "Comparten poco más que el nombre (una decisión de marketing de 1995) y una sintaxis superficialmente parecida — nada del modelo de tipos ni del funcionamiento real."
    },
    {
      "mito": "Escribir JavaScript directamente en atributos como onclick es la forma más simple, y por tanto la más recomendable",
      "realidad": "MDN lo desaconseja explícitamente: mezcla HTML y lógica en el mismo sitio, y obliga a repetir el mismo código en cada elemento que lo necesite."
    },
    {
      "mito": "El código de una pestaña del navegador puede afectar directamente al de otra pestaña abierta",
      "realidad": "Cada pestaña tiene su propio entorno de ejecución aislado — el código de una no puede tocar directamente el de otra."
    },
    {
      "mito": "JavaScript es un lenguaje de tipado fuerte, como TypeScript",
      "realidad": "Es de tipado débil — convierte automáticamente entre tipos (coerción), a veces de forma sorprendente, como en '1' + 1."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Colocar <script> al principio del head sin defer ni type=\"module\".", "texto": "Bloquea el parseo del HTML que todavía no ha cargado, dejando la página en blanco mientras tanto." },
    { "titulo": "Confundir JavaScript con Java por el nombre.", "texto": "Son lenguajes completamente distintos, con una historia de marketing detrás del nombre compartido." },
    { "titulo": "Mezclar lógica JS directamente en atributos HTML como onclick.", "texto": "Funciona, pero mezcla dos capas que conviene mantener separadas." },
    { "titulo": "No tener en cuenta la coerción de tipos al operar con valores de tipos distintos.", "texto": "'1' + 1 y 1 + 1 no dan el mismo tipo de resultado, aunque lo parezca a primera vista." }
  ]
}
```

## Ejercicios

1. Escribe un `<script>` externo con `type="module"` que cree un párrafo y lo añada al final del `body`.
2. Explica por qué colocar un `<script>` interno justo antes de `</body>` es más seguro que ponerlo en el `<head>` sin `defer`.
3. Predice el resultado de `"5" + 3` y de `"5" - 3`, y explica la diferencia.
4. Explica en una frase de dónde viene el nombre "JavaScript" y por qué resulta engañoso.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un script que cree un párrafo con createElement y lo añada al final del body (ejercicio 1). Después, en la consola de tu propio navegador (F12), predice y comprueba el resultado de \"5\" + 3 y de \"5\" - 3 (ejercicio 3).",
  "html": "<h1>Página de prueba</h1>",
  "js": "// Ejercicio 1: crea un párrafo y añádelo al body\n\n\n// Ejercicio 3 (compruébalo tú, aquí solo lo mostramos):\nconsole.log('\"5\" + 3 =', \"5\" + 3);\nconsole.log('\"5\" - 3 =', \"5\" - 3);",
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
      "titulo": "What is JavaScript?",
      "descripcion": "Guía de MDN sobre qué es JavaScript, la analogía de las tres capas, y cómo conectarlo a una página con script interno o externo.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Introduction to JavaScript",
      "descripcion": "Introducción de web.dev con el contexto histórico (LiveScript, Netscape, ECMAScript) y el tipado débil como rasgo definitorio del lenguaje.",
      "url": "https://web.dev/learn/javascript/introduction",
      "etiqueta": "web.dev"
    }
  ]
}
```
