# package.json: campos reales, no solo name/version

- **Módulo:** npm en profundidad
- **Slug:** `package-json-en-profundidad` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) — ver `contenido/nodejs/TEMARIO.md` #13

---

## Qué es y para qué sirve

`package.json` es el fichero de configuración central de cualquier proyecto de Node.js — no solo declara el nombre y la versión, describe las dependencias, los scripts ejecutables, el sistema de módulos, y varios metadatos que herramientas reales (npm, Node.js, editores) leen y usan de formas distintas.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n{\n  \"name\": \"mi-proyecto\",\n  \"version\": \"1.0.0\",\n  \"type\": \"module\",\n  \"main\": \"index.js\",\n  \"engines\": { \"node\": \">=20\" }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"name\": \"mi-proyecto\",", "nota": "El identificador del paquete — obligatorio si se va a publicar en npm, opcional (pero recomendable) en un proyecto que nunca se va a publicar." },
    { "fragmento": "\"version\": \"1.0.0\",", "nota": "Sigue el formato semver: MAYOR.MENOR.PARCHE — cambios incompatibles incrementan MAYOR, funcionalidad nueva compatible incrementa MENOR, correcciones incrementan PARCHE." },
    { "fragmento": "\"type\": \"module\",", "nota": "Decide si los ficheros .js del proyecto son ES modules o CommonJS — lecciones 9 y 10." },
    { "fragmento": "\"engines\": { \"node\": \">=20\" }", "nota": "Documenta la versión mínima de Node.js con la que el proyecto se probó de verdad — npm avisa (sin bloquear la instalación) si no coincide con la versión real de quien lo instala." }
  ]
}
```

## Los campos que de verdad importan en un proyecto real

```laboratorio
{
  "tipo": "roles",
  "titulo": "No todos los campos hacen lo mismo",
  "roles": [
    { "etiqueta": "name / version", "rol": "Identidad del paquete", "descripcion": "Obligatorios si el paquete se va a publicar en npm — version sigue el formato semver (MAYOR.MENOR.PARCHE)." },
    { "etiqueta": "type", "rol": "Sistema de módulos de los ficheros .js", "descripcion": "\"module\" para ES modules, \"commonjs\" (o ausente) para CommonJS — ya visto en las lecciones 9-10." },
    { "etiqueta": "scripts / engines", "rol": "Comandos con npm run y versión mínima de Node.js", "descripcion": "scripts se ve en la lección 15. engines no impide instalar, pero documenta la versión con la que se probó el proyecto — npm avisa si no coincide." },
    { "etiqueta": "dependencies / devDependencies", "rol": "Qué necesita el proyecto en producción y en desarrollo", "descripcion": "Se ve en detalle en la lección 16." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Editar package.json a mano y dejarlo con JSON inválido (una coma de más, comillas simples).", "texto": "package.json es JSON estricto, no JavaScript — no admite comentarios, comas finales, ni comillas simples. Un error de sintaxis ahí rompe cualquier comando de npm hasta corregirlo." },
    { "titulo": "Olvidar el campo engines en un proyecto que depende de una API reciente de Node.js.", "texto": "Sin él, alguien con una versión de Node.js más antigua puede instalar el proyecto sin ningún aviso, y solo descubrir el problema con un error confuso en tiempo de ejecución." }
  ]
}
```

## Ejercicios

1. Crea un `package.json` mínimo a mano, con `name`, `version` y `type`.
2. Añade un campo `engines` que exija Node.js 20 o superior.
3. Explica por qué `package.json` no admite comentarios, a diferencia de un fichero de configuración como `tsconfig.json`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "An introduction to the npm package manager",
      "descripcion": "Guía oficial de npm y package.json.",
      "url": "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager",
      "etiqueta": "Node.js"
    }
  ]
}
```
