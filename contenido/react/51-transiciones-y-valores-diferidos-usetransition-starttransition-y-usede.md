# Transiciones y valores diferidos: `useTransition`, `startTransition` y `useDeferredValue`

- **Módulo:** Asincronía y concurrencia
- **Slug:** `transiciones-y-valores-diferidos-usetransition-starttransition-y-usedeferredvalue` (autogenerado del título)
- **Orden:** 510
- **Fuentes:** [useTransition](https://react.dev/reference/react/useTransition) + [startTransition](https://react.dev/reference/react/startTransition) + [useDeferredValue](https://react.dev/reference/react/useDeferredValue) — ver `contenido/react/TEMARIO.md` #51

---

## Qué es y para qué sirve

No todas las actualizaciones son igual de urgentes. Cuando escribes una letra en un campo, esperas verla **en el acto**: si tarda un cuarto de segundo, la página parece rota. Cuando esa letra cambia una lista de 150 resultados, en cambio, nadie nota que la lista llegue un poco después, siempre que el campo responda.

Por defecto, React trata **todas las actualizaciones como urgentes**, y un render que ha empezado lo termina. Si la lista tarda 300 ms en pintarse, la letra que acabas de escribir espera esos 300 ms para salir en el campo. Desde React 18, puedes decirle qué actualizaciones **pueden esperar**: React las prepara en segundo plano, las abandona a medias si llega algo urgente y, mientras tanto, sigue enseñando la pantalla de antes. A esas actualizaciones se las llama **transiciones**.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos tipos de actualización",
  "roles": [
    {
      "etiqueta": "Urgente",
      "rol": "Lo que el usuario acaba de hacer",
      "descripcion": "Escribir, pulsar, marcar una casilla. Tiene que reflejarse en el acto. Es lo que hace React por defecto con cualquier set."
    },
    {
      "etiqueta": "Transición",
      "rol": "Lo que esa acción provoca",
      "descripcion": "Filtrar una lista larga, abrir otra pestaña, enseñar unos resultados nuevos. Puede llegar un poco después, se puede interrumpir y no esconde lo que ya se ve."
    }
  ]
}
```

Para marcarlas hay tres herramientas, y la lección va de cuándo usar cada una:

- **`useDeferredValue(valor)`**: cuando solo tienes un valor (una prop, lo que devuelve un Hook) y quieres que una parte de la interfaz vaya por detrás de él.
- **`useTransition()`**: cuando tienes el `set` y quieres saber si la transición sigue en marcha (`isPending`).
- **`startTransition(función)`**: lo mismo sin `isPending`, y se puede llamar fuera de los componentes.

## El problema: cada letra espera a la lista

La mercería **Lanas El Ovillo** tiene un muestrario con 150 referencias de lana. Al escribir en el buscador, se resaltan las que coinciden. Cada muestra tarda 1 ms en pintarse, a propósito, como si dibujara la textura del ovillo; con el doble render de `StrictMode` (lección 12), la lista entera tarda unos 300 ms.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un muestrario que bloquea el buscador",
  "consigna": "Escribe deprisa «verde musgo» en el buscador. Las letras salen a trompicones: cada pulsación espera a que se vuelvan a pintar las 150 muestras.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaOvillos from './ListaOvillos'\nimport './estilos.css'\n\nexport default function App() {\n  const [filtro, setFiltro] = useState('')\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <label>\n        Buscar color o fibra\n        <input value={filtro} onChange={(evento) => setFiltro(evento.target.value)} />\n      </label>\n      <ListaOvillos filtro={filtro} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaOvillos.jsx",
      "codigo": "import { OVILLOS } from './ovillos'\n\nfunction Muestra({ nombre, resaltada }) {\n  // Lenta a propósito: 1 ms por muestra, como si dibujara la textura\n  const inicio = performance.now()\n  while (performance.now() - inicio < 1) {\n    // esperar sin hacer nada\n  }\n  return <li className={resaltada ? 'muestra resaltada' : 'muestra'}>{nombre}</li>\n}\n\nexport default function ListaOvillos({ filtro }) {\n  const texto = filtro.trim().toLowerCase()\n\n  return (\n    <ul className=\"muestrario\">\n      {OVILLOS.map((nombre) => (\n        <Muestra key={nombre} nombre={nombre} resaltada={texto !== '' && nombre.includes(texto)} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "ovillos.jsx",
      "codigo": "const FIBRAS = ['merino', 'algodón', 'alpaca', 'mohair', 'lino']\nconst COLORES = [\n  'rojo amapola', 'azul marino', 'verde musgo', 'mostaza', 'gris perla',\n  'rosa palo', 'burdeos', 'turquesa', 'crudo', 'negro',\n]\n\n// 150 referencias: cada fibra, en cada color, en tres grosores\nexport const OVILLOS = FIBRAS.flatMap((fibra) =>\n  COLORES.flatMap((color) => [3, 5, 8].map((mm) => `${fibra} ${color} · ${mm} mm`)),\n)\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

El campo y la lista dependen del mismo estado, `filtro`, y cada `setFiltro` es urgente: React no puede enseñar la letra nueva en el campo sin pintar antes la lista entera con ella. Lo que haría falta es **separarlos**: el campo, con el valor de ahora; la lista, con el valor de hace un momento, hasta que le dé tiempo.

## `useDeferredValue`: una parte de la interfaz va por detrás

`useDeferredValue(valor)` devuelve una versión **diferida** del valor. Cuando el valor cambia, React hace primero un render con el valor **de antes** y, nada más terminarlo, empieza **en segundo plano** otro render con el nuevo. Ese segundo render es interrumpible: si escribes otra letra antes de que termine, React lo abandona y empieza otro con el valor más reciente.

Este es el muestrario arreglado. `StrictMode` está apagado en este bloque para que la consola enseñe cada render una sola vez:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El buscador va al momento; el muestrario, detrás",
  "codigo": "import { memo, useDeferredValue, useState } from 'react'\n\nconst FIBRAS = ['merino', 'algodón', 'alpaca', 'mohair', 'lino']\nconst COLORES = ['rojo amapola', 'azul marino', 'verde musgo', 'mostaza', 'gris perla',\n  'rosa palo', 'burdeos', 'turquesa', 'crudo', 'negro']\nconst OVILLOS = FIBRAS.flatMap((fibra) =>\n  COLORES.flatMap((color) => [3, 5, 8].map((mm) => `${fibra} ${color} · ${mm} mm`)),\n)\n\nfunction Muestra({ nombre, resaltada }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 1) {\n    // 1 ms por muestra, a propósito\n  }\n  return <li className={resaltada ? 'muestra resaltada' : 'muestra'}>{nombre}</li>\n}\n\nconst ListaOvillos = memo(function ListaOvillos({ filtro }) {\n  console.log(`ListaOvillos pinta «${filtro}»`)\n  const texto = filtro.trim().toLowerCase()\n  return (\n    <ul className=\"muestrario\">\n      {OVILLOS.map((nombre) => (\n        <Muestra key={nombre} nombre={nombre} resaltada={texto !== '' && nombre.includes(texto)} />\n      ))}\n    </ul>\n  )\n})\n\nexport default function App() {\n  const [filtro, setFiltro] = useState('')\n  const filtroDiferido = useDeferredValue(filtro)\n  const atrasada = filtro !== filtroDiferido\n  console.log(`App · filtro «${filtro}» · diferido «${filtroDiferido}»`)\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <label>\n        Buscar color o fibra\n        <input value={filtro} onChange={(evento) => setFiltro(evento.target.value)} />\n      </label>\n      <p className=\"estado\" role=\"status\">{atrasada ? 'Actualizando el muestrario…' : ''}</p>\n      <div className={atrasada ? 'atenuado' : ''}>\n        <ListaOvillos filtro={filtroDiferido} />\n      </div>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}",
  "anotaciones": [
    {
      "fragmento": "const filtroDiferido = useDeferredValue(filtro)",
      "nota": "En el primer render, filtroDiferido vale lo mismo que filtro. Cuando filtro cambia, este render devuelve el valor viejo y React programa otro, en segundo plano, en el que ya devuelve el nuevo."
    },
    {
      "fragmento": "<input value={filtro}",
      "nota": "El campo usa el estado de verdad, que cambia con cada letra en una actualización urgente. Nunca espera a la lista."
    },
    {
      "fragmento": "<ListaOvillos filtro={filtroDiferido} />",
      "nota": "La lista recibe el valor diferido: en el render urgente, el de antes; en el de segundo plano, el nuevo."
    },
    {
      "fragmento": "const ListaOvillos = memo(function ListaOvillos",
      "nota": "Imprescindible. En el render urgente, la lista recibe el mismo filtro que la vez anterior, y memo le deja saltarse el render. Sin memo se pintaría igual, lenta, con el valor viejo. memo tiene su lección, la 67."
    },
    {
      "fragmento": "const atrasada = filtro !== filtroDiferido",
      "nota": "Mientras los dos valores no coinciden, la lista enseña resultados de otra búsqueda. Es la forma de saberlo para avisar."
    },
    {
      "fragmento": "{atrasada ? 'Actualizando el muestrario…' : ''}",
      "nota": "El aviso, en una región role=status que siempre está en la página, para que un lector de pantalla lo anuncie (lección 37). Y la lista se atenúa con la clase atenuado."
    }
  ],
  "strictMode": false,
  "mostrarConsola": true
}
```

Escribe una sola letra, por ejemplo una «m», y mira la consola, que separa con una raya lo que se imprime después de cada commit:

```text
App · filtro «» · diferido «»
ListaOvillos pinta «»
─────────── commit 1 ───────────
App · filtro «m» · diferido «»
─────────── commit 2 ───────────
App · filtro «m» · diferido «m»
ListaOvillos pinta «m»
```

Las dos primeras líneas son el montaje. Después, la «m» provoca **dos renders, cada uno con su commit**.

En el primero, el urgente, `App` ya tiene la «m» en el campo, pero `filtroDiferido` sigue vacío y `ListaOvillos` ni se ejecuta: `memo` ve el mismo filtro de antes. En el segundo, el de segundo plano, el valor diferido alcanza al de verdad y la lista se pinta. Escribe ahora deprisa «verde musgo»: **el campo ya no se atasca**, la lista se atenúa mientras va por detrás y se pone al día cuando paras.

Que el valor vaya «por detrás» suena a temporizador, pero no lo es:

```laboratorio
{
  "tipo": "mitos",
  "titulo": "Lo que useDeferredValue no hace",
  "mitos": [
    {
      "mito": "Espera un tiempo fijo, como un debounce",
      "realidad": "No hay ningún retraso fijo. React empieza el render en segundo plano en cuanto termina el urgente: en un ordenador rápido, ni se nota; en un móvil lento, la lista va más por detrás. Y a diferencia de un debounce, el render se puede interrumpir."
    },
    {
      "mito": "Hace que la lista se pinte más deprisa",
      "realidad": "La lista tarda lo mismo. Lo que cambia es la prioridad: el campo ya no espera por ella. Para que pintar sea más rápido hay que hacer menos trabajo (lección 67, y la virtualización del proyecto 94)."
    },
    {
      "mito": "Ahorra peticiones al servidor",
      "realidad": "Si cada valor provoca una petición, se siguen haciendo todas. Para pedir menos, un debounce sí es la herramienta: se pueden usar juntos."
    },
    {
      "mito": "Basta con useDeferredValue, sin memo",
      "realidad": "Sin memo, el render urgente vuelve a pintar la lista entera con el valor viejo, y el campo vuelve a atascarse. Lo verás en Errores típicos."
    }
  ]
}
```

### Con `<Suspense>`: los resultados de antes mientras llegan los nuevos

La lección 48 dejó un problema apuntado: si un buscador lee sus resultados con `use` y el texto es estado normal, **cada letra es una actualización urgente** que se suspende y esconde la lista tras el fallback. `useDeferredValue` lo arregla sin tocar los resultados: el render urgente usa el texto viejo, cuya promesa ya está resuelta, y el de segundo plano, el que se suspende, no esconde nada. **Mientras no esté listo, se sigue viendo la lista anterior.**

El buscador de patrones de la tienda lee cada búsqueda con una caché como la de `leer` en la lección 48, y la API simulada tarda un segundo. La casilla elige qué texto recibe la lista:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Buscar patrones sin que la lista desaparezca",
  "codigo": "import { Suspense, use, useDeferredValue, useState } from 'react'\n\n// Una promesa por búsqueda, guardada (lección 48)\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    cache.set(ruta, fetch(ruta).then((res) => res.json()))\n  }\n  return cache.get(ruta)\n}\n\nfunction Resultados({ texto }) {\n  const patrones = use(leer('/api/patrones?q=' + encodeURIComponent(texto)))\n  if (patrones.length === 0) {\n    return <p>Ningún patrón con «{texto}».</p>\n  }\n  return (\n    <ul>\n      {patrones.map((patron) => (\n        <li key={patron.id}>\n          {patron.nombre} · {patron.fibra} · nivel {patron.nivel}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [texto, setTexto] = useState('merino')\n  const [diferir, setDiferir] = useState(true)\n  const textoDiferido = useDeferredValue(texto)\n  const textoLista = diferir ? textoDiferido : texto\n  const atrasada = texto !== textoLista\n\n  return (\n    <main>\n      <h1>Patrones de Lanas El Ovillo</h1>\n      <label>\n        Fibra, nivel o prenda\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <label>\n        <input type=\"checkbox\" checked={diferir} onChange={(evento) => setDiferir(evento.target.checked)} />\n        Diferir la lista\n      </label>\n      <p className=\"estado\" role=\"status\">{atrasada ? 'Actualizando la lista…' : ''}</p>\n      <Suspense fallback={<p className=\"cargando\">Buscando patrones…</p>}>\n        <div className={atrasada ? 'atenuado' : ''}>\n          <Resultados texto={textoLista} />\n        </div>\n      </Suspense>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}",
  "anotaciones": [
    {
      "fragmento": "const patrones = use(leer('/api/patrones?q=' + encodeURIComponent(texto)))",
      "nota": "Resultados se suspende hasta que llega la búsqueda de su texto. Cada texto tiene su promesa en la caché, así que volver a uno ya buscado es instantáneo."
    },
    {
      "fragmento": "const textoDiferido = useDeferredValue(texto)",
      "nota": "En el render urgente vale el texto anterior, cuya promesa ya terminó: Resultados no se suspende y la lista vieja sigue ahí. El render en segundo plano, con el texto nuevo, sí se suspende, pero no esconde nada: React espera a que llegue la respuesta para enseñarlo."
    },
    {
      "fragmento": "const textoLista = diferir ? textoDiferido : texto",
      "nota": "Solo para comparar. useDeferredValue se llama siempre, en el mismo orden (lección 44); la casilla decide qué valor usa la lista."
    },
    {
      "fragmento": "const atrasada = texto !== textoLista",
      "nota": "Mientras la lista enseña resultados de otra búsqueda, se atenúa y el aviso lo dice."
    },
    {
      "fragmento": "<Suspense fallback={<p className=\"cargando\">Buscando patrones…</p>}>",
      "nota": "Con la casilla marcada, este fallback solo se ve en la primera carga, cuando no hay ninguna lista de antes que enseñar."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "patrones": [
      {
        "id": 1,
        "nombre": "Jersey de ochos",
        "fibra": "merino",
        "nivel": "avanzado"
      },
      {
        "id": 2,
        "nombre": "Bufanda de punto bobo",
        "fibra": "alpaca",
        "nivel": "principiante"
      },
      {
        "id": 3,
        "nombre": "Gorro con pompón",
        "fibra": "merino",
        "nivel": "principiante"
      },
      {
        "id": 4,
        "nombre": "Chal de encaje",
        "fibra": "mohair",
        "nivel": "avanzado"
      },
      {
        "id": 5,
        "nombre": "Calcetines de rayas",
        "fibra": "merino",
        "nivel": "intermedio"
      },
      {
        "id": 6,
        "nombre": "Manta de ganchillo",
        "fibra": "algodón",
        "nivel": "intermedio"
      },
      {
        "id": 7,
        "nombre": "Cuello de canalé",
        "fibra": "alpaca",
        "nivel": "principiante"
      }
    ]
  },
  "red": {
    "latencia": 1000
  }
}
```

Desmarca la casilla, borra el campo y escribe «alpaca»: con cada letra, la lista desaparece tras «Buscando patrones…». Márcala y repite: los resultados de merino se quedan, atenuados, hasta que llegan los nuevos. Lo comprobamos con la latencia a 600 ms: sin diferir, al cambiar de «merino» a «alpaca» la lista se escondió con `display: none` y salió el fallback; con el valor diferido, siguió a la vista con «Actualizando la lista…» hasta que llegó la respuesta.

Mira también el panel de red: **sigue habiendo una petición por letra**. Lo que se difiere es lo que se ve, no las peticiones, como decía la tabla de mitos.

### `initialValue`: también el primer render puede esperar

Sin segundo argumento, `useDeferredValue` no difiere nada en el primer render: no hay un valor «de antes» que enseñar. Con **`useDeferredValue(valor, valorInicial)`**, el primer render usa `valorInicial` y el valor de verdad llega en un render en segundo plano. Sirve para que un componente pesado aparezca primero con algo ligero. Aquí el muestrario tarda 300 ms en pintarse, de un tirón; pulsa «Abrir el muestrario» y mira el árbol de renders:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un muestrario que se abre con un aviso ligero",
  "codigo": "import { useDeferredValue, useState } from 'react'\n\nconst REFERENCIAS = ['merino rojo amapola', 'alpaca gris perla', 'mohair rosa palo', 'lino crudo']\n\nfunction ListaPesada({ referencias }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 300) {\n    // 300 ms de trabajo, a propósito\n  }\n  return (\n    <ul>\n      {referencias.map((nombre) => (\n        <li key={nombre}>{nombre}</li>\n      ))}\n    </ul>\n  )\n}\n\nfunction Muestrario() {\n  const referencias = useDeferredValue(REFERENCIAS, null)\n\n  if (referencias === null) {\n    return <p className=\"estado\">Preparando el muestrario…</p>\n  }\n  return <ListaPesada referencias={referencias} />\n}\n\nexport default function App() {\n  const [abierto, setAbierto] = useState(false)\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <button onClick={() => setAbierto(true)}>Abrir el muestrario</button>\n      {abierto && <Muestrario />}\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}",
  "anotaciones": [
    {
      "fragmento": "useDeferredValue(REFERENCIAS, null)",
      "nota": "Al montarse, Muestrario recibe null, el valor inicial, y pinta solo el aviso. Justo después, React repite el render en segundo plano con REFERENCIAS de verdad."
    },
    {
      "fragmento": "const REFERENCIAS = ['merino rojo amapola'",
      "nota": "Un array creado fuera del componente. Si lo crearas dentro, sería uno nuevo en cada render, distinto para Object.is, y cada render de Muestrario traería otro de propina en segundo plano."
    },
    {
      "fragmento": "return <p className=\"estado\">Preparando el muestrario…</p>",
      "nota": "Lo ligero: sale en cuanto pulsas, sin esperar a los 300 ms de la lista."
    },
    {
      "fragmento": "while (performance.now() - inicio < 300)",
      "nota": "Un solo componente lento. React solo puede ceder el paso entre un componente y el siguiente, así que estos 300 ms van de un tirón. Para que un render en segundo plano se pueda interrumpir de verdad, el trabajo tiene que estar repartido, como en las 150 muestras de antes."
    }
  ],
  "strictMode": false,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

En el árbol verás el reparto: en un commit, `App` se renderiza («cambió su estado») y `Muestrario` se monta con el aviso; en el siguiente, `App` sale sin cambios y `Muestrario` se vuelve a renderizar con «cambió otro de sus ganchos». Ese gancho es `useDeferredValue`, que ya devuelve el array de verdad, y `ListaPesada` se monta.

## `useTransition`: marca tú qué actualización puede esperar

`useDeferredValue` sirve cuando solo tienes el valor. Si el cambio lo provocas tú, con un `set`, puedes marcar directamente **esa actualización** como transición:

```jsx
const [isPending, startTransition] = useTransition()

function elegir(id) {
  startTransition(() => {
    setPestana(id)
  })
}
```

`useTransition` no recibe nada y devuelve dos cosas:

- **`startTransition(función)`**: llama a tu función **en el acto**, y todos los `set` que se ejecuten durante esa llamada quedan marcados como transición.
- **`isPending`**: `true` desde que empiezas la transición hasta que su resultado está en pantalla. React lo pone a `true` con un render urgente, así que sirve para dar respuesta inmediata al clic.

La tienda tiene tres pestañas, y la del muestrario es lenta. Prueba primero sin transición y después con ella:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Pestañas con y sin transición",
  "consigna": "Sin marcar la casilla, pulsa «Muestrario (lento)» y enseguida «Talleres»: el segundo clic espera a que termine el muestrario. Marca «Usar transición» y repite: sale «Abriendo la pestaña…» al instante, y «Talleres» deja el muestrario a medias.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useTransition } from 'react'\nimport ListaOvillos from './ListaOvillos'\nimport './estilos.css'\n\nconst PESTANAS = [\n  { id: 'novedades', nombre: 'Novedades' },\n  { id: 'muestrario', nombre: 'Muestrario (lento)' },\n  { id: 'talleres', nombre: 'Talleres' },\n]\n\nexport default function App() {\n  const [pestana, setPestana] = useState('novedades')\n  const [conTransicion, setConTransicion] = useState(false)\n  const [isPending, startTransition] = useTransition()\n\n  function elegir(id) {\n    if (conTransicion) {\n      startTransition(() => {\n        setPestana(id)\n      })\n    } else {\n      setPestana(id)\n    }\n  }\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <label>\n        <input\n          type=\"checkbox\"\n          checked={conTransicion}\n          onChange={(evento) => setConTransicion(evento.target.checked)}\n        />\n        Usar transición\n      </label>\n      <nav aria-label=\"Secciones de la tienda\">\n        {PESTANAS.map((p) => (\n          <button key={p.id} aria-pressed={pestana === p.id} onClick={() => elegir(p.id)}>\n            {p.nombre}\n          </button>\n        ))}\n      </nav>\n      <p className=\"estado\" role=\"status\">{isPending ? 'Abriendo la pestaña…' : ''}</p>\n      <section className={isPending ? 'atenuado' : ''}>\n        {pestana === 'novedades' && <p>Llegan las lanas de otoño: alpaca, mohair y merino en doce colores nuevos.</p>}\n        {pestana === 'muestrario' && <ListaOvillos filtro=\"\" />}\n        {pestana === 'talleres' && <p>Taller de ganchillo para principiantes: los jueves a las 18:00.</p>}\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaOvillos.jsx",
      "codigo": "import { OVILLOS } from './ovillos'\n\nfunction Muestra({ nombre, resaltada }) {\n  // Lenta a propósito: 1 ms por muestra, como si dibujara la textura\n  const inicio = performance.now()\n  while (performance.now() - inicio < 1) {\n    // esperar sin hacer nada\n  }\n  return <li className={resaltada ? 'muestra resaltada' : 'muestra'}>{nombre}</li>\n}\n\nexport default function ListaOvillos({ filtro }) {\n  const texto = filtro.trim().toLowerCase()\n\n  return (\n    <ul className=\"muestrario\">\n      {OVILLOS.map((nombre) => (\n        <Muestra key={nombre} nombre={nombre} resaltada={texto !== '' && nombre.includes(texto)} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "ovillos.jsx",
      "codigo": "const FIBRAS = ['merino', 'algodón', 'alpaca', 'mohair', 'lino']\nconst COLORES = [\n  'rojo amapola', 'azul marino', 'verde musgo', 'mostaza', 'gris perla',\n  'rosa palo', 'burdeos', 'turquesa', 'crudo', 'negro',\n]\n\n// 150 referencias: cada fibra, en cada color, en tres grosores\nexport const OVILLOS = FIBRAS.flatMap((fibra) =>\n  COLORES.flatMap((color) => [3, 5, 8].map((mm) => `${fibra} ${color} · ${mm} mm`)),\n)\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Sin transición, el clic en «Muestrario» empieza un render urgente de 300 ms que nadie puede parar: el clic en «Talleres» se queda en la cola del navegador hasta que acaba. Lo medimos en Chromium con el build de producción de un ejemplo parecido, de 150 muestras de 2 ms: el segundo clic, hecho a los 60 ms, no se atendió hasta los 306 ms, después de pintar el muestrario entero. **Con transición**, React pinta enseguida el aviso, prepara el muestrario a ratos, cediendo el paso entre muestra y muestra, y atiende el clic en «Talleres» en cuanto llega: en la misma prueba, «Talleres» estaba en pantalla a los 71 ms y **el muestrario no llegó a pintarse**.

Fíjate también en lo que no cambia: el botón activo y el contenido siguen siendo los de «Novedades» hasta que el muestrario está listo. Durante una transición, **la pantalla de antes se queda a la vista**; `isPending` es lo que te deja decir que algo viene.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Desde React 19.3, cada transición va por su cuenta",
  "contenido": "Según la nota de la versión 19.3, hasta entonces las transiciones en marcha se renderizaban juntas, y una lenta retenía a las demás. Desde 19.3, una transición lenta ya no frena a otras que no tienen nada que ver. Lo comprobamos: con una pestaña esperando su descarga en una transición, un contador de visitas de otro componente, también en una transición, se actualizó al momento. La página de referencia de useTransition todavía describe el comportamiento antiguo."
}
```

## Transiciones y `<Suspense>`: no esconder lo que ya se ve

La lección 48 te adelantó que una transición evita que un `<Suspense>` que ya enseñaba algo vuelva a su fallback: **deja a la vista lo que había** y lo cambia de golpe cuando lo nuevo está listo. Aquí lo ves con una galería que se carga con `lazy` (lección 50), y con `isPending` para avisar mientras tanto. Cada botón usa su propio componente `lazy`, que se descarga solo la primera vez; para repetirlo, pulsa «Reiniciar».

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La galería, con y sin transición",
  "consigna": "Pulsa «Galería sin transición»: el horario desaparece tras «Cargando la pestaña…». Vuelve a «Horario» y pulsa «Galería con transición»: el horario sigue a la vista con el aviso «Abriendo la galería…» hasta que la galería está lista.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { lazy, Suspense, useState, useTransition } from 'react'\nimport './estilos.css'\n\n// En la vista previa no hay red: esperar() hace de descarga lenta.\nconst esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))\n\nconst GaleriaA = lazy(() => esperar(1500).then(() => import('./Galeria.jsx')))\nconst GaleriaB = lazy(() => esperar(1500).then(() => import('./Galeria.jsx')))\n\nexport default function App() {\n  const [pestana, setPestana] = useState('horario')\n  const [isPending, startTransition] = useTransition()\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <nav aria-label=\"Secciones de la tienda\">\n        <button onClick={() => setPestana('horario')}>Horario</button>\n        <button onClick={() => setPestana('galeria-a')}>Galería sin transición</button>\n        <button onClick={() => startTransition(() => setPestana('galeria-b'))}>\n          Galería con transición\n        </button>\n      </nav>\n      <p className=\"estado\" role=\"status\">{isPending ? 'Abriendo la galería…' : ''}</p>\n      <Suspense fallback={<p className=\"cargando\">Cargando la pestaña…</p>}>\n        {pestana === 'horario' && (\n          <section>\n            <h2>Horario de la tienda</h2>\n            <p>De lunes a sábado, de 10:00 a 14:00 y de 17:00 a 20:30.</p>\n          </section>\n        )}\n        {pestana === 'galeria-a' && <GaleriaA />}\n        {pestana === 'galeria-b' && <GaleriaB />}\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Galeria.jsx",
      "codigo": "export default function Galeria() {\n  return (\n    <section>\n      <h2>Galería de labores</h2>\n      <ul>\n        <li>Jersey de ochos en merino mostaza, de Carmen</li>\n        <li>Chal de encaje en mohair rosa palo, de Lucía</li>\n        <li>Manta de ganchillo en algodón crudo, de Paco</li>\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Con transición, el horario no se esconde y el aviso sale al instante: **sustituir algo que ya se ve por un fallback es un salto feo**, y una transición lo evita. Recuerda los dos matices de la lección 48: solo protege lo que ya estaba a la vista (lo comprobamos también aquí: con el `<Suspense>` dentro de la condición de la galería, la transición enseñó «Cargando…» igualmente, porque ese límite no existía antes del clic), y si lo que quieres es el fallback al pasar a otro contenido, cambia la `key` del límite.

## Transiciones con funciones `async`

Desde React 19, la función de `startTransition` puede ser **`async`**. La transición dura lo que dure la función: `isPending` está a `true` desde el clic hasta que la función termina y su resultado está en pantalla. Es justo lo que hace falta para una petición. Busca un patrón en el catálogo de la tienda (la API simulada tarda 1,2 s):

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Buscar patrones dentro de una transición",
  "codigo": "import { useState, useTransition } from 'react'\n\nexport default function App() {\n  const [busqueda, setBusqueda] = useState('merino')\n  const [patrones, setPatrones] = useState([])\n  const [isPending, startTransition] = useTransition()\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    startTransition(async () => {\n      const respuesta = await fetch('/api/patrones?q=' + encodeURIComponent(busqueda))\n      const datos = await respuesta.json()\n      startTransition(() => {\n        setPatrones(datos)\n      })\n    })\n  }\n\n  return (\n    <main>\n      <h1>Patrones de Lanas El Ovillo</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Fibra, nivel o prenda\n          <input type=\"search\" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />\n        </label>\n        <button>Buscar</button>\n      </form>\n      <p className=\"estado\" role=\"status\">{isPending ? 'Buscando…' : ''}</p>\n      <ul className={isPending ? 'atenuado' : ''}>\n        {patrones.map((patron) => (\n          <li key={patron.id}>\n            {patron.nombre} · {patron.fibra} · nivel {patron.nivel}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}",
  "anotaciones": [
    {
      "fragmento": "startTransition(async () => {",
      "nota": "Una función async: la transición, e isPending, duran hasta que la promesa termina. react.dev llama Action a la función que pasas a startTransition. Por convención, si un componente recibe por props una función que va a llamar dentro de una transición, la prop se llama action o termina en Action."
    },
    {
      "fragmento": "await fetch('/api/patrones?q=' + encodeURIComponent(busqueda))",
      "nota": "Mientras se espera, la interfaz sigue respondiendo: puedes seguir escribiendo en el campo. Y la lista de antes sigue a la vista, atenuada."
    },
    {
      "fragmento": "      startTransition(() => {\n        setPatrones(datos)\n      })",
      "nota": "Después de un await, React ya no sabe que sigues dentro de la transición: un set ahí sería urgente. Hay que volver a envolverlo. Es una limitación de JavaScript: react.dev dice que desaparecerá cuando el lenguaje tenga AsyncContext."
    },
    {
      "fragmento": "{isPending ? 'Buscando…' : ''}",
      "nota": "Sin estado de carga a mano: isPending se pone a true con el clic y vuelve a false cuando los patrones nuevos ya están pintados."
    },
    {
      "fragmento": "<form onSubmit={manejarEnvio}>",
      "nota": "En la lección 57 verás que <form action={…}> hace esto por ti: la función que le pasas se ejecuta dentro de una transición. useActionState (58) y useOptimistic (60) se apoyan en lo mismo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "patrones": [
      {
        "id": 1,
        "nombre": "Jersey de ochos",
        "fibra": "merino",
        "nivel": "avanzado"
      },
      {
        "id": 2,
        "nombre": "Bufanda de punto bobo",
        "fibra": "alpaca",
        "nivel": "principiante"
      },
      {
        "id": 3,
        "nombre": "Gorro con pompón",
        "fibra": "merino",
        "nivel": "principiante"
      },
      {
        "id": 4,
        "nombre": "Chal de encaje",
        "fibra": "mohair",
        "nivel": "avanzado"
      },
      {
        "id": 5,
        "nombre": "Calcetines de rayas",
        "fibra": "merino",
        "nivel": "intermedio"
      },
      {
        "id": 6,
        "nombre": "Manta de ganchillo",
        "fibra": "algodón",
        "nivel": "intermedio"
      },
      {
        "id": 7,
        "nombre": "Cuello de canalé",
        "fibra": "alpaca",
        "nivel": "principiante"
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

Pulsa «Buscar» con «merino» y después busca «alpaca»: mientras llega la respuesta, los patrones de merino siguen ahí, atenuados, con «Buscando…» encima. No hay un estado `cargando` que poner a `true` y a `false`: **`isPending` lo lleva React**.

Lo que una transición no arregla es el **orden de las respuestas**. Si haces dos búsquedas seguidas y la primera tarda más, su resultado llega el último y pisa al bueno:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [resultado, setResultado] = useState('nada')\nconst [isPending, startTransition] = useTransition()\n\nfunction buscar(texto, ms) {\n  startTransition(async () => {\n    await esperar(ms) // el servidor tarda ms milisegundos\n    startTransition(() => setResultado(texto))\n  })\n}\n\n// Pulsas «Jersey» (buscar('jersey', 600)) y, 200 ms después,\n// «Gorro» (buscar('gorro', 100)). La de gorro responde antes.\n// ¿Qué enseña la pantalla cuando isPending vuelve a false?",
  "opciones": [
    "resultado: gorro, la última búsqueda",
    "resultado: jersey, la respuesta que llegó la última",
    "resultado: nada, porque la segunda transición cancela la primera"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa: isPending se queda en true hasta que terminan las dos funciones, y entonces se aplican los dos set en el orden en que se llamaron, gorro y luego jersey. Gana jersey, aunque el campo diga gorro. Las transiciones no ordenan las respuestas: useActionState sí (lección 58), y el proyecto 56 lo arregla a mano."
}
```

Puedes provocarlo en el bloque de los patrones de arriba: activa «Responder desordenado» en el panel de red, busca «merino» y, sin esperar, «alpaca». La respuesta de alpaca llega primero, la de merino después, y la lista se queda con merino.

## `startTransition` a secas, también fuera de los componentes

`useTransition` es un Hook: solo se puede llamar dentro de un componente o de otro Hook. Para todo lo demás está **`startTransition`**, que se importa de `react` y funciona igual, pero **sin `isPending`**. Sirve en el código de una librería, en una función de un módulo o en un componente que no necesita enseñar nada mientras tanto. Por ejemplo, el escaparate de la tienda cambia de colección cada diez segundos con un temporizador escrito fuera de React:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// rotacion.js: un temporizador que no sabe nada de componentes\nimport { startTransition } from 'react'\n\nexport function rotarColecciones(colecciones, setColeccion) {\n  let indice = 0\n  const id = setInterval(() => {\n    indice = (indice + 1) % colecciones.length\n    startTransition(() => {\n      setColeccion(colecciones[indice])\n    })\n  }, 10_000)\n  return () => clearInterval(id)\n}\n\n// Escaparate.jsx\nimport { useEffect, useState } from 'react'\nimport { rotarColecciones } from './rotacion.js'\n\nconst COLECCIONES = ['Otoño en alpaca', 'Algodones de verano', 'Básicos de merino']\n\nexport default function Escaparate() {\n  const [coleccion, setColeccion] = useState(COLECCIONES[0])\n\n  useEffect(() => rotarColecciones(COLECCIONES, setColeccion), [])\n\n  return <FotosColeccion nombre={coleccion} />\n}",
  "anotaciones": [
    {
      "fragmento": "import { startTransition } from 'react'",
      "nota": "La función suelta, no el Hook. Se puede llamar desde cualquier sitio: un módulo, una librería de datos, un componente de clase (lección 91)."
    },
    {
      "fragmento": "    startTransition(() => {\n      setColeccion(colecciones[indice])\n    })",
      "nota": "El set va dentro de la llamada a startTransition, que a su vez va dentro del temporizador. Al revés, con el setInterval dentro de startTransition, el set sería urgente: lo verás en Errores típicos."
    },
    {
      "fragmento": "useEffect(() => rotarColecciones(COLECCIONES, setColeccion), [])",
      "nota": "El efecto arranca el temporizador y devuelve su limpieza, que es lo que devuelve rotarColecciones (lección 38)."
    },
    {
      "fragmento": "<FotosColeccion nombre={coleccion} />",
      "nota": "Pintar la colección nueva es lo pesado. En una transición, si alguien está escribiendo en el buscador justo entonces, sus letras van primero."
    }
  ]
}
```

Una diferencia más: si la función que pasas a `startTransition` lanza un error, la del Hook lo manda al *error boundary* del componente (lección 53); la suelta no está unida a ningún componente, así que React lo notifica con `reportError`, como cualquier error sin capturar del navegador.

## Cuál usar en cada caso

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Tienes el set y quieres un aviso: useTransition",
      "texto": "Cambiar de pestaña, navegar, buscar al pulsar un botón. isPending te deja atenuar lo viejo o decir que algo viene."
    },
    {
      "titulo": "Tienes el set, pero no estás en un componente: startTransition",
      "texto": "Un módulo, una librería, un temporizador. O un componente que no necesita isPending."
    },
    {
      "titulo": "Solo tienes el valor: useDeferredValue",
      "texto": "Una prop que te llega del padre o lo que devuelve un Hook ajeno: no puedes envolver su set, pero sí diferir el valor y pasar la versión diferida a la parte lenta."
    },
    {
      "titulo": "Un campo de texto: nunca su estado en una transición",
      "texto": "El valor del campo, urgente. Lo que se pinta a partir de él, diferido con useDeferredValue, o en un segundo estado que actualizas dentro de una transición."
    },
    {
      "titulo": "Lo que no arreglan",
      "texto": "No hacen más rápido un render lento (lección 67), no evitan peticiones (para eso, un debounce) ni ordenan las respuestas del servidor (lecciones 56 y 58)."
    }
  ]
}
```

## Errores típicos

**Meter en una transición el estado de un campo de texto.** Parece la forma directa de que el campo no espere a la lista, pero es justo al revés. Escribe deprisa «turquesa»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un campo cuyo estado va en una transición",
  "consigna": "Escribe «turquesa» a tu velocidad normal. ¿Qué queda en el campo? Después arréglalo: quita el startTransition del onChange y pásale a la lista un valor diferido con useDeferredValue, con memo en ListaOvillos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useTransition } from 'react'\nimport ListaOvillos from './ListaOvillos'\nimport './estilos.css'\n\nexport default function App() {\n  const [filtro, setFiltro] = useState('')\n  const [isPending, startTransition] = useTransition()\n\n  function manejarCambio(evento) {\n    // Mal: el estado que controla el campo, dentro de una transición\n    startTransition(() => {\n      setFiltro(evento.target.value)\n    })\n  }\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <label>\n        Buscar color o fibra\n        <input value={filtro} onChange={manejarCambio} />\n      </label>\n      <p className=\"estado\" role=\"status\">{isPending ? 'Actualizando el muestrario…' : ''}</p>\n      <ListaOvillos filtro={filtro} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaOvillos.jsx",
      "codigo": "import { OVILLOS } from './ovillos'\n\nfunction Muestra({ nombre, resaltada }) {\n  // Lenta a propósito: 1 ms por muestra, como si dibujara la textura\n  const inicio = performance.now()\n  while (performance.now() - inicio < 1) {\n    // esperar sin hacer nada\n  }\n  return <li className={resaltada ? 'muestra resaltada' : 'muestra'}>{nombre}</li>\n}\n\nexport default function ListaOvillos({ filtro }) {\n  const texto = filtro.trim().toLowerCase()\n\n  return (\n    <ul className=\"muestrario\">\n      {OVILLOS.map((nombre) => (\n        <Muestra key={nombre} nombre={nombre} resaltada={texto !== '' && nombre.includes(texto)} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "ovillos.jsx",
      "codigo": "const FIBRAS = ['merino', 'algodón', 'alpaca', 'mohair', 'lino']\nconst COLORES = [\n  'rojo amapola', 'azul marino', 'verde musgo', 'mostaza', 'gris perla',\n  'rosa palo', 'burdeos', 'turquesa', 'crudo', 'negro',\n]\n\n// 150 referencias: cada fibra, en cada color, en tres grosores\nexport const OVILLOS = FIBRAS.flatMap((fibra) =>\n  COLORES.flatMap((color) => [3, 5, 8].map((mm) => `${fibra} ${color} · ${mm} mm`)),\n)\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Un campo controlado tiene que enseñar su estado **en cuanto escribes**. Con el `set` en una transición, el estado todavía no ha cambiado cuando termina el evento, así que React devuelve el campo al valor de antes, y la letra siguiente se escribe encima de ese valor viejo. Lo comprobamos en Chromium con una lista que tarda 300 ms: tecleando «turquesa», con pausas de hasta 200 ms entre letra y letra, el campo acabó diciendo solo «a». La referencia de `useTransition` lo avisa: una actualización en transición no puede controlar un campo de texto. **El valor del campo, urgente; lo que se calcula a partir de él, diferido.**

**Poner el `set` en un `setTimeout` dentro de `startTransition`.** La función que le pasas se ejecuta en el acto: lo que queda marcado es lo que pasa *durante* esa llamada, no después.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Galeria es lazy y todavía no ha cargado. Un Suspense\n// rodea el panel, que ahora enseña el horario.\nfunction manejarClic() {\n  console.log(1)\n  startTransition(() => {\n    console.log(2)\n    setTimeout(() => {\n      setPestana('galeria')\n    }, 0)\n  })\n  console.log(3)\n}\n\n// ¿Qué sale en la consola y qué se ve al pulsar?",
  "opciones": [
    "1, 3, 2, y el horario sigue a la vista hasta que llega la galería",
    "1, 2, 3, y el horario sigue a la vista hasta que llega la galería",
    "1, 2, 3, y el fallback sustituye al horario",
    "1, 3, 2, y el fallback sustituye al horario"
  ],
  "correcta": 2,
  "explicacion": "startTransition no aplaza nada: llama a tu función en el acto, así que sale 1, 2, 3. Pero el set se ejecuta después, en el temporizador, cuando la transición ya terminó: es una actualización urgente, y el Suspense esconde el horario. Lo comprobamos en la vista previa. Lo correcto es al revés: startTransition dentro del setTimeout."
}
```

**Hacer un `set` después de un `await` sin volver a envolverlo.** Es el mismo problema con otra cara: tras el `await`, React ya no sabe que estás en la transición. En la prueba con la galería, `startTransition(async () => { await esperar(50); setPestana('galeria') })` enseñó el fallback, como sin transición; con `startTransition(() => setPestana('galeria'))` después del `await`, el horario se quedó a la vista.

**Usar `useDeferredValue` sin `memo` en la parte lenta.** Mira este muestrario:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function ListaOvillos({ filtro }) {\n  console.log(`ListaOvillos pinta «${filtro}»`)\n  // …150 muestras lentas\n}\n\nexport default function App() {\n  const [filtro, setFiltro] = useState('')\n  const filtroDiferido = useDeferredValue(filtro)\n\n  return (\n    <main>\n      <input value={filtro} onChange={(e) => setFiltro(e.target.value)} />\n      <ListaOvillos filtro={filtroDiferido} />\n    </main>\n  )\n}\n\n// Sin StrictMode. Escribes una «a». ¿Qué sale en la consola?",
  "opciones": [
    "ListaOvillos pinta «a», una sola vez",
    "ListaOvillos pinta «» y después ListaOvillos pinta «a»",
    "Nada hasta que dejas de escribir"
  ],
  "correcta": 1,
  "explicacion": "Sin memo, el render urgente de App vuelve a ejecutar ListaOvillos, aunque reciba el mismo filtro vacío de antes: las 150 muestras otra vez, y el campo atascado como al principio. Después llega el render en segundo plano con la «a». Lo comprobamos en la vista previa con el árbol de renders: ListaOvillos se renderiza en los dos commits. Con memo, el primero se lo salta."
}
```

**Pasar a `useDeferredValue` un objeto creado durante el render.** `useDeferredValue({ filtro, orden })` recibe un objeto nuevo en cada render, distinto para `Object.is`, así que cualquier render del componente, aunque sea por otro motivo, trae otro de propina en segundo plano. Lo comprobamos con un contador que no tenía nada que ver: con el objeto, cada clic costó dos renders; con un texto, uno. Pásale valores primitivos (un texto, un número) u objetos creados fuera del render.

**Esperar que una transición acelere algo.** Las transiciones reordenan el trabajo, no lo quitan. Si una pantalla es lenta, primero haz que pinte menos.

## Ejercicios

### Ejercicio 1: la galería sin saltos

En la tienda, al abrir la galería, el fallback tapa las novedades mientras se descarga. Haz que el cambio de pestaña sea una transición: **las novedades siguen a la vista** y, mientras tanto, se lee **«Abriendo la pestaña…»**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: cambiar de pestaña sin esconder la anterior",
  "consigna": "Usa useTransition en App: haz el setPestana de elegir dentro de startTransition y enseña «Abriendo la pestaña…» mientras isPending sea true. No toques el Suspense ni Galeria.jsx.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { lazy, Suspense, useState } from 'react'\nimport './estilos.css'\n\n// En la vista previa no hay red: esperar(800) simula la descarga.\nconst esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))\n\nconst Galeria = lazy(() => esperar(800).then(() => import('./Galeria.jsx')))\n\nfunction Novedades() {\n  return (\n    <section>\n      <h2>Novedades de otoño</h2>\n      <p>Alpaca, mohair y merino en doce colores nuevos.</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('novedades')\n\n  // Al abrir la galería, el fallback tapa las novedades durante la descarga.\n  // Haz el cambio de pestaña en una transición y, mientras dure,\n  // enseña «Abriendo la pestaña…».\n  function elegir(id) {\n    setPestana(id)\n  }\n\n  return (\n    <main>\n      <h1>Lanas El Ovillo</h1>\n      <nav aria-label=\"Secciones de la tienda\">\n        <button aria-pressed={pestana === 'novedades'} onClick={() => elegir('novedades')}>\n          Novedades\n        </button>\n        <button aria-pressed={pestana === 'galeria'} onClick={() => elegir('galeria')}>\n          Galería\n        </button>\n      </nav>\n      <Suspense fallback={<p className=\"cargando\">Cargando la pestaña…</p>}>\n        {pestana === 'novedades' ? <Novedades /> : <Galeria />}\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Galeria.jsx",
      "codigo": "export default function Galeria() {\n  return (\n    <section>\n      <h2>Galería de labores</h2>\n      <ul>\n        <li>Jersey de ochos en merino mostaza, de Carmen</li>\n        <li>Chal de encaje en mohair rosa palo, de Lucía</li>\n        <li>Manta de ganchillo en algodón crudo, de Paco</li>\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Mientras se descarga la galería, las novedades siguen a la vista",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Galería"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Novedades de otoño"
      }
    },
    {
      "descripcion": "Mientras se descarga, se lee «Abriendo la pestaña…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Galería"
          }
        }
      ],
      "espera": {
        "texto": "Abriendo la pestaña…"
      }
    },
    {
      "descripcion": "Después aparece la galería, con su título «Galería de labores»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Galería"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Galería de labores"
      }
    },
    {
      "descripcion": "Cuando la galería ya está, el aviso «Abriendo la pestaña…» desaparece",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Galería"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Galería de labores"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Abriendo la pestaña…"
        }
      }
    },
    {
      "descripcion": "Desde la galería se puede volver a «Novedades»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Galería"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Galería de labores"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Novedades"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Novedades de otoño"
      }
    }
  ]
}
```

Una trampa que las comprobaciones no ven: deja el `<Suspense>` donde está, alrededor de las dos pestañas y montado antes del clic. Si lo mueves dentro de la condición, junto a `<Galeria />`, cada clic monta un límite nuevo, y la galería enseña «Cargando la pestaña…» con transición o sin ella. Las comprobaciones miran justo después del clic, antes de que React pinte la transición, así que no lo notan; tú sí lo verás en la vista previa.

### Ejercicio 2: objetos perdidos con «Buscando…»

La oficina de objetos perdidos del Ayuntamiento de Villanueva tiene un buscador que, mientras espera al servidor (aquí, 600 ms), no da ninguna señal. Haz la búsqueda en una transición: **«Buscando…» mientras dure**, y que **los resultados anteriores sigan en la lista** hasta que lleguen los nuevos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: el buscador de objetos perdidos",
  "consigna": "Con useTransition, haz la petición dentro de startTransition(async () => { … }), envuelve el setObjetos que va después del await en otro startTransition y enseña «Buscando…» mientras isPending sea true. No vacíes la lista al empezar a buscar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [busqueda, setBusqueda] = useState('')\n  const [objetos, setObjetos] = useState([])\n\n  // Mientras llega la respuesta no hay ninguna señal de que se está buscando.\n  // Haz la búsqueda en una transición y enseña «Buscando…» mientras dure.\n  async function manejarEnvio(evento) {\n    evento.preventDefault()\n    const respuesta = await fetch('/api/objetos?q=' + encodeURIComponent(busqueda))\n    const datos = await respuesta.json()\n    setObjetos(datos)\n  }\n\n  return (\n    <main>\n      <h1>Objetos perdidos de Villanueva</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Objeto\n          <input type=\"search\" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} />\n        </label>\n        <button>Buscar</button>\n      </form>\n      <ul>\n        {objetos.map((objeto) => (\n          <li key={objeto.id}>\n            {objeto.nombre}: encontrado en {objeto.lugar} el {objeto.fecha}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 40rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9f1239;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #ffe4e6;\n  border: 2px solid #be123c;\n}\n\n.muestrario {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n  max-height: 14rem;\n  overflow: auto;\n}\n\n.muestra {\n  font-size: 0.8rem;\n  padding: 0.25rem 0.4rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 4px;\n}\n\n.resaltada {\n  background: #fde68a;\n  border-color: #b45309;\n}\n\n.estado,\n.cargando {\n  color: #57534e;\n  font-style: italic;\n  min-height: 1.5em;\n}\n\n.atenuado {\n  opacity: 0.5;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "objetos": [
      {
        "id": 1,
        "nombre": "Paraguas negro",
        "lugar": "el autobús de la línea 3",
        "fecha": "14 de octubre"
      },
      {
        "id": 2,
        "nombre": "Paraguas de cuadros",
        "lugar": "la biblioteca municipal",
        "fecha": "16 de octubre"
      },
      {
        "id": 3,
        "nombre": "Gafas de sol",
        "lugar": "la piscina cubierta",
        "fecha": "2 de octubre"
      },
      {
        "id": 4,
        "nombre": "Gafas graduadas con funda azul",
        "lugar": "el mercado de abastos",
        "fecha": "18 de octubre"
      },
      {
        "id": 5,
        "nombre": "Llavero con tres llaves",
        "lugar": "la plaza Mayor",
        "fecha": "19 de octubre"
      },
      {
        "id": 6,
        "nombre": "Bufanda de lana gris",
        "lugar": "el centro de salud",
        "fecha": "11 de octubre"
      },
      {
        "id": 7,
        "nombre": "Cartera marrón",
        "lugar": "la estación de autobuses",
        "fecha": "20 de octubre"
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras llega la respuesta, se lee «Buscando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "paraguas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        }
      ],
      "espera": {
        "texto": "Buscando…"
      }
    },
    {
      "descripcion": "Después aparecen los resultados: el paraguas negro está en la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "paraguas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Paraguas negro"
      }
    },
    {
      "descripcion": "Cuando llegan los resultados, «Buscando…» desaparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "paraguas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Paraguas negro"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Buscando…"
        }
      }
    },
    {
      "descripcion": "Mientras busca otra cosa, los resultados anteriores siguen en la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "paraguas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Paraguas negro"
          }
        },
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "gafas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Paraguas negro"
      }
    },
    {
      "descripcion": "Al final, la lista enseña los resultados de la búsqueda nueva",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "paraguas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Paraguas negro"
          }
        },
        {
          "escribir": {
            "etiqueta": "Objeto",
            "texto": "gafas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Gafas de sol"
      }
    }
  ]
}
```

Si vacías la lista al empezar (`setObjetos([])` antes de la petición) falla la cuarta comprobación: es lo que hacía falta con un estado de carga a mano, y lo que una transición te ahorra. Y si olvidas el segundo `startTransition`, aquí parecerá que funciona igual, porque nada se suspende al pintar la lista; pero el `setObjetos` será urgente, y en cuanto la lista tenga algo que se suspenda (un componente `lazy`, por ejemplo), verás el fallback que la transición debía evitar.

**Retos para seguir practicando** (sin comprobación automática):

1. En el buscador de objetos perdidos, distingue «todavía no has buscado» de «no hay resultados»: empieza con `objetos` a `null` y enseña «No hay ningún objeto que coincida.» solo cuando una búsqueda devuelva una lista vacía.
2. Activa «Responder desordenado» en el panel de red del ejercicio 2 y busca «paraguas» y enseguida «gafas». ¿Qué lista se queda? Explícalo con la predicción de los patrones; lo arreglarás en el proyecto 56.
3. En el muestrario del principio, cambia `useDeferredValue` por dos estados: `filtro` para el campo y `filtroLista` para la lista, actualizado dentro de `startTransition`. Usa `isPending` para el aviso. ¿Qué te da cada versión que la otra no?
4. En ese mismo primer muestrario, añade un valor inicial con `useDeferredValue`: que al abrir la página se vea «Preparando el muestrario…» antes de las 150 muestras, aunque no hayas escrito nada.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useTransition",
      "descripcion": "La referencia del Hook: isPending, las Actions, las transiciones con Suspense, el router de ejemplo y los problemas típicos de esta lección.",
      "url": "https://react.dev/reference/react/useTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "startTransition",
      "descripcion": "La versión sin Hook: cuándo usarla y en qué se diferencia de useTransition.",
      "url": "https://react.dev/reference/react/startTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useDeferredValue",
      "descripcion": "El valor diferido, initialValue, enseñar resultados viejos mientras llegan los nuevos y por qué no es un debounce.",
      "url": "https://react.dev/reference/react/useDeferredValue",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Suspense>: Preventing already revealed content from hiding",
      "descripcion": "Cómo una transición evita que un Suspense ya visible vuelva a su fallback, y cómo forzarlo con una key. Es la lección 48.",
      "url": "https://react.dev/reference/react/Suspense#preventing-already-revealed-content-from-hiding",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19.3",
      "descripcion": "La nota de la versión: entre los cambios, que cada transición se renderiza por su cuenta.",
      "url": "https://react.dev/blog/2026/09/09/react-19-3",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React v18.0: Concurrent React",
      "descripcion": "Dónde nacieron las transiciones y qué significa que un render se pueda interrumpir.",
      "url": "https://react.dev/blog/2022/03/29/react-v18",
      "etiqueta": "react.dev"
    }
  ]
}
```
