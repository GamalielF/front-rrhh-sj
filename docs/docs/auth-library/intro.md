---
sidebar_position: 1
id: auth-intro
title: Auth Library
description: Sistema de autenticación y autorización para aplicaciones Angular.
---

# Auth Library

La librería `@lumen/auth` proporciona un sistema completo de autenticación y autorización para aplicaciones Angular. Incluye servicios para gestión de sesiones, guards de ruta, interceptores HTTP y manejo de tokens.

## Características

- **Gestión de sesiones**: Login, logout, y almacenamiento de tokens
- **Guards de ruta**: Protección de rutas basada en autenticación y roles
- **Interceptores HTTP**: Inyección automática de tokens y refresh de tokens
- **Soporte multiplataforma**: Funciona tanto en navegador como en servidor
- **Configuración flexible**: Personalización de URLs y comportamiento

## Componentes

La librería está organizada en los siguientes módulos:

- **Servicios**: `AuthService` - Gestión de autenticación
- **Guards**: `authGuard`, `guestGuard`, `roleGuard` - Protección de rutas
- **Interceptores**: `authInterceptor` - Inyección de tokens en peticiones HTTP
- **Modelos**: Interfaces TypeScript para tipos de datos
- **Tokens**: Tokens de inyección de dependencias
