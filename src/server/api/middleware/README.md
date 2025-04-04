# Middleware

This directory contains middleware functions for the API routes.

## Available Middleware

- `auth.js`: Authentication middleware
- `errorHandler.js`: Error handling middleware
- `validation.js`: Request validation middleware
- `rateLimit.js`: Rate limiting middleware

## Usage

Middleware can be applied at the route level or globally in the API server setup.

### Route Level

```javascript
router.get('/protected', authenticateToken, (req, res) => {
  // This route is protected
});
```

### Global Level

```javascript
app.use(errorHandler);
```
