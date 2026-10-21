# Refs en `<Fragment>`: un grupo de hermanos sin envoltorio (19.3)

- **Módulo:** Refs y el DOM
- **Slug:** `refs-en-fragment-un-grupo-de-hermanos-sin-envoltorio-19-3` (autogenerado del título)
- **Orden:** 350
- **Fuentes:** [`<Fragment>`](https://react.dev/reference/react/Fragment) — ver `contenido/react/TEMARIO.md` #35

---

## Qué es y para qué sirve

En la lección 34 pusiste una `ref` en un elemento del DOM para hablar con él directamente: enfocarlo, desplazarte hasta él, medirlo. Funciona cuando hay **un** elemento al que agarrarse. Pero muchas veces lo que quieres tratar como una unidad es **un grupo de hermanos que no tiene un padre propio**:

- Un componente que devuelve varias parejas de `<label>` e `<input>` que van sueltas dentro de una rejilla de CSS.
- Unos cuantos `<li>` dentro de una lista, o unas filas `<tr>` dentro de una tabla.
- Lo que pinta un componente que no es tuyo (de una librería, de otro equipo) y que no acepta `ref`.

Hasta ahora, la salida era envolverlos en un `<div>` para tener dónde poner la ref. Pero ese `div` es una caja de verdad: rompe la rejilla o el flex del padre y, dentro de una `<ul>` o de una `<tbody>`, ni siquiera es HTML válido (lo viste en la lección 5). **Desde React 19.3, un `<Fragment>` acepta una `ref`**. No añade nada al DOM, y a cambio te da un objeto para trabajar con el grupo entero: enfocar su primer campo, escuchar los eventos de todos sus hijos, saber si se ve en pantalla o medirlo.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una función de React 19.3",
  "contenido": "Las refs en Fragment se presentaron como función experimental y son estables desde React 19.3.0, publicado el 9 de septiembre de 2026. Esta web usa React 19.3.1. Si tu proyecto tiene React 19.2 o anterior, la ref no se rellena nunca y la consola te avisa de que Fragment solo admite key y children: tienes el mensaje exacto en «Errores típicos»."
}
```

## La forma larga, con `ref`

La forma corta `<>...</>` no admite nada: ni `key` ni `ref`. Para pasarle una ref, importa `Fragment` y escribe la forma larga, igual que hiciste con `key` en la lección 11:

```jsx
import { Fragment, useRef } from 'react'

// dentro del componente
const familia = useRef(null)

<Fragment ref={familia}>
  <CamposFamilia />
</Fragment>
```

El campamento de verano El Pinar tiene un formulario de inscripción en dos columnas: etiquetas a la izquierda, campos a la derecha. `CamposFamilia` devuelve tres parejas de etiqueta y campo, y cada pieza tiene que ser hija directa de la rejilla para caer en su columna. Prueba los tres botones de abajo:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Enfocar y medir un grupo de campos sin envolverlo",
  "codigo": "import { Fragment, useRef } from 'react'\n\nfunction CamposFamilia() {\n  return (\n    <>\n      <label htmlFor=\"contacto\">Persona de contacto</label>\n      <input id=\"contacto\" />\n      <label htmlFor=\"telefono\">Teléfono</label>\n      <input id=\"telefono\" type=\"tel\" />\n      <label htmlFor=\"correo\">Correo</label>\n      <input id=\"correo\" type=\"email\" />\n    </>\n  )\n}\n\nexport default function App() {\n  const familia = useRef(null)\n\n  function medir() {\n    const cajas = familia.current.getClientRects()\n    console.log(`El grupo ocupa ${cajas.length} cajas en pantalla`)\n  }\n\n  return (\n    <form className=\"rejilla\">\n      <h2>Campamento El Pinar</h2>\n      <label htmlFor=\"participante\">Participante</label>\n      <input id=\"participante\" />\n      <h3>Familia</h3>\n      <Fragment ref={familia}>\n        <CamposFamilia />\n      </Fragment>\n      <p className=\"pie\">\n        <button type=\"button\" onClick={() => familia.current.focus()}>\n          Revisar datos de la familia\n        </button>\n        <button type=\"button\" onClick={() => familia.current.focusLast()}>\n          Ir al último campo\n        </button>\n        <button type=\"button\" onClick={medir}>\n          Medir el grupo\n        </button>\n      </p>\n    </form>\n  )\n}",
  "css": ".rejilla {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 0.5rem 1rem;\n  align-items: center;\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\n/* Lo que ocupa las dos columnas */\n.rejilla h2,\n.rejilla h3,\n.pie {\n  grid-column: 1 / -1;\n  margin: 0.25rem 0 0;\n}\n\n.rejilla input {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.rejilla input:focus {\n  outline: 3px solid #f59e0b;\n  outline-offset: 1px;\n}\n\n.pie {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.pie button {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #15803d;\n  border-radius: 999px;\n  background: #f0fdf4;\n  font: inherit;\n  cursor: pointer;\n}",
  "anotaciones": [
    {
      "fragmento": "import { Fragment, useRef } from 'react'",
      "nota": "Fragment se importa de react como cualquier otra pieza. Con la forma corta no podrías pasarle la ref."
    },
    {
      "fragmento": "<Fragment ref={familia}>",
      "nota": "La ref va en el Fragment, no en CamposFamilia: el componente no tiene que aceptar ninguna prop ni saber nada. React rellena familia.current al montar, como con un elemento."
    },
    {
      "fragmento": "familia.current.focus()",
      "nota": "Enfoca el primer elemento enfocable del grupo. Busca en profundidad: se salta la etiqueta, que no se puede enfocar, y se para en el primer campo."
    },
    {
      "fragmento": "familia.current.focusLast()",
      "nota": "Lo mismo, pero desde el final: el último elemento enfocable del grupo, aquí el correo."
    },
    {
      "fragmento": "familia.current.getClientRects()",
      "nota": "Devuelve un array con un rectángulo por cada caja del grupo en pantalla. Aquí, seis: tres etiquetas y tres campos. Mira la consola."
    },
    {
      "fragmento": "<form className=\"rejilla\">",
      "nota": "Los estilos de este ejemplo, que no se ven aquí, hacen de .rejilla una rejilla de dos columnas con grid-template-columns: max-content 1fr. Cada etiqueta y cada campo es un hijo directo y cae en su columna. Si envolvieras el grupo en un div, ese div sería una sola celda y las columnas dejarían de cuadrar."
    }
  ],
  "mostrarConsola": true
}
```

**Qué hay en `familia.current`.** No es un elemento del DOM: es un objeto de React, un `FragmentInstance`, con unos pocos métodos que actúan sobre el grupo. No tiene `style`, ni `querySelector`, ni `children`: si los pides, obtienes `undefined`. Estos son todos sus métodos, por familias:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Eventos: addEventListener, removeEventListener y dispatchEvent",
      "texto": "Ponen y quitan un escuchador en todos los hijos del grupo a la vez, y lo mantienen al día cuando aparecen o desaparecen hijos. dispatchEvent lanza un evento desde el grupo, que puede subir hasta su padre del DOM."
    },
    {
      "titulo": "Foco: focus, focusLast y blur",
      "texto": "focus y focusLast enfocan el primer o el último elemento enfocable, buscando en profundidad. blur quita el foco si está dentro del grupo; si está fuera, no hace nada."
    },
    {
      "titulo": "Observar: observeUsing y unobserveUsing",
      "texto": "Conectan al grupo, y desconectan, un IntersectionObserver (para saber si se ve en pantalla) o un ResizeObserver (para saber si cambia de tamaño) que hayas creado tú."
    },
    {
      "titulo": "Medir y situar: getClientRects, scrollIntoView, getRootNode y compareDocumentPosition",
      "texto": "Los rectángulos de las cajas del grupo, desplazarse hasta él, el documento al que pertenece y su posición respecto a otro nodo, como los métodos del mismo nombre de los elementos."
    }
  ]
}
```

## Qué hijos toca: el primer nivel del DOM

**Los métodos trabajan sobre los hijos del primer nivel del DOM**: los primeros elementos de HTML que encuentra React al bajar desde el Fragment. Los componentes no cuentan como nivel, porque React mira a través de ellos. Pero en cuanto llega a un elemento se para: lo que hay dentro ya no es hijo directo del grupo.

Este es el programa del viernes, el último día del campamento. `TituloDia` es un componente que devuelve un `h3` y un `p`:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Los hijos del primer nivel de <Fragment ref={viernes}>",
  "nodos": [
    {
      "nombre": "Fragment",
      "nivel": 0,
      "etiqueta": "ref={viernes}"
    },
    {
      "nombre": "TituloDia",
      "nivel": 1,
      "nota": "← un componente: React mira a través de él"
    },
    {
      "nombre": "h3",
      "nivel": 2,
      "etiqueta": "primer nivel"
    },
    {
      "nombre": "p",
      "nivel": 2,
      "etiqueta": "primer nivel"
    },
    {
      "nombre": "ul",
      "nivel": 1,
      "etiqueta": "primer nivel"
    },
    {
      "nombre": "li",
      "nivel": 2,
      "nota": "← dentro de ul: ya no es del primer nivel"
    },
    {
      "nombre": "li",
      "nivel": 2,
      "nota": "← tampoco"
    }
  ]
}
```

Así que, para la ref `viernes`, el grupo son tres elementos: el `h3`, el `p` y la `ul`. `viernes.current.getClientRects()` devuelve tres rectángulos, y un `addEventListener` pone el escuchador en esos tres.

Hay una excepción: **`focus()` y `focusLast()` sí bajan hasta el fondo**. Buscan el primer (o el último) elemento enfocable en todo el grupo, también dentro de la `ul`, de un `fieldset` o de una etiqueta. Por eso en el formulario de arriba `focus()` llega al campo aunque el primer hijo sea una `label`.

¿Y un evento que ocurre más abajo? Pruébalo antes de seguir:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Material() {\n  return (\n    <Fragment\n      ref={(grupo) => {\n        const avisar = (e) => console.log('Clic en', e.currentTarget.tagName)\n        grupo.addEventListener('click', avisar)\n        return () => grupo.removeEventListener('click', avisar)\n      }}\n    >\n      <h3>Material para el viernes</h3>\n      <p>\n        Linterna y saco de dormir. <button>Ver la lista completa</button>\n      </p>\n    </Fragment>\n  )\n}\n\n// Pulsas «Ver la lista completa». ¿Qué sale en la consola?",
  "opciones": [
    "Nada: el botón no es un hijo del primer nivel",
    "Clic en BUTTON",
    "Clic en P",
    "Clic en H3 y Clic en P"
  ],
  "correcta": 2,
  "explicacion": "El escuchador está en el h3 y en el p, no en el botón. Pero el clic sube por el DOM como cualquier otro: del botón pasa al p, que sí tiene el escuchador, y ahí se ejecuta. currentTarget es el elemento que tiene el escuchador, el p; target seguiría siendo el botón. Al h3 no llega, porque no es antepasado del botón."
}
```

## Escuchar los eventos de todo el grupo

`addEventListener` pone el mismo escuchador en todos los hijos del primer nivel. Es un escuchador del DOM, no un `onClick` de React, así que hay que quitarlo cuando ya no haga falta. El sitio natural es **una función de ref que devuelve su limpieza** (lección 34): React la llama con la instancia al conectar la ref y ejecuta la limpieza al desconectarla.

Con eso puedes escribir un componente que **añade comportamiento a lo que envuelva**, sin tocarlo y sin añadir ni un nodo al DOM. `AvisaDeCambios` avisa cada vez que se escribe en alguno de los campos que lleva dentro. En la ficha de salud del campamento, envuelve los campos de alergias y medicación:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un componente que escucha lo que envuelve",
  "consigna": "Escribe en «Alergia 1» o en «Medicación»: el aviso pasa a «Hay cambios sin guardar». En «Notas para los monitores», que está fuera de AvisaDeCambios, no. Pulsa «Guardar», después «Añadir alergia», y escribe en la nueva: también avisa. Mira la consola en cada paso.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport AvisaDeCambios from './AvisaDeCambios'\nimport './estilos.css'\n\nfunction CampoAlergia({ numero }) {\n  return (\n    <>\n      <label htmlFor={`alergia-${numero}`}>Alergia {numero}</label>\n      <input id={`alergia-${numero}`} />\n    </>\n  )\n}\n\nexport default function App() {\n  const [alergias, setAlergias] = useState([1])\n  const [sinGuardar, setSinGuardar] = useState(false)\n\n  function guardar(e) {\n    e.preventDefault()\n    setSinGuardar(false)\n  }\n\n  return (\n    <form className=\"rejilla\" onSubmit={guardar}>\n      <h2>Ficha de salud</h2>\n      <AvisaDeCambios onCambio={() => setSinGuardar(true)}>\n        {alergias.map((numero) => (\n          <CampoAlergia key={numero} numero={numero} />\n        ))}\n        <label htmlFor=\"medicacion\">Medicación</label>\n        <input id=\"medicacion\" />\n      </AvisaDeCambios>\n      <label htmlFor=\"notas\">Notas para los monitores</label>\n      <input id=\"notas\" />\n      <p className=\"pie\">\n        <button type=\"button\" onClick={() => setAlergias([...alergias, alergias.length + 1])}>\n          Añadir alergia\n        </button>\n        <button>Guardar</button>\n        <span>{sinGuardar ? 'Hay cambios sin guardar' : 'Todo guardado'}</span>\n      </p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "AvisaDeCambios.jsx",
      "codigo": "import { Fragment } from 'react'\n\n// Llama a onCambio cada vez que se escribe en alguno de los campos\n// que envuelve, sin añadir ningún elemento al DOM.\nexport default function AvisaDeCambios({ onCambio, children }) {\n  return (\n    <Fragment\n      ref={(grupo) => {\n        console.log('Escucho el grupo')\n        grupo.addEventListener('input', onCambio)\n        return () => {\n          console.log('Dejo de escucharlo')\n          grupo.removeEventListener('input', onCambio)\n        }\n      }}\n    >\n      {children}\n    </Fragment>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".rejilla {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 0.5rem 1rem;\n  align-items: center;\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\n/* Lo que ocupa las dos columnas */\n.rejilla h2,\n.rejilla h3,\n.pie {\n  grid-column: 1 / -1;\n  margin: 0.25rem 0 0;\n}\n\n.rejilla input {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.rejilla input:focus {\n  outline: 3px solid #f59e0b;\n  outline-offset: 1px;\n}\n\n.pie {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.pie button {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #15803d;\n  border-radius: 999px;\n  background: #f0fdf4;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "AvisaDeCambios.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Tres cosas que se ven en este ejemplo:

- **Los hijos que llegan después también escuchan.** React mantiene el escuchador al día: se lo pone a los hijos nuevos del grupo y se lo quita a los que desaparecen. Pasa incluso si la función de ref no se vuelve a ejecutar (por ejemplo, si la defines fuera del componente): la alergia nueva avisa igual.
- **Al cargar, la consola dice «Escucho», «Dejo de escucharlo» y «Escucho».** Es `StrictMode`: en desarrollo conecta, desconecta y vuelve a conectar cada ref nada más montar, para destapar las funciones de ref que no limpian bien (lo verás fallar en «Errores típicos»).
- **Después de cada render, otra vez «Dejo de escucharlo» y «Escucho».** La función de ref se escribe dentro de `AvisaDeCambios`, así que es una función nueva en cada render, y React desconecta la vieja y conecta la nueva (lección 34). Aquí no importa. Si te importara, define la función fuera del componente cuando no necesite nada de dentro, o espera a `useCallback` (lección 67). En react.dev verás este mismo ejemplo escrito con un efecto, `useEffect`, que llega en el módulo 6.

## Saber si el grupo se ve en pantalla

`observeUsing` conecta al grupo un `IntersectionObserver` o un `ResizeObserver` que hayas creado tú, y `unobserveUsing` lo desconecta. Con un `IntersectionObserver`, el navegador te avisa cuando alguno de los hijos **entra o sale de la parte visible**. `SeVe` lo envuelve en un componente reutilizable y avisa con `true` o `false`.

El programa del campamento es una lista ordenada: cada actividad es un `<li>` y, dentro de una `<ol>`, no cabe un `div` para agrupar las del viernes. Con `SeVe` no hace falta:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un aviso cuando asoma el viernes",
  "consigna": "Marca «Avisarme cuando llegue al viernes» y desplázate dentro del programa: el aviso cambia en cuanto asoma la primera actividad del viernes, y vuelve a cambiar si subes. Desmarca la casilla y mira la consola: al desaparecer SeVe, React ejecuta su limpieza.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport SeVe from './SeVe'\nimport './estilos.css'\n\nconst PROGRAMA = {\n  Lunes: ['10:00 Juegos de presentación', '17:00 Piscina'],\n  Martes: ['10:00 Ruta al nacimiento del río', '22:00 Observación de estrellas'],\n  Miércoles: ['10:00 Taller de nudos', '17:00 Tirolina'],\n  Jueves: ['10:00 Gymkana', '17:00 Preparar la fiesta'],\n}\nconst VIERNES = ['12:00 Entrega de diplomas', '20:00 Fiesta de despedida', '22:00 Fuego de campamento']\n\nfunction Actividad({ texto }) {\n  return <li>{texto}</li>\n}\n\nexport default function App() {\n  const [vigilar, setVigilar] = useState(false)\n  const [viernesVisible, setViernesVisible] = useState(false)\n\n  const actividadesViernes = VIERNES.map((texto) => <Actividad key={texto} texto={texto} />)\n\n  return (\n    <main>\n      <h2>Programa del campamento</h2>\n      <label className=\"casilla\">\n        <input type=\"checkbox\" checked={vigilar} onChange={(e) => setVigilar(e.target.checked)} />\n        Avisarme cuando llegue al viernes\n      </label>\n      {vigilar && (\n        <p className=\"aviso\">\n          {viernesVisible ? 'Ya estás en el viernes: la fiesta es a las 20:00' : 'Sigue bajando: el viernes hay fiesta'}\n        </p>\n      )}\n      <div className=\"caja\">\n        <ol className=\"programa\">\n          {Object.entries(PROGRAMA).flatMap(([dia, actividades]) => [\n            <li key={dia} className=\"dia\">{dia}</li>,\n            ...actividades.map((texto) => <Actividad key={texto} texto={texto} />),\n          ])}\n          <li className=\"dia\">Viernes</li>\n          {vigilar ? <SeVe onCambiar={setViernesVisible}>{actividadesViernes}</SeVe> : actividadesViernes}\n        </ol>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "SeVe.jsx",
      "codigo": "import { Fragment } from 'react'\n\n// Avisa con true o false cuando alguno de sus hijos\n// entra en la parte visible o sale de ella.\nexport default function SeVe({ onCambiar, children }) {\n  return (\n    <Fragment\n      ref={(grupo) => {\n        const visibles = new Set()\n        const observador = new IntersectionObserver((entradas) => {\n          for (const entrada of entradas) {\n            if (entrada.isIntersecting) visibles.add(entrada.target)\n            else visibles.delete(entrada.target)\n          }\n          onCambiar(visibles.size > 0)\n        })\n        grupo.observeUsing(observador)\n        console.log('Observo el grupo')\n        return () => {\n          grupo.unobserveUsing(observador)\n          observador.disconnect()\n          console.log('Dejo de observarlo')\n        }\n      }}\n    >\n      {children}\n    </Fragment>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\n/* Una caja con scroll propio: el programa se lee desplazándose dentro */\n.caja {\n  height: 11rem;\n  overflow-y: auto;\n  border: 2px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.programa {\n  margin: 0;\n  padding: 0.5rem 1rem;\n  list-style: none;\n}\n\n.programa li {\n  padding: 0.3rem 0;\n}\n\n.programa .dia {\n  margin-top: 0.5rem;\n  font-weight: 700;\n  color: #15803d;\n}\n\n.casilla {\n  display: flex;\n  gap: 0.4rem;\n  align-items: center;\n}\n\n.aviso {\n  padding: 0.4rem 0.6rem;\n  border-radius: 6px;\n  background: #dcfce7;\n}\n"
    }
  ],
  "archivoInicial": "SeVe.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Algunos detalles de `SeVe`:

- **El observador solo recibe los hijos que han cambiado**, no todos. Si un `li` sale de la vista mientras otro sigue dentro, la entrada que llega dice «no se ve», y el grupo sí se ve. Por eso `SeVe` lleva la cuenta en un `Set`.
- **No le hace falta saber nada de la caja con scroll.** Sin más opciones, un `IntersectionObserver` mira la parte visible de la ventana, recortada por las cajas con scroll que haya por medio. Un `li` escondido bajo el borde de `.caja` cuenta como no visible.
- **La casilla está para que puedas ver la limpieza**, pero también tiene sentido real: cuando no hay nada que vigilar, no se observa nada.
- **Con un `ResizeObserver` el patrón es el mismo**: `observeUsing` y `unobserveUsing`, y el navegador te avisa cuando algún hijo cambia de tamaño.

## Medir y desplazarse

`getClientRects()` devuelve un array de `DOMRect`, **uno por caja**: si un hijo es un elemento en línea, como un `span` o un `a`, partido en tres líneas, aporta tres rectángulos. Con ellos puedes saber dónde empieza y dónde acaba el grupo, por ejemplo para colocar algo al lado:

```jsx
const cajas = viernes.current.getClientRects()
const arriba = Math.min(...cajas.map((caja) => caja.top))
const abajo = Math.max(...cajas.map((caja) => caja.bottom))
console.log(`El viernes ocupa ${Math.round(abajo - arriba)} px de alto`)
```

`scrollIntoView()` desplaza hasta el grupo: sin argumento, o con `true`, deja el primer hijo arriba; con `false`, deja el último abajo. A diferencia del `scrollIntoView` de los elementos, **solo admite ese `true` o `false`**, no un objeto de opciones. Aquí no tiene ejemplo en vivo por una razón práctica: dentro de la vista previa, `scrollIntoView` también desplazaría esta página.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Componentes que añaden comportamiento a lo que envuelven",
      "texto": "Como SeVe o AvisaDeCambios: un registro de clics para estadísticas, cerrar un menú al pulsar fuera, cargar algo cuando un bloque se acerca a la pantalla. Funcionan con cualquier hijo, sin pedirle nada y sin añadir nodos."
    },
    {
      "titulo": "Grupos que no admiten envoltorio",
      "texto": "Filas de una tabla, elementos de una lista, celdas de una rejilla o de un flex. Un div ahí rompe el diseño o el HTML."
    },
    {
      "titulo": "Componentes que no aceptan ref",
      "texto": "Los de una librería o de otro equipo que no pasan la ref a ningún elemento. Con un Fragment alrededor llegas a su DOM sin tocar su código."
    },
    {
      "titulo": "Mover el foco a una parte de la página",
      "texto": "Al primer campo de la sección que tiene errores, o al primer elemento de un panel que se acaba de abrir. La lección 37 trata a fondo dónde poner el foco y cuándo."
    },
    {
      "titulo": "Y cuándo no",
      "texto": "Si tienes un único elemento al que agarrarte, una ref normal (lección 34) es más sencilla. Y para responder a un clic en tus propios componentes, onClick sigue siendo lo normal: addEventListener es para cuando no puedes o no quieres tocar a los hijos."
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
      "mito": "Un Fragment con ref añade algo al DOM",
      "realidad": "El DOM queda exactamente igual que sin la ref. Es React quien sabe qué nodos son los hijos del grupo y aplica los métodos sobre ellos."
    },
    {
      "mito": "ref.current es el primer hijo del grupo",
      "realidad": "Es un FragmentInstance, un objeto de React con sus propios métodos. No tiene style, ni querySelector, ni children."
    },
    {
      "mito": "Si el Fragment acepta ref, también acepta className u onClick",
      "realidad": "Solo admite key, ref y children. Un Fragment no es un elemento: no tiene clases, estilos ni eventos propios. Para los eventos, addEventListener sobre la ref."
    },
    {
      "mito": "focus() enfoca el primer hijo",
      "realidad": "Enfoca el primer elemento enfocable, buscando en profundidad. Si el primer hijo es una etiqueta o un párrafo, sigue buscando hasta dar con un campo, un botón o un enlace."
    }
  ]
}
```

## Errores típicos

**Una función de ref que no devuelve limpieza.** Esta versión de la ficha de salud no llega ni a montarse:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ref que recibe null",
  "consigna": "Lee el error de la vista previa. Arréglalo haciendo que la función de ref devuelva una limpieza que quite el escuchador.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Fragment, useState } from 'react'\n\nexport default function App() {\n  const [sinGuardar, setSinGuardar] = useState(false)\n\n  return (\n    <form>\n      <Fragment ref={(grupo) => grupo.addEventListener('input', () => setSinGuardar(true))}>\n        <label htmlFor=\"medicacion\">Medicación</label>\n        <input id=\"medicacion\" />\n      </Fragment>\n      <p>{sinGuardar ? 'Hay cambios sin guardar' : 'Todo guardado'}</p>\n    </form>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

```text
Cannot read properties of null (reading 'addEventListener')
```

Es decir: has intentado leer `addEventListener` de algo que vale `null`. **Si la función de ref no devuelve una limpieza, React la vuelve a llamar con `null` cuando desconecta la ref**: al desmontar, cuando llega una función nueva en un render y, en desarrollo con `StrictMode`, nada más montar, que es justo cuando lo simula para que lo veas (lección 12). Sin `StrictMode` la página cargaría, pero reventaría con la primera letra que escribieras, porque ese render trae una función de ref nueva. Si la función devuelve su limpieza, React llama a la limpieza y ya no la llama con `null`. Y de paso quitas el escuchador, que si no se quedaría puesto.

**Tratar la instancia como si fuera un elemento:**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  const familia = useRef(null)\n\n  return (\n    <form className=\"rejilla\">\n      <Fragment ref={familia}>\n        <CamposFamilia />\n      </Fragment>\n      <button\n        type=\"button\"\n        onClick={() => familia.current.querySelector('input').focus()}\n      >\n        Revisar datos de la familia\n      </button>\n    </form>\n  )\n}\n\n// Pulsas el botón. ¿Qué pasa?",
  "opciones": [
    "El foco va al primer campo de la familia",
    "Nada: familia.current todavía es null",
    "Un error: familia.current.querySelector is not a function",
    "El foco va al botón y se queda ahí sin errores"
  ],
  "correcta": 2,
  "explicacion": "familia.current es un FragmentInstance, no un elemento: no tiene querySelector, así que vale undefined y llamarlo lanza un TypeError. Al pulsar, la ref ya está rellena (React la conecta al montar). Para enfocar el primer campo del grupo está su propio método: familia.current.focus()."
}
```

**Pasarle opciones a `scrollIntoView`.** Con los elementos es normal escribir `scrollIntoView({ behavior: 'smooth' })`. Con la ref de un Fragment, lanza este error:

```text
FragmentInstance.scrollIntoView() does not support scrollIntoViewOptions. Use the alignToTop boolean instead.
```

Es decir: el `scrollIntoView` de un Fragment no admite el objeto de opciones; usa el booleano `alignToTop`, `true` o `false`.

**Observar un grupo que solo tiene texto.** Los observadores trabajan con elementos, no con nodos de texto. Si el Fragment solo envuelve texto suelto, `observeUsing` no observa nada y React lo dice en la consola:

```text
observeUsing() was called on a FragmentInstance with only text children. Observers do not work on text nodes.
```

Es decir: has llamado a `observeUsing()` en un grupo que solo tiene texto, y los observadores no funcionan con nodos de texto. Envuelve el texto en un elemento (un `span`, un `p`).

**Leer la ref durante el render.** Como cualquier ref (lección 33), `familia.current` vale `null` en el primer render: React la rellena al montar. Úsala en manejadores de eventos o en la propia función de ref, nunca en el cuerpo del componente.

**Usarlo con una versión anterior a 19.3.** Con React 19.2 o anterior no hay `FragmentInstance`: la ref se queda como estaba y la consola avisa:

```text
Invalid prop `ref` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.
```

Es decir: le has pasado a `React.Fragment` una prop no válida, `ref`; Fragment solo puede tener `key` y `children`. En React 19.3 el aviso sigue existiendo, pero ya dice «`key`, `ref`, and `children`». Puede salirte, por ejemplo, si un componente devuelve un `<Fragment className="…">`: un Fragment no tiene clases.

## Ejercicios

El campamento busca monitores. El formulario tiene dos bloques de campos que vienen de la librería de formularios de la asociación, `CamposDatos` y `CamposExperiencia`, y no se pueden tocar. Van sueltos dentro de la rejilla, así que no hay ningún elemento que los agrupe.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El formulario de monitores, por grupos",
  "consigna": "Sin tocar CamposDatos ni CamposExperiencia, y sin añadir ningún elemento a la rejilla: haz que «Revisar tus datos» lleve el foco al primer campo de «Tus datos» y «Revisar experiencia» al primero de «Experiencia». Además, al escribir en cualquier campo de «Tus datos» (y solo de ese grupo) tiene que aparecer «Tus datos: cambios sin guardar», y «Guardar tus datos» lo quita. Pista: un Fragment puede ir dentro de otro. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import CamposDatos from './CamposDatos'\nimport CamposExperiencia from './CamposExperiencia'\nimport './estilos.css'\n\nexport default function App() {\n  // 1. Una ref para cada grupo de campos\n\n  return (\n    <form className=\"rejilla\" onSubmit={(e) => e.preventDefault()}>\n      <h2>Quiero ser monitor o monitora</h2>\n      <h3>Tus datos</h3>\n      {/* 2. Envuelve cada grupo en un Fragment con su ref */}\n      <CamposDatos />\n      <p className=\"pie\">\n        <button type=\"button\">Guardar tus datos</button>\n        {/* 3. «Tus datos: cambios sin guardar» al escribir en este grupo */}\n      </p>\n      <h3>Experiencia</h3>\n      <CamposExperiencia />\n      <p className=\"pie\">\n        <button type=\"button\">Revisar tus datos</button>\n        <button type=\"button\">Revisar experiencia</button>\n      </p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "CamposDatos.jsx",
      "codigo": "// Viene así de la librería de formularios de la asociación: no lo toques.\nexport default function CamposDatos() {\n  return (\n    <>\n      <label htmlFor=\"datos-nombre\">Nombre</label>\n      <input id=\"datos-nombre\" />\n      <label htmlFor=\"datos-edad\">Edad</label>\n      <input id=\"datos-edad\" type=\"number\" min=\"18\" />\n      <label htmlFor=\"datos-telefono\">Teléfono</label>\n      <input id=\"datos-telefono\" type=\"tel\" />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "CamposExperiencia.jsx",
      "codigo": "// Viene así de la librería de formularios de la asociación: no lo toques.\nexport default function CamposExperiencia() {\n  return (\n    <>\n      <label htmlFor=\"experiencia-titulo\">Titulación</label>\n      <input id=\"experiencia-titulo\" />\n      <label htmlFor=\"experiencia-campamentos\">Campamentos anteriores</label>\n      <input id=\"experiencia-campamentos\" />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".rejilla {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 0.5rem 1rem;\n  align-items: center;\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\n/* Lo que ocupa las dos columnas */\n.rejilla h2,\n.rejilla h3,\n.pie {\n  grid-column: 1 / -1;\n  margin: 0.25rem 0 0;\n}\n\n.rejilla input {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.rejilla input:focus {\n  outline: 3px solid #f59e0b;\n  outline-offset: 1px;\n}\n\n.pie {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.pie button {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #15803d;\n  border-radius: 999px;\n  background: #f0fdf4;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "«Revisar tus datos» lleva el foco al campo «Nombre»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Revisar tus datos"
          }
        },
        {
          "teclear": "Iratxe"
        }
      ],
      "espera": {
        "etiqueta": "Nombre",
        "valor": "Iratxe"
      }
    },
    {
      "descripcion": "«Revisar experiencia» lleva el foco al campo «Titulación»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Revisar experiencia"
          }
        },
        {
          "teclear": "Monitora de tiempo libre"
        }
      ],
      "espera": {
        "etiqueta": "Titulación",
        "valor": "Monitora de tiempo libre"
      }
    },
    {
      "descripcion": "Al escribir en «Teléfono» aparece «Tus datos: cambios sin guardar»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "600123123"
          }
        }
      ],
      "espera": {
        "texto": "Tus datos: cambios sin guardar"
      }
    },
    {
      "descripcion": "Escribir en «Titulación», que es de otro grupo, no muestra ese aviso",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Titulación",
            "texto": "Socorrista"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Tus datos: cambios sin guardar"
        }
      }
    },
    {
      "descripcion": "«Guardar tus datos» quita el aviso",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Edad",
            "texto": "19"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar tus datos"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Tus datos: cambios sin guardar"
        }
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade un botón «Ir al último campo» que use `focusLast()` sobre «Experiencia». Después pon un `<a href="#ayuda">Ayuda</a>` justo detrás de `<CamposExperiencia />`, dentro del mismo Fragment: ¿adónde va ahora el foco?
2. Saca la parte de los cambios sin guardar a un componente `AvisaDeCambios` como el de la lección, y úsalo también en «Experiencia» con su propio aviso. ¿Te sigue haciendo falta el Fragment de dentro en `App`?
3. Escribe `CuentaClics`, un componente que envuelva lo que le pases y cuente con `addEventListener('click')` cuántas veces se ha pulsado algo de dentro. Úsalo alrededor de los botones de un `.pie` sin romper su flex.
4. Con `getClientRects()`, haz que un botón «Medir» diga cuántos píxeles de alto ocupa el grupo «Tus datos». Estrecha la ventana del navegador y vuelve a medir.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<Fragment> (<>...</>)",
      "descripcion": "La referencia oficial: la prop ref, el FragmentInstance con todos sus métodos, qué hijos toca y ejemplos con eventos, foco, scroll y observadores, incluido un IntersectionObserver compartido con la propiedad reactFragments.",
      "url": "https://react.dev/reference/react/Fragment",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19.3",
      "descripcion": "El anuncio de la versión: por qué llegan las refs en Fragment y el ejemplo InView, la versión de react.dev de SeVe.",
      "url": "https://react.dev/blog/2026/09/09/react-19-3",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Manipulating the DOM with Refs",
      "descripcion": "Las refs a elementos del DOM y las funciones de ref, la base de esta lección.",
      "url": "https://react.dev/learn/manipulating-the-dom-with-refs",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "IntersectionObserver",
      "descripcion": "La API del navegador que usa SeVe: opciones como threshold o rootMargin, y qué trae cada entrada.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver",
      "etiqueta": "MDN"
    },
    {
      "titulo": "ResizeObserver",
      "descripcion": "El otro observador que admite observeUsing: avisa cuando un elemento cambia de tamaño.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: getClientRects()",
      "descripcion": "Por qué un elemento en línea partido en varias líneas devuelve varios rectángulos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects",
      "etiqueta": "MDN"
    }
  ]
}
```
