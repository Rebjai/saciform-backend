import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import type { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { multerConfig } from '../common/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Subir un solo archivo
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return await this.filesService.processUploadedFile(file, uploadFileDto);
  }

  /**
   * Subir múltiples archivos
   */
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<FileResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    const results: FileResponseDto[] = [];
    
    for (const file of files) {
      try {
        const result = await this.filesService.processUploadedFile(file, uploadFileDto);
        results.push(result);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
      }
    }

    return results;
  }

  /**
   * Obtener archivos por ID de respuesta
   */
  @Get('response/:responseId')
  async getFilesByResponse(
    @Param('responseId') responseId: string,
  ): Promise<FileResponseDto[]> {
    return await this.filesService.findByResponseId(responseId);
  }

  /**
   * Servir imagen optimizada
   */
  @Get('serve/:fileId')
  async serveFile(
    @Param('fileId') fileId: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<StreamableFile> {
    const { file, stream } = await this.filesService.getFileStream(fileId);
    
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Cache-Control': 'public, max-age=31536000', // 1 año de cache
    });

    return new StreamableFile(stream);
  }

  /**
   * Eliminar archivo
   */
  @Delete(':id')
  async deleteFile(@Param('id') id: string): Promise<{ message: string }> {
    await this.filesService.remove(id);
    return { message: 'Archivo eliminado exitosamente' };
  }
}