import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ImageProcessingModule } from './image-processing/image-processing.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://prajjwal:UXDfshWUc8OaKRSQ@cluster0.rjegm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    CacheModule.register(), // Register the CacheModule globally
    ImageProcessingModule,
  ],
})
export class AppModule {}
