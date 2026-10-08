---
sidebar_position: 1
id: static-taiga
title: TaigaUI estático
description: Incorporar TaigaUI estáticamente.
---

Permite incorporar TaigaUI estáticamente en un proyecto Angular.

:::warning
Este procedimiento fue descartado porque se determinó que es mejor configurarlo desde el `angular.json` para posibilitar actualizaciones automáticas de las dependencias.
:::

### Procedimiento

1. Convertir los estilos .less de Taiga a .css:
```bash
npx -y lessc node_modules/@taiga-ui/styles/taiga-ui-theme.less projects/shared-ui/src/lib/styles/taiga-ui-theme.css
```

2. Importar estos estilos en `src/styles.css`:
```typescript
@import './lib/styles/taiga-ui-theme.css';
```

