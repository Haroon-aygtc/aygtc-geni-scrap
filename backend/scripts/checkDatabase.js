import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    const { hostname, port, username, password, pathname } = dbUrl;
    const database = pathname.replace(/^\//, '');

    const connection = await mysql.createConnection({
      host: hostname,
      port: port || 3306,
      user: username,
      password: password,
      multipleStatements: true,
    });

    const [rows] = await connection.query('SHOW DATABASES LIKE ?', [database]);
    if (rows.length === 0) {
      console.log(`Database "${database}" does not exist. Creating...`);
      await connection.query(`CREATE DATABASE \`${database}\``);
      console.log(`Database "${database}" created.`);
    } else {
      console.log(`Database "${database}" already exists. Skipping creation.`);
    }

    await connection.end();
  } catch (error) {
    console.error('Error checking/creating database:', error);
    process.exit(1);
  }
}

main();
