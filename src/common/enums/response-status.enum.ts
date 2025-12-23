/**
 * Enum para los estados de las respuestas del cuestionario
 * DRAFT: Borrador - puede ser editado por el autor
 * FINAL: Finalizado - solo puede ser editado por editor/admin
 * SYNCHRONIZED: Sincronizado - enviado al servidor (estado informativo)
 */
export enum ResponseStatus {
  DRAFT = 'draft',
  FINAL = 'final',
  SYNCHRONIZED = 'synchronized',
}