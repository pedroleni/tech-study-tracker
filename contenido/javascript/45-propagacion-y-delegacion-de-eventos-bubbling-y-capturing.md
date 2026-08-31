# Propagación y delegación de eventos: bubbling y capturing

- **Módulo:** Eventos
- **Slug:** `propagacion-y-delegacion-de-eventos-bubbling-y-capturing` (autogenerado del título)
- **Orden:** 134
- **Fuentes:** [Event bubbling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) — ver `contenido/javascript/TEMARIO.md` #45

---

## Qué es y para qué sirve

Un clic en un botón no se queda solo en el botón — el evento SUBE por el árbol DOM, disparando también los manejadores de sus contenedores. A eso se le llama bubbling, y es la base de un patrón muy práctico: la delegación de eventos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita entender cómo viaja un evento",
  "roles": [
    { "etiqueta": "Quien sube por el árbol", "rol": "Bubbling (por defecto)", "descripcion": "Del elemento donde ocurrió el evento hacia sus contenedores, uno por uno." },
    { "etiqueta": "Quien corta la subida", "rol": "stopPropagation()", "descripcion": "Evita que el evento siga subiendo más allá de un punto concreto." },
    { "etiqueta": "Quien aprovecha el bubbling", "rol": "Delegación de eventos", "descripcion": "Un único manejador en el contenedor responde a clics en cualquiera de sus hijos, presentes o futuros." }
  ]
}
```

## Bubbling: del elemento hacia sus contenedores

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function manejarClic(evento) {\n    console.log(`Clic en un elemento ${evento.currentTarget.tagName}`);\n  }\n\n  document.body.addEventListener('click', manejarClic);\n  document.querySelector('#contenedor').addEventListener('click', manejarClic);\n  document.querySelector('button').addEventListener('click', manejarClic);\n\n  // Al pulsar el botón, en este orden:\n  // 'Clic en un elemento BUTTON'\n  // 'Clic en un elemento DIV'\n  // 'Clic en un elemento BODY'\n</script>",
  "anotaciones": [
    { "fragmento": "// 'Clic en un elemento BUTTON'\n  // 'Clic en un elemento DIV'\n  // 'Clic en un elemento BODY'", "nota": "El evento SUBE por el árbol, disparando también los manejadores de sus contenedores — del más interno al más externo. Eso es el bubbling: el comportamiento por defecto de la mayoría de eventos." }
  ]
}
```

## target frente a currentTarget

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function manejarClic(evento) {\n    console.log('target:', evento.target.tagName);               // SIEMPRE el elemento original\n    console.log('currentTarget:', evento.currentTarget.tagName);  // el elemento con ESTE manejador\n  }\n\n  document.body.addEventListener('click', manejarClic);\n  document.querySelector('button').addEventListener('click', manejarClic);\n</script>",
  "anotaciones": [
    { "fragmento": "console.log('target:', evento.target.tagName);               // SIEMPRE el elemento original", "nota": "target es el elemento donde el evento se ORIGINÓ de verdad — no cambia durante todo el recorrido del bubbling, sin importar en qué manejador se lea." },
    { "fragmento": "console.log('currentTarget:', evento.currentTarget.tagName);  // el elemento con ESTE manejador", "nota": "currentTarget es el elemento al que ESTE manejador concreto está enganchado — cambia según cuál de los manejadores se esté ejecutando en cada momento." }
  ]
}
```

## stopPropagation(): cortar la subida

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n  const caja = document.querySelector('.caja');\n  const video = document.querySelector('video');\n\n  boton.addEventListener('click', () => caja.classList.remove('oculta'));\n\n  video.addEventListener('click', (evento) => {\n    evento.stopPropagation(); // el clic no sube hasta caja\n    video.play();\n  });\n\n  caja.addEventListener('click', () => caja.classList.add('oculta'));\n</script>",
  "anotaciones": [
    { "fragmento": "evento.stopPropagation(); // el clic no sube hasta caja", "nota": "Sin stopPropagation(), un clic en video subiría hasta caja y dispararía también su manejador (ocultarla) — stopPropagation() corta el bubbling justo ahí, evitando que el evento siga subiendo." }
  ]
}
```

## Capturing: la dirección opuesta

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function manejarClic(evento) {\n    console.log(`Clic en un elemento ${evento.currentTarget.tagName}`);\n  }\n\n  document.body.addEventListener('click', manejarClic, { capture: true });\n  document.querySelector('#contenedor').addEventListener('click', manejarClic, { capture: true });\n  document.querySelector('button').addEventListener('click', manejarClic);\n\n  // Al pulsar el botón, ahora en ORDEN INVERSO:\n  // 'Clic en un elemento BODY'\n  // 'Clic en un elemento DIV'\n  // 'Clic en un elemento BUTTON'\n</script>",
  "anotaciones": [
    { "fragmento": "document.body.addEventListener('click', manejarClic, { capture: true });", "nota": "{ capture: true } invierte la dirección — el evento se procesa primero en los elementos MÁS externos, bajando hacia el más interno. Capturing es poco común en la práctica; bubbling es el comportamiento por defecto y el más usado." }
  ]
}
```

## Delegación de eventos: un manejador para muchos hijos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const contenedor = document.querySelector('#contenedor');\n\n  contenedor.addEventListener('click', (evento) => {\n    evento.target.style.backgroundColor = 'coral';\n  });\n  // Un único manejador responde a clics en CUALQUIER hijo de contenedor,\n  // presente ahora o añadido más adelante\n</script>",
  "anotaciones": [
    { "fragmento": "contenedor.addEventListener('click', (evento) => {\n    evento.target.style.backgroundColor = 'coral';\n  });", "nota": "Gracias al bubbling, un único manejador en el CONTENEDOR puede responder a clics en cualquiera de sus hijos — evento.target identifica cuál de ellos se pulsó de verdad." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Especialmente útil con elementos creados después",
  "contenido": "La delegación de eventos es especialmente valiosa para elementos creados DESPUÉS de registrar el manejador (con createElement()/appendChild(), visto en una lección anterior) — sin ella, cada elemento nuevo necesitaría su propio addEventListener() individual."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const eventos = [];\n  function registrar(nombre) {\n    return () => eventos.push(nombre);\n  }\n\n  document.body.addEventListener('click', registrar('body'));\n  document.querySelector('#contenedor').addEventListener('click', registrar('contenedor'));\n  document.querySelector('button').addEventListener('click', registrar('boton'));\n\n  document.querySelector('button').click();\n  console.log(eventos);\n</script>",
  "opciones": [
    "['boton', 'contenedor', 'body'] — el bubbling dispara primero el manejador del elemento donde ocurrió el evento, y va subiendo hacia sus contenedores",
    "['body', 'contenedor', 'boton'] — los eventos siempre se procesan de fuera hacia dentro",
    "['boton'] — solo se dispara el manejador del elemento exacto donde ocurrió el clic"
  ],
  "correcta": 0,
  "explicacion": "Por defecto (sin { capture: true }), los eventos hacen BUBBLING — se disparan primero en el elemento más interno (boton), y van subiendo por sus contenedores en orden: contenedor, y finalmente body."
}
```

## Lo que bubbling, capturing y delegación NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un evento solo dispara el manejador del elemento exacto donde ocurrió",
      "realidad": "Por defecto sube (bubbling), disparando también los manejadores de sus contenedores."
    },
    {
      "mito": "target y currentTarget son siempre el mismo elemento",
      "realidad": "target es fijo (el origen real); currentTarget cambia según qué manejador se esté ejecutando."
    },
    {
      "mito": "stopPropagation() también cancela el comportamiento por defecto del navegador",
      "realidad": "Eso lo hace preventDefault() (visto en la lección anterior) — son dos mecanismos distintos."
    },
    {
      "mito": "La delegación de eventos necesita un manejador por cada hijo, igual que registrarlos uno a uno",
      "realidad": "Un único manejador en el contenedor basta, gracias al bubbling."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Registrar un manejador individual por cada hijo cuando la delegación resolvería lo mismo con uno solo.", "texto": "Más código, y no cubre automáticamente los hijos añadidos después." },
    { "titulo": "Confundir target (el origen real) con currentTarget (el elemento con el manejador actual).", "texto": "Solo target permanece constante durante todo el bubbling." },
    { "titulo": "Usar stopPropagation() esperando que también cancele el comportamiento por defecto del navegador.", "texto": "Para eso hace falta preventDefault(), un mecanismo distinto." },
    { "titulo": "No aprovechar que la delegación también funciona con elementos añadidos después de registrar el manejador.", "texto": "El manejador vive en el contenedor, no en cada hijo individual." }
  ]
}
```

## Ejercicios

1. Registra manejadores de clic en tres elementos anidados, y observa el orden de ejecución (bubbling).
2. Dentro de un manejador, compara `evento.target` con `evento.currentTarget` en distintos niveles de anidamiento.
3. Usa `stopPropagation()` para evitar que un clic en un elemento interior dispare el manejador de su contenedor.
4. Implementa delegación de eventos: un único manejador en un contenedor que responda a clics en cualquiera de sus hijos.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Registra manejadores de clic en tres elementos anidados y observa el orden (ejercicio 1). Compara evento.target con evento.currentTarget (ejercicio 2). Implementa delegación de eventos (ejercicio 4).",
  "html": "<div id=\"exterior\">Exterior\n  <div id=\"medio\">Medio\n    <button id=\"interior\">Interior</button>\n  </div>\n</div>\n<ul id=\"delegado\"><li>Uno</li><li>Dos</li><li>Tres</li></ul>\n<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\n['exterior', 'medio', 'interior'].forEach((id) => {\n  document.getElementById(id).addEventListener('click', (evento) => {\n    mostrar('Clic burbujeó hasta: ' + id + ' (target real: ' + evento.target.id + ')');\n  });\n});\n\ndocument.getElementById('delegado').addEventListener('click', (evento) => {\n  if (evento.target.tagName === 'LI') {\n    mostrar('Delegación: clic en ' + evento.target.textContent);\n  }\n});",
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
      "titulo": "Event bubbling",
      "descripcion": "Guía de MDN sobre el bubbling, target frente a currentTarget, stopPropagation(), capturing con { capture: true }, y el patrón de delegación de eventos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling",
      "etiqueta": "MDN"
    }
  ]
}
```
