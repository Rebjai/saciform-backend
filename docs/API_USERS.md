# 👥 API Gestión de Usuarios (Admin)

Sistema de gestión de usuarios y editores reservado para administradores.

## 🔐 Autorización
Todos los endpoints requieren:
- **JWT Bearer Token**
- **Rol**: `ADMIN` únicamente

## 📋 Endpoints

### 🆕 Crear Usuario
```http
POST /users
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "email": "editor@example.com",
  "name": "Juan Editor",
  "password": "password123",
  "role": "editor",
  "teamId": "uuid-del-equipo"  // ⚠️ OPCIONAL - Se puede crear sin equipo
}
```

**Crear usuario sin equipo asignado:**
```http
POST /users
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "email": "nuevo@example.com",
  "name": "Usuario Nuevo",
  "password": "password123",
  "role": "user"
  // teamId no es requerido
}
```

**Respuesta:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "editor@example.com",
    "name": "Juan Editor",
    "role": "editor",
    "teamId": "uuid-del-equipo",
    "team": {
      "id": "uuid-del-equipo",
      "name": "Equipo Norte"
    },
    "createdAt": "2026-01-03T10:00:00Z",
    "updatedAt": "2026-01-03T10:00:00Z"
  }
}
```

### 📋 Listar Todos los Usuarios
```http
GET /users
Authorization: Bearer {jwt_token}
```

**Respuesta:**
```json
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": "uuid",
      "email": "admin@example.com", 
      "name": "Admin User",
      "role": "admin",
      "team": {...},
      "createdAt": "2026-01-03T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 👨‍💼 Listar Solo Editores
```http
GET /users/editors
Authorization: Bearer {jwt_token}
```

### 👥 Listar Usuarios por Equipo
```http
GET /users/team/{teamId}
Authorization: Bearer {jwt_token}
```

### 👤 Obtener Usuario por ID
```http
GET /users/{userId}
Authorization: Bearer {jwt_token}
```

### ✏️ Actualizar Usuario
```http
PATCH /users/{userId}
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "Nuevo Nombre",
  "role": "user",
  "teamId": "nuevo-equipo-uuid"
}
```

### 🗑️ Eliminar Usuario
```http
DELETE /users/{userId}
Authorization: Bearer {jwt_token}
```

## 🛡️ Reglas de Negocio

### ✅ Validaciones
- Email único en el sistema
- Contraseña mínimo 6 caracteres
- **Team es OPCIONAL**: Se puede crear usuario sin equipo y asignarlo después
- Roles válidos: `user`, `editor`, `admin`
- Si se proporciona teamId, debe existir el equipo

### 🚫 Restricciones de Seguridad
- **No eliminar último admin**: Sistema previene eliminar el último usuario admin
- **Contraseñas hasheadas**: Siempre se almacenan con bcrypt
- **Sin contraseñas en respuestas**: Las contraseñas nunca se devuelven en las APIs

### 📊 Casos de Uso Típicos

#### Crear y Asignar Usuario Después
```bash
# 1. Admin crea usuario sin equipo
POST /users {
  "email": "nuevo@example.com",
  "name": "Usuario Nuevo", 
  "password": "password123",
  "role": "user"
  // Sin teamId
}

# 2. Admin crea equipo
POST /teams {
  "name": "Equipo Sur",
  "description": "Zona sur de la ciudad"
}

# 3. Admin asigna usuario al equipo
PATCH /users/{userId} {
  "teamId": "equipo-sur-uuid"
}
```

#### Gestionar Usuarios Problemáticos
```bash
# 1. Cambiar de equipo
PATCH /users/{userId} {
  "teamId": "nuevo-equipo-uuid"
}

# 2. Degradar permisos
PATCH /users/{userId} {
  "role": "user"  
}

# 3. Eliminar usuario si es necesario
DELETE /users/{userId}
```

## 🔍 Códigos de Error

| Código | Descripción |
|--------|-------------|
| `400` | Email ya existe / Datos inválidos |
| `401` | Token JWT inválido |
| `403` | Sin permisos de admin / Operación no permitida |
| `404` | Usuario o equipo no encontrado |

## 📝 Notas Técnicas

- **Paginación**: Por implementar en versiones futuras
- **Filtros**: Actualmente solo por equipo y rol

## 🆕 Endpoints Adicionales

### 👥 Obtener Usuarios Sin Equipo
```http
GET /users/without-team
Authorization: Bearer {jwt_token}
```

**Descripción**: Obtiene todos los usuarios activos que no tienen equipo asignado.

**Respuesta exitosa (200)**:
```json
{
  "message": "Users without team retrieved successfully",
  "users": [
    {
      "id": "usuario-uuid",
      "email": "sin.equipo@example.com",
      "name": "Usuario Sin Equipo",
      "role": "user",
      "teamId": null,
      "team": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Casos de uso**: 
- Identificar usuarios que necesitan ser asignados a equipos
- Facilitar la gestión de usuarios recién creados
- Reportes de usuarios sin asignación
- **Auditoría**: Las acciones se registrarán en bitácora (próxima versión)
- **Bulk Operations**: Operaciones masivas pendientes de implementar