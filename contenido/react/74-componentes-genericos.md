# Componentes genéricos

- **Módulo:** React con TypeScript
- **Slug:** `componentes-genericos` (autogenerado del título)
- **Orden:** 740
- **Fuentes:** [Using TypeScript](https://react.dev/learn/typescript) + [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) — ver `contenido/react/TEMARIO.md` #74

---

## Qué es y para qué sirve

El coworking La Colmena tiene una lista de socios y una lista de salas. Las dos se pintan igual: una `<ul>` con un `<li>` por elemento, con su `key`. Solo cambia **qué es un elemento** y cómo se enseña. Quieres un solo componente `Lista`, pero con TypeScript aparece el problema de siempre:

- Si lo tipas para `Socio[]`, no sirve para las salas.
- Si copias el componente (`ListaSocios`, `ListaSalas`), tienes el mismo código dos veces, y tres con los pedidos de mañana.
- Si lo tipas con `any`, sirve para todo, pero el compilador deja de comprobar nada: una errata en `socio.nomre` pasa sin aviso.

La solución es la misma que en el temario de TypeScript para una función que sirve con varios tipos: **un parámetro de tipo**. Es el tema de las lecciones 28 a 30 de ese temario (funciones genéricas, restricciones con `extends` y valores por defecto), que aquí damos por sabidas. Lo que esta lección añade es cómo se ve un **componente genérico**: el tipo de las props depende de un tipo `T` que decide quien lo usa.

> **Un componente genérico no acepta «cualquier cosa»: acepta un tipo y obliga a que todas las props sean coherentes con él.**

## Tu primer componente genérico

Esta es la `Lista` que sirve para socios y para salas. Fíjate en cómo `T` aparece en tres sitios: en la declaración de la función, en el tipo de las props y en el tipo de la función `renderizar`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { ReactNode } from 'react'\n\ninterface ListaProps<T> {\n  elementos: T[]\n  renderizar: (elemento: T) => ReactNode\n}\n\nexport default function Lista<T extends { id: string }>({ elementos, renderizar }: ListaProps<T>) {\n  return (\n    <ul>\n      {elementos.map((elemento) => (\n        <li key={elemento.id}>{renderizar(elemento)}</li>\n      ))}\n    </ul>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "interface ListaProps<T> {",
      "nota": "Las props son un tipo genérico, como cualquier interface genérica del temario de TypeScript: ListaProps<Socio> sería las props de una lista de socios, y ListaProps<Sala> las de una lista de salas."
    },
    {
      "fragmento": "elementos: T[]",
      "nota": "Una lista de T. Aquí es donde TypeScript descubrirá qué es T, mirando lo que le pases."
    },
    {
      "fragmento": "renderizar: (elemento: T) => ReactNode",
      "nota": "Una función que recibe un T y devuelve algo que React sabe pintar (lección 72). El mismo T que en elementos: si la lista es de socios, la función recibe un socio."
    },
    {
      "fragmento": "export default function Lista<T extends { id: string }>(",
      "nota": "El parámetro de tipo se declara entre el nombre de la función y los paréntesis. Lleva una restricción: cualquier T tiene que tener al menos un id de texto, porque la lista lo necesita para la key (lección 11)."
    },
    {
      "fragmento": "}: ListaProps<T>) {",
      "nota": "Las props del componente son ListaProps<T>, con el mismo T de la declaración. Es lo que hace coherentes las dos props entre sí."
    },
    {
      "fragmento": "<li key={elemento.id}>",
      "nota": "Gracias a la restricción, elemento.id existe y es un texto. Sin ella, el compilador diría: Property 'id' does not exist on type 'T'. (más abajo se ve)."
    }
  ]
}
```

Y aquí está en marcha, con las dos listas. No hay ningún `<Socio>` ni `<Sala>` escrito en las llamadas: TypeScript lo averigua:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista, dos tipos de dato",
  "consigna": "Prueba a romperlo para ver cómo comprueba los tipos. En la lista de socios, escribe socio.plazas en vez de socio.plan: el panel dice que plazas no existe en Socio. En la de salas, escribe sala.plan: dice que plan no existe en Sala. El mismo componente, dos tipos distintos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import Lista from './Lista'\n\ninterface Socio {\n  id: string\n  nombre: string\n  plan: 'dia' | 'mes' | 'anual'\n}\n\ninterface Sala {\n  id: string\n  nombre: string\n  plazas: number\n  precioHora: number\n}\n\nconst SOCIOS: Socio[] = [\n  { id: 's1', nombre: 'Aitor Gil', plan: 'mes' },\n  { id: 's2', nombre: 'Noa Ferrer', plan: 'anual' },\n  { id: 's3', nombre: 'Berta Solé', plan: 'dia' },\n]\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8, precioHora: 12 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 4, precioHora: 7 },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Coworking La Colmena</h1>\n      <h2>Socios</h2>\n      <Lista\n        elementos={SOCIOS}\n        renderizar={(socio) => (\n          <span>\n            {socio.nombre} · plan {socio.plan}\n          </span>\n        )}\n      />\n      <h2>Salas</h2>\n      <Lista\n        elementos={SALAS}\n        renderizar={(sala) => (\n          <span>\n            {sala.nombre} · {sala.plazas} plazas · {sala.precioHora} €/h\n          </span>\n        )}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Lista.tsx",
      "codigo": "import type { ReactNode } from 'react'\n\ninterface ListaProps<T> {\n  elementos: T[]\n  renderizar: (elemento: T) => ReactNode\n}\n\nexport default function Lista<T extends { id: string }>({ elementos, renderizar }: ListaProps<T>) {\n  return (\n    <ul>\n      {elementos.map((elemento) => (\n        <li key={elemento.id}>{renderizar(elemento)}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

## La inferencia hace el trabajo

Mira cómo se usa la lista de salas:

```tsx
<Lista elementos={SALAS} renderizar={(sala) => <span>{sala.nombre}</span>} />
```

No dice en ningún sitio que `T` es `Sala`. TypeScript lo **infiere** de las props: `elementos={SALAS}` es un `Sala[]`, así que `T` es `Sala`, y entonces `renderizar` recibe un `Sala`. Por eso `sala.nombre` se autocompleta y `sala.plan` es un error, sin que hayas escrito un solo tipo en el JSX. El orden de las props da igual, y el tipo del parámetro de la función se deduce de la lista, no al revés.

Si alguna vez necesitas dar el tipo a mano, se escribe pegado al nombre del componente: `<Lista<Socio> elementos={...} renderizar={...} />`. Es raro, pero es la única salida cuando no hay de dónde inferir. Pon a prueba tu intuición con cuatro usos:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// SOCIOS es un Socio[] (id, nombre, plan)\n// SALAS es un Sala[] (id, nombre, plazas, precioHora)\n\n<Lista elementos={SALAS} renderizar={(s) => <b>{s.plazas}</b>} />      // 1\n<Lista elementos={SOCIOS} renderizar={(s) => <b>{s.plazas}</b>} />     // 2\n<Lista elementos={[]} renderizar={(s) => <b>{s.nombre}</b>} />         // 3\n<Lista<Socio> elementos={[]} renderizar={(s) => <b>{s.nombre}</b>} />  // 4\n\n// ¿Cuáles dan error de tipos?",
  "opciones": [
    "Solo la 2",
    "La 2 y la 3",
    "La 2, la 3 y la 4",
    "Ninguna: T se infiere siempre"
  ],
  "correcta": 1,
  "explicacion": "La 2 falla: T es Socio y Socio no tiene plazas (Property 'plazas' does not exist on type 'Socio'). La 3 falla: con [] no hay de dónde sacar T, y TypeScript lo deja en never, un tipo sin propiedades (Property 'nombre' does not exist on type 'never'). La 4 funciona: al dar T a mano, ya no hace falta inferir. Una lista vacía literal es el caso típico en que escribes <Lista<Socio>>."
}
```

Cuando la inferencia no tiene de dónde sacar el tipo, te lo dice a su manera: el `never` de la tercera línea es el mismo que viste en `useState([])` en la lección 73.

## Restricciones: `T extends { id: string }`

Sin la restricción, `Lista<T>` no puede leer ninguna propiedad de `T`: un `T` sin más puede ser un número, una cadena o un objeto cualquiera. Si quitas el `extends` de la `Lista` de arriba, el compilador responde:

```text
<li key={elemento.id}>
Property 'id' does not exist on type 'T'.
```

Es decir: `T` podría ser cualquier tipo y nada garantiza que tenga un `id`. Tienes que decírselo al compilador, y eso es exactamente una **restricción** (lección 29 del temario de TypeScript): `T extends { id: string }` significa «`T` puede ser cualquier tipo, con tal de que tenga, como mínimo, un `id` de texto». Un `Socio` y un `Sala` la cumplen; el resto de sus propiedades (el `plan`, las `plazas`) da igual.

La restricción tiene un segundo trabajo: **rechazar a quien no la cumple**, en el sitio donde se usa el componente. Si pasas elementos sin `id`:

```text
<Lista elementos={SIN_ID} renderizar={(s) => <b>{s.nombre}</b>} />
Type 'SinId[]' is not assignable to type '{ id: string; }[]'.
  Property 'id' is missing in type 'SinId' but required in type '{ id: string; }'.
```

Es decir: la lista de `SinId` no encaja en una lista de «cosas con id», porque le falta la propiedad. Fíjate en que el mensaje nombra la restricción (`{ id: string; }`).

Dos matices de la restricción:

- **Basta con lo que el componente usa.** No pidas un `Socio` completo; pide `{ id: string }`. Cuanto menos pidas, a más tipos sirve.
- **La clave de `key` no tiene por qué ser `id`.** Si tu dato usa `codigo` o `matricula`, la solución es una prop que lo diga: `obtenerClave: (elemento: T) => string`. Con ella, ni siquiera necesitas la restricción.

## `keyof`: las columnas de una tabla

Una tabla genérica es el caso más completo. Recibe las filas (de cualquier tipo con `id`) y las columnas, y cada columna dice **qué propiedad de la fila enseña**. Ese «qué propiedad» tiene que ser, sí o sí, una propiedad que existe en `T`: justo lo que expresa `keyof T` (lección 37 del temario de TypeScript), el tipo que reúne los nombres de las propiedades de `T`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tabla que sirve para salas y para socios",
  "consigna": "Escribe una clave que no existe en la primera tabla, por ejemplo clave: 'precio' (la propiedad se llama precioHora), y lee el mensaje. Después, en Tabla.tsx, quita el String( ) de {String(fila[columna.clave])} para ver qué pasa cuando intentas pintar directamente el valor de una columna.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import Tabla from './Tabla'\n\ninterface Sala {\n  id: string\n  nombre: string\n  plazas: number\n  precioHora: number\n}\n\ninterface Socio {\n  id: string\n  nombre: string\n  plan: 'dia' | 'mes' | 'anual'\n}\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8, precioHora: 12 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 4, precioHora: 7 },\n  { id: 'c', nombre: 'Sala Huerta', plazas: 12, precioHora: 18 },\n]\n\nconst SOCIOS: Socio[] = [\n  { id: 's1', nombre: 'Aitor Gil', plan: 'mes' },\n  { id: 's2', nombre: 'Noa Ferrer', plan: 'anual' },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Coworking La Colmena</h1>\n      <h2>Salas</h2>\n      <Tabla\n        filas={SALAS}\n        columnas={[\n          { clave: 'nombre', titulo: 'Sala' },\n          { clave: 'plazas', titulo: 'Plazas' },\n          { clave: 'precioHora', titulo: 'Euros por hora' },\n        ]}\n      />\n      <h2>Socios</h2>\n      <Tabla\n        filas={SOCIOS}\n        columnas={[\n          { clave: 'nombre', titulo: 'Nombre' },\n          { clave: 'plan', titulo: 'Plan' },\n        ]}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tabla.tsx",
      "codigo": "interface Columna<T> {\n  clave: keyof T\n  titulo: string\n}\n\ninterface TablaProps<T> {\n  filas: T[]\n  columnas: Columna<T>[]\n}\n\nexport default function Tabla<T extends { id: string }>({ filas, columnas }: TablaProps<T>) {\n  return (\n    <table>\n      <thead>\n        <tr>\n          {columnas.map((columna) => (\n            <th key={String(columna.clave)}>{columna.titulo}</th>\n          ))}\n        </tr>\n      </thead>\n      <tbody>\n        {filas.map((fila) => (\n          <tr key={fila.id}>\n            {columnas.map((columna) => (\n              <td key={String(columna.clave)}>{String(fila[columna.clave])}</td>\n            ))}\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Tabla.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Lo que comprueba el panel:

```text
columnas={[{ clave: 'precio', titulo: 'Precio' }]}
Type '"precio"' is not assignable to type 'keyof Sala'.
```

Es decir: `'precio'` no es una de las claves de `Sala`. Es la misma idea que en el temario de TypeScript, ahora en una prop: **el nombre de la columna deja de ser un texto libre y pasa a ser una clave comprobada**. El editor te sugiere `nombre`, `plazas` y `precioHora` al escribirla, y un renombrado de `precioHora` en `Sala` te marca todas las tablas que lo usaban.

Y el segundo experimento:

```text
<td>{fila[columna.clave]}</td>
Type 'T[keyof T]' is not assignable to type 'ReactNode'.
  Type 'T[string] | T[number] | T[symbol]' is not assignable to type 'ReactNode'.
    ...
```

Es decir: el tipo del valor de una celda es «lo que haya en cualquier propiedad de `T`», y como `T` puede ser cualquier cosa, no se puede garantizar que React sepa pintarlo (un objeto no se pinta, lección 6). `String(...)` lo convierte en texto y lo resuelve. Y la `key` de las columnas también lleva `String(columna.clave)` porque `keyof T` puede ser un `string`, un `number` o un `symbol`, y una `key` de React tiene que ser un texto o un número.

### Columnas que dan formato a su propio valor

En una tabla real, una columna quiere enseñar `12` como «12,00 €» y otra quiere enseñar `1` como «1 puesto». Cada columna debe poder tener su función `formatear`, y esa función tiene que recibir **el tipo de la propiedad de su columna**: un `number` para `plazas` y un `string` para `nombre`. Eso pide un tipo más avanzado, con un tipo mapeado (lección 46 del temario de TypeScript) que construye una variante por cada clave de `T`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada columna formatea el tipo de su propiedad",
  "consigna": "Fíjate en que en la columna de plazas, n es un number, y en la de precio, euros también (los dos se deducen de la clave). Prueba a escribir euros.toUpperCase() en la columna de precio: el panel dice que toUpperCase no existe en number. Y escribe clave: 'nombres': el mensaje te sugiere nombre.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import Tabla from './Tabla'\n\ninterface Sala {\n  id: string\n  nombre: string\n  plazas: number\n  precioHora: number\n}\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8, precioHora: 12 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 1, precioHora: 7.5 },\n  { id: 'c', nombre: 'Sala Huerta', plazas: 12, precioHora: 18 },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Salas de La Colmena</h1>\n      <Tabla\n        filas={SALAS}\n        columnas={[\n          { clave: 'nombre', titulo: 'Sala' },\n          {\n            clave: 'plazas',\n            titulo: 'Capacidad',\n            formatear: (n) => (n === 1 ? '1 puesto' : `${n} puestos`),\n          },\n          {\n            clave: 'precioHora',\n            titulo: 'Precio',\n            formatear: (euros) => `${euros.toFixed(2)} €/h`,\n          },\n        ]}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tabla.tsx",
      "codigo": "import type { ReactNode } from 'react'\n\nexport type Columna<T> = {\n  [K in keyof T]: {\n    clave: K\n    titulo: string\n    formatear?: (valor: T[K]) => ReactNode\n  }\n}[keyof T]\n\nfunction celda<T>(fila: T, columna: Columna<T>): ReactNode {\n  const valor = fila[columna.clave]\n  return columna.formatear ? columna.formatear(valor) : String(valor)\n}\n\ninterface TablaProps<T> {\n  filas: T[]\n  columnas: Columna<T>[]\n}\n\nexport default function Tabla<T extends { id: string }>({ filas, columnas }: TablaProps<T>) {\n  return (\n    <table>\n      <thead>\n        <tr>\n          {columnas.map((columna) => (\n            <th key={String(columna.clave)}>{columna.titulo}</th>\n          ))}\n        </tr>\n      </thead>\n      <tbody>\n        {filas.map((fila) => (\n          <tr key={fila.id}>\n            {columnas.map((columna) => (\n              <td key={String(columna.clave)}>{celda(fila, columna)}</td>\n            ))}\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Tabla.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

La pieza clave es el tipo `Columna<T>`:

```tsx
export type Columna<T> = {
  [K in keyof T]: {
    clave: K
    titulo: string
    formatear?: (valor: T[K]) => ReactNode
  }
}[keyof T]
```

Se lee de dentro afuera: para **cada** clave `K` de `T`, una columna con esa clave y una función que recibe `T[K]` (el tipo de esa propiedad, lección 39 del temario de TypeScript); y al final, `[keyof T]` junta todas las variantes en una unión. Como `clave` es el discriminante, al escribir `clave: 'plazas'` TypeScript sabe que `formatear` recibe un `number`. Es la parte más densa del módulo: no hace falta que la escribas tú de memoria, pero sí que sepas que existe y qué consigue. Lo que sí vas a escribir a menudo es la versión simple con `keyof T`.

Los errores de la consigna, tal cual salen:

```text
clave: 'nombres'
Type '"nombres"' is not assignable to type '"id" | "nombre" | "plazas" | "precioHora"'. Did you mean '"nombre"'?

formatear: (euros) => euros.toUpperCase()
Property 'toUpperCase' does not exist on type 'number'.
```

## El `.tsx` y la sintaxis `<T,>`

Hasta ahora todos los componentes genéricos eran `function Lista<T>(...)`. Si prefieres las funciones flecha, hay una trampa que solo existe en archivos `.tsx`: **`<T>(` al principio de una flecha parece la apertura de una etiqueta de JSX**. En un archivo `.ts` no pasa, porque no hay JSX; en un `.tsx`, el compilador lee `<T>` como un elemento `T` sin cerrar.

Hay tres soluciones, y las tres son TypeScript corriente:

```tsx
// 1. Una coma después de T: no es JSX válido, así que es un parámetro de tipo
const Selector = <T,>(props: SelectorProps<T>) => { ... }

// 2. Una restricción (aunque no restrinja nada)
const Selector = <T extends unknown>(props: SelectorProps<T>) => { ... }

// 3. Una declaración de función (no hay ambigüedad)
function Selector<T>(props: SelectorProps<T>) { ... }
```

Si la restricción ya existe (`<T extends { id: string }>`), no hace falta nada más. Prueba el problema con un selector genérico de botones (se usa con salas y con turnos de reserva):

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un selector genérico con una función flecha",
  "consigna": "Elige una sala y un turno: el texto de abajo combina las dos elecciones. Ahora, en Selector.tsx, quita la coma de <T,> y mira el panel: lo primero que dice es que el elemento T no tiene etiqueta de cierre, y le siguen más errores (también en App.tsx, porque Selector deja de tener export). Vuelve a ponerla, o cámbiala por <T extends unknown>, y se vacía.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\nimport Selector from './Selector'\n\ninterface Sala {\n  id: string\n  nombre: string\n  plazas: number\n}\n\ninterface Turno {\n  hora: number\n  texto: string\n}\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 4 },\n]\n\nconst TURNOS: Turno[] = [\n  { hora: 9, texto: 'Mañana (9:00)' },\n  { hora: 15, texto: 'Tarde (15:00)' },\n]\n\nexport default function App() {\n  const [sala, setSala] = useState<Sala | null>(null)\n  const [turno, setTurno] = useState<Turno | null>(null)\n\n  return (\n    <main>\n      <h1>Reservar sala</h1>\n      <Selector\n        opciones={SALAS}\n        seleccionada={sala}\n        clave={(opcion) => opcion.id}\n        etiqueta={(opcion) => opcion.nombre}\n        onSeleccionar={setSala}\n      />\n      <Selector\n        opciones={TURNOS}\n        seleccionada={turno}\n        clave={(opcion) => String(opcion.hora)}\n        etiqueta={(opcion) => opcion.texto}\n        onSeleccionar={setTurno}\n      />\n      <p>\n        {sala && turno\n          ? `${sala.nombre} (${sala.plazas} plazas), turno de ${turno.texto}`\n          : 'Elige una sala y un turno.'}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Selector.tsx",
      "codigo": "interface SelectorProps<T> {\n  opciones: T[]\n  seleccionada: T | null\n  clave: (opcion: T) => string\n  etiqueta: (opcion: T) => string\n  onSeleccionar: (opcion: T) => void\n}\n\nconst Selector = <T,>({ opciones, seleccionada, clave, etiqueta, onSeleccionar }: SelectorProps<T>) => {\n  return (\n    <div>\n      {opciones.map((opcion) => (\n        <button\n          key={clave(opcion)}\n          aria-pressed={seleccionada !== null && clave(seleccionada) === clave(opcion)}\n          onClick={() => onSeleccionar(opcion)}\n        >\n          {etiqueta(opcion)}\n        </button>\n      ))}\n    </div>\n  )\n}\n\nexport default Selector\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Selector.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Sin la coma, el panel responde con una cascada. El primer error es el importante, los demás son consecuencias:

```text
const Selector = <T>({ opciones, ... }: SelectorProps<T>) => {
JSX element 'T' has no corresponding closing tag.
Unexpected token. Did you mean `{'>'}` or `&gt;`?
```

Es decir: el compilador ha leído `<T>` como la apertura de una etiqueta `T`, y espera un `</T>` que no llega. La causa es de la sintaxis, no de tus tipos.

El `Selector` también ilustra otra cosa: **el parámetro de tipo se infiere una vez por uso**. Las dos llamadas de `App` son al mismo componente; en la primera `T` es `Sala` y en la segunda `Turno`. Cada una comprueba lo suyo, y `onSeleccionar={setSala}` encaja porque el setter acepta un `Sala`.

## Genéricos y hooks

Los componentes genéricos usan Hooks con normalidad, y el parámetro de tipo se puede usar dentro del Hook, igual que en las lecciones anteriores: `useState<T | null>(null)` guarda «un T o nada». Y los **hooks propios** (lección 43) también pueden ser genéricos. Un hook que lleva la selección de una lista de cualquier cosa con `id`:

```tsx
function useSeleccion<T extends { id: string }>(elementos: T[]) {
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null)
  const seleccionado = elementos.find((elemento) => elemento.id === seleccionadoId) ?? null
  return { seleccionado, seleccionar: setSeleccionadoId }
}
```

Con `useSeleccion(SALAS)`, `seleccionado` es un `Sala | null`; con `useSeleccion(SOCIOS)`, un `Socio | null`. Guardas el **id** (un texto, que no depende de `T`) y recuperas el objeto entero de la lista: así el estado no se queda desfasado si la lista cambia. Lo harás tú en el ejercicio 3.

## Lo que se pierde por el camino: `memo`

Un componente genérico es una función con un parámetro de tipo, y no todo lo que lo envuelve conserva ese parámetro. El caso más visible es `memo` (lección 67):

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "function Lista<T extends { id: string }>({ elementos, renderizar }: ListaProps<T>) {\n  /* ... */\n}\n\nconst ListaMemo = memo(Lista)\n\n<ListaMemo elementos={SOCIOS} renderizar={(s) => <b>{s.nombre}</b>} />\n\n// ¿Qué dice el panel de tipos?",
  "opciones": [
    "Nada: memo conserva el parámetro de tipo",
    "Property 'nombre' does not exist on type '{ id: string; }'",
    "memo no admite componentes genéricos",
    "s es de tipo any, pero no hay error"
  ],
  "correcta": 1,
  "explicacion": "memo devuelve un componente cuyo tipo ya no es genérico: T se queda en su restricción, { id: string }, y por eso s no tiene nombre. La salida es volver a dar el tipo del original: const ListaMemo = memo(Lista) as typeof Lista. Y con el compilador de React (lecciones 68 a 70), que memoriza solo, el memo manual se necesita mucho menos."
}
```

La solución es afirmar el tipo original: `const ListaMemo = memo(Lista) as typeof Lista`. Es una de las pocas aserciones (`as`) razonables, porque no cambia lo que el componente hace; solo recupera el tipo que `memo` borró.

Lo contrario sí funciona: **la `ref` como prop (lección 72) no pierde nada**. Antes de React 19, un componente genérico envuelto en `forwardRef` tenía el mismo problema que con `memo` (lo hemos comprobado: `T` se queda en su restricción); ahora basta con añadir `ref?: Ref<HTMLUListElement>` a las props genéricas, y todo sigue infiriéndose.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cuando el mismo componente sirve con dos o más tipos de dato",
      "texto": "Listas, tablas, selectores, desplegables, paginadores, cuadros de búsqueda, modales que enseñan un elemento. Todos reciben datos de un tipo que no conocen y funciones que trabajan con ese mismo tipo."
    },
    {
      "titulo": "Cuando varias props tienen que ser coherentes entre sí",
      "texto": "Una lista y la función que pinta sus elementos; las opciones y la que se ha elegido; las filas y las claves de columna. Si el tipo de una cambia, el de las otras lo sigue. Eso no se consigue con any."
    },
    {
      "titulo": "Cuando escribes un hook que sirve con cualquier dato",
      "texto": "useSeleccion, useLocalStorage, usePaginacion. El hook devuelve el mismo tipo que recibe."
    },
    {
      "titulo": "Cuando no: un componente que usas con un solo tipo",
      "texto": "Una lista de socios que solo se usará para socios no necesita <T>. Un genérico cuesta lectura: empieza con el tipo concreto y generaliza el día que aparezca el segundo uso."
    },
    {
      "titulo": "Restringe lo justo",
      "texto": "T extends { id: string } y no T extends Socio. Pide solo lo que usa el componente: así sirve a más tipos, y los errores nombran la restricción concreta."
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
      "mito": "Un componente genérico acepta cualquier cosa, como any.",
      "realidad": "Es lo contrario. any desactiva la comprobación; un genérico la mantiene, y la extiende: el tipo de una prop obliga al de las demás. Si la lista es de salas, renderizar recibe una sala y solo una sala."
    },
    {
      "mito": "Hay que escribir <Socio> cada vez que usas un componente genérico.",
      "realidad": "Casi nunca: TypeScript infiere T de las props, normalmente de la lista de datos. Solo lo escribes cuando no hay de dónde inferir, como en elementos={[]}."
    },
    {
      "mito": "T es una palabra reservada.",
      "realidad": "Es solo un nombre, por tradición una letra mayúscula. En un componente con varios parámetros de tipo, nombres como TFila o TOpcion se leen mejor. Lo único obligatorio es que no coincida con un tipo que ya uses."
    },
    {
      "mito": "En un archivo .tsx una flecha genérica se escribe igual que en .ts.",
      "realidad": "No: en .tsx, <T>(...) => ... se lee como JSX y falla. Hay que escribir <T,>, <T extends unknown> o usar una declaración function."
    }
  ]
}
```

## Errores típicos

### Olvidar la restricción y leer una propiedad de `T`

Es el primer error de todo el que escribe un genérico en React: `elemento.id`, `fila.nombre`, `opcion.etiqueta` dentro de un componente genérico sin restricción. El mensaje es siempre `Property 'id' does not exist on type 'T'.` La solución es añadir `extends { id: string }` a `T`, o una función que pida lo que necesitas (`obtenerClave`, `etiqueta`).

### Resolver el problema con `any`

```tsx
interface ListaProps {
  elementos: any[]
  renderizar: (elemento: any) => ReactNode
}
```

Compila y sirve para todo, **pero deja pasar** `socio.nomre`, `sala.plan` y un `renderizar` que espera otra cosa que los datos de `elementos`. Es el equivalente de las props con `any` de la lección 72: el panel de errores se calla justo donde más falta hace.

### Una lista vacía literal

`<Lista elementos={[]} renderizar={(s) => s.nombre} />` falla con `Property 'nombre' does not exist on type 'never'.` En código real, la lista casi siempre viene de una variable con tipo (`SALAS_LIBRES: Sala[] = []`), y el problema no aparece. Cuando necesites el literal, da el tipo a mano: `<Lista<Sala> elementos={[]} ... />`.

### Una flecha genérica sin la coma, en un `.tsx`

Es el error de la sección anterior: `JSX element 'T' has no corresponding closing tag.` Si ves ese mensaje en una línea con una `<T>` al principio de una flecha, añade la coma.

### Envolver con `memo` y perder el tipo

Lo has visto en el bloque anterior. Si de repente un componente genérico «deja de inferir bien», mira si lo envuelve algo (`memo`, un componente de orden superior): es lo primero que revisar.

## Ejercicios

Los tres ejercicios usan `exigirTiposCorrectos`: además del comportamiento, el panel de «Errores de tipos» **no puede marcar nada**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: una lista que sirve para todo",
  "consigna": "Lista solo sabe de socios, y el panel marca las listas de salas y de salas libres. Hazla genérica con T extends { id: string }, de modo que renderizar reciba el mismo T que elementos, y añade la prop opcional «vacio»: si no hay elementos, la lista pinta ese contenido dentro de un párrafo en lugar de la lista.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import Lista from './Lista'\nimport type { Sala, Socio } from './tipos'\n\nconst SOCIOS: Socio[] = [\n  { id: 's1', nombre: 'Aitor Gil', plan: 'mes' },\n  { id: 's2', nombre: 'Noa Ferrer', plan: 'anual' },\n]\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8, precioHora: 12 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 4, precioHora: 7 },\n]\n\nconst SALAS_LIBRES: Sala[] = []\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Coworking La Colmena</h1>\n      <h2>Socios</h2>\n      <Lista\n        elementos={SOCIOS}\n        renderizar={(socio) => `${socio.nombre} · plan ${socio.plan}`}\n      />\n      <h2>Salas</h2>\n      <Lista\n        elementos={SALAS}\n        renderizar={(sala) => `${sala.nombre} · ${sala.plazas} plazas`}\n      />\n      <h2>Libres ahora</h2>\n      <Lista\n        elementos={SALAS_LIBRES}\n        renderizar={(sala) => sala.nombre}\n        vacio=\"No hay salas libres ahora.\"\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Lista.tsx",
      "codigo": "import type { ReactNode } from 'react'\nimport type { Socio } from './tipos'\n\ninterface ListaProps {\n  elementos: Socio[]\n  renderizar: (elemento: Socio) => ReactNode\n}\n\n// 1. Hazla genérica: tiene que servir para cualquier tipo con un id de texto\n//    (socios, salas...), y «renderizar» debe recibir ese mismo tipo.\n// 2. Añade la prop opcional «vacio»: si no hay elementos, pinta ese contenido\n//    dentro de un <p> en lugar de la lista.\nexport default function Lista({ elementos, renderizar }: ListaProps) {\n  return (\n    <ul>\n      {elementos.map((elemento) => (\n        <li key={elemento.id}>{renderizar(elemento)}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export interface Socio {\n  id: string\n  nombre: string\n  plan: 'dia' | 'mes' | 'anual'\n}\n\nexport interface Sala {\n  id: string\n  nombre: string\n  plazas: number\n  precioHora: number\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Lista.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "La lista de socios enseña cada socio con su plan",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Aitor Gil · plan mes"
      }
    },
    {
      "descripcion": "La lista de salas enseña cada sala con sus plazas",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Sala Norte · 8 plazas"
      }
    },
    {
      "descripcion": "Una lista sin elementos enseña el mensaje de la prop vacio",
      "pasos": [],
      "espera": {
        "texto": "No hay salas libres ahora."
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: una tabla genérica con buscador",
  "consigna": "Tabla solo acepta salas, sus columnas son textos libres (el panel marca el acceso a fila[columna.clave]) y todavía no busca. Hazla genérica con T extends { id: string } y que clave sea keyof T. Añade un campo con la etiqueta «Buscar en » seguida del título (por ejemplo, «Buscar en salas») que deje solo las filas en las que alguna columna contenga el texto, sin distinguir mayúsculas.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import Tabla from './Tabla'\nimport type { Sala, Socio } from './tipos'\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8, precioHora: 12 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 4, precioHora: 7 },\n  { id: 'c', nombre: 'Sala Huerta', plazas: 12, precioHora: 18 },\n]\n\nconst SOCIOS: Socio[] = [\n  { id: 's1', nombre: 'Aitor Gil', plan: 'mes' },\n  { id: 's2', nombre: 'Noa Ferrer', plan: 'anual' },\n  { id: 's3', nombre: 'Berta Solé', plan: 'dia' },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Coworking La Colmena</h1>\n      <Tabla\n        titulo=\"salas\"\n        filas={SALAS}\n        columnas={[\n          { clave: 'nombre', titulo: 'Sala' },\n          { clave: 'plazas', titulo: 'Plazas' },\n          { clave: 'precioHora', titulo: 'Euros por hora' },\n        ]}\n      />\n      <Tabla\n        titulo=\"socios\"\n        filas={SOCIOS}\n        columnas={[\n          { clave: 'nombre', titulo: 'Nombre' },\n          { clave: 'plan', titulo: 'Plan' },\n        ]}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tabla.tsx",
      "codigo": "import type { Sala } from './tipos'\n\ninterface Columna {\n  clave: string\n  titulo: string\n}\n\ninterface TablaProps {\n  titulo: string\n  filas: Sala[]\n  columnas: Columna[]\n}\n\n// 1. Hazla genérica: T extends { id: string }, y que «clave» sea una clave de T.\n// 2. Añade un campo de búsqueda con la etiqueta «Buscar en » + titulo\n//    (por ejemplo «Buscar en salas»). Debe dejar solo las filas en las que\n//    alguna columna contenga el texto, sin distinguir mayúsculas.\nexport default function Tabla({ titulo, filas, columnas }: TablaProps) {\n  return (\n    <section aria-label={titulo}>\n      <table>\n        <thead>\n          <tr>\n            {columnas.map((columna) => (\n              <th key={columna.clave}>{columna.titulo}</th>\n            ))}\n          </tr>\n        </thead>\n        <tbody>\n          {filas.map((fila) => (\n            <tr key={fila.id}>\n              {columnas.map((columna) => (\n                <td key={columna.clave}>{String(fila[columna.clave])}</td>\n              ))}\n            </tr>\n          ))}\n        </tbody>\n      </table>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export interface Socio {\n  id: string\n  nombre: string\n  plan: 'dia' | 'mes' | 'anual'\n}\n\nexport interface Sala {\n  id: string\n  nombre: string\n  plazas: number\n  precioHora: number\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Tabla.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Escribir «norte» en la búsqueda de salas deja fuera la «Sala Sur»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en salas",
            "texto": "norte"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "row",
          "texto": "Sala Sur"
        }
      }
    },
    {
      "descripcion": "Tras buscar «norte», la «Sala Norte» sigue en la tabla",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en salas",
            "texto": "norte"
          }
        }
      ],
      "espera": {
        "rol": "row",
        "texto": "Sala Norte"
      }
    },
    {
      "descripcion": "La búsqueda de socios mira todas sus columnas, también el plan",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en socios",
            "texto": "ANUAL"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "row",
          "texto": "Aitor Gil"
        }
      }
    },
    {
      "descripcion": "Al vaciar la búsqueda vuelven todas las filas",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en salas",
            "texto": "norte"
          }
        },
        {
          "escribir": {
            "etiqueta": "Buscar en salas",
            "texto": ""
          }
        }
      ],
      "espera": {
        "rol": "row",
        "texto": "Sala Huerta"
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 3: un hook de selección genérico",
  "consigna": "useSeleccion solo funciona con salas, su estado no tiene tipo (el panel marca los errores) y falta «limpiar», que App usa en el botón «Quitar sala». Hazlo genérico con T extends { id: string }, tipa el estado (un id de texto o null) y devuelve también limpiar, que deja la selección en null.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useSeleccion } from './useSeleccion'\nimport type { Sala, Socio } from './tipos'\n\nconst SALAS: Sala[] = [\n  { id: 'a', nombre: 'Sala Norte', plazas: 8, precioHora: 12 },\n  { id: 'b', nombre: 'Sala Sur', plazas: 4, precioHora: 7 },\n]\n\nconst SOCIOS: Socio[] = [\n  { id: 's1', nombre: 'Aitor Gil', plan: 'mes' },\n  { id: 's2', nombre: 'Noa Ferrer', plan: 'anual' },\n]\n\nexport default function App() {\n  const salaElegida = useSeleccion(SALAS)\n  const socioElegido = useSeleccion(SOCIOS)\n\n  return (\n    <main>\n      <h1>Reservas de La Colmena</h1>\n      <h2>Sala</h2>\n      {SALAS.map((sala) => (\n        <button key={sala.id} onClick={() => salaElegida.seleccionar(sala.id)}>\n          Elegir {sala.nombre}\n        </button>\n      ))}\n      <button onClick={() => salaElegida.limpiar()}>Quitar sala</button>\n      <p>\n        {salaElegida.seleccionado\n          ? `Sala elegida: ${salaElegida.seleccionado.nombre} (${salaElegida.seleccionado.plazas} plazas)`\n          : 'Ninguna sala elegida.'}\n      </p>\n      <h2>Socio</h2>\n      {SOCIOS.map((socio) => (\n        <button key={socio.id} onClick={() => socioElegido.seleccionar(socio.id)}>\n          Elegir {socio.nombre}\n        </button>\n      ))}\n      <p>\n        {socioElegido.seleccionado\n          ? `Socio elegido: ${socioElegido.seleccionado.nombre}`\n          : 'Ningún socio elegido.'}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "useSeleccion.ts",
      "codigo": "import { useState } from 'react'\nimport type { Sala } from './tipos'\n\n// 1. Hazlo genérico: T extends { id: string }, para que sirva con salas y con socios.\n// 2. Tipa el estado (el id elegido, o null) y devuelve también «limpiar»,\n//    que deja la selección en null.\nexport function useSeleccion(elementos: Sala[]) {\n  const [seleccionadoId, setSeleccionadoId] = useState(null)\n  const seleccionado = elementos.find((elemento) => elemento.id === seleccionadoId) ?? null\n\n  return { seleccionado, seleccionar: setSeleccionadoId }\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export interface Socio {\n  id: string\n  nombre: string\n  plan: 'dia' | 'mes' | 'anual'\n}\n\nexport interface Sala {\n  id: string\n  nombre: string\n  plazas: number\n  precioHora: number\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nh2 {\n  margin-bottom: 0.4rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\n\nth,\ntd {\n  padding: 0.35rem 0.6rem;\n  border-bottom: 1px solid #d6d3d1;\n  text-align: left;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  margin: 0 0.4rem 0.4rem 0;\n  font: inherit;\n}\n\nbutton[aria-pressed=\"true\"] {\n  background: #1d4ed8;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 16rem;\n  margin: 0.5rem 0;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "useSeleccion.ts",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al elegir una sala, se enseña con sus plazas",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Elegir Sala Norte"
          }
        }
      ],
      "espera": {
        "texto": "Sala elegida: Sala Norte (8 plazas)"
      }
    },
    {
      "descripcion": "El mismo hook sirve para elegir un socio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Elegir Noa Ferrer"
          }
        }
      ],
      "espera": {
        "texto": "Socio elegido: Noa Ferrer"
      }
    },
    {
      "descripcion": "«Quitar sala» deja la selección en blanco",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Elegir Sala Sur"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar sala"
          }
        }
      ],
      "espera": {
        "texto": "Ninguna sala elegida."
      }
    }
  ]
}
```

### Retos para seguir practicando

1. Añade a `Lista` un parámetro de tipo con valor por defecto (lección 30 del temario de TypeScript) para que, sin `renderizar`, pinte `String(elemento.id)`. ¿Qué cambia en el tipo de `renderizar`?
2. Haz que `Tabla` ordene por una columna al pulsar su cabecera. El estado será un `keyof T | null`. Piensa cómo comparar valores de un tipo que no conoces (`String` y `localeCompare` con la opción `numeric`).
3. Escribe un `Desplegable<T>` con las props `opciones`, `valor`, `etiqueta` y `onCambiar`, y un `<select>` por dentro. ¿Cómo conviertes el texto de `e.target.value` otra vez en un `T`? (Pista: `opciones.find` con una función `clave`).
4. Añade `ref?: Ref<HTMLTableElement>` a las props de `Tabla` y comprueba, con el panel, que una ref del elemento equivocado se rechaza.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Generics",
      "descripcion": "El capítulo del Handbook sobre genéricos: funciones, tipos, restricciones y el patrón de keyof como restricción (getProperty).",
      "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Using TypeScript",
      "descripcion": "La guía de react.dev: tipos de componentes, Hooks, eventos y estilos.",
      "url": "https://react.dev/learn/typescript",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Keyof Type Operator",
      "descripcion": "El operador keyof, que da las claves de un tipo como un tipo.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/keyof-types.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Mapped Types",
      "descripcion": "Los tipos mapeados, base del tipo Columna<T> de la sección avanzada.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/mapped-types.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "JSX en TypeScript",
      "descripcion": "Cómo trata el compilador el JSX y por qué <T>(...) en un .tsx pide una coma.",
      "url": "https://www.typescriptlang.org/docs/handbook/jsx.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "React TypeScript Cheatsheet: patrones avanzados",
      "descripcion": "Hoja de referencia de la comunidad con patrones de componentes genéricos y otros casos avanzados.",
      "url": "https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase/",
      "etiqueta": "Comunidad"
    }
  ]
}
```
