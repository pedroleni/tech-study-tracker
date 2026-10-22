# React: nueva tecnología + React real en el navegador (`react-en-vivo`)

**Estado:** ✅ fases 0 y 1 implementadas, verificadas e integradas en
`main` el 2026-10-20 (PR #55): 476 tests, revisión independiente de todo
el trabajo y verificación con React 19.3.1 real en Chromium. Pendiente:
probar a mano en Firefox y Safari (ver "Pendiente" al final). ✅ Fase 2
(árbol de renders y árbol estático) en `main` (PR #56). 🔨 Fase 3 (API
simulada, registro de efectos y almacenamiento) especificada abajo, en
construcción. La fase 4 queda descrita a nivel de diseño en el temario.

**Configuración manual requerida:** ninguna en Supabase (`technologies`
y `lecciones` no ganan columnas). La tecnología "React" se crea desde el
admin cuando exista el primer borrador de lección, no antes, para no
publicar una ficha vacía. `vercel.json` gana una regla de caché para los
ficheros de `public/vendor/react-en-vivo/` (va en el propio repo, no hace falta
tocar el panel de Vercel).

## Por qué existe esta feature

El temario de React está aprobado
([contenido/react/TEMARIO.md](../../contenido/react/TEMARIO.md), 98
entradas). Igual que SQL ejecuta consultas reales con sql.js y Git
ejecuta comandos reales con wasm-git, las lecciones de React necesitan
**React de verdad**: el alumno escribe componentes, hace clic y ve cómo
responden, con los avisos reales de React y ejercicios que se comprueban
solos. `editor-en-vivo` no sirve: ejecuta HTML/CSS/JS tal cual, sin
React ni JSX.

Decisiones de alcance confirmadas por el usuario (aprobación del
temario completo y "tus recomendaciones", 2026-10-20):

1. Pareja de bloques `react-en-vivo` (practicar) + `react-anotado`
   (explicar), con el motor real.
2. Ejercicios con ✅/❌ (comprobaciones), varios archivos por bloque y
   "ver el JavaScript generado", todo en la fase 1.
3. React servido desde el propio dominio, nunca desde un CDN.
4. Construcción por fases; la primera tanda de lecciones (módulos 1-4)
   empieza cuando las fases 0 y 1 estén verificadas.

## Validación (2026-10-20)

Antes de fijar el diseño se probó todo lo arriesgado en una prueba
aislada (scratchpad: script Node + Playwright con Chromium real, sin
mocks), con un ejemplo de dos componentes, un CSS importado, un efecto,
una lista sin `key` y un error de render provocado:

| Qué se probó | Resultado |
|---|---|
| React 19.3.1 (build de desarrollo, empaquetado como IIFE con esbuild) dentro de un iframe `sandbox="allow-scripts allow-forms"` con `srcdoc`, cargado como `<script src>` clásico desde el origen de la web | Funciona desde el origen opaco del iframe, sin CORS. Minificado: **427 KB / 127 KB gzip**. Montaje en ~50 ms con el script ya en caché |
| Transformar JSX con el compilador de TypeScript que ya carga la web | **8,9 MB / 1,6 MB gzip**: inasumible en cada lección de React |
| Transformar JSX con [Sucrase](https://github.com/alangpierce/sucrase) 3.35.1 | **201 KB / 46 KB gzip**. Conserva los números de línea del original. **Elegido** |
| Varios archivos (`import Tarjeta from './Tarjeta'`) y CSS importado (`import './estilos.css'`) | Funciona con un registro de módulos tipo CommonJS dentro del iframe; Sucrase convierte `import` en `require` |
| `StrictMode` | Visible tal cual: render doble en la consola y efecto montar → limpiar → montar |
| Avisos de React | Capturados y formateados: *"Each child in a list should have a unique "key" prop. Check the render method of \`App\`..."* |
| Contar commits | Un `__REACT_DEVTOOLS_GLOBAL_HOOK__` mínimo recibe `onCommitFiberRoot` en cada commit (base de la consola agrupada y del árbol de la fase 2) |
| Error de render | `createRoot(..., { onUncaughtError })` lo recibe. Evaluando cada módulo con `new Function` + `//# sourceURL=App.jsx`, la pila dice `App.jsx:17:32` para un `throw` en la línea 15: **desfase constante de +2** por el envoltorio de `new Function` |
| Comprobaciones con Testing Library 10.4.2 + user-event 14.6.8 dentro del iframe | Escriben y pulsan de verdad. Bundle: **244 KB / 56 KB gzip**, solo se carga si el bloque tiene comprobaciones |
| Trampa 1 de Testing Library | `screen` se ata a `document.body` **al cargar el script**; cargado en `<head>`, el body aún no existe y nada se encuentra. Solución validada: `within(document.body)` en el momento de comprobar |
| Trampa 2: `getByRole('listitem', { name: 'Comprar pan' })` | No encuentra nada, y es lo correcto: en ARIA una fila de lista no toma su nombre de su contenido. El esquema ofrece `{ rol, texto }` para eso |
| Comprobar sin estropear la vista previa | Las comprobaciones se ejecutan en un **segundo iframe fuera de pantalla** (renderizado y enfocable, no `display: none`): 110 ms, y lo que el alumno tenía escrito en la vista previa queda intacto |
| "Ver el JavaScript generado" | Sucrase en modo producción, solo transformación `jsx`: `import {jsx as _jsx} from "react/jsx-runtime"; … _jsx('li', { className: "tarjeta", children: texto})`, que es lo que produce Vite en un build real |

**No validado, con mitigación:**

- **Extensión React DevTools instalada.** Puede inyectar su propio
  `__REACT_DEVTOOLS_GLOBAL_HOOK__` en el iframe antes que el nuestro. Si
  ya existe un hook, el puente **encadena** su `onCommitFiberRoot` en vez
  de sustituirlo.
- **Bucle infinito en el código del alumno.** Puede congelar la pestaña.
  Es el mismo riesgo que ya acepta `editor-en-vivo`; no se mitiga en
  estas fases.

## Decisiones de diseño

1. **Sucrase transforma el JSX**, cargado con `import()` dinámico solo
   cuando la lección tiene un bloque de React. El compilador de
   TypeScript solo se cargará para `lenguaje: 'tsx'` con diagnósticos de
   tipos (módulo 10 del temario, fase posterior).
2. **React desde `public/vendor/react-en-vivo/19.3.1/`**, nunca desde un CDN
   (esm.sh, unpkg, jsDelivr): los cortes judiciales de LaLiga bloquean
   IPs de Cloudflare durante los partidos, no se depende de un tercero en
   cada lección y la versión queda fijada. La web sigue en React 19.2.4;
   el sandbox lleva su propio React, construido por un paquete aislado
   (`scripts/react-en-vivo/`, con su `package.json` y su lockfile,
   versiones exactas) que no toca las dependencias de la web.
3. **Build de desarrollo minificado**: trae los avisos que enseñan
   (`key`, reglas de los hooks, `use()` condicional) sin el peso del
   build sin minificar (822 KB).
4. **Registro de módulos CommonJS** dentro del iframe (`require`,
   `module.exports`), sin import maps ni URLs `blob:`. Cada módulo se
   evalúa con `new Function('require', 'module', 'exports', código)` y su
   `//# sourceURL` para que las pilas de error nombren el archivo.
5. **Comprobaciones en un iframe oculto nuevo** cada vez que se pulsa
   "Comprobar": aislamiento total entre ejercicios (también del estado a
   nivel de módulo) sin tocar la vista previa.
6. **Montaje automático:** `App.jsx` debe existir y exportar por defecto
   un componente; el runtime lo monta con `createRoot`, dentro de
   `StrictMode` si el bloque lo pide. El `createRoot` manual (lección 3)
   se enseña con bloques estáticos.
7. **Solo se puede importar** `react`, `react-dom`, `react-dom/client`,
   `react/jsx-runtime`, `react/jsx-dev-runtime` y los archivos del propio
   bloque. Cualquier otra cosa da un error claro en español.
8. **Fase 1 solo admite JSX.** TSX llega con el módulo 10.
9. **`<base href="about:srcdoc">`** en el documento del iframe: sin él,
   un `srcdoc` hereda la URL de la página y un `<a href="#">` cargaba la
   propia web dentro de la vista previa (el mismo bug que `EditorEnVivo`
   ya tenía corregido). Añadido tras la revisión final.
10. **Compilación previa sin ejecutar.** Sucrase deja pasar lo que solo
    rechaza el motor al compilar (un `const` repetido, `await` fuera de
    una función `async`). `transformarArchivos` compila cada módulo con
    `new Function` en la página, **sin llamarlo nunca**, para dar el
    mismo "Error de sintaxis en Tarjeta.jsx: …" y conservar la última
    vista previa válida. Un `EvalError` (una CSP futura sin
    `'unsafe-eval'`) no es un error del alumno y se deja pasar.

## Alcance de la fase 0

### Resaltador: modos `jsx` y `tsx`

`src/components/codigo/resaltador.ts`: `Lenguaje` pasa a
`'html' | 'css' | 'js' | 'jsx' | 'tsx' | 'sql' | 'texto'`.

- **`jsx`** = el tokenizador de JavaScript + etiquetas JSX. Dentro de una
  etiqueta: nombre (`etiqueta`, incluidos `Componente` y `Lista.Item`),
  atributos (`atributo`), valores entre comillas (`cadena`) o entre
  llaves (JavaScript completo, que puede contener más JSX). Fragmentos
  `<>` y `</>`. Entre etiquetas: texto hijo (`texto`) y expresiones
  `{...}` (JavaScript). Las llaves se emparejan con un contador de
  profundidad que respeta cadenas y comentarios.
- **Cuándo `<` abre JSX:** solo en posición de expresión, es decir,
  cuando el último token significativo (sin contar espacios ni
  comentarios) no es un identificador, un número, `)` ni `]`, y el
  carácter siguiente es una letra, `>` o `/`. Así `a < b`,
  `useState<string>('')` y `f<T>(x)` no se confunden con JSX, mientras
  `return <div>`, `(<Lista />)`, `x && <p>` o `=> <li>` sí abren JSX.
- **`tsx`** = `jsx` + palabras clave de TypeScript (`interface`, `type`,
  `enum`, `implements`, `private`, `public`, `protected`, `readonly`,
  `keyof`, `satisfies`, `declare`, `namespace`, `abstract`, `is`,
  `infer`, `unique`).
- **Invariante de siempre:** concatenar el texto de todos los tokens
  devuelve exactamente la entrada, también con código a medio escribir
  (una etiqueta sin cerrar, una llave sin pareja).

### Esquemas

En `src/lib/laboratorio/schemas.ts`, `lenguaje` de `codigo-anotado` y de
`predice-el-resultado` pasa de `z.literal('html').default('html')` a
`z.enum(['html', 'jsx', 'tsx']).default('html')`. Los bloques existentes
(todos sin `lenguaje` o con `"html"`) siguen validando igual.
`CodigoAnotado` y `PrediceElResultado` ya pasan `lenguaje` a
`CodigoResaltado`; solo cambia el tipo.

### Catálogo de referencia

`/admin/referencia-contenido` gana un ejemplo de `codigo-anotado` con
`lenguaje: "jsx"`.

## Alcance de la fase 1

### Esquemas

```ts
// Roles que admiten las comprobaciones. Lista cerrada: un error de
// tipeo en el JSON de una lección falla al validar, no al comprobar.
const ROLES_COMPROBACION = [
  'button', 'link', 'heading', 'textbox', 'searchbox', 'checkbox', 'radio',
  'switch', 'combobox', 'listbox', 'option', 'list', 'listitem', 'dialog',
  'alert', 'status', 'tab', 'tabpanel', 'img', 'navigation', 'main',
  'region', 'table', 'row', 'cell', 'menu', 'menuitem', 'progressbar',
  'slider', 'spinbutton',
] as const

const textoCorto = z.string().min(1).max(120)

// Cómo encontrar un elemento, siempre como lo encontraría una persona:
// por su texto, por su rol (y nombre accesible o texto), o por la
// etiqueta de un campo. Objetos estrictos a propósito: sin ellos,
// { etiqueta, valor } encajaría en la variante { etiqueta } y Zod
// descartaría `valor` en silencio.
const esquemaConsultaElemento = z.union([
  z.strictObject({ texto: textoCorto }),
  z.strictObject({
    rol: z.enum(ROLES_COMPROBACION),
    nombre: textoCorto.optional(),
    texto: textoCorto.optional(),
  }),
  z.strictObject({ etiqueta: textoCorto }),
])

const esquemaPasoComprobacion = z.union([
  z.strictObject({ escribir: z.strictObject({ etiqueta: textoCorto, texto: z.string().max(200) }) }),
  z.strictObject({ pulsar: esquemaConsultaElemento }),
  // Sintaxis de teclado de user-event: "{Enter}", "{Escape}", "hola{Enter}"
  z.strictObject({ teclear: z.string().min(1).max(60) }),
  z.strictObject({ seleccionar: z.strictObject({ etiqueta: textoCorto, opcion: textoCorto }) }),
])

const esquemaEsperaComprobacion = z.union([
  esquemaConsultaElemento,
  // Que algo ya NO esté (p. ej. tras borrar una tarea)
  z.strictObject({ ausente: esquemaConsultaElemento }),
  // El valor actual de un campo (p. ej. vacío tras añadir)
  z.strictObject({ etiqueta: textoCorto, valor: z.string().max(200) }),
])

const esquemaComprobacionReact = z.object({
  descripcion: z.string().min(1).max(160),
  pasos: z.array(esquemaPasoComprobacion).max(10).default([]),
  espera: esquemaEsperaComprobacion,
})

const esquemaArchivoReact = z.object({
  nombre: z.string().regex(/^[A-Za-z][A-Za-z0-9-]*\.(jsx|css)$/),
  codigo: z.string().max(4000),
})

export const esquemaReactEnVivo = z
  .object({
    tipo: z.literal('react-en-vivo'),
    titulo: z.string().min(1).max(140).optional(),
    consigna: z.string().min(1).max(600).optional(),
    archivos: z.array(esquemaArchivoReact).min(1).max(6),
    archivoInicial: z.string().optional(),
    strictMode: z.boolean().default(true),
    mostrarConsola: z.boolean().default(true),
    mostrarJsGenerado: z.boolean().default(false),
    comprobaciones: z.array(esquemaComprobacionReact).min(1).max(8).optional(),
  })
  .refine((d) => d.archivos.some((a) => a.nombre === 'App.jsx'), {
    message: 'react-en-vivo necesita un archivo App.jsx',
  })
  .refine((d) => new Set(d.archivos.map((a) => a.nombre)).size === d.archivos.length, {
    message: 'Los nombres de archivo no pueden repetirse',
  })
  .refine((d) => !d.archivoInicial || d.archivos.some((a) => a.nombre === d.archivoInicial), {
    message: 'archivoInicial debe ser uno de los archivos',
  })

export const esquemaReactAnotado = z.object({
  tipo: z.literal('react-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  // App.jsx: un único archivo, como sql-anotado tiene una única consulta
  codigo: z.string().min(1).max(4000),
  css: z.string().max(4000).default(''),
  anotaciones: z
    .array(z.object({ fragmento: z.string().min(1), nota: z.string().min(1).max(500) }))
    .min(1)
    .max(8),
  strictMode: z.boolean().default(true),
  mostrarConsola: z.boolean().default(false),
})
```

Los dos se añaden a la unión discriminada `esquemaBloqueLaboratorio`,
con sus tipos `DatosReactEnVivo` y `DatosReactAnotado`.

### Runtime (`public/vendor/react-en-vivo/19.3.1/`)

- `react.js`: `react`, `react-dom`, `react-dom/client`,
  `react/jsx-runtime` y `react/jsx-dev-runtime` 19.3.1, build de
  desarrollo, IIFE minificado que expone `window.__reactEnVivo = { React,
  ReactDOM, ReactDOMClient, JsxRuntime, JsxDevRuntime }`.
- `pruebas.js`: `@testing-library/dom` 10.4.2 + `@testing-library/user-event`
  14.6.8, IIFE minificado que expone `window.__pruebasEnVivo = { ...dom,
  userEvent }`.
- Van en `public/vendor/` porque son código de terceros empaquetado: los
  escáneres de seguridad del repo excluyen `vendor` (como
  `node_modules`). En `public/react-en-vivo/` el código de React disparaba
  falsos HIGH (`dangerouslySetInnerHTML`, `innerHTML`, `Math.random`).
- Los dos conservan los avisos de licencia MIT al final
  (`legalComments: 'eof'`).
- Los construye `scripts/react-en-vivo/construir.mjs` (esbuild), desde
  `scripts/react-en-vivo/package.json` + `package-lock.json` con
  versiones exactas. Se ejecuta a mano solo al cambiar de versión de
  React; la salida se commitea, como `public/ts-libs/`.
- `vercel.json`: cabecera `Cache-Control: public, max-age=31536000,
  immutable` para `/vendor/react-en-vivo/(.*)`. Es seguro porque la versión va
  en la ruta: una versión nueva es una ruta nueva.
- `eslint.config.js`: `public/vendor` en `ignores`, como
  `public/ts-libs`.

### Motor (`src/lib/react-en-vivo/`)

- **`transformar.ts`**: carga Sucrase con `import()` y expone
  `transformarArchivos(archivos)` (cada `.jsx` con las transformaciones
  `jsx` + `imports`, runtime automático, modo desarrollo y `filePath`
  para la información de origen; los `.css` se juntan) y
  `transformarParaMostrar(archivos)` (solo `jsx`, modo producción: el
  código que enseña la pestaña "JavaScript generado"). Un error de
  sintaxis se devuelve como `{ ok: false, archivo, linea, mensaje }`,
  nunca como excepción.
- **`runtime/puente.js` y `runtime/montaje.js`**: el JavaScript que corre
  dentro del iframe, en archivos `.js` de verdad que la web importa como
  texto (`?raw`), no como cadenas dentro de TypeScript: así no hay que
  escapar nada a mano (en la validación, un `\n` mal escapado dentro de
  una plantilla rompió el montaje) y los tests los ejecutan en jsdom.
  - **Puente** (antes de cargar React): hook mínimo de DevTools
    (encadenado si ya existe uno), captura de `console.log/info/warn/error`
    con formato de `%s`, `%d`, `%i`, `%o`, `%O` y `%c`, errores globales y
    aviso de altura con `ResizeObserver`. Todo sale por
    `parent.postMessage({ canal: 'react-en-vivo', ... }, '*')`.
  - **Montaje**: lee `window.__configReactEnVivo = { modulos,
    archivosCss, strictMode }`; registro de módulos, resolución de
    `./Nombre` a `./Nombre.jsx`, errores claros ("No encuentro el archivo
    «./Tarjta»", "En este editor solo se puede importar React y tus
    propios archivos..."), `createRoot` con `onUncaughtError`, y el
    ejecutor de comprobaciones (solo escucha mensajes cuyo `source` sea
    `parent`).
- **`documento.ts`**: `construirDocumentoReact({ origen, css, modulos,
  archivosCss, strictMode, conPruebas })` recibe el código ya
  transformado y devuelve el `srcdoc`, en este orden: CSS en un
  `<style>`, el puente, `<script src="{origen}/vendor/react-en-vivo/19.3.1/react.js">`
  (y `pruebas.js` si `conPruebas`), `<div id="root">`, la configuración
  como JSON (con `<` escapado como `\u003c`, para que el código del
  alumno no pueda cerrar el `<script>`) y el montaje.
- **`mensajes.ts`**: esquema Zod de los mensajes iframe → página (abajo)
  y la función `leerMensajeReactEnVivo(evento, ventanaEsperada)` que
  devuelve el mensaje validado o `null`.

Mensajes iframe → página (`canal: 'react-en-vivo'`):

| `tipo` | Campos | Uso |
|---|---|---|
| `montado` | `version` | La vista previa está lista |
| `alto` | `alto` (número) | Altura del iframe, igual que `editor-en-vivo` |
| `commit` | `numero` | Separadores "— commit N —" en la consola |
| `consola` | `nivel` (`log`/`info`/`warn`/`error`), `texto` (≤ 2000), `commit` | Panel de consola |
| `error-render` | `texto`, `archivo?`, `linea?` | Recuadro de error en la vista previa |
| `error` | `texto` | Errores fuera del render (eventos, módulos) |
| `progreso-comprobaciones` | `resultado: { descripcion, ok, motivo? }` | Uno por comprobación terminada: reinicia el plazo de inactividad y guarda el resultado parcial |
| `resultado-comprobaciones` | `resultados: { descripcion, ok, motivo? }[]` (≤ 8) | ✅/❌ |

Mensaje página → iframe oculto: `{ canal: 'react-en-vivo', tipo:
'comprobar', comprobaciones }`, con las comprobaciones ya validadas del
JSON de la lección.

La línea de un error se calcula en el iframe: primer marco de
`error.stack` con forma `Nombre.jsx:L:C`, menos 2.

### Componentes (`src/components/bloques-laboratorio/`)

- **`VistaPreviaReact.tsx`**: el iframe (`sandbox="allow-scripts
  allow-forms"`, `title="Vista previa de React"`), la escucha de mensajes
  con `leerMensajeReactEnVivo`, la altura (mismos límites que
  `editor-en-vivo`: 160-2400 px) y el recuadro de error de render.
  Expone por callback los mensajes de consola y de commit.
- **`ConsolaReact.tsx`**: lista de entradas con su nivel (color + texto,
  nunca solo color), separadores de commit, botón "Limpiar", máximo 200
  entradas (descarta las más antiguas), `role="log"`.
- **`ResultadosComprobaciones.tsx`**: ✅/❌ por comprobación con su
  descripción y, si falla, el motivo; resumen "3 de 4 comprobaciones
  superadas"; región `aria-live="polite"`. Mismos colores e iconos
  (`CircleCheck`/`CircleX`) que `SqlEnVivo`.
- **`ReactEnVivo.tsx`**: misma cabecera y estructura que `EditorEnVivo`
  (icono, eyebrow "React en vivo", título, consigna, botón "Reiniciar").
  Pestañas por archivo (más "JavaScript generado" si
  `mostrarJsGenerado`), editor CodeMirror (`javascript({ jsx: true })`
  para `.jsx`, `css()` para `.css`), vista previa que se reconstruye 400
  ms después de la última tecla, consola si `mostrarConsola`, botón
  "Comprobar" si hay `comprobaciones`. "Comprobar" crea un iframe oculto
  nuevo (fuera de pantalla, `aria-hidden`, `tabindex="-1"`) con el
  código actual, envía `comprobar` solo con el **primer** `montado`,
  pinta los resultados y elimina el iframe. Un segundo `montado` es que
  el documento se recargó (casi siempre un formulario sin
  `e.preventDefault()`): termina con "La vista previa se recargó durante
  la comprobación…" en vez de entrar en un bucle de recargas. El plazo de
  15 s es de **inactividad**, no total: cada `progreso-comprobaciones`
  lo reinicia; si se agota, muestra "La comprobación tardó demasiado.
  Revisa si tu código se queda en un bucle." junto con las comprobaciones
  que sí terminaron. El botón usa `aria-disabled` (no `disabled`, que
  pierde el foco) y devuelve el foco al terminar; "Reiniciar" remonta
  la vista previa aunque el código no haya cambiado. Un error de sintaxis se muestra bajo el editor
  ("Error de sintaxis en App.jsx, línea 3: ...") y la vista previa se
  queda en el último resultado válido, como hace `EditorEnVivo` con
  TypeScript.
- **`ReactAnotado.tsx`**: el código con `CodigoResaltado` en
  `lenguaje="jsx"` y las anotaciones, con la misma presentación que
  `CodigoAnotado`; debajo, la vista previa ejecutando ese código de
  verdad, y la consola si `mostrarConsola`.
- **`registro.ts`**: `'react-en-vivo': ReactEnVivo`,
  `'react-anotado': ReactAnotado`.

### Catálogo de referencia y documentación

- `/admin/referencia-contenido`: un `ReactAnotado` (lista con `key`) y
  un `ReactEnVivo` con dos archivos, CSS, consola, JavaScript generado y
  dos comprobaciones.
- `specs/features/laboratorios.md`: los dos tipos nuevos en la lista de
  bloques.

## Alcance de la fase 2: árbol de renders y árbol estático

Diseño aprobado con el temario (componentes 5 y 7). Desbloquea la
revisión de las lecciones 13, 16–19 y 25–28, y parte del módulo 9.

### Validación (2026-10-20)

Prueba aislada en jsdom con el `react.js` 19.3.1 del sandbox: un hook de
DevTools propio recorre `root.current` en cada `onCommitFiberRoot`, con
`App` (dos estados) → proveedor de contexto `Tema` → `Cabecera`, dos
`Tarea` con `key` y una prop función, `Contador` con estado propio, `Pie`
con `memo` y `Etiqueta` que lee el contexto.

| Qué se probó | Resultado |
|---|---|
| Montaje | Todos los nodos `montado`, con sus estados (`[["a","b"],"claro"]`, `[0]`) |
| Pulsar el contador | **Solo** `Contador` re-renderizado ("cambió su estado"); los demás, sin cambios. El subárbol saltado se detecta porque `fiber.child` es el mismo objeto que en el commit anterior |
| Añadir una tarea | `App` (estado), `Tarea key=c` montada, las otras `Tarea` "cambió la prop «alPulsar» (función nueva)", `Cabecera`/`Contador`/`Etiqueta` "se renderizó su padre", **`Pie` (memo) sin cambios** |
| Cambiar el contexto | `Etiqueta`: "cambió el contexto «Tema»" (sale repetido en `dependencies` con `StrictMode`: hay que quitar duplicados) |
| Contadores de render | Correctos por instancia, con un id estable por pareja fiber/alternate |
| Nombre de los nodos | `type.displayName ?? type.name`; `forwardRef` → `type.render.name`; proveedor → `displayName` del contexto |

Hechos de los internos usados (React 19.3.1, build de desarrollo):
etiquetas de fiber `0` función, `1` clase, `10` proveedor de contexto,
`11` forwardRef, `13` Suspense, `14` memo con comparador, `15` memo
simple; flag `PerformedWork = 1`; ganchos en `fiber.memoizedState`
encadenados por `next`, y los de estado (`useState`, `useReducer`) son
los que tienen `queue` con `dispatch` y `lastRenderedReducer`; contextos
leídos en `fiber.dependencies.firstContext` (`context`,
`memoizedValue`, `next`).

### Esquemas

- `react-en-vivo` y `react-anotado` ganan `mostrarArbol:
  z.boolean().default(false)`.
- Bloque nuevo **`arbol-de-componentes`** (estático, lo escribe el autor):

```ts
{
  tipo: 'arbol-de-componentes',
  titulo?: string (1–140),
  nodos: {                          // 1–40, en orden de recorrido
    nombre: string (1–60),          // "App", "Tarea"
    nivel: entero 0–8,              // el primero 0; cada uno ≤ anterior + 1
    clave?: string (1–40),          // se pinta "key=…"
    estado?: 'montado' | 'renderizado' | 'sin-cambios' | 'desmontado',
    etiqueta?: string (1–40),       // insignia: "estado: tareas", "cliente"
    nota?: string (1–160),          // texto a la derecha: "← aquí vive el estado"
  }[],                              // objetos estrictos
}
```

### Runtime: `src/lib/react-en-vivo/runtime/arbol.js`

Archivo `.js` de verdad importado con `?raw`, como el puente y el
montaje. Solo se incluye en el documento de la **vista previa visible**
de un bloque con `mostrarArbol` (nunca en el iframe de las
comprobaciones), entre `react.js` y el montaje. Define
`window.__arbolReactEnVivo(raiz)`; el puente lo llama desde su
`onCommitFiberRoot` (también cuando encadena el hook de la extensión
React DevTools) pasándole el `FiberRoot`.

En cada commit:

1. **Recorrido** de `raiz.current` emparejando cada fiber con su
   anterior (`fiber.alternate`). Si `siguiente.child === previo.child`,
   todo el subárbol se saltó: sus nodos son `sin-cambios` sin mirar sus
   flags (que pueden ser de un render antiguo).
2. **Nodos que se emiten:** componentes de función (0), de clase (1),
   `forwardRef` (11) y `memo` simple (15, `marca: 'memo'`); de un `memo`
   con comparador (14) se emite su hijo, con `marca: 'memo'`;
   proveedores de contexto (10, `marca: 'proveedor'`, nombre = el
   `displayName` del contexto o "Context") y `Suspense` (13, `marca:
   'suspense'`). Todo lo demás (DOM, texto, fragmentos, `StrictMode`) se
   atraviesa sin emitirse.
3. **Estado del nodo:** `montado` (sin pareja anterior), `renderizado`
   (componente con el flag `PerformedWork`; proveedor o Suspense con
   `memoizedProps` distintos), `sin-cambios`, o `desmontado`: estaba en
   el commit anterior y ya no está; se emite **una sola vez**, en su
   posición anterior, con sus últimos datos.
4. **Motivos** de un `renderizado`, sin duplicados y como mucho 6:
   `{ tipo: 'estado', indice }` (gancho de estado cuyo valor cambió,
   `Object.is`; contando desde 1 entre los ganchos de estado),
   `{ tipo: 'prop', nombre, detalle? }` (comparación superficial de
   `memoizedProps`; `detalle` es `funcion-nueva`, `objeto-nuevo` o
   `array-nuevo` si antes y ahora son de ese tipo), `{ tipo: 'contexto',
   nombre }`, `{ tipo: 'gancho' }` si cambió otro gancho con cola, y
   `{ tipo: 'padre' }` si no hay otro motivo y el componente emitido más
   cercano por encima se montó o se renderizó. Sin un padre ejecutado, un
   render sin otro motivo detectable también se atribuye a `gancho`.
5. **Contador de renders** por instancia: id estable guardado para el
   fiber y su `alternate`; suma 1 en `montado` y `renderizado`.
6. **Props y estado** para el detalle de cada nodo: como mucho 12 props
   (incluida `children`) y 12 valores de estado (ganchos de estado en
   orden; en una clase, `this.state`), cada valor como texto de ≤ 80
   caracteres: cadenas entre comillas, números y booleanos tal cual,
   `ƒ nombre()` para funciones, `<Nombre />` para elementos de React,
   `[3 elementos]` o el JSON corto de arrays y objetos (profundidad 2,
   a prueba de ciclos).
7. **Cambios reales en el DOM:** un `MutationObserver` sobre `#root`
   (`childList`, `characterData`, `attributes`, `subtree`) y
   `takeRecords()` dentro del propio commit. `cambiosDom` = nº de nodos
   distintos afectados (texto cambiado → su elemento padre; atributo →
   el elemento; nodos añadidos → cada uno; nodos quitados → su padre). A
   partir del segundo commit, cada elemento afectado se marca con un
   recuadro superpuesto (contenedor propio fuera de `#root`,
   `aria-hidden`, `pointer-events: none`) que se va en 700 ms; con
   `prefers-reduced-motion`, sin animación.
8. Como mucho **200 nodos** por mensaje (`truncado: true` si había más).

### Mensaje `arbol` (iframe → página)

| Campo | Contenido |
|---|---|
| `commit` | Número de commit (el mismo que el mensaje `commit`) |
| `nodos` | ≤ 200: `{ id, nivel (0–40), nombre (≤ 60), clave? (≤ 40), marca? ('memo' \| 'proveedor' \| 'suspense'), estado, renders, motivos (≤ 6), props ({ nombre ≤ 40, valor ≤ 80 }, ≤ 12), estados ({ valor ≤ 80 }, ≤ 12) }` |
| `truncado` | Booleano |
| `cambiosDom` | Entero ≥ 0 |

Se valida con Zod en `mensajes.ts`, con esos límites, y se pinta solo
como texto.

### Componentes

- **`ArbolVisual.tsx`** (presentacional): lista de nodos por `nivel` con
  guías de árbol, nombre en monoespaciada, `key=…`, contador `·N`,
  insignia de `marca` o `etiqueta`, y el estado con **color y texto**
  (nunca solo color): montado (verde), re-render (ámbar), sin cambios
  (gris), desmontado (rojo, tachado). Leyenda opcional.
- **`ArbolDeRenders.tsx`** (panel en vivo, debajo de la vista previa y
  antes de la consola): resumen del último commit ("Commit 4 · 3
  renderizados · 1 montado · 2 cambios en el DOM"), el árbol con el
  motivo de cada re-render en español ("cambió su estado", "cambió la
  prop «alPulsar» (función nueva)", "cambió el contexto «Tema»", "se
  renderizó su padre"), un destello en los nodos que se renderizaron en
  ese commit (sin animación con `prefers-reduced-motion`), y cada nodo
  es un botón que despliega sus props y su estado. Antes del primer
  mensaje: "Usa la vista previa para ver qué se vuelve a renderizar." Se
  vacía cuando la vista previa se reconstruye.
- **`ArbolDeComponentes.tsx`**: el bloque estático con `ArbolVisual`,
  título y leyenda si algún nodo trae `estado`.
- `ReactEnVivo` y `ReactAnotado` muestran el panel si `mostrarArbol`;
  `registro.ts` gana `'arbol-de-componentes'`.
- Catálogo de referencia y `specs/features/laboratorios.md`: un
  `ReactEnVivo` con `mostrarArbol` y un `ArbolDeComponentes`.

### Alarma ante cambios de React

Un test monta un caso conocido con el `react.js` del sandbox y compara
el árbol completo de varios commits con el esperado. Si una versión
nueva de React cambia los internos, ese test es el que avisa.

## Alcance de la fase 3: API simulada, registro de efectos y almacenamiento

Diseño aprobado con el temario (componentes 4 y 6). Desbloquea los
módulos 6–8 (lecciones 38–62), los proyectos 🧪 47, 56, 62 y 71, y la 84.

### Validación (2026-10-20)

| Qué se probó | Resultado |
|---|---|
| Envolver `useEffect` en el objeto `react` que ve el código del alumno (jsdom, `react.js` 19.3.1 del sandbox) | Montaje con `StrictMode`: efecto → limpieza → efecto. Cambio de dependencia: limpieza → efecto. Desmontar: limpieza. React sigue ejecutando el efecto real |
| Quién llama al efecto | Por la pila (`new Error().stack`): primer marco con mayúscula = componente (`Chat`), primer marco `use[A-Z]` = hook propio (`useConexion`), con la línea exacta del `useEffect(` (desfase de 2 de `new Function`) |
| Comparar dependencias en el render | **Falla con `StrictMode`**: el segundo render ya ve las nuevas. Hay que comparar en el commit, dentro del efecto envuelto |
| `localStorage` en el iframe aislado (Chromium real) | Lanza `SecurityError`; `window` tiene un descriptor propio y configurable, y se puede sustituir con `Object.defineProperty` |
| `fetch` sustituido en el iframe (Chromium real) | `new Response(JSON, { status, headers })` funciona (`res.ok`, `res.json()`), y un `AbortSignal` rechaza con `DOMException` de nombre `AbortError` |

### Esquemas

`react-en-vivo` y `react-anotado` ganan:

```ts
api?: Record<string, Registro[]>   // colecciones: { recetas: [{ id: 1, ... }] }
                                   // ≤ 8 colecciones, nombres /^[a-z][a-z0-9-]*$/,
                                   // ≤ 200 registros cada una, cada registro un objeto
                                   // con id (número o texto), ≤ 20 000 caracteres en
                                   // JSON en total
red?: {                            // ajustes iniciales del panel «Red»
  latencia?: entero 0–3000,        // ms; por defecto 600
  desordenar?: boolean,            // por defecto false
}
mostrarEfectos?: boolean           // por defecto false
```

Y las comprobaciones ganan un paso `{ red: 'fallar-siguiente' }`, para
ejercicios que tienen que manejar un error del servidor.

### API simulada (`runtime/red.js`, solo si el bloque trae `api`)

- Sustituye `window.fetch` para las rutas que empiezan por `/api/`; el
  resto va al `fetch` original. La ruta se interpreta como texto (con
  `<base href="about:srcdoc">` no se puede resolver como URL).
- Rutas sobre una copia en memoria de los datos (cada documento empieza
  con los originales): `GET /api/<col>` con `?q=` (busca sin distinguir
  mayúsculas ni tildes en los campos de texto) y `?_limite=`, `GET
  /api/<col>/<id>`, `POST /api/<col>` (cuerpo JSON; asigna `id`: el
  mayor numérico + 1, o `crypto.randomUUID()` si los ids son texto),
  `PUT` y `PATCH /api/<col>/<id>`, `DELETE /api/<col>/<id>`. Respuestas
  `Response` reales con `Content-Type: application/json`; 404 con
  `{ error }` si no existe la colección o el registro, 400 si el cuerpo
  no es JSON.
- **Latencia** con `setTimeout`. **Cancelación real**: si
  `options.signal` ya está abortada o se aborta durante la espera, la
  promesa se rechaza con `new DOMException('The operation was aborted.',
  'AbortError')`. `reiniciar()` abandona además todas las peticiones en vuelo
  de la generación anterior, sin tocar los datos reiniciados, registrar su
  final ni resolver o rechazar sus promesas.
- **Fallar la siguiente petición**: la siguiente petición a `/api/`
  responde 500 con `{ error: 'Error del servidor (simulado)' }`.
  Si una comprobación empieza con este paso, fallan todas las peticiones
  iniciadas durante el montaje (incluida la repetición de `StrictMode`) y el
  modo termina antes de ejecutar los pasos siguientes; si el montaje no lanzó
  ninguna petición, el fallo queda pendiente para la primera petición posterior,
  y si lanzó al menos una no queda ningún fallo pendiente.
- **Responder desordenado**: retrasos deterministas, sin `Math.random`:
  cada petición nueva responde a la mitad de la latencia y alarga una
  latencia completa las que siguen pendientes, reprogramando sus
  temporizadores. Así, dos o más peticiones seguidas llegan siempre en
  orden inverso. Con latencia 0 no hay desorden observable.
- Mensajes iframe → página `peticion`: `{ id, metodo, ruta (≤ 200),
  estado: 'pendiente' | 'ok' | 'error' | 'cancelada', codigo?, ms? }`, uno
  al empezar y otro al terminar.
- Mensajes página → iframe (el iframe solo los acepta si
  `event.source === parent`): `{ canal, tipo: 'red', latencia,
  desordenar }` (al recibir `montado` y cada vez que cambian los
  controles) y `{ canal, tipo: 'fallar-siguiente' }`.
- En el iframe de las comprobaciones: latencia 0 y sin desorden, salvo
  que el bloque fije `red.latencia`; el paso `{ red: 'fallar-siguiente' }`
  activa el fallo desde la propia comprobación.

### Registro de efectos (`runtime/efectos.js`, solo si `mostrarEfectos`)

- El montaje entrega al código del alumno un `react` cuyos `useEffect`,
  `useLayoutEffect` y `useInsertionEffect` están envueltos; React sigue
  ejecutando el efecto real. Si `mostrarEfectos` es falso, `react` es el
  de siempre.
- El envoltorio usa un `useRef` (incondicional) con las últimas
  dependencias **confirmadas** y las compara dentro del efecto envuelto
  (en el commit, nunca en el render). Motivo de cada ejecución:
  `montaje` (primera vez), `strict-mode` (otra vez con las mismas
  dependencias justo después de una limpieza, en el mismo commit),
  `dependencias` (alguna cambió, con `Object.is`) o `cada-render` (sin
  array de dependencias). Las limpiezas se emiten como `limpieza`; la
  ejecución que las sigue explica el porqué, o `desmontaje` si el
  componente desaparece en ese commit.
- Componente y hook propio por la pila, en formato V8 (`at Nombre
  (App.jsx:L:C)`) y Firefox/Safari (`Nombre@App.jsx:L:C`).
- Nombres de las dependencias: del código del módulo en esa línea, el
  último argumento de la llamada a `useEffect(` si es un array literal,
  partido por las comas de primer nivel; si no se puede, «dependencia 1,
  2...».
- El puente expone el número de commit actual a `efectos.js`.
- Mensaje `efecto`: `{ commit, componente (≤ 60), gancho? (≤ 60),
  archivo, linea, accion: 'efecto' | 'limpieza', clase: 'useEffect' |
  'useLayoutEffect' | 'useInsertionEffect', motivo?, cambios: { nombre
  (≤ 40), antes (≤ 80), ahora (≤ 80) }[] (≤ 8) }`.

### Almacenamiento en memoria (`puente.js`, siempre)

Si leer `localStorage` o `sessionStorage` lanza, el puente los sustituye
con `Object.defineProperty` por un almacén en memoria con la misma
interfaz (`getItem`, `setItem`, `removeItem`, `clear`, `key`, `length`),
que dura lo que dura el documento.

### Componentes

- **`PanelRed.tsx`** (con `api`): latencia (control deslizante de 0 a 3
  s, con su valor escrito), «Responder desordenado» (interruptor),
  «Fallar la siguiente petición» (botón; mientras está pendiente,
  «La siguiente petición fallará») y el registro de las últimas 20
  peticiones («GET /api/recetas?q=pa · 200 · 812 ms», «cancelada»,
  «500»), con el estado escrito y no solo en color.
- **`RegistroEfectos.tsx`** (con `mostrarEfectos`): línea de tiempo por
  commit («commit 4 · Chat ⟲ limpieza», «commit 4 · Chat ▶ efecto ·
  cambió sala: "general" → "viaje"», «commit 1 · Chat ▶ efecto · repetido
  por StrictMode»), con botón «Limpiar» y como mucho 200 entradas.
- `VistaPreviaReact` gana la forma de enviar mensajes al iframe (los de
  `red`) y los reenvía al recibir `montado`.

## Alcance de la fase 4: TSX, linter y React Compiler

Diseño del temario (componente 8 y módulo 10), aprobado el 2026-10-22.
Desbloquea las lecciones 68–70 (compilador y linter) y 72–74 (TSX).

### Validación (2026-10-21)

Prueba aislada (scratchpad `spike-fase4/`): paquetes de navegador hechos
con esbuild y ejecutados en Chromium real, comparando la salida con la de
Node sobre los mismos archivos.

| Qué se probó | Resultado |
|---|---|
| `babel-plugin-react-compiler@1.0.0` sobre `@babel/standalone@8.0.7` | Funciona: **4,5 MB / 1,10 MB gzip**, carga en ~280 ms, ~34 ms por compilación. Salida idéntica a la de Node (`import { c as _c } from "react/compiler-runtime"`, ranuras `$[0]`…), con el JSX conservado |
| `Linter` de `eslint/universal` (ESLint 10.13.0) + `eslint-plugin-react-hooks@7.1.1`, `recommended-latest` | Funciona: **4,0 MB / 0,97 MB gzip**, carga en ~210 ms, primera pasada ~54 ms y siguientes ~2 ms. Mismos mensajes que en Node, también los de las reglas basadas en el compilador (`set-state-in-effect`, `purity`) |
| Los dos en un solo paquete | 8,3 MB / 2,0 MB gzip (cada plugin trae su copia de Babel): **se sirven por separado** |
| Módulos de Node que arrastran (`os`, `tty`, `util`, `path`, `fs`, `crypto`, `process`) | Sustituidos por un relleno; lo que se ejecuta necesita `util.isDeepStrictEqual` y `crypto.createHmac` (clave de caché: basta un FNV-1a) |
| Trampa 1: `require.resolve('react-native-reanimated')` | En el compilador, `enableReanimatedCheck: false`; en el plugin de ESLint, parchear `hasModule` para que devuelva `false` al empaquetar. Sin parche, las reglas del compilador fallan **en silencio** |
| Trampa 2: `hermes-parser` | Con archivos `.jsx` el plugin de ESLint usa `hermes-parser`, que no arranca en el navegador (en silencio). Con el nombre `App.tsx` usa el parser de Babel (TS + JSX), y `hermes-parser` sale del paquete |
| `react/compiler-runtime` en la vista previa | El `react.js` 19.3.1 del sandbox ya expone `React.__COMPILER_RUNTIME` |
| TSX con Sucrase (`typescript`, `jsx`, `imports`) | Quita los tipos y conserva las líneas, sin peso añadido |
| Tipos de React | `@types/react@19.3.0` + `csstype`: 1,1 MB de `.d.ts` |

### Decisiones

1. **En el navegador, no precompilado**: el alumno edita y ve al momento
   la salida del compilador o los avisos del linter. Cada paquete pesa
   menos que el compilador de TypeScript que ya carga el módulo de
   TypeScript y solo se descarga en las lecciones que lo usan.
2. **En un Web Worker clásico** por paquete
   (`/vendor/react-kit/<versión>/compilador.js` y `lint.js`): la carga y
   las pasadas no bloquean el editor, y los rellenos de Node no tocan la
   página. Se crea al primer uso y se reutiliza.
3. **Paquete aislado `scripts/react-kit/`** (como `scripts/react-en-vivo/`):
   `package.json` con versiones exactas, lockfile y `construir.mjs` con los
   rellenos y los dos parches. El resultado se versiona en
   `public/vendor/react-kit/<versión>/` con caché inmutable en
   `vercel.json`, junto con los tipos de React en `tipos/`.
4. **Protocolo**: página → worker `{ id, tipo: 'compilar', codigo,
   typescript? }` o `{ id, tipo: 'lint', archivos: { nombre, codigo }[] }`;
   worker → página `{ id, ok: true, codigo, eventos }`, `{ id, ok: true,
   diagnosticos }` o `{ id, ok: false, error }`. La página valida con Zod
   y descarta las respuestas que no sean de la última petición.
5. **TSX sin paquete nuevo**: Sucrase para ejecutar y `typescript-en-vivo`
   para los errores de tipos, con los `.d.ts` de React. Como en Vite, los
   errores de tipos se enseñan pero **no impiden ejecutar**.

### Esquemas

`react-en-vivo` gana:

```ts
archivos: nombres /^[A-Za-z][A-Za-z0-9-]*\.(jsx|tsx|ts|css)$/
          // exactamente uno entre App.jsx y App.tsx, con export default
mostrarLint?: boolean          // panel «Linter»; por defecto false
compilador?: boolean           // ejecuta el código compilado con React
                               // Compiler; por defecto false
exigirLintLimpio?: boolean     // «Comprobar» añade «El linter no marca nada»
exigirTiposCorrectos?: boolean // «Comprobar» añade «El código no tiene
                               // errores de tipos»
```

Un bloque con algún `.ts` o `.tsx` enseña siempre el panel de errores de
tipos. Las comprobaciones añadidas por `exigir*` van las primeras y su
motivo es el primer diagnóstico («App.tsx:7:12 · Type 'string' is not
assignable to type 'number'.»).

Bloque nuevo **`compilador-react`**: `{ tipo, titulo? (≤ 140), consigna?
(≤ 600), codigo (≤ 4000, un componente JSX editable) }`. A la izquierda
el código (con «Restablecer»), a la derecha la salida real del compilador
(solo lectura, resaltada como `jsx`), regenerada 300 ms después de la
última edición; debajo, lo que dijo el compilador de cada componente
(«Fila: compilado», «App: no se compiló · <motivo>»), sacado de su
`logger`.

### Linter (`mostrarLint`)

`recommended-latest` de `eslint-plugin-react-hooks` 7.1.1, sin más reglas.
Cada `.jsx`/`.tsx` se pasa como `.tsx` (trampa 2) y se pinta con su
nombre real. Panel «Linter» bajo el editor: por archivo, `línea:columna`,
regla y mensaje literal en inglés (el primer párrafo visible, el resto
desplegable); sin diagnósticos, «El linter no marca nada». Se recalcula
400 ms después de la última edición.

### Compilador en la vista previa (`compilador`)

Antes de Sucrase, cada `.jsx`/`.tsx` pasa por el worker del compilador.
El montaje acepta el import `react/compiler-runtime` y lo resuelve a
`{ c: React.__COMPILER_RUNTIME.c }` (y `transformar` lo admite). Si el
compilador falla en un archivo, se ejecuta sin compilar y se avisa encima
de la vista previa. «Ver el JavaScript generado» enseña el código
compilado. Las líneas de los errores de render son las del código
compilado: el recuadro lo dice.

### TSX

- `transformar`: `transforms: ['typescript', 'jsx', 'imports']` para `.ts`
  y `.tsx`; `./Tarjeta` se resuelve también a `.tsx` y `.ts`.
- Errores de tipos en la página con `typescript-en-vivo` y
  `@typescript/vfs`: los `.ts`/`.tsx` del bloque más los `.d.ts` de React
  y `csstype` (desde `/vendor/react-kit/<versión>/tipos/`), con
  `jsx: 'react-jsx'`, `strict: true` y `moduleResolution: 'bundler'`.
- Panel «Errores de tipos» como `PanelDiagnosticosTs` de `EditorEnVivo`
  (reutilizarlo), por archivo.

### Pendiente de la fase 4

Opcionales del temario (tests en vivo y panel de anuncios): se decidirán
más adelante.

## Checkpoints de seguridad

- **El código del alumno nunca toca la web.** Iframe sin
  `allow-same-origin`: origen opaco, sin acceso a cookies,
  `localStorage` ni a la sesión de Supabase de la página. Igual que
  `editor-en-vivo`.
- **Los mensajes del iframe son entrada no confiable.** El código del
  alumno corre en el mismo iframe que el puente y puede falsificar
  cualquier mensaje. La página solo acepta mensajes cuyo `event.source`
  sea ese iframe y con `canal: 'react-en-vivo'`, los valida con Zod con
  límites de tamaño, y los pinta como texto (React escapa); nunca
  `dangerouslySetInnerHTML`. Lo peor que se puede falsificar es un ✅ en
  el propio navegador: las comprobaciones no guardan nada en el
  servidor.
- **Runtime del mismo origen y fijado**, construido desde un lockfile
  con versiones exactas; ningún script de terceros en tiempo de
  ejecución.
- **`new Function` dentro del iframe y en la página:** hoy la web no
  tiene CSP. Un `srcdoc` hereda la CSP de la página, así que si algún día
  se añade una sin `'unsafe-eval'`, la vista previa dejará de funcionar.
  En la página, `transformarArchivos` usa `new Function` solo para
  compilar el código del alumno, nunca para ejecutarlo; con esa CSP
  lanzaría un `EvalError`, que se ignora a propósito. Queda anotado para
  quien añada esa CSP.
- **El contenido de los bloques** (archivos, comprobaciones) viene del
  JSON de la lección, validado con Zod y escrito por admins.
- **Bucle infinito:** riesgo aceptado, igual que en `editor-en-vivo`.

Pendiente: mientras un Suspense enseña su fallback, el árbol oculto sale como
si estuviera en pantalla; se resolverá con el módulo 7.

## Notas para quien escriba lecciones

Comportamientos del sandbox que conviene conocer al escribir ejemplos y
comprobaciones:

- En las comprobaciones no hay View Transitions: el cambio se aplica sin animar.
- **`alert()`, `confirm()` y `prompt()`** no abren ventanas (el sandbox
  no admite modales): se ven como un aviso de 3 s arriba de la vista
  previa y como `alert: …` en la consola. `confirm()` responde siempre
  "aceptar" y `prompt()` su valor por defecto o `""`. El texto del aviso
  se puede comprobar con `{ "texto": "…" }`.
- **Formularios:** un `onSubmit` sin `e.preventDefault()` recarga la
  vista previa, como una página real. Las comprobaciones lo detectan y
  lo explican; si el ejercicio no trata de eso, pon el `preventDefault`
  en el código inicial.
- **Enlaces:** `#…` se queda en la vista previa; cualquier otra URL
  acaba bloqueada (`about:blank#blocked`).
- **`min-height: 100vh`** hace crecer la vista previa hasta su máximo
  (2400 px): la altura del iframe depende de la de su contenido. Usa
  alturas fijas en los ejemplos.
- **El CSS se aplica aunque no se importe**: todos los `.css` del
  bloque van al documento.
- **`localStorage` y `sessionStorage`** funcionan con un almacén en
  memoria (fase 3): no sobreviven a recargar la vista previa.
- **La consola** captura `console.log`, `info`, `warn` y `error`; no
  `table`, `dir` ni `group`.
- **Los errores de sintaxis** salen con el mensaje de Sucrase, en
  inglés ("Unterminated JSX contents").

## Fuera de alcance de las fases 0 y 1

TSX con diagnósticos de tipos, árbol de renders, registro de efectos,
API simulada, kit del compilador (fases 2-4 del temario); `createRoot`
manual desde un `main.jsx`; importar librerías de npm; guardar el código
del alumno entre visitas.

## Verificación

Codex no puede abrir puertos ni lanzar un navegador en su sandbox: los
tests unitarios los escribe y pasa Codex; la verificación con React
real en el navegador la hace Claude después, con Playwright contra el
servidor de desarrollo, repitiendo los casos de la validación de arriba
(montaje, varios archivos, CSS, aviso de `key`, `StrictMode`, error de
render con su línea, comprobaciones en el iframe oculto con la vista
previa intacta, JavaScript generado), más modo oscuro y ancho de móvil.
Antes de dar una fase por cerrada, `npm run test`, `npm run build` y
`npm run lint` en local: la CI no los ejecuta.

## Pendiente

- **Fase 3:** nombres de dependencias con `?.` y `??` (se analiza el
  código transformado), y `fetch` con objetos `Request`/`URL` (no se
  pueden construir con ruta relativa dentro del `srcdoc`).
- **Firefox y Safari sin probar.** La línea de los errores se calcula
  con un desfase fijo de 2 líneas medido en Chromium, y un error lanzado
  desde `react.js` podría llegar como "Script error.". Prueba manual
  antes de publicar la primera lección.
- **Mejoras menores aplazadas en la revisión final:**
  - Un nonce por documento, para que los mensajes rezagados del
    documento anterior no entren en la consola recién limpiada.
  - Mejor formato en la consola (eventos, `Map` y elementos salen como
    `[object Object]` o `{}`).
  - Que la consola se desplace sola hasta la última entrada.
  - Un test que demuestre el volcado agrupado de la consola.
