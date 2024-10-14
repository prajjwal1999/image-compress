# Image Processing System - Low-Level Design (LLD) Documentation

## System Overview

This project implements an **Image Processing System** using:

- **NestJS** for backend development
- **MongoDB** for database storage
- **Bull** for job queuing and asynchronous processing
- **Cloudinary** for image manipulation and storage

The system allows users to upload CSV files containing product information and image URLs, processes these images, and stores the results in MongoDB.

## Key Components

### 1. ImageProcessingController
Handles HTTP requests for uploading CSV files, checking processing status, and retrieving image processing details.

#### Endpoints:
- **POST** `/image-processing/upload`: Accepts CSV file uploads.
- **GET** `/image-processing/status/:requestId`: Checks the status of a processing request using the `requestId`.
- **GET** `/image-processing/details`: Retrieves all image processing details from the database.

### 2. ImageProcessingService
Contains the core business logic responsible for CSV parsing, database interactions, and image processing.

#### Methods:
- **uploadCSV**: Parses the uploaded CSV file and stores product information in MongoDB.
- **addToQueue**: Adds image processing jobs to the Bull queue for asynchronous processing.
- **processImages**: Handles the actual image processing using Cloudinary.
- **getAllDetails**: Retrieves all image processing details from the database.

### 3. Product Schema (MongoDB)
Defines the MongoDB schema for storing product information.

#### Fields:
- `requestId`: Unique ID for tracking processing requests.
- `serialNumber`: Product serial number.
- `productName`: Name of the product.
- `inputImageUrls`: List of input image URLs.
- `outputImageUrls`: List of processed image URLs.
- `status`: Processing status (e.g., pending, completed, failed).

### 4. Bull Queue
Manages asynchronous image processing tasks using the Bull library.

- **Queue name**: `image-queue`

### 5. Cloudinary Integration
Used for image manipulation (e.g., resizing, format conversion) and image storage.

### 6. Cache Manager
Stores temporary processing status information to optimize performance and reduce database load.

### 7. Frontend
A simple HTML page (`image-processing-details.html`) displays the processing details of images.

## System Flow

1. The user uploads a CSV file containing product information and image URLs via the frontend.
2. The `ImageProcessingController` receives the file and passes it to the `ImageProcessingService`.
3. The service parses the CSV file, stores the relevant product data in MongoDB, and adds an image processing job to the Bull queue.
4. A Bull worker processes the images using Cloudinary.
5. The processed image results (e.g., URLs) are stored back into MongoDB.
6. The user can check the status of their processing request and retrieve details via API endpoints.

## System Architecture Diagram

bash
Copy code

## How to Run the System

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
Install dependencies:

bash
Copy code
npm install
Configure environment variables: Set up MongoDB, Bull, and Cloudinary configurations in the .env file.

Run the application:

bash
Copy code
npm run start
Access the frontend: Navigate to http://localhost:<port> in your browser.

Technologies Used
NestJS: Backend framework for building scalable applications.
MongoDB: NoSQL database for storing product and image data.
Bull: Job queue for managing asynchronous image processing tasks.
Cloudinary: Image manipulation and storage platform.
HTML/JavaScript: Frontend to display image processing details.


POstman collection: https://api.postman.com/collections/13842220-548bc669-ec95-4a4f-a829-c8953cb25d22?access_key=PMAT-01JA6D2X6WAB1WMHKTKSWD8N3P
