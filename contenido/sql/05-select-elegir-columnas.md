# SELECT: elegir qué columnas ver

- **Módulo:** SELECT y filtrado
- **Slug:** `select-elegir-columnas` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #5

---

## Qué es y para qué sirve

`SELECT` es la instrucción que lee datos de una tabla — la más usada de todo SQL, con diferencia. Se le indica qué columnas quieres ver (o `*` para "todas") y de qué tabla.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Elegir columnas concretas frente a pedirlas todas",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL, categoria TEXT, stock INTEGER);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5, 'papeleria', 120),\n  (2, 'Auriculares', 45.0, 'electronica', 8),\n  (3, 'Mochila', 28.9, 'accesorios', 15);",
  "consulta": "SELECT nombre, precio\nFROM productos",
  "anotaciones": [
    { "fragmento": "SELECT nombre, precio", "nota": "Solo dos de las cinco columnas reales de la tabla — el resto (id, categoria, stock) ni siquiera viaja en el resultado." },
    { "fragmento": "FROM productos", "nota": "FROM indica de qué tabla se leen las filas — obligatorio salvo en consultas que no tocan ninguna tabla (poco frecuentes)." }
  ]
}
```

## `*` frente a columnas explícitas

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar SELECT * en código real de producción, no solo para explorar.", "texto": "SELECT * trae columnas que quizá no necesitas (más datos viajando de más) y, peor, si alguien añade una columna nueva a la tabla, el resultado cambia de forma inesperada sin haber tocado la consulta." },
    { "titulo": "Repetir el mismo nombre de columna en dos tablas sin cualificarlo.", "texto": "Cuando la consulta involucra más de una tabla (a partir del módulo de Joins), hace falta anteponer el nombre de la tabla — tabla.columna — para que quede claro de cuál se habla." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre y la categoría de todos los productos (sin el precio, el id ni el stock).",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL, categoria TEXT, stock INTEGER);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5, 'papeleria', 120),\n  (2, 'Auriculares', 45.0, 'electronica', 8),\n  (3, 'Mochila', 28.9, 'accesorios', 15);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, categoria FROM productos"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SELECT",
      "descripcion": "Referencia oficial completa de la sentencia SELECT.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
