# Proyecto: comentarios con respuesta optimista

- **Módulo:** Formularios y Actions
- **Slug:** `proyecto-comentarios-con-respuesta-optimista` (autogenerado del título)
- **Orden:** 620
- **Fuentes:** [useOptimistic](https://react.dev/reference/react/useOptimistic) + [useActionState: Using with useOptimistic](https://react.dev/reference/react/useActionState#using-with-useoptimistic) + [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) + [`<form>`: Optimistically updating form data](https://react.dev/reference/react-dom/components/form#optimistically-updating-form-data) — ver `contenido/react/TEMARIO.md` #62
- **Requiere:** Módulos 2 a 8 completos (lecciones 8 a 61)

---

## Qué vas a construir

El taller de escritura **Tinta Fresca**, de Logroño, publica cada viernes un capítulo de su novela por entregas, *La niebla de Cabo Gris*. Debajo de cada capítulo comentan los lectores: quién ha apagado la lámpara del faro, quién es la mujer del chubasquero amarillo, cuándo sale el siguiente. Vas a construir ese hilo de comentarios como se hace en React 19: **tu comentario aparece en el hilo en cuanto pulsas «Comentar»**, marcado como «Enviando…», sin esperar al servidor. Si el servidor lo guarda, se queda con su número. Si falla, **se retira solo**, un aviso lo dice y lo que habías escrito sigue en la caja para reintentarlo.

Es el proyecto que cierra el módulo 8, y lo usa entero:

- **`<form action>`** (lección 57): el formulario envía con una función, sin `onSubmit` ni `preventDefault`, y se vacía solo al terminar.
- **`useActionState`** (lección 58): el hilo es el estado que devuelve la acción de publicar, y un fallo del servidor es un resultado más, no un error lanzado.
- **`useFormStatus`** (lección 59): el botón sabe, desde un componente hijo, que su formulario se está enviando.
- **`useOptimistic`** (lección 60): el comentario provisional, encima del estado de `useActionState`. Es el reto 4 de la lección 60, ahora completo.
- **Conservar lo escrito** con la técnica de la lección 61, y **anunciar el resultado** a quien usa un lector de pantalla (lección 37).

Para cargar el hilo usarás el módulo 7: `use` con una caché (lección 49), `<Suspense>` (lección 48) y el `LimiteDeError` de la lección 53.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cinco pasos, todos en esta página",
  "contenido": "Cada paso es un bloque React en vivo con sus archivos en pestañas, la vista previa, el panel de red debajo y el botón «Comprobar». Cada paso arranca con la solución del anterior: si te atascas, sigue en el siguiente. Las comprobaciones usan la latencia del bloque, un segundo por petición, y algunas hacen fallar a propósito la siguiente petición a mitad de camino, igual que el botón «Fallar la siguiente petición» del panel."
}
```

Como en el proyecto 56, esta vez no hay versión para tu ordenador: el servidor es la API simulada de la vista previa, y el botón que hace fallar una petición solo existe aquí. En un proyecto con Vite necesitarías un servidor de verdad o una red simulada como MSW (lección 84).

## El hilo y su servidor

La colección `comentarios` de la API simulada guarda los cuatro comentarios que ya tiene el capítulo 7. Cada uno es así:

```json
{
  "id": 3,
  "autor": "Begoña",
  "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
}
```

- `GET /api/comentarios` devuelve el hilo entero.
- `POST /api/comentarios` con `{ autor, texto }` en JSON guarda un comentario y lo devuelve, con un `201`, **con su número**: el `id` lo pone el servidor, el siguiente libre. El primero que publiques será el 5.
- «Fallar la siguiente petición», en el panel de red, hace que la siguiente conteste `500` con `{ "error": "Error del servidor (simulado)" }`.

Un comentario confirmado enseña su número: «Elena · n.º 1». Uno que todavía no ha confirmado el servidor no puede tenerlo, y en su lugar dice «Enviando…». Esa diferencia la vas a ver durante todo el proyecto.

Los datos viven en memoria: lo que publiques sigue ahí al pulsar «Actualizar comentarios», pero en cuanto editas el código la vista previa arranca de nuevo y el hilo vuelve a sus cuatro comentarios.

## Las piezas

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "api.jsx",
      "rol": "Pedir el hilo, ya hecho",
      "descripcion": "cargarComentarios() pide el hilo una vez y guarda la promesa fuera de los componentes; olvidarComentarios() la tira para que la próxima lectura vuelva a pedirlo."
    },
    {
      "etiqueta": "piezas.jsx",
      "rol": "Lo que se ve, ya hecho",
      "descripcion": "Capitulo pinta la entrega; Comentario, un comentario con su número o con «Enviando…»; contarComentarios, el encabezado. Y el LimiteDeError de la lección 53, sin tocar una línea."
    },
    {
      "etiqueta": "App.jsx",
      "rol": "La página",
      "descripcion": "El capítulo, el botón «Actualizar comentarios» y, debajo, el hilo con su espera y su fallo. Lo terminas en el paso 1 y ya no cambia."
    },
    {
      "etiqueta": "Hilo.jsx y CamposComentario.jsx",
      "rol": "El hilo y su formulario",
      "descripcion": "La lista, la acción de publicar y todo lo que pasa mientras se envía. Ahí está el trabajo de los pasos 1 a 5."
    }
  ]
}
```

## Paso 1: cargar el hilo

Primero, que el hilo salga. Sin efecto ni estado de carga: el módulo 7 te dio una forma más corta. `Hilo` lee los comentarios **durante el render** con `use(cargarComentarios())`. Mientras la promesa no se cumple, `Hilo` se suspende y un `<Suspense>` enseña «Cargando comentarios…»; si se rechaza, `use` lanza el error y lo recoge el `LimiteDeError`.

Las dos reglas de la lección 49 ya están resueltas en `api.jsx`: la promesa no nace en el render, sino que se guarda fuera y es siempre la misma; y para reintentar hay que **olvidarla**, porque si no, `use` volvería a leer la misma promesa rechazada. Por eso el `onReintentar` del boundary es `olvidarComentarios`.

`App.jsx` ya trae el botón «Actualizar comentarios»: olvida la promesa y sube un número, `version`, que hace de `key`. Al cambiar la `key`, React monta un hilo nuevo, desde cero, que vuelve a pedir los comentarios (lección 26). **¿En cuál de los tres va esa `key`?** En el de más arriba, el `LimiteDeError`. Si la carga ha fallado, el error lo guarda él, y un `Hilo` nuevo dentro de un boundary que sigue en error no llega a verse: solo un boundary nuevo empieza limpio. Es la misma colocación de la lección 53.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 1: cargar el hilo",
  "consigna": "En Hilo.jsx, lee los comentarios con use(cargarComentarios()) y pinta el encabezado y un <Comentario> por cada uno. En App.jsx, envuelve <Hilo /> en un Suspense con el fallback «Cargando comentarios…» (un párrafo con className=\"cargando\"), y este en el LimiteDeError: su alternativa, un div con role=\"alert\", el texto «No se han podido cargar los comentarios.» y un botón «Reintentar»; su onReintentar, olvidarComentarios. La key={version} pasa de Hilo al LimiteDeError.",
  "archivos": [
    {
      "nombre": "Hilo.jsx",
      "codigo": "import { use } from 'react'\nimport { cargarComentarios } from './api'\nimport { Comentario, contarComentarios } from './piezas'\n\n// Paso 1: lee el hilo con use(cargarComentarios()) y píntalo: el\n// encabezado con contarComentarios y un <Comentario> por comentario.\nexport default function Hilo() {\n  const comentarios = []\n\n  return (\n    <section className=\"hilo\">\n      <h3>{contarComentarios(comentarios.length)}</h3>\n      <ul className=\"comentarios\"></ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { olvidarComentarios } from './api'\nimport Hilo from './Hilo'\nimport { Capitulo, LimiteDeError } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  // Cada «Actualizar» tira la promesa guardada y cambia la key: React monta\n  // un hilo nuevo, desde cero, que vuelve a pedir los comentarios.\n  const [version, setVersion] = useState(0)\n\n  function actualizar() {\n    olvidarComentarios()\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <Capitulo />\n      <button type=\"button\" className=\"actualizar\" onClick={actualizar}>\n        Actualizar comentarios\n      </button>\n      {/* Paso 1: envuelve Hilo en un Suspense con «Cargando comentarios…»\n          y este en el LimiteDeError, con su «Reintentar». La key, en el\n          LimiteDeError: es él quien guarda el error si la carga falla. */}\n      <Hilo key={version} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "let promesa = null\n\n// La promesa del hilo, pedida una vez y guardada aquí fuera, como la caché\n// de la lección 49: use necesita la misma promesa en cada render.\nexport function cargarComentarios() {\n  if (promesa === null) {\n    promesa = fetch('/api/comentarios').then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n      return respuesta.json()\n    })\n  }\n  return promesa\n}\n\n// Para volver a pedirlo: la próxima lectura crea otra promesa\nexport function olvidarComentarios() {\n  promesa = null\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { Component } from 'react'\n\n// La entrega de esta semana. No cambia en todo el proyecto.\nexport function Capitulo() {\n  return (\n    <>\n      <header>\n        <h1>La niebla de Cabo Gris</h1>\n        <p className=\"entrega\">\n          Novela por entregas del taller de escritura Tinta Fresca, de Logroño\n        </p>\n      </header>\n      <article className=\"capitulo\">\n        <h2>Capítulo 7: La lámpara apagada</h2>\n        <p>\n          Aquella noche la niebla subió por los acantilados antes de que nadie la viera\n          venir. A las doce y diez, la lámpara del faro de Cabo Gris se apagó por primera\n          vez en cuarenta años.\n        </p>\n        <p>\n          Desde la ventana de la fonda, Irene contó tres destellos más, cortos y torpes,\n          como si alguien estuviera aprendiendo a encenderla desde dentro.\n        </p>\n        <p className=\"sigue\">Continuará el viernes que viene.</p>\n      </article>\n    </>\n  )\n}\n\n// Un comentario del hilo. Si ya lo ha guardado el servidor, lleva su número;\n// si todavía no (enviando: true), lo dice y sale atenuado.\nexport function Comentario({ comentario }) {\n  return (\n    <li className={comentario.enviando ? 'comentario enviando' : 'comentario'}>\n      <p className=\"firma\">\n        {comentario.autor} · {comentario.enviando ? 'Enviando…' : `n.º ${comentario.id}`}\n      </p>\n      <p className=\"texto\">{comentario.texto}</p>\n    </li>\n  )\n}\n\nexport function contarComentarios(cuantos) {\n  return cuantos === 1 ? '1 comentario' : `${cuantos} comentarios`\n}\n\n// El LimiteDeError de la lección 53, tal cual\nexport class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f6f1e7;\n  color: #2a2522;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 36rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.8rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.entrega {\n  margin: 0.25rem 0 1rem;\n  color: #6b5f55;\n}\n\n.capitulo h2 {\n  margin: 0 0 0.5rem;\n  font: 600 1.2rem Georgia, 'Times New Roman', serif;\n  color: #3d5a73;\n}\n\n.capitulo p {\n  margin: 0 0 0.6rem;\n  font: 1.05rem/1.6 Georgia, 'Times New Roman', serif;\n}\n\n.capitulo .sigue {\n  font-style: italic;\n  color: #6b5f55;\n}\n\n.hilo {\n  margin-top: 0.75rem;\n  padding-top: 0.25rem;\n  border-top: 2px solid #c9bba8;\n}\n\n.comentarios {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.comentario {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #3d5a73;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.comentario p {\n  margin: 0;\n}\n\n.firma {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #3d5a73;\n}\n\n.texto {\n  margin-top: 0.25rem;\n}\n\n/* Lo que todavía no ha confirmado el servidor */\n.enviando {\n  opacity: 0.6;\n  border-left-style: dashed;\n}\n\n.enviando .firma {\n  font-style: italic;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n  margin: 1rem 0 0.5rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #c9bba8;\n  border-radius: 8px;\n  background: #fffdf8;\n}\n\nlegend {\n  padding: 0 0.25rem;\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #b5a690;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 1rem;\n  border: 1px solid #2f4a60;\n  border-radius: 999px;\n  background: #3d5a73;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.7;\n  cursor: progress;\n}\n\n.actualizar {\n  background: transparent;\n  color: #2f4a60;\n}\n\nbutton:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.cargando {\n  color: #6b5f55;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #3d5a73;\n}\n\n/* Los avisos: con caja solo cuando dicen algo */\n.aviso {\n  margin: 0.5rem 0 0;\n  color: #7a1a12;\n}\n\n.aviso:not(:empty),\n.fallo {\n  padding: 0.6rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n  color: #7a1a12;\n}\n\n.fallo p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Hilo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "comentarios": [
      {
        "id": 1,
        "autor": "Elena",
        "texto": "¡Lo sabía! El farero no se fue a Santander: alguien sigue dentro del faro."
      },
      {
        "id": 2,
        "autor": "Tomás",
        "texto": "Qué bien contáis la niebla. Llevo todo el capítulo oyendo la sirena."
      },
      {
        "id": 3,
        "autor": "Begoña",
        "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
      },
      {
        "id": 4,
        "autor": "Javi",
        "texto": "Por favor, que el capítulo 8 no tarde otra semana."
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparecen los comentarios del capítulo",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "alguien sigue dentro del faro"
      }
    },
    {
      "descripcion": "El encabezado cuenta los comentarios: «4 comentarios»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "4 comentarios"
      }
    },
    {
      "descripcion": "Si la carga falla, aparece un aviso con «Reintentar»",
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
      "descripcion": "Con el aviso a la vista, el capítulo sigue en su sitio",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se han podido cargar los comentarios"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Capítulo 7: La lámpara apagada"
      }
    },
    {
      "descripcion": "«Reintentar» vuelve a pedir el hilo y lo pinta",
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
        "texto": "alguien sigue dentro del faro"
      }
    },
    {
      "descripcion": "Tras un fallo al cargar, «Actualizar comentarios» también trae el hilo",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se han podido cargar los comentarios"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Actualizar comentarios"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "alguien sigue dentro del faro"
      }
    },
    {
      "descripcion": "Mientras llegan los comentarios, se lee «Cargando comentarios…»",
      "pasos": [],
      "espera": {
        "texto": "Cargando comentarios…"
      }
    }
  ]
}
```

Abre el panel de red: al cargar sale **una sola petición**, aunque `StrictMode` renderice `Hilo` dos veces. La segunda vez, `cargarComentarios()` devuelve la misma promesa. Prueba también «Actualizar comentarios» con la latencia en 2 s: el hilo deja paso a «Cargando comentarios…» y vuelve.

Y el fallo: pulsa «Fallar la siguiente petición» y después «Actualizar comentarios». En el sitio del hilo sale el aviso con «Reintentar», y el capítulo sigue a la vista, porque el boundary solo envuelve el hilo. «Reintentar» lo arregla desde dentro del boundary, y «Actualizar comentarios», desde fuera, con la `key`: las dos formas de recuperarse del proyecto 56, otra vez.

## Paso 2: comentar con una acción

Ahora el formulario. Ya está dibujado debajo de la lista, con sus dos campos sin controlar (`name="autor"` y `name="texto"`), pero no envía nada. Es el caso de libro de la lección 58: el envío tiene un resultado que pintar, el hilo con un comentario más, y puede fallar.

- **La acción**, `publicarComentario(estadoAnterior, formData)`, va fuera del componente porque todo le llega por argumentos. Envía el comentario con `POST` y devuelve el estado nuevo: los comentarios de antes **más el que devuelve el servidor**, que trae su número.
- **El hilo pasa a ser el estado de `useActionState`.** Su estado inicial son los comentarios que ha leído `use`. Ya sabes que el estado inicial solo cuenta en el primer render (lección 58), y aquí no estorba: `Hilo` no se monta hasta que los comentarios han llegado.
- **Si el servidor falla, la acción devuelve el error**, no lo lanza: `{ ...estadoAnterior, error: '…' }`. Un error lanzado subiría al `LimiteDeError`, que cambiaría el hilo entero, formulario incluido, por «No se han podido cargar los comentarios.»: un aviso que, encima, mentiría.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: comentar con una acción",
  "consigna": "En Hilo.jsx, escribe la acción publicarComentario y monta useActionState con { comentarios, error: null } como estado inicial. La lista y el encabezado salen de su estado, su acción va al <form>, y el error, en un <p role=\"alert\" className=\"aviso\"> debajo del formulario. Prueba a comentar, a pulsar «Actualizar comentarios» y a hacer fallar la siguiente petición.",
  "archivos": [
    {
      "nombre": "Hilo.jsx",
      "codigo": "import { use } from 'react'\nimport { cargarComentarios } from './api'\nimport { Comentario, contarComentarios } from './piezas'\n\n// Paso 2: escribe aquí la acción publicarComentario(estadoAnterior, formData).\n// Envía { autor, texto } con POST a /api/comentarios, en JSON. Si la respuesta\n// no es ok, devuelve el estado anterior con el error «No se ha podido publicar\n// tu comentario. Inténtalo otra vez.». Si va bien, devuelve los comentarios\n// con el que ha guardado el servidor al final, y error: null.\n\nexport default function Hilo() {\n  const comentarios = use(cargarComentarios())\n  // Paso 2: useActionState, con { comentarios, error: null } como estado\n  // inicial. Pinta la lista desde su estado, dale su acción al <form> y, si\n  // trae un error, enséñalo debajo en un <p role=\"alert\" className=\"aviso\">.\n\n  return (\n    <section className=\"hilo\">\n      <h3>{contarComentarios(comentarios.length)}</h3>\n      <ul className=\"comentarios\">\n        {comentarios.map((comentario) => (\n          <Comentario key={comentario.id} comentario={comentario} />\n        ))}\n      </ul>\n      <form>\n        <fieldset>\n          <legend>Deja tu comentario</legend>\n          <label>\n            Tu nombre\n            <input name=\"autor\" required />\n          </label>\n          <label>\n            Tu comentario\n            <textarea name=\"texto\" rows={3} required />\n          </label>\n          <button>Comentar</button>\n        </fieldset>\n      </form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { olvidarComentarios } from './api'\nimport Hilo from './Hilo'\nimport { Capitulo, LimiteDeError } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  // Cada «Actualizar» tira la promesa guardada y cambia la key: React monta\n  // un hilo nuevo, desde cero, que vuelve a pedir los comentarios.\n  const [version, setVersion] = useState(0)\n\n  function actualizar() {\n    olvidarComentarios()\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <Capitulo />\n      <button type=\"button\" className=\"actualizar\" onClick={actualizar}>\n        Actualizar comentarios\n      </button>\n      <LimiteDeError\n        key={version}\n        onReintentar={olvidarComentarios}\n        alternativa={(_error, reintentar) => (\n          <div role=\"alert\" className=\"fallo\">\n            <p>No se han podido cargar los comentarios.</p>\n            <button onClick={reintentar}>Reintentar</button>\n          </div>\n        )}\n      >\n        <Suspense fallback={<p className=\"cargando\">Cargando comentarios…</p>}>\n          <Hilo />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "let promesa = null\n\n// La promesa del hilo, pedida una vez y guardada aquí fuera, como la caché\n// de la lección 49: use necesita la misma promesa en cada render.\nexport function cargarComentarios() {\n  if (promesa === null) {\n    promesa = fetch('/api/comentarios').then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n      return respuesta.json()\n    })\n  }\n  return promesa\n}\n\n// Para volver a pedirlo: la próxima lectura crea otra promesa\nexport function olvidarComentarios() {\n  promesa = null\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { Component } from 'react'\n\n// La entrega de esta semana. No cambia en todo el proyecto.\nexport function Capitulo() {\n  return (\n    <>\n      <header>\n        <h1>La niebla de Cabo Gris</h1>\n        <p className=\"entrega\">\n          Novela por entregas del taller de escritura Tinta Fresca, de Logroño\n        </p>\n      </header>\n      <article className=\"capitulo\">\n        <h2>Capítulo 7: La lámpara apagada</h2>\n        <p>\n          Aquella noche la niebla subió por los acantilados antes de que nadie la viera\n          venir. A las doce y diez, la lámpara del faro de Cabo Gris se apagó por primera\n          vez en cuarenta años.\n        </p>\n        <p>\n          Desde la ventana de la fonda, Irene contó tres destellos más, cortos y torpes,\n          como si alguien estuviera aprendiendo a encenderla desde dentro.\n        </p>\n        <p className=\"sigue\">Continuará el viernes que viene.</p>\n      </article>\n    </>\n  )\n}\n\n// Un comentario del hilo. Si ya lo ha guardado el servidor, lleva su número;\n// si todavía no (enviando: true), lo dice y sale atenuado.\nexport function Comentario({ comentario }) {\n  return (\n    <li className={comentario.enviando ? 'comentario enviando' : 'comentario'}>\n      <p className=\"firma\">\n        {comentario.autor} · {comentario.enviando ? 'Enviando…' : `n.º ${comentario.id}`}\n      </p>\n      <p className=\"texto\">{comentario.texto}</p>\n    </li>\n  )\n}\n\nexport function contarComentarios(cuantos) {\n  return cuantos === 1 ? '1 comentario' : `${cuantos} comentarios`\n}\n\n// El LimiteDeError de la lección 53, tal cual\nexport class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f6f1e7;\n  color: #2a2522;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 36rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.8rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.entrega {\n  margin: 0.25rem 0 1rem;\n  color: #6b5f55;\n}\n\n.capitulo h2 {\n  margin: 0 0 0.5rem;\n  font: 600 1.2rem Georgia, 'Times New Roman', serif;\n  color: #3d5a73;\n}\n\n.capitulo p {\n  margin: 0 0 0.6rem;\n  font: 1.05rem/1.6 Georgia, 'Times New Roman', serif;\n}\n\n.capitulo .sigue {\n  font-style: italic;\n  color: #6b5f55;\n}\n\n.hilo {\n  margin-top: 0.75rem;\n  padding-top: 0.25rem;\n  border-top: 2px solid #c9bba8;\n}\n\n.comentarios {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.comentario {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #3d5a73;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.comentario p {\n  margin: 0;\n}\n\n.firma {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #3d5a73;\n}\n\n.texto {\n  margin-top: 0.25rem;\n}\n\n/* Lo que todavía no ha confirmado el servidor */\n.enviando {\n  opacity: 0.6;\n  border-left-style: dashed;\n}\n\n.enviando .firma {\n  font-style: italic;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n  margin: 1rem 0 0.5rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #c9bba8;\n  border-radius: 8px;\n  background: #fffdf8;\n}\n\nlegend {\n  padding: 0 0.25rem;\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #b5a690;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 1rem;\n  border: 1px solid #2f4a60;\n  border-radius: 999px;\n  background: #3d5a73;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.7;\n  cursor: progress;\n}\n\n.actualizar {\n  background: transparent;\n  color: #2f4a60;\n}\n\nbutton:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.cargando {\n  color: #6b5f55;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #3d5a73;\n}\n\n/* Los avisos: con caja solo cuando dicen algo */\n.aviso {\n  margin: 0.5rem 0 0;\n  color: #7a1a12;\n}\n\n.aviso:not(:empty),\n.fallo {\n  padding: 0.6rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n  color: #7a1a12;\n}\n\n.fallo p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Hilo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "comentarios": [
      {
        "id": 1,
        "autor": "Elena",
        "texto": "¡Lo sabía! El farero no se fue a Santander: alguien sigue dentro del faro."
      },
      {
        "id": 2,
        "autor": "Tomás",
        "texto": "Qué bien contáis la niebla. Llevo todo el capítulo oyendo la sirena."
      },
      {
        "id": 3,
        "autor": "Begoña",
        "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
      },
      {
        "id": 4,
        "autor": "Javi",
        "texto": "Por favor, que el capítulo 8 no tarde otra semana."
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "Al comentar, tu comentario sale al final del hilo con su número: «Marisa · n.º 5»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Marisa · n.º 5"
      }
    },
    {
      "descripcion": "El encabezado pasa a «5 comentarios»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "5 comentarios"
      }
    },
    {
      "descripcion": "Al publicarse, la caja «Tu comentario» se vacía sola",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · n.º 5"
          }
        }
      ],
      "espera": {
        "etiqueta": "Tu comentario",
        "valor": ""
      }
    },
    {
      "descripcion": "Tu comentario queda guardado en el servidor: tras «Actualizar comentarios», sigue en el hilo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · n.º 5"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Actualizar comentarios"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Marisa · n.º 5"
      }
    },
    {
      "descripcion": "Si el servidor falla, sale el aviso «No se ha podido publicar tu comentario…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido publicar tu comentario"
      }
    },
    {
      "descripcion": "Si el servidor falla, el hilo sigue en «4 comentarios»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "4 comentarios"
      }
    },
    {
      "descripcion": "Tras un fallo puedes volver a comentar, y el aviso desaparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · n.º 5"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert",
          "texto": "No se ha podido publicar tu comentario"
        }
      }
    }
  ]
}
```

Publica un comentario. La petición sale y, un segundo después, el comentario aparece al final del hilo con su número, el encabezado pasa a «5 comentarios» y la caja se vacía (es el reset de la lección 57). Pulsa «Actualizar comentarios»: tu comentario sigue ahí, porque está en el servidor.

Ahora haz fallar la siguiente petición y comenta. Sale el aviso, el hilo no cambia... y **lo que habías escrito se ha borrado**. Ya lo viste en la lección 58: para `<form action>`, una acción que devuelve algo ha terminado bien, y el reset se aplica igual. Lo arreglarás en el paso 5.

Queda otro problema, y es el que más se nota: durante ese segundo de espera, nada en la pantalla dice que se está enviando. ¿Qué hace un lector impaciente?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "<form action={accionPublicar}>\n  <fieldset>\n    <legend>Deja tu comentario</legend>\n    <label>\n      Tu nombre\n      <input name=\"autor\" required />\n    </label>\n    <label>\n      Tu comentario\n      <textarea name=\"texto\" rows={3} required />\n    </label>\n    <button>Comentar</button>\n  </fieldset>\n</form>\n\n// Escribes «Marisa» y tu comentario, y pulsas «Comentar». Como no pasa\n// nada, vuelves a pulsarlo antes de que conteste el servidor, que tarda\n// un segundo por petición. ¿Qué acaba saliendo en el hilo?",
  "opciones": [
    "Tu comentario una vez: el segundo clic no hace nada mientras se envía",
    "Tu comentario dos veces, n.º 5 y n.º 6, los dos a la vez al cabo de unos dos segundos",
    "Tu comentario y otro vacío: el segundo envío sale con los campos ya vaciados",
    "Tu comentario dos veces: el n.º 5 al cabo de un segundo y el n.º 6 un segundo después"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. Mientras la acción está en marcha, el botón sigue activo y los campos siguen llenos, porque el reset espera a que termine (lección 57). El segundo clic envía lo mismo otra vez. useActionState pone esa acción en cola (lección 58) y aplica los dos resultados de una vez, cuando acaba la última: el n.º 5 y el n.º 6 salen juntos."
}
```

**Un formulario que no dice que se está enviando invita a enviarlo otra vez**, y con un comentario el resultado es un duplicado en público. Hacen falta dos cosas: que se vea que se está enviando, y que no se pueda enviar dos veces.

## Paso 3: un botón que sabe que se está enviando

Los campos y el botón están ahora en su propio componente, `CamposComentario`, que `Hilo` pinta **dentro** del `<form>`. Ese es el sitio de `useFormStatus` (lección 59): desde dentro, `pending` dice si el formulario que lo envuelve se está enviando, sin que nadie le pase nada. Con él:

- **El botón dice «Publicando…»** mientras dura el envío.
- **El `fieldset` se desactiva**, y con él todo lo que lleva dentro: los dos campos y el botón. Nadie puede cambiar el texto a medio envío ni pulsar otra vez. Recuerda la trampa de la lección 59: el botón tiene que quedar dentro del `fieldset`. Si se quedara fuera, el segundo clic enviaría el formulario otra vez, y sin los campos, porque un campo desactivado no entra en el `FormData`.

¿Por qué no `isPending`, si `Hilo` ya llama a `useActionState`? Funcionaría pasándolo como prop, y las comprobaciones no verían la diferencia. Pero `CamposComentario` no necesita saber nada de la acción, ni de que existe `useActionState`: le basta con estar dentro de un formulario. Y en `Hilo` no puedes llamar a `useFormStatus`, porque es el componente que pinta el `<form>` y está por encima de él (lección 59).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 3: un botón que sabe que se está enviando",
  "consigna": "En CamposComentario.jsx, usa useFormStatus para que, mientras el formulario se envía, el fieldset esté desactivado y el botón diga «Publicando…». No toques Hilo.jsx. Después prueba a pulsar «Comentar» dos veces seguidas y mira el panel de red.",
  "archivos": [
    {
      "nombre": "CamposComentario.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\n\n// Los campos y el botón, en un componente que va DENTRO del <form> de Hilo.\n// Paso 3: con useFormStatus, mientras el formulario se envía, desactiva el\n// fieldset y haz que el botón diga «Publicando…».\nexport default function CamposComentario() {\n  return (\n    <fieldset>\n      <legend>Deja tu comentario</legend>\n      <label>\n        Tu nombre\n        <input name=\"autor\" required />\n      </label>\n      <label>\n        Tu comentario\n        <textarea name=\"texto\" rows={3} required />\n      </label>\n      <button>Comentar</button>\n    </fieldset>\n  )\n}\n"
    },
    {
      "nombre": "Hilo.jsx",
      "codigo": "import { use, useActionState } from 'react'\nimport { cargarComentarios } from './api'\nimport CamposComentario from './CamposComentario'\nimport { Comentario, contarComentarios } from './piezas'\n\nasync function publicarComentario(estadoAnterior, formData) {\n  const comentario = { autor: formData.get('autor'), texto: formData.get('texto') }\n  const respuesta = await fetch('/api/comentarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(comentario),\n  })\n  if (!respuesta.ok) {\n    return { ...estadoAnterior, error: 'No se ha podido publicar tu comentario. Inténtalo otra vez.' }\n  }\n  // El servidor devuelve el comentario con su número\n  const guardado = await respuesta.json()\n  return { comentarios: [...estadoAnterior.comentarios, guardado], error: null }\n}\n\nexport default function Hilo() {\n  const iniciales = use(cargarComentarios())\n  const [estado, accionPublicar] = useActionState(publicarComentario, {\n    comentarios: iniciales,\n    error: null,\n  })\n\n  return (\n    <section className=\"hilo\">\n      <h3>{contarComentarios(estado.comentarios.length)}</h3>\n      <ul className=\"comentarios\">\n        {estado.comentarios.map((comentario) => (\n          <Comentario key={comentario.id} comentario={comentario} />\n        ))}\n      </ul>\n      <form action={accionPublicar}>\n        <CamposComentario />\n      </form>\n      {estado.error && <p role=\"alert\" className=\"aviso\">{estado.error}</p>}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { olvidarComentarios } from './api'\nimport Hilo from './Hilo'\nimport { Capitulo, LimiteDeError } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  // Cada «Actualizar» tira la promesa guardada y cambia la key: React monta\n  // un hilo nuevo, desde cero, que vuelve a pedir los comentarios.\n  const [version, setVersion] = useState(0)\n\n  function actualizar() {\n    olvidarComentarios()\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <Capitulo />\n      <button type=\"button\" className=\"actualizar\" onClick={actualizar}>\n        Actualizar comentarios\n      </button>\n      <LimiteDeError\n        key={version}\n        onReintentar={olvidarComentarios}\n        alternativa={(_error, reintentar) => (\n          <div role=\"alert\" className=\"fallo\">\n            <p>No se han podido cargar los comentarios.</p>\n            <button onClick={reintentar}>Reintentar</button>\n          </div>\n        )}\n      >\n        <Suspense fallback={<p className=\"cargando\">Cargando comentarios…</p>}>\n          <Hilo />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "let promesa = null\n\n// La promesa del hilo, pedida una vez y guardada aquí fuera, como la caché\n// de la lección 49: use necesita la misma promesa en cada render.\nexport function cargarComentarios() {\n  if (promesa === null) {\n    promesa = fetch('/api/comentarios').then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n      return respuesta.json()\n    })\n  }\n  return promesa\n}\n\n// Para volver a pedirlo: la próxima lectura crea otra promesa\nexport function olvidarComentarios() {\n  promesa = null\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { Component } from 'react'\n\n// La entrega de esta semana. No cambia en todo el proyecto.\nexport function Capitulo() {\n  return (\n    <>\n      <header>\n        <h1>La niebla de Cabo Gris</h1>\n        <p className=\"entrega\">\n          Novela por entregas del taller de escritura Tinta Fresca, de Logroño\n        </p>\n      </header>\n      <article className=\"capitulo\">\n        <h2>Capítulo 7: La lámpara apagada</h2>\n        <p>\n          Aquella noche la niebla subió por los acantilados antes de que nadie la viera\n          venir. A las doce y diez, la lámpara del faro de Cabo Gris se apagó por primera\n          vez en cuarenta años.\n        </p>\n        <p>\n          Desde la ventana de la fonda, Irene contó tres destellos más, cortos y torpes,\n          como si alguien estuviera aprendiendo a encenderla desde dentro.\n        </p>\n        <p className=\"sigue\">Continuará el viernes que viene.</p>\n      </article>\n    </>\n  )\n}\n\n// Un comentario del hilo. Si ya lo ha guardado el servidor, lleva su número;\n// si todavía no (enviando: true), lo dice y sale atenuado.\nexport function Comentario({ comentario }) {\n  return (\n    <li className={comentario.enviando ? 'comentario enviando' : 'comentario'}>\n      <p className=\"firma\">\n        {comentario.autor} · {comentario.enviando ? 'Enviando…' : `n.º ${comentario.id}`}\n      </p>\n      <p className=\"texto\">{comentario.texto}</p>\n    </li>\n  )\n}\n\nexport function contarComentarios(cuantos) {\n  return cuantos === 1 ? '1 comentario' : `${cuantos} comentarios`\n}\n\n// El LimiteDeError de la lección 53, tal cual\nexport class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f6f1e7;\n  color: #2a2522;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 36rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.8rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.entrega {\n  margin: 0.25rem 0 1rem;\n  color: #6b5f55;\n}\n\n.capitulo h2 {\n  margin: 0 0 0.5rem;\n  font: 600 1.2rem Georgia, 'Times New Roman', serif;\n  color: #3d5a73;\n}\n\n.capitulo p {\n  margin: 0 0 0.6rem;\n  font: 1.05rem/1.6 Georgia, 'Times New Roman', serif;\n}\n\n.capitulo .sigue {\n  font-style: italic;\n  color: #6b5f55;\n}\n\n.hilo {\n  margin-top: 0.75rem;\n  padding-top: 0.25rem;\n  border-top: 2px solid #c9bba8;\n}\n\n.comentarios {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.comentario {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #3d5a73;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.comentario p {\n  margin: 0;\n}\n\n.firma {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #3d5a73;\n}\n\n.texto {\n  margin-top: 0.25rem;\n}\n\n/* Lo que todavía no ha confirmado el servidor */\n.enviando {\n  opacity: 0.6;\n  border-left-style: dashed;\n}\n\n.enviando .firma {\n  font-style: italic;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n  margin: 1rem 0 0.5rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #c9bba8;\n  border-radius: 8px;\n  background: #fffdf8;\n}\n\nlegend {\n  padding: 0 0.25rem;\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #b5a690;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 1rem;\n  border: 1px solid #2f4a60;\n  border-radius: 999px;\n  background: #3d5a73;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.7;\n  cursor: progress;\n}\n\n.actualizar {\n  background: transparent;\n  color: #2f4a60;\n}\n\nbutton:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.cargando {\n  color: #6b5f55;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #3d5a73;\n}\n\n/* Los avisos: con caja solo cuando dicen algo */\n.aviso {\n  margin: 0.5rem 0 0;\n  color: #7a1a12;\n}\n\n.aviso:not(:empty),\n.fallo {\n  padding: 0.6rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n  color: #7a1a12;\n}\n\n.fallo p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "CamposComentario.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "comentarios": [
      {
        "id": 1,
        "autor": "Elena",
        "texto": "¡Lo sabía! El farero no se fue a Santander: alguien sigue dentro del faro."
      },
      {
        "id": 2,
        "autor": "Tomás",
        "texto": "Qué bien contáis la niebla. Llevo todo el capítulo oyendo la sirena."
      },
      {
        "id": 3,
        "autor": "Begoña",
        "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
      },
      {
        "id": 4,
        "autor": "Javi",
        "texto": "Por favor, que el capítulo 8 no tarde otra semana."
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "Cuando el servidor contesta, tu comentario está en el hilo y el botón vuelve a decir «Comentar»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · n.º 5"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Comentar"
      }
    },
    {
      "descripcion": "Mientras se publica no se puede enviar otra vez: aunque pulses dos veces, el hilo acaba con 5 comentarios",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Publicando…"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · n.º 5"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "5 comentarios"
      }
    },
    {
      "descripcion": "Si el servidor falla, el botón también vuelve a decir «Comentar»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Comentar"
      }
    },
    {
      "descripcion": "Mientras se publica, el botón dice «Publicando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Publicando…"
      }
    }
  ]
}
```

Pulsa «Comentar» dos veces seguidas: el segundo clic cae sobre un botón desactivado, y en el panel de red sale un solo `POST`. El formulario entero se queda en gris con «Publicando…» hasta que contesta el servidor.

Pero ahora la espera se ve demasiado: un segundo de botón gris y ningún cambio en el hilo. Para algo que casi nunca falla, como un comentario, eso sobra.

## Paso 4: el comentario, al instante

Es el trabajo de `useOptimistic` (lección 60), con la lista de comentarios como valor real. Aquí el valor real ya no es un `useState`, sino **el estado de `useActionState`**, `estado.comentarios`, y la lista optimista va encima:

```jsx
const [visibles, anadirOptimista] = useOptimistic(
  estado.comentarios,
  (actuales, nuevo) => [...actuales, { ...nuevo, enviando: true }],
)
```

La función añade el comentario nuevo al final con `enviando: true`, y `Comentario` ya sabe pintarlo: «Enviando…» en lugar del número, y atenuado. Como en la lección 60, necesita una `key` desde el primer momento, así que lleva un `id` provisional (`temporal-…`); cuando llegue el de verdad, con su número, React montará el definitivo en su lugar.

Queda decidir **dónde se llama a `anadirOptimista`**. Tiene que ser dentro de una acción (lección 60). Podrías llamarlo al principio de `publicarComentario`, pero esa acción va en la cola de `useActionState`, y en «Errores típicos» verás por qué eso puede llegar tarde. Lo seguro es la pista del reto 4 de la lección 60, que es también lo que enseña react.dev en la página de `useActionState`: **la acción del formulario pasa a ser una función tuya**, `comentar(formData)`, que primero pone el comentario provisional y después llama a `accionPublicar(formData)`.

Las dos llamadas van dentro de la transición del formulario, así que React las trata como una sola cosa: **el comentario provisional y el `pending` del botón duran hasta que termina la acción de la cola, y el reset espera a ese momento**. Lo comprobamos: durante todo el envío se ven a la vez el comentario con «Enviando…», «Publicando…» y el texto en la caja, y todo cambia en un mismo commit cuando contesta el servidor.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 4: el comentario, al instante",
  "consigna": "En Hilo.jsx, crea con useOptimistic una lista optimista sobre estado.comentarios, cuya función añada al final el comentario nuevo con enviando: true. La acción del formulario será comentar(formData): primero añade el comentario a la lista optimista, con un id provisional, y después llama a accionPublicar(formData). Pinta y cuenta la lista optimista. Prueba con la latencia en 3 s y con «Fallar la siguiente petición».",
  "archivos": [
    {
      "nombre": "Hilo.jsx",
      "codigo": "import { use, useActionState } from 'react'\nimport { cargarComentarios } from './api'\nimport CamposComentario from './CamposComentario'\nimport { Comentario, contarComentarios } from './piezas'\n\nasync function publicarComentario(estadoAnterior, formData) {\n  const comentario = { autor: formData.get('autor'), texto: formData.get('texto') }\n  const respuesta = await fetch('/api/comentarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(comentario),\n  })\n  if (!respuesta.ok) {\n    return { ...estadoAnterior, error: 'No se ha podido publicar tu comentario. Inténtalo otra vez.' }\n  }\n  // El servidor devuelve el comentario con su número\n  const guardado = await respuesta.json()\n  return { comentarios: [...estadoAnterior.comentarios, guardado], error: null }\n}\n\nexport default function Hilo() {\n  const iniciales = use(cargarComentarios())\n  const [estado, accionPublicar] = useActionState(publicarComentario, {\n    comentarios: iniciales,\n    error: null,\n  })\n  // Paso 4: una lista optimista con useOptimistic sobre estado.comentarios,\n  // cuya función añada el comentario nuevo al final con enviando: true. Pinta\n  // y cuenta esa lista. La acción del <form> será una función tuya,\n  // comentar(formData), que primero añada el comentario (con un id\n  // provisional) a la lista optimista y después llame a accionPublicar.\n\n  return (\n    <section className=\"hilo\">\n      <h3>{contarComentarios(estado.comentarios.length)}</h3>\n      <ul className=\"comentarios\">\n        {estado.comentarios.map((comentario) => (\n          <Comentario key={comentario.id} comentario={comentario} />\n        ))}\n      </ul>\n      <form action={accionPublicar}>\n        <CamposComentario />\n      </form>\n      {estado.error && <p role=\"alert\" className=\"aviso\">{estado.error}</p>}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "CamposComentario.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\n\n// Va dentro del <form> de Hilo: useFormStatus lee el envío del formulario\n// que lo envuelve (lección 59).\nexport default function CamposComentario() {\n  const { pending } = useFormStatus()\n\n  // Desactivado, nada se cambia ni se envía dos veces mientras se publica\n  return (\n    <fieldset disabled={pending}>\n      <legend>Deja tu comentario</legend>\n      <label>\n        Tu nombre\n        <input name=\"autor\" required />\n      </label>\n      <label>\n        Tu comentario\n        <textarea name=\"texto\" rows={3} required />\n      </label>\n      <button>{pending ? 'Publicando…' : 'Comentar'}</button>\n    </fieldset>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { olvidarComentarios } from './api'\nimport Hilo from './Hilo'\nimport { Capitulo, LimiteDeError } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  // Cada «Actualizar» tira la promesa guardada y cambia la key: React monta\n  // un hilo nuevo, desde cero, que vuelve a pedir los comentarios.\n  const [version, setVersion] = useState(0)\n\n  function actualizar() {\n    olvidarComentarios()\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <Capitulo />\n      <button type=\"button\" className=\"actualizar\" onClick={actualizar}>\n        Actualizar comentarios\n      </button>\n      <LimiteDeError\n        key={version}\n        onReintentar={olvidarComentarios}\n        alternativa={(_error, reintentar) => (\n          <div role=\"alert\" className=\"fallo\">\n            <p>No se han podido cargar los comentarios.</p>\n            <button onClick={reintentar}>Reintentar</button>\n          </div>\n        )}\n      >\n        <Suspense fallback={<p className=\"cargando\">Cargando comentarios…</p>}>\n          <Hilo />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "let promesa = null\n\n// La promesa del hilo, pedida una vez y guardada aquí fuera, como la caché\n// de la lección 49: use necesita la misma promesa en cada render.\nexport function cargarComentarios() {\n  if (promesa === null) {\n    promesa = fetch('/api/comentarios').then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n      return respuesta.json()\n    })\n  }\n  return promesa\n}\n\n// Para volver a pedirlo: la próxima lectura crea otra promesa\nexport function olvidarComentarios() {\n  promesa = null\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { Component } from 'react'\n\n// La entrega de esta semana. No cambia en todo el proyecto.\nexport function Capitulo() {\n  return (\n    <>\n      <header>\n        <h1>La niebla de Cabo Gris</h1>\n        <p className=\"entrega\">\n          Novela por entregas del taller de escritura Tinta Fresca, de Logroño\n        </p>\n      </header>\n      <article className=\"capitulo\">\n        <h2>Capítulo 7: La lámpara apagada</h2>\n        <p>\n          Aquella noche la niebla subió por los acantilados antes de que nadie la viera\n          venir. A las doce y diez, la lámpara del faro de Cabo Gris se apagó por primera\n          vez en cuarenta años.\n        </p>\n        <p>\n          Desde la ventana de la fonda, Irene contó tres destellos más, cortos y torpes,\n          como si alguien estuviera aprendiendo a encenderla desde dentro.\n        </p>\n        <p className=\"sigue\">Continuará el viernes que viene.</p>\n      </article>\n    </>\n  )\n}\n\n// Un comentario del hilo. Si ya lo ha guardado el servidor, lleva su número;\n// si todavía no (enviando: true), lo dice y sale atenuado.\nexport function Comentario({ comentario }) {\n  return (\n    <li className={comentario.enviando ? 'comentario enviando' : 'comentario'}>\n      <p className=\"firma\">\n        {comentario.autor} · {comentario.enviando ? 'Enviando…' : `n.º ${comentario.id}`}\n      </p>\n      <p className=\"texto\">{comentario.texto}</p>\n    </li>\n  )\n}\n\nexport function contarComentarios(cuantos) {\n  return cuantos === 1 ? '1 comentario' : `${cuantos} comentarios`\n}\n\n// El LimiteDeError de la lección 53, tal cual\nexport class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f6f1e7;\n  color: #2a2522;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 36rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.8rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.entrega {\n  margin: 0.25rem 0 1rem;\n  color: #6b5f55;\n}\n\n.capitulo h2 {\n  margin: 0 0 0.5rem;\n  font: 600 1.2rem Georgia, 'Times New Roman', serif;\n  color: #3d5a73;\n}\n\n.capitulo p {\n  margin: 0 0 0.6rem;\n  font: 1.05rem/1.6 Georgia, 'Times New Roman', serif;\n}\n\n.capitulo .sigue {\n  font-style: italic;\n  color: #6b5f55;\n}\n\n.hilo {\n  margin-top: 0.75rem;\n  padding-top: 0.25rem;\n  border-top: 2px solid #c9bba8;\n}\n\n.comentarios {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.comentario {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #3d5a73;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.comentario p {\n  margin: 0;\n}\n\n.firma {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #3d5a73;\n}\n\n.texto {\n  margin-top: 0.25rem;\n}\n\n/* Lo que todavía no ha confirmado el servidor */\n.enviando {\n  opacity: 0.6;\n  border-left-style: dashed;\n}\n\n.enviando .firma {\n  font-style: italic;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n  margin: 1rem 0 0.5rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #c9bba8;\n  border-radius: 8px;\n  background: #fffdf8;\n}\n\nlegend {\n  padding: 0 0.25rem;\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #b5a690;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 1rem;\n  border: 1px solid #2f4a60;\n  border-radius: 999px;\n  background: #3d5a73;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.7;\n  cursor: progress;\n}\n\n.actualizar {\n  background: transparent;\n  color: #2f4a60;\n}\n\nbutton:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.cargando {\n  color: #6b5f55;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #3d5a73;\n}\n\n/* Los avisos: con caja solo cuando dicen algo */\n.aviso {\n  margin: 0.5rem 0 0;\n  color: #7a1a12;\n}\n\n.aviso:not(:empty),\n.fallo {\n  padding: 0.6rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n  color: #7a1a12;\n}\n\n.fallo p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Hilo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "comentarios": [
      {
        "id": 1,
        "autor": "Elena",
        "texto": "¡Lo sabía! El farero no se fue a Santander: alguien sigue dentro del faro."
      },
      {
        "id": 2,
        "autor": "Tomás",
        "texto": "Qué bien contáis la niebla. Llevo todo el capítulo oyendo la sirena."
      },
      {
        "id": 3,
        "autor": "Begoña",
        "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
      },
      {
        "id": 4,
        "autor": "Javi",
        "texto": "Por favor, que el capítulo 8 no tarde otra semana."
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "Cuando el servidor contesta, tu comentario se queda con su número: «Marisa · n.º 5»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Marisa · n.º 5"
      }
    },
    {
      "descripcion": "Cuando el servidor contesta, no queda ningún «Enviando…» en el hilo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · n.º 5"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Enviando…"
        }
      }
    },
    {
      "descripcion": "Si el servidor falla, sale el aviso y tu comentario se retira solo del hilo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "la del chubasquero amarillo"
        }
      }
    },
    {
      "descripcion": "Si el servidor falla, el encabezado vuelve a «4 comentarios»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "4 comentarios"
      }
    },
    {
      "descripcion": "Al pulsar «Comentar», tu comentario sale al momento, marcado con «Enviando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Marisa · Enviando…"
      }
    },
    {
      "descripcion": "Mientras se envía, el encabezado ya cuenta tu comentario y el botón dice «Publicando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Marisa · Enviando…"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "5 comentarios"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Publicando…"
      }
    }
  ]
}
```

Sube la latencia a 3 s y comenta: tu comentario aparece al final del hilo en el acto, atenuado y con «Enviando…», y el encabezado ya dice «5 comentarios». Tres segundos después se queda con su número. **Nadie ha escrito «quita el provisional y pon el definitivo»**: al terminar la acción, React descarta la lista optimista y vuelve a pintar el valor real, que para entonces ya trae el comentario guardado.

Ahora pulsa «Fallar la siguiente petición» y comenta. El comentario aparece igual, y cuando llega el `500` desaparece **en el mismo instante** en que sale el aviso. Compáralo con el apoyo de la lección 60, donde el aviso salía un momento antes de que el número volviera atrás: allí el `setError` iba después de un `await`, fuera de la transición. Aquí el error es lo que devuelve la acción, y React lo aplica en el mismo commit en que descarta la lista optimista. Lo comprobamos con un registro en cada commit: el que quita el comentario es el mismo que pone el aviso.

Tampoco has escrito nada para retirarlo: `estado.comentarios` nunca lo tuvo. **Lo que el servidor no confirma no se queda**, y eso es lo que hace segura la interfaz optimista.

## Paso 5: no perder lo escrito, y decirlo

Quedan dos agujeros, y los dos se notan justo cuando algo falla.

**El primero: lo escrito se borra.** Tu comentario se retira del hilo y la caja también se ha vaciado: el comentario se ha perdido entero. La solución es la de la lección 61, tal cual: **la acción devuelve los `valores` que recibió y los campos los usan como `defaultValue`**. El reset devuelve cada campo a su valor inicial, el de ese render, así que vuelve a dejar lo que se envió. Aquí no hay ningún `<select>`, así que no hace falta la `key` de la lección 61.

La diferencia está en lo que se devuelve **cuando sale bien**. En la inscripción de la lección 61 era `valores: {}`, y el formulario se vaciaba entero. En un hilo de comentarios, quien comenta suele volver a comentar: devuelve `valores: { autor }`, y **el nombre se queda mientras la caja se vacía**. Lo comprobamos: con `defaultValue={valores.texto}` a `undefined`, el reset deja la caja vacía.

**El segundo: lo que pasa no se oye.** «Enviando…» en la lista y «Publicando…» en el botón son señales visuales. Quien usa un lector de pantalla pulsa «Comentar» y no oye nada, porque ninguna de las dos está en una región viva (y la lista no debe serlo, lección 37). Como en la lección 61, dos regiones que están en la página desde el principio, vacías, y de las que solo cambia el texto:

- **`role="status"`**: «Publicando tu comentario…» mientras dura el envío y, al terminar, «Tu comentario se ha publicado.». Aquí sí toca `isPending`: quien lo necesita es `Hilo`, el componente que llama a `useActionState` (lección 59).
- **`role="alert"`**: el error, que **se vacía mientras se vuelve a intentar**. Si un reintento fallara con el aviso a la vista, el texto sería el mismo, React no tocaría el DOM y el lector no tendría nada nuevo que anunciar: lo comprobamos con un `MutationObserver` sobre el aviso, y en el segundo fallo no registró ni un cambio. Vaciándolo mientras se publica, el segundo fallo vuelve a escribir el texto y se anuncia otra vez.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 5: no perder lo escrito, y decirlo",
  "consigna": "En Hilo.jsx, añade al estado valores (en el inicial, {}) y mensaje: si falla, valores es lo que se envió; si va bien, { autor } y el mensaje «Tu comentario se ha publicado.». Pasa estado.valores a CamposComentario, que los usa como defaultValue. Debajo del formulario, un <p role=\"status\"> siempre presente («Publicando tu comentario…» mientras isPending; si no, el mensaje), y el aviso, siempre presente y vacío mientras se publica.",
  "archivos": [
    {
      "nombre": "Hilo.jsx",
      "codigo": "import { use, useActionState, useOptimistic } from 'react'\nimport { cargarComentarios } from './api'\nimport CamposComentario from './CamposComentario'\nimport { Comentario, contarComentarios } from './piezas'\n\n// Paso 5: que el estado lleve también valores (en el inicial, {}) y mensaje.\n// Si falla, valores es lo que se envió (lección 61); si va bien, solo\n// { autor }, para que el nombre se quede, y el mensaje «Tu comentario se ha\n// publicado.».\nasync function publicarComentario(estadoAnterior, formData) {\n  const comentario = { autor: formData.get('autor'), texto: formData.get('texto') }\n  const respuesta = await fetch('/api/comentarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(comentario),\n  })\n  if (!respuesta.ok) {\n    return { ...estadoAnterior, error: 'No se ha podido publicar tu comentario. Inténtalo otra vez.' }\n  }\n  // El servidor devuelve el comentario con su número\n  const guardado = await respuesta.json()\n  return { comentarios: [...estadoAnterior.comentarios, guardado], error: null }\n}\n\nexport default function Hilo() {\n  const iniciales = use(cargarComentarios())\n  const [estado, accionPublicar] = useActionState(publicarComentario, {\n    comentarios: iniciales,\n    error: null,\n  })\n  // Encima del hilo confirmado, los comentarios que el servidor aún no ha guardado\n  const [visibles, anadirOptimista] = useOptimistic(\n    estado.comentarios,\n    (actuales, nuevo) => [...actuales, { ...nuevo, enviando: true }],\n  )\n\n  // La acción del formulario: primero el comentario provisional, después la\n  // acción de verdad, que entra en la cola de useActionState\n  function comentar(formData) {\n    anadirOptimista({\n      id: `temporal-${Date.now()}`,\n      autor: formData.get('autor'),\n      texto: formData.get('texto'),\n    })\n    accionPublicar(formData)\n  }\n\n  // Paso 5: pasa estado.valores a CamposComentario. Debajo del formulario,\n  // dos regiones que estén siempre: un <p role=\"status\"> con «Publicando tu\n  // comentario…» mientras isPending (y si no, el mensaje), y el\n  // <p role=\"alert\" className=\"aviso\"> con el error, vacío mientras se publica.\n\n  return (\n    <section className=\"hilo\">\n      <h3>{contarComentarios(visibles.length)}</h3>\n      <ul className=\"comentarios\">\n        {visibles.map((comentario) => (\n          <Comentario key={comentario.id} comentario={comentario} />\n        ))}\n      </ul>\n      <form action={comentar}>\n        <CamposComentario />\n      </form>\n      {estado.error && <p role=\"alert\" className=\"aviso\">{estado.error}</p>}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "CamposComentario.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\n\n// Va dentro del <form> de Hilo: useFormStatus lee el envío del formulario\n// que lo envuelve (lección 59).\n// Paso 5: recibe valores y úsalos como defaultValue de los dos campos.\nexport default function CamposComentario() {\n  const { pending } = useFormStatus()\n\n  // Desactivado, nada se cambia ni se envía dos veces mientras se publica\n  return (\n    <fieldset disabled={pending}>\n      <legend>Deja tu comentario</legend>\n      <label>\n        Tu nombre\n        <input name=\"autor\" required />\n      </label>\n      <label>\n        Tu comentario\n        <textarea name=\"texto\" rows={3} required />\n      </label>\n      <button>{pending ? 'Publicando…' : 'Comentar'}</button>\n    </fieldset>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { olvidarComentarios } from './api'\nimport Hilo from './Hilo'\nimport { Capitulo, LimiteDeError } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  // Cada «Actualizar» tira la promesa guardada y cambia la key: React monta\n  // un hilo nuevo, desde cero, que vuelve a pedir los comentarios.\n  const [version, setVersion] = useState(0)\n\n  function actualizar() {\n    olvidarComentarios()\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <Capitulo />\n      <button type=\"button\" className=\"actualizar\" onClick={actualizar}>\n        Actualizar comentarios\n      </button>\n      <LimiteDeError\n        key={version}\n        onReintentar={olvidarComentarios}\n        alternativa={(_error, reintentar) => (\n          <div role=\"alert\" className=\"fallo\">\n            <p>No se han podido cargar los comentarios.</p>\n            <button onClick={reintentar}>Reintentar</button>\n          </div>\n        )}\n      >\n        <Suspense fallback={<p className=\"cargando\">Cargando comentarios…</p>}>\n          <Hilo />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "let promesa = null\n\n// La promesa del hilo, pedida una vez y guardada aquí fuera, como la caché\n// de la lección 49: use necesita la misma promesa en cada render.\nexport function cargarComentarios() {\n  if (promesa === null) {\n    promesa = fetch('/api/comentarios').then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n      return respuesta.json()\n    })\n  }\n  return promesa\n}\n\n// Para volver a pedirlo: la próxima lectura crea otra promesa\nexport function olvidarComentarios() {\n  promesa = null\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { Component } from 'react'\n\n// La entrega de esta semana. No cambia en todo el proyecto.\nexport function Capitulo() {\n  return (\n    <>\n      <header>\n        <h1>La niebla de Cabo Gris</h1>\n        <p className=\"entrega\">\n          Novela por entregas del taller de escritura Tinta Fresca, de Logroño\n        </p>\n      </header>\n      <article className=\"capitulo\">\n        <h2>Capítulo 7: La lámpara apagada</h2>\n        <p>\n          Aquella noche la niebla subió por los acantilados antes de que nadie la viera\n          venir. A las doce y diez, la lámpara del faro de Cabo Gris se apagó por primera\n          vez en cuarenta años.\n        </p>\n        <p>\n          Desde la ventana de la fonda, Irene contó tres destellos más, cortos y torpes,\n          como si alguien estuviera aprendiendo a encenderla desde dentro.\n        </p>\n        <p className=\"sigue\">Continuará el viernes que viene.</p>\n      </article>\n    </>\n  )\n}\n\n// Un comentario del hilo. Si ya lo ha guardado el servidor, lleva su número;\n// si todavía no (enviando: true), lo dice y sale atenuado.\nexport function Comentario({ comentario }) {\n  return (\n    <li className={comentario.enviando ? 'comentario enviando' : 'comentario'}>\n      <p className=\"firma\">\n        {comentario.autor} · {comentario.enviando ? 'Enviando…' : `n.º ${comentario.id}`}\n      </p>\n      <p className=\"texto\">{comentario.texto}</p>\n    </li>\n  )\n}\n\nexport function contarComentarios(cuantos) {\n  return cuantos === 1 ? '1 comentario' : `${cuantos} comentarios`\n}\n\n// El LimiteDeError de la lección 53, tal cual\nexport class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f6f1e7;\n  color: #2a2522;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 36rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.8rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.entrega {\n  margin: 0.25rem 0 1rem;\n  color: #6b5f55;\n}\n\n.capitulo h2 {\n  margin: 0 0 0.5rem;\n  font: 600 1.2rem Georgia, 'Times New Roman', serif;\n  color: #3d5a73;\n}\n\n.capitulo p {\n  margin: 0 0 0.6rem;\n  font: 1.05rem/1.6 Georgia, 'Times New Roman', serif;\n}\n\n.capitulo .sigue {\n  font-style: italic;\n  color: #6b5f55;\n}\n\n.hilo {\n  margin-top: 0.75rem;\n  padding-top: 0.25rem;\n  border-top: 2px solid #c9bba8;\n}\n\n.comentarios {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.comentario {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #3d5a73;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.comentario p {\n  margin: 0;\n}\n\n.firma {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #3d5a73;\n}\n\n.texto {\n  margin-top: 0.25rem;\n}\n\n/* Lo que todavía no ha confirmado el servidor */\n.enviando {\n  opacity: 0.6;\n  border-left-style: dashed;\n}\n\n.enviando .firma {\n  font-style: italic;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n  margin: 1rem 0 0.5rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #c9bba8;\n  border-radius: 8px;\n  background: #fffdf8;\n}\n\nlegend {\n  padding: 0 0.25rem;\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #b5a690;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 1rem;\n  border: 1px solid #2f4a60;\n  border-radius: 999px;\n  background: #3d5a73;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.7;\n  cursor: progress;\n}\n\n.actualizar {\n  background: transparent;\n  color: #2f4a60;\n}\n\nbutton:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.cargando {\n  color: #6b5f55;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #3d5a73;\n}\n\n/* Los avisos: con caja solo cuando dicen algo */\n.aviso {\n  margin: 0.5rem 0 0;\n  color: #7a1a12;\n}\n\n.aviso:not(:empty),\n.fallo {\n  padding: 0.6rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n  color: #7a1a12;\n}\n\n.fallo p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Hilo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "comentarios": [
      {
        "id": 1,
        "autor": "Elena",
        "texto": "¡Lo sabía! El farero no se fue a Santander: alguien sigue dentro del faro."
      },
      {
        "id": 2,
        "autor": "Tomás",
        "texto": "Qué bien contáis la niebla. Llevo todo el capítulo oyendo la sirena."
      },
      {
        "id": 3,
        "autor": "Begoña",
        "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
      },
      {
        "id": 4,
        "autor": "Javi",
        "texto": "Por favor, que el capítulo 8 no tarde otra semana."
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "La región de estado está en la página desde el principio, antes de comentar",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "alguien sigue dentro del faro"
          }
        }
      ],
      "espera": {
        "rol": "status"
      }
    },
    {
      "descripcion": "La región de los avisos también está desde el principio, vacía",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "alguien sigue dentro del faro"
          }
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Al publicarse, se anuncia «Tu comentario se ha publicado.» y la caja «Tu comentario» queda vacía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Tu comentario se ha publicado."
          }
        }
      ],
      "espera": {
        "etiqueta": "Tu comentario",
        "valor": ""
      }
    },
    {
      "descripcion": "Al publicarse, tu nombre se queda para el siguiente comentario",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Tu comentario se ha publicado."
          }
        }
      ],
      "espera": {
        "etiqueta": "Tu nombre",
        "valor": "Marisa"
      }
    },
    {
      "descripcion": "Si el servidor falla, lo que habías escrito sigue en «Tu comentario»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        }
      ],
      "espera": {
        "etiqueta": "Tu comentario",
        "valor": "Apuesto a que la del chubasquero amarillo es la hija del farero."
      }
    },
    {
      "descripcion": "Tras un fallo, «Comentar» publica lo que se había quedado escrito, nombre incluido, sin volver a escribirlo",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Tu comentario se ha publicado."
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Marisa · n.º 5"
      }
    },
    {
      "descripcion": "Mientras se publica, la región de estado dice «Publicando tu comentario…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Publicando tu comentario…"
      }
    },
    {
      "descripcion": "Al reintentar, el aviso del fallo anterior se vacía mientras se publica, aunque el reintento también vaya a fallar",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Marisa"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu comentario",
            "texto": "Apuesto a que la del chubasquero amarillo es la hija del farero."
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido publicar tu comentario"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Comentar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert",
          "texto": "No se ha podido publicar tu comentario"
        }
      }
    }
  ]
}
```

Haz fallar la siguiente petición y comenta. Tu comentario aparece con «Enviando…», se retira cuando llega el `500`, sale el aviso... y tu texto sigue en la caja, con tu nombre. Pulsa «Comentar» otra vez: el aviso se vacía, la región de estado dice «Publicando tu comentario…» y, esta vez sí, el comentario se queda con su número, la caja se vacía y el nombre sigue ahí para el siguiente.

Fíjate en que el formulario sigue sin un solo `useState`: los campos no están controlados, y lo que dejan escrito al terminar lo decide el estado de la acción.

**Queda un cabo suelto: el foco.** Si comentas con el teclado, el foco está en «Comentar» cuando el `fieldset` se desactiva, y un elemento desactivado no puede tenerlo. Lo comprobamos en Chromium y en WebKit: el foco se va a `<body>` y no vuelve cuando el `fieldset` se reactiva. Quien navega con el teclado o con un lector de pantalla tiene que volver a buscar el formulario. Lo arreglas en el último reto.

## El hilo completo

Estos son los seis archivos con todos los pasos resueltos. Es el sitio para jugar con el panel de red sin miedo a romper nada:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La niebla de Cabo Gris, capítulo 7, con sus comentarios",
  "consigna": "Sube la latencia a 3 s y comenta: tu comentario sale al momento con «Enviando…» y, al llegar la respuesta, se queda con su número. Pulsa «Fallar la siguiente petición» y comenta otra vez: el comentario se retira solo, sale el aviso y tu texto sigue en la caja; «Comentar» lo reintenta. Usa «Actualizar comentarios» para ver lo que tiene de verdad el servidor.",
  "archivos": [
    {
      "nombre": "Hilo.jsx",
      "codigo": "import { use, useActionState, useOptimistic } from 'react'\nimport { cargarComentarios } from './api'\nimport CamposComentario from './CamposComentario'\nimport { Comentario, contarComentarios } from './piezas'\n\nasync function publicarComentario(estadoAnterior, formData) {\n  const comentario = { autor: formData.get('autor'), texto: formData.get('texto') }\n  const respuesta = await fetch('/api/comentarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(comentario),\n  })\n  if (!respuesta.ok) {\n    return {\n      ...estadoAnterior,\n      // Lo que se envió vuelve a los campos con el reset (lección 61)\n      valores: comentario,\n      error: 'No se ha podido publicar tu comentario. Inténtalo otra vez.',\n      mensaje: null,\n    }\n  }\n  // El servidor devuelve el comentario con su número\n  const guardado = await respuesta.json()\n  return {\n    comentarios: [...estadoAnterior.comentarios, guardado],\n    // El nombre se queda para el siguiente comentario; el texto, no\n    valores: { autor: comentario.autor },\n    error: null,\n    mensaje: 'Tu comentario se ha publicado.',\n  }\n}\n\nexport default function Hilo() {\n  const iniciales = use(cargarComentarios())\n  const [estado, accionPublicar, isPending] = useActionState(publicarComentario, {\n    comentarios: iniciales,\n    valores: {},\n    error: null,\n    mensaje: null,\n  })\n  // Encima del hilo confirmado, los comentarios que el servidor aún no ha guardado\n  const [visibles, anadirOptimista] = useOptimistic(\n    estado.comentarios,\n    (actuales, nuevo) => [...actuales, { ...nuevo, enviando: true }],\n  )\n\n  // La acción del formulario: primero el comentario provisional, después la\n  // acción de verdad, que entra en la cola de useActionState\n  function comentar(formData) {\n    anadirOptimista({\n      id: `temporal-${Date.now()}`,\n      autor: formData.get('autor'),\n      texto: formData.get('texto'),\n    })\n    accionPublicar(formData)\n  }\n\n  return (\n    <section className=\"hilo\">\n      <h3>{contarComentarios(visibles.length)}</h3>\n      <ul className=\"comentarios\">\n        {visibles.map((comentario) => (\n          <Comentario key={comentario.id} comentario={comentario} />\n        ))}\n      </ul>\n      <form action={comentar}>\n        <CamposComentario valores={estado.valores} />\n      </form>\n      {/* Las dos regiones están siempre; lo que cambia es su texto (lección 37) */}\n      <p role=\"status\">{isPending ? 'Publicando tu comentario…' : estado.mensaje}</p>\n      <p role=\"alert\" className=\"aviso\">\n        {isPending ? null : estado.error}\n      </p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "CamposComentario.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\n\n// Va dentro del <form> de Hilo: useFormStatus lee el envío del formulario\n// que lo envuelve (lección 59).\nexport default function CamposComentario({ valores }) {\n  const { pending } = useFormStatus()\n\n  // Desactivado, nada se cambia ni se envía dos veces mientras se publica\n  return (\n    <fieldset disabled={pending}>\n      <legend>Deja tu comentario</legend>\n      <label>\n        Tu nombre\n        <input name=\"autor\" required defaultValue={valores.autor} />\n      </label>\n      <label>\n        Tu comentario\n        <textarea name=\"texto\" rows={3} required defaultValue={valores.texto} />\n      </label>\n      <button>{pending ? 'Publicando…' : 'Comentar'}</button>\n    </fieldset>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { olvidarComentarios } from './api'\nimport Hilo from './Hilo'\nimport { Capitulo, LimiteDeError } from './piezas'\nimport './estilos.css'\n\nexport default function App() {\n  // Cada «Actualizar» tira la promesa guardada y cambia la key: React monta\n  // un hilo nuevo, desde cero, que vuelve a pedir los comentarios.\n  const [version, setVersion] = useState(0)\n\n  function actualizar() {\n    olvidarComentarios()\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <Capitulo />\n      <button type=\"button\" className=\"actualizar\" onClick={actualizar}>\n        Actualizar comentarios\n      </button>\n      <LimiteDeError\n        key={version}\n        onReintentar={olvidarComentarios}\n        alternativa={(_error, reintentar) => (\n          <div role=\"alert\" className=\"fallo\">\n            <p>No se han podido cargar los comentarios.</p>\n            <button onClick={reintentar}>Reintentar</button>\n          </div>\n        )}\n      >\n        <Suspense fallback={<p className=\"cargando\">Cargando comentarios…</p>}>\n          <Hilo />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "let promesa = null\n\n// La promesa del hilo, pedida una vez y guardada aquí fuera, como la caché\n// de la lección 49: use necesita la misma promesa en cada render.\nexport function cargarComentarios() {\n  if (promesa === null) {\n    promesa = fetch('/api/comentarios').then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n      return respuesta.json()\n    })\n  }\n  return promesa\n}\n\n// Para volver a pedirlo: la próxima lectura crea otra promesa\nexport function olvidarComentarios() {\n  promesa = null\n}\n"
    },
    {
      "nombre": "piezas.jsx",
      "codigo": "import { Component } from 'react'\n\n// La entrega de esta semana. No cambia en todo el proyecto.\nexport function Capitulo() {\n  return (\n    <>\n      <header>\n        <h1>La niebla de Cabo Gris</h1>\n        <p className=\"entrega\">\n          Novela por entregas del taller de escritura Tinta Fresca, de Logroño\n        </p>\n      </header>\n      <article className=\"capitulo\">\n        <h2>Capítulo 7: La lámpara apagada</h2>\n        <p>\n          Aquella noche la niebla subió por los acantilados antes de que nadie la viera\n          venir. A las doce y diez, la lámpara del faro de Cabo Gris se apagó por primera\n          vez en cuarenta años.\n        </p>\n        <p>\n          Desde la ventana de la fonda, Irene contó tres destellos más, cortos y torpes,\n          como si alguien estuviera aprendiendo a encenderla desde dentro.\n        </p>\n        <p className=\"sigue\">Continuará el viernes que viene.</p>\n      </article>\n    </>\n  )\n}\n\n// Un comentario del hilo. Si ya lo ha guardado el servidor, lleva su número;\n// si todavía no (enviando: true), lo dice y sale atenuado.\nexport function Comentario({ comentario }) {\n  return (\n    <li className={comentario.enviando ? 'comentario enviando' : 'comentario'}>\n      <p className=\"firma\">\n        {comentario.autor} · {comentario.enviando ? 'Enviando…' : `n.º ${comentario.id}`}\n      </p>\n      <p className=\"texto\">{comentario.texto}</p>\n    </li>\n  )\n}\n\nexport function contarComentarios(cuantos) {\n  return cuantos === 1 ? '1 comentario' : `${cuantos} comentarios`\n}\n\n// El LimiteDeError de la lección 53, tal cual\nexport class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  reintentar = () => {\n    this.props.onReintentar?.()\n    this.setState({ error: null })\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error, this.reintentar)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background: #f6f1e7;\n  color: #2a2522;\n  font-family: system-ui, sans-serif;\n}\n\nmain {\n  max-width: 36rem;\n  margin: 0 auto;\n}\n\nh1 {\n  margin: 0;\n  font: 700 1.8rem/1.1 Georgia, 'Times New Roman', serif;\n}\n\n.entrega {\n  margin: 0.25rem 0 1rem;\n  color: #6b5f55;\n}\n\n.capitulo h2 {\n  margin: 0 0 0.5rem;\n  font: 600 1.2rem Georgia, 'Times New Roman', serif;\n  color: #3d5a73;\n}\n\n.capitulo p {\n  margin: 0 0 0.6rem;\n  font: 1.05rem/1.6 Georgia, 'Times New Roman', serif;\n}\n\n.capitulo .sigue {\n  font-style: italic;\n  color: #6b5f55;\n}\n\n.hilo {\n  margin-top: 0.75rem;\n  padding-top: 0.25rem;\n  border-top: 2px solid #c9bba8;\n}\n\n.comentarios {\n  display: grid;\n  gap: 0.6rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.comentario {\n  padding: 0.6rem 0.9rem;\n  border-left: 4px solid #3d5a73;\n  border-radius: 4px;\n  background: #fff;\n}\n\n.comentario p {\n  margin: 0;\n}\n\n.firma {\n  font-size: 0.85rem;\n  font-weight: 600;\n  color: #3d5a73;\n}\n\n.texto {\n  margin-top: 0.25rem;\n}\n\n/* Lo que todavía no ha confirmado el servidor */\n.enviando {\n  opacity: 0.6;\n  border-left-style: dashed;\n}\n\n.enviando .firma {\n  font-style: italic;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.6rem;\n  margin: 1rem 0 0.5rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #c9bba8;\n  border-radius: 8px;\n  background: #fffdf8;\n}\n\nlegend {\n  padding: 0 0.25rem;\n  font-weight: 600;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  font-weight: 600;\n}\n\ninput,\ntextarea {\n  padding: 0.4rem 0.6rem;\n  border: 2px solid #b5a690;\n  border-radius: 6px;\n  font: inherit;\n  font-weight: 400;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 1rem;\n  border: 1px solid #2f4a60;\n  border-radius: 999px;\n  background: #3d5a73;\n  color: #fff;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.7;\n  cursor: progress;\n}\n\n.actualizar {\n  background: transparent;\n  color: #2f4a60;\n}\n\nbutton:focus-visible,\ninput:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #d97706;\n  outline-offset: 2px;\n}\n\n.cargando {\n  color: #6b5f55;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #3d5a73;\n}\n\n/* Los avisos: con caja solo cuando dicen algo */\n.aviso {\n  margin: 0.5rem 0 0;\n  color: #7a1a12;\n}\n\n.aviso:not(:empty),\n.fallo {\n  padding: 0.6rem 1rem;\n  border: 2px solid #b42318;\n  border-radius: 8px;\n  background: #fef3f2;\n  color: #7a1a12;\n}\n\n.fallo p {\n  margin: 0 0 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Hilo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "api": {
    "comentarios": [
      {
        "id": 1,
        "autor": "Elena",
        "texto": "¡Lo sabía! El farero no se fue a Santander: alguien sigue dentro del faro."
      },
      {
        "id": 2,
        "autor": "Tomás",
        "texto": "Qué bien contáis la niebla. Llevo todo el capítulo oyendo la sirena."
      },
      {
        "id": 3,
        "autor": "Begoña",
        "texto": "¿Y los tres destellos? Para mí son una señal para alguien del puerto."
      },
      {
        "id": 4,
        "autor": "Javi",
        "texto": "Por favor, que el capítulo 8 no tarde otra semana."
      }
    ]
  },
  "red": {
    "latencia": 1000
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
      "etiqueta": "estado: version",
      "nota": "← «Actualizar comentarios» cambia la key"
    },
    {
      "nombre": "Capitulo",
      "nivel": 1
    },
    {
      "nombre": "LimiteDeError",
      "nivel": 1,
      "clave": "version",
      "etiqueta": "fallo de carga",
      "nota": "← «Reintentar» olvida la promesa"
    },
    {
      "nombre": "Suspense",
      "nivel": 2,
      "etiqueta": "espera",
      "nota": "← «Cargando comentarios…»"
    },
    {
      "nombre": "Hilo",
      "nivel": 3,
      "etiqueta": "useActionState",
      "nota": "← use(cargarComentarios()), useOptimistic e isPending"
    },
    {
      "nombre": "Comentario",
      "nivel": 4,
      "clave": "comentario.id",
      "nota": "← «n.º 5» o «Enviando…»"
    },
    {
      "nombre": "form",
      "nivel": 4,
      "etiqueta": "proveedor",
      "nota": "← action={comentar}"
    },
    {
      "nombre": "CamposComentario",
      "nivel": 5,
      "etiqueta": "useFormStatus()",
      "nota": "← fieldset desactivado y «Publicando…»"
    }
  ]
}
```

Hay tres formas de decir «se está enviando» en este hilo, y cada una vive donde se necesita:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres «pendientes», cada uno en su sitio",
  "roles": [
    {
      "etiqueta": "enviando: true",
      "rol": "En cada comentario provisional",
      "descripcion": "Lo pone la función de useOptimistic. Comentario lo pinta como «Enviando…». Desaparece solo cuando la lista optimista se descarta."
    },
    {
      "etiqueta": "pending de useFormStatus",
      "rol": "En CamposComentario",
      "descripcion": "Dentro del formulario, sin props: desactiva el fieldset y cambia el botón a «Publicando…»."
    },
    {
      "etiqueta": "isPending de useActionState",
      "rol": "En Hilo",
      "descripcion": "Donde se llama al Hook: la región de estado dice «Publicando tu comentario…» y el aviso viejo se vacía."
    }
  ]
}
```

Y esto es lo que pasa, de principio a fin, cuando el servidor falla:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Comentas y el servidor falla",
  "items": [
    {
      "fecha": "Clic",
      "titulo": "comentar, dentro de una transición",
      "texto": "React frena el envío del navegador y llama a comentar con el FormData. anadirOptimista pone tu comentario al final con enviando: true, y accionPublicar mete la acción en la cola de useActionState."
    },
    {
      "fecha": "Mismo render",
      "titulo": "Todo dice que se está enviando",
      "texto": "El comentario sale con «Enviando…» y el encabezado cuenta 5. useFormStatus da pending: el fieldset se desactiva y el botón dice «Publicando…». isPending vacía el aviso y la región de estado dice «Publicando tu comentario…»."
    },
    {
      "fecha": "Espera",
      "titulo": "El POST va y viene",
      "texto": "Tu texto sigue en la caja, en gris: el reset espera a que termine la acción."
    },
    {
      "fecha": "500",
      "titulo": "La acción devuelve el error",
      "texto": "publicarComentario no lanza: devuelve el estado anterior con el error y con los valores que se enviaron."
    },
    {
      "fecha": "Commit",
      "titulo": "Todo cambia a la vez",
      "texto": "La lista optimista se descarta y tu comentario se va, porque estado.comentarios nunca lo tuvo. Sale el aviso, el botón vuelve a «Comentar» y el reset deja en los campos sus defaultValue nuevos: lo que habías escrito."
    }
  ]
}
```

Fíjate también en lo que **no** hay: ni un `useEffect`, ni un estado `cargando`, ni un `setEnviando(true)`. La carga es `use` con `<Suspense>`; el envío, una acción; y lo pendiente lo sabe React.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Mensajes y comentarios",
      "texto": "Un chat, los comentarios de un artículo, las respuestas de un foro: lo que escribes se ve en el acto, casi nunca falla, y si falla vuelve a tu caja de texto."
    },
    {
      "titulo": "Cualquier lista que crece desde un formulario",
      "texto": "Tareas, una lista de la compra compartida, las notas de un pedido. El mismo trío: useActionState para el estado confirmado, useOptimistic encima y useFormStatus en el botón."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Si el servidor decide si se publica, como un hilo con moderación previa, el comentario optimista mentiría: mejor «Enviado: lo verás cuando lo aprueben». Y si el resultado depende del servidor (un precio, una plaza contada), enseña que se está enviando y espera (lección 60)."
    },
    {
      "titulo": "Con un framework",
      "texto": "La acción de publicar sería una Server Function que se ejecuta en el servidor (lección 89). El resto del componente apenas cambia: useActionState, useOptimistic y useFormStatus trabajan igual con ella."
    }
  ]
}
```

## Errores típicos

**Llamar al setter optimista dentro de la acción de `useActionState`.** Parece lo más directo: un solo sitio para todo. Pero esa acción va en cola. Para verlo, quítale al formulario el `fieldset` desactivado y envía dos comentarios seguidos:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [estado, accionPublicar] = useActionState(publicarComentario, inicial)\nconst [visibles, anadirOptimista] = useOptimistic(\n  estado.comentarios,\n  (actuales, nuevo) => [...actuales, { ...nuevo, enviando: true }],\n)\n\nasync function publicarComentario(estadoAnterior, formData) {\n  anadirOptimista({\n    id: `temporal-${Date.now()}`,\n    autor: formData.get('autor'),\n    texto: formData.get('texto'),\n  })\n  const respuesta = await fetch('/api/comentarios', { method: 'POST' /* … */ })\n  // ...tarda un segundo y devuelve el estado nuevo\n}\n\n<form action={accionPublicar}>…</form>\n\n// Sin nada desactivado, pulsas «Comentar» dos veces, muy deprisa.\n// ¿Cuántos comentarios con «Enviando…» ves justo después del segundo clic?",
  "opciones": [
    "Dos: uno por cada clic",
    "Uno: el segundo no sale hasta que termina el primer envío",
    "Ninguno: useOptimistic no funciona dentro de useActionState",
    "Uno, porque el segundo clic no llega a enviar nada"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. Las acciones de useActionState van en cola (lección 58): la segunda no empieza hasta que acaba la primera, y su anadirOptimista está dentro, así que su comentario sale un segundo tarde. Llamando al setter en comentar, antes de accionPublicar, cada clic pone el suyo en el acto. En los dos casos, al final llegan los dos juntos."
}
```

En el proyecto no lo notarías, porque el `fieldset` desactivado impide enviar dos veces. Pero el día que quites esa protección (un chat, donde se escribe el siguiente mensaje mientras sale el anterior), el comentario provisional dejaría de ser instantáneo. El setter optimista va **antes** de la cola.

**Pintar `estado.comentarios` en lugar de la lista optimista.** Todo funciona y nada es instantáneo: el comentario sale cuando contesta el servidor. Y si cuentas una lista y pintas la otra, el encabezado dice «4 comentarios» encima de cinco.

**Olvidar meter en el estado el comentario guardado.** Si la acción devuelve `estadoAnterior` también cuando todo va bien, el comentario provisional se descarta al terminar y desaparece, aunque el servidor lo haya guardado. «Actualizar comentarios» lo delata: ahí está. Es el «Olvidar el valor real» de la lección 60.

**Lanzar el error del servidor.** Lo contaba el paso 2: el `LimiteDeError` cambiaría el hilo entero por un aviso de carga, y además React cancelaría lo que hubiera en la cola (lección 58). Un fallo esperado se devuelve.

**Conservar lo escrito con `value`.** Con `value={valores.texto}` y sin `onChange`, la caja se queda bloqueada y React avisa en la consola. Es uno de los errores típicos de la lección 61: estos campos no están controlados, así que `defaultValue`.

**`useFormStatus` en `Hilo`.** `pending` se queda en `false` todo el envío y nada avisa: `Hilo` pinta el `<form>` y está por encima de él (lección 59). Por eso `CamposComentario` es un componente aparte.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El hilo es el estado de la acción",
      "texto": "useActionState guarda lo que devuelve publicar: los comentarios confirmados, el error, los valores y el mensaje. Cada camino de la acción devuelve un estado completo, y ningún fallo esperado se lanza."
    },
    {
      "titulo": "Lo optimista va encima, y se retira solo",
      "texto": "useOptimistic parte de estado.comentarios y añade el provisional con enviando: true. Al terminar la acción se descarta; si el servidor lo guardó, el real ya lo trae, y si no, desaparece en el mismo commit que sale el aviso."
    },
    {
      "titulo": "El setter optimista, antes de la cola",
      "texto": "La acción del formulario es una función tuya que primero llama a anadirOptimista y después a la acción de useActionState. Las dos van en la misma transición, que dura hasta que acaba la de la cola."
    },
    {
      "titulo": "Tres pendientes, cada uno en su sitio",
      "texto": "enviando: true en el comentario, pending de useFormStatus dentro del formulario e isPending en el componente que llama a useActionState."
    },
    {
      "titulo": "El reset va al defaultValue",
      "texto": "Devolviendo los valores (lección 61), el reset conserva lo escrito si falla. Devolviendo solo el autor cuando sale bien, el nombre se queda y la caja se vacía."
    },
    {
      "titulo": "Una región que cambia es una región que se oye",
      "texto": "Las dos regiones están desde el principio. «Publicando…» y «publicado» se alternan, y el aviso se vacía al reintentar para que un segundo fallo vuelva a anunciarse."
    }
  ]
}
```

## Retos para seguir practicando

Parte del hilo completo. Estos no tienen comprobación automática:

1. **Borrar tu comentario.** Un botón «Borrar» en cada comentario que hace `DELETE /api/comentarios/<id>`: el comentario desaparece en el acto y vuelve si el servidor falla. La acción tendrá que distinguir tipos (`{ tipo: 'borrar', id }`), como el reto 3 de la lección 58, y la función de `useOptimistic`, saber añadir y quitar (en react.dev, «Handling multiple action types»).
2. **Un contador de caracteres.** Máximo 280, con «Te quedan 37» debajo de la caja. Para contar mientras se escribe hay que leer la caja en cada tecla: ¿la controlas (lección 22) y la vacías tú al publicar? ¿Qué pasa entonces con los `valores` del paso 5?
3. **Validar antes de enviar.** `required` deja pasar un comentario de solo espacios. Valida en la acción como en la lección 61 y devuelve el error sin llamar al servidor. ¿Debería salir el comentario provisional en ese caso? ¿Dónde lo compruebas para que no salga?
4. **Que el foco no se pierda.** Cuando termine la publicación, devuelve el foco a la caja «Tu comentario»: vacía y lista para el siguiente si ha salido bien, o con el texto para reintentarlo si ha fallado. Necesitas una ref a la caja (lección 34) y un efecto que se ejecute cuando cambie el estado de la acción, como el foco de la lección 61. ¿Por qué no basta con llamar a `focus()` al final de `comentar`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useOptimistic",
      "descripcion": "Cómo fluye el valor optimista, listas con su función, varios tipos de cambio y el borrado con recuperación, que te sirve para el primer reto.",
      "url": "https://react.dev/reference/react/useOptimistic",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useActionState: Using with useOptimistic",
      "descripcion": "El patrón de este proyecto en el ejemplo de react.dev: el setter optimista y la acción de la cola, llamados en la misma transición.",
      "url": "https://react.dev/reference/react/useActionState#using-with-useoptimistic",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<form>: Optimistically updating form data",
      "descripcion": "Un hilo de mensajes con «Sending...», el ejemplo de react.dev de un formulario optimista.",
      "url": "https://react.dev/reference/react-dom/components/form#optimistically-updating-form-data",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useFormStatus",
      "descripcion": "pending, data y action desde un componente dentro del formulario, y por qué no funciona en el que lo pinta.",
      "url": "https://react.dev/reference/react-dom/hooks/useFormStatus",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "ARIA live regions",
      "descripcion": "role=\"status\" y role=\"alert\", y por qué una región tiene que existir antes de que cambie su contenido.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
      "etiqueta": "MDN"
    },
    {
      "titulo": "HTMLTextAreaElement: defaultValue",
      "descripcion": "El valor inicial de una caja de texto, que es el que restablece el reset del formulario.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/defaultValue",
      "etiqueta": "MDN"
    }
  ]
}
```
