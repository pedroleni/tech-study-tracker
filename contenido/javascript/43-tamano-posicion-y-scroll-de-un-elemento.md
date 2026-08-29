# Tamaño, posición y scroll de un elemento

- **Módulo:** El DOM
- **Slug:** `tamano-posicion-y-scroll-de-un-elemento` (autogenerado del título)
- **Orden:** 128
- **Fuentes:** [Element: getBoundingClientRect() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) + [Element: scrollTop (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop) + [Element: scrollIntoView() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) — ver `contenido/javascript/TEMARIO.md` #43

---

## Qué es y para qué sirve

Cierra el módulo del DOM. Saber qué contiene un elemento (visto en las lecciones anteriores) no es lo mismo que saber DÓNDE está en pantalla, cuánto mide realmente, o cuánto se ha desplazado su contenido — tres preguntas con sus propias APIs.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita saber dónde está algo, no solo qué contiene",
  "roles": [
    { "etiqueta": "Quien mide y ubica un elemento", "rol": "getBoundingClientRect()", "descripcion": "Devuelve tamaño y posición reales en pantalla — relativos al viewport, no al documento." },
    { "etiqueta": "Quien lee o mueve el scroll", "rol": "scrollTop", "descripcion": "No es de solo lectura — asignarle un valor desplaza realmente el contenido." },
    { "etiqueta": "Quien desplaza hasta un elemento", "rol": "scrollIntoView()", "descripcion": "Desplaza automáticamente hasta que el elemento sea visible, con animación opcional." }
  ]
}
```

## getBoundingClientRect(): tamaño y posición reales

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const caja = document.querySelector('.caja');\n  const rect = caja.getBoundingClientRect();\n\n  console.log(rect.width);  // ancho, incluido padding y borde\n  console.log(rect.height); // alto, incluido padding y borde\n  console.log(rect.top);    // distancia hasta el borde SUPERIOR del viewport\n  console.log(rect.left);   // distancia hasta el borde IZQUIERDO del viewport\n</script>",
  "anotaciones": [
    { "fragmento": "const rect = caja.getBoundingClientRect();", "nota": "Devuelve un DOMRect con el tamaño y la posición REAL del elemento en pantalla — width y height incluyen padding y borde, no solo el contenido interior." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Relativo al viewport, no al documento",
  "contenido": "top y left son relativos al VIEWPORT (la parte visible de la ventana), no al documento completo — cambian cada vez que la página hace scroll. Para una posición relativa al DOCUMENTO (que no cambia al hacer scroll), hay que sumarles window.scrollY y window.scrollX."
}
```

## scrollTop: no solo se lee, también se asigna

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const contenedor = document.querySelector('#contenedor');\n\n  console.log(contenedor.scrollTop); // píxeles ya desplazados desde arriba\n  contenedor.scrollTop = 100;        // desplaza el contenido de verdad\n</script>",
  "anotaciones": [
    { "fragmento": "contenedor.scrollTop = 100;        // desplaza el contenido de verdad", "nota": "scrollTop NO es de solo lectura — asignarle un valor desplaza realmente el contenido del elemento, sin necesitar ningún método aparte para moverlo." }
  ]
}
```

## Detectar scroll hasta el final

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const contenedor = document.querySelector('#contenedor');\n\n  contenedor.addEventListener('scroll', () => {\n    const llegoAlFinal = contenedor.scrollTop + contenedor.clientHeight >= contenedor.scrollHeight;\n    if (llegoAlFinal) {\n      console.log('¡Llegaste al final!');\n    }\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "const llegoAlFinal = contenedor.scrollTop + contenedor.clientHeight >= contenedor.scrollHeight;", "nota": "scrollHeight es la altura TOTAL del contenido (incluida la parte oculta por overflow); clientHeight es la altura VISIBLE. Cuando scrollTop + clientHeight alcanza scrollHeight, no queda más por desplazar — el patrón clásico para scroll infinito o carga diferida." }
  ]
}
```

## scrollIntoView(): desplazarse hasta un elemento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const objetivo = document.getElementById('seccion-3');\n  objetivo.scrollIntoView({ behavior: 'smooth' });\n</script>",
  "anotaciones": [
    { "fragmento": "objetivo.scrollIntoView({ behavior: 'smooth' });", "nota": "scrollIntoView() desplaza automáticamente hasta que el elemento sea visible — behavior: 'smooth' anima el desplazamiento, en vez de saltar de golpe. Por defecto, alinea su borde superior con el principio de la zona visible." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const contenedor = { scrollTop: 300, clientHeight: 150, scrollHeight: 450 };\n  const llegoAlFinal = contenedor.scrollTop + contenedor.clientHeight >= contenedor.scrollHeight;\n  console.log(llegoAlFinal);\n</script>",
  "opciones": [
    "true — 300 + 150 es exactamente igual a 450, así que ya no queda contenido por desplazar",
    "false — todavía falta contenido por desplazar, porque scrollTop por sí solo no llegó a scrollHeight",
    "true, pero solo porque scrollHeight incluye el padding del contenedor"
  ],
  "correcta": 0,
  "explicacion": "scrollTop (lo ya desplazado) más clientHeight (lo visible) da el punto hasta donde se 've' contenido: 300 + 150 = 450. Como scrollHeight (el total) también es 450, no queda nada más por desplazar — se ha llegado exactamente al final."
}
```

## Lo que estas propiedades NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "getBoundingClientRect() devuelve una posición fija respecto al documento",
      "realidad": "Es relativa al VIEWPORT — cambia cada vez que la página hace scroll."
    },
    {
      "mito": "scrollTop es una propiedad de solo lectura, solo sirve para consultar la posición",
      "realidad": "Asignarle un valor DESPLAZA realmente el contenido del elemento."
    },
    {
      "mito": "scrollHeight es la altura visible de un elemento",
      "realidad": "Es la altura TOTAL del contenido, incluida la parte oculta por overflow — clientHeight es la visible."
    },
    {
      "mito": "scrollIntoView() solo funciona con un salto instantáneo, sin animación",
      "realidad": "Con { behavior: 'smooth' } anima el desplazamiento en vez de saltar de golpe."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar top/left de getBoundingClientRect() esperando que no cambien al hacer scroll.", "texto": "Son relativos al viewport, no al documento — sumar window.scrollY/scrollX da la posición absoluta." },
    { "titulo": "Buscar un método aparte para mover el scroll, en vez de asignar directamente a scrollTop.", "texto": "scrollTop admite asignación directa, sin necesitar nada más." },
    { "titulo": "Confundir scrollHeight (total) con clientHeight (visible).", "texto": "Son la base de la fórmula para detectar scroll hasta el final." },
    { "titulo": "No usar { behavior: 'smooth' } cuando se quiere una transición animada.", "texto": "Sin esa opción, scrollIntoView() salta de golpe, sin animación." }
  ]
}
```

## Ejercicios

1. Usa `getBoundingClientRect()` sobre un elemento, y observa cómo cambian `top` y `left` al hacer scroll en la página.
2. Asigna un valor a `scrollTop` de un contenedor con overflow, y comprueba que su contenido se desplaza.
3. Implementa la detección de "scroll hasta el final" comparando `scrollTop + clientHeight` con `scrollHeight`.
4. Usa `scrollIntoView({ behavior: 'smooth' })` para desplazarte suavemente hasta un elemento concreto de la página.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Usa getBoundingClientRect() sobre este elemento (ejercicio 1). Asigna un valor a scrollTop de un contenedor con overflow (ejercicio 2). Implementa la detección de scroll hasta el final (ejercicio 3).",
  "html": "<div id=\"contenedor\" style=\"height: 100px; overflow-y: auto; border: 1px solid #999;\">\n  <div style=\"height: 400px; padding: 8px;\">Contenido largo para hacer scroll</div>\n</div>\n<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst contenedor = document.getElementById('contenedor');\nmostrar(contenedor.getBoundingClientRect());\n\ncontenedor.addEventListener('scroll', () => {\n  const alFinal = contenedor.scrollTop + contenedor.clientHeight >= contenedor.scrollHeight - 1;\n  if (alFinal) mostrar('¡Llegaste al final!');\n});\n\n// contenedor.scrollTop = 100; // prueba a descomentar esto",
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
      "titulo": "Element: getBoundingClientRect()",
      "descripcion": "Referencia de MDN sobre el DOMRect devuelto (width, height, top, left...) y por qué sus coordenadas son relativas al viewport.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: scrollTop",
      "descripcion": "Referencia de MDN sobre scrollTop (lectura y asignación), scrollHeight, y el patrón para detectar scroll hasta el final.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: scrollIntoView()",
      "descripcion": "Referencia de MDN sobre scrollIntoView() y su opción { behavior: 'smooth' } para animar el desplazamiento.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView",
      "etiqueta": "MDN"
    }
  ]
}
```
