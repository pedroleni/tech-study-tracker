# Tipos de objeto y propiedades opcionales/readonly

- **Módulo:** Objetos y alias de tipos
- **Slug:** `tipos-de-objeto` (autogenerado del título)
- **Orden:** 11
- **Fuentes:** [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) — ver `contenido/typescript/TEMARIO.md` #11

---

## Qué es y para qué sirve

Un tipo de objeto describe la FORMA mínima que debe cumplir un valor: qué propiedades tiene y de qué tipo es cada una. No importa cómo se llame el tipo ni de dónde venga el valor — si la forma encaja, TypeScript lo acepta. Esto se llama **tipado estructural** (frente al tipado nominal de otros lenguajes, donde importa el nombre de la clase, no solo su forma).

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Tipado estructural: importa la forma, no el nombre",
  "consigna": "persona no se declaró como Punto, pero tiene x e y — TypeScript lo acepta igual. Quita la propiedad y de persona y observa el error.",
  "ts": "type Punto = { x: number; y: number };\n\nfunction imprimirPunto(p: Punto) {\n  console.log(`(${p.x}, ${p.y})`);\n}\n\nconst persona = { x: 10, y: 20, nombre: 'Ada' };\nimprimirPunto(persona); // válido: tiene x e y, sobran propiedades no importa\n",
  "pestañaInicial": "ts"
}
```

## Propiedades opcionales y readonly

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Tarea = {\n  readonly id: number;\n  titulo: string;\n  descripcion?: string;\n};\n\nconst tarea: Tarea = { id: 1, titulo: 'Comprar leche' };\ntarea.id = 2; // Error: id es readonly\ntarea.descripcion = 'Entera'; // Válido: descripcion es opcional, se puede asignar\n</script>",
  "anotaciones": [
    { "fragmento": "readonly id: number;", "nota": "readonly impide REASIGNAR la propiedad después de creado el objeto — comprobado solo en tiempo de compilación, no cambia nada en el JavaScript generado." },
    { "fragmento": "descripcion?: string;", "nota": "El ? marca la propiedad como opcional: el objeto es válido con o sin ella. Su tipo real es string | undefined." },
    { "fragmento": "tarea.id = 2; // Error: id es readonly", "nota": "Intentar reasignar una propiedad readonly es un error de compilación, no de ejecución — se detecta antes de que el código llegue a correr." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir descripcion?: string con descripcion: string | undefined en un objeto literal.", "texto": "Son parecidos pero no idénticos: con ? la propiedad puede faltar por completo del objeto; con | undefined la propiedad tiene que existir, aunque su valor sea undefined." },
    { "titulo": "Esperar que readonly haga el objeto inmutable en tiempo de ejecución.", "texto": "readonly es solo una comprobación del compilador — el JavaScript generado no tiene ninguna protección real, y acceder al objeto sin pasar por TypeScript (por ejemplo, con as any) permite reasignar igualmente." }
  ]
}
```

## Ejercicios

1. Declara un tipo `Libro` con `titulo` (string, obligatorio), `autor` (string, obligatorio) y `paginasLeidas` (number, opcional).
2. Explica la diferencia entre una propiedad opcional (`?`) y una de tipo `| undefined`.
3. ¿Por qué `persona` en el primer ejemplo es válida como `Punto`, si nunca se declaró explícitamente así?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Object Types",
      "descripcion": "Capítulo del Handbook sobre tipos de objeto, propiedades opcionales y readonly.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/objects.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
