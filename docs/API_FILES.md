# 📁 API Archivos - Sacifor Backend

Sistema de gestión de archivos simplificado con almacenamiento en base de datos y optimización delegada al frontend.

## 📊 Estructura de Datos

```typescript
File {
  id: string;           // UUID único
  fileName: string;     // Nombre original del archivo
  mimeType: string;     // Tipo MIME (image/jpeg, image/png, etc.)
  data: Buffer;         // Contenido binario del archivo
  size: number;         // Tamaño en bytes
  uploadedBy: string;   // ID del usuario que subió el archivo
  createdAt: Date;      // Fecha de subida
}
```

## 🔐 Permisos

| Acción | USER | EDITOR | ADMIN |
|--------|------|--------|-------|
| Subir archivos | ✅ | ✅ | ✅ |
| Descargar archivos | ✅ | ✅ | ✅ |
| Ver metadatos | ✅ | ✅ | ✅ |

**Nota:** Todos los usuarios autenticados tienen permisos completos para archivos.

---

## 🔧 Endpoints

### ⬆️ Subir Archivo

**POST** `/files`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
file: [archivo binario]
```

**Tipos Soportados:**
- Imágenes: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

**Límites:**
- Tamaño máximo: 50 MB por archivo
- Un archivo por petición

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/ruta/a/imagen.jpg"
```

**Respuesta 201:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "fileName": "imagen.jpg",
  "mimeType": "image/jpeg", 
  "size": 245760,
  "uploadedBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-30T08:15:16.179Z",
  "message": "Archivo subido exitosamente"
}
```

**Errores:**
- `400` - Ningún archivo proporcionado
- `400` - Tipo de archivo no soportado
- `413` - Archivo excede límite de tamaño
- `401` - Usuario no autenticado

---

### ⬇️ Descargar Archivo

**GET** `/files/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta 200:**
- **Content-Type:** Tipo MIME del archivo original
- **Content-Disposition:** `inline; filename="nombre-original.ext"`
- **Cache-Control:** `public, max-age=3600` (1 hora)
- **Body:** Contenido binario del archivo

**Ejemplo con curl:**
```bash
# Descargar y guardar archivo
curl -X GET http://localhost:3000/files/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o archivo_descargado.jpg

# Ver headers de respuesta
curl -I http://localhost:3000/files/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Headers de Respuesta Ejemplo:**
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: inline; filename="imagen.jpg"
Content-Length: 245760
Cache-Control: public, max-age=3600
```

**Errores:**
- `404` - Archivo no encontrado
- `401` - Usuario no autenticado

---

### ℹ️ Obtener Metadatos del Archivo

**GET** `/files/:id/info`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta 200:**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "fileName": "imagen.jpg",
  "mimeType": "image/jpeg",
  "size": 245760,
  "sizeFormatted": "240 KB", 
  "uploadedBy": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-12-30T08:15:16.179Z"
}
```

**Errores:**
- `404` - Archivo no encontrado
- `401` - Usuario no autenticado

---

## 📝 Ejemplos de Uso Completos

### Flujo típico de gestión de archivos:

```bash
# 1. Subir una imagen
curl -X POST http://localhost:3000/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@foto_entrevista.jpg"

# Respuesta:
# {
#   "id": "abc123-def456-ghi789",
#   "fileName": "foto_entrevista.jpg", 
#   "mimeType": "image/jpeg",
#   "size": 1024000,
#   "uploadedBy": "user-uuid",
#   "createdAt": "2025-12-30T10:00:00Z",
#   "message": "Archivo subido exitosamente"
# }

# 2. Obtener información del archivo
curl -X GET http://localhost:3000/files/abc123-def456-ghi789/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Descargar el archivo
curl -X GET http://localhost:3000/files/abc123-def456-ghi789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o descarga_foto_entrevista.jpg

# 4. Usar en navegador (directo)
# http://localhost:3000/files/abc123-def456-ghi789
# (con token en Authorization header o como query param si está configurado)
```

### Integración con otros módulos:

```json
// Ejemplo: Incluir archivos en respuestas de encuestas
{
  "surveyId": "community_assessment_v1",
  "answers": {
    "community_name": "Aldea Nueva",
    "photos": [
      {
        "description": "Centro de la comunidad",
        "fileId": "abc123-def456-ghi789"
      },
      {
        "description": "Escuela local", 
        "fileId": "def456-ghi789-jkl012"
      }
    ],
    "documents": {
      "community_map": "ghi789-jkl012-mno345"
    }
  },
  "metadata": {
    "attachments_count": 3,
    "total_size_mb": 5.2
  }
}
```

### Validación de archivos antes de subir:

```javascript
// Ejemplo frontend: Validar antes de enviar
function validateFile(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 50 * 1024 * 1024; // 50 MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no soportado');
  }
  
  if (file.size > maxSize) {
    throw new Error('Archivo excede el límite de 50 MB');
  }
  
  return true;
}

// Subir archivo con validación
async function uploadFile(file) {
  validateFile(file);
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
}
```

---

## 🎯 Optimización y Rendimiento

### Filosofía del Sistema

Este sistema está diseñado para **simplicidad y delegación**:

1. **Frontend se encarga de:**
   - Redimensionar imágenes
   - Comprimir archivos
   - Optimizar calidad
   - Generar thumbnails
   - Validaciones avanzadas

2. **Backend se encarga de:**
   - Almacenamiento seguro
   - Autenticación y autorización
   - Metadatos básicos
   - Servir archivos con cache

### Cache y Rendimiento

- **Cache HTTP:** 1 hora para archivos estáticos
- **Headers apropiados:** Content-Type, Content-Disposition
- **Almacenamiento:** Base de datos (MySQL LONGBLOB)
- **Sin procesamiento:** Archivos se almacenan tal como se reciben

### Consideraciones de Producción

```typescript
// Configuración recomendada para producción
const fileConfig = {
  maxFileSize: 50 * 1024 * 1024,    // 50 MB
  allowedMimeTypes: [
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/gif', 'image/webp'
  ],
  cacheMaxAge: 3600,                 // 1 hora
  enableCompression: true,           // Gzip para metadatos
  bufferEncoding: 'binary'           // Mantener calidad original
};
```

---

## 🔗 URLs y Referencias

### Estructura de URLs

```
GET /files/:id              # Descargar archivo
GET /files/:id/info         # Metadatos del archivo
POST /files                 # Subir nuevo archivo
```

### Uso en HTML (con autenticación)

```html
<!-- Mostrar imagen (requiere manejo de token) -->
<img src="http://localhost:3000/files/abc123-def456" 
     alt="Descripción de la imagen"
     onerror="handleImageError(this)" />

<!-- Enlace de descarga -->
<a href="http://localhost:3000/files/abc123-def456" 
   download="nombre-original.jpg">
   Descargar imagen
</a>
```

### Integración con formularios

```html
<!-- Formulario de subida -->
<form enctype="multipart/form-data">
  <input type="file" 
         name="file" 
         accept="image/*"
         required />
  <button type="submit">Subir imagen</button>
</form>
```

---

## ⚠️ Consideraciones Importantes

1. **Optimización Delegada:** El frontend debe optimizar imágenes antes de enviar
2. **Almacenamiento en BD:** Los archivos se guardan en MySQL como LONGBLOB
3. **Sin Versionado:** No hay sistema de versiones de archivos
4. **Cache Simple:** Cache HTTP de 1 hora, sin invalidación automática
5. **Seguridad Básica:** Solo validación de tipo MIME y tamaño
6. **Un Archivo por Petición:** No hay soporte para subida múltiple en una petición
7. **Sin Thumbnails:** No se generan previsualizaciones automáticas
8. **UUIDs como Identificadores:** Los IDs son UUIDs v4 para seguridad
9. **Metadatos Mínimos:** Solo información básica (nombre, tipo, tamaño, fecha)

---

## 🚀 Próximas Funcionalidades

- [ ] Subida múltiple de archivos
- [ ] Sistema de carpetas o categorías
- [ ] Búsqueda de archivos por metadata
- [ ] Limpieza automática de archivos no referenciados
- [ ] Soporte para más tipos de archivo (PDF, documentos)
- [ ] Compresión automática opcional
- [ ] Sistema de quotas por usuario
- [ ] Logs de acceso a archivos