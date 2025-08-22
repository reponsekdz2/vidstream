import http from 'http';
import app from './src/app.js';

// In a real application, you would use a library like `dotenv` to load environment variables.
const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
