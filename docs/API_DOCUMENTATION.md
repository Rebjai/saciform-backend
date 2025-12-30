# 📋 Documentación API - Sacifor Backend

Sistema de gestión de encuestas territoriales con arquitectura modular y autenticación JWT.

## 🚀 Información General

**Base URL**: `http://localhost:3000`  
**Autenticación**: JWT Bearer Token  
**Content-Type**: `application/json`  
**Versión**: 1.0.0

### ⚙️ Configuración Inicial

#### Primera instalación:
```bash
# Clonar repositorio e instalar dependencias
cd /path/to/project
pnpm install

# Configurar base de datos (seguir database-setup.md)
# Ejecutar migraciones y seed
pnpm run migration:run
pnpm run seed

# Iniciar servidor
pnpm run start:dev
```

#### Si recreas la base de datos:
```bash
# Después de recrear las tablas:
pnpm run migration:run  # Aplicar estructura
pnpm run seed          # Datos de prueba

# Esto restaura usuarios de prueba y datos iniciales
```

### 🔧 Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=sacifor_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_min_32_chars

# Servidor
PORT=3000
```

---

## 📚 Documentación por Módulos

### 🔐 [Autenticación](./API_AUTH.md)
Sistema JWT con roles jerárquicos (USER, EDITOR, ADMIN).

**Endpoints principales:**
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Perfil del usuario

**Funcionalidades:**
- ✅ Registro abierto como USER
- ✅ Roles jerárquicos con permisos específicos
- ✅ JWT con expiración configurable
- ✅ Hashing bcrypt para contraseñas

---

### 📝 [Cuestionarios](./API_QUESTIONNAIRES.md)
Gestión de cuestionarios dinámicos con estructura JSON flexible y metadata configurable.

**Endpoints principales:**
- `GET /questionnaires` - Listar cuestionarios
- `POST /questionnaires` - Crear cuestionario (EDITOR+)
- `PATCH /questionnaires/:id` - Actualizar (EDITOR+)
- `DELETE /questionnaires/:id` - Eliminar (ADMIN)

**Funcionalidades:**
- ✅ Estructura JSON completamente flexible
- ✅ Estados activo/inactivo para control de uso
- ✅ Metadata extensible con versionado manual
- ✅ Integración directa con sistema de respuestas

---

### 🏘️ [Municipios](./API_MUNICIPALITIES.md)
Gestión de municipios con eliminación lógica y asociación geográfica.

**Endpoints principales:**
- `GET /municipalities` - Listar municipios activos
- `POST /municipalities` - Crear municipio (EDITOR+)
- `PATCH /municipalities/:id` - Actualizar (EDITOR+)
- `DELETE /municipalities/:id` - Eliminación lógica (ADMIN)

**Funcionalidades:**
- ✅ Estructura: id, code, name, district
- ✅ Eliminación lógica (campo `isActive`)
- ✅ Restauración para administradores
- ✅ Integración con respuestas de encuestas

---

### 📋 [Respuestas](./API_RESPONSES.md)
Sistema de respuestas con JSON flexible, trazabilidad completa y estados de workflow.

**Endpoints principales:**
- `POST /responses` - Crear respuesta
- `GET /responses` - Listar (filtrable por usuario/rol)
- `PATCH /responses/:id` - Actualizar respuesta
- `PATCH /responses/:id/finalize` - Finalizar respuesta

**Funcionalidades:**
- ✅ Estructura JSON completamente flexible
- ✅ Estados: draft (editable) y final (protegido)
- ✅ Trazabilidad completa (userId, lastModifiedBy)
- ✅ Asociación opcional con municipios
- ✅ Permisos granulares por rol

---

### 📁 [Archivos](./API_FILES.md)
Gestión simplificada de archivos con optimización delegada al frontend.

**Endpoints principales:**
- `POST /files` - Subir archivo
- `GET /files/:id` - Descargar archivo
- `GET /files/:id/info` - Metadatos del archivo

**Funcionalidades:**
- ✅ Almacenamiento en base de datos
- ✅ Soporte para imágenes (JPEG, PNG, GIF, WebP)
- ✅ Cache HTTP con headers apropiados
- ✅ Sin procesamiento server-side (delegado al frontend)

---

## 👥 Usuarios de Prueba

Creados automáticamente con `pnpm run seed`:

```javascript
// Administrador
{
  email: "admin@sacifor.com",
  password: "admin123",
  role: "admin"
}

// Editor
{
  email: "editor@sacifor.com", 
  password: "editor123",
  role: "editor"
}

// Usuario básico
{
  email: "user@sacifor.com",
  password: "user123", 
  role: "user"
}
```

---

## 🛠️ Arquitectura Técnica

### Stack Tecnológico
- **Backend**: NestJS + TypeScript
- **Base de Datos**: MySQL con TypeORM
- **Autenticación**: JWT + bcrypt
- **Validación**: class-validator + class-transformer
- **Migraciones**: TypeORM CLI

### Estructura del Proyecto

```
src/
├── auth/           # Módulo de autenticación
├── municipalities/ # Gestión de municipios 
├── responses/      # Sistema de respuestas
├── files/          # Gestión de archivos
├── common/         # Utilidades compartidas
├── config/         # Configuraciones
└── entities/       # Entidades de base de datos
```

### Principios de Diseño

1. **Modularidad**: Cada funcionalidad en su propio módulo
2. **Simplicidad**: Código limpio siguiendo mejores prácticas
3. **Flexibilidad**: JSON libre para respuestas de encuestas
4. **Seguridad**: Autenticación JWT y permisos granulares
5. **Trazabilidad**: Registro completo de cambios y usuarios

---

## 🚀 Próximas Funcionalidades

### Corto Plazo
- [ ] Gestión de cuestionarios dinámicos
- [ ] Sistema de notificaciones
- [ ] Exportación de datos (Excel, CSV)
- [ ] Búsqueda avanzada y filtros

### Mediano Plazo  
- [ ] Panel de administración web
- [ ] Reportes y dashboards
- [ ] Sincronización offline
- [ ] API para aplicaciones móviles

### Largo Plazo
- [ ] Machine Learning para análisis de datos
- [ ] Integración con sistemas GIS
- [ ] Multi-tenancy para organizaciones
- [ ] API pública con rate limiting

---

## 📞 Soporte y Contacto

Para preguntas técnicas, problemas o sugerencias:

- **Documentación completa**: Ver archivos específicos por módulo
- **Issues**: Crear en el repositorio del proyecto
- **Configuración**: Consultar `database-setup.md`

---

## 📄 Documentación Adicional

- [Configuración de Base de Datos](./database-setup.md)
- [Autenticación](./API_AUTH.md)
- [Cuestionarios](./API_QUESTIONNAIRES.md)
- [Municipios](./API_MUNICIPALITIES.md)
- [Respuestas](./API_RESPONSES.md)
- [Archivos](./API_FILES.md)

---

*Última actualización: 30 de diciembre de 2025*
