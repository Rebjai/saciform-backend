# 📋 Documentación API - Sacifor Backend

## 🚀 Información General

**Base URL**: `http://localhost:3000`  
**Autenticación**: JWT Bearer Token  
**Content-Type**: `application/json`

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

### Usuarios de Prueba Disponibles:
- **Admin**: `admin@sacifor.com` / `admin123`
- **Editor**: `editor@sacifor.com` / `editor123`
- **User**: `user@sacifor.com` / `user123`

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
        "order": 1,
        "helpText": "Ingresa tu nombre y apellido completo"
      },
      {
        "id": "b0d72288-5d8d-4920-9b4b-2b82d02ff39f",
        "text": "¿Cómo calificarías nuestro servicio?",
        "type": "radio",
        "options": ["Excelente", "Bueno", "Regular", "Malo"],
        "isRequired": true,
        "order": 2,
        "helpText": null
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
        "isRequired": true,
        "helpText": "Ingresa tu nombre completo"
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
        "isRequired": false,
        "helpText": "Comparte tus comentarios"
      }
    ]
  }'
```

---

## 📋 3. Respuestas

### POST /responses
Crear una nueva respuesta (borrador).

**Request:**
```bash
curl -X POST http://localhost:3000/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionnaireId": "ca660e12-24b7-416e-b154-1085e6f9e469",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "gpsAccuracy": 5.2,
    "answers": {
      "a16fc7dc-50e8-4d7f-87c6-a39dc82d33b1": "Juan Pérez García",
      "b0d72288-5d8d-4920-9b4b-2b82d02ff39f": ["Excelente"],
      "61108665-c1df-48cb-be57-2b64b32a83d8": ["Laptop", "Mouse"],
      "dca13de3-ce68-4f3d-9f24-11882f654e33": "Muy buen servicio"
    }
  }'
```

**Response (Modo corto - por defecto):**
```json
{
  "id": "a7b51c88-0a01-4b4a-9f43-27bae002aa67",
  "status": "draft",
  "questionnaireId": "ca660e12-24b7-416e-b154-1085e6f9e469",
  "answersCount": 4,
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
- `questionnaireId`: Filtrar por cuestionario específico
- `status`: Filtrar por estado (`draft` o `final`)

**Ejemplos:**
```bash
# Todas las respuestas
curl -X GET http://localhost:3000/responses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo respuestas de un cuestionario
curl -X GET "http://localhost:3000/responses?questionnaireId=ca660e12-24b7-416e-b154-1085e6f9e469" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo borradores
curl -X GET "http://localhost:3000/responses?status=draft" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Solo finalizadas
curl -X GET "http://localhost:3000/responses?status=final" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Combinado
curl -X GET "http://localhost:3000/responses?questionnaireId=ca660e12-24b7-416e-b154-1085e6f9e469&status=final" \
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
Actualizar una respuesta existente (solo en estado draft para USER).

**Request:**
```bash
curl -X PATCH http://localhost:3000/responses/a7b51c88-0a01-4b4a-9f43-27bae002aa67 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "answers": {
      "a16fc7dc-50e8-4d7f-87c6-a39dc82d33b1": "NOMBRE ACTUALIZADO",
      "b0d72288-5d8d-4920-9b4b-2b82d02ff39f": ["Bueno"]
    },
    "latitude": -12.1000,
    "longitude": -77.1000,
    "gpsAccuracy": 3.8
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

## 🔧 4. Tipos de Preguntas Soportados

### Tipos Básicos:
- **`text`**: Texto corto (input)
- **`textarea`**: Texto largo (textarea)
- **`radio`**: Opción única (requiere `options`)
- **`checkbox`**: Opción múltiple (requiere `options`)
- **`select`**: Lista desplegable (requiere `options`)
- **`number`**: Entrada numérica

### Tipos Avanzados (Preparados):
- **`image`**: Captura/adjuntar imágenes
- **`gps`**: Captura automática GPS
- **`gps_manual`**: Coordenadas GPS manuales

### Formato de Respuestas por Tipo:
```json
{
  "answers": {
    "pregunta-text": "Respuesta de texto",
    "pregunta-textarea": "Texto largo...",
    "pregunta-radio": ["Opción seleccionada"],
    "pregunta-checkbox": ["Opción 1", "Opción 3"],
    "pregunta-select": ["Opción seleccionada"],
    "pregunta-number": "25"
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
2. **Listar cuestionarios** → Mostrar opciones disponibles  
3. **Crear respuesta** → Iniciar como draft
4. **Guardar progreso** → PATCH para actualizar
5. **Finalizar** → PATCH /finalize cuando esté completo

### Validaciones Frontend:
- Validar campos requeridos antes de enviar
- Validar formato de coordenadas GPS
- Validar selecciones según tipo de pregunta
- Mostrar ayuda (`helpText`) cuando esté disponible

### Optimizaciones:
- Usar respuesta corta por defecto (`POST /responses`)
- Usar respuesta completa solo cuando necesites todos los datos (`?include=full`)
- Implementar guardado automático (cada X segundos)
- Cache de cuestionarios en localStorage

---

## 🧪 8. Script de Prueba Completo

```bash
#!/bin/bash

# Variables
BASE_URL="http://localhost:3000"
EMAIL="admin@sacifor.com"
PASSWORD="admin123"

echo "🔐 1. Login..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token obtenido: ${TOKEN:0:20}..."

echo "📝 2. Listar cuestionarios..."
curl -s -X GET $BASE_URL/questionnaires \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "📋 3. Crear respuesta..."
RESPONSE_ID=$(curl -s -X POST $BASE_URL/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "questionnaireId": "ca660e12-24b7-416e-b154-1085e6f9e469",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "gpsAccuracy": 5.2,
    "answers": {
      "a16fc7dc-50e8-4d7f-87c6-a39dc82d33b1": "Prueba API",
      "b0d72288-5d8d-4920-9b4b-2b82d02ff39f": ["Excelente"]
    }
  }' | jq -r .id)

echo "Respuesta creada: $RESPONSE_ID"

echo "✏️ 4. Actualizar respuesta..."
curl -s -X PATCH $BASE_URL/responses/$RESPONSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "answers": {
      "a16fc7dc-50e8-4d7f-87c6-a39dc82d33b1": "Prueba API ACTUALIZADA"
    }
  }' | jq .

echo "✅ 5. Finalizar respuesta..."
curl -s -X PATCH $BASE_URL/responses/$RESPONSE_ID/finalize \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "📊 6. Listar todas las respuestas..."
curl -s -X GET $BASE_URL/responses \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "🗑️ 7. Eliminar respuesta..."
curl -s -X DELETE $BASE_URL/responses/$RESPONSE_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "✨ Pruebas completadas!"
```

---