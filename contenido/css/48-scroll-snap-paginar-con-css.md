# Scroll snap: paginar con CSS

- **Módulo:** Movimiento e interactividad
- **Slug:** `scroll-snap-paginar-con-css` (autogenerado del título)
- **Orden:** 235
- **Fuentes:** [CSS scroll snap (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap) — ver `contenido/css/TEMARIO.md` #48

---

## Qué es y para qué sirve

Un carrusel de imágenes que se queda "a medias" al soltar el scroll, cortando una imagen por la mitad, se resolvía antes con JavaScript midiendo posiciones. `scroll-snap-type` y `scroll-snap-align` hacen que el navegador encaje el scroll en puntos concretos por su cuenta — sin ninguna librería, sin ningún cálculo manual de píxeles.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que el scroll encaje en un punto concreto",
  "roles": [
    { "etiqueta": "Quien construye galerías horizontales", "rol": "Que cada imagen quede completa al soltar", "descripcion": "Sin scroll-snap, el scroll libre puede dejar una imagen cortada a la mitad entre dos posiciones." },
    { "etiqueta": "Quien pagina contenido con scroll", "rol": "Una sección por pantalla, sin JS", "descripcion": "scroll-snap-type: y mandatory convierte un scroll vertical libre en algo parecido a pasar de página en página." },
    { "etiqueta": "Quien evita el scroll libre impreciso", "rol": "Delegar el encaje al navegador", "descripcion": "El navegador calcula el punto de encaje más cercano — no hace falta medir posiciones a mano con JavaScript." }
  ]
}
```

## scroll-snap-type: activar el encaje en el contenedor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .galeria {\n    overflow-x: auto;\n    scroll-snap-type: x mandatory;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "overflow-x: auto;", "nota": "Imprescindible: scroll-snap-type no tiene ningún efecto en un elemento que no puede desplazarse — hace falta overflow (auto o scroll) para que exista algo que encajar." },
    { "fragmento": "scroll-snap-type: x mandatory;", "nota": "x es el eje (también puede ser y, o both). mandatory obliga al navegador a terminar SIEMPRE en un punto de encaje; proximity solo encaja si el scroll ya quedó cerca de uno." }
  ]
}
```

## scroll-snap-align: dónde encaja cada hijo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .galeria > .item {\n    scroll-snap-align: start;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "scroll-snap-align: start;", "nota": "Se declara en los HIJOS, no en el contenedor — define en qué punto de CADA elemento se produce el encaje: al principio (start), al centro (center) o al final (end) del contenedor visible." }
  ]
}
```

## El ejemplo completo: una galería horizontal

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .galeria {\n    display: flex;\n    overflow-x: auto;\n    scroll-snap-type: x mandatory;\n    gap: 12px;\n  }\n  .galeria > .item {\n    flex: 0 0 100%;\n    scroll-snap-align: start;\n  }\n</style>\n<div class=\"galeria\">\n  <div class=\"item\">Imagen 1</div>\n  <div class=\"item\">Imagen 2</div>\n  <div class=\"item\">Imagen 3</div>\n</div>",
  "anotaciones": [
    { "fragmento": "flex: 0 0 100%;", "nota": "Cada item ocupa el 100% del ancho visible del contenedor — combinado con scroll-snap-align: start, el scroll siempre se detiene con exactamente UN item completo a la vista." }
  ]
}
```

## mandatory frente a proximity

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuánto obliga el encaje",
  "contenido": "mandatory obliga al navegador a terminar SIEMPRE en un punto de encaje, incluso tras un scroll muy corto — puede sentirse brusco si se aplica a listas largas. proximity es más suave: solo encaja cuando el scroll ya se detuvo razonablemente cerca de un punto; si queda lejos de todos, simplemente no encaja."
}
```

## scroll-padding y scroll-margin: ajustar el punto exacto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .contenedor {\n    scroll-padding-top: 60px;\n  }\n\n  .item {\n    scroll-margin-top: 8px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "scroll-padding-top: 60px;", "nota": "Se declara en el CONTENEDOR. Compensa un header fijo superpuesto de 60px: sin esto, el encaje colocaría el item justo debajo del borde superior real, escondido detrás del header." },
    { "fragmento": "scroll-margin-top: 8px;", "nota": "Se declara en el HIJO. Ajusta el área de encaje de ESE elemento en particular, como un margin pero solo para efectos de scroll-snap — no afecta al layout normal." }
  ]
}
```

## scroll-snap-stop: no permitir saltarse elementos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .item {\n    scroll-snap-stop: always;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "scroll-snap-stop: always;", "nota": "Por defecto (normal), un scroll rápido o un gesto brusco puede saltarse puntos de encaje intermedios. always obliga a detenerse en CADA uno, uno por uno, sin poder saltar directamente al tercero o cuarto item." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .galeria {\n    display: flex;\n    overflow-x: auto;\n    scroll-snap-type: x mandatory;\n  }\n  .galeria > div {\n    flex: 0 0 100%;\n  }\n</style>\n<div class=\"galeria\">\n  <div>1</div>\n  <div>2</div>\n  <div>3</div>\n</div>",
  "opciones": [
    "Nada, funciona correctamente tal cual — el contenedor ya define todo lo necesario",
    "Falta scroll-snap-align en los hijos — sin eso, el contenedor permite el encaje pero ningún elemento define en qué punto encajarse",
    "Falta añadir JavaScript; scroll-snap-type no funciona sin él"
  ],
  "correcta": 1,
  "explicacion": "scroll-snap-type en el contenedor solo HABILITA el encaje — hace falta también scroll-snap-align en los hijos para que cada uno defina en qué punto concreto (start, center o end) se produce ese encaje. Sin él, el scroll sigue siendo libre."
}
```

## Lo que scroll-snap NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "scroll-snap-type por sí solo ya hace que los elementos encajen",
      "realidad": "También hace falta scroll-snap-align en los HIJOS — el contenedor permite el encaje, los hijos definen dónde."
    },
    {
      "mito": "mandatory obliga siempre a parar exactamente en un punto de encaje, sin excepción",
      "realidad": "Un scroll muy rápido o gestual puede saltarse puntos intermedios, salvo que se use scroll-snap-stop: always."
    },
    {
      "mito": "scroll-snap-type funciona en cualquier elemento, tenga o no overflow",
      "realidad": "El elemento necesita overflow (auto o scroll) para que haya algo que desplazar y, por tanto, algo que encajar."
    },
    {
      "mito": "scroll-padding y scroll-margin son la misma propiedad con otro nombre",
      "realidad": "scroll-padding se declara en el CONTENEDOR; scroll-margin se declara en el HIJO — actúan en extremos distintos de la relación."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar overflow en el contenedor con scroll-snap-type.", "texto": "Sin overflow no hay nada que desplazar, así que tampoco hay nada que encajar." },
    { "titulo": "No declarar scroll-snap-align en los hijos.", "texto": "El contenedor solo habilita el encaje — los hijos son quienes definen el punto exacto." },
    { "titulo": "Confundir mandatory con una garantía absoluta sin excepciones.", "texto": "Un scroll rápido puede saltarse puntos intermedios sin scroll-snap-stop: always." },
    { "titulo": "Confundir scroll-padding con scroll-margin.", "texto": "Una va en el contenedor, la otra en el hijo — no son intercambiables." }
  ]
}
```

## Ejercicios

1. Escribe una galería horizontal con `scroll-snap-type: x mandatory` en el contenedor y `scroll-snap-align: start` en cada hijo.
2. Explica la diferencia práctica entre `mandatory` y `proximity`.
3. Escribe una regla `scroll-padding-top` que compense un header fijo de 60px de alto.
4. Explica para qué sirve `scroll-snap-stop: always` y qué problema resuelve.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CSS scroll snap",
      "descripcion": "Referencia de MDN sobre scroll-snap-type, scroll-snap-align, scroll-padding, scroll-margin y scroll-snap-stop, con un ejemplo completo de galería.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap",
      "etiqueta": "MDN"
    }
  ]
}
```
