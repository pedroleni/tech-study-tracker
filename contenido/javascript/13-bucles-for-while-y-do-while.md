# Bucles: for, while y do-while

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `bucles-for-while-y-do-while` (autogenerado del título)
- **Orden:** 38
- **Fuentes:** [Looping code (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops) — ver `contenido/javascript/TEMARIO.md` #13

---

## Qué es y para qué sirve

Repetir la misma acción cien veces sin escribirla cien veces — eso hace un bucle. `for` cuenta iteraciones con un contador; `while` repite mientras una condición sea verdadera; `do-while` hace lo mismo, pero garantiza al menos una ejecución. `for...of`, pensado para recorrer colecciones, tiene su propia lección justo después.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita repetir código sin copiarlo",
  "roles": [
    { "etiqueta": "Quien repite código sin copiarlo", "rol": "Un bloque, muchas veces", "descripcion": "Escribir 100 veces el mismo código a mano no es una opción real — un bucle lo resuelve en unas pocas líneas." },
    { "etiqueta": "Quien controla cuándo parar", "rol": "break y continue", "descripcion": "break sale del bucle por completo; continue solo se salta la iteración actual." },
    { "etiqueta": "Quien evita el bucle infinito", "rol": "Asegurar que la condición cambia", "descripcion": "Olvidar avanzar el contador dentro del bucle es la causa más común de que nunca termine." }
  ]
}
```

## for: contar iteraciones con un contador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  for (let i = 1; i < 10; i++) {\n    console.log(`${i} x ${i} = ${i * i}`);\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "for (let i = 1; i < 10; i++) {", "nota": "Tres partes separadas por ;: el INICIALIZADOR (let i = 1, se ejecuta una sola vez), la CONDICIÓN (i < 10, se comprueba antes de cada vuelta), y la EXPRESIÓN FINAL (i++, se ejecuta después de cada vuelta)." }
  ]
}
```

## while: repetir mientras algo sea verdadero

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let i = 0;\n\n  while (i < 5) {\n    console.log(i);\n    i++;\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "let i = 0;\n\n  while (i < 5) {", "nota": "A diferencia de for, el inicializador (let i = 0) y el incremento (i++) están FUERA de la estructura del bucle — hay que acordarse de escribirlos por separado, o el bucle nunca termina." }
  ]
}
```

## do-while: se ejecuta al menos una vez

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  let i = 10;\n\n  do {\n    console.log('Esto se imprime igualmente');\n    i++;\n  } while (i < 5);\n</script>",
  "anotaciones": [
    { "fragmento": "do {\n    console.log('Esto se imprime igualmente');\n    i++;\n  } while (i < 5);", "nota": "La condición se comprueba AL FINAL, no al principio — el cuerpo del bucle se ejecuta SIEMPRE al menos una vez, aunque la condición ya fuera false desde el inicio (aquí, i vale 10, así que i < 5 nunca fue verdadera)." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El bucle infinito: un peligro real, no solo teórico",
  "contenido": "Si la condición de un bucle nunca llega a ser false, el bucle no termina nunca — el navegador acaba forzando su detención, o se cuelga. La causa más común: olvidar incrementar o decrementar el contador dentro del cuerpo del bucle."
}
```

## break: salir del bucle por completo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const numeros = [4, 8, 15, 16, 23, 42];\n\n  for (const n of numeros) {\n    if (n > 15) {\n      console.log(`Encontrado: ${n}`);\n      break;\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "break;", "nota": "Termina el bucle INMEDIATAMENTE, sin comprobar el resto de elementos — útil en cuanto se encuentra lo que se buscaba, para no seguir iterando de más." }
  ]
}
```

## continue: saltar solo esta iteración

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  for (let i = 1; i <= 10; i++) {\n    if (i % 2 === 0) {\n      continue; // se salta los números pares\n    }\n    console.log(i);\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "continue; // se salta los números pares", "nota": "A diferencia de break, continue NO termina el bucle — solo se salta el RESTO de esta iteración, y sigue con la siguiente." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "for...of, para recorrer colecciones",
  "contenido": "for puede recorrer un array por índice, pero para eso existe una forma más directa: for...of. Tiene su propia lección justo a continuación, junto con for...in."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  let i = 10;\n  do {\n    console.log('Entré al bucle');\n  } while (i < 5);\n</script>",
  "opciones": [
    "Imprime 'Entré al bucle' UNA vez, aunque i < 5 sea false desde el principio — do-while comprueba la condición DESPUÉS de ejecutar",
    "No imprime nada, porque la condición i < 5 ya es false antes de empezar",
    "Entra en un bucle infinito, porque i nunca cambia dentro del cuerpo del bucle"
  ],
  "correcta": 0,
  "explicacion": "do-while ejecuta el cuerpo del bucle SIEMPRE al menos una vez, antes de comprobar la condición por primera vez. Aquí se imprime el mensaje una sola vez, y como i < 5 sigue siendo false, el bucle no vuelve a repetirse."
}
```

## Lo que estos bucles NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "while y do-while son intercambiables, hacen exactamente lo mismo",
      "realidad": "do-while SIEMPRE ejecuta el cuerpo al menos una vez, incluso si la condición ya es false antes de empezar — while puede no ejecutarse ni una sola vez."
    },
    {
      "mito": "continue detiene el bucle por completo, igual que break",
      "realidad": "continue solo salta a la SIGUIENTE iteración — el bucle sigue en marcha; break sí lo termina del todo."
    },
    {
      "mito": "Un bucle infinito solo ocurre si se olvida por completo escribir la condición",
      "realidad": "También ocurre si la condición nunca llega a ser false — por ejemplo, olvidar incrementar el contador dentro del cuerpo del bucle."
    },
    {
      "mito": "for solo sirve para contar con un número, nunca para recorrer una colección",
      "realidad": "for puede recorrer un array por índice perfectamente, aunque for...of suele ser más directo para ese caso concreto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar incrementar o decrementar el contador dentro del cuerpo del bucle.", "texto": "La causa más común de un bucle infinito real, no solo teórico." },
    { "titulo": "Confundir continue con break.", "texto": "continue salta la iteración actual; break termina el bucle entero." },
    { "titulo": "Usar while cuando el código necesita ejecutarse al menos una vez.", "texto": "do-while garantiza esa primera ejecución; while, no." },
    { "titulo": "No comprobar bien la condición de salida.", "texto": "Puede hacer que el bucle itere una vez de más o de menos de lo esperado." }
  ]
}
```

## Ejercicios

1. Escribe un `for` que sume los números del 1 al 10.
2. Escribe un `do-while` que se ejecute al menos una vez, aunque su condición inicial sea `false`.
3. Escribe un bucle que use `break` para detenerse al encontrar el primer número mayor que 50 en un array.
4. Escribe un bucle que use `continue` para saltarse los números pares al recorrer del 1 al 10.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Looping code",
      "descripcion": "Guía de MDN sobre for, while, do-while, break, continue y el peligro real de un bucle infinito.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops",
      "etiqueta": "MDN"
    }
  ]
}
```
