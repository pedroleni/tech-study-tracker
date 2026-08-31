# UPSERT: insertar o actualizar en un solo paso

- **Módulo:** Modificar datos
- **Slug:** `upsert` (autogenerado del título)
- **Orden:** 270
- **Fuentes:** [UPSERT](https://sqlite.org/lang_upsert.html) — ver `contenido/sql/TEMARIO.md` #27

---

## Qué es y para qué sirve

Un **UPSERT** (*update or insert*) intenta insertar una fila, y si ya existe una con la misma clave, actualiza esa fila en vez de fallar por duplicado. En SQLite se escribe con `INSERT ... ON CONFLICT ... DO UPDATE`.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Sumar stock si el producto ya existe, insertarlo si no",
  "esquemaSql": "CREATE TABLE inventario (producto TEXT PRIMARY KEY, stock INTEGER);\nINSERT INTO inventario VALUES ('Cuaderno', 10);",
  "consulta": "INSERT INTO inventario (producto, stock) VALUES ('Cuaderno', 5)\nON CONFLICT(producto) DO UPDATE SET stock = stock + excluded.stock;\nSELECT * FROM inventario;",
  "anotaciones": [
    { "fragmento": "ON CONFLICT(producto) DO UPDATE SET stock = stock + excluded.stock", "nota": "'Cuaderno' ya existe (clave primaria producto duplicada) — en vez de fallar, DO UPDATE suma el stock nuevo (excluded.stock, el valor que se intentaba insertar) al que ya había: 10 + 5 = 15." },
    { "fragmento": "excluded.stock", "nota": "excluded es una tabla especial que representa la fila que se INTENTABA insertar — necesaria para referirse al valor nuevo dentro del DO UPDATE." }
  ]
}
```

## Por qué existe: el problema real que resuelve

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Sin UPSERT, hace falta comprobar antes si la fila existe.", "texto": "La alternativa (SELECT para ver si existe, luego UPDATE o INSERT según el caso) implica dos consultas y una condición de carrera real si dos procesos lo hacen a la vez — UPSERT lo resuelve en una sola operación atómica." },
    { "titulo": "Es exactamente lo que hace falta para contadores o cachés.", "texto": "\"Suma 1 visita a esta página, o crea el contador en 1 si es la primera visita\" es el caso de uso más común de UPSERT en aplicaciones reales." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que ON CONFLICT necesita indicar sobre qué columna detecta el conflicto.", "texto": "ON CONFLICT(producto) es obligatorio nombrar la columna (o combinación) que tiene la restricción UNIQUE o PRIMARY KEY — sin eso, SQLite no sabe qué cuenta como \"ya existe\"." },
    { "titulo": "Usar el valor de la columna directamente en vez de excluded.columna dentro del DO UPDATE.", "texto": "Dentro de DO UPDATE, el nombre de columna a secas (stock) se refiere al valor YA GUARDADO — para referirse al valor nuevo que se intentaba insertar, hace falta excluded.stock." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "\"Auriculares\" ya existe con stock 3. Haz un UPSERT que sume 7 unidades más si ya existe (o lo inserte con 7 si no existiera), y termina con un SELECT * para comprobar el resultado.",
  "esquemaSql": "CREATE TABLE inventario (producto TEXT PRIMARY KEY, stock INTEGER);\nINSERT INTO inventario VALUES ('Auriculares', 3);",
  "consultaInicial": "",
  "consultaSolucion": "INSERT INTO inventario (producto, stock) VALUES ('Auriculares', 7) ON CONFLICT(producto) DO UPDATE SET stock = stock + excluded.stock; SELECT * FROM inventario;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "UPSERT",
      "descripcion": "Referencia oficial completa de la sintaxis UPSERT de SQLite.",
      "url": "https://sqlite.org/lang_upsert.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
