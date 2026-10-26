# Tipar props y `children`

- **Módulo:** React con TypeScript
- **Slug:** `tipar-props-y-children` (autogenerado del título)
- **Orden:** 720
- **Fuentes:** [Using TypeScript](https://react.dev/learn/typescript) — ver `contenido/react/TEMARIO.md` #72

---

## Qué es y para qué sirve

En la lección 8 viste que **las props son el contrato de un componente**: qué datos necesita y cómo se llaman. En JavaScript ese contrato vive en tu cabeza (o en un comentario). Si alguien escribe `edadAnios="7"` en vez de `edadAnios={7}`, nada se queja: el componente recibe un texto donde esperaba un número y el fallo aparece, si aparece, en mitad de la pantalla.

TypeScript convierte el contrato en código. Describes **qué props acepta el componente y de qué tipo es cada una**, y el editor te avisa en el sitio donde las pasas, antes de ejecutar nada. Esta lección da por sabido el temario de TypeScript (interfaces, uniones, opcionales: lecciones 11 a 15) y se centra en lo propio de React.

Mira esta clínica veterinaria. `FichaMascota` declara que `edadAnios` es un número; `App` se lo pasa a Bruno como texto. Debajo de la vista previa tienes el panel **«Errores de tipos»**, que ejecuta el compilador de TypeScript de verdad:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Bruno cumplirá 71 años",
  "consigna": "Fíjate en dos cosas: el panel «Errores de tipos» marca la prop de Bruno, y aun así la vista previa se ejecuta, con un resultado absurdo («71 años»). Corrige el error cambiando \"7\" por {7} y comprueba que el panel se vacía y la ficha dice 8. Mira también «JavaScript generado»: los tipos han desaparecido.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import FichaMascota from './FichaMascota'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Clínica veterinaria Cuatro Patas</h1>\n      <FichaMascota nombre=\"Luna\" edadAnios={3} />\n      <FichaMascota nombre=\"Bruno\" edadAnios=\"7\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaMascota.tsx",
      "codigo": "interface FichaMascotaProps {\n  nombre: string\n  edadAnios: number\n}\n\nexport default function FichaMascota({ nombre, edadAnios }: FichaMascotaProps) {\n  return (\n    <article className=\"ficha\">\n      <h2>{nombre}</h2>\n      <p>Cumplirá {edadAnios + 1} años en su próxima revisión.</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.ficha {\n  padding: 0.5rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.ficha h2 {\n  margin: 0.25rem 0;\n  font-size: 1.1rem;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

Los dos efectos son el corazón de la lección:

- **TypeScript revisa tu código mientras lo escribes.** Con `edadAnios="7"` y `edadAnios + 1`, el resultado de JavaScript es `"71"`, porque suma un texto y un número. El compilador lo ve venir: `Type 'string' is not assignable to type 'number'.` («Es decir: el tipo `string` no se puede asignar al tipo `number`»).
- **React no lee los tipos.** Se borran antes de ejecutar (mira el JavaScript generado). Un error de tipos no para la aplicación; en un proyecto de Vite, `npm run dev` también la arranca, y quien se para es `npm run build`, porque la plantilla de TypeScript ejecuta `tsc -b` antes de empaquetar.

> **Los tipos son un contrato que se comprueba al escribir, no una protección en ejecución.**

En los bloques de esta lección, el panel «Errores de tipos» usa TypeScript 6.0.3 con los tipos de React 19.3 y las opciones estrictas que trae la plantilla de Vite (`strict`, `jsx: react-jsx`). Un detalle de la vista previa: los archivos `.css` se aplican sin importarlos. En un proyecto de Vite sí escribes `import './estilos.css'`, y la plantilla lo tiene resuelto con los tipos de `vite/client`.

## Tu primer componente tipado

Hay tres maneras de describir las props de `FichaMascota`, y las tres son TypeScript corriente:

```tsx
// 1. En línea, entre los dos puntos del parámetro
function FichaMascota({ nombre }: { nombre: string }) {}

// 2. Con una interface
interface FichaMascotaProps {
  nombre: string
}
function FichaMascota({ nombre }: FichaMascotaProps) {}

// 3. Con un alias de tipo
type FichaMascotaProps = {
  nombre: string
}
function FichaMascota({ nombre }: FichaMascotaProps) {}
```

La primera sirve con una o dos props. En cuanto hay más, **saca el tipo a una `interface` o un `type`** y llámalo como el componente más el sufijo `Props`. Entre `interface` y `type` no hay diferencia práctica para unas props (la lección 15 del temario de TypeScript explica cuándo se distinguen); elige una y mantenla en todo el proyecto. Lo único que exige React es que sea **un tipo de objeto**.

Aquí está la ficha completa, con todo lo que vamos a ver en esta sección:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { ReactNode } from 'react'\n\ninterface FichaMascotaProps {\n  /** Nombre con el que la conoce toda la clínica */\n  nombre: string\n  edadAnios: number\n  especie?: 'perro' | 'gato'\n  notas?: ReactNode\n}\n\nexport default function FichaMascota({\n  nombre,\n  edadAnios,\n  especie = 'perro',\n  notas,\n}: FichaMascotaProps) {\n  return (\n    <article className=\"ficha\">\n      <h2>{nombre}</h2>\n      <p>\n        {especie === 'perro' ? 'Perro' : 'Gato'} de {edadAnios} años\n      </p>\n      {notas && <p className=\"notas\">{notas}</p>}\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import type { ReactNode } from 'react'",
      "nota": "Los tipos de React se importan de react, con import type. La plantilla de Vite activa verbatimModuleSyntax, y entonces importar un tipo sin la palabra type es un error (el 1484 de TypeScript). Los tipos no existen en ejecución: import type deja claro qué se borra."
    },
    {
      "fragmento": "interface FichaMascotaProps {",
      "nota": "El tipo de las props, con el nombre del componente y el sufijo Props. Es un objeto: cada propiedad es una prop."
    },
    {
      "fragmento": "/** Nombre con el que la conoce toda la clínica */",
      "nota": "Un comentario de documentación (con dos asteriscos) aparece en el editor cuando alguien pasa el ratón sobre la prop, en cualquier sitio donde se use el componente. Es la documentación que viaja con el tipo."
    },
    {
      "fragmento": "edadAnios: number",
      "nota": "Una prop obligatoria: si falta en el JSX, o llega con otro tipo, el error sale en el sitio donde se usa el componente, no dentro de él."
    },
    {
      "fragmento": "especie?: 'perro' | 'gato'",
      "nota": "El signo de interrogación la hace opcional. Aquí se combina con una unión de textos literales (lección 9 del temario de TypeScript): solo vale perro o gato, y el editor lo sugiere al escribir."
    },
    {
      "fragmento": "notas?: ReactNode",
      "nota": "ReactNode es el tipo de «cualquier cosa que React sabe pintar»: texto, números, elementos, listas, null. Es el tipo para una prop que se pinta tal cual. Lo verás con calma más abajo."
    },
    {
      "fragmento": "especie = 'perro'",
      "nota": "Valor por defecto en la desestructuración, como en la lección 8. Dentro del componente, especie ya no puede ser undefined."
    },
    {
      "fragmento": "}: FichaMascotaProps) {",
      "nota": "El tipo va detrás de todo el patrón de desestructuración, no dentro de las llaves: { nombre: string } sería renombrar la variable, no tiparla."
    }
  ]
}
```

## Props opcionales y con valor por defecto

Una prop con `?` es opcional, y su tipo incluye `undefined`. Dentro del componente hay dos caminos, y el tipo que obtienes es distinto en cada uno:

- **Sin valor por defecto**: el tipo sigue siendo «lo que sea o `undefined`», y TypeScript te obliga a tratar el caso en que no llegó.
- **Con valor por defecto en la desestructuración** (`especie = 'perro'`): dentro del componente, `undefined` ya no es posible. El valor por defecto lo elimina del tipo.

Es el mismo valor por defecto de la lección 8, que sigue siendo la forma de hoy. `defaultProps` en componentes de función, que ves en código antiguo, **ya no funciona en React 19** (lección 91).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "interface FichaProps {\n  nombre: string\n  especie?: 'perro' | 'gato'\n  peso?: number\n}\n\nfunction Ficha({ nombre, especie = 'perro', peso }: FichaProps) {\n  // ¿Qué tipo tiene especie aquí?\n  // ¿Y peso?\n  return <p>{nombre}</p>\n}",
  "opciones": [
    "especie: 'perro' | 'gato' (sin undefined), y peso: number | undefined",
    "especie: 'perro' | 'gato' | undefined, y peso: number | undefined",
    "especie: 'perro' | 'gato' | undefined, y peso: number",
    "Los dos son string, porque en el JSX todo llega como texto"
  ],
  "correcta": 0,
  "explicacion": "El valor por defecto quita undefined del tipo de especie dentro del componente; peso no tiene valor por defecto y conserva number | undefined. Si escribes peso.toFixed(1), el compilador dice: 'peso' is possibly 'undefined'. Es el mismo trato que da a cualquier valor que puede faltar (lección 6 del temario de TypeScript)."
}
```

Quien **usa** el componente ve la otra cara. Para él, `especie` y `peso` se pueden omitir, pero lo que escriba tiene que encajar:

```text
<Ficha nombre="Luna" especie="conejo" />
Type '"conejo"' is not assignable to type '"perro" | "gato" | undefined'.

<Ficha />
Property 'nombre' is missing in type '{}' but required in type 'FichaProps'.
```

Es decir: `"conejo"` no es ninguno de los valores permitidos (el `| undefined` lo añade el signo `?`), y a `<Ficha />` le falta una propiedad obligatoria. Fíjate en que **el mensaje te dice la prop que falta o sobra y de qué tipo se esperaba**: aprender a leerlos es la mitad del trabajo con TypeScript.

## Props que son funciones

Las props de evento propias (`onAtender`, `onSeleccionar`, el patrón `on` + verbo de la lección 15) son funciones, y su tipo es la **firma** de la función: qué argumentos recibe y qué devuelve. Esa firma es el contrato entre el hijo, que llama a la función, y el padre, que la escribe.

```tsx
interface FilaCitaProps {
  id: string
  hora: string
  onAtender: (id: string) => void
  onAplazar?: (id: string, minutos: number) => void
}
```

Cuando el padre escribe el manejador en línea, TypeScript lo deduce solo: en `onAtender={(id) => ...}`, `id` ya es un `string`, sin que lo escribas. Cuando lo declara aparte, **tienes que acertar tú**. Este padre pasa un manejador que espera un `number` a una prop que entrega un `string`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un manejador con la firma equivocada",
  "consigna": "Pulsa «Atender a Luna»: funciona (los tipos no cambian lo que se ejecuta). El panel marca dos errores en App.tsx, los dos con la misma causa. Cambia el tipo del parámetro de atender de number a string y mira cómo se vacía el panel.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\nimport FilaCita from './FilaCita'\n\ninterface Cita {\n  id: string\n  hora: string\n  mascota: string\n}\n\nconst CITAS_INICIALES: Cita[] = [\n  { id: 'c1', hora: '10:00', mascota: 'Luna' },\n  { id: 'c2', hora: '10:20', mascota: 'Bruno' },\n  { id: 'c3', hora: '10:40', mascota: 'Nube' },\n]\n\nexport default function App() {\n  const [citas, setCitas] = useState(CITAS_INICIALES)\n\n  function atender(id: number) {\n    setCitas(citas.filter((cita) => cita.id !== id))\n  }\n\n  return (\n    <main>\n      <h1>Sala de espera</h1>\n      <ul>\n        {citas.map((cita) => (\n          <FilaCita key={cita.id} {...cita} onAtender={atender} />\n        ))}\n      </ul>\n      <p>En espera: {citas.length}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FilaCita.tsx",
      "codigo": "interface FilaCitaProps {\n  id: string\n  hora: string\n  mascota: string\n  onAtender: (id: string) => void\n}\n\nexport default function FilaCita({ id, hora, mascota, onAtender }: FilaCitaProps) {\n  return (\n    <li>\n      {hora} · {mascota}{' '}\n      <button onClick={() => onAtender(id)}>Atender a {mascota}</button>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\nbutton {\n  padding: 0.3rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

El primer error es el que importa:

```text
Type '(id: number) => void' is not assignable to type '(id: string) => void'.
  Types of parameters 'id' and 'id' are incompatible.
    Type 'string' is not assignable to type 'number'.
```

Es decir: tu función `(id: number) => void` no sirve donde se espera `(id: string) => void`, porque el hijo le va a pasar un `string`. El segundo error (`This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.`) sale de comparar `cita.id !== id`: una cadena y un número nunca son iguales. Arreglas el tipo y desaparecen los dos.

Dos reglas de las funciones de TypeScript (lección 16 del temario) que en React usarás a diario:

- **Un manejador puede ignorar parámetros.** Si la prop es `(id: string) => void` y tu función no necesita el `id`, vale `() => ...`. Al revés no: una función que exige dos argumentos no encaja donde solo se pasa uno (`Target signature provides too few arguments. Expected 2 or more, but got 1.`).
- **`void` en el retorno significa «no uso lo que devuelvas»**, no «tiene que devolver `undefined`». Por eso `onAtender={(id) => setCitas(...)}` y cualquier función con resultado encajan: React no lee ese valor.

Para una prop que manda el evento del navegador tal cual (`onClick`, `onChange`), no la escribes a mano: la trae el tipo del elemento HTML, como verás en la sección de las props de un elemento HTML. Y los tipos concretos de los eventos (`ChangeEvent`, `FormEvent`...) los tienes en la lección 73.

## Props que dependen unas de otras

A veces el componente tiene dos formas y cada una pide props distintas. Un aviso de la clínica puede ser un recordatorio de cita, que necesita la `hora`, o un aviso de urgencia, que necesita un `telefono`. Con dos props opcionales cabría `<Aviso tipo="cita" telefono="..." />`, que no tiene sentido. La solución es una **unión discriminada** de las props (lección 23 del temario de TypeScript):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "type AvisoProps =\n  | { tipo: 'cita'; hora: string }\n  | { tipo: 'urgencia'; telefono: string }\n\nfunction Aviso(props: AvisoProps) {\n  if (props.tipo === 'cita') {\n    return <p>Tienes cita a las {props.hora}</p>\n  }\n  return <p>Llama al {props.telefono}</p>\n}\n\n// <Aviso tipo=\"cita\" hora=\"10:30\" />            bien\n// <Aviso tipo=\"cita\" telefono=\"976 00 00 00\" /> error\n// <Aviso tipo=\"cita\" />                         error",
  "anotaciones": [
    {
      "fragmento": "| { tipo: 'cita'; hora: string }",
      "nota": "Cada variante es un objeto con una propiedad tipo de valor literal, la que discrimina, y las props que solo esa variante necesita."
    },
    {
      "fragmento": "if (props.tipo === 'cita') {",
      "nota": "Al comprobar tipo, TypeScript sabe qué variante tienes y deja leer hora. Hay que consultar props.tipo antes de leer el resto."
    },
    {
      "fragmento": "return <p>Llama al {props.telefono}</p>",
      "nota": "Por exclusión, en esta rama solo puede ser la variante urgencia, y telefono existe."
    },
    {
      "fragmento": "// <Aviso tipo=\"cita\" telefono=\"976 00 00 00\" /> error",
      "nota": "El error: Property 'telefono' does not exist on type 'IntrinsicAttributes & { tipo: \"cita\"; hora: string; }'. Es decir: si tipo es cita, telefono no está permitido."
    }
  ]
}
```

Hay una trampa que sorprende a quien viene de JavaScript: **no desestructures las props en la firma**. `function Aviso({ tipo, hora, telefono }: AvisoProps)` falla con `Property 'hora' does not exist on type 'AvisoProps'.`, porque al sacar las propiedades de golpe TypeScript ya no sabe de qué variante son. Recibe el objeto entero (`props`), comprueba `props.tipo` y, dentro de cada rama, lee lo que corresponda.

## `children`: `ReactNode` o `ReactElement`

`children` (lección 9) es una prop más, **pero TypeScript no la añade por su cuenta**: si tu tipo no la declara, `<Aviso>hola</Aviso>` es un error. Hay dos tipos para escribirla y se diferencian en lo que aceptan:

- **`ReactNode`**: todo lo que React sabe pintar. Texto, números, elementos, listas de cosas, `null`, `undefined`, booleanos y fragmentos. Es el que debes usar casi siempre.
- **`ReactElement`**: solo un elemento de JSX (`<b>…</b>`, `<Ficha />`). Ni texto, ni números, ni `null`.

Los dos se importan de `react`. Prueba tu intuición:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "import type { ReactElement, ReactNode } from 'react'\n\nfunction Aviso({ children }: { children: ReactNode }) {\n  return <p>{children}</p>\n}\n\nfunction Destacado({ children }: { children: ReactElement }) {\n  return <strong>{children}</strong>\n}\n\n// ¿Cuáles de estas líneas dan error de tipos?\n<Aviso>Cerrado por vacaciones</Aviso>               // 1\n<Aviso>{null}</Aviso>                               // 2\n<Destacado>Cerrado por vacaciones</Destacado>       // 3\n<Destacado><b>Cerrado</b></Destacado>               // 4\n<Destacado><b>Cerrado</b><i>hoy</i></Destacado>     // 5",
  "opciones": [
    "Solo la 3",
    "La 3 y la 5",
    "La 2, la 3 y la 5",
    "Ninguna: ReactNode y ReactElement aceptan lo mismo"
  ],
  "correcta": 1,
  "explicacion": "La 3 falla porque el texto no es un elemento: 'Destacado' components don't accept text as child elements. La 5, porque ReactElement es un solo elemento y ahí hay dos hijos: expects a single child of type 'ReactElement<...>', but multiple children were provided. La 2 es válida: ReactNode incluye null (con ReactElement sí daría error, Type 'null' is not assignable)."
}
```

Dos cosas más sobre `children`:

- **Obligatoria u opcional.** `children: ReactNode` obliga a pasar algo: `<Aviso />` falla con `Property 'children' is missing in type '{}' but required in type '{ children: ReactNode; }'.` Si el componente funciona vacío, escribe `children?: ReactNode`.
- **No se puede pedir «solo `<li>`».** TypeScript no distingue qué *tipo de elemento* de JSX pasas: un `<li>` y un `<div>` son igual de `ReactElement`. Lo que sí controla es la forma: texto, un elemento o varios.

En código ajeno verás también `PropsWithChildren<Props>`, que es la forma corta de añadir `children?: ReactNode` a unas props, y `React.FC<Props>`, que tipa la función entera. Funcionan, pero no hacen falta: tipar el parámetro de props, como hace react.dev, lo cubre todo.

## Las props de un elemento HTML

Un `Boton` de tu proyecto casi siempre es un `<button>` con el estilo de la casa. Si solo declaras `children`, ya no puede recibir `type`, `disabled`, `onClick` ni `aria-label`, y acabas añadiéndolas una a una. React te da el tipo de **todas las props de un elemento HTML**: `ComponentProps<'button'>`. Lo extiendes con las tuyas y repartes el resto con `...resto` (lección 8):

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un botón con todo lo de un botón",
  "consigna": "Prueba esto en App.tsx y mira el panel: cambia variante=\"peligro\" por variante=\"urgente\" (error: no es una variante); añade title=\"Pulsa para avisar\" al primer botón (válido: lo trae ComponentProps); añade colorFondo=\"rojo\" (error: el botón no tiene esa prop).",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\nimport Boton from './Boton'\n\nexport default function App() {\n  const [avisos, setAvisos] = useState(0)\n\n  return (\n    <main>\n      <h1>Recepción</h1>\n      <Boton onClick={() => setAvisos(avisos + 1)}>Avisar al veterinario</Boton>\n      <Boton\n        variante=\"peligro\"\n        type=\"button\"\n        disabled={avisos === 0}\n        onClick={() => setAvisos(0)}\n      >\n        Cancelar los avisos\n      </Boton>\n      <p>Avisos enviados: {avisos}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Boton.tsx",
      "codigo": "import type { ComponentProps } from 'react'\n\ninterface BotonProps extends ComponentProps<'button'> {\n  variante?: 'primario' | 'peligro'\n}\n\nexport default function Boton({ variante = 'primario', ...resto }: BotonProps) {\n  return <button className={`boton ${variante}`} {...resto} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.boton {\n  padding: 0.4rem 0.8rem;\n  margin-right: 0.5rem;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  font: inherit;\n  cursor: pointer;\n}\n\n.primario {\n  background: #1d4ed8;\n  color: white;\n}\n\n.peligro {\n  background: #b91c1c;\n  color: white;\n}\n\n.boton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

`Boton` declara una sola prop propia, `variante`, y hereda el resto. `children` viaja dentro de `resto`, junto a `type`, `disabled` y `onClick`, y llega al `<button>` por el reparto `{...resto}`.

Hay dos variantes del mismo tipo:

- **`ComponentProps<'button'>`**: todas las props, **incluida `ref`**. En React 19 `ref` es una prop más (lo verás en la sección siguiente), así que con el reparto `{...resto}` la ref que reciba tu `Boton` llega al `<button>` sin hacer nada más.
- **`ComponentPropsWithoutRef<'button'>`**: lo mismo sin `ref`. Es la elección cuando tu componente **no** quiere aceptar una ref. Si el padre intenta pasarla, el error es `Property 'ref' does not exist on type ...`.

También sirve con tus propios componentes: `ComponentProps<typeof Boton>` te da sus props, útil cuando necesitas pasarlas sin repetir el tipo.

### Pisar una prop nativa: `Omit`

Si tu campo de texto quiere un `onCambiar` que reciba el texto, en vez del `onChange` nativo que recibe el evento, no puedes extender y redefinir la misma prop con otro tipo:

```text
interface CampoProps extends ComponentProps<'input'> { onChange: (v: string) => void }
Interface 'CampoProps' incorrectly extends interface 'ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>'.
  ...
  Type 'ChangeEvent<HTMLInputElement, HTMLInputElement>' is not assignable to type 'string'.
```

Es decir: `onChange` ya existe en el `<input>` con otro tipo, y el tuyo es incompatible. La salida es **quitar primero lo que vas a sustituir** con `Omit` (lección 41 del temario de TypeScript):

```tsx
type CampoProps = Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
  valor: string
  onCambiar: (valor: string) => void
}

function Campo({ valor, onCambiar, ...resto }: CampoProps) {
  return <input {...resto} value={valor} onChange={(e) => onCambiar(e.target.value)} />
}
```

El campo conserva `placeholder`, `required`, `name`... y cambia solo lo que quieres. Aquí hemos usado `type` con `&`; también puedes escribir `interface CampoProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange'> { ... }`.

## `ref` es una prop más (React 19)

En la lección 34 viste que, desde React 19, un componente de función recibe `ref` como cualquier otra prop, y que ya no hace falta `forwardRef`. En TypeScript, **la declaras tú en tus props**, y el tipo de una ref que se pasa a un elemento es `Ref<T>`, con `T` el tipo del elemento del DOM:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useRef, type Ref } from 'react'\n\ninterface CampoBusquedaProps {\n  etiqueta: string\n  ref?: Ref<HTMLInputElement>\n}\n\nfunction CampoBusqueda({ etiqueta, ref }: CampoBusquedaProps) {\n  return (\n    <label>\n      {etiqueta}\n      <input type=\"search\" ref={ref} />\n    </label>\n  )\n}\n\nexport default function Recepcion() {\n  const buscadorRef = useRef<HTMLInputElement>(null)\n\n  return (\n    <>\n      <button onClick={() => buscadorRef.current?.focus()}>Buscar paciente</button>\n      <CampoBusqueda etiqueta=\"Paciente\" ref={buscadorRef} />\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "ref?: Ref<HTMLInputElement>",
      "nota": "Ref<T> es el tipo de «lo que puede ir en el atributo ref de un elemento»: una ref creada con useRef, una función (ref de callback, lección 34) o null. HTMLInputElement es el tipo del nodo del DOM que va a contener. Es opcional para que el componente se pueda usar sin ref."
    },
    {
      "fragmento": "<input type=\"search\" ref={ref} />",
      "nota": "El componente decide a qué nodo se la pasa. Sin esta línea, la ref del padre se queda en null y nada avisa."
    },
    {
      "fragmento": "useRef<HTMLInputElement>(null)",
      "nota": "En el padre, el tipo del elemento va como argumento de tipo y el valor inicial es null: todavía no hay nodo. TypeScript exige el argumento: useRef() sin nada da Expected 1 arguments, but got 0. Verás useRef con calma en la lección 73."
    },
    {
      "fragmento": "buscadorRef.current?.focus()",
      "nota": "current vale null hasta que React monta el input, y TypeScript lo sabe: sin el signo ? (o una comprobación), el error es 'buscadorRef.current' is possibly 'null'."
    }
  ]
}
```

Si el tipo del elemento no encaja, el error lo dice con todas las letras. Una ref pensada para un `<div>` no puede ir a un campo que espera un `<input>`:

```text
const cajaRef = useRef<HTMLDivElement>(null)
<CampoBusqueda etiqueta="Paciente" ref={cajaRef} />

Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'Ref<HTMLInputElement> | undefined'.
  ...
      Type 'HTMLDivElement' is missing the following properties from type 'HTMLInputElement': accept, alt, autocomplete, capture, and 54 more.
```

Es decir: el `div` no tiene las propiedades de un `input`. La solución casi siempre es el argumento de tipo de `useRef`: tiene que coincidir con el elemento al que va la ref.

Dos atajos útiles. Si tu componente ya extiende `ComponentProps<'input'>`, **no declares la ref**: ya viene en ese tipo. Y si ves en código antiguo `forwardRef<HTMLInputElement, Props>(…)`, es la misma idea con otro cableado: el primer argumento de tipo es el elemento de la ref, el segundo las props (lección 91).

## Cuándo lo usarías de verdad

Cinco costumbres que se repiten en cualquier proyecto de React con TypeScript:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un tipo de props por componente, junto al componente",
      "texto": "Con el nombre del componente y el sufijo Props. No hace falta exportarlo salvo que otro archivo lo necesite. Si lo necesita, ComponentProps<typeof Ficha> lo saca del propio componente sin exportar nada."
    },
    {
      "titulo": "ReactNode para lo que se pinta, tipos concretos para lo demás",
      "texto": "children, un icono, un título que puede ser texto o un elemento: ReactNode. Una prop que es una cadena, un número o una opción de una lista cerrada: el tipo más estrecho (uniones literales), para que el editor sugiera y el compilador proteja. Para un style que viene de fuera, CSSProperties: el compilador rechaza propiedades de CSS que no existen."
    },
    {
      "titulo": "Los componentes envoltorio extienden ComponentProps",
      "texto": "Botones, campos, enlaces, tarjetas con atributos: ComponentProps de la etiqueta que envuelven, más tus props, y ...resto al elemento. Así el componente no se queda corto cuando alguien necesita un aria-label, un data-testid o un onKeyDown."
    },
    {
      "titulo": "Opcional o por defecto, no los dos a la vez sin pensar",
      "texto": "Una prop con valor por defecto casi siempre se declara opcional. Una opcional sin valor por defecto obliga a comprobar undefined dentro. Elige cuál de las dos situaciones quieres."
    },
    {
      "titulo": "Cuando dos props no pueden ir juntas, una unión discriminada",
      "texto": "Mejor que dos opcionales y un comentario que dice «usa una u otra». El compilador impide la combinación absurda."
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
      "mito": "Si el panel de tipos no marca nada, el componente recibe datos correctos.",
      "realidad": "Los tipos son una promesa que haces tú y que se borra antes de ejecutar. Lo que llega de un fetch, de un formulario o de localStorage es lo que sea, aunque tu código diga que es un Mascota. Para datos de fuera hay que validar en ejecución (lección 61 de este temario y lección 54 del de TypeScript, con Zod)."
    },
    {
      "mito": "Un error de tipos impide que React funcione.",
      "realidad": "React no sabe que existen los tipos. La vista previa de esta página se ejecuta con el panel lleno de errores, y en Vite el servidor de desarrollo también. Quien se para ante un error de tipos es el comando de construcción."
    },
    {
      "mito": "Para tipar un componente hay que escribir React.FC<Props>.",
      "realidad": "No: basta con tipar el parámetro de props, como hace react.dev. FC también existe, pero no aporta nada que necesites a un componente de función."
    },
    {
      "mito": "children ya viene incluido en las props.",
      "realidad": "TypeScript no lo añade. Si tu tipo no declara children, pasarle contenido al componente es un error de tipos."
    }
  ]
}
```

## Errores típicos

### Tipar las props con `any`

Es la salida fácil cuando un error de tipos molesta: `function FichaMascota(props: any)`. El editor se calla, pero **has apagado la comprobación justo donde más falta hace**. Compara con el primer ejemplo: la misma `FichaMascota`, con `props: any`, y a Bruno se le pasa la edad como texto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con any, el panel se calla",
  "consigna": "El panel de errores está vacío y Bruno tiene otra vez 71 años. Prueba ahora a cambiar nombre=\"Luna\" por nombre={42} en App.tsx: ningún error de tipos, pero la vista previa se rompe al ejecutar (nombre.toUpperCase no es una función). Después tipa las props con una interface y mira cómo el panel recupera los dos errores.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import FichaMascota from './FichaMascota'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Clínica veterinaria Cuatro Patas</h1>\n      <FichaMascota nombre=\"Luna\" edadAnios={3} />\n      <FichaMascota nombre=\"Bruno\" edadAnios=\"7\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaMascota.tsx",
      "codigo": "export default function FichaMascota(props: any) {\n  return (\n    <article className=\"ficha\">\n      <h2>{props.nombre.toUpperCase()}</h2>\n      <p>Cumplirá {props.edadAnios + 1} años en su próxima revisión.</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.ficha {\n  padding: 0.5rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.ficha h2 {\n  margin: 0.25rem 0;\n  font-size: 1.1rem;\n}\n"
    }
  ],
  "archivoInicial": "FichaMascota.tsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Si no sabes todavía cómo es un valor, el tipo honesto es `unknown` (lección 8 del temario de TypeScript): te obliga a comprobarlo antes de usarlo, en vez de desactivar la comprobación como hace `any`.

### Usar `JSX.Element` como tipo de `children`

Lo verás en tutoriales antiguos: `children: JSX.Element`. Con los tipos de React 19 da error:

```text
Cannot find namespace 'JSX'.
```

Es decir: el espacio de nombres global `JSX` ya no existe. Usa `ReactNode` (lo normal), `ReactElement` (un solo elemento) o, si de verdad quieres el viejo, `React.JSX.Element`.

### Olvidar que una prop opcional puede faltar

```tsx
function Ficha({ peso }: { peso?: number }) {
  return <p>{peso.toFixed(1)} kg</p>
}
```

El compilador avisa: `'peso' is possibly 'undefined'.` La salida no es un `!` ni un `as number` que lo calle y rompa en ejecución, sino tratar el caso: un valor por defecto (`peso = 0`, si tiene sentido) o una comprobación (`peso !== undefined && ...`, o `peso?.toFixed(1)`).

### Callar el error con `as` en vez de arreglarlo

`edadAnios={'7' as unknown as number}` hace desaparecer el error y deja el `"71"` de la primera vista previa. Una aserción de tipos (lección 10 del temario de TypeScript) le dice al compilador «confía en mí», y casi siempre el que se equivoca eres tú. Si el compilador protesta, suele tener razón: cambia el dato, no el tipo.

### Tipar la ref con otro elemento

`useRef<HTMLDivElement>(null)` pasada a un componente que espera `Ref<HTMLInputElement>` es el error de las líneas de arriba. Si dudas de qué tipo es un elemento, pasa el ratón sobre la etiqueta en tu editor: `<input>` es `HTMLInputElement`, `<button>` es `HTMLButtonElement`, `<div>` es `HTMLDivElement`. Las etiquetas sin tipo propio (`<section>`, `<article>`, `<header>`) son `HTMLElement`.

## Ejercicios

Los tres ejercicios usan `exigirTiposCorrectos`: además de que la aplicación se comporte bien, el botón «Comprobar» exige que el panel «Errores de tipos» **no marque nada**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: la tarjeta del paciente",
  "consigna": "TarjetaPaciente no tiene tipos (el panel marca todo) y tampoco enseña la insignia «Urgente» ni las notas. Declara una interface con nombre y motivo obligatorios, urgente opcional (false por defecto) y children opcional de tipo ReactNode, y haz que la tarjeta pinte la insignia y las notas. Sin usar any.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import TarjetaPaciente from './TarjetaPaciente'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Pacientes de hoy</h1>\n      <TarjetaPaciente nombre=\"Luna\" motivo=\"Vacuna anual\" />\n      <TarjetaPaciente nombre=\"Bruno\" motivo=\"Cojera en la pata trasera\" urgente>\n        Alergia a la penicilina. Avisar al doctor Ibáñez.\n      </TarjetaPaciente>\n      <TarjetaPaciente nombre=\"Nube\" motivo=\"Revisión dental\">\n        Traer en ayunas.\n      </TarjetaPaciente>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaPaciente.tsx",
      "codigo": "// 1. Tipa las props: «nombre» y «motivo» siempre; «urgente» es opcional\n//    y «children» son las notas, que también son opcionales.\n// 2. Haz que la tarjeta enseñe la insignia «Urgente» y las notas.\nexport default function TarjetaPaciente({ nombre, motivo, urgente, children }) {\n  return (\n    <article className=\"tarjeta\">\n      <h2>{nombre}</h2>\n      <p>{motivo}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.tarjeta {\n  padding: 0.25rem 1rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tarjeta h2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.tarjeta p {\n  margin: 0.25rem 0;\n}\n\n.urgente {\n  display: inline-block;\n  padding: 0.1rem 0.5rem;\n  border-radius: 999px;\n  background: #fee2e2;\n  color: #991b1b;\n  font-size: 0.85rem;\n  font-weight: bold;\n}\n\n.notas {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "TarjetaPaciente.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "La tarjeta de un paciente urgente enseña la insignia «Urgente»",
      "pasos": [],
      "espera": {
        "texto": "Urgente"
      }
    },
    {
      "descripcion": "Las notas que se pasan como children aparecen en la tarjeta",
      "pasos": [],
      "espera": {
        "texto": "Traer en ayunas."
      }
    },
    {
      "descripcion": "Los motivos de consulta siguen apareciendo",
      "pasos": [],
      "espera": {
        "texto": "Vacuna anual"
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: un botón que acepta lo de un botón",
  "consigna": "Boton solo acepta children, así que App no compila en el panel (type, disabled, onClick, variante) y el botón «Vaciar» no hace nada. Haz que Boton acepte todas las props de un button de HTML y una variante opcional (primario por defecto, o peligro), y que reparta el resto sobre el button. Sin usar any.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState } from 'react'\nimport Boton from './Boton'\n\nexport default function App() {\n  const [dueno, setDueno] = useState('')\n  const [reservada, setReservada] = useState('')\n\n  return (\n    <main>\n      <h1>Reservar cita</h1>\n      <form\n        onSubmit={(e) => {\n          e.preventDefault()\n          setReservada(dueno)\n        }}\n      >\n        <label>\n          Nombre del dueño\n          <input value={dueno} onChange={(e) => setDueno(e.target.value)} />\n        </label>\n        <Boton type=\"submit\" disabled={dueno === ''}>\n          Reservar\n        </Boton>\n        <Boton\n          variante=\"peligro\"\n          type=\"button\"\n          onClick={() => {\n            setDueno('')\n            setReservada('')\n          }}\n        >\n          Vaciar\n        </Boton>\n      </form>\n      {reservada && <p role=\"status\">Cita reservada para {reservada}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Boton.tsx",
      "codigo": "// Ahora el botón solo acepta «children». Haz que acepte también todas las\n// props de un <button> de HTML (type, disabled, onClick...) y una prop\n// opcional «variante»: 'primario' (por defecto) o 'peligro'. Sin usar any.\nimport type { ReactNode } from 'react'\n\ninterface BotonProps {\n  children: ReactNode\n}\n\nexport default function Boton({ children }: BotonProps) {\n  return <button className=\"boton\">{children}</button>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.boton {\n  padding: 0.4rem 0.8rem;\n  margin-right: 0.5rem;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  font: inherit;\n  cursor: pointer;\n}\n\n.primario {\n  background: #1d4ed8;\n  color: white;\n}\n\n.peligro {\n  background: #b91c1c;\n  color: white;\n}\n\n.boton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Boton.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al escribir un nombre y pulsar «Reservar», sale la confirmación con ese nombre",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del dueño",
            "texto": "Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        }
      ],
      "espera": {
        "texto": "Cita reservada para Marta"
      }
    },
    {
      "descripcion": "«Vaciar» borra el campo y la confirmación, sin reservar de nuevo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del dueño",
            "texto": "Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vaciar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Cita reservada para Marta"
        }
      }
    },
    {
      "descripcion": "Después de «Vaciar», el campo del dueño queda vacío",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre del dueño",
            "texto": "Marta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vaciar"
          }
        }
      ],
      "espera": {
        "etiqueta": "Nombre del dueño",
        "valor": ""
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 3: la ref como prop",
  "consigna": "El botón «Buscar paciente» debería llevar el cursor al campo, pero CampoBusqueda no recibe la ref: el panel marca el error y el cursor no se mueve. Añade ref a las props de CampoBusqueda con el tipo Ref<HTMLInputElement> (opcional) y pásasela al input.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useRef } from 'react'\nimport CampoBusqueda from './CampoBusqueda'\n\nexport default function App() {\n  const buscadorRef = useRef<HTMLInputElement>(null)\n\n  return (\n    <main>\n      <h1>Recepción</h1>\n      <button onClick={() => buscadorRef.current?.focus()}>Buscar paciente</button>\n      <CampoBusqueda etiqueta=\"Paciente\" ref={buscadorRef} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "CampoBusqueda.tsx",
      "codigo": "// El padre quiere llevar el cursor a este campo, pero el componente todavía\n// no recibe la ref. Añádela a las props, con su tipo, y pásasela al input.\ninterface CampoBusquedaProps {\n  etiqueta: string\n}\n\nexport default function CampoBusqueda({ etiqueta }: CampoBusquedaProps) {\n  return (\n    <label className=\"campo\">\n      {etiqueta}\n      <input type=\"search\" />\n    </label>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin-bottom: 0.75rem;\n  font: inherit;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 20rem;\n}\n\ninput {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "CampoBusqueda.tsx",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Buscar paciente», el cursor va al campo y se puede escribir en él",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar paciente"
          }
        },
        {
          "teclear": "Luna"
        }
      ],
      "espera": {
        "etiqueta": "Paciente",
        "valor": "Luna"
      }
    }
  ]
}
```

### Retos para seguir practicando

1. Añade a `TarjetaPaciente` una prop `onAtender: (nombre: string) => void` y un botón «Atender». Haz que `App` guarde en el estado a quién se ha atendido. Prueba a pasarle un manejador con otra firma y lee el mensaje del panel.
2. Convierte las props de `TarjetaPaciente` en una unión discriminada: una variante `'consulta'` con `motivo`, y otra `'vacuna'` con `vacuna` y `proximaDosis`. Comprueba que no se pueden mezclar.
3. Escribe un `Campo` que acepte `ComponentProps<'input'>` pero cambie `onChange` por `onCambiar: (valor: string) => void`, con `Omit`. Úsalo en el formulario del ejercicio 2.
4. Escribe un `Panel` con una prop `titulo: ReactNode` y `children: ReactNode`. Pásale como título un texto y, en otro uso, un elemento con un icono. ¿Qué cambiaría si `titulo` fuera `string`? Comprueba tu respuesta en el panel.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Using TypeScript",
      "descripcion": "La guía de react.dev: instalación, componentes tipados, los tipos de los Hooks y los tipos de eventos y estilos.",
      "url": "https://react.dev/learn/typescript",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "TypeScript: Object Types",
      "descripcion": "El capítulo del Handbook sobre tipos de objeto, propiedades opcionales y extender con interface.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/objects.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "TypeScript: Everyday Types",
      "descripcion": "Uniones, tipos literales y alias, las piezas con las que se tipan casi todas las props.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "React TypeScript Cheatsheet",
      "descripcion": "Hoja de referencia mantenida por la comunidad, con muchos casos de props, children y ComponentProps.",
      "url": "https://react-typescript-cheatsheet.netlify.app/",
      "etiqueta": "Comunidad"
    },
    {
      "titulo": "@types/react en DefinitelyTyped",
      "descripcion": "El código fuente de los tipos de React: ahí viven ReactNode, ReactElement, Ref y ComponentProps.",
      "url": "https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts",
      "etiqueta": "GitHub"
    }
  ]
}
```
