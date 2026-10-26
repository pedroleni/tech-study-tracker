# `<Activity>`: ocultar sin perder el estado

- **Módulo:** Asincronía y concurrencia
- **Slug:** `activity-ocultar-sin-perder-el-estado` (autogenerado del título)
- **Orden:** 540
- **Fuentes:** [`<Activity>`](https://react.dev/reference/react/Activity) — ver `contenido/react/TEMARIO.md` #54

---

## Qué es y para qué sirve

La web de la **Granja Escuela Los Chopos** tiene tres pestañas: «La granja», «Talleres» y «Reservar visita». Una familia empieza a rellenar la reserva, se va a «Talleres» para ver qué hay el sábado, vuelve… y el formulario está vacío. Desde la lección 26 sabes por qué: la pestaña se pinta con un condicional, y **lo que sale del árbol pierde su estado**.

Allí viste tres arreglos: esconder con CSS, levantar el estado al padre y guardarlo fuera de React. React 19.2 (octubre de 2025) añadió un cuarto, pensado justo para esto: **`<Activity>`, un componente que esconde una parte de la interfaz sin desmontarla**.

```jsx
// Antes: al cambiar de pestaña, Reserva se desmonta y lo escrito se pierde
{pestana === 'reserva' && <Reserva />}

// Después: Reserva se esconde, pero sigue ahí con todo lo que tenía
<Activity mode={pestana === 'reserva' ? 'visible' : 'hidden'}>
  <Reserva />
</Activity>
```

`mode` admite dos valores: `'visible'`, el que tiene si no pones nada, y `'hidden'`. Con `'hidden'`, React esconde a los hijos con CSS, **conserva su estado y su DOM**, **apaga sus efectos** y, si cambian sus props, los vuelve a renderizar **después de lo que se ve**. Cada una de esas cosas tiene su sección en esta lección.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de esconder una pestaña",
  "roles": [
    {
      "etiqueta": "Quitar del árbol",
      "rol": "{visible && <Reserva />}",
      "descripcion": "Se desmonta: pierde el estado y el DOM, y sus efectos se limpian. Al volver, empieza de cero."
    },
    {
      "etiqueta": "Esconder con CSS",
      "rol": "hidden o display: none a mano",
      "descripcion": "Sigue montada con su estado, pero también con sus efectos en marcha, y se vuelve a renderizar a la vez que todo lo demás."
    },
    {
      "etiqueta": "Activity oculto",
      "rol": "<Activity mode=\"hidden\">",
      "descripcion": "Conserva el estado y el DOM, como con CSS; apaga los efectos, como al desmontar, y deja sus renders para después de lo visible."
    }
  ]
}
```

## Con un condicional, la reserva se pierde

Este es el punto de partida, con la pestaña de reserva en su propio archivo. Tiene activado el árbol de renders.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Pestañas con renderizado condicional",
  "consigna": "Ve a «Reservar visita», escribe un nombre, elige otro taller y escribe algo en «¿Algo que debamos saber?». Pasa a «Talleres» y vuelve: todo vacío. En el árbol, Reserva sale desmontada al irte y montada otra vez, con ·1, al volver.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Reserva from './Reserva'\nimport './estilos.css'\n\nconst PESTANAS = [\n  { id: 'granja', nombre: 'La granja' },\n  { id: 'talleres', nombre: 'Talleres' },\n  { id: 'reserva', nombre: 'Reservar visita' },\n]\n\nfunction Granja() {\n  return (\n    <section className=\"panel\">\n      <h2>Bienvenidos a Los Chopos</h2>\n      <p>Vacas, cabras, gallinas y un huerto que cuidan los niños.</p>\n    </section>\n  )\n}\n\nfunction Talleres() {\n  return (\n    <section className=\"panel\">\n      <h2>Talleres de otoño</h2>\n      <ul>\n        <li>Hacer queso fresco</li>\n        <li>Ordeñar a Margarita</li>\n        <li>Plantar ajos</li>\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('granja')\n\n  return (\n    <main>\n      <h1>Granja Escuela Los Chopos</h1>\n      <nav aria-label=\"Secciones\">\n        {PESTANAS.map((p) => (\n          <button key={p.id} aria-pressed={p.id === pestana} onClick={() => setPestana(p.id)}>\n            {p.nombre}\n          </button>\n        ))}\n      </nav>\n      {pestana === 'granja' && <Granja />}\n      {pestana === 'talleres' && <Talleres />}\n      {pestana === 'reserva' && <Reserva />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Reserva.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Reserva() {\n  const [familia, setFamilia] = useState('')\n  const [taller, setTaller] = useState('Hacer queso fresco')\n\n  return (\n    <section className=\"panel\">\n      <h2>Reserva tu visita</h2>\n      <label>\n        Nombre de la familia\n        <input value={familia} onChange={(e) => setFamilia(e.target.value)} />\n      </label>\n      <label>\n        Taller\n        <select value={taller} onChange={(e) => setTaller(e.target.value)}>\n          <option>Hacer queso fresco</option>\n          <option>Ordeñar a Margarita</option>\n          <option>Plantar ajos</option>\n        </select>\n      </label>\n      <label>\n        ¿Algo que debamos saber?\n        <textarea rows=\"3\" />\n      </label>\n      <p>Reserva a nombre de {familia || '…'} · {taller}</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nh2 {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 1.1rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4d7c0f;\n  color: white;\n}\n\n.panel {\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #bef264;\n  border-radius: 8px;\n  background: #f7fee7;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.6rem;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Fíjate en que se pierden **dos clases de cosas**. El nombre y el taller son estado de React (`useState`). Lo que escribes en «¿Algo que debamos saber?» no: es un `<textarea>` sin `value`, así que el texto solo lo guarda el propio elemento del DOM. Al desmontar, React tira el estado y también el elemento.

## La misma app con `<Activity>`

Ahora cada pestaña va dentro de su propio `<Activity>`, y los tres están siempre en el árbol. Lo único que cambia al pulsar una pestaña es el `mode` de cada uno:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Con «La granja» abierta",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: pestana"
    },
    {
      "nombre": "Activity",
      "nivel": 1,
      "etiqueta": "mode=\"visible\""
    },
    {
      "nombre": "Granja",
      "nivel": 2,
      "nota": "se ve"
    },
    {
      "nombre": "Activity",
      "nivel": 1,
      "etiqueta": "mode=\"hidden\""
    },
    {
      "nombre": "Talleres",
      "nivel": 2,
      "nota": "escondida: display: none y sin efectos"
    },
    {
      "nombre": "Activity",
      "nivel": 1,
      "etiqueta": "mode=\"hidden\""
    },
    {
      "nombre": "Reserva",
      "nivel": 2,
      "etiqueta": "estado: familia, taller",
      "nota": "escondida, pero conserva su estado y su DOM"
    }
  ]
}
```

`Reserva` es exactamente la de antes; para que quepa en un bloque anotado, va en el mismo archivo. Repite la prueba: escribe, cambia de pestaña y vuelve.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Cada pestaña, dentro de su Activity",
  "codigo": "import { Activity, useState } from 'react'\n\nconst PESTANAS = [\n  { id: 'granja', nombre: 'La granja' },\n  { id: 'talleres', nombre: 'Talleres' },\n  { id: 'reserva', nombre: 'Reservar visita' },\n]\n\nfunction Granja() {\n  return (\n    <section className=\"panel\">\n      <h2>Bienvenidos a Los Chopos</h2>\n      <p>Vacas, cabras, gallinas y un huerto que cuidan los niños.</p>\n    </section>\n  )\n}\n\nfunction Talleres() {\n  return (\n    <section className=\"panel\">\n      <h2>Talleres de otoño</h2>\n      <ul>\n        <li>Hacer queso fresco</li>\n        <li>Ordeñar a Margarita</li>\n        <li>Plantar ajos</li>\n      </ul>\n    </section>\n  )\n}\n\nfunction Reserva() {\n  const [familia, setFamilia] = useState('')\n  const [taller, setTaller] = useState('Hacer queso fresco')\n\n  return (\n    <section className=\"panel\">\n      <h2>Reserva tu visita</h2>\n      <label>\n        Nombre de la familia\n        <input value={familia} onChange={(e) => setFamilia(e.target.value)} />\n      </label>\n      <label>\n        Taller\n        <select value={taller} onChange={(e) => setTaller(e.target.value)}>\n          <option>Hacer queso fresco</option>\n          <option>Ordeñar a Margarita</option>\n          <option>Plantar ajos</option>\n        </select>\n      </label>\n      <label>\n        ¿Algo que debamos saber?\n        <textarea rows=\"3\" />\n      </label>\n      <p>Reserva a nombre de {familia || '…'} · {taller}</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('granja')\n\n  return (\n    <main>\n      <h1>Granja Escuela Los Chopos</h1>\n      <nav aria-label=\"Secciones\">\n        {PESTANAS.map((p) => (\n          <button key={p.id} aria-pressed={p.id === pestana} onClick={() => setPestana(p.id)}>\n            {p.nombre}\n          </button>\n        ))}\n      </nav>\n      <Activity mode={pestana === 'granja' ? 'visible' : 'hidden'}>\n        <Granja />\n      </Activity>\n      <Activity mode={pestana === 'talleres' ? 'visible' : 'hidden'}>\n        <Talleres />\n      </Activity>\n      <Activity mode={pestana === 'reserva' ? 'visible' : 'hidden'}>\n        <Reserva />\n      </Activity>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nh2 {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 1.1rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4d7c0f;\n  color: white;\n}\n\n.panel {\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #bef264;\n  border-radius: 8px;\n  background: #f7fee7;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.6rem;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}",
  "anotaciones": [
    {
      "fragmento": "import { Activity, useState } from 'react'",
      "nota": "Activity se importa de react, como Suspense o Fragment. Es estable desde React 19.2."
    },
    {
      "fragmento": "<Activity mode={pestana === 'granja' ? 'visible' : 'hidden'}>",
      "nota": "Un Activity por pestaña. mode es un texto: 'visible' para la pestaña elegida y 'hidden' para las demás."
    },
    {
      "fragmento": "<Reserva />",
      "nota": "Reserva no sabe nada de Activity: el mismo componente de antes, con su estado dentro. Para conservarlo no has tenido que tocar ni una línea de Reserva."
    },
    {
      "fragmento": "<textarea rows=\"3\" />",
      "nota": "Un campo sin value: su texto es estado del DOM, no de React. Como Activity no destruye el elemento al esconderlo, también se conserva."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

El nombre, el taller y la nota siguen ahí. Y el árbol ya no enseña a `Reserva` desmontada al irte ni montada al volver: **es el mismo componente todo el rato**, y su contador de renders sigue subiendo en vez de volver a `·1`.

¿Qué hace React para esconderla? Si inspeccionas el DOM de la vista previa, verás que pone `style="display: none !important"` en los elementos de primer nivel de lo que hay dentro, aquí el `<section>` de cada pestaña, y se lo quita al volver a mostrarlo. `!important`, para que ninguna regla de tu CSS lo deshaga. `<Activity>` no añade ningún elemento propio: no hay un `<div>` envoltorio. Por eso, si un hijo devuelve solo texto, sin ninguna etiqueta, React no tiene dónde poner el `display: none` y lo que hace es vaciar ese texto mientras está escondido. Y desde React 19.3, lo que un componente escondido pinta en otro sitio con un portal (lección 36) también se esconde.

## Esconder no es desmontar… salvo para los efectos

Si lo escondido conserva su estado, ¿qué pasa con sus efectos? Aquí está la diferencia con esconder a mano. La documentación lo resume así: piensa en un Activity oculto como si sus hijos estuvieran desmontados, solo que React les guarda el estado para después. **Al esconder, React ejecuta las limpiezas de sus efectos; al volver a mostrarlo, ejecuta los efectos otra vez.**

Lo vas a ver con las cámaras de la granja. Cada `Camara` se conecta en un efecto, recibe una imagen por segundo, se desconecta en la limpieza y escribe en la consola cuándo pasa cada cosa. Hay tres, escondidas cada una de una forma distinta. Antes de probarlo, predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "<section>\n  <h2>Quitar del árbol</h2>\n  {visibles && <Camara nombre=\"Gallinero\" />}\n</section>\n<section>\n  <h2>Esconder con hidden</h2>\n  <div hidden={!visibles}>\n    <Camara nombre=\"Establo\" />\n  </div>\n</section>\n<section>\n  <h2>Activity</h2>\n  <Activity mode={visibles ? 'visible' : 'hidden'}>\n    <Camara nombre=\"Huerto\" />\n  </Activity>\n</section>\n\n// Camara suma una imagen por segundo con un setInterval\n// que arranca en un efecto y se para en su limpieza.\n// Las tres llevan 4 imágenes. Las ocultas, esperas 5 s\n// y las vuelves a mostrar. ¿Qué marcan justo al volver?",
  "opciones": [
    "Gallinero 4, Establo 4, Huerto 4",
    "Gallinero 0, Establo 9, Huerto 4",
    "Gallinero 0, Establo 4, Huerto 4",
    "Gallinero 0, Establo 9, Huerto 9"
  ],
  "correcta": 1,
  "explicacion": "El gallinero se desmontó: al volver es una cámara nueva, que empieza en 0. El establo nunca dejó de estar montado ni de ejecutar su efecto: su intervalo siguió sumando a escondidas. El huerto conservó su estado, 4, pero Activity limpió su efecto al esconderlo, así que el intervalo se paró, y lo arranca otra vez al mostrarlo."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres cámaras, tres formas de esconderlas",
  "consigna": "Deja que cada cámara reciba unas cuantas imágenes, pulsa «Ocultar las cámaras», espera cinco segundos y pulsa «Mostrar las cámaras». Compara los contadores con tu predicción y lee la consola: qué cámaras se desconectan al ocultar y cuáles se vuelven a conectar al mostrar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Activity, useState } from 'react'\nimport Camara from './Camara'\nimport './estilos.css'\n\nexport default function App() {\n  const [visibles, setVisibles] = useState(true)\n\n  return (\n    <main>\n      <h1>Granja Escuela Los Chopos</h1>\n      <button onClick={() => setVisibles(!visibles)}>\n        {visibles ? 'Ocultar las cámaras' : 'Mostrar las cámaras'}\n      </button>\n      <div className=\"camaras\">\n        <section>\n          <h2>Quitar del árbol</h2>\n          {visibles && <Camara nombre=\"Gallinero\" />}\n        </section>\n        <section>\n          <h2>Esconder con hidden</h2>\n          <div hidden={!visibles}>\n            <Camara nombre=\"Establo\" />\n          </div>\n        </section>\n        <section>\n          <h2>Activity</h2>\n          <Activity mode={visibles ? 'visible' : 'hidden'}>\n            <Camara nombre=\"Huerto\" />\n          </Activity>\n        </section>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Camara.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Camara({ nombre }) {\n  const [imagenes, setImagenes] = useState(0)\n\n  useEffect(() => {\n    console.log(`📷 ${nombre}: conectada`)\n    const id = setInterval(() => setImagenes((n) => n + 1), 1000)\n    return () => {\n      clearInterval(id)\n      console.log(`⏹ ${nombre}: desconectada`)\n    }\n  }, [nombre])\n\n  return (\n    <figure className=\"camara\">\n      <div className=\"pantalla\" aria-hidden=\"true\">\n        {nombre}\n      </div>\n      <figcaption>Imágenes recibidas: {imagenes}</figcaption>\n    </figure>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.camaras {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));\n  gap: 0.75rem;\n  margin-top: 0.75rem;\n}\n\n.camaras h2 {\n  margin: 0 0 0.4rem;\n  font-size: 0.95rem;\n}\n\n.camara {\n  margin: 0;\n}\n\n.pantalla {\n  display: grid;\n  place-items: center;\n  height: 4.5rem;\n  border-radius: 6px;\n  background: #1c1917;\n  color: #d9f99d;\n  font-weight: 600;\n}\n\nfigcaption {\n  margin-top: 0.3rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

La consola cuenta lo mismo con palabras. Al ocultar salen dos líneas: «⏹ Gallinero: desconectada», porque se desmonta, y «⏹ Huerto: desconectada», porque Activity limpia sus efectos. El establo no escribe nada: escondido con `hidden`, su intervalo sigue en marcha y recibe imágenes que nadie ve. Al mostrar salen «📷 Gallinero: conectada» y «📷 Huerto: conectada»…

…y después, de cada una, otra pareja «⏹ desconectada» y «📷 conectada». Es `StrictMode`. Con el gallinero hace lo de cualquier montaje (lección 38): limpia y repite el efecto para comprobar que se deshace bien. Con el huerto hace lo mismo al volver a mostrarlo, porque **para un efecto, salir de un Activity oculto es como montarse otra vez**. react.dev recomienda `StrictMode` justo por eso: un efecto que aguanta esa repetición aguanta también que lo escondan y lo vuelvan a enseñar.

Las tres formas, frente a frente:

- **Quitar del árbol**: se pierden el estado y el DOM, y los efectos se limpian. Mientras no se ve, no existe: no gasta nada, pero al volver empieza de cero.
- **`hidden` o `display: none` a mano**: se conserva todo y todo sigue funcionando, efectos incluidos: suscripciones, intervalos, conexiones. Y cada render del padre lo vuelve a renderizar a la vez que lo visible.
- **`<Activity mode="hidden">`**: se conservan el estado y el DOM, los efectos se apagan hasta que vuelva a verse y sus renders esperan a que termine lo visible. Eso último es la sección siguiente.

## Lo escondido se renderiza después

Un Activity oculto no congela a sus hijos. Si cambian sus props, React los vuelve a renderizar para que, cuando se muestren, estén al día. Pero **primero termina lo que se ve, y deja lo escondido para un render aparte, con menos prioridad**.

En este ejemplo, `App` guarda cuántos pollitos han nacido esta semana y se lo pasa a las dos pestañas. Mira el árbol de renders:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Primero lo que se ve, después lo escondido",
  "consigna": "Mira los dos primeros commits del árbol, nada más cargar. Después, con «Portada» abierta, pulsa «Ha nacido un pollito» y mira los dos commits que aparecen. Por último, abre «Diario»: ¿tiene el número bueno?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Activity, useState } from 'react'\nimport './estilos.css'\n\nfunction Portada({ pollitos }) {\n  return (\n    <section className=\"panel\">\n      <h2>Esta semana en Los Chopos</h2>\n      <p>Pollitos nacidos: {pollitos}</p>\n    </section>\n  )\n}\n\nfunction Diario({ pollitos }) {\n  return (\n    <section className=\"panel\">\n      <h2>Diario de la incubadora</h2>\n      <p>Han salido {pollitos} de los 12 huevos.</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('portada')\n  const [pollitos, setPollitos] = useState(3)\n\n  return (\n    <main>\n      <h1>Granja Escuela Los Chopos</h1>\n      <nav aria-label=\"Secciones\">\n        <button aria-pressed={pestana === 'portada'} onClick={() => setPestana('portada')}>\n          Portada\n        </button>\n        <button aria-pressed={pestana === 'diario'} onClick={() => setPestana('diario')}>\n          Diario\n        </button>\n        <button onClick={() => setPollitos(pollitos + 1)}>Ha nacido un pollito</button>\n      </nav>\n      <Activity mode={pestana === 'portada' ? 'visible' : 'hidden'}>\n        <Portada pollitos={pollitos} />\n      </Activity>\n      <Activity mode={pestana === 'diario' ? 'visible' : 'hidden'}>\n        <Diario pollitos={pollitos} />\n      </Activity>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nh2 {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 1.1rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4d7c0f;\n  color: white;\n}\n\n.panel {\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #bef264;\n  border-radius: 8px;\n  background: #f7fee7;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.6rem;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Nada más cargar hay dos commits: en el primero se montan `App` y `Portada`, lo que se ve; en el segundo se monta `Diario`, ya escondido. Al pulsar «Ha nacido un pollito» pasa lo mismo con el render: en un commit se renderizan `App` y `Portada` («cambió la prop «pollitos»») mientras `Diario` sale «sin cambios», y en el commit siguiente se renderiza `Diario` solo, también porque cambió `pollitos`. Al abrir «Diario» ya pone el número bueno: se puso al día mientras no lo mirabas.

Con `hidden` no habría dos commits: `Diario` sería un hijo más y se renderizaría junto a `Portada`, aunque nadie lo esté mirando. Si lo escondido es grande, eso retrasa lo que sí se ve. Activity le dice a React qué parte puede esperar, la misma idea de urgente y no urgente de las transiciones de la lección 51.

## Preparar una pestaña antes de abrirla

Que lo escondido se renderice, aunque sea después, tiene una consecuencia muy útil: **un Activity que empieza oculto prepara su contenido antes de que nadie lo abra**. Si ese contenido necesita datos y los lee de una forma que activa Suspense, como una promesa leída con `use` (lecciones 48 y 49), la petición sale al cargar la página. Cuando el usuario abre la pestaña, ya está todo.

La pestaña «Animales» lee la lista del servidor, con un segundo y medio de latencia, y tiene su propio `<Suspense>` con un fallback:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La pestaña de animales, preparada de antemano",
  "consigna": "Nada más cargar, mira el panel de red: la petición de los animales ya ha salido, aunque no has abierto la pestaña. Cuando termine, pulsa «Animales»: aparece sin esperar. Después cambia el segundo Activity por {pestana === 'animales' && <PestanaAnimales />} y repite: la petición sale al pulsar, y ves «Cargando animales…» segundo y medio.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Activity, Suspense, use, useState } from 'react'\nimport './estilos.css'\n\n// Caché mínima de promesas (lección 49): misma ruta, misma promesa\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    cache.set(ruta, fetch(ruta).then((res) => res.json()))\n  }\n  return cache.get(ruta)\n}\n\nfunction Portada() {\n  return (\n    <section className=\"panel\">\n      <h2>Bienvenidos a Los Chopos</h2>\n      <p>Abrimos de martes a domingo, de 10:00 a 18:00.</p>\n    </section>\n  )\n}\n\nfunction ListaAnimales() {\n  const animales = use(leer('/api/animales'))\n\n  return (\n    <ul>\n      {animales.map((animal) => (\n        <li key={animal.id}>\n          {animal.nombre}, {animal.especie}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nfunction PestanaAnimales() {\n  return (\n    <section className=\"panel\">\n      <h2>Nuestros animales</h2>\n      <Suspense fallback={<p className=\"cargando\">Cargando animales…</p>}>\n        <ListaAnimales />\n      </Suspense>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('portada')\n\n  return (\n    <main>\n      <h1>Granja Escuela Los Chopos</h1>\n      <nav aria-label=\"Secciones\">\n        <button aria-pressed={pestana === 'portada'} onClick={() => setPestana('portada')}>\n          Portada\n        </button>\n        <button aria-pressed={pestana === 'animales'} onClick={() => setPestana('animales')}>\n          Animales\n        </button>\n      </nav>\n      <Activity mode={pestana === 'portada' ? 'visible' : 'hidden'}>\n        <Portada />\n      </Activity>\n      <Activity mode={pestana === 'animales' ? 'visible' : 'hidden'}>\n        <PestanaAnimales />\n      </Activity>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nh2 {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 1.1rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4d7c0f;\n  color: white;\n}\n\n.panel {\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #bef264;\n  border-radius: 8px;\n  background: #f7fee7;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.6rem;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "animales": [
      {
        "id": 1,
        "nombre": "Margarita",
        "especie": "vaca frisona"
      },
      {
        "id": 2,
        "nombre": "Pepa",
        "especie": "cabra murciana"
      },
      {
        "id": 3,
        "nombre": "Canela",
        "especie": "burra zamorano-leonesa"
      },
      {
        "id": 4,
        "nombre": "Trufa",
        "especie": "cerda ibérica"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Mientras la lista llega, el `<Suspense>` de la pestaña escondida enseña su fallback, pero escondido también: nadie lo ve. Si pulsas «Animales» antes de que termine la petición, entonces sí verás «Cargando animales…», solo durante lo que falte.

Lo que React no hace con lo escondido es **ejecutar efectos**. Si `ListaAnimales` pidiera los datos en un `useEffect`, como en la lección 38, la petición no saldría hasta abrir la pestaña. react.dev lo dice expresamente: al preparar contenido oculto solo se piden los datos que activan un límite de Suspense, como una promesa leída con `use`; **Activity no detecta los datos que se piden dentro de un efecto**.

Hay un uso más que no se ve en la vista previa, porque necesita un servidor: al hidratar una página renderizada en el servidor (lección 87), los límites de Activity, como los de Suspense, dejan que React haga interactiva cada parte por separado, sin esperar a las demás. react.dev llega a proponer un `<Activity>` siempre visible solo para eso.

## Lo que sigue vivo en el DOM: un `<video>`

Activity no destruye los elementos del DOM, y eso tiene una consecuencia que no existe al desmontar: **lo que un elemento hace por su cuenta lo sigue haciendo escondido**. El caso típico es un `<video>`. Si lo quitas del DOM, el navegador lo pausa; si solo lo escondes, sigue reproduciéndose, y sonando si tiene sonido, sin que nadie lo vea. Lo mismo pasa con un `<audio>` o con un `<iframe>`.

La vista previa no puede cargar vídeos de internet, así que la cámara de la incubadora es una señal en directo simulada: `senal.jsx` dibuja un huevo que se balancea y lo convierte en vídeo. El indicador «Cámara:» está fuera del Activity y escucha los eventos `onPlaying` y `onPause` del vídeo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La cámara de la incubadora, escondida",
  "consigna": "Pulsa «Ocultar la cámara»: el indicador sigue diciendo «emitiendo», porque el vídeo se reproduce escondido. Ve a Incubadora.jsx, quita el // de la limpieza y repite: al ocultar pasa a «en pausa», y al mostrar vuelve a «emitiendo».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Activity, useState } from 'react'\nimport Incubadora from './Incubadora'\nimport './estilos.css'\n\nexport default function App() {\n  const [visible, setVisible] = useState(true)\n  const [estado, setEstado] = useState('conectando')\n\n  return (\n    <main>\n      <h1>Granja Escuela Los Chopos</h1>\n      <button onClick={() => setVisible(!visible)}>\n        {visible ? 'Ocultar la cámara' : 'Mostrar la cámara'}\n      </button>\n      <p className=\"estado\">Cámara: {estado}</p>\n      <Activity mode={visible ? 'visible' : 'hidden'}>\n        <Incubadora onCambiarEstado={setEstado} />\n      </Activity>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Incubadora.jsx",
      "codigo": "import { useLayoutEffect, useRef } from 'react'\nimport { crearSenal } from './senal'\n\nconst senal = crearSenal()\n\nexport default function Incubadora({ onCambiarEstado }) {\n  const videoRef = useRef(null)\n\n  useLayoutEffect(() => {\n    const video = videoRef.current\n    if (!senal) return\n    video.srcObject = senal\n    video.play()\n    // return () => video.pause()\n  }, [])\n\n  if (!senal) return <p>Tu navegador no puede simular la cámara.</p>\n\n  return (\n    <video\n      ref={videoRef}\n      muted\n      playsInline\n      width=\"160\"\n      height=\"90\"\n      aria-label=\"Cámara de la incubadora\"\n      onPlaying={() => onCambiarEstado('emitiendo')}\n      onPause={() => onCambiarEstado('en pausa')}\n    />\n  )\n}\n"
    },
    {
      "nombre": "senal.jsx",
      "codigo": "// Simula la señal de la cámara: dibuja un huevo que se balancea en un\n// canvas y lo convierte en vídeo en directo. No hace falta que lo entiendas.\nexport function crearSenal() {\n  const lienzo = document.createElement('canvas')\n  if (typeof lienzo.captureStream !== 'function') return null\n  lienzo.width = 160\n  lienzo.height = 90\n  const ctx = lienzo.getContext('2d')\n  let fotograma = 0\n  setInterval(() => {\n    fotograma += 1\n    ctx.fillStyle = '#fef3c7'\n    ctx.fillRect(0, 0, 160, 90)\n    ctx.fillStyle = '#d97706'\n    ctx.beginPath()\n    ctx.ellipse(80, 48, 18, 24, Math.sin(fotograma / 4) * 0.3, 0, Math.PI * 2)\n    ctx.fill()\n  }, 100)\n  return lienzo.captureStream(10)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.estado {\n  font-weight: 600;\n}\n\nvideo {\n  border-radius: 6px;\n  background: #1c1917;\n}\n"
    }
  ],
  "archivoInicial": "Incubadora.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Con la limpieza, el vídeo se comporta como el resto de la pestaña: al esconderla, React ejecuta la limpieza y lo pausa; al mostrarla, vuelve a ejecutar el efecto y lo reproduce. Es el arreglo que propone react.dev:

```jsx
useLayoutEffect(() => {
  const video = videoRef.current
  // ...
  return () => video.pause()
}, [])
```

¿Por qué `useLayoutEffect` y no `useEffect`? Según react.dev, porque pausar va unido a que el elemento deje de verse, que es terreno de los efectos de layout (lección 45). La limpieza de un efecto normal podría retrasarse, por ejemplo mientras un `<Suspense>` vuelve a esperar o mientras corre una animación de `<ViewTransition>` (lección 55), y el vídeo seguiría sonando ese rato.

Con un vídeo de verdad, no un directo, hay un premio: como el elemento no se destruye, al volver sigue por el segundo en que lo dejaste y el navegador no tiene que descargarlo otra vez. Con `{visible && <Video />}`, en cambio, no haría falta ninguna limpieza para pararlo, pero cada vez empezaría desde el principio.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Activity solo apaga efectos",
  "contenido": "Todo lo que no arranca en un efecto sigue funcionando a escondidas: un vídeo, un audio, un iframe, o un setInterval que pones en marcha desde un onClick. Si algo tiene que pararse cuando la pestaña no se ve, haz que arranque en un efecto y que su limpieza lo pare."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Pestañas a las que el usuario vuelve",
      "texto": "Formularios a medias, filtros elegidos, desplegables abiertos, el punto de un vídeo. Es el ejemplo de la lección y el más habitual."
    },
    {
      "titulo": "Paneles que se abren y se cierran",
      "texto": "Un menú lateral, un cajón de filtros o un chat flotante: al cerrarlos no deberían olvidar lo que tenían."
    },
    {
      "titulo": "Preparar lo siguiente",
      "texto": "La pestaña o la pantalla a la que el usuario probablemente irá después, con sus datos ya pedidos, para que aparezca sin esperas."
    },
    {
      "titulo": "Animar la entrada y la salida",
      "texto": "Un Activity dentro de un ViewTransition anima al mostrarse y al esconderse dentro de una transición, sin perder el estado. Lo verás en la lección 55, y el proyecto 97 lo usa en una galería."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Contenido al que el usuario no va a volver, o mucho contenido pesado escondido a la vez: sigue ocupando memoria y renderizándose cuando cambian sus props. Si empezar de cero no molesta, quitarlo del árbol es más barato."
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
      "mito": "Un Activity oculto está desmontado",
      "realidad": "Para sus efectos, sí: se limpian como al desmontar. Pero el estado y el DOM siguen ahí, y al volver no se monta nada nuevo."
    },
    {
      "mito": "Activity es un display: none con otro nombre",
      "realidad": "El display: none es solo la parte que se ve. Lo que lo distingue de esconder a mano es que apaga los efectos y deja los renders de lo escondido para después."
    },
    {
      "mito": "Lo escondido no gasta nada",
      "realidad": "Sigue en memoria y se vuelve a renderizar cuando cambian sus props, aunque después de lo visible. Lo que deja de hacer es ejecutar efectos."
    },
    {
      "mito": "Al esconder, React para todo lo que hay dentro",
      "realidad": "Solo los efectos. Un vídeo, un audio o un intervalo arrancado desde un manejador siguen funcionando: para pararlos, hace falta una limpieza."
    },
    {
      "mito": "Activity precarga cualquier dato de lo escondido",
      "realidad": "Solo los que se leen de una forma que activa Suspense, como use con una promesa guardada. Lo que se pide en un efecto espera a que la pestaña se vea."
    }
  ]
}
```

## Errores típicos

**Pasar un booleano a `mode`.** `mode` es un texto, `'visible'` o `'hidden'`. Con `mode={visible}` no hay aviso ni error, pero **un `false` no esconde nada**: React solo esconde con `'hidden'` exacto y trata cualquier otro valor como visible. Una errata como `'oculto'` tampoco avisa.

```jsx
// 🚩 Con visible a false, no se esconde nunca
<Activity mode={visible}>

// ✅
<Activity mode={visible ? 'visible' : 'hidden'}>
```

**Un efecto sin limpieza.** Con un condicional, un efecto que no limpia deja algo colgado al desmontar, pero el componente desaparece y a veces no se nota. Con Activity, cada vez que escondes y muestras, el efecto se ejecuta otra vez:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Camara() {\n  const [imagenes, setImagenes] = useState(0)\n\n  useEffect(() => {\n    setInterval(() => setImagenes((n) => n + 1), 1000)\n    // sin limpieza\n  }, [])\n\n  return <p>Imágenes: {imagenes}</p>\n}\n\n// Sin StrictMode. Camara va dentro de un <Activity>.\n// La escondes, la vuelves a mostrar y miras el contador.\n// ¿A qué ritmo sube ahora?",
  "opciones": [
    "Una imagen por segundo, como antes",
    "Dos imágenes por segundo",
    "No sube: el intervalo se paró al esconderla",
    "Vuelve a 0 y sube de una en una"
  ],
  "correcta": 1,
  "explicacion": "Al esconderla, React ejecuta la limpieza del efecto, pero no hay ninguna: el primer intervalo sigue sumando a escondidas. Al mostrarla, el efecto se ejecuta otra vez y arranca un segundo intervalo. Cada vez que la escondas y la muestres, uno más. Con StrictMode lo habrías visto desde el principio, porque el montaje doble ya arranca dos. El arreglo es el de siempre: devolver () => clearInterval(id)."
}
```

**Esconder un vídeo, un audio o un iframe sin pararlo.** Desmontándolo, el navegador lo paraba solo; escondiéndolo, no. Añade un `useLayoutEffect` con una limpieza que lo pause.

**Pedir los datos de una pestaña escondida en un efecto y esperar que lleguen antes.** Los efectos de lo escondido no se ejecutan. Para que una pestaña se prepare de antemano, sus datos tienen que leerse con Suspense.

**Usar Activity para todo lo que se oculta.** Un aviso que se cierra para siempre, el paso de un asistente que ya no vuelve o una lista enorme que solo se mira una vez no necesitan conservar nada. Escondidos, siguen ocupando memoria y renderizándose; con un condicional, desaparecen.

## Ejercicios

Los monitores de Los Chopos tienen su propio panel con tres pestañas: «Ronda de comida», donde marcan los animales a los que ya han dado de comer; «Parte del día», donde escriben las incidencias; y «Grupos». Ahora mismo, cambiar de pestaña borra la ronda y el parte.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El panel de monitores no olvida",
  "consigna": "Marca un par de animales, ve a «Parte del día», escribe algo y vuelve a «Ronda de comida»: se ha borrado todo. Cambia App.jsx para que cada pestaña se esconda sin desmontarse, sin tocar RondaComida.jsx ni ParteDia.jsx. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport RondaComida from './RondaComida'\nimport ParteDia from './ParteDia'\nimport './estilos.css'\n\nconst PESTANAS = [\n  { id: 'ronda', nombre: 'Ronda de comida' },\n  { id: 'parte', nombre: 'Parte del día' },\n  { id: 'grupos', nombre: 'Grupos' },\n]\n\nfunction Grupos() {\n  return (\n    <section className=\"panel\">\n      <h2>Grupos de hoy</h2>\n      <ul>\n        <li>10:00 · Colegio Miguel Hernández, 2.º B</li>\n        <li>12:30 · Familias del taller de queso</li>\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('ronda')\n\n  return (\n    <main>\n      <h1>Los Chopos · Panel de monitores</h1>\n      <nav aria-label=\"Secciones\">\n        {PESTANAS.map((p) => (\n          <button key={p.id} aria-pressed={p.id === pestana} onClick={() => setPestana(p.id)}>\n            {p.nombre}\n          </button>\n        ))}\n      </nav>\n      {/* Cambiar de pestaña borra la ronda y el parte: escóndelas sin desmontarlas */}\n      {pestana === 'ronda' && <RondaComida />}\n      {pestana === 'parte' && <ParteDia />}\n      {pestana === 'grupos' && <Grupos />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "RondaComida.jsx",
      "codigo": "import { useState } from 'react'\n\nconst ANIMALES = ['Margarita (vaca)', 'Pepa (cabra)', 'Las gallinas', 'Canela (burra)']\n\nexport default function RondaComida() {\n  const [hechos, setHechos] = useState([])\n\n  function alternar(animal) {\n    setHechos(hechos.includes(animal) ? hechos.filter((a) => a !== animal) : [...hechos, animal])\n  }\n\n  return (\n    <section className=\"panel\">\n      <h2>Ronda de comida</h2>\n      <p>\n        Alimentados: {hechos.length} de {ANIMALES.length}\n      </p>\n      <ul className=\"ronda\">\n        {ANIMALES.map((animal) => (\n          <li key={animal}>\n            <label className=\"casilla\">\n              <input\n                type=\"checkbox\"\n                checked={hechos.includes(animal)}\n                onChange={() => alternar(animal)}\n              />\n              {animal}\n            </label>\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "ParteDia.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ParteDia() {\n  const [notas, setNotas] = useState('')\n\n  return (\n    <section className=\"panel\">\n      <h2>Parte del día</h2>\n      <label>\n        Notas del parte\n        <textarea rows=\"4\" value={notas} onChange={(e) => setNotas(e.target.value)} />\n      </label>\n      <p>{notas.length} caracteres</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nh2 {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 1.1rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.3rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #4d7c0f;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4d7c0f;\n  color: white;\n}\n\n.panel {\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #bef264;\n  border-radius: 8px;\n  background: #f7fee7;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.6rem;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n.ronda {\n  padding: 0;\n  list-style: none;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al empezar se ve la ronda de comida",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Ronda de comida"
      }
    },
    {
      "descripcion": "Al empezar, las otras dos pestañas no se ven",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "heading",
          "nombre": "Grupos de hoy"
        }
      }
    },
    {
      "descripcion": "Al pasar a «Grupos», la ronda de comida deja de verse",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Grupos"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "heading",
          "nombre": "Ronda de comida"
        }
      }
    },
    {
      "descripcion": "Lo marcado en la ronda sigue marcado al ir a «Parte del día» y volver",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Margarita (vaca)"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Las gallinas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Parte del día"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ronda de comida"
          }
        }
      ],
      "espera": {
        "texto": "Alimentados: 2 de 4"
      }
    },
    {
      "descripcion": "Lo escrito en el parte sigue ahí al ir a «Grupos» y volver",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Parte del día"
          }
        },
        {
          "escribir": {
            "etiqueta": "Notas del parte",
            "texto": "Pepa cojea de la pata trasera"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Grupos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Parte del día"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas del parte",
        "valor": "Pepa cojea de la pata trasera"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade al panel de monitores una pestaña «Cámaras» con la `Camara` de la lección. Comprueba en la consola que se desconecta al cambiar de pestaña y se vuelve a conectar al volver, y que su contador de imágenes no ha seguido subiendo mientras tanto.
2. En la cámara de la incubadora, cambia `useLayoutEffect` por `useEffect` y comprueba que en este ejemplo funciona igual. Después, escribe en un comentario por qué react.dev prefiere el de layout para pausar un vídeo.
3. En tu propio proyecto con Vite, monta la pestaña «Animales» de la lección pidiendo los datos en un `useEffect` y después con `use` y una caché. Mira en la pestaña Red de las herramientas del navegador cuándo sale la petición en cada caso con la pestaña escondida.
4. Convierte las pestañas del panel en pestañas accesibles, con `role="tablist"`, `role="tab"`, `aria-selected` y `role="tabpanel"` (lección 37). ¿Hace falta `hidden` en los paneles escondidos, o basta con el `display: none` de Activity?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<Activity>",
      "descripcion": "La referencia: props, restaurar el estado y el DOM de lo escondido, prerenderizar, la hidratación por partes y los problemas con vídeos y efectos que no se ejecutan.",
      "url": "https://react.dev/reference/react/Activity",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19.2",
      "descripcion": "El anuncio de la versión que trajo Activity, junto con useEffectEvent y las Performance tracks.",
      "url": "https://react.dev/blog/2025/10/01/react-19-2",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "La lección 26: por qué el estado va unido a la posición en el árbol y qué se pierde al desmontar.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<StrictMode>",
      "descripcion": "Qué repite StrictMode en desarrollo para destapar efectos sin limpieza, que es justo lo que Activity necesita de tus efectos.",
      "url": "https://react.dev/reference/react/StrictMode",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<ViewTransition>",
      "descripcion": "La lección 55: animar un Activity cuando se muestra y cuando se esconde.",
      "url": "https://react.dev/reference/react/ViewTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<video>",
      "descripcion": "El elemento de vídeo de HTML, sus atributos y los eventos que usa la cámara de la incubadora (playing y pause).",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video",
      "etiqueta": "MDN"
    }
  ]
}
```
