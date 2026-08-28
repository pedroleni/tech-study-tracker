# Detectar visibilidad: Intersection Observer

- **Módulo:** APIs del navegador
- **Slug:** `detectar-visibilidad-intersection-observer` (autogenerado del título)
- **Orden:** 197
- **Fuentes:** [Intersection Observer API (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) — ver `contenido/javascript/TEMARIO.md` #66

---

## Qué es y para qué sirve

Saber si un elemento es visible en pantalla solía exigir escuchar `scroll` y recalcular posiciones constantemente — costoso, porque ese evento se dispara decenas de veces por segundo. `IntersectionObserver` hace ese trabajo de forma asíncrona, avisando solo cuando de verdad hace falta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita saber si algo es visible",
  "roles": [
    { "etiqueta": "Quien crea el observador", "rol": "new IntersectionObserver(callback)", "descripcion": "El callback se ejecuta cada vez que cambia la intersección de algún elemento observado." },
    { "etiqueta": "Quien empieza a vigilar", "rol": "observe(elemento)", "descripcion": "Sin esta llamada, el observador existe pero no vigila nada todavía." },
    { "etiqueta": "Quien deja de vigilar", "rol": "unobserve() / disconnect()", "descripcion": "unobserve() detiene un elemento concreto; disconnect() detiene todos a la vez." }
  ]
}
```

## Crear un observador y empezar a vigilar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const observador = new IntersectionObserver((entradas) => {\n    entradas.forEach((entrada) => {\n      console.log(entrada.target, entrada.isIntersecting);\n    });\n  });\n\n  const elemento = document.querySelector('.tarjeta');\n  observador.observe(elemento);\n</script>",
  "anotaciones": [
    { "fragmento": "const observador = new IntersectionObserver((entradas) => {", "nota": "new IntersectionObserver(callback) crea el observador — el callback se ejecuta cada vez que cambia la intersección de CUALQUIER elemento observado." },
    { "fragmento": "observador.observe(elemento);", "nota": "observe(elemento) es lo que empieza a vigilarlo de verdad — sin esta llamada, el observador no hace nada." }
  ]
}
```

## isIntersecting y target: qué cambió, y en cuál

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const observador = new IntersectionObserver((entradas) => {\n    entradas.forEach((entrada) => {\n      if (entrada.isIntersecting) {\n        entrada.target.classList.add('visible');\n      } else {\n        entrada.target.classList.remove('visible');\n      }\n    });\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "if (entrada.isIntersecting) {", "nota": "isIntersecting es un booleano: true si el elemento está actualmente cruzando el umbral de visibilidad." },
    { "fragmento": "entrada.target.classList.add('visible');", "nota": "target es el elemento EXACTO que cambió — necesario porque el callback recibe entradas de TODOS los elementos observados a la vez, no solo de uno." }
  ]
}
```

## threshold: cuánto tiene que verse para disparar

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const observadorMitad = new IntersectionObserver(callback, {\n    threshold: 0.5, // se dispara cuando el 50% del elemento es visible\n  });\n\n  const observadorPorPasos = new IntersectionObserver(callback, {\n    threshold: [0, 0.25, 0.5, 0.75, 1], // se dispara en cada 25% adicional\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "threshold: 0.5, // se dispara cuando el 50% del elemento es visible", "nota": "threshold decide QUÉ PORCENTAJE de visibilidad dispara el callback — por defecto es 0 (con solo un píxel visible ya cuenta)." },
    { "fragmento": "threshold: [0, 0.25, 0.5, 0.75, 1], // se dispara en cada 25% adicional", "nota": "Un array de valores dispara el callback varias veces, una por cada umbral cruzado — útil para animaciones progresivas según cuánto se ve." }
  ]
}
```

## El caso práctico: carga diferida de imágenes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  const observadorImagenes = new IntersectionObserver((entradas, observador) => {\n    entradas.forEach((entrada) => {\n      if (entrada.isIntersecting) {\n        const img = entrada.target;\n        img.src = img.dataset.src; // carga la imagen real\n        observador.unobserve(img); // deja de vigilarla, ya no hace falta\n      }\n    });\n  }, { threshold: 0.01 });\n\n  document.querySelectorAll('.imagen-diferida').forEach((img) => {\n    observadorImagenes.observe(img);\n  });\n</script>",
  "anotaciones": [
    { "fragmento": "img.src = img.dataset.src; // carga la imagen real", "nota": "El patrón clásico de carga diferida — la imagen empieza sin src real (solo data-src), y solo se carga de verdad cuando entra en pantalla." },
    { "fragmento": "observador.unobserve(img); // deja de vigilarla, ya no hace falta", "nota": "unobserve(img) evita seguir vigilando una imagen que ya cumplió su propósito, una vez cargada." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "root y rootMargin: respecto a qué se mide",
  "contenido": "root determina respecto a QUÉ elemento se mide la intersección — null (el valor por defecto) usa el viewport del navegador; se puede indicar un contenedor con scroll propio. rootMargin añade un margen alrededor de esa zona, para disparar el callback un poco antes (o después) de que el elemento entre realmente en la vista."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  let contador = 0;\n  const observador = new IntersectionObserver((entradas, obs) => {\n    entradas.forEach((entrada) => {\n      if (entrada.isIntersecting) {\n        contador++;\n        obs.unobserve(entrada.target);\n      }\n    });\n  });\n\n  observador.observe(elemento);\n  // El elemento entra y sale de la pantalla varias veces al hacer scroll\n  console.log(contador); // tras dejar de hacer scroll\n</script>",
  "opciones": [
    "1 — unobserve() detiene la vigilancia de ese elemento en cuanto se detecta la primera intersección, así que el callback no vuelve a dispararse para él",
    "Un número mayor que 1 — el callback se dispara cada vez que el elemento entra en pantalla, sin importar unobserve()",
    "0 — unobserve() cancela también el incremento que ya se había hecho"
  ],
  "correcta": 0,
  "explicacion": "En cuanto entrada.isIntersecting es true por primera vez, contador se incrementa a 1 y obs.unobserve(entrada.target) deja de vigilar ese elemento — aunque vuelva a entrar y salir de la pantalla varias veces después, el callback ya no se dispara más para él. contador se queda en 1."
}
```

## Lo que IntersectionObserver NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "IntersectionObserver funciona igual que escuchar el evento scroll, solo con otro nombre",
      "realidad": "Es asíncrono y mucho más eficiente — no necesita recalcular posiciones en cada píxel de scroll."
    },
    {
      "mito": "threshold: 0 significa que el callback nunca se dispara",
      "realidad": "Es el valor por defecto — se dispara en cuanto aparece el primer píxel visible."
    },
    {
      "mito": "El callback de un observer solo recibe información del último elemento que cambió",
      "realidad": "Recibe un array con TODAS las entradas que cambiaron, no solo una."
    },
    {
      "mito": "unobserve() detiene todos los elementos observados por ese observer, no solo uno",
      "realidad": "unobserve(elemento) detiene solo ESE elemento — disconnect() es el que detiene todos a la vez."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar el evento scroll para detectar visibilidad, en vez de IntersectionObserver.", "texto": "Mucho más costoso, al dispararse decenas de veces por segundo." },
    { "titulo": "Olvidar llamar a observe() después de crear el observador.", "texto": "Sin ella, el callback nunca llega a dispararse." },
    { "titulo": "No usar entrada.target para identificar cuál de los elementos observados cambió.", "texto": "El callback recibe entradas de todos los elementos vigilados a la vez." },
    { "titulo": "Confundir unobserve() (un elemento) con disconnect() (todos los elementos de ese observer).", "texto": "Cada uno tiene un alcance distinto." }
  ]
}
```

## Ejercicios

1. Crea un `IntersectionObserver` que añada una clase CSS cuando un elemento entra en pantalla.
2. Usa un array de valores en `threshold`, y observa cómo el callback se dispara varias veces al hacer scroll.
3. Implementa carga diferida de una imagen, usando `data-src` y `unobserve()` tras cargarla.
4. Explica la diferencia entre `unobserve()` y `disconnect()`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Intersection Observer API",
      "descripcion": "Referencia de MDN sobre la creación del observador, las propiedades de cada entrada (isIntersecting, target), las opciones (threshold, root, rootMargin), los métodos observe()/unobserve()/disconnect(), y el ejemplo de carga diferida de imágenes.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
      "etiqueta": "MDN"
    }
  ]
}
```
