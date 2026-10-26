# ¿Qué problema resuelve React? De pintar el DOM a mano a describir la interfaz

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `que-problema-resuelve-react-de-pintar-el-dom-a-mano-a-describir-la-interfaz` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [Quick Start](https://react.dev/learn) + [Describing the UI](https://react.dev/learn/describing-the-ui) — ver `contenido/react/TEMARIO.md` #1

---

## Qué es y para qué sirve

React es una biblioteca de JavaScript para construir interfaces a partir de **componentes**: piezas que juntan el marcado, los estilos y la lógica de una parte de la pantalla. Su idea central cabe en una frase:

> **Describes cómo debe verse la interfaz para cada estado de tus datos, y React se encarga de cambiar la página para que coincida.**

Tú no buscas elementos con `querySelector` ni cambias `textContent`: cambias datos. React vuelve a calcular qué debería verse y toca en el DOM solo lo que ha cambiado. Este temario usa **React 19.3**, la versión actual, que desde 2026 mantiene la React Foundation, dentro de la Linux Foundation.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Este temario da por aprendido JavaScript",
  "contenido": "Funciones flecha, desestructuración, map y filter, módulos con import y export, closures y promesas aparecen en cada componente sin volver a explicarse. Si alguno te suena a nuevo, repásalo en el temario de JavaScript antes de seguir."
}
```

## El problema: mantener la página sincronizada a mano

En el proyecto avanzado del gestor de tareas de JavaScript ya hiciste esto a mano: cada vez que cambiaba un dato, había que **encontrar cada sitio de la página que lo mostraba y actualizarlo**. Con tres sitios es manejable. Con treinta, alguno se olvida.

Este contador muestra el mismo dato en tres lugares: el título, el botón y un aviso que aparece a partir de 5. Pulsa el botón varias veces y fíjate en el título.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un contador hecho a mano, con un fallo escondido",
  "consigna": "Pulsa «Has pulsado 0 veces» unas cuantas veces. ¿Qué parte de la página no se entera del cambio? Intenta arreglarlo en la pestaña JavaScript.",
  "html": "<h1 id=\"titulo\">Total: 0</h1>\n<button id=\"sumar\">Has pulsado 0 veces</button>\n<p id=\"aviso\" hidden>¡Ya van más de 5!</p>",
  "css": "body { font-family: system-ui, sans-serif; }\nbutton { font: inherit; padding: 0.5rem 0.75rem; }",
  "js": "let pulsaciones = 0;\n\ndocument.querySelector('#sumar').addEventListener('click', () => {\n  pulsaciones = pulsaciones + 1;\n\n  // 1. Actualizar el texto del botón\n  document.querySelector('#sumar').textContent = `Has pulsado ${pulsaciones} veces`;\n\n  // 2. Mostrar el aviso a partir de 5\n  document.querySelector('#aviso').hidden = pulsaciones <= 5;\n\n  // 3. ...¿y el título? Se nos ha olvidado actualizarlo.\n});",
  "pestañaInicial": "js"
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<h1 id=\"titulo\">Total: 0</h1>\n<button id=\"sumar\">Has pulsado 0 veces</button>\n\n<script>\n  let pulsaciones = 0;\n  document.querySelector('#sumar').addEventListener('click', () => {\n    pulsaciones = pulsaciones + 1;\n    document.querySelector('#sumar').textContent = `Has pulsado ${pulsaciones} veces`;\n  });\n</script>",
  "opciones": [
    "Total: 3",
    "Total: 0",
    "El título desaparece"
  ],
  "correcta": 1,
  "explicacion": "La variable pulsaciones vale 3, pero el DOM no sabe nada de ella: el título solo cambia si alguien escribe en #titulo, y nadie lo hace. En JavaScript a mano, cada sitio que muestra un dato es tu responsabilidad."
}
```

Este es el fallo que React elimina: **el dato y lo que se ve en pantalla pueden desincronizarse**, porque son dos cosas separadas que tú tienes que mantener de acuerdo.

## La misma interfaz, descrita con React

Aquí está el mismo contador escrito con React. Fíjate en lo que falta: no hay `querySelector`, ni `textContent`, ni `hidden = …`. Solo se describe qué debe verse según el valor de `pulsaciones`. Debajo está funcionando de verdad, con React 19.3.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El mismo contador: describir en vez de actualizar",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [pulsaciones, setPulsaciones] = useState(0)\n\n  return (\n    <main>\n      <h1>Total: {pulsaciones}</h1>\n      <button onClick={() => setPulsaciones(pulsaciones + 1)}>\n        Has pulsado {pulsaciones} veces\n      </button>\n      {pulsaciones > 5 && <p>¡Ya van más de 5!</p>}\n    </main>\n  )\n}",
  "css": "main { font-family: system-ui, sans-serif; }\nbutton { font: inherit; padding: 0.5rem 0.75rem; }",
  "anotaciones": [
    {
      "fragmento": "useState(0)",
      "nota": "El dato vive en el estado del componente. Cuando cambia, React vuelve a ejecutar la función App para saber cómo debe verse ahora la interfaz."
    },
    {
      "fragmento": "<h1>Total: {pulsaciones}</h1>",
      "nota": "Nada de buscar el elemento y cambiarle el texto: describes que el título muestra pulsaciones. Si pulsaciones vale 3, dice 3. No hay forma de olvidarse de actualizarlo."
    },
    {
      "fragmento": "setPulsaciones(pulsaciones + 1)",
      "nota": "No tocas la página: pides un cambio de estado. React compara lo que había con lo nuevo y cambia en el DOM solo lo necesario."
    },
    {
      "fragmento": "{pulsaciones > 5 && <p>¡Ya van más de 5!</p>}",
      "nota": "Mostrar u ocultar también es una descripción: la condición se vuelve a evaluar en cada render. No hay un hidden que mantener."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Pulsa el botón de la vista previa: el título, el botón y el aviso cambian a la vez, siempre de acuerdo. No porque el código sea más cuidadoso, sino porque **solo hay un sitio donde vive el dato** y todo lo demás se deriva de él.

## Imperativo frente a declarativo

La documentación de React lo explica con un taxi. Darle al conductor cada giro («a la derecha, ahora recto dos calles, ahora a la izquierda») es **imperativo**: si te equivocas en un giro, acabas en otro sitio. Darle la dirección de destino es **declarativo**: el conductor sabe llegar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de cambiar la pantalla",
  "roles": [
    {
      "etiqueta": "Imperativo",
      "rol": "JavaScript a mano",
      "descripcion": "Le dices al navegador CÓMO cambiar la página, paso a paso: busca este elemento, cambia su texto, quita esta clase. Cada cambio es un paso que puedes olvidar."
    },
    {
      "etiqueta": "Declarativo",
      "rol": "React",
      "descripcion": "Le dices QUÉ debe verse para cada estado de los datos. React calcula los pasos para llegar ahí y los aplica él."
    }
  ]
}
```

Declarativo no significa mágico: por debajo React hace exactamente los mismos cambios en el DOM que harías tú. La diferencia es **quién decide qué cambiar**. Con React, tú decides cómo se ve; React decide qué tocar.

## Componentes: la interfaz por piezas

Una interfaz de React es un árbol de **componentes**: funciones de JavaScript que devuelven marcado. Un componente se puede usar tantas veces como quieras, y **cada copia tiene su propio estado**. En el bloque siguiente, `Contador` está en su propio archivo y `App` lo usa dos veces. Pulsa cada uno por separado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos copias del mismo componente, cada una con su estado",
  "consigna": "Pulsa cada contador y comprueba que llevan la cuenta por separado. Después, en App.jsx, añade un tercer <Contador />.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Contador from './Contador'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Contadores que van por libre</h1>\n      <Contador />\n      <Contador />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Contador.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Contador() {\n  const [pulsaciones, setPulsaciones] = useState(0)\n\n  return (\n    <button onClick={() => setPulsaciones(pulsaciones + 1)}>\n      Has pulsado {pulsaciones} veces\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  display: block;\n  margin-bottom: 0.5rem;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Cada `<Contador />` es una llamada independiente a la misma función, y React guarda el estado de cada una por separado. Esa es la base de todo lo demás: **construyes piezas pequeñas que se encargan de sí mismas y las combinas**.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Interfaces con mucho estado que cambia",
      "texto": "Paneles de control, editores, carritos, formularios largos, aplicaciones como un cliente de correo o una herramienta de diseño: muchos datos que se muestran en muchos sitios y cambian constantemente."
    },
    {
      "titulo": "Equipos y proyectos que crecen",
      "texto": "Los componentes se pueden diseñar, probar y reutilizar por separado. Cada persona puede trabajar en una pieza sin romper las demás."
    },
    {
      "titulo": "Un ecosistema enorme",
      "texto": "Frameworks como Next.js o React Router, librerías de componentes, herramientas de pruebas... y React Native, que usa los mismos componentes para apps de iOS y Android."
    },
    {
      "titulo": "Cuándo no hace falta",
      "texto": "Una página informativa o un blog sin apenas interactividad se resuelven mejor con HTML y CSS. Un detalle interactivo pequeño, con unas líneas de JavaScript. React compensa cuando el estado empieza a complicarse."
    }
  ]
}
```

## Un poco de historia

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "De herramienta interna de Facebook a fundación propia",
  "items": [
    {
      "fecha": "2013",
      "titulo": "Facebook publica React",
      "texto": "Se presenta como código abierto en la JSConf de Estados Unidos. La idea de mezclar marcado y lógica en componentes al principio escandalizó a mucha gente."
    },
    {
      "fecha": "2015",
      "titulo": "React Native",
      "texto": "Los mismos componentes y el mismo modelo, pero para crear apps nativas de iOS y Android."
    },
    {
      "fecha": "2019",
      "titulo": "Hooks (React 16.8)",
      "texto": "useState y compañía: el estado y los efectos pasan a escribirse en funciones normales, sin clases. Es la forma de escribir React que verás en este temario."
    },
    {
      "fecha": "2022",
      "titulo": "React 18",
      "texto": "Renderizado concurrente y transiciones: React puede preparar una actualización sin bloquear la pantalla."
    },
    {
      "fecha": "2024",
      "titulo": "React 19",
      "texto": "Acciones para formularios, use para leer promesas y ref como una prop normal, entre otras novedades."
    },
    {
      "fecha": "2025",
      "titulo": "React Compiler 1.0",
      "texto": "Un compilador que optimiza los componentes automáticamente, y el anuncio de la React Foundation."
    },
    {
      "fecha": "2026",
      "titulo": "React Foundation y React 19.3",
      "texto": "React pasa a la Linux Foundation en febrero. En septiembre sale React 19.3, con ViewTransition y refs en Fragment: la versión de este temario."
    }
  ]
}
```

## Lo que React NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "React es un framework completo",
      "realidad": "Es una biblioteca de interfaces. Rutas, carga de datos o renderizado en servidor los ponen frameworks como Next.js o React Router, o librerías aparte. Por eso hay un módulo entero dedicado a eso."
    },
    {
      "mito": "Para usar React hace falta JSX",
      "realidad": "JSX es una forma cómoda de escribir llamadas a funciones de React. Se puede usar React sin él. Lo verás en la lección 7, al mirar qué hay debajo de JSX."
    },
    {
      "mito": "React es más rápido que el JavaScript escrito a mano",
      "realidad": "Un JavaScript a mano bien hecho puede ser igual de rápido. La ventaja de React es que es mucho más difícil equivocarse al mantener la página al día, no la velocidad bruta. También se puede hacer lento: hay un módulo para eso."
    },
    {
      "mito": "Con React ya no necesito saber JavaScript",
      "realidad": "Un componente es una función de JavaScript. map, filter, la desestructuración, los módulos y los closures aparecen en cada ejemplo de este temario."
    }
  ]
}
```

## Errores típicos

**Guardar el dato en una variable normal en vez de en el estado.** Es el error más común al empezar: la variable cambia, pero la pantalla no.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  let pulsaciones = 0\n\n  return (\n    <button onClick={() => { pulsaciones = pulsaciones + 1 }}>\n      Has pulsado {pulsaciones} veces\n    </button>\n  )\n}",
  "opciones": [
    "Has pulsado 3 veces",
    "Has pulsado 0 veces",
    "Un error en la consola"
  ],
  "correcta": 1,
  "explicacion": "La variable sí cambia, pero React no sabe que tiene que volver a pintar: solo un cambio de estado (setPulsaciones) provoca un nuevo render. Y aunque lo hiciera, en cada render la función empieza de cero y pulsaciones vuelve a valer 0. Lo verás a fondo en la lección 16."
}
```

**Cambiar a mano lo que pinta React.** Si haces `document.querySelector('h1').textContent = 'Hola'` sobre algo que muestra React, tu cambio se pierde en cuanto React vuelve a pintar ese componente. Para los pocos casos en que de verdad hay que tocar el DOM (enfocar un campo, medir un elemento) existen las refs, en el módulo 5.

**Pensar que React repinta toda la página.** React vuelve a ejecutar tus componentes, sí, pero en el DOM solo cambia lo que es distinto. Que un componente se ejecute de nuevo es barato; lo caro sería reconstruir la página entera, y React no lo hace.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Añade un botón para reiniciar",
  "consigna": "Añade un botón «Reiniciar» que vuelva el contador a 0. No busques el párrafo con querySelector: cambia el estado. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [pulsaciones, setPulsaciones] = useState(0)\n\n  return (\n    <main>\n      <p>Pulsaciones: {pulsaciones}</p>\n      <button onClick={() => setPulsaciones(pulsaciones + 1)}>Sumar</button>\n      {/* Añade aquí un botón «Reiniciar» */}\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "«Sumar» cuenta las pulsaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar"
          }
        }
      ],
      "espera": {
        "texto": "Pulsaciones: 2"
      }
    },
    {
      "descripcion": "«Reiniciar» vuelve el contador a 0",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reiniciar"
          }
        }
      ],
      "espera": {
        "texto": "Pulsaciones: 0"
      }
    },
    {
      "descripcion": "Después de reiniciar se puede seguir contando",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reiniciar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar"
          }
        }
      ],
      "espera": {
        "texto": "Pulsaciones: 1"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el contador hecho a mano del principio, arregla el título. Después añade un cuarto sitio que muestre el dato y cuenta cuántas líneas has tenido que tocar.
2. En el ejercicio, haz que el párrafo diga «Aún no has pulsado» cuando el contador está a 0. Pista: es una condición dentro del JSX, como el aviso de «más de 5».
3. Añade un botón «Restar» que nunca deje el contador por debajo de 0.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Quick Start",
      "descripcion": "La introducción oficial: el 80 % de los conceptos de React que usarás a diario, en una sola página.",
      "url": "https://react.dev/learn",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Describing the UI",
      "descripcion": "El capítulo de react.dev que sigue el siguiente módulo de este temario: componentes, JSX, props, listas y árboles.",
      "url": "https://react.dev/learn/describing-the-ui",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Reacting to Input with State",
      "descripcion": "De donde sale la comparación entre imperativo y declarativo, con el ejemplo del taxi.",
      "url": "https://react.dev/learn/reacting-to-input-with-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "The React Foundation",
      "descripcion": "El anuncio de la nueva casa de React dentro de la Linux Foundation.",
      "url": "https://react.dev/blog/2026/02/24/the-react-foundation",
      "etiqueta": "react.dev"
    }
  ]
}
```
