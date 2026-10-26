# `children`: componentes que envuelven a otros

- **Módulo:** Describir la interfaz
- **Slug:** `children-componentes-que-envuelven-a-otros` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) (sección «Passing JSX as children») — ver `contenido/react/TEMARIO.md` #9

---

## Qué es y para qué sirve

En la lección 8 pasaste datos a un componente con atributos: `<FichaAnimal nombre="Lola" edad={4} />`. Pero muchas veces lo que quieres pasar no es un dato, sino **un trozo de interfaz entero**: un título y un párrafo, una lista, un enlace, otro componente.

Imagina la web de una protectora de animales. Casi todo va dentro de la misma tarjeta con borde y fondo, pero lo de dentro cambia cada vez:

```jsx
<div className="tarjeta">
  <h2>Lola</h2>
  <p>Galga de 4 años. Tranquila y muy cariñosa.</p>
</div>
<div className="tarjeta">
  <h2>Horario de visitas</h2>
  <p>De martes a domingo, de 10:00 a 13:00.</p>
</div>
<div className="tarjeta">
  <p>¿No puedes adoptar? Hazte voluntario.</p>
</div>
```

El marco se repite tres veces. Si mañana la tarjeta lleva sombra, hay que cambiarlo en tres sitios. Y con props de datos (`titulo`, `texto`) no llegas lejos: la tercera tarjeta no tiene título, otra llevará una lista y otra un botón.

Con las etiquetas de HTML lo resuelves sin pensar: metes lo que quieras dentro de un `<div>`. Con tus componentes funciona igual:

> **Lo que escribes entre `<Tarjeta>` y `</Tarjeta>` le llega a `Tarjeta` en una prop llamada `children`, y es la tarjeta la que decide dónde colocarlo.**

Así nacen los **componentes contenedor**: piezas que ponen el marco (un borde, un título, una columna, el color de un aviso) y dejan el contenido a quien las usa.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Una tarjeta para cualquier contenido",
  "codigo": "function Tarjeta({ children }) {\n  return <div className=\"tarjeta\">{children}</div>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Protectora Huellas</h1>\n      <Tarjeta>\n        <h2>Lola</h2>\n        <p>Galga de 4 años. Tranquila y muy cariñosa.</p>\n      </Tarjeta>\n      <Tarjeta>\n        <p>¿No puedes adoptar? Hazte voluntario y saca a pasear a nuestros perros.</p>\n      </Tarjeta>\n    </main>\n  )\n}",
  "css": "main { font-family: system-ui, sans-serif; display: grid; gap: 0.75rem; max-width: 32rem; }\nh1 { margin: 0; font-size: 1.4rem; }\n.tarjeta { border: 1px solid #d6d3d1; border-radius: 12px; padding: 0.75rem 1rem; background: #fffbf5; }\n.tarjeta h2 { margin: 0 0 0.25rem; font-size: 1.1rem; }\n.tarjeta p { margin: 0; }",
  "anotaciones": [
    {
      "fragmento": "function Tarjeta({ children })",
      "nota": "children se recibe como cualquier otra prop, desestructurándola del objeto props. Lo distinto es de dónde sale: no se escribe como atributo, sino entre las dos etiquetas."
    },
    {
      "fragmento": "<div className=\"tarjeta\">{children}</div>",
      "nota": "La tarjeta pone el marco (borde, fondo, espaciado) y decide dónde va el contenido: aquí, dentro del div. Qué contenido es, no lo sabe ni le hace falta saberlo."
    },
    {
      "fragmento": "<h2>Lola</h2>",
      "nota": "Todo lo que hay entre <Tarjeta> y </Tarjeta>, este título y el párrafo de debajo, llega a Tarjeta como children."
    },
    {
      "fragmento": "<p>¿No puedes adoptar?",
      "nota": "El mismo componente con un contenido completamente distinto, sin título. No hace falta una TarjetaVoluntariado: el marco es el mismo y lo de dentro lo decide quien lo usa."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

`Tarjeta` no se parece a los componentes de la lección 8: no recibe datos que formatear, sino **un hueco que rellena el padre**. Cambia el contenido y el componente no se entera; cambia el estilo de la tarjeta y se actualiza en todas partes a la vez.

## `children` es una prop más

`children` no tiene nada de mágico. Es una prop como `nombre` o `edad`, con dos particularidades: el nombre lo pone React, y el valor no se escribe como atributo, sino entre las dos etiquetas. Cuando el JSX se convierte en JavaScript (lo viste en la lección 7), lo que va entre las etiquetas acaba dentro del objeto de props, con la clave `children`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "children, visto desde el JavaScript generado",
  "consigna": "Abre la pestaña del JavaScript generado y busca children: en los tres usos de Tarjeta. El primero lleva un array con dos elementos; el segundo, un texto; el tercero, el mismo texto pasado como atributo. Después cambia Tarjeta.jsx para desestructurar ({ children }) en vez de leer props.children: funciona igual.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tarjeta from './Tarjeta'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Protectora Huellas</h1>\n      <Tarjeta>\n        <h2>Trufa</h2>\n        <p>Gata de 2 años. Le gustan las cajas de cartón.</p>\n      </Tarjeta>\n      <Tarjeta>Hazte voluntario los fines de semana.</Tarjeta>\n      <Tarjeta children=\"Hazte voluntario los fines de semana.\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tarjeta.jsx",
      "codigo": "export default function Tarjeta(props) {\n  return <div className=\"tarjeta\">{props.children}</div>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.tarjeta {\n  padding: 0.75rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 12px;\n  background: #fffbf5;\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

En el JavaScript generado, `<Tarjeta>Hazte voluntario…</Tarjeta>` y `<Tarjeta children="Hazte voluntario…" />` producen **la misma llamada**: `_jsx(Tarjeta, { children: "…" })`. Escribir `children` como atributo funciona, pero nadie lo hace, porque el contenido entre etiquetas se lee mucho mejor. Y si pones las dos cosas a la vez, gana lo de dentro: `<Tarjeta children="A">B</Tarjeta>` pinta «B».

## Los contenedores de siempre

Casi todos los componentes contenedor que verás en proyectos reales pertenecen a una de estas cuatro familias:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro formas de envolver",
  "roles": [
    {
      "etiqueta": "Tarjeta",
      "rol": "Marco visual",
      "descripcion": "Solo pone el aspecto: borde, fondo, sombra y espaciado. No sabe nada del contenido."
    },
    {
      "etiqueta": "Panel",
      "rol": "Estructura con título",
      "descripcion": "Recibe el título como prop y coloca children debajo. Mezcla configurar (el título) con envolver (el contenido)."
    },
    {
      "etiqueta": "Aviso",
      "rol": "Un significado",
      "descripcion": "Una prop tipo (informativo, urgente) decide el color; el mensaje, con negritas o enlaces si hace falta, llega como children."
    },
    {
      "etiqueta": "Maquetación",
      "rol": "Esqueleto de la página",
      "descripcion": "Cabecera y pie fijos; lo que cambia en cada página va en children, dentro del main."
    }
  ]
}
```

Lo interesante es que **se anidan**: la maquetación envuelve paneles, un panel envuelve un aviso, y cada uno se ocupa de su capa sin saber nada de las demás. Esta página de la protectora está hecha solo con esos tres contenedores:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una página entera hecha con contenedores",
  "consigna": "Recorre los archivos: Maquetacion, Panel y Aviso no saben qué van a envolver. Añade en App.jsx un Panel «Horario de visitas» con un párrafo, y mete un Aviso dentro de él. Ninguno de los tres contenedores tiene que cambiar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Maquetacion from './Maquetacion'\nimport Panel from './Panel'\nimport Aviso from './Aviso'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <Maquetacion>\n      <h1>Adopta, no compres</h1>\n      <Aviso tipo=\"urgente\">\n        <strong>Urgente:</strong> Bruno necesita una casa de acogida antes del viernes.\n      </Aviso>\n      <Panel titulo=\"En adopción\">\n        <ul>\n          <li>Lola, galga de 4 años</li>\n          <li>Trufa, gata de 2 años</li>\n          <li>Bruno, mestizo de 9 años</li>\n        </ul>\n      </Panel>\n      <Panel titulo=\"Cómo adoptar\">\n        <p>Ven a conocerlos, rellena el cuestionario y te llamamos en una semana.</p>\n        <Aviso tipo=\"info\">Todos se entregan vacunados, desparasitados y con chip.</Aviso>\n      </Panel>\n    </Maquetacion>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.jsx",
      "codigo": "export default function Maquetacion({ children }) {\n  return (\n    <div className=\"pagina\">\n      <header className=\"cabecera\">\n        <p className=\"logo\">Protectora Huellas</p>\n      </header>\n      <main>{children}</main>\n      <footer className=\"pie\">Camino del Molino, s/n · Abierto de martes a domingo</footer>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Panel.jsx",
      "codigo": "export default function Panel({ titulo, children }) {\n  return (\n    <section className=\"panel\">\n      <h2>{titulo}</h2>\n      {children}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Aviso.jsx",
      "codigo": "export default function Aviso({ tipo, children }) {\n  return <div className={'aviso aviso-' + tipo}>{children}</div>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".pagina {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n  border: 1px solid #d6d3d1;\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n.cabecera,\n.pie {\n  padding: 0.5rem 1rem;\n  background: #7c2d12;\n  color: white;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n.pie {\n  font-size: 0.85rem;\n}\n\nmain {\n  display: grid;\n  gap: 0.75rem;\n  padding: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.panel {\n  padding: 0.75rem 1rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 10px;\n}\n\n.panel h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.aviso {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid;\n  border-radius: 6px;\n}\n\n.aviso-urgente {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\n.aviso-info {\n  border-color: #1d4ed8;\n  background: #eff6ff;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Fíjate en el `Aviso` de dentro de «Cómo adoptar»: la maquetación envuelve al panel, y el panel al aviso. **Cada contenedor coloca `children` en su sitio y se desentiende de lo demás.**

## Qué llega exactamente en `children`

Si te limitas a pintar `{children}`, no necesitas saber qué contiene: React sabe pintar cualquier cosa que le llegue. Pero en cuanto quieras hacer algo más con `children` (comprobar si viene vacío, tratarlo como un texto), importa **qué tipo de valor** llega. Y depende de cómo lo escriba quien usa el componente.

Esta `Caja` dice en pantalla qué ha recibido. Pruébala con tus propios casos:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El inspector de children",
  "consigna": "Cada caja dice qué valor ha recibido en children. Añade tus propios casos en App.jsx: un número como {3}, {null}, un texto y un elemento juntos, o una caja con solo un espacio entre las dos etiquetas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Caja from './Caja'\nimport './estilos.css'\n\nconst hayUrgencias = false\n\nexport default function App() {\n  return (\n    <main>\n      <Caja>Lola</Caja>\n      <Caja>\n        <strong>Lola</strong>\n      </Caja>\n      <Caja>\n        <p>Lola</p>\n        <p>Galga de 4 años</p>\n      </Caja>\n      <Caja />\n      <Caja>{hayUrgencias && <p>¡Urgente!</p>}</Caja>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Caja.jsx",
      "codigo": "function describir(children) {\n  if (children === undefined) return 'undefined: no le has pasado nada'\n  if (children === null) return 'null'\n  if (Array.isArray(children)) return `un array con ${children.length} elementos`\n  if (typeof children === 'string') return `un texto: «${children}»`\n  if (typeof children === 'number') return `un número: ${children}`\n  if (typeof children === 'boolean') return `un booleano: ${children}`\n  return 'un elemento de React (un objeto)'\n}\n\nexport default function Caja({ children }) {\n  return (\n    <div className=\"caja\">\n      <p className=\"tipo\">children es {describir(children)}</p>\n      <div className=\"contenido\">{children}</div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.5rem;\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\n.caja {\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n  overflow: hidden;\n}\n\n.tipo {\n  margin: 0;\n  padding: 0.35rem 0.75rem;\n  background: #f5f5f4;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.contenido {\n  min-height: 1.5rem;\n  padding: 0.35rem 0.75rem;\n}\n\n.contenido p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Antes de probarlo en el inspector, intenta predecir este caso, que despista a casi todo el mundo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const nombre = 'Lola'\n\nfunction Caja({ children }) {\n  // ¿Qué valor tiene children aquí?\n  return <div className=\"caja\">{children}</div>\n}\n\nexport default function App() {\n  return <Caja>Adopta a {nombre}</Caja>\n}",
  "opciones": [
    "Un texto: «Adopta a Lola»",
    "Un array con dos textos: «Adopta a » y «Lola»",
    "Un elemento de React",
    "undefined"
  ],
  "correcta": 1,
  "explicacion": "Un trozo de texto y una expresión entre llaves son dos hijos distintos, así que llegan juntos en un array. En pantalla se ve igual, pero un componente que esperase un texto (por ejemplo, para pasarlo a mayúsculas) fallaría. Si necesitas un único texto, constrúyelo tú con una plantilla de texto dentro de las llaves."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Texto suelto: un string",
      "texto": "<Caja>Lola</Caja> entrega \"Lola\". Los saltos de línea y la sangría de alrededor se eliminan, pero un espacio solo entre las dos etiquetas llega como \" \"."
    },
    {
      "titulo": "Un solo elemento: un objeto",
      "texto": "Un único <strong> o un único componente llega como un elemento de React, el objeto que viste en la lección 7."
    },
    {
      "titulo": "Varios hijos: un array",
      "texto": "Dos elementos seguidos, o texto mezclado con llaves, llegan en un array. Adopta a {nombre} son dos hijos."
    },
    {
      "titulo": "Nada: undefined",
      "texto": "<Caja /> y <Caja></Caja> entregan undefined. Un comentario {/* ... */} tampoco cuenta como hijo."
    },
    {
      "titulo": "Condiciones y listas: lo que valga la expresión",
      "texto": "Una condición que no se cumple, como {hayUrgencias && <p>...</p>}, entrega false. Una lista vacía hecha con map entrega []. React no pinta ninguno de los dos."
    }
  ]
}
```

## ¿Y si no me pasan nada? Comprobar `children` con cuidado

A veces el contenedor quiere reaccionar cuando no recibe contenido: un panel que diga «Pronto habrá novedades» en vez de quedarse con el título solo. La tentación es comprobar `children` desde dentro, y ahí está la trampa, porque «vacío» puede llegar de muchas formas:

- **`children ?? reserva`** solo salta con `undefined` o `null`. Es justo lo que quieres para el caso «no me han pasado nada», como `<Panel titulo="Casas de acogida" />`.
- **`children || reserva`** y **`if (!children)`** saltan además con `false` y con `''`, pero tratan un `0` legítimo como si fuera vacío (y lo esconden), y no detectan `[]` ni `[false, false]`: un array es *truthy* aunque no tenga nada que pintar.

Pon a prueba la primera opción:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Panel({ titulo, children }) {\n  return (\n    <section className=\"panel\">\n      <h2>{titulo}</h2>\n      {children ?? <p>Pronto habrá novedades.</p>}\n    </section>\n  )\n}\n\nconst hayUrgencias = false\n\nexport default function App() {\n  return (\n    <Panel titulo=\"Casos urgentes\">\n      {hayUrgencias && <p>Bruno necesita una casa de acogida.</p>}\n    </Panel>\n  )\n}",
  "opciones": [
    "El título y «Pronto habrá novedades.»",
    "Solo el título",
    "El título y la palabra false",
    "El título y «Bruno necesita una casa de acogida.»"
  ],
  "correcta": 1,
  "explicacion": "children no es undefined: es false, el resultado de la condición. El operador ?? solo actúa con null o undefined, así que deja pasar ese false, y React no pinta nada en su lugar. Debajo del título no queda nada, ni siquiera el texto de reserva."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "No adivines desde dentro: decide en el padre",
  "contenido": "Desde dentro del contenedor, «no hay contenido» puede llegar como undefined, null, false, una cadena vacía, un array vacío o un array lleno de false, según cómo lo escriba el padre. Usa ?? solo para el caso de no recibir nada. Cuando el contenido depende de unos datos, que lo decida el componente que tiene esos datos: él sabe si la lista de urgencias está vacía y puede pasar el mensaje adecuado."
}
```

Decidir en el padre queda así (el operador ternario lo verás a fondo en la lección siguiente):

```jsx
<Panel titulo="Casos urgentes">
  {urgencias.length > 0 ? (
    <ListaUrgencias urgencias={urgencias} />
  ) : (
    <p>No hay casos urgentes ahora mismo.</p>
  )}
</Panel>
```

Si buscas en internet, verás soluciones que inspeccionan `children` con `Children.count` o `Children.toArray`. Forman parte de un API que react.dev clasifica como heredado (*legacy*); la lección 30 explica qué usar en su lugar.

## Envolver o configurar con props

Un componente puede recibir información de dos maneras: **configurarlo** con props (`titulo`, `tipo`, `edad`) o **envolver** contenido con `children`. La pregunta que decide es: **¿el componente necesita entender ese valor, o solo colocarlo?**

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos maneras de pasar información",
  "roles": [
    {
      "etiqueta": "Configurar con props",
      "rol": "Datos que el componente entiende",
      "descripcion": "Los usa para decidir o calcular: el tipo elige el color del aviso, la edad se escribe como «4 años», el título va en el h2. El componente controla el resultado."
    },
    {
      "etiqueta": "Envolver con children",
      "rol": "Contenido que solo coloca",
      "descripcion": "Lo pinta tal cual en su sitio, sin mirarlo. Quien usa el componente decide si es un texto, una lista, un enlace u otro componente."
    }
  ]
}
```

La diferencia se nota en cuanto el contenido deja de ser un texto plano. Estos dos avisos parecen iguales, pero solo uno admite una negrita y un enlace:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un aviso con una prop de texto y otro con children",
  "consigna": "Intenta poner «Bruno» en negrita en el primer aviso sin tocar el componente. Con una cadena no puedes: escribe la etiqueta dentro de las comillas y verás los signos < y > tal cual, porque React escapa el texto. El segundo aviso acepta cualquier JSX.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction AvisoConTexto({ texto }) {\n  return <p className=\"aviso\">{texto}</p>\n}\n\nfunction Aviso({ children }) {\n  return <div className=\"aviso\">{children}</div>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <AvisoConTexto texto=\"Bruno necesita una casa de acogida antes del viernes.\" />\n      <Aviso>\n        <strong>Bruno</strong> necesita una casa de acogida <em>antes del viernes</em>.{' '}\n        <a href=\"#acogida\">Ver requisitos</a>\n      </Aviso>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\n.aviso {\n  margin: 0;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Podrías pasarle JSX a la prop `texto`, y funcionaría; pero entonces ya no es un texto, es un hueco para contenido, y para eso existe `children`. Una señal de que te toca envolver: **props que solo viajan para pegarse tal cual** (`texto`, `contenido`, `cuerpo`), o una lista de props que crece con cada variación (`textoNegrita`, `enlace`, `icono`...).

Lo habitual es combinar las dos cosas. El `Panel` de antes **configura** su título y **envuelve** su contenido: `<Panel titulo="Cómo adoptar">…</Panel>`.

### Envolver para no arrastrar props

Hay otra ventaja menos evidente. Cuando un componente intermedio recibe datos que no usa, solo para entregárselos a otro más abajo, suele ser señal de que debería envolver:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// Antes: la maquetación recibe datos que no usa, solo para pasarlos\nfunction Maquetacion({ animales }) {\n  return (\n    <div className=\"pagina\">\n      <Cabecera />\n      <main>\n        <ListaAnimales animales={animales} />\n      </main>\n    </div>\n  )\n}\n// En App: <Maquetacion animales={animales} />\n\n// Después: la maquetación envuelve y App coloca la lista\nfunction Maquetacion({ children }) {\n  return (\n    <div className=\"pagina\">\n      <Cabecera />\n      <main>{children}</main>\n    </div>\n  )\n}\n// En App:\n// <Maquetacion>\n//   <ListaAnimales animales={animales} />\n// </Maquetacion>",
  "anotaciones": [
    {
      "fragmento": "function Maquetacion({ animales })",
      "nota": "La maquetación no hace nada con animales: solo los recibe para entregárselos a ListaAnimales. Si mañana la lista necesita otra prop, también tendrá que atravesar la maquetación."
    },
    {
      "fragmento": "<main>{children}</main>",
      "nota": "Ahora la maquetación solo sabe que en el main va algo. Ya no depende de la lista ni de sus datos."
    },
    {
      "fragmento": "// <Maquetacion>",
      "nota": "App, que es quien tiene los datos, pinta la lista directamente. Hay una capa menos entre el dato y quien lo usa. En la lección 28 verás que este truco evita muchas veces tener que recurrir a Context."
    }
  ]
}
```

## Huecos con nombre: un avance

`children` es **un solo hueco**. Cuando un componente necesita dos o más (una cabecera y un pie, por ejemplo), cualquier prop puede llevar JSX, igual que lleva un número o un texto:

```jsx
<Panel
  cabecera={<h2>Lola <small>galga, 4 años</small></h2>}
  pie={<a href="#adoptar">Quiero adoptarla</a>}
>
  <p>Tranquila, cariñosa y acostumbrada a vivir con gatos.</p>
</Panel>
```

Este patrón, el de los huecos con nombre (*slots*), tiene su propia lección, la 30, junto con otros patrones de composición. Por ahora quédate con la idea: **`children` es el hueco por defecto; los demás huecos son props normales que reciben JSX.**

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Sistemas de diseño",
      "texto": "Card, Panel, Alert, Modal, Tooltip... Casi cualquier librería de componentes, como las que verás en la lección 80, se apoya en contenedores que reciben children."
    },
    {
      "titulo": "Maquetaciones de página",
      "texto": "Una Maquetacion con cabecera, menú y pie que se repite en todas las páginas, y lo único que cambia va en children. Cuando añadas rutas en el módulo 11, será el patrón de siempre."
    },
    {
      "titulo": "Diálogos y ventanas",
      "texto": "Un Dialogo pone el fondo oscuro, el botón de cerrar y el manejo del foco; el contenido lo decide cada uso. Lo construirás con portales en la lección 36."
    },
    {
      "titulo": "Envoltorios que no pintan nada propio",
      "texto": "Algunos contenedores solo rodean a sus hijos para darles algo: datos compartidos, como los proveedores de contexto de la lección 28, o una red de seguridad ante errores, como los límites de error de la lección 53."
    }
  ]
}
```

## Errores típicos

**Olvidar pintar `{children}`.** Es el más común, y el más silencioso:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Panel({ titulo }) {\n  return (\n    <section className=\"panel\">\n      <h2>{titulo}</h2>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <Panel titulo=\"Horario de visitas\">\n      <p>De martes a domingo, de 10:00 a 13:00.</p>\n    </Panel>\n  )\n}",
  "opciones": [
    "El título y el horario",
    "Solo el título",
    "Un error: children is not defined",
    "El título, y un aviso en la consola"
  ],
  "correcta": 1,
  "explicacion": "El párrafo llega a Panel dentro de props.children, pero Panel ni lo desestructura ni lo coloca en ningún sitio. React no avisa porque no es un error: simplemente nadie pinta ese contenido. Si un contenedor se come lo que le metes, busca el {children} que falta."
}
```

**Olvidar las llaves al recibir las props.** `function Tarjeta(children)` no desestructura nada: el parámetro se llama `children`, pero contiene el objeto `props` entero. Al pintarlo, React se encuentra un objeto y se para con:

```text
Objects are not valid as a React child (found: object with keys {children}). If you meant to render a collection of children, use an array instead.
```

El propio mensaje da la pista: un objeto con una clave `children`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tarjeta que no arranca",
  "consigna": "La vista previa muestra el error de React. Lee el mensaje: ha encontrado un objeto con la clave children. Arréglalo en Tarjeta.jsx añadiendo las llaves que faltan.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tarjeta from './Tarjeta'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Protectora Huellas</h1>\n      <Tarjeta>\n        <h2>Bruno</h2>\n        <p>Mestizo de 9 años. Busca una casa tranquila.</p>\n      </Tarjeta>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tarjeta.jsx",
      "codigo": "export default function Tarjeta(children) {\n  return <div className=\"tarjeta\">{children}</div>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  padding: 0.75rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 12px;\n  background: #fffbf5;\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "Tarjeta.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**Tratar `children` como si siempre fuera un texto.** Un componente que hace `children.toUpperCase()` funciona con `<Etiqueta>Urgente</Etiqueta>`, pero `<Etiqueta>Urgente: {nombre}</Etiqueta>` lo rompe con «children.toUpperCase is not a function», porque ahí llega un array. Si el componente necesita manipular un texto, pídelo como una prop de texto: eso es configurar, no envolver.

**Envolver datos que el componente tiene que entender.** `<Edad>4</Edad>` entrega el texto `"4"`, pero `<Edad>{4}</Edad>` entrega el número `4`: el componente depende de cómo lo escriba cada uno. Si tiene que calcular o formatear algo, es una prop: `<Edad anios={4} />`.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los paneles de la protectora",
  "consigna": "Completa Panel.jsx siguiendo los pasos del comentario y, en App.jsx, mete el horario en su propio Panel (paso 4). El panel «Casas de acogida» no recibe contenido: es el que debe mostrar «Pronto habrá novedades». Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Panel from './Panel'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Protectora Huellas</h1>\n      <Panel titulo=\"En adopción\">\n        <ul>\n          <li>Lola, galga de 4 años</li>\n          <li>Trufa, gata de 2 años</li>\n          <li>Bruno, mestizo de 9 años</li>\n        </ul>\n      </Panel>\n      {/* 4. Mete este párrafo en un Panel con el título «Horario de visitas» */}\n      <p>De martes a domingo, de 10:00 a 13:00.</p>\n      <Panel titulo=\"Casas de acogida\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Panel.jsx",
      "codigo": "export default function Panel() {\n  // 1. Recibe las props titulo y children.\n  // 2. Pinta el título en un <h2> y, debajo, el contenido.\n  // 3. Si no te pasan ningún contenido, muestra en su lugar\n  //    un párrafo con el texto «Pronto habrá novedades».\n  return <section className=\"panel\"></section>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.panel {\n  padding: 0.75rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 12px;\n  background: #fffbf5;\n}\n\n.panel h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.panel p,\n.panel ul {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "Panel.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "El panel «En adopción» muestra su título",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "En adopción"
      }
    },
    {
      "descripcion": "Dentro del panel se ven los animales en adopción",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Trufa"
      }
    },
    {
      "descripcion": "El horario tiene su propio panel con el título «Horario de visitas»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Horario de visitas"
      }
    },
    {
      "descripcion": "El texto del horario se sigue viendo después de envolverlo",
      "pasos": [],
      "espera": {
        "texto": "De martes a domingo, de 10:00 a 13:00."
      }
    },
    {
      "descripcion": "El panel que no recibe contenido muestra «Pronto habrá novedades»",
      "pasos": [],
      "espera": {
        "texto": "Pronto habrá novedades"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade a `Panel` una prop `pie` que reciba JSX y píntala al final de la sección, dentro de un `<footer>`. Úsala para poner un enlace «Quiero adoptar» solo en el panel «En adopción». Acabas de hacer un hueco con nombre, el patrón de la lección 30.
2. Crea un componente `Aviso` con una prop `tipo` (`'info'` o `'urgente'`) que cambie su clase, y úsalo dentro del panel «Casas de acogida» con un mensaje que lleve una negrita y un enlace.
3. Crea una `Maquetacion` con cabecera, `<main>{children}</main>` y pie, y mete toda la página dentro. ¿Cuántos archivos has tenido que tocar?
4. Usa el inspector de children para averiguar qué recibe `Panel` en `<Panel titulo="Casas de acogida">{' '}</Panel>`. ¿Mostraría tu panel el texto de reserva? ¿Por qué?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Passing JSX as children",
      "descripcion": "La sección de react.dev sobre children: el componente como un hueco que rellena el padre, con un ejercicio para extraer una tarjeta.",
      "url": "https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Before you use context",
      "descripcion": "Por qué pasar JSX como children es lo primero que conviene probar cuando unos datos atraviesan componentes que no los usan.",
      "url": "https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Operador de coalescencia nula (??)",
      "descripcion": "Qué valores hacen saltar a ?? (solo null y undefined) frente a ||, que salta con cualquier valor falsy.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Truthy",
      "descripcion": "Qué valores cuentan como verdaderos en una condición. Un array vacío está entre ellos: por eso !children no lo detecta.",
      "url": "https://developer.mozilla.org/es/docs/Glossary/Truthy",
      "etiqueta": "MDN"
    }
  ]
}
```
