# 👥 API Gestión de Usuarios

Sistema de gestión de usuarios y editores.

## 🔐 Autorización
Todos los endpoints requieren:
- **JWT Bearer Token**
- **Roles permitidos**: 
  - `ADMIN`: Acceso completo a gestión de usuarios
  - `EDITOR`: Puede crear usuarios normales para su equipo

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

### � Crear Usuario por EDITOR
```http
POST /users/create-team-user
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "email": "usuario@example.com",
  "name": "Usuario del Equipo",
  "password": "password123"
}
```

**Requisitos:**
- 🔐 **Rol**: `EDITOR` únicamente  
- ✅ **Editor debe tener equipo asignado**
- 🎯 **Solo crea usuarios con rol USER**
- 🔄 **Usuario se asigna automáticamente al equipo del editor**

**Respuesta exitosa:**
```json
{
  "message": "User created successfully and assigned to your team",
  "user": {
    "id": "uuid-generado",
    "email": "usuario@example.com",
    "name": "Usuario del Equipo",
    "role": "user",
    "teamId": "uuid-del-equipo-del-editor",
    "team": {
      "id": "uuid-del-equipo-del-editor",
      "name": "Equipo Alpha"
    },
    "createdAt": "2026-01-05T10:00:00Z",
    "updatedAt": "2026-01-05T10:00:00Z"
  }
}
```

**Errores:**
- `400`: Editor no tiene equipo asignado / Email ya existe
- `401`: Token inválido
- `403`: Usuario no es EDITOR

### �📋 Listar Todos los Usuarios
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

### 🔐 Cambiar Contraseña (Usuario)
```http
PATCH /auth/change-password
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña"
}
```

#### ✅ Respuesta Exitosa
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Password updated successfully"
}
```

#### ❌ Errores Comunes
```http
# Contraseña actual incorrecta
HTTP/1.1 400 Bad Request
{
  "statusCode": 400,
  "message": "Current password is incorrect",
  "error": "Bad Request"
}

# Nueva contraseña no válida
HTTP/1.1 400 Bad Request
{
  "statusCode": 400,
  "message": [
    "newPassword must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

## 🛡️ Reglas de Negocio

### ✅ Validaciones
- Email único en el sistema
- Contraseña mínimo 6 caracteres
- **Team es OPCIONAL**: Se puede crear usuario sin equipo y asignarlo después
- Roles válidos: `user`, `editor`, `admin`
- Si se proporciona teamId, debe existir el equipo
- **Cambio de contraseña**: Requiere contraseña actual correcta antes del cambio

### 🚫 Restricciones de Seguridad
- **No eliminar último admin**: Sistema previene eliminar el último usuario admin
- **Contraseñas hasheadas**: Siempre se almacenan con bcrypt
- **Sin contraseñas en respuestas**: Las contraseñas nunca se devuelven en las APIs
- **Verificación de identidad**: Cambio de contraseña requiere autenticación JWT
- **Validación previa**: Debe proporcionar contraseña actual para cambiar por nueva

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

#### Editor Creando Usuarios para su Equipo
```bash
# 1. Editor debe tener equipo asignado previamente por admin
GET /users/{editorId} 
# Verificar que editor.teamId no sea null

# 2. Editor crea usuario normal para su equipo
POST /users/create-team-user {
  "email": "miembro@example.com",
  "name": "Nuevo Miembro",
  "password": "password123"
  // NO enviar role ni teamId - se asignan automáticamente
}

# 3. Usuario se crea con:
# - role: "user" (automático)
# - teamId: mismo del editor (automático)
# - asignado al equipo del editor
```

#### Usuario Cambiando Su Contraseña
```bash
# Usuario autenticado cambia su propia contraseña
PATCH /auth/change-password
Authorization: Bearer {jwt_token}
{
  "currentPassword": "mi_contraseña_actual",
  "newPassword": "nueva_contraseña_segura"
}

# Resultado: Solo el usuario puede cambiar su propia contraseña
# - Se valida la contraseña actual
# - Se hashe la nueva contraseña
# - Tokens JWT existentes siguen siendo válidos
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
| `400` | Email ya existe / Datos inválidos / Editor sin equipo asignado / Contraseña actual incorrecta |
| `401` | Token JWT inválido |
| `403` | Sin permisos de admin/editor / Operación no permitida |
| `404` | Usuario o equipo no encontrado |

## 📈 Resumen de Endpoints

### 👑 Solo ADMIN
- `POST /users` - Crear cualquier tipo de usuario
- `GET /users` - Listar todos los usuarios
- `GET /users/editors` - Listar solo editores
- `GET /users/without-team` - Usuarios sin equipo
- `GET /users/team/:id` - Usuarios por equipo
- `GET /users/:id` - Usuario específico
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### 🔐 Autenticación
- `PATCH /auth/change-password` - Cambiar contraseña propia

### ✏️ Solo EDITOR
- `POST /users/create-team-user` - Crear usuario normal para su equipo

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