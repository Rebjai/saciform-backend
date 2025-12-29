import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import sharp from 'sharp';
import { join, extname } from 'path';
import { UPLOAD_PATHS } from '../common/multer.config';
import { unlink, access, rename } from 'fs/promises';
import { constants } from 'fs';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  /**
   * Procesar archivo subido: guardar con nombre UUID y optimizar
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

      // Renombrar archivo con UUID
      const fileExtension = extname(uploadedFile.originalname);
      const newOriginalPath = join(UPLOAD_PATHS.originals, `${savedFile.id}${fileExtension}`);
      
      await rename(uploadedFile.path, newOriginalPath);

      // Optimizar imagen inmediatamente
      await this.optimizeImage(savedFile.id, newOriginalPath);

      return this.mapToResponseDto(savedFile);
    } catch (error) {
      // Limpiar archivo en caso de error
      try {
        await unlink(uploadedFile.path);
      } catch (unlinkError) {
        console.error('Error removing uploaded file:', unlinkError);
      }
      
      // Proporcionar información específica sobre el error
      if (error.code === 'ENOENT') {
        throw new BadRequestException('Archivo no encontrado durante el procesamiento');
      } else if (error.code === 'EEXIST') {
        throw new BadRequestException('Ya existe un archivo con ese nombre');
      } else if (error.message?.includes('Sharp')) {
        throw new BadRequestException('Error optimizando la imagen - formato no soportado');
      } else {
        throw new BadRequestException(`Error procesando el archivo: ${error.message || error}`);
      }
    }
  }

  /**
   * Optimizar imagen con Sharp - usa convención de nombres
   */
  private async optimizeImage(fileId: string, originalPath: string): Promise<void> {
    try {
      const optimizedPath = join(UPLOAD_PATHS.optimized, `${fileId}.webp`);

      await sharp(originalPath)
        .webp({ 
          quality: 85,
          effort: 4,
        })
        .resize({
          width: 1920,
          height: 1080,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(optimizedPath);

      // Solo mantener log de éxito de optimización
      console.log(`Image optimized: ${fileId}`);
    } catch (error) {
      console.error(`Error optimizing image ${fileId}:`, error);
    }
  }

  /**
   * Verificar si existe versión optimizada
   */
  private async isOptimized(fileId: string): Promise<boolean> {
    try {
      const optimizedPath = join(UPLOAD_PATHS.optimized, `${fileId}.webp`);
      await access(optimizedPath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtener rutas de archivos por convención
   */
  private getFilePaths(fileId: string, originalExtension: string) {
    return {
      original: join(UPLOAD_PATHS.originals, `${fileId}${originalExtension}`),
      optimized: join(UPLOAD_PATHS.optimized, `${fileId}.webp`),
    };
  }

  /**
   * Obtener archivos por ID de respuesta
   */
  async findByResponseId(responseId: string): Promise<FileResponseDto[]> {
    const files = await this.filesRepository.find({
      where: { responseId },
      order: { createdAt: 'DESC' },
    });

    const results: FileResponseDto[] = [];
    for (const file of files) {
      const dto = await this.mapToResponseDto(file);
      results.push(dto);
    }

    return results;
  }

  /**
   * Eliminar archivo y sus versiones
   */
  async remove(id: string): Promise<void> {
    const file = await this.filesRepository.findOne({ where: { id } });
    
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    // Obtener rutas por convención
    const fileExtension = extname(file.filename);
    const paths = this.getFilePaths(id, fileExtension);

    // Eliminar archivos del sistema
    await Promise.all([
      unlink(paths.original).catch(err => console.error('Error deleting original:', err)),
      unlink(paths.optimized).catch(err => console.error('Error deleting optimized:', err))
    ]);

    // Eliminar registro de BD
    await this.filesRepository.delete(id);
  }

  /**
   * Mapear entidad a DTO con información calculada
   */
  private async mapToResponseDto(file: File): Promise<FileResponseDto> {
    return {
      id: file.id,
      responseId: file.responseId,
      filename: file.filename,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      createdAt: file.createdAt,
      isOptimized: await this.isOptimized(file.id),
      // URLs se pueden agregar aquí cuando se implemente servicio de archivos estáticos
    };
  }
}