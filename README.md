Image Processing System - Low-Level Design (LLD) Documentation
System Overview
This project implements an image processing system using NestJS for the backend, MongoDB for database storage, Bull for job queuing, and Cloudinary for image manipulation and storage. The system allows users to upload CSV files containing product information and image URLs, processes these images, and stores the results in the database.

Key Components
1. ImageProcessingController
Handles HTTP requests for uploading CSV files, checking processing status, and retrieving image processing details.
Endpoints:
POST /image-processing/upload: Accepts CSV file uploads.
GET /image-processing/status/:requestId: Checks the status of a processing request using the requestId.
GET /image-processing/details: Retrieves all image processing details from the database.
2. ImageProcessingService
Contains the core business logic responsible for CSV parsing, database interactions, and image processing.
Methods:
uploadCSV: Parses the uploaded CSV file and stores product information in MongoDB.
addToQueue: Adds image processing jobs to the Bull queue for asynchronous processing.
processImages: Handles the actual image processing using Cloudinary.
getAllDetails: Retrieves all image processing details from the database.
3. Product Schema (MongoDB)
Defines the MongoDB schema for storing product information.
Fields:
requestId: Unique ID for tracking processing requests.
serialNumber: Product serial number.
productName: Name of the product.
inputImageUrls: List of input image URLs.
outputImageUrls: List of processed image URLs.
status: Processing status (e.g., pending, completed, failed).
4. Bull Queue
Manages asynchronous image processing tasks using the Bull library.
Queue name: image-queue
5. Cloudinary Integration
Used for image manipulation (e.g., resizing, format conversion) and image storage.
6. Cache Manager
Stores temporary processing status information to optimize performance and reduce database load.
7. Frontend
A simple HTML page (image-processing-details.html) displays the processing details of images.
System Flow
The user uploads a CSV file containing product information and image URLs via the frontend.
The ImageProcessingController receives the file and passes it to the ImageProcessingService.
The service parses the CSV file, stores the relevant product data in MongoDB, and adds an image processing job to the Bull queue.
A Bull worker processes the images using Cloudinary.
The processed image results (e.g., URLs) are stored back into MongoDB.
The user can check the status of their processing request and retrieve details via API endpoints.
+----------------+     +------------------------+     +-------------+
|                |     |                        |     |             |
|    Frontend    |---->| ImageProcessingController |---->|  Service   |
| (HTML/JS Page) |     |                        |     |             |
|                |<----|                        |<----|             |
+----------------+     +------------------------+     +------+------+
                                                              |
                                                              |
                        +------------+                        |
                        |            |                        |
                        | MongoDB    |<-----------------------+
                        | (Products) |                        |
                        |            |                        |
                        +------------+                        |
                                                              |
                        +------------+                        |
                        |            |                        |
                        | Bull Queue |<-----------------------+
                        |            |                        |
                        +------------+                        |
                              |                               |
                              |                               |
                              v                               |
                        +------------+                        |
                        |            |                        |
                        | Cloudinary |<-----------------------+
                        |            |
                        +------------+


How to Run the System
Clone the repository.
Install dependencies: Run npm install in the project root.
Configure environment variables for MongoDB, Bull, and Cloudinary in the .env file.
Run the application: Use npm run start.
Access the frontend at http://localhost:<port>.
Technologies Used
NestJS: Backend framework.
MongoDB: Database for storing product and image data.
Bull: Job queue for asynchronous image processing.
Cloudinary: Image manipulation and storage.
HTML/JavaScript: Simple frontend for displaying image processing details.
