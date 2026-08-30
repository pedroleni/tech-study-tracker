# Tipos de datos en SQL (y el tipado dinámico particular de SQLite)

- **Módulo:** El modelo relacional
- **Slug:** `tipos-de-datos` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Datatypes In SQLite](https://sqlite.org/datatype3.html) — ver `contenido/sql/TEMARIO.md` #3

---

## Qué es y para qué sirve

Cada columna de una tabla declara un tipo — `INTEGER`, `TEXT`, `REAL`... — que describe qué clase de dato espera guardar. La mayoría de motores (PostgreSQL, MySQL) lo hacen cumplir de forma estricta: si declaras `INTEGER`, solo entran números. **SQLite es distinto**, y es importante saberlo desde el principio.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "SQLite usa tipado dinámico, no estático",
  "contenido": "El tipo real de un valor en SQLite viaja con el propio valor, no con la columna donde vive — una columna declarada INTEGER puede, técnicamente, guardar texto. La columna solo declara una 'afinidad' (una preferencia), no una regla que bloquee todo lo demás. Esto es distinto de PostgreSQL o MySQL, donde el tipo de columna sí se hace cumplir siempre. Desde SQLite 3.37.0 existen las tablas STRICT para quien prefiera el comportamiento tradicional."
}
```

## Las cinco clases de almacenamiento reales

```laboratorio
{
  "tipo": "roles",
  "titulo": "Todo valor en SQLite es, por dentro, una de estas cinco clases",
  "roles": [
    { "etiqueta": "INTEGER", "rol": "Números enteros", "descripcion": "Ocupa entre 0 y 8 bytes según el tamaño del número — SQLite elige el más pequeño que sirva." },
    { "etiqueta": "REAL", "rol": "Números con decimales", "descripcion": "Coma flotante de 8 bytes (doble precisión), igual que el number de JavaScript." },
    { "etiqueta": "TEXT", "rol": "Cadenas de texto", "descripcion": "Codificado en UTF-8 (o UTF-16), igual que casi cualquier texto moderno." },
    { "etiqueta": "BLOB / NULL", "rol": "Datos binarios crudos, o ausencia de valor", "descripcion": "BLOB guarda bytes tal cual, sin interpretarlos — NULL representa 'no hay valor', ni siquiera texto vacío." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Asumir que SQLite rechaza un valor \"del tipo equivocado\" como haría Postgres.", "texto": "SQLite intentará convertirlo según la afinidad de la columna, y si no puede, lo guarda tal cual — no lanza un error como esperarías viniendo de otro motor." },
    { "titulo": "Diseñar un esquema real de producción sin plantearse las tablas STRICT.", "texto": "Si el proyecto necesita la rigidez tradicional (evitar que un bug guarde un string donde debería ir un número), STRICT existe desde la versión 3.37.0 — no hay que resignarse al tipado dinámico por defecto." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "La tabla productos tiene una columna precio declarada REAL. Muestra el nombre y el precio de los productos que cuestan más de 20.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL);\nINSERT INTO productos VALUES (1, 'Cuaderno', 3.5), (2, 'Auriculares', 45.0), (3, 'Mochila', 28.9);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, precio FROM productos WHERE precio > 20"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Datatypes In SQLite",
      "descripcion": "Documentación oficial sobre clases de almacenamiento, afinidad de tipos y tablas STRICT.",
      "url": "https://sqlite.org/datatype3.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
