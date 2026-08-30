# Instalar, actualizar y fijar versiones (semver)

- **Módulo:** npm en profundidad
- **Slug:** `instalar-versiones-semver` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) — ver `contenido/nodejs/TEMARIO.md` #14

---

## Qué es y para qué sirve

`npm install paquete` no siempre instala exactamente la misma versión dos veces — depende de qué rango de versiones se haya guardado en `package.json`. Entender semver (versionado semántico) y los símbolos `^`/`~` explica por qué un proyecto puede "romperse solo" tras un `npm install` en una máquina distinta, sin que nadie haya tocado el código.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n{\n  \"dependencies\": {\n    \"paquete-a\": \"^4.2.1\",\n    \"paquete-b\": \"~4.2.1\",\n    \"paquete-c\": \"4.2.1\"\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"paquete-a\": \"^4.2.1\",", "nota": "^ permite actualizar el MENOR y el PARCHE, nunca el MAYOR: acepta 4.3.0, 4.9.9... pero nunca 5.0.0. Es el símbolo por defecto que usa npm install, y el más permisivo de los tres." },
    { "fragmento": "\"paquete-b\": \"~4.2.1\",", "nota": "~ solo permite actualizar el PARCHE: acepta 4.2.2, 4.2.9... pero no 4.3.0. Más restrictivo que ^, útil cuando se confía menos en que los cambios menores sean de verdad compatibles." },
    { "fragmento": "\"paquete-c\": \"4.2.1\"", "nota": "Sin ningún símbolo, la versión queda fijada EXACTAMENTE — npm install nunca instalará otra versión distinta de esta, ni siquiera un parche." }
  ]
}
```

## package-lock.json: la versión real instalada, no solo el rango permitido

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "package.json dice qué rango es válido; package-lock.json dice qué se instaló de verdad",
  "contenido": "\"^4.2.1\" en package.json admite muchas versiones distintas — package-lock.json fija la EXACTA que se instaló la última vez, para que todo el equipo (y el servidor de producción) instale siempre lo mismo con npm ci. Por eso package-lock.json siempre se sube a Git, aunque parezca un fichero generado automáticamente que \"no hace falta\" versionar."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No subir package-lock.json al repositorio.", "texto": "Sin él, cada npm install puede resolver versiones ligeramente distintas dentro de los rangos permitidos — un bug que aparece en una máquina y no en otra, con el mismo package.json, casi siempre viene de aquí." },
    { "titulo": "Usar npm install en un pipeline de despliegue en vez de npm ci.", "texto": "npm ci instala EXACTAMENTE lo que dice package-lock.json, y falla si no coincide con package.json — npm install puede actualizar el lock silenciosamente, algo que no se quiere en un despliegue automático." }
  ]
}
```

## Ejercicios

1. Explica la diferencia entre `^4.2.1`, `~4.2.1` y `4.2.1` a secas.
2. ¿Por qué `package-lock.json` se sube a Git aunque sea un fichero generado automáticamente?
3. ¿Cuándo tiene más sentido usar `npm ci` en vez de `npm install`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "An introduction to the npm package manager",
      "descripcion": "Guía oficial de npm, versionado y package-lock.json.",
      "url": "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager",
      "etiqueta": "Node.js"
    }
  ]
}
```
