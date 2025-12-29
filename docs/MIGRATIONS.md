# Migraciones de Base de Datos

Sistema de migraciones TypeORM siguiendo las mejores prácticas oficiales.

## 📋 Scripts Disponibles

```bash
npm run migration:show      # Ver estado de migraciones
npm run migration:run       # Ejecutar migraciones pendientes
npm run migration:revert    # Revertir última migración
npm run migration:generate  # Generar migración desde cambios en entidades
npm run migration:create    # Crear migración vacía
```

## 🗂️ Migraciones Actuales

1. **CreateBaseTables** - Crea todas las tablas base del sistema
2. **InitialSchema** - Ajustes de tipos de datos en columnas existentes  
3. **AddFilesTable** - Sistema de upload de archivos

## 🚀 Configuración

- **Desarrollo**: Migraciones manuales con `npm run migration:run`
- **Producción**: Migraciones automáticas al iniciar la aplicación
- **Transacciones**: Todas las migraciones en una transacción (`migrationsTransactionMode: 'all'`)
- **Sincronización**: `synchronize: false` (obligatorio con migraciones)

## � Crear Nueva Migración

```bash
# Para cambios automáticos desde entidades
npm run migration:generate src/migrations/DescripcionDelCambio

# Para migración personalizada
npm run migration:create src/migrations/NombreDeLaMigracion
```

## ⚠️ Importantes

- Nunca editar migraciones ya aplicadas en producción
- Siempre probar migraciones localmente antes del deploy
- Las migraciones se ejecutan automáticamente en producción