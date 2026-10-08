---
sidebar_position: 1
id: base-intro
title: Base Library
description: Componentes base y layouts preconfigurados para aplicaciones Angular.
---

# Base Library

La librería `@lumen/base` proporciona componentes base y layouts preconfigurados para aplicaciones Angular. Incluye páginas comunes como login y layouts de dashboard integrados con el sistema de autenticación.

## Características

- **Components preconfigurados**: Login y Dashboard listos para usar
- **Integración con Auth**: Integración nativa con @lumen/auth
- **Layouts responsive**: Layouts de dashboard adaptativos
- **Customizable**: Componentes configurables mediante inputs
- **Standalone**: Componentes standalone de Angular

## Componentes

La librería está organizada en los siguientes módulos:

- **Features**: Componentes de páginas (`LumenHomeComponent`, `LumenLoginComponent`)
- **Layout**: Layout de dashboard (`LumenDashboardComponent`)

## Arquitectura

```
@lumen/base
├── features/
│   └── login/         - Página de login integrada con auth
└── layout/
    └── dashboard/     - Layout de dashboard con navegación
```
