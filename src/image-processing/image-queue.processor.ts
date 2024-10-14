import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ImageProcessingService } from './image-processing.service';
import { Logger } from '@nestjs/common';

@Processor('image-queue')
export class ImageQueueProcessor {
  private readonly logger = new Logger(ImageQueueProcessor.name);

  constructor(private readonly imageProcessingService: ImageProcessingService) {}

  @Process('process-images')
  async handleProcessing(job: Job) {
    const { requestId } = job.data;
    this.logger.log(`Starting image processing for requestId: ${requestId}`);

    try {
      await this.imageProcessingService.processImages(requestId);
      this.logger.log(`Image processing completed for requestId: ${requestId}`);
    } catch (error) {
      this.logger.error(`Error processing images for requestId: ${requestId}`, error.stack);
      throw error;
    }
  }
}
