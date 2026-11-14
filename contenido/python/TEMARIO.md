# Temario de Python — planteado desde cero

**Alcance:** temario completo de una tecnología "Python" nueva en el
catálogo, hermana de `contenido/javascript/TEMARIO.md`,
`contenido/typescript/TEMARIO.md` y `contenido/nodejs/TEMARIO.md`. Mismo
criterio de fondo: nada de memoria, todo verificado en vivo el
2026-11-14 (versiones consultadas en python.org, PyPI y npm; cada URL de
la columna «Fuentes» comprobada con respuesta 200 ese día). No existe
ninguna lección de Python en producción todavía: este documento es el
plan a aprobar antes de escribir la primera.

**Desde cero de verdad.** A diferencia de TypeScript (que da por
aprendido JavaScript), este temario no supone ningún lenguaje previo:
Python es, para mucha gente, el primero. Para quien ya viene de las
fichas de JavaScript o Node.js, las lecciones donde Python se comporta
distinto llevan un apartado corto **«Si vienes de JavaScript»** (la
indentación como sintaxis, `None` frente a `null`/`undefined`, la
división `/` frente a `//`, la verdad de las colecciones vacías, los
argumentos por defecto mutables, `is` frente a `==`...). Es un apartado,
no la columna vertebral: la lección se entiende sin él.

## Versiones de referencia (verificadas el 2026-11-14)

- **Python 3.15.2.** La 3.15.0 final salió en octubre de 2026
  ([anuncio](https://discuss.python.org/t/python-3-15-0-final-is-here/109415),
  [What's New in 3.15](https://docs.python.org/3/whatsnew/3.15.html)).
  Lo que cambia respecto a lo que se suele encontrar en tutoriales, y
  que este temario enseña donde toca:
  - **Imports perezosos explícitos** ([PEP 810](https://peps.python.org/pep-0810/)).
  - **`frozendict`** como tipo integrado ([PEP 814](https://peps.python.org/pep-0814/))
    y **`sentinel`** ([PEP 661](https://peps.python.org/pep-0661/)).
  - **UTF-8 por defecto** al abrir ficheros sin `encoding`
    ([PEP 686](https://peps.python.org/pep-0686/)): el ejemplo clásico de
    «en Windows se rompen las tildes» deja de reproducirse.
  - **Desempaquetado en comprensiones** ([PEP 798](https://peps.python.org/pep-0798/)).
  - **Paquete `profiling`** con el perfilador por muestreo Tachyon
    ([`profiling.sampling`](https://docs.python.org/3/library/profiling.sampling.html));
    `cProfile` sigue disponible.
  - Mensajes de error mejorados otra vez, nuevo módulo `math.integer`,
    JIT experimental más rápido (sigue desactivado por defecto).
- **Python 3.14** (octubre de 2025, sigue en soporte) trajo lo que
  muchos tutoriales aún no cuentan: **t-strings**
  ([PEP 750](https://peps.python.org/pep-0750/),
  [`string.templatelib`](https://docs.python.org/3/library/string.templatelib.html)),
  **anotaciones diferidas** ([PEP 649](https://peps.python.org/pep-0649/),
  [`annotationlib`](https://docs.python.org/3/library/annotationlib.html))
  y el **build sin GIL soportado oficialmente**
  ([PEP 779](https://peps.python.org/pep-0779/),
  [guía oficial](https://docs.python.org/3/howto/free-threading-python.html)).
- **Pyodide 314.0.8** (npm `pyodide@latest`, 2026-11-13): Python
  **3.14** compilado a WebAssembly. Es el motor del editor en vivo de
  esta ficha (ver «Componentes propios»). Desde la 314 sigue la
  numeración de Python: la 315 (Python 3.15) está en alfa
  (`pyodide@next` → `315.0.0-alpha.2`). **Consecuencia directa:** las
  novedades exclusivas de la 3.15 (lazy imports, `frozendict`,
  `sentinel`, desempaquetado en comprensiones) no se pueden ejecutar en
  el navegador todavía. Esas lecciones van con código anotado y una
  nota visible; cuando salga Pyodide 315 estable se convierten en
  ejercicios en vivo (está en «Pendiente»).
- **Herramientas** (PyPI, 2026-11-14): `uv` 0.13.8, `ruff` 0.17.5,
  `pytest` 9.2.0, `mypy` 2.4.1. `ty` (el comprobador de tipos de Astral)
  sigue en 0.0.x: se menciona como alternativa en desarrollo, la
  lección enseña con `mypy`.

## De dónde sale el contenido

Python, como TypeScript o React, tiene una documentación oficial única y
muy completa. La lista de fuentes es corta a propósito:

- **[El tutorial oficial](https://docs.python.org/3/tutorial/index.html)**
  (sus 16 capítulos, índice verificado el 2026-11-14): columna vertebral
  de los módulos 1 a 9.
- **[Referencia de la biblioteca estándar](https://docs.python.org/3/library/index.html)**
  y **[del lenguaje](https://docs.python.org/3/reference/index.html)**:
  una página por módulo; fuente principal desde el módulo 6.
- **[Los HOWTO oficiales](https://docs.python.org/3/howto/index.html)**
  (programación funcional, expresiones regulares, logging, asyncio,
  free-threading): para los temas que el tutorial solo roza.
- **[Las PEP](https://peps.python.org/)**, puntuales: la PEP 8 para el
  estilo y las de cada novedad para la versión exacta en la que llegó.
- **[typing.python.org](https://typing.python.org/en/latest/)** para el
  módulo de tipado.
- **Documentación de terceros, solo donde la biblioteca estándar no
  llega** (módulo 12): [uv](https://docs.astral.sh/uv/),
  [Ruff](https://docs.astral.sh/ruff/),
  [pytest](https://docs.pytest.org/en/stable/),
  [mypy](https://mypy.readthedocs.io/en/stable/) y la
  [Python Packaging User Guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/)
  para `pyproject.toml`.

## Decisiones de alcance (tomadas por Claude, pendientes de tu visto bueno)

- **El ecosistema grande, en fichas propias.** Igual que con React
  (React Router, TanStack Query y Testing van aparte), aquí quedan fuera
  y se proponen como fichas futuras: **análisis de datos** (NumPy,
  pandas, Polars), **web** (FastAPI, Django) y **automatización**
  (scraping, Playwright). Esta ficha es el lenguaje y su biblioteca
  estándar, más las herramientas sin las que hoy no se trabaja (uv,
  Ruff, pytest, mypy).
- **uv como herramienta principal, `venv` + `pip` explicados.** uv es lo
  que se usa hoy para crear proyectos, fijar versiones de Python y
  gestionar dependencias; pero `venv` y `pip` son la base estándar y
  aparecen en cualquier proyecto heredado, así que tienen su lección
  (46) antes de la de uv (66).
- **Python 2 no existe en este temario.** Solo una mención en la
  lección 1 para reconocer código antiguo (`print "hola"`).
- **Concurrencia sin hilos en vivo.** Pyodide no puede crear hilos ni
  procesos: las lecciones de hilos, procesos y free-threading van con
  código anotado y el ejercicio se hace en local. `asyncio` sí funciona
  en el navegador (Pyodide lo conecta al bucle de eventos de la página)
  y es en vivo.

## Convenciones compartidas con el resto de temarios

- **La plantilla de 7 secciones es un mínimo, no un techo.** `Qué es y
  para qué sirve` / `Cuándo lo usarías de verdad` / `Cómo se usa` /
  secciones propias cuando el tema tenga subtemas con peso real / `Lo
  que [X] no es` (opcional) / `Errores típicos` / `Ejercicios` / `Para
  profundizar`.
- **Editor en vivo por defecto.** Al revés que en TypeScript: en Python
  casi todo se aprende ejecutando y mirando la salida, así que el bloque
  principal es `python-en-vivo` (columna «En vivo» = ✅). `📝` marca las
  lecciones con código anotado, con el motivo.
- **`predice-el-resultado` se usa mucho**: muchas trampas de Python son
  de «¿qué imprime esto?» (aliasing de listas, argumento por defecto
  mutable, `is` con enteros pequeños, closures en bucles, `0.1 + 0.2`).
- **`notas-clave`** reservado para «Errores típicos», máximo uno por
  lección.
- Validar cada lección con el pipeline de siempre: JSON de cada bloque
  contra el Zod real, `npx vitest run`, `npm run build`, `npm run lint`,
  borrador en producción, verificación visual en los dos temas y sin
  errores de consola; y además, **todo ejemplo ejecutado de verdad en
  Pyodide 314** (los de 3.15, en CPython 3.15.2 local).

## Componentes propios para esta documentación

Hoy el catálogo ejecuta JavaScript, TypeScript, SQL (sql.js),
PostgreSQL (PGlite) y React en el navegador, pero no Python. Esta ficha
necesita un componente nuevo; su especificación va en
`specs/features/python-en-vivo.md` (por escribir, ver «Pendiente») y se
implementa antes de publicar la primera lección con ✅.

1. **`python-en-vivo`** (imprescindible). Editor CodeMirror
   (`@codemirror/lang-python`) + Pyodide 314 en un **Web Worker**, con
   el runtime servido desde `public/vendor/` igual que el de
   `react-en-vivo` (para que la CI de seguridad pase y no dependa de un
   CDN). Panel de salida con `stdout` y `stderr` separados y el
   traceback con la línea marcada en el editor. Botón «Detener»: un
   `while True` mata el worker, no la pestaña.
2. **`input()` de verdad** (imprescindible: el módulo 2 lo usa). Una
   caja de entrada en el panel de salida conectada al `stdin` de
   Pyodide.
3. **Comprobaciones ✅/❌** (imprescindible). El mismo esquema que en
   React: cada ejercicio trae funciones de comprobación en Python
   (`assert` con mensaje en español) que se ejecutan tras el código del
   alumno, sin que este las vea.
4. **Ficheros de ejercicio** (módulo 10). Precargar ficheros en el
   sistema de archivos en memoria de Pyodide (un CSV, un JSON) para que
   `open()` y `pathlib` funcionen sobre datos reales del ejercicio.
5. **Opcional: visualizador de referencias** (módulo 4, lección 23).
   Variables a la izquierda, objetos a la derecha y flechas: lo que hace
   Python Tutor, para entender aliasing y copias. Se decide tras una
   prueba rápida; sin él, la lección funciona con `predice-el-resultado`
   e `id()`.

**Fases:** (0) spec + prueba de Pyodide en un worker con stdin y
detener; (1) `python-en-vivo` + comprobaciones; (2) ficheros
precargados; (3) visualizador, si la prueba sale bien.

## Módulo 1 — Primeros pasos

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 1 | Qué es Python, para qué se usa y por qué es tan popular | [Whetting Your Appetite](https://docs.python.org/3/tutorial/appetite.html) + [PEP 20 — The Zen of Python](https://peps.python.org/pep-0020/) | ✅ |
| 2 | Instalar Python 3.15 y usar el intérprete interactivo (el REPL nuevo) | [Using the Python Interpreter](https://docs.python.org/3/tutorial/interpreter.html) + [Python Setup and Usage](https://docs.python.org/3/using/index.html) | 📝 instalación local |
| 3 | Tu primer programa: `print`, comentarios y ejecutar un script | [An Informal Introduction to Python](https://docs.python.org/3/tutorial/introduction.html) | ✅ |
| 4 | Variables, nombres y tipos dinámicos: en Python todo es un objeto | [An Informal Introduction](https://docs.python.org/3/tutorial/introduction.html) + [Data model](https://docs.python.org/3/reference/datamodel.html) | ✅ |
| 5 | La indentación es sintaxis, y el estilo de la PEP 8 | [PEP 8](https://peps.python.org/pep-0008/) | ✅ |

## Módulo 2 — Tipos básicos

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 6 | Números: `int`, `float`, operadores, `/` frente a `//` y `%` | [An Informal Introduction](https://docs.python.org/3/tutorial/introduction.html) + [Built-in Types](https://docs.python.org/3/library/stdtypes.html) | ✅ |
| 7 | Por qué `0.1 + 0.2 != 0.3`: `decimal` y `fractions` | [Floating-Point Arithmetic](https://docs.python.org/3/tutorial/floatingpoint.html) + [decimal](https://docs.python.org/3/library/decimal.html) + [fractions](https://docs.python.org/3/library/fractions.html) | ✅ |
| 8 | Booleanos, `None` y qué es «verdadero» en Python | [Built-in Types — Truth Value Testing](https://docs.python.org/3/library/stdtypes.html) | ✅ |
| 9 | Cadenas: índices, *slicing* e inmutabilidad | [An Informal Introduction — Text](https://docs.python.org/3/tutorial/introduction.html) | ✅ |
| 10 | Métodos de cadena y f-strings con formato | [Built-in Types — str](https://docs.python.org/3/library/stdtypes.html) + [Input and Output](https://docs.python.org/3/tutorial/inputoutput.html) | ✅ |
| 11 | `input()` y conversión de tipos: hablar con quien usa el programa | [Built-in Functions](https://docs.python.org/3/library/functions.html) | ✅ |
| 🧪 | **Proyecto en el navegador: conversor de unidades y calculadora de propinas** | Aplicación de los módulos 1 y 2 | ✅ |

## Módulo 3 — Control de flujo

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 12 | `if`, `elif`, `else` y la expresión condicional | [More Control Flow Tools](https://docs.python.org/3/tutorial/controlflow.html) | ✅ |
| 13 | `and`, `or`, `not`, cortocircuito y comparaciones encadenadas | [Built-in Types — Boolean Operations](https://docs.python.org/3/library/stdtypes.html) | ✅ |
| 14 | Bucles `while`: `break`, `continue` y el `else` de los bucles | [More Control Flow Tools](https://docs.python.org/3/tutorial/controlflow.html) | ✅ |
| 15 | Bucles `for`: `range`, `enumerate` y `zip` | [More Control Flow Tools](https://docs.python.org/3/tutorial/controlflow.html) + [Built-in Functions](https://docs.python.org/3/library/functions.html) | ✅ |
| 16 | `match`/`case`: *pattern matching* estructural | [More Control Flow Tools — match](https://docs.python.org/3/tutorial/controlflow.html) + [PEP 636 (tutorial)](https://peps.python.org/pep-0636/) | ✅ |
| 17 | El operador morsa `:=` | [PEP 572](https://peps.python.org/pep-0572/) | ✅ |

## Módulo 4 — Estructuras de datos

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 18 | Listas: crear, modificar y sus métodos | [Data Structures](https://docs.python.org/3/tutorial/datastructures.html) | ✅ |
| 19 | Tuplas y desempaquetado (con `*`) | [Data Structures — Tuples](https://docs.python.org/3/tutorial/datastructures.html) | ✅ |
| 20 | Diccionarios: claves, valores y cómo recorrerlos | [Data Structures — Dictionaries](https://docs.python.org/3/tutorial/datastructures.html) | ✅ |
| 21 | Conjuntos: pertenencia rápida y operaciones de conjuntos | [Data Structures — Sets](https://docs.python.org/3/tutorial/datastructures.html) | ✅ |
| 22 | Comprensiones de listas, diccionarios y conjuntos (y el desempaquetado de la 3.15) | [Data Structures — List Comprehensions](https://docs.python.org/3/tutorial/datastructures.html) + [PEP 798](https://peps.python.org/pep-0798/) | ✅ (la parte de 3.15: 📝) |
| 23 | Referencias, aliasing y copias: `is` frente a `==`, `copy` y `deepcopy` | [Data model — Objects](https://docs.python.org/3/reference/datamodel.html) + [copy](https://docs.python.org/3/library/copy.html) | ✅ |
| 24 | Mutables e inmutables: `frozenset`, `frozendict` (3.15) y por qué importa | [Built-in Types](https://docs.python.org/3/library/stdtypes.html) + [PEP 814](https://peps.python.org/pep-0814/) | ✅ (`frozendict`: 📝) |
| 25 | `collections`: `Counter`, `defaultdict`, `deque` y `namedtuple` | [collections](https://docs.python.org/3/library/collections.html) | ✅ |
| 🧪 | **Proyecto en el navegador: el ahorcado** | Aplicación de los módulos 3 y 4 | ✅ |

## Módulo 5 — Funciones

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 26 | Definir funciones: `def`, `return` y *docstrings* | [Defining Functions](https://docs.python.org/3/tutorial/controlflow.html) | ✅ |
| 27 | Argumentos posicionales, por nombre y por defecto (y la trampa del valor por defecto mutable) | [More on Defining Functions](https://docs.python.org/3/tutorial/controlflow.html) | ✅ |
| 28 | `*args`, `**kwargs` y parámetros solo posicionales o solo por nombre (`/` y `*`) | [Special parameters](https://docs.python.org/3/tutorial/controlflow.html) | ✅ |
| 29 | Ámbito de las variables: la regla LEGB, `global` y `nonlocal` | [Classes — Scopes and Namespaces](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 30 | Funciones como valores: `lambda`, `sorted(key=...)`, `map` y `filter` | [Functional Programming HOWTO](https://docs.python.org/3/howto/functional.html) | ✅ |
| 31 | Closures | [Functional Programming HOWTO](https://docs.python.org/3/howto/functional.html) + [Glossary](https://docs.python.org/3/glossary.html) | ✅ |
| 32 | Decoradores: envolver una función sin tocarla (`functools.wraps`) | [Glossary — decorator](https://docs.python.org/3/glossary.html) + [functools](https://docs.python.org/3/library/functools.html) | ✅ |
| 33 | Recursión y su límite | [sys — getrecursionlimit](https://docs.python.org/3/library/sys.html) | ✅ |
| 🧪 | **Proyecto en el navegador: analizador de texto (frecuencia de palabras, la más larga, resumen)** | Aplicación de los módulos 4 y 5 | ✅ |

## Módulo 6 — Iteradores y generadores

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 34 | El protocolo de iteración: qué hace de verdad un `for` | [Classes — Iterators](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 35 | Generadores con `yield` | [Classes — Generators](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 36 | Expresiones generadoras y evaluación perezosa | [Functional Programming HOWTO](https://docs.python.org/3/howto/functional.html) | ✅ |
| 37 | `itertools` y `functools`: `chain`, `groupby`, `partial` y `cache` | [itertools](https://docs.python.org/3/library/itertools.html) + [functools](https://docs.python.org/3/library/functools.html) | ✅ |

## Módulo 7 — Errores y excepciones

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 38 | Leer un *traceback* (y los mensajes de error mejorados) | [Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) + [What's New 3.15 — Improved error messages](https://docs.python.org/3/whatsnew/3.15.html) | ✅ |
| 39 | `try`, `except`, `else` y `finally` | [Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) | ✅ |
| 40 | Lanzar excepciones y crear las tuyas | [Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) + [Built-in Exceptions](https://docs.python.org/3/library/exceptions.html) | ✅ |
| 41 | `with` y los gestores de contexto (`contextlib`) | [contextlib](https://docs.python.org/3/library/contextlib.html) | ✅ |
| 42 | Grupos de excepciones y `except*` | [Errors and Exceptions — Raising and Handling Multiple Exceptions](https://docs.python.org/3/tutorial/errors.html) | ✅ |

## Módulo 8 — Módulos, paquetes y entornos

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 43 | `import` y espacios de nombres; `if __name__ == "__main__"` | [Modules](https://docs.python.org/3/tutorial/modules.html) | ✅ |
| 44 | Paquetes: carpetas, `__init__.py` e imports relativos | [Modules — Packages](https://docs.python.org/3/tutorial/modules.html) | 📝 varios ficheros |
| 45 | Paseo por la biblioteca estándar: `math`, `random`, `statistics`, `datetime` | [Brief Tour of the Standard Library](https://docs.python.org/3/tutorial/stdlib.html) + [parte II](https://docs.python.org/3/tutorial/stdlib2.html) | ✅ |
| 46 | Entornos virtuales con `venv` y paquetes con `pip` | [Virtual Environments and Packages](https://docs.python.org/3/tutorial/venv.html) + [venv](https://docs.python.org/3/library/venv.html) + [Installing Packages](https://packaging.python.org/en/latest/tutorials/installing-packages/) | 📝 terminal local |
| 47 | Imports perezosos (3.15): arrancar más rápido | [PEP 810](https://peps.python.org/pep-0810/) + [What's New 3.15](https://docs.python.org/3/whatsnew/3.15.html) | 📝 3.15 |

## Módulo 9 — Programación orientada a objetos

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 48 | Clases y objetos: `__init__` y `self` | [Classes](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 49 | Atributos de clase frente a atributos de instancia | [Classes — Class and Instance Variables](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 50 | Métodos especiales: `__repr__`, `__eq__`, `__len__` y compañía | [Data model — Special method names](https://docs.python.org/3/reference/datamodel.html) | ✅ |
| 51 | Propiedades con `@property` | [Built-in Functions — property](https://docs.python.org/3/library/functions.html) | ✅ |
| 52 | Herencia, `super()` y el orden de resolución de métodos | [Classes — Inheritance](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 53 | Composición frente a herencia | [Classes](https://docs.python.org/3/tutorial/classes.html) | ✅ |
| 54 | `dataclasses`: clases de datos sin escribir el `__init__` | [dataclasses](https://docs.python.org/3/library/dataclasses.html) | ✅ |
| 55 | `enum` y `sentinel` (3.15): valores con nombre | [enum](https://docs.python.org/3/library/enum.html) + [PEP 661](https://peps.python.org/pep-0661/) | ✅ (`sentinel`: 📝) |
| 56 | *Duck typing*, clases abstractas (`abc`) y protocolos | [abc](https://docs.python.org/3/library/abc.html) + [typing — Protocol](https://docs.python.org/3/library/typing.html) | ✅ |
| 🧪 | **Proyecto en el navegador: gestor de tareas con clases** | Aplicación de los módulos 5 a 9 | ✅ |

## Módulo 10 — Ficheros y formatos de datos

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 57 | Leer y escribir ficheros con `open()` y codificaciones (UTF-8 por defecto desde la 3.15) | [Input and Output — Reading and Writing Files](https://docs.python.org/3/tutorial/inputoutput.html) + [PEP 686](https://peps.python.org/pep-0686/) | ✅ |
| 58 | Rutas con `pathlib` | [pathlib](https://docs.python.org/3/library/pathlib.html) | ✅ |
| 59 | JSON: leer, escribir y sus límites | [json](https://docs.python.org/3/library/json.html) | ✅ |
| 60 | CSV y TOML (`csv`, `tomllib`) | [csv](https://docs.python.org/3/library/csv.html) + [tomllib](https://docs.python.org/3/library/tomllib.html) | ✅ |
| 61 | Fechas y husos horarios: `datetime` y `zoneinfo` | [datetime](https://docs.python.org/3/library/datetime.html) + [zoneinfo](https://docs.python.org/3/library/zoneinfo.html) | ✅ |
| 🧪 | **Proyecto en el navegador: informe de gastos a partir de un CSV** | Aplicación de los módulos 4, 6 y 10 | ✅ |

## Módulo 11 — Tipado

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 62 | Anotaciones de tipo: qué son y qué no hacen en tiempo de ejecución | [typing](https://docs.python.org/3/library/typing.html) + [typing.python.org](https://typing.python.org/en/latest/) | ✅ |
| 63 | Colecciones, uniones (`X \| None`), `TypedDict` y `Literal` | [typing](https://docs.python.org/3/library/typing.html) | ✅ |
| 64 | Genéricos con la sintaxis nueva (`def f[T]`, `type`) y anotaciones diferidas | [PEP 695](https://peps.python.org/pep-0695/) + [PEP 649](https://peps.python.org/pep-0649/) + [annotationlib](https://docs.python.org/3/library/annotationlib.html) | ✅ |
| 65 | Comprobar tipos con `mypy` (y qué es `ty`) | [mypy](https://mypy.readthedocs.io/en/stable/) + [ty](https://docs.astral.sh/ty/) | 📝 terminal local |

## Módulo 12 — Herramientas de un proyecto profesional

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 66 | Proyectos con `uv`: `pyproject.toml`, versiones de Python y `uv.lock` | [uv — Working on projects](https://docs.astral.sh/uv/guides/projects/) + [Writing your pyproject.toml](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) | 📝 terminal local |
| 67 | Lint y formato con Ruff | [Ruff](https://docs.astral.sh/ruff/) | 📝 terminal local |
| 68 | Tests con `pytest`: aserciones, *fixtures* y parametrizar | [pytest — Get Started](https://docs.pytest.org/en/stable/getting-started.html) + [fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html) + [parametrize](https://docs.pytest.org/en/stable/how-to/parametrize.html) | 📝 terminal local |
| 69 | Depurar con `breakpoint()` y `pdb` | [pdb](https://docs.python.org/3/library/pdb.html) | 📝 terminal local |
| 70 | `logging` en vez de `print` | [Logging HOWTO](https://docs.python.org/3/howto/logging.html) + [logging](https://docs.python.org/3/library/logging.html) | ✅ |
| 71 | Medir antes de optimizar: `timeit` y el perfilador Tachyon (3.15) | [profiling](https://docs.python.org/3/library/profiling.html) + [profiling.sampling](https://docs.python.org/3/library/profiling.sampling.html) | 📝 3.15 |

## Módulo 13 — Concurrencia

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 72 | Hilos, procesos y `asyncio`: qué resuelve cada uno, y el GIL | [A Conceptual Overview of asyncio](https://docs.python.org/3/howto/a-conceptual-overview-of-asyncio.html) + [Free-threading HOWTO](https://docs.python.org/3/howto/free-threading-python.html) | 📝 conceptual |
| 73 | `async` y `await` con `asyncio` | [asyncio](https://docs.python.org/3/library/asyncio.html) | ✅ |
| 74 | `concurrent.futures`: hilos y procesos sin pelearte con ellos | [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html) | 📝 Pyodide no crea hilos |
| 75 | Python sin GIL (*free-threading*): qué cambia y cuándo te importa | [PEP 779](https://peps.python.org/pep-0779/) + [Free-threading HOWTO](https://docs.python.org/3/howto/free-threading-python.html) | 📝 Pyodide no crea hilos |

## Módulo 14 — Python en el mundo real

| # | Lección | Fuentes | En vivo |
|---|---|---|---|
| 76 | Expresiones regulares con `re` | [Regular Expression HOWTO](https://docs.python.org/3/howto/regex.html) + [re](https://docs.python.org/3/library/re.html) | ✅ |
| 77 | t-strings (3.14): plantillas seguras para HTML y SQL | [PEP 750](https://peps.python.org/pep-0750/) + [string.templatelib](https://docs.python.org/3/library/string.templatelib.html) | ✅ |
| 78 | Programas de línea de comandos con `argparse` | [argparse](https://docs.python.org/3/library/argparse.html) | 📝 terminal local |
| 79 | Consumir una API HTTP (`urllib.request` y por qué casi todos usan `httpx`) | [urllib.request](https://docs.python.org/3/library/urllib.request.html) + [HTTPX](https://www.python-httpx.org/) | 📝 red real |

## Proyectos

### 🧪 En el navegador (intercalados, con comprobaciones)

Ya listados al final de su módulo: conversor y calculadora de propinas
(tras el 2), el ahorcado (tras el 4), analizador de texto (tras el 5),
gestor de tareas con clases (tras el 9) e informe de gastos a partir de
un CSV (tras el 10). Cada uno es una lección propia, en vivo, con
comprobaciones ✅/❌.

### Avanzados (repositorio `pedroleni/python-proyectos`)

Mismo formato que el resto de fichas: rama `main` con el punto de
partida y los TODO, rama `solucion` completa; cada proyecto en su
carpeta, con `pyproject.toml` y `uv.lock`, tests con `pytest` y CI que
pasa en la rama `solucion`. Se construyen y verifican de verdad antes de
escribir su lección.

| # | Lección | Lo que aplica |
|---|---|---|
| 80 | Proyecto avanzado: CLI de gastos (`gastos añadir / listar / resumen`) | `argparse`, `dataclasses`, `json`, `pathlib`, tests con `pytest` (módulos 9, 10, 12, 14) |
| 81 | Proyecto avanzado: organizador de descargas (mover ficheros por tipo y fecha, con modo «solo mostrar») | `pathlib`, `datetime`, `logging`, tests con ficheros temporales (módulos 10 y 12) |
| 82 | Proyecto avanzado: analizador de logs con generadores | generadores, `re`, `collections`, tipado estricto con `mypy` (módulos 6, 11 y 14) |
| 83 | Proyecto avanzado: descargador concurrente con `asyncio` y `httpx` | `asyncio`, límite de concurrencia, reintentos, gestión de errores (módulos 7, 13 y 14) |

**Total: 88 lecciones** — 79 de contenido en 14 módulos, 5 proyectos
en el navegador y 4 proyectos avanzados. La numeración de esta tabla es
provisional: al publicar, los proyectos en el navegador se intercalan
donde marca cada módulo y el resto se renumera (las referencias a
números de lección de este documento se actualizan entonces).

## Pendiente

- [ ] Tu visto bueno al temario y a las decisiones de alcance (sobre
  todo: ecosistema en fichas aparte y uv como herramienta principal).
- [ ] Escribir `specs/features/python-en-vivo.md` y hacer la prueba de
  la fase 0 (Pyodide 314 en un worker, `input()` y «Detener»).
- [ ] Implementar `python-en-vivo` + comprobaciones (fase 1) antes de la
  primera lección con ✅.
- [ ] Crear la tecnología «Python» vía el flujo de admin.
- [ ] Crear el repositorio `pedroleni/python-proyectos` (con su README
  enlazando a techstudytracker.com) cuando toque el primer proyecto
  avanzado.
- [ ] Cuando salga **Pyodide 315 estable**, pasar a ✅ las partes 📝 de
  3.15 (lecciones 22, 24, 47 y 55) y actualizar el motor del editor.
- [ ] Proponer las fichas aparte: análisis de datos (NumPy, pandas,
  Polars), web (FastAPI, Django) y automatización.
