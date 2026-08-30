# Variables de entorno

- **Módulo:** Primeros pasos
- **Slug:** `variables-de-entorno` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [How to read environment variables from Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs) — ver `contenido/nodejs/TEMARIO.md` #8

---

## Qué es y para qué sirve

Una variable de entorno es un valor que vive fuera del código, en el sistema operativo (o en el proceso que lanza el programa) — la forma estándar de pasar configuración (claves de API, URLs de bases de datos, el propio `NODE_ENV`) sin escribirla directamente en el código fuente, y sobre todo, sin subirla a un repositorio de Git.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconsole.log(process.env.HOME); // una variable ya definida por el sistema\nconsole.log(process.env.MI_CLAVE_API); // undefined si no está definida\n\nif (!process.env.MI_CLAVE_API) {\n  throw new Error('Falta la variable de entorno MI_CLAVE_API');\n}\n</script>",
  "anotaciones": [
    { "fragmento": "console.log(process.env.MI_CLAVE_API); // undefined si no está definida", "nota": "process.env es un objeto normal — acceder a una clave que no existe da undefined, igual que con cualquier otro objeto de JavaScript, no un error." },
    { "fragmento": "if (!process.env.MI_CLAVE_API) {\n  throw new Error('Falta la variable de entorno MI_CLAVE_API');\n}", "nota": "Fallar RÁPIDO y con un mensaje claro si falta una variable de entorno crítica es mejor que dejar que el programa siga y falle más adelante, de forma confusa, cuando intente usar ese valor undefined." }
  ]
}
```

## Ficheros .env: la forma habitual de definirlas en desarrollo

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": ".env nunca se sube al repositorio",
  "contenido": "Un fichero .env con CLAVE=valor por línea es la forma más común de definir variables de entorno en desarrollo — Node.js las carga automáticamente con --env-file=.env desde versiones recientes, sin necesitar ninguna librería externa. Ese fichero SIEMPRE va en .gitignore: contiene secretos reales (claves de API, contraseñas de bases de datos) que nunca deberían quedar en el historial de Git, ni público ni privado."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Subir un fichero .env con secretos reales a un repositorio de Git.", "texto": "Una vez en el historial de Git, un secreto sigue ahí aunque se borre en un commit posterior — hay que revocarlo y generar uno nuevo, no basta con eliminarlo del fichero." },
    { "titulo": "No comprobar que una variable de entorno crítica existe antes de usarla.", "texto": "Un process.env.CLAVE undefined que se usa sin comprobar produce errores confusos más adelante, en vez de un mensaje claro desde el principio del programa." }
  ]
}
```

## Ejercicios

1. Ejecuta `MI_VARIABLE=hola node -e "console.log(process.env.MI_VARIABLE)"` en tu terminal y explica qué está pasando.
2. Escribe un script que falle con un mensaje claro si no existe una variable de entorno `PUERTO`.
3. Explica por qué un fichero `.env` nunca debería subirse a un repositorio de Git.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "How to read environment variables from Node.js",
      "descripcion": "Guía oficial sobre variables de entorno en Node.js.",
      "url": "https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs",
      "etiqueta": "Node.js"
    }
  ]
}
```
