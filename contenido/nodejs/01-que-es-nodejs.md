# ¿Qué es Node.js y qué problema resuelve?

- **Módulo:** Qué es Node.js y por qué existe
- **Slug:** `que-es-nodejs` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) — ver `contenido/nodejs/TEMARIO.md` #1

---

## Qué es y para qué sirve

Node.js es un entorno de ejecución de JavaScript fuera del navegador. Hasta su aparición, JavaScript solo vivía dentro de una pestaña web — Node.js toma el mismo lenguaje y lo deja ejecutar en cualquier sitio: un servidor, tu propio ordenador, un script que corre cada noche. No es un lenguaje distinto, ni un framework — es JavaScript, con acceso a cosas que un navegador nunca daría por razones de seguridad: el sistema de ficheros, la red a bajo nivel, otros procesos del sistema operativo.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El mismo lenguaje, un entorno distinto",
  "contenido": "Todo lo que ya sabes de JavaScript (closures, promesas, clases, módulos ES) sigue funcionando exactamente igual en Node.js — lo que cambia es el entorno alrededor: no hay window, no hay document, no hay DOM, pero sí hay un objeto global process, acceso a fs (ficheros) y mucho más."
}
```

## Para qué se usa Node.js de verdad

```laboratorio
{
  "tipo": "roles",
  "titulo": "Usos reales, no solo \"servidores web\"",
  "roles": [
    { "etiqueta": "APIs y servidores", "rol": "Backend de aplicaciones web reales", "descripcion": "La mayoría de APIs REST, GraphQL o de tiempo real (WebSockets) de aplicaciones modernas corren sobre Node.js o un framework construido encima." },
    { "etiqueta": "Herramientas de línea de comandos", "rol": "CLIs que usas cada día", "descripcion": "npm, Vite, TypeScript, ESLint — las herramientas que ya usas en este mismo curso son, casi todas, programas de Node.js." },
    { "etiqueta": "Scripts y automatización", "rol": "Tareas que no necesitan un servidor", "descripcion": "Procesar un archivo, generar un informe, migrar datos — cualquier tarea que antes se haría con un script de shell o Python, hoy es tan común hacerla en JavaScript con Node.js." }
  ]
}
```

## Lo que Node.js no es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Node.js es un framework, como Express o React",
      "realidad": "Node.js es el ENTORNO DE EJECUCIÓN — el programa que interpreta y corre JavaScript fuera del navegador. Express es un framework que se instala CON npm y corre SOBRE Node.js; no son la misma capa."
    },
    {
      "mito": "Node.js es un lenguaje de programación distinto de JavaScript",
      "realidad": "Es JavaScript real, el mismo lenguaje — el motor que lo ejecuta (V8, siguiente lección) es el mismo que usa Chrome. Lo que cambia son las APIs disponibles alrededor del lenguaje, no el lenguaje en sí."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que código pensado para el navegador funcione igual en Node.js.", "texto": "document.querySelector, localStorage, fetch tal cual del navegador... no todo existe, o existe distinto — el módulo 3 de este temario detalla las diferencias reales." },
    { "titulo": "Pensar que hace falta aprender un lenguaje nuevo.", "texto": "Si ya sabes JavaScript (el temario de este mismo catálogo), ya sabes la parte más difícil — Node.js añade APIs nuevas, no un lenguaje nuevo." }
  ]
}
```

## Ejercicios

1. Explica con tus propias palabras la diferencia entre "un lenguaje de programación" y "un entorno de ejecución".
2. Nombra tres herramientas que ya hayas usado en este curso que en realidad son programas de Node.js.
3. ¿Por qué Node.js sí puede acceder al sistema de ficheros y un script en el navegador no?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Introduction to Node.js",
      "descripcion": "Introducción oficial de Node.js Learn.",
      "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
      "etiqueta": "Node.js"
    }
  ]
}
```
