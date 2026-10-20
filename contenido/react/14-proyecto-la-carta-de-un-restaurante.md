# Proyecto: la carta de un restaurante

- **Módulo:** Describir la interfaz
- **Slug:** `proyecto-la-carta-de-un-restaurante` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) + [Conditional Rendering](https://react.dev/learn/conditional-rendering) + [Rendering Lists](https://react.dev/learn/rendering-lists) + [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) + [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree) — ver `contenido/react/TEMARIO.md` #14
- **Requiere:** Módulo 2 completo (lecciones 8 a 13)

---

## Qué vas a construir

La carta de una taberna, como la que te dan al sentarte: el nombre de la casa, tres secciones (entrantes, principales y postres) y, en cada plato, su descripción, su precio en euros y sus alérgenos. Los vegetarianos llevan su etiqueta, el plato del día va destacado, lo que se ha acabado dice «Agotado» en lugar del precio y, al final, un índice de alérgenos para quien tenga alguna alergia.

Los estilos ya están hechos: este proyecto no va de CSS. Va de **construir toda la interfaz a partir de datos**. La carta sale de un array de platos: si cambias un precio o marcas un plato como agotado en los datos, la carta cambia sola, sin tocar el JSX. Por el camino usarás todo el módulo 2: props, `children`, renderizado condicional, listas con `key`, componentes puros y el árbol que forman.

Todavía no hay nada que pulsar: la carta es estática. Los botones, los filtros y el estado llegan en el módulo 3.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Se hace aquí mismo, en el navegador",
  "contenido": "Cada paso es un bloque React en vivo: pestañas con los archivos, la vista previa debajo y el botón «Comprobar», que revisa tu carta y te dice qué falta. Cada paso empieza con la solución del anterior ya escrita, así que si te atascas puedes seguir en el siguiente. Lo que cambias en un bloque no pasa al siguiente, y «Reiniciar» lo deja como estaba."
}
```

Si prefieres hacerlo en tu ordenador, crea un proyecto con Vite como en la lección 2 y copia en `src/` los archivos de cada paso: el `App.jsx` de cada paso sustituye al de la plantilla. Para que se vea igual que aquí, quita también de `main.jsx` la importación de `index.css`, que trae los estilos de la plantilla.

## Las piezas de la carta

Antes de escribir código, decide qué piezas tiene la carta. La pista está en lo que se repite: la ficha de un plato aparece once veces con datos distintos, y una sección, tres veces con contenido distinto dentro.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres componentes y un archivo de datos",
  "roles": [
    {
      "etiqueta": "Plato",
      "rol": "Componente con props",
      "descripcion": "Una ficha: nombre, descripción, precio, etiquetas y alérgenos. Todo lo que cambia de un plato a otro le llega por props."
    },
    {
      "etiqueta": "Seccion",
      "rol": "Componente con children",
      "descripcion": "Un título y una lista. No sabe qué lleva dentro: pinta lo que le pongas entre sus etiquetas."
    },
    {
      "etiqueta": "Leyenda",
      "rol": "Componente que calcula",
      "descripcion": "El índice de alérgenos del final. No se escribe a mano: lo calcula a partir de los platos en cada render."
    },
    {
      "etiqueta": "datos.jsx",
      "rol": "Módulo sin interfaz",
      "descripcion": "Las secciones y los platos, como objetos. Ni una etiqueta: solo datos que los componentes leen."
    }
  ]
}
```

## Paso 1: la ficha de un plato

Empiezas con un `Plato` que no recibe nada: pinta siempre el salmorejo, así que tres `<Plato />` son tres salmorejos. **Un componente sin props es una plantilla sin huecos.**

Las props son esos huecos (lección 8). Se pasan como atributos al usar el componente y se leen desestructurando el parámetro de la función:

```jsx
<Plato nombre="Patatas bravas" precio={5.5} />

export default function Plato({ nombre, precio }) {
  return <h3>{nombre}</h3>
}
```

El texto va entre comillas; cualquier otra cosa (un número, un booleano, un array) va entre llaves. `precio="5.5"` sería el texto «5.5», y un precio tiene que ser un número para poder hacer cuentas con él: sumarlo, compararlo u ordenar por él.

De momento el precio se pinta tal cual, seguido de « €»: «7.5 €», con punto y sin el cero final. Así no se escribe un precio en España; lo arreglarás en el paso 5.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 1: la ficha de un plato",
  "consigna": "Haz que Plato reciba nombre, descripcion y precio como props y los pinte en lugar del texto fijo; el precio, seguido de un espacio y «€». Después, en App.jsx, pasa a cada Plato los datos del comentario, con el precio como número y entre llaves. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Plato from './Plato'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      <section className=\"seccion\" aria-labelledby=\"entrantes\">\n        <h2 id=\"entrantes\">Entrantes</h2>\n        <ul className=\"seccion-lista\">\n          {/* Paso 1: pasa a cada Plato su nombre, su descripción y su precio:\n              Salmorejo cordobés · Con huevo duro y virutas de jamón ibérico. · 7.5\n              Croquetas de jamón · Seis unidades, cremosas por dentro. · 9\n              Patatas bravas · Con nuestra salsa brava casera. · 5.5 */}\n          <Plato />\n          <Plato />\n          <Plato />\n        </ul>\n      </section>\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "// Paso 1: ahora mismo, Plato pinta siempre el salmorejo.\n// Haz que reciba nombre, descripcion y precio como props.\nexport default function Plato() {\n  return (\n    <li className=\"plato\">\n      <div className=\"plato-cabecera\">\n        <h3>Salmorejo cordobés</h3>\n        <span className=\"precio\">7.5 €</span>\n      </div>\n      <p className=\"descripcion\">Con huevo duro y virutas de jamón ibérico.</p>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Plato.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Las croquetas tienen su ficha, con su nombre como título",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Croquetas de jamón"
      }
    },
    {
      "descripcion": "Las patatas bravas tienen su ficha, con su nombre como título",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Patatas bravas"
      }
    },
    {
      "descripcion": "Cada plato enseña su propia descripción",
      "pasos": [],
      "espera": {
        "texto": "Con nuestra salsa brava casera."
      }
    },
    {
      "descripcion": "Cada plato enseña su propio precio, como «9 €»",
      "pasos": [],
      "espera": {
        "texto": "9 €"
      }
    }
  ]
}
```

Has escrito la ficha una vez y la usas tres veces con datos distintos. Si mañana cambia el diseño de los platos, se cambia en un solo sitio: `Plato.jsx`.

## Paso 2: secciones que envuelven platos

La carta tendrá tres secciones con la misma forma: un título y una lista de platos. Extraer lo repetido a un componente ya sabes hacerlo, pero aquí lo que cambia de una sección a otra no es un texto: es **un trozo de interfaz entero, los platos**.

Para eso está `children` (lección 9): lo que escribes entre la etiqueta de apertura y la de cierre de un componente le llega en esa prop. `Seccion` no necesita saber qué hay dentro, solo dónde ponerlo:

```jsx
// En App.jsx, lo que va entre <Seccion> y </Seccion>...
<Seccion id="postres" titulo="Postres">
  <Plato nombre="Tarta de queso" descripcion="Al horno, con el centro cremoso." precio={6.5} />
</Seccion>

// ...le llega a Seccion en la prop children
export default function Seccion({ id, titulo, children }) {
  // children es el <Plato> de la tarta: tú decides dónde va
}
```

El `<section>` lleva además `aria-labelledby` apuntando al `id` de su `<h2>`: así la sección es una región con nombre, «Postres», a la que un lector de pantalla puede saltar directamente (lo viste en el temario de HTML). Las comprobaciones de este proyecto encuentran cada sección justo así, por su nombre; por eso `Seccion` recibe también un `id`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: secciones que envuelven platos",
  "consigna": "Escribe Seccion: un <section> con su <h2> y, debajo, un <ul className=\"seccion-lista\"> con lo que reciba como children. Lo que cambia de una sección a otra llega por props: id y titulo. Parte del <section> que hay en App.jsx para no perder el aria-labelledby. Después, en App.jsx, usa Seccion para los entrantes y añade «Principales» y «Postres» con los platos del comentario.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Plato from './Plato'\nimport Seccion from './Seccion'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      {/* Paso 2: cambia este <section> por <Seccion id=\"entrantes\" titulo=\"Entrantes\">\n          y añade dos secciones más con Seccion:\n          Principales, con id=\"principales\":\n            Bacalao al pil pil · Lomo confitado en aceite de oliva, con su salsa. · 19.5\n            Pisto manchego · Verduras de la huerta con huevo frito. · 12.5\n          Postres, con id=\"postres\":\n            Tarta de queso · Al horno, con el centro cremoso. · 6.5\n            Arroz con leche · Con canela y piel de limón. · 5 */}\n      <section className=\"seccion\" aria-labelledby=\"entrantes\">\n        <h2 id=\"entrantes\">Entrantes</h2>\n        <ul className=\"seccion-lista\">\n          <Plato\n            nombre=\"Salmorejo cordobés\"\n            descripcion=\"Con huevo duro y virutas de jamón ibérico.\"\n            precio={7.5}\n          />\n          <Plato\n            nombre=\"Croquetas de jamón\"\n            descripcion=\"Seis unidades, cremosas por dentro.\"\n            precio={9}\n          />\n          <Plato\n            nombre=\"Patatas bravas\"\n            descripcion=\"Con nuestra salsa brava casera.\"\n            precio={5.5}\n          />\n        </ul>\n      </section>\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "export default function Plato({ nombre, descripcion, precio }) {\n  return (\n    <li className=\"plato\">\n      <div className=\"plato-cabecera\">\n        <h3>{nombre}</h3>\n        <span className=\"precio\">{precio} €</span>\n      </div>\n      <p className=\"descripcion\">{descripcion}</p>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Seccion.jsx",
      "codigo": "// Paso 2: una sección de la carta. Trae aquí el <section> de App.jsx y\n// cambia por props lo que varía de una sección a otra: id, titulo y, en el\n// sitio de los platos, children.\nexport default function Seccion() {\n  return null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Seccion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La sección «Principales» incluye el bacalao al pil pil",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Principales",
        "texto": "Bacalao al pil pil"
      }
    },
    {
      "descripcion": "La sección «Postres» incluye el arroz con leche",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Postres",
        "texto": "Arroz con leche"
      }
    },
    {
      "descripcion": "Los entrantes siguen en su sección, «Entrantes»",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Entrantes",
        "texto": "Patatas bravas"
      }
    }
  ]
}
```

Ahora una sección nueva es una etiqueta `<Seccion>` con sus platos dentro, y si un día cambia el diseño de las secciones, se toca `Seccion.jsx` y nada más.

## Paso 3: la carta sale de los datos

Escribir cada `<Plato>` a mano no escala: con los once platos, `App.jsx` rondaría las ochenta líneas, y cambiar la carta obligaría a tocar el JSX. En este paso, la carta pasa a ser **datos**: un array de objetos en `datos.jsx`, cada uno con su `id`, su sección y todo lo que la carta necesita (algunos campos, como `agotado`, los usarás en el paso 4). En este editor todos los archivos de código acaban en `.jsx`, también este, aunque no tenga JSX; en un proyecto de Vite lo llamarías `datos.js`.

Convertir datos en interfaz es lo de la lección 11: `filter` para quedarte con los platos de cada sección y `map` para convertir cada uno en un `<Plato>`. Como hay dos niveles, secciones y platos dentro de cada una, habrá un `map` dentro de otro.

**Cada elemento que sale de un `map` necesita una `key`**, y va en el elemento que devuelve el `map`:

```jsx
platos.map((plato) => <Plato key={plato.id} {...plato} />)
```

`{...plato}` pasa cada propiedad del objeto como una prop: es lo mismo que escribir `nombre={plato.nombre}`, `precio={plato.precio}` y así con todas. `Plato` recoge las que necesita. La `key` no le llega: es una pista para React, que la usa para saber qué plato es cada elemento aunque la lista cambie.

Los alérgenos son otra lista, dentro de cada plato, y su `key` puede ser el propio nombre, porque un plato no lleva dos veces el mismo alérgeno. Que «Gluten» sea `key` en la lista del salmorejo y también en la de las croquetas no es un problema: **una `key` solo tiene que ser única entre hermanos**, no en toda la página.

Empieza por `App.jsx`. Si cambias antes `Plato`, los platos escritos a mano no traen `alergenos` y la vista previa mostrará un error al intentar recorrerlos; desaparece en cuanto los platos salen de los datos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 3: la carta, desde los datos",
  "consigna": "En App.jsx, borra las tres secciones escritas a mano y créalas con un map sobre secciones; dentro de cada Seccion, sus platos con filter y map, cada uno con su key. Después, en Plato.jsx, pinta los alérgenos dentro de plato-detalles: una <ul className=\"alergenos\" aria-label=\"Alérgenos\"> con un <li> por alérgeno. Si falta alguna key, la consola te avisa.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Plato from './Plato'\nimport Seccion from './Seccion'\nimport { platos, secciones } from './datos'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      {/* Paso 3: borra las tres secciones escritas a mano y créalas con un map\n          sobre secciones. Dentro de cada Seccion, los platos de esa sección:\n          platos.filter(...).map(...). Lo que devuelve cada map, con su key. */}\n      <Seccion id=\"entrantes\" titulo=\"Entrantes\">\n        <Plato\n          nombre=\"Salmorejo cordobés\"\n          descripcion=\"Con huevo duro y virutas de jamón ibérico.\"\n          precio={7.5}\n        />\n        <Plato\n          nombre=\"Croquetas de jamón\"\n          descripcion=\"Seis unidades, cremosas por dentro.\"\n          precio={9}\n        />\n        <Plato\n          nombre=\"Patatas bravas\"\n          descripcion=\"Con nuestra salsa brava casera.\"\n          precio={5.5}\n        />\n      </Seccion>\n\n      <Seccion id=\"principales\" titulo=\"Principales\">\n        <Plato\n          nombre=\"Bacalao al pil pil\"\n          descripcion=\"Lomo confitado en aceite de oliva, con su salsa.\"\n          precio={19.5}\n        />\n        <Plato\n          nombre=\"Pisto manchego\"\n          descripcion=\"Verduras de la huerta con huevo frito.\"\n          precio={12.5}\n        />\n      </Seccion>\n\n      <Seccion id=\"postres\" titulo=\"Postres\">\n        <Plato\n          nombre=\"Tarta de queso\"\n          descripcion=\"Al horno, con el centro cremoso.\"\n          precio={6.5}\n        />\n        <Plato\n          nombre=\"Arroz con leche\"\n          descripcion=\"Con canela y piel de limón.\"\n          precio={5}\n        />\n      </Seccion>\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "export default function Plato({ nombre, descripcion, precio }) {\n  return (\n    <li className=\"plato\">\n      <div className=\"plato-cabecera\">\n        <h3>{nombre}</h3>\n        <span className=\"precio\">{precio} €</span>\n      </div>\n      <p className=\"descripcion\">{descripcion}</p>\n      <div className=\"plato-detalles\">\n        {/* Paso 3: los alérgenos del plato (la prop alergenos, un array), en\n            <ul className=\"alergenos\" aria-label=\"Alérgenos\">, un <li> por alérgeno */}\n      </div>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Seccion.jsx",
      "codigo": "export default function Seccion({ id, titulo, children }) {\n  return (\n    <section className=\"seccion\" aria-labelledby={id}>\n      <h2 id={id}>{titulo}</h2>\n      <ul className=\"seccion-lista\">{children}</ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Los datos de la carta, sin nada de interfaz. En una app real llegarían\n// de un servidor; los componentes solo los leen.\nexport const secciones = [\n  { id: 'entrantes', titulo: 'Entrantes' },\n  { id: 'principales', titulo: 'Principales' },\n  { id: 'postres', titulo: 'Postres' },\n]\n\nexport const platos = [\n  {\n    id: 'salmorejo',\n    seccion: 'entrantes',\n    nombre: 'Salmorejo cordobés',\n    descripcion: 'Con huevo duro y virutas de jamón ibérico.',\n    precio: 7.5,\n    alergenos: ['Gluten', 'Huevos'],\n  },\n  {\n    id: 'croquetas',\n    seccion: 'entrantes',\n    nombre: 'Croquetas de jamón',\n    descripcion: 'Seis unidades, cremosas por dentro.',\n    precio: 9,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n  },\n  {\n    id: 'bravas',\n    seccion: 'entrantes',\n    nombre: 'Patatas bravas',\n    descripcion: 'Con nuestra salsa brava casera.',\n    precio: 5.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n  {\n    id: 'pulpo',\n    seccion: 'entrantes',\n    nombre: 'Pulpo a la gallega',\n    descripcion: 'Con cachelos, pimentón de la Vera y aceite de oliva.',\n    precio: 16.5,\n    alergenos: ['Moluscos'],\n  },\n  {\n    id: 'fabada',\n    seccion: 'principales',\n    nombre: 'Fabada asturiana',\n    descripcion: 'Con su compango: chorizo, morcilla y panceta.',\n    precio: 14.5,\n    alergenos: [],\n    delDia: true,\n  },\n  {\n    id: 'bacalao',\n    seccion: 'principales',\n    nombre: 'Bacalao al pil pil',\n    descripcion: 'Lomo confitado en aceite de oliva, con su salsa.',\n    precio: 19.5,\n    alergenos: ['Pescado'],\n  },\n  {\n    id: 'carrillada',\n    seccion: 'principales',\n    nombre: 'Carrillada al vino tinto',\n    descripcion: 'Guisada a fuego lento, con puré de patata.',\n    precio: 17,\n    alergenos: ['Lácteos', 'Sulfitos'],\n  },\n  {\n    id: 'pisto',\n    seccion: 'principales',\n    nombre: 'Pisto manchego',\n    descripcion: 'Verduras de la huerta con huevo frito.',\n    precio: 12.5,\n    alergenos: ['Huevos'],\n    vegetariano: true,\n  },\n  {\n    id: 'tarta-de-queso',\n    seccion: 'postres',\n    nombre: 'Tarta de queso',\n    descripcion: 'Al horno, con el centro cremoso.',\n    precio: 6.5,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n    vegetariano: true,\n    agotado: true,\n  },\n  {\n    id: 'arroz-con-leche',\n    seccion: 'postres',\n    nombre: 'Arroz con leche',\n    descripcion: 'Con canela y piel de limón.',\n    precio: 5,\n    alergenos: ['Lácteos'],\n    vegetariano: true,\n  },\n  {\n    id: 'fruta',\n    seccion: 'postres',\n    nombre: 'Fruta de temporada',\n    descripcion: 'Pregunta por la de hoy.',\n    precio: 4.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La fabada, que solo está en datos.jsx, aparece en «Principales»",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Principales",
        "texto": "Fabada asturiana"
      }
    },
    {
      "descripcion": "La fruta de temporada aparece en «Postres»",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Postres",
        "texto": "Fruta de temporada"
      }
    },
    {
      "descripcion": "Cada plato sale solo en su sección: entre los entrantes no hay postres",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "Entrantes",
          "texto": "Fruta de temporada"
        }
      }
    },
    {
      "descripcion": "Cada plato lista sus alérgenos: el pulpo, «Moluscos»",
      "pasos": [],
      "espera": {
        "rol": "list",
        "nombre": "Alérgenos",
        "texto": "Moluscos"
      }
    }
  ]
}
```

Si te dejas alguna `key`, la consola de debajo de la vista previa lo dice: «Each child in a list should have a unique "key" prop.». Ahora la carta tiene once platos y no has escrito ni un `<Plato>` más: para añadir uno, se añade un objeto a `datos.jsx`.

## Paso 4: alérgenos, «Agotado» y plato del día

Los datos ya dicen más de lo que la carta enseña. La tarta de queso tiene `agotado: true`; la fabada, `delDia: true`; varios platos, `vegetariano: true`. En el resto, esos campos ni siquiera existen, así que valen `undefined`, que cuenta como falso. Y las patatas bravas, la fabada y la fruta tienen `alergenos: []`: ahora mismo pintan una lista vacía.

Es renderizado condicional (lección 10), y cada caso pide su herramienta:

- **Una cosa u otra**: el precio o «Agotado». Un ternario: `{agotado ? … : …}`.
- **Algo o nada**: «Plato del día», «Vegetariano» y la lista de alérgenos. El operador `&&`: `{vegetariano && …}`.
- **Un valor que depende de varias condiciones**: las clases del `<li>`. Una variable y unos `if` antes del `return`:

```jsx
let clases = 'plato'
if (delDia) clases += ' plato-del-dia'
if (agotado) clases += ' plato-agotado'
```

Cambiar `clases` está permitido aunque el componente tenga que ser puro: esa variable nace en este render y nadie más la ve. Lo que un componente no puede hacer es modificar algo que ya existía antes de llamarlo (lección 12).

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuidado con el 0 a la izquierda de &&",
  "contenido": "Con alergenos: [], alergenos.length vale 0, y {alergenos.length && <ul>…</ul>} no deja el hueco vacío: pinta un 0. React se salta false, null y undefined, pero un número lo pinta. Escribe una condición que sea un booleano de verdad: alergenos.length > 0 && …"
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 4: alérgenos, «Agotado» y plato del día",
  "consigna": "En Plato.jsx: si el plato está agotado, pinta <span className=\"etiqueta etiqueta-agotado\">Agotado</span> en lugar del precio. Si es el del día, pon <p className=\"aviso-del-dia\">Plato del día</p> al principio del li. Si es vegetariano, añade <span className=\"etiqueta etiqueta-vegetariano\">Vegetariano</span> en plato-detalles, antes de los alérgenos. Pinta la lista de alérgenos solo si hay alguno. Y para que se note, suma al li las clases plato-del-dia y plato-agotado.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Plato from './Plato'\nimport Seccion from './Seccion'\nimport { platos, secciones } from './datos'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      {secciones.map((seccion) => (\n        <Seccion key={seccion.id} id={seccion.id} titulo={seccion.titulo}>\n          {platos\n            .filter((plato) => plato.seccion === seccion.id)\n            .map((plato) => (\n              <Plato key={plato.id} {...plato} />\n            ))}\n        </Seccion>\n      ))}\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "// Paso 4: cada plato puede traer vegetariano, agotado y delDia (con true,\n// o sin el campo). Úsalos para pintar lo que pide la consigna, y enseña la\n// lista de alérgenos solo si el plato tiene alguno.\nexport default function Plato({ nombre, descripcion, precio, alergenos }) {\n  return (\n    <li className=\"plato\">\n      <div className=\"plato-cabecera\">\n        <h3>{nombre}</h3>\n        <span className=\"precio\">{precio} €</span>\n      </div>\n      <p className=\"descripcion\">{descripcion}</p>\n      <div className=\"plato-detalles\">\n        <ul className=\"alergenos\" aria-label=\"Alérgenos\">\n          {alergenos.map((alergeno) => (\n            <li key={alergeno}>{alergeno}</li>\n          ))}\n        </ul>\n      </div>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Seccion.jsx",
      "codigo": "export default function Seccion({ id, titulo, children }) {\n  return (\n    <section className=\"seccion\" aria-labelledby={id}>\n      <h2 id={id}>{titulo}</h2>\n      <ul className=\"seccion-lista\">{children}</ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Los datos de la carta, sin nada de interfaz. En una app real llegarían\n// de un servidor; los componentes solo los leen.\nexport const secciones = [\n  { id: 'entrantes', titulo: 'Entrantes' },\n  { id: 'principales', titulo: 'Principales' },\n  { id: 'postres', titulo: 'Postres' },\n]\n\nexport const platos = [\n  {\n    id: 'salmorejo',\n    seccion: 'entrantes',\n    nombre: 'Salmorejo cordobés',\n    descripcion: 'Con huevo duro y virutas de jamón ibérico.',\n    precio: 7.5,\n    alergenos: ['Gluten', 'Huevos'],\n  },\n  {\n    id: 'croquetas',\n    seccion: 'entrantes',\n    nombre: 'Croquetas de jamón',\n    descripcion: 'Seis unidades, cremosas por dentro.',\n    precio: 9,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n  },\n  {\n    id: 'bravas',\n    seccion: 'entrantes',\n    nombre: 'Patatas bravas',\n    descripcion: 'Con nuestra salsa brava casera.',\n    precio: 5.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n  {\n    id: 'pulpo',\n    seccion: 'entrantes',\n    nombre: 'Pulpo a la gallega',\n    descripcion: 'Con cachelos, pimentón de la Vera y aceite de oliva.',\n    precio: 16.5,\n    alergenos: ['Moluscos'],\n  },\n  {\n    id: 'fabada',\n    seccion: 'principales',\n    nombre: 'Fabada asturiana',\n    descripcion: 'Con su compango: chorizo, morcilla y panceta.',\n    precio: 14.5,\n    alergenos: [],\n    delDia: true,\n  },\n  {\n    id: 'bacalao',\n    seccion: 'principales',\n    nombre: 'Bacalao al pil pil',\n    descripcion: 'Lomo confitado en aceite de oliva, con su salsa.',\n    precio: 19.5,\n    alergenos: ['Pescado'],\n  },\n  {\n    id: 'carrillada',\n    seccion: 'principales',\n    nombre: 'Carrillada al vino tinto',\n    descripcion: 'Guisada a fuego lento, con puré de patata.',\n    precio: 17,\n    alergenos: ['Lácteos', 'Sulfitos'],\n  },\n  {\n    id: 'pisto',\n    seccion: 'principales',\n    nombre: 'Pisto manchego',\n    descripcion: 'Verduras de la huerta con huevo frito.',\n    precio: 12.5,\n    alergenos: ['Huevos'],\n    vegetariano: true,\n  },\n  {\n    id: 'tarta-de-queso',\n    seccion: 'postres',\n    nombre: 'Tarta de queso',\n    descripcion: 'Al horno, con el centro cremoso.',\n    precio: 6.5,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n    vegetariano: true,\n    agotado: true,\n  },\n  {\n    id: 'arroz-con-leche',\n    seccion: 'postres',\n    nombre: 'Arroz con leche',\n    descripcion: 'Con canela y piel de limón.',\n    precio: 5,\n    alergenos: ['Lácteos'],\n    vegetariano: true,\n  },\n  {\n    id: 'fruta',\n    seccion: 'postres',\n    nombre: 'Fruta de temporada',\n    descripcion: 'Pregunta por la de hoy.',\n    precio: 4.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Plato.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La tarta de queso, que está agotada, enseña «Agotado» en «Postres»",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Postres",
        "texto": "Agotado"
      }
    },
    {
      "descripcion": "«Agotado» ocupa el lugar del precio: los 6.5 € de la tarta ya no aparecen",
      "pasos": [],
      "espera": {
        "ausente": {
          "texto": "6.5 €"
        }
      }
    },
    {
      "descripcion": "La fabada lleva el aviso «Plato del día»",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Principales",
        "texto": "Plato del día"
      }
    },
    {
      "descripcion": "Los postres vegetarianos llevan la etiqueta «Vegetariano»",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Postres",
        "texto": "Vegetariano"
      }
    },
    {
      "descripcion": "Los platos sin alérgenos no enseñan nada en su lugar, ni siquiera un 0",
      "pasos": [],
      "espera": {
        "ausente": {
          "texto": "0"
        }
      }
    }
  ]
}
```

Fíjate en que la tarta no ha desaparecido de la carta ni ha cambiado de sitio: el dato `agotado` solo cambia cómo se pinta su ficha. Los mismos datos, otra interfaz.

## Paso 5: precios en euros

«7.5 €» delata que la carta la ha escrito un programa. En España se escribe «7,50 €»: coma decimal, dos decimales y el símbolo detrás. No hace falta montarlo a mano con `toFixed` y `replace`: JavaScript trae `Intl.NumberFormat`, que sabe escribir números y monedas en cada idioma.

```js
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

euros.format(7.5) // '7,50 €'
euros.format(5) // '5,00 €'
```

El espacio entre el número y el «€» no es uno normal: es un espacio duro (U+00A0, el `&nbsp;` de HTML), que impide que el símbolo se quede solo al principio de otra línea. Si inspeccionas un precio con las herramientas del navegador, verás `7,50&nbsp;€`.

Crea el formateador **fuera del componente**, una sola vez, al cargar el módulo. Es lo que recomienda MDN cuando vas a formatear muchos números con las mismas opciones: el objeto recuerda esas opciones y puede guardarse los datos del idioma que necesita, en vez de buscarlos en cada llamada. Y el componente sigue siendo puro, porque solo lo usa: nunca lo modifica.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 5: precios en euros",
  "consigna": "En Plato.jsx, crea fuera del componente un formateador con new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }) y úsalo para pintar el precio. Ojo: format ya añade el «€», no lo escribas tú.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Plato from './Plato'\nimport Seccion from './Seccion'\nimport { platos, secciones } from './datos'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      {secciones.map((seccion) => (\n        <Seccion key={seccion.id} id={seccion.id} titulo={seccion.titulo}>\n          {platos\n            .filter((plato) => plato.seccion === seccion.id)\n            .map((plato) => (\n              <Plato key={plato.id} {...plato} />\n            ))}\n        </Seccion>\n      ))}\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "// Paso 5: los precios salen como «7.5 €». Escríbelos como en España,\n// «7,50 €», con Intl.NumberFormat.\nexport default function Plato({\n  nombre,\n  descripcion,\n  precio,\n  alergenos,\n  vegetariano,\n  agotado,\n  delDia,\n}) {\n  let clases = 'plato'\n  if (delDia) clases += ' plato-del-dia'\n  if (agotado) clases += ' plato-agotado'\n\n  return (\n    <li className={clases}>\n      {delDia && <p className=\"aviso-del-dia\">Plato del día</p>}\n      <div className=\"plato-cabecera\">\n        <h3>{nombre}</h3>\n        {agotado ? (\n          <span className=\"etiqueta etiqueta-agotado\">Agotado</span>\n        ) : (\n          <span className=\"precio\">{precio} €</span>\n        )}\n      </div>\n      <p className=\"descripcion\">{descripcion}</p>\n      <div className=\"plato-detalles\">\n        {vegetariano && <span className=\"etiqueta etiqueta-vegetariano\">Vegetariano</span>}\n        {alergenos.length > 0 && (\n          <ul className=\"alergenos\" aria-label=\"Alérgenos\">\n            {alergenos.map((alergeno) => (\n              <li key={alergeno}>{alergeno}</li>\n            ))}\n          </ul>\n        )}\n      </div>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Seccion.jsx",
      "codigo": "export default function Seccion({ id, titulo, children }) {\n  return (\n    <section className=\"seccion\" aria-labelledby={id}>\n      <h2 id={id}>{titulo}</h2>\n      <ul className=\"seccion-lista\">{children}</ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Los datos de la carta, sin nada de interfaz. En una app real llegarían\n// de un servidor; los componentes solo los leen.\nexport const secciones = [\n  { id: 'entrantes', titulo: 'Entrantes' },\n  { id: 'principales', titulo: 'Principales' },\n  { id: 'postres', titulo: 'Postres' },\n]\n\nexport const platos = [\n  {\n    id: 'salmorejo',\n    seccion: 'entrantes',\n    nombre: 'Salmorejo cordobés',\n    descripcion: 'Con huevo duro y virutas de jamón ibérico.',\n    precio: 7.5,\n    alergenos: ['Gluten', 'Huevos'],\n  },\n  {\n    id: 'croquetas',\n    seccion: 'entrantes',\n    nombre: 'Croquetas de jamón',\n    descripcion: 'Seis unidades, cremosas por dentro.',\n    precio: 9,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n  },\n  {\n    id: 'bravas',\n    seccion: 'entrantes',\n    nombre: 'Patatas bravas',\n    descripcion: 'Con nuestra salsa brava casera.',\n    precio: 5.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n  {\n    id: 'pulpo',\n    seccion: 'entrantes',\n    nombre: 'Pulpo a la gallega',\n    descripcion: 'Con cachelos, pimentón de la Vera y aceite de oliva.',\n    precio: 16.5,\n    alergenos: ['Moluscos'],\n  },\n  {\n    id: 'fabada',\n    seccion: 'principales',\n    nombre: 'Fabada asturiana',\n    descripcion: 'Con su compango: chorizo, morcilla y panceta.',\n    precio: 14.5,\n    alergenos: [],\n    delDia: true,\n  },\n  {\n    id: 'bacalao',\n    seccion: 'principales',\n    nombre: 'Bacalao al pil pil',\n    descripcion: 'Lomo confitado en aceite de oliva, con su salsa.',\n    precio: 19.5,\n    alergenos: ['Pescado'],\n  },\n  {\n    id: 'carrillada',\n    seccion: 'principales',\n    nombre: 'Carrillada al vino tinto',\n    descripcion: 'Guisada a fuego lento, con puré de patata.',\n    precio: 17,\n    alergenos: ['Lácteos', 'Sulfitos'],\n  },\n  {\n    id: 'pisto',\n    seccion: 'principales',\n    nombre: 'Pisto manchego',\n    descripcion: 'Verduras de la huerta con huevo frito.',\n    precio: 12.5,\n    alergenos: ['Huevos'],\n    vegetariano: true,\n  },\n  {\n    id: 'tarta-de-queso',\n    seccion: 'postres',\n    nombre: 'Tarta de queso',\n    descripcion: 'Al horno, con el centro cremoso.',\n    precio: 6.5,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n    vegetariano: true,\n    agotado: true,\n  },\n  {\n    id: 'arroz-con-leche',\n    seccion: 'postres',\n    nombre: 'Arroz con leche',\n    descripcion: 'Con canela y piel de limón.',\n    precio: 5,\n    alergenos: ['Lácteos'],\n    vegetariano: true,\n  },\n  {\n    id: 'fruta',\n    seccion: 'postres',\n    nombre: 'Fruta de temporada',\n    descripcion: 'Pregunta por la de hoy.',\n    precio: 4.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Plato.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "El salmorejo cuesta «7,50 €», con coma decimal y dos decimales",
      "pasos": [],
      "espera": {
        "texto": "7,50 €"
      }
    },
    {
      "descripcion": "Un precio entero también lleva sus decimales: el arroz con leche, «5,00 €»",
      "pasos": [],
      "espera": {
        "texto": "5,00 €"
      }
    },
    {
      "descripcion": "No queda ningún precio con punto, como «7.5 €»",
      "pasos": [],
      "espera": {
        "ausente": {
          "texto": "7.5 €"
        }
      }
    }
  ]
}
```

Dos líneas y los once precios salen bien. Si la carta tuviera que salir en otro idioma o en otra moneda, bastaría con cambiar `'es-ES'` y `'EUR'`.

## Paso 6: la leyenda de alérgenos

Quien tiene una alergia no quiere repasar la carta entera: quiere saber de un vistazo, por ejemplo, qué platos llevan gluten. El último componente, `Leyenda`, lo resuelve con un índice al final:

```text
Gluten: Salmorejo cordobés, Croquetas de jamón, Tarta de queso
Huevos: Salmorejo cordobés, Croquetas de jamón, Pisto manchego, Tarta de queso
…
```

Ese índice **no se guarda en ningún sitio: se calcula durante el render a partir de los platos**. Si mañana añades un plato con sésamo, el índice lo incluye solo. Es lo que hace un componente puro: recibe datos y devuelve interfaz, como una fórmula. Te bastan tres piezas de JavaScript:

1. `new Set(platos.flatMap((plato) => plato.alergenos))` reúne todos los alérgenos sin repetir.
2. `[...presentes].sort((a, b) => a.localeCompare(b, 'es'))` los ordena como un diccionario. Con un `sort()` a secas, «Sésamo» quedaría detrás de «Soja» y de «Sulfitos», porque compara códigos de carácter y la «é» va después de todas las letras sin tilde.
3. Para cada alérgeno, `filter` con los platos que lo llevan, `map` para quedarte con sus nombres y `join(', ')` para unirlos.

Ordenar aquí está bien porque ordenas un array que acabas de crear con `[...presentes]`. Lo que nunca debes hacer es `platos.sort(...)` dentro de un componente: reordenarías el array de `datos.jsx`, el mismo que usan las secciones. Es la diferencia entre la mutación local y modificar algo que ya existía, de la lección 12.

Y `Leyenda` no necesita un diseño de sección propio: **reutiliza `Seccion`**. Esta vez sus children no son platos, sino `<li>` normales, y a `Seccion` le da igual: pinta lo que le pongan dentro.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 6: la leyenda de alérgenos",
  "consigna": "Completa Leyenda.jsx: recibe platos como prop y, dentro de <Seccion id=\"alergenos\" titulo=\"Alérgenos de esta carta\">, pinta un <li> por alérgeno, sin repetir y en orden alfabético: el alérgeno en <strong> seguido de dos puntos y, después, los platos que lo llevan separados por comas («Gluten: Salmorejo cordobés, Croquetas de jamón, Tarta de queso»). Luego, en App.jsx, pinta la Leyenda después de las secciones y pásale los platos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Leyenda from './Leyenda'\nimport Plato from './Plato'\nimport Seccion from './Seccion'\nimport { platos, secciones } from './datos'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      {secciones.map((seccion) => (\n        <Seccion key={seccion.id} id={seccion.id} titulo={seccion.titulo}>\n          {platos\n            .filter((plato) => plato.seccion === seccion.id)\n            .map((plato) => (\n              <Plato key={plato.id} {...plato} />\n            ))}\n        </Seccion>\n      ))}\n\n      {/* Paso 6: aquí va la leyenda de alérgenos, con todos los platos */}\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "// Se crea una sola vez, al cargar el módulo; en cada render solo se usa.\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nfunction formatearPrecio(precio) {\n  return euros.format(precio)\n}\n\nexport default function Plato({\n  nombre,\n  descripcion,\n  precio,\n  alergenos,\n  vegetariano,\n  agotado,\n  delDia,\n}) {\n  let clases = 'plato'\n  if (delDia) clases += ' plato-del-dia'\n  if (agotado) clases += ' plato-agotado'\n\n  return (\n    <li className={clases}>\n      {delDia && <p className=\"aviso-del-dia\">Plato del día</p>}\n      <div className=\"plato-cabecera\">\n        <h3>{nombre}</h3>\n        {agotado ? (\n          <span className=\"etiqueta etiqueta-agotado\">Agotado</span>\n        ) : (\n          <span className=\"precio\">{formatearPrecio(precio)}</span>\n        )}\n      </div>\n      <p className=\"descripcion\">{descripcion}</p>\n      <div className=\"plato-detalles\">\n        {vegetariano && <span className=\"etiqueta etiqueta-vegetariano\">Vegetariano</span>}\n        {alergenos.length > 0 && (\n          <ul className=\"alergenos\" aria-label=\"Alérgenos\">\n            {alergenos.map((alergeno) => (\n              <li key={alergeno}>{alergeno}</li>\n            ))}\n          </ul>\n        )}\n      </div>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Seccion.jsx",
      "codigo": "export default function Seccion({ id, titulo, children }) {\n  return (\n    <section className=\"seccion\" aria-labelledby={id}>\n      <h2 id={id}>{titulo}</h2>\n      <ul className=\"seccion-lista\">{children}</ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Leyenda.jsx",
      "codigo": "import Seccion from './Seccion'\n\n// Paso 6: el índice de alérgenos de la carta. Recibe todos los platos y,\n// por cada alérgeno que aparece (sin repetir y en orden alfabético), pinta\n// un <li> con el alérgeno y los platos que lo llevan:\n//   <li><strong>Gluten:</strong> Salmorejo cordobés, Croquetas de jamón, ...</li>\n// Reutiliza Seccion, con id=\"alergenos\" y el título «Alérgenos de esta carta».\nexport default function Leyenda() {\n  return null\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Los datos de la carta, sin nada de interfaz. En una app real llegarían\n// de un servidor; los componentes solo los leen.\nexport const secciones = [\n  { id: 'entrantes', titulo: 'Entrantes' },\n  { id: 'principales', titulo: 'Principales' },\n  { id: 'postres', titulo: 'Postres' },\n]\n\nexport const platos = [\n  {\n    id: 'salmorejo',\n    seccion: 'entrantes',\n    nombre: 'Salmorejo cordobés',\n    descripcion: 'Con huevo duro y virutas de jamón ibérico.',\n    precio: 7.5,\n    alergenos: ['Gluten', 'Huevos'],\n  },\n  {\n    id: 'croquetas',\n    seccion: 'entrantes',\n    nombre: 'Croquetas de jamón',\n    descripcion: 'Seis unidades, cremosas por dentro.',\n    precio: 9,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n  },\n  {\n    id: 'bravas',\n    seccion: 'entrantes',\n    nombre: 'Patatas bravas',\n    descripcion: 'Con nuestra salsa brava casera.',\n    precio: 5.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n  {\n    id: 'pulpo',\n    seccion: 'entrantes',\n    nombre: 'Pulpo a la gallega',\n    descripcion: 'Con cachelos, pimentón de la Vera y aceite de oliva.',\n    precio: 16.5,\n    alergenos: ['Moluscos'],\n  },\n  {\n    id: 'fabada',\n    seccion: 'principales',\n    nombre: 'Fabada asturiana',\n    descripcion: 'Con su compango: chorizo, morcilla y panceta.',\n    precio: 14.5,\n    alergenos: [],\n    delDia: true,\n  },\n  {\n    id: 'bacalao',\n    seccion: 'principales',\n    nombre: 'Bacalao al pil pil',\n    descripcion: 'Lomo confitado en aceite de oliva, con su salsa.',\n    precio: 19.5,\n    alergenos: ['Pescado'],\n  },\n  {\n    id: 'carrillada',\n    seccion: 'principales',\n    nombre: 'Carrillada al vino tinto',\n    descripcion: 'Guisada a fuego lento, con puré de patata.',\n    precio: 17,\n    alergenos: ['Lácteos', 'Sulfitos'],\n  },\n  {\n    id: 'pisto',\n    seccion: 'principales',\n    nombre: 'Pisto manchego',\n    descripcion: 'Verduras de la huerta con huevo frito.',\n    precio: 12.5,\n    alergenos: ['Huevos'],\n    vegetariano: true,\n  },\n  {\n    id: 'tarta-de-queso',\n    seccion: 'postres',\n    nombre: 'Tarta de queso',\n    descripcion: 'Al horno, con el centro cremoso.',\n    precio: 6.5,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n    vegetariano: true,\n    agotado: true,\n  },\n  {\n    id: 'arroz-con-leche',\n    seccion: 'postres',\n    nombre: 'Arroz con leche',\n    descripcion: 'Con canela y piel de limón.',\n    precio: 5,\n    alergenos: ['Lácteos'],\n    vegetariano: true,\n  },\n  {\n    id: 'fruta',\n    seccion: 'postres',\n    nombre: 'Fruta de temporada',\n    descripcion: 'Pregunta por la de hoy.',\n    precio: 4.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Leyenda.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La leyenda tiene su título, «Alérgenos de esta carta»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Alérgenos de esta carta"
      }
    },
    {
      "descripcion": "Cada alérgeno lista sus platos: los sulfitos, en la carrillada",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Sulfitos: Carrillada al vino tinto"
      }
    },
    {
      "descripcion": "El gluten aparece con sus tres platos, en el orden de la carta",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Gluten: Salmorejo cordobés, Croquetas de jamón, Tarta de queso"
      }
    },
    {
      "descripcion": "La leyenda solo incluye alérgenos que lleva algún plato de la carta",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "Alérgenos de esta carta",
          "texto": "Cacahuetes"
        }
      }
    }
  ]
}
```

Si te saltas el `Set`, cada alérgeno sale tantas veces como platos lo llevan, y la consola avisa de que dos hermanos comparten `key`:

```text
Encountered two children with the same key, `Gluten`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
```

Es la `key` haciendo su trabajo: si dos elementos dicen ser el mismo, algo falla en tus datos o en tu cálculo.

## El árbol de tu carta

Esta es la carta completa, con sus seis archivos. Es la solución de todos los pasos: compárala con la tuya y úsala para lo que sigue.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La carta completa",
  "consigna": "Juega con datos.jsx: marca otro plato como agotado, quita el plato del día o añade un plato nuevo con un alérgeno distinto. La carta y la leyenda cambian sin tocar ningún componente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Leyenda from './Leyenda'\nimport Plato from './Plato'\nimport Seccion from './Seccion'\nimport { platos, secciones } from './datos'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main className=\"carta\">\n      <header className=\"cabecera\">\n        <h1>Taberna La Encina</h1>\n        <p>Carta de otoño</p>\n      </header>\n\n      {secciones.map((seccion) => (\n        <Seccion key={seccion.id} id={seccion.id} titulo={seccion.titulo}>\n          {platos\n            .filter((plato) => plato.seccion === seccion.id)\n            .map((plato) => (\n              <Plato key={plato.id} {...plato} />\n            ))}\n        </Seccion>\n      ))}\n\n      <Leyenda platos={platos} />\n\n      <p className=\"nota\">Precios con IVA incluido. Si tienes alguna alergia, pregúntanos.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Plato.jsx",
      "codigo": "// Se crea una sola vez, al cargar el módulo; en cada render solo se usa.\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nfunction formatearPrecio(precio) {\n  return euros.format(precio)\n}\n\nexport default function Plato({\n  nombre,\n  descripcion,\n  precio,\n  alergenos,\n  vegetariano,\n  agotado,\n  delDia,\n}) {\n  let clases = 'plato'\n  if (delDia) clases += ' plato-del-dia'\n  if (agotado) clases += ' plato-agotado'\n\n  return (\n    <li className={clases}>\n      {delDia && <p className=\"aviso-del-dia\">Plato del día</p>}\n      <div className=\"plato-cabecera\">\n        <h3>{nombre}</h3>\n        {agotado ? (\n          <span className=\"etiqueta etiqueta-agotado\">Agotado</span>\n        ) : (\n          <span className=\"precio\">{formatearPrecio(precio)}</span>\n        )}\n      </div>\n      <p className=\"descripcion\">{descripcion}</p>\n      <div className=\"plato-detalles\">\n        {vegetariano && <span className=\"etiqueta etiqueta-vegetariano\">Vegetariano</span>}\n        {alergenos.length > 0 && (\n          <ul className=\"alergenos\" aria-label=\"Alérgenos\">\n            {alergenos.map((alergeno) => (\n              <li key={alergeno}>{alergeno}</li>\n            ))}\n          </ul>\n        )}\n      </div>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Seccion.jsx",
      "codigo": "export default function Seccion({ id, titulo, children }) {\n  return (\n    <section className=\"seccion\" aria-labelledby={id}>\n      <h2 id={id}>{titulo}</h2>\n      <ul className=\"seccion-lista\">{children}</ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Leyenda.jsx",
      "codigo": "import Seccion from './Seccion'\n\nexport default function Leyenda({ platos }) {\n  // Un Set y un array nuevos en cada render: ordenarlos no toca platos.\n  const presentes = new Set(platos.flatMap((plato) => plato.alergenos))\n  const alergenos = [...presentes].sort((a, b) => a.localeCompare(b, 'es'))\n\n  return (\n    <Seccion id=\"alergenos\" titulo=\"Alérgenos de esta carta\">\n      {alergenos.map((alergeno) => {\n        const nombres = platos\n          .filter((plato) => plato.alergenos.includes(alergeno))\n          .map((plato) => plato.nombre)\n        return (\n          <li key={alergeno}>\n            <strong>{alergeno}:</strong> {nombres.join(', ')}\n          </li>\n        )\n      })}\n    </Seccion>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Los datos de la carta, sin nada de interfaz. En una app real llegarían\n// de un servidor; los componentes solo los leen.\nexport const secciones = [\n  { id: 'entrantes', titulo: 'Entrantes' },\n  { id: 'principales', titulo: 'Principales' },\n  { id: 'postres', titulo: 'Postres' },\n]\n\nexport const platos = [\n  {\n    id: 'salmorejo',\n    seccion: 'entrantes',\n    nombre: 'Salmorejo cordobés',\n    descripcion: 'Con huevo duro y virutas de jamón ibérico.',\n    precio: 7.5,\n    alergenos: ['Gluten', 'Huevos'],\n  },\n  {\n    id: 'croquetas',\n    seccion: 'entrantes',\n    nombre: 'Croquetas de jamón',\n    descripcion: 'Seis unidades, cremosas por dentro.',\n    precio: 9,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n  },\n  {\n    id: 'bravas',\n    seccion: 'entrantes',\n    nombre: 'Patatas bravas',\n    descripcion: 'Con nuestra salsa brava casera.',\n    precio: 5.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n  {\n    id: 'pulpo',\n    seccion: 'entrantes',\n    nombre: 'Pulpo a la gallega',\n    descripcion: 'Con cachelos, pimentón de la Vera y aceite de oliva.',\n    precio: 16.5,\n    alergenos: ['Moluscos'],\n  },\n  {\n    id: 'fabada',\n    seccion: 'principales',\n    nombre: 'Fabada asturiana',\n    descripcion: 'Con su compango: chorizo, morcilla y panceta.',\n    precio: 14.5,\n    alergenos: [],\n    delDia: true,\n  },\n  {\n    id: 'bacalao',\n    seccion: 'principales',\n    nombre: 'Bacalao al pil pil',\n    descripcion: 'Lomo confitado en aceite de oliva, con su salsa.',\n    precio: 19.5,\n    alergenos: ['Pescado'],\n  },\n  {\n    id: 'carrillada',\n    seccion: 'principales',\n    nombre: 'Carrillada al vino tinto',\n    descripcion: 'Guisada a fuego lento, con puré de patata.',\n    precio: 17,\n    alergenos: ['Lácteos', 'Sulfitos'],\n  },\n  {\n    id: 'pisto',\n    seccion: 'principales',\n    nombre: 'Pisto manchego',\n    descripcion: 'Verduras de la huerta con huevo frito.',\n    precio: 12.5,\n    alergenos: ['Huevos'],\n    vegetariano: true,\n  },\n  {\n    id: 'tarta-de-queso',\n    seccion: 'postres',\n    nombre: 'Tarta de queso',\n    descripcion: 'Al horno, con el centro cremoso.',\n    precio: 6.5,\n    alergenos: ['Gluten', 'Huevos', 'Lácteos'],\n    vegetariano: true,\n    agotado: true,\n  },\n  {\n    id: 'arroz-con-leche',\n    seccion: 'postres',\n    nombre: 'Arroz con leche',\n    descripcion: 'Con canela y piel de limón.',\n    precio: 5,\n    alergenos: ['Lácteos'],\n    vegetariano: true,\n  },\n  {\n    id: 'fruta',\n    seccion: 'postres',\n    nombre: 'Fruta de temporada',\n    descripcion: 'Pregunta por la de hoy.',\n    precio: 4.5,\n    alergenos: [],\n    vegetariano: true,\n  },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 0.75rem;\n  background: #efe5d3;\n  color: #2b2118;\n  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;\n  line-height: 1.45;\n}\n\n.carta {\n  max-width: 38rem;\n  margin: 0 auto;\n  padding: 2rem 1.5rem;\n  background: #fffaf1;\n  border: 1px solid #d8c7aa;\n  outline: 1px solid #d8c7aa;\n  outline-offset: -7px;\n}\n\n.cabecera {\n  text-align: center;\n}\n\n.cabecera h1 {\n  margin: 0;\n  color: #7a2631;\n  font-size: 2rem;\n  font-weight: 600;\n}\n\n.cabecera p,\n.nota {\n  margin: 0.2rem 0 0;\n  color: #6b5e4f;\n  font-style: italic;\n}\n\n.seccion {\n  margin-top: 1.75rem;\n}\n\n.seccion h2 {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  margin: 0 0 0.25rem;\n  color: #7a2631;\n  font: 600 0.8rem/1.2 system-ui, sans-serif;\n  letter-spacing: 0.2em;\n  text-transform: uppercase;\n}\n\n.seccion h2::before,\n.seccion h2::after {\n  content: '';\n  flex: 1;\n  border-top: 1px solid #d8c7aa;\n}\n\n.seccion-lista {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.seccion-lista > li {\n  padding: 0.75rem 0;\n}\n\n.seccion-lista > li + li {\n  border-top: 1px dashed #e4d8c3;\n}\n\n.plato-cabecera,\n.plato h3 {\n  display: flex;\n  align-items: baseline;\n  gap: 0.5rem;\n}\n\n.plato h3 {\n  flex: 1;\n  margin: 0;\n  font-size: 1.05rem;\n  font-weight: 600;\n}\n\n.plato h3::after {\n  content: '';\n  flex: 1;\n  min-width: 1rem;\n  border-bottom: 2px dotted #cdb999;\n}\n\n.precio {\n  font-weight: 600;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n}\n\n.descripcion {\n  margin: 0.15rem 0 0;\n  color: #6b5e4f;\n  font-size: 0.95rem;\n  font-style: italic;\n}\n\n.plato-detalles,\n.alergenos {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n}\n\n.plato-detalles {\n  margin-top: 0.5rem;\n}\n\n.plato-detalles:empty {\n  display: none;\n}\n\n.alergenos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.alergenos li,\n.etiqueta {\n  padding: 0.05rem 0.55rem;\n  border-radius: 999px;\n  font: 500 0.75rem/1.6 system-ui, sans-serif;\n}\n\n.alergenos li {\n  border: 1px solid #d8c7aa;\n  color: #54493d;\n}\n\n.etiqueta {\n  font-weight: 600;\n  letter-spacing: 0.05em;\n  text-transform: uppercase;\n}\n\n.etiqueta-vegetariano {\n  background: #e3ecd3;\n  color: #36501b;\n}\n\n.etiqueta-agotado {\n  background: #ebe4da;\n  color: #54493d;\n}\n\n.plato-agotado h3,\n.plato-agotado .descripcion {\n  color: #6b5e4f;\n}\n\n.aviso-del-dia {\n  margin: 0 0 0.2rem;\n  color: #7f5300;\n  font: 700 0.7rem/1.4 system-ui, sans-serif;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n}\n\n.seccion-lista > .plato-del-dia {\n  margin: 0.25rem -0.75rem;\n  padding: 0.75rem;\n  border: 0;\n  border-radius: 0.6rem;\n  background: #fbefcf;\n}\n\n.seccion-lista > .plato-del-dia + li {\n  border-top: 0;\n}\n\n.seccion-lista > li:not(.plato) {\n  font-size: 0.95rem;\n}\n\n.seccion-lista strong {\n  color: #7a2631;\n}\n\n.nota {\n  margin-top: 1.75rem;\n  font-size: 0.85rem;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "datos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Ahora mírala como la ve React (lección 13). Cuando React pinta la carta, cada componente que ejecuta es un nodo del **árbol de render**:

```text
App
├── Seccion «Entrantes»
│   ├── Plato «Salmorejo cordobés»
│   ├── Plato «Croquetas de jamón»
│   ├── Plato «Patatas bravas»
│   └── Plato «Pulpo a la gallega»
├── Seccion «Principales»
│   └── 4 × Plato
├── Seccion «Postres»
│   └── 3 × Plato
└── Leyenda
    └── Seccion «Alérgenos de esta carta»
```

Y los archivos forman otro, el **árbol de dependencias de módulos**, en el que cada rama es un `import`:

```text
App.jsx
├── Leyenda.jsx
│   └── Seccion.jsx
├── Plato.jsx
├── Seccion.jsx
├── datos.jsx
└── estilos.css
```

Al compararlos salen tres ideas:

- **Un componente, muchos nodos.** `Plato` aparece once veces en el árbol de render, y `Seccion`, cuatro. Sus archivos son uno cada uno: a `Seccion.jsx` lo importan dos módulos, pero es el mismo archivo.
- **`children` separa los dos árboles.** En el de render, cada `Plato` cuelga de una `Seccion`. Pero `Seccion.jsx` no importa `Plato.jsx`: quien lo importa y escribe los `<Plato>` es `App.jsx`. `Seccion` solo los coloca.
- **No todo módulo es un componente.** `datos.jsx` y `estilos.css` están en el árbol de módulos y no en el de render: no pintan nada.

En el árbol de render tampoco están las etiquetas HTML (`li`, `h3`, `span`), solo los componentes. Por eso «Agotado» o «Plato del día» no lo cambian: son etiquetas dentro de un `Plato`. Lo cambiaría un componente que se pinta con una condición. Si sacas la lista de alérgenos a su propio componente y la pintas así dentro de `Plato`, ¿cuántos nodos `ListaAlergenos` tendrá el árbol de render de la carta?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function ListaAlergenos({ alergenos }) {\n  return (\n    <ul className=\"alergenos\" aria-label=\"Alérgenos\">\n      {alergenos.map((alergeno) => (\n        <li key={alergeno}>{alergeno}</li>\n      ))}\n    </ul>\n  )\n}\n\n// Dentro de Plato, en plato-detalles:\n{alergenos.length > 0 && <ListaAlergenos alergenos={alergenos} />}",
  "opciones": [
    "11, uno por plato",
    "8: los platos sin alérgenos no lo pintan",
    "1, porque es un solo componente",
    "Ninguno: lo que se pinta es un ul"
  ],
  "correcta": 1,
  "explicacion": "El árbol de render recoge los componentes que se pintan en ese render. Los once platos llegan a la condición, pero en las patatas bravas, la fabada y la fruta alergenos está vacío, el && da false y ListaAlergenos no se pinta. Quedan 8. Por eso el árbol de render puede cambiar de un render a otro: depende de los datos."
}
```

## Errores típicos

**La `key`, dentro del componente.** Al pasar la carta a datos es tentador poner la `key` en el `<li>` de `Plato`, que es lo que se repite. No sirve: dentro de `Plato` no hay ninguna lista. La lista está en el `map` de `App.jsx`, y la `key` va en lo que devuelve ese `map`: `<Plato key={plato.id} {...plato} />`. Con la `key` en el sitio equivocado, React sigue avisando:

```text
Each child in a list should have a unique "key" prop.

Check the render method of `Seccion`. It was passed a child from App. See https://react.dev/link/warning-keys for more information.
```

El aviso señala a `Seccion` porque es donde acaban los platos, dentro de su `<ul>`, pero añade que se los pasó `App`: ahí está el `map` que hay que arreglar.

**Pasar el plato entero con otro nombre.** `<Plato plato={plato} />` es válido, pero entonces la única prop que llega es `plato`. ¿Qué pinta esta lista?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Plato({ nombre, precio }) {\n  return (\n    <li>\n      <h3>{nombre}</h3>\n      <span>{precio} €</span>\n    </li>\n  )\n}\n\n// platos es el array de datos.jsx\nexport default function App() {\n  return (\n    <ul>\n      {platos.map((plato) => (\n        <Plato key={plato.id} plato={plato} />\n      ))}\n    </ul>\n  )\n}",
  "opciones": [
    "Los nombres y los precios de los platos",
    "Fichas con el título vacío y « €» sin número, sin ningún aviso",
    "Un error: Plato no espera ninguna prop llamada plato"
  ],
  "correcta": 1,
  "explicacion": "Plato desestructura nombre y precio, pero lo único que recibe es plato, así que los dos valen undefined, y React no pinta undefined. No hay error ni aviso: pasar una prop que el componente no usa es válido. Arréglalo pasando las propiedades sueltas con {...plato} o leyendo plato.nombre dentro de Plato."
}
```

**Modificar los datos durante el render.** La fabada, el plato del día, tiene 2 € de descuento, y parece razonable aplicarlo en el `map` de `App`. Con el `Plato` del paso 5, ¿qué precio enseña la fabada, que en `datos.jsx` cuesta 14,50 €?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Con StrictMode activado, como en la plantilla de Vite\nexport default function App() {\n  return (\n    <ul>\n      {platos.map((plato) => {\n        // El plato del día tiene 2 € de descuento\n        if (plato.delDia) plato.precio = plato.precio - 2\n        return <Plato key={plato.id} {...plato} />\n      })}\n    </ul>\n  )\n}",
  "opciones": [
    "12,50 €",
    "10,50 €",
    "14,50 €"
  ],
  "correcta": 1,
  "explicacion": "El map cambia el objeto de datos.jsx mientras renderiza, y StrictMode llama dos veces a App en desarrollo: el descuento se aplica dos veces. Sin StrictMode saldría 12,50 €, pero cada nuevo render de App lo volvería a rebajar. Calcula sin tocar el dato: precio={plato.delDia ? plato.precio - 2 : plato.precio}."
}
```

**Olvidar pintar `{children}`.** Si `Seccion` recibe `children` pero no lo pone en ningún sitio, cada sección sale con su título y vacía. React no se queja: no usar una prop no es un error. Si una sección sale vacía, lo primero es mirar si `Seccion` pinta `{children}`.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Props: un componente, muchos datos",
      "texto": "Plato se escribe una vez y pinta once platos distintos. Lo que cambia le llega por props: el texto entre comillas y todo lo demás entre llaves."
    },
    {
      "titulo": "children: componentes que envuelven",
      "texto": "Seccion no sabe qué contiene: pinta lo que le pongan entre sus etiquetas. Platos en las secciones de la carta, filas de texto en la leyenda."
    },
    {
      "titulo": "Listas con key",
      "texto": "filter elige, map convierte cada dato en un elemento, y la key, sacada de los datos, va en el elemento que devuelve el map. Solo tiene que ser única entre hermanos."
    },
    {
      "titulo": "Cada condición, con su herramienta",
      "texto": "Ternario para una cosa u otra, && para algo o nada, y una variable con if cuando intervienen varias condiciones. Nunca un número a la izquierda de &&."
    },
    {
      "titulo": "Calcular en vez de guardar",
      "texto": "Los precios y la leyenda se calculan en cada render a partir de los datos, sin modificar nada que existiera antes. Por eso dan siempre el mismo resultado, también con StrictMode."
    },
    {
      "titulo": "Dos árboles",
      "texto": "El de render dice qué componente pinta a cuál; el de módulos, qué archivo importa a cuál. Con children no coinciden: Seccion pinta los platos sin importar Plato."
    }
  ]
}
```

## Retos para seguir practicando

Parte de la carta completa. Estos no tienen comprobación automática:

1. Añade a `datos.jsx` un entrante nuevo, por ejemplo una «Ensalada de queso de cabra y nueces» con lácteos y frutos de cáscara. Comprueba que aparece en su sección y que la leyenda gana una línea, sin tocar ningún componente.
2. Añade a algunos platos un campo `picante` con un número del 0 al 3 y pinta la etiqueta «Picante» solo cuando sea mayor que 0. Aquí el 0 a la izquierda de `&&` te va a dar guerra si no tienes cuidado.
3. Haz que cada sección diga cuántos platos tiene y desde qué precio («Postres · 3 platos · desde 4,50 €»). Calcúlalo en `App` con los platos ya filtrados y pásaselo a `Seccion` como props.
4. Para después del módulo 3: un botón «Solo vegetarianos» que filtre la carta. Necesitarás un evento y estado (lecciones 15 y 16), pero fíjate en lo que no cambia: `Plato`, `Seccion` y `datos.jsx` se quedan como están, porque el filtro es un `filter` más en `App`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Passing Props to a Component",
      "descripcion": "Props, valores por defecto, el spread {...props} y children, con el ejemplo de la tarjeta que envuelve lo que le pongas dentro.",
      "url": "https://react.dev/learn/passing-props-to-a-component",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Conditional Rendering",
      "descripcion": "El ternario, && y las variables con if, y la trampa del 0 a la izquierda de &&.",
      "url": "https://react.dev/learn/conditional-rendering",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rendering Lists",
      "descripcion": "filter, map y de dónde sacar la key, con un reto muy parecido a las secciones de esta carta.",
      "url": "https://react.dev/learn/rendering-lists",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Keeping Components Pure",
      "descripcion": "Por qué un componente no debe modificar lo que existía antes del render, y qué es la mutación local.",
      "url": "https://react.dev/learn/keeping-components-pure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Understanding Your UI as a Tree",
      "descripcion": "El árbol de render y el de dependencias de módulos, y por qué children hace que no coincidan.",
      "url": "https://react.dev/learn/understanding-your-ui-as-a-tree",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Intl.NumberFormat",
      "descripcion": "Todas las opciones para formatear números, monedas y unidades según el idioma.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
      "etiqueta": "MDN"
    }
  ]
}
```
