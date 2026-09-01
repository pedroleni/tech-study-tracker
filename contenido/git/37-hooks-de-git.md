# Hooks de Git: código que se ejecuta solo, en momentos concretos

- **Módulo:** Worktrees y hooks
- **Slug:** `hooks-de-git-codigo-que-se-ejecuta-solo-en-momentos-concretos` (autogenerado del título)
- **Orden:** 370
- **Fuentes:** [githooks](https://git-scm.com/docs/githooks) — ver `contenido/git/TEMARIO.md` #37

---

## Scripts que Git ejecuta por ti, en el momento justo

Un hook es un script que vive dentro de `.git/hooks/` y que Git ejecuta automáticamente en puntos concretos del flujo — antes de un commit, después de un merge, antes de un push. No hace falta instalar nada: cada repositorio ya trae una carpeta `.git/hooks/` con ejemplos desactivados.

> **Nota sobre este módulo:** un hook es un script real ejecutado por el sistema operativo, algo que no puede pasar dentro del sandbox WASM de este curso. Salida real, capturada con `git` de línea de comandos.

```text
$ ls .git/hooks
applypatch-msg.sample
commit-msg.sample
fsmonitor-watchman.sample
post-update.sample
pre-applypatch.sample
pre-commit.sample
pre-merge-commit.sample
pre-push.sample
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\".sample\" — desactivados por defecto",
  "contenido": "Cada fichero de ejemplo tiene la extensión .sample y no se ejecuta tal cual. Para activar uno, basta con quitarle esa extensión (y darle permiso de ejecución) — el nombre exacto del fichero es lo que determina en qué momento se dispara."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Algunos de los momentos más usados",
  "roles": [
    { "etiqueta": "pre-commit", "rol": "Justo antes de crear el commit", "descripcion": "Puede cancelar el commit por completo (por ejemplo, si hay tests que fallan o código sin formatear). Todavía no existe ningún mensaje en este punto." },
    { "etiqueta": "commit-msg", "rol": "Con el mensaje ya escrito, antes de confirmarlo", "descripcion": "Recibe la ruta a un fichero temporal con el mensaje — puede rechazar el commit si el mensaje no cumple un formato concreto (la siguiente lección lo hace de verdad)." },
    { "etiqueta": "pre-push", "rol": "Justo antes de enviar commits a un remoto", "descripcion": "Última oportunidad de cancelar un push completo — por ejemplo, si detecta que alguien intenta empujar directamente a master." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Los hooks NO se copian al hacer clone.", "texto": "Viven en .git/hooks, que forma parte del repositorio local, no del historial versionado. Cada persona que clona el proyecto empieza sin ningún hook activo — hay que instalarlos aparte (a mano, o con una herramienta como Husky)." },
    { "titulo": "Si un hook termina con código de salida distinto de cero, la operación se cancela.", "texto": "Es el mismo mecanismo que usa cualquier script de shell para señalar \"algo falló\" — Git simplemente lo respeta y aborta lo que estuviera haciendo." }
  ]
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "githooks",
      "descripcion": "Referencia oficial de todos los hooks disponibles y cuándo se disparan.",
      "url": "https://git-scm.com/docs/githooks",
      "etiqueta": "Git Reference"
    }
  ]
}
```
