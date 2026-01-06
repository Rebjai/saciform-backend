# 🔐 Nueva Funcionalidad: Cambiar Contraseña de Usuario

## 📋 Descripción

Se ha implementado la funcionalidad para que los **usuarios autenticados** puedan cambiar su propia contraseña proporcionando su contraseña actual, la nueva contraseña y la confirmación de la misma.

---

## 🔧 Implementación Técnica

### Nuevo Endpoint

```http
PATCH /auth/change-password
```

**Características:**
- ✅ **Usuarios autenticados** pueden cambiar su propia contraseña
- ✅ **Validación de contraseña actual** requerida
- ✅ **Confirmación de nueva contraseña** debe coincidir
- ✅ **Nueva contraseña debe ser diferente** a la actual
- ✅ **Longitud mínima** de 6 caracteres para nueva contraseña

### Código Implementado

#### ChangePasswordDto
```typescript
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
```

#### AuthController
```typescript
@Patch('change-password')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
async changePassword(
  @Body() changePasswordDto: ChangePasswordDto,
  @Request() req,
) {
  return this.authService.changePassword(req.user.id, changePasswordDto);
}
```

#### AuthService
```typescript
async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
  const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

  // Verificar que las contraseñas coincidan
  if (newPassword !== confirmPassword) {
    throw new BadRequestException('Las contraseñas no coinciden');
  }

  // Validar contraseña actual
  const isCurrentPasswordValid = await user.validatePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new UnauthorizedException('La contraseña actual es incorrecta');
  }

  // Verificar que la nueva contraseña sea diferente
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
  }

  // Hashear y actualizar contraseña
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await this.usersRepository.update(userId, { password: hashedNewPassword });

  return { message: 'Contraseña actualizada exitosamente' };
}
```

---

## 🎯 Casos de Uso

### ✅ Casos Exitosos:
1. **Usuario cambia contraseña correctamente**
   - Proporciona contraseña actual válida
   - Nueva contraseña cumple requisitos
   - Confirmación coincide con nueva contraseña
   - Nueva contraseña es diferente a la actual

### ❌ Casos de Error:
1. **Contraseña actual incorrecta**
   - Error: `401 Unauthorized - La contraseña actual es incorrecta`
   
2. **Las nuevas contraseñas no coinciden**
   - Error: `400 Bad Request - Las contraseñas no coinciden`
   
3. **Nueva contraseña muy corta**
   - Error: `400 Bad Request - La nueva contraseña debe tener al menos 6 caracteres`
   
4. **Nueva contraseña igual a la actual**
   - Error: `400 Bad Request - La nueva contraseña debe ser diferente a la actual`
   
5. **Usuario no autenticado**
   - Error: `401 Unauthorized`

---

## 📖 Ejemplos de Uso

### Cambiar Contraseña
```bash
curl -X PATCH http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer {user-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newPassword456",
    "confirmPassword": "newPassword456"
  }'
```

### Respuesta Exitosa (200)
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### Ejemplo con JavaScript/Frontend
```javascript
// Función para cambiar contraseña
async function changePassword(currentPassword, newPassword, confirmPassword, userToken) {
  try {
    const response = await fetch('/auth/change-password', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword, 
        confirmPassword
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    console.log('Contraseña cambiada:', result.message);
    return result;
    
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
}

// Uso
changePassword('currentPass123', 'newPass456', 'newPass456', 'user-jwt-token')
  .then(result => {
    alert('Contraseña actualizada exitosamente');
  })
  .catch(error => {
    alert(`Error: ${error.message}`);
  });
```

---

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas:
1. **Autenticación JWT**: Usuario debe estar logueado
2. **Contraseña actual**: Debe ser correcta
3. **Confirmación**: Nueva contraseña y confirmación deben coincidir
4. **Longitud mínima**: 6 caracteres para nueva contraseña
5. **Contraseña diferente**: Nueva contraseña debe ser distinta a la actual
6. **Hash seguro**: bcrypt con salt rounds = 10

### Flujo de Seguridad:
1. Verificar JWT token válido
2. Obtener usuario de la base de datos
3. Validar contraseña actual con hash almacenado
4. Verificar que nueva contraseña es diferente
5. Hashear nueva contraseña con bcrypt
6. Actualizar hash en base de datos

---

## 📊 Códigos de Respuesta HTTP

| Código | Significado | Situación |
|--------|-------------|-----------|
| `200` | ✅ Éxito | Contraseña cambiada correctamente |
| `400` | ❌ Bad Request | Validación fallida (confirmación, longitud, etc.) |
| `401` | ❌ Unauthorized | Token inválido o contraseña actual incorrecta |

---

## 🧪 Flujo de Pruebas

### Prueba Manual:
1. **Login** para obtener token JWT
2. **Intentar cambiar** con contraseña actual incorrecta → 401
3. **Intentar cambiar** con confirmación que no coincide → 400
4. **Intentar cambiar** con nueva contraseña muy corta → 400
5. **Cambiar correctamente** con datos válidos → 200
6. **Verificar** que la nueva contraseña funciona en login

### Validación de Seguridad:
1. **Token expirado** → 401 Unauthorized
2. **Sin token** → 401 Unauthorized  
3. **Nueva contraseña = actual** → 400 Bad Request
4. **Contraseña hasheada** correctamente en BD

---

## 🎉 Beneficios

1. **Autogestión**: Los usuarios pueden cambiar sus contraseñas sin ayuda del admin
2. **Seguridad**: Validación de contraseña actual evita cambios no autorizados
3. **Robustez**: Múltiples validaciones aseguran datos correctos
4. **Facilidad de uso**: Endpoint simple y directo
5. **Estándar**: Sigue mejores prácticas de autenticación

---

**Implementación completada y lista para usar** ✅

*Fecha: 6 de enero de 2026*