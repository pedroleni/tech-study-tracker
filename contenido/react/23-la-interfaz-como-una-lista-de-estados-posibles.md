# La interfaz como una lista de estados posibles

- **Módulo:** Gestionar el estado
- **Slug:** `la-interfaz-como-una-lista-de-estados-posibles` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) — ver `contenido/react/TEMARIO.md` #23

---

## Qué es y para qué sirve

Un formulario que habla con un servidor no tiene una sola cara. En la reserva de la visita nocturna al Observatorio del Collado, la misma pantalla puede estar **vacía** (el botón no se puede pulsar), con alguien **escribiendo**, **enviando** (todo bloqueado y un «Comprobando plazas…»), con la reserva **confirmada** o con un **error** («Solo quedan 4 plazas»).

En la lección 10 viste que cada una de esas caras es una rama de un condicional. Esta lección te da el método para no dejarte ninguna y para guardarlas con el estado justo:

> **Antes de escribir manejadores, haz la lista de estados visuales posibles y de lo que lleva de uno a otro. Luego guarda en el estado lo mínimo para saber en cuál estás, y deja que el JSX describa cada uno.**

La diferencia entre imperativo y declarativo ya la viste en la lección 1, con el taxi y un contador. Con un contador apenas se nota. Con un formulario que espera una respuesta, se nota muchísimo.

## El mismo formulario, hecho a mano

Este es el formulario de reserva escrito con JavaScript a mano, como en el proyecto del gestor de tareas del temario de JavaScript. Cada evento tiene que acordarse de encender y apagar cada pieza: desactivar el campo, enseñar el aviso, ocultar el formulario... Y tiene un fallo escondido:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "La reserva a mano, con un fallo escondido",
  "consigna": "Escribe un nombre, elige 6 personas y pulsa «Reservar»: sale el error. Cambia a 2 personas y vuelve a reservar. La reserva se confirma... y el error sigue ahí. ¿Qué línea falta? Cuenta además cuántas líneas tocan hidden o disabled.",
  "html": "<h1>Visita nocturna al Observatorio del Collado</h1>\n<form id=\"formulario\">\n  <label>Nombre <input id=\"nombre\" /></label>\n  <label>\n    Personas\n    <select id=\"personas\">\n      <option>1</option>\n      <option selected>2</option>\n      <option>3</option>\n      <option>4</option>\n      <option>5</option>\n      <option>6</option>\n    </select>\n  </label>\n  <button id=\"boton\" disabled>Reservar</button>\n  <p id=\"enviando\" hidden>Comprobando plazas…</p>\n</form>\n<p id=\"error\" class=\"error\" hidden></p>\n<p id=\"exito\" class=\"exito\" hidden>¡Reserva confirmada! Os esperamos a las 22:00.</p>",
  "css": "body { font-family: system-ui, sans-serif; }\nh1 { font-size: 1.3rem; }\nform { display: grid; gap: 0.6rem; max-width: 22rem; }\nlabel { display: grid; gap: 0.25rem; font-weight: 600; }\ninput, select, button { font: inherit; }\nbutton { justify-self: start; }\n.error { color: #991b1b; }\n.exito { color: #166534; }",
  "js": "const formulario = document.querySelector('#formulario')\nconst nombre = document.querySelector('#nombre')\nconst personas = document.querySelector('#personas')\nconst boton = document.querySelector('#boton')\nconst enviando = document.querySelector('#enviando')\nconst error = document.querySelector('#error')\nconst exito = document.querySelector('#exito')\n\nnombre.addEventListener('input', () => {\n  boton.disabled = nombre.value.trim() === ''\n})\n\nformulario.addEventListener('submit', async (e) => {\n  e.preventDefault()\n  nombre.disabled = true\n  personas.disabled = true\n  boton.disabled = true\n  enviando.hidden = false\n  try {\n    await reservar(Number(personas.value))\n    formulario.hidden = true\n    exito.hidden = false\n  } catch (err) {\n    error.textContent = err.message\n    error.hidden = false\n    nombre.disabled = false\n    personas.disabled = false\n    boton.disabled = false\n  }\n  enviando.hidden = true\n})\n\n// Simula el servidor: tarda un segundo y solo quedan 4 plazas\nfunction reservar(cuantas) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (cuantas > 4) reject(new Error('Solo quedan 4 plazas para esta noche.'))\n      else resolve()\n    }, 1000)\n  })\n}",
  "pestañaInicial": "js"
}
```

Falta `error.hidden = true` al empezar el envío. Es un olvido fácil: el error lo enciende el `catch`, pero apagarlo le toca a otro evento, el siguiente envío, y nada te obliga a recordarlo. Son doce líneas que encienden o apagan algo, repartidas entre dos manejadores, y cada estado de la pantalla es la suma de todas ellas. **Añadir una pieza nueva (un botón «Cancelar», un aviso de «lista de espera») obliga a revisar cada evento** para decidir qué hace con ella.

React propone darle la vuelta: en vez de escribir las transiciones, describes cada estado.

## Pensar en estados: el método en cinco pasos

La documentación de React lo resume en cinco pasos, y los vas a seguir con esta misma reserva:

1. **Identificar** los estados visuales del componente.
2. **Ver qué provoca** cada cambio de estado.
3. **Representar** el estado en memoria con `useState`.
4. **Quitar** las variables de estado que no son esenciales.
5. **Conectar** los manejadores de eventos para que cambien el estado.

## Paso 1: identificar los estados visuales

Primero, todas las caras que puede ver la persona que reserva. Es lo mismo que haría alguien de diseño antes de dibujar: una pantalla por estado.

- **Vacío**: el formulario, con «Reservar» desactivado.
- **Escribiendo**: el formulario, con «Reservar» activo.
- **Enviando**: todo desactivado y el aviso «Comprobando plazas…».
- **Éxito**: el mensaje de confirmación en lugar del formulario.
- **Error**: como «escribiendo», más el mensaje de error.

Con la lista hecha, se puede escribir una **maqueta**: el componente con todo su aspecto, pero sin lógica, y con una prop que dice qué estado pintar. Aún no reacciona a nada; solo sirve para ver cada estado.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La maqueta: un estado cada vez, elegido con una prop",
  "codigo": "import './estilos.css'\n\nfunction Reserva({ estado = 'vacio' }) {\n  if (estado === 'exito') {\n    return <p className=\"exito\">¡Reserva confirmada! Os esperamos a las 22:00.</p>\n  }\n\n  return (\n    <form onSubmit={(e) => e.preventDefault()}>\n      <fieldset disabled={estado === 'enviando'}>\n        <label>\n          Nombre\n          <input />\n        </label>\n        <button disabled={estado === 'vacio' || estado === 'enviando'}>Reservar</button>\n      </fieldset>\n      {estado === 'enviando' && <p className=\"enviando\">Comprobando plazas…</p>}\n      {estado === 'error' && (\n        <p className=\"error\" role=\"alert\">\n          Solo quedan 4 plazas para esta noche.\n        </p>\n      )}\n    </form>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Visita nocturna al Observatorio del Collado</h1>\n      <Reserva estado=\"error\" />\n    </main>\n  )\n}",
  "css": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform,\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\ninput:disabled,\nselect:disabled {\n  background: #f1f5f9;\n  color: #64748b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 6px;\n  background: #312e81;\n  color: white;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  background: #a5b4fc;\n  cursor: not-allowed;\n}\n\n.enviando {\n  color: #4338ca;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.exito {\n  padding: 0.75rem;\n  border-left: 4px solid #15803d;\n  border-radius: 6px;\n  background: #f0fdf4;\n}",
  "anotaciones": [
    {
      "fragmento": "function Reserva({ estado = 'vacio' })",
      "nota": "La maqueta recibe el estado visual como prop. El nombre da igual; lo importante es que un solo valor decide qué se pinta."
    },
    {
      "fragmento": "if (estado === 'exito') {",
      "nota": "El éxito cambia la pantalla entera: un return temprano, como en la lección 10."
    },
    {
      "fragmento": "<fieldset disabled={estado === 'enviando'}>",
      "nota": "Un truco de HTML: un fieldset desactivado desactiva de golpe todos los campos y botones que contiene. Sin borde ni margen, no se nota que está ahí."
    },
    {
      "fragmento": "disabled={estado === 'vacio' || estado === 'enviando'}",
      "nota": "Cada detalle del aspecto es una condición sobre el estado. No hay ninguna línea que diga «ahora desactiva el botón»: dice cuándo está desactivado."
    },
    {
      "fragmento": "<Reserva estado=\"error\" />",
      "nota": "Para ver otro estado, cambias la prop. Aquí no se puede editar, pero en el escaparate de abajo sí."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

### El escaparate: todos los estados a la vez

Cambiar la prop a mano para ver cada estado es lento. Si el componente tiene muchos, compensa **pintarlos todos en la misma página**, uno debajo de otro. Así revisas el diseño completo de un vistazo y ves enseguida si un cambio de estilo rompe alguno.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los cinco estados de la reserva en una sola página",
  "consigna": "Cambia algo de la maqueta en Reserva.jsx, por ejemplo el texto del botón o el color de .error en estilos.css, y mira cómo queda en los cinco estados a la vez. Después añade un sexto estado, «completo», que diga «No quedan plazas esta noche» en lugar del formulario, y súmalo a ESTADOS.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Reserva from './Reserva'\nimport './estilos.css'\n\nconst ESTADOS = ['vacio', 'escribiendo', 'enviando', 'exito', 'error']\n\nexport default function App() {\n  return (\n    <main>\n      {ESTADOS.map((estado) => (\n        <section key={estado} className=\"muestra\">\n          <h2>Reserva ({estado})</h2>\n          <Reserva estado={estado} />\n        </section>\n      ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Reserva.jsx",
      "codigo": "export default function Reserva({ estado = 'vacio' }) {\n  if (estado === 'exito') {\n    return <p className=\"exito\">¡Reserva confirmada! Os esperamos a las 22:00.</p>\n  }\n\n  return (\n    <form onSubmit={(e) => e.preventDefault()}>\n      <fieldset disabled={estado === 'enviando'}>\n        <label>\n          Nombre\n          <input />\n        </label>\n        <label>\n          Personas\n          <select defaultValue=\"2\">\n            <option>1</option>\n            <option>2</option>\n            <option>3</option>\n            <option>4</option>\n            <option>5</option>\n            <option>6</option>\n          </select>\n        </label>\n        <button disabled={estado === 'vacio' || estado === 'enviando'}>Reservar</button>\n      </fieldset>\n      {estado === 'enviando' && <p className=\"enviando\">Comprobando plazas…</p>}\n      {estado === 'error' && (\n        <p className=\"error\" role=\"alert\">\n          Solo quedan 4 plazas para esta noche.\n        </p>\n      )}\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform,\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\ninput:disabled,\nselect:disabled {\n  background: #f1f5f9;\n  color: #64748b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 6px;\n  background: #312e81;\n  color: white;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  background: #a5b4fc;\n  cursor: not-allowed;\n}\n\n.enviando {\n  color: #4338ca;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.exito {\n  padding: 0.75rem;\n  border-left: 4px solid #15803d;\n  border-radius: 6px;\n  background: #f0fdf4;\n}\n\n.muestra {\n  display: grid;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 1px solid #cbd5e1;\n}\n\n.muestra h2 {\n  color: #475569;\n  font-size: 0.95rem;\n}\n"
    }
  ],
  "archivoInicial": "Reserva.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

A estas páginas se las llama **guías de estilo vivas** o *storybooks*, por **Storybook**, la herramienta más conocida para hacerlas en proyectos grandes: cada componente con todos sus estados, en su propio catálogo. Para un formulario basta con un `map`, como aquí.

## Paso 2: qué provoca cada cambio

Un estado cambia por dos tipos de causas:

- **Lo que hace una persona**: escribir, pulsar un botón, elegir una opción. Casi siempre, a través de un manejador de eventos.
- **Lo que hace el ordenador**: llega la respuesta del servidor, termina un temporizador, se carga una imagen.

En los dos casos, **para que la pantalla cambie hay que cambiar el estado**. Para la reserva:

| Cambio | Lo provoca | Quién |
|---|---|---|
| vacío → escribiendo | escribir el nombre | persona |
| escribiendo → vacío | borrar el nombre | persona |
| escribiendo → enviando | pulsar «Reservar» | persona |
| enviando → éxito | respuesta: hay plazas | ordenador |
| enviando → error | respuesta: no hay plazas | ordenador |
| error → enviando | corregir y volver a reservar | persona |

Un consejo de react.dev: dibújalo en papel, con un círculo por estado y una flecha por cambio. Si te falta una flecha (¿cómo se sale del error?) o te sobra una (¿se puede pasar de «vacío» a «enviando»?), lo descubres antes de escribir una línea.

## Paso 3: representar el estado con `useState`

Ahora toca decidir qué variables de estado hacen falta. Unas están claras: lo que rellena la persona (nombre y número de personas) y el error que llegue, si llega. Para saber en qué estado visual estás, la primera idea suele ser un booleano por estado:

```jsx
const [nombre, setNombre] = useState('')
const [personas, setPersonas] = useState('2')
const [error, setError] = useState(null)

const [estaVacio, setEstaVacio] = useState(true)
const [estaEscribiendo, setEstaEscribiendo] = useState(false)
const [estaEnviando, setEstaEnviando] = useState(false)
const [estaEnviado, setEstaEnviado] = useState(false)
const [hayError, setHayError] = useState(false)
```

Ocho variables. Funciona, y como primer borrador vale: es mejor empezar cubriendo todos los casos y simplificar después. Pero cada variable es **una pieza más que hay que mantener de acuerdo con las demás**. Mira lo que pasa con solo dos:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [estaEnviando, setEstaEnviando] = useState(false)\nconst [estaEnviado, setEstaEnviado] = useState(false)\n\nasync function manejarEnvio(e) {\n  e.preventDefault()\n  setEstaEnviando(true)\n  await reservar(nombre, personas) // tarda un segundo y hay plazas\n  setEstaEnviado(true)\n}\n\n// ...en el JSX:\n{estaEnviando && <p>Comprobando plazas…</p>}\n{estaEnviado && <p>¡Reserva confirmada!</p>}\n\n// Pulsas «Reservar» y esperas dos segundos. ¿Qué se ve?",
  "opciones": [
    "Solo «¡Reserva confirmada!»",
    "«Comprobando plazas…» y «¡Reserva confirmada!» a la vez",
    "Solo «Comprobando plazas…»"
  ],
  "correcta": 1,
  "explicacion": "Nadie vuelve a poner estaEnviando a false, así que las dos variables acaban valiendo true. Para React no es un error: pinta lo que dice el estado, y el estado dice algo imposible, enviando y enviado a la vez. Cuantas más piezas sueltas, más combinaciones imposibles caben."
}
```

## Paso 4: quitar lo que sobra

El objetivo es que **el estado en memoria no pueda describir una pantalla que nunca querrías enseñar**. React propone tres preguntas para cada variable:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Provoca una paradoja?",
      "texto": "estaEnviando y estaEnviado no pueden ser true a la vez, pero nada lo impide: dos booleanos dan cuatro combinaciones y solo tres tienen sentido. estaEscribiendo, estaEnviando y estaEnviado se sustituyen por una sola variable, estado, que solo puede valer una cosa cada vez: «escribiendo», «enviando» o «exito»."
    },
    {
      "titulo": "¿Ya está en otra variable?",
      "texto": "estaVacio dice lo mismo que nombre.trim() === ''. Guardarlo aparte es arriesgarse a que un día no coincidan; calculado en cada render, no puede fallar."
    },
    {
      "titulo": "¿Se saca de otra al revés?",
      "texto": "hayError es true exactamente cuando error no es null. Basta con preguntar error !== null."
    }
  ]
}
```

Las cinco variables booleanas daban 2⁵ = 32 combinaciones para cinco estados válidos. Tras la limpieza quedan cuatro variables, y ninguna se puede quitar sin perder información:

```jsx
const [nombre, setNombre] = useState('')
const [personas, setPersonas] = useState('2')
const [error, setError] = useState(null)
const [estado, setEstado] = useState('escribiendo') // 'escribiendo' | 'enviando' | 'exito'
```

Los cinco estados visuales siguen ahí, pero dos ya no se guardan: se **calculan**. «Vacío» es estar escribiendo con el nombre en blanco, y «error» es estar escribiendo con un `error` guardado. **Los estados visuales y las variables de estado no son lo mismo**: los primeros son lo que se ve; las segundas, lo mínimo para poder calcularlo.

Aún queda alguna combinación imposible: nada impide tener un `error` guardado con `estado` en `'exito'`. Para cerrar también esa puerta, React propone un *reducer*, que verás en la lección 27. Y la lección 24 convierte estas preguntas en principios generales para elegir la estructura de cualquier estado.

## Paso 5: conectar los manejadores

Solo queda escribir los manejadores que cambian el estado. Fíjate en que ninguno toca el aspecto de la pantalla: cada uno dice **a qué estado se pasa**, y el JSX ya sabe cómo se ve cada estado.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La reserva completa, conectada",
  "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PLAZAS_LIBRES = 4\nconst OPCIONES = ['1', '2', '3', '4', '5', '6']\n\n// Simula el servidor: no hay red en la vista previa\nfunction reservar(personas) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (personas > PLAZAS_LIBRES) {\n        reject(new Error(`Solo quedan ${PLAZAS_LIBRES} plazas para esta noche.`))\n      } else {\n        resolve()\n      }\n    }, 1000)\n  })\n}\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  const [personas, setPersonas] = useState('2')\n  const [error, setError] = useState(null)\n  const [estado, setEstado] = useState('escribiendo') // 'escribiendo' | 'enviando' | 'exito'\n\n  async function manejarEnvio(e) {\n    e.preventDefault()\n    setEstado('enviando')\n    setError(null)\n    try {\n      await reservar(Number(personas))\n      setEstado('exito')\n    } catch (err) {\n      setError(err)\n      setEstado('escribiendo')\n    }\n  }\n\n  if (estado === 'exito') {\n    return (\n      <main>\n        <h1>Visita nocturna al Observatorio del Collado</h1>\n        <p className=\"exito\">¡Reserva confirmada, {nombre}! Os esperamos a las 22:00.</p>\n      </main>\n    )\n  }\n\n  const vacio = nombre.trim() === ''\n  const enviando = estado === 'enviando'\n\n  return (\n    <main>\n      <h1>Visita nocturna al Observatorio del Collado</h1>\n      <form onSubmit={manejarEnvio}>\n        <fieldset disabled={enviando}>\n          <label>\n            Nombre\n            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n          </label>\n          <label>\n            Personas\n            <select value={personas} onChange={(e) => setPersonas(e.target.value)}>\n              {OPCIONES.map((n) => (\n                <option key={n} value={n}>\n                  {n}\n                </option>\n              ))}\n            </select>\n          </label>\n          <button disabled={vacio}>Reservar</button>\n        </fieldset>\n        {enviando && <p className=\"enviando\">Comprobando plazas…</p>}\n        {error !== null && (\n          <p className=\"error\" role=\"alert\">\n            {error.message}\n          </p>\n        )}\n      </form>\n    </main>\n  )\n}",
  "css": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform,\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\ninput:disabled,\nselect:disabled {\n  background: #f1f5f9;\n  color: #64748b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 6px;\n  background: #312e81;\n  color: white;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  background: #a5b4fc;\n  cursor: not-allowed;\n}\n\n.enviando {\n  color: #4338ca;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.exito {\n  padding: 0.75rem;\n  border-left: 4px solid #15803d;\n  border-radius: 6px;\n  background: #f0fdf4;\n}",
  "anotaciones": [
    {
      "fragmento": "function reservar(personas) {",
      "nota": "La vista previa no tiene red, así que una promesa con setTimeout hace de servidor: tarda un segundo y rechaza la reserva si se piden más plazas de las que quedan. Para tu código es igual que esperar una respuesta de verdad."
    },
    {
      "fragmento": "useState('escribiendo')",
      "nota": "Una sola variable para el estado visual, con tres valores posibles. Nunca puede estar enviando y en éxito a la vez: solo cabe un valor."
    },
    {
      "fragmento": "setEstado('enviando')",
      "nota": "La persona pulsa «Reservar»: se pasa a enviando y se borra el error anterior, si lo había. Sin ese setError(null), el aviso viejo seguiría a la vista mientras se comprueba, el fallo de la versión a mano."
    },
    {
      "fragmento": "await reservar(Number(personas))",
      "nota": "Aquí espera la respuesta del ordenador. El valor del select es texto, así que se convierte, como en la lección 22."
    },
    {
      "fragmento": "setEstado('exito')",
      "nota": "Hay plazas: se pasa a éxito. Si la promesa se rechaza, el catch guarda el error y vuelve a escribiendo, con los campos tal como estaban para corregirlos."
    },
    {
      "fragmento": "const vacio = nombre.trim() === ''",
      "nota": "Vacío no es estado: se calcula en cada render a partir de nombre. No puede desincronizarse porque no se guarda."
    },
    {
      "fragmento": "<fieldset disabled={enviando}>",
      "nota": "Mientras se envía, todo el formulario queda desactivado: ni se puede cambiar lo enviado ni pulsar dos veces."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Pruébalo en la vista previa: reserva para 6 personas, mira el error, corrige a 2 y vuelve a reservar. El error desaparece mientras se comprueba y la confirmación llega sola. El código es más largo que la versión a mano, y es lo normal. A cambio, **cada estado se lee entero en el JSX**, y añadir uno nuevo es añadir un valor y su rama, sin repasar cada manejador.

Un detalle del manejador asíncrono: después del `await`, `nombre` y `personas` siguen valiendo lo que valían en el render en que se pulsó «Reservar». Es el estado como instantánea de la lección 18. Aquí da igual, porque el formulario está bloqueado mientras se espera.

## Simular el servidor con una promesa

En una aplicación real, `reservar` haría un `fetch` a tu servidor. La vista previa de esta web no tiene red, así que la imitas con lo que ya sabes del temario de JavaScript: **una promesa que se resuelve o se rechaza dentro de un `setTimeout`**.

```js
function comprobarPlazas(personas) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (personas > 4) reject(new Error('Solo quedan 4 plazas.'))
      else resolve()
    }, 1000) // el «viaje» al servidor
  })
}
```

Para tu componente no hay diferencia: espera con `await`, y si la promesa se rechaza, el error llega al `catch`. Simular tiene además una ventaja: controlas el retraso y el resultado, así que puedes forzar el caso de error tantas veces como quieras. Cómo pedir datos a un servidor de verdad lo verás en el módulo 7 (lección 52).

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Cada estado visual necesita su variable de estado",
      "realidad": "La reserva tiene cinco estados visuales y solo una variable para elegir entre ellos; vacío y error se calculan. Lo que se ve y lo que se guarda no tienen por qué coincidir uno a uno."
    },
    {
      "mito": "Más variables de estado dan más control",
      "realidad": "Dan más piezas que mantener de acuerdo. Cada booleano dobla las combinaciones posibles, y casi todas las nuevas son imposibles."
    },
    {
      "mito": "La versión declarativa es más corta",
      "realidad": "A menudo es más larga. Lo que gana es que cada estado se lee entero en un sitio, y que añadir uno no obliga a repasar todos los eventos."
    },
    {
      "mito": "Este método solo sirve para formularios",
      "realidad": "Sirve para cualquier pieza con varios momentos: una lista que carga, un reproductor, un asistente de varios pasos, una subida de archivos."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "roles",
  "titulo": "Interfaces que son una lista de estados",
  "roles": [
    {
      "etiqueta": "Datos que se cargan",
      "rol": "cargando, error, vacío, con datos",
      "descripcion": "Cualquier lista que viene de un servidor. «Vacío» no es un error: es «no hay resultados», y merece su propio mensaje."
    },
    {
      "etiqueta": "Asistentes por pasos",
      "rol": "paso 1, paso 2, resumen, enviado",
      "descripcion": "Un pago, un alta, una reserva larga. El paso actual es un solo valor, no un booleano por paso."
    },
    {
      "etiqueta": "Reproductores",
      "rol": "parado, reproduciendo, en pausa",
      "descripcion": "Un podcast o un vídeo. Cada botón dice a qué estado se pasa, y la interfaz se deduce de él."
    },
    {
      "etiqueta": "Subidas de archivos",
      "rol": "eligiendo, subiendo, subido, fallo",
      "descripcion": "Con la barra de progreso como dato aparte, que solo tiene sentido mientras se sube."
    }
  ]
}
```

## Errores típicos

**Booleanos que se contradicen.** Lo has visto en el paso 3: `estaEnviando` y `estaEnviado` a la vez. Si dos variables no pueden ser verdad al mismo tiempo, son una sola variable con varios valores.

**Guardar lo que se puede calcular.** Un `estaVacio` aparte del `nombre` funciona... hasta que algún código cambia uno y se olvida del otro:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  const [estaVacio, setEstaVacio] = useState(true)\n\n  function manejarCambio(e) {\n    setNombre(e.target.value)\n    setEstaVacio(e.target.value === '')\n  }\n\n  return (\n    <form onSubmit={(e) => e.preventDefault()}>\n      <label>\n        Nombre\n        <input value={nombre} onChange={manejarCambio} />\n      </label>\n      <button type=\"button\" onClick={() => setNombre('')}>\n        Borrar\n      </button>\n      <button disabled={estaVacio}>Reservar</button>\n    </form>\n  )\n}\n\n// Escribes «Marta» y pulsas «Borrar». ¿Cómo queda «Reservar»?",
  "opciones": [
    "Desactivado, porque el nombre está vacío",
    "Activado, aunque el nombre está vacío",
    "Desaparece del formulario"
  ],
  "correcta": 1,
  "explicacion": "«Borrar» vacía nombre, pero no toca estaVacio, que se quedó en false al escribir «Marta». El campo está vacío y el botón activo: dos piezas del estado que ya no coinciden. Con const estaVacio = nombre === '', calculado en cada render, este fallo no puede ocurrir."
}
```

**No limpiar el error al reintentar.** Si el error solo se borra cuando llega una respuesta buena, el aviso viejo se queda a la vista mientras se comprueba el segundo intento, junto a «Comprobando plazas…». Es el fallo de la versión a mano, y se arregla igual en las dos: el envío empieza con `setError(null)`.

**No bloquear nada mientras se envía.** Si el botón sigue activo durante el envío, cada clic vuelve a llamar a `reservar`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos clics, dos reservas",
  "consigna": "Haz doble clic en «Reservar»: la consola enseña que al observatorio le llegan dos reservas de Marta. Arréglalo con lo que ya tienes en el estado: desactiva el botón mientras estado vale enviando y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\n// Simula el servidor: apunta cada reserva y tarda 1,5 segundos en contestar\nfunction reservar(quien) {\n  console.log('El observatorio recibe una reserva de ' + quien)\n  return new Promise((resolve) => setTimeout(resolve, 1500))\n}\n\nexport default function App() {\n  const [nombre, setNombre] = useState('Marta')\n  const [estado, setEstado] = useState('escribiendo') // 'escribiendo' | 'enviando' | 'exito'\n\n  async function manejarEnvio(e) {\n    e.preventDefault()\n    setEstado('enviando')\n    await reservar(nombre)\n    setEstado('exito')\n  }\n\n  return (\n    <main>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nombre\n          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n        </label>\n        <button>Reservar</button>\n        {estado === 'enviando' && <p className=\"enviando\">Comprobando plazas…</p>}\n        {estado === 'exito' && <p className=\"exito\">¡Reserva confirmada!</p>}\n      </form>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform,\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\ninput:disabled,\nselect:disabled {\n  background: #f1f5f9;\n  color: #64748b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 6px;\n  background: #312e81;\n  color: white;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  background: #a5b4fc;\n  cursor: not-allowed;\n}\n\n.enviando {\n  color: #4338ca;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.exito {\n  padding: 0.75rem;\n  border-left: 4px solid #15803d;\n  border-radius: 6px;\n  background: #f0fdf4;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

React aplica el cambio de estado del primer clic antes de que llegue el segundo, así que con `disabled={estado === 'enviando'}` el segundo clic encuentra el botón ya desactivado. Si hay más campos, desactiva el `fieldset` entero, como en la reserva completa: tampoco tiene sentido cambiar los datos de algo que ya se está enviando.

**Una errata en el nombre de un estado.** `estado === 'éxito'` con tilde, cuando en `setEstado` escribiste `'exito'`, no da ningún error: la condición nunca se cumple y la confirmación no aparece jamás. Escribe en un comentario junto al `useState` los valores posibles, como en los ejemplos, y escríbelos siempre igual. TypeScript lo comprueba por ti (lección 73).

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Canjear una tarjeta regalo, sin estados imposibles",
  "consigna": "Prueba REGALO-25 y un código inventado: «Comprobando el código…» no se va nunca, el formulario sigue ahí tras canjear y se puede enviar un código vacío. Sigue los cinco pasos: cambia los dos booleanos por un solo estado (escribiendo, enviando o canjeada), calcula lo demás y conecta el manejador. Al canjear, solo el mensaje del saldo. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { canjearTarjeta } from './tienda'\nimport './estilos.css'\n\nexport default function App() {\n  const [codigo, setCodigo] = useState('')\n  const [saldo, setSaldo] = useState(0)\n  const [error, setError] = useState(null)\n  // Dos booleanos que deberían ser un solo estado\n  const [estaEnviando, setEstaEnviando] = useState(false)\n  const [estaCanjeada, setEstaCanjeada] = useState(false)\n\n  async function manejarEnvio(e) {\n    e.preventDefault()\n    setEstaEnviando(true)\n    try {\n      setSaldo(await canjearTarjeta(codigo))\n      setEstaCanjeada(true)\n    } catch (err) {\n      setError(err)\n    }\n  }\n\n  return (\n    <main>\n      <h1>Librería Entrelíneas: canjear una tarjeta regalo</h1>\n      {estaCanjeada && (\n        <p className=\"exito\">Tarjeta canjeada: tienes {saldo} € para gastar en libros.</p>\n      )}\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Código de la tarjeta\n          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} />\n        </label>\n        <button>Canjear</button>\n        {estaEnviando && <p className=\"enviando\">Comprobando el código…</p>}\n        {error !== null && (\n          <p className=\"error\" role=\"alert\">\n            {error.message}\n          </p>\n        )}\n      </form>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "tienda.jsx",
      "codigo": "// Simula el servidor de la librería: no hay red en la vista previa\nconst TARJETAS = {\n  'REGALO-25': 25,\n  'REGALO-50': 50,\n}\n\nexport function canjearTarjeta(codigo) {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      const saldo = TARJETAS[codigo.trim().toUpperCase()]\n      if (saldo) {\n        resolve(saldo)\n      } else {\n        reject(new Error('Ese código no existe. Revísalo y prueba otra vez.'))\n      }\n    }, 300)\n  })\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform,\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\ninput:disabled,\nselect:disabled {\n  background: #f1f5f9;\n  color: #64748b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 6px;\n  background: #312e81;\n  color: white;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  background: #a5b4fc;\n  cursor: not-allowed;\n}\n\n.enviando {\n  color: #4338ca;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.exito {\n  padding: 0.75rem;\n  border-left: 4px solid #15803d;\n  border-radius: 6px;\n  background: #f0fdf4;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Con el código vacío, pulsar «Canjear» no envía nada",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Canjear"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Comprobando el código…"
        }
      }
    },
    {
      "descripcion": "Mientras se comprueba un código, aparece «Comprobando el código…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Código de la tarjeta",
            "texto": "REGALO-25"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Canjear"
          }
        }
      ],
      "espera": {
        "texto": "Comprobando el código…"
      }
    },
    {
      "descripcion": "Con REGALO-25 aparece el saldo: 25 € para gastar en libros",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Código de la tarjeta",
            "texto": "REGALO-25"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Canjear"
          }
        }
      ],
      "espera": {
        "texto": "Tarjeta canjeada: tienes 25 € para gastar en libros."
      }
    },
    {
      "descripcion": "Tras canjear la tarjeta, el formulario desaparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Código de la tarjeta",
            "texto": "REGALO-50"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Canjear"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Canjear"
        }
      }
    },
    {
      "descripcion": "Con un código que no existe, «Comprobando el código…» desaparece al llegar el error",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Código de la tarjeta",
            "texto": "LIBRO-10"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Canjear"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Comprobando el código…"
        }
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En la tarjeta regalo, añade un botón «Canjear otra tarjeta» en el mensaje del saldo que vuelva al estado inicial con el campo vacío.
2. En la reserva del observatorio, cuando falla por falta de plazas, ofrece un botón «Apuntarme a la lista de espera» que lleve a un estado nuevo, `'en-espera'`, con su propio mensaje. Añádelo también al escaparate.
3. Dibuja en papel los estados de un reproductor de pódcast (parado, cargando, reproduciendo, en pausa, error) y las flechas entre ellos. Después escribe su maqueta con una prop `estado` y su escaparate.
4. Añade a la versión a mano del principio la lista de espera del reto 2. Cuenta cuántas líneas has tocado en cada versión.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Reacting to Input with State",
      "descripcion": "La página de react.dev de la que sale el método de los cinco pasos, con el ejemplo de un cuestionario y retos al final.",
      "url": "https://react.dev/learn/reacting-to-input-with-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Choosing the State Structure",
      "descripcion": "Los principios para decidir qué guardar en el estado: agrupar, evitar contradicciones, redundancias y duplicados. Es la lección 24.",
      "url": "https://react.dev/learn/choosing-the-state-structure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Extracting State Logic into a Reducer",
      "descripcion": "El siguiente paso para quitar los estados imposibles que quedan: un reducer. Es la lección 27.",
      "url": "https://react.dev/learn/extracting-state-logic-into-a-reducer",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<fieldset>: el atributo disabled",
      "descripcion": "Cómo un fieldset desactivado desactiva todos los controles que contiene.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Storybook",
      "descripcion": "La herramienta más usada para construir escaparates de componentes con todos sus estados.",
      "url": "https://storybook.js.org/",
      "etiqueta": "Storybook"
    }
  ]
}
```
