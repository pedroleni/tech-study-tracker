# React en vivo (fases 0 y 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resaltado JSX/TSX en los bloques estáticos (fase 0) y dos bloques nuevos, `react-en-vivo` y `react-anotado`, que ejecutan React 19.3.1 real en un iframe aislado, con varios archivos, consola agrupada por commit, "JavaScript generado" y ejercicios con comprobaciones (fase 1).

**Architecture:** La lección transforma cada `.jsx` con Sucrase (cargado con `import()`), arma un `srcdoc` con un puente (hook de DevTools, consola, errores, altura), el runtime de React servido desde `public/react-en-vivo/19.3.1/`, y un montaje con registro de módulos CommonJS. El iframe habla con la página solo por `postMessage` validado con Zod. Las comprobaciones corren con Testing Library en un segundo iframe fuera de pantalla.

**Tech Stack:** React 19.3.1 (solo dentro del iframe; la web sigue en 19.2.4), Sucrase 3.35.1, esbuild 0.28.2, @testing-library/dom 10.4.2 + @testing-library/user-event 14.6.8 (dentro del iframe), CodeMirror, Zod 4, Vitest + jsdom.

**Spec:** [specs/features/react-en-vivo.md](../../../specs/features/react-en-vivo.md) — fuente de verdad; leerla entera antes de cada tarea. El temario que la motiva: [contenido/react/TEMARIO.md](../../../contenido/react/TEMARIO.md).

**Ejecución en este proyecto:** las tareas marcadas **(Codex)** se lanzan con `npm run codex:task -- "<prompt>" <esfuerzo>`; las marcadas **(Claude)** las hace Claude, porque necesitan red (`npm install`) o un navegador real. Codex no tiene red ni puede abrir puertos: nunca le toca instalar dependencias ni verificar en el navegador.

## Global Constraints

- Versión del runtime: `19.3.1`, en la ruta `/react-en-vivo/19.3.1/react.js` y `/react-en-vivo/19.3.1/pruebas.js`.
- `sucrase` se fija a `3.35.1` exacto en `package.json` (sin `^`), igual que `sql.js` y `wasm-git`.
- Canal de todos los mensajes: `'react-en-vivo'`.
- Iframes: `sandbox="allow-scripts allow-forms"` exacto, nunca `allow-same-origin`.
- Altura de la vista previa: entre 160 y 2400 px, como `editor-en-vivo`.
- Reconstruir la vista previa 400 ms después de la última tecla.
- Comprobaciones: espera de 1500 ms por comprobación; tiempo máximo total de 15 s.
- Consola: máximo 200 entradas; cada texto, máximo 2000 caracteres.
- Desfase de línea de los módulos evaluados con `new Function`: 2.
- Sin `dangerouslySetInnerHTML` en ningún archivo nuevo.
- Textos de interfaz exactos: eyebrow "React en vivo" / "React anotado"; botones "Reiniciar", "Comprobar", "Limpiar"; pestaña "JavaScript generado"; títulos "Vista previa" y "Consola"; "La comprobación tardó demasiado. Revisa si tu código se queda en un bucle."; "Error de sintaxis en {archivo}, línea {n}: {mensaje}"; "{n} de {total} comprobaciones superadas".
- Estilo del repo: identificadores en español, comentarios solo donde expliquen un porqué, clases Tailwind y estructura de tarjeta iguales a `EditorEnVivo.tsx`.
- Antes de cerrar cada tarea: `npm run test` y `npm run lint` en verde (Codex); `npm run build` además en las tareas de Claude.

## Review Focus

1. **Error de sintaxis mientras se escribe** (es el estado normal al teclear): la vista previa se queda en el último resultado válido y aparece "Error de sintaxis en App.jsx, línea N: ..." bajo el editor. Test en la Task 5.
2. **`App.jsx` sin `export default`** (`export function App`): mensaje claro en la vista previa, no una página en blanco. Test en la Task 4.
3. **Importar algo que no existe o un paquete de npm** (`import axios from 'axios'`, `import T from './Tarjta'`): error en español que nombra el import. Test en la Task 4.
4. **Comprobar con una app que revienta al renderizar**: cada comprobación falla con "La app no llegó a mostrarse: ...", sin colgarse hasta el tiempo máximo. Test en la Task 4.
5. **Consola inundada** (un `console.log` dentro del render): textos recortados a 2000 caracteres en el iframe, solo las 200 últimas entradas en la página, y actualizaciones agrupadas para no renderizar una vez por mensaje. Tests en las Tasks 4 y 5.

---

### Task 1 (Codex): Fase 0 — JSX/TSX en el resaltador y en los bloques estáticos

**Files:**
- Modify: `src/components/codigo/resaltador.ts`
- Modify: `src/components/codigo/resaltador.test.ts`
- Modify: `src/lib/laboratorio/schemas.ts:3-30` (`lenguaje` de `esquemaPrediceElResultado` y `esquemaCodigoAnotado`)
- Modify: `src/lib/laboratorio/schemas.test.ts`
- Modify: `src/components/bloques-laboratorio/CodigoAnotado.tsx:57` y `src/components/bloques-laboratorio/PrediceElResultado.tsx:45` (etiqueta accesible fija en "HTML")
- Create: `src/components/bloques-laboratorio/CodigoAnotado.test.tsx`
- Modify: `src/routes/AdminReferenciaContenidoPage.tsx` (ejemplo)

**Interfaces:**
- Produces: `type Lenguaje = 'html' | 'css' | 'js' | 'jsx' | 'tsx' | 'sql' | 'texto'`; `tokenizar(codigo, 'jsx' | 'tsx')`. Las Tasks 5 y 6 usan `lenguaje="jsx"` en `CodigoResaltado`.

- [ ] **Step 1: Tests del resaltador que fallan** (en `resaltador.test.ts`, mismo estilo que los existentes)

```ts
const etiquetas = (codigo: string, lenguaje: Lenguaje = 'jsx') =>
  tokenizar(codigo, lenguaje).filter((t) => t.tipo === 'etiqueta').map((t) => t.texto)

describe('tokenizar jsx', () => {
  it.each([
    'export default function App() {\n  return <div className="a">{x}</div>\n}',
    'const A = () => <p>Hola</p>',
    '<Lista render={() => <Item />} />',
    'return <div>',           // a medio escribir
    '<p>{"}"}</p>',
    'cond && <p>Don\'t</p>',
    '<>\n  <li>a</li>\n</>',
  ])('conserva el código exacto: %s', (codigo) => {
    expect(tokenizar(codigo, 'jsx').map((t) => t.texto).join('')).toBe(codigo)
  })

  it('reconoce etiquetas, atributos, cadenas y llaves', () => {
    const tokens = tokenizar('return <div className="a">{x}</div>', 'jsx')
    expect(etiquetas('return <div className="a">{x}</div>')).toEqual(['div', 'div'])
    expect(tokens).toContainEqual({ tipo: 'atributo', texto: 'className' })
    expect(tokens).toContainEqual({ tipo: 'cadena', texto: '"a"' })
  })
  it('no confunde comparaciones ni genéricos con JSX', () => {
    expect(etiquetas('if (a < b) {}')).toEqual([])
    expect(etiquetas("const [t, setT] = useState<string>('')", 'tsx')).toEqual([])
    expect(etiquetas('f<T>(x)', 'tsx')).toEqual([])
  })
  it('abre JSX en posición de expresión', () => {
    expect(etiquetas('x && <p>a</p>')).toEqual(['p', 'p'])
    expect(etiquetas('const A = () => <p />')).toEqual(['p'])
    expect(etiquetas('cond ? <A /> : <B />')).toEqual(['A', 'B'])
  })
  it('admite fragmentos, nombres con punto y JSX dentro de atributos', () => {
    expect(tokenizar('<>\n  <li>a</li>\n</>', 'jsx')).toContainEqual({ tipo: 'puntuacion', texto: '<>' })
    expect(tokenizar('<>\n  <li>a</li>\n</>', 'jsx')).toContainEqual({ tipo: 'puntuacion', texto: '</>' })
    expect(etiquetas('<Lista.Item />')).toEqual(['Lista.Item'])
    expect(etiquetas('<Lista render={() => <Item />} />')).toEqual(['Lista', 'Item'])
  })
  it('el texto hijo es texto, aunque tenga apóstrofos', () => {
    expect(tokenizar("cond && <p>Don't</p>", 'jsx')).toContainEqual({ tipo: 'texto', texto: "Don't" })
    expect(etiquetas('<p>{"}"}</p>')).toEqual(['p', 'p'])
  })
  it('tsx añade las palabras clave de TypeScript; jsx no', () => {
    const tsx = tokenizar('interface Props { readonly x: number }', 'tsx')
    expect(tsx).toContainEqual({ tipo: 'palabraClave', texto: 'interface' })
    expect(tsx).toContainEqual({ tipo: 'palabraClave', texto: 'readonly' })
    expect(tokenizar('interface X {}', 'jsx')).not.toContainEqual({ tipo: 'palabraClave', texto: 'interface' })
  })
})
```

- [ ] **Step 2: Ejecutar y ver que falla** — `npx vitest run src/components/codigo/resaltador.test.ts` → FAIL (`'jsx'` no es un `Lenguaje`).

- [ ] **Step 3: Implementar en `resaltador.ts`**

Enfoque (lo que los tests no determinan):
- Convertir `tokenizarJs` en `tokenizarJsDesde(codigo, inicio, salida, opciones: { jsx: boolean; ts: boolean }, hastaLlave: boolean): number`, que devuelve el índice donde paró. Con `hastaLlave`, lleva un contador de `{`/`}` propios y para en la `}` que cierra; `tokenizarJs(codigo, salida)` sigue existiendo como envoltorio (lo usan `'js'` y el contenido de `<script>`).
- Guardar el último token significativo (sin espacios ni comentarios). `<` abre JSX solo si `opciones.jsx`, el último token significativo no es un identificador (`texto` o `funcion`), un `numero`, una `cadena`, `)` ni `]`, y el carácter siguiente es una letra o `>`.
- `tokenizarElementoJsx(codigo, inicio, salida, opciones): number`: `<` + nombre (`/^[A-Za-z][\w.:-]*/`, tipo `etiqueta`) o `<>`; atributos como en `tokenizarEtiqueta`, pero un valor `{` emite `{` (`puntuacion`), llama a `tokenizarJsDesde(..., true)` y emite `}`; termina en `/>` o `>`. Tras `>`, los hijos: texto hasta `<` o `{` (`texto`), `{expresión}`, `</nombre>` / `</>` (cierre, devuelve), `<` + letra o `>` (elemento anidado, recursivo); al final del código, devuelve sin más (código a medio escribir).
- El recorrido es de una sola pasada: el texto de JSX nunca lo lee el tokenizador de JavaScript, así un `Don't` no abre una cadena.
- `PALABRAS_CLAVE_TS` (solo con `opciones.ts`): `interface`, `type`, `enum`, `implements`, `private`, `public`, `protected`, `readonly`, `keyof`, `satisfies`, `declare`, `namespace`, `abstract`, `is`, `infer`, `unique`.

- [ ] **Step 4: Ejecutar** — `npx vitest run src/components/codigo/resaltador.test.ts` → PASS, incluidos los tests anteriores de html/css/js/sql sin cambios.

- [ ] **Step 5: Esquemas, test que falla** (en `schemas.test.ts`)

```ts
describe('lenguaje jsx/tsx en bloques estáticos', () => {
  it('codigo-anotado y predice-el-resultado aceptan html, jsx y tsx; html por defecto', () => {
    const anotado = { tipo: 'codigo-anotado', codigo: '<p />', anotaciones: [{ fragmento: 'p', nota: 'n' }] }
    expect(esquemaCodigoAnotado.parse(anotado).lenguaje).toBe('html')
    expect(esquemaCodigoAnotado.parse({ ...anotado, lenguaje: 'jsx' }).lenguaje).toBe('jsx')
    expect(esquemaCodigoAnotado.safeParse({ ...anotado, lenguaje: 'javascript' }).success).toBe(false)
    const predice = { tipo: 'predice-el-resultado', codigo: 'x', opciones: ['a', 'b'], correcta: 0, explicacion: 'e' }
    expect(esquemaPrediceElResultado.parse({ ...predice, lenguaje: 'tsx' }).lenguaje).toBe('tsx')
  })
})
```

- [ ] **Step 6: Cambiar `lenguaje` a `z.enum(['html', 'jsx', 'tsx']).default('html')` en los dos esquemas** y ejecutar `npx vitest run src/lib/laboratorio/schemas.test.ts` → PASS.

- [ ] **Step 7: Etiqueta accesible según el lenguaje — test que falla** (`CodigoAnotado.test.tsx`, nuevo)

```tsx
it('nombra el lenguaje real en la etiqueta del bloque', () => {
  render(<CodigoAnotado tipo="codigo-anotado" lenguaje="jsx" codigo="<p />" anotaciones={[{ fragmento: 'p', nota: 'n' }]} />)
  expect(screen.getByLabelText('Código JSX anotado')).toBeInTheDocument()
})
```

- [ ] **Step 8: Implementar** — `CodigoAnotado` usa `Código ${NOMBRE[lenguaje]} anotado` y `PrediceElResultado` `Código ${NOMBRE[lenguaje]} para predecir`, con `NOMBRE = { html: 'HTML', jsx: 'JSX', tsx: 'TSX' }`. Ejecutar el test → PASS.

- [ ] **Step 9: Ejemplo en el catálogo** — en `AdminReferenciaContenidoPage.tsx`, junto al `CodigoAnotado` existente, un `<Referencia nombre="CodigoAnotado (JSX)">` con este código y dos anotaciones (`'tareas.map'` → "map convierte cada dato en un elemento.", `'key={tarea.id}'` → "La key le dice a React qué fila es cuál entre renders."):

```jsx
export default function Lista({ tareas }) {
  return (
    <ul>
      {tareas.map((tarea) => (
        <li key={tarea.id}>{tarea.texto}</li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 10: Verificar y commit** — `npm run test && npm run lint` → verde.

```bash
git add src/components/codigo src/lib/laboratorio src/components/bloques-laboratorio/CodigoAnotado.tsx src/components/bloques-laboratorio/CodigoAnotado.test.tsx src/components/bloques-laboratorio/PrediceElResultado.tsx src/routes/AdminReferenciaContenidoPage.tsx
git commit -m "feat(laboratorio): resaltado JSX y TSX en codigo-anotado y predice-el-resultado"
```

---

### Task 2 (Claude): Runtime de React, Sucrase y configuración

**Files:**
- Create: `scripts/react-en-vivo/package.json`, `scripts/react-en-vivo/package-lock.json` (generado), `scripts/react-en-vivo/entrada-react.js`, `scripts/react-en-vivo/entrada-pruebas.js`, `scripts/react-en-vivo/construir.mjs`
- Create (generados): `public/react-en-vivo/19.3.1/react.js`, `public/react-en-vivo/19.3.1/pruebas.js`
- Modify: `package.json` + `package-lock.json` (`sucrase` 3.35.1 exacto)
- Modify: `vercel.json` (caché), `eslint.config.js` (`ignores`)

**Interfaces:**
- Produces: `window.__reactEnVivo = { React, ReactDOM, ReactDOMClient, JsxRuntime, JsxDevRuntime }` al cargar `react.js`; `window.__pruebasEnVivo = { ...@testing-library/dom, userEvent }` al cargar `pruebas.js`; el paquete `sucrase` para la Task 4.

- [ ] **Step 1: Paquete aislado.** `scripts/react-en-vivo/package.json` con `"private": true`, `"type": "module"` y dependencias exactas `react@19.3.1`, `react-dom@19.3.1`, `@testing-library/dom@10.4.2`, `@testing-library/user-event@14.6.8`, `esbuild@0.28.2`. Las dos entradas, tal cual se validaron:

```js
// entrada-react.js
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as JsxRuntime from 'react/jsx-runtime'
import * as JsxDevRuntime from 'react/jsx-dev-runtime'
globalThis.__reactEnVivo = { React, ReactDOM, ReactDOMClient, JsxRuntime, JsxDevRuntime }
```

```js
// entrada-pruebas.js
import * as dom from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
globalThis.__pruebasEnVivo = { ...dom, userEvent }
```

`construir.mjs`: esbuild con `bundle: true`, `format: 'iife'`, `platform: 'browser'`, `minify: true`, `legalComments: 'eof'`, `define: { 'process.env.NODE_ENV': '"development"' }`, salida en `../../public/react-en-vivo/19.3.1/`, e imprime tamaño y gzip de cada archivo. Un comentario al principio explica cuándo se ejecuta (solo al cambiar de versión de React) y por qué el paquete está aislado (la web sigue en 19.2.4).
- [ ] **Step 2: Construir.** `cd scripts/react-en-vivo && npm install && node construir.mjs` → `react.js` ≈ 427 KB (127 KB gzip) y `pruebas.js` ≈ 244 KB (56 KB gzip). `grep -c "__reactEnVivo" ../../public/react-en-vivo/19.3.1/react.js` → 1.
- [ ] **Step 3: Sucrase.** `npm install --save-exact sucrase@3.35.1` en la raíz → `package.json` con `"sucrase": "3.35.1"`.
- [ ] **Step 4: Configuración.** `vercel.json` → en `headers`, `{ "source": "/react-en-vivo/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }`. `eslint.config.js` → `ignores: ['dist', 'public/ts-libs', 'public/react-en-vivo']`, con el comentario ampliado.
- [ ] **Step 5: Verificar** — `npm run lint && npm run build` → verde; `git status` no muestra ningún `node_modules`.
- [ ] **Step 6: Commit**

```bash
git add scripts/react-en-vivo public/react-en-vivo package.json package-lock.json vercel.json eslint.config.js
git commit -m "build(react-en-vivo): runtime de React 19.3.1 propio, Sucrase y caché inmutable"
```

---

### Task 3 (Codex): Esquemas de `react-en-vivo`, `react-anotado` y comprobaciones

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts`
- Modify: `src/lib/laboratorio/schemas.test.ts`

**Interfaces:**
- Produces: `esquemaReactEnVivo`, `esquemaReactAnotado`, `esquemaComprobacionReact`, `ROLES_COMPROBACION`, y los tipos `DatosReactEnVivo`, `DatosReactAnotado`, `ComprobacionReact`, `ArchivoReact` (`{ nombre: string; codigo: string }`), `ConsultaElementoReact`. Los dos esquemas de bloque entran en `esquemaBloqueLaboratorio`.

- [ ] **Step 1: Tests que fallan**

```ts
const archivoApp = { nombre: 'App.jsx', codigo: 'export default function App() { return <p>Hola</p> }' }
const minimoEnVivo = { tipo: 'react-en-vivo', archivos: [archivoApp] }

describe('esquemaReactEnVivo', () => {
  it('acepta el mínimo y aplica los valores por defecto', () => {
    const datos = esquemaReactEnVivo.parse(minimoEnVivo)
    expect(datos).toMatchObject({ strictMode: true, mostrarConsola: true, mostrarJsGenerado: false })
    expect(esquemaBloqueLaboratorio.parse(minimoEnVivo).tipo).toBe('react-en-vivo')
  })
  it('exige App.jsx, nombres únicos y válidos, y un archivoInicial existente', () => {
    const fallo = (datos: unknown) => esquemaReactEnVivo.safeParse(datos).success
    expect(fallo({ ...minimoEnVivo, archivos: [{ nombre: 'Main.jsx', codigo: '' }] })).toBe(false)
    expect(fallo({ ...minimoEnVivo, archivos: [archivoApp, archivoApp] })).toBe(false)
    for (const nombre of ['app.tsx', '../App.jsx', 'App.js', 'estilos.scss']) {
      expect(fallo({ ...minimoEnVivo, archivos: [archivoApp, { nombre, codigo: '' }] })).toBe(false)
    }
    expect(fallo({ ...minimoEnVivo, archivoInicial: 'Otro.jsx' })).toBe(false)
    expect(fallo({ ...minimoEnVivo, archivos: [archivoApp, { nombre: 'estilos.css', codigo: 'p{}' }], archivoInicial: 'estilos.css' })).toBe(true)
  })
  it('las comprobaciones distinguen cada forma sin perder campos', () => {
    const espera = (e: unknown) =>
      esquemaComprobacionReact.safeParse({ descripcion: 'd', espera: e })
    expect(espera({ etiqueta: 'Nueva tarea', valor: '' }).data?.espera).toEqual({ etiqueta: 'Nueva tarea', valor: '' })
    expect(espera({ rol: 'listitem', texto: 'Nadar' }).data?.espera).toEqual({ rol: 'listitem', texto: 'Nadar' })
    expect(espera({ ausente: { texto: 'Leer' } }).success).toBe(true)
    expect(espera({ rol: 'boton' }).success).toBe(false)
    expect(espera({ texto: 'x', sobra: 1 }).success).toBe(false)
    expect(esquemaComprobacionReact.parse({ descripcion: 'd', espera: { texto: 'x' } }).pasos).toEqual([])
  })
  it('limita las comprobaciones a 8 y los pasos a 10', () => {
    const c = { descripcion: 'd', espera: { texto: 'x' } }
    expect(esquemaReactEnVivo.safeParse({ ...minimoEnVivo, comprobaciones: Array(9).fill(c) }).success).toBe(false)
    expect(esquemaComprobacionReact.safeParse({ ...c, pasos: Array(11).fill({ teclear: '{Enter}' }) }).success).toBe(false)
  })
})

describe('esquemaReactAnotado', () => {
  it('acepta el mínimo con sus valores por defecto', () => {
    const datos = esquemaReactAnotado.parse({ tipo: 'react-anotado', codigo: archivoApp.codigo, anotaciones: [{ fragmento: 'App', nota: 'n' }] })
    expect(datos).toMatchObject({ css: '', strictMode: true, mostrarConsola: false })
  })
})
```

- [ ] **Step 2: Ejecutar** — `npx vitest run src/lib/laboratorio/schemas.test.ts` → FAIL (no existen).
- [ ] **Step 3: Implementar** — el código de la sección "Esquemas" de la spec, tal cual (objetos estrictos con `z.strictObject`), más los tipos exportados de la lista de Interfaces y su entrada en `esquemaBloqueLaboratorio`.
- [ ] **Step 4: Ejecutar** → PASS. `npm run test && npm run lint` → verde.
- [ ] **Step 5: Commit**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "feat(laboratorio): esquemas de react-en-vivo, react-anotado y comprobaciones"
```

---

### Task 4 (Codex): Motor `src/lib/react-en-vivo/`

**Files:**
- Create: `src/lib/react-en-vivo/runtime/puente.js`, `src/lib/react-en-vivo/runtime/montaje.js` (JavaScript del iframe; se importan como texto con `?raw`, nunca como módulo)
- Create: `src/lib/react-en-vivo/constantes.ts`, `transformar.ts`, `documento.ts`, `mensajes.ts`
- Test: `src/lib/react-en-vivo/runtime.test.ts`, `transformar.test.ts`, `documento.test.ts`, `mensajes.test.ts`

**Interfaces:**
- Consumes: `ArchivoReact`, `ComprobacionReact` (Task 3); `sucrase` (Task 2).
- Produces:
  - `constantes.ts`: `VERSION_REACT_EN_VIVO = '19.3.1'`, `CANAL_REACT_EN_VIVO = 'react-en-vivo'`, `LIMITE_ENTRADAS_CONSOLA = 200`, `ESPERA_RECONSTRUIR_MS = 400`, `TIEMPO_MAXIMO_COMPROBACION_MS = 15000`.
  - `transformarArchivos(archivos: ArchivoReact[]): Promise<ResultadoTransformacion>` con `type ResultadoTransformacion = { ok: true; modulos: Record<string, string>; archivosCss: string[]; css: string } | { ok: false; archivo: string; linea: number | null; mensaje: string }` (claves `'./App.jsx'`, `'./estilos.css'`).
  - `transformarParaMostrar(archivos: ArchivoReact[]): Promise<string>`.
  - `construirDocumentoReact(opciones: { origen: string; css: string; modulos: Record<string, string>; archivosCss: string[]; strictMode: boolean; conPruebas: boolean }): string`.
  - `type MensajeReactEnVivo` (unión de la tabla de mensajes de la spec), `esquemaMensajeReactEnVivo`, `leerMensajeReactEnVivo(evento: MessageEvent, ventanaEsperada: Window | null | undefined): MensajeReactEnVivo | null`.
  - Dentro del iframe: `window.__comprobarReactEnVivo(comprobaciones): Promise<{ descripcion: string; ok: boolean; motivo?: string }[]>`.

- [ ] **Step 1: Tests que fallan de `transformar.test.ts`**

```ts
it('transforma cada .jsx a CommonJS con JSX automático y junta el CSS', async () => {
  const r = await transformarArchivos([
    { nombre: 'App.jsx', codigo: "import './estilos.css'\nexport default function App() { return <p>Hola</p> }" },
    { nombre: 'estilos.css', codigo: 'p { color: red; }' },
  ])
  expect(r.ok).toBe(true)
  if (!r.ok) return
  expect(r.modulos['./App.jsx']).toContain('require("react/jsx-dev-runtime")')
  expect(r.modulos['./App.jsx']).toContain('exports.default')
  expect(r.archivosCss).toEqual(['./estilos.css'])
  expect(r.css).toBe('p { color: red; }')
})
it('devuelve el error de sintaxis con archivo, línea y mensaje limpio', async () => {
  const r = await transformarArchivos([{ nombre: 'App.jsx', codigo: 'export default function App() {\n  return <div>\n}' }])
  expect(r).toEqual({ ok: false, archivo: 'App.jsx', linea: 2, mensaje: 'Unterminated JSX contents' })
})
it('muestra el JavaScript de producción de cada archivo', async () => {
  const texto = await transformarParaMostrar([{ nombre: 'Tarjeta.jsx', codigo: 'export default function Tarjeta() { return <li>a</li> }' }])
  expect(texto).toContain('// Tarjeta.jsx')
  expect(texto).toContain('import {jsx as _jsx} from "react/jsx-runtime"')
  expect(texto).toContain("_jsx('li'")
})
```

- [ ] **Step 2: Implementar `transformar.ts`** — Sucrase cargado una sola vez con `import('sucrase')` (promesa cacheada). Módulos: `transform(codigo, { transforms: ['jsx', 'imports'], jsxRuntime: 'automatic', production: false, filePath: nombre })`. Para mostrar: `{ transforms: ['jsx'], jsxRuntime: 'automatic', production: true }`, cada archivo precedido de `// {nombre}`, separados por una línea en blanco; si uno tiene error: `// {nombre}: corrige el error de sintaxis de la línea {linea} para ver su JavaScript`. Un error de Sucrase trae `loc.line` y el mensaje `Error transforming App.jsx: Unterminated JSX contents (2:15)`: se quita el prefijo hasta `: ` y el sufijo ` (L:C)`. Ejecutar → PASS.

- [ ] **Step 3: `puente.js`** — el algoritmo validado (no lo determinan los tests):

```js
;(() => {
  const enviar = (datos) => parent.postMessage({ canal: 'react-en-vivo', ...datos }, '*')
  window.__enviarReactEnVivo = enviar
  let commits = 0
  const avisarCommit = () => {
    commits += 1
    enviar({ tipo: 'commit', numero: commits })
  }
  // Si la extensión React DevTools ya inyectó su hook, se encadena en vez de sustituirlo.
  const existente = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  if (existente && typeof existente.onCommitFiberRoot === 'function') {
    const original = existente.onCommitFiberRoot
    existente.onCommitFiberRoot = function (...args) {
      avisarCommit()
      return original.apply(this, args)
    }
  } else {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      renderers: new Map(),
      inject(renderer) {
        const id = this.renderers.size + 1
        this.renderers.set(id, renderer)
        return id
      },
      onCommitFiberRoot: avisarCommit,
      onCommitFiberUnmount() {},
      onPostCommitFiberRoot() {},
      checkDCE() {},
    }
  }
  const aTexto = (valor) => {
    if (typeof valor === 'string') return valor
    if (valor instanceof Error) return valor.message
    try {
      return JSON.stringify(valor) ?? String(valor)
    } catch {
      return String(valor)
    }
  }
  // Los avisos de React usan "%s" constantemente: sin sustituir, serían ilegibles.
  const formatear = (args) => {
    if (typeof args[0] !== 'string') return args.map(aTexto).join(' ')
    const resto = args.slice(1)
    const cuerpo = args[0].replace(/%[sdioOc]/g, (marca) => {
      if (resto.length === 0) return marca
      const valor = resto.shift()
      return marca === '%c' ? '' : aTexto(valor)
    })
    return [cuerpo, ...resto.map(aTexto)].join(' ')
  }
  for (const nivel of ['log', 'info', 'warn', 'error']) {
    const original = console[nivel].bind(console)
    console[nivel] = (...args) => {
      enviar({ tipo: 'consola', nivel, texto: formatear(args).slice(0, 2000), commit: commits })
      original(...args)
    }
  }
  window.addEventListener('error', (evento) => enviar({ tipo: 'error', texto: String(evento.message).slice(0, 2000) }))
  window.addEventListener('unhandledrejection', (evento) => {
    const razon = evento.reason instanceof Error ? evento.reason.message : String(evento.reason)
    enviar({ tipo: 'error', texto: razon.slice(0, 2000) })
  })
  const avisarAlto = () => enviar({ tipo: 'alto', alto: document.documentElement.scrollHeight })
  if (typeof ResizeObserver === 'function') new ResizeObserver(avisarAlto).observe(document.documentElement)
  window.addEventListener('load', avisarAlto)
})()
```

- [ ] **Step 4: `montaje.js`** — lee `window.__configReactEnVivo = { modulos, archivosCss, strictMode }`. Comportamiento exacto (lo validado + los mensajes que fijan los tests del Step 5):
  - `EXTERNOS`: `react`, `react-dom`, `react-dom/client`, `react/jsx-runtime`, `react/jsx-dev-runtime` → los objetos de `window.__reactEnVivo`.
  - `resolver(peticion)`: externo → tal cual; si no empieza por `./` → `Error('En este editor solo se puede importar React y tus propios archivos: «' + peticion + '» no está disponible.')`; `.css` → solo si está en `archivosCss`; si no, prueba `peticion` y `peticion + '.jsx'` en `modulos`; si nada → `Error('No encuentro el archivo «' + peticion + '»')`.
  - `requerir(ruta)`: externos y CSS (`{}`) sin evaluar; caché por ruta; cada módulo con `new Function('require', 'module', 'exports', modulos[ruta] + '\n//# sourceURL=' + ruta.slice(2))`.
  - `ubicar(error)` → `{ texto, archivo?, linea? }`: primer `/([A-Za-z][A-Za-z0-9-]*\.jsx):(\d+):\d+/` de `error.stack`, línea menos 2 (mínimo 1); `texto` recortado a 2000.
  - `montar()`: desmonta la raíz anterior; `App = requerir('./App.jsx').default`; si no es función ni objeto con `$$typeof` → `Error('App.jsx tiene que exportar un componente por defecto: export default function App() { … }')`; `createRoot(#root, { onUncaughtError })`, que guarda el error y envía `error-render`; envuelve en `StrictMode` si `strictMode`.
  - Primera ejecución: `try { montar() } catch → enviar error-render`; después, **siempre** `enviar({ tipo: 'montado', version: React.version })`.
  - `window.__comprobarReactEnVivo(comprobaciones)`: por cada una, vacía la caché de módulos, borra el último error y monta con `ReactDOM.flushSync(montar)`. Si falla al montar o hay error de render → `ok: false`, motivo `'La app no llegó a mostrarse: ' + texto`. Consultas con `__pruebasEnVivo.within(document.body)` en ese momento (no `screen`: se ata a un body que aún no existía) y `userEvent.setup({ document })`. Pasos: `escribir` → `clear` + `type` sobre `queryAllByLabelText(etiqueta)[0]`; `pulsar` → `click` sobre el primer elemento de la consulta; `teclear` → `keyboard`; `seleccionar` → `selectOptions`. Espera con `waitFor` y 1500 ms: presencia (al menos uno), `ausente` (ninguno) o `valor` (`.value` exacto). Si algo se rompe durante los pasos → `'Al hacer los pasos, la app falló: ' + texto`. Una consulta `{ rol, texto }` filtra `queryAllByRole(rol, nombre ? { name: nombre } : {})` por `textContent` con espacios normalizados.
  - Escucha `message` con `evento.source === parent`, `canal === 'react-en-vivo'` y `tipo === 'comprobar'`; responde `enviar({ tipo: 'resultado-comprobaciones', resultados })`.
  - Frases (exactas, las fija el Step 5): `describirNinguno` → `{ texto }`: `el texto «X»`; `{ rol: 'button', nombre }`: `ningún botón llamado «X»`; `{ rol: 'checkbox', nombre }`: `ninguna casilla llamada «X»`; `{ rol: 'listitem', texto }`: `ningún elemento de lista con el texto «X»`; rol sin traducción: `ningún elemento con el rol «slider»`; `{ etiqueta }`: `ningún campo con la etiqueta «X»`. Traducciones de rol (género): button botón (m), link enlace (m), heading título (m), textbox campo de texto (m), searchbox buscador (m), checkbox casilla (f), radio opción de radio (f), listitem elemento de lista (m), list lista (f), dialog diálogo (m), img imagen (f), option opción (f), tab pestaña (f), alert alerta (f), status mensaje de estado (m), table tabla (f), row fila (f), cell celda (f). `describirAlguno` usa `un`/`una` en vez de `ningún`/`ninguna` (`el texto «X»` no cambia). Motivos: `No encuentro {ninguno}.` · `Después de los pasos, no aparece {ninguno}.` · `Después de los pasos, todavía aparece {alguno}.` · `El campo «E» contiene «A» y debería contener «V».` (si `V` es vacío: `y debería estar vacío.`) · `No encuentro la opción «O» en el campo «E».` Motivos recortados a 300 caracteres.

- [ ] **Step 5: Tests del runtime en jsdom (`runtime.test.ts`)** — se evalúan los textos `?raw` con React 19.2.4 de la propia web en `window.__reactEnVivo`, `window.__enviarReactEnVivo = vi.fn()` y módulos producidos por `transformarArchivos` reales. Para las comprobaciones, `window.__pruebasEnVivo = { ...await import('@testing-library/dom'), userEvent: falso }`, con un `userEvent` falso (la web tiene user-event 13, sin `setup`) cuyos `clear`/`type`/`click`/`selectOptions` usan `fireEvent`. Restaurar `console` y limpiar `document.body` en `afterEach`. Casos:

```ts
it('monta App con varios archivos y avisa con montado', async () => { /* App importa ./Tarjeta; body contiene el texto; enviar recibe { tipo: 'montado' } */ })
it('error claro si App.jsx no exporta por defecto', async () => {
  // código: 'export function App() { return <p /> }'
  expect(enviados()).toContainEqual(expect.objectContaining({ tipo: 'error-render', texto: expect.stringContaining('App.jsx tiene que exportar un componente por defecto') }))
})
it('error claro al importar un paquete o un archivo que no existe', async () => {
  // "import axios from 'axios'" → texto contiene 'solo se puede importar React y tus propios archivos'
  // "import T from './Tarjta'"   → texto contiene 'No encuentro el archivo «./Tarjta»', archivo 'App.jsx', linea 1
})
it('comprobaciones: escribe, pulsa y espera; nombra lo que falta', async () => {
  // lista de tareas con label "Nueva tarea" y botón "Añadir":
  // [{ pasos: [escribir, pulsar Añadir], espera: { rol: 'listitem', texto: 'Comprar pan' } }] → ok: true
  // [{ pasos: [{ pulsar: { rol: 'button', nombre: 'Guardar' } }], espera: { texto: 'x' } }]
  //   → { ok: false, motivo: 'No encuentro ningún botón llamado «Guardar».' }
  // espera { etiqueta: 'Nueva tarea', valor: '' } tras añadir → ok: true
  // espera { ausente: { texto: 'Leer' } } sin borrar → motivo 'Después de los pasos, todavía aparece el texto «Leer».'
})
it('comprobaciones con una app que revienta al renderizar no se cuelgan', async () => {
  // App lanza new Error('Roto') → cada resultado { ok: false, motivo: 'La app no llegó a mostrarse: Roto' }
})
it('el puente recorta textos de consola a 2000 y formatea %s', () => {
  // console.log('a'.repeat(5000)) → texto.length === 2000
  // console.error('Hola %s, tienes %d', 'Ana', 3) → texto 'Hola Ana, tienes 3'
  // window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot() → { tipo: 'commit', numero: 1 }
})
it('el puente encadena un hook de DevTools que ya existía', () => {
  // hook previo con onCommitFiberRoot espía → tras el puente, llamarlo invoca el espía y envía 'commit'
})
```

- [ ] **Step 6: Implementar `puente.js` y `montaje.js` hasta que el Step 5 pase** — `npx vitest run src/lib/react-en-vivo/runtime.test.ts` → PASS.

- [ ] **Step 7: `documento.ts` y `mensajes.ts`, tests que fallan**

```ts
// documento.test.ts
const doc = construirDocumentoReact({ origen: 'https://ejemplo.test', css: 'p{}', modulos: { './App.jsx': 'x' }, archivosCss: [], strictMode: true, conPruebas: false })
expect(doc).toContain('<script src="https://ejemplo.test/react-en-vivo/19.3.1/react.js"></script>')
expect(doc).not.toContain('pruebas.js')
expect(doc.indexOf('__REACT_DEVTOOLS_GLOBAL_HOOK__')).toBeLessThan(doc.indexOf('react.js')) // el puente antes que React
// conPruebas: true → contiene '/react-en-vivo/19.3.1/pruebas.js'
// un módulo con '</script><script>alert(1)</script>' no cierra el script: el doc contiene '\\u003c/script' y no '</script><script>alert(1)'
// css con '</style>' queda escapado como '<\\/style'

// mensajes.test.ts
const iframe = document.createElement('iframe'); document.body.append(iframe)
const evento = (data: unknown, source: unknown = iframe.contentWindow) => new MessageEvent('message', { data, source: source as Window })
expect(leerMensajeReactEnVivo(evento({ canal: 'react-en-vivo', tipo: 'commit', numero: 2 }), iframe.contentWindow)).toEqual({ canal: 'react-en-vivo', tipo: 'commit', numero: 2 })
expect(leerMensajeReactEnVivo(evento({ canal: 'react-en-vivo', tipo: 'commit', numero: 2 }, window), iframe.contentWindow)).toBeNull()   // otra ventana
expect(leerMensajeReactEnVivo(evento({ canal: 'otro', tipo: 'commit', numero: 2 }), iframe.contentWindow)).toBeNull()
expect(leerMensajeReactEnVivo(evento({ canal: 'react-en-vivo', tipo: 'consola', nivel: 'log', texto: 'a'.repeat(2001), commit: 0 }), iframe.contentWindow)).toBeNull()
expect(leerMensajeReactEnVivo(evento({ canal: 'react-en-vivo', tipo: 'resultado-comprobaciones', resultados: Array(9).fill({ descripcion: 'd', ok: true }) }), iframe.contentWindow)).toBeNull()
```

- [ ] **Step 8: Implementar** — `documento.ts` importa `puente.js?raw` y `montaje.js?raw`; orden: `<style>` (con `</style` escapado), `<script>` del puente, `<script src>` del runtime (y de `pruebas.js` si `conPruebas`), `<div id="root">`, `<script>window.__configReactEnVivo = {JSON con < escapado como \u003c}</script>`, `<script>` del montaje; `</script` escapado en los dos scripts propios. `mensajes.ts`: `z.discriminatedUnion('tipo', [...])` con los límites de la spec (`texto` ≤ 2000, `motivo` ≤ 300, `descripcion` ≤ 160, `resultados` ≤ 8, `alto` finito y ≥ 0, `numero`/`commit` enteros ≥ 0, `linea` entero ≥ 1, `version` ≤ 20). Ejecutar → PASS.

- [ ] **Step 9: Verificar y commit** — `npm run test && npm run lint` → verde.

```bash
git add src/lib/react-en-vivo
git commit -m "feat(react-en-vivo): motor con Sucrase, puente, montaje y comprobaciones"
```

---

### Task 5 (Codex): Componentes y registro

**Files:**
- Create: `src/components/bloques-laboratorio/EditorCodeMirror.tsx` (extraído de `EditorEnVivo.tsx`: `EditorCodigo` + tema, sin cambiar su comportamiento)
- Modify: `src/components/bloques-laboratorio/EditorEnVivo.tsx` (usa `EditorCodeMirror`)
- Create: `VistaPreviaReact.tsx`, `ConsolaReact.tsx`, `ResultadosComprobaciones.tsx`, `ComprobadorReact.tsx`, `ReactEnVivo.tsx`, `ReactAnotado.tsx` (todos en `src/components/bloques-laboratorio/`), con sus `.test.tsx`
- Modify: `src/components/bloques-laboratorio/registro.ts`

**Interfaces:**
- Consumes: Task 4 completo; `DatosReactEnVivo`, `DatosReactAnotado` (Task 3); `CodigoResaltado` con `lenguaje="jsx"` (Task 1).
- Produces:
  - `EditorCodeMirror({ etiqueta, extension, valor, onChange })`.
  - `VistaPreviaReact({ srcDoc: string; onMensaje?: (m: MensajeReactEnVivo) => void })`: iframe con `title="Vista previa de React"`, altura por `alto`, recuadro de error con el último `error-render` o `error` ("Error al renderizar: {texto}" + " — {archivo}, línea {linea}" si los hay), que se vacía al cambiar `srcDoc`.
  - `type EntradaConsola = { id: number; nivel: 'log' | 'info' | 'warn' | 'error'; texto: string; commit: number }`; `ConsolaReact({ entradas: EntradaConsola[]; onLimpiar: () => void })` con `role="log"`, un separador "commit N" cada vez que `commit` cambia respecto a la entrada anterior, y el nivel escrito además de con color.
  - `type ResultadoComprobacion = { descripcion: string; ok: boolean; motivo?: string }`; `ResultadosComprobaciones({ estado: 'comprobando' | 'listo' | 'tiempo-agotado'; resultados: ResultadoComprobacion[] })` con `aria-live="polite"`.
  - `ComprobadorReact({ srcDoc: string; comprobaciones: ComprobacionReact[]; onTerminar: (r: { estado: 'listo'; resultados: ResultadoComprobacion[] } | { estado: 'tiempo-agotado' }) => void })`: iframe fuera de pantalla (`position: absolute; left: -10000px; width: 600px; height: 400px`, `aria-hidden="true"`, `tabIndex={-1}`, `title="Comprobaciones"`); al recibir `montado` de su propio iframe envía `{ canal, tipo: 'comprobar', comprobaciones }` con `postMessage(…, '*')`; termina con `resultado-comprobaciones` o a los 15 000 ms.
  - `ReactEnVivo(props: DatosReactEnVivo)`, `ReactAnotado(props: DatosReactAnotado)`.

- [ ] **Step 1: Tests que fallan** (RTL + jsdom; los mensajes del iframe se simulan con `window.dispatchEvent(new MessageEvent('message', { data, source: iframe.contentWindow }))`):

```tsx
// ReactEnVivo.test.tsx
it('una pestaña por archivo y "JavaScript generado" si se pide; abre archivoInicial', async () => {
  // archivos App.jsx + estilos.css, mostrarJsGenerado, archivoInicial 'estilos.css'
  // pestañas 'App.jsx', 'estilos.css', 'JavaScript generado'; aria-pressed en 'estilos.css'
})
it('la vista previa carga el runtime propio y el código transformado', async () => {
  // await waitFor: el iframe "Vista previa de React" tiene srcdoc con '/react-en-vivo/19.3.1/react.js' y 'jsxDEV'
})
it('un error de sintaxis no rompe la vista previa', async () => {
  // srcdoc válido inicial; se escribe 'export default function App() {\n  return <div>\n}' en App.jsx
  // → aparece 'Error de sintaxis en App.jsx, línea 2: Unterminated JSX contents'; srcdoc igual al anterior
})
it('Reiniciar devuelve los archivos originales', async () => { /* tras editar, el editor vuelve al texto original */ })
it('la consola agrupa por commit, se limpia, guarda las 200 últimas e ignora otros orígenes', async () => {
  // consola con commit 0, 0, 1 → un separador 'commit 1'; 'Limpiar' → vacía
  // 250 mensajes → 200 entradas, la primera visible es la 51
  // el mismo mensaje con source: window → no aparece
})
it('Comprobar lanza el iframe oculto, envía las comprobaciones y pinta el resultado', async () => {
  // clic 'Comprobar' → existe iframe title="Comprobaciones" con aria-hidden y srcdoc con 'pruebas.js'
  // simular 'montado' desde ese iframe → su contentWindow.postMessage recibió { canal: 'react-en-vivo', tipo: 'comprobar', comprobaciones }
  // simular resultado [{ok:true},{ok:false,motivo:'No encuentro ningún botón llamado «Guardar».'}]
  // → '1 de 2 comprobaciones superadas', el motivo visible, el iframe oculto ya no existe
})
it('si la comprobación no responde, avisa a los 15 s', async () => {
  // vi.useFakeTimers(); clic 'Comprobar'; avanzar 15000 → 'La comprobación tardó demasiado. Revisa si tu código se queda en un bucle.'
})

// ReactAnotado.test.tsx
it('enseña el código JSX anotado y lo ejecuta debajo', async () => {
  // getByLabelText('Código JSX anotado'); un botón por anotación válida; iframe "Vista previa de React" con srcdoc
})

// registro
it('registra los bloques nuevos', () => {
  expect(registroBloquesLaboratorio['react-en-vivo']).toBe(ReactEnVivo)
  expect(registroBloquesLaboratorio['react-anotado']).toBe(ReactAnotado)
})
```

- [ ] **Step 2: Ejecutar** → FAIL (no existen).
- [ ] **Step 3: Implementar.** Decisiones que los tests no fijan:
  - `ReactEnVivo` copia la cabecera, el contenedor y los botones de pestaña de `EditorEnVivo.tsx` (icono `Atom` de lucide, eyebrow "React en vivo"). Editor: `javascript({ jsx: true })` para `.jsx`, `css()` para `.css`; la pestaña "JavaScript generado" es un `CodigoResaltado` de solo lectura con `lenguaje="js"`.
  - Reconstrucción: 400 ms después del último cambio, `transformarArchivos`; si `ok`, `construirDocumentoReact({ origen: window.location.origin, ..., conPruebas: false })` y se vacían consola y error; si no, solo se muestra el error de sintaxis. Un contador de versión descarta el resultado de una transformación que llegue después de otra más nueva. Mientras no hay primer `srcDoc`: "Preparando React…".
  - Consola: los mensajes se acumulan en una ref y se vuelcan al estado como mucho cada 50 ms (un `setTimeout`), recortando a las 200 últimas. Los `error` también entran como entradas de nivel `error`.
  - "Comprobar" vuelve a transformar el código actual, monta `ComprobadorReact` con `conPruebas: true` y se desactiva mientras comprueba.
  - `ReactAnotado` sigue la estructura de `GitAnotado.tsx` (botones numerados, nota activa), con `CodigoResaltado lenguaje="jsx"` y debajo `VistaPreviaReact` (y `ConsolaReact` si `mostrarConsola`). Eyebrow "React anotado".
- [ ] **Step 4: Ejecutar** — `npx vitest run src/components/bloques-laboratorio` → PASS, incluidos los tests que ya existían.
- [ ] **Step 5: Verificar y commit** — `npm run test && npm run lint` → verde.

```bash
git add src/components/bloques-laboratorio
git commit -m "feat(react-en-vivo): bloques react-en-vivo y react-anotado"
```

---

### Task 6 (Codex): Catálogo de referencia y documentación

**Files:**
- Modify: `src/routes/AdminReferenciaContenidoPage.tsx`
- Modify: `specs/features/laboratorios.md`

**Interfaces:**
- Consumes: `ReactEnVivo`, `ReactAnotado` (Task 5).

- [ ] **Step 1: Ejemplos** — tras los bloques de Git, `<Referencia nombre="ReactAnotado">` (la lista con `key` de la Task 1 como `App`, con `tareas` definidas dentro, `mostrarConsola`) y `<Referencia nombre="ReactEnVivo (dos archivos, consola, JavaScript generado y comprobaciones)">` con `App.jsx` (lista de tareas con `<label>Nueva tarea <input …/></label>` y botón "Añadir", importando `./Tarjeta` y `./estilos.css`), `Tarjeta.jsx`, `estilos.css`, `mostrarJsGenerado`, y dos comprobaciones: "Al añadir una tarea, aparece en la lista" (`escribir` + `pulsar` → `{ rol: 'listitem', texto: 'Comprar pan' }`) y "El campo se vacía después de añadir" (→ `{ etiqueta: 'Nueva tarea', valor: '' }`). La solución inicial deja la primera en verde y la segunda en rojo, para enseñar los dos estados.
- [ ] **Step 2: Documentación** — en `specs/features/laboratorios.md`, los dos tipos nuevos en la lista de bloques, con una línea cada uno y enlace a `react-en-vivo.md`.
- [ ] **Step 3: Verificar y commit** — `npm run test && npm run lint` → verde.

```bash
git add src/routes/AdminReferenciaContenidoPage.tsx specs/features/laboratorios.md
git commit -m "docs(react-en-vivo): ejemplos en el catálogo de referencia"
```

---

### Task 7 (Claude): Verificación real y cierre

- [ ] **Step 1:** `npm run test && npm run build && npm run lint` en local → verde (la CI no los ejecuta).
- [ ] **Step 2:** servidor de desarrollo + Playwright, sesión de admin, `/admin/referencia-contenido`, y los casos de la validación de la spec con React 19.3.1 real: montaje y versión, dos archivos y CSS aplicado, aviso de `key` en la consola con separadores de commit, render doble de `StrictMode`, error de render con su archivo y línea, error de sintaxis al teclear sin romper la vista previa, "JavaScript generado", comprobaciones (una ✅ y una ❌ con su motivo) con lo escrito en la vista previa intacto, y el ejemplo JSX de la fase 0 coloreado. Capturas en modo claro, oscuro y a 390 px de ancho, sin desbordamiento horizontal.
- [ ] **Step 3:** revisión ligera de seguridad (sin superficie de auth/RLS): leer el diff de `mensajes.ts`, `documento.ts` y los usos de `postMessage`; confirmar que no hay `dangerouslySetInnerHTML` ni `allow-same-origin`.
- [ ] **Step 4:** estado de la spec → "✅ fases 0 y 1 implementadas y verificadas", fila de `specs/features/README.md` actualizada; commit y push a `main`.
