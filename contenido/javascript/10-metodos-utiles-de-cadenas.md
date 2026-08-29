# Métodos útiles de cadenas

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `metodos-utiles-de-cadenas` (autogenerado del título)
- **Orden:** 29
- **Fuentes:** [Useful string methods (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods) — ver `contenido/javascript/TEMARIO.md` #10

---

## Qué es y para qué sirve

Buscar dentro de un texto, extraer un trozo, cambiar mayúsculas, reemplazar una palabra — un puñado de métodos cubren la inmensa mayoría de lo que se necesita hacer con strings en el día a día. Todos comparten un rasgo: ninguno modifica el string original.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más que crear un string",
  "roles": [
    { "etiqueta": "Quien accede a un carácter concreto", "rol": "Por índice, empezando en 0", "descripcion": "El primer carácter es el índice 0, no el 1 — un detalle que conviene interiorizar pronto." },
    { "etiqueta": "Quien busca dentro de un string", "rol": "includes, startsWith, endsWith, indexOf", "descripcion": "Cuatro formas distintas de preguntar \"¿está esto ahí?\", cada una con su matiz." },
    { "etiqueta": "Quien reemplaza sin mutar el original", "rol": "replace() siempre devuelve algo nuevo", "descripcion": "Los strings son inmutables — ningún método cambia el original, todos devuelven uno distinto." }
  ]
}
```

## Longitud y acceso por índice

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const navegador = 'mozilla';\n  console.log(navegador.length); // 7\n  console.log(navegador[0]); // 'm' — el primer carácter, índice 0\n  console.log(navegador[navegador.length - 1]); // 'a' — el último\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(navegador[0]); // 'm' — el primer carácter, índice 0", "nota": "Los índices de un string empiezan en 0, no en 1 — el mismo principio que en un array." },
    { "fragmento": "console.log(navegador[navegador.length - 1]); // 'a' — el último", "nota": "length - 1 da siempre el índice del último carácter, sin importar cuánto mida el string." }
  ]
}
```

## slice(): extraer un trozo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const navegador = 'mozilla';\n  console.log(navegador.slice(1, 4)); // 'ozi' — índices 1, 2 y 3\n  console.log(navegador.slice(2));    // 'zilla' — desde el índice 2 hasta el final\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(navegador.slice(1, 4)); // 'ozi' — índices 1, 2 y 3", "nota": "El segundo argumento es EXCLUSIVO — slice(1, 4) incluye los índices 1, 2 y 3, pero NO el 4." }
  ]
}
```

## Cambiar mayúsculas y minúsculas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const texto = 'My NaMe Is MuD';\n  console.log(texto.toLowerCase()); // 'my name is mud'\n  console.log(texto.toUpperCase()); // 'MY NAME IS MUD'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(texto.toLowerCase()); // 'my name is mud'", "nota": "Devuelve un string NUEVO, todo en minúsculas — texto en sí sigue exactamente igual que antes." }
  ]
}
```

## Buscar dentro de un string

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const navegador = 'mozilla';\n\n  console.log(navegador.includes('zilla'));   // true — está en algún sitio\n  console.log(navegador.startsWith('moz'));   // true — está al principio\n  console.log(navegador.endsWith('zilla'));   // true — está al final\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(navegador.includes('zilla'));   // true — está en algún sitio", "nota": "includes() solo responde true o false — si hace falta saber DÓNDE está, hace falta indexOf() en su lugar." }
  ]
}
```

## indexOf(): dónde está, y encontrar la siguiente aparición

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const frase = 'MDN - Recursos para developers, por developers';\n\n  const primera = frase.indexOf('developers');\n  console.log(primera); // 20\n\n  const segunda = frase.indexOf('developers', primera + 1);\n  console.log(segunda); // 39\n\n  console.log(frase.indexOf('xyz')); // -1 — no encontrado\n</script>",
  "anotaciones": [
    { "fragmento": "const segunda = frase.indexOf('developers', primera + 1);", "nota": "indexOf() solo encuentra la PRIMERA aparición por defecto — para buscar la siguiente, hay que pasarle un segundo argumento: la posición desde la que empezar a buscar." },
    { "fragmento": "console.log(frase.indexOf('xyz')); // -1 — no encontrado", "nota": "-1 es el valor que indica \"no encontrado\" — un índice real nunca es negativo, así que sirve como señal clara." }
  ]
}
```

## replace() y replaceAll(): sin modificar el original

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const navegador = 'mozilla';\n  const nuevo = navegador.replace('moz', 'van');\n\n  console.log(nuevo);      // 'vanilla'\n  console.log(navegador);  // 'mozilla' — SIN cambios\n\n  let cita = 'Ser o no ser, ser';\n  cita = cita.replaceAll('ser', 'programar'); // reasignando de verdad\n  console.log(cita); // 'programar o no programar, programar'\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(navegador);  // 'mozilla' — SIN cambios", "nota": "replace() NUNCA modifica el string original — devuelve uno nuevo. Si hace falta que el cambio \"se quede\", hay que reasignar la variable explícitamente." },
    { "fragmento": "cita = cita.replaceAll('ser', 'programar'); // reasignando de verdad", "nota": "replace() solo reemplaza la PRIMERA coincidencia; replaceAll() reemplaza TODAS. Fíjate también en la reasignación (cita = ...) — sin ella, el resultado se perdería." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const original = 'mozilla';\n  const modificado = original.replace('moz', 'van');\n  console.log(original);\n  console.log(modificado);\n</script>",
  "opciones": [
    "'mozilla' y luego 'vanilla' — replace() nunca modifica el string original, siempre devuelve uno nuevo",
    "'vanilla' las dos veces — replace() modifica la variable original directamente",
    "'mozilla' las dos veces — hace falta reasignar explícitamente con = para que el cambio se aplique en cualquier caso"
  ],
  "correcta": 0,
  "explicacion": "Los strings son inmutables. replace() nunca toca el string original (original sigue siendo 'mozilla') — devuelve un string NUEVO, que aquí se guardó en modificado."
}
```

## Lo que estos métodos NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "replace() modifica el string original directamente",
      "realidad": "Los strings son inmutables — replace(), como casi todos los métodos de string, siempre devuelve un string NUEVO, dejando el original intacto."
    },
    {
      "mito": "slice(1, 4) incluye el carácter en la posición 4",
      "realidad": "El segundo argumento es EXCLUSIVO — slice(1, 4) devuelve las posiciones 1, 2 y 3, no la 4."
    },
    {
      "mito": "indexOf() encuentra todas las apariciones de una vez",
      "realidad": "Solo devuelve la posición de la PRIMERA aparición — hace falta pasar una posición de inicio para buscar la siguiente."
    },
    {
      "mito": "replace() reemplaza todas las apariciones de una coincidencia",
      "realidad": "replace() solo reemplaza la PRIMERA — para todas, hace falta replaceAll()."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que replace() modifique el string original sin reasignar.", "texto": "Hace falta guardar el resultado en una variable — el original nunca cambia por sí solo." },
    { "titulo": "Confundir slice(a, b) pensando que b es inclusivo.", "texto": "El segundo índice de slice() siempre queda fuera del resultado." },
    { "titulo": "Usar replace() esperando que reemplace todas las apariciones.", "texto": "Solo reemplaza la primera — replaceAll() es la opción para todas." },
    { "titulo": "Olvidar que los índices de string empiezan en 0, no en 1.", "texto": "El primer carácter es texto[0], no texto[1]." }
  ]
}
```

## Ejercicios

1. Escribe una expresión que obtenga el último carácter de una variable de texto, sin saber su longitud de antemano en el código.
2. Extrae los caracteres del índice 2 al 5 (sin incluir el 5) de un string con `slice()`.
3. Escribe una condición que compruebe si un string termina en `.js` con `endsWith()`.
4. Explica la diferencia entre `replace()` y `replaceAll()`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Obtén el último carácter de un string sin saber su longitud de antemano en el código (ejercicio 1). Extrae los caracteres del índice 2 al 5 con slice() (ejercicio 2). Comprueba si termina en .js con endsWith() (ejercicio 3).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst texto = 'JavaScript';\nmostrar(texto.at(-1));\nmostrar(texto.slice(2, 5));\nmostrar('script.js'.endsWith('.js'));",
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
      "titulo": "Useful string methods",
      "descripcion": "Guía de MDN sobre length, slice(), toUpperCase/toLowerCase, includes/startsWith/endsWith, indexOf() y replace/replaceAll.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods",
      "etiqueta": "MDN"
    }
  ]
}
```
