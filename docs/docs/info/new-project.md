---
sidebar_position: 2
id: new-project
title: Iniciación manual de proyectos
description: Pasos para crear un nuevo proyecto manualmente en el workspace.
---

Esta guía detalla el proceso manual que ya se automatiza en la [gestión de proyectos](../getting-started/manage-project.md).

1. Inicia un nuevo proyecto

```bash
pnpm ng g app nombre-del-proyecto --style=css
```

2. Server-Side Rendering (SSR)? **No**

3. Copia todo el contenido de la carpeta `base/` del workspace en `nombre-del-proyecto/`.

:::info
Los contenidos copiados nos sirven para: 
- Cargar los logos institucionales
- Habilitar TailwindCSS (usado por por los componentes)
:::

5. Agrega lo siguiente en el `angular.json` del workspace:
```json
{
  "projects": {
    "nombre-del-proyecto": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "node_modules/@taiga-ui/icons/src",
                "output": "assets/taiga-ui/icons"
              }
            ],
            "styles": [
              "node_modules/@taiga-ui/styles/taiga-ui-theme.less",
              "projects/shared-ui/src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

6. Modifica el `package.json` de esta manera:
```json
{
  "scripts": {
    "start:nombre-del-proyecto": "pnpm build:ui && ng serve nombre-del-proyecto --open"
  }
}
```
