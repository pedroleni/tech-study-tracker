# Autenticación en una SPA: sesión, rutas protegidas y dónde guardar el token

- **Módulo:** Calidad y producción
- **Slug:** `autenticacion-en-una-spa-sesion-rutas-protegidas-y-donde-guardar-el-token` (autogenerado del título)
- **Orden:** 825
- **Fuentes:** [useContext](https://react.dev/reference/react/useContext) + [Navigate](https://reactrouter.com/api/components/Navigate) + [QueryClient](https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient) + [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) + [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie) — ver `contenido/react/TEMARIO.md` #102

---

## Qué es y para qué sirve

La Marmita es una sociedad gastronómica de Bilbao: un local con cocina y mesas largas donde los socios cocinan para su cuadrilla. Su web tiene tres zonas. Una portada que ve cualquiera; «Mis reservas», donde cada socio ve las suyas; y «Cuentas de la sociedad», solo para la junta. Para las dos últimas hace falta **una pantalla de entrada**, como en casi cualquier aplicación profesional.

Las piezas ya las tienes repartidas por el temario: el contexto (lección 28), las rutas (77), la caché de TanStack Query (78), el XSS (82), cómo lo resuelve esta misma web con Supabase (86) y la autorización en el servidor (89). Aquí **las montas juntas, de principio a fin**, en el lado del cliente:

- la sesión como una máquina de tres estados;
- un proveedor de contexto con `usuario`, `entrar` y `salir`;
- el formulario de entrada, con sus errores;
- rutas protegidas que te devuelven a la página que pediste;
- un cierre de sesión que no deja datos del usuario anterior;
- un 401 en cualquier petición que cierra la sesión;
- y la pregunta que siempre sale: dónde se guarda el token.

Antes de empezar, dos palabras que conviene separar. **Autenticación** es saber quién eres: entrar con tu correo y tu contraseña. **Autorización** es decidir qué puedes hacer: Amaia ve sus reservas, y las cuentas solo las ve la junta. Las dos las decide el servidor; el cliente solo puede hacer que la experiencia sea buena. Escribir ese servidor es cosa del temario de Node.js; aquí lo usas.

Este es el recorrido de una sesión, de la carga de la app a la salida:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "La vida de una sesión en una SPA",
  "items": [
    {
      "fecha": "Al cargar",
      "titulo": "Comprobando",
      "texto": "La app acaba de arrancar y no sabe si hay sesión. Le pregunta al servidor quién eres."
    },
    {
      "fecha": "Sin sesión",
      "titulo": "Anónimo",
      "texto": "El servidor no te reconoce. Se ve el formulario, o la ruta protegida te manda a él."
    },
    {
      "fecha": "Al entrar",
      "titulo": "El servidor te da una credencial",
      "texto": "Comprueba tu contraseña y te entrega una cookie de sesión o un token."
    },
    {
      "fecha": "Con sesión",
      "titulo": "Cada petición la lleva",
      "texto": "La cookie viaja sola; un token lo pone tu código en la cabecera Authorization."
    },
    {
      "fecha": "Un 401",
      "titulo": "La credencial ya no vale",
      "texto": "Caducó o la revocaron. La app vuelve a anónimo y te pide que entres otra vez."
    },
    {
      "fecha": "Al salir",
      "titulo": "Dos limpiezas",
      "texto": "El servidor invalida la sesión y el navegador borra todo lo que guardó de ese usuario."
    }
  ]
}
```

### El servidor de esta lección

La vista previa solo trae React: no hay servidor, ni React Router, ni TanStack Query. Así que esta lección hace lo mismo que las lecciones 76-78 y la 89:

- **Los bloques en vivo llevan un archivo `Servidor.jsx`** que contesta a `fetch` como lo haría una API, con un panel debajo que enseña cada petición con su código y un botón «Caducar la sesión». No hace falta que lo leas. Lo que guarda en memoria (sesiones y cookie) se pierde al editar el código o recargar la vista previa. El panel de red de la vista previa solo ve las peticiones que llegan a los datos (reservas y cuentas), con su latencia y su botón para fallar; las de la sesión las contesta `Servidor.jsx` y salen en su propio panel.
- **El código con React Router y TanStack Query va en bloques de código anotado.** Todo se ejecutó en un proyecto de pruebas con React 19.3.1, React Router 8.5.0 (publicada el 19 de octubre de 2026) y TanStack Query 5.105.0 (publicada el 26 de octubre de 2026), con jsdom y un servidor simulado igual que este. Las salidas que verás son las de esas pruebas.
- **Al final lo conectas a una API real**: la del proyecto 52 de Node.js.

El servidor de La Marmita entiende cinco peticiones:

- `POST /api/entrar` con `{ correo, clave }`: si son correctos, responde `200` con `{ id, nombre, junta }` y deja una **cookie de sesión** en el navegador. Si no, `401`.
- `GET /api/yo`: quién eres según esa cookie, o `401`.
- `POST /api/salir`: borra la sesión en el servidor y la cookie.
- `GET /api/reservas`: tus reservas (solo las tuyas), o `401`.
- `GET /api/cuentas`: las cuentas, si eres de la junta. Si no lo eres, `403`; sin sesión, `401`.

Hay dos socios de prueba: **Amaia** (`amaia@ejemplo.es`, contraseña `marmitako`) y **Koldo** (`koldo@ejemplo.es`, contraseña `txangurro`), que es de la junta.

La cookie se comporta como una cookie `httpOnly` de verdad: **el navegador la guarda y la manda sola en cada petición, y tu JavaScript no puede leerla**. Por eso en el código de la app no verás ningún token, solo `fetch`. Por qué conviene así, y qué cambia si el servidor te da un token, lo verás en «Dónde guardar el token».

## La sesión tiene tres estados, no dos

Lo primero que se le ocurre a casi todo el mundo es `const [usuario, setUsuario] = useState(null)`: `null` es que no hay nadie y un objeto es que hay alguien. Dos estados. **Falta uno: el de antes de saberlo.**

Al recargar la página, el estado de React empieza de cero. La cookie sigue en el navegador, pero hasta que el servidor conteste a `GET /api/yo`, la app no sabe si es tuya. Con dos estados, esa espera se pinta como «no hay nadie»:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function ProveedorSesion({ children }) {\n  const [usuario, setUsuario] = useState(null)\n\n  useEffect(() => {\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .then(setUsuario)\n  }, [])\n  // ... lo reparte con un contexto\n}\n\nfunction Cabecera() {\n  const { usuario } = useSesion()\n  return usuario ? <p>Hola, {usuario.nombre}</p> : <a href=\"/entrar\">Entrar</a>\n}\n\n// Amaia entró ayer y su cookie sigue siendo válida.\n// Recarga la página y el servidor tarda 400 ms en contestar.\n// ¿Qué ve en la cabecera?",
  "opciones": [
    "«Hola, Amaia» desde el primer momento",
    "«Entrar» durante unos 400 ms, y después «Hola, Amaia»",
    "«Entrar» hasta que vuelva a escribir su contraseña"
  ],
  "correcta": 1,
  "explicacion": "El primer render ocurre antes de que llegue ninguna respuesta, y en ese momento usuario vale null: para la cabecera, eso es que no hay nadie. Cuando contesta /api/yo, se arregla. Es el parpadeo de «no has iniciado sesión». En una cabecera solo molesta; en una ruta protegida es peor, porque en ese primer render redirige a /entrar y la página que pediste se pierde."
}
```

La solución es **un tercer estado, «comprobando»**, que no es ni sí ni no. Mientras dura, la app no enseña ni el formulario ni los datos: enseña un aviso, o nada. Es la idea de la lección 23, escribir primero la lista de estados posibles. Y también la de la 24: mejor **un solo estado con un campo que diga en cuál estás** que dos variables (`cargando` y `usuario`) que podrían contradecirse.

```js
{ estado: 'comprobando', usuario: null }
{ estado: 'anonimo', usuario: null }
{ estado: 'con-sesion', usuario: { id: 1, nombre: 'Amaia', junta: false } }
```

Y estas son las únicas transiciones:

- `comprobando` → `con-sesion` o `anonimo`, cuando contesta `GET /api/yo`. Pasa una sola vez, al cargar la app.
- `anonimo` → `con-sesion`, al entrar.
- `con-sesion` → `anonimo`, al salir o cuando una petición vuelve con un 401.

Nunca se vuelve a `comprobando` sin recargar: es el estado de no saber, y una vez que sabes, sabes.

## Un proveedor de sesión con contexto

La sesión la necesitan la cabecera, las rutas protegidas, el formulario y casi todas las peticiones: es el caso de libro del contexto de la lección 28. **Un componente proveedor guarda la sesión una sola vez y la reparte**, y los demás la leen con un Hook propio, `useSesion`. En inglés lo verás casi siempre como `AuthProvider` y `useAuth`; aquí sigue la convención del temario, como `ProveedorTema` en la 28 o `ProveedorTareas` en la 29.

La lección 86 contaba que esta misma web no lo hace así: tiene un Hook `useAuth` con su propio `useState` y su propia suscripción a Supabase en cada componente que lo llama, y proponía como mejora un `AuthProvider`. Este es uno para la API de La Marmita; con Supabase cambiarían las llamadas, no la forma:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\nconst COMPROBANDO = { estado: 'comprobando', usuario: null }\nconst ANONIMO = { estado: 'anonimo', usuario: null }\n\nexport function ProveedorSesion({ children }) {\n  const [sesion, setSesion] = useState(COMPROBANDO)\n\n  // Al cargar la app: ¿el servidor me reconoce?\n  useEffect(() => {\n    let ignorar = false\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .catch(() => null)\n      .then((usuario) => {\n        if (ignorar) return\n        setSesion(usuario ? { estado: 'con-sesion', usuario } : ANONIMO)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [])\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/entrar', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ correo, clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    setSesion({ estado: 'con-sesion', usuario: await respuesta.json() })\n  }\n\n  async function salir() {\n    await fetch('/api/salir', { method: 'POST' })\n    setSesion(ANONIMO)\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  const valor = useContext(SesionContext)\n  if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')\n  return valor\n}",
  "anotaciones": [
    {
      "fragmento": "const COMPROBANDO = { estado: 'comprobando', usuario: null }",
      "nota": "Los tres estados, como objetos fijos. El de partida es siempre comprobando: al montarse, la app no sabe nada de la sesión."
    },
    {
      "fragmento": "fetch('/api/yo')",
      "nota": "La pregunta al servidor: ¿de quién es esta cookie? La cookie viaja sola, así que no hay que añadir nada a la petición. Contesta con el usuario o con un 401."
    },
    {
      "fragmento": ".catch(() => null)",
      "nota": "Si la red falla, la app se da por anónima. Una app más cuidadosa distinguiría este caso con un aviso y un botón «Reintentar»: no es lo mismo «no hay sesión» que «no sé si hay sesión»."
    },
    {
      "fragmento": "let ignorar = false",
      "nota": "La bandera de las lecciones 40 y 42. En desarrollo, StrictMode monta, desmonta y vuelve a montar (lección 63): en el panel del servidor verás dos GET /api/yo, y solo cuenta la respuesta del segundo montaje."
    },
    {
      "fragmento": "if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')",
      "nota": "Al entrar, un 401 no significa que la sesión haya caducado, sino que la contraseña está mal. El mensaje no dice cuál de los dos campos falla: el servidor tampoco lo dice, a propósito, para no confirmar qué correos existen (lo explica el proyecto 52 de Node.js)."
    },
    {
      "fragmento": "await fetch('/api/salir', { method: 'POST' })",
      "nota": "Salir también es cosa del servidor: tiene que invalidar la sesión y borrar la cookie, que el JavaScript no puede tocar. Lo que tiene que borrar el navegador lo verás en «Cerrar sesión de verdad»."
    },
    {
      "fragmento": "<SesionContext value={{ ...sesion, entrar, salir }}>",
      "nota": "Un objeto nuevo en cada render: la trampa de la lección 28, todos los que leen el contexto se vuelven a renderizar cuando lo hace el proveedor. Aquí cambia pocas veces (al entrar y al salir), así que no compensa memorizarlo (lección 67)."
    },
    {
      "fragmento": "if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')",
      "nota": "Un error claro si alguien usa useSesion fuera del proveedor, en vez de un «Cannot read properties of null» lejos de la causa."
    }
  ]
}
```

Con él montado, el resto de la app pregunta por `estado` y no por `usuario`. En el ejemplo, la columna de la izquierda usa los tres estados y la de la derecha hace lo del predice: mira solo `usuario`. Las dos leen **el mismo contexto**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La sesión de La Marmita, en tres estados",
  "consigna": "Entra con amaia@ejemplo.es y marmitako. Después pulsa «Recargar la página», que vuelve a montar la app como una recarga de verdad: el estado de React se pierde y la cookie se queda. Mira las dos columnas durante los 400 ms que tarda /api/yo. Por último, pulsa «Salir» y recarga otra vez.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { ProveedorSesion, useSesion } from './Sesion'\nimport Entrar from './Entrar'\nimport { PanelServidor } from './Servidor'\nimport './estilos.css'\n\nfunction ConTresEstados() {\n  const { estado, usuario, salir } = useSesion()\n\n  if (estado === 'comprobando') return <p role=\"status\">Comprobando sesión…</p>\n  if (estado === 'anonimo') return <Entrar />\n  return (\n    <>\n      <p>Hola, {usuario.nombre}.</p>\n      <button onClick={salir}>Salir</button>\n    </>\n  )\n}\n\n// Lo que haría un componente que solo mira usuario\nfunction SoloUsuario() {\n  const { usuario } = useSesion()\n  return usuario ? <p>Hola, {usuario.nombre}.</p> : <p>No has iniciado sesión.</p>\n}\n\nexport default function App() {\n  const [cargas, setCargas] = useState(0)\n\n  return (\n    <>\n      <main>\n        <h1>Sociedad gastronómica La Marmita</h1>\n        <button onClick={() => setCargas((n) => n + 1)}>Recargar la página</button>\n        <ProveedorSesion key={cargas}>\n          <div className=\"dos-lecturas\">\n            <section className=\"lectura\">\n              <h2>Con tres estados</h2>\n              <ConTresEstados />\n            </section>\n            <section className=\"lectura\">\n              <h2>Mirando solo usuario</h2>\n              <SoloUsuario />\n            </section>\n          </div>\n        </ProveedorSesion>\n      </main>\n      <PanelServidor />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Sesion.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\nconst COMPROBANDO = { estado: 'comprobando', usuario: null }\nconst ANONIMO = { estado: 'anonimo', usuario: null }\n\nexport function ProveedorSesion({ children }) {\n  const [sesion, setSesion] = useState(COMPROBANDO)\n\n  // Al cargar la app: ¿el servidor me reconoce?\n  useEffect(() => {\n    let ignorar = false\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .catch(() => null)\n      .then((usuario) => {\n        if (ignorar) return\n        setSesion(usuario ? { estado: 'con-sesion', usuario } : ANONIMO)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [])\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/entrar', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ correo, clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    setSesion({ estado: 'con-sesion', usuario: await respuesta.json() })\n  }\n\n  async function salir() {\n    await fetch('/api/salir', { method: 'POST' })\n    setSesion(ANONIMO)\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  const valor = useContext(SesionContext)\n  if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')\n  return valor\n}\n"
    },
    {
      "nombre": "Entrar.jsx",
      "codigo": "import { useActionState } from 'react'\nimport { useSesion } from './Sesion'\n\nexport default function Entrar() {\n  const { entrar } = useSesion()\n  const [resultado, accionEntrar, enviando] = useActionState(\n    async (anterior, datos) => {\n      const correo = datos.get('correo')\n      try {\n        await entrar(correo, datos.get('clave'))\n        return { error: null, correo: '' }\n      } catch (error) {\n        return { error: error.message, correo }\n      }\n    },\n    { error: null, correo: '' },\n  )\n\n  return (\n    <form action={accionEntrar} className=\"entrar\">\n      <label>\n        Correo\n        <input name=\"correo\" type=\"email\" autoComplete=\"username\" defaultValue={resultado.correo} required />\n      </label>\n      <label>\n        Contraseña\n        <input name=\"clave\" type=\"password\" autoComplete=\"current-password\" required />\n      </label>\n      {resultado.error && <p role=\"alert\">{resultado.error}</p>}\n      <button disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>\n      <p className=\"pista\">amaia@ejemplo.es / marmitako (socia) · koldo@ejemplo.es / txangurro (junta)</p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Servidor.jsx",
      "codigo": "// Este archivo hace de servidor dentro de la vista previa: contesta a las\n// peticiones a /api/ como lo haría tu API. No hace falta que lo leas.\nimport { useSyncExternalStore } from 'react'\n\nconst LATENCIA = 400\nconst SOCIOS = [\n  { id: 1, correo: 'amaia@ejemplo.es', clave: 'marmitako', nombre: 'Amaia', junta: false },\n  { id: 2, correo: 'koldo@ejemplo.es', clave: 'txangurro', nombre: 'Koldo', junta: true },\n]\nconst sesiones = new Map()\n// La cookie httpOnly: el navegador la guarda y la envía sola en cada\n// petición, pero tu JavaScript no puede leerla. Aquí la simula esta variable.\nlet cookie = null\nlet registro = []\nconst oyentes = new Set()\n\nfunction anotar(linea) {\n  registro = [...registro, linea].slice(-4)\n  oyentes.forEach((avisar) => avisar())\n}\n\n// El fetch de la vista previa, con los datos de la API simulada. Si este\n// archivo se vuelve a cargar, se toma el de debajo para no envolverlo dos veces.\nconst fetchDatos = window.fetch.fetchDatos ?? window.fetch\nconst responder = (datos, status = 200) =>\n  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } })\nconst publico = ({ id, nombre, junta }) => ({ id, nombre, junta })\n\nasync function atender(metodo, ruta, cuerpo) {\n  await new Promise((r) => setTimeout(r, LATENCIA))\n  if (metodo === 'POST' && ruta === '/api/entrar') {\n    const socio = SOCIOS.find((s) => s.correo === cuerpo.correo && s.clave === cuerpo.clave)\n    if (!socio) return responder({ error: 'Credenciales inválidas' }, 401)\n    cookie = 'sesion-' + Math.random().toString(36).slice(2)\n    sesiones.set(cookie, socio)\n    return responder(publico(socio))\n  }\n  if (metodo === 'POST' && ruta === '/api/salir') {\n    sesiones.delete(cookie)\n    cookie = null\n    return responder({ ok: true })\n  }\n  const socio = sesiones.get(cookie)\n  if (!socio) return responder({ error: 'Sesión ausente o caducada' }, 401)\n  if (ruta === '/api/yo') return responder(publico(socio))\n  if (ruta === '/api/cuentas' && !socio.junta) return responder({ error: 'Solo para la junta' }, 403)\n  const respuesta = await fetchDatos(ruta)\n  if (!respuesta.ok) return respuesta\n  const filas = await respuesta.json()\n  return responder(ruta === '/api/reservas' ? filas.filter((f) => f.socioId === socio.id) : filas)\n}\n\nasync function servidor(ruta, opciones = {}) {\n  const metodo = opciones.method ?? 'GET'\n  const respuesta = await atender(metodo, ruta, opciones.body ? JSON.parse(opciones.body) : {})\n  anotar(`${metodo} ${ruta} → ${respuesta.status}`)\n  return respuesta\n}\nservidor.fetchDatos = fetchDatos\nwindow.fetch = servidor\n\nfunction caducar() {\n  sesiones.clear()\n  anotar('(el servidor da por caducadas todas las sesiones)')\n}\n\nexport function PanelServidor() {\n  const lineas = useSyncExternalStore(\n    (avisar) => {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    () => registro,\n  )\n  return (\n    <aside className=\"servidor\" aria-label=\"Servidor simulado\">\n      <p>\n        Servidor simulado · cookie de sesión: {cookie ? 'guardada' : 'ninguna'}{' '}\n        <button onClick={caducar}>Caducar la sesión</button>\n      </p>\n      <pre>{lineas.join('\\n') || 'Sin peticiones todavía'}</pre>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nmain,\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n/* La web de La Marmita */\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nheader nav {\n  display: flex;\n  gap: 1rem;\n}\n\nheader p {\n  margin: 0.4rem 0;\n}\n\na {\n  color: #9a3412;\n}\n\n.entrar {\n  display: grid;\n  gap: 0.5rem;\n  max-width: 18rem;\n}\n\n.entrar label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.pista {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n.dos-lecturas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));\n  gap: 0.75rem;\n}\n\n.lectura {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.lectura h2 {\n  margin-top: 0;\n  font-size: 0.95rem;\n}\n\n/* El servidor simulado */\n.servidor {\n  margin: 0.75rem 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #64748b;\n  border-radius: 8px;\n  background: #f1f5f9;\n  font-size: 0.85rem;\n}\n\n.servidor p {\n  margin: 0;\n}\n\n.servidor pre {\n  margin: 0.4rem 0 0;\n  white-space: pre-wrap;\n}\n"
    }
  ],
  "archivoInicial": "Sesion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "socioId": 1,
        "texto": "Cena del jueves · 8 comensales"
      },
      {
        "id": 2,
        "socioId": 1,
        "texto": "Txoko libre el domingo · 4 comensales"
      },
      {
        "id": 3,
        "socioId": 2,
        "texto": "Comida del sábado · 12 comensales"
      }
    ],
    "cuentas": [
      {
        "id": 1,
        "texto": "Cuotas de octubre: 18 de 20 socios al día"
      },
      {
        "id": 2,
        "texto": "Bodega: 340 € en txakoli y rioja alavesa"
      }
    ]
  }
}
```

Durante la comprobación, la columna de la izquierda dice «Comprobando sesión…» y la de la derecha, «No has iniciado sesión.», que es falso: la cookie seguía ahí. Las dos reciben lo mismo; la de la derecha **ignora el estado `comprobando`**, y eso basta para mentir durante 400 ms.

En el panel del servidor ves las últimas peticiones: `GET /api/yo → 401` al cargar sin sesión, `POST /api/entrar → 200` al entrar, `GET /api/yo → 200` al recargar con la cookie, y `POST /api/salir → 200` al salir, después de lo cual «cookie de sesión» pasa a «ninguna».

## El formulario de entrada y sus errores

El formulario es pequeño, pero tiene detalles que se notan enseguida: que no se borre el correo si te equivocas, que el gestor de contraseñas lo rellene, que no se pueda enviar dos veces, que el error se anuncie. **Una acción con `useActionState` (lección 58) basta**: es el caso en que no compensa una librería, como verás en la lección «Formularios grandes con React Hook Form (y cuándo te basta una Action)».

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useActionState } from 'react'\nimport { useSesion } from './Sesion'\n\nexport default function Entrar() {\n  const { entrar } = useSesion()\n  const [resultado, accionEntrar, enviando] = useActionState(\n    async (anterior, datos) => {\n      const correo = datos.get('correo')\n      try {\n        await entrar(correo, datos.get('clave'))\n        return { error: null, correo: '' }\n      } catch (error) {\n        return { error: error.message, correo }\n      }\n    },\n    { error: null, correo: '' },\n  )\n\n  return (\n    <form action={accionEntrar} className=\"entrar\">\n      <label>\n        Correo\n        <input name=\"correo\" type=\"email\" autoComplete=\"username\" defaultValue={resultado.correo} required />\n      </label>\n      <label>\n        Contraseña\n        <input name=\"clave\" type=\"password\" autoComplete=\"current-password\" required />\n      </label>\n      {resultado.error && <p role=\"alert\">{resultado.error}</p>}\n      <button disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>\n      <p className=\"pista\">amaia@ejemplo.es / marmitako (socia) · koldo@ejemplo.es / txangurro (junta)</p>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "useActionState(",
      "nota": "La acción recibe el FormData y devuelve el siguiente resultado; enviando dice si está en marcha (lección 58). El error de entrar se convierte en un resultado, no en una excepción que acabaría en un error boundary."
    },
    {
      "fragmento": "return { error: error.message, correo }",
      "nota": "Si falla, se devuelve el correo para usarlo como defaultValue: cuando React reinicia el formulario al acabar la acción, el campo vuelve a lo que habías escrito (lección 61). La contraseña no se devuelve: se vacía y no se queda guardada en ningún estado."
    },
    {
      "fragmento": "autoComplete=\"username\"",
      "nota": "Le dice al gestor de contraseñas del navegador que este campo es el nombre de la cuenta, aunque sea un correo. Con current-password en el otro campo, puede rellenar los dos y guardar la contraseña nueva cuando cambie."
    },
    {
      "fragmento": "{resultado.error && <p role=\"alert\">{resultado.error}</p>}",
      "nota": "Con role alert, un lector de pantalla anuncia el error en cuanto aparece (lección 37)."
    },
    {
      "fragmento": "<button disabled={enviando}>",
      "nota": "Desactivado mientras se envía: un doble clic no manda dos intentos. Y su texto cambia a «Entrando…» para que se note que algo pasa."
    }
  ]
}
```

Los errores que puede ver alguien al entrar son de tres tipos, y cada uno merece su mensaje:

- **Del navegador**: `type="email"` y `required` paran un formulario vacío o un correo mal escrito antes de enviarlo (lección 61).
- **De credenciales**: un `401` al entrar. «Correo o contraseña incorrectos.», sin decir cuál de los dos.
- **Del servidor o de la red**: cualquier otro fallo. «No se ha podido entrar. Inténtalo de nuevo.» No culpes a la contraseña de lo que es un 500.

Comprobado con React 19.3.1: con una contraseña mala, el formulario enseña «Correo o contraseña incorrectos.», conserva el correo y deja la contraseña vacía.

## Rutas protegidas que te devuelven a donde ibas

Una ruta protegida es una ruta de diseño (lección 77) que mira la sesión antes de pintar a sus hijas. Tiene que contemplar **los tres estados**, y hacer una cosa más: **acordarse de la página que pediste**, para devolverte a ella cuando entres. Con React Router, se escribe así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Navigate, Outlet, useLocation } from 'react-router'\nimport { useSesion } from './Sesion.jsx'\n\nexport default function RutaProtegida() {\n  const { estado } = useSesion()\n  const location = useLocation()\n\n  if (estado === 'comprobando') {\n    return <p role=\"status\">Comprobando sesión…</p>\n  }\n  if (estado === 'anonimo') {\n    return <Navigate to=\"/entrar\" replace state={{ desde: location }} />\n  }\n  return <Outlet />\n}\n\n// App.jsx: las rutas protegidas cuelgan de RutaProtegida\n<Routes>\n  <Route index element={<Portada />} />\n  <Route path=\"entrar\" element={<Entrar />} />\n  <Route element={<RutaProtegida />}>\n    <Route path=\"reservas\" element={<MisReservas />} />\n  </Route>\n</Routes>",
  "anotaciones": [
    {
      "fragmento": "if (estado === 'comprobando') {",
      "nota": "Ni dejar pasar ni echar: esperar. Sin esto, quien recarga /reservas acaba en /entrar aunque su cookie siga valiendo. Es lo que hace AdminRoute en la lección 86 con su loading."
    },
    {
      "fragmento": "<Navigate to=\"/entrar\" replace state={{ desde: location }} />",
      "nota": "Navigate navega en cuanto se pinta. replace sustituye /reservas por /entrar en el historial, para que Atrás no te devuelva a una página que te vuelve a echar. state viaja con la navegación, guardado en history.state y no en la URL: aquí, la ubicación de la que venías. En inglés casi siempre lo verás como state.from."
    },
    {
      "fragmento": "return <Outlet />",
      "nota": "Con sesión, se pintan las rutas hijas, como en cualquier ruta de diseño."
    },
    {
      "fragmento": "<Route element={<RutaProtegida />}>",
      "nota": "Una ruta sin path que envuelve a todas las protegidas: una sola comprobación para todas, como ProtectedRoute en la lección 86."
    }
  ]
}
```

Y la página de entrar lee ese `state` para saber adónde volver:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useActionState } from 'react'\nimport { useLocation, useNavigate } from 'react-router'\nimport { useSesion } from './Sesion.jsx'\n\nexport default function Entrar() {\n  const { entrar } = useSesion()\n  const navigate = useNavigate()\n  const location = useLocation()\n  const desde = location.state?.desde ?? '/reservas'\n\n  const [resultado, accionEntrar, enviando] = useActionState(\n    async (anterior, datos) => {\n      const correo = datos.get('correo')\n      try {\n        await entrar(correo, datos.get('clave'))\n      } catch (error) {\n        return { error: error.message, correo }\n      }\n      navigate(desde, { replace: true })\n      return { error: null, correo: '' }\n    },\n    { error: null, correo: '' },\n  )\n  // ... el mismo formulario de antes\n}",
  "anotaciones": [
    {
      "fragmento": "const desde = location.state?.desde ?? '/reservas'",
      "nota": "Lo que dejó la ruta protegida. Si alguien abre /entrar directamente, o desde un marcador, no hay state, y se va a una página por defecto."
    },
    {
      "fragmento": "navigate(desde, { replace: true })",
      "nota": "desde es un objeto de ubicación, con su búsqueda: navigate lo acepta como destino. Con replace, la entrada de /entrar desaparece del historial y Atrás no vuelve al formulario."
    }
  ]
}
```

Esto es lo que salió al ejecutarlo con React Router 8.5.0, en un historial con la portada y después `/reservas?mes=11`, sin sesión:

```text
tras redirigir:     /entrar
tras entrar:        /reservas?mes=11
tras pulsar Atrás:  /
al recargar con la cookie: «Comprobando sesión…» y después Mis reservas
peticiones:         GET /api/yo | GET /api/yo | POST /api/entrar | GET /api/reservas
```

Vuelve con la búsqueda incluida, Atrás te lleva a la página de antes y no al formulario, y al recargar con la cookie no hay ni rastro de `/entrar`. Los dos `GET /api/yo` son los de StrictMode.

¿Por qué `replace` en los dos sitios? Porque sin él, el historial se llena de pasos que nadie quiere repetir:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// En RutaProtegida, sin replace:\nreturn <Navigate to=\"/entrar\" state={{ desde: location }} />\n\n// En Entrar, después de entrar, también sin replace:\nnavigate(desde)\n\n// El historial es: portada → /reservas. No hay sesión, así que la\n// ruta protegida te lleva a /entrar. Entras y vuelves a /reservas.\n// Pulsas Atrás una vez. ¿Dónde acabas?",
  "opciones": [
    "En la portada",
    "En /entrar, con el formulario, aunque ya has entrado",
    "En /reservas otra vez, sin moverte"
  ],
  "correcta": 1,
  "explicacion": "Sin replace, cada navegación añade una entrada: portada, /reservas, /entrar, /reservas. Atrás te deja en /entrar, pidiéndote una contraseña que ya pusiste. Comprobado con React Router 8.5.0. Con replace en los dos sitios, el historial queda en portada y /reservas, y Atrás te lleva a la portada."
}
```

Un dato real: **esta web no te devuelve a donde ibas**. Su `ProtectedRoute` manda a `/login` sin `state`, y después de entrar, el formulario hace `navigate('/')` (lo dice su código, en `src/components/auth/`). Si abres tus favoritos sin sesión, entras y acabas en la portada.

### Con el modo datos, en el `loader`

React Router tiene otra forma de trabajar, el modo datos, en el que cada ruta puede cargar lo que necesita antes de pintarse. Lo verás entero en la lección «El router también carga y envía datos: `loader`, `action` y errores de ruta». Para proteger rutas cambia el sitio de la comprobación: **va en el `loader` de una ruta madre, que lanza un `redirect`** antes de que se pinte nada.

```jsx
import { createBrowserRouter, redirect } from 'react-router'

// Se ejecuta antes de pintar cualquiera de sus rutas hijas
async function exigirSesion({ request }) {
  const respuesta = await fetch('/api/yo')
  if (respuesta.status === 401) {
    const { pathname, search } = new URL(request.url)
    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))
  }
  return respuesta.json()
}

export const router = createBrowserRouter([
  { path: '/entrar', Component: Entrar },
  {
    id: 'privada',
    loader: exigirSesion,
    HydrateFallback: () => <p role="status">Comprobando sesión…</p>,
    children: [{ path: '/reservas', Component: MisReservas }],
  },
])

// En MisReservas: const usuario = useRouteLoaderData('privada')
```

Comprobado con React Router 8.5.0 (con `createMemoryRouter`, que acepta las mismas rutas): en la primera carga se ve «Comprobando sesión…»; sin sesión, `/reservas?mes=11` acaba en `/entrar?volver=%2Freservas%3Fmes%3D11`, y con sesión se pinta la página con el usuario del `loader`.

Dos diferencias con lo de antes. El estado «comprobando» ya no lo pinta la ruta protegida: mientras corre el `loader` de la primera carga, el router pinta el `HydrateFallback` (sin él, la consola avisa; lo verás en esa lección). Y `redirect` devuelve una respuesta HTTP, sin `state`: **la página de vuelta viaja en la URL**, en `?volver=`. Eso tiene un riesgo, porque cualquiera puede fabricar un enlace con un `volver` que lleve a otra web. La documentación de `redirect` lo avisa:

> This utility accepts absolute URLs and can navigate to external domains, so the application should validate any user-supplied inputs to redirects.

Es decir: `redirect` acepta URL absolutas y puede llevar a otros dominios, así que tienes que validar cualquier destino que venga del usuario. Lo más seguro es dejar que el navegador interprete la dirección y quedarte solo con las de tu propio origen, y además comprobar la ruta que sale:

```js
function destinoSeguro(volver) {
  const url = new URL(volver ?? '/reservas', window.location.origin)
  const ruta = url.pathname + url.search
  // Comprobar el origen no basta: «/.//malvado.example» se resuelve dentro de
  // tu web, pero su ruta queda en «//malvado.example», que es otro dominio
  return url.origin === window.location.origin && !ruta.startsWith('//') ? ruta : '/reservas'
}
```

Comprobado: `/reservas?mes=11` pasa tal cual; `//malvado.example/x`, `/\malvado.example`, `https://malvado.example`, `javascript:alert(1)` y `/.//malvado.example` acaban en `/reservas`. Un `startsWith('/')` no basta: las dos primeras empiezan por barra y el navegador las lee como otro dominio.

Y comparar el origen tampoco basta, por la última. `new URL` normaliza la ruta: resuelve los `.` y los `..`. Con `/.//malvado.example`, el origen sale el tuyo, pero `url.pathname` vale `//malvado.example`. Si devolvieras esa ruta, `redirect('//malvado.example')` sacaría al usuario de tu web, porque una dirección que empieza por `//` es la de otro dominio con tu mismo protocolo. Pasa lo mismo con `/a/..//malvado.example` y con `/%2e//malvado.example`. Por eso la función mira también que la ruta, ya normalizada, no empiece por `//`.

## Cerrar sesión de verdad

Pulsar «Salir» y ver otra vez el formulario no significa que la sesión haya terminado. **Cerrar sesión de verdad son dos trabajos**: uno en el servidor y otro en el navegador.

**En el servidor**, la sesión tiene que dejar de valer. La guía de OWASP sobre sesiones lo exige («must invalidate the session at least on server side») y avisa de que borrar la cookie en el navegador no invalida una copia robada. Con cookie, eso es `POST /api/salir`: el servidor borra la sesión y manda la cookie caducada, porque el JavaScript no puede borrar una cookie `httpOnly`. Con un JWT que el servidor no guarda en ningún sitio, como el del proyecto 52, no hay nada que borrar: **el token sigue valiendo hasta su caducidad**. Por eso esos tokens duran poco, o el servidor guarda una lista de revocados.

**En el navegador**, todo lo que la app guardó de ese usuario. Si no, **el siguiente que use ese navegador ve datos del anterior**:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La caché de datos",
      "texto": "Con TanStack Query, queryClient.clear(), que según su documentación vacía la caché de consultas y la de mutaciones. Si usas otra librería o una caché propia, su equivalente."
    },
    {
      "titulo": "Otros almacenes de estado",
      "texto": "Un almacén de Zustand o Redux (lección 75), un contexto con el carrito, un formulario a medias: todo lo que sea de ese usuario vuelve a su valor inicial."
    },
    {
      "titulo": "Lo guardado en el navegador",
      "texto": "Borradores, preferencias privadas o cualquier cosa que la app guardara en localStorage o sessionStorage a nombre de ese usuario. OWASP sugiere además que la respuesta de salir lleve la cabecera Clear-Site-Data, que pide al navegador borrar caché, cookies y almacenamiento del sitio."
    },
    {
      "titulo": "La pantalla",
      "texto": "Que no quede a la vista nada del anterior: si estás en una página protegida, la ruta protegida te llevará a entrar ella sola en cuanto la sesión pase a anónima."
    }
  ]
}
```

La caché es la que más sorprende, porque está hecha para no volver a pedir lo que ya tiene. Comprobado con TanStack Query 5.105.0: Amaia ve sus reservas y sale; Koldo entra en la misma pestaña. Con la clave `['reservas']` (sin el usuario), un `staleTime` de cinco minutos y sin vaciar la caché:

```text
sin clear() → Koldo ve: Cena del jueves     | peticiones: ninguna
con clear() → Koldo ve: Comida del sábado   | peticiones: GET /api/reservas
```

Koldo ve la reserva de Amaia, y la app ni siquiera pregunta al servidor. Es lo que la lección 86 contaba de esta web, que se defiende por dos lados: **el usuario va en la clave** (`['reservas', usuario.id]`), para que no se mezclen datos de dos personas, y **la caché se vacía al salir**, para que no se queden en la memoria de un ordenador compartido. Así queda el proveedor con TanStack Query:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\nimport { cuandoCaduque, queryClient } from './red.js'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\nexport function ProveedorSesion({ children }) {\n  const [sesion, setSesion] = useState({ estado: 'comprobando', usuario: null, aviso: null })\n\n  function cerrarEnElCliente(aviso) {\n    queryClient.clear()\n    setSesion({ estado: 'anonimo', usuario: null, aviso })\n  }\n\n  useEffect(() => {\n    cuandoCaduque(() => cerrarEnElCliente('Tu sesión ha caducado. Vuelve a entrar.'))\n    let ignorar = false\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .catch(() => null)\n      .then((usuario) => {\n        if (ignorar) return\n        setSesion(usuario ? { estado: 'con-sesion', usuario, aviso: null } : { estado: 'anonimo', usuario: null, aviso: null })\n      })\n    return () => {\n      ignorar = true\n      cuandoCaduque(() => {})\n    }\n  }, [])\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/entrar', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ correo, clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    setSesion({ estado: 'con-sesion', usuario: await respuesta.json(), aviso: null })\n  }\n\n  async function salir() {\n    await fetch('/api/salir', { method: 'POST' })\n    cerrarEnElCliente(null)\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  const valor = useContext(SesionContext)\n  if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')\n  return valor\n}",
  "anotaciones": [
    {
      "fragmento": "import { cuandoCaduque, queryClient } from './red.js'",
      "nota": "El QueryClient es uno solo, creado fuera de los componentes (lección 78). red.js lo verás en la sección siguiente."
    },
    {
      "fragmento": "function cerrarEnElCliente(aviso) {",
      "nota": "Todo lo que hay que hacer en el navegador cuando una sesión termina, sea cual sea el motivo: salir, caducar o que la revoquen. En un solo sitio, para que ningún camino se olvide de nada."
    },
    {
      "fragmento": "queryClient.clear()",
      "nota": "Vacía la caché entera. Si tu app tiene otros almacenes del usuario, se reinician aquí también."
    },
    {
      "fragmento": "cuandoCaduque(() => cerrarEnElCliente('Tu sesión ha caducado. Vuelve a entrar.'))",
      "nota": "Registra qué hacer cuando cualquier petición vuelva con un 401: cerrar en el cliente con un aviso. Se explica en la sección siguiente."
    },
    {
      "fragmento": "await fetch('/api/salir', { method: 'POST' })",
      "nota": "Primero, el servidor: que la sesión deje de valer. Después, el navegador."
    },
    {
      "fragmento": "setSesion({ estado: 'anonimo', usuario: null, aviso })",
      "nota": "Al pasar a anónimo, la ruta protegida de la página en la que estés redirige a /entrar, con desde, sin que nadie llame a navigate. Si en vez de eso prefieres llevar a la portada al salir, navega tú después de llamar a salir."
    }
  ]
}
```

## Un 401 en cualquier petición cierra la sesión

La sesión puede terminar sin que nadie pulse «Salir»: caduca, la junta la revoca, o cambias la contraseña en otro dispositivo. La app se entera en la siguiente petición, que vuelve con un 401. **Si cada componente lo trata a su manera, unos enseñan un error, otros se quedan cargando y alguno reintenta tres veces.** Hay que tratarlo en un solo sitio, y distinguirlo bien de los demás errores:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres respuestas que no significan lo mismo",
  "roles": [
    {
      "etiqueta": "401 Unauthorized",
      "rol": "No sé quién eres",
      "descripcion": "Falta la credencial, caducó o la revocaron. Se cierra la sesión en el navegador y se pide que vuelva a entrar."
    },
    {
      "etiqueta": "403 Forbidden",
      "rol": "Sé quién eres, pero no puedes",
      "descripcion": "La sesión sigue valiendo: no se cierra. Se explica que esa sección no es para ti. Volver a entrar no lo cambia."
    },
    {
      "etiqueta": "500 y fallos de red",
      "rol": "Algo ha fallado, y no es cosa tuya",
      "descripcion": "La sesión sigue. Un aviso y un «Reintentar»; un 500 nunca debe echar a nadie."
    }
  ]
}
```

El nombre despista: 401 se llama *Unauthorized*, pero MDN lo describe como una petición sin credenciales de autenticación válidas, es decir, «no autenticado». El de «no autorizado» es el 403: según MDN, volver a autenticarse no cambia nada.

Hay dos sitios naturales para tratarlo. El primero es **un envoltorio de `fetch`**: una función `pedir` por la que pasan todas las peticiones con sesión y que, ante un 401, cierra la sesión. Lo escribirás en el ejercicio 2. El segundo, si usas TanStack Query, es **la propia caché**: `QueryCache` y `MutationCache` aceptan un `onError` que se llama cuando cualquier consulta o mutación acaba en error.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'\n\nexport class ErrorHttp extends Error {\n  constructor(respuesta) {\n    super(`El servidor respondió ${respuesta.status}`)\n    this.status = respuesta.status\n  }\n}\n\nexport async function pedir(ruta, opciones) {\n  const respuesta = await fetch(ruta, opciones)\n  if (!respuesta.ok) throw new ErrorHttp(respuesta)\n  return respuesta.json()\n}\n\n// El proveedor de sesión registra aquí qué hacer cuando caduca\nlet alCaducar = () => {}\nexport function cuandoCaduque(funcion) {\n  alCaducar = funcion\n}\n\nfunction siCaduco(error) {\n  if (error.status === 401) alCaducar()\n}\n\nexport const queryClient = new QueryClient({\n  queryCache: new QueryCache({ onError: siCaduco }),\n  mutationCache: new MutationCache({ onError: siCaduco }),\n  defaultOptions: {\n    queries: {\n      staleTime: 5 * 60_000,\n      retry: (fallos, error) => error.status !== 401 && fallos < 3,\n    },\n  },\n})",
  "anotaciones": [
    {
      "fragmento": "export class ErrorHttp extends Error {",
      "nota": "Un error que lleva dentro el código HTTP, para poder distinguir un 401 de un 500. Recuerda que fetch no lanza nada con un 401: hay que mirar respuesta.ok (lección 78)."
    },
    {
      "fragmento": "let alCaducar = () => {}",
      "nota": "El QueryClient vive fuera de React y no puede leer el contexto. El proveedor de sesión registra aquí, en su efecto, qué hacer cuando la sesión caduca."
    },
    {
      "fragmento": "queryCache: new QueryCache({ onError: siCaduco }),",
      "nota": "Se llama cuando cualquier consulta de la caché acaba en error, ya pasados los reintentos. Un solo sitio para toda la app, en vez de un if en cada componente."
    },
    {
      "fragmento": "mutationCache: new MutationCache({ onError: siCaduco }),",
      "nota": "Lo mismo para las mutaciones: guardar una reserva con la sesión caducada también tiene que cerrarla."
    },
    {
      "fragmento": "retry: (fallos, error) => error.status !== 401 && fallos < 3,",
      "nota": "Por defecto, una consulta que falla se reintenta tres veces, esperando 1, 2 y 4 segundos (lección 78). Un 401 no se arregla esperando: así no se reintenta, y los demás errores siguen con sus tres reintentos."
    },
    {
      "fragmento": "staleTime: 5 * 60_000,",
      "nota": "Cinco minutos sin volver a pedir lo que ya está en la caché. Es lo que hace que una caché sin vaciar enseñe datos del usuario anterior."
    }
  ]
}
```

Ejecutado con la sesión caducada en el servidor, pulsando «Actualizar» en Mis reservas:

```text
401 → peticiones: GET /api/reservas (una sola, sin reintentos)
      aviso: Tu sesión ha caducado. Vuelve a entrar.  ruta: /entrar
      consultas en caché: ninguna
      al volver a entrar: /reservas
500 → a los 2,5 s: dos peticiones (la primera y un reintento),
      sigue en /reservas, con la lista en pantalla
```

El 401 cierra la sesión, vacía la caché y te deja en «Entrar» con un aviso; y como la ruta protegida guardó de dónde venías, al volver a entrar regresas a tus reservas. El 500 no cierra nada: TanStack Query lo sigue intentando y, mientras, la lista que ya tenías sigue ahí.

**Una excepción: la petición de entrar.** Su 401 significa «contraseña incorrecta», no «sesión caducada». Por eso `entrar` usa `fetch` directamente, sin pasar por `pedir` ni por la caché.

## Dónde guardar el token

Hasta aquí la credencial ha sido una cookie que tu código no ve. No siempre es así: la API del proyecto 52 te devuelve un JWT en el cuerpo de la respuesta, y es tu código el que tiene que guardarlo y ponerlo en cada petición. **Dónde lo guardes decide qué puede hacer alguien que consiga ejecutar JavaScript en tu página**, el XSS de la lección 82. Hay tres opciones habituales, y ninguna sale gratis:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres sitios para la credencial",
  "roles": [
    {
      "etiqueta": "Cookie httpOnly",
      "rol": "El navegador la guarda; tu JavaScript no la ve",
      "descripcion": "Un XSS no puede llevársela, aunque sí usarla mientras la página está abierta. Como viaja sola, hay que defenderse del CSRF."
    },
    {
      "etiqueta": "localStorage",
      "rol": "Tu código la guarda y la pone en cada petición",
      "descripcion": "Sobrevive a recargas y pestañas, y no hay CSRF. Pero cualquier XSS la lee y se la lleva, y el atacante la usa desde fuera hasta que caduque."
    },
    {
      "etiqueta": "Memoria + refresco en cookie",
      "rol": "Token corto en una variable; el de refresco, en cookie",
      "descripcion": "Nada en el almacenamiento. Se pierde al recargar: al cargar, comprobando pide uno nuevo con la cookie. Es la que más piezas tiene."
    }
  ]
}
```

### Cookie `httpOnly`

El servidor la pone en la respuesta de entrar, con una cabecera como esta:

```text
Set-Cookie: __Host-sesion=7f3a9c…; Path=/; Secure; HttpOnly; SameSite=Strict
```

- **`HttpOnly`**: el JavaScript no puede leerla, ni con `document.cookie`. Pero se sigue enviando en las peticiones que hace tu código, `fetch` incluido (MDN).
- **`Secure`**: solo viaja por HTTPS, salvo en `localhost`.
- **`SameSite`**: si se envía en las peticiones que vienen de otro sitio. Con `Strict`, nunca. Con `Lax`, solo en las navegaciones con un método seguro como GET (seguir un enlace desde otra web); no en un `fetch` ni en un formulario POST que lance otra web. Con `None`, siempre, y exige `Secure`. OWASP pide poner `Strict` (su preferida) o `Lax` de forma explícita, porque el valor por defecto cambia de un navegador a otro.
- **El prefijo `__Host-`**: obliga a `Secure`, a `Path=/` y a no llevar `Domain`, así que la cookie solo va al servidor que la puso. OWASP lo recomienda para las sesiones.

En el cliente, casi nada que hacer: un `fetch('/api/yo')` a tu propio origen ya la lleva, porque `credentials` vale `'same-origin'` por defecto. Si la API está en otro origen, hace falta `credentials: 'include'` en cada `fetch` y, en el servidor, CORS con `Access-Control-Allow-Credentials: true` y el origen exacto, no `*` (MDN).

**El precio es el CSRF**. Como el navegador añade la cookie solo, otra web puede conseguir que el navegador de Amaia mande una petición a La Marmita con su cookie, por ejemplo con un formulario oculto que reserve la cocina en su nombre. `SameSite` lo frena en buena parte, pero MDN y OWASP lo tratan como una defensa más, no como la única: `Lax` deja pasar las navegaciones con GET, y `SameSite` mira el *sitio*, no el origen, así que `tienda.lamarmita.example` y `socios.lamarmita.example` cuentan como el mismo. Las defensas de verdad son del servidor:

- no cambiar nada con una petición GET;
- exigir peticiones que el navegador no manda a otro origen sin permiso de CORS, como un JSON con `Content-Type: application/json` o una cabecera propia;
- tokens CSRF, que muchos frameworks ponen solos;
- y mirar las cabeceras `Origin` o `Sec-Fetch-Site`, que dicen de dónde viene la petición.

¿Y el XSS? Un script inyectado no puede leer la cookie, pero sí hacer peticiones desde tu página mientras está abierta, y la cookie irá con ellas. OWASP lo resume así: `HttpOnly` protege la confidencialidad de la cookie, y el atacante no puede usarla fuera de la página («offline»). Ya es mucho: robar una sesión para usarla durante días no es lo mismo que actuar mientras la víctima tiene la pestaña abierta.

### `localStorage`

```js
localStorage.setItem('token', token)
// ...y en cada petición
fetch('/api/perfil', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
```

Es lo más sencillo y funciona con cualquier API que use `Authorization: Bearer`, como la del proyecto 52. Sobrevive a recargas y está en todas las pestañas. Y **no hay CSRF**: el CSRF existe porque el navegador añade las cookies por su cuenta, y la cabecera `Authorization` solo la pone tu código.

El problema es el contrario: **cualquier script de tu página puede leerlo**. Un solo XSS se lleva el token y lo usa desde otro ordenador hasta que caduque. La guía de OWASP sobre sesiones es tajante:

> Do not store authentication tokens, session IDs, JWTs, refresh tokens, or any credential in `localStorage` or `sessionStorage`. These APIs are accessible to any JavaScript executing in the origin, so a single XSS vulnerability discloses every token.

Es decir: no guardes tokens, identificadores de sesión, JWT, tokens de refresco ni ninguna credencial en `localStorage` ni en `sessionStorage`, porque cualquier JavaScript que se ejecute en tu origen puede leerlos, y una sola vulnerabilidad XSS los revela todos. `sessionStorage` cambia la duración (una pestaña), no el riesgo.

Y sin embargo, es muy común. Sin ir más lejos, **esta web lo hace**: `supabase-js` guarda la sesión en `localStorage` si no le das otro almacenamiento (está en su código, con la clave `sb-<proyecto>-auth-token`), y esta web lo crea con las opciones por defecto. La documentación de Supabase defiende la decisión: en una app con mucho JavaScript en el cliente, dice, las cookies `httpOnly` no encajan, porque el navegador no podría leer ni refrescar los tokens. Con la sesión en `localStorage`, el XSS es lo primero que tiene que vigilar esta web, y lo vigila: Markdown sin HTML crudo en los comentarios, y el código de los alumnos en un iframe sin permisos que no puede leer su almacenamiento (lección 86).

### En memoria, con un token de refresco en cookie

Un término medio muy usado. El servidor da **dos tokens**: uno de acceso, que dura minutos, y uno de refresco, que dura más y va en una cookie `httpOnly` limitada a la ruta de refrescar. El de acceso se guarda en una variable de JavaScript, nunca en el almacenamiento.

- Al recargar, la variable se pierde. El estado «comprobando» pasa a ser `POST /api/refrescar`: si la cookie vale, el servidor da un token de acceso nuevo, y si no, anónimo.
- Cuando un token de acceso caduca a media sesión, el 401 primero intenta un refresco y repite la petición; solo si el refresco falla se cierra la sesión.

Ganas que no haya nada que robar en el almacenamiento y que el token de refresco no lo lea ningún script. No ganas inmunidad: un XSS puede usar el token de acceso mientras la página está abierta, y pedir otros. La guía de OWASP lo advierte incluso para el caso más aislado, guardar el secreto dentro de un Web Worker: reduce el acceso directo, pero no hace la app segura frente a un XSS. Y pagas en complejidad: la ruta de refrescar, varias peticiones que reciben un 401 a la vez y deberían esperar a un solo refresco, varias pestañas...

Es lo que hace, por ejemplo, el SDK de Auth0 para aplicaciones de una sola página: guarda los tokens en memoria por defecto (su opción `cacheLocation` vale `'memory'`) y recupera la sesión al recargar con su propia cookie o con tokens de refresco.

### Entonces, ¿cuál?

No hay una respuesta única, pero sí un orden. **Si controlas el servidor y la API está en tu mismo sitio, la cookie `httpOnly`**, con `SameSite` y una defensa contra el CSRF: es lo que recomienda OWASP. **Si la API es de otro y habla con `Bearer`**, memoria (con refresco, si la API lo ofrece), lo que haga el SDK del proveedor, o un servidor tuyo delante que guarde el token y a tu app le dé una cookie: el patrón que OWASP llama *Backend for Frontend*. **`localStorage` es lo más sencillo y lo más expuesto**: si lo usas, que sea sabiendo que tu seguridad depende de no tener ni un XSS. Y en los tres casos: HTTPS, credenciales que caducan pronto y un servidor que decide.

```laboratorio
{
  "tipo": "mitos",
  "titulo": "Lo que se suele creer del token",
  "mitos": [
    {
      "mito": "Un JWT va cifrado: nadie puede leer lo que lleva",
      "realidad": "Va firmado, no cifrado. El payload es JSON en base64url: el de la API del proyecto 52 se lee tal cual, con su sub, su email y su exp. La firma solo garantiza que nadie lo ha cambiado. Nada de secretos dentro."
    },
    {
      "mito": "Con una cookie httpOnly, el XSS ya no me afecta",
      "realidad": "No pueden llevársela, pero sí usarla: un script inyectado hace peticiones desde tu página y la cookie va con ellas. Evitar el XSS (lección 82) sigue siendo lo primero."
    },
    {
      "mito": "SameSite=Lax acaba con el CSRF",
      "realidad": "Lo frena en muchos casos, pero deja pasar las navegaciones con GET y no distingue tus subdominios. MDN y OWASP lo tratan como una defensa más, junto a las del servidor."
    },
    {
      "mito": "En memoria, el token está a salvo",
      "realidad": "A salvo de quien lea el almacenamiento. Un script que corre en tu página puede interceptar tus peticiones o pedir un token nuevo."
    },
    {
      "mito": "Al pulsar Salir, el token deja de valer",
      "realidad": "Solo si el servidor lo invalida. Un JWT sin estado, como el del proyecto 52, vale hasta su exp aunque el cliente lo olvide."
    }
  ]
}
```

## La autorización de verdad está en el servidor

En la web de La Marmita, «Cuentas de la sociedad» solo aparece en el menú de la junta. **Eso es interfaz, no seguridad**: ocultar un botón o un enlace no protege nada, como ya viste en la lección 82. Cualquiera puede pedir lo mismo desde la consola del navegador o con `curl`. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Lo que esconde la interfaz y lo que decide el servidor",
  "consigna": "Entra como Amaia: en su menú no aparece «Cuentas de la sociedad». Pulsa «Pedir /api/cuentas a mano», que hace lo mismo que harías con la consola del navegador o con curl. Después sal y repite con Koldo, de la junta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { ProveedorSesion, useSesion } from './Sesion'\nimport Entrar from './Entrar'\nimport { PanelServidor } from './Servidor'\nimport './estilos.css'\n\n// Lo que hace la interfaz: enseñar «Cuentas» solo a la junta\nfunction Menu() {\n  const { usuario, salir } = useSesion()\n  return (\n    <nav aria-label=\"Principal\" className=\"lectura\">\n      <p>\n        {usuario.nombre} · <button onClick={salir}>Salir</button>\n      </p>\n      <ul>\n        <li>Mis reservas</li>\n        {usuario.junta && <li>Cuentas de la sociedad</li>}\n      </ul>\n    </nav>\n  )\n}\n\n// Lo que puede hacer cualquiera con la consola del navegador o con curl\nfunction PeticionAMano() {\n  const [respuesta, setRespuesta] = useState(null)\n\n  async function pedirAMano() {\n    const res = await fetch('/api/cuentas')\n    setRespuesta(`${res.status} · ${JSON.stringify(await res.json())}`)\n  }\n\n  return (\n    <section className=\"lectura\">\n      <h2>Sin pasar por la interfaz</h2>\n      <button onClick={pedirAMano}>Pedir /api/cuentas a mano</button>\n      {respuesta && <pre>{respuesta}</pre>}\n    </section>\n  )\n}\n\nfunction Contenido() {\n  const { estado } = useSesion()\n  if (estado === 'comprobando') return <p role=\"status\">Comprobando sesión…</p>\n  if (estado === 'anonimo') return <Entrar />\n  return (\n    <div className=\"dos-lecturas\">\n      <Menu />\n      <PeticionAMano />\n    </div>\n  )\n}\n\nexport default function App() {\n  return (\n    <>\n      <main>\n        <h1>Sociedad gastronómica La Marmita</h1>\n        <ProveedorSesion>\n          <Contenido />\n        </ProveedorSesion>\n      </main>\n      <PanelServidor />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Sesion.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\nconst COMPROBANDO = { estado: 'comprobando', usuario: null }\nconst ANONIMO = { estado: 'anonimo', usuario: null }\n\nexport function ProveedorSesion({ children }) {\n  const [sesion, setSesion] = useState(COMPROBANDO)\n\n  // Al cargar la app: ¿el servidor me reconoce?\n  useEffect(() => {\n    let ignorar = false\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .catch(() => null)\n      .then((usuario) => {\n        if (ignorar) return\n        setSesion(usuario ? { estado: 'con-sesion', usuario } : ANONIMO)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [])\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/entrar', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ correo, clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    setSesion({ estado: 'con-sesion', usuario: await respuesta.json() })\n  }\n\n  async function salir() {\n    await fetch('/api/salir', { method: 'POST' })\n    setSesion(ANONIMO)\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  const valor = useContext(SesionContext)\n  if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')\n  return valor\n}\n"
    },
    {
      "nombre": "Entrar.jsx",
      "codigo": "import { useActionState } from 'react'\nimport { useSesion } from './Sesion'\n\nexport default function Entrar() {\n  const { entrar } = useSesion()\n  const [resultado, accionEntrar, enviando] = useActionState(\n    async (anterior, datos) => {\n      const correo = datos.get('correo')\n      try {\n        await entrar(correo, datos.get('clave'))\n        return { error: null, correo: '' }\n      } catch (error) {\n        return { error: error.message, correo }\n      }\n    },\n    { error: null, correo: '' },\n  )\n\n  return (\n    <form action={accionEntrar} className=\"entrar\">\n      <label>\n        Correo\n        <input name=\"correo\" type=\"email\" autoComplete=\"username\" defaultValue={resultado.correo} required />\n      </label>\n      <label>\n        Contraseña\n        <input name=\"clave\" type=\"password\" autoComplete=\"current-password\" required />\n      </label>\n      {resultado.error && <p role=\"alert\">{resultado.error}</p>}\n      <button disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>\n      <p className=\"pista\">amaia@ejemplo.es / marmitako (socia) · koldo@ejemplo.es / txangurro (junta)</p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Servidor.jsx",
      "codigo": "// Este archivo hace de servidor dentro de la vista previa: contesta a las\n// peticiones a /api/ como lo haría tu API. No hace falta que lo leas.\nimport { useSyncExternalStore } from 'react'\n\nconst LATENCIA = 400\nconst SOCIOS = [\n  { id: 1, correo: 'amaia@ejemplo.es', clave: 'marmitako', nombre: 'Amaia', junta: false },\n  { id: 2, correo: 'koldo@ejemplo.es', clave: 'txangurro', nombre: 'Koldo', junta: true },\n]\nconst sesiones = new Map()\n// La cookie httpOnly: el navegador la guarda y la envía sola en cada\n// petición, pero tu JavaScript no puede leerla. Aquí la simula esta variable.\nlet cookie = null\nlet registro = []\nconst oyentes = new Set()\n\nfunction anotar(linea) {\n  registro = [...registro, linea].slice(-4)\n  oyentes.forEach((avisar) => avisar())\n}\n\n// El fetch de la vista previa, con los datos de la API simulada. Si este\n// archivo se vuelve a cargar, se toma el de debajo para no envolverlo dos veces.\nconst fetchDatos = window.fetch.fetchDatos ?? window.fetch\nconst responder = (datos, status = 200) =>\n  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } })\nconst publico = ({ id, nombre, junta }) => ({ id, nombre, junta })\n\nasync function atender(metodo, ruta, cuerpo) {\n  await new Promise((r) => setTimeout(r, LATENCIA))\n  if (metodo === 'POST' && ruta === '/api/entrar') {\n    const socio = SOCIOS.find((s) => s.correo === cuerpo.correo && s.clave === cuerpo.clave)\n    if (!socio) return responder({ error: 'Credenciales inválidas' }, 401)\n    cookie = 'sesion-' + Math.random().toString(36).slice(2)\n    sesiones.set(cookie, socio)\n    return responder(publico(socio))\n  }\n  if (metodo === 'POST' && ruta === '/api/salir') {\n    sesiones.delete(cookie)\n    cookie = null\n    return responder({ ok: true })\n  }\n  const socio = sesiones.get(cookie)\n  if (!socio) return responder({ error: 'Sesión ausente o caducada' }, 401)\n  if (ruta === '/api/yo') return responder(publico(socio))\n  if (ruta === '/api/cuentas' && !socio.junta) return responder({ error: 'Solo para la junta' }, 403)\n  const respuesta = await fetchDatos(ruta)\n  if (!respuesta.ok) return respuesta\n  const filas = await respuesta.json()\n  return responder(ruta === '/api/reservas' ? filas.filter((f) => f.socioId === socio.id) : filas)\n}\n\nasync function servidor(ruta, opciones = {}) {\n  const metodo = opciones.method ?? 'GET'\n  const respuesta = await atender(metodo, ruta, opciones.body ? JSON.parse(opciones.body) : {})\n  anotar(`${metodo} ${ruta} → ${respuesta.status}`)\n  return respuesta\n}\nservidor.fetchDatos = fetchDatos\nwindow.fetch = servidor\n\nfunction caducar() {\n  sesiones.clear()\n  anotar('(el servidor da por caducadas todas las sesiones)')\n}\n\nexport function PanelServidor() {\n  const lineas = useSyncExternalStore(\n    (avisar) => {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    () => registro,\n  )\n  return (\n    <aside className=\"servidor\" aria-label=\"Servidor simulado\">\n      <p>\n        Servidor simulado · cookie de sesión: {cookie ? 'guardada' : 'ninguna'}{' '}\n        <button onClick={caducar}>Caducar la sesión</button>\n      </p>\n      <pre>{lineas.join('\\n') || 'Sin peticiones todavía'}</pre>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nmain,\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n/* La web de La Marmita */\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nheader nav {\n  display: flex;\n  gap: 1rem;\n}\n\nheader p {\n  margin: 0.4rem 0;\n}\n\na {\n  color: #9a3412;\n}\n\n.entrar {\n  display: grid;\n  gap: 0.5rem;\n  max-width: 18rem;\n}\n\n.entrar label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.pista {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n.dos-lecturas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));\n  gap: 0.75rem;\n}\n\n.lectura {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.lectura h2 {\n  margin-top: 0;\n  font-size: 0.95rem;\n}\n\n/* El servidor simulado */\n.servidor {\n  margin: 0.75rem 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #64748b;\n  border-radius: 8px;\n  background: #f1f5f9;\n  font-size: 0.85rem;\n}\n\n.servidor p {\n  margin: 0;\n}\n\n.servidor pre {\n  margin: 0.4rem 0 0;\n  white-space: pre-wrap;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "socioId": 1,
        "texto": "Cena del jueves · 8 comensales"
      },
      {
        "id": 2,
        "socioId": 1,
        "texto": "Txoko libre el domingo · 4 comensales"
      },
      {
        "id": 3,
        "socioId": 2,
        "texto": "Comida del sábado · 12 comensales"
      }
    ],
    "cuentas": [
      {
        "id": 1,
        "texto": "Cuotas de octubre: 18 de 20 socios al día"
      },
      {
        "id": 2,
        "texto": "Bodega: 340 € en txakoli y rioja alavesa"
      }
    ]
  }
}
```

Con Amaia, la petición llega y el servidor contesta `403 · {"error":"Solo para la junta"}`. Con Koldo, `200` y las cuentas. **La interfaz decidió no enseñar el enlace; el servidor decidió no dar los datos.** Solo lo segundo protege algo.

Con React Router, una ruta solo para la junta se escribe igual que la protegida, anidada dentro de ella:

```jsx
export function RutaJunta() {
  const { usuario } = useSesion()
  if (!usuario.junta) return <p role="alert">Esta sección es solo para la junta.</p>
  return <Outlet />
}

// Dentro de la ruta protegida:
// <Route element={<RutaJunta />}>
//   <Route path="cuentas" element={<Cuentas />} />
// </Route>
```

Es la `AdminRoute` de la lección 86, y también es solo comodidad: evita que Amaia vea una página vacía con un error, nada más. Lo que protege está en otro sitio:

- **En tu API**, que comprueba en cada petición quién la hace (401 si no lo sabe) y si puede (403 si no). El reto 2 del proyecto 52 de Node.js es justo eso: un campo `rol` en el JWT y un middleware que responde 403 a quien no es administrador.
- **En la base de datos**, con las políticas de *Row Level Security* que protegen esta web (lección 86).
- **En cada Server Function**, que es una puerta pública y comprueba la sesión dentro (lección 89).

Si el rol va dentro del JWT, la app puede leerlo para decidir qué enseñar, porque el payload no está cifrado. Lo que no puede es cambiarlo sin romper la firma. Y aunque pudiera, el servidor vuelve a comprobarlo en cada petición.

## Practicar contra una API de verdad: el proyecto 52

El servidor de la vista previa es de mentira. Para practicar con uno de verdad tienes el del temario de Node.js: el proyecto 52, «Proyecto avanzado: API REST con autenticación JWT» (repositorio `pedroleni/nodejs-proyectos`, carpeta `api-auth-jwt`). Es una API sin frameworks con tres rutas:

- `POST /registro` con `{ email, contrasena }`: crea el usuario (`201`), o `409` si ya existe.
- `POST /login`: devuelve `{ token }`, un JWT que caduca en una hora, o `401` con `{"error":"Credenciales inválidas"}`.
- `GET /perfil`: con la cabecera `Authorization: Bearer <token>`, devuelve `{ id, email }`; sin ella, o con un token caducado, `401` con `{"error":"Token ausente, inválido o expirado"}`.

Escucha en el puerto 3000 y guarda los usuarios en una base de datos en memoria: se borran al pararla, así que registra uno cada vez que la arranques.

```bash
curl -X POST http://localhost:3000/registro \
  -H 'Content-Type: application/json' \
  -d '{"email":"amaia@ejemplo.es","contrasena":"marmitako"}'
```

Y **no envía cabeceras CORS**, así que tu app de Vite, en otro puerto, no podría llamarla desde el navegador. Lo más cómodo es que Vite reenvíe las peticiones, con un proxy:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    proxy: {\n      // /api/login en Vite → http://localhost:3000/login en la API del proyecto 52\n      '/api': {\n        target: 'http://localhost:3000',\n        changeOrigin: true,\n        rewrite: (ruta) => ruta.replace(/^\\/api/, ''),\n      },\n    },\n  },\n})",
  "anotaciones": [
    {
      "fragmento": "'/api': {",
      "nota": "Toda petición que empiece por /api, hecha a tu servidor de desarrollo de Vite, se reenvía a la API. Para el navegador es tu mismo origen: no hay CORS que configurar, y una cookie viajaría sola."
    },
    {
      "fragmento": "rewrite: (ruta) => ruta.replace(/^\\/api/, ''),",
      "nota": "Quita el /api antes de reenviar: /api/login llega a la API como /login, que es su ruta."
    },
    {
      "fragmento": "changeOrigin: true,",
      "nota": "Cambia la cabecera Host de la petición por la del destino, como en el ejemplo de la documentación de Vite."
    }
  ]
}
```

Comprobado con Vite 8.3.5 y la API del proyecto 52 (rama `solucion`): a través del proxy, `POST /api/login` devuelve el token, `GET /api/perfil` con el token devuelve `{"id":1,"email":"amaia@ejemplo.es"}` y sin él, el `401`. Y el payload del token, decodificado, es `{"sub":1,"email":"amaia@ejemplo.es","exp":…}`: legible, como decía el mito.

Esta API no pone cookies: te da un token y tú decides dónde guardarlo. Esta versión del proveedor lo guarda en memoria:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createContext, useContext, useState } from 'react'\nimport { queryClient } from './red.js'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\n// El token, en memoria: fuera del alcance de quien lea localStorage,\n// pero se pierde al recargar la página\nlet token = null\n\nexport async function pedirConToken(ruta, opciones = {}) {\n  const respuesta = await fetch(ruta, {\n    ...opciones,\n    headers: { ...opciones.headers, Authorization: `Bearer ${token}` },\n  })\n  if (!respuesta.ok) {\n    const error = new Error(`El servidor respondió ${respuesta.status}`)\n    error.status = respuesta.status\n    throw error\n  }\n  return respuesta.json()\n}\n\nconst ANONIMO = { estado: 'anonimo', usuario: null }\n\nexport function ProveedorSesion({ children }) {\n  // Sin token guardado no hay nada que comprobar al cargar\n  const [sesion, setSesion] = useState(ANONIMO)\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/login', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ email: correo, contrasena: clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    token = (await respuesta.json()).token\n    setSesion({ estado: 'con-sesion', usuario: await pedirConToken('/api/perfil') })\n  }\n\n  function salir() {\n    token = null // el JWT sigue valiendo en el servidor hasta su exp\n    queryClient.clear()\n    setSesion(ANONIMO)\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  return useContext(SesionContext)\n}",
  "anotaciones": [
    {
      "fragmento": "let token = null",
      "nota": "En una variable del módulo: ningún script la encuentra en el almacenamiento, pero desaparece al recargar. Para guardarlo en localStorage bastaría con cambiar esta variable por getItem y setItem, con lo que ya sabes que supone."
    },
    {
      "fragmento": "Authorization: `Bearer ${token}`",
      "nota": "La cabecera que espera la API del proyecto 52. Esto es lo que una cookie hace sola y aquí tienes que hacer tú en cada petición."
    },
    {
      "fragmento": "const [sesion, setSesion] = useState(ANONIMO)",
      "nota": "Con el token en memoria y sin token de refresco, al cargar no hay nada que comprobar: se empieza en anónimo. El estado comprobando vuelve en cuanto el servidor tenga una forma de recuperar la sesión, como una cookie de refresco."
    },
    {
      "fragmento": "body: JSON.stringify({ email: correo, contrasena: clave }),",
      "nota": "Los nombres de campo que espera esta API, email y contrasena, que no son los del servidor de la vista previa."
    },
    {
      "fragmento": "token = (await respuesta.json()).token",
      "nota": "La API devuelve { token }. Después se pide /api/perfil para saber quién eres: esta API no tiene /yo."
    },
    {
      "fragmento": "token = null // el JWT sigue valiendo en el servidor hasta su exp",
      "nota": "No hay ruta de salir: el cliente olvida el token y ya está. Quien lo hubiera copiado podría seguir usándolo durante el resto de su hora."
    }
  ]
}
```

Comprobado contra la API real: con una contraseña mala, «Correo o contraseña incorrectos.»; con la buena, la sesión pasa a `con-sesion` con `amaia@ejemplo.es`; y después de `salir`, la siguiente petición con el envoltorio recibe un 401, porque el token ya no está en la variable.

## Proveedores: lo que te dan hecho

En muchos proyectos no escribes el servidor de autenticación: lo contratas. Estos son cuatro que vas a ver a menudo, con lo que se comprobó en su documentación o en su paquete de npm a 26 de octubre de 2026:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Supabase Auth (el de esta web)",
      "texto": "Usuarios y contraseñas, enlaces mágicos, inicio con Google y otros, correos de verificación y recuperación, y refresco automático del token. En el navegador guarda la sesión en localStorage por defecto. Avisa de cada cambio con onAuthStateChange, que es donde esta web vacía la caché de TanStack Query (lección 86)."
    },
    {
      "titulo": "Auth0",
      "texto": "Páginas de entrada alojadas por Auth0 (loginWithRedirect), inicio con redes sociales y verificación en dos pasos. Su SDK de React da Auth0Provider y useAuth0, con isLoading, isAuthenticated y user: tus tres estados, ya hechos. Guarda los tokens en memoria por defecto."
    },
    {
      "titulo": "Auth.js",
      "texto": "Se instala en tu servidor, con integraciones para Next.js, SvelteKit o Express: no es para una SPA sola. Usa cookies con una política restrictiva y tokens CSRF en sus rutas POST. Desde septiembre de 2025 lo mantiene el equipo de Better Auth, y su propio README recomienda empezar los proyectos nuevos con Better Auth."
    },
    {
      "titulo": "Clerk",
      "texto": "Componentes ya hechos, como <SignIn /> y <UserButton />, y Hooks como useAuth, con getToken() para llamar a tu API con el token de la sesión. Su paquete de React es @clerk/react: el antiguo @clerk/clerk-react está marcado como obsoleto en npm."
    }
  ]
}
```

Te ahorran lo más delicado: guardar contraseñas (el hash que enseña la lección 50 de Node.js), los correos, el inicio con otras cuentas, la verificación en dos pasos y el refresco de los tokens. **Lo que sigue siendo tuyo** es casi todo lo de esta lección:

- **Los tres estados en la interfaz.** Te dan el «cargando» (`isLoading`, `loading`...); usarlo es cosa tuya.
- **Las rutas protegidas y volver a donde ibas.**
- **Vaciar tu caché y tus almacenes al salir.** El proveedor cierra su sesión; tu `queryClient` no se entera solo.
- **Tratar los 401 de tu propia API.**
- **La autorización**, en tu servidor o en tu base de datos.
- **El XSS.** Ningún proveedor puede proteger un token de un script que se ejecuta en tu página.

## Cuándo lo usarías de verdad

- **En cualquier aplicación con cuentas**: un área de clientes, un panel de administración, una intranet. El esqueleto es siempre este: proveedor con tres estados, ruta protegida, cierre que limpia y 401 centralizado.
- **Aunque uses un proveedor**: el SDK sustituye a tu `entrar` y a tu `/api/yo`, pero el resto de la lección se queda igual.
- **Cuando heredes un proyecto**: busca de dónde sale la sesión, qué pasa al recargar una página protegida, qué se borra al salir y dónde vive el token. Son las cuatro preguntas que más fallos destapan.

## Errores típicos

**Arrancar en anónimo.** `useState(null)` para el usuario, y una ruta protegida que redirige con `if (!usuario)`. Al recargar, te saca de la página aunque tu sesión siga viva. Es el predice del principio: hace falta el estado «comprobando».

**Cerrar la sesión solo en el cliente.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Cliente de la API del proyecto 52, con el token en memoria\nfunction salir() {\n  token = null\n  queryClient.clear()\n  setSesion(ANONIMO)\n}\n\n// Un compañero copió el token de Amaia de la pestaña Red\n// del navegador antes de que ella pulsara «Salir».\n// Diez minutos después, desde su ordenador:\n//\n//   curl http://localhost:3000/perfil \\\n//     -H \"Authorization: Bearer <el token de Amaia>\"\n//\n// ¿Qué responde la API?",
  "opciones": [
    "401: Amaia ya ha salido",
    "200, con el id y el correo de Amaia",
    "403: el token es de otra persona"
  ],
  "correcta": 1,
  "explicacion": "El cliente ha olvidado el token, pero la API no se ha enterado: no tiene ruta de salir ni lista de tokens revocados, y verificarToken solo mira la firma y la caducidad. Hasta que pase su hora, ese token es Amaia. Por eso los tokens sin estado duran poco, y por eso OWASP exige invalidar la sesión en el servidor al salir."
}
```

**Tratar cualquier error como una sesión caducada.** Un `if (!respuesta.ok) salir()` echa a la gente cada vez que el servidor tiene un mal día. Solo el 401 cierra la sesión; un 403 explica, y un 500 avisa y deja reintentar.

**Volver a un `?volver=` sin validarlo.** Si la página de vuelta viaja en la URL, cualquiera puede mandarte un enlace que, después de entrar, te lleve a una copia falsa de La Marmita. Valida el destino con `new URL`: quédate solo con tu origen, y descarta las rutas que, ya normalizadas, empiecen por `//`.

**Pedir datos antes de saber quién eres.** Una consulta que sale durante «comprobando» se hace como anónimo y se guarda con la clave equivocada. La lección 86 enseña cómo lo evita esta web: `enabled: !loading`.

**Fiarte de lo que guarda el navegador.** Guardar `{ junta: true }` en `localStorage` para enseñar el menú de la junta está bien; decidir con eso quién puede ver las cuentas, no. Se cambia desde las herramientas de desarrollo en dos segundos.

**Guardar la contraseña donde no debe.** Ni en un estado, ni en la consola, ni en la URL (la lección 77 ya lo advertía: nada de contraseñas ni tokens en la URL). La acción la recibe, la envía y la olvida.

## Ejercicios

Dos ejercicios con el servidor de la lección. En el primero escribes la ruta protegida con el navegador de mentira de las lecciones 76 y 77, que ahora acepta `replace` y `state` como React Router: `Redirigir` hace de `<Navigate>`, `useUbicacion` de `useLocation` y `useNavegar` de `useNavigate`. Los marcadores y la barra de direcciones cargan la página desde cero, como en un navegador de verdad; ↻ la recarga.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: la ruta protegida",
  "consigna": "En App.jsx, escribe RutaProtegida con los tres estados: «Comprobando sesión…» con role=\"status\"; un <Redirigir> a /entrar con replace y state={{ desde: pathname }}; o children. En Entrar.jsx, vuelve a desde (o a /reservas si no hay). Prueba los marcadores, ↻ y ←. Después entra como Amaia y escribe /cuentas en la barra: el enlace no sale, pero la página sí; quien la para es el servidor.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport Navegador, { Enlace, Redirigir, Rutas, useUbicacion } from './Navegador'\nimport { ProveedorSesion, useSesion } from './Sesion'\nimport Entrar from './Entrar'\nimport { PanelServidor } from './Servidor'\nimport './estilos.css'\n\n// TODO: protege la ruta según el estado de la sesión.\n// - comprobando: <p role=\"status\">Comprobando sesión…</p>\n// - anonimo: <Redirigir> a /entrar que sustituya la entrada del historial\n//   y deje en state de dónde venías: { desde: la ruta actual }\n// - con-sesion: children\nfunction RutaProtegida({ children }) {\n  return children\n}\n\nfunction Lista({ titulo, ruta }) {\n  const [resultado, setResultado] = useState({ filas: null, error: null })\n\n  useEffect(() => {\n    let ignorar = false\n    fetch(ruta).then(async (respuesta) => {\n      const cuerpo = await respuesta.json()\n      if (ignorar) return\n      setResultado(\n        respuesta.ok\n          ? { filas: cuerpo, error: null }\n          : { filas: null, error: `${cuerpo.error} (${respuesta.status})` },\n      )\n    })\n    return () => {\n      ignorar = true\n    }\n  }, [ruta])\n\n  return (\n    <section>\n      <h1>{titulo}</h1>\n      {resultado.error && <p role=\"alert\">El servidor dice: {resultado.error}</p>}\n      {!resultado.filas && !resultado.error && <p>Cargando…</p>}\n      <ul>\n        {resultado.filas?.map((fila) => (\n          <li key={fila.id}>{fila.texto}</li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nfunction Cabecera() {\n  const { estado, usuario, salir } = useSesion()\n  return (\n    <header>\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Portada</Enlace>\n        <Enlace a=\"/reservas\">Mis reservas</Enlace>\n        {usuario?.junta && <Enlace a=\"/cuentas\">Cuentas</Enlace>}\n      </nav>\n      {estado === 'con-sesion' ? (\n        <p>\n          {usuario.nombre} · <button onClick={salir}>Salir</button>\n        </p>\n      ) : (\n        <Enlace a=\"/entrar\">Entrar</Enlace>\n      )}\n    </header>\n  )\n}\n\nexport default function App() {\n  return (\n    <>\n      <Navegador marcadores={['/reservas', '/cuentas']}>\n        <ProveedorSesion>\n          <Cabecera />\n          <Rutas\n            rutas={{\n              '/': <h1>Portada</h1>,\n              '/entrar': <Entrar />,\n              '/reservas': (\n                <RutaProtegida>\n                  <Lista titulo=\"Mis reservas\" ruta=\"/api/reservas\" />\n                </RutaProtegida>\n              ),\n              '/cuentas': (\n                <RutaProtegida>\n                  <Lista titulo=\"Cuentas de la sociedad\" ruta=\"/api/cuentas\" />\n                </RutaProtegida>\n              ),\n              '*': <h1>Página no encontrada</h1>,\n            }}\n          />\n        </ProveedorSesion>\n      </Navegador>\n      <PanelServidor />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Entrar.jsx",
      "codigo": "import { useActionState } from 'react'\nimport { useNavegar, useUbicacion } from './Navegador'\nimport { useSesion } from './Sesion'\n\nexport default function Entrar() {\n  const { estado, usuario, entrar } = useSesion()\n  const navegar = useNavegar()\n  // TODO: vuelve a la página de la que venías: la ruta protegida la deja\n  // en useUbicacion().state. Si no hay ninguna, a /reservas.\n  const destino = '/reservas'\n\n  const [resultado, accionEntrar, enviando] = useActionState(\n    async (anterior, datos) => {\n      const correo = datos.get('correo')\n      try {\n        await entrar(correo, datos.get('clave'))\n      } catch (error) {\n        return { error: error.message, correo }\n      }\n      navegar(destino, { replace: true })\n      return { error: null, correo: '' }\n    },\n    { error: null, correo: '' },\n  )\n\n  if (estado === 'con-sesion') return <p>Ya has entrado como {usuario.nombre}.</p>\n\n  return (\n    <form action={accionEntrar} className=\"entrar\">\n      <h1>Entrar</h1>\n      <label>\n        Correo\n        <input name=\"correo\" type=\"email\" autoComplete=\"username\" defaultValue={resultado.correo} required />\n      </label>\n      <label>\n        Contraseña\n        <input name=\"clave\" type=\"password\" autoComplete=\"current-password\" required />\n      </label>\n      {resultado.error && <p role=\"alert\">{resultado.error}</p>}\n      <button disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>\n      <p className=\"pista\">amaia@ejemplo.es / marmitako (socia) · koldo@ejemplo.es / txangurro (junta)</p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// El navegador de mentira de las lecciones 76 y 77, ahora con state y replace\nexport default function Navegador({ marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [{ ruta: '/', state: null }], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const actual = historial.entradas[historial.indice]\n\n  function navegar(ruta, { replace = false, state = null } = {}) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (!replace && ruta === entradas[indice].ruta) return { entradas, indice }\n      const base = entradas.slice(0, replace ? indice : indice + 1)\n      return { entradas: [...base, { ruta, state }], indice: base.length }\n    })\n  }\n\n  // Escribir una dirección o usar un marcador carga la página desde cero\n  function cargar(ruta) {\n    navegar(ruta)\n    setCargas((n) => n + 1)\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? actual.ruta).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? actual.ruta} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      <nav className=\"marcadores\" aria-label=\"Marcadores\">\n        Marcadores:\n        {marcadores.map((ruta) => (\n          <button key={ruta} type=\"button\" onClick={() => cargar(ruta)}>\n            {ruta}\n          </button>\n        ))}\n      </nav>\n      <NavegadorContext value={{ ...actual, navegar }}>\n        <div className=\"pagina\" key={cargas}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n\n// Como useLocation y useNavigate de React Router\nexport function useUbicacion() {\n  const { ruta, state } = useContext(NavegadorContext)\n  return { pathname: ruta, state }\n}\n\nexport function useNavegar() {\n  return useContext(NavegadorContext).navegar\n}\n\n// Como <Routes>, sin parámetros: la ruta exacta o la de '*'\nexport function Rutas({ rutas }) {\n  const { ruta } = useContext(NavegadorContext)\n  return rutas[ruta] ?? rutas['*'] ?? null\n}\n\n// Como <Navigate>: navega en cuanto se pinta\nexport function Redirigir({ a, replace = false, state = null }) {\n  const navegar = useNavegar()\n  useEffect(() => {\n    navegar(a, { replace, state })\n  }, [])\n  return null\n}\n\n// Como <Link>\nexport function Enlace({ a, children }) {\n  const navegar = useNavegar()\n  function manejarClic(e) {\n    e.preventDefault()\n    navegar(a)\n  }\n  return (\n    <a href={a} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Sesion.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\nconst COMPROBANDO = { estado: 'comprobando', usuario: null }\nconst ANONIMO = { estado: 'anonimo', usuario: null }\n\nexport function ProveedorSesion({ children }) {\n  const [sesion, setSesion] = useState(COMPROBANDO)\n\n  // Al cargar la app: ¿el servidor me reconoce?\n  useEffect(() => {\n    let ignorar = false\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .catch(() => null)\n      .then((usuario) => {\n        if (ignorar) return\n        setSesion(usuario ? { estado: 'con-sesion', usuario } : ANONIMO)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [])\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/entrar', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ correo, clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    setSesion({ estado: 'con-sesion', usuario: await respuesta.json() })\n  }\n\n  async function salir() {\n    await fetch('/api/salir', { method: 'POST' })\n    setSesion(ANONIMO)\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  const valor = useContext(SesionContext)\n  if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')\n  return valor\n}\n"
    },
    {
      "nombre": "Servidor.jsx",
      "codigo": "// Este archivo hace de servidor dentro de la vista previa: contesta a las\n// peticiones a /api/ como lo haría tu API. No hace falta que lo leas.\nimport { useSyncExternalStore } from 'react'\n\nconst LATENCIA = 400\nconst SOCIOS = [\n  { id: 1, correo: 'amaia@ejemplo.es', clave: 'marmitako', nombre: 'Amaia', junta: false },\n  { id: 2, correo: 'koldo@ejemplo.es', clave: 'txangurro', nombre: 'Koldo', junta: true },\n]\nconst sesiones = new Map()\n// La cookie httpOnly: el navegador la guarda y la envía sola en cada\n// petición, pero tu JavaScript no puede leerla. Aquí la simula esta variable.\nlet cookie = null\nlet registro = []\nconst oyentes = new Set()\n\nfunction anotar(linea) {\n  registro = [...registro, linea].slice(-4)\n  oyentes.forEach((avisar) => avisar())\n}\n\n// El fetch de la vista previa, con los datos de la API simulada. Si este\n// archivo se vuelve a cargar, se toma el de debajo para no envolverlo dos veces.\nconst fetchDatos = window.fetch.fetchDatos ?? window.fetch\nconst responder = (datos, status = 200) =>\n  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } })\nconst publico = ({ id, nombre, junta }) => ({ id, nombre, junta })\n\nasync function atender(metodo, ruta, cuerpo) {\n  await new Promise((r) => setTimeout(r, LATENCIA))\n  if (metodo === 'POST' && ruta === '/api/entrar') {\n    const socio = SOCIOS.find((s) => s.correo === cuerpo.correo && s.clave === cuerpo.clave)\n    if (!socio) return responder({ error: 'Credenciales inválidas' }, 401)\n    cookie = 'sesion-' + Math.random().toString(36).slice(2)\n    sesiones.set(cookie, socio)\n    return responder(publico(socio))\n  }\n  if (metodo === 'POST' && ruta === '/api/salir') {\n    sesiones.delete(cookie)\n    cookie = null\n    return responder({ ok: true })\n  }\n  const socio = sesiones.get(cookie)\n  if (!socio) return responder({ error: 'Sesión ausente o caducada' }, 401)\n  if (ruta === '/api/yo') return responder(publico(socio))\n  if (ruta === '/api/cuentas' && !socio.junta) return responder({ error: 'Solo para la junta' }, 403)\n  const respuesta = await fetchDatos(ruta)\n  if (!respuesta.ok) return respuesta\n  const filas = await respuesta.json()\n  return responder(ruta === '/api/reservas' ? filas.filter((f) => f.socioId === socio.id) : filas)\n}\n\nasync function servidor(ruta, opciones = {}) {\n  const metodo = opciones.method ?? 'GET'\n  const respuesta = await atender(metodo, ruta, opciones.body ? JSON.parse(opciones.body) : {})\n  anotar(`${metodo} ${ruta} → ${respuesta.status}`)\n  return respuesta\n}\nservidor.fetchDatos = fetchDatos\nwindow.fetch = servidor\n\nfunction caducar() {\n  sesiones.clear()\n  anotar('(el servidor da por caducadas todas las sesiones)')\n}\n\nexport function PanelServidor() {\n  const lineas = useSyncExternalStore(\n    (avisar) => {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    () => registro,\n  )\n  return (\n    <aside className=\"servidor\" aria-label=\"Servidor simulado\">\n      <p>\n        Servidor simulado · cookie de sesión: {cookie ? 'guardada' : 'ninguna'}{' '}\n        <button onClick={caducar}>Caducar la sesión</button>\n      </p>\n      <pre>{lineas.join('\\n') || 'Sin peticiones todavía'}</pre>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nmain,\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n/* La web de La Marmita */\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nheader nav {\n  display: flex;\n  gap: 1rem;\n}\n\nheader p {\n  margin: 0.4rem 0;\n}\n\na {\n  color: #9a3412;\n}\n\n.entrar {\n  display: grid;\n  gap: 0.5rem;\n  max-width: 18rem;\n}\n\n.entrar label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.pista {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n.dos-lecturas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));\n  gap: 0.75rem;\n}\n\n.lectura {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.lectura h2 {\n  margin-top: 0;\n  font-size: 0.95rem;\n}\n\n/* El servidor simulado */\n.servidor {\n  margin: 0.75rem 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #64748b;\n  border-radius: 8px;\n  background: #f1f5f9;\n  font-size: 0.85rem;\n}\n\n.servidor p {\n  margin: 0;\n}\n\n.servidor pre {\n  margin: 0.4rem 0 0;\n  white-space: pre-wrap;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "socioId": 1,
        "texto": "Cena del jueves · 8 comensales"
      },
      {
        "id": 2,
        "socioId": 1,
        "texto": "Txoko libre el domingo · 4 comensales"
      },
      {
        "id": 3,
        "socioId": 2,
        "texto": "Comida del sábado · 12 comensales"
      }
    ],
    "cuentas": [
      {
        "id": 1,
        "texto": "Cuotas de octubre: 18 de 20 socios al día"
      },
      {
        "id": 2,
        "texto": "Bodega: 340 € en txakoli y rioja alavesa"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Sin sesión, /reservas te lleva a la página «Entrar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/reservas"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Entrar"
      }
    },
    {
      "descripcion": "Mientras se comprueba la sesión, la ruta protegida dice «Comprobando sesión…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/reservas"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Comprobando sesión…"
      }
    },
    {
      "descripcion": "Al entrar, vuelves a la página que habías pedido: Koldo pide /cuentas y acaba en /cuentas",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/cuentas"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "koldo@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "txangurro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dirección",
        "valor": "/cuentas"
      }
    },
    {
      "descripcion": "Después de entrar, «Atrás» te lleva a la portada y no al formulario",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/reservas"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "amaia@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "marmitako"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mis reservas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Atrás"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Portada"
      }
    },
    {
      "descripcion": "Con la sesión abierta, recargar /reservas no te saca de la página",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/reservas"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "amaia@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "marmitako"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mis reservas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Recargar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cena del jueves"
      }
    }
  ]
}
```

En el segundo, el cierre de sesión. La app tiene una caché por clave como la que escribiste en la lección 78 (`Cache.jsx`): lo que se pide una vez no se vuelve a pedir hasta que alguien lo borra. Antes de arreglar nada, provoca los dos fallos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: cerrar sesión de verdad",
  "consigna": "Primero, los fallos. Entra como Amaia, pulsa «Salir» y entra como Koldo: ¿de quién son esas reservas? Después pulsa «Caducar la sesión» y «Actualizar». Arréglalo en Sesion.jsx: al salir, vacía la caché (cache.vaciar()); en pedir, un 401 vacía la caché y pasa a anónimo con el aviso «Tu sesión ha caducado. Vuelve a entrar.». Comprueba que un 500 («Fallar la siguiente petición», en el panel de red) no cierra nada.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ProveedorCache, useDatos } from './Cache'\nimport { ProveedorSesion, useSesion } from './Sesion'\nimport Entrar from './Entrar'\nimport { PanelServidor } from './Servidor'\nimport './estilos.css'\n\nfunction MisReservas() {\n  const { pedir } = useSesion()\n  const { datos, error, recargar } = useDatos('reservas', () => pedir('/api/reservas'))\n\n  return (\n    <section>\n      <h2>Mis reservas</h2>\n      {error && <p role=\"alert\">No se han podido cargar tus reservas ({error.message}).</p>}\n      {!datos && !error && <p>Cargando…</p>}\n      <ul>\n        {datos?.map((reserva) => (\n          <li key={reserva.id}>{reserva.texto}</li>\n        ))}\n      </ul>\n      <button onClick={recargar}>Actualizar</button>\n    </section>\n  )\n}\n\nfunction Contenido() {\n  const { estado, usuario, salir } = useSesion()\n\n  if (estado === 'comprobando') return <p role=\"status\">Comprobando sesión…</p>\n  if (estado === 'anonimo') return <Entrar />\n  return (\n    <>\n      <p>\n        Hola, {usuario.nombre} · <button onClick={salir}>Salir</button>\n      </p>\n      <MisReservas />\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <>\n      <main>\n        <h1>Sociedad gastronómica La Marmita</h1>\n        <ProveedorCache>\n          <ProveedorSesion>\n            <Contenido />\n          </ProveedorSesion>\n        </ProveedorCache>\n      </main>\n      <PanelServidor />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Sesion.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\nimport { useCache } from './Cache'\n\nconst SesionContext = createContext(null)\nSesionContext.displayName = 'Sesion'\n\nconst COMPROBANDO = { estado: 'comprobando', usuario: null, aviso: null }\nconst ANONIMO = { estado: 'anonimo', usuario: null, aviso: null }\n\nexport function ProveedorSesion({ children }) {\n  const [sesion, setSesion] = useState(COMPROBANDO)\n  const cache = useCache()\n\n  useEffect(() => {\n    let ignorar = false\n    fetch('/api/yo')\n      .then((respuesta) => (respuesta.ok ? respuesta.json() : null))\n      .catch(() => null)\n      .then((usuario) => {\n        if (ignorar) return\n        setSesion(usuario ? { estado: 'con-sesion', usuario, aviso: null } : ANONIMO)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [])\n\n  async function entrar(correo, clave) {\n    const respuesta = await fetch('/api/entrar', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ correo, clave }),\n    })\n    if (respuesta.status === 401) throw new Error('Correo o contraseña incorrectos.')\n    if (!respuesta.ok) throw new Error('No se ha podido entrar. Inténtalo de nuevo.')\n    setSesion({ estado: 'con-sesion', usuario: await respuesta.json(), aviso: null })\n  }\n\n  async function salir() {\n    await fetch('/api/salir', { method: 'POST' })\n    // TODO 1: olvida también lo que la app guardó de este usuario (la caché)\n    setSesion(ANONIMO)\n  }\n\n  // Todas las peticiones con sesión pasan por aquí\n  async function pedir(ruta) {\n    const respuesta = await fetch(ruta)\n    // TODO 2: un 401 quiere decir que la sesión ha caducado: vacía la caché y\n    // pasa a anónimo con el aviso «Tu sesión ha caducado. Vuelve a entrar.»\n    // Cualquier otro error, como un 500, no cierra la sesión.\n    if (!respuesta.ok) throw new Error(`error ${respuesta.status}`)\n    return respuesta.json()\n  }\n\n  return <SesionContext value={{ ...sesion, entrar, salir, pedir }}>{children}</SesionContext>\n}\n\nexport function useSesion() {\n  const valor = useContext(SesionContext)\n  if (!valor) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')\n  return valor\n}\n"
    },
    {
      "nombre": "Cache.jsx",
      "codigo": "import { createContext, useContext, useEffect, useState } from 'react'\n\nconst CacheContext = createContext(null)\nCacheContext.displayName = 'Cache'\n\n// Una caché mínima por clave, como la de la lección 78: lo que se pide una\n// vez se guarda y no se vuelve a pedir hasta que alguien lo borra.\nexport function ProveedorCache({ children }) {\n  const [datos, setDatos] = useState({})\n\n  function guardar(clave, valor) {\n    setDatos((anteriores) => ({ ...anteriores, [clave]: valor }))\n  }\n\n  function borrar(clave) {\n    setDatos(({ [clave]: borrado, ...resto }) => resto)\n  }\n\n  function vaciar() {\n    setDatos({})\n  }\n\n  return <CacheContext value={{ datos, guardar, borrar, vaciar }}>{children}</CacheContext>\n}\n\nexport function useCache() {\n  return useContext(CacheContext)\n}\n\n// Lee una clave de la caché y, si no está, la pide con cargar()\nexport function useDatos(clave, cargar) {\n  const { datos, guardar, borrar } = useCache()\n  const [error, setError] = useState(null)\n  const [intento, setIntento] = useState(0)\n  const enCache = clave in datos\n\n  useEffect(() => {\n    if (enCache) return\n    let ignorar = false\n    cargar()\n      .then((valor) => {\n        if (!ignorar) guardar(clave, valor)\n      })\n      .catch((motivo) => {\n        if (!ignorar) setError(motivo)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [clave, enCache, intento])\n\n  function recargar() {\n    setError(null)\n    borrar(clave)\n    setIntento((n) => n + 1)\n  }\n\n  return { datos: datos[clave], error, recargar }\n}\n"
    },
    {
      "nombre": "Entrar.jsx",
      "codigo": "import { useActionState } from 'react'\nimport { useSesion } from './Sesion'\n\nexport default function Entrar() {\n  const { entrar, aviso } = useSesion()\n  const [resultado, accionEntrar, enviando] = useActionState(\n    async (anterior, datos) => {\n      const correo = datos.get('correo')\n      try {\n        await entrar(correo, datos.get('clave'))\n        return { error: null, correo: '' }\n      } catch (error) {\n        return { error: error.message, correo }\n      }\n    },\n    { error: null, correo: '' },\n  )\n\n  return (\n    <form action={accionEntrar} className=\"entrar\">\n      <h2>Entrar</h2>\n      {aviso && <p role=\"status\">{aviso}</p>}\n      <label>\n        Correo\n        <input name=\"correo\" type=\"email\" autoComplete=\"username\" defaultValue={resultado.correo} required />\n      </label>\n      <label>\n        Contraseña\n        <input name=\"clave\" type=\"password\" autoComplete=\"current-password\" required />\n      </label>\n      {resultado.error && <p role=\"alert\">{resultado.error}</p>}\n      <button disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>\n      <p className=\"pista\">amaia@ejemplo.es / marmitako · koldo@ejemplo.es / txangurro</p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Servidor.jsx",
      "codigo": "// Este archivo hace de servidor dentro de la vista previa: contesta a las\n// peticiones a /api/ como lo haría tu API. No hace falta que lo leas.\nimport { useSyncExternalStore } from 'react'\n\nconst LATENCIA = 400\nconst SOCIOS = [\n  { id: 1, correo: 'amaia@ejemplo.es', clave: 'marmitako', nombre: 'Amaia', junta: false },\n  { id: 2, correo: 'koldo@ejemplo.es', clave: 'txangurro', nombre: 'Koldo', junta: true },\n]\nconst sesiones = new Map()\n// La cookie httpOnly: el navegador la guarda y la envía sola en cada\n// petición, pero tu JavaScript no puede leerla. Aquí la simula esta variable.\nlet cookie = null\nlet registro = []\nconst oyentes = new Set()\n\nfunction anotar(linea) {\n  registro = [...registro, linea].slice(-4)\n  oyentes.forEach((avisar) => avisar())\n}\n\n// El fetch de la vista previa, con los datos de la API simulada. Si este\n// archivo se vuelve a cargar, se toma el de debajo para no envolverlo dos veces.\nconst fetchDatos = window.fetch.fetchDatos ?? window.fetch\nconst responder = (datos, status = 200) =>\n  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json' } })\nconst publico = ({ id, nombre, junta }) => ({ id, nombre, junta })\n\nasync function atender(metodo, ruta, cuerpo) {\n  await new Promise((r) => setTimeout(r, LATENCIA))\n  if (metodo === 'POST' && ruta === '/api/entrar') {\n    const socio = SOCIOS.find((s) => s.correo === cuerpo.correo && s.clave === cuerpo.clave)\n    if (!socio) return responder({ error: 'Credenciales inválidas' }, 401)\n    cookie = 'sesion-' + Math.random().toString(36).slice(2)\n    sesiones.set(cookie, socio)\n    return responder(publico(socio))\n  }\n  if (metodo === 'POST' && ruta === '/api/salir') {\n    sesiones.delete(cookie)\n    cookie = null\n    return responder({ ok: true })\n  }\n  const socio = sesiones.get(cookie)\n  if (!socio) return responder({ error: 'Sesión ausente o caducada' }, 401)\n  if (ruta === '/api/yo') return responder(publico(socio))\n  if (ruta === '/api/cuentas' && !socio.junta) return responder({ error: 'Solo para la junta' }, 403)\n  const respuesta = await fetchDatos(ruta)\n  if (!respuesta.ok) return respuesta\n  const filas = await respuesta.json()\n  return responder(ruta === '/api/reservas' ? filas.filter((f) => f.socioId === socio.id) : filas)\n}\n\nasync function servidor(ruta, opciones = {}) {\n  const metodo = opciones.method ?? 'GET'\n  const respuesta = await atender(metodo, ruta, opciones.body ? JSON.parse(opciones.body) : {})\n  anotar(`${metodo} ${ruta} → ${respuesta.status}`)\n  return respuesta\n}\nservidor.fetchDatos = fetchDatos\nwindow.fetch = servidor\n\nfunction caducar() {\n  sesiones.clear()\n  anotar('(el servidor da por caducadas todas las sesiones)')\n}\n\nexport function PanelServidor() {\n  const lineas = useSyncExternalStore(\n    (avisar) => {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    () => registro,\n  )\n  return (\n    <aside className=\"servidor\" aria-label=\"Servidor simulado\">\n      <p>\n        Servidor simulado · cookie de sesión: {cookie ? 'guardada' : 'ninguna'}{' '}\n        <button onClick={caducar}>Caducar la sesión</button>\n      </p>\n      <pre>{lineas.join('\\n') || 'Sin peticiones todavía'}</pre>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nmain,\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n/* La web de La Marmita */\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nheader nav {\n  display: flex;\n  gap: 1rem;\n}\n\nheader p {\n  margin: 0.4rem 0;\n}\n\na {\n  color: #9a3412;\n}\n\n.entrar {\n  display: grid;\n  gap: 0.5rem;\n  max-width: 18rem;\n}\n\n.entrar label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.pista {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n.dos-lecturas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));\n  gap: 0.75rem;\n}\n\n.lectura {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.lectura h2 {\n  margin-top: 0;\n  font-size: 0.95rem;\n}\n\n/* El servidor simulado */\n.servidor {\n  margin: 0.75rem 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #64748b;\n  border-radius: 8px;\n  background: #f1f5f9;\n  font-size: 0.85rem;\n}\n\n.servidor p {\n  margin: 0;\n}\n\n.servidor pre {\n  margin: 0.4rem 0 0;\n  white-space: pre-wrap;\n}\n"
    }
  ],
  "archivoInicial": "Sesion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "socioId": 1,
        "texto": "Cena del jueves · 8 comensales"
      },
      {
        "id": 2,
        "socioId": 1,
        "texto": "Txoko libre el domingo · 4 comensales"
      },
      {
        "id": 3,
        "socioId": 2,
        "texto": "Comida del sábado · 12 comensales"
      }
    ],
    "cuentas": [
      {
        "id": 1,
        "texto": "Cuotas de octubre: 18 de 20 socios al día"
      },
      {
        "id": 2,
        "texto": "Bodega: 340 € en txakoli y rioja alavesa"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Si Amaia sale y entra Koldo, Koldo ve sus reservas y no las de Amaia",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "amaia@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "marmitako"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Cena del jueves"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Salir"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "koldo@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "txangurro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Comida del sábado"
      }
    },
    {
      "descripcion": "Si la sesión caduca, la siguiente petición te devuelve a «Entrar» con un aviso",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "amaia@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "marmitako"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Cena del jueves"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Caducar la sesión"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Actualizar"
          }
        }
      ],
      "espera": {
        "texto": "Tu sesión ha caducado. Vuelve a entrar."
      }
    },
    {
      "descripcion": "Un error 500 no cierra la sesión: avisa y sigues dentro",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "amaia@ejemplo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Contraseña",
            "texto": "marmitako"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Cena del jueves"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Actualizar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "error 500"
      }
    }
  ]
}
```

Hay otra forma de arreglar el primer fallo: poner el usuario en la clave (`'reservas-' + usuario.id`), como hace esta web. Pruébala también, y piensa por qué la lección 86 hace las dos cosas.

**Retos para seguir practicando** (sin comprobación automática):

1. Conecta el proveedor a la API del proyecto 52, con el proxy de Vite y el token en memoria. Entra, recarga y mira qué pasa con la sesión. Cámbialo a `localStorage`, recarga otra vez y escribe en la consola del navegador `localStorage.getItem('token')`: lo que acabas de leer lo leería también cualquier XSS.
2. Haz el reto 1 del proyecto 52, `POST /token/refrescar`, pero con el token de refresco en una cookie `httpOnly` con `Path`, `Secure` y `SameSite`. Úsalo en el estado «comprobando» al cargar, y para reintentar una vez una petición que vuelva con un 401.
3. Sincroniza las pestañas: si sales en una, que las demás pasen a anónimo. Puedes avisarlas con `BroadcastChannel` o con el evento `storage`.
4. Reescribe la ruta protegida en modo datos, con un `loader` que lance `redirect('/entrar?volver=…')`, y valida `volver` con `destinoSeguro` antes de usarlo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useContext",
      "descripcion": "Leer un contexto desde cualquier componente, y por qué cambiar el valor del proveedor vuelve a renderizar a todos los que lo leen.",
      "url": "https://react.dev/reference/react/useContext",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Navigate",
      "descripcion": "El componente que redirige al pintarse: to, replace y state.",
      "url": "https://reactrouter.com/api/components/Navigate",
      "etiqueta": "React Router"
    },
    {
      "titulo": "QueryClient",
      "descripcion": "La caché de TanStack Query: clear, invalidateQueries y el resto de sus métodos.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/reference/classes/QueryClient",
      "etiqueta": "TanStack Query"
    },
    {
      "titulo": "Session Management Cheat Sheet",
      "descripcion": "La guía de OWASP sobre sesiones: atributos de las cookies, almacenamiento en el navegador, caducidad y cierre de sesión.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "Cross-Site Request Forgery Prevention Cheat Sheet",
      "descripcion": "Cómo se defiende un servidor del CSRF y qué hace y qué no hace SameSite.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    },
    {
      "titulo": "Set-Cookie",
      "descripcion": "Cada atributo de una cookie, con HttpOnly, Secure, SameSite y los prefijos __Host- y __Secure-.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie",
      "etiqueta": "MDN"
    }
  ]
}
```
