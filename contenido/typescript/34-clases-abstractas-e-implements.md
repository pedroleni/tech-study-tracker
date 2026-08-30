# Clases abstractas e implements

- **Módulo:** Clases tipadas
- **Slug:** `clases-abstractas-e-implements` (autogenerado del título)
- **Orden:** 340
- **Fuentes:** [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) — ver `contenido/typescript/TEMARIO.md` #34

---

## Qué es y para qué sirve

Una clase abstracta define una plantilla parcial: puede tener métodos ya implementados y otros marcados como `abstract` (sin cuerpo, obligatorios de implementar en cualquier subclase) — y no se puede instanciar directamente con `new`. `implements` es distinto: una clase normal declara que cumple la forma de una interfaz, sin heredar ningún comportamiento de ella, solo su contrato.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nabstract class Figura {\n  abstract calcularArea(): number;\n\n  describir(): string {\n    return `Área: ${this.calcularArea()}`;\n  }\n}\n\nclass Circulo extends Figura {\n  constructor(private radio: number) {\n    super();\n  }\n\n  calcularArea(): number {\n    return Math.PI * this.radio ** 2;\n  }\n}\n\nnew Figura(); // Error: no se puede instanciar una clase abstracta\nnew Circulo(5).describir(); // válido\n</script>",
  "anotaciones": [
    { "fragmento": "abstract class Figura {", "nota": "Una clase abstract nunca se instancia directamente — solo sirve como base para que otras clases la extiendan e implementen lo que falta." },
    { "fragmento": "abstract calcularArea(): number;", "nota": "Un método abstract no tiene cuerpo — declara la firma obligatoria que CUALQUIER subclase concreta tiene que implementar." },
    { "fragmento": "describir(): string {\n    return `Área: ${this.calcularArea()}`;\n  }", "nota": "describir() SÍ tiene implementación completa en la clase base, y puede usar calcularArea() aunque no sepa cómo la implementará cada subclase concreta." }
  ]
}
```

## implements: cumplir un contrato sin heredar comportamiento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ninterface Serializable {\n  serializar(): string;\n}\n\nclass Usuario implements Serializable {\n  constructor(private nombre: string) {}\n\n  serializar(): string {\n    return JSON.stringify({ nombre: this.nombre });\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "class Usuario implements Serializable {", "nota": "implements obliga a que Usuario cumpla la forma completa de Serializable — pero, a diferencia de extends, Serializable no aporta ningún código, solo el contrato que hay que cumplir." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Intentar instanciar una clase abstracta directamente.", "texto": "new Figura() da un error de compilación siempre — las clases abstractas solo existen para ser extendidas." },
    { "titulo": "Olvidar implementar un método abstract en una subclase concreta.", "texto": "Una clase que extiende una abstracta y no implementa TODOS sus métodos abstract sigue siendo, ella misma, abstracta implícitamente — o da un error si se intenta instanciar sin marcarla también como abstract." },
    { "titulo": "Confundir implements con extends.", "texto": "extends hereda comportamiento real de otra clase; implements solo obliga a cumplir la forma de una interfaz, sin heredar ningún código." }
  ]
}
```

## Ejercicios

1. Escribe una clase abstracta `Animal` con un método abstracto `hacerSonido(): string` y un método concreto `presentarse()` que lo use.
2. Escribe dos subclases concretas de `Animal` (por ejemplo, `Perro` y `Gato`) que implementen `hacerSonido`.
3. Escribe una interfaz `Imprimible` con un método `imprimir(): void`, y una clase que la implemente con `implements`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Classes",
      "descripcion": "Capítulo del Handbook sobre clases abstractas e implements.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/classes.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
