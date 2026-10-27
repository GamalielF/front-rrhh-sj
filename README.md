# Roles de pago — Frontend (COOPSANJOSE LTDA)

Aplicación Angular para consultar y gestionar los roles de pago. Cada empleado ve su propio rol; RRHH carga y publica los roles
de cada mes; los administradores gestionan usuarios, el directorio y la auditoría. Se apoya en el framework institucional **Lumen**
y consume el backend `rol-pagos-backend_final`.

- **Proyecto:** `roles_de_pago_sj` (Angular 22, TypeScript, Tailwind 4, Taiga UI)
- **Backend:** ver su README y `docs/API.md` (contrato de cada endpoint)

## Requisitos

- Node.js **22.22.3 o superior** (lo exige el Angular CLI)
- pnpm 12 (`corepack enable` lo instala)
- El backend corriendo en `http://localhost:8080` (ver su README: `sh docker/dev-up.sh` y ejecutar la aplicación)

## Arranque

```bash
pnpm install
pnpm start:roles_de_pago_sj      # compila las librerías y abre http://localhost:4200
```

El inicio de sesión es el institucional (usuario y contraseña del AD, y el código de Google Authenticator). Lo resuelve el
autenticador; este proyecto no guarda contraseñas ni genera tokens.

## Configuración

Los entornos están en `projects/roles_de_pago_sj/src/env/`:

| Variable | Qué es |
|---|---|
| `loginUrl`, `mfaVerifyUrl`, `refreshUrl` | Servicios del autenticador |
| `apiBaseUrl`, `userProfileUrl` | Servicio de analítica del AD (perfil del usuario). **No se cambian**: el encabezado de Lumen depende de ellos |
| `rolesPagoApiUrl` | El backend de roles de pago. En producción hay que reemplazar el marcador `DOMINIO-DEL-BACKEND` |

## Quién ve qué

| Pantalla | Ruta | Quién |
|---|---|---|
| Inicio | `/home` | Todos |
| Mi rol de pago | `/mi-rol` | Todos (pide la cédula) |
| Períodos (carga, cuadre, publicación, avisos) | `/rrhh/periodos` | RRHH y ADMIN |
| Usuarios y roles | `/admin/usuarios` | ADMIN |
| Directorio | `/admin/directorio` | ADMIN |
| Auditoría | `/admin/auditoria` | ADMIN |

Los roles **no** vienen en el token: salen del backend (`mi-perfil`) y deciden el menú y los guardianes de ruta. La seguridad real
la aplica siempre el servidor; el front solo evita mostrar lo que no corresponde.

## Estructura

```
projects/roles_de_pago_sj/src/app/
  core/       guardianes, menú, modelos del contrato, servicios y utilidades comunes
  features/   una carpeta por pantalla: home, mi-rol-pago, rrhh, admin, login
  shared/     componentes reutilizables (visor de PDF, avisos, confirmación)
```

## Reglas del proyecto

- **Nunca se modifica `libs/`** (el framework Lumen es de solo lectura). Se usan sus componentes y `ApiService` para toda petición.
- Cada componente: `.ts` solo con lógica de presentación, tipos en `.model.ts`, funciones puras en `.util.ts`, y un `index.ts`.
- Ningún archivo pasa de 200 líneas.

## Pruebas y compilación

```bash
pnpm test roles_de_pago_sj -- --watch=false     # pruebas unitarias
pnpm build:roles_de_pago_sj                     # compilación de producción

