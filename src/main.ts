import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from the 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/', // This ensures files are served from the root URL
  });
  
  // Set the views directory
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  
  // Set the view engine to use
  app.setViewEngine('hbs');

  const port = 3000;
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`HTML file should be accessible at: http://localhost:${port}/image-processing-details.html`);
}
bootstrap();