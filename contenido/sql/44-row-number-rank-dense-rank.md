# ROW_NUMBER, RANK, DENSE_RANK

- **Módulo:** Funciones de ventana
- **Slug:** `row-number-rank-dense-rank` (autogenerado del título)
- **Orden:** 440
- **Fuentes:** [Window Functions](https://sqlite.org/windowfunctions.html) — ver `contenido/sql/TEMARIO.md` #44

---

## Qué es y para qué sirve

Estas tres funciones numeran filas según un orden — pero se diferencian exactamente en **qué hacen con los empates**, algo que solo se aprecia probándolo con datos reales.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Ana y Luis empatan con nota 9 — las tres funciones lo tratan distinto",
  "esquemaSql": "CREATE TABLE estudiantes (id INTEGER PRIMARY KEY, nombre TEXT, nota REAL);\nINSERT INTO estudiantes VALUES (1, 'Ana', 9), (2, 'Luis', 9), (3, 'Marta', 7), (4, 'Diego', 5);",
  "consulta": "SELECT nombre, nota,\n  ROW_NUMBER() OVER (ORDER BY nota DESC) AS fila,\n  RANK() OVER (ORDER BY nota DESC) AS rango,\n  DENSE_RANK() OVER (ORDER BY nota DESC) AS rango_denso\nFROM estudiantes",
  "anotaciones": [
    { "fragmento": "ROW_NUMBER() OVER (ORDER BY nota DESC) AS fila", "nota": "Verificado: da 1, 2, 3, 4 — un número distinto por fila SIEMPRE, incluso con empate. Ana y Luis (ambos con 9) reciben 1 y 2 arbitrariamente." },
    { "fragmento": "RANK() OVER (ORDER BY nota DESC) AS rango", "nota": "Verificado: da 1, 1, 3, 4 — Ana y Luis EMPATAN en el puesto 1, y Marta salta directamente al puesto 3 (se \"come\" el puesto 2, como en una carrera real con empate)." },
    { "fragmento": "DENSE_RANK() OVER (ORDER BY nota DESC) AS rango_denso", "nota": "Verificado: da 1, 1, 2, 3 — también empatan en el puesto 1, pero Marta pasa al puesto 2 SIN saltos, a diferencia de RANK." }
  ]
}
```

## Las tres, una junto a otra

```laboratorio
{
  "tipo": "roles",
  "titulo": "La única diferencia real está en cómo tratan los empates",
  "roles": [
    { "etiqueta": "ROW_NUMBER", "rol": "Nunca hay empates — cada fila, un número distinto", "descripcion": "Útil para \"dame la primera fila de cada grupo\" o para paginar resultados con un orden estable." },
    { "etiqueta": "RANK", "rol": "Empata, y deja huecos después del empate", "descripcion": "Como una carrera real: dos personas en 1er puesto significa que el siguiente puesto ocupado es el 3º, no el 2º." },
    { "etiqueta": "DENSE_RANK", "rol": "Empata, sin dejar huecos", "descripcion": "El siguiente puesto tras un empate es simplemente el siguiente número consecutivo, sin saltos." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar RANK cuando en realidad se necesita ROW_NUMBER (o al revés).", "texto": "Si el requisito es \"un número único por fila, sin excepción\" (por ejemplo, para paginar), RANK puede dar el mismo número a dos filas — hace falta ROW_NUMBER para esa garantía." },
    { "titulo": "Olvidar el ORDER BY dentro del OVER.", "texto": "Sin ORDER BY, el \"orden\" para numerar no está definido — las tres funciones necesitan un ORDER BY dentro de OVER(...) para tener sentido." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra cada estudiante con su nota y su DENSE_RANK, ordenado de mayor a menor nota.",
  "esquemaSql": "CREATE TABLE estudiantes (id INTEGER PRIMARY KEY, nombre TEXT, nota REAL);\nINSERT INTO estudiantes VALUES (1, 'Ana', 9), (2, 'Luis', 9), (3, 'Marta', 7);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, nota, DENSE_RANK() OVER (ORDER BY nota DESC) AS rango_denso FROM estudiantes"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Window Functions",
      "descripcion": "Referencia oficial completa de las funciones de ventana de SQLite.",
      "url": "https://sqlite.org/windowfunctions.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
