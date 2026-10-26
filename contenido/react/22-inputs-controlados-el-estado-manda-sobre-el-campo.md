# Inputs controlados: el estado manda sobre el campo

- **Módulo:** Interactividad
- **Slug:** `inputs-controlados-el-estado-manda-sobre-el-campo` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [`<input>`](https://react.dev/reference/react-dom/components/input) + [`<select>`](https://react.dev/reference/react-dom/components/select) + [`<textarea>`](https://react.dev/reference/react-dom/components/textarea) — ver `contenido/react/TEMARIO.md` #22

---

## Qué es y para qué sirve

En HTML, un `<input>` guarda su propio valor: escribes y el navegador lo apunta en el DOM. Si tu código quiere saber qué pone, va a buscarlo con `campo.value`. En React puedes seguir trabajando así, pero lo habitual es darle la vuelta:

> **En un input controlado, el campo enseña siempre lo que dice el estado. Escribir no cambia el campo por su cuenta: pide un cambio con `onChange`, tú actualizas el estado y React vuelve a pintar el campo con el valor nuevo.**

¿Para qué tanta vuelta? Para que el texto viva en una variable de estado desde la primera tecla, y cualquier parte de la interfaz pueda usarlo mientras escribes. En la inscripción de la Carrera de los Molinos, el dorsal se rellena a la vez que el campo:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El dorsal se escribe mientras tecleas",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n\n  return (\n    <main>\n      <h1>Carrera de los Molinos</h1>\n      <label>\n        Nombre en el dorsal\n        <input\n          value={nombre}\n          onChange={(e) => setNombre(e.target.value)}\n          maxLength={12}\n        />\n      </label>\n      <p className=\"contador\">{nombre.length}/12</p>\n      <div className=\"dorsal\">\n        <span className=\"numero\">0427</span>\n        <span>{nombre || 'Tu nombre'}</span>\n      </div>\n    </main>\n  )\n}",
  "css": "main { display: grid; gap: 0.5rem; max-width: 22rem; font-family: system-ui, sans-serif; }\nh1 { margin: 0; font-size: 1.35rem; }\nlabel { display: grid; gap: 0.25rem; font-weight: 600; }\ninput { font: inherit; font-weight: 400; padding: 0.4rem 0.5rem; border: 1px solid #94a3b8; border-radius: 6px; }\n.contador { margin: 0; justify-self: end; color: #475569; font-size: 0.9rem; }\n.dorsal { display: grid; justify-items: center; padding: 0.75rem 1rem; border: 2px solid #0f172a; border-radius: 8px; background: #fef9c3; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }\n.numero { font-size: 2.5rem; font-weight: 800; line-height: 1; }",
  "anotaciones": [
    {
      "fragmento": "useState('')",
      "nota": "El texto del campo vive en el estado. Empieza como cadena vacía, no como undefined: más abajo verás por qué importa."
    },
    {
      "fragmento": "value={nombre}",
      "nota": "El campo enseña exactamente lo que vale nombre. React lo escribe en cada render: el estado manda."
    },
    {
      "fragmento": "onChange={(e) => setNombre(e.target.value)}",
      "nota": "Con cada tecla, e.target.value trae el texto que el campo tendría con esa tecla. Lo guardas en el estado, React vuelve a renderizar y el campo muestra el valor nuevo."
    },
    {
      "fragmento": "maxLength={12}",
      "nota": "Un atributo de HTML de toda la vida: el navegador no deja escribir más de 12 caracteres. Funciona igual en un campo controlado."
    },
    {
      "fragmento": "{nombre.length}/12",
      "nota": "Como el texto está en el estado, cualquier parte del componente lo usa al momento: un contador, una vista previa, un botón que se activa..."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Escribe en el campo: el contador y el dorsal cambian con cada tecla, y a los 12 caracteres el campo no admite más. Fíjate también en que escribes en minúsculas y el dorsal sale en mayúsculas: eso lo hace el CSS (`text-transform: uppercase`), no el estado. Volverás a ello al hablar de transformar el texto.

## El ciclo de una tecla

Esto es lo que pasa cuando el campo dice «Luci» y pulsas la «a»:

1. El navegador escribe la «a»: en el DOM, el campo ya dice «Lucia».
2. React llama a tu `onChange`, y en `e.target.value` llega «Lucia».
3. Tu manejador llama a `setNombre('Lucia')`.
4. React vuelve a ejecutar el componente. En el JSX nuevo, `value` vale «Lucia», que es lo que el campo ya tenía: no hay nada que cambiar.

Si vienes del temario de JavaScript, fíjate en el paso 2: **el `onChange` de React salta con cada tecla**, como el evento `input` del navegador, y no al salir del campo como el evento `change` nativo.

El paso 4 es la clave. Después de cada evento, React deja el campo con el valor que dice el estado: **si no actualizas el estado, React devuelve el campo a lo que había**. Ponlo a prueba:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n\n  return (\n    <label>\n      Nombre en el dorsal\n      <input\n        value={nombre}\n        onChange={(e) => console.log(e.target.value)}\n      />\n    </label>\n  )\n}\n\n// Escribes «Ana» en el campo. ¿Qué pasa?",
  "opciones": [
    "El campo muestra «Ana» y la consola, «A», «An» y «Ana»",
    "El campo se queda vacío y la consola muestra «A», «n» y «a»",
    "El campo se queda vacío y la consola no muestra nada",
    "El campo muestra «Ana» y la consola no muestra nada"
  ],
  "correcta": 1,
  "explicacion": "Cada tecla dispara onChange con lo que el campo tendría: la primera vez, «A». Pero nadie cambia el estado, así que React devuelve el campo a nombre, que sigue siendo una cadena vacía. La siguiente tecla vuelve a partir de un campo vacío: llega «n», y después «a». Comprobado con React 19.3.1 en Chrome."
}
```

## Controlado o no controlado: `value` o `defaultValue`

Un campo sin `value` es **no controlado**: el navegador guarda lo que escribes y React no se entera. Si quieres que empiece con algo escrito, `defaultValue` le da un valor **inicial**; a partir de ahí, el campo es del navegador. Lo que vale en cada momento se lee cuando hace falta, normalmente al enviar el formulario (o con una ref, en el módulo 5).

Con `value`, el campo es **controlado**: su valor sale del estado en cada render. Y eso tiene una consecuencia muy práctica: **tu código también puede cambiar lo que pone el campo**, solo con cambiar el estado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos campos, dos dueños",
  "consigna": "Escribe algo en los dos campos y después pulsa los botones. Solo obedece el controlado: es el único cuyo valor sale del estado. El otro es del navegador; React le dio un valor inicial con defaultValue y no lo ha vuelto a tocar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst NOMBRE_ANO_PASADO = 'Lucía Prieto'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n\n  return (\n    <main>\n      <h1>Inscripción</h1>\n      <label>\n        Nombre (no controlado)\n        <input defaultValue=\"Lucía\" />\n      </label>\n      <label>\n        Nombre (controlado)\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <p>En el estado: «{nombre}»</p>\n      <div className=\"botones\">\n        <button onClick={() => setNombre(NOMBRE_ANO_PASADO)}>\n          Usar mis datos del año pasado\n        </button>\n        <button onClick={() => setNombre('')}>Borrar</button>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos maneras de tener un campo",
  "roles": [
    {
      "etiqueta": "No controlado",
      "rol": "defaultValue (o nada)",
      "descripcion": "El navegador guarda el valor y React solo pone el inicial. Lo lees cuando lo necesitas, normalmente al enviar. Menos código, pero la interfaz no se entera de cada tecla."
    },
    {
      "etiqueta": "Controlado",
      "rol": "value + onChange",
      "descripcion": "El estado guarda el valor y React lo copia en el campo en cada render. Algo más de código, a cambio de tener el valor siempre a mano y poder cambiarlo desde el código."
    }
  ]
}
```

Un mismo campo no puede ser las dos cosas: lleva `value` o lleva `defaultValue`. Si le pones los dos, React protesta en la consola con un aviso que dice, entre otras cosas, *«Input elements must be either controlled or uncontrolled»*: o lo controlas tú o lo controla el navegador. Y, como verás en los errores típicos, tampoco puede pasar de uno a otro a mitad de camino.

## `value` sin `onChange`: un campo bloqueado

Si le das `value` a un campo y no le das `onChange`, el paso 3 del ciclo no existe: nadie actualiza el estado, y React devuelve el campo a su valor tras cada tecla. El resultado es un campo en el que no se puede escribir.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un club que no se deja cambiar",
  "consigna": "Intenta cambiar el club: el campo no se mueve, y la consola explica por qué. Arréglalo de las tres formas que propone el aviso, una cada vez: un onChange que llame a setClub, defaultValue en lugar de value, y readOnly. ¿En cuál se puede escribir? ¿En cuál cambia el párrafo de abajo?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [club, setClub] = useState('Atletismo Molinos')\n\n  return (\n    <main>\n      <h1>Datos del corredor</h1>\n      <label>\n        Club\n        <input value={club} />\n      </label>\n      <p>Club en el estado: {club}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Este es el aviso de React 19.3.1:

```text
You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
```

Es decir: «Has pasado `value` a un campo de formulario sin manejador `onChange`. El campo será de solo lectura. Si tiene que poder cambiarse, usa `defaultValue`. Si no, pon `onChange` o `readOnly`». Cada salida es para un caso distinto:

- **Un `onChange` que actualiza el estado**: quieres un campo controlado. Es lo normal. Solo con esta el párrafo sigue al campo.
- **`defaultValue` en lugar de `value`**: solo querías un valor inicial. El campo pasa a ser no controlado: se puede escribir, pero el estado no se entera.
- **`readOnly`**: el campo es de solo lectura a propósito, por ejemplo un dato que se enseña pero no se edita. Con `readOnly` el aviso desaparece.

Las casillas tienen su versión del aviso, con `checked` y `defaultChecked`. La del `<select>` acaba en *«Otherwise, set `onChange`»*, sin `readOnly`, porque en HTML un desplegable no admite ese atributo.

## Casillas y botones de opción: `checked`

En una casilla (`type="checkbox"`) lo que cambia no es un texto, sino un sí o un no. Por eso **se controla con `checked`, un booleano, y se lee con `e.target.checked`**. Los botones de opción (`type="radio"`) también se controlan con `checked`, con un matiz: cada uno lleva un `value` fijo que dice qué significa, y está marcado si ese valor coincide con el del estado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La camiseta y su talla",
  "consigna": "Marca la camiseta, elige talla y mira el total. Desmarca la camiseta y vuelve a marcarla: la talla que elegiste sigue ahí. Después añade la talla XXL al array TALLAS: aparece sin tocar nada más.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PRECIO_INSCRIPCION = 15\nconst PRECIO_CAMISETA = 8\nconst TALLAS = ['S', 'M', 'L', 'XL']\n\nexport default function App() {\n  const [camiseta, setCamiseta] = useState(false)\n  const [talla, setTalla] = useState('M')\n\n  const total = PRECIO_INSCRIPCION + (camiseta ? PRECIO_CAMISETA : 0)\n\n  return (\n    <main>\n      <h1>Extras de la inscripción</h1>\n      <label className=\"casilla\">\n        <input\n          type=\"checkbox\"\n          checked={camiseta}\n          onChange={(e) => setCamiseta(e.target.checked)}\n        />\n        Quiero la camiseta conmemorativa (+{PRECIO_CAMISETA} €)\n      </label>\n\n      {camiseta && (\n        <fieldset>\n          <legend>Talla</legend>\n          {TALLAS.map((t) => (\n            <label key={t} className=\"casilla\">\n              <input\n                type=\"radio\"\n                name=\"talla\"\n                value={t}\n                checked={talla === t}\n                onChange={(e) => setTalla(e.target.value)}\n              />\n              {t}\n            </label>\n          ))}\n        </fieldset>\n      )}\n\n      <p>\n        Total: {total} €{camiseta && ` (camiseta talla ${talla})`}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Tres detalles de este ejemplo:

- **Todos los botones de opción comparten `name="talla"`.** Así el navegador los trata como un grupo: con el teclado, el tabulador entra una vez en el grupo y las flechas se mueven entre las opciones.
- **`onChange` solo salta en la opción que se marca.** Las demás se desmarcan porque en el siguiente render su `checked` deja de ser `true`: no hace falta tocarlas.
- **Ocultar las tallas no borra la talla.** El estado vive en `App`, que sigue ahí aunque el `fieldset` desaparezca.

## Desplegables: el `value` va en el `<select>`

En HTML, la opción elegida se marca con `selected` en su `<option>`. En React no: **el `<select>` lleva el `value`, y React marca la opción cuyo `value` coincide**. Así el dato está en un solo sitio, igual que en un campo de texto.

Con `multiple`, el `value` es **un array** con los valores de las opciones marcadas. Para leerlas en `onChange` se usa `e.target.selectedOptions`, la lista de opciones elegidas del propio `<select>`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Distancia y servicios en meta",
  "consigna": "Elige otra distancia y varios servicios (Ctrl o Cmd y clic). Después borra value={distancia} y su onChange, y marca la media maratón con selected en su option, como en HTML: sale elegida, pero mira la consola.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst DISTANCIAS = [\n  { id: '5k', nombre: '5 km', precio: 12 },\n  { id: '10k', nombre: '10 km', precio: 15 },\n  { id: '21k', nombre: 'Media maratón', precio: 25 },\n]\n\nconst SERVICIOS = ['Guardarropa', 'Duchas', 'Fisioterapia', 'Foto en meta']\n\nexport default function App() {\n  const [distancia, setDistancia] = useState('10k')\n  const [servicios, setServicios] = useState(['Duchas'])\n\n  const elegida = DISTANCIAS.find((d) => d.id === distancia)\n\n  function manejarServicios(e) {\n    const marcados = [...e.target.selectedOptions].map((opcion) => opcion.value)\n    setServicios(marcados)\n  }\n\n  return (\n    <main>\n      <label>\n        Distancia\n        <select value={distancia} onChange={(e) => setDistancia(e.target.value)}>\n          {DISTANCIAS.map((d) => (\n            <option key={d.id} value={d.id}>\n              {d.nombre}\n            </option>\n          ))}\n        </select>\n      </label>\n      <p>\n        {elegida.nombre}: {elegida.precio} €\n      </p>\n\n      <label>\n        Servicios en meta\n        <select multiple size={4} value={servicios} onChange={manejarServicios}>\n          {SERVICIOS.map((s) => (\n            <option key={s} value={s}>\n              {s}\n            </option>\n          ))}\n        </select>\n      </label>\n      <p>Has elegido: {servicios.length > 0 ? servicios.join(', ') : 'ninguno'}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Con `selected` la opción sale elegida, pero React avisa:

```text
Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>.
```

Es decir: «Usa `defaultValue` o `value` en el `<select>` en vez de poner `selected` en un `<option>`». Si solo quieres una opción inicial, `<select defaultValue="21k">`; si quieres controlarla, `value` y `onChange`. Y en un `<select multiple>`, el `value` tiene que ser un array aunque solo haya una opción marcada: con un texto suelto, React avisa con *«The `value` prop supplied to <select> must be an array if `multiple` is true»*.

Un apunte de diseño: para elegir varias opciones de un `<select multiple>` hay que mantener pulsado Ctrl (Cmd en Mac), y mucha gente no lo sabe. Con pocas opciones, una lista de casillas suele ser más cómoda.

## `<textarea>`: el texto también va en `value`

En HTML, el texto inicial de un `<textarea>` va entre sus etiquetas. En React no: **un `<textarea>` funciona igual que un `<input>`, con `value` (controlado) o `defaultValue` (no controlado)**. Si le pones el texto como hijo, React avisa:

```text
Use the `defaultValue` or `value` props instead of setting children on <textarea>.
```

Es decir: «Usa `defaultValue` o `value` en vez de poner hijos en el `<textarea>`».

```jsx
// En HTML
<textarea>Voy con carrito de bebé</textarea>

// En React, no controlado
<textarea defaultValue="Voy con carrito de bebé" />

// En React, controlado
<textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
```

## El valor de un campo siempre es texto

`e.target.value` es siempre una cadena, **también en un `<input type="number">`**. El tipo `number` cambia el teclado del móvil y añade flechas para subir y bajar, pero lo que llega a tu código es texto:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [invitados, setInvitados] = useState('')\n\n  return (\n    <>\n      <label>\n        Invitados a la comida\n        <input\n          type=\"number\"\n          value={invitados}\n          onChange={(e) => setInvitados(e.target.value)}\n        />\n      </label>\n      <p>Comensales: {invitados + 1}</p>\n    </>\n  )\n}\n\n// Escribes 3 en el campo. ¿Qué pone el párrafo?",
  "opciones": [
    "Comensales: 4",
    "Comensales: 31",
    "Comensales: NaN",
    "Comensales: 3"
  ],
  "correcta": 1,
  "explicacion": "invitados es la cadena «3», no el número 3, y en JavaScript una cadena más un número concatena: «31». El type=\"number\" del campo no cambia lo que llega en e.target.value. Para sumar hay que convertir antes, con Number(invitados) + 1."
}
```

Así que hay que convertir. Y aquí aparece el caso del campo vacío, que es donde está la trampa:

- `Number('3')` es `3`, pero **`Number('')` es `0`**: un campo vacío se convierte en cero sin avisar.
- `parseInt('')` da `NaN`, y `e.target.valueAsNumber`, la propiedad del DOM que da el número directamente, también da `NaN` con el campo vacío.

La tentación es convertir dentro de `onChange` y guardar ya un número: `setInvitados(Number(e.target.value))`. Parece más limpio, pero rompe el campo. Al borrarlo todo, el estado pasa a `0` y React escribe un 0 que ya no se puede quitar; si escribes un 3 detrás, en Chrome se queda «03». Lo vas a arreglar en el segundo ejercicio.

La forma segura, la que usan los ejemplos de react.dev, es **guardar en el estado el texto tal cual y convertirlo donde lo usas**, decidiendo tú qué significa el campo vacío:

```jsx
const [invitados, setInvitados] = useState('')

// Donde lo necesitas: vacío significa «ninguno»
const numeroInvitados = invitados === '' ? 0 : Number(invitados)
```

## Transformar mientras se escribe

Como el estado decide lo que se ve, puedes **guardar una versión retocada de lo que llega**: en mayúsculas, sin los caracteres que no valen o cortada a un máximo de letras.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Mayúsculas, solo cifras y un límite",
  "consigna": "Escribe un nombre en minúsculas y un teléfono con espacios o letras: el estado guarda la versión arreglada. Después pon el cursor en mitad del nombre y escribe dos letras, también en minúscula: la segunda aparece al final. Prueba lo mismo en las observaciones, que guardan el texto tal cual y limitan la longitud con maxLength: ahí el cursor se queda donde estaba.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [dorsal, setDorsal] = useState('')\n  const [telefono, setTelefono] = useState('')\n  const [observaciones, setObservaciones] = useState('')\n\n  return (\n    <main>\n      <label>\n        Nombre en el dorsal\n        <input\n          value={dorsal}\n          onChange={(e) => setDorsal(e.target.value.toUpperCase().slice(0, 12))}\n        />\n      </label>\n      <label>\n        Teléfono de emergencia\n        <input\n          inputMode=\"tel\"\n          value={telefono}\n          onChange={(e) => setTelefono(e.target.value.replace(/\\D/g, ''))}\n        />\n      </label>\n      <label>\n        Observaciones para la organización\n        <textarea\n          rows={3}\n          maxLength={140}\n          value={observaciones}\n          onChange={(e) => setObservaciones(e.target.value)}\n        />\n      </label>\n      <p className=\"contador\">{observaciones.length}/140</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Funciona, pero tiene un precio: **cuando guardas algo distinto de lo que había en el campo, el cursor salta al final**. Con la letra nueva en minúscula, el campo y el estado ya no coinciden, así que React reescribe el valor entero, y al cambiar el valor desde el código el navegador lleva el cursor al final. Comprobado en Chrome: con «LUCIA» en el campo, el cursor detrás de la segunda letra y tecleando «xy», queda «LUXCIAY». La documentación de React lo recoge en su apartado de problemas: actualizar el estado con algo distinto de `e.target.value` mueve el cursor.

Cómo elegir:

- **Para un límite de longitud, `maxLength`.** El navegador no deja escribir de más y no hay nada que reescribir. Es lo que hacen las observaciones.
- **Para mayúsculas, muchas veces basta con el CSS** (`text-transform: uppercase`, como el dorsal del principio) y convertir con `toUpperCase()` cuando uses el dato.
- **Transformar en `onChange`** compensa en campos cortos que se escriben de corrido: un código, una matrícula, un teléfono. Si se va a editar por el medio, el salto del cursor molesta.

## Varios campos con un solo objeto

Con muchos campos, un `useState` por campo se hace largo. La alternativa es **un objeto en el estado y un solo manejador que lee el `name` del campo que ha cambiado**. Cómo se actualiza un objeto sin mutarlo, con `...` y la clave calculada `[name]`, es el tema de la lección 20; aquí tienes la pieza que añade esta lección: las casillas traen su dato en `checked`, no en `value`.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un manejador para todos los campos",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [corredor, setCorredor] = useState({\n    nombre: '',\n    email: '',\n    federado: false,\n  })\n\n  function manejarCambio(e) {\n    const { name, value, type, checked } = e.target\n    setCorredor({ ...corredor, [name]: type === 'checkbox' ? checked : value })\n  }\n\n  return (\n    <form onSubmit={(e) => e.preventDefault()}>\n      <label>\n        Nombre\n        <input name=\"nombre\" value={corredor.nombre} onChange={manejarCambio} />\n      </label>\n      <label>\n        Correo electrónico\n        <input name=\"email\" type=\"email\" value={corredor.email} onChange={manejarCambio} />\n      </label>\n      <label className=\"casilla\">\n        <input\n          name=\"federado\"\n          type=\"checkbox\"\n          checked={corredor.federado}\n          onChange={manejarCambio}\n        />\n        Tengo licencia federativa\n      </label>\n      <pre>{JSON.stringify(corredor, null, 2)}</pre>\n    </form>\n  )\n}",
  "css": "form { display: grid; gap: 0.6rem; max-width: 24rem; font-family: system-ui, sans-serif; }\nlabel { display: grid; gap: 0.25rem; font-weight: 600; }\n.casilla { display: flex; align-items: center; gap: 0.5rem; font-weight: 400; }\ninput { font: inherit; font-weight: 400; padding: 0.35rem 0.5rem; border: 1px solid #94a3b8; border-radius: 6px; }\npre { margin: 0; padding: 0.5rem; border-radius: 6px; background: #f1f5f9; }",
  "anotaciones": [
    {
      "fragmento": "federado: false,",
      "nota": "El estado inicial trae todas las claves, con cadenas vacías y false. Si faltara alguna, su campo empezaría con value={undefined}: lo verás en los errores típicos."
    },
    {
      "fragmento": "const { name, value, type, checked } = e.target",
      "nota": "e.target es el campo que ha cambiado. De él sale todo lo necesario: cómo se llama, qué tipo es y su valor."
    },
    {
      "fragmento": "type === 'checkbox' ? checked : value",
      "nota": "Las casillas guardan el booleano de checked; los demás campos, su texto. Sin esta comprobación, federado acabaría valiendo «on»."
    },
    {
      "fragmento": "name=\"email\"",
      "nota": "El name de cada campo coincide con su clave en el objeto. Si escribes mal uno, el manejador crea una clave nueva y el campo se queda bloqueado."
    },
    {
      "fragmento": "<pre>{JSON.stringify(corredor, null, 2)}</pre>",
      "nota": "Un truco para depurar: ver el estado entero mientras rellenas el formulario."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Enviar el formulario: `onSubmit` y `preventDefault`

Un `<form>` se envía al pulsar su botón o al pulsar Enter en uno de sus campos. Lo que hace el navegador por defecto es mandar los datos y **cargar la página otra vez**, y en una aplicación de React eso borra todo el estado. Por eso el manejador de `onSubmit` empieza casi siempre con `e.preventDefault()`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Inscribirse sin recargar la página",
  "consigna": "Inscribe a dos personas, una con el botón y otra pulsando Enter en el campo. Después borra la línea e.preventDefault() y vuelve a probar: la vista previa se recarga y la lista vuelve a «nadie todavía».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  const [inscritos, setInscritos] = useState([])\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    setInscritos([...inscritos, nombre])\n    setNombre('')\n  }\n\n  return (\n    <main>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nombre\n          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />\n        </label>\n        <button>Inscribirme</button>\n      </form>\n      <p>Inscritos: {inscritos.length > 0 ? inscritos.join(', ') : 'nadie todavía'}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Fíjate en tres cosas:

- **El manejador va en el `<form>`, no en el botón.** `onSubmit` recoge las dos formas de enviar, el clic y Enter. Con `required`, el navegador ni siquiera llega a llamarlo si el campo está vacío.
- **Tras enviar, `setNombre('')` vacía el campo.** Otra ventaja de controlarlo: el código decide qué pone.
- **Dentro de un formulario, un `<button>` sin `type` es de envío.** Un botón que no debe enviar, como «Borrar», necesita `type="button"`.

`[...inscritos, nombre]` crea un array nuevo con un elemento más, en vez de modificar el que había: lo verás a fondo en la lección 21. Y en el módulo 8 conocerás la forma de React 19 de enviar formularios, `<form action={funcion}>` (lección 57), que se encarga de esto sin `preventDefault`.

## Cada campo con su etiqueta

Todos los campos de esta lección van dentro de su `<label>`: es la forma más sencilla de unirlos, y hace que al pulsar el texto el foco salte al campo. Si la etiqueta no puede envolver al campo, se unen con `htmlFor`, el `for` de HTML (lección 5), y un `id`:

```jsx
<label htmlFor="email-corredor">Correo electrónico</label>
<input id="email-corredor" type="email" value={email} onChange={manejarEmail} />
```

Cuidado con los `id` escritos a mano dentro de un componente que se usa varias veces, como dos fichas de corredor en la misma página: se repetirían. React tiene un hook, `useId`, que genera uno distinto para cada copia; lo verás en la lección 37, la de accesibilidad. Además, los ejercicios de esta web buscan los campos por su etiqueta, igual que un lector de pantalla: **un campo sin etiqueta tampoco se puede comprobar**.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El onChange de React es el evento change del navegador",
      "realidad": "El change nativo de un campo de texto salta al salir del campo. El onChange de React salta con cada tecla, como el evento input. React también acepta onInput, pero lo habitual es escribir onChange."
    },
    {
      "mito": "Un campo controlado siempre es mejor",
      "realidad": "Compensa cuando necesitas el valor mientras se escribe o cambiarlo desde el código. Si solo lo lees al enviar, un campo no controlado es más simple y igual de correcto."
    },
    {
      "mito": "defaultValue es el valor al que vuelve el campo si lo borras",
      "realidad": "Es solo el valor con el que empieza. Si lo borras, se queda vacío: a partir del primer render, el campo es del navegador."
    },
    {
      "mito": "readOnly y disabled son lo mismo",
      "realidad": "Un campo readOnly se puede enfocar, seleccionar y copiar, y se envía con el formulario. Uno disabled no recibe el foco ni se envía. Para un dato que se enseña pero no se edita, readOnly."
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
      "titulo": "Controlado, cuando la interfaz reacciona a lo que escribes",
      "texto": "Contadores de caracteres, vistas previas, un buscador que filtra mientras escribes, un botón que se activa cuando el formulario está completo, un error que aparece al momento."
    },
    {
      "titulo": "Controlado, cuando tu código también cambia el campo",
      "texto": "Rellenar con datos guardados, vaciar tras enviar, un botón que suma uno, corregir el formato de lo escrito."
    },
    {
      "titulo": "No controlado, cuando solo lo lees al enviar",
      "texto": "Un formulario de contacto sencillo no necesita estado: defaultValue para los valores iniciales y leer los datos al enviar. Las Actions del módulo 8 encajan con este estilo."
    },
    {
      "titulo": "Un render por tecla",
      "texto": "Cada pulsación vuelve a ejecutar el componente que guarda el estado. Casi nunca importa. Si ese componente pinta mucho, saca el formulario a un componente propio: un render baja por su rama y no toca a los hermanos (lección 13). useDeferredValue, en la lección 51, ayuda cuando no se puede."
    }
  ]
}
```

## Errores típicos

**`value` sin `onChange`.** Lo has visto arriba: el campo no se deja escribir y la consola dice por qué. Si es a propósito, `readOnly`.

**Leer `e.target.value` en una casilla.** No da error ni aviso, así que cuesta encontrarlo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [camiseta, setCamiseta] = useState(false)\n\n  return (\n    <label>\n      <input\n        type=\"checkbox\"\n        checked={camiseta}\n        onChange={(e) => setCamiseta(e.target.value)}\n      />\n      Quiero la camiseta\n    </label>\n  )\n}\n\n// Pulsas la casilla dos veces. ¿Cómo queda?",
  "opciones": [
    "Desmarcada, como al principio",
    "Marcada, y no hay forma de desmarcarla",
    "Desmarcada, y con un aviso de React en la consola"
  ],
  "correcta": 1,
  "explicacion": "El value de una casilla no dice si está marcada: es el dato que enviaría el formulario, y si no le pones uno vale «on». Al primer clic, camiseta pasa a «on», un texto que cuenta como verdadero, y la casilla se marca. Al segundo, otra vez «on»: sigue marcada. React no avisa de nada. En las casillas, e.target.checked."
}
```

**Empezar con `undefined`.** Si el estado empieza sin valor (`useState()`, o un objeto vacío del que lees `corredor.nombre`), el campo arranca con `value={undefined}`, y para React eso es lo mismo que no pasar `value`: un campo no controlado. Con la primera letra pasa a tener texto y se convierte en controlado. React lo avisa:

```text
A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://react.dev/link/controlled-components
```

Es decir: «Un componente está convirtiendo un campo no controlado en controlado. Seguramente el valor ha pasado de `undefined` a un valor definido, y eso no debería ocurrir. Decide si el campo es controlado o no para toda su vida». No es una formalidad:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un botón «Vaciar» que no vacía",
  "consigna": "Escribe un nombre y pulsa «Vaciar». El estado queda vacío, pero el campo sigue enseñando el nombre: al volver a undefined, React deja de controlarlo y no lo toca. Arréglalo empezando con { nombre: '' } y vaciando con { nombre: '' }, y comprueba que los avisos desaparecen.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [corredor, setCorredor] = useState({})\n\n  return (\n    <main>\n      <label>\n        Nombre\n        <input\n          value={corredor.nombre}\n          onChange={(e) => setCorredor({ ...corredor, nombre: e.target.value })}\n        />\n      </label>\n      <button onClick={() => setCorredor({})}>Vaciar</button>\n      <p>En el estado: {JSON.stringify(corredor)}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Al pulsar «Vaciar» llega el aviso contrario, *«A component is changing a controlled input to be uncontrolled»*, y el estado y la pantalla quedan desincronizados: justo lo que React venía a evitar (lección 1). La regla: **un campo controlado recibe siempre un texto**, empezando por `''`. Si el dato puede faltar, porque viene de un servidor, por ejemplo, `value={corredor.nombre ?? ''}`. Con `null` pasa algo parecido: React avisa de que *«`value` prop on `input` should not be null»* y el campo se comporta como no controlado. En las casillas, lo mismo con `checked`: siempre un booleano.

**`selected` en un `<option>`.** Es la costumbre de HTML. En React, `value` o `defaultValue` en el `<select>`.

**Guardar el número ya convertido.** `setInvitados(Number(e.target.value))` deja un 0 que no se puede borrar. Guarda el texto y convierte al usarlo.

**Un botón sin `type` dentro del formulario.** Un «Borrar» o un «Añadir otro» que no lleva `type="button"` también envía el formulario.

**Definir el componente del formulario dentro de otro.** Es el error de la lección 3, pero con campos controlados se nota aún más: cada tecla cambia el estado, el padre se vuelve a ejecutar, crea una función de componente nueva y React monta un campo nuevo. En Chrome, al teclear «Ana» solo entra la «A» y el campo pierde el foco. Todos los componentes, en el nivel superior del archivo.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una inscripción que se ve mientras la rellenas",
  "consigna": "Solo el nombre está controlado. Controla la distancia, la casilla de la camiseta y las observaciones para que el resumen se rellene mientras escribes: la distancia por su nombre («10 km») y la camiseta con «sí» o «no». Haz que el contador cuente, que las observaciones no pasen de 120 caracteres y que «Empezar de nuevo» lo deje todo como al principio. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst DISTANCIAS = [\n  { id: '5k', nombre: '5 km' },\n  { id: '10k', nombre: '10 km' },\n  { id: '21k', nombre: 'Media maratón' },\n]\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  // 1. Controla también la distancia, la camiseta y las observaciones.\n  const [enviada, setEnviada] = useState(false)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    setEnviada(true)\n  }\n\n  function empezarDeNuevo() {\n    setNombre('')\n    // 2. Deja también los demás campos como al principio.\n    setEnviada(false)\n  }\n\n  return (\n    <main>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nombre\n          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n        </label>\n        <label>\n          Distancia\n          <select defaultValue=\"5k\">\n            {DISTANCIAS.map((d) => (\n              <option key={d.id} value={d.id}>\n                {d.nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <label className=\"casilla\">\n          <input type=\"checkbox\" />\n          Quiero la camiseta\n        </label>\n        <label>\n          Observaciones\n          <textarea rows={3} />\n        </label>\n        {/* 3. Que el contador cuente, y que no se pueda pasar de 120 */}\n        <p className=\"contador\">0/120</p>\n        <div className=\"botones\">\n          <button>Inscribirme</button>\n          <button type=\"button\" onClick={empezarDeNuevo}>\n            Empezar de nuevo\n          </button>\n        </div>\n      </form>\n\n      <section className=\"resumen\">\n        <h2>Tu inscripción</h2>\n        <p>Nombre: {nombre}</p>\n        {/* 4. El nombre de la distancia elegida y «sí» o «no» */}\n        <p>Distancia: </p>\n        <p>Camiseta: </p>\n        {enviada && <p>Inscripción enviada. ¡Nos vemos en la salida!</p>}\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n\n.resumen {\n  display: grid;\n  gap: 0.25rem;\n  padding: 0.75rem;\n  border-left: 4px solid #15803d;\n  border-radius: 6px;\n  background: #f0fdf4;\n}\n\n.resumen h2 {\n  font-size: 1.05rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "El resumen muestra el nombre de la distancia elegida",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Distancia",
            "opcion": "10 km"
          }
        }
      ],
      "espera": {
        "texto": "Distancia: 10 km"
      }
    },
    {
      "descripcion": "Al marcar «Quiero la camiseta», el resumen dice «Camiseta: sí»",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Quiero la camiseta"
          }
        }
      ],
      "espera": {
        "texto": "Camiseta: sí"
      }
    },
    {
      "descripcion": "El contador cuenta lo que escribes en las observaciones",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Observaciones",
            "texto": "Voy con mi perra"
          }
        }
      ],
      "espera": {
        "texto": "16/120"
      }
    },
    {
      "descripcion": "Las observaciones se cortan a los 120 caracteres",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Observaciones",
            "texto": "Llegaré con el tiempo justo desde la estación de tren, así que recogeré el dorsal en la misma salida. Corro con mi perra Lola, que va atada y es muy tranquila."
          }
        }
      ],
      "espera": {
        "etiqueta": "Observaciones",
        "valor": "Llegaré con el tiempo justo desde la estación de tren, así que recogeré el dorsal en la misma salida. Corro con mi perra"
      }
    },
    {
      "descripcion": "«Empezar de nuevo» vacía también las observaciones",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Observaciones",
            "texto": "Llevo carrito"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar de nuevo"
          }
        }
      ],
      "espera": {
        "etiqueta": "Observaciones",
        "valor": ""
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La comida en meta, sin ceros fantasma",
  "consigna": "Borra el número del campo: aparece un 0 que no hay manera de quitar. Haz que el estado guarde el texto del campo y conviértelo a número solo para calcular, con el campo vacío como cero invitados. Revisa también el botón «Añadir un invitado»: con texto en el estado, el + ya no suma. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PRECIO_MENU = 12\n\nexport default function App() {\n  const [invitados, setInvitados] = useState(0)\n\n  return (\n    <main>\n      <h1>Comida en meta</h1>\n      <p>Tu menú va incluido. Cada invitado paga {PRECIO_MENU} €.</p>\n      <label>\n        Invitados\n        <input\n          type=\"number\"\n          min={0}\n          value={invitados}\n          onChange={(e) => setInvitados(Number(e.target.value))}\n        />\n      </label>\n      <button type=\"button\" onClick={() => setInvitados(invitados + 1)}>\n        Añadir un invitado\n      </button>\n      <p>Comensales: {1 + invitados}</p>\n      <p>A pagar: {invitados * PRECIO_MENU} €</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nmain {\n  max-width: 28rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1,\nh2,\np {\n  margin: 0;\n}\n\nh1 {\n  font-size: 1.35rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font-weight: 400;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  font-weight: 400;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.8rem;\n  border: 0;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  cursor: pointer;\n}\n\nbutton[type='button'] {\n  background: #e2e8f0;\n  color: #0f172a;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.contador {\n  justify-self: end;\n  color: #475569;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Se puede borrar el número y dejar el campo vacío",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": ""
          }
        }
      ],
      "espera": {
        "etiqueta": "Invitados",
        "valor": ""
      }
    },
    {
      "descripcion": "Con el campo vacío no se paga nada",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": ""
          }
        }
      ],
      "espera": {
        "texto": "A pagar: 0 €"
      }
    },
    {
      "descripcion": "Con 3 invitados sois 4 comensales",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "3"
          }
        }
      ],
      "espera": {
        "texto": "Comensales: 4"
      }
    },
    {
      "descripcion": "Con 3 invitados se pagan 36 €",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "3"
          }
        }
      ],
      "espera": {
        "texto": "A pagar: 36 €"
      }
    },
    {
      "descripcion": "«Añadir un invitado» suma uno al número escrito",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "2"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir un invitado"
          }
        }
      ],
      "espera": {
        "etiqueta": "Invitados",
        "valor": "3"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En la inscripción, añade las tallas con botones de opción, que solo aparezcan si se marca la camiseta y que salgan en el resumen («Camiseta: sí, talla M»).
2. Añade un «Teléfono de emergencia» que solo admita cifras y, debajo, «Faltan N cifras» hasta que tenga 9.
3. Desactiva «Inscribirme» mientras el nombre tenga menos de 2 letras (sin contar los espacios del principio y del final).
4. Pasa la inscripción a un único objeto de estado con un solo `manejarCambio`, como en la sección de varios campos, casilla incluida. ¿Cuántas líneas te ahorras en «Empezar de nuevo»?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<input>",
      "descripcion": "La referencia oficial: value y defaultValue, checked, onChange, y un apartado de problemas con el campo bloqueado, el cursor que salta y el paso de no controlado a controlado.",
      "url": "https://react.dev/reference/react-dom/components/input",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<select>",
      "descripcion": "Desplegables controlados y no controlados, select multiple y por qué no se usa selected.",
      "url": "https://react.dev/reference/react-dom/components/select",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<textarea>",
      "descripcion": "El área de texto en React: value o defaultValue en lugar del texto entre etiquetas.",
      "url": "https://react.dev/reference/react-dom/components/textarea",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<input type=\"number\">",
      "descripcion": "Qué valida el navegador en un campo numérico, qué teclado saca en el móvil y por qué su valor sigue siendo texto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number",
      "etiqueta": "MDN"
    },
    {
      "titulo": "HTMLSelectElement: selectedOptions",
      "descripcion": "La propiedad que devuelve las opciones marcadas de un select multiple.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/selectedOptions",
      "etiqueta": "MDN"
    }
  ]
}
```
