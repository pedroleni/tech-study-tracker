# Qué es un remoto: otro repositorio, no un servidor mágico

- **Módulo:** Remotos
- **Slug:** `que-es-un-remoto-otro-repositorio-no-un-servidor-magico` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [git-remote](https://git-scm.com/docs/git-remote) — ver `contenido/git/TEMARIO.md` #28

---

## Un repositorio más, en otro sitio

Hasta ahora, todo ha vivido en un único repositorio local. Un **remoto** es, literalmente, otro repositorio Git — en otra máquina, en un servidor como GitHub, o (como en los ejercicios de este módulo) en otra ruta del mismo ordenador. No hay ninguna magia especial: es el mismo formato, los mismos objetos, las mismas referencias que ya conoces.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "El nombre por defecto de un remoto tras clonar",
  "esquemaGit": ["init --bare /remoto", "clone /remoto /repo"],
  "comando": "remote show",
  "anotaciones": [
    { "fragmento": "show", "nota": "\"origin\" — clone le pone ese nombre por defecto al repositorio del que clonaste. No es una palabra reservada especial: es solo la convención que usa Git cuando no le dices otra cosa." }
  ]
}
```

## Este curso simula remotos con rutas locales — sin red real

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "\"init --bare\" crea un repositorio sin directorio de trabajo",
  "contenido": "Un repositorio normal tiene tus ficheros en carpetas normales, más un .git escondido con el historial. Un repositorio \"bare\" (--bare) es solo el .git — sin ficheros de trabajo, porque nadie va a editar directamente ahí. Es exactamente lo que hay en un servidor como GitHub: un almacén de historial al que la gente hace push y clone, no un sitio donde alguien edita ficheros a mano."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Un remoto no sabe que eres tú — solo tiene el mismo historial de objetos.", "texto": "clone, fetch y push mueven objetos (Módulo 5) entre dos repositorios. El remoto no ejecuta nada ni sabe nada de ti; simplemente acepta o entrega commits, trees y blobs." },
    { "titulo": "Puedes tener más de un remoto a la vez.", "texto": "\"origin\" es solo el nombre por defecto — un mismo repositorio local puede tener varios remotos registrados a la vez (por ejemplo, tu fork y el repositorio original), cada uno con su propio nombre." }
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
      "titulo": "git-remote",
      "descripcion": "Referencia oficial de git remote.",
      "url": "https://git-scm.com/docs/git-remote",
      "etiqueta": "Git Reference"
    }
  ]
}
```
