# Publicar un paquete de npm escrito en TypeScript

- **Módulo:** TypeScript en Node
- **Slug:** `publicar-un-paquete-typescript` (autogenerado del título)
- **Orden:** 440
- **Fuentes:** [Publishing a TypeScript package](https://nodejs.org/en/learn/typescript/publishing-a-ts-package) — ver `contenido/nodejs/TEMARIO.md` #44

---

## Qué es y para qué sirve

Un paquete de npm escrito en TypeScript no se publica como `.ts` — se publica el JavaScript ya compilado, más los ficheros de declaración (`.d.ts`, temario de TypeScript, lección 50) para que quien lo instale siga teniendo autocompletado y comprobación de tipos, sin necesitar el código fuente TypeScript original.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// package.json de un paquete TypeScript publicable\n{\n  \"name\": \"mi-libreria\",\n  \"main\": \"dist/index.js\",\n  \"types\": \"dist/index.d.ts\",\n  \"files\": [\"dist\"],\n  \"scripts\": {\n    \"build\": \"tsc\",\n    \"prepublishOnly\": \"npm run build\"\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"types\": \"dist/index.d.ts\",", "nota": "Este campo le dice a TypeScript (en el proyecto de quien instale el paquete) dónde están las declaraciones de tipo — sin él, el paquete funcionaría igual en JavaScript puro, pero quien lo use en TypeScript no tendría autocompletado ni comprobación de tipos." },
    { "fragmento": "\"files\": [\"dist\"],", "nota": "Limita qué se publica realmente en npm a la carpeta compilada — el código fuente .ts, los tests, la configuración interna, no hace falta que viajen con el paquete publicado." },
    { "fragmento": "\"prepublishOnly\": \"npm run build\"", "nota": "Se ejecuta automáticamente justo antes de npm publish — garantiza que nunca se publica una versión desactualizada del build, aunque alguien olvide compilar a mano antes." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Publicar el código fuente .ts en vez del JavaScript compilado.", "texto": "Quien instale el paquete necesitaría su propio compilador de TypeScript configurado exactamente igual para poder usarlo — el estándar real es publicar JavaScript ya compilado, más los .d.ts." },
    { "titulo": "Olvidar el campo \"types\" en package.json.", "texto": "El paquete funciona igual en JavaScript, pero pierde el autocompletado y la comprobación de tipos para quien lo use desde TypeScript." }
  ]
}
```

## Ejercicios

1. Diseña un `package.json` mínimo para un paquete de TypeScript publicable, con `main`, `types` y un script `build`.
2. Explica por qué un paquete de npm escrito en TypeScript no se publica como ficheros `.ts` directamente.
3. ¿Qué garantiza el script `prepublishOnly` que un `build` manual antes de publicar no garantiza por sí solo?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Publishing a TypeScript package",
      "descripcion": "Guía oficial sobre publicar paquetes de TypeScript en npm.",
      "url": "https://nodejs.org/en/learn/typescript/publishing-a-ts-package",
      "etiqueta": "Node.js"
    }
  ]
}
```
