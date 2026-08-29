# Proyecto: buscador de Pokémon con fetch

- **Módulo:** Proyectos
- **Slug:** `proyecto-buscador-de-pokemon-con-fetch` (autogenerado del título)
- **Orden:** 405
- **Requiere:** Lecciones 49-52 (promesas, async/await, fetch)

---

## Qué vas a construir

Un buscador real: escribes el nombre de un Pokémon, pulsas buscar, y la interfaz hace una petición real a una API pública (PokeAPI), gestiona el estado de carga, maneja el error si no existe, y construye el resultado en el DOM sin usar `innerHTML` en ningún momento.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una API real, no simulada",
  "contenido": "pokeapi.co es una API pública gratuita con CORS abierto — la petición que vas a escribir es idéntica a la que harías en un proyecto real desplegado, no una simulación."
}
```

## Paso 1: la petición básica

Escribe una función `async` que haga `fetch` a `https://pokeapi.co/api/v2/pokemon/pikachu`, compruebe `response.ok`, y muestre el nombre recibido.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: fetch básico",
  "consigna": "Completa buscarPokemon(): usa await fetch(...), comprueba respuesta.ok (si no, throw new Error), y llama a mostrar() con datos.name.",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\n\nasync function buscarPokemon(nombre) {\n  // const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon/' + nombre);\n  // comprueba respuesta.ok, luego await respuesta.json(), luego mostrar(datos.name)\n}\n\nbuscarPokemon('pikachu');",
  "pestañaInicial": "js"
}
```

## Paso 2: la interfaz de búsqueda

Un input, un botón y una zona de resultado. Al pulsar buscar, llama a tu función con el valor del input en minúsculas.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: conectar la interfaz",
  "consigna": "Conecta el botón #buscar a un manejador que llame a buscarPokemon() con el valor de #nombre en minúsculas. Muestra 'Buscando...' en #resultado mientras esperas la respuesta.",
  "html": "<input id=\"nombre\" value=\"charizard\">\n<button id=\"buscar\">Buscar</button>\n<div id=\"resultado\"></div>",
  "css": "body { font-family: system-ui, sans-serif; padding: 1rem; }\ninput { padding: 6px 10px; }\nbutton { padding: 6px 14px; }",
  "js": "const resultado = document.getElementById('resultado');\n\nasync function buscarPokemon(nombre) {\n  resultado.textContent = 'Buscando...';\n  const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon/' + nombre);\n  if (!respuesta.ok) throw new Error('No encontrado');\n  const datos = await respuesta.json();\n  resultado.textContent = datos.name + ' (peso: ' + datos.weight + ')';\n}\n\n// document.getElementById('buscar').addEventListener('click', () => { ... });",
  "pestañaInicial": "js"
}
```

## Paso 3: manejar el error y construir el DOM sin innerHTML

Si el Pokémon no existe, muestra un mensaje de error en vez de romper la página. Si existe, construye la imagen, el nombre y los tipos con `createElement()`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Escribe todo dentro de un try/catch: si falla, muestra un mensaje de error en #resultado. Si funciona, limpia #resultado y añade una img (datos.sprites.front_default), un h3 con el nombre, y un span por cada tipo — todo con createElement()/appendChild()/textContent, sin innerHTML.",
  "html": "<div class=\"buscador\">\n  <input id=\"nombre\" value=\"pikachu\">\n  <button id=\"buscar\">Buscar</button>\n</div>\n<div id=\"resultado\"></div>",
  "css": "body { font-family: system-ui, sans-serif; padding: 1rem; }\n.buscador { display: flex; gap: 8px; margin-bottom: 12px; }\ninput { padding: 6px 10px; }\nbutton { padding: 6px 14px; cursor: pointer; }\n#resultado { text-align: center; }\n#resultado img { width: 96px; height: 96px; }\n.tipo { display: inline-block; padding: 2px 10px; margin: 2px; border-radius: 999px; background: #f4f1ea; font-size: 12px; text-transform: capitalize; }",
  "js": "const boton = document.getElementById('buscar');\nconst input = document.getElementById('nombre');\nconst resultado = document.getElementById('resultado');\n\nasync function buscarPokemon() {\n  resultado.textContent = 'Buscando...';\n  try {\n    const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon/' + input.value.toLowerCase().trim());\n    if (!respuesta.ok) throw new Error('No se encontró ese Pokémon');\n    const datos = await respuesta.json();\n\n    resultado.textContent = '';\n\n    const img = document.createElement('img');\n    img.src = datos.sprites.front_default;\n    img.alt = datos.name;\n\n    const titulo = document.createElement('h3');\n    titulo.textContent = datos.name;\n\n    resultado.appendChild(img);\n    resultado.appendChild(titulo);\n\n    datos.types.forEach((t) => {\n      const span = document.createElement('span');\n      span.className = 'tipo';\n      span.textContent = t.type.name;\n      resultado.appendChild(span);\n    });\n  } catch (error) {\n    resultado.textContent = error.message;\n  }\n}\n\nboton.addEventListener('click', buscarPokemon);\nbuscarPokemon();",
  "pestañaInicial": "js"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿Compruebas respuesta.ok?", "texto": "fetch() solo rechaza la promesa si la red falla del todo — un 404 real (Pokémon inexistente) llega como respuesta \"exitosa\" con ok: false, hay que comprobarlo a mano." },
    { "titulo": "¿El error no rompe la interfaz?", "texto": "Busca un nombre que no exista (por ejemplo, \"noexiste123\") y comprueba que aparece un mensaje, no un error en blanco o la consola." },
    { "titulo": "¿Cero innerHTML?", "texto": "Todo el resultado se construye con createElement/appendChild/textContent — repásalo línea a línea si usaste innerHTML en algún punto." }
  ]
}
```

## Retos para ampliarlo

1. Añade un estado "cargando" visual (por ejemplo, deshabilita el botón mientras espera la respuesta).
2. Busca por Enter en el input, no solo con el botón.
3. Muestra también las estadísticas base (`datos.stats`) en una lista.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "Using the Fetch API",
      "descripcion": "Repaso de fetch(), response.ok y el manejo de errores de red.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      "etiqueta": "MDN"
    }
  ]
}
```
