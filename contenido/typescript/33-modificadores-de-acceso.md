# Modificadores de acceso: public, private, protected

- **Módulo:** Clases tipadas
- **Slug:** `modificadores-de-acceso` (autogenerado del título)
- **Orden:** 330
- **Fuentes:** [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) — ver `contenido/typescript/TEMARIO.md` #33

---

## Qué es y para qué sirve

Los modificadores de acceso controlan desde dónde se puede usar una propiedad o método de una clase. `public` (el valor por defecto) permite el acceso desde cualquier parte; `private` lo restringe a la propia clase; `protected` lo permite también en clases que la extiendan. A diferencia de los campos privados nativos de JavaScript (`#nombre`), estas restricciones solo existen en tiempo de COMPILACIÓN — el JavaScript generado no las aplica de verdad.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass CuentaBancaria {\n  private saldo: number;\n\n  constructor(saldoInicial: number) {\n    this.saldo = saldoInicial;\n  }\n\n  depositar(cantidad: number): void {\n    this.saldo += cantidad; // válido: dentro de la propia clase\n  }\n\n  consultarSaldo(): number {\n    return this.saldo;\n  }\n}\n\nconst cuenta = new CuentaBancaria(100);\ncuenta.depositar(50);\ncuenta.saldo; // Error: saldo es private, no accesible desde fuera\n</script>",
  "anotaciones": [
    { "fragmento": "private saldo: number;", "nota": "saldo solo se puede leer o escribir desde DENTRO de CuentaBancaria — cualquier acceso desde fuera es un error de compilación." },
    { "fragmento": "cuenta.saldo; // Error: saldo es private, no accesible desde fuera", "nota": "Este error existe solo en TypeScript — el JavaScript compilado tiene saldo como una propiedad normal, accesible sin ninguna restricción real. private es una disciplina que impone el compilador, no el motor de JavaScript." }
  ]
}
```

## protected: visible también para las clases hijas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nclass Empleado {\n  protected salario: number;\n\n  constructor(salario: number) {\n    this.salario = salario;\n  }\n}\n\nclass Gerente extends Empleado {\n  darBono(): void {\n    this.salario += 1000; // válido: protected es accesible desde una subclase\n  }\n}\n\nconst gerente = new Gerente(3000);\ngerente.salario; // Error: protected sigue sin ser accesible desde fuera\n</script>",
  "anotaciones": [
    { "fragmento": "protected salario: number;", "nota": "protected es un punto intermedio entre public y private: accesible dentro de la propia clase Y de cualquier clase que la extienda, pero no desde fuera de esa jerarquía." }
  ]
}
```

## Lo que private no es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "private oculta la propiedad en tiempo de ejecución, como los campos # nativos",
      "realidad": "private es solo una comprobación del compilador — el JavaScript generado sigue teniendo la propiedad accesible con normalidad. Los campos privados nativos de JavaScript (#saldo) sí ocultan de verdad en tiempo de ejecución, y funcionan de forma complementaria (se pueden usar los dos a la vez, aunque el propio #saldo ya implica un private real)."
    },
    {
      "mito": "public hay que escribirlo siempre para que una propiedad sea accesible desde fuera",
      "realidad": "public es el modificador por defecto — una propiedad sin ningún modificador ya es pública. Escribirlo explícitamente es opcional, solo aporta claridad para quien lea el código."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confiar en private para ocultar información sensible de verdad.", "texto": "Como la restricción no existe en el JavaScript generado, cualquiera con acceso al objeto compilado puede leer o modificar la propiedad — para privacidad REAL en tiempo de ejecución hace falta el campo nativo #nombre." },
    { "titulo": "Olvidar que protected no da acceso desde fuera de la jerarquía de clases.", "texto": "protected solo amplía el acceso a subclases — sigue sin ser visible para código externo a la jerarquía, igual que private." }
  ]
}
```

## Ejercicios

1. Escribe una clase `Vehiculo` con una propiedad `protected kilometraje: number` y una subclase `Coche` que la modifique en un método.
2. Explica la diferencia práctica entre `private` y los campos privados nativos de JavaScript (`#nombre`).
3. ¿Por qué `cuenta.saldo` da un error de compilación, pero el JavaScript resultante sigue teniendo esa propiedad accesible?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Classes",
      "descripcion": "Capítulo del Handbook sobre modificadores de visibilidad en clases.",
      "url": "https://www.typescriptlang.org/docs/handbook/2/classes.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
