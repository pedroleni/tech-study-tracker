# React: nueva tecnología + React real en el navegador (`react-en-vivo`)

**Estado:** ✅ fases 0 y 1 implementadas, verificadas e integradas en
`main` el 2026-10-20 (PR #55): 476 tests, revisión independiente de todo
el trabajo y verificación con React 19.3.1 real en Chromium. Pendiente:
probar a mano en Firefox y Safari (ver "Pendiente" al final). ✅ Fase 2
(árbol de renders y árbol estático) en `main` (PR #56). 🔨 Fase 3 (API
simulada, registro de efectos y almacenamiento) especificada abajo, en
construcción. La fase 4 queda descrita a nivel de diseño en el temario.
React Router en la vista previa (fases R0, R1 y R3, para la ficha de
React Router): especificado al final, el 2026-10-26, pendiente de
implementar.

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

## React Router en la vista previa (fases R0, R1 y R3)

Diseño aprobado con el temario de React Router
([contenido/react-router/TEMARIO.md](../../contenido/react-router/TEMARIO.md),
aprobado el 2026-10-26, componentes 1 a 4). Desbloquea los módulos 1 a 3
de esa ficha (lecciones 1 a 13), que van **en TSX desde la primera
lección**, con React Router 8.5.0 de verdad en la vista previa y sus
errores de tipos reales. Esta tanda tiene tres partes:

- **R0:** el bundle de React Router y su carga.
- **R1:** la barra de direcciones, el alias al historial en memoria y las
  comprobaciones con URL.
- **R3:** los tipos de React Router en el panel de errores de tipos, y
  `react-anotado` en TSX.

**R2**, el registro del router (`mostrarRouter`), va en una tanda
posterior con su propia especificación.

Esta sección amplía la decisión de diseño 7 («solo se puede importar
React y los archivos del bloque») y saca «importar librerías de npm» de
«Fuera de alcance», solo para `react-router` y `react-router/dom`.

### Validación (2026-10-26)

Prueba aislada en el *scratchpad* (`spike-src/`, `spike-jsdom/` y
`tipos-src/`), sin tocar el repositorio. Las piezas: `react-router@8.5.0`
de npm, el `react.js` 19.3.1 de `public/vendor/react-en-vivo/19.3.1/`,
esbuild 0.28.2, Chrome for Testing r1243 y WebKit con `playwright-core`
1.64.1, el Vitest de la web con jsdom, y TypeScript 6.0.3 (el
`typescript-en-vivo` de la web) con `@typescript/vfs` 1.6.4.

| Qué se probó | Resultado |
|---|---|
| Empaquetar `react-router` y `react-router/dom` en un IIFE con un plugin que resuelve `react` y `react-dom` a `globalThis.__reactEnVivo` | **224 KB / 71 KB gzip** (build de desarrollo, minificado). El router solo importa `react` y `react-dom`; el metafile no tiene ninguna entrada de `node_modules/react`, `react-dom` ni `scheduler`. Trae `@remix-run/route-pattern` y `cookie-es` |
| Ese bundle detrás del `react.js` del sandbox, en un iframe `srcdoc` con `sandbox="allow-scripts allow-forms"` (origen `null`), en Chromium y en WebKit | Funcionan `createMemoryRouter` + `RouterProvider` de `react-router/dom` con `StrictMode`, `loader`, `action` con `<Form method="post">` y `request.formData()`, la revalidación tras la `action`, `useFetcher`, un `data('No existe', { status: 404 })` lanzado que llega al `ErrorBoundary`, el middleware de cliente con `createContext`, `instrumentations`, `<Await>`, `use()` y `useBlocker` |
| `createHashRouter` y `createBrowserRouter` en ese iframe | **Fallan**: Chromium, «Failed to construct 'URL': Invalid URL»; WebKit, «"/b" cannot be parsed as a URL.». Solo vale el historial en memoria |
| `request.url` en un `loader` del router en memoria | `http://localhost/recetas`: es el origen del historial en memoria |
| Los dos bundles reales en el jsdom de Vitest | Funciona todo, **incluido el envío de un `<Form method="post">`** a la `action` y la revalidación: Codex puede probarlo sin navegador |
| Sucrase con `import { … } from 'react-router'`, `import { RouterProvider } from "react-router/dom"` e `import type { Params } from 'react-router'` | `require('react-router')` y `require('react-router/dom')`, con las comillas del original. **El `import type` desaparece**: no pide el bundle |
| Sucrase con `import('./Pagina.tsx')` | `Promise.resolve().then(() => _interopRequireWildcard(require('./Pagina.tsx')))`: el `lazy` del router recibe un módulo que ya está en memoria |
| Los `.d.ts` de `react-router` 8.5.0 en la VFS del panel (`/node_modules/react-router/…`, con su `package.json`) más los de `cookie-es` | Los mismos diagnósticos que `tsc`. **61 archivos, 469 KB**. Mensajes exactos en «Tests» |

### Decisiones

1. **El bundle es solo la librería; la lógica de la vista previa va en
   `src/`.** `public/vendor/react-en-vivo/react-router/8.5.0/` tiene caché
   inmutable: si el alias o la barra viviesen dentro del bundle, cambiarlos
   obligaría a cambiar la ruta. El envoltorio es un runtime más,
   `src/lib/react-en-vivo/runtime/router.js`, incrustado con `?raw` como
   `red.js` y `efectos.js`.
2. **Una sola copia de React.** El plugin del build resuelve `react` y
   `react-dom` a lo que ya expone `react.js`. Si el metafile tiene alguna
   entrada de React, el build se para.
3. **Se carga solo si el código lo usa.** `construirDocumentoReact` busca
   `require('react-router')` o `require('react-router/dom')` en los
   módulos ya transformados. Las lecciones de React sin router no pagan
   nada.
4. **El alias aprobado.** Dentro de la vista previa,
   `createBrowserRouter` y `createHashRouter` crean un router en memoria,
   y `BrowserRouter` y `HashRouter` son un `MemoryRouter`. La barra lo
   dice («Historial en memoria · …») y la consola avisa una vez por
   documento.
5. **«Recargar» e «Ir» no reconstruyen el documento.** El iframe desmonta
   la app, vacía la caché de módulos y la vuelve a montar en la URL nueva:
   como al recargar una página, se pierde todo el estado de la app. La API
   simulada (`red.js`) y el almacenamiento en memoria (`puente.js`) no se
   reinician, como un servidor y un `localStorage` de verdad. Editar el
   código sí construye un documento nuevo, como hasta ahora, pero empieza
   en la última URL. «Reiniciar» lo devuelve todo al principio, también la
   URL.
6. **Los tipos de React Router van en un solo `tipos.json`** junto al
   bundle, no en `/vendor/react-kit/`. Una versión nueva del router cambia
   una sola carpeta. El panel lo pide solo si algún `.ts` o `.tsx`
   importa `react-router`.

### Dependencias y construcción (`scripts/react-en-vivo/`)

- **`package.json`:** gana `"react-router": "8.5.0"` (versión exacta).
  Lo instala Claude antes de que empiece Codex (ver «Quién hace qué»). Su
  `peerDependencies` pide `react >=19.2.7`, y el paquete tiene 19.3.1.
- **`entrada-react-router.js`** (nuevo):

  ```js
  import * as ReactRouter from 'react-router'
  import * as ReactRouterDom from 'react-router/dom'

  globalThis.__reactRouterEnVivo = { ReactRouter, ReactRouterDom }
  ```

- **`construir.mjs`:** los dos builds de ahora no cambian. Añade dos
  salidas, leyendo la versión de
  `node_modules/react-router/package.json`:
  1. **`public/vendor/react-en-vivo/react-router/<versión>/react-router.js`.**
     Mismas opciones que `react.js` (`bundle`, `format: 'iife'`,
     `platform: 'browser'`, `minify`, `legalComments: 'eof'`, `define`
     de `process.env.NODE_ENV` a `"development"`). Además:
     - `conditions: ['development']`, para que `exports` elija
       `dist/development`;
     - `metafile: true`;
     - el plugin `reactCompartido`: un `onResolve` para
       `/^react(-dom)?(\/.*)?$/` que manda `react` →
       `globalThis.__reactEnVivo.React`, `react-dom` → `.ReactDOM`,
       `react-dom/client` → `.ReactDOMClient` y `react/jsx-runtime` →
       `.JsxRuntime` a un espacio de nombres propio, cuyo `onLoad`
       devuelve `module.exports = <expresión>`. Cualquier otra ruta de
       React es un error de build.

     Si alguna entrada del metafile casa con
     `/node_modules\/(react|react-dom|scheduler)\//`, el script lanza
     «React Router ha empaquetado su propia copia de React».
  2. **`public/vendor/react-en-vivo/react-router/<versión>/tipos.json`**:
     `{ "version": "8.5.0", "archivos": { "<ruta>": "<contenido>" } }`,
     con las claves ordenadas y relativas a `node_modules`:
     - `react-router/package.json`;
     - todos los `react-router/dist/production/**/*.d.ts` (58);
     - `cookie-es/package.json` y `cookie-es/dist/index.d.mts`.

     Son 61 archivos y unos 469 KB. Se usa el `package.json` real del
     router, porque la resolución `bundler` necesita sus `exports` (con la
     condición `types`) para encontrar `react-router` y `react-router/dom`.
- El script imprime el peso de cada salida, como hoy («8.5.0/react-router.js:
  224 KB (gzip 71 KB)», «8.5.0/tipos.json: 61 archivos, 469 KB»). La
  salida se commitea, como `react.js`.
- **`vercel.json` no cambia:** `/vendor/react-en-vivo/(.*)` ya tiene caché
  inmutable, y la versión va en la ruta. `eslint.config.js` tampoco:
  `public/vendor` ya está en `ignores`.

### Constantes (`src/lib/react-en-vivo/constantes.ts`)

```ts
export const VERSION_REACT_ROUTER_EN_VIVO = '8.5.0'
export const RUTA_REACT_ROUTER_EN_VIVO = `/vendor/react-en-vivo/react-router/${VERSION_REACT_ROUTER_EN_VIVO}`
```

### Esquemas (`src/lib/laboratorio/schemas.ts`)

```ts
// Una ruta de la app, como la escribiría el alumno en un <Link to>: empieza
// por una sola "/" (nunca "//otro.sitio") y no lleva espacios.
const esquemaUrlRouter = z.string().min(1).max(200).regex(/^\/(?!\/)\S*$/)

// esquemaPasoComprobacionReact gana cuatro variantes estrictas:
z.strictObject({ navegar: esquemaUrlRouter })   // como un navigate(url)
z.strictObject({ atras: z.literal(true) })      // como navigate(-1)
z.strictObject({ adelante: z.literal(true) })   // como navigate(1)
z.strictObject({ recargar: z.literal(true) })   // como el botón «Recargar»

// esquemaEsperaComprobacionReact gana:
z.strictObject({ url: esquemaUrlRouter })       // ruta + búsqueda + almohadilla, exactas

// esquemaComprobacionReact gana:
urlInicial: esquemaUrlRouter.optional()         // dónde arranca la app en esta comprobación

// esquemaReactEnVivo y esquemaReactAnotado ganan:
urlInicial: esquemaUrlRouter.optional()         // dónde arranca la app; sustituye a initialEntries
barraDeDirecciones: z.boolean().default(true)   // solo se ve si la app crea un router

// esquemaReactAnotado gana (R3):
lenguaje: z.enum(['jsx', 'tsx']).default('jsx') // el código corre como App.jsx o App.tsx
```

`esquemaReactEnVivo` gana un `.refine`. Si alguna comprobación usa
`urlInicial`, `navegar`, `atras`, `adelante`, `recargar` o la espera
`url`, algún archivo tiene que casar con
`/\bfrom\s*['"]react-router(?:\/dom)?['"]/`. Mensaje: «Las comprobaciones
con URL necesitan que algún archivo importe react-router».

Los bloques que ya existen siguen validando igual: todo lo nuevo es
opcional o tiene valor por defecto.

### Runtime en el iframe

#### `documento.ts`

- `OpcionesDocumentoReact` gana `urlInicial?: string`, y
  `prepararDocumento` la pasa.
- `usaRouter = Object.values(modulos).some((codigo) =>
  /\brequire\((['"])react-router(?:\/dom)?\1\)/.test(codigo))`.
- Si `usaRouter`:
  - en `<head>`, justo después de `react.js` (y de `pruebas.js` si lo
    hay), va
    `<script src="{origen}{RUTA_REACT_ROUTER_EN_VIVO}/react-router.js"></script>`;
  - en `<body>`, `runtime/router.js` (`?raw`, con `escaparScript`) va
    después de la configuración, `red.js` y `efectos.js`, y justo antes
    del montaje.
- La configuración gana `urlInicial` si viene, escapada como el resto
  (`<` como `<`).

#### `runtime/router.js` (nuevo; solo si `usaRouter`)

Un IIFE sin dependencias, como `red.js`. Define
`window.__routerEnVivo`.

- **Si no hay `window.__reactRouterEnVivo`** (el bundle no llegó), deja
  `window.__routerEnVivo = { error: 'No se pudo cargar React Router en la
  vista previa. Recarga la página para intentarlo de nuevo.' }` y termina.
- **`espacios`:**
  - `'react-router'` es un objeto congelado con todo `ReactRouter` (spread
    del espacio de nombres) más los seis envoltorios de abajo;
  - `'react-router/dom'` es `ReactRouterDom` tal cual.
- **Carga pendiente.** `prepararCarga(url | null)` guarda la URL con la
  que arrancará el próximo router. Al cargar el documento vale
  `window.__configReactEnVivo.urlInicial ?? null`.
- **Envoltorios de los routers de datos:**
  - `createMemoryRouter(rutas, opciones = {})`. Con carga pendiente, pasa
    `{ ...opciones, initialEntries: [carga], initialIndex: 0 }`; sin ella,
    `opciones` tal cual. Crea el router con el original y lo registra con
    `origen: 'createMemoryRouter'`.
  - `createBrowserRouter(rutas, opciones = {})` y
    `createHashRouter(rutas, opciones = {})`. Quitan `window` de
    `opciones` y llaman al original `createMemoryRouter` con
    `initialEntries: [carga ?? '/']` y `initialIndex: 0`. Lo registran con
    su propio nombre como `origen` y avisan **una vez por documento** con
    `console.info`:
    - para el primero, «createBrowserRouter usa aquí un historial en
      memoria: la vista previa no puede cambiar la dirección de verdad. En
      tu proyecto usará la del navegador.»;
    - para el segundo, «… En tu proyecto guardará la ruta detrás de la #.».
- **Envoltorios de los routers declarativos.** `MemoryRouter`,
  `BrowserRouter` y `HashRouter` son componentes que pintan el
  `MemoryRouter` original con `basename` y `children`. Las entradas
  iniciales:
  - con carga pendiente, `initialEntries = [carga]`;
  - si no, `MemoryRouter` respeta sus `initialEntries` e `initialIndex`, y
    los otros dos empiezan en `['/']`.

  Dentro, antes de `children`, pintan un `SensorDeUbicacion` que no pinta
  nada. Con `useLocation`, `useNavigationType` y `useNavigate`, y en un
  `useLayoutEffect` del React original (así no sale en el registro de
  efectos), registra un navegador declarativo. Ese navegador navega con
  `navigate(destino)` y nunca está ocupado. `BrowserRouter` y `HashRouter`
  avisan en la consola como sus versiones de datos.
- **El navegador activo.** Es el último registrado en el documento, y
  expone:
  - `navegar(destino)`, donde `destino` es una URL o `-1`/`1`
    (`router.navigate` en los de datos);
  - `ubicacion()`: `ReactRouter.createPath(location)`;
  - `ocupado()`: en los de datos, `router.state.navigation.state !==
    'idle' || router.state.revalidation !== 'idle'`; en los declarativos,
    siempre `false`;
  - `puedeAtras()` y `puedeAdelante()`.

  En los de datos se suscribe con `router.subscribe`; en los declarativos,
  avisa el sensor en cada render.
- **Historial propio.** Ni el router ni el historial en memoria exponen su
  índice, así que `router.js` lleva su propia lista `{ clave, url }[]` y
  un `indice`:
  - empieza con las entradas iniciales y el índice inicial (`initialIndex`,
    o la última);
  - con cada `location.key` nueva: `PUSH` corta la lista tras `indice` y
    añade; `REPLACE` sustituye la entrada actual; `POP` busca la clave en
    la lista y, si no está (una entrada inicial aún no visitada), busca la
    URL en `indice - 1` y luego en `indice + 1`; si tampoco, sustituye la
    actual.
- **Mensaje `ubicacion`.** Se envía al registrar el navegador y cada vez
  que cambia la URL, `puedeAtras` o `puedeAdelante`; nunca dos iguales
  seguidos. La `url` va recortada a 500 caracteres.
- **`reiniciar()`.** Llama a `dispose()` en todos los routers de datos
  registrados, vacía el registro y el historial, y deja sin avisar (para
  que la consola vuelva a avisar en el documento recargado).
- **Mensajes de la página.** Solo con `evento.source === parent` y
  `canal: 'react-en-vivo'`, `{ tipo: 'navegador', accion, url? }`:
  - `atras` y `adelante` hacen `navegar(-1)` o `navegar(1)`, si se puede;
  - `recargar` hace `__recargarAppReactEnVivo(ubicación actual)`;
  - `ir` hace `__recargarAppReactEnVivo(url)`, solo si `url` casa con
    `/^\/(?!\/)\S*$/` y mide como mucho 200 caracteres; si no, se ignora.

#### `runtime/montaje.js`

- **`EXTERNOS`** gana `'react-router'` y `'react-router/dom'` desde
  `window.__routerEnVivo.espacios`, si existe.
- **Errores al importar.** Si el código pide `react-router` y no hay
  espacios, `resolver` lanza `window.__routerEnVivo?.error` (o el mismo
  texto si no hay `__routerEnVivo`). El mensaje de un paquete desconocido
  pasa a ser: «En este editor solo se puede importar React, React Router y
  tus propios archivos: «x» no está disponible.».
- **`window.__recargarAppReactEnVivo(url)`** (nuevo): llama a
  `__routerEnVivo.reiniciar()` y a `prepararCarga(url)`, vacía `cache`, pone
  `ultimoError = null`, desmonta y monta. Si falla al montar, envía
  `error-render`, igual que el primer montaje. No toca `red.js` ni el
  almacenamiento.
- **`comprobar`**, en cada comprobación y antes de montar:
  `__routerEnVivo?.reiniciar()` y
  `__routerEnVivo?.prepararCarga(comprobacion.urlInicial ?? config.urlInicial ?? null)`.
  Si la comprobación usa URL (cualquiera de las piezas nuevas) y no hay
  `window.__routerEnVivo`, falla con «Esta comprobación usa la dirección,
  pero la app no importa react-router.».
- **Pasos nuevos.** Primero esperan al navegador activo (`waitFor`,
  `ESPERA_MS`; si no aparece, «La app no ha creado ningún router: no puedo
  navegar a «/x».»).
  - `navegar` → `navegar(url)`;
  - `atras` y `adelante` → `navegar(-1)` o `navegar(1)`. Si no se puede,
    fallan con «No hay ninguna página anterior a la que volver.» o «No hay
    ninguna página siguiente a la que ir.»;
  - `recargar` → `__recargarAppReactEnVivo(ubicación actual)`.

  Después, los cuatro esperan a que `ocupado()` sea `false`, como mucho
  `ESPERA_MS`; si no, «La navegación a «/x» no terminó a tiempo.».
- **Espera `url`** en `motivoDeEspera`:
  - sin navegador, «La app no ha creado ningún router, así que no tiene
    dirección.»;
  - si la ubicación no coincide, «La dirección es «/a» y debería ser
    «/b».»;
  - si coincide, `null`.

#### `runtime/red.js`

Una ruta que empieza por `http://localhost/api/` se trata como `/api/…`
(se quita `http://localhost`, sin puerto). Es el origen que da el router
en memoria a `request.url`, así que `fetch(new URL('/api/x', request.url))`
y `fetch(new Request(…))` llegan a la API simulada. En el mensaje
`peticion`, la `ruta` va ya sin el origen. Cierra en parte el pendiente de
la fase 3 sobre «`fetch` con objetos `Request`/`URL`».

### Mensajes

Iframe → página, en `esquemaMensajeReactEnVivo` (`mensajes.ts`):

| `tipo` | Campos | Uso |
|---|---|---|
| `ubicacion` | `url`: texto ≤ 500 que casa con `/^\/(?!\/)\S*$/`; `puedeAtras` y `puedeAdelante`: booleanos; `origen`: `'createMemoryRouter' \| 'createBrowserRouter' \| 'createHashRouter' \| 'MemoryRouter' \| 'BrowserRouter' \| 'HashRouter'` | La barra de direcciones |

Página → iframe (el iframe solo los acepta si `event.source === parent`):

| Mensaje | Cuándo |
|---|---|
| `{ canal, tipo: 'navegador', accion: 'atras' \| 'adelante' \| 'recargar' }` | Botones de la barra |
| `{ canal, tipo: 'navegador', accion: 'ir', url }` | «Ir» con una dirección que ya validó la página con `esquemaUrlRouter` |

La URL se pinta siempre como texto, nunca como HTML ni como `href`.

### Componentes (`src/components/bloques-laboratorio/`)

- **`BarraDirecciones.tsx`** (nuevo, presentacional). Props:
  `{ ubicacion: MensajeUbicacion, onAccion: (accion, url?) => void }`.
  - Un `<form aria-label="Barra de direcciones de la vista previa">` con
    botones «Atrás», «Adelante» y «Recargar» (iconos con `aria-label`;
    Atrás y Adelante, `disabled` según `puedeAtras` y `puedeAdelante`), un
    campo «Dirección de la vista previa» en monoespaciada y el botón «Ir».
  - El campo enseña la URL recibida hasta que el alumno escribe. Una
    `ubicacion` nueva descarta lo escrito, como en un navegador.
  - «Ir» valida con `esquemaUrlRouter`. Si no vale, enseña «La dirección
    tiene que empezar por una sola / y no llevar espacios.» y no envía
    nada.
  - Debajo, en pequeño, el texto según `origen`:
    - `createMemoryRouter` y `MemoryRouter`: «Historial en memoria
      (`<origen>`)»;
    - `createBrowserRouter` y `BrowserRouter`: «Historial en memoria · en
      tu proyecto, `<origen>` usa la dirección del navegador»;
    - `createHashRouter` y `HashRouter`: «Historial en memoria · en tu
      proyecto, `<origen>` guarda la ruta detrás de #».
  - Tema claro y oscuro con los tokens de la web; a 320 px de ancho, el
    campo ocupa su propia fila.
- **`VistaPreviaReact.tsx`:** nueva prop `ordenNavegador?: { id: number;
  accion: 'atras' | 'adelante' | 'recargar' | 'ir'; url?: string }`,
  con el mismo patrón que `fallosSolicitados`. Envía el mensaje
  `navegador` cuando cambia `id` y el iframe ya avisó de `montado`; si
  llega antes, lo envía al recibir `montado`.
- **`ReactEnVivo.tsx`:**
  - guarda la última `ubicacion` de la vista previa visible, y su URL en
    `urlActualRef`;
  - pinta la `BarraDirecciones` encima del iframe si
    `barraDeDirecciones` y ya llegó alguna `ubicacion`;
  - al reconstruir por una edición, pasa a `prepararDocumento`
    `urlInicial: urlActualRef.current ?? urlInicial`, y vacía la
    `ubicacion` hasta que llegue la del documento nuevo;
  - «Reiniciar» vacía `urlActualRef` y la `ubicacion`, así que el
    documento vuelve a la `urlInicial` del bloque;
  - con «Recargar» o «Ir», vacía consola, árbol, registro de efectos y
    registro de red, igual que hace hoy al reconstruir, y manda la orden
    sin reconstruir el documento;
  - «Comprobar» prepara el documento oculto con la `urlInicial` del
    bloque; la de cada comprobación la aplica el montaje.
- **`ReactAnotado.tsx`:** lo mismo para la barra y `urlInicial` (sin
  comprobaciones). Con `lenguaje: 'tsx'`, el archivo se llama `App.tsx` y
  el código se resalta con `lenguaje="tsx"`. No enseña el panel de tipos:
  es un bloque para explicar.
- **`/admin/referencia-contenido`:** un `react-en-vivo` en TSX con
  `createMemoryRouter`, dos rutas con `loader`, una `action` con `<Form>`,
  la API simulada, `urlInicial` y dos comprobaciones (una con `navegar` y
  espera `url`, otra con `recargar`). También un `react-anotado` con
  `lenguaje: "tsx"` y `createBrowserRouter`, para ver el alias.
  `specs/features/laboratorios.md` lista los campos nuevos.

### R3: los tipos de React Router en el panel (`src/lib/react-en-vivo/tipos.ts`)

- **Cuándo.** El programa necesita los tipos del router si algún `.ts` o
  `.tsx` casa con
  `/\b(?:from|import)\s*\(?\s*['"]react-router(?:\/dom)?['"]/`. Esto
  incluye `import type`, porque el tipo hace falta aunque el código no
  ejecute el router.
- **Carga.** `cargarTiposReactRouter(cargarArchivo)` pide
  `${RUTA_REACT_ROUTER_EN_VIVO}/tipos.json` **una vez por cada
  `cargarArchivo`** (un `WeakMap` de promesas, como `cargarRecursos`; si
  falla, se borra la promesa para reintentar).
- **Validación con Zod:**
  - `version` igual a `VERSION_REACT_ROUTER_EN_VIVO`;
  - `archivos`: claves que casan con
    `/^(react-router|cookie-es)\/[\w./-]+$/`, como mucho 100 claves y
    2.000.000 de caracteres en total.

  Si no vale, se lanza «Los tipos de React Router no tienen el formato
  esperado», y el panel lo enseña como hoy enseña los demás fallos de
  carga («No se pudieron analizar los tipos…»).
- **Montaje en la VFS.** Cada archivo va a `/node_modules/<clave>`.
- **En la sesión** (`crearSesionTiposReact`):
  - la primera vez que un programa necesita los tipos del router, se
    cargan, se añaden al mapa base y, si el entorno ya existía, se crea de
    nuevo con ellos. Pasa una vez por sesión;
  - un programa que deja de importar el router no los quita (no
    estorban).
- **Opciones del compilador:** las de hoy (`moduleResolution: 'bundler'`,
  `skipLibCheck: true`, `strict`). No hace falta nada más: comprobado en
  la VFS.

### Tests

Los escribe y los pasa Codex. Cada uno, con su nombre y lo que demuestra.

**`src/lib/laboratorio/schemas.test.ts`**

- «react-en-vivo acepta urlInicial y barraDeDirecciones, y barraDeDirecciones vale true por defecto».
- «rechaza una urlInicial sin / inicial, con espacios, con // o de más de 200 caracteres»: `pistas`, `/a b`, `//otro.example` y `/` + 200 `a`, cada una con `success: false`.
- «las comprobaciones admiten urlInicial, navegar, atras, adelante, recargar y la espera url».
- «rechaza { atras: false } y un paso con dos claves».
- «pide que algún archivo importe react-router si hay comprobaciones con URL»: sin el `import` falla con el mensaje exacto; con `import { createMemoryRouter } from 'react-router'`, valida.
- «react-anotado acepta lenguaje tsx y usa jsx por defecto».

**`src/lib/react-en-vivo/documento.test.ts`**

- «no carga React Router si ningún módulo lo pide»: el `srcdoc` no contiene `/react-router/8.5.0/react-router.js`.
- «carga react-router.js después de react.js y el runtime del router antes del montaje si un módulo hace require('react-router')»: comprueba el orden con `indexOf`.
- «también lo carga con require("react-router/dom") entre comillas dobles».
- «un import type de react-router no lo carga»: pasa por `transformarArchivos` un `App.tsx` que solo importa tipos.
- «urlInicial va en la configuración con < escapado»: con `/buscar?q=<b>`, el `srcdoc` no contiene `<b>` y sí `<b>`.

**`src/lib/react-en-vivo/mensajes.test.ts`**

- «acepta una ubicacion válida».
- «rechaza una ubicacion con url sin / inicial, con //, de más de 500 caracteres o con un origen desconocido».

**`src/lib/react-en-vivo/router.test.ts`** (nuevo, jsdom, **bundles reales**)

Carga `public/vendor/react-en-vivo/19.3.1/react.js` y
`public/vendor/react-en-vivo/react-router/8.5.0/react-router.js` con
`new Function`, como `runtime.test.ts`. Después ejecuta `router.js` y
`montaje.js` sobre módulos que pasan por `transformarArchivos` (en TSX).
Los mensajes de la página se simulan con `new MessageEvent('message', {
source: window, data })`: en jsdom, `parent === window`.

- «el bundle no lleva su propia copia de React»: `react-router.js` no contiene `__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE` (que `react.js` sí contiene) y sí contiene `react-router v8.5.0`.
- «monta un createMemoryRouter con loader, envía un `<Form method="post">` a la action, revalida y pinta el 404 lanzado en el ErrorBoundary»: aparece «Migas»; tras `requestSubmit()`, «Pisto», y el `loader` se ha ejecutado dos veces; tras navegar a `/nada`, «404».
- «el router y el alumno comparten React: con StrictMode no hay «Invalid hook call»»: `console.error` no recibe nada que case con `/Invalid hook call/`.
- «el middleware de cliente pasa un valor al loader con createContext».
- «envía ubicacion al montar y al navegar, con puedeAtras y puedeAdelante correctos tras atrás y adelante»: `{ url: '/', puedeAtras: false, puedeAdelante: false, origen: 'createMemoryRouter' }`; tras pulsar un `Link`, `/recetas` con `puedeAtras: true`; tras `atras`, `/` con `puedeAdelante: true`.
- «createBrowserRouter va a memoria, arranca en / y avisa una sola vez en la consola»: un único `console.info` que contiene «historial en memoria», y `origen: 'createBrowserRouter'`.
- «createHashRouter, BrowserRouter y HashRouter también van a memoria y envían ubicacion»: con `BrowserRouter` + `Routes`, pulsar un `Link` envía `/juegos`.
- «urlInicial de la configuración sustituye a initialEntries en createMemoryRouter y en MemoryRouter».
- «ir recarga la app en esa URL: los módulos se evalúan de nuevo y el loader se repite»: un contador a nivel de módulo vuelve a 1.
- «recargar conserva los datos de la API simulada y el almacenamiento en memoria»: con `red.js`, una `action` hace `POST` a `/api/recetas`; tras `recargar`, el `loader` la ve y un `localStorage.getItem` sigue devolviendo lo guardado.
- «ignora los mensajes navegador que no vienen de parent y los ir con una URL no válida»: con `source: null` y con `url: '//otro.example'`, la ubicación no cambia.
- «fetch a http://localhost/api/… pasa por la API simulada»: un `loader` con `fetch(new URL('/api/recetas', request.url))` recibe los datos, y el mensaje `peticion` lleva `ruta: '/api/recetas'`.
- «importar react-router sin el bundle da un error claro»: sin cargar `react-router.js`, el montaje envía `error-render` con «No se pudo cargar React Router en la vista previa. Recarga la página para intentarlo de nuevo.».
- «un paquete desconocido dice «solo React, React Router y tus propios archivos»».
- Comprobaciones, con `window.__comprobarReactEnVivo`:
  - «urlInicial de la comprobación monta la app en esa URL».
  - «navegar, atras, adelante y recargar esperan a que la navegación termine»: con un `loader` que tarda 50 ms, la espera `url` y el texto de la página nueva se cumplen.
  - «la espera url falla con «La dirección es «/a» y debería ser «/b».»».
  - «atras sin página anterior falla con «No hay ninguna página anterior a la que volver.»».
  - «una comprobación con URL en una app sin router falla con un motivo claro».
  - «cada comprobación desecha el router de la anterior»: la primera navega a `/b`; la segunda, sin `urlInicial`, empieza en `/`.

**`src/lib/react-en-vivo/tipos.test.ts`** (R3, con el `tipos.json` real
leído de `public/` mediante `cargarDesdeDisco`)

- «un App.tsx con createMemoryRouter, RouterProvider de react-router/dom y `useLoaderData<typeof loader>` no tiene errores».
- «params.id es string | undefined: asignarlo a un string da error»: el mensaje contiene `Type 'string | undefined' is not assignable to type 'string'.`
- «`createContext<Usuario>`: un set con otro tipo da error»: `Argument of type 'number' is not assignable to parameter of type 'Usuario'.`
- «`useLoaderData<typeof loader>` conoce las propiedades»: `Property 'apellido' does not exist on type 'Usuario'.`
- «sin importar react-router no pide tipos.json»: espía sobre `cargarArchivo`.
- «un import type de react-router también carga sus tipos».
- «pide tipos.json una sola vez por sesión».
- «un tipos.json con otra versión o mal formado da un error, y la sesión se recupera con uno bueno».

Los tres mensajes de tipos se comprobaron con TypeScript 6.0.3 en la VFS
del panel.

**Componentes**

- `BarraDirecciones.test.tsx`:
  - «enseña la URL y el texto del historial según el origen»;
  - «Atrás y Adelante se desactivan según la ubicación y llaman a onAccion»;
  - «Ir con una dirección válida llama a onAccion('ir', url); con una no válida enseña el error y no llama»;
  - «Recargar llama a onAccion('recargar')»;
  - «una ubicación nueva sustituye a lo escrito»;
  - nombres accesibles: «Atrás», «Adelante», «Recargar», «Ir» y el campo «Dirección de la vista previa».
- `VistaPreviaReact.test.tsx`:
  - «envía la orden del navegador cuando cambia su id y el iframe ya montó»;
  - «guarda la orden hasta el primer montado».
- `ReactEnVivo.test.tsx`:
  - «no enseña la barra hasta que llega una ubicacion, ni con barraDeDirecciones: false»;
  - «al editar el código, el documento nuevo arranca en la última URL»: lo dice la configuración del `srcdoc`;
  - «Reiniciar vuelve a la urlInicial del bloque»;
  - «Recargar vacía la consola y manda la orden sin reconstruir el documento»: el `srcdoc` no cambia;
  - «Comprobar prepara el documento con la urlInicial del bloque».
- `ReactAnotado.test.tsx`:
  - «con lenguaje tsx ejecuta App.tsx y resalta como tsx»;
  - «enseña la barra cuando llega una ubicacion».

### Quién hace qué

1. **Claude, antes de Codex (Codex no tiene red):**
   - `cd scripts/react-en-vivo && npm ci && npm install --save-exact react-router@8.5.0`.
     El worktree no tiene `scripts/react-en-vivo/node_modules`. Esto deja
     `package.json` y `package-lock.json` actualizados, con `cookie-es` y
     `@remix-run/route-pattern` como dependencias del router.
   - Comprobar con `npm ls react-router` que es la 8.5.0.
   - La web no necesita nada: el `typescript-en-vivo` (6.0.3) y
     `@typescript/vfs` del panel ya están en el `node_modules` de la raíz.
2. **Codex:**
   - implementa esta sección y escribe los tests;
   - ejecuta `npm run construir` en `scripts/react-en-vivo` (esbuild y los
     paquetes ya estarán instalados: no hace falta red) para generar
     `react-router.js` y `tipos.json`, que los tests leen de `public/`;
   - pasa `npm run test` y `npm run lint`.
3. **Claude, después:**
   - revisa el diff y vuelve a ejecutar `npm run construir`, para comprobar
     que la salida es idéntica a la que commitea Codex;
   - pasa `npm run test`, `npm run build` y `npm run lint` en local, porque
     la CI no los ejecuta;
   - verifica con Playwright, contra el servidor de desarrollo, en
     **Chromium, WebKit y Firefox** (Firefox sigue sin probar desde la
     fase 1), el bloque del catálogo de referencia:
     - la barra (Atrás, Adelante, Recargar, Ir y el texto del alias);
     - «Recargar» con datos de la API que sobreviven;
     - una edición que conserva la URL;
     - el panel de tipos con un error del router;
     - las comprobaciones con URL;
     - el modo oscuro y 320 px de ancho.

### Riesgos

- **Nadie sabe cuándo termina una navegación declarativa.** El navegador
  de `MemoryRouter`, `BrowserRouter` y `HashRouter` no tiene un «ocupado»;
  en el modo declarativo no hay `loader`, así que no hace falta. Las
  comprobaciones de la ficha usan los routers de datos.
- **Historial propio.** Si el alumno pasa varias `initialEntries` y vuelve
  atrás a una que no visitó, la búsqueda por URL puede elegir mal cuando
  dos entradas tienen la misma URL. Solo afecta a que Atrás y Adelante
  estén activos o no; la navegación la hace el router.
- **`createRoutesStub`** crea su propio router en memoria por dentro, sin
  pasar por el envoltorio: no aparece en la barra. Su lección (la 21)
  monta el stub en la vista previa **sin verificar**.
- **`lazy`** recibe módulos que ya están en memoria: no hay trozos reales
  ni espera. Que `lazy` funcione dentro del router está **sin verificar**
  hasta esta tanda.
- **El árbol de renders** (`mostrarArbol`) enseñaría los componentes
  internos del router, con nombres minificados. Ninguna lección de la
  ficha lo usa con el router; queda como opcional en el temario.
- **Dos copias de React.** Si una versión futura de React Router
  importase algo de React que el plugin no conoce, el build se para en
  vez de meter una segunda copia. Es lo que se busca.

### Fuera de alcance de esta tanda

- **R2: el registro del router (`mostrarRouter`),** con `instrumentations`.
  Va en la tanda siguiente, con su especificación.
  Decidido el 2026-10-26: las lecciones de la ficha que lo usan (1, 2, 4,
  5, 10 y 11) se escriben después de R2; las demás pueden empezar con R0,
  R1 y R3.
- Sacar del árbol de renders los componentes del router.
- `createRoutesStub` registrado en la barra.
- Más bibliotecas en la vista previa (TanStack Query llegará con su ficha,
  reutilizando el mecanismo de R0).
- Las comprobaciones sobre peticiones de red concretas (`{ peticion: … }`).

## React Router en la vista previa: el registro del router (fase R2)

Diseño aprobado con el temario de React Router
([contenido/react-router/TEMARIO.md](../../contenido/react-router/TEMARIO.md),
componente 5). Desbloquea la ayuda visual de las lecciones 1, 2, 4, 5, 10
y 11 y de los proyectos en el navegador 7 y 13. Se apoya en R0, R1 y R3,
que ya están en `main` (PR #63). Esta sección parte del código real de
`main` (9009d9c), no de la especificación de R0–R3: `runtime/router.js`,
`montaje.js`, `VistaPreviaReact.tsx`, `ReactEnVivo.tsx` y
`BarraDirecciones.tsx`.

**Qué ve el alumno.** Un panel «Registro del router» debajo de la vista
previa, con una entrada por cada cosa que hace el router:

- la carga inicial;
- cada navegación, envío, Atrás y Adelante;
- cada llamada de un fetcher;
- cada revalidación.

Dentro de cada entrada, qué `middleware`, `action`, `loader` y `lazy` se
ejecutaron, de qué ruta, cuándo empezaron y cuánto duraron. Así se ve si
fueron a la vez o en cadena. Las entradas se agrupan por fase («Envío»,
«Revalidación», «Carga», «Tras redirigir»), y debajo van los `loader` que
**no** se volvieron a ejecutar. Una navegación que otra interrumpe sale
como cancelada, y un `loader` que sigue trabajando después se marca. Por
ejemplo:

```
#2  Envío · POST /recetas · 47 ms                                terminado
    Envío         middleware /     +4 ms · 1 ms
                  action recetas   +4 ms · 1 ms
    Revalidación  middleware /     +6 ms · 42 ms
                  loader recetas   +6 ms · 42 ms
    Se volvió a ejecutar: recetas. No se volvió a ejecutar: /.
#6  Navegación → /lento                                  cancelada por #7
    Carga         middleware /     +3 ms · 14 ms
                  loader lento     +3 ms · 152 ms · terminó después de cancelarse
```

### Validación (2026-10-27)

Prueba aislada en el *scratchpad* (`spike-r2/`: `inst.test.ts`,
`ctx.test.ts` y `prototipo.test.ts`), con el Vitest y el jsdom de la web,
el `react.js` 19.3.1 y el `react-router.js` 8.5.0 que ya están en
`public/vendor/react-en-vivo/`. También se leyeron
`node_modules/react-router/dist/development/lib/router/instrumentation.{d.ts,js}`
y `docs/how-to/instrumentation.md` de `scripts/react-en-vivo/`.

| Qué se probó | Resultado |
|---|---|
| Qué se puede instrumentar en un router de datos del cliente | `router.instrument({ navigate, fetch })` y `route.instrument({ loader, action, middleware, lazy, 'lazy.loader', 'lazy.action', 'lazy.middleware' })`. Cada función recibe `(llamar, info)` y debe llamar a `llamar()`, que devuelve `{ status: 'success' \| 'error', error }`. El `router` que recibe la instrumentación **solo tiene `instrument`**: no da acceso al estado |
| Qué trae `info` | En `navigate`: `to` (texto o número), `currentUrl` y, si es un envío, `formMethod`, `formEncType` y `formData`. En `fetch`: `href`, `currentUrl`, `fetcherKey` y lo mismo del envío. En `loader`, `action` y `middleware`: `request` como `{ method, url, headers.get }` (**sin `signal`**), `url`, `pattern`, `params` y `context` como `{ get }`, que lee del contexto real. El resultado de `navigate` y `fetch` trae `meta: { url, pattern, params }` (desde 8.1) |
| La carga inicial | **No pasa por `navigate`**: sus `middleware` y `loader` sí se instrumentan, pero sin operación que los agrupe |
| Un `<Form method="post">` | Un solo `navigate`, que dura hasta el final, envuelve el `middleware` y la `action` del `POST` y después el `middleware` y los `loader` de la revalidación (`GET`). Un `loader` saltado por `shouldRevalidate` no aparece |
| Un fetcher con `POST` | Igual: el `fetch` instrumentado incluye la `action` **y la revalidación** |
| Una navegación interrumpida | La primera termina su `navigate` con `status: 'success'` en cuanto empieza la segunda. Su `loader`, si no escucha `request.signal`, sigue y termina después |
| Atrás (`navigate(-1)`) | En 8.5, su `navigate` espera a que terminen sus `loader` (corregido tras la revisión: la prueba original decía que terminaba en el acto) |
| Un `throw data('No existe', { status: 404 })` en un `loader` | La instrumentación lo da como **`success`** (solo marca `error` si lo lanzado es un `Error`). Sí queda en `router.state.errors` |
| `router.revalidate()` (lo que llama `useRevalidator`) y la navegación que sigue a un `redirect()` | No pasan por `navigate` |
| `getContext` | El router lo llama una vez por navegación (también la inicial, la revalidación y la que sigue a una redirección) y una vez por llamada de fetcher. La `action` y su revalidación **comparten** el mismo contexto. `info.context.get(marca)` lee lo que puso `getContext`. En 8.5 lo llama de forma síncrona dentro de `llamar()`, así que la cola de espera nunca tiene más de una operación (corregido tras la revisión). Se mantiene la cola, y su test, por si una versión futura lo retrasa. Una navegación a una ruta que no existe no lo llama |
| Varias instrumentaciones | «Each instrumentation wraps the previous one»: la primera del array es la más interior. Si una función de instrumentación lanza, React Router la traga y escribe «An instrumentation function threw an error:» con `console.error`, que acabaría en la consola del alumno |
| Prototipo completo del diseño de abajo | Atribuye bien la carga inicial, el envío con su revalidación (y el `loader` de la raíz «sin ejecutar» por su `shouldRevalidate`), el fetcher con `POST`, un `fetcher.load` y una navegación a la vez, la navegación cancelada con su `loader` «tardío», `revalidate()`, el envío que redirige, Atrás, la ruta inexistente (404 en `errores`), el 404 lanzado con `data()` y un `Error` |

### Decisiones

1. **Solo API pública de React Router**, sin internos de React ni del
   router. Se captan los pasos con `instrumentations` y las operaciones se
   identifican con `getContext`, las dos documentadas en 8.5. El estado
   final se lee del `router.state` público: `location`, `matches` y
   `errors`.
2. **Una operación, un contexto.** Cada router del registro recibe un
   `getContext` envuelto, que siembra en el contexto de cada navegación o
   llamada de fetcher una marca privada, `{ operacion, fase }`. Cada paso
   instrumentado lee la marca con `info.context.get(marca)`, y así sabe a
   qué operación pertenece aunque haya varias a la vez. Las operaciones que
   abre `navigate` o `fetch` esperan en una cola, y cada llamada a
   `getContext` se lleva la primera (orden comprobado; ver «Riesgos»).
3. **El runtime va aparte**, en `runtime/registro-router.js`, y solo entra
   en el documento de la vista previa visible de un bloque con
   `mostrarRouter`. Nunca en el iframe de las comprobaciones: allí
   sobraría y cambiaría los tiempos.
4. **Se envían operaciones, no eventos sueltos.** Cada mensaje es el estado
   completo de una operación, que la página sustituye por `id`. Como mucho
   uno por operación cada 50 ms, y siempre uno al terminar o cancelarse.
   Como mucho 200 operaciones por carga de la app; pasado el límite, un
   aviso.
5. **Solo el router activo.** Cada router de datos registra sus
   operaciones desde que se crea (la carga inicial empieza antes de que se
   pinte), pero solo se envían las del router que pinta `RouterProvider`.
   Al activarse, envía de golpe lo que tenía guardado.
6. **No hay comprobación nueva.** Lo que enseñan las lecciones 4 y 5 ya se
   puede comprobar con lo que hay: un contador de cargas en la interfaz, o
   la espera `url` y la de texto. Ver «Fuera de alcance».

### Esquemas (`src/lib/laboratorio/schemas.ts`)

```ts
// esquemaReactEnVivo y esquemaReactAnotado ganan:
mostrarRouter: z.boolean().default(false)   // el panel «Registro del router»
```

- **`esquemaReactEnVivo`** gana un `.refine`: si `mostrarRouter`, algún
  archivo tiene que casar con `/\bfrom\s*['"]react-router(?:\/dom)?['"]/`
  (la misma expresión de la regla de las comprobaciones con URL). Mensaje:
  «mostrarRouter necesita que algún archivo importe react-router».
- **`esquemaReactAnotado`** pasa a `.refine` con la misma regla sobre su
  `codigo`. Mensaje: «mostrarRouter necesita que el código importe
  react-router».

### Runtime en el iframe

#### `documento.ts` y `preparar.ts`

- `OpcionesDocumentoReact` y las opciones de `prepararDocumento` ganan
  `conRegistroRouter?: boolean`.
- `runtime/registro-router.js` (`?raw`, con `escaparScript`) entra solo
  si se cumplen las tres: `conRegistroRouter`, `usaRouter` y
  `!conPruebas`. Va justo **antes** de `runtime/router.js`:
  `${codigoRed}${codigoEfectos}${codigoRegistroRouter}${codigoRouter}`.
- La configuración no cambia: basta con que el script esté.

#### `runtime/registro-router.js` (nuevo)

Un IIFE sin dependencias, como `red.js`. Si falta
`window.__reactRouterEnVivo`, no hace nada (ya avisa `router.js`). Si
existe, define `window.__registroRouterEnVivo = { prepararOpciones,
activar, desactivar, descartar, reiniciar }`. **Ninguna de sus funciones
puede lanzar**: todo el cuerpo de cada función de instrumentación y del
`getContext` envuelto va en `try/catch`, porque React Router escribiría el
error en la consola del alumno.

**Estado global del documento:**

- `marca = ReactRouter.createContext(null)` (con valor por defecto, para
  que `get` devuelva `null` en un contexto sin marca);
- `siguienteId`, que crece en todo el documento, también tras «Recargar»,
  hasta 100 000;
- `operacionesEnCarga` y `avisadoLleno`, que vuelven a 0 y a `false` con
  `reiniciar()`.

**`prepararOpciones(opciones)`** crea el registro de un router (`{ router:
null, activo: false, operaciones: [], esperando: [] }`) y devuelve
`{ opciones, conectar }`:

- **`opciones.instrumentations`:** `[instrumentacion(registro),
  ...(Array.isArray(opciones.instrumentations) ? opciones.instrumentations
  : [])]`. La nuestra va **primera** para ser la más interior: sus tiempos
  no incluyen las instrumentaciones del alumno, y se ejecuta aunque la del
  alumno no llame a `llamar()` (React Router lo llama por él, comprobado en
  `recurseRight`).
- **`opciones.getContext`:** una función `async` que:
  1. toma la operación **antes** de cualquier `await`, para conservar el
     orden: la primera de `registro.esperando` (fase `carga` si su método es
     `GET`, `revalidacion` si no). Si la cola está vacía:
     - si hay una navegación o fetcher del registro cuyo `llamar()` aún no
       ha devuelto, se toma la más reciente, con fase `redireccion`;
     - si no, se crea una operación sintética: `carga-inicial` si es la
       primera del registro, `revalidacion` si no, con método `GET`;
  2. obtiene el contexto: `await opciones.getContext()` si el alumno puso
     uno, o `new ReactRouter.RouterContextProvider()`;
  3. si el contexto tiene un `set` que es una función, hace `set(marca, {
     operacion, fase })`;
  4. lo devuelve tal cual. El alumno nunca ve la marca.
- **`conectar(router)`:** guarda el router real en el registro. Lo llama
  `router.js` justo después de crearlo. Antes, la carga inicial ya ha
  empezado sin él: por eso el destino de una operación sintética sale de la
  URL de su primer paso.

**La instrumentación** (`instrumentacion(registro)`):

- **`router.instrument`:**
  - **`navigate(llamar, info)`:**
    1. marca como `cancelada` toda navegación del registro que siga
       abierta, con `canceladaPor` igual al `id` nuevo;
    2. abre una operación:
       - `clase`: `atras` si `info.to === -1`, `adelante` si es `1`, `envio`
         si `formMethod` no es `GET`, y si no `navegacion`;
       - `metodo`: `formMethod` en mayúsculas, o `GET`;
       - `destino`: `info.to` si es texto (con `encodeURI` y recortado a
         200, como la `ubicacion` de R1), y vacío si es un número;
    3. la pone en `esperando` y hace `await llamar()`;
    4. al volver: la quita de `esperando` si sigue ahí (nunca pidió
       contexto: una ruta inexistente o una navegación bloqueada), la marca
       con `llamadaTerminada` y prueba a cerrarla.
  - **`fetch(llamar, info)`:** igual, pero:
    - cancela solo los fetchers abiertos con el mismo `fetcherKey`;
    - `clase` es `fetcher-envio` (método distinto de `GET`) o
      `fetcher-carga`;
    - lleva `fetcher: info.fetcherKey` (recortado a 60) y
      `destino: info.href`.
- **`route.instrument`:** para `loader`, `action`, `middleware`, `lazy`,
  `lazy.loader`, `lazy.action` y `lazy.middleware` (estos cuatro, como
  `tipo: 'lazy'`):
  1. lee `info.context.get(marca)`. En `lazy` no hay `info`, y en la
     prueba se ejecuta **antes** que el primer paso marcado de su
     operación. Por eso se atribuye a la operación abierta más reciente del
     registro, con fase `carga`; si no hay ninguna, no se registra;
  2. sin marca, hace `await llamar()` y no registra nada;
  3. con marca, añade a la operación un paso:
     - `tipo`, y `ruta` con el nombre de la ruta;
     - `fase`: `envio` si `info.request.method` no es `GET`, y si no la
       fase de la marca;
     - `inicio`: los ms desde que empezó la operación;
     - `estado: 'en-curso'`;
  4. sube `pendientes`, hace `await llamar()` y escribe `duracion`, y
     `estado` `ok` o `error` (con `error` como `nombre: mensaje`, recortado
     a 200);
  5. si la operación ya estaba `cancelada` al terminar el paso, lo marca
     `tarde: true`; si es un `loader` terminado, apunta su ruta en
     `ejecutados`;
  6. baja `pendientes` y prueba a cerrar.
- **Nombre de una ruta:** el `id` si lo puso el alumno (no casa con
  `/^\d+(-\d+)*$/`); si no, su `path`; si es una ruta índice sin `path`,
  «índice»; y si nada, el `id`. Como mucho 60 caracteres.
- **Cerrar una operación:** cuando tiene `llamadaTerminada` y
  `pendientes === 0`. Las sintéticas nacen con `llamadaTerminada`. Una
  cancelada se queda abierta mientras le queden pasos, para poder marcarlos
  como tardíos. Al cerrar:
  - `duracion`, y `estado` pasa a `terminada` si no estaba `cancelada`;
  - si hay router conectado y no está cancelada:
    - `urlFinal`: `createPath(router.state.location)`, con `encodeURI` y
      recortado a 200. La página solo lo enseña si difiere del destino;
    - `errores`: las entradas de `router.state.errors`, como mucho 8, cada
      una `{ ruta, texto }`. `ruta` es la del `ErrorBoundary` que lo
      recoge; `texto` es `«estado data»` si `isRouteErrorResponse`, el
      `message` si es un `Error`, o `String(error)`; todo recortado a 200;
    - `sinEjecutar`: las rutas de `router.state.matches` con un `loader`
      que no está en `ejecutados`, como mucho 16. No se calcula para
      `fetcher-carga` (su `loader` no es de la página) ni si hay `errores`.
- **Publicar** (`publicar(operacion)`):
  - solo si el registro está `activo`;
  - como mucho un mensaje por operación cada 50 ms (con un temporizador
    por operación), y siempre uno inmediato al cerrarse o cancelarse;
  - el mensaje lleva el estado completo; `pasos` se recorta a 40, con
    `truncado: true`.
- **Límite:**
  - cada operación nueva suma 1 a `operacionesEnCarga`;
  - si ya van 200, no se crea: sus pasos no se registran, y se envía una
    sola vez `{ tipo: 'router-lleno' }`;
  - las operaciones abiertas siguen actualizándose.
- **`activar(router)`:** marca activo el registro de ese router y publica,
  en orden, todas sus operaciones. **`desactivar(router)`** lo marca
  inactivo.
- **`descartar(router)`:** olvida su registro y sus temporizadores.
- **`reiniciar()`:** descarta todos los registros y pone a 0 el límite. No
  toca `siguienteId`.

#### Cambios en `runtime/router.js`

- **`createMemoryRouter` y `crearRouterAlias`.** Si existe
  `window.__registroRouterEnVivo`, pasan sus opciones finales por
  `prepararOpciones`, crean el router con las opciones que devuelve y
  llaman a `conectar(router)` antes de `registrarRouterDatos`. Sin
  registro, no cambian.
- **`RouterProviderEnVivo`.** En su `useLayoutEffect`, después de
  `activarRouterDatos(router)`, llama a
  `__registroRouterEnVivo?.activar(router)`; en la limpieza, a
  `desactivar(router)`.
- **El `dispose` envuelto** llama a `__registroRouterEnVivo?.descartar(router)`.
- **`reiniciar()`** (lo usan «Recargar», «Ir» y cada comprobación) llama
  a `__registroRouterEnVivo?.reiniciar()`.
- **Los routers declarativos** (`MemoryRouter`, `BrowserRouter` y
  `HashRouter`) no tienen datos ni instrumentación: no hay registro.

### Mensajes

Iframe → página, en `esquemaMensajeReactEnVivo` (`mensajes.ts`):

```ts
const nombreRuta = z.string().min(1).max(60)
const ms = z.number().int().min(0).max(600_000)
const pasoRouter = z.object({
  tipo: z.enum(['middleware', 'loader', 'action', 'lazy']),
  ruta: nombreRuta,
  fase: z.enum(['carga', 'envio', 'revalidacion', 'redireccion']),
  inicio: ms,                       // desde que empezó la operación
  duracion: ms.optional(),          // sin ella, sigue en curso
  estado: z.enum(['en-curso', 'ok', 'error']),
  error: z.string().max(200).optional(),
  tarde: z.boolean().optional(),    // terminó después de cancelarse la operación
})

z.object({
  canal,
  tipo: z.literal('router-operacion'),
  id: z.number().int().min(1).max(100_000),
  clase: z.enum(['carga-inicial', 'navegacion', 'envio', 'atras', 'adelante',
                 'revalidacion', 'fetcher-carga', 'fetcher-envio']),
  metodo: z.string().regex(/^[A-Z]{1,10}$/),
  destino: z.string().max(200),
  fetcher: z.string().max(60).optional(),
  estado: z.enum(['en-curso', 'terminada', 'cancelada']),
  canceladaPor: z.number().int().min(1).max(100_000).optional(),
  duracion: ms.optional(),
  urlFinal: z.string().max(200).optional(),
  pasos: z.array(pasoRouter).max(40),
  truncado: z.boolean(),
  sinEjecutar: z.array(nombreRuta).max(16).optional(),
  errores: z.array(z.object({ ruta: nombreRuta, texto: z.string().max(200) })).max(8).optional(),
})

z.object({ canal, tipo: z.literal('router-lleno') })
```

Se validan en la frontera como todos: `leerMensajeReactEnVivo` descarta
lo que no venga del iframe esperado (`event.source`) o no pase el
esquema, y todo se pinta como texto. Lo peor que puede falsificar el
código del alumno es un registro falso en su propio navegador. No hay
mensajes nuevos de la página al iframe.

### Componentes (`src/components/bloques-laboratorio/`)

- **`RegistroRouter.tsx`** (nuevo). Props: `{ operaciones:
  MensajeRouterOperacion[], lleno: boolean, soloDeclarativo: boolean,
  onLimpiar }`.
  - **Cabecera.** «Registro del router», con su icono y el botón «Limpiar»,
    como `RegistroEfectos`.
  - **Contenedor.** `role="region"`, `aria-label="Registro del router"` y
    `aria-live="off"`, en monoespaciada, con `max-h-80 overflow-auto`.
    Dentro, un `<ol aria-label="Operaciones del router">` en orden
    cronológico (la más nueva, abajo), con como mucho las 100 últimas.
  - **Cada operación** es un `<li>` con una línea de resumen: `#id`, la
    clase en español y el método y destino, la duración o «en curso», y el
    estado **escrito**, no solo con color:
    - «Carga inicial /recetas»;
    - «Navegación → /lento»;
    - «Envío · POST /recetas»;
    - «Atrás → /recetas» (el destino sale de `urlFinal`);
    - «Revalidación /recetas»;
    - «Fetcher «nueva» · carga /lento» y «Fetcher «nueva» · POST /recetas».

    Si `urlFinal` difiere del destino: «· acabó en /». Si está cancelada:
    «cancelada por #7».
  - **Debajo, sus pasos**, en un `<ul>` agrupado por fase, con el nombre de
    la fase en un `<p>` («Envío», «Revalidación», «Carga», «Tras
    redirigir»). Cada paso: «loader recetas · +6 ms · 42 ms», «… en curso»,
    «… · error: Error: se rompió», y «· terminó después de cancelarse» si
    `tarde`.
  - **Una barra por paso**, decorativa (`aria-hidden`), con su `inicio` y
    su `duracion` sobre la duración de la operación, para que se vea a
    simple vista lo que va a la vez y lo que va en cadena. La información
    ya está en el texto. Sin animación.
  - **Al final de la operación:**
    - «Se volvió a ejecutar: …», con los `loader` de la fase
      `revalidacion` o `carga`;
    - «No se volvió a ejecutar: …» (`sinEjecutar`). Nunca dice por qué: no
      lo sabe;
    - «Error en pantalla (ErrorBoundary de raíz): 404 No existe»
      (`errores`);
    - «Lista truncada: más de 40 pasos» si `truncado`.
  - **Avisos:**
    - con `lleno`: «El registro se ha detenido: más de 200 operaciones en
      esta carga. ¿Hay un bucle de navegaciones?»;
    - con `soloDeclarativo` (la `ubicacion` dice `MemoryRouter`,
      `BrowserRouter` o `HashRouter`) y sin operaciones: «Este router no
      carga datos: el registro necesita un router de datos
      (createMemoryRouter o createBrowserRouter con RouterProvider).»;
    - sin operaciones: «Todavía no hay actividad del router.».
  - **Lector de pantalla:** un `<p role="status" className="sr-only">`
    anuncia, como mucho una vez por segundo, la última operación terminada
    o cancelada («Envío POST /recetas terminado en 47 ms: 1 action y 1
    loader»). Nada más: el resto del registro no interrumpe.
  - **Visual:** tokens de la web en claro y oscuro (los colores de
    `RegistroEfectos` y `PanelRed`): terminado en verde, en curso en ámbar,
    cancelado y error en rojo, siempre con su texto. A 320 px, el resumen
    salta de línea (`break-words`) y la barra de cada paso ocupa su propia
    fila bajo el texto.
- **`ReactEnVivo.tsx` y `ReactAnotado.tsx`:**
  - prop `mostrarRouter`; `prepararDocumento` recibe
    `conRegistroRouter: mostrarRouter` en la vista previa visible, y nunca
    en el documento de las comprobaciones;
  - `useRegistroAgrupado(100, incorporarOperaciones)`, donde
    `incorporarOperaciones` sustituye por `id` o añade al final;
  - en `recibir`: `router-operacion` solo con `documentoMontadoRef.current`
    (como `efecto` y `arbol`), y `router-lleno` pone `lleno`;
  - el panel va después de `ArbolDeRenders` y antes de `PanelRed`: el
    router llama a la API simulada, y así se leen de arriba abajo;
  - `soloDeclarativo` sale de la última `ubicacion`;
  - **se vacía** (y `lleno` vuelve a `false`) en el mismo sitio que el
    registro de efectos: al construir un documento nuevo por una edición,
    con «Recargar» e «Ir» (`actuarEnNavegador`), con «Reiniciar» y con
    «Limpiar». Tras «Limpiar», las actualizaciones de una operación que se
    había vaciado la vuelven a añadir: es lo esperado.
- **`/admin/referencia-contenido`:** el bloque de R1 (`createMemoryRouter`
  con API simulada) gana `mostrarRouter`, una `action` con `<Form>` y una
  raíz con `shouldRevalidate` que no revalida tras un `POST`.
  `specs/features/laboratorios.md` lista el campo nuevo.

### Tests

Los escribe y los pasa Codex. Ninguno necesita red ni navegador.

**`src/lib/laboratorio/schemas.test.ts`**

- «mostrarRouter vale false por defecto en react-en-vivo y react-anotado».
- «mostrarRouter sin importar react-router no valida»: el mensaje exacto en los dos bloques.
- «mostrarRouter con import de react-router valida».

**`src/lib/react-en-vivo/documento.test.ts`**

- «incluye registro-router.js antes de router.js con conRegistroRouter y un require de react-router»: el orden, con `indexOf`.
- «no lo incluye sin conRegistroRouter, sin react-router ni en el documento de las comprobaciones».

**`src/lib/react-en-vivo/mensajes.test.ts`**

- «acepta una router-operacion completa y router-lleno».
- «rechaza más de 40 pasos, un id 0, una clase o fase desconocidas, un destino de más de 200 caracteres y un error de más de 200».

**`src/lib/react-en-vivo/registro-router.test.ts`** (nuevo, jsdom,
**bundles reales**)

Con el mismo `instalar(…)` que `router.test.ts`: los bundles reales con
`new Function`, `registro-router.js` antes de `router.js` y `montaje.js`,
y módulos TSX que pasan por `transformarArchivos`. Los mensajes se leen de
`__enviarReactEnVivo`, quedándose con el último de cada `id`.

- «la carga inicial es una operación carga-inicial con el middleware y los dos loader a la vez»: dos `loader` con `inicio` que difiere en menos de 10 ms, y el `middleware` de la raíz empieza antes y termina después.
- «una action con `<Form>` registra el envío y la revalidación»: el caso de la lección 4. Hay una raíz con `loader` y `shouldRevalidate: ({ formMethod, defaultShouldRevalidate }) => formMethod === 'POST' ? false : defaultShouldRevalidate`, y una hija `recetas` con `loader` y `action`. Tras `requestSubmit()`, el último `router-operacion` es:
  - `clase: 'envio'` y `metodo: 'POST'`;
  - pasos `action recetas` en fase `envio` y `loader recetas` en fase `revalidacion`, y ningún `loader` de la raíz;
  - `sinEjecutar: ['/']` y `estado: 'terminada'`.
- «un fetcher con POST incluye su action y la revalidación en la misma operación».
- «un fetcher.load y una navegación lanzados seguidos se atribuyen cada uno a su operación».
- «una navegación interrumpida queda cancelada por la nueva y su loader lento sale tarde».
- «revalidate() es una operación revalidacion».
- «un envío cuya action redirige muestra la fase redireccion y urlFinal».
- «Atrás es una operación atras que termina cuando terminan sus loader».
- «un lazy de función se atribuye a la navegación que lo pide, antes de su loader».
- «un throw data() de 404 sale en errores con su texto, y un Error, como paso con error».
- «una ruta inexistente no deja la cola desordenada»: la operación siguiente se atribuye bien.
- «las instrumentations del alumno siguen funcionando y no cambian lo registrado»: su `navigate` se llama, y los pasos son los mismos.
- «el getContext del alumno sigue funcionando»: un `loader` lee su valor con `context.get`.
- «una instrumentación del alumno que lanza no rompe el registro».
- «solo se envía el router activo, y al activarse envía lo que tenía»: un router creado sin pintar no envía nada.
- «recargar empieza un registro nuevo con ids que siguen creciendo».
- «más de 200 operaciones envían router-lleno una sola vez».
- «no envía más de un mensaje por operación cada 50 ms»: con temporizadores falsos.
- «sin registro-router.js, router.js funciona igual que antes» (protege R1).

**Componentes**

- `RegistroRouter.test.tsx`:
  - «enseña cada clase de operación con su texto en español»;
  - «agrupa los pasos por fase y escribe inicio y duración»;
  - «escribe «Se volvió a ejecutar» y «No se volvió a ejecutar»»;
  - «marca cancelada por #N y los pasos tardíos»;
  - «enseña los errores con su ErrorBoundary»;
  - «el aviso de lleno, el de router declarativo y el vacío»;
  - «las barras son aria-hidden y el estado no depende solo del color»;
  - «el status anuncia como mucho una operación por segundo» (temporizadores falsos);
  - «Limpiar llama a onLimpiar».
- `ReactEnVivo.test.tsx`:
  - «con mostrarRouter, el documento de la vista previa lleva registro-router.js y el de comprobar no»;
  - «pinta las operaciones que llegan y sustituye por id»;
  - «vacía el registro al editar, con Recargar y con Reiniciar»;
  - «ignora router-operacion antes de montado».
- `ReactAnotado.test.tsx`: «con mostrarRouter enseña el registro».

### Quién hace qué

1. **Antes de Codex:** nada. No hay dependencias nuevas;
   `scripts/react-en-vivo/node_modules` ya tiene `react-router` 8.5.0 y
   los bundles de `public/` no cambian.
2. **Codex:** implementa esta sección y sus tests, y pasa `npm run test` y
   `npm run lint`.
3. **Claude, después:**
   - revisa el diff y pasa `npm run test`, `npm run build` y
     `npm run lint` en local;
   - verifica con Playwright, en **Chromium y WebKit**, el bloque del
     catálogo de referencia:
     - la carga inicial;
     - un envío con su revalidación y su «No se volvió a ejecutar»;
     - un fetcher;
     - dos clics seguidos en enlaces lentos (la cancelada, con su `loader`
       tardío);
     - «Recargar», «Reiniciar» y «Limpiar»;
     - el modo oscuro y 320 px de ancho.

   **Firefox no se puede probar en este entorno:** queda en «Pendiente».

### Riesgos

- **La atribución por orden.** Que `getContext` se llame en el mismo orden
  en que empiezan las operaciones está comprobado, no documentado. Para no
  romperlo por nuestra cuenta, la operación se toma **antes** de esperar
  al `getContext` del alumno. Una navegación que nunca pide contexto (una
  ruta inexistente, o una que bloquea `useBlocker`) sale de la cola cuando
  vuelve su `llamar()`. Si en ese instante ya ha llegado el `getContext`
  de otra operación, sus pasos se atribuirían mal; es un caso estrecho, y
  solo afecta al dibujo. El test con bundles reales del orden avisa si una
  versión nueva lo cambia.
- **Lo que la API no cuenta:**
  - un `throw data()` o un `throw redirect()` salen como `ok` en el paso;
    el error se ve en `errores` (desde `router.state.errors`), en la
    operación y no en el paso que lo lanzó;
  - la cancelación no llega en `info` (el `request` no trae `signal`): se
    deduce de que empiece otra navegación, u otro fetcher con la misma
    clave.
- **`sinEjecutar` es una deducción:** rutas de la página con `loader` que
  no se ejecutaron en esa operación, por la regla por defecto o por
  `shouldRevalidate`. El panel no dice por qué.
- **Los tiempos no son un perfilador:** milisegundos enteros, con la
  latencia de la API simulada incluida.
- **`lazy` se atribuye por cercanía**, a la operación abierta más
  reciente, porque su instrumentación no trae contexto. Con dos
  operaciones a la vez puede caer en la que no es. La lección 11 lo enseña
  con una sola navegación.
- **`patchRoutesOnNavigation`:** no se ha comprobado si las rutas que añade
  se instrumentan. Ninguna lección lo usa en vivo.
- **`StrictMode`:** el `useLayoutEffect` del `RouterProvider` envuelto se
  ejecuta dos veces; `activar` es idempotente y la página sustituye por
  `id`.

### Fuera de alcance de esta tanda

- **Una comprobación sobre el registro**, como «la action no volvió a
  ejecutar el loader de la raíz». Haría falta el registro en el iframe de
  las comprobaciones y un lenguaje para describir operaciones. Para las
  lecciones 4 y 5 basta con lo que hay: un contador de cargas pintado en
  la app y las esperas de texto y de `url`.
- El registro en el iframe de las comprobaciones.
- Los argumentos y los valores devueltos por `loader` y `action`: ni
  tamaño ni privacidad lo justifican. La consola ya está para eso.
- La instrumentación de servidor (`handler`) del modo framework: no hay
  servidor en la vista previa.
- Exportar o copiar el registro.
- Sacar del árbol de renders los componentes del router (sigue opcional).

### Decidido el 2026-10-26 (antes de implementar)

1. **Atribuir cada paso por el orden de llamada a `getContext`:** aprobado. El test del orden con los bundles reales es obligatorio: es el que avisa si una versión nueva de React Router lo cambia.
2. **Ninguna comprobación nueva sobre el registro:** aprobado. Los ejercicios de las lecciones 4 y 5 usan un contador pintado en la app y las esperas de texto y de `url`.
3. **`mostrarRouter` también en `react-anotado`:** aprobado, para la lección 1.

### Corregido tras la revisión (2026-10-26)

La revisión independiente encontró que las operaciones **sintéticas** (las que no tienen un `navigate` ni un `fetch` instrumentado: la carga inicial, `revalidate()` y seguir tras `useBlocker`) se cerraban antes de que el router confirmara su estado. Daban información falsa justo en las lecciones 4 y 10 y en el proyecto 13. El diseño cambia así:

- **Cuándo se cierran.** Al conectar, el registro se suscribe al router (`router.subscribe`) y cierra las sintéticas abiertas cuando el estado está `initialized` y `navigation` y `revalidation` vuelven a `idle`. Hasta entonces no se calculan `urlFinal`, `errores` ni `sinEjecutar`. Así, un 404 lanzado en la carga inicial sale en `errores`, y una revalidación sin `loader` termina.
- **Qué clase tienen.** Sale del estado del router al llamar a `getContext`:
  - `carga-inicial` si aún no está `initialized`;
  - `revalidacion` si `revalidation === 'loading'`;
  - `navegacion` en otro caso (por ejemplo, seguir tras `useBlocker`).

  Antes se usaba «es la primera operación».
- **Redirecciones.** Las sintéticas abiertas también reciben la fase `redireccion`. La redirección de un middleware en la carga inicial queda en la misma operación.
- **Cancelación.** Una navegación nueva cancela cualquier operación abierta que no sea de un fetcher, incluidas la carga inicial y una revalidación.
- **`getContext` del alumno.** Si lanza, su error se propaga como sin registro. Solo `contexto.set(marca, …)` va protegido.
- **El panel.**
  - En una carga dice «Se ejecutó»; solo en una revalidación dice «Se volvió a ejecutar».
  - Las barras ya no llevan `sm:col-start-2`, que las desalineaba.
  - La fusión de operaciones recorta a 100 en cada paso.
- **Sin test automático para `useBlocker`.** En el entorno jsdom de los tests, `useBlocker` no bloquea (tampoco sin registro), así que ese caso se verifica en el navegador.

