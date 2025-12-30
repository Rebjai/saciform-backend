import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { join, extname } from 'path';
import { UPLOAD_PATHS } from '../common/multer.config';
import { unlink, rename } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  /**
   * Procesar archivo subido: solo guardar y renombrar con UUID
   */
  async processUploadedFile(
    uploadedFile: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    try {
      // Crear registro en base de datos primero para obtener UUID
      const file = this.filesRepository.create({
        responseId: uploadFileDto.responseId,
        filename: uploadedFile.originalname,
        mimeType: uploadedFile.mimetype,
        fileSize: uploadedFile.size,
      });

      const savedFile = await this.filesRepository.save(file);

      // Renombrar archivo con UUID (el frontend ya envió optimizada)
      const fileExtension = extname(uploadedFile.originalname);
      const finalPath = join(UPLOAD_PATHS.optimized, `${savedFile.id}${fileExtension}`);
      
      await rename(uploadedFile.path, finalPath);

      return this.mapToResponseDto(savedFile);
    } catch (error) {
      // Limpiar archivo en caso de error
      try {
        await unlink(uploadedFile.path);
      } catch (unlinkError) {
        console.error('Error removing uploaded file:', unlinkError);
      }
      
      throw new BadRequestException(`Error procesando el archivo: ${error.message || error}`);
    }
  }

  /**
   * Obtener stream de archivo para servir
   */
  async getFileStream(fileId: string): Promise<{ file: File; stream: any }> {
    const file = await this.filesRepository.findOne({ where: { id: fileId } });
    
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    const fileExtension = extname(file.filename);
    const filePath = join(UPLOAD_PATHS.optimized, `${fileId}${fileExtension}`);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    const stream = createReadStream(filePath);
    return { file, stream };
  }

  /**
   * Obtener archivos por ID de respuesta
   */
  async findByResponseId(responseId: string): Promise<FileResponseDto[]> {
    const files = await this.filesRepository.find({
      where: { responseId },
      order: { createdAt: 'DESC' },
    });

    return files.map(file => this.mapToResponseDto(file));
  }

  /**
   * Eliminar archivo completamente
   */
  async remove(id: string): Promise<void> {
    const file = await this.filesRepository.findOne({ where: { id } });
    
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Obtener ruta del archivo (solo está en optimized)
    const fileExtension = extname(file.filename);
    const filePath = join(UPLOAD_PATHS.optimized, `${id}${fileExtension}`);

    // Eliminar archivo del sistema
    try {
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continuar con eliminación de BD aunque falle el archivo físico
    }

    // Eliminar registro de BD
    await this.filesRepository.delete(id);
  }

  /**
   * Mapear entidad a DTO
   */
  private mapToResponseDto(file: File): FileResponseDto {
    return {
      id: file.id,
      responseId: file.responseId,
      filename: file.filename,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      createdAt: file.createdAt,
      isOptimized: true, // Frontend ya envió optimizada
      url: `/files/serve/${file.id}`, // URL para servir la imagen
    };
  }
}