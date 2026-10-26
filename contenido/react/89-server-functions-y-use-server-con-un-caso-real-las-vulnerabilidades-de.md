# Server Functions y `'use server'`, con un caso real: las vulnerabilidades de diciembre de 2025

- **Módulo:** React en el servidor
- **Slug:** `server-functions-y-use-server-con-un-caso-real-las-vulnerabilidades-de-diciembre-de-2025` (autogenerado del título)
- **Orden:** 890
- **Fuentes:** [Server Functions](https://react.dev/reference/rsc/server-functions) + [`'use server'`](https://react.dev/reference/rsc/use-server) + [Critical Security Vulnerability in RSC](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) — ver `contenido/react/TEMARIO.md` #89

---

## Qué es y para qué sirve

Hasta ahora, cada vez que una página tenía que **cambiar algo en el servidor** (guardar una reserva, borrar una opinión), tú escribías las dos mitades: un endpoint que recibe la petición y un `fetch` en el navegador que la envía, la espera y interpreta la respuesta (lecciones 52 y 57). Son dos archivos, un formato de mensaje inventado por ti y un sitio más donde equivocarse.

Una **Server Function** quita la costura: es una función `async` que se **ejecuta en el servidor** y que el código del navegador puede **importar y llamar como si fuera una función más**. React la define así: «permiten a los Client Components llamar a funciones asíncronas ejecutadas en el servidor». Lo que React hace por ti es la mitad aburrida: convertir la llamada en una petición HTTP, mandar los argumentos, ejecutar la función en el servidor y devolver el resultado.

Dos advertencias antes de empezar, porque de ellas va toda la lección:

- **Parece una llamada local y es una petición de red.** Tarda, puede fallar y los argumentos viajan por Internet.
- **Es una dirección pública de tu servidor.** Cualquiera, con el navegador o sin él, puede llamarla con los argumentos que quiera.

El ejemplo es **La Llave Inglesa**, una biblioteca de herramientas de barrio donde las socias reservan un taladro o una escalera por unos días. La lección termina con un caso real: en diciembre de 2025 se encontró un fallo gravísimo en la forma en que React procesaba justo estas peticiones.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esto necesita un framework, y aquí no se ejecuta",
  "contenido": "Como los Server Components de la lección 88, las Server Functions necesitan un bundler y un servidor que las entiendan: Next.js, o React Router en su modo experimental con Server Components. Esta web, como cualquier proyecto de Vite, no tiene servidor. Por eso los ejemplos son código anotado, y las salidas que verás son reales: monté un proyecto con Next.js 16.4.2, lo construí con next build, lo arranqué con next start y capturé las peticiones con Chromium. Next.js trae su propia copia de React (una 19.3.0 de pruebas), no la que instalas tú."
}
```

## Definir una Server Function: `'use server'`

La directiva `'use server'` marca funciones del servidor que el código del cliente puede llamar. (No marca Server Components, que no llevan directiva: lo aclaró la lección 88.) Se puede escribir de dos maneras.

**A nivel de archivo**, en la primera línea: todo lo que el archivo exporta pasa a ser una Server Function. Es la única forma de que un Client Component las **importe**. Este es el archivo de La Llave Inglesa:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// app/acciones.js\n'use server'\n\nimport { cookies } from 'next/headers'\nimport { herramientas, reservas } from '../lib/db.js'\n\nexport async function reservar(estado, formData) {\n  const socio = (await cookies()).get('socio')?.value\n  if (!socio) return { error: 'Solo los socios pueden reservar.' }\n\n  const herramienta = formData.get('herramienta')\n  const dias = Number(formData.get('dias'))\n  if (!herramientas.some((h) => h.id === herramienta)) {\n    return { error: 'Esa herramienta no existe.' }\n  }\n  if (!Number.isInteger(dias) || dias < 1 || dias > 7) {\n    return { error: 'Se puede reservar de 1 a 7 días.' }\n  }\n\n  reservas.push({ socio, herramienta, dias })\n  return { ok: `Reservado: ${herramienta} durante ${dias} días.` }\n}",
  "anotaciones": [
    {
      "fragmento": "'use server'",
      "nota": "Arriba del todo, antes de cualquier import (encima solo puede haber comentarios), con comillas simples o dobles y nunca con comillas invertidas. Desde aquí, cada función exportada de este archivo es una Server Function."
    },
    {
      "fragmento": "export async function reservar(estado, formData)",
      "nota": "Tiene que ser async: la llamada es de red y siempre devuelve una promesa. Recibe dos parámetros porque la usaremos con useActionState (lección 58): el estado anterior y el FormData del formulario. Pasada directamente a un formulario, recibiría solo el FormData."
    },
    {
      "fragmento": "(await cookies()).get('socio')?.value",
      "nota": "Quién llama sale de la sesión del servidor (aquí, una cookie), nunca de un argumento. Si la función aceptara socio como parámetro, cualquiera podría reservar en nombre de otra persona."
    },
    {
      "fragmento": "herramientas.some((h) => h.id === herramienta)",
      "nota": "Los argumentos los controla el cliente: se comparan con lo que el servidor sabe que existe, no se dan por buenos porque el desplegable solo ofrece tres opciones."
    },
    {
      "fragmento": "dias < 1 || dias > 7",
      "nota": "El input del formulario podría llevar min y max, pero eso solo ayuda a quien usa tu página. Este es el control que de verdad cuenta."
    },
    {
      "fragmento": "return { error: 'Se puede reservar de 1 a 7 días.' }",
      "nota": "Un fallo previsible (datos no válidos, sin permiso) se devuelve como valor, y la interfaz lo pinta. Throw se deja para lo inesperado. Lo devuelto tiene que poder viajar por la red."
    },
    {
      "fragmento": "reservas.push({ socio, herramienta, dias })",
      "nota": "Para esto están pensadas: cambiar datos en el servidor. En un proyecto real sería una escritura en la base de datos."
    }
  ]
}
```

**A nivel de función**, en la primera línea del cuerpo, dentro de un Server Component. Sirve para funciones pequeñas que viven junto al formulario que las usa:

```jsx
// app/page.js (un Server Component)
export default function Page() {
  async function avisarDeDevolucion(formData) {
    'use server'
    // esto se ejecuta en el servidor
  }

  return (
    <form action={avisarDeDevolucion}>
      <button type="submit">Avisar de la devolución</button>
    </form>
  )
}
```

Tres normas que React documenta y que Next.js hace cumplir al compilar. Los mensajes son reales, de Next.js 16.4.2 con Turbopack:

- **Solo funciones `async`.** Con `export function sumar(a, b)` en un archivo `'use server'`, o con una función normal con la directiva dentro, falla el build: `Server Actions must be async functions.`
- **Para importarlas desde un Client Component, la directiva va a nivel de archivo.** Una función `'use server'` escrita *dentro* de un Client Component da: `It is not allowed to define inline "use server" annotated Server Actions in Client Components.` («No se pueden definir Server Actions en línea dentro de un Client Component; expórtalas desde otro archivo con "use server" arriba, o pásalas por props desde un Server Component»).
- **La directiva va la primera.** Si escribes un `import` antes, ya no es una directiva y falla: `The "use server" directive must be at the top of the file.`

Y una nota sobre el nombre. Hasta septiembre de 2024 todo esto se llamaba «Server Actions». Hoy **Server Function** es el término general, y **Server Action** es una Server Function que se pasa a una prop `action` o se llama dentro de una acción. Verás los dos nombres en documentación y en tutoriales.

## Llamarla desde el cliente

El Client Component importa `reservar` de `acciones.js` y la usa como lo que ya sabes: la **acción de un formulario** (lección 57), con `useActionState` (lección 58) para pintar lo que devuelve:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// app/FormularioReserva.js\n'use client'\n\nimport { useActionState } from 'react'\nimport { reservar } from './acciones.js'\n\nexport default function FormularioReserva({ herramientas }) {\n  const [estado, accion, pendiente] = useActionState(reservar, null, '/')\n\n  return (\n    <>\n      <form action={accion}>\n        <label>\n          Herramienta{' '}\n          <select name=\"herramienta\">\n            {herramientas.map((h) => (\n              <option key={h.id} value={h.id}>{h.nombre}</option>\n            ))}\n          </select>\n        </label>\n        <label>\n          Días <input name=\"dias\" type=\"number\" defaultValue=\"2\" />\n        </label>\n        <button type=\"submit\" disabled={pendiente}>Reservar</button>\n      </form>\n      {estado?.error && <p role=\"alert\">{estado.error}</p>}\n      {estado?.ok && <p role=\"status\">{estado.ok}</p>}\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { reservar } from './acciones.js'",
      "nota": "Un import normal. Pero el bundler no mete el código de reservar en el navegador: pone en su lugar una referencia a la función del servidor. Más abajo lo compruebo en un build real."
    },
    {
      "fragmento": "useActionState(reservar, null, '/')",
      "nota": "El tercer argumento es el permalink (lección 58): la URL a la que viaja el formulario si se envía antes de que cargue el JavaScript. Tiene que ser una página que pinte este mismo formulario; aquí, la propia portada."
    },
    {
      "fragmento": "<form action={accion}>",
      "nota": "React llama a la acción dentro de una transición y le pasa el FormData del formulario. Cuando termina con éxito, el formulario se vacía (lección 57)."
    },
    {
      "fragmento": "disabled={pendiente}",
      "nota": "Mientras la petición está en vuelo, pendiente vale true. La llamada tarda lo que tarde la red, aunque en el código no lo parezca."
    },
    {
      "fragmento": "{estado?.error && <p role=\"alert\">{estado.error}</p>}",
      "nota": "Lo que devolvió reservar. Las dos mitades comparten solo la forma de ese objeto: { error } o { ok }."
    }
  ]
}
```

También se puede llamar **fuera de un formulario**, desde un clic, por ejemplo. La documentación pide hacerlo dentro de una **transición** (lección 51), que da el estado pendiente y deja mostrar un resultado optimista (lección 60). Los formularios ya la ponen solos:

```jsx
function manejarClic() {
  empezar(async () => {
    const total = await contarReservas()
    empezar(() => setTotal(total))
  })
}
```

(`empezar` viene de `const [consultando, empezar] = useTransition()`. El segundo `empezar` es el que ya conoces de la lección 51: lo que ocurre tras un `await` hay que volver a meterlo en una transición.)

Un último dato de uso, de la propia referencia: las Server Functions **están pensadas para cambiar datos, no para leerlos**. Los frameworks suelen procesarlas de una en una y no guardan en caché lo que devuelven. Para leer, lo de la lección 88: Server Components.

## Qué pasa de verdad: una petición HTTP

Todo lo anterior se ve como una llamada a una función. Esto es lo que ocurre al pulsar «Reservar»:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "De pulsar «Reservar» a ver el mensaje",
  "items": [
    {
      "titulo": "El cliente prepara la llamada",
      "texto": "La función que importaste no es la tuya: el bundler puso una pequeña función que conoce el identificador de la tuya. Al llamarla, React serializa los argumentos (aquí, el FormData)."
    },
    {
      "titulo": "Sale un POST a tu propio servidor",
      "texto": "Con el identificador de la función en una cabecera y los argumentos en el cuerpo. Sin ser una API que hayas diseñado: el formato lo decide React."
    },
    {
      "titulo": "El servidor decodifica el cuerpo",
      "texto": "React convierte los bytes de la petición otra vez en valores de JavaScript. Esta fase ocurre antes de que se ejecute tu función. Recuérdala: es donde falló el caso real del final."
    },
    {
      "titulo": "Se busca la función por su identificador y se ejecuta",
      "texto": "Si el identificador no existe, la respuesta es un error. Si existe, se ejecuta tu código con los argumentos decodificados: tu validación, tu comprobación de sesión, tu escritura."
    },
    {
      "titulo": "El resultado vuelve serializado",
      "texto": "React lo decodifica en el navegador, la promesa de la llamada se resuelve y la interfaz se actualiza con lo que devolvió."
    }
  ]
}
```

Esto es lo que capturé en Chromium contra el proyecto real, al pulsar «Reservar» con la herramienta «taladro» y 3 días. He acortado el identificador (en el original son 42 caracteres hexadecimales) y quitado el relleno:

```text
POST http://localhost:4891/    →  200
next-action: 60e62f66…
content-type: multipart/form-data; boundary=…
accept: text/x-component

Campos del cuerpo
  _1_$ACTION_REF_1    (vacío)
  _1_$ACTION_1:0      {"id":"60e62f66…","bound":"$@1"}
  _1_$ACTION_1:1      [null]
  _1_$ACTION_KEY      p/
  _1_herramienta      taladro
  _1_dias             3
  0                   [null,"$K1"]

Respuesta (content-type: text/x-component)
  0:{"a":"$@1","q":"","i":false,"b":"fx14o-lvMWKe7_Gz-nGwM"}
  1:{"ok":"Reservado: taladro durante 3 días.","total":1}
```

Y esto, al pulsar un botón que llama a `contarReservas()`, una función sin argumentos:

```text
POST http://localhost:4891/    →  200
next-action: 00e78ebe…
content-type: text/plain;charset=UTF-8
accept: text/x-component

Cuerpo
  []

Respuesta
  0:{"a":"$@1","q":"","i":false,"b":"fx14o-lvMWKe7_Gz-nGwM"}
  1:1
```

Qué se lee ahí, sin aprenderse el formato (es interno y puede cambiar):

- **Un `POST` a la URL de la página**, no a una ruta `/api/...` que hayas escrito tú. La cabecera `next-action` dice **qué función** quieres ejecutar. Eso es lo que Next.js usa; otros frameworks eligen otras maneras de identificarla.
- **El cuerpo son los argumentos**: los campos del formulario con el prefijo `_1_` (`herramienta`, `dias`), y `[null,"$K1"]` es la lista de argumentos de `reservar`: el estado anterior (`null`) y «el FormData número 1» (`$K1`). Con `contarReservas()` no hay argumentos y el cuerpo es `[]`.
- **La respuesta es un texto con líneas numeradas**, la misma descripción de árbol que viste en la lección 88. La línea `1:` es lo que devolvió tu función.

Y lo que **no** viaja: el código de `reservar`. Lo comprobé en el build de producción, buscando textos de la función en los archivos que se descargan:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Tras `next build`, en la carpeta .next/static (lo que se sirve al navegador):\n//   grep -rl \"Solo los socios pueden reservar\" .next/static | wc -l\n//\n// El texto «Solo los socios pueden reservar.» está en reservar(),\n// la Server Function de acciones.js.",
  "opciones": [
    "0: el cuerpo de la función se queda en el servidor",
    "1: el archivo con el código del Client Component incluye reservar",
    "Tantos como componentes importen reservar"
  ],
  "correcta": 0,
  "explicacion": "Salió 0. En .next/static solo aparece el identificador de la función, en un único archivo. El texto y la lógica de reservar están solo en .next/server. Por eso dentro de una Server Function puedes usar credenciales de la base de datos sin que lleguen al navegador. Lo que sí viaja es el identificador: cualquiera que lea el JavaScript puede ver que existe."
}
```

## Qué se puede pasar y qué se puede devolver

Como los argumentos y el resultado viajan por la red, tienen que poder escribirse en el mensaje. La referencia de `'use server'` da la lista:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Sí",
      "texto": "Cadenas, números, bigint, booleanos, undefined, null y símbolos registrados con Symbol.for. Array, Map, Set y TypedArray con valores serializables. Date. FormData. Objetos planos (los de las llaves o Object.create(Object.prototype)). Promesas. Y otras Server Functions."
    },
    {
      "titulo": "No",
      "texto": "Elementos de React o JSX, funciones que no sean Server Functions, clases e instancias de clases, objetos con prototipo null, símbolos sin registrar (Symbol(\"x\")) y eventos de manejadores."
    },
    {
      "titulo": "El resultado",
      "texto": "Lo que devuelves cumple las mismas reglas que las props que cruzan de un Server Component a un Client Component (lección 88)."
    },
    {
      "titulo": "Los errores",
      "texto": "Un fallo esperado se devuelve como valor ({ error }). Un throw rechaza la promesa en el cliente, pero sin el mensaje: lo comprobé en producción con un throw cuyo mensaje contenía una contraseña inventada. El log del servidor la tenía; el navegador recibió solo Minified React error #441, que react.dev explica como un error en el render de Server Components cuyo mensaje se omite para no filtrar detalles sensibles."
    }
  ]
}
```

Comprobé el límite en la práctica, y es menos obvio de lo que dice la tabla. Con Next.js 16.4.2 en modo desarrollo, un `Date` y un `Map` dentro de un objeto llegaron bien: el servidor recibió una fecha y un mapa de verdad. Pero una función, la instancia de una clase, un `Symbol('x')` y un elemento JSX **no dieron error al llamar**: el servidor los recibió como una **referencia temporal** que solo puede devolverse al cliente, y falla en cuanto lo tocas:

```text
Cannot access m on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client.
```

Es decir: «No puedes acceder a `m` en el servidor. No se puede entrar con un punto en una referencia temporal de cliente desde un Server Component. Solo puedes devolver ese valor al cliente». Moraleja: si la función **no puede usar** un argumento, el fallo no está donde lo pasas sino donde lo lees.

## El formulario funciona aunque no haya JavaScript

Cuando pasas una Server Function a `<form action>`, React puede hacer **mejora progresiva**: el formulario sirve ya desde el HTML que manda el servidor, sin esperar a que cargue ni se hidrate el JavaScript (lección 87). Es lo que la lección 57 prometió.

Esto es el HTML de la portada de La Llave Inglesa tal como lo sirve el servidor, sin ejecutar nada de JavaScript (abreviado):

```text
<form action="/" encType="multipart/form-data" method="POST">
  <input type="hidden" name="$ACTION_REF_1"/>
  <input type="hidden" name="$ACTION_1:0" value="{&quot;id&quot;:&quot;60e62f66…&quot;,&quot;bound&quot;:&quot;$@1&quot;}"/>
  <input type="hidden" name="$ACTION_1:1" value="[null]"/>
  <input type="hidden" name="$ACTION_KEY" value="p/"/>
  <label>Herramienta <select name="herramienta">…</select></label>
  <label>Días <input type="number" name="dias" value="2"/></label>
  <button type="submit">Reservar</button>
</form>
```

Es un **formulario HTML de toda la vida**: `method="POST"`, `enctype="multipart/form-data"`, y unos campos ocultos que dicen qué función ejecutar. Y su `action` es `/`: el **permalink** que pasaste a `useActionState`. Con el JavaScript desactivado en Chromium, rellené «Días» con 4 y pulsé «Reservar»: el navegador hizo un `POST /`, la página se recargó entera y aparecía «Reservado: taladro durante 4 días.» (y «Solo los socios pueden reservar.» en un contexto sin la cookie). Sin ni una línea de JavaScript en el navegador.

Cuando el JavaScript sí ha cargado, React intercepta el envío y usa el `fetch` de la sección anterior, sin recargar la página. Y si el usuario envía el formulario **después de que llegue el HTML y antes de que termine de hidratar**, la documentación de React dice que, con `useActionState`, el envío se *repite* una vez hidratado, para que no se pierda.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El permalink tiene que existir",
  "contenido": "Primero puse como permalink «/reservas», una ruta que no existía. Con JavaScript todo funcionó igual (la reserva se hizo y la URL no cambió), porque el envío no usa esa dirección. Pero un POST sin JavaScript a «/reservas» devolvió 409 con la cabecera x-nextjs-action-not-found y el texto «Server Action unavailable». El permalink debe ser una página que pinte el mismo formulario con la misma acción. Es el tipo de fallo que no ves nunca en desarrollo, porque tú siempre tienes JavaScript."
}
```

## Una puerta pública: valida y autoriza dentro

Hay una consecuencia de todo lo anterior, y es la que decide si una app con Server Functions es segura: **la petición no necesita tu página para existir**. Cualquiera puede escribirla a mano. Las referencias de los frameworks lo dicen sin adornos. La de React: «los argumentos de las Server Functions los controla por completo el cliente». La de React Router: «trata cada Server Function como un endpoint público». La de Next.js: es accesible «por una petición POST directa, no solo a través de la interfaz de tu aplicación».

Lo hice con el mismo proyecto, con `curl`, sin navegador ni página. La función `contarReservas` no comprueba nada (así la escribí), y la llamo sin cookie, con solo el identificador que vi en la pestaña Red:

```text
$ curl -X POST localhost:4891/ \
    -H 'Next-Action: 00e78ebe…' \
    -H 'Content-Type: text/plain;charset=UTF-8' \
    -H 'Accept: text/x-component' --data '[]'

0:{"a":"$@1","q":"","i":false,"b":"fx14o-lvMWKe7_Gz-nGwM"}
1:1
```

Contestó 1: el número de reservas, a alguien que no es socio. Y con `reservar`, sin pasar por el formulario, mandando lo que el desplegable nunca ofrecería:

```text
herramienta=motosierra  →  «Esa herramienta no existe.»
dias=99                 →  «Se puede reservar de 1 a 7 días.»
(sin cookie de socio)   →  «Solo los socios pueden reservar.»
```

No dejó pasar nada porque `reservar` valida **ella misma**. Si no lo hiciera, `motosierra` y `99` se habrían guardado. Esto es lo que toda Server Function necesita, en este orden:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "1. Quién llama",
      "texto": "Comprueba la sesión dentro de la función: una cookie, un token. Que el botón solo salga a los socios es decoración. Un redirect en la página tampoco sirve: la propia documentación de Next.js avisa de que una comprobación a nivel de página no se extiende a las Server Actions definidas en ella."
    },
    {
      "titulo": "2. Si puede hacerlo",
      "texto": "Autorización sobre este recurso concreto: que la reserva que cancela es suya, no solo que sea socio. La identidad sale de la sesión, nunca de un argumento."
    },
    {
      "titulo": "3. Qué envía",
      "texto": "Valida cada argumento con las mismas reglas que usarías para el cuerpo de una API: tipo, rango, valores permitidos. Con Zod, la lección 61 muestra cómo compartir el esquema entre cliente y servidor."
    },
    {
      "titulo": "4. Qué devuelve",
      "texto": "Solo lo que la interfaz necesita. El resultado se serializa y viaja al navegador: no devuelvas la fila entera de la base de datos si solo hace falta el nombre."
    }
  ]
}
```

Los frameworks añaden defensas, y conviene saber cuáles son para no confiar en ellas de más. En Next.js 16.4.2 comprobé tres:

- **Identificadores no adivinables.** Las funciones se identifican con un código largo, generado en cada build.
- **Código muerto fuera.** Añadí una tercera función exportada, `vaciarReservas`, que ningún componente usaba. El manifiesto de funciones del build solo contenía **dos**: la sin usar no tenía endpoint. Pero la documentación de Next.js lo cuenta como una mejora que «reduce el riesgo», no como una garantía: el día que alguien la importe, estará expuesta. Y las que sí se usan ya son públicas.
- **Comprobación del origen.** Una petición con `Origin: https://sitio-malicioso.example` hacia un servidor en `localhost:4891` se rechazó con `Invalid Server Actions request.`, y el log decía que la cabecera `x-forwarded-host` no coincidía con `origin`. Protege contra formularios en otras webs, pero no contra un `curl`, que escribe la cabecera que quiera.

Ninguna sustituye las cuatro comprobaciones de arriba. Tampoco las sustituye lo contrario: un servidor que valida pero no se actualiza, como vas a ver.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// acciones.js\n'use server'\n\nexport async function cancelarReserva(id) {\n  await db.reservas.eliminar(id)\n}\n\n// BotonCancelar.js (solo se pinta junto a las reservas del socio que ha entrado)\n'use client'\nimport { cancelarReserva } from './acciones.js'\n\nexport default function BotonCancelar({ id }) {\n  return <button onClick={() => cancelarReserva(id)}>Cancelar</button>\n}",
  "opciones": [
    "Está bien: el botón solo sale en las reservas del propio socio",
    "Cualquier persona, con o sin sesión, puede cancelar la reserva de cualquiera si adivina o recorre los id",
    "Es seguro porque cancelarReserva no devuelve nada"
  ],
  "correcta": 1,
  "explicacion": "El botón decide qué ve cada persona, no quién puede ejecutar la función. cancelarReserva es una dirección pública que acepta cualquier id y no comprueba sesión ni propiedad: es la misma situación que contarReservas en el curl de arriba, con la diferencia de que esta borra. Hay que comprobar dentro que hay sesión y que la reserva es de ese socio."
}
```

## Un caso real: CVE-2025-55182

Hasta aquí, el fallo era del programador: una función sin comprobaciones. El caso de esta sección es peor, porque **el fallo estaba en React**.

El 29 de noviembre de 2025, el investigador Lachlan Davidson comunicó al programa de recompensas de Meta una vulnerabilidad en cómo React **decodifica** las peticiones que llegan a los endpoints de Server Functions. El 3 de diciembre se publicó la corrección y el fallo se hizo público con el identificador CVE-2025-55182. En el aviso siguiente, React lo llama por su apodo, *React2Shell*.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Del aviso a la última corrección",
  "items": [
    {
      "fecha": "29 nov 2025",
      "titulo": "Lachlan Davidson lo comunica",
      "texto": "Por el programa de recompensas de Meta: un fallo que permite ejecutar código en el servidor sin autenticación."
    },
    {
      "fecha": "30 nov – 1 dic",
      "titulo": "Confirmado y arreglado",
      "texto": "Los investigadores de Meta lo confirman el 30; el 1 de diciembre hay un arreglo y empieza la coordinación con proveedores de hosting y proyectos de código abierto."
    },
    {
      "fecha": "3 dic 2025",
      "titulo": "Publicación y aviso de React",
      "texto": "Los paquetes corregidos salen en npm (19.0.1, 19.1.2 y 19.2.1) y el fallo se hace público como CVE-2025-55182, con puntuación 10,0 sobre 10. React lo describe en «Critical Security Vulnerability in React Server Components»."
    },
    {
      "fecha": "11 dic 2025",
      "titulo": "Dos fallos más al probar los parches",
      "texto": "Investigadores que intentaban saltarse la corrección encontraron una denegación de servicio (CVE-2025-55184 y 67779, 7,5) y una exposición de código fuente (CVE-2025-55183, 5,3). No permiten ejecutar código, pero 19.0.3, 19.1.4 y 19.2.3 quedaron incompletas."
    },
    {
      "fecha": "26 ene 2026",
      "titulo": "Otra denegación de servicio",
      "texto": "CVE-2026-23864 (7,5). Se corrige en 19.0.4, 19.1.5 y 19.2.4. Es el último aviso que recoge el blog de React: actualiza el post del 11 de diciembre."
    },
    {
      "fecha": "abr, may y jul 2026",
      "titulo": "Tres denegaciones de servicio más",
      "texto": "CVE-2026-23869 (8 de abril), CVE-2026-23870 (6 de mayo) y CVE-2026-44907 (21 de julio), las tres con 7,5. Cada una sube la versión mínima segura; tras la última, 19.0.8, 19.1.9 y 19.2.8. Ninguna sale en el blog de React: solo en sus avisos de seguridad de GitHub."
    },
    {
      "fecha": "14 oct 2026",
      "titulo": "Otra ejecución remota de código",
      "texto": "Aviso crítico GHSA-xqc2-xf4c-x3h3 (9,5 sobre 10): un payload preparado puede ejecutar código, aunque solo en casos muy raros (respuestas con varios typed arrays y un valor del atacante). Afecta hasta 19.0.8, 19.1.9, 19.2.8 y 19.3.0; se corrige en 19.0.9, 19.1.10, 19.2.9 y 19.3.1. El mismo día, otra denegación de servicio (8,2)."
    }
  ]
}
```

### Qué fallaba

La descripción oficial del registro del CVE: «el código vulnerable **deserializa de forma insegura** payloads de peticiones HTTP a los endpoints de Server Functions». Es el tipo de fallo que la clasificación CWE llama *deserialización de datos no confiables* (CWE-502). Su vector de CVSS, `AV:N/AC:L/PR:N/UI:N`, se lee como: se ataca **por red** (`N`), es **sencillo** (`L`), **no requiere cuenta** (`PR:N`) ni que nadie pulse nada (`UI:N`).

El aviso de React añade tres detalles que importan:

- **El ataque era una petición HTTP fabricada** a cualquier endpoint de Server Functions, y conseguía **ejecución remota de código**: correr lo que el atacante quisiera en tu servidor.
- **Aunque no hubieras escrito ninguna Server Function**, tu app podía ser vulnerable si usaba Server Components: el endpoint que decodifica existe en cuanto el framework soporta RSC.
- **Validar en tu función no lo habría evitado.** La decodificación ocurre antes de que se ejecute tu código (el paso 3 de la línea de tiempo de arriba). Las cuatro comprobaciones de la sección anterior protegen de lo que *tú* haces con los argumentos, no de cómo los lee React.

No voy a reproducir el ataque: no hace falta para aprender de él. Pero sí puedo enseñarte **el tipo de error**, porque los paquetes viejos y los corregidos están en npm. Descargué `react-server-dom-webpack` en 19.2.0 (vulnerable) y en 19.2.1 (corregida) y comparé el código del servidor. En el formato de React, una referencia dentro del cuerpo de la petición lleva una ruta de propiedades separadas por dos puntos (algo como `1:a:b`). En 19.2.0, el servidor seguía esa ruta tal cual:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// react-server-dom-webpack 19.2.0 (vulnerable), simplificado del build de desarrollo\nfunction getOutlinedModel(response, reference) {\n  reference = reference.split(\":\")   // la ruta viene en el cuerpo de la petición\n  let valor = chunk.value\n  for (let i = 1; i < reference.length; i++)\n    valor = valor[reference[i]]      // sigue cualquier nombre que ponga el cliente\n  return valor\n}\n\n// react-server-dom-webpack 19.2.1 (corregida)\nfor (let i = 1; i < reference.length; i++) {\n  const nombre = reference[i]\n  if (typeof valor === \"object\" && hasOwnProperty.call(valor, nombre))\n    valor = valor[nombre]            // solo propiedades propias del objeto\n}",
  "anotaciones": [
    {
      "fragmento": "reference = reference.split(\":\")",
      "nota": "Lo que llega en la petición es texto que decide qué propiedades se recorren. El cliente, o quien finja serlo, escribe esa ruta."
    },
    {
      "fragmento": "valor = valor[reference[i]]",
      "nota": "Un corchete con un nombre elegido por quien envía la petición alcanza también las propiedades heredadas del prototipo, como constructor, y no solo los datos que el servidor había puesto ahí. Esa es la puerta que se cerró. Cómo se encadenaba hasta ejecutar código lo han publicado los investigadores; no hace falta aquí."
    },
    {
      "fragmento": "hasOwnProperty.call(valor, nombre)",
      "nota": "La corrección: solo se sigue la ruta si el objeto tiene esa propiedad como propia. El mismo cambio está en la función que busca qué exportación de un módulo carga, que leía moduleExports[nombre] sin comprobar."
    }
  ]
}
```

Lo comprobé en los paquetes publicados. Sin la guarda `hasOwnProperty`, en el recorrido de la ruta y en la búsqueda de exportaciones del módulo, están **19.0.0, 19.1.1 y 19.2.0**. Con ella, **19.0.1, 19.1.2, 19.2.1 y también la 19.3.1** de hoy. El código es una versión simplificada del build de desarrollo, no el original completo, pero las dos comprobaciones son literales. (Es un fallo de una familia vieja: **un objeto de JavaScript tiene propiedades que tú no pusiste**. El ejercicio de esta lección lo reproduce a pequeña escala.)

### Versiones afectadas y corregidas

Los paquetes afectados son `react-server-dom-webpack`, `react-server-dom-parcel` y `react-server-dom-turbopack`. **El paquete `react` no es el vulnerable.** El aviso lista las versiones 19.0 (en el registro del CVE, 19.0.0), 19.1.0, 19.1.1 y 19.2.0, y las correcciones 19.0.1, 19.1.2 y 19.2.1: coincide con lo que dijo la lección 82 en dos líneas. Con todo lo que vino después, el cuadro a 26 de octubre de 2026 es este:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué versión de los paquetes de servidor es segura",
  "roles": [
    {
      "etiqueta": "19.0.0, 19.1.0, 19.1.1, 19.2.0",
      "rol": "Vulnerables a React2Shell",
      "descripcion": "CVE-2025-55182, puntuación 10: las del aviso del 3 de diciembre de 2025. También les afecta todo lo que vino después."
    },
    {
      "etiqueta": "19.0.1‑8, 19.1.2‑9, 19.2.1‑8, 19.3.0",
      "rol": "Vulnerables a la ejecución remota de octubre de 2026",
      "descripcion": "Cierran React2Shell, pero no el aviso crítico del 14 de octubre de 2026 (9,5) y, según la versión, tampoco las denegaciones de servicio anteriores."
    },
    {
      "etiqueta": "19.0.9, 19.1.10, 19.2.9, 19.3.1",
      "rol": "Las que React da por seguras (26 de octubre de 2026)",
      "descripcion": "Corrigen todos los avisos publicados hasta hoy. Mañana puede salir otro: lo que manda es la lista de avisos de React en GitHub, no esta tabla."
    }
  ]
}
```

### Quién estaba afectado

El aviso nombra a los frameworks y herramientas que incluían esos paquetes: **Next.js, React Router (solo con sus APIs de Server Components, que siguen siendo experimentales), Waku, `@parcel/rsc`, `@vitejs/plugin-rsc` y Redwood SDK (`rwsdk`)**. Next.js lo registró con otro número, CVE-2025-66478, que acabó **rechazado como duplicado** de CVE-2025-55182; su aviso lista las correcciones 15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, 15.5.7 y 16.0.7 para el RCE, y dice que Next.js 13, 14 estable, el Pages Router y el Edge Runtime no estaban afectados. Recomendó además **rotar los secretos** de cualquier app que estuviera en línea sin parchear. Los proveedores de hosting aplicaron mitigaciones temporales, y React avisa: no te apoyes en ellas, actualiza.

**No estaban afectados** los proyectos sin servidor ni framework con Server Components, según el propio aviso. Como todos los proyectos de este temario. Esta web, una SPA de Vite con React 19.2.4, ni siquiera tiene los paquetes `react-server-dom-*` en su `package-lock.json`: lo comprobé.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// package.json de un proyecto de Vite, como los del temario\n{\n  \"dependencies\": {\n    \"react\": \"19.2.0\",\n    \"react-dom\": \"19.2.0\"\n  }\n}\n\n// ¿Le afecta el CVE-2025-55182?",
  "opciones": [
    "Sí: 19.2.0 es una de las versiones afectadas",
    "No: el fallo estaba en los paquetes react-server-dom-*, y un proyecto de Vite sin servidor ni Server Components no los usa",
    "Sí, salvo que desactive StrictMode"
  ],
  "correcta": 1,
  "explicacion": "La versión 19.2.0 aparece en el aviso, pero como versión de los paquetes de servidor, no del paquete react. Un proyecto que solo tiene react y react-dom, y se sirve como archivos estáticos, no ejecuta nada de servidor de React. El aviso lo dice así: si tu app no usa un servidor, o no usa un framework o bundler con Server Components, no está afectada. Aun así, actualizar sigue siendo buena idea."
}
```

### Lo que enseña el caso

**1. Actualizar es seguridad.** La corrección existía el mismo día del aviso: quien la aplicó ese día cerró la ejecución remota de código; quien no, siguió expuesto. `npm audit` lo marca: con un proyecto de prueba que pedía `next@15.5.6`, el informe abre así:

```text
next  9.3.4-canary.0 - 16.3.0-preview.10
Severity: critical
Next.js is vulnerable to RCE in React flight protocol - https://github.com/advisories/GHSA-9qr9-h5gf-34mp
```

Es el informe del 21 de octubre de 2026, y lista decenas de avisos más de esas versiones. Un proyecto con Server Functions se actualiza a menudo.

Y no esperes a leerlo en el blog. De los avisos de 2026, el blog de React solo recoge el de enero; los demás, incluida una ejecución remota de código crítica el 14 de octubre, están solo en la [lista de avisos de seguridad del repositorio de React](https://github.com/react/react/security/advisories). De esa base de avisos salen las alertas de `npm audit` y de Dependabot: actívalas.

**2. El `package-lock.json` fija lo que instalas** (lección 82): te protege de una versión nueva y rota, pero también te deja en una vieja y vulnerable hasta que actualices tú. Para saber si tienes los paquetes del aviso, `npm ls react-server-dom-webpack` te lo dice en un segundo.

**3. Tu validación no sustituye al parche, ni el parche a tu validación.** Son capas distintas: React lee el mensaje, tú decides qué haces con él.

**4. Un fallo grave suele traer más.** Los investigadores revisan el código de al lado de una vulnerabilidad crítica. El propio equipo de React lo comparó con *Log4Shell* y escribió que las divulgaciones adicionales, aunque frustren, «suelen ser señal de un ciclo de respuesta sano». Lo normal es que haya que actualizar más de una vez.

Y la misma lección que dio la sección anterior desde otro ángulo: **un endpoint público, mantenido por otros, que acepta bytes de desconocidos, es superficie de ataque**. A cambio de la comodidad de llamar a una función, aceptas esa superficie. Es un intercambio legítimo, pero es mejor hacerlo sabiendo que existe.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Formularios que cambian datos",
      "texto": "Reservar, comentar, dar de baja, pagar. Una función con un FormData, con mejora progresiva y sin escribir endpoint ni fetch. Es el caso para el que nacieron."
    },
    {
      "titulo": "Acciones sueltas desde un botón",
      "texto": "Marcar como devuelto, votar, borrar. Llamadas dentro de una transición, con useOptimistic si quieres respuesta inmediata."
    },
    {
      "titulo": "Cuando no",
      "texto": "Para leer datos: usa Server Components o un loader. Para una API que consumen otras aplicaciones (móvil, terceros): una ruta HTTP de verdad (en Next.js un Route Handler, en React Router una ruta de recurso), con su contrato estable. Las Server Functions son para tu propia interfaz."
    },
    {
      "titulo": "Alternativas con otro nombre",
      "texto": "React Router en modo framework resuelve los envíos con la action de cada ruta, y TanStack Start tiene sus propias server functions, creadas con createServerFn y que no usan la directiva use server (lección 90). La idea es la misma; la API, no."
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
      "mito": "'use server' marca un Server Component",
      "realidad": "Es la confusión más repetida. 'use server' marca funciones que el cliente puede llamar. Los Server Components no llevan directiva: lo son por defecto (lección 88). Y 'use client' no es su opuesto exacto."
    },
    {
      "mito": "Una Server Function es una llamada local",
      "realidad": "Es una petición HTTP: tarda, falla, y sus argumentos y su resultado tienen que poder serializarse. Por eso la documentación pide llamarlas dentro de una transición y devolver los errores esperados como valores."
    },
    {
      "mito": "Si el botón solo lo ven las socias, la función es segura",
      "realidad": "Quien ve el botón y quien puede ejecutar la función son cosas distintas. La función está en una dirección que cualquiera puede llamar con curl. La comprobación va dentro."
    },
    {
      "mito": "Con el nombre de la función oculto nadie la llama",
      "realidad": "El identificador viaja en cada petición y en el JavaScript del cliente. Los frameworks lo hacen difícil de adivinar, pero no secreto."
    },
    {
      "mito": "El CVE-2025-55182 afectó a todo proyecto de React",
      "realidad": "Afectó a los paquetes de servidor de Server Components en cuatro versiones concretas, y por tanto a los frameworks que los incluían. Un proyecto de Vite con react y react-dom no estaba afectado."
    }
  ]
}
```

## Errores típicos

**Confiar en la validación del formulario.** `min`, `max`, `required`, el desplegable que solo ofrece tres opciones... ayudan a quien usa tu página y no frenan una petición escrita a mano. Lo viste con `curl`: `motosierra` y `99` llegaron a la función. La validación del cliente es ayuda; la del servidor es protección (lección 61).

**Aceptar quién eres como argumento.** Un `reservar(socio, herramienta, dias)` donde `socio` viene del cliente permite reservar en nombre de otra persona. La identidad sale de la sesión.

**Olvidar `async`, o poner la directiva en el sitio equivocado.** El compilador los detecta, con los mensajes de la sección «Definir una Server Function».

**Creer que una función sin usar no cuenta.** Next.js la quita de la compilación si nadie la importa, pero el día que alguien la importe estará expuesta y nadie recordará que no tenía comprobaciones. Escríbelas todas como si fueran públicas.

**Comprobar con `in` o con la verdad de un objeto.** Un servidor que valida una herramienta así, con un objeto de nombres:

```js
const herramientas = { taladro: 'Taladro percutor', lijadora: 'Lijadora orbital' }

if (!herramientas[herramienta]) return { error: 'Esa herramienta no existe.' }
```

parece correcto, pero con `herramienta === 'constructor'` pasa la comprobación, porque todo objeto hereda un `constructor`. La misma familia de error que el caso real. Se arregla con `Object.hasOwn(herramientas, herramienta)` o con un `Map`, y es el segundo error que cometerás en el ejercicio.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const herramientas = { taladro: 'Taladro percutor', lijadora: 'Lijadora orbital' }\n\nconsole.log(herramientas['taladro'])\nconsole.log(herramientas['constructor'] === undefined)\nconsole.log(Object.hasOwn(herramientas, 'constructor'))",
  "opciones": [
    "Taladro percutor, true, false",
    "Taladro percutor, false, false",
    "Taladro percutor, false, true"
  ],
  "correcta": 1,
  "explicacion": "El objeto hereda constructor de Object.prototype, así que herramientas[\"constructor\"] es una función y no undefined (false). Object.hasOwn solo mira las propiedades propias: false. Para validar un nombre que llega de fuera, hay que preguntar si es propio, no si \"hay algo\"."
}
```

## Ejercicios

En el ejercicio vas a escribir lo que **va dentro** de una Server Function: las comprobaciones. Una advertencia honesta: en la vista previa no hay servidor, así que `servidor.jsx` hace de Server Function pero se ejecuta en el navegador, y `'use server'` no tiene ningún efecto. Tampoco hay `curl`: tres botones llamarán a la acción con un `FormData` hecho a mano, saltándose las comprobaciones del formulario, que es lo que haría una petición directa. La sesión del «servidor» está en `sesion.jsx`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las comprobaciones de una Server Function",
  "consigna": "Completa reservar en servidor.jsx. Devuelve { error } con estos textos exactos: «Inicia sesión para reservar.» si no hay socio (se comprueba lo primero), «Esa herramienta no existe.» si la herramienta no es una de las tres, y «Se puede reservar de 1 a 7 días.» si los días no son un entero de 1 a 7. Prueba el formulario y los tres botones de peticiones a mano, con y sin sesión. Cuidado con los nombres que todo objeto de JavaScript ya tiene. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "servidor.jsx",
      "codigo": "'use server'\n\nimport { socioActual } from './sesion'\n\n// Aquí 'use server' no hace nada (no hay servidor); en un framework,\n// reservar sería una dirección pública de tu servidor.\nconst herramientas = {\n  taladro: 'Taladro percutor',\n  lijadora: 'Lijadora orbital',\n  escalera: 'Escalera de tijera',\n}\n\nexport async function reservar(estado, formData) {\n  const herramienta = formData.get('herramienta')\n  const dias = Number(formData.get('dias'))\n\n  // Tu trabajo: antes de aceptar la reserva, comprueba (y devuelve { error })\n  //  1. que hay un socio con la sesión iniciada (socioActual()),\n  //  2. que la herramienta existe,\n  //  3. que los días son un entero de 1 a 7.\n  return { ok: `Reservado: ${herramientas[herramienta]} durante ${dias} días.` }\n}\n"
    },
    {
      "nombre": "sesion.jsx",
      "codigo": "// Simula la cookie de sesión de un servidor real.\nlet socio = null\n\nexport function socioActual() {\n  return socio\n}\n\nexport function iniciarSesion() {\n  socio = 'Lucía'\n}\n\nexport function cerrarSesion() {\n  socio = null\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState, useState, useTransition } from 'react'\nimport { reservar } from './servidor'\nimport { iniciarSesion, cerrarSesion } from './sesion'\nimport './estilos.css'\n\n// Lo que mandaría una petición escrita a mano, sin pasar por el formulario.\nfunction datos(herramienta, dias) {\n  const formData = new FormData()\n  formData.set('herramienta', herramienta)\n  formData.set('dias', String(dias))\n  return formData\n}\n\nexport default function App() {\n  const [socio, setSocio] = useState(null)\n  const [estado, accion] = useActionState(reservar, null)\n  const [, empezar] = useTransition()\n\n  function manejarEntrada() {\n    iniciarSesion()\n    setSocio('Lucía')\n  }\n\n  function manejarSalida() {\n    cerrarSesion()\n    setSocio(null)\n  }\n\n  function enviarAMano(herramienta, dias) {\n    empezar(() => {\n      accion(datos(herramienta, dias))\n    })\n  }\n\n  return (\n    <main>\n      <h1>La Llave Inglesa</h1>\n      <p>{socio ? `Sesión de ${socio}` : 'Sin sesión'}</p>\n      <p>\n        <button onClick={manejarEntrada}>Iniciar sesión</button>{' '}\n        <button onClick={manejarSalida}>Cerrar sesión</button>\n      </p>\n\n      <form action={accion}>\n        <label>\n          Herramienta{' '}\n          <select name=\"herramienta\">\n            <option value=\"taladro\">Taladro percutor</option>\n            <option value=\"lijadora\">Lijadora orbital</option>\n            <option value=\"escalera\">Escalera de tijera</option>\n          </select>\n        </label>\n        <label>\n          Días <input name=\"dias\" type=\"number\" min=\"1\" max=\"7\" defaultValue=\"2\" />\n        </label>\n        <button type=\"submit\">Reservar</button>\n      </form>\n\n      <h2>Peticiones escritas a mano</h2>\n      <p>\n        <button onClick={() => enviarAMano('taladro', 99)}>Enviar a mano: 99 días</button>{' '}\n        <button onClick={() => enviarAMano('motosierra', 2)}>Enviar a mano: motosierra</button>{' '}\n        <button onClick={() => enviarAMano('constructor', 2)}>Enviar a mano: constructor</button>\n      </p>\n\n      {estado?.error && <p role=\"alert\">{estado.error}</p>}\n      {estado?.ok && <p role=\"status\">{estado.ok}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main { font-family: system-ui, sans-serif; max-width: 34rem; }\nlabel { display: block; margin-bottom: 0.5rem; }\nbutton { font: inherit; padding: 0.35rem 0.6rem; margin-bottom: 0.4rem; }\n[role='alert'] { color: #a40000; }\n[role='status'] { color: #1b5e20; }\n"
    }
  ],
  "archivoInicial": "servidor.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Sin sesión, reservar devuelve «Inicia sesión para reservar.»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Inicia sesión para reservar."
      }
    },
    {
      "descripcion": "Con sesión y datos válidos, la reserva se acepta",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iniciar sesión"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Reservado: Taladro percutor durante 2 días"
      }
    },
    {
      "descripcion": "Una petición a mano con 99 días se rechaza",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iniciar sesión"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar a mano: 99 días"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Se puede reservar de 1 a 7 días."
      }
    },
    {
      "descripcion": "Una herramienta inventada («motosierra») se rechaza",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iniciar sesión"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar a mano: motosierra"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Esa herramienta no existe."
      }
    },
    {
      "descripcion": "El nombre «constructor» tampoco es una herramienta",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iniciar sesión"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar a mano: constructor"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Esa herramienta no existe."
      }
    },
    {
      "descripcion": "Sin sesión, ni siquiera una petición a mano pasa: primero se comprueba quién llama",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar a mano: 99 días"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Inicia sesión para reservar."
      }
    }
  ]
}
```

Lo que la vista previa no puede enseñar es lo importante: que esas tres peticiones a mano existen *de verdad*, sin botones, para cualquiera. Para eso, los retos.

**Retos para seguir practicando** (sin comprobación automática):

1. Crea un proyecto con `npx create-next-app@latest`, escribe una Server Function que guarde un comentario y úsala como `action` de un formulario. Abre la pestaña Red del navegador, envíalo y localiza la cabecera `next-action` y el cuerpo. ¿Qué campos del formulario reconoces?
2. Con el JavaScript desactivado (en las herramientas de desarrollo de Chromium, «Disable JavaScript»), recarga y envía el formulario. ¿Sigue funcionando? Ahora pásale un permalink inexistente a `useActionState` y repite el envío sin JavaScript. ¿Qué responde el servidor?
3. Copia de la pestaña Red el valor de la cabecera `next-action` de tu función y llámala con `curl` sin cookies, como en la lección. Después añade la comprobación de sesión y repite. ¿Qué código HTTP o qué mensaje recibes?
4. Mira el `package.json` de ese proyecto y ejecuta `npm audit`. Compara la versión de `next` con las que da el aviso de Next.js sobre CVE-2025-66478. Si instalas una versión antigua a propósito en un proyecto de prueba, ¿qué informa `npm audit`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Server Functions",
      "descripcion": "La referencia de React: crearlas desde un Server Component, importarlas desde un Client Component y usarlas con acciones, formularios y useActionState.",
      "url": "https://react.dev/reference/rsc/server-functions",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "'use server'",
      "descripcion": "La directiva a fondo: dónde se escribe, qué se puede serializar, las consideraciones de seguridad y las llamadas fuera de un formulario.",
      "url": "https://react.dev/reference/rsc/use-server",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Critical Security Vulnerability in React Server Components",
      "descripcion": "El aviso oficial del 3 de diciembre de 2025: paquetes y versiones afectados, frameworks, instrucciones de actualización y cronología.",
      "url": "https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Denial of Service and Source Code Exposure in React Server Components",
      "descripcion": "Los dos avisos posteriores (11 de diciembre de 2025, actualizado el 26 de enero de 2026) y las versiones que se consideran seguras.",
      "url": "https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Avisos de seguridad de React",
      "descripcion": "La lista oficial del repositorio: cada aviso con sus paquetes, versiones afectadas y corregidas, y gravedad. Aquí salen avisos que el blog no publica.",
      "url": "https://github.com/react/react/security/advisories",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "CVE-2025-55182",
      "descripcion": "El registro oficial del CVE: descripción, versiones afectadas y puntuación CVSS.",
      "url": "https://www.cve.org/CVERecord?id=CVE-2025-55182",
      "etiqueta": "CVE"
    },
    {
      "titulo": "Data Security (Next.js)",
      "descripcion": "Cómo protege Next.js las Server Actions, qué no hace por ti y por qué hay que autenticar y autorizar dentro de cada una.",
      "url": "https://nextjs.org/docs/app/guides/data-security",
      "etiqueta": "Next.js"
    }
  ]
}
```
