# Proyecto: lista de tareas interactiva

- **Módulo:** Proyectos
- **Slug:** `proyecto-lista-de-tareas-interactiva` (autogenerado del título)
- **Orden:** 400
- **Requiere:** Módulos de eventos y manipulación del DOM (lecciones 40-45)

---

## Qué vas a construir

Una lista de tareas real: añadir una tarea escribiendo y pulsando Enter (o un botón), marcarla como completada con un clic, y borrarla. Sin ningún framework — solo DOM, eventos y un array en memoria que lleva la cuenta del estado.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sin persistencia, a propósito",
  "contenido": "Este proyecto no guarda las tareas al recargar la página — eso necesitaría localStorage, y este editor vive en un iframe aislado donde esa API está deshabilitada por seguridad. Cuando llegues a la lección de localStorage, vuelve aquí como reto de ampliación y pruébalo en un archivo .html normal."
}
```

## Paso 1: añadir una tarea

Un formulario con un input y un botón. Al enviarlo, crea un `<li>` nuevo con `createElement()` y añádelo a la lista — sin usar `innerHTML`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: añadir tareas",
  "consigna": "Escribe el manejador de submit: evita el envío real con preventDefault(), lee el valor del input, y si no está vacío, crea un li con ese texto y añádelo a #lista. Vacía el input después.",
  "html": "<form id=\"formulario\">\n  <input id=\"entrada\" placeholder=\"Nueva tarea\" autocomplete=\"off\">\n  <button type=\"submit\">Añadir</button>\n</form>\n<ul id=\"lista\"></ul>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n}\n#formulario {\n  display: flex;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n}\n#lista {\n  list-style: none;\n  padding: 0;\n  max-width: 320px;\n}\n#lista li {\n  padding: 0.5rem;\n  border-bottom: 1px solid #e2ded6;\n}",
  "js": "const formulario = document.getElementById('formulario');\nconst entrada = document.getElementById('entrada');\nconst lista = document.getElementById('lista');\n\nformulario.addEventListener('submit', (evento) => {\n  // evento.preventDefault();\n  // lee entrada.value, valida que no esté vacío, crea el li, añádelo, limpia el input\n});",
  "pestañaInicial": "js"
}
```

## Paso 2: marcar como completada

Al hacer clic en una tarea, alterna una clase `.completada` sobre ella (tachado con CSS). Usa delegación de eventos en `#lista`, no un listener por cada `<li>`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: marcar completada",
  "consigna": "Añade un único listener de click en #lista (delegación). Si el elemento pulsado es un LI, alterna la clase completada sobre él con classList.toggle().",
  "html": "<ul id=\"lista\">\n  <li>Comprar leche</li>\n  <li>Repasar closures</li>\n  <li>Sacar al perro</li>\n</ul>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n}\n#lista {\n  list-style: none;\n  padding: 0;\n  max-width: 320px;\n}\n#lista li {\n  padding: 0.5rem;\n  border-bottom: 1px solid #e2ded6;\n  cursor: pointer;\n}\n#lista li.completada {\n  text-decoration: line-through;\n  color: #999;\n}",
  "js": "const lista = document.getElementById('lista');\n\n// lista.addEventListener('click', (evento) => {\n//   if (evento.target.tagName === 'LI') { ... }\n// });",
  "pestañaInicial": "js"
}
```

## Paso 3: borrar una tarea

Añade un botón "×" dentro de cada `<li>` que la elimine con `remove()`, sin que el clic en el botón también la marque como completada (usa `stopPropagation()` o comprueba el elemento exacto pulsado).

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 3: borrar tareas",
  "consigna": "Al pulsar el botón .borrar dentro de un li, elimina ese li con remove(), sin que también se marque como completada. Usa evento.target y comprueba su clase, o stopPropagation().",
  "html": "<ul id=\"lista\">\n  <li>Comprar leche <button class=\"borrar\">×</button></li>\n  <li>Repasar closures <button class=\"borrar\">×</button></li>\n</ul>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n}\n#lista {\n  list-style: none;\n  padding: 0;\n  max-width: 320px;\n}\n#lista li {\n  display: flex;\n  justify-content: space-between;\n  padding: 0.5rem;\n  border-bottom: 1px solid #e2ded6;\n  cursor: pointer;\n}\n#lista li.completada {\n  text-decoration: line-through;\n  color: #999;\n}\n.borrar {\n  border: none;\n  background: none;\n  cursor: pointer;\n  font-size: 1rem;\n}",
  "js": "const lista = document.getElementById('lista');\n\nlista.addEventListener('click', (evento) => {\n  if (evento.target.classList.contains('borrar')) {\n    // borra el li que contiene este botón\n    return;\n  }\n  if (evento.target.tagName === 'LI') {\n    evento.target.classList.toggle('completada');\n  }\n});",
  "pestañaInicial": "js"
}
```

## Proyecto completo

Une los tres pasos: añadir con el formulario, marcar completada y borrar, todo con delegación de eventos sobre `#lista`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Junta el formulario de añadir, el toggle de completada y el botón de borrar en una única lista de tareas funcional.",
  "html": "<form id=\"formulario\">\n  <input id=\"entrada\" placeholder=\"Nueva tarea\" autocomplete=\"off\">\n  <button type=\"submit\">Añadir</button>\n</form>\n<ul id=\"lista\"></ul>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n}\n#formulario {\n  display: flex;\n  gap: 0.5rem;\n  margin-bottom: 1rem;\n}\n#lista {\n  list-style: none;\n  padding: 0;\n  max-width: 320px;\n}\n#lista li {\n  display: flex;\n  justify-content: space-between;\n  padding: 0.5rem;\n  border-bottom: 1px solid #e2ded6;\n  cursor: pointer;\n}\n#lista li.completada {\n  text-decoration: line-through;\n  color: #999;\n}\n.borrar {\n  border: none;\n  background: none;\n  cursor: pointer;\n  font-size: 1rem;\n}",
  "js": "const formulario = document.getElementById('formulario');\nconst entrada = document.getElementById('entrada');\nconst lista = document.getElementById('lista');\n\nformulario.addEventListener('submit', (evento) => {\n  evento.preventDefault();\n  const texto = entrada.value.trim();\n  if (!texto) return;\n\n  const li = document.createElement('li');\n  li.textContent = texto;\n\n  const boton = document.createElement('button');\n  boton.className = 'borrar';\n  boton.textContent = '×';\n  li.appendChild(boton);\n\n  lista.appendChild(li);\n  entrada.value = '';\n});\n\nlista.addEventListener('click', (evento) => {\n  if (evento.target.classList.contains('borrar')) {\n    evento.target.closest('li').remove();\n    return;\n  }\n  if (evento.target.tagName === 'LI') {\n    evento.target.classList.toggle('completada');\n  }\n});",
  "pestañaInicial": "js"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Usaste delegación, no un listener por tarea?",
      "texto": "Un único listener en #lista funciona igual para tareas que todavía no existen cuando se añadió el listener — imprescindible porque las tareas se crean dinámicamente."
    },
    {
      "titulo": "¿El formulario intercepta el envío?",
      "texto": "Sin preventDefault(), el navegador recargaría la página en cada tarea añadida."
    },
    {
      "titulo": "¿Borrar no marca también como completada?",
      "texto": "El clic en el botón × burbujea hasta el li — sin distinguir el target exacto, ambas acciones se dispararían a la vez."
    }
  ]
}
```

## Retos para ampliarlo

1. Añade un contador de "3 tareas pendientes" que se actualice en tiempo real.
2. Añade un botón "Borrar completadas" que elimine de golpe todas las marcadas.
3. Cuando llegues a la lección de localStorage, guarda y recupera la lista completa en tu propio archivo .html (no en este editor).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "Delegación de eventos",
      "descripcion": "Repaso de bubbling y delegación si te atascas en los pasos 2 y 3.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling",
      "etiqueta": "MDN"
    }
  ]
}
```
