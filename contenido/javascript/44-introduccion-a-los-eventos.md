# Introducción a los eventos

- **Módulo:** Eventos
- **Slug:** `introduccion-a-los-eventos` (autogenerado del título)
- **Orden:** 131
- **Fuentes:** [Introduction to events (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) — ver `contenido/javascript/TEMARIO.md` #44

---

## Qué es y para qué sirve

Abre el módulo de eventos. Un evento es una señal que el navegador emite cuando ocurre algo — un clic, una tecla, el final de la carga de una página. `addEventListener()` es la forma recomendada de reaccionar a esas señales, dejando atrás dos alternativas más antiguas con desventajas reales.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita reaccionar a lo que pasa en la página",
  "roles": [
    { "etiqueta": "Quien registra un manejador", "rol": "addEventListener()", "descripcion": "La forma recomendada — permite acumular varios manejadores para el mismo evento." },
    { "etiqueta": "Quien necesita datos del evento", "rol": "El objeto evento", "descripcion": "Se recibe automáticamente como argumento — target, key, y otras propiedades según el tipo de evento." },
    { "etiqueta": "Quien cancela la acción por defecto", "rol": "preventDefault()", "descripcion": "Detiene lo que el navegador haría por sí solo (como enviar un formulario), sin detener el resto del código." }
  ]
}
```

## addEventListener(): la forma recomendada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n\n  boton.addEventListener('click', () => {\n    console.log('¡Botón pulsado!');\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "boton.addEventListener('click', () => {\n    console.log('¡Botón pulsado!');\n  });", "nota": "addEventListener(nombreDelEvento, función) registra una función que se ejecuta cada vez que ese evento ocurre sobre el elemento — la forma recomendada de responder a eventos." }
  ]
}
```

## Varios manejadores para el mismo evento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n  function funcionA() { console.log('A'); }\n  function funcionB() { console.log('B'); }\n\n  boton.addEventListener('click', funcionA);\n  boton.addEventListener('click', funcionB);\n  // Al pulsar, se ejecutan AMBAS: 'A' y 'B'\n</script>",
  "anotaciones": [
    { "fragmento": "boton.addEventListener('click', funcionA);\n  boton.addEventListener('click', funcionB);\n  // Al pulsar, se ejecutan AMBAS: 'A' y 'B'", "nota": "addEventListener() permite registrar VARIOS manejadores para el mismo evento sobre el mismo elemento — todos se ejecutan, en el orden en que se registraron." }
  ]
}
```

## El objeto evento: target y propiedades según el tipo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n\n  function cambiarColor(evento) {\n    evento.target.style.backgroundColor = 'coral';\n  }\n\n  boton.addEventListener('click', cambiarColor);\n\n  const cuadroTexto = document.querySelector('#cuadroTexto');\n  cuadroTexto.addEventListener('keydown', (evento) => {\n    console.log(`Pulsaste \"${evento.key}\"`);\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "evento.target.style.backgroundColor = 'coral';", "nota": "El manejador recibe automáticamente un objeto EVENTO como argumento — evento.target es una referencia al elemento exacto sobre el que ocurrió, útil incluso cuando la misma función se reutiliza en varios elementos." },
    { "fragmento": "console.log(`Pulsaste \"${evento.key}\"`);", "nota": "Cada TIPO de evento añade sus propias propiedades al objeto evento — un KeyboardEvent (de keydown) tiene key, algo que un evento de click no tiene." }
  ]
}
```

## preventDefault(): detener el comportamiento del navegador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const formulario = document.querySelector('form');\n  const nombre = document.getElementById('nombre');\n\n  formulario.addEventListener('submit', (evento) => {\n    if (nombre.value === '') {\n      evento.preventDefault(); // detiene el envío del formulario\n      console.log('Falta el nombre');\n    }\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "evento.preventDefault(); // detiene el envío del formulario", "nota": "preventDefault() detiene el comportamiento POR DEFECTO del navegador ante ese evento — aquí, el envío real (que recargaría la página) — sin detener el resto del código del manejador, que sigue corriendo con normalidad." }
  ]
}
```

## removeEventListener(): la misma referencia, o no funciona

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n  function saludar() { console.log('¡Hola!'); }\n\n  boton.addEventListener('click', saludar);\n  boton.removeEventListener('click', saludar); // debe ser la MISMA referencia\n</script>",
  "anotaciones": [
    { "fragmento": "boton.removeEventListener('click', saludar); // debe ser la MISMA referencia", "nota": "removeEventListener() necesita la MISMA referencia de función usada al registrar el manejador. Una función anónima no se puede quitar después — no hay forma de volver a referenciarla." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "onclick sobrescribe, no acumula",
  "contenido": "btn.onclick = funcionA seguido de btn.onclick = funcionB NO añade una segunda función — la segunda asignación SOBRESCRIBE la primera. Es la desventaja clave de la propiedad on-evento frente a addEventListener(), que sí permite acumular varios manejadores para el mismo evento."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los manejadores en línea del HTML están desaconsejados",
  "contenido": "<button onclick=\"funcion()\"> mezcla HTML y JavaScript, es difícil de mantener a partir de unos pocos elementos, y muchas configuraciones de servidor los bloquean por motivos de seguridad — nunca deberían usarse en código de producción."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const boton = document.querySelector('button');\n  let contador = 0;\n\n  boton.addEventListener('click', () => { contador++; });\n  boton.removeEventListener('click', () => { contador++; });\n\n  boton.click();\n  console.log(contador);\n</script>",
  "opciones": [
    "1 — removeEventListener() no tiene ningún efecto aquí, porque la función anónima pasada no es la MISMA referencia que la registrada",
    "0 — removeEventListener() elimina cualquier manejador que haga exactamente lo mismo",
    "Un error, porque no se puede quitar un manejador registrado con una función anónima"
  ],
  "correcta": 0,
  "explicacion": "Aunque las dos funciones anónimas hagan lo mismo (contador++), son dos funciones DISTINTAS en memoria — removeEventListener() compara por REFERENCIA, no por comportamiento. El manejador original sigue activo, así que boton.click() lo dispara igual: contador termina en 1."
}
```

## Lo que estos mecanismos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "addEventListener() solo permite un manejador por evento, igual que btn.onclick",
      "realidad": "Permite acumular varios manejadores para el mismo evento — todos se ejecutan."
    },
    {
      "mito": "removeEventListener() puede quitar cualquier manejador con solo indicar el nombre del evento",
      "realidad": "Necesita la MISMA referencia de función usada al registrarlo — una función anónima no se puede quitar después."
    },
    {
      "mito": "preventDefault() detiene también el resto del código del manejador",
      "realidad": "Solo detiene el comportamiento POR DEFECTO del navegador; el resto de la función sigue ejecutándose con normalidad."
    },
    {
      "mito": "Los manejadores en línea (onclick=\"...\" en el HTML) son solo una cuestión de estilo",
      "realidad": "Mezclan HTML y JS, no escalan, y muchos servidores los bloquean por motivos de seguridad."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar btn.onclick esperando poder acumular varios manejadores.", "texto": "Cada asignación sobrescribe la anterior, a diferencia de addEventListener()." },
    { "titulo": "Intentar quitar un manejador registrado con una función anónima.", "texto": "removeEventListener() necesita la misma referencia — hace falta una función nombrada." },
    { "titulo": "Pensar que preventDefault() detiene la ejecución del resto del manejador.", "texto": "Solo cancela el comportamiento por defecto del navegador, nada más." },
    { "titulo": "Usar atributos onclick en el HTML en código de producción.", "texto": "Mezcla HTML y JS, y muchos servidores los bloquean por seguridad." }
  ]
}
```

## Ejercicios

1. Registra dos manejadores distintos para el mismo evento sobre el mismo elemento con `addEventListener()`, y comprueba que ambos se ejecutan.
2. Usa `evento.target` dentro de un manejador para acceder al elemento exacto que disparó el evento.
3. Usa `preventDefault()` para detener el envío de un formulario si un campo está vacío.
4. Registra un manejador con una función NOMBRADA, y quítalo después con `removeEventListener()`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Introduction to events",
      "descripcion": "Guía de MDN sobre addEventListener(), el objeto evento (target, y propiedades según el tipo), preventDefault(), removeEventListener(), y por qué se desaconsejan onclick y los manejadores en línea.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events",
      "etiqueta": "MDN"
    }
  ]
}
```
