# Proyecto: página de aterrizaje de un solo scroll, 100% semántica

- **Módulo:** Proyectos
- **Slug:** `proyecto-pagina-de-aterrizaje-de-un-solo-scroll-100-semantica` (autogenerado del título)
- **Orden:** 205
- **Requiere:** Módulo 1 (fundamentos), lección 5 (estructura de una página) y lección 10 (crear enlaces)

---

## Qué vas a construir

Una página de "un solo scroll" — el formato que usan casi todas las landing pages de producto: una cabecera con menú, varias secciones que se recorren bajando, y un pie. El menú no navega a otras páginas, salta a secciones dentro de la misma página con enlaces `#ancla`. El reto real no es el diseño (el CSS ya está puesto): es que cada región use la etiqueta semántica que le corresponde, para que tanto un lector de pantalla como un buscador entiendan la página igual de bien que alguien mirándola.

```laboratorio
{
  "tipo": "esquema-de-pagina",
  "header": "Logo + menú (Inicio · Servicios · Opiniones · Contacto)",
  "nav": "Los 4 enlaces de ancla del menú",
  "main": "Las 3 secciones: hero, servicios, opiniones",
  "footer": "Copyright + enlace de contacto"
}
```

## Antes de empezar

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un solo main, un h1 por página",
  "contenido": "Por mucho que la página tenga varias secciones visuales, sigue siendo UNA página: un único main que las contiene todas, y un único h1 — el de la sección de bienvenida (el \"hero\")."
}
```

## Paso 1: la cabecera y el menú de anclas

El menú no lleva `href` a otras páginas — cada enlace apunta con `#` a un `id` que vas a poner en la sección correspondiente en el paso siguiente.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: header y nav",
  "consigna": "Escribe un header con un div.logo y un nav dentro. El nav lleva un ul con 3 li, cada uno con un enlace a #servicios, #opiniones y #contacto (todavía no existen esas secciones, es normal que no salten a ningún sitio por ahora).",
  "html": "<!-- <header>\n  <div class=\"logo\">Acme</div>\n  <nav>...</nav>\n</header> -->",
  "css": "body { font-family: system-ui, sans-serif; margin: 0; color: #2c2a26; }\nheader {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.5rem;\n  border-bottom: 1px solid #e2ded6;\n}\n.logo { font-weight: 700; }\nheader nav ul {\n  display: flex;\n  gap: 1.25rem;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\nheader nav a { color: inherit; text-decoration: none; font-size: 0.9rem; }",
  "pestañaInicial": "html"
}
```

## Paso 2: el main y la sección de bienvenida (hero)

Dentro del `main`, la primera sección es la de bienvenida: el único `h1` de toda la página, y un párrafo de apoyo.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: main y hero",
  "consigna": "Escribe un main, y dentro una section.hero con un h1 (el titular de la página) y un p (el subtítulo).",
  "html": "<!-- <main>\n  <section class=\"hero\">...</section>\n</main> -->",
  "css": "body { font-family: system-ui, sans-serif; margin: 0; color: #2c2a26; }\n.hero {\n  padding: 4rem 1.5rem;\n  text-align: center;\n  background: #f4f1ea;\n}\n.hero h1 { margin: 0 0 0.5rem; font-size: 2rem; }\n.hero p { margin: 0; color: #6f6a61; }",
  "pestañaInicial": "html"
}
```

## Paso 3: la sección de servicios

Dos o tres servicios, cada uno con su propio subtítulo. Como es una parte de ESTA página (no algo que se sostenga solo fuera de ella), es `section`, no `article`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: servicios",
  "consigna": "Escribe una section con id=\"servicios\" (el destino del enlace del menú), un h2 de título de sección, y 2 o 3 bloques de servicio cada uno con su propio h3.",
  "html": "<!-- <section id=\"servicios\" class=\"servicios\">...</section> -->",
  "css": "body { font-family: system-ui, sans-serif; margin: 0; color: #2c2a26; }\n.servicios { padding: 3rem 1.5rem; max-width: 720px; margin: 0 auto; }\n.servicios h2 { text-align: center; }\n.servicios h3 { margin-bottom: 0.25rem; }",
  "pestañaInicial": "html"
}
```

## Paso 4: opiniones (aquí sí, article)

Cada opinión de cliente SÍ tendría sentido fuera de esta página — en un feed de reseñas, en otra web que la cite. Por eso, a diferencia de "servicios", esto es `article`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 4: opiniones",
  "consigna": "Escribe una section con id=\"opiniones\" y un h2, y dentro 2 article — cada uno con una cita (blockquote) y el nombre de quien la firma (podría ir en un footer del propio article, como cabecera/pie de SU sección, no de la página).",
  "html": "<!-- <section id=\"opiniones\">\n  <h2>Lo que dicen de nosotros</h2>\n  <article>...</article>\n  <article>...</article>\n</section> -->",
  "css": "body { font-family: system-ui, sans-serif; margin: 0; color: #2c2a26; }\nsection { padding: 3rem 1.5rem; max-width: 720px; margin: 0 auto; }\nh2 { text-align: center; }\narticle { background: #f4f1ea; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }\narticle footer { margin-top: 0.5rem; font-size: 0.85rem; color: #6f6a61; }",
  "pestañaInicial": "html"
}
```

## Página completa

Une los cuatro pasos: header con nav, main con las tres secciones, y un footer global con copyright y un enlace de contacto (`id="contacto"`, el cuarto destino del menú).

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Junta header, main (hero + servicios + opiniones) y footer en un único documento. Comprueba que los tres enlaces del menú saltan de verdad a su sección al hacer clic en la vista previa.",
  "html": "<!-- Tu página completa, de principio a fin -->",
  "css": "body { font-family: system-ui, sans-serif; margin: 0; color: #2c2a26; scroll-behavior: smooth; }\nheader {\n  display: flex; justify-content: space-between; align-items: center;\n  padding: 1rem 1.5rem; border-bottom: 1px solid #e2ded6; position: sticky; top: 0; background: #fff;\n}\n.logo { font-weight: 700; }\nheader nav ul { display: flex; gap: 1.25rem; list-style: none; margin: 0; padding: 0; }\nheader nav a { color: inherit; text-decoration: none; font-size: 0.9rem; }\n.hero { padding: 4rem 1.5rem; text-align: center; background: #f4f1ea; }\n.hero h1 { margin: 0 0 0.5rem; font-size: 2rem; }\nsection { padding: 3rem 1.5rem; max-width: 720px; margin: 0 auto; }\nh2 { text-align: center; }\narticle { background: #f4f1ea; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }\nfooter { text-align: center; padding: 1.5rem; color: #6f6a61; font-size: 0.85rem; }",
  "pestañaInicial": "html"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "¿Un único h1?", "texto": "Solo la sección hero lleva h1 — servicios y opiniones abren con h2, cada bloque de servicio con h3." },
    { "titulo": "¿Un único main?", "texto": "Hero, servicios y opiniones viven las tres DENTRO del mismo main, no cada una suelta directamente en body." },
    { "titulo": "¿article solo donde tiene sentido?", "texto": "Las opiniones sí (se sostienen solas fuera de esta página); los bloques de servicio, no (section, dependen del contexto de esta página)." },
    { "titulo": "¿Los enlaces del menú saltan de verdad?", "texto": "Cada href=\"#algo\" del nav tiene que coincidir EXACTAMENTE con un id que exista en la página — un typo ahí no da ningún error, simplemente no salta a ningún sitio." }
  ]
}
```

## Retos para ampliarlo

1. Añade una cuarta sección, "Preguntas frecuentes", usando `details`/`summary` en vez de párrafos — repasa la lección correspondiente si hace falta.
2. Añade un enlace "Volver arriba" al final del footer que salte de vuelta al inicio de la página.
3. Marca visualmente en el menú qué sección estás mirando ahora mismo (pista: no hace falta JavaScript para plantear la pregunta de diseño, aunque resolverla con precisión sí lo necesite — de momento, describe con tus palabras qué información necesitarías).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "Structuring documents",
      "descripcion": "Repaso de header/nav/main/footer/article/section si dudas qué etiqueta usar en cada paso.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Creating links",
      "descripcion": "Repaso de enlaces de ancla (fragmentos con #) si el menú no salta a la sección correcta.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links",
      "etiqueta": "MDN"
    }
  ]
}
```
