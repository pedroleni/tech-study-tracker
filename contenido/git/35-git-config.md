# `git config`: configuración por repositorio frente a global

- **Módulo:** .gitignore y config
- **Slug:** `git-config-configuracion-por-repositorio-frente-a-global` (autogenerado del título)
- **Orden:** 350
- **Fuentes:** [git-config](https://git-scm.com/docs/git-config) — ver `contenido/git/TEMARIO.md` #35

---

## De dónde salen el nombre y el email de cada commit

Cada commit de este curso lleva un autor — visto ya en `log`, `blame`, `cat-file -p`. Ese nombre y ese email no se preguntan en cada commit: vienen de la configuración de Git, guardada aparte.

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Leer la configuración actual",
  "esquemaGit": ["init ."],
  "comando": "config user.name",
  "anotaciones": [
    { "fragmento": "user.name", "nota": "Este valor no vive en el repositorio — es configuración del entorno, la misma que usan todos los repositorios de esta máquina salvo que alguno la sobrescriba." }
  ]
}
```

## Sobrescribir la configuración solo para un repositorio

```laboratorio
{
  "tipo": "git-anotado",
  "titulo": "Un email distinto, solo para este repositorio",
  "esquemaGit": ["init .", "config user.email equipo@ejemplo.com"],
  "comando": "config user.email",
  "anotaciones": [
    { "fragmento": "config user.email", "nota": "equipo@ejemplo.com — este comando, ejecutado sin --global, escribe la configuración en .git/config, solo para este repositorio concreto. El resto de repositorios de la misma máquina no se enteran del cambio." }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres niveles, el más específico gana",
  "roles": [
    { "etiqueta": "Local (por defecto)", "rol": "Solo este repositorio", "descripcion": "Se guarda en .git/config. Útil cuando un proyecto concreto necesita un email distinto (por ejemplo, el de trabajo frente al personal)." },
    { "etiqueta": "--global", "rol": "Todos tus repositorios", "descripcion": "Se guarda en tu configuración de usuario del sistema. Es lo que casi todo el mundo configura la primera vez que instala Git." },
    { "etiqueta": "--system", "rol": "Toda la máquina, todos los usuarios", "descripcion": "El nivel menos habitual — configuración compartida por cualquiera que use esa máquina, sea cual sea su usuario." }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Si hay valor local, gana al global — y el global gana al de sistema.", "texto": "Git busca de más específico a más general y se queda con el primero que encuentra. Por eso configurar un email de trabajo en un repositorio concreto no afecta a los demás." },
    { "titulo": "user.name/user.email no son las únicas claves configurables.", "texto": "core.editor, alias.*, pull.rebase... prácticamente cualquier comportamiento de Git es configurable con el mismo mecanismo de tres niveles." }
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
      "titulo": "git-config",
      "descripcion": "Referencia oficial de git config y sus niveles.",
      "url": "https://git-scm.com/docs/git-config",
      "etiqueta": "Git Reference"
    }
  ]
}
```
