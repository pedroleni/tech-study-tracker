# Proyecto: tarjeta con micro-interacciones

- **Módulo:** Proyectos
- **Slug:** `proyecto-tarjeta-con-microinteracciones` (autogenerado del título)
- **Orden:** 315
- **Requiere:** Lecciones 44-46 (transformaciones, transiciones y animaciones con keyframes)

---

## Qué vas a construir

Una tarjeta de producto con los tres detalles de pulido que distinguen una interfaz cuidada de una plana: se eleva al pasar el ratón, un botón con un pequeño rebote al pulsarlo, y una insignia "Nuevo" con un pulso continuo pero discreto.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Con moderación",
  "contenido": "Las tres animaciones de este proyecto son deliberadamente sutiles. Una micro-interacción que se nota demasiado dificulta usar la interfaz en vez de ayudar — el objetivo es que se sienta bien, no que llame la atención sobre sí misma."
}
```

## Paso 1: elevar la tarjeta al pasar el ratón

Combina `transform: translateY()` con una sombra más pronunciada, y una `transition` que suavice el cambio.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: elevación en hover",
  "consigna": "Añade a .tarjeta una transition de transform y box-shadow. En .tarjeta:hover, sube el elemento unos px con translateY negativo y aumenta el box-shadow.",
  "html": "<div class=\"tarjeta\">\n  <h3>Auriculares inalámbricos</h3>\n  <p>49,99€</p>\n  <button class=\"boton\">Añadir al carrito</button>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.tarjeta {\n  border: 1px solid #e2ded6;\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 260px;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);\n  /* transition: transform 200ms, box-shadow 200ms; */\n}\n/* .tarjeta:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgb(0 0 0 / 0.15); } */\n.boton {\n  background: #7c3aed;\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 1",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo. Pasa el ratón por encima de la tarjeta en la vista previa para verlo.",
  "html": "<div class=\"tarjeta\">\n  <h3>Auriculares inalámbricos</h3>\n  <p>49,99€</p>\n  <button class=\"boton\">Añadir al carrito</button>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.tarjeta {\n  border: 1px solid #e2ded6;\n  border-radius: 12px;\n  padding: 1.5rem;\n  max-width: 260px;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);\n  transition: transform 200ms, box-shadow 200ms;\n}\n.tarjeta:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 24px rgb(0 0 0 / 0.15);\n}\n.boton {\n  background: #7c3aed;\n  color: white;\n  border: none;\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n}",
  "pestañaInicial": "css"
}
```

## Paso 2: el botón con rebote al pulsarlo

Un `scale` breve en `:active` — el botón se encoge un instante al pulsarlo, dando la sensación física de haber sido presionado.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: rebote del botón",
  "consigna": "Añade transition: transform 100ms al botón, y en .boton:active escala a 0.95. Haz clic y mantenlo pulsado en la vista previa para verlo.",
  "html": "<button class=\"boton\">Añadir al carrito</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.boton {\n  background: #7c3aed;\n  color: white;\n  border: none;\n  padding: 0.6rem 1.2rem;\n  border-radius: 8px;\n  font-size: 1rem;\n  cursor: pointer;\n  /* transition: transform 100ms; */\n}\n/* .boton:active { transform: scale(0.95); } */",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 2",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo. Haz clic y mantenlo pulsado en la vista previa para verlo.",
  "html": "<button class=\"boton\">Añadir al carrito</button>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.boton {\n  background: #7c3aed;\n  color: white;\n  border: none;\n  padding: 0.6rem 1.2rem;\n  border-radius: 8px;\n  font-size: 1rem;\n  cursor: pointer;\n  transition: transform 100ms;\n}\n.boton:active {\n  transform: scale(0.95);\n}",
  "pestañaInicial": "css"
}
```

## Paso 3: la insignia con pulso

Un `@keyframes` que anime `box-shadow` (o `transform: scale`) en bucle, sutil, y que respete `prefers-reduced-motion`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: insignia con pulso",
  "consigna": "Escribe un @keyframes pulso que anime box-shadow de un anillo pequeño a uno más grande y transparente. Aplícalo a .insignia en bucle infinito, y añade @media (prefers-reduced-motion: reduce) que lo desactive.",
  "html": "<div class=\"tarjeta\">\n  <span class=\"insignia\">Nuevo</span>\n  <h3>Auriculares inalámbricos</h3>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.tarjeta {\n  position: relative;\n  border: 1px solid #e2ded6;\n  border-radius: 12px;\n  padding: 1.5rem 1.5rem 1.5rem 2.5rem;\n  max-width: 260px;\n}\n.insignia {\n  position: absolute;\n  top: -6px;\n  left: -6px;\n  background: #ef4444;\n  color: white;\n  font-size: 0.7rem;\n  padding: 2px 8px;\n  border-radius: 999px;\n  /* animation: pulso 2s infinite; */\n}\n/* @keyframes pulso {\n  0% { box-shadow: 0 0 0 0 rgb(239 68 68 / 0.5); }\n  100% { box-shadow: 0 0 0 8px rgb(239 68 68 / 0); }\n} */\n/* @media (prefers-reduced-motion: reduce) { .insignia { animation: none; } } */",
  "pestañaInicial": "css"
}
```

Si te atascas, aquí tienes este paso ya resuelto:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución del paso 3",
  "consigna": "Así queda este paso resuelto, para comparar con el tuyo. La insignia \"Nuevo\" pulsa sola en la vista previa.",
  "html": "<div class=\"tarjeta\">\n  <span class=\"insignia\">Nuevo</span>\n  <h3>Auriculares inalámbricos</h3>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.tarjeta {\n  position: relative;\n  border: 1px solid #e2ded6;\n  border-radius: 12px;\n  padding: 1.5rem 1.5rem 1.5rem 2.5rem;\n  max-width: 260px;\n}\n.insignia {\n  position: absolute;\n  top: -6px;\n  left: -6px;\n  background: #ef4444;\n  color: white;\n  font-size: 0.7rem;\n  padding: 2px 8px;\n  border-radius: 999px;\n  animation: pulso 2s infinite;\n}\n@keyframes pulso {\n  0% {\n    box-shadow: 0 0 0 0 rgb(239 68 68 / 0.5);\n  }\n  100% {\n    box-shadow: 0 0 0 8px rgb(239 68 68 / 0);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .insignia {\n    animation: none;\n  }\n}",
  "pestañaInicial": "css"
}
```

## Solución

Si te has atascado, o quieres comparar tu resultado con uno completo y en marcha, aquí tienes la tarjeta entera, ya resuelta — con los tres detalles de pulido juntos en un mismo sitio: elevación al pasar el ratón, rebote del botón al pulsarlo, e insignia con pulso continuo:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Solución completa",
  "consigna": "La tarjeta terminada con las tres micro-interacciones a la vez. Pasa el ratón por encima, pulsa el botón, y observa la insignia \"Nuevo\".",
  "html": "<div class=\"tarjeta\">\n  <span class=\"insignia\">Nuevo</span>\n  <h3>Auriculares inalámbricos</h3>\n  <p>49,99€</p>\n  <button class=\"boton\">Añadir al carrito</button>\n</div>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 2rem;\n}\n.tarjeta {\n  position: relative;\n  border: 1px solid #e2ded6;\n  border-radius: 12px;\n  padding: 1.5rem 1.5rem 1.5rem 2.5rem;\n  max-width: 260px;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);\n  transition: transform 200ms, box-shadow 200ms;\n}\n.tarjeta:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 24px rgb(0 0 0 / 0.15);\n}\n.insignia {\n  position: absolute;\n  top: -6px;\n  left: -6px;\n  background: #ef4444;\n  color: white;\n  font-size: 0.7rem;\n  padding: 2px 8px;\n  border-radius: 999px;\n  animation: pulso 2s infinite;\n}\n@keyframes pulso {\n  0% {\n    box-shadow: 0 0 0 0 rgb(239 68 68 / 0.5);\n  }\n  100% {\n    box-shadow: 0 0 0 8px rgb(239 68 68 / 0);\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .insignia {\n    animation: none;\n  }\n}\n.boton {\n  background: #7c3aed;\n  color: white;\n  border: none;\n  padding: 0.6rem 1.2rem;\n  border-radius: 8px;\n  font-size: 1rem;\n  cursor: pointer;\n  transition: transform 100ms;\n}\n.boton:active {\n  transform: scale(0.95);\n}",
  "pestañaInicial": "css"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Solo transform y box-shadow se animan.", "texto": "Ninguna de las tres micro-interacciones toca top, left ni width — eso evita que el navegador recalcule el layout en cada fotograma." },
    { "titulo": "El pulso respeta prefers-reduced-motion.", "texto": "Quien activó esa preferencia del sistema ve la insignia quieta, sin el bucle infinito." }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Animas transform/box-shadow, no propiedades pesadas?",
      "texto": "top/left/width fuerzan al navegador a recalcular el layout en cada fotograma — transform y opacity no."
    },
    {
      "titulo": "¿Cada animación tiene su transition o duration razonable?",
      "texto": "Sin ella, los cambios saltan de golpe en vez de sentirse suaves."
    },
    {
      "titulo": "¿El pulso respeta prefers-reduced-motion?",
      "texto": "Una animación en bucle infinito es exactamente el tipo de movimiento que puede resultar molesto o mareante para quien activó esa preferencia."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade una transición al propio color de fondo del botón en `:hover`, combinada con el rebote de `:active`.
2. Haz que la elevación de la tarjeta (paso 1) también gire ligeramente con `rotate()`, un grado o dos, para un efecto más orgánico.
3. Sustituye el pulso de `box-shadow` por uno de `scale` en un pseudo-elemento `::after` detrás de la insignia.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "Transitions",
      "descripcion": "Repaso de transition-property, duration y easing si te atascas en los pasos 1 y 2.",
      "url": "https://web.dev/learn/css/transitions",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Animations",
      "descripcion": "Repaso de @keyframes y animation-iteration-count si te atascas en el paso 3.",
      "url": "https://web.dev/learn/css/animations",
      "etiqueta": "web.dev"
    }
  ]
}
```
