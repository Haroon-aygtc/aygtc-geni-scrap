# API Utilities

This directory contains utility functions for the API routes and controllers.

## Available Utilities

- `responseFormatter.js`: Formats API responses
- `dbHelpers.js`: Helpers for database operations
- Other utility functions as needed

## Usage

Utilities should be imported directly where needed.

```javascript
import { formatResponse } from '../utils/responseFormatter';

res.json(formatResponse(data));
```
