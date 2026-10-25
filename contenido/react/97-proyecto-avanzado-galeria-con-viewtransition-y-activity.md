# Proyecto avanzado: galería con `<ViewTransition>` y `<Activity>`

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-galeria-con-viewtransition-y-activity` (autogenerado del título)
- **Orden:** 970
- **Fuentes:** [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) + [addTransitionType](https://react.dev/reference/react/addTransitionType) + [`<Activity>`](https://react.dev/reference/react/Activity) + [View Transitions (React Router)](https://reactrouter.com/how-to/view-transitions) — ver `contenido/react/TEMARIO.md` #97
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `galeria`)
- **Requiere:** Las lecciones 45 (`useLayoutEffect`), 51, 54 y 55 (transiciones, `<Activity>` y `<ViewTransition>`), 76 y 77 (React Router) y 83 y 84 (tests), y el módulo 10 (TypeScript)

---

## Qué vas a construir

«Luz del Norte» es la exposición de invierno de la **Asociación Fotográfica Cuarto Oscuro**, de Gijón: doce fotos de la costa, la montaña y los pueblos de Asturias, firmadas por nueve socios y fechadas entre noviembre y marzo. La exposición, la asociación y sus socios son inventados, y las fotos están generadas con inteligencia artificial; los lugares, en cambio, son reales. Su web tiene tres pestañas: «Galería», con la cuadrícula de fotos y la ficha de cada una; «Participa», con un formulario para proponer una foto para el año que viene, y «Visita», con el horario.

La web ya funciona: navegas, abres fotos, pasas a la siguiente, cambias de pestaña. Pero todo cambia **de golpe**, y al irte de «Participa» pierdes lo que llevabas escrito. Tu trabajo es lo que la lección 55 dejó para este proyecto: juntar en una aplicación de verdad las tres piezas de las lecciones 54 y 55.

- **Elemento compartido**: al abrir una foto, la miniatura crece hasta su sitio en la ficha; al volver, se encoge hasta su hueco en la cuadrícula, aunque esté abajo del todo.
- **Dirección con `addTransitionType`**: «Foto siguiente» entra por la derecha y «Foto anterior», por la izquierda. Las pestañas, igual: la que está a la derecha entra por la derecha, y una raya bajo la pestaña activa se desliza hasta la nueva.
- **Pestañas que conservan su estado**: las tres están siempre montadas, cada una dentro de un `<Activity>`. Lo escrito en «Participa» sigue ahí al volver, y «Galería» recuerda qué foto tenías abierta.

Es el proyecto más visual del temario, y también el que menos se puede comprobar con tests: una animación dura medio segundo y no deja rastro. Los tests del repositorio comprueban el estado, las rutas, el foco y que cada navegación lleve su tipo de transición; que la foto vuele bien lo compruebas tú, en el navegador.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/fa366347c92adce08bbfc5dda66e0a503db5fc11669c6f5bbd3e5d5539d9f28f.mp4",
  "poster": "https://www.techstudytracker.com/img/fe83c659a15d27180d35b957078885a06ec5f32eda1391a1fd0a62dae5f2710e.jpg",
  "titulo": "La galería terminada: elemento compartido, dirección y pestañas que no olvidan",
  "descripcion": "La miniatura crece hasta la ficha y vuelve a su sitio; anterior y siguiente se deslizan cada uno hacia su lado, y las pestañas conservan lo escrito. Fotos generadas con IA."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "React Router 8",
      "rol": "La URL y el momento",
      "descripcion": "Cada navegación va dentro de un startTransition. Eso es lo que activa los ViewTransition: sin transición, nada se anima."
    },
    {
      "etiqueta": "<ViewTransition>",
      "rol": "Qué se anima y cómo",
      "descripcion": "Con name, la foto compartida; con key y clases por tipo, las que entran y salen; alrededor de cada pestaña, su entrada y su salida."
    },
    {
      "etiqueta": "addTransitionType",
      "rol": "Hacia dónde",
      "descripcion": "Añade a la navegación el tipo adelante o atras, y cada ViewTransition elige con él la clase de su animación."
    },
    {
      "etiqueta": "<Activity>",
      "rol": "Lo que no se pierde",
      "descripcion": "Esconde las pestañas que no se ven sin desmontarlas: su estado y su DOM siguen ahí, y sus efectos se apagan hasta que vuelvan."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta galeria). La rama main trae la galería funcionando sin animaciones, con los estilos, los datos, las rutas y los tests ya hechos, y un comentario TODO (paso N) en cada sitio donde va tu trabajo, con el mismo número que los pasos de esta lección. La rama solucion tiene el proyecto terminado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Las fotos están generadas con IA",
  "contenido": "Las doce fotos se generaron con inteligencia artificial (la herramienta de imágenes de Codex, de OpenAI) a partir de una descripción de cada una: no son fotografías de esos lugares, y ni la exposición ni sus autores existen. El pie de la web y el README del proyecto lo dicen igual. Sirven para lo que importa aquí: fotos de verdad, con su peso y su tiempo de carga, viajando de la cuadrícula a la ficha."
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 22.22.2 o superior, o la LTS actual (24).** Es lo mismo que pedía el recetario del proyecto 93: React Router 8 necesita Node 22.22, y jsdom, con el que corren los tests, 22.22.2. Compruébalo con `node --version`.
- **Un navegador con la View Transition API y sus tipos.** React llama a `document.startViewTransition({ update, types })`, y esa forma, según la tabla de compatibilidad de MDN, la tienen Chrome y Edge desde la 125, Safari desde la 18.2 y Firefox desde la 147. Con uno más antiguo la galería funciona igual, pero sin animar (lo verás en el paso 7).
- **Las lecciones 54 y 55**, sobre todo. Este proyecto las aplica; cuando una idea ya tiene su explicación allí, te remito en vez de repetirla.

### Del cero al proyecto en marcha

1. **Consigue el código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o en [su página](https://github.com/pedroleni/react-proyectos), botón **Code** → **Download ZIP**.
2. **Abre en el editor la carpeta `galeria/`** (la del proyecto, no la del repositorio entero) y su terminal.
3. **Instala y arranca**: `npm install` y después `npm run dev`. Abre la dirección que imprime la terminal, normalmente `http://localhost:5173`.
4. **Ejecuta los tests en otra terminal**: `npm test`. Empiezan en rojo, y es a propósito:

```text
      Tests  6 failed | 7 passed (13)
```

Los siete que pasan comprueban lo que ya funciona: la cuadrícula, la ficha, anterior y siguiente, las páginas 404 y que solo se vea una pestaña a la vez. Los seis en rojo se ponen en verde a medida que avanzas: tras el paso 1 quedan cinco; tras el 2, cuatro; el 3 no cambia nada, porque el elemento compartido solo se ve en el navegador; tras el 4, dos; tras el 5, uno, y tras el 6, ninguno. El 7 es CSS y tampoco tiene test.

Antes de tocar nada, prueba la galería tal cual: abre una foto, pasa a la siguiente, ve a «Participa», escribe tu nombre, vuelve a «Galería» y otra vez a «Participa». Todo funciona, todo cambia de golpe, y tu nombre ha desaparecido.

## Cómo está organizado

```text
public/fotos/                 las doce fotos, a 1400 px en su lado largo
src/
├── main.tsx                  StrictMode y BrowserRouter
├── App.tsx                   la cabecera, las pestañas y las tres secciones      ← pasos 1, 2 y 6
├── secciones.ts              las tres pestañas y a cuál pertenece cada URL
├── transiciones.ts           tipos de transición, clases y nombres compartidos
├── transiciones.css          las animaciones (::view-transition-*)               ← pasos 3, 4 y 7
├── estilos.css               el resto de estilos
├── datos.ts                  las doce fotos
├── componentes/
│   ├── Foto.tsx              la foto: un <img> con su tamaño y un degradado mientras carga
│   ├── EnlaceConTipo.tsx     un enlace que navega con un tipo de transición     ← paso 5
│   └── Pestanas.tsx          las pestañas y su raya                              ← paso 6
├── paginas/
│   ├── Galeria.tsx           las rutas de la pestaña Galería
│   ├── Cuadricula.tsx        /            las doce miniaturas                    ← pasos 3 y 4
│   ├── Detalle.tsx           /foto/:id    la ficha, con anterior y siguiente     ← pasos 3, 4 y 5
│   ├── Participa.tsx         /participa   el formulario
│   ├── Visita.tsx            /visita      el horario
│   └── NoEncontrada.tsx      cualquier otra dirección
└── pruebas/                  Vitest y Testing Library
```

La diferencia con el recetario del proyecto 93 está en `App.tsx`: aquí no hay una ruta por pestaña con un `<Outlet />`. Las tres secciones están **siempre montadas**, y la URL solo decide cuál se ve. Así queda el árbol al terminar, con «Galería» a la vista:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "La galería terminada, en /foto/faro-de-penas",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: ubicacionGaleria",
      "nota": "← la sección sale de la URL"
    },
    {
      "nombre": "Pestanas",
      "nivel": 1,
      "nota": "← tres EnlaceConTipo y la raya, con su name"
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "etiqueta": "Activity visible",
      "nota": "← y dentro, un ViewTransition"
    },
    {
      "nombre": "Galeria",
      "nivel": 2,
      "nota": "← <Routes location={ubicacionGaleria}>"
    },
    {
      "nombre": "Detalle",
      "nivel": 3,
      "estado": "montado",
      "nota": "← la foto, con name=\"foto-faro-de-penas\""
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "etiqueta": "Activity hidden"
    },
    {
      "nombre": "Participa",
      "nivel": 2,
      "nota": "← escondida, con lo que llevabas escrito"
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "etiqueta": "Activity hidden"
    },
    {
      "nombre": "Visita",
      "nivel": 2,
      "nota": "← escondida"
    }
  ]
}
```

Todo lo que comparten las animaciones vive en `transiciones.ts`: los dos tipos de transición, las clases que se usan con cada uno y los nombres de los elementos compartidos. Ya está hecho, y lo usarás desde el paso 3:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Todo lo que las animaciones comparten, en un solo sitio: los tipos de\n// transición, las clases de transiciones.css y los nombres de los\n// elementos compartidos.\n\n/** Los dos tipos de transición de la app: hacia la derecha o hacia la izquierda. */\nexport const ADELANTE = 'adelante'\nexport const ATRAS = 'atras'\nexport type Direccion = typeof ADELANTE | typeof ATRAS\n\n/** Al entrar, según el tipo; sin tipo, sin animación propia. */\nexport const ENTRADA = {\n  [ADELANTE]: 'entra-por-la-derecha',\n  [ATRAS]: 'entra-por-la-izquierda',\n  default: 'none',\n}\n\n/** Al salir, según el tipo; sin tipo, sin animación propia. */\nexport const SALIDA = {\n  [ADELANTE]: 'sale-por-la-izquierda',\n  [ATRAS]: 'sale-por-la-derecha',\n  default: 'none',\n}\n\n/**\n * Un name por foto: dos ViewTransition con el mismo name montados a la vez\n * son un error, así que cada foto lleva el suyo, con un prefijo propio.\n */\nexport function nombreFoto(id: string): string {\n  return `foto-${id}`\n}\n\n/** La raya de la pestaña activa: solo hay una montada a la vez. */\nexport const NOMBRE_INDICADOR = 'indicador-pestana'",
  "anotaciones": [
    {
      "fragmento": "export const ADELANTE = 'adelante'",
      "nota": "Dos tipos para toda la app. Pasar a la foto siguiente y pasar a la pestaña de la derecha son lo mismo para la animación: lo nuevo entra por la derecha."
    },
    {
      "fragmento": "export const ENTRADA = {",
      "nota": "Un objeto en vez de una clase: para cada tipo, la clase que se pone al entrar. Las cuatro clases están en transiciones.css (lección 55)."
    },
    {
      "fragmento": "  default: 'none',\n}\n\n/** Al salir",
      "nota": "Si la transición no trae ninguno de los dos tipos (al abrir una foto, por ejemplo), sin animación propia: el ViewTransition no se aparta del resto de la página."
    },
    {
      "fragmento": "export function nombreFoto(id: string): string {",
      "nota": "Los nombres de los elementos compartidos, con un prefijo y en un solo sitio, como aconseja react.dev: dos partes de la app no pueden elegir el mismo sin darse cuenta."
    }
  ]
}
```

## Paso 1: las tres pestañas, siempre montadas (`src/App.tsx`)

En la rama `main`, `App` pinta cada sección con un condicional:

```tsx
{seccion === 'galeria' && <Galeria ubicacion={ubicacion} />}
{seccion === 'participa' && <Participa />}
{seccion === 'visita' && <Visita />}
```

Es el punto de partida de la lección 54, y tiene el mismo fallo: la sección que deja de verse **se desmonta**, y con ella se van su estado y su DOM. En «Participa», el formulario no guarda nada en el estado de React (sus campos no tienen `value`), así que lo que escribes vive solo en los elementos del DOM, y se tiran al desmontar.

El arreglo es el de aquella lección, con un componente pequeño para no repetirlo tres veces:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "<main className=\"contenido\">\n  <Panel visible={seccion === 'galeria'}>\n    <Galeria ubicacion={ubicacion} />\n  </Panel>\n  <Panel visible={seccion === 'participa'}>\n    <Participa />\n  </Panel>\n  <Panel visible={seccion === 'visita'}>\n    <Visita />\n  </Panel>\n</main>\n\nfunction Panel({ visible, children }: { visible: boolean; children: ReactNode }) {\n  return (\n    <Activity mode={visible ? 'visible' : 'hidden'}>\n      <div className=\"panel\">{children}</div>\n    </Activity>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Panel visible={seccion === 'galeria'}>",
      "nota": "Las tres secciones están siempre en el árbol. Lo único que cambia al cambiar de pestaña es el visible de cada Panel."
    },
    {
      "fragmento": "<Activity mode={visible ? 'visible' : 'hidden'}>",
      "nota": "Escondida, React le pone display: none !important a su primer elemento, conserva su estado y su DOM, y apaga sus efectos hasta que vuelva a verse (lección 54)."
    },
    {
      "fragmento": "<div className=\"panel\">{children}</div>",
      "nota": "Un elemento propio para cada sección: el que React esconde, y el que en el paso 6 envolverás en un ViewTransition para que entre y salga."
    }
  ]
}
```

Necesitas `Activity` y el tipo `ReactNode`, los dos de `react`. Prueba otra vez lo de antes: tu nombre sigue en «Participa» al volver, y `npm test` pone en verde «Participa conserva lo escrito al irte a otra pestaña y volver».

Ahora prueba esto otro:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// App.tsx, con el paso 1 hecho y el 2 sin hacer\n<Panel visible={seccion === 'galeria'}>\n  <Galeria ubicacion={ubicacion} />   {/* la ubicación de la URL */}\n</Panel>\n<Panel visible={seccion === 'participa'}>\n  <Participa />\n</Panel>\n\n// Y en Pestanas, la pestaña «Galería» lleva a '/'.\n\n// Abres «El faro de Peñas al anochecer» (/foto/faro-de-penas),\n// pulsas la pestaña «Participa» y después la pestaña «Galería».\n// ¿Qué ves?",
  "opciones": [
    "La ficha del faro: Activity ha conservado la galería tal como estaba",
    "La cuadrícula: la foto que tenías abierta se ha perdido",
    "La página «Esta página no existe.»",
    "La ficha del faro, pero sin la foto"
  ],
  "correcta": 1,
  "explicacion": "Activity conserva el estado de la galería, pero la galería decide qué pintar con la ubicación que recibe. Mientras estás en /participa, la galería escondida se vuelve a renderizar con esa URL y pinta la 404: lo comprobamos en Chromium, el panel escondido contenía «Esta página no existe.». Detalle se ha desmontado, y la pestaña «Galería» te lleva a /, a la cuadrícula."
}
```

## Paso 2: la galería recuerda dónde se quedó (`src/App.tsx`)

**Activity conserva el estado de un componente, pero no puede conservar lo que el componente lee de fuera.** Las rutas de la galería se casan con la URL, y la URL es una sola para toda la app: si está en `/participa`, la galería escondida también la ve.

Por eso `Galeria.tsx`, que ya está hecho, no lee la URL. Recibe una ubicación y se la pasa a `<Routes>`, que acepta una distinta de la del navegador:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Route, Routes, type Location } from 'react-router'\nimport Cuadricula from './Cuadricula'\nimport Detalle from './Detalle'\nimport NoEncontrada from './NoEncontrada'\n\n// Las rutas de la pestaña Galería. No se casan con la URL del navegador, sino\n// con la última ubicación de la galería: así, mientras estás en otra pestaña,\n// la galería sigue enseñando (escondida) la foto que dejaste abierta.\nexport default function Galeria({ ubicacion }: { ubicacion: Location }) {\n  return (\n    <Routes location={ubicacion}>\n      <Route path=\"/\" element={<Cuadricula />} />\n      <Route path=\"/foto/:id\" element={<Detalle />} />\n      <Route path=\"*\" element={<NoEncontrada />} />\n    </Routes>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Routes location={ubicacion}>",
      "nota": "La prop location de Routes: las rutas se casan con esta ubicación, no con la de la barra de direcciones. Dentro, useParams y useLocation también devuelven la suya."
    },
    {
      "fragmento": "<Route path=\"*\" element={<NoEncontrada />} />",
      "nota": "Cualquier dirección que no es de otra pestaña es de la galería: seccionDe, en secciones.ts, la manda aquí, y esta ruta pinta la 404."
    }
  ]
}
```

Lo que falta está en `App`: guardar la **última ubicación de la galería**, la que tenía cuando se veía, y dársela en vez de la de la URL. Mientras la galería está a la vista, las dos coinciden; cuando te vas a otra pestaña, la guardada se queda donde estaba.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const PORTADA: Location = { pathname: '/', search: '', hash: '', state: null, key: 'default' }\n\nexport default function App() {\n  const ubicacion = useLocation()\n  const seccion = seccionDe(ubicacion.pathname)\n\n  const [ubicacionGaleria, setUbicacionGaleria] = useState<Location>(\n    seccion === 'galeria' ? ubicacion : PORTADA,\n  )\n  if (seccion === 'galeria' && ubicacion !== ubicacionGaleria) {\n    setUbicacionGaleria(ubicacion)\n  }\n\n  const destinos: Record<Seccion, string> = {\n    galeria: ubicacionGaleria.pathname,\n    participa: '/participa',\n    visita: '/visita',\n  }\n\n  // ...\n<Panel visible={seccion === 'galeria'}>\n  <Galeria ubicacion={ubicacionGaleria} />\n</Panel>",
  "anotaciones": [
    {
      "fragmento": "const PORTADA: Location = { pathname: '/', search: '', hash: '', state: null, key: 'default' }",
      "nota": "Si la app arranca en /participa, la galería todavía no ha estado en ningún sitio: empieza en la portada."
    },
    {
      "fragmento": "useState<Location>(",
      "nota": "Un estado de App, no de la galería: la pestaña «Galería» también lo necesita para saber adónde llevar."
    },
    {
      "fragmento": "if (seccion === 'galeria' && ubicacion !== ubicacionGaleria) {",
      "nota": "Ajustar el estado durante el render, el patrón de la lección 39 (y del buscador del proyecto 93): mientras la galería se ve, sigue a la URL. React descarta ese render y vuelve a ejecutar App enseguida, antes de tocar el DOM: nunca se pinta con el valor viejo, y no hace falta ningún efecto."
    },
    {
      "fragmento": "galeria: ubicacionGaleria.pathname,",
      "nota": "La pestaña «Galería» lleva a donde te quedaste: con una foto abierta, a /foto/faro-de-penas. Así la URL siempre dice lo que se ve."
    },
    {
      "fragmento": "<Galeria ubicacion={ubicacionGaleria} />",
      "nota": "La galería, escondida o no, pinta su última ubicación: Detalle sigue montado mientras estás en otra pestaña."
    }
  ]
}
```

El tipo `Location` se importa de `react-router` (con `type`, porque es solo un tipo) y `useState`, de `react`. Repite la prueba: al volver, la foto del faro sigue abierta, y la dirección vuelve a ser `/foto/faro-de-penas`. Es el comportamiento de las pestañas de una aplicación de móvil, donde cada una recuerda por dónde ibas.

## Paso 3: el elemento compartido (`Cuadricula.tsx`, `Detalle.tsx` y `transiciones.css`)

La galería ya navega dentro de transiciones sin que hagas nada: `BrowserRouter` envuelve en `startTransition` cada cambio de ubicación (lo dice su documentación y está en su código: `React.startTransition(() => setStateImpl(newState))`). Es lo que la lección 55 pedía para animar, así que basta con decir **qué** se anima.

Para el elemento compartido, **la miniatura y la foto grande llevan un `<ViewTransition>` con el mismo `name`**. Al abrir una foto, la cuadrícula se desmonta con la miniatura dentro y la ficha se monta con la foto grande; React ve el mismo nombre en lo que sale y en lo que entra, y le pide al navegador que anime el paso de uno a otro. En la cuadrícula:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "<Link\n  to={`/foto/${foto.id}`}\n  className=\"miniatura\"\n  ref={foto.id === desde ? enlaceDesde : undefined}\n>\n  {/* El mismo name que la foto grande de Detalle: al abrirla, React\n      forma la pareja y el navegador la hace crecer hasta allí. */}\n  <ViewTransition name={nombreFoto(foto.id)} share=\"foto-compartida\">\n    <Foto foto={foto} forma=\"recorte\" />\n  </ViewTransition>\n  <span className=\"miniatura-texto\">\n    <span className=\"miniatura-titulo\">{foto.titulo}</span>\n    <span className=\"miniatura-autoria\">{foto.autoria}</span>\n  </span>\n</Link>",
  "anotaciones": [
    {
      "fragmento": "<ViewTransition name={nombreFoto(foto.id)} share=\"foto-compartida\">",
      "nota": "Un name por foto: foto-bufones-de-pria, foto-faro-de-penas… Con uno fijo para todas, React avisaría de que hay doce montados con el mismo nombre (lección 55)."
    },
    {
      "fragmento": "share=\"foto-compartida\"",
      "nota": "La clase que React pone a los pseudoelementos cuando esta foto viaja: con ella, transiciones.css le da su duración y arregla el cambio de forma."
    },
    {
      "fragmento": "ref={foto.id === desde ? enlaceDesde : undefined}",
      "nota": "Esto es del paso 4. Cópialo cuando llegues."
    }
  ]
}
```

Y en `Detalle.tsx`, la figura con la foto grande, con el mismo nombre:

```tsx
<ViewTransition name={nombreFoto(foto.id)} share="foto-compartida">
  <figure className="detalle-foto">
    <Foto foto={foto} forma="entera" />
  </figure>
</ViewTransition>
```

Los dos importan `ViewTransition` de `react` y `nombreFoto` de `../transiciones`. Fíjate en que ninguno de los dos `<ViewTransition>` es lo primero que se monta: uno está dentro de un `<li>` y de un enlace, y el otro, dentro del `<article>` de la ficha. Para entrar y salir eso importaría (lección 55, «Errores típicos»), pero **un elemento compartido puede estar tan dentro como quieras** de lo que se desmonta y de lo que se monta: react.dev lo dice así, y es lo que permite poner el nombre justo en la foto.

Abre una foto. La miniatura crece hasta su sitio en la ficha. Mírala bien a mitad de camino, porque hay un detalle feo: la miniatura es cuadrada y la foto grande, de 3 × 2, y durante la animación se ven dos rectángulos distintos, uno saliéndose por arriba y por abajo del otro.

### El cambio de forma

El navegador anima un **grupo** que cambia de posición y de tamaño, desde la caja de la miniatura hasta la de la foto grande (lo medimos: de 268 × 268 px a 690 × 460 en una ventana de 1440 px). Dentro, la foto de antes se desvanece y la de después aparece, y por defecto las dos ocupan el ancho del grupo con su alto natural: cada una conserva su proporción y se sale del grupo. La guía de Chrome sobre transiciones de vista lo explica con este mismo caso, una miniatura cuadrada que pasa a 16 × 9. El arreglo, en `transiciones.css`:

```css
::view-transition-group(.foto-compartida) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

/* La miniatura es cuadrada y la foto grande tiene su proporción: mientras el
   grupo cambia de forma, las dos imágenes lo llenan recortándose, en vez de
   estirarse. */
::view-transition-old(.foto-compartida),
::view-transition-new(.foto-compartida) {
  height: 100%;
  object-fit: cover;
  overflow: clip;
}
```

- **`animation-duration: 0.5s`** y una curva que arranca rápido y frena al llegar: el viaje dura el doble que el fundido por defecto, porque la foto recorre media pantalla.
- **`height: 100%`**: las dos imágenes, tan altas como el grupo además de tan anchas. Dejan de conservar su proporción…
- **`object-fit: cover`**: …pero no se deforman: cada una se escala para cubrir el grupo, como una foto recortada.
- **`overflow: clip`**: y lo que sobra, fuera. Lo comprobamos congelando la animación a mitad: sin esta línea, `object-fit` escala bien la imagen, pero lo que sobra se sigue pintando por fuera del grupo.

Ahora la foto cambia de forma sin salirse. Prueba también a volver con «Volver a la galería»: la foto se encoge hasta su miniatura. Con una de la primera fila, al menos. Abre «Teitos en la braña», la última, y vuelve: no vuela nada, y la cuadrícula aparece desde arriba, con los teitos fuera de la pantalla.

Fíjate también en el resto de la página: la cuadrícula desaparece de golpe y la ficha aparece de golpe, mientras solo la foto se mueve. Es lo que pasa con lo que no está dentro de ningún `<ViewTransition>` que se anime (lo medimos: la página nueva sale entera en el primer fotograma). En el paso 6 lo arreglarás con un fundido.

## Paso 4: scroll y foco, en efectos de layout (`Cuadricula.tsx`, `Detalle.tsx` y `transiciones.css`)

Los teitos no vuelan porque **una pareja necesita sus dos mitades a la vista**. react.dev lo avisa: si uno de los dos lados está fuera de la pantalla, no hay elemento compartido. Al volver, la cuadrícula se monta arriba del todo, la miniatura de los teitos queda debajo, y React ni lo intenta.

La solución es bajar la cuadrícula hasta la miniatura antes de que React mida, y aprovechar para devolverle el foco: el enlace «Volver a la galería» que pulsaste ya no existe, y quien usa el teclado se quedaría en ningún sitio (lección 37). El enlace ya deja en la ubicación qué foto estabas mirando, con `state={{ desde: foto.id }}`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default function Cuadricula() {\n  // «Volver a la galería» deja aquí qué foto estabas mirando.\n  const desde = (useLocation().state as { desde?: string } | null)?.desde\n  const enlaceDesde = useRef<HTMLAnchorElement>(null)\n\n  // Al volver de una foto, su miniatura tiene que estar a la vista: si no, la\n  // foto grande no tiene dónde aterrizar y no hay elemento compartido. Va en\n  // un efecto de layout porque React mide la página justo después de ellos;\n  // un useEffect llegaría cuando la animación ya ha terminado.\n  useLayoutEffect(() => {\n    const enlace = enlaceDesde.current\n    if (!enlace) return\n    enlace.scrollIntoView({ block: 'center' })\n    // Y el foco, al enlace de la foto de la que vienes (lección 37).\n    enlace.focus({ preventScroll: true })\n  }, [desde])",
  "anotaciones": [
    {
      "fragmento": "const desde = (useLocation().state as { desde?: string } | null)?.desde",
      "nota": "El state de la ubicación, que puso «Volver a la galería». Con TypeScript hay que decir qué forma tiene: React Router lo tipa como any."
    },
    {
      "fragmento": "const enlaceDesde = useRef<HTMLAnchorElement>(null)",
      "nota": "Una ref para un solo enlace: el de la foto de la que vienes, que en el JSX la recibe solo si foto.id === desde."
    },
    {
      "fragmento": "useLayoutEffect(() => {",
      "nota": "De layout, no normal. Es la clave de este paso, y la explica el texto de debajo."
    },
    {
      "fragmento": "enlace.scrollIntoView({ block: 'center' })",
      "nota": "La miniatura, en el centro de la ventana: a la vista, para que haya pareja."
    },
    {
      "fragmento": "enlace.focus({ preventScroll: true })",
      "nota": "Y el foco, en su enlace, sin otro scroll: el de la línea anterior ya la ha colocado."
    }
  ]
}
```

**¿Por qué `useLayoutEffect`?** Por el orden en que React hace las cosas durante una transición de vista. react.dev lo cuenta paso a paso: dentro de la función `update` que le pasa a `document.startViewTransition`, React aplica los cambios al DOM, ejecuta los **efectos de layout** (`useLayoutEffect`, refs) y **después mide** qué ha cambiado de sitio para decidir qué anima. Los `useEffect` normales se ejecutan **cuando la animación ha terminado**, para no estorbarla.

Lo medimos en Chromium, volviendo de los teitos con la cuadrícula en una ventana de 1440 × 900:

- Con `useLayoutEffect`, cuando React mide, la página ya está bajada 556 px: la miniatura está a la vista y la foto vuela hasta ella.
- Con `useEffect` (lo probamos con el proyecto terminado), cuando React mide, la página sigue arriba: no hay pareja. La foto grande se funde donde estaba y, al terminar la animación, la página salta hasta los teitos.

`Detalle` necesita lo mismo al revés, con dos efectos que van **antes** del `return` de `NoEncontrada` (las reglas de los hooks, lección 44):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const titulo = useRef<HTMLHeadingElement>(null)\n\n// Cada foto se abre arriba del todo, también al pasar a la siguiente. En un\n// efecto de layout, para que React mida la foto ya en su sitio.\nuseLayoutEffect(() => {\n  window.scrollTo(0, 0)\n}, [id])\n\n// Al llegar a la ficha, el foco va a su título: el enlace que pulsaste ya\n// no existe (lección 37). Solo al montarse: con «Siguiente» se queda donde está.\nuseLayoutEffect(() => {\n  titulo.current?.focus({ preventScroll: true })\n}, [])",
  "anotaciones": [
    {
      "fragmento": "window.scrollTo(0, 0)",
      "nota": "Cada foto se abre arriba. En la ventana de 1440 × 900 no se nota, porque la ficha es corta y el navegador recorta el scroll solo; en una de móvil (390 × 844), sin esta línea, la ficha se abría bajada 247 px, con el título fuera de la vista."
    },
    {
      "fragmento": "}, [id])",
      "nota": "Con [id], también al pasar a la siguiente foto, que en el paso 5 entrará deslizándose y tiene que hacerlo arriba."
    },
    {
      "fragmento": "titulo.current?.focus({ preventScroll: true })",
      "nota": "El foco, al título de la ficha, que necesita tabIndex={-1} para poder recibirlo: un h1 no es enfocable por sí solo."
    },
    {
      "fragmento": "}, [])",
      "nota": "Este, solo al montarse: si pulsas «Foto siguiente» con el teclado, el foco se queda en el enlace y puedes seguir pulsando Intro."
    }
  ]
}
```

Al `<h1>` de la ficha le hacen falta `ref={titulo}` y `tabIndex={-1}`. `npm test` pone en verde los dos tests del foco: «al abrir una foto, el foco va a su título» y «al volver a la galería, el foco vuelve a la foto de la que vienes».

Un detalle de `<Activity>` que ahora se nota: **al volver a enseñar una pestaña, React vuelve a ejecutar sus efectos, como si se montara** (lección 54). Abre una foto, vete a «Participa» y vuelve a «Galería»: el foco va otra vez al título de la foto. Aquí es lo que queremos, porque el efecto dice «al llegar a la ficha», y volver a la pestaña es llegar.

### La cabecera, tapada

Vuelve otra vez desde los teitos y mira arriba durante el medio segundo de la animación: **la cuadrícula se pinta encima de la cabecera**. La cabecera es `sticky` y en la página tapa lo que pasa por debajo; pero durante la transición no se ve la página, sino los pseudoelementos `::view-transition-*`, y los grupos que se animan (aquí, el de la foto y, desde el paso 6, el de la galería entera) se pintan por encima de la raíz, donde está la cabecera. El arreglo, en `transiciones.css`, es darle a la cabecera su propio grupo y ponerlo delante:

```css
.cabecera {
  view-transition-name: cabecera;
}

::view-transition-group(cabecera) {
  z-index: 1;
}
```

Un nombre puesto en CSS, a mano. react.dev desaconseja este sistema para **elegir animaciones**, y no es lo que hace aquí: la cabecera no cambia, así que su foto de antes y la de después son iguales y se queda quieta. El nombre solo le da **un grupo propio**, y como cada grupo es un pseudoelemento con `position: absolute`, acepta un `z-index` como cualquier otro elemento.

## Paso 5: anterior y siguiente, con dirección (`EnlaceConTipo.tsx` y `Detalle.tsx`)

«Foto siguiente» tiene que entrar por la derecha y «Foto anterior», por la izquierda. Para React los dos clics son lo mismo, «cambió la URL», así que hay que decírselo con `addTransitionType` dentro de la transición (lección 55). Y aquí está la dificultad: **la transición no la empiezas tú, la empieza React Router**, después de tu `onClick`.

Por eso `Detalle` usa un componente propio para esos dos enlaces, `EnlaceConTipo`, que en la rama `main` es un `<Link>` normal que ignora su `tipo`. Así queda:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default function EnlaceConTipo({ to, tipo, replace, state, ...resto }: Props) {\n  const href = useHref(to)\n  const navegarSegunElClic = useLinkClickHandler<HTMLAnchorElement>(to, { replace, state })\n\n  function manejarClic(evento: MouseEvent<HTMLAnchorElement>) {\n    startTransition(() => {\n      addTransitionType(tipo)\n      // React Router actualiza su estado dentro de otro startTransition, que\n      // hereda el tipo de este.\n      navegarSegunElClic(evento)\n    })\n  }\n\n  return <a {...resto} href={href} onClick={manejarClic} />\n}",
  "anotaciones": [
    {
      "fragmento": "const href = useHref(to)",
      "nota": "El href de verdad del enlace, el mismo que calcularía un Link: se puede abrir en otra pestaña y se ve al pasar el ratón."
    },
    {
      "fragmento": "useLinkClickHandler<HTMLAnchorElement>(to, { replace, state })",
      "nota": "El manejador de clic que usa el propio Link por dentro, y que React Router exporta para hacer enlaces propios: comprueba que sea un clic normal, sin Ctrl ni Cmd, cancela la navegación del navegador y navega con el router."
    },
    {
      "fragmento": "startTransition(() => {",
      "nota": "Tu transición, que envuelve el clic entero…"
    },
    {
      "fragmento": "addTransitionType(tipo)",
      "nota": "…con su tipo dentro, como pide la lección 55."
    },
    {
      "fragmento": "navegarSegunElClic(evento)",
      "nota": "Y la navegación. React Router cambia su estado dentro de su propio startTransition, que queda dentro del tuyo."
    }
  ]
}
```

La pregunta es si el tipo sobrevive a ese segundo `startTransition`. Sobrevive: en el código de React 19.3.1, cada `startTransition` **hereda los tipos del que lo envuelve** (`w.types = S !== null ? S.types : null`, en el build de desarrollo). Y con Ctrl o Cmd + clic, el manejador no navega: el enlace se abre en otra pestaña y la transición se queda vacía (lo comprobamos: ni transición de vista ni avisos en la consola).

Con los tipos llegando, falta que `Detalle` los use. La foto grande y la ficha llevan ahora una `key` y las clases de `transiciones.ts`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "<ViewTransition\n  key={foto.id}\n  name={nombreFoto(foto.id)}\n  share=\"foto-compartida\"\n  enter={ENTRADA}\n  exit={SALIDA}\n>\n  <figure className=\"detalle-foto\">\n    <Foto foto={foto} forma=\"entera\" />\n  </figure>\n</ViewTransition>\n\n<ViewTransition key={`ficha-${foto.id}`} enter={ENTRADA} exit={SALIDA} default=\"none\">\n  <div className=\"detalle-ficha\">\n    {/* la ficha, igual que antes */}\n  </div>\n</ViewTransition>\n\n<nav className=\"detalle-nav\" aria-label=\"Fotos de la muestra\">\n  <EnlaceConTipo to={`/foto/${anterior.id}`} tipo={ATRAS} replace className=\"boton\">\n    <span aria-hidden=\"true\">←</span> Foto anterior\n  </EnlaceConTipo>\n  <Link to=\"/\" state={{ desde: foto.id }} className=\"boton boton-volver\">\n    Volver a la galería\n  </Link>\n  <EnlaceConTipo to={`/foto/${siguiente.id}`} tipo={ADELANTE} replace className=\"boton\">\n    Foto siguiente <span aria-hidden=\"true\">→</span>\n  </EnlaceConTipo>\n</nav>",
  "anotaciones": [
    {
      "fragmento": "key={foto.id}",
      "nota": "Con una key distinta por foto, al pasar a la siguiente React desmonta un ViewTransition y monta otro: uno sale (exit) y otro entra (enter). Sin ella, sería el mismo y solo cambiaría lo de dentro."
    },
    {
      "fragmento": "share=\"foto-compartida\"",
      "nota": "Al venir de la cuadrícula hay pareja, y gana share: react.dev dice que tiene preferencia sobre enter y exit."
    },
    {
      "fragmento": "enter={ENTRADA}",
      "nota": "Con el tipo adelante, entra por la derecha; con atras, por la izquierda; sin tipo, nada propio."
    },
    {
      "fragmento": "exit={SALIDA}",
      "nota": "Y la de antes sale hacia el lado contrario."
    },
    {
      "fragmento": "default=\"none\"",
      "nota": "La ficha solo se mueve al entrar y al salir. Sin esto, cualquier cambio de dentro sería un update con fundido."
    },
    {
      "fragmento": "tipo={ATRAS} replace",
      "nota": "Anterior y siguiente sustituyen la entrada del historial (replace, lección 77): pasar doce fotos no deja doce pasos para el botón Atrás."
    },
    {
      "fragmento": "<Link to=\"/\" state={{ desde: foto.id }}",
      "nota": "Volver es un Link normal, sin tipo: la foto viaja con share y lo demás se funde."
    }
  ]
}
```

`ENTRADA` y `SALIDA` se importan de `../transiciones`. Pulsa «Foto siguiente» y «Foto anterior»: la foto y la ficha salen por un lado y entran por el otro. Las cuatro animaciones ya estaban en `transiciones.css`, con la misma forma que el carrusel de especias de la lección 55; la de entrada empieza 80 ms tarde, para que la de salida tenga tiempo de apartarse.

### Un test para algo que jsdom no tiene

`npm test` pone en verde «Foto siguiente es una transición de tipo adelante, y Foto anterior, de tipo atras». jsdom no tiene la View Transition API, y sin ella React aplica los cambios sin animar, como un navegador antiguo: no habría ningún tipo que mirar. Por eso `pruebas/transicionesDeMentira.ts` pone en su lugar una imitación que hace lo justo, apunta los tipos y llama a `update`, y el test comprueba lo que React le pide al navegador:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "describe('Paso 5: anterior y siguiente, con dirección', () => {\n  it('«Foto siguiente» es una transición de tipo adelante, y «Foto anterior», de tipo atras', async () => {\n    const usuario = montar('/foto/ercina-nevado')\n\n    await usuario.click(screen.getByRole('link', { name: 'Foto siguiente' }))\n    await screen.findByRole('heading', { level: 1, name: 'Hórreos de Espinaredo' })\n    expect(ultimosTipos()).toEqual(['adelante'])\n\n    await usuario.click(screen.getByRole('link', { name: 'Foto anterior' }))\n    await screen.findByRole('heading', { level: 1, name: 'Primera nevada en el lago Ercina' })\n    expect(ultimosTipos()).toEqual(['atras'])",
  "anotaciones": [
    {
      "fragmento": "montar('/foto/ercina-nevado')",
      "nota": "La app entera en una URL, con MemoryRouter: navega dentro de transiciones igual que BrowserRouter (es el mismo startTransition en su código)."
    },
    {
      "fragmento": "await usuario.click(screen.getByRole('link', { name: 'Foto siguiente' }))",
      "nota": "El nombre accesible del enlace: la flecha va en un span con aria-hidden y no cuenta."
    },
    {
      "fragmento": "expect(ultimosTipos()).toEqual(['adelante'])",
      "nota": "Los tipos que React pasó a document.startViewTransition en la última transición. Si el tipo se perdiera por el camino (en el onClick del Link, por ejemplo), sería una lista vacía."
    }
  ]
}
```

## Paso 6: las pestañas, con dirección (`Pestanas.tsx` y `App.tsx`)

Las pestañas hacen lo mismo que las fotos: la que está a la derecha entra por la derecha. Esta vez el tipo no es fijo, sale de comparar la posición de cada pestaña con la de la actual. Y la raya bajo la pestaña activa es otro elemento compartido: solo hay una, y al cambiar de pestaña se desmonta en una y se monta en otra.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "{SECCIONES.map((seccion) => {\n  const activa = seccion.id === actual\n  // La dirección sale de la posición: una pestaña a la derecha de la\n  // actual entra por la derecha.\n  const tipo = posicionDe(seccion.id) > posicionDe(actual) ? ADELANTE : ATRAS\n\n  return (\n    <li key={seccion.id}>\n      <EnlaceConTipo\n        to={destinos[seccion.id]}\n        tipo={tipo}\n        className=\"pestana\"\n        aria-current={activa ? 'page' : undefined}\n      >\n        {seccion.nombre}\n        {/* Solo la pestaña activa tiene raya. Al cambiar de pestaña, se\n            desmonta en una y se monta en otra con el mismo name:\n            un elemento compartido que se desliza de una a otra. */}\n        {activa && (\n          <ViewTransition name={NOMBRE_INDICADOR} share=\"raya\" default=\"none\">\n            <span className=\"pestana-indicador\" aria-hidden=\"true\" />\n          </ViewTransition>\n        )}\n      </EnlaceConTipo>\n    </li>\n  )\n})}",
  "anotaciones": [
    {
      "fragmento": "const tipo = posicionDe(seccion.id) > posicionDe(actual) ? ADELANTE : ATRAS",
      "nota": "posicionDe, de secciones.ts, da 0, 1 o 2. Desde «Galería», «Visita» es adelante; desde «Visita», «Participa» es atras."
    },
    {
      "fragmento": "aria-current={activa ? 'page' : undefined}",
      "nota": "Como hace NavLink: la pestaña de la sección actual se anuncia como página actual. Aquí la sección no sale de comparar la URL del enlace (en /foto/… la de «Galería» no coincidiría), sino de seccionDe."
    },
    {
      "fragmento": "<ViewTransition name={NOMBRE_INDICADOR} share=\"raya\" default=\"none\">",
      "nota": "Un name fijo, y está bien: solo hay una pestaña activa, y nunca hay dos rayas montadas a la vez."
    },
    {
      "fragmento": "default=\"none\"",
      "nota": "Solo se anima cuando viaja. Sin esto, la medimos animándose en todas las transiciones, también al abrir una foto, con un fundido invisible pero inútil."
    }
  ]
}
```

Cambia el `import` de `Link` por los de `ViewTransition` (de `react`), `EnlaceConTipo`, `posicionDe` y las constantes de `transiciones.ts`. La raya tiene su clase en `transiciones.css`, con un `z-index: 2` para quedar por delante incluso de la cabecera del paso 4.

Falta lo que se mueve: el contenido de cada pestaña. En `App.tsx`, el `Panel` del paso 1 envuelve su `<div>` en un `<ViewTransition>`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "function Panel({ visible, children }: { visible: boolean; children: ReactNode }) {\n  return (\n    <Activity mode={visible ? 'visible' : 'hidden'}>\n      {/* Al mostrarse, entra; al esconderse, sale. Hacia qué lado lo dice el\n          tipo de la transición. Si cambia lo de dentro (abrir una foto), un\n          fundido: es el update, que por defecto es \"auto\". */}\n      <ViewTransition enter={ENTRADA} exit={SALIDA}>\n        <div className=\"panel\">{children}</div>\n      </ViewTransition>\n    </Activity>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<ViewTransition enter={ENTRADA} exit={SALIDA}>",
      "nota": "Lo que react.dev llama animar la entrada y la salida con Activity: un ViewTransition dentro de un Activity entra cuando se muestra y sale cuando se esconde, dentro de una transición. Y con el tipo, hacia el lado que toca."
    },
    {
      "fragmento": "<div className=\"panel\">{children}</div>",
      "nota": "El primer elemento del DOM del ViewTransition, y el que Activity esconde. Que ningún elemento quede por encima del ViewTransition es lo que hace que cuente como entrada y salida (lección 55)."
    }
  ]
}
```

No tiene ni `update` ni `default`, así que su `update` es `"auto"`, el fundido del navegador. Es justo lo que faltaba en el paso 3: al abrir una foto, el contenido del panel cambia (se va la cuadrícula, llega la ficha), el panel se funde de una a otra y la foto viaja por encima. Es la misma idea que recomienda la guía de React Router para animar cualquier navegación: un `<ViewTransition>` que no se desmonta alrededor del contenido de las rutas.

`npm test` ya está entero en verde. Prueba las pestañas: el contenido entra por un lado y sale por el otro, y la raya se desliza de una pestaña a otra. Y los datos de antes siguen donde los dejaste.

## Paso 7: para quien no quiere animaciones, y para quien no las tiene (`transiciones.css`)

**React no apaga las animaciones a quien ha pedido menos movimiento en su sistema**: lo dice react.dev, y lo comprobó la lección 55. Aquí también: con la preferencia activada y sin ninguna regla, cada transición seguía durando lo mismo (535 ms la de abrir una foto). Esta es la regla de esa lección, al final de `transiciones.css`:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

Con `!important`, por encima de las clases de cada animación. Para probarlo sin tocar tu sistema, en las DevTools de Chrome: panel **Rendering**, **Emulate CSS media feature prefers-reduced-motion**. Lo medimos así: con la regla, cada transición termina en unos 50 ms y la página cambia de una vez, como antes del paso 3. En tu sistema, la preferencia está en macOS en Accesibilidad > Pantalla > Reducir movimiento, y en Windows en Accesibilidad > Efectos visuales > Efectos de animación.

Apagarlas del todo es la opción más simple. react.dev deja también la otra, suavizarlas: por ejemplo, quitar los desplazamientos y dejar solo los fundidos, que no dan sensación de movimiento.

### Lo que no se anima, y por qué está bien

Quedan tres casos en los que la galería cambia de golpe, a propósito:

- **El botón Atrás del navegador.** Abre una foto y pulsa Atrás: la cuadrícula aparece sin animación. Lo comprobamos: React ni siquiera llama a `startViewTransition`. react.dev lo explica en la sección para quien escribe routers: una navegación que llega por el evento `popstate` tiene que terminar al momento para que el navegador restaure el scroll y los formularios, y eso choca con animar; la salida es que el router use la Navigation API. React Router 8 todavía escucha `popstate`, y su guía lo reconoce: las navegaciones Atrás y Adelante del navegador pueden no animarse. «Volver a la galería» es un enlace a `/`, y no un `history.back()`, precisamente para que la vuelta sí se anime.
- **Un navegador sin la API.** React llama a `document.startViewTransition` dentro de un `try`, y si falla aplica los cambios sin animar. Lo comprobamos en Chromium de las dos formas: borrando la función antes de cargar la página y borrándola con la página ya abierta (`delete Document.prototype.startViewTransition` en la consola). La galería funcionó igual, sin errores ni avisos. Es una mejora progresiva: nadie se queda sin galería, solo sin el adorno.
- **Los tests.** Por lo mismo: jsdom no tiene la API, y si no fuera por la imitación del paso 5, los tests nunca verían una transición de vista.

En Safari probamos con WebKit 27.2: las mismas animaciones, con los mismos tipos. En Firefox no hemos podido probarlo; según MDN, la forma con objeto y tipos llega en la versión 147.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Para animar una navegación de React Router hay que ponerle viewTransition al Link",
      "realidad": "Esa prop llama a document.startViewTransition por su cuenta, y React Router la marca como obsoleta en favor de ViewTransition: React coordina las transiciones de vista él mismo, y tener las dos a la vez puede interrumpir las animaciones."
    },
    {
      "mito": "Activity conserva una pestaña tal como estaba",
      "realidad": "Conserva su estado y su DOM. Lo que lee de fuera, como la URL, sigue cambiando mientras está escondida: por eso la galería necesita su propia ubicación (paso 2)."
    },
    {
      "mito": "Un elemento compartido funciona esté donde esté la otra mitad",
      "realidad": "Si uno de los dos lados está fuera de la pantalla cuando React mide, no hay pareja. Por eso la cuadrícula baja hasta la miniatura en un efecto de layout, antes de que React mida."
    },
    {
      "mito": "Los efectos se ejecutan antes de que empiece la animación",
      "realidad": "Los de layout, sí: van dentro de la actualización, antes de medir. Los useEffect normales esperan a que la animación termine."
    }
  ]
}
```

## Las fotos de verdad: qué espera React antes de animar

En tu ordenador, con `npm run dev`, las doce fotos llegan al momento y todo vuela con su imagen. Con una red de verdad no siempre: cada foto pesa entre 140 y 340 KB, 2,8 MB las doce. `Foto.tsx`, que ya viene hecho, está preparado para eso:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default function Foto({ foto, forma }: Props) {\n  const [oscuro, medio, claro] = foto.colores\n  const estilo = {\n    '--oscuro': oscuro,\n    '--medio': medio,\n    '--claro': claro,\n    '--proporcion': foto.ancho / foto.alto,\n  } as CSSProperties\n\n  return (\n    <img\n      className={`foto foto-${forma}`}\n      src={urlFoto(foto)}\n      alt={foto.alt}\n      width={foto.ancho}\n      height={foto.alto}\n      style={estilo}\n    />\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "src={urlFoto(foto)}",
      "nota": "Las fotos están en public/fotos: Vite las sirve tal cual en desarrollo y las copia al build. urlFoto, en datos.ts, les pone delante import.meta.env.BASE_URL, por si un día publicas la app en una subcarpeta."
    },
    {
      "fragmento": "width={foto.ancho}",
      "nota": "El ancho y el alto del archivo (1400 × 934, por ejemplo). Con ellos, el navegador sabe la proporción antes de descargar nada y reserva el hueco: la página no salta cuando llega la foto."
    },
    {
      "fragmento": "alt={foto.alt}",
      "nota": "Lo que se ve en la foto, contado para quien no la ve. Es también el nombre accesible con el que la encuentran los tests."
    },
    {
      "fragmento": "'--proporcion': foto.ancho / foto.alto,",
      "nota": "Para el CSS de la ficha, que calcula el ancho máximo de la foto a partir de su alto máximo."
    },
    {
      "fragmento": "const [oscuro, medio, claro] = foto.colores",
      "nota": "Los tonos de cada foto, en datos.ts. Con ellos, estilos.css le pone a la imagen un fondo degradado: es lo que se ve mientras la foto no ha llegado."
    }
  ]
}
```

Ni `loading="lazy"` ni `decoding`, y es a propósito. En el código de `react-dom` 19.3.1 se ve que, en una transición, **React espera a que carguen las `<img>` nuevas antes de animar**: con un límite de tiempo (como mucho medio segundo dentro de la transición de vista), solo si calcula que la red da para descargarlas a tiempo, y nunca a las que llevan `loading="lazy"` o un `onLoad`. A las que espera, además, les pide él mismo que se decodifiquen (con `decode()`), así que `decoding` tampoco aporta nada aquí. Lo medimos en Chromium con el build de producción, limitando la red desde las DevTools:

- **Sin limitar la red**, todo vuela con su foto: React empieza la transición a los 50 ms del clic.
- **Con una red rápida (9 Mbps)**, entrando directamente en `/foto/teitos-de-somiedo` y pulsando «Volver a la galería»: React esperó unos 540 ms a las miniaturas que quedaban a la vista. La de los teitos ya estaba (es el mismo archivo que la foto grande, en caché) y voló con su imagen; las demás aún no habían llegado y se vio su degradado.
- **Con la misma red**, abriendo el faro 0,4 s después de entrar, con ninguna foto cargada todavía: React esperó 300 ms y la foto voló ya cargada.
- **Con una red lenta (1,6 Mbps)**, React no esperó: calcula que no daría tiempo. La foto viajó como su degradado y la imagen fue apareciendo según llegaba, también durante la animación: la «foto de después» que anima el navegador no es una captura fija, sino la página en directo.
- **Con `loading="lazy"`** en todas las fotos, React dejó de esperar también en la red rápida, y el faro voló sin su imagen.

Por eso las fotos no son perezosas, y por eso el degradado de fondo no sobra: es lo que viaja cuando la red no da para más.

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm test pasa entero?",
      "texto": "Trece tests: la galería, las pestañas, el foco y los tipos de transición. Si solo falla el de las pestañas con dirección, mira que Pestanas use EnlaceConTipo y no Link."
    },
    {
      "titulo": "¿npm run build y npm run lint no marcan nada?",
      "texto": "El build comprueba los tipos con tsc antes de construir. Un import que ya no usas (el Link de Pestanas, por ejemplo) es un error de tipos, no un aviso."
    },
    {
      "titulo": "¿Vuela la foto de la última fila, en las dos direcciones?",
      "texto": "Abre «Teitos en la braña» con la cuadrícula bajada y vuelve. La foto tiene que volar hasta su miniatura, con la cuadrícula ya colocada, y la cabecera tiene que quedar delante todo el rato."
    },
    {
      "titulo": "¿Y en una ventana estrecha?",
      "texto": "Con las DevTools en modo móvil, la ficha es más larga que la pantalla: cada foto tiene que abrirse arriba, también al pasar a la siguiente."
    },
    {
      "titulo": "¿Se mueve todo hacia el lado que toca?",
      "texto": "Anterior y siguiente, y las tres pestañas en todos los órdenes: de «Galería» a «Visita» y de «Visita» a «Participa»."
    },
    {
      "titulo": "¿Y con la red lenta?",
      "texto": "DevTools, panel Network, una red limitada y la caché desactivada. Entra directamente en una foto y vuelve: lo que no haya llegado viaja como su degradado, sin huecos ni saltos."
    },
    {
      "titulo": "¿Con prefers-reduced-motion emulado, nada se mueve?",
      "texto": "DevTools, panel Rendering. La galería tiene que seguir funcionando igual, cambiando de golpe."
    },
    {
      "titulo": "¿La consola está limpia?",
      "texto": "En desarrollo, React avisa si dos ViewTransition comparten name o si addTransitionType se llama fuera de una transición. No tiene que salir ninguno de los dos."
    }
  ]
}
```

## Errores típicos

**Las pestañas con un condicional y un `set` suelto.** Son los dos puntos de partida de la rama `main`, y conviene tenerlos claros por separado: el condicional hace que se pierda el estado (el paso 1 lo arregla con `<Activity>`), y el `set` fuera de una transición hace que nada se anime. Aquí tienes las mismas tres pestañas en pequeño, sin router, para probarlo en esta página:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Luz del Norte, en pequeño: tres pestañas",
  "consigna": "Escribe tu nombre en «Participa», ve a «Visita» y vuelve: se ha borrado. Arréglalo con un componente Panel que use Activity, como en el paso 1. Después haz que elegir() cambie la pestaña dentro de startTransition, con addTransitionType: adelante si la nueva está a la derecha y atras si está a la izquierda. Envuelve lo de dentro de cada Panel en un ViewTransition con las clases de estilos.css, y la raya en otro con name.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PESTANAS = [\n  { id: 'galeria', nombre: 'Galería' },\n  { id: 'participa', nombre: 'Participa' },\n  { id: 'visita', nombre: 'Visita' },\n]\n\nconst COLORES = ['#2f6f86', '#6c7f86', '#c4703f', '#5b4b8a', '#7e9aa6', '#8a6a3f']\n\nfunction Galeria() {\n  return (\n    <section className=\"panel\">\n      <h2>Doce fotos del invierno asturiano</h2>\n      <div className=\"fotos\">\n        {COLORES.map((color) => (\n          <span key={color} className=\"foto\" style={{ background: color }} />\n        ))}\n      </div>\n    </section>\n  )\n}\n\nfunction Participa() {\n  return (\n    <section className=\"panel\">\n      <h2>Participa en la muestra de 2027</h2>\n      <label>\n        Nombre\n        <input />\n      </label>\n      <label>\n        Cuéntanos la foto\n        <textarea rows=\"3\" />\n      </label>\n    </section>\n  )\n}\n\nfunction Visita() {\n  return (\n    <section className=\"panel\">\n      <h2>Visita la exposición</h2>\n      <p>De martes a sábado, de 11:00 a 14:00 y de 17:00 a 20:30.</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pestana, setPestana] = useState('galeria')\n\n  function elegir(id) {\n    // Falta la transición, con el tipo adelante o atras según la posición\n    setPestana(id)\n  }\n\n  return (\n    <main>\n      <nav aria-label=\"Secciones\">\n        {PESTANAS.map((p) => (\n          <button key={p.id} aria-pressed={p.id === pestana} onClick={() => elegir(p.id)}>\n            {p.nombre}\n            {p.id === pestana && <span className=\"raya\" />}\n          </button>\n        ))}\n      </nav>\n      {/* Con condicionales, la pestaña que se va se desmonta */}\n      {pestana === 'galeria' && <Galeria />}\n      {pestana === 'participa' && <Participa />}\n      {pestana === 'visita' && <Visita />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nnav {\n  display: flex;\n  gap: 1.25rem;\n  margin-bottom: 1rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nnav button {\n  position: relative;\n  padding: 0.5rem 0.1rem 0.7rem;\n  border: none;\n  background: none;\n  color: #57534e;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\nnav button[aria-pressed='true'] {\n  color: #1c1917;\n}\n\n.raya {\n  position: absolute;\n  right: 0;\n  bottom: -1px;\n  left: 0;\n  height: 3px;\n  border-radius: 3px 3px 0 0;\n  background: #b45309;\n}\n\n.panel h2 {\n  margin: 0 0 0.6rem;\n  font-size: 1.2rem;\n}\n\n.fotos {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 0.5rem;\n}\n\n.foto {\n  aspect-ratio: 1;\n  border-radius: 6px;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.6rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.5rem;\n  font: inherit;\n  font-weight: 400;\n}\n\n/* Las clases para el ViewTransition de cada pestaña */\n\n@keyframes desde-la-derecha {\n  from {\n    transform: translateX(60px);\n    opacity: 0;\n  }\n}\n\n@keyframes desde-la-izquierda {\n  from {\n    transform: translateX(-60px);\n    opacity: 0;\n  }\n}\n\n@keyframes hacia-la-izquierda {\n  to {\n    transform: translateX(-60px);\n    opacity: 0;\n  }\n}\n\n@keyframes hacia-la-derecha {\n  to {\n    transform: translateX(60px);\n    opacity: 0;\n  }\n}\n\n::view-transition-new(.entra-por-la-derecha) {\n  animation: 0.4s ease-out both desde-la-derecha;\n}\n\n::view-transition-new(.entra-por-la-izquierda) {\n  animation: 0.4s ease-out both desde-la-izquierda;\n}\n\n::view-transition-old(.sale-por-la-izquierda) {\n  animation: 0.3s ease-in both hacia-la-izquierda;\n}\n\n::view-transition-old(.sale-por-la-derecha) {\n  animation: 0.3s ease-in both hacia-la-derecha;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation: none !important;\n  }\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Lo escrito en «Nombre» sigue ahí al ir a «Visita» y volver a «Participa»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Participa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Rosa Cueto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Visita"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Participa"
          }
        }
      ],
      "espera": {
        "etiqueta": "Nombre",
        "valor": "Rosa Cueto"
      }
    },
    {
      "descripcion": "Lo escrito en «Cuéntanos la foto», que no es estado de React, también sigue ahí al volver",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Participa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Cuéntanos la foto",
            "texto": "Niebla en el puerto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Galería"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Participa"
          }
        }
      ],
      "espera": {
        "etiqueta": "Cuéntanos la foto",
        "valor": "Niebla en el puerto"
      }
    },
    {
      "descripcion": "Al pulsar «Visita», se ve el horario",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Visita"
          }
        }
      ],
      "espera": {
        "texto": "De martes a sábado, de 11:00 a 14:00 y de 17:00 a 20:30."
      }
    },
    {
      "descripcion": "Al pulsar «Visita», la galería deja de verse",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Visita"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "heading",
          "nombre": "Doce fotos del invierno asturiano"
        }
      }
    }
  ]
}
```

Las comprobaciones miran el estado; las animaciones, míralas tú en la vista previa. Si la consola se queda limpia y las pestañas se deslizan, el tipo ha llegado.

**El tipo, en el `onClick` del `<Link>`.** Es lo primero que se prueba en el paso 5:

```tsx
<Link to={`/foto/${siguiente.id}`} onClick={() => addTransitionType('adelante')}>
```

El `onClick` se ejecuta antes que la navegación, pero fuera de cualquier transición: la de React Router empieza después. React avisa en la consola, y nada se desliza (lo comprobamos: las transiciones llegaban con la lista de tipos vacía):

```text
addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition.
```

Es decir: `addTransitionType` solo se puede llamar dentro de la función que le pasas a `startTransition()`, porque el tipo tiene que pertenecer a una transición concreta. Por eso `EnlaceConTipo` envuelve el clic entero en su propio `startTransition`.

**Bajar la cuadrícula en un `useEffect`.** Parece lo mismo que el paso 4 con el hook de siempre. Antes de leer la explicación del paso, predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Cuadricula.tsx del proyecto terminado, con useEffect en vez de useLayoutEffect\nuseEffect(() => {\n  const enlace = enlaceDesde.current\n  if (!enlace) return\n  enlace.scrollIntoView({ block: 'center' })\n  enlace.focus({ preventScroll: true })\n}, [desde])\n\n// Abres «Teitos en la braña», la última de la cuadrícula,\n// y pulsas «Volver a la galería». ¿Qué ves?",
  "opciones": [
    "Lo mismo que con useLayoutEffect: la foto vuelve volando a su miniatura",
    "La foto grande se funde donde estaba, la cuadrícula aparece desde arriba y, al acabar la animación, la página salta hasta los teitos",
    "La foto vuela hacia donde estaría la miniatura con la página arriba, por debajo del borde de la ventana",
    "Nada se mueve: un efecto no puede hacer scroll durante una transición de vista"
  ],
  "correcta": 1,
  "explicacion": "React ejecuta los useEffect cuando la animación ha terminado. Al medir, la página seguía arriba y la miniatura de los teitos, fuera de la ventana: sin la otra mitad a la vista no hay pareja, y la foto no vuela a ninguna parte. Medido en Chromium: con useLayoutEffect, React mide con la página bajada 556 px y anima la foto; con useEffect, mide con 0 px, no hay grupo para la foto y el salto llega al final."
}
```

**Olvidar la `key` de los `<ViewTransition>` de la ficha.** Con los tipos llegando bien, «Foto siguiente» no desliza nada: la foto vieja y la nueva se funden. Sin `key`, el `<ViewTransition>` es el mismo para todas las fotos y solo cambia lo de dentro; no hay nada que entre ni que salga, así que las clases de `enter` y `exit` no se usan nunca (lo comprobamos quitando las dos `key`). Es el mismo error que el del carrusel de la lección 55.

**Leer la URL desde una pestaña escondida.** Ya lo viste en el paso 2: cualquier componente que dependa de la URL sigue escuchándola mientras está escondido. Si algún día pones otra sección con rutas propias (unas fichas de autor en «Visita», por ejemplo), necesitará su propia ubicación guardada, como la galería.

**Poner el mismo `name` a todas las fotos.** Si `nombreFoto` devolviera siempre `'foto'`, React avisaría en cuanto se monta la cuadrícula, porque hay doce con el mismo nombre («There are two <ViewTransition name=%s> components with the same name mounted at the same time», con la pila del duplicado detrás, como en la lección 55). Lo probamos: además de los dos errores en la consola, al volver a la cuadrícula la foto ya no vuela. Cada foto, su nombre: para eso lleva el `id`.

## Retos para ampliarlo

Sin comprobación automática, salvo la que escribas tú.

1. **Las flechas del teclado en la ficha.** Que ← y → hagan lo mismo que «Foto anterior» y «Foto siguiente». Escucha `keydown` en un efecto con su limpieza (lección 38), lee la foto actual con `useEffectEvent` (lección 41) y navega con `useNavigate`, dentro de `startTransition` y con su tipo, como `EnlaceConTipo`. Que no salte si el foco está en un campo de texto.
2. **Que cada pestaña recuerde su scroll.** Baja por la cuadrícula, ve a «Visita» y vuelve: estás arriba. Activity conserva el DOM, pero el scroll de la ventana es uno para todas. En `Panel`, guarda en una ref el `scrollY` mientras la pestaña se ve (un efecto con un `listener` de `scroll`, que Activity apaga al esconderla) y devuélveselo en un efecto de layout al volver a enseñarla. Cuidado con el orden: los efectos de los hijos se ejecutan antes que los del padre.
3. **Un filtro por categoría.** Tres botones, «Costa», «Montaña» y «Pueblo», encima de la cuadrícula, con la categoría en la URL (`?categoria=Costa`, lección 77). Para que las miniaturas que se quedan se recoloquen deslizándose, cada `<li>` necesita su propio `<ViewTransition>` con `key`, como el escaparate que se reordena en la lección 55. Comprueba que la foto sigue volando hasta la ficha.
4. **Miniaturas más ligeras.** La cuadrícula descarga las doce fotos enteras, 2,8 MB, para enseñarlas a menos de 300 px. Genera miniaturas de 540 px en su lado corto (con calidad media pesan unos 840 KB las doce) y úsalas en la cuadrícula con `srcSet` y `sizes`, para que un móvil que necesite más se lleve la entera. Lo probamos, y tiene una contrapartida: al abrir una foto, la grande ya no está en caché, y con la red rápida de la sección anterior React retrasó la animación hasta 730 ms esperándola. Arréglalo precargándola cuando el ratón pasa por encima o la miniatura recibe el foco, con `preload` de `react-dom` (lección 81): con el ratón 300 ms encima antes de pulsar, la espera bajó a 340 ms. Si precargas también la anterior y la siguiente desde la ficha, «Foto siguiente» sale al momento, pero Chrome avisa en la consola de cada precarga que no se usa en unos segundos.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/galeria (rama main, punto de partida)",
      "descripcion": "La galería funcionando sin animaciones, con los TODO de cada paso y los trece tests ya escritos.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/galeria",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/galeria (rama solucion)",
      "descripcion": "El proyecto terminado, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/galeria",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "<ViewTransition>",
      "descripcion": "La referencia completa. Para este proyecto, sobre todo: cómo funciona por dentro (el orden de los efectos), el elemento compartido, la animación con Activity y la sección para quien escribe routers.",
      "url": "https://react.dev/reference/react/ViewTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "addTransitionType",
      "descripcion": "Los tipos de transición, con clases, con selectores de CSS por tipo y con los eventos de ViewTransition.",
      "url": "https://react.dev/reference/react/addTransitionType",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Activity>",
      "descripcion": "Esconder sin perder el estado, y qué pasa con los efectos de lo que está escondido.",
      "url": "https://react.dev/reference/react/Activity",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "View Transitions",
      "descripcion": "La guía de React Router 8: un ViewTransition alrededor del contenido de las rutas, elementos compartidos entre una lista y un detalle, y por qué Atrás puede no animarse.",
      "url": "https://reactrouter.com/how-to/view-transitions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useLinkClickHandler",
      "descripcion": "El manejador de clic de Link, para hacer enlaces propios como EnlaceConTipo.",
      "url": "https://reactrouter.com/api/hooks/useLinkClickHandler",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Same-document view transitions for single-page applications",
      "descripcion": "La guía de Chrome sobre la API del navegador, con el caso de una miniatura cuadrada que cambia de proporción.",
      "url": "https://developer.chrome.com/docs/web-platform/view-transitions/same-document",
      "etiqueta": "Chrome"
    }
  ]
}
```
