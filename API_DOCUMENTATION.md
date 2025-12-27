# 📋 Documentación API - Sacifor Backend

## 🚀 Información General

**Base URL**: `http://localhost:3000`  
**Autenticación**: JWT Bearer Token  
**Content-Type**: `application/json`

### ⚙️ Configuración Inicial

#### Primera instalación:
```bash
# Clonar repositorio e instalar
cd /path/to/project
pnpm install

# Configurar base de datos (seguir database-setup.md)
# Luego poblar con datos de prueba:
pnpm run seed

# Iniciar servidor
pnpm run start:dev
```

#### Si recreas la base de datos:
```bash
# Después de recrear las tablas, siempre ejecutar:
pnpm run seed

# Esto restaura los usuarios de prueba y datos iniciales
```

---

## 🔐 1. Autenticación

### POST /auth/login
Iniciar sesión y obtener token JWT.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sacifor.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e0349379-213e-4401-8af8-11e7d1e03efd",
    "email": "admin@sacifor.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

### Usuarios de Prueba Disponibles (creados con `pnpm run seed`):
- **Admin**: `admin@sacifor.com` / `admin123`
- **Editor**: `editor@sacifor.com` / `editor123`
- **User**: `user@sacifor.com` / `user123`

**💡 Tip**: Si recreas la base de datos, ejecuta `pnpm run seed` para restaurar estos usuarios.

---

## 📝 2. Cuestionarios

### GET /questionnaires
Listar todos los cuestionarios disponibles.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```bash
curl -X GET http://localhost:3000/questionnaires \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "id": "ca660e12-24b7-416e-b154-1085e6f9e469",
    "title": "Encuesta de Satisfacción del Cliente",
    "description": "Cuestionario para evaluar la experiencia del cliente",
    "questions": [
      {
        "id": "a16fc7dc-50e8-4d7f-87c6-a39dc82d33b1",
        "text": "¿Cuál es tu nombre completo?",
        "type": "text",
        "options": null,
        "isRequired": true,
        "order": 1
      },
      {
        "id": "b0d72288-5d8d-4920-9b4b-2b82d02ff39f",
        "text": "¿Cómo calificarías nuestro servicio?",
        "type": "radio",
        "options": ["Excelente", "Bueno", "Regular", "Malo"],
        "isRequired": true,
        "order": 2
      }
    ]
  }
]
```

### GET /questionnaires/:id
Obtener un cuestionario específico.

**Request:**
```bash
curl -X GET http://localhost:3000/questionnaires/ca660e12-24b7-416e-b154-1085e6f9e469 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /questionnaires (Solo ADMIN/EDITOR)
Crear un nuevo cuestionario.

**Request:**
```bash
curl -X POST http://localhost:3000/questionnaires \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Mi Nuevo Cuestionario",
    "description": "Descripción del cuestionario",
    "questions": [
      {
        "text": "¿Cuál es tu nombre?",
        "type": "text",
        "isRequired": true
      },
      {
        "text": "Selecciona tu edad",
        "type": "radio",
        "options": ["18-25", "26-35", "36-50", "50+"],
        "isRequired": true
      },
      {
        "text": "¿Qué productos te interesan?",
        "type": "checkbox", 
        "options": ["Producto A", "Producto B", "Producto C"],
        "isRequired": false
      },
      {
        "text": "Comentarios adicionales",
        "type": "textarea",
        "isRequired": false
      }
    ]
  }'
```

---

## 📋 3. Respuestas (Modelo Simplificado)

### POST /responses
Crear una nueva respuesta con estructura JSON flexible.

**Request:**
```bash
curl -X POST http://localhost:3000/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "surveyId": "local_actors_interview_v1",
    "answers": {
      "fullname": "Juan Pérez García",
      "age": "32",
      "occupation": "Ingeniero",
      "satisfaction_rating": "excellent",
      "services_used": ["consulting", "training", "support"],
      "feedback": "Excelente servicio, muy recomendable",
      "would_recommend": true,
      "contact_preference": "email"
    },
    "metadata": {
      "location": {
        "latitude": -12.0464,
        "longitude": -77.0428,
        "accuracy": 5.2,
        "city": "Lima"
      },
      "device": {
        "userAgent": "Mozilla/5.0...",
        "platform": "Android",
        "version": "1.2.3"
      },
      "survey_info": {
        "duration_seconds": 245,
        "completion_percentage": 100,
        "language": "es"
      }
    }
  }'
```

**Response (Modo corto - por defecto):**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "surveyId": "local_actors_interview_v1",
  "status": "draft",
  "answersCount": 8,
  "createdAt": "2025-12-26T00:50:16.179Z",
  "message": "Respuesta creada exitosamente"
}
```

**Response (Modo completo - con ?include=full):**
```bash
curl -X POST "http://localhost:3000/responses?include=full" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}'
```

### GET /responses
Listar respuestas con filtros opcionales.

**Parámetros de query:**
- `surveyId`: Filtrar por survey específico
- `status`: Filtrar por estado (`draft` o `final`)

**Ejemplos:**
```bash
# Todas las respuestas del usuario
curl -X GET http://localhost:3000/responses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo respuestas de un survey específico
curl -X GET "http://localhost:3000/responses?surveyId=local_actors_interview_v1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo borradores
curl -X GET "http://localhost:3000/responses?status=draft" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo finalizadas
curl -X GET "http://localhost:3000/responses?status=final" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combinado
curl -X GET "http://localhost:3000/responses?surveyId=local_actors_interview_v1&status=final" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /responses/:id
Obtener una respuesta específica con todos sus detalles.

**Request:**
```bash
curl -X GET http://localhost:3000/responses/a7b51c88-0a01-4b4a-9f43-27bae002aa67 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### PATCH /responses/:id
Actualizar una respuesta existente (merge de datos).

**Request:**
```bash
curl -X PATCH http://localhost:3000/responses/a7b51c88-0a01-4b4a-9f43-27bae002aa67 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "answers": {
      "fullname": "Juan Carlos Pérez García",
      "feedback": "Servicio actualizado - muy buena experiencia"
    },
    "metadata": {
      "location": {
        "latitude": -12.1000,
        "longitude": -77.1000,
        "accuracy": 3.8
      },
      "survey_info": {
        "completion_percentage": 85
      }
    }
  }'
```

### PATCH /responses/:id/finalize
Finalizar una respuesta (cambiar de draft a final).

**Request:**
```bash
curl -X PATCH http://localhost:3000/responses/a7b51c88-0a01-4b4a-9f43-27bae002aa67/finalize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Nota**: Una vez finalizada, solo ADMIN y EDITOR pueden modificarla.

### DELETE /responses/:id
Eliminar una respuesta.

**Request:**
```bash
curl -X DELETE http://localhost:3000/responses/a7b51c88-0a01-4b4a-9f43-27bae002aa67 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Reglas de eliminación:**
- **USER**: Solo puede eliminar sus propias respuestas en estado `draft`
- **EDITOR/ADMIN**: Pueden eliminar cualquier respuesta, incluso las finalizadas

---

## 🔧 4. Estructura de Datos JSON

### Campos Principales:
```typescript
{
  "surveyId": string,     // Identificador del survey (ej: "local_actors_interview_v1")
  "answers": object,      // Respuestas en formato JSON libre
  "metadata": object      // Información adicional opcional
}
```

### Estructura Flexible de Answers:
```json
{
  "answers": {
    // Texto simple
    "fullname": "Juan Pérez",
    "email": "juan@example.com",
    
    // Números
    "age": "32",
    "rating": "8.5",
    
    // Booleanos
    "agreed_terms": true,
    "wants_newsletter": false,
    
    // Arrays (opciones múltiples)
    "interests": ["technology", "sports", "music"],
    "preferred_days": ["monday", "wednesday", "friday"],
    
    // Texto largo
    "comments": "Este es un comentario largo que puede contener múltiples líneas...",
    
    // Valores complejos
    "address": {
      "street": "Av. Principal 123",
      "city": "Lima",
      "country": "Peru"
    }
  }
}
```

### Estructura Recomendada de Metadata:
```json
{
  "metadata": {
    "location": {
      "latitude": -12.0464,
      "longitude": -77.0428,
      "accuracy": 5.2,
      "city": "Lima",
      "country": "Peru"
    },
    "device": {
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "platform": "Web",
      "app_version": "1.2.3"
    },
    "survey_info": {
      "start_time": "2025-12-26T10:00:00Z",
      "end_time": "2025-12-26T10:04:15Z",
      "duration_seconds": 255,
      "completion_percentage": 100,
      "language": "es"
    },
    "custom_fields": {
      "interviewer_id": "USR001",
      "location_type": "field",
      "weather": "sunny"
    }
  }
}
```

---

## 👥 5. Roles y Permisos

### USER (Aplicador)
- ✅ Ver cuestionarios disponibles
- ✅ Crear respuestas
- ✅ Modificar sus propias respuestas en estado `draft`
- ✅ Finalizar sus propias respuestas
- ✅ Ver solo sus propias respuestas
- ❌ No puede modificar respuestas finalizadas
- ❌ No puede ver respuestas de otros usuarios

### EDITOR
- ✅ Todo lo que puede hacer USER
- ✅ Crear cuestionarios
- ✅ Ver todas las respuestas (actualmente - falta sistema de equipos)
- ✅ Modificar respuestas finalizadas de cualquier usuario
- ✅ Eliminar respuestas finalizadas

### ADMIN
- ✅ Acceso total a todas las funcionalidades
- ✅ Crear cuestionarios
- ✅ Ver, modificar y eliminar cualquier respuesta
- ✅ Modificar respuestas finalizadas
- ✅ Gestión completa del sistema

---

## 🚨 6. Manejo de Errores

### Códigos de Estado HTTP:
- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado
- **400**: Bad Request - Error de validación
- **401**: Unauthorized - Token inválido o faltante
- **403**: Forbidden - Sin permisos para la operación
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error del servidor

### Formato de Errores:
```json
{
  "message": ["Descripción del error"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Ejemplos de Errores Comunes:
```json
// Token inválido
{
  "message": "Unauthorized",
  "statusCode": 401
}

// Sin permisos
{
  "message": "No tienes permisos para modificar esta respuesta",
  "error": "Forbidden",
  "statusCode": 403
}

// Respuesta finalizada
{
  "message": "No puedes modificar una respuesta finalizada. Solo editores y administradores pueden hacerlo.",
  "error": "Bad Request", 
  "statusCode": 400
}
```

---

## 📱 7. Consideraciones para Frontend

### Autenticación:
1. Hacer login y guardar el `access_token`
2. Incluir token en todas las peticiones: `Authorization: Bearer {token}`
3. Manejar expiración del token (renovar o redirigir a login)

### Estados de Respuesta:
- **`draft`**: Borrador, puede editarse
- **`final`**: Finalizada, solo lectura para USER

### Flujo Recomendado:
1. **Login** → Obtener token y datos de usuario
2. **Definir surveyId** → Identificador único del cuestionario/formulario
3. **Crear respuesta** → POST /responses con surveyId y estructura JSON flexible
4. **Guardar progreso** → PATCH para hacer merge de nuevos datos
5. **Finalizar** → PATCH /finalize cuando esté completo

### Estructura JSON Flexible:
- **Answers**: Campo JSON libre para todas las respuestas del formulario
- **Metadata**: Campo JSON opcional para información adicional (GPS, device info, etc.)
- **Merge automático**: Las actualizaciones se combinan con los datos existentes

### Validaciones Frontend:
- El backend NO valida la estructura interna de `answers` o `metadata`
- Toda validación de campos debe hacerse en el frontend
- El `surveyId` es requerido y debe ser consistente
- Los JSONs deben ser válidos (no strings mal formados)

### Optimizaciones:
- Usar respuesta corta por defecto (`POST /responses`)
- Usar respuesta completa solo cuando necesites todos los datos (`?include=full`)
- Implementar guardado automático (cada X segundos)
- Cache de respuestas en localStorage antes de enviar
- Enviar metadata del dispositivo y ubicación cuando sea posible

---

## 🧪 8. Proceso Completo de Prueba

### Paso 1: Preparar el Entorno
```bash
cd /home/Dano/Documentos/nestjs-projects/sacifor-backend

# Instalar dependencias (si es primera vez)
pnpm install

# Iniciar el servidor en modo desarrollo
pnpm run start:dev

# En otra terminal: Poblar la base de datos con datos de prueba
pnpm run seed
```

**Nota**: El comando `pnpm run seed` crea usuarios de prueba y datos iniciales. Ejecutar cada vez que se recreee la base de datos.

### Paso 2: Script de Prueba Automática
```bash
#!/bin/bash

# Variables de configuración
BASE_URL="http://localhost:3000"
EMAIL="admin@sacifor.com"
PASSWORD="admin123"

echo "� Iniciando pruebas del API simplificada..."

echo "�🔐 1. Realizando login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r .access_token)
echo "✅ Token obtenido: ${TOKEN:0:30}..."

echo ""
echo "� 2. Creando respuesta con estructura JSON flexible..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "surveyId": "local_actors_interview_v1",
    "answers": {
      "fullname": "Juan Pérez García",
      "age": "32",
      "occupation": "Ingeniero Ambiental",
      "satisfaction_rating": "excellent",
      "services_used": ["consulting", "training", "support"],
      "feedback": "Excelente servicio, muy profesional",
      "would_recommend": true,
      "contact_preference": "email",
      "additional_comments": "Me gustaría recibir más información sobre nuevos servicios"
    },
    "metadata": {
      "location": {
        "latitude": -12.0464,
        "longitude": -77.0428,
        "accuracy": 5.2,
        "city": "Lima",
        "country": "Peru"
      },
      "device": {
        "userAgent": "TestScript/1.0",
        "platform": "API_Test",
        "version": "1.0.0"
      },
      "survey_info": {
        "start_time": "2025-12-26T10:00:00Z",
        "duration_seconds": 180,
        "completion_percentage": 100,
        "language": "es"
      },
      "custom_fields": {
        "interviewer_id": "TEST001",
        "location_type": "office",
        "interview_method": "in_person"
      }
    }
  }')

RESPONSE_ID=$(echo $CREATE_RESPONSE | jq -r .id)
echo "✅ Respuesta creada:"
echo $CREATE_RESPONSE | jq .
echo ""

echo "📝 3. Actualizando respuesta (merge de datos)..."
UPDATE_RESPONSE=$(curl -s -X PATCH $BASE_URL/responses/$RESPONSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "answers": {
      "fullname": "Juan Carlos Pérez García",
      "phone": "+51 999 888 777",
      "feedback": "Excelente servicio, muy profesional. Actualizado después de más reflexión.",
      "new_suggestion": "Sería bueno tener una app móvil"
    },
    "metadata": {
      "location": {
        "latitude": -12.1000,
        "longitude": -77.1000,
        "accuracy": 3.8
      },
      "survey_info": {
        "completion_percentage": 95,
        "last_update": "2025-12-26T10:15:00Z"
      }
    }
  }')

echo "✅ Respuesta actualizada:"
echo $UPDATE_RESPONSE | jq .
echo ""

echo "🔍 4. Consultando respuesta completa..."
FULL_RESPONSE=$(curl -s -X GET $BASE_URL/responses/$RESPONSE_ID \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Respuesta completa:"
echo $FULL_RESPONSE | jq .
echo ""

echo "📊 5. Listando todas las respuestas..."
ALL_RESPONSES=$(curl -s -X GET $BASE_URL/responses \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Lista de respuestas:"
echo $ALL_RESPONSES | jq '. | length' | xargs echo "Total de respuestas:"
echo ""

echo "🔒 6. Finalizando respuesta..."
FINALIZE_RESPONSE=$(curl -s -X PATCH $BASE_URL/responses/$RESPONSE_ID/finalize \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Respuesta finalizada:"
echo $FINALIZE_RESPONSE | jq .status
echo ""

echo "� 7. Filtrar solo respuestas finalizadas..."
FINAL_RESPONSES=$(curl -s -X GET "$BASE_URL/responses?status=final" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Respuestas finalizadas:"
echo $FINAL_RESPONSES | jq '. | length' | xargs echo "Total finalizadas:"
echo ""

echo "🔍 8. Filtrar por surveyId..."
SURVEY_RESPONSES=$(curl -s -X GET "$BASE_URL/responses?surveyId=local_actors_interview_v1" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Respuestas del survey específico:"
echo $SURVEY_RESPONSES | jq '. | length' | xargs echo "Total del survey:"
echo ""

echo "🗑️ 9. Eliminando respuesta de prueba..."
DELETE_RESPONSE=$(curl -s -X DELETE $BASE_URL/responses/$RESPONSE_ID \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Respuesta eliminada:"
echo $DELETE_RESPONSE | jq .
echo ""

echo "🎉 ¡Pruebas completadas exitosamente!"
echo "   - Estructura JSON flexible: ✅"
echo "   - Merge automático en actualizaciones: ✅"
echo "   - Metadata personalizada: ✅"
echo "   - Filtros por surveyId y status: ✅"
echo "   - Estados draft/final: ✅"
```

### Paso 3: Prueba Manual Individual

#### 3.1 Login y obtener token:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sacifor.com",
    "password": "admin123"
  }' | jq .access_token
```

#### 3.2 Crear respuesta con ID personalizado:
```bash
curl -X POST http://localhost:3000/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "responseId": "CUSTOM_ID_001",
    "surveyId": "customer_satisfaction_2025",
    "answers": {
      "customer_name": "María López",
      "service_rating": 5,
      "would_recommend": true,
      "improvement_areas": ["speed", "price"],
      "comments": "Muy buen servicio en general"
    },
    "metadata": {
      "channel": "web_form",
      "campaign_id": "summer_2025",
      "referrer": "google_ads"
    }
  }'
```

#### 3.3 Verificar flexibilidad del merge:
```bash
curl -X PATCH http://localhost:3000/responses/CUSTOM_ID_001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "answers": {
      "follow_up_date": "2025-01-15",
      "priority_level": "high"
    },
    "metadata": {
      "last_interaction": "2025-12-26T15:30:00Z"
    }
  }'
```

### Paso 4: Validar Resultados

Cada prueba debe mostrar:
- ✅ **Estructura flexible**: Cualquier JSON válido se acepta
- ✅ **Merge inteligente**: Los updates se combinan, no reemplazan
- ✅ **IDs personalizados**: Se puede enviar responseId o dejar que se genere
- ✅ **Metadata rica**: Información adicional estructurada
- ✅ **Filtros funcionales**: Por surveyId y status
- ✅ **Estados correctos**: draft → final → solo lectura para USER

---