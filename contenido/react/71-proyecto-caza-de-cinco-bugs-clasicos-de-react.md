# Proyecto: caza de cinco bugs clásicos de React

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `proyecto-caza-de-cinco-bugs-clasicos-de-react` (autogenerado del título)
- **Orden:** 710
- **Fuentes:** [Rendering Lists: Keeping list items in order with key](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) + [useState: Troubleshooting](https://react.dev/reference/react/useState#troubleshooting) + [Synchronizing with Effects: How to handle the Effect firing twice in development?](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development) + [Removing Effect Dependencies: Are you reading some state to calculate the next state?](https://react.dev/learn/removing-effect-dependencies#are-you-reading-some-state-to-calculate-the-next-state) + [`<StrictMode>`](https://react.dev/reference/react/StrictMode) — ver `contenido/react/TEMARIO.md` #71
- **Requiere:** Módulos 2 a 9 completos (lecciones 8 a 70)

---

## Qué vas a hacer

El club de debate **Contrapunto**, de Cáceres, se presenta este año a la liga escolar. En cada entrenamiento alguien modera: da la palabra por turnos, cronometra cada intervención, avisa cuando se acaba el tiempo y apunta qué ha dicho cada orador. Álvaro, del equipo, programó en una tarde un panel de moderación con React para dejar el papel y el cronómetro del móvil. En la primera sesión funcionó... casi.

Salieron cinco fallos, y son **los cinco bugs más clásicos de React**. Los vas a cazar uno a uno:

- **Lo que escribes salta de orador**: una `key` con el índice (lecciones 11 y 26).
- **«Añadir» no añade a nadie**: el estado, mutado con `push` (lecciones 20 y 21).
- **El turno corre el doble**: un intervalo sin limpieza que `StrictMode` destapa (lecciones 38 y 63).
- **El reloj de la sesión se queda en 0:01**: un cierre obsoleto (lecciones 18 y 42).
- **«Too many re-renders» al acabarse el tiempo**: un `set` durante el render (lecciones 15, 24 y 64).

Solo el último da un error. Los otros cuatro no avisan de nada: la app se ve, responde y hace otra cosa. Por eso se buscan con herramientas, las del módulo 9: el **árbol de renders**, que estrenaste en la lección 13 y que la 66 usó para preguntar por qué se renderiza cada componente; el **registro de efectos** del módulo 6 y la lección 63; y el **recuadro de error** de las lecciones 53 y 64. Es el proyecto que cierra el módulo, y repasa de paso medio temario.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Seis bloques, un bug en cada uno de los cinco primeros",
  "contenido": "Los cinco primeros bloques son la misma app con un solo bug sembrado, y debajo de la vista previa, el panel que lo delata. Lee el síntoma, provócalo, mira la herramienta, arregla y pulsa «Comprobar». La explicación va justo debajo de cada bloque: léela después de intentarlo. El sexto bloque trae los cinco a la vez, no todos en el mismo sitio, y sin pistas. «Reiniciar» devuelve el código del bloque a como estaba: si solo quieres volver a probar, edita el código y la vista previa empieza de nuevo."
}
```

Puedes copiar los seis archivos a un proyecto de Vite (lección 2) y verás los mismos bugs, pero el árbol de renders y el registro de efectos solo existen en esta web. En tu ordenador hacen su papel las React DevTools (lección 65) y un `console.log` en cada efecto y en su limpieza.

## Lo que tiene que hacer el panel

Antes de cazar nada, el comportamiento correcto. Sin él no hay bug, solo «cosas raras»:

- **El orden de palabra.** Cuatro oradores de partida: Lucía, Pablo, Marta y Hugo. Cada fila tiene su caja de notas, donde quien modera apunta lo que va a preguntar, y dos botones: «Dar la palabra» y «Quitar». Las notas se quedan con su orador, quites a quien quites. Debajo, «Nuevo orador» y «Añadir» ponen a alguien al final.
- **El turno.** «Dar la palabra» abre el turno de esa persona con su cronómetro: 0:00, 0:01, 0:02... de 0:03. Se puede pausar y reanudar. Al llegar al límite sale «¡Tiempo!» en rojo y el reloj sigue, para que se vea cuánto se pasa. «Terminar turno» lo cierra y lo apunta en «Intervenciones»: «Lucía · 0:04».
- **El reloj de la sesión.** Arranca con el primer turno y cuenta lo que dura el entrenamiento: «Sesión 1 · 0:12».
- **«Nueva sesión».** Todo vuelve a empezar: el equipo de partida, sin notas, sin intervenciones y con el reloj parado.

Un detalle: **en la liga cada turno dura tres minutos, y aquí, tres segundos** (`TIEMPO_POR_TURNO` en `datos.jsx`). Así ves qué pasa al agotarse sin quedarte mirando la pantalla, y las comprobaciones también.

## Las piezas

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "App.jsx",
      "rol": "App y Sesion",
      "descripcion": "App guarda el número de sesión, que es la key de Sesion: «Nueva sesión» lo sube y todo empieza de cero (lección 26). Sesion guarda los oradores, el turno en curso y las intervenciones."
    },
    {
      "etiqueta": "Oradores.jsx",
      "rol": "La lista y el formulario",
      "descripcion": "Una FilaOrador por orador, con su caja de notas en su propio estado y sus dos botones. Debajo, FormularioOrador para añadir a alguien."
    },
    {
      "etiqueta": "Turno.jsx",
      "rol": "El turno en curso",
      "descripcion": "El cronómetro de quien tiene la palabra, con «Pausar» y «Reanudar», el aviso «¡Tiempo!» y «Terminar turno»."
    },
    {
      "etiqueta": "RelojSesion.jsx y datos.jsx",
      "rol": "El reloj y los datos",
      "descripcion": "Cuánto dura la sesión, desde el primer turno. En datos.jsx, el equipo de partida, el límite de cada turno, los ids nuevos y el formato m:ss."
    }
  ]
}
```

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El árbol del panel",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: numero",
      "nota": "← «Nueva sesión» lo sube"
    },
    {
      "nombre": "Sesion",
      "nivel": 1,
      "clave": "numero",
      "etiqueta": "estado: oradores, turno…",
      "nota": "← también las intervenciones"
    },
    {
      "nombre": "RelojSesion",
      "nivel": 2,
      "etiqueta": "estado: segundos",
      "nota": "← aparece con el primer turno"
    },
    {
      "nombre": "Turno",
      "nivel": 2,
      "clave": "turno.id",
      "etiqueta": "estado: segundos, enMarcha",
      "nota": "← solo mientras alguien habla"
    },
    {
      "nombre": "Oradores",
      "nivel": 2
    },
    {
      "nombre": "FilaOrador",
      "nivel": 3,
      "clave": "orador.id",
      "etiqueta": "estado: nota",
      "nota": "← una por orador"
    },
    {
      "nombre": "FormularioOrador",
      "nivel": 3,
      "etiqueta": "estado: nombre"
    }
  ]
}
```

Es el árbol de la app ya arreglada. Tenlo a mano: cuando el árbol de renders te enseñe algo distinto, ahí empieza la pista.

## Las herramientas de la caza

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué te dice cada una",
  "roles": [
    {
      "etiqueta": "Árbol de renders",
      "rol": "Qué se renderizó, y por qué",
      "descripcion": "Del último commit: quién se montó, quién se volvió a renderizar y por qué, quién se desmontó, con su key. Al pulsar un nodo, sus props y su estado."
    },
    {
      "etiqueta": "Registro de efectos",
      "rol": "Qué efectos corrieron, y cuándo",
      "descripcion": "Una línea por efecto y por limpieza, agrupadas por commit, con el motivo: montaje, repetido por StrictMode, una dependencia que cambió o un desmontaje."
    },
    {
      "etiqueta": "Recuadro de error",
      "rol": "Lo que tumbó la app",
      "descripcion": "El mensaje real del error que nadie capturó, con el archivo y la línea cuando la pila del error los trae."
    },
    {
      "etiqueta": "Consola",
      "rol": "Lo que tú le preguntes",
      "descripcion": "Los avisos de React y los console.log que pongas para confirmar o descartar una idea."
    }
  ]
}
```

Las herramientas enseñan; el método decide. Para cada bug, los mismos cinco pasos:

1. **Reprodúcelo**: encuentra los clics que lo provocan siempre igual.
2. **Míralo con la herramienta que encaja con el síntoma.** Algo que salta de sitio o no se repinta: el árbol. Algo que pasa demasiadas veces o ninguna, con el tiempo: el registro de efectos. Algo que revienta: el recuadro.
3. **Explica la causa en una frase** antes de tocar el código. Si no puedes, todavía no la has encontrado.
4. **Arregla la causa, no el síntoma.** Apagar `StrictMode` o esconder una repetición con un ref hace que el síntoma no se vea, no que el bug desaparezca.
5. **Comprueba** que lo que fallaba ya no falla y que lo demás sigue funcionando. Aquí lo hace «Comprobar»; en tu proyecto, los tests de las lecciones 83 y 84.

## Bug 1: lo que escribes salta de orador

**El síntoma.** Mientras Lucía expone, apuntas en «Notas sobre Pablo» lo que le quieres preguntar a él. Lucía tiene que irse antes de tiempo y la quitas de la lista. Tu nota sobre Pablo aparece ahora en la caja de Marta, y la de Pablo está vacía. Nadie ha tocado esas cajas.

**La herramienta: el árbol de renders.** Cuando algo salta de un elemento a otro de una lista, la pregunta es qué cree React que ha pasado: a quién ha quitado y a quién ha conservado. El árbol lo dice con nombre y `key`. Antes de pulsar nada, fíjate en las `key` de las cuatro `FilaOrador`. Después de quitar a Lucía, busca cuál sale tachada como «desmontado» y qué motivo dan las demás.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Bug 1: lo que escribes salta de orador",
  "consigna": "Escribe algo en «Notas sobre Pablo» y pulsa «Quitar a Lucía». En el árbol de renders, ¿qué FilaOrador sale desmontada? ¿Qué motivo dan las otras tres? Arregla Oradores.jsx para que cada nota se quede con su orador, y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { EQUIPO, formatear, nuevoId } from './datos'\nimport Oradores from './Oradores'\nimport RelojSesion from './RelojSesion'\nimport Turno from './Turno'\nimport './estilos.css'\n\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n  const [turno, setTurno] = useState(null)\n  const [intervenciones, setIntervenciones] = useState([])\n\n  function anadirOrador(nombre) {\n    setOradores([...oradores, { id: nuevoId(), nombre }])\n  }\n\n  function quitarOrador(id) {\n    setOradores(oradores.filter((orador) => orador.id !== id))\n  }\n\n  function terminarTurno(segundos) {\n    const orden = intervenciones.length + 1\n    setIntervenciones([...intervenciones, { orden, nombre: turno.nombre, segundos }])\n    setTurno(null)\n  }\n\n  // La sesión empieza cuando alguien toma la palabra por primera vez\n  const empezada = turno !== null || intervenciones.length > 0\n\n  return (\n    <>\n      {empezada ? (\n        <RelojSesion numero={numero} />\n      ) : (\n        <p className=\"reloj\">Sesión {numero} · empieza con el primer turno</p>\n      )}\n      {turno && <Turno key={turno.id} orador={turno} onTerminar={terminarTurno} />}\n      <Oradores\n        oradores={oradores}\n        hayTurno={turno !== null}\n        onDarPalabra={setTurno}\n        onQuitar={quitarOrador}\n        onAnadir={anadirOrador}\n      />\n      <section className=\"intervenciones\">\n        <h2>Intervenciones</h2>\n        {intervenciones.length === 0 ? (\n          <p>Todavía no ha hablado nadie.</p>\n        ) : (\n          <ol>\n            {intervenciones.map((intervencion) => (\n              <li key={intervencion.orden}>\n                {intervencion.nombre} · {formatear(intervencion.segundos)}\n              </li>\n            ))}\n          </ol>\n        )}\n      </section>\n    </>\n  )\n}\n\nexport default function App() {\n  // «Nueva sesión» cambia la key de Sesion: todo vuelve a empezar (lección 26)\n  const [numero, setNumero] = useState(1)\n\n  return (\n    <main>\n      <header className=\"cabecera\">\n        <h1>Contrapunto · Moderación</h1>\n        <button onClick={() => setNumero(numero + 1)}>Nueva sesión</button>\n        <p className=\"mocion\">\n          Moción: «Los institutos deberían cambiar los deberes por proyectos»\n        </p>\n      </header>\n      <Sesion key={numero} numero={numero} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Oradores.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction FilaOrador({ orador, hayTurno, onDarPalabra, onQuitar }) {\n  // Lo que apunta quien modera mientras escucha\n  const [nota, setNota] = useState('')\n\n  return (\n    <li className=\"orador\">\n      <span className=\"nombre\">{orador.nombre}</span>\n      <label>\n        Notas sobre {orador.nombre}\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button\n          disabled={hayTurno}\n          aria-label={`Dar la palabra a ${orador.nombre}`}\n          onClick={() => onDarPalabra(orador)}\n        >\n          Dar la palabra\n        </button>\n        <button aria-label={`Quitar a ${orador.nombre}`} onClick={() => onQuitar(orador.id)}>\n          Quitar\n        </button>\n      </div>\n    </li>\n  )\n}\n\nfunction FormularioOrador({ onAnadir }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    onAnadir(nombre.trim())\n    setNombre('')\n  }\n\n  return (\n    <form className=\"nuevo\" onSubmit={manejarEnvio}>\n      <label>\n        Nuevo orador\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function Oradores({ oradores, hayTurno, onDarPalabra, onQuitar, onAnadir }) {\n  return (\n    <section className=\"oradores\">\n      <h2>Orden de palabra</h2>\n      <ul>\n        {oradores.map((orador, indice) => (\n          <FilaOrador\n            key={indice}\n            orador={orador}\n            hayTurno={hayTurno}\n            onDarPalabra={onDarPalabra}\n            onQuitar={onQuitar}\n          />\n        ))}\n      </ul>\n      <FormularioOrador onAnadir={onAnadir} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Turno.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { TIEMPO_POR_TURNO, formatear } from './datos'\n\n// El turno de quien tiene la palabra: su cronómetro, que se puede pausar\nexport default function Turno({ orador, onTerminar }) {\n  const [segundos, setSegundos] = useState(0)\n  const [enMarcha, setEnMarcha] = useState(true)\n\n  useEffect(() => {\n    if (!enMarcha) return\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [enMarcha])\n\n  const agotado = segundos >= TIEMPO_POR_TURNO\n\n  return (\n    <section className={agotado ? 'turno agotado' : 'turno'} aria-labelledby=\"turno-titulo\">\n      <h2 id=\"turno-titulo\">Tiene la palabra {orador.nombre}</h2>\n      <p className=\"crono\">\n        {formatear(segundos)} de {formatear(TIEMPO_POR_TURNO)}\n      </p>\n      {agotado && <p role=\"alert\">¡Tiempo!</p>}\n      <div className=\"acciones\">\n        <button onClick={() => setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n        <button onClick={() => onTerminar(segundos)}>Terminar turno</button>\n      </div>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "RelojSesion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { formatear } from './datos'\n\n// Cuánto lleva la sesión. Se monta cuando alguien toma la palabra.\nexport default function RelojSesion({ numero }) {\n  const [segundos, setSegundos] = useState(0)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Sesión {numero} · {formatear(segundos)}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// El equipo con el que empieza cada sesión\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  { id: 'pablo', nombre: 'Pablo' },\n  { id: 'marta', nombre: 'Marta' },\n  { id: 'hugo', nombre: 'Hugo' },\n]\n\n// En la liga, cada turno dura tres minutos. Aquí, tres segundos: así ves qué\n// pasa cuando se agota sin quedarte esperando.\nexport const TIEMPO_POR_TURNO = 3\n\nlet nuevos = 0\n\n// Un id para cada orador que se añade: nuevo-1, nuevo-2...\nexport function nuevoId() {\n  nuevos += 1\n  return `nuevo-${nuevos}`\n}\n\n// 75 → «1:15»\nexport function formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f3f0e8;\n  color: #23262d;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  display: grid;\n  gap: 1rem;\n  max-width: 40rem;\n  margin: 0 auto;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 3px solid #1f3a5f;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: #1f3a5f;\n}\n\n.mocion {\n  flex-basis: 100%;\n  margin: 0;\n  color: #5b5f66;\n  font-style: italic;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.reloj {\n  margin: 0;\n  font-weight: 600;\n  color: #1f3a5f;\n  font-variant-numeric: tabular-nums;\n}\n\n.turno {\n  padding: 0.75rem 1rem;\n  border: 2px solid #1f3a5f;\n  border-radius: 10px;\n  background: #fff;\n}\n\n.crono {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 2rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n/* Pasado de tiempo: en rojo */\n.turno.agotado {\n  border-color: #b42318;\n  background: #fef3f2;\n}\n\n.turno.agotado .crono,\n[role='alert'] {\n  color: #b42318;\n}\n\n[role='alert'] {\n  margin: 0 0 0.5rem;\n  font-weight: 700;\n}\n\n.oradores ul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.orador {\n  display: grid;\n  grid-template-columns: 4.5rem 1fr auto;\n  align-items: end;\n  gap: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff;\n}\n\n.nombre {\n  align-self: center;\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.85rem;\n  color: #5b5f66;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #b8b1a3;\n  border-radius: 6px;\n  color: #23262d;\n  font: inherit;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 1px solid #1f3a5f;\n  border-radius: 999px;\n  background: #1f3a5f;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cabecera button,\n.acciones button + button {\n  background: transparent;\n  color: #1f3a5f;\n}\n\nbutton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.nuevo {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n\n.intervenciones ol {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\n@media (max-width: 34rem) {\n  .orador {\n    grid-template-columns: 1fr;\n  }\n}\n"
    }
  ],
  "archivoInicial": "Oradores.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "Al quitar a Lucía, lo que escribiste sobre Pablo sigue en «Notas sobre Pablo»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas sobre Pablo",
            "texto": "Cita el informe PISA"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Lucía"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas sobre Pablo",
        "valor": "Cita el informe PISA"
      }
    },
    {
      "descripcion": "Al quitar a Lucía, «Notas sobre Marta» sigue vacía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas sobre Pablo",
            "texto": "Cita el informe PISA"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Lucía"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas sobre Marta",
        "valor": ""
      }
    },
    {
      "descripcion": "Al quitar a Hugo, el último, la nota sobre Pablo no se mueve",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas sobre Pablo",
            "texto": "Cita el informe PISA"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Hugo"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas sobre Pablo",
        "valor": "Cita el informe PISA"
      }
    },
    {
      "descripcion": "Al añadir a Nerea, las notas que ya habías escrito siguen ahí",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas sobre Pablo",
            "texto": "Cita el informe PISA"
          }
        },
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Nerea"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas sobre Pablo",
        "valor": "Cita el informe PISA"
      }
    }
  ]
}
```

**Qué ha pasado.** Al quitar a Lucía, el árbol enseña esto:

- `FilaOrador key=3` · **desmontado**. La cuarta fila, la de Hugo.
- `FilaOrador key=0`, `key=1` y `key=2` · re-render · «cambió la prop «orador» (objeto nuevo)».
- El resumen: **6 renderizados · 1 desmontado · 17 cambios en el DOM**.

Para React no se ha ido Lucía: **se ha ido la fila de la posición 3**. Antes había keys 0, 1, 2 y 3, y ahora hay 0, 1 y 2. La fila 0 sigue existiendo, con su estado dentro, y recibe por props a otro orador: Pablo. La fila 1, la que guarda tu nota sobre Pablo, recibe a Marta. Por eso tu nota cambia de dueño, y por eso cambian 17 cosas en el DOM: los nombres, las etiquetas y los botones de tres filas.

Es la prueba del índice de la lección 11, ahora con un componente que tiene estado, y la regla de la lección 26: **el estado va atado a la posición en el árbol y a la `key`**. Si la `key` es la posición, lo que escribes se queda en la posición.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Al quitar a Lucía, con key={indice}",
  "nodos": [
    {
      "nombre": "Oradores",
      "nivel": 0,
      "estado": "renderizado"
    },
    {
      "nombre": "FilaOrador",
      "nivel": 1,
      "clave": "0",
      "estado": "renderizado",
      "nota": "← recibe a Pablo y guarda la nota de Lucía"
    },
    {
      "nombre": "FilaOrador",
      "nivel": 1,
      "clave": "1",
      "estado": "renderizado",
      "nota": "← recibe a Marta y guarda tu nota sobre Pablo"
    },
    {
      "nombre": "FilaOrador",
      "nivel": 1,
      "clave": "2",
      "estado": "renderizado",
      "nota": "← recibe a Hugo y guarda la nota de Marta"
    },
    {
      "nombre": "FilaOrador",
      "nivel": 1,
      "clave": "3",
      "estado": "desmontado",
      "nota": "← se pierde la nota de Hugo, no la de Lucía"
    },
    {
      "nombre": "FormularioOrador",
      "nivel": 1,
      "estado": "renderizado"
    }
  ]
}
```

**El arreglo** es darle a cada fila lo que identifica a su orador, su `id`, que ya venía en los datos:

```jsx
{oradores.map((orador) => (
  <FilaOrador
    key={orador.id}
```

Vuelve a probar. Ahora el árbol dice `FilaOrador key=lucia` · desmontado, y las otras tres solo «cambió la prop «onQuitar» (función nueva)», porque `Sesion` crea `quitarOrador` en cada render (lección 67). Se va Lucía con su nota, cada fila sigue con lo suyo, y el resumen baja a **5 cambios en el DOM**: los mismos 6 renderizados, pero React ya no tiene que reescribir tres filas.

¿Y el nombre como `key`? Con este equipo pasaría las comprobaciones, pero el día que se apunten dos Pablos, las dos filas tendrían la misma `key`. El `id` existe para eso. Una de las comprobaciones añade a Nerea después de escribir la nota: es la que no pasa una `key` inventada en cada render, como `Math.random()`. Lo verás en «Errores típicos».

## Bug 2: «Añadir» no añade a nadie

**El síntoma.** Nerea se apunta a última hora. Escribes su nombre en «Nuevo orador» y pulsas «Añadir»: la caja se vacía, pero Nerea no aparece. Ni un aviso. Quitas a Hugo para hacerle sitio... y Nerea aparece de golpe al final de la lista.

**Las herramientas: el árbol de renders y la consola.** Cuando la pantalla no refleja un cambio, la primera pregunta es si React se ha enterado. El árbol responde: si el componente que guarda el dato no se ha vuelto a renderizar, React no se ha enterado. La segunda pregunta es si el dato ha cambiado de verdad, y esa la contesta un `console.log`, o el propio árbol si pulsas el nodo para ver su estado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Bug 2: «Añadir» no añade a nadie",
  "consigna": "Añade a Nerea y mira el árbol: ¿quién se ha vuelto a renderizar y quién sale «sin cambios»? Pulsa Sesion en el árbol y lee su primer estado. Si quieres, pon un console.log(oradores) al final de anadirOrador. Después quita a Hugo. Arregla anadirOrador en App.jsx y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { EQUIPO, formatear, nuevoId } from './datos'\nimport Oradores from './Oradores'\nimport RelojSesion from './RelojSesion'\nimport Turno from './Turno'\nimport './estilos.css'\n\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n  const [turno, setTurno] = useState(null)\n  const [intervenciones, setIntervenciones] = useState([])\n\n  function anadirOrador(nombre) {\n    oradores.push({ id: nuevoId(), nombre })\n    setOradores(oradores)\n  }\n\n  function quitarOrador(id) {\n    setOradores(oradores.filter((orador) => orador.id !== id))\n  }\n\n  function terminarTurno(segundos) {\n    const orden = intervenciones.length + 1\n    setIntervenciones([...intervenciones, { orden, nombre: turno.nombre, segundos }])\n    setTurno(null)\n  }\n\n  // La sesión empieza cuando alguien toma la palabra por primera vez\n  const empezada = turno !== null || intervenciones.length > 0\n\n  return (\n    <>\n      {empezada ? (\n        <RelojSesion numero={numero} />\n      ) : (\n        <p className=\"reloj\">Sesión {numero} · empieza con el primer turno</p>\n      )}\n      {turno && <Turno key={turno.id} orador={turno} onTerminar={terminarTurno} />}\n      <Oradores\n        oradores={oradores}\n        hayTurno={turno !== null}\n        onDarPalabra={setTurno}\n        onQuitar={quitarOrador}\n        onAnadir={anadirOrador}\n      />\n      <section className=\"intervenciones\">\n        <h2>Intervenciones</h2>\n        {intervenciones.length === 0 ? (\n          <p>Todavía no ha hablado nadie.</p>\n        ) : (\n          <ol>\n            {intervenciones.map((intervencion) => (\n              <li key={intervencion.orden}>\n                {intervencion.nombre} · {formatear(intervencion.segundos)}\n              </li>\n            ))}\n          </ol>\n        )}\n      </section>\n    </>\n  )\n}\n\nexport default function App() {\n  // «Nueva sesión» cambia la key de Sesion: todo vuelve a empezar (lección 26)\n  const [numero, setNumero] = useState(1)\n\n  return (\n    <main>\n      <header className=\"cabecera\">\n        <h1>Contrapunto · Moderación</h1>\n        <button onClick={() => setNumero(numero + 1)}>Nueva sesión</button>\n        <p className=\"mocion\">\n          Moción: «Los institutos deberían cambiar los deberes por proyectos»\n        </p>\n      </header>\n      <Sesion key={numero} numero={numero} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Oradores.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction FilaOrador({ orador, hayTurno, onDarPalabra, onQuitar }) {\n  // Lo que apunta quien modera mientras escucha\n  const [nota, setNota] = useState('')\n\n  return (\n    <li className=\"orador\">\n      <span className=\"nombre\">{orador.nombre}</span>\n      <label>\n        Notas sobre {orador.nombre}\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button\n          disabled={hayTurno}\n          aria-label={`Dar la palabra a ${orador.nombre}`}\n          onClick={() => onDarPalabra(orador)}\n        >\n          Dar la palabra\n        </button>\n        <button aria-label={`Quitar a ${orador.nombre}`} onClick={() => onQuitar(orador.id)}>\n          Quitar\n        </button>\n      </div>\n    </li>\n  )\n}\n\nfunction FormularioOrador({ onAnadir }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    onAnadir(nombre.trim())\n    setNombre('')\n  }\n\n  return (\n    <form className=\"nuevo\" onSubmit={manejarEnvio}>\n      <label>\n        Nuevo orador\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function Oradores({ oradores, hayTurno, onDarPalabra, onQuitar, onAnadir }) {\n  return (\n    <section className=\"oradores\">\n      <h2>Orden de palabra</h2>\n      <ul>\n        {oradores.map((orador) => (\n          <FilaOrador\n            key={orador.id}\n            orador={orador}\n            hayTurno={hayTurno}\n            onDarPalabra={onDarPalabra}\n            onQuitar={onQuitar}\n          />\n        ))}\n      </ul>\n      <FormularioOrador onAnadir={onAnadir} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Turno.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { TIEMPO_POR_TURNO, formatear } from './datos'\n\n// El turno de quien tiene la palabra: su cronómetro, que se puede pausar\nexport default function Turno({ orador, onTerminar }) {\n  const [segundos, setSegundos] = useState(0)\n  const [enMarcha, setEnMarcha] = useState(true)\n\n  useEffect(() => {\n    if (!enMarcha) return\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [enMarcha])\n\n  const agotado = segundos >= TIEMPO_POR_TURNO\n\n  return (\n    <section className={agotado ? 'turno agotado' : 'turno'} aria-labelledby=\"turno-titulo\">\n      <h2 id=\"turno-titulo\">Tiene la palabra {orador.nombre}</h2>\n      <p className=\"crono\">\n        {formatear(segundos)} de {formatear(TIEMPO_POR_TURNO)}\n      </p>\n      {agotado && <p role=\"alert\">¡Tiempo!</p>}\n      <div className=\"acciones\">\n        <button onClick={() => setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n        <button onClick={() => onTerminar(segundos)}>Terminar turno</button>\n      </div>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "RelojSesion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { formatear } from './datos'\n\n// Cuánto lleva la sesión. Se monta cuando alguien toma la palabra.\nexport default function RelojSesion({ numero }) {\n  const [segundos, setSegundos] = useState(0)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Sesión {numero} · {formatear(segundos)}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// El equipo con el que empieza cada sesión\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  { id: 'pablo', nombre: 'Pablo' },\n  { id: 'marta', nombre: 'Marta' },\n  { id: 'hugo', nombre: 'Hugo' },\n]\n\n// En la liga, cada turno dura tres minutos. Aquí, tres segundos: así ves qué\n// pasa cuando se agota sin quedarte esperando.\nexport const TIEMPO_POR_TURNO = 3\n\nlet nuevos = 0\n\n// Un id para cada orador que se añade: nuevo-1, nuevo-2...\nexport function nuevoId() {\n  nuevos += 1\n  return `nuevo-${nuevos}`\n}\n\n// 75 → «1:15»\nexport function formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f3f0e8;\n  color: #23262d;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  display: grid;\n  gap: 1rem;\n  max-width: 40rem;\n  margin: 0 auto;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 3px solid #1f3a5f;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: #1f3a5f;\n}\n\n.mocion {\n  flex-basis: 100%;\n  margin: 0;\n  color: #5b5f66;\n  font-style: italic;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.reloj {\n  margin: 0;\n  font-weight: 600;\n  color: #1f3a5f;\n  font-variant-numeric: tabular-nums;\n}\n\n.turno {\n  padding: 0.75rem 1rem;\n  border: 2px solid #1f3a5f;\n  border-radius: 10px;\n  background: #fff;\n}\n\n.crono {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 2rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n/* Pasado de tiempo: en rojo */\n.turno.agotado {\n  border-color: #b42318;\n  background: #fef3f2;\n}\n\n.turno.agotado .crono,\n[role='alert'] {\n  color: #b42318;\n}\n\n[role='alert'] {\n  margin: 0 0 0.5rem;\n  font-weight: 700;\n}\n\n.oradores ul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.orador {\n  display: grid;\n  grid-template-columns: 4.5rem 1fr auto;\n  align-items: end;\n  gap: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff;\n}\n\n.nombre {\n  align-self: center;\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.85rem;\n  color: #5b5f66;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #b8b1a3;\n  border-radius: 6px;\n  color: #23262d;\n  font: inherit;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 1px solid #1f3a5f;\n  border-radius: 999px;\n  background: #1f3a5f;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cabecera button,\n.acciones button + button {\n  background: transparent;\n  color: #1f3a5f;\n}\n\nbutton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.nuevo {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n\n.intervenciones ol {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\n@media (max-width: 34rem) {\n  .orador {\n    grid-template-columns: 1fr;\n  }\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "Al añadir a Nerea, aparece al final del orden de palabra",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Nerea"
      }
    },
    {
      "descripcion": "Al añadir a Nerea, la caja «Nuevo orador» se vacía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "etiqueta": "Nuevo orador",
        "valor": ""
      }
    },
    {
      "descripcion": "Puedes añadir a dos seguidos: Nerea y después Iván",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Nerea"
          }
        },
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Iván"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Iván"
      }
    },
    {
      "descripcion": "Puedes dar la palabra a Nerea en cuanto aparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Nerea"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Tiene la palabra Nerea"
      }
    },
    {
      "descripcion": "«Nueva sesión» vuelve a empezar con el equipo de siempre: Nerea ya no está",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Nueva sesión"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Nerea"
        }
      }
    }
  ]
}
```

**Qué ha pasado.** Al pulsar «Añadir», el árbol registra un commit con **1 renderizado · 1 cambio en el DOM**: `FormularioOrador` · re-render · «cambió su estado». Es la caja que se vacía. `Sesion`, la dueña de la lista, sale «sin cambios», y con ella `Oradores` y las cuatro filas. Pero pulsa `Sesion` en el árbol: su primer estado dice **[5 elementos]**. El dato ya tiene a Nerea; la pantalla, no. Un `console.log(oradores)` lo confirma: el array ya la trae al final.

`oradores.push(...)` mete a Nerea **dentro del array del estado**, el mismo objeto de antes, y `setOradores(oradores)` le pasa a React ese mismo array. React compara el valor nuevo con el anterior con `Object.is`, ve el mismo objeto y no hace nada (lecciones 20 y 21; react.dev lo recoge en los problemas típicos de `useState`: «I've updated the state, but the screen doesn't update»). Nerea solo sale cuando otra cosa obliga a `Sesion` a renderizar: quitar a Hugo crea un array nuevo con `filter`, y ese array ya la lleva dentro.

**El arreglo**: un array nuevo con el orador al final, como en la lección 21:

```jsx
function anadirOrador(nombre) {
  setOradores([...oradores, { id: nuevoId(), nombre }])
}
```

**¿Y si empujas y después copias?** Con `oradores.push(...)` seguido de `setOradores([...oradores])`, Nerea aparece y parece arreglado. Pero el `push` ya ha cambiado un array que no era tuyo, y no es el que crees. Fíjate de dónde sale el estado inicial de `Sesion`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// datos.jsx\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  // ...Pablo, Marta y Hugo\n]\n\n// App.jsx\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n\n  function anadirOrador(nombre) {\n    oradores.push({ id: nuevoId(), nombre })\n    setOradores(oradores)\n  }\n  // ...\n}\n\n// En App: <Sesion key={numero} numero={numero} />\n// «Nueva sesión» hace setNumero(numero + 1).\n\n// Añades a Nerea (no sale) y pulsas «Nueva sesión».\n// ¿Qué orden de palabra tiene la sesión 2?",
  "opciones": [
    "Lucía, Pablo, Marta y Hugo: una key nueva empieza de cero",
    "Lucía, Pablo, Marta, Hugo y Nerea",
    "Ninguno: el push ha dejado la lista vacía",
    "Un error: Nerea no tiene key"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. La key nueva monta otra Sesion, y useState(EQUIPO) toma como estado inicial... el array EQUIPO, que no es una copia: es el mismo objeto que el push de la sesión 1 cambió. La constante del módulo ya no es el equipo de partida, y Nerea se cuela en todas las sesiones que vengan."
}
```

**El estado inicial no es una copia de `EQUIPO`: es `EQUIPO`.** El primer `push` de cada página cambia la constante que comparten todas las sesiones, aunque después copies. Por eso la última comprobación pulsa «Nueva sesión» después de añadir a Nerea: con un `push` en cualquier punto del camino, Nerea sigue ahí.

Fíjate también en lo que **no** ha avisado: ni React ni el linter. Lo comprobamos con `eslint-plugin-react-hooks` 7.1.1 y su configuración recomendada: su regla `immutability` no dice nada de un `push` dentro de un manejador. Contra la mutación, la defensa es la costumbre de la lección 21: en el estado, siempre la columna de los métodos que devuelven un array nuevo.

## Bug 3: el turno corre el doble

**El síntoma.** Das la palabra a Lucía y su cronómetro avanza dos segundos por cada segundo de verdad: el reloj de la sesión, que arranca a la vez, marca la mitad. A los dos segundos ya sale «¡Tiempo!». Pulsas «Pausar» y el cronómetro sigue corriendo. «Reanudar» lo empeora: ahora va el triple.

**La herramienta: el registro de efectos.** Un cronómetro es un intervalo, y el intervalo lo crea un efecto. Si va más deprisa de la cuenta, la pregunta es cuántos intervalos hay en marcha, y eso se cuenta en el registro: cuántas veces se ha ejecutado el efecto y cuántas se ha limpiado. Tienes con qué comparar: `RelojSesion` y `Turno` se montan en el mismo commit, cuando das la palabra por primera vez, y el reloj de la sesión funciona bien.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Bug 3: el turno corre el doble",
  "consigna": "Da la palabra a Lucía y compara su cronómetro con el reloj de la sesión. En el registro de efectos, busca el commit en que empieza el turno y compara las líneas de RelojSesion con las de Turno. Pulsa «Pausar»: ¿qué línea sale? Arregla el efecto de Turno.jsx y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { EQUIPO, formatear, nuevoId } from './datos'\nimport Oradores from './Oradores'\nimport RelojSesion from './RelojSesion'\nimport Turno from './Turno'\nimport './estilos.css'\n\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n  const [turno, setTurno] = useState(null)\n  const [intervenciones, setIntervenciones] = useState([])\n\n  function anadirOrador(nombre) {\n    setOradores([...oradores, { id: nuevoId(), nombre }])\n  }\n\n  function quitarOrador(id) {\n    setOradores(oradores.filter((orador) => orador.id !== id))\n  }\n\n  function terminarTurno(segundos) {\n    const orden = intervenciones.length + 1\n    setIntervenciones([...intervenciones, { orden, nombre: turno.nombre, segundos }])\n    setTurno(null)\n  }\n\n  // La sesión empieza cuando alguien toma la palabra por primera vez\n  const empezada = turno !== null || intervenciones.length > 0\n\n  return (\n    <>\n      {empezada ? (\n        <RelojSesion numero={numero} />\n      ) : (\n        <p className=\"reloj\">Sesión {numero} · empieza con el primer turno</p>\n      )}\n      {turno && <Turno key={turno.id} orador={turno} onTerminar={terminarTurno} />}\n      <Oradores\n        oradores={oradores}\n        hayTurno={turno !== null}\n        onDarPalabra={setTurno}\n        onQuitar={quitarOrador}\n        onAnadir={anadirOrador}\n      />\n      <section className=\"intervenciones\">\n        <h2>Intervenciones</h2>\n        {intervenciones.length === 0 ? (\n          <p>Todavía no ha hablado nadie.</p>\n        ) : (\n          <ol>\n            {intervenciones.map((intervencion) => (\n              <li key={intervencion.orden}>\n                {intervencion.nombre} · {formatear(intervencion.segundos)}\n              </li>\n            ))}\n          </ol>\n        )}\n      </section>\n    </>\n  )\n}\n\nexport default function App() {\n  // «Nueva sesión» cambia la key de Sesion: todo vuelve a empezar (lección 26)\n  const [numero, setNumero] = useState(1)\n\n  return (\n    <main>\n      <header className=\"cabecera\">\n        <h1>Contrapunto · Moderación</h1>\n        <button onClick={() => setNumero(numero + 1)}>Nueva sesión</button>\n        <p className=\"mocion\">\n          Moción: «Los institutos deberían cambiar los deberes por proyectos»\n        </p>\n      </header>\n      <Sesion key={numero} numero={numero} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Oradores.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction FilaOrador({ orador, hayTurno, onDarPalabra, onQuitar }) {\n  // Lo que apunta quien modera mientras escucha\n  const [nota, setNota] = useState('')\n\n  return (\n    <li className=\"orador\">\n      <span className=\"nombre\">{orador.nombre}</span>\n      <label>\n        Notas sobre {orador.nombre}\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button\n          disabled={hayTurno}\n          aria-label={`Dar la palabra a ${orador.nombre}`}\n          onClick={() => onDarPalabra(orador)}\n        >\n          Dar la palabra\n        </button>\n        <button aria-label={`Quitar a ${orador.nombre}`} onClick={() => onQuitar(orador.id)}>\n          Quitar\n        </button>\n      </div>\n    </li>\n  )\n}\n\nfunction FormularioOrador({ onAnadir }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    onAnadir(nombre.trim())\n    setNombre('')\n  }\n\n  return (\n    <form className=\"nuevo\" onSubmit={manejarEnvio}>\n      <label>\n        Nuevo orador\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function Oradores({ oradores, hayTurno, onDarPalabra, onQuitar, onAnadir }) {\n  return (\n    <section className=\"oradores\">\n      <h2>Orden de palabra</h2>\n      <ul>\n        {oradores.map((orador) => (\n          <FilaOrador\n            key={orador.id}\n            orador={orador}\n            hayTurno={hayTurno}\n            onDarPalabra={onDarPalabra}\n            onQuitar={onQuitar}\n          />\n        ))}\n      </ul>\n      <FormularioOrador onAnadir={onAnadir} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Turno.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { TIEMPO_POR_TURNO, formatear } from './datos'\n\n// El turno de quien tiene la palabra: su cronómetro, que se puede pausar\nexport default function Turno({ orador, onTerminar }) {\n  const [segundos, setSegundos] = useState(0)\n  const [enMarcha, setEnMarcha] = useState(true)\n\n  useEffect(() => {\n    if (!enMarcha) return\n    setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n  }, [enMarcha])\n\n  const agotado = segundos >= TIEMPO_POR_TURNO\n\n  return (\n    <section className={agotado ? 'turno agotado' : 'turno'} aria-labelledby=\"turno-titulo\">\n      <h2 id=\"turno-titulo\">Tiene la palabra {orador.nombre}</h2>\n      <p className=\"crono\">\n        {formatear(segundos)} de {formatear(TIEMPO_POR_TURNO)}\n      </p>\n      {agotado && <p role=\"alert\">¡Tiempo!</p>}\n      <div className=\"acciones\">\n        <button onClick={() => setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n        <button onClick={() => onTerminar(segundos)}>Terminar turno</button>\n      </div>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "RelojSesion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { formatear } from './datos'\n\n// Cuánto lleva la sesión. Se monta cuando alguien toma la palabra.\nexport default function RelojSesion({ numero }) {\n  const [segundos, setSegundos] = useState(0)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Sesión {numero} · {formatear(segundos)}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// El equipo con el que empieza cada sesión\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  { id: 'pablo', nombre: 'Pablo' },\n  { id: 'marta', nombre: 'Marta' },\n  { id: 'hugo', nombre: 'Hugo' },\n]\n\n// En la liga, cada turno dura tres minutos. Aquí, tres segundos: así ves qué\n// pasa cuando se agota sin quedarte esperando.\nexport const TIEMPO_POR_TURNO = 3\n\nlet nuevos = 0\n\n// Un id para cada orador que se añade: nuevo-1, nuevo-2...\nexport function nuevoId() {\n  nuevos += 1\n  return `nuevo-${nuevos}`\n}\n\n// 75 → «1:15»\nexport function formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f3f0e8;\n  color: #23262d;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  display: grid;\n  gap: 1rem;\n  max-width: 40rem;\n  margin: 0 auto;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 3px solid #1f3a5f;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: #1f3a5f;\n}\n\n.mocion {\n  flex-basis: 100%;\n  margin: 0;\n  color: #5b5f66;\n  font-style: italic;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.reloj {\n  margin: 0;\n  font-weight: 600;\n  color: #1f3a5f;\n  font-variant-numeric: tabular-nums;\n}\n\n.turno {\n  padding: 0.75rem 1rem;\n  border: 2px solid #1f3a5f;\n  border-radius: 10px;\n  background: #fff;\n}\n\n.crono {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 2rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n/* Pasado de tiempo: en rojo */\n.turno.agotado {\n  border-color: #b42318;\n  background: #fef3f2;\n}\n\n.turno.agotado .crono,\n[role='alert'] {\n  color: #b42318;\n}\n\n[role='alert'] {\n  margin: 0 0 0.5rem;\n  font-weight: 700;\n}\n\n.oradores ul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.orador {\n  display: grid;\n  grid-template-columns: 4.5rem 1fr auto;\n  align-items: end;\n  gap: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff;\n}\n\n.nombre {\n  align-self: center;\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.85rem;\n  color: #5b5f66;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #b8b1a3;\n  border-radius: 6px;\n  color: #23262d;\n  font: inherit;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 1px solid #1f3a5f;\n  border-radius: 999px;\n  background: #1f3a5f;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cabecera button,\n.acciones button + button {\n  background: transparent;\n  color: #1f3a5f;\n}\n\nbutton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.nuevo {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n\n.intervenciones ol {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\n@media (max-width: 34rem) {\n  .orador {\n    grid-template-columns: 1fr;\n  }\n}\n"
    }
  ],
  "archivoInicial": "Turno.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": false,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al dar la palabra a Lucía, su turno empieza en 0:00",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        }
      ],
      "espera": {
        "texto": "0:00 de 0:03"
      }
    },
    {
      "descripcion": "El turno avanza un segundo por segundo: si lo terminas al marcar 0:01, se apunta «Lucía · 0:01»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lucía · 0:01"
      }
    },
    {
      "descripcion": "«Pausar» para el turno: dos segundos después, sigue en 0:01",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pausar"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:02"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:03"
          }
        }
      ],
      "espera": {
        "texto": "0:01 de 0:03"
      }
    },
    {
      "descripcion": "«Reanudar» lo pone en marcha otra vez: llega a 0:02",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pausar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reanudar"
          }
        }
      ],
      "espera": {
        "texto": "0:02 de 0:03"
      }
    },
    {
      "descripcion": "El turno siguiente, el de Pablo, también avanza un segundo por segundo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Pablo"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Pablo · 0:01"
      }
    }
  ]
}
```

**Qué ha pasado.** En el commit en que empieza el turno, el registro dice:

```text
RelojSesion ▶ efecto · montaje
Turno ▶ efecto · montaje
RelojSesion ⟲ limpieza
RelojSesion ▶ efecto · repetido por StrictMode
Turno ▶ efecto · repetido por StrictMode
```

`RelojSesion` tiene sus tres líneas, la limpieza del medio incluida. **`Turno` tiene dos efectos y ninguna limpieza.** Es el ensayo de `StrictMode` de la lección 63: montar, desmontar y volver a montar. Como el efecto no sabe deshacerse, el desmontaje no para nada, y quedan **dos intervalos** sumando un segundo cada uno.

Al pulsar «Pausar» sale `Turno ▶ efecto · cambió enMarcha: true → false`, sin ninguna limpieza delante: el efecto vuelve a ejecutarse, ve que está en pausa y no crea nada, pero nadie para los dos intervalos que ya corrían. «Reanudar» crea un tercero. Y «Terminar turno» no deja ningún `⟲ limpieza · desmontaje` de `Turno`: los intervalos siguen vivos después de que el turno desaparezca, llamando cada segundo al `set` de un componente que ya no existe.

**El arreglo** es el de la lección 38: guardar el id del intervalo y devolver la limpieza que lo para.

```jsx
useEffect(() => {
  if (!enMarcha) return
  const id = setInterval(() => {
    setSegundos((s) => s + 1)
  }, 1000)
  return () => clearInterval(id)
}, [enMarcha])
```

Con él, el registro cuenta la historia completa. Al empezar el turno, las tres líneas de siempre: `▶ efecto · montaje`, `⟲ limpieza` y `▶ efecto · repetido por StrictMode`. «Pausar» añade `⟲ limpieza` y `▶ efecto · cambió enMarcha: true → false`. «Reanudar», solo `▶ efecto · cambió enMarcha: false → true`: la ejecución en pausa no creó nada ni devolvió limpieza, así que no hay nada que limpiar. Y «Terminar turno», `⟲ limpieza · desmontaje`.

**Lo que te ha ahorrado `StrictMode`.** Sin él, el turno iría a su velocidad y el bug pasaría la primera prueba. Pero «Pausar» seguiría sin pausar: lo comprobamos sin `StrictMode`, y tras pausar en 0:01 el cronómetro marca 0:02 un segundo después. Y cada turno dejaría un intervalo vivo. `StrictMode` no ha creado el fallo: **lo ha adelantado al primer segundo**.

Por eso una de las comprobaciones pausa el turno y deja pasar dos segundos del reloj de la sesión antes de mirar. Así no la pasa ni el código sin `StrictMode` ni el truco del ref que impide repetir el efecto (lección 38): los dos esconden la repetición, pero el intervalo sigue sin limpieza y la pausa sigue sin parar nada.

## Bug 4: el reloj de la sesión se queda en 0:01

**El síntoma.** Das la palabra y el reloj de la sesión arranca: 0:00, 0:01... y ahí se queda. El cronómetro del turno sigue contando a su lado, así que el tiempo pasa. Ningún error, ningún aviso.

**Las herramientas: el registro de efectos y el árbol de renders.** Un reloj parado puede ser un intervalo que no se ejecuta o un intervalo que se ejecuta y no cambia nada. El registro dice si el efecto se vuelve a ejecutar; el árbol, si `RelojSesion` se vuelve a renderizar. Ojo con el árbol: solo enseña el último commit, y mientras corre el turno hay uno nuevo cada segundo. Mira cómo sale `RelojSesion` en cada uno y cuántos renders lleva.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Bug 4: el reloj de la sesión se queda en 0:01",
  "consigna": "Da la palabra a Lucía y espera unos segundos. En el registro de efectos, ¿cuántas veces se ejecuta el efecto de RelojSesion? En el árbol, ¿cómo sale RelojSesion en los commits del turno, y cuántos renders lleva? Arregla RelojSesion.jsx y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { EQUIPO, formatear, nuevoId } from './datos'\nimport Oradores from './Oradores'\nimport RelojSesion from './RelojSesion'\nimport Turno from './Turno'\nimport './estilos.css'\n\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n  const [turno, setTurno] = useState(null)\n  const [intervenciones, setIntervenciones] = useState([])\n\n  function anadirOrador(nombre) {\n    setOradores([...oradores, { id: nuevoId(), nombre }])\n  }\n\n  function quitarOrador(id) {\n    setOradores(oradores.filter((orador) => orador.id !== id))\n  }\n\n  function terminarTurno(segundos) {\n    const orden = intervenciones.length + 1\n    setIntervenciones([...intervenciones, { orden, nombre: turno.nombre, segundos }])\n    setTurno(null)\n  }\n\n  // La sesión empieza cuando alguien toma la palabra por primera vez\n  const empezada = turno !== null || intervenciones.length > 0\n\n  return (\n    <>\n      {empezada ? (\n        <RelojSesion numero={numero} />\n      ) : (\n        <p className=\"reloj\">Sesión {numero} · empieza con el primer turno</p>\n      )}\n      {turno && <Turno key={turno.id} orador={turno} onTerminar={terminarTurno} />}\n      <Oradores\n        oradores={oradores}\n        hayTurno={turno !== null}\n        onDarPalabra={setTurno}\n        onQuitar={quitarOrador}\n        onAnadir={anadirOrador}\n      />\n      <section className=\"intervenciones\">\n        <h2>Intervenciones</h2>\n        {intervenciones.length === 0 ? (\n          <p>Todavía no ha hablado nadie.</p>\n        ) : (\n          <ol>\n            {intervenciones.map((intervencion) => (\n              <li key={intervencion.orden}>\n                {intervencion.nombre} · {formatear(intervencion.segundos)}\n              </li>\n            ))}\n          </ol>\n        )}\n      </section>\n    </>\n  )\n}\n\nexport default function App() {\n  // «Nueva sesión» cambia la key de Sesion: todo vuelve a empezar (lección 26)\n  const [numero, setNumero] = useState(1)\n\n  return (\n    <main>\n      <header className=\"cabecera\">\n        <h1>Contrapunto · Moderación</h1>\n        <button onClick={() => setNumero(numero + 1)}>Nueva sesión</button>\n        <p className=\"mocion\">\n          Moción: «Los institutos deberían cambiar los deberes por proyectos»\n        </p>\n      </header>\n      <Sesion key={numero} numero={numero} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Oradores.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction FilaOrador({ orador, hayTurno, onDarPalabra, onQuitar }) {\n  // Lo que apunta quien modera mientras escucha\n  const [nota, setNota] = useState('')\n\n  return (\n    <li className=\"orador\">\n      <span className=\"nombre\">{orador.nombre}</span>\n      <label>\n        Notas sobre {orador.nombre}\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button\n          disabled={hayTurno}\n          aria-label={`Dar la palabra a ${orador.nombre}`}\n          onClick={() => onDarPalabra(orador)}\n        >\n          Dar la palabra\n        </button>\n        <button aria-label={`Quitar a ${orador.nombre}`} onClick={() => onQuitar(orador.id)}>\n          Quitar\n        </button>\n      </div>\n    </li>\n  )\n}\n\nfunction FormularioOrador({ onAnadir }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    onAnadir(nombre.trim())\n    setNombre('')\n  }\n\n  return (\n    <form className=\"nuevo\" onSubmit={manejarEnvio}>\n      <label>\n        Nuevo orador\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function Oradores({ oradores, hayTurno, onDarPalabra, onQuitar, onAnadir }) {\n  return (\n    <section className=\"oradores\">\n      <h2>Orden de palabra</h2>\n      <ul>\n        {oradores.map((orador) => (\n          <FilaOrador\n            key={orador.id}\n            orador={orador}\n            hayTurno={hayTurno}\n            onDarPalabra={onDarPalabra}\n            onQuitar={onQuitar}\n          />\n        ))}\n      </ul>\n      <FormularioOrador onAnadir={onAnadir} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Turno.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { TIEMPO_POR_TURNO, formatear } from './datos'\n\n// El turno de quien tiene la palabra: su cronómetro, que se puede pausar\nexport default function Turno({ orador, onTerminar }) {\n  const [segundos, setSegundos] = useState(0)\n  const [enMarcha, setEnMarcha] = useState(true)\n\n  useEffect(() => {\n    if (!enMarcha) return\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [enMarcha])\n\n  const agotado = segundos >= TIEMPO_POR_TURNO\n\n  return (\n    <section className={agotado ? 'turno agotado' : 'turno'} aria-labelledby=\"turno-titulo\">\n      <h2 id=\"turno-titulo\">Tiene la palabra {orador.nombre}</h2>\n      <p className=\"crono\">\n        {formatear(segundos)} de {formatear(TIEMPO_POR_TURNO)}\n      </p>\n      {agotado && <p role=\"alert\">¡Tiempo!</p>}\n      <div className=\"acciones\">\n        <button onClick={() => setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n        <button onClick={() => onTerminar(segundos)}>Terminar turno</button>\n      </div>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "RelojSesion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { formatear } from './datos'\n\n// Cuánto lleva la sesión. Se monta cuando alguien toma la palabra.\nexport default function RelojSesion({ numero }) {\n  const [segundos, setSegundos] = useState(0)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setSegundos(segundos + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Sesión {numero} · {formatear(segundos)}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// El equipo con el que empieza cada sesión\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  { id: 'pablo', nombre: 'Pablo' },\n  { id: 'marta', nombre: 'Marta' },\n  { id: 'hugo', nombre: 'Hugo' },\n]\n\n// En la liga, cada turno dura tres minutos. Aquí, tres segundos: así ves qué\n// pasa cuando se agota sin quedarte esperando.\nexport const TIEMPO_POR_TURNO = 3\n\nlet nuevos = 0\n\n// Un id para cada orador que se añade: nuevo-1, nuevo-2...\nexport function nuevoId() {\n  nuevos += 1\n  return `nuevo-${nuevos}`\n}\n\n// 75 → «1:15»\nexport function formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f3f0e8;\n  color: #23262d;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  display: grid;\n  gap: 1rem;\n  max-width: 40rem;\n  margin: 0 auto;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 3px solid #1f3a5f;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: #1f3a5f;\n}\n\n.mocion {\n  flex-basis: 100%;\n  margin: 0;\n  color: #5b5f66;\n  font-style: italic;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.reloj {\n  margin: 0;\n  font-weight: 600;\n  color: #1f3a5f;\n  font-variant-numeric: tabular-nums;\n}\n\n.turno {\n  padding: 0.75rem 1rem;\n  border: 2px solid #1f3a5f;\n  border-radius: 10px;\n  background: #fff;\n}\n\n.crono {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 2rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n/* Pasado de tiempo: en rojo */\n.turno.agotado {\n  border-color: #b42318;\n  background: #fef3f2;\n}\n\n.turno.agotado .crono,\n[role='alert'] {\n  color: #b42318;\n}\n\n[role='alert'] {\n  margin: 0 0 0.5rem;\n  font-weight: 700;\n}\n\n.oradores ul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.orador {\n  display: grid;\n  grid-template-columns: 4.5rem 1fr auto;\n  align-items: end;\n  gap: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff;\n}\n\n.nombre {\n  align-self: center;\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.85rem;\n  color: #5b5f66;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #b8b1a3;\n  border-radius: 6px;\n  color: #23262d;\n  font: inherit;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 1px solid #1f3a5f;\n  border-radius: 999px;\n  background: #1f3a5f;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cabecera button,\n.acciones button + button {\n  background: transparent;\n  color: #1f3a5f;\n}\n\nbutton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.nuevo {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n\n.intervenciones ol {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\n@media (max-width: 34rem) {\n  .orador {\n    grid-template-columns: 1fr;\n  }\n}\n"
    }
  ],
  "archivoInicial": "RelojSesion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "El reloj de la sesión arranca con el primer turno: «Sesión 1 · 0:00»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:00"
      }
    },
    {
      "descripcion": "El reloj de la sesión pasa de 0:01 a 0:02",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:01"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:02"
      }
    },
    {
      "descripcion": "Y sigue contando: llega a 0:03",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:01"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:02"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:03"
      }
    },
    {
      "descripcion": "Sigue contando aunque termine el turno",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:01"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:02"
      }
    },
    {
      "descripcion": "Cuando el turno marca 0:01, la sesión también marca 0:01",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:01"
      }
    }
  ]
}
```

**Qué ha pasado.** El registro tiene las tres líneas de `RelojSesion` en el commit en que empieza la sesión (montaje, limpieza y repetición de `StrictMode`) y **ninguna más**: el efecto no se vuelve a ejecutar nunca, porque su lista de dependencias está vacía. En el árbol, `RelojSesion` se vuelve a renderizar una sola vez, al primer segundo, con «cambió su estado» y el contador en `·2`. Desde ese momento sale «sin cambios» en cada commit del turno, y el `·2` ya no se mueve.

Las dos cosas juntas cuentan la historia. El intervalo es siempre el mismo, el que creó el efecto en el primer render, y su función **ve el `segundos` de ese render, que valía 0**. Cada segundo llama a `setSegundos(0 + 1)`. La primera vez, el estado pasa de 0 a 1 y `RelojSesion` se renderiza. Las siguientes, React recibe un 1 cuando ya tiene un 1, no hay nada que cambiar y no renderiza nada. Es la instantánea de la lección 18, congelada para siempre, como el taxímetro de la lección 42.

**El arreglo**: que el intervalo no necesite leer `segundos`. La función actualizadora de la lección 19 recibe el valor más reciente cada vez:

```jsx
setSegundos((s) => s + 1)
```

Este es el único de los cinco que el linter habría cazado. Con `eslint-plugin-react-hooks` 7.1.1 y su configuración recomendada, la regla `exhaustive-deps` dice sobre este archivo:

```text
React Hook useEffect has a missing dependency: 'segundos'. Either include it or remove the dependency array. You can also do a functional update 'setSegundos(s => ...)' if you only need 'segundos' in the 'setSegundos' call
```

Es decir: al efecto le falta la dependencia `segundos`; añádela o quita el array. También puedes usar una actualización funcional, `setSegundos(s => ...)`, si solo necesitas `segundos` para llamar a `setSegundos`. La última frase es el arreglo.

**¿Y la primera salida que propone?** Con `[segundos]` en el array, el reloj también cuenta y pasa las comprobaciones: en pantalla no se distingue. En el registro sí. Cada segundo salen `RelojSesion ⟲ limpieza` y `RelojSesion ▶ efecto · cambió segundos: 0 → 1`, luego `1 → 2`... **El intervalo se destruye y se crea en cada tic**. Funciona, pero no es lo que querías decir: es la versión honesta del taxímetro de la lección 42, y la función actualizadora la mejora.

La última comprobación es para otra salida a medias: escribir la función actualizadora y, de paso, quitar la limpieza. Sería el bug 3 en otro reloj, y `StrictMode` lo delataría igual: la sesión iría al doble que el turno.

## Bug 5: «Too many re-renders» al acabarse el tiempo

**El síntoma.** Todo va bien hasta que un turno llega a 0:03. En ese instante desaparece el panel entero, lista y relojes incluidos, y la vista previa enseña el recuadro de error:

```text
Error al renderizar: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Es decir: demasiados renders seguidos; React los limita para no quedarse en un bucle infinito. Lo conoces de las lecciones 15 y 64: alguien llama a un `set` mientras React renderiza.

**La herramienta: el recuadro de error... que esta vez no dice dónde.** En la lección 53 el recuadro terminaba con «— App.jsx, línea 23». Aquí no hay archivo ni línea, porque el error no lo lanza tu código: lo lanza React desde el bucle que vuelve a llamar a tu componente, cuando tu función ya ha terminado. Lo comprobamos leyendo la pila de este error: diez funciones, todas de React. Te quedan dos pistas, y bastan. **Cuándo** pasa: justo al llegar a 0:03, así que busca en el código que mira el límite. Y **qué dice** el mensaje: renders sin fin, así que busca un `set` que se ejecute al renderizar, no dentro de un manejador ni de un efecto. El árbol de renders confirma lo demás: su último commit tiene todos los componentes desmontados, porque nadie capturó el error y React tiró la app entera (lección 53).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Bug 5: «Too many re-renders» al acabarse el tiempo",
  "consigna": "Da la palabra a Lucía y espera a 0:03. Cuando salga el recuadro, mira el último commit del árbol. Busca en Turno.jsx un set que se ejecute al renderizar y arréglalo. Al editar el código, la vista previa vuelve a empezar sola. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { EQUIPO, formatear, nuevoId } from './datos'\nimport Oradores from './Oradores'\nimport RelojSesion from './RelojSesion'\nimport Turno from './Turno'\nimport './estilos.css'\n\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n  const [turno, setTurno] = useState(null)\n  const [intervenciones, setIntervenciones] = useState([])\n\n  function anadirOrador(nombre) {\n    setOradores([...oradores, { id: nuevoId(), nombre }])\n  }\n\n  function quitarOrador(id) {\n    setOradores(oradores.filter((orador) => orador.id !== id))\n  }\n\n  function terminarTurno(segundos) {\n    const orden = intervenciones.length + 1\n    setIntervenciones([...intervenciones, { orden, nombre: turno.nombre, segundos }])\n    setTurno(null)\n  }\n\n  // La sesión empieza cuando alguien toma la palabra por primera vez\n  const empezada = turno !== null || intervenciones.length > 0\n\n  return (\n    <>\n      {empezada ? (\n        <RelojSesion numero={numero} />\n      ) : (\n        <p className=\"reloj\">Sesión {numero} · empieza con el primer turno</p>\n      )}\n      {turno && <Turno key={turno.id} orador={turno} onTerminar={terminarTurno} />}\n      <Oradores\n        oradores={oradores}\n        hayTurno={turno !== null}\n        onDarPalabra={setTurno}\n        onQuitar={quitarOrador}\n        onAnadir={anadirOrador}\n      />\n      <section className=\"intervenciones\">\n        <h2>Intervenciones</h2>\n        {intervenciones.length === 0 ? (\n          <p>Todavía no ha hablado nadie.</p>\n        ) : (\n          <ol>\n            {intervenciones.map((intervencion) => (\n              <li key={intervencion.orden}>\n                {intervencion.nombre} · {formatear(intervencion.segundos)}\n              </li>\n            ))}\n          </ol>\n        )}\n      </section>\n    </>\n  )\n}\n\nexport default function App() {\n  // «Nueva sesión» cambia la key de Sesion: todo vuelve a empezar (lección 26)\n  const [numero, setNumero] = useState(1)\n\n  return (\n    <main>\n      <header className=\"cabecera\">\n        <h1>Contrapunto · Moderación</h1>\n        <button onClick={() => setNumero(numero + 1)}>Nueva sesión</button>\n        <p className=\"mocion\">\n          Moción: «Los institutos deberían cambiar los deberes por proyectos»\n        </p>\n      </header>\n      <Sesion key={numero} numero={numero} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Oradores.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction FilaOrador({ orador, hayTurno, onDarPalabra, onQuitar }) {\n  // Lo que apunta quien modera mientras escucha\n  const [nota, setNota] = useState('')\n\n  return (\n    <li className=\"orador\">\n      <span className=\"nombre\">{orador.nombre}</span>\n      <label>\n        Notas sobre {orador.nombre}\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button\n          disabled={hayTurno}\n          aria-label={`Dar la palabra a ${orador.nombre}`}\n          onClick={() => onDarPalabra(orador)}\n        >\n          Dar la palabra\n        </button>\n        <button aria-label={`Quitar a ${orador.nombre}`} onClick={() => onQuitar(orador.id)}>\n          Quitar\n        </button>\n      </div>\n    </li>\n  )\n}\n\nfunction FormularioOrador({ onAnadir }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    onAnadir(nombre.trim())\n    setNombre('')\n  }\n\n  return (\n    <form className=\"nuevo\" onSubmit={manejarEnvio}>\n      <label>\n        Nuevo orador\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function Oradores({ oradores, hayTurno, onDarPalabra, onQuitar, onAnadir }) {\n  return (\n    <section className=\"oradores\">\n      <h2>Orden de palabra</h2>\n      <ul>\n        {oradores.map((orador) => (\n          <FilaOrador\n            key={orador.id}\n            orador={orador}\n            hayTurno={hayTurno}\n            onDarPalabra={onDarPalabra}\n            onQuitar={onQuitar}\n          />\n        ))}\n      </ul>\n      <FormularioOrador onAnadir={onAnadir} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Turno.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { TIEMPO_POR_TURNO, formatear } from './datos'\n\n// El turno de quien tiene la palabra: su cronómetro, que se puede pausar\nexport default function Turno({ orador, onTerminar }) {\n  const [segundos, setSegundos] = useState(0)\n  const [enMarcha, setEnMarcha] = useState(true)\n  const [agotado, setAgotado] = useState(false)\n\n  useEffect(() => {\n    if (!enMarcha) return\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [enMarcha])\n\n  // Al pasarse del tiempo, se marca el turno como agotado\n  if (segundos >= TIEMPO_POR_TURNO) {\n    setAgotado(true)\n  }\n\n  return (\n    <section className={agotado ? 'turno agotado' : 'turno'} aria-labelledby=\"turno-titulo\">\n      <h2 id=\"turno-titulo\">Tiene la palabra {orador.nombre}</h2>\n      <p className=\"crono\">\n        {formatear(segundos)} de {formatear(TIEMPO_POR_TURNO)}\n      </p>\n      {agotado && <p role=\"alert\">¡Tiempo!</p>}\n      <div className=\"acciones\">\n        <button onClick={() => setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n        <button onClick={() => onTerminar(segundos)}>Terminar turno</button>\n      </div>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "RelojSesion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { formatear } from './datos'\n\n// Cuánto lleva la sesión. Se monta cuando alguien toma la palabra.\nexport default function RelojSesion({ numero }) {\n  const [segundos, setSegundos] = useState(0)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Sesión {numero} · {formatear(segundos)}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// El equipo con el que empieza cada sesión\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  { id: 'pablo', nombre: 'Pablo' },\n  { id: 'marta', nombre: 'Marta' },\n  { id: 'hugo', nombre: 'Hugo' },\n]\n\n// En la liga, cada turno dura tres minutos. Aquí, tres segundos: así ves qué\n// pasa cuando se agota sin quedarte esperando.\nexport const TIEMPO_POR_TURNO = 3\n\nlet nuevos = 0\n\n// Un id para cada orador que se añade: nuevo-1, nuevo-2...\nexport function nuevoId() {\n  nuevos += 1\n  return `nuevo-${nuevos}`\n}\n\n// 75 → «1:15»\nexport function formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f3f0e8;\n  color: #23262d;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  display: grid;\n  gap: 1rem;\n  max-width: 40rem;\n  margin: 0 auto;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 3px solid #1f3a5f;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: #1f3a5f;\n}\n\n.mocion {\n  flex-basis: 100%;\n  margin: 0;\n  color: #5b5f66;\n  font-style: italic;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.reloj {\n  margin: 0;\n  font-weight: 600;\n  color: #1f3a5f;\n  font-variant-numeric: tabular-nums;\n}\n\n.turno {\n  padding: 0.75rem 1rem;\n  border: 2px solid #1f3a5f;\n  border-radius: 10px;\n  background: #fff;\n}\n\n.crono {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 2rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n/* Pasado de tiempo: en rojo */\n.turno.agotado {\n  border-color: #b42318;\n  background: #fef3f2;\n}\n\n.turno.agotado .crono,\n[role='alert'] {\n  color: #b42318;\n}\n\n[role='alert'] {\n  margin: 0 0 0.5rem;\n  font-weight: 700;\n}\n\n.oradores ul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.orador {\n  display: grid;\n  grid-template-columns: 4.5rem 1fr auto;\n  align-items: end;\n  gap: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff;\n}\n\n.nombre {\n  align-self: center;\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.85rem;\n  color: #5b5f66;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #b8b1a3;\n  border-radius: 6px;\n  color: #23262d;\n  font: inherit;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 1px solid #1f3a5f;\n  border-radius: 999px;\n  background: #1f3a5f;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cabecera button,\n.acciones button + button {\n  background: transparent;\n  color: #1f3a5f;\n}\n\nbutton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.nuevo {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n\n.intervenciones ol {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\n@media (max-width: 34rem) {\n  .orador {\n    grid-template-columns: 1fr;\n  }\n}\n"
    }
  ],
  "archivoInicial": "Turno.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "mostrarEfectos": false,
  "comprobaciones": [
    {
      "descripcion": "Antes de llegar a 0:03 no sale «¡Tiempo!»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "texto": "0:02 de 0:03"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert",
          "texto": "¡Tiempo!"
        }
      }
    },
    {
      "descripcion": "Al llegar a 0:03 sale «¡Tiempo!», y el panel sigue en pie",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "texto": "0:02 de 0:03"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "¡Tiempo!"
      }
    },
    {
      "descripcion": "Pasado el límite, el cronómetro sigue contando: llega a 0:04",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "texto": "0:02 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "¡Tiempo!"
          }
        }
      ],
      "espera": {
        "texto": "0:04 de 0:03"
      }
    },
    {
      "descripcion": "Con el tiempo agotado, «Terminar turno» apunta «Lucía · 0:03»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "texto": "0:02 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "¡Tiempo!"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lucía · 0:03"
      }
    },
    {
      "descripcion": "El turno siguiente empieza sin «¡Tiempo!»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "texto": "0:02 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "¡Tiempo!"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Pablo"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert",
          "texto": "¡Tiempo!"
        }
      }
    }
  ]
}
```

**Qué ha pasado.** El código que mira el límite es este:

```jsx
const [agotado, setAgotado] = useState(false)
// ...
// Al pasarse del tiempo, se marca el turno como agotado
if (segundos >= TIEMPO_POR_TURNO) {
  setAgotado(true)
}
```

Un `set` durante el render no está prohibido: React descarta lo que iba a devolver el componente y lo vuelve a llamar en el acto, antes de tocar el DOM. La lección 39 lo usa para ajustar el estado cuando cambia una prop. Pero hay una regla: **la condición del `if` tiene que dejar de cumplirse después del `set`**. Aquí no deja de cumplirse. En la siguiente vuelta, `segundos` sigue valiendo 3, la condición sigue siendo cierta y se vuelve a llamar a `setAgotado(true)`. Que `agotado` ya valga `true` no importa: cada `set` durante el render pide otra vuelta. A las 25 vueltas seguidas, React corta y lanza el error. Antes de 0:03 la condición era falsa y el `set` no se ejecutaba: por eso el bug esperó tres segundos.

Lo que hace que el patrón de la lección 39 sí funcione es que lo que se pone en el `set` desactiva la condición. Compruébalo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [segundos, setSegundos] = useState(0)\nconst [agotado, setAgotado] = useState(false)\n// ...el intervalo suma un segundo cada segundo\n\nif (segundos >= TIEMPO_POR_TURNO && !agotado) {\n  setAgotado(true)\n}\n\n// El turno llega a 0:03. ¿Qué pasa?",
  "opciones": [
    "Lo mismo: «Too many re-renders»",
    "Sale «¡Tiempo!» y el panel sigue en pie",
    "No sale nunca «¡Tiempo!»: el && lo impide",
    "React avisa en la consola de un set durante el render, pero funciona"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. En la primera vuelta, agotado es false: se llama a setAgotado(true). En la segunda, agotado ya es true y la condición es falsa: no hay más set, y el render termina. En el árbol, Turno sale con un solo re-render y dos motivos: cambió su estado n.º 1 y n.º 3. Funciona, aunque sigue siendo un estado que no hace falta."
}
```

**El arreglo.** `agotado` no necesita ser estado: sale de `segundos` en cada render. Es estado redundante (lección 24), y lo que se puede calcular durante el render se calcula (lección 39):

```jsx
const agotado = segundos >= TIEMPO_POR_TURNO
```

Sin `useState`, sin `set` y sin nada que se pueda desincronizar: `agotado` vale siempre lo que dice `segundos`. Las comprobaciones miran también lo que viene después del aviso: que el cronómetro siga contando pasado el límite, que «Terminar turno» apunte la intervención y que el turno de Pablo empiece sin «¡Tiempo!».

**El linter tampoco lo habría visto.** `eslint-plugin-react-hooks` 7.1.1 tiene una regla para esto, `set-state-in-render`, activada en su configuración recomendada. Lo comprobamos: marca un `set` suelto en el cuerpo del componente con «Cannot call setState during render», pero este va dentro de un `if`, como el patrón válido de la lección 39, y la regla lo deja pasar sin un aviso.

## La caza completa: los cinco a la vez

Ahora sin red. Este es el panel con cinco bugs sembrados a la vez. Son los mismos cinco clásicos, pero **no todos están en el mismo sitio ni tienen la misma forma** que en los pasos: no copies los arreglos de arriba, caza. Los tres paneles están encendidos: árbol, registro de efectos y consola.

Trabaja con el método. Prueba el panel con la lista de «Lo que tiene que hacer el panel», apunta cada síntoma, elige uno, mira la herramienta que le toca, explica la causa en una frase y arregla solo eso. Después, el siguiente. Si algo revienta, empieza por ahí: con la app en el suelo no hay nada más que mirar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La caza completa: los cinco a la vez",
  "consigna": "Cinco bugs, sin pistas sobre dónde están. Prueba las notas, «Añadir», «Nueva sesión», «Dar la palabra», «Pausar» y los dos relojes, y compáralo con lo que tiene que hacer el panel. Cada comprobación mira un comportamiento; cuando pasen las ocho, no queda ninguno.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { EQUIPO, formatear, nuevoId } from './datos'\nimport Oradores from './Oradores'\nimport RelojSesion from './RelojSesion'\nimport Turno from './Turno'\nimport './estilos.css'\n\nfunction Sesion({ numero }) {\n  const [oradores, setOradores] = useState(EQUIPO)\n  const [turno, setTurno] = useState(null)\n  const [intervenciones, setIntervenciones] = useState([])\n\n  function anadirOrador(nombre) {\n    oradores.push({ id: nuevoId(), nombre })\n    setOradores(oradores)\n  }\n\n  function quitarOrador(id) {\n    setOradores(oradores.filter((orador) => orador.id !== id))\n  }\n\n  function terminarTurno(segundos) {\n    const orden = intervenciones.length + 1\n    setIntervenciones([...intervenciones, { orden, nombre: turno.nombre, segundos }])\n    setTurno(null)\n  }\n\n  // La sesión empieza cuando alguien toma la palabra por primera vez\n  const empezada = turno !== null || intervenciones.length > 0\n\n  return (\n    <>\n      {empezada ? (\n        <RelojSesion numero={numero} />\n      ) : (\n        <p className=\"reloj\">Sesión {numero} · empieza con el primer turno</p>\n      )}\n      {turno && <Turno key={turno.id} orador={turno} onTerminar={terminarTurno} />}\n      <Oradores\n        oradores={oradores}\n        hayTurno={turno !== null}\n        onDarPalabra={setTurno}\n        onQuitar={quitarOrador}\n        onAnadir={anadirOrador}\n      />\n      <section className=\"intervenciones\">\n        <h2>Intervenciones</h2>\n        {intervenciones.length === 0 ? (\n          <p>Todavía no ha hablado nadie.</p>\n        ) : (\n          <ol>\n            {intervenciones.map((intervencion) => (\n              <li key={intervencion.orden}>\n                {intervencion.nombre} · {formatear(intervencion.segundos)}\n              </li>\n            ))}\n          </ol>\n        )}\n      </section>\n    </>\n  )\n}\n\nexport default function App() {\n  // «Nueva sesión» cambia la key de Sesion: todo vuelve a empezar (lección 26)\n  const [numero, setNumero] = useState(1)\n\n  return (\n    <main>\n      <header className=\"cabecera\">\n        <h1>Contrapunto · Moderación</h1>\n        <button onClick={() => setNumero(numero + 1)}>Nueva sesión</button>\n        <p className=\"mocion\">\n          Moción: «Los institutos deberían cambiar los deberes por proyectos»\n        </p>\n      </header>\n      <Sesion key={numero} numero={numero} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Oradores.jsx",
      "codigo": "import { useState } from 'react'\n\nfunction FilaOrador({ orador, hayTurno, onDarPalabra, onQuitar }) {\n  // Lo que apunta quien modera mientras escucha\n  const [nota, setNota] = useState('')\n\n  return (\n    <li className=\"orador\">\n      <span className=\"nombre\">{orador.nombre}</span>\n      <label>\n        Notas sobre {orador.nombre}\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button\n          disabled={hayTurno}\n          aria-label={`Dar la palabra a ${orador.nombre}`}\n          onClick={() => onDarPalabra(orador)}\n        >\n          Dar la palabra\n        </button>\n        <button aria-label={`Quitar a ${orador.nombre}`} onClick={() => onQuitar(orador.id)}>\n          Quitar\n        </button>\n      </div>\n    </li>\n  )\n}\n\nfunction FormularioOrador({ onAnadir }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    onAnadir(nombre.trim())\n    setNombre('')\n  }\n\n  return (\n    <form className=\"nuevo\" onSubmit={manejarEnvio}>\n      <label>\n        Nuevo orador\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nexport default function Oradores({ oradores, hayTurno, onDarPalabra, onQuitar, onAnadir }) {\n  return (\n    <section className=\"oradores\">\n      <h2>Orden de palabra</h2>\n      <ul>\n        {oradores.map((orador, indice) => (\n          <FilaOrador\n            key={indice}\n            orador={orador}\n            hayTurno={hayTurno}\n            onDarPalabra={onDarPalabra}\n            onQuitar={onQuitar}\n          />\n        ))}\n      </ul>\n      <FormularioOrador onAnadir={onAnadir} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Turno.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { TIEMPO_POR_TURNO, formatear } from './datos'\n\n// El turno de quien tiene la palabra: su cronómetro, que se puede pausar\nexport default function Turno({ orador, onTerminar }) {\n  const [segundos, setSegundos] = useState(0)\n  const [enMarcha, setEnMarcha] = useState(true)\n\n  useEffect(() => {\n    if (!enMarcha) return\n    const id = setInterval(() => {\n      setSegundos(segundos + 1)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [enMarcha])\n\n  const agotado = segundos >= TIEMPO_POR_TURNO\n\n  return (\n    <section className={agotado ? 'turno agotado' : 'turno'} aria-labelledby=\"turno-titulo\">\n      <h2 id=\"turno-titulo\">Tiene la palabra {orador.nombre}</h2>\n      <p className=\"crono\">\n        {formatear(segundos)} de {formatear(TIEMPO_POR_TURNO)}\n      </p>\n      {agotado && <p role=\"alert\">¡Tiempo!</p>}\n      <div className=\"acciones\">\n        <button onClick={setEnMarcha(!enMarcha)}>{enMarcha ? 'Pausar' : 'Reanudar'}</button>\n        <button onClick={() => onTerminar(segundos)}>Terminar turno</button>\n      </div>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "RelojSesion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { formatear } from './datos'\n\n// Cuánto lleva la sesión. Se monta cuando alguien toma la palabra.\nexport default function RelojSesion({ numero }) {\n  const [segundos, setSegundos] = useState(0)\n\n  useEffect(() => {\n    setInterval(() => {\n      setSegundos((s) => s + 1)\n    }, 1000)\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Sesión {numero} · {formatear(segundos)}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// El equipo con el que empieza cada sesión\nexport const EQUIPO = [\n  { id: 'lucia', nombre: 'Lucía' },\n  { id: 'pablo', nombre: 'Pablo' },\n  { id: 'marta', nombre: 'Marta' },\n  { id: 'hugo', nombre: 'Hugo' },\n]\n\n// En la liga, cada turno dura tres minutos. Aquí, tres segundos: así ves qué\n// pasa cuando se agota sin quedarte esperando.\nexport const TIEMPO_POR_TURNO = 3\n\nlet nuevos = 0\n\n// Un id para cada orador que se añade: nuevo-1, nuevo-2...\nexport function nuevoId() {\n  nuevos += 1\n  return `nuevo-${nuevos}`\n}\n\n// 75 → «1:15»\nexport function formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f3f0e8;\n  color: #23262d;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  display: grid;\n  gap: 1rem;\n  max-width: 40rem;\n  margin: 0 auto;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding-bottom: 0.75rem;\n  border-bottom: 3px solid #1f3a5f;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.5rem;\n  color: #1f3a5f;\n}\n\n.mocion {\n  flex-basis: 100%;\n  margin: 0;\n  color: #5b5f66;\n  font-style: italic;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.reloj {\n  margin: 0;\n  font-weight: 600;\n  color: #1f3a5f;\n  font-variant-numeric: tabular-nums;\n}\n\n.turno {\n  padding: 0.75rem 1rem;\n  border: 2px solid #1f3a5f;\n  border-radius: 10px;\n  background: #fff;\n}\n\n.crono {\n  margin: 0.25rem 0 0.5rem;\n  font-size: 2rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n/* Pasado de tiempo: en rojo */\n.turno.agotado {\n  border-color: #b42318;\n  background: #fef3f2;\n}\n\n.turno.agotado .crono,\n[role='alert'] {\n  color: #b42318;\n}\n\n[role='alert'] {\n  margin: 0 0 0.5rem;\n  font-weight: 700;\n}\n\n.oradores ul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.orador {\n  display: grid;\n  grid-template-columns: 4.5rem 1fr auto;\n  align-items: end;\n  gap: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff;\n}\n\n.nombre {\n  align-self: center;\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.85rem;\n  color: #5b5f66;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #b8b1a3;\n  border-radius: 6px;\n  color: #23262d;\n  font: inherit;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  border: 1px solid #1f3a5f;\n  border-radius: 999px;\n  background: #1f3a5f;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\n.cabecera button,\n.acciones button + button {\n  background: transparent;\n  color: #1f3a5f;\n}\n\nbutton:disabled {\n  opacity: 0.45;\n  cursor: not-allowed;\n}\n\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.nuevo {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-top: 0.75rem;\n}\n\n.intervenciones ol {\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\n@media (max-width: 34rem) {\n  .orador {\n    grid-template-columns: 1fr;\n  }\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al quitar a Lucía, lo que escribiste sobre Pablo sigue en «Notas sobre Pablo»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas sobre Pablo",
            "texto": "Cita el informe PISA"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Lucía"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas sobre Pablo",
        "valor": "Cita el informe PISA"
      }
    },
    {
      "descripcion": "Al añadir a Nerea, aparece al final del orden de palabra",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Nerea"
      }
    },
    {
      "descripcion": "«Nueva sesión» vuelve a empezar con el equipo de siempre: Nerea ya no está",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nuevo orador",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Nerea"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Nueva sesión"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Nerea"
        }
      }
    },
    {
      "descripcion": "Cuando el turno marca 0:01, la sesión también marca 0:01",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:01"
      }
    },
    {
      "descripcion": "El reloj de la sesión pasa de 0:01 a 0:02",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:01"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 1 · 0:02"
      }
    },
    {
      "descripcion": "El turno avanza un segundo por segundo: si lo terminas al marcar 0:01, se apunta «Lucía · 0:01»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Terminar turno"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lucía · 0:01"
      }
    },
    {
      "descripcion": "«Pausar» para el turno: dos segundos después, sigue en 0:01",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pausar"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:02"
          }
        },
        {
          "pulsar": {
            "texto": "Sesión 1 · 0:03"
          }
        }
      ],
      "espera": {
        "texto": "0:01 de 0:03"
      }
    },
    {
      "descripcion": "Al llegar a 0:03 sale «¡Tiempo!», y el panel sigue en pie",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dar la palabra a Lucía"
          }
        },
        {
          "pulsar": {
            "texto": "0:01 de 0:03"
          }
        },
        {
          "pulsar": {
            "texto": "0:02 de 0:03"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "¡Tiempo!"
      }
    }
  ]
}
```

### Dónde estaban

Léelo cuando hayas terminado, o cuando lleves un buen rato atascado con uno.

1. **`Oradores.jsx`: la `key` con el índice**, igual que en el bug 1. El árbol lo delata al quitar a Lucía: `FilaOrador key=3` · desmontado. Arreglo: `key={orador.id}`.
2. **`App.jsx`: el `push`**, igual que en el bug 2. Al añadir, solo `FormularioOrador` se renderiza, y el estado de `Sesion` dice [5 elementos]. Arreglo: `setOradores([...oradores, { id: nuevoId(), nombre }])`.
3. **`Turno.jsx`: un `set` durante el render, con otra forma.** Al dar la palabra, el panel cae con «Too many re-renders» en el acto, no a los tres segundos. El culpable es el botón de pausa: `onClick={setEnMarcha(!enMarcha)}` llama a `setEnMarcha` al renderizar, en lugar de pasarle una función a `onClick` (lección 15). Y como cada vuelta cambia `enMarcha` de `true` a `false` y al revés, nunca llega un render que no pida otro. Arreglo: `onClick={() => setEnMarcha(!enMarcha)}`. Esta forma sí la marca el linter: es un `set` suelto en el render, y `set-state-in-render` dice «Cannot call setState during render».
4. **`RelojSesion.jsx`: el intervalo sin limpieza, en el otro reloj.** Con el panel en pie, el reloj de la sesión avanza dos segundos por cada segundo de verdad. El registro lo cuenta como en el bug 3, ahora en `RelojSesion`: dos efectos y ninguna limpieza en el commit en que empieza la sesión. Arreglo: guardar el id y devolver `() => clearInterval(id)`.
5. **`Turno.jsx`: el cierre obsoleto, en el otro reloj.** El cronómetro del turno se queda en 0:01. Aquí el efecto depende de `[enMarcha]`, así que vuelve a ejecutarse al pausar y reanudar, y cada vez estrena una foto nueva: tras «Reanudar» llega a 0:02 y se vuelve a quedar quieto. El registro enseña el efecto solo al montar, al pausar y al reanudar, nunca entre medias; el árbol, a `Turno` «sin cambios» en cada segundo. Arreglo: `setSegundos((s) => s + 1)`.

Fíjate en cómo se tapaban unos a otros. Mientras el panel caía al dar la palabra, los dos relojes no se podían ni mirar. Y mientras el turno se quedaba en 0:01, «¡Tiempo!» no llegaba nunca, así que no había forma de saber si el aviso funcionaba. **Arreglar uno destapa el siguiente**: por eso se va de uno en uno, y se comprueba cada vez.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Los cinco, en el árbol del panel",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0
    },
    {
      "nombre": "Sesion",
      "nivel": 1,
      "clave": "numero",
      "etiqueta": "push",
      "nota": "← «Añadir» no repinta y cambia el EQUIPO de todas las sesiones"
    },
    {
      "nombre": "RelojSesion",
      "nivel": 2,
      "etiqueta": "sin limpieza",
      "nota": "← StrictMode deja dos intervalos: va al doble"
    },
    {
      "nombre": "Turno",
      "nivel": 2,
      "clave": "turno.id",
      "etiqueta": "set en el render · cierre obsoleto",
      "nota": "← cae al montarse; arreglado eso, se queda en 0:01"
    },
    {
      "nombre": "Oradores",
      "nivel": 2
    },
    {
      "nombre": "FilaOrador",
      "nivel": 3,
      "clave": "indice",
      "etiqueta": "key con el índice",
      "nota": "← la nota se queda en la posición"
    },
    {
      "nombre": "FormularioOrador",
      "nivel": 3
    }
  ]
}
```

## Del síntoma a la herramienta

Lo que te llevas de este proyecto no son cinco arreglos, sino cinco parejas de síntoma y herramienta:

- **Algo salta de una fila a otra de una lista** → el árbol de renders: qué `key` se desmonta y quién recibe props de otro. Casi siempre, una `key` que no identifica al dato.
- **La pantalla no refleja un cambio que el código sí hace** → el árbol (el dueño del estado sale «sin cambios») y su estado al pulsarlo, o un `console.log`. Casi siempre, una mutación.
- **Algo pasa el doble de veces, o sigue pasando cuando ya no debería** → el registro de efectos: efectos sin su `⟲ limpieza`. Casi siempre, falta la limpieza, y `StrictMode` te lo enseña al montar.
- **Algo se queda congelado en un valor viejo** → el registro (el efecto no se repite) y el árbol (el componente no se renderiza). Casi siempre, un cierre obsoleto: una función creada en un render antiguo que lee sus valores.
- **La app desaparece con un mensaje** → el recuadro de error, y si no dice dónde, el momento en que pasa y lo que dice el mensaje. «Too many re-renders» es un `set` que se ejecuta al renderizar.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "En tu proyecto, las React DevTools",
      "texto": "La pestaña Components hace el papel del árbol: props, estado y Hooks de cada componente, y «Highlight updates» para ver qué se renderiza. El Profiler dice por qué se renderizó cada uno (lección 65)."
    },
    {
      "titulo": "Los efectos, con un console.log en cada lado",
      "texto": "Las DevTools no tienen un registro de efectos. Un console.log al empezar el efecto y otro en su limpieza te dan lo mismo: si salen dos efectos seguidos sin limpieza en medio, ya sabes qué buscar."
    },
    {
      "titulo": "StrictMode siempre encendido en desarrollo",
      "texto": "El bug 3 solo se veía al montar gracias a él. Sin StrictMode lo habrías descubierto el día que alguien pulsara «Pausar» en mitad de una liga (lección 63)."
    },
    {
      "titulo": "El linter, sí, pero no basta",
      "texto": "Con la configuración recomendada de eslint-plugin-react-hooks 7.1.1, de los cinco bugs de los pasos solo salta el del cierre obsoleto. El linter caza patrones; los síntomas los cazas tú (lección 70)."
    },
    {
      "titulo": "Un error boundary donde algo puede caer",
      "texto": "El bug 5 se llevó el panel entero. Con un boundary alrededor de Turno, como el LimiteDeError de la lección 53, habría caído solo el turno, con la lista y las notas a salvo."
    }
  ]
}
```

## Errores típicos

**Arreglar el síntoma en vez de la causa.** Es la tentación de cada bug de este proyecto, y siempre se parece a una solución:

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si quito StrictMode, el turno ya cuenta bien",
      "realidad": "Va a su velocidad, pero «Pausar» sigue sin parar nada y cada turno deja un intervalo vivo, como viste en el bug 3. StrictMode no causa el bug: lo adelanta al primer segundo. Y en tu proyecto, StrictMode solo existe en desarrollo: quitarlo no cambia nada de lo que verán tus usuarios."
    },
    {
      "mito": "Un ref que impida repetir el efecto lo arregla",
      "realidad": "Esconde la repetición del ensayo y nada más: el intervalo sigue sin limpieza, y la pausa, sin funcionar. react.dev lo dice con todas las letras: no uses refs para evitar que los efectos se disparen dos veces (lección 38)."
    },
    {
      "mito": "Copiar el array después del push basta",
      "realidad": "Nerea aparece, pero el push ya cambió el array del estado anterior, que aquí era la constante EQUIPO. La sesión siguiente empieza con ella. Primero el array nuevo, sin tocar el viejo."
    },
    {
      "mito": "Si no hay errores ni avisos, no hay bug",
      "realidad": "Cuatro de los cinco no dicen nada en la consola. Y el quinto, el único que da un error, no dice en qué archivo está."
    }
  ]
}
```

**Una `key` inventada en cada render.** Para que se vaya el aviso de las keys sin pensar en los datos, alguien escribe `key={Math.random()}`. Escribir en las notas funciona, y eso despista:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "{oradores.map((orador) => (\n  <FilaOrador\n    key={Math.random()}\n    orador={orador}\n    // ...\n  />\n))}\n\n// Escribes «Cita el informe PISA» en «Notas sobre Pablo» y\n// después añades a Nerea. ¿Qué pasa con tu nota?",
  "opciones": [
    "Sigue junto a Pablo: cada fila tiene una key distinta",
    "Se borra, y con ella todas las demás notas",
    "Salta a la fila de Nerea",
    "React avisa de que hay keys repetidas"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. Mientras escribes, solo se renderiza esa FilaOrador y las keys no cambian. Al añadir, Sesion se renderiza, el map vuelve a correr y cada fila estrena una key que React no ha visto nunca: el árbol enseña las cuatro filas desmontadas y cinco montadas, todas con su nota vacía."
}
```

Una `key` tiene que ser **estable**, además de única: la misma para el mismo dato en cada render. Por eso sale de los datos, no del render (lección 11).

**Mover el `set` a un efecto.** Con `useEffect(() => { if (segundos >= TIEMPO_POR_TURNO) setAgotado(true) }, [segundos])` el bug 5 desaparece y las comprobaciones pasan. Pero el árbol enseña lo que cuesta: al llegar a 0:03, un commit con `Turno` · «cambió su estado n.º 1», en el que todavía no sale «¡Tiempo!», y otro justo después con «cambió su estado n.º 3». Dos commits donde bastaba uno, y un instante con la pantalla mintiendo. Es el caso de la lección 39: lo que se calcula, se calcula durante el render.

**Buscar el bug donde se nota.** El cronómetro corría el doble, pero el fallo no estaba en `formatear` ni en el JSX, sino en el efecto. La nota saltaba en `FilaOrador`, pero el fallo estaba en `Oradores`, en la `key`. El síntoma dice dónde mirar con la herramienta; la herramienta dice dónde está el fallo.

**Cambiar tres cosas a la vez.** Si pruebas tres arreglos juntos y el bug desaparece, no sabes cuál lo arregló, ni si los otros dos han roto algo. Un cambio, una prueba. Es más lento solo en apariencia.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La key identifica al dato, no a la posición",
      "texto": "El estado de cada fila va atado a su key. Con el índice, al quitar una fila se desmonta la última y las demás reciben props de otro. El árbol lo enseña: qué key sale desmontada."
    },
    {
      "titulo": "Un set con el mismo array no hace nada",
      "texto": "React compara con Object.is. Un push y un set del mismo array no renderizan, y además pueden cambiar datos compartidos, como el estado inicial de todas las sesiones."
    },
    {
      "titulo": "Cada efecto que crea algo, lo deshace",
      "texto": "Un intervalo sin clearInterval sigue vivo después de pausar o desmontar. StrictMode lo delata al montar: dos efectos y ninguna limpieza en el registro."
    },
    {
      "titulo": "Un intervalo ve los valores de su render",
      "texto": "Con [] y set(valor + 1), el reloj se queda en el siguiente al primero. La función actualizadora, set((v) => v + 1), no necesita leer nada."
    },
    {
      "titulo": "Un set en el render tiene que apagar su condición",
      "texto": "Si la condición sigue siendo cierta después del set, React vuelve a renderizar hasta 25 veces y lanza «Too many re-renders». Casi siempre, el valor se puede calcular sin estado."
    },
    {
      "titulo": "Síntoma, herramienta, causa, arreglo, comprobación",
      "texto": "Ese orden, un bug cada vez. Arreglar uno destapa el siguiente, y solo una comprobación dice que el arreglo es de verdad."
    }
  ]
}
```

## Retos para seguir practicando

Parte del panel arreglado. Estos no tienen comprobación automática:

1. **Un boundary para el turno.** Envuelve `Turno` en el `LimiteDeError` de la lección 53, con una alternativa que diga «El turno ha fallado» y un botón para cerrarlo. Siembra otra vez el bug 5 y comprueba que, al llegar a 0:03, la lista y las notas siguen en pie.
2. **Subir y bajar en el orden de palabra.** Añade a cada fila «Subir» y «Bajar», sin mutar el array (lección 21). Escribe una nota, cambia el orden y mira en el árbol qué filas se renderizan. Después pon `key={indice}` un momento: ¿qué hace ahora la nota al subir una fila?
3. **El tiempo total de cada orador.** Debajo de «Intervenciones», cuánto ha hablado cada uno en la sesión, sumando sus turnos. ¿Necesitas un estado nuevo, o se calcula durante el render a partir de `intervenciones`? Pista: la lección 24 y el bug 5.
4. **Siembra tu propio bug.** Elige uno de los cinco y escóndelo en otro sitio: por ejemplo, un «Turno de réplica» de 30 segundos con su propio intervalo, o una lista de preguntas del público. Pásale el panel a alguien que haya hecho este proyecto y mira qué herramienta usa para encontrarlo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Rendering Lists: Keeping list items in order with key",
      "descripcion": "De dónde sale la key, sus dos reglas y por qué el índice falla cuando la lista cambia. El bug 1.",
      "url": "https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: Troubleshooting",
      "descripcion": "Los problemas típicos del estado, con dos de este proyecto: la pantalla que no se actualiza tras mutar y el error «Too many re-renders».",
      "url": "https://react.dev/reference/react/useState#troubleshooting",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Synchronizing with Effects: How to handle the Effect firing twice in development?",
      "descripcion": "Por qué StrictMode repite los efectos al montar, cómo se escribe la limpieza y por qué no se esconde la repetición con un ref. Incluye un intervalo que se dispara dos veces.",
      "url": "https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Removing Effect Dependencies: Are you reading some state to calculate the next state?",
      "descripcion": "La función actualizadora como forma de no depender del estado que solo lees para calcular el siguiente. El bug 4.",
      "url": "https://react.dev/learn/removing-effect-dependencies#are-you-reading-some-state-to-calculate-the-next-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<StrictMode>",
      "descripcion": "Qué repite en desarrollo y qué fallos destapa cada repetición, con ejemplos para arreglarlos.",
      "url": "https://react.dev/reference/react/StrictMode",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Developer Tools",
      "descripcion": "La extensión que hace en tu proyecto el papel del árbol de renders de esta web.",
      "url": "https://react.dev/learn/react-developer-tools",
      "etiqueta": "react.dev"
    }
  ]
}
```
