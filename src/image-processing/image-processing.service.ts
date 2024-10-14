import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../common/dto/create-product.dto';
import { v4 as uuidv4 } from 'uuid';
import * as csv from 'csv-parser';
import * as sharp from 'sharp';
import axios from 'axios';
import { Readable } from 'stream';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { v2 as cloudinary } from 'cloudinary';
import { ImageProcessingDetails } from '../common/interfaces/product.interface';

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectQueue('image-queue') private imageQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {
    cloudinary.config({
      cloud_name: 'dqdjmplze',
      api_key: '373843146331583',
      api_secret:'Rpe1tutgXUA5zrOPBVevWKfOYDM',
    });
  }
  async getAllDetails(): Promise<ImageProcessingDetails[]> {
    try {
      const allDetails:ImageProcessingDetails[]= await this.productModel.find();
      return allDetails;
    } catch (error) {
      console.error('Error fetching all image processing details:', error);
      throw new Error('Failed to retrieve image processing details');
    }
  }

  async uploadCSV(file: Express.Multer.File): Promise<string> {
    this.logger.log(`Starting CSV upload process`);
    const requestId = uuidv4();
    const results: CreateProductDto[] = [];

    const stream = Readable.from(file.buffer);

    stream
      .pipe(csv())
      .on('data', (data) => {
        this.logger.debug(`Processing CSV row: ${JSON.stringify(data)}`);
        const { 'S. No.': serialNumber, 'Product Name': productName, 'Input Image Urls': inputImageUrls } = data;
        const product: CreateProductDto = {
          requestId,
          serialNumber,
          productName,
          inputImageUrls: inputImageUrls.split(',').map(url => url.trim()).filter(url => url.length > 0),
        };
        results.push(product);
      })
      .on('end', async () => {
        this.logger.log(`CSV parsing completed. Inserting ${results.length} products into database`);
        await this.productModel.insertMany(results);
        this.logger.log(`Products inserted. Adding job to queue for requestId: ${requestId}`);
        await this.addToQueue(requestId);
      });

    return requestId;
  }

  async addToQueue(requestId: string) {
    this.logger.log(`Setting initial status for requestId: ${requestId}`);
    await this.cacheManager.set(requestId, 'processing');
    this.logger.log(`Adding job to image-queue for requestId: ${requestId}`);
    await this.imageQueue.add('process-images', { requestId });
  }

  async processImages(requestId: string): Promise<void> {
    this.logger.log(`Starting image processing for requestId: ${requestId}`);
    const products = await this.productModel.find({ requestId });
    this.logger.log(`Found ${products.length} products to process`);

    for (const product of products) {
      this.logger.log(`Processing product: ${product.serialNumber}`);
      const processedUrls: string[] = [];

      for (let i = 0; i < product.inputImageUrls.length; i++) {
        const imageUrl = product.inputImageUrls[i];
        this.logger.debug(`Downloading image from: ${imageUrl}`);
        try {
          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
          });
          this.logger.debug(`Image downloaded successfully, size: ${response.data.length} bytes`);

          const imageBuffer = Buffer.from(response.data, 'binary');
          this.logger.debug(`Image buffer created, size: ${imageBuffer.length} bytes`);

          const processedImageBuffer = await sharp(imageBuffer)
            .jpeg({ quality: 50 })
            .toBuffer();
          this.logger.debug(`Image processed with Sharp, new size: ${processedImageBuffer.length} bytes`);

          this.logger.debug(`Attempting to upload to Cloudinary...`);
          const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: `processed/${requestId}`,
                public_id: `${product.serialNumber}-${i + 1}-processed`,
                format: 'jpg',
              },
              (error, result) => {
                if (error) {
                  this.logger.error(`Cloudinary upload error: ${JSON.stringify(error)}`);
                  reject(error);
                } else {
                  this.logger.debug(`Cloudinary upload successful: ${JSON.stringify(result)}`);
                  resolve(result as { secure_url: string });
                }
              }
            ).end(processedImageBuffer);
          });

          this.logger.debug(`Uploaded processed image to Cloudinary: ${uploadResult.secure_url}`);
          processedUrls.push(uploadResult.secure_url);
        } catch (error) {
          this.logger.error(`Error processing image ${i + 1} for product ${product.serialNumber}: ${error.message}`);
          this.logger.error(`Error stack: ${error.stack}`);
        }
      }

      product.outputImageUrls = processedUrls;
      product.status = 'completed';
      await product.save();
      this.logger.log(`Product ${product.serialNumber} processed and saved`);

      await this.cacheManager.set(requestId, 'completed');
      this.logger.log(`Updated cache status to completed for requestId: ${requestId}`);
    }
  }

  async checkStatus(requestId: string): Promise<{ status: string; progress?: number }> {
    this.logger.log(`Checking status for requestId: ${requestId}`);
    const status = await this.cacheManager.get(requestId);
    
    if (!status) {
      this.logger.warn(`Status not found in cache for requestId: ${requestId}`);
      // Check if the requestId exists in the database
      const productExists = await this.productModel.exists({ requestId });
      
      if (productExists) {
        this.logger.log(`RequestId ${requestId} found in database, but not in cache. Setting status to 'processing'.`);
        await this.cacheManager.set(requestId, 'processing');
        return this.checkStatus(requestId); // Recursive call to get the progress
      } else {
        this.logger.warn(`RequestId ${requestId} not found in database`);
        return { status: 'not_found' };
      }
    }

    if (status === 'completed') {
      this.logger.log(`Processing completed for requestId: ${requestId}`);
      return { status: 'completed' };
    }

    if (status === 'processing') {
      this.logger.log(`Processing in progress for requestId: ${requestId}`);
      const totalProducts = await this.productModel.countDocuments({ requestId });
      const completedProducts = await this.productModel.countDocuments({ requestId, status: 'completed' });
      const progress = totalProducts > 0 ? (completedProducts / totalProducts) * 100 : 0;
      
      this.logger.log(`Progress for requestId ${requestId}: ${progress.toFixed(2)}%`);
      
      if (progress === 100) {
        this.logger.log(`All products processed for requestId: ${requestId}. Updating status to 'completed'.`);
        await this.cacheManager.set(requestId, 'completed');
        return { status: 'completed' };
      }
      
      return { 
        status: 'processing', 
        progress: Math.round(progress)
      };
    }

    this.logger.warn(`Unknown status for requestId: ${requestId}`);
    return { status: 'unknown' };
  }
}
