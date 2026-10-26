# Proyecto avanzado: kit de componentes accesibles

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-kit-de-componentes-accesibles` (autogenerado del título)
- **Orden:** 960
- **Fuentes:** [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) y [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (WAI-ARIA APG) + [`<Fragment>`](https://react.dev/reference/react/Fragment) + [createPortal](https://react.dev/reference/react-dom/createPortal) + [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) — ver `contenido/react/TEMARIO.md` #96
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `kit-accesible`)
- **Requiere:** El módulo 5 (sobre todo las lecciones 34 a 37), el módulo 10 (TypeScript) y las lecciones 80, 83 y 84

---

## Qué vas a construir

La Escuela de idiomas Puente Nuevo, en Ronda, abre la matrícula del curso 2026-2027. Su página tiene cuatro piezas que el navegador **no** trae hechas, las de la lección 80: un **combobox** para elegir idioma escribiendo, unas **pestañas** con las modalidades, un **menú** de «Opciones» en cada grupo y un **diálogo** para pedir plaza. Las vas a escribir tú, desde cero y en TSX, siguiendo los patrones de la guía WAI-ARIA Authoring Practices (la APG), y vas a comprobar que funcionan con el teclado y con un lector de pantalla **sin abrir el navegador**: con tests que buscan por rol y con axe (lecciones 83 y 84).

Y al final, la pregunta que la lección 80 dejó en el aire, ahora con números: cambias tu kit por Radix **sin tocar la página ni los tests**, los vuelves a pasar y mides qué te ahorra una librería *headless*, qué te cuesta y qué no te ahorra.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/e6f2f04a59d820265cf8d594c7b0c3fd3b5a9f5cdcf2ef4a4445a2b535f6a871.mp4",
  "poster": "https://www.techstudytracker.com/img/7f58b4a7cd922a92ecb0e000d8b5840ec501dfa1f2f6af0ad353155b16dc4f9e.jpg",
  "titulo": "La matrícula, solo con el teclado",
  "descripcion": "El combobox de idiomas, la modalidad con las flechas, el menú de un grupo y el diálogo para pedir plaza: el Tab da la vuelta dentro y, al cerrar, el foco vuelve a «Opciones»."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las cuatro piezas, cada una con su patrón de la APG",
  "roles": [
    {
      "etiqueta": "Diálogo modal",
      "rol": "«Pedir plaza»",
      "descripcion": "Portal, role dialog y aria-modal; el foco entra con un Fragment, el Tab no se escapa, el resto de la página queda inerte y el foco vuelve al cerrar."
    },
    {
      "etiqueta": "Menú de botón",
      "rol": "«Opciones» de cada grupo",
      "descripcion": "aria-haspopup y aria-expanded; flechas, Inicio, Fin, Escape y Tab; pintado en un portal para que la tarjeta no lo recorte."
    },
    {
      "etiqueta": "Pestañas",
      "rol": "Intensivo, Extensivo y En línea",
      "descripcion": "Foco itinerante, flechas que dan la vuelta, Inicio y Fin, y un prefijo de useId para unir cada pestaña con su panel."
    },
    {
      "etiqueta": "Combobox",
      "rol": "«Idioma»",
      "descripcion": "Filtra sin tildes mientras escribes. Las flechas marcan una opción con aria-activedescendant sin sacar el foco del campo."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta kit-accesible). La rama main trae la página entera y los tests ya escritos, y los cuatro componentes de src/kit funcionando solo con el ratón, con un TODO (paso N) en cada sitio donde va tu trabajo. La rama solucion tiene el proyecto terminado, con la comparación con Radix incluida."
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 20.19 o superior** (o 22.12 o superior): es lo que pide Vite 8. Compruébalo con `node --version`.
- **Un editor**, como [Visual Studio Code](https://code.visualstudio.com), con su terminal integrada (menú `Terminal` → `New Terminal`).
- **El código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o en la página del repositorio, botón **Code** → **Download ZIP**. El proyecto es la carpeta `kit-accesible/`, no el repositorio entero.

### Del cero al proyecto en marcha

1. Abre la carpeta `kit-accesible/` en VS Code (`Archivo` → `Abrir carpeta...`).
2. En la terminal, `npm install`.
3. `npm run dev`, y abre la dirección que imprime (normalmente `http://localhost:5173`). La página funciona con el ratón: elige un idioma, cambia de pestaña, abre un menú y pide plaza.
4. En **otra** terminal, `npm test`. Es tu lista de tareas:

```text
 ❯ src/pruebas/Combobox.test.tsx (8 tests | 2 failed | 6 todo)
 ❯ src/pruebas/Menu.test.tsx (9 tests | 9 failed)
 ❯ src/pruebas/App.test.tsx (1 test | 1 failed)
 ❯ src/pruebas/Pestanas.test.tsx (6 tests | 6 failed)
 ✓ src/pruebas/accesibilidad.test.tsx (5 tests | 4 todo)
 ❯ src/pruebas/Dialogo.test.tsx (7 tests | 7 failed)

 Test Files  5 failed | 1 passed (6)
      Tests  25 failed | 1 passed | 10 todo (36)
```

**25 rojos, 1 verde y 10 pendientes.** Los rojos son los tests que buscan por rol: `getByRole('tab')`, `getByRole('dialog')`, `getByRole('menu')`... y en la rama `main` no hay ni una pestaña, ni un diálogo, ni un menú para un lector de pantalla. Los 10 pendientes (`it.todo`) son los que escribes tú en el paso 6. ¿Y el verde? **Es axe revisando la página recién cargada: no encuentra ningún problema.** Unos botones sueltos y un campo con su etiqueta son HTML correcto; lo que falla es lo que axe no puede saber, que eso debería ser un combobox o unas pestañas. Lo viste en la lección 83: axe y las consultas por rol se complementan, y ninguno basta solo.

Para lanzar solo los tests de un componente mientras trabajas: `npm test -- Pestanas`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Todo lo de esta lección está ejecutado de verdad",
  "contenido": "El proyecto usa React 19.3.1, Vite 8.3.5, TypeScript 6.0.3 y Oxlint, como la plantilla react-ts de create-vite 9.3.1, y para los tests Vitest 5.0.5, Testing Library React 16.3.3, user-event 14.6.8, jest-dom 7.0.1, vitest-axe 0.1.0 (con axe-core 4.14.0) y jsdom 28.1.0. jsdom se queda en la 28 porque la 30 pide Node 22.22 o 24.15, más que Vite. La comparación usa radix-ui 1.8.1. Las salidas que verás son copias de la terminal, solo recortadas, del 22 de octubre de 2026."
}
```

## Cómo está organizado

```text
kit-accesible/
├── vite.config.ts      ← '@kit' es src/kit (o src/radix, en el paso 7)
└── src/
    ├── App.tsx         ← la página de matrícula, ya hecha
    ├── datos.ts        ← idiomas, modalidades y grupos
    ├── kit/            ← tu trabajo: los cuatro componentes
    │   ├── Pestanas.tsx    (paso 1)
    │   ├── Dialogo.tsx     (pasos 2 y 3)
    │   ├── Menu.tsx        (paso 4)
    │   ├── Combobox.tsx    (paso 5)
    │   ├── normalizar.ts   (quitar tildes para buscar)
    │   ├── kit.css
    │   └── index.ts        (lo que exporta el kit)
    └── pruebas/        ← los tests, contra '@kit' (paso 6)
```

`App.tsx` no importa de `./kit`: importa de **`@kit`**, igual que los tests. Es un alias de Vite, y es la pieza que hace posible el paso 7, porque decide qué carpeta es el kit sin que nadie más lo sepa:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "/// <reference types=\"vitest/config\" />\nimport { fileURLToPath } from 'node:url'\nimport react from '@vitejs/plugin-react'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig(({ mode }) => ({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      // La app y los tests importan el kit de '@kit'. Con --mode radix\n      // (paso 7), '@kit' pasa a ser la versión hecha con Radix.\n      '@kit': fileURLToPath(new URL(mode === 'radix' ? './src/radix' : './src/kit', import.meta.url)),\n    },\n  },\n  build: {\n    outDir: mode === 'radix' ? 'dist-radix' : 'dist',\n  },\n  test: {\n    environment: 'jsdom',\n    // Con globals, Testing Library desmonta lo de cada test al terminar (lección 83).\n    globals: true,\n    setupFiles: './src/pruebas/preparacion.ts',\n  },\n}))",
  "anotaciones": [
    {
      "fragmento": "'@kit': fileURLToPath(new URL(mode === 'radix' ? './src/radix' : './src/kit', import.meta.url)),",
      "nota": "Un alias: quien escribe import { Dialogo } from @kit recibe lo que exporte src/kit/index.ts. Con el modo radix (vite --mode radix o vitest --mode radix), recibe src/radix/index.ts. La página y los tests no cambian ni una letra."
    },
    {
      "fragmento": "export default defineConfig(({ mode }) => ({",
      "nota": "defineConfig acepta una función que recibe el modo. Por defecto es development con npm run dev, production con npm run build y test con Vitest."
    },
    {
      "fragmento": "outDir: mode === 'radix' ? 'dist-radix' : 'dist',",
      "nota": "Las dos versiones se construyen en carpetas distintas, para poder comparar su peso en el paso 7."
    },
    {
      "fragmento": "globals: true,",
      "nota": "Como en la lección 83: con describe, it y afterEach globales, Testing Library desmonta lo de cada test al terminar. Los tests importan igualmente de vitest, para que TypeScript conozca los tipos."
    }
  ]
}
```

TypeScript también tiene que saber qué es `@kit`, y por eso `tsconfig.app.json` añade `"paths": { "@kit": ["./src/kit/index.ts"] }`. `npm run build` ejecuta `tsc -b` antes de `vite build`, y los tests están dentro de `src/`: un error de tipos en un test también para el build.

Un detalle de `kit.css` que vas a notar enseguida: **los estados se pintan desde los atributos ARIA**, no desde clases propias. La pestaña activa es `.kit-pestana[aria-selected='true']`, el botón del menú abierto es `[aria-expanded='true']`. Por eso en la rama `main` la pestaña activa no se distingue de las demás: todavía no tiene `aria-selected`. Si lo que se ve sale del mismo atributo que lee el lector de pantalla, los dos no pueden contar cosas distintas.

## Paso 1: las pestañas (`src/kit/Pestanas.tsx`)

Empiezas por la pieza que ya conoces: en la lección 80 escribiste a mano las pestañas del taller Barro y Fuego, con sus roles, el foco itinerante y las flechas, y hiciste el ejercicio del teclado. Aquí las conviertes en un **componente del kit**: tipado, reutilizable y que no choque consigo mismo si aparece dos veces en la misma página. Sigue el [patrón Tabs de la APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) con **activación automática**: la pestaña se activa al recibir el foco, que es lo que la APG recomienda cuando los paneles ya están cargados.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function Pestanas({ etiqueta, pestanas, inicial = pestanas[0]?.id }: PropsPestanas) {\n  const base = useId()\n  const [activa, setActiva] = useState(inicial)\n  const lista = useRef<HTMLDivElement>(null)\n\n  const idPestana = (id: string) => `${base}-pestana-${id}`\n  const idPanel = (id: string) => `${base}-panel-${id}`\n\n  function activar(indice: number) {\n    const pestana = pestanas[indice]\n    setActiva(pestana.id)\n    // La pestaña ya existe en el DOM: se puede enfocar sin esperar al render.\n    lista.current?.querySelectorAll<HTMLElement>('[role=\"tab\"]')[indice]?.focus()\n  }\n\n  function manejarTeclas(evento: KeyboardEvent<HTMLDivElement>) {\n    const actual = pestanas.findIndex((p) => p.id === activa)\n    const ultima = pestanas.length - 1\n    switch (evento.key) {\n      case 'ArrowRight':\n        activar(actual === ultima ? 0 : actual + 1)\n        break\n      case 'ArrowLeft':\n        activar(actual === 0 ? ultima : actual - 1)\n        break\n      case 'Home':\n        activar(0)\n        break\n      case 'End':\n        activar(ultima)\n        break\n      default:\n        return\n    }\n    evento.preventDefault()\n  }",
  "anotaciones": [
    {
      "fragmento": "const base = useId()",
      "nota": "Un prefijo distinto por cada copia del componente (lección 37). Todos los ids de pestañas y paneles salen de aquí."
    },
    {
      "fragmento": "const idPanel = (id: string) => `${base}-panel-${id}`",
      "nota": "Los ids son el pegamento: cada pestaña apunta a su panel con aria-controls, y cada panel toma su nombre de su pestaña con aria-labelledby."
    },
    {
      "fragmento": "lista.current?.querySelectorAll<HTMLElement>('[role=\"tab\"]')[indice]?.focus()",
      "nota": "Además de activarla, hay que enfocarla, o la siguiente flecha saldría de la pestaña anterior. Ya está en el DOM, así que se enfoca en el acto, sin esperar al render. Se busca por su rol, que es justo lo que no va a cambiar."
    },
    {
      "fragmento": "activar(actual === ultima ? 0 : actual + 1)",
      "nota": "Flecha derecha: la siguiente, y desde la última, la primera. Izquierda, al revés. Inicio y Fin van a los extremos."
    },
    {
      "fragmento": "evento.preventDefault()",
      "nota": "Solo para las teclas que el componente usa: así Inicio y Fin no desplazan además la página. Las demás siguen su camino."
    }
  ]
}
```

El resto del archivo es el JSX que ya conoces de la lección 80: `role="tablist"` con la prop `etiqueta` como `aria-label`, cada `button` con `role="tab"`, `aria-selected`, `aria-controls` y `tabIndex` 0 solo en la activa, y **todos** los paneles pintados, con `hidden` en los que no tocan y `tabIndex={0}` para que el Tab llegue al contenido.

El test que comprueba lo del `useId` monta dos grupos de pestañas cuyos ids de datos coinciden (`intensivo` y `extensivo` en los dos) y mira el nombre de cada panel. Así falla si escribes los ids a mano, con un prefijo fijo:

```text
 FAIL  src/pruebas/Pestanas.test.tsx > Pestanas > dos grupos de pestañas en la misma página no se pisan los ids
Error: expect(element).toHaveAccessibleName()

Expected element to have accessible name:
  Básico
Received:
  Intensivo
```

Es decir: el segundo panel debería llamarse «Básico», pero se llama «Intensivo». Con dos elementos con el mismo `id`, `aria-labelledby` apunta al primero que encuentra, que es la pestaña del **otro** grupo. Con `useId`, los 6 tests de `Pestanas.test.tsx` en verde.

## Paso 2: el diálogo, en su sitio y con nombre (`src/kit/Dialogo.tsx`)

El [patrón Dialog (Modal) de la APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) pide cuatro cosas de marcado y tres de comportamiento. En este paso, lo primero: que se pinte fuera de su sitio, que sea un diálogo con nombre y que se pueda cerrar. Fíjate en la API: el componente **no sabe quién lo abre ni qué lleva dentro**. Recibe `abierto`, `onCerrar`, `titulo`, una `descripcion` opcional y `children`.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function Dialogo({ abierto, ...props }: PropsDialogo): ReactNode {\n  if (!abierto) return null\n  // Fuera de su sitio: al final de <body>, donde ningún overflow ni\n  // z-index de los antepasados lo recorta (lección 36).\n  return createPortal(<VentanaDialogo {...props} />, document.body)\n}\n\nfunction VentanaDialogo({ onCerrar, titulo, descripcion, children }: Omit<PropsDialogo, 'abierto'>) {\n  const idTitulo = useId()\n  const idDescripcion = useId()\n  // ... (refs y foco: paso 3)\n\n  function manejarTeclas(evento: KeyboardEvent<HTMLDivElement>) {\n    if (evento.key === 'Escape') {\n      evento.stopPropagation()\n      onCerrar()\n    }\n  }\n\n  function manejarFondo(evento: MouseEvent<HTMLDivElement>) {\n    // mousedown y no click: si alguien selecciona texto dentro y suelta\n    // fuera, el click llegaría al fondo y cerraría sin querer.\n    if (evento.target === evento.currentTarget) onCerrar()\n  }\n\n  return (\n    <div className=\"kit-dialogo-fondo\" onMouseDown={manejarFondo}>\n      <div\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby={idTitulo}\n        aria-describedby={descripcion ? idDescripcion : undefined}\n        tabIndex={-1}\n        className=\"kit-dialogo\"\n        onKeyDown={manejarTeclas}\n      >\n        <h2 id={idTitulo} className=\"kit-dialogo-titulo\">\n          {titulo}\n        </h2>\n        {descripcion && (\n          <p id={idDescripcion} className=\"kit-dialogo-descripcion\">\n            {descripcion}\n          </p>\n        )}\n        {children}\n      </div>\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "return createPortal(<VentanaDialogo {...props} />, document.body)",
      "nota": "Un portal (lección 36), por la razón de siempre: que ningún overflow ni z-index de los antepasados lo recorte. Y por otra que verás en el paso 3: para dejar inerte todo lo demás, el diálogo tiene que estar fuera de lo demás, como un hijo más de body."
    },
    {
      "fragmento": "if (!abierto) return null",
      "nota": "Cerrado no existe. VentanaDialogo se monta al abrir y se desmonta al cerrar, y en el paso 3 eso es justo lo que hace falta para engancharle el foco."
    },
    {
      "fragmento": "aria-modal=\"true\"",
      "nota": "Le dice al lector de pantalla que lo de fuera no cuenta. La APG avisa: márcalo modal solo si de verdad nadie puede usar lo de fuera. Eso lo garantiza el inert del paso 3."
    },
    {
      "fragmento": "aria-labelledby={idTitulo}\n        aria-describedby={descripcion ? idDescripcion : undefined}",
      "nota": "Nombre y descripción con ids de useId. Al abrirse, un lector anuncia algo como «Pedir plaza en Alemán B2, diálogo», y después el horario. Y el test lo encuentra con getByRole(dialog, con ese nombre)."
    },
    {
      "fragmento": "tabIndex={-1}",
      "nota": "El diálogo se puede enfocar desde el código, sin entrar en el recorrido del Tab. Sirve de último recurso si lo que lleva dentro no tiene nada enfocable, y hace que un clic en un texto de dentro deje el foco dentro."
    },
    {
      "fragmento": "evento.stopPropagation()\n      onCerrar()",
      "nota": "Escape cierra. stopPropagation porque los eventos de un portal suben por el árbol de React (lección 36): si este diálogo estuviera dentro de otro, Escape cerraría solo el de encima."
    },
    {
      "fragmento": "if (evento.target === evento.currentTarget) onCerrar()",
      "nota": "Pulsar el fondo cierra, pero solo si se pulsa el fondo y no algo de la ventana. Va en onMouseDown y no en onClick: lo verás en Errores típicos."
    }
  ]
}
```

Con el paso 2 hecho pasan **2 de los 7** tests del diálogo: el de nombre y descripción y el del fondo. El de Escape todavía no, y no es un fallo de `manejarTeclas`: Escape solo llega al diálogo si el foco está dentro, y el foco sigue en el botón que lo abrió. Eso es el paso 3.

## Paso 3: el foco del diálogo, con un Fragment (`src/kit/Dialogo.tsx`)

Lo que queda del patrón es todo del foco: **al abrir, entra; mientras está abierto, el Tab no se escapa; al cerrar, vuelve** a quien abrió el diálogo. Y el resto de la página, fuera del alcance de todos, también del ratón. En la lección 36 lo repartiste entre el modal y la `App` (el `inert` en `main`, `flushSync` antes de devolver el foco). Aquí todo vive dentro del componente, porque un kit no puede pedirle a cada página que lo haga bien.

El problema de fondo es que **el diálogo no sabe qué lleva dentro**: `children` puede ser un formulario, una lista o un solo botón. Antes de React 19.3, para encontrar «el primer elemento enfocable» había que mantener una lista de selectores (`a[href], button:not([disabled]), input, select, textarea, [tabindex]...`) y equivocarse en algún caso raro. Con una **ref en un `<Fragment>`** alrededor de `children` (lección 35), el diálogo tiene `focus()` y `focusLast()`. React no mira ninguna lista: llama a `focus()` en cada elemento del grupo, en orden, y se para en el primero que de verdad recibe el foco.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  const capa = useRef<HTMLDivElement>(null)\n  const ventana = useRef<HTMLDivElement>(null)\n  const contenido = useRef<FragmentInstance>(null)\n\n  // Al abrir: el resto de la página, inerte, y el foco, dentro.\n  // Al cerrar: lo contrario y en ese orden, o el foco no podría volver.\n  // Es de layout para que no haya ni un fotograma con el diálogo\n  // pintado y el foco todavía fuera (lección 45).\n  useLayoutEffect(() => {\n    const anterior = document.activeElement\n    const fuera = [...document.body.children].filter(\n      (elemento) => elemento !== capa.current && !elemento.hasAttribute('inert'),\n    )\n    fuera.forEach((elemento) => elemento.toggleAttribute('inert', true))\n\n    // El primer elemento enfocable de lo que te hayan pasado, sea cual sea.\n    contenido.current?.focus()\n    // Si no había ninguno, el propio diálogo (tiene tabIndex={-1}).\n    if (!ventana.current?.contains(document.activeElement)) ventana.current?.focus()\n\n    return () => {\n      fuera.forEach((elemento) => elemento.toggleAttribute('inert', false))\n      if (anterior instanceof HTMLElement) anterior.focus()\n    }\n  }, [])\n\n  // ...\n\n  return (\n    <div ref={capa} className=\"kit-dialogo-fondo\" onMouseDown={manejarFondo}>\n      {/* Centinela de entrada: con Mayús+Tab desde el primer control se\n          llega aquí, y el foco salta al último. */}\n      <span tabIndex={0} className=\"kit-centinela\" onFocus={() => contenido.current?.focusLast()} />\n      <div\n        ref={ventana}\n        role=\"dialog\"\n        // ...\n      >\n        {/* ... título y descripción */}\n        <Fragment ref={contenido}>{children}</Fragment>\n      </div>\n      <span tabIndex={0} className=\"kit-centinela\" onFocus={() => contenido.current?.focus()} />\n    </div>\n  )",
  "anotaciones": [
    {
      "fragmento": "const contenido = useRef<FragmentInstance>(null)",
      "nota": "La ref del Fragment. Su tipo es FragmentInstance, que @types/react-dom 19.3 completa con focus, focusLast, addEventListener, observeUsing y los demás métodos de la lección 35."
    },
    {
      "fragmento": "useLayoutEffect(() => {",
      "nota": "Sincronizar con algo de fuera de React, el foco y un atributo del resto de la página: un efecto. De layout para que ocurra en el mismo commit, antes de pintar: ni un fotograma con el diálogo visible y el foco detrás, ni con el diálogo cerrado y la página aún inerte."
    },
    {
      "fragmento": "const anterior = document.activeElement",
      "nota": "Quién tenía el foco antes de abrir: normalmente el botón que abrió el diálogo. Al cerrar, el foco vuelve ahí."
    },
    {
      "fragmento": "fuera.forEach((elemento) => elemento.toggleAttribute('inert', true))",
      "nota": "Todos los hijos de body menos la capa del diálogo quedan inertes: sin foco, sin clics y fuera del árbol de accesibilidad. Funciona porque el portal puso el diálogo como hijo directo de body. Los que ya eran inertes (otro diálogo debajo) se dejan como estaban."
    },
    {
      "fragmento": "contenido.current?.focus()",
      "nota": "El primer elemento enfocable de lo que te hayan pasado, sea un campo, un botón o un enlace. Si no hay ninguno, la línea siguiente enfoca el propio diálogo."
    },
    {
      "fragmento": "fuera.forEach((elemento) => elemento.toggleAttribute('inert', false))\n      if (anterior instanceof HTMLElement) anterior.focus()",
      "nota": "La limpieza, al desmontarse, es decir, al cerrar. El orden importa: un elemento dentro de una zona inerte no acepta el foco. Primero se quita inert y después se devuelve el foco."
    },
    {
      "fragmento": "onFocus={() => contenido.current?.focusLast()}",
      "nota": "Un centinela: un span vacío e invisible que el Tab sí alcanza. Mayús+Tab desde el primer control llega aquí, y el foco salta al último. El de abajo hace lo contrario con focus(). Es la trampa de foco que pide la APG."
    },
    {
      "fragmento": "<Fragment ref={contenido}>{children}</Fragment>",
      "nota": "El Fragment no añade nada al DOM. El diálogo sigue sin saber qué lleva dentro, y aun así sabe cuál es lo primero y lo último que se puede enfocar."
    }
  ]
}
```

Tres detalles que no se ven en el código:

- **Los centinelas van fuera del `role="dialog"`**, antes y después de la ventana. Si el foco está en la propia ventana (tras un clic en un texto de dentro), el siguiente Tab tiene que ir al primer control, y eso pasa porque lo siguiente en el DOM ya es el contenido.
- **Con `StrictMode`, el efecto se ejecuta, se limpia y se vuelve a ejecutar al montar** (lección 63). La limpieza devuelve el foco al botón y la segunda ejecución lo vuelve a guardar como `anterior`: el resultado es el mismo. Es una buena prueba de que la limpieza deshace exactamente lo que hizo el efecto.
- **`inert` no existe en jsdom.** En jsdom 28, `'inert' in HTMLElement.prototype` es `false`, `focus()` funciona en un elemento inerte, `user.tab()` no se lo salta y `getByRole` lo sigue encontrando. Así que en los tests el Tab no se escapa **gracias a los centinelas**, y lo de fuera se comprueba por el atributo. En Chromium sí se comprobó todo: con el diálogo abierto, `#root` lleva `inert`, siete Tab seguidos recorren `nombre → correo → prueba → Enviar solicitud → Cancelar → nombre...` sin salir, y Escape devuelve el foco al botón de «Opciones».

Pruébalo aquí antes de llevarlo a tu proyecto. Es el mismo diálogo, en JavaScript y más corto: ya tiene el portal, el nombre y Escape, y le falta el foco.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Atrapar el foco con un Fragment",
  "consigna": "Sigue los comentarios numerados de Dialogo.jsx: una ref en un Fragment alrededor de children, un useLayoutEffect que pone inert fuera y mete el foco dentro (y en la limpieza, al revés), y dos centinelas que usan focusLast y focus. Pruébalo solo con el teclado: abre, recorre con Tab y Mayús+Tab, cierra con Escape. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Dialogo from './Dialogo'\nimport './estilos.css'\n\nexport default function App() {\n  const [abierto, setAbierto] = useState(false)\n  const [aviso, setAviso] = useState('')\n\n  function enviar(datos) {\n    setAviso(`Solicitud enviada a nombre de ${datos.get('nombre')}.`)\n    setAbierto(false)\n  }\n\n  return (\n    <>\n      <main>\n        <h1>Escuela de idiomas Puente Nuevo</h1>\n        <p>Alemán B2: martes y jueves, de 19:30 a 21:00. Quedan 2 plazas.</p>\n        <button onClick={() => setAbierto(true)}>Pedir plaza</button>\n        <p role=\"status\">{aviso}</p>\n      </main>\n      <Dialogo abierto={abierto} onCerrar={() => setAbierto(false)} titulo=\"Pedir plaza en Alemán B2\">\n        <form action={enviar}>\n          <label>\n            Nombre y apellidos\n            <input name=\"nombre\" />\n          </label>\n          <label>\n            Correo electrónico\n            <input name=\"correo\" type=\"email\" />\n          </label>\n          <p className=\"botones\">\n            <button>Enviar solicitud</button>\n            <button type=\"button\" onClick={() => setAbierto(false)}>\n              Cancelar\n            </button>\n          </p>\n        </form>\n      </Dialogo>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Dialogo.jsx",
      "codigo": "import { useId } from 'react'\nimport { createPortal } from 'react-dom'\n\n// Ya es un diálogo con nombre, en un portal, que se cierra con Escape o\n// pulsando el fondo. Falta todo lo del foco: sigue los comentarios.\nexport default function Dialogo({ abierto, onCerrar, titulo, children }) {\n  if (!abierto) return null\n  return createPortal(\n    <Ventana onCerrar={onCerrar} titulo={titulo}>\n      {children}\n    </Ventana>,\n    document.body,\n  )\n}\n\nfunction Ventana({ onCerrar, titulo, children }) {\n  const idTitulo = useId()\n\n  // 1. Una ref para el fondo y otra para un Fragment que envuelva children.\n  // 2. useLayoutEffect al abrir: inert en los hijos de document.body menos\n  //    el fondo, y el foco dentro con el focus() del Fragment. En la\n  //    limpieza: quita inert y devuelve el foco a quien lo tenía.\n\n  return (\n    <div className=\"fondo\" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>\n      {/* 3. Centinela de entrada: un span con tabIndex 0 que, al recibir\n          el foco, lo manda al último control del diálogo. */}\n      <div\n        className=\"ventana\"\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby={idTitulo}\n        tabIndex={-1}\n        onKeyDown={(e) => e.key === 'Escape' && onCerrar()}\n      >\n        <h2 id={idTitulo}>{titulo}</h2>\n        {children}\n      </div>\n      {/* 4. Centinela de salida: manda el foco al primer control. */}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  min-height: 16rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #0f5c7a;\n}\n\n.fondo {\n  position: fixed;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  padding: 1rem;\n  background: rgb(15 23 42 / 0.55);\n  font-family: system-ui, sans-serif;\n}\n\n.ventana {\n  width: min(22rem, 100%);\n  padding: 1rem 1.25rem;\n  border-radius: 12px;\n  background: white;\n}\n\n.ventana h2 {\n  margin: 0 0 0.75rem;\n  font-size: 1.15rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-weight: 600;\n}\n\ninput {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #52606d;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n  margin: 0.25rem 0 0;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 2px solid #0f5c7a;\n  border-radius: 999px;\n  background: white;\n  color: #0f5c7a;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\n/* Los centinelas existen para recibir el foco un instante: no se ven */\nspan[tabindex='0'] {\n  position: fixed;\n  opacity: 0;\n  pointer-events: none;\n}\n"
    }
  ],
  "archivoInicial": "Dialogo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al abrir el diálogo, el foco entra en «Nombre y apellidos»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir plaza"
          }
        },
        {
          "teclear": "Lucía"
        }
      ],
      "espera": {
        "etiqueta": "Nombre y apellidos",
        "valor": "Lucía"
      }
    },
    {
      "descripcion": "Mayús+Tab desde el primer campo salta al último control, «Cancelar», y la barra espaciadora lo pulsa",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir plaza"
          }
        },
        {
          "pulsar": {
            "etiqueta": "Nombre y apellidos"
          }
        },
        {
          "teclear": "{Shift>}{Tab}{/Shift} "
        }
      ],
      "espera": {
        "ausente": {
          "rol": "dialog"
        }
      }
    },
    {
      "descripcion": "Tab desde el último control vuelve a «Nombre y apellidos»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir plaza"
          }
        },
        {
          "pulsar": {
            "etiqueta": "Correo electrónico"
          }
        },
        {
          "teclear": "{Tab}{Tab}{Tab}Lucía"
        }
      ],
      "espera": {
        "etiqueta": "Nombre y apellidos",
        "valor": "Lucía"
      }
    },
    {
      "descripcion": "Escape cierra y el foco vuelve a «Pedir plaza»: Intro lo abre otra vez",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir plaza"
          }
        },
        {
          "teclear": "{Escape}"
        },
        {
          "teclear": "{Enter}"
        },
        {
          "teclear": "Ana"
        }
      ],
      "espera": {
        "etiqueta": "Nombre y apellidos",
        "valor": "Ana"
      }
    }
  ]
}
```

Con el paso 3 en tu proyecto, los 7 tests de `Dialogo.test.tsx` en verde.

## Paso 4: el menú de botón (`src/kit/Menu.tsx`)

Cada grupo tiene un botón «Opciones» con tres acciones. Es el [patrón Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), y lo que pasa dentro del menú lo describe el [patrón Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/):

- **El botón** lleva `aria-haspopup="menu"` y `aria-expanded`. Intro y la barra espaciadora abren el menú con el foco en la primera opción. La flecha abajo, igual, y la flecha arriba, en la última: las dos flechas son opcionales en la APG, y este kit las tiene.
- **El menú** es `role="menu"`, con el nombre del botón (`aria-labelledby`), y cada opción `role="menuitem"` con `tabIndex={-1}`: el Tab no las recorre, las mueve el menú. Las flechas pasan de una a otra (dar la vuelta es opcional y aquí sí la da), Inicio y Fin van a los extremos, Escape cierra y devuelve el foco al botón y **Tab cierra y sigue** al siguiente elemento de la página.
- Que una letra salte a la opción que empieza por ella (*typeahead*) es opcional en la APG. Queda como reto.

La API es un **componente compuesto** (lección 30): `Menu` pinta el botón y el menú, y cada `OpcionMenu` es una acción. Se hablan por un contexto con una sola función, `cerrar`. Así se usa en `App.tsx`:

```tsx
<Menu etiqueta="Opciones" aria-label={`Opciones de ${nombre}`}>
  <OpcionMenu onSeleccionar={() => onPedirPlaza(solicitud)}>Pedir plaza</OpcionMenu>
  <OpcionMenu onSeleccionar={() => onAvisar(`Añadido a tu calendario: ...`)}>
    Añadir al calendario
  </OpcionMenu>
</Menu>
```

El texto del botón es «Opciones» en todas las tarjetas. Con `aria-label`, cada uno tiene un nombre distinto («Opciones de Alemán B2 (extensivo)»), que empieza por el texto que se ve, como los «Quitar» de la lección 37.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  function abrir(foco: Foco) {\n    // Se mide en el manejador: es cuando se sabe dónde está el botón.\n    const caja = boton.current!.getBoundingClientRect()\n    setPosicion({\n      top: caja.bottom + window.scrollY + 4,\n      right: document.documentElement.clientWidth - caja.right - window.scrollX,\n    })\n    setAbierto(foco)\n  }\n\n  function cerrar() {\n    setAbierto(null)\n    boton.current?.focus()\n  }\n\n  useEffect(() => {\n    if (!abierto) return\n    // El menú no sabe qué opciones le han pasado: el Fragment sí sabe\n    // cuál es la primera y la última que se pueden enfocar.\n    if (abierto === 'ultima') opciones.current?.focusLast()\n    else opciones.current?.focus()\n\n    // Un clic fuera cierra sin robar el foco: va a donde se ha pulsado.\n    function pulsarFuera(evento: PointerEvent) {\n      const objetivo = evento.target as Node\n      if (!menu.current?.contains(objetivo) && !boton.current?.contains(objetivo)) setAbierto(null)\n    }\n    document.addEventListener('pointerdown', pulsarFuera)\n    return () => document.removeEventListener('pointerdown', pulsarFuera)\n  }, [abierto])\n\n  // ... manejarTeclasBoton: flecha abajo abre en la primera, flecha arriba en la última\n\n  function manejarTeclasMenu(evento: KeyboardEvent<HTMLDivElement>) {\n    const items = [...menu.current!.querySelectorAll<HTMLElement>('[role=\"menuitem\"]')]\n    const actual = items.indexOf(document.activeElement as HTMLElement)\n    switch (evento.key) {\n      case 'ArrowDown':\n        items[actual === items.length - 1 ? 0 : actual + 1]?.focus()\n        break\n      case 'ArrowUp':\n        items[actual <= 0 ? items.length - 1 : actual - 1]?.focus()\n        break\n      case 'Home':\n        opciones.current?.focus()\n        break\n      case 'End':\n        opciones.current?.focusLast()\n        break\n      case 'Escape':\n        cerrar()\n        break\n      case 'Tab':\n        // Sin preventDefault: el foco vuelve al botón y el navegador\n        // sigue el Tab desde ahí, al siguiente elemento de la página.\n        cerrar()\n        return\n      default:\n        return\n    }\n    evento.preventDefault()\n  }",
  "anotaciones": [
    {
      "fragmento": "const caja = boton.current!.getBoundingClientRect()",
      "nota": "El menú va en un portal, porque la tarjeta tiene overflow: hidden y lo recortaría (en la rama main lo ves recortado). Fuera de la tarjeta hay que colocarlo a mano, y el sitio se mide en el manejador, que es cuando se sabe dónde está el botón: no hace falta ningún efecto (lección 39)."
    },
    {
      "fragmento": "right: document.documentElement.clientWidth - caja.right - window.scrollX,",
      "nota": "Alineado con el borde derecho del botón, que está en la esquina de la tarjeta. Las medidas de getBoundingClientRect son respecto a la ventana; con scrollY y scrollX pasan a serlo respecto al documento, que es donde se coloca un elemento con position: absolute en body."
    },
    {
      "fragmento": "boton.current?.focus()",
      "nota": "Cerrar siempre devuelve el foco al botón: con Escape, al elegir una opción y con Tab. El clic fuera no pasa por aquí, porque ahí el foco tiene que ir a donde se ha pulsado."
    },
    {
      "fragmento": "if (abierto === 'ultima') opciones.current?.focusLast()\n    else opciones.current?.focus()",
      "nota": "Menu no pinta sus opciones: se las pasan como children. Con un Fragment alrededor, sabe cuál es la primera y la última que se pueden enfocar, como el diálogo. Las opciones tienen tabIndex -1: no están en el recorrido del Tab, pero focus() sí las alcanza."
    },
    {
      "fragmento": "document.addEventListener('pointerdown', pulsarFuera)",
      "nota": "Un clic fuera del menú y del botón lo cierra. Es un escuchador del DOM, así que el efecto lo quita en su limpieza (lección 38). pointerdown y no click: el menú se cierra al apretar, antes de que el clic haga lo suyo."
    },
    {
      "fragmento": "const items = [...menu.current!.querySelectorAll<HTMLElement>('[role=\"menuitem\"]')]",
      "nota": "Para la siguiente y la anterior hace falta la lista entera, en orden. Se busca por rol: así da igual qué componente pinte cada opción."
    },
    {
      "fragmento": "case 'Tab':\n        // Sin preventDefault: el foco vuelve al botón y el navegador\n        // sigue el Tab desde ahí, al siguiente elemento de la página.\n        cerrar()\n        return",
      "nota": "Tab cierra el menú. Al devolver el foco al botón sin cancelar la tecla, el navegador sigue el Tab desde el botón: el foco acaba en lo siguiente de la página, que es lo que pide la APG."
    }
  ]
}
```

Falta una pieza pequeña con una consecuencia grande, en `OpcionMenu`:

```tsx
onClick={() => {
  menu.cerrar()     // 1. se cierra y el foco vuelve al botón «Opciones»
  onSeleccionar()   // 2. la acción, que puede abrir el diálogo
}}
```

**El orden importa.** «Pedir plaza» abre el diálogo, y el diálogo guarda como `anterior` lo que tenga el foco al abrirse. Como `cerrar()` ya ha devuelto el foco al botón, el diálogo guarda el botón, y al cerrarlo el foco vuelve a «Opciones». Al revés, guardaría la opción del menú, que desaparece al cerrarse, y el foco acabaría en `<body>`. En el paso 7 verás que este detalle es justo lo que Radix no te resuelve.

Prueba el teclado del menú. Este ya está en un portal y se abre con un clic; le faltan los atributos, el foco y las teclas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El menú de «Opciones», con teclado",
  "consigna": "Sigue los comentarios numerados de Menu.jsx: el Fragment con las opciones, el foco que vuelve al botón al cerrar, la primera o la última opción enfocada al abrir, aria-haspopup y aria-expanded en el botón, role menu con aria-labelledby, y las teclas (flechas con vuelta, Inicio, Fin y Escape en el menú; flecha abajo y arriba en el botón). Pruébalo sin ratón y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { Menu, OpcionMenu } from './Menu'\nimport './estilos.css'\n\nexport default function App() {\n  const [aviso, setAviso] = useState('')\n  const grupo = 'Alemán B2'\n\n  return (\n    <main>\n      <h1>Escuela de idiomas Puente Nuevo</h1>\n      <article className=\"grupo\">\n        <h2>{grupo}</h2>\n        <Menu etiqueta=\"Opciones\" aria-label={`Opciones de ${grupo}`}>\n          <OpcionMenu onSeleccionar={() => setAviso(`Has pedido plaza en ${grupo}.`)}>Pedir plaza</OpcionMenu>\n          <OpcionMenu onSeleccionar={() => setAviso(`Añadido al calendario: ${grupo}.`)}>\n            Añadir al calendario\n          </OpcionMenu>\n          <OpcionMenu onSeleccionar={() => setAviso(`Te avisaremos si cambia el horario de ${grupo}.`)}>\n            Avisarme si cambia el horario\n          </OpcionMenu>\n        </Menu>\n        <p>Martes y jueves, de 19:30 a 21:00.</p>\n      </article>\n      <p role=\"status\">{aviso}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Menu.jsx",
      "codigo": "import { createContext, use, useEffect, useId, useRef, useState } from 'react'\nimport { createPortal } from 'react-dom'\n\nconst MenuContext = createContext(null)\n\nexport function Menu({ etiqueta, 'aria-label': nombre, children }) {\n  const idBoton = useId()\n  const idMenu = useId()\n  const boton = useRef(null)\n  const menu = useRef(null)\n  // 1. Una ref para un Fragment que envuelva las opciones (children).\n  const [abierto, setAbierto] = useState(null) // null, 'primera' o 'ultima'\n  const [posicion, setPosicion] = useState({ top: 0, left: 0 })\n\n  function abrir(foco) {\n    const caja = boton.current.getBoundingClientRect()\n    setPosicion({ top: caja.bottom + window.scrollY + 4, left: caja.left + window.scrollX })\n    setAbierto(foco)\n  }\n\n  function cerrar() {\n    setAbierto(null)\n    // 2. El foco vuelve al botón.\n  }\n\n  useEffect(() => {\n    if (!abierto) return\n    // 3. Enfoca la primera o la última opción con el Fragment.\n    function pulsarFuera(e) {\n      if (!menu.current.contains(e.target) && !boton.current.contains(e.target)) setAbierto(null)\n    }\n    document.addEventListener('pointerdown', pulsarFuera)\n    return () => document.removeEventListener('pointerdown', pulsarFuera)\n  }, [abierto])\n\n  // 4. Teclas del botón: flecha abajo abre en la primera, flecha arriba en\n  //    la última. Teclas del menú: flechas con vuelta, Inicio, Fin, Escape.\n\n  return (\n    <>\n      {/* 5. aria-haspopup, aria-expanded, aria-controls y onKeyDown */}\n      <button\n        ref={boton}\n        id={idBoton}\n        aria-label={nombre}\n        onClick={() => (abierto ? setAbierto(null) : abrir('primera'))}\n      >\n        {etiqueta}\n      </button>\n      {abierto &&\n        createPortal(\n          // 6. role=\"menu\", aria-labelledby y onKeyDown\n          <div ref={menu} id={idMenu} className=\"menu\" style={posicion}>\n            <MenuContext value={{ cerrar }}>{children}</MenuContext>\n          </div>,\n          document.body,\n        )}\n    </>\n  )\n}\n\nexport function OpcionMenu({ onSeleccionar, children }) {\n  const { cerrar } = use(MenuContext)\n  return (\n    <button\n      role=\"menuitem\"\n      tabIndex={-1}\n      onClick={() => {\n        cerrar()\n        onSeleccionar()\n      }}\n    >\n      {children}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  min-height: 14rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n  color: #0f5c7a;\n}\n\n/* overflow: hidden recorta lo que sobresale: por eso el menú va en un portal */\n.grupo {\n  position: relative;\n  max-width: 18rem;\n  overflow: hidden;\n  padding: 0.75rem 1rem;\n  border: 1px solid #d9e2ec;\n  border-top: 5px solid #c2410c;\n  border-radius: 12px;\n}\n\n.grupo h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.menu {\n  position: absolute;\n  display: grid;\n  min-width: 14rem;\n  padding: 0.3rem;\n  border: 1px solid #cbd2d9;\n  border-radius: 10px;\n  background: white;\n  box-shadow: 0 10px 25px rgb(15 23 42 / 0.2);\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 2px solid #0f5c7a;\n  border-radius: 999px;\n  background: white;\n  color: #0f5c7a;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.menu button {\n  border: none;\n  border-radius: 6px;\n  color: #1f2933;\n  font-weight: 400;\n  text-align: left;\n}\n\n.menu button:focus {\n  background: #e3f1f6;\n}\n\nbutton:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\n[role='status'] {\n  font-weight: 600;\n  color: #2f6f3e;\n}\n"
    }
  ],
  "archivoInicial": "Menu.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Opciones» aparece un menú con el nombre del botón",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        }
      ],
      "espera": {
        "rol": "menu",
        "nombre": "Opciones de Alemán B2"
      }
    },
    {
      "descripcion": "Al abrirlo, el foco está en la primera opción: Intro la elige",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "texto": "Has pedido plaza en Alemán B2."
      }
    },
    {
      "descripcion": "La flecha abajo pasa a la segunda opción",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        },
        {
          "teclear": "{ArrowDown}{Enter}"
        }
      ],
      "espera": {
        "texto": "Añadido al calendario: Alemán B2."
      }
    },
    {
      "descripcion": "La flecha arriba desde la primera da la vuelta hasta la última",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        },
        {
          "teclear": "{ArrowUp}{Enter}"
        }
      ],
      "espera": {
        "texto": "Te avisaremos si cambia el horario de Alemán B2."
      }
    },
    {
      "descripcion": "Fin va a la última opción",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        },
        {
          "teclear": "{End}{Enter}"
        }
      ],
      "espera": {
        "texto": "Te avisaremos si cambia el horario de Alemán B2."
      }
    },
    {
      "descripcion": "Inicio vuelve a la primera",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        },
        {
          "teclear": "{End}{Home}{ArrowDown}{Enter}"
        }
      ],
      "espera": {
        "texto": "Añadido al calendario: Alemán B2."
      }
    },
    {
      "descripcion": "Escape cierra y devuelve el foco al botón: la flecha arriba lo abre en la última opción",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Opciones de Alemán B2"
          }
        },
        {
          "teclear": "{Escape}"
        },
        {
          "teclear": "{ArrowUp}{Enter}"
        }
      ],
      "espera": {
        "texto": "Te avisaremos si cambia el horario de Alemán B2."
      }
    }
  ]
}
```

En tu proyecto, el menú hace además dos cosas que el del ejercicio no: Tab lo cierra y sigue, y se alinea con el borde derecho del botón en vez de con el izquierdo, porque el botón está en la esquina derecha de la tarjeta. Con el paso 4, los 9 tests de `Menu.test.tsx` en verde.

## Paso 5: el combobox (`src/kit/Combobox.tsx`)

El campo «Idioma» es un **combobox con autocompletado de lista**, como el [ejemplo de la APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/): escribes, aparece una lista con lo que coincide, y eliges con el ratón o con las flechas e Intro. Es el más largo de los cuatro, y el único que Radix no tiene (paso 7).

La idea nueva es **`aria-activedescendant`**. En el menú, las flechas movían el foco de verdad de una opción a otra. Aquí no se puede: si el foco saliera del campo, no podrías seguir escribiendo. Así que **el foco del DOM se queda en el `input`**, y el campo dice con `aria-activedescendant` cuál es la opción «enfocada» a efectos del lector de pantalla, que la anuncia como si tuviera el foco. Esa opción lleva `aria-selected="true"`, y de ese atributo sale también su estilo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  // La opción marcada con las flechas: el foco del DOM no se mueve\n  // del campo, se señala con aria-activedescendant.\n  const [activa, setActiva] = useState(-1)\n\n  // Si el campo muestra la opción ya elegida, la lista las enseña todas.\n  const consulta = texto === valor ? '' : normalizar(texto)\n  const filtradas = opciones.filter((opcion) => normalizar(opcion).includes(consulta))\n  const listaVisible = abierto && filtradas.length > 0\n\n  function manejarTeclas(evento: KeyboardEvent<HTMLInputElement>) {\n    const ultima = filtradas.length - 1\n    switch (evento.key) {\n      case 'ArrowDown':\n        setAbierto(true)\n        if (!evento.altKey) setActiva(listaVisible && activa < ultima ? activa + 1 : 0)\n        break\n      case 'ArrowUp':\n        setAbierto(true)\n        setActiva(listaVisible && activa > 0 ? activa - 1 : ultima)\n        break\n      case 'Enter':\n        if (listaVisible && activa >= 0) elegir(filtradas[activa])\n        else if (abierto) cerrarLista()\n        else return\n        break\n      case 'Escape':\n        if (abierto) cerrarLista()\n        else if (texto !== '') {\n          setTexto('')\n          onCambiar(null)\n        } else return // nada que hacer aquí: que siga subiendo (a un diálogo, por ejemplo)\n        evento.stopPropagation()\n        break\n      default:\n        return\n    }\n    evento.preventDefault()\n  }\n\n  // ...\n        <input\n          id={idCampo}\n          type=\"text\"\n          role=\"combobox\"\n          autoComplete=\"off\"\n          aria-autocomplete=\"list\"\n          aria-expanded={listaVisible}\n          aria-controls={idLista}\n          aria-activedescendant={idActiva}\n          aria-describedby={ayuda ? idAyuda : undefined}\n          className=\"kit-combobox-campo\"\n          value={texto}\n          onChange={manejarCambio}\n          onKeyDown={manejarTeclas}\n          onBlur={cerrarLista}\n        />\n        {/* ... el botón ▾ */}\n        <ul\n          id={idLista}\n          role=\"listbox\"\n          aria-label={etiqueta}\n          hidden={!listaVisible}\n          className=\"kit-combobox-lista\"\n          // Sin esto, el mousedown quita el foco al campo, el onBlur cierra\n          // la lista y el clic ya no llega a la opción.\n          onMouseDown={(evento) => evento.preventDefault()}\n        >\n          {filtradas.map((opcion, indice) => (\n            <li\n              key={opcion}\n              id={idOpcion(indice)}\n              role=\"option\"\n              aria-selected={indice === activa}\n              className=\"kit-combobox-opcion\"\n              onClick={() => elegir(opcion)}\n            >\n              {opcion}\n            </li>\n          ))}\n        </ul>",
  "anotaciones": [
    {
      "fragmento": "const [activa, setActiva] = useState(-1)",
      "nota": "El índice de la opción marcada dentro de la lista filtrada, o -1 si no hay ninguna. Escribir lo devuelve a -1: la lista ha cambiado."
    },
    {
      "fragmento": "const consulta = texto === valor ? '' : normalizar(texto)",
      "nota": "Si el campo muestra la opción ya elegida, Alemán, la lista las enseña todas al abrirla. Si no, solo las que contienen lo escrito. normalizar quita tildes y mayúsculas: aleman encuentra Alemán y es encuentra Francés, Inglés y Portugués."
    },
    {
      "fragmento": "if (!evento.altKey) setActiva(listaVisible && activa < ultima ? activa + 1 : 0)",
      "nota": "Flecha abajo abre la lista y marca la siguiente opción, y desde la última, la primera. La APG señala que dar la vuelta viene bien porque Inicio y Fin se quedan para moverse por el texto. Con Alt, solo abre."
    },
    {
      "fragmento": "else if (texto !== '') {\n          setTexto('')\n          onCambiar(null)\n        } else return // nada que hacer aquí: que siga subiendo (a un diálogo, por ejemplo)\n        evento.stopPropagation()",
      "nota": "Escape, como en la APG: con la lista abierta, la cierra; cerrada, vacía el campo. Solo si ha hecho algo para el evento: un combobox vacío dentro de un diálogo deja que Escape cierre el diálogo."
    },
    {
      "fragmento": "aria-activedescendant={idActiva}",
      "nota": "El id de la opción marcada. El foco sigue en el campo y puedes seguir escribiendo; el lector de pantalla anuncia la opción."
    },
    {
      "fragmento": "onBlur={cerrarLista}",
      "nota": "Al salir del campo, la lista se cierra. Tiene una consecuencia con el ratón, que resuelve el onMouseDown de la lista."
    },
    {
      "fragmento": "onMouseDown={(evento) => evento.preventDefault()}",
      "nota": "Pulsar una opción empieza con un mousedown, que por defecto quita el foco al campo; el onBlur cierra la lista y el clic ya no llega a la opción. Cancelando el mousedown, el foco no se mueve y el clic sí llega. En Errores típicos verás que jsdom no se entera de este fallo."
    },
    {
      "fragmento": "aria-selected={indice === activa}",
      "nota": "La opción marcada. En el patrón de la APG, aria-selected va en la opción a la que apunta aria-activedescendant. El CSS la resalta con [aria-selected=true], porque no tiene el foco y :focus no serviría."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Escribes «ale» en el campo «Idioma» y pulsas la flecha abajo.\n// En la lista se ve «Alemán» resaltada y el campo tiene:\n//\n//   <input role=\"combobox\" aria-activedescendant=\"_r_0_-opcion-0\" ...>\n//   <li id=\"_r_0_-opcion-0\" role=\"option\" aria-selected=\"true\">Alemán</li>\n//\n// ¿Qué es document.activeElement en ese momento?",
  "opciones": [
    "El li de «Alemán»: las flechas le han dado el foco",
    "El input: el foco no se ha movido",
    "La lista (el ul con role listbox)",
    "Nadie: el foco está en body"
  ],
  "correcta": 1,
  "explicacion": "Con aria-activedescendant el foco del DOM no se mueve: sigue en el input, y por eso puedes seguir escribiendo. Lo que cambia es a qué opción apunta el campo, y el lector de pantalla la anuncia como enfocada. Es lo que comprueba el test: el campo tiene el foco y su aria-activedescendant es el id de Francés."
}
```

Dos piezas más completan el paso:

- **Una región viva** (`<p role="status">`, lección 37) dice «1 resultado», «3 resultados» o «Sin resultados» mientras la lista está abierta. Está en el DOM desde el principio, vacía, y solo cambia su texto.
- **La opción marcada se trae a la vista** con un efecto: `aria-activedescendant` no desplaza la lista como lo haría el foco, así que si marcas «Ucraniano», la última, hay que hacer `scrollIntoView({ block: 'nearest' })` a mano. Lo dice la propia APG en las notas de su ejemplo. jsdom no implementa `scrollIntoView`, y por eso se llama con `?.`.

## Paso 6: los tests por rol y con axe (`src/pruebas/`)

Los tests de `Pestanas`, `Dialogo`, `Menu` y el de la matrícula completa (`App.test.tsx`) ya estaban escritos, y has ido poniéndolos en verde. Ahora te tocan dos archivos con `it.todo`: los seis tests que faltan de `Combobox.test.tsx` y cuatro de `accesibilidad.test.tsx`. Antes, fíjate en cómo están hechos los que ya tienes, porque los tuyos tienen que seguir las mismas reglas:

- **Todo se busca por rol y nombre**, como lo encontraría un lector de pantalla (lecciones 37 y 83). Si un test no encuentra el diálogo con `getByRole('dialog', { name: ... })`, una persona con un lector tampoco.
- **Todo se hace como lo haría una persona**, con `user-event`: `usuario.tab()`, `usuario.keyboard('{ArrowDown}{Enter}')`, `usuario.click(...)`.
- **Importan de `@kit`**, no de `../kit/Dialogo`: prueban la API del kit, no una carpeta. Es lo que permite el paso 7.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  it('Tab y Mayús+Tab dan la vuelta sin salir del diálogo', async () => {\n    const usuario = await abrir()\n\n    await usuario.tab()\n    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveFocus()\n    await usuario.tab()\n    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()\n    await usuario.tab()\n    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveFocus()\n\n    await usuario.tab({ shift: true })\n    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()\n  })\n\n  it('mientras está abierto, lo de fuera queda oculto para la tecnología de apoyo', async () => {\n    await abrir()\n\n    // hidden: true para encontrarlo aunque esté oculto. Vale inert o aria-hidden.\n    const fuera = screen.getByRole('button', { name: 'Pedir plaza', hidden: true })\n    expect(fuera.closest('[inert], [aria-hidden=\"true\"]')).not.toBeNull()\n  })",
  "anotaciones": [
    {
      "fragmento": "await usuario.tab()\n    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveFocus()",
      "nota": "El diálogo se abrió con el foco en Nombre. Un Tab lleva a Enviar: toHaveFocus comprueba adónde ha ido el foco, que es lo que nota quien usa el teclado."
    },
    {
      "fragmento": "await usuario.tab()\n    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveFocus()",
      "nota": "Desde Cancelar, el último, el Tab pasa por el centinela de salida, que devuelve el foco a Nombre. En jsdom esta trampa es lo único que impide salir: no implementa inert."
    },
    {
      "fragmento": "await usuario.tab({ shift: true })",
      "nota": "Mayús+Tab con user-event. Desde Nombre, el centinela de entrada lleva el foco a Cancelar."
    },
    {
      "fragmento": "const fuera = screen.getByRole('button', { name: 'Pedir plaza', hidden: true })",
      "nota": "hidden: true encuentra el botón aunque esté oculto para la tecnología de apoyo. Sin la opción, con un aria-hidden encima (lo que hace Radix), getByRole no lo encontraría."
    },
    {
      "fragmento": "expect(fuera.closest('[inert], [aria-hidden=\"true\"]')).not.toBeNull()",
      "nota": "Lo de fuera tiene que estar dentro de algo inerte u oculto. Se acepta cualquiera de las dos formas para que el test hable de lo que importa (que el lector no lo vea) y no de cómo se consigue."
    }
  ]
}
```

Para los tuyos del combobox, tres pistas: `toHaveAttribute('aria-activedescendant', opcion.id)` compara con el `id` de la opción que esperas; el campo tiene que seguir con `toHaveFocus()` después de las flechas; y para «sin coincidencias» escribe algo que no sea un idioma y espera `aria-expanded="false"` y «Sin resultados» en el `status`.

Para los de axe, la función que ya está en `accesibilidad.test.tsx` revisa la página entera en el estado en que la dejes:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "/** Las reglas que incumple la página entera, con su explicación. */\nasync function problemas(desactivar: string[] = []) {\n  // jsdom no pinta, así que no puede calcular contrastes: esa regla se\n  // revisa en el navegador (lección 83).\n  const rules = Object.fromEntries(['color-contrast', ...desactivar].map((id) => [id, { enabled: false }]))\n  // document.body y no el container: diálogo y menú viven en portales.\n  const { violations } = await axe(document.body, { rules })\n  return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)\n}\n\ndescribe('axe, en cada estado del kit', () => {\n  it('la página recién cargada', async () => {\n    render(<App />)\n    expect(await problemas()).toEqual([])\n  })\n\n  it('con la lista del combobox abierta y una opción marcada', async () => {\n    const usuario = userEvent.setup()\n    render(<App />)\n    await usuario.clear(screen.getByRole('combobox', { name: 'Idioma' }))\n    await usuario.keyboard('a{ArrowDown}')\n\n    expect(screen.getByRole('listbox')).toBeInTheDocument()\n    expect(await problemas()).toEqual([])\n  })\n\n  it('con otra pestaña activa', async () => {\n    const usuario = userEvent.setup()\n    render(<App />)\n    await usuario.click(screen.getByRole('tab', { name: 'En línea' }))\n\n    expect(await problemas()).toEqual([])\n  })\n\n  it('con un menú abierto', async () => {\n    const usuario = userEvent.setup()\n    render(<App />)\n    await usuario.click(screen.getByRole('button', { name: 'Opciones de Inglés A1 (intensivo)' }))\n\n    expect(screen.getByRole('menu')).toBeInTheDocument()\n    // El menú está en un portal, al final de <body> y fuera de <main>. La\n    // regla «region» (una buena práctica, no un criterio WCAG) cuenta un\n    // diálogo como región, pero no un menú: aquí se desactiva sabiendo por qué.\n    expect(await problemas(['region'])).toEqual([])\n  })",
  "anotaciones": [
    {
      "fragmento": "const { violations } = await axe(document.body, { rules })",
      "nota": "document.body y no el container del render: el diálogo y el menú viven en portales, fuera del container. axe(container) los dejaría sin revisar."
    },
    {
      "fragmento": "['color-contrast', ...desactivar]",
      "nota": "Contraste, desactivado siempre: jsdom no pinta, así que no puede calcularlo (lección 83). Se revisa en el navegador."
    },
    {
      "fragmento": "return violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)",
      "nota": "Una línea por regla incumplida, con su explicación y cuántos elementos la incumplen. Si el test falla, el mensaje dice qué arreglar sin tener que leer el objeto entero de axe."
    },
    {
      "fragmento": "await usuario.click(screen.getByRole('button', { name: 'Opciones de Inglés A1 (intensivo)' }))",
      "nota": "Cada estado se alcanza como lo alcanzaría una persona. axe solo revisa lo que hay en el DOM en ese momento: un menú cerrado no se revisa."
    },
    {
      "fragmento": "expect(await problemas(['region'])).toEqual([])",
      "nota": "Con el menú abierto se desactiva una regla, region, sabiendo por qué: lo explica el párrafo de abajo."
    }
  ]
}
```

**La regla `region` y los portales.** Con el menú abierto, axe 4.14 dice esto:

```text
- Expected
+ Received

- []
+ [
+   "region: All page content should be contained by landmarks (1)",
+ ]
```

Es decir: todo el contenido de la página debería estar dentro de una región (`main`, `nav`, `header`...). El menú está en un portal, al final de `<body>` y fuera de `<main>`. ¿Por qué el diálogo no da el mismo aviso? Porque la regla, en la configuración de axe-core 4.14.0, cuenta como región `dialog, [role=dialog], [role=alertdialog], svg`, y un menú no está en la lista. Es una regla de **buenas prácticas** (`best-practice`), no un criterio WCAG, y un menú flotante que se enfoca al abrirse no deja a nadie perdido. Por eso se desactiva **solo** en ese test y con un comentario que lo explica, no en todos.

Cuando el paso 6 esté hecho, esta es la salida de `npm test` (la ruta del proyecto y las horas, recortadas):

```text
 ✓ src/pruebas/Pestanas.test.tsx (6 tests) 314ms
 ✓ src/pruebas/Menu.test.tsx (9 tests) 356ms
 ✓ src/pruebas/Dialogo.test.tsx (7 tests) 363ms
 ✓ src/pruebas/App.test.tsx (1 test) 362ms
   ✓ La matrícula, de principio a fin y solo con el teclado (1)
     ✓ elige idioma, cambia de modalidad y pide plaza en un grupo 360ms
Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package
 ✓ src/pruebas/Combobox.test.tsx (8 tests) 405ms
Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package
Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package
 ✓ src/pruebas/accesibilidad.test.tsx (5 tests) 728ms

 Test Files  6 passed (6)
      Tests  36 passed (36)
```

Los «Not implemented: HTMLCanvasElement's getContext()» no son fallos de tus tests. axe intenta averiguar con un `canvas` si algún texto es en realidad un icono dibujado con una fuente, jsdom no tiene `canvas` y lo dice por la consola. El resultado no cambia.

## Paso 7: la comparación con Radix

Ya tienes un kit que pasa sus tests. Ahora, la pregunta de la lección 80 con datos: **¿qué te habría ahorrado Radix?** La forma de medirlo sin trampas es hacer con Radix **los mismos componentes, con la misma API**, y pasar los **mismos tests**. Gracias al alias `@kit`, ni la página ni los tests se enteran del cambio.

1. Instala Radix, con la versión exacta: `npm install radix-ui@1.8.1`.
2. Crea `src/radix/` con tres archivos que imiten la API de tu kit (`Dialogo.tsx`, `Menu.tsx`, `Pestanas.tsx`) y un `index.ts`.
3. Añade dos scripts a `package.json`:

```json
"test:radix": "vitest run --mode radix",
"build:radix": "tsc -b && vite build --mode radix"
```

Estos son el menú y las pestañas con Radix. Compáralos con los tuyos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { DropdownMenu } from 'radix-ui'\nimport type { ReactNode } from 'react'\n\ntype PropsMenu = {\n  etiqueta: string\n  'aria-label'?: string\n  children: ReactNode\n}\n\nexport function Menu({ etiqueta, 'aria-label': nombre, children }: PropsMenu) {\n  return (\n    <DropdownMenu.Root>\n      <DropdownMenu.Trigger className=\"kit-menu-boton\" aria-label={nombre}>\n        {etiqueta}\n      </DropdownMenu.Trigger>\n      <DropdownMenu.Portal>\n        <DropdownMenu.Content className=\"kit-menu\" align=\"end\" sideOffset={4}>\n          {children}\n        </DropdownMenu.Content>\n      </DropdownMenu.Portal>\n    </DropdownMenu.Root>\n  )\n}\n\ntype PropsOpcionMenu = {\n  onSeleccionar: () => void\n  children: ReactNode\n}\n\nexport function OpcionMenu({ onSeleccionar, children }: PropsOpcionMenu) {\n  return (\n    <DropdownMenu.Item className=\"kit-menu-opcion\" onSelect={onSeleccionar}>\n      {children}\n    </DropdownMenu.Item>\n  )\n}\n\ntype PropsPestanas = {\n  etiqueta: string\n  pestanas: Pestana[]\n  inicial?: string\n}\n\nexport function Pestanas({ etiqueta, pestanas, inicial = pestanas[0]?.id }: PropsPestanas) {\n  return (\n    <Tabs.Root defaultValue={inicial} className=\"kit-pestanas\">\n      <Tabs.List aria-label={etiqueta} className=\"kit-pestanas-lista\">\n        {pestanas.map((p) => (\n          <Tabs.Trigger key={p.id} value={p.id} className=\"kit-pestana\">\n            {p.titulo}\n          </Tabs.Trigger>\n        ))}\n      </Tabs.List>\n      {pestanas.map((p) => (\n        <Tabs.Content key={p.id} value={p.id} className=\"kit-pestanas-panel\">\n          {p.contenido}\n        </Tabs.Content>\n      ))}\n    </Tabs.Root>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<DropdownMenu.Trigger className=\"kit-menu-boton\" aria-label={nombre}>",
      "nota": "El botón. Radix le pone type, aria-haspopup, aria-expanded, aria-controls, data-state y el teclado. El nombre accesible sigue siendo cosa tuya: Radix no puede saber de qué grupo son estas opciones."
    },
    {
      "fragmento": "<DropdownMenu.Portal>",
      "nota": "El portal, ya incluido. Y la colocación: Content se coloca solo junto al botón, con Floating UI por debajo, y se da la vuelta si no cabe."
    },
    {
      "fragmento": "align=\"end\" sideOffset={4}",
      "nota": "Alineado al final del botón y a 4 píxeles, como el tuyo. Sin medir nada a mano."
    },
    {
      "fragmento": "<DropdownMenu.Item className=\"kit-menu-opcion\" onSelect={onSeleccionar}>",
      "nota": "Cada opción, con role menuitem, foco itinerante y onSelect, que se llama con clic, Intro o la barra espaciadora. El menú se cierra solo después."
    },
    {
      "fragmento": "<Tabs.Root defaultValue={inicial} className=\"kit-pestanas\">",
      "nota": "Las pestañas de la lección 80: el useId, los roles, aria-controls, aria-labelledby y el teclado vienen dentro. Las clases son las mismas que las del kit, así que el CSS sirve para las dos versiones."
    }
  ]
}
```

`index.ts` reexporta los tres y, como **Radix no tiene combobox** (lección 80: ni en radix-ui 1.8.1 ni en sus paquetes sueltos), sigue usando el tuyo:

```ts
// La misma API que src/kit, hecha con Radix. Con --mode radix, '@kit'
// apunta aquí (vite.config.ts) y la app y los tests no se enteran.
import '../kit/kit.css'

// Radix no tiene combobox: se queda el tuyo.
export { Combobox } from '../kit/Combobox'
export { Dialogo } from './Dialogo'
export { Menu, OpcionMenu } from './Menu'
export { Pestanas } from './Pestanas'
export type { Pestana } from '../kit/Pestanas'
```

### Primera pasada: 28 de 36

Con esos tres archivos tal cual, `npm run test:radix`:

```text
 ✓ src/pruebas/Pestanas.test.tsx (6 tests)
 ❯ src/pruebas/Dialogo.test.tsx (7 tests | 3 failed)
   ❯ Dialogo (7)
     × cerrado no está; abierto es un diálogo modal con nombre y descripción
     ✓ al abrirse, el foco entra en el primer control
     ✓ Tab y Mayús+Tab dan la vuelta sin salir del diálogo
     ✓ mientras está abierto, lo de fuera queda oculto para la tecnología de apoyo
     × Escape cierra y el foco vuelve al botón que lo abrió
     × un botón de dentro también lo cierra y devuelve el foco
     ✓ pulsar en el fondo lo cierra; pulsar dentro, no
 ✓ src/pruebas/Combobox.test.tsx (8 tests)
 ❯ src/pruebas/App.test.tsx (1 test | 1 failed)
   ❯ La matrícula, de principio a fin y solo con el teclado (1)
     × elige idioma, cambia de modalidad y pide plaza en un grupo
 ❯ src/pruebas/Menu.test.tsx (9 tests | 4 failed)
   ❯ Menu (9)
     ✓ el botón anuncia que abre un menú, y si está abierto
     ✓ Intro abre el menú y enfoca la primera opción
     × flecha arriba abre el menú en la última opción
     × las flechas recorren las opciones y dan la vuelta; Inicio y Fin van a los extremos
     ✓ Escape cierra el menú y devuelve el foco al botón
     ✓ Intro en una opción la elige, cierra el menú y devuelve el foco
     × Tab cierra el menú y sigue al siguiente elemento de la página
     ✓ con el ratón: se abre con un clic y se elige con otro
     × un clic fuera lo cierra sin elegir nada
 ✓ src/pruebas/accesibilidad.test.tsx (5 tests)

 Test Files  3 failed | 3 passed (6)
      Tests  8 failed | 28 passed (36)
```

(Entre los resultados verás también algún aviso «An update to ForwardRef(RovingFocusGroupImpl) inside a test was not wrapped in act(...)»: es Radix actualizando su estado interno cuando el test ya ha terminado de teclear. No hace fallar nada; `act` lo viste en la lección 83.)

**8 rojos.** Antes de tocar nada, lee cada uno: un test que falla con otra implementación es o un fallo de la implementación, o una diferencia de criterio, o un test mal escrito. Aquí hay de los dos primeros; uno de lo tercero ya se corrigió antes de esta pasada (lo verás en Errores típicos). Agrupados:

**Dos se arreglan configurando Radix**, porque la opción existe y está apagada por defecto:

- **Las flechas no dan la vuelta.** En `DropdownMenu.Content`, `loop` vale `false` por defecto (lo dice la tabla de props de su documentación). Con `loop`, como en tu kit.
- **El foco no vuelve al botón que abrió el diálogo** (dos tests del diálogo). La documentación de Radix lo dice en su tabla de teclado: Escape «cierra el diálogo y mueve el foco a `Dialog.Trigger`». Tu diálogo no tiene `Dialog.Trigger`, porque lo abre un estado desde fuera (desde un menú, en la página), así que el foco se va a `<body>`. Hay que guardar tú quién tenía el foco con `onOpenAutoFocus` y devolverlo con `onCloseAutoFocus`.

**Uno es la consecuencia del anterior al combinar piezas**: el test de la matrícula completa, que abre el diálogo desde «Pedir plaza». Lo verás en el código de abajo.

**Cuatro son decisiones de Radix que se apartan de cómo está hecho tu kit**, y no hay opción que las cambie:

- **Su diálogo no lleva `aria-modal`.** Oculta todo lo demás con `aria-hidden` (usa el paquete `aria-hidden`), en vez de marcar el diálogo como modal. El test de «lo de fuera queda oculto» sí pasa, porque acepta las dos formas.
- **La flecha arriba en el botón no abre el menú.** Su tabla de teclado solo abre con la barra espaciadora, Intro y la flecha abajo. En la APG, la flecha arriba es opcional.
- **Tab no cierra el menú.** Su código lo cancela dentro del menú (`if (event.key === "Tab") event.preventDefault()`, en `@radix-ui/react-menu` 2.2.1), así que el menú se queda abierto y el foco dentro. La APG dice que Tab cierra el menú y sigue.
- **Con el menú abierto, lo de fuera no se puede pulsar.** Su menú es modal por defecto y pone `pointer-events: none` en el `body`. `user-event` se niega a hacer un clic que una persona no podría hacer: «Unable to perform pointer interaction as the element has `pointer-events: none`». En el navegador, el primer clic fuera solo cierra el menú y no llega a lo que hay debajo.

### El diálogo, configurado

Así queda el diálogo de Radix después de arreglar el foco, también cuando se abre desde un menú:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useRef } from 'react'\nimport { Dialog } from 'radix-ui'\nimport type { ReactNode } from 'react'\n\ntype PropsDialogo = {\n  abierto: boolean\n  onCerrar: () => void\n  titulo: string\n  descripcion?: string\n  children: ReactNode\n}\n\nexport function Dialogo({ abierto, onCerrar, titulo, descripcion, children }: PropsDialogo) {\n  // Radix devuelve el foco a su Dialog.Trigger. Aquí no hay Trigger (el\n  // diálogo se abre desde un menú), así que se guarda quién tenía el foco.\n  const anterior = useRef<Element | null>(null)\n\n  function recordarFoco() {\n    const activo = document.activeElement\n    // El menú de Radix devuelve el foco a su botón un instante después de\n    // cerrarse: cuando el diálogo se abre, el foco aún está en la opción,\n    // que va a desaparecer. El que abrió el diálogo es el botón del menú.\n    const menu = activo?.closest('[role=\"menu\"]')\n    anterior.current = menu ? document.getElementById(menu.getAttribute('aria-labelledby') ?? '') : activo\n  }\n\n  return (\n    <Dialog.Root open={abierto} onOpenChange={(abrir) => !abrir && onCerrar()}>\n      <Dialog.Portal>\n        <Dialog.Overlay className=\"kit-dialogo-fondo\">\n          <Dialog.Content\n            className=\"kit-dialogo\"\n            // Sin descripción, Radix avisa en la consola salvo que se diga así.\n            {...(descripcion ? {} : { 'aria-describedby': undefined })}\n            onOpenAutoFocus={recordarFoco}\n            onCloseAutoFocus={(evento) => {\n              evento.preventDefault()\n              if (anterior.current instanceof HTMLElement) anterior.current.focus()\n            }}\n          >\n            <Dialog.Title className=\"kit-dialogo-titulo\">{titulo}</Dialog.Title>\n            {descripcion && <Dialog.Description className=\"kit-dialogo-descripcion\">{descripcion}</Dialog.Description>}\n            {children}\n          </Dialog.Content>\n        </Dialog.Overlay>\n      </Dialog.Portal>\n    </Dialog.Root>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const anterior = useRef<Element | null>(null)",
      "nota": "Lo mismo que hace tu diálogo con su const anterior, pero en una ref, porque aquí el momento de guardarlo lo marca Radix."
    },
    {
      "fragmento": "const menu = activo?.closest('[role=\"menu\"]')",
      "nota": "El caso del menú. El de Radix devuelve el foco a su botón un instante después de cerrarse (con un setTimeout), así que cuando el diálogo se abre, el foco aún está en la opción «Pedir plaza», que va a desaparecer. Se comprobó: al cerrar, esa opción ya no estaba en el documento y el foco acababa en body."
    },
    {
      "fragmento": "document.getElementById(menu.getAttribute('aria-labelledby') ?? '')",
      "nota": "Un menú se llama como su botón (aria-labelledby), así que de la opción se llega al botón que abrió el menú. Es el que de verdad abrió el diálogo."
    },
    {
      "fragmento": "onOpenAutoFocus={recordarFoco}",
      "nota": "Radix avisa justo antes de meter el foco dentro: es el momento de mirar quién lo tenía."
    },
    {
      "fragmento": "onCloseAutoFocus={(evento) => {\n              evento.preventDefault()",
      "nota": "Al cerrar, Radix intentaría enfocar su Dialog.Trigger, que no existe. preventDefault cancela eso, y el foco se devuelve a mano."
    },
    {
      "fragmento": "<Dialog.Overlay className=\"kit-dialogo-fondo\">\n          <Dialog.Content",
      "nota": "El contenido dentro del fondo, como en tu kit, para que el mismo CSS lo centre. Pulsar el fondo cierra: para Radix es un clic fuera del contenido."
    }
  ]
}
```

Con `loop` en el menú y este diálogo, `npm run test:radix` da **32 de 36**. Los 4 rojos que quedan son las cuatro decisiones de Radix de arriba. No hay que «arreglarlos»: son el resultado de la comparación, y cada uno te dice exactamente en qué se aparta Radix de tu kit y de la APG.

### Lo que cuesta, medido

- **Código.** Tus tres componentes suman **288 líneas** (sin comentarios ni líneas en blanco): `Dialogo` 69, `Menu` 134 y `Pestanas` 85. Las versiones con Radix, **96**: 39, 32 y 25, y 12 de las 39 del diálogo son el arreglo del foco. El combobox, 146 líneas, no tiene equivalente.
- **Peso.** `npm run build` genera un JavaScript de 72,29 kB comprimido con gzip (230,61 kB sin comprimir), en 24 módulos. `npm run build:radix`, **101,64 kB** (319,14 kB), en 125 módulos: **29,35 kB más**. La mayoría de los 72 kB son React; los componentes del kit pesan poco.
- **Dependencias.** `npm install radix-ui` añadió **74 paquetes**: `radix-ui`, 60 de `@radix-ui/*`, cuatro de `@floating-ui/*` (la colocación), `react-remove-scroll` con sus cinco ayudantes (el bloqueo del scroll), `aria-hidden` y `tslib`.

### Lo que hace y tu kit no, medido

En jsdom, con el menú o el diálogo de Radix abiertos, los hijos de `<body>` quedan así: `span[aria-hidden="true" data-radix-focus-guard] div[aria-hidden="true"] div span[aria-hidden="true" data-radix-focus-guard]`, y `<body>` lleva `style="pointer-events: none;"` y `data-scroll-locked="1"`. Con tu kit, el diálogo deja `div[inert] div`, y el menú no toca nada más. En Chromium, con una ventana de 1280 × 760 píxeles:

- **Coloca el menú donde cabe.** Con el botón de «Opciones» entre los píxeles 612 y 654 de alto, tu menú se abre debajo, del 658 al 805, por debajo del borde de la ventana. El de Radix se abre encima, del 461 al 608.
- **Bloquea el scroll del fondo** con el menú y con el diálogo abiertos (`overflow: hidden` en `body`). El tuyo no.
- **Busca escribiendo.** Con su menú abierto, la tecla «a» lleva a «Añadir al calendario» y otra «a» a «Avisarme si cambia el horario». Es el *typeahead* opcional de la APG.
- **Y lo que no se ha medido aquí** y su documentación incluye: submenús, opciones con casilla o de opción única, atributos `data-state` para animar la entrada y la salida, `asChild` (lección 80) y lectura de derecha a izquierda.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Lo que te ahorra",
      "texto": "Dos tercios del código de tres componentes, y casi todo lo difícil de un menú: colocarlo donde cabe, el typeahead, los submenús, el bloqueo del scroll. Y el mantenimiento: los casos raros de cada navegador y lector los arregla otro."
    },
    {
      "titulo": "Lo que te cuesta",
      "texto": "Unos 29 kB comprimidos y 74 paquetes en este proyecto, y aceptar sus decisiones: sin aria-modal, Tab que no sale del menú, clics de fuera que no llegan. Puedes estar de acuerdo con ellas, pero tienes que saber que existen."
    },
    {
      "titulo": "Lo que no te ahorra",
      "texto": "Los nombres accesibles (aria-label en cada «Opciones»), el foco cuando combinas piezas (el diálogo que se abre desde un menú), los tests y cualquier componente que no tenga, como el combobox."
    },
    {
      "titulo": "Lo que te llevas de haberlo hecho a mano",
      "texto": "Entender por qué cada test de Radix falla, y poder decidir. Sin el paso 3, el foco que se perdía al cerrar el diálogo sería un fallo misterioso de la librería."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Menu.test.tsx, en su primera versión, con '@kit' apuntando a Radix:\nconst boton = () => screen.getByRole('button', { name: 'Opciones de Alemán B1' })\n\nawait usuario.tab()\nawait usuario.keyboard('{Enter}') // abre el menú de Radix\n\nexpect(boton()).toHaveAttribute('aria-expanded', 'true')\n\n// ¿Qué pasa en la última línea?",
  "opciones": [
    "Pasa: Radix pone aria-expanded=\"true\" en el botón",
    "Falla: aria-expanded vale \"false\" porque el menú no se ha abierto",
    "Falla: getByRole no encuentra el botón",
    "Falla: hay dos botones con ese nombre"
  ],
  "correcta": 2,
  "explicacion": "Radix sí pone aria-expanded=\"true\", pero con el menú abierto oculta todo lo demás con aria-hidden, también el botón que lo abre, y getByRole no encuentra elementos ocultos: «Unable to find an accessible element with the role \"button\" and name \"Opciones de Alemán B1\"». La solución, válida para los dos kits, es tomar la referencia del botón antes de abrir el menú."
}
```

## Errores típicos

**1. Devolver el foco antes de quitar `inert`.** En la limpieza del diálogo, si inviertes las dos líneas, el botón al que devuelves el foco todavía está dentro de `#root`, que es inerte, y no lo acepta. Comprobado en Chromium: con `inert` puesto, `boton.focus()` deja el foco en `BODY`; después de quitarlo, en `BUTTON`. El diálogo se cierra y el foco no vuelve a ningún sitio, justo lo que la APG pide evitar. Es el mismo problema del `flushSync` de la lección 36, resuelto aquí por el orden de dos líneas.

**2. Cerrar con `onClick` en el fondo.** Parece lo mismo que `onMouseDown`, y no lo es. Si alguien selecciona con el ratón un texto del diálogo y suelta el botón fuera de la ventana, el `click` se dispara en el antepasado común de donde apretó y de donde soltó, que es el fondo: `e.target === e.currentTarget` y el diálogo se cierra. Comprobado en Chromium con un fondo con `onClick`: tras seleccionar un párrafo y soltar fuera, el diálogo ya no estaba. Con `onMouseDown`, lo que cuenta es dónde se aprieta.

**3. Fiarse de jsdom con el ratón.** Quita el `onMouseDown={(evento) => evento.preventDefault()}` de la lista del combobox y pasa los tests: «con el ratón, un clic en una opción la elige» **sigue en verde**. En Chromium, en cambio, pulsar «Gallego» deja el campo con lo que habías escrito, «g». En el navegador, el `click` va a lo que hay bajo el puntero al soltar, y la lista ya se ha cerrado; `user-event`, en cambio, lanza el `click` sobre el elemento que le pasas, esté visible o no. Un test en verde dice que no has roto lo que comprueba, no que el navegador se comporte igual. Prueba el kit a mano, con ratón y con teclado, al menos una vez.

**4. Buscar un portal dentro de `container`.** `render` devuelve el `container` donde montó el componente, y el diálogo no está ahí:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const { container } = render(\n  <Dialogo abierto onCerrar={() => {}} titulo=\"Hola\">\n    <button>Vale</button>\n  </Dialogo>,\n)\n\nconsole.log(\n  Boolean(screen.queryByRole('dialog')),\n  Boolean(within(container).queryByRole('dialog')),\n)\n// ¿Qué imprime?",
  "opciones": [
    "true true",
    "true false",
    "false true",
    "false false"
  ],
  "correcta": 1,
  "explicacion": "screen busca en todo document.body, y el portal pinta el diálogo como hijo de body: lo encuentra. container es solo el div donde se montó el componente, y el diálogo no está dentro. Se ejecutó así: true false. Lo mismo pasa con axe(container), que dejaría el diálogo sin revisar: por eso los tests de axe del kit revisan document.body."
}
```

**5. Escribir los ids a mano.** Un `id="panel-intensivo"` funciona mientras haya un solo grupo de pestañas en la página, que es justo cuando no lo pruebas. Lo viste en el paso 1: el segundo panel toma el nombre de la pestaña del otro grupo. Si un componente del kit pone un `id`, sale de `useId`.

**6. Un test que depende de cómo está hecha la librería.** Es el de la última pregunta del paso 7: el test buscaba el botón **después** de abrir el menú, y eso solo funciona si nadie oculta el botón mientras tanto. No era un fallo de Radix, era el test. Con la referencia tomada antes de abrir, el test comprueba lo mismo y vale para los dos kits. Cuando cambies una implementación por otra y algo se ponga en rojo, pregúntate primero qué está comprobando ese test de verdad.

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm test, en verde, y npm run build, sin errores?",
      "texto": "Los 36 tests, con los diez que escribiste tú en el paso 6. El build pasa también por tsc: un tipo mal en un test lo para."
    },
    {
      "titulo": "¿Toda la matrícula, sin tocar el ratón?",
      "texto": "Elige idioma con las flechas, pasa a las pestañas con Tab, cambia de modalidad, abre un menú, pide plaza, recorre el diálogo con Tab y Mayús+Tab y envía. Al final, el foco tiene que estar en el botón de «Opciones» de ese grupo."
    },
    {
      "titulo": "¿Y con un lector de pantalla?",
      "texto": "En macOS, VoiceOver se enciende con Comando + F5; en Windows, NVDA es gratuito. Escucha cómo se anuncian el diálogo, la opción marcada del combobox y el número de resultados."
    },
    {
      "titulo": "¿Lo has probado con el ratón en el navegador?",
      "texto": "Elige un idioma de la lista con un clic, abre y cierra un menú pulsando fuera, y selecciona un texto del diálogo soltando fuera. Son los casos que jsdom no ve."
    }
  ]
}
```

## Retos para ampliarlo

1. **Typeahead en el menú.** Que una letra lleve a la siguiente opción que empieza por ella, como el de Radix. Pista: compara con `normalizar` el texto de cada `menuitem`, empezando por el que va después del que tiene el foco.
2. **Bloquear el scroll del fondo** mientras el diálogo está abierto, en el mismo `useLayoutEffect`. Guarda el `overflow` que tenía `body` y devuélvelo en la limpieza. ¿Qué pasa con la anchura de la página cuando desaparece la barra de desplazamiento?
3. **Un menú que se abre hacia arriba si no cabe.** En `abrir`, compara `caja.bottom` más la altura del menú con `window.innerHeight`. ¿Cómo sabes la altura del menú antes de pintarlo? (Pista: lección 45.)
4. **El combobox con React Aria.** Haz `src/aria/` con el `ComboBox` de `react-aria-components` (lección 80) y un tercer modo en `vite.config.ts`. ¿Cuántos de los 8 tests del combobox pasan sin tocarlos?
5. **El kit en Storybook.** El reto más largo, con su propia sección justo debajo.

## Reto final: el kit en Storybook

Este reto no tiene ningún `TODO` en el repositorio: lo montas tú sobre tu kit terminado, y si algo se tuerce, lo deshaces sin perder nada. **Storybook** es un taller de componentes: una web aparte, solo para desarrollo, donde cada pieza del kit se ve sola y en cada uno de sus estados, sin la página de matrícula alrededor. Es la «guía de estilo viva» que viste nombrada en la lección 23. Y, de paso, te da una segunda red de accesibilidad que tus tests de jsdom no pueden tender.

### Qué es una historia

Una **historia** (*story*) es un estado con nombre de un componente: el combobox vacío, con ayuda, con la lista abierta, sin resultados. Las historias de un componente van en un archivo `*.stories.tsx`, junto a él, escrito en **CSF** (*Component Story Format*), que no es más que un módulo de JavaScript:

- El `export default` es la ficha del componente (en la documentación, `meta`): qué componente es, dónde sale en el catálogo y sus props por defecto, que Storybook llama `args`.
- Cada `export` con nombre es una historia, que cambia los `args` que quiera: `export const ConAyuda: Story = { args: { ayuda: '…' } }`.
- Una historia puede llevar un `play`: una función que se ejecuta después de pintarla, teclea y pulsa con las mismas consultas por rol de Testing Library, y comprueba con `expect`. Así se llega a los estados que solo existen después de teclear, como la lista abierta.

### Montarlo con el asistente

En la carpeta `kit-accesible/`, con el proyecto en verde:

```bash
npm create storybook@latest
```

El asistente detecta React con Vite y hace dos preguntas: si eres nuevo en Storybook (con «sí», te deja historias de ejemplo y un recorrido guiado) y qué configuración quieres. Elige **Recommended**, que trae documentación, tests y accesibilidad. Lo probamos con Storybook 10.6.4 sobre una copia del kit terminado, con esas respuestas pero sin preguntas (`npm create storybook@10.6.4 -- --yes --features docs test a11y`), y esto es lo que cambió:

- **`.storybook/main.ts`**: dónde están las historias y qué complementos se cargan: `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs` y `@chromatic-com/storybook`.
- **`.storybook/preview.tsx`**: la configuración común a todas las historias.
- **Dos scripts**: `npm run storybook`, que abre el catálogo en `http://localhost:6006`, y `npm run build-storybook`, que lo construye como una web estática.
- **`vite.config.ts` pasa a tener dos proyectos de Vitest**: tus 36 tests de siempre, con jsdom, y uno nuevo llamado `storybook`, que convierte cada historia en un test y la ejecuta en un Chromium de verdad, con Playwright. El asistente descarga ese navegador.
- **`src/stories/`**, con historias de ejemplo (`Button`, `Header` y `Page`). Míralas y bórralas.

Tres retoques para dejarlo a la altura del resto del proyecto:

- El asistente instala `@chromatic-com/storybook` y `playwright` con la versión `latest`. Cámbialas por las exactas que se instalaron, que están en `package-lock.json`.
- Cada `npm test` sale con un aviso de Vite sobre el `__dirname` que el asistente escribió en `vite.config.ts`. Cámbialo por `import.meta.dirname`, como propone el propio aviso, y desaparece.
- Al borrar `src/stories/`, sale otro: «No story files found for the specified pattern: src/**/*.mdx». `main.ts` busca también páginas de documentación en MDX y ya no queda ninguna: quita ese patrón.

### Las historias del combobox

En `src/kit/Combobox.stories.tsx`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useState } from 'react'\nimport type { Meta, StoryObj } from '@storybook/react-vite'\nimport { expect, fn } from 'storybook/test'\nimport { Combobox } from '@kit'\nimport { IDIOMAS } from '../datos'\n\nconst meta = {\n  title: 'Kit/Combobox',\n  component: Combobox,\n  args: {\n    etiqueta: 'Idioma',\n    opciones: IDIOMAS,\n    valor: null,\n    onCambiar: fn(),\n  },\n  // El combobox es controlado: la historia guarda el valor, como haría App.\n  render: function Historia(args) {\n    const [valor, setValor] = useState(args.valor)\n    return (\n      <Combobox\n        {...args}\n        valor={valor}\n        onCambiar={(nuevo) => {\n          setValor(nuevo)\n          args.onCambiar(nuevo)\n        }}\n      />\n    )\n  },\n} satisfies Meta<typeof Combobox>\n\nexport default meta\ntype Story = StoryObj<typeof meta>\n\nexport const Inicial: Story = {}\n\nexport const ConAyuda: Story = {\n  args: { ayuda: 'Escribe para filtrar: «ale» encuentra Alemán.' },\n}\n\nexport const ConValor: Story = {\n  args: { valor: 'Portugués' },\n}\n\nexport const ListaAbierta: Story = {\n  play: async ({ canvas, userEvent }) => {\n    const campo = canvas.getByRole('combobox', { name: 'Idioma' })\n    await userEvent.type(campo, 'es')\n    await userEvent.keyboard('{ArrowDown}{ArrowDown}')\n    const frances = canvas.getByRole('option', { name: 'Francés' })\n    await expect(campo).toHaveFocus()\n    await expect(campo).toHaveAttribute('aria-activedescendant', frances.id)\n    await expect(canvas.getByRole('status')).toHaveTextContent('6 resultados')\n  },\n}\n\nexport const SinResultados: Story = {\n  play: async ({ canvas, userEvent }) => {\n    await userEvent.type(canvas.getByRole('combobox', { name: 'Idioma' }), 'klingon')\n    await expect(canvas.getByRole('status')).toHaveTextContent('Sin resultados')\n  },\n}",
  "anotaciones": [
    {
      "fragmento": "import type { Meta, StoryObj } from '@storybook/react-vite'",
      "nota": "Los tipos vienen del paquete del framework, react-vite. Las utilidades para probar (fn y expect), de storybook/test."
    },
    {
      "fragmento": "import { Combobox } from '@kit'",
      "nota": "De @kit, como los tests: así llega también kit.css, que importa index.ts. Y con --mode radix, las historias prueban la otra versión del kit."
    },
    {
      "fragmento": "title: 'Kit/Combobox',",
      "nota": "Dónde sale en la barra lateral: en la carpeta Kit, con el nombre Combobox."
    },
    {
      "fragmento": "onCambiar: fn(),",
      "nota": "fn() es una función espía: cada llamada sale en el panel Actions, y un play puede comprobar con qué se la llamó."
    },
    {
      "fragmento": "render: function Historia(args) {",
      "nota": "El combobox es controlado: alguien tiene que guardar el valor. La historia hace de App con un useState, en una función con nombre en mayúscula, como cualquier componente que usa Hooks (lección 44)."
    },
    {
      "fragmento": "} satisfies Meta<typeof Combobox>",
      "nota": "satisfies comprueba que la ficha encaja con Meta sin perder su tipo exacto, y StoryObj<typeof meta> lo aprovecha: sabe qué args ya tienen valor, y no te obliga a repetirlos en cada historia. Por eso Inicial puede ser un objeto vacío."
    },
    {
      "fragmento": "play: async ({ canvas, userEvent }) => {",
      "nota": "Se ejecuta después de pintar la historia. canvas tiene las consultas de Testing Library, limitadas a la historia, y userEvent teclea y pulsa como en tus tests."
    },
    {
      "fragmento": "await expect(campo).toHaveAttribute('aria-activedescendant', frances.id)",
      "nota": "Lo mismo que comprueba Combobox.test.tsx, ahora en Chromium: el foco sigue en el campo y aria-activedescendant apunta a Francés, la segunda de las seis opciones que contienen «es». Si algo falla, el panel Interactions te dice en qué paso."
    }
  ]
}
```

### Las del diálogo

En `src/kit/Dialogo.stories.tsx`. El diálogo se pinta en un portal, y eso se nota también aquí:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useState } from 'react'\nimport type { Meta, StoryObj } from '@storybook/react-vite'\nimport { expect, fn, screen } from 'storybook/test'\nimport { Dialogo } from '@kit'\n\nconst meta = {\n  title: 'Kit/Dialogo',\n  component: Dialogo,\n  args: {\n    abierto: true,\n    onCerrar: fn(),\n    titulo: 'Pedir plaza en Alemán B2 (extensivo)',\n    descripcion: 'Martes y jueves, de 18:00 a 20:00. Te escribiremos para confirmarla.',\n    children: (\n      <form>\n        <label>\n          Nombre y apellidos <input name=\"nombre\" autoComplete=\"name\" />\n        </label>\n        <button type=\"submit\">Enviar solicitud</button>\n      </form>\n    ),\n  },\n} satisfies Meta<typeof Dialogo>\n\nexport default meta\ntype Story = StoryObj<typeof meta>\n\n// El diálogo va en un portal, fuera del lienzo de la historia: se busca con screen.\nexport const Abierto: Story = {\n  play: async () => {\n    await expect(await screen.findByRole('dialog', { name: /Pedir plaza/ })).toBeVisible()\n    await expect(screen.getByRole('textbox', { name: 'Nombre y apellidos' })).toHaveFocus()\n  },\n}\n\nexport const SinDescripcion: Story = {\n  name: 'Sin descripción',\n  args: { descripcion: undefined },\n}\n\nexport const DevuelveElFoco: Story = {\n  args: { abierto: false },\n  render: function Historia(args) {\n    const [abierto, setAbierto] = useState(args.abierto)\n    return (\n      <>\n        <button type=\"button\" onClick={() => setAbierto(true)}>\n          Pedir plaza\n        </button>\n        <Dialogo\n          {...args}\n          abierto={abierto}\n          onCerrar={() => {\n            setAbierto(false)\n            args.onCerrar()\n          }}\n        />\n      </>\n    )\n  },\n  play: async ({ canvas, userEvent, args }) => {\n    const boton = canvas.getByRole('button', { name: 'Pedir plaza' })\n    await userEvent.click(boton)\n    await userEvent.keyboard('{Escape}')\n    await expect(args.onCerrar).toHaveBeenCalled()\n    await expect(boton).toHaveFocus()\n  },\n}",
  "anotaciones": [
    {
      "fragmento": "children: (",
      "nota": "Los args también pueden ser JSX: aquí, el formulario que va dentro del diálogo."
    },
    {
      "fragmento": "await expect(await screen.findByRole('dialog', { name: /Pedir plaza/ })).toBeVisible()",
      "nota": "El diálogo está en un portal, fuera del lienzo de la historia, y canvas no lo encontraría. screen, de storybook/test, busca en todo el documento. Es el error típico 4 de este proyecto, que aquí también existe."
    },
    {
      "fragmento": "await expect(screen.getByRole('textbox', { name: 'Nombre y apellidos' })).toHaveFocus()",
      "nota": "Al abrirse, el foco entra en el primer campo: el Fragment del paso 3."
    },
    {
      "fragmento": "name: 'Sin descripción',",
      "nota": "El nombre de una historia sale del export: SinDescripcion se vería como «Sin Descripcion». name lo cambia, aquí para ponerle la tilde."
    },
    {
      "fragmento": "args: { abierto: false },",
      "nota": "Esta empieza cerrada y la abre un botón, como en la página. Así se puede comprobar adónde vuelve el foco."
    },
    {
      "fragmento": "await expect(args.onCerrar).toHaveBeenCalled()\n    await expect(boton).toHaveFocus()",
      "nota": "Escape llama a onCerrar y el foco vuelve al botón que abrió el diálogo. Comprobado en Chromium, donde inert existe de verdad, y no en jsdom."
    }
  ]
}
```

Con `npm run storybook` las tienes en la barra lateral, dentro de «Kit», y bajo cada historia, sus paneles: «Controls» para cambiar sus `args` a mano, «Interactions» con cada paso del `play` y «Accessibility». En la terminal, cada historia es un test. Esta es la salida de `npx vitest run --project=storybook --reporter=verbose`, recortada:

```text
 ✓ |storybook (chromium)| src/kit/Dialogo.stories.tsx > Abierto
 ✓ |storybook (chromium)| src/kit/Dialogo.stories.tsx > Sin descripción
 ✓ |storybook (chromium)| src/kit/Dialogo.stories.tsx > Devuelve El Foco
 ✓ |storybook (chromium)| src/kit/Combobox.stories.tsx > Inicial
 ✓ |storybook (chromium)| src/kit/Combobox.stories.tsx > Con Ayuda
 ✓ |storybook (chromium)| src/kit/Combobox.stories.tsx > Con Valor
 ✓ |storybook (chromium)| src/kit/Combobox.stories.tsx > Lista Abierta
 ✓ |storybook (chromium)| src/kit/Combobox.stories.tsx > Sin Resultados

 Test Files  2 passed (2)
      Tests  8 passed (8)
```

### La segunda red: el complemento de accesibilidad

`@storybook/addon-a11y` pasa **axe** a cada historia, el mismo motor de tu `accesibilidad.test.tsx` (en la copia de prueba, axe-core 4.14.0 en los dos). En el panel «Accessibility» lo ves en tres pestañas, «Violations», «Passes» e «Inconclusive»: el diálogo abierto da 0 problemas y 24 comprobaciones superadas. Y en el proyecto `storybook` de Vitest, cada historia es también un test de accesibilidad: axe la revisa cuando termina su `play`.

¿No lo hacían ya tus tests? Solo en parte. Corren en jsdom, que no pinta, y por eso desactivan siempre la regla `color-contrast` (paso 6). Las historias corren en Chromium, y ahí axe sí calcula el contraste. Para verlo, aclara el gris de `kit.css` (`--kit-suave: #9aa5b1;` en vez de `#52606d`) y pasa `npm test`, que ahora ejecuta los dos proyectos. Recortada, la salida es esta:

```text
 ❯ |storybook (chromium)| src/kit/Dialogo.stories.tsx (3 tests | 1 failed)
   × Abierto
 ❯ |storybook (chromium)| src/kit/Combobox.stories.tsx (5 tests | 2 failed)
   × Con Ayuda
   × Sin Resultados

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |storybook (chromium)| src/kit/Combobox.stories.tsx > Con Ayuda
Error:
Click to debug the error directly in Storybook: http://localhost:6006/?path=/story/kit-combobox--con-ayuda&addonPanel=storybook/interactions/panel

expect(received).toHaveNoViolations(expected)

Expected the HTML found at $('#_r_1_-ayuda') to have no violations:

<p id="_r_1_-ayuda" class="kit-combobox-ayuda">Escribe para filtrar: «ale» encuentra Alemán.</p>

Received:

"Elements must meet minimum color contrast ratio thresholds (color-contrast)"

Fix any of the following:
  Element has insufficient color contrast of 2.5 (foreground color: #9aa5b1, background color: #ffffff, font size: 10.8pt (14.4px), font weight: normal). Expected contrast ratio of 4.5:1

You can find more information on this issue here:
https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=axeAPI

(…)

 Test Files  2 failed | 6 passed (8)
      Tests  3 failed | 41 passed (44)
```

Es decir: el texto de ayuda tiene un contraste de 2,5 a 1 con el fondo, y para un texto de ese tamaño el mínimo es 4,5 a 1 (criterio 1.4.3 de las WCAG). **Los 36 tests de jsdom siguen en verde**, y caen las tres historias que pintan texto con ese gris: «Con Ayuda», «Sin Resultados» y el diálogo «Abierto». La de «Sin Resultados» enseña cuándo mira axe: ese texto no existe hasta que el `play` teclea.

**Una línea que tienes que cambiar tú.** El asistente deja en `.storybook/preview.tsx` `a11y: { test: 'todo' }`, y con `'todo'` los problemas de accesibilidad solo salen como avisos en la interfaz de Storybook: con el mismo gris, `npx vitest run --project=storybook` da 8 de 8 en verde. Para que paren la terminal y la integración continua, pon `'error'`:

```tsx
a11y: {
  // 'todo' - show a11y violations in the test UI only
  // 'error' - fail CI on a11y violations
  // 'off' - skip a11y checks entirely
  test: 'error'
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos redes, cada una con su hueco",
  "roles": [
    {
      "etiqueta": "Tests con jsdom",
      "rol": "La primera red: rápida",
      "descripcion": "Roles, nombres, teclado y foco de la página entera, y axe sobre document.body. Sin contraste, porque jsdom no pinta. Son tus 36 tests."
    },
    {
      "etiqueta": "Historias en Chromium",
      "rol": "La segunda red: lo que se ve",
      "descripcion": "Cada estado de cada componente en un navegador de verdad, con su contraste, su inert y su maqueta. Más lenta, porque arranca un navegador."
    }
  ]
}
```

Lo que no cambia: `npm run build` genera el mismo JavaScript que antes, 72,29 kB comprimido, porque las historias no entran en la aplicación (y `tsc -b` también las revisa). Y como importan de `@kit`, `npm run test:radix` las pasa contra Radix: siguen saliendo los 4 rojos del paso 7, todos de jsdom, y las 8 historias en verde.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/kit-accesible (rama main, punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo, con los TODO y los tests ya puestos.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/kit-accesible",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/kit-accesible (rama solucion)",
      "descripcion": "El kit terminado, los 36 tests y la versión con Radix del paso 7.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/kit-accesible",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "WAI-ARIA APG: patrones",
      "descripcion": "El índice de los patrones de la APG. Los de este proyecto son Dialog (Modal), Menu Button, Menu and Menubar, Tabs y Combobox, cada uno con su teclado, sus roles y ejemplos.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/",
      "etiqueta": "W3C"
    },
    {
      "titulo": "APG: Editable Combobox With List Autocomplete",
      "descripcion": "El ejemplo del que sale el combobox del kit: tabla de teclado completa, aria-activedescendant y por qué hay que traer a la vista la opción marcada.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/",
      "etiqueta": "W3C"
    },
    {
      "titulo": "<Fragment>",
      "descripcion": "La referencia oficial de la ref en Fragment: FragmentInstance, focus, focusLast y el resto de sus métodos.",
      "url": "https://react.dev/reference/react/Fragment",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Radix Primitives: Dropdown Menu",
      "descripcion": "Las props de cada parte (loop, modal, onCloseAutoFocus) y la tabla de teclado con la que se comparó el menú del kit.",
      "url": "https://www.radix-ui.com/primitives/docs/components/dropdown-menu",
      "etiqueta": "Radix"
    },
    {
      "titulo": "vitest-axe",
      "descripcion": "La función axe para Vitest que usan los tests de accesibilidad del proyecto.",
      "url": "https://github.com/chaance/vitest-axe",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "inert",
      "descripcion": "El atributo que deja una parte de la página sin foco, sin clics y fuera del árbol de accesibilidad.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert",
      "etiqueta": "MDN"
    }
  ]
}
```

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Para el reto de Storybook",
  "recursos": [
    {
      "titulo": "Install Storybook",
      "descripcion": "El asistente, sus preguntas, la configuración Recommended y qué cambia en tu proyecto.",
      "url": "https://storybook.js.org/docs/get-started/install",
      "etiqueta": "Storybook"
    },
    {
      "titulo": "How to write stories",
      "descripcion": "Historias en CSF: la ficha del componente, una historia por estado, args y render.",
      "url": "https://storybook.js.org/docs/writing-stories",
      "etiqueta": "Storybook"
    },
    {
      "titulo": "Play function",
      "descripcion": "Interactuar con una historia después de pintarla, con canvas, userEvent y screen para lo que sale en un portal.",
      "url": "https://storybook.js.org/docs/writing-stories/play-function",
      "etiqueta": "Storybook"
    },
    {
      "titulo": "Accessibility tests",
      "descripcion": "El complemento addon-a11y, sus opciones de axe y los modos todo, error y off con Vitest.",
      "url": "https://storybook.js.org/docs/writing-tests/accessibility-testing",
      "etiqueta": "Storybook"
    }
  ]
}
```
