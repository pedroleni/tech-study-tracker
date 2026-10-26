# Validar formularios: el navegador, tu acción y Zod

- **Módulo:** Formularios y Actions
- **Slug:** `validar-formularios-el-navegador-tu-accion-y-zod` (autogenerado del título)
- **Orden:** 610
- **Fuentes:** [Constraint validation (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation) + [useActionState](https://react.dev/reference/react/useActionState) + [Zod](https://zod.dev/) — ver `contenido/react/TEMARIO.md` #61

---

## Qué es y para qué sirve

Las lecciones 57 y 58 resolvieron **cómo se envía** un formulario: una función en `action`, `useActionState` para guardar lo que devuelve, `isPending` para saber si sigue en marcha. Ninguna decidió **qué datos se aceptan**. Un formulario de inscripción que deja pasar un correo sin `@`, un nombre en blanco o «37 plazas» funciona de maravilla y está mal.

Validar es comprobar los datos antes de darlos por buenos y, si algo falla, **decirle a la persona qué tiene que cambiar sin que pierda lo que ya había escrito**. Se puede hacer en tres sitios, y esta lección los recorre en orden con la inscripción de una escuela de cerámica:

1. **El navegador**, con atributos de HTML: `required`, `type="email"`, `pattern`, `min`... Gratis, sin JavaScript, pero con el aspecto y los mensajes que él decide.
2. **Tu acción**, con tus reglas en JavaScript y los errores devueltos como estado (lección 58). Tú mandas en los mensajes, en el aspecto y en la accesibilidad.
3. **Zod**, una biblioteca que te deja *describir* las reglas en lugar de programarlas una a una. Sigue siendo la capa 2, escrita mejor.

Y una advertencia que repetiremos al final: **ninguna de las tres sustituye al servidor.** Todo lo que ocurre en el navegador lo puede saltar quien quiera.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres sitios donde validar un formulario",
  "roles": [
    {
      "etiqueta": "El navegador",
      "rol": "Atributos de HTML",
      "descripcion": "required, type, pattern, min, max... El navegador bloquea el envío y enseña su propio mensaje. Cero código, poco control."
    },
    {
      "etiqueta": "Tu acción",
      "rol": "Reglas en JavaScript",
      "descripcion": "Compruebas los datos dentro de la acción y devuelves los errores por campo como estado. Tus mensajes, tu diseño, tu accesibilidad."
    },
    {
      "etiqueta": "Zod",
      "rol": "Reglas descritas en un esquema",
      "descripcion": "En vez de un if por regla, declaras cómo es un dato válido. Se usa dentro de la acción, y el mismo esquema sirve en el servidor."
    }
  ]
}
```

## Capa 1: lo que el navegador ya comprueba

HTML trae validación incorporada, y se activa con atributos que ya conoces del temario de HTML. Con React no cambia nada: son los mismos atributos en el JSX.

- **`required`**: el campo no puede estar vacío.
- **`type="email"`, `type="url"`**: el valor tiene que parecer un correo o una URL absoluta. (`type="number"` rechaza lo que no sea un número.)
- **`min` y `max`**: el límite de un número o una fecha. `step` marca de cuánto en cuánto.
- **`minLength` y `maxLength`**: la longitud del texto.
- **`pattern`**: una expresión regular que todo el valor tiene que cumplir.

Cada regla rota deja al campo en un estado concreto, y el navegador lo expone en `campo.validity`: `valueMissing`, `typeMismatch`, `tooShort`, `patternMismatch`, `rangeUnderflow`, `rangeOverflow`... Es la *Constraint Validation API*, y con ella puedes mirar por dentro. El formulario de abajo lo hace: en el panel lee la validez de cada campo mientras escribes.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La validez de cada campo, a la vista",
  "consigna": "Pulsa «Reservar plaza» con todo vacío: el navegador no deja pasar el formulario, te lleva al primer campo con problema y enseña su globo; «Reservas hechas» sigue en 0. Después escribe un correo sin @, un 9 en las plazas y un código de 3 cifras, y mira el panel: cada fallo tiene nombre propio.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst BANDERAS = [\n  'valueMissing',\n  'typeMismatch',\n  'tooShort',\n  'patternMismatch',\n  'rangeUnderflow',\n  'rangeOverflow',\n]\n\n// Lo que el navegador sabe de cada campo: campo.validity y su mensaje.\nfunction leerValidez(formulario) {\n  return [...formulario.elements]\n    .filter((campo) => campo.name)\n    .map((campo) => ({\n      nombre: campo.name,\n      fallos: BANDERAS.filter((bandera) => campo.validity[bandera]),\n      mensaje: campo.validationMessage,\n    }))\n}\n\nexport default function App() {\n  const [reservas, setReservas] = useState(0)\n  const [validez, setValidez] = useState([])\n\n  function reservar(formData) {\n    setReservas((total) => total + 1)\n    setValidez([])\n  }\n\n  return (\n    <main>\n      <h1>Escuela de cerámica El Torno</h1>\n      <form\n        action={reservar}\n        onInput={(e) => setValidez(leerValidez(e.currentTarget))}\n      >\n        <div className=\"campo\">\n          <label htmlFor=\"nombre\">Nombre</label>\n          <input id=\"nombre\" name=\"nombre\" required minLength={2} />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"correo\">Correo</label>\n          <input id=\"correo\" name=\"correo\" type=\"email\" required />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"plazas\">Plazas (de 1 a 4)</label>\n          <input id=\"plazas\" name=\"plazas\" type=\"number\" min=\"1\" max=\"4\" required />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"cp\">Código postal (opcional, 5 cifras)</label>\n          <input id=\"cp\" name=\"cp\" pattern=\"[0-9]{5}\" />\n        </div>\n        <button onClick={(e) => setValidez(leerValidez(e.currentTarget.form))}>\n          Reservar plaza\n        </button>\n      </form>\n      <p>Reservas hechas: {reservas}</p>\n      <h2>Lo que dice el navegador</h2>\n      <ul>\n        {validez.length === 0 && <li className=\"nota\">Escribe en un campo o pulsa el botón.</li>}\n        {validez.map((campo) => (\n          <li key={campo.nombre}>\n            <strong>{campo.nombre}</strong>:{' '}\n            {campo.fallos.length === 0\n              ? 'válido'\n              : `${campo.fallos.join(', ')} — «${campo.mensaje}»`}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\ninput:user-invalid {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\nul {\n  padding-left: 1.2rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Tres cosas que se ven ahí y que importan para todo lo que viene:

- **El mensaje no es tuyo.** El texto del globo («Completa este campo», «Incluye un signo "@"…») lo escribe el navegador, en el idioma del navegador. Comprobado con el mismo formulario: Chromium con la interfaz en español dice «Completa este campo» y WebKit en inglés, «Fill out this field». No lo puedes cambiar con CSS, ni darle otro diseño, ni conectarlo a un lector de pantalla a tu manera.
- **`minLength` solo cuenta lo que teclea una persona.** MDN lo dice: `minlength` y `maxlength` no se comprueban si el valor lo pone un script. Lo hemos comprobado también con la librería que usan las comprobaciones de esta web (user-event), en Chromium y WebKit: un campo con `minLength={10}` en el que se teclea «Hola» deja enviar el formulario. En la práctica, `maxLength` es el que se nota (no te deja escribir de más); `minLength` es de los más fáciles de saltarse.
- **`:invalid` pinta desde el primer instante.** Si estilas `input:invalid`, todos los campos obligatorios salen en rojo antes de que nadie escriba. `:user-invalid` espera a que la persona haya interactuado con el campo o haya intentado enviar; funciona en Chrome 119, Firefox 88 y Safari 16.5 o posteriores (la hoja de estilos del panel de arriba lo usa).

## Qué pasa al enviar un campo no válido

La pregunta que importa con `<form action>`: **si un campo no pasa su validación, ¿llega a ejecutarse la acción?** Predice qué pasa antes de mirar.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function reservar(formData) {\n  console.log('Reserva de', formData.get('nombre'))\n}\n\n<form action={reservar}>\n  <label>\n    Nombre <input name=\"nombre\" required />\n  </label>\n  <button>Reservar</button>\n</form>",
  "opciones": [
    "Reserva de  (con el nombre vacío) y después Reserva de Marta",
    "Solo Reserva de Marta: la primera vez la acción no se ejecuta",
    "Nada en ningún caso: required y action no funcionan juntos",
    "Un error de React por usar required con una función en action"
  ],
  "correcta": 1,
  "explicacion": "Con el campo vacío, el navegador bloquea el envío antes de que exista el evento submit: React no se entera y tu acción no se ejecuta. Al escribir «Marta» y volver a pulsar, el formulario es válido, se envía y la acción corre una sola vez. Lo comprobamos con React 19.3.1."
}
```

Es una buena noticia con matices:

- **Tu acción solo recibe datos que han pasado la validación del navegador.** No hace falta que repitas dentro un `required`... salvo que no te fíes del navegador, que es el tema de la sección siguiente.
- **Se bloquean todos los caminos que pasan por el botón**: clic, Enter dentro de un campo, `form.requestSubmit()`. Pero `form.submit()` no valida (MDN: «Call the `click()` method on a submit button instead»), y por eso React te avisa si algo lo usa (lección 57).
- **El navegador lleva el foco al primer campo no válido** y enseña su globo. Lo comprobamos en Chromium y WebKit: tras un envío bloqueado, el foco estaba en el primer campo con problema. Eso es accesibilidad regalada que más adelante tendrás que reproducir tú.
- **Un botón puede saltarse la validación a propósito** con `formNoValidate`: el «Guardar borrador» de un formulario largo no debe exigir que todo esté bien. Comprobado: el clic sobre un `<button formNoValidate>` ejecuta la acción con campos no válidos.

## Cuando el navegador no basta

Los atributos tienen un techo, y aparece enseguida:

- **Los mensajes no son tuyos** (idioma, tono, redacción) ni los puedes diseñar.
- **Un campo a la vez**: el globo habla solo del primer campo con problema. No hay forma de enseñar los cinco errores juntos, ni un resumen.
- **No hay reglas entre campos**: «la fecha de salida es posterior a la de llegada» o «el curso de esmaltes admite solo dos plazas» no se escriben con atributos. Para eso existe `setCustomValidity`, que deja poner tu propio mensaje a un campo, pero sigue siendo el globo del navegador y las reglas quedan repartidas entre los campos.
- **Un valor puesto desde fuera no se comprueba del todo**, como acabas de ver con `minLength`.
- **Lo puede saltar cualquiera.** Basta con quitar el atributo en las herramientas de desarrollo o con mandar la petición a mano. MDN lo advierte en un recuadro: la validación del navegador *no elimina* la del servidor.

Cuando quieras tus propios mensajes, **pon `noValidate` en el `<form>`**: apaga solo la validación *interactiva* (la que bloquea el envío y enseña el globo). Los atributos siguen ahí, `validity` sigue funcionando y los navegadores siguen sabiendo qué es un correo, pero el formulario se envía siempre y la decisión pasa a tu acción. La mayoría de formularios reales de una aplicación llevan `noValidate`, y los errores los enseña React.

Un detalle que despista: si dejas `required` **y no pones** `noValidate`, el navegador se adelanta a tu acción para esa regla, y tus mensajes para ella no salen nunca. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un required que tapa tu mensaje",
  "consigna": "Pulsa «Reservar plaza» con el nombre vacío: sale el globo del navegador y tu «Escribe el nombre de quien reserva.» no aparece nunca, porque la acción ni se ejecuta. Añade noValidate al form (o quita required) y repite. Prueba también a escribir solo espacios.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport './estilos.css'\n\nfunction reservar(estadoAnterior, formData) {\n  if (formData.get('nombre').trim() === '') {\n    return { mensaje: 'Escribe el nombre de quien reserva.', ok: false }\n  }\n  return { mensaje: `Plaza reservada para ${formData.get('nombre').trim()}.`, ok: true }\n}\n\nexport default function App() {\n  const [estado, accionReservar] = useActionState(reservar, { mensaje: '', ok: false })\n\n  return (\n    <main>\n      <h1>Escuela de cerámica El Torno</h1>\n      <form action={accionReservar}>\n        <div className=\"campo\">\n          <label htmlFor=\"nombre\">Nombre</label>\n          <input id=\"nombre\" name=\"nombre\" required />\n        </div>\n        <button>Reservar plaza</button>\n      </form>\n      <p role=\"status\">{estado.mensaje}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Con espacios sí pasa: **`required` solo mira que el campo no esté vacío**, y un nombre de tres espacios no lo está. Por eso tu acción vuelve a comprobar con `trim()`: son capas que se complementan, no una repetición.

## Capa 2: validar dentro de la acción

El plan es siempre el mismo, y encaja con lo que ya sabes de `useActionState` (lección 58):

1. La acción recibe el `FormData` y lo convierte en un objeto con `Object.fromEntries(formData)`.
2. Una función `validar(valores)` devuelve los errores **por campo**: un objeto `{ campo: ['mensaje'] }` donde solo salen los campos con problema.
3. Si hay errores, la acción **los devuelve como estado** (sin lanzar nada: un error lanzado se lleva el formulario al error boundary y cancela la cola, lección 58). Si no los hay, sigue con el envío.
4. El componente pinta cada error junto a su campo.

La inscripción de **El Torno**, la escuela de cerámica, tiene seis campos: nombre, correo, teléfono (opcional), número de plazas (de 1 a 4), curso y una casilla de aceptación de las normas. `validar` está en su propio archivo; el formato de lo que devuelve (`{ campo: [mensajes] }`) no es casual y en un rato verás por qué.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los errores se ven... y lo escrito desaparece",
  "consigna": "Escribe tu nombre, deja el correo sin arroba, elige un curso y pulsa «Reservar plaza». Salen los errores bien, pero mira qué ha pasado con el nombre, con el correo y con el curso. Esto es lo que las lecciones 57 y 58 dejaron pendiente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport Campo from './Campo'\nimport { validar } from './validar'\nimport './estilos.css'\n\nasync function inscribir(estadoAnterior, formData) {\n  const valores = Object.fromEntries(formData)\n  const errores = validar(valores)\n\n  if (Object.keys(errores).length > 0) {\n    return { errores, aviso: null }\n  }\n  return { errores: {}, aviso: `Plaza reservada para ${valores.nombre.trim()}.` }\n}\n\nexport default function App() {\n  const [estado, accionInscribir] = useActionState(inscribir, {\n    errores: {},\n    aviso: null,\n  })\n  const { errores } = estado\n\n  return (\n    <main>\n      <h1>Escuela de cerámica El Torno</h1>\n      <form action={accionInscribir} noValidate>\n        <Campo etiqueta=\"Nombre\" error={errores.nombre?.[0]}>\n          {(id) => <input id={id} name=\"nombre\" autoComplete=\"name\" />}\n        </Campo>\n        <Campo etiqueta=\"Correo\" error={errores.correo?.[0]}>\n          {(id) => <input id={id} name=\"correo\" type=\"email\" autoComplete=\"email\" />}\n        </Campo>\n        <Campo etiqueta=\"Teléfono (opcional)\" error={errores.telefono?.[0]}>\n          {(id) => <input id={id} name=\"telefono\" type=\"tel\" autoComplete=\"tel\" />}\n        </Campo>\n        <Campo etiqueta=\"Plazas\" error={errores.plazas?.[0]}>\n          {(id) => <input id={id} name=\"plazas\" type=\"number\" />}\n        </Campo>\n        <Campo etiqueta=\"Curso\" error={errores.curso?.[0]}>\n          {(id) => (\n            <select id={id} name=\"curso\" defaultValue=\"\">\n              <option value=\"\">Elige un curso</option>\n              <option value=\"iniciacion\">Iniciación</option>\n              <option value=\"torno\">Torno</option>\n              <option value=\"esmaltes\">Esmaltes</option>\n            </select>\n          )}\n        </Campo>\n        <Campo etiqueta=\"Acepto las normas del taller\" error={errores.acepto?.[0]} enLinea>\n          {(id) => <input id={id} name=\"acepto\" type=\"checkbox\" />}\n        </Campo>\n        <button>Reservar plaza</button>\n      </form>\n      <p role=\"status\">{estado.aviso}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Campo.jsx",
      "codigo": "import { useId } from 'react'\n\n// Un campo con su etiqueta y su error. children es una función que recibe\n// el id y devuelve el input (o el select) que se une a la etiqueta.\nexport default function Campo({ etiqueta, error, enLinea = false, children }) {\n  const id = useId()\n\n  return (\n    <div className={enLinea ? 'campo en-linea' : 'campo'}>\n      {enLinea && children(id)}\n      <label htmlFor={id}>{etiqueta}</label>\n      {!enLinea && children(id)}\n      {error && <p className=\"error\">{error}</p>}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "validar.jsx",
      "codigo": "// Devuelve { campo: ['mensaje'] }: solo salen los campos con problema.\nexport function validar(valores) {\n  const errores = {}\n\n  if (valores.nombre.trim().length < 2) {\n    errores.nombre = ['Escribe tu nombre (mínimo 2 letras).']\n  }\n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(valores.correo)) {\n    errores.correo = ['Ese correo no parece válido.']\n  }\n  if (valores.telefono !== '' && !/^\\d{9}$/.test(valores.telefono)) {\n    errores.telefono = ['Son nueve cifras, sin espacios.']\n  }\n\n  const plazas = Number(valores.plazas)\n  if (Number.isNaN(plazas)) {\n    errores.plazas = ['Escribe cuántas plazas quieres.']\n  } else if (!Number.isInteger(plazas)) {\n    errores.plazas = ['Tiene que ser un número entero.']\n  } else if (plazas < 1) {\n    errores.plazas = ['Como mínimo, una plaza.']\n  } else if (plazas > 4) {\n    errores.plazas = ['Como máximo, cuatro plazas.']\n  }\n\n  if (!['iniciacion', 'torno', 'esmaltes'].includes(valores.curso)) {\n    errores.curso = ['Elige un curso.']\n  }\n  if (valores.acepto !== 'on') {\n    errores.acepto = ['Tienes que aceptar las normas del taller.']\n  }\n  return errores\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Los errores salen donde tienen que salir. Pero **el formulario se ha vaciado**, también lo que estaba bien. Es la sorpresa de las lecciones 57 y 58: para React, una acción que devuelve algo (aunque sea un error) ha terminado bien, y al terminar bien reinicia el formulario como `form.reset()`. Para quien rellenó seis campos, empezar de cero por un correo mal puesto es la forma más rápida de perder a un cliente.

## Conservar lo escrito

La solución sale de entender qué hace el reinicio: **cada campo vuelve a su valor inicial**, el `defaultValue` que tenga *en ese momento*. Y ese valor inicial es una prop como otra cualquiera. Si la acción devuelve los valores que recibió, el componente los puede pasar como `defaultValue`, y al reiniciar el formulario cada campo vuelve a lo que la persona había escrito:

```jsx
// En la acción: devuelve lo que llegó junto a los errores
return { valores, errores, aviso: null }

// En el componente: es el valor inicial del campo
<input name="nombre" defaultValue={estado.valores.nombre} />
```

Y cuando todo va bien se devuelve `valores: {}`: sin valor inicial, el reinicio deja el campo vacío, que es lo que se quiere después de reservar. El mismo mecanismo conserva en un caso y limpia en el otro, sin `setNombre('')` por ningún lado.

Cada tipo de campo guarda su valor inicial de una forma. Todo esto lo hemos comprobado en un formulario con cada tipo, con un envío erróneo y uno correcto:

- **Texto, correo, número, teléfono**: `defaultValue={valores.campo}`.
- **`<textarea>`**: también `defaultValue`.
- **Casilla**: `defaultChecked={valores.acepto === 'on'}`. Una casilla desmarcada no viaja en el `FormData` (lección 57), así que «no está» significa «desmarcada».
- **Opciones de radio**: `defaultChecked` en cada opción, comparando con el valor que llegó.
- **`<select>`**: `defaultValue`... **más una `key`**. Es la excepción, y la pregunta de más abajo.

Aquí está el formulario completo, ya conservando todo. Repite lo mismo de antes y compara:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La misma inscripción, conservando lo escrito",
  "consigna": "Rellena todo mal (nombre de una letra, correo sin arroba, un curso elegido, la casilla marcada) y envía: los errores salen y los campos se quedan como estaban. Corrige uno a uno y reserva: al salir bien, el formulario se vacía. Mira en App.jsx de dónde sale cada defaultValue.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport Campo from './Campo'\nimport { validar } from './validar'\nimport './estilos.css'\n\nasync function inscribir(estadoAnterior, formData) {\n  const valores = Object.fromEntries(formData)\n  const errores = validar(valores)\n\n  if (Object.keys(errores).length > 0) {\n    return { valores, errores, aviso: null }\n  }\n  return {\n    valores: {},\n    errores: {},\n    aviso: `Plaza reservada para ${valores.nombre.trim()}.`,\n  }\n}\n\nexport default function App() {\n  const [estado, accionInscribir] = useActionState(inscribir, {\n    valores: {},\n    errores: {},\n    aviso: null,\n  })\n  const { valores, errores } = estado\n\n  return (\n    <main>\n      <h1>Escuela de cerámica El Torno</h1>\n      <form action={accionInscribir} noValidate>\n        <Campo etiqueta=\"Nombre\" error={errores.nombre?.[0]}>\n          {(id) => <input id={id} name=\"nombre\" autoComplete=\"name\" defaultValue={valores.nombre} />}\n        </Campo>\n        <Campo etiqueta=\"Correo\" error={errores.correo?.[0]}>\n          {(id) => <input\n              id={id}\n              name=\"correo\"\n              type=\"email\"\n              autoComplete=\"email\"\n              defaultValue={valores.correo}\n            />}\n        </Campo>\n        <Campo etiqueta=\"Teléfono (opcional)\" error={errores.telefono?.[0]}>\n          {(id) => <input\n              id={id}\n              name=\"telefono\"\n              type=\"tel\"\n              autoComplete=\"tel\"\n              defaultValue={valores.telefono}\n            />}\n        </Campo>\n        <Campo etiqueta=\"Plazas\" error={errores.plazas?.[0]}>\n          {(id) => <input id={id} name=\"plazas\" type=\"number\" defaultValue={valores.plazas} />}\n        </Campo>\n        <Campo etiqueta=\"Curso\" error={errores.curso?.[0]}>\n          {(id) => (\n            <select\n              key={valores.curso}\n              id={id}\n              name=\"curso\"\n              defaultValue={valores.curso ?? ''}\n            >\n              <option value=\"\">Elige un curso</option>\n              <option value=\"iniciacion\">Iniciación</option>\n              <option value=\"torno\">Torno</option>\n              <option value=\"esmaltes\">Esmaltes</option>\n            </select>\n          )}\n        </Campo>\n        <Campo etiqueta=\"Acepto las normas del taller\" error={errores.acepto?.[0]} enLinea>\n          {(id) => <input id={id} name=\"acepto\" type=\"checkbox\" defaultChecked={valores.acepto === 'on'} />}\n        </Campo>\n        <button>Reservar plaza</button>\n      </form>\n      <p role=\"status\">{estado.aviso}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Campo.jsx",
      "codigo": "import { useId } from 'react'\n\n// Un campo con su etiqueta y su error. children es una función que recibe\n// el id y devuelve el input (o el select) que se une a la etiqueta.\nexport default function Campo({ etiqueta, error, enLinea = false, children }) {\n  const id = useId()\n\n  return (\n    <div className={enLinea ? 'campo en-linea' : 'campo'}>\n      {enLinea && children(id)}\n      <label htmlFor={id}>{etiqueta}</label>\n      {!enLinea && children(id)}\n      {error && <p className=\"error\">{error}</p>}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "validar.jsx",
      "codigo": "// Devuelve { campo: ['mensaje'] }: solo salen los campos con problema.\nexport function validar(valores) {\n  const errores = {}\n\n  if (valores.nombre.trim().length < 2) {\n    errores.nombre = ['Escribe tu nombre (mínimo 2 letras).']\n  }\n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(valores.correo)) {\n    errores.correo = ['Ese correo no parece válido.']\n  }\n  if (valores.telefono !== '' && !/^\\d{9}$/.test(valores.telefono)) {\n    errores.telefono = ['Son nueve cifras, sin espacios.']\n  }\n\n  const plazas = Number(valores.plazas)\n  if (Number.isNaN(plazas)) {\n    errores.plazas = ['Escribe cuántas plazas quieres.']\n  } else if (!Number.isInteger(plazas)) {\n    errores.plazas = ['Tiene que ser un número entero.']\n  } else if (plazas < 1) {\n    errores.plazas = ['Como mínimo, una plaza.']\n  } else if (plazas > 4) {\n    errores.plazas = ['Como máximo, cuatro plazas.']\n  }\n\n  if (!['iniciacion', 'torno', 'esmaltes'].includes(valores.curso)) {\n    errores.curso = ['Elige un curso.']\n  }\n  if (valores.acepto !== 'on') {\n    errores.acepto = ['Tienes que aceptar las normas del taller.']\n  }\n  return errores\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

El `<select>` lleva una `key` y hay que saber por qué. Predice qué pasaría sin ella.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// La acción devuelve { valores, errores } con los valores recibidos.\n<select name=\"curso\" defaultValue={estado.valores.curso ?? ''}>\n  <option value=\"\">Elige un curso</option>\n  <option value=\"torno\">Torno</option>\n  <option value=\"esmaltes\">Esmaltes</option>\n</select>",
  "opciones": [
    "Torno: el desplegable conserva lo elegido, igual que los campos de texto",
    "Elige un curso: el desplegable vuelve a la primera opción",
    "Queda en blanco, sin ninguna opción seleccionada",
    "React avisa en la consola de que defaultValue no puede cambiar"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos: elegido «Torno» y enviado con un error en otro campo, el FormData posterior traía curso vacío. Para un select, un defaultValue nuevo no cambia la opción marcada por defecto, y el reinicio vuelve a la primera. Con key={valores.curso}, el select se vuelve a crear cada vez que cambia el valor y nace ya con la opción buena. No hay ningún aviso."
}
```

Es la parte rara de la técnica: los inputs y los `textarea` actualizan su valor inicial cuando cambia `defaultValue`; el `<select>` no. Por eso su `key` es el valor devuelto: cuando cambia, React lo trata como un select nuevo (lección 26), con su `defaultValue` ya puesto. Podrías ponerla en el `<form>` entero, pero volvería a crear todos los campos sin necesidad: con el select basta.

Hay **otra forma de conservar lo escrito**: campos controlados con `value` y `onChange` (lección 22). Un campo controlado no se reinicia, porque su valor vive en tu estado, no en el DOM (lección 57). Es más código (un estado por campo y un manejador para cada uno) y solo compensa cuando necesitas leer el campo mientras se escribe: un contador de caracteres, un campo que depende de otro. Para validar al enviar, `defaultValue` es más corto.

Dos cuidados con lo que devuelves en `valores`:

- **Las contraseñas no se devuelven.** Quita el campo del objeto antes de ponerlo en el estado; que la persona la escriba de nuevo.
- **Los archivos no se pueden rellenar por código.** Un `<input type="file">` no admite valor inicial, es una restricción del navegador. Si hay un archivo en el formulario, avisa de que hay que volver a elegirlo.

## Que los errores se entiendan sin verlos

Pintar el mensaje en rojo debajo del campo es solo la mitad. Quien usa un lector de pantalla no ve el rojo, y si el mensaje es un `<p>` suelto, no sabe que pertenece a ese campo. Con el globo del navegador te lo daban hecho; ahora te toca a ti. Tres piezas, las que ya viste en la lección 37:

- **`aria-invalid="true"`** en cada campo con error. Es lo que hace que el lector diga «entrada no válida». En los campos buenos no lo pongas (omitir el atributo equivale a `"false"`).
- **`aria-describedby`** apuntando al `id` del mensaje del campo, para que el lector lo lea junto al nombre del campo. Los `id` salen de `useId` (lección 37), así que `Campo` funciona aunque haya dos formularios en la página.
- **Un resumen en una región viva**: `role="alert"`, que existe en la página antes de que cambie su contenido (si aparece de golpe con el texto dentro, puede no anunciarse; lección 37). Dice cuántos campos hay que corregir, sin repetir los mensajes.

Y el foco. El navegador lo llevaba solo al primer campo no válido; ahora que validas tú, hay que llevarlo a mano. En la lección 37 se hizo con `flushSync`, para que el mensaje ya estuviera en el DOM al llegar el foco. **Aquí no hace falta**: el foco se mueve en un `useEffect` que se ejecuta cuando el estado nuevo ya está en pantalla. Lo comprobamos: al recibir el foco, el campo ya tenía su `aria-describedby` y el mensaje en el DOM.

```jsx
const formulario = useRef(null)

useEffect(() => {
  formulario.current.querySelector('[aria-invalid="true"]')?.focus()
}, [estado])
```

El botón dice «Reservando…» gracias a `isPending` (lección 58); si fuese un componente aparte, lo leería con `useFormStatus` (lección 59). El formulario siguiente lo reúne todo, más el envío al servidor: si todo es válido, la inscripción se guarda con un `POST`, y si el servidor falla, **también se conserva lo escrito**. El recuadro «Lo que diría un lector» es un modelo aproximado: al enfocar un campo, junta su etiqueta, si es no válido y el texto al que apunta `aria-describedby`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Errores que un lector de pantalla entiende",
  "consigna": "Envía el formulario vacío y fíjate en tres cosas: el resumen de arriba, el foco en «Nombre» y el recuadro «Lo que diría un lector». Pulsa Tab por los campos con error y mira cómo cambia el recuadro. Después rellénalo bien, usa «Fallar la siguiente petición» del panel de red y envía: se avisa del fallo y no se pierde nada.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState, useEffect, useRef, useState } from 'react'\nimport Campo from './Campo'\nimport { inscribir } from './accion'\nimport './estilos.css'\n\n// Aproximación de lo que un lector de pantalla diría al llegar a un campo.\nfunction describir(campo) {\n  const etiqueta = campo.labels[0].textContent\n  const invalido = campo.getAttribute('aria-invalid') === 'true' ? ', entrada no válida' : ''\n  const ayuda = (campo.getAttribute('aria-describedby') ?? '')\n    .split(' ')\n    .map((id) => document.getElementById(id)?.textContent)\n    .join(' ')\n  return `${etiqueta}${invalido}. ${ayuda}`.trim()\n}\n\nexport default function App() {\n  const [estado, accionInscribir, isPending] = useActionState(inscribir, {\n    valores: {},\n    errores: {},\n    aviso: null,\n  })\n  const { valores, errores, aviso } = estado\n  const [oido, setOido] = useState('')\n  const formulario = useRef(null)\n  const cantidad = Object.keys(errores).length\n\n  // Tras cada envío con errores, el foco va al primer campo no válido.\n  useEffect(() => {\n    formulario.current.querySelector('[aria-invalid=\"true\"]')?.focus()\n  }, [estado])\n\n  return (\n    <main>\n      <h1>Escuela de cerámica El Torno</h1>\n      <div role=\"alert\" className=\"resumen\">\n        {cantidad > 0 && (\n          <p>{`Hay ${cantidad} ${cantidad === 1 ? 'campo' : 'campos'} por corregir.`}</p>\n        )}\n        {aviso?.tipo === 'error' && <p>{aviso.texto}</p>}\n      </div>\n      <form\n        ref={formulario}\n        action={accionInscribir}\n        noValidate\n        onFocus={(e) => {\n          if (e.target.matches('input, select')) setOido(describir(e.target))\n        }}\n      >\n        <Campo etiqueta=\"Nombre\" error={errores.nombre?.[0]}>\n          {(propsCampo) => (\n            <input name=\"nombre\" autoComplete=\"name\" defaultValue={valores.nombre} {...propsCampo} />\n          )}\n        </Campo>\n        <Campo etiqueta=\"Correo\" error={errores.correo?.[0]}>\n          {(propsCampo) => (\n            <input name=\"correo\" type=\"email\" autoComplete=\"email\" defaultValue={valores.correo} {...propsCampo} />\n          )}\n        </Campo>\n        <Campo etiqueta=\"Teléfono (opcional)\" error={errores.telefono?.[0]}>\n          {(propsCampo) => (\n            <input name=\"telefono\" type=\"tel\" autoComplete=\"tel\" defaultValue={valores.telefono} {...propsCampo} />\n          )}\n        </Campo>\n        <Campo etiqueta=\"Plazas\" error={errores.plazas?.[0]}>\n          {(propsCampo) => (\n            <input name=\"plazas\" type=\"number\" defaultValue={valores.plazas} {...propsCampo} />\n          )}\n        </Campo>\n        <Campo etiqueta=\"Curso\" error={errores.curso?.[0]}>\n          {(propsCampo) => (\n            <select name=\"curso\" key={valores.curso} defaultValue={valores.curso ?? ''} {...propsCampo}>\n              <option value=\"\">Elige un curso</option>\n              <option value=\"iniciacion\">Iniciación</option>\n              <option value=\"torno\">Torno</option>\n              <option value=\"esmaltes\">Esmaltes</option>\n            </select>\n          )}\n        </Campo>\n        <Campo etiqueta=\"Acepto las normas del taller\" error={errores.acepto?.[0]} enLinea>\n          {(propsCampo) => (\n            <input name=\"acepto\" type=\"checkbox\" defaultChecked={valores.acepto === 'on'} {...propsCampo} />\n          )}\n        </Campo>\n        <button disabled={isPending}>{isPending ? 'Reservando…' : 'Reservar plaza'}</button>\n      </form>\n      <p role=\"status\">{aviso?.tipo === 'ok' ? aviso.texto : ''}</p>\n      <p className=\"oido\" aria-hidden=\"true\">\n        Lo que diría un lector: {oido || 'enfoca un campo'}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "accion.jsx",
      "codigo": "import { validar } from './validar'\n\nexport async function inscribir(estadoAnterior, formData) {\n  const valores = Object.fromEntries(formData)\n  const errores = validar(valores)\n\n  if (Object.keys(errores).length > 0) {\n    return { valores, errores, aviso: null }\n  }\n\n  const respuesta = await fetch('/api/inscripciones', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ ...valores, nombre: valores.nombre.trim() }),\n  })\n  if (!respuesta.ok) {\n    // El servidor ha fallado: los datos estaban bien, así que se conservan.\n    return {\n      valores,\n      errores: {},\n      aviso: { tipo: 'error', texto: 'No se ha podido guardar la inscripción. Inténtalo otra vez.' },\n    }\n  }\n  const inscripcion = await respuesta.json()\n  return {\n    valores: {},\n    errores: {},\n    aviso: {\n      tipo: 'ok',\n      texto: `Plaza reservada para ${inscripcion.nombre} (inscripción n.º ${inscripcion.id}).`,\n    },\n  }\n}\n"
    },
    {
      "nombre": "Campo.jsx",
      "codigo": "import { useId } from 'react'\n\n// El campo da a su control tres props: id, aria-invalid y aria-describedby.\nexport default function Campo({ etiqueta, error, enLinea = false, children }) {\n  const id = useId()\n  const idError = `${id}-error`\n  const propsCampo = {\n    id,\n    'aria-invalid': error ? 'true' : undefined,\n    'aria-describedby': error ? idError : undefined,\n  }\n\n  return (\n    <div className={enLinea ? 'campo en-linea' : 'campo'}>\n      {enLinea && children(propsCampo)}\n      <label htmlFor={id}>{etiqueta}</label>\n      {!enLinea && children(propsCampo)}\n      {error && (\n        <p id={idError} className=\"error\">\n          {error}\n        </p>\n      )}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "validar.jsx",
      "codigo": "// Devuelve { campo: ['mensaje'] }: solo salen los campos con problema.\nexport function validar(valores) {\n  const errores = {}\n\n  if (valores.nombre.trim().length < 2) {\n    errores.nombre = ['Escribe tu nombre (mínimo 2 letras).']\n  }\n  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(valores.correo)) {\n    errores.correo = ['Ese correo no parece válido.']\n  }\n  if (valores.telefono !== '' && !/^\\d{9}$/.test(valores.telefono)) {\n    errores.telefono = ['Son nueve cifras, sin espacios.']\n  }\n\n  const plazas = Number(valores.plazas)\n  if (Number.isNaN(plazas)) {\n    errores.plazas = ['Escribe cuántas plazas quieres.']\n  } else if (!Number.isInteger(plazas)) {\n    errores.plazas = ['Tiene que ser un número entero.']\n  } else if (plazas < 1) {\n    errores.plazas = ['Como mínimo, una plaza.']\n  } else if (plazas > 4) {\n    errores.plazas = ['Como máximo, cuatro plazas.']\n  }\n\n  if (!['iniciacion', 'torno', 'esmaltes'].includes(valores.curso)) {\n    errores.curso = ['Elige un curso.']\n  }\n  if (valores.acepto !== 'on') {\n    errores.acepto = ['Tienes que aceptar las normas del taller.']\n  }\n  return errores\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "inscripciones": [
      {
        "id": 1,
        "nombre": "Álvaro Peña",
        "correo": "alvaro@ejemplo.es",
        "curso": "torno"
      },
      {
        "id": 2,
        "nombre": "Rosa Gil",
        "correo": "rosa@ejemplo.es",
        "curso": "iniciacion"
      }
    ]
  },
  "red": {
    "latencia": 700,
    "desordenar": false
  }
}
```

Detalles de lo que acaba de pasar, por si se te escapa alguno:

- **El `aria-describedby` del campo solo existe cuando hay error**, igual que `aria-invalid`. En un campo correcto no hay nada que describir, y un `aria-describedby` que apunta a un `id` que no existe no sirve de nada.
- **El resumen no repite los mensajes**, solo cuenta. El foco lleva al primer campo con error y su mensaje se lee junto al campo; leer los cinco en el resumen *y* después cada uno sería ruido. Es una decisión de diseño: otros formularios ponen en el resumen enlaces a cada campo.
- **El error del servidor va a la misma región viva** que los de validación. Es un error que la persona tiene que saber ya, y por eso comparte el sitio.
- **El texto «Plaza reservada…» va a un `role="status"`**, la región amable (lección 37), porque es una confirmación, no una alarma.
- **No pongas `role="alert"` en cada mensaje de error.** Con cinco errores a la vez se anunciarían los cinco, uno encima de otro.

## Capa 3: Zod, las reglas como esquema

Mira `validar.jsx` de arriba: más de treinta líneas para seis campos, y cada regla nueva es un `if` más. Se parece demasiado a un formulario de verdad. [Zod](https://zod.dev/) cambia el enfoque: en lugar de *programar* las comprobaciones, **describes cómo es un dato válido** (un esquema) y Zod lo comprueba. Si hiciste el proyecto 54 del temario de TypeScript, ya lo conoces; aquí lo usamos solo para validar y sin tipos.

Zod es un paquete de npm (`npm install zod`) y la vista previa de la web no puede importar paquetes de npm, así que esta parte va en bloques de código, no en vivo. Para que no sean teoría, instalamos Zod 4.6.7 (la última versión en octubre de 2026) en una carpeta y ejecutamos con Node el esquema de El Torno con datos buenos y malos. Lo que ves como salida es **la salida real**.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { z } from 'zod'\n\nexport const Inscripcion = z.object({\n  nombre: z.string().trim().min(2, 'Escribe tu nombre (mínimo 2 letras).'),\n  correo: z.email('Ese correo no parece válido.'),\n  telefono: z.union([\n    z.literal(''),\n    z.string().regex(/^\\d{9}$/, 'Son nueve cifras, sin espacios.'),\n  ]),\n  plazas: z.coerce\n    .number({ error: 'Escribe cuántas plazas quieres.' })\n    .int('Tiene que ser un número entero.')\n    .min(1, 'Como mínimo, una plaza.')\n    .max(4, 'Como máximo, cuatro plazas.'),\n  curso: z.enum(['iniciacion', 'torno', 'esmaltes'], 'Elige un curso.'),\n  acepto: z.literal('on', 'Tienes que aceptar las normas del taller.'),\n})",
  "anotaciones": [
    {
      "fragmento": "z.string().trim().min(2, 'Escribe tu nombre (mínimo 2 letras).')",
      "nota": "Un texto, sin espacios sobrantes (trim lo recorta y el dato validado ya sale recortado), de al menos 2 caracteres. El segundo argumento de cada regla es el mensaje que verá la persona."
    },
    {
      "fragmento": "z.email('Ese correo no parece válido.')",
      "nota": "En Zod 4 los formatos son funciones de z. La forma antigua, z.string().email(), sigue funcionando pero está marcada como obsoleta en la documentación."
    },
    {
      "fragmento": "z.literal('')",
      "nota": "Un teléfono opcional: o la cadena vacía, o nueve cifras. El navegador manda el campo vacío como cadena vacía, no como undefined."
    },
    {
      "fragmento": "z.coerce",
      "nota": "Un FormData trae solo texto. coerce convierte el valor con Number(valor) antes de comprobarlo; así plazas llega como número ya validado. Ojo: Number(\"\") es 0."
    },
    {
      "fragmento": "{ error: 'Escribe cuántas plazas quieres.' }",
      "nota": "El mensaje para cuando no hay número válido (por ejemplo, NaN). Sin esto, el mensaje por defecto de Zod saldría en inglés."
    },
    {
      "fragmento": "z.enum(['iniciacion', 'torno', 'esmaltes'], 'Elige un curso.')",
      "nota": "Solo vale uno de estos valores. Con el desplegable en su opción vacía, el valor es \"\" y no está en la lista: error."
    },
    {
      "fragmento": "z.literal('on', 'Tienes que aceptar las normas del taller.')",
      "nota": "Una casilla marcada llega como \"on\", y una desmarcada no llega (lección 57). Exigir el literal \"on\" cubre las dos cosas con un solo mensaje."
    }
  ]
}
```

Ahora, uso y salida. `safeParse` **no lanza**: devuelve un objeto con `success` y, según el caso, `data` o `error`. Es lo que necesita una acción, que devuelve los errores como estado. (`parse` sí lanza una `ZodError`, y ya sabes dónde acaba un error lanzado desde una acción: en el error boundary, cancelando la cola de la lección 58.)

```jsx
const buenos = {
  nombre: '  Marta Ibáñez ', correo: 'marta@ejemplo.es', telefono: '',
  plazas: '2', curso: 'torno', acepto: 'on',
}
const malos = { nombre: ' M ', correo: 'marta@', telefono: '12345', plazas: 'dos', curso: '' } // sin acepto

console.log(Inscripcion.safeParse(buenos))

const resultado = Inscripcion.safeParse(malos)
console.log(resultado.success)
console.log(z.flattenError(resultado.error))
console.log(resultado.error.issues[1])
console.log(Inscripcion.safeParse({ ...buenos, plazas: '' }).error.issues[0].message)
```

Con datos buenos, Zod devuelve `success: true` y **el dato limpio**: el nombre recortado, `plazas` ya como número.

```text
{
  success: true,
  data: {
    nombre: 'Marta Ibáñez',
    correo: 'marta@ejemplo.es',
    telefono: '',
    plazas: 2,
    curso: 'torno',
    acepto: 'on'
  }
}
```

Con los malos, `success` es `false`, y `z.flattenError(error)` convierte la lista de problemas en lo que necesita un formulario, **`fieldErrors`: un objeto con un array de mensajes por campo**. Es exactamente el formato `{ campo: ['mensaje'] }` de nuestro `validar`:

```text
false
{
  formErrors: [],
  fieldErrors: {
    nombre: [ 'Escribe tu nombre (mínimo 2 letras).' ],
    correo: [ 'Ese correo no parece válido.' ],
    telefono: [ 'Son nueve cifras, sin espacios.' ],
    plazas: [ 'Escribe cuántas plazas quieres.' ],
    curso: [ 'Elige un curso.' ],
    acepto: [ 'Tienes que aceptar las normas del taller.' ]
  }
}
```

`formErrors` recoge los errores que no son de ningún campo (los de reglas que afectan al conjunto, con `.refine` sobre todo el objeto). Aquí está vacío. Si necesitas más detalle, `error.issues` es la lista cruda, con el `code`, el `path` y la regla que falló. Este es el segundo problema (el del correo):

```text
{
  origin: 'string',
  code: 'invalid_format',
  format: 'email',
  pattern: "/^(?:[A-Za-z0-9_'+\\-]+\\.)*[A-Za-z0-9_'+\\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$/",
  path: [ 'correo' ],
  message: 'Ese correo no parece válido.'
}
```

La documentación de Zod tiene otras dos formas de dar formato al error: `z.treeifyError()` para estructuras anidadas y `z.prettifyError()`, un texto legible para la consola. Los métodos antiguos `error.flatten()` y `error.format()` están obsoletos.

La última línea del script enseña algo que da guerra: con `plazas: ''`, Zod no dice «escribe un número»:

```text
Como mínimo, una plaza.
```

Porque `z.coerce.number()` hace `Number('')`, que es `0`, y 0 es un número perfectamente válido... que no llega al mínimo. Si quieres un mensaje distinto para el campo vacío, compruébalo antes (por ejemplo, un `z.string().min(1, '…')` delante, encadenado con `.pipe`).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const Plazas = z.coerce\n  .number()\n  .int()\n  .min(1, 'Como mínimo, una plaza.')\n  .max(4, 'Como máximo, cuatro plazas.')\n\n// El campo «Plazas» se envía vacío:\nPlazas.safeParse('')",
  "opciones": [
    "Un error de tipo: se esperaba un número y llegó un texto vacío",
    "Un error con el mensaje «Como mínimo, una plaza.»",
    "success: true, con data valiendo NaN",
    "Un error con el mensaje «Como máximo, cuatro plazas.»"
  ],
  "correcta": 1,
  "explicacion": "z.coerce.number() convierte con Number(valor), y Number(\"\") es 0, que es un número. Pasa la comprobación de tipo y se queda corto para min(1). Lo comprobamos con Zod 4.6.7. Solo un texto que no es un número (como \"dos\") da NaN y el error de tipo."
}
```

### Zod dentro de la acción

La acción ya no llama a `validar`: usa el esquema. El resto del formulario **no cambia ni una línea**, porque `fieldErrors` tiene el mismo formato que devolvía la función hecha a mano.

```jsx
import { z } from 'zod'
import { Inscripcion } from './esquema'

async function inscribir(estadoAnterior, formData) {
  const valores = Object.fromEntries(formData)
  const resultado = Inscripcion.safeParse(valores)

  if (!resultado.success) {
    return {
      valores, // lo escrito, tal cual, para devolverlo a los campos
      errores: z.flattenError(resultado.error).fieldErrors,
      aviso: null,
    }
  }

  // resultado.data: el dato limpio (nombre recortado, plazas como número)
  const respuesta = await fetch('/api/inscripciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resultado.data),
  })
  // ...igual que antes
}
```

Fíjate en una distinción: a los campos se les devuelve `valores` (lo que se escribió, crudo, con sus espacios), no `resultado.data` (que ya está limpio y con otros tipos). Lo que la persona escribió es lo que tiene que volver a ver.

Zod trae también traducciones de sus mensajes por defecto (`z.config(z.locales.es())`; los comprobamos, y existen), pero para un formulario conviene más escribir tú el mensaje en cada regla, como arriba: el de una traducción genérica («Demasiado pequeño: se esperaba que texto tuviera >=3 caracteres») no le dice nada a quien rellena la inscripción.

## El servidor también valida

Todo lo anterior ocurre en el navegador, que es territorio de quien lo usa: puede quitar el `noValidate`, saltarse React o escribir la petición a mano con `curl`. Las reglas del navegador y de la acción son **comodidad para la persona**, no protección para tu sistema. La protección vive en el servidor, que repite las comprobaciones y responde con un error cuando algo no cuadra (en el formulario de arriba, el `if (!respuesta.ok)`).

La ventaja de Zod aquí es grande: **el esquema es un archivo normal**, sin nada del navegador, así que el servidor puede importar el mismo `Inscripcion` y aplicar exactamente las mismas reglas. Cómo se escribe ese servidor con React (una *Server Function*, que valida con el mismo esquema y de la que se ocupa la lección 89) es otro tema. Lo que tienes que llevarte ahora es la regla: **valida en el cliente para ayudar y en el servidor para proteger.**

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con required y type=\"email\" los datos que llegan a la acción son válidos",
      "realidad": "Solo si nadie ha tocado el HTML. Con las herramientas de desarrollo, noValidate, form.submit() o una petición hecha a mano, llegan datos que el navegador habría rechazado. Y minLength ni siquiera se comprueba con valores puestos por un script."
    },
    {
      "mito": "Si valido en la acción de React, ya estoy validando en el servidor",
      "realidad": "Una función normal pasada a <form action> corre en el navegador. Solo una Server Function (lección 89) corre en el servidor. El mismo código de validación puede estar en los dos sitios, pero tiene que estar."
    },
    {
      "mito": "noValidate quita las validaciones del formulario",
      "realidad": "Apaga la validación interactiva (el bloqueo del envío y el globo). Los atributos y campo.validity siguen funcionando, y puedes consultarlos con checkValidity(). Lo que cambia es quién decide."
    },
    {
      "mito": "Zod hace el formulario más seguro",
      "realidad": "Zod comprueba lo que le pases donde lo ejecutes. Ejecutado solo en el navegador, protege lo mismo que un if: nada. Su valor es escribir las reglas una vez y poder usarlas en los dos lados."
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
      "titulo": "Solo el navegador",
      "texto": "Formularios de una o dos reglas obvias: un buscador que no admite vacío, una suscripción con un correo, un filtro. required y type bastan, y el globo del navegador es conocido por todos."
    },
    {
      "titulo": "Reglas en tu acción",
      "texto": "Cuando quieres mensajes propios, errores de varios campos a la vez, accesibilidad cuidada o reglas entre campos. Es el punto de partida de casi cualquier formulario de una aplicación: noValidate y errores como estado."
    },
    {
      "titulo": "Zod",
      "texto": "Cuando tienes más de tres o cuatro campos, reglas que se repiten en varios formularios o, sobre todo, cuando quieres las mismas reglas en el servidor. También cuando necesitas convertir tipos (texto a número) y quedarte con un dato limpio."
    },
    {
      "titulo": "Una librería de formularios",
      "texto": "Para formularios enormes, con campos que aparecen y desaparecen, validación mientras se escribe o listas de campos. La documentación de Zod mantiene una lista de integraciones (zod.dev/ecosystem). La base de esta lección sigue siendo la misma: reglas, errores por campo, conservar lo escrito."
    },
    {
      "titulo": "Siempre, en el servidor",
      "texto": "Cualquier dato que vaya a guardarse o a usarse para algo se vuelve a comprobar donde nadie pueda tocarlo."
    }
  ]
}
```

La lección 60 añade `useOptimistic` para mostrar el resultado antes de que llegue, y el proyecto 62 junta formularios, acciones y validación en una sola aplicación de comentarios.

## Errores típicos

**Fiarte solo del navegador.** El mito de arriba. Quita los atributos en las herramientas de desarrollo y compruébalo con tu propio formulario: tu acción recibe lo que sea.

**Dejar `required` sin `noValidate` y esperar tus mensajes.** El bloque «Un required que tapa tu mensaje». Elige una capa para cada regla: o el navegador, o la tuya. Si quieres tus mensajes, `noValidate` y la regla en la acción.

**Devolver los errores y olvidar los valores.** El formulario se vacía, como viste en la primera versión de la inscripción. La señal de que te falta: la acción devuelve `{ errores }` y no `{ valores, errores }`.

**Usar `value` en lugar de `defaultValue` para conservar lo escrito.** Con `value={valores.nombre}` y sin `onChange`, el campo queda bloqueado y React lo avisa (lección 22). Aquí los campos no se controlan: `defaultValue`.

**Un `<select>` sin `key`.** Es el que se pierde: los campos de texto conservan su valor y el desplegable vuelve a «Elige un curso». Ya lo viste en la pregunta.

**Convertir con `Number` sin pensar en el vacío.** `Number('')` es 0 y `Number('  ')` también. Tanto si lo haces a mano como con `z.coerce.number()`, comprueba el campo vacío antes.

**Esperar que una casilla desmarcada llegue como `false`.** No llega nada (lección 57). Una acción que hace `valores.acepto === false` nunca será verdad. Compara con `'on'`.

**Marcar el error solo con el color.** Un borde rojo sin texto no lo ve una persona daltónica ni lo oye un lector de pantalla. El mensaje con palabras es obligatorio; el rojo es un refuerzo.

**Lanzar un error de validación.** Con `parse` de Zod, `throw`, `throw new Error('correo inválido')`... el error sube al error boundary (lección 53), se lleva el formulario y, con `useActionState`, cancela los envíos en cola (lección 58). Un dato inválido no es una excepción: es un resultado. Usa `safeParse`.

## Ejercicios

### Ejercicio 1: las colonias de verano de Utebo

El Ayuntamiento de Utebo abre la inscripción de las colonias de verano. El formulario ya está maquetado y su `Campo` ya pone `aria-invalid` y `aria-describedby`, pero la acción no valida nada y no está conectada a los campos. Tienes que escribir `inscribir` y cablear los campos con el estado. Las reglas:

- Nombre: al menos 2 letras (sin contar espacios). Mensaje: «Escribe el nombre (mínimo 2 letras).»
- Edad: un número entero de 6 a 12. Mensaje: «La edad tiene que estar entre 6 y 12 años.»
- Correo: con una @ y un punto. Mensaje: «Escribe un correo con @, por ejemplo familia@ejemplo.es.»
- Turno: uno de los tres. Mensaje: «Elige un turno.»

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: inscripción a las colonias",
  "consigna": "Escribe inscribir y cablea los campos siguiendo los pasos 1 a 5 de App.jsx. Prueba con el formulario vacío, con solo un campo mal y con «Fallar la siguiente petición». Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState, useEffect, useRef } from 'react'\nimport Campo from './Campo'\nimport './estilos.css'\n\nconst TURNOS = [\n  { id: 'julio1', nombre: 'Julio, primera quincena' },\n  { id: 'julio2', nombre: 'Julio, segunda quincena' },\n  { id: 'agosto1', nombre: 'Agosto, primera quincena' },\n]\n\n// 1. Valida los cuatro campos con las reglas de la consigna. Si alguno falla,\n//    devuelve { valores, errores, aviso: null }, con errores como\n//    { campo: 'mensaje' } solo para los campos con problema.\n// 2. Si todo va bien, envía { nombre (sin espacios sobrantes), edad (como\n//    número), correo, turno } con POST a /api/inscripciones, en JSON, y\n//    devuelve { valores: {}, errores: {}, aviso: { tipo: 'ok',\n//    texto: 'Plaza reservada para Lucía.' } } con el nombre recortado.\n// 3. Si el servidor responde con error, devuelve los valores conservados y\n//    aviso: { tipo: 'error', texto: 'No se ha podido guardar la inscripción. Inténtalo otra vez.' }\nasync function inscribir(estadoAnterior, formData) {\n  return estadoAnterior\n}\n\nexport default function App() {\n  const [estado, accionInscribir, isPending] = useActionState(inscribir, {\n    valores: {},\n    errores: {},\n    aviso: null,\n  })\n  const { valores, errores, aviso } = estado\n  const formulario = useRef(null)\n\n  // Ya está hecho: tras cada envío, el foco va al primer campo no válido.\n  useEffect(() => {\n    formulario.current.querySelector('[aria-invalid=\"true\"]')?.focus()\n  }, [estado])\n\n  return (\n    <main>\n      <h1>Colonias de verano · Utebo</h1>\n      {/* 5. Aquí va el resumen: un div con role=\"alert\" que exista siempre.\n          Con errores de campo dice «Hay 4 campos por corregir.» (o «Hay 1\n          campo por corregir.»); con aviso de tipo error, enseña su texto. */}\n      <form ref={formulario} action={accionInscribir} noValidate>\n        {/* 4. A cada Campo: error={errores.campo}, y el valor que llegó como\n            valor inicial del control. Ojo con el desplegable. */}\n        <Campo etiqueta=\"Nombre del niño o la niña\">\n          {(propsCampo) => <input name=\"nombre\" {...propsCampo} />}\n        </Campo>\n        <Campo etiqueta=\"Edad\">\n          {(propsCampo) => <input name=\"edad\" type=\"number\" {...propsCampo} />}\n        </Campo>\n        <Campo etiqueta=\"Correo de contacto\">\n          {(propsCampo) => <input name=\"correo\" type=\"email\" {...propsCampo} />}\n        </Campo>\n        <Campo etiqueta=\"Turno\">\n          {(propsCampo) => (\n            <select name=\"turno\" defaultValue=\"\" {...propsCampo}>\n              <option value=\"\">Elige un turno</option>\n              {TURNOS.map((turno) => (\n                <option key={turno.id} value={turno.id}>\n                  {turno.nombre}\n                </option>\n              ))}\n            </select>\n          )}\n        </Campo>\n        <button disabled={isPending}>{isPending ? 'Reservando…' : 'Reservar plaza'}</button>\n      </form>\n      <p role=\"status\">{aviso?.tipo === 'ok' ? aviso.texto : ''}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Campo.jsx",
      "codigo": "import { useId } from 'react'\n\n// Ya está hecho: da a su control id, aria-invalid y aria-describedby.\nexport default function Campo({ etiqueta, error, children }) {\n  const id = useId()\n  const idError = `${id}-error`\n  const propsCampo = {\n    id,\n    'aria-invalid': error ? 'true' : undefined,\n    'aria-describedby': error ? idError : undefined,\n  }\n\n  return (\n    <div className=\"campo\">\n      <label htmlFor={id}>{etiqueta}</label>\n      {children(propsCampo)}\n      {error && (\n        <p id={idError} className=\"error\">\n          {error}\n        </p>\n      )}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "inscripciones": [
      {
        "id": 1,
        "nombre": "Álvaro",
        "edad": 8,
        "correo": "alvaro@ejemplo.es",
        "turno": "julio1"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al enviar el formulario vacío, el nombre muestra «Escribe el nombre (mínimo 2 letras).»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        }
      ],
      "espera": {
        "texto": "Escribe el nombre (mínimo 2 letras)."
      }
    },
    {
      "descripcion": "Al enviar el formulario vacío, la región de alerta dice «Hay 4 campos por corregir.»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Hay 4 campos por corregir."
      }
    },
    {
      "descripcion": "Con una sola cosa mal (la edad), el resumen dice «Hay 1 campo por corregir.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del niño o la niña",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Edad",
            "texto": "20"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo de contacto",
            "texto": "familia@ejemplo.es"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Turno",
            "opcion": "Agosto, primera quincena"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Hay 1 campo por corregir."
      }
    },
    {
      "descripcion": "Si hay errores, el nombre escrito se conserva",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del niño o la niña",
            "texto": "Lucía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        },
        {
          "pulsar": {
            "texto": "La edad tiene que estar entre 6 y 12 años."
          }
        }
      ],
      "espera": {
        "etiqueta": "Nombre del niño o la niña",
        "valor": "Lucía"
      }
    },
    {
      "descripcion": "Si hay errores, el turno elegido se conserva",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Turno",
            "opcion": "Agosto, primera quincena"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        },
        {
          "pulsar": {
            "texto": "La edad tiene que estar entre 6 y 12 años."
          }
        }
      ],
      "espera": {
        "etiqueta": "Turno",
        "valor": "agosto1"
      }
    },
    {
      "descripcion": "Con todo bien, sale «Plaza reservada para Lucía.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del niño o la niña",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Edad",
            "texto": "9"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo de contacto",
            "texto": "familia@ejemplo.es"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Turno",
            "opcion": "Agosto, primera quincena"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        }
      ],
      "espera": {
        "texto": "Plaza reservada para Lucía."
      }
    },
    {
      "descripcion": "Tras reservar, el formulario queda vacío",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del niño o la niña",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Edad",
            "texto": "9"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo de contacto",
            "texto": "familia@ejemplo.es"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Turno",
            "opcion": "Agosto, primera quincena"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        },
        {
          "pulsar": {
            "texto": "Plaza reservada para Lucía."
          }
        }
      ],
      "espera": {
        "etiqueta": "Nombre del niño o la niña",
        "valor": ""
      }
    },
    {
      "descripcion": "Si el servidor falla, el nombre se conserva y se avisa",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del niño o la niña",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Edad",
            "texto": "9"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo de contacto",
            "texto": "familia@ejemplo.es"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Turno",
            "opcion": "Agosto, primera quincena"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido guardar la inscripción. Inténtalo otra vez."
          }
        }
      ],
      "espera": {
        "etiqueta": "Nombre del niño o la niña",
        "valor": "Lucía"
      }
    }
  ]
}
```

### Ejercicio 2: el buzón del mercado

El Mercado de Abastos tiene un buzón de sugerencias en su web. Hoy acepta cualquier cosa: sin nombre, con un correo que no es un correo, con el puesto 999. Aquí **no hay JavaScript que escribir**: solo atributos de HTML, la capa 1. Añade las reglas a `App.jsx`:

- Nombre, correo y mensaje, obligatorios.
- El correo tiene que parecer un correo.
- El número de puesto es opcional, pero si se pone, entre 1 y 40.
- El código postal es opcional, pero si se pone, de 5 cifras.

Las comprobaciones de este ejercicio hacen algo curioso. No pueden leer el globo del navegador, que no está en la página, así que miden el efecto: envían un dato malo (el navegador debe bloquearlo), lo corrigen, vuelven a enviar y comprueban que el contador de sugerencias recibidas vale 1, no 2. Y no comprueban `minLength`: ya viste que no se aplica al teclear de las pruebas.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: las reglas del buzón",
  "consigna": "Añade en App.jsx los atributos de HTML que impidan enviar el formulario con datos malos: required, type, min, max y pattern. Sin JavaScript. Pruébalo a mano: el globo del navegador te dirá qué falla. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport './estilos.css'\n\nfunction enviar(recibidas, formData) {\n  return recibidas + 1\n}\n\nexport default function App() {\n  const [recibidas, accionEnviar] = useActionState(enviar, 0)\n\n  return (\n    <main>\n      <h1>Buzón de sugerencias · Mercado de Abastos</h1>\n      {/* Añade a los campos los atributos de validación de HTML. */}\n      <form action={accionEnviar}>\n        <div className=\"campo\">\n          <label htmlFor=\"nombre\">Nombre</label>\n          <input id=\"nombre\" name=\"nombre\" />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"correo\">Correo</label>\n          <input id=\"correo\" name=\"correo\" />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"puesto\">Número de puesto (opcional)</label>\n          <input id=\"puesto\" name=\"puesto\" />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"cp\">Código postal (opcional)</label>\n          <input id=\"cp\" name=\"cp\" />\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"mensaje\">Mensaje</label>\n          <textarea id=\"mensaje\" name=\"mensaje\" rows={3} />\n        </div>\n        <button>Enviar sugerencia</button>\n      </form>\n      <p>Sugerencias recibidas: {recibidas}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.35rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0.9rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.campo.en-linea {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n}\n\n.campo.en-linea .error {\n  flex-basis: 100%;\n}\n\nlabel {\n  font-weight: 600;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput:not([type='checkbox']),\nselect,\ntextarea {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n}\n\n[aria-invalid='true'] {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.error {\n  margin: 0;\n  font-size: 0.9rem;\n  color: #991b1b;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.45rem 0.9rem;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: wait;\n}\n\n.resumen {\n  min-height: 1.4em;\n  margin-bottom: 0.5rem;\n  font-weight: 600;\n  color: #991b1b;\n}\n\n.resumen p {\n  margin: 0;\n}\n\n[role='status'] {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #166534;\n}\n\n.oido {\n  padding: 0.4rem 0.6rem;\n  border-left: 4px solid #fdba74;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Con todos los datos bien, la sugerencia se envía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Marta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Más sitio para las bicis"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        }
      ],
      "espera": {
        "texto": "Sugerencias recibidas: 1"
      }
    },
    {
      "descripcion": "Sin nombre, el navegador bloquea el envío; con el nombre, se envía una vez",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Más sitio para las bicis"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        },
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        }
      ],
      "espera": {
        "texto": "Sugerencias recibidas: 1"
      }
    },
    {
      "descripcion": "Un correo sin @ se bloquea; corregido, se envía una vez",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Marta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Más sitio para las bicis"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        }
      ],
      "espera": {
        "texto": "Sugerencias recibidas: 1"
      }
    },
    {
      "descripcion": "El puesto 99 se bloquea (máximo 40); con el puesto 12, se envía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Marta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Más sitio para las bicis"
          }
        },
        {
          "escribir": {
            "etiqueta": "Número de puesto (opcional)",
            "texto": "99"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        },
        {
          "escribir": {
            "etiqueta": "Número de puesto (opcional)",
            "texto": "12"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        }
      ],
      "espera": {
        "texto": "Sugerencias recibidas: 1"
      }
    },
    {
      "descripcion": "Un código postal de 3 cifras se bloquea; con 5 cifras, se envía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Marta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Más sitio para las bicis"
          }
        },
        {
          "escribir": {
            "etiqueta": "Código postal (opcional)",
            "texto": "123"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        },
        {
          "escribir": {
            "etiqueta": "Código postal (opcional)",
            "texto": "46001"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        }
      ],
      "espera": {
        "texto": "Sugerencias recibidas: 1"
      }
    },
    {
      "descripcion": "Sin mensaje, el envío se bloquea; con mensaje, se envía una vez",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Marta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Más sitio para las bicis"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar sugerencia"
          }
        },
        {
          "teclear": "aaa"
        }
      ],
      "espera": {
        "texto": "Sugerencias recibidas: 1"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el buzón del mercado, añade un botón «Guardar borrador» con `formNoValidate` y su propia acción (`formAction`, lección 57). Comprueba que se puede guardar un borrador con el correo vacío.
2. Pásale al buzón `noValidate` y escribe una función `validar` que devuelva los mismos errores que los atributos, pero como mensajes tuyos junto a cada campo. ¿Cuántas líneas más son?
3. En las colonias de Utebo, añade una regla entre campos: el turno «Agosto, primera quincena» solo admite niños de 8 años o más. ¿Con qué atributos de HTML lo harías? (Pista: con ninguno.)
4. En un proyecto de Vite, instala Zod (`npm install zod`) y sustituye la validación del Ejercicio 1 por un esquema con `safeParse` y `z.flattenError`. Comprueba que el formulario no tiene que cambiar.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Constraint validation (MDN)",
      "descripcion": "La guía completa de los atributos de validación, la API de validez (validity, setCustomValidity, checkValidity) y el aviso sobre validar también en el servidor.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation",
      "etiqueta": "MDN"
    },
    {
      "titulo": "useActionState",
      "descripcion": "La referencia del hook que devuelve el estado de la acción, con un ejemplo de errores devueltos como estado.",
      "url": "https://react.dev/reference/react/useActionState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Zod: uso básico",
      "descripcion": "Definir esquemas, safeParse y la forma de manejar los errores.",
      "url": "https://zod.dev/basics",
      "etiqueta": "Zod"
    },
    {
      "titulo": "Zod: dar formato a los errores",
      "descripcion": "flattenError, treeifyError y prettifyError, con la salida de cada uno.",
      "url": "https://zod.dev/error-formatting",
      "etiqueta": "Zod"
    },
    {
      "titulo": ":user-invalid (MDN)",
      "descripcion": "El selector que espera a que la persona haya interactuado para marcar un campo como no válido, y su compatibilidad.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:user-invalid",
      "etiqueta": "MDN"
    },
    {
      "titulo": "aria-invalid (MDN)",
      "descripcion": "Qué comunica este atributo a las tecnologías de asistencia y cuándo usarlo.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid",
      "etiqueta": "MDN"
    }
  ]
}
```
