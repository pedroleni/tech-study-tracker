# Qué problema real resuelve el control de versiones (y por qué "guardar copias" no basta)

- **Módulo:** Qué es Git y por qué
- **Slug:** `que-problema-real-resuelve-el-control-de-versiones-y-por-que-guardar-copias-no-basta` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [About Version Control](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control) — ver `contenido/git/TEMARIO.md` #1

---

## El problema, antes de que exista una solución

Antes de Git, la forma más habitual de "llevar un historial" de un proyecto es duplicar la carpeta entera cada vez que se llega a un punto que parece importante. Funciona un rato — hasta que hay que volver a algo de hace tres semanas, o dos personas han tocado el mismo fichero, o nadie recuerda ya cuál de las cinco copias es la buena.

```text
proyecto-final.zip
proyecto-final-v2.zip
proyecto-final-v2-bueno.zip
proyecto-final-v2-bueno-DEFINITIVO.zip
proyecto-final-v2-bueno-DEFINITIVO-usar-este.zip
```

Esa lista no es un historial — es una carpeta de copias sueltas, sin ninguna relación explícita entre ellas. Compárala con esto:

```text
a3f9c1e (HEAD -> main) fix: corrige el cálculo de IVA en el total
d2b7e44 feat: añade el formulario de pago
9c1a002 feat: primera versión del carrito
```

Esto sí es un historial real de **un solo** proyecto: cada línea es un commit, con quién lo hizo (implícito), cuándo (implícito) y por qué existe (el mensaje). Nada se duplicó a mano — es lo que devuelve `git log --oneline` sobre un repositorio real, y se ve de verdad, con comandos reales, a partir del Módulo 2.

## Lo que "guardar copias" no resuelve

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres problemas reales que una carpeta de copias no soluciona",
  "roles": [
    { "etiqueta": "Historial", "rol": "Por qué cambió algo, no solo qué cambió", "descripcion": "Una copia es solo el estado final. No queda ningún rastro de qué cambió exactamente entre una versión y la siguiente, ni por qué." },
    { "etiqueta": "Colaboración", "rol": "Dos personas no pueden tocar lo mismo a la vez", "descripcion": "Sin un mecanismo para combinar cambios, la única opción real es turnarse — o que alguien sobrescriba en silencio el trabajo de otra persona." },
    { "etiqueta": "Recuperación", "rol": "Volver atrás exige haber guardado justo esa copia", "descripcion": "Si nadie hizo una copia justo antes del error que hay que deshacer, ese estado ya no existe en ningún sitio." }
  ]
}
```

## Control de versiones: tres generaciones

Un sistema de control de versiones automatiza exactamente esto — registrar cada cambio, sin depender de que alguien se acuerde de copiar la carpeta a tiempo. No todos lo hacen igual.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Local, centralizado, distribuido",
  "contenido": "Los primeros sistemas (RCS) llevaban una base de datos local de cambios, fichero a fichero. Los centralizados (CVS, Subversion) movieron esa base de datos a un servidor único — todo el mundo sabe qué hace el resto, pero ese servidor es un punto único de fallo. Los distribuidos (Git, Mercurial) van más allá: cada copia local es un espejo completo del historial entero, no solo del último estado."
}
```

Git es de la tercera generación — y esa decisión (cada clon es una copia completa, no un simple checkout) explica buena parte de lo que hace distinto a `git commit` de `git push`, algo que se ve en el Módulo 2.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pro Git — About Version Control",
      "descripcion": "El capítulo introductorio del libro Pro Git: qué problema resuelve un sistema de control de versiones y las tres generaciones (local, centralizado, distribuido).",
      "url": "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control",
      "etiqueta": "Pro Git"
    }
  ]
}
```
