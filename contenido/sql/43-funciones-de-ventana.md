# Qué es una función de ventana y en qué se diferencia de GROUP BY

- **Módulo:** Funciones de ventana
- **Slug:** `funciones-de-ventana` (autogenerado del título)
- **Orden:** 430
- **Fuentes:** [Window Functions](https://sqlite.org/windowfunctions.html) — ver `contenido/sql/TEMARIO.md` #43

---

## Qué es y para qué sirve

Una función de ventana calcula un valor de agregado **sin colapsar las filas en grupos** — a diferencia de `GROUP BY` (módulo 3), cada fila conserva su propia identidad, y además ve un cálculo hecho sobre su "ventana" (su grupo, en este caso).

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "La nota media del curso, sin perder ninguna fila individual",
  "esquemaSql": "CREATE TABLE estudiantes (id INTEGER PRIMARY KEY, nombre TEXT, curso TEXT, nota REAL);\nINSERT INTO estudiantes VALUES (1, 'Ana', 'A', 8), (2, 'Luis', 'A', 6), (3, 'Marta', 'B', 9);",
  "consulta": "SELECT nombre, curso, nota,\n  AVG(nota) OVER (PARTITION BY curso) AS media_curso\nFROM estudiantes",
  "anotaciones": [
    { "fragmento": "AVG(nota) OVER (PARTITION BY curso)", "nota": "OVER convierte AVG en una función de VENTANA — PARTITION BY curso define la ventana: todas las filas del mismo curso." },
    { "fragmento": "SELECT nombre, curso, nota,", "nota": "A diferencia de GROUP BY, aquí SIGUEN estando nombre y nota de cada estudiante individual — con GROUP BY, esas columnas se perderían salvo que fueran parte del agrupamiento." }
  ]
}
```

## La diferencia real, lado a lado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "SELECT curso, AVG(nota) FROM estudiantes GROUP BY curso;\n\n-- curso | AVG(nota)\n-- A     | 7\n-- B     | 9\n-- (2 filas — una por curso, se pierde el detalle individual)",
  "despues": "SELECT nombre, curso, nota, AVG(nota) OVER (PARTITION BY curso) FROM estudiantes;\n\n-- nombre | curso | nota | media_curso\n-- Ana    | A     | 8    | 7\n-- Luis   | A     | 6    | 7\n-- Marta  | B     | 9    | 9\n-- (3 filas — una por estudiante, CON el dato del grupo)",
  "nota": "GROUP BY resume; una función de ventana enriquece cada fila con un dato calculado sobre su grupo, sin perder ninguna."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar GROUP BY cuando en realidad hace falta conservar el detalle de cada fila.", "texto": "Si el objetivo es \"cada estudiante con la media de su curso al lado\", GROUP BY no puede hacerlo directamente sin un JOIN adicional — una función de ventana lo resuelve en una sola consulta." },
    { "titulo": "Olvidar el PARTITION BY, calculando sobre toda la tabla sin querer.", "texto": "AVG(nota) OVER () sin PARTITION BY calcula la media de TODA la tabla para cada fila, no la de su grupo — el PARTITION BY es lo que define \"su\" ventana." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra cada estudiante con su nota y la nota MÁXIMA de su curso (usa MAX(nota) OVER (PARTITION BY curso)).",
  "esquemaSql": "CREATE TABLE estudiantes (id INTEGER PRIMARY KEY, nombre TEXT, curso TEXT, nota REAL);\nINSERT INTO estudiantes VALUES (1, 'Ana', 'A', 8), (2, 'Luis', 'A', 6), (3, 'Marta', 'B', 9), (4, 'Diego', 'B', 7);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, curso, nota, MAX(nota) OVER (PARTITION BY curso) AS max_curso FROM estudiantes"
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
