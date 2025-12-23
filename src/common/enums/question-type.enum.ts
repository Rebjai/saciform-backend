/**
 * Enum para los tipos de preguntas en el cuestionario
 * Cada tipo define cómo se mostrará y validará la pregunta
 */
export enum QuestionType {
  RADIO = 'radio',           // Opción única (radio buttons)
  CHECKBOX = 'checkbox',     // Opción múltiple (checkboxes) 
  TEXT = 'text',            // Texto corto (input)
  TEXTAREA = 'textarea',     // Texto largo (textarea)
  SELECT = 'select',        // Lista desplegable (select)
  IMAGE = 'image',          // Captura/adjuntar imágenes
  GPS = 'gps',             // Captura automática GPS
  GPS_MANUAL = 'gps_manual' // Coordenadas GPS manuales
}