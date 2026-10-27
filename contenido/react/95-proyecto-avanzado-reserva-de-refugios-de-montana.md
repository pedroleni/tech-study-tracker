# Proyecto avanzado: reserva de refugios de montaña

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-reserva-de-refugios-de-montana` (autogenerado del título)
- **Orden:** 950
- **Fuentes:** [useActionState](https://react.dev/reference/react/useActionState) + [useOptimistic](https://react.dev/reference/react/useOptimistic) + [`<form>`](https://react.dev/reference/react-dom/components/form) + [Zod: Defining schemas](https://zod.dev/api) + [MSW: Vite](https://mswjs.io/guides/integrations/vite) — ver `contenido/react/TEMARIO.md` #95
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `reserva-refugios`)
- **Requiere:** Las lecciones 57 a 62 (formularios y Actions), la 37 (accesibilidad), la 72 y la 73 (TypeScript) y la 83 y la 84 (tests)

---

## Qué vas a construir

Cinco refugios guardados del Pirineo aragonés (Respomuso, Pineta, Estós, Ángel Orús y la Renclusa) y un formulario para reservar plaza en tres pasos: **el refugio y las fechas**, **quién viene** y **revisar y confirmar**. Al pulsar «Ver plazas y seguir», la aplicación pregunta al servidor cuántas plazas quedan cada noche; al confirmar, las plazas de tu grupo se restan **en el acto**, marcadas como retenidas, mientras el servidor decide. Si dice que sí, sale el localizador. Si falla, o si otro grupo se te ha adelantado, las plazas vuelven solas y un aviso te dice qué ha pasado.

Es el módulo 8 entero en una aplicación de verdad, con lo que la lección 62 no podía tener dentro de la web:

- **Actions** (lecciones 57 a 59): los tres pasos son tres `<form action>` y **una sola acción** con `useActionState` decide qué validar, qué pedir al servidor y a qué paso ir. Los botones leen el envío con `useFormStatus`.
- **Zod** (lección 61): **un esquema para toda la reserva**, recortado para cada paso y usado también por el servidor, que vuelve a validar lo que le llega.
- **`useOptimistic`** (lecciones 60 y 62): **lo optimista es la disponibilidad, no la reserva**. Verás por qué esa diferencia importa.
- **Accesibilidad completa** (lección 37): etiquetas, ayudas y errores unidos con `useId`, el foco siempre en un sitio con sentido, regiones vivas, el paso actual marcado con `aria-current` y botones que no pierden el foco mientras se envía.
- **Un servidor que no existe**, simulado con MSW (lección 84): los mismos manejadores contestan en el navegador y en los tests.
- **TSX** (lecciones 72 y 73) y **tests** con Vitest, Testing Library, user-event y axe (lecciones 83 y 84).

Los nombres, las zonas y las altitudes de los refugios son reales. **Las plazas, los precios y las reservas son inventados**: este proyecto no reserva nada en ningún refugio. **Las imágenes están generadas con IA**: un refugio genérico en el paisaje de cada sitio, no fotos de los refugios reales. El pie de la página lo dice.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/c0269e6a180c32483c911f7ad20cbdb69507d87cd3b83fdf4a8ef6296e68b6b4.mp4",
  "poster": "https://www.techstudytracker.com/img/7ecafdd0eb62ad4a05b8213afc1c6ee6ca82548a23c9ad3f3264386eb5472d0e.jpg",
  "titulo": "La reserva de refugios, funcionando",
  "descripcion": "Pineta no tiene plazas y el paso 1 lo dice; el paso 2 lleva el foco al primer error. En Estós las plazas se retienen al momento y vuelven solas cuando el servidor falla."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta reserva-refugios). La rama main trae la aplicación maquetada, el servidor simulado, el panel para controlarlo y los tests ya escritos, con un TODO (paso N) en cada sitio donde va tu trabajo: el esquema, el servidor, la acción, la accesibilidad y las plazas optimistas. La rama solucion tiene el proyecto terminado, con sus 36 tests en verde."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres piezas que mueven el formulario",
  "roles": [
    {
      "etiqueta": "useActionState",
      "rol": "El estado de toda la reserva",
      "descripcion": "En qué paso estás, lo escrito en cada campo, los errores, los avisos y las plazas de verdad. Lo cambia una sola acción, la de avanzar."
    },
    {
      "etiqueta": "Zod",
      "rol": "Las reglas, una sola vez",
      "descripcion": "Un esquema para la reserva entera. Cada paso valida su trozo, la acción valida el todo antes de enviar y el servidor lo valida otra vez al recibir."
    },
    {
      "etiqueta": "useOptimistic",
      "rol": "Las plazas mientras se confirma",
      "descripcion": "Encima de las plazas de verdad, las que se ven mientras el servidor contesta: con las tuyas ya restadas. Se retiran solas cuando termina la acción."
    }
  ]
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 22.12 o superior**, mejor la LTS actual, Node 24. Es lo que pide MSW 3; Vite 8 se conformaría con la 20.19. Compruébalo con `node --version`. Con Node 22.12 exacto, `npm install` avisa con cinco `EBADENGINE` de los paquetes `@inquirer/*`, que usa la línea de órdenes de MSW: lo instala todo y el proyecto funciona igual (comprobado).
- **Un editor con terminal**, como [Visual Studio Code](https://code.visualstudio.com) y su terminal integrada (menú `Terminal` → `New Terminal`).
- **El código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o en la página del repositorio, botón **Code** → **Download ZIP**. El proyecto es la carpeta `reserva-refugios/`, no el repositorio entero.

### Del cero al proyecto en marcha

1. **Abre la carpeta `reserva-refugios/`** en el editor.
2. **Instala las dependencias**: `npm install`.
3. **Arranca el servidor de desarrollo**: `npm run dev`, y abre la dirección que imprime (normalmente `http://localhost:5173`). En la consola de las DevTools verás `[MSW] Mocking enabled.`: el servidor simulado está en marcha. Verás los cinco refugios, las fechas, el número de personas y, abajo a la derecha, el panel **Servidor simulado**. Elige lo que quieras y pulsa «Ver plazas y seguir»: no pasa nada, te quedas en el paso 1. Eso es lo que vas a construir.
4. **En otra terminal, ejecuta los tests**: `npm test`. Es tu lista de tareas:

```text
 Test Files  4 failed (4)
      Tests  29 failed | 3 passed | 4 todo (36)
```

Los 3 verdes son lo que ya funciona sin ti: la página recién cargada (que axe da por buena), su título y la consulta de plazas del servidor simulado. Los 4 pendientes (`it.todo`) los escribes tú en el paso 6. El marcador, paso a paso, comprobado aplicando la solución de cada paso sobre la rama `main`:

- Tras el paso 1 (el esquema), quedan 19 en rojo.
- Tras el paso 2 (el servidor), 14.
- Tras el paso 3 (la acción), 10: la aplicación ya avanza, pero los tests buscan también el foco y las descripciones de los campos.
- Tras el paso 4 (la accesibilidad), 2: los de las plazas retenidas.
- Tras el paso 5 (lo optimista), ninguno: 32 en verde y 4 pendientes.
- En el paso 6 escribes los 4 que faltan y terminas con 36.

Para lanzar solo un archivo mientras trabajas: `npm test -- esquema`. Y `npx vitest` (sin `run`) se queda vigilando y repite los tests cada vez que guardas.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Todo lo de esta lección está ejecutado de verdad",
  "contenido": "El proyecto usa React 19.3.1, Vite 8.3.5, TypeScript 6.0.3 y Oxlint, como la plantilla react-ts de create-vite 9.3.1, más Zod 4.6.7 y MSW 3.0.3. Para los tests, Vitest 5.0.5, Testing Library React 16.3.3, user-event 14.6.8, jest-dom 7.0.1, vitest-axe 0.1.0 (con axe-core 4.14.0) y jsdom 28.1.0. Las salidas que verás son copias de la terminal, solo recortadas, del 22 y el 23 de octubre de 2026, y lo que se dice del navegador está comprobado en Chromium."
}
```

**Y TypeScript 7.** Desde la versión 9.3.3 de `create-vite` (27 de octubre de 2026), la plantilla `react-ts` trae `"typescript": "~7.0.2"`, que es también lo que instala hoy `npm install -D typescript`. Este proyecto se queda en la 6.0.3, la misma versión que el panel de tipos de esta web, y su código pasa `tsc` sin errores con las dos. Si creas tu proyecto desde cero, tendrás la 7: los comandos (`tsc -b`, `npm run build`) son los mismos.

## Cómo está organizado

```text
src/
├── main.tsx                 ← arranca MSW con npm run dev y monta la aplicación
├── App.tsx                  ← cabecera, <Reserva /> y pie
├── assets/refugios/         ← las cinco imágenes, generadas con IA
├── reserva/
│   ├── esquema.ts           ← paso 1: el esquema de Zod de toda la reserva
│   ├── accion.ts            ← paso 3: la acción de useActionState
│   ├── Reserva.tsx          ← pasos 4 y 5: el estado, el foco y las plazas optimistas
│   ├── Campo.tsx            ← paso 4: etiqueta, ayuda y error unidos al campo
│   ├── PasoRefugio.tsx      ← paso 4 (el grupo de opciones); el resto, hecho
│   ├── BotonesPaso.tsx      ← paso 4: botones que no pierden el foco
│   ├── PasoGrupo.tsx, PasoConfirmar.tsx, ReservaHecha.tsx
│   ├── Pasos.tsx, TuReserva.tsx, Disponibilidad.tsx, ResumenReserva.tsx, FotoRefugio.tsx
│   ├── api.ts               ← las dos peticiones: plazas y reserva
│   ├── refugios.ts, fechas.ts, importe.ts, tipos.ts
├── servidor/
│   ├── manejadores.ts       ← paso 2: GET /api/disponibilidad y POST /api/reservas
│   ├── baseDeDatos.ts       ← las plazas y las reservas, en memoria
│   ├── ajustes.ts           ← latencia y qué le pasa a la próxima reserva
│   └── PanelServidor.tsx    ← el panel «Servidor simulado»
└── pruebas/                 ← paso 6: los tests
```

Todo el estado de la reserva vive en `Reserva`, en un `useActionState`. Los componentes de cada paso solo reciben lo que pintan:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Quién guarda el estado y quién lo pinta",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "cabecera y pie; sin estado"
    },
    {
      "nombre": "Reserva",
      "nivel": 1,
      "etiqueta": "estado: useActionState",
      "nota": "y useOptimistic sobre las noches"
    },
    {
      "nombre": "Pasos",
      "nivel": 2,
      "nota": "← el paso actual, con aria-current=\"step\""
    },
    {
      "nombre": "PasoRefugio",
      "nivel": 2,
      "nota": "← dentro de <form key={paso}>, solo en el paso 1"
    },
    {
      "nombre": "Campo",
      "nivel": 3,
      "nota": "← useId: etiqueta, ayuda y error"
    },
    {
      "nombre": "PasoGrupo",
      "nivel": 2,
      "nota": "← solo en el paso 2"
    },
    {
      "nombre": "PasoConfirmar",
      "nivel": 2,
      "nota": "← solo en el paso 3"
    },
    {
      "nombre": "BotonesPaso",
      "nivel": 2,
      "nota": "← useFormStatus: «Buscando plazas…»"
    },
    {
      "nombre": "TuReserva",
      "nivel": 2,
      "nota": "← desde el paso 2, en una columna aparte"
    },
    {
      "nombre": "Disponibilidad",
      "nivel": 3,
      "nota": "← las noches optimistas, con sus retenidas"
    }
  ]
}
```

### Un servidor que no existe: por qué MSW

No hay ningún servidor de refugios al que preguntar, así que el proyecto trae uno de mentira. Había tres formas razonables de hacerlo:

- **Un servidor de Node dentro de Vite**, con un plugin que responde a `/api/...` en `npm run dev`. Es lo más parecido a un backend, pero los tests de Vitest no lo tienen: habría que simular la API otra vez para ellos, y mantener dos simulaciones que acaban diciendo cosas distintas.
- **Un servidor aparte**, como `json-server`. Otro proceso que arrancar, y las mismas dos simulaciones.
- **MSW** (Mock Service Worker), que ya usaste en los tests de la lección 84. **Los mismos manejadores responden en el navegador**, con un *service worker* que intercepta las peticiones de la página, **y en los tests**, interceptando el `fetch` de Node. La aplicación pide `/api/disponibilidad` como si hubiera un servidor, las peticiones salen en la pestaña Red de las DevTools con su retardo, y un test puede hacer que falle la siguiente.

Es la tercera. MSW 3 trae además un plugin para Vite, `msw()` en `vite.config.ts`, que sirve el archivo del *service worker* sin copiarlo a `public/`, como pedían las versiones anteriores. `main.tsx` lo pone en marcha antes de pintar nada:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { StrictMode, type ComponentType } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.tsx'\nimport './estilos.css'\n\nlet PanelServidor: ComponentType | null = null\n\nif (import.meta.env.DEV) {\n  const { network } = await import('virtual:msw')\n  const { manejadores } = await import('./servidor/manejadores')\n  network.configure({ handlers: manejadores, onUnhandledFrame: 'bypass' })\n  await network.enable()\n  PanelServidor = (await import('./servidor/PanelServidor')).default\n}\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n    {PanelServidor && <PanelServidor />}\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "if (import.meta.env.DEV) {",
      "nota": "Solo con npm run dev. En el build, el plugin no hace nada y este bloque desaparece: el JavaScript de producción no lleva ni MSW ni el panel (comprobado buscando en dist/)."
    },
    {
      "fragmento": "const { network } = await import('virtual:msw')",
      "nota": "Un módulo virtual que crea el plugin msw(): la red simulada ya configurada para el navegador. Se importa con import() para que no llegue al build."
    },
    {
      "fragmento": "network.configure({ handlers: manejadores, onUnhandledFrame: 'bypass' })",
      "nota": "Los manejadores son los de src/servidor/manejadores.ts, los mismos de los tests. Con bypass, cualquier otra petición (el código de la aplicación, el favicon) sigue su camino. En MSW 2, esta opción se llamaba onUnhandledRequest (lección 84)."
    },
    {
      "fragmento": "await network.enable()",
      "nota": "Registra el service worker y espera a que esté listo. Un await de nivel superior: hasta que no termina, no se pinta nada, así ninguna petición de la aplicación se escapa a la red de verdad."
    },
    {
      "fragmento": "PanelServidor = (await import('./servidor/PanelServidor')).default",
      "nota": "El panel «Servidor simulado», que tampoco va al build. No es parte de la aplicación: hace el papel del panel de red de las lecciones de esta web."
    }
  ]
}
```

El servidor simulado tiene dos rutas y un panel para controlarlo:

```laboratorio
{
  "tipo": "roles",
  "titulo": "El servidor simulado",
  "roles": [
    {
      "etiqueta": "GET /api/disponibilidad",
      "rol": "Las plazas libres de cada noche",
      "descripcion": "Con ?refugio=estos&llegada=2026-11-07&noches=2. Las plazas ocupadas son inventadas pero fijas para cada refugio y fecha: los fines de semana hay más gente."
    },
    {
      "etiqueta": "POST /api/reservas",
      "rol": "Guardar una reserva",
      "descripcion": "Valida con el esquema de Zod (422), comprueba las plazas (409) y guarda la reserva con su localizador (201). Lo escribes tú en el paso 2."
    },
    {
      "etiqueta": "Panel «Servidor simulado»",
      "rol": "Latencia y qué pasa con la próxima reserva",
      "descripcion": "Que se confirme, que el servidor falle con un 500 o que otro grupo se adelante y conteste 409. Después vuelve solo a «Se confirma si hay plazas»."
    }
  ]
}
```

Los datos viven en la memoria de la página: al recargar, el servidor vuelve a empezar, sin reservas. Y con `npm run build` y `npm run preview` no hay simulación: Vite contesta a `/api/disponibilidad` con el `index.html` de la aplicación (es su forma de servir una SPA, lección 85), `respuesta.json()` falla y la aplicación enseña su aviso: «No se ha podido consultar la disponibilidad. Inténtalo otra vez en un momento.» (comprobado). En un despliegue de verdad, esas dos rutas las serviría tu servidor.

## Paso 1: un esquema para toda la reserva (`src/reserva/esquema.ts`)

En la lección 61, cada formulario tenía su esquema. Aquí hay tres formularios que forman **una** reserva, y un servidor que tiene que aceptar exactamente lo mismo. Si cada paso escribiera sus reglas, el día que cambies el máximo de personas de 12 a 10 tendrías que acordarte de cambiarlo en tres sitios. Por eso hay un solo esquema, `camposReserva`, con **cada campo, sus reglas y sus mensajes una sola vez**, y de él se recortan los demás con `.pick()`.

En la rama `main`, cada campo solo dice su tipo, y los errores salen en el inglés de Zod. Este es el archivo terminado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { z } from 'zod'\nimport { DIAS_DE_ANTELACION, primeraLlegada, ultimaLlegada } from './fechas'\nimport { IDS_REFUGIOS } from './refugios'\n\nexport const camposReserva = z.object({\n  refugio: z.enum(IDS_REFUGIOS, 'Elige un refugio.'),\n  llegada: z.iso\n    .date({ error: 'Elige el día de llegada.', abort: true })\n    .refine(\n      (fecha) => fecha >= primeraLlegada() && fecha <= ultimaLlegada(),\n      `Se reserva desde mañana y hasta ${DIAS_DE_ANTELACION} días vista.`,\n    ),\n  noches: z.coerce\n    .number({ error: 'Elige cuántas noches.' })\n    .int()\n    .min(1, 'Como mínimo, una noche.')\n    .max(3, 'Como máximo, tres noches seguidas.'),\n  personas: z.coerce\n    .number({ error: 'Escribe cuántas personas sois.' })\n    .int('Tiene que ser un número entero.')\n    .min(1, 'Como mínimo, una persona.')\n    .max(12, 'Para más de 12 personas, llama al refugio.'),\n\n  nombre: z.string().trim().min(2, 'Escribe el nombre de quien hace la reserva.'),\n  correo: z.email('Ese correo no parece válido.'),\n  telefono: z\n    .string()\n    .trim()\n    .regex(/^[6789]\\d{8}$/, 'Nueve cifras, sin prefijo ni espacios.'),\n  federados: z.coerce\n    .number({ error: 'Escribe cuántos tenéis licencia (0 si nadie).' })\n    .int('Tiene que ser un número entero.')\n    .min(0, 'No puede ser negativo.'),\n  observaciones: z.string().trim().max(300, 'Como mucho, 300 caracteres.').default(''),\n\n  acepto: z.literal('on', 'Para reservar, tienes que aceptar las normas del refugio.'),\n})\n\nexport type CampoReserva = keyof typeof camposReserva.shape\n\nfunction federadosCaben(datos: { personas: number; federados: number }) {\n  return datos.federados <= datos.personas\n}\nconst errorFederados = {\n  message: 'No puede haber más federados que personas en el grupo.',\n  path: ['federados'],\n}\n\nexport const esquemaPasoRefugio = camposReserva.pick({\n  refugio: true,\n  llegada: true,\n  noches: true,\n  personas: true,\n})\n\nexport const esquemaPasoGrupo = camposReserva\n  .pick({\n    personas: true,\n    nombre: true,\n    correo: true,\n    telefono: true,\n    federados: true,\n    observaciones: true,\n  })\n  .refine(federadosCaben, errorFederados)\n\nexport const esquemaConfirmacion = camposReserva.pick({ acepto: true })\n\nexport const esquemaReserva = camposReserva.refine(federadosCaben, errorFederados)\n\nexport type DatosReserva = z.infer<typeof esquemaReserva>",
  "anotaciones": [
    {
      "fragmento": "refugio: z.enum(IDS_REFUGIOS, 'Elige un refugio.'),",
      "nota": "IDS_REFUGIOS viene de refugios.ts, el mismo catálogo que pinta las tarjetas. Si mañana se añade un refugio, el esquema lo acepta sin tocarlo."
    },
    {
      "fragmento": "abort: true",
      "nota": "Un campo de fecha vacío llega como texto vacío, que no es una fecha. Sin abort, Zod seguiría con la regla siguiente y también diría que la fecha está fuera de plazo: dos errores para un solo problema. Con abort, se para en el primero."
    },
    {
      "fragmento": "(fecha) => fecha >= primeraLlegada() && fecha <= ultimaLlegada(),",
      "nota": "Las fechas viajan como texto AAAA-MM-DD, y ese formato se puede comparar como texto. primeraLlegada() es mañana y se calcula al validar, no al cargar el módulo: si la pestaña lleva abierta desde ayer, la regla sigue siendo correcta."
    },
    {
      "fragmento": "personas: z.coerce",
      "nota": "Del FormData llega texto: coerce lo convierte en número antes de comprobarlo (lección 61). Y del JSON que recibe el servidor llega ya un número, que coerce deja como está: el mismo esquema sirve para los dos."
    },
    {
      "fragmento": "function federadosCaben(datos: { personas: number; federados: number }) {",
      "nota": "La única regla que cruza dos campos, y de dos pasos distintos: las personas se eligen en el primero y los federados en el segundo. Va aparte, como una función y sus opciones, porque se usa en dos esquemas."
    },
    {
      "fragmento": "export const esquemaPasoRefugio = camposReserva.pick({",
      "nota": "Cada paso, un recorte del mismo esquema. .pick() se queda con los campos que le digas, con sus reglas y sus mensajes."
    },
    {
      "fragmento": "    personas: true,\n    nombre: true,",
      "nota": "El paso 2 no tiene campo de personas, pero su esquema sí: la regla de los federados lo necesita. La acción le pasará lo escrito en los dos pasos (paso 3)."
    },
    {
      "fragmento": "export const esquemaReserva = camposReserva.refine(federadosCaben, errorFederados)",
      "nota": "La reserva entera. La usa la acción antes de enviar y el servidor al recibir: si los dos aceptan lo mismo, no puede pasar que el formulario deje enviar algo que el servidor rechace por una regla distinta."
    }
  ]
}
```

Ahora, una pregunta que tiene trampa. Parece más limpio poner la regla de los federados una sola vez, en el esquema base, y recortar después:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "export const camposReserva = z\n  .object({\n    personas: z.coerce.number().int().min(1).max(12),\n    federados: z.coerce.number().int().min(0),\n    // ...los demás campos\n  })\n  .refine(federadosCaben, errorFederados)\n\nexport const esquemaPasoRefugio = camposReserva.pick({\n  refugio: true,\n  llegada: true,\n  noches: true,\n  personas: true,\n})\n\n// ¿Qué pasa al arrancar la aplicación?",
  "opciones": [
    "Funciona: el paso 1 recorta sus campos y la regla se queda en el esquema base",
    "Funciona, pero el paso 1 también exige los federados, porque la regla los usa",
    "Zod lanza un error al cargar el módulo y no arranca nada",
    "TypeScript marca el .pick() en rojo antes de ejecutar nada"
  ],
  "correcta": 2,
  "explicacion": "Comprobado con Zod 4.6.7: .pick() y .omit() se niegan a recortar un esquema que ya lleva un .refine(), porque la regla podría depender de un campo que quitas. Lanza al cargar el módulo, así que la página se queda en blanco y fallan los cuatro archivos de tests. TypeScript no lo ve: los tipos lo permiten. Por eso la regla va aparte y se añade después de recortar."
}
```

Esta es la salida de `npm test` con el esquema así escrito:

```text
 FAIL  src/pruebas/App.test.tsx [ src/pruebas/App.test.tsx ]
 FAIL  src/pruebas/accesibilidad.test.tsx [ src/pruebas/accesibilidad.test.tsx ]
 FAIL  src/pruebas/esquema.test.ts [ src/pruebas/esquema.test.ts ]
 FAIL  src/pruebas/servidor.test.ts [ src/pruebas/servidor.test.ts ]
Error: .pick() cannot be used on object schemas containing refinements
 ❯ src/reserva/esquema.ts:62:49
 ❯ src/servidor/manejadores.ts:4:1
 Test Files  4 failed (4)
      Tests  no tests
```

Es decir: «`.pick()` no se puede usar en esquemas de objeto que contienen refinamientos». La pila señala la línea del `.pick()` en `esquema.ts`, a la que se llega desde `manejadores.ts`, el primer archivo que lo importa. Ningún test llega a ejecutarse: «no tests».

Hay otro detalle de las reglas entre campos que conviene saber antes de que te sorprenda en el paso 2:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Al servidor le llega una reserva con dos problemas:\n// 6 federados en un grupo de 4, y sin la casilla de las normas.\nesquemaReserva.safeParse({\n  ...reservaValida,\n  personas: 4,\n  federados: 6,\n  acepto: undefined,\n})\n\n// ¿Qué campos tienen error en z.flattenError(...).fieldErrors?",
  "opciones": [
    "federados y acepto",
    "Solo acepto",
    "Solo federados",
    "Ninguno: safeParse lanza en cuanto encuentra el primero"
  ],
  "correcta": 1,
  "explicacion": "Comprobado con Zod 4.6.7. Un .refine() sobre el objeto no se ejecuta si algún campo ha fallado con un error que no deja seguir, como un tipo equivocado o un valor que falta: acepto es undefined y no el literal on. Un error de formato, como un correo mal escrito, sí deja seguir, y entonces salen los dos. La documentación de Zod lo explica en refine y propone la opción when para decidir cuándo se ejecuta la regla."
}
```

En este proyecto no estorba: cuando se comprueban los federados, en el paso 2, la casilla todavía no existe en el esquema de ese paso. Pero es la razón de que el test del servidor que busca el error de los federados mande la casilla marcada.

**Cuando lo tengas, `npm test -- esquema` pone en verde los 9 tests de `esquema.test.ts`.** Prueban el esquema sin montar nada: un objeto de textos, como los que salen de un `FormData`, y los mensajes que devuelve `z.flattenError`. Uno de ellos, el de la fecha, depende del día de hoy; por eso todos los tests se ejecutan con la fecha fijada en el lunes 2 de noviembre de 2026 (paso 6). El marcador baja a 19.

## Paso 2: el servidor también valida (`src/servidor/manejadores.ts`)

La lección 61 terminaba con una regla: **valida en el cliente para ayudar y en el servidor para proteger.** Lo que llega al servidor puede no venir de tu formulario: alguien puede escribir la petición a mano, o enviar el formulario de una pestaña que lleva abierta desde ayer, con una fecha que ya no vale. Y la lección 61 apuntaba una ventaja de Zod: el esquema es un archivo normal, sin nada del navegador, y el servidor puede importarlo. Aquí lo hace.

La ruta `GET /api/disponibilidad` ya está hecha. Te toca `POST /api/reservas`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  http.post('/api/reservas', async ({ request }) => {\n    const proxima = gastarProximaReserva()\n    await delay(leerAjustes().latencia)\n    if (proxima === 'error-servidor') {\n      return HttpResponse.json({ error: 'Error del servidor (simulado)' }, { status: 500 })\n    }\n\n    const cuerpo = await request.json().catch(() => null)\n    const resultado = esquemaReserva.safeParse(cuerpo)\n    if (!resultado.success) {\n      return HttpResponse.json({ errores: z.flattenError(resultado.error).fieldErrors }, { status: 422 })\n    }\n    const datos = resultado.data\n\n    if (proxima === 'sin-plazas') otroGrupoSeAdelanta(datos)\n\n    const noches = nochesDe(datos.refugio, datos.llegada, datos.noches)\n    const corta = noches.find((noche) => noche.libres < datos.personas)\n    if (corta) {\n      const refugio = buscarRefugio(datos.refugio)!\n      const quedan =\n        corta.libres === 0\n          ? 'no queda ninguna plaza'\n          : corta.libres === 1\n            ? 'solo queda 1 plaza'\n            : `solo quedan ${corta.libres} plazas`\n      return HttpResponse.json(\n        {\n          error: `Mientras confirmabas, otra reserva se ha adelantado: en el ${refugio.nombre} ${quedan} la noche del ${formatearFecha(corta.fecha)}, y sois ${datos.personas}.`,\n          noches,\n        },\n        { status: 409 },\n      )\n    }\n\n    const reserva = guardarReserva(datos)\n    return HttpResponse.json(\n      { reserva, noches: nochesDe(datos.refugio, datos.llegada, datos.noches) },\n      { status: 201 },\n    )\n  }),",
  "anotaciones": [
    {
      "fragmento": "const proxima = gastarProximaReserva()",
      "nota": "Lo que le pasa a esta reserva según el panel: normal, error del servidor u otro grupo que se adelanta. Se lee al llegar la petición, antes de esperar: si se leyera después, una petición que llega tarde de un test anterior podría gastar el ajuste del siguiente (nos pasó)."
    },
    {
      "fragmento": "await delay(leerAjustes().latencia)",
      "nota": "El retardo del panel, con el delay de MSW 3, que se importa de msw/utils/delay (lección 84). En los tests es 0."
    },
    {
      "fragmento": "const resultado = esquemaReserva.safeParse(cuerpo)",
      "nota": "El mismo esquema que usa la acción antes de enviar: si un día cambia una regla, cambia en los dos lados a la vez. Si el cuerpo no era JSON, la línea de antes lo deja en null, y el esquema lo rechaza como cualquier otra cosa que no sea una reserva."
    },
    {
      "fragmento": "{ status: 422 }",
      "nota": "422, contenido que no se puede procesar: la petición está bien formada, pero sus datos no valen. Con los mensajes de cada campo, en el mismo formato que usa el formulario."
    },
    {
      "fragmento": "if (proxima === 'sin-plazas') otroGrupoSeAdelanta(datos)",
      "nota": "La carrera, a voluntad: justo antes de mirar las plazas, otro grupo reserva y deja menos de las que necesitas. Así el 409 que sale es de verdad, no un error inventado."
    },
    {
      "fragmento": "const corta = noches.find((noche) => noche.libres < datos.personas)",
      "nota": "Las plazas se comprueban al guardar, no antes. Lo que vio el formulario en el paso 1 puede haber cambiado mientras rellenabas tus datos."
    },
    {
      "fragmento": "{ status: 409 },",
      "nota": "409, conflicto: la reserva es válida, pero choca con el estado del servidor. Devuelve también las noches tal como están ahora: el formulario las necesita para enseñar la verdad."
    },
    {
      "fragmento": "const reserva = guardarReserva(datos)",
      "nota": "Ocupa las plazas, calcula el importe y pone el localizador: EST-1001, RES-1002... El localizador, como el número de un comentario en la lección 62, solo lo puede saber el servidor."
    }
  ]
}
```

Los tests de `servidor.test.ts` lo prueban sin React de por medio: con `fetch`, como lo usaría cualquiera. Este es el del conflicto:

```tsx
it('responde 409 si no quedan plazas, con las que quedan de verdad', async () => {
  fijarOcupadas('respomuso', '2026-11-15', 58)

  const respuesta = await reservar(reserva)

  expect(respuesta.status).toBe(409)
  const cuerpo = await respuesta.json()
  expect(cuerpo.error).toBe(
    'Mientras confirmabas, otra reserva se ha adelantado: en el Refugio de Respomuso solo quedan 2 plazas la noche del domingo 15 de noviembre, y sois 4.',
  )
  expect(cuerpo.noches[1]).toEqual({ fecha: '2026-11-15', plazas: 60, libres: 2 })
  expect(contarReservas()).toBe(0)
})
```

`fijarOcupadas` y `contarReservas` vienen de `baseDeDatos.ts`: el test prepara el servidor y mira lo que ha guardado, algo que con un servidor de verdad no podrías hacer tan fácil. Con el paso 2 hecho pasan los 7 tests del servidor, y el marcador baja a 14.

## Paso 3: una acción para los tres pasos (`src/reserva/accion.ts`)

Un formulario de varios pasos tiene que recordar lo escrito en los pasos anteriores, validar cada paso antes de dejarte seguir y volver atrás sin perder nada. Con lo que ya sabes, eso es **un `useActionState`** (lección 58) cuyo estado es la reserva entera, y **una acción** que recibe el estado anterior y el `FormData` del paso que se acaba de enviar:

```tsx
// tipos.ts
type EstadoReserva = {
  paso: 'refugio' | 'grupo' | 'confirmar' | 'hecha'
  valores: Valores       // lo escrito en todos los pasos, tal cual: texto
  datos: Partial<DatosReserva>  // lo ya validado, con sus tipos
  errores: Errores       // los del último envío, como los da z.flattenError
  aviso: string | null   // un problema que no es de ningún campo
  noches: Noche[]        // las plazas de verdad, según el servidor
  reserva: ReservaConfirmada | null
}

// Reserva.tsx
const [estado, accion, isPending] = useActionState(avanzar, ESTADO_INICIAL)
```

Los tres pasos son el mismo `<form action={accion}>` (en el paso 5, `accion` dejará su sitio a otra función), con otra `key` en cada paso, como en el ejemplo de abajo. Y los botones dicen qué se ha pulsado con su `name` y su `value`, que viajan en el `FormData` (lección 57): `intencion=seguir` o `intencion=atras`. La primera mitad de la acción ya viene hecha:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "function leerPaso(paso: PasoConFormulario, formData: FormData): Valores {\n  return Object.fromEntries(\n    CAMPOS_DEL_PASO[paso].map((campo) => {\n      const valor = formData.get(campo)\n      return [campo, typeof valor === 'string' ? valor : undefined]\n    }),\n  )\n}\n\nexport async function avanzar(estado: EstadoReserva, formData: FormData): Promise<EstadoReserva> {\n  if (estado.paso === 'hecha') return ESTADO_INICIAL\n\n  const siguiente: EstadoReserva = {\n    ...estado,\n    valores: { ...estado.valores, ...leerPaso(estado.paso, formData) },\n    errores: {},\n    aviso: null,\n  }\n\n  if (formData.get('intencion') === 'atras' && estado.paso !== 'refugio') {\n    return { ...siguiente, paso: PASO_ANTERIOR[estado.paso] }\n  }\n\n  switch (estado.paso) {\n    case 'refugio':\n      return comprobarPlazas(siguiente)\n    case 'grupo':\n      return revisarGrupo(siguiente)\n    case 'confirmar':\n      return confirmar(siguiente)\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "function leerPaso(paso: PasoConFormulario, formData: FormData): Valores {",
      "nota": "Lee del FormData los campos del paso, y solo esos. No usa Object.fromEntries(formData), y el motivo está en Errores típicos: tiene que ver con la casilla de las normas."
    },
    {
      "fragmento": "return [campo, typeof valor === 'string' ? valor : undefined]",
      "nota": "Una casilla sin marcar no viaja en el FormData (lección 57). Aquí queda como undefined y, al mezclarse con lo anterior, borra una marca vieja."
    },
    {
      "fragmento": "if (estado.paso === 'hecha') return ESTADO_INICIAL",
      "nota": "En la pantalla final solo hay un botón, «Hacer otra reserva»: vuelta al principio."
    },
    {
      "fragmento": "valores: { ...estado.valores, ...leerPaso(estado.paso, formData) },",
      "nota": "Lo escrito en este paso se guarda siempre, valga o no, y también al volver atrás. Es lo que hará que al volver a un paso encuentres sus campos como los dejaste: sus defaultValue salen de aquí (lección 61)."
    },
    {
      "fragmento": "if (formData.get('intencion') === 'atras' && estado.paso !== 'refugio') {",
      "nota": "«Atrás» no valida: guarda lo escrito y cambia de paso. Nadie quiere que le obliguen a arreglar un correo para poder volver a cambiar la fecha."
    },
    {
      "fragmento": "switch (estado.paso) {",
      "nota": "El estado anterior dice en qué paso estás, así que la acción sabe qué validar sin que el formulario lo diga. Cada caso es una función: las tres siguientes son tu trabajo."
    }
  ]
}
```

Las otras tres funciones son el `TODO (paso 3)`. La del paso 1 valida con su recorte del esquema y, si todo está bien, **pregunta al servidor** antes de dejarte seguir: una acción puede ser `async`, y mientras espera, `isPending` es `true` y el botón dice «Buscando plazas…».

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "async function comprobarPlazas(estado: EstadoReserva): Promise<EstadoReserva> {\n  const resultado = esquemaPasoRefugio.safeParse(estado.valores)\n  if (!resultado.success) {\n    return { ...estado, errores: z.flattenError(resultado.error).fieldErrors }\n  }\n  const datos = resultado.data\n\n  let noches: Noche[]\n  try {\n    noches = await pedirDisponibilidad(datos)\n  } catch {\n    return { ...estado, aviso: 'No se ha podido consultar la disponibilidad. Inténtalo otra vez en un momento.' }\n  }\n  const corta = noches.find((noche) => noche.libres < datos.personas)\n  if (corta) {\n    return { ...estado, errores: { personas: [mensajeSinPlazas(corta)] } }\n  }\n\n  return { ...estado, paso: 'grupo', datos: { ...estado.datos, ...datos }, noches }\n}",
  "anotaciones": [
    {
      "fragmento": "const resultado = esquemaPasoRefugio.safeParse(estado.valores)",
      "nota": "estado.valores lleva también lo de los otros pasos si has vuelto atrás, pero el recorte solo mira sus cuatro campos: .pick() deja fuera el resto."
    },
    {
      "fragmento": "return { ...estado, errores: z.flattenError(resultado.error).fieldErrors }",
      "nota": "Los errores, en el formato de la lección 61: un array de mensajes por campo. El paso no cambia y lo escrito ya está en valores."
    },
    {
      "fragmento": "noches = await pedirDisponibilidad(datos)",
      "nota": "GET /api/disponibilidad, en api.ts. Si falla la red o el servidor, lanza, y aquí se convierte en un aviso: un fallo esperado no se lanza fuera de la acción, o acabaría en el error boundary (lección 58)."
    },
    {
      "fragmento": "const corta = noches.find((noche) => noche.libres < datos.personas)",
      "nota": "Una regla que ningún esquema de Zod puede saber, porque depende del servidor. Va en la acción, y su error, en el campo que más probablemente vas a cambiar: «Personas»."
    },
    {
      "fragmento": "return { ...estado, paso: 'grupo', datos: { ...estado.datos, ...datos }, noches }",
      "nota": "Todo bien: al paso 2, con los datos ya convertidos (noches y personas como números) y las plazas que ha dicho el servidor, que serán el valor de verdad de useOptimistic en el paso 5."
    }
  ]
}
```

`revisarGrupo` es igual pero sin servidor: valida `estado.valores` con `esquemaPasoGrupo`. Fíjate en que `estado.valores` trae también las personas del paso 1: por eso la regla de los federados puede compararlas. Y `confirmar` valida la reserva entera con el mismo esquema que el servidor y la envía:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "async function confirmar(estado: EstadoReserva): Promise<EstadoReserva> {\n  const resultado = esquemaReserva.safeParse(estado.valores)\n  if (!resultado.success) {\n    return { ...estado, errores: z.flattenError(resultado.error).fieldErrors }\n  }\n\n  const respuesta = await enviarReserva(resultado.data)\n  switch (respuesta.tipo) {\n    case 'confirmada':\n      return { ...estado, paso: 'hecha', noches: respuesta.noches, reserva: respuesta.reserva }\n    case 'sin-plazas':\n      return {\n        ...estado,\n        noches: respuesta.noches,\n        aviso: `${respuesta.mensaje} Vuelve atrás para cambiar la fecha, el refugio o el número de personas.`,\n      }\n    case 'rechazada':\n      return {\n        ...estado,\n        aviso: `El servidor no ha aceptado la reserva: ${Object.values(respuesta.errores).flat().join(' ')}`,\n      }\n    case 'error':\n      return { ...estado, aviso: 'No se ha podido confirmar la reserva y no se ha guardado nada. Inténtalo otra vez.' }\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "const resultado = esquemaReserva.safeParse(estado.valores)",
      "nota": "La reserva entera, aunque los pasos 1 y 2 ya pasaron sus recortes: es la casilla de las normas lo que se comprueba aquí, y cuesta lo mismo comprobarlo todo que solo eso."
    },
    {
      "fragmento": "const respuesta = await enviarReserva(resultado.data)",
      "nota": "POST /api/reservas, en api.ts. enviarReserva no lanza nunca: convierte cada respuesta (201, 409, 422 o cualquier fallo) en un objeto con su tipo, y la acción decide qué enseñar."
    },
    {
      "fragmento": "return { ...estado, paso: 'hecha', noches: respuesta.noches, reserva: respuesta.reserva }",
      "nota": "Confirmada: la pantalla final, con el localizador y las plazas como han quedado después de tu reserva."
    },
    {
      "fragmento": "noches: respuesta.noches,",
      "nota": "Sin plazas: las noches de la respuesta, las de verdad, sustituyen a las que se vieron en el paso 1. Si te quedaras con las viejas, la columna seguiría diciendo que hay sitio."
    },
    {
      "fragmento": "aviso: 'No se ha podido confirmar la reserva y no se ha guardado nada. Inténtalo otra vez.' }",
      "nota": "El servidor ha fallado: lo escrito se queda (también la casilla marcada) para reintentar con un clic."
    }
  ]
}
```

Con el paso 3, `npm run dev` ya es la aplicación: avanza, vuelve, valida y reserva. El marcador baja a 10, y los que quedan en rojo no son de la acción: buscan el foco y las descripciones de los campos, que llegan en el paso 4.

Así se ve el mecanismo sin Zod ni servidor, en pequeño: dos pasos, una acción. Escribe 3 en «Personas», pulsa «Seguir», escribe un nombre y pulsa «Atrás». Las personas siguen en 3; pulsa «Seguir» y el nombre también sigue ahí. Y fíjate en el título de cada paso: tiene el foco.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Dos pasos, una sola acción",
  "codigo": "import { useActionState, useEffect, useRef } from 'react'\n\nconst INICIAL = { paso: 'grupo', valores: { personas: '2' }, error: null }\n\nconst TITULOS = {\n  grupo: 'Paso 1 de 2: el grupo',\n  contacto: 'Paso 2 de 2: contacto',\n  hecho: 'Solicitud enviada',\n}\n\n// Una sola acción para los dos pasos: mira en qué paso está y qué botón se pulsó\nfunction avanzar(estado, formData) {\n  const valores = { ...estado.valores }\n  for (const [campo, valor] of formData) {\n    if (campo !== 'intencion') valores[campo] = valor\n  }\n\n  if (formData.get('intencion') === 'atras') {\n    return { paso: 'grupo', valores, error: null }\n  }\n  if (estado.paso === 'grupo') {\n    const personas = Number(valores.personas)\n    if (!Number.isInteger(personas) || personas < 1 || personas > 12) {\n      return { ...estado, valores, error: 'Entre 1 y 12 personas.' }\n    }\n    return { paso: 'contacto', valores, error: null }\n  }\n  if (valores.nombre.trim().length < 2) {\n    return { ...estado, valores, error: 'Escribe tu nombre.' }\n  }\n  return { paso: 'hecho', valores, error: null }\n}\n\nexport default function App() {\n  const [estado, accion] = useActionState(avanzar, INICIAL)\n  const titulo = useRef(null)\n  const pasoAnterior = useRef(estado.paso)\n\n  // Paso nuevo: el foco, a su título\n  useEffect(() => {\n    if (estado.paso !== pasoAnterior.current) titulo.current.focus()\n    pasoAnterior.current = estado.paso\n  }, [estado])\n\n  const { paso, valores, error } = estado\n\n  return (\n    <main>\n      <h1>Refugio de Respomuso</h1>\n      <h2 ref={titulo} tabIndex={-1}>\n        {TITULOS[paso]}\n      </h2>\n      {paso === 'hecho' ? (\n        <p>\n          {valores.personas} personas, a nombre de {valores.nombre.trim()}.\n        </p>\n      ) : (\n        <form key={paso} action={accion} noValidate>\n          {paso === 'grupo' ? (\n            <label>\n              Personas\n              <input name=\"personas\" type=\"number\" defaultValue={valores.personas} />\n            </label>\n          ) : (\n            <label>\n              Nombre\n              <input name=\"nombre\" defaultValue={valores.nombre} />\n            </label>\n          )}\n          {error && <p className=\"error\">{error}</p>}\n          <div className=\"botones\">\n            <button type=\"submit\" name=\"intencion\" value=\"seguir\">\n              Seguir\n            </button>\n            {paso === 'contacto' && (\n              <button type=\"submit\" name=\"intencion\" value=\"atras\">\n                Atrás\n              </button>\n            )}\n          </div>\n        </form>\n      )}\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.3rem;\n  color: #1f4e5f;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-weight: 600;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 2px solid #1f4e5f;\n  border-radius: 999px;\n  color: #fff;\n  background: #1f4e5f;\n}\n\nbutton + button {\n  color: #1f4e5f;\n  background: #fff;\n}\n\n[aria-disabled='true'] {\n  opacity: 0.7;\n}\n\n.error,\n[role='alert'] {\n  margin: 0;\n  color: #a4262c;\n}\n\n.noche {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #ece6dc;\n  border-radius: 8px;\n}\n\n.noche.retenida {\n  border-color: #e8c48f;\n  background: #fdf3e3;\n  color: #8a4b00;\n  font-weight: 600;\n}\n\n.nota {\n  color: #4f5d63;\n  font-style: italic;\n}",
  "anotaciones": [
    {
      "fragmento": "function avanzar(estado, formData) {",
      "nota": "La acción de useActionState: recibe el estado anterior y el FormData del paso que se ha enviado, y devuelve el estado siguiente. En el proyecto valida con Zod y pregunta al servidor; aquí, a mano."
    },
    {
      "fragmento": "if (campo !== 'intencion') valores[campo] = valor",
      "nota": "Lo escrito se guarda siempre, también al pulsar «Atrás». El botón pulsado viaja en el FormData con su name y su value, y no es un campo de la reserva."
    },
    {
      "fragmento": "return { ...estado, valores, error: 'Entre 1 y 12 personas.' }",
      "nota": "Con un error, el paso no cambia: el mismo formulario, con valores ya actualizados. El reinicio que hace React al terminar la acción devuelve cada campo a su defaultValue, que es lo que escribiste (lección 61)."
    },
    {
      "fragmento": "if (estado.paso !== pasoAnterior.current) titulo.current.focus()",
      "nota": "Al cambiar de paso, el formulario anterior desaparece con el botón que tenía el foco. El foco va al título del paso nuevo, que dice dónde estás. Al cargar la página no se mueve: pasoAnterior empieza con el paso actual."
    },
    {
      "fragmento": "<form key={paso} action={accion} noValidate>",
      "nota": "Una key por paso: cada paso es un formulario nuevo, con sus campos nuevos y sus valores iniciales (lección 26)."
    },
    {
      "fragmento": "defaultValue={valores.nombre}",
      "nota": "Al volver a este paso, el campo nace con lo que escribiste la otra vez. Sin controlar el campo: ni value ni onChange."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Paso 4: que cada paso se entienda sin verlo (`Campo.tsx`, `PasoRefugio.tsx`, `BotonesPaso.tsx` y `Reserva.tsx`)

Hasta aquí, la reserva funciona para quien la ve. Este paso es para quien usa un lector de pantalla o solo el teclado, y casi todo es lo de las lecciones 37 y 61 aplicado en serio. Parte ya viene hecho en la rama `main`, y conviene que lo mires:

- **Cada paso tiene su título** (`<h2>`), que dice «Paso 2 de 3: Quién viene». En el código, «Paso 2 de 3» va en un `<span>` aparte para darle otro estilo, y entre los dos hay unos dos puntos que solo están para el lector (con la clase `solo-lectores`) y un espacio, para que el nombre del título no sea «Paso 2 de 3Quién viene».
- **La pestaña dice en qué paso estás**: `<title>` dentro de `Reserva` (lección 81), «Paso 2 de 3: Quién viene · Reserva de refugios».
- **La lista de pasos** es una `<ol>` con `aria-current="step"` en el actual, y «(hecho)», solo para el lector, en los anteriores. No son enlaces: no se puede saltar un paso sin validarlo.
- **Dos regiones vivas**, pintadas desde el principio y vacías (lección 37): una con `role="alert"` para los errores y los avisos («Hay 3 campos por corregir.»), y otra con `role="status"` para lo que pasa mientras se envía («Buscando plazas libres…»).

### Las imágenes: decorativas, con `alt=""`

Antes, algo que tampoco tienes que escribir. Cada tarjeta lleva arriba una imagen de su refugio, y la columna «Tu reserva», la del elegido. Ya vienen hechas, en `FotoRefugio.tsx`, y su `alt` está vacío a propósito. La pregunta que decide el `alt` de una imagen es qué se pierde quien no la ve, y aquí la respuesta es nada: la imagen está siempre junto al nombre del refugio, que ya se lee. Un `alt="Refugio de Respomuso"` haría que el lector lo dijera dos veces seguidas. Y describirla sería peor: está generada con IA, así que un «Vista del refugio de Respomuso junto al ibón» presentaría como real algo que no lo es. `alt=""` le dice al lector que la salte; sin el atributo, en cambio, algunos lectores leen el nombre del archivo.

```tsx
<img src={IMAGENES[refugio.id]} alt="" width={512} height={512} decoding="async" />
```

`width` y `height` son el tamaño real del archivo, y con ellos el navegador reserva el hueco antes de que llegue la imagen: la página no da saltos mientras cargan. El tamaño con el que se ve lo pone el CSS (`width: 100%` y un `aspect-ratio`, recortando con `object-fit: cover`). Y como se importan desde `src/assets/` (`import pineta from '../assets/refugios/pineta.jpg'`), en el build cada una sale con un hash en el nombre, como el JavaScript (lección 85). Lo pasamos por axe con las imágenes puestas: ninguna violación.

Ahora sí, lo que falta son cuatro cosas.

### El campo, unido a su ayuda y a su error

`Campo` ya une la etiqueta con el control mediante `useId`, y pinta la ayuda y el error. Pero para un lector de pantalla son párrafos sueltos. Es el `Campo` del final de la lección 61, con una ayuda además del error:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useId, type ReactNode } from 'react'\n\nexport type PropsControl = {\n  id: string\n  'aria-invalid'?: true\n  'aria-describedby'?: string\n}\n\ntype PropsCampo = {\n  etiqueta: string\n  ayuda?: string\n  error?: string[]\n  enLinea?: boolean\n  children: (props: PropsControl) => ReactNode\n}\n\nexport default function Campo({ etiqueta, ayuda, error, enLinea = false, children }: PropsCampo) {\n  const id = useId()\n  const idAyuda = `${id}-ayuda`\n  const idError = `${id}-error`\n\n  const describe = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ')\n  const control = children({\n    id,\n    'aria-invalid': error ? true : undefined,\n    'aria-describedby': describe || undefined,\n  })\n\n  return (\n    <div className={['campo', enLinea && 'en-linea', error && 'con-error'].filter(Boolean).join(' ')}>\n      {enLinea && control}\n      <label htmlFor={id}>{etiqueta}</label>\n      {ayuda && (\n        <p id={idAyuda} className=\"ayuda\">\n          {ayuda}\n        </p>\n      )}\n      {error && (\n        <p id={idError} className=\"error\">\n          {error[0]}\n        </p>\n      )}\n      {!enLinea && control}\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const id = useId()",
      "nota": "Un id por cada campo que se pinte, aunque haya dos formularios en la página (lección 37). Los de la ayuda y el error salen de él."
    },
    {
      "fragmento": "const describe = [ayuda ? idAyuda : null, error ? idError : null].filter(Boolean).join(' ')",
      "nota": "aria-describedby admite varios ids separados por espacios, y el lector los lee en ese orden después del nombre: primero la ayuda, después el error."
    },
    {
      "fragmento": "'aria-invalid': error ? true : undefined,",
      "nota": "Solo cuando hay error: un aria-invalid=\"false\" no aporta nada (lección 61). Y es lo que buscará el efecto del foco para encontrar el primer campo que corregir."
    },
    {
      "fragmento": "'aria-describedby': describe || undefined,",
      "nota": "Sin ayuda ni error, nada: un aria-describedby vacío no sirve de nada."
    },
    {
      "fragmento": "const control = children({",
      "nota": "Campo no sabe si su control es un input, un select o un textarea: le pasa las props y el control decide dónde ponerlas (lección 30)."
    },
    {
      "fragmento": "{!enLinea && control}",
      "nota": "La etiqueta, la ayuda y el error van antes del control. Así el error se ve encima del campo, como en el sistema de diseño de GOV.UK, y un lector que recorre la página lo encuentra antes de llegar al campo."
    }
  ]
}
```

Con eso, al llegar a «Llegada» con un error, un lector dice su nombre, que no es válido y, después, la ayuda y el error: algo como «Llegada, entrada no válida, Desde mañana y hasta 90 días vista. Elige el día de llegada.». Es lo que comprueba este test, con `toHaveAccessibleDescription` de jest-dom (lección 37):

```tsx
expect(screen.getByLabelText('Llegada')).toHaveAccessibleDescription(
  'Desde mañana y hasta 90 días vista. Elige el día de llegada.',
)
```

### El grupo de refugios

Los refugios son opciones de radio dentro de un `<fieldset>` con su `<legend>`, «Refugio»: el lector anuncia el grupo al entrar en él. Su error no es de ninguna opción, sino del grupo, así que el `aria-describedby` va en el `fieldset`, y cada opción lleva `aria-invalid` para que el efecto del foco la encuentre. Cada tarjeta, además, se nombra solo con el refugio (`aria-labelledby`) y lleva la zona y la altitud como descripción: sin eso, el nombre accesible de la opción sería todo el texto de la tarjeta, pegado, «Refugio de RespomusoValle de Tena · 2220 m». Nos pasó, y lo delató un test.

```tsx
<fieldset className="refugios" aria-describedby={errores.refugio ? idErrorRefugio : undefined}>
  <legend>Refugio</legend>
  {errores.refugio && <p id={idErrorRefugio} className="error">{errores.refugio[0]}</p>}
  {/* ... */}
  <input type="radio" name="refugio" value={refugio.id} aria-invalid={errores.refugio ? true : undefined} /* ... */ />
```

### El foco, siempre en un sitio con sentido

Cuando la acción termina, la pantalla puede haber cambiado entera. El formulario del paso anterior, con el botón que tenía el foco, ya no existe, y el navegador deja el foco en el `<body>` (lección 37). Hay que decidir adónde va, y depende de qué ha pasado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  const pasoAnterior = useRef(estado.paso)\n\n  useEffect(() => {\n    const primerCampoConError = formulario.current?.querySelector<HTMLElement>('[aria-invalid=\"true\"]')\n    if (primerCampoConError) {\n      primerCampoConError.focus()\n    } else if (estado.paso !== pasoAnterior.current) {\n      titulo.current?.focus()\n    } else if (estado.aviso) {\n      avisos.current?.focus()\n    }\n    pasoAnterior.current = estado.paso\n  }, [estado])",
  "anotaciones": [
    {
      "fragmento": "const pasoAnterior = useRef(estado.paso)",
      "nota": "El paso que se veía la última vez. Una ref, no un estado: no se pinta, solo se recuerda (lección 33). Empieza con el paso actual, y por eso al cargar la página el foco no se mueve."
    },
    {
      "fragmento": "useEffect(() => {",
      "nota": "Un efecto, sin flushSync: se ejecuta cuando el estado nuevo ya está en pantalla, con los errores y sus aria-describedby puestos, así que el lector lee el campo con su error (lección 61)."
    },
    {
      "fragmento": "formulario.current?.querySelector<HTMLElement>('[aria-invalid=\"true\"]')",
      "nota": "Primero, los errores: el primer campo marcado, en el orden de la página. Aquí entra la opción de radio del grupo de refugios."
    },
    {
      "fragmento": "titulo.current?.focus()",
      "nota": "Si no hay errores y el paso ha cambiado, al título del paso nuevo. Tiene tabIndex={-1}: se puede enfocar desde el código sin colarse en el recorrido del Tab (lección 37)."
    },
    {
      "fragmento": "avisos.current?.focus()",
      "nota": "Ni errores ni paso nuevo, pero un aviso: el servidor ha fallado o se ha adelantado otro grupo. El foco va a la caja del aviso, como hacen los resúmenes de errores de muchos sistemas de diseño."
    },
    {
      "fragmento": "}, [estado])",
      "nota": "Cada envío produce un estado nuevo, también si el error es el mismo de antes: el efecto se repite y el foco vuelve al campo."
    }
  ]
}
```

### Botones que no pierden el foco

Mientras se envía, los botones no deberían enviar otra vez. La forma obvia es `disabled={pending}`, y es la que trae la rama `main`. Antes de cambiarla, predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "function BotonesPaso() {\n  const { pending } = useFormStatus()\n  return <button type=\"submit\" disabled={pending}>Confirmar reserva</button>\n}\n\n// Llegas al botón con Tab y pulsas Intro.\n// El servidor tarda dos segundos.\n// ¿Dónde está el foco mientras tanto, y cuando termina?",
  "opciones": [
    "En el botón todo el rato: disabled solo impide pulsarlo",
    "En el <body> mientras se envía, y vuelve al botón cuando termina",
    "En el <body> mientras se envía, y se queda ahí cuando termina",
    "En el siguiente elemento de la página, como si hubieras pulsado Tab"
  ],
  "correcta": 2,
  "explicacion": "Comprobado en Chromium y en WebKit, el motor de Safari: un elemento con el foco que pasa a disabled lo pierde, el navegador lo deja en el body y nadie lo devuelve cuando el botón se reactiva. Para un lector de pantalla, el botón desaparece a mitad de la reserva. Lo mismo pasa con un fieldset desactivado, como el del proyecto 62."
}
```

Compruébalo aquí. Los dos formularios tardan dos segundos en confirmar, y la línea de arriba dice dónde está el foco. Usa el teclado: en Safari, un clic no le da el foco a un botón.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "disabled frente a aria-disabled",
  "consigna": "Haz clic en un hueco de la vista previa, pulsa Tab hasta el «Confirmar» del primer formulario y pulsa Intro: mira la línea de arriba mientras confirma y cuando termina. Repite con el segundo y, mientras dice «Confirmando…», pulsa Intro otra vez: no se confirma dos veces.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState, useEffect, useState } from 'react'\nimport './estilos.css'\n\nasync function confirmar(veces) {\n  await new Promise((resolver) => setTimeout(resolver, 2000))\n  return veces + 1\n}\n\nfunction Formulario({ titulo, conDisabled }) {\n  const [veces, accion, isPending] = useActionState(confirmar, 0)\n\n  return (\n    <form action={accion}>\n      <h2>{titulo}</h2>\n      <div className=\"botones\">\n        {conDisabled ? (\n          <button type=\"submit\" disabled={isPending}>\n            {isPending ? 'Confirmando…' : 'Confirmar'}\n          </button>\n        ) : (\n          <button\n            type=\"submit\"\n            aria-disabled={isPending || undefined}\n            onClick={(evento) => isPending && evento.preventDefault()}\n          >\n            {isPending ? 'Confirmando…' : 'Confirmar'}\n          </button>\n        )}\n      </div>\n      <p className=\"nota\">Reservas confirmadas: {veces}</p>\n    </form>\n  )\n}\n\n// Mira cada décima de segundo qué elemento tiene el foco\nfunction useDondeEstaElFoco() {\n  const [donde, setDonde] = useState('')\n  useEffect(() => {\n    const intervalo = setInterval(() => {\n      const elemento = document.activeElement\n      setDonde(\n        !elemento || elemento === document.body\n          ? 'en ninguna parte (en el body)'\n          : `en «${elemento.textContent}» de «${elemento.closest('form')?.querySelector('h2')?.textContent}»`,\n      )\n    }, 100)\n    return () => clearInterval(intervalo)\n  }, [])\n  return donde\n}\n\nexport default function App() {\n  const donde = useDondeEstaElFoco()\n\n  return (\n    <main>\n      <h1>Confirmar sin perder el foco</h1>\n      <p className=\"nota\">El foco está {donde}.</p>\n      <Formulario titulo=\"Con disabled\" conDisabled />\n      <Formulario titulo=\"Con aria-disabled\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.3rem;\n  color: #1f4e5f;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-weight: 600;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 2px solid #1f4e5f;\n  border-radius: 999px;\n  color: #fff;\n  background: #1f4e5f;\n}\n\nbutton + button {\n  color: #1f4e5f;\n  background: #fff;\n}\n\n[aria-disabled='true'] {\n  opacity: 0.7;\n}\n\n.error,\n[role='alert'] {\n  margin: 0;\n  color: #a4262c;\n}\n\n.noche {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #ece6dc;\n  border-radius: 8px;\n}\n\n.noche.retenida {\n  border-color: #e8c48f;\n  background: #fdf3e3;\n  color: #8a4b00;\n  font-weight: 600;\n}\n\n.nota {\n  color: #4f5d63;\n  font-style: italic;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

La salida es **`aria-disabled`**: el botón dice a un lector que no está disponible, pero sigue siendo enfocable. Como `aria-disabled` no impide nada por sí solo, el `onClick` frena el envío con `preventDefault()`. Y no hace falta nada más para Intro: cuando pulsas Intro en un campo, el navegador «pulsa» el botón de enviar del formulario, con su evento `click` (es el envío implícito de HTML), y ese `preventDefault()` también lo frena (comprobado: cuatro Intro seguidos durante la espera, una sola petición).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  function siEstaOcupado(evento: MouseEvent<HTMLButtonElement>) {\n    if (pending) evento.preventDefault()\n  }\n\n  return (\n    <div className=\"botones\">\n      <button\n        type=\"submit\"\n        name=\"intencion\"\n        value=\"seguir\"\n        className=\"boton-principal\"\n        aria-disabled={pending || undefined}\n        onClick={siEstaOcupado}\n      >\n        {pending && !volviendo ? textoEnviando : texto}\n      </button>",
  "anotaciones": [
    {
      "fragmento": "if (pending) evento.preventDefault()",
      "nota": "Un clic, o un Intro, mientras se envía: no hace nada. Sin desactivar el botón, así que el foco no se mueve."
    },
    {
      "fragmento": "value=\"seguir\"",
      "nota": "«Seguir» va el primero en el DOM a propósito. Por qué, en Errores típicos."
    },
    {
      "fragmento": "aria-disabled={pending || undefined}",
      "nota": "true mientras se envía; sin el atributo, el resto del tiempo. El CSS lo atenúa con [aria-disabled='true']."
    },
    {
      "fragmento": "{pending && !volviendo ? textoEnviando : texto}",
      "nota": "useFormStatus da también data, el FormData que se está enviando (lección 59): si es «Atrás» lo que se envía, «Seguir» no dice «Buscando plazas…»."
    }
  ]
}
```

Con el paso 4, quedan 2 tests en rojo: los de las plazas retenidas. Para ver el resultado como lo vería alguien sin ver la pantalla, recorre la reserva solo con el teclado y con el lector de tu sistema (VoiceOver en macOS con `Cmd + F5`, Narrador en Windows con `Ctrl + Win + Intro`). Y para lo que ningún lector te dice, axe: lo pasamos con axe-core 4.14.0 en Chromium y en WebKit, en seis momentos de la reserva (el paso 1 recién cargado y con errores, el paso 2 con errores, el paso 3 reteniendo plazas y con el error del servidor, y la reserva confirmada), con todas las reglas de WCAG 2.2 AA y de buenas prácticas, **contraste incluido**. Ninguna violación.

## Paso 5: la disponibilidad, optimista (`src/reserva/Reserva.tsx`)

En la lección 60, entre los casos en los que **no** conviene la interfaz optimista, estaban las «reservas con plazas contadas» y lo que decide el servidor, como un número de pedido. Esto es una reserva con plazas contadas, y el localizador lo decide el servidor. ¿Entonces?

La respuesta está en **qué** se adelanta. **La reserva no**: el localizador y la pantalla de «Reserva confirmada» solo salen cuando el servidor contesta; hasta entonces, el botón dice «Confirmando…». **Lo que se adelanta es la cuenta de plazas**: en la columna de la derecha, las de tu grupo se restan en el acto, marcadas como retenidas. Si todo va bien, es exactamente lo que se verá después; si no, vuelven solas y un aviso explica por qué. Nadie puede salir de la página creyendo que tiene una plaza que no tiene.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "function retenerPlazas(noches: Noche[], personas: number): Noche[] {\n  return noches.map((noche) => ({ ...noche, libres: noche.libres - personas, retenidas: personas }))\n}\n\nexport default function Reserva() {\n  const [estado, accion, isPending] = useActionState(avanzar, ESTADO_INICIAL)\n\n  const [noches, retenerOptimista] = useOptimistic(estado.noches, retenerPlazas)\n\n  // ...\n\n  function enviar(formData: FormData) {\n    const confirmando = estado.paso === 'confirmar' && formData.get('intencion') !== 'atras'\n    const conCasilla = esquemaConfirmacion.safeParse({ acepto: formData.get('acepto') ?? undefined }).success\n    if (confirmando && conCasilla) {\n      retenerOptimista(Number(estado.valores.personas))\n    }\n    accion(formData)\n  }",
  "anotaciones": [
    {
      "fragmento": "function retenerPlazas(noches: Noche[], personas: number): Noche[] {",
      "nota": "La función de useOptimistic (lección 60): recibe las noches actuales y lo que le pases al setter, y devuelve las noches provisionales. Pura, como un reductor: no cambia el array que recibe."
    },
    {
      "fragmento": "libres: noche.libres - personas, retenidas: personas",
      "nota": "Las plazas libres, ya restadas, y una marca con las retenidas: así Disponibilidad las pinta de otro color y dice «4 retenidas para ti». Lo provisional siempre se distingue de lo confirmado (lección 60)."
    },
    {
      "fragmento": "useOptimistic(estado.noches, retenerPlazas)",
      "nota": "El valor de verdad son las noches del estado de useActionState, las que dijo el servidor. Mientras no hay ninguna acción en marcha, noches es exactamente estado.noches."
    },
    {
      "fragmento": "function enviar(formData: FormData) {",
      "nota": "La acción del formulario ya no es accion: es esta función, que primero pone lo optimista y después llama a la acción de verdad, que entra en la cola de useActionState. Es el orden de la lección 62."
    },
    {
      "fragmento": "const conCasilla = esquemaConfirmacion.safeParse({ acepto: formData.get('acepto') ?? undefined }).success",
      "nota": "Con la casilla sin marcar, la acción devolverá el error sin llamar al servidor: no hay nada que retener. Y es el recorte del esquema de la casilla: la misma regla, una vez más, sin escribirla otra vez."
    },
    {
      "fragmento": "retenerOptimista(Number(estado.valores.personas))",
      "nota": "Las personas del paso 1. Como enviar se llama dentro de la transición de la acción del formulario, el valor optimista se sostiene hasta que termina la acción de la cola."
    }
  ]
}
```

No hace falta escribir nada para deshacer. Esto es lo que pasa en cada uno de los tres finales posibles:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Confirmar una reserva de 4 personas, con 13 plazas libres",
  "items": [
    {
      "fecha": "Clic",
      "titulo": "Las plazas se retienen en el acto",
      "texto": "enviar llama a retenerOptimista(4): la noche pasa a «9 de 56 libres · 4 retenidas para ti». El botón dice «Confirmando…» y la región de estado, «Plazas retenidas. Confirmando tu reserva…»."
    },
    {
      "fecha": "201",
      "titulo": "Confirmada",
      "texto": "La acción devuelve la pantalla final y las noches que ha dicho el servidor: 9 libres. Lo optimista se descarta en el mismo render en que llega lo real, así que no se nota ningún salto. El foco va al título «Reserva confirmada»."
    },
    {
      "fecha": "500",
      "titulo": "El servidor falla",
      "texto": "La acción devuelve el mismo estado con un aviso. Nadie ha tocado estado.noches: al terminar la acción, lo optimista se va y vuelven las 13. El foco va al aviso, y la casilla sigue marcada para reintentar."
    },
    {
      "fecha": "409",
      "titulo": "Otro grupo se adelanta",
      "texto": "La acción devuelve las noches de la respuesta, que ahora dicen 2 libres. Lo optimista se va y queda la verdad: ni las 13 de antes ni las 9 provisionales, sino 2, con un aviso que dice cuántas quedan y que sois 4."
    }
  ]
}
```

Abre el panel «Servidor simulado», pon «Cada respuesta tarda» en 2 segundos y elige «Falla el servidor (500)». Confirma, y verás las plazas retenidas durante dos segundos y volver después. Luego prueba con «Otro grupo se adelanta (409)». Con el paso 5, `npm test` ya no tiene nada en rojo.

Antes de seguir, practícalo aquí, en pequeño y sin Zod, con la API simulada de esta web: la noche del sábado en Estós, con 13 plazas libres.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Retener las plazas mientras se confirma",
  "consigna": "Pulsa «Confirmar reserva»: las plazas solo cambian cuando contesta el servidor. Haz que se retengan en el acto: escribe retener, usa useOptimistic con estado.noche y pon en el form una función que retenga las plazas y después llame a accion. Prueba también «Fallar la siguiente petición» en el panel de red.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport './estilos.css'\n\n// La noche del sábado en el Refugio de Estós, como la daría el servidor\nconst NOCHE = { id: 1, fecha: 'sábado 7 de noviembre', plazas: 56, libres: 13 }\n\nasync function confirmar(estado, formData) {\n  const personas = Number(formData.get('personas'))\n  const respuesta = await fetch(`/api/noches/${estado.noche.id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ libres: estado.noche.libres - personas }),\n  })\n  if (!respuesta.ok) {\n    return { ...estado, mensaje: null, aviso: 'No se ha podido confirmar la reserva y no se ha guardado nada.' }\n  }\n  return { noche: await respuesta.json(), mensaje: 'Reserva confirmada.', aviso: null }\n}\n\n// TODO: retener(noche, personas), una función pura que devuelva la noche\n// con las plazas ya restadas de libres y retenidas: personas.\n\nexport default function App() {\n  const [estado, accion, isPending] = useActionState(confirmar, {\n    noche: NOCHE,\n    mensaje: null,\n    aviso: null,\n  })\n  // TODO: que la noche que se pinta sea la optimista, con useOptimistic, y\n  // que el formulario llame a una función que primero retenga las plazas y\n  // después llame a accion(formData).\n  const noche = estado.noche\n\n  const plazas = `${noche.libres} de ${noche.plazas} libres`\n\n  return (\n    <main>\n      <h1>Refugio de Estós</h1>\n      <p className={noche.retenidas ? 'noche retenida' : 'noche'}>\n        {noche.fecha}: {noche.retenidas ? `${plazas} · ${noche.retenidas} retenidas para ti` : plazas}\n      </p>\n      <form action={accion}>\n        <label>\n          Personas\n          <input name=\"personas\" type=\"number\" min=\"1\" max=\"12\" defaultValue=\"4\" />\n        </label>\n        <div className=\"botones\">\n          <button\n            type=\"submit\"\n            aria-disabled={isPending || undefined}\n            onClick={(evento) => isPending && evento.preventDefault()}\n          >\n            Confirmar reserva\n          </button>\n        </div>\n      </form>\n      <p role=\"status\">{isPending ? 'Confirmando…' : estado.mensaje}</p>\n      <p role=\"alert\">{isPending ? null : estado.aviso}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.3rem;\n  color: #1f4e5f;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-weight: 600;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 2px solid #1f4e5f;\n  border-radius: 999px;\n  color: #fff;\n  background: #1f4e5f;\n}\n\nbutton + button {\n  color: #1f4e5f;\n  background: #fff;\n}\n\n[aria-disabled='true'] {\n  opacity: 0.7;\n}\n\n.error,\n[role='alert'] {\n  margin: 0;\n  color: #a4262c;\n}\n\n.noche {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #ece6dc;\n  border-radius: 8px;\n}\n\n.noche.retenida {\n  border-color: #e8c48f;\n  background: #fdf3e3;\n  color: #8a4b00;\n  font-weight: 600;\n}\n\n.nota {\n  color: #4f5d63;\n  font-style: italic;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "noches": [
      {
        "id": 1,
        "fecha": "sábado 7 de noviembre",
        "plazas": 56,
        "libres": 13
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Confirmar reserva», la noche dice «9 de 56 libres · 4 retenidas para ti» antes de que conteste el servidor",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar reserva"
          }
        }
      ],
      "espera": {
        "texto": "sábado 7 de noviembre: 9 de 56 libres · 4 retenidas para ti"
      }
    },
    {
      "descripcion": "Con 2 personas, se retienen 2: «11 de 56 libres · 2 retenidas para ti»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Personas",
            "texto": "2"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar reserva"
          }
        }
      ],
      "espera": {
        "texto": "sábado 7 de noviembre: 11 de 56 libres · 2 retenidas para ti"
      }
    },
    {
      "descripcion": "Cuando el servidor contesta, se confirma la reserva",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar reserva"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Reserva confirmada."
      }
    },
    {
      "descripcion": "Si el servidor falla, sale el aviso y la noche vuelve a «13 de 56 libres»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Personas",
            "texto": "4"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar reserva"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido confirmar la reserva"
      }
    }
  ]
}
```

## Paso 6: tus tests (`src/pruebas/`)

La configuración es la de las lecciones 83 y 84, con la red de MSW y un par de cosas más en `preparacion.ts`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import '@testing-library/jest-dom/vitest'\nimport { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'\nimport { cambiarAjustes } from '../servidor/ajustes'\nimport { reiniciarBaseDeDatos } from '../servidor/baseDeDatos'\nimport { servidor } from './servidorDePruebas'\n\nbeforeAll(() => servidor.listen({ onUnhandledFrame: 'error' }))\n\nbeforeEach(() => {\n  vi.useFakeTimers({ toFake: ['Date'] })\n  vi.setSystemTime(new Date('2026-11-02T10:00:00'))\n  reiniciarBaseDeDatos()\n  cambiarAjustes({ latencia: 0, proximaReserva: 'normal' })\n})\n\nafterEach(() => {\n  servidor.resetHandlers()\n  vi.useRealTimers()\n})\n\nafterAll(() => servidor.close())",
  "anotaciones": [
    {
      "fragmento": "beforeAll(() => servidor.listen({ onUnhandledFrame: 'error' }))",
      "nota": "servidor es setupServer(...manejadores), en servidorDePruebas.ts: los mismos manejadores del navegador, ahora en Node. Con error, una petición sin manejador hace fallar el test en vez de salir a internet (lección 84)."
    },
    {
      "fragmento": "vi.useFakeTimers({ toFake: ['Date'] })",
      "nota": "Solo se falsea Date. Los temporizadores siguen siendo de verdad, así que user-event, los findBy y los delay de MSW funcionan como siempre. Con todos los relojes falsos habría que avanzarlos a mano (lección 84)."
    },
    {
      "fragmento": "vi.setSystemTime(new Date('2026-11-02T10:00:00'))",
      "nota": "Hoy es siempre el lunes 2 de noviembre de 2026: «mañana», «90 días vista» y los nombres de los días que salen en los mensajes no cambian según el día en que pases los tests."
    },
    {
      "fragmento": "reiniciarBaseDeDatos()",
      "nota": "Cada test empieza con el servidor recién arrancado: sin reservas y con las plazas de siempre. Como el localStorage del proyecto 92, lo que deja un test no puede verlo el siguiente."
    },
    {
      "fragmento": "cambiarAjustes({ latencia: 0, proximaReserva: 'normal' })",
      "nota": "Sin esperas, salvo en los tests que las necesitan para ver algo a medio camino, como las plazas retenidas."
    }
  ]
}
```

`vite.config.ts` fija además la zona horaria, `env: { TZ: 'Europe/Madrid' }`, para que la fecha de los tests sea la misma en cualquier ordenador. Los tests de `App.test.tsx` montan la aplicación entera dentro de `StrictMode` y la usan como una persona, con las ayudas de `ayudas.tsx` (`montarApp`, `rellenarRefugio`, `rellenarGrupo`, `llegarAConfirmar`). Este es el modelo para los tuyos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  it('retiene las plazas mientras confirma y después enseña el localizador', async () => {\n    plazasDeEjemplo()\n    cambiarAjustes({ latencia: 300 })\n    const usuario = montarApp()\n    await llegarAConfirmar(usuario)\n    await usuario.click(screen.getByRole('checkbox', { name: 'He leído y acepto las normas del refugio' }))\n\n    await usuario.click(screen.getByRole('button', { name: 'Confirmar reserva' }))\n\n    // Al instante, antes de que conteste el servidor\n    expect(screen.getByText('6 de 60 libres · 4 retenidas para ti')).toBeInTheDocument()\n    expect(screen.getByText('36 de 60 libres · 4 retenidas para ti')).toBeInTheDocument()\n    expect(screen.getByRole('status')).toHaveTextContent('Plazas retenidas. Confirmando tu reserva…')\n\n    expect(await screen.findByRole('heading', { name: 'Reserva confirmada' })).toHaveFocus()\n    expect(screen.getByText('RES-1001')).toBeInTheDocument()\n    // Las plazas, ahora sí, las de verdad\n    expect(screen.getByText('6 de 60 libres')).toBeInTheDocument()\n    expect(screen.queryByText(/retenidas para ti/)).not.toBeInTheDocument()\n  })",
  "anotaciones": [
    {
      "fragmento": "cambiarAjustes({ latencia: 300 })",
      "nota": "Con 300 ms de retardo, el test tiene tiempo de mirar lo que se ve mientras el servidor contesta. Sin retardo, la respuesta llegaría antes de que pudiera comprobarlo (lección 84)."
    },
    {
      "fragmento": "await llegarAConfirmar(usuario)",
      "nota": "Los pasos 1 y 2 con los datos de ejemplo: Respomuso, el sábado 14 de noviembre, dos noches, cuatro personas."
    },
    {
      "fragmento": "expect(screen.getByText('6 de 60 libres · 4 retenidas para ti')).toBeInTheDocument()",
      "nota": "Con getBy, sin esperar: justo después del clic, las plazas retenidas ya están. Si el valor optimista no existiera, aquí no habría nada hasta pasados 300 ms."
    },
    {
      "fragmento": "expect(screen.getByRole('status')).toHaveTextContent('Plazas retenidas. Confirmando tu reserva…')",
      "nota": "Lo que oiría un lector de pantalla: la región de estado (lección 37)."
    },
    {
      "fragmento": "expect(await screen.findByRole('heading', { name: 'Reserva confirmada' })).toHaveFocus()",
      "nota": "findBy espera a que conteste el servidor. Y el foco, en el título de la pantalla final."
    },
    {
      "fragmento": "expect(screen.queryByText(/retenidas para ti/)).not.toBeInTheDocument()",
      "nota": "Lo optimista se ha ido solo: ahora son las plazas de verdad (lección 83: queryBy para comprobar una ausencia)."
    }
  ]
}
```

Te quedan cuatro `it.todo`, cada uno con un comentario `TODO (paso 6)` que dice qué comprobar:

1. **«Intro en un campo sigue adelante, no vuelve atrás»**: rellena el paso 2 y escribe el teléfono terminando en `{Enter}`: `usuario.type(campo, '612345678{Enter}')`. Tienes que llegar al paso 3. Después, cambia de orden los botones de `BotonesPaso` y míralo fallar.
2. **«si otro grupo se adelanta, enseña las plazas que quedan de verdad»**: con `cambiarAjustes({ proximaReserva: 'sin-plazas' })`, el aviso, las dos noches con «2 de 60 libres» (`getAllByText`), que sigues en el paso 3 y `contarReservas()` a 0.
3. **El de «Hacer otra reserva»**, que vuelve al principio: el foco en el título del paso 1, ningún refugio elegido y la columna «Tu reserva» (`getByRole('complementary', ...)`) fuera.
4. **«la reserva confirmada»**, en `accesibilidad.test.tsx`: llega hasta el final y pasa axe. Como en los demás tests de axe, sin la regla de contraste: jsdom no pinta y no puede calcularlo (lección 83).

Al terminar, la salida de `npm test` en la rama `solucion`:

```text
 Test Files  4 passed (4)
      Tests  36 passed (36)
```

Y `npm run build`, que antes de construir comprueba los tipos con `tsc -b`:

```text
vite v8.3.5 building client environment for production...
✓ 135 modules transformed.
dist/index.html                        0.48 kB │ gzip:  0.30 kB
dist/assets/angel-orus-ukP-yyyu.jpg   79.23 kB
dist/assets/renclusa-VTOQyQCz.jpg     87.14 kB
dist/assets/respomuso-6kPZsW5p.jpg    87.79 kB
dist/assets/pineta-CFkIXeOr.jpg       92.63 kB
dist/assets/estos-NnR9sORo.jpg        93.97 kB
dist/assets/index-Cxt3j3wX.css         8.22 kB │ gzip:  2.64 kB
dist/assets/index-BnCwygVy.js        322.44 kB │ gzip: 98.44 kB
✓ built in 75ms
```

Unos 98 kB de JavaScript comprimido, y la mayor parte son React y React DOM: el gestor de tareas del proyecto 92, con la misma versión y casi nada más, ocupaba 70. Las cinco imágenes van aparte, de unos 90 kB cada una. Ni MSW ni el panel entran en el build.

## Errores típicos

**Poner «Atrás» antes que «Seguir».** Es el orden en que se leen los botones en muchos formularios, y en pantalla parece lo natural. Pero cuando pulsas Intro en un campo, el navegador envía el formulario con su **primer** botón de enviar, el «botón por defecto» de la especificación de HTML (comprobado en Chromium y WebKit). Con «Atrás» delante, Intro te devuelve al paso anterior. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Intro te lleva atrás",
  "consigna": "Pulsa «Seguir», escribe un correo y pulsa Intro dentro del campo: vuelves al paso 1. Arréglalo cambiando el orden de los botones en el JSX, para que «Seguir» sea el primero. «Atrás» tiene que seguir funcionando.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport './estilos.css'\n\nconst TITULOS = ['Paso 1 de 3: refugio', 'Paso 2 de 3: contacto', 'Paso 3 de 3: revisar']\n\nfunction avanzar(estado, formData) {\n  const valores = { ...estado.valores }\n  for (const [campo, valor] of formData) {\n    if (campo !== 'intencion') valores[campo] = valor\n  }\n  const paso = formData.get('intencion') === 'atras' ? estado.paso - 1 : estado.paso + 1\n  return { paso: Math.min(paso, 2), valores }\n}\n\nexport default function App() {\n  const [{ paso, valores }, accion] = useActionState(avanzar, { paso: 0, valores: {} })\n\n  return (\n    <main>\n      <h1>Reserva de refugios</h1>\n      <h2>{TITULOS[paso]}</h2>\n      <form key={paso} action={accion}>\n        {paso === 0 && (\n          <label>\n            Refugio\n            <input name=\"refugio\" defaultValue={valores.refugio ?? 'Pineta'} />\n          </label>\n        )}\n        {paso === 1 && (\n          <label>\n            Correo electrónico\n            <input name=\"correo\" type=\"email\" defaultValue={valores.correo} />\n          </label>\n        )}\n        {paso === 2 && (\n          <p>\n            {valores.refugio}, a nombre de {valores.correo}.\n          </p>\n        )}\n        <div className=\"botones\">\n          {paso > 0 && (\n            <button type=\"submit\" name=\"intencion\" value=\"atras\">\n              Atrás\n            </button>\n          )}\n          {paso < 2 && (\n            <button type=\"submit\" name=\"intencion\" value=\"seguir\">\n              Seguir\n            </button>\n          )}\n        </div>\n      </form>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.3rem;\n  color: #1f4e5f;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-weight: 600;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 2px solid #1f4e5f;\n  border-radius: 999px;\n  color: #fff;\n  background: #1f4e5f;\n}\n\nbutton + button {\n  color: #1f4e5f;\n  background: #fff;\n}\n\n[aria-disabled='true'] {\n  opacity: 0.7;\n}\n\n.error,\n[role='alert'] {\n  margin: 0;\n  color: #a4262c;\n}\n\n.noche {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #ece6dc;\n  border-radius: 8px;\n}\n\n.noche.retenida {\n  border-color: #e8c48f;\n  background: #fdf3e3;\n  color: #8a4b00;\n  font-weight: 600;\n}\n\n.nota {\n  color: #4f5d63;\n  font-style: italic;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "En el paso 2, Intro en «Correo electrónico» lleva al paso 3",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Seguir"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo electrónico",
            "texto": "lucia@ejemplo.es"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Paso 3 de 3: revisar"
      }
    },
    {
      "descripcion": "El paso 3 dice «Estós, a nombre de lucia@ejemplo.es.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Refugio",
            "texto": "Estós"
          }
        },
        {
          "teclear": "{Enter}"
        },
        {
          "escribir": {
            "etiqueta": "Correo electrónico",
            "texto": "lucia@ejemplo.es"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "texto": "Estós, a nombre de lucia@ejemplo.es."
      }
    },
    {
      "descripcion": "«Atrás» sigue volviendo al paso 1",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Seguir"
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
        "nombre": "Paso 1 de 3: refugio"
      }
    }
  ]
}
```

En el proyecto, el test que escribes en el paso 6 lo vigila. Con los botones al revés, falla así:

```text
FAIL  src/pruebas/App.test.tsx > paso 2: quién viene > Intro en un campo sigue adelante, no vuelve atrás
TestingLibraryElementError: Unable to find role="heading" and name "Paso 3 de 3: Revisar y confirmar"
```

Es decir: no encuentra el título del paso 3. En el HTML que imprime debajo se ve por qué: el título dice «Paso 1 de 3». Y no, no vale reordenar con CSS (`flex-direction: row-reverse`): el orden del Tab seguiría siendo el del DOM y no el que se ve (lección 37).

**Leer el paso con `Object.fromEntries(formData)`.** Parece lo mismo que `leerPaso`, y con todos los campos de texto lo es. La diferencia está en la casilla: si no está marcada, no viaja en el `FormData`, así que `{ ...estado.valores, ...Object.fromEntries(formData) }` **conserva la marca de la vez anterior**. Lo probamos en el proyecto: confirmas con la casilla marcada, el servidor falla, la desmarcas y vuelves a confirmar... y la reserva se guarda, sin que hayas aceptado las normas. Ninguno de los tests de entonces lo detectaba; por eso existe «si desmarcas la casilla después de un fallo, ya no reserva», que con `Object.fromEntries` no encuentra el error de la casilla y falla. `leerPaso` pide al `FormData` cada campo del paso, uno por uno, y el que falta queda como `undefined`.

**Validar el paso con el esquema entero.** Con `esquemaReserva` en lugar de `esquemaPasoRefugio` en `comprobarPlazas`, el paso 1 no se puede pasar nunca: el resumen dice «Hay 4 campos por corregir.» (nombre, correo, teléfono y la casilla, que todavía no existen) y ningún campo de la pantalla está marcado, así que el foco no va a ninguna parte (comprobado). Cada paso valida su recorte; el esquema entero, solo al final.

**Quitar la `key` del `<select>`.** Es el error de la lección 61, y aquí sale en «Noches». Eliges 3 noches, te equivocas en otro campo y, al volver el formulario, «Noches» dice 1: el `<select>` no actualiza la opción marcada cuando cambia su `defaultValue`. El test «después de un error conserva lo elegido, también en el desplegable» lo dice así:

```text
Error: expect(element).toHaveValue(3)
Expected the element to have value:
  3
Received:
  1
```

**Quedarse con las plazas viejas tras un 409.** Si en el caso `'sin-plazas'` de `confirmar` devuelves solo el aviso, sin `noches: respuesta.noches`, lo optimista se retira y vuelven las plazas del paso 1, que dicen que hay sitio. El aviso dice una cosa y la columna otra. El valor de verdad de `useOptimistic` tiene que ser siempre lo último que ha dicho el servidor.

**Describir las imágenes.** Con `alt="Refugio de Respomuso"`, un lector lee el nombre dos veces, el de la imagen y el de la opción; con una descripción del paisaje, presenta como una foto del refugio una imagen generada con IA. Y si quitas el `alt` del todo, algunos lectores leen el nombre del archivo, y los cinco tests de axe se ponen en rojo con esta línea:

```text
+   "image-alt: Images must have alternative text (5)",
```

Es decir: las imágenes tienen que tener texto alternativo, y hay cinco que no lo tienen. Una imagen que acompaña a un texto que ya lo dice todo es decorativa: `alt=""`, que es un texto alternativo vacío, no la falta de uno.

**Lanzar el error en vez de devolverlo.** Igual que en el proyecto 62: si la acción lanza, el error va al error boundary más cercano (aquí no hay ninguno, y la página se quedaría en blanco) y React cancela lo que hubiera en la cola de `useActionState` (lección 58). Un 409 o un 500 son resultados esperados: se devuelven como estado.

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm test pasa entero?",
      "texto": "36 tests en verde: los 32 que venían escritos y tus 4. Si alguno pasa solo y falla con los demás, mira que preparacion.ts reinicie la base de datos y los ajustes antes de cada test."
    },
    {
      "titulo": "¿npm run build y npm run lint no se quejan?",
      "texto": "El build comprueba los tipos con tsc -b antes de construir. Oxlint vigila las reglas de los hooks y que cada archivo de componentes exporte solo componentes."
    },
    {
      "titulo": "¿Se puede reservar solo con el teclado?",
      "texto": "Tab, flechas para elegir refugio, Intro para seguir. En cada paso nuevo, el foco en su título; con un error, en el campo que lo tiene; con el servidor caído, en el aviso. Nunca en el body."
    },
    {
      "titulo": "¿Lo entiende un lector de pantalla?",
      "texto": "Con VoiceOver o Narrador: cada campo dice su nombre, su ayuda y su error; los pasos se anuncian; «Buscando plazas libres…» se oye sin mover el foco."
    },
    {
      "titulo": "¿Las plazas retenidas vuelven solas?",
      "texto": "Con el panel en 2 segundos y «Falla el servidor (500)», confirma: retenidas, aviso y de vuelta. Con «Otro grupo se adelanta (409)», tienen que quedar las que dice el servidor, no las de antes."
    },
    {
      "titulo": "¿Volver atrás conserva todo?",
      "texto": "Rellena el paso 2, vuelve al 1, cambia el refugio y sigue: el paso 2 tiene que estar como lo dejaste, y las plazas, las del refugio nuevo."
    }
  ]
}
```

## Retos para ampliarlo

Sin comprobación automática, pero con tests: cada reto se termina cuando su test está en verde.

1. **Elegir la fecha viendo las plazas.** En el paso 1, en lugar de un campo de fecha, una lista de las próximas 14 noches del refugio elegido, cada una como una opción de radio con sus plazas libres y desactivada si está completa. La ruta ya existe: `GET /api/disponibilidad?refugio=…&llegada=…&noches=14`. ¿Dónde pides las noches al cambiar de refugio: en un efecto, con `use` y Suspense, o en la propia acción (lección 52)?
2. **Cancelar una reserva** con su localizador: `DELETE /api/reservas/:localizador` en `manejadores.ts` y un formulario en la pantalla final. Las plazas tienen que **subir** en el acto y volver si el servidor falla: la función de `useOptimistic` tendrá que distinguir entre retener y liberar, como el reto 1 de la lección 62.
3. **No perder la reserva a medias al recargar.** Guarda `estado.valores` en `sessionStorage` (un efecto, lección 38) y úsalo como estado inicial de `useActionState`. Ojo con la casilla de las normas: ¿debería sobrevivir a una recarga?
4. **Lista de espera.** Cuando una noche está completa, en lugar del error, un botón «Avisadme si queda sitio» que hace `POST /api/espera` con el correo. ¿Tiene sentido aquí la interfaz optimista? Piensa qué pasa si el servidor falla y la persona ya ha cerrado la pestaña.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/reserva-refugios (rama main, punto de partida)",
      "descripcion": "El proyecto con los TODO de cada paso y los tests ya escritos.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/reserva-refugios",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/reserva-refugios (rama solucion)",
      "descripcion": "El proyecto completo, con sus 36 tests, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/reserva-refugios",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "useActionState",
      "descripcion": "La referencia del hook que guarda el estado de toda la reserva, con la cola de acciones y el uso junto a useOptimistic.",
      "url": "https://react.dev/reference/react/useActionState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useOptimistic",
      "descripcion": "Cómo se calcula y cuándo se descarta el valor optimista, y por qué tiene que llamarse dentro de una acción.",
      "url": "https://react.dev/reference/react/useOptimistic",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Zod: Defining schemas",
      "descripcion": "Los métodos de los objetos (pick, omit, extend) y los refinamientos, con las opciones abort, path y when que salen en el paso 1.",
      "url": "https://zod.dev/api",
      "etiqueta": "Zod"
    },
    {
      "titulo": "MSW: Vite",
      "descripcion": "El plugin msw() y el módulo virtual:msw que usa main.tsx, y qué pasa con ellos en producción.",
      "url": "https://mswjs.io/guides/integrations/vite",
      "etiqueta": "MSW"
    },
    {
      "titulo": "Multi-page Forms",
      "descripcion": "El tutorial de formularios de la W3C: cómo indicar el paso actual, el progreso y volver atrás sin perder datos.",
      "url": "https://www.w3.org/WAI/tutorials/forms/multi-page/",
      "etiqueta": "W3C WAI"
    },
    {
      "titulo": "Implicit submission",
      "descripcion": "La parte de la especificación de HTML que explica por qué Intro envía con el primer botón del formulario.",
      "url": "https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission",
      "etiqueta": "WHATWG"
    }
  ]
}
```
