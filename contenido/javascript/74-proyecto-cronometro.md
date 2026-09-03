# Proyecto: cronómetro con inicio, pausa y reinicio

- **Módulo:** Proyectos
- **Slug:** `proyecto-cronometro-con-inicio-pausa-y-reinicio` (autogenerado del título)
- **Orden:** 410
- **Requiere:** Lección 48 (asincronía) y las lecciones de eventos (44-45)

---

## Qué vas a construir

Un cronómetro de verdad: Iniciar, Pausar y Reiniciar, con el tiempo mostrado en formato `mm:ss`. El reto real no es la interfaz, es controlar bien `setInterval`/`clearInterval` para que pausar de verdad detenga el conteo (un error muy común es acumular varios intervals a la vez sin darse cuenta).

## Paso 1: formatear el tiempo

Antes de tocar el temporizador, resuelve el problema de formato: convierte un número de segundos en `mm:ss`, con ceros a la izquierda.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: formatear mm:ss",
  "consigna": "Completa formatearTiempo(segundosTotales) para que 65 devuelva '01:05', no '1:5'. Usa padStart(2, '0').",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) { salida.textContent += valor + '\\n'; }\n\nfunction formatearTiempo(segundosTotales) {\n  // const minutos = Math.floor(segundosTotales / 60);\n  // const segundos = segundosTotales % 60;\n  // return `${minutos}:${segundos}`.padStart... (ambas partes a 2 dígitos)\n}\n\nmostrar(formatearTiempo(5));\nmostrar(formatearTiempo(65));\nmostrar(formatearTiempo(600));",
  "pestañaInicial": "js"
}
```

## Paso 2: iniciar y pausar sin duplicar el intervalo

Guarda el id que devuelve `setInterval` en una variable — es lo único que te permite pararlo después con `clearInterval`. Antes de iniciar uno nuevo, comprueba que no haya ya uno corriendo.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: iniciar y pausar",
  "consigna": "Escribe iniciar(): si ya hay un intervalId activo, no crees otro. Si no, guarda el id de setInterval (incrementa segundos y actualiza la pantalla cada 1000ms). Escribe pausar(): clearInterval(intervalId) y ponlo a null.",
  "html": "<div id=\"pantalla\">00:00</div>\n<button id=\"iniciar\">Iniciar</button>\n<button id=\"pausar\">Pausar</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  text-align: center;\n}\n#pantalla {\n  font-size: 2.5rem;\n  font-variant-numeric: tabular-nums;\n  margin-bottom: 1rem;\n}",
  "js": "let segundos = 0;\nlet intervalId = null;\nconst pantalla = document.getElementById('pantalla');\n\nfunction formatearTiempo(s) {\n  const minutos = Math.floor(s / 60);\n  const segs = s % 60;\n  return String(minutos).padStart(2, '0') + ':' + String(segs).padStart(2, '0');\n}\n\nfunction iniciar() {\n  // si intervalId ya existe, no hagas nada\n  // si no, intervalId = setInterval(() => { segundos++; pantalla.textContent = formatearTiempo(segundos); }, 1000);\n}\n\nfunction pausar() {\n  // clearInterval(intervalId); intervalId = null;\n}\n\ndocument.getElementById('iniciar').addEventListener('click', iniciar);\ndocument.getElementById('pausar').addEventListener('click', pausar);",
  "pestañaInicial": "js"
}
```

## Proyecto completo

Añade el botón Reiniciar (pausa y pone segundos a 0) al cronómetro del paso 2.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Completa reiniciar(): debe pausar el intervalo si está corriendo, poner segundos a 0, y actualizar la pantalla.",
  "html": "<div id=\"pantalla\">00:00</div>\n<button id=\"iniciar\">Iniciar</button>\n<button id=\"pausar\">Pausar</button>\n<button id=\"reiniciar\">Reiniciar</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  text-align: center;\n}\n#pantalla {\n  font-size: 2.5rem;\n  font-variant-numeric: tabular-nums;\n  margin-bottom: 1rem;\n}\nbutton {\n  padding: 6px 14px;\n  margin: 0 4px;\n  cursor: pointer;\n}",
  "js": "let segundos = 0;\nlet intervalId = null;\nconst pantalla = document.getElementById('pantalla');\n\nfunction formatearTiempo(s) {\n  const minutos = Math.floor(s / 60);\n  const segs = s % 60;\n  return String(minutos).padStart(2, '0') + ':' + String(segs).padStart(2, '0');\n}\n\nfunction actualizarPantalla() {\n  pantalla.textContent = formatearTiempo(segundos);\n}\n\nfunction iniciar() {\n  if (intervalId) return;\n  intervalId = setInterval(() => {\n    segundos++;\n    actualizarPantalla();\n  }, 1000);\n}\n\nfunction pausar() {\n  clearInterval(intervalId);\n  intervalId = null;\n}\n\nfunction reiniciar() {\n  pausar();\n  segundos = 0;\n  actualizarPantalla();\n}\n\ndocument.getElementById('iniciar').addEventListener('click', iniciar);\ndocument.getElementById('pausar').addEventListener('click', pausar);\ndocument.getElementById('reiniciar').addEventListener('click', reiniciar);",
  "pestañaInicial": "js"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Pulsar Iniciar dos veces seguidas acelera el conteo?",
      "texto": "Si iniciar() no comprueba intervalId antes de crear uno nuevo, tendrás dos (o más) intervals corriendo a la vez, sumando segundos más rápido de lo esperado — un bug muy común y difícil de notar a simple vista."
    },
    {
      "titulo": "¿Pausar detiene de verdad?",
      "texto": "clearInterval necesita el id exacto que devolvió setInterval — guardarlo en una variable no es opcional."
    },
    {
      "titulo": "¿El formato siempre tiene dos dígitos?",
      "texto": "5 segundos debe verse \"00:05\", no \"0:5\" — comprueba especialmente los primeros 10 segundos."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade una cuenta atrás (en vez de hacia arriba) que se detenga sola al llegar a cero.
2. Añade vueltas ("lap"): un botón que registre el tiempo actual en una lista sin pausar el cronómetro.
3. Deshabilita el botón Iniciar mientras ya está corriendo, y Pausar mientras está detenido.

Si quieres comparar con una solución real:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 1: cuenta atrás que se para sola",
  "consigna": "En vez de incrementar, decrementa segundos en cada tick, y cuando llegue a 0 llama a clearInterval() tú mismo — sin esperar a que el usuario pulse Pausar. Ojo: lee el valor del input cada vez que cambie mientras el cronómetro está parado, no solo una vez al cargar la página — si no, cambiar el número no tendría ningún efecto.",
  "html": "<label>Empieza en (segundos): <input id=\"inicial\" type=\"number\" value=\"5\" min=\"1\"></label>\n<div id=\"pantalla\">00:05</div>\n<button id=\"iniciar\">Iniciar</button>\n<button id=\"pausar\">Pausar</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  text-align: center;\n}\n#pantalla {\n  font-size: 2.5rem;\n  font-variant-numeric: tabular-nums;\n  margin: 0.75rem 0;\n}\nbutton {\n  padding: 6px 14px;\n  margin: 0 4px;\n  cursor: pointer;\n}",
  "js": "const entradaInicial = document.getElementById('inicial');\nlet segundos = Number(entradaInicial.value);\nlet intervalId = null;\nconst pantalla = document.getElementById('pantalla');\n\nfunction formatearTiempo(s) {\n  const minutos = Math.floor(s / 60);\n  const segs = s % 60;\n  return String(minutos).padStart(2, '0') + ':' + String(segs).padStart(2, '0');\n}\n\nfunction actualizarPantalla() {\n  pantalla.textContent = formatearTiempo(segundos);\n}\n\n// Mientras el cronómetro está parado, el número en pantalla sigue al input.\n// En cuanto arranca, el input deja de tener efecto hasta el próximo Pausar.\nentradaInicial.addEventListener('input', () => {\n  if (intervalId) return;\n  segundos = Number(entradaInicial.value) || 0;\n  actualizarPantalla();\n});\n\nfunction iniciar() {\n  if (intervalId || segundos <= 0) return;\n  intervalId = setInterval(() => {\n    segundos--;\n    actualizarPantalla();\n    if (segundos <= 0) {\n      clearInterval(intervalId);\n      intervalId = null;\n    }\n  }, 1000);\n}\n\nfunction pausar() {\n  clearInterval(intervalId);\n  intervalId = null;\n}\n\ndocument.getElementById('iniciar').addEventListener('click', iniciar);\ndocument.getElementById('pausar').addEventListener('click', pausar);\nactualizarPantalla();",
  "pestañaInicial": "js"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 2: registrar vueltas sin pausar",
  "consigna": "El botón Vuelta no toca intervalId ni segundos — solo lee el tiempo actual y lo añade a una lista, dejando el conteo corriendo.",
  "html": "<div id=\"pantalla\">00:00</div>\n<button id=\"iniciar\">Iniciar</button>\n<button id=\"pausar\">Pausar</button>\n<button id=\"vuelta\">Vuelta</button>\n<ol id=\"vueltas\"></ol>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  text-align: center;\n}\n#pantalla {\n  font-size: 2.5rem;\n  font-variant-numeric: tabular-nums;\n  margin-bottom: 0.75rem;\n}\nbutton {\n  padding: 6px 14px;\n  margin: 0 4px;\n  cursor: pointer;\n}\n#vueltas {\n  max-width: 200px;\n  margin: 1rem auto 0;\n  text-align: left;\n  font-variant-numeric: tabular-nums;\n}",
  "js": "let segundos = 0;\nlet intervalId = null;\nconst pantalla = document.getElementById('pantalla');\nconst vueltas = document.getElementById('vueltas');\n\nfunction formatearTiempo(s) {\n  const minutos = Math.floor(s / 60);\n  const segs = s % 60;\n  return String(minutos).padStart(2, '0') + ':' + String(segs).padStart(2, '0');\n}\n\nfunction actualizarPantalla() {\n  pantalla.textContent = formatearTiempo(segundos);\n}\n\nfunction iniciar() {\n  if (intervalId) return;\n  intervalId = setInterval(() => {\n    segundos++;\n    actualizarPantalla();\n  }, 1000);\n}\n\nfunction pausar() {\n  clearInterval(intervalId);\n  intervalId = null;\n}\n\ndocument.getElementById('iniciar').addEventListener('click', iniciar);\ndocument.getElementById('pausar').addEventListener('click', pausar);\ndocument.getElementById('vuelta').addEventListener('click', () => {\n  const li = document.createElement('li');\n  li.textContent = formatearTiempo(segundos);\n  vueltas.appendChild(li);\n});",
  "pestañaInicial": "js"
}
```

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Reto 3: deshabilitar el botón que no toca",
  "consigna": "Después de cada cambio de estado (iniciar, pausar, reiniciar) actualiza los .disabled de ambos botones a partir de si intervalId existe o no — un único punto de verdad, no repetir la condición en cada sitio.",
  "html": "<div id=\"pantalla\">00:00</div>\n<button id=\"iniciar\">Iniciar</button>\n<button id=\"pausar\" disabled>Pausar</button>\n<button id=\"reiniciar\">Reiniciar</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  text-align: center;\n}\n#pantalla {\n  font-size: 2.5rem;\n  font-variant-numeric: tabular-nums;\n  margin-bottom: 0.75rem;\n}\nbutton {\n  padding: 6px 14px;\n  margin: 0 4px;\n  cursor: pointer;\n}\nbutton:disabled {\n  opacity: 0.5;\n  cursor: default;\n}",
  "js": "let segundos = 0;\nlet intervalId = null;\nconst pantalla = document.getElementById('pantalla');\nconst botonIniciar = document.getElementById('iniciar');\nconst botonPausar = document.getElementById('pausar');\n\nfunction formatearTiempo(s) {\n  const minutos = Math.floor(s / 60);\n  const segs = s % 60;\n  return String(minutos).padStart(2, '0') + ':' + String(segs).padStart(2, '0');\n}\n\nfunction actualizarPantalla() {\n  pantalla.textContent = formatearTiempo(segundos);\n}\n\nfunction actualizarBotones() {\n  botonIniciar.disabled = intervalId !== null;\n  botonPausar.disabled = intervalId === null;\n}\n\nfunction iniciar() {\n  if (intervalId) return;\n  intervalId = setInterval(() => {\n    segundos++;\n    actualizarPantalla();\n  }, 1000);\n  actualizarBotones();\n}\n\nfunction pausar() {\n  clearInterval(intervalId);\n  intervalId = null;\n  actualizarBotones();\n}\n\nfunction reiniciar() {\n  pausar();\n  segundos = 0;\n  actualizarPantalla();\n}\n\nbotonIniciar.addEventListener('click', iniciar);\nbotonPausar.addEventListener('click', pausar);\ndocument.getElementById('reiniciar').addEventListener('click', reiniciar);",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "setInterval()",
      "descripcion": "Repaso de setInterval/clearInterval y por qué hay que guardar el id que devuelven.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval",
      "etiqueta": "MDN"
    }
  ]
}
```
