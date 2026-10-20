# React en vivo, fase 3 (API simulada, registro de efectos y almacenamiento) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que las lecciones de efectos, asincronía y formularios (módulos 6–8) puedan pedir datos a una API de mentira con la red bajo control, ver cada efecto y su limpieza en una línea de tiempo, y usar `localStorage` dentro de la vista previa.

**Architecture:** dos runtimes nuevos dentro del iframe, importados con `?raw` como el puente, el montaje y el árbol: `runtime/red.js` (sustituye `fetch` para `/api/`) y `runtime/efectos.js` (envuelve los hooks de efectos que ve el alumno). El puente gana el almacenamiento en memoria. En la página, `PanelRed` y `RegistroEfectos` debajo de la vista previa.

**Tech Stack:** React 19.3.1 del sandbox, Zod, Vitest + Testing Library + jsdom, Tailwind.

**Spec:** `specs/features/react-en-vivo.md`, sección «Alcance de la fase 3» (fuente de verdad, con la validación hecha en Chromium real).

## Global Constraints

- Límites exactos de la spec: `api` ≤ 8 colecciones, nombres `/^[a-z][a-z0-9-]*$/`, ≤ 200 registros, ≤ 20 000 caracteres en JSON; `red.latencia` entero 0–3000 (por defecto 600); mensaje `peticion` con `ruta` ≤ 200; mensaje `efecto` con `componente`/`gancho` ≤ 60, ≤ 8 `cambios` (`nombre` ≤ 40, `antes`/`ahora` ≤ 80).
- Nada de `Math.random` (el escáner de seguridad lo marca HIGH) ni de `innerHTML`.
- Un fallo dentro de `red.js` o `efectos.js` no puede romper la app del alumno más allá de la petición o el efecto afectados.
- Los mensajes página → iframe solo se aceptan si `event.source === parent`; los iframe → página se validan con Zod en `mensajes.ts` y se pintan como texto.
- `red.js` y `efectos.js` también van en el iframe de las comprobaciones (a diferencia de `arbol.js`), con la red de comprobación de la spec.
- Textos de interfaz exactamente los de la spec y de este plan.
- Antes de cerrar cada tarea: `npm run test`, `npm run lint` y `npm run build` en verde (con `VITE_SUPABASE_URL=http://localhost:54321 VITE_SUPABASE_ANON_KEY=x`).

## Review Focus

1. Una petición cancelada (abort) mientras espera su latencia: rechaza con `AbortError`, no deja temporizadores vivos y el registro la marca como `cancelada`.
2. Respuestas desordenadas: con latencia > 0 y `desordenar`, dos peticiones seguidas resuelven en orden inverso de forma determinista.
3. `StrictMode` + efectos: el registro no confunde la repetición de `StrictMode` con un cambio de dependencias, y nunca compara en el render.
4. Un efecto sin array de dependencias, uno con `[]` y uno con dependencias calculadas (`[props.id, filtro.texto]`): motivos y nombres correctos o el «dependencia N» de reserva.
5. El código del alumno puede llamar a `fetch` en el nivel del módulo, en un efecto o en un manejador: siempre encuentra la API ya instalada.

---

### Task 1: almacenamiento en memoria y API simulada

**Files:**
- Create: `src/lib/react-en-vivo/runtime/red.js`, `src/lib/react-en-vivo/red.test.ts`
- Modify: `runtime/puente.js` (almacenamiento), `runtime/montaje.js` (paso de comprobación `red`), `documento.ts` y `preparar.ts` (opciones `api` y `red`; script de `red.js` después de la configuración y antes del montaje), `mensajes.ts` (mensaje `peticion`), `src/lib/laboratorio/schemas.ts` (`api`, `red` en `react-en-vivo` y `react-anotado`; paso `{ red: 'fallar-siguiente' }` en las comprobaciones) y sus tests.

**Interfaces:**
- Produces (iframe): `window.__redReactEnVivo = { configurar({ latencia, desordenar }), fallarSiguiente() }`; mensajes `{ tipo: 'peticion', id, metodo, ruta, estado, codigo?, ms? }`; escucha `{ canal, tipo: 'red' | 'fallar-siguiente' }` solo desde `parent`.
- Produces (`mensajes.ts`): tipo `MensajePeticion`.
- Produces (`preparar.ts`/`documento.ts`): opciones `api?: Record<string, unknown[]>` y `red?: { latencia: number; desordenar: boolean }` (en el documento de comprobaciones, la red de comprobación de la spec). La configuración del iframe gana `api` y `red`.

- [ ] **Step 1: tests que fallan** — en `red.test.ts` (jsdom; ejecuta `puente.js` y `red.js` con `new Function` y una configuración con `api: { recetas: [{ id: 1, nombre: 'Salmorejo', tiempo: 20 }, { id: 2, nombre: 'Pisto manchego', tiempo: 45 }] }`):
  - `GET /api/recetas devuelve la colección con Response real` (status 200, `ok`, JSON igual).
  - `GET con ?q= busca sin distinguir mayúsculas ni tildes` (`?q=PISTO` y `?q=manchégo` encuentran el pisto).
  - `GET /api/recetas/2 y 404 si no existe` (registro; `{ error }` con 404 para `/api/recetas/9` y `/api/postres`).
  - `POST asigna id y lo guarda; PUT, PATCH y DELETE modifican la copia` (y un documento nuevo vuelve a los datos originales).
  - `respeta la latencia` (con temporizadores falsos: no resuelve antes de 600 ms y sí después).
  - `abortar durante la espera rechaza con AbortError y no deja temporizadores` (y el mensaje `peticion` final dice `cancelada`).
  - `con desordenar, dos peticiones seguidas llegan al revés` (latencia 100: la segunda resuelve antes que la primera).
  - `fallarSiguiente hace que la siguiente responda 500 una sola vez`.
  - `envía peticion al empezar y al terminar` (`pendiente` y luego `ok` con `codigo` y `ms`).
  - `solo acepta los mensajes red y fallar-siguiente que vienen de parent`.
  - `las rutas que no son /api/ van al fetch original`.
  - En `runtime.test.ts`: `si localStorage lanza, el puente lo sustituye por un almacén en memoria` (con un `localStorage` que lanza `SecurityError` simulado con `Object.defineProperty`; después `setItem`/`getItem`/`length`/`key`/`removeItem`/`clear` funcionan) y lo mismo con `sessionStorage`; y `una comprobación con el paso red: fallar-siguiente hace fallar la siguiente petición`.
  - En `schemas.test.ts`: `api acepta colecciones válidas y rechaza nombres, tamaños y registros sin id inválidos`, `red aplica latencia 600 y desordenar false por defecto y rechaza 3001`, `el paso red de una comprobación solo admite fallar-siguiente`.
  - En `documento.test.ts`: `con api incluye red.js después de la configuración y antes del montaje`; `sin api no lo incluye`.
  - En `mensajes.test.ts`: `acepta un mensaje peticion válido y rechaza una ruta de 201 caracteres`.
- [ ] **Step 2:** ejecutarlos y verlos fallar por la funcionalidad que falta.
- [ ] **Step 3: implementar** según la spec. El orden de la cola de desorden: un contador de peticiones; impares × 2, pares × 0,5.
- [ ] **Step 4:** `npm run test`, `npm run lint`, `npm run build` en verde.
- [ ] **Step 5:** dejar el árbol de trabajo listo para un commit «feat(react-en-vivo): API simulada y almacenamiento en memoria (fase 3)».

### Task 2: registro de efectos

**Files:**
- Create: `src/lib/react-en-vivo/runtime/efectos.js`, `src/lib/react-en-vivo/efectos.test.ts`
- Modify: `runtime/puente.js` (exponer `window.__numeroCommitReactEnVivo()`), `runtime/montaje.js` (si la configuración trae `efectos: true`, `EXTERNOS.react` es el `react` envuelto por `window.__efectosReactEnVivo.envolver(R.React, modulos)`), `documento.ts`/`preparar.ts` (opción `conEfectos`; script de `efectos.js` antes del montaje), `mensajes.ts` (mensaje `efecto`) y sus tests.

**Interfaces:**
- Produces (iframe): `window.__efectosReactEnVivo.envolver(React, modulos) → React` con `useEffect`, `useLayoutEffect` y `useInsertionEffect` envueltos y todo lo demás intacto; mensajes `efecto` de la spec.
- Produces (`mensajes.ts`): tipo `MensajeEfecto`.

- [ ] **Step 1: tests que fallan** — en `efectos.test.ts`, con el `react.js` real del sandbox (como `arbol.test.ts`), el puente, `efectos.js` y el montaje con `StrictMode`, con este código:

```jsx
import { useEffect, useLayoutEffect, useState } from 'react'
function useConexion(sala) {
  useEffect(() => {
    return () => {}
  }, [sala])
}
function Chat({ sala }) {
  useConexion(sala)
  useEffect(() => {
    document.title = sala
  }, [sala])
  useLayoutEffect(() => {})
  return <p>Sala {sala}</p>
}
export default function App() {
  const [sala, setSala] = useState('general')
  const [ver, setVer] = useState(true)
  return (
    <main>
      <button onClick={() => setSala('viaje')}>Viaje</button>
      <button onClick={() => setVer(false)}>Ocultar</button>
      {ver && <Chat sala={sala} />}
    </main>
  )
}
```

  - `al montar con StrictMode: efecto, limpieza y efecto repetido` (para el efecto de `Chat` y el de `useConexion`: `accion` `efecto` con motivo `montaje`, después `limpieza`, después `efecto` con motivo `strict-mode`; `componente: 'Chat'`, `gancho: 'useConexion'` en el del hook; `linea` la del `useEffect(` en el original).
  - `al cambiar la sala: limpieza y efecto con la dependencia que cambió` (`motivo: 'dependencias'`, `cambios: [{ nombre: 'sala', antes: '"general"', ahora: '"viaje"' }]`).
  - `el efecto sin dependencias se ejecuta en cada render con motivo cada-render` (el `useLayoutEffect`, con `clase: 'useLayoutEffect'`).
  - `al desmontar, limpiezas con motivo desmontaje`.
  - `dependencias calculadas sin nombre legible dan «dependencia 1»` (un efecto con `[sala.length + 1]`... o el caso que el parser no entienda).
  - `sin mostrarEfectos, react no está envuelto` (el `useEffect` que recibe el alumno es el original).
  - `un fallo dentro del registro no rompe el efecto` (un `__enviarReactEnVivo` que lanza para `efecto`: el efecto real se ejecuta igual).
  - En `mensajes.test.ts`: `acepta un mensaje efecto válido y rechaza 9 cambios`.
- [ ] **Step 2:** verlos fallar.
- [ ] **Step 3: implementar** según la spec (comparación en el commit; nombres de dependencias desde `modulos[archivo]`, el código transformado, cuya línea coincide con la del original).
- [ ] **Step 4:** suite, lint y build en verde.
- [ ] **Step 5:** listo para «feat(react-en-vivo): registro de efectos (fase 3)».

### Task 3: los paneles, la integración y el catálogo

**Files:**
- Create: `src/components/bloques-laboratorio/PanelRed.tsx`, `RegistroEfectos.tsx` (+ tests)
- Modify: `VistaPreviaReact.tsx` (enviar mensajes al iframe; reenviar la red al recibir `montado`), `ReactEnVivo.tsx`, `ReactAnotado.tsx`, `ComprobadorReact.tsx` (red de comprobación; el paso `red` lo ejecuta el montaje), catálogo de `/admin/referencia-contenido`, `specs/features/laboratorios.md` (+ tests).

- [ ] **Step 1: tests que fallan**:
  - `PanelRed`: `enseña la latencia con su valor y la cambia` (control deslizante con nombre accesible «Latencia», texto «600 ms»), `«Responder desordenado» es un interruptor`, `«Fallar la siguiente petición» avisa hasta que llega la siguiente petición` («La siguiente petición fallará» desaparece al llegar un `peticion` con código 500), `registra las peticiones con su estado escrito` («GET /api/recetas · 200 · 812 ms», «cancelada»), `guarda como mucho 20`.
  - `RegistroEfectos`: `agrupa por commit y escribe cada línea en español` («Chat ▶ efecto · repetido por StrictMode», «Chat ⟲ limpieza», «Chat ▶ efecto · cambió sala: "general" → "viaje"», con el hook propio cuando lo hay: «Chat · useConexion ▶ efecto»), `Limpiar vacía el registro`, `guarda como mucho 200 entradas`.
  - `ReactEnVivo`/`ReactAnotado`: `con api muestra el panel Red y pasa api y red al documento`, `al cambiar un control envía red al iframe`, `con mostrarEfectos muestra el registro y pide efectos.js`, `al reconstruir la vista previa vacía el registro de peticiones y el de efectos`.
  - `ComprobadorReact`: `el documento de comprobación lleva la red de comprobación` (latencia 0 sin `red.latencia`).
- [ ] **Step 2:** verlos fallar.
- [ ] **Step 3: implementar.** Mismo aspecto que `ConsolaReact` y `ArbolDeRenders`; estado con texto y color; nada de `aria-live` en el registro de efectos (cambia muy a menudo); el panel Red sí puede anunciar «La siguiente petición fallará» con `role="status"`. Catálogo: un `ReactEnVivo` con `api` (una lista de recetas con buscador que cancela con `AbortController`) y otro con `mostrarEfectos` (el chat con sala).
- [ ] **Step 4:** suite, lint y build en verde.
- [ ] **Step 5:** listo para «feat(react-en-vivo): paneles de red y de efectos (fase 3)».

### Task 4 (Claude): verificación real

Playwright con Chromium contra `npm run dev`: API con latencia, desorden y fallo; cancelación; `localStorage` en la vista previa; registro de efectos con `StrictMode`; modo oscuro, 390 px; después, revisión independiente de la rama y PR.
