# Pensar en React: de un diseño a componentes

- **Módulo:** Gestionar el estado
- **Slug:** `pensar-en-react-de-un-diseno-a-componentes` (autogenerado del título)
- **Orden:** 310
- **Fuentes:** [Thinking in React](https://react.dev/learn/thinking-in-react) — ver `contenido/react/TEMARIO.md` #31

---

## Qué es y para qué sirve

Hasta ahora has aprendido piezas sueltas: componentes y props (módulo 2), estado y eventos (módulo 3), y en este módulo, cómo estructurar el estado y dónde ponerlo. Esta lección es la que las junta. La pregunta ya no es cómo se escribe un `useState`, sino **por dónde empiezas cuando alguien te enseña un diseño y te dice «hazlo en React»**.

La documentación de React responde con un método de cinco pasos, el de su página *Thinking in React*:

1. **Dividir la interfaz en una jerarquía de componentes.**
2. **Construir una versión estática**, que pinte los datos sin ninguna interactividad.
3. **Encontrar la representación mínima, pero completa, del estado.**
4. **Decidir dónde vive cada estado.**
5. **Añadir el flujo de datos inverso**: que los componentes de abajo puedan cambiar el estado de arriba.

> **Primero la forma (qué componentes hay y qué datos reciben), después la memoria (qué cambia y quién lo guarda), y al final el cableado (quién avisa a quién).**

Vas a seguirlos con un caso real: el buscador de El Trastero, una tienda de segunda mano de barrio. Su catálogo llega de una API como un array de objetos, uno por artículo:

```js
{
  id: 4,
  titulo: 'Radio de válvulas',
  categoria: 'Electrónica',
  precio: 35,
  estado: 'Para restaurar',
  reservado: false,
  detalle: 'Enciende y sintoniza la onda media. El mueble de madera tiene golpes.',
}
```

Y la diseñadora ha dejado este boceto:

```text
┌───────────────────────────────────────────────┐
│ El Trastero                                   │
│ Segunda mano del barrio de la Magdalena       │
│ ┌───────────────────────────────────────────┐ │
│ │ Buscar [________]  Categoría [Todas ▾]    │ │
│ │ [ ] Solo lo disponible                    │ │
│ └───────────────────────────────────────────┘ │
│ Mostrando 8 de 8 artículos                    │
│ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│ │Silla de enea│ │Tocadiscos   │ │Raqueta    │ │
│ │25 €         │ │60 €         │ │15 €       │ │
│ │Buen estado  │ │Reservado    │ │Grip nuevo…│ │
│ │[Ver detalle]│ │[Ver detalle]│ │[Ocultar]  │ │
│ └─────────────┘ └─────────────┘ └───────────┘ │
└───────────────────────────────────────────────┘
```

Si has hecho la lección 23, te sonará lo de «cinco pasos». Aquel método servía para un componente: listar sus estados visuales. Este sirve para una pantalla entera: de qué componentes está hecha y dónde vive cada dato.

## Paso 1: dividir la interfaz en una jerarquía de componentes

**Dibuja una caja alrededor de cada parte del diseño que tenga una responsabilidad propia, y ponle nombre.** Si trabajas con un equipo de diseño, puede que ya tengan nombres para esas partes en su herramienta: pregúntalos y úsalos.

No hay una única forma correcta de cortar, pero sí tres maneras de pensarlo que suelen llegar al mismo sitio:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de decidir dónde cortar",
  "roles": [
    {
      "etiqueta": "Como programador",
      "rol": "Una responsabilidad por componente",
      "descripcion": "Como al decidir si algo merece su propia función: si una parte hace dos cosas sin relación, son dos componentes. Si crece demasiado, se divide."
    },
    {
      "etiqueta": "Como maquetador",
      "rol": "Lo que tendría su propia clase",
      "descripcion": "Las partes a las que darías un selector de CSS suelen ser componentes, aunque un componente agrupa algo más que una clase."
    },
    {
      "etiqueta": "Como diseñador",
      "rol": "Las capas del diseño",
      "descripcion": "Cómo están organizadas las capas y los grupos en la herramienta de diseño. Si alguien ya las nombró, empieza por esos nombres."
    }
  ]
}
```

Hay una pista más: **si los datos están bien organizados, la interfaz suele tener su misma forma**. El catálogo es un array de artículos, así que habrá una lista; cada artículo es un objeto, así que habrá un componente que pinte uno. Aquí tienes el boceto convertido en JSX tal cual, de un tirón, con cada caja marcada:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El boceto, con una caja por componente",
  "codigo": "import './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"caja\" data-componente=\"Tienda\">\n      <h1>El Trastero</h1>\n      <p className=\"lema\">Segunda mano del barrio de la Magdalena</p>\n      <div role=\"search\" className=\"caja filtros\" data-componente=\"Filtros\">\n        <label>\n          Buscar\n          <input type=\"search\" />\n        </label>\n        <label>\n          Categoría\n          <select>\n            <option>Todas</option>\n            <option>Muebles</option>\n          </select>\n        </label>\n        <label className=\"casilla\">\n          <input type=\"checkbox\" />\n          Solo lo disponible\n        </label>\n      </div>\n      <p className=\"caja resumen\" data-componente=\"Resumen\">\n        Mostrando 3 de 3 artículos\n      </p>\n      <ul className=\"caja lista\" data-componente=\"ListaArticulos\">\n        <li className=\"caja tarjeta\" data-componente=\"TarjetaArticulo\">\n          <h2>Silla de enea</h2>\n          <p className=\"precio\">25 €</p>\n          <p className=\"estado\">Buen estado</p>\n          <button type=\"button\">Ver detalle</button>\n        </li>\n        <li className=\"caja tarjeta\" data-componente=\"TarjetaArticulo\">\n          <h2>Tocadiscos de maleta</h2>\n          <p className=\"precio\">60 €</p>\n          <p className=\"estado\">Como nuevo · Reservado</p>\n          <button type=\"button\">Ver detalle</button>\n        </li>\n        <li className=\"caja tarjeta\" data-componente=\"TarjetaArticulo\">\n          <h2>Raqueta de tenis</h2>\n          <p className=\"precio\">15 €</p>\n          <p className=\"estado\">Buen estado</p>\n          <p className=\"detalle\">Grip nuevo y cordaje en buen estado. Con funda.</p>\n          <button type=\"button\">Ocultar detalle</button>\n        </li>\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.lema {\n  margin: 0 0 0.75rem;\n  color: #57534e;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  background: #f5f5f4;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\n.filtros .casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.lista {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  align-content: start;\n  gap: 0.3rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.tarjeta h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.estado {\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.detalle {\n  font-size: 0.9rem;\n}\n\n.tarjeta button {\n  justify-self: start;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.85rem;\n}\n\n.vacio {\n  padding: 1rem;\n  border: 1px dashed #a8a29e;\n  border-radius: 10px;\n  text-align: center;\n}\n\n.caja {\n  position: relative;\n  outline: 2px dashed var(--color);\n  outline-offset: 3px;\n}\n\n.caja::before {\n  content: attr(data-componente);\n  position: absolute;\n  top: -0.7rem;\n  right: 0.4rem;\n  padding: 0 0.3rem;\n  border-radius: 3px;\n  background: var(--color);\n  color: white;\n  font: 600 0.65rem/1.3 ui-monospace, monospace;\n}\n\n[data-componente='Tienda'] {\n  --color: #57534e;\n  padding: 1rem;\n}\n\n[data-componente='Filtros'] {\n  --color: #1d4ed8;\n}\n\n[data-componente='Resumen'] {\n  --color: #6d28d9;\n}\n\n[data-componente='ListaArticulos'] {\n  --color: #047857;\n  padding: 0.5rem;\n}\n\n[data-componente='TarjetaArticulo'] {\n  --color: #b45309;\n}",
  "anotaciones": [
    {
      "fragmento": "data-componente=\"Tienda\"",
      "nota": "La caja exterior, la app entera. Recibe el catálogo y reparte lo que necesita cada parte. Los atributos data-componente solo sirven para dibujar las cajas; en la versión de verdad no estarán."
    },
    {
      "fragmento": "data-componente=\"Filtros\"",
      "nota": "Todo lo que escribe o marca la persona que busca. Una sola responsabilidad: recoger los criterios de búsqueda."
    },
    {
      "fragmento": "data-componente=\"Resumen\"",
      "nota": "Una sola línea, pero con su propia responsabilidad: contar. Podría ir dentro de Tienda; separarla deja claro en el paso 4 que necesita los mismos datos que la lista."
    },
    {
      "fragmento": "data-componente=\"ListaArticulos\"",
      "nota": "Pinta el array de artículos, y decide qué enseñar cuando no queda ninguno."
    },
    {
      "fragmento": "<li className=\"caja tarjeta\" data-componente=\"TarjetaArticulo\">",
      "nota": "Un artículo del array, una tarjeta. Las tres cajas naranjas son el mismo componente con datos distintos: lo que en el código será un map."
    },
    {
      "fragmento": "<button type=\"button\">Ocultar detalle</button>",
      "nota": "El boceto enseña una tarjeta con su detalle abierto. No es otro componente: es la misma tarjeta en otro estado. Lo apuntamos para el paso 3."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Las cajas que están dentro de otras en el diseño son hijas de esas otras en la jerarquía. Ordenadas, quedan así:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "La jerarquía de El Trastero",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "trae el catálogo y se lo pasa a Tienda"
    },
    {
      "nombre": "Tienda",
      "nivel": 1,
      "nota": "la app entera"
    },
    {
      "nombre": "Filtros",
      "nivel": 2,
      "nota": "buscar, categoría, solo lo disponible"
    },
    {
      "nombre": "Resumen",
      "nivel": 2,
      "nota": "«Mostrando 8 de 8 artículos»"
    },
    {
      "nombre": "ListaArticulos",
      "nivel": 2,
      "nota": "la lista, o el aviso de que no hay nada"
    },
    {
      "nombre": "TarjetaArticulo",
      "nivel": 3,
      "clave": "1"
    },
    {
      "nombre": "TarjetaArticulo",
      "nivel": 3,
      "clave": "2"
    },
    {
      "nombre": "TarjetaArticulo",
      "nivel": 3,
      "clave": "…",
      "nota": "una por artículo"
    }
  ]
}
```

Hay decisiones discutibles, y está bien que lo sean. El título y el lema no tienen componente propio porque no hacen nada; si mañana la cabecera lleva un carrito y un menú, será una `Cabecera`. El precio de cada tarjeta tampoco: es una línea. **Corta donde haya una responsabilidad, no donde haya una etiqueta.** Si dudas, empieza con menos componentes; dividir uno que ha crecido es fácil, y la lección 3 ya te avisaba de cuándo hacerlo.

## Paso 2: construir una versión estática

Con la jerarquía clara, toca escribirla. **Primero, una versión que pinte los datos y no haga nada más**: ni un `useState`, ni un manejador. Las props son la única forma de que los datos lleguen de arriba abajo.

¿Por qué no hacer las dos cosas a la vez? Porque son trabajos distintos. La versión estática es mucho teclear y poco pensar: componentes, props, un `map`. La interactividad es al revés: pocas líneas, pero cada una exige pensar. Separarlas te deja concentrarte en una cosa cada vez, y lo que escribes ahora no se tira: es casi todo el JSX final.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El Trastero, versión estática",
  "consigna": "Recorre los archivos de arriba abajo: App entrega el catálogo a Tienda, y Tienda reparte. No hay ni un useState. Cambia un precio en articulos.jsx y se actualiza su tarjeta. Escribe en el buscador o marca la casilla: los campos cambian porque son campos normales del navegador, pero la lista no se entera. Eso es justo lo que falta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tienda from './Tienda'\nimport { ARTICULOS } from './articulos'\nimport './estilos.css'\n\nexport default function App() {\n  return <Tienda articulos={ARTICULOS} />\n}\n"
    },
    {
      "nombre": "Tienda.jsx",
      "codigo": "import Filtros from './Filtros'\nimport ListaArticulos from './ListaArticulos'\n\nfunction Resumen({ visibles, total }) {\n  return (\n    <p className=\"resumen\">\n      Mostrando {visibles} de {total} artículos\n    </p>\n  )\n}\n\nexport default function Tienda({ articulos }) {\n  return (\n    <main>\n      <h1>El Trastero</h1>\n      <p className=\"lema\">Segunda mano del barrio de la Magdalena</p>\n      <Filtros />\n      <Resumen visibles={articulos.length} total={articulos.length} />\n      <ListaArticulos articulos={articulos} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Filtros.jsx",
      "codigo": "const CATEGORIAS = ['Todas', 'Muebles', 'Electrónica', 'Libros', 'Deporte']\n\nexport default function Filtros() {\n  return (\n    <div role=\"search\" className=\"filtros\">\n      <label>\n        Buscar\n        <input type=\"search\" />\n      </label>\n      <label>\n        Categoría\n        <select>\n          {CATEGORIAS.map((categoria) => (\n            <option key={categoria}>{categoria}</option>\n          ))}\n        </select>\n      </label>\n      <label className=\"casilla\">\n        <input type=\"checkbox\" />\n        Solo lo disponible\n      </label>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "ListaArticulos.jsx",
      "codigo": "function TarjetaArticulo({ articulo }) {\n  return (\n    <li className=\"tarjeta\">\n      <h2>{articulo.titulo}</h2>\n      <p className=\"precio\">{articulo.precio} €</p>\n      <p className=\"estado\">\n        {articulo.estado}\n        {articulo.reservado && ' · Reservado'}\n      </p>\n      <button type=\"button\">Ver detalle</button>\n    </li>\n  )\n}\n\nexport default function ListaArticulos({ articulos }) {\n  if (articulos.length === 0) {\n    return <p className=\"vacio\">No hay nada que coincida con lo que buscas.</p>\n  }\n  return (\n    <ul className=\"lista\">\n      {articulos.map((articulo) => (\n        <TarjetaArticulo key={articulo.id} articulo={articulo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "articulos.jsx",
      "codigo": "export const ARTICULOS = [\n  {\n    id: 1,\n    titulo: 'Silla de enea',\n    categoria: 'Muebles',\n    precio: 25,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Asiento tejido de nuevo este invierno. Una pata es algo más clara que las otras.',\n  },\n  {\n    id: 2,\n    titulo: 'Cómoda de pino',\n    categoria: 'Muebles',\n    precio: 40,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Tres cajones que corren bien. Le falta un tirador y pide una mano de cera.',\n  },\n  {\n    id: 3,\n    titulo: 'Tocadiscos de maleta',\n    categoria: 'Electrónica',\n    precio: 60,\n    estado: 'Como nuevo',\n    reservado: true,\n    detalle: 'Tres velocidades y altavoz en la tapa. Aguja cambiada hace un mes.',\n  },\n  {\n    id: 4,\n    titulo: 'Radio de válvulas',\n    categoria: 'Electrónica',\n    precio: 35,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Enciende y sintoniza la onda media. El mueble de madera tiene golpes.',\n  },\n  {\n    id: 5,\n    titulo: 'Lote de novelas de Galdós',\n    categoria: 'Libros',\n    precio: 12,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Seis Episodios nacionales en edición de bolsillo de los años setenta.',\n  },\n  {\n    id: 6,\n    titulo: 'Atlas del mundo',\n    categoria: 'Libros',\n    precio: 20,\n    estado: 'Buen estado',\n    reservado: true,\n    detalle: 'Edición de 1985, con la URSS y las dos Alemanias. Tapa dura.',\n  },\n  {\n    id: 7,\n    titulo: 'Patines en línea',\n    categoria: 'Deporte',\n    precio: 18,\n    estado: 'Como nuevo',\n    reservado: false,\n    detalle: 'Talla 40. Usados dos veces; con protecciones de rodilla.',\n  },\n  {\n    id: 8,\n    titulo: 'Raqueta de tenis',\n    categoria: 'Deporte',\n    precio: 15,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Grip nuevo y cordaje en buen estado. Con funda.',\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.lema {\n  margin: 0 0 0.75rem;\n  color: #57534e;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  background: #f5f5f4;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\n.filtros .casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.lista {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  align-content: start;\n  gap: 0.3rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.tarjeta h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.estado {\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.detalle {\n  font-size: 0.9rem;\n}\n\n.tarjeta button {\n  justify-self: start;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.85rem;\n}\n\n.vacio {\n  padding: 1rem;\n  border: 1px dashed #a8a29e;\n  border-radius: 10px;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Tienda.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Tres cosas de esta versión que valen para cualquier app:

- **Los datos bajan en una sola dirección.** `App` le da el catálogo a `Tienda`; `Tienda` le da la lista a `ListaArticulos` y dos números a `Resumen`; `ListaArticulos` le da un artículo a cada tarjeta. Es el **flujo de datos en un solo sentido** (*one-way data flow*): ningún componente lee nada de su padre si el padre no se lo pasa.
- **Se puede construir de arriba abajo o de abajo arriba.** Empezar por `Tienda` e ir bajando suele ser más cómodo en una pantalla pequeña como esta; en un proyecto grande es habitual empezar por las piezas de abajo (`TarjetaArticulo`) y probarlas sueltas.
- **Lo que tienes es una biblioteca de componentes reutilizables.** `TarjetaArticulo` pinta cualquier artículo, y `ListaArticulos`, cualquier lista, también la vacía: cambia `ARTICULOS` por `[]` en `App.jsx` y verás su aviso.

## Paso 3: encontrar la representación mínima del estado

Para que la página reaccione hace falta estado. La pregunta es **cuál exactamente**. El principio es el que ya viste en la lección 24: **mínimo, pero completo**. Que no falte nada de lo que la app tiene que recordar, y que no sobre nada que se pueda calcular. Si haces una lista de la compra, guardas los productos; cuántos hay no lo guardas, lo cuentas con `length`.

Primero, haz inventario de todos los datos que aparecen en la pantalla. En El Trastero son siete:

1. El catálogo de artículos, con el detalle de cada uno.
2. El texto que se ha escrito en «Buscar».
3. La categoría elegida.
4. Si está marcada «Solo lo disponible».
5. Qué artículos se ven después de filtrar.
6. Cuántos se ven («Mostrando 5 de 8»).
7. Si el detalle de cada tarjeta está abierto o cerrado.

Después, pásale a cada uno tres de las preguntas que ya te hiciste en la lección 16: **¿se queda igual mientras se usa la app?** Entonces no es estado. **¿Llega por props?** Tampoco. **¿Se puede calcular a partir de otro estado o de las props?** Entonces, seguro que no lo es. Lo que quede, probablemente sí.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Los siete datos de la pantalla de El Trastero:\n// 1. El catálogo de artículos (llega de App)\n// 2. El texto de «Buscar»\n// 3. La categoría elegida\n// 4. Si está marcada «Solo lo disponible»\n// 5. Qué artículos se ven después de filtrar\n// 6. Cuántos se ven («Mostrando 5 de 8»)\n// 7. Si el detalle de cada tarjeta está abierto\n\n// ¿Cuáles de ellos tienen que ser estado?",
  "opciones": [
    "Todos menos el catálogo, que llega por props",
    "El texto de «Buscar», la categoría, la casilla y si el detalle está abierto",
    "El texto de «Buscar», la categoría, la casilla y los artículos que se ven",
    "Solo el texto de «Buscar» y la categoría: la casilla se puede leer del DOM"
  ],
  "correcta": 1,
  "explicacion": "El catálogo llega por props. Los artículos que se ven y cuántos son se calculan filtrando el catálogo con los tres criterios. Lo que queda cambia con el uso y no se saca de nada: lo que se ha escrito, la categoría, la casilla y si cada detalle está abierto. En React, el estado manda sobre los campos (lección 22): no se lee del DOM."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "El inventario, dato a dato",
  "items": [
    {
      "titulo": "1. El catálogo: no es estado",
      "texto": "Llega por props desde App. En una app real vendría de un servidor (lo verás en la lección 52), pero para Tienda es un dato que recibe, no que recuerda."
    },
    {
      "titulo": "2. El texto de «Buscar»: estado",
      "texto": "Cambia con cada tecla y no se puede sacar de ningún otro dato."
    },
    {
      "titulo": "3. La categoría elegida: estado",
      "texto": "Cambia cuando alguien elige otra, y nada permite deducirla."
    },
    {
      "titulo": "4. La casilla «Solo lo disponible»: estado",
      "texto": "Igual que la categoría: es una elección de quien usa la página."
    },
    {
      "titulo": "5. Los artículos que se ven: se calculan",
      "texto": "Son el catálogo filtrado con los tres datos anteriores. Guardarlos sería el error de la quesería de la lección 24: una copia que se queda vieja."
    },
    {
      "titulo": "6. Cuántos se ven: se calcula",
      "texto": "Es la longitud de la lista anterior, que tampoco se guarda."
    },
    {
      "titulo": "7. Si el detalle está abierto: estado",
      "texto": "Cambia al pulsar «Ver detalle» y no se deduce de nada. Hay uno por tarjeta, y eso importará en el paso siguiente."
    }
  ]
}
```

Cuatro datos de siete. Los otros tres se calculan en cada render, y así no pueden llevarse la contraria: si los artículos visibles estuvieran guardados aparte, cada cambio en los filtros o en el catálogo tendría que acordarse de actualizarlos.

Antes de convertir nada en estado, comprueba que la lista está **completa**, que con esos datos basta. Aquí los tres filtros son constantes y todo lo demás se calcula con ellos; el detalle de cada tarjeta lo dejamos para el paso siguiente:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "¿Bastan esos datos? Pruébalo con constantes",
  "consigna": "Cambia los valores de las tres constantes de Tienda.jsx: busqueda = 'de', categoria = 'Libros', soloDisponibles = true... La lista y el recuento se ponen al día solos. Con esos tres valores y el catálogo se puede pintar cualquier resultado del buscador: la representación está completa. Los campos de Filtros todavía no se enteran; eso es cosa del paso 4.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tienda from './Tienda'\nimport { ARTICULOS } from './articulos'\nimport './estilos.css'\n\nexport default function App() {\n  return <Tienda articulos={ARTICULOS} />\n}\n"
    },
    {
      "nombre": "Tienda.jsx",
      "codigo": "import Filtros from './Filtros'\nimport ListaArticulos from './ListaArticulos'\n\nfunction Resumen({ visibles, total }) {\n  return (\n    <p className=\"resumen\">\n      Mostrando {visibles} de {total} artículos\n    </p>\n  )\n}\n\nexport default function Tienda({ articulos }) {\n  // El estado mínimo, de momento como constantes. Cambia sus valores.\n  const busqueda = ''\n  const categoria = 'Todas'\n  const soloDisponibles = false\n\n  // Todo lo demás se calcula con ellos y con el catálogo\n  const texto = busqueda.trim().toLowerCase()\n  const visibles = articulos.filter(\n    (articulo) =>\n      articulo.titulo.toLowerCase().includes(texto) &&\n      (categoria === 'Todas' || articulo.categoria === categoria) &&\n      !(soloDisponibles && articulo.reservado),\n  )\n\n  return (\n    <main>\n      <h1>El Trastero</h1>\n      <p className=\"lema\">Segunda mano del barrio de la Magdalena</p>\n      <Filtros />\n      <Resumen visibles={visibles.length} total={articulos.length} />\n      <ListaArticulos articulos={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Filtros.jsx",
      "codigo": "const CATEGORIAS = ['Todas', 'Muebles', 'Electrónica', 'Libros', 'Deporte']\n\nexport default function Filtros() {\n  return (\n    <div role=\"search\" className=\"filtros\">\n      <label>\n        Buscar\n        <input type=\"search\" />\n      </label>\n      <label>\n        Categoría\n        <select>\n          {CATEGORIAS.map((categoria) => (\n            <option key={categoria}>{categoria}</option>\n          ))}\n        </select>\n      </label>\n      <label className=\"casilla\">\n        <input type=\"checkbox\" />\n        Solo lo disponible\n      </label>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "ListaArticulos.jsx",
      "codigo": "function TarjetaArticulo({ articulo }) {\n  return (\n    <li className=\"tarjeta\">\n      <h2>{articulo.titulo}</h2>\n      <p className=\"precio\">{articulo.precio} €</p>\n      <p className=\"estado\">\n        {articulo.estado}\n        {articulo.reservado && ' · Reservado'}\n      </p>\n      <button type=\"button\">Ver detalle</button>\n    </li>\n  )\n}\n\nexport default function ListaArticulos({ articulos }) {\n  if (articulos.length === 0) {\n    return <p className=\"vacio\">No hay nada que coincida con lo que buscas.</p>\n  }\n  return (\n    <ul className=\"lista\">\n      {articulos.map((articulo) => (\n        <TarjetaArticulo key={articulo.id} articulo={articulo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "articulos.jsx",
      "codigo": "export const ARTICULOS = [\n  {\n    id: 1,\n    titulo: 'Silla de enea',\n    categoria: 'Muebles',\n    precio: 25,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Asiento tejido de nuevo este invierno. Una pata es algo más clara que las otras.',\n  },\n  {\n    id: 2,\n    titulo: 'Cómoda de pino',\n    categoria: 'Muebles',\n    precio: 40,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Tres cajones que corren bien. Le falta un tirador y pide una mano de cera.',\n  },\n  {\n    id: 3,\n    titulo: 'Tocadiscos de maleta',\n    categoria: 'Electrónica',\n    precio: 60,\n    estado: 'Como nuevo',\n    reservado: true,\n    detalle: 'Tres velocidades y altavoz en la tapa. Aguja cambiada hace un mes.',\n  },\n  {\n    id: 4,\n    titulo: 'Radio de válvulas',\n    categoria: 'Electrónica',\n    precio: 35,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Enciende y sintoniza la onda media. El mueble de madera tiene golpes.',\n  },\n  {\n    id: 5,\n    titulo: 'Lote de novelas de Galdós',\n    categoria: 'Libros',\n    precio: 12,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Seis Episodios nacionales en edición de bolsillo de los años setenta.',\n  },\n  {\n    id: 6,\n    titulo: 'Atlas del mundo',\n    categoria: 'Libros',\n    precio: 20,\n    estado: 'Buen estado',\n    reservado: true,\n    detalle: 'Edición de 1985, con la URSS y las dos Alemanias. Tapa dura.',\n  },\n  {\n    id: 7,\n    titulo: 'Patines en línea',\n    categoria: 'Deporte',\n    precio: 18,\n    estado: 'Como nuevo',\n    reservado: false,\n    detalle: 'Talla 40. Usados dos veces; con protecciones de rodilla.',\n  },\n  {\n    id: 8,\n    titulo: 'Raqueta de tenis',\n    categoria: 'Deporte',\n    precio: 15,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Grip nuevo y cordaje en buen estado. Con funda.',\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.lema {\n  margin: 0 0 0.75rem;\n  color: #57534e;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  background: #f5f5f4;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\n.filtros .casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.lista {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  align-content: start;\n  gap: 0.3rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.tarjeta h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.estado {\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.detalle {\n  font-size: 0.9rem;\n}\n\n.tarjeta button {\n  justify-self: start;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.85rem;\n}\n\n.vacio {\n  padding: 1rem;\n  border: 1px dashed #a8a29e;\n  border-radius: 10px;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Tienda.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El filtrado que acabas de ver ya es el definitivo: en los pasos siguientes las constantes se convierten en estado, pero el cálculo no se toca.

## Paso 4: decidir dónde vive cada estado

Saber qué es estado no basta: hay que decidir **qué componente es su dueño**, el único que puede cambiarlo. Como los datos solo bajan, el dueño tiene que estar por encima de todos los que lo usan. Es la decisión que tomaste en la lección 25 con la cesta de la tetería, y se toma igual, dato a dato:

1. **¿Qué componentes lo usan?** Todos: los que pintan algo según su valor y los que lo cambian.
2. **¿Cuál es su antepasado común más cercano?** El componente más bajo que está por encima de todos ellos.
3. **¿Dónde lo pongo?** Casi siempre, en ese antepasado común. react.dev añade dos salidas: a veces conviene ponerlo en algún componente más arriba, y si ninguno tiene sentido como dueño, se crea uno nuevo solo para guardarlo.

Con los tres filtros:

- **Quién los usa**: `Filtros`, para enseñar lo escrito y lo elegido; `ListaArticulos`, que necesita la lista filtrada; y `Resumen`, que cuenta cuántos quedan.
- **Antepasado común**: `Tienda`.
- **Decisión**: los tres viven en `Tienda`, que además filtra el catálogo, porque es la única que tiene los filtros y el catálogo a la vez. Baja la lista ya filtrada a `ListaArticulos` y el recuento a `Resumen`.

Con el detalle abierto de cada tarjeta, la respuesta es la contraria:

- **Quién lo usa**: solo la propia tarjeta.
- **Decisión**: vive en `TarjetaArticulo`, y cada tarjeta tiene el suyo, como las notas de cata de cada ficha de la tetería.

Son dos caras de la misma regla: **el estado sube hasta el antepasado común de quienes lo usan, y ni un nivel más**. Lo que solo usa un componente se queda en él, para que un cambio no arrastre a componentes que no lo necesitan (lección 17).

Fíjate en un detalle de la decisión sobre los filtros: no solo el estado vive en `Tienda`, **también el cálculo que sale de él**. La lista filtrada la necesitan `ListaArticulos` y `Resumen`, así que se calcula en su antepasado común y baja ya hecha. En la tabla de productos de react.dev el filtrado está dentro de la propia tabla, porque allí nadie más lo necesita; aquí, si lo hiciera `ListaArticulos`, el resumen no tendría de dónde sacar cuántos se ven.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Dónde vive cada estado en El Trastero",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0
    },
    {
      "nombre": "Tienda",
      "nivel": 1,
      "etiqueta": "estado: los tres filtros",
      "nota": "busqueda, categoria y soloDisponibles; filtra el catálogo"
    },
    {
      "nombre": "Filtros",
      "nivel": 2,
      "nota": "← enseña los tres filtros"
    },
    {
      "nombre": "Resumen",
      "nivel": 2,
      "nota": "← recibe cuántos se ven y el total"
    },
    {
      "nombre": "ListaArticulos",
      "nivel": 2,
      "nota": "← recibe la lista ya filtrada"
    },
    {
      "nombre": "TarjetaArticulo",
      "nivel": 3,
      "clave": "1",
      "etiqueta": "estado: verDetalle"
    },
    {
      "nombre": "TarjetaArticulo",
      "nivel": 3,
      "clave": "2",
      "etiqueta": "estado: verDetalle"
    },
    {
      "nombre": "TarjetaArticulo",
      "nivel": 3,
      "clave": "…",
      "etiqueta": "estado: verDetalle"
    }
  ]
}
```

Así queda con el estado en su sitio: las tres constantes de antes son ahora `useState` en `Tienda`, los filtros bajan como props y los campos los enseñan con `value` y `checked`. Pero todavía nadie los cambia:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El estado en su sitio, pero sin cablear",
  "consigna": "Intenta escribir en el buscador o marcar la casilla: no se mueven, y la consola explica por qué. Después, en Tienda.jsx, cambia useState('') por useState('radio'): el campo y la lista cambian a la vez, porque los dos leen el mismo estado. En cambio, «Ver detalle» ya funciona: ese estado vive en la tarjeta, que es quien lo cambia.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tienda from './Tienda'\nimport { ARTICULOS } from './articulos'\nimport './estilos.css'\n\nexport default function App() {\n  return <Tienda articulos={ARTICULOS} />\n}\n"
    },
    {
      "nombre": "Tienda.jsx",
      "codigo": "import { useState } from 'react'\nimport Filtros from './Filtros'\nimport ListaArticulos from './ListaArticulos'\n\nfunction Resumen({ visibles, total }) {\n  return (\n    <p className=\"resumen\">\n      Mostrando {visibles} de {total} artículos\n    </p>\n  )\n}\n\nexport default function Tienda({ articulos }) {\n  const [busqueda, setBusqueda] = useState('')\n  const [categoria, setCategoria] = useState('Todas')\n  const [soloDisponibles, setSoloDisponibles] = useState(false)\n\n  const texto = busqueda.trim().toLowerCase()\n  const visibles = articulos.filter(\n    (articulo) =>\n      articulo.titulo.toLowerCase().includes(texto) &&\n      (categoria === 'Todas' || articulo.categoria === categoria) &&\n      !(soloDisponibles && articulo.reservado),\n  )\n\n  return (\n    <main>\n      <h1>El Trastero</h1>\n      <p className=\"lema\">Segunda mano del barrio de la Magdalena</p>\n      <Filtros busqueda={busqueda} categoria={categoria} soloDisponibles={soloDisponibles} />\n      <Resumen visibles={visibles.length} total={articulos.length} />\n      <ListaArticulos articulos={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Filtros.jsx",
      "codigo": "const CATEGORIAS = ['Todas', 'Muebles', 'Electrónica', 'Libros', 'Deporte']\n\nexport default function Filtros({ busqueda, categoria, soloDisponibles }) {\n  return (\n    <div role=\"search\" className=\"filtros\">\n      <label>\n        Buscar\n        <input type=\"search\" value={busqueda} />\n      </label>\n      <label>\n        Categoría\n        <select value={categoria}>\n          {CATEGORIAS.map((c) => (\n            <option key={c}>{c}</option>\n          ))}\n        </select>\n      </label>\n      <label className=\"casilla\">\n        <input type=\"checkbox\" checked={soloDisponibles} />\n        Solo lo disponible\n      </label>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "ListaArticulos.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction TarjetaArticulo({ articulo }) {\n  const [verDetalle, setVerDetalle] = useState(false)\n\n  return (\n    <li className=\"tarjeta\">\n      <h2>{articulo.titulo}</h2>\n      <p className=\"precio\">{articulo.precio} €</p>\n      <p className=\"estado\">\n        {articulo.estado}\n        {articulo.reservado && ' · Reservado'}\n      </p>\n      {verDetalle && <p className=\"detalle\">{articulo.detalle}</p>}\n      <button type=\"button\" aria-expanded={verDetalle} onClick={() => setVerDetalle(!verDetalle)}>\n        {verDetalle ? 'Ocultar detalle' : 'Ver detalle'}\n      </button>\n    </li>\n  )\n}\n\nexport default function ListaArticulos({ articulos }) {\n  if (articulos.length === 0) {\n    return <p className=\"vacio\">No hay nada que coincida con lo que buscas.</p>\n  }\n  return (\n    <ul className=\"lista\">\n      {articulos.map((articulo) => (\n        <TarjetaArticulo key={articulo.id} articulo={articulo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "articulos.jsx",
      "codigo": "export const ARTICULOS = [\n  {\n    id: 1,\n    titulo: 'Silla de enea',\n    categoria: 'Muebles',\n    precio: 25,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Asiento tejido de nuevo este invierno. Una pata es algo más clara que las otras.',\n  },\n  {\n    id: 2,\n    titulo: 'Cómoda de pino',\n    categoria: 'Muebles',\n    precio: 40,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Tres cajones que corren bien. Le falta un tirador y pide una mano de cera.',\n  },\n  {\n    id: 3,\n    titulo: 'Tocadiscos de maleta',\n    categoria: 'Electrónica',\n    precio: 60,\n    estado: 'Como nuevo',\n    reservado: true,\n    detalle: 'Tres velocidades y altavoz en la tapa. Aguja cambiada hace un mes.',\n  },\n  {\n    id: 4,\n    titulo: 'Radio de válvulas',\n    categoria: 'Electrónica',\n    precio: 35,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Enciende y sintoniza la onda media. El mueble de madera tiene golpes.',\n  },\n  {\n    id: 5,\n    titulo: 'Lote de novelas de Galdós',\n    categoria: 'Libros',\n    precio: 12,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Seis Episodios nacionales en edición de bolsillo de los años setenta.',\n  },\n  {\n    id: 6,\n    titulo: 'Atlas del mundo',\n    categoria: 'Libros',\n    precio: 20,\n    estado: 'Buen estado',\n    reservado: true,\n    detalle: 'Edición de 1985, con la URSS y las dos Alemanias. Tapa dura.',\n  },\n  {\n    id: 7,\n    titulo: 'Patines en línea',\n    categoria: 'Deporte',\n    precio: 18,\n    estado: 'Como nuevo',\n    reservado: false,\n    detalle: 'Talla 40. Usados dos veces; con protecciones de rodilla.',\n  },\n  {\n    id: 8,\n    titulo: 'Raqueta de tenis',\n    categoria: 'Deporte',\n    precio: 15,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Grip nuevo y cordaje en buen estado. Con funda.',\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.lema {\n  margin: 0 0 0.75rem;\n  color: #57534e;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  background: #f5f5f4;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\n.filtros .casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.lista {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  align-content: start;\n  gap: 0.3rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.tarjeta h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.estado {\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.detalle {\n  font-size: 0.9rem;\n}\n\n.tarjeta button {\n  justify-self: start;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.85rem;\n}\n\n.vacio {\n  padding: 1rem;\n  border: 1px dashed #a8a29e;\n  border-radius: 10px;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Tienda.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La consola trae tres avisos, uno por campo. El del buscador es el que ya conoces de la lección 22:

```text
You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.
```

El de la casilla dice lo mismo con `checked` y `defaultChecked`. Y el del desplegable acaba en «Otherwise, set `onChange`», sin `readOnly`. Esta vez no hay que elegir entre las salidas que propone: el campo tiene que ser controlado, pero quien puede cambiar su estado no es `Filtros`, sino `Tienda`. Falta un último paso.

## Paso 5: añadir el flujo de datos inverso

Ahora los datos bajan bien, pero lo que pasa abajo (una tecla en el buscador) tiene que cambiar un estado que vive arriba. **Solo el dueño de un estado puede cambiarlo**, así que `Tienda` le pasa a `Filtros` las funciones para hacerlo, y `Filtros` las llama desde sus manejadores. Es el patrón de la lección 15, una prop de evento con nombre propio (`on` + verbo), aplicado a un estado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// En Tienda.jsx\n<Filtros\n  busqueda={busqueda}\n  categoria={categoria}\n  soloDisponibles={soloDisponibles}\n  onCambiarBusqueda={setBusqueda}\n  onCambiarCategoria={setCategoria}\n  onCambiarSoloDisponibles={setSoloDisponibles}\n/>\n\n// En Filtros.jsx\n<input type=\"search\" value={busqueda} onChange={(e) => onCambiarBusqueda(e.target.value)} />\n\n<select value={categoria} onChange={(e) => onCambiarCategoria(e.target.value)}>\n\n<input\n  type=\"checkbox\"\n  checked={soloDisponibles}\n  onChange={(e) => onCambiarSoloDisponibles(e.target.checked)}\n/>",
  "anotaciones": [
    {
      "fragmento": "onCambiarBusqueda={setBusqueda}",
      "nota": "Tienda no le da a Filtros su estado para que lo cambie: le da una función que lo cambia. Aquí basta con la propia función set; si hiciera falta algo más (por ejemplo, volver a la primera página de resultados), Tienda pasaría una función suya que hiciera las dos cosas."
    },
    {
      "fragmento": "busqueda={busqueda}",
      "nota": "El valor sigue bajando como antes. Datos hacia abajo, avisos hacia arriba: cada uno por su prop."
    },
    {
      "fragmento": "onCambiarBusqueda(e.target.value)",
      "nota": "Filtros sube el valor, no el evento. Tienda no necesita saber que hay un input, ni cómo se lee: si mañana la búsqueda se hace con botones de sugerencia, Tienda no cambia."
    },
    {
      "fragmento": "onCambiarSoloDisponibles(e.target.checked)",
      "nota": "En una casilla, lo que interesa es checked, no value (lección 22). De nuevo, quien conoce ese detalle del DOM es Filtros, y a Tienda le llega un booleano."
    }
  ]
}
```

Con esto el ciclo se cierra: escribes una letra, `Filtros` llama a `onCambiarBusqueda`, que es el `setBusqueda` de `Tienda`; `Tienda` se vuelve a renderizar con la búsqueda nueva, filtra el catálogo y baja a cada componente lo que le toca. React hace explícito este camino de vuelta: cuesta algo más de teclear que el enlace de doble sentido entre campo y dato (*two-way data binding*) de otros frameworks, pero siempre sabes quién cambia qué.

Esta es la app terminada, con el panel «Árbol de renders» abierto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El Trastero, terminado",
  "consigna": "Escribe «r» en el buscador y lee el árbol: qué se renderiza, por qué, y qué tarjetas se desmontan. Después borra la letra y pulsa «Ver detalle» en una tarjeta: compara cuántos componentes se mueven en cada caso. Por último, elige «Libros» y marca «Solo lo disponible»: el atlas, que está reservado, desaparece de la lista y del recuento a la vez, porque los dos salen del mismo estado.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tienda from './Tienda'\nimport { ARTICULOS } from './articulos'\nimport './estilos.css'\n\nexport default function App() {\n  return <Tienda articulos={ARTICULOS} />\n}\n"
    },
    {
      "nombre": "Tienda.jsx",
      "codigo": "import { useState } from 'react'\nimport Filtros from './Filtros'\nimport ListaArticulos from './ListaArticulos'\n\nfunction Resumen({ visibles, total }) {\n  return (\n    <p className=\"resumen\">\n      Mostrando {visibles} de {total} artículos\n    </p>\n  )\n}\n\nexport default function Tienda({ articulos }) {\n  const [busqueda, setBusqueda] = useState('')\n  const [categoria, setCategoria] = useState('Todas')\n  const [soloDisponibles, setSoloDisponibles] = useState(false)\n\n  const texto = busqueda.trim().toLowerCase()\n  const visibles = articulos.filter(\n    (articulo) =>\n      articulo.titulo.toLowerCase().includes(texto) &&\n      (categoria === 'Todas' || articulo.categoria === categoria) &&\n      !(soloDisponibles && articulo.reservado),\n  )\n\n  return (\n    <main>\n      <h1>El Trastero</h1>\n      <p className=\"lema\">Segunda mano del barrio de la Magdalena</p>\n      <Filtros\n        busqueda={busqueda}\n        categoria={categoria}\n        soloDisponibles={soloDisponibles}\n        onCambiarBusqueda={setBusqueda}\n        onCambiarCategoria={setCategoria}\n        onCambiarSoloDisponibles={setSoloDisponibles}\n      />\n      <Resumen visibles={visibles.length} total={articulos.length} />\n      <ListaArticulos articulos={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Filtros.jsx",
      "codigo": "const CATEGORIAS = ['Todas', 'Muebles', 'Electrónica', 'Libros', 'Deporte']\n\nexport default function Filtros({\n  busqueda,\n  categoria,\n  soloDisponibles,\n  onCambiarBusqueda,\n  onCambiarCategoria,\n  onCambiarSoloDisponibles,\n}) {\n  return (\n    <div role=\"search\" className=\"filtros\">\n      <label>\n        Buscar\n        <input type=\"search\" value={busqueda} onChange={(e) => onCambiarBusqueda(e.target.value)} />\n      </label>\n      <label>\n        Categoría\n        <select value={categoria} onChange={(e) => onCambiarCategoria(e.target.value)}>\n          {CATEGORIAS.map((c) => (\n            <option key={c}>{c}</option>\n          ))}\n        </select>\n      </label>\n      <label className=\"casilla\">\n        <input\n          type=\"checkbox\"\n          checked={soloDisponibles}\n          onChange={(e) => onCambiarSoloDisponibles(e.target.checked)}\n        />\n        Solo lo disponible\n      </label>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "ListaArticulos.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction TarjetaArticulo({ articulo }) {\n  const [verDetalle, setVerDetalle] = useState(false)\n\n  return (\n    <li className=\"tarjeta\">\n      <h2>{articulo.titulo}</h2>\n      <p className=\"precio\">{articulo.precio} €</p>\n      <p className=\"estado\">\n        {articulo.estado}\n        {articulo.reservado && ' · Reservado'}\n      </p>\n      {verDetalle && <p className=\"detalle\">{articulo.detalle}</p>}\n      <button type=\"button\" aria-expanded={verDetalle} onClick={() => setVerDetalle(!verDetalle)}>\n        {verDetalle ? 'Ocultar detalle' : 'Ver detalle'}\n      </button>\n    </li>\n  )\n}\n\nexport default function ListaArticulos({ articulos }) {\n  if (articulos.length === 0) {\n    return <p className=\"vacio\">No hay nada que coincida con lo que buscas.</p>\n  }\n  return (\n    <ul className=\"lista\">\n      {articulos.map((articulo) => (\n        <TarjetaArticulo key={articulo.id} articulo={articulo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "articulos.jsx",
      "codigo": "export const ARTICULOS = [\n  {\n    id: 1,\n    titulo: 'Silla de enea',\n    categoria: 'Muebles',\n    precio: 25,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Asiento tejido de nuevo este invierno. Una pata es algo más clara que las otras.',\n  },\n  {\n    id: 2,\n    titulo: 'Cómoda de pino',\n    categoria: 'Muebles',\n    precio: 40,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Tres cajones que corren bien. Le falta un tirador y pide una mano de cera.',\n  },\n  {\n    id: 3,\n    titulo: 'Tocadiscos de maleta',\n    categoria: 'Electrónica',\n    precio: 60,\n    estado: 'Como nuevo',\n    reservado: true,\n    detalle: 'Tres velocidades y altavoz en la tapa. Aguja cambiada hace un mes.',\n  },\n  {\n    id: 4,\n    titulo: 'Radio de válvulas',\n    categoria: 'Electrónica',\n    precio: 35,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Enciende y sintoniza la onda media. El mueble de madera tiene golpes.',\n  },\n  {\n    id: 5,\n    titulo: 'Lote de novelas de Galdós',\n    categoria: 'Libros',\n    precio: 12,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Seis Episodios nacionales en edición de bolsillo de los años setenta.',\n  },\n  {\n    id: 6,\n    titulo: 'Atlas del mundo',\n    categoria: 'Libros',\n    precio: 20,\n    estado: 'Buen estado',\n    reservado: true,\n    detalle: 'Edición de 1985, con la URSS y las dos Alemanias. Tapa dura.',\n  },\n  {\n    id: 7,\n    titulo: 'Patines en línea',\n    categoria: 'Deporte',\n    precio: 18,\n    estado: 'Como nuevo',\n    reservado: false,\n    detalle: 'Talla 40. Usados dos veces; con protecciones de rodilla.',\n  },\n  {\n    id: 8,\n    titulo: 'Raqueta de tenis',\n    categoria: 'Deporte',\n    precio: 15,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Grip nuevo y cordaje en buen estado. Con funda.',\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.lema {\n  margin: 0 0 0.75rem;\n  color: #57534e;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  background: #f5f5f4;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\n.filtros .casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.lista {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  align-content: start;\n  gap: 0.3rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.tarjeta h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.estado {\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.detalle {\n  font-size: 0.9rem;\n}\n\n.tarjeta button {\n  justify-self: start;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.85rem;\n}\n\n.vacio {\n  padding: 1rem;\n  border: 1px dashed #a8a29e;\n  border-radius: 10px;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Filtros.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Esto es lo que cuenta el árbol en cada caso:

- **Al escribir «r»**: `Tienda` ← «cambió su estado n.º 1», su primer `useState`, la búsqueda. Debajo, cada hijo dice qué le ha llegado distinto: `Filtros` ← «cambió la prop «busqueda»», `Resumen` ← «cambió la prop «visibles»» y `ListaArticulos` ← «cambió la prop «articulos» (array nuevo)», porque `filter` crea un array nuevo en cada render. De las ocho tarjetas, seis se desmontan; las de la radio y la raqueta, las únicas con una «r», se renderizan porque «se renderizó su padre». `App`, que está por encima del estado, se queda sin cambios.
- **Al pulsar «Ver detalle»**: solo esa `TarjetaArticulo` ← «cambió su estado». Todo lo demás, sin cambios, y en la página cambian dos cosas: el párrafo del detalle y el botón. Es la recompensa del paso 4: un estado que usa un solo componente solo mueve a ese componente.

Fíjate también en lo que no sale. `Filtros` recibe tres funciones, y ninguna aparece como prop cambiada: son las funciones `set` de `useState`, y React le da a cada una la misma identidad en todos los renders. Si `Tienda` le pasara una función escrita en su cuerpo, saldría como «función nueva» en cada tecla; por qué eso a veces importa es la lección 67.

Y una curiosidad que conecta con la lección 26: abre el detalle de la silla, escribe «r» y bórrala. La silla vuelve, pero con el detalle cerrado. Al filtrarla se desmontó, y su estado se fue con ella; al volver, se monta desde cero.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Son los mismos cinco pasos de la lección 23",
      "realidad": "Se parecen en el centro (buscar el estado mínimo), pero miran cosas distintas. Los de la 23 recorren los estados visuales de un componente; estos van de un diseño a una pantalla de componentes y deciden dónde vive cada dato."
    },
    {
      "mito": "Los pasos se siguen una vez y en orden estricto",
      "realidad": "Son un orden para pensar, no un ritual. Cuando el diseño cambia, se vuelve al paso que toca: un filtro nuevo es repetir los pasos 3, 4 y 5 para un dato más, como en el ejercicio de esta lección."
    },
    {
      "mito": "La versión estática es trabajo que luego se tira",
      "realidad": "Es casi todo el JSX final. Los pasos 3 a 5 añaden unos pocos useState, el filtrado y unas props; el resto se queda tal cual."
    },
    {
      "mito": "El estado tiene que estar lo más arriba posible, por si acaso",
      "realidad": "Tan abajo como se pueda, pero tan arriba como haga falta: en el antepasado común de quienes lo usan. Subirlo de más hace que cada cambio renderice ramas que no lo necesitan."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cuando te pasan un diseño",
      "texto": "Antes de abrir el editor: cajas sobre el diseño, la jerarquía y la lista de datos. Diez minutos de papel ahorran reescribir medio componente cuando descubres que un estado vivía en el sitio equivocado."
    },
    {
      "titulo": "Cuando llega un requisito nuevo",
      "texto": "Un filtro más, un contador en la cabecera, un botón de favoritos: cada uno es un dato nuevo que pasa por los pasos 3, 4 y 5. ¿Es estado? ¿Quién lo usa? ¿Quién lo cambia?"
    },
    {
      "titulo": "Cuando un componente ha crecido demasiado",
      "texto": "El paso 1 aplicado a lo que ya existe: dibuja las cajas sobre lo que pinta y verás por dónde partirlo."
    },
    {
      "titulo": "Al revisar código",
      "texto": "Las preguntas del método detectan los fallos de estado más comunes: datos guardados que se podrían calcular, el mismo dato en dos componentes y estados que viven lejos de quien los usa."
    }
  ]
}
```

## Errores típicos

**Calcular en el sitio equivocado.** Como avisaba el paso 4, la regla vale también para lo que se calcula: si el filtrado se hace donde solo lo ve un componente, los demás no pueden enterarse del resultado. Aquí, `ListaArticulos` filtra por su cuenta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function ListaArticulos({ articulos, busqueda }) {\n  const visibles = articulos.filter((a) => a.titulo.toLowerCase().includes(busqueda))\n  return (\n    <ul className=\"lista\">\n      {visibles.map((articulo) => (\n        <TarjetaArticulo key={articulo.id} articulo={articulo} />\n      ))}\n    </ul>\n  )\n}\n\nfunction Tienda({ articulos }) {\n  const [busqueda, setBusqueda] = useState('')\n  return (\n    <main>\n      <Filtros busqueda={busqueda} onCambiarBusqueda={setBusqueda} />\n      <Resumen visibles={articulos.length} total={articulos.length} />\n      <ListaArticulos articulos={articulos} busqueda={busqueda} />\n    </main>\n  )\n}\n\n// Con los ocho artículos de El Trastero, escribes «r» en el buscador.\n// La lista enseña la radio y la raqueta. ¿Qué dice el resumen?",
  "opciones": [
    "Mostrando 2 de 8 artículos",
    "Mostrando 8 de 8 artículos",
    "Mostrando 0 de 8 artículos",
    "Nada: Resumen no recibe la búsqueda y falla"
  ],
  "correcta": 1,
  "explicacion": "La lista filtrada solo existe dentro de ListaArticulos, y los datos no suben: Tienda no la tiene, así que solo puede pasarle a Resumen el total. Copiar el filtro dentro de Resumen arreglaría el número, pero tendrías la misma lógica en dos sitios. Lo que necesitan varios componentes, aunque sea un cálculo, se hace en su antepasado común y baja ya hecho."
}
```

**Guardar el mismo dato en dos componentes.** Si `Filtros` tuviera su propio `useState` para la búsqueda y `Tienda` el suyo, el campo cambiaría y la lista no: dos estados que se llaman igual, cada uno con su dueño. Es la churrería de la lección 25, y el paso 4 existe para evitarla.

**Saltarse la versión estática.** Empezar escribiendo `useState` antes de tener los componentes lleva a meter en el estado todo lo que se ve, incluido lo que se podría calcular. Con la versión estática delante, cada dato que añades al estado es una decisión.

**Guardar lo que se calcula.** La lista filtrada y el recuento no son estado. Si los guardas, cualquier cambio en los filtros o en el catálogo tiene que acordarse de actualizarlos, y el día que uno no se acuerde, la pantalla mentirá. Lo viste con la quesería de la lección 24.

**Subir todo el estado a la raíz «por si acaso».** Ya lo viste en la lección 25. Aquí, si `verDetalle` viviera en `Tienda`, haría falta guardar qué tarjetas están abiertas (un `Set` de ids), bajarlo a cada tarjeta con su función para cambiarlo, y cada clic en «Ver detalle» volvería a renderizar los filtros, el resumen y todas las tarjetas. Súbelo cuando otro componente lo necesite de verdad, por ejemplo si apareciera un botón «Cerrar todos los detalles».

**Olvidar el flujo inverso.** Un campo con `value` y sin `onChange` no deja escribir. Si el estado vive arriba, el manejador de abajo tiene que llamar a una función que le llegue por props.

## Ejercicios

La diseñadora ha añadido un control nuevo al boceto: un desplegable **«Precio máximo»** con tres opciones, «Sin límite», «Hasta 20 €» y «Hasta 40 €». Añádelo siguiendo los pasos, en vez de buscar dónde encajarlo:

- **Paso 3**: ¿es estado? ¿Se puede calcular a partir de algo que ya tienes?
- **Paso 4**: ¿qué componentes lo usan? ¿Dónde vive?
- **Paso 5**: ¿quién lo cambia y cómo le llega la función?

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un filtro nuevo: «Precio máximo»",
  "consigna": "Añade el desplegable con la etiqueta «Precio máximo» en Filtros.jsx y el estado y el filtro en Tienda.jsx. Pista: el valor de un desplegable siempre es texto (lección 22), así que si «Sin límite» lleva un value vacío y las demás value=\"20\" y value=\"40\", tendrás que convertir con Number al comparar. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tienda from './Tienda'\nimport { ARTICULOS } from './articulos'\nimport './estilos.css'\n\nexport default function App() {\n  return <Tienda articulos={ARTICULOS} />\n}\n"
    },
    {
      "nombre": "Tienda.jsx",
      "codigo": "import { useState } from 'react'\nimport Filtros from './Filtros'\nimport ListaArticulos from './ListaArticulos'\n\nfunction Resumen({ visibles, total }) {\n  return (\n    <p className=\"resumen\">\n      Mostrando {visibles} de {total} artículos\n    </p>\n  )\n}\n\nexport default function Tienda({ articulos }) {\n  const [busqueda, setBusqueda] = useState('')\n  const [categoria, setCategoria] = useState('Todas')\n  const [soloDisponibles, setSoloDisponibles] = useState(false)\n  // Ejercicio: el filtro «Precio máximo». Sigue los pasos 3, 4 y 5:\n  // ¿es estado?, ¿dónde vive?, ¿quién lo cambia y cómo le llega la función?\n\n  const texto = busqueda.trim().toLowerCase()\n  const visibles = articulos.filter(\n    (articulo) =>\n      articulo.titulo.toLowerCase().includes(texto) &&\n      (categoria === 'Todas' || articulo.categoria === categoria) &&\n      !(soloDisponibles && articulo.reservado),\n  )\n\n  return (\n    <main>\n      <h1>El Trastero</h1>\n      <p className=\"lema\">Segunda mano del barrio de la Magdalena</p>\n      <Filtros\n        busqueda={busqueda}\n        categoria={categoria}\n        soloDisponibles={soloDisponibles}\n        onCambiarBusqueda={setBusqueda}\n        onCambiarCategoria={setCategoria}\n        onCambiarSoloDisponibles={setSoloDisponibles}\n      />\n      <Resumen visibles={visibles.length} total={articulos.length} />\n      <ListaArticulos articulos={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Filtros.jsx",
      "codigo": "const CATEGORIAS = ['Todas', 'Muebles', 'Electrónica', 'Libros', 'Deporte']\n\nexport default function Filtros({\n  busqueda,\n  categoria,\n  soloDisponibles,\n  onCambiarBusqueda,\n  onCambiarCategoria,\n  onCambiarSoloDisponibles,\n}) {\n  return (\n    <div role=\"search\" className=\"filtros\">\n      <label>\n        Buscar\n        <input type=\"search\" value={busqueda} onChange={(e) => onCambiarBusqueda(e.target.value)} />\n      </label>\n      <label>\n        Categoría\n        <select value={categoria} onChange={(e) => onCambiarCategoria(e.target.value)}>\n          {CATEGORIAS.map((c) => (\n            <option key={c}>{c}</option>\n          ))}\n        </select>\n      </label>\n      <label className=\"casilla\">\n        <input\n          type=\"checkbox\"\n          checked={soloDisponibles}\n          onChange={(e) => onCambiarSoloDisponibles(e.target.checked)}\n        />\n        Solo lo disponible\n      </label>\n      {/* Ejercicio: el desplegable «Precio máximo», con las opciones\n          «Sin límite», «Hasta 20 €» y «Hasta 40 €» */}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "ListaArticulos.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction TarjetaArticulo({ articulo }) {\n  const [verDetalle, setVerDetalle] = useState(false)\n\n  return (\n    <li className=\"tarjeta\">\n      <h2>{articulo.titulo}</h2>\n      <p className=\"precio\">{articulo.precio} €</p>\n      <p className=\"estado\">\n        {articulo.estado}\n        {articulo.reservado && ' · Reservado'}\n      </p>\n      {verDetalle && <p className=\"detalle\">{articulo.detalle}</p>}\n      <button type=\"button\" aria-expanded={verDetalle} onClick={() => setVerDetalle(!verDetalle)}>\n        {verDetalle ? 'Ocultar detalle' : 'Ver detalle'}\n      </button>\n    </li>\n  )\n}\n\nexport default function ListaArticulos({ articulos }) {\n  if (articulos.length === 0) {\n    return <p className=\"vacio\">No hay nada que coincida con lo que buscas.</p>\n  }\n  return (\n    <ul className=\"lista\">\n      {articulos.map((articulo) => (\n        <TarjetaArticulo key={articulo.id} articulo={articulo} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "articulos.jsx",
      "codigo": "export const ARTICULOS = [\n  {\n    id: 1,\n    titulo: 'Silla de enea',\n    categoria: 'Muebles',\n    precio: 25,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Asiento tejido de nuevo este invierno. Una pata es algo más clara que las otras.',\n  },\n  {\n    id: 2,\n    titulo: 'Cómoda de pino',\n    categoria: 'Muebles',\n    precio: 40,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Tres cajones que corren bien. Le falta un tirador y pide una mano de cera.',\n  },\n  {\n    id: 3,\n    titulo: 'Tocadiscos de maleta',\n    categoria: 'Electrónica',\n    precio: 60,\n    estado: 'Como nuevo',\n    reservado: true,\n    detalle: 'Tres velocidades y altavoz en la tapa. Aguja cambiada hace un mes.',\n  },\n  {\n    id: 4,\n    titulo: 'Radio de válvulas',\n    categoria: 'Electrónica',\n    precio: 35,\n    estado: 'Para restaurar',\n    reservado: false,\n    detalle: 'Enciende y sintoniza la onda media. El mueble de madera tiene golpes.',\n  },\n  {\n    id: 5,\n    titulo: 'Lote de novelas de Galdós',\n    categoria: 'Libros',\n    precio: 12,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Seis Episodios nacionales en edición de bolsillo de los años setenta.',\n  },\n  {\n    id: 6,\n    titulo: 'Atlas del mundo',\n    categoria: 'Libros',\n    precio: 20,\n    estado: 'Buen estado',\n    reservado: true,\n    detalle: 'Edición de 1985, con la URSS y las dos Alemanias. Tapa dura.',\n  },\n  {\n    id: 7,\n    titulo: 'Patines en línea',\n    categoria: 'Deporte',\n    precio: 18,\n    estado: 'Como nuevo',\n    reservado: false,\n    detalle: 'Talla 40. Usados dos veces; con protecciones de rodilla.',\n  },\n  {\n    id: 8,\n    titulo: 'Raqueta de tenis',\n    categoria: 'Deporte',\n    precio: 15,\n    estado: 'Buen estado',\n    reservado: false,\n    detalle: 'Grip nuevo y cordaje en buen estado. Con funda.',\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 40rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.lema {\n  margin: 0 0 0.75rem;\n  color: #57534e;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border-radius: 10px;\n  background: #f5f5f4;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\n.filtros .casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.35rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.lista {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));\n  gap: 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  align-content: start;\n  gap: 0.3rem;\n  padding: 0.6rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.tarjeta h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n.estado {\n  color: #57534e;\n  font-size: 0.85rem;\n}\n\n.detalle {\n  font-size: 0.9rem;\n}\n\n.tarjeta button {\n  justify-self: start;\n  padding: 0.15rem 0.5rem;\n  font-size: 0.85rem;\n}\n\n.vacio {\n  padding: 1rem;\n  border: 1px dashed #a8a29e;\n  border-radius: 10px;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Tienda.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Con «Hasta 20 €», desaparece la silla de enea, que cuesta 25 €",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Precio máximo",
            "opcion": "Hasta 20 €"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "heading",
          "nombre": "Silla de enea"
        }
      }
    },
    {
      "descripcion": "Con «Hasta 20 €», siguen a la vista los patines, que cuestan 18 €",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Precio máximo",
            "opcion": "Hasta 20 €"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Patines en línea"
      }
    },
    {
      "descripcion": "El resumen cuenta solo lo que cuesta 20 € o menos",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Precio máximo",
            "opcion": "Hasta 20 €"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 4 de 8 artículos"
      }
    },
    {
      "descripcion": "El precio máximo se combina con la categoría y con «Solo lo disponible»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Categoría",
            "opcion": "Libros"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Solo lo disponible"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Precio máximo",
            "opcion": "Hasta 20 €"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 1 de 8 artículos"
      }
    },
    {
      "descripcion": "Al volver a «Sin límite», se ven otra vez los ocho artículos",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Precio máximo",
            "opcion": "Hasta 20 €"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Precio máximo",
            "opcion": "Sin límite"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 8 de 8 artículos"
      }
    }
  ]
}
```

Si lo has hecho siguiendo los pasos, habrás llegado a lo mismo que con los otros tres filtros: es estado (nada permite deducirlo), lo usan `Filtros` y, a través del filtrado, `Resumen` y `ListaArticulos`, así que vive en `Tienda`; y `Filtros` lo cambia con un `onCambiarPrecioMaximo` que le llega por props.

**Retos para seguir practicando** (sin comprobación automática):

1. Añade un botón «Quitar filtros» que deje los cuatro filtros como al principio. ¿En qué componente tiene que estar la función que lo hace? ¿Podrías ponerlo dentro de `Filtros`?
2. Añade favoritos: un botón «Guardar» en cada tarjeta y un contador «Guardados: 2» junto al título. Antes de escribir código, decide con los pasos 3 y 4 qué es estado y dónde vive. ¿Por qué no puede vivir en `TarjetaArticulo`, como `verDetalle`?
3. Añade un desplegable «Ordenar por» (precio de menor a mayor o de mayor a menor). ¿Es estado el orden? ¿Y la lista ordenada? Ordena con `toSorted` (lección 21) en el mismo sitio donde filtras.
4. Aplica los cinco pasos a otra pantalla, sin el ordenador: el horario de la piscina municipal, con una lista de clases (natación, aquagym, bebés), un selector de día, una casilla «Solo con plazas libres» y un botón «Reservar» en cada clase. Dibuja la jerarquía, haz el inventario de datos y decide dónde vive cada estado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Thinking in React",
      "descripcion": "La página de react.dev en la que se basa esta lección: los cinco pasos con una tabla de productos filtrable, de los datos de la API a la app terminada.",
      "url": "https://react.dev/learn/thinking-in-react",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Choosing the State Structure",
      "descripcion": "Los principios para un estado mínimo y sin contradicciones que usa el paso 3. Es la lección 24.",
      "url": "https://react.dev/learn/choosing-the-state-structure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Sharing State Between Components",
      "descripcion": "Cómo levantar el estado al antepasado común y pasarle a los hijos las funciones para cambiarlo: los pasos 4 y 5 a fondo. Es la lección 25.",
      "url": "https://react.dev/learn/sharing-state-between-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Reacting to Input with State",
      "descripcion": "El otro método en cinco pasos, para los estados visuales de un componente. Es la lección 23.",
      "url": "https://react.dev/learn/reacting-to-input-with-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Separación de intereses",
      "descripcion": "El principio de diseño que react.dev propone para decidir dónde cortar en el paso 1: cada pieza se ocupa de una sola cosa.",
      "url": "https://es.wikipedia.org/wiki/Separaci%C3%B3n_de_intereses",
      "etiqueta": "Wikipedia"
    }
  ]
}
```
