# API Structure

This directory contains all API routes and controllers for the application.

## Directory Structure

- `routes/`: Contains all route definitions
- `controllers/`: Contains business logic for each route
- `middleware/`: Contains middleware functions
- `utils/`: Contains utility functions for API operations

## API Routes

All routes are registered in `index.js` and follow a consistent pattern:

```javascript
router.use('/route-name', routeNameRoutes);
```

## Controllers

Controllers handle the business logic for each route. They are organized by feature and follow a consistent pattern:

```javascript
export const getAllItems = async (req, res) => {
  // Logic to get all items
};

export const getItemById = async (req, res) => {
  // Logic to get item by id
};

// etc.
```

## Middleware

Middleware functions are used to handle common tasks like authentication, validation, etc.

## Database Access

All database access should go through the services layer, not directly in controllers.
