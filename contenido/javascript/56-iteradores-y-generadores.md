# Iteradores y generadores

- **Módulo:** JavaScript moderno
- **Slug:** `iteradores-y-generadores` (autogenerado del título)
- **Orden:** 167
- **Fuentes:** [Iterators and generators (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators) — ver `contenido/javascript/TEMARIO.md` #56

---

## Qué es y para qué sirve

Un iterador es cualquier objeto con un método `next()` que devuelve `{ value, done }` — nada mágico, solo una forma concreta. Un generador (`function*` + `yield`) es la manera moderna de crear uno sin escribir esa forma a mano, y también la base de que `for...of` funcione sobre un objeto propio.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita recorrer algo paso a paso",
  "roles": [
    { "etiqueta": "Quien implementa el protocolo a mano", "rol": "Un objeto con next()", "descripcion": "Cualquier objeto que devuelva { value, done } en cada llamada ya es un iterador válido." },
    { "etiqueta": "Quien lo hace con menos código", "rol": "function* y yield", "descripcion": "Un generador produce el mismo protocolo, pausando en cada yield, sin escribir next() a mano." },
    { "etiqueta": "Quien hace que un objeto sea recorrible", "rol": "[Symbol.iterator]", "descripcion": "El método que un objeto necesita implementar para funcionar con for...of y el spread." }
  ]
}
```

## Un iterador manual: {value, done}

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function crearIteradorDeRango(inicio = 0, fin = Infinity, paso = 1) {\n    let siguienteIndice = inicio;\n\n    return {\n      next() {\n        if (siguienteIndice < fin) {\n          const resultado = { value: siguienteIndice, done: false };\n          siguienteIndice += paso;\n          return resultado;\n        }\n        return { value: undefined, done: true };\n      },\n    };\n  }\n\n  const iterador = crearIteradorDeRango(1, 10, 2);\n  let resultado = iterador.next();\n  while (!resultado.done) {\n    console.log(resultado.value); // 1 3 5 7 9\n    resultado = iterador.next();\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "next() {\n        if (siguienteIndice < fin) {\n          const resultado = { value: siguienteIndice, done: false };\n          siguienteIndice += paso;\n          return resultado;\n        }\n        return { value: undefined, done: true };\n      },", "nota": "Un ITERADOR es cualquier objeto con un método next() que devuelva { value, done } — value es el siguiente elemento, done indica si ya no quedan más. Nada mágico: solo un objeto con esa forma concreta." }
  ]
}
```

## La misma idea, con un generador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function* generarRango(inicio = 0, fin = Infinity, paso = 1) {\n    for (let i = inicio; i < fin; i += paso) {\n      yield i;\n    }\n  }\n\n  for (const numero of generarRango(1, 10, 2)) {\n    console.log(numero); // 1 3 5 7 9\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "function* generarRango(inicio = 0, fin = Infinity, paso = 1) {\n    for (let i = inicio; i < fin; i += paso) {\n      yield i;\n    }\n  }", "nota": "function* declara una función GENERADORA — cada yield pausa la función y produce un valor, exactamente igual que el iterador manual de arriba, pero sin escribir next() ni { value, done } a mano." }
  ]
}
```

## Hacer un objeto propio iterable

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const miIterable = {\n    *[Symbol.iterator]() {\n      yield 1;\n      yield 2;\n      yield 3;\n    },\n  };\n\n  for (const valor of miIterable) {\n    console.log(valor); // 1 2 3\n  }\n\n  console.log([...miIterable]); // [1, 2, 3]\n</script>",
  "anotaciones": [
    { "fragmento": "*[Symbol.iterator]() {\n      yield 1;\n      yield 2;\n      yield 3;\n    },", "nota": "Un objeto es ITERABLE si implementa [Symbol.iterator]() — eso es lo que le permite usarse en for...of, y también con el spread [...]. Aquí, ese método está definido como un generador (con el * delante)." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un generador ya es iterable por sí mismo",
  "contenido": "El propio [Symbol.iterator]() de un generador devuelve this. Por eso un generador se puede recorrer directamente con for...of, sin necesitar envolverlo en ningún objeto adicional."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los iterables integrados ya vienen así",
  "contenido": "String, Array, Map y Set son iterables integrados — su prototipo ya implementa [Symbol.iterator], por eso todos funcionan directamente con for...of y el spread, sin necesitar ninguna configuración adicional."
}
```

## next() también puede enviar datos al generador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function* fibonacci() {\n    let actual = 0;\n    let siguiente = 1;\n    while (true) {\n      const reiniciar = yield actual;\n      [actual, siguiente] = [siguiente, siguiente + actual];\n      if (reiniciar) {\n        actual = 0;\n        siguiente = 1;\n      }\n    }\n  }\n\n  const secuencia = fibonacci();\n  console.log(secuencia.next().value);     // 0\n  console.log(secuencia.next().value);     // 1\n  console.log(secuencia.next().value);     // 1\n  console.log(secuencia.next(true).value); // 0 — el reinicio se activó\n</script>",
  "anotaciones": [
    { "fragmento": "const reiniciar = yield actual;", "nota": "next(valor) no solo pide el SIGUIENTE valor — el argumento que se le pasa se recibe aquí dentro, justo donde estaba pausada la última vez, como el resultado de la propia expresión yield." },
    { "fragmento": "console.log(secuencia.next(true).value); // 0 — el reinicio se activó", "nota": "Pasar true a next() hace que reiniciar valga true dentro del generador — y ese valor se usa para reiniciar la secuencia desde dentro, sin necesitar crear un generador nuevo." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  function* contador() {\n    console.log('Generador iniciado');\n    yield 1;\n    console.log('Después del primer yield');\n    yield 2;\n  }\n\n  const gen = contador();\n  console.log('Antes de la primera llamada a next()');\n  gen.next();\n</script>",
  "opciones": [
    "'Antes de la primera llamada a next()' primero, y solo DESPUÉS 'Generador iniciado' — llamar a la función generadora no ejecuta su cuerpo, solo crea el generador",
    "'Generador iniciado' primero — llamar a contador() ya ejecuta el cuerpo hasta el primer yield",
    "Ambos mensajes se imprimen a la vez, en el mismo instante"
  ],
  "correcta": 0,
  "explicacion": "Llamar a contador() NO ejecuta nada de su cuerpo — solo devuelve un objeto generador, pausado antes de la primera línea. El código dentro solo empieza a correr con la primera llamada a next(), así que 'Antes de la primera llamada a next()' se imprime ANTES que 'Generador iniciado'."
}
```

## Lo que iteradores y generadores NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un iterador es un concepto especial del lenguaje, no un objeto normal",
      "realidad": "Es cualquier objeto con un método next() que devuelva { value, done } — sin ninguna sintaxis mágica."
    },
    {
      "mito": "function* ejecuta el cuerpo de la función inmediatamente al llamarla",
      "realidad": "Solo crea el generador, pausado — el código corre recién con la primera llamada a next()."
    },
    {
      "mito": "next() solo sirve para pedir el siguiente valor, sin poder enviar nada al generador",
      "realidad": "El argumento pasado a next() se recibe dentro, como resultado de la expresión yield donde estaba pausado."
    },
    {
      "mito": "Solo los arrays son iterables de forma nativa en JavaScript",
      "realidad": "String, Map y Set también lo son, entre otros — todos con [Symbol.iterator] en su prototipo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Implementar un iterador manual cuando un generador resolvería lo mismo con mucho menos código.", "texto": "function* y yield evitan escribir { value, done } a mano." },
    { "titulo": "Esperar que llamar a una función generadora ejecute su cuerpo de inmediato.", "texto": "Solo empieza a correr con la primera llamada a next()." },
    { "titulo": "No aprovechar que next(valor) puede enviar datos de vuelta al generador.", "texto": "No solo sirve para pedir el siguiente valor." },
    { "titulo": "Olvidar implementar [Symbol.iterator] al querer que un objeto propio funcione con for...of.", "texto": "Sin él, el objeto no es iterable, sin importar qué otros métodos tenga." }
  ]
}
```

## Ejercicios

1. Escribe un iterador manual con un método `next()` que devuelva `{ value, done }`.
2. Reescribe ese mismo iterador como una función generadora con `function*` y `yield`.
3. Crea un objeto propio con `[Symbol.iterator]()` como generador, y recórrelo con `for...of`.
4. Demuestra que llamar a una función generadora no ejecuta su cuerpo hasta la primera llamada a `next()`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un iterador manual con next() que devuelva { value, done } (ejercicio 1). Reescríbelo como función generadora con function* y yield (ejercicio 2).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nfunction crearIteradorManual(max) {\n  let actual = 0;\n  return {\n    next() {\n      return actual < max ? { value: actual++, done: false } : { value: undefined, done: true };\n    },\n  };\n}\nconst it = crearIteradorManual(3);\nmostrar(it.next());\nmostrar(it.next());\n\nfunction* generador(max) {\n  for (let i = 0; i < max; i++) yield i;\n}\nfor (const valor of generador(3)) {\n  mostrar('generador: ' + valor);\n}",
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
      "titulo": "Iterators and generators",
      "descripcion": "Guía de MDN sobre el protocolo de iterador, function*/yield, el protocolo iterable con Symbol.iterator, los iterables integrados, y next() enviando datos al generador.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators",
      "etiqueta": "MDN"
    }
  ]
}
```
