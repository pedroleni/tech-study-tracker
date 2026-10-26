# Renderizado condicional

- **Módulo:** Describir la interfaz
- **Slug:** `renderizado-condicional` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Conditional Rendering](https://react.dev/learn/conditional-rendering) — ver `contenido/react/TEMARIO.md` #10

---

## Qué es y para qué sirve

Una interfaz casi nunca es igual para todos los datos. En una red de estaciones meteorológicas, una estación sin conexión no puede enseñar su temperatura, el aviso por nieve solo aparece si lo hay, y no es lo mismo «12 l/m²» que «Sin lluvia».

Con JavaScript a mano harías `hidden = true`, cambiarías clases con `classList.toggle` o crearías y quitarías nodos. En React no hay atributos ni etiquetas especiales para mostrar u ocultar:

> **En React, las condiciones son JavaScript normal: `if`, `? :` y `&&` deciden qué JSX devuelve el componente, y React deja la página de acuerdo con ese JSX.**

Este componente usa las tres herramientas principales a la vez. Es el mapa de la lección: cada una tiene su sección más abajo.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Tres estaciones, un solo componente",
  "codigo": "function Estacion({ nombre, activa, temperatura, lluvia, aviso }) {\n  if (!activa) {\n    return <li className=\"estacion apagada\">{nombre}: sin conexión</li>\n  }\n\n  return (\n    <li className=\"estacion\">\n      <h2>{nombre}</h2>\n      <p>{temperatura} °C</p>\n      <p>{lluvia > 0 ? `Lluvia: ${lluvia} l/m²` : 'Sin lluvia'}</p>\n      {aviso && <p className=\"aviso\">Aviso {aviso}</p>}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Estaciones del Pirineo</h1>\n      <ul className=\"estaciones\">\n        <Estacion nombre=\"Jaca\" activa={true} temperatura={4} lluvia={12} aviso=\"amarillo\" />\n        <Estacion nombre=\"Benasque\" activa={true} temperatura={-3} lluvia={0} aviso={null} />\n        <Estacion nombre=\"Canfranc\" activa={false} />\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estacion {\n  padding: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.estacion h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.estacion p {\n  margin: 0.15rem 0;\n}\n\n.apagada {\n  color: #64748b;\n  background: #f1f5f9;\n  font-style: italic;\n}\n\n.aviso {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  background: #fde68a;\n  font-weight: 600;\n}",
  "anotaciones": [
    {
      "fragmento": "if (!activa) {",
      "nota": "Si la estación no está activa, el componente devuelve otra cosa y termina ahí: el resto de la función ni se ejecuta. Es un return temprano."
    },
    {
      "fragmento": "{lluvia > 0 ? `Lluvia: ${lluvia} l/m²` : 'Sin lluvia'}",
      "nota": "El ternario elige entre dos cosas: si ha llovido, la cantidad; si no, «Sin lluvia». Siempre se pinta una de las dos."
    },
    {
      "fragmento": "{aviso && <p className=\"aviso\">Aviso {aviso}</p>}",
      "nota": "Con && se pinta el aviso o nada. Si aviso es null, la expresión entera vale null y React no pinta nada en su lugar."
    },
    {
      "fragmento": "<Estacion nombre=\"Canfranc\" activa={false} />",
      "nota": "El mismo componente con otros datos toma otro camino. Las condiciones se vuelven a evaluar en cada render, con los datos de ese momento."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## `if` y un `return` temprano

Cuando un caso cambia el componente **entero**, lo más claro es tratarlo al principio y salir. Es un *return temprano* (en inglés, *early return* o *guard clause*): el caso especial queda arriba, en dos líneas, y el JSX principal se queda para el caso normal, sin condiciones mezcladas.

Recuerda que un componente es una función de JavaScript: **puedes usar `if` antes del `return`**, pero no dentro de las llaves del JSX, porque ahí solo caben expresiones (lo viste en la lección 6).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un return temprano para cada caso especial",
  "consigna": "Panticosa está en mantenimiento, pero se ve como una estación normal. Añade en Estacion.jsx un segundo return temprano para que muestre «Panticosa: en mantenimiento». Después piensa: si una estación estuviera a la vez sin conexión y en mantenimiento, ¿qué mensaje saldría? Depende del orden de los if.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Estacion from './Estacion'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Estaciones del Pirineo</h1>\n      <ul className=\"estaciones\">\n        <Estacion nombre=\"Jaca\" activa={true} temperatura={4} />\n        <Estacion nombre=\"Canfranc\" activa={false} temperatura={7} />\n        <Estacion nombre=\"Panticosa\" activa={true} mantenimiento={true} temperatura={2} />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Estacion.jsx",
      "codigo": "export default function Estacion({ nombre, activa, mantenimiento, temperatura }) {\n  if (!activa) {\n    return <li className=\"estacion apagada\">{nombre}: sin conexión</li>\n  }\n\n  return (\n    <li className=\"estacion\">\n      <h2>{nombre}</h2>\n      <p>{temperatura} °C</p>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estacion {\n  padding: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.estacion h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.estacion p {\n  margin: 0.15rem 0;\n}\n\n.apagada {\n  color: #64748b;\n  background: #f1f5f9;\n  font-style: italic;\n}\n\n.aviso {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  background: #fde68a;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "Estacion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

## Devolver `null`: no pintar nada

A veces un componente decide que no tiene nada que enseñar. Para eso devuelve **`null`**: React ejecuta el componente, pero no deja ni un nodo en el DOM.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un aviso que a veces no existe",
  "codigo": "function AvisoMeteorologico({ nivel }) {\n  if (!nivel) {\n    return null\n  }\n  return <p className=\"aviso\">Aviso {nivel} por nevadas</p>\n}\n\nconst avisoFormigal = 'amarillo'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Avisos de hoy</h1>\n      <h2>Jaca</h2>\n      <AvisoMeteorologico nivel=\"naranja\" />\n      <h2>Benasque</h2>\n      <AvisoMeteorologico nivel={null} />\n      <h2>Formigal</h2>\n      {avisoFormigal && <AvisoMeteorologico nivel={avisoFormigal} />}\n    </main>\n  )\n}",
  "css": "main { font-family: system-ui, sans-serif; }\nh1 { margin: 0 0 0.5rem; font-size: 1.4rem; }\nh2 { margin: 0.75rem 0 0.25rem; font-size: 1.05rem; }\n.aviso { display: inline-block; margin: 0; padding: 0.15rem 0.4rem; border-radius: 4px; background: #fde68a; font-weight: 600; }",
  "anotaciones": [
    {
      "fragmento": "return null",
      "nota": "null significa «no pintes nada». Bajo el título de Benasque no aparece ningún elemento: ni un párrafo vacío ni un hueco."
    },
    {
      "fragmento": "<AvisoMeteorologico nivel={null} />",
      "nota": "Leyendo App parece que aquí siempre hay un aviso; hay que abrir el componente para descubrir que a veces no pinta nada. Por eso react.dev recomienda no abusar de este patrón."
    },
    {
      "fragmento": "{avisoFormigal && <AvisoMeteorologico nivel={avisoFormigal} />}",
      "nota": "La alternativa habitual: el padre decide si el componente aparece. Leyendo App ya sabes que el aviso es opcional."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Las dos formas funcionan. **Devolver `null` desde dentro** encaja cuando la decisión es asunto del propio componente; **decidir en el padre** deja más claro, desde fuera, que esa pieza es opcional.

Si se te olvida el `return`, o devuelves `undefined`, React tampoco protesta: desde React 18, un componente puede devolver `undefined`. Pero eso suele pasar sin querer, así que escribe `null` a propósito y deja claro que «nada» es lo que quieres.

## Una cosa u otra: el ternario

El operador ternario, `condición ? siEsVerdad : siEsFalso`, es una expresión, así que cabe dentro de las llaves del JSX. **Siempre pinta una de las dos ramas.** Cuando las ramas son de varias líneas, se escriben entre paréntesis para que se lean bien:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Siempre una de las dos ramas",
  "consigna": "Cambia los litros de cada estación y mira qué rama se pinta. Después intenta añadir un tercer caso: «Lluvia intensa» si pasan de 40. Tendrás que meter un ternario dentro de otro, y verás lo rápido que se complica: al final de la lección hay una salida mejor.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Lluvia({ nombre, litros }) {\n  return (\n    <li className=\"estacion\">\n      <h2>{nombre}</h2>\n      {litros > 0 ? (\n        <p>\n          <strong>{litros} l/m²</strong> en las últimas 24 horas\n        </p>\n      ) : (\n        <p>Sin lluvia en las últimas 24 horas</p>\n      )}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Lluvia en las estaciones</h1>\n      <ul className=\"estaciones\">\n        <Lluvia nombre=\"Jaca\" litros={12} />\n        <Lluvia nombre=\"Benasque\" litros={0} />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estacion {\n  padding: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.estacion h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.estacion p {\n  margin: 0.15rem 0;\n}\n\n.apagada {\n  color: #64748b;\n  background: #f1f5f9;\n  font-style: italic;\n}\n\n.aviso {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  background: #fde68a;\n  font-weight: 600;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

## Esto o nada: `&&`

Cuando la alternativa es «no pintar nada», el ternario te obliga a escribir una rama vacía (`cond ? <p>…</p> : null`). Para eso está **`&&`**: `{cond && <p>…</p>}` se lee «si se cumple `cond`, pinta el párrafo».

Funciona porque `&&` devuelve el lado izquierdo cuando se evalúa como falso, y React no pinta `false`. Pero «falso» en JavaScript no es solo `false`, y aquí empieza la trampa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const avisos = []\n\nexport default function App() {\n  return (\n    <section>\n      <h2>Avisos activos</h2>\n      {avisos.length && <p>Hay {avisos.length} avisos activos.</p>}\n    </section>\n  )\n}",
  "opciones": [
    "Solo el título",
    "El título y un 0 suelto",
    "El título y «Hay 0 avisos activos.»",
    "Un error en la consola"
  ],
  "correcta": 1,
  "explicacion": "avisos.length vale 0, que es falsy, así que && devuelve ese 0 y no llega a mirar el párrafo. La expresión entera vale 0, no false. Y a diferencia de false, null o undefined, React sí pinta los números: debajo del título aparece un 0. La solución es que el lado izquierdo sea un booleano: avisos.length > 0 && ..."
}
```

Es la regla que viste en la lección 6, en el bloque «Qué pinta React con cada valor»: **`false`, `true`, `null` y `undefined` no se pintan; los números sí, incluidos `0` y `NaN`.** Una cadena vacía tampoco deja nada visible. Así que, con `&&`, **el lado izquierdo tiene que ser un booleano de verdad**: una comparación (`lluvia > 0`, `avisos.length > 0`) y no un número a secas.

## Guardar JSX en una variable

Cuando la lógica no cabe cómoda en una expresión (varias condiciones, prioridades, cálculos previos), sácala del JSX. **Un elemento de JSX es un valor más: se puede guardar en una variable** y colocar después con llaves.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El consejo del día, decidido antes del return",
  "codigo": "function Recomendacion({ temperatura, lluvia, viento }) {\n  let consejo = <p>Buen día para salir al monte.</p>\n\n  if (viento > 70) {\n    consejo = <p>Rachas muy fuertes: <strong>mejor quédate en el valle</strong>.</p>\n  } else if (lluvia > 0) {\n    consejo = <p>Lleva chubasquero: han caído {lluvia} l/m².</p>\n  } else if (temperatura <= 0) {\n    consejo = <p>Cuidado con el hielo en las sendas.</p>\n  }\n\n  return (\n    <aside className=\"recomendacion\">\n      <strong>Consejo del día</strong>\n      {consejo}\n    </aside>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>¿Salimos al monte?</h1>\n      <Recomendacion temperatura={12} lluvia={0} viento={20} />\n      <Recomendacion temperatura={6} lluvia={8} viento={30} />\n      <Recomendacion temperatura={-2} lluvia={0} viento={85} />\n    </main>\n  )\n}",
  "css": "main { display: grid; gap: 0.5rem; max-width: 30rem; font-family: system-ui, sans-serif; }\nh1 { margin: 0; font-size: 1.4rem; }\n.recomendacion { padding: 0.5rem 0.75rem; border-left: 4px solid #0369a1; border-radius: 6px; background: #f0f9ff; }\n.recomendacion p { margin: 0.25rem 0 0; }",
  "anotaciones": [
    {
      "fragmento": "let consejo = <p>Buen día para salir al monte.</p>",
      "nota": "Empiezas por el caso por defecto. Como un elemento de JSX es un valor, se guarda en una variable igual que un número o un texto."
    },
    {
      "fragmento": "if (viento > 70) {",
      "nota": "Con if y else if encadenas tantas condiciones como haga falta, y el orden marca la prioridad: con rachas fuertes da igual que llueva o que hiele."
    },
    {
      "fragmento": "{consejo}",
      "nota": "El JSX final queda limpio: un hueco con el resultado. Es la forma más larga de escribirlo, pero también la más flexible."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Condiciones en atributos y clases

Las condiciones no solo deciden qué elementos aparecen: también qué **atributos** llevan. Y aquí `&&` vuelve a dar problemas, porque un atributo que recibe `false` no se comporta igual que uno que recibe `undefined`. Abre la consola de este ejemplo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una clase condicional que hace protestar a React",
  "consigna": "React avisa en la consola porque className recibe false en las estaciones sin rachas. Cámbialo por un ternario que devuelva undefined cuando no toca, y el aviso desaparece. Fíjate también en el botón de Canfranc: disabled sí acepta true y false sin quejarse.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Estacion({ nombre, activa, viento }) {\n  return (\n    <li className={viento > 60 && 'rachas'}>\n      <h2>{nombre}</h2>\n      <p>Viento: {viento} km/h</p>\n      <button disabled={!activa}>Ver la cámara en directo</button>\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Viento en las estaciones</h1>\n      <ul className=\"estaciones\">\n        <Estacion nombre=\"Astún\" activa={true} viento={85} />\n        <Estacion nombre=\"Benasque\" activa={true} viento={20} />\n        <Estacion nombre=\"Canfranc\" activa={false} viento={15} />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  gap: 0.5rem;\n  max-width: 24rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estaciones li {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n}\n\n.estaciones h2 {\n  margin: 0;\n  font-size: 1.05rem;\n}\n\n.estaciones p {\n  margin: 0.25rem 0;\n}\n\n.rachas {\n  border-color: #b91c1c;\n  background: #fef2f2;\n}\n\nbutton {\n  font: inherit;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El aviso de React 19.3.1 es largo, pero trae la solución dentro:

```text
Received `false` for a non-boolean attribute `className`.

If you want to write it to the DOM, pass a string instead: className="false" or className={value.toString()}.

If you used to conditionally omit it with className={condition && value}, pass className={condition ? value : undefined} instead.
```

Las reglas de los atributos, comprobadas con React 19.3.1:

- **Atributos booleanos** (`disabled`, `hidden`, `required`...): `true` lo pone y `false` lo quita. Aquí `disabled={!activa}` es perfecto.
- **El resto de atributos** (`className`, `title`, `href`...): `undefined` y `null` lo quitan sin más. `false` también lo quita, pero con el aviso de arriba. Para omitir un atributo, un ternario que devuelva `undefined`.
- **Los `aria-*`** convierten el booleano en texto: `aria-pressed={false}` acaba en el HTML como `aria-pressed="false"`, que es justo lo que esos atributos esperan.

Para las clases con varias condiciones hay dos formas habituales. Con una plantilla de texto, cuidado con el espacio que sobra: `` className={`estacion ${aviso ? 'con-aviso' : ''}`} `` deja `class="estacion "` cuando no hay aviso, que es inofensivo. Con un array, las clases falsas se descartan antes de unirlas:

```jsx
const clases = ['estacion', viento > 60 && 'rachas', !activa && 'apagada']
  .filter(Boolean)
  .join(' ')

return <li className={clases}>…</li>
```

## Varias ramas: un objeto o una función

Con dos casos, un ternario. Con tres o más, los ternarios anidados se vuelven ilegibles enseguida. Hay dos salidas limpias:

- **Un objeto de correspondencias**, cuando cada valor concreto lleva a un resultado concreto (nivel de aviso → texto y clase). Añadir un caso es añadir una línea.
- **Una función auxiliar con `if` y `return`**, cuando hay rangos o reglas (temperatura → «Helada», «Frío»...). Un `switch` también vale.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Niveles de aviso y rangos de temperatura, sin ternarios anidados",
  "consigna": "Añade un nivel de aviso «verde» sin tocar Estacion: basta con una línea en AVISOS. Después cambia los límites de describirTemperatura. Las dos piezas se leen de arriba abajo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nconst AVISOS = {\n  amarillo: { texto: 'Aviso amarillo: precaución', clase: 'aviso-amarillo' },\n  naranja: { texto: 'Aviso naranja: riesgo importante', clase: 'aviso-naranja' },\n  rojo: { texto: 'Aviso rojo: riesgo extremo', clase: 'aviso-rojo' },\n}\n\nfunction describirTemperatura(grados) {\n  if (grados <= 0) return 'Helada'\n  if (grados < 10) return 'Frío'\n  if (grados < 25) return 'Templado'\n  return 'Calor'\n}\n\nfunction Estacion({ nombre, temperatura, aviso }) {\n  const datosAviso = AVISOS[aviso]\n  return (\n    <li className=\"estacion\">\n      <h2>{nombre}</h2>\n      <p>\n        {temperatura} °C · {describirTemperatura(temperatura)}\n      </p>\n      {datosAviso && <p className={'aviso ' + datosAviso.clase}>{datosAviso.texto}</p>}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Avisos y temperaturas</h1>\n      <ul className=\"estaciones\">\n        <Estacion nombre=\"Jaca\" temperatura={4} aviso=\"amarillo\" />\n        <Estacion nombre=\"Astún\" temperatura={-6} aviso=\"rojo\" />\n        <Estacion nombre=\"Barbastro\" temperatura={27} aviso={null} />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estacion {\n  padding: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.estacion h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.estacion p {\n  margin: 0.15rem 0;\n}\n\n.apagada {\n  color: #64748b;\n  background: #f1f5f9;\n  font-style: italic;\n}\n\n.aviso {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  background: #fde68a;\n  font-weight: 600;\n}\n\n.aviso-amarillo {\n  background: #fde68a;\n}\n\n.aviso-naranja {\n  background: #fdba74;\n}\n\n.aviso-rojo {\n  background: #fca5a5;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

`AVISOS[aviso]` con `aviso` a `null` da `undefined` (no existe esa clave), y `datosAviso && …` no pinta nada. Un valor que no esperabas, como `'morado'`, tampoco rompe nada: simplemente no hay aviso.

### Qué técnica elegir

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "if con return temprano",
      "texto": "Cuando un caso cambia el componente entero: sin conexión, cargando, error. Lo tratas arriba y el JSX principal se queda para el caso normal."
    },
    {
      "titulo": "return null",
      "texto": "Cuando el componente decide que no tiene nada que pintar. Con moderación: muchas veces queda más claro que decida el padre."
    },
    {
      "titulo": "Ternario ? :",
      "texto": "Para elegir entre dos cosas dentro del JSX. Siempre se pinta una de las dos."
    },
    {
      "titulo": "&&",
      "texto": "Para pintar algo o nada. El lado izquierdo tiene que ser un booleano de verdad, nunca un número a secas."
    },
    {
      "titulo": "Una variable y varios if",
      "texto": "Cuando la lógica no cabe en una expresión: varias condiciones, prioridades o cálculos previos."
    },
    {
      "titulo": "Un objeto o una función auxiliar",
      "texto": "Con tres o más ramas: un objeto para valores concretos, una función para rangos o reglas."
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
      "mito": "Quitar algo con una condición es lo mismo que esconderlo con CSS",
      "realidad": "Con una condición el elemento no existe: se crea al aparecer y se destruye al desaparecer, y si tenía estado, lo pierde (lo verás en la lección 26). Con el atributo hidden o con display: none sigue en el DOM, solo que no se ve."
    },
    {
      "mito": "Si no pinto el botón «Borrar», nadie puede borrar",
      "realidad": "Esconder un botón es una decisión de interfaz, no de seguridad. Cualquiera puede hablar con tu servidor sin pasar por él: los permisos se comprueban en el servidor, y la interfaz solo evita confusiones."
    },
    {
      "mito": "El ternario es más rápido que el if",
      "realidad": "React recibe el mismo JSX en los dos casos. Elige el que se lea mejor en cada sitio."
    },
    {
      "mito": "Un componente siempre tiene que pintar algo",
      "realidad": "Puede devolver null y no deja nada en el DOM. El resto de la página sigue funcionando con normalidad."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "roles",
  "titulo": "Condiciones que verás en cualquier aplicación",
  "roles": [
    {
      "etiqueta": "Estados de la pantalla",
      "rol": "Cargando, error, vacío, con datos",
      "descripcion": "Cada estado es una rama, casi siempre con un return temprano. La lección 23 te enseña a enumerarlos todos antes de escribir código."
    },
    {
      "etiqueta": "Según quién mira",
      "rol": "Sesión iniciada o no, permisos",
      "descripcion": "El «Hola, Ana» de la cabecera, el botón «Editar» para quien puede editar, el menú de administración."
    },
    {
      "etiqueta": "Validación",
      "rol": "Errores de formulario",
      "descripcion": "Un mensaje junto al campo solo cuando el valor no es válido. Llegará en el módulo 8."
    },
    {
      "etiqueta": "Distintivos",
      "rol": "Etiquetas que dependen de un dato",
      "descripcion": "«Nuevo», «Oferta», «Sin conexión»: pequeños elementos que aparecen o cambian de color según un valor."
    }
  ]
}
```

## Errores típicos

**El 0 que se cuela con `&&`.** Ya lo has predicho con la lista de avisos; aquí está en una ficha real. React 19.3.1 pinta ese 0 como un nodo de texto más: el HTML de la ficha de Benasque queda `<li class="estacion"><h2>Benasque</h2><p>-3 °C</p>0</li>`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un 0 debajo de la temperatura",
  "consigna": "En Benasque no ha llovido y aparece un 0 debajo de la temperatura. Arréglalo de dos formas: primero con lluvia > 0 &&, y después con un ternario que devuelva null cuando no ha llovido.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Estacion({ nombre, temperatura, lluvia }) {\n  return (\n    <li className=\"estacion\">\n      <h2>{nombre}</h2>\n      <p>{temperatura} °C</p>\n      {lluvia && <p>Lluvia: {lluvia} l/m²</p>}\n    </li>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Estaciones del Pirineo</h1>\n      <ul className=\"estaciones\">\n        <Estacion nombre=\"Jaca\" temperatura={4} lluvia={12} />\n        <Estacion nombre=\"Benasque\" temperatura={-3} lluvia={0} />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estacion {\n  padding: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.estacion h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.estacion p {\n  margin: 0.15rem 0;\n}\n\n.apagada {\n  color: #64748b;\n  background: #f1f5f9;\n  font-style: italic;\n}\n\n.aviso {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  background: #fde68a;\n  font-weight: 600;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Con `NaN` pasa lo mismo (aparece el texto «NaN»), y con un texto vacío no se ve nada. Cualquiera de estas formas lo evita: `lluvia > 0 && …`, `Boolean(lluvia) && …`, `!!lluvia && …` o `lluvia ? … : null`. La primera es la que mejor dice lo que quieres.

**Tratar el 0 como «no hay dato».** Es el primo hermano del anterior, y en meteorología es especialmente traicionero:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Temperatura({ grados }) {\n  return <p>{grados ? `${grados} °C` : 'Sin datos'}</p>\n}\n\nexport default function App() {\n  return <Temperatura grados={0} />\n}",
  "opciones": [
    "0 °C",
    "Sin datos",
    "0",
    "Nada"
  ],
  "correcta": 1,
  "explicacion": "0 es falsy, así que el ternario toma la rama de «Sin datos»: una lectura real de cero grados desaparece. Cuando 0 es un valor válido, pregunta por lo que de verdad significa «no hay dato» en tus datos, por ejemplo grados === null."
}
```

**Ternarios anidados ilegibles.** Un ternario dentro de otro funciona, pero hay que leerlo tres veces. Pruébalo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Viento({ kmh, rachas }) {\n  return (\n    <p>\n      {kmh > 70 ? 'Temporal' : kmh > 40 ? rachas ? 'Viento fuerte con rachas' : 'Viento fuerte' : kmh > 10 ? 'Brisa' : 'Calma'}\n    </p>\n  )\n}\n\nexport default function App() {\n  return <Viento kmh={45} rachas={false} />\n}",
  "opciones": [
    "Temporal",
    "Viento fuerte con rachas",
    "Viento fuerte",
    "Brisa"
  ],
  "correcta": 2,
  "explicacion": "45 no pasa de 70 pero sí de 40, y dentro de esa rama rachas es false: queda «Viento fuerte». Si te ha costado emparejar los ? con sus :, ese es justo el problema. Cada caso nuevo añade otro nivel, y basta un paréntesis mal puesto para que la rama elegida sea otra."
}
```

La misma lógica en una función auxiliar se lee de arriba abajo, y añadir un caso es añadir una línea:

```jsx
function describirViento(kmh, rachas) {
  if (kmh > 70) return 'Temporal'
  if (kmh > 40) return rachas ? 'Viento fuerte con rachas' : 'Viento fuerte'
  if (kmh > 10) return 'Brisa'
  return 'Calma'
}

// En el JSX: <p>{describirViento(kmh, rachas)}</p>
```

**`&&` en un atributo.** `className={rachas && 'rachas'}` funciona a medias: cuando la condición es falsa, el atributo recibe `false` y React avisa en la consola. Usa `className={rachas ? 'rachas' : undefined}`.

**Un `if` dentro de las llaves.** `{if (activa) { … }}` no es JSX válido: entre llaves solo caben expresiones, y `if` es una sentencia. La vista previa se para con «Unexpected token». Usa un ternario o `&&`, o saca el `if` antes del `return`.

**Olvidar el `return` dentro del `if`.** `if (!activa) { <li>…: sin conexión</li> }` crea el elemento y lo tira: la función sigue y pinta la ficha normal. No hay error ni aviso, así que solo lo notas al ver que la estación apagada sale como si nada.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las fichas de la red de estaciones",
  "consigna": "Haz que la ficha de cada estación enseñe solo lo que tiene sentido. Sigue los tres pasos del comentario de Estacion.jsx: Canfranc está sin conexión, en Benasque no ha llovido y solo Jaca tiene aviso. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Estacion from './Estacion'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Estaciones del Pirineo</h1>\n      <ul className=\"estaciones\">\n        <Estacion nombre=\"Jaca\" activa={true} temperatura={4} lluvia={12} aviso=\"naranja\" />\n        <Estacion nombre=\"Benasque\" activa={true} temperatura={-3} lluvia={0} aviso={null} />\n        <Estacion nombre=\"Canfranc\" activa={false} temperatura={7} lluvia={2} aviso={null} />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Estacion.jsx",
      "codigo": "export default function Estacion({ nombre, activa, temperatura, lluvia, aviso }) {\n  // 1. Si la estación no está activa, muestra solo «{nombre}: sin conexión».\n  // 2. La lluvia: solo si ha llovido (más de 0 l/m²), y sin que se cuele un 0.\n  // 3. El aviso: solo si la estación tiene uno.\n  return (\n    <li className=\"estacion\">\n      <h2>{nombre}</h2>\n      <p>{temperatura} °C</p>\n      <p>Lluvia: {lluvia} l/m²</p>\n      <p className=\"aviso\">Aviso {aviso}</p>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.estaciones {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.75rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.estacion {\n  padding: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.estacion h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.estacion p {\n  margin: 0.15rem 0;\n}\n\n.apagada {\n  color: #64748b;\n  background: #f1f5f9;\n  font-style: italic;\n}\n\n.aviso {\n  padding: 0.15rem 0.4rem;\n  border-radius: 4px;\n  background: #fde68a;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "Estacion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Canfranc, sin conexión, muestra «Canfranc: sin conexión»",
      "pasos": [],
      "espera": {
        "texto": "Canfranc: sin conexión"
      }
    },
    {
      "descripcion": "De una estación sin conexión no se muestra la temperatura",
      "pasos": [],
      "espera": {
        "ausente": {
          "texto": "7 °C"
        }
      }
    },
    {
      "descripcion": "Donde ha llovido aparece «Lluvia: 12 l/m²»",
      "pasos": [],
      "espera": {
        "texto": "Lluvia: 12 l/m²"
      }
    },
    {
      "descripcion": "Donde no ha llovido no sale nada de lluvia, ni siquiera un 0 suelto",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "0"
        }
      }
    },
    {
      "descripcion": "Las estaciones sin aviso no muestran ningún aviso",
      "pasos": [],
      "espera": {
        "ausente": {
          "texto": "Aviso"
        }
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Sustituye el aviso por un objeto de correspondencias con un color por nivel (`amarillo`, `naranja`, `rojo`), como en la sección de varias ramas.
2. Añade debajo de la temperatura una etiqueta «Helada» cuando sea de 0 °C o menos. Comprueba que una estación a 0 °C sigue mostrando «0 °C».
3. En vez del return temprano, marca la estación sin conexión con una clase `apagada` y el botón «Ver la cámara en directo» desactivado. ¿Qué versión se lee mejor?
4. Escribe la descripción del viento con un ternario anidado de cuatro niveles y luego reescríbela con una función auxiliar. Cuenta cuántas veces tienes que releer cada versión para estar seguro de que es correcta.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Conditional Rendering",
      "descripcion": "La página de react.dev: if, null, el ternario, && y las variables, con la advertencia sobre los números a la izquierda de &&.",
      "url": "https://react.dev/learn/conditional-rendering",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Operador AND lógico (&&)",
      "descripcion": "Cómo decide && qué lado devuelve: la razón exacta por la que un 0 a la izquierda acaba en pantalla.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Logical_AND",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Operador condicional (ternario)",
      "descripcion": "La sintaxis del ternario y cómo se encadenan varios, para que reconozcas el patrón aunque prefieras no usarlo.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Conditional_operator",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Falsy",
      "descripcion": "La lista de valores que JavaScript trata como falsos: false, 0, NaN, la cadena vacía, null y undefined, entre otros.",
      "url": "https://developer.mozilla.org/en-US/docs/Glossary/Falsy",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Reacting to Input with State",
      "descripcion": "Adelanto de la lección 23: pensar la interfaz como una lista de estados posibles, cada uno con su rama.",
      "url": "https://react.dev/learn/reacting-to-input-with-state",
      "etiqueta": "react.dev"
    }
  ]
}
```
