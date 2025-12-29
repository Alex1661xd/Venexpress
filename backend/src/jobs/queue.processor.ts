// TODO: Implementar procesadores de cola con Bull o similar
// import { Processor, Process } from '@nestjs/bull';
// import { Job } from 'bull';

// @Processor('transactions')
// export class TransactionProcessor {
//   @Process('send-notification')
//   async handleNotification(job: Job) {
//     const { userId, message } = job.data;
//     // Procesar notificación
//     return { success: true };
//   }
// }

export class QueueProcessor {
  // Placeholder para procesadores de cola
}

