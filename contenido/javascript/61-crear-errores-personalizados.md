# Crear errores personalizados

- **Módulo:** Manejo de errores
- **Slug:** `crear-errores-personalizados` (autogenerado del título)
- **Orden:** 182
- **Fuentes:** [Error (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) — ver `contenido/javascript/TEMARIO.md` #61

---

## Qué es y para qué sirve

Cierra el módulo de manejo de errores. `Error` es, por dentro, una clase normal — y `extends` (visto en el módulo de clases) funciona exactamente igual sobre ella: crear tipos de error propios, distinguibles con `instanceof`, con la información extra que haga falta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita algo más específico que Error genérico",
  "roles": [
    { "etiqueta": "Quien extiende Error", "rol": "class MiError extends Error", "descripcion": "El mismo mecanismo de herencia de clases — super(mensaje) delega en el constructor de Error." },
    { "etiqueta": "Quien distingue tipos de error", "rol": "instanceof", "descripcion": "Permite reaccionar de forma distinta según qué tipo de error ocurrió, no con un catch genérico para todo." },
    { "etiqueta": "Quien conserva el error original", "rol": "{ cause: errorOriginal }", "descripcion": "Guarda el motivo real de un error al relanzar uno nuevo más genérico." }
  ]
}
```

## Extender Error: el mismo mecanismo de siempre

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class ErrorDeValidacion extends Error {\n    constructor(mensaje) {\n      super(mensaje); // delega en el constructor de Error\n      this.name = 'ErrorDeValidacion';\n    }\n  }\n\n  const error = new ErrorDeValidacion('El campo email es obligatorio');\n  console.log(error.name);    // 'ErrorDeValidacion'\n  console.log(error.message); // 'El campo email es obligatorio'\n</script>",
  "anotaciones": [
    { "fragmento": "super(mensaje); // delega en el constructor de Error", "nota": "extends Error hereda todo el comportamiento normal de un error — super(mensaje) delega en el constructor de Error, que es quien realmente asigna this.message." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "this.name no se asigna solo",
  "contenido": "Sin this.name = 'ErrorDeValidacion', el error seguiría mostrando name: 'Error' — el genérico heredado de Error.prototype. Asignarlo explícitamente es lo que distingue un tipo de error personalizado del resto, a simple vista."
}
```

## Distinguir tipos de error con instanceof

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  function validarFormulario(datos) {\n    if (!datos.email) {\n      throw new ErrorDeValidacion('El campo email es obligatorio');\n    }\n  }\n\n  try {\n    validarFormulario({});\n  } catch (error) {\n    if (error instanceof ErrorDeValidacion) {\n      console.log('Error de validación:', error.message);\n    } else {\n      throw error; // no es el tipo esperado — que siga propagándose\n    }\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "if (error instanceof ErrorDeValidacion) {", "nota": "instanceof (visto en el módulo de clases) permite distinguir un ErrorDeValidacion de cualquier otro tipo de error — reaccionar de forma distinta según qué salió mal, en vez de un catch genérico para todo." }
  ]
}
```

## Más allá de message: propiedades propias

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  class ErrorDeValidacion extends Error {\n    constructor(mensaje, campo) {\n      super(mensaje);\n      this.name = 'ErrorDeValidacion';\n      this.campo = campo; // información propia, más allá de message\n    }\n  }\n\n  try {\n    throw new ErrorDeValidacion('Formato de email inválido', 'email');\n  } catch (error) {\n    console.log(`Problema en el campo \"${error.campo}\": ${error.message}`);\n  }\n</script>",
  "anotaciones": [
    { "fragmento": "this.campo = campo; // información propia, más allá de message", "nota": "Una clase de error personalizada puede llevar CUALQUIER dato adicional que haga falta — no se limita a message, como un Error normal." }
  ]
}
```

## La opción cause: no perder el error original

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n  try {\n    guardarUsuario(datos);\n  } catch (errorOriginal) {\n    throw new Error('No se pudo completar el registro', { cause: errorOriginal });\n  }\n\n  // más adelante, en otro catch:\n  // console.log(error.cause); // el error original, sin perderlo\n</script>",
  "anotaciones": [
    { "fragmento": "throw new Error('No se pudo completar el registro', { cause: errorOriginal });", "nota": "La opción cause (segundo argumento de new Error()) guarda el error ORIGINAL que provocó este nuevo error — útil para no perder el contexto real cuando se relanza un error más genérico o más legible para quien lo recibe." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<script>\n  class ErrorDeRed extends Error {\n    constructor(mensaje) {\n      super(mensaje);\n      this.name = 'ErrorDeRed';\n    }\n  }\n\n  const error = new ErrorDeRed('Sin conexión');\n\n  console.log(error instanceof ErrorDeRed);\n  console.log(error instanceof Error);\n</script>",
  "opciones": [
    "true y true — un ErrorDeRed es, a la vez, una instancia de su propia clase y de Error, exactamente como cualquier subclase con extends",
    "true y false — extender Error no mantiene ninguna relación real con la clase original",
    "false y true — instanceof no funciona sobre clases de error personalizadas"
  ],
  "correcta": 0,
  "explicacion": "extends Error (el mismo mecanismo de herencia visto en el módulo de clases) conecta ErrorDeRed.prototype con Error.prototype — una instancia de ErrorDeRed es, a la vez, instancia de ErrorDeRed Y de Error. Ambas comprobaciones con instanceof dan true."
}
```

## Lo que un error personalizado NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una clase de error personalizada pierde su relación con Error al extenderla",
      "realidad": "Sigue siendo instanceof Error también — el mismo mecanismo de herencia de cualquier subclase."
    },
    {
      "mito": "this.name se asigna automáticamente al nombre de la clase al extender Error",
      "realidad": "Hay que asignarlo explícitamente en el constructor, o se queda con el genérico 'Error' heredado."
    },
    {
      "mito": "Un error personalizado solo puede llevar message, igual que un Error normal",
      "realidad": "Puede añadir cualquier propiedad extra que haga falta, como campo en el ejemplo."
    },
    {
      "mito": "La opción cause sustituye al mensaje del error, en vez de añadir información",
      "realidad": "Se guarda como una propiedad aparte (error.cause), sin tocar message."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar asignar this.name en el constructor de una clase de error personalizada.", "texto": "Sin él, el error muestra el genérico 'Error' en vez del tipo específico." },
    { "titulo": "Usar un catch genérico para todo, en vez de distinguir tipos con instanceof.", "texto": "Impide reaccionar de forma distinta según qué salió mal realmente." },
    { "titulo": "No aprovechar propiedades adicionales en un error personalizado.", "texto": "message no tiene por qué ser la única información útil del error." },
    { "titulo": "Perder el error original al relanzar uno nuevo.", "texto": "La opción cause evita esa pérdida de contexto." }
  ]
}
```

## Ejercicios

1. Crea una clase de error personalizada que extienda `Error`, con su propio `this.name`.
2. Lánzala y captúrala, comprobando con `instanceof` que es tanto de su propia clase como de `Error`.
3. Añade una propiedad adicional a tu error personalizado, más allá de `message`.
4. Relanza un error nuevo conservando el original con la opción `cause`, y accede a él desde `error.cause`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Error",
      "descripcion": "Referencia de MDN sobre extender Error con class, super(mensaje), this.name, propiedades adicionales, y la opción cause.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
      "etiqueta": "MDN"
    }
  ]
}
```
