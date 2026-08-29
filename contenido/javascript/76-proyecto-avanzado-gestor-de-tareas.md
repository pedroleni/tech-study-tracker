# Proyecto avanzado: gestor de tareas con arquitectura real

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-gestor-de-tareas-con-arquitectura-real` (autogenerado del título)
- **Orden:** 500
- **Repositorio:** [github.com/pedroleni/gestor-de-tareas-js](https://github.com/pedroleni/gestor-de-tareas-js)
- **Requiere:** El proyecto "Lista de tareas interactiva", módulos ES (lección 54, aunque no tuviera bloque en vivo) y closures/estado (lección 23)

---

## Qué vas a construir

El mismo gestor de tareas que ya construiste en el proyecto sencillo — pero hecho como se haría en un proyecto real: en varios archivos, con un **estado centralizado** del que cuelga todo lo demás, y con **persistencia de verdad** en `localStorage`. No vive en el editor en vivo de esta web: es un repositorio real que clonas y ejecutas en tu propio ordenador.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/gestor-de-tareas-js — la rama main tiene el HTML y el CSS ya terminados, y los cuatro archivos de src/ con la firma de cada función y un TODO explicando qué hacer. La rama solucion tiene la implementación completa, por si te atascas."
}
```

## Por qué esto no cabe en un editor en vivo

Los bloques `editor-en-vivo` de esta web viven dentro de un `<iframe sandbox="allow-scripts">` — deliberadamente sin `allow-same-origin`, para que el código de la lección nunca tenga acceso a las cookies o la sesión del resto de la página. Ese mismo aislamiento (un origen "opaco", sin dirección real) tiene dos efectos que chocan de frente con este proyecto:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que un origen opaco no puede hacer",
  "roles": [
    { "etiqueta": "Módulos ES", "rol": "import/export entre varios archivos", "descripcion": "Necesitan que el navegador resuelva rutas reales entre archivos servidos — un único iframe con todo el JS pegado no es lo mismo." },
    { "etiqueta": "localStorage", "rol": "Persistencia real", "descripcion": "Un documento con origen opaco no tiene almacenamiento propio — el navegador lo deshabilita directamente (lo viste de primera mano en la lección 62)." }
  ]
}
```

Por eso este proyecto se sale del sandbox: es la primera vez en el curso donde vas a ejecutar código en tu propio ordenador, con un servidor local de verdad.

## Arquitectura del proyecto

Cuatro archivos en `src/`, cada uno con una única responsabilidad — el principio real detrás de "arquitectura": que cada pieza sepa hacer una cosa, y que las demás no necesiten saber cómo la hace por dentro.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Una responsabilidad por archivo",
  "roles": [
    { "etiqueta": "estado.js", "rol": "La única fuente de verdad", "descripcion": "Guarda las tareas y el filtro activo. Nadie más los guarda por su cuenta — todo el mundo pregunta aquí." },
    { "etiqueta": "almacenamiento.js", "rol": "Persistencia", "descripcion": "Leer y escribir en localStorage. No sabe nada de tareas ni de DOM, solo de guardar y recuperar." },
    { "etiqueta": "vista.js", "rol": "Pintar el DOM", "descripcion": "Lee el estado y reconstruye la lista. Nunca decide nada por su cuenta, solo refleja lo que ya es verdad." },
    { "etiqueta": "main.js", "rol": "Conectar todo", "descripcion": "Escucha clics y envíos de formulario, y llama a las funciones de estado.js. No pinta nada ni guarda nada directamente." }
  ]
}
```

## Antes de empezar

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los módulos ES necesitan un servidor, no file://",
  "contenido": "Clona el repositorio y, dentro de la carpeta, ejecuta npx serve . (o python3 -m http.server si no tienes Node) — abrir index.html haciendo doble clic no funciona: los navegadores bloquean import/export cuando la página se carga desde el disco directamente."
}
```

## Paso 1: el estado centralizado (`estado.js`)

Todo cuelga de un array `tareas` y un `filtroActual`, ninguno de los dos exportado directamente — solo se puede tocarlos a través de las funciones de este archivo. Es el mismo principio que ya viste en `property-descriptors` (lección 26): decidir qué queda encapsulado y qué se expone.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "let tareas = [];\nlet filtroActual = 'todas';\nconst suscriptores = [];\n\nexport function inicializarEstado(tareasIniciales) {\n  tareas = tareasIniciales;\n  notificar();\n}\n\nexport function añadirTarea(texto) {\n  const textoLimpio = texto.trim();\n  if (!textoLimpio) return;\n  tareas.push({\n    id: crypto.randomUUID(),\n    texto: textoLimpio,\n    completada: false,\n    creadaEn: new Date().toISOString(),\n  });\n  notificar();\n}\n\nexport function suscribir(fn) {\n  suscriptores.push(fn);\n  return () => {\n    const indice = suscriptores.indexOf(fn);\n    if (indice !== -1) suscriptores.splice(indice, 1);\n  };\n}\n\nfunction notificar() {\n  for (const fn of suscriptores) fn();\n}",
  "anotaciones": [
    { "fragmento": "let tareas = [];\nlet filtroActual = 'todas';\nconst suscriptores = [];", "nota": "Variables de módulo, no exportadas. Solo son accesibles desde dentro de este archivo — exactamente el mismo aislamiento que daba una closure (lección 23), pero a nivel de archivo entero en vez de función." },
    { "fragmento": "tareas.push({\n    id: crypto.randomUUID(),\n    texto: textoLimpio,\n    completada: false,\n    creadaEn: new Date().toISOString(),\n  });\n  notificar();", "nota": "Cada función que cambia el estado termina en notificar() — es lo que dispara el repintado en vista.js sin que este archivo sepa que vista.js existe." },
    { "fragmento": "export function suscribir(fn) {\n  suscriptores.push(fn);\n  return () => {\n    const indice = suscriptores.indexOf(fn);\n    if (indice !== -1) suscriptores.splice(indice, 1);\n  };\n}", "nota": "Un patrón real de pub/sub en miniatura: cualquiera puede suscribirse sin que estado.js necesite conocer a sus suscriptores de antemano. La función devuelta permite cancelar la suscripción — el mismo patrón que devuelve addEventListener con AbortController." }
  ]
}
```

## Paso 2: persistencia real (`almacenamiento.js`)

El archivo más corto, y el que de verdad no se podía enseñar en vivo hasta ahora.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "const CLAVE = 'gestor-de-tareas:v1';\n\nexport function cargarTareas() {\n  try {\n    const guardado = localStorage.getItem(CLAVE);\n    return guardado ? JSON.parse(guardado) : [];\n  } catch (error) {\n    console.error('No se pudieron leer las tareas guardadas:', error);\n    return [];\n  }\n}\n\nexport function guardarTareas(tareas) {\n  try {\n    localStorage.setItem(CLAVE, JSON.stringify(tareas));\n  } catch (error) {\n    console.error('No se pudieron guardar las tareas:', error);\n  }\n}",
  "anotaciones": [
    { "fragmento": "const CLAVE = 'gestor-de-tareas:v1';", "nota": "El :v1 al final no es decorativo — si algún día cambias la forma de los datos guardados, subir a :v2 evita que un usuario con datos viejos reciba un JSON.parse() con una forma que tu código ya no espera." },
    { "fragmento": "try {\n    const guardado = localStorage.getItem(CLAVE);\n    return guardado ? JSON.parse(guardado) : [];\n  } catch (error) {", "nota": "Un try/catch de verdad, no decorativo: localStorage puede lanzar (modo privado de Safari, cuota llena) y un JSON corrupto también. Sin esto, un error aquí tumbaría toda la aplicación al cargar." }
  ]
}
```

## Paso 3: la vista que se redibuja sola (`vista.js`)

El patrón "estado → render": en vez de buscar el `<li>` exacto que cambió y mutarlo a mano, se destruye la lista entera y se reconstruye desde el estado en cada cambio. Suena más caro, pero es muchísimo más difícil de dejar en un estado inconsistente — es la misma idea que hace tan predecible a React, sin usar React.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "export function renderizar() {\n  const visibles = obtenerTareasVisibles();\n  const todas = obtenerTodasLasTareas();\n\n  lista.textContent = '';\n  for (const tarea of visibles) {\n    lista.appendChild(crearElementoTarea(tarea));\n  }\n\n  mensajeVacio.hidden = visibles.length > 0;\n\n  const pendientes = todas.filter((tarea) => !tarea.completada).length;\n  contador.textContent = `${pendientes} ${pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;\n}",
  "anotaciones": [
    { "fragmento": "lista.textContent = '';\n  for (const tarea of visibles) {\n    lista.appendChild(crearElementoTarea(tarea));\n  }", "nota": "Vaciar y reconstruir, no mutar in situ. No hay ningún camino en el que la lista visible pueda desincronizarse del estado — siempre es exactamente lo que obtenerTareasVisibles() diga en ese instante." },
    { "fragmento": "const pendientes = todas.filter((tarea) => !tarea.completada).length;\n  contador.textContent = `${pendientes} ${pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;", "nota": "El contador cuenta sobre TODAS las tareas, no solo las visibles — si filtras por \"completadas\", el contador de pendientes debe seguir siendo el real, no el de la vista filtrada." }
  ]
}
```

## Paso 4: conectar todo (`main.js`)

El único archivo que sabe que existen tanto `estado.js` como `vista.js` como `almacenamiento.js` — y el orden en que se conectan importa.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "javascript",
  "codigo": "suscribir(() => {\n  renderizar();\n  guardarTareas(obtenerTodasLasTareas());\n});\n\ninicializarEstado(cargarTareas());\n\nlista.addEventListener('click', (evento) => {\n  const elementoTarea = evento.target.closest('.tarea');\n  if (!elementoTarea) return;\n  const id = elementoTarea.dataset.id;\n\n  if (evento.target.matches('.tarea-checkbox')) {\n    alternarCompletada(id);\n  } else if (evento.target.matches('.tarea-borrar')) {\n    borrarTarea(id);\n  }\n});",
  "anotaciones": [
    { "fragmento": "suscribir(() => {\n  renderizar();\n  guardarTareas(obtenerTodasLasTareas());\n});\n\ninicializarEstado(cargarTareas());", "nota": "La suscripción va ANTES de inicializarEstado() a propósito: inicializarEstado() ya notifica a los suscriptores, así que si te suscribieras después, te perderías el primer render." },
    { "fragmento": "lista.addEventListener('click', (evento) => {\n  const elementoTarea = evento.target.closest('.tarea');\n  if (!elementoTarea) return;\n  const id = elementoTarea.dataset.id;", "nota": "Un único listener en la lista completa (delegación, lección 45), no uno por tarea — funciona igual para tareas que ni existían cuando se registró el listener, porque vista.js las reconstruye constantemente." }
  ]
}
```

## Antes vs. después: la diferencia real

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "lista.addEventListener('click', (evento) => {\n  if (evento.target.classList.contains('borrar')) {\n    evento.target.closest('li').remove();\n    return;\n  }\n  if (evento.target.tagName === 'LI') {\n    evento.target.classList.toggle('completada');\n  }\n});",
  "despues": "lista.addEventListener('click', (evento) => {\n  const elementoTarea = evento.target.closest('.tarea');\n  if (!elementoTarea) return;\n  const id = elementoTarea.dataset.id;\n  if (evento.target.matches('.tarea-checkbox')) {\n    alternarCompletada(id);\n  } else if (evento.target.matches('.tarea-borrar')) {\n    borrarTarea(id);\n  }\n});",
  "nota": "El de antes es el proyecto sencillo del sandbox: el DOM ES el estado — borrar un <li> del DOM es la única forma de \"olvidar\" esa tarea, no hay ningún array por detrás. El de después llama a funciones de estado.js; el DOM es solo un reflejo que se puede reconstruir en cualquier momento (y por eso persiste en localStorage: hay algo real que guardar, más allá de lo que se ve en pantalla)."
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿Ningún archivo hace el trabajo de otro?", "texto": "vista.js no debería tocar el array de tareas directamente, ni estado.js debería tocar el DOM. Si te encuentras haciéndolo, es una señal de que algo está en el archivo equivocado." },
    { "titulo": "¿Sobrevive a recargar la página?", "texto": "Añade tareas, recarga con F5, y comprueba que siguen ahí — es la prueba real de que almacenamiento.js funciona, algo que nunca pudiste comprobar en el sandbox." },
    { "titulo": "¿Un JSON corrupto en localStorage no rompe la app?", "texto": "Abre las DevTools, escribe localStorage.setItem('gestor-de-tareas:v1', 'esto no es json') a mano, y recarga — con el try/catch bien puesto, la app debería arrancar vacía, no romperse." }
  ]
}
```

## Retos para ampliarlo

1. Añade edición inline: doble clic sobre el texto de una tarea la convierte en un input editable.
2. Añade un botón "Borrar completadas" que las quite todas de golpe (piensa en qué función de `estado.js` necesitarías añadir).
3. Sustituye `almacenamiento.js` por una versión que sincronice con una API real usando `fetch()` — la interfaz pública (`cargarTareas`/`guardarTareas`) no tendría por qué cambiar, solo lo que hacen por dentro. Esa es la prueba de que la separación en capas funcionó de verdad.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "gestor-de-tareas-js (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo, con los TODO ya puestos.",
      "url": "https://github.com/pedroleni/gestor-de-tareas-js/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "gestor-de-tareas-js (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/gestor-de-tareas-js/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "JavaScript modules",
      "descripcion": "Guía de referencia de MDN sobre import/export y por qué los módulos ES necesitan servirse por HTTP, no abrirse con file://.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
      "etiqueta": "MDN"
    }
  ]
}
```
