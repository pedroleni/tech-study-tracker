# Proyecto avanzado: migrar una app de `react-router-dom` 6 a React Router 8

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-migrar-una-app-de-react-router-dom-6-a-react-router-8` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [Upgrading from v6 (docs de la 7)](https://reactrouter.com/7.18.4/upgrading/v6) + [Upgrading from v7](https://reactrouter.com/upgrading/v7) + [Migrating to RouterProvider (docs de la 6)](https://reactrouter.com/6.30.3/upgrading/v6-data) + [Middleware](https://reactrouter.com/how-to/middleware) + [Framework Adoption from RouterProvider](https://reactrouter.com/upgrading/router-provider) + [GHSA-wrjc-x8rr-h8h6](https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6) — ver `contenido/react-router/TEMARIO.md` #25
- **Requiere:** Los módulos 1 a 3 de esta ficha (sobre todo las lecciones 2, 3, 8 y 10), la 14 para el paso 4 y la 23 (leer y migrar código); de React, la 52 (pedir datos en un efecto), la 102 (autenticación en una SPA) y las 83 y 84 (Testing Library)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `prestamo-biblioteca`)

---

## Qué vas a migrar

La biblioteca del **IES Tierras Altas**, un instituto de Soria, presta libros de lectura a sus alumnos con una app que alguien del departamento de Informática escribió en 2024. Tiene un catálogo con buscador, la ficha de cada libro con el estado de sus ejemplares y, para el personal de la biblioteca, la lista de préstamos activos (con los vencidos marcados), las devoluciones y un formulario para registrar un préstamo nuevo.

Funciona, y está escrita como se escribía entonces, como la que te vas a encontrar en tu primer trabajo (la lección 1 contó que la 6 y la 7 se llevan casi el 80 % de las descargas):

- **`react-router-dom` 6.26.2**, con `<BrowserRouter>` y `<Routes>`, y React 18.3.1;
- **los datos, pedidos con `useEffect`**, cada página con su «Cargando…» y su bandera `ignorar` (lección 52 de React);
- **un `RutaProtegida`** que envuelve las rutas del personal y redirige a `/entrar?volver=…`, el de la lección 102 de React;
- **formularios con `onSubmit` y `fetch`**, y un `navigate()` al terminar.

Vas a llevarla a **React Router 8.5.0 en modo datos** sin romper nada por el camino, y lo vas a saber porque la app trae **30 tests de caracterización** que no se pueden poner en rojo en ningún momento. Al final mides lo que has ganado: código borrado y peticiones que dejan de ir en cascada.

Hay además un motivo que no es de gusto. Con la app recién instalada, `npm audit` dice esto:

```text
# npm audit report

@remix-run/router  <=1.23.2
Severity: high
React Router vulnerable to XSS via Open Redirects - https://github.com/advisories/GHSA-2w69-qvjg-hvjx
React Router's same-origin redirect with path starting // causes open redirect via protocol-relative URL reinterpretation - https://github.com/advisories/GHSA-2j2x-hqr9-3h42
fix available via `npm audit fix --force`
Will install react-router-dom@6.30.6, which is outside the stated dependency range
node_modules/@remix-run/router
  react-router  6.0.0 - 7.17.0
  Depends on vulnerable versions of @remix-run/router
  node_modules/react-router
    react-router-dom  6.0.0-alpha.0 - 6.30.2
    Depends on vulnerable versions of @remix-run/router
    Depends on vulnerable versions of react-router
    node_modules/react-router-dom


3 high severity vulnerabilities

To address all issues, run:
  npm audit fix --force
```

Tres paquetes de React Router con avisos de severidad alta. `npm audit --json` da el detalle: son cinco avisos distintos, de `react-router` y de `@remix-run/router`, el núcleo que usa la 6 por debajo. Tres se arreglan subiendo dentro de la 6, y el paso 1 lo comprobará. Pero con la 6.30.6, la última, quedan dos que **no tienen parche en la 6**. Uno es [GHSA-wrjc-x8rr-h8h6](https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6), publicado el 22 de julio de 2026: afecta a `react-router` desde la 6.0.0 hasta antes de la 7.18.0 y solo se arregla a partir de la 7.18.0. Es la continuación de [GHSA-9jcx-v3wj-wh4m](https://github.com/remix-run/react-router/security/advisories/GHSA-9jcx-v3wj-wh4m), el que la lección 20 cuenta con las redirecciones abiertas: una ruta que viene de fuera y llega a `navigate()` o a `<Link>` puede acabar sacándote de la web. Esta app hace justo eso con el `?volver=` del formulario de entrar.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Tu validación ayuda, pero el fallo está en el router",
  "contenido": "La app ya valida el volver como pide la lección 20: el origen tiene que ser el nuestro y, además, la ruta normalizada no puede empezar por dos barras, y once tests lo vigilan. Aun así, el aviso es sobre cómo el propio router interpreta la ruta que le pasas, y su arreglo está en el código del router. En la 6 no lo hay, ni lo habrá: la 6.30.6 es de agosto de 2026 y npm audit propone directamente la 7.18.4. Por eso esta lección no explica cómo atacar el fallo: te basta con saber que existe y que en la 6 no se cierra."
}
```

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "El camino, en cuatro pasos",
  "items": [
    {
      "fecha": "Paso 1",
      "titulo": "A la última 7, con sus future flags",
      "texto": "Primero la última 6 (6.30.6), que avisa de lo que cambiará. Después, las dos future flags de la 7, una a una. Y entonces la 7.18.4, que ya no tiene avisos de seguridad pendientes."
    },
    {
      "fecha": "Paso 2",
      "titulo": "A la 8: los mínimos y los import",
      "texto": "Node 22.22 o superior y React 19.2.7 o superior, todavía en la 7. Después, react-router-dom fuera: todo se importa de react-router. Y la 8.5.0, que en modo declarativo no pide más."
    },
    {
      "fecha": "Paso 3",
      "titulo": "Al modo datos, ruta a ruta",
      "texto": "Las rutas de siempre, dentro de una ruta comodín de un router de datos. Y de ahí van saliendo una a una: la sesión, el catálogo, la ficha, los préstamos y el préstamo nuevo, cada una con su loader, su action y su ErrorBoundary."
    },
    {
      "fecha": "Paso 4 (opcional)",
      "titulo": "El modo framework, en SPA Mode",
      "texto": "Con las rutas ya convertidas en módulos, el plugin de Vite de React Router: routes.ts, root.tsx y entry.client.tsx, y un index.html que se genera al construir."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-router-proyectos (carpeta prestamo-biblioteca). La rama main trae la app en la 6 con sus tests en verde y un comentario TODO (paso N) en cada sitio que vas a cambiar, con el mismo número que los pasos de esta lección. La rama solucion tiene la app migrada a la 8 en modo datos. El paso 4 es opcional y no está en ninguna rama: lo haces tú, siguiendo la lección."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un commit por paso",
  "contenido": "Las dos guías oficiales de actualización piden lo mismo: haz un commit después de cada paso, y si puedes, publícalo, en vez de hacerlo todo de golpe. Aquí cada paso deja los tests en verde, el typecheck limpio y el build funcionando. Si un paso te los rompe, vuelves al commit anterior y lo intentas de otra manera."
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 22.12 o superior** para arrancar: es lo que piden Vite 8 y Vitest 5. **Desde el paso 2, 22.22 o superior**, porque React Router 8 no se instala con menos; el `.nvmrc` que añade ese paso pide la 24, la LTS actual. Compruébalo con `node --version`.
- **Las lecciones 2, 3, 8 y 10 de esta ficha** (`loader`, `action`, errores por ruta y middleware): aquí se usan sin volver a explicarlas. Y la **23**, que cuenta cómo reconocer cada época del router y qué son las *future flags*.
- **Las lecciones 83 y 84 de React**, para leer los tests.
- **TypeScript 7.0.2**, el compilador nativo, que el proyecto fija en su `package.json`. Se usa igual que la 6 (`npm run typecheck` llama a `tsc --noEmit`) y funciona con el Node 22.12 del punto de partida.
- **Un navegador con herramientas de desarrollo.** Los tests de esta app corren en jsdom, y vas a ver que hay un fallo que jsdom no ve.

### Del cero al proyecto en marcha

1. **Consigue el código**: `git clone https://github.com/pedroleni/react-router-proyectos.git`, o en [su página](https://github.com/pedroleni/react-router-proyectos), botón **Code** → **Download ZIP**.
2. **Abre en el editor la carpeta `prestamo-biblioteca/`** y su terminal.
3. **Instala y arranca**: `npm install` y `npm run dev`. Abre `http://localhost:5173`. Para la zona de préstamos, el usuario es `marta` y la contraseña, `tierrasaltas` (es una app de prácticas: está en claro en `servidor/datos.ts`).
4. **Pasa los tests**: `npm test`. Al revés que en otros proyectos, aquí empiezan todos en verde, y tu trabajo es que sigan así:

```text
 Test Files  8 passed (8)
      Tests  46 passed (46)
```

5. **Haz un commit** antes de tocar nada. Es tu red.

## Cómo está organizado

```text
src/
├── main.tsx                  llama a iniciarApp con el div#root
├── app.tsx                   iniciarApp, BrowserRouter y las rutas            ← pasos 1, 2 y 3.1
├── sesion.tsx                SesionProvider: quién ha entrado                 ← paso 3.2
├── componentes/
│   ├── Marco.tsx             cabecera, menú y pie; «Cerrar sesión»            ← pasos 1 y 3.2
│   ├── RutaProtegida.tsx     sin sesión, a /entrar?volver=…                   ← pasos 2 y 3.5
│   └── Campo.tsx             una etiqueta, su campo y su error
├── paginas/
│   ├── Catalogo.tsx          /catalogo?q=…, con su buscador                   ← paso 3.3
│   ├── FichaLibro.tsx        /catalogo/:id, el libro y sus ejemplares         ← paso 3.4
│   ├── Entrar.tsx            /entrar                                          ← paso 3.2
│   ├── Prestamos.tsx         /prestamos, con «Devolver»                       ← paso 3.5
│   ├── NuevoPrestamo.tsx     /prestamos/nuevo                                 ← paso 3.6
│   └── NoEncontrada.tsx      cualquier otra dirección                         ← paso 3.7
├── api.ts                    pedirJson y enviarJson
├── destino.ts                el ?volver= validado
└── formato.ts, tipos.ts, estilos.css
servidor/                     la API en memoria y su plugin de Vite            (no se toca)
pruebas/                      30 de caracterización, 11 de destinoSeguro       (no se tocan)
                              y 5 de la cookie
```

No hay un servidor aparte: `servidor/plugin.ts` es un plugin de Vite que sirve la API (`/api/libros`, `/api/prestamos`, `/api/sesion`…) en `npm run dev` y en `npm run preview`, con los datos en memoria y una cookie de sesión. La cookie es `HttpOnly` y `SameSite=Lax`, y si la petición llega por HTTPS (o con `COOKIE_SEGURA=1`) lleva además `Secure` y se llama `__Host-sesion`, un prefijo que el navegador solo acepta con `Secure`, `Path=/` y sin `Domain`. La vigilan 5 tests de `pruebas/servidor/`, que levantan un servidor HTTP de Node con el middleware de la API y comprueban la cabecera `Set-Cookie` exacta, por HTTP y por HTTPS (con la cabecera `X-Forwarded-Proto` que pondría un proxy). Si quitas `Secure` o escribes mal el prefijo, se ponen rojos tres de los cinco. **Cada respuesta tarda 300 ms**, como una red de verdad, para que las peticiones en cascada se noten; `LATENCIA_API=0 npm run dev` la quita.

Estas son las rutas, tal como las declara la app en la 6:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de partida, con <Routes>",
  "nodos": [
    {
      "nombre": "BrowserRouter",
      "nivel": 0,
      "etiqueta": "dentro de SesionProvider",
      "nota": "← la sesión vive en un contexto de React, fuera del router"
    },
    {
      "nombre": "Marco",
      "nivel": 1,
      "etiqueta": "ruta de maquetación",
      "nota": "← cabecera, menú y pie, con un <Outlet>"
    },
    {
      "nombre": "Navigate",
      "nivel": 2,
      "etiqueta": "index",
      "nota": "← / lleva a /catalogo"
    },
    {
      "nombre": "Catalogo",
      "nivel": 2,
      "etiqueta": "catalogo",
      "nota": "← un efecto pide /api/libros?q=…"
    },
    {
      "nombre": "FichaLibro",
      "nivel": 2,
      "etiqueta": "catalogo/:id",
      "nota": "← un efecto pide el libro; otro, sus ejemplares"
    },
    {
      "nombre": "Entrar",
      "nivel": 2,
      "etiqueta": "entrar",
      "nota": "← onSubmit, fetch y navigate(volver)"
    },
    {
      "nombre": "RutaProtegida",
      "nivel": 2,
      "etiqueta": "sin path",
      "nota": "← sin sesión, <Navigate to=\"/entrar?volver=…\">"
    },
    {
      "nombre": "Prestamos",
      "nivel": 3,
      "etiqueta": "prestamos"
    },
    {
      "nombre": "NuevoPrestamo",
      "nivel": 3,
      "etiqueta": "prestamos/nuevo"
    },
    {
      "nombre": "NoEncontrada",
      "nivel": 2,
      "etiqueta": "*"
    }
  ]
}
```

### Los tests que no se pueden poner en rojo

Un **test de caracterización** no comprueba lo que la app *debería* hacer, sino lo que **hace hoy**. Lo escribes antes de tocar código antiguo, para que te avise de cualquier cambio de comportamiento, también de los que nadie había pensado. Aquí hay 30: el catálogo y su búsqueda (también con espacios de más o vacía), la ficha y su 404, entrar y volver adonde ibas, que Atrás no te devuelva al formulario después de entrar, el `?volver=` que no saca de la web ni rompe nada si viene mal formado, cerrar sesión (también cuando la API falla), devolver un libro, registrar uno nuevo con sus errores, y qué pasa cuando la API falla.

El truco para que sirvan durante toda la migración está en **lo que no saben**. No saben qué router usa la app, ni si pide sus datos en un efecto o en un `loader`. Solo conocen tres cosas, y ninguna cambia en toda la lección: la función con la que la app se monta, la URL y lo que se ve en la página.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Antes de cada test: la API con sus datos de partida, «hoy» fijo y sin sesión.\nexport function prepararRed() {\n  api = crearApi({ hoy: () => '2026-10-26' })\n  sesion = null\n  vi.stubGlobal('fetch', async (entrada: string | URL, init: RequestInit = {}) => {\n    const url = new URL(String(entrada), window.location.href)\n    init.signal?.throwIfAborted()\n    const respuesta = api.manejar({\n      metodo: (init.method ?? 'GET').toUpperCase(),\n      ruta: url.pathname + url.search,\n      cuerpo: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,\n      sesion,\n    })\n    // La cookie de sesión, como haría el navegador.\n    if (respuesta.sesion !== undefined) sesion = respuesta.sesion\n    // Como en la red, la respuesta llega después, no en el mismo instante.\n    await new Promise((resolver) => setTimeout(resolver, 0))\n    init.signal?.throwIfAborted()\n    return new Response(respuesta.cuerpo === undefined ? null : JSON.stringify(respuesta.cuerpo), {\n      status: respuesta.estado,\n      headers: { 'Content-Type': 'application/json' },\n    })\n  })\n}\n\n// Después de cada test.\nexport function cerrar() {\n  if (desmontar) act(() => desmontar!())\n  desmontar = null\n  // Los tests del servidor (pruebas/servidor) corren en Node, sin documento.\n  if (typeof document !== 'undefined') document.body.innerHTML = ''\n  vi.unstubAllGlobals()\n}\n\n// Abre la app en una dirección, como si la escribieras en la barra.\nexport async function abrir(direccion: string) {\n  window.history.replaceState(null, '', direccion)\n  const contenedor = document.createElement('div')\n  document.body.append(contenedor)\n  await act(async () => {\n    desmontar = iniciarApp(contenedor)\n  })\n  return userEvent.setup()\n}",
  "anotaciones": [
    {
      "fragmento": "vi.stubGlobal('fetch'",
      "nota": "Los tests no levantan ningún servidor: cambian fetch por una función que le pasa la petición a la misma API en memoria que sirve npm run dev. Les da igual quién llame a fetch, un efecto o un loader."
    },
    {
      "fragmento": "if (respuesta.sesion !== undefined) sesion = respuesta.sesion",
      "nota": "La cookie de sesión, como la guardaría el navegador. Así el test de entrar y volver recorre el formulario de verdad."
    },
    {
      "fragmento": "await new Promise((resolver) => setTimeout(resolver, 0))",
      "nota": "La respuesta llega después, nunca en el mismo instante. Sin esto, una app con efectos y otra con loader se comportarían distinto por razones que no tienen nada que ver con la app."
    },
    {
      "fragmento": "window.history.replaceState(null, '', direccion)",
      "nota": "Abrir la app en una dirección es poner esa URL y montarla, como al escribirla en la barra. Vale igual con BrowserRouter que con createBrowserRouter, porque los dos leen window.location."
    },
    {
      "fragmento": "desmontar = iniciarApp(contenedor)",
      "nota": "Lo único que los tests saben de la app: iniciarApp, la misma función que llama main.tsx. Devuelve cómo desmontarla. Durante toda la migración cambia lo de dentro, pero no su firma."
    }
  ]
}
```

Así es uno de los tests. No hay ni un `MemoryRouter` ni un `render(<App />)`: si los hubiera, habría que cambiarlos al pasar al modo datos, y un test que cambias a la vez que el código ya no te protege de nada.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  test('sin sesión, los préstamos llevan a entrar, y después se vuelve', async () => {\n    const usuario = await abrir('/prestamos')\n    await waitFor(() => expect(ruta()).toBe('/entrar?volver=%2Fprestamos'))\n    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')\n    await usuario.type(screen.getByLabelText('Contraseña'), 'tierrasaltas')\n    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))\n    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()\n    expect(ruta()).toBe('/prestamos')\n    expect(screen.getByText('Marta Gil')).toBeInTheDocument()\n  })",
  "anotaciones": [
    {
      "fragmento": "await abrir('/prestamos')",
      "nota": "La app arranca en /prestamos sin sesión, como si alguien pegara el enlace."
    },
    {
      "fragmento": "await waitFor(() => expect(ruta()).toBe('/entrar?volver=%2Fprestamos'))",
      "nota": "Comprueba la URL exacta, con el volver codificado. En la 6 la pone un Navigate dentro de RutaProtegida; en la 8 la pondrá un redirect lanzado desde un middleware. El test no lo sabe ni le importa."
    },
    {
      "fragmento": "await usuario.click(screen.getByRole('button', { name: 'Entrar' }))",
      "nota": "Rellena y envía el formulario de verdad: en la 6 lo recoge un onSubmit, y en la 8 una action."
    },
    {
      "fragmento": "expect(screen.getByText('Marta Gil')).toBeInTheDocument()",
      "nota": "Y al volver, la cabecera ya dice quién ha entrado. Este detalle va a decidir en qué orden migras las rutas en el paso 3."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "exito",
  "titulo": "La regla de esta lección",
  "contenido": "Los 30 tests de caracterización y la carpeta servidor no se tocan en ningún paso. Si un cambio te obliga a modificarlos, el cambio está mal. Lo que sí puedes hacer es añadir tests nuevos para lo que la app hace mejor que antes, en su propia carpeta: el paso 3.2 añade uno en pruebas/nuevos. Al terminar, git diff entre el primer commit y el último no tiene ni una línea en los tests de partida ni en servidor."
}
```

## Paso 1: a la última 7, con sus *future flags* (`package.json` y `app.tsx`)

La guía oficial para salir de la 6, [Upgrading from v6](https://reactrouter.com/7.18.4/upgrading/v6), promete algo concreto: *«The v7 upgrade has no breaking changes if you have enabled all future flags»*, es decir, si has activado antes todas las *future flags*, pasar a la 7 no rompe nada. Una *future flag* (lección 23) es un interruptor que te deja probar, todavía en la 6, un comportamiento que en la 7 será el de siempre. Lo activas, compruebas que todo sigue bien y haces un commit. Uno por uno.

### 1a. La última 6

Las *flags* más nuevas y sus avisos solo están en la última 6. La app está en la 6.26.2, de septiembre de 2024:

```bash
npm install react-router-dom@6
```

El repositorio trae un `.npmrc` con `save-exact=true`, así que `package.json` apunta la versión exacta, `6.30.6`. Pasa los tests: siguen los 46 en verde, pero ahora la salida trae avisos que antes no estaban, uno por cada archivo de tests:

```text
⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.
```

Es decir: «la 7 envolverá las actualizaciones de estado en `React.startTransition`; puedes activarlo ya con la *flag* `v7_startTransition`», y «la resolución de rutas relativas dentro de las rutas comodín cambia en la 7; actívalo ya con `v7_relativeSplatPath`». La 6 te dice exactamente qué dos *flags* le faltan a esta app. Las otras cuatro de la guía (`v7_fetcherPersist`, `v7_normalizeFormMethod`, `v7_partialHydration` y `v7_skipActionErrorRevalidation`) son del modo datos, y la guía lo avisa: *«If you are not using a `<RouterProvider>` you can skip this»*.

`npm audit` también ha cambiado. Los avisos que tenían arreglo en la 6 se han ido; los que no, siguen:

```text
# npm audit report

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install react-router-dom@7.18.4, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom

2 moderate severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force
```

*«Will install react-router-dom@7.18.4, which is a breaking change»*: para cerrar los dos que quedan, npm te propone la 7. El segundo, [GHSA-337j-9hxr-rhxg](https://github.com/remix-run/react-router/security/advisories/GHSA-337j-9hxr-rhxg), es de la hidratación con renderizado en servidor y a esta SPA no le afecta; el primero, como has visto, sí.

### 1b. `v7_relativeSplatPath`

Cambia cómo se resuelven los enlaces relativos (`<Link to="equipo">`) dentro de una ruta comodín con más de un segmento, como `panel/*`. Esta app no tiene ninguna: su único comodín es el `*` de la página «no existe», y no tiene enlaces relativos. Se activa en el `BrowserRouter` y no hay nada más que cambiar:

```tsx
<BrowserRouter future={{ v7_relativeSplatPath: true }}>
```

Tests en verde, y la salida pasa de dos avisos a uno. Commit.

### 1c. `v7_startTransition`

La 7 actualiza el estado del router dentro de `startTransition` (lección 51 de React): la navegación pasa a ser una actualización que no corre prisa. La guía dice que solo tienes que cambiar algo si usas `React.lazy` dentro de un componente, y aquí no se usa:

```tsx
<BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
```

Los 46 tests, en verde, y ningún aviso en la salida. Parece hecho. **Ahora abre la app en el navegador**, entra, ve a «Préstamos» y pulsa «Cerrar sesión». En vez de quedarte en el catálogo, acabas en `/entrar?volver=%2Fprestamos`, como si hubieras intentado entrar en préstamos sin sesión.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "  const { usuario, salir } = useSesion()\n  const navigate = useNavigate()\n  const [errorAlSalir, setErrorAlSalir] = useState(false)\n\n  async function manejarSalir() {\n    setErrorAlSalir(false)\n    try {\n      await salir()\n      navigate('/catalogo')\n    } catch {\n      // La sesión sigue abierta: se queda a la vista, y el botón, para reintentar.\n      setErrorAlSalir(true)\n    }\n  }\n\n// salir() pide DELETE /api/sesion y, si va bien, hace setUsuario(null).\n// RutaProtegida, que envuelve /prestamos, hace esto:\n//   if (!usuario) return <Navigate to={`/entrar?volver=${volver}`} replace />\n//\n// Con v7_startTransition activada, estás en /prestamos\n// y pulsas «Cerrar sesión». ¿Dónde acabas?",
  "opciones": [
    "En /catalogo, porque navigate se llama al final",
    "En /entrar?volver=%2Fprestamos: el cambio de sesión se pinta antes que la navegación",
    "En /prestamos, sin sesión y con la lista vacía",
    "Depende de lo que tarde la API: unas veces en un sitio y otras en otro"
  ],
  "correcta": 1,
  "explicacion": "Con la flag, la navegación va en una transición y setUsuario(null) no. React pinta primero la actualización urgente, todavía con la ruta vieja: RutaProtegida ve que no hay sesión y su Navigate reemplaza la entrada. En Chromium el historial queda así: push /catalogo, replace /entrar?volver=%2Fprestamos. Sin la flag (paso 1b), solo push /catalogo. Lo probamos tres veces con cada build y salió siempre igual."
}
```

Los tests no lo ven porque, en jsdom, con su `fetch` simulado y React 18, las actualizaciones caen en otro orden y la última navegación es la buena. Lo comprobamos en el paso 2a, todavía con React 18, apuntando las llamadas al historial desde el test: `replace /entrar?volver=%2Fprestamos | replace /entrar?volver=%2Fprestamos | push /catalogo`. En Chromium, con el build de este mismo paso, el orden es el contrario. **Que los tests estén en verde no te ahorra mirar la app**: un test de caracterización vale lo que valga el entorno donde corre, y jsdom no es un navegador.

Si dejas esto así, el test se pone rojo él solo en el paso 2b, al subir a React 19, que cambia otra vez el orden:

```text
× cerrar sesión lleva al catálogo y vuelve a cerrar los préstamos 1057ms
FAIL  pruebas/sesion.test.tsx > La sesión > cerrar sesión lleva al catálogo y vuelve a cerrar los préstamos
AssertionError: expected '/entrar?volver=%2Fprestamos' to be '/catalogo' // Object.is equality
Expected: "/catalogo"
Received: "/entrar?volver=%2Fprestamos"
```

El arreglo es cambiar el orden: primero sales de la ruta protegida y después borras la sesión. Cuando `setUsuario(null)` llega, `RutaProtegida` ya no está en pantalla:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  // Primero se sale de la ruta protegida y después se borra la sesión. Con\n  // v7_startTransition, la navegación va en una transición y setUsuario(null)\n  // no: React pinta antes la sesión vacía, todavía en /prestamos, y\n  // RutaProtegida manda a /entrar en lugar de dejarte en el catálogo.\n  async function manejarSalir() {\n    setErrorAlSalir(false)\n    navigate('/catalogo')\n    try {\n      await salir()\n    } catch {\n      // La sesión sigue abierta: se queda a la vista, y el botón, para reintentar.\n      setErrorAlSalir(true)\n    }\n  }",
  "anotaciones": [
    {
      "fragmento": "navigate('/catalogo')",
      "nota": "Primero la navegación. Con la flag va en una transición, pero se lanza ya, antes de esperar a la API."
    },
    {
      "fragmento": "await salir()",
      "nota": "Después, la sesión. Mientras llega la respuesta de DELETE /api/sesion, React ya ha pintado el catálogo, y RutaProtegida ya no está para redirigir a ningún sitio."
    }
  ]
}
```

Con el arreglo, Chromium vuelve a dejar un solo `push /catalogo`. Es un parche para aguantar hasta el paso 3.2, donde cerrar sesión pasa a ser una `action` que redirige, y el router cambia la sesión y la ruta en la misma actualización. Commit.

### 1d. La 7

```bash
npm install react-router-dom@7
```

Se instala la 7.18.4 (con `react-router` 7.18.4 por debajo: en la 7, `react-router-dom` solo reexporta `react-router`), y `npm audit` dice por fin `found 0 vulnerabilities`. Los tests, en verde. Pero `npm run typecheck`, no:

```text
src/app.tsx(19,22): error TS2322: Type '{ future: { v7_relativeSplatPath: boolean; v7_startTransition: boolean; }; children: Element; }' is not assignable to type 'IntrinsicAttributes & BrowserRouterProps'.
  Property 'future' does not exist on type 'IntrinsicAttributes & BrowserRouterProps'.
```

Es decir: «la propiedad `future` no existe en las props de `BrowserRouter`». En la 7 esos dos comportamientos son los de siempre y el interruptor ya no existe. Quita la prop, deja `<BrowserRouter>` a secas, y el typecheck queda limpio. Nota que **los tests no lo habrían visto**: Vitest quita los tipos sin comprobarlos. Por eso cada paso pasa las tres cosas, tests, typecheck y build.

## Paso 2: a la 8, los mínimos y los `import` (`package.json`, `.nvmrc` y todo `src/`)

La guía de la 8, [Upgrading from v7](https://reactrouter.com/upgrading/v7), empieza por lo que no es código: *«React Router v8 requires the following minimum versions. Update them before updating React Router to v8»*, y la lista es Node 22.22 o superior y React 19.2.7 o superior. Si te lo saltas e instalas la 8 directamente, con React 18 todavía en el proyecto, npm se niega:

```text
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error
npm error While resolving: prestamo-biblioteca@1.0.0
npm error Found: react@18.3.1
npm error node_modules/react
npm error   react@"18.3.1" from the root project
npm error
npm error Could not resolve dependency:
npm error peer react@">=19.2.7" from react-router@8.5.0
npm error node_modules/react-router
npm error   react-router@"8" from the root project
npm error
npm error Fix the upstream dependency conflict, or retry
npm error this command with --force or --legacy-peer-deps
npm error to accept an incorrect (and potentially broken) dependency resolution.
npm error
npm error
npm error For a full report see:
npm error ~/.npm/_logs/2026-10-26T21_23_27_111Z-eresolve-report.txt
npm error A complete log of this run can be found in: ~/.npm/_logs/2026-10-26T21_23_27_111Z-debug-0.log
```

Es decir: React Router 8.5.0 pide `react` 19.2.7 o superior como dependencia par, y encuentra la 18.3.1. No uses `--force` ni `--legacy-peer-deps`, como sugiere el final del mensaje: instalarías una versión del router que no funciona con tu React. Ve por partes.

### 2a. Node 22.22 o superior

Lo que pide la 8 se escribe en el proyecto, para que nadie del equipo lo descubra a base de errores. En `package.json`:

```json
"engines": {
  "node": ">=22.22.0"
}
```

Y un `.nvmrc` con `24`, la LTS actual, para que `nvm use` (o tu editor) elija la versión sola. Con el Node 22.12 que tenía este proyecto, al instalar la 8 más adelante, npm avisaría dos veces, por tu proyecto y por el router. Lo comprobamos con `npm install react-router@8 --dry-run`:

```text
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'prestamo-biblioteca@1.0.0',
npm warn EBADENGINE   required: { node: '>=22.22.0' },
npm warn EBADENGINE   current: { node: 'v22.12.0', npm: '10.9.0' }
npm warn EBADENGINE }
...
```

Es un aviso, no un error: npm instala igual. Por eso hay que mirarlo. Con Node 24 (`nvm use`), borra `node_modules`, reinstala con `npm ci` y pasa las tres comprobaciones: todo en verde. Commit.

### 2b. React 19

Todavía en la 7, que admite React 18 y 19:

```bash
npm install react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19
```

Tests en verde (con el arreglo del paso 1c; sin él, aquí es donde se pone rojo). El typecheck, no:

```text
src/componentes/RutaProtegida.tsx(7,42): error TS2503: Cannot find namespace 'JSX'.
```

Es decir: «no encuentro el espacio de nombres `JSX`». Los tipos de React 19 ya no declaran un `JSX` global, y `RutaProtegida` lo usaba para su tipo de retorno, como tantos componentes de 2023 y 2024. La [guía para pasar a React 19](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) lo cuenta: el `JSX` global se quitó en favor de `React.JSX`. Puedes escribir `React.JSX.Element` o importar el tipo de `react`, como aquí:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { JSX } from 'react'\nimport { Navigate, Outlet, useLocation } from 'react-router-dom'\nimport { useSesion } from '../sesion'\n\n// Envuelve las rutas de préstamos: sin sesión, a /entrar?volver=…\n// TODO (paso 3.5): un middleware en la ruta, en vez de este componente.\nexport default function RutaProtegida(): JSX.Element {",
  "anotaciones": [
    {
      "fragmento": "import type { JSX } from 'react'",
      "nota": "El mismo tipo de siempre, pero importado. También valdría React.JSX.Element, o quitar el tipo de retorno y dejar que TypeScript lo infiera."
    },
    {
      "fragmento": "export default function RutaProtegida(): JSX.Element {",
      "nota": "El resto del componente no cambia. Lo sustituirá un middleware en el paso 3.5."
    }
  ]
}
```

### 2c. De `react-router-dom` a `react-router`

En la 8, `react-router-dom` no existe. Todo se importa de `react-router`, salvo `RouterProvider` y `HydratedRouter`, que vienen de `react-router/dom` porque dependen de `react-dom`. Se puede hacer todavía en la 7, que ya exporta todo desde `react-router`, y es mejor: así el cambio de los `import` y el cambio de versión van en commits distintos.

La guía de la 7 trae un comando para cambiarlos todos de golpe (en macOS, con su `sed -i ''`):

```bash
find ./src \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" \) -type f -exec sed -i '' 's|from "react-router-dom"|from "react-router"|g' {} +
```

Pruébalo tal cual: **no cambia nada**. Busca `from "react-router-dom"`, con comillas dobles, y este proyecto (como casi todos los que usan Prettier con su configuración de comillas simples) escribe `from 'react-router-dom'`. Después de ejecutarlo, `grep -rl "react-router-dom" src` sigue encontrando los nueve archivos. Con comillas simples, sí:

```bash
find ./src \( -name "*.tsx" -o -name "*.ts" \) -type f -exec sed -i '' "s|from 'react-router-dom'|from 'react-router'|g" {} +
npm uninstall react-router-dom
npm install react-router@7
```

Esta app no tiene `RouterProvider` todavía, así que no hay ningún `react-router/dom` que poner. Tests, typecheck y build, en verde. Commit.

### 2d. La 8

```bash
npm install react-router@8
```

Se instala la 8.5.0, y los 46 tests, el typecheck y el build siguen en verde **sin tocar ni una línea**. El modo declarativo de la 8 es el de la 7: `<BrowserRouter>`, `<Routes>`, `useNavigate` y `<Navigate>` funcionan igual. Lo que la 8 cambió (el middleware siempre activo, `context` como `RouterContextProvider`, los paquetes solo ESM, lo que contó la lección 1) toca al modo datos y al modo framework, y esta app todavía no usa ninguno.

Ya estás en la 8, con Node 24 y React 19, y `npm audit` limpio. Podrías parar aquí. Pero la app sigue pidiendo sus datos en efectos, y eso es lo que arregla el paso 3.

## Paso 3: al modo datos, ruta a ruta

Mira lo que hace la ficha de un libro en la 6. Un efecto pide el libro; cuando llega, se pinta la ficha, y dentro de la ficha el componente `Ejemplares`, que solo entonces pide los ejemplares con **su** efecto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default function FichaLibro() {\n  const { id } = useParams()\n  const [libro, setLibro] = useState<Libro | null>(null)\n  const [estado, setEstado] = useState<Estado>('cargando')\n\n  // TODO (paso 3.4): un loader en vez de este efecto, y el 404 en un ErrorBoundary.\n  useEffect(() => {\n    let ignorar = false\n    setEstado('cargando')\n    pedirJson<Libro>(`/api/libros/${id}`)\n      .then((datos) => {\n        if (ignorar) return\n        setLibro(datos)\n        setEstado('listo')\n      })\n      .catch((error: unknown) => {\n        if (ignorar) return\n        setEstado(error instanceof ErrorApi && error.estado === 404 ? 'no-existe' : 'error')\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [id])\n\n  // …el «no existe», el error, el «Cargando el libro…» y la ficha…\n      <Ejemplares libroId={libro.id} />\n}\n\nfunction Ejemplares({ libroId }: { libroId: number }) {\n  const [ejemplares, setEjemplares] = useState<Ejemplar[] | null>(null)\n  const [error, setError] = useState(false)\n\n  useEffect(() => {\n    let ignorar = false\n    pedirJson<Ejemplar[]>(`/api/libros/${libroId}/ejemplares`)\n      .then((datos) => {\n        if (!ignorar) setEjemplares(datos)\n      })\n      .catch(() => {\n        if (!ignorar) setError(true)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [libroId])",
  "anotaciones": [
    {
      "fragmento": "pedirJson<Libro>(`/api/libros/${id}`)",
      "nota": "La primera petición sale después del primer render: el componente se pinta con «Cargando el libro…» y luego se ejecuta el efecto."
    },
    {
      "fragmento": "let ignorar = false",
      "nota": "La bandera de la lección 52 para que una respuesta vieja no pise a la nueva si cambias de libro deprisa. Siete efectos, siete banderas."
    },
    {
      "fragmento": "<Ejemplares libroId={libro.id} />",
      "nota": "Ejemplares solo existe cuando el libro ya ha llegado. Su efecto no puede empezar antes."
    },
    {
      "fragmento": "pedirJson<Ejemplar[]>(`/api/libros/${libroId}/ejemplares`)",
      "nota": "La segunda petición. Solo necesita el id, que estaba en la URL desde el principio, pero espera a la primera: es una cascada."
    }
  ]
}
```

El modo datos (lecciones 2 y 3) resuelve esto desde fuera de React: cada ruta declara un `loader`, el router los ejecuta **antes** de pintar y **en paralelo**, y una `action` recibe los formularios. Pero no hace falta reescribir la app de golpe. La guía de la 6 [Migrating to RouterProvider](https://reactrouter.com/6.30.3/upgrading/v6-data) describe la forma de hacerlo poco a poco, y en la 8 sigue funcionando igual: metes **todas las rutas de siempre dentro de una sola ruta comodín** de un router de datos, y después las vas sacando de ahí **una a una**. Cada ruta que sale puede ya tener su `loader`; las que quedan siguen con sus efectos. Y entre una y otra, los tests en verde y un commit.

El orden importa. En esta app hay una pieza que comparten muchas rutas: **la sesión**. La cabecera dice quién ha entrado, `RutaProtegida` decide si te deja pasar, entrar la abre y cerrar sesión la borra. Si migras primero el formulario de entrar a una `action` y dejas la sesión en el contexto de React, la `action` abre la sesión en el servidor, pero el contexto, que es lo que lee la cabecera, no se entera: la cabecera seguiría diciendo «Entrar», y el test de entrar y volver comprueba justo que diga «Marta Gil». Por eso la sesión pasa al router la primera, en el 3.2, y las páginas, después.

### 3.1. Un router de datos con una sola ruta comodín (`app.tsx`)

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "function RutasAntiguas() {\n  return (\n    <Routes>\n      {/* …las mismas <Route> de siempre, sin tocar… */}\n    </Routes>\n  )\n}\n\nexport function iniciarApp(contenedor: HTMLElement) {\n  const router = createBrowserRouter([{ path: '*', Component: RutasAntiguas }])\n  const raiz = createRoot(contenedor)\n  raiz.render(\n    <StrictMode>\n      <SesionProvider>\n        <RouterProvider router={router} />\n      </SesionProvider>\n    </StrictMode>,\n  )\n  return () => {\n    raiz.unmount()\n    router.dispose()\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "function RutasAntiguas() {",
      "nota": "Lo que había dentro de BrowserRouter, tal cual: las mismas Route, con Marco, RutaProtegida y todo lo demás."
    },
    {
      "fragmento": "createBrowserRouter([{ path: '*', Component: RutasAntiguas }])",
      "nota": "Un router de datos con una sola ruta, un comodín que lo pinta todo. Los Routes de dentro siguen funcionando: el router de datos admite rutas descendientes."
    },
    {
      "fragmento": "<SesionProvider>",
      "nota": "El contexto de la sesión, por fuera del router, como antes. Desaparece en el 3.2."
    },
    {
      "fragmento": "router.dispose()",
      "nota": "Un router de datos escucha el historial del navegador. Al desmontar la app hay que soltarlo, y eso es lo que hacen los tests entre uno y otro."
    }
  ]
}
```

Los 46 tests, en verde. `iniciarApp` sigue teniendo la misma firma, y por eso los tests no se han enterado de que debajo hay otro router. Commit.

### 3.2. La sesión, al router (`sesion.ts`, `rutas/raiz.tsx`, `rutas/entrar.tsx` y `rutas/salir.ts`)

La sesión de la 6 se pedía **una vez** al arrancar y se guardaba en un contexto de React. En el router, quien la necesita son funciones (el `loader` de la raíz, el middleware, las `action` de entrar y salir), y esas funciones no pueden leer un contexto de React. Pero el router tiene su propio contexto, el de la lección 10, y `getContext` le da a cada navegación uno nuevo con lo que tú pongas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Quién ha entrado. Se pide una vez por arranque de la app y la comparten\n// todas las navegaciones, como hacía el SesionProvider de la versión 6.\n// Entrar y salir la olvidan, y la siguiente lectura vuelve a pedirla. Si la\n// API falla, no se guarda nada: el error sube y la próxima lectura reintenta.\nexport function crearSesion() {\n  let pendiente: Promise<Usuario | null> | null = null\n  return {\n    usuario() {\n      pendiente ??= pedirJson<{ usuario: Usuario | null }>('/api/sesion')\n        .then((datos) => datos.usuario)\n        .catch((error: unknown) => {\n          // Un 500 o un fallo de red no es «sin sesión»: no lo guardes.\n          pendiente = null\n          throw error\n        })\n      return pendiente\n    },\n    olvidar() {\n      pendiente = null\n    },\n  }\n}\n\nexport type Sesion = ReturnType<typeof crearSesion>\n\n// La sesión llega a los loader, las action y el middleware por el contexto del\n// router: iniciarApp la pone con getContext.\nexport const sesionContext = createContext<Sesion>()",
  "anotaciones": [
    {
      "fragmento": "export function crearSesion() {",
      "nota": "Una sesión por cada arranque de la app: iniciarApp la crea y la reparte. No es una variable global, así que cada test empieza con la suya."
    },
    {
      "fragmento": "pendiente ??= pedirJson",
      "nota": "La primera lectura pide /api/sesion y guarda la promesa; las siguientes la reutilizan. Es lo que hacía el SesionProvider con su useEffect: una sola petición, aunque la lean el loader de la raíz y el middleware en la misma navegación."
    },
    {
      "fragmento": "pendiente = null\n          throw error",
      "nota": "Un 500 o un fallo de red no es estar sin sesión. La 6 los confundía: su catch dejaba el usuario a null hasta recargar. Aquí el fallo no se guarda (la próxima lectura vuelve a preguntar) y sube al ErrorBoundary de la raíz."
    },
    {
      "fragmento": "olvidar() {",
      "nota": "Entrar y salir cambian la sesión: después de eso, la próxima lectura vuelve a preguntar."
    },
    {
      "fragmento": "export const sesionContext = createContext<Sesion>()",
      "nota": "La clave con la que la sesión viaja en el contexto del router, tipada (lección 10)."
    }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function iniciarApp(contenedor: HTMLElement) {\n  const sesion = crearSesion()\n  const router = createBrowserRouter(rutas, {\n    // Cada navegación recibe un contexto nuevo con la misma sesión.\n    getContext() {\n      const contexto = new RouterContextProvider()\n      contexto.set(sesionContext, sesion)\n      return contexto\n    },\n  })\n  const raiz = createRoot(contenedor)\n  raiz.render(\n    <StrictMode>\n      <RouterProvider router={router} />\n    </StrictMode>,\n  )\n  return () => {\n    raiz.unmount()\n    router.dispose()\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "const sesion = crearSesion()",
      "nota": "Una sola sesión para toda la vida de la app."
    },
    {
      "fragmento": "getContext() {",
      "nota": "Se llama al empezar cada navegación, cada envío y cada fetcher. Devuelve un contexto nuevo con la misma sesión dentro: lo que la lección 10 llamaba sembrar el contexto."
    },
    {
      "fragmento": "<RouterProvider router={router} />",
      "nota": "Ya sin SesionProvider alrededor: la sesión vive en el router."
    }
  ]
}
```

Con eso, la raíz (lo que era `Marco`) pide la sesión en su `loader`, cerrar sesión es un `<Form method="post" action="/salir">` y entrar es una `action`. El componente de `Entrar` pierde su estado: el error llega de `useActionData` y el «Entrando…», de `useNavigation`.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function action({ request, context }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  const respuesta = await enviarJson(\n    '/api/sesion',\n    'POST',\n    { usuario: datos.get('usuario'), clave: datos.get('clave') },\n    request.signal,\n  )\n  if (respuesta.status === 401) return data({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })\n  if (!respuesta.ok) return data({ error: 'No se ha podido iniciar sesión. Inténtalo de nuevo.' }, { status: 500 })\n  // La sesión ha cambiado: que la próxima lectura la vuelva a pedir.\n  context.get(sesionContext).olvidar()\n  const url = new URL(request.url)\n  // replace, no redirect: el formulario de entrar no se queda en el historial,\n  // como hacía navigate(volver, { replace: true }) en la 6.\n  return replace(destinoSeguro(url.searchParams.get('volver'), url.origin))\n}",
  "anotaciones": [
    {
      "fragmento": "const datos = await request.formData()",
      "nota": "Lo que antes sacaba el onSubmit con new FormData(evento.currentTarget). Sin preventDefault, sin useState."
    },
    {
      "fragmento": "return data({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })",
      "nota": "Un error que se pinta en la página se devuelve, no se lanza (lección 3): el componente lo lee con useActionData."
    },
    {
      "fragmento": "context.get(sesionContext).olvidar()",
      "nota": "La sesión ha cambiado. Tras la action, el router vuelve a ejecutar el loader de la raíz, que ahora pedirá /api/sesion de nuevo, y la cabecera dirá quién ha entrado."
    },
    {
      "fragmento": "return replace(destinoSeguro(url.searchParams.get('volver'), url.origin))",
      "nota": "replace, no redirect. Las dos devuelven una redirección, pero replace sustituye la entrada del historial, como el navigate(volver, { replace: true }) de la 6: al pulsar Atrás no vuelves al formulario. destinoSeguro no ha cambiado: acepta solo rutas de esta web, y una mal formada lleva a /prestamos."
    }
  ]
}
```

`destinoSeguro` es el mismo de la 6, con su test de once casos, y lo que comprueba importa más que nunca, porque ahora su resultado va directo a una redirección. Comprobar el origen no basta: `new URL('/.//evil.example', origen)` es de nuestro origen, pero su ruta normalizada es `//evil.example`, que el navegador lee como otro dominio. Lo mismo pasa con `/a/..//evil.example` o `/%2e//evil.example`. Por eso la función rechaza también cualquier ruta que, ya normalizada, empiece por `//`; sin esa línea, cinco de sus once tests se ponen rojos.

Ese `replace` lo pide un test. Con `redirect`, el que había en el primer borrador de esta migración, se pone rojo «después de entrar, Atrás no vuelve al formulario»: en la 6, `navigate(…, { replace: true })` cambiaba la entrada de `/entrar` por la de `/prestamos`, y `redirect` añade una nueva.

```text
     × después de entrar, Atrás no vuelve al formulario 1119ms
 FAIL  pruebas/sesion.test.tsx > La sesión > después de entrar, Atrás no vuelve al formulario
Expected: "/catalogo"
Received: "/entrar?volver=%2Fprestamos"
```

Al cerrar sesión desaparece la carrera del paso 1c: la `action` borra la sesión y devuelve `redirect('/catalogo')`, y el router cambia de ruta y vuelve a ejecutar el `loader` de la raíz **en la misma actualización**. Ya no hay un momento con la sesión vacía y la ruta vieja. Y comprueba, como la 6, que la API haya cerrado la sesión de verdad.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { redirect, type ActionFunctionArgs } from 'react-router'\nimport { enviarJson, ErrorApi } from '../api'\nimport { sesionContext } from '../sesion'\n\n// Solo una action: el botón «Cerrar sesión» de la cabecera envía aquí.\nexport async function action({ context }: ActionFunctionArgs) {\n  const respuesta = await enviarJson('/api/sesion', 'DELETE')\n  // Si la API no ha cerrado la sesión, no se hace como que sí: ni se olvida\n  // la sesión ni se redirige.\n  if (!respuesta.ok) throw new ErrorApi(respuesta.status)\n  context.get(sesionContext).olvidar()\n  return redirect('/catalogo')\n}\n\nexport function ErrorBoundary() {\n  return (\n    <p role=\"alert\" className=\"aviso-error\">\n      No se ha podido cerrar la sesión. Inténtalo de nuevo.\n    </p>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export async function action({ context }: ActionFunctionArgs) {",
      "nota": "Una ruta sin componente: el botón Cerrar sesión de la cabecera envía aquí con Form method post y action /salir."
    },
    {
      "fragmento": "if (!respuesta.ok) throw new ErrorApi(respuesta.status)",
      "nota": "Si la API no ha cerrado la sesión, no se olvida ni se redirige: la cabecera sigue diciendo quién ha entrado, porque en el servidor sigue abierta. Es lo que hacía la 6 con su try y su catch, y lo vigila el test si cerrar sesión falla, la sesión sigue abierta."
    },
    {
      "fragmento": "return redirect('/catalogo')",
      "nota": "La redirección y la revalidación van juntas. El arreglo de orden del paso 1c ya no hace falta, y se va con Marco."
    },
    {
      "fragmento": "export function ErrorBoundary() {",
      "nota": "El aviso de que no se ha podido cerrar la sesión. La ruta no pinta nada más."
    }
  ]
}
```

Un fallo de la sesión, en cambio, no tiene una página a la que pertenecer: lo recoge el `ErrorBoundary` de la raíz, que sustituye a la página entera y deja reintentar sin recargar.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function ErrorBoundary() {\n  const revalidador = useRevalidator()\n  return (\n    <main className=\"contenido\">\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\" className=\"aviso-error\">\n        No se ha podido abrir la biblioteca.\n      </p>\n      <button type=\"button\" onClick={() => revalidador.revalidate()} disabled={revalidador.state === 'loading'}>\n        Reintentar\n      </button>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const revalidador = useRevalidator()",
      "nota": "useRevalidator (lección 4) vuelve a ejecutar los loader de la página: el de la raíz pedirá /api/sesion otra vez, porque crearSesion no guardó el fallo."
    },
    {
      "fragmento": "No se ha podido abrir la biblioteca.",
      "nota": "Sin cabecera ni menú: la raíz es la que ha fallado, así que no hay Component de la raíz que pintar."
    }
  ]
}
```

Este comportamiento es nuevo: en la 6, un fallo de `/api/sesion` te dejaba como anónimo hasta recargar. No es de caracterización, porque en la 6 fallaría, así que su test va en su propia carpeta, `pruebas/nuevos/`, con la ayuda `fallar('GET /api/sesion', 1)`, que hace fallar solo la próxima petición. Los 30 de partida siguen sin cambiar, y la suite pasa de 46 a 47 tests.

`RutaProtegida` sigue en `RutasAntiguas` hasta el 3.5, pero ya no tiene un contexto del que leer. Mientras tanto, lee el usuario del `loader` de la raíz con `useRouteLoaderData('raiz')` (lección 2), y pierde su estado «Comprobando la sesión…»: cuando se pinta, el `loader` de la raíz ya ha terminado.

Aquí se pone rojo un test, «la dirección raíz lleva al catálogo»:

```text
     × la dirección raíz lleva al catálogo 1027ms
 FAIL  pruebas/catalogo.test.tsx > El catálogo > la dirección raíz lleva al catálogo
TestingLibraryElementError: Unable to find role="heading" and name "Catálogo"
```

Es decir: en `/` no aparece el catálogo. La raíz tiene ahora `path: '/'`, y `/` encaja con ella **sola**, sin ninguna hija: el comodín `*` no hace falta para casar con `/`, así que el router no lo elige y el `<Outlet>` queda vacío. El `<Navigate>` de la ruta índice, que estaba dentro de `RutasAntiguas`, no llega a pintarse. Hay que sacar también la ruta índice, y en el modo datos se redirige en el `loader`, antes de pintar nada:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "      // La dirección raíz, al catálogo: lo que hacía <Navigate replace>. El\n      // componente vacío no llega a pintarse (el loader redirige antes), pero\n      // sin él el router avisa en la consola: «Matched leaf route at location\n      // \"/\" does not have an element or Component».\n      { index: true, loader: () => redirect('/catalogo'), Component: () => null },",
  "anotaciones": [
    {
      "fragmento": "loader: () => redirect('/catalogo')",
      "nota": "Lo que hacía Navigate replace, sin pintar nada antes. Una redirección en la carga inicial reemplaza la entrada del historial."
    },
    {
      "fragmento": "Component: () => null",
      "nota": "No llega a pintarse nunca. Sin él, el router avisa en la consola, en el navegador y en los tests: Matched leaf route at location \"/\" does not have an element or Component. Lo añadimos en el último commit del paso 3, cuando vimos el aviso en Chromium; en el paso 4, el modo framework lo pide de todas formas."
    }
  ]
}
```

Falta una pieza que el modo declarativo no tenía. En la primera carga, el router no pinta nada hasta que terminan los `loader`, y si no le dices qué enseñar mientras tanto, avisa en la consola: *«No `HydrateFallback` element provided to render during initial hydration»*. La raíz exporta uno, «Cargando la biblioteca…», que es lo que se ve mientras llega `/api/sesion`. Tests en verde, y se van `sesion.tsx`, `Marco.tsx` y `Entrar.tsx`. Commit.

### 3.3. El catálogo (`rutas/catalogo.tsx`)

La primera página. Cada ruta que sale de `RutasAntiguas` se convierte en un **módulo de ruta**: un archivo que exporta las piezas de un objeto de ruta con sus nombres de siempre (`loader`, `action`, `Component`, `ErrorBoundary`). Así, en `rutas.tsx` basta con esparcirlo, `{ path: 'catalogo', ...catalogo }`, y en el paso 4 el salto al modo framework es casi un cambio de nombres.

El buscador pasa a ser un `<Form method="get">`, y con eso desaparece su manejador. Pero el manejador hacía algo más que poner `?q=` en la URL: **recortaba los espacios**, y si el campo quedaba vacío, quitaba `?q=`. Un formulario GET manda el campo tal cual, y dos tests lo cazan:

```text
     × la búsqueda no tiene en cuenta los espacios de los lados 1088ms
     × buscar sin texto vuelve al catálogo entero 1053ms
 FAIL  pruebas/catalogo.test.tsx > El catálogo > la búsqueda no tiene en cuenta los espacios de los lados
Expected: "/catalogo?q=delibes"
Received: "/catalogo?q=++delibes+"
 FAIL  pruebas/catalogo.test.tsx > El catálogo > buscar sin texto vuelve al catálogo entero
Expected: "/catalogo"
Received: "/catalogo?q="
```

`?q=++delibes+` no encuentra nada, porque la API busca « delibes » con sus espacios. El `loader` recorta la búsqueda y, si la URL no es la limpia, redirige a la que dejaba la 6:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ request }: LoaderFunctionArgs) {\n  const url = new URL(request.url)\n  const enLaUrl = url.searchParams.get('q')\n  const q = (enLaUrl ?? '').trim()\n  // El formulario GET manda el campo tal cual («?q=++delibes+», o «?q=» si\n  // está vacío). La 6 lo recortaba en su onSubmit; aquí se recorta y se\n  // redirige a la dirección limpia, la misma que dejaba la 6.\n  if (enLaUrl !== null && (enLaUrl !== q || q === '')) {\n    throw redirect(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')\n  }\n  const libros = await pedirJson<Libro[]>(`/api/libros?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  return { q, libros }\n}\n\nexport function Component() {\n  const { q, libros } = useLoaderData<typeof loader>()\n\n  return (\n    <section>\n      <h1>Catálogo</h1>\n      <Buscador q={q} />\n      {/* …la lista, igual que antes… */}\n    </section>\n  )\n}\n\nfunction Buscador({ q }: { q: string }) {\n  return (\n    <Form method=\"get\" role=\"search\" className=\"busqueda\">\n      <label htmlFor=\"q\">Título o autor</label>\n      <input id=\"q\" name=\"q\" type=\"search\" defaultValue={q} key={q} />\n      <button type=\"submit\">Buscar</button>\n    </Form>\n  )\n}\n\n// Si el loader falla, el router pinta esto en lugar del Component, dentro de la raíz.\nexport function ErrorBoundary() {\n  return (\n    <section>\n      <h1>Catálogo</h1>\n      <p role=\"alert\" className=\"aviso-error\">\n        No se ha podido cargar el catálogo.\n      </p>\n    </section>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const q = (enLaUrl ?? '').trim()",
      "nota": "La búsqueda sale de la URL, como antes salía de useSearchParams, y se recorta, como hacía el manejador de la 6. El loader se vuelve a ejecutar cada vez que cambia ?q=."
    },
    {
      "fragmento": "throw redirect(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')",
      "nota": "Si la URL trae espacios de más, o un ?q= vacío, a la dirección limpia: /catalogo?q=delibes, o /catalogo a secas. Así un enlace compartido es siempre el mismo."
    },
    {
      "fragmento": "{ signal: request.signal }",
      "nota": "Si buscas otra cosa antes de que llegue la respuesta, el router aborta la petición vieja (lección 2). La bandera ignorar ya no hace falta."
    },
    {
      "fragmento": "const { q, libros } = useLoaderData<typeof loader>()",
      "nota": "Sin useState, sin useEffect y sin «Cargando el catálogo…»: cuando el componente se pinta, los datos ya están."
    },
    {
      "fragmento": "<Form method=\"get\" role=\"search\" className=\"busqueda\">",
      "nota": "Un formulario GET de los de siempre. El router pone ?q=delibes en la URL, que es lo que hacía setParametros, y eso dispara el loader. El manejador de envío desaparece."
    },
    {
      "fragmento": "export function ErrorBoundary() {",
      "nota": "Lo que antes era el estado error de la página: si el loader falla, el router pinta esto en lugar del Component, dentro de la raíz. La cabecera sigue ahí, y el test de la API caída lo comprueba."
    }
  ]
}
```

Tests en verde. Commit.

### 3.4. La ficha, con el libro y sus ejemplares a la vez (`rutas/ficha.tsx`)

Aquí está la cascada del principio, y la tentación es escribir un `Promise.all` con las dos peticiones y ya está. Hazlo, y pasa los tests:

```text
     × si solo fallan los ejemplares, el libro se ve igual 1005ms
 FAIL  pruebas/ficha.test.tsx > La ficha de un libro > si solo fallan los ejemplares, el libro se ve igual
TestingLibraryElementError: Unable to find role="heading" and name "Marianela"
      Tests  1 failed | 3 passed (4)
```

Se pone rojo «si solo fallan los ejemplares, el libro se ve igual». En la 6, si fallaba `/api/libros/3/ejemplares`, la ficha se pintaba entera y el aviso salía solo donde iban los ejemplares, porque eran dos efectos independientes. Con un `Promise.all`, si falla una promesa falla todo, y el `loader` lanza: la ficha entera se cambia por el `ErrorBoundary`. **Es un cambio de comportamiento que nadie había pedido**, y es justo para lo que está un test de caracterización.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params, request }: LoaderFunctionArgs) {\n  const opciones = { signal: request.signal }\n  const [libro, ejemplares] = await Promise.all([\n    pedirJson<Libro>(`/api/libros/${params.id}`, opciones),\n    pedirJson<Ejemplar[]>(`/api/libros/${params.id}/ejemplares`, opciones),\n  ])\n  return { libro, ejemplares }\n}\n\n// GET /api/libros/3 responde 200 y GET /api/libros/3/ejemplares, 500.\n// ¿Qué ves en /catalogo/3?",
  "opciones": [
    "La ficha de Marianela y, donde van los ejemplares, «No se han podido cargar los ejemplares.»",
    "Solo el ErrorBoundary de la ficha: «No se ha podido cargar el libro.»",
    "La ficha sin la lista de ejemplares, sin ningún aviso",
    "La pantalla en blanco: el error sube hasta la raíz"
  ],
  "correcta": 1,
  "explicacion": "Promise.all se rechaza en cuanto se rechaza una de sus promesas, así que el loader lanza y el router pinta el ErrorBoundary de la ruta en lugar del Component. La cabecera sigue (el error no sube más allá de la ficha), pero el libro, que sí había llegado, no se ve. En la 6 cada petición tenía su efecto y fallaba sola. Es el test que se puso rojo."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params, request }: LoaderFunctionArgs) {\n  const opciones = { signal: request.signal }\n  const [libro, ejemplares] = await Promise.all([\n    pedirJson<Libro>(`/api/libros/${params.id}`, opciones).catch((error: unknown) => {\n      // Un 404 de la API es un 404 de la página: lo pinta el ErrorBoundary.\n      if (error instanceof ErrorApi && error.estado === 404) throw data('Ese libro no existe', { status: 404 })\n      throw error\n    }),\n    // Si fallan solo los ejemplares, la ficha se pinta igual, con su aviso:\n    // es lo que hacía la versión 6, y lo que comprueba un test.\n    pedirJson<Ejemplar[]>(`/api/libros/${params.id}/ejemplares`, opciones).catch(() => null),\n  ])\n  return { libro, ejemplares }\n}",
  "anotaciones": [
    {
      "fragmento": "const [libro, ejemplares] = await Promise.all([",
      "nota": "Las dos peticiones salen a la vez: las dos solo necesitan el id de la URL. Es la cascada que desaparece."
    },
    {
      "fragmento": "throw data('Ese libro no existe', { status: 404 })",
      "nota": "Un 404 de la API es un 404 de la página. Lanzado, lo recoge el ErrorBoundary de la ficha, que lo distingue con isRouteErrorResponse y pinta No hemos encontrado ese libro (lección 8)."
    },
    {
      "fragmento": ".catch(() => null)",
      "nota": "El arreglo: si fallan solo los ejemplares, la promesa se resuelve con null en vez de rechazarse. El componente pinta el aviso donde iba la lista, como en la 6, y el test vuelve a verde."
    }
  ]
}
```

Tests en verde. Commit.

### 3.5. Los préstamos, con un middleware en lugar de `RutaProtegida` (`sesion.ts`, `rutas/prestamos.tsx` y `rutas.tsx`)

`RutaProtegida` hacía su trabajo **durante el render**: React ya estaba pintando la ruta cuando decidía si te echaba, y hasta tener la sesión enseñaba «Comprobando la sesión…». Un middleware (lección 10) lo decide **antes de ejecutar ningún `loader` ni ninguna `action`** de las rutas que cuelgan de él:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// El middleware de las rutas de préstamos: lo que hacía RutaProtegida, pero\n// antes de ejecutar ningún loader ni ninguna action de esas rutas.\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const usuario = await context.get(sesionContext).usuario()\n  if (!usuario) {\n    const url = new URL(request.url)\n    throw redirect(`/entrar?volver=${encodeURIComponent(url.pathname + url.search)}`)\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "export const exigirSesion: MiddlewareFunction = async ({ request, context }) => {",
      "nota": "Un middleware de cliente del modo datos. En la 8 siempre está activo: no hay flag que encender."
    },
    {
      "fragmento": "await context.get(sesionContext).usuario()",
      "nota": "La misma sesión compartida del 3.2: si la raíz ya la pidió en esta navegación, no sale otra petición."
    },
    {
      "fragmento": "throw redirect(`/entrar?volver=${encodeURIComponent(url.pathname + url.search)}`)",
      "nota": "El Navigate replace de RutaProtegida, con la misma URL exacta que espera el test. Lanzado desde un middleware, corta la navegación antes de pedir los préstamos."
    }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "      // Una ruta sin path que solo pone el middleware: lo hereda todo lo que cuelga de ella.\n      {\n        middleware: [exigirSesion],\n        children: [{ path: 'prestamos', ...prestamos }],\n      },",
  "anotaciones": [
    {
      "fragmento": "middleware: [exigirSesion],",
      "nota": "Una ruta sin path ni componente, solo con el middleware: lo que antes era Route element={<RutaProtegida />}. Todo lo que cuelga de ella pasa por exigirSesion."
    },
    {
      "fragmento": "children: [{ path: 'prestamos', ...prestamos }],",
      "nota": "De momento, solo /prestamos. /prestamos/nuevo sigue en RutasAntiguas, todavía detrás de RutaProtegida, hasta el 3.6."
    }
  ]
}
```

«Devolver» deja de ser un `onClick` con `fetch` y un contador `recarga` para volver a pedir la lista. Es un `<Form method="post">` con el id en un campo oculto, y la `action` de la ruta no tiene que recargar nada: tras una `action`, el router vuelve a ejecutar los `loader` de la página (lección 4).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function action({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('id')\n  const respuesta = await enviarJson(`/api/prestamos/${id}/devolucion`, 'POST', undefined, request.signal)\n  if (!respuesta.ok) throw data('No se ha podido devolver el libro', { status: respuesta.status })\n  return null\n}\n\n// …en el Component, por cada préstamo:\n            <Form method=\"post\">\n              <input type=\"hidden\" name=\"id\" value={prestamo.id} />\n              <button type=\"submit\" className=\"boton-secundario\">\n                Devolver{' '}\n                <span className=\"visualmente-oculto\">\n                  «{prestamo.titulo}», de {prestamo.alumno}\n                </span>\n              </button>\n            </Form>",
  "anotaciones": [
    {
      "fragmento": "const id = (await request.formData()).get('id')",
      "nota": "El id llega en el formulario, del campo oculto."
    },
    {
      "fragmento": "if (!respuesta.ok) throw data('No se ha podido devolver el libro', { status: respuesta.status })",
      "nota": "Si la API falla, se lanza: lo recoge el ErrorBoundary de la ruta, que dice lo mismo que decía la página de la 6."
    },
    {
      "fragmento": "return null",
      "nota": "Nada más. El router vuelve a ejecutar el loader y la fila desaparece: el test que devuelve Marianela cuenta 8 préstamos y 1 vencido."
    },
    {
      "fragmento": "<input type=\"hidden\" name=\"id\" value={prestamo.id} />",
      "nota": "Cada fila, su formulario. El botón conserva su nombre accesible, Devolver «Marianela», de Lucía Pardo, que es como lo busca el test."
    }
  ]
}
```

Tests en verde. Commit.

### 3.6. El préstamo nuevo, y adiós a `RutaProtegida` (`rutas/nuevo-prestamo.tsx`)

La última cascada estaba aquí, y era doble: la sesión, después los alumnos (el formulario no se pintaba hasta tenerlos) y después los libros (los pedía `SelectorLibro`, que estaba dentro del formulario). En el `loader`, alumnos y libros salen a la vez, y los libros conservan su comportamiento de la 6: si fallan, la lista sale vacía.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ request }: LoaderFunctionArgs) {\n  const opciones = { signal: request.signal }\n  const [alumnos, libros] = await Promise.all([\n    pedirJson<Alumno[]>('/api/alumnos', opciones),\n    pedirJson<Libro[]>('/api/libros?disponibles=1', opciones).catch(() => []),\n  ])\n  return { alumnos, libros }\n}\n\nexport async function action({ request }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  const respuesta = await enviarJson(\n    '/api/prestamos',\n    'POST',\n    {\n      alumnoId: Number(datos.get('alumnoId')),\n      libroId: Number(datos.get('libroId')),\n      dias: Number(datos.get('dias')),\n    },\n    request.signal,\n  )\n  // Los errores de validación se devuelven, no se lanzan: son parte de la página.\n  if (respuesta.status === 400) {\n    const { errores } = (await respuesta.json()) as { errores: ErroresPrestamo }\n    return data({ errores }, { status: 400 })\n  }\n  if (!respuesta.ok) throw new ErrorApi(respuesta.status)\n  return redirect('/prestamos')\n}",
  "anotaciones": [
    {
      "fragmento": "pedirJson<Libro[]>('/api/libros?disponibles=1', opciones).catch(() => []),",
      "nota": "Como en el 3.4, el comportamiento de la 6: SelectorLibro tragaba el error y enseñaba la lista vacía. El test no lo comprueba, pero la regla es la misma: no cambies lo que no te han pedido cambiar."
    },
    {
      "fragmento": "return data({ errores }, { status: 400 })",
      "nota": "Los errores de validación de la API, devueltos con su 400 (lección 3). El componente los lee con useActionData y los pinta junto a su campo, con el mismo aria-describedby que buscan los tests."
    },
    {
      "fragmento": "if (!respuesta.ok) throw new ErrorApi(respuesta.status)",
      "nota": "Cualquier otro fallo, al ErrorBoundary."
    },
    {
      "fragmento": "return redirect('/prestamos')",
      "nota": "El navigate('/prestamos') de antes. Y el loader de /prestamos se ejecuta al llegar, así que el préstamo nuevo ya está en la lista."
    }
  ]
}
```

Con `prestamos/nuevo` bajo el middleware, `RutaProtegida` ya no protege nada y se borra. Tests en verde. Commit.

### 3.7. Sin ruta comodín (`rutas.tsx` y `rutas/raiz.tsx`)

En `RutasAntiguas` solo queda la página «no existe». Pasa a ser una ruta más, `{ path: '*', ...noEncontrada }`, y `RutasAntiguas`, `<Routes>` y el comodín de la 3.1 desaparecen. La raíz ya tenía su `ErrorBoundary` desde el 3.2. Este es el árbol final:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const rutas: RouteObject[] = [\n  {\n    id: 'raiz',\n    path: '/',\n    ...raiz,\n    children: [\n      // La dirección raíz, al catálogo: lo que hacía <Navigate replace>. El\n      // componente vacío no llega a pintarse (el loader redirige antes), pero\n      // sin él el router avisa en la consola: «Matched leaf route at location\n      // \"/\" does not have an element or Component».\n      { index: true, loader: () => redirect('/catalogo'), Component: () => null },\n      { path: 'catalogo', ...catalogo },\n      { path: 'catalogo/:id', ...ficha },\n      { path: 'entrar', ...entrar },\n      { path: 'salir', ...salir },\n      // Una ruta sin path que solo pone el middleware: lo heredan sus hijas.\n      {\n        middleware: [exigirSesion],\n        children: [\n          { path: 'prestamos', ...prestamos },\n          { path: 'prestamos/nuevo', ...nuevoPrestamo },\n        ],\n      },\n      { path: '*', ...noEncontrada },\n    ],\n  },\n]",
  "anotaciones": [
    {
      "fragmento": "id: 'raiz',",
      "nota": "Con id, para que cualquier ruta pueda leer sus datos con useRouteLoaderData('raiz'). Su módulo exporta loader, Component, HydrateFallback y ErrorBoundary."
    },
    {
      "fragmento": "{ path: 'catalogo/:id', ...ficha },",
      "nota": "Cada ruta, su módulo esparcido: loader, Component y ErrorBoundary, con sus nombres de siempre."
    },
    {
      "fragmento": "{ path: 'salir', ...salir },",
      "nota": "Una ruta que solo tiene action: no pinta nada, recibe el formulario de Cerrar sesión."
    },
    {
      "fragmento": "middleware: [exigirSesion],",
      "nota": "Lo que era RutaProtegida, ahora antes de cualquier loader o action de sus hijas."
    },
    {
      "fragmento": "{ path: '*', ...noEncontrada },",
      "nota": "La página que no existe, ya como ruta de datos. Fin de RutasAntiguas."
    }
  ]
}
```

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas al final, en el modo datos",
  "nodos": [
    {
      "nombre": "raiz",
      "nivel": 0,
      "etiqueta": "path: /",
      "nota": "← loader: la sesión · HydrateFallback · ErrorBoundary"
    },
    {
      "nombre": "index",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "← redirect a /catalogo"
    },
    {
      "nombre": "catalogo",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "← ?q= de la URL · ErrorBoundary"
    },
    {
      "nombre": "ficha",
      "nivel": 1,
      "etiqueta": "catalogo/:id",
      "nota": "← libro y ejemplares en paralelo · 404"
    },
    {
      "nombre": "entrar",
      "nivel": 1,
      "etiqueta": "action",
      "nota": "← abre la sesión y redirige a volver"
    },
    {
      "nombre": "salir",
      "nivel": 1,
      "etiqueta": "action",
      "nota": "← cierra la sesión y redirige al catálogo"
    },
    {
      "nombre": "(sin path)",
      "nivel": 1,
      "etiqueta": "middleware",
      "nota": "← exigirSesion"
    },
    {
      "nombre": "prestamos",
      "nivel": 2,
      "etiqueta": "loader + action",
      "nota": "← la lista y Devolver"
    },
    {
      "nombre": "prestamos/nuevo",
      "nivel": 2,
      "etiqueta": "loader + action",
      "nota": "← alumnos y libros en paralelo · errores 400"
    },
    {
      "nombre": "no-encontrada",
      "nivel": 1,
      "etiqueta": "*"
    }
  ]
}
```

Tests en verde, typecheck limpio, build. Y en Chromium, con la sonda que recorre la app entera (catálogo, búsqueda, ficha, entrar, recargar, préstamo nuevo, devolver, cerrar sesión y 404), ni un aviso en la consola.

## Antes y después, con números

### El código

Entre el primer commit y el último, `git diff --shortstat` sobre `src/` da **20 archivos cambiados, 567 líneas añadidas, 637 borradas**, y `src/` pasa de **770 a 700 líneas** de TypeScript. Lo que se ha ido, contado con `grep`:

```text
                         antes   después
useEffect                    7         0
useState                    19         0
banderas «let ignorar»       7         0
manejadores onSubmit=        3         0
useNavigate()                3         0
textos «Cargando…»           8         2
loader                       0         6
action                       0         4
ErrorBoundary                0         6
```

Lo importante no es el número de líneas, sino **qué líneas**. Se ha ido todo lo que gestionaba a mano el tiempo: cuándo pedir, qué pintar mientras tanto, qué hacer con una respuesta que llega tarde y cuándo volver a pedir. Ahora lo hace el router, una vez y para todas las rutas.

### Las peticiones

Medido en Chromium contra el build de producción de cada versión (`vite preview`), con 300 ms de latencia en cada respuesta de la API y cinco repeticiones. El tiempo se mide **desde dentro de la página**, con `performance.now()`: desde que empieza a cargarse (o desde el clic) hasta que aparece en el DOM el último dato de la pantalla. Una **ronda** es un grupo de peticiones que salen a la vez; cada ronda nueva tiene que esperar a que termine una petición de la anterior.

```text
                                            antes                después
A. Abrir /catalogo/3 (sin sesión)           2 rondas · 628 ms    1 ronda  · 339 ms
B. Del catálogo a la ficha de Marianela     2 rondas · 609 ms    1 ronda  · 306 ms
C. Abrir /prestamos/nuevo (con sesión)      3 rondas · 931 ms    2 rondas · 652 ms
D. De los préstamos al préstamo nuevo       2 rondas · 609 ms    1 ronda  · 312 ms
E. Abrir /prestamos (con sesión)            2 rondas · 627 ms    2 rondas · 650 ms

(medianas de cinco repeticiones; 300 ms de latencia en cada respuesta)
```

Cuatro de los cinco escenarios pierden una ronda, y con ella **300 ms**, una latencia entera. El detalle, de la ficha de Marianela al llegar desde el catálogo:

```text
antes (react-router-dom 6, efectos)
  ronda 1      1 →   303 ms  GET /api/libros/3
  ronda 2    304 →   607 ms  GET /api/libros/3/ejemplares
  el último ejemplar aparece a los 609 ms

después (React Router 8, loader)
  ronda 1      1 →   303 ms  GET /api/libros/3
  ronda 1      1 →   303 ms  GET /api/libros/3/ejemplares
  el último ejemplar aparece a los 306 ms
```

Y el escenario que no mejora también enseña algo. En `/prestamos`, el middleware tiene que saber si hay sesión **antes** de ejecutar ningún `loader`: es justo lo que hace un middleware. La 6 hacía lo mismo, con `RutaProtegida` esperando a la sesión. Dos rondas antes y dos después. En `/prestamos/nuevo`, en cambio, se gana una, porque detrás del middleware los alumnos y los libros salen ya a la vez.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Lo que ha crecido: el JavaScript",
  "contenido": "El JavaScript del build pasa de 176,21 kB (57,23 kB con gzip) en el punto de partida a 326,72 kB (102,43 kB con gzip) al final. Casi todo llega en dos pasos: React 19 en el 2b (de 192,79 a 271,74 kB) y el router de datos en el 3.1 (de 270,34 a 328,69 kB). La app en sí apenas cambia de tamaño. Si te importa la primera carga, el reto 3 parte las rutas con lazy, y en el paso 4 el framework lo hace solo."
}
```

## Paso 4 (opcional): el modo framework en SPA Mode

Con las rutas convertidas en módulos, el salto al modo framework (módulo 4) es corto. La guía es [Framework Adoption from RouterProvider](https://reactrouter.com/upgrading/router-provider), y sus pasos encajan con lo que ya tienes. Lo hacemos **en SPA Mode** (`ssr: false`, lección 17): sigue siendo una app sin servidor propio, que se sirve como archivos estáticos.

Primero, lo que pide la guía: Node 22.22 o superior y Vite 7 u 8. Los dos, hechos. Después, en una rama nueva:

```bash
npm install -D @react-router/dev@8.5.0
npm install @react-router/node@8.5.0
```

La documentación del SPA Mode explica para qué el segundo: *«React Router will still server render your root route at build time to generate the `index.html` file»*. La raíz se renderiza una vez al construir.

### Lo que cambia

1. **Los módulos de ruta.** El modo framework busca nombres fijos: el componente es el `export default`, y en SPA Mode los datos van en `clientLoader`, `clientAction` y `clientMiddleware`, porque no hay un servidor donde ejecutar un `loader`. En cada archivo de `src/rutas/`, cambia los nombres. Las dos rutas que no pintaban nada (`salir` y la índice) necesitan un componente vacío: en el modo framework, una ruta sin componente es una **ruta de recursos**, que necesita servidor.
2. **`root.tsx`.** Lo que era `rutas/raiz.tsx`, más un `Layout` con lo que había en `index.html`: el `<html lang="es">`, el `<head>` con su título y su icono, y `<Meta />`, `<Links />`, `<ScrollRestoration />` y `<Scripts />` (lección 14). El CSS se importa aquí. `index.html` y `main.tsx` se borran.
3. **`routes.ts`.** El árbol del 3.7, con archivos en lugar de objetos. La ruta sin path del middleware es un `layout`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default [\n  index('rutas/inicio.tsx'),\n  route('catalogo', 'rutas/catalogo.tsx'),\n  route('catalogo/:id', 'rutas/ficha.tsx'),\n  route('entrar', 'rutas/entrar.tsx'),\n  route('salir', 'rutas/salir.tsx'),\n  layout('rutas/protegidas.tsx', [\n    route('prestamos', 'rutas/prestamos.tsx'),\n    route('prestamos/nuevo', 'rutas/nuevo-prestamo.tsx'),\n  ]),\n  route('*', 'rutas/no-encontrada.tsx'),\n] satisfies RouteConfig",
  "anotaciones": [
    {
      "fragmento": "index('rutas/inicio.tsx'),",
      "nota": "La redirección de / al catálogo, en su propio módulo, con un clientLoader que devuelve redirect y un componente vacío."
    },
    {
      "fragmento": "layout('rutas/protegidas.tsx', [",
      "nota": "Una ruta de maquetación sin path: su módulo exporta clientMiddleware con exigirSesion y un componente que solo pinta Outlet."
    },
    {
      "fragmento": "route('*', 'rutas/no-encontrada.tsx'),",
      "nota": "Las mismas rutas, en el mismo orden. Los tipos de cada una los genera react-router typegen (lección 15)."
    }
  ]
}
```

4. **`entry.client.tsx`.** Lo que hacía `main.tsx`. El router ya no lo creas tú: lo crea `HydratedRouter` a partir de `routes.ts`. Pero la sesión compartida tiene que seguir llegando a cada navegación, y `HydratedRouter` admite el mismo `getContext` que `createBrowserRouter`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { StrictMode, startTransition } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\nimport { RouterContextProvider } from 'react-router'\nimport { HydratedRouter } from 'react-router/dom'\nimport { crearSesion, sesionContext } from './sesion'\n\nconst sesion = crearSesion()\n\n// Lo que hacía main.tsx. El router ya no lo creamos nosotros: lo crea\n// HydratedRouter a partir de routes.ts. La sesión llega igual, con getContext.\nfunction getContext() {\n  const contexto = new RouterContextProvider()\n  contexto.set(sesionContext, sesion)\n  return contexto\n}\n\nstartTransition(() => {\n  hydrateRoot(\n    document,\n    <StrictMode>\n      <HydratedRouter getContext={getContext} />\n    </StrictMode>,\n  )\n})",
  "anotaciones": [
    {
      "fragmento": "const sesion = crearSesion()",
      "nota": "Una sesión para toda la vida de la app, como en iniciarApp."
    },
    {
      "fragmento": "<HydratedRouter getContext={getContext} />",
      "nota": "El router del framework, que hidrata el index.html generado al construir y recibe la sesión por el contexto."
    },
    {
      "fragmento": "hydrateRoot(\n    document,",
      "nota": "hydrateRoot sobre el documento entero, porque el Layout de root.tsx pinta desde html (lección 98 de React)."
    }
  ]
}
```

5. **La configuración.** `react-router.config.ts` con `appDirectory: 'src'` (la plantilla usa `app/`) y `ssr: false`; en `vite.config.ts`, `reactRouter()` en lugar de `react()`, y el plugin de la API sigue igual. En `package.json`, `dev` pasa a `react-router dev`, `build` a `react-router build`, y `typecheck` a `react-router typegen && tsc --noEmit`, con `rootDirs` e `include` de `.react-router/types` en `tsconfig.json`, como contó la lección 15.

La primera vez que ejecutas `react-router typegen`, hace algo por su cuenta: avisa *«adding `isbot@5` to your package.json, you should commit this change»*, lo añade con `^5` (aunque tu `.npmrc` pida versiones exactas) y lanza un `npm install`. En nuestra prueba, ese `npm install` dejó `node_modules` a medias (`Cannot find module …/@react-router/dev/package.json`). Un `npm install` normal lo arregló. Fija tú la versión exacta, `5.2.2`, y haz commit.

### Y los tests

`iniciarApp` desaparecería con `main.tsx`, y con ella el único punto que conocen los tests. La guía tiene la solución en su primer paso: una función `convert` que pasa un módulo de ruta (`default`, `clientLoader`…) a un objeto de ruta del modo datos. Si `rutas.tsx` usa esa función con los mismos módulos, `iniciarApp` sigue montando **las mismas rutas** con un router de datos, y los tests no se enteran:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "function convertir(modulo: Record<string, unknown>): PiezasDeRuta {\n  const { default: Component, clientLoader, clientAction, clientMiddleware, Layout: _layout, ...resto } = modulo\n  return { ...resto, Component, loader: clientLoader, action: clientAction, middleware: clientMiddleware } as PiezasDeRuta\n}",
  "anotaciones": [
    {
      "fragmento": "const { default: Component, clientLoader, clientAction, clientMiddleware, Layout: _layout, ...resto } = modulo",
      "nota": "Los nombres del modo framework, de vuelta a los del modo datos. El Layout de root.tsx se deja fuera: en los tests no hay documento que pintar."
    },
    {
      "fragmento": "return { ...resto, Component, loader: clientLoader, action: clientAction, middleware: clientMiddleware } as PiezasDeRuta",
      "nota": "Lo demás, ErrorBoundary y HydrateFallback, pasa tal cual: se llaman igual en los dos modos."
    }
  ]
}
```

Lo que estos tests ya no cubren es la entrada del framework: `entry.client.tsx`, `root.tsx` con su `Layout` y `routes.ts`. Eso lo comprobamos en el navegador.

### El resultado

`npm run build` termina con *«SPA Mode: Generated build/client/index.html»*. Ese `index.html` no llega vacío: su `<body>` trae ya el `HydrateFallback` de la raíz, «Cargando la biblioteca…», que se ve mientras llega el JavaScript y se ejecuta el `clientLoader` de la sesión. La cabecera no puede ir dentro, porque depende de ese `clientLoader`, que no se ejecuta al construir. Y cada ruta sale partida en trozos (`splitRouteModules`, activo por defecto en la 8, lección 16): `ficha-client-loader-….js` (0,40 kB) aparte de `ficha-main-….js` (1,60 kB), para que el router empiece a pedir los datos mientras se descarga el componente.

Con `npm run dev` (`react-router dev`) y con el build servido por `vite preview --outDir build/client`, la sonda de Chromium pasa sus diez comprobaciones con la consola vacía, y `npm test` sigue en 47 de 47.

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Los tests, en verde, en cada commit?",
      "texto": "No solo al final. Si uno se puso rojo por el camino y lo arreglaste más tarde, en ese commit la app estaba rota. Con git rebase y un npm test en cada paso lo compruebas de una vez."
    },
    {
      "titulo": "¿Ni una línea cambiada en los tests de partida ni en servidor?",
      "texto": "git diff --stat entre el primer commit y el último, limitado a pruebas y servidor y sin pruebas/nuevos, tiene que salir vacío. Si has tenido que tocar un test de caracterización para que pase, no has migrado: has cambiado lo que la app hace."
    },
    {
      "titulo": "¿npm run typecheck limpio en cada paso?",
      "texto": "Vitest quita los tipos sin comprobarlos. La prop future que sobraba en la 7 y el JSX global que faltaba en React 19 solo los vio el typecheck."
    },
    {
      "titulo": "¿Has mirado la app en el navegador después de cada paso?",
      "texto": "El fallo de Cerrar sesión con v7_startTransition no lo vio ningún test hasta React 19. Entra, recarga una página protegida, cierra sesión desde ella y prueba una dirección que no existe."
    },
    {
      "titulo": "¿npm audit, limpio?",
      "texto": "Desde la 7.18.4, sin avisos de React Router. En la 8.5.0, también."
    },
    {
      "titulo": "¿La consola, vacía?",
      "texto": "Sin los avisos de las future flags, sin el de HydrateFallback y sin el de la ruta índice sin componente."
    },
    {
      "titulo": "¿Node y React, declarados?",
      "texto": "engines en package.json y un .nvmrc, para que nadie del equipo descubra el mínimo de la 8 a base de errores."
    }
  ]
}
```

## Errores típicos

**Fiarse de los tests en verde sin abrir el navegador.** Es el error de esta lección, y le pasó a ella misma. Con `v7_startTransition`, cerrar sesión desde `/prestamos` te mandaba a `/entrar` en Chromium desde el paso 1c, y, sin el arreglo, los tests de jsdom habrían seguido en verde en el 1c, el 1d y el 2a, hasta que React 19 cambia el orden también allí. Lo comprobamos así la primera vez que hicimos esta migración. Un test de caracterización protege lo que puede observar, y jsdom no es un navegador.

**Saltarse los mínimos.** `npm install react-router@8` con React 18 acaba en el `ERESOLVE` del paso 2, y la tentación es `--legacy-peer-deps`. Instalaría un router que pide APIs que tu React no tiene. Primero Node y React, después el router.

**Copiar el `sed` de la guía sin mirar las comillas.** Busca `from "react-router-dom"` con comillas dobles. Con comillas simples no cambia nada y no avisa. Si después desinstalas `react-router-dom`, los seis archivos de tests fallan al cargar (`Failed to resolve import "react-router-dom"`), el typecheck da un `TS2307` por archivo y el build se para:

```text
✗ Build failed in 2.39s
error during build:
Build failed with 1 error:
Error: [vite]: Rolldown failed to resolve import "react-router-dom" from "src/app.tsx".
```

Comprueba con `grep -rl react-router-dom src` que no queda ninguno antes de desinstalar.

**Un `Promise.all` que cambia lo que se ve.** Juntar dos peticiones en un `loader` es la mejora de la migración, pero si una puede fallar sin que falle la página, su promesa necesita su `.catch`. Si no, un fallo pequeño tumba la ruta entera.

**Migrar la página de entrar antes que la sesión.** Si `Entrar` pasa a ser una `action` mientras la sesión sigue en un contexto de React, la `action` abre la sesión en el servidor, pero el contexto de React que lee la cabecera no se entera de nada: nadie le dice que vuelva a preguntar. Lo que comparten varias rutas va primero.

**Esperar que `redirect` lleve estado.** `navigate('/prestamos', { state: { aviso } })` dejaba un mensaje en la página de destino. `redirect()` devuelve una `Response`, y una `Response` no tiene `state`. Si una app de la 6 usa `location.state` después de un formulario, al pasar a una `action` el mensaje tiene que viajar de otra forma: en la URL o en la sesión.

**Convertir un error en «sin sesión».** Un `.catch(() => null)` en la lectura de la sesión parece prudente, y es lo que hacía la 6. Pero con una sesión compartida por todas las navegaciones, un 500 pasajero de `/api/sesion` te dejaría como anónimo hasta recargar la página, mandándote a `/entrar` con la sesión abierta en el servidor. Distingue la respuesta buena con `usuario: null` del error, y no guardes el error.

**`redirect` donde la 6 hacía `replace`.** Las dos redirigen, pero solo `replace` sustituye la entrada del historial. Si el código de la 6 tenía `navigate(destino, { replace: true })`, la `action` que lo sustituye devuelve `replace(destino)`, o Atrás te devolverá al formulario.

**Lanzar los errores de validación.** `throw data({ errores }, { status: 400 })` en la `action` del préstamo nuevo cambiaría el formulario entero por el `ErrorBoundary` (lección 8). Los errores que se pintan junto a un campo se devuelven.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Migrar es reescribir la app con la API nueva",
      "realidad": "Es una serie de pasos pequeños, cada uno con la app funcionando. Las future flags te dejan probar la versión siguiente sin cambiar de versión, y la ruta comodín de RouterProvider te deja tener rutas de los dos mundos a la vez."
    },
    {
      "mito": "Si activas todas las future flags, pasar de versión no puede romper nada",
      "realidad": "No rompe la API: el código compila y los tests pasan. Pero una flag como v7_startTransition cambia el orden en que React pinta, y eso puede destapar una carrera que ya estaba en tu código, como la de Cerrar sesión."
    },
    {
      "mito": "En la 8 hay que pasar al modo datos",
      "realidad": "El modo declarativo sigue en la 8. Esta app estaba en la 8.5.0 al final del paso 2 con BrowserRouter y Routes. El modo datos se elige por lo que da: loader en paralelo, action, ErrorBoundary por ruta y middleware."
    },
    {
      "mito": "Los tests de caracterización comprueban que la app hace lo correcto",
      "realidad": "Comprueban que hace lo mismo que antes, incluso lo discutible. Por eso el préstamo nuevo conserva la lista de libros vacía si fallan los libros: cambiarlo es otra tarea, con su propio test."
    },
    {
      "mito": "Con un middleware, todas las páginas protegidas cargan antes",
      "realidad": "El middleware se ejecuta antes que los loader de sus rutas, así que la sesión sigue yendo delante. En /prestamos hay dos rondas antes y después. Lo que se gana es lo que va detrás, que ya no espera en cascada."
    }
  ]
}
```

## Retos para ampliarlo

Sin comprobación automática, salvo la que escribas tú. Con los 30 tests de caracterización en verde en cada uno.

1. **«Devolver» sin navegar.** Cambia el `<Form>` de cada fila por un `fetcher.Form` (lección 5) y quita la fila al momento leyendo `fetcher.formData`, sin esperar a la API. ¿Qué tiene que pasar si la API falla?
2. **Que la raíz no vuelva a pedir nada.** Con la sesión compartida, el `loader` de la raíz no hace peticiones de más, pero se vuelve a ejecutar en cada búsqueda del catálogo porque cambia `?q=`. Escribe su `shouldRevalidate` (lección 4) para que solo se ejecute tras un envío, y comprueba con la pestaña Red que no cambia nada visible.
3. **Rutas bajo demanda.** Cambia los `...catalogo` de `rutas.tsx` por `lazy: () => import('./rutas/catalogo')` (lección 11) y compara el build: cuánto pesa el archivo principal antes y después.
4. **Con servidor.** Desde el paso 4, cambia `ssr: false` por `true` y mueve la sesión a una cookie de verdad con `createCookieSessionStorage` y un middleware de servidor (lecciones 17 y 18). ¿Qué pasa con la API de `servidor/`, que hoy vive dentro de Vite?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-router-proyectos/prestamo-biblioteca (rama main, punto de partida)",
      "descripcion": "La app en react-router-dom 6.26.2 y React 18.3.1, con sus 30 tests de caracterización en verde y un TODO en cada sitio que cambia.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/main/prestamo-biblioteca",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-router-proyectos/prestamo-biblioteca (rama solucion)",
      "descripcion": "La app migrada a React Router 8.5.0 en modo datos, con los mismos tests.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/solucion/prestamo-biblioteca",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Upgrading from v6",
      "descripcion": "La guía de la 7: actualizar a la última 6, las future flags una a una y el paso a la 7, con el sed de los import.",
      "url": "https://reactrouter.com/7.18.4/upgrading/v6",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Upgrading from v7",
      "descripcion": "La guía de la 8: los mínimos de Node y React, las future flags de la 7 y la desaparición de react-router-dom.",
      "url": "https://reactrouter.com/upgrading/v7",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Migrating to RouterProvider",
      "descripcion": "La guía de la 6 que explica la ruta comodín y cómo sacar las rutas de Routes una a una. La técnica del paso 3.",
      "url": "https://reactrouter.com/6.30.3/upgrading/v6-data",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Framework Adoption from RouterProvider",
      "descripcion": "Del modo datos al modo framework: módulos de ruta, la función convert, el plugin de Vite, root.tsx y routes.ts. El paso 4.",
      "url": "https://reactrouter.com/upgrading/router-provider",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Middleware",
      "descripcion": "El middleware de cliente del modo datos, el contexto con createContext y getContext para sembrar cada navegación.",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "React Router"
    },
    {
      "titulo": "GHSA-wrjc-x8rr-h8h6",
      "descripcion": "El aviso de seguridad que no tiene parche en la 6: rutas que vienen de fuera y acaban en una navegación externa. Afecta desde la 6.0.0 hasta antes de la 7.18.0.",
      "url": "https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6",
      "etiqueta": "GitHub"
    }
  ]
}
```
