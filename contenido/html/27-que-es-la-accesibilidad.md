# Qué es la accesibilidad y por qué te importa

- **Módulo:** Accesibilidad
- **Slug:** `que-es-la-accesibilidad-y-por-que-te-importa` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [What is accessibility? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility) — ver `contenido/html/TEMARIO.md` #27

---

## Qué es y para qué sirve

Accesibilidad es hacer que un sitio web se pueda usar el mayor número de personas posible, sea cual sea su forma de navegarlo — con la vista, con el oído, con el teclado en vez del ratón, con más o menos capacidad de procesar información compleja. No es una función extra que se añade si sobra tiempo: es un principio que atraviesa cada lección de este curso, desde la primera etiqueta hasta la última.

| Categoría | Ejemplos | Qué suele necesitar |
|---|---|---|
| Visual | Ceguera, baja visión, daltonismo | Lectores de pantalla, alto contraste, zoom |
| Auditiva | Sordera, hipoacusia | Subtítulos, transcripciones |
| Motora | Pérdida de movilidad, temblores, parálisis | Navegación completa por teclado |
| Cognitiva | Dislexia, TDAH, deterioro cognitivo | Lenguaje claro, diseño consistente, menos distracciones |
| Situacional | Entorno ruidoso, conexión lenta, un brazo ocupado | Las mismas soluciones anteriores, aunque sea de forma temporal |

## Cuándo lo tienes en cuenta de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando diseñas desde el principio, no al final",
  "contenido": "Pensar en accesibilidad desde el primer boceto cuesta poco; añadirla después sobre algo ya construido es mucho más caro y, casi siempre, más limitado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando crees que tu propia experiencia representa la de cualquiera",
  "contenido": "Es exactamente el momento de parar y aprender cómo navegan de verdad personas con discapacidad — no asumirlo desde tu propio uso del sitio. Tú no eres tus usuarios."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando piensas que solo afecta a una minoría permanente",
  "contenido": "Una conexión lenta, un brazo ocupado, un entorno ruidoso, la vista cansada con la edad — la mayoría de las personas se beneficia de accesibilidad en algún momento, aunque sea temporal."
}
```

## El efecto rampa: por qué beneficia a más gente de la que crees

```laboratorio
{
  "tipo": "roles",
  "titulo": "A quién más beneficia cada solución, más allá de para quien se pensó",
  "roles": [
    { "etiqueta": "Subtítulos", "rol": "Pensados para sordera", "descripcion": "También ayudan a quien mira un vídeo en un entorno ruidoso, sin sonido en el transporte público, o aprendiendo el idioma del vídeo." },
    { "etiqueta": "Navegación por teclado", "rol": "Pensada para movilidad reducida", "descripcion": "También la usa cualquiera que prefiera no soltar el teclado, o a quien se le ha estropeado el ratón en ese momento." },
    { "etiqueta": "HTML semántico", "rol": "Pensado para lectores de pantalla", "descripcion": "El mismo marcado ayuda al SEO, carga más rápido en una conexión lenta, y funciona mejor en un móvil de gama media." },
    { "etiqueta": "Lenguaje claro", "rol": "Pensado para discapacidad cognitiva", "descripcion": "También ayuda a quien no domina el idioma, a quien lee con prisa, o a cualquiera cansado al final del día." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "En muchos países ya no es solo una elección",
  "contenido": "La Unión Europea (EN 301 549), Estados Unidos (Section 508), Reino Unido, Alemania y Australia, entre otros, tienen normativa legal que exige accesibilidad en servicios digitales — el incumplimiento puede tener consecuencias legales reales, no solo reputacionales."
}
```

## Lo que la accesibilidad NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La accesibilidad es un añadido caro que se agrega al final",
      "realidad": "Eso solo es cierto si se intenta parchear un sitio ya construido sin haberla pensado antes. Incluida desde el diseño, el coste añadido suele ser mínimo."
    },
    {
      "mito": "El 100% de accesibilidad es un objetivo alcanzable",
      "realidad": "Es un ideal inalcanzable del todo — siempre aparece algún caso límite. El objetivo real es hacer todo lo razonablemente posible, no perseguir una perfección que no existe."
    },
    {
      "mito": "Si el sitio funciona bien para mí, funciona bien para todos",
      "realidad": "\"Tú no eres tus usuarios\" — hace falta aprender cómo navegan personas con discapacidad de verdad, no asumir que tu propia experiencia representa la de cualquiera."
    },
    {
      "mito": "Solo beneficia a personas con una discapacidad permanente",
      "realidad": "Beneficia igual a quien tiene el brazo roto temporalmente, a quien usa el móvil con una sola mano, o a quien está en un entorno ruidoso o con mala conexión — situaciones temporales o del entorno, no solo permanentes."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Dejar la accesibilidad para el final del proyecto.", "texto": "Retroaplicarla sobre algo ya construido cuesta mucho más que pensarla desde el principio del diseño." },
    { "titulo": "Confiar solo en herramientas automáticas como axe o Lighthouse.", "texto": "Detectan problemas técnicos (un alt ausente, un contraste insuficiente), pero no si el contenido tiene sentido de verdad navegado con un lector de pantalla." },
    { "titulo": "No probar nunca con personas que usan tecnología de asistencia de verdad.", "texto": "La única forma real de saber si algo funciona es que lo use quien de verdad depende de esa tecnología, no solo simularlo tú mismo." },
    { "titulo": "Tratar la accesibilidad como una casilla legal que marcar una vez.", "texto": "Es una práctica continua, no un trámite que se cierra — el contenido y el código siguen cambiando después del lanzamiento." }
  ]
}
```

## Ejercicios

1. Piensa en una web que uses a menudo — ¿podrías navegarla entera solo con teclado, sin ratón? Pruébalo.
2. Busca un vídeo sin subtítulos que hayas visto recientemente — ¿lo habrías entendido igual sin sonido?
3. Elige una de las categorías de discapacidad de esta lección y busca qué tecnología de asistencia usa la gente para navegar la web con esa condición.
4. Explica con tus palabras por qué "tú no eres tus usuarios" es un principio real, no solo una frase bonita.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "What is accessibility?",
      "descripcion": "Guía de referencia de MDN sobre las categorías de discapacidad, el marco legal por país, y los mitos más comunes sobre accesibilidad web.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility",
      "etiqueta": "MDN"
    }
  ]
}
```
