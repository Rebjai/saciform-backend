# Migraciones de Base de Datos# Migraciones de Base de Datos



Sistema de migraciones TypeORM siguiendo las mejores prácticas oficiales.Sistema de migraciones TypeORM siguiendo las mejores prácticas oficiales.



## 📋 Scripts Disponibles## 📋 Scripts Disponibles



```bash```bash

npm run migration:show      # Ver estado de migracionesnpm run migration:show      # Ver estado de migraciones

npm run migration:run       # Ejecutar migraciones pendientesnpm run migration:run       # Ejecutar migraciones pendientes

npm run migration:revert    # Revertir última migraciónnpm run migration:revert    # Revertir última migración

npm run migration:generate  # Generar migración desde cambios en entidadesnpm run migration:generate  # Generar migración desde cambios en entidades

npm run migration:create    # Crear migración vacíanpm run migration:create    # Crear migración vacía

``````



## 🗂️ Migraciones Actuales## 🗂️ Migraciones Actuales



1. **CreateBaseTables** - Crea todas las tablas base del sistema1. **CreateBaseTables** - Crea todas las tablas base del sistema

2. **InitialSchema** - Ajustes de tipos de datos en columnas existentes  2. **InitialSchema** - Ajustes de tipos de datos en columnas existentes  

3. **AddFilesTable** - Sistema de upload de archivos3. **AddFilesTable** - Sistema de upload de archivos

4. **SimplifiedResponses** - Simplificación del modelo de respuestas y agregación de municipios

5. **FixDataConsistency** - Arregla inconsistencias de datos y crea foreign keys faltantes## 🚀 Configuración



## 🚀 Configuración- **Desarrollo**: Migraciones manuales con `npm run migration:run`

- **Producción**: Migraciones automáticas al iniciar la aplicación

- **Desarrollo**: Migraciones manuales con `npm run migration:run`- **Transacciones**: Todas las migraciones en una transacción (`migrationsTransactionMode: 'all'`)

- **Producción**: Migraciones automáticas al iniciar la aplicación- **Sincronización**: `synchronize: false` (obligatorio con migraciones)

- **Transacciones**: Todas las migraciones en una transacción (`migrationsTransactionMode: 'all'`)

- **Sincronización**: `synchronize: false` (obligatorio con migraciones)## � Crear Nueva Migración



## 🔧 Crear Nueva Migración```bash

# Para cambios automáticos desde entidades

```bashnpm run migration:generate src/migrations/DescripcionDelCambio

# Para cambios automáticos desde entidades

npm run migration:generate src/migrations/DescripcionDelCambio# Para migración personalizada

npm run migration:create src/migrations/NombreDeLaMigracion

# Para migración personalizada```

npm run migration:create src/migrations/NombreDeLaMigracion

```## ⚠️ Importantes



## 🛠️ Solución de Problemas- Nunca editar migraciones ya aplicadas en producción

- Siempre probar migraciones localmente antes del deploy

### Error: "Cannot drop index: needed in a foreign key constraint"- Las migraciones se ejecutan automáticamente en producción

Este error ocurre cuando hay inconsistencias entre la estructura de la base de datos y las entidades de TypeORM. La migración `FixDataConsistency` resuelve este problema:

**Síntomas:**
- Error al iniciar la aplicación
- Falla al conectar a la base de datos  
- Mensajes sobre foreign keys faltantes

**Solución aplicada:**
1. Crear datos por defecto para resolver referencias huérfanas
2. Limpiar registros con foreign keys inválidas
3. Crear foreign keys faltantes de manera segura
4. Verificar existencia antes de crear constraints

**Comando de reparación:**
```bash
npm run migration:run
```

### Verificar Estado de Migraciones

```bash
# Ver qué migraciones están aplicadas
npm run migration:show

# Ejemplo de salida correcta:
# [X] CreateBaseTables1766988700000
# [X] InitialSchema1766988764647  
# [X] AddFilesTable1766988780837
# [X] SimplifiedResponses1767077199689
# [X] FixDataConsistency1767086798799
```

### Datos por Defecto Creados

La migración `FixDataConsistency` crea automáticamente:

- **Equipo por Defecto**: Para usuarios sin equipo asignado
- **Usuario Sistema**: Admin por defecto para questionnaires huérfanos  
- **Foreign Keys**: Todas las relaciones faltantes entre tablas

## ⚠️ Importantes

- Nunca editar migraciones ya aplicadas en producción
- Siempre probar migraciones localmente antes del deploy
- Las migraciones se ejecutan automáticamente en producción
- La migración `FixDataConsistency` es segura para ejecutar múltiples veces

## 🔄 Rollback y Recuperación

Si es necesario revertir cambios:

```bash
# Revertir la última migración
npm run migration:revert

# CUIDADO: Esto puede causar pérdida de datos
```

**Nota**: Las migraciones de estructura (foreign keys) no deben revertirse en producción.

---

## 📝 Historial de Problemas Resueltos

### 30/12/2025 - Error de Foreign Keys Faltantes

**Problema:** Error de conexión a base de datos por foreign keys inconsistentes.

**Solución:** Migración `FixDataConsistency` que:
- ✅ Identifica y limpia datos huérfanos
- ✅ Crea registros por defecto seguros  
- ✅ Establece foreign keys faltantes
- ✅ Verifica integridad referencial

**Estado:** Resuelto ✅ - Aplicación funcionando correctamente