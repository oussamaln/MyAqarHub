import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3] || 'test',
});

const [tables] = await connection.execute("SHOW TABLES");
console.log('Tables:', tables);

const [projects] = await connection.execute("SELECT COUNT(*) as count FROM projects");
console.log('Projects count:', projects);

await connection.end();
