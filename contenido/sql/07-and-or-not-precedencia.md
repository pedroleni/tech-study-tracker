# AND/OR/NOT y su precedencia real

- **Módulo:** SELECT y filtrado
- **Slug:** `and-or-not-precedencia` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [Expression](https://sqlite.org/lang_expr.html) — ver `contenido/sql/TEMARIO.md` #7

---

## Qué es y para qué sirve

`AND`, `OR` y `NOT` combinan varias condiciones en una sola. Igual que en la aritmética `*` se evalúa antes que `+`, en SQL `AND` se evalúa antes que `OR` — mezclarlos sin paréntesis produce, a veces, un resultado distinto del que se esperaba.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<script>\n// categoria = 'electronica' O (categoria = 'papeleria' Y precio < 5)\nSELECT nombre FROM productos\nWHERE categoria = 'electronica' OR categoria = 'papeleria' AND precio < 5;\n</script>",
  "opciones": [
    "Solo productos de electrónica, sin importar el precio",
    "Productos de electrónica (cualquier precio) + productos de papelería que además cuesten menos de 5",
    "Solo productos de papelería que cuesten menos de 5"
  ],
  "correcta": 1,
  "explicacion": "AND se evalúa antes que OR — la condición real es 'categoria = electronica' OR '(categoria = papeleria AND precio < 5)', no '(categoria = electronica OR categoria = papeleria) AND precio < 5'. Sin paréntesis explícitos, es fácil leerla mal."
}
```

## Por qué los paréntesis explícitos son casi siempre buena idea

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "WHERE categoria = 'electronica' OR categoria = 'papeleria' AND precio < 5",
  "despues": "WHERE categoria = 'electronica' OR (categoria = 'papeleria' AND precio < 5)",
  "nota": "El resultado es idéntico — AND ya se evaluaba primero. Pero la segunda versión no obliga a quien la lee a recordar la regla de precedencia de memoria."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Mezclar AND y OR sin paréntesis, confiando en la memoria.", "texto": "Aunque el resultado sea correcto, obliga a cualquiera que lea la consulta después (incluido tú mismo, meses más tarde) a recalcular la precedencia mentalmente." },
    { "titulo": "Usar NOT delante de una condición completa cuando bastaría con el operador contrario.", "texto": "NOT precio > 10 funciona, pero precio <= 10 suele leerse más claro — NOT tiene más sentido con condiciones que no tienen un operador \"opuesto\" directo, como NOT LIKE o NOT IN." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre de los productos que sean de electrónica, o que sean de accesorios Y cuesten menos de 30.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL, categoria TEXT, stock INTEGER);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5, 'papeleria', 120),\n  (2, 'Auriculares', 45.0, 'electronica', 8),\n  (3, 'Mochila', 28.9, 'accesorios', 15),\n  (4, 'Cinturón', 35.0, 'accesorios', 10);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre FROM productos WHERE categoria = 'electronica' OR (categoria = 'accesorios' AND precio < 30)"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Expression",
      "descripcion": "Referencia oficial de expresiones SQL, incluida la precedencia de operadores.",
      "url": "https://sqlite.org/lang_expr.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
