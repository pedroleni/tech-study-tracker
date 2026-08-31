# Arrastrar y soltar: la API Drag and Drop

- **Módulo:** APIs del navegador
- **Slug:** `arrastrar-y-soltar-la-api-drag-and-drop` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [HTML Drag and Drop API (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) — ver `contenido/javascript/TEMARIO.md` #67

---

## Qué es y para qué sirve

Arrastrar un elemento y soltarlo en otro sitio implica una secuencia de eventos concreta — con un paso obligatorio y fácil de olvidar: sin cancelar `dragover`, ningún elemento puede recibir nada, nunca.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita arrastrar y soltar algo",
  "roles": [
    { "etiqueta": "Quien inicia el arrastre", "rol": "dragstart + setData()", "descripcion": "El único momento en el que se pueden escribir los datos que viajarán con el arrastre." },
    { "etiqueta": "Quien habilita el destino", "rol": "dragover + preventDefault()", "descripcion": "Obligatorio — sin cancelar este evento, ese elemento nunca puede recibir un drop." },
    { "etiqueta": "Quien recibe lo soltado", "rol": "drop + getData()", "descripcion": "El único momento en el que se pueden leer los datos guardados al empezar el arrastre." }
  ]
}
```

## draggable="true": no todo es arrastrable por defecto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p id=\"elemento\" draggable=\"true\">Este elemento se puede arrastrar.</p>",
  "anotaciones": [
    { "fragmento": "draggable=\"true\"", "nota": "Obligatorio en la mayoría de elementos — imágenes, enlaces y selecciones de texto son arrastrables por defecto, pero cualquier otro elemento (como un <p>) necesita este atributo explícito." }
  ]
}
```

## dragstart: el único momento para escribir datos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function alEmpezarArrastre(evento) {\n    evento.dataTransfer.setData('text/plain', evento.target.innerText);\n  }\n\n  document.getElementById('elemento').addEventListener('dragstart', alEmpezarArrastre);\n</script>",
  "anotaciones": [
    { "fragmento": "evento.dataTransfer.setData('text/plain', evento.target.innerText);", "nota": "setData(tipo, valor) guarda la información que viajará con el arrastre — dataTransfer es el objeto donde se transporta esa información entre el elemento de origen y el destino." }
  ]
}
```

## dragover: el paso obligatorio para poder recibir algo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const zona = document.getElementById('zona-destino');\n\n  zona.addEventListener('dragover', (evento) => {\n    evento.preventDefault(); // sin esto, drop NUNCA se dispara\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "evento.preventDefault(); // sin esto, drop NUNCA se dispara", "nota": "preventDefault() en dragover es OBLIGATORIO para que ese elemento pueda recibir un drop — por defecto, el navegador rechaza soltar cosas en cualquier elemento, y dragover es donde se cancela ese comportamiento." }
  ]
}
```

## drop: el único momento para leer los datos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  zona.addEventListener('drop', (evento) => {\n    evento.preventDefault();\n    const datos = evento.dataTransfer.getData('text/plain');\n    evento.target.append(datos);\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "const datos = evento.dataTransfer.getData('text/plain');", "nota": "getData(tipo) recupera lo que se guardó con setData() en dragstart — el mismo tipo MIME usado al escribir debe usarse al leer." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Escribir solo en dragstart, leer solo en drop",
  "contenido": "Los datos SOLO pueden escribirse en el manejador de dragstart, y SOLO pueden leerse en el de drop — intentar leerlos en dragover, por ejemplo, no funciona igual."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Siete eventos cubren todo el ciclo",
  "contenido": "dragstart (empieza el arrastre), drag (mientras se arrastra), dragenter/dragleave (entra o sale de un posible destino), dragover (mientras está encima de un destino), drop (se suelta), dragend (termina el arrastre, se soltara donde se soltara)."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const zona = document.getElementById('zona-destino');\n  let seSolto = false;\n\n  // zona.addEventListener('dragover', (evento) => evento.preventDefault()); // comentado a propósito\n\n  zona.addEventListener('drop', () => {\n    seSolto = true;\n  });\n\n  // El usuario arrastra un elemento y lo suelta sobre 'zona'\n  console.log(seSolto);\n</script>",
  "opciones": [
    "false — sin preventDefault() en dragover, el navegador rechaza el drop por defecto, así que el evento drop nunca llega a dispararse",
    "true — drop se dispara siempre que se suelte algo encima del elemento, sin importar dragover",
    "Un error, porque falta el manejador de dragover"
  ],
  "correcta": 0,
  "explicacion": "Sin cancelar dragover con preventDefault(), el navegador aplica su comportamiento POR DEFECTO — rechazar el elemento soltado — y el evento drop nunca llega a dispararse sobre esa zona. seSolto se queda en false."
}
```

## Lo que Drag and Drop NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Cualquier elemento es arrastrable por defecto, sin necesitar draggable=\"true\"",
      "realidad": "Solo imágenes, enlaces y selecciones de texto lo son por defecto — el resto necesita el atributo explícito."
    },
    {
      "mito": "Los datos del arrastre se pueden leer en cualquier momento del proceso",
      "realidad": "Solo pueden leerse en el manejador de drop, y solo escribirse en dragstart."
    },
    {
      "mito": "Cualquier elemento puede recibir un drop sin configuración adicional",
      "realidad": "Hace falta cancelar dragover con preventDefault() para habilitarlo."
    },
    {
      "mito": "drop se dispara automáticamente al soltar algo encima de un elemento",
      "realidad": "Solo si ese elemento canceló antes el comportamiento por defecto de dragover."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar draggable=\"true\" en un elemento que no es imagen, enlace ni texto seleccionado.", "texto": "Sin él, ese elemento simplemente no se puede arrastrar." },
    { "titulo": "No cancelar dragover con preventDefault().", "texto": "Impide que drop se dispare nunca sobre ese elemento." },
    { "titulo": "Intentar leer los datos del arrastre fuera del manejador de drop.", "texto": "Solo están disponibles para lectura ahí." },
    { "titulo": "Usar un tipo MIME distinto en getData() del que se usó en setData().", "texto": "Debe coincidir exactamente para recuperar el dato correcto." }
  ]
}
```

## Ejercicios

1. Haz arrastrable un elemento con `draggable="true"`, y guarda datos con `setData()` en su `dragstart`.
2. Convierte otro elemento en zona de destino, cancelando `dragover` con `preventDefault()`.
3. Lee los datos arrastrados con `getData()` en el manejador de `drop`, y muéstralos en pantalla.
4. Explica por qué `preventDefault()` en `dragover` es obligatorio para que `drop` llegue a dispararse.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Haz arrastrable un elemento con draggable=\"true\" y guarda datos con setData() en dragstart (ejercicio 1). Convierte otro en zona de destino cancelando dragover con preventDefault() (ejercicio 2). Lee los datos con getData() en drop (ejercicio 3).",
  "html": "<div id=\"origen\" draggable=\"true\">Arrástrame</div>\n<div id=\"destino\">Suéltame aquí</div>\n<pre id=\"salida\"></pre>",
  "css": "#origen { padding: 12px; background: #7c3aed; color: white; width: fit-content; cursor: grab; }\n#destino { margin-top: 12px; padding: 20px; border: 2px dashed #999; }",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\ndocument.getElementById('origen').addEventListener('dragstart', (evento) => {\n  evento.dataTransfer.setData('text/plain', 'Contenido arrastrado');\n});\n\nconst destino = document.getElementById('destino');\ndestino.addEventListener('dragover', (evento) => evento.preventDefault());\ndestino.addEventListener('drop', (evento) => {\n  evento.preventDefault();\n  mostrar('Datos soltados: ' + evento.dataTransfer.getData('text/plain'));\n});",
  "pestañaInicial": "html"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTML Drag and Drop API",
      "descripcion": "Referencia de MDN sobre draggable, los siete eventos del ciclo de arrastre, dataTransfer (setData/getData), y por qué dragover debe cancelarse para habilitar drop.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API",
      "etiqueta": "MDN"
    }
  ]
}
```
