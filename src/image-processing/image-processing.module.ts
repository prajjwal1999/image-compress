import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ImageProcessingService } from './image-processing.service';
import { ImageProcessingController } from './image-processing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../schemas/product.schema';
import { ImageQueueProcessor } from './image-queue.processor';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    BullModule.registerQueue({
        name: 'image-queue', // Name of your queue
      }),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CacheModule.register(), // Register CacheModule here
  ],
  providers: [ImageProcessingService, ImageQueueProcessor],
  controllers: [ImageProcessingController],
})
export class ImageProcessingModule {}
