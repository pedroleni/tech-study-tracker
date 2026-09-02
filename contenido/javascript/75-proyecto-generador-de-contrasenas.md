# Proyecto: generador de contraseñas seguras

- **Módulo:** Proyectos
- **Slug:** `proyecto-generador-de-contrasenas-seguras` (autogenerado del título)
- **Orden:** 415
- **Requiere:** Lecciones de cadenas (09-10) y arrays/métodos funcionales (30-31)

---

## Qué vas a construir

Un generador de contraseñas con longitud configurable y checkboxes para incluir mayúsculas, números y símbolos. El corazón del proyecto es construir el "alfabeto" disponible según lo que el usuario marque, y elegir caracteres al azar de él — nada de librerías externas.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Sin botón de copiar",
  "contenido": "Un generador real suele incluir un botón \"Copiar\" con la API del portapapeles — pero esa API exige un contexto seguro que este iframe aislado no proporciona (el mismo tipo de restricción que ya viste con localStorage). Aquí la contraseña se muestra en un campo de texto seleccionable a mano; el reto 3 de abajo te propone añadir el botón en tu propio archivo."
}
```

## Paso 1: elegir un carácter al azar de un string

Antes de la interfaz, resuelve el problema base: dado un string de caracteres posibles, devuelve uno al azar.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 1: carácter al azar",
  "consigna": "Completa caracterAlAzar(caracteres) usando Math.random() y Math.floor() para elegir un índice válido del string.",
  "html": "<pre id=\"salida\"></pre>",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) { salida.textContent += valor + '\\n'; }\n\nfunction caracterAlAzar(caracteres) {\n  // const indice = Math.floor(Math.random() * caracteres.length);\n  // return caracteres[indice];\n}\n\nfor (let i = 0; i < 5; i++) {\n  mostrar(caracterAlAzar('ABCDEFG'));\n}",
  "pestañaInicial": "js"
}
```

## Paso 2: construir el alfabeto según las opciones

Junta minúsculas siempre, y añade mayúsculas/números/símbolos solo si su checkbox está marcado.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Paso 2: construir el alfabeto",
  "consigna": "Completa construirAlfabeto(): empieza con minúsculas, y ve concatenando MAYUSCULAS/NUMEROS/SIMBOLOS según el estado .checked de cada checkbox.",
  "html": "<label><input type=\"checkbox\" id=\"mayusculas\" checked> Mayúsculas</label>\n<label><input type=\"checkbox\" id=\"numeros\" checked> Números</label>\n<label><input type=\"checkbox\" id=\"simbolos\"> Símbolos</label>\n<button id=\"probar\">Ver alfabeto</button>\n<pre id=\"salida\"></pre>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n}\nlabel {\n  display: block;\n  margin-bottom: 4px;\n}",
  "js": "const salida = document.getElementById('salida');\nfunction mostrar(valor) { salida.textContent += valor + '\\n'; }\n\nconst MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';\nconst MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';\nconst NUMEROS = '0123456789';\nconst SIMBOLOS = '!@#$%^&*()_+-=';\n\nfunction construirAlfabeto() {\n  let alfabeto = MINUSCULAS;\n  // añade MAYUSCULAS si #mayusculas.checked, NUMEROS si #numeros.checked, SIMBOLOS si #simbolos.checked\n  return alfabeto;\n}\n\ndocument.getElementById('probar').addEventListener('click', () => {\n  salida.textContent = '';\n  mostrar(construirAlfabeto());\n});",
  "pestañaInicial": "js"
}
```

## Proyecto completo

Añade un input de longitud y genera la contraseña completa combinando los dos pasos anteriores.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Proyecto completo",
  "consigna": "Completa generarContrasena(): construye el alfabeto según las opciones marcadas, y repite caracterAlAzar() tantas veces como indique #longitud, uniendo el resultado en un string.",
  "html": "<div class=\"opciones\">\n  <label>Longitud: <input type=\"number\" id=\"longitud\" value=\"12\" min=\"4\" max=\"32\"></label>\n  <label><input type=\"checkbox\" id=\"mayusculas\" checked> Mayúsculas</label>\n  <label><input type=\"checkbox\" id=\"numeros\" checked> Números</label>\n  <label><input type=\"checkbox\" id=\"simbolos\"> Símbolos</label>\n</div>\n<button id=\"generar\">Generar</button>\n<input id=\"resultado\" readonly>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  max-width: 320px;\n}\n.opciones label {\n  display: block;\n  margin-bottom: 6px;\n}\n#resultado {\n  width: 100%;\n  box-sizing: border-box;\n  padding: 8px;\n  margin-top: 12px;\n  font-family: monospace;\n  font-size: 1rem;\n}\nbutton {\n  padding: 6px 14px;\n  cursor: pointer;\n}",
  "js": "const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';\nconst MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';\nconst NUMEROS = '0123456789';\nconst SIMBOLOS = '!@#$%^&*()_+-=';\n\nfunction caracterAlAzar(caracteres) {\n  const indice = Math.floor(Math.random() * caracteres.length);\n  return caracteres[indice];\n}\n\nfunction construirAlfabeto() {\n  let alfabeto = MINUSCULAS;\n  if (document.getElementById('mayusculas').checked) alfabeto += MAYUSCULAS;\n  if (document.getElementById('numeros').checked) alfabeto += NUMEROS;\n  if (document.getElementById('simbolos').checked) alfabeto += SIMBOLOS;\n  return alfabeto;\n}\n\nfunction generarContrasena() {\n  const longitud = Number(document.getElementById('longitud').value);\n  const alfabeto = construirAlfabeto();\n  let contrasena = '';\n  for (let i = 0; i < longitud; i++) {\n    contrasena += caracterAlAzar(alfabeto);\n  }\n  return contrasena;\n}\n\ndocument.getElementById('generar').addEventListener('click', () => {\n  document.getElementById('resultado').value = generarContrasena();\n});",
  "pestañaInicial": "js"
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Desmarcar todas las opciones extra sigue generando algo?",
      "texto": "El alfabeto siempre debería tener al menos las minúsculas — nunca un string vacío que rompería Math.floor(Math.random() * 0)."
    },
    {
      "titulo": "¿La longitud se lee como número, no como texto?",
      "texto": "Number(input.value) es necesario — sin él, el bucle for compara un string contra un número y puede comportarse de forma inesperada."
    },
    {
      "titulo": "¿Cada generación es realmente distinta?",
      "texto": "Pulsa Generar varias veces seguidas y comprueba que el resultado cambia cada vez."
    }
  ]
}
```

## Retos para ampliarlo

1. En tu propio archivo (no en este editor), añade un botón "Copiar" con `navigator.clipboard.writeText()`.
2. Añade un indicador de fortaleza (débil/media/fuerte) según la longitud y las opciones marcadas.
3. Evita que la longitud baje de 4 o suba de 32, deshabilitando el botón Generar si el valor está fuera de rango.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repasa si te atascas",
  "recursos": [
    {
      "titulo": "Math.random()",
      "descripcion": "Repaso de Math.random() y Math.floor() para elegir un índice al azar.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random",
      "etiqueta": "MDN"
    }
  ]
}
```
