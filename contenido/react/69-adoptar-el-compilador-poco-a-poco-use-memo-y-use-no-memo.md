# Adoptar el compilador poco a poco: `"use memo"` y `"use no memo"`

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `adoptar-el-compilador-poco-a-poco-use-memo-y-use-no-memo` (autogenerado del título)
- **Orden:** 690
- **Fuentes:** [Incremental Adoption](https://react.dev/learn/react-compiler/incremental-adoption) + [Directives](https://react.dev/reference/react-compiler/directives) + [compilationMode](https://react.dev/reference/react-compiler/compilationMode) — ver `contenido/react/TEMARIO.md` #69

---

## Qué es y para qué sirve

En la lección 68 activaste el compilador en un proyecto nuevo: compila todo lo que parece un componente o un Hook y se salta lo que rompe las reglas. En una aplicación con años de código, encenderlo de golpe tiene dos riesgos. El primero: puede haber componentes que rompen las reglas de una forma que el compilador no detecta, que funcionan de casualidad y que dejan de funcionar en cuanto algo se memoriza. El segundo: si algo falla, quieres saber dónde, y con todo compilado a la vez es difícil.

Por eso react.dev recomienda **adoptarlo poco a poco**: empezar por una parte, comprobar que todo sigue igual, medir y ampliar. Para eso tienes cuatro palancas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que puedes ajustar",
  "roles": [
    {
      "etiqueta": "compilationMode",
      "rol": "Qué funciones mira",
      "descripcion": "Las que parecen componentes y Hooks (infer, por defecto), solo las que marcas tú (annotation) o todas (all)."
    },
    {
      "etiqueta": "\"use memo\" y \"use no memo\"",
      "rol": "Excepciones función a función",
      "descripcion": "Una directiva al principio de una función la mete en la compilación o la saca, sin tocar la configuración."
    },
    {
      "etiqueta": "include",
      "rol": "Qué carpetas",
      "descripcion": "En Vite, el plugin de Babel solo procesa los archivos que le dejes: puedes empezar por una carpeta."
    },
    {
      "etiqueta": "panicThreshold",
      "rol": "Qué pasa con lo que no compila",
      "descripcion": "Saltárselo en silencio, como hasta ahora, o parar el build para que lo veas."
    }
  ]
}
```

Los ejemplos son de la Hípica El Estribo, una escuela de equitación con su cuadra, sus paseos y una pizarra de reservas que lleva años funcionando.

## Qué compila por su cuenta: el modo `infer`

Por defecto, el compilador trabaja en modo `'infer'` (inferir): decide él qué funciones compilar mirando cómo se llaman y qué hacen. Compila una función si **se llama como un componente** (empieza por mayúscula) **o como un Hook** (empieza por `use` y una mayúscula), **y además** crea JSX o llama a otros Hooks. Todo lo demás lo deja como está, sin avisar. El bloque del compilador, el de la lección 68, trabaja siempre en este modo:

```laboratorio
{
  "tipo": "compilador-react",
  "titulo": "Qué decide compilar el modo infer",
  "consigna": "Mira «Qué compiló React»: salen useCuadra, FichaCaballo y Cuadra, pero ni cabecera ni caballosCansados. Ahora escribe 'use memo' como primera línea del cuerpo de caballosCansados: entra en el informe. Fíjate en cómo empieza su salida.",
  "codigo": "import { useState } from 'react'\n\n// Empieza por use y llama a otro Hook\nfunction useCuadra(inicial) {\n  const [cuadra, setCuadra] = useState(inicial)\n  function anotarPaseo(id) {\n    setCuadra(cuadra.map((c) => (c.id === id ? { ...c, paseos: c.paseos + 1 } : c)))\n  }\n  return [cuadra, anotarPaseo]\n}\n\n// Mayúscula y devuelve JSX\nfunction FichaCaballo({ caballo, onAnotar }) {\n  return (\n    <li>\n      {caballo.nombre}: {caballo.paseos} paseos{' '}\n      <button onClick={() => onAnotar(caballo.id)}>Anotar paseo</button>\n    </li>\n  )\n}\n\n// Devuelve JSX, pero empieza por minúscula\nfunction cabecera(titulo) {\n  return <h1>{titulo}</h1>\n}\n\n// Una función normal: ni JSX ni Hooks\nfunction caballosCansados(cuadra) {\n  return cuadra.filter((c) => c.paseos >= 3).map((c) => c.nombre)\n}\n\nexport default function Cuadra() {\n  const [cuadra, anotarPaseo] = useCuadra([\n    { id: 'canela', nombre: 'Canela', paseos: 0 },\n    { id: 'lucero', nombre: 'Lucero', paseos: 2 },\n  ])\n  const cansados = caballosCansados(cuadra)\n\n  return (\n    <main>\n      {cabecera('Hípica El Estribo')}\n      <ul>\n        {cuadra.map((c) => (\n          <FichaCaballo key={c.id} caballo={c} onAnotar={anotarPaseo} />\n        ))}\n      </ul>\n      <p>Descansan: {cansados.join(', ') || 'nadie'}</p>\n    </main>\n  )\n}"
}
```

El informe solo nombra lo que ha intentado compilar: **`cabecera` y `caballosCansados` ni aparecen**. `cabecera` devuelve JSX, pero empieza por minúscula, así que para el compilador no es un componente (tampoco lo sería para React: `<cabecera />` es una etiqueta de HTML, lección 7). `caballosCansados` es una función normal.

## `"use memo"`: compilar una función concreta

Una **directiva** es una cadena de texto suelta al principio de una función, como `'use memo'`, que no hace nada en JavaScript pero que el compilador lee. Con `'use memo'`, `caballosCansados` se compila, y su salida empieza así:

```jsx
function caballosCansados(cuadra) {
  "use memo";

  const $ = _c(2);
```

Recuerda de la lección 68 que `_c` es un Hook. **Al compilarla, has convertido una función normal en algo que solo se puede llamar donde se llaman los Hooks**: en el cuerpo de un componente o de otro Hook, nunca dentro de un manejador de eventos, un `if` o un bucle. Lo verás fallar en los errores típicos.

Por eso react.dev pide no usar `'use memo'` en el modo `infer`: si un componente o un Hook no se compila, **arregla su nombre**. Si `cabecera` es un componente, que se llame `Cabecera` y se use como `<Cabecera titulo="…" />`. Si `caballosCansados` necesita memorizarse, el sitio es el componente que la llama, y eso ya lo hace el compilador.

Donde `'use memo'` tiene sentido es en el modo `'annotation'`, que verás enseguida: ahí es la forma de decir «compila esto».

## `"use no memo"`: dejar fuera un componente

La directiva contraria es la que más vas a usar al adoptar el compilador. **`'use no memo'` saca una función de la compilación**, en cualquier modo y por encima de cualquier otra opción. Es una salida de emergencia temporal: si un componente da problemas compilado, lo apartas mientras buscas la causa.

```laboratorio
{
  "tipo": "compilador-react",
  "titulo": "Una directiva bien puesta, y tres mal puestas",
  "consigna": "Pista lleva la directiva y no se compila. Ahora rómpela de tres formas, de una en una: bájala debajo de la línea de const clases, escríbela con comillas invertidas (`use no memo`) y escríbela con una errata (use nomemo). Después de cada cambio, mira el informe.",
  "codigo": "import { useState } from 'react'\n\nconst HORARIO = [\n  { hora: '18:00', grupo: 'Iniciación' },\n  { hora: '10:00', grupo: 'Paseo por el pinar' },\n  { hora: '12:00', grupo: 'Salto' },\n]\n\n// TODO: quitar la directiva cuando Pista deje de ordenar el horario que recibe\nfunction Pista({ horario }) {\n  'use no memo'\n  const clases = horario.sort((a, b) => a.hora.localeCompare(b.hora))\n\n  return (\n    <ul>\n      {clases.map((clase) => (\n        <li key={clase.hora}>\n          {clase.hora}: {clase.grupo}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function Horario() {\n  const [abierto, setAbierto] = useState(true)\n\n  return (\n    <section>\n      <button onClick={() => setAbierto(!abierto)}>\n        {abierto ? 'Ocultar' : 'Ver'} el horario\n      </button>\n      {abierto && <Pista horario={HORARIO} />}\n    </section>\n  )\n}"
}
```

Con la directiva en su sitio, el informe dice:

```text
Pista: no se compiló · Skipped due to '[object Object]' directive.
Horario: compilado
```

Es decir: «Se ha saltado por la directiva…». En ese hueco el compilador quiere escribir el nombre de la directiva, pero le sale `[object Object]`: un pequeño fallo de su propio mensaje en la versión 1.0.0. Lo que importa es «Skipped».

En los tres casos rotos, `Pista` vuelve a «compilado» **sin ningún aviso**: una directiva mal escrita no da error, simplemente no es una directiva. Las reglas:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La primera línea del cuerpo",
      "texto": "Antes de cualquier otra instrucción de la función. Los comentarios sí pueden ir delante. Después de otra línea ya no es una directiva: es una cadena suelta que no hace nada."
    },
    {
      "titulo": "Con comillas simples o dobles",
      "texto": "Nunca con comillas invertidas: entre acentos graves es una plantilla de texto, no una directiva."
    },
    {
      "titulo": "El texto exacto",
      "texto": "'use memo' o 'use no memo' (también vale su nombre antiguo, 'use no forget'). Una errata no da error: se ignora sin más."
    },
    {
      "titulo": "Con su porqué",
      "texto": "react.dev pide acompañar cada 'use no memo' de un comentario con el motivo y una tarea pendiente para quitarlo, como el TODO de Pista. Es temporal: el problema de fondo sigue ahí."
    }
  ]
}
```

### Para un archivo entero

Las directivas también pueden ir en la primera línea de un archivo, antes de los `import`. Un `'use no memo'` ahí deja fuera **todas** las funciones del archivo, incluso las que lleven `'use memo'` dentro. Pruébalo en el bloque «Una directiva bien puesta, y tres mal puestas»: escríbelo encima del `import`, y en la salida no quedará ni un `_c`.

Dos avisos, comprobados con la versión 1.0.0:

- **El informe engaña en ese caso.** Seguirá diciendo «Horario: compilado», porque el compilador analiza cada función igualmente y después descarta el resultado. Lo que manda es la salida.
- **`'use memo'` arriba del archivo no hace nada.** react.dev lo documenta para compilar todas las funciones de un archivo, pero con `babel-plugin-react-compiler` 1.0.0 no tiene efecto: ni en el modo `infer` compila funciones como `cabecera`, ni en el modo `annotation` compila nada. Pon la directiva dentro de cada función.

## Los modos: `infer`, `annotation` y `all`

La opción `compilationMode` cambia la regla general. Se pasa al preset de la lección 68, dentro de `reactCompilerPreset({ … })`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import react, { reactCompilerPreset } from '@vitejs/plugin-react'\nimport babel from '@rolldown/plugin-babel'\nimport { defineConfig } from 'vite'\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [\n    react(),\n    babel({ presets: [reactCompilerPreset({ compilationMode: 'annotation' })] })\n  ],\n})",
  "anotaciones": [
    {
      "fragmento": "reactCompilerPreset({",
      "nota": "Las opciones del compilador van en este objeto. Es el mismo vite.config.js de la plantilla react-compiler, con una opción añadida."
    },
    {
      "fragmento": "compilationMode: 'annotation'",
      "nota": "Solo se compilan las funciones que llevan 'use memo'. Nada cambia hasta que marcas un componente. Además, con este modo el preset solo le pasa a Babel los archivos que contienen el texto use memo: el resto ni se analiza."
    }
  ]
}
```

Con el código del bloque «Qué decide compilar el modo infer», sin directivas, cada modo compila esto (comprobado con el compilador 1.0.0 y `@babel/core`, porque el bloque siempre trabaja en modo `infer`):

- **`'infer'`**, el de siempre: `useCuadra`, `FichaCaballo` y `Cuadra`.
- **`'annotation'`**: ninguna, hasta que alguna lleve `'use memo'`. En un proyecto de Vite de prueba con este `vite.config.js`, un componente con la directiva salió compilado y el resto, tal cual.
- **`'all'`**: las cinco, también `cabecera` y `caballosCansados`. Compila todas las funciones de primer nivel del archivo, y react.dev lo desaconseja: compila funciones que no tienen nada que ver con React, y ya has visto que eso puede convertirlas en Hooks. La salida de `cabecera` en este modo empieza por `const $ = _c(2);`.
- **`'syntax'`**: solo para proyectos con Flow, que tiene una sintaxis propia para componentes y Hooks. No funciona con TypeScript.

El modo `annotation` es la forma más prudente de empezar: marcas con `'use memo'` unos pocos componentes, los pruebas y vas añadiendo. Su inconveniente también es claro: hay que acordarse de marcar cada componente y cada Hook nuevos.

## Por carpetas: `include`

Otra forma de empezar es por una parte de la aplicación: la pantalla nueva, la que tiene tests, la que más se usa. En Vite, el plugin `@rolldown/plugin-babel` acepta la opción `include`, y solo pasa por Babel, y por tanto por el compilador, los archivos que casan con ella:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import react, { reactCompilerPreset } from '@vitejs/plugin-react'\nimport babel from '@rolldown/plugin-babel'\nimport { defineConfig } from 'vite'\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [\n    react(),\n    babel({\n      include: /\\/src\\/reservas\\//,\n      presets: [reactCompilerPreset()],\n    }),\n  ],\n})",
  "anotaciones": [
    {
      "fragmento": "include: /\\/src\\/reservas\\//,",
      "nota": "Una expresión regular sobre la ruta de cada archivo: solo se compila lo que está dentro de src/reservas. En un proyecto de prueba, un componente de esa carpeta llegó al navegador con su _c y uno de otra carpeta, sin tocar."
    },
    {
      "fragmento": "presets: [reactCompilerPreset()],",
      "nota": "El compilador, con sus opciones por defecto: modo infer y saltarse lo que no puede compilar. Dentro de la carpeta, compila como siempre."
    }
  ]
}
```

Cuando confíes, añade más carpetas a la expresión o quita la línea. Si tu proyecto usa Babel directamente, react.dev hace lo mismo con la opción `overrides` de `babel.config.js`.

Hay una tercera vía, la opción `gating`: el compilador genera las dos versiones de cada componente, la compilada y la original, y elige una al cargar la página según una función tuya, por ejemplo un interruptor de configuración. Sirve para activarlo solo para una parte de los usuarios y comparar. A cambio, el código va dos veces en el bundle.

## `panicThreshold`: saltar o parar

Hasta ahora, lo que rompe las reglas se quedaba sin compilar en silencio. Eso lo decide la opción `panicThreshold` («umbral de pánico»), con tres valores:

- **`'none'`**, el valor por defecto: se salta lo que no puede compilar y sigue. Es lo que react.dev recomienda, y en producción siempre.
- **`'critical_errors'`**: para el build cuando encuentra un error crítico.
- **`'all_errors'`**: para el build con cualquier diagnóstico del compilador.

Con `reactCompilerPreset({ panicThreshold: 'critical_errors' })` y una tarjeta de caballo que modifica su prop, `npm run build` se para así (Vite 8.3.5, recortado):

```text
✗ Build failed in 109ms
error during build:
Build failed with 1 error:

[plugin @rolldown/plugin-babel] …/src/TarjetaCaballo.jsx
RolldownError: [BabelError] Found 1 error:

Error: This value cannot be modified

Modifying component props or hook arguments is not allowed. Consider using a local variable instead.

  1 | export default function TarjetaCaballo({ caballo }) {
> 2 |   caballo.visto = true
    |   ^^^^^^^ value cannot be modified
  3 |   return <h2>{caballo.nombre}</h2>
  4 | }
```

Es el mismo mensaje del informe de la lección 68, ahora con la línea señalada. Sirve un rato, en desarrollo, para buscar lo que se queda fuera. Para el día a día tienes algo mejor, que no para nada y te lo dice mientras escribes: el linter, en la lección 70.

## Cuando algo funciona sin compilador y falla con él

La lección 68 te enseñó lo que el compilador no compila. Lo peligroso es lo contrario: **código que rompe las reglas de una forma que el compilador no detecta**. Lo compila, memoriza, y lo que funcionaba deja de funcionar. react.dev lo llama un fallo en ejecución, y casi siempre tiene la misma causa: el código dependía de que React lo ejecutara entero en cada render, y ahora una parte se guarda.

La cuadra lleva la cuenta de los paseos de cada caballo, y el compilador está activado:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los paseos que no se apuntan",
  "consigna": "Pulsa «Paseo de Lucero» dos veces: «Paseos de hoy» sube, pero Lucero sigue en 0. Mira el árbol y el panel «Linter». Después escribe 'use no memo' como primera línea del cuerpo de App y vuelve a probar. Cuando lo hayas visto, quita la directiva y arregla anotarPaseo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst CUADRA_INICIAL = [\n  { id: 'canela', nombre: 'Canela', paseos: 0 },\n  { id: 'lucero', nombre: 'Lucero', paseos: 0 },\n  { id: 'bruma', nombre: 'Bruma', paseos: 0 },\n]\n\nexport default function App() {\n  const [cuadra, setCuadra] = useState(CUADRA_INICIAL)\n  const [paseosHoy, setPaseosHoy] = useState(0)\n\n  function anotarPaseo(id) {\n    const caballo = cuadra.find((c) => c.id === id)\n    caballo.paseos += 1\n    setCuadra(cuadra)\n    setPaseosHoy((n) => n + 1)\n  }\n\n  return (\n    <main>\n      <h1>Hípica El Estribo</h1>\n      <p>Paseos de hoy: {paseosHoy}</p>\n      <ul className=\"cuadra\" aria-label=\"Cuadra\">\n        {cuadra.map((caballo) => (\n          <li key={caballo.id}>\n            {caballo.nombre}: {caballo.paseos} {caballo.paseos === 1 ? 'paseo' : 'paseos'}{' '}\n            <button onClick={() => anotarPaseo(caballo.id)}>Paseo de {caballo.nombre}</button>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  font-family: system-ui, sans-serif;\n  color: #292524;\n  background: #fdf8f3;\n  border-radius: 10px;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #9a3412;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.05rem;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.3rem 0.65rem;\n  font: inherit;\n  border: 1px solid #c2410c;\n  border-radius: 6px;\n  background: #ffedd5;\n  cursor: pointer;\n}\n\n.cuadra,\n.pizarra ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.cuadra li,\n.pizarra li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cuadra li button {\n  margin: 0;\n}\n\n.pizarra {\n  margin-top: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #78716c;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "mostrarLint": true,
  "compilador": true
}
```

react.dev propone ir por pasos:

**1. Confirma que es el compilador.** El árbol da la primera pista: con cada clic, `App` ← «cambió su estado n.º 2», así que se ha renderizado, pero hay **un solo cambio en el DOM**, el contador de paseos. La lista se ha quedado como estaba. Con `'use no memo'` en `App`, todo funciona: el fallo aparece al compilar. Apartar el componente sospechoso con la directiva es el primer paso de react.dev; si el fallo desaparece, casi seguro que hay una regla rota.

**2. Busca la regla rota.** Mira primero el linter: aquí no marca nada. El compilador tampoco ha visto nada raro: ha compilado `App`. Toca repasarlo a mano con lo que el compilador da por hecho: que el render solo lee props, estado y contexto; que nada de eso se cambia en su sitio; que no hay `Date.now()` ni `Math.random()` en el render. Aquí está en `anotarPaseo`: `caballo.paseos += 1` cambia un objeto del estado, y `setCuadra(cuadra)` pasa el mismo array.

Sin compilador funcionaba de casualidad: `setPaseosHoy` provocaba un render y `App` volvía a recorrer `cuadra` entera, ya cambiada por dentro. Compilado, la lista queda guardada mientras `cuadra` sea el mismo array, y lo es. Es el `memo` que se quedaba con la foto vieja de la lección 67, sin ningún `memo` escrito.

**3. Arréglalo** como en las lecciones 20 y 21: un array nuevo, con un objeto nuevo para el caballo.

```jsx
function anotarPaseo(id) {
  setCuadra(cuadra.map((c) => (c.id === id ? { ...c, paseos: c.paseos + 1 } : c)))
  setPaseosHoy((n) => n + 1)
}
```

**4. Quita la directiva y comprueba.** Compilado y sin `'use no memo'`, Lucero suma sus paseos, y el árbol dice «cambió su estado n.º 1 · cambió su estado n.º 2»: ahora cambian de verdad los dos estados. En tu proyecto, `App` vuelve a tener su «Memo ✨».

### Por qué el linter no lo vio

Escribe la misma mutación sin el `find`: `cuadra[cuadra.findIndex((c) => c.id === id)].paseos += 1`. Ahora el linter la marca, con la regla `immutability`:

```text
Error: This value cannot be modified

Modifying a value returned from 'useState()', which should not be modified directly. Use the setter function to update instead.
```

Es decir: «No se debe modificar directamente un valor que devuelve `useState()`: usa su función `set`». Y el compilador, que usa el mismo análisis, se salta `App`: sin compilar, la lista vuelve a funcionar, aunque el código sigue mal. Con el `find` de por medio, ninguno de los dos se da cuenta de que `caballo` sale del estado. **El linter y el compilador cazan muchos casos, pero no todos**: el resto depende de que conozcas las reglas.

Y un detalle que lo hace más traicionero: si `anotarPaseo` usa `setPaseosHoy(paseosHoy + 1)` en vez de la función actualizadora, el fallo no se ve. La función pasa a depender de `paseosHoy`, cambia en cada clic, y con ella se vuelve a calcular la lista. Con una regla rota, que funcione o no depende de detalles de cómo memoriza el compilador. Por eso react.dev recomienda fijar su versión si tienes pocos tests (lección 68): una versión nueva puede memorizar de otra forma.

### Otro clásico: la hora en el render

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function RelojPista() {\n  const [, setTic] = useState(0)\n\n  // Un render por segundo, para que la hora avance\n  useEffect(() => {\n    const id = setInterval(() => setTic((t) => t + 1), 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return <p>En la pista son las {new Date().toLocaleTimeString('es-ES')}</p>\n}\n\n// Con el compilador activado, ¿qué enseña el reloj?",
  "opciones": [
    "La hora, que avanza cada segundo",
    "La hora a la que se montó, siempre la misma",
    "Un error: el compilador no deja usar new Date()",
    "La hora, que avanza de dos en dos segundos por StrictMode"
  ],
  "correcta": 1,
  "explicacion": "El <p> no depende de nada que el compilador vea cambiar: ni props ni estado (el tic no se lee). Lo guarda en un hueco que se rellena una sola vez, y RelojPista se renderiza cada segundo para devolver lo mismo: el árbol diría «cambió su estado» con 0 cambios en el DOM. El linter tampoco avisa: su regla purity marca Date.now() en el render, pero no new Date()."
}
```

La regla rota es la de la idempotencia: **un componente tiene que devolver lo mismo con las mismas props, estado y contexto**, y `new Date()` cambia en cada llamada. react.dev propone guardar la hora en un estado y ponerla al día desde el efecto: `useState(() => new Date())` y, en el intervalo, `setAhora(new Date())`. Así el render solo lee el estado, y el compilador sabe cuándo cambia.

## Una estrategia para una aplicación que ya existe

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "De cero a todo compilado",
  "items": [
    {
      "titulo": "Activa el linter",
      "texto": "El preset recommended-latest de eslint-plugin-react-hooks (lección 70) no necesita el compilador instalado. Te dice dónde se rompen las reglas antes de compilar nada."
    },
    {
      "titulo": "Elige por dónde empezar",
      "texto": "Modo annotation y 'use memo' en unos pocos componentes, o include con una carpeta. Mejor componentes con tests y que se usen mucho, para notar la diferencia."
    },
    {
      "titulo": "Prueba y mide",
      "texto": "Pasa los tests, prueba a mano lo que cambia, busca la insignia «Memo ✨» y compara con el Profiler y el build de producción, como en la lección 65."
    },
    {
      "titulo": "Amplía",
      "texto": "Más componentes o más carpetas. Cuando la mayoría ya esté compilada, pasa al modo infer sin include: todo dentro por defecto."
    },
    {
      "titulo": "Aparta lo que falle",
      "texto": "Un 'use no memo' con su TODO en cada componente que dé problemas, mientras encuentras la regla rota con los pasos de la sección anterior."
    },
    {
      "titulo": "Limpia",
      "texto": "Quita las directivas a medida que arreglas cada caso, deja panicThreshold en none y fija la versión del compilador si tus tests no cubren lo suficiente."
    }
  ]
}
```

## Errores típicos

**Usar `'use memo'` en una función normal.** La salida de `caballosCansados` ya te avisaba: compilada, lleva dentro el Hook `_c`. Aquí `totalPaseos` se llama dos veces: al renderizar, donde funciona, y desde un manejador de eventos:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una función que se convirtió en Hook",
  "consigna": "Pulsa «Avisar al herrador» y lee el error debajo de la vista previa. Después quita la directiva 'use memo' de totalPaseos y vuelve a pulsar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst CUADRA = [\n  { id: 'canela', nombre: 'Canela', paseos: 3 },\n  { id: 'lucero', nombre: 'Lucero', paseos: 2 },\n  { id: 'bruma', nombre: 'Bruma', paseos: 1 },\n]\n\nfunction totalPaseos(cuadra) {\n  'use memo'\n  return cuadra.reduce((suma, c) => suma + c.paseos, 0)\n}\n\nexport default function App() {\n  const [aviso, setAviso] = useState('')\n  const total = totalPaseos(CUADRA)\n\n  function avisar() {\n    setAviso(`Aviso enviado: hoy van ${totalPaseos(CUADRA)} paseos`)\n  }\n\n  return (\n    <main>\n      <h1>Hípica El Estribo</h1>\n      <p>Paseos de hoy: {total}</p>\n      <button onClick={avisar}>Avisar al herrador</button>\n      {aviso && <p role=\"status\">{aviso}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  font-family: system-ui, sans-serif;\n  color: #292524;\n  background: #fdf8f3;\n  border-radius: 10px;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #9a3412;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.05rem;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.3rem 0.65rem;\n  font: inherit;\n  border: 1px solid #c2410c;\n  border-radius: 6px;\n  background: #ffedd5;\n  cursor: pointer;\n}\n\n.cuadra,\n.pizarra ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.cuadra li,\n.pizarra li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cuadra li button {\n  margin: 0;\n}\n\n.pizarra {\n  margin-top: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #78716c;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "compilador": true
}
```

El aviso no sale, y debajo de la vista previa aparece el error de la lección 64:

```text
Invalid hook call. Hooks can only be called inside of the body of a function component.
```

Es decir: «Llamada a un Hook no válida. Los Hooks solo se pueden llamar dentro del cuerpo de un componente». Dentro del render, `totalPaseos` es una llamada más del componente; dentro de `avisar`, llama a `_c` fuera de cualquier render. Sin la directiva, el compilador no la toca y todo funciona. Y si de verdad hiciera falta memorizarla, el sitio sería el componente, que el compilador ya memoriza.

**Dejar `'use no memo'` para siempre.** La directiva aparta el síntoma, no la causa: la regla sigue rota, y puede notarse en otro sitio o con otra versión del compilador. Ponla con un comentario que diga por qué y cuándo quitarla, y quítala.

**Escribir la directiva donde no toca.** Debajo de otra línea, con comillas invertidas o con una errata, no hace nada y no avisa. Si un componente sigue compilándose con su `'use no memo'`, revísalo con el bloque «Una directiva bien puesta, y tres mal puestas».

**Dejar `panicThreshold` estricto en producción.** Con `'critical_errors'` o `'all_errors'`, un solo componente que el compilador no entiende para el despliegue. react.dev pide `'none'` en producción, siempre.

**Usar `'all'` para «compilar más».** Lo que no compila en el modo `infer` suele ser lo que no es un componente ni un Hook. El modo `'all'` lo compila igualmente y, si encuentra algo que memorizar, lo convierte en algo que solo se puede llamar como un Hook.

## Ejercicios

La pizarra de reservas de la hípica funcionaba hasta que activaron el compilador: ahora, al reservar, no aparece nada. Y hay un fallo más antiguo que nadie había arreglado: al pasar al día siguiente, siguen ahí las reservas de ayer. Cada día es una pizarra nueva, porque `App` le pone `key={dia}` (lección 26).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La pizarra de reservas",
  "consigna": "Reserva un par de paseos y mira el árbol: Pizarra se renderiza, pero no cambia nada en el DOM. Encuentra la regla que rompe Pizarra.jsx y arréglala sin 'use no memo': que funcione compilada y que cada día empiece con la pizarra vacía. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Pizarra from './Pizarra'\nimport './estilos.css'\n\nconst DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']\n\nexport default function App() {\n  const [dia, setDia] = useState(0)\n\n  return (\n    <main>\n      <h1>Hípica El Estribo</h1>\n      <p>\n        Hoy es {DIAS[dia % 7]}.{' '}\n        <button onClick={() => setDia(dia + 1)}>Pasar al día siguiente</button>\n      </p>\n      {/* Una pizarra nueva cada día: la key la reinicia */}\n      <Pizarra key={dia} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Pizarra.jsx",
      "codigo": "import { useReducer } from 'react'\n\nconst CABALLOS = ['Canela', 'Lucero', 'Bruma']\n\n// Las reservas, fuera de React desde la primera versión de la pizarra\nconst reservas = []\n\n// Los dos fallos tienen la misma causa: arréglala aquí, sin 'use no memo'\nexport default function Pizarra() {\n  // Un truco heredado para obligar a React a repintar\n  const [, forzar] = useReducer((n) => n + 1, 0)\n\n  function reservar(caballo) {\n    reservas.push({ turno: reservas.length + 1, caballo })\n    forzar()\n  }\n\n  return (\n    <section className=\"pizarra\">\n      <h2>Reservas de hoy</h2>\n      <div>\n        {CABALLOS.map((caballo) => (\n          <button key={caballo} onClick={() => reservar(caballo)}>\n            Reservar a {caballo}\n          </button>\n        ))}\n      </div>\n      <p>Reservas: {reservas.length}</p>\n      <ol aria-label=\"Turnos\">\n        {reservas.map((r) => (\n          <li key={r.turno}>{r.caballo}</li>\n        ))}\n      </ol>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  font-family: system-ui, sans-serif;\n  color: #292524;\n  background: #fdf8f3;\n  border-radius: 10px;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n  color: #9a3412;\n}\n\nh2 {\n  margin: 0.75rem 0 0.4rem;\n  font-size: 1.05rem;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.3rem 0.65rem;\n  font: inherit;\n  border: 1px solid #c2410c;\n  border-radius: 6px;\n  background: #ffedd5;\n  cursor: pointer;\n}\n\n.cuadra,\n.pizarra ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.cuadra li,\n.pizarra li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cuadra li button {\n  margin: 0;\n}\n\n.pizarra {\n  margin-top: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #78716c;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "Pizarra.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "compilador": true,
  "comprobaciones": [
    {
      "descripcion": "Al reservar a Lucero, aparece en los turnos",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar a Lucero"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lucero"
      }
    },
    {
      "descripcion": "Con dos reservas, la pizarra dice «Reservas: 2»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar a Lucero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar a Bruma"
          }
        }
      ],
      "espera": {
        "texto": "Reservas: 2"
      }
    },
    {
      "descripcion": "Al pasar al día siguiente, la pizarra empieza vacía",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar a Lucero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pasar al día siguiente"
          }
        }
      ],
      "espera": {
        "texto": "Reservas: 0"
      }
    },
    {
      "descripcion": "Las reservas de ayer no vuelven a aparecer al reservar hoy",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar a Lucero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pasar al día siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar a Canela"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Lucero"
        }
      }
    }
  ]
}
```

El árbol lo delata desde el primer clic: `Pizarra` ← «cambió su estado», el del truco de `forzar`, con **0 cambios en el DOM**. El compilador guarda el `<p>` y la lista en huecos que se rellenan una sola vez (la marca `memo_cache_sentinel` de la lección 68), porque no dependen de nada que él vea cambiar: `reservas` vive fuera del componente, y para él es una constante. La regla rota es la misma de la cuadra, con otra cara: el render lee un valor que cambia y que no es ni props, ni estado, ni contexto.

Y el fallo antiguo sale de lo mismo. La `key` reinicia el estado de `Pizarra` (lección 26), pero `reservas` no es su estado: es una variable del módulo que sobrevive a todas las pizarras. Al mover las reservas a un `useState` dentro de `Pizarra`, se arreglan los dos, y `forzar` sobra.

Las comprobaciones se ejecutan sobre el código compilado, como la vista previa. Las dos primeras fallan con el compilador; las dos últimas, con compilador o sin él. Por eso un `'use no memo'` en `Pizarra` no basta: las dos primeras pasarían y las últimas no. Lo que las comprobaciones no ven es si `Pizarra` se compila; para eso, mira el árbol (con cada reserva, ahora sí cambia el DOM) o pega `Pizarra.jsx` en un bloque del compilador.

Si la pizarra tuviera que compartirse entre componentes de verdad, fuera de React, la herramienta sería `useSyncExternalStore` con una instantánea nueva en cada cambio (lección 46). Aquí basta un estado.

**Retos para seguir practicando** (sin comprobación automática):

1. En «Los paseos que no se apuntan», escribe la mutación como `cuadra[cuadra.findIndex((c) => c.id === id)].paseos += 1` y mira qué dicen el linter y el árbol. ¿Por qué ahora la lista se actualiza, si el código sigue mal?
2. En «Qué decide compilar el modo infer», cambia el nombre de `caballosCansados` a `useCaballosCansados`. ¿Aparece en el informe? ¿Y si dentro usas `useMemo`? Repasa la regla del modo `infer` para explicarlo.
3. En «Los paseos que no se apuntan», sustituye `App.jsx` por el reloj de la pista (con sus `import` de `useState` y `useEffect`), comprueba que se queda parado y arréglalo con la hora en un estado, como propone react.dev.
4. En un proyecto creado con `--template react-compiler`, pon `compilationMode: 'annotation'`, marca con `'use memo'` un solo componente y comprueba en las React DevTools cuál lleva «Memo ✨».

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Incremental Adoption",
      "descripcion": "Las tres formas de adoptar el compilador poco a poco: por carpetas con overrides de Babel, con el modo annotation y con gating.",
      "url": "https://react.dev/learn/react-compiler/incremental-adoption",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Directives",
      "descripcion": "\"use memo\" y \"use no memo\": dónde se colocan, cómo interactúan con cada modo y cómo documentarlas para quitarlas después.",
      "url": "https://react.dev/reference/react-compiler/directives",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "compilationMode",
      "descripcion": "Los modos infer, annotation, syntax y all, con ejemplos de qué compila cada uno y por qué un componente puede no compilarse en infer.",
      "url": "https://react.dev/reference/react-compiler/compilationMode",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "panicThreshold",
      "descripcion": "Qué hacer con lo que no compila: saltarlo o parar el build, y por qué en producción siempre none.",
      "url": "https://react.dev/reference/react-compiler/panicThreshold",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Debugging and Troubleshooting",
      "descripcion": "Errores del compilador frente a fallos en ejecución, los patrones que suelen romperse y los pasos para encontrar la causa.",
      "url": "https://react.dev/learn/react-compiler/debugging",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Components and Hooks must be idempotent",
      "descripcion": "La regla que rompen la hora en el render y los valores de fuera del componente, con el reloj que se queda parado y su arreglo.",
      "url": "https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent",
      "etiqueta": "react.dev"
    }
  ]
}
```
