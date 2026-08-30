# Resolución de módulos: cómo decide TypeScript qué import es cuál

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `resolucion-de-modulos` (autogenerado del título)
- **Orden:** 49
- **Fuentes:** [Modules — Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html) — ver `contenido/typescript/TEMARIO.md` #49

---

## Qué es y para qué sirve

Cuando el código escribe `import algo from './utilidades'`, alguien tiene que decidir a qué fichero real corresponde ese string — esa decisión se llama resolución de módulos, y las reglas concretas dependen de la opción `moduleResolution` del `tsconfig.json`. Entender esto explica errores de import que, a simple vista, parecen no tener sentido.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "TypeScript no inventa sus propias reglas de resolución",
  "contenido": "moduleResolution normalmente se configura para IMITAR el comportamiento real del entorno donde el código va a ejecutarse — Node.js, un bundler como Vite... TypeScript no decide por su cuenta cómo se resuelven los imports; comprueba los tipos siguiendo las MISMAS reglas que usará el entorno real, para que un import que compila también funcione de verdad al ejecutarse."
}
```

## Extensiones y resolución en un proyecto real

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// Con moduleResolution: \"bundler\" (Vite y similares):\nimport { formatear } from './utilidades'; // sin extensión, el bundler la resuelve\n\n// Con moduleResolution: \"node16\"/\"nodenext\" y módulos ES nativos de Node:\nimport { formatear } from './utilidades.js'; // la extensión SÍ hace falta, aunque el fichero real sea .ts\n</script>",
  "anotaciones": [
    { "fragmento": "import { formatear } from './utilidades.js'; // la extensión SÍ hace falta, aunque el fichero real sea .ts", "nota": "Un detalle real que sorprende a quien empieza: bajo las reglas nativas de Node.js, el import lleva la extensión .js incluso apuntando a un fichero fuente .ts — porque Node resuelve rutas relativas literalmente, y el .ts se compila a .js antes de ejecutarse." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Copiar la configuración de moduleResolution de un proyecto distinto sin comprobar si encaja.", "texto": "Un proyecto con Vite (bundler) y uno con Node puro (node16/nodenext) tienen reglas de resolución distintas — mezclarlas produce errores de import confusos que no tienen que ver con el código en sí." },
    { "titulo": "Sorprenderse de que un import con extensión .js apunte a un fichero .ts.", "texto": "Es el comportamiento esperado bajo las reglas de Node.js — el .js del import se refiere al fichero de SALIDA, no al de entrada." }
  ]
}
```

## Ejercicios

1. Explica con tus propias palabras qué decide la opción `moduleResolution`.
2. ¿Por qué un import con extensión `.js` puede apuntar correctamente a un fichero fuente `.ts`?
3. ¿Por qué TypeScript no define sus propias reglas de resolución de módulos, independientes del entorno real de ejecución?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Modules — Theory",
      "descripcion": "Explicación oficial y detallada de cómo TypeScript resuelve módulos.",
      "url": "https://www.typescriptlang.org/docs/handbook/modules/theory.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
