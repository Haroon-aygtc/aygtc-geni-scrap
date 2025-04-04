# Controllers

This directory contains all controllers for the API routes. Controllers handle the business logic for each route and are organized by feature.

Each controller should:

1. Receive the request and response objects from the route handler
2. Extract and validate data from the request
3. Call the appropriate service to perform business logic
4. Format and send the response

Controllers should not contain direct database access code. Instead, they should use services for that purpose.
