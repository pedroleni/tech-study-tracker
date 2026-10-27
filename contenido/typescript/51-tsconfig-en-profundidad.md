# tsconfig.json en profundidad: strict, target, module, lib

- **Módulo:** Módulos, declaraciones y configuración
- **Slug:** `tsconfig-en-profundidad` (autogenerado del título)
- **Orden:** 510
- **Fuentes:** [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) + [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) — ver `contenido/typescript/TEMARIO.md` #51

---

## Qué es y para qué sirve

La lección 2 mostró un `tsconfig.json` mínimo. Esta lección profundiza en las cuatro opciones que más afectan al comportamiento real del compilador: qué comprobaciones activa `strict`, qué versión de JavaScript genera `target`, qué formato de módulos usa `module`, y qué APIs conoce `lib` — la misma opción que el editor en vivo de este curso configura internamente para saber que `document.querySelector` existe. Después, qué valores toman las opciones cuando no las escribes, qué genera `tsc --init` y qué opciones antiguas ha eliminado TypeScript 7.

## strict: un interruptor que activa varias comprobaciones a la vez

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que strict activa de golpe",
  "roles": [
    { "etiqueta": "strictNullChecks", "rol": "null/undefined no se cuelan en cualquier tipo", "descripcion": "Ya visto en la lección 6 — sin esto, cualquier tipo admitiría null o undefined sin ningún aviso." },
    { "etiqueta": "noImplicitAny", "rol": "Un parámetro sin tipo es un error, no any silencioso", "descripcion": "Obliga a anotar explícitamente los parámetros de función en vez de dejar que se conviertan en any por defecto." },
    { "etiqueta": "strictPropertyInitialization", "rol": "Las propiedades de clase deben inicializarse", "descripcion": "Ya visto en la lección 32 — una propiedad sin inicializar ni en su declaración ni en el constructor da un error." },
    { "etiqueta": "strictFunctionTypes", "rol": "Comprobación más precisa de la compatibilidad de funciones", "descripcion": "Detecta casos límite donde asignar una función a un tipo de función distinto podría ser inseguro, algo que sin este flag pasaría sin aviso." }
  ]
}
```

## target: a qué versión de JavaScript se compila

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "target decide qué sintaxis moderna se transforma",
  "contenido": "Con target: 'ES2015', una función async/await se REESCRIBE con generadores y una función auxiliar, __awaiter: las 4 líneas de abajo se convierten en 15. Con target: 'ES2017' o más reciente, async/await se deja tal cual, porque se asume que el entorno de ejecución ya lo soporta. Un target más moderno de lo que soporta tu público puede dar código que no funcione en navegadores antiguos; uno más antiguo de lo necesario, código más grande y menos legible sin ninguna ganancia."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// Entrada (TypeScript):\nexport async function cargar(url: string): Promise<string> {\n  const respuesta = await fetch(url);\n  return respuesta.text();\n}\n\n// Salida con target: 'ES2015' (JavaScript generado, tal cual):\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nexport function cargar(url) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const respuesta = yield fetch(url);\n        return respuesta.text();\n    });\n}\n</script>",
  "anotaciones": [
    { "fragmento": "var __awaiter = (this && this.__awaiter) ||", "nota": "La función auxiliar que imita async/await con promesas y generadores. tsc la añade a cada fichero que la necesite (salvo que uses importHelpers con la librería tslib)." },
    { "fragmento": "return __awaiter(this, void 0, void 0, function* () {", "nota": "La función async se convierte en una función normal que delega en __awaiter con un generador (function*)." },
    { "fragmento": "const respuesta = yield fetch(url);", "nota": "Cada await pasa a ser un yield. Con target: 'ES2017' o posterior, la salida es la misma función de la entrada, solo sin las anotaciones de tipo. Comprobado con TypeScript 6.0.3 y 7.0.2: el JavaScript generado es idéntico en las dos." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "ES5 ya no existe en TypeScript 7",
  "contenido": "Hasta TypeScript 5 era habitual compilar a target: 'ES5' para navegadores muy antiguos. La 6.0 lo marcó como obsoleto (error TS5107, que en la 6 aún se puede silenciar con \"ignoreDeprecations\": \"6.0\") y la 7 lo ha eliminado: TS5108: Option 'target=ES5' has been removed. Please remove it from your configuration. El target más bajo que acepta la 7 es ES2015. Si un tutorial antiguo te propone ES5, cámbialo."
}
```

## lib: qué APIs conoce el compilador

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"]\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"]", "nota": "lib no cambia qué código se GENERA — solo qué declaraciones de tipo conoce el compilador. Sin 'DOM' en esta lista, usar document o window daría un error de \"no se encuentra el nombre\", aunque el código funcionara perfectamente en un navegador real: el compilador simplemente no sabría que esas APIs existen." }
  ]
}
```

## Lo que vale cada opción si no la escribes

Un `tsconfig.json` con `"compilerOptions": {}` no está vacío de verdad: cada opción tiene su valor por defecto, y TypeScript 6.0 los cambió para que un proyecto nuevo arranque con lo recomendado. TypeScript 7 mantiene los mismos. Comprobado con un `tsconfig.json` vacío en las dos versiones (6.0.3 y 7.0.2):

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "strict: true", "texto": "Desde TypeScript 6.0, un tsconfig.json que no dice nada de strict ya es estricto: function f(x) { return x } da TS7006, Parameter 'x' implicitly has an 'any' type. Escribirlo igualmente deja claro que lo quieres; para desactivarlo hay que escribir strict: false." },
    { "titulo": "target: ES2025", "texto": "Sin target, el compilador apunta a ES2025, y con él carga las declaraciones de ES2025 (y las del DOM, mientras no escribas lib)." },
    { "titulo": "module: esnext y moduleResolution: bundler", "texto": "El JavaScript de salida conserva import/export, y los imports se resuelven como lo hace un bundler (Vite, esbuild): import { doble } from './util' funciona sin extensión. La lección 49 explica cuándo conviene otra cosa." },
    { "titulo": "types: []", "texto": "Los paquetes @types que declaran globales, como @types/node, no se cargan solos: hay que pedirlos con \"types\": [\"node\"]. Sin eso, process da TS2591 (lección 50). Los @types de una librería que importas se siguen encontrando solos." },
    { "titulo": "rootDir: la carpeta del tsconfig.json", "texto": "Si usas outDir y tu código está en src, tienes que escribir rootDir: \"./src\". Si no, el compilador se niega: TS5011, The common source directory of 'tsconfig.json' is './src'. The 'rootDir' setting must be explicitly set to this or another path to adjust your output's file layout." }
  ]
}
```

## Lo que genera `tsc --init`

`npx tsc --init` escribe un `tsconfig.json` con estas opciones activadas, más otras comentadas con una explicación corta para activarlas si las necesitas. La 6.0.3 y la 7.0.2 generan exactamente el mismo fichero:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\n// tsconfig.json generado por npx tsc --init (sin sus comentarios)\n{\n  \"compilerOptions\": {\n    \"module\": \"nodenext\",\n    \"target\": \"esnext\",\n    \"types\": [],\n    \"sourceMap\": true,\n    \"declaration\": true,\n    \"declarationMap\": true,\n    \"noUncheckedIndexedAccess\": true,\n    \"exactOptionalPropertyTypes\": true,\n    \"strict\": true,\n    \"jsx\": \"react-jsx\",\n    \"verbatimModuleSyntax\": true,\n    \"isolatedModules\": true,\n    \"noUncheckedSideEffectImports\": true,\n    \"moduleDetection\": \"force\",\n    \"skipLibCheck\": true,\n  }\n}\n</script>",
  "anotaciones": [
    { "fragmento": "\"module\": \"nodenext\",", "nota": "Pensado para un programa que ejecuta Node.js. En un proyecto con Vite u otro bundler se cambia por \"module\": \"esnext\" (o se borra, porque es el valor por defecto) — la lección 49 lo explica." },
    { "fragmento": "\"target\": \"esnext\",", "nota": "La versión más reciente de JavaScript: no reescribe ninguna sintaxis moderna." },
    { "fragmento": "\"types\": [],", "nota": "El mismo valor que por defecto, escrito para que se vea. El propio fichero trae comentada la línea \"types\": [\"node\"] para un proyecto de Node, con su npm install -D @types/node." },
    { "fragmento": "\"noUncheckedIndexedAccess\": true,", "nota": "Más estricto que strict: lista[0] pasa a ser del tipo del elemento | undefined, porque el índice puede no existir." },
    { "fragmento": "\"exactOptionalPropertyTypes\": true,", "nota": "Una propiedad opcional (nombre?: string) se puede omitir, pero no se le puede asignar undefined a mano." },
    { "fragmento": "\"verbatimModuleSyntax\": true,", "nota": "Obliga a escribir import type para lo que solo son tipos, de modo que cualquier herramienta pueda borrar esos imports sin entender el resto del programa." },
    { "fragmento": "\"skipLibCheck\": true,", "nota": "No revisa los .d.ts de las dependencias: compila más rápido, y los errores de otros paquetes no te bloquean." }
  ]
}
```

## Opciones que TypeScript 7 ha eliminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Lo que la 6.0 avisaba, la 7 lo rechaza", "texto": "En TypeScript 6.0, estas opciones dan errores de «obsoleta» (TS5101 o TS5107) que se pueden silenciar con \"ignoreDeprecations\": \"6.0\". En la 7 son TS5102 o TS5108, «has been removed», y ignoreDeprecations ya no sirve: hay que quitarlas del tsconfig.json. Las verás en proyectos y tutoriales antiguos." },
    { "titulo": "target: \"ES5\" y downlevelIteration", "texto": "TS5108: Option 'target=ES5' has been removed. y TS5102: Option 'downlevelIteration' has been removed. El target mínimo es ES2015." },
    { "titulo": "moduleResolution: \"node\" (o \"node10\") y \"classic\"", "texto": "TS5108: Option 'moduleResolution=node10' has been removed. Se usa bundler (el valor por defecto) o nodenext, según el proyecto (lección 49)." },
    { "titulo": "module: \"amd\", \"umd\" o \"system\", y outFile", "texto": "TS5108: Option 'module=AMD' has been removed. (y lo mismo con UMD y System), y TS5102: Option 'outFile' has been removed. Juntar todo en un único fichero es hoy trabajo de un bundler." },
    { "titulo": "baseUrl", "texto": "TS5102: Option 'baseUrl' has been removed. El propio mensaje propone la alternativa: Use '\"paths\": {\"*\": [\"./src/*\"]}' instead., es decir, paths con rutas que empiezan por ./." },
    { "titulo": "esModuleInterop: false", "texto": "TS5108: Option 'esModuleInterop=false' has been removed. Ya no se puede desactivar: basta con borrar la línea." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Desactivar strict en un proyecto nuevo \"para que compile antes\".", "texto": "strict: true es la recomendación oficial y, desde TypeScript 6.0, el valor por defecto — escribir strict: false renuncia a la mayoría de las comprobaciones que hacen valioso usar TypeScript en primer lugar." },
    { "titulo": "Copiar un tsconfig.json antiguo con target ES5, baseUrl o moduleResolution node.", "texto": "Con TypeScript 7 no compila: cada una de esas opciones da un error de opción eliminada (TS5102 o TS5108) antes de mirar ni una línea de tu código. Quítalas, o cámbialas por su sustituta: un target de ES2015 o posterior, paths en vez de baseUrl, bundler o nodenext en vez de node." },
    { "titulo": "Omitir 'DOM' de lib en un proyecto que sí corre en el navegador.", "texto": "Da errores de \"no se encuentra el nombre 'document'\" (o similar) aunque el código sea perfectamente correcto — el problema no es el código, es que el compilador no tiene declaradas esas APIs." }
  ]
}
```

## Ejercicios

1. Explica qué comprobación añade `strictNullChecks` que no existiría sin `strict` activo.
2. ¿Por qué elegir un `target` demasiado antiguo puede generar código innecesariamente grande?
3. Un proyecto que usa `fetch` y `Promise` pero da un error de "no se encuentra el nombre 'fetch'" — ¿qué opción del `tsconfig.json` es la primera sospechosa?
4. Heredas un `tsconfig.json` con `"baseUrl": "./src"` y `"target": "ES5"`. ¿Qué te dice TypeScript 7 de cada una, y por qué cambiarlas?
5. Tu `tsconfig.json` no menciona `strict`. ¿Está activado? ¿Cómo lo compruebas con una función de una línea?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "TSConfig Reference",
      "descripcion": "Referencia completa y oficial de todas las opciones de tsconfig.json.",
      "url": "https://www.typescriptlang.org/tsconfig/",
      "etiqueta": "TypeScript"
    },
    {
      "titulo": "Choosing Compiler Options",
      "descripcion": "Guía oficial sobre cómo elegir target, module y moduleResolution según el entorno real del proyecto.",
      "url": "https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
