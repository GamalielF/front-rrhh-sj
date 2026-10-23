# Reglas de Desarrollo y Arquitectura

## 1. Comandos de Workspace y CLI
- **Creación de proyectos:** Ejecutar `pnpm new <name>`.
- **Eliminación de proyectos:** Ejecutar `pnpm delete <name>`.
- **Stack obligatorio:** TypeScript + TailwindCSS.

## 2. Consumo y Uso de Librerías (@lumen)
- **Principio de Invariabilidad:** NUNCA modificar el paquete `@lumen`. Tratarlo como una dependencia de solo lectura. No agregar lógica o reglas de proyectos individuales dentro de `@lumen`.
- **Reutilización:** Antes de crear un nuevo componente, verificar la existencia de un componente equivalente en `@lumen`.
- **Variantes e Iconos:**
  - Utilizar las `variants` de `@lumen` para personalizar la apariencia en lugar de aplicar clases CSS/Tailwind ad-hoc.
  - Usar `<ui-icon>` o el atributo `icon="..."`. NUNCA incrustar SVGs ni fuentes de iconos directamente en el HTML.
- **Servicios de Red y Autenticación (`@lumen/http` y `@lumen/auth`):**
  - SIEMPRE utilizar `ApiService` (`import { ApiService } from '@lumen/http';`) para realizar peticiones HTTP (GET, POST, PATCH, PUT, DELETE).
  - El `ApiService` requiere estar configurado mediante `provideHttp({ baseUrl: env.apiBaseUrl })` en el proveedor de la aplicación. Gracias a esto, **basta con indicar únicamente el resto del path** al invocar los métodos HTTP (no se debe escribir la URL completa).
  - El servicio detecta automáticamente si la ruta enviada comienza con `https:` (o incluye un dominio completo), por lo que también soporta URLs absolutas cuando el caso de uso lo requiera explícitamente.
  - El `ApiService` adjunta de forma transparente el token `Bearer` de `@lumen/auth` y gestiona los parámetros de consulta (`params`), por lo que está prohibido implementar interceptores manuales o lógica repetitiva de headers en servicios de negocio.

## 3. Estructura e Módulos
- **Exportaciones:**
  - Cada directorio de componente DEBE incluir un `index.ts` con exportaciones explícitas.
  - Para componentes dentro de `@lumen/ui`, registrar la exportación en `libs/ui/src/public-api.ts`.
- **Estructura Modular de Archivos (por componente):**
  - `name.component.ts` → Exclusivamente lógica de presentación y binding de estado.
  - `name.component.html` → Exclusivamente maqueta y binding de datos/eventos.
  - `name.component.css` → Exclusivamente reglas de estilo específicas del componente.
  - `name.model.ts` → (Opcional) Interfaces y tipos de datos del dominio del componente.
  - `name.variant.ts` → (Opcional) Definición de variantes visuales/CVA.
  - `name.util.ts` → (Opcional) Funciones puras, helpers o transformaciones de datos.
  - `index.ts` → Barrel file para exportar la API pública del componente.

## 4. Principios de Arquitectura y Mantenibilidad
- **Principio de Responsabilidad Única (SRP):**
  - NUNCA declarar tipos o interfaces (`.model.ts`) dentro del archivo `.component.ts`.
  - NUNCA incluir funciones auxiliares o transformaciones de datos dentro del archivo `.component.ts`.
- **Límites de Complejidad y Extensión:**
  - Ningún archivo individual debe superar las 200 líneas de código.
  - Si un archivo excede este límite, refactorizar dividiéndolo en subcomponentes o servicios delegados.
- **Simplicidad (Clean Code):**
  - Priorizar soluciones con la menor huella de código posible (código declarativo, composición sobre herencia).

## 5. Limpieza, Nombres y Tipado Estricto (Reglas para IA)
- **Prohibición de Comentarios Redundantes:** NUNCA incluir comentarios narrativos o explicaciones obvias de código creados comúnmente por IA (ej. `// Importar Angular core`, `// Definir la variable name`, `// Función para manejar el click`). El código debe ser autoexplicativo.
- **Convenciones de Nombres Semánticos:** Nombrar variables, funciones, clases y componentes de forma intuitiva, descriptiva y siguiendo la convención del proyecto (`camelCase` para variables y métodos, `PascalCase` para componentes y modelos, `kebab-case` para archivos y selectores). Evitar nombres genéricos o abstractos como `data`, `item`, `res`, `handler` o `temp`.
- **Validación de Modelos e Integridad de Tipos:**
  - Verificar siempre la existencia del modelo en `@lumen` antes de definir tipos locales para evitar inconsistencias o tipos duplicados.
  - Asegurar la estricta compatibilidad de tipos (evitar errores de compilación como `undefined is not assignable to...`).
  - Utilizar tipado explícito, opcionales (`?`), asignación de valores por defecto o guardas de tipo (*type guards*) al mapear modelos en las entradas y salidas del componente.