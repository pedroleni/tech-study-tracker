# El ciclo de vida de un efecto reactivo

- **Módulo:** Efectos
- **Slug:** `el-ciclo-de-vida-de-un-efecto-reactivo` (autogenerado del título)
- **Orden:** 400
- **Fuentes:** [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) — ver `contenido/react/TEMARIO.md` #40

---

## Qué es y para qué sirve

En la lección 38 escribiste tus primeros efectos: código que mantiene un componente sincronizado con algo que vive fuera de React, con su función de limpieza y su lista de dependencias. Esta lección no añade ninguna API nueva. Va de **cómo pensar un efecto**, y el cambio de mentalidad cabe en dos frases:

> Un componente se monta, se actualiza y se desmonta. Un efecto solo sabe hacer dos cosas: **empezar a sincronizar algo y dejar de sincronizarlo**, y puede hacerlo muchas veces mientras el componente sigue en pantalla.

Si piensas en «al montar» y «al desmontar», acabas con efectos que se quedan enganchados a lo que había al principio. Si piensas en «empezar y parar», el efecto aguanta todo lo que le eches: que cambie una prop, que `StrictMode` lo repita o que el usuario se vaya y vuelva.

El ejemplo de toda la lección es el panel de **Apícola Los Tomillares**, una explotación de miel de la Alcarria con una báscula conectada bajo cada colmena. El peso lo dice casi todo: si sube, las abejas están metiendo néctar; si baja de golpe, puede que el enjambre se haya ido. El panel se conecta a la báscula de la colmena que eliges.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos ciclos de vida distintos",
  "roles": [
    {
      "etiqueta": "Componente",
      "rol": "Se monta, se actualiza, se desmonta",
      "descripcion": "Aparece en pantalla, se vuelve a renderizar cada vez que cambian sus props o su estado, y un día desaparece. Lo viste en el módulo 3."
    },
    {
      "etiqueta": "Efecto",
      "rol": "Empieza a sincronizar, deja de hacerlo",
      "descripcion": "El cuerpo empieza (conectar, suscribirse, arrancar un temporizador) y la limpieza para. React repite la pareja tantas veces como haga falta."
    }
  ]
}
```

## Un efecto solo sabe empezar y parar

La báscula de cada colmena se simula con `conectarBascula`: devuelve un objeto con `conectar` y `desconectar`, y los dos escriben en la consola. En una aplicación real sería un WebSocket o la librería del fabricante; para React da igual, es algo de fuera que hay que mantener al día.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El panel del apiario, con el registro de efectos",
  "codigo": "import { useEffect, useState } from 'react'\n\n// El sistema externo: una báscula simulada que escribe en la consola\nfunction conectarBascula(colmena) {\n  return {\n    conectar() {\n      console.log('🔌 Conectando con la báscula de ' + colmena)\n    },\n    desconectar() {\n      console.log('❌ Desconectada la báscula de ' + colmena)\n    },\n  }\n}\n\nfunction Bascula({ colmena }) {\n  useEffect(() => {\n    const conexion = conectarBascula(colmena)\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [colmena])\n\n  return <h2>Báscula de la colmena {colmena}</h2>\n}\n\nconst COLMENAS = ['C-03', 'C-07', 'C-12']\n\nexport default function App() {\n  const [colmena, setColmena] = useState('C-03')\n  const [abierto, setAbierto] = useState(true)\n  const [revisiones, setRevisiones] = useState(0)\n\n  return (\n    <main>\n      <h1>Apícola Los Tomillares</h1>\n      <div role=\"group\" aria-label=\"Colmena\">\n        {COLMENAS.map((c) => (\n          <button key={c} aria-pressed={c === colmena} onClick={() => setColmena(c)}>\n            {c}\n          </button>\n        ))}\n      </div>\n      <button onClick={() => setRevisiones(revisiones + 1)}>Apuntar revisión</button>\n      <button onClick={() => setAbierto(!abierto)}>\n        {abierto ? 'Cerrar el panel' : 'Abrir el panel'}\n      </button>\n      <p>Revisiones apuntadas hoy: {revisiones}</p>\n      {abierto && <Bascula colmena={colmena} />}\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "function conectarBascula(colmena)",
      "nota": "El sistema externo. React no sabe nada de él: solo ejecuta el efecto que lo usa. Fíjate en que cada conexión recuerda su colmena."
    },
    {
      "fragmento": "conexion.conectar()",
      "nota": "El cuerpo del efecto dice cómo EMPEZAR a sincronizar: conectarse a la báscula de la colmena que se está viendo en este render."
    },
    {
      "fragmento": "return () => conexion.desconectar()",
      "nota": "La limpieza dice cómo DEJAR de sincronizar. Desconecta justo la conexión que abrió este efecto, la de la colmena de su render, no la de la siguiente."
    },
    {
      "fragmento": "}, [colmena])",
      "nota": "Le dice a React cuándo deja de valer lo que hizo el efecto: si colmena cambia, la conexión abierta ya no coincide con lo que se ve, y hay que parar y volver a empezar."
    },
    {
      "fragmento": "{abierto && <Bascula colmena={colmena} />}",
      "nota": "Cerrar el panel desmonta Bascula. Ya no hace falta estar conectado a nada: React para el efecto por última vez."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Pulsa **C-07**, después **C-12** y al final «Cerrar el panel», mirando el registro de efectos y la consola. Esto es lo que vas a ver:

- **Al cargar**, en el commit 1: «Bascula ▶ efecto · montaje», «⟲ limpieza» y «▶ efecto · repetido por StrictMode». Es la prueba de la lección 38: en desarrollo, React empieza, para y vuelve a empezar cada efecto nada más montarlo. En la consola, dos «Conectando» con un «Desconectada» en medio.
- **Al pulsar C-07**: «⟲ limpieza» y justo después «▶ efecto · cambió colmena: "C-03" → "C-07"». El registro te dice **qué dependencia cambió y de qué valor a qué valor**.
- **Al cerrar el panel**: «⟲ limpieza · desmontaje», y en la consola, la última desconexión.

## Por qué se vuelve a sincronizar

Párate en el momento de pulsar C-07. React vuelve a renderizar y el título ya dice «Báscula de la colmena C-07». Pero la conexión que abrió el efecto la última vez sigue enganchada a la báscula de **C-03**. **Lo que hizo el efecto ya no coincide con lo que se ve.** Para arreglarlo hacen falta dos cosas:

1. Dejar de sincronizar con lo viejo: desconectar la báscula de C-03.
2. Empezar a sincronizar con lo nuevo: conectar la de C-07.

Y ya le has enseñado a React a hacer las dos: el cuerpo del efecto sabe empezar y la limpieza sabe parar. React solo tiene que llamarlas en ese orden, **cada una con los valores de su render**.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "useEffect(() => {\n  console.log('🔌 Conectando con ' + colmena)\n  return () => console.log('❌ Desconectada ' + colmena)\n}, [colmena])\n\n// La báscula está en C-07 y pulsas C-12.\n// ¿Qué escribe la consola?",
  "opciones": [
    "«❌ Desconectada C-12» y «🔌 Conectando con C-12»",
    "«❌ Desconectada C-07» y «🔌 Conectando con C-12»",
    "«🔌 Conectando con C-12» y después «❌ Desconectada C-07»",
    "Solo «🔌 Conectando con C-12»: la limpieza espera al desmontaje"
  ],
  "correcta": 1,
  "explicacion": "La limpieza que ejecuta React es la que devolvió el efecto del render anterior, y esa función se creó cuando colmena valía C-07: la ve para siempre, como cualquier closure (lección 18). Primero se para lo viejo y después empieza lo nuevo. Y la limpieza no espera al desmontaje: se ejecuta cada vez que hay que volver a sincronizar."
}
```

## Piensa desde el efecto, no desde el componente

Repasa lo que acabas de hacer **desde el punto de vista del componente**: se montó con C-03, se actualizó con C-07, se actualizó con C-12 y se desmontó. En cada uno de esos momentos el efecto hizo algo distinto: conectar; desconectar y conectar; desconectar y conectar; desconectar. Pensado así parece una lista de casos que hay que tener en la cabeza a la vez.

Ahora míralo **desde el efecto**. Para él solo hubo tres periodos que no se solapan:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "La misma sesión, vista desde el efecto",
  "items": [
    {
      "fecha": "Periodo 1",
      "titulo": "Conectado a C-03",
      "texto": "Empieza cuando React ejecuta el cuerpo con colmena igual a C-03 y termina cuando ejecuta su limpieza. Al efecto le da igual si empezó porque el componente se montó."
    },
    {
      "fecha": "Periodo 2",
      "titulo": "Conectado a C-07",
      "texto": "Otro ciclo completo, con sus propios valores. No sabe nada del anterior: ni lo continúa ni lo corrige."
    },
    {
      "fecha": "Periodo 3",
      "titulo": "Conectado a C-12",
      "texto": "Termina con la limpieza del desmontaje. Para el efecto es una limpieza como las demás: parar lo que empezó."
    }
  ]
}
```

**Piensa siempre en un solo ciclo de empezar y parar.** No importa si el componente se está montando, actualizando o desmontando: describe cómo empezar y cómo parar, y React lo repetirá las veces que haga falta. Es lo mismo que ya haces con el JSX: no te preguntas si es el primer render o el décimo, describes lo que debe verse.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por eso StrictMode repite el ciclo al montar",
  "contenido": "Las tres líneas del commit 1 son React comprobando que tu efecto sabe volver a sincronizarse: empieza, para y empieza otra vez, como quien cierra una puerta dos veces para ver si el pestillo funciona. Si un ciclo de empezar y parar está bien escrito, aguanta cualquier número de repeticiones. Lo viste en la lección 38; ahora sabes por qué es una buena prueba."
}
```

Si alguna vez lees componentes de clase (lección 91), verás la otra forma de pensar: `componentDidMount` para conectar, `componentDidUpdate` comparando a mano la prop anterior con la nueva, y `componentWillUnmount` para desconectar. Una sola idea, «mientras se ve esta colmena, hay una conexión con su báscula», repartida en tres métodos. El efecto la escribe una vez.

## Cómo sabe React que tiene que volver a sincronizar

Porque se lo has dicho tú. El efecto lee `colmena`, `colmena` es una prop y una prop puede cambiar, así que la pones en la lista de dependencias. Después de cada render, **React compara cada valor de la lista con el que había en la misma posición en el render anterior**, con `Object.is`. Si alguno es distinto, vuelve a sincronizar. Si todos son iguales, el efecto se queda como está, conectado.

Los tres tipos de lista (ninguna, `[]` y con valores) ya los conoces de la lección 38. Comprueba ahora lo que significa «si todos son iguales»:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// En el panel de arriba, con la báscula de C-07 conectada,\n// pulsas «Apuntar revisión». Eso cambia un estado de App,\n// y App vuelve a renderizar Bascula con colmena = 'C-07'.\n\nuseEffect(() => {\n  const conexion = conectarBascula(colmena)\n  conexion.conectar()\n  return () => conexion.desconectar()\n}, [colmena])\n\n// ¿Qué aparece en el registro de efectos?",
  "opciones": [
    "Nada: colmena sigue valiendo C-07",
    "«⟲ limpieza» y «▶ efecto», porque Bascula se ha vuelto a renderizar",
    "Solo «▶ efecto», sin limpieza",
    "«⟲ limpieza · desmontaje» y «▶ efecto · montaje»"
  ],
  "correcta": 0,
  "explicacion": "Volver a renderizar no es volver a sincronizar. React compara [\"C-07\"] con [\"C-07\"], no encuentra ninguna diferencia y deja el efecto como estaba: la conexión sigue abierta. Pruébalo en el panel: el contador de revisiones sube y el registro no se mueve. Lo mismo pasa si pulsas la colmena que ya está elegida."
}
```

## Los valores reactivos: todo lo que se calcula al renderizar

¿Por qué `colmena` tiene que estar en la lista? Porque **puede ser distinta en el siguiente render**. React llama a eso un **valor reactivo**, y la regla es amplia:

> Las props, el estado y **todas las variables que declaras en el cuerpo del componente** son reactivas. Si el efecto lee una, tiene que ir en la lista.

Lo que está fuera del componente (una constante del módulo) no cambia entre renders y no es reactivo. Lo que se crea dentro del propio efecto, tampoco: no existe fuera de él. Y hay valores que React garantiza estables, como la función `set` de `useState` o el objeto que devuelve `useRef`: puedes ponerlos o no, da igual, porque nunca cambian. En este panel ampliado hay de todo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { conectarBascula } from './bascula'\n\nconst SERVIDOR = 'wss://basculas.example'\n\nfunction Bascula({ colmena }) {\n  const [ahorro, setAhorro] = useState(false)\n  const [lectura, setLectura] = useState(null)\n  const cadaMs = ahorro ? 5000 : 1000\n  const ultimaRef = useRef(null)\n\n  useEffect(() => {\n    const opciones = { servidor: SERVIDOR, cadaMs }\n    const conexion = conectarBascula(colmena, opciones)\n    conexion.conectar((nueva) => {\n      ultimaRef.current = nueva\n      setLectura(nueva)\n    })\n    return () => conexion.desconectar()\n  }, [colmena, cadaMs])\n\n  // ...\n}",
  "anotaciones": [
    {
      "fragmento": "const SERVIDOR = 'wss://basculas.example'",
      "nota": "No reactivo. Está fuera del componente y vale lo mismo en todos los renders: no hace falta en la lista. Si un día el servidor se pudiera elegir en un desplegable, pasaría a ser estado y entonces sí."
    },
    {
      "fragmento": "function Bascula({ colmena })",
      "nota": "Una prop: reactiva. El padre puede pasar otra colmena en cualquier render."
    },
    {
      "fragmento": "const cadaMs = ahorro ? 5000 : 1000",
      "nota": "Ni prop ni estado, pero se calcula en el render a partir de ahorro, que sí cambia. Todo lo que se calcula en el cuerpo es reactivo: va en la lista."
    },
    {
      "fragmento": "const opciones = { servidor: SERVIDOR, cadaMs }",
      "nota": "Creado dentro del efecto: no es una dependencia, porque no existe fuera de él. Si lo crearas en el cuerpo del componente, sería un objeto nuevo en cada render; eso es la lección 42."
    },
    {
      "fragmento": "ultimaRef.current = nueva",
      "nota": "El objeto de la ref es estable y puede faltar en la lista. Su current es otra historia: cambia por su cuenta y React no se entera (lo verás más abajo)."
    },
    {
      "fragmento": "setLectura(nueva)",
      "nota": "Las funciones set son estables: React garantiza que son la misma en cada render. No hace falta ponerlas."
    },
    {
      "fragmento": "}, [colmena, cadaMs])",
      "nota": "Exactamente los valores reactivos que lee el efecto. ahorro no aparece porque el efecto no lo lee: lee cadaMs, que ya depende de él."
    }
  ]
}
```

Esto también aclara qué significa una lista vacía. Si `colmena` fuera una constante fuera del componente, el efecto no leería ningún valor reactivo y su lista sería `[]`. Pensado desde el componente, «se conecta al montar y se desconecta al desmontar». Pensado desde el efecto, simplemente **hoy no depende de nada que pueda cambiar**. Si mañana la colmena pasa a ser una prop, el código del efecto no cambia: solo añades `colmena` a la lista.

### El linter comprueba que no te dejas ninguno

No tienes que hacer esta cuenta de memoria. La regla `exhaustive-deps` revisa cada efecto y avisa si lee un valor reactivo que no está en la lista. La traen los dos linters que ofrece la plantilla de Vite (lección 2): Oxlint, el que viene por defecto, y ESLint con `eslint-plugin-react-hooks`. Con `[]` en vez de `[colmena]`, ESLint dice:

```text
React Hook useEffect has a missing dependency: 'colmena'. Either include it or remove the dependency array
```

Es decir: el efecto usa `colmena`, que puede cambiar, y la lista no la incluye; o la añades o quitas la lista entera. Oxlint da el mismo aviso, partido en un mensaje y una línea `help`. Lo que ninguno te dice es que, sin `colmena`, el panel se quedaría conectado a la primera colmena para siempre. **No mientas al linter**: las dependencias no se eligen, las dicta el código. Si una te sobra, cambia el código para que no la necesite. Cómo se hace es la lección 42, y una de las herramientas, `useEffectEvent`, la siguiente.

## Un efecto por cada proceso de sincronización

El panel también lleva el **cuaderno de campo**: cada colmena que miras queda apuntada como visita. Como el efecto de la báscula ya se ejecuta «cuando cambias de colmena», es tentador meter el apunte ahí. Pruébalo con el **modo ahorro**, que hace que la báscula lea cada 5 segundos en vez de cada segundo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos procesos en el mismo efecto",
  "consigna": "Pulsa «Modo ahorro» y mira la consola: la báscula se reconecta, que es lo correcto porque cambió cadaMs, pero el cuaderno apunta otra visita a C-03 que nadie ha hecho. Separa el apunte en su propio efecto, que solo dependa de colmena, y vuelve a probar: el modo ahorro ya no apunta nada y cambiar de colmena apunta una visita.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nfunction conectarBascula(colmena, cadaMs) {\n  return {\n    conectar() {\n      console.log(`🔌 Conectando con ${colmena} (una lectura cada ${cadaMs} ms)`)\n    },\n    desconectar() {\n      console.log(`❌ Desconectada ${colmena}`)\n    },\n  }\n}\n\nfunction apuntarVisita(colmena) {\n  console.log(`📒 Visita a ${colmena} apuntada en el cuaderno de campo`)\n}\n\nfunction Bascula({ colmena, ahorro }) {\n  const cadaMs = ahorro ? 5000 : 1000\n\n  // Dos procesos distintos en el mismo efecto\n  useEffect(() => {\n    apuntarVisita(colmena)\n    const conexion = conectarBascula(colmena, cadaMs)\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [colmena, cadaMs])\n\n  return <h2>Colmena {colmena}</h2>\n}\n\nexport default function App() {\n  const [colmena, setColmena] = useState('C-03')\n  const [ahorro, setAhorro] = useState(false)\n\n  return (\n    <main>\n      <h1>Apícola Los Tomillares</h1>\n      <div role=\"group\" aria-label=\"Colmena\">\n        {['C-03', 'C-07', 'C-12'].map((c) => (\n          <button key={c} aria-pressed={c === colmena} onClick={() => setColmena(c)}>\n            {c}\n          </button>\n        ))}\n      </div>\n      <button aria-pressed={ahorro} onClick={() => setAhorro(!ahorro)}>\n        Modo ahorro\n      </button>\n      <Bascula colmena={colmena} ahorro={ahorro} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Conectarse a la báscula y apuntar visitas son **dos procesos distintos** que coincidían en el tiempo por casualidad. En cuanto el primero necesitó otra dependencia, el segundo empezó a repetirse sin motivo. Separados quedan así:

```jsx
useEffect(() => {
  apuntarVisita(colmena)
}, [colmena])

useEffect(() => {
  const conexion = conectarBascula(colmena, cadaMs)
  conexion.conectar()
  return () => conexion.desconectar()
}, [colmena, cadaMs])
```

Con los dos efectos, al activar el modo ahorro el registro enseña una sola pareja, «⟲ limpieza» y «▶ efecto · cambió cadaMs: 1000 → 5000», y la consola solo habla de la báscula. Al montar verás la visita a C-03 dos veces: es `StrictMode` repitiendo el efecto, y en producción sale una (lección 38).

**Cada efecto de tu código debe representar un proceso de sincronización independiente.** La prueba es sencilla: si borras uno, ¿se rompe el otro? Aquí no, así que van separados. Al revés también vale: no partas en dos un proceso que es uno solo porque el código parezca más limpio. Decide por lo que sincronizan, no por cómo queda.

## Valores mutables: `ref.current` y `location.pathname`

Un valor **mutable** cambia por su cuenta, fuera del flujo de render de React: `location.pathname` cuando el navegador cambia de URL, `umbralRef.current` cuando un manejador le asigna otra cosa. Cambiarlos no provoca ningún render. Y como React solo compara las dependencias **cuando renderiza**, si pones uno en la lista, React no se entera de que ha cambiado. Compruébalo con una alarma de peso que guarda el umbral en una ref:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ref en la lista de dependencias",
  "consigna": "Pulsa «Subir el umbral» dos veces y mira el registro de efectos y la consola: nada. Ahora pulsa «Apuntar revisión», que sí provoca un render, y vuelve a mirar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport './estilos.css'\n\nexport default function Alarma() {\n  const [revisiones, setRevisiones] = useState(0)\n  const umbralRef = useRef(30)\n\n  useEffect(() => {\n    console.log(`🔔 Avisaré si C-03 baja de ${umbralRef.current} kg`)\n  }, [umbralRef.current]) // 🚩 un valor mutable como dependencia\n\n  return (\n    <main>\n      <h1>Alarma de peso de la colmena C-03</h1>\n      <button onClick={() => { umbralRef.current = umbralRef.current + 5 }}>\n        Subir el umbral\n      </button>\n      <button onClick={() => setRevisiones(revisiones + 1)}>Apuntar revisión</button>\n      <p>Revisiones apuntadas hoy: {revisiones}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

El efecto no se entera de los dos cambios del umbral hasta que otra cosa provoca un render. Entonces React compara y encuentra la diferencia de golpe: «▶ efecto · cambió umbralRef.current: 30 → 40». Si nada hubiera vuelto a renderizar, la alarma seguiría vigilando los 30 kg para siempre. **Un valor mutable no es reactivo**, aunque lo pongas en la lista.

Hay un segundo problema: la lista de dependencias se calcula mientras el componente se renderiza, y leer algo mutable durante el render rompe la pureza (lección 12). El linter marca las dos cosas. Estos son los avisos de ESLint para `location.pathname` y para la ref de la alarma (Oxlint avisa de lo mismo, con un texto algo más corto):

```text
React Hook useEffect has an unnecessary dependency: 'location.pathname'. Either exclude it or remove the dependency array. Outer scope values like 'location.pathname' aren't valid dependencies because mutating them doesn't re-render the component

React Hook useEffect has an unnecessary dependency: 'umbralRef.current'. Either exclude it or remove the dependency array. Mutable values like 'umbralRef.current' aren't valid dependencies because mutating them doesn't re-render the component
```

Es decir: esa dependencia sobra, porque los valores de fuera del componente (o los mutables, como `current`) no sirven como dependencias: cambiarlos no vuelve a renderizar el componente. Y la regla `refs` añade, en la misma línea, el «Cannot access ref value during render» de la lección 33.

Qué hacer en su lugar depende de qué sea:

- **Si el valor tiene que verse o tiene que volver a sincronizar el efecto, es estado.** El umbral de la alarma debería ser `useState`: entonces sí es reactivo.
- **`location.pathname`** y otros datos del navegador que cambian solos se leen suscribiéndose a ellos con `useSyncExternalStore` (lección 46) o, en una app con rutas, con el `useLocation` de React Router (lección 76), que vuelve a renderizar el componente cuando cambia la URL.
- **El objeto de la ref** sí puede ir en la lista: es estable. Lo que no puede ir es su `current`.
- **Si lo que querías era saber cuándo aparece un nodo del DOM**, eso es una ref de callback (lección 34), no un efecto que vigila `ref.current`.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Conexiones que dependen de lo que eliges",
      "texto": "Una sala de chat, el sensor de una colmena, el canal de cotizaciones de una empresa, la partida a la que te unes: cuando cambia la elección, se cierra la conexión vieja y se abre la nueva. Es el ejemplo de esta lección."
    },
    {
      "titulo": "Temporizadores con un ritmo que cambia",
      "texto": "Consultar un servidor cada N segundos, con N elegido por el usuario: el intervalo es una dependencia, y cambiarlo para el temporizador viejo y arranca otro."
    },
    {
      "titulo": "Widgets de librerías externas",
      "texto": "Un mapa centrado en las coordenadas que llegan por props, un gráfico con la serie elegida: cuando cambian, el efecto vuelve a sincronizar el widget."
    },
    {
      "titulo": "Leer código antiguo",
      "texto": "Un componentDidUpdate que compara la prop anterior con la nueva para reconectar es un efecto con esa prop en la lista. Pensar en empezar y parar te ayuda a migrarlo (lección 91)."
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
      "mito": "Un efecto con [] se ejecuta al montar y ya está",
      "realidad": "Desde dentro, [] significa que el efecto no lee ningún valor reactivo. En desarrollo, StrictMode lo para y lo vuelve a arrancar una vez de más, y si mañana lee una prop, la añades a la lista sin tocar nada más."
    },
    {
      "mito": "La limpieza solo se ejecuta al desmontar",
      "realidad": "Se ejecuta antes de cada nueva sincronización, cuando cambia una dependencia, y una última vez al desmontar. Siempre con los valores del render en que se creó."
    },
    {
      "mito": "Las dependencias las elijo yo",
      "realidad": "Las dicta el código: cada valor reactivo que lee el efecto. Si una te sobra, cambia el código para que el efecto no la lea (lecciones 41 y 42), no la lista."
    },
    {
      "mito": "Si Bascula se vuelve a renderizar, su efecto se vuelve a ejecutar",
      "realidad": "Solo si ha cambiado alguna dependencia. Un render con los mismos valores en la lista no toca el efecto."
    },
    {
      "mito": "Con ref.current en la lista, React vigila la ref",
      "realidad": "React no se entera de que current cambia. Solo compara cuando renderiza por otro motivo, y entonces descubre el cambio tarde, o nunca."
    },
    {
      "mito": "Meterlo todo en un efecto es más ordenado",
      "realidad": "Cada proceso de sincronización independiente va en su efecto. Mezclarlos hace que uno se repita cuando el otro necesita volver a sincronizar."
    }
  ]
}
```

## Errores típicos

**Pensar en «al montar» y poner `[]` en un efecto que lee una prop.** Es el error que nace de mirar el efecto desde el componente: «solo quiero conectarme una vez». El título cambia, la conexión no.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Bascula({ colmena }) {\n  useEffect(() => {\n    const conexion = conectarBascula(colmena)\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, []) // «solo al montar»\n\n  return <h2>Báscula de la colmena {colmena}</h2>\n}\n\n// Se monta con C-03 y después eliges C-07.\n// ¿Qué pasa?",
  "opciones": [
    "El título dice C-07 y la conexión sigue siendo la de C-03",
    "Se desconecta de C-03 y se conecta a C-07, como con [colmena]",
    "React da un error porque colmena no está en la lista",
    "El título se queda en C-03 hasta que se desmonte"
  ],
  "correcta": 0,
  "explicacion": "El render sí usa la colmena nueva, así que el título cambia. Pero la lista vacía es igual en todos los renders, así que React no vuelve a sincronizar: el efecto se quedó con la colmena de su primer render. React no lo detecta al ejecutarse; el que avisa es el linter, con «missing dependency: colmena»."
}
```

**Olvidar la lista de dependencias.** Sin lista, el efecto vuelve a sincronizar después de **cada** render: con cada tecla de un campo, con cada estado que cambie. Si además el sistema externo provoca renders (una lectura que llega y se guarda en el estado), el efecto se reconecta con cada lectura. Es el punto de partida del ejercicio.

**Mezclar dos procesos en el mismo efecto.** Funciona hasta que uno de los dos necesita una dependencia nueva y el otro empieza a repetirse. Uno por proceso.

**Poner un valor mutable en la lista**, como `ref.current` o `location.pathname`. React no se entera de sus cambios. Si tiene que volver a sincronizar el efecto, es estado o una suscripción.

**Callar al linter** con un comentario `// eslint-disable-next-line react-hooks/exhaustive-deps`. Esconde el aviso, no el fallo: el efecto se queda con valores viejos. La lección 42 enseña a quitar dependencias sin mentir.

## Ejercicios

El panel de pesadas de verdad: la báscula manda una lectura cada 200 ms (la simulación va acelerada) y cada conexión abre una **sesión** nueva en el servidor, con su número. Así se ve a simple vista cuántas veces te has reconectado. Recuerda que, al cargar, `StrictMode` abre y cierra la sesión 1, así que lo normal es empezar en la **sesión 2**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La báscula que no para de reconectarse",
  "consigna": "Mira el número de sesión: sube sin parar, porque el efecto no tiene lista de dependencias y cada lectura provoca un render (el registro de efectos dice «se ejecuta en cada render» con cada una). Escribe la lista justa: que la báscula se reconecte al cambiar de colmena o al activar el modo ahorro, y nunca por una lectura ni por escribir una nota. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { conectarBascula } from './bascula'\nimport './estilos.css'\n\nconst COLMENAS = ['C-03', 'C-07', 'C-12']\n\nfunction Bascula({ colmena, ahorro }) {\n  const [lectura, setLectura] = useState(null)\n  const [nota, setNota] = useState('')\n  const cadaMs = ahorro ? 600 : 200\n\n  // 🚩 Sin lista de dependencias: vuelve a conectar después de cada render\n  useEffect(() => {\n    const conexion = conectarBascula(colmena, cadaMs)\n    conexion.conectar(setLectura)\n    return () => conexion.desconectar()\n  })\n\n  return (\n    <section>\n      <h2>Colmena {colmena}</h2>\n      {lectura === null ? (\n        <p>Esperando a la báscula…</p>\n      ) : (\n        <p>\n          Sesión {lectura.sesion} · {lectura.colmena}: {lectura.kilos.toLocaleString('es-ES')} kg,\n          una lectura cada {lectura.cadaMs} ms\n        </p>\n      )}\n      <label>\n        Nota para la próxima visita\n        <input value={nota} onChange={(e) => setNota(e.target.value)} />\n      </label>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [colmena, setColmena] = useState('C-03')\n  const [ahorro, setAhorro] = useState(false)\n\n  return (\n    <main>\n      <h1>Apícola Los Tomillares</h1>\n      <div role=\"group\" aria-label=\"Colmena\">\n        {COLMENAS.map((c) => (\n          <button key={c} aria-pressed={c === colmena} onClick={() => setColmena(c)}>\n            {c}\n          </button>\n        ))}\n      </div>\n      <button aria-pressed={ahorro} onClick={() => setAhorro(!ahorro)}>\n        Modo ahorro\n      </button>\n      <Bascula colmena={colmena} ahorro={ahorro} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "bascula.jsx",
      "codigo": "// Simula las básculas de Apícola Los Tomillares. Va acelerada: una\n// lectura cada 200 ms en vez de cada hora. Cada conexión abre una sesión\n// nueva en el servidor, con su número.\nconst PESOS = { 'C-03': 38.4, 'C-07': 41.2, 'C-12': 35.9 }\nlet ultimaSesion = 0\n\nexport function conectarBascula(colmena, cadaMs) {\n  const sesion = ++ultimaSesion\n  let temporizador = null\n  return {\n    conectar(alLeer) {\n      console.log(`🔌 Sesión ${sesion}: conectando con ${colmena}`)\n      temporizador = setInterval(() => {\n        alLeer({ sesion, colmena, kilos: PESOS[colmena], cadaMs })\n      }, cadaMs)\n    },\n    desconectar() {\n      console.log(`❌ Sesión ${sesion}: desconectada ${colmena}`)\n      clearInterval(temporizador)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #b45309;\n  color: white;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al cargar, llegan las lecturas de C-03 por la sesión 2",
      "pasos": [],
      "espera": {
        "texto": "Sesión 2 · C-03: 38,4 kg, una lectura cada 200 ms"
      }
    },
    {
      "descripcion": "Escribir una nota no reconecta la báscula: sigue en la sesión 2",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nota para la próxima visita",
            "texto": "Revisar la reina"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 2 · C-03: 38,4 kg, una lectura cada 200 ms"
      }
    },
    {
      "descripcion": "Al pulsar «C-07», se reconecta a la báscula de C-07 en la sesión 3",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "C-07"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 3 · C-07: 41,2 kg, una lectura cada 200 ms"
      }
    },
    {
      "descripcion": "Al activar el modo ahorro, se reconecta con una lectura cada 600 ms",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Modo ahorro"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 3 · C-03: 38,4 kg, una lectura cada 600 ms"
      }
    },
    {
      "descripcion": "Cambiar de colmena y volver abre una sesión en cada cambio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "C-12"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "C-03"
          }
        }
      ],
      "espera": {
        "texto": "Sesión 4 · C-03: 38,4 kg, una lectura cada 200 ms"
      }
    }
  ]
}
```

Si has puesto `ahorro` en vez de `cadaMs`, las comprobaciones pasan, pero el linter te pedirá `cadaMs` («missing dependency: 'cadaMs'»): la lista nombra lo que **lee** el efecto, y el efecto lee `cadaMs`.

**Retos para seguir practicando** (sin comprobación automática):

1. Añade una casilla «Recibir lecturas»: desmarcada, la báscula no se conecta. Pista: no puedes meter `useEffect` dentro de un `if` (lección 44), pero sí poner el `if` dentro del efecto, y la casilla pasa a ser una dependencia más.
2. Añade el cuaderno de campo como un segundo efecto que escriba en la consola «Visita a C-07». Comprueba que el modo ahorro no apunta visitas y que cambiar de colmena sí.
3. La colmena C-12 está en otra finca, con otro servidor. Calcula `servidor` en el cuerpo del componente a partir de la colmena, pásalo a `conectarBascula` y decide si tiene que ir en la lista. Después muévelo a una constante fuera del componente y vuelve a decidir.
4. Busca en un tutorial antiguo de React un `componentDidUpdate` que compare `prevProps` y reescríbelo como un efecto, pensando solo en cómo empezar y cómo parar.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Lifecycle of Reactive Effects",
      "descripcion": "La página de react.dev en la que se basa esta lección: el efecto visto desde dentro, los valores reactivos y los retos del final.",
      "url": "https://react.dev/learn/lifecycle-of-reactive-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Synchronizing with Effects",
      "descripcion": "La lección 38: los tres pasos para escribir un efecto, la limpieza y por qué StrictMode lo ejecuta dos veces en desarrollo.",
      "url": "https://react.dev/learn/synchronizing-with-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useEffect",
      "descripcion": "La referencia del Hook: qué hace React con la lista de dependencias y cómo las compara.",
      "url": "https://react.dev/reference/react/useEffect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Separating Events from Effects",
      "descripcion": "La lección 41: qué hacer cuando quieres leer un valor en un efecto sin que lo vuelva a sincronizar.",
      "url": "https://react.dev/learn/separating-events-from-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Removing Effect Dependencies",
      "descripcion": "La lección 42: cómo quitar una dependencia cambiando el código, sin mentir al linter.",
      "url": "https://react.dev/learn/removing-effect-dependencies",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Object.is()",
      "descripcion": "La comparación que usa React para decidir si una dependencia ha cambiado.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is",
      "etiqueta": "MDN"
    }
  ]
}
```
