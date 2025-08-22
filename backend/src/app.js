import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './api/index.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// ES Module equivalents for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Global Middleware ---

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded requests
app.use(express.urlencoded({ extended: true }));

// Log every incoming request to the console
app.use(requestLogger);


// --- Static File Serving ---

// Serve files from the 'uploads' directory at the root of the project
const uploadsPath = path.join(__dirname, '../../../uploads');
app.use('/uploads', express.static(uploadsPath));


// --- API Routes ---

// Mount the main API router at the /api endpoint
app.use('/api', api);


// --- Error Handling ---

// Centralized error handler for catching and formatting all errors
app.use(errorHandler);

export default app;
