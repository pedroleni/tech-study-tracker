# El operador ternario y los operadores lógicos &&, || y ??

- **Módulo:** Cadenas de texto y control de flujo
- **Slug:** `el-operador-ternario-y-los-operadores-logicos-y` (autogenerado del título)
- **Orden:** 35
- **Fuentes:** [Making decisions in your code — conditionals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals) + [Control flow (web.dev)](https://web.dev/learn/javascript/control-flow) + [Nullish coalescing operator (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — ver `contenido/javascript/TEMARIO.md` #12

---

## Qué es y para qué sirve

El operador ternario condensa un `if`/`else` corto en una sola línea. Los operadores lógicos combinan varias condiciones — `&&` exige que todas se cumplan, `||` con que se cumpla una basta. `??` resuelve un problema muy concreto que `||` no resuelve bien: dar un valor por defecto sin pisar por accidente un `0` o un `''` que sí eran válidos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita condensar o combinar condiciones",
  "roles": [
    { "etiqueta": "Quien abrevia un if/else simple", "rol": "Una sola línea en vez de cinco", "descripcion": "El operador ternario es especialmente útil para asignar un valor u otro según una condición." },
    { "etiqueta": "Quien combina condiciones con && y ||", "rol": "Todas a la vez, o basta con una", "descripcion": "&& exige que las dos partes sean verdaderas; || se conforma con que lo sea al menos una." },
    { "etiqueta": "Quien preserva valores falsy válidos", "rol": "?? en vez de || para valores por defecto", "descripcion": "?? solo sustituye null o undefined — 0 y '' se mantienen intactos, algo que || no garantiza." }
  ]
}
```

## El operador ternario

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const esCumpleanos = true;\n\n  const saludo = esCumpleanos\n    ? '¡Feliz cumpleaños!'\n    : 'Buenos días.';\n\n  console.log(saludo); // '¡Feliz cumpleaños!'\n</script>",
  "anotaciones": [
    { "fragmento": "esCumpleanos\n    ? '¡Feliz cumpleaños!'\n    : 'Buenos días.';", "nota": "La sintaxis es condición ? valor_si_true : valor_si_false — un if/else condensado en una única expresión, pensado sobre todo para asignar un valor u otro." }
  ]
}
```

## && (AND): las dos partes tienen que ser verdaderas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const clima = 'soleado';\n  const temperatura = 28;\n\n  if (clima === 'soleado' && temperatura > 25) {\n    console.log('Día perfecto para la playa');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (clima === 'soleado' && temperatura > 25) {", "nota": "&& exige que AMBAS condiciones sean verdaderas — si cualquiera de las dos es false, el bloque no se ejecuta." }
  ]
}
```

## || (OR): basta con que una sea verdadera

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const furgonetaDeHelados = false;\n  const casaEnLlamas = true;\n\n  if (furgonetaDeHelados || casaEnLlamas) {\n    console.log('Deberías salir de casa rápido.');\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (furgonetaDeHelados || casaEnLlamas) {", "nota": "|| se conforma con que UNA de las dos sea verdadera — aquí, aunque no haya furgoneta de helados, la casa en llamas ya es suficiente para entrar en el bloque." }
  ]
}
```

## ??: valores por defecto sin pisar 0 ni ''

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const cantidad = 0;\n\n  const conOr = cantidad || 42;\n  console.log(conOr); // 42 — 0 es falsy, || lo sustituye\n\n  const conNullish = cantidad ?? 42;\n  console.log(conNullish); // 0 — ?? solo sustituye null o undefined\n</script>",
  "anotaciones": [
    { "fragmento": "const conOr = cantidad || 42;\n  console.log(conOr); // 42 — 0 es falsy, || lo sustituye", "nota": "|| cae al valor de respaldo con CUALQUIER valor falsy — 0 es falsy, así que || lo trata igual que si no hubiera valor en absoluto, sustituyéndolo por 42." },
    { "fragmento": "const conNullish = cantidad ?? 42;\n  console.log(conNullish); // 0 — ?? solo sustituye null o undefined", "nota": "?? solo cae al valor de respaldo cuando el valor original es null o undefined — un 0 real y válido se mantiene intacto, justo el problema que || no resuelve bien." }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const config = { volumen: null };\n\n  const volumenFinal = config.volumen ?? 50; // 50, porque volumen es null\n  console.log(volumenFinal);\n</script>",
  "anotaciones": [
    { "fragmento": "const volumenFinal = config.volumen ?? 50; // 50, porque volumen es null", "nota": "Un caso de uso real: un valor de configuración que puede llegar como null (sin definir) frente a uno que llega como 0 (silencio, un valor deliberado) — ?? distingue correctamente entre los dos casos, || no." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const cantidad = 0;\n  console.log(cantidad || 42);\n  console.log(cantidad ?? 42);\n</script>",
  "opciones": [
    "42 y luego 0 — || cae al valor de respaldo con cualquier valor falsy (incluido 0), ?? solo con null o undefined",
    "0 las dos veces — || y ?? se comportan exactamente igual",
    "42 las dos veces — ambos operadores tratan 0 como un valor vacío que hay que sustituir"
  ],
  "correcta": 0,
  "explicacion": "0 es falsy, así que || lo sustituye por 42. ?? solo sustituye cuando el valor es null o undefined — 0 es un valor real y válido, así que ?? lo deja intacto."
}
```

## Lo que estos operadores NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "|| y ?? hacen exactamente lo mismo, solo con sintaxis distinta",
      "realidad": "|| cae al valor de respaldo con CUALQUIER valor falsy (0, '', false, NaN); ?? solo lo hace con null o undefined."
    },
    {
      "mito": "El operador ternario solo puede usarse para asignar un valor a una variable",
      "realidad": "También se puede usar para ejecutar código o llamar funciones condicionalmente, aunque asignar un valor es su uso más habitual."
    },
    {
      "mito": "&& necesita que ambas expresiones sean literalmente true para devolver algo",
      "realidad": "&& devuelve el primer valor falsy que encuentra, o el ÚLTIMO valor si todos son truthy — no necesariamente el booleano true."
    },
    {
      "mito": "! siempre convierte un valor en su booleano opuesto exacto",
      "realidad": "!valor primero CONVIERTE valor a booleano según sea truthy o falsy, y LUEGO lo niega — el resultado siempre es un booleano puro, sin importar el tipo original."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar || para un valor por defecto cuando 0 o '' son valores válidos.", "texto": "|| los trataría como \"vacíos\" y los sustituiría sin querer — ?? es la herramienta correcta ahí." },
    { "titulo": "Confundir && y || pensando que siempre devuelven un booleano puro.", "texto": "Devuelven uno de los propios valores comparados, no necesariamente true o false." },
    { "titulo": "Anidar demasiados ternarios, sacrificando legibilidad por brevedad.", "texto": "Un ternario dentro de otro ternario suele ser más difícil de leer que un if/else normal." },
    { "titulo": "No conocer ?? como alternativa más precisa a || para valores por defecto.", "texto": "Resuelve exactamente el caso donde 0 o '' son datos reales, no ausencia de dato." }
  ]
}
```

## Ejercicios

1. Escribe un ternario que asigne `'Mayor de edad'` o `'Menor de edad'` según una variable `edad`.
2. Explica la diferencia entre `cantidad || 42` y `cantidad ?? 42` cuando `cantidad` vale `0`.
3. Escribe una condición con `&&` que compruebe dos condiciones a la vez.
4. Explica qué devuelve `&&` cuando ambas expresiones son truthy, no solo si el resultado final es `true` o `false`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un ternario que asigne 'Mayor de edad' o 'Menor de edad' según edad (ejercicio 1). Compara cantidad || 42 y cantidad ?? 42 cuando cantidad vale 0 (ejercicio 2).",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) {\n  salida.textContent += (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2)) + '\\n';\n}\nwindow.addEventListener('error', (evento) => mostrar('Error: ' + evento.message));\n\nconst edad = 20;\n// const resultado = edad >= 18 ? ... : ...;\n\nconst cantidad = 0;\nmostrar('cantidad || 42 -> ' + (cantidad || 42));\nmostrar('cantidad ?? 42 -> ' + (cantidad ?? 42));",
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
      "titulo": "Making decisions in your code — conditionals",
      "descripcion": "Guía de MDN sobre el operador ternario y los operadores lógicos && y ||.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Control flow",
      "descripcion": "Capítulo de web.dev sobre if/else, switch y el operador ternario.",
      "url": "https://web.dev/learn/javascript/control-flow",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Nullish coalescing operator",
      "descripcion": "Referencia de MDN sobre ?? y la diferencia real frente a || para valores por defecto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing",
      "etiqueta": "MDN"
    }
  ]
}
```
