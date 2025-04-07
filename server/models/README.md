# Models

This directory contains the data models used throughout the application. Each model represents a database entity and includes methods for converting between database records and application objects.

## Structure

Each model file follows a similar pattern:

1. TypeScript interface defining the attributes
2. Class implementation with:
   - Constructor with default values
   - Static `fromDatabase` method to convert DB records to model instances
   - `toDatabase` method to convert model instances to DB records
   - Additional utility methods as needed

## Available Models

- `AIInteractionLog`: Logs of AI interactions
- `AIResponseCache`: Cache for AI responses
- `ChatMessage`: Individual chat messages
- `ChatSession`: Chat session information
- `FollowUpConfig`: Configuration for follow-up questions
- `FollowUpQuestion`: Individual follow-up questions
- `PredefinedQuestion`: Predefined questions for follow-ups
- `PredefinedQuestionSet`: Sets of predefined questions
- `ResponseFormattingConfig`: Configuration for response formatting
- `ResponseTemplate`: Templates for AI responses
- `TopicBasedQuestion`: Topic-based questions for follow-ups
- `TopicBasedQuestionSet`: Sets of topic-based questions
- `User`: User account information
- `UserActivity`: User activity logs
- `WidgetConfig`: Configuration for chat widgets

## Usage

```typescript
import { User } from '../models/User';

// Create a new user
const user = new User({
  email: 'user@example.com',
  name: 'Example User',
  role: 'user'
});

// Convert to database format
const dbRecord = user.toDatabase();

// Convert from database record
const retrievedUser = User.fromDatabase(dbRecord);
```
