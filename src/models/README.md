# Models

This directory contains all database models for the application. Models define the structure of database tables and provide methods for interacting with them.

## Directory Structure

- `index.js`: Exports all models and initializes database connections
- Individual model files organized by entity

## Model Pattern

Each model follows the Sequelize pattern:

```javascript
class ModelName extends Model {
  // Model methods
}

export const initModelName = async () => {
  const sequelize = await getMySQLClient();

  ModelName.init(
    {
      // Model attributes
    },
    {
      sequelize,
      tableName: 'table_name',
      // Other options
    }
  );

  return ModelName;
};

export default ModelName;
```

## Relationships

Model relationships should be defined in the `index.js` file after all models have been initialized.

## Usage

Models should be used by services to interact with the database. Controllers should never directly use models.
