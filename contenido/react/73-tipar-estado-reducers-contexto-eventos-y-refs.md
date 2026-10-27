# Tipar estado, reducers, contexto, eventos y refs

- **Módulo:** React con TypeScript
- **Slug:** `tipar-estado-reducers-contexto-eventos-y-refs` (autogenerado del título)
- **Orden:** 730
- **Fuentes:** [Using TypeScript](https://react.dev/learn/typescript) — ver `contenido/react/TEMARIO.md` #73

---

## Qué es y para qué sirve

En la lección 72 tipaste lo que **entra** en un componente: sus props. Esta lección tipa lo que el componente **guarda y maneja por dentro**: el estado, el reductor, el contexto, los eventos y las refs. Los Hooks de React vienen con sus tipos incluidos (`@types/react`) y están hechos para que **casi nunca tengas que escribirlos**: TypeScript los deduce del valor inicial y de las funciones que les pasas.

Entonces, ¿cuándo escribes tipos? En tres situaciones, que se repiten en cada Hook:

- **El valor inicial no cuenta toda la historia.** `useState(null)` dice «de momento nada», pero más tarde habrá un invitado. `useState([])` dice «una lista vacía», pero no de qué.
- **Declaras tú la función fuera del JSX.** Un manejador que sacas a una función propia (`manejarCambio`, lección 15) ya no tiene un `onChange` que le diga qué evento recibe.
- **Algo que todavía no existe.** El nodo del DOM de una ref empieza en `null`; un contexto sin proveedor no tiene valor.

> **Deja que TypeScript infiera, y anota donde el valor inicial se queda corto.**

Esta lección da por sabido el temario de TypeScript (uniones discriminadas, lección 23; `never`, lección 24; genéricos, lecciones 28 y 29) y remite a cada lección de React donde se explicó el Hook. Todos los bloques usan el panel «Errores de tipos» con TypeScript 6.0.3 y los tipos de React 19.3.

## `useState`: se infiere casi siempre

`useState(0)` da un `number`, `useState('')` un `string` y `useState(false)` un `boolean`. Escribir `useState<number>(0)` es ruido. Los setters aceptan el valor nuevo o una función que recibe el anterior (lección 19), y también los deduce.

Hay tres casos en los que **sí** escribes el tipo, entre `< >` después de `useState`:

- **`null` ahora, un objeto después**: `useState<Invitado | null>(null)`. Sin el tipo, el estado es de tipo `null` y nada más se puede guardar.
- **Una lista vacía**: `useState<Invitado[]>([])`. Sin el tipo, `[]` es una lista de `never`, o sea, una lista que no admite ningún elemento.
- **Un texto de una lista cerrada**: `useState<Respuesta>('pendiente')`. Sin el tipo, `'pendiente'` se deduce como un `string` cualquiera.

Este panel de invitados de una boda comete los dos primeros (y el tercero con la respuesta). La aplicación funciona; el panel de tipos no está de acuerdo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos estados que TypeScript no puede adivinar",
  "consigna": "Pulsa un invitado y confírmalo: todo funciona, pero el panel marca cuatro errores. Arréglalos escribiendo el tipo en las dos llamadas a useState: Invitado | null para elegido y Respuesta para respuesta (añade type Respuesta al import de Etiqueta). Cuando el panel quede vacío, mira cómo el editor ya te sugiere los valores de respuesta.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\nimport Etiqueta from './Etiqueta'\n\ninterface Invitado {\n  id: number\n  nombre: string\n  mesa: number\n}\n\nconst INVITADOS: Invitado[] = [\n  { id: 1, nombre: 'Marta Ibáñez', mesa: 3 },\n  { id: 2, nombre: 'Tomás Gil', mesa: 5 },\n  { id: 3, nombre: 'Aitana Roca', mesa: 3 },\n]\n\nexport default function App() {\n  const [elegido, setElegido] = useState(null)\n  const [respuesta, setRespuesta] = useState('pendiente')\n\n  return (\n    <main>\n      <h1>Boda de Lucía e Íñigo</h1>\n      <ul>\n        {INVITADOS.map((invitado) => (\n          <li key={invitado.id}>\n            <button\n              onClick={() => {\n                setElegido(invitado)\n                setRespuesta('pendiente')\n              }}\n            >\n              {invitado.nombre}\n            </button>\n          </li>\n        ))}\n      </ul>\n      {elegido && (\n        <section>\n          <h2>{elegido.nombre}</h2>\n          <p>Mesa {elegido.mesa}</p>\n          <Etiqueta valor={respuesta} />\n          <p>\n            <button onClick={() => setRespuesta('confirmado')}>Confirmar</button>\n            <button onClick={() => setRespuesta('declinado')}>Declinar</button>\n            <button onClick={() => setElegido(null)}>Cerrar</button>\n          </p>\n        </section>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Etiqueta.tsx",
      "codigo": "export type Respuesta = 'pendiente' | 'confirmado' | 'declinado'\n\nconst TEXTOS: Record<Respuesta, string> = {\n  pendiente: 'Sin respuesta',\n  confirmado: 'Asistirá',\n  declinado: 'No puede venir',\n}\n\nexport default function Etiqueta({ valor }: { valor: Respuesta }) {\n  return <strong className={`etiqueta ${valor}`}>{TEXTOS[valor]}</strong>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin: 0.25rem 0;\n  font-size: 1.1rem;\n}\n\nul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin-right: 0.4rem;\n  font: inherit;\n}\n\nsection {\n  padding: 0.5rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.etiqueta {\n  padding: 0.1rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n}\n\n.confirmado {\n  background: #dcfce7;\n  color: #166534;\n}\n\n.declinado {\n  background: #fee2e2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Los mensajes del panel, uno por uno:

```text
setElegido(invitado)
Argument of type 'Invitado' is not assignable to parameter of type 'SetStateAction<null>'.

<h2>{elegido.nombre}</h2>
Property 'nombre' does not exist on type 'never'.

<Etiqueta valor={respuesta} />
Type 'string' is not assignable to type 'Respuesta'.
```

Es decir: con `useState(null)`, el estado solo puede ser `null` (el primer error); dentro de `{elegido && ...}` TypeScript razona «si es `null`, esto nunca se ejecuta» y deja el tipo en `never` (el segundo); y `'pendiente'` es un `string` cualquiera, que `Etiqueta` no acepta porque pide un `Respuesta` (el tercero). Los tres desaparecen con los dos tipos.

Fíjate también en que el tipo con `null` obliga a **comprobar antes de usar**, como en la lección 10 (renderizado condicional): `elegido && ...` o `if (elegido === null) return`. El compilador no te deja olvidarte de que a veces no hay nada.

### Un setter se puede pasar como prop

`setRespuesta` es una función como cualquier otra. Si un hijo tiene que cambiar el estado del padre, su prop se tipa con el **valor**, no con el tipo interno del setter:

```tsx
interface SelectorProps {
  onCambiar: (respuesta: Respuesta) => void
}

// En el padre: <Selector onCambiar={setRespuesta} />
```

El setter de `useState<Respuesta>` encaja en `(respuesta: Respuesta) => void` sin más. Su tipo real, `Dispatch<SetStateAction<Respuesta>>`, existe y lo verás en código ajeno, pero casi nunca hace falta escribirlo. Con el patrón `on` + verbo de la lección 15, además, el hijo no sabe que el padre usa `useState`.

### Estados que son una unión discriminada

La lección 23 enseñó a pensar la interfaz como una lista de estados posibles. En TypeScript, esa lista es una **unión discriminada**, y `useState` la lleva con su argumento de tipo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "type CargaInvitados =\n  | { estado: 'cargando' }\n  | { estado: 'ok'; invitados: Invitado[] }\n  | { estado: 'error'; mensaje: string }\n\nfunction ListaInvitados() {\n  const [carga, setCarga] = useState<CargaInvitados>({ estado: 'cargando' })\n\n  if (carga.estado === 'cargando') return <p>Cargando…</p>\n  if (carga.estado === 'error') return <p role=\"alert\">{carga.mensaje}</p>\n\n  return (\n    <ul>\n      {carga.invitados.map((invitado) => (\n        <li key={invitado.id}>{invitado.nombre}</li>\n      ))}\n    </ul>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "| { estado: 'ok'; invitados: Invitado[] }",
      "nota": "Cada estado lleva solo los datos que tienen sentido en él. No hay un invitados vacío mientras carga ni un mensaje mientras todo va bien: los estados imposibles no se pueden escribir."
    },
    {
      "fragmento": "useState<CargaInvitados>({ estado: 'cargando' })",
      "nota": "El argumento de tipo es la unión entera. El valor inicial es una de sus variantes, y setCarga acepta cualquiera de las tres."
    },
    {
      "fragmento": "if (carga.estado === 'cargando') return <p>Cargando…</p>",
      "nota": "Al comprobar estado, TypeScript descarta una variante tras otra. Es el mismo estrechamiento de tipos que hacías con if en el temario de TypeScript."
    },
    {
      "fragmento": "{carga.invitados.map((invitado) => (",
      "nota": "Llegados aquí solo queda la variante ok, y por eso invitados existe. Si leyeras carga.invitados antes de las comprobaciones, el error sería: Property 'invitados' does not exist on type 'CargaInvitados'."
    }
  ]
}
```

## `useReducer`: las acciones, como unión discriminada

En la lección 27 escribiste un reductor con acciones que tenían un `type` y datos sueltos: `{ type: 'marcada', id }`. En JavaScript, nada impedía despachar `{ type: 'marcad', id }` con una errata, o `{ type: 'borrada' }` sin el `id`. El reductor se enteraba, si llegaba a enterarse, en ejecución.

En TypeScript, el conjunto de acciones se describe con **una unión discriminada cuyo discriminante es `type`**. Tres piezas, en este orden:

1. **El estado**: `Invitado[]`.
2. **Las acciones**: una variante por cada cosa que puede pasar, con sus datos.
3. **La firma del reductor**: `(invitados: Invitado[], accion: Accion): Invitado[]`.

Aquí está el reductor de la lista de invitados de una boda, con el mismo estilo de nombres de la lección 27:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export type Respuesta = 'pendiente' | 'confirmado' | 'declinado'\n\nexport interface Invitado {\n  id: number\n  nombre: string\n  respuesta: Respuesta\n}\n\nexport type Accion =\n  | { type: 'anadido'; id: number; nombre: string }\n  | { type: 'respondido'; id: number; respuesta: Respuesta }\n  | { type: 'borrado'; id: number }\n\nexport function invitadosReducer(invitados: Invitado[], accion: Accion): Invitado[] {\n  switch (accion.type) {\n    case 'anadido': {\n      return [...invitados, { id: accion.id, nombre: accion.nombre, respuesta: 'pendiente' }]\n    }\n    case 'respondido': {\n      return invitados.map((i) => (i.id === accion.id ? { ...i, respuesta: accion.respuesta } : i))\n    }\n    case 'borrado': {\n      return invitados.filter((i) => i.id !== accion.id)\n    }\n    default: {\n      const sinTratar: never = accion\n      throw Error('Acción desconocida: ' + JSON.stringify(sinTratar))\n    }\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "| { type: 'respondido'; id: number; respuesta: Respuesta }",
      "nota": "Una variante de la unión. El type es un texto literal: no es string, es exactamente «respondido». Los datos que necesita la acción van al lado, y solo en esta variante."
    },
    {
      "fragmento": "export function invitadosReducer(invitados: Invitado[], accion: Accion): Invitado[] {",
      "nota": "La firma es el contrato. Declarar el retorno Invitado[] hace que un case que devuelva otra cosa (o se olvide de devolver) sea un error aquí, y no un estado roto más tarde."
    },
    {
      "fragmento": "case 'respondido': {",
      "nota": "Dentro de cada case, TypeScript sabe qué variante tienes. Aquí accion.respuesta existe; en el case de borrado, no: accion.nombre daría Property 'nombre' does not exist on type '{ type: \"borrado\"; id: number; }'."
    },
    {
      "fragmento": "const sinTratar: never = accion",
      "nota": "Comprobación de exhaustividad (lección 24 del temario de TypeScript). Si has tratado todas las variantes, accion es never aquí y la línea compila. Si añades una variante y olvidas su case, deja de ser never y el compilador marca esta línea."
    },
    {
      "fragmento": "throw Error('Acción desconocida: ' + JSON.stringify(sinTratar))",
      "nota": "El default de la lección 27 leía accion.type. Aquí no se puede: accion es never y TypeScript dice Property 'type' does not exist on type 'never'. Por eso el mensaje usa la variable sinTratar."
    }
  ]
}
```

Con el reductor tipado, `useReducer(invitadosReducer, iniciales)` **deduce solo** el estado y las acciones: no escribes ningún argumento de tipo. Y `dispatch` pasa a ser un guardián de lo que puede ocurrir. Prueba la lista, y después rómpela a propósito siguiendo la consigna:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista de invitados con un reductor tipado",
  "consigna": "Confirma a Tomás Gil, quita a otro invitado y añade uno nuevo. Después, en invitadosReducer.ts, añade una variante a Accion: | { type: 'pendientes_borrados' }. El panel marca la línea del never del default, porque has declarado una acción que el reductor no trata. Añade su case (filtra los invitados con respuesta distinta de pendiente) y vuelve a ver el panel vacío. Por último, en App.tsx escribe dispatch({ type: 'borrado' }) sin id.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useReducer, useState } from 'react'\nimport { invitadosReducer, type Invitado } from './invitadosReducer'\n\nlet siguienteId = 4\n\nconst INICIALES: Invitado[] = [\n  { id: 1, nombre: 'Marta Ibáñez', respuesta: 'confirmado' },\n  { id: 2, nombre: 'Tomás Gil', respuesta: 'pendiente' },\n  { id: 3, nombre: 'Aitana Roca', respuesta: 'declinado' },\n]\n\nexport default function App() {\n  const [invitados, dispatch] = useReducer(invitadosReducer, INICIALES)\n  const [nombre, setNombre] = useState('')\n\n  const confirmados = invitados.filter((i) => i.respuesta === 'confirmado').length\n\n  return (\n    <main>\n      <h1>Invitados de la boda</h1>\n      <form\n        onSubmit={(e) => {\n          e.preventDefault()\n          if (nombre.trim() === '') return\n          dispatch({ type: 'anadido', id: siguienteId++, nombre: nombre.trim() })\n          setNombre('')\n        }}\n      >\n        <label>\n          Nuevo invitado\n          <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n        </label>\n        <button>Añadir</button>\n      </form>\n      <ul>\n        {invitados.map((invitado) => (\n          <li key={invitado.id}>\n            <span className={invitado.respuesta}>\n              {invitado.nombre}: {invitado.respuesta}\n            </span>\n            <button\n              aria-label={`Confirmar a ${invitado.nombre}`}\n              onClick={() => dispatch({ type: 'respondido', id: invitado.id, respuesta: 'confirmado' })}\n            >\n              Confirmar\n            </button>\n            <button\n              aria-label={`Quitar a ${invitado.nombre}`}\n              onClick={() => dispatch({ type: 'borrado', id: invitado.id })}\n            >\n              Quitar\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p>Confirmados: {confirmados}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "invitadosReducer.ts",
      "codigo": "export type Respuesta = 'pendiente' | 'confirmado' | 'declinado'\n\nexport interface Invitado {\n  id: number\n  nombre: string\n  respuesta: Respuesta\n}\n\nexport type Accion =\n  | { type: 'anadido'; id: number; nombre: string }\n  | { type: 'respondido'; id: number; respuesta: Respuesta }\n  | { type: 'borrado'; id: number }\n\nexport function invitadosReducer(invitados: Invitado[], accion: Accion): Invitado[] {\n  switch (accion.type) {\n    case 'anadido': {\n      return [...invitados, { id: accion.id, nombre: accion.nombre, respuesta: 'pendiente' }]\n    }\n    case 'respondido': {\n      return invitados.map((i) => (i.id === accion.id ? { ...i, respuesta: accion.respuesta } : i))\n    }\n    case 'borrado': {\n      return invitados.filter((i) => i.id !== accion.id)\n    }\n    default: {\n      const sinTratar: never = accion\n      throw Error('Acción desconocida: ' + JSON.stringify(sinTratar))\n    }\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "invitadosReducer.ts",
  "strictMode": true,
  "mostrarConsola": false
}
```

Estos son los tres mensajes que vas a leer más a menudo con un reductor tipado:

```text
Type '"cambiado"' is not assignable to type '"anadido" | "borrado" | "respondido"'.
```
Una acción cuyo `type` no existe (o con una errata). El mensaje lista los que sí.

```text
Argument of type '{ type: "borrado"; }' is not assignable to parameter of type 'Accion'.
  Property 'id' is missing in type '{ type: "borrado"; }' but required in type '{ type: "borrado"; id: number; }'.
```
Una acción de las que existen, pero sin los datos que pide su variante.

```text
Type '{ type: "pendientes_borrados"; }' is not assignable to type 'never'.
```
Una variante de `Accion` que el `switch` no trata: la comprobación de exhaustividad del `default`.

### El tipo de `dispatch`

Si pasas `dispatch` a un hijo, ¿cómo lo tipas? En `@types/react` 19, `useReducer` devuelve un `ActionDispatch<[accion: Accion]>`: una función cuyos argumentos son esa lista. Para un hijo, el tipo corto `Dispatch<Accion>` encaja igual (lo hemos comprobado), así que tienes dos formas válidas de la misma prop:

```tsx
import type { ActionDispatch, Dispatch } from 'react'

interface FilaProps {
  // Cualquiera de las dos sirve:
  dispatch: Dispatch<Accion>
  // dispatch: ActionDispatch<[accion: Accion]>
}
```

Una advertencia: la guía de react.dev muestra todavía `useReducer<State>(reducer, initialState)`, con el tipo del estado entre `< >`. Con los tipos de React 19.3 eso es un error: `Expected 2 type arguments, but got 1.` (ahora el Hook tiene dos parámetros de tipo: el estado y la lista de argumentos de la acción). **No hace falta**: si tipas la firma del reductor y el estado inicial, se deduce todo. Si algún día quieres decirlo explícitamente, serían dos: `useReducer<Invitado[], [Accion]>(...)`.

## `createContext`: un valor por defecto, o `null` y un hook

Un contexto (lecciones 28 y 29) tiene un **valor por defecto** que se usa cuando no hay proveedor por encima. En TypeScript, ese valor por defecto decide el tipo del contexto, y hay dos situaciones.

### Cuando el valor por defecto tiene sentido

Un tema claro u oscuro tiene un valor razonable aunque nadie lo proporcione:

```tsx
type Tema = 'claro' | 'oscuro'

const TemaContext = createContext<Tema>('claro')
TemaContext.displayName = 'Tema'
```

Escribe el argumento de tipo: sin él, `createContext('claro')` produce un contexto de `string`, y al leerlo un componente que pide `Tema` falla con `Type 'string' is not assignable to type 'Tema'.` Es el mismo problema de la unión de textos que en `useState`.

### Cuando no hay un valor por defecto razonable

Un presupuesto no tiene valor «de mentira»: o hay un proveedor con los datos o no hay nada. La solución es que el contexto admita `null`, y que **un hook propio** compruebe que existe y lance un error si no (es la recomendación de react.dev, y encaja con los hooks personalizados de la lección 43):

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El presupuesto de la boda, con un contexto que puede ser null",
  "consigna": "Paga el catering y la música y mira cómo se actualiza el resumen. Después, en App.tsx, saca <Resumen /> fuera de <PresupuestoProvider> y observa el error de la vista previa: es el que escribió usePresupuesto. Por último, en PresupuestoContext.tsx sustituye la comprobación del hook por return valor! y repite la prueba: el panel sigue vacío, pero el error de la vista previa ya no lo escribe tu hook, sino JavaScript («Cannot destructure property total ... as it is null»), lejos de la causa.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { PresupuestoProvider } from './PresupuestoContext'\nimport Resumen from './Resumen'\nimport BotonGasto from './BotonGasto'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Presupuesto de la boda</h1>\n      <PresupuestoProvider total={5000}>\n        <Resumen />\n        <BotonGasto concepto=\"el catering\" importe={2400} />\n        <BotonGasto concepto=\"la música\" importe={800} />\n        <BotonGasto concepto=\"las flores\" importe={350} />\n      </PresupuestoProvider>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PresupuestoContext.tsx",
      "codigo": "import { createContext, useContext, useState, type ReactNode } from 'react'\n\ninterface PresupuestoValor {\n  total: number\n  gastado: number\n  gastar: (importe: number) => void\n}\n\nconst PresupuestoContext = createContext<PresupuestoValor | null>(null)\nPresupuestoContext.displayName = 'Presupuesto'\n\ninterface PresupuestoProviderProps {\n  total: number\n  children: ReactNode\n}\n\nexport function PresupuestoProvider({ total, children }: PresupuestoProviderProps) {\n  const [gastado, setGastado] = useState(0)\n\n  function gastar(importe: number) {\n    setGastado((anterior) => anterior + importe)\n  }\n\n  return <PresupuestoContext value={{ total, gastado, gastar }}>{children}</PresupuestoContext>\n}\n\nexport function usePresupuesto() {\n  const valor = useContext(PresupuestoContext)\n  if (valor === null) {\n    throw new Error('usePresupuesto debe usarse dentro de un <PresupuestoProvider>')\n  }\n  return valor\n}\n"
    },
    {
      "nombre": "Resumen.tsx",
      "codigo": "import { usePresupuesto } from './PresupuestoContext'\n\nexport default function Resumen() {\n  const { total, gastado } = usePresupuesto()\n\n  return (\n    <p>\n      Gastado: {gastado} € de {total} € (quedan {total - gastado} €)\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "BotonGasto.tsx",
      "codigo": "import { usePresupuesto } from './PresupuestoContext'\n\ninterface BotonGastoProps {\n  concepto: string\n  importe: number\n}\n\nexport default function BotonGasto({ concepto, importe }: BotonGastoProps) {\n  const { gastar } = usePresupuesto()\n\n  return (\n    <button onClick={() => gastar(importe)}>\n      Pagar {concepto} ({importe} €)\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nbutton {\n  padding: 0.35rem 0.7rem;\n  margin: 0 0.5rem 0.5rem 0;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "PresupuestoContext.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Este diseño evita dos errores, y los dos son útiles. Aparecen si usas el contexto sin el hook, o si el proveedor da un valor incompleto:

```text
const valor = useContext(PresupuestoContext)
return <p>{valor.gastado}</p>
'valor' is possibly 'null'.

<PresupuestoContext value={{ total: 1000 }}>
Type '{ total: number; }' is missing the following properties from type 'PresupuestoValor': gastado, gastar
```

El primero te obliga a pensar qué pasa fuera del proveedor. El segundo te asegura que **el proveedor da el valor completo**: quien consume `PresupuestoContext` puede fiarse de que `gastar` existe.

El hook hace tres cosas a la vez: **quita el `null`** del tipo (después del `throw`, TypeScript sabe que `valor` no es `null`), da un **mensaje claro** si te olvidas del proveedor y **le ahorra** a cada consumidor repetir la comprobación. Por eso en un proyecto real nadie llama a `useContext(PresupuestoContext)` directamente: se exporta el proveedor y el hook, y el contexto se queda privado en su archivo.

Lo que **no** debes hacer es silenciar el `null` con una aserción: `createContext({} as PresupuestoValor)` o `useContext(PresupuestoContext)!`. El compilador deja de quejarse, y el día que alguien olvide el proveedor tendrás un error de JavaScript («Cannot destructure property ... as it is null») en mitad de un componente, lejos de la causa.

### Reductor y contexto juntos (lección 29)

Con los dos contextos de la lección 29 (uno para el estado, otro para `dispatch`), el segundo se tipa con el tipo de `dispatch` de arriba:

```tsx
const InvitadosContext = createContext<Invitado[]>([])
const InvitadosDispatchContext = createContext<ActionDispatch<[accion: Accion]> | null>(null)
```

El de la lista tiene un valor por defecto honesto (una lista vacía); el de `dispatch`, no (no hay un `dispatch` «de mentira»), y por eso admite `null` y necesita su hook que comprueba, `useInvitadosDispatch()`.

## Eventos: el tipo se deduce en línea y se escribe a mano fuera

Cuando escribes el manejador dentro del JSX, TypeScript sabe qué evento recibe: en `onChange={(e) => setNombre(e.target.value)}`, `e` ya es un `ChangeEvent<HTMLInputElement>`. En cuanto sacas el manejador a una función con nombre (el estilo `manejarCambio` de la lección 15), **pierde ese contexto**, y en modo estricto el parámetro sin tipo es un error:

```text
function manejarCambio(e) { ... }
Parameter 'e' implicitly has an 'any' type.
```

Es decir: TypeScript no sabe qué es `e` y no quiere adivinarlo. Los tipos de evento vienen de `react` (no los del navegador, que tienen el mismo nombre y no sirven: lo ves en «Errores típicos»), y todos llevan **el tipo del elemento** entre `< >`:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "ChangeEvent<HTMLInputElement>",
      "texto": "Para onChange. El elemento cambia con el campo: HTMLInputElement para input, HTMLTextAreaElement para textarea y HTMLSelectElement para select. e.target.value es un texto (lección 22)."
    },
    {
      "titulo": "SubmitEvent<HTMLFormElement>",
      "texto": "Para onSubmit de un form. En @types/react 19.3, FormEvent aparece marcado como obsoleto («FormEvent doesn't actually exist») y onSubmit espera SubmitEvent. Los dos compilan hoy; en código escrito antes verás FormEvent<HTMLFormElement>."
    },
    {
      "titulo": "MouseEvent<HTMLButtonElement>",
      "texto": "Para onClick y el resto de eventos del ratón. Úsalo cuando necesites algo del evento (coordenadas, la tecla Mayús, el propio botón); si el manejador no lo lee, no lo declares."
    },
    {
      "titulo": "KeyboardEvent<HTMLInputElement>",
      "texto": "Para onKeyDown y onKeyUp. e.key es el texto de la tecla: Enter, Escape, a."
    },
    {
      "titulo": "FocusEvent<HTMLInputElement>",
      "texto": "Para onFocus y onBlur. e.relatedTarget es el elemento que gana o pierde el foco."
    },
    {
      "titulo": "SyntheticEvent",
      "texto": "El tipo base de todos. Sirve cuando un manejador atiende varios tipos de evento o no necesita nada específico."
    }
  ]
}
```

Si no recuerdas el tipo, hay dos atajos. El primero, **pasar el ratón sobre el atributo** (`onChange`, `onSubmit`) en tu editor: te muestra el tipo del manejador que espera. El segundo, **tipar la función en vez del parámetro** con los tipos `...EventHandler`, y dejar que el evento se deduzca:

```tsx
import type { ChangeEventHandler } from 'react'

const manejarCambio: ChangeEventHandler<HTMLInputElement> = (e) => setNombre(e.target.value)
```

Aquí está un formulario con los cuatro tipos más habituales: un campo, un desplegable, el envío y un clic.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Alta de invitados, con cada evento tipado",
  "consigna": "Añade un par de invitados y pulsa «Vaciar lista». Después rompe los tipos a propósito en App.tsx: cambia ChangeEvent<HTMLSelectElement> por ChangeEvent<HTMLInputElement> en manejarMesa (el mensaje habla de HTMLSelectElement) y cambia e.currentTarget.name por e.target.name en manejarClic. Lee los dos mensajes.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState, type ChangeEvent, type MouseEvent, type SubmitEvent } from 'react'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  const [mesa, setMesa] = useState(1)\n  const [invitados, setInvitados] = useState<string[]>([])\n  const [ultimoClic, setUltimoClic] = useState('')\n\n  function manejarNombre(e: ChangeEvent<HTMLInputElement>) {\n    setNombre(e.target.value)\n  }\n\n  function manejarMesa(e: ChangeEvent<HTMLSelectElement>) {\n    setMesa(Number(e.target.value))\n  }\n\n  function manejarEnvio(e: SubmitEvent<HTMLFormElement>) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    setInvitados([...invitados, `${nombre.trim()} (mesa ${mesa})`])\n    setNombre('')\n  }\n\n  function manejarClic(e: MouseEvent<HTMLButtonElement>) {\n    setUltimoClic(e.currentTarget.name)\n  }\n\n  return (\n    <main>\n      <h1>Alta de invitados</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nombre\n          <input value={nombre} onChange={manejarNombre} />\n        </label>\n        <label>\n          Mesa\n          <select value={mesa} onChange={manejarMesa}>\n            <option value={1}>Mesa 1</option>\n            <option value={2}>Mesa 2</option>\n            <option value={3}>Mesa 3</option>\n          </select>\n        </label>\n        <button>Añadir</button>\n        <button type=\"button\" name=\"vaciar\" onClick={manejarClic}>\n          Vaciar lista\n        </button>\n      </form>\n      <ul>\n        {invitados.map((invitado) => (\n          <li key={invitado}>{invitado}</li>\n        ))}\n      </ul>\n      <p>Último botón especial: {ultimoClic || 'ninguno'}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Los dos fallos que provoca la consigna, tal como los muestra el panel:

```text
<select value={mesa} onChange={manejarMesa}>   (con manejarMesa tipada para un input)
Type '(e: ChangeEvent<HTMLInputElement, Element>) => void' is not assignable to type 'ChangeEventHandler<HTMLSelectElement, HTMLSelectElement>'.
  ...
      Type 'HTMLSelectElement' is missing the following properties from type 'HTMLInputElement': accept, align, alt, capture, and 38 more.

setUltimoClic(e.target.name)
Property 'name' does not exist on type 'EventTarget'.
```

El primero es el elemento equivocado: el desplegable no tiene las propiedades de un campo. El segundo es una distinción importante, la misma que hace JavaScript:

- **`e.currentTarget`** es el elemento **al que está enganchado el manejador**, y TypeScript lo conoce con su tipo exacto: `HTMLButtonElement`, con su `name`.
- **`e.target`** es el elemento **donde empezó el evento**, que en un clic puede ser un hijo del botón (un icono, un `<span>`). TypeScript solo sabe que es un `EventTarget`.

Para leer propiedades del elemento, **usa `e.currentTarget`**. En los eventos de cambio (`ChangeEvent`) los tipos de React declaran las dos cosas con el tipo del campo, y por eso `e.target.value` compila; es lo que verás en la mayoría de ejemplos, y `e.currentTarget.value` es igual de válido.

## `useRef`: el nodo del DOM, o un valor que cambia sin renderizar

En las lecciones 33 y 34 viste los dos usos de las refs. En TypeScript se distinguen por el **valor inicial**:

- **Una ref al DOM** empieza en `null` y React la rellena al montar. Se declara con el tipo del elemento y `null`: `useRef<HTMLInputElement>(null)`. Su `current` es `HTMLInputElement | null`, y TypeScript te hace comprobar el `null` antes de usarla.
- **Un valor mutable** (un contador, un identificador de temporizador, el valor anterior) lleva el valor inicial que corresponda: `useRef(0)` es un número, y `useRef<ReturnType<typeof setTimeout> | null>(null)` guarda el identificador de un temporizador.

En `@types/react` 19, `useRef` **exige siempre un argumento**: `useRef()` a secas es un error (`Expected 1 arguments, but got 0.`), y `current` se puede modificar en los dos casos.

Pon a prueba tu intuición:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const campoRef = useRef<HTMLInputElement>(null)\nconst vecesRef = useRef(0)\nconst temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null)\n\nfunction manejarClic() {\n  campoRef.current.focus()                                  // 1\n  vecesRef.current += 1                                     // 2\n  temporizadorRef.current = setTimeout(() => {}, 100)       // 3\n  campoRef.current = null                                   // 4\n}\n\n// ¿Cuáles de las cuatro líneas dan error de tipos?",
  "opciones": [
    "Solo la 1",
    "La 1 y la 4",
    "La 3 y la 4",
    "Ninguna: React 19 no comprueba las refs"
  ],
  "correcta": 0,
  "explicacion": "Solo la 1: current es HTMLInputElement | null y TypeScript lo dice: 'campoRef.current' is possibly 'null'. La 2 y la 3 modifican refs de valor, que es su uso normal. La 4 compila: en @types/react 19 todas las refs de useRef son modificables, también las del DOM. Funciona, pero no deberías hacerlo: la ref del DOM la gestiona React."
}
```

La **ref de un temporizador** merece un detalle. Es tentador escribir `useRef<NodeJS.Timeout>`, que es lo que verás en muchos proyectos, pero en una aplicación que solo corre en el navegador da `Cannot find namespace 'NodeJS'.`, porque ese espacio de nombres viene de los tipos de Node. `ReturnType<typeof setTimeout>` vale en los dos mundos: te da lo que `setTimeout` devuelva en tu configuración (un `number` en el navegador, otra cosa en Node).

Este buscador de invitados junta los dos usos: una ref al DOM para devolver el cursor al campo, y una ref con el temporizador de una búsqueda que espera 400 ms desde la última tecla (lección 33):

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Buscador con retardo: una ref al DOM y otra de valor",
  "consigna": "Escribe «mar» y fíjate en que «Buscando» tarda un momento en cambiar: cada tecla cancela el temporizador anterior. Pulsa «Limpiar»: vacía el buscador y deja el cursor en el campo. Después quita el ? de campoRef.current?.focus() y lee el error del panel.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState, type ChangeEvent } from 'react'\n\nconst INVITADOS = ['Marta Ibáñez', 'Tomás Gil', 'Aitana Roca', 'Martín Soler', 'Irene Bosch']\n\nexport default function App() {\n  const [texto, setTexto] = useState('')\n  const [busqueda, setBusqueda] = useState('')\n  const campoRef = useRef<HTMLInputElement>(null)\n  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null)\n\n  useEffect(() => {\n    return () => {\n      if (temporizadorRef.current !== null) clearTimeout(temporizadorRef.current)\n    }\n  }, [])\n\n  function manejarCambio(e: ChangeEvent<HTMLInputElement>) {\n    const valor = e.target.value\n    setTexto(valor)\n    if (temporizadorRef.current !== null) clearTimeout(temporizadorRef.current)\n    temporizadorRef.current = setTimeout(() => setBusqueda(valor), 400)\n  }\n\n  function manejarLimpiar() {\n    if (temporizadorRef.current !== null) clearTimeout(temporizadorRef.current)\n    setTexto('')\n    setBusqueda('')\n    campoRef.current?.focus()\n  }\n\n  const coincidencias = INVITADOS.filter((nombre) =>\n    nombre.toLowerCase().includes(busqueda.toLowerCase()),\n  )\n\n  return (\n    <main>\n      <h1>Buscar invitado</h1>\n      <label>\n        Nombre\n        <input ref={campoRef} value={texto} onChange={manejarCambio} />\n      </label>\n      <button onClick={manejarLimpiar}>Limpiar</button>\n      <p>Buscando: «{busqueda}»</p>\n      <ul>\n        {coincidencias.map((nombre) => (\n          <li key={nombre}>{nombre}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

## `useActionState`: el estado de la acción y su tipo

`useActionState` (lección 58) recibe una acción —una función que recibe el estado anterior y los datos del formulario— y un estado inicial. En TypeScript, **el tipo del estado sale de la propia acción**, así que la acción es donde pones los tipos:

```tsx
async function confirmar(anterior: Estado, formData: FormData): Promise<Estado> { ... }
```

Con esa firma, `useActionState(confirmar, ESTADO_INICIAL)` deduce todo: el estado es un `Estado`, el segundo valor (la acción que va en `<form action={...}>`) es una función que recibe un `FormData`, y el tercero, `isPending`, un booleano.

Hay dos obstáculos habituales:

- **`FormData.get` no devuelve un `string`.** Devuelve `FormDataEntryValue | null`: un texto, un archivo o nada. Antes de usar el valor como texto, hay que estrecharlo con `typeof nombre === 'string'`. El compilador lo explica así: `Type 'FormDataEntryValue | null' is not assignable to type 'string'.`
- **El estado inicial tiene que encajar con el tipo de la acción.** Si el estado inicial se queda corto, el error es largo, porque `useActionState` tiene dos firmas (con y sin datos del formulario) y TypeScript te cuenta por qué falla cada una. **Lee el final del mensaje**:

```text
useActionState(confirmar, { mensaje: null })
No overload matches this call.
  Overload 1 of 2, ... gave the following error.
  ...
  Overload 2 of 2, ... gave the following error.
    Argument of type '{ mensaje: null; }' is not assignable to parameter of type 'Estado'.
      Property 'confirmados' is missing in type '{ mensaje: null; }' but required in type 'Estado'.
```

Es decir: al estado inicial le falta la propiedad `confirmados`. Lo importante está en las dos últimas líneas.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Confirmar asistencia con useActionState tipado",
  "consigna": "Confirma con un nombre y con el campo vacío: en los dos casos la acción devuelve un Estado completo. Después, en App.tsx, borra la anotación Promise<Estado> del retorno de confirmar y mira si el panel protesta (no lo hará: se deduce). Cambia luego formData: FormData por formData: string y lee los tres errores: dos dentro de la acción (get no existe en un string) y uno en el form, porque la acción que devuelve el Hook ahora espera un string y un formulario entrega un FormData.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useActionState } from 'react'\n\ninterface Estado {\n  mensaje: string | null\n  confirmados: number\n}\n\nconst ESTADO_INICIAL: Estado = { mensaje: null, confirmados: 0 }\n\nasync function confirmar(anterior: Estado, formData: FormData): Promise<Estado> {\n  const nombre = formData.get('nombre')\n  const menu = String(formData.get('menu'))\n\n  if (typeof nombre !== 'string' || nombre.trim() === '') {\n    return { ...anterior, mensaje: 'Escribe tu nombre para confirmar.' }\n  }\n\n  await fetch('/api/confirmaciones', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ nombre: nombre.trim(), menu }),\n  })\n  return {\n    mensaje: `Gracias, ${nombre.trim()}: te esperamos (menú ${menu}).`,\n    confirmados: anterior.confirmados + 1,\n  }\n}\n\nexport default function App() {\n  const [estado, accionConfirmar, pendiente] = useActionState(confirmar, ESTADO_INICIAL)\n\n  return (\n    <main>\n      <h1>Confirma tu asistencia</h1>\n      <form action={accionConfirmar}>\n        <label>\n          Tu nombre\n          <input name=\"nombre\" />\n        </label>\n        <label>\n          Menú\n          <select name=\"menu\">\n            <option>carne</option>\n            <option>pescado</option>\n            <option>vegetariano</option>\n          </select>\n        </label>\n        <button disabled={pendiente}>{pendiente ? 'Enviando…' : 'Confirmar'}</button>\n      </form>\n      <p role=\"status\">{estado.mensaje}</p>\n      <p>Confirmaciones desde esta pantalla: {estado.confirmados}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "confirmaciones": [
      {
        "id": 1,
        "nombre": "Marta",
        "menu": "pescado"
      }
    ]
  },
  "red": {
    "latencia": 700
  }
}
```

Cuando la acción no cuelga de un formulario, sino de un botón, sus datos pueden ser otra cosa: `useActionState<Estado, string>(accion, inicial)` fija el segundo parámetro de tipo (los datos que recibirá la acción) y el valor devuelto es una función `(dato: string) => void`. Como en la lección 58, esa llamada va dentro de una transición.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Anota los bordes, deja que el interior se deduzca",
      "texto": "Props de los componentes (lección 72), firma del reductor, firma de la acción de un formulario, tipos de los contextos. Dentro del componente, las constantes, los resultados de map y filter y los setters se infieren solos."
    },
    {
      "titulo": "Un tipo de dominio compartido en un archivo propio",
      "texto": "Invitado, Respuesta y Accion los usa el reductor, el contexto y los componentes. Viven en un archivo (aquí, invitadosReducer.ts) y se importan con import type. Que cada componente no redeclare los suyos."
    },
    {
      "titulo": "Para cada Hook con null o lista vacía, un argumento de tipo",
      "texto": "useState<Invitado | null>(null), useState<Invitado[]>([]), useRef<HTMLInputElement>(null), createContext<Valor | null>(null). Es el patrón que más escribirás."
    },
    {
      "titulo": "Un hook por cada contexto que admite null",
      "texto": "usePresupuesto(), no useContext(PresupuestoContext) por todas partes. Quita el null, da un mensaje claro y deja el contexto privado."
    },
    {
      "titulo": "Los tipos de evento, solo en funciones con nombre",
      "texto": "En línea se deducen; en una función aparte los escribes de react. Si el manejador no usa el evento, no lo declares."
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
      "mito": "Hay que escribir el tipo de cada useState.",
      "realidad": "Solo cuando el valor inicial no lo dice todo: null, una lista vacía o un texto que pertenece a una lista cerrada. useState(0), useState('') y useState(false) ya son number, string y boolean."
    },
    {
      "mito": "El tipo de las acciones de un reductor es una enumeración de textos.",
      "realidad": "Es una unión de objetos, cada uno con su type y sus datos. Los datos dependen de la acción, y esa es la ventaja: dispatch rechaza una acción sin los datos que pide."
    },
    {
      "mito": "Un ! o un as evitan el null del contexto.",
      "realidad": "Lo silencian, no lo evitan. El null sigue existiendo en ejecución cuando falta el proveedor. Con el hook que comprueba, el error llega con un mensaje claro y el tipo queda sin null."
    },
    {
      "mito": "e.target y e.currentTarget son lo mismo.",
      "realidad": "No en un clic. currentTarget es el elemento con el manejador y TypeScript conoce su tipo. target puede ser un descendiente y solo es un EventTarget. En los eventos de cambio de un campo, React los tipa igual, pero sigue siendo mejor costumbre leer currentTarget."
    }
  ]
}
```

## Errores típicos

### `useState([])` y la lista que no admite nada

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "function ListaDeRegalos() {\n  const [regalos, setRegalos] = useState([])\n\n  function anadir(nombre: string) {\n    setRegalos([...regalos, { id: Date.now(), nombre }])\n  }\n\n  return <button onClick={() => anadir('Batidora')}>Añadir</button>\n}\n\n// ¿Qué dice TypeScript?",
  "opciones": [
    "Nada: [] es una lista de lo que sea",
    "Error en setRegalos: el objeto no es asignable a never",
    "Error en useState: falta el argumento de tipo",
    "Error en anadir: nombre no puede ser string"
  ],
  "correcta": 1,
  "explicacion": "useState([]) se deduce como never[]: una lista que no admite ningún elemento. El panel dice Type '{ id: number; nombre: string; }' is not assignable to type 'never'. La solución es el argumento de tipo, con el tipo del elemento: useState<Regalo[]>([])."
}
```

### Usar los tipos de evento del navegador

`KeyboardEvent`, `SubmitEvent`, `MouseEvent`, `FocusEvent`: el navegador tiene tipos globales con **los mismos nombres** que los de React. Si olvidas importarlos de `react`, TypeScript usa los globales, y no encajan:

```text
function manejarTecla(e: KeyboardEvent) { ... }     // sin importar de react
<input onKeyDown={manejarTecla} />
Type '(e: KeyboardEvent) => void' is not assignable to type 'KeyboardEventHandler<HTMLInputElement>'.
  Types of parameters 'e' and 'event' are incompatible.
    Type 'KeyboardEvent<HTMLInputElement>' is missing the following properties from type 'KeyboardEvent': isComposing, initKeyboardEvent, ...
```

Es decir: React no te pasa un `KeyboardEvent` del navegador, sino su propio evento sintético, que tiene otras propiedades. La solución es `import type { KeyboardEvent } from 'react'`. El mismo error aparece con `SubmitEvent`.

### Callar el `null` con `!`

```tsx
const valor = useContext(PresupuestoContext)!
campoRef.current!.focus()
```

El signo de exclamación dice «confía en mí, no es null». Con el contexto, mentirás el día que falte el proveedor. Con la ref del DOM, mentirás cuando el nodo aún no exista (por ejemplo, si el elemento está dentro de un `{cond && ...}`). Usa el hook que comprueba, y `?.` o un `if` para las refs.

### `useRef` sin argumento, o con el tipo de Node

`useRef()` a secas da `Expected 1 arguments, but got 0.` y `useRef<NodeJS.Timeout>` da `Cannot find namespace 'NodeJS'.` en una aplicación del navegador. Las dos soluciones están en la sección de refs: pasa `null` o el valor inicial, y usa `ReturnType<typeof setTimeout>`.

### Un reductor con `any` en la acción

`function reductor(estado: Invitado[], accion: any)` compila y desactiva todo lo que te acaba de dar esta lección: la comprobación de los datos de cada acción, el estrechamiento en cada `case` y el aviso de exhaustividad. Si el panel de tipos se queja de una acción, el problema casi siempre es que la unión no describe lo que de verdad se despacha.

## Ejercicios

Los tres ejercicios usan `exigirTiposCorrectos`: además del comportamiento, el panel «Errores de tipos» **no puede marcar nada**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: la lista de regalos, con su reductor",
  "consigna": "El reductor de regalos no tiene tipos (el panel marca varios errores) y le falta la acción «liberado», así que «Liberar» rompe la aplicación. Declara y exporta el tipo Accion como unión discriminada (reservado con id y quien, liberado con id, anadido con id y nombre), tipa el reductor, añade el caso de liberado (reservadoPor vuelve a null) y haz que el default compruebe con never que no queda ninguna acción sin tratar.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useReducer, useState } from 'react'\nimport { regalosReducer, type Regalo } from './regalosReducer'\n\nlet siguienteId = 4\n\nconst REGALOS: Regalo[] = [\n  { id: 1, nombre: 'Batidora', reservadoPor: null },\n  { id: 2, nombre: 'Juego de sábanas', reservadoPor: 'Tomás' },\n  { id: 3, nombre: 'Maleta de viaje', reservadoPor: null },\n]\n\nexport default function App() {\n  const [regalos, dispatch] = useReducer(regalosReducer, REGALOS)\n  const [quien, setQuien] = useState('')\n  const [nuevo, setNuevo] = useState('')\n\n  return (\n    <main>\n      <h1>Lista de regalos</h1>\n      <label>\n        Tu nombre\n        <input value={quien} onChange={(e) => setQuien(e.target.value)} />\n      </label>\n      <ul>\n        {regalos.map((regalo) => (\n          <li key={regalo.id}>\n            <span>\n              {`${regalo.nombre}: ${regalo.reservadoPor ? `reservado por ${regalo.reservadoPor}` : 'libre'}`}\n            </span>\n            {regalo.reservadoPor === null ? (\n              <button\n                aria-label={`Reservar ${regalo.nombre}`}\n                onClick={() => {\n                  if (quien.trim() !== '') {\n                    dispatch({ type: 'reservado', id: regalo.id, quien: quien.trim() })\n                  }\n                }}\n              >\n                Reservar\n              </button>\n            ) : (\n              <button\n                aria-label={`Liberar ${regalo.nombre}`}\n                onClick={() => dispatch({ type: 'liberado', id: regalo.id })}\n              >\n                Liberar\n              </button>\n            )}\n          </li>\n        ))}\n      </ul>\n      <form\n        onSubmit={(e) => {\n          e.preventDefault()\n          if (nuevo.trim() === '') return\n          dispatch({ type: 'anadido', id: siguienteId++, nombre: nuevo.trim() })\n          setNuevo('')\n        }}\n      >\n        <label>\n          Nuevo regalo\n          <input value={nuevo} onChange={(e) => setNuevo(e.target.value)} />\n        </label>\n        <button>Añadir</button>\n      </form>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "regalosReducer.ts",
      "codigo": "export interface Regalo {\n  id: number\n  nombre: string\n  reservadoPor: string | null\n}\n\n// 1. Declara y exporta el tipo «Accion» como unión discriminada:\n//    'reservado' (id y quien), 'liberado' (id) y 'anadido' (id y nombre).\n// 2. Tipa el reductor: estado Regalo[], acción Accion, retorno Regalo[].\n// 3. Añade el caso 'liberado' y haz que el default compruebe, con never,\n//    que no queda ninguna acción sin tratar.\nexport function regalosReducer(regalos, accion) {\n  switch (accion.type) {\n    case 'reservado': {\n      return regalos.map((r) => (r.id === accion.id ? { ...r, reservadoPor: accion.quien } : r))\n    }\n    case 'anadido': {\n      return [...regalos, { id: accion.id, nombre: accion.nombre, reservadoPor: null }]\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "regalosReducer.ts",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Con un nombre escrito, «Reservar» marca el regalo como reservado por esa persona",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Batidora"
          }
        }
      ],
      "espera": {
        "texto": "Batidora: reservado por Marta"
      }
    },
    {
      "descripcion": "«Liberar» devuelve un regalo reservado a «libre»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Batidora"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Liberar Batidora"
          }
        }
      ],
      "espera": {
        "texto": "Batidora: libre"
      }
    },
    {
      "descripcion": "Un regalo nuevo se añade a la lista como libre",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo regalo",
            "texto": "Cafetera"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "texto": "Cafetera: libre"
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: la música del banquete, con un contexto tipado",
  "consigna": "El contexto de la playlist se crea con createContext(null), sin tipos: el panel marca errores en los tres archivos, y el botón «Quitar» de Canciones.tsx no funciona porque el contexto no ofrece quitar. Tipa el contexto (canciones, anadir y quitar, o null), tipa el proveedor, implementa quitar y haz que usePlaylist lance un Error si se usa fuera del proveedor.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\nimport { PlaylistProvider, usePlaylist } from './PlaylistContext'\nimport Canciones from './Canciones'\n\nfunction AnadirCancion() {\n  const { anadir } = usePlaylist()\n  const [titulo, setTitulo] = useState('')\n\n  return (\n    <form\n      onSubmit={(e) => {\n        e.preventDefault()\n        if (titulo.trim() === '') return\n        anadir(titulo.trim())\n        setTitulo('')\n      }}\n    >\n      <label>\n        Canción\n        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Música del banquete</h1>\n      <PlaylistProvider>\n        <AnadirCancion />\n        <Canciones />\n      </PlaylistProvider>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PlaylistContext.tsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\n// 1. Tipa el contexto: su valor es { canciones, anadir, quitar } o null.\n// 2. Tipa las props del proveedor (children) y el estado de canciones.\n// 3. Añade «quitar» al valor del contexto (Canciones.tsx ya lo usa).\n// 4. Haz que usePlaylist lance un Error si se usa fuera del proveedor.\nconst PlaylistContext = createContext(null)\n\nexport function PlaylistProvider({ children }) {\n  const [canciones, setCanciones] = useState([])\n\n  function anadir(titulo) {\n    setCanciones([...canciones, titulo])\n  }\n\n  return <PlaylistContext value={{ canciones, anadir }}>{children}</PlaylistContext>\n}\n\nexport function usePlaylist() {\n  return useContext(PlaylistContext)\n}\n"
    },
    {
      "nombre": "Canciones.tsx",
      "codigo": "import { usePlaylist } from './PlaylistContext'\n\nexport default function Canciones() {\n  const { canciones, quitar } = usePlaylist()\n\n  if (canciones.length === 0) return <p>Todavía no hay canciones.</p>\n\n  return (\n    <ul>\n      {canciones.map((cancion) => (\n        <li key={cancion}>\n          <span>{cancion}</span>\n          <button aria-label={`Quitar ${cancion}`} onClick={() => quitar(cancion)}>\n            Quitar\n          </button>\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "PlaylistContext.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Una canción añadida aparece en la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Canción",
            "texto": "Color esperanza"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Color esperanza"
      }
    },
    {
      "descripcion": "«Quitar» elimina la canción de la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Canción",
            "texto": "Color esperanza"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Color esperanza"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Color esperanza"
        }
      }
    },
    {
      "descripcion": "Con la lista vacía se avisa de que no hay canciones",
      "pasos": [],
      "espera": {
        "texto": "Todavía no hay canciones."
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 3: un buscador con eventos y una ref",
  "consigna": "Los tres manejadores de App.tsx no tienen tipos. Tipa manejarCambio, manejarTecla y manejarLimpiar con los tipos de evento de react (el elemento de cada uno es el que lleva el atributo). Después añade una ref al input para que «Limpiar», además de vaciar el campo, deje el cursor dentro y se pueda seguir escribiendo sin hacer clic.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\n\nconst INVITADOS = ['Marta Ibáñez', 'Tomás Gil', 'Aitana Roca', 'Martín Soler', 'Irene Bosch']\n\nexport default function App() {\n  const [texto, setTexto] = useState('')\n\n  // 1. Tipa los tres manejadores con los tipos de evento de React.\n  // 2. Añade una ref al input para que «Limpiar» deje el cursor en el campo.\n  function manejarCambio(e) {\n    setTexto(e.target.value)\n  }\n\n  function manejarTecla(e) {\n    if (e.key === 'Escape') setTexto('')\n  }\n\n  function manejarLimpiar(e) {\n    console.log('Pulsado:', e.currentTarget.name)\n    setTexto('')\n  }\n\n  const coincidencias = INVITADOS.filter((nombre) =>\n    nombre.toLowerCase().includes(texto.toLowerCase()),\n  )\n\n  return (\n    <main>\n      <h1>Buscar invitado</h1>\n      <label>\n        Nombre\n        <input value={texto} onChange={manejarCambio} onKeyDown={manejarTecla} />\n      </label>\n      <button name=\"limpiar\" onClick={manejarLimpiar}>\n        Limpiar\n      </button>\n      <ul>\n        {coincidencias.map((nombre) => (\n          <li key={nombre}>{nombre}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\n.confirmado {\n  color: #166534;\n}\n\n.declinado {\n  color: #991b1b;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al escribir «mar», la lista se reduce a los invitados que contienen esas letras",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "mar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Martín Soler"
      }
    },
    {
      "descripcion": "La tecla Escape vacía el campo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "mar"
          }
        },
        {
          "teclear": "{Escape}"
        }
      ],
      "espera": {
        "etiqueta": "Nombre",
        "valor": ""
      }
    },
    {
      "descripcion": "Tras «Limpiar», el cursor queda en el campo y lo que se teclea entra en él",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "mar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Limpiar"
          }
        },
        {
          "teclear": "Tom"
        }
      ],
      "espera": {
        "etiqueta": "Nombre",
        "valor": "Tom"
      }
    }
  ]
}
```

### Retos para seguir practicando

1. En el ejercicio 1, añade una acción `'renombrado'` con `id` y `nombre`. Mira dónde protesta el compilador antes de escribir su `case`. Después prueba a despacharla con `nombre: 42`.
2. Convierte la carga de invitados de la sección de `useState` en una pieza real: un `useEffect` (lección 38) que pida `/api/invitados` y guarde el resultado en un `useState<CargaInvitados>`. Comprueba que al renderizar no puedes leer `invitados` sin haber comprobado `estado`.
3. En el ejercicio 2, añade una segunda canción favorita (`favorita: string | null`) en el estado del proveedor, con su función para elegirla. ¿Qué tienes que cambiar en el tipo del valor del contexto?
4. Escribe un `CampoNumero` con una prop `onCambiar: (valor: number) => void`. Tipa su `onChange` con `ChangeEvent<HTMLInputElement>` y convierte con `e.target.valueAsNumber`. Anota qué ocurre con un campo vacío (lección 22).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Using TypeScript",
      "descripcion": "La guía de react.dev con los ejemplos de useState, useReducer, useContext, los tipos de evento y los estilos.",
      "url": "https://react.dev/learn/typescript",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useReducer",
      "descripcion": "La referencia del Hook, con la sección de cómo escribir un reductor y la nota sobre tipos.",
      "url": "https://react.dev/reference/react/useReducer",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useActionState",
      "descripcion": "La referencia del Hook, con la firma de la acción y lo que devuelve.",
      "url": "https://react.dev/reference/react/useActionState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "TypeScript: Narrowing",
      "descripcion": "El capítulo del Handbook que explica el estrechamiento de uniones discriminadas, la base de los reductores tipados.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "React TypeScript Cheatsheet: Hooks",
      "descripcion": "La hoja de referencia de la comunidad, con muchos casos de useState, useRef y useContext.",
      "url": "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/hooks/",
      "etiqueta": "Comunidad"
    }
  ]
}
```
