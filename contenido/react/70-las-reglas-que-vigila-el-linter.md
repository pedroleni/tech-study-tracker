# Las reglas que vigila el linter

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `las-reglas-que-vigila-el-linter` (autogenerado del título)
- **Orden:** 700
- **Fuentes:** [Lints](https://react.dev/reference/eslint-plugin-react-hooks) + [purity](https://react.dev/reference/eslint-plugin-react-hooks/lints/purity) + [refs](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs) + [immutability](https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability) + [static-components](https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components) — ver `contenido/react/TEMARIO.md` #70

---

## Qué es y para qué sirve

Ya conoces varias reglas del linter de React, cada una en su lección: `rules-of-hooks` (44), `exhaustive-deps` (40 y 42), `set-state-in-effect` (39) y `error-boundaries` (53), y de pasada `refs` (33). Todas salen del mismo sitio: **`eslint-plugin-react-hooks`**, el plugin de ESLint que mantiene el equipo de React. Lee tu código sin ejecutarlo y señala lo que rompe las reglas de React antes de que llegue al navegador.

Hace falta porque muchos de esos fallos no avisan solos. Un `Math.random()` en el render o un objeto del estado modificado a mano no lanzan ningún error: hacen que la pantalla diga algo raro *a veces*. `StrictMode` (lección 63) destapa algunos al ejecutar, si pasas por el camino que falla. El linter revisa todo el código de una vez, en el editor, sin abrir la app.

En la versión 5.2 (febrero de 2025), el plugin tenía exactamente dos reglas: `rules-of-hooks` y `exhaustive-deps`. A lo largo de 2025 fue incorporando las comprobaciones del React Compiler, y **desde la 7.0, publicada el 8 de octubre de 2025, un día después del compilador 1.0, vienen activadas en su configuración recomendada**: pureza, refs, mutaciones, componentes declarados dentro de otros... La versión de hoy es la 7.1.1. En esta lección verás qué vigila cada regla, de dónde salen, qué **no** ven, cuándo (casi nunca) silenciarlas y cómo tenerlas en tu proyecto.

### El panel «Linter»

Los bloques de esta lección tienen un panel nuevo debajo del editor: «Linter». Ejecuta en tu navegador ese mismo plugin, `eslint-plugin-react-hooks` 7.1.1 con su configuración `recommended-latest`, y vuelve a pasar cada vez que dejas de escribir. Por cada archivo enseña:

- la **línea y la columna**, la **regla** y la primera línea del mensaje, en inglés y tal como lo escribe el plugin;
- los errores en rojo y los avisos en ámbar;
- «Ver mensaje completo», que despliega la explicación entera y el trozo de código señalado;
- y, si no hay nada, «El linter no marca nada».

En los ejercicios, «Comprobar» añade una comprobación, la primera de todas: «El linter no marca nada». Para superarla hay que arreglar el código, no esconderlo.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "App.tsx dentro de un App.jsx",
  "contenido": "Al desplegar el mensaje completo verás algo como App.tsx:16:40 aunque tu archivo se llame App.jsx. El panel analiza cada archivo como si fuera TSX, que es lo que le permite funcionar dentro del navegador. La línea y la columna son las de tu archivo, y el mensaje es el mismo que da ESLint en tu ordenador: lo comprobamos regla a regla con ESLint 10.13.0 y el mismo plugin."
}
```

## Las 17 reglas de `recommended-latest`

`recommended-latest` activa 17 reglas. Esta es la lista sacada del plugin instalado (7.1.1), agrupada por lo que vigila cada una. Las marcadas como *aviso* salen en ámbar; el resto son errores.

**Las de siempre**

- `rules-of-hooks`: los Hooks, en el nivel superior y solo dentro de componentes o Hooks (lección 44).
- `exhaustive-deps` (*aviso*): la lista de dependencias de `useEffect`, `useMemo` y `useCallback` (lecciones 40 y 42).

**Que el render sea puro** (lección 12)

- `purity`: nada de funciones que devuelven algo distinto en cada llamada, como `Math.random()`.
- `refs`: no leer ni escribir `ref.current` mientras se renderiza.
- `globals`: no reasignar variables de fuera del componente.
- `immutability`: no modificar props, estado ni nada que React da por inmutable.
- `set-state-in-render`: no llamar a un `set` suelto en el cuerpo del componente.

**Efectos**

- `set-state-in-effect`: no llamar a un `set` nada más empezar un efecto (lección 39).

**Componentes y memorización**

- `static-components`: no declarar un componente dentro de otro.
- `use-memo` y `void-use-memo`: `useMemo` bien usado, y siempre con un valor que devolver.
- `preserve-manual-memoization`: que el compilador pueda respetar tus `useMemo` y `useCallback`.

**Errores, librerías, sintaxis y configuración**

- `error-boundaries`: nada de `try`/`catch` alrededor de JSX (lección 53).
- `incompatible-library` (*aviso*): APIs de librerías que no se pueden memorizar.
- `unsupported-syntax` (*aviso*): sintaxis que el compilador no sabe analizar, como `eval`.
- `config` y `gating`: errores de configuración del propio React Compiler.

**`recommended` o `recommended-latest`.** El plugin trae las dos configuraciones, y hoy se diferencian en una sola regla: `recommended-latest` añade `void-use-memo`. El README del plugin lo explica así: si quieres probar las reglas experimentales más nuevas del compilador, usa `recommended-latest`. La plantilla de Vite con ESLint usa `recommended`; al final de la lección verás cómo cambiarla.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "La lista de react.dev va un paso por detrás",
  "contenido": "La página de react.dev con las reglas del plugin incluye component-hook-factories, que el propio plugin describe como retirada desde la versión 7.1.0, y no nombra void-use-memo, que tampoco tiene página propia: la dirección que da el plugin para ella devuelve un 404. La lista de arriba es la que activa de verdad la versión 7.1.1."
}
```

## De dónde salen: el React Compiler

El React Compiler (lecciones 68 y 69) reescribe tus componentes para memorizarlos sin que escribas `useMemo`. Para hacerlo sin romper nada necesita que el código cumpla las reglas de React, así que analiza cómo fluyen los datos por cada componente y qué se modifica en él. **Las reglas nuevas del plugin son ese mismo análisis**: el linter pasa el analizador del compilador por cada componente y te enseña lo que encuentra. No hace falta tener el compilador instalado; el anuncio de la versión 1.0 lo dice expresamente.

Cuando el compilador encuentra uno de esos problemas mientras construye tu app, no se queja ni la rompe: **se salta ese componente**, lo deja tal como lo escribiste, sin optimizar, y sigue con el resto. Por eso algunos mensajes empiezan por «Compilation Skipped».

Lo comprobamos con `babel-plugin-react-compiler` 1.0.0 y los ejemplos de esta lección. Un componente que lee una ref al renderizar, reasigna una variable global, modifica el estado a mano o llama a un `set` suelto en su cuerpo se queda sin compilar. Otras comprobaciones, en cambio, solo las hace el linter: con un `Math.random()` en el render, un `set` al empezar un efecto o un componente declarado dentro de otro, el compilador compila igual. Que compile no quiere decir que funcione, como vas a ver enseguida con la cesta de Navidad.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres redes distintas",
  "roles": [
    {
      "etiqueta": "El linter",
      "rol": "Antes de ejecutar nada",
      "descripcion": "Lee el código en tu editor y marca los patrones que reconoce. Revisa todo a la vez, pero solo encuentra lo que sabe reconocer."
    },
    {
      "etiqueta": "StrictMode",
      "rol": "Al ejecutar, en desarrollo",
      "descripcion": "Repite renders y efectos para que un fallo se note (lección 63). Solo destapa lo que llegas a ejecutar."
    },
    {
      "etiqueta": "React Compiler",
      "rol": "Al construir la app",
      "descripcion": "Memoriza lo que puede y se salta en silencio lo que rompe las reglas (lección 68). Un componente saltado funciona igual que antes, sin optimizar."
    }
  ]
}
```

## `purity`: ni azar ni reloj al renderizar

Un componente puro devuelve lo mismo con las mismas props y el mismo estado (lección 12). `Math.random()` y `Date.now()` devuelven otra cosa en cada llamada, así que un componente que las llama mientras se renderiza **cambia de resultado cada vez que React lo vuelve a llamar**, por el motivo que sea.

La asociación de comerciantes de la calle Real sortea su cesta de Navidad entre los comercios socios. La página anuncia quién gana y deja escribir una felicitación:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un sorteo que se repite con cada letra",
  "consigna": "Escribe en el mensaje: con cada letra cambia quién gana la cesta. Mira el panel «Linter»: marca Math.random en la línea del sorteo. Arréglalo: que no haya ganador hasta pulsar un botón «Sortear», y que el sorteo se haga en su manejador. Mientras no se haya sorteado, el anuncio dice «Todavía no se ha sorteado». Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst COMERCIOS = [\n  'Ferretería Lacasa',\n  'Mercería Pilar',\n  'Bar La Parra',\n  'Óptica Vidal',\n  'Panadería Lafuente',\n  'Zapatería Gil',\n]\n\nexport default function Cesta() {\n  const [mensaje, setMensaje] = useState('')\n  // El sorteo se hace aquí, cada vez que el componente se renderiza\n  const ganador = COMERCIOS[Math.floor(Math.random() * COMERCIOS.length)]\n\n  return (\n    <main>\n      <h1>Cesta de Navidad de la calle Real</h1>\n      <p role=\"status\">Gana la cesta: {ganador}</p>\n      <label>\n        Mensaje para quien gane\n        <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} />\n      </label>\n      <p className=\"tarjeta\">{mensaje || 'Escribe la felicitación…'}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #9f1239;\n}\n\n[role='status'] {\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.3rem;\n}\n\ntextarea {\n  font: inherit;\n  min-height: 3rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.8rem;\n}\n\n.tarjeta {\n  padding: 0.6rem 0.8rem;\n  border: 1px dashed #be123c;\n  border-radius: 8px;\n  background: #fff1f2;\n  color: #1c1917;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true,
  "exigirLintLimpio": true,
  "comprobaciones": [
    {
      "descripcion": "Antes de sortear, el anuncio dice «Todavía no se ha sorteado»",
      "pasos": [],
      "espera": {
        "rol": "status",
        "texto": "Todavía no se ha sorteado"
      }
    },
    {
      "descripcion": "Al pulsar «Sortear», se anuncia quién gana la cesta",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sortear"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Gana la cesta"
      }
    },
    {
      "descripcion": "Escribir la felicitación después del sorteo no lo deshace",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sortear"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje para quien gane",
            "texto": "Enhorabuena"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Gana la cesta"
      }
    }
  ]
}
```

Antes de arreglarlo, el panel decía esto:

```text
Error: Cannot call impure function during render

`Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).
```

Es decir: no se puede llamar a una función impura durante el render; `Math.random` lo es, y llamarla puede dar resultados inestables, que cambian sin control cada vez que el componente se vuelve a renderizar. Escribir una letra cambia el estado `mensaje`, React vuelve a llamar a `Cesta` y el sorteo se repite.

**El azar y la hora van donde ocurre algo**: en el manejador del clic (lección 15), que se ejecuta una vez por clic, y el resultado se guarda en el estado. Si lo que quieres es un valor aleatorio fijo desde el principio, la función de inicio de `useState` también vale: `useState(() => Math.random())` solo la llama en el primer render. Ojo con los paréntesis: `useState(Math.random())` llama a `Math.random` en cada render, aunque `useState` ignore el resultado, y el panel lo marca igual. Y para un reloj que avanza, la hora va en el estado y la pone al día un intervalo dentro de un efecto, como en el ejemplo de la página de la regla.

Ahora, una pregunta sobre lo que el linter sabe. Esta papeleta, de la rifa que organizan los mismos comercios, hace cuatro cosas impuras al renderizar:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { PREMIOS, elegirAlAzar } from './premios'\n\nexport default function Papeleta({ comercio }) {\n  const codigo = crypto.randomUUID()             // A\n  const hora = new Date().toLocaleTimeString()   // B\n  const inicio = performance.now()               // C\n  const premio = elegirAlAzar(PREMIOS)           // D\n\n  return (\n    <p>\n      {comercio} · {hora} · {premio} · {codigo} · {inicio}\n    </p>\n  )\n}\n\n// ¿Qué líneas marca la regla purity?",
  "opciones": [
    "Las cuatro",
    "Solo la C",
    "La A y la C",
    "La B y la C"
  ],
  "correcta": 1,
  "explicacion": "Solo la C. Lo comprobamos con el plugin 7.1.1: el compilador lleva una lista de funciones que sabe impuras, y son tres, Date.now, Math.random y performance.now. crypto.randomUUID() y new Date() son igual de impuras, y la página de la regla las pone de ejemplo, pero no están en esa lista. Y elegirAlAzar puede llamar a Math.random por dentro sin que el linter lo sepa: no mira dentro de las funciones que llamas. Las cuatro líneas rompen la pureza."
}
```

**Un panel limpio no demuestra que el componente sea puro.** La regla conoce tres funciones; las demás formas de pedir la hora o el azar las tienes que reconocer tú.

## `refs`: `ref.current`, fuera del render

La lección 33 explicó el porqué: una ref guarda valores que no se pintan, y cambiarla no avisa a React. Si la lees mientras se renderiza, enseñas un valor que puede estar desfasado. En el Carnaval de Águilas, el público vota a cada comparsa desde el móvil, y alguien guardó los votos en una ref «para no renderizar de más»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Votos que no se ven",
  "consigna": "Pulsa «Votar» tres veces: el contador sigue en 0. Pulsa «Siguiente comparsa»: de golpe aparecen los 3 votos, y debajo de otra comparsa. Mira qué línea marca el panel y cuál no. Después cambia la ref por un estado y comprueba que cada voto se ve al momento.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nconst COMPARSAS = ['Los Piratas del Muelle', 'Las Sirenas de Calabardina', 'Los Faroleros']\n\nexport default function Votacion() {\n  const [turno, setTurno] = useState(0)\n  const votosRef = useRef(0)\n\n  function votar() {\n    votosRef.current = votosRef.current + 1\n  }\n\n  return (\n    <main>\n      <h1>Carnaval de Águilas: voto del público</h1>\n      <p>Desfila ahora: {COMPARSAS[turno]}</p>\n      <button onClick={votar}>Votar</button>\n      <p>Votos recogidos: {votosRef.current}</p>\n      <button onClick={() => setTurno((turno + 1) % COMPARSAS.length)}>\n        Siguiente comparsa\n      </button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #7e22ce;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.8rem;\n  margin-right: 0.4rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true
}
```

El panel marca la lectura del JSX, `{votosRef.current}`, y no la escritura del manejador: escribir `current` en un manejador o en un efecto es justo lo que hay que hacer. El título del mensaje es siempre el mismo, «Error: Cannot access refs during render», y la anotación del código dice qué has hecho exactamente:

- «Cannot access ref value during render»: **lees** `current` al renderizar.
- «Cannot update ref during render»: lo **escribes** al renderizar.
- «Passing a ref to a function may read its value during render»: le **pasas** la ref a una función durante el render, y esa función podría leerla.

Dos detalles de la página de la regla, comprobados. El linter sabe que algo es una ref porque sale de `useRef`, porque se lo pasas a un `ref` en el JSX o porque se llama `ref` o termina en `Ref` y usas su `.current`: un objeto normal llamado `miRef` con una propiedad `current` también se marca, y la solución es cambiarle el nombre. Y la excepción de la lección 33, rellenar la ref una sola vez con `if (ref.current === null)`, no se marca.

Ahora mira el mismo componente desde el otro lado, el del compilador. El bloque siguiente enseña, a la derecha del código, lo que hace `babel-plugin-react-compiler` 1.0.0 con él; cómo se lee esa salida es la lección 68.

```laboratorio
{
  "tipo": "compilador-react",
  "titulo": "Lo que el linter marca, el compilador se lo salta",
  "consigna": "Debajo de la salida, el informe dice «Votacion: no se compiló» y da el mismo motivo que el panel «Linter». Cambia votosRef por un estado, como en el bloque anterior, y mira cómo el informe pasa a «Votacion: compilado» y aparecen las ranuras de caché.",
  "codigo": "import { useRef, useState } from 'react'\n\nconst COMPARSAS = ['Los Piratas del Muelle', 'Las Sirenas de Calabardina', 'Los Faroleros']\n\nexport default function Votacion() {\n  const [turno, setTurno] = useState(0)\n  const votosRef = useRef(0)\n\n  function votar() {\n    votosRef.current = votosRef.current + 1\n  }\n\n  return (\n    <main>\n      <h1>Carnaval de Águilas: voto del público</h1>\n      <p>Desfila ahora: {COMPARSAS[turno]}</p>\n      <button onClick={votar}>Votar</button>\n      <p>Votos recogidos: {votosRef.current}</p>\n      <button onClick={() => setTurno((turno + 1) % COMPARSAS.length)}>\n        Siguiente comparsa\n      </button>\n    </main>\n  )\n}\n"
}
```

## `globals`: lo de fuera del componente no se toca al renderizar

La Charcutería Montes tiene una máquina de turnos en una pantalla. A alguien le pareció que la forma más directa de numerar los tickets era un contador global que cada `Ticket` va subiendo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una máquina de turnos que se salta números",
  "consigna": "Mira los números: Rosa tiene el 2 y Andrés el 4. Pulsa «Coger número»: Rosa y Andrés cambian de número y Luis recibe el 10. Lee el panel. Después arréglalo: el número se asigna al coger el ticket, en el manejador, y se guarda en el estado junto al nombre; Ticket solo lo pinta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst LLEGAN = ['Rosa', 'Andrés', 'Luis', 'Carmen', 'Pili', 'Javier']\n\n// El rollo de números de la máquina, fuera de cualquier componente\nlet siguienteNumero = 1\n\nfunction Ticket({ cliente }) {\n  const numero = siguienteNumero\n  siguienteNumero = siguienteNumero + 1\n  return (\n    <li>\n      Número {numero}: {cliente}\n    </li>\n  )\n}\n\nexport default function Turnos() {\n  const [cola, setCola] = useState(['Rosa', 'Andrés'])\n\n  function cogerNumero() {\n    setCola([...cola, LLEGAN[cola.length]])\n  }\n\n  return (\n    <main>\n      <h1>Charcutería Montes</h1>\n      <button onClick={cogerNumero} disabled={cola.length === LLEGAN.length}>\n        Coger número\n      </button>\n      <ol className=\"cola\">\n        {cola.map((cliente) => (\n          <Ticket key={cliente} cliente={cliente} />\n        ))}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #b45309;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.8rem;\n}\n\n.cola {\n  padding-left: 1.2rem;\n}\n\n.cola li {\n  margin: 0.25rem 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true
}
```

El panel lo explica:

```text
Error: Cannot reassign variables declared outside of the component/hook

Variable `siguienteNumero` is declared outside of the component/hook. Reassigning this value during render is a form of side effect, which can cause unpredictable behavior depending on when the component happens to re-render. If this variable is used in rendering, use useState instead. Otherwise, consider updating it in an effect. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#side-effects-must-run-outside-of-render).
```

Es decir: `siguienteNumero` se declaró fuera del componente, y reasignarla durante el render es un efecto secundario, que se comporta de forma imprevisible según cuándo se vuelva a renderizar el componente. Si la variable se usa para pintar, usa `useState`; si no, actualízala en un efecto.

Lo imprevisible, aquí, se ve: con `StrictMode` cada `Ticket` se llama dos veces y gasta dos números, y cada clic vuelve a renderizar todos los tickets, que gastan más. Sin `StrictMode` el fallo cambia de forma, pero sigue: 1 y 2 al cargar, y 3, 4 y 5 después del primer clic. **El número de un ticket no puede depender de cuántas veces se ha renderizado**, sino de cuándo llegó el cliente, y eso pasa en el manejador.

Si en vez de reasignar la variable modificas una propiedad de algo global durante el render (`window.usuario = id`, `document.title = titulo`, `cache[id] = datos`), también se marca, pero lo hace la regla `immutability`, con este texto: «Modifying a variable defined outside a component or hook is not allowed. Consider using an effect.» Dentro de un efecto sí está bien: un `document.title = titulo` dentro de un `useEffect` no da ningún aviso.

Dos huecos, comprobados. Si escribes `siguienteNumero++`, el panel no dice nada: el compilador todavía no sabe analizar un `++` sobre una variable global, así que se salta el componente en silencio y la regla no llega a verlo. Y un `push` a un array global tampoco se marca.

## `immutability`: props y estado no se cambian a mano

En la Clínica veterinaria Cuatro Patas pesan a Lola en cada visita. Los botones de su ficha modifican el objeto del estado y después llaman a su `set`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un peso que no se mueve",
  "consigna": "Pulsa «+100 g» tres veces: el peso no cambia. Pulsa «Vacunar de moquillo»: aparece la vacuna y, de paso, los 300 g. El panel marca una línea, pero hay dos mutaciones. Arregla las dos con un objeto y un array nuevos (lecciones 20 y 21), y comprueba que cada clic se ve al momento.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Ficha() {\n  const [paciente, setPaciente] = useState({\n    nombre: 'Lola',\n    especie: 'Perra mestiza',\n    peso: 12.4,\n    vacunas: ['Rabia'],\n  })\n\n  function ganar100g() {\n    paciente.peso = Math.round((paciente.peso + 0.1) * 10) / 10\n    setPaciente(paciente)\n  }\n\n  function vacunarMoquillo() {\n    paciente.vacunas.push('Moquillo')\n    setPaciente({ ...paciente })\n  }\n\n  return (\n    <main>\n      <h1>Clínica veterinaria Cuatro Patas</h1>\n      <p>\n        {paciente.nombre} · {paciente.especie}\n      </p>\n      <p>Peso: {paciente.peso} kg</p>\n      <p>Vacunas: {paciente.vacunas.join(', ')}</p>\n      <button onClick={ganar100g}>+100 g</button>\n      <button onClick={vacunarMoquillo}>Vacunar de moquillo</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #0e7490;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.8rem;\n  margin-right: 0.4rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true
}
```

El mensaje del panel:

```text
Error: This value cannot be modified

Modifying a value returned from 'useState()', which should not be modified directly. Use the setter function to update instead.
```

Es decir: estás modificando un valor que devolvió `useState()`, y eso no se hace directamente; usa su función `set`. `setPaciente(paciente)` recibe el mismo objeto de antes, React lo compara con `Object.is`, no ve ningún cambio y no renderiza (lección 20). El botón de la vacuna sí crea un objeto nuevo, así que renderiza, y de paso enseña el peso que ya habías cambiado a escondidas.

**Lo que el panel no marca es la otra mutación**, `paciente.vacunas.push('Moquillo')`. Con la versión 7.1.1, `immutability` caza las asignaciones: `paciente.peso = …`, `lista[0] = …`, `pedido.unidades += 1`, `delete socio.clave` y también las anidadas, como `socio.direccion.calle = …`. En cambio, pasan sin aviso los métodos que modifican (`push`, `sort`, `reverse`, `splice`), `Object.assign` y los cambios en un objeto que sacaste del estado con `find` o que te llegó como parámetro de un manejador. Es el bug 2 del proyecto de la lección 71. La regla funciona igual con las props, con otro texto: «Modifying component props or hook arguments is not allowed. Consider using a local variable instead.»

## `set-state-in-render` y `set-state-in-effect`: un `set` fuera de su sitio

En la Sidrería Iturri dividen la cuenta entre los comensales. El importe por persona vive en un estado que un efecto mantiene al día:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos renders por cada clic",
  "consigna": "Mira el árbol sin tocar nada: ya va por el commit 2. Pulsa «Uno más»: el número de commit salta de dos en dos. El panel «Linter» marca el set del efecto. Ahora prueba lo que no se debe: borra el useEffect y deja setPorPersona(TOTAL / comensales) suelto en el cuerpo; lee el error de la vista previa y el panel. Por último, arréglalo de verdad: porPersona se calcula al renderizar, sin estado ni efecto, y cada clic es un solo commit.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nconst COMANDA = [\n  { plato: 'Tortilla de bacalao', precio: 16 },\n  { plato: 'Chuletón (1 kg)', precio: 52 },\n  { plato: 'Queso con membrillo y nueces', precio: 9 },\n  { plato: 'Sidra de barrica, a discreción', precio: 35 },\n]\nconst TOTAL = COMANDA.reduce((suma, linea) => suma + linea.precio, 0)\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport default function Cuenta() {\n  const [comensales, setComensales] = useState(4)\n  const [porPersona, setPorPersona] = useState(0)\n\n  useEffect(() => {\n    setPorPersona(TOTAL / comensales)\n  }, [comensales])\n\n  return (\n    <main>\n      <h1>Sidrería Iturri: la cuenta</h1>\n      <p>Total: {euros.format(TOTAL)}</p>\n      <p>\n        Comensales: {comensales}{' '}\n        <button onClick={() => setComensales(comensales + 1)}>Uno más</button>\n        <button onClick={() => setComensales(Math.max(1, comensales - 1))}>Uno menos</button>\n      </p>\n      <p className=\"cada-uno\">Cada uno: {euros.format(porPersona)}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #3f6212;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.3rem 0.7rem;\n  margin-left: 0.3rem;\n}\n\n.cada-uno {\n  font-size: 1.15rem;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "mostrarLint": true
}
```

Con el efecto, el panel marca `set-state-in-effect` con «Error: Calling setState synchronously within an effect can trigger cascading renders»; el mensaje completo y su traducción están en la lección 39. El árbol lo confirma: nada más cargar ya va por el commit 2, con `Cuenta ·2` y el motivo «cambió su estado n.º 2», el del importe. El primer commit llevaba la cuenta con 0,00 € y el efecto la corrigió en el segundo. Cada clic repite la jugada: un commit con los comensales y otro con el importe. Con el arreglo, la app carga en el commit 1 y cada clic suma uno, con el motivo «cambió su estado».

Con el `set` suelto en el cuerpo, la vista previa cae con el error de React:

```text
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Y el panel ya lo había avisado, con otra regla:

```text
Error: Cannot call setState during render

Calling setState during render may trigger an infinite loop.
* To reset state when other state/props change, store the previous value in state and update conditionally: https://react.dev/reference/react/useState#storing-information-from-previous-renders
* To derive data from other state/props, compute the derived data during render without using state.
```

Es decir: llamar a `setState` durante el render puede provocar un bucle infinito. Para reiniciar un estado cuando cambian otras props o estados, guarda el valor anterior en el estado y actualiza solo si ha cambiado; para deducir datos de otras props o estados, calcúlalos al renderizar, sin estado.

Son las dos salidas de la lección 39. **La de esta cuenta es la segunda**: `const porPersona = TOTAL / comensales`, un render por clic y nada que sincronizar. La primera, el patrón del valor anterior con un `if`, la regla la acepta. Por eso tampoco caza el bug 5 de la lección 71, que tenía su `set` dentro de un `if`.

Y un hueco de `set-state-in-effect`, comprobado: solo mira los `set` escritos directamente en el cuerpo del efecto. Si el efecto llama a una función suya que hace el `set` (por ejemplo, `medir()` antes de suscribirse al evento `resize`), el panel no dice nada.

## `static-components`: un componente dentro de otro

La lección 26 enseñó lo que pasa: cada render del padre crea una función nueva, React ve un tipo de componente distinto en esa posición, desmonta el viejo con su estado y sus nodos del DOM, y monta uno nuevo. Allí quedó pendiente la regla que lo vigila. El Balneario Aguas Claras tiene una encuesta, y quien la escribió declaró la pregunta dentro del formulario para que leyera el estado sin pasarle props:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una encuesta que pierde el foco",
  "consigna": "Escribe «Muy relajante» en la primera pregunta: solo entra la primera letra y el campo pierde el foco. El panel marca los dos <Pregunta />. Saca Pregunta fuera de Encuesta y pásale por props lo que necesita: el texto, el valor y una función para cambiarlo (onCambiar). Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Encuesta() {\n  const [respuestas, setRespuestas] = useState({ circuito: '', masaje: '' })\n\n  // Cómodo: Pregunta ve respuestas y setRespuestas sin pasarle nada\n  function Pregunta({ campo, texto }) {\n    return (\n      <label>\n        {texto}\n        <input\n          value={respuestas[campo]}\n          onChange={(e) => setRespuestas({ ...respuestas, [campo]: e.target.value })}\n        />\n      </label>\n    )\n  }\n\n  return (\n    <form onSubmit={(e) => e.preventDefault()}>\n      <h1>Balneario Aguas Claras: tu opinión</h1>\n      <Pregunta campo=\"circuito\" texto=\"¿Qué tal el circuito termal?\" />\n      <Pregunta campo=\"masaje\" texto=\"¿Y el masaje?\" />\n      <p>\n        Resumen: {respuestas.circuito || '—'} / {respuestas.masaje || '—'}\n      </p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "form {\n  display: grid;\n  gap: 0.6rem;\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #0f766e;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n}\n\ninput {\n  font: inherit;\n  padding: 0.3rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true,
  "exigirLintLimpio": true,
  "comprobaciones": [
    {
      "descripcion": "Al escribir «Muy relajante» en el circuito termal, el campo lo conserva entero",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "¿Qué tal el circuito termal?",
            "texto": "Muy relajante"
          }
        }
      ],
      "espera": {
        "etiqueta": "¿Qué tal el circuito termal?",
        "valor": "Muy relajante"
      }
    },
    {
      "descripcion": "El resumen recoge las dos respuestas",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "¿Qué tal el circuito termal?",
            "texto": "Muy relajante"
          }
        },
        {
          "escribir": {
            "etiqueta": "¿Y el masaje?",
            "texto": "Perfecto"
          }
        }
      ],
      "espera": {
        "texto": "Resumen: Muy relajante / Perfecto"
      }
    }
  ]
}
```

El mensaje:

```text
Error: Cannot create components during render

Components created during render will reset their state each time they are created. Declare components outside of render.
```

Es decir: no se pueden crear componentes durante el render; los que se crean así reinician su estado cada vez que se vuelven a crear. Declara los componentes fuera del render. El panel señala dónde se **usa**, `<Pregunta`, y el mensaje completo trae un segundo trozo de código que apunta a dónde se **crea**: «The component is created during render here».

La regla también caza la versión disimulada, elegir entre dos flechas que devuelven JSX (`const Icono = abierto ? () => <b>…</b> : () => <i>…</i>`) y pintar `<Icono />`. Lo que no marca es una función normal que devuelve JSX y que llamas como función, `{fila(dato)}`: para React eso no es un componente, solo JSX que forma parte del padre.

## Memorización, librerías y configuración

Las reglas que quedan salen menos, pero conviene reconocerlas.

**`use-memo` y `void-use-memo`.** `useMemo` sirve para calcular un valor y guardarlo (lección 67). `use-memo` marca los usos que su API no admite, como un callback con parámetros («Error: useMemo() callbacks may not accept parameters») o asíncrono («Error: useMemo() callbacks may not be async or generator functions»). `void-use-memo`, la que solo trae `recommended-latest`, marca un `useMemo` sin `return` o cuyo resultado no se usa. En la Cooperativa La Cepa suman los kilos de uva de cada remolque:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useMemo } from 'react'\n\nexport default function Remolques({ remolques }) {\n  const totalKilos = useMemo(() => {\n    remolques.reduce((suma, remolque) => suma + remolque.kilos, 0)\n  }, [remolques])\n\n  return <p>Uva entregada hoy: {totalKilos} kg</p>\n}\n\n// En un proyecto creado con la plantilla de Vite y ESLint,\n// sin tocar su configuración, ¿quién avisa del return que falta?",
  "opciones": [
    "Nadie: es JavaScript válido y React lo pinta sin errores",
    "La plantilla con ESLint, porque use-memo está en recommended",
    "El panel de esta lección y Oxlint; la plantilla con ESLint, no",
    "Solo React, con un aviso en la consola al renderizar"
  ],
  "correcta": 2,
  "explicacion": "Lo comprobamos en los tres sitios. La plantilla de Vite con ESLint usa recommended, que no incluye void-use-memo, y npm run lint termina sin un solo aviso. El panel de esta lección, con recommended-latest, dice «Error: useMemo() callbacks must return a value», y Oxlint 1.89.0, con la configuración de la plantilla, da el mismo texto como aviso. React no dice nada: totalKilos vale undefined y el párrafo sale sin número. Es el mismo despiste de la flecha con llaves de la lección 67."
}
```

**`preserve-manual-memoization`.** Si has escrito un `useMemo` o un `useCallback`, el compilador lo respeta, pero solo si su propio análisis de dependencias coincide con el tuyo; si no, se salta el componente. Al construir, el compilador lo cuenta con «Existing memoization could not be preserved». En la práctica, el caso típico (una dependencia que falta) te lo avisa antes `exhaustive-deps`: con los ejemplos de la página de esta regla, en nuestras pruebas, el linter solo dio ese aviso.

**`incompatible-library`.** Algunas librerías devuelven funciones o objetos que cambian por dentro sin cambiar de identidad, y eso es incompatible con memorizar, a mano o con el compilador. El plugin lleva una lista de esas APIs:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useForm } from 'react-hook-form'\n\nexport default function Reserva() {\n  const { register, watch } = useForm()\n  const personas = watch('personas')\n\n  return (\n    <form>\n      <label>\n        Personas\n        <input type=\"number\" {...register('personas')} />\n      </label>\n      <p>Mesa para {personas}</p>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "watch('personas')",
      "nota": "Aquí salta incompatible-library, como aviso: «Compilation Skipped: Use of incompatible library». La anotación dice que useForm() de React Hook Form devuelve una función watch() que no se puede memorizar con seguridad."
    },
    {
      "fragmento": "const { register, watch } = useForm()",
      "nota": "No hay nada mal escrito en tu código: el aviso dice que, por defecto, el compilador no memorizará este componente, y que puede haber problemas si pasas estos valores a otros componentes memorizados."
    },
    {
      "fragmento": "<p>Mesa para {personas}</p>",
      "nota": "Para este caso, la página de la regla propone useWatch, de la misma librería, que sí devuelve un valor normal. useReactTable, de TanStack Table, es otra de las APIs de la lista."
    }
  ]
}
```

**`unsupported-syntax`** (aviso) marca lo que el compilador no puede analizar, como una llamada a `eval`: «Compilation Skipped: The 'eval' function is not supported». **`config`** y **`gating`** recogen los errores de configuración del propio compilador: sus opciones y el modo *gating*, que activa la versión compilada de un componente solo cuando una función tuya lo permite (lecciones 68 y 69). En nuestras pruebas, un `babel.config.js` con las opciones mal escritas de los ejemplos de sus páginas no dio ningún aviso, así que en la práctica casi nunca las verás saltar. Y **`error-boundaries`**, `rules-of-hooks` y `exhaustive-deps` ya tienen sus lecciones: la 53, la 44 y la 42.

## Lo que el linter no ve

Has ido viendo huecos regla a regla. Juntos:

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si el panel dice «El linter no marca nada», el componente cumple las reglas de React",
      "realidad": "El linter caza los patrones que reconoce. new Date() o crypto.randomUUID() en el render, Math.random escondido en una función auxiliar, un push al estado o un contador++ global pasan sin aviso. Un aviso demuestra que hay un problema; que no haya avisos no demuestra que no lo haya."
    },
    {
      "mito": "immutability vigila cualquier cambio en props y estado",
      "realidad": "Vigila las asignaciones: obj.campo = …, lista[0] = …, +=, delete. Los métodos que modifican, como push, sort o splice, y Object.assign se le escapan, igual que un objeto sacado del estado con find."
    },
    {
      "mito": "Los avisos en ámbar se pueden dejar para otro día",
      "realidad": "exhaustive-deps es un aviso, y sus fallos son de los más difíciles de encontrar (lección 42). Y incompatible-library te avisa de que el compilador se va a saltar ese componente."
    },
    {
      "mito": "Si no uso el React Compiler, estas reglas no van conmigo",
      "realidad": "Vigilan las reglas de React, que valen con o sin compilador: la cesta sorteaba de nuevo con cada letra y la charcutería se saltaba números sin compilar nada. El compilador solo es el origen del análisis."
    },
    {
      "mito": "Silenciar una línea solo afecta a esa línea",
      "realidad": "Si la regla silenciada es exhaustive-deps o rules-of-hooks, el React Compiler se salta el componente entero. Lo ves en la sección siguiente."
    }
  ]
}
```

## Silenciar una regla (y por qué casi nunca)

ESLint deja apagar una regla en una línea con un comentario. El texto después de `--` es el motivo, y ESLint lo admite para que quien lea el código sepa por qué está ahí:

```jsx
// eslint-disable-next-line react-hooks/refs -- solo se lee en manejadores
ultimoRef.current = valor
```

Ese caso concreto, una ref que guarda el último valor para leerlo después desde un efecto, tiene hoy una salida sin comentario: `useEffectEvent` (lección 41). El comentario apaga **esa regla en la línea siguiente** y nada más: si el mismo componente tiene otro problema, se sigue marcando (`eslint-disable-line`, al final de la línea, apaga la regla en esa misma línea). Casi nunca es buena idea, por tres razones que comprobamos:

1. **El fallo sigue ahí.** El comentario cambia lo que dice el linter, no lo que hace tu código. La cesta seguiría sorteando con cada letra.
2. **Para el compilador, cuesta el componente entero.** Si silencias `exhaustive-deps` o `rules-of-hooks`, `babel-plugin-react-compiler` 1.0.0 no compila ese componente y lo explica así: «React Compiler has skipped optimizing this component because one or more React ESLint rules were disabled». Con las demás reglas no lo hace.
3. **Los comentarios se quedan.** Si arreglas el código y olvidas el comentario, ESLint lo señala con un aviso: «Unused eslint-disable directive (no problems were reported from 'react-hooks/purity').» El panel de esta lección también, así que en los ejercicios un comentario sobrante no pasa «Comprobar».

¿Cuándo tiene sentido? Al actualizar un proyecto antiguo a la versión 7 del plugin pueden aparecer de golpe muchos errores nuevos en código que funcionaba. Ahí es mejor bajar esas reglas a aviso en la configuración (lo ves en la sección siguiente) y arreglarlas archivo a archivo que llenar el código de comentarios que nadie quitará. Y si una librería te obliga a un patrón que el linter no entiende, silencia esa línea, con su motivo. En el código de esta web (lección 86) no hay ni un comentario `eslint-disable` de `react-hooks`.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Antes de silenciar, pregunta qué te está diciendo",
  "contenido": "Casi siempre, el aviso señala un cálculo que debería hacerse al renderizar, un dato que debería estar en el estado o algo que debería ocurrir en un manejador. Si la regla te parece absurda en un caso concreto, lo más probable es que el código pueda escribirse de otra forma, como en las lecciones 39 y 42."
}
```

## En tu proyecto: ESLint u Oxlint

La plantilla de Vite de la lección 2 te deja elegir linter. Con los dos tienes estas reglas, pero no de la misma forma.

### Con ESLint

Si eliges ESLint en el asistente, o añades `--eslint` al comando:

```bash
npm create vite@latest mi-app -- --template react --eslint
```

la plantilla (create-vite 9.3.1) instala `eslint` 10.13 y `eslint-plugin-react-hooks` 7.1.1, y crea un `eslint.config.js` con `reactHooks.configs.flat.recommended`, el que viste entero en la lección 44. Este es el mismo archivo con los dos cambios que más vas a querer hacer:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// eslint.config.js\nimport js from '@eslint/js'\nimport globals from 'globals'\nimport reactHooks from 'eslint-plugin-react-hooks'\nimport reactRefresh from 'eslint-plugin-react-refresh'\nimport { defineConfig, globalIgnores } from 'eslint/config'\n\nexport default defineConfig([\n  globalIgnores(['dist']),\n  {\n    files: ['**/*.{js,jsx}'],\n    extends: [\n      js.configs.recommended,\n      reactHooks.configs.flat['recommended-latest'],\n      reactRefresh.configs.vite,\n    ],\n    languageOptions: {\n      globals: globals.browser,\n      parserOptions: { ecmaFeatures: { jsx: true } },\n    },\n    rules: {\n      // Mientras migras un proyecto viejo: que avise, sin cortar el lint\n      'react-hooks/set-state-in-effect': 'warn',\n    },\n  },\n])",
  "anotaciones": [
    {
      "fragmento": "reactHooks.configs.flat['recommended-latest']",
      "nota": "En la plantilla pone reactHooks.configs.flat.recommended. Con recommended-latest tienes las mismas 17 reglas que el panel de esta lección: añade void-use-memo."
    },
    {
      "fragmento": "'react-hooks/set-state-in-effect': 'warn'",
      "nota": "Las reglas de rules van después de extends y mandan sobre ellas: warn pasa la regla a aviso y off la apaga. Úsalo como paso temporal al actualizar un proyecto, no como forma de vivir."
    },
    {
      "fragmento": "js.configs.recommended",
      "nota": "Las reglas generales de ESLint, que también cazan cosas por su cuenta: con la flecha con llaves de la lección 67, por ejemplo, avisa de una etiqueta total: sin usar."
    },
    {
      "fragmento": "files: ['**/*.{js,jsx}']",
      "nota": "Los archivos que revisa. Con npm run lint se revisa el proyecto entero, y la extensión de ESLint para tu editor los subraya mientras escribes (lección 2)."
    }
  ]
}
```

Con la configuración de la plantilla, sin cambios, `npm run lint` sobre un sorteo como el de la cesta imprime esto (la primera línea es la ruta completa del archivo):

```text
/…/mi-app/src/Sorteo.jsx
  2:37  error  Error: Cannot call impure function during render

`Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

  1 | export default function Sorteo({ socios }) {
> 2 |   const ganador = socios[Math.floor(Math.random() * socios.length)]
    |                                     ^^^^^^^^^^^^^ Cannot call impure function
  3 |   return <p>Gana la cesta: {ganador}</p>
  4 | }
  5 |  react-hooks/purity

✖ 1 problem (1 error, 0 warnings)
```

Con algún error, el comando termina con código de salida 1, así que en una integración continua el cambio no pasa. Los avisos se imprimen, pero no lo hacen fallar.

### Con Oxlint, la opción por defecto

Oxlint no usa el plugin de React: trae **sus propias versiones** de estas reglas, con el prefijo `react/` en vez de `react-hooks/`. Lo comprobamos con Oxlint 1.89.0, la versión que instala hoy la plantilla. `oxlint --rules` lista todas las de `recommended-latest` menos `config` y `gating`, y `oxlint --print-config` muestra que, con el `.oxlintrc.json` de la plantilla, **casi todas ya están activas como avisos**: son de la categoría `correctness` del plugin `react`, que Oxlint enciende por defecto. Se quedan fuera `unsupported-syntax`, que es de otra categoría, y `rules-of-hooks`, que la plantilla activa a mano y como error.

Sobre el mismo sorteo, `npm run lint` con Oxlint dice:

```text
  ! react(purity): Cannot call impure function during render
   ,-[src/Sorteo.jsx:2:37]
 1 | export default function Sorteo({ socios }) {
 2 |   const ganador = socios[Math.floor(Math.random() * socios.length)]
   :                                     ^^^^^^|^^^^^^
   :                                           `-- Cannot call impure function
 3 |   return <p>Gana la cesta: {ganador}</p>
   `----
  help: `Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component re-renders
  note: React Compiler skipped optimizing this component or hook. Additional guidance: https://react.dev/reference/eslint-plugin-react-hooks/lints/purity

Found 1 warning and 0 errors.
```

El mismo diagnóstico, con un formato distinto: `!` es un aviso y la explicación va en la línea `help`. La línea `note` la añade Oxlint a todas estas reglas; con `purity`, como viste más arriba, el compilador de verdad sí compila el componente. Como es un aviso, el comando termina bien. Si quieres que estas reglas corten, súbelas a error en `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }],
    "react/purity": "error",
    "react/refs": "error",
    "react/immutability": "error",
    "react/globals": "error",
    "react/static-components": "error",
    "react/set-state-in-render": "error",
    "react/set-state-in-effect": "error"
  }
}
```

Con ese archivo, el mismo sorteo sale como error (`x react(purity)`) y el comando termina con código 1. Un detalle práctico: Oxlint entiende también los comentarios con el nombre de ESLint, así que `// eslint-disable-next-line react-hooks/purity` silencia la línea en los dos.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "En el editor, siempre",
      "texto": "Con la extensión de tu linter (lección 2), el aviso aparece mientras escribes la línea, que es cuando menos cuesta arreglarla."
    },
    {
      "titulo": "Antes de subir un cambio",
      "texto": "npm run lint en tu ordenador o en la integración continua. Un error corta; un aviso no, así que decide qué reglas quieres como error."
    },
    {
      "titulo": "Antes de activar el React Compiler",
      "texto": "Cada error de estas reglas es un componente que el compilador se va a saltar. Arreglarlos primero te dice qué parte de tu app se optimizará (lecciones 68 y 69)."
    },
    {
      "titulo": "Al actualizar el plugin en un proyecto viejo",
      "texto": "La versión 7 trae reglas que el código antiguo nunca ha pasado. Bájalas a aviso en la configuración y arréglalas archivo a archivo, sin llenar el código de comentarios."
    },
    {
      "titulo": "Al revisar código de otros",
      "texto": "Cada eslint-disable de react-hooks es una pregunta que hacer: qué escondía y si se puede escribir de otra forma."
    }
  ]
}
```

## Errores típicos

**Esconder el problema para que el linter calle.** Mover el código a una función auxiliar hace desaparecer el error del panel, porque el linter no mira dentro de las funciones que llamas. Alguien lo intentó con la cesta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function elegirAlAzar(lista) {\n  return lista[Math.floor(Math.random() * lista.length)]\n}\n\nexport default function Cesta() {\n  const [mensaje, setMensaje] = useState('')\n  const ganador = elegirAlAzar(COMERCIOS)\n  // ...el resto, igual que en el primer bloque\n}\n\n// El panel «Linter» ya no marca nada.\n// Escribes «Enhorabuena» en el mensaje. ¿Qué pasa con el ganador?",
  "opciones": [
    "Se queda fijo: si el linter no protesta, está arreglado",
    "Cambia con cada letra, como antes",
    "Solo cambia con la primera letra",
    "La vista previa se cae con un error de React"
  ],
  "correcta": 1,
  "explicacion": "Cambia con cada letra, como antes. elegirAlAzar se sigue llamando en cada render, y dentro sigue estando Math.random. El linter dejó de verlo porque purity solo mira las llamadas que hace el componente, pero el fallo es el mismo. El arreglo era mover el sorteo al manejador de «Sortear», no a otra función."
}
```

**Silenciar en vez de arreglar.** Un `eslint-disable` deja el fallo donde estaba y, con `exhaustive-deps` o `rules-of-hooks`, además deja el componente sin compilar. El segundo ejercicio va de eso.

**Creer que sin avisos no hay fallos.** Un `push` al estado, un `new Date()` en el render o un contador global con `++` no dan ningún aviso. El linter es una red más, como `StrictMode` y tus comprobaciones; ninguna lo coge todo.

**Acostumbrarse a los avisos ámbar.** Como no hacen fallar `npm run lint`, se acumulan, y entre veinte avisos viejos nadie ve el nuevo. O se arreglan o se decide, en la configuración, que esa regla no importa en ese proyecto.

**Pensar que `recommended` lo trae todo.** La plantilla de Vite con ESLint no incluye `void-use-memo`; el `useMemo` sin `return` de los remolques pasa sin aviso hasta que cambias a `recommended-latest`.

**Llamar `algoRef` a lo que no es una ref.** El linter trata como ref cualquier cosa llamada así que use `.current`, y marcará su lectura en el render. Si es otra cosa, cámbiale el nombre.

## Ejercicios

En el mercadillo solidario de la parroquia de San Pablo venden libros de segunda mano. La app tiene tres archivos de componentes y un fallo en cada uno; el panel marca los tres.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres avisos, tres fallos",
  "consigna": "Vende «Nada»: la fila sigue «A la venta». Pulsa «Ha entrado alguien»: el contador no se mueve. Lee el panel: hay un aviso en cada archivo. Arregla App.jsx (un array y un objeto nuevos), Caja.jsx (lo recaudado se calcula a partir de vendidos, sin variable global) y Puerta.jsx (lo que se pinta va en el estado). Cuando el panel diga «El linter no marca nada», pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Caja from './Caja'\nimport Puerta from './Puerta'\nimport './estilos.css'\n\nconst LIBROS = [\n  { id: 1, titulo: 'La colmena', precio: 3, vendido: false },\n  { id: 2, titulo: 'Nada', precio: 2, vendido: false },\n  { id: 3, titulo: 'Los santos inocentes', precio: 4, vendido: false },\n  { id: 4, titulo: 'Entre visillos', precio: 2, vendido: false },\n]\n\nexport default function Mercadillo() {\n  const [libros, setLibros] = useState(LIBROS)\n\n  function vender(indice) {\n    libros[indice].vendido = true\n    setLibros(libros)\n  }\n\n  return (\n    <main>\n      <h1>Mercadillo solidario de San Pablo</h1>\n      <Puerta />\n      <ul className=\"libros\">\n        {libros.map((libro, indice) => (\n          <li key={libro.id}>\n            {libro.titulo} · {libro.precio} € · {libro.vendido ? 'Vendido' : 'A la venta'}\n            {!libro.vendido && (\n              <button onClick={() => vender(indice)}>Vender «{libro.titulo}»</button>\n            )}\n          </li>\n        ))}\n      </ul>\n      <Caja vendidos={libros.filter((libro) => libro.vendido)} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Caja.jsx",
      "codigo": "// Lo recaudado en el día, fuera del componente para que no se pierda\nlet recaudado = 0\n\nexport default function Caja({ vendidos }) {\n  for (const libro of vendidos) {\n    recaudado = recaudado + libro.precio\n  }\n\n  return <p className=\"caja\">Recaudado: {recaudado} €</p>\n}\n"
    },
    {
      "nombre": "Puerta.jsx",
      "codigo": "import { useRef } from 'react'\n\nexport default function Puerta() {\n  const visitantesRef = useRef(0)\n\n  return (\n    <p className=\"puerta\">\n      Visitantes: {visitantesRef.current}{' '}\n      <button onClick={() => (visitantesRef.current = visitantesRef.current + 1)}>\n        Ha entrado alguien\n      </button>\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #1d4ed8;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  margin-left: 0.4rem;\n}\n\n.libros {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\n.libros li {\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.caja {\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true,
  "exigirLintLimpio": true,
  "comprobaciones": [
    {
      "descripcion": "Al vender «Nada», su fila pasa a «Vendido»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vender «Nada»"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Nada · 2 € · Vendido"
      }
    },
    {
      "descripcion": "Al vender «Nada», la caja marca 2 €",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vender «Nada»"
          }
        }
      ],
      "espera": {
        "texto": "Recaudado: 2 €"
      }
    },
    {
      "descripcion": "Al vender «Nada» y «La colmena», la caja marca 5 €",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vender «Nada»"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vender «La colmena»"
          }
        }
      ],
      "espera": {
        "texto": "Recaudado: 5 €"
      }
    },
    {
      "descripcion": "Al pulsar dos veces «Ha entrado alguien», el contador marca 2 visitantes",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ha entrado alguien"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ha entrado alguien"
          }
        }
      ],
      "espera": {
        "texto": "Visitantes: 2"
      }
    }
  ]
}
```

Si arreglas `App.jsx` y dejas `Caja.jsx` como estaba, lo verás enseguida: vender «Nada» marca 4 € (`StrictMode` llama dos veces a `Caja`) y vender después «La colmena», 14 €. La segunda y la tercera comprobación existen para eso.

El segundo ejercicio es el contrario: **el panel no marca nada y la app está rota**. La Orquesta de pulso y púa La Bandurria tiene su archivo de partituras en la API simulada. Al cambiar de instrumento debería cargar sus partituras, y cada una se puede marcar como favorita. Alguien silenció al linter.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un linter callado no es un código correcto",
  "consigna": "Elige «Guitarra»: la lista no cambia. Marca una favorita: el contador sigue en 0. El panel no marca nada. Quita el comentario eslint-disable, lee lo que aparece y arréglalo sin volver a silenciar nada. El otro fallo el linter no lo ve: búscalo tú. Si dejas el comentario después de arreglar el efecto, el panel también lo dirá.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nexport default function Archivo() {\n  const [instrumento, setInstrumento] = useState('bandurria')\n  const [partituras, setPartituras] = useState([])\n  const [favoritas, setFavoritas] = useState([])\n\n  useEffect(() => {\n    let ignorar = false\n    fetch(`/api/partituras?q=${instrumento}`)\n      .then((respuesta) => respuesta.json())\n      .then((datos) => {\n        if (!ignorar) setPartituras(datos)\n      })\n    return () => {\n      ignorar = true\n    }\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [])\n\n  function marcarFavorita(id) {\n    favoritas.push(id)\n    setFavoritas(favoritas)\n  }\n\n  return (\n    <main>\n      <h1>Orquesta de pulso y púa La Bandurria</h1>\n      <label>\n        Instrumento\n        <select value={instrumento} onChange={(e) => setInstrumento(e.target.value)}>\n          <option value=\"bandurria\">Bandurria</option>\n          <option value=\"laúd\">Laúd</option>\n          <option value=\"guitarra\">Guitarra</option>\n        </select>\n      </label>\n      <p>Favoritas: {favoritas.length}</p>\n      <ul className=\"partituras\">\n        {partituras.map((partitura) => (\n          <li key={partitura.id}>\n            {partitura.titulo} · {partitura.autor}\n            {favoritas.includes(partitura.id) ? (\n              ' · favorita'\n            ) : (\n              <button onClick={() => marcarFavorita(partitura.id)}>\n                Favorita: {partitura.titulo}\n              </button>\n            )}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n  color: #92400e;\n}\n\nlabel {\n  display: inline-grid;\n  gap: 0.25rem;\n}\n\nselect,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  margin-left: 0.5rem;\n  padding: 0.2rem 0.6rem;\n}\n\n.partituras {\n  display: grid;\n  gap: 0.35rem;\n  padding: 0;\n  list-style: none;\n}\n\n.partituras li {\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarLint": true,
  "exigirLintLimpio": true,
  "api": {
    "partituras": [
      {
        "id": 1,
        "titulo": "La Revoltosa (preludio)",
        "autor": "Ruperto Chapí",
        "instrumento": "bandurria"
      },
      {
        "id": 2,
        "titulo": "España cañí",
        "autor": "Pascual Marquina",
        "instrumento": "bandurria"
      },
      {
        "id": 3,
        "titulo": "Suspiros de España",
        "autor": "Antonio Álvarez",
        "instrumento": "laúd"
      },
      {
        "id": 4,
        "titulo": "El sitio de Zaragoza",
        "autor": "Cristóbal Oudrid",
        "instrumento": "laúd"
      },
      {
        "id": 5,
        "titulo": "Recuerdos de la Alhambra",
        "autor": "Francisco Tárrega",
        "instrumento": "guitarra"
      },
      {
        "id": 6,
        "titulo": "Lágrima",
        "autor": "Francisco Tárrega",
        "instrumento": "guitarra"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al elegir «Guitarra», salen las partituras de guitarra",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Instrumento",
            "opcion": "Guitarra"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lágrima"
      }
    },
    {
      "descripcion": "Al elegir «Laúd», desaparecen las de bandurria",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Instrumento",
            "opcion": "Laúd"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "España cañí"
        }
      }
    },
    {
      "descripcion": "Al marcar «España cañí» como favorita, su fila lo indica",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Favorita: España cañí"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "España cañí · Pascual Marquina · favorita"
      }
    },
    {
      "descripcion": "Al marcar dos favoritas seguidas, el contador marca 2",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Favorita: España cañí"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Favorita: La Revoltosa (preludio)"
          }
        }
      ],
      "espera": {
        "texto": "Favoritas: 2"
      }
    }
  ]
}
```

Al quitar el comentario, el panel dice «React Hook useEffect has a missing dependency: 'instrumento'. Either include it or remove the dependency array.»: es la lección 42, y el efecto tiene que volver a pedir datos cuando cambia el instrumento. Si añades `instrumento` y dejas el comentario, el aviso pasa a ser «Unused eslint-disable directive (no problems were reported from 'react-hooks/exhaustive-deps').», y «Comprobar» no da por bueno el ejercicio.

El de las favoritas es un `push` al estado: `immutability` no lo ve, como en la ficha de Lola. Y un detalle del compilador: mientras el comentario estaba puesto, `babel-plugin-react-compiler` 1.0.0 se saltaba `Archivo` entero; con el ejercicio resuelto, lo compila.

**Retos para seguir practicando** (sin comprobación automática):

1. En la cesta de Navidad, apunta también la hora del sorteo («Sorteado a las 12:03») sin que el panel proteste y sin que la hora cambie mientras escribes la felicitación.
2. En la charcutería, añade un botón «Atender» que quite el primer ticket de la cola. Comprueba que ningún cliente cambia de número. ¿Sigue valiendo `cola.length + 1` para el siguiente?
3. En la ficha de Lola, añade un botón «Deshacer» que guarde el paciente anterior en otro estado. Vuelve a poner el `push` de las vacunas: ¿por qué «Deshacer» devuelve el peso de antes, pero no quita la vacuna?
4. En un proyecto tuyo creado con Vite, cambia a `recommended-latest` (o, con Oxlint, sube estas reglas a error) y ejecuta `npm run lint`. Para cada aviso, decide si es un cálculo que va al render, un dato que va al estado o algo que va a un manejador.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "eslint-plugin-react-hooks",
      "descripcion": "El índice de las reglas del plugin, con un enlace a la página de cada una y la explicación de por qué las del compilador no te obligan a arreglarlo todo de golpe.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "purity",
      "descripcion": "La regla de las funciones impuras en el render, con el patrón del reloj que avanza: la hora en el estado y un intervalo en un efecto.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/purity",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "refs",
      "descripcion": "Cómo detecta el linter qué es una ref, qué patrones marca y la inicialización perezosa que admite.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/refs",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "immutability",
      "descripcion": "Ejemplos de mutaciones de props y estado, y cómo sustituirlas por objetos y arrays nuevos en cada nivel.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "static-components",
      "descripcion": "La regla de los componentes declarados dentro de otros, con la versión del ternario y cómo pasar los datos por props.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Compiler v1.0",
      "descripcion": "El anuncio del compilador estable: por qué sus validaciones se publican como reglas de eslint-plugin-react-hooks y cómo activarlas sin instalar el compilador.",
      "url": "https://react.dev/blog/2025/10/07/react-compiler-1",
      "etiqueta": "react.dev"
    }
  ]
}
```
