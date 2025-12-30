# 🔐 API Autenticación - Sacifor Backend

Sistema de autenticación JWT con roles jerárquicos y gestión de usuarios.

## 🎭 Roles del Sistema

| Rol | Nivel | Descripción |
|-----|-------|-------------|
| **USER** | 1 | Usuario básico - Solo acceso de lectura limitado |
| **EDITOR** | 2 | Editor - Puede crear, leer y actualizar contenido |
| **ADMIN** | 3 | Administrador - Acceso completo al sistema |

**Jerarquía:** ADMIN > EDITOR > USER

---

## 👤 Estructura de Usuario

```typescript
User {
  id: string;           // UUID único
  email: string;        // Email único (usuario)
  password: string;     // Hash bcrypt
  name: string;         // Nombre completo
  role: UserRole;       // Rol del usuario
  createdAt: Date;      // Fecha de creación
  updatedAt: Date;      // Fecha de actualización
}

enum UserRole {
  USER = 'user',
  EDITOR = 'editor', 
  ADMIN = 'admin'
}
```

---

## 🔧 Endpoints de Autenticación

### 📝 Registro de Usuario

**POST** `/auth/register`

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!",
  "name": "Juan Pérez"
}
```

**Validaciones:**
- Email debe ser válido y único
- Password mínimo 6 caracteres
- Nombre requerido

**Respuesta 201:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com", 
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

**Errores:**
- `400` - Email ya existe
- `400` - Validación de datos falló

---

### 🔑 Iniciar Sesión

**POST** `/auth/login`

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!"
}
```

**Respuesta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez", 
    "role": "user"
  }
}
```

**Token JWT Payload:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "role": "user",
  "iat": 1640995200,
  "exp": 1641081600
}
```

**Errores:**
- `401` - Credenciales inválidas
- `400` - Datos de entrada inválidos

---

### 👤 Perfil del Usuario

**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "role": "user",
  "createdAt": "2025-12-30T08:15:16.179Z",
  "updatedAt": "2025-12-30T08:15:16.179Z"
}
```

**Errores:**
- `401` - Token inválido o expirado

---

## 🛡️ Autorización y Permisos

### Uso del Token JWT

Incluir en todas las peticiones protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Guards de Rol

Los endpoints están protegidos según roles requeridos:

```typescript
// Solo usuarios autenticados
@UseGuards(JwtAuthGuard)

// Solo EDITOR y ADMIN
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EDITOR)

// Solo ADMIN
@UseGuards(JwtAuthGuard, RolesGuard) 
@Roles(UserRole.ADMIN)
```

### Matriz de Permisos por Módulo

| Módulo | Acción | USER | EDITOR | ADMIN |
|--------|--------|------|--------|-------|
| **Municipios** | Listar activos | ✅ | ✅ | ✅ |
| | Crear | ❌ | ✅ | ✅ |
| | Actualizar | ❌ | ✅ | ✅ |
| | Eliminar (lógico) | ❌ | ❌ | ✅ |
| | Restaurar | ❌ | ❌ | ✅ |
| | Ver eliminados | ❌ | ❌ | ✅ |
| **Respuestas** | Ver propias | ✅ | ❌ | ❌ |
| | Ver todas | ❌ | ✅ | ✅ |
| | Crear | ✅ | ✅ | ✅ |
| | Editar propia (draft) | ✅ | ✅ | ✅ |
| | Editar cualquiera | ❌ | ✅ | ✅ |
| | Editar finalizada | ❌ | ✅ | ✅ |
| | Eliminar | ❌ | ✅ | ✅ |
| **Archivos** | Subir | ✅ | ✅ | ✅ |
| | Descargar | ✅ | ✅ | ✅ |

---

## 📝 Ejemplos de Uso

### Flujo completo de autenticación:

```bash
# 1. Registrar nuevo usuario
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@ejemplo.com",
    "password": "MiPassword123!",
    "name": "María García"
  }'

# 2. Iniciar sesión 
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@ejemplo.com", 
    "password": "MiPassword123!"
  }'

# Respuesta incluye token:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }

# 3. Usar token para acceder a endpoints protegidos
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Crear una respuesta (ejemplo de uso del token)
curl -X POST http://localhost:3000/responses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "test_survey_v1",
    "answers": {"question1": "answer1"}
  }'
```

### Manejo de errores de autenticación:

```bash
# Token expirado o inválido
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer token_invalido"

# Respuesta 401:
# {
#   "statusCode": 401,
#   "message": "Unauthorized" 
# }

# Sin token
curl -X GET http://localhost:3000/responses

# Respuesta 401:
# {
#   "statusCode": 401,
#   "message": "Unauthorized"
# }

# Rol insuficiente (USER intentando eliminar respuesta)
curl -X DELETE http://localhost:3000/responses/some-id \
  -H "Authorization: Bearer user_token"

# Respuesta 403:
# {
#   "statusCode": 403,
#   "message": "Forbidden resource"
# }
```

---

## 🔒 Seguridad

### Configuración JWT

- **Algoritmo:** HS256
- **Expiración:** 24 horas (configurable)
- **Secret:** Variable de entorno `JWT_SECRET`

### Hashing de Contraseñas

- **Algoritmo:** bcrypt
- **Salt rounds:** 10
- Las contraseñas nunca se almacenan en texto plano

### Variables de Entorno Requeridas

```env
# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_min_32_chars

# Opcional: Tiempo de expiración (default: 24h)
JWT_EXPIRATION=24h
```

---

## ⚠️ Consideraciones Importantes

1. **Registro Abierto:** Cualquiera puede registrarse como USER
2. **Promoción de Roles:** Solo ADMINs pueden cambiar roles (futura funcionalidad)
3. **Token Único:** Un usuario puede tener múltiples tokens activos
4. **Expiración:** Los tokens expiran en 24 horas por defecto
5. **Validación:** Todos los endpoints verifican la validez del token
6. **Roles Jerárquicos:** ADMIN puede hacer todo lo que EDITOR, EDITOR todo lo que USER
7. **Sin Refresh Tokens:** Implementación simple, re-login requerido al expirar

---

## 🚀 Próximas Funcionalidades

- [ ] Cambio de contraseña
- [ ] Recuperación de contraseña por email  
- [ ] Refresh tokens
- [ ] Gestión de usuarios por administradores
- [ ] Logs de actividad de autenticación
- [ ] Bloqueo de cuentas por intentos fallidos