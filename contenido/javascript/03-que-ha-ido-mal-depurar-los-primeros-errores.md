# Qué ha ido mal: depurar los primeros errores

- **Módulo:** Fundamentos de JavaScript
- **Slug:** `que-ha-ido-mal-depurar-los-primeros-errores` (autogenerado del título)
- **Orden:** 8
- **Fuentes:** [What went wrong? Troubleshooting JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong) — ver `contenido/javascript/TEMARIO.md` #3

---

## Qué es y para qué sirve

Antes de escribir mucho más código, conviene saber leer lo que pasa cuando algo sale mal — porque va a pasar, y a menudo. Un mensaje de error en la consola no es un muro: casi siempre señala exactamente qué línea revisar y qué tipo de problema buscar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita leer un error antes de seguir",
  "roles": [
    { "etiqueta": "Quien lee un mensaje de error real", "rol": "Localizar archivo, línea y tipo de fallo", "descripcion": "Un error de la consola trae casi siempre toda la información necesaria para empezar a buscar." },
    { "etiqueta": "Quien distingue sintaxis de lógica", "rol": "Saber si hay mensaje de error o no", "descripcion": "Un error de sintaxis avisa; un error de lógica se ejecuta en silencio y da un resultado incorrecto." },
    { "etiqueta": "Quien usa console.log para investigar", "rol": "Comprobar qué valor tiene una variable de verdad", "descripcion": "La forma más simple de confirmar una suposición, incluso sin ningún error visible." }
  ]
}
```

## Tres tipos de error

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sintaxis, lógica y runtime — la diferencia real",
  "contenido": "Un error de SINTAXIS es una falta de ortografía del propio lenguaje — el código ni siquiera llega a ejecutarse, y casi siempre viene con un mensaje claro. Un error de RUNTIME ocurre durante la ejecución, cuando algo que el código intenta hacer no es posible (llamar a algo que no es una función, por ejemplo). Un error de LÓGICA es el más traicionero: el código se ejecuta sin ningún mensaje de error, pero el resultado es incorrecto — nada avisa de que algo fue mal."
}
```

## Leer un mensaje de error de la consola

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!-- Uncaught TypeError: boton.addeventListener is not a function -->\n<!-- juego.html:87:19 -->",
  "anotaciones": [
    { "fragmento": "Uncaught TypeError: boton.addeventListener is not a function", "nota": "La primera parte dice el TIPO de error (TypeError) y una descripción de qué falló — aquí, que boton.addeventListener no es una función que se pueda llamar." },
    { "fragmento": "juego.html:87:19", "nota": "La segunda parte dice DÓNDE: el archivo, la línea (87) y la posición del carácter (19) donde el motor detectó el problema." }
  ]
}
```

## TypeError: x is not a function

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Incorrecto: addeventListener, con e minúscula\n  boton.addeventListener('click', comprobar);\n\n  // Correcto\n  boton.addEventListener('click', comprobar);\n</script>",
  "anotaciones": [
    { "fragmento": "boton.addeventListener('click', comprobar);\n\n  // Correcto", "nota": "JavaScript distingue mayúsculas de minúsculas. addeventListener (con e minúscula) simplemente no existe como método — de ahí \"is not a function\", el error más común de todos." }
  ]
}
```

## TypeError: no se puede leer una propiedad de null

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p class=\"resultado\"></p>\n\n<script>\n  // Incorrecto: falta el punto del selector de clase\n  const resultado = document.querySelector('resultado');\n  resultado.textContent = 'Listo';\n</script>",
  "anotaciones": [
    { "fragmento": "document.querySelector('resultado');", "nota": "Sin el punto, querySelector busca una ETIQUETA llamada <resultado>, que no existe — devuelve null. La línea siguiente falla al intentar leer .textContent de null." }
  ]
}
```

## SyntaxError: paréntesis o llave sin cerrar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Incorrecto: falta el paréntesis de cierre\n  function comprobar( {\n    console.log('comprobando');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "function comprobar( {", "nota": "El motor detecta que falta algo, pero no siempre exactamente en esta línea — a veces el mensaje señala unas líneas más abajo, donde el analizador finalmente se da cuenta de que algo no cuadra." }
  ]
}
```

## El error lógico más traicionero: = en vez de ===

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Incorrecto: = asigna, no compara — y siempre es \"verdadero\"\n  if (intentos = 10) {\n    console.log('Se acabaron los intentos');\n  }\n\n  // Correcto\n  if (intentos === 10) {\n    console.log('Se acabaron los intentos');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (intentos = 10) {", "nota": "= ASIGNA 10 a intentos y luego evalúa ese 10 como condición — que siempre es verdadero. No hay ningún error de sintaxis: el código se ejecuta, solo que mal. Un error de lógica clásico." }
  ]
}
```

## Otro clásico: Math.random() mal combinado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  // Incorrecto: Math.floor(Math.random()) siempre da 0\n  let numero = Math.floor(Math.random()) + 1; // siempre 1\n\n  // Correcto\n  let numero = Math.floor(Math.random() * 100) + 1; // 1 a 100\n</script>",
  "anotaciones": [
    { "fragmento": "let numero = Math.floor(Math.random()) + 1; // siempre 1", "nota": "Math.random() da un decimal entre 0 y 1 (nunca llega a 1 entero). Math.floor() de ese decimal siempre redondea a 0 — así que el resultado final es siempre 1, sin ninguna variación. Otro error de lógica, sin ningún mensaje que avise." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "console.log(): la herramienta más simple para investigar",
  "contenido": "Cuando algo no hace lo esperado y no hay ningún error visible, console.log(variable) muestra el valor REAL que tiene esa variable en ese punto del código — la forma más rápida de confirmar (o descartar) una suposición sobre qué está pasando."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const boton = document.querySelector('boton');\n  boton.addEventListener('click', () => console.log('clic'));\n</script>",
  "opciones": [
    "Funciona bien, el clic se registra sin ningún problema",
    "TypeError al intentar leer addEventListener de null — falta el . o # delante de 'boton' en el selector",
    "SyntaxError, porque addEventListener necesita tres argumentos, no dos"
  ],
  "correcta": 1,
  "explicacion": "'boton' sin punto ni almohadilla busca una ETIQUETA <boton>, que no existe en HTML — querySelector devuelve null. La línea siguiente falla al intentar llamar a .addEventListener sobre null."
}
```

## Lo que un error NO significa necesariamente

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un error en la consola significa que hay que reescribir todo el código",
      "realidad": "Casi siempre señala un problema muy concreto y localizado — un nombre mal escrito, un selector sin el punto, una llave sin cerrar."
    },
    {
      "mito": "Si el código no da ningún error, es que funciona correctamente",
      "realidad": "Un error LÓGICO (como usar = en vez de === en una condición) puede ejecutarse sin ningún mensaje, pero producir un resultado incorrecto."
    },
    {
      "mito": "El número de línea del error señala siempre exactamente dónde está el problema real",
      "realidad": "A veces indica dónde el motor DETECTÓ el problema, que puede estar unas líneas antes de donde realmente se originó."
    },
    {
      "mito": "console.log() solo sirve para mostrar mensajes de error",
      "realidad": "Es la herramienta más simple para comprobar qué valor tiene realmente una variable, incluso sin ningún error visible."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir = (asignación) con === (comparación) dentro de una condición.", "texto": "= siempre evalúa como verdadero el valor recién asignado — un error de lógica sin ningún aviso." },
    { "titulo": "Escribir mal el nombre de un método, con mayúsculas o minúsculas distintas a las reales.", "texto": "JavaScript distingue mayúsculas de minúsculas — addeventListener no es lo mismo que addEventListener." },
    { "titulo": "Olvidar el . o # delante de una clase o id en un selector.", "texto": "Sin él, querySelector busca una etiqueta con ese nombre, casi nunca lo que se pretendía." },
    { "titulo": "No usar console.log() para comprobar el valor real de una variable.", "texto": "La forma más rápida de confirmar o descartar una suposición sobre qué está pasando." }
  ]
}
```

## Ejercicios

1. Explica la diferencia entre un error de sintaxis, uno de lógica y uno de runtime.
2. Encuentra el error en `document.querySelector("lowOrHi")`, sabiendo que el elemento tiene `class="lowOrHi"`.
3. Encuentra el error en `} else if (intentos = 10) {`.
4. Explica cómo usarías `console.log()` para comprobar por qué una variable no tiene el valor esperado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "What went wrong? Troubleshooting JavaScript",
      "descripcion": "Guía de MDN sobre los tres tipos de error, cómo leer un mensaje de la consola, y varios errores clásicos con su causa real.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong",
      "etiqueta": "MDN"
    }
  ]
}
```
