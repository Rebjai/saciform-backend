# 📝 API Cuestionarios - Sacifor Backend

Sistema de gestión de cuestionarios dinámicos con estructura JSON flexible y metadata configurable.

## 📊 Estructura de Datos

```typescript
Questionnaire {
  id: string;              // UUID único
  name: string;            // Nombre descriptivo del cuestionario
  description?: string;    // Descripción opcional
  questions: Record<string, any>;  // Estructura de preguntas en JSON
  metadata?: Record<string, any>;  // Metadata adicional
  isActive: boolean;       // Estado activo/inactivo
  createdBy: string;       // Usuario que creó el cuestionario
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}
```

## 🔐 Permisos por Rol

| Acción | USER | EDITOR | ADMIN |
|--------|------|--------|-------|
| Ver cuestionarios activos | ✅ | ✅ | ✅ |
| Ver cuestionarios inactivos | ❌ | ✅ | ✅ |
| Crear cuestionario | ❌ | ✅ | ✅ |
| Actualizar cuestionario | ❌ | ✅ | ✅ |
| Activar/desactivar | ❌ | ✅ | ✅ |
| Eliminar cuestionario | ❌ | ❌ | ✅ |

## 🔧 Endpoints

### 📋 Obtener Cuestionarios

**GET** `/questionnaires`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters (opcionales):**
- `includeInactive=true` - Incluir cuestionarios inactivos (EDITOR/ADMIN)

**Comportamiento por Rol:**
- **USER**: Solo ve cuestionarios activos
- **EDITOR/ADMIN**: Puede ver todos, incluyendo inactivos con parámetro

**Respuesta 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Entrevista Actores Locales v1.0",
    "description": "Cuestionario para caracterización de actores locales del territorio",
    "questions": {
      "estructura": "flexible",
      "secciones": {
        "identificacion": {
          "actor_name": {
            "tipo": "text",
            "requerido": true,
            "placeholder": "Nombre del actor"
          },
          "organization": {
            "tipo": "text", 
            "requerido": false,
            "placeholder": "Organización a la que pertenece"
          }
        },
        "caracterizacion": {
          "role": {
            "tipo": "select",
            "opciones": ["leader", "member", "representative"],
            "requerido": true
          },
          "experience_years": {
            "tipo": "number",
            "min": 0,
            "max": 100
          }
        }
      }
    },
    "metadata": {
      "version": "1.0",
      "category": "actors_characterization",
      "estimated_duration": "15-20 minutes",
      "tags": ["actors", "community", "leadership"]
    },
    "isActive": true,
    "createdBy": "admin-uuid",
    "createdAt": "2025-12-30T08:15:16.179Z",
    "updatedAt": "2025-12-30T08:15:16.179Z"
  }
]
```

---

### 🔍 Obtener Cuestionario por ID

**GET** `/questionnaires/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Evaluación Comunitaria Territorial",
  "description": "Cuestionario integral para evaluación de necesidades y recursos comunitarios",
  "questions": {
    "intro": {
      "title": "Información General de la Comunidad",
      "fields": {
        "community_name": {
          "type": "text",
          "label": "Nombre de la comunidad",
          "required": true,
          "validation": {"min_length": 2, "max_length": 100}
        },
        "population": {
          "type": "number",
          "label": "Población aproximada",
          "required": true,
          "validation": {"min": 1, "max": 100000}
        }
      }
    },
    "infrastructure": {
      "title": "Infraestructura y Servicios",
      "fields": {
        "water_access": {
          "type": "select",
          "label": "Acceso a agua potable",
          "options": ["no_access", "limited", "adequate", "excellent"],
          "required": true
        },
        "electricity": {
          "type": "boolean",
          "label": "¿Tienen acceso a electricidad?"
        },
        "roads": {
          "type": "multiselect",
          "label": "Tipos de vías de acceso",
          "options": ["paved", "gravel", "dirt", "trail"]
        }
      }
    },
    "challenges": {
      "title": "Desafíos y Necesidades",
      "fields": {
        "main_challenges": {
          "type": "checkbox_group",
          "label": "Principales desafíos (seleccione todos los que apliquen)",
          "options": [
            {"value": "water", "label": "Acceso a agua potable"},
            {"value": "health", "label": "Servicios de salud"},
            {"value": "education", "label": "Educación"},
            {"value": "employment", "label": "Oportunidades de empleo"},
            {"value": "transport", "label": "Transporte"},
            {"value": "security", "label": "Seguridad"}
          ]
        },
        "priority_projects": {
          "type": "nested_object",
          "label": "Proyectos prioritarios",
          "structure": {
            "short_term": {
              "type": "text_array",
              "label": "Proyectos a corto plazo (1-2 años)"
            },
            "long_term": {
              "type": "text_array", 
              "label": "Proyectos a largo plazo (3-5 años)"
            }
          }
        }
      }
    }
  },
  "metadata": {
    "version": "2.1",
    "category": "community_assessment",
    "estimated_duration": "25-30 minutes",
    "tags": ["community", "infrastructure", "needs_assessment"],
    "author": "Equipo Técnico Sacifor",
    "last_review": "2025-12-15",
    "complexity": "intermediate"
  },
  "isActive": true,
  "createdBy": "editor-uuid",
  "createdAt": "2025-12-15T10:30:00.000Z",
  "updatedAt": "2025-12-20T14:45:30.000Z"
}
```

---

### ➕ Crear Cuestionario

**POST** `/questionnaires`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Permisos:** EDITOR, ADMIN únicamente

**Body:**
```json
{
  "name": "Diagnóstico Productivo Local",
  "description": "Cuestionario para identificar actividades productivas y potencialidades económicas locales",
  "questions": {
    "general_info": {
      "title": "Información General",
      "fields": {
        "respondent_name": {
          "type": "text",
          "label": "Nombre del entrevistado",
          "required": true
        },
        "position": {
          "type": "text", 
          "label": "Cargo o posición en la comunidad",
          "required": false
        }
      }
    },
    "productive_activities": {
      "title": "Actividades Productivas",
      "fields": {
        "main_activities": {
          "type": "checkbox_group",
          "label": "Principales actividades económicas",
          "options": [
            {"value": "agriculture", "label": "Agricultura"},
            {"value": "livestock", "label": "Ganadería"},
            {"value": "fishing", "label": "Pesca"},
            {"value": "commerce", "label": "Comercio"},
            {"value": "tourism", "label": "Turismo"},
            {"value": "crafts", "label": "Artesanías"},
            {"value": "other", "label": "Otro"}
          ],
          "required": true
        },
        "agricultural_products": {
          "type": "conditional",
          "condition": {"field": "main_activities", "includes": "agriculture"},
          "fields": {
            "crops": {
              "type": "text_array",
              "label": "Principales cultivos"
            },
            "production_scale": {
              "type": "select",
              "label": "Escala de producción",
              "options": ["subsistence", "local_market", "regional_market", "export"]
            }
          }
        }
      }
    }
  },
  "metadata": {
    "version": "1.0",
    "category": "economic_assessment", 
    "estimated_duration": "20-25 minutes",
    "tags": ["economy", "production", "local_development"]
  },
  "isActive": true
}
```

**Respuesta 201:**
```json
{
  "id": "new-questionnaire-uuid",
  "name": "Diagnóstico Productivo Local",
  "description": "Cuestionario para identificar actividades productivas y potencialidades económicas locales",
  "questions": {"...": "..."},
  "metadata": {"...": "..."},
  "isActive": true,
  "createdBy": "current-user-uuid",
  "createdAt": "2025-12-30T10:15:30.179Z",
  "updatedAt": "2025-12-30T10:15:30.179Z"
}
```

---

### ✏️ Actualizar Cuestionario

**PATCH** `/questionnaires/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Permisos:** EDITOR, ADMIN únicamente

**Body (todos los campos opcionales):**
```json
{
  "name": "Diagnóstico Productivo Local v2.0",
  "description": "Versión actualizada con nuevas secciones de innovación",
  "questions": {
    "innovation": {
      "title": "Innovación y Tecnología",
      "fields": {
        "technology_use": {
          "type": "select",
          "label": "Nivel de uso de tecnología",
          "options": ["none", "basic", "intermediate", "advanced"]
        }
      }
    }
  },
  "metadata": {
    "version": "2.0",
    "last_review": "2025-12-30"
  }
}
```

**Lógica de Actualización:**
- Los campos se hacen merge con los existentes
- Para reemplazar completamente un objeto, enviarlo completo
- `updatedAt` se actualiza automáticamente

**Respuesta 200:**
```json
{
  "id": "questionnaire-uuid",
  "message": "Cuestionario actualizado exitosamente",
  "updatedAt": "2025-12-30T10:30:15.179Z"
}
```

---

### 🔄 Activar/Desactivar Cuestionario

**PATCH** `/questionnaires/:id/status`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "isActive": false
}
```

**Respuesta 200:**
```json
{
  "id": "questionnaire-uuid",
  "isActive": false,
  "message": "Estado del cuestionario actualizado",
  "updatedAt": "2025-12-30T10:35:00.179Z"
}
```

---

### 🗑️ Eliminar Cuestionario

**DELETE** `/questionnaires/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Permisos:** ADMIN únicamente

**Validaciones:**
- No se puede eliminar si tiene respuestas asociadas
- Debe desactivarse primero si está activo

**Respuesta 200:**
```json
{
  "message": "Cuestionario eliminado exitosamente"
}
```

**Errores:**
- `409` - Cuestionario tiene respuestas asociadas
- `400` - Cuestionario debe estar inactivo para eliminar

---

## 📝 Ejemplos de Uso Completos

### Flujo completo de gestión:

```bash
# 1. Listar cuestionarios disponibles
curl -X GET http://localhost:3000/questionnaires \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 2. Crear nuevo cuestionario (EDITOR/ADMIN)
curl -X POST http://localhost:3000/questionnaires \
  -H "Authorization: Bearer EDITOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evaluación de Recursos Naturales",
    "description": "Cuestionario para mapeo de recursos naturales locales",
    "questions": {
      "water_resources": {
        "title": "Recursos Hídricos",
        "fields": {
          "water_sources": {
            "type": "checkbox_group",
            "label": "Fuentes de agua disponibles",
            "options": [
              {"value": "river", "label": "Río"},
              {"value": "well", "label": "Pozo"},
              {"value": "spring", "label": "Manantial"},
              {"value": "rainwater", "label": "Agua lluvia"}
            ]
          }
        }
      }
    },
    "metadata": {
      "category": "natural_resources",
      "estimated_duration": "15 minutes"
    }
  }'

# 3. Obtener cuestionario específico
curl -X GET http://localhost:3000/questionnaires/QUESTIONNAIRE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Actualizar cuestionario
curl -X PATCH http://localhost:3000/questionnaires/QUESTIONNAIRE_ID \
  -H "Authorization: Bearer EDITOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Versión actualizada con sección de biodiversidad",
    "questions": {
      "biodiversity": {
        "title": "Biodiversidad Local",
        "fields": {
          "endemic_species": {
            "type": "text_array",
            "label": "Especies endémicas conocidas"
          }
        }
      }
    }
  }'

# 5. Desactivar cuestionario
curl -X PATCH http://localhost:3000/questionnaires/QUESTIONNAIRE_ID/status \
  -H "Authorization: Bearer EDITOR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'

# 6. Ver cuestionarios inactivos (EDITOR/ADMIN)
curl -X GET "http://localhost:3000/questionnaires?includeInactive=true" \
  -H "Authorization: Bearer EDITOR_JWT_TOKEN"
```

### Estructura de preguntas avanzada:

```json
{
  "questions": {
    "demographics": {
      "title": "Información Demográfica",
      "description": "Datos básicos de la población",
      "fields": {
        "age_groups": {
          "type": "object",
          "label": "Distribución por grupos etarios",
          "structure": {
            "children": {"type": "number", "label": "Niños (0-12)"},
            "youth": {"type": "number", "label": "Jóvenes (13-25)"},
            "adults": {"type": "number", "label": "Adultos (26-60)"},
            "elderly": {"type": "number", "label": "Adultos mayores (60+)"}
          }
        },
        "education_level": {
          "type": "select",
          "label": "Nivel educativo predominante",
          "options": [
            {"value": "none", "label": "Sin educación formal"},
            {"value": "primary", "label": "Primaria"},
            {"value": "secondary", "label": "Secundaria"}, 
            {"value": "technical", "label": "Técnico"},
            {"value": "university", "label": "Universitario"}
          ],
          "required": true
        },
        "languages": {
          "type": "multiselect",
          "label": "Idiomas hablados en la comunidad",
          "options": [
            {"value": "spanish", "label": "Español"},
            {"value": "miskito", "label": "Miskito"},
            {"value": "creole", "label": "Creole"},
            {"value": "garifuna", "label": "Garífuna"},
            {"value": "other", "label": "Otro"}
          ]
        }
      }
    }
  }
}
```

---

## 🔗 Integración con Respuestas

Los cuestionarios están diseñados para ser flexibles y permitir que las respuestas se adapten a su estructura:

```json
// Ejemplo de respuesta basada en cuestionario
{
  "surveyId": "questionnaire-uuid-here",
  "answers": {
    "demographics": {
      "age_groups": {
        "children": 15,
        "youth": 8,
        "adults": 25,
        "elderly": 12
      },
      "education_level": "primary",
      "languages": ["spanish", "miskito"]
    }
  },
  "metadata": {
    "questionnaire_version": "1.0",
    "completion_time": "18 minutes"
  }
}
```

---

## ⚠️ Consideraciones Importantes

1. **Estructura JSON Libre**: Los cuestionarios pueden tener cualquier estructura de preguntas
2. **Versionado Manual**: Usar el campo `metadata.version` para control de versiones
3. **Estado Activo**: Solo cuestionarios activos aparecen por defecto para usuarios
4. **Eliminación Protegida**: No se pueden eliminar cuestionarios con respuestas asociadas
5. **Flexibilidad Total**: No hay validación estricta de la estructura de preguntas
6. **Metadata Extensible**: Campo metadata puede contener cualquier información adicional
7. **Trazabilidad**: Se registra quién creó cada cuestionario y cuándo

---

## 🚀 Próximas Funcionalidades

- [ ] Versionado automático de cuestionarios
- [ ] Plantillas predefinidas de cuestionarios
- [ ] Validador de estructura de preguntas
- [ ] Preview/modo prueba para cuestionarios
- [ ] Duplicación de cuestionarios existentes
- [ ] Estadísticas de uso por cuestionario
- [ ] Exportación de cuestionarios (JSON, PDF)
- [ ] Sistema de tags y categorías avanzado