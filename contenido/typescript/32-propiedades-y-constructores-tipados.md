# Propiedades y constructores tipados

- **Módulo:** Clases tipadas
- **Slug:** `propiedades-y-constructores-tipados` (autogenerado del título)
- **Orden:** 32
- **Fuentes:** [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) — ver `contenido/typescript/TEMARIO.md` #32

---

## Qué es y para qué sirve

Las clases de TypeScript son las mismas clases de JavaScript, con anotaciones de tipo añadidas a sus propiedades, parámetros de constructor y métodos. Declarar el tipo de cada propiedad por adelantado permite que TypeScript compruebe, en cualquier método de la clase, que se usa de forma consistente con lo declarado.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass Tarea {\n  titulo: string;\n  completada: boolean;\n\n  constructor(titulo: string) {\n    this.titulo = titulo;\n    this.completada = false;\n  }\n\n  marcarCompletada(): void {\n    this.completada = true;\n  }\n}\n\nconst tarea = new Tarea('Comprar leche');\ntarea.marcarCompletada();\n</script>",
  "anotaciones": [
    { "fragmento": "class Tarea {\n  titulo: string;\n  completada: boolean;", "nota": "Declarar las propiedades con su tipo ANTES del constructor es obligatorio en TypeScript (a diferencia de JavaScript, donde basta con asignarlas dentro del constructor) — es lo que permite comprobar su uso en el resto de la clase." },
    { "fragmento": "constructor(titulo: string) {", "nota": "El parámetro del constructor tiene su propio tipo, igual que cualquier función — TypeScript comprueba que new Tarea(...) se llame con los argumentos correctos." }
  ]
}
```

## Atajo: parámetros de propiedad en el constructor

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass TareaCorta {\n  constructor(public titulo: string, public completada: boolean = false) {}\n}\n\nconst tarea = new TareaCorta('Comprar leche');\nconsole.log(tarea.titulo, tarea.completada);\n</script>",
  "anotaciones": [
    { "fragmento": "constructor(public titulo: string, public completada: boolean = false) {}", "nota": "Anteponer un modificador de acceso (public, private, protected — siguiente lección) a un parámetro del constructor declara Y asigna la propiedad automáticamente — equivale a la versión larga de arriba, con menos código repetido. Ojo: esta sintaxis no compila con la opción erasableSyntaxOnly, ver la lección 36." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar declarar el tipo de una propiedad antes de usarla en el constructor.", "texto": "A diferencia de JavaScript, TypeScript exige la declaración explícita de cada propiedad de instancia — asignarla solo en el constructor sin declararla antes da un error." },
    { "titulo": "Dejar una propiedad sin inicializar y sin marcar como opcional.", "texto": "Con strictPropertyInitialization (parte de strict), una propiedad que no se inicializa ni en su declaración ni en el constructor da un error — o se inicializa, o se marca como opcional (nombre?: string)." }
  ]
}
```

## Ejercicios

1. Escribe una clase `Punto` con propiedades `x` e `y` (ambas `number`), inicializadas en el constructor.
2. Reescribe la clase anterior usando el atajo de parámetros de propiedad en el constructor.
3. Explica qué error da declarar una propiedad sin inicializarla ni en su declaración ni en el constructor, con `strict` activo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Classes",
      "descripcion": "Capítulo del Handbook sobre propiedades y constructores en clases.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/classes.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
