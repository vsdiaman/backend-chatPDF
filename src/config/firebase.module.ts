import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // Exporte o serviço para uso em outros módulos
})
export class FirebaseModule {}
