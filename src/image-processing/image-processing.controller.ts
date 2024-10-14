import { Controller, Post, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageProcessingService } from './image-processing.service';
import { ImageProcessingDetails } from '../common/interfaces/product.interface';

@Controller('image-processing')
export class ImageProcessingController {
  constructor(private readonly imageProcessingService: ImageProcessingService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File): Promise<{ requestId: string }> {
    const requestId = await this.imageProcessingService.uploadCSV(file);
    return { requestId };
  }

  @Get('status/:requestId')
  async checkStatus(@Param('requestId') requestId: string) {
    const status = await this.imageProcessingService.checkStatus(requestId);
    return status;
  }
  @Get('details')
  async getAllDetails(): Promise<ImageProcessingDetails[]> {
    return await this.imageProcessingService.getAllDetails();
  }
}

 

