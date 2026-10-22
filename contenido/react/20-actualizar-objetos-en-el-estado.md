# Actualizar objetos en el estado

- **Módulo:** Interactividad
- **Slug:** `actualizar-objetos-en-el-estado` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) — ver `contenido/react/TEMARIO.md` #20

---

## Qué es y para qué sirve

Hasta ahora has guardado en el estado números, textos y booleanos: `useState(0)`, `useState('')`, `useState(false)`. Pero muchos datos de una interfaz van en grupo: los campos de un formulario, el marcador de un partido con sus dos equipos, la posición de algo en pantalla con su `x` y su `y`. Guardarlos juntos en un objeto es cómodo, y `useState` acepta cualquier valor de JavaScript:

```js
const [marcador, setMarcador] = useState({ local: 0, visitante: 0 })
```

La diferencia con un número es que un objeto **se puede cambiar por dentro**. El número `0` no se puede modificar: `setGoles(1)` no cambia el `0`, lo sustituye por otro valor. En cambio, `marcador.local = 1` cambia el objeto que ya existe. Eso se llama **mutar**, y con el estado de React es la fuente de muchos fallos difíciles de explicar.

La regla de esta lección cabe en una línea:

> **Trata los objetos del estado como si fueran de solo lectura: para cambiar algo, crea un objeto nuevo y pásaselo a la función `set`.**

Mira qué pasa si no la sigues. En este marcador, el botón del Arenal suma el gol cambiando el objeto, y el del Puerto Viejo crea uno nuevo (la sintaxis la verás enseguida). La consola enseña cada render y lo que vale el objeto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un marcador que no se entera de los goles",
  "consigna": "Pulsa «Gol del Arenal» tres veces: la consola dice que el objeto ya va por 3, pero el marcador sigue en 0 - 0 y no sale ninguna línea de render. Ahora pulsa «Gol del Puerto Viejo» una sola vez y mira el marcador.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [marcador, setMarcador] = useState({ local: 0, visitante: 0 })\n  console.log('Render del marcador:', marcador.local, '-', marcador.visitante)\n\n  function golLocal() {\n    // Mal: cambia el objeto que ya está en el estado\n    marcador.local = marcador.local + 1\n    console.log('Gol del Arenal. El objeto ya dice local:', marcador.local)\n  }\n\n  function golVisitante() {\n    // Bien: un objeto nuevo con lo de antes y el cambio\n    setMarcador({ ...marcador, visitante: marcador.visitante + 1 })\n  }\n\n  return (\n    <main>\n      <h1>Liga juvenil de balonmano</h1>\n      <p className=\"marcador\">\n        Arenal {marcador.local} - {marcador.visitante} Puerto Viejo\n      </p>\n      <button onClick={golLocal}>Gol del Arenal</button>\n      <button onClick={golVisitante}>Gol del Puerto Viejo</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\n.marcador {\n  margin: 0 0 0.75rem;\n  font-size: 1.6rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0 0.5rem 0.5rem 0;\n  padding: 0.5rem 0.75rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Los tres goles del Arenal estaban en el objeto, pero React no se enteró: nadie llamó a `setMarcador`, así que no hubo render. Cuando marca el Puerto Viejo, `setMarcador` recibe un objeto nuevo, React vuelve a renderizar y, de paso, **pinta lo que había en el objeto mutado**: el marcador salta de 0 - 0 a 3 - 1 de golpe. Las dos líneas de render que salen entonces son la doble llamada de `StrictMode` de la lección 12.

Un dato que aparece tarde, cuando cambia otra cosa, es la firma típica de una mutación.

## Por qué React no se entera

React no vigila tus objetos. Solo sabe que algo ha cambiado cuando llamas a la función `set`, y entonces compara el valor nuevo con el que tenía usando `Object.is`. Con objetos, esa comparación pregunta **«¿es el mismo objeto?»**, no «¿tiene el mismo contenido?». Si es el mismo, React ignora la actualización.

```js
const antes = { local: 0, visitante: 0 }
const despues = antes          // otro nombre para el mismo objeto
despues.local = 1

Object.is(antes, despues)      // true: es el mismo objeto, y los dos «ven» local: 1

const nuevo = { ...antes, local: 2 }
Object.is(antes, nuevo)        // false: es otro objeto, aunque se parezca
```

Así que mutar y llamar después a `set` con el mismo objeto tampoco sirve. Antes de seguir, compruébalo de cabeza:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [marcador, setMarcador] = useState({ local: 0, visitante: 0 })\n\n  function golLocal() {\n    marcador.local += 1\n    setMarcador(marcador)\n  }\n\n  return (\n    <main>\n      <p>\n        Arenal {marcador.local} - {marcador.visitante} Puerto Viejo\n      </p>\n      <button onClick={golLocal}>Gol del Arenal</button>\n    </main>\n  )\n}\n\n// Pulsas «Gol del Arenal» tres veces. ¿Qué enseña el marcador?",
  "opciones": [
    "Arenal 3 - 0 Puerto Viejo",
    "Arenal 1 - 0 Puerto Viejo",
    "Arenal 0 - 0 Puerto Viejo",
    "Un error: el estado no se puede modificar"
  ],
  "correcta": 2,
  "explicacion": "setMarcador recibe el mismo objeto que ya tenía. Object.is dice que no ha cambiado nada, React ignora la actualización y la pantalla sigue en 0 - 0. Por dentro, el objeto sí va por 3: lo verías en cuanto otra cosa provocara un render. JavaScript no se queja, porque mutar un objeto es perfectamente legal; simplemente React no lo ve."
}
```

El arreglo es darle a React un objeto que no sea el de antes:

```js
function golLocal() {
  setMarcador({ ...marcador, local: marcador.local + 1 })
}
```

Ojo con los atajos: **`marcador.local += 1` y `marcador.local++` también son mutaciones**, porque asignan sobre una propiedad del objeto que ya existe. Lo que no muta es calcular el valor nuevo (`marcador.local + 1`) y ponerlo en un objeto nuevo.

## Por qué no mutar, aunque a veces parezca que funciona

Con el gol del Puerto Viejo has visto que una mutación puede acabar en pantalla «sola», en cuanto algo provoca un render. Eso no la arregla: solo la esconde. Hay más razones para no mutar nunca el estado:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "React compara referencias, no contenidos",
      "texto": "Para saber si algo ha cambiado, React mira con Object.is si es el mismo objeto. Es una comprobación instantánea, por grande que sea el objeto, pero solo funciona si cada cambio produce un objeto nuevo."
    },
    {
      "titulo": "Cada render conserva su foto",
      "texto": "Como viste en la lección 18, cada render trabaja con una instantánea del estado. Si mutas el objeto, cambias también la foto de los renders anteriores: un manejador o un temporizador creados antes leerán valores que no son los de su momento."
    },
    {
      "titulo": "Las optimizaciones se fían de la referencia",
      "texto": "memo, useMemo y el React Compiler (lecciones 67 y 68) se ahorran trabajo cuando reciben el mismo objeto que la vez anterior. Con un objeto mutado, se lo ahorran justo cuando no deberían y la pantalla se queda atrás."
    },
    {
      "titulo": "Deshacer sale gratis",
      "texto": "Si nunca mutas, las versiones anteriores siguen intactas: guardarlas permite deshacer, enseñar un historial o volver a los valores iniciales de un formulario. Si mutas, todas acaban siendo el mismo objeto."
    },
    {
      "titulo": "El linter te avisa",
      "texto": "La regla immutability de eslint-plugin-react-hooks marca las asignaciones a props y estado (pedido.total = 0), también si después llamas a set con el mismo objeto. No ve push, sort ni splice: no te fíes solo de ella. La verás con las demás reglas en la lección 70."
    }
  ]
}
```

## Copiar con spread: `{ ...objeto, campo: valor }`

Casi siempre el objeto nuevo se parece al anterior en todo menos en un campo. No hace falta escribirlo entero: el spread de objetos copia todas las propiedades del anterior y, detrás, escribes las que cambian.

```js
setFicha({
  ...ficha,           // copia todos los campos que ya había
  instrumento: 'Violín',   // y sustituye este
})
```

**El orden importa: si una propiedad aparece dos veces, gana la última.** Por eso el spread va delante y los cambios detrás.

Esta matrícula de una escuela de música guarda sus tres campos en un objeto, y sus manejadores lo mutan, como el marcador. El par `value` + `onChange` hace que cada campo enseñe lo que hay en el estado y avise de cada tecla; lo verás a fondo en la lección 22. Por ahora basta con esto: **si el estado no cambia, el campo tampoco**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una matrícula en la que no se puede escribir",
  "consigna": "Intenta escribir en cualquiera de los tres campos: no puedes. Arregla los manejadores para que cada uno llame a setFicha con un objeto nuevo hecho con spread. Comprueba que el resumen cambia y que, al tocar un campo, los otros dos siguen como estaban. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [ficha, setFicha] = useState({\n    nombre: 'Lucía',\n    apellidos: 'Ferrer',\n    correo: 'lucia.ferrer@example.com',\n  })\n\n  // Arregla los tres manejadores: ahora mutan ficha en vez de crear una nueva\n  function manejarCambioNombre(e) {\n    ficha.nombre = e.target.value\n  }\n\n  function manejarCambioApellidos(e) {\n    ficha.apellidos = e.target.value\n  }\n\n  function manejarCambioCorreo(e) {\n    ficha.correo = e.target.value\n  }\n\n  return (\n    <main>\n      <h1>Escuela de música La Corchea</h1>\n      <label>\n        Nombre\n        <input value={ficha.nombre} onChange={manejarCambioNombre} />\n      </label>\n      <label>\n        Apellidos\n        <input value={ficha.apellidos} onChange={manejarCambioApellidos} />\n      </label>\n      <label>\n        Correo\n        <input type=\"email\" value={ficha.correo} onChange={manejarCambioCorreo} />\n      </label>\n      <div className=\"resumen\">\n        <p>Alumna: {ficha.nombre} {ficha.apellidos}</p>\n        <p>Correo: {ficha.correo}</p>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.6rem;\n  font-size: 0.95rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nfieldset {\n  margin: 0 0 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n}\n\n.resumen {\n  margin: 0.75rem 0;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #0f766e;\n  background: #f0fdfa;\n}\n\n.resumen h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1rem;\n}\n\n.resumen p {\n  margin: 0.2rem 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al escribir en «Nombre», el resumen muestra el nombre nuevo con los mismos apellidos",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Carmen"
          }
        }
      ],
      "espera": {
        "texto": "Alumna: Carmen Ferrer"
      }
    },
    {
      "descripcion": "Al escribir en «Apellidos», el resumen muestra los apellidos nuevos con el mismo nombre",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Apellidos",
            "texto": "Gil Ruiz"
          }
        }
      ],
      "espera": {
        "texto": "Alumna: Lucía Gil Ruiz"
      }
    },
    {
      "descripcion": "Al escribir en «Correo», el resumen muestra el correo nuevo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "lucia@example.org"
          }
        }
      ],
      "espera": {
        "texto": "Correo: lucia@example.org"
      }
    },
    {
      "descripcion": "Cambiar el correo no borra el nombre ni los apellidos",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "lucia@example.org"
          }
        }
      ],
      "espera": {
        "texto": "Alumna: Lucía Ferrer"
      }
    }
  ]
}
```

Con la mutación, cada tecla cambiaba el objeto, pero sin render React volvía a poner en el campo el valor del último render, y el campo parecía bloqueado. Con `setFicha({ ...ficha, nombre: e.target.value })` cada tecla produce una ficha nueva, con los apellidos y el correo copiados de la anterior.

Y ahora, el orden del spread:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [ficha, setFicha] = useState({ nombre: 'Lucía', instrumento: 'Piano' })\n\nfunction cambiarAViolin() {\n  setFicha({ instrumento: 'Violín', ...ficha })\n}\n\n// Pulsas el botón que llama a cambiarAViolin.\n// ¿Qué instrumento muestra <p>Instrumento: {ficha.instrumento}</p>?",
  "opciones": [
    "Violín: es lo que acabas de escribir",
    "Piano: el spread vuelve a poner el de antes",
    "Ninguno: instrumento queda undefined"
  ],
  "correcta": 1,
  "explicacion": "Las propiedades se aplican de izquierda a derecha y la última gana. Primero se escribe instrumento: Violín y después el spread copia todas las de ficha, también su instrumento, Piano. React recibe un objeto nuevo, así que hay render, pero con los mismos datos. Pon siempre el spread delante y los cambios detrás."
}
```

Un detalle si usas la forma con función de la lección 19: el objeto va entre paréntesis, `setFicha((f) => ({ ...f, instrumento: 'Violín' }))`. Sin ellos, las llaves se leerían como el cuerpo de la función flecha, que devolvería `undefined`.

## Un manejador para todos los campos: `[e.target.name]`

Los tres manejadores del ejercicio son casi iguales: solo cambia el nombre de la propiedad. JavaScript permite calcular el nombre de una propiedad poniéndolo entre corchetes, así que si cada campo lleva un atributo `name` igual a su clave en el objeto, **un solo manejador sirve para todo el formulario**:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un manejador para dos campos y un desplegable",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [ficha, setFicha] = useState({\n    nombre: 'Lucía',\n    apellidos: 'Ferrer',\n    instrumento: 'Piano',\n  })\n\n  function manejarCambio(e) {\n    setFicha({\n      ...ficha,\n      [e.target.name]: e.target.value,\n    })\n  }\n\n  return (\n    <main>\n      <h1>Escuela de música La Corchea</h1>\n      <label>\n        Nombre\n        <input name=\"nombre\" value={ficha.nombre} onChange={manejarCambio} />\n      </label>\n      <label>\n        Apellidos\n        <input name=\"apellidos\" value={ficha.apellidos} onChange={manejarCambio} />\n      </label>\n      <label>\n        Instrumento\n        <select name=\"instrumento\" value={ficha.instrumento} onChange={manejarCambio}>\n          <option>Piano</option>\n          <option>Guitarra</option>\n          <option>Violín</option>\n        </select>\n      </label>\n      <div className=\"resumen\">\n        <p>Alumna: {ficha.nombre} {ficha.apellidos}</p>\n        <p>Instrumento: {ficha.instrumento}</p>\n      </div>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.6rem;\n  font-size: 0.95rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nfieldset {\n  margin: 0 0 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n}\n\n.resumen {\n  margin: 0.75rem 0;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #0f766e;\n  background: #f0fdfa;\n}\n\n.resumen h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1rem;\n}\n\n.resumen p {\n  margin: 0.2rem 0;\n}\n",
  "anotaciones": [
    {
      "fragmento": "function manejarCambio(e)",
      "nota": "Un solo manejador para todo el formulario. Añadir un campo nuevo es añadir su clave al objeto inicial y un campo con el name que le corresponde."
    },
    {
      "fragmento": "[e.target.name]: e.target.value",
      "nota": "Propiedad calculada: los corchetes evalúan e.target.name, que vale nombre, apellidos o instrumento según el campo que haya cambiado. e.target es el elemento en el que ocurrió el evento, igual que en los eventos del DOM de JavaScript."
    },
    {
      "fragmento": "name=\"apellidos\"",
      "nota": "El name une el campo con su dato. Si escribieras name=\"apellido\", el manejador crearía una propiedad nueva, ficha.apellidos no cambiaría y el campo parecería bloqueado."
    },
    {
      "fragmento": "<select name=\"instrumento\" value={ficha.instrumento} onChange={manejarCambio}>",
      "nota": "El mismo manejador sirve para un desplegable, que también tiene name y value. La excepción son las casillas de verificación: su dato está en e.target.checked, no en value. Lo verás en la lección 22."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Objetos anidados: copia cada nivel que cambia

Ahora la ficha guarda también una persona de contacto, por si hay que avisar a alguien, y ese contacto es otro objeto:

```js
const [ficha, setFicha] = useState({
  nombre: 'Lucía Ferrer',
  instrumento: 'Piano',
  contacto: {
    persona: 'Andrés Ferrer',
    telefono: '600 111 222',
  },
})
```

Mutando, cambiar el teléfono sería una línea: `ficha.contacto.telefono = '699 000 111'`. Sin mutar hacen falta **dos objetos nuevos**: un contacto con el teléfono cambiado y una ficha que apunte a ese contacto nuevo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// En dos pasos, de dentro afuera\nconst contactoNuevo = { ...ficha.contacto, telefono: '699 000 111' }\nconst fichaNueva = { ...ficha, contacto: contactoNuevo }\nsetFicha(fichaNueva)\n\n// Lo mismo, en una sola expresión\nsetFicha({\n  ...ficha,\n  contacto: {\n    ...ficha.contacto,\n    telefono: '699 000 111',\n  },\n})\n\n// Con un manejador genérico para los campos del contacto\nfunction manejarCambioContacto(e) {\n  setFicha({\n    ...ficha,\n    contacto: { ...ficha.contacto, [e.target.name]: e.target.value },\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "const contactoNuevo = { ...ficha.contacto, telefono: '699 000 111' }",
      "nota": "Primero, el nivel de abajo: un contacto nuevo con la misma persona y el teléfono nuevo."
    },
    {
      "fragmento": "const fichaNueva = { ...ficha, contacto: contactoNuevo }",
      "nota": "Después, el de arriba: una ficha nueva con los mismos campos, pero con el contacto nuevo. Hay que copiar todos los niveles, desde el que cambia hasta la raíz del estado."
    },
    {
      "fragmento": "    ...ficha.contacto,",
      "nota": "El spread de dentro copia la persona. Sin él, el contacto nuevo solo tendría el teléfono y la persona desaparecería."
    },
    {
      "fragmento": "contacto: { ...ficha.contacto, [e.target.name]: e.target.value }",
      "nota": "El truco del name también funciona un nivel más abajo: con dos campos name=\"persona\" y name=\"telefono\", un manejador sirve para todo el contacto."
    }
  ]
}
```

«Anidado» es solo una forma de hablar. En memoria, la ficha y el contacto son **dos objetos distintos**, y la propiedad `contacto` de la ficha solo apunta al segundo. Otro objeto podría apuntar al mismo contacto, y cualquier cambio en él se vería desde los dos.

Por eso **el spread es una copia superficial**: copia las propiedades de un nivel, y cuando una propiedad apunta a otro objeto, copia la flecha, no el objeto. Ponlo a prueba:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const FICHA_INICIAL = {\n  nombre: 'Lucía Ferrer',\n  contacto: { persona: 'Andrés Ferrer', telefono: '600 111 222' },\n}\n\nconst copia = { ...FICHA_INICIAL }\ncopia.nombre = 'Carmen Gil'\ncopia.contacto.telefono = '699 000 111'\n\nconsole.log(FICHA_INICIAL.nombre, '/', FICHA_INICIAL.contacto.telefono)",
  "opciones": [
    "Lucía Ferrer / 600 111 222: copia es otro objeto",
    "Lucía Ferrer / 699 000 111",
    "Carmen Gil / 699 000 111: copia y FICHA_INICIAL son el mismo objeto"
  ],
  "correcta": 1,
  "explicacion": "copia es un objeto nuevo, así que cambiar copia.nombre no toca el original. Pero copia.contacto apunta al mismo contacto que FICHA_INICIAL.contacto: el spread copió la referencia, no el objeto. Al cambiar el teléfono a través de la copia, lo has cambiado también en el original."
}
```

En un componente, este fallo es traicionero porque **se repinta bien**: como la ficha de arriba sí es nueva, hay render y todo parece funcionar. El problema sale después, cuando necesitas los valores de antes.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un «Restablecer» que no restablece",
  "consigna": "Cambia el nombre y el teléfono, y pulsa «Restablecer». El nombre vuelve a Lucía Ferrer; el teléfono, no. Busca la mutación en manejarCambioContacto y arréglala copiando también el contacto. Vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst FICHA_INICIAL = {\n  nombre: 'Lucía Ferrer',\n  contacto: {\n    persona: 'Andrés Ferrer',\n    telefono: '600 111 222',\n  },\n}\n\nexport default function App() {\n  const [ficha, setFicha] = useState(FICHA_INICIAL)\n\n  function manejarCambio(e) {\n    setFicha({ ...ficha, [e.target.name]: e.target.value })\n  }\n\n  function manejarCambioContacto(e) {\n    const copia = { ...ficha }\n    copia.contacto[e.target.name] = e.target.value\n    setFicha(copia)\n  }\n\n  return (\n    <main>\n      <h1>Escuela de música La Corchea</h1>\n      <label>\n        Nombre\n        <input name=\"nombre\" value={ficha.nombre} onChange={manejarCambio} />\n      </label>\n      <fieldset>\n        <legend>Persona de contacto</legend>\n        <label>\n          Persona\n          <input name=\"persona\" value={ficha.contacto.persona} onChange={manejarCambioContacto} />\n        </label>\n        <label>\n          Teléfono\n          <input name=\"telefono\" value={ficha.contacto.telefono} onChange={manejarCambioContacto} />\n        </label>\n      </fieldset>\n      <div className=\"resumen\">\n        <p>Alumna: {ficha.nombre}</p>\n        <p>Contacto: {ficha.contacto.persona}, {ficha.contacto.telefono}</p>\n      </div>\n      <button onClick={() => setFicha(FICHA_INICIAL)}>Restablecer</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.6rem;\n  font-size: 0.95rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nfieldset {\n  margin: 0 0 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n}\n\n.resumen {\n  margin: 0.75rem 0;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #0f766e;\n  background: #f0fdfa;\n}\n\n.resumen h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1rem;\n}\n\n.resumen p {\n  margin: 0.2rem 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

`copia` es un objeto nuevo, así que cada tecla provoca un render. Pero `copia.contacto` es el mismo objeto que `ficha.contacto`, que al principio es el de `FICHA_INICIAL`: al escribir el teléfono estabas **reescribiendo el valor inicial**. «Restablecer» hace bien su trabajo; lo que ya no existe es el estado al que quería volver. Con `contacto: { ...ficha.contacto, [e.target.name]: e.target.value }`, `FICHA_INICIAL` no se toca nunca.

## Mutar lo que acabas de crear, sí

Lo prohibido es cambiar objetos que **ya están en el estado**. Un objeto que acabas de crear en el manejador no lo conoce nadie más: puedes modificarlo cuanto quieras antes de pasarlo a `set`. Es la **mutación local** de la lección 12, ahora dentro de un manejador:

```js
function confirmarMatricula() {
  const confirmada = { ...ficha }    // un objeto que acaba de nacer
  confirmada.pagada = true           // mutarlo es seguro: nadie más lo ve
  confirmada.fechaDeAlta = new Date().toLocaleDateString('es-ES')
  setFicha(confirmada)
}
```

Equivale a `setFicha({ ...ficha, pagada: true, fechaDeAlta: ... })`: usa la forma que se lea mejor. El matiz está en «acaba de nacer». `confirmada` es nueva, pero **lo que lleva dentro no**: `confirmada.contacto` sigue siendo el contacto del estado. ¿Distingues ya una cosa de la otra?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// En el estado: ficha = {\n//   nombre: 'Lucía Ferrer',\n//   instrumento: 'Piano',\n//   contacto: { persona: 'Andrés Ferrer', telefono: '600 111 222' },\n// }\n\nfunction opcionA() {\n  const nueva = { ...ficha }\n  nueva.instrumento = 'Violín'\n  setFicha(nueva)\n}\n\nfunction opcionB() {\n  const nueva = { ...ficha }\n  nueva.contacto.telefono = '699 000 111'\n  setFicha(nueva)\n}\n\nfunction opcionC() {\n  const nueva = ficha\n  nueva.instrumento = 'Violín'\n  setFicha({ ...nueva })\n}\n\n// ¿Cuáles modifican el estado que ya existía?",
  "opciones": [
    "Ninguna: las tres llaman a setFicha con un objeto nuevo",
    "Solo B",
    "B y C",
    "Las tres"
  ],
  "correcta": 2,
  "explicacion": "A muta una copia recién creada: es una mutación local y no pasa nada. B crea una ficha nueva, pero nueva.contacto es el contacto del estado, y lo cambia. C ni siquiera copia: nueva es otro nombre para ficha, y el spread llega después de mutarla. B y C provocan un render y parecen funcionar, que es justo lo que las hace peligrosas."
}
```

## Copias profundas: `structuredClone`, y por qué no por defecto

Si el spread solo copia un nivel, ¿no sería más fácil copiarlo todo de una vez? Para eso existe `structuredClone`, una función del navegador disponible en todos los navegadores desde marzo de 2022. Hace una **copia profunda**: el objeto y todos los que cuelgan de él son nuevos.

```js
const copia = structuredClone(ficha)
copia.contacto.telefono = '699 000 111'   // seguro: copia.contacto es otro objeto
setFicha(copia)
```

Funciona, pero no es la herramienta del día a día:

- **Copia todo, también lo que no ha cambiado.** Con un estado grande es trabajo de más en cada tecla. Y como todos los objetos de dentro pasan a ser otros, para React y para `memo` (lección 67) ha cambiado todo, aunque solo cambiara un teléfono. El spread copia solo el camino hasta el cambio y deja el resto compartido, que es justo lo que React sabe aprovechar.
- **No todo se puede clonar.** Si el objeto lleva una función dentro (un método, un callback guardado) o un nodo del DOM, lanza un `DataCloneError`. Las instancias de una clase vuelven como objetos normales, sin sus métodos. Las fechas, los `Map` y los `Set` sí se copian bien, a diferencia del viejo truco `JSON.parse(JSON.stringify(objeto))`, que convierte las fechas en texto.

Donde sí encaja es al sacar **un objeto independiente de una plantilla con varios niveles**, por ejemplo una ficha vacía para matricular a otra alumna: `structuredClone(FICHA_VACIA)` garantiza que la nueva ficha no comparte su contacto con la plantilla ni con nadie. En la lección 21 verás qué pasa cuando dos elementos de una lista comparten objetos sin querer.

## Menos copias a mano: Immer

Cuando el estado tiene varios niveles y muchos manejadores, los spreads anidados se vuelven repetitivos. [Immer](https://immerjs.github.io/immer/) es una librería que te deja escribir el cambio como si mutaras y se encarga de hacer las copias. Con su hook `useImmer`, el contacto se actualiza así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useImmer } from 'use-immer'\n\nexport default function Matricula() {\n  const [ficha, actualizarFicha] = useImmer(FICHA_INICIAL)\n\n  function manejarCambioContacto(e) {\n    actualizarFicha((borrador) => {\n      borrador.contacto[e.target.name] = e.target.value\n    })\n  }\n\n  // ...el mismo JSX de antes\n}",
  "anotaciones": [
    {
      "fragmento": "import { useImmer } from 'use-immer'",
      "nota": "Se instala con npm install immer use-immer. Los bloques en vivo de esta web solo cargan React, así que este código es para tu proyecto de Vite."
    },
    {
      "fragmento": "useImmer(FICHA_INICIAL)",
      "nota": "Se usa como useState: devuelve el valor y una función para actualizarlo. Puedes mezclar useState y useImmer en el mismo componente."
    },
    {
      "fragmento": "borrador.contacto[e.target.name] = e.target.value",
      "nota": "Parece una mutación, pero borrador no es tu estado: es un Proxy que anota lo que cambias. Al terminar, Immer construye un objeto nuevo copiando solo el camino que tocaste, la ficha y su contacto, y comparte el resto con la versión anterior."
    },
    {
      "fragmento": "actualizarFicha((borrador) => {",
      "nota": "React sigue recibiendo un objeto nuevo, igual que con el spread. Immer no hace que React acepte mutaciones: escribe las copias por ti."
    }
  ]
}
```

Immer compensa cuando el estado es muy anidado. Antes de instalarlo, pregúntate si hace falta tanto anidamiento: a menudo un estado más plano es más sencillo de actualizar, y de eso trata la lección 24. Lo volverás a encontrar dentro de Redux Toolkit (lección 75), que usa Immer por debajo.

En resumen, tienes tres formas de llegar al objeto nuevo:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de crear el objeto nuevo",
  "roles": [
    {
      "etiqueta": "Spread",
      "rol": "Copia superficial, nivel a nivel",
      "descripcion": "La opción por defecto. Copias tú cada nivel desde el cambio hasta arriba, y lo que no cambia sigue siendo el mismo objeto."
    },
    {
      "etiqueta": "structuredClone",
      "rol": "Copia profunda, de todo",
      "descripcion": "Para sacar un objeto independiente de una plantilla, no para cada tecla. No clona funciones ni nodos del DOM."
    },
    {
      "etiqueta": "Immer",
      "rol": "Escribes como si mutaras",
      "descripcion": "Una librería que hace las copias por ti a partir de un borrador. Compensa con estados muy anidados y muchos manejadores."
    }
  ]
}
```

## Cuándo lo usarías de verdad

Un objeto en el estado tiene sentido cuando sus datos **van juntos**:

- **Formularios que se envían de una vez**: la matrícula de una escuela, el perfil de un usuario, una dirección de envío. Un objeto y un manejador genérico ahorran una variable de estado y un manejador por campo.
- **Datos que llegan juntos de un servidor**: un pedido con su cliente, un usuario con su dirección. Los guardas tal como llegan y actualizas solo lo que cambia.
- **Valores que siempre cambian a la vez**: una posición `{ x, y }`, un rango de fechas `{ desde, hasta }`, un marcador con sus dos equipos.

Si dos datos no tienen nada que ver entre sí (si un menú está abierto y el texto de un buscador), es mejor que sean dos `useState` separados. Cómo decidir la forma del estado es el tema de la lección 24.

## Errores típicos

**Olvidar el spread.** `setFicha({ instrumento: 'Violín' })` no «cambia el instrumento»: sustituye la ficha entera por un objeto que solo tiene instrumento. Todo lo demás desaparece.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ficha que pierde campos",
  "consigna": "Pulsa «Cambiarme a violín»: el instrumento cambia, pero el nombre y los apellidos desaparecen del resumen, y la consola muestra un aviso de React. Arregla cambiarAViolin con spread y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [ficha, setFicha] = useState({\n    nombre: 'Lucía',\n    apellidos: 'Ferrer',\n    instrumento: 'Piano',\n  })\n\n  function manejarCambio(e) {\n    setFicha({ ...ficha, [e.target.name]: e.target.value })\n  }\n\n  function cambiarAViolin() {\n    setFicha({ instrumento: 'Violín' })\n  }\n\n  return (\n    <main>\n      <h1>Escuela de música La Corchea</h1>\n      <label>\n        Nombre\n        <input name=\"nombre\" value={ficha.nombre} onChange={manejarCambio} />\n      </label>\n      <div className=\"resumen\">\n        <p>Alumna: {ficha.nombre} {ficha.apellidos}</p>\n        <p>Instrumento: {ficha.instrumento}</p>\n      </div>\n      <button onClick={cambiarAViolin}>Cambiarme a violín</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.6rem;\n  font-size: 0.95rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nfieldset {\n  margin: 0 0 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n}\n\n.resumen {\n  margin: 0.75rem 0;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #0f766e;\n  background: #f0fdfa;\n}\n\n.resumen h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1rem;\n}\n\n.resumen p {\n  margin: 0.2rem 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El aviso de la consola es este:

```text
A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://react.dev/link/controlled-components
```

Es decir: un campo controlado ha pasado a no controlado, porque su `value` ha pasado de tener un valor a `undefined`. Es lo que le ocurre a `ficha.nombre` al perder la propiedad. El campo sigue enseñando «Lucía», pero ya no es el estado: es lo que se quedó en el DOM. Lo de controlado y no controlado lo verás en la lección 22; aquí la causa es la de siempre, un objeto nuevo al que le faltan campos.

**Mutar sin darte cuenta.** Hay operaciones que no parecen asignaciones y lo son:

```js
ficha.clasesPorSemana++                 // muta
ficha.cuota += 5                        // muta
delete ficha.descuento                  // muta
Object.assign(ficha, { pagada: true })  // muta: escribe en la propia ficha

setFicha({ ...ficha, clasesPorSemana: ficha.clasesPorSemana + 1 })  // no muta
setFicha(Object.assign({}, ficha, { pagada: true }))  // no muta: escribe en un objeto vacío nuevo

const { descuento, ...sinDescuento } = ficha  // quitar un campo sin mutar
setFicha(sinDescuento)
```

**Creer que `const copia = ficha` es una copia.** Es otro nombre para el mismo objeto, como en la opción C de antes. Una copia necesita llaves nuevas: `{ ...ficha }`.

**Copiar solo el primer nivel.** `{ ...ficha }` no copia el contacto. Si el cambio está dentro de un objeto anidado, copia también ese nivel, como en el «Restablecer» de antes.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si declaro el estado con const, nadie puede cambiarlo",
      "realidad": "const impide reasignar la variable, no cambiar el objeto: marcador.local = 3 funciona sin ningún error. Lo que protege el estado es que tú no lo mutes."
    },
    {
      "mito": "Hay que hacer una copia profunda en cada cambio",
      "realidad": "Basta con copiar el camino desde lo que cambia hasta arriba. El resto puede, y conviene, seguir siendo el mismo objeto."
    },
    {
      "mito": "Mutar está prohibido siempre",
      "realidad": "Lo prohibido es mutar lo que ya está en el estado o llega por props. Un objeto que acabas de crear puedes modificarlo antes de pasarlo a set."
    },
    {
      "mito": "Si se ve bien en pantalla, no hay mutación",
      "realidad": "Una mutación con una copia por encima se repinta y parece correcta. El fallo sale después: un «Restablecer» que no restablece, un historial que no deshace, un componente memorizado que no se actualiza."
    },
    {
      "mito": "Immer hace que React acepte mutaciones",
      "realidad": "React sigue recibiendo un objeto nuevo. Immer anota lo que haces sobre un borrador y escribe las copias por ti."
    }
  ]
}
```

## Ejercicios

El Taller Hermanos Ruiz abre una orden de reparación por cada coche que entra: los datos del cliente, los del vehículo y la avería. La orden es un objeto con dos objetos dentro. La avería ya se actualiza bien, pero el manejador del cliente muta el estado y el del vehículo está sin escribir.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La orden de reparación del Taller Hermanos Ruiz",
  "consigna": "Arregla manejarCambioCliente y escribe manejarCambioVehiculo. Cada uno debe crear objetos nuevos en todos los niveles que cambian: la orden y, dentro, el cliente o el vehículo. Aprovecha el name de cada campo para que un manejador sirva para todo su objeto. Comprueba también que «Restablecer» deja la orden como al principio. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst ORDEN_INICIAL = {\n  averia: 'Ruido al frenar',\n  cliente: { nombre: 'Irene Sanz', telefono: '600 123 456' },\n  vehiculo: { marca: 'Seat', combustible: 'Gasolina' },\n}\n\nexport default function App() {\n  const [orden, setOrden] = useState(ORDEN_INICIAL)\n\n  function manejarCambioAveria(e) {\n    setOrden({ ...orden, averia: e.target.value })\n  }\n\n  function manejarCambioCliente(e) {\n    // Arréglalo: esto cambia el cliente que ya está en el estado\n    orden.cliente[e.target.name] = e.target.value\n  }\n\n  function manejarCambioVehiculo(e) {\n    // Escribe aquí la actualización del vehículo\n  }\n\n  return (\n    <main>\n      <h1>Taller Hermanos Ruiz: orden de reparación</h1>\n      <fieldset>\n        <legend>Cliente</legend>\n        <label>\n          Nombre\n          <input name=\"nombre\" value={orden.cliente.nombre} onChange={manejarCambioCliente} />\n        </label>\n        <label>\n          Teléfono\n          <input name=\"telefono\" value={orden.cliente.telefono} onChange={manejarCambioCliente} />\n        </label>\n      </fieldset>\n      <fieldset>\n        <legend>Vehículo</legend>\n        <label>\n          Marca\n          <input name=\"marca\" value={orden.vehiculo.marca} onChange={manejarCambioVehiculo} />\n        </label>\n        <label>\n          Combustible\n          <select name=\"combustible\" value={orden.vehiculo.combustible} onChange={manejarCambioVehiculo}>\n            <option>Gasolina</option>\n            <option>Diésel</option>\n            <option>Eléctrico</option>\n          </select>\n        </label>\n      </fieldset>\n      <label>\n        Avería\n        <input value={orden.averia} onChange={manejarCambioAveria} />\n      </label>\n      <div className=\"resumen\">\n        <h2>Resguardo</h2>\n        <p>Cliente: {orden.cliente.nombre}, {orden.cliente.telefono}</p>\n        <p>Vehículo: {orden.vehiculo.marca} ({orden.vehiculo.combustible})</p>\n        <p>Avería: {orden.averia}</p>\n      </div>\n      <button onClick={() => setOrden(ORDEN_INICIAL)}>Restablecer</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.6rem;\n  font-size: 0.95rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nfieldset {\n  margin: 0 0 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n}\n\n.resumen {\n  margin: 0.75rem 0;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #0f766e;\n  background: #f0fdfa;\n}\n\n.resumen h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1rem;\n}\n\n.resumen p {\n  margin: 0.2rem 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al escribir en «Teléfono», el resguardo muestra el número nuevo y conserva el nombre",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "699 000 111"
          }
        }
      ],
      "espera": {
        "texto": "Cliente: Irene Sanz, 699 000 111"
      }
    },
    {
      "descripcion": "Al escribir en «Marca», el resguardo muestra la marca nueva y conserva el combustible",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Marca",
            "texto": "Renault"
          }
        }
      ],
      "espera": {
        "texto": "Vehículo: Renault (Gasolina)"
      }
    },
    {
      "descripcion": "Al elegir «Diésel» en «Combustible», el resguardo lo muestra con la misma marca",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Combustible",
            "opcion": "Diésel"
          }
        }
      ],
      "espera": {
        "texto": "Vehículo: Seat (Diésel)"
      }
    },
    {
      "descripcion": "Después de cambiar el teléfono, «Restablecer» vuelve a dejar 600 123 456",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "699 000 111"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Restablecer"
          }
        }
      ],
      "espera": {
        "etiqueta": "Teléfono",
        "valor": "600 123 456"
      }
    },
    {
      "descripcion": "Después de cambiar la marca, «Restablecer» vuelve a dejar Seat",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Marca",
            "texto": "Renault"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Restablecer"
          }
        }
      ],
      "espera": {
        "texto": "Vehículo: Seat (Gasolina)"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio, añade un botón «Mismo cliente, otro coche» que deje el cliente como está y vacíe la marca y la avería, con una sola llamada a `setOrden`.
2. Añade a la orden un objeto `presupuesto` con `piezas` y `manoDeObra`, cada uno con su campo `type="number"`, y muestra el total en el resguardo. Pista: `e.target.value` siempre es texto; conviértelo con `Number` antes de sumar.
3. Sustituye los dos manejadores anidados por uno solo: `manejarCambioEn('cliente')` debe devolver la función que actualiza el cliente, y `manejarCambioEn('vehiculo')`, la del vehículo. Pista: `[seccion]` también funciona como nombre de propiedad calculado.
4. En el marcador del principio, añade un botón «Deshacer» que recupere el marcador anterior: antes de cada gol, guarda el objeto actual en otro estado. Comprueba que funciona con objetos nuevos y que deja de funcionar si sumas el gol con `marcador.local += 1` y después copias: el «anterior» que guardaste habrá cambiado también.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Updating Objects in State",
      "descripcion": "La página de react.dev en la que se basa esta lección: mutación, spread, objetos anidados, Immer y tres retos para practicar.",
      "url": "https://react.dev/learn/updating-objects-in-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: la pantalla no se actualiza",
      "descripcion": "La referencia de useState explica por qué React ignora un set con el mismo objeto, comparando con Object.is.",
      "url": "https://react.dev/reference/react/useState#ive-updated-the-state-but-the-screen-doesnt-update",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "immutability",
      "descripcion": "La regla del linter de React que detecta mutaciones de props y estado, con ejemplos de lo que marca y cómo arreglarlo.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Spread syntax",
      "descripcion": "La sintaxis de propagación en objetos y arrays: qué copia, en qué orden y por qué es superficial.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax",
      "etiqueta": "MDN"
    },
    {
      "titulo": "structuredClone()",
      "descripcion": "La copia profunda del navegador, con la lista de lo que puede y no puede clonar.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone",
      "etiqueta": "MDN"
    },
    {
      "titulo": "use-immer",
      "descripcion": "El hook useImmer y su versión para reducers, con ejemplos de uso.",
      "url": "https://github.com/immerjs/use-immer",
      "etiqueta": "GitHub"
    }
  ]
}
```
