# Gestión de Equipos - API Documentation

## Descripción General

El sistema de gestión de equipos permite a los administradores crear, editar, eliminar y gestionar equipos, así como asignar usuarios y editores a estos equipos.

## Características Principales

- **Solo Administradores**: Únicamente usuarios con rol `ADMIN` pueden gestionar equipos
- **CRUD Completo**: Crear, leer, actualizar y eliminar equipos
- **Asignación de Usuarios**: Asignar usuarios y editores a equipos específicos
- **Validaciones**: Verificaciones de integridad y unicidad de nombres
- **Relaciones**: Gestión de relaciones entre usuarios y equipos

## Endpoints Disponibles

### 1. Crear Equipo
- **Método**: POST
- **URL**: `/teams`
- **Autenticación**: JWT Bearer Token (ADMIN)
- **Cuerpo de la petición**:
```json
{
  "name": "Equipo Norte",
  "description": "Equipo encargado de la región norte del país"
}
```

### 2. Obtener Todos los Equipos
- **Método**: GET
- **URL**: `/teams`
- **Autenticación**: JWT Bearer Token (ADMIN)

### 3. Obtener Equipo por ID
- **Método**: GET
- **URL**: `/teams/:id`
- **Autenticación**: JWT Bearer Token (ADMIN)

### 4. Actualizar Equipo
- **Método**: PATCH
- **URL**: `/teams/:id`
- **Autenticación**: JWT Bearer Token (ADMIN)
- **Cuerpo de la petición**:
```json
{
  "name": "Equipo Norte Actualizado",
  "description": "Nueva descripción del equipo"
}
```

### 5. Eliminar Equipo
- **Método**: DELETE
- **URL**: `/teams/:id`
- **Autenticación**: JWT Bearer Token (ADMIN)
- **Nota**: No se puede eliminar un equipo que tenga usuarios asignados

### 6. Asignar Equipo a Usuario
- **Método**: POST
- **URL**: `/teams/assign`
- **Autenticación**: JWT Bearer Token (ADMIN)
- **Cuerpo de la petición**:
```json
{
  "userId": "uuid-del-usuario",
  "teamId": "uuid-del-equipo"
}
```

### 7. Desasignar Usuario de Equipo
- **Método**: DELETE
- **URL**: `/teams/unassign/:userId`
- **Autenticación**: JWT Bearer Token (ADMIN)

### 8. Obtener Usuarios de un Equipo
- **Método**: GET
- **URL**: `/teams/:id/users`
- **Autenticación**: JWT Bearer Token (ADMIN)

### 9. Obtener Usuarios Sin Equipo
- **Método**: GET
- **URL**: `/teams/users/without-team`
- **Autenticación**: JWT Bearer Token (ADMIN)

## DTOs (Data Transfer Objects)

### CreateTeamDto
```typescript
{
  name: string;        // Requerido, mínimo 2 caracteres
  description?: string; // Opcional
}
```

### UpdateTeamDto
```typescript
{
  name?: string;        // Opcional, mínimo 2 caracteres
  description?: string; // Opcional
}
```

### AssignTeamDto
```typescript
{
  userId: string;      // Requerido, UUID válido
  teamId: string;      // Requerido, UUID válido
}
```

## Validaciones Implementadas

1. **Nombres Únicos**: No pueden existir dos equipos con el mismo nombre
2. **UUIDs Válidos**: Validación de formato UUID para IDs
3. **Longitud de Nombres**: Mínimo 2 caracteres para nombres de equipos
4. **Integridad Referencial**: No se puede eliminar un equipo con usuarios asignados
5. **Existencia de Entidades**: Verificación de que usuarios y equipos existan antes de asignaciones

## Códigos de Respuesta HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Eliminación exitosa
- **400 Bad Request**: Error de validación o regla de negocio
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Sin permisos (no es admin)
- **404 Not Found**: Recurso no encontrado

## Ejemplos de Uso

### Crear un equipo
```bash
curl -X POST http://localhost:3000/teams \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Equipo Desarrollo",
    "description": "Equipo de desarrollo de software"
  }'
```

### Asignar usuario a equipo
```bash
curl -X POST http://localhost:3000/teams/assign \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usuario-uuid",
    "teamId": "equipo-uuid"
  }'
```

### Obtener usuarios de un equipo
```bash
curl -X GET http://localhost:3000/teams/equipo-uuid/users \
  -H "Authorization: Bearer your-jwt-token"
```

## Arquitectura de Archivos

```
src/teams/
├── dto/
│   ├── assign-team.dto.ts
│   ├── create-team.dto.ts
│   └── update-team.dto.ts
├── entities/
│   └── team.entity.ts
├── teams.controller.ts
├── teams.module.ts
└── teams.service.ts
```

## Integración con Otros Módulos

- **UsersModule**: Relación directa para asignación de usuarios
- **AuthModule**: Autenticación y autorización
- **AppModule**: Módulo principal que registra TeamsModule

## Notas de Implementación

1. Todos los endpoints requieren autenticación JWT
2. Solo usuarios con rol `ADMIN` pueden acceder a estos endpoints
3. Las validaciones se aplican tanto en DTOs como en la lógica de negocio
4. Los equipos mantienen relaciones bidireccionales con usuarios
5. Se implementan verificaciones de integridad antes de eliminaciones