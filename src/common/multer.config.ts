import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

// Crear directorios si no existen
const ensureUploadDirs = () => {
  const uploadDir = join(process.cwd(), 'uploads');
  const originalsDir = join(uploadDir, 'originals');
  const optimizedDir = join(uploadDir, 'optimized');

  [uploadDir, originalsDir, optimizedDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
};

// Crear directorios al cargar el módulo
ensureUploadDirs();

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads', 'originals');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generar nombre único: uuid + extensión original
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      cb(new BadRequestException('Tipo de archivo no permitido. Solo se permiten: jpg, jpeg, png, webp'), false);
      return;
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 10, // Máximo 10 archivos por request
  },
};

export const UPLOAD_PATHS = {
  originals: join(process.cwd(), 'uploads', 'originals'),
  optimized: join(process.cwd(), 'uploads', 'optimized'),
};