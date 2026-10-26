# Formularios grandes con React Hook Form (y cuándo te basta una Action)

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `formularios-grandes-con-react-hook-form-y-cuando-te-basta-una-action` (autogenerado del título)
- **Orden:** 805
- **Fuentes:** [React Hook Form: Get Started](https://react-hook-form.com/get-started) + [useForm](https://react-hook-form.com/docs/useform) + [Controller](https://react-hook-form.com/docs/usecontroller/controller) + [useFieldArray](https://react-hook-form.com/docs/usefieldarray) + [useWatch](https://react-hook-form.com/docs/usewatch) + [@hookform/resolvers](https://github.com/react-hook-form/resolvers) — ver `contenido/react/TEMARIO.md` #100

---

## Qué es y para qué sirve

El Cáterin El Mantel, de Huesca, sirve bodas, comuniones y comidas de empresa. Su formulario de presupuesto empezó con cuatro campos y hoy tiene veinte: datos de contacto, fecha, invitados, tipo de evento, montaje con camareros, alergias... y un menú con tantas líneas como platos quiera el cliente, cada una con sus raciones, y un total que se recalcula mientras escribe.

Con el módulo 8 ya sabes enviar un formulario así: `<form action>` (lección 57), `useActionState` para el resultado y los errores (58), `useFormStatus` para el botón (59) y Zod para las reglas (61). Ese camino es bueno, pero hay cosas que no trae hechas:

- **Validar mientras se escribe** o al salir de un campo: la acción solo se ejecuta al enviar.
- **Saber qué ha cambiado**, para activar «Guardar» o avisar antes de salir de la página.
- **Listas de campos** que crecen y menguan sin que cada fila pierda su identidad.
- **Leer un campo para calcular otro**, como el total, sin volver a renderizar el formulario entero.
- **Conservar lo escrito cuando algo falla**: en la lección 61 lo conseguiste devolviendo los valores y poniéndolos en `defaultValue`, con una `key` para el desplegable.

Todo eso se puede escribir a mano, con un estado por campo (lección 22) y mucha paciencia. Con veinte campos, el código de los errores, los cambios y los campos visitados acaba siendo más largo que el propio formulario. **React Hook Form** lo trae resuelto. Es la librería de formularios más usada en React (unos 34 millones de descargas semanales en npm en la semana del 16 al 22 de octubre de 2026) y la que usa esta web (lección 86).

> **React Hook Form no controla los campos: el valor vive en el DOM y la librería lo lee a través de la `ref` cuando lo necesita. Por eso escribir no vuelve a renderizar el formulario, y solo se renderiza el componente que lee algo que ha cambiado.**

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Qué se ha comprobado y cómo",
  "contenido": "Los bloques de esta web solo cargan React, así que no pueden importar react-hook-form ni zod. Lo que cabe en la vista previa, la idea de fondo con React puro, se ejecuta aquí. El código de la librería se ejecutó fuera, en una carpeta de pruebas con React 19.3.1, react-hook-form 7.91.0 (publicada el 23 de octubre de 2026), @hookform/resolvers 6.0.0 (19 de octubre), Zod 4.6.7, @tanstack/react-query 5.105.0 y radix-ui 1.8.1, con jsdom y Testing Library, sin StrictMode. Las salidas son reales. Para contar los renders, cada componente llevaba una línea de medida que no aparece en el código."
}
```

## Lo que cuesta un formulario controlado grande

En la lección 22 controlaste cada campo con `value` y `onChange`: el estado manda. Cada tecla llama a un `set`, y el componente dueño de ese estado se vuelve a renderizar con todos sus hijos. En un formulario, el dueño suele ser el formulario entero.

Aquí tienes los mismos seis campos escritos de dos maneras. Mira el árbol de renders mientras escribes.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Seis campos, controlados y sin controlar",
  "consigna": "Escribe una letra en «Nombre de contacto» de la columna Controlado y mira el árbol: se renderizan Controlado y sus seis campos. Escribe en la otra columna: el árbol no se mueve. Pulsa «Ver los datos» y mira la consola: lo escrito estaba ahí.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst CAMPOS = [\n  ['nombre', 'Nombre de contacto'],\n  ['correo', 'Correo'],\n  ['telefono', 'Teléfono'],\n  ['fecha', 'Fecha del evento'],\n  ['invitados', 'Invitados'],\n  ['alergias', 'Alergias'],\n]\n\nfunction CampoControlado({ etiqueta, valor, onCambiar }) {\n  return (\n    <label>\n      {etiqueta}\n      <input value={valor} onChange={(e) => onCambiar(e.target.value)} />\n    </label>\n  )\n}\n\nfunction Controlado() {\n  const [valores, setValores] = useState(\n    () => Object.fromEntries(CAMPOS.map(([nombre]) => [nombre, ''])),\n  )\n\n  return (\n    <form onSubmit={(e) => e.preventDefault()}>\n      <h2>Controlado</h2>\n      {CAMPOS.map(([nombre, etiqueta]) => (\n        <CampoControlado\n          key={nombre}\n          etiqueta={etiqueta}\n          valor={valores[nombre]}\n          onCambiar={(valor) => setValores({ ...valores, [nombre]: valor })}\n        />\n      ))}\n    </form>\n  )\n}\n\nfunction CampoLibre({ nombre, etiqueta }) {\n  return (\n    <label>\n      {etiqueta}\n      <input name={nombre} />\n    </label>\n  )\n}\n\nfunction NoControlado() {\n  function manejarEnvio(e) {\n    e.preventDefault()\n    console.log(Object.fromEntries(new FormData(e.currentTarget)))\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <h2>No controlado</h2>\n      {CAMPOS.map(([nombre, etiqueta]) => (\n        <CampoLibre key={nombre} nombre={nombre} etiqueta={etiqueta} />\n      ))}\n      <button>Ver los datos</button>\n    </form>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cáterin El Mantel: pide presupuesto</h1>\n      <div className=\"columnas\">\n        <Controlado />\n        <NoControlado />\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n  font: inherit;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.4rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.85rem;\n}\n\n.estado {\n  margin: 0.2rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarArbol": true
}
```

En la columna «Controlado», cada tecla renderiza los seis campos, también los que no has tocado. El árbol da el motivo: «cambió la prop «onCambiar» (función nueva)». Podrías evitar esos renders con `memo` y `useCallback` (lección 67) o con el compilador (68), pero el formulario seguiría renderizándose entero en cada tecla.

¿Importa? Con seis campos, no. La lección 66 lo resumía así: lo caro, multiplicado por lo frecuente. Con sesenta campos, validación en cada uno y algún componente caro dentro (un calendario, una tabla de raciones), cada tecla paga todo eso.

**Un campo no controlado no avisa a React de nada**: el navegador guarda lo que escribes y tú lo lees cuando hace falta, al enviar (lección 57). Esa es la mitad de la idea de React Hook Form. La otra mitad es no renunciar a nada de lo que necesita un formulario: validar, enseñar errores, mover el foco, saber qué ha cambiado.

## La idea de React Hook Form, escrita a mano

La librería gira alrededor de una función, `register('nombre')`, que devuelve las props que hay que poner en el campo: `name`, `onChange`, `onBlur` y `ref`. Con la `ref` tiene el elemento del DOM, y con él puede leer su valor, llevarle el foco o vaciarlo.

En `miniFormulario.jsx` hay unas cincuenta líneas que hacen lo mismo con lo que ya conoces: un `Map` de campos guardado en una ref (lección 33), un estado para los errores y una función que valida al enviar. Abre el archivo y lee los comentarios antes de probarlo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un register hecho a mano",
  "consigna": "Escribe en los campos: el árbol no se mueve. Pulsa «Pedir presupuesto» con el correo a medias: un commit, los errores y el foco en el primer campo con problema. Después corrige el correo letra a letra: solo hay un commit, cuando desaparece el error.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { useMiniFormulario } from './miniFormulario'\nimport './estilos.css'\n\nfunction validar(valores) {\n  const errores = {}\n  if (valores.nombre.trim().length < 2) errores.nombre = 'Escribe tu nombre (mínimo 2 letras).'\n  if (!/^\\S+@\\S+\\.\\S+$/.test(valores.correo)) errores.correo = 'Ese correo no parece válido.'\n  if (!(Number(valores.invitados) >= 10)) errores.invitados = 'Servimos eventos de 10 invitados en adelante.'\n  return errores\n}\n\nfunction Campo({ etiqueta, error, ...props }) {\n  return (\n    <label>\n      {etiqueta}\n      <input aria-invalid={error ? true : undefined} {...props} />\n      {error && <span className=\"error\">{error}</span>}\n    </label>\n  )\n}\n\nexport default function PedirPresupuesto() {\n  const [solicitud, setSolicitud] = useState(null)\n  const { registrar, alEnviar, errores } = useMiniFormulario({\n    valoresIniciales: { nombre: '', correo: '', invitados: '50' },\n    validar,\n  })\n\n  return (\n    <main>\n      <h1>Cáterin El Mantel: pide presupuesto</h1>\n      <form onSubmit={alEnviar(setSolicitud)} noValidate>\n        <Campo etiqueta=\"Nombre de contacto\" error={errores.nombre} {...registrar('nombre')} />\n        <Campo etiqueta=\"Correo\" type=\"email\" error={errores.correo} {...registrar('correo')} />\n        <Campo etiqueta=\"Invitados\" type=\"number\" error={errores.invitados} {...registrar('invitados')} />\n        <button>Pedir presupuesto</button>\n      </form>\n      {solicitud && (\n        <p role=\"status\">\n          Recibido: {solicitud.nombre}, {solicitud.invitados} invitados.\n        </p>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "miniFormulario.jsx",
      "codigo": "// Lo mínimo que hace React Hook Form, escrito a mano para entender la idea.\n// La librería de verdad hace mucho más: listas de campos, componentes\n// controlados, validar al salir de un campo, saber qué ha cambiado...\nimport { useRef, useState } from 'react'\n\nexport function useMiniFormulario({ valoresIniciales, validar }) {\n  const campos = useRef(new Map()) // nombre -> el <input> del DOM\n  const [errores, setErrores] = useState({})\n  const [enviado, setEnviado] = useState(false)\n\n  function leerValores() {\n    const valores = {}\n    for (const [nombre, campo] of campos.current) valores[nombre] = campo.value\n    return valores\n  }\n\n  function registrar(nombre) {\n    return {\n      name: nombre,\n      defaultValue: valoresIniciales[nombre],\n      ref: (campo) => {\n        campos.current.set(nombre, campo)\n        return () => campos.current.delete(nombre)\n      },\n      onChange: () => {\n        // Antes del primer envío, escribir no toca el estado: cero renders.\n        if (!enviado) return\n        // Después se revalida el campo, pero solo hay render si su error cambia.\n        const mensaje = validar(leerValores())[nombre]\n        if (mensaje !== errores[nombre]) setErrores({ ...errores, [nombre]: mensaje })\n      },\n    }\n  }\n\n  function alEnviar(enviar) {\n    return (evento) => {\n      evento.preventDefault()\n      const valores = leerValores()\n      const nuevos = validar(valores)\n      setErrores(nuevos)\n      setEnviado(true)\n      const primero = Object.keys(nuevos)[0]\n      if (primero) campos.current.get(primero).focus()\n      else enviar(valores)\n    }\n  }\n\n  return { registrar, alEnviar, errores }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n  font: inherit;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.4rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.85rem;\n}\n\n.estado {\n  margin: 0.2rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "miniFormulario.jsx",
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Tres detalles de ese código, porque son los de la librería:

- **La `ref` es una función con limpieza** (lección 34). Cuando el campo se monta, entra en el `Map`; cuando se desmonta, sale. Así el formulario sabe en todo momento qué campos existen.
- **`Campo` reparte `{...props}` en su `<input>`, `ref` incluida.** En React 19, `ref` es una prop más (lección 34). Un componente propio que se quede la `ref` sin pasarla deja el campo fuera del formulario, sin ningún aviso: lo verás en «Errores típicos».
- **Antes del primer envío, escribir no hace nada; después, se revalida el campo, y solo hay render si cambia su error.** Es lo que hace React Hook Form por defecto: valida al enviar (`mode: 'onSubmit'`) y, desde el primer envío, revalida con cada cambio (`reValidateMode: 'onChange'`).

Lo que no tiene: listas de campos, componentes controlados, saber qué ha cambiado, campos visitados. Eso es la librería. Se instala con su paquete de *resolvers* (los adaptadores para Zod y compañía) y Zod:

```bash
npm install react-hook-form @hookform/resolvers zod
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Si npm responde con ERESOLVE",
  "contenido": "El 26 de octubre de 2026, @hookform/resolvers 6.0.0 no se instala con el npm de Node 22 (10.9) ni con el de Node 24 (11.19): npm se para con «ERESOLVE unable to resolve dependency tree» por un choque entre dos dependencias opcionales suyas (effect 3 y effect 4). Desde npm 11.20, el de Node 26, se instala bien, y el arreglo ya está aceptado en su repositorio, pendiente de publicar. Mientras tanto: npm install react-hook-form @hookform/resolvers@5.9.2 zod@4. Sin ese @4, npm eligió Zod 3.25.76. Con la 5.9.2, las pruebas de Zod de esta lección dieron lo mismo."
}
```

## `useForm`, `register` y `handleSubmit`

Esta es la primera parte del formulario del cáterin con la librería de verdad: contacto, invitados y la casilla de las condiciones.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useForm } from 'react-hook-form'\n\nexport default function PedirPresupuesto() {\n  const {\n    register,\n    handleSubmit,\n    formState: { errors },\n  } = useForm({\n    defaultValues: { nombre: '', correo: '', invitados: 50, acepto: false },\n  })\n\n  function enviar(datos) {\n    console.log(datos)\n  }\n\n  return (\n    <form onSubmit={handleSubmit(enviar)} noValidate>\n      <label>\n        Nombre de contacto\n        <input {...register('nombre', { required: 'Escribe tu nombre.' })} />\n      </label>\n      {errors.nombre && <p>{errors.nombre.message}</p>}\n\n      <label>\n        Correo\n        <input type=\"email\" {...register('correo', { required: 'Escribe un correo.' })} />\n      </label>\n      {errors.correo && <p>{errors.correo.message}</p>}\n\n      <label>\n        Invitados\n        <input type=\"number\" {...register('invitados', { valueAsNumber: true })} />\n      </label>\n\n      <label>\n        <input type=\"checkbox\" {...register('acepto')} />\n        Acepto las condiciones\n      </label>\n\n      <button>Pedir presupuesto</button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "defaultValues: { nombre: '', correo: '', invitados: 50, acepto: false },",
      "nota": "Los valores iniciales de todos los campos, en un solo sitio. Su documentación pide darlos siempre: con ellos la librería sabe si algo ha cambiado y a qué volver al reiniciar. Nunca undefined."
    },
    {
      "fragmento": "{...register('nombre', { required: 'Escribe tu nombre.' })}",
      "nota": "register devuelve cuatro props, name, onChange, onBlur y ref (comprobado), y se reparten en el input. El segundo argumento son reglas con su mensaje: required, min, max, minLength, maxLength, pattern y validate."
    },
    {
      "fragmento": "register('invitados', { valueAsNumber: true })",
      "nota": "Un input de tipo number da texto, como viste en la lección 57. valueAsNumber lo convierte antes de guardarlo: llega 120, no \"120\". Un campo vacío da NaN."
    },
    {
      "fragmento": "{...register('acepto')}",
      "nota": "Una casilla registrada da true o false. No es el \"on\" del FormData de la lección 57, y eso importa cuando reutilices los esquemas de Zod."
    },
    {
      "fragmento": "<form onSubmit={handleSubmit(enviar)} noValidate>",
      "nota": "handleSubmit(enviar) devuelve un manejador de submit: frena la recarga, valida y solo llama a enviar si todo está bien, con los valores ya como objeto. noValidate apaga los globos del navegador, como en la lección 61."
    },
    {
      "fragmento": "{errors.nombre && <p>{errors.nombre.message}</p>}",
      "nota": "Los errores van por campo en formState.errors, cada uno con message y type. La accesibilidad (aria-invalid, aria-describedby) sigue siendo cosa tuya, como en la lección 61."
    }
  ]
}
```

Se montó, se escribió el nombre, se envió con el correo vacío, se escribió el correo, se cambiaron los invitados a 120, se marcó la casilla y se volvió a enviar:

```text
montaje: PedirPresupuesto=2
escribo «Lucía Garcés» (12 teclas): ningún render
envío con el correo vacío: PedirPresupuesto=1 · en pantalla: Escribe un correo. · foco en: Correo
escribo el correo (16 teclas): PedirPresupuesto=1 · en pantalla: ningún error
enviar recibe {"nombre":"Lucía Garcés","correo":"lucia@ejemplo.es","invitados":120,"acepto":true}
```

Línea a línea:

- **Doce teclas, ningún render.** Es lo que viste en el bloque hecho a mano.
- **Dos renders al montar.** El segundo lo provoca la propia librería, que se suscribe en un efecto de layout y marca el formulario como listo (`isReady`). Se ve en su código.
- **El envío fallido: un render, el mensaje y el foco en el primer campo con error.** En la lección 61 movías el foco con un efecto; aquí viene hecho (`shouldFocusError`, activado por defecto).
- **Dieciséis teclas en el correo, un solo render**: el del primer cambio, que revalida el campo y quita el error.
- **Los datos**: `invitados` llega como número y `acepto` como booleano.

## `formState`: errores, envío, cambios y campos visitados

`formState` trae el estado del formulario entero: `errors`, `isSubmitting`, `isDirty`, `touchedFields` y unos cuantos más. Si cualquier cambio en cualquiera de ellos renderizase el formulario, perderías lo ganado. Por eso **`formState` es un `Proxy`**, un objeto de JavaScript que se entera de qué propiedades lees: la librería anota las que lees durante el render y solo te vuelve a renderizar cuando cambia una de esas. Lo dice su documentación, y se ve al medir.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useForm } from 'react-hook-form'\n\nexport default function DatosEvento() {\n  const {\n    register,\n    handleSubmit,\n    formState: { errors, isSubmitting, isDirty, touchedFields },\n  } = useForm({\n    defaultValues: { nombre: '', correo: '', fecha: '' },\n  })\n\n  async function enviar(datos) {\n    await new Promise((resolver) => setTimeout(resolver, 300)) // el servidor tarda\n    console.log(datos)\n  }\n\n  return (\n    <form onSubmit={handleSubmit(enviar)} noValidate>\n      <label>\n        Nombre de contacto\n        <input {...register('nombre', { required: 'Escribe tu nombre.' })} />\n      </label>\n      {errors.nombre && <p role=\"alert\">{errors.nombre.message}</p>}\n\n      <label>\n        Correo\n        <input type=\"email\" {...register('correo')} />\n      </label>\n      {touchedFields.correo && <p>Has pasado por el correo.</p>}\n\n      <label>\n        Fecha del evento\n        <input type=\"date\" {...register('fecha')} />\n      </label>\n\n      <p role=\"status\">{isDirty ? 'Hay cambios sin enviar' : 'Sin cambios'}</p>\n      <button disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : 'Pedir presupuesto'}</button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "formState: { errors, isSubmitting, isDirty, touchedFields },",
      "nota": "Se desestructura en el render, y leerlo es lo que te suscribe: este componente se renderizará cuando cambie alguna de estas cuatro cosas, y no con las demás."
    },
    {
      "fragmento": "await new Promise((resolver) => setTimeout(resolver, 300)) // el servidor tarda",
      "nota": "enviar es async. isSubmitting se queda en true hasta que la promesa de enviar termina. Si lanzas algo sin esperarlo (sin await ni return), vuelve a false enseguida."
    },
    {
      "fragmento": "{touchedFields.correo && <p>Has pasado por el correo.</p>}",
      "nota": "Un campo queda tocado cuando entras y sales de él. Sirve, por ejemplo, para no enseñar errores de campos que la persona aún no ha visitado."
    },
    {
      "fragmento": "{isDirty ? 'Hay cambios sin enviar' : 'Sin cambios'}",
      "nota": "isDirty compara los valores actuales con defaultValues. Si dejas un campo como estaba, vuelve a false."
    },
    {
      "fragmento": "<button disabled={isSubmitting}>",
      "nota": "Mientras se envía, el botón se desactiva sin un useState propio, como con isPending en la lección 58."
    }
  ]
}
```

Se escribió y se borró «Ana», se pasó por los campos y se envió:

```text
montaje: DatosEvento=2 · «Sin cambios» «Pedir presupuesto»
escribo «Ana»: DatosEvento=1 · «Hay cambios sin enviar» «Pedir presupuesto»
lo borro: DatosEvento=1 · «Sin cambios» «Pedir presupuesto»
paso a Correo: DatosEvento=1 · «Sin cambios» «Pedir presupuesto»
paso a Fecha: DatosEvento=1 · «Has pasado por el correo.» «Sin cambios» «Pedir presupuesto»
vuelvo a Nombre y escribo «Ana Lasierra»: DatosEvento=2 · «Has pasado por el correo.» «Hay cambios sin enviar» «Pedir presupuesto»
el envío: DatosEvento=3
   0 ms  PULSO «Pedir presupuesto»
  13 ms  PANTALLA «Has pasado por el correo.» «Hay cambios sin enviar» «Enviando…» (desactivado)
 311 ms  enviar recibe {"nombre":"Ana Lasierra","correo":"","fecha":""}
 470 ms  PANTALLA «Has pasado por el correo.» «Hay cambios sin enviar» «Pedir presupuesto»
```

- **«Ana»: un render**, el de la primera letra, cuando `isDirty` pasa a `true`. Las otras dos letras no cambian nada que se lea.
- **Al borrarlo, otro**: `isDirty` vuelve a `false`, porque los valores coinciden de nuevo con los iniciales.
- **Al pasar a Correo, un render** sin que cambie ningún texto: «Nombre de contacto» queda tocado, y `touchedFields` es una de las cosas que lee el componente. Al pasar a Fecha, otro, y ya sale «Has pasado por el correo.».
- **El envío: tres renders**, con el botón desactivado y «Enviando…» mientras `enviar` espera.
- **Y después del envío, todo sigue igual**: «Hay cambios sin enviar» y los campos llenos. Con `<form action>`, React vaciaba los campos al terminar la acción (lección 57). React Hook Form no vacía nada por su cuenta: lo haces tú con `reset()`, y lo verás al enviar con `useMutation`.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "errors",
      "texto": "Los errores por campo, con message y type. Para las listas, anidados: errors.lineas[1].plato. Los que no son de ningún campo, en errors.root."
    },
    {
      "titulo": "isSubmitting e isSubmitSuccessful",
      "texto": "El primero está a true mientras dura la promesa de tu función de envío. El segundo dice si el último envío terminó sin errores."
    },
    {
      "titulo": "isDirty y dirtyFields",
      "texto": "Si algo es distinto de defaultValues, y qué campos lo son. Sin defaultValues completos, no son fiables."
    },
    {
      "titulo": "touchedFields",
      "texto": "Los campos por los que la persona ha pasado (entrar y salir). La base del modo onTouched."
    },
    {
      "titulo": "isValid",
      "texto": "Si el formulario entero es válido. Ojo: leerlo hace que la librería valide al montar y en cada cambio, sea cual sea el modo. Úsalo solo si lo necesitas."
    }
  ]
}
```

## Validar con Zod: `zodResolver`

En la lección 61 validaste dentro de la acción con `safeParse` y `z.flattenError`. Con React Hook Form, el esquema se le da al formulario a través de un *resolver*, un adaptador: `zodResolver(esquema)`, del paquete `@hookform/resolvers`. El resolver pasa los valores por el esquema y convierte cada problema en un error del campo que toca, en `errors`.

El esquema del cáterin tiene la forma de los de la lección 61, con tres cambios que salen de una diferencia: **los valores ya no vienen de un `FormData`**.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { z } from 'zod'\n\nexport const PLATOS = ['croquetas', 'migas', 'ternasco', 'melocoton']\n\nexport const Presupuesto = z.object({\n  nombre: z.string().trim().min(2, 'Escribe tu nombre (mínimo 2 letras).'),\n  correo: z.email('Ese correo no parece válido.'),\n  telefono: z.union([\n    z.literal(''),\n    z.string().regex(/^\\d{9}$/, 'Son nueve cifras, sin espacios.'),\n  ]),\n  invitados: z\n    .number({ error: 'Escribe cuántos invitados esperáis.' })\n    .int('Tiene que ser un número entero.')\n    .min(10, 'Servimos eventos de 10 invitados en adelante.'),\n  tipo: z.enum(['boda', 'comunion', 'empresa'], 'Elige el tipo de evento.'),\n  lineas: z\n    .array(\n      z.object({\n        plato: z.enum(PLATOS, 'Elige un plato.'),\n        raciones: z.number({ error: 'Escribe las raciones.' }).int().min(1, 'Al menos una ración.'),\n      }),\n    )\n    .min(1, 'Añade al menos un plato.'),\n  acepto: z.literal(true, 'Tienes que aceptar las condiciones.'),\n})",
  "anotaciones": [
    {
      "fragmento": "nombre: z.string().trim().min(2, 'Escribe tu nombre (mínimo 2 letras).'),",
      "nota": "Igual que en la lección 61: el texto se recorta y el mensaje va en la regla."
    },
    {
      "fragmento": ".number({ error: 'Escribe cuántos invitados esperáis.' })",
      "nota": "Cambio 1. En la 61 era z.coerce.number(), porque del FormData llega texto. Aquí el campo lleva valueAsNumber y llega un número. Un campo vacío llega como NaN, y z.number lo rechaza con este mensaje."
    },
    {
      "fragmento": ".array(",
      "nota": "Cambio 2. Las líneas del menú son un array de objetos de verdad, no nombres sueltos de un FormData: z.array(z.object(...)), con su propio mínimo."
    },
    {
      "fragmento": "acepto: z.literal(true, 'Tienes que aceptar las condiciones.'),",
      "nota": "Cambio 3. Una casilla registrada da true o false. El z.literal(\"on\") de la lección 61 aquí falla siempre: es la pregunta de más abajo."
    }
  ]
}
```

En el formulario, las reglas salen de `register` y pasan al esquema. Los campos solo se registran:

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Presupuesto } from './esquema'

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(Presupuesto),
  defaultValues: {
    nombre: '',
    correo: '',
    telefono: '',
    invitados: '',
    tipo: '',
    lineas: [{ plato: 'migas', raciones: 60 }],
    acepto: false,
  },
})

// En los campos, register sin reglas: las reglas están en el esquema
<input {...register('nombre')} />
<input type="number" {...register('invitados', { valueAsNumber: true })} />
```

Se envió el formulario vacío y, después, bien relleno (con espacios de más alrededor del nombre):

```text
ENVÍO VACÍO
Escribe tu nombre (mínimo 2 letras).
Ese correo no parece válido.
Escribe cuántos invitados esperáis.
Elige el tipo de evento.
Tienes que aceptar las condiciones.
foco en: Nombre de contacto
ENVÍO CORRECTO
enviar recibe {"nombre":"Ana Lasierra","correo":"ana@ejemplo.es","telefono":"","invitados":60,"tipo":"boda","lineas":[{"plato":"migas","raciones":60}],"acepto":true}
```

- **Todos los errores a la vez**, cada uno junto a su campo, y el foco en el primero.
- **El nombre llega recortado**: `handleSubmit` recibe lo que sale del esquema, el dato limpio, como el `resultado.data` de la lección 61. Con la opción `raw: true` del resolver (`zodResolver(esquema, undefined, { raw: true })`) recibirías lo escrito tal cual; comprobado: llegaba `"  Ana  "`.

Los errores de una lista van anidados por posición, y el del mínimo de la lista va en `errors.lineas`, sin posición. Con dos líneas mal (0 raciones en la primera, sin plato ni raciones en la segunda) y, en otra prueba, con la lista vacía:

```text
errors.lineas[0].raciones.message → Al menos una ración.
errors.lineas[1].plato.message    → Elige un plato.
errors.lineas[1].raciones.message → Escribe las raciones.
errors.lineas.message (lista vacía) → Añade al menos un plato.
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// El esquema de la lección 61, copiado tal cual:\nacepto: z.literal('on', 'Tienes que aceptar las condiciones.'),\n\n// ...y la casilla, registrada en React Hook Form:\n<label>\n  <input type=\"checkbox\" {...register('acepto')} />\n  Acepto las condiciones\n</label>\n\n// Rellenas todo bien, MARCAS la casilla y pulsas «Pedir presupuesto».\n// ¿Qué pasa?",
  "opciones": [
    "Se envía, y acepto llega como 'on'",
    "Se envía, y acepto llega como true",
    "Sale «Tienes que aceptar las condiciones.» con la casilla marcada",
    "Zod lanza un error en la consola"
  ],
  "correcta": 2,
  "explicacion": "register guarda en una casilla true o false, no el \"on\" que mete el navegador en un FormData. z.literal(\"on\") no acepta true, así que el error sale aunque la casilla esté marcada, y el formulario no se envía nunca. Comprobado: la casilla estaba marcada y el mensaje, en pantalla. La versión para React Hook Form es z.literal(true)."
}
```

**Cuándo se valida** lo decide la opción `mode` de `useForm`: `'onSubmit'` (por defecto), `'onBlur'`, `'onChange'` (la documentación avisa de que cuesta renders), `'all'` y `'onTouched'`, que valida al salir del campo la primera vez y, desde ahí, en cada cambio. Es el más agradable para un formulario largo: no te riñe mientras escribes, pero te corrige en cuanto lo arreglas. Con `mode: 'onTouched'` en el mismo formulario:

```text
mientras escribo «ana@»: (ninguno)
al salir del campo: Ese correo no parece válido.
al completar «ana@ejemplo.es»: (ninguno)
```

Y lo de la lección 61 sigue en pie: todo esto es para ayudar a quien rellena el formulario. **El servidor vuelve a validar** (lecciones 61 y 89), y el esquema, que es un archivo normal, puede ser el mismo en los dos lados.

## Componentes que no son un `<input>`: `Controller`

`register` necesita un elemento del DOM con un valor y un evento de cambio. Los botones de opción y el interruptor de Radix (lección 80) no son eso: son botones con su rol, que avisan con `onValueChange(valor)` y `onCheckedChange(marcado)`, y los de shadcn/ui son los mismos, con estilos. Antes de ver la solución, mira qué pasa si los registras igual.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { RadioGroup, Switch } from 'radix-ui'\n\nconst { register, handleSubmit } = useForm({\n  defaultValues: { tipo: 'boda', montaje: false },\n})\n\n<RadioGroup.Root aria-label=\"Tipo de evento\" defaultValue=\"boda\" {...register('tipo')}>\n  {/* Boda, Comunión y Comida de empresa */}\n</RadioGroup.Root>\n<Switch.Root {...register('montaje')}>\n  <Switch.Thumb />\n</Switch.Root>\n\n// Marcas «Comunión», enciendes el interruptor y envías.\n// ¿Qué recibe la función que le pasas a handleSubmit?",
  "opciones": [
    "{\"tipo\":\"comunion\",\"montaje\":true}",
    "{\"tipo\":\"boda\",\"montaje\":false}, los valores iniciales",
    "{\"tipo\":null,\"montaje\":false}",
    "Nada: React avisa de que el componente no admite register"
  ],
  "correcta": 2,
  "explicacion": "En pantalla todo parece bien, porque Radix guarda su propio estado. Pero register se quedó con la ref de un div (el grupo) y de un botón (el interruptor), que no son campos. Del grupo le llegaron eventos de cambio, pero leyó el valor de ese div y guardó null; del interruptor no le llegó ninguno. Comprobado: {\"tipo\":null,\"montaje\":false}, sin ningún aviso en la consola. No se ve, y por eso es traicionero."
}
```

**`Controller`** hace de traductor. Registra el campo por ti y te da, en una función `render`, un objeto `field` con `value`, `onChange`, `onBlur`, `name` y `ref`, que conectas a las props que el componente entienda:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Controller, useForm } from 'react-hook-form'\nimport { RadioGroup, Switch } from 'radix-ui'\n\nconst TIPOS = [\n  { valor: 'boda', texto: 'Boda' },\n  { valor: 'comunion', texto: 'Comunión' },\n  { valor: 'empresa', texto: 'Comida de empresa' },\n]\n\nexport default function OpcionesEvento() {\n  const { control, handleSubmit } = useForm({\n    defaultValues: { tipo: 'boda', montaje: false },\n  })\n\n  return (\n    <form onSubmit={handleSubmit((datos) => console.log(datos))}>\n      <Controller\n        name=\"tipo\"\n        control={control}\n        render={({ field }) => (\n          <RadioGroup.Root\n            aria-label=\"Tipo de evento\"\n            name={field.name}\n            value={field.value}\n            onValueChange={field.onChange}\n          >\n            {TIPOS.map((tipo) => (\n              <label key={tipo.valor}>\n                <RadioGroup.Item value={tipo.valor}>\n                  <RadioGroup.Indicator />\n                </RadioGroup.Item>\n                {tipo.texto}\n              </label>\n            ))}\n          </RadioGroup.Root>\n        )}\n      />\n\n      <Controller\n        name=\"montaje\"\n        control={control}\n        render={({ field }) => (\n          <label>\n            Con montaje y camareros\n            <Switch.Root\n              ref={field.ref}\n              checked={field.value}\n              onCheckedChange={field.onChange}\n              onBlur={field.onBlur}\n            >\n              <Switch.Thumb />\n            </Switch.Root>\n          </label>\n        )}\n      />\n\n      <button>Pedir presupuesto</button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "render={({ field }) => (",
      "nota": "render recibe field (lo que conectas al componente), fieldState (su error, si está tocado o cambiado) y formState. Lo que devuelve es lo que se pinta."
    },
    {
      "fragmento": "onValueChange={field.onChange}",
      "nota": "Aquí está la traducción: Radix avisa con onValueChange(valor), y field.onChange acepta un valor o un evento. Ahora el formulario se entera."
    },
    {
      "fragmento": "checked={field.value}",
      "nota": "El interruptor pasa a estar controlado por el formulario. Por eso defaultValues lleva montaje: false: con undefined, React avisa (lo verás en «Errores típicos»)."
    },
    {
      "fragmento": "ref={field.ref}",
      "nota": "Pásale la ref al elemento que puede recibir el foco: así, si el campo tiene un error al enviar, el foco puede ir a él."
    },
    {
      "fragmento": "onBlur={field.onBlur}",
      "nota": "Marca el campo como tocado al salir de él. Sin esto, mode: \"onTouched\" no sabría cuándo validarlo."
    }
  ]
}
```

Con los mismos clics que en la pregunta, `Controller` frente a `register`:

```text
Controller · en pantalla: Comunión marcada=true, interruptor=true · enviar recibe {"tipo":"comunion","montaje":true}
register · en pantalla: Comunión marcada=true, interruptor=true · enviar recibe {"tipo":null,"montaje":false}
```

La regla de su documentación es corta: **`register` para los campos nativos y para los componentes que reparten la `ref` en un `<input>`**, como el `Input` de shadcn/ui (un `<input>` con clases y `{...props}`); **`Controller` para los que funcionan con un valor y un manejador**: selectores, calendarios, interruptores, botones de opción de una librería. Y nunca los dos en el mismo campo. La guía de formularios de shadcn/ui usa `Controller` con sus componentes `Field`, y esta web lo usa para su selector de iconos de las categorías.

## Listas de campos: `useFieldArray`

El menú del cáterin es una lista de líneas: un plato y sus raciones, tantas como quiera el cliente. Una lista así tiene dos problemas que ya conoces por separado:

- **Los nombres llevan la posición**: `lineas.0.plato`, `lineas.1.raciones`. Al quitar una fila, las de detrás cambian de nombre.
- **Cada fila necesita una identidad que la siga** aunque cambie de posición, y esa identidad es la `key` (lecciones 11 y 26).

Primero, a mano. El hook `useFilas` hace lo mínimo de `useFieldArray`: guarda las filas con un `id` que nace con cada una y ofrece `anadir` y `quitar`. Los valores que escribes no van al estado: viven en el DOM, como antes.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las líneas del menú, a mano",
  "consigna": "Cambia las raciones del plato 2, quita el plato 1 y pulsa «Pedir presupuesto»: se envía el ternasco con tus raciones. Añade un plato y vuelve a enviar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst CARTA = [\n  { id: 'croquetas', nombre: 'Croquetas de boletus' },\n  { id: 'migas', nombre: 'Migas a la pastora' },\n  { id: 'ternasco', nombre: 'Ternasco asado' },\n  { id: 'melocoton', nombre: 'Melocotón con vino' },\n]\n\n// Lo que hace useFieldArray por dentro: una lista de filas con un id propio.\n// Los valores que escribes viven en el DOM; aquí solo están los iniciales.\nfunction useFilas(iniciales) {\n  const [filas, setFilas] = useState(() =>\n    iniciales.map((fila) => ({ ...fila, id: crypto.randomUUID() })),\n  )\n  return {\n    filas,\n    anadir: (fila) => setFilas([...filas, { ...fila, id: crypto.randomUUID() }]),\n    quitar: (indice) => setFilas(filas.filter((_, i) => i !== indice)),\n  }\n}\n\n// «lineas.1.raciones» → lineas[1].raciones, como hace React Hook Form\nfunction leerLineas(formData) {\n  const lineas = []\n  for (const [nombre, valor] of formData) {\n    const [, indice, campo] = nombre.split('.')\n    lineas[indice] ??= {}\n    lineas[indice][campo] = campo === 'raciones' ? Number(valor) : valor\n  }\n  return lineas\n}\n\nexport default function LineasDelMenu() {\n  const { filas, anadir, quitar } = useFilas([\n    { plato: 'croquetas', raciones: 50 },\n    { plato: 'ternasco', raciones: 40 },\n  ])\n  const [enviado, setEnviado] = useState(null)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    setEnviado(leerLineas(new FormData(e.currentTarget)))\n  }\n\n  return (\n    <main>\n      <h1>Cáterin El Mantel: el menú</h1>\n      <form onSubmit={manejarEnvio}>\n        {filas.map((fila, indice) => (\n          <fieldset key={fila.id}>\n            <legend>Plato {indice + 1}</legend>\n            <label>\n              Plato {indice + 1}\n              <select name={`lineas.${indice}.plato`} defaultValue={fila.plato}>\n                {CARTA.map((plato) => (\n                  <option key={plato.id} value={plato.id}>\n                    {plato.nombre}\n                  </option>\n                ))}\n              </select>\n            </label>\n            <label>\n              Raciones del plato {indice + 1}\n              <input\n                type=\"number\"\n                name={`lineas.${indice}.raciones`}\n                defaultValue={fila.raciones}\n              />\n            </label>\n            <button type=\"button\" onClick={() => quitar(indice)}>\n              Quitar el plato {indice + 1}\n            </button>\n          </fieldset>\n        ))}\n        <button type=\"button\" onClick={() => anadir({ plato: 'migas', raciones: 50 })}>\n          Añadir plato\n        </button>\n        <button>Pedir presupuesto</button>\n      </form>\n      {enviado && <p className=\"estado\">Se envía: {JSON.stringify(enviado)}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n  font: inherit;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.4rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.85rem;\n}\n\n.estado {\n  margin: 0.2rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false
}
```

`leerLineas` convierte los nombres con puntos en un array de objetos, que es justo lo que hace la librería con `register('lineas.1.raciones')`. Y la `key` es `fila.id`, no la posición. ¿Por qué tanto empeño? Esta es la misma lista con `key={indice}`, probada en la vista previa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "{filas.map((fila, indice) => (\n  <fieldset key={indice}>\n    {/* el select con defaultValue={fila.plato}\n        y el input con defaultValue={fila.raciones} */}\n  </fieldset>\n))}\n\n// Al empezar: croquetas × 50 y ternasco × 40.\n// Cambias las raciones del plato 2 a 35, quitas el plato 1\n// y pulsas «Pedir presupuesto». ¿Qué se envía?",
  "opciones": [
    "[{\"plato\":\"ternasco\",\"raciones\":35}]",
    "[{\"plato\":\"ternasco\",\"raciones\":40}]",
    "[{\"plato\":\"croquetas\",\"raciones\":50}]",
    "[{\"plato\":\"croquetas\",\"raciones\":35}]"
  ],
  "correcta": 2,
  "explicacion": "Con key={indice}, al quitar la primera fila React ve que ha desaparecido la última posición: conserva el DOM de la posición 0 (croquetas, 50) y borra el de la 1, justo el que habías editado. El estado ya dice ternasco y 40, pero un campo no controlado que ya está montado no vuelve a mirar su defaultValue. Se envía la fila que quitaste. Comprobado con el mismo React de la vista previa."
}
```

Con la librería, `useFieldArray` lleva las filas y su `id`, y tú solo pintas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useFieldArray, useForm } from 'react-hook-form'\n\nconst CARTA = [\n  { id: 'croquetas', nombre: 'Croquetas de boletus' },\n  { id: 'migas', nombre: 'Migas a la pastora' },\n  { id: 'ternasco', nombre: 'Ternasco asado' },\n  { id: 'melocoton', nombre: 'Melocotón con vino' },\n]\n\nexport default function LineasDelMenu() {\n  const { control, register, handleSubmit } = useForm({\n    defaultValues: {\n      lineas: [\n        { plato: 'croquetas', raciones: 50 },\n        { plato: 'ternasco', raciones: 40 },\n      ],\n    },\n  })\n  const { fields, append, remove } = useFieldArray({ control, name: 'lineas' })\n\n  return (\n    <form onSubmit={handleSubmit((datos) => console.log(datos))}>\n      {fields.map((field, index) => (\n        <fieldset key={field.id}>\n          <legend>Plato {index + 1}</legend>\n          <label>\n            Plato {index + 1}\n            <select {...register(`lineas.${index}.plato`)}>\n              {CARTA.map((plato) => (\n                <option key={plato.id} value={plato.id}>{plato.nombre}</option>\n              ))}\n            </select>\n          </label>\n          <label>\n            Raciones del plato {index + 1}\n            <input type=\"number\" {...register(`lineas.${index}.raciones`, { valueAsNumber: true })} />\n          </label>\n          <button type=\"button\" onClick={() => remove(index)}>\n            Quitar el plato {index + 1}\n          </button>\n        </fieldset>\n      ))}\n      <button type=\"button\" onClick={() => append({ plato: 'migas', raciones: 50 })}>\n        Añadir plato\n      </button>\n      <button>Pedir presupuesto</button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const { fields, append, remove } = useFieldArray({ control, name: 'lineas' })",
      "nota": "fields es lo que pintas: una entrada por fila, con sus valores iniciales y un id que genera la librería. append y remove la cambian; también hay insert, move, swap, update y replace."
    },
    {
      "fragmento": "<fieldset key={field.id}>",
      "nota": "La key es field.id, nunca index: es la primera regla de su documentación. En la versión 8, todavía en beta, se llama field.key."
    },
    {
      "fragmento": "register(`lineas.${index}.plato`)",
      "nota": "El nombre lleva la posición. Al quitar una fila, la librería recoloca los valores de las de detrás."
    },
    {
      "fragmento": "onClick={() => remove(index)}",
      "nota": "remove(index) quita esa fila. Sin argumento, las quita todas."
    },
    {
      "fragmento": "append({ plato: 'migas', raciones: 50 })",
      "nota": "append añade una fila con todos sus valores (su documentación pide el objeto completo, nunca {}) y lleva el foco a su primer campo."
    }
  ]
}
```

Los `fields` al montar, y el mismo recorrido de antes: raciones del plato 2 a 35, quitar el plato 1, añadir y enviar:

```text
fields: [{"plato":"croquetas","raciones":50,"id":"0632de07-9f4a-4d5f-b302-39fb931f7a04"},{"plato":"ternasco","raciones":40,"id":"35a7de0d-b463-4446-bc0a-56ed0f134021"}]
al montar: [Plato 1: croquetas × 50] [Plato 2: ternasco × 40]
raciones del plato 2 → 35: [Plato 1: croquetas × 50] [Plato 2: ternasco × 35]
quito el plato 1: [Plato 1: ternasco × 35]
añado un plato: [Plato 1: ternasco × 35] [Plato 2: migas × 50] · foco en: select name="lineas.1.plato"
enviar recibe {"lineas":[{"plato":"ternasco","raciones":35},{"plato":"migas","raciones":50}]}
```

Al añadir, el foco fue al desplegable del plato 2 (`lineas.1.plato`), el primer campo de la fila nueva. Y lo que llega es lo que se ve.

¿Y si en la librería pones `key={index}`? Con campos nativos, en nuestras pruebas recolocó los valores igual. El fallo aparece cuando cada fila tiene **estado propio**. Se probó con un componente `Linea` que guarda en un `useState` si su nota está abierta: se abrió la nota del plato 1, se escribió «sin gluten» y se quitó ese plato:

```text
key={field.id} antes: Plato 1: croquetas + nota «sin gluten» | Plato 2: ternasco
key={field.id} tras quitar el 1: Plato 1: ternasco
key={index} antes: Plato 1: croquetas + nota «sin gluten» | Plato 2: ternasco
key={index} tras quitar el 1: Plato 1: ternasco + nota «»
```

Con `index`, la fila del ternasco hereda la nota abierta de la que has quitado (vacía, eso sí). Es la lección 26: el estado va con la posición en el árbol, y la `key` es lo único que la cambia.

## Leer un campo mientras se escribe: `useWatch`, no `watch()`

El total del menú depende de las raciones, así que hay que leerlas mientras se escriben. React Hook Form tiene dos formas: `watch('lineas')`, que se llama en el componente del `useForm`, y `useWatch({ control, name: 'lineas' })`, que se llama en cualquier componente de dentro. Parecen lo mismo, y no lo son.

Primero, la idea con React puro. A la izquierda, el valor se guarda en el estado del formulario, como hace `watch()`. A la derecha, solo el componente `Total` se suscribe a los valores, como hace `useWatch`. La suscripción es un almacén mínimo con `useSyncExternalStore` (lecciones 46 y 75). `useWatch` usa la suya propia, con un estado dentro del componente que la llama (se ve en su código), pero la idea es la misma.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El total, de dos maneras",
  "consigna": "Cambia las raciones de la columna A: se renderizan ComoWatch y sus dos campos. Cambia las de la columna B: solo se renderiza Total, y el motivo es «cambió otro de sus ganchos», la suscripción. Los dos totales se calculan igual.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useSyncExternalStore } from 'react'\nimport { crearVigilante } from './vigilante'\nimport './estilos.css'\n\nconst PRECIOS = { croquetas: 4, ternasco: 12 }\nconst INICIALES = { croquetas: 50, ternasco: 40 }\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nfunction calcularTotal(raciones) {\n  return Object.entries(raciones).reduce(\n    (suma, [plato, cuantas]) => suma + PRECIOS[plato] * (Number(cuantas) || 0),\n    0,\n  )\n}\n\nfunction Raciones({ plato, prefijo }) {\n  return (\n    <label>\n      {prefijo}: raciones de {plato}\n      <input type=\"number\" name={plato} defaultValue={INICIALES[plato]} />\n    </label>\n  )\n}\n\n// Como watch(): el valor vive en el estado del formulario entero\nfunction ComoWatch() {\n  const [raciones, setRaciones] = useState(INICIALES)\n  return (\n    <form onChange={(e) => setRaciones(Object.fromEntries(new FormData(e.currentTarget)))}>\n      <h2>Como watch()</h2>\n      <Raciones plato=\"croquetas\" prefijo=\"A\" />\n      <Raciones plato=\"ternasco\" prefijo=\"A\" />\n      <p>Total: {euros.format(calcularTotal(raciones))}</p>\n    </form>\n  )\n}\n\n// Como useWatch: solo Total se suscribe a los valores\nfunction Total({ vigilante }) {\n  const raciones = useSyncExternalStore(vigilante.suscribir, vigilante.leer)\n  return <p>Total: {euros.format(calcularTotal(raciones))}</p>\n}\n\nfunction ComoUseWatch() {\n  const [vigilante] = useState(() => crearVigilante(INICIALES))\n  return (\n    <form onChange={(e) => vigilante.cambiar(Object.fromEntries(new FormData(e.currentTarget)))}>\n      <h2>Como useWatch</h2>\n      <Raciones plato=\"croquetas\" prefijo=\"B\" />\n      <Raciones plato=\"ternasco\" prefijo=\"B\" />\n      <Total vigilante={vigilante} />\n    </form>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cáterin El Mantel: el total del menú</h1>\n      <div className=\"columnas\">\n        <ComoWatch />\n        <ComoUseWatch />\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "vigilante.jsx",
      "codigo": "// Un almacén mínimo fuera de React: guarda unos valores y avisa a quien\n// se haya suscrito cuando cambian (la técnica de las lecciones 46 y 75).\nexport function crearVigilante(iniciales) {\n  let valores = iniciales\n  const oyentes = new Set()\n  return {\n    leer: () => valores,\n    cambiar(nuevos) {\n      valores = nuevos\n      for (const oyente of oyentes) oyente()\n    },\n    suscribir(oyente) {\n      oyentes.add(oyente)\n      return () => oyentes.delete(oyente)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n  font: inherit;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.4rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.85rem;\n}\n\n.estado {\n  margin: 0.2rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Con la librería, el total va en su propio componente:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useFieldArray, useForm, useWatch } from 'react-hook-form'\n\nconst PRECIOS = { croquetas: 4, migas: 5, ternasco: 12, melocoton: 3.5 }\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nfunction calcularTotal(lineas) {\n  return lineas.reduce((suma, { plato, raciones }) => suma + PRECIOS[plato] * (raciones || 0), 0)\n}\n\nfunction Linea({ index, register }) {\n  return (\n    <label>\n      Raciones del plato {index + 1}\n      <input type=\"number\" {...register(`lineas.${index}.raciones`, { valueAsNumber: true })} />\n    </label>\n  )\n}\n\nfunction Total({ control }) {\n  const lineas = useWatch({ control, name: 'lineas' })\n  return <p>Total: {euros.format(calcularTotal(lineas))}</p>\n}\n\nexport default function Pedido() {\n  const { control, register } = useForm({\n    defaultValues: {\n      lineas: [\n        { plato: 'croquetas', raciones: 50 },\n        { plato: 'ternasco', raciones: 40 },\n      ],\n    },\n  })\n  const { fields } = useFieldArray({ control, name: 'lineas' })\n\n  return (\n    <form>\n      {fields.map((field, index) => (\n        <Linea key={field.id} index={index} register={register} />\n      ))}\n      <Total control={control} />\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const lineas = useWatch({ control, name: 'lineas' })",
      "nota": "Se suscribe a lineas y devuelve su valor actual. Cuando cambia, se renderiza este componente, y solo este."
    },
    {
      "fragmento": "function Total({ control }) {",
      "nota": "El truco es el sitio: useWatch en un componente pequeño, lo más abajo posible. Si lo llamas en Pedido, que tiene el useForm, Pedido se renderiza entero como con watch."
    },
    {
      "fragmento": "(raciones || 0)",
      "nota": "Mientras borras para escribir otro número, el campo está vacío y valueAsNumber da NaN. NaN || 0 es 0, y el total no enseña «NaN €»."
    },
    {
      "fragmento": "<Total control={control} />",
      "nota": "control es el objeto que conecta con el formulario. Lo necesitan useWatch, Controller y useFieldArray. Con FormProvider y useFormContext no hace falta pasarlo por props."
    }
  ]
}
```

La versión con `watch()` solo cambia tres cosas: saca `watch` de `useForm`, llama a `watch('lineas')` en `Pedido` y pinta el total ahí mismo, sin `Total`. Las dos, al borrar las raciones del plato 1 y escribir «120» (cuatro cambios):

```text
watch() · al montar: Pedido=2 Linea=4 · Total: 680,00 €
watch() · borro y escribo «120» (4 cambios): Pedido=4 Linea=8 · Total: 960,00 €
useWatch · al montar: Pedido=2 Linea=4 Total=2 · Total: 680,00 €
useWatch · borro y escribo «120» (4 cambios): Total=4 · Total: 960,00 €
```

**Con `watch()`, cada cambio renderiza el formulario y todas sus líneas**: 4 renders de `Pedido` y 8 de `Linea`. **Con `useWatch`, solo `Total`**: 4. El resultado en pantalla es el mismo.

### El aviso del compilador, y lo que no avisa

En la lección 70 viste que el linter marca `watch()` con `incompatible-library`. Con la versión `watch()` de arriba, ESLint 10.13.0 y `eslint-plugin-react-hooks` 7.1.1 dicen:

```text
29:18  warning  Compilation Skipped: Use of incompatible library

This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized.

> 29 |   const lineas = watch('lineas')
     |                  ^^^^^ React Hook Form's `useForm()` API returns a `watch()` function which cannot be memoized safely.
```

Es decir: esta API devuelve funciones que no se pueden memorizar sin dejar la interfaz vieja; para evitarlo, el compilador no memoriza este componente, pero puede haber problemas si pasas valores de esta API a otros componentes memorizados. `watch` es siempre la misma función, y una caché que compara por identidad devolvería siempre lo de la primera vez. Con `useWatch`, ni aviso ni problema: el componente se compila y el total se actualiza.

La última frase del aviso es la importante. Lo que el aviso no marca es **pasar `watch` a un hijo**. Este `Total` recibe `watch` por props y lo llama él:

```jsx
function Total({ watch }) {
  const lineas = watch('lineas')
  const total = lineas.reduce((suma, { plato, raciones }) => suma + PRECIOS[plato] * (raciones || 0), 0)
  return <p>Total: {euros.format(total)}</p>
}

// En Pedido: const { register, watch } = useForm(...) y <Total watch={watch} />
```

El linter no marcó nada, y el compilador compiló los dos componentes. Al ejecutarlo:

```text
watch pasado al hijo, sin compilar: Total: 680,00 € → escribo «120»: Total: 960,00 €
watch pasado al hijo, compilado: Total: 680,00 € → escribo «120»: Total: 680,00 €
useWatch, compilado: Total: 680,00 € → escribo «120»: Total: 960,00 €
```

**Compilado, el total se queda en 680 € para siempre.** En la salida de `babel-plugin-react-compiler` 1.0.0 se ve por qué: el cálculo está dentro de `if ($[0] !== watch) { ... }`, y `watch` nunca cambia, así que la caché devuelve el total de la primera vez. Las preguntas frecuentes de la librería lo dicen claro: con el compilador, usa `useWatch` para pintar valores (o saca el componente con `"use no memo"`, lección 69). La versión 8, en beta, anuncia soporte para el compilador.

## Enviar con `useMutation` (y por qué `useFormStatus` no se entera)

En la lección 78 enviaste datos con `useMutation`. Encaja con el formulario sin forzar nada: **`handleSubmit` valida y te da el dato limpio; la mutación lo envía y lleva su propio estado**.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useMutation } from '@tanstack/react-query'\nimport { useForm } from 'react-hook-form'\n\nasync function enviarSolicitud(datos) {\n  const respuesta = await fetch('/api/presupuestos', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(datos),\n  })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport default function PedirPresupuesto() {\n  const {\n    register,\n    handleSubmit,\n    reset,\n    setError,\n    formState: { errors },\n  } = useForm({ defaultValues: { nombre: '', fecha: '' } })\n\n  const enviar = useMutation({\n    mutationFn: enviarSolicitud,\n    onSuccess: () => reset(),\n    onError: () =>\n      setError('root.servidor', {\n        message: 'No hemos podido enviar la solicitud. Inténtalo otra vez.',\n      }),\n  })\n\n  return (\n    <form onSubmit={handleSubmit((datos) => enviar.mutate(datos))} noValidate>\n      <label>\n        Nombre de contacto\n        <input {...register('nombre', { required: 'Escribe tu nombre.' })} />\n      </label>\n      {errors.nombre && <p>{errors.nombre.message}</p>}\n      <label>\n        Fecha del evento\n        <input type=\"date\" {...register('fecha')} />\n      </label>\n      {errors.root?.servidor && <p role=\"alert\">{errors.root.servidor.message}</p>}\n      {enviar.isSuccess && <p role=\"status\">Solicitud enviada. Te contestamos en 48 horas.</p>}\n      <button disabled={enviar.isPending}>\n        {enviar.isPending ? 'Enviando…' : 'Pedir presupuesto'}\n      </button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<form onSubmit={handleSubmit((datos) => enviar.mutate(datos))} noValidate>",
      "nota": "Cada pieza hace lo suyo: handleSubmit valida, la mutación envía. mutate no devuelve una promesa, así que handleSubmit termina en el acto."
    },
    {
      "fragmento": "onSuccess: () => reset(),",
      "nota": "Cuando el servidor dice que sí, reset vuelve a defaultValues: campos vacíos e isDirty a false. Su documentación pide no llamarlo dentro de la función de envío; aquí se ejecuta después, cuando termina la mutación."
    },
    {
      "fragmento": "setError('root.servidor', {",
      "nota": "Un error que no es de ningún campo va en root, y se borra solo en el siguiente envío. Si el servidor dijera qué campo falla (la fecha ya está cogida), setError(\"fecha\", ...) lo pondría junto a su campo."
    },
    {
      "fragmento": "<button disabled={enviar.isPending}>",
      "nota": "El estado del envío lo lleva la mutación con isPending. isSubmitting no sirve aquí: lo verás en la salida."
    }
  ]
}
```

Para la prueba, el formulario llevaba dentro un componente más con dos testigos: el `pending` de `useFormStatus` (lección 59) y el `isSubmitting` de `useFormState`, el Hook de la librería para leer `formState` desde un componente hijo. El servidor simulado tarda 300 ms. Un envío que sale bien y otro en el que el servidor responde 500:

```text
   0 ms  PULSO «Pedir presupuesto»
  10 ms  → POST /api/presupuestos
  12 ms  PANTALLA «useFormStatus: pending=false · useFormState: isSubmitting=false» «Enviando…» (desactivado) · Nombre: «Ana Lasierra»
 312 ms  ← /api/presupuestos · 201
 437 ms  PANTALLA «Solicitud enviada. Te contestamos en 48 horas.» «useFormStatus: pending=false · useFormState: isSubmitting=false» «Pedir presupuesto» · Nombre: «»
rechazos sin capturar: ninguno

   0 ms  PULSO «Pedir presupuesto»
  15 ms  → POST /api/presupuestos
  17 ms  PANTALLA «useFormStatus: pending=false · useFormState: isSubmitting=false» «Enviando…» (desactivado) · Nombre: «Ana Lasierra»
 317 ms  ← /api/presupuestos · 500
 440 ms  PANTALLA «No hemos podido enviar la solicitud. Inténtalo otra vez.» «useFormStatus: pending=false · useFormState: isSubmitting=false» «Pedir presupuesto» · Nombre: «Ana Lasierra»
rechazos sin capturar: ninguno
```

- **`useFormStatus` dice `false` todo el rato.** Como apuntaba la lección 59, con `onSubmit` no se entera (salvo que el manejador abra una transición), y `handleSubmit` va por `onSubmit`. Su equivalente en la librería es `useFormState({ control })`, que da el `formState` a cualquier componente de dentro, como un botón propio.
- **Pero `isSubmitting` también dice `false`**: `handleSubmit` ya había terminado cuando volvió `mutate`. Quien sabe que se está enviando es la mutación, y por eso el botón usa `enviar.isPending`.
- **Si falla, lo escrito se queda**: «Ana Lasierra» sigue en su campo junto al aviso. Sin el truco de devolver los valores y ponerlos en `defaultValue` de la lección 61: la librería no vacía nada que no le pidas.

Si prefieres que `isSubmitting` funcione, espera a la mutación: `handleSubmit(async (datos) => { await enviar.mutateAsync(datos) })`. Se probó, y tiene una trampa:

```text
   0 ms  PULSO «Pedir presupuesto»
  13 ms  → POST /api/presupuestos
  16 ms  PANTALLA «useFormStatus: pending=false · useFormState: isSubmitting=true» «Enviando…» (desactivado) · Nombre: «Ana Lasierra»
 316 ms  ← /api/presupuestos · 500
 439 ms  PANTALLA «No hemos podido enviar la solicitud. Inténtalo otra vez.» «useFormStatus: pending=false · useFormState: isSubmitting=false» «Pedir presupuesto» · Nombre: «Ana Lasierra»
rechazos sin capturar: el servidor respondió 500
```

`isSubmitting` sí pasa a `true`, pero cuando el servidor falla, `mutateAsync` lanza y `handleSubmit` no se traga los errores de tu función (lo dice su documentación): el rechazo queda sin capturar. Si eliges este camino, envuelve el `await` en un `try`/`catch`.

## Así lo usa esta web

El editor de lecciones de Tech Study Tracker (`src/components/leccion/LeccionForm.tsx`) es un formulario de React Hook Form, con la versión 7.65.0 según su `package.json`. Cuatro trozos reales, recortados, que aplican lo de esta lección:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const { register, handleSubmit, setError, reset, control, formState, getValues, setValue } =\n  useForm<LeccionFields>({ defaultValues: defaults(leccion) })\n\n// ...\nconst title = useWatch({ control, name: 'titulo' })\nconst slug = useMemo(() => leccion?.slug ?? slugify(title), [leccion?.slug, title])\n\n// ...\nuseEffect(() => {\n  function warnBeforeUnload(event: BeforeUnloadEvent) {\n    if (!formState.isDirty) return\n    event.preventDefault()\n    event.returnValue = true\n  }\n  window.addEventListener('beforeunload', warnBeforeUnload)\n  return () => window.removeEventListener('beforeunload', warnBeforeUnload)\n}, [formState.isDirty])\n\nasync function submit(values: LeccionFields) {\n  const result = leccionSchema.safeParse(values)\n  if (!result.success) {\n    const issue = result.error.issues[0]\n    const path = issue?.path[0] as keyof LeccionFields | undefined\n    if (path) setError(path, { message: issue.message }, { shouldFocus: true })\n    setSubmitError(issue?.message ?? 'Revisa los campos marcados.')\n    return\n  }\n  // ...\n  try {\n    await onSubmit({\n      ...result.data,\n      slug,\n      modulo: result.data.modulo.trim() || null,\n    })\n    reset(result.data)\n  } catch {\n    setSubmitError('No se pudo guardar la lección. Revisa los campos e inténtalo de nuevo.')\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "const title = useWatch({ control, name: 'titulo' })",
      "nota": "El slug se calcula a partir del título mientras se escribe. Aquí useWatch está en el mismo componente que useForm, así que cada tecla en el título renderiza el editor entero, como haría watch. Para un editor que usa una sola persona, es un precio razonable."
    },
    {
      "fragmento": "if (!formState.isDirty) return",
      "nota": "Si hay cambios sin guardar, el navegador pregunta antes de cerrar la pestaña. isDirty se lee en el render (en las dependencias del efecto), y eso suscribe el componente."
    },
    {
      "fragmento": "const result = leccionSchema.safeParse(values)",
      "nota": "Sin resolver: valida con Zod dentro de la función de envío, como en la acción de la lección 61, y lleva el primer error a su campo con setError. Funciona, aunque así solo enseña un error cada vez."
    },
    {
      "fragmento": "{ shouldFocus: true }",
      "nota": "setError puede llevar el foco al campo, como hace handleSubmit con los errores de validación."
    },
    {
      "fragmento": "reset(result.data)",
      "nota": "Tras guardar, lo guardado pasa a ser el nuevo punto de partida: los campos se quedan como están, pero isDirty vuelve a false y el aviso de salida desaparece."
    },
    {
      "fragmento": "} catch {",
      "nota": "El try/catch del final de la sección anterior: handleSubmit no se traga los errores de la función de envío, así que se capturan aquí."
    }
  ]
}
```

## Cuándo lo usarías de verdad (y cuándo te basta una Action)

No es una cosa o la otra para toda la aplicación: se decide formulario a formulario. Lo que pesa:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro maneras de llevar un formulario",
  "roles": [
    {
      "etiqueta": "Una Action",
      "rol": "Validar al enviar",
      "descripcion": "Pocos campos, errores al enviar, reinicio al terminar y, con un framework, envío que funciona sin JavaScript (lección 89). useActionState, useFormStatus y Zod en la acción."
    },
    {
      "etiqueta": "React Hook Form",
      "rol": "Formularios grandes y vivos",
      "descripcion": "Validar al escribir o al salir, listas de campos, componentes de Radix o shadcn/ui, campos que dependen de otros y saber qué ha cambiado. Sin renderizar todo en cada tecla."
    },
    {
      "etiqueta": "Los dos",
      "rol": "Validar aquí, enviar allí",
      "descripcion": "Su guía para React 19 explica cómo combinarlos: su componente Form envía a una acción después de validar en el cliente, y setError lleva al campo lo que devuelva useActionState."
    },
    {
      "etiqueta": "TanStack Form",
      "rol": "La alternativa",
      "descripcion": "De los autores de TanStack Query, va por la 1.33.5. Muy tipado, para varios frameworks, con un form.Field controlado por campo. Unos 2,5 millones de descargas semanales."
    }
  ]
}
```

Señales de que la Action se te ha quedado corta:

1. Has escrito un `useState` por campo solo para validar mientras se escribe.
2. Devuelves los valores desde la acción solo para que no se borren, y ya tienes tres `key` para que los desplegables se acuerden.
3. Hay una lista de filas que se añaden y se quitan.
4. Hay un componente de una librería que no es un `<input>`.
5. Quieres saber si algo ha cambiado para activar «Guardar» o avisar antes de salir.

Si no se cumple ninguna, una Action con `useActionState` es menos código y una dependencia menos. Un buscador, un formulario de contacto o el de comentarios del proyecto 62 no ganan nada con la librería.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con React Hook Form y Zod, los datos que llegan al servidor ya son válidos",
      "realidad": "Todo esto corre en el navegador y se puede saltar. El servidor vuelve a validar siempre (lecciones 61 y 89). La ventaja de Zod es que el mismo esquema puede servir en los dos lados."
    },
    {
      "mito": "La librería se encarga de la accesibilidad del formulario",
      "realidad": "Lleva el foco al primer error, y poco más. El label, aria-invalid, aria-describedby y el resumen de errores en una región viva siguen siendo tuyos, como en la lección 61."
    },
    {
      "mito": "watch y useWatch son lo mismo con otro nombre",
      "realidad": "Medido: con watch, cuatro cambios renderizaron 4 veces el formulario y 8 sus líneas; con useWatch en un componente aparte, solo 4 veces ese componente. Y con el compilador, watch puede dejar la pantalla vieja."
    },
    {
      "mito": "Un formulario no controlado no puede validar mientras se escribe",
      "realidad": "React Hook Form lo hace con mode: \"onTouched\" u \"onChange\": lee el valor por la ref y solo renderiza si cambia el error. Lo de no controlado va de quién guarda el valor, no de cuándo se valida."
    }
  ]
}
```

## Errores típicos

**1. Un componente propio que no pasa la `ref`.** Es el más silencioso. Este `Campo` reparte las props de `register`... menos una:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Campo({ etiqueta, name, onChange, onBlur }) {\n  return (\n    <label>\n      {etiqueta}\n      <input name={name} onChange={onChange} onBlur={onBlur} />\n    </label>\n  )\n}\n\n// En el formulario:\n<Campo etiqueta=\"Nombre de contacto\" {...register('nombre', { required: 'Escribe tu nombre.' })} />\n<Campo etiqueta=\"Correo\" {...register('correo', { required: 'Escribe un correo.' })} />\n\n// Escribes «Ana» y «ana@ejemplo.es», y envías. ¿Qué pasa?",
  "opciones": [
    "Se envía {\"nombre\":\"Ana\",\"correo\":\"ana@ejemplo.es\"}",
    "Salen «Escribe tu nombre.» y «Escribe un correo.» con los dos campos escritos",
    "React avisa en la consola de que falta la ref",
    "Se envía, pero sin el correo"
  ],
  "correcta": 1,
  "explicacion": "Sin la ref, la librería no tiene el elemento y no puede leer lo que escribes. Comprobado: getValues() devolvía {} y las dos reglas required fallaron con los campos llenos. Sin reglas, se enviaba {} sin más, y en ningún caso hubo avisos. Reparte {...props} en el input, como el Campo del bloque hecho a mano, o recibe ref y pásala."
}
```

**2. `register` en un componente que no es un `<input>`.** Los botones de opción y el interruptor de Radix de la sección de `Controller`: en pantalla todo bien, y llega `{"tipo":null,"montaje":false}`. Si el componente funciona con un valor y un manejador, `Controller`.

**3. Copiar el esquema de la lección 61 sin adaptarlo.** `z.literal('on')` no acepta nunca el `true` de una casilla. Y si quitas `valueAsNumber` de un campo numérico, llega texto: con «60» escrito, el error fue «Escribe cuántos invitados esperáis.» (`invalid_type`). O `valueAsNumber` en el campo, o `z.coerce.number()` en el esquema.

**4. Un `Controller` sin valor inicial.** Si `defaultValues` no trae el campo, `field.value` empieza siendo `undefined` y el `<input>` arranca sin controlar. Al escribir, React avisa en la consola:

```text
A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://react.dev/link/controlled-components
```

Es decir: un componente ha pasado un input de no controlado a controlado, porque su valor ha cambiado de `undefined` a algo definido; decide una de las dos cosas para toda la vida del componente. Es el aviso de la lección 22. Da siempre un valor inicial a cada campo: `''`, `false` o `null`, nunca `undefined`.

**5. `key={index}` en una lista de campos.** Lo viste dos veces: a mano, se envió la fila que habías quitado; con la librería, una fila heredó el estado de otra. `key={field.id}`.

**6. `watch()` en el componente del formulario, o pasado a un hijo.** Lo primero renderiza todo en cada cambio y el compilador se salta el componente; lo segundo, con el compilador, deja la pantalla vieja sin avisar. Para pintar un valor, `useWatch` en un componente pequeño.

**7. Esperar que el formulario se vacíe solo al enviar.** Con `<form action>` lo hacía React; con `handleSubmit`, no. `reset()` cuando el servidor confirme, en el `onSuccess` de la mutación.

**8. Un `onSubmit` asíncrono que lanza.** `handleSubmit` no captura los errores de tu función: con `await enviar.mutateAsync(datos)` y un 500, el rechazo quedó sin capturar. `try`/`catch` con `setError('root.…')`, o `mutate` con `onError`.

## Ejercicios

Los dos se hacen con React puro, como los bloques en vivo de la lección: la vista previa no puede cargar React Hook Form. Son las dos piezas que la librería te da hechas, escritas por ti una vez para entenderlas.

**1. Los teléfonos de contacto.** El cáterin pide uno o más teléfonos, cada uno con su tipo. Se pueden añadir, pero «Quitar» no hace nada, y las filas usan la posición como `key`. Haz que quitar funcione y que cada teléfono conserve lo suyo al cambiar de posición: es lo que hace `useFieldArray`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los teléfonos de contacto",
  "consigna": "Sigue los tres TODO de App.jsx: un id para cada teléfono desde que nace, quitar sin mutar y la key adecuada. Pruébalo a mano: añade un teléfono, escribe en los dos, cambia el tipo del segundo y quita el primero. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Telefonos() {\n  // TODO 1: cada teléfono necesita un id propio que no cambie nunca\n  // (crypto.randomUUID(), lección 11). Dáselo al crearlo, aquí y en anadir.\n  const [telefonos, setTelefonos] = useState([{ numero: '', tipo: 'movil' }])\n  const [guardados, setGuardados] = useState(null)\n\n  function anadir() {\n    setTelefonos([...telefonos, { numero: '', tipo: 'movil' }])\n  }\n\n  function quitar(indice) {\n    // TODO 2: quita el teléfono de esa posición, sin mutar el array\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const datos = new FormData(e.currentTarget)\n    setGuardados(\n      telefonos.map((_, i) => `${datos.get(`telefonos.${i}.numero`)} (${datos.get(`telefonos.${i}.tipo`)})`),\n    )\n  }\n\n  return (\n    <main>\n      <h1>Cáterin El Mantel: teléfonos de contacto</h1>\n      <form onSubmit={manejarEnvio}>\n        {telefonos.map((telefono, indice) => (\n          // TODO 3: ¿qué key sigue a cada teléfono aunque cambie de posición?\n          <fieldset key={indice}>\n            <legend>Teléfono {indice + 1}</legend>\n            <label>\n              Número del teléfono {indice + 1}\n              <input type=\"tel\" name={`telefonos.${indice}.numero`} defaultValue={telefono.numero} />\n            </label>\n            <label>\n              Tipo del teléfono {indice + 1}\n              <select name={`telefonos.${indice}.tipo`} defaultValue={telefono.tipo}>\n                <option value=\"movil\">Móvil</option>\n                <option value=\"fijo\">Fijo</option>\n              </select>\n            </label>\n            <button type=\"button\" onClick={() => quitar(indice)}>\n              Quitar el teléfono {indice + 1}\n            </button>\n          </fieldset>\n        ))}\n        <button type=\"button\" onClick={anadir}>\n          Añadir teléfono\n        </button>\n        <button>Guardar teléfonos</button>\n      </form>\n      {guardados && <p role=\"status\">Guardados: {guardados.join(', ')}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n  font: inherit;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.4rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.85rem;\n}\n\n.estado {\n  margin: 0.2rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Añadir teléfono», aparece un segundo teléfono",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir teléfono"
          }
        }
      ],
      "espera": {
        "etiqueta": "Número del teléfono 2"
      }
    },
    {
      "descripcion": "Al quitar el teléfono 1, queda uno solo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir teléfono"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar el teléfono 1"
          }
        }
      ],
      "espera": {
        "ausente": {
          "etiqueta": "Número del teléfono 2"
        }
      }
    },
    {
      "descripcion": "Al quitar el teléfono 1, el número del 2 pasa a la primera posición",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir teléfono"
          }
        },
        {
          "escribir": {
            "etiqueta": "Número del teléfono 1",
            "texto": "976112233"
          }
        },
        {
          "escribir": {
            "etiqueta": "Número del teléfono 2",
            "texto": "600445566"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar el teléfono 1"
          }
        }
      ],
      "espera": {
        "etiqueta": "Número del teléfono 1",
        "valor": "600445566"
      }
    },
    {
      "descripcion": "El tipo del teléfono 2 también pasa con él a la primera posición",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir teléfono"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Tipo del teléfono 2",
            "opcion": "Fijo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar el teléfono 1"
          }
        }
      ],
      "espera": {
        "etiqueta": "Tipo del teléfono 1",
        "valor": "fijo"
      }
    },
    {
      "descripcion": "Al guardar, llegan los teléfonos que se ven",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir teléfono"
          }
        },
        {
          "escribir": {
            "etiqueta": "Número del teléfono 1",
            "texto": "976112233"
          }
        },
        {
          "escribir": {
            "etiqueta": "Número del teléfono 2",
            "texto": "600445566"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Tipo del teléfono 2",
            "opcion": "Fijo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar el teléfono 1"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar teléfonos"
          }
        }
      ],
      "espera": {
        "texto": "Guardados: 600445566 (fijo)"
      }
    }
  ]
}
```

**2. ¿Hay cambios?** En la página de su reserva, el cliente puede cambiar la fecha, los invitados y el lugar. «Guardar cambios» y «Descartar cambios» solo deben estar activos si algo es distinto de lo guardado, y la línea de estado tiene que decirlo. Es el `isDirty` de la librería, escrito a mano con un `onChange` en el `<form>` (los eventos de cambio de los campos suben hasta él).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "¿Hay cambios?",
  "consigna": "Escribe manejarCambio y descartar siguiendo los TODO. Ojo: si dejas un campo como estaba, ya no hay cambios, y después de guardar, lo guardado es la nueva referencia. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst RESERVA = { fecha: '2026-11-14', invitados: '60', lugar: 'Finca Los Almendros' }\n\nexport default function TuReserva() {\n  const [guardada, setGuardada] = useState(RESERVA)\n  const [conCambios, setConCambios] = useState(false)\n  const [aviso, setAviso] = useState('')\n\n  function manejarCambio(e) {\n    // TODO 1: lee lo que hay ahora en el formulario (FormData) y compáralo\n    // campo a campo con «guardada». Si algo es distinto, hay cambios.\n  }\n\n  function descartar(e) {\n    // TODO 2: devuelve los campos a lo guardado (el formulario tiene reset())\n    // y deja claro que ya no hay cambios.\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const valores = Object.fromEntries(new FormData(e.currentTarget))\n    setGuardada(valores)\n    setConCambios(false)\n    setAviso(`Cambios guardados: ${valores.invitados} invitados el ${valores.fecha}.`)\n  }\n\n  return (\n    <main>\n      <h1>Cáterin El Mantel: tu reserva</h1>\n      <form onChange={manejarCambio} onSubmit={manejarEnvio}>\n        <label>\n          Fecha del evento\n          <input type=\"date\" name=\"fecha\" defaultValue={guardada.fecha} />\n        </label>\n        <label>\n          Invitados\n          <input type=\"number\" name=\"invitados\" defaultValue={guardada.invitados} />\n        </label>\n        <label>\n          Lugar de la celebración\n          <input name=\"lugar\" defaultValue={guardada.lugar} />\n        </label>\n        <p role=\"status\">{conCambios ? 'Hay cambios sin guardar' : 'Sin cambios'}</p>\n        <button disabled={!conCambios}>Guardar cambios</button>\n        <button type=\"button\" onClick={descartar} disabled={!conCambios}>\n          Descartar cambios\n        </button>\n      </form>\n      {aviso && <p className=\"estado\">{aviso}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.4rem;\n  margin-bottom: 1rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n  font: inherit;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.4rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.85rem;\n}\n\n.estado {\n  margin: 0.2rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al cambiar los invitados, la línea de estado dice «Hay cambios sin guardar»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "80"
          }
        }
      ],
      "espera": {
        "texto": "Hay cambios sin guardar"
      }
    },
    {
      "descripcion": "Si vuelves a dejar los invitados como estaban, vuelve a decir «Sin cambios»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "80"
          }
        },
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "60"
          }
        }
      ],
      "espera": {
        "texto": "Sin cambios"
      }
    },
    {
      "descripcion": "«Descartar cambios» devuelve los invitados guardados",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "80"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Descartar cambios"
          }
        }
      ],
      "espera": {
        "etiqueta": "Invitados",
        "valor": "60"
      }
    },
    {
      "descripcion": "Después de descartar, la línea de estado vuelve a «Sin cambios»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Lugar de la celebración",
            "texto": "Masía El Pinar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Descartar cambios"
          }
        }
      ],
      "espera": {
        "texto": "Sin cambios"
      }
    },
    {
      "descripcion": "Con cambios, «Guardar cambios» los guarda",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "80"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar cambios"
          }
        }
      ],
      "espera": {
        "texto": "Cambios guardados: 80 invitados el 2026-11-14."
      }
    },
    {
      "descripcion": "Después de guardar, lo guardado es la nueva referencia",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "80"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar cambios"
          }
        },
        {
          "escribir": {
            "etiqueta": "Invitados",
            "texto": "60"
          }
        }
      ],
      "espera": {
        "texto": "Hay cambios sin guardar"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio 2, avisa antes de cerrar la pestaña si hay cambios sin guardar, como hace el editor de lecciones de esta web: un efecto que añade y quita un oyente de `beforeunload` según `conCambios` (lección 38).
2. Añade a `miniFormulario.jsx` el modo «al salir del campo»: un error aparece cuando la persona sale del campo por primera vez (`onBlur`) y, desde ahí, se revalida en cada cambio. Comprueba con el árbol que escribir sigue sin renderizar nada mientras el campo es válido.
3. En un proyecto de Vite, monta el formulario completo del cáterin con React Hook Form: `zodResolver` con el esquema de esta lección, `useFieldArray` para los platos, `useWatch` para el total y `Controller` para un `RadioGroup` de Radix (lección 80). Añade `mode: 'onTouched'` y comprueba cuándo salen los errores.
4. Envía ese formulario con `useMutation` a un servidor que responda 409 cuando la fecha ya esté ocupada, y lleva ese error a su campo con `setError('fecha', …)`. Comprueba que lo escrito se conserva y que el foco puede ir a la fecha.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "incompatible-library",
      "descripcion": "La regla del linter que marca watch(): qué es la mutabilidad interior y por qué el compilador se salta esos componentes.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Hook Form: Get Started",
      "descripcion": "Instalación, register, validación con reglas, integración con librerías de componentes y con Zod, y manejo de errores.",
      "url": "https://react-hook-form.com/get-started",
      "etiqueta": "React Hook Form"
    },
    {
      "titulo": "useFieldArray",
      "descripcion": "Las funciones para cambiar una lista de campos y sus reglas: field.id como key, objetos completos al añadir y nada de listas de valores sueltos en la versión 7.",
      "url": "https://react-hook-form.com/docs/usefieldarray",
      "etiqueta": "React Hook Form"
    },
    {
      "titulo": "FAQs: watch, useWatch, subscribe o getValues",
      "descripcion": "Qué se vuelve a renderizar con cada forma de leer un valor, cuándo usar register o Controller y qué pasa con el React Compiler.",
      "url": "https://react-hook-form.com/faqs",
      "etiqueta": "React Hook Form"
    },
    {
      "titulo": "React Hook Form with React 19",
      "descripcion": "Cómo convive con las Actions: su componente Form, useActionState y quién se encarga de enviar.",
      "url": "https://react-hook-form.com/integrations/react-19",
      "etiqueta": "React Hook Form"
    },
    {
      "titulo": "@hookform/resolvers",
      "descripcion": "El repositorio de los resolvers: Zod y una veintena de librerías más, con sus opciones (como raw) y sus avisos de versión.",
      "url": "https://github.com/react-hook-form/resolvers",
      "etiqueta": "GitHub"
    }
  ]
}
```
