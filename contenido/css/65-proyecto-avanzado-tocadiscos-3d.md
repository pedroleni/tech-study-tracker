# Proyecto avanzado: un tocadiscos en 3D con CSS

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-un-tocadiscos-en-3d-con-css` (autogenerado del título)
- **Orden:** 330
- **Repositorio:** [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos) (carpeta `tocadiscos`)
- **Requiere:** Transformaciones 3D (lección 45), `@keyframes` (lección 47), gradientes (lección 17) y custom properties (lección 22)

---

## Qué vas a construir

Un tocadiscos que gira **de verdad** a 33⅓ o 45 revoluciones por minuto, dibujado entero con CSS: los surcos son un gradiente radial repetido, la etiqueta un gradiente cónico, y el plato está inclinado con una transformación 3D real. Las lecturas del panel no están escritas a mano — salen de la física del disco.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/cad52e2e0dfc4b7150ee9ab4364abba3eb032a0d89ea941667c2c06ec6270d0f.mp4",
  "poster": "https://www.techstudytracker.com/img/2e0d2d0931d7755e11a369bb36c80eebfe21f230a49c13e46fd06e7e875088e7.jpg",
  "descripcion": "El plato arranca a 33⅓ rpm, la aguja recorre la cara entera mientras la velocidad lineal cae de 51 a 21 cm/s, y al final se cambia a 45 rpm.",
  "titulo": "El tocadiscos en marcha"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Este no va con scroll",
  "contenido": "A diferencia de los dos proyectos anteriores de esta serie, aquí la animación no depende de la barra de desplazamiento: va por tiempo (el disco gira solo) y por interacción (los botones y el deslizador). Es el tercer tipo de animación que te vas a encontrar en proyectos reales."
}
```

### Si es la primera vez que sales del navegador en este curso

- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com),
  con su terminal integrada en `Terminal` → `New Terminal`.
- **Node.js** solo si quieres servirlo con `npx`; este proyecto también
  abre bien con doble clic. Versión **LTS** de [nodejs.org](https://nodejs.org).
- **El código**:
  - **Con git**: `git clone https://github.com/pedroleni/css-proyectos.git`
  - **Sin git**: en [github.com/pedroleni/css-proyectos](https://github.com/pedroleni/css-proyectos),
    **Code** → **Download ZIP**.

### Del cero al proyecto abierto en el navegador

1. **Abre la carpeta `tocadiscos/`** en VS Code (`Archivo` → `Abrir carpeta...`).
2. **Un único `index.html`**: ábrelo, no crees nada nuevo.
3. **Busca los `TODO`** con `Cmd`/`Ctrl` + `F`.
4. **Ábrelo en el navegador**, o sírvelo con `npx serve .` desde la terminal
   integrada (`` Ctrl+` ``).
5. **El ciclo**: editar, guardar con `Cmd`/`Ctrl` + `S`, refrescar con
   `Cmd`/`Ctrl` + `R`.

## Un disco dibujado con gradientes, no con imágenes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n.disco {\n  border-radius: 50%;\n  background:\n    repeating-radial-gradient(circle at 50% 50%,\n      rgba(255, 255, 255, .055) 0 1px,\n      rgba(0, 0, 0, 0) 1px 4px),\n    radial-gradient(circle at 50% 50%,\n      #1B1817 0 19%,\n      #12100F 19% 97%,\n      #241F1D 97% 100%);\n  animation: girar var(--vuelta, 1.8s) linear infinite;\n  animation-play-state: var(--marcha, paused);\n}\n\n@keyframes girar { to { transform: rotate(360deg); } }\n</style>",
  "anotaciones": [
    { "fragmento": "repeating-radial-gradient(circle at 50% 50%,\n      rgba(255, 255, 255, .055) 0 1px,\n      rgba(0, 0, 0, 0) 1px 4px),", "nota": "Los surcos: un anillo clarísimo de 1px cada 4px, repetido desde el centro hasta el borde. Miles de circunferencias concéntricas sin una sola imagen ni un solo elemento extra en el DOM." },
    { "fragmento": "animation: girar var(--vuelta, 1.8s) linear infinite;", "nota": "La duración no está escrita a mano: es una variable CSS que el JavaScript calcula a partir de las revoluciones por minuto reales. linear es obligatorio — con cualquier suavizado el disco aceleraría y frenaría en cada vuelta." },
    { "fragmento": "animation-play-state: var(--marcha, paused);", "nota": "Arrancar y parar sin tocar la animación: basta cambiar una variable entre 'running' y 'paused'. La animación conserva su posición, así que el disco reanuda donde se quedó, como uno de verdad." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El reflejo no gira",
  "contenido": "El brillo de la luz sobre el vinilo es un elemento aparte, fuera de .disco. Si estuviera dentro giraría con él y parecería una mancha pintada en el disco, no un reflejo. Los reflejos se quedan donde está la lámpara."
}
```

## Paso 1: la velocidad real (`segundosPorVuelta`)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nfunction segundosPorVuelta(r) {\n  return 60 / r;\n}\n\nfunction aplicarVelocidad() {\n  var vuelta = segundosPorVuelta(rpm);\n  disco.style.setProperty('--vuelta', vuelta.toFixed(3) + 's');\n  elVuelta.textContent = vuelta.toFixed(2).replace('.', ',');\n}\n</script>",
  "anotaciones": [
    { "fragmento": "return 60 / r;", "nota": "Revoluciones POR MINUTO: sesenta segundos entre las vueltas que da en ese minuto. A 33⅓ salen 1,8 s exactos por vuelta; a 45, 1,333. Son los números reales de un tocadiscos, no una velocidad elegida porque quede bien." },
    { "fragmento": "disco.style.setProperty('--vuelta', vuelta.toFixed(3) + 's');", "nota": "El JavaScript no anima nada: solo escribe un número en una variable CSS y deja que el motor de animaciones del navegador haga el trabajo. Cambiar de 33⅓ a 45 es cambiar esa cadena de texto." }
  ]
}
```

## Paso 2: por qué el final de una cara suena peor (`velocidadLineal`)

Este es el paso con más contenido real del proyecto. El disco gira siempre igual, pero **la aguja no va siempre a la misma velocidad**.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nvar RADIO_EXTERIOR = 14.6; // cm, borde de la zona grabada de un LP de 12\"\nvar RADIO_INTERIOR = 6.0;  // cm, junto a la etiqueta\n\nfunction radioEn(progreso) {\n  return RADIO_EXTERIOR - (RADIO_EXTERIOR - RADIO_INTERIOR) * progreso;\n}\n\nfunction velocidadLineal(progreso) {\n  var omega = (rpm * 2 * Math.PI) / 60; // rad/s\n  return omega * radioEn(progreso);     // cm/s\n}\n</script>",
  "anotaciones": [
    { "fragmento": "var omega = (rpm * 2 * Math.PI) / 60; // rad/s", "nota": "La velocidad angular: cuántos radianes barre por segundo. Es constante durante toda la cara, porque el motor no cambia de ritmo." },
    { "fragmento": "return omega * radioEn(progreso);     // cm/s", "nota": "v = ω · r. Como el radio se va reduciendo, la velocidad lineal cae con él: unos 51 cm de surco por segundo en el borde y unos 21 pegado a la etiqueta. La misma música tiene que caber en menos de la mitad de espacio, y por eso los agudos se ensucian al final de la cara. No es una leyenda de audiófilos, es geometría." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "// Un LP girando a 33⅓ rpm.\n// La aguja empieza en el borde (radio 14,6 cm)\n// y termina junto a la etiqueta (radio 6,0 cm).\n\nvelocidadLineal(0);  // ¿?\nvelocidadLineal(1);  // ¿?",
  "opciones": [
    "Las dos dan lo mismo: el disco gira siempre a la misma velocidad",
    "La primera da unos 51 cm/s y la segunda unos 21 cm/s",
    "La primera da unos 21 cm/s y la segunda unos 51 cm/s"
  ],
  "correcta": 1,
  "explicacion": "La velocidad ANGULAR es constante, pero la LINEAL depende del radio. A 33⅓ rpm, ω vale 3,49 rad/s: en el borde, 3,49 × 14,6 ≈ 51 cm/s; junto a la etiqueta, 3,49 × 6,0 ≈ 21 cm/s. Menos de la mitad, para grabar exactamente la misma información."
}
```

## Paso 3: el barrido del brazo (`moverBrazo`)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n.brazo {\n  transform-origin: 85.7% 50%;\n  transform: scaleY(.62) rotate(var(--angulo, 6deg));\n  transition: transform .45s cubic-bezier(.4, 0, .2, 1);\n}\n</style>\n<script>\nvar ANGULO_FUERA = 6;      // aguja en el surco de entrada (radio 14,6 cm)\nvar ANGULO_DENTRO = -23;   // aguja en el surco final (radio 6,0 cm)\n\nfunction moverBrazo(progreso) {\n  var angulo = ANGULO_FUERA + (ANGULO_DENTRO - ANGULO_FUERA) * progreso;\n  brazo.style.setProperty('--angulo', angulo.toFixed(2) + 'deg');\n}\n</script>",
  "anotaciones": [
    { "fragmento": "transform-origin: 85.7% 50%;", "nota": "El brazo no gira por su centro, sino por su pivote — que en el dibujo está al 85,7 % de su ancho. Poner mal este punto es el fallo más habitual: el brazo se mueve como una aguja de reloj en vez de barrer el disco." },
    { "fragmento": "transform: scaleY(.62) rotate(var(--angulo, 6deg));", "nota": "El plato está inclinado 52°, y el coseno de 52° es 0,62: aplastar el brazo en vertical esa misma proporción lo hace encajar en el escorzo del disco. Las transformaciones se aplican de derecha a izquierda, así que primero rota y luego se aplasta el resultado." },
    { "fragmento": "var ANGULO_FUERA = 6;      // aguja en el surco de entrada (radio 14,6 cm)", "nota": "Estos dos ángulos no se eligieron a ojo: se midieron. Se recorrió el brazo grado a grado calculando a qué radio del disco caía la punta de la aguja, y se tomaron los que dan 14,6 cm y 6,0 cm — los radios reales de la zona grabada de un LP." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un aviso sobre el 3D y el orden de pintado",
  "contenido": "En este proyecto el brazo vive FUERA del elemento inclinado, no dentro. Al meterlo dentro de un contenedor con transform-style: preserve-3d, el navegador deja de respetar z-index y decide el orden por profundidad — y el brazo desaparecía detrás del disco. Como aquí todo es un único plano, sale más barato simular el escorzo con scaleY que pelearse con la composición 3D."
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿A 33⅓ tarda 1,80 s en dar una vuelta?", "texto": "Cronométralo con el móvil sobre la etiqueta: diez vueltas deberían ser 18 segundos. Si no cuadra, revisa segundosPorVuelta." },
    { "titulo": "¿Al pasar a 45 rpm acelera de verdad?", "texto": "La vuelta debe bajar a 1,33 s. Si no cambia nada, no estás reescribiendo la variable --vuelta." },
    { "titulo": "¿La velocidad lineal cae al mover la aguja hacia dentro?", "texto": "De unos 51 cm/s a unos 21. Si se queda fija, te falta multiplicar por el radio." },
    { "titulo": "¿La aguja acaba justo en el borde de la etiqueta?", "texto": "Ni pasada ni corta: ahí está el surco final. Si se sale, revisa los dos ángulos extremos." }
  ]
}
```

## Retos para ampliarlo

1. Añade la velocidad de 78 rpm de los discos de pizarra antiguos. ¿Cuánto dura una vuelta? ¿Y cuánto cambia la velocidad lineal en el borde?
2. Haz que al parar el disco no se detenga en seco, sino que frene en un segundo — como un plato real con su inercia. Pista: mira `animation-timing-function` y qué pasa al cambiarla en caliente.
3. Añade un contador de vueltas dadas desde que se puso en marcha, calculado a partir del tiempo y de las rpm, y comprueba que a 33⅓ una cara completa sale alrededor de 733.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "css-proyectos/tocadiscos (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo, con los TODO ya puestos.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/main/tocadiscos",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "css-proyectos/tocadiscos (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/css-proyectos/tree/solucion/tocadiscos",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Using CSS transforms: 3D",
      "descripcion": "Referencia de MDN sobre perspective, transform-style y por qué el orden de pintado cambia dentro de un contexto 3D.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms",
      "etiqueta": "MDN"
    }
  ]
}
```
