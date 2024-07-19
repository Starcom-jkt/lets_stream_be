import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// CREATE TABLE `stream`.`merchant` (
//   `id` INT NOT NULL AUTO_INCREMENT,
//   `merchantCode` VARCHAR(300) NULL,
//   `merchantName` VARCHAR(300) NULL,
//   `merchantLogo` VARCHAR(300) NULL,
//   `useBranchLogo` VARCHAR(45) NULL,
//   PRIMARY KEY (`id`));
