# Posicionamiento: static, relative, absolute, fixed y sticky

- **Módulo:** Layout
- **Slug:** `posicionamiento-static-relative-absolute-fixed-y-sticky` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [Positioning (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning) — ver `contenido/css/TEMARIO.md` #31

---

## Qué es y para qué sirve

`position` decide si un elemento sigue el flujo normal, se desplaza desde ahí sin perder su sitio, o sale del flujo por completo para colocarse en un punto exacto. Los cinco valores — `static`, `relative`, `absolute`, `fixed` y `sticky` — responden preguntas distintas: ¿reserva espacio? ¿respecto a qué se mide `top`/`left`? ¿se mueve al hacer scroll?

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita sacar un elemento del flujo normal",
  "roles": [
    { "etiqueta": "Quien construye un menú desplegable", "rol": "Colocar un panel sin que empuje al resto del contenido", "descripcion": "position: absolute saca el panel del flujo — no reserva espacio, así que no desplaza nada a su alrededor cuando aparece." },
    { "etiqueta": "Quien fija una barra de navegación", "rol": "Que se quede en pantalla al hacer scroll", "descripcion": "position: fixed la ancla al viewport, no a la página — sigue en el mismo sitio visual pase lo que pase con el scroll." },
    { "etiqueta": "Quien encabeza secciones largas", "rol": "Que un título se quede visible mientras dura su sección", "descripcion": "position: sticky se comporta como normal hasta un punto de scroll concreto, y desde ahí se fija — sin necesitar JavaScript." }
  ]
}
```

## static y relative: dentro del flujo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"border: 1px dashed #9ca3af; font-family: sans-serif; padding: 20px;\">\n  <div style=\"width: 80px; height: 80px; background: #7c3aed; position: static; top: 30px; left: 30px;\"></div>\n</div>",
  "despues": "<div style=\"border: 1px dashed #9ca3af; font-family: sans-serif; padding: 20px;\">\n  <div style=\"width: 80px; height: 80px; background: #7c3aed; position: relative; top: 30px; left: 30px;\"></div>\n</div>",
  "nota": "Mismos top: 30px y left: 30px en los dos casos. Antes (position: static, el valor por defecto): esos valores se IGNORAN por completo — la caja se queda en su posición normal, pegada a la esquina del contenedor. Después (position: relative): la caja SÍ se desplaza 30px hacia abajo y 30px hacia la derecha, tomando esos valores como referencia desde su propia posición normal."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "top: 30px empuja hacia ABAJO, no hacia arriba",
  "contenido": "En relative y absolute, top define la distancia desde el borde SUPERIOR de referencia — un valor positivo aleja al elemento de ese borde, empujándolo hacia abajo. Es fácil asumir lo contrario la primera vez."
}
```

## El espacio que relative reserva y absolute no

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"font-family: sans-serif; border: 1px dashed #9ca3af; padding: 8px; position: relative;\">\n  <div style=\"width: 60px; height: 60px; background: #7c3aed; position: relative; top: 20px; left: 20px;\"></div>\n  <div style=\"width: 60px; height: 60px; background: #16a34a;\"></div>\n</div>",
  "despues": "<div style=\"font-family: sans-serif; border: 1px dashed #9ca3af; padding: 8px; position: relative;\">\n  <div style=\"width: 60px; height: 60px; background: #7c3aed; position: absolute; top: 20px; left: 20px;\"></div>\n  <div style=\"width: 60px; height: 60px; background: #16a34a;\"></div>\n</div>",
  "nota": "La caja morada se desplaza 20px hacia abajo y a la derecha en los dos casos. Antes (relative): sigue reservando su espacio ORIGINAL en el flujo — la caja verde se coloca debajo de ese hueco, como si la morada nunca se hubiera movido. Después (absolute): la morada sale del flujo por completo, sin reservar ningún espacio — la verde sube a ocupar el lugar donde habría estado la morada si no estuviera posicionada."
}
```

## absolute: ¿respecto a qué se mide?

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    position: absolute;\n    top: 0;\n    left: 0;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "position: absolute;\n    top: 0;\n    left: 0;", "nota": "Se posiciona respecto al ANCESTRO POSICIONADO más cercano — cualquier ancestro con position distinto de static. Si NINGÚN ancestro está posicionado, cae al bloque contenedor inicial: aproximadamente, la página completa." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"border: 2px dashed #9ca3af; font-family: sans-serif; padding: 40px; margin: 20px;\">\n  <div style=\"width: 50px; height: 50px; background: #7c3aed; position: absolute; top: 0; left: 0;\"></div>\n  <p>Contenido de la caja</p>\n</div>",
  "despues": "<div style=\"border: 2px dashed #9ca3af; font-family: sans-serif; padding: 40px; margin: 20px; position: relative;\">\n  <div style=\"width: 50px; height: 50px; background: #7c3aed; position: absolute; top: 0; left: 0;\"></div>\n  <p>Contenido de la caja</p>\n</div>",
  "nota": "Misma caja morada, mismo top: 0; left: 0; en los dos casos. Antes: el contenedor punteado NO tiene position declarado — la caja morada se posiciona respecto a la página entera, apareciendo en la esquina superior izquierda del TODO, fuera del área punteada. Después: el contenedor pasa a position: relative — ahora ES el ancestro posicionado más cercano, y la caja morada se posiciona respecto A ÉL, quedando dentro de su esquina superior izquierda."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    position: absolute;\n    top: 20px;\n    right: 20px;\n  }\n</style>\n<div>\n  <p>Contenido normal</p>\n  <div class=\"caja\">Posicionada</div>\n</div>",
  "opciones": [
    "La caja se posiciona respecto a su div padre inmediato, tenga o no position declarado",
    "La caja se posiciona respecto al bloque contenedor inicial (aproximadamente, la página completa), porque ningún ancestro tiene position distinto de static",
    "La caja no se mueve en absoluto, porque le falta un ancestro con position: relative para funcionar"
  ],
  "correcta": 1,
  "explicacion": "absolute busca el ancestro posicionado más cercano — ninguno de los ancestros de .caja tiene position distinto de static, así que cae al bloque contenedor inicial, aproximadamente la página completa, no al div padre inmediato."
}
```

## fixed: siempre respecto al viewport, ignore lo que ignore

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"border: 2px dashed #9ca3af; font-family: sans-serif; padding: 8px; margin: 40px; position: relative; height: 120px;\">\n  <div style=\"width: 50px; height: 50px; background: #7c3aed; position: absolute; top: 0; left: 0;\"></div>\n</div>",
  "despues": "<div style=\"border: 2px dashed #9ca3af; font-family: sans-serif; padding: 8px; margin: 40px; position: relative; height: 120px;\">\n  <div style=\"width: 50px; height: 50px; background: #7c3aed; position: fixed; top: 0; left: 0;\"></div>\n</div>",
  "nota": "El mismo contenedor relative, con 40px de margen, en los dos casos — y el mismo top: 0; left: 0; en la caja morada. Antes (absolute): la caja respeta al contenedor relative como su ancestro posicionado, quedando DENTRO de su esquina. Después (fixed): la caja IGNORA por completo al ancestro posicionado — se coloca en la esquina superior izquierda real del viewport, fuera del área del contenedor punteado."
}
```

## sticky: relative hasta un punto, luego fixed

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  dt {\n    position: sticky;\n    top: 0;\n    background: black;\n    color: white;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "position: sticky;\n    top: 0;", "nota": "Se comporta como relative — dentro del flujo normal, reservando su espacio — hasta que el scroll lo acerca a 0px del borde superior de su contenedor con scroll. A partir de ahí, se queda fijo ahí, como si fuera fixed, sin abandonar nunca el área de su contenedor." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El z-index decide qué capa queda arriba (más en la próxima lección)",
  "contenido": "Cuando varios elementos posicionados se superponen, z-index decide cuál se dibuja por encima de cuál — un número mayor queda arriba de uno menor. La siguiente lección entra en el detalle de cómo funcionan los contextos de apilamiento que hacen que z-index a veces no se comporte como se espera."
}
```

## Lo que el posicionamiento NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "position: relative saca a un elemento del flujo normal, igual que absolute",
      "realidad": "relative se queda EN el flujo — su espacio original sigue reservado, solo se desplaza visualmente desde ahí. absolute sí sale del flujo por completo."
    },
    {
      "mito": "top: 30px siempre mueve un elemento hacia arriba",
      "realidad": "Define la distancia desde el borde SUPERIOR — un valor positivo empuja el elemento hacia ABAJO, alejándolo de ese borde."
    },
    {
      "mito": "Un elemento absolute siempre se posiciona respecto a la ventana del navegador",
      "realidad": "Se posiciona respecto al ancestro posicionado más cercano — solo cae al bloque contenedor inicial (aprox. la página) si NINGÚN ancestro está posicionado."
    },
    {
      "mito": "fixed y sticky hacen lo mismo, solo cambia el nombre",
      "realidad": "fixed ignora completamente el scroll y la posición de sus ancestros; sticky se comporta como relative hasta cruzar un umbral, y solo entonces actúa como fixed dentro de su propio contenedor."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar position: absolute sin darle position: relative a ningún ancestro.", "texto": "El elemento se posiciona respecto a toda la página, no al contenedor visualmente más cercano — casi nunca es lo que se busca." },
    { "titulo": "Confundir el efecto de top/left en relative con el de absolute.", "texto": "En relative es un desplazamiento desde la posición normal; en absolute es la distancia desde el borde del contenedor posicionado." },
    { "titulo": "Esperar que fixed respete la posición de un ancestro positioned.", "texto": "Siempre se posiciona respecto al viewport, sin importar qué ancestros estén posicionados." },
    { "titulo": "Usar position: sticky sin declarar también un umbral como top o left.", "texto": "Sin ese umbral, sticky no tiene ningún efecto visible — se comporta como relative sin más." }
  ]
}
```

## Ejercicios

1. Explica qué le pasa a los elementos hermanos de una caja cuando esta pasa de `position: static` a `position: absolute`.
2. Escribe una regla que convierta un `div` en el "contenedor de posicionamiento" de sus hijos absolutos, sin cambiar su lugar en el flujo normal.
3. Explica por qué `top: 20px` en un elemento `relative` lo mueve hacia abajo, no hacia arriba.
4. Escribe una regla con `position: sticky` que fije un encabezado en la parte superior de su contenedor al hacer scroll.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Positioning",
      "descripcion": "Guía de MDN sobre los cinco valores de position: static, relative, absolute, fixed y sticky, con ejemplos comparados de cada uno.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning",
      "etiqueta": "MDN"
    }
  ]
}
```
