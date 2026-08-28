# Fechas y horas

- **Módulo:** JavaScript moderno
- **Slug:** `fechas-y-horas` (autogenerado del título)
- **Orden:** 173
- **Fuentes:** [Representing dates & times (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Representing_dates_times) — ver `contenido/javascript/TEMARIO.md` #58

---

## Qué es y para qué sirve

`Date` representa un instante concreto — internamente, solo un número: milisegundos desde el 1 de enero de 1970 (el "epoch"). Crearla, leerla y compararla tiene su propio conjunto de métodos, con un gotcha clásico esperando desde la primera línea.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita trabajar con un instante concreto",
  "roles": [
    { "etiqueta": "Quien crea una fecha", "rol": "new Date(...)", "descripcion": "Sin argumentos, ahora mismo; con números sueltos, cuidado — el mes empieza en 0." },
    { "etiqueta": "Quien lee sus partes", "rol": "getFullYear(), getMonth()...", "descripcion": "Cada parte tiene su propio getter, con rangos que conviene conocer de antemano." },
    { "etiqueta": "Quien compara dos fechas", "rol": "getTime()", "descripcion": "Devuelve milisegundos desde el epoch — restar dos fechas da la diferencia en esa unidad." }
  ]
}
```

## Crear una fecha: el gotcha del mes 0-indexado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const ahora = new Date(); // fecha y hora actuales\n\n  const navidad95Texto = new Date('1995-12-25'); // desde un string ISO\n\n  const navidad95Numeros = new Date(1995, 11, 25); // año, MES (0-indexado), día\n  console.log(navidad95Numeros.getMonth()); // 11 — diciembre, no 12\n</script>",
  "anotaciones": [
    { "fragmento": "const navidad95Numeros = new Date(1995, 11, 25); // año, MES (0-indexado), día", "nota": "Al crear una fecha con números sueltos, el MES empieza en 0 (enero) y termina en 11 (diciembre) — 11 aquí es diciembre, un desajuste de uno que sorprende constantemente." }
  ]
}
```

## Leer sus partes: getters con nombres parecidos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const navidad95 = new Date('1995-12-25');\n\n  console.log(navidad95.getFullYear()); // 1995\n  console.log(navidad95.getMonth());    // 11 — diciembre, recordando el 0-indexado\n  console.log(navidad95.getDate());     // 25 — el día del mes\n  console.log(navidad95.getDay());      // el día de la SEMANA: 0 (domingo) a 6 (sábado)\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(navidad95.getDate());     // 25 — el día del mes\n  console.log(navidad95.getDay());      // el día de la SEMANA: 0 (domingo) a 6 (sábado)", "nota": "getDate() da el día del MES (1-31); getDay() da el día de la SEMANA (0-6) — dos métodos con nombres parecidos, pero que devuelven cosas completamente distintas." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El mes 0-indexado: la fuente de error más común",
  "contenido": "Crear new Date(2024, 3, 1) esperando abril da MARZO, porque 3 es el cuarto mes empezando a contar desde 0. Merece revisarse siempre dos veces al construir una fecha con números sueltos."
}
```

## Internamente, solo un número: milisegundos desde el epoch

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  console.log(Date.now()); // milisegundos desde el 1 de enero de 1970 (UTC)\n\n  const ahora = new Date();\n  console.log(ahora.getTime()); // el mismo tipo de valor, desde una instancia ya creada\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(Date.now()); // milisegundos desde el 1 de enero de 1970 (UTC)", "nota": "Internamente, una fecha en JavaScript es solo un NÚMERO — milisegundos desde el 1 de enero de 1970 (el 'epoch'). Date.now() lo da directamente, sin crear ninguna instancia." }
  ]
}
```

## Comparar fechas restando getTime()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const hoy = new Date();\n  const finDeAnio = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);\n\n  const msPorDia = 24 * 60 * 60 * 1000;\n  const diasRestantes = Math.round((finDeAnio.getTime() - hoy.getTime()) / msPorDia);\n\n  console.log(diasRestantes);\n</script>",
  "anotaciones": [
    { "fragmento": "const diasRestantes = Math.round((finDeAnio.getTime() - hoy.getTime()) / msPorDia);", "nota": "Restar dos fechas con getTime() da la diferencia en MILISEGUNDOS — dividir entre milisegundos-por-día (24 × 60 × 60 × 1000) la convierte en días, la unidad que realmente interesa aquí." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  const fecha = new Date(2024, 3, 15);\n  console.log(fecha.getMonth());\n  console.log(fecha.getMonth() + 1); // el mes \"humano\", del 1 al 12\n</script>",
  "opciones": [
    "3 y 4 — el mes 0-indexado guarda abril como 3; sumarle 1 da el número de mes que usaría una persona",
    "4 y 5 — new Date(2024, 3, 15) crea directamente el mes 4 (abril)",
    "3 y 3 — getMonth() + 1 no cambia nada, sigue devolviendo el índice interno"
  ],
  "correcta": 0,
  "explicacion": "new Date(2024, 3, 15) usa 3 como el CUARTO mes contando desde 0 — abril. getMonth() devuelve ese mismo 3, no 4. Sumarle 1 (fecha.getMonth() + 1) es el ajuste habitual para mostrar el número de mes 'humano': 4."
}
```

## Lo que Date NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El mes en new Date(año, mes, día) se cuenta empezando en 1, como en el calendario normal",
      "realidad": "Empieza en 0 — enero es 0, diciembre es 11."
    },
    {
      "mito": "getDate() devuelve el día de la semana",
      "realidad": "Devuelve el día del MES (1-31); getDay() es el de la semana (0-6)."
    },
    {
      "mito": "Una fecha en JavaScript se guarda internamente como texto",
      "realidad": "Se guarda como un número — milisegundos desde el 1 de enero de 1970."
    },
    {
      "mito": "Restar dos fechas con getTime() da directamente el número de días de diferencia",
      "realidad": "Da MILISEGUNDOS — hay que dividir entre los milisegundos que tiene un día."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Crear una fecha con el mes equivocado, olvidando que empieza en 0.", "texto": "El error más común al trabajar con Date en JavaScript." },
    { "titulo": "Confundir getDate() (día del mes) con getDay() (día de la semana).", "texto": "Nombres parecidos, valores completamente distintos." },
    { "titulo": "Pensar en una fecha como un objeto de texto, en vez del número que realmente es.", "texto": "Es milisegundos desde el epoch, por dentro." },
    { "titulo": "No dividir entre los milisegundos por día al calcular una diferencia de fechas en días.", "texto": "getTime() siempre trabaja en milisegundos, no en la unidad que se necesite mostrar." }
  ]
}
```

## Ejercicios

1. Crea una fecha con `new Date(año, mes, día)`, y comprueba con `getMonth()` que el mes coincide con lo esperado (recordando el 0-indexado).
2. Usa `getDate()` y `getDay()` sobre la misma fecha, y explica la diferencia entre lo que devuelve cada uno.
3. Usa `Date.now()` para obtener el número de milisegundos actual desde el epoch.
4. Calcula cuántos días quedan hasta una fecha futura, restando dos valores de `getTime()` y dividiendo entre los milisegundos de un día.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Representing dates & times",
      "descripcion": "Guía de MDN sobre la creación de fechas (incluido el mes 0-indexado), los getters principales, Date.now()/getTime(), y la comparación de fechas restando milisegundos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Representing_dates_times",
      "etiqueta": "MDN"
    }
  ]
}
```
