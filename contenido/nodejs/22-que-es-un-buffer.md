# Qué es un Buffer y por qué existe

- **Módulo:** Buffers y datos binarios
- **Slug:** `que-es-un-buffer` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [Buffer](https://nodejs.org/api/buffer.html) — ver `contenido/nodejs/TEMARIO.md` #22

---

## Qué es y para qué sirve

Un `Buffer` es una zona de memoria de tamaño fijo que guarda datos binarios crudos — bytes, no texto. JavaScript en el navegador nunca necesitó esto de forma central porque casi todo lo que maneja es texto o estructuras ya interpretadas; Node.js sí, porque trabaja constantemente con datos que llegan sin interpretar todavía: el contenido de un fichero, una petición de red, una imagen.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst buffer = Buffer.from('Hola', 'utf8');\n\nconsole.log(buffer); // <Buffer 48 6f 6c 61> - los bytes reales, en hexadecimal\nconsole.log(buffer.length); // 4 - cuatro bytes, uno por carácter en este caso\nconsole.log(buffer.toString('utf8')); // 'Hola' - de vuelta a texto\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(buffer); // <Buffer 48 6f 6c 61> - los bytes reales, en hexadecimal", "nota": "Un Buffer no es un string ni un array normal — es una secuencia de bytes crudos. 48, 6f, 6c, 61 son los códigos hexadecimales de 'H', 'o', 'l', 'a' en UTF-8." },
    { "fragmento": "console.log(buffer.toString('utf8')); // 'Hola' - de vuelta a texto", "nota": ".toString() interpreta esos bytes de vuelta como texto, según el encoding indicado — sin especificar uno, usa utf8 por defecto." }
  ]
}
```

## Por qué esto importa en la práctica

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "fs y http trabajan con Buffers por dentro",
  "contenido": "readFile sin especificar encoding devuelve un Buffer, no un string — porque Node.js no puede saber de antemano si el fichero es texto o datos binarios (una imagen, por ejemplo). Pasar 'utf8' como encoding le pide explícitamente que lo convierta a texto legible antes de devolverlo."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Tratar un Buffer como si fuera directamente un string.", "texto": "console.log(buffer) muestra los bytes en hexadecimal, no el texto — hace falta .toString('utf8') explícitamente para verlo como texto legible." },
    { "titulo": "Olvidar el encoding al leer un fichero binario (como una imagen) esperando texto.", "texto": "readFile('imagen.png', 'utf8') corrompe los datos — un fichero binario nunca debe leerse forzando un encoding de texto." }
  ]
}
```

## Ejercicios

1. Crea un `Buffer` a partir de un string, e imprime su representación en bytes.
2. Convierte ese `Buffer` de vuelta a texto con `.toString()`.
3. Explica por qué `readFile` sin especificar `encoding` devuelve un `Buffer` en vez de un string directamente.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Buffer",
      "descripcion": "Referencia oficial del módulo Buffer.",
      "url": "https://nodejs.org/api/buffer.html",
      "etiqueta": "Node.js"
    }
  ]
}
```
