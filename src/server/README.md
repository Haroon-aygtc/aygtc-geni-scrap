# Server

This directory contains all server-side code for the application.

## Directory Structure

- `api/`: API routes, controllers, and middleware
- `middleware/`: Server-wide middleware
- `utils/`: Server utility functions
- `api-server.js`: Express server setup
- `unified-server.js`: Combined server for development

## API Structure

The API follows a RESTful structure with the following components:

- Routes: Define URL endpoints and HTTP methods
- Controllers: Handle request/response logic
- Services: Contain business logic and data access
- Models: Define database schema and relationships

## Middleware

Middleware functions are used to handle common tasks like:

- Authentication
- Error handling
- Request logging
- CORS
- Body parsing

## Server Configuration

The server is configured in `api-server.js` and includes:

- Express setup
- Middleware registration
- Route registration
- Error handling
- Server startup
