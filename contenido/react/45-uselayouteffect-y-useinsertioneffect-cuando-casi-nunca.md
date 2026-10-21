# `useLayoutEffect` y `useInsertionEffect`: cuándo (casi nunca)

- **Módulo:** Efectos
- **Slug:** `uselayouteffect-y-useinsertioneffect-cuando-casi-nunca` (autogenerado del título)
- **Orden:** 450
- **Fuentes:** [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) + [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect) — ver `contenido/react/TEMARIO.md` #45

---

## Qué es y para qué sirve

En la lección 38 aprendiste a sincronizar un componente con algo de fuera con `useEffect`, y en la 40, su ciclo de vida. React tiene otros dos efectos con **la misma forma** (una función, una limpieza opcional y un array de dependencias) que solo cambian en **cuándo** se ejecutan:

- `useLayoutEffect` se ejecuta **después de que React cambie el DOM y antes de que el navegador pinte** la pantalla. Sirve para una cosa: medir lo que acaba de aparecer y recolocarlo sin que el usuario llegue a ver el paso intermedio.
- `useInsertionEffect` se ejecuta **antes todavía**, antes que cualquier efecto de layout. Existe para que las librerías de CSS-in-JS metan sus etiquetas `<style>` a tiempo.

El ejemplo de siempre es un bocadillo de ayuda. Para decidir si cabe encima de una palabra o hay que ponerlo debajo necesitas saber cuánto mide, y eso no se sabe hasta que está en el DOM con su texto y su CSS. Así que hay que pintarlo en algún sitio provisional, medirlo y moverlo. **La pregunta de esta lección es si el usuario llega a ver ese sitio provisional.**

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres efectos que se escriben igual",
  "roles": [
    {
      "etiqueta": "useEffect",
      "rol": "El de siempre (lección 38)",
      "descripcion": "Se ejecuta después del commit y, normalmente, después de que el navegador pinte. No retrasa nada de lo que ve el usuario. Es el que usarás casi siempre."
    },
    {
      "etiqueta": "useLayoutEffect",
      "rol": "Medir antes de pintar",
      "descripcion": "Se ejecuta cuando el DOM ya está al día y antes de pintar. Puedes medir y recolocar sin que se vea el paso intermedio, a cambio de retrasar el pintado."
    },
    {
      "etiqueta": "useInsertionEffect",
      "rol": "Solo para librerías de CSS-in-JS",
      "descripcion": "Se ejecuta antes que todos los efectos de layout, mientras React cambia el DOM. Sirve para meter etiquetas style. No ve las refs y no puede cambiar el estado."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Casi nunca: empieza siempre por useEffect",
  "contenido": "La documentación de React avisa de que useLayoutEffect puede perjudicar el rendimiento y pide usar useEffect siempre que se pueda. Y de useInsertionEffect dice que es para quien escribe librerías de CSS-in-JS: si no es tu caso, no lo necesitas. Esta lección sirve para reconocerlos cuando los leas y para el caso raro en que de verdad hacen falta."
}
```

## Un commit por dentro: quién va antes

Recuerda los pasos de la lección 17: render, commit y, al final, el navegador pinta. Los tres efectos se reparten así alrededor de ese último paso:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Del render al useEffect",
  "items": [
    {
      "fecha": "1",
      "titulo": "Render",
      "texto": "React llama a tus componentes y calcula qué debe verse. La página todavía no ha cambiado."
    },
    {
      "fecha": "2",
      "titulo": "Cambios en el DOM y useInsertionEffect",
      "texto": "React aplica los cambios al DOM y, mientras lo hace, ejecuta los useInsertionEffect. Las refs de los nodos nuevos todavía están vacías."
    },
    {
      "fecha": "3",
      "titulo": "Refs y useLayoutEffect",
      "texto": "React rellena las refs y ejecuta los useLayoutEffect, primero los de los hijos y después los de los padres. El DOM ya está al día: se puede medir. Si uno llama a un set, React hace otro render y otro commit en el acto."
    },
    {
      "fecha": "4",
      "titulo": "El navegador pinta",
      "texto": "Calcula estilos y posiciones y dibuja la pantalla. Es lo primero que ve el usuario de este commit."
    },
    {
      "fecha": "5",
      "titulo": "useEffect",
      "texto": "React ejecuta los useEffect, también hijos antes que padres. Normalmente después de pintar; tras un clic, React puede adelantarlos, pero los cambios de estado que hagan dentro pueden esperar al siguiente fotograma."
    }
  ]
}
```

Compruébalo en el registro de efectos que conoces desde la lección 38. Ahora cada línea lleva entre paréntesis la clase de efecto, «(useLayoutEffect)» o «(useInsertionEffect)»; los de `useEffect` no llevan nada. En esta almazara, `Rotulo` tiene los tres efectos y `App`, uno de layout y uno normal.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los tres efectos en un mismo commit",
  "consigna": "Lee el commit 1 del registro de efectos: el montaje y, debajo, la repetición de StrictMode. Pulsa «Siguiente lote» y lee el commit 2 de arriba abajo. Después mira en la consola qué vale ref.current en cada momento.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react'\n\nfunction Rotulo({ lote }) {\n  const ref = useRef(null)\n\n  useInsertionEffect(() => {\n    console.log('Rotulo, inserción: ref.current ' + (ref.current ? 'ya es el <p>' : 'vale null'))\n  }, [lote])\n\n  useLayoutEffect(() => {\n    console.log('Rotulo, layout: ref.current ' + (ref.current ? 'ya es el <p>' : 'vale null'))\n    return () => console.log('Rotulo, limpieza del layout')\n  }, [lote])\n\n  useEffect(() => {\n    console.log('Rotulo, efecto normal')\n    return () => console.log('Rotulo, limpieza del efecto normal')\n  }, [lote])\n\n  return <p ref={ref}>Lote {lote} · virgen extra · cosecha temprana</p>\n}\n\nexport default function App() {\n  const [lote, setLote] = useState(14)\n\n  useLayoutEffect(() => {\n    console.log('App, layout')\n  }, [lote])\n\n  useEffect(() => {\n    console.log('App, efecto normal')\n  }, [lote])\n\n  return (\n    <main>\n      <h1>Almazara El Olivar</h1>\n      <Rotulo lote={lote} />\n      <button onClick={() => setLote(lote + 1)}>Siguiente lote</button>\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Al cargar, el commit 1 empieza así:

```text
Rotulo ▶ efecto (useInsertionEffect) · montaje
Rotulo ▶ efecto (useLayoutEffect) · montaje
App ▶ efecto (useLayoutEffect) · montaje
Rotulo ▶ efecto · montaje
App ▶ efecto · montaje
```

**Primero todos los de inserción, después todos los de layout y al final todos los normales**, y dentro de cada tanda, el hijo antes que el padre. El orden en que los escribes dentro del componente no cambia nada (aunque pusieras el `useEffect` el primero, saldría el último): lo que manda es la clase de efecto.

Debajo viene el ensayo de `StrictMode` (lección 63): limpieza y otra vez efecto, «▶ efecto (useLayoutEffect) · repetido por StrictMode». **Los efectos de layout también se repiten; el de inserción, no**: busca en el registro y no encontrarás ningún «(useInsertionEffect) · repetido por StrictMode».

Al pulsar «Siguiente lote», el commit 2 sigue la regla de las lecciones 38 y 40 (primero se limpia lo viejo y después empieza lo nuevo), ahora por clases: el de inserción cambia de lote; después, la limpieza del layout de `Rotulo` y los efectos de layout con el lote nuevo; y al final, la limpieza del efecto normal y los efectos normales.

```text
Rotulo ▶ efecto (useInsertionEffect) · cambió lote: 14 → 15
Rotulo ⟲ limpieza (useLayoutEffect)
Rotulo ▶ efecto (useLayoutEffect) · cambió lote: 14 → 15
App ▶ efecto (useLayoutEffect) · cambió lote: 14 → 15
Rotulo ⟲ limpieza
Rotulo ▶ efecto · cambió lote: 14 → 15
App ▶ efecto · cambió lote: 14 → 15
```

La consola añade un detalle: en el primer `useInsertionEffect`, **`ref.current` vale `null`**; en el de layout ya es el `<p>`. Y fíjate en dónde caen las rayas «commit 1» y «commit 2» de la consola: los mensajes de inserción y de layout salen **antes** de la raya, y los normales, después. La vista previa traza la raya cuando React da el commit por terminado, y los efectos de layout forman parte de él: React no lo cierra hasta ejecutarlos. Para saber a qué commit pertenece cada efecto, el registro de efectos es la referencia.

## El caso de verdad: colocar un bocadillo antes de que se vea

La almazara quiere explicar en su ficha los términos de cata. Al pulsar una palabra sale un bocadillo con la definición: **encima** de la palabra si cabe, **debajo** si no hay sitio hasta el borde de arriba.

En el render no puedes saberlo. En el primero, la ref vale `null` (lección 34), y aunque tuvieras el nodo, lo que mide depende del texto, del ancho y del CSS, que solo existen en la página. Así que el bocadillo necesita **dos pasadas**: aparece en un sitio provisional, se mide y se coloca. Si eso ocurre en un `useLayoutEffect`, las dos pasadas terminan antes de que el navegador pinte, y el usuario solo ve la segunda.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un bocadillo que se coloca solo",
  "codigo": "import { useLayoutEffect, useRef, useState } from 'react'\n\nfunction Bocadillo({ children }) {\n  const ref = useRef(null)\n  const [lado, setLado] = useState('sin-medir')\n\n  useLayoutEffect(() => {\n    const bocadillo = ref.current.getBoundingClientRect()\n    const termino = ref.current.parentElement.getBoundingClientRect()\n    // ¿Cabe entre la palabra y el borde de arriba? 8 px de separación\n    setLado(bocadillo.height + 8 < termino.top ? 'arriba' : 'abajo')\n  }, [])\n\n  return (\n    <span ref={ref} className={'bocadillo ' + lado}>\n      {children}\n    </span>\n  )\n}\n\nfunction Termino({ nombre, children }) {\n  const [abierto, setAbierto] = useState(false)\n  return (\n    <span className=\"termino\">\n      <button aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>\n        {nombre}\n      </button>\n      {abierto && <Bocadillo>{children}</Bocadillo>}\n    </span>\n  )\n}\n\nexport default function App() {\n  return (\n    <main className=\"ficha\">\n      <h1>Almazara El Olivar</h1>\n      <p>\n        Picual de cosecha temprana. En nariz es muy{' '}\n        <Termino nombre=\"frutado\">\n          Recuerda a la aceituna fresca, sana y recogida en su punto.\n        </Termino>\n        , con notas de tomatera.\n      </p>\n      <p>Lote 14 · molturado el 3 de noviembre · 0,2° de acidez.</p>\n      <p>\n        En boca entra dulce, con un{' '}\n        <Termino nombre=\"amargo\">\n          Típico de la aceituna verde. En su justa medida es una virtud.\n        </Termino>{' '}\n        suave y un final{' '}\n        <Termino nombre=\"picante\">\n          Picor en la garganta al tragar. Delata un aceite rico en polifenoles.\n        </Termino>{' '}\n        que se queda.\n      </p>\n    </main>\n  )\n}",
  "css": ".ficha {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n  line-height: 1.6;\n}\n\n.ficha h1 {\n  margin-top: 0;\n  font-size: 1.4rem;\n}\n\n.termino {\n  position: relative;\n}\n\n.termino button {\n  font: inherit;\n  padding: 0 0.2rem;\n  border: 0;\n  border-bottom: 2px dotted #4d7c0f;\n  background: #f7fee7;\n  color: #365314;\n  cursor: help;\n}\n\n.bocadillo {\n  position: absolute;\n  left: 0;\n  z-index: 1;\n  width: 12rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #1c1917;\n  color: #fafaf9;\n  font-size: 0.9rem;\n  line-height: 1.4;\n  pointer-events: none;\n}\n\n/* Antes de medir: encima de la palabra y en rojo, para que se note si llega a pintarse */\n.bocadillo.sin-medir {\n  top: 0;\n  background: #b91c1c;\n}\n\n.bocadillo.arriba {\n  bottom: calc(100% + 8px);\n}\n\n.bocadillo.abajo {\n  top: calc(100% + 8px);\n}\n",
  "anotaciones": [
    {
      "fragmento": "useState('sin-medir')",
      "nota": "Al montarse, el bocadillo todavía no sabe dónde va. El primer render lo deja en un sitio provisional: encima de la palabra y en rojo, para que se note si alguna vez llega a pintarse."
    },
    {
      "fragmento": "useLayoutEffect(() => {",
      "nota": "Se ejecuta en el commit, con el bocadillo ya en el DOM y la ref apuntando a él, pero antes de que el navegador pinte. Mismo formato que useEffect: función, limpieza opcional y dependencias."
    },
    {
      "fragmento": "ref.current.getBoundingClientRect()",
      "nota": "El tamaño real del bocadillo con su texto, su ancho y su CSS. Es la misma medida de la lección 34; lo nuevo es el momento en que se toma."
    },
    {
      "fragmento": "ref.current.parentElement.getBoundingClientRect()",
      "nota": "La caja de la palabra. Su top es la distancia hasta el borde de arriba de la vista previa: el sitio que queda libre encima."
    },
    {
      "fragmento": "setLado(bocadillo.height + 8 < termino.top ? 'arriba' : 'abajo')",
      "nota": "Un set dentro de un efecto de layout. React hace el segundo render y el segundo commit en el acto, antes de pintar: el usuario solo ve el bocadillo ya colocado."
    },
    {
      "fragmento": "}, [])",
      "nota": "Se mide al montar. Cada vez que abres el bocadillo se monta uno nuevo, así que vuelve a medirse en su sitio de ese momento."
    },
    {
      "fragmento": "{abierto && <Bocadillo>{children}</Bocadillo>}",
      "nota": "Al cerrar se desmonta. El bocadillo no tiene que vigilar nada mientras está cerrado."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true
}
```

Pulsa «frutado» y después «picante». Lo normal es que el primero salga **debajo**, porque entre la palabra y el borde de arriba solo está el título, y el segundo, **encima**. Si la vista previa es estrecha, las líneas cambian y puede que no: se mide lo que hay de verdad. Lo que no verás nunca es el bocadillo rojo. Paso a paso, al pulsar:

1. `Bocadillo` se renderiza con `lado = 'sin-medir'`.
2. React lo mete en el DOM en ese sitio provisional y ejecuta el `useLayoutEffect`.
3. El efecto mide y llama a `setLado`: React vuelve a renderizar `Bocadillo` en el acto.
4. React hace el segundo commit con el bocadillo en su sitio.
5. Solo entonces el navegador pinta.

El registro de efectos apunta el paso 2: «Bocadillo ▶ efecto (useLayoutEffect) · montaje», más su repetición de `StrictMode`, en el mismo commit en que aparece el bocadillo.

## Con `useEffect`, el sitio provisional puede llegar a pintarse

¿Y si mides en un `useEffect`? La documentación de React lo explica en las advertencias de `useEffect`: incluso cuando el efecto lo provoca un clic, **React puede dejar que el navegador pinte antes de procesar los cambios de estado que haga el efecto**. Si eso pasa, durante un fotograma la pantalla enseña el bocadillo en su sitio provisional: es el parpadeo, el bocadillo que «salta».

Es tan rápido que a simple vista casi nunca se nota, así que este bloque trae una cámara lenta. Es el mismo bocadillo con dos añadidos: `fotogramas.jsx` apunta en la consola, justo antes de cada uno de los cinco primeros fotogramas que pinta el navegador, dónde estaba el bocadillo; y `RETARDO_MS` hace que cada render tarde lo que tú digas, como un componente pesado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La cámara lenta: ¿llega a pintarse el sitio provisional?",
  "consigna": "Pulsa «picante» y lee la consola: ningún fotograma dice sin-medir. En Bocadillo.jsx cambia useLayoutEffect por useEffect en el efecto que mide y vuelve a pulsar «picante». Después pon RETARDO_MS a 150 y prueba las dos versiones otra vez, mirando la vista previa.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport Bocadillo from './Bocadillo'\nimport { grabarFotogramas } from './fotogramas'\nimport './estilos.css'\n\nfunction Termino({ nombre, children }) {\n  const [abierto, setAbierto] = useState(false)\n  const terminoRef = useRef(null)\n\n  function manejarClic() {\n    if (!abierto) grabarFotogramas(terminoRef)\n    setAbierto(!abierto)\n  }\n\n  return (\n    <span ref={terminoRef} className=\"termino\">\n      <button aria-expanded={abierto} onClick={manejarClic}>\n        {nombre}\n      </button>\n      {abierto && <Bocadillo>{children}</Bocadillo>}\n    </span>\n  )\n}\n\nexport default function App() {\n  return (\n    <main className=\"ficha\">\n      <h1>Almazara El Olivar</h1>\n      <p>\n        Picual de cosecha temprana. En nariz es muy{' '}\n        <Termino nombre=\"frutado\">\n          Recuerda a la aceituna fresca, sana y recogida en su punto.\n        </Termino>\n        , con notas de tomatera.\n      </p>\n      <p>Lote 14 · molturado el 3 de noviembre · 0,2° de acidez.</p>\n      <p>\n        En boca entra dulce, con un{' '}\n        <Termino nombre=\"amargo\">\n          Típico de la aceituna verde. En su justa medida es una virtud.\n        </Termino>{' '}\n        suave y un final{' '}\n        <Termino nombre=\"picante\">\n          Picor en la garganta al tragar. Delata un aceite rico en polifenoles.\n        </Termino>{' '}\n        que se queda.\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Bocadillo.jsx",
      "codigo": "import { useEffect, useLayoutEffect, useRef, useState } from 'react'\n\n// Súbelo a 150 para que cada render tarde 150 ms\nconst RETARDO_MS = 0\n\nexport default function Bocadillo({ children }) {\n  const ref = useRef(null)\n  const [lado, setLado] = useState('sin-medir')\n\n  // Solo para el experimento: gasta tiempo, como un render pesado\n  const inicio = performance.now()\n  while (performance.now() - inicio < RETARDO_MS) {\n    // nada\n  }\n\n  useLayoutEffect(() => {\n    const bocadillo = ref.current.getBoundingClientRect()\n    const termino = ref.current.parentElement.getBoundingClientRect()\n    setLado(bocadillo.height + 8 < termino.top ? 'arriba' : 'abajo')\n  }, [])\n\n  useEffect(() => {\n    console.log('El efecto normal ve lado = ' + lado)\n  }, [lado])\n\n  return (\n    <span ref={ref} className={'bocadillo ' + lado} data-lado={lado}>\n      {children}\n    </span>\n  )\n}\n"
    },
    {
      "nombre": "fotogramas.jsx",
      "codigo": "// Herramienta para el experimento: no hace falta que la leas entera.\n// requestAnimationFrame ejecuta su función justo antes de que el navegador\n// pinte el siguiente fotograma, así que apunta lo que se va a ver en él.\nexport function grabarFotogramas(terminoRef) {\n  const inicio = performance.now()\n  let numero = 1\n  function apuntar() {\n    const nodo = terminoRef.current?.querySelector('.bocadillo')\n    const ms = Math.round(performance.now() - inicio)\n    console.log(`Fotograma ${numero} (${ms} ms): ${nodo ? nodo.dataset.lado : 'sin bocadillo'}`)\n    numero += 1\n    if (numero <= 5) requestAnimationFrame(apuntar)\n  }\n  requestAnimationFrame(apuntar)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".ficha {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n  line-height: 1.6;\n}\n\n.ficha h1 {\n  margin-top: 0;\n  font-size: 1.4rem;\n}\n\n.termino {\n  position: relative;\n}\n\n.termino button {\n  font: inherit;\n  padding: 0 0.2rem;\n  border: 0;\n  border-bottom: 2px dotted #4d7c0f;\n  background: #f7fee7;\n  color: #365314;\n  cursor: help;\n}\n\n.bocadillo {\n  position: absolute;\n  left: 0;\n  z-index: 1;\n  width: 12rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #1c1917;\n  color: #fafaf9;\n  font-size: 0.9rem;\n  line-height: 1.4;\n  pointer-events: none;\n}\n\n/* Antes de medir: encima de la palabra y en rojo, para que se note si llega a pintarse */\n.bocadillo.sin-medir {\n  top: 0;\n  background: #b91c1c;\n}\n\n.bocadillo.arriba {\n  bottom: calc(100% + 8px);\n}\n\n.bocadillo.abajo {\n  top: calc(100% + 8px);\n}\n"
    }
  ],
  "archivoInicial": "Bocadillo.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Sin retardo, la diferencia está en la consola: con `useLayoutEffect`, todos los fotogramas dicen `arriba`; con `useEffect`, en Chrome el primero o los dos primeros suelen decir `sin-medir`. El bocadillo rojo ha estado en pantalla, pero solo unas centésimas de segundo: existe, y es difícil verlo.

Con `RETARDO_MS = 150` ya no hace falta la consola. Esto es lo que sale en Chrome al abrir «picante» (los milisegundos cambian de un ordenador a otro):

```text
useEffect, RETARDO_MS = 150
Fotograma 1 (323 ms): sin-medir
Fotograma 2 (624 ms): arriba

useLayoutEffect, RETARDO_MS = 150
Fotograma 1 (624 ms): arriba
```

- **Con `useEffect` y un render lento**, el bocadillo rojo se queda unos 300 ms encima de la palabra: `StrictMode` hace dos renders de 150 ms antes de cada commit, y entre el commit 2 y el 3 el navegador pinta.
- **Con `useLayoutEffect` no se pinta nunca el sitio provisional**, tarde lo que tarde el render: el primer fotograma ya trae el bocadillo en su sitio.

Que se pinte o no depende también del navegador. En Safari, este mismo ejemplo con `useEffect` puede no llegar a pintar nunca el sitio provisional; en otro dispositivo, o con otro tipo de actualización, sí. **`useEffect` no garantiza nada sobre el pintado; `useLayoutEffect` garantiza que el paso intermedio no se ve**, en cualquier navegador.

Mira ahora el registro de efectos de las dos versiones. Cuenta la misma historia, y solo cambia la etiqueta «(useLayoutEffect)»: la primera vez que abres el bocadillo, en el commit 2 aparece y se mide; en el commit 3 se coloca, «Bocadillo ▶ efecto · cambió lado: "sin-medir" → "arriba"». **La diferencia no está en el orden de React, sino en si el navegador pinta entre el commit 2 y el 3**, y eso no lo ve el registro: lo ve la cámara lenta.

## Un `set` dentro de `useLayoutEffect`: otro commit, antes de pintar

Vuelve a la versión con `useLayoutEffect` y mira la consola de la cámara lenta. Antes de los fotogramas sale esto:

```text
El efecto normal ve lado = sin-medir
El efecto normal ve lado = sin-medir
El efecto normal ve lado = arriba
```

Las dos primeras son del commit 2 (la segunda, del ensayo de `StrictMode`), y la tercera, del commit 3. Cuando un efecto de layout llama a un `set`, **React ejecuta en el acto los `useEffect` que quedaban pendientes de ese commit**, y solo después hace el render y el commit siguientes. Por eso el efecto normal llega a ver `lado = 'sin-medir'`, un valor que nunca se pintó. Comprueba si lo has entendido:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Sin StrictMode. ¿En qué orden salen los mensajes al montar Etiqueta?\nfunction Etiqueta() {\n  const [ancho, setAncho] = useState(0)\n  console.log('render, ancho =', ancho)\n\n  useLayoutEffect(() => {\n    console.log('layout')\n    setAncho(180)\n  }, [])\n\n  useEffect(() => {\n    console.log('efecto, ancho =', ancho)\n  })\n\n  return <p>Ancho de la etiqueta: {ancho} px</p>\n}",
  "opciones": [
    "render 0, layout, render 180, efecto 180",
    "render 0, layout, efecto 0, render 180, efecto 180",
    "render 0, efecto 0, layout, render 180, efecto 180",
    "render 0, layout, efecto 0, y se queda en 0"
  ],
  "correcta": 1,
  "explicacion": "El set del efecto de layout obliga a React a terminar ya el commit: ejecuta el useEffect pendiente, que todavía ve ancho = 0, y después renderiza con 180. Como el useEffect no tiene array de dependencias, se ejecuta otra vez tras ese segundo commit y ve 180. Con StrictMode verías además las repeticiones del ensayo."
}
```

Un detalle más: si lo que mides coincide con lo que ya había en el estado, no hay segundo commit. Si `setLado('abajo')` encuentra que `lado` ya valía `'abajo'`, React se ahorra el render (lección 17). Te pasará en el ejercicio del final: el menú que cabe abajo se abre con un solo commit, y el que hay que subir, con dos.

## Por qué «casi nunca»

Con lo que has visto, `useLayoutEffect` parece la versión buena de `useEffect`. No lo es, por cuatro motivos.

**Bloquea el pintado.** Todo lo que hagas dentro, y todos los renders que provoque, ocurren con la pantalla congelada. Míralo en la cámara lenta con `RETARDO_MS = 150`: con `useEffect`, a los 300 ms ya se ve algo y a los 600 está colocado; con `useLayoutEffect`, la página no cambia nada hasta los 600 ms. **No hace el trabajo más deprisa: decide que no se vea a medias**, y lo paga con una espera en la que no se pinta nada.

**La mayoría de efectos no miden nada.** Conectarse a un chat, pedir datos, poner un temporizador, suscribirse a un evento o mandar una estadística no cambian lo que se ve en el siguiente fotograma. Ponerlos en `useLayoutEffect` solo retrasa el pintado. Y muchos ni siquiera necesitan un efecto (lección 39).

**Dos pasadas cuestan.** Medir y volver a renderizar es hacer el trabajo dos veces. Si el CSS puede colocar algo solo (un `position: absolute` con su lado fijo, un `flex` que reparte el espacio), no midas. Y para menús, bocadillos y desplegables, las librerías de componentes de la lección 80 ya lo resuelven: Radix los coloca con Floating UI, que por dentro mide con `useLayoutEffect`.

**En el servidor no hay nada que medir.** Los efectos no se ejecutan al renderizar en el servidor; qué hacer con un componente que necesita medir se ve en la lección 87.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las tres preguntas antes de escribir useLayoutEffect",
  "contenido": "¿El efecto lee medidas o posiciones del DOM? ¿Cambia lo que se ve según esas medidas? ¿Se notaría el paso intermedio si el navegador lo pintara? Solo si contestas que sí a las tres, useLayoutEffect. Si no, useEffect, o ningún efecto."
}
```

## `useInsertionEffect`: para quien escribe librerías de CSS-in-JS

En la lección 79 viste que algunas librerías de CSS-in-JS generan el CSS al ejecutarse y lo meten en la página con etiquetas `<style>`, y que React no lo recomienda. Si una librería lo hace de todos modos, **el momento importa**: si mete el `<style>` en un efecto de layout, otro componente puede haber medido ya el DOM con los estilos sin aplicar. Para eso existe `useInsertionEffect`: React ejecuta **todos** los de inserción antes que **cualquier** efecto de layout.

Esta conservera usa una librería de estilos en miniatura, un hook propio (lección 43) llamado `useEstilo`. `Etiqueta` declara su CSS con él, y `Medida`, su hija, mide su propio ancho en un `useLayoutEffect`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El estilo tiene que llegar antes que la medida",
  "consigna": "Lee el número de la etiqueta y el orden del registro de efectos. Después, en miniestilos.jsx, cambia useInsertionEffect por useLayoutEffect (en el import y en la llamada) y compara: la etiqueta se ve igual de estrecha, pero el número ya no cuadra.",
  "archivos": [
    {
      "nombre": "miniestilos.jsx",
      "codigo": "import { useInsertionEffect } from 'react'\n\n// Una librería de CSS-in-JS en miniatura: cada componente declara su CSS\n// y la librería mete una etiqueta <style> en <head> la primera vez.\nconst insertadas = new Set()\n\nexport function useEstilo(clase, css) {\n  useInsertionEffect(() => {\n    if (insertadas.has(clase)) return\n    insertadas.add(clase)\n    const etiqueta = document.createElement('style')\n    etiqueta.textContent = `.${clase} { ${css} }`\n    document.head.appendChild(etiqueta)\n  }, [clase, css])\n  return clase\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useLayoutEffect, useRef, useState } from 'react'\nimport { useEstilo } from './miniestilos'\nimport './estilos.css'\n\nfunction Medida() {\n  const ref = useRef(null)\n  const [ancho, setAncho] = useState(null)\n\n  useLayoutEffect(() => {\n    setAncho(Math.round(ref.current.getBoundingClientRect().width))\n  }, [])\n\n  return <p ref={ref}>Este texto mide {ancho ?? '…'} px de ancho.</p>\n}\n\nfunction Etiqueta({ producto, detalle }) {\n  const clase = useEstilo(\n    'etiqueta',\n    'width: 14rem; padding: 0.75rem 1rem; border: 3px double #1e3a8a; border-radius: 8px; background: #eff6ff;',\n  )\n  return (\n    <article className={clase}>\n      <h2>{producto}</h2>\n      <p>{detalle}</p>\n      <Medida />\n    </article>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Conservas La Galerna</h1>\n      <Etiqueta producto=\"Bonito del Norte\" detalle=\"En escabeche · lata de 250 g\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n"
    }
  ],
  "archivoInicial": "miniestilos.jsx",
  "strictMode": false,
  "mostrarConsola": false,
  "mostrarEfectos": true
}
```

Con `useInsertionEffect`, el registro dice «Etiqueta · useEstilo ▶ efecto (useInsertionEffect) · montaje» y, después, «Medida ▶ efecto (useLayoutEffect) · montaje». Cuando `Medida` mide, el `<style>` ya está en la página: el texto mide **224 px**, los `14rem` de ancho de la etiqueta. El registro nombra también el hook propio que contiene el efecto, `useEstilo`, como en la lección 43.

Con `useLayoutEffect` en la librería, el orden se da la vuelta: «Medida ▶ efecto (useLayoutEffect)» va **antes** que «Etiqueta · useEstilo ▶ efecto (useLayoutEffect)», porque en una misma tanda los hijos van antes que los padres. `Medida` mide cuando la etiqueta todavía no tiene su CSS, y el número sale con el ancho de toda la vista previa. La etiqueta se ve bien porque el estilo llega antes de pintar; lo que queda mal es **la medida que tomó otro componente**.

Este bloque tiene `StrictMode` apagado por un motivo: su ensayo repite el efecto de layout de `Medida` cuando el estilo ya está puesto, y esa segunda medida taparía el fallo.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Lo que useInsertionEffect no puede hacer",
  "items": [
    {
      "titulo": "No ve las refs",
      "texto": "Se ejecuta antes de que React rellene las refs: en el montaje, ref.current vale null, como viste en la consola de la almazara. No sirve para medir ni para tocar nodos."
    },
    {
      "titulo": "No puede cambiar el estado",
      "texto": "Si llamas a un set dentro, React se queja en la consola con «useInsertionEffect must not schedule updates.». Su único trabajo es insertar estilos."
    },
    {
      "titulo": "No te fíes del estado del DOM",
      "texto": "La documentación avisa de que puede ejecutarse antes o después de que el DOM se actualice. Lo único garantizado es que va antes que todos los efectos de layout."
    },
    {
      "titulo": "StrictMode no lo repite",
      "texto": "En el registro, los efectos de layout y los normales salen repetidos por StrictMode al montar; el de inserción, una sola vez."
    },
    {
      "titulo": "Tampoco en el servidor",
      "texto": "Como todos los efectos, no se ejecuta al renderizar en el servidor. Una librería que necesite saber qué CSS se ha usado allí lo apunta durante el render."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Colocar algo según lo que mide",
      "texto": "Bocadillos, menús desplegables y ventanas flotantes que eligen lado según el sitio que queda. Es el caso de libro de useLayoutEffect, y el que te ahorra una librería de componentes (lección 80)."
    },
    {
      "titulo": "Decidir si un texto cabe antes de enseñarlo",
      "texto": "Medir un párrafo para recortarlo y poner «Leer más», o reducir la letra de un rótulo hasta que entre, sin que se vea primero la versión que no cabe."
    },
    {
      "titulo": "Ajustar el scroll después de cambiar el contenido",
      "texto": "Si al cargar mensajes antiguos encima de un chat no corriges el scroll antes de pintar, la conversación salta. La corrección va en un useLayoutEffect."
    },
    {
      "titulo": "Escribir una librería de CSS-in-JS",
      "texto": "Es el único uso de useInsertionEffect. Si solo usas una de esas librerías, ella lo llama por ti."
    },
    {
      "titulo": "Todo lo demás",
      "texto": "Pedir datos, conectar, temporizadores, suscripciones, analítica: useEffect (lección 38), o ningún efecto (lección 39)."
    }
  ]
}
```

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "useLayoutEffect es una versión más rápida de useEffect",
      "realidad": "Hace el mismo trabajo, pero el navegador espera a que termine para pintar. En la cámara lenta, con el retardo, la versión de layout tardaba más en enseñar algo."
    },
    {
      "mito": "useLayoutEffect se ejecuta antes de que React cambie el DOM",
      "realidad": "Se ejecuta después: el DOM ya está al día y las refs apuntan a sus nodos, por eso se puede medir. Lo que todavía no ha pasado es el pintado."
    },
    {
      "mito": "Con useLayoutEffect el componente solo se renderiza una vez",
      "realidad": "Medir y recolocar son dos renders y dos commits, el 2 y el 3 del registro. La diferencia es que el primero no llega a la pantalla."
    },
    {
      "mito": "StrictMode no repite los efectos de layout",
      "realidad": "Sí los repite: «▶ efecto (useLayoutEffect) · repetido por StrictMode». El que no se repite es useInsertionEffect."
    },
    {
      "mito": "useInsertionEffect sirve para meter cualquier cosa en el DOM cuanto antes",
      "realidad": "Sirve para etiquetas style de una librería de CSS-in-JS. No ve las refs ni puede cambiar el estado: para cualquier otra cosa, useEffect o useLayoutEffect."
    }
  ]
}
```

## Errores típicos

**Medir durante el render.** Es la tentación al empezar: si necesito la altura, la calculo en el cuerpo del componente.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Bocadillo({ children }) {\n  const ref = useRef(null)\n  const alto = ref.current.getBoundingClientRect().height\n  const lado = alto + 8 < 100 ? 'arriba' : 'abajo'\n  return (\n    <span ref={ref} className={'bocadillo ' + lado}>\n      {children}\n    </span>\n  )\n}\n\n// ¿Qué pasa al pulsar «picante» y montar el bocadillo?",
  "opciones": [
    "Se coloca bien, porque la ref ya apunta al span",
    "Sale siempre abajo, porque mide 0",
    "Falla: Cannot read properties of null (reading 'getBoundingClientRect')",
    "Sale una vez mal colocado y al segundo render se corrige"
  ],
  "correcta": 2,
  "explicacion": "En el primer render el span todavía no existe y ref.current vale null: React lo rellena en el commit (lección 34). Leer una propiedad de null lanza el error, y la vista previa lo enseña en su recuadro. Las medidas se toman en un efecto, que llega cuando el nodo ya está en la página."
}
```

**Un efecto de layout sin dependencias que guarda un objeto nuevo.** Esta farmacia mide su rótulo en cada render y guarda la medida como objeto. Cada `setMedida` recibe un objeto distinto aunque las cifras sean las mismas (lección 20), así que hay un render nuevo, un efecto nuevo y otra medida nueva, sin fin. La vista previa se cae nada más cargar:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un bucle que no llega ni a pintarse",
  "consigna": "Lee el error y mira el registro de efectos: un commit tras otro, todos con «se ejecuta en cada render». Arréglalo de dos formas: con un array de dependencias vacío, y guardando el ancho y el alto en dos estados con números en vez de un objeto.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useLayoutEffect, useRef, useState } from 'react'\n\nexport default function Guardia() {\n  const ref = useRef(null)\n  const [medida, setMedida] = useState({ ancho: 0, alto: 0 })\n\n  useLayoutEffect(() => {\n    const caja = ref.current.getBoundingClientRect()\n    setMedida({ ancho: Math.round(caja.width), alto: Math.round(caja.height) })\n  })\n\n  return (\n    <main>\n      <h1 ref={ref}>Farmacia de guardia: Plaza Mayor, 3</h1>\n      <p>\n        El rótulo mide {medida.ancho} × {medida.alto} px.\n      </p>\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true
}
```

El error, tal como lo escribe React:

```text
Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Es decir: se ha superado la profundidad máxima de actualizaciones; un componente llama a `setState` una y otra vez, y React corta el bucle. El mensaje habla de métodos de componentes de clase (lección 91), pero el culpable es tu `useLayoutEffect`. Con `useEffect`, el mismo bucle sale como el **aviso** de la lección 64, que se repite sin parar mientras la app sigue en bucle; con `useLayoutEffect` es un **error** que tumba el componente, porque cada vuelta ocurre antes de pintar y React no suelta el control en ningún momento.

Los dos arreglos funcionan. Con `[]`, se mide una vez al montar. Con dos números, el efecto se sigue ejecutando tras cada render, pero el segundo `setAncho` recibe el mismo número que ya había y React deja de renderizar. Si el rótulo pudiera cambiar de texto, la dependencia correcta sería ese texto.

**Usar `useLayoutEffect` «por si acaso».** Para pedir datos, suscribirte o arrancar un temporizador no aporta nada y retrasa el pintado. Si dudas, `useEffect`, y cámbialo solo si ves el salto.

**Pedirle a `useInsertionEffect` lo que no puede dar.** Leer una ref (vale `null` en el montaje) o cambiar el estado (React avisa con «useInsertionEffect must not schedule updates.»). Si no estás escribiendo una librería de CSS-in-JS, no es tu hook.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El menú que sale cortado",
  "consigna": "Abre las acciones de la parcela 6: el huerto recorta el menú por abajo. En MenuAcciones.jsx, pon una ref al menú y mide con useLayoutEffect el menú y el huerto (limiteRef). Si el menú no cabe debajo, cambia lado a arriba. El pico ▲ o ▼ dice hacia dónde se ha abierto. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "MenuAcciones.jsx",
      "codigo": "import { useLayoutEffect, useRef, useState } from 'react'\n\nconst ACCIONES = ['Regar', 'Abonar', 'Cosechar', 'Dejar en barbecho']\n\nexport default function MenuAcciones({ limiteRef, onElegir }) {\n  const [lado, setLado] = useState('abajo')\n\n  // Tu trabajo: antes de que el navegador pinte, mide el menú y el huerto\n  // (limiteRef). El menú cabe si su borde inferior queda por encima del\n  // borde inferior del huerto. Si no cabe, ábrelo hacia arriba.\n\n  return (\n    <div className={`menu ${lado}`}>\n      {lado === 'abajo' && <span className=\"pico\" aria-hidden=\"true\">▲</span>}\n      <ul>\n        {ACCIONES.map((accion) => (\n          <li key={accion}>\n            <button onClick={() => onElegir(accion)}>{accion}</button>\n          </li>\n        ))}\n      </ul>\n      {lado === 'arriba' && <span className=\"pico\" aria-hidden=\"true\">▼</span>}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport MenuAcciones from './MenuAcciones'\nimport './estilos.css'\n\nconst PARCELAS = [\n  { id: 1, cultivo: 'Tomates' },\n  { id: 2, cultivo: 'Habas' },\n  { id: 3, cultivo: 'Fresas' },\n  { id: 4, cultivo: 'Calabacines' },\n  { id: 5, cultivo: 'Lechugas' },\n  { id: 6, cultivo: 'Aromáticas' },\n]\n\nexport default function App() {\n  const huertoRef = useRef(null)\n  const [abierta, setAbierta] = useState(null)\n  const [aviso, setAviso] = useState('')\n\n  function manejarElegir(parcela, accion) {\n    setAviso(`${accion} · parcela ${parcela}`)\n    setAbierta(null)\n  }\n\n  return (\n    <main>\n      <h1>Huerto comunitario La Acequia</h1>\n      <ul className=\"huerto\" ref={huertoRef}>\n        {PARCELAS.map((parcela) => (\n          <li key={parcela.id} className=\"parcela\">\n            <span>\n              Parcela {parcela.id} · {parcela.cultivo}\n            </span>\n            <div className=\"desplegable\">\n              <button\n                aria-label={`Acciones de la parcela ${parcela.id}`}\n                aria-expanded={abierta === parcela.id}\n                onClick={() => setAbierta(abierta === parcela.id ? null : parcela.id)}\n              >\n                Acciones\n              </button>\n              {abierta === parcela.id && (\n                <MenuAcciones\n                  limiteRef={huertoRef}\n                  onElegir={(accion) => manejarElegir(parcela.id, accion)}\n                />\n              )}\n            </div>\n          </li>\n        ))}\n      </ul>\n      <p role=\"status\">{aviso}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 30rem;\n}\n\nh1 {\n  margin-top: 0;\n  font-size: 1.4rem;\n}\n\n/* overflow: hidden recorta lo que se salga del huerto, menús incluidos */\n.huerto {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  border: 2px solid #4d7c0f;\n  border-radius: 10px;\n  overflow: hidden;\n  background: #f7fee7;\n}\n\n.parcela {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.5rem 0.75rem;\n  border-bottom: 1px solid #d9f99d;\n}\n\n.parcela:last-child {\n  border-bottom: 0;\n}\n\n.desplegable {\n  position: relative;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n}\n\n.menu {\n  position: absolute;\n  right: 0;\n  z-index: 1;\n  width: 11rem;\n  text-align: right;\n}\n\n.menu.abajo {\n  top: 100%;\n}\n\n.menu.arriba {\n  bottom: 100%;\n}\n\n.menu ul {\n  margin: 0;\n  padding: 0.25rem;\n  list-style: none;\n  border-radius: 6px;\n  background: #1a2e05;\n}\n\n.menu ul button {\n  width: 100%;\n  border: 0;\n  background: none;\n  color: #ecfccb;\n  text-align: left;\n}\n\n.pico {\n  display: block;\n  padding-right: 1.6rem;\n  color: #1a2e05;\n  line-height: 0.8;\n}\n"
    }
  ],
  "archivoInicial": "MenuAcciones.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "«Acciones de la parcela 6» abre su menú",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Acciones de la parcela 6"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Regar"
      }
    },
    {
      "descripcion": "El menú de la parcela 6 no cabe debajo y se abre hacia arriba: su pico ▼ apunta al botón",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Acciones de la parcela 6"
          }
        }
      ],
      "espera": {
        "texto": "▼"
      }
    },
    {
      "descripcion": "Al elegir «Cosechar», el aviso dice «Cosechar · parcela 6»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Acciones de la parcela 6"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cosechar"
          }
        }
      ],
      "espera": {
        "texto": "Cosechar · parcela 6"
      }
    },
    {
      "descripcion": "Al elegir una acción, el menú se cierra",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Acciones de la parcela 6"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Regar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Abonar"
        }
      }
    }
  ]
}
```

Cuando lo tengas, abre también la parcela 1: su menú cabe y sale hacia abajo. En el registro de efectos verás «MenuAcciones ▶ efecto (useLayoutEffect) · montaje» cada vez que abres un menú. Las comprobaciones solo ven el resultado: no distinguen si has medido con `useLayoutEffect` o con `useEffect`. Esa diferencia, como en la cámara lenta, está en lo que llega a pintarse.

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que el menú solo se abra hacia arriba si de verdad cabe encima. Si no cabe por ningún lado, que se abra hacia abajo con una altura máxima y scroll.
2. Cierra el menú al pulsar Escape o al hacer clic fuera de él. Piensa qué efecto toca: escuchar el teclado no mide nada.
3. Saca el menú del huerto con un portal (lección 36) para que `overflow: hidden` no lo recorte. Ahora tendrás que colocarlo tú respecto a la ventana, con la caja del botón.
4. En el bocadillo de la almazara, si no cabe por la derecha, alinéalo con el borde derecho de la palabra. Prueba con la vista previa estrecha.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useLayoutEffect",
      "descripcion": "La referencia oficial: el bocadillo que se coloca en dos pasadas, la versión con useEffect que parpadea y por qué conviene evitarlo.",
      "url": "https://react.dev/reference/react/useLayoutEffect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useInsertionEffect",
      "descripcion": "La referencia del hook para librerías de CSS-in-JS: sus límites y por qué es mejor que insertar estilos en el render o en un efecto de layout.",
      "url": "https://react.dev/reference/react/useInsertionEffect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useEffect: advertencias sobre el pintado",
      "descripcion": "Cuándo deja React que el navegador pinte antes de ejecutar un efecto, y cuándo no, según lo provoque un clic u otra cosa.",
      "url": "https://react.dev/reference/react/useEffect#caveats",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Library Upgrade Guide: <style> (most CSS-in-JS libs)",
      "descripcion": "La guía con la que el equipo de React presentó useInsertionEffect a las librerías de CSS-in-JS. Explica el fallo del ejemplo de la conservera: un efecto que mide antes de que llegue el CSS lee una medida equivocada.",
      "url": "https://github.com/reactwg/react-18/discussions/110",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Element.getBoundingClientRect()",
      "descripcion": "Qué devuelve exactamente la caja de un elemento: posición respecto a la ventana, ancho y alto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Window.requestAnimationFrame()",
      "descripcion": "La función que usa la cámara lenta: se ejecuta justo antes de que el navegador pinte el siguiente fotograma.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame",
      "etiqueta": "MDN"
    }
  ]
}
```
