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
  "css": "body { font-family: system-ui, sans-serif; padding: 1rem; text-align: center; }\n#pantalla { font-size: 2.5rem; font-variant-numeric: tabular-nums; margin-bottom: 1rem; }",
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
  "css": "body { font-family: system-ui, sans-serif; padding: 1rem; text-align: center; }\n#pantalla { font-size: 2.5rem; font-variant-numeric: tabular-nums; margin-bottom: 1rem; }\nbutton { padding: 6px 14px; margin: 0 4px; cursor: pointer; }",
  "js": "let segundos = 0;\nlet intervalId = null;\nconst pantalla = document.getElementById('pantalla');\n\nfunction formatearTiempo(s) {\n  const minutos = Math.floor(s / 60);\n  const segs = s % 60;\n  return String(minutos).padStart(2, '0') + ':' + String(segs).padStart(2, '0');\n}\n\nfunction actualizarPantalla() {\n  pantalla.textContent = formatearTiempo(segundos);\n}\n\nfunction iniciar() {\n  if (intervalId) return;\n  intervalId = setInterval(() => {\n    segundos++;\n    actualizarPantalla();\n  }, 1000);\n}\n\nfunction pausar() {\n  clearInterval(intervalId);\n  intervalId = null;\n}\n\nfunction reiniciar() {\n  pausar();\n  segundos = 0;\n  actualizarPantalla();\n}\n\ndocument.getElementById('iniciar').addEventListener('click', iniciar);\ndocument.getElementById('pausar').addEventListener('click', pausar);\ndocument.getElementById('reiniciar').addEventListener('click', reiniciar);",
  "pestañaInicial": "js"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿Pulsar Iniciar dos veces seguidas acelera el conteo?", "texto": "Si iniciar() no comprueba intervalId antes de crear uno nuevo, tendrás dos (o más) intervals corriendo a la vez, sumando segundos más rápido de lo esperado — un bug muy común y difícil de notar a simple vista." },
    { "titulo": "¿Pausar detiene de verdad?", "texto": "clearInterval necesita el id exacto que devolvió setInterval — guardarlo en una variable no es opcional." },
    { "titulo": "¿El formato siempre tiene dos dígitos?", "texto": "5 segundos debe verse \"00:05\", no \"0:5\" — comprueba especialmente los primeros 10 segundos." }
  ]
}
```

## Retos para ampliarlo

1. Añade una cuenta atrás (en vez de hacia arriba) que se detenga sola al llegar a cero.
2. Añade vueltas ("lap"): un botón que registre el tiempo actual en una lista sin pausar el cronómetro.
3. Deshabilita el botón Iniciar mientras ya está corriendo, y Pausar mientras está detenido.

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
