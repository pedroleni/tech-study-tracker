# Interfaces: extender y combinar formas

- **Módulo:** Objetos y alias de tipos
- **Slug:** `interfaces-extender-y-combinar` (autogenerado del título)
- **Orden:** 14
- **Fuentes:** [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) — ver `contenido/typescript/TEMARIO.md` #14

---

## Qué es y para qué sirve

Una `interface` describe la forma de un objeto, igual que un `type` con forma de objeto — con una diferencia clave: las interfaces se pueden **extender** con `extends`, heredando todas las propiedades de otra interfaz y añadiendo las suyas propias. Es la forma idiomática de modelar "esto es una versión más específica de aquello".

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Animal {\n  nombre: string;\n}\n\ninterface Perro extends Animal {\n  raza: string;\n}\n\nconst miPerro: Perro = { nombre: 'Rex', raza: 'Labrador' };\n</script>",
  "anotaciones": [
    { "fragmento": "interface Perro extends Animal {", "nota": "Perro hereda nombre de Animal, y añade raza — cualquier valor de tipo Perro tiene que cumplir las dos formas a la vez." },
    { "fragmento": "const miPerro: Perro = { nombre: 'Rex', raza: 'Labrador' };", "nota": "Si faltara nombre o raza, TypeScript daría un error — el objeto tiene que cumplir la forma completa, heredada incluida." }
  ]
}
```

## El equivalente con type: intersecciones

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ntype Animal = { nombre: string };\ntype Perro = Animal & { raza: string };\n\nconst miPerro: Perro = { nombre: 'Rex', raza: 'Labrador' };\n</script>",
  "anotaciones": [
    { "fragmento": "type Perro = Animal & { raza: string };", "nota": "El operador & combina dos tipos en uno que tiene TODAS las propiedades de ambos — el resultado práctico es el mismo que extends con interfaces." }
  ]
}
```

## Extender de más de una interfaz

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "extends admite varias interfaces a la vez",
  "contenido": "interface Empleado extends Persona, ConSalario { ... } combina las propiedades de Persona y ConSalario, más las que Empleado añada por su cuenta — algo que las clases de JavaScript no permiten con herencia simple, pero que las interfaces de TypeScript sí, porque solo describen formas, no implementación."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que extends obliga a cumplir TODAS las propiedades heredadas.", "texto": "Un objeto de tipo Perro sin nombre es inválido, aunque nombre venga de la interfaz padre Animal, no de Perro directamente." },
    { "titulo": "Pensar que & (intersección) siempre funciona igual que extends con interfaces.", "texto": "En la mayoría de casos el resultado es equivalente, pero cuando dos tipos combinados con & tienen la misma propiedad con tipos incompatibles, el resultado es never para esa propiedad — un caso límite que extends con interfaces suele señalar con un error más claro." }
  ]
}
```

## Ejercicios

1. Declara una interfaz `Vehiculo` con `marca` (string) y una interfaz `Coche extends Vehiculo` que añada `puertas` (number).
2. Reescribe el ejercicio anterior usando `type` e intersección (`&`) en vez de `interface`/`extends`.
3. ¿Qué ventaja tiene `extends` con varias interfaces a la vez, frente a la herencia de clases de JavaScript?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Object Types",
      "descripcion": "Capítulo del Handbook sobre cómo extender interfaces y combinar tipos.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/objects.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
