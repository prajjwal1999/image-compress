import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop()
  requestId: string;

  @Prop()
  serialNumber: number;

  @Prop()
  productName: string;

  @Prop([String])
  inputImageUrls: string[];

  @Prop([String])
  outputImageUrls: string[];

  @Prop({ default: 'pending' })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
