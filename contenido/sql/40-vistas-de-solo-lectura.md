# Por qué las vistas son de solo lectura en SQLite

- **Módulo:** Vistas y funciones auxiliares
- **Slug:** `vistas-de-solo-lectura` (autogenerado del título)
- **Orden:** 400
- **Fuentes:** [SQL Features That SQLite Does Not Implement](https://sqlite.org/omitted.html) — ver `contenido/sql/TEMARIO.md` #40

---

## Qué es y para qué sirve

En SQLite, una vista normal **no admite** `INSERT`, `UPDATE` ni `DELETE` directamente — solo se puede leer con `SELECT`. Otros motores (como PostgreSQL) sí permiten actualizar ciertas vistas simples directamente.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Intentar escribir en una vista falla de verdad",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, total REAL);\nINSERT INTO ventas VALUES (1, 'Auriculares', 100);\nCREATE VIEW ventas_grandes AS SELECT * FROM ventas WHERE total > 60;",
  "consulta": "INSERT INTO ventas_grandes (producto, total) VALUES ('Teclado', 200)",
  "anotaciones": [
    { "fragmento": "INSERT INTO ventas_grandes", "nota": "Falla con \"cannot modify ventas_grandes because it is a view\" (verificado ejecutándolo) — SQLite nunca permite escribir directamente en una vista normal." }
  ]
}
```

## La alternativa real: un trigger `INSTEAD OF`

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Si de verdad hace falta \"escribir a través\" de una vista",
  "contenido": "SQLite permite crear un TRIGGER con INSTEAD OF sobre una vista — intercepta el INSERT/UPDATE/DELETE que se intentó hacer sobre la vista y ejecuta, en su lugar, la lógica que se defina (normalmente, escribir en la tabla real de debajo). Es una herramienta avanzada, poco frecuente, pero es la vía oficial cuando de verdad hace falta ese comportamiento."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar el mismo comportamiento que en PostgreSQL, donde algunas vistas simples sí son escribibles directamente.", "texto": "Es una diferencia real entre motores — código que asume vistas escribibles no es directamente portable a SQLite sin un trigger INSTEAD OF." },
    { "titulo": "Intentar borrar filas de una vista pensando que borra de la tabla real.", "texto": "DELETE FROM una_vista falla exactamente igual que INSERT o UPDATE — hay que operar sobre la tabla real de debajo, o definir el trigger correspondiente." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "En vez de escribir en la vista, actualiza la tabla real (ventas) para cambiar el total de la fila con id 1 a 150, y comprueba el resultado consultando la vista ventas_grandes.",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, total REAL);\nINSERT INTO ventas VALUES (1, 'Auriculares', 40);\nCREATE VIEW ventas_grandes AS SELECT * FROM ventas WHERE total > 60;",
  "consultaInicial": "",
  "consultaSolucion": "UPDATE ventas SET total = 150 WHERE id = 1; SELECT * FROM ventas_grandes;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SQL Features That SQLite Does Not Implement",
      "descripcion": "Lista oficial de características de SQL que SQLite no soporta, incluidas las vistas de solo lectura.",
      "url": "https://sqlite.org/omitted.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
