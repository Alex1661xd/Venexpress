import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProofsController } from './proofs.controller';
import { ProofsService } from './proofs.service';
import { StorageService } from '../../common/services/storage.service';

/**
 * Módulo de Proofs (Comprobantes)
 * Exporta StorageService para uso en otros módulos
 */
@Global()
@Module({
  imports: [ConfigModule],
  controllers: [ProofsController],
  providers: [ProofsService, StorageService],
  exports: [ProofsService, StorageService],
})
export class ProofsModule { }
