# Soporte nativo de TypeScript en Node (node archivo.ts)

- **Módulo:** TypeScript en Node
- **Slug:** `soporte-nativo-de-typescript` (autogenerado del título)
- **Orden:** 420
- **Fuentes:** [Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively) — ver `contenido/nodejs/TEMARIO.md` #42

---

## Qué es y para qué sirve

Node.js puede ejecutar un fichero `.ts` directamente con `node archivo.ts`, sin ningún paso de compilación previo ni herramienta externa instalada — Node.js le quita las anotaciones de tipo por encima (type stripping) y ejecuta el JavaScript que queda. Es exactamente el mismo concepto de `erasableSyntaxOnly` que ya se estudió en el temario de TypeScript: solo funciona con sintaxis que se pueda BORRAR, nunca con sintaxis que necesite generar código nuevo.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Conecta directamente con lo que ya sabes de TypeScript",
  "contenido": "Si el atajo de parámetros de constructor (constructor(private x: number)) o un enum normal no compilan con erasableSyntaxOnly activado en un proyecto de Vite (temario de TypeScript, lecciones 32/36), es exactamente por el MISMO motivo por el que node archivo.ts no puede ejecutar esa sintaxis directamente: las dos herramientas solo BORRAN anotaciones de tipo, ninguna de las dos tiene un compilador completo detrás capaz de GENERAR código nuevo."
}
```

## Un ejemplo real: qué sí funciona y qué no

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// funciona.ts - solo anotaciones, nada que generar\nfunction sumar(a: number, b: number): number {\n  return a + b;\n}\n\nconsole.log(sumar(2, 3));\n// node funciona.ts - funciona sin ningún paso extra\n</script>",
  "despues": "<script>\n// falla.ts - el atajo de constructor genera código real\nclass Punto {\n  constructor(public x: number, public y: number) {}\n}\n// node falla.ts - error: type stripping no puede generar this.x = x\n</script>",
  "nota": "sumar(a: number, b: number): number es sintaxis puramente borrable — quitar los : number dos veces y el tipo de retorno deja JavaScript válido, sin generar nada. El atajo de constructor necesita GENERAR this.x = x y this.y = y, algo que type stripping no hace — exactamente el mismo límite de erasableSyntaxOnly."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que node archivo.ts comprueba los tipos.", "texto": "Type stripping solo QUITA las anotaciones — no valida que los tipos sean correctos, ni lanza ningún error de tipos. Para comprobar tipos de verdad sigue haciendo falta tsc --noEmit por separado." },
    { "titulo": "Usar sintaxis de TypeScript que necesite generar código (enums normales, atajos de constructor) esperando que funcione igual.", "texto": "Falla con un error real — la lista completa de qué es \"borrable\" es la misma que documenta erasableSyntaxOnly en el temario de TypeScript." }
  ]
}
```

## Ejercicios

1. Escribe un fichero `.ts` con anotaciones de tipo simples y ejecútalo directamente con `node archivo.ts`.
2. Escribe un fichero `.ts` que use el atajo de parámetros de constructor y comprueba que `node` da un error real al ejecutarlo.
3. Explica por qué el soporte nativo de TypeScript de Node.js no sustituye a `tsc --noEmit` para comprobar tipos.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Running TypeScript Natively",
      "descripcion": "Guía oficial del soporte nativo de TypeScript en Node.js.",
      "url": "https://nodejs.org/en/learn/typescript/run-natively",
      "etiqueta": "Node.js"
    }
  ]
}
```
