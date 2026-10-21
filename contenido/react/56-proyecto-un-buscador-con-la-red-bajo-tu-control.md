# Proyecto: un buscador con la red bajo tu control

- **Módulo:** Asincronía y concurrencia
- **Slug:** `proyecto-un-buscador-con-la-red-bajo-tu-control` (autogenerado del título)
- **Orden:** 560
- **Fuentes:** [useDeferredValue](https://react.dev/reference/react/useDeferredValue) + [use](https://react.dev/reference/react/use) + [`<Suspense>`](https://react.dev/reference/react/Suspense) + [You Might Not Need an Effect: Fetching data](https://react.dev/learn/you-might-not-need-an-effect#fetching-data) + [Component: error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) — ver `contenido/react/TEMARIO.md` #56
- **Requiere:** Módulos 2 a 7 completos (lecciones 8 a 55)

---

## Qué vas a construir

La Asociación de Mayores El Brasero lleva años recogiendo refranes en sus talleres de los jueves, y quiere ponerlos en su web: **«Al buen entendedor»**, un refranero con buscador. Escribes una palabra (agua, gato, mayo) y salen los refranes que la llevan, con lo que quiere decir cada uno.

Parece la pantalla más sencilla del mundo: un campo y una lista. Pero cada letra que escribes es una petición al servidor, y **las peticiones no siempre vuelven en el orden en que salieron**. Es la condición de carrera del proyecto 78 de JavaScript, la que la lección 38 te enseñó a evitar con una limpieza. Aquí vas a provocarla a propósito con el panel de red, a verla con tus ojos, a arreglarla y, después, a reconstruir el buscador con todo el módulo 7:

- **Un efecto que pide datos** (lección 38): primero el ingenuo y después con su limpieza, un `AbortController` y una respuesta que recuerda qué búsqueda la pidió.
- **`use` y una caché de promesas** (lecciones 49 y 52), para leer los resultados durante el render en vez de guardarlos en el estado.
- **`<Suspense>`** (lección 48) para la espera.
- **`useDeferredValue`** (lección 51), para que escribir no esconda la lista, avisando de que va por detrás.
- **El error boundary de la lección 53**, con su «Reintentar», para cuando el servidor falla.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cinco pasos, todos en esta página",
  "contenido": "Cada paso es un bloque React en vivo con sus archivos en pestañas, la vista previa, el panel de red debajo y el botón «Comprobar». Cada paso arranca con la solución del anterior: si te atascas, sigue en el siguiente. Las comprobaciones usan la API simulada con la latencia del bloque, pero nunca desordenan las respuestas: lo que solo se ve con «Responder desordenado» lo pruebas tú, y el texto te dice cómo."
}
```

Esta vez no hay versión para tu ordenador: el servidor es la API simulada de la vista previa, y el interruptor que desordena las respuestas solo existe aquí. En un proyecto con Vite necesitarías un servidor de verdad (o una red simulada como MSW, lección 84), y esperar a que la red te desordene las respuestas ella sola. Lo hace, pero cuando quiere.

## El refranero y su servidor

El refranero tiene 32 refranes en la colección `refranes` de la API simulada, cada uno con su texto, un tema y lo que quiere decir:

```json
{
  "id": 9,
  "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
  "tema": "tiempo",
  "significado": "El frío puede volver hasta bien entrada la primavera."
}
```

Para buscar, `GET /api/refranes?q=gato` devuelve los que llevan «gato» en cualquiera de sus tres textos. Como un buscador de verdad, no distingue mayúsculas ni tildes: con «pajaro» sale «Más vale pájaro en mano que ciento volando». Y busca también en el significado: con «año» sale «Gato escaldado del agua fría huye», porque su significado habla de un daño. Con `q` vacío, devuelve los 32.

## Las piezas

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "api.jsx",
      "rol": "Hablar con el servidor",
      "descripcion": "pedirRefranes(texto) hace el fetch y lanza si el servidor falla. En el paso 3 suma una caché de promesas, y en el 5, la forma de olvidar una."
    },
    {
      "etiqueta": "piezas.jsx",
      "rol": "Lo que se ve, ya hecho",
      "descripcion": "ListaRefranes pinta una búsqueda, o «Ningún refrán con…» si no hay ninguno. Sugerencias pinta los botones agua, gato, mayo y pan. No cambia en todo el proyecto."
    },
    {
      "etiqueta": "App.jsx",
      "rol": "El buscador",
      "descripcion": "El campo, las sugerencias y la forma de pedir los datos, que es lo que cambia de un paso a otro."
    },
    {
      "etiqueta": "Resultados.jsx y LimiteDeError.jsx",
      "rol": "Desde el paso 3",
      "descripcion": "Resultados lee la búsqueda con use. LimiteDeError es el de la lección 53, sin tocar una línea."
    }
  ]
}
```

Los botones de `Sugerencias` escriben su palabra **de un golpe**: una sola petición, en vez de una por letra como cuando tecleas. Te van a venir bien para provocar la carrera con calma.

## Paso 1: la búsqueda ingenua

Empieza por lo que escribiría casi todo el mundo: el texto del buscador en un estado, los refranes en otro y un efecto que, cada vez que cambia el texto, los pide al servidor y los guarda. Es sincronizar la lista con el servidor, el caso de libro de la lección 38. `pedirRefranes` ya hace el `fetch` y convierte la respuesta; solo te falta el efecto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 1: la búsqueda ingenua",
  "consigna": "En App.jsx, escribe un efecto que, cada vez que cambie texto, pida sus refranes con pedirRefranes(texto) (de api.jsx) y los guarde con setRefranes. Prueba a escribir en el buscador y a pulsar las sugerencias, y mira el panel de red y el registro de efectos. Cuando pase las comprobaciones, sigue leyendo: lo vas a romper.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirRefranes } from './api'\nimport { ListaRefranes, Sugerencias } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  const [texto, setTexto] = useState('agua')\n  const [refranes, setRefranes] = useState([])\n\n  // Paso 1: cada vez que cambie texto, pide sus refranes con\n  // pedirRefranes(texto) y guárdalos con setRefranes.\n\n  return (\n    <main>\n      <h1>Al buen entendedor</h1>\n      <p className=\"subtitulo\">El refranero de la Asociación de Mayores El Brasero</p>\n      <label className=\"campo\">\n        Buscar un refrán\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <Sugerencias onElegir={setTexto} />\n      <ListaRefranes refranes={refranes} texto={texto} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide al servidor los refranes que contienen un texto. Si el servidor\n// responde con un error, lanza; con { signal }, se puede cancelar.\nexport async function pedirRefranes(texto, { signal } = {}) {\n  const respuesta = await fetch('/api/refranes?q=' + encodeURIComponent(texto), { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "// Lo que se ve de una búsqueda: la lista de refranes o, si no hay ninguno,\n// un aviso que lo dice.\nexport function ListaRefranes({ refranes, texto }) {\n  if (refranes.length === 0) {\n    return <p className=\"vacio\">Ningún refrán con «{texto}».</p>\n  }\n  return (\n    <ul className=\"refranes\">\n      {refranes.map((refran) => (\n        <li key={refran.id}>\n          <p className=\"refran\">{refran.texto}</p>\n          <p className=\"significado\">{refran.significado}</p>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst SUGERENCIAS = ['agua', 'gato', 'mayo', 'pan']\n\n// Las búsquedas de ejemplo: cada botón escribe su palabra de un golpe en el\n// buscador (una sola petición, no una por letra).\nexport function Sugerencias({ onElegir }) {\n  return (\n    <p className=\"sugerencias\">\n      Prueba con:{' '}\n      {SUGERENCIAS.map((palabra) => (\n        <button key={palabra} type=\"button\" onClick={() => onElegir(palabra)}>\n          {palabra}\n        </button>\n      ))}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #fbf6ec;\n  color: #2b2118;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 34rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.9rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.subtitulo {\n  margin: 0.25rem 0 1rem;\n  color: #6b5a48;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\n.campo input {\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #b9a58c;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.sugerencias {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  color: #6b5a48;\n}\n\nbutton {\n  padding: 0.25rem 0.75rem;\n  border: 1px solid #8a6d4b;\n  border-radius: 999px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n/* Paso 4: el aviso de que la lista va por detrás */\n.estado {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  color: #8a5a1f;\n  font-style: italic;\n}\n\n.refranes {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.refranes li {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #c28f4a;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.refran {\n  margin: 0;\n  font: 600 1.05rem Georgia, 'Times New Roman', serif;\n}\n\n.significado {\n  margin: 0.25rem 0 0;\n  color: #6b5a48;\n  font-size: 0.9rem;\n}\n\n.cargando,\n.vacio {\n  color: #6b5a48;\n}\n\n/* Paso 4: la lista desfasada. El atenuado espera 0,2 s antes de empezar,\n   para no parpadear cuando la respuesta llega enseguida. */\n.desfasada {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.2s linear;\n}\n\n[role='alert'] {\n  padding: 0.75rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n}\n\n[role='alert'] p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": true,
  "api": {
    "refranes": [
      {
        "id": 1,
        "texto": "Agua que no has de beber, déjala correr.",
        "tema": "consejos",
        "significado": "Lo que no te interesa, déjalo para otros."
      },
      {
        "id": 2,
        "texto": "En abril, aguas mil.",
        "tema": "tiempo",
        "significado": "Abril suele ser un mes de muchas lluvias."
      },
      {
        "id": 3,
        "texto": "Del agua mansa líbreme Dios, que de la brava me libro yo.",
        "tema": "personas",
        "significado": "Hay que desconfiar de quien parece tranquilo."
      },
      {
        "id": 4,
        "texto": "Nunca digas «de esta agua no beberé».",
        "tema": "consejos",
        "significado": "Nadie sabe lo que hará cuando cambien las cosas."
      },
      {
        "id": 5,
        "texto": "Gato escaldado del agua fría huye.",
        "tema": "animales",
        "significado": "Quien ha sufrido un daño desconfía hasta de lo inofensivo."
      },
      {
        "id": 6,
        "texto": "De noche, todos los gatos son pardos.",
        "tema": "animales",
        "significado": "A oscuras no se notan los defectos."
      },
      {
        "id": 7,
        "texto": "Aquí hay gato encerrado.",
        "tema": "animales",
        "significado": "Algo se oculta detrás de lo que se ve."
      },
      {
        "id": 8,
        "texto": "Cuando el gato no está, los ratones bailan.",
        "tema": "animales",
        "significado": "Sin quien vigile, cada uno hace lo que quiere."
      },
      {
        "id": 9,
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
        "tema": "tiempo",
        "significado": "El frío puede volver hasta bien entrada la primavera."
      },
      {
        "id": 10,
        "texto": "Agua de mayo, pan para todo el año.",
        "tema": "tiempo",
        "significado": "La lluvia de primavera trae buenas cosechas."
      },
      {
        "id": 11,
        "texto": "Cuando marzo mayea, mayo marcea.",
        "tema": "tiempo",
        "significado": "Si marzo es templado, el mes siguiente será frío."
      },
      {
        "id": 12,
        "texto": "Al pan, pan, y al vino, vino.",
        "tema": "consejos",
        "significado": "Hay que llamar a las cosas por su nombre."
      },
      {
        "id": 13,
        "texto": "Con pan y vino se anda el camino.",
        "tema": "comida",
        "significado": "Bien alimentado, todo cuesta menos."
      },
      {
        "id": 14,
        "texto": "A falta de pan, buenas son tortas.",
        "tema": "comida",
        "significado": "Si no tienes lo mejor, confórmate con lo que hay."
      },
      {
        "id": 15,
        "texto": "Pan para hoy, hambre para mañana.",
        "tema": "comida",
        "significado": "Lo que hoy remedia algo puede salir caro después."
      },
      {
        "id": 16,
        "texto": "Perro ladrador, poco mordedor.",
        "tema": "animales",
        "significado": "Quien mucho amenaza rara vez cumple."
      },
      {
        "id": 17,
        "texto": "A otro perro con ese hueso.",
        "tema": "animales",
        "significado": "No me lo creo: cuéntaselo a otro."
      },
      {
        "id": 18,
        "texto": "Muerto el perro, se acabó la rabia.",
        "tema": "animales",
        "significado": "Quitada la causa, desaparece el problema."
      },
      {
        "id": 19,
        "texto": "Más vale pájaro en mano que ciento volando.",
        "tema": "consejos",
        "significado": "Mejor lo seguro que mucho por conseguir."
      },
      {
        "id": 20,
        "texto": "No por mucho madrugar amanece más temprano.",
        "tema": "trabajo",
        "significado": "Las cosas llevan su tiempo y no se adelantan con prisas."
      },
      {
        "id": 21,
        "texto": "A quien madruga, Dios le ayuda.",
        "tema": "trabajo",
        "significado": "El esfuerzo temprano tiene recompensa."
      },
      {
        "id": 22,
        "texto": "En casa del herrero, cuchillo de palo.",
        "tema": "trabajo",
        "significado": "Falta justo lo que más abunda en el oficio de la casa."
      },
      {
        "id": 23,
        "texto": "Ojos que no ven, corazón que no siente.",
        "tema": "personas",
        "significado": "Lo que no se sabe no hace sufrir."
      },
      {
        "id": 24,
        "texto": "Dime con quién andas y te diré quién eres.",
        "tema": "personas",
        "significado": "Las compañías dicen mucho de cada uno."
      },
      {
        "id": 25,
        "texto": "Más vale tarde que nunca.",
        "tema": "consejos",
        "significado": "Hacer algo con retraso es mejor que no hacerlo."
      },
      {
        "id": 26,
        "texto": "A caballo regalado no le mires el diente.",
        "tema": "animales",
        "significado": "Un regalo se agradece sin buscarle faltas."
      },
      {
        "id": 27,
        "texto": "Cría cuervos y te sacarán los ojos.",
        "tema": "personas",
        "significado": "Quien hace bien a un desagradecido acaba perjudicado."
      },
      {
        "id": 28,
        "texto": "Camarón que se duerme se lo lleva la corriente.",
        "tema": "trabajo",
        "significado": "El que se descuida pierde su oportunidad."
      },
      {
        "id": 29,
        "texto": "No hay mal que por bien no venga.",
        "tema": "consejos",
        "significado": "De una desgracia puede salir algo bueno."
      },
      {
        "id": 30,
        "texto": "Año de nieves, año de bienes.",
        "tema": "tiempo",
        "significado": "Un invierno con nieve anuncia buena cosecha."
      },
      {
        "id": 31,
        "texto": "Las cuentas claras y el chocolate espeso.",
        "tema": "comida",
        "significado": "En los tratos, que no quede nada sin aclarar."
      },
      {
        "id": 32,
        "texto": "Quien tiene un amigo tiene un tesoro.",
        "tema": "personas",
        "significado": "La amistad verdadera vale más que el dinero."
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparecen los refranes de «agua»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Al pulsar «gato», aparecen los refranes de gatos",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "De noche, todos los gatos son pardos."
      }
    },
    {
      "descripcion": "Al escribir «perro» en el buscador, aparecen sus refranes",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "perro"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Perro ladrador, poco mordedor."
      }
    },
    {
      "descripcion": "Una palabra que no sale en ningún refrán lo dice",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "ordenador"
          }
        }
      ],
      "espera": {
        "texto": "Ningún refrán con «ordenador»."
      }
    }
  ]
}
```

Tu efecto será más o menos este:

```jsx
useEffect(() => {
  pedirRefranes(texto).then((datos) => setRefranes(datos))
}, [texto])
```

Las comprobaciones han pasado y el buscador parece bien hecho. El registro de efectos lo confirma: «App ▶ efecto · montaje», «▶ efecto · repetido por StrictMode» y, al pulsar «gato», «▶ efecto · cambió texto: "agua" → "gato"». Sin ninguna «⟲ limpieza», porque el efecto no devuelve ninguna. Y el panel de red enseña dos peticiones completas a `?q=agua` al cargar, una por cada montaje de `StrictMode`: nada se cancela nunca.

### Rómpelo con el panel de red

En la vista previa del paso 1, con tu solución:

1. Sube la latencia a 2 s y activa «Responder desordenado».
2. Pulsa «gato» y, antes de que pase un segundo, «mayo».
3. Espera. Primero salen los refranes de mayo y, unos dos segundos después, los de gatos. El buscador dice «mayo» y la lista enseña gatos, y ahí se queda.

Ahora vacía el campo, espera a que salgan los 32 refranes y teclea «pan» deprisa. Antes de mirar, piensa qué vas a ver cuando el panel de red ya no tenga ninguna petición pendiente:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "useEffect(() => {\n  pedirRefranes(texto).then((datos) => setRefranes(datos))\n}, [texto])\n\n// «Responder desordenado» activado, el campo vacío, y tecleas «pan»\n// deprisa: salen tres peticiones, ?q=p, ?q=pa y ?q=pan.\n// Cuando han llegado todas, ¿qué refranes hay en la lista?",
  "opciones": [
    "Los 5 que llevan «pan»",
    "Los que llevan «pa»",
    "Los 26 que llevan una «p»",
    "Ninguno: el aviso de que no hay refranes con «pan»"
  ],
  "correcta": 2,
  "explicacion": "Con el interruptor activado, la API simulada responde siempre primero a la petición más reciente: llegan pan, pa y p, en ese orden. Cada respuesta hace su setRefranes y gana la última en llegar, la de «p», aunque el buscador diga «pan». El efecto no compara nada: guarda lo que llega, sea de la búsqueda que sea."
}
```

**La última respuesta en llegar gana, aunque sea de una búsqueda que ya no te interesa.** Es la condición de carrera que react.dev explica con «hello» tecleado deprisa, la misma de la lección 38 y la que en el proyecto 78 de JavaScript arreglaste a mano con un contador. En la red de verdad no hace falta ningún interruptor: el servidor tarda más en unas búsquedas que en otras, atiende varias a la vez y el móvil cambia de antena a mitad de camino. El interruptor solo la hace segura, para que la veas siempre que quieras.

Y hay otras dos mentiras en el paso 1 que no necesitan ningún desorden:

- **Al cargar**, mientras llega la primera respuesta, la página dice «Ningún refrán con «agua».». No lo sabe todavía: `refranes` empieza vacío.
- **Al pulsar «gato»**, la lista de agua se queda un rato debajo de un buscador que dice «gato», sin ninguna señal de que es vieja.

Las tres son la misma: **lo que se ve no corresponde a lo que pone el buscador**. Y una cuarta, de regalo: pulsa «Fallar la siguiente petición» y busca otra cosa. El error sale en el recuadro rojo de la vista previa, porque nadie atiende la promesa rechazada.

## Paso 2: que lo que ves sea lo que has buscado

El arreglo ya lo escribiste en la lección 38 para la ficha de una pista de esquí. Son tres piezas, y cada una tapa un agujero:

- **La limpieza cancela.** Con un `AbortController` por ejecución del efecto y su `signal` en el `fetch` (`pedirRefranes` acepta `{ signal }`), la limpieza llama a `abort()` antes de cada búsqueda nueva. La petición vieja se rechaza con un `AbortError` y su respuesta ya no puede pisar a nadie: **esto arregla la carrera**. El `AbortError` no es un fallo, es lo que has pedido: no lo enseñes como error. La bandera `ignorar` de la lección 38 vale igual.
- **La respuesta recuerda su texto.** En lugar de `refranes`, guarda `{ texto, refranes }`, o `{ texto, error }` si falla.
- **Lo que se pinta se deduce de ella.** Si `respuesta.texto` no es el texto del buscador, todavía no ha llegado la buena: «Buscando refranes…». Sin un estado `cargando` que poner a `true` en el efecto (lección 39). **Esto arregla las otras dos mentiras**: ni «Ningún refrán» antes de saberlo, ni una lista vieja bajo un buscador nuevo.

Y de paso, el error: un párrafo con `role="alert"` cuando la respuesta lo traiga.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: que lo que ves sea lo que has buscado",
  "consigna": "En App.jsx, cambia refranes por una respuesta que recuerde su texto: { texto, refranes } o { texto, error }. Si no es del texto del buscador, pinta «Buscando refranes…» en un párrafo con className=\"cargando\"; si trae un error, un párrafo con role=\"alert\". En la limpieza, cancela la petición con un AbortController (pedirRefranes acepta { signal }) y no trates como error un AbortError. Después repite la prueba del paso 1 con «Responder desordenado».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirRefranes } from './api'\nimport { ListaRefranes, Sugerencias } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  const [texto, setTexto] = useState('agua')\n  const [refranes, setRefranes] = useState([])\n\n  // Paso 2: que la respuesta recuerde de qué texto es ({ texto, refranes } o\n  // { texto, error }), que se pinte según ella y que la limpieza cancele.\n  useEffect(() => {\n    pedirRefranes(texto).then((datos) => setRefranes(datos))\n  }, [texto])\n\n  return (\n    <main>\n      <h1>Al buen entendedor</h1>\n      <p className=\"subtitulo\">El refranero de la Asociación de Mayores El Brasero</p>\n      <label className=\"campo\">\n        Buscar un refrán\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <Sugerencias onElegir={setTexto} />\n      <ListaRefranes refranes={refranes} texto={texto} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide al servidor los refranes que contienen un texto. Si el servidor\n// responde con un error, lanza; con { signal }, se puede cancelar.\nexport async function pedirRefranes(texto, { signal } = {}) {\n  const respuesta = await fetch('/api/refranes?q=' + encodeURIComponent(texto), { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "// Lo que se ve de una búsqueda: la lista de refranes o, si no hay ninguno,\n// un aviso que lo dice.\nexport function ListaRefranes({ refranes, texto }) {\n  if (refranes.length === 0) {\n    return <p className=\"vacio\">Ningún refrán con «{texto}».</p>\n  }\n  return (\n    <ul className=\"refranes\">\n      {refranes.map((refran) => (\n        <li key={refran.id}>\n          <p className=\"refran\">{refran.texto}</p>\n          <p className=\"significado\">{refran.significado}</p>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst SUGERENCIAS = ['agua', 'gato', 'mayo', 'pan']\n\n// Las búsquedas de ejemplo: cada botón escribe su palabra de un golpe en el\n// buscador (una sola petición, no una por letra).\nexport function Sugerencias({ onElegir }) {\n  return (\n    <p className=\"sugerencias\">\n      Prueba con:{' '}\n      {SUGERENCIAS.map((palabra) => (\n        <button key={palabra} type=\"button\" onClick={() => onElegir(palabra)}>\n          {palabra}\n        </button>\n      ))}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #fbf6ec;\n  color: #2b2118;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 34rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.9rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.subtitulo {\n  margin: 0.25rem 0 1rem;\n  color: #6b5a48;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\n.campo input {\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #b9a58c;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.sugerencias {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  color: #6b5a48;\n}\n\nbutton {\n  padding: 0.25rem 0.75rem;\n  border: 1px solid #8a6d4b;\n  border-radius: 999px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n/* Paso 4: el aviso de que la lista va por detrás */\n.estado {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  color: #8a5a1f;\n  font-style: italic;\n}\n\n.refranes {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.refranes li {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #c28f4a;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.refran {\n  margin: 0;\n  font: 600 1.05rem Georgia, 'Times New Roman', serif;\n}\n\n.significado {\n  margin: 0.25rem 0 0;\n  color: #6b5a48;\n  font-size: 0.9rem;\n}\n\n.cargando,\n.vacio {\n  color: #6b5a48;\n}\n\n/* Paso 4: la lista desfasada. El atenuado espera 0,2 s antes de empezar,\n   para no parpadear cuando la respuesta llega enseguida. */\n.desfasada {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.2s linear;\n}\n\n[role='alert'] {\n  padding: 0.75rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n}\n\n[role='alert'] p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": true,
  "api": {
    "refranes": [
      {
        "id": 1,
        "texto": "Agua que no has de beber, déjala correr.",
        "tema": "consejos",
        "significado": "Lo que no te interesa, déjalo para otros."
      },
      {
        "id": 2,
        "texto": "En abril, aguas mil.",
        "tema": "tiempo",
        "significado": "Abril suele ser un mes de muchas lluvias."
      },
      {
        "id": 3,
        "texto": "Del agua mansa líbreme Dios, que de la brava me libro yo.",
        "tema": "personas",
        "significado": "Hay que desconfiar de quien parece tranquilo."
      },
      {
        "id": 4,
        "texto": "Nunca digas «de esta agua no beberé».",
        "tema": "consejos",
        "significado": "Nadie sabe lo que hará cuando cambien las cosas."
      },
      {
        "id": 5,
        "texto": "Gato escaldado del agua fría huye.",
        "tema": "animales",
        "significado": "Quien ha sufrido un daño desconfía hasta de lo inofensivo."
      },
      {
        "id": 6,
        "texto": "De noche, todos los gatos son pardos.",
        "tema": "animales",
        "significado": "A oscuras no se notan los defectos."
      },
      {
        "id": 7,
        "texto": "Aquí hay gato encerrado.",
        "tema": "animales",
        "significado": "Algo se oculta detrás de lo que se ve."
      },
      {
        "id": 8,
        "texto": "Cuando el gato no está, los ratones bailan.",
        "tema": "animales",
        "significado": "Sin quien vigile, cada uno hace lo que quiere."
      },
      {
        "id": 9,
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
        "tema": "tiempo",
        "significado": "El frío puede volver hasta bien entrada la primavera."
      },
      {
        "id": 10,
        "texto": "Agua de mayo, pan para todo el año.",
        "tema": "tiempo",
        "significado": "La lluvia de primavera trae buenas cosechas."
      },
      {
        "id": 11,
        "texto": "Cuando marzo mayea, mayo marcea.",
        "tema": "tiempo",
        "significado": "Si marzo es templado, el mes siguiente será frío."
      },
      {
        "id": 12,
        "texto": "Al pan, pan, y al vino, vino.",
        "tema": "consejos",
        "significado": "Hay que llamar a las cosas por su nombre."
      },
      {
        "id": 13,
        "texto": "Con pan y vino se anda el camino.",
        "tema": "comida",
        "significado": "Bien alimentado, todo cuesta menos."
      },
      {
        "id": 14,
        "texto": "A falta de pan, buenas son tortas.",
        "tema": "comida",
        "significado": "Si no tienes lo mejor, confórmate con lo que hay."
      },
      {
        "id": 15,
        "texto": "Pan para hoy, hambre para mañana.",
        "tema": "comida",
        "significado": "Lo que hoy remedia algo puede salir caro después."
      },
      {
        "id": 16,
        "texto": "Perro ladrador, poco mordedor.",
        "tema": "animales",
        "significado": "Quien mucho amenaza rara vez cumple."
      },
      {
        "id": 17,
        "texto": "A otro perro con ese hueso.",
        "tema": "animales",
        "significado": "No me lo creo: cuéntaselo a otro."
      },
      {
        "id": 18,
        "texto": "Muerto el perro, se acabó la rabia.",
        "tema": "animales",
        "significado": "Quitada la causa, desaparece el problema."
      },
      {
        "id": 19,
        "texto": "Más vale pájaro en mano que ciento volando.",
        "tema": "consejos",
        "significado": "Mejor lo seguro que mucho por conseguir."
      },
      {
        "id": 20,
        "texto": "No por mucho madrugar amanece más temprano.",
        "tema": "trabajo",
        "significado": "Las cosas llevan su tiempo y no se adelantan con prisas."
      },
      {
        "id": 21,
        "texto": "A quien madruga, Dios le ayuda.",
        "tema": "trabajo",
        "significado": "El esfuerzo temprano tiene recompensa."
      },
      {
        "id": 22,
        "texto": "En casa del herrero, cuchillo de palo.",
        "tema": "trabajo",
        "significado": "Falta justo lo que más abunda en el oficio de la casa."
      },
      {
        "id": 23,
        "texto": "Ojos que no ven, corazón que no siente.",
        "tema": "personas",
        "significado": "Lo que no se sabe no hace sufrir."
      },
      {
        "id": 24,
        "texto": "Dime con quién andas y te diré quién eres.",
        "tema": "personas",
        "significado": "Las compañías dicen mucho de cada uno."
      },
      {
        "id": 25,
        "texto": "Más vale tarde que nunca.",
        "tema": "consejos",
        "significado": "Hacer algo con retraso es mejor que no hacerlo."
      },
      {
        "id": 26,
        "texto": "A caballo regalado no le mires el diente.",
        "tema": "animales",
        "significado": "Un regalo se agradece sin buscarle faltas."
      },
      {
        "id": 27,
        "texto": "Cría cuervos y te sacarán los ojos.",
        "tema": "personas",
        "significado": "Quien hace bien a un desagradecido acaba perjudicado."
      },
      {
        "id": 28,
        "texto": "Camarón que se duerme se lo lleva la corriente.",
        "tema": "trabajo",
        "significado": "El que se descuida pierde su oportunidad."
      },
      {
        "id": 29,
        "texto": "No hay mal que por bien no venga.",
        "tema": "consejos",
        "significado": "De una desgracia puede salir algo bueno."
      },
      {
        "id": 30,
        "texto": "Año de nieves, año de bienes.",
        "tema": "tiempo",
        "significado": "Un invierno con nieve anuncia buena cosecha."
      },
      {
        "id": 31,
        "texto": "Las cuentas claras y el chocolate espeso.",
        "tema": "comida",
        "significado": "En los tratos, que no quede nada sin aclarar."
      },
      {
        "id": 32,
        "texto": "Quien tiene un amigo tiene un tesoro.",
        "tema": "personas",
        "significado": "La amistad verdadera vale más que el dinero."
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras llega la búsqueda, se lee «Buscando refranes…» y no «Ningún refrán…»",
      "pasos": [],
      "espera": {
        "texto": "Buscando refranes…"
      }
    },
    {
      "descripcion": "Al abrir, aparecen los refranes de «agua»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Al pulsar «gato», la lista de «agua» deja paso a «Buscando refranes…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "texto": "Buscando refranes…"
      }
    },
    {
      "descripcion": "Después aparecen los refranes de «gato»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "De noche, todos los gatos son pardos."
      }
    },
    {
      "descripcion": "Al escribir «perro» deprisa, letra a letra, al final se ven sus refranes",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "perro"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Perro ladrador, poco mordedor."
      }
    },
    {
      "descripcion": "Si la búsqueda falla, aparece un aviso",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Tras un fallo, otra búsqueda funciona",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "De noche, todos los gatos son pardos."
      }
    }
  ]
}
```

Con «Responder desordenado», ahora sí: pulsa «gato» y «mayo» seguidos y la lista acaba en mayo. El panel de red cuenta por qué:

```text
GET /api/refranes?q=agua · cancelada
GET /api/refranes?q=agua · 200
GET /api/refranes?q=gato · cancelada
GET /api/refranes?q=mayo · 200
```

Al lado de cada una verás también los milisegundos que tardó. La primera es el ensayo de `StrictMode`: efecto, limpieza (que la cancela) y efecto otra vez. Y la de gato ya no puede llegar tarde, porque no llega. En el registro de efectos, cada búsqueda es ahora una pareja: «⟲ limpieza» y «▶ efecto · cambió texto: "gato" → "mayo"».

**Las comprobaciones no ven si cancelas.** Como nunca desordenan las respuestas, una solución que guarda la respuesta con su texto pero no tiene limpieza también las supera. Pruébalo: con desorden, esa versión no enseña la lista de otra búsqueda, pero se queda en «Buscando refranes…» para siempre, porque la última en llegar es la vieja (el reto 4 de la lección 38). La cancelación la compruebas tú, en el panel.

### Lo que cuesta esta versión

Funciona, y es lo que harías en una app sin librerías ni framework. Pero cuenta lo que has escrito para **una sola** búsqueda: un estado con la respuesta, un efecto, un controlador, un `catch` que distingue la cancelación de un fallo y una comparación para saber qué pintar. Y aún le falta algo: vuelve a «agua» y mira el panel. Otra petición, y otro «Buscando refranes…», para unos refranes que ya tenías.

## Paso 3: `use`, una caché y `<Suspense>`

La raíz de la carrera es que el efecto **guarda** respuestas en el estado, y por eso puede guardar la que no toca. En la lección 52 viste la otra forma: `Resultados` no guarda nada; **en cada render lee la promesa del texto que tiene ahora**, con `use`. Una respuesta vieja puede llegar cuando quiera: nadie la va a leer.

Recuerda las dos reglas de las lecciones 48 y 49:

- **La promesa no puede nacer en el render.** `use(pedirRefranes(texto))` crearía una petición nueva en cada intento de render y el aviso de carga no se iría nunca. `buscarRefranes(texto)` guarda la promesa de cada texto en un `Map`, fuera de los componentes, y devuelve siempre la misma. Mientras no la escribas, lanza un error que te lo recuerda.
- **Alguien tiene que enseñar la espera.** `Resultados` se suspende mientras la promesa no se cumple, y el `<Suspense>` de encima pinta su fallback.

Un aviso antes de empezar: en este paso no hay error boundary. Si pulsas «Fallar la siguiente petición», el error de `use` sube hasta la raíz y la vista previa entera se cae. Es un paso atrás respecto al paso 2, a propósito: lo recuperas en el paso 5.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 3: use, una caché y Suspense",
  "consigna": "En api.jsx, escribe buscarRefranes(texto): que guarde en un Map, fuera de la función, la promesa de pedirRefranes(texto) de cada texto y devuelva siempre la misma. En Resultados.jsx, lee los refranes con use(buscarRefranes(texto)). En App.jsx, quita el efecto y la respuesta, y pinta <Resultados texto={texto} /> dentro de un <Suspense> con el fallback «Buscando refranes…» en un párrafo con className=\"cargando\".",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirRefranes } from './api'\nimport { ListaRefranes, Sugerencias } from './piezas'\nimport Resultados from './Resultados'\nimport './estilos.css'\n\nexport default function App() {\n  // Paso 3: sin efecto ni respuesta. Pinta <Resultados texto={texto} />\n  // dentro de un <Suspense> con el fallback «Buscando refranes…».\n  const [texto, setTexto] = useState('agua')\n  // La respuesta recuerda qué texto la pidió: { texto, refranes } o { texto, error }\n  const [respuesta, setRespuesta] = useState(null)\n\n  useEffect(() => {\n    const controlador = new AbortController()\n    pedirRefranes(texto, { signal: controlador.signal })\n      .then((refranes) => setRespuesta({ texto, refranes }))\n      .catch((error) => {\n        if (error.name === 'AbortError') return // la cancelamos nosotros\n        setRespuesta({ texto, error: error.message })\n      })\n    return () => controlador.abort()\n  }, [texto])\n\n  let resultado\n  if (respuesta?.texto !== texto) {\n    resultado = <p className=\"cargando\">Buscando refranes…</p>\n  } else if (respuesta.error) {\n    resultado = <p role=\"alert\">No se ha podido buscar: {respuesta.error}</p>\n  } else {\n    resultado = <ListaRefranes refranes={respuesta.refranes} texto={texto} />\n  }\n\n  return (\n    <main>\n      <h1>Al buen entendedor</h1>\n      <p className=\"subtitulo\">El refranero de la Asociación de Mayores El Brasero</p>\n      <label className=\"campo\">\n        Buscar un refrán\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <Sugerencias onElegir={setTexto} />\n      {resultado}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide al servidor los refranes que contienen un texto. Si el servidor\n// responde con un error, lanza; con { signal }, se puede cancelar.\nexport async function pedirRefranes(texto, { signal } = {}) {\n  const respuesta = await fetch('/api/refranes?q=' + encodeURIComponent(texto), { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Paso 3: devuelve siempre la misma promesa para el mismo texto. Guárdalas\n// en un Map, aquí fuera, y pide a pedirRefranes solo los textos nuevos.\nexport function buscarRefranes(texto) {\n  throw new Error('Paso 3: buscarRefranes todavía no tiene caché')\n}\n"
    },
    {
      "nombre": "Resultados.jsx",
      "codigo": "import { use } from 'react'\nimport { buscarRefranes } from './api'\nimport { ListaRefranes } from './piezas'\n\n// Paso 3: lee los refranes de texto con use(buscarRefranes(texto)). Sin\n// estado, sin efecto y sin «Buscando…»: la espera es cosa del Suspense.\nexport default function Resultados({ texto }) {\n  const refranes = []\n  return <ListaRefranes refranes={refranes} texto={texto} />\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "// Lo que se ve de una búsqueda: la lista de refranes o, si no hay ninguno,\n// un aviso que lo dice.\nexport function ListaRefranes({ refranes, texto }) {\n  if (refranes.length === 0) {\n    return <p className=\"vacio\">Ningún refrán con «{texto}».</p>\n  }\n  return (\n    <ul className=\"refranes\">\n      {refranes.map((refran) => (\n        <li key={refran.id}>\n          <p className=\"refran\">{refran.texto}</p>\n          <p className=\"significado\">{refran.significado}</p>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst SUGERENCIAS = ['agua', 'gato', 'mayo', 'pan']\n\n// Las búsquedas de ejemplo: cada botón escribe su palabra de un golpe en el\n// buscador (una sola petición, no una por letra).\nexport function Sugerencias({ onElegir }) {\n  return (\n    <p className=\"sugerencias\">\n      Prueba con:{' '}\n      {SUGERENCIAS.map((palabra) => (\n        <button key={palabra} type=\"button\" onClick={() => onElegir(palabra)}>\n          {palabra}\n        </button>\n      ))}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #fbf6ec;\n  color: #2b2118;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 34rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.9rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.subtitulo {\n  margin: 0.25rem 0 1rem;\n  color: #6b5a48;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\n.campo input {\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #b9a58c;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.sugerencias {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  color: #6b5a48;\n}\n\nbutton {\n  padding: 0.25rem 0.75rem;\n  border: 1px solid #8a6d4b;\n  border-radius: 999px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n/* Paso 4: el aviso de que la lista va por detrás */\n.estado {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  color: #8a5a1f;\n  font-style: italic;\n}\n\n.refranes {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.refranes li {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #c28f4a;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.refran {\n  margin: 0;\n  font: 600 1.05rem Georgia, 'Times New Roman', serif;\n}\n\n.significado {\n  margin: 0.25rem 0 0;\n  color: #6b5a48;\n  font-size: 0.9rem;\n}\n\n.cargando,\n.vacio {\n  color: #6b5a48;\n}\n\n/* Paso 4: la lista desfasada. El atenuado espera 0,2 s antes de empezar,\n   para no parpadear cuando la respuesta llega enseguida. */\n.desfasada {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.2s linear;\n}\n\n[role='alert'] {\n  padding: 0.75rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n}\n\n[role='alert'] p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "api.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "api": {
    "refranes": [
      {
        "id": 1,
        "texto": "Agua que no has de beber, déjala correr.",
        "tema": "consejos",
        "significado": "Lo que no te interesa, déjalo para otros."
      },
      {
        "id": 2,
        "texto": "En abril, aguas mil.",
        "tema": "tiempo",
        "significado": "Abril suele ser un mes de muchas lluvias."
      },
      {
        "id": 3,
        "texto": "Del agua mansa líbreme Dios, que de la brava me libro yo.",
        "tema": "personas",
        "significado": "Hay que desconfiar de quien parece tranquilo."
      },
      {
        "id": 4,
        "texto": "Nunca digas «de esta agua no beberé».",
        "tema": "consejos",
        "significado": "Nadie sabe lo que hará cuando cambien las cosas."
      },
      {
        "id": 5,
        "texto": "Gato escaldado del agua fría huye.",
        "tema": "animales",
        "significado": "Quien ha sufrido un daño desconfía hasta de lo inofensivo."
      },
      {
        "id": 6,
        "texto": "De noche, todos los gatos son pardos.",
        "tema": "animales",
        "significado": "A oscuras no se notan los defectos."
      },
      {
        "id": 7,
        "texto": "Aquí hay gato encerrado.",
        "tema": "animales",
        "significado": "Algo se oculta detrás de lo que se ve."
      },
      {
        "id": 8,
        "texto": "Cuando el gato no está, los ratones bailan.",
        "tema": "animales",
        "significado": "Sin quien vigile, cada uno hace lo que quiere."
      },
      {
        "id": 9,
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
        "tema": "tiempo",
        "significado": "El frío puede volver hasta bien entrada la primavera."
      },
      {
        "id": 10,
        "texto": "Agua de mayo, pan para todo el año.",
        "tema": "tiempo",
        "significado": "La lluvia de primavera trae buenas cosechas."
      },
      {
        "id": 11,
        "texto": "Cuando marzo mayea, mayo marcea.",
        "tema": "tiempo",
        "significado": "Si marzo es templado, el mes siguiente será frío."
      },
      {
        "id": 12,
        "texto": "Al pan, pan, y al vino, vino.",
        "tema": "consejos",
        "significado": "Hay que llamar a las cosas por su nombre."
      },
      {
        "id": 13,
        "texto": "Con pan y vino se anda el camino.",
        "tema": "comida",
        "significado": "Bien alimentado, todo cuesta menos."
      },
      {
        "id": 14,
        "texto": "A falta de pan, buenas son tortas.",
        "tema": "comida",
        "significado": "Si no tienes lo mejor, confórmate con lo que hay."
      },
      {
        "id": 15,
        "texto": "Pan para hoy, hambre para mañana.",
        "tema": "comida",
        "significado": "Lo que hoy remedia algo puede salir caro después."
      },
      {
        "id": 16,
        "texto": "Perro ladrador, poco mordedor.",
        "tema": "animales",
        "significado": "Quien mucho amenaza rara vez cumple."
      },
      {
        "id": 17,
        "texto": "A otro perro con ese hueso.",
        "tema": "animales",
        "significado": "No me lo creo: cuéntaselo a otro."
      },
      {
        "id": 18,
        "texto": "Muerto el perro, se acabó la rabia.",
        "tema": "animales",
        "significado": "Quitada la causa, desaparece el problema."
      },
      {
        "id": 19,
        "texto": "Más vale pájaro en mano que ciento volando.",
        "tema": "consejos",
        "significado": "Mejor lo seguro que mucho por conseguir."
      },
      {
        "id": 20,
        "texto": "No por mucho madrugar amanece más temprano.",
        "tema": "trabajo",
        "significado": "Las cosas llevan su tiempo y no se adelantan con prisas."
      },
      {
        "id": 21,
        "texto": "A quien madruga, Dios le ayuda.",
        "tema": "trabajo",
        "significado": "El esfuerzo temprano tiene recompensa."
      },
      {
        "id": 22,
        "texto": "En casa del herrero, cuchillo de palo.",
        "tema": "trabajo",
        "significado": "Falta justo lo que más abunda en el oficio de la casa."
      },
      {
        "id": 23,
        "texto": "Ojos que no ven, corazón que no siente.",
        "tema": "personas",
        "significado": "Lo que no se sabe no hace sufrir."
      },
      {
        "id": 24,
        "texto": "Dime con quién andas y te diré quién eres.",
        "tema": "personas",
        "significado": "Las compañías dicen mucho de cada uno."
      },
      {
        "id": 25,
        "texto": "Más vale tarde que nunca.",
        "tema": "consejos",
        "significado": "Hacer algo con retraso es mejor que no hacerlo."
      },
      {
        "id": 26,
        "texto": "A caballo regalado no le mires el diente.",
        "tema": "animales",
        "significado": "Un regalo se agradece sin buscarle faltas."
      },
      {
        "id": 27,
        "texto": "Cría cuervos y te sacarán los ojos.",
        "tema": "personas",
        "significado": "Quien hace bien a un desagradecido acaba perjudicado."
      },
      {
        "id": 28,
        "texto": "Camarón que se duerme se lo lleva la corriente.",
        "tema": "trabajo",
        "significado": "El que se descuida pierde su oportunidad."
      },
      {
        "id": 29,
        "texto": "No hay mal que por bien no venga.",
        "tema": "consejos",
        "significado": "De una desgracia puede salir algo bueno."
      },
      {
        "id": 30,
        "texto": "Año de nieves, año de bienes.",
        "tema": "tiempo",
        "significado": "Un invierno con nieve anuncia buena cosecha."
      },
      {
        "id": 31,
        "texto": "Las cuentas claras y el chocolate espeso.",
        "tema": "comida",
        "significado": "En los tratos, que no quede nada sin aclarar."
      },
      {
        "id": 32,
        "texto": "Quien tiene un amigo tiene un tesoro.",
        "tema": "personas",
        "significado": "La amistad verdadera vale más que el dinero."
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras llegan los refranes, el Suspense enseña «Buscando refranes…»",
      "pasos": [],
      "espera": {
        "texto": "Buscando refranes…"
      }
    },
    {
      "descripcion": "Al abrir, aparecen los refranes de «agua»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Al pulsar «gato», aparecen sus refranes",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "De noche, todos los gatos son pardos."
      }
    },
    {
      "descripcion": "Al escribir «perro», aparecen sus refranes",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "perro"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Perro ladrador, poco mordedor."
      }
    },
    {
      "descripcion": "Volver a «agua» no pide nada: aunque la siguiente petición vaya a fallar, sus refranes salen de la caché",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "De noche, todos los gatos son pardos."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "agua"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Una palabra que no sale en ningún refrán lo dice",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "ordenador"
          }
        }
      ],
      "espera": {
        "texto": "Ningún refrán con «ordenador»."
      }
    }
  ]
}
```

Mira lo que queda en `App`: un estado, el campo y un `<Suspense>`. Ni efecto, ni respuesta, ni `AbortController`, ni comparación. Repite las pruebas del paso 1 con el panel de red:

- **Con «Responder desordenado»**, «gato» y «mayo» seguidos acaban en mayo, y «pan» tecleado deprisa, en los refranes con pan. La respuesta de gato llega igual (el panel la marca con su 200), pero `Resultados` ya está leyendo la promesa de mayo.
- **Al cargar, una sola petición**, también con `StrictMode`: el segundo render llama a `buscarRefranes('agua')` y recibe la misma promesa.
- **Al volver a «agua», ninguna**, y los refranes salen al instante: la promesa sigue en la caché, ya cumplida, y `use` lee su valor sin suspenderse. Es la quinta comprobación, la que el paso 2 no supera: le hace fallar la siguiente petición al servidor y vuelve a «agua»; el efecto la pide, falla y enseña el aviso, y la caché ni pregunta.

La carrera que se te quedó abierta en la lección 51, la de la búsqueda dentro de una transición `async` (su segundo reto), tenía la misma raíz: un `set` con una respuesta que puede ser vieja. Aquí no hay ningún `set` de respuestas, así que no hay carrera. En «Errores típicos» verás cómo protegerla si prefieres seguir con la transición.

Pero escribe «perro» en el buscador. **Con cada letra, la lista desaparece** tras «Buscando refranes…» y vuelve a aparecer. Es el salto que la lección 48 dejó apuntado: cada letra es una actualización urgente, `Resultados` se suspende con el texto nuevo y el `<Suspense>`, que ya enseñaba una lista, vuelve a su fallback.

## Paso 4: escribir sin esconder la lista

La lección 51 lo arregló en la mercería con un buscador de patrones, y aquí se hace igual: **el campo, urgente; la lista, diferida**. Con `useDeferredValue(texto)`, el render urgente enseña la letra nueva en el campo y pinta `Resultados` con el texto de antes, cuya promesa ya está cumplida: no se suspende, y la lista sigue ahí. El render con el texto nuevo va en segundo plano, y aunque se suspenda no esconde nada. Cuando su promesa se cumple, React lo termina y cambia la lista de golpe.

Fíjate en lo que acabas de traer de vuelta: **una lista con los resultados de otra búsqueda**, justo lo que el paso 2 quitó. La diferencia es que ahora es a propósito, y que lo dices. Mientras `texto` y `textoDiferido` no coincidan, lo que se ve va por detrás:

- **La lista, atenuada**, con la clase `desfasada`. El CSS espera 0,2 s antes de atenuarla, como el ejemplo de react.dev, para que no parpadee cuando la respuesta llega enseguida o sale de la caché.
- **«Actualizando…»** en un párrafo con `role="status"`, que ya está en `App.jsx` desde el principio, vacío: los lectores de pantalla anuncian los cambios de una región que ya conocen (lección 37).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 4: escribir sin esconder la lista",
  "consigna": "En App.jsx, calcula textoDiferido con useDeferredValue(texto) y pásaselo a Resultados en lugar de texto. Mientras texto y textoDiferido no coincidan, escribe «Actualizando…» en el párrafo de estado que ya está preparado y pon la clase desfasada al div que envuelve el Suspense. El campo sigue con texto: lo que escribes se ve al momento. Prueba a escribir «perro» con la latencia en 2 s.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { Sugerencias } from './piezas'\nimport Resultados from './Resultados'\nimport './estilos.css'\n\nexport default function App() {\n  const [texto, setTexto] = useState('agua')\n  // Paso 4: Resultados, con una versión diferida de texto. Mientras vaya por\n  // detrás, «Actualizando…» en el párrafo de estado y la clase desfasada.\n\n  return (\n    <main>\n      <h1>Al buen entendedor</h1>\n      <p className=\"subtitulo\">El refranero de la Asociación de Mayores El Brasero</p>\n      <label className=\"campo\">\n        Buscar un refrán\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <Sugerencias onElegir={setTexto} />\n      <p className=\"estado\" role=\"status\"></p>\n      <div>\n        <Suspense fallback={<p className=\"cargando\">Buscando refranes…</p>}>\n          <Resultados texto={texto} />\n        </Suspense>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide al servidor los refranes que contienen un texto. Si el servidor\n// responde con un error, lanza; con { signal }, se puede cancelar.\nexport async function pedirRefranes(texto, { signal } = {}) {\n  const respuesta = await fetch('/api/refranes?q=' + encodeURIComponent(texto), { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Una promesa por texto, guardada fuera de los componentes (lección 49)\nconst cache = new Map()\n\nexport function buscarRefranes(texto) {\n  if (!cache.has(texto)) cache.set(texto, pedirRefranes(texto))\n  return cache.get(texto)\n}\n"
    },
    {
      "nombre": "Resultados.jsx",
      "codigo": "import { use } from 'react'\nimport { buscarRefranes } from './api'\nimport { ListaRefranes } from './piezas'\n\n// Lee la búsqueda de texto durante el render: si todavía no ha llegado, se\n// suspende; si ha fallado, lanza el error.\nexport default function Resultados({ texto }) {\n  const refranes = use(buscarRefranes(texto))\n  return <ListaRefranes refranes={refranes} texto={texto} />\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "// Lo que se ve de una búsqueda: la lista de refranes o, si no hay ninguno,\n// un aviso que lo dice.\nexport function ListaRefranes({ refranes, texto }) {\n  if (refranes.length === 0) {\n    return <p className=\"vacio\">Ningún refrán con «{texto}».</p>\n  }\n  return (\n    <ul className=\"refranes\">\n      {refranes.map((refran) => (\n        <li key={refran.id}>\n          <p className=\"refran\">{refran.texto}</p>\n          <p className=\"significado\">{refran.significado}</p>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst SUGERENCIAS = ['agua', 'gato', 'mayo', 'pan']\n\n// Las búsquedas de ejemplo: cada botón escribe su palabra de un golpe en el\n// buscador (una sola petición, no una por letra).\nexport function Sugerencias({ onElegir }) {\n  return (\n    <p className=\"sugerencias\">\n      Prueba con:{' '}\n      {SUGERENCIAS.map((palabra) => (\n        <button key={palabra} type=\"button\" onClick={() => onElegir(palabra)}>\n          {palabra}\n        </button>\n      ))}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #fbf6ec;\n  color: #2b2118;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 34rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.9rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.subtitulo {\n  margin: 0.25rem 0 1rem;\n  color: #6b5a48;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\n.campo input {\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #b9a58c;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.sugerencias {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  color: #6b5a48;\n}\n\nbutton {\n  padding: 0.25rem 0.75rem;\n  border: 1px solid #8a6d4b;\n  border-radius: 999px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n/* Paso 4: el aviso de que la lista va por detrás */\n.estado {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  color: #8a5a1f;\n  font-style: italic;\n}\n\n.refranes {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.refranes li {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #c28f4a;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.refran {\n  margin: 0;\n  font: 600 1.05rem Georgia, 'Times New Roman', serif;\n}\n\n.significado {\n  margin: 0.25rem 0 0;\n  color: #6b5a48;\n  font-size: 0.9rem;\n}\n\n.cargando,\n.vacio {\n  color: #6b5a48;\n}\n\n/* Paso 4: la lista desfasada. El atenuado espera 0,2 s antes de empezar,\n   para no parpadear cuando la respuesta llega enseguida. */\n.desfasada {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.2s linear;\n}\n\n[role='alert'] {\n  padding: 0.75rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n}\n\n[role='alert'] p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "api": {
    "refranes": [
      {
        "id": 1,
        "texto": "Agua que no has de beber, déjala correr.",
        "tema": "consejos",
        "significado": "Lo que no te interesa, déjalo para otros."
      },
      {
        "id": 2,
        "texto": "En abril, aguas mil.",
        "tema": "tiempo",
        "significado": "Abril suele ser un mes de muchas lluvias."
      },
      {
        "id": 3,
        "texto": "Del agua mansa líbreme Dios, que de la brava me libro yo.",
        "tema": "personas",
        "significado": "Hay que desconfiar de quien parece tranquilo."
      },
      {
        "id": 4,
        "texto": "Nunca digas «de esta agua no beberé».",
        "tema": "consejos",
        "significado": "Nadie sabe lo que hará cuando cambien las cosas."
      },
      {
        "id": 5,
        "texto": "Gato escaldado del agua fría huye.",
        "tema": "animales",
        "significado": "Quien ha sufrido un daño desconfía hasta de lo inofensivo."
      },
      {
        "id": 6,
        "texto": "De noche, todos los gatos son pardos.",
        "tema": "animales",
        "significado": "A oscuras no se notan los defectos."
      },
      {
        "id": 7,
        "texto": "Aquí hay gato encerrado.",
        "tema": "animales",
        "significado": "Algo se oculta detrás de lo que se ve."
      },
      {
        "id": 8,
        "texto": "Cuando el gato no está, los ratones bailan.",
        "tema": "animales",
        "significado": "Sin quien vigile, cada uno hace lo que quiere."
      },
      {
        "id": 9,
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
        "tema": "tiempo",
        "significado": "El frío puede volver hasta bien entrada la primavera."
      },
      {
        "id": 10,
        "texto": "Agua de mayo, pan para todo el año.",
        "tema": "tiempo",
        "significado": "La lluvia de primavera trae buenas cosechas."
      },
      {
        "id": 11,
        "texto": "Cuando marzo mayea, mayo marcea.",
        "tema": "tiempo",
        "significado": "Si marzo es templado, el mes siguiente será frío."
      },
      {
        "id": 12,
        "texto": "Al pan, pan, y al vino, vino.",
        "tema": "consejos",
        "significado": "Hay que llamar a las cosas por su nombre."
      },
      {
        "id": 13,
        "texto": "Con pan y vino se anda el camino.",
        "tema": "comida",
        "significado": "Bien alimentado, todo cuesta menos."
      },
      {
        "id": 14,
        "texto": "A falta de pan, buenas son tortas.",
        "tema": "comida",
        "significado": "Si no tienes lo mejor, confórmate con lo que hay."
      },
      {
        "id": 15,
        "texto": "Pan para hoy, hambre para mañana.",
        "tema": "comida",
        "significado": "Lo que hoy remedia algo puede salir caro después."
      },
      {
        "id": 16,
        "texto": "Perro ladrador, poco mordedor.",
        "tema": "animales",
        "significado": "Quien mucho amenaza rara vez cumple."
      },
      {
        "id": 17,
        "texto": "A otro perro con ese hueso.",
        "tema": "animales",
        "significado": "No me lo creo: cuéntaselo a otro."
      },
      {
        "id": 18,
        "texto": "Muerto el perro, se acabó la rabia.",
        "tema": "animales",
        "significado": "Quitada la causa, desaparece el problema."
      },
      {
        "id": 19,
        "texto": "Más vale pájaro en mano que ciento volando.",
        "tema": "consejos",
        "significado": "Mejor lo seguro que mucho por conseguir."
      },
      {
        "id": 20,
        "texto": "No por mucho madrugar amanece más temprano.",
        "tema": "trabajo",
        "significado": "Las cosas llevan su tiempo y no se adelantan con prisas."
      },
      {
        "id": 21,
        "texto": "A quien madruga, Dios le ayuda.",
        "tema": "trabajo",
        "significado": "El esfuerzo temprano tiene recompensa."
      },
      {
        "id": 22,
        "texto": "En casa del herrero, cuchillo de palo.",
        "tema": "trabajo",
        "significado": "Falta justo lo que más abunda en el oficio de la casa."
      },
      {
        "id": 23,
        "texto": "Ojos que no ven, corazón que no siente.",
        "tema": "personas",
        "significado": "Lo que no se sabe no hace sufrir."
      },
      {
        "id": 24,
        "texto": "Dime con quién andas y te diré quién eres.",
        "tema": "personas",
        "significado": "Las compañías dicen mucho de cada uno."
      },
      {
        "id": 25,
        "texto": "Más vale tarde que nunca.",
        "tema": "consejos",
        "significado": "Hacer algo con retraso es mejor que no hacerlo."
      },
      {
        "id": 26,
        "texto": "A caballo regalado no le mires el diente.",
        "tema": "animales",
        "significado": "Un regalo se agradece sin buscarle faltas."
      },
      {
        "id": 27,
        "texto": "Cría cuervos y te sacarán los ojos.",
        "tema": "personas",
        "significado": "Quien hace bien a un desagradecido acaba perjudicado."
      },
      {
        "id": 28,
        "texto": "Camarón que se duerme se lo lleva la corriente.",
        "tema": "trabajo",
        "significado": "El que se descuida pierde su oportunidad."
      },
      {
        "id": 29,
        "texto": "No hay mal que por bien no venga.",
        "tema": "consejos",
        "significado": "De una desgracia puede salir algo bueno."
      },
      {
        "id": 30,
        "texto": "Año de nieves, año de bienes.",
        "tema": "tiempo",
        "significado": "Un invierno con nieve anuncia buena cosecha."
      },
      {
        "id": 31,
        "texto": "Las cuentas claras y el chocolate espeso.",
        "tema": "comida",
        "significado": "En los tratos, que no quede nada sin aclarar."
      },
      {
        "id": 32,
        "texto": "Quien tiene un amigo tiene un tesoro.",
        "tema": "personas",
        "significado": "La amistad verdadera vale más que el dinero."
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, se lee «Buscando refranes…»: todavía no hay ninguna lista que enseñar",
      "pasos": [],
      "espera": {
        "texto": "Buscando refranes…"
      }
    },
    {
      "descripcion": "Al pulsar «gato», los refranes de «agua» siguen a la vista mientras llegan los nuevos",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Mientras tanto, la región de estado dice «Actualizando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Actualizando…"
      }
    },
    {
      "descripcion": "Después aparecen los refranes de «gato»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "De noche, todos los gatos son pardos."
      }
    },
    {
      "descripcion": "Cuando llegan, «Actualizando…» desaparece",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "De noche, todos los gatos son pardos."
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Actualizando…"
        }
      }
    },
    {
      "descripcion": "Al escribir «perro», la lista de «agua» sigue a la vista mientras busca",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "perro"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Al final, la lista enseña los refranes de «perro»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar un refrán",
            "texto": "perro"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Perro ladrador, poco mordedor."
      }
    }
  ]
}
```

Escribe «perro» con la latencia en 2 s: el campo responde al momento, la lista de agua se atenúa con «Actualizando…» y, cuando llega la respuesta, cambia de una vez. El fallback «Buscando refranes…» ya solo se ve al cargar la página, cuando no hay ninguna lista anterior que enseñar.

Ahora mira el panel de red: **sigue saliendo una petición por letra**, `?q=p`, `?q=pe`, `?q=per`... Lo que se difiere es lo que se ve, no lo que se pide (es uno de los mitos de la lección 51). Para pedir menos, la propia referencia de `useDeferredValue` dice que un *debounce* sigue siendo útil, y que las dos técnicas se pueden combinar. Lo tienes en los retos.

¿Y con una transición? También vale: dos estados, `texto` para el campo y `busqueda` para la lista, que actualizas dentro de `startTransition`, con `isPending` para el aviso (el tercer reto de la lección 51). `useDeferredValue` es más directo cuando lo único que tienes es el valor. Lo que no vale es meter en la transición el estado del propio campo: ya viste en la lección 51 que el campo se queda atrás y se come letras.

## Paso 5: cuando el servidor falla

Queda el agujero que abriste en el paso 3: un fallo de red tumba la página entera. La pieza que falta es el **`LimiteDeError` de la lección 53**, que te llega en su archivo sin cambiar una línea: `alternativa(error, reintentar)` dice qué pintar cuando algo falla, y `onReintentar` deja al padre limpiar lo que haga falta antes de volver a intentarlo. Aquí, olvidar la promesa rechazada, que si no se quedaría en la caché y `use` la volvería a lanzar al momento (lo viste en la lección 49).

Lo que cambia es **dónde se pone**. En la lección 53 el boundary envolvía al `<Suspense>`, con la `key` del contenido. Aquí, con un valor diferido, eso deshace el paso 4:

- La `key` tiene que ser `textoDiferido`: es la búsqueda que se está enseñando, y cada búsqueda nueva tiene que empezar con un boundary limpio.
- Esa `key` cambia **en el render de segundo plano**. Si el boundary está por fuera del `<Suspense>`, React desmonta el boundary **y el `<Suspense>` que lleva dentro**, y monta otros nuevos. Un `<Suspense>` recién montado enseña su fallback aunque el render sea diferido (lo viste en la lección 51 con la galería): la lista vuelve a desaparecer con cada búsqueda.
- **Por dentro del `<Suspense>`**, envolviendo solo a `Resultados`, la `key` rehace el boundary, pero el `<Suspense>` es el de siempre, ya visible, y el render diferido no lo esconde.

Y para el usuario, un aviso claro con su botón, sin el mensaje técnico del error, como recomendaba la lección 53: por eso la alternativa no usa su primer argumento.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 5: cuando el servidor falla",
  "consigna": "En api.jsx, escribe olvidar(texto). En App.jsx, envuelve <Resultados> en el LimiteDeError, por dentro del Suspense, con key={textoDiferido}. Su alternativa: un div con role=\"alert\", el texto «No se ha podido buscar «…».» y un botón «Reintentar» que llame a reintentar. Su onReintentar olvida la búsqueda que ha fallado. Pruébalo con «Fallar la siguiente petición» y una búsqueda nueva.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useDeferredValue, useState } from 'react'\nimport { olvidar } from './api'\nimport LimiteDeError from './LimiteDeError'\nimport { Sugerencias } from './piezas'\nimport Resultados from './Resultados'\nimport './estilos.css'\n\nexport default function App() {\n  const [texto, setTexto] = useState('agua')\n  // El campo, con texto; la lista, con su versión diferida (lección 51)\n  const textoDiferido = useDeferredValue(texto)\n  const desfasada = texto !== textoDiferido\n  // Paso 5: Resultados, dentro de un LimiteDeError con su «Reintentar»\n\n  return (\n    <main>\n      <h1>Al buen entendedor</h1>\n      <p className=\"subtitulo\">El refranero de la Asociación de Mayores El Brasero</p>\n      <label className=\"campo\">\n        Buscar un refrán\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <Sugerencias onElegir={setTexto} />\n      <p className=\"estado\" role=\"status\">\n        {desfasada ? 'Actualizando…' : ''}\n      </p>\n      <div className={desfasada ? 'desfasada' : undefined}>\n        <Suspense fallback={<p className=\"cargando\">Buscando refranes…</p>}>\n          <Resultados texto={textoDiferido} />\n        </Suspense>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide al servidor los refranes que contienen un texto. Si el servidor\n// responde con un error, lanza; con { signal }, se puede cancelar.\nexport async function pedirRefranes(texto, { signal } = {}) {\n  const respuesta = await fetch('/api/refranes?q=' + encodeURIComponent(texto), { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Una promesa por texto, guardada fuera de los componentes (lección 49)\nconst cache = new Map()\n\nexport function buscarRefranes(texto) {\n  if (!cache.has(texto)) cache.set(texto, pedirRefranes(texto))\n  return cache.get(texto)\n}\n\n// Paso 5: olvidar(texto) saca de la caché la promesa de ese texto, para\n// que la próxima lectura vuelva a pedirla.\nexport function olvidar(texto) {}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\n// El LimiteDeError de la lección 53, tal cual\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "Resultados.jsx",
      "codigo": "import { use } from 'react'\nimport { buscarRefranes } from './api'\nimport { ListaRefranes } from './piezas'\n\n// Lee la búsqueda de texto durante el render: si todavía no ha llegado, se\n// suspende; si ha fallado, lanza el error.\nexport default function Resultados({ texto }) {\n  const refranes = use(buscarRefranes(texto))\n  return <ListaRefranes refranes={refranes} texto={texto} />\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "// Lo que se ve de una búsqueda: la lista de refranes o, si no hay ninguno,\n// un aviso que lo dice.\nexport function ListaRefranes({ refranes, texto }) {\n  if (refranes.length === 0) {\n    return <p className=\"vacio\">Ningún refrán con «{texto}».</p>\n  }\n  return (\n    <ul className=\"refranes\">\n      {refranes.map((refran) => (\n        <li key={refran.id}>\n          <p className=\"refran\">{refran.texto}</p>\n          <p className=\"significado\">{refran.significado}</p>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst SUGERENCIAS = ['agua', 'gato', 'mayo', 'pan']\n\n// Las búsquedas de ejemplo: cada botón escribe su palabra de un golpe en el\n// buscador (una sola petición, no una por letra).\nexport function Sugerencias({ onElegir }) {\n  return (\n    <p className=\"sugerencias\">\n      Prueba con:{' '}\n      {SUGERENCIAS.map((palabra) => (\n        <button key={palabra} type=\"button\" onClick={() => onElegir(palabra)}>\n          {palabra}\n        </button>\n      ))}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #fbf6ec;\n  color: #2b2118;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 34rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.9rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.subtitulo {\n  margin: 0.25rem 0 1rem;\n  color: #6b5a48;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\n.campo input {\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #b9a58c;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.sugerencias {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  color: #6b5a48;\n}\n\nbutton {\n  padding: 0.25rem 0.75rem;\n  border: 1px solid #8a6d4b;\n  border-radius: 999px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n/* Paso 4: el aviso de que la lista va por detrás */\n.estado {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  color: #8a5a1f;\n  font-style: italic;\n}\n\n.refranes {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.refranes li {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #c28f4a;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.refran {\n  margin: 0;\n  font: 600 1.05rem Georgia, 'Times New Roman', serif;\n}\n\n.significado {\n  margin: 0.25rem 0 0;\n  color: #6b5a48;\n  font-size: 0.9rem;\n}\n\n.cargando,\n.vacio {\n  color: #6b5a48;\n}\n\n/* Paso 4: la lista desfasada. El atenuado espera 0,2 s antes de empezar,\n   para no parpadear cuando la respuesta llega enseguida. */\n.desfasada {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.2s linear;\n}\n\n[role='alert'] {\n  padding: 0.75rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n}\n\n[role='alert'] p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarEfectos": false,
  "api": {
    "refranes": [
      {
        "id": 1,
        "texto": "Agua que no has de beber, déjala correr.",
        "tema": "consejos",
        "significado": "Lo que no te interesa, déjalo para otros."
      },
      {
        "id": 2,
        "texto": "En abril, aguas mil.",
        "tema": "tiempo",
        "significado": "Abril suele ser un mes de muchas lluvias."
      },
      {
        "id": 3,
        "texto": "Del agua mansa líbreme Dios, que de la brava me libro yo.",
        "tema": "personas",
        "significado": "Hay que desconfiar de quien parece tranquilo."
      },
      {
        "id": 4,
        "texto": "Nunca digas «de esta agua no beberé».",
        "tema": "consejos",
        "significado": "Nadie sabe lo que hará cuando cambien las cosas."
      },
      {
        "id": 5,
        "texto": "Gato escaldado del agua fría huye.",
        "tema": "animales",
        "significado": "Quien ha sufrido un daño desconfía hasta de lo inofensivo."
      },
      {
        "id": 6,
        "texto": "De noche, todos los gatos son pardos.",
        "tema": "animales",
        "significado": "A oscuras no se notan los defectos."
      },
      {
        "id": 7,
        "texto": "Aquí hay gato encerrado.",
        "tema": "animales",
        "significado": "Algo se oculta detrás de lo que se ve."
      },
      {
        "id": 8,
        "texto": "Cuando el gato no está, los ratones bailan.",
        "tema": "animales",
        "significado": "Sin quien vigile, cada uno hace lo que quiere."
      },
      {
        "id": 9,
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
        "tema": "tiempo",
        "significado": "El frío puede volver hasta bien entrada la primavera."
      },
      {
        "id": 10,
        "texto": "Agua de mayo, pan para todo el año.",
        "tema": "tiempo",
        "significado": "La lluvia de primavera trae buenas cosechas."
      },
      {
        "id": 11,
        "texto": "Cuando marzo mayea, mayo marcea.",
        "tema": "tiempo",
        "significado": "Si marzo es templado, el mes siguiente será frío."
      },
      {
        "id": 12,
        "texto": "Al pan, pan, y al vino, vino.",
        "tema": "consejos",
        "significado": "Hay que llamar a las cosas por su nombre."
      },
      {
        "id": 13,
        "texto": "Con pan y vino se anda el camino.",
        "tema": "comida",
        "significado": "Bien alimentado, todo cuesta menos."
      },
      {
        "id": 14,
        "texto": "A falta de pan, buenas son tortas.",
        "tema": "comida",
        "significado": "Si no tienes lo mejor, confórmate con lo que hay."
      },
      {
        "id": 15,
        "texto": "Pan para hoy, hambre para mañana.",
        "tema": "comida",
        "significado": "Lo que hoy remedia algo puede salir caro después."
      },
      {
        "id": 16,
        "texto": "Perro ladrador, poco mordedor.",
        "tema": "animales",
        "significado": "Quien mucho amenaza rara vez cumple."
      },
      {
        "id": 17,
        "texto": "A otro perro con ese hueso.",
        "tema": "animales",
        "significado": "No me lo creo: cuéntaselo a otro."
      },
      {
        "id": 18,
        "texto": "Muerto el perro, se acabó la rabia.",
        "tema": "animales",
        "significado": "Quitada la causa, desaparece el problema."
      },
      {
        "id": 19,
        "texto": "Más vale pájaro en mano que ciento volando.",
        "tema": "consejos",
        "significado": "Mejor lo seguro que mucho por conseguir."
      },
      {
        "id": 20,
        "texto": "No por mucho madrugar amanece más temprano.",
        "tema": "trabajo",
        "significado": "Las cosas llevan su tiempo y no se adelantan con prisas."
      },
      {
        "id": 21,
        "texto": "A quien madruga, Dios le ayuda.",
        "tema": "trabajo",
        "significado": "El esfuerzo temprano tiene recompensa."
      },
      {
        "id": 22,
        "texto": "En casa del herrero, cuchillo de palo.",
        "tema": "trabajo",
        "significado": "Falta justo lo que más abunda en el oficio de la casa."
      },
      {
        "id": 23,
        "texto": "Ojos que no ven, corazón que no siente.",
        "tema": "personas",
        "significado": "Lo que no se sabe no hace sufrir."
      },
      {
        "id": 24,
        "texto": "Dime con quién andas y te diré quién eres.",
        "tema": "personas",
        "significado": "Las compañías dicen mucho de cada uno."
      },
      {
        "id": 25,
        "texto": "Más vale tarde que nunca.",
        "tema": "consejos",
        "significado": "Hacer algo con retraso es mejor que no hacerlo."
      },
      {
        "id": 26,
        "texto": "A caballo regalado no le mires el diente.",
        "tema": "animales",
        "significado": "Un regalo se agradece sin buscarle faltas."
      },
      {
        "id": 27,
        "texto": "Cría cuervos y te sacarán los ojos.",
        "tema": "personas",
        "significado": "Quien hace bien a un desagradecido acaba perjudicado."
      },
      {
        "id": 28,
        "texto": "Camarón que se duerme se lo lleva la corriente.",
        "tema": "trabajo",
        "significado": "El que se descuida pierde su oportunidad."
      },
      {
        "id": 29,
        "texto": "No hay mal que por bien no venga.",
        "tema": "consejos",
        "significado": "De una desgracia puede salir algo bueno."
      },
      {
        "id": 30,
        "texto": "Año de nieves, año de bienes.",
        "tema": "tiempo",
        "significado": "Un invierno con nieve anuncia buena cosecha."
      },
      {
        "id": 31,
        "texto": "Las cuentas claras y el chocolate espeso.",
        "tema": "comida",
        "significado": "En los tratos, que no quede nada sin aclarar."
      },
      {
        "id": 32,
        "texto": "Quien tiene un amigo tiene un tesoro.",
        "tema": "personas",
        "significado": "La amistad verdadera vale más que el dinero."
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Si la búsqueda falla al abrir, aparece un aviso con «Reintentar»",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Reintentar"
      }
    },
    {
      "descripcion": "Con el aviso a la vista, el buscador sigue en su sitio",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "etiqueta": "Buscar un refrán"
      }
    },
    {
      "descripcion": "«Reintentar» vuelve a buscar y enseña los refranes",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    },
    {
      "descripcion": "Después de reintentar, el aviso desaparece",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    },
    {
      "descripcion": "Si falla una búsqueda nueva, aparece el aviso",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Tras ese fallo, otra búsqueda funciona sin pulsar «Reintentar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "mayo"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo."
      }
    },
    {
      "descripcion": "«Reintentar» repite la búsqueda que falló",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "De noche, todos los gatos son pardos."
      }
    },
    {
      "descripcion": "Mientras busca, la lista anterior sigue a la vista con «Actualizando…», sin volver a «Buscando refranes…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Agua que no has de beber, déjala correr."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "gato"
          }
        },
        {
          "pulsar": {
            "texto": "Actualizando…"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Agua que no has de beber, déjala correr."
      }
    }
  ]
}
```

Prueba el recorrido entero: pulsa «Fallar la siguiente petición» y después «gato». La lista de agua se atenúa con «Actualizando…», como siempre, y cuando llega el 500 su sitio lo ocupa el aviso. El campo y las sugerencias siguen funcionando: busca «mayo» y el aviso se va solo, porque la `key` nueva trae un boundary limpio. O pulsa «Reintentar»: `olvidar` saca la promesa rechazada de la caché, el boundary vacía su error, `Resultados` vuelve a pedir gato y el `<Suspense>` enseña «Buscando refranes…» mientras tanto (esta vez sí, porque reintentar es un clic normal, no un render diferido).

Las dos formas de recuperarse se reparten el trabajo como en la lección 53: la `key` cuando cambia la búsqueda, y «Reintentar» cuando el usuario pide repetir la misma.

## El buscador completo

Estos son los seis archivos con todos los pasos resueltos. Es el sitio para jugar con el panel de red sin miedo a romper nada:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Al buen entendedor, el refranero de El Brasero",
  "consigna": "Activa «Responder desordenado» y escribe deprisa: la lista acaba siempre en tu búsqueda. Pulsa «Fallar la siguiente petición» y busca algo nuevo; después, «Reintentar». Vuelve a una búsqueda ya hecha y mira que no sale ninguna petición. Y sube la latencia a 3 s para ver bien el atenuado y «Actualizando…».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useDeferredValue, useState } from 'react'\nimport { olvidar } from './api'\nimport LimiteDeError from './LimiteDeError'\nimport { Sugerencias } from './piezas'\nimport Resultados from './Resultados'\nimport './estilos.css'\n\nexport default function App() {\n  const [texto, setTexto] = useState('agua')\n  // El campo, con texto; la lista, con su versión diferida (lección 51)\n  const textoDiferido = useDeferredValue(texto)\n  const desfasada = texto !== textoDiferido\n\n  return (\n    <main>\n      <h1>Al buen entendedor</h1>\n      <p className=\"subtitulo\">El refranero de la Asociación de Mayores El Brasero</p>\n      <label className=\"campo\">\n        Buscar un refrán\n        <input type=\"search\" value={texto} onChange={(evento) => setTexto(evento.target.value)} />\n      </label>\n      <Sugerencias onElegir={setTexto} />\n      <p className=\"estado\" role=\"status\">\n        {desfasada ? 'Actualizando…' : ''}\n      </p>\n      <div className={desfasada ? 'desfasada' : undefined}>\n        <Suspense fallback={<p className=\"cargando\">Buscando refranes…</p>}>\n          {/* Dentro del Suspense: cambiar su key no rehace el Suspense */}\n          <LimiteDeError\n            key={textoDiferido}\n            onReintentar={() => olvidar(textoDiferido)}\n            alternativa={(_error, reintentar) => (\n              <div role=\"alert\">\n                <p>No se ha podido buscar «{textoDiferido}».</p>\n                <button onClick={reintentar}>Reintentar</button>\n              </div>\n            )}\n          >\n            <Resultados texto={textoDiferido} />\n          </LimiteDeError>\n        </Suspense>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide al servidor los refranes que contienen un texto. Si el servidor\n// responde con un error, lanza; con { signal }, se puede cancelar.\nexport async function pedirRefranes(texto, { signal } = {}) {\n  const respuesta = await fetch('/api/refranes?q=' + encodeURIComponent(texto), { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Una promesa por texto, guardada fuera de los componentes (lección 49)\nconst cache = new Map()\n\nexport function buscarRefranes(texto) {\n  if (!cache.has(texto)) cache.set(texto, pedirRefranes(texto))\n  return cache.get(texto)\n}\n\n// Para reintentar: la próxima lectura de ese texto lo vuelve a pedir\nexport function olvidar(texto) {\n  cache.delete(texto)\n}\n"
    },
    {
      "nombre": "Resultados.jsx",
      "codigo": "import { use } from 'react'\nimport { buscarRefranes } from './api'\nimport { ListaRefranes } from './piezas'\n\n// Lee la búsqueda de texto durante el render: si todavía no ha llegado, se\n// suspende; si ha fallado, lanza el error.\nexport default function Resultados({ texto }) {\n  const refranes = use(buscarRefranes(texto))\n  return <ListaRefranes refranes={refranes} texto={texto} />\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\n// El LimiteDeError de la lección 53, tal cual\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "// Lo que se ve de una búsqueda: la lista de refranes o, si no hay ninguno,\n// un aviso que lo dice.\nexport function ListaRefranes({ refranes, texto }) {\n  if (refranes.length === 0) {\n    return <p className=\"vacio\">Ningún refrán con «{texto}».</p>\n  }\n  return (\n    <ul className=\"refranes\">\n      {refranes.map((refran) => (\n        <li key={refran.id}>\n          <p className=\"refran\">{refran.texto}</p>\n          <p className=\"significado\">{refran.significado}</p>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst SUGERENCIAS = ['agua', 'gato', 'mayo', 'pan']\n\n// Las búsquedas de ejemplo: cada botón escribe su palabra de un golpe en el\n// buscador (una sola petición, no una por letra).\nexport function Sugerencias({ onElegir }) {\n  return (\n    <p className=\"sugerencias\">\n      Prueba con:{' '}\n      {SUGERENCIAS.map((palabra) => (\n        <button key={palabra} type=\"button\" onClick={() => onElegir(palabra)}>\n          {palabra}\n        </button>\n      ))}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #fbf6ec;\n  color: #2b2118;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 34rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.9rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.subtitulo {\n  margin: 0.25rem 0 1rem;\n  color: #6b5a48;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\n.campo input {\n  padding: 0.5rem 0.75rem;\n  border: 2px solid #b9a58c;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 400;\n}\n\n.sugerencias {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  color: #6b5a48;\n}\n\nbutton {\n  padding: 0.25rem 0.75rem;\n  border: 1px solid #8a6d4b;\n  border-radius: 999px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #2563eb;\n  outline-offset: 2px;\n}\n\n/* Paso 4: el aviso de que la lista va por detrás */\n.estado {\n  min-height: 1.5rem;\n  margin: 0.5rem 0;\n  color: #8a5a1f;\n  font-style: italic;\n}\n\n.refranes {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.refranes li {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #c28f4a;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.refran {\n  margin: 0;\n  font: 600 1.05rem Georgia, 'Times New Roman', serif;\n}\n\n.significado {\n  margin: 0.25rem 0 0;\n  color: #6b5a48;\n  font-size: 0.9rem;\n}\n\n.cargando,\n.vacio {\n  color: #6b5a48;\n}\n\n/* Paso 4: la lista desfasada. El atenuado espera 0,2 s antes de empezar,\n   para no parpadear cuando la respuesta llega enseguida. */\n.desfasada {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.2s linear;\n}\n\n[role='alert'] {\n  padding: 0.75rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n}\n\n[role='alert'] p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "refranes": [
      {
        "id": 1,
        "texto": "Agua que no has de beber, déjala correr.",
        "tema": "consejos",
        "significado": "Lo que no te interesa, déjalo para otros."
      },
      {
        "id": 2,
        "texto": "En abril, aguas mil.",
        "tema": "tiempo",
        "significado": "Abril suele ser un mes de muchas lluvias."
      },
      {
        "id": 3,
        "texto": "Del agua mansa líbreme Dios, que de la brava me libro yo.",
        "tema": "personas",
        "significado": "Hay que desconfiar de quien parece tranquilo."
      },
      {
        "id": 4,
        "texto": "Nunca digas «de esta agua no beberé».",
        "tema": "consejos",
        "significado": "Nadie sabe lo que hará cuando cambien las cosas."
      },
      {
        "id": 5,
        "texto": "Gato escaldado del agua fría huye.",
        "tema": "animales",
        "significado": "Quien ha sufrido un daño desconfía hasta de lo inofensivo."
      },
      {
        "id": 6,
        "texto": "De noche, todos los gatos son pardos.",
        "tema": "animales",
        "significado": "A oscuras no se notan los defectos."
      },
      {
        "id": 7,
        "texto": "Aquí hay gato encerrado.",
        "tema": "animales",
        "significado": "Algo se oculta detrás de lo que se ve."
      },
      {
        "id": 8,
        "texto": "Cuando el gato no está, los ratones bailan.",
        "tema": "animales",
        "significado": "Sin quien vigile, cada uno hace lo que quiere."
      },
      {
        "id": 9,
        "texto": "Hasta el cuarenta de mayo, no te quites el sayo.",
        "tema": "tiempo",
        "significado": "El frío puede volver hasta bien entrada la primavera."
      },
      {
        "id": 10,
        "texto": "Agua de mayo, pan para todo el año.",
        "tema": "tiempo",
        "significado": "La lluvia de primavera trae buenas cosechas."
      },
      {
        "id": 11,
        "texto": "Cuando marzo mayea, mayo marcea.",
        "tema": "tiempo",
        "significado": "Si marzo es templado, el mes siguiente será frío."
      },
      {
        "id": 12,
        "texto": "Al pan, pan, y al vino, vino.",
        "tema": "consejos",
        "significado": "Hay que llamar a las cosas por su nombre."
      },
      {
        "id": 13,
        "texto": "Con pan y vino se anda el camino.",
        "tema": "comida",
        "significado": "Bien alimentado, todo cuesta menos."
      },
      {
        "id": 14,
        "texto": "A falta de pan, buenas son tortas.",
        "tema": "comida",
        "significado": "Si no tienes lo mejor, confórmate con lo que hay."
      },
      {
        "id": 15,
        "texto": "Pan para hoy, hambre para mañana.",
        "tema": "comida",
        "significado": "Lo que hoy remedia algo puede salir caro después."
      },
      {
        "id": 16,
        "texto": "Perro ladrador, poco mordedor.",
        "tema": "animales",
        "significado": "Quien mucho amenaza rara vez cumple."
      },
      {
        "id": 17,
        "texto": "A otro perro con ese hueso.",
        "tema": "animales",
        "significado": "No me lo creo: cuéntaselo a otro."
      },
      {
        "id": 18,
        "texto": "Muerto el perro, se acabó la rabia.",
        "tema": "animales",
        "significado": "Quitada la causa, desaparece el problema."
      },
      {
        "id": 19,
        "texto": "Más vale pájaro en mano que ciento volando.",
        "tema": "consejos",
        "significado": "Mejor lo seguro que mucho por conseguir."
      },
      {
        "id": 20,
        "texto": "No por mucho madrugar amanece más temprano.",
        "tema": "trabajo",
        "significado": "Las cosas llevan su tiempo y no se adelantan con prisas."
      },
      {
        "id": 21,
        "texto": "A quien madruga, Dios le ayuda.",
        "tema": "trabajo",
        "significado": "El esfuerzo temprano tiene recompensa."
      },
      {
        "id": 22,
        "texto": "En casa del herrero, cuchillo de palo.",
        "tema": "trabajo",
        "significado": "Falta justo lo que más abunda en el oficio de la casa."
      },
      {
        "id": 23,
        "texto": "Ojos que no ven, corazón que no siente.",
        "tema": "personas",
        "significado": "Lo que no se sabe no hace sufrir."
      },
      {
        "id": 24,
        "texto": "Dime con quién andas y te diré quién eres.",
        "tema": "personas",
        "significado": "Las compañías dicen mucho de cada uno."
      },
      {
        "id": 25,
        "texto": "Más vale tarde que nunca.",
        "tema": "consejos",
        "significado": "Hacer algo con retraso es mejor que no hacerlo."
      },
      {
        "id": 26,
        "texto": "A caballo regalado no le mires el diente.",
        "tema": "animales",
        "significado": "Un regalo se agradece sin buscarle faltas."
      },
      {
        "id": 27,
        "texto": "Cría cuervos y te sacarán los ojos.",
        "tema": "personas",
        "significado": "Quien hace bien a un desagradecido acaba perjudicado."
      },
      {
        "id": 28,
        "texto": "Camarón que se duerme se lo lleva la corriente.",
        "tema": "trabajo",
        "significado": "El que se descuida pierde su oportunidad."
      },
      {
        "id": 29,
        "texto": "No hay mal que por bien no venga.",
        "tema": "consejos",
        "significado": "De una desgracia puede salir algo bueno."
      },
      {
        "id": 30,
        "texto": "Año de nieves, año de bienes.",
        "tema": "tiempo",
        "significado": "Un invierno con nieve anuncia buena cosecha."
      },
      {
        "id": 31,
        "texto": "Las cuentas claras y el chocolate espeso.",
        "tema": "comida",
        "significado": "En los tratos, que no quede nada sin aclarar."
      },
      {
        "id": 32,
        "texto": "Quien tiene un amigo tiene un tesoro.",
        "tema": "personas",
        "significado": "La amistad verdadera vale más que el dinero."
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Dónde vive cada cosa",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: texto",
      "nota": "← textoDiferido = useDeferredValue(texto)"
    },
    {
      "nombre": "Sugerencias",
      "nivel": 1,
      "nota": "← onElegir = setTexto"
    },
    {
      "nombre": "Suspense",
      "nivel": 1,
      "etiqueta": "espera",
      "nota": "← fallback solo en la primera carga y al reintentar"
    },
    {
      "nombre": "LimiteDeError",
      "nivel": 2,
      "clave": "textoDiferido",
      "etiqueta": "fallo",
      "nota": "← uno nuevo por búsqueda"
    },
    {
      "nombre": "Resultados",
      "nivel": 3,
      "nota": "← use(buscarRefranes(textoDiferido))"
    },
    {
      "nombre": "ListaRefranes",
      "nivel": 4
    }
  ]
}
```

Y esto es lo que pasa, de principio a fin, en una sola búsqueda:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Pulsas «gato» con los refranes de agua en pantalla",
  "items": [
    {
      "fecha": "Clic",
      "titulo": "Un render urgente",
      "texto": "setTexto pone gato en el campo, pero useDeferredValue devuelve todavía agua. Resultados lee una promesa ya cumplida y no se suspende: la lista de agua sigue ahí, atenuada, con «Actualizando…»."
    },
    {
      "fecha": "Segundo plano",
      "titulo": "Un render diferido que se suspende",
      "texto": "React intenta otro render con textoDiferido en gato. El LimiteDeError tiene key nueva, buscarRefranes no tiene gato en la caché y lo pide, y Resultados se suspende. React abandona ese intento y deja la pantalla como estaba."
    },
    {
      "fecha": "Respuesta",
      "titulo": "La promesa se cumple",
      "texto": "Llegue en orden o no, solo la lee quien tiene gato como texto. Una respuesta vieja que llegue después no la lee nadie: se queda en la caché para la próxima vez que se busque."
    },
    {
      "fecha": "Commit",
      "titulo": "La lista se pone al día",
      "texto": "React repite el render diferido, ahora sin suspenderse, y lo confirma: los refranes de gato, sin atenuar, y la región de estado vacía."
    },
    {
      "fecha": "Si falla",
      "titulo": "El boundary de esa búsqueda",
      "texto": "La promesa se rechaza, use lanza el error y lo recoge el LimiteDeError de gato: el aviso con «Reintentar» ocupa el sitio de la lista, y el buscador sigue funcionando."
    }
  ]
}
```

## Lo que has visto en el panel de red

Cada paso pide los mismos refranes, pero el panel cuenta una historia distinta:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Paso 1: todo llega, nada se cancela",
      "texto": "Dos peticiones al cargar, una por cada montaje de StrictMode, y una por cada letra. Cada respuesta hace su set, y gana la última en llegar."
    },
    {
      "titulo": "Paso 2: las viejas, canceladas",
      "texto": "Al cargar, la primera sale cancelada (el ensayo de StrictMode), y al cambiar de búsqueda, la anterior también. Con el desorden activado, la lista acaba bien."
    },
    {
      "titulo": "Paso 3: una por texto",
      "texto": "Una sola al cargar, también con StrictMode, y ninguna al volver a una búsqueda hecha. Las viejas llegan igual, pero nadie las lee."
    },
    {
      "titulo": "Paso 4: las mismas peticiones",
      "texto": "Diferir cambia lo que se ve, no lo que se pide: sigue saliendo una por letra. Para pedir menos hace falta un debounce."
    },
    {
      "titulo": "Paso 5: Reintentar pide otra vez",
      "texto": "El fallo se queda en la caché hasta que «Reintentar» lo olvida. Entonces sale una petición nueva para esa búsqueda, y solo para esa."
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
      "titulo": "Cualquier búsqueda que pide al escribir",
      "texto": "Un autocompletado de direcciones, el buscador de una tienda, los filtros de un listado: todo lo que lanza peticiones más deprisa de lo que vuelven tiene una carrera esperando."
    },
    {
      "titulo": "Datos que dependen de algo que cambia rápido",
      "texto": "Pestañas, páginas de un listado, el día de un calendario. Si el usuario puede cambiar antes de que llegue la respuesta, la respuesta tiene que saber de qué es, o no guardarse."
    },
    {
      "titulo": "Con una librería",
      "texto": "TanStack Query guarda una promesa por clave, cancela lo que deja de interesar y reintenta solo: lo que has escrito a mano en cinco pasos. Lo verás en la lección 78 y en el proyecto 93."
    },
    {
      "titulo": "Con un framework",
      "texto": "Los routers preparados para Suspense hacen las navegaciones en una transición y te dan la promesa ya creada (lecciones 88 y 90). Tu parte sigue siendo colocar el Suspense y el error boundary."
    }
  ]
}
```

## Errores típicos

**Guardar en el estado una respuesta que nadie protege.** Es el paso 1 entero: un efecto sin limpieza, o una transición `async` que hace un `set` al final. La transición no cambia nada, porque tampoco ordena las respuestas (lección 51). Lo comprobamos simulando que la respuesta de gato tarda más que la de mayo: sin protección, la lista acabó con gatos bajo un buscador que decía «mayo». Con esta guarda, que es la bandera `ignorar` de la lección 38 escrita en un manejador, acabó bien:

```jsx
const ultimaBusqueda = useRef('')

function buscar(texto) {
  ultimaBusqueda.current = texto
  startTransition(async () => {
    const refranes = await pedirRefranes(texto)
    if (ultimaBusqueda.current !== texto) return // llegó tarde: ya no interesa
    startTransition(() => setRefranes(refranes))
  })
}
```

**Diferir sin decirlo.** `useDeferredValue` sin la clase `desfasada` ni «Actualizando…» enseña una lista vieja debajo de un buscador nuevo, sin ninguna señal: es la segunda mentira del paso 1, ahora puesta por ti. Lo que se ve puede ir por detrás; lo que no puede es fingir que no va.

**La `key` del error boundary, por fuera del `<Suspense>`.** Es la colocación de la lección 53, y con un valor diferido rompe el paso 4:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const textoDiferido = useDeferredValue(texto)\nconst desfasada = texto !== textoDiferido\n// ...\n<div className={desfasada ? 'desfasada' : undefined}>\n  <LimiteDeError key={textoDiferido} /* onReintentar, alternativa... */>\n    <Suspense fallback={<p className=\"cargando\">Buscando refranes…</p>}>\n      <Resultados texto={textoDiferido} />\n    </Suspense>\n  </LimiteDeError>\n</div>\n\n// Con los refranes de agua en pantalla, pulsas «gato».\n// ¿Qué se ve mientras llega la respuesta?",
  "opciones": [
    "La lista de agua, atenuada, con «Actualizando…»",
    "«Buscando refranes…» en el sitio de la lista",
    "El aviso de error con «Reintentar»",
    "La lista de agua, sin atenuar: el boundary no deja diferir"
  ],
  "correcta": 1,
  "explicacion": "El render urgente aún usa agua, y la key no cambia. Pero el render diferido trae la key gato: React desmonta el boundary y el Suspense que lleva dentro, y monta otros. Un Suspense recién montado no tiene nada que conservar, así que enseña su fallback aunque el render sea diferido. Comprobado con React 19.3.1: a los 100 ms del clic ya se veía «Buscando refranes…». Con el boundary dentro del Suspense, la lista se queda."
}
```

Lo verás en la vista previa si mueves el `LimiteDeError` del paso 5 por fuera del `<Suspense>`. La última comprobación del paso 5 está pensada para delatarlo: justo después del clic todavía se ve el render urgente, con la lista de agua y «Actualizando…», así que espera un instante (lo que tarda otro clic) antes de mirar. En nuestras pruebas, a esas alturas el render diferido ya había cambiado la lista por «Buscando refranes…».

**Reintentar sin olvidar.** Si el `onReintentar` no saca la promesa rechazada de la caché, el boundary vacía su error, `Resultados` vuelve a leer la misma promesa rechazada y el aviso reaparece al momento, sin ninguna petición en el panel. Es lo que viste en la lección 49 antes de arreglarlo.

**Crear la promesa en el render.** `use(pedirRefranes(texto))`, o una caché dentro del componente con `useMemo` o `useRef`: cada intento de render pide otra vez y el aviso de carga no se va nunca (lección 49). La caché vive fuera de los componentes.

**Meter en una transición el estado del campo.** Para que la lista no esconda nada parece lo directo, pero el campo se queda con letras de menos (lección 51). El campo, urgente; lo que se calcula a partir de él, diferido.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La carrera no es un caso raro",
      "texto": "Cada petición que se lanza antes de que vuelva la anterior puede llegar en otro orden. Si su respuesta se guarda sin más, la última en llegar gana, sea de la búsqueda que sea."
    },
    {
      "titulo": "Con un efecto: cancelar y recordar",
      "texto": "La limpieza cancela con un AbortController o ignora con una bandera; la respuesta guarda su texto para que lo que se pinta salga de comparar los dos."
    },
    {
      "titulo": "Con use: no guardar respuestas",
      "texto": "Resultados lee en cada render la promesa del texto actual, desde una caché fuera de los componentes. Las respuestas viejas llegan, pero nadie las lee, y volver a una búsqueda hecha es instantáneo."
    },
    {
      "titulo": "Lo que va por detrás, se dice",
      "texto": "useDeferredValue deja la lista anterior a la vista mientras llega la nueva. texto distinto de textoDiferido es la señal: lista atenuada y «Actualizando…» en una región de estado."
    },
    {
      "titulo": "Un boundary por búsqueda, dentro del Suspense",
      "texto": "Con key={textoDiferido} por dentro del Suspense, cada búsqueda empieza limpia sin volver al fallback. Reintentar olvida la promesa rechazada antes de vaciar el error."
    },
    {
      "titulo": "Las comprobaciones no lo ven todo",
      "texto": "Lo que depende del orden de las respuestas solo se ve con «Responder desordenado» y el panel de red. Una prueba automática que nunca desordena no puede demostrar que cancelas."
    }
  ]
}
```

## Retos para seguir practicando

Parte del buscador completo. Estos no tienen comprobación automática:

1. **Contar los resultados.** Debajo del buscador, «5 refranes con «pan»» en una región de estado. Que cuente lo que se ve, no lo que se está buscando: ¿de dónde sacas el número sin otro estado, si los refranes solo los conoce `Resultados`? Y ¿qué debe decir mientras la lista va por detrás?
2. **Pedir menos: un *debounce*.** Que la búsqueda no salga hasta que el usuario deje de escribir 300 ms: un estado `textoBuscado` que un efecto con un `setTimeout` (y su `clearTimeout` en la limpieza) pone al día, y que es lo que difieres en lugar de `texto`. Mira en el panel cuántas peticiones salen ahora al escribir «perro».
3. **Precargar las sugerencias.** Llama a `buscarRefranes(palabra)` en el `onMouseEnter` de cada sugerencia. Con 2 s de latencia, pasa el ratón por «mayo», espera y pulsa. ¿Por qué ahora hace falta añadir `promesa.catch(() => {})` en la caché? La lección 52 lo explica.
4. **La búsqueda en la dirección.** Guarda la búsqueda en el *hash* (`#q=gato`) para que se pueda compartir, y léelo al cargar. En la vista previa, `history.pushState` con una ruta normal falla; con el *hash*, no (lecciones 76 y 77). ¿Lo escribes en cada letra o solo cuando la lista se pone al día?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useDeferredValue",
      "descripcion": "Con un buscador como este: enseñar los resultados viejos mientras llegan los nuevos, atenuarlos con un retraso y en qué se diferencia diferir de un debounce.",
      "url": "https://react.dev/reference/react/useDeferredValue",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "You Might Not Need an Effect: Fetching data",
      "descripcion": "La condición de carrera de una búsqueda que pide en un efecto, explicada con «hello» tecleado deprisa, y su arreglo con una bandera.",
      "url": "https://react.dev/learn/you-might-not-need-an-effect#fetching-data",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use",
      "descripcion": "Leer una promesa durante el render, por qué tiene que llegar de una caché y qué pasa cuando se rechaza.",
      "url": "https://react.dev/reference/react/use",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Suspense>",
      "descripcion": "Qué pasa con lo que ya se veía cuando vuelve a suspenderse, y cómo evitar el fallback con transiciones y valores diferidos.",
      "url": "https://react.dev/reference/react/Suspense",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Catching rendering errors with an Error Boundary",
      "descripcion": "La referencia del error boundary: getDerivedStateFromError, dónde ponerlos y cómo reiniciarlos.",
      "url": "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "AbortController",
      "descripcion": "Cancelar un fetch con una señal, y el AbortError con el que se rechaza la promesa.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
      "etiqueta": "MDN"
    }
  ]
}
```
