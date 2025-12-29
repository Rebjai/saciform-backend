export class FileResponseDto {
  id: string;
  responseId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
  
  // URLs calculadas dinámicamente
  originalUrl?: string;
  optimizedUrl?: string;
  isOptimized?: boolean; // Calculado por existencia de archivo
}