---
sidebar_position: 1
id: http-intro
title: HTTP Library
description: Servicio simplificado para peticiones HTTP en aplicaciones Angular.
---

# HTTP Library

La librería `@lumen/http` proporciona un servicio simplificado y configurado para realizar peticiones HTTP en aplicaciones Angular. Ofrece una capa de abstracción sobre `HttpClient` con configuración centralizada y manejo simplificado de parámetros.

## Características

- **Configuración centralizada**: Base URL y headers por defecto
- **Métodos simplificados**: GET, POST, PUT, PATCH, DELETE con tipado
- **Manejo de parámetros**: Soporte para query params y headers
- **URL resolution**: Resolución automática de URLs relativas vs absolutas
- **Type-safe**: Soporte completo de TypeScript

## Componentes

La librería está organizada en los siguientes módulos:

- **Servicios**: `ApiService` - Servicio principal para peticiones HTTP
- **Modelos**: Interfaces TypeScript para opciones y configuración
- **Tokens**: Tokens de inyección de dependencias para configuración
