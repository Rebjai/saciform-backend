# 📍 API Municipios - Sacifor Backend

API completa para gestión de municipios con borrado lógico y filtros avanzados.

## 📋 Estructura de Datos

```typescript
Municipality {
  id: string;          // UUID único
  code: string;        // Código único del municipio (ej: "TGU01")
  name: string;        // Nombre del municipio
  district: string;    // Distrito al que pertenece
  isActive: boolean;   // Estado activo/inactivo (borrado lógico)
  createdAt: Date;     // Fecha de creación
  updatedAt: Date;     // Fecha de última actualización
}
```

## 🔐 Permisos por Rol

| Endpoint | USER | EDITOR | ADMIN |
|----------|------|--------|-------|
| GET /municipalities | ✅ | ✅ | ✅ |
| GET /municipalities/:id | ✅ | ✅ | ✅ |
| POST /municipalities | ❌ | ✅ | ✅ |
| PATCH /municipalities/:id | ❌ | ✅ | ✅ |
| DELETE /municipalities/:id | ❌ | ❌ | ✅ |
| PATCH /municipalities/:id/restore | ❌ | ❌ | ✅ |
| GET con includeInactive=true | ❌ | ❌ | ✅ |

## 🔧 Endpoints

### ➕ Crear Municipio

**POST** `/municipalities`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Permisos:** EDITOR, ADMIN

**Body:**
```json
{
  "code": "TGU01",
  "name": "Tegucigalpa",
  "district": "Distrito Central"
}
```

**Respuesta 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "TGU01",
  "name": "Tegucigalpa",
  "district": "Distrito Central",
  "isActive": true,
  "createdAt": "2025-12-30T08:00:00.000Z",
  "updatedAt": "2025-12-30T08:00:00.000Z"
}
```

**Errores:**
- `400` - Datos inválidos o código duplicado
- `401` - Token inválido
- `403` - Permisos insuficientes

---

### 📋 Obtener Todos los Municipios

**GET** `/municipalities`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** USER, EDITOR, ADMIN

**Query Parameters (opcionales):**
- `district` - Filtrar por distrito
- `name` - Filtrar por nombre exacto
- `code` - Buscar por código específico
- `includeInactive` - Solo ADMIN puede usar `true`

**Ejemplos:**

```bash
# Obtener todos los municipios activos
GET /municipalities

# Filtrar por distrito
GET /municipalities?district=Cortés

# Buscar por código
GET /municipalities?code=TGU01

# Ver todos incluyendo inactivos (solo ADMIN)
GET /municipalities?includeInactive=true
```

**Respuesta 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "TGU01", 
    "name": "Tegucigalpa",
    "district": "Distrito Central",
    "isActive": true,
    "createdAt": "2025-12-30T08:00:00.000Z",
    "updatedAt": "2025-12-30T08:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "code": "SPS01",
    "name": "San Pedro Sula", 
    "district": "San Pedro Sula",
    "isActive": true,
    "createdAt": "2025-12-30T08:05:00.000Z",
    "updatedAt": "2025-12-30T08:05:00.000Z"
  }
]
```

---

### 🔍 Obtener Municipio por ID

**GET** `/municipalities/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** USER, EDITOR, ADMIN

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "TGU01",
  "name": "Tegucigalpa", 
  "district": "Distrito Central",
  "isActive": true,
  "createdAt": "2025-12-30T08:00:00.000Z",
  "updatedAt": "2025-12-30T08:00:00.000Z"
}
```

**Errores:**
- `404` - Municipio no encontrado o inactivo

---

### ✏️ Actualizar Municipio

**PATCH** `/municipalities/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Permisos:** EDITOR, ADMIN

**Body (todos los campos opcionales):**
```json
{
  "code": "TGU02",
  "name": "Tegucigalpa Centro",
  "district": "Distrito Central Modificado"
}
```

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "TGU02",
  "name": "Tegucigalpa Centro",
  "district": "Distrito Central Modificado", 
  "isActive": true,
  "createdAt": "2025-12-30T08:00:00.000Z",
  "updatedAt": "2025-12-30T08:30:00.000Z"
}
```

---

### 🗑️ Eliminar Municipio (Borrado Lógico)

**DELETE** `/municipalities/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** ADMIN únicamente

**Respuesta 200:**
```json
{
  "message": "Municipio eliminado correctamente"
}
```

**Nota:** El municipio se marca como `isActive: false` pero se conserva en la base de datos junto con todas las relaciones (responses asociadas).

---

### 🔄 Restaurar Municipio

**PATCH** `/municipalities/:id/restore`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** ADMIN únicamente

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "TGU01",
  "name": "Tegucigalpa",
  "district": "Distrito Central",
  "isActive": true,
  "createdAt": "2025-12-30T08:00:00.000Z",
  "updatedAt": "2025-12-30T08:45:00.000Z"
}
```

---

## 🔗 Integración con Responses

Los municipios se integran con el módulo de respuestas a través del campo `municipalityId`:

```json
// Al crear una response
POST /responses
{
  "surveyId": "local_actors_interview_v1",
  "answers": {"question1": "answer1"},
  "municipalityId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validaciones:**
- Solo se pueden asociar municipios activos (`isActive: true`)
- El campo `municipalityId` es opcional
- Si se proporciona, debe existir y estar activo

---

## 📝 Ejemplos de Uso Completos

### Crear y gestionar municipio completo:

```bash
# 1. Crear municipio
curl -X POST http://localhost:3000/municipalities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CHO01",
    "name": "Choloma", 
    "district": "Choloma"
  }'

# 2. Obtener todos los municipios
curl -X GET http://localhost:3000/municipalities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Buscar por distrito
curl -X GET "http://localhost:3000/municipalities?district=Cortés" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Actualizar municipio
curl -X PATCH http://localhost:3000/municipalities/MUNICIPALITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Choloma Actualizado"
  }'

# 5. Eliminar municipio (solo ADMIN)
curl -X DELETE http://localhost:3000/municipalities/MUNICIPALITY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 6. Ver municipios incluyendo inactivos (solo ADMIN)
curl -X GET "http://localhost:3000/municipalities?includeInactive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 7. Restaurar municipio (solo ADMIN)
curl -X PATCH http://localhost:3000/municipalities/MUNICIPALITY_ID/restore \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Asociar municipio a respuesta:

```bash
# Crear respuesta asociada a municipio
curl -X POST http://localhost:3000/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "community_survey_v1",
    "answers": {
      "community_name": "Aldea San José",
      "population": 150,
      "main_activities": ["agriculture", "livestock"]
    },
    "municipalityId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "draft"
  }'
```

---

## ⚠️ Consideraciones Importantes

1. **Borrado Lógico:** Los municipios nunca se eliminan físicamente para preservar la integridad referencial
2. **Códigos Únicos:** El campo `code` debe ser único en toda la base de datos
3. **Filtrado Automático:** Por defecto solo se muestran municipios activos
4. **Permisos Estrictos:** Solo ADMIN puede eliminar/restaurar municipios
5. **Integridad:** No se pueden asociar responses a municipios inactivos