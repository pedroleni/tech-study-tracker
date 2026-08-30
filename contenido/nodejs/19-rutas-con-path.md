# Rutas de archivo con el módulo path

- **Módulo:** El sistema de ficheros (fs)
- **Slug:** `rutas-con-path` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [Node.js File Paths](https://nodejs.org/en/learn/manipulating-files/nodejs-file-paths) — ver `contenido/nodejs/TEMARIO.md` #19

---

## Qué es y para qué sirve

Concatenar rutas de fichero a mano con `+` (`carpeta + '/' + archivo`) parece funcionar hasta que el proyecto se ejecuta en un sistema operativo distinto — Windows usa `\` como separador, no `/`. El módulo `path` construye y descompone rutas de forma correcta en cualquier sistema operativo, sin tener que pensar en el separador.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport path from 'node:path';\n\nconst ruta = path.join('carpeta', 'subcarpeta', 'archivo.txt');\n// 'carpeta/subcarpeta/archivo.txt' en Linux/macOS\n// 'carpeta\\subcarpeta\\archivo.txt' en Windows\n\nconsole.log(path.extname(ruta)); // '.txt'\nconsole.log(path.basename(ruta)); // 'archivo.txt'\nconsole.log(path.dirname(ruta)); // 'carpeta/subcarpeta'\n</script>",
  "anotaciones": [
    { "fragmento": "const ruta = path.join('carpeta', 'subcarpeta', 'archivo.txt');", "nota": "path.join usa el separador correcto del sistema operativo donde se ejecuta el código — el mismo código produce una ruta válida tanto en Linux/macOS como en Windows, sin ningún if especial." },
    { "fragmento": "console.log(path.extname(ruta)); // '.txt'", "nota": "path.extname, path.basename y path.dirname descomponen una ruta en sus partes — mucho más fiable que intentar hacerlo con expresiones regulares propias." }
  ]
}
```

## Rutas absolutas frente a relativas, y import.meta.url

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Una ruta relativa depende de DESDE DÓNDE se ejecuta el script, no de dónde vive el fichero",
  "contenido": "readFile('datos.txt') busca datos.txt relativo al directorio de trabajo ACTUAL (desde donde se lanzó node, no desde donde está el script) — si el script se ejecuta desde otra carpeta, la ruta relativa apunta a otro sitio. path.join(path.dirname(new URL(import.meta.url).pathname), 'datos.txt') construye una ruta relativa AL PROPIO FICHERO, sin importar desde dónde se ejecute."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Concatenar rutas a mano con + '/' + en vez de path.join.", "texto": "Funciona en Linux/macOS pero produce una ruta inválida en Windows — path.join resuelve esto automáticamente." },
    { "titulo": "Asumir que una ruta relativa es relativa a la ubicación del script.", "texto": "Es relativa al directorio de trabajo desde donde se ejecutó node, que puede ser distinto — usar import.meta.url cuando de verdad hace falta una ruta relativa al propio fichero." }
  ]
}
```

## Ejercicios

1. Usa `path.join` para construir una ruta con tres segmentos, y compárala con concatenarla a mano.
2. Extrae la extensión y el nombre base de una ruta de archivo con `path.extname` y `path.basename`.
3. Explica la diferencia entre una ruta relativa al directorio de trabajo actual y una relativa al propio fichero.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Node.js File Paths",
      "descripcion": "Guía oficial sobre el módulo path.",
      "url": "https://nodejs.org/en/learn/manipulating-files/nodejs-file-paths",
      "etiqueta": "Node.js"
    }
  ]
}
```
