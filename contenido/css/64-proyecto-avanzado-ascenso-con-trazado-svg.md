# Proyecto avanzado: ascenso con un trazado SVG que se dibuja solo

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-ascenso-con-un-trazado-svg-que-se-dibuja-solo` (autogenerado del título)
- **Orden:** 325
- **Repositorio:** [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos) (carpeta `ascenso-everest`)
- **Requiere:** El proyecto del descenso (lección 63), `position: sticky` (lección 29) y transiciones (lección 46)

---

## Qué vas a construir

El ascenso al Everest, del Campo Base (5.364 m) a la cumbre (8.849 m). El macizo se queda clavado en pantalla y, según bajas por la página, **la cuerda se va dibujando sola** sobre la montaña, los campamentos se encienden al alcanzarlos y un alpinista sube por la ruta — no por una línea inventada, sino por el trazado real del SVG.

```laboratorio
{
  "tipo": "imagen",
  "src": "https://www.techstudytracker.com/img/7cdc81258e5521e6a32ab333c3efd21615ec2ddb06669dc1339c1e42ebeb4b58.png",
  "alt": "Captura del proyecto terminado: la ruta naranja dibujada hasta 7.459 m sobre la silueta del Everest, con los campamentos C II y C III ya alcanzados y el instrumento marcando 39 % de oxígeno",
  "titulo": "El ascenso, a media subida"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/css-proyectos (carpeta ascenso-everest) — la rama main tiene el HTML, el CSS, los SVG y los datos ya terminados, y tres funciones de JavaScript con la firma y un TODO. La rama solucion tiene la implementación completa."
}
```

### Si es la primera vez que sales del navegador en este curso

- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) trae su propia terminal integrada (menú `Terminal` →
  `New Terminal`), así que no hace falta buscar la del sistema aparte.
- **Node.js**, solo para `npx` (opcional: este proyecto también abre bien
  con doble clic). Versión **LTS** desde [nodejs.org](https://nodejs.org);
  comprueba con `node --version`.
- **El código**, de una de estas dos formas:
  - **Con git**: `git clone https://github.com/pedroleni/css-proyectos.git`
  - **Sin git**: en [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos),
    botón verde **Code** → **Download ZIP**.

### Del cero al proyecto abierto en el navegador

1. **Abre la carpeta en VS Code**: `Archivo` → `Abrir carpeta...`, y elige
   `ascenso-everest/` de dentro de lo que clonaste.
2. **Un único `index.html`** en la barra lateral. Ábrelo — no crees ningún
   archivo nuevo.
3. **Busca los `TODO`** con `Cmd`/`Ctrl` + `F`: te llevan a las tres
   funciones que hay que completar, en el orden de abajo.
4. **Ábrelo en el navegador**, o mejor sírvelo: terminal integrada
   (`` Ctrl+` ``) y `npx serve .` (o `python3 -m http.server 8000`).
5. **El ciclo**: editas, guardas con `Cmd`/`Ctrl` + `S`, y refrescas el
   navegador con `Cmd`/`Ctrl` + `R`.

## La idea: un trazado se puede dibujar como si lo pintara una mano

El truco no es de CSS puro, sino de SVG: cualquier trazo puede convertirse en una línea discontinua con `stroke-dasharray`, y esa línea puede desplazarse con `stroke-dashoffset`. Si el guion es **tan largo como el trazado entero**, mover el desplazamiento hace que el trazo aparezca poco a poco.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres piezas del truco",
  "roles": [
    { "etiqueta": "getTotalLength()", "rol": "Cuánto mide el trazado", "descripcion": "Devuelve la longitud real del path en unidades del SVG. No se estima ni se mide a ojo: la calcula el navegador recorriendo las curvas." },
    { "etiqueta": "stroke-dasharray", "rol": "Un guion del tamaño de todo", "descripcion": "Poniéndolo a 'largo largo' se crea un único trazo tan largo como la ruta, seguido de un hueco igual de largo." },
    { "etiqueta": "stroke-dashoffset", "rol": "Cuánto se ha dibujado", "descripcion": "Desplaza ese guion. Con el desplazamiento a 'largo' la ruta está entera fuera de vista; bajándolo a 0 aparece completa." }
  ]
}
```

## Paso 1: preparar el trazado y colocar los campamentos (`prepararRuta`)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction prepararRuta() {\n  var d = ruta.getAttribute('d');\n  if (!d) return;\n  rutaFantasma.setAttribute('d', d);\n\n  largoRuta = ruta.getTotalLength();\n  ruta.style.strokeDasharray = largoRuta + ' ' + largoRuta;\n  ruta.style.strokeDashoffset = largoRuta;\n\n  grupoCampamentos.textContent = '';\n  for (var i = 0; i < CAMPAMENTOS.length; i++) {\n    var campo = CAMPAMENTOS[i];\n    var punto = ruta.getPointAtLength(fraccionDe(campo.altitud) * largoRuta);\n    // ...crear el círculo y el texto en punto.x / punto.y\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "largoRuta = ruta.getTotalLength();", "nota": "El navegador recorre las curvas del path y devuelve su longitud real. Es el número del que dependen los otros dos pasos: sin él no se sabe cuánto guion hace falta ni dónde cae cada campamento." },
    { "fragmento": "ruta.style.strokeDasharray = largoRuta + ' ' + largoRuta;\n  ruta.style.strokeDashoffset = largoRuta;", "nota": "Un trazo tan largo como toda la ruta, un hueco igual de largo, y el conjunto desplazado justo esa distancia: el resultado es que no se ve nada. Ese es el estado inicial." },
    { "fragmento": "var punto = ruta.getPointAtLength(fraccionDe(campo.altitud) * largoRuta);", "nota": "Aquí está lo bonito: los campamentos no llevan coordenadas escritas a mano. Se sabe a qué altitud está cada uno, esa altitud se convierte en fracción del recorrido, y el propio trazado dice en qué x,y cae. Si mañana cambia el dibujo de la montaña, los campamentos se recolocan solos." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un solo subpath",
  "contenido": "Todo esto solo funciona si el path es un trazo continuo: una sola M al principio y nada más. Con varios subpaths, getTotalLength() suma todos y el guion salta de uno a otro en vez de dibujar una línea seguida."
}
```

## Paso 2: dibujar según el scroll (`dibujarRuta`)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction dibujarRuta(progreso) {\n  if (!largoRuta) return;\n  ruta.style.strokeDashoffset = (largoRuta * (1 - progreso)).toFixed(1);\n}\n</script>",
  "anotaciones": [
    { "fragmento": "(largoRuta * (1 - progreso))", "nota": "Una línea, y es toda la animación. Con progreso 0 el desplazamiento vale largoRuta (nada dibujado); con 1 vale 0 (todo dibujado). Nada de temporizadores ni de @keyframes: el fotograma exacto lo decide dónde está el scroll." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<!-- Una ruta de 640 unidades de largo, con el scroll a mitad -->\nruta.style.strokeDasharray = '640 640';\nruta.style.strokeDashoffset = 320;",
  "opciones": [
    "Se ve la ruta entera, pero con un hueco en medio",
    "Se ve la primera mitad de la ruta, desde el principio",
    "Se ve la segunda mitad de la ruta, desde el final"
  ],
  "correcta": 1,
  "explicacion": "El guion mide 640 (toda la ruta) y está desplazado 320 hacia atrás: los primeros 320 quedan fuera del trazado y los 320 siguientes caen sobre su primera mitad. Por eso se dibuja desde el principio, que es justo el efecto de \"la mano que va pintando\"."
}
```

## Paso 3: mover al alpinista por la ruta real (`situarEscalador`)

El mismo `getPointAtLength()` del paso 1, pero ahora pidiendo un punto que cambia en cada fotograma.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction situarEscalador(progreso) {\n  if (!largoRuta) return;\n  var recorrido = Math.max(0, Math.min(1, progreso));\n  var punto = ruta.getPointAtLength(recorrido * largoRuta);\n  var siguiente = ruta.getPointAtLength(Math.min(largoRuta, recorrido * largoRuta + 4));\n  var mirandoIzquierda = siguiente.x < punto.x;\n\n  escalador.setAttribute(\n    'transform',\n    'translate(' + punto.x.toFixed(1) + ',' + punto.y.toFixed(1) + ')' +\n      (mirandoIzquierda ? ' scale(-1,1)' : '')\n  );\n}\n</script>",
  "anotaciones": [
    { "fragmento": "var siguiente = ruta.getPointAtLength(Math.min(largoRuta, recorrido * largoRuta + 4));", "nota": "Un segundo punto cuatro unidades más adelante. Comparando los dos se sabe hacia dónde avanza la ruta en ese tramo — es la forma más barata de obtener la dirección de una curva sin derivarla." },
    { "fragmento": "(mirandoIzquierda ? ' scale(-1,1)' : '')", "nota": "Solo se voltea, no se rota. Es tentador girar la figura con la pendiente usando ese mismo par de puntos, pero queda tumbada de lado: una persona sube de pie aunque la pared esté a 50 grados. Es un error que se ve enseguida al probarlo." }
  ]
}
```

## El macizo clavado: `position: sticky`

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n.macizo {\n  position: sticky;\n  top: 0;\n  height: 100vh;\n  display: flex;\n  align-items: flex-end;\n  pointer-events: none;\n}\n</style>",
  "anotaciones": [
    { "fragmento": "position: sticky;\n  top: 0;", "nota": "La montaña se comporta como contenido normal hasta que su borde superior toca el de la ventana; a partir de ahí se queda quieta mientras las fichas siguen pasando por delante. Es lo que permite que el dibujo esté siempre visible sin sacarlo del flujo con position: fixed." },
    { "fragmento": "pointer-events: none;", "nota": "El macizo ocupa toda la pantalla: sin esto se tragaría los clics y las selecciones de texto de todo lo que hay debajo." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿La ruta se dibuja de abajo arriba, sin saltos?", "texto": "Si aparece de golpe o va a trompicones, revisa que stroke-dasharray use el largo real y no un número fijo." },
    { "titulo": "¿Los campamentos caen exactamente sobre la línea?", "texto": "Si flotan al lado, no estás usando getPointAtLength: comprueba que la posición sale del trazado y no de coordenadas escritas a mano." },
    { "titulo": "¿El alpinista va de pie?", "texto": "Si se tumba en las partes verticales, estás rotándolo con la pendiente. Solo hay que trasladarlo." },
    { "titulo": "¿Funciona al cambiar el tamaño de la ventana?", "texto": "El SVG escala solo por el viewBox, pero las medidas del scroll no: prepararRuta() y medir() se vuelven a llamar en el resize por ese motivo." }
  ]
}
```

## Retos para ampliarlo

1. Añade un campamento intermedio real (el Balcón, a 8.400 m) y comprueba que aparece en su sitio sin tocar ni una coordenada.
2. Haz que la cuerda ya dibujada cambie de color al entrar en la zona de la muerte, por encima de 8.000 m.
3. Invierte el recorrido: que al volver a subir con el scroll la ruta se **borre** en vez de dibujarse. ¿Qué tienes que cambiar exactamente?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "css-proyectos/ascenso-everest (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo, con los TODO ya puestos.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/main/ascenso-everest",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "css-proyectos/ascenso-everest (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/solucion/ascenso-everest",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "SVGGeometryElement: getPointAtLength()",
      "descripcion": "Referencia de MDN sobre getTotalLength() y getPointAtLength(), las dos APIs que sostienen este proyecto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength",
      "etiqueta": "MDN"
    }
  ]
}
```
