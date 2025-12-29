import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { StorageService } from '../../common/services/storage.service';

/**
 * Servicio para gestionar comprobantes de transacciones
 * Usa Supabase Storage para almacenamiento seguro
 */
@Injectable()
export class ProofsService {
  private readonly logger = new Logger(ProofsService.name);

  constructor(private readonly storageService: StorageService) { }

  /**
   * Maneja la subida de un comprobante
   * 
   * @param file - Archivo de Express.Multer.File con buffer
   * @param transactionId - ID de la transacción (opcional para upload genérico)
   * @param type - Tipo de comprobante
   * @returns Información del archivo subido
   */
  async handleUpload(
    file: Express.Multer.File,
    transactionId?: number | string,
    type: 'cliente' | 'venezuela' | 'rejection' = 'venezuela',
  ): Promise<{
    message: string;
    path: string;
    originalName: string;
    size: number;
    mimetype: string;
  }> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Si no se proporciona transactionId, usar 'general'
    const txId = transactionId || 'general';

    this.logger.log(`Uploading ${type} proof for transaction ${txId}`);

    const path = await this.storageService.uploadFile(file, txId, type);

    return {
      message: 'Archivo subido exitosamente',
      path,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Obtiene una URL firmada para acceder a un comprobante
   * 
   * @param path - Ruta del archivo en el bucket
   * @param expiresIn - Tiempo de expiración en segundos (opcional)
   * @returns URL firmada
   */
  async getSignedUrl(path: string, expiresIn?: number): Promise<string> {
    if (!path) {
      return '';
    }

    // Si la ruta es una URL local antigua, retornarla como está
    if (path.startsWith('/uploads/')) {
      this.logger.warn(`Legacy local path detected: ${path}`);
      return path;
    }

    return this.storageService.getSignedUrl(path, expiresIn);
  }

  /**
   * Elimina un comprobante
   * 
   * @param path - Ruta del archivo a eliminar
   */
  async deleteProof(path: string): Promise<void> {
    if (path && !path.startsWith('/uploads/')) {
      await this.storageService.deleteFile(path);
    }
  }

  /**
   * Elimina todos los comprobantes de una transacción
   * 
   * @param transactionId - ID de la transacción
   */
  async deleteTransactionProofs(transactionId: number | string): Promise<void> {
    await this.storageService.deleteTransactionFiles(transactionId);
  }
}
