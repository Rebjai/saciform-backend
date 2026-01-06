# 📋 API Respuestas - Sacifor Backend

API para gestión de respuestas de cuestionarios con estructura JSON flexible, trazabilidad completa y asociación a municipios.

## 📊 Estructura de Datos

```typescript
Response {
  id: string;              // UUID único  
  surveyId: string;        // ID del cuestionario (ej: "local_actors_v1")
  answers: Record<string, any>;     // Respuestas en formato JSON libre
  metadata?: Record<string, any>;  // Metadata opcional (ubicación, dispositivo, etc.)
  status: ResponseStatus;  // Estado: 'draft' | 'final'
  userId: string;          // Usuario que creó la respuesta
  municipalityId?: string; // Municipio asociado (opcional)
  lastModifiedBy: string;  // Usuario que hizo la última modificación
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}

enum ResponseStatus {
  DRAFT = 'draft',      // Borrador - editable
  FINAL = 'final'       // Finalizada - solo admin/editor pueden editar
}
```

## 🔐 Permisos por Rol

| Acción | USER | EDITOR | ADMIN |
|--------|------|--------|-------|
| Crear respuesta | ✅ | ✅ | ✅ |
| Ver propias respuestas | ✅ | ❌ | ❌ |
| Ver todas las respuestas | ❌ | ✅ | ✅ |
| Editar propia respuesta (draft) | ✅ | ✅ | ✅ |
| Editar respuesta de su equipo | ❌ | ✅ | ✅ |
| Editar cualquier respuesta | ❌ | ❌ | ✅ |
| Editar respuesta finalizada | ❌ | ✅ (su equipo) | ✅ |
| Finalizar propia respuesta | ✅ | ✅ | ✅ |
| Finalizar respuesta de equipo | ❌ | ✅ | ✅ |
| Reabrir respuesta de equipo | ❌ | ✅ | ✅ |
| Eliminar respuesta de equipo | ❌ | ✅ | ✅ |
| Eliminar respuesta | ❌ | ✅ (su equipo) | ✅ |

## 🔧 Endpoints

### ➕ Crear Respuesta

**POST** `/responses`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters (opcionales):**
- `include=full` - Retorna respuesta completa en lugar de resumen

**Body:**
```json
{
  "surveyId": "local_actors_interview_v1",
  "answers": {
    "actor_name": "Juan Pérez",
    "organization": "Cooperativa San José", 
    "role": "president",
    "experience_years": 5,
    "main_activities": ["agriculture", "community_leadership"],
    "challenges": {
      "economic": ["limited_funding", "market_access"],
      "social": ["youth_migration", "education_access"]
    }
  },
  "metadata": {
    "location": {
      "latitude": 14.0723,
      "longitude": -87.1921
    },
    "device": {
      "userAgent": "Mozilla/5.0...",
      "platform": "Android"
    },
    "survey_info": {
      "duration_seconds": 245,
      "completion_percentage": 100
    }
  },
  "userId": "user-uuid-optional",           // Opcional: especificar usuario
  "municipalityId": "municipality-uuid",    // Opcional: asociar municipio
  "status": "draft"                         // Opcional: estado inicial
}
```

**Respuesta 201 (modo resumido - por defecto):**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1", 
  "status": "draft",
  "answersCount": 6,
  "createdAt": "2025-12-30T08:15:16.179Z",
  "message": "Respuesta creada exitosamente"
}
```

**Respuesta 201 (modo completo - ?include=full):**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1",
  "answers": {
    "actor_name": "Juan Pérez",
    "organization": "Cooperativa San José",
    "role": "president",
    "experience_years": 5,
    "main_activities": ["agriculture", "community_leadership"],
    "challenges": {
      "economic": ["limited_funding", "market_access"],
      "social": ["youth_migration", "education_access"]
    }
  },
  "metadata": {
    "location": {"latitude": 14.0723, "longitude": -87.1921},
    "device": {"userAgent": "Mozilla/5.0...", "platform": "Android"},
    "survey_info": {"duration_seconds": 245, "completion_percentage": 100}
  },
  "status": "draft",
  "userId": "550e8400-e29b-41d4-a716-446655440000", 
  "municipalityId": "660e8400-e29b-41d4-a716-446655440000",
  "lastModifiedBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-30T08:15:16.179Z",
  "updatedAt": "2025-12-30T08:15:16.179Z"
}
```

---

### 📋 Obtener Respuestas

**GET** `/responses`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (opcionales):**
- `surveyId` - Filtrar por ID de survey
- `status` - Filtrar por estado (`draft` | `final`)

**Comportamiento por Rol:**
- **USER**: Solo ve sus propias respuestas
- **EDITOR/ADMIN**: Ve todas las respuestas

**Ejemplos:**
```bash
# Obtener todas las respuestas accesibles
GET /responses

# Filtrar por survey específico  
GET /responses?surveyId=local_actors_interview_v1

# Filtrar por estado
GET /responses?status=final

# Combinación de filtros
GET /responses?surveyId=community_survey_v1&status=draft
```

**Respuesta 200:**
```json
[
  {
    "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
    "surveyId": "local_actors_interview_v1",
    "answers": {"actor_name": "Juan Pérez", "...": "..."},
    "metadata": {"location": "...", "device": "..."},
    "status": "draft",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "municipalityId": "660e8400-e29b-41d4-a716-446655440000", 
    "lastModifiedBy": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-12-30T08:15:16.179Z",
    "updatedAt": "2025-12-30T08:15:16.179Z"
  }
]
```

---

### 🔍 Obtener Respuesta por ID

**GET** `/responses/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta 200:**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1",
  "answers": {
    "actor_name": "Juan Pérez",
    "organization": "Cooperativa San José",
    "role": "president",
    "experience_years": 5,
    "main_activities": ["agriculture", "community_leadership"],
    "challenges": {
      "economic": ["limited_funding", "market_access"],
      "social": ["youth_migration", "education_access"]
    }
  },
  "metadata": {
    "location": {"latitude": 14.0723, "longitude": -87.1921},
    "device": {"userAgent": "Mozilla/5.0...", "platform": "Android"},
    "survey_info": {"duration_seconds": 245, "completion_percentage": 100}
  },
  "status": "draft",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "municipalityId": "660e8400-e29b-41d4-a716-446655440000",
  "lastModifiedBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-30T08:15:16.179Z", 
  "updatedAt": "2025-12-30T08:15:16.179Z"
}
```

---

### ✏️ Actualizar Respuesta

**PATCH** `/responses/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body (todos los campos opcionales):**
```json
{
  "answers": {
    "actor_name": "Juan Pérez Actualizado",
    "new_field": "nuevo valor",
    "challenges": {
      "economic": ["limited_funding", "market_access", "inflation"],
      "environmental": ["climate_change", "deforestation"]
    }
  },
  "metadata": {
    "last_edit": {
      "timestamp": "2025-12-30T08:30:00.000Z",
      "reason": "additional_information"
    }
  }
}
```

**Lógica de Merge:**
- `answers`: Se hace merge con las respuestas existentes
- `metadata`: Se hace merge con el metadata existente  
- `lastModifiedBy`: Se actualiza automáticamente

**Respuesta 200:**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1", 
  "status": "draft",
  "answersCount": 7,
  "updatedAt": "2025-12-30T08:30:16.179Z",
  "message": "Respuesta actualizada exitosamente"
}
```

---

### ✅ Finalizar Respuesta

**PATCH** `/responses/:id/finalize`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Efecto:**
- Cambia `status` de `draft` a `final`
- Solo el propietario puede finalizar su respuesta
- Respuestas finalizadas solo pueden ser editadas por EDITOR/ADMIN

**Respuesta 200:**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1",
  "answers": {"...": "..."},
  "metadata": {"...": "..."},
  "status": "final",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "municipalityId": "660e8400-e29b-41d4-a716-446655440000",
  "lastModifiedBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-30T08:15:16.179Z",
  "updatedAt": "2025-12-30T08:35:16.179Z"
}
```

---

### 🔄 Reabrir Respuesta (ADMIN y EDITOR)

**PATCH** `/responses/:id/reopen`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** 
- **ADMIN**: Puede reabrir cualquier respuesta
- **EDITOR**: Solo respuestas de usuarios de su equipo

**Efecto:**
- Cambia `status` de `final` a `draft`
- Solo administradores y editores pueden reabrir respuestas de su ámbito
- Permite que la respuesta vuelva a ser editable

**Respuesta 200:**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1",
  "answers": {"...": "..."},
  "metadata": {"...": "..."},
  "status": "draft",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "municipalityId": "660e8400-e29b-41d4-a716-446655440000",
  "lastModifiedBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-30T08:15:16.179Z",
  "updatedAt": "2025-12-30T08:35:16.179Z"
}
```

**Errores:**
```json
// 400 - Bad Request (respuesta no está finalizada)
{
  "statusCode": 400,
  "message": "Solo se pueden reabrir respuestas finalizadas"
}

// 403 - Forbidden (usuario no tiene permisos sobre la respuesta)
{
  "statusCode": 403,
  "message": "Solo administradores y editores pueden reabrir respuestas de su ámbito"
}

// 404 - Not Found (respuesta no existe)
{
  "statusCode": 404,
  "message": "Respuesta no encontrada"
}
```

---

### �🗑️ Eliminar Respuesta

**DELETE** `/responses/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** EDITOR, ADMIN únicamente

**Respuesta 200:**
```json
{
  "message": "Respuesta eliminada exitosamente"
}
```

---

## 📝 Ejemplos de Uso Completos

### Flujo completo de respuesta:

```bash
# 1. Crear respuesta en borrador
curl -X POST http://localhost:3000/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "community_assessment_v1",
    "answers": {
      "community_name": "Aldea Nueva Esperanza",
      "population": 250,
      "main_challenges": ["water_access", "road_infrastructure"],
      "priority_projects": {
        "short_term": ["water_well", "health_clinic"],
        "long_term": ["school_expansion", "market_center"]
      }
    },
    "metadata": {
      "location": {"latitude": 14.5, "longitude": -88.0},
      "interviewer": "Maria Lopez",
      "interview_date": "2025-12-30"
    },
    "municipalityId": "municipality-uuid-here",
    "status": "draft"
  }'

# 2. Actualizar respuesta
curl -X PATCH http://localhost:3000/responses/RESPONSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "additional_info": "Community has strong leadership structure",
      "priority_projects": {
        "short_term": ["water_well", "health_clinic", "solar_panels"],
        "long_term": ["school_expansion", "market_center"]
      }
    }
  }'

# 3. Finalizar respuesta
curl -X PATCH http://localhost:3000/responses/RESPONSE_ID/finalize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Reabrir respuesta (ADMIN y EDITOR)
curl -X PATCH http://localhost:3000/responses/RESPONSE_ID/reopen \
  -H "Authorization: Bearer ADMIN_OR_EDITOR_JWT_TOKEN"

# 5. Obtener todas las respuestas
curl -X GET http://localhost:3000/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 6. Filtrar respuestas por survey
curl -X GET "http://localhost:3000/responses?surveyId=community_assessment_v1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 7. Obtener respuesta específica
curl -X GET http://localhost:3000/responses/RESPONSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔗 Integración con Municipios

Las respuestas pueden asociarse a municipios para análisis geográfico:

```json
// Respuesta con municipio asociado
{
  "surveyId": "territorial_analysis_v1",
  "answers": {
    "land_use": "agricultural",
    "crop_types": ["corn", "beans", "coffee"],
    "challenges": ["soil_erosion", "pest_management"]
  },
  "municipalityId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validaciones:**
- Solo se pueden asociar municipios activos
- El campo `municipalityId` es opcional
- Si se proporciona, debe existir en la base de datos

---

## 🔄 Trazabilidad y Auditoria

Cada respuesta mantiene un registro completo de cambios:

- **`userId`**: Quien creó originalmente la respuesta
- **`lastModifiedBy`**: Quien hizo la última modificación  
- **`createdAt`**: Cuándo se creó
- **`updatedAt`**: Cuándo se modificó por última vez

**Ejemplo de trazabilidad:**
```json
{
  "id": "response-uuid",
  "userId": "user-1-uuid",        // Juan creó la respuesta
  "lastModifiedBy": "user-2-uuid", // Maria la modificó
  "createdAt": "2025-12-30T08:00:00Z",
  "updatedAt": "2025-12-30T10:30:00Z"
}
```

---

## ⚠️ Consideraciones Importantes

1. **Estructura JSON Libre:** El campo `answers` acepta cualquier estructura JSON válida
2. **Merge Inteligente:** Las actualizaciones hacen merge con datos existentes
3. **Trazabilidad Completa:** Todos los cambios quedan registrados
4. **Estados Claros:** Draft (editable) vs Final (protegido)
5. **Permisos Granulares:** Diferentes niveles según el rol del usuario
6. **Asociación Geográfica:** Integración opcional con municipios
7. **Metadata Flexible:** Información adicional configurable por implementación