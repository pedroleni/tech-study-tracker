# try/catch/finally y el objeto Error

- **Módulo:** Manejo de errores
- **Slug:** `try-catch-finally-y-el-objeto-error` (autogenerado del título)
- **Orden:** 179
- **Fuentes:** [JavaScript debugging and error handling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript) + [Control flow and error handling (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) — ver `contenido/javascript/TEMARIO.md` #60

---

## Qué es y para qué sirve

Abre el módulo de manejo de errores. `try/catch` evita que un error detenga todo el programa; `finally` garantiza que cierto código se ejecute pase lo que pase — con un comportamiento genuinamente sorprendente cuando se combina con `return`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita capturar y limpiar tras un error",
  "roles": [
    { "etiqueta": "Quien captura el error", "rol": "catch(error)", "descripcion": "Recibe un objeto Error con name y message — el código sigue en vez de detenerse por completo." },
    { "etiqueta": "Quien limpia pase lo que pase", "rol": "finally", "descripcion": "Se ejecuta siempre — con éxito, con error capturado, o incluso sin ningún catch presente." },
    { "etiqueta": "Quien lanza un error a propósito", "rol": "throw new Error(...)", "descripcion": "Convierte una situación inválida en un error real, capturable con catch." }
  ]
}
```

## try/catch básico

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function metrosDesdePulgadas(numero) {\n    if (typeof numero !== 'number') {\n      throw new Error('Se esperaba un número');\n    }\n    return (numero * 2.54) / 100;\n  }\n\n  try {\n    console.log(metrosDesdePulgadas('sesenta'));\n  } catch (error) {\n    console.error(error);\n    console.log('Se gestionó el error, el programa sigue');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "try {\n    console.log(metrosDesdePulgadas('sesenta'));\n  } catch (error) {", "nota": "El código dentro de try se ejecuta con normalidad — si algo lanza un error, la ejecución SALTA directamente al catch, sin llegar a las líneas siguientes de try." }
  ]
}
```

## El objeto Error: name y message

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  try {\n    throw new Error('Algo salió mal');\n  } catch (error) {\n    console.error(error.name);    // 'Error'\n    console.error(error.message); // 'Algo salió mal'\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "console.error(error.name);    // 'Error'\n    console.error(error.message); // 'Algo salió mal'", "nota": "El objeto que recibe catch tiene, como mínimo, dos propiedades útiles: name (la clase general del error, como 'TypeError' o 'Error') y message (una descripción legible de qué pasó)." }
  ]
}
```

## Validar antes de lanzar: el gotcha de NaN

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function metrosDesdePulgadas(numero) {\n    if (typeof numero !== 'number' || Number.isNaN(numero)) {\n      throw new Error('Se esperaba un número válido');\n    }\n    return ((numero * 2.54) / 100).toFixed(2);\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (typeof numero !== 'number' || Number.isNaN(numero)) {", "nota": "typeof numero !== 'number' comprueba el TIPO; Number.isNaN(numero) comprueba específicamente NaN, porque typeof NaN también da 'number' — una comprobación de tipo por sí sola no basta." }
  ]
}
```

## finally: se ejecuta pase lo que pase

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  abrirArchivo();\n  try {\n    escribirArchivo(datos); // podría lanzar un error\n  } catch (error) {\n    gestionarError(error);\n  } finally {\n    cerrarArchivo(); // se ejecuta SIEMPRE, haya ido bien o mal\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "} finally {\n    cerrarArchivo(); // se ejecuta SIEMPRE, haya ido bien o mal\n  }", "nota": "finally se ejecuta después de try y catch, hayan terminado como hayan terminado — con éxito, con un error capturado, o incluso sin ningún catch presente. El lugar natural para cerrar un recurso que siempre debe cerrarse." }
  ]
}
```

## El gotcha real: finally puede sobrescribir un return

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function f() {\n    try {\n      console.log(0);\n      throw 'error';\n    } catch (e) {\n      console.log(1);\n      return true; // suspendido hasta que finally termine\n    } finally {\n      console.log(3);\n      return false; // SOBRESCRIBE el return anterior\n    }\n  }\n\n  console.log(f()); // 0, 1, 3, false\n</script>",
  "anotaciones": [
    { "fragmento": "return true; // suspendido hasta que finally termine", "nota": "return true dentro de catch queda SUSPENDIDO hasta que finally termine — no sale de la función de inmediato." },
    { "fragmento": "return false; // SOBRESCRIBE el return anterior", "nota": "Como finally tiene su propio return, ese es el que realmente sale de la función — el return true de catch nunca llega a completarse." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "También puede sobrescribir un throw",
  "contenido": "Un return (o incluso otro throw) dentro de finally cancela una excepción que se estuviera propagando desde try/catch — el error original nunca llega a ningún catch exterior. Por eso se recomienda evitar return dentro de finally salvo que sea completamente intencional."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function comprobar() {\n    try {\n      return 'desde try';\n    } finally {\n      console.log('finally ejecutado');\n    }\n  }\n\n  console.log(comprobar());\n</script>",
  "opciones": [
    "'finally ejecutado' y luego 'desde try' — finally se ejecuta ANTES de que el return de try complete, pero al no tener su propio return, no lo sobrescribe",
    "'desde try' y luego 'finally ejecutado' — el return de try termina la función antes de que finally llegue a ejecutarse",
    "Solo 'finally ejecutado' — un finally sin return propio cancela el return del try"
  ],
  "correcta": 0,
  "explicacion": "El return de try queda suspendido hasta que finally termine de ejecutarse — por eso 'finally ejecutado' se imprime PRIMERO. Como finally NO tiene su propio return, no sobrescribe nada, y la función termina devolviendo el valor original de try: 'desde try'."
}
```

## Lo que try/catch/finally NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "finally se salta si el try tiene un error sin capturar (sin catch)",
      "realidad": "Se ejecuta siempre, incluso sin ningún catch presente."
    },
    {
      "mito": "Un return dentro de try termina la función inmediatamente, antes que nada más",
      "realidad": "Si hay un finally, este se ejecuta ANTES de que el return realmente complete."
    },
    {
      "mito": "finally nunca puede cambiar el resultado de una función, solo ejecuta código adicional",
      "realidad": "Un return (o throw) dentro de finally SOBRESCRIBE cualquier return o throw pendiente de try/catch."
    },
    {
      "mito": "typeof numero !== 'number' es suficiente para descartar cualquier valor numérico inválido",
      "realidad": "NaN también pasa typeof === 'number' — hace falta Number.isNaN() aparte."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir un return (o throw) dentro de finally sin darse cuenta de que sobrescribe lo anterior.", "texto": "Puede ocultar un error real que debería haberse propagado." },
    { "titulo": "Confiar solo en typeof para validar un número, sin comprobar NaN por separado.", "texto": "typeof NaN sigue dando 'number', a pesar del nombre." },
    { "titulo": "No usar finally para limpieza que debe ocurrir pase lo que pase.", "texto": "Cerrar un recurso o liberar un bloqueo son casos típicos." },
    { "titulo": "Usar console.log() en vez de console.error() al reportar un error capturado.", "texto": "console.error() aporta formato y traza adicionales, útiles para depurar." }
  ]
}
```

## Ejercicios

1. Escribe un `try/catch` que capture un error lanzado manualmente con `throw new Error()`, y lee sus propiedades `name` y `message`.
2. Añade un `finally` a un `try/catch`, y demuestra que se ejecuta tanto si hay error como si no.
3. Escribe una función con `return` tanto en `try` como en `finally`, y comprueba cuál de los dos "gana".
4. Valida un parámetro numérico comprobando tanto `typeof` como `Number.isNaN()`, y lanza un error si no es válido.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un try/catch que capture un error lanzado con throw new Error() y lee name y message (ejercicio 1). Añade un finally que se ejecute siempre (ejercicio 2). Valida un parámetro con typeof y Number.isNaN() (ejercicio 4).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\ntry {\n  throw new Error('Algo salió mal');\n} catch (error) {\n  mostrar('name: ' + error.name);\n  mostrar('message: ' + error.message);\n} finally {\n  mostrar('finally: esto se ejecuta siempre');\n}\n\nfunction raizCuadrada(numero) {\n  if (typeof numero !== 'number' || Number.isNaN(numero)) {\n    throw new TypeError('Se esperaba un número válido');\n  }\n  return Math.sqrt(numero);\n}\ntry {\n  mostrar(raizCuadrada('no soy un número'));\n} catch (error) {\n  mostrar('Error de validación: ' + error.message);\n}",
  "pestañaInicial": "js"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "JavaScript debugging and error handling",
      "descripcion": "Guía de MDN sobre tipos de error comunes, lectura de mensajes en consola, try/catch básico, y validación defensiva antes de lanzar un error.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Control flow and error handling",
      "descripcion": "Guía de MDN sobre finally (incluido su comportamiento al sobrescribir return/throw), las propiedades name y message del objeto Error, y el anidamiento de try/catch.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling",
      "etiqueta": "MDN"
    }
  ]
}
```
