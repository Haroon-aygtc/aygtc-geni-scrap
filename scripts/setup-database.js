const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Log with color
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Check if MySQL is installed
function checkMySQLInstalled() {
  try {
    execSync("mysql --version", { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

// Check database connection
function checkDatabaseConnection() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    log("Missing database configuration in .env file", colors.red);
    log(
      "Please ensure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME are set",
      colors.yellow,
    );
    return false;
  }

  try {
    // Try to connect to MySQL server without specifying a database
    const command = `mysql -h ${DB_HOST} -P ${DB_PORT || 3306} -u ${DB_USER} -p${DB_PASSWORD} -e "SELECT 1"`;
    execSync(command, { stdio: "pipe" });
    return true;
  } catch (error) {
    log(`Failed to connect to MySQL server: ${error.message}`, colors.red);
    return false;
  }
}

// Create database if it doesn't exist
function createDatabase() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  try {
    log(`Creating database ${DB_NAME} if it doesn't exist...`, colors.cyan);
    const command = `mysql -h ${DB_HOST} -P ${DB_PORT || 3306} -u ${DB_USER} -p${DB_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME}"`;
    execSync(command, { stdio: "pipe" });
    log(`Database ${DB_NAME} is ready`, colors.green);
    return true;
  } catch (error) {
    log(`Failed to create database: ${error.message}`, colors.red);
    return false;
  }
}

// Main function to set up the database
async function setupDatabase() {
  log("Starting database setup...", colors.bright);

  // Check if MySQL is installed
  if (!checkMySQLInstalled()) {
    log("MySQL is not installed or not in PATH", colors.red);
    log("Please install MySQL and try again", colors.yellow);
    process.exit(1);
  }

  // Check database connection
  if (!checkDatabaseConnection()) {
    log("Failed to connect to MySQL server", colors.red);
    log(
      "Please check your database configuration and try again",
      colors.yellow,
    );
    process.exit(1);
  }

  // Create database
  if (!createDatabase()) {
    log("Failed to create database", colors.red);
    process.exit(1);
  }

  // Run migrations
  log("Running migrations...", colors.cyan);
  try {
    execSync("npm run migrate", { stdio: "inherit" });
    log("Migrations completed successfully", colors.green);
  } catch (error) {
    log(`Failed to run migrations: ${error.message}`, colors.red);
    process.exit(1);
  }

  log("Database setup completed successfully!", colors.green);
}

// Run the setup
setupDatabase().catch((err) => {
  log(`Error setting up database: ${err}`, colors.red);
  process.exit(1);
});
