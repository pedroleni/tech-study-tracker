# Librerías de componentes: headless, Radix, React Aria y shadcn/ui

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `librerias-de-componentes-headless-radix-react-aria-y-shadcn-ui` (autogenerado del título)
- **Orden:** 800
- **Fuentes:** [Radix Primitives: Introduction](https://www.radix-ui.com/primitives/docs/overview/introduction) + [React Aria](https://react-aria.adobe.com/) + [shadcn/ui](https://ui.shadcn.com/docs) — ver `contenido/react/TEMARIO.md` #80

---

## Qué es y para qué sirve

Un `<div onClick>` no es un botón. No recibe el foco con el tabulador, no responde a Enter ni a la barra espaciadora y un lector de pantalla no lo anuncia como botón. Con los controles que trae el navegador (`<button>`, `<input>`, `<details>`, `<dialog>`) eso viene de serie. El problema aparece con los que el navegador **no** trae: **pestañas, menús desplegables, diálogos modales, listas de selección con búsqueda, selectores de fecha**. Hay que escribir los roles y atributos ARIA, el teclado, la gestión del foco y los estados. Cada uno tiene su patrón, documentado en la guía WAI-ARIA Authoring Practices (APG, módulo 8 de HTML), y acertar con todos los detalles es un trabajo más largo de lo que parece.

Una **librería de componentes** te lo da hecho. Hay tres niveles, y esta lección los separa porque se confunden mucho:

> **Una librería *headless* (sin cabeza) te da el comportamiento y la accesibilidad de un componente, y ningún estilo: el aspecto lo pones tú. Radix y React Aria son dos librerías headless. shadcn/ui es otra cosa: componentes con aspecto, construidos encima de una de ellas, cuyo código no instalas: lo copias en tu proyecto.**

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Qué se ha comprobado y cómo",
  "contenido": "Los bloques de esta web solo cargan React, así que no pueden importar Radix, React Aria ni shadcn/ui. Lo que cabe en la vista previa, un componente accesible escrito a mano, se ejecuta aquí. Lo demás se ejecutó fuera, en una carpeta de pruebas con React 19.3.1, radix-ui 1.8.1 (12 de octubre de 2026), react-aria-components 1.22.1 (9 de octubre) y la CLI shadcn 4.22.1 (18 de octubre), con jsdom y Testing Library; cada salida que verás es real, y el código que se cita es el que se ejecutó."
}
```

## Lo que hay debajo de unas pestañas

Antes de usar una librería conviene ver qué hace por ti. Estas son las pestañas del taller de cerámica Barro y Fuego, escritas a mano. Úsalas **solo con el teclado**: tabulador para entrar, flechas para cambiar de pestaña, Inicio y Fin para ir a la primera o a la última.

```laboratorio
{
  "tipo": "react-anotado",
  "codigo": "import { useId, useRef, useState } from 'react'\nimport './estilos.css'\n\nconst PESTANAS = [\n  { id: 'niveles', titulo: 'Niveles', texto: 'Iniciación, intermedio y torno avanzado.' },\n  { id: 'horarios', titulo: 'Horarios', texto: 'Martes y jueves de 18:00 a 20:30.' },\n  { id: 'precios', titulo: 'Precios', texto: 'Cuota mensual: 65 €, con material incluido.' },\n]\n\nexport default function Taller() {\n  const base = useId()\n  const [activa, setActiva] = useState('niveles')\n  const botones = useRef({})\n\n  function elegir(indice) {\n    const pestana = PESTANAS[indice]\n    setActiva(pestana.id)\n    botones.current[pestana.id].focus()\n  }\n\n  function manejarTeclas(evento) {\n    const indice = PESTANAS.findIndex((p) => p.id === activa)\n    if (evento.key === 'ArrowRight') elegir((indice + 1) % PESTANAS.length)\n    else if (evento.key === 'ArrowLeft') elegir((indice - 1 + PESTANAS.length) % PESTANAS.length)\n    else if (evento.key === 'Home') elegir(0)\n    else if (evento.key === 'End') elegir(PESTANAS.length - 1)\n    else return\n    evento.preventDefault()\n  }\n\n  return (\n    <main>\n      <h1>Taller de cerámica Barro y Fuego</h1>\n      <div role=\"tablist\" aria-label=\"Información del taller\" onKeyDown={manejarTeclas}>\n        {PESTANAS.map((p) => (\n          <button\n            key={p.id}\n            ref={(el) => {\n              botones.current[p.id] = el\n            }}\n            id={`${base}-pestana-${p.id}`}\n            role=\"tab\"\n            type=\"button\"\n            aria-selected={p.id === activa}\n            aria-controls={`${base}-panel-${p.id}`}\n            tabIndex={p.id === activa ? 0 : -1}\n            onClick={() => setActiva(p.id)}\n          >\n            {p.titulo}\n          </button>\n        ))}\n      </div>\n      {PESTANAS.map((p) => (\n        <div\n          key={p.id}\n          id={`${base}-panel-${p.id}`}\n          role=\"tabpanel\"\n          aria-labelledby={`${base}-pestana-${p.id}`}\n          tabIndex={0}\n          hidden={p.id !== activa}\n        >\n          {p.texto}\n        </div>\n      ))}\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.25rem;\n}\n\n[role='tablist'] {\n  display: flex;\n  gap: 0.25rem;\n  border-bottom: 2px solid #d6d3d1;\n}\n\n[role='tab'] {\n  padding: 0.4rem 0.8rem;\n  border: none;\n  border-bottom: 3px solid transparent;\n  background: none;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='tab'][aria-selected='true'] {\n  border-bottom-color: #c2410c;\n  font-weight: 600;\n}\n\n[role='tab']:focus-visible,\n[role='tabpanel']:focus-visible,\nbutton:focus-visible {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 2px;\n}\n\n[role='tabpanel'] {\n  padding: 0.8rem 0.2rem;\n}\n\n.pregunta {\n  border-bottom: 1px solid #d6d3d1;\n}\n\n.pregunta-titulo {\n  display: flex;\n  width: 100%;\n  padding: 0.6rem 0.2rem;\n  border: none;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.pregunta-texto {\n  margin: 0;\n  padding: 0 0.2rem 0.8rem;\n  color: #44403c;\n}",
  "anotaciones": [
    {
      "fragmento": "const base = useId()",
      "nota": "Cada pestaña necesita saber el id de su panel, y cada panel el de su pestaña. useId (lección 37) da un prefijo único por componente, para que dos grupos de pestañas en la misma página no choquen."
    },
    {
      "fragmento": "<div role=\"tablist\" aria-label=\"Información del taller\" onKeyDown={manejarTeclas}>",
      "nota": "El rol tablist dice «esto es una lista de pestañas», y su aria-label le da nombre. El manejador de teclado va en el contenedor: los eventos de las pestañas suben hasta aquí (lección 15)."
    },
    {
      "fragmento": "role=\"tab\"",
      "nota": "Un button normal con el rol tab. Sigue siendo un botón (recibe foco y responde a Enter), pero un lector de pantalla lo anuncia como «pestaña, 1 de 3»."
    },
    {
      "fragmento": "aria-selected={p.id === activa}",
      "nota": "El estado, como atributo. Es lo que la tecnología de apoyo anuncia como «seleccionada». El color de la pestaña activa en el CSS sale del mismo atributo, para que lo visual y lo anunciado no se separen."
    },
    {
      "fragmento": "tabIndex={p.id === activa ? 0 : -1}",
      "nota": "El foco itinerante (roving tabindex): solo la pestaña activa está en el orden del tabulador; las demás, con -1, solo se alcanzan con las flechas. Así la lista entera es una sola parada del tabulador, no tres."
    },
    {
      "fragmento": "if (evento.key === 'ArrowRight') elegir((indice + 1) % PESTANAS.length)",
      "nota": "Las flechas pasan a la pestaña siguiente y, al llegar a la última, dan la vuelta. Izquierda, Inicio y Fin siguen el patrón Tabs de la guía WAI-ARIA. elegir cambia la pestaña activa y le pasa el foco."
    },
    {
      "fragmento": "aria-controls={`${base}-panel-${p.id}`}",
      "nota": "Une cada pestaña con su panel. El panel devuelve la unión con aria-labelledby, de modo que el panel tiene como nombre el texto de su pestaña."
    },
    {
      "fragmento": "hidden={p.id !== activa}",
      "nota": "Los paneles que no tocan se ocultan con hidden, que también los saca del árbol de accesibilidad. El panel visible tiene tabIndex 0 para que el tabulador pueda llegar a su contenido."
    }
  ]
}
```

Son unas setenta líneas, y falta lo que no se ve: orientación vertical, pestañas desactivadas, activación manual al enfocar, idioma de lectura de derecha a izquierda. Fíjate también en la última parada del tabulador. Cuando la lista de pestañas tiene el foco y pulsas una vez más el tabulador, ¿a dónde va?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Enfocas «Niveles» con el tabulador.\n// Pulsas la flecha derecha dos veces: el foco está en «Precios».\n// Pulsas el tabulador una vez.\n\n// ¿Dónde está el foco ahora?",
  "opciones": [
    "En la pestaña «Niveles», porque el tabulador recorre las pestañas",
    "En el panel de «Precios», porque tiene tabIndex 0",
    "Fuera del grupo, en lo siguiente de la página",
    "En ningún sitio: el panel no recibe foco"
  ],
  "correcta": 1,
  "explicacion": "Las pestañas inactivas tienen tabIndex -1, así que el tabulador se las salta. Lo siguiente en el orden es el panel visible, que tiene tabIndex 0. Es lo que pide el patrón de la guía WAI-ARIA, y es lo que se midió con esta versión: tras End y un tabulador, el foco acaba en el tabpanel. Radix y React Aria hacen lo mismo."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Roles y relaciones",
      "texto": "tablist, tab y tabpanel, y los atributos que los unen: aria-controls, aria-labelledby, aria-selected. Sin ellos, un lector de pantalla ve botones sueltos y párrafos."
    },
    {
      "titulo": "Teclado",
      "texto": "Las flechas, Inicio y Fin no vienen con button: hay que escribirlas, y cada patrón tiene las suyas. Un menú usa otras, un diálogo otras, una lista de selección otras."
    },
    {
      "titulo": "Foco",
      "texto": "Quién lo tiene, a dónde va al abrir algo, a dónde vuelve al cerrarlo. Es la parte donde más se falla (lección 37)."
    },
    {
      "titulo": "Estados",
      "texto": "Seleccionado, expandido, desactivado, en uso. Cada uno se anuncia con un atributo y, además, hay que poder estilarlo."
    },
    {
      "titulo": "Lo de alrededor",
      "texto": "Menús y diálogos se pintan fuera de su sitio (portales, lección 36), se cierran con Escape o al pulsar fuera, y se colocan al lado de lo que los abre, sin salirse de la pantalla."
    }
  ]
}
```

## Headless: comportamiento sin aspecto

«Headless» significa que el componente **no trae estilos ni decide cómo se ve**: trae lo de la lista de arriba. Pones tú el HTML de alrededor, las clases y los colores, con lo que ya conoces (CSS, módulos, Tailwind: lección 79). Eso las distingue de las librerías de componentes con aspecto (Material UI, Ant Design, Chakra...), donde el botón ya viene pintado y cambiarlo es pelearse con sus estilos.

Y no te libra del HTML nativo, que sigue siendo lo primero que hay que mirar: un `<button>`, un `<details>`, un `<dialog>` o un `<select>` ya traen su teclado y su semántica, y no pesan nada. Las librerías headless son para lo que el navegador no resuelve, o no resuelve bien.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres capas, de abajo arriba",
  "roles": [
    {
      "etiqueta": "HTML nativo",
      "rol": "button, details, dialog, select",
      "descripcion": "Comportamiento y accesibilidad del navegador, sin JavaScript. Siempre primero. No cubre pestañas, menús ni selectores avanzados."
    },
    {
      "etiqueta": "Headless",
      "rol": "Radix, React Aria",
      "descripcion": "Comportamiento y accesibilidad de los patrones complejos, sin estilos. Tú pones el aspecto con CSS, Tailwind o lo que uses."
    },
    {
      "etiqueta": "Con aspecto, a tu medida",
      "rol": "shadcn/ui",
      "descripcion": "Componentes ya estilados con Tailwind sobre una librería headless, copiados a tu código. Los editas como cualquier archivo tuyo."
    }
  ]
}
```

## Radix Primitives

**Radix Primitives** es una colección de componentes sin estilos para los patrones de siempre: acordeón, diálogo, menú desplegable, pestañas, selector, tooltip... Su documentación recomienda instalar el paquete único `radix-ui` (`npm install radix-ui`, versión 1.8.1 publicada el 12 de octubre de 2026) e importar por nombre las piezas que uses. Dicen en su introducción que son accesibles (siguen los patrones WAI-ARIA y se encargan de los atributos, el foco y el teclado), que no traen estilos y que son **no controlados por defecto**: funcionan sin que escribas el estado, y puedes controlarlos cuando haga falta.

Cada componente es un conjunto de **partes** (`Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) que tú compones. Estas son las pestañas de antes con Radix:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Tabs } from 'radix-ui'\nimport './tabs.css'\n\nexport default function Taller() {\n  return (\n    <Tabs.Root defaultValue=\"niveles\" className=\"tabs\">\n      <Tabs.List aria-label=\"Información del taller\" className=\"tabs-lista\">\n        <Tabs.Trigger value=\"niveles\" className=\"tabs-boton\">Niveles</Tabs.Trigger>\n        <Tabs.Trigger value=\"horarios\" className=\"tabs-boton\">Horarios</Tabs.Trigger>\n        <Tabs.Trigger value=\"precios\" className=\"tabs-boton\">Precios</Tabs.Trigger>\n      </Tabs.List>\n      <Tabs.Content value=\"niveles\">Iniciación, intermedio y torno avanzado.</Tabs.Content>\n      <Tabs.Content value=\"horarios\">Martes y jueves de 18:00 a 20:30.</Tabs.Content>\n      <Tabs.Content value=\"precios\">Cuota mensual: 65 €, con material incluido.</Tabs.Content>\n    </Tabs.Root>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { Tabs } from 'radix-ui'",
      "nota": "Un solo paquete, y cada componente es un espacio de nombres: Tabs, Dialog, Popover... Alternativamente existen paquetes sueltos como @radix-ui/react-tabs."
    },
    {
      "fragmento": "<Tabs.Root defaultValue=\"niveles\" className=\"tabs\">",
      "nota": "No controlado: defaultValue dice qué pestaña empieza abierta y Radix guarda cuál está activa. Para controlarlo tú, value y onValueChange (lección 22)."
    },
    {
      "fragmento": "<Tabs.List aria-label=\"Información del taller\" className=\"tabs-lista\">",
      "nota": "Todas las partes aceptan className y el resto de atributos de su elemento. El nombre accesible de la lista sigue siendo cosa tuya: Radix no lo puede inventar."
    },
    {
      "fragmento": "<Tabs.Trigger value=\"niveles\" className=\"tabs-boton\">Niveles</Tabs.Trigger>",
      "nota": "La pestaña. value la une con el Tabs.Content que tiene el mismo value; los ids, aria-controls y aria-labelledby los pone Radix."
    },
    {
      "fragmento": "<Tabs.Content value=\"niveles\">",
      "nota": "El panel. Sin ningún useId, ref ni onKeyDown: todo lo que escribiste a mano en el bloque anterior está dentro de estas cuatro partes."
    }
  ]
}
```

Se montó en jsdom y se imprimió el DOM que produce, con los atributos que importan (se omiten los demás):

```text
--- DOM inicial
<div data-orientation="horizontal">
  <div role="tablist" aria-orientation="horizontal" aria-label="Información del taller" tabindex="0" data-orientation="horizontal">
    <button role="tab" aria-selected="true" aria-controls="radix-_r_0_-content-niveles" tabindex="-1" id="radix-_r_0_-trigger-niveles" data-state="active" data-orientation="horizontal" type="button"> Niveles
    <button role="tab" aria-selected="false" aria-controls="radix-_r_0_-content-horarios" tabindex="-1" id="radix-_r_0_-trigger-horarios" data-state="inactive" data-orientation="horizontal" type="button"> Horarios
    <button role="tab" aria-selected="false" aria-controls="radix-_r_0_-content-precios" tabindex="-1" id="radix-_r_0_-trigger-precios" data-state="inactive" data-orientation="horizontal" type="button"> Precios
  <div role="tabpanel" aria-labelledby="radix-_r_0_-trigger-niveles" tabindex="0" id="radix-_r_0_-content-niveles" data-state="active" data-orientation="horizontal"> Iniciación, intermedio y torno avanzado.
  <div role="tabpanel" aria-labelledby="radix-_r_0_-trigger-horarios" tabindex="0" id="radix-_r_0_-content-horarios" hidden data-state="inactive" data-orientation="horizontal">
  <div role="tabpanel" aria-labelledby="radix-_r_0_-trigger-precios" tabindex="0" id="radix-_r_0_-content-precios" hidden data-state="inactive" data-orientation="horizontal">
```

Puedes leer ahí todo lo que escribiste antes: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` y `aria-labelledby` con ids generados, y los paneles inactivos con `hidden`. Hay dos cosas propias de Radix: el estado está en **`data-state="active"` o `"inactive"`**, que es a lo que apuntas en tu CSS (`[data-state='active'] { … }`), y las pestañas tienen `tabindex="-1"` incluso la activa, mientras que **la lista (`tablist`) tiene `tabindex="0"`**, y aun así el tabulador acaba en la pestaña activa. El resultado visible es el mismo que el del patrón escrito a mano:

```text
--- Tab: foco en «Niveles», seleccionada «Niveles»
--- ArrowRight: foco «Horarios», seleccionada «Horarios», panel visible: Martes y jueves de 18:00 a 20:30.
--- End: foco «Precios», seleccionada «Precios»
--- ArrowRight desde el último: foco «Niveles», seleccionada «Niveles»
--- Home: foco «Niveles», seleccionada «Niveles»
--- Tab otra vez: foco en «Iniciación, intermedio y torno avanzado.» (tabpanel)
```

### Componer con `asChild`

Los botones de tu sistema de diseño no son los de Radix. Para eso existe **`asChild`**: en vez de pintar su elemento por defecto, la parte **clona a su hijo y le pasa su comportamiento**, es decir, sus atributos y sus manejadores. Así un `Popover.Trigger` puede ser tu `Button` con todos sus estilos, y sigue abriendo y cerrando el popover. Es lo que hace esta web en su barra de navegación (`src/components/layout/Navbar.tsx`), para el menú del móvil (aquí recortado):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "<Popover.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>\n  <div className=\"flex items-center gap-2 sm:hidden\">\n    <DarkModeToggle />\n    <Popover.Trigger asChild>\n      <Button type=\"button\" variant=\"outline\" size=\"icon\">\n        {mobileMenuOpen ? <X aria-hidden=\"true\" /> : <Menu aria-hidden=\"true\" />}\n      </Button>\n    </Popover.Trigger>\n  </div>\n  <Popover.Portal>\n    <Popover.Content\n      aria-label=\"Menú de navegación móvil\"\n      align=\"end\"\n      sideOffset={8}\n      className=\"z-50 w-56 rounded-xl border bg-popover p-2 shadow-md\"\n    >\n      {/* los enlaces de navegación */}\n    </Popover.Content>\n  </Popover.Portal>\n</Popover.Root>",
  "anotaciones": [
    {
      "fragmento": "open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}",
      "nota": "Aquí sí se controla el popover con un useState normal, porque la barra necesita cerrarlo al pulsar un enlace. Radix avisa con onOpenChange cuando se cierra por Escape o por un clic fuera."
    },
    {
      "fragmento": "<Popover.Trigger asChild>",
      "nota": "Radix no pinta un botón propio: toma el Button del hijo (el de shadcn, que verás más abajo) y le añade aria-expanded, aria-haspopup y el onClick que abre el popover."
    },
    {
      "fragmento": "<Popover.Portal>",
      "nota": "El contenido se pinta fuera del árbol del componente, colgando de body (lección 36), para que ningún overflow ni z-index de la barra lo recorte."
    },
    {
      "fragmento": "align=\"end\"\n      sideOffset={8}",
      "nota": "La colocación respecto al botón: alineado al final y a 8 píxeles. Radix también lo recoloca si no cabe en la pantalla."
    },
    {
      "fragmento": "className=\"z-50 w-56 rounded-xl border bg-popover p-2 shadow-md\"",
      "nota": "Los estilos son de la web: clases de Tailwind (lección 79). Radix no aporta ni una."
    }
  ]
}
```

Qué hace Radix en ese popover sin que escribas nada se puede medir. Con la misma estructura (un botón con `asChild`, `Portal` y `Content`), se pulsó, se cerró con Escape, se volvió a abrir y se pulsó fuera:

```text
--- Cerrado. Disparador: <button aria-expanded="false" aria-haspopup="dialog" data-state="closed" type="button"> Abrir menú
--- Clic: dialog en pantalla: true. Foco: div «CursosTienda»
disparador ahora: <button aria-controls="radix-_r_0_" aria-expanded="true" aria-haspopup="dialog" data-state="open" type="button"> Cerrar menú
contenido: <div role="dialog" aria-label="Menú del taller" tabindex="-1" id="radix-_r_0_" data-state="open">
  <a> Cursos
  <a> Tienda
contenido está dentro del contenedor del render: false (cuelga de div)
--- Escape: dialog en pantalla: false. Foco: button «Abrir menú»
--- Reabro y hago clic fuera: dialog en pantalla: false
--- Abierto, hijos de body: span div div span
```

- El botón gana **`aria-expanded`**, **`aria-haspopup="dialog"`**, **`aria-controls`** y **`data-state`**, y los cambia al abrir y cerrar.
- El foco **entra en el contenido** al abrirlo y **vuelve al botón** con Escape. El clic fuera también lo cierra.
- El contenido es un `role="dialog"` que cuelga de otro sitio del DOM (`body`), no del contenedor del componente.
- No marca el resto de la página como oculta (`aria-hidden`): la última línea lista los hijos de `body` y ninguno lo lleva. Por defecto el popover no es modal.

## React Aria

**React Aria** es la librería headless de Adobe. Tiene el mismo objetivo que Radix (comportamiento, accesibilidad, ningún estilo) y otra forma de organizarse, en capas:

- **`react-aria-components`** (versión 1.22.1 el 9 de octubre de 2026): componentes ya montados, sin estilos, que se usan como los de Radix. Son los de esta lección.
- **`react-aria`** (3.53.1): Hooks, como `useTabList`, `useButton` o `useDialog`, que dan el comportamiento y los atributos y te dejan escribir **tú** el DOM. Es el nivel más bajo, para cuando los componentes no te encajan. Comprobado que existen.
- **`react-stately`**: el estado que usan los dos niveles de arriba.

Más de cincuenta componentes, según su página: a los que trae Radix suman un `ComboBox`, un `Calendar`, un `DatePicker` y una `Table`. Estas son las mismas pestañas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'\nimport './tabs.css'\n\nexport default function Taller() {\n  return (\n    <Tabs className=\"tabs\">\n      <TabList aria-label=\"Información del taller\" className=\"tabs-lista\">\n        <Tab id=\"niveles\" className=\"tabs-boton\">Niveles</Tab>\n        <Tab id=\"horarios\" className=\"tabs-boton\">Horarios</Tab>\n        <Tab id=\"precios\" className=\"tabs-boton\">Precios</Tab>\n      </TabList>\n      <TabPanel id=\"niveles\">Iniciación, intermedio y torno avanzado.</TabPanel>\n      <TabPanel id=\"horarios\">Martes y jueves de 18:00 a 20:30.</TabPanel>\n      <TabPanel id=\"precios\">Cuota mensual: 65 €, con material incluido.</TabPanel>\n    </Tabs>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'",
      "nota": "Aquí cada pieza es un componente con su nombre, sin espacio de nombres: Tabs, TabList, Tab y TabPanel. Es el mismo reparto en cuatro partes que en Radix."
    },
    {
      "fragmento": "<Tab id=\"niveles\" className=\"tabs-boton\">Niveles</Tab>",
      "nota": "La unión entre pestaña y panel es el id, no un value. Cuando no pasas className, cada parte lleva una clase por defecto (react-aria-Tab), a la que puedes apuntar con CSS normal."
    },
    {
      "fragmento": "<TabPanel id=\"precios\">",
      "nota": "El panel del mismo id. A diferencia de Radix, solo se pinta el panel seleccionado; los demás no están en el DOM."
    }
  ]
}
```

Y esto es lo que sale por la otra puerta (mismas condiciones, mismos atributos filtrados):

```text
--- DOM inicial
<div data-orientation="horizontal" data-rac>
  <div role="tablist" aria-orientation="horizontal" aria-label="Información del taller" id="react-aria-_r_5_" data-orientation="horizontal" data-rac>
    <div role="tab" aria-selected="true" aria-controls="react-aria-_r_5_-tabpanel-niveles" tabindex="0" id="react-aria-_r_5_-tab-niveles" data-selected="true" data-rac> Niveles
    <div role="tab" aria-selected="false" tabindex="-1" id="react-aria-_r_5_-tab-horarios" data-rac> Horarios
    <div role="tab" aria-selected="false" tabindex="-1" id="react-aria-_r_5_-tab-precios" data-rac> Precios
  <div role="tabpanel" aria-labelledby="react-aria-_r_5_-tab-niveles" tabindex="0" id="react-aria-_r_5_-tabpanel-niveles" data-rac> Iniciación, intermedio y torno avanzado.
```

El mismo patrón WAI-ARIA, con otra implementación. Dos diferencias a la vista: los tabs de React Aria son `div` con `role="tab"` y no `button`, y el **foco itinerante** es el clásico: la pestaña activa tiene `tabindex="0"` y las demás `-1`, sin que la lista reciba el foco. El **estado** está en `data-selected`, en vez de `data-state`. Con el teclado, el resultado es idéntico al de Radix y al de tu versión a mano: flecha derecha, `End` (a «Precios»), flecha derecha de nuevo (vuelta a «Niveles»), `Home`, y un tabulador final que va al panel.

### Estilos: clases, `data-*` y render props

Según su guía de estilos, React Aria no incluye estilos y ofrece tres puntos de entrada. **Clases**: cada parte trae una clase por defecto (`react-aria-Tab`) o la que le pases con `className`. **Estados** como atributos `data-*`: `data-selected`, `data-hovered`, `data-pressed`, `data-focus-visible`... y **render props**, es decir, `className` o `style` pueden ser funciones que reciben el estado:

```jsx
<Tab id="niveles" className={({ isSelected }) => (isSelected ? 'tab tab--activa' : 'tab')}>
  Niveles
</Tab>
```

`data-pressed` y `data-hovered` son parecidos a `:active` y `:hover`, pero según la guía **se comportan igual con ratón, pantalla táctil y teclado**, y esa es una de sus marcas de la casa: React Aria hace mucho trabajo en las interacciones (pulsar con el dedo, arrastrar, el foco visible solo por teclado).

### El mismo popover

La versión de React Aria del popover de antes se escribe con otras piezas (`DialogTrigger`, `Popover`, `Dialog`) y se midió igual:

```text
--- Cerrado. Disparador: <button aria-expanded="false" tabindex="0" id="react-aria-_r_4_" data-rac type="button"> Abrir menú
--- Clic: dialog en pantalla: true. Foco: section «CursosTienda»
disparador ahora: <button aria-controls="react-aria-_r_3_" aria-expanded="true" tabindex="0" id="react-aria-_r_4_" data-rac type="button"> Cerrar menú
contenido: <section role="dialog" aria-label="Menú del taller" tabindex="-1" id="react-aria-_r_3_" data-rac>
  <a> Cursos
  <a> Tienda
contenido está dentro del contenedor del render: false (cuelga de div)
--- Escape: dialog en pantalla: false. Foco: button «Abrir menú»
--- Reabro y hago clic fuera: dialog en pantalla: false
--- Abierto, hijos de body: div[aria-hidden] span[aria-hidden] div[aria-hidden] div span[aria-hidden]
```

Hay una diferencia que se ve en la última línea. Mientras el popover está abierto, **React Aria marca el resto de la página con `aria-hidden`** (el contenedor de la aplicación, entre otros), para que un lector de pantalla no se salga del popover. Radix, en su modo por defecto, no. Es una decisión de diseño, no un fallo de ninguna de las dos, y se nota en el comportamiento con tecnologías de apoyo. El foco también vuelve al botón con Escape (en esta prueba, tras un breve instante).

## Radix o React Aria

No hay uno mejor. Lo que los separa, de lo medido y de sus propias páginas:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Qué traen",
      "texto": "Radix: en radix-ui 1.8.1 se exportan 28 espacios de nombres, entre componentes y utilidades, y ninguno es un selector de fecha, un calendario ni un combobox. React Aria: más de cincuenta, con ComboBox, DatePicker, Calendar y Table, e internacionalización (idiomas, calendarios, números) de serie."
    },
    {
      "titulo": "Cómo se usan",
      "texto": "Radix se compone con partes y asChild. React Aria, con componentes que se pasan className en forma de función y render props; y tiene además una capa de Hooks para quien quiere el DOM por completo."
    },
    {
      "titulo": "Cómo se estila",
      "texto": "Radix: data-state y atributos como data-orientation. React Aria: data-selected, data-pressed, data-focus-visible y una clase por defecto por parte. Los dos van bien con CSS normal, módulos y Tailwind."
    },
    {
      "titulo": "En el DOM",
      "texto": "Con las mismas pestañas: botones frente a divs, un tablist con tabindex 0 frente a la pestaña activa con tabindex 0, paneles inactivos ocultos con hidden frente a paneles inactivos que no se pintan. Un popover que deja la página como estaba frente a otro que oculta lo de fuera."
    },
    {
      "titulo": "Quién los usa",
      "texto": "Radix es la base por defecto de shadcn/ui (el estilo radix-nova de esta web). React Aria es la de los componentes de Adobe, y ahora también una de las bases de shadcn/ui, como verás."
    }
  ]
}
```

## shadcn/ui: código que copias, no una dependencia

Su propia introducción lo dice con una frase: «Esto no es una librería de componentes. Es cómo construyes tu librería de componentes». Con una librería normal, `npm install` y a importar. Con **shadcn/ui no hay un paquete de componentes que instalar**: una herramienta de línea de comandos **escribe el código del componente en tu proyecto**, en `src/components/ui/`, y a partir de ahí es tuyo. Puedes cambiarle una clase, un comportamiento o el nombre de una variante sin esperar a nadie ni pelearte con estilos.

Cada componente, por dentro, es una capa fina: **un componente headless (de Radix, por defecto) más clases de Tailwind** (lección 79). Esta web lo usa. Su `components.json`, el archivo que le dice a la CLI cómo funcionan las cosas en el proyecto, dice esto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "{\n  \"style\": \"radix-nova\",\n  \"tsx\": true,\n  \"tailwind\": {\n    \"css\": \"src/index.css\",\n    \"baseColor\": \"neutral\",\n    \"cssVariables\": true\n  },\n  \"iconLibrary\": \"lucide\",\n  \"aliases\": {\n    \"components\": \"@/components\",\n    \"utils\": \"@/lib/utils\",\n    \"ui\": \"@/components/ui\"\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "\"style\": \"radix-nova\"",
      "nota": "El estilo visual (nova) y la librería headless sobre la que se construye (radix). Hay otras bases, que verás en un momento."
    },
    {
      "fragmento": "\"cssVariables\": true",
      "nota": "Los colores salen de variables CSS (--primary, --background...) que se definen en src/index.css. Cambiar el tema de la web es cambiar esas variables, como en la lección 79."
    },
    {
      "fragmento": "\"ui\": \"@/components/ui\"",
      "nota": "Dónde escribe la CLI los componentes. @ es un alias de src, el que se configura en Vite y en tsconfig (lección 2)."
    },
    {
      "fragmento": "\"utils\": \"@/lib/utils\"",
      "nota": "Dónde está la función cn, que une clases (clsx) y resuelve choques de Tailwind (tailwind-merge). La viste en la lección 79."
    }
  ]
}
```

### El código que se copia

El botón de esta web, `src/components/ui/button.tsx`, es un archivo de unas sesenta líneas. Lo esencial, recortado (las clases ocupan la mayor parte):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { cva, type VariantProps } from \"class-variance-authority\"\nimport { Slot } from \"radix-ui\"\n\nimport { cn } from \"@/lib/utils\"\n\nconst buttonVariants = cva(\n  \"inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium /* … */\",\n  {\n    variants: {\n      variant: {\n        default: \"bg-primary text-primary-foreground hover:bg-primary/80\",\n        outline: \"border-border bg-background hover:bg-muted /* … */\",\n        destructive: \"bg-destructive/10 text-destructive /* … */\",\n        // …\n      },\n      size: { default: \"h-8 gap-1.5 px-2.5\", sm: \"h-7 gap-1 px-2.5\", icon: \"size-8\" /* … */ },\n    },\n    defaultVariants: { variant: \"default\", size: \"default\" },\n  }\n)\n\nfunction Button({ className, variant = \"default\", size = \"default\", asChild = false, ...props }) {\n  const Comp = asChild ? Slot.Root : \"button\"\n\n  return (\n    <Comp\n      data-slot=\"button\"\n      className={cn(buttonVariants({ variant, size, className }))}\n      {...props}\n    />\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { cva, type VariantProps } from \"class-variance-authority\"",
      "nota": "cva (class-variance-authority) es una librería pequeña que convierte «variante y tamaño» en una cadena de clases. Es el único truco de estilo; todo lo demás es Tailwind."
    },
    {
      "fragmento": "import { Slot } from \"radix-ui\"",
      "nota": "Slot es la pieza de Radix que hay debajo de asChild. El botón no necesita nada más de Radix: un botón nativo ya es accesible."
    },
    {
      "fragmento": "default: \"bg-primary text-primary-foreground hover:bg-primary/80\",",
      "nota": "bg-primary y text-primary-foreground son colores del tema, no de Tailwind: salen de las variables CSS de src/index.css. Un cambio de tema los cambia en todos los botones a la vez."
    },
    {
      "fragmento": "const Comp = asChild ? Slot.Root : \"button\"",
      "nota": "Con asChild, el botón se convierte en lo que le pases (un enlace del router, por ejemplo) y conserva sus clases. Sin él, es un button. Es la misma idea de composición que viste con Popover.Trigger."
    },
    {
      "fragmento": "className={cn(buttonVariants({ variant, size, className }))}",
      "nota": "Las clases de la variante y las que pasa quien lo usa se unen con cn, y las últimas ganan los choques. Por eso <Button className=\"w-full\"> funciona sin pelear con las clases internas."
    }
  ]
}
```

Aquí está la clave: **este archivo es de la web, no de una librería**. Está en el repositorio, se versiona con git y se edita como cualquiera. Y no todo lo que hay en `src/components/ui/` usa Radix: la tarjeta, `card.tsx`, es una función de cuatro líneas que devuelve un `div` con unas clases de Tailwind, y la etiqueta, `label.tsx`, un `label` nativo con una clase. No hay comportamiento que importar. Solo el botón (con `Slot`) y el selector de iconos y la barra de navegación (con `Popover`, que importan `radix-ui` directamente) tocan Radix en esta web.

### La CLI, de verdad

Se montó un proyecto de Vite con Tailwind en una carpeta de pruebas y se ejecutó la CLI (`shadcn` 4.22.1, publicada el 18 de octubre de 2026):

```text
$ npx shadcn@latest init -t vite -b radix -p nova -y --no-monorepo
✔ Preflight checks.
✔ Verifying framework. Found Vite.
✔ Validating Tailwind CSS. Found v4.
✔ Validating import alias.
✔ Writing components.json.
✔ Checking registry.
✔ Installing dependencies.
✔ Created 2 files:
  - src/components/ui/button.tsx
  - src/lib/utils.ts
✔ Updating src/index.css
Project initialization completed.
You may now add components.

$ npx shadcn@latest add tabs popover -y
✔ Checking registry.
✔ Created 2 files:
  - src/components/ui/tabs.tsx
  - src/components/ui/popover.tsx
```

La inicialización escribió `components.json` (con el mismo `"style": "radix-nova"` que esta web), instaló las dependencias de las que dependen los componentes (`radix-ui`, `class-variance-authority`, `lucide-react`, `tw-animate-css` y otras), escribió el botón y una función de ayuda, y añadió las variables de tema a `src/index.css`. Añadir `tabs` y `popover` **no instaló nada nuevo** (`radix-ui` ya estaba): solo creó los dos archivos. Estas son las partes de las pestañas que ahora tienes en tu proyecto, recortadas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import * as React from \"react\"\nimport { cn } from \"cn\"\nimport { Tabs as TabsPrimitive } from \"radix-ui\"\n\nfunction Tabs({\n  className,\n  orientation = \"horizontal\",\n  ...props\n}: React.ComponentProps<typeof TabsPrimitive.Root>) {\n  return (\n    <TabsPrimitive.Root\n      data-slot=\"tabs\"\n      data-orientation={orientation}\n      className={cn(\"group/tabs flex gap-2 data-horizontal:flex-col\", className)}\n      {...props}\n    />\n  )\n}\n\nfunction TabsContent({\n  className,\n  ...props\n}: React.ComponentProps<typeof TabsPrimitive.Content>) {\n  return (\n    <TabsPrimitive.Content\n      data-slot=\"tabs-content\"\n      className={cn(\"flex-1 text-sm outline-none\", className)}\n      {...props}\n    />\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { cn } from \"cn\"",
      "nota": "Esta CLI (4.22.1) ya no escribe la función cn con clsx y tailwind-merge, como en esta web, sino que la importa del paquete cn, también de shadcn: la misma idea en una sola dependencia. Dos generaciones de la CLI, dos archivos distintos, y ambos funcionan."
    },
    {
      "fragmento": "import { Tabs as TabsPrimitive } from \"radix-ui\"",
      "nota": "La pieza headless de debajo. El nombre TabsPrimitive es la convención: la primitiva de Radix, aparte del componente de tu proyecto que se llama igual."
    },
    {
      "fragmento": "React.ComponentProps<typeof TabsPrimitive.Root>",
      "nota": "Es TypeScript (módulo 10): las props de tu Tabs son las de la parte de Radix. Por eso aceptan defaultValue, onValueChange y demás sin repetirlas."
    },
    {
      "fragmento": "data-slot=\"tabs\"",
      "nota": "Un atributo que marca qué parte es cada elemento. Sirve para apuntarlo desde CSS o desde otro componente (group-data-... en Tailwind), sin depender de nombres de clase."
    },
    {
      "fragmento": "{...props}",
      "nota": "Todo lo que no maneja el componente pasa a la primitiva: value, onValueChange, aria-label... Es una envoltura fina, y por eso se puede leer y modificar entera."
    }
  ]
}
```

Y la prueba de que la envoltura no rompe nada: se montó este `Tabs` de shadcn y se midió con el teclado como los demás:

```text
Tab: foco «Niveles», seleccionada «Niveles»
ArrowRight: foco «Horarios», seleccionada «Horarios», panel: Martes y jueves.
clases del tab: relative inline-flex h-[calc(100%-1px)] flex-1 items-center …
data-slot del tab: tabs-trigger
```

El `Tabs` que copió la CLI se comporta igual que Radix a secas. Lo que añade son las clases de Tailwind (la cadena que empieza por `relative inline-flex`) y el atributo `data-slot`.

### Tres bases para el mismo componente

Que el comportamiento viene de «alguna librería headless» y no de shadcn/ui se ve en una opción de la CLI: `--base` (o `-b`) con `radix`, `base` o `aria`. Se ejecutó `init` con cada una en una copia del mismo proyecto:

- `-b radix` escribió `"style": "radix-nova"` y `import { Slot } from "radix-ui"`.
- `-b aria` escribió `"style": "aria-nova"` y `Button` con `import { Button as ButtonPrimitive, Link as LinkPrimitive } from "react-aria-components"`. Con `add tabs`, el `Tabs` de ese proyecto importa `TabList`, `TabPanel`, `Tab` y `Tabs` de `react-aria-components`. Se montó y se midió: Tab, flecha derecha, mismo resultado.
- `-b base` escribió `"style": "base-nova"` y un `Button` con `import { Button as ButtonPrimitive } from "@base-ui/react/button"`. Base UI es una tercera librería headless, que esta lección no cubre.

Un componente `<Tabs>` con los mismos estilos, tres motores distintos debajo. Tu proyecto decide cuál.

### Si ya tienes el archivo: la CLI no te lo pisa

Como el archivo es tuyo, lo editas. Y si más tarde quieres la versión nueva de la CLI, no se pierde nada sin preguntar. Se añadió un comentario al final del botón y se volvió a ejecutar `add`:

```text
$ npx shadcn@latest add button
The file button.tsx already exists. Would you like to overwrite? (y/N)

$ npx shadcn@latest add button --diff
├ src/components/ui/button.tsx (overwrite)
│ --- a/src/components/ui/button.tsx
│ +++ b/src/components/ui/button.tsx
│ @@ -64,4 +64,3 @@
│  export { Button, buttonVariants }
│ -// mi cambio
```

Por defecto no sobrescribe (`y/N`), y con `--diff` enseña qué cambiaría antes de hacerlo. Un componente de shadcn/ui se actualiza como actualizas código: mirando la diferencia y decidiendo.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un botón, un enlace, un campo, una casilla",
      "texto": "HTML nativo con tus clases. Una librería no te da nada: ya son accesibles."
    },
    {
      "titulo": "Pestañas, menús, diálogos, tooltips, selectores",
      "texto": "Una librería headless. Lo que habrías escrito a mano tiene foco, teclado y roles que se olvidan fácilmente."
    },
    {
      "titulo": "Un sistema de componentes propio con Tailwind",
      "texto": "shadcn/ui: empiezas con componentes ya estilados que son tuyos desde el primer minuto. Es lo habitual en los proyectos nuevos con Vite y Tailwind, como esta web."
    },
    {
      "titulo": "Fechas, tablas, comboboxes o internacionalización",
      "texto": "React Aria (o los componentes de shadcn/ui basados en ella, que usan sus calendarios): trae lo que Radix no incluye."
    },
    {
      "titulo": "Una aplicación con aspecto de otra marca",
      "texto": "Una librería con aspecto propio (Material UI, Ant Design) si quieres el diseño que traen y no vas a pelearte con él. No es el camino de esta lección."
    }
  ]
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con una librería headless, mi interfaz ya es accesible",
      "realidad": "Te da el comportamiento y los atributos, no los contenidos. Los nombres accesibles, las etiquetas, el contraste de color y el orden de lectura siguen siendo tuyos. Radix lo dice en su guía de accesibilidad: en último término, te toca a ti poner las etiquetas."
    },
    {
      "mito": "shadcn/ui es una librería de npm como Material UI",
      "realidad": "No hay un paquete de componentes. La CLI escribe los archivos en tu proyecto y, desde ese momento, son tuyos: los versiona tu git y los cambias sin pedir permiso. Sí instala las dependencias que usan (radix-ui, class-variance-authority...)."
    },
    {
      "mito": "shadcn/ui es lo mismo que Radix",
      "realidad": "Radix es la librería headless; shadcn/ui son componentes con estilos de Tailwind construidos encima de una (por defecto Radix, pero también React Aria o Base UI). En esta web, archivos de ui como Card o Label no importan ninguna."
    },
    {
      "mito": "Headless es lo mismo que sin estilos y sin trabajo",
      "realidad": "Hay que dar estilo a todo: cada parte, cada estado (activo, enfocado, desactivado), cada transición. Por eso existe shadcn/ui: alguien ya lo hizo, y se lo quedas."
    }
  ]
}
```

## Errores típicos

**1. Pasar a `asChild` un componente que no reenvía sus props.** Con `asChild`, Radix clona a tu hijo y le entrega los atributos y los manejadores, pero eso solo funciona si tu componente **los pone en el elemento del DOM**. Este botón de un sistema de diseño no lo hace:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Un botón de nuestro sistema de diseño que NO reenvía las props\nfunction BotonTaller({ children }) {\n  return <button type=\"button\">{children}</button>\n}\n\n// <Popover.Trigger asChild>\n//   <BotonTaller>Abrir menú</BotonTaller>\n// </Popover.Trigger>\n\n// Pulsas «Abrir menú».\n// ¿Qué ocurre?",
  "opciones": [
    "Se abre el popover: Radix le añade el onClick al hijo",
    "No se abre, y tampoco aparece ningún error",
    "React lanza un error porque BotonTaller no acepta props",
    "Se abre solo si el botón es un button nativo"
  ],
  "correcta": 1,
  "explicacion": "Radix clona BotonTaller y le pasa onClick, aria-expanded y demás como props, pero BotonTaller las ignora: nunca llegan al button. Comprobado: el botón sale sin aria-expanded ni data-state, y al pulsarlo no aparece ningún dialog. La solución: function BotonTaller(props) con un button que haga {...props}. En React 19, la ref también llega como prop (lección 34)."
}
```

Se comprobó en el botón de verdad:

```text
Disparador: <button type="button"> Abrir menú
Tras pulsarlo, dialog en pantalla: false
```

La documentación de Radix lo dice así: «tu componente debe reenviar las props». Los componentes de shadcn/ui ya lo hacen (`{...props}` al final, como viste en `Button`), por eso `asChild` con ellos funciona.

**2. Un `div` como disparador.** La misma documentación avisa de que, si cambias el elemento, **la accesibilidad pasa a ser cosa tuya**. Con un `div` dentro de `Popover.Trigger asChild`, el popover funciona con el ratón, pero:

```text
Elemento: <div aria-expanded="false" aria-haspopup="dialog" data-state="closed" type="button"> Abrir menú
Tab: el foco queda en <body>. Forzar focus(): queda en <body>. Enter abre el menú: false. Se encuentra por rol «button»: false
```

El `div` no se alcanza con el tabulador, no se activa con Enter y un lector de pantalla no lo anuncia como botón (no tiene `role="button"`; el `type="button"` que ves en el resumen es un atributo que no significa nada en un `div`). Aquí la regla de siempre: si pesa lo mismo y se puede usar un `button`, usa el `button`.

**3. Un diálogo sin nombre.** Radix pinta el diálogo y le pone `role="dialog"`, pero el nombre accesible, lo que un lector de pantalla leerá al abrirlo, sale de un `Dialog.Title` que tú escribes. Sin él:

```text
mensajes en consola: 0
<div role="dialog" tabindex="-1" id="radix-_r_6_" data-state="open">
  <p> ¿Reservar el torno el jueves a las 18:00?
  <button type="button"> Cerrar
nombre accesible: «» aria-labelledby: null
```

Radix no avisó por la consola en esta ejecución y no inventó ninguno: el diálogo se abre sin nombre. Su documentación describe `Dialog.Title` como el título accesible que se anuncia al abrir el diálogo; si no quieres que se vea, existe `VisuallyHidden`. Una librería headless no sabe qué dice tu interfaz.

**4. Importar de dos fuentes.** Radix se puede instalar como `radix-ui` o por paquetes sueltos (`@radix-ui/react-tabs`). Su documentación recomienda `radix-ui` para evitar conflictos y duplicados de versión; si lees código antiguo con paquetes sueltos, es lo mismo, con otro `import`. Esta web usa `radix-ui`.

**5. Editar un componente de shadcn/ui y olvidar que lo hiciste.** Es tu código, pero no tiene el cartel de «modificado». Al repetir `add` sobre un archivo existente, la CLI pregunta antes de pisarlo (lo viste arriba), y con `--diff` enseña la diferencia. Cuando cambies un componente a fondo, deja un comentario con el porqué.

## Ejercicios

Los dos se hacen a mano, con HTML accesible y sin librerías. Las comprobaciones buscan por **rol y nombre accesible**, como haría un lector de pantalla: un `div` con un `onClick` no las supera.

**1. Un desplegable de verdad.** Las preguntas frecuentes del taller usan un `div` que solo responde al ratón. Conviértelo en un `button` con `aria-expanded` y `aria-controls`, y haz que el texto de la respuesta sea una región (`role="region"`) con el nombre de su pregunta (`aria-labelledby`). Después prueba el teclado: con el `button` correcto, Enter y espacio funcionan sin escribir nada más.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un desplegable de verdad",
  "consigna": "Convierte el título de cada pregunta en un button con aria-expanded, aria-controls y un id propio de useId, y la respuesta en una región con aria-labelledby. Pulsa con el ratón y después con el teclado.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useId, useState } from 'react'\nimport './estilos.css'\n\nfunction Pregunta({ titulo, children }) {\n  const [abierta, setAbierta] = useState(false)\n\n  // TODO: ahora es un div que solo responde al ratón. Conviértelo en algo que\n  // un lector de pantalla y el teclado entiendan como un botón desplegable.\n  return (\n    <div className=\"pregunta\">\n      <div className=\"pregunta-titulo\" onClick={() => setAbierta(!abierta)}>\n        {titulo}\n      </div>\n      {abierta && <div className=\"pregunta-texto\">{children}</div>}\n    </div>\n  )\n}\n\nexport default function Preguntas() {\n  return (\n    <main>\n      <h1>Preguntas frecuentes de Barro y Fuego</h1>\n      <Pregunta titulo=\"¿Se presta el torno?\">\n        Solo a socios con el nivel intermedio, por una tarde y con reserva.\n      </Pregunta>\n      <Pregunta titulo=\"¿Cuánto tarda una pieza en cocerse?\">\n        Una cocción de bizcocho dura unas doce horas y se enfría un día entero.\n      </Pregunta>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.25rem;\n}\n\n[role='tablist'] {\n  display: flex;\n  gap: 0.25rem;\n  border-bottom: 2px solid #d6d3d1;\n}\n\n[role='tab'] {\n  padding: 0.4rem 0.8rem;\n  border: none;\n  border-bottom: 3px solid transparent;\n  background: none;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='tab'][aria-selected='true'] {\n  border-bottom-color: #c2410c;\n  font-weight: 600;\n}\n\n[role='tab']:focus-visible,\n[role='tabpanel']:focus-visible,\nbutton:focus-visible {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 2px;\n}\n\n[role='tabpanel'] {\n  padding: 0.8rem 0.2rem;\n}\n\n.pregunta {\n  border-bottom: 1px solid #d6d3d1;\n}\n\n.pregunta-titulo {\n  display: flex;\n  width: 100%;\n  padding: 0.6rem 0.2rem;\n  border: none;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.pregunta-texto {\n  margin: 0;\n  padding: 0 0.2rem 0.8rem;\n  color: #44403c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Cada pregunta es un botón con su texto como nombre",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "¿Se presta el torno?"
      }
    },
    {
      "descripcion": "Al pulsar la primera, aparece su respuesta como una región con el nombre de la pregunta",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Se presta el torno?"
          }
        }
      ],
      "espera": {
        "rol": "region",
        "nombre": "¿Se presta el torno?"
      }
    },
    {
      "descripcion": "La segunda pregunta se abre por separado",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Cuánto tarda una pieza en cocerse?"
          }
        }
      ],
      "espera": {
        "rol": "region",
        "nombre": "¿Cuánto tarda una pieza en cocerse?"
      }
    },
    {
      "descripcion": "Con el teclado, Enter cierra la respuesta que acabas de abrir",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Se presta el torno?"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "¿Se presta el torno?"
        }
      }
    }
  ]
}
```

**2. El teclado de las pestañas.** Estas pestañas tienen los roles, el estado y el foco itinerante, pero **no reaccionan a las flechas**. Escribe el manejador de teclado de la lista (flechas con vuelta, Inicio y Fin) y pásale el foco a la pestaña nueva. Lo tienes en el bloque anotado de arriba, pero intenta escribirlo antes de mirarlo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El teclado de las pestañas",
  "consigna": "Añade a la lista de pestañas un onKeyDown: flecha derecha e izquierda con vuelta al principio o al final, Inicio y Fin. Cambia la pestaña activa y mueve el foco a ella con la ref que ya tienes.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useId, useRef, useState } from 'react'\nimport './estilos.css'\n\nconst PESTANAS = [\n  { id: 'niveles', titulo: 'Niveles', texto: 'Iniciación, intermedio y torno avanzado.' },\n  { id: 'horarios', titulo: 'Horarios', texto: 'Martes y jueves de 18:00 a 20:30.' },\n  { id: 'precios', titulo: 'Precios', texto: 'Cuota mensual: 65 €, con material incluido.' },\n]\n\nexport default function Taller() {\n  const base = useId()\n  const [activa, setActiva] = useState('niveles')\n  const botones = useRef({})\n\n  // TODO: las flechas, Inicio y Fin no hacen nada. Añade el manejador de\n  // teclado de la lista de pestañas (patrón «Tabs» de WAI-ARIA APG).\n\n  return (\n    <main>\n      <h1>Taller de cerámica Barro y Fuego</h1>\n      <div role=\"tablist\" aria-label=\"Información del taller\">\n        {PESTANAS.map((p) => (\n          <button\n            key={p.id}\n            ref={(el) => {\n              botones.current[p.id] = el\n            }}\n            id={`${base}-pestana-${p.id}`}\n            role=\"tab\"\n            type=\"button\"\n            aria-selected={p.id === activa}\n            aria-controls={`${base}-panel-${p.id}`}\n            tabIndex={p.id === activa ? 0 : -1}\n            onClick={() => setActiva(p.id)}\n          >\n            {p.titulo}\n          </button>\n        ))}\n      </div>\n      {PESTANAS.map((p) => (\n        <div\n          key={p.id}\n          id={`${base}-panel-${p.id}`}\n          role=\"tabpanel\"\n          aria-labelledby={`${base}-pestana-${p.id}`}\n          tabIndex={0}\n          hidden={p.id !== activa}\n        >\n          {p.texto}\n        </div>\n      ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.25rem;\n}\n\n[role='tablist'] {\n  display: flex;\n  gap: 0.25rem;\n  border-bottom: 2px solid #d6d3d1;\n}\n\n[role='tab'] {\n  padding: 0.4rem 0.8rem;\n  border: none;\n  border-bottom: 3px solid transparent;\n  background: none;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='tab'][aria-selected='true'] {\n  border-bottom-color: #c2410c;\n  font-weight: 600;\n}\n\n[role='tab']:focus-visible,\n[role='tabpanel']:focus-visible,\nbutton:focus-visible {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 2px;\n}\n\n[role='tabpanel'] {\n  padding: 0.8rem 0.2rem;\n}\n\n.pregunta {\n  border-bottom: 1px solid #d6d3d1;\n}\n\n.pregunta-titulo {\n  display: flex;\n  width: 100%;\n  padding: 0.6rem 0.2rem;\n  border: none;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.pregunta-texto {\n  margin: 0;\n  padding: 0 0.2rem 0.8rem;\n  color: #44403c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, el panel visible es el de «Niveles»",
      "pasos": [],
      "espera": {
        "rol": "tabpanel",
        "texto": "Iniciación, intermedio y torno avanzado."
      }
    },
    {
      "descripcion": "Al pulsar la pestaña «Precios», aparece su panel",
      "pasos": [
        {
          "pulsar": {
            "rol": "tab",
            "nombre": "Precios"
          }
        }
      ],
      "espera": {
        "rol": "tabpanel",
        "texto": "Cuota mensual"
      }
    },
    {
      "descripcion": "La flecha derecha pasa de «Niveles» a «Horarios»",
      "pasos": [
        {
          "pulsar": {
            "rol": "tab",
            "nombre": "Niveles"
          }
        },
        {
          "teclear": "{ArrowRight}"
        }
      ],
      "espera": {
        "rol": "tabpanel",
        "texto": "Martes y jueves"
      }
    },
    {
      "descripcion": "La flecha izquierda desde «Niveles» da la vuelta hasta «Precios»",
      "pasos": [
        {
          "pulsar": {
            "rol": "tab",
            "nombre": "Niveles"
          }
        },
        {
          "teclear": "{ArrowLeft}"
        }
      ],
      "espera": {
        "rol": "tabpanel",
        "texto": "Cuota mensual"
      }
    },
    {
      "descripcion": "Fin va a la última pestaña y Inicio vuelve a la primera",
      "pasos": [
        {
          "pulsar": {
            "rol": "tab",
            "nombre": "Horarios"
          }
        },
        {
          "teclear": "{End}"
        },
        {
          "teclear": "{Home}"
        }
      ],
      "espera": {
        "rol": "tabpanel",
        "texto": "Iniciación"
      }
    },
    {
      "descripcion": "Dos flechas seguidas funcionan: el foco se movió a la pestaña nueva",
      "pasos": [
        {
          "pulsar": {
            "rol": "tab",
            "nombre": "Niveles"
          }
        },
        {
          "teclear": "{ArrowRight}"
        },
        {
          "teclear": "{ArrowRight}"
        }
      ],
      "espera": {
        "rol": "tabpanel",
        "texto": "Cuota mensual"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade al ejercicio 2 las pestañas **desactivadas**: una pestaña con `disabled` se salta con las flechas. ¿Qué hay que cambiar en el cálculo del índice siguiente?
2. En un proyecto de Vite, instala `radix-ui` y reescribe las pestañas con `Tabs.Root`, `Tabs.List`, `Tabs.Trigger` y `Tabs.Content`. Estila la pestaña activa con `[data-state='active']` y comprueba el teclado: debe comportarse igual que tu versión a mano.
3. Haz lo mismo con `react-aria-components` y estila la activa con `data-selected`. Compara con el DOM de tu navegador (herramientas de desarrollo): ¿en cuál son `button` y en cuál `div`?
4. Si tienes un proyecto con Vite y Tailwind, ejecuta `npx shadcn@latest init` y después `npx shadcn@latest add tabs`. Abre `src/components/ui/tabs.tsx`: ¿qué reconoces de este bloque? Cambia una clase de la pestaña activa y mira el resultado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Radix Primitives: Introduction",
      "descripcion": "Qué son las primitivas de Radix, sus principios (accesibles, sin estilos, no controladas por defecto) y cómo se instalan.",
      "url": "https://www.radix-ui.com/primitives/docs/overview/introduction",
      "etiqueta": "Radix"
    },
    {
      "titulo": "Radix Primitives: Composition (asChild)",
      "descripcion": "Cómo funciona asChild, cuándo cambiar el elemento y por qué tu componente tiene que reenviar sus props.",
      "url": "https://www.radix-ui.com/primitives/docs/guides/composition",
      "etiqueta": "Radix"
    },
    {
      "titulo": "Radix Primitives: Accessibility",
      "descripcion": "Qué hace Radix por ti (roles, foco, teclado) y qué sigue siendo cosa tuya, como las etiquetas.",
      "url": "https://www.radix-ui.com/primitives/docs/overview/accessibility",
      "etiqueta": "Radix"
    },
    {
      "titulo": "React Aria: Styling",
      "descripcion": "Clases por defecto, estados como atributos data-*, render props y animaciones, para estilar sus componentes con cualquier herramienta.",
      "url": "https://react-aria.adobe.com/styling",
      "etiqueta": "React Aria"
    },
    {
      "titulo": "shadcn/ui: Introducción",
      "descripcion": "Open Code: por qué copia el código en tu proyecto en vez de ser una dependencia.",
      "url": "https://ui.shadcn.com/docs",
      "etiqueta": "shadcn/ui"
    },
    {
      "titulo": "WAI-ARIA APG: patrón Tabs",
      "descripcion": "El patrón oficial de pestañas del que salen los roles y el teclado que has visto en las tres versiones.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
      "etiqueta": "W3C"
    }
  ]
}
```
