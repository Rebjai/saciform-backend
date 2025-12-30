export class FileResponseDto {
  id: string;
  responseId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
  
  // URL para acceder al archivo optimizado
  url?: string;
  isOptimized?: boolean;
}