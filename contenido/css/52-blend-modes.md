# Blend modes

- **Módulo:** Efectos visuales avanzados
- **Slug:** `blend-modes` (autogenerado del título)
- **Orden:** 255
- **Fuentes:** [Advanced styling effects (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects) + [Blend Modes (web.dev)](https://web.dev/learn/css/blend-modes) — ver `contenido/css/TEMARIO.md` #52

---

## Qué es y para qué sirve

Los blend modes deciden cómo se combinan los colores de dos capas superpuestas — no como una simplemente tapando a la otra, sino mezclando sus valores de color según una fórmula concreta. `mix-blend-mode` mezcla un elemento entero con lo que tiene detrás; `background-blend-mode` mezcla varios fondos dentro del mismo elemento.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién mezcla colores en vez de simplemente taparlos",
  "roles": [
    { "etiqueta": "Quien combina colores superpuestos", "rol": "Mezclar dos capas, no solo apilarlas", "descripcion": "Un texto sobre una imagen con mix-blend-mode se combina con ella, en vez de taparla con un rectángulo opaco." },
    { "etiqueta": "Quien crea efecto duotono", "rol": "Combinar una imagen con un color plano", "descripcion": "Un blend mode entre una foto y un color sólido puede producir un efecto de dos tonos, sin editar la imagen original." },
    { "etiqueta": "Quien aísla un elemento del fondo", "rol": "Evitar que un blend se propague de más", "descripcion": "isolation: isolate crea un nuevo contexto de apilamiento, evitando mezclas no deseadas con capas más lejanas." }
  ]
}
```

## mix-blend-mode frente a background-blend-mode

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .elemento {\n    mix-blend-mode: multiply;\n  }\n\n  .con-varios-fondos {\n    background: url(\"textura.png\"), linear-gradient(90deg, red, blue);\n    background-blend-mode: multiply;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "mix-blend-mode: multiply;", "nota": "Mezcla TODO el elemento — su contenido y su propio fondo — con lo que hay detrás de él en la página, más allá de sus propios límites." },
    { "fragmento": "background-blend-mode: multiply;", "nota": "Mezcla SOLO las capas de fondo declaradas dentro del mismo elemento (aquí, una imagen y un degradado) entre sí — no afecta a nada de fuera de ese elemento." }
  ]
}
```

## Verlo en vivo: multiply oscurece

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 140px; font-family: sans-serif; background: white;\">\n  <div style=\"position: absolute; top: 20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: #dc2626;\"></div>\n  <div style=\"position: absolute; top: 20px; left: 80px; width: 80px; height: 80px; border-radius: 50%; background: #2563eb;\"></div>\n</div>",
  "despues": "<div style=\"position: relative; height: 140px; font-family: sans-serif; background: white;\">\n  <div style=\"position: absolute; top: 20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: #dc2626;\"></div>\n  <div style=\"position: absolute; top: 20px; left: 80px; width: 80px; height: 80px; border-radius: 50%; background: #2563eb; mix-blend-mode: multiply;\"></div>\n</div>",
  "nota": "Dos círculos superpuestos sobre fondo blanco. Antes: sin mix-blend-mode, el círculo azul simplemente TAPA al rojo donde se solapan. Después: mix-blend-mode: multiply en el azul combina los colores en la zona de solape, produciendo un tono mucho más oscuro que cualquiera de los dos originales."
}
```

## Verlo en vivo: screen aclara

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 140px; font-family: sans-serif; background: #1e293b;\">\n  <div style=\"position: absolute; top: 20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: #dc2626;\"></div>\n  <div style=\"position: absolute; top: 20px; left: 80px; width: 80px; height: 80px; border-radius: 50%; background: #2563eb;\"></div>\n</div>",
  "despues": "<div style=\"position: relative; height: 140px; font-family: sans-serif; background: #1e293b;\">\n  <div style=\"position: absolute; top: 20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: #dc2626;\"></div>\n  <div style=\"position: absolute; top: 20px; left: 80px; width: 80px; height: 80px; border-radius: 50%; background: #2563eb; mix-blend-mode: screen;\"></div>\n</div>",
  "nota": "Mismos dos círculos, ahora sobre fondo oscuro. Después: mix-blend-mode: screen en el azul ACLARA el resultado en la zona de solape — un tono mucho más luminoso que los dos colores originales, el efecto contrario a multiply."
}
```

## Verlo en vivo: difference, como un negativo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"position: relative; height: 140px; font-family: sans-serif; background: white;\">\n  <div style=\"position: absolute; top: 20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: #dc2626;\"></div>\n  <div style=\"position: absolute; top: 20px; left: 80px; width: 80px; height: 80px; border-radius: 50%; background: #2563eb;\"></div>\n</div>",
  "despues": "<div style=\"position: relative; height: 140px; font-family: sans-serif; background: white;\">\n  <div style=\"position: absolute; top: 20px; left: 30px; width: 80px; height: 80px; border-radius: 50%; background: #dc2626;\"></div>\n  <div style=\"position: absolute; top: 20px; left: 80px; width: 80px; height: 80px; border-radius: 50%; background: #2563eb; mix-blend-mode: difference;\"></div>\n</div>",
  "nota": "Después: mix-blend-mode: difference resta el valor de cada canal de color entre las dos capas superpuestas — el resultado es un tono que no se parece a ninguno de los dos colores originales, el mismo principio detrás de los efectos de negativo fotográfico."
}
```

## Modos no separables: hue, saturation, color, luminosity

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .duotono {\n    mix-blend-mode: color;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "mix-blend-mode: color;", "nota": "A diferencia de multiply o screen (que tratan cada canal RGB por separado), color toma el matiz y la saturación de la capa superior, pero conserva la LUMINOSIDAD de lo que hay debajo — el patrón clásico detrás de un efecto duotono sobre una fotografía." }
  ]
}
```

## isolation: evitar mezclas no deseadas

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "isolation: isolate crea una barrera de mezcla",
  "contenido": "Si un grupo de elementos con mix-blend-mode debe mezclarse ENTRE SÍ, pero no con capas más lejanas de la página, isolation: isolate en su contenedor crea un nuevo contexto de apilamiento que actúa como barrera. Solo afecta a mix-blend-mode — los fondos que usa background-blend-mode ya están aislados por naturaleza, esta propiedad no les añade nada."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .fondo {\n    background: url(\"textura.jpg\") no-repeat, linear-gradient(90deg, red, blue);\n    background-blend-mode: multiply;\n  }\n  .encima {\n    mix-blend-mode: screen;\n  }\n</style>\n<div class=\"fondo\">\n  <div class=\"encima\">Texto</div>\n</div>",
  "opciones": [
    "Son la misma propiedad, solo cambia el nombre según el contexto",
    "background-blend-mode combina solo las capas de fondo de .fondo; mix-blend-mode combina .encima con TODO lo que hay debajo, fondo incluido",
    "mix-blend-mode solo funciona en elementos que no tienen ningún fondo propio"
  ],
  "correcta": 1,
  "explicacion": "background-blend-mode actúa únicamente entre las capas de fondo declaradas dentro del MISMO elemento (.fondo). mix-blend-mode, en cambio, mezcla el elemento entero (.encima) con cualquier cosa que tenga detrás en la página, más allá de sus propios límites."
}
```

## Lo que los blend modes NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "mix-blend-mode y background-blend-mode hacen exactamente lo mismo",
      "realidad": "background-blend-mode combina solo las capas de fondo de un mismo elemento; mix-blend-mode combina el elemento entero (contenido incluido) con lo que hay detrás de él."
    },
    {
      "mito": "multiply y screen producen resultados parecidos",
      "realidad": "Son prácticamente opuestos — multiply siempre oscurece el resultado, screen siempre lo aclara."
    },
    {
      "mito": "isolation: isolate afecta también a background-blend-mode",
      "realidad": "Los fondos ya están aislados por naturaleza — isolation solo tiene efecto real sobre mix-blend-mode."
    },
    {
      "mito": "Los blend modes tienen soporte universal desde hace años, igual que otros efectos como filter",
      "realidad": "Son una función relativamente reciente, con un historial de soporte más desigual — conviene comprobarlo si el efecto es esencial."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir mix-blend-mode con background-blend-mode.", "texto": "Uno mezcla el elemento entero con lo de fuera; el otro, solo los fondos de dentro." },
    { "titulo": "Esperar que isolation: isolate afecte a background-blend-mode.", "texto": "Los fondos ya están aislados por defecto — isolation no les añade nada." },
    { "titulo": "No comprobar el soporte real del navegador antes de depender del efecto.", "texto": "Los blend modes han tenido un soporte históricamente más desigual que otros efectos visuales." },
    { "titulo": "Olvidar que mix-blend-mode mezcla con TODO lo que hay detrás, no con un elemento concreto elegido.", "texto": "Puede producir mezclas inesperadas con capas más lejanas si no se aísla con isolation." }
  ]
}
```

## Ejercicios

1. Escribe una regla `mix-blend-mode: multiply` sobre un elemento superpuesto a una imagen.
2. Escribe un elemento con dos fondos (imagen y color) combinados con `background-blend-mode: overlay`.
3. Explica qué problema resuelve `isolation: isolate`.
4. Explica la diferencia entre `multiply` y `difference` con un ejemplo propio.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Advanced styling effects",
      "descripcion": "Guía de MDN con ejemplos de mix-blend-mode y background-blend-mode usando el modo multiply.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Blend Modes",
      "descripcion": "Capítulo del curso Learn CSS de web.dev con el listado completo de blend modes separables y no separables, y la propiedad isolation.",
      "url": "https://web.dev/learn/css/blend-modes",
      "etiqueta": "web.dev"
    }
  ]
}
```
