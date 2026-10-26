# Estilos en React: `className`, `style`, CSS Modules y Tailwind

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `estilos-en-react-classname-style-css-modules-y-tailwind` (autogenerado del título)
- **Orden:** 790
- **Fuentes:** [Common components](https://react.dev/reference/react-dom/components/common) + [Vite: CSS Modules](https://vite.dev/guide/features#css-modules) + [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite) — ver `contenido/react/TEMARIO.md` #79

---

## Qué es y para qué sirve

React no trae un sistema de estilos. Lo único que hace es poner en el DOM lo que le pides: un atributo `class` con lo que escribes en `className` y un atributo `style` con el objeto de `style`. Todo lo demás, **dónde escribes el CSS, cómo se llaman las clases y cómo evitas que choquen**, lo decide la herramienta que elijas. Y hay varias, porque el CSS de una aplicación con cientos de componentes tiene problemas que una página suelta no tiene.

> **Elegir cómo dar estilos en React es elegir dónde vive el CSS y quién se encarga de que los nombres de clase no choquen; lo que llega al navegador es siempre CSS normal.**

Las cuatro formas que te vas a encontrar:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde se escribe el CSS",
  "roles": [
    {
      "etiqueta": "CSS global",
      "rol": "Archivos .css con nombres a mano",
      "descripcion": "Lo de siempre: clases en un .css que se importa. Sin herramientas, pero todas las clases son de todos, y evitar choques depende de cómo las nombres."
    },
    {
      "etiqueta": "CSS Modules",
      "rol": "Archivos .module.css",
      "descripcion": "CSS normal, pero cada clase recibe un nombre único al compilar. Vite lo trae de serie: ningún choque posible entre componentes."
    },
    {
      "etiqueta": "Tailwind",
      "rol": "Clases de utilidad en el JSX",
      "descripcion": "Casi no escribes CSS: combinas clases pequeñas, como px-4 o bg-sky-700, y la herramienta genera solo el CSS de las que usas."
    },
    {
      "etiqueta": "CSS-in-JS",
      "rol": "CSS dentro del JavaScript",
      "descripcion": "Librerías como styled-components o Emotion: el CSS se escribe en el componente y se inyecta al ejecutarse. Muy usado durante años; hoy ha perdido terreno frente a las demás."
    }
  ]
}
```

## `className` y `style`, aplicados a un componente

Lo básico ya lo tienes: `className` en lugar de `class` (lección 5), `style` con un objeto en camelCase (lección 6) y clases que dependen de una condición, con un ternario o con un array que se filtra y se une (lección 10). Lo que cambia en una aplicación es la escala: un mismo componente tiene **variantes** que dependen de sus props, y algunos valores **vienen de los datos**.

El muro norte del Rocódromo El Desplome tiene cuatro vías. Cada una está abierta, es nueva o está cerrada, y cada grado tiene su color de presa, que viene del propio dato:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Variantes con clases, colores con una variable CSS",
  "consigna": "Cambia el estado de «Placa gris» a nueva y el color de «El techo». Después pasa el ratón por encima de una vía: el resalte del :hover usa el color de cada vía, algo que no se puede escribir dentro de style.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './vias.css'\n\nconst VIAS = [\n  { id: 'espolon', nombre: 'Espolón norte', grado: '6a', color: '#16a34a', estado: 'abierta' },\n  { id: 'techo', nombre: 'El techo', grado: '7a', color: '#dc2626', estado: 'nueva' },\n  { id: 'placa', nombre: 'Placa gris', grado: '5c', color: '#2563eb', estado: 'cerrada' },\n  { id: 'diedro', nombre: 'Diedro de la cueva', grado: '6b+', color: '#9333ea', estado: 'abierta' },\n]\n\n// Cada estado, con su clase y su texto: añadir uno es añadir una línea\nconst ESTADOS = {\n  abierta: { clase: 'via--abierta', texto: 'Abierta' },\n  nueva: { clase: 'via--nueva', texto: 'Nueva esta semana' },\n  cerrada: { clase: 'via--cerrada', texto: 'Cerrada por mantenimiento' },\n}\n\nfunction TarjetaVia({ via }) {\n  const estado = ESTADOS[via.estado]\n  return (\n    <li className={`via ${estado.clase}`} style={{ '--color-grado': via.color }}>\n      <span className=\"via__grado\">{via.grado}</span>\n      <div>\n        <h2 className=\"via__nombre\">{via.nombre}</h2>\n        <p className=\"via__estado\">{estado.texto}</p>\n      </div>\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Rocódromo El Desplome · Muro norte</h1>\n      <ul className=\"vias\">\n        {VIAS.map((via) => (\n          <TarjetaVia key={via.id} via={via} />\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "vias.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\n.vias {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.via {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-left: 6px solid var(--color-grado);\n  border-radius: 8px;\n}\n\n.via:hover {\n  box-shadow: 0 0 0 2px var(--color-grado);\n}\n\n.via__grado {\n  min-width: 2.6rem;\n  padding: 0.15rem 0.4rem;\n  border-radius: 6px;\n  background: var(--color-grado);\n  color: #ffffff;\n  font-weight: 700;\n  text-align: center;\n}\n\n.via__nombre {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.via__estado {\n  margin: 0.1rem 0 0;\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.via--nueva {\n  background: #fefce8;\n}\n\n.via--nueva .via__estado {\n  color: #a16207;\n  font-weight: 600;\n}\n\n.via--cerrada {\n  opacity: 0.55;\n  border-style: dashed;\n  border-left-style: solid;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Dos decisiones que merece la pena copiar:

- **Las variantes, en un objeto.** `ESTADOS` dice qué clase y qué texto lleva cada estado. El componente no tiene ningún `if`: busca y aplica. Si mañana hay un estado «en obras», se añade una línea al objeto y una regla al CSS.
- **El dato, en una variable CSS.** `style={{ '--color-grado': via.color }}` no pinta nada por sí mismo: le pasa el valor al CSS, y es el CSS el que decide dónde usarlo (el borde, la insignia, el `:hover`). Las propiedades personalizadas se heredan, así que la insignia, que está dentro del `li`, la ve también. Con `style={{ backgroundColor: via.color }}` solo podrías pintar un elemento, y nunca en `:hover` ni en una media query.

react.dev lo resume así: `style` para los estilos que dependen de valores que no conoces de antemano, y **clases para todo lo demás**, que además es más eficiente. Comprobado con React 19.3.1: las variables CSS se escriben con su nombre tal cual, entre comillas por el guion, y a un número **no** le añade `px` (`'--progreso': 72` queda como `72`, a diferencia de `padding: 8`, que pasa a `8px`).

Fíjate también en los nombres: `via`, `via__grado`, `via--cerrada`. Es la convención **BEM** (bloque, elemento y modificador), una forma de nombrar clases a mano para que no choquen con las de otros componentes. Enseguida verás por qué hace falta.

## CSS global: todas las clases son de todos

Cuando un componente hace `import './vias.css'`, Vite mete ese CSS en una etiqueta `<style>` de la página (al compilar para producción, en un archivo `.css` común). El `import` está en el archivo del componente, pero **el CSS no se queda en el componente**: sus reglas se aplican a toda la página, a cualquier elemento con esa clase. Dos componentes que eligen el mismo nombre de clase se pisan:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos archivos CSS, la misma clase",
  "consigna": "El título de la ficha debería ser grande y verde, pero sale pequeño, rojo y en mayúsculas. Busca por qué en los dos .css. Después arréglalo como haría BEM: renombra las clases a ficha__titulo y aviso__titulo, en cada .jsx y en su .css.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import FichaVia from './FichaVia'\nimport AvisoCierre from './AvisoCierre'\n\nexport default function App() {\n  return (\n    <main style={{ maxWidth: '30rem', fontFamily: 'system-ui, sans-serif' }}>\n      <FichaVia nombre=\"Diedro de la cueva\" grado=\"6b+\" apertura=\"marzo de 2026\" />\n      <AvisoCierre>El muro norte cierra el lunes por cambio de presas.</AvisoCierre>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaVia.jsx",
      "codigo": "import './ficha.css'\n\nexport default function FichaVia({ nombre, grado, apertura }) {\n  return (\n    <article className=\"ficha\">\n      <h2 className=\"titulo\">{nombre}</h2>\n      <p>Grado {grado} · equipada en {apertura}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha.css",
      "codigo": ".ficha {\n  margin-bottom: 0.75rem;\n  padding: 0.6rem 0.9rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.titulo {\n  margin: 0 0 0.3rem;\n  color: #0f766e;\n  font-size: 1.2rem;\n}\n"
    },
    {
      "nombre": "AvisoCierre.jsx",
      "codigo": "import './aviso.css'\n\nexport default function AvisoCierre({ children }) {\n  return (\n    <div className=\"aviso\" role=\"note\">\n      <p className=\"titulo\">Aviso</p>\n      <p>{children}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "aviso.css",
      "codigo": ".aviso {\n  padding: 0.5rem 0.9rem;\n  border-left: 4px solid #b91c1c;\n  background: #fef2f2;\n}\n\n.aviso p {\n  margin: 0.2rem 0;\n}\n\n.titulo {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.8rem;\n  font-weight: 700;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n"
    }
  ],
  "archivoInicial": "aviso.css",
  "strictMode": true,
  "mostrarConsola": false
}
```

Las dos reglas `.titulo` tienen la misma especificidad, así que, en cada propiedad que fijan las dos (el color, el tamaño, el margen), gana **la que llega después** a la página: la de `aviso.css`, que se importa más tarde. Y las que solo fija ella, como `text-transform`, se suman. En un proyecto con cuarenta componentes y tres personas escribiendo CSS, esto pasa sin que nadie lo note hasta que alguien mira la página entera.

Hay una consecuencia menos evidente, y es la base de una de las herramientas de más abajo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<style>\n  .boton--secundario { background: #e7e5e4; color: #1c1917; }\n  .boton--peligro { background: #b91c1c; color: #ffffff; }\n</style>\n\n<!-- secundario va el último en el atributo class -->\n<button class=\"boton--peligro boton--secundario\">\n  Cancelar reserva\n</button>",
  "opciones": [
    "Gris: manda la última clase del atributo class",
    "Rojo: manda la regla que va después en el CSS",
    "Depende del navegador"
  ],
  "correcta": 1,
  "explicacion": "El orden de las clases dentro de class no cuenta para nada. Con la misma especificidad, gana la regla que aparece más tarde en el CSS, y la de peligro va después. Por eso className={\"boton \" + className} no garantiza que la clase que llega de fuera gane: depende del orden del CSS, no del de la cadena."
}
```

Para evitar los choques hay tres caminos. **Nombres con disciplina**, como BEM, que funciona pero depende de que todo el equipo la respete. **Que una herramienta ponga nombres únicos**: CSS Modules. **No escribir clases propias**: Tailwind. Las dos últimas, a continuación.

## CSS Modules: clases con apellido

Un archivo que termina en `.module.css` es un **módulo CSS**. Se escribe como CSS normal, pero al importarlo no se mete tal cual en la página: Vite **renombra cada clase** con un nombre único y te devuelve un objeto que traduce los nombres que escribiste a los que ha generado. Funciona en cualquier proyecto de Vite sin instalar ni configurar nada.

Este es `TarjetaVia.module.css`:

```css
.tarjeta {
  padding: 0.6rem 0.9rem;
  border: 1px solid #d6d3d1;
  border-radius: 10px;
}

.cerrada {
  composes: tarjeta;
  opacity: 0.6;
}

.titulo {
  margin: 0;
  color: #0f766e;
}

.grado-alto {
  font-weight: 700;
}
```

Y el componente que lo usa. Los bloques de esta web no admiten archivos `.module.css`, así que este código no se ejecuta aquí; lo que se cuenta de él está comprobado con Vite 8.3.4:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import estilos from './TarjetaVia.module.css'\n\nexport default function TarjetaVia({ via }) {\n  return (\n    <article className={via.cerrada ? estilos.cerrada : estilos.tarjeta}>\n      <h2 className={estilos.titulo}>{via.nombre}</h2>\n      <p className={via.dificil ? estilos['grado-alto'] : undefined}>Grado {via.grado}</p>\n    </article>\n  )\n}\n\n// Lo que vale estilos con este archivo, en Vite 8:\n// {\n//   tarjeta: '_tarjeta_185eu_1',\n//   cerrada: '_cerrada_185eu_7 _tarjeta_185eu_1',\n//   titulo: '_titulo_185eu_12',\n//   'grado-alto': '_grado-alto_185eu_17',\n// }",
  "anotaciones": [
    {
      "fragmento": "import estilos from './TarjetaVia.module.css'",
      "nota": "Importar un .module.css devuelve un objeto: las claves son los nombres que escribiste y los valores, los que ha generado Vite. El nombre estilos lo eliges tú; en muchos proyectos verás styles o classes."
    },
    {
      "fragmento": "className={estilos.titulo}",
      "nota": "Nunca escribes el nombre real a mano: siempre a través del objeto. Si otro componente tiene su propia clase titulo en su módulo, recibe otro nombre y no se tocan."
    },
    {
      "fragmento": "estilos['grado-alto']",
      "nota": "Una clase con guion no se puede leer con punto: estilos.grado-alto se interpretaría como una resta. Con corchetes, o nombrando las clases en camelCase desde el principio (gradoAlto)."
    },
    {
      "fragmento": "cerrada: '_cerrada_185eu_7 _tarjeta_185eu_1',",
      "nota": "composes: tarjeta hace que la clase cerrada traiga también la de tarjeta. El valor ya lleva los dos nombres, separados por un espacio, y basta con poner uno en className."
    },
    {
      "fragmento": "titulo: '_titulo_185eu_12',",
      "nota": "El nombre generado es un guion bajo, tu clase, un código propio de ese archivo y la línea donde está la regla. Cambia si cambias el archivo, así que no lo uses nunca desde fuera."
    }
  ]
}
```

En la página acaba esto. Fíjate en que `Aviso.module.css`, con su propia regla `.titulo`, recibe otro nombre, y el choque de antes es imposible:

```html
<article class="_cerrada_185eu_7 _tarjeta_185eu_1">
  <h2 class="_titulo_185eu_12">El techo</h2>
  <p class="_grado-alto_185eu_17">Grado 7a</p>
</article>

<!-- La regla .titulo de Aviso.module.css se convierte en ._titulo_ds0jo_1 -->
```

Dos detalles más de los módulos CSS que te encontrarás al leer código:

- **`:global(...)`** deja una clase sin renombrar. `:global(.oscuro) .titulo` se queda como `.oscuro ._titulo_…`: sirve para reaccionar a una clase que pone otra parte de la aplicación, como la del tema.
- **Las variantes se escriben igual que con CSS global**, pero con el objeto: `` className={`${estilos.boton} ${estilos[variante]}`} ``, o con `clsx`, que verás en un momento.

## Tailwind: clases de utilidad en el propio JSX

[Tailwind CSS](https://tailwindcss.com/) le da la vuelta al problema: en lugar de inventar nombres de clase y escribir sus reglas, combinas **clases de utilidad** ya hechas, cada una con una sola tarea, directamente en el `className`. `px-4` pone el relleno horizontal, `rounded-lg` redondea las esquinas, `bg-sky-700` pinta el fondo. Tailwind recorre tus archivos, encuentra las clases que usas y **genera solo el CSS de esas**.

Instalarlo en un proyecto de Vite son tres pasos, según su guía oficial (comprobados con Tailwind 4.3 y Vite 8):

```bash
npm install tailwindcss @tailwindcss/vite
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

```css
/* src/index.css, importado en main.jsx */
@import "tailwindcss";
```

Y así se ve una tarjeta de vía escrita con utilidades. Tampoco se puede ejecutar en esta web, porque necesita el paso de compilación:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const ESTADOS = {\n  abierta: 'border-stone-300 bg-white',\n  nueva: 'border-amber-400 bg-amber-50',\n  cerrada: 'border-dashed border-stone-300 opacity-60',\n}\n\nexport function TarjetaVia({ via }) {\n  return (\n    <li\n      className={`flex items-center gap-3 rounded-lg border p-3 ${ESTADOS[via.estado]} dark:bg-stone-900`}\n    >\n      <span className=\"min-w-10 rounded-md bg-teal-700 px-1.5 text-center font-bold text-white\">\n        {via.grado}\n      </span>\n      <h2 className=\"text-base font-semibold md:text-lg\">{via.nombre}</h2>\n      <button className=\"ml-auto rounded-lg bg-sky-700 px-4 py-2 text-white hover:bg-sky-800 disabled:opacity-50\">\n        Reservar turno\n      </button>\n    </li>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "nueva: 'border-amber-400 bg-amber-50',",
      "nota": "Las variantes, en un objeto, como en el muro norte; pero cada valor es una lista de utilidades en vez de una clase propia. Los nombres van completos: Tailwind busca clases leyendo tus archivos como texto, y solo genera las que encuentra enteras."
    },
    {
      "fragmento": "px-4 py-2",
      "nota": "El espaciado sale de una escala: en Tailwind 4, px-4 genera padding-inline: calc(var(--spacing) * 4), y --spacing vale 0.25rem. Es decir, 1rem a cada lado."
    },
    {
      "fragmento": "bg-sky-700",
      "nota": "Genera background-color: var(--color-sky-700). En Tailwind 4 toda la paleta y todas las medidas son variables CSS, y puedes añadir las tuyas con @theme en el CSS: --color-roca-700 crea bg-roca-700, text-roca-700..."
    },
    {
      "fragmento": "hover:bg-sky-800",
      "nota": "Un prefijo aplica la utilidad solo en un estado. hover: genera la regla dentro de @media (hover: hover), así que solo se aplica en dispositivos con un puntero que puede pasar por encima, no al tocar una pantalla. Lo mismo con focus:, disabled: y muchos más."
    },
    {
      "fragmento": "md:text-lg",
      "nota": "Los prefijos de tamaño hacen el diseño adaptable sin escribir media queries: md:text-lg genera la regla dentro de @media (width >= 48rem), así que el texto crece a partir de esa anchura."
    },
    {
      "fragmento": "dark:bg-stone-900",
      "nota": "dark: aplica la utilidad en modo oscuro. Por defecto, Tailwind 4 la mete en @media (prefers-color-scheme: dark), es decir, sigue la preferencia del sistema. Se puede cambiar para que dependa de una clase, como hace esta web."
    }
  ]
}
```

El precio está a la vista: el JSX se llena de clases y hay que aprender un vocabulario nuevo. La recompensa: no inventas nombres, no hay choques, el CSS que llega al navegador solo contiene lo que usas (el de la tarjeta de arriba, con la base que trae Tailwind, ocupa menos de 7 kB, y algo más de 2 kB comprimido) y quien lee el componente ve su aspecto sin abrir otro archivo. Esta misma web está hecha con Tailwind 4.

## Combinar clases: `clsx` y `tailwind-merge`

En cuanto un componente tiene varias condiciones, montar la cadena de clases a mano se vuelve frágil: espacios dobles, un `false` o un `undefined` que se cuela. react.dev propone para eso una librería diminuta, `classnames`; hoy la más usada es `clsx`, que hace lo mismo y se descarga casi cuatro veces más. Y con Tailwind aparece un segundo problema: el que viste en el predice de arriba. Si el componente pone `px-4` y quien lo usa le pasa `px-6`, **las dos clases acaban en el elemento** y gana la que esté después en el CSS, no la que tú querías. `tailwind-merge` resuelve eso:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { clsx } from 'clsx'\nimport { twMerge } from 'tailwind-merge'\n\n// clsx: une lo verdadero y descarta lo falso\nclsx('boton', activa && 'boton--activa', { 'boton--llena': llena })\n// con activa = true y llena = false → 'boton boton--activa'\n\n// twMerge: si dos utilidades chocan, se queda la última\ntwMerge('px-4 py-2 bg-sky-700', 'px-6')\n// → 'py-2 bg-sky-700 px-6'\n\n// Las dos juntas: el cn() de shadcn/ui, el mismo que usa esta web\nexport function cn(...entradas) {\n  return twMerge(clsx(entradas))\n}\n\nexport function Boton({ variante = 'primaria', className, ...resto }) {\n  return (\n    <button\n      className={cn(\n        'rounded-lg px-4 py-2 font-medium',\n        variante === 'primaria' && 'bg-sky-700 text-white hover:bg-sky-800',\n        variante === 'peligro' && 'bg-red-700 text-white hover:bg-red-800',\n        className,\n      )}\n      {...resto}\n    />\n  )\n}\n\n<Boton className=\"px-6 w-full\">Reservar turno</Boton>\n// → 'rounded-lg py-2 font-medium bg-sky-700 text-white hover:bg-sky-800 px-6 w-full'",
  "anotaciones": [
    {
      "fragmento": "clsx('boton', activa && 'boton--activa', { 'boton--llena': llena })",
      "nota": "clsx acepta textos, objetos (la clave entra si su valor es verdadero) y arrays, y descarta false, null, undefined, 0 y la cadena vacía. Pesa unos pocos cientos de bytes y sirve igual sin Tailwind, con CSS global o con módulos."
    },
    {
      "fragmento": "twMerge('px-4 py-2 bg-sky-700', 'px-6')",
      "nota": "tailwind-merge conoce las utilidades de Tailwind y sabe que px-4 y px-6 hacen lo mismo: quita la primera. Solo tiene sentido con Tailwind; la versión actual de tailwind-merge funciona con Tailwind 4.0 a 4.3."
    },
    {
      "fragmento": "return twMerge(clsx(entradas))",
      "nota": "Primero clsx monta la cadena con las condiciones; después twMerge resuelve los choques. Este cn es el que copian los proyectos con shadcn/ui (lección 80), y está tal cual en el código de esta web."
    },
    {
      "fragmento": "        className,\n      )}",
      "nota": "El className de fuera va el último, para que gane sobre los valores por defecto del componente. Sin twMerge no bastaría con ponerlo al final de la cadena, como viste en el predice."
    },
    {
      "fragmento": "{...resto}",
      "nota": "El resto de props (onClick, type, disabled, aria-label...) pasa tal cual al button. Un componente de botón que no lo hace obliga a añadir una prop nueva cada vez que alguien necesita un atributo."
    }
  ]
}
```

## Temas con variables CSS

En la lección 28, el diario El Eco del Valle cambiaba de tema pasando una clase por contexto a cada componente, y todos los que la leían se renderizaban. Para los colores hay una forma mejor, que ya asomaba en esa lección: **definir los colores como variables CSS y cambiar solo su valor**. Los componentes usan `var(--fondo)` o `var(--texto)`, y no saben nada del tema; la cascada hace el resto.

El contexto sigue haciendo falta para dos cosas: para que cualquier componente pueda **cambiar** el tema, y para los pocos que necesitan saber en su JavaScript cuál está activo, como el botón que lo alterna. Abre el árbol de renders y pulsa «Modo oscuro»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un tema claro y oscuro con variables CSS",
  "consigna": "Pulsa «Modo oscuro» y mira el árbol: ¿qué componentes se renderizan? ¿Cuántos cambios hay en el DOM? Después, en tema.css, cambia --acento del tema oscuro y vuelve a probar: ningún componente se entera.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ProveedorTema, useTema } from './TemaContext'\nimport './tema.css'\n\nconst VIAS = [\n  { id: 'espolon', nombre: 'Espolón norte', grado: '6a', color: '#16a34a', estado: 'abierta' },\n  { id: 'techo', nombre: 'El techo', grado: '7a', color: '#dc2626', estado: 'nueva' },\n  { id: 'placa', nombre: 'Placa gris', grado: '5c', color: '#2563eb', estado: 'cerrada' },\n  { id: 'diedro', nombre: 'Diedro de la cueva', grado: '6b+', color: '#9333ea', estado: 'abierta' },\n]\n\nfunction BotonTema() {\n  const { tema, alternar } = useTema()\n  return (\n    <button className=\"boton\" aria-pressed={tema === 'oscuro'} onClick={alternar}>\n      Modo oscuro\n    </button>\n  )\n}\n\nfunction Cabecera() {\n  return (\n    <header className=\"cabecera\">\n      <h1>Rocódromo El Desplome</h1>\n      <BotonTema />\n    </header>\n  )\n}\n\nfunction TarjetaVia({ via }) {\n  return (\n    <li className=\"tarjeta\" style={{ '--color-grado': via.color }}>\n      <span className=\"grado\">{via.grado}</span>\n      {via.nombre}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <ProveedorTema>\n      <Cabecera />\n      <ul className=\"vias\">\n        {VIAS.map((via) => (\n          <TarjetaVia key={via.id} via={via} />\n        ))}\n      </ul>\n    </ProveedorTema>\n  )\n}\n"
    },
    {
      "nombre": "TemaContext.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst TemaContext = createContext(null)\nTemaContext.displayName = 'Tema'\n\nexport function ProveedorTema({ children }) {\n  const [tema, setTema] = useState('claro')\n\n  function alternar() {\n    setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'))\n  }\n\n  return (\n    <TemaContext value={{ tema, alternar }}>\n      <div className=\"app\" data-tema={tema}>\n        {children}\n      </div>\n    </TemaContext>\n  )\n}\n\nexport function useTema() {\n  return useContext(TemaContext)\n}\n"
    },
    {
      "nombre": "tema.css",
      "codigo": ".app {\n  --fondo: #fafaf9;\n  --superficie: #ffffff;\n  --texto: #1c1917;\n  --borde: #d6d3d1;\n  --acento: #0f766e;\n  color-scheme: light;\n  padding: 0.75rem 1rem;\n  background: var(--fondo);\n  color: var(--texto);\n  font-family: system-ui, sans-serif;\n}\n\n.app[data-tema='oscuro'] {\n  --fondo: #1c1917;\n  --superficie: #292524;\n  --texto: #fafaf9;\n  --borde: #57534e;\n  --acento: #5eead4;\n  color-scheme: dark;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: var(--acento);\n  font-size: 1.2rem;\n}\n\n.boton {\n  padding: 0.35rem 0.7rem;\n  border: 1px solid var(--borde);\n  border-radius: 8px;\n  background: var(--superficie);\n  color: var(--texto);\n  font: inherit;\n}\n\n.boton[aria-pressed='true'] {\n  border-color: var(--acento);\n}\n\n.vias {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid var(--borde);\n  border-left: 6px solid var(--color-grado);\n  border-radius: 8px;\n  background: var(--superficie);\n}\n\n.grado {\n  min-width: 2.6rem;\n  padding: 0.1rem 0.4rem;\n  border-radius: 6px;\n  background: var(--color-grado);\n  color: #ffffff;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "tema.css",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Toda la página cambia de color y el árbol cuenta muy poco:

- `ProveedorTema`: «cambió su estado», y el nodo **Tema**, el proveedor, porque su valor es un objeto nuevo.
- `BotonTema`: «cambió el contexto «Tema»». Es el único que lo lee, para su `aria-pressed`.
- `Cabecera` y las cuatro `TarjetaVia`: **sin cambios**. Llegan como `children` del proveedor (lección 28) y no leen el contexto.
- Cambios en el DOM: **dos**, el atributo `data-tema` del contenedor y el `aria-pressed` del botón. Todo lo demás lo recalcula el navegador a partir de las variables, sin que React toque nada.

Tres detalles del CSS:

- **Todas las variables se definen una vez** en `.app` y se **redefinen** en `.app[data-tema='oscuro']`. Añadir un tercer tema es añadir un bloque de CSS.
- **`color-scheme`** le dice al navegador que use controles nativos (barras de desplazamiento, campos de formulario) en claro o en oscuro.
- **`--color-grado` sigue funcionando** en los dos temas: los datos de cada vía y el tema son variables independientes que el CSS combina.

En una aplicación real, el atributo o la clase del tema van en `<html>`, para que también cambie el fondo de la página, y eso se hace en un efecto (lección 38), que además guarda la elección en `localStorage` y parte de la preferencia del sistema con `matchMedia('(prefers-color-scheme: dark)')`. Es exactamente lo que hace el botón de modo oscuro de esta web: pone o quita la clase `dark` en `<html>`, y su CSS redefine las variables de color con `.dark`. Lo verás con más detalle en la lección 86.

## CSS-in-JS, y por qué ha perdido terreno

Durante años, muchas aplicaciones de React escribieron su CSS dentro del propio JavaScript con librerías como **styled-components** o **Emotion**. Las reconocerás así:

```jsx
import styled from 'styled-components'

const BotonReserva = styled.button`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.$peligro ? '#b91c1c' : '#0f766e')};
  color: white;
`

<BotonReserva $peligro>Cancelar reserva</BotonReserva>
```

Era cómodo: estilos junto al componente, nombres únicos automáticos y valores sacados de las props. El coste estaba en **cuándo** se genera el CSS: al ejecutarse, en el navegador, insertando etiquetas `<style>`. La propia documentación de React, en la página de `useInsertionEffect` (lección 45), desaconseja inyectar `<style>` al ejecutarse por dos motivos: obliga al navegador a recalcular los estilos muchas más veces, y puede ser muy lento si ocurre en un mal momento del ciclo de React. Recomienda CSS en archivos para lo fijo y `style` para lo dinámico, justo lo que has hecho en esta lección.

Los **Server Components** (lección 88) añadieron otro problema: se ejecutan en el servidor, no mandan su código al navegador y no pueden usar contexto, en el que muchas de estas librerías se apoyaban para el tema. Las librerías se han ido adaptando (styled-components dice hoy en su documentación que funciona con Server Components), pero muchos proyectos nuevos han preferido herramientas que generan CSS normal al compilar. En npm se nota: entre septiembre de 2023 y septiembre de 2026, las descargas mensuales de styled-components no llegaron a duplicarse, y las de Tailwind se multiplicaron por casi veinte.

## Cómo elegir

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Para aprender o un proyecto pequeño: CSS global con BEM, o CSS Modules",
      "texto": "Es CSS de siempre, sin vocabulario nuevo. Si el proyecto crece, los módulos de Vite te quitan los choques sin instalar nada: basta con cambiar .css por .module.css."
    },
    {
      "titulo": "Para un equipo que hace muchas pantallas: Tailwind",
      "texto": "Con clsx y tailwind-merge (el cn de antes) y, casi siempre, una librería de componentes encima, como shadcn/ui (lección 80). Es lo que usa esta web."
    },
    {
      "titulo": "Para valores que salen de los datos: style con una variable CSS",
      "texto": "El color de una vía, el porcentaje de una barra, la posición de algo que se arrastra. El dato va a style y el CSS decide cómo usarlo."
    },
    {
      "titulo": "Para temas: variables CSS",
      "texto": "Un bloque de variables por tema y una clase o un atributo en la raíz. Contexto solo para cambiarlo y para los componentes que necesitan saberlo en su JavaScript."
    },
    {
      "titulo": "Para código que ya usa CSS-in-JS",
      "texto": "Se lee y se mantiene sin problema. En un proyecto nuevo, sobre todo si va a usar Server Components, mejor algo que genere el CSS al compilar."
    },
    {
      "titulo": "Un sistema principal, no tres",
      "texto": "Mezclar CSS global, módulos y Tailwind en la misma aplicación multiplica las formas de hacer lo mismo. Elige uno y usa los demás solo para casos concretos, como un CSS global con las variables del tema."
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
      "mito": "Si importo un .css en un componente, sus estilos solo afectan a ese componente",
      "realidad": "Un .css normal se aplica a toda la página, lo importe quien lo importe. Solo los .module.css limitan sus clases a quien los usa, porque les cambian el nombre."
    },
    {
      "mito": "Tailwind es lo mismo que escribir estilos en línea",
      "realidad": "Son clases, no atributos style: admiten hover:, focus:, dark:, tamaños de pantalla y variables del tema, nada de lo cual se puede hacer con style. Y el CSS se genera una sola vez, al compilar."
    },
    {
      "mito": "style es la forma de dar estilos en React",
      "realidad": "react.dev recomienda clases para casi todo y style solo para valores que dependen de los datos. Las clases son más eficientes y permiten pseudoclases y media queries."
    },
    {
      "mito": "El orden de las clases en className decide cuál gana",
      "realidad": "Decide el CSS: con la misma especificidad, gana la regla que aparece después en la hoja de estilos. Para que una clase de fuera gane de verdad, Tailwind necesita tailwind-merge."
    },
    {
      "mito": "Para un modo oscuro hace falta que todos los componentes lean el tema",
      "realidad": "Con variables CSS, solo cambia un atributo en la raíz y el navegador recalcula los colores. Los componentes ni se renderizan, como has visto en el árbol."
    }
  ]
}
```

## Errores típicos

**Montar los nombres de Tailwind con plantillas.** Es lo primero que se le ocurre a cualquiera, y no funciona:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Un proyecto con Tailwind 4 recién instalado\nfunction Insignia({ color, children }) {\n  return (\n    <span className={`bg-${color}-600 rounded px-2 text-white`}>\n      {children}\n    </span>\n  )\n}\n\n<Insignia color=\"violet\">6b+</Insignia>\n\n// Ninguna otra parte del proyecto usa bg-violet-600.\n// ¿Qué fondo tiene la insignia?",
  "opciones": [
    "Violeta: la clase final es bg-violet-600",
    "Ninguno: Tailwind no ha generado la regla de bg-violet-600",
    "Un error al compilar, porque la clase no existe"
  ],
  "correcta": 1,
  "explicacion": "En el navegador la clase sí llega a ser bg-violet-600, pero Tailwind lee tus archivos como texto y no ejecuta la plantilla: nunca ve bg-violet-600 escrita entera, así que no genera su CSS, y no avisa. Comprobado con Tailwind 4.3: las demás utilidades de la insignia se generan y esa no. La solución es un objeto con los nombres completos: { violeta: \"bg-violet-600\" }."
}
```

**Un componente que se traga el `className`.** Si `Boton` no recibe `className` o no lo pasa al `button`, el `className="ancho-completo"` de quien lo usa desaparece sin ningún aviso. Lo mismo con `onClick`, `disabled` o `aria-label`, si no se pasa el resto de props. Un componente que envuelve un elemento del DOM debería aceptar los mismos atributos que ese elemento: es lo que practicarás en el ejercicio.

**Leer una clase con guion con punto.** Con CSS Modules, `estilos.grado-alto` no es una clase: JavaScript lo lee como `estilos.grado - alto`, una resta, y como no existe ninguna variable `alto`, el componente falla con `ReferenceError: alto is not defined`. Se escribe `estilos['grado-alto']`, o se nombran las clases en camelCase.

**Dar un número a una variable CSS esperando píxeles.** A `padding: 8`, React le añade `px`; a `'--ancho': 72`, no, porque no sabe qué unidad quieres. Si el CSS hace `width: var(--ancho)`, recibe un `72` sin unidad: la declaración no vale y el ancho se queda en su valor por defecto, sin ningún aviso. Pasa el texto con su unidad (`'72%'`, `'12px'`) o multiplica en el CSS: `calc(var(--ancho) * 1%)`.

**Confiar en el orden del atributo `class`.** Ya lo has visto en el predice: `className={'boton ' + className}` no hace que gane la clase de fuera. Con CSS propio, dale más especificidad o pon su regla después; con Tailwind, `tailwind-merge`.

**Copiar el tema en cada componente.** Pasar `tema` por contexto para elegir en cada componente entre `'tarjeta-clara'` y `'tarjeta-oscura'` funciona, pero renderiza a todos con cada cambio y duplica cada regla de CSS. Las variables CSS hacen lo mismo con un solo atributo.

## Ejercicios

El rocódromo quiere un único componente `Boton` para toda su web, con variantes. La página del ejercicio es un pequeño **catálogo**, como los que usan los equipos para documentar sus componentes: cada ejemplo enseña el botón y, debajo, las clases que le tocan según `clasesBoton`. El CSS ya está escrito; te falta la función que elige las clases y que `Boton` pase el resto de props.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un botón con variantes",
  "consigna": "En Boton.jsx, completa clasesBoton para que devuelva las clases en el orden que explica el comentario: base, variante, tamaño, ancho y la clase de fuera, sin undefined ni false. Después haz que Boton pase al button el resto de props, para que funcione el onClick de «Cancelar reserva». Mira cómo cambian los botones y sus clases mientras escribes, y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Boton, { clasesBoton } from './Boton'\nimport './catalogo.css'\n\n// Cada ejemplo enseña el botón y, debajo, las clases que le tocan\nconst EJEMPLOS = [\n  { id: 'defecto', etiqueta: 'Sin opciones', opciones: {} },\n  { id: 'secundaria', etiqueta: 'Secundaria', opciones: { variante: 'secundaria' } },\n  { id: 'peligro', etiqueta: 'Peligro y pequeño', opciones: { variante: 'peligro', tamano: 'pequeno' } },\n  { id: 'ancho', etiqueta: 'A todo el ancho', opciones: { variante: 'secundaria', anchoCompleto: true } },\n  { id: 'fuera', etiqueta: 'Con una clase de fuera', opciones: { className: 'reserva__accion' } },\n]\n\nexport default function App() {\n  const [mensaje, setMensaje] = useState('')\n\n  return (\n    <main>\n      <h1>Botones del rocódromo</h1>\n      <ul className=\"catalogo\">\n        {EJEMPLOS.map((ejemplo) => (\n          <li key={ejemplo.id}>\n            <Boton {...ejemplo.opciones}>{ejemplo.etiqueta}</Boton>\n            <code>{clasesBoton(ejemplo.opciones)}</code>\n          </li>\n        ))}\n      </ul>\n\n      <h2>En uso</h2>\n      <Boton variante=\"peligro\" onClick={() => setMensaje('Reserva cancelada')}>\n        Cancelar reserva\n      </Boton>\n      <p role=\"status\">{mensaje}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Boton.jsx",
      "codigo": "import './boton.css'\n\n// Devuelve las clases de un botón, en este orden:\n//   'boton', siempre;\n//   'boton--primaria', 'boton--secundaria' o 'boton--peligro', según la\n//     variante (primaria si no llega ninguna);\n//   'boton--pequeno', si el tamaño es 'pequeno' (el normal no añade nada);\n//   'boton--ancho', si anchoCompleto es true;\n//   y al final el className que llegue de fuera, si llega.\n// Sin 'undefined' ni 'false' por el camino.\nexport function clasesBoton({ variante = 'primaria', tamano = 'normal', anchoCompleto = false, className } = {}) {\n  return 'boton'\n}\n\nexport default function Boton({ variante, tamano, anchoCompleto, className, children }) {\n  // Pasa también al <button> el resto de props que lleguen (onClick, disabled...)\n  return (\n    <button type=\"button\" className={clasesBoton({ variante, tamano, anchoCompleto, className })}>\n      {children}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "boton.css",
      "codigo": ".boton {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0.45rem 0.9rem;\n  border: 1px solid transparent;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n}\n\n.boton--primaria {\n  background: #0f766e;\n  color: #ffffff;\n}\n\n.boton--primaria:hover {\n  background: #115e59;\n}\n\n.boton--secundaria {\n  border-color: #a8a29e;\n  background: #ffffff;\n  color: #1c1917;\n}\n\n.boton--secundaria:hover {\n  background: #f5f5f4;\n}\n\n.boton--peligro {\n  background: #b91c1c;\n  color: #ffffff;\n}\n\n.boton--peligro:hover {\n  background: #991b1b;\n}\n\n.boton--pequeno {\n  padding: 0.2rem 0.55rem;\n  font-size: 0.85rem;\n}\n\n.boton--ancho {\n  width: 100%;\n}\n"
    },
    {
      "nombre": "catalogo.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.25rem;\n}\n\nh2 {\n  margin-top: 1.25rem;\n  font-size: 1.05rem;\n}\n\n.catalogo {\n  display: grid;\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.catalogo li {\n  display: grid;\n  justify-items: start;\n  gap: 0.3rem;\n  padding: 0.6rem;\n  border: 1px dashed #d6d3d1;\n  border-radius: 8px;\n}\n\n.catalogo code {\n  color: #57534e;\n  font-size: 0.8rem;\n}\n\n.reserva__accion {\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n"
    }
  ],
  "archivoInicial": "Boton.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Sin opciones, el botón es primario: «boton boton--primaria»",
      "pasos": [],
      "espera": {
        "texto": "boton boton--primaria"
      }
    },
    {
      "descripcion": "La variante secundaria da «boton boton--secundaria»",
      "pasos": [],
      "espera": {
        "texto": "boton boton--secundaria"
      }
    },
    {
      "descripcion": "Peligro y pequeño da «boton boton--peligro boton--pequeno»",
      "pasos": [],
      "espera": {
        "texto": "boton boton--peligro boton--pequeno"
      }
    },
    {
      "descripcion": "A todo el ancho da «boton boton--secundaria boton--ancho»",
      "pasos": [],
      "espera": {
        "texto": "boton boton--secundaria boton--ancho"
      }
    },
    {
      "descripcion": "La clase de fuera va al final: «boton boton--primaria reserva__accion»",
      "pasos": [],
      "espera": {
        "texto": "boton boton--primaria reserva__accion"
      }
    },
    {
      "descripcion": "Al pulsar «Cancelar reserva», el aviso dice «Reserva cancelada»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar reserva"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Reserva cancelada"
      }
    }
  ]
}
```

Si devuelves una plantilla como `` `boton boton--${variante} ${anchoCompleto && 'boton--ancho'} ${className}` ``, el catálogo te enseña el problema enseguida: `boton boton--primaria false undefined`. No rompe nada visible, porque ninguna regla se llama así, pero es basura en el DOM y hace fallar cualquier prueba que compare las clases. Un array que se filtra con `filter(Boolean)` y se une con espacios, como en la lección 10, o `clsx`, lo evitan.

Lo que acabas de escribir tiene nombre: una **función de variantes**. La librería `class-variance-authority` (cva) la genera a partir de una descripción, y es la que usa esta web para las variantes de sus botones. Con tus clases quedaría así (comprobado con cva 0.7.1):

```jsx
import { cva } from 'class-variance-authority'

const clasesBoton = cva('boton', {
  variants: {
    variante: { primaria: 'boton--primaria', secundaria: 'boton--secundaria', peligro: 'boton--peligro' },
    tamano: { normal: '', pequeno: 'boton--pequeno' },
    anchoCompleto: { true: 'boton--ancho' },
  },
  defaultVariants: { variante: 'primaria', tamano: 'normal' },
})

clasesBoton({ variante: 'peligro', tamano: 'pequeno', className: 'reserva__accion' })
// → 'boton boton--peligro boton--pequeno reserva__accion'
```

La verás con shadcn/ui en la lección 80.

**Retos para seguir practicando** (sin comprobación automática):

1. Añade una variante `fantasma`: sin fondo ni borde, solo el texto en el color de la marca, y un ejemplo más en el catálogo.
2. Pasa los colores de los botones a variables CSS: `.boton` usa `var(--boton-fondo)` y `var(--boton-texto)`, y cada variante solo redefine esas dos. Después añade al catálogo el tema oscuro de la lección y haz que la variante secundaria se adapte cambiando solo variables.
3. En el tema del rocódromo, parte de la preferencia del sistema: lee `matchMedia('(prefers-color-scheme: dark)').matches` al crear el estado, con un inicializador (lección 16). En un proyecto en tu ordenador, guarda además la elección en `localStorage` para que sobreviva a recargar (la vista previa de esta web no conserva nada entre recargas).
4. Escribe tu propia `crearVariantes(base, variantes, porDefecto)` que devuelva una función como `clasesBoton`, al estilo de cva, y úsala para un segundo componente, `Insignia`, con las variantes `abierta`, `nueva` y `cerrada` del muro norte.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Common components: Applying CSS styles",
      "descripcion": "className, style y cuándo usar cada uno, según la documentación de React, con el ejemplo de clases condicionales con una librería auxiliar.",
      "url": "https://react.dev/reference/react-dom/components/common",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Vite: CSS Modules",
      "descripcion": "Cómo trata Vite los archivos .module.css, junto al resto del soporte de CSS: importar, PostCSS, preprocesadores y ?inline.",
      "url": "https://vite.dev/guide/features#css-modules",
      "etiqueta": "Vite"
    },
    {
      "titulo": "Installing Tailwind CSS with Vite",
      "descripcion": "La guía oficial de instalación con el plugin de Vite, la que se sigue en esta lección.",
      "url": "https://tailwindcss.com/docs/installation/using-vite",
      "etiqueta": "Tailwind"
    },
    {
      "titulo": "Detecting classes in source files",
      "descripcion": "Cómo encuentra Tailwind las clases que usas, por qué no funcionan los nombres montados con plantillas y cómo mapear props a clases completas.",
      "url": "https://tailwindcss.com/docs/detecting-classes-in-source-files",
      "etiqueta": "Tailwind"
    },
    {
      "titulo": "clsx",
      "descripcion": "La utilidad de unos pocos cientos de bytes para montar className con condiciones, compatible con la librería classnames.",
      "url": "https://github.com/lukeed/clsx",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "tailwind-merge",
      "descripcion": "Une clases de Tailwind resolviendo los choques: qué hace, cuándo usarlo y sus límites.",
      "url": "https://github.com/dcastil/tailwind-merge",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Using CSS custom properties (variables)",
      "descripcion": "Las variables CSS: cómo se definen, cómo se heredan y cómo se leen y cambian desde JavaScript.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties",
      "etiqueta": "MDN"
    },
    {
      "titulo": "useInsertionEffect",
      "descripcion": "Por qué React desaconseja inyectar estilos al ejecutarse y qué recomienda en su lugar, en la página del Hook pensado para librerías de CSS-in-JS. Es la lección 45.",
      "url": "https://react.dev/reference/react/useInsertionEffect",
      "etiqueta": "react.dev"
    }
  ]
}
```
