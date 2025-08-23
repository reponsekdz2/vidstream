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

// Serve uploaded media files from the 'uploads' directory
const uploadsPath = path.join(__dirname, '../../../uploads');
app.use('/uploads', express.static(uploadsPath));


// --- API Routes ---

// Mount the main API router at the /api endpoint.
// This must come BEFORE the frontend serving logic.
app.use('/api', api);


// --- Serve Frontend Application (Production-like) ---

// Define the path to the built frontend assets
const frontendDistPath = path.join(__dirname, '../../../dist');

// Serve static files from the React build directory
app.use(express.static(frontendDistPath));

// The "catchall" handler for client-side routing: for any request that doesn't
// match an API route or a static file, send back the main index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});


// --- Error Handling ---

// Centralized error handler for catching and formatting all errors.
// This must be the last piece of middleware.
app.use(errorHandler);

export default app;
