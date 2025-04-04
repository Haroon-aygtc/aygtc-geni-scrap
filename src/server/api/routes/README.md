# API Routes

This directory contains all route definitions for the API. Routes are organized by feature and follow a consistent pattern.

Each route file should:

1. Import the necessary controllers
2. Define the routes using Express Router
3. Apply middleware as needed
4. Export the router

Routes should not contain business logic. Instead, they should delegate to controllers for that purpose.
