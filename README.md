# Sacifor Backend

Sistema backend para gestión de formularios y encuestas con autenticación, roles y permisos.

## Descripción

Este proyecto es un backend desarrollado con NestJS para manejar:

- **Sistema de autenticación y autorización** con JWT
- **Roles y permisos granulares**: Admin, Editor, Aplicador
- **Gestión de formularios/encuestas** con esquemas JSON personalizables
- **Bitácora de cambios** para auditoría de acciones de usuarios
- **Operaciones CRUD** completas para todas las entidades

## Arquitectura de Roles

### 👑 Administrador (ADMIN)
- Crea y gestiona usuarios editores y aplicadores
- Crea esquemas de encuestas (JSON Schema personalizado)
- Acceso completo a todas las funcionalidades del sistema

### ✏️ Editor (EDITOR) 
- Gestiona usuarios aplicadores asignados
- Puede crear nuevos usuarios aplicadores
- Crea y edita encuestas
- Supervisa el trabajo de sus aplicadores

### 📝 Aplicador (APLICADOR)
- Crea instancias de encuestas disponibles
- Completa formularios asignados
- Acceso limitado a funcionalidades específicas

## Instalación

```bash
$ pnpm install
```

## Configuración

1. Crear archivo `.env` basado en `.env.example`
2. Configurar base de datos Mysql
3. Ejecutar migraciones

## Ejecutar la aplicación

```bash
# desarrollo
$ pnpm run start:dev

# producción
$ pnpm run start:prod
```

## Seed

Para poblar la base de datos con datos de prueba:

```bash
# ejecutar seeder
$ pnpm run seed
```

**Usuarios creados por defecto:**
- **Admin**: `admin@sacifor.com` / `admin123`
- **Editor**: `editor@sacifor.com` / `editor123`
- **User**: `user@sacifor.com` / `user123`

## Testing

```bash
# tests unitarios
$ pnpm run test

# tests e2e
$ pnpm run test:e2e

# cobertura de tests
$ pnpm run test:cov
```

## Tecnologías

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para base de datos
- **Mysql** - Base de datos principal
- **JWT** - Autenticación
- **Passport** - Estrategias de autenticación
- **Class Validator** - Validación de datos
- **JSON Schema** - Validación de formularios

## Estado del Proyecto

🚧 **En desarrollo** - Implementando sistema de roles y permisos

## Licencia

[MIT licensed](LICENSE)
