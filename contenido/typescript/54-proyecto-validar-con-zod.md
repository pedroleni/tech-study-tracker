# Proyecto: validar datos de una API con Zod — cuando un tipo no basta

- **Módulo:** Proyectos
- **Slug:** `proyecto-validar-con-zod` (autogenerado del título)
- **Orden:** 540
- **Fuentes:** [Utility Types — z.infer](https://www.typescriptlang.org/docs/handbook/utility-types.html) (para tipar la salida de Zod) + continúa el reto #3 planteado, sin resolver, en la lección `proyecto-avanzado-buscador-de-personajes-con-typescript` de este mismo temario — ver `contenido/typescript/TEMARIO.md` #54

---

## Qué vas a construir

Este proyecto se hace en tu propio editor, no en el sandbox de esta lección — a diferencia del proyecto anterior, aquí hace falta una dependencia real de npm (`zod`), y el editor en vivo de este curso solo compila un único fichero sin `node_modules` (ver la nota técnica más abajo). Vas a añadir validación en tiempo de ejecución a una función que ya tipa correctamente su resultado en tiempo de compilación — y a ver, con un caso real, por qué las dos cosas no son lo mismo.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Por qué esto no cabe en el editor en vivo de esta lección",
  "contenido": "El compilador de TypeScript embebido en las lecciones de este curso solo conoce un fichero, sin resolución de node_modules — no puede resolver import { z } from 'zod'. Es la misma limitación, real y deliberada, de cualquier sandbox de un solo fichero: para código con dependencias reales, hace falta un proyecto de verdad con npm install."
}
```

## El problema real: un tipo es una promesa, no una comprobación

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Personaje {\n  nombre: string;\n  especie: string;\n}\n\nasync function obtenerJSON<T>(url: string): Promise<T> {\n  const respuesta = await fetch(url);\n  return respuesta.json(); // as Promise<T> implícito: TypeScript CONFÍA, no comprueba\n}\n\nconst personaje = await obtenerJSON<Personaje>('/api/personaje/1');\n// Si la API cambiara de forma (por ejemplo, quitara \"especie\"),\n// TypeScript seguiría sin avisar — el tipo Personaje es una promesa\n// sobre datos que nunca comprobó de verdad.\n</script>",
  "anotaciones": [
    { "fragmento": "return respuesta.json(); // as Promise<T> implícito: TypeScript CONFÍA, no comprueba", "nota": "Este es exactamente el límite señalado en la lección sobre genéricos aplicados a funciones (Módulo 7): el tipo T de obtenerJSON es una anotación, no una comprobación real contra los datos que de verdad llegan por la red." }
  ]
}
```

## La solución: Zod comprueba en tiempo de ejecución, TypeScript infiere el tipo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nimport { z } from 'zod';\n\nconst esquemaPersonaje = z.object({\n  nombre: z.string(),\n  especie: z.string(),\n});\n\ntype Personaje = z.infer<typeof esquemaPersonaje>; // se deriva del esquema, no al revés\n\nasync function obtenerPersonaje(url: string): Promise<Personaje> {\n  const respuesta = await fetch(url);\n  const datos = await respuesta.json();\n  return esquemaPersonaje.parse(datos); // lanza un error real si los datos no encajan\n}\n</script>",
  "anotaciones": [
    { "fragmento": "type Personaje = z.infer<typeof esquemaPersonaje>; // se deriva del esquema, no al revés", "nota": "Este es el mismo patrón de \"derivar en vez de declarar por separado\" del Módulo 9 (keyof typeof) — el TIPO se deriva del esquema de validación, así que ambos nunca pueden desincronizarse: si el esquema cambia, el tipo cambia con él automáticamente." },
    { "fragmento": "return esquemaPersonaje.parse(datos); // lanza un error real si los datos no encajan", "nota": ".parse() SÍ comprueba los datos de verdad, campo a campo, en tiempo de ejecución — si la API cambiara de forma, esta línea lanzaría un error inmediato y localizado, en vez de dejar que un dato con la forma equivocada se propague silenciosamente por el resto de la aplicación." }
  ]
}
```

## Pruébalo en un proyecto real

A diferencia de los proyectos anteriores, aquí no clonas nada — el proyecto no existe todavía, lo creas tú desde cero con una única orden. Es la primera vez en este temario que haces esto, así que va paso a paso.

1. **Instala Node.js** si todavía no lo tienes: versión **LTS** desde [nodejs.org](https://nodejs.org). Comprueba con `node --version` en una terminal.
2. **Abre VS Code en una carpeta cualquiera** donde quieras que viva el proyecto (tu Escritorio, una carpeta de "Proyectos"...): menú `Archivo` → `Abrir carpeta...`.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal` (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
4. **Crea el proyecto con una sola orden**: escribe
   ```bash
   npm create vite@latest validar-con-zod -- --template vanilla-ts
   ```
   y pulsa Intro — `validar-con-zod` es el nombre de carpeta que va a crear (puedes poner el que quieras); `vanilla-ts` le dice a Vite que monte un proyecto de TypeScript sin ningún framework.
5. **Entra en la carpeta que se acaba de crear**: `cd validar-con-zod` (o el nombre que hayas puesto), y luego `npm install` para las dependencias del propio Vite.
6. **Vuelve a abrir esa carpeta en VS Code** — `Archivo` → `Abrir carpeta...` otra vez, eligiendo ahora la carpeta `validar-con-zod` recién creada — así el explorador de archivos y la terminal quedan situados dentro del proyecto de verdad, no en la carpeta de fuera.
7. **Instala Zod**: en la terminal (ya dentro del proyecto), escribe `npm install zod`.
8. **Mira el explorador de archivos**: Vite ya creó `src/main.ts` con código de ejemplo — ábrelo y **borra todo su contenido**. Ahí es donde escribes el esquema Zod y la función `obtenerPersonaje` de esta lección.
9. **Arranca el servidor de desarrollo**: escribe `npm run dev` y pulsa Intro — imprime en la terminal la URL a abrir (normalmente `http://localhost:5173`).
10. **Este proyecto no tiene interfaz visual** — compruébalo con `console.log()` al final de `main.ts` (por ejemplo, `console.log(await obtenerPersonaje(...))`) y mirando la consola del navegador: `F12` (o clic derecho → `Inspeccionar`) → pestaña `Console`.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usa cualquier API pública real (PokeAPI, Rick and Morty API...) y define un esquema Zod para su respuesta.", "texto": "Comprueba primero, con curl o el navegador, la forma REAL de la respuesta, y modélala en el esquema — no adivines la forma sin mirar." },
    { "titulo": "Rompe la validación a propósito.", "texto": "Cambia un campo del esquema por un tipo que no coincida con la API real, y confirma que .parse() lanza un error inmediato y localizado — la prueba real de que la validación funciona, del mismo espíritu que el reto de exhaustividad de la lección 24." }
  ]
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Utility Types",
      "descripcion": "Referencia del Handbook — z.infer usa un mecanismo de inferencia condicional parecido al de ReturnType, visto en el Módulo 10.",
      "url": "https://www.typescriptlang.org/docs/handbook/utility-types.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
