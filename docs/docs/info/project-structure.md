---
sidebar_position: 1
id: project-structure
title: Estructura del proyecto
description: Información sobre la estructura de carpetas del workspace.
---

```
sanjose-workspace/
├── angular.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── README.md
├── skills/                            # SKILLs para agentes de IA
├── base/                              # Plantilla base de nuevos proyectos
├── scripts/
│   ├── new-project.mjs                # Crear nuevo proyecto
│   ├── register-project.mjs           # Registrar proyecto
│   └── remove-project.mjs             # Eliminar proyecto
├── libs/                              # Librerías compartidas
│   ├── auth/                          # Módulo de Autenticación
│   │   ├── ng-package.json
│   │   ├── package.json
│   │   └── src/
│   │       ├── public-api.ts
│   │       └── lib/
│   │           ├── guards/          
│   │           ├── interceptors/      
│   │           ├── models/            
│   │           ├── services/          
│   │           └── tokens/            
│   ├── base/                          # Assets y vistas reutilizables
│   │   ├── ng-package.json
│   │   ├── package.json
│   │   └── src/
│   │       ├── public-api.ts
│   │       ├── assets/                # Logos y favicon
│   │       └── lib/
│   │           ├── features/          # Vistas base
│   │           └── layout/            # Layouts base
│   ├── http/                          # Cliente HTTP
│   │   ├── ng-package.json
│   │   ├── package.json
│   │   └── src/
│   │       ├── public-api.ts
│   │       └── lib/
│   │           ├── models/            
│   │           ├── services/          
│   │           └── tokens/            
│   └── ui/                            # Sistema de Componentes UI
│       ├── ng-package.json
│       ├── package.json
│       ├── README.md
│       └── src/
│           ├── public-api.ts
│           ├── styles.css
│           └── lib/
│               ├── layout/          
│               └── components/        # Componentes atómicos
│                   ├── badge/
│                   ├── breadcrumb/
│                   ├── button/
│                   ├── card/
│                   ├── dropdown/
│                   ├── form/          
│                   ├── grid/          
│                   ├── icon/
│                   ├── input/
│                   ├── kpi-card/
│                   ├── link/
│                   ├── modal/
│                   ├── page-container/
│                   ├── page-header/
│                   ├── pagination/
│                   ├── table/
│                   └── user-profile-menu/
└── projects/                          # Proyectos
```