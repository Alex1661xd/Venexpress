import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProofsService } from './proofs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Controlador para gestión de comprobantes
 * Los archivos se reciben en memoria y se suben a Supabase Storage
 */
@Controller('proofs')
@UseGuards(JwtAuthGuard)
export class ProofsController {
  constructor(private readonly proofsService: ProofsService) { }

  /**
   * Sube un comprobante genérico
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes y PDFs'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('transactionId') transactionId?: string,
    @Body('type') type?: 'cliente' | 'venezuela' | 'rejection',
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return this.proofsService.handleUpload(
      file,
      transactionId ? parseInt(transactionId, 10) : undefined,
      type || 'venezuela',
    );
  }

  /**
   * Obtiene una URL firmada para acceder a un comprobante
   */
  @Get('signed-url')
  async getSignedUrl(
    @Query('path') path: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    if (!path) {
      throw new BadRequestException('La ruta del archivo es requerida');
    }

    const expiration = expiresIn ? parseInt(expiresIn, 10) : undefined;
    const signedUrl = await this.proofsService.getSignedUrl(path, expiration);

    return { signedUrl };
  }
}
