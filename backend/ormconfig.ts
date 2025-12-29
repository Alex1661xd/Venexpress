import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno desde la raíz del proyecto
config({ path: join(__dirname, '.env') });

// Parsear DATABASE_URL si existe
function parseDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remover el '/' inicial
    };
  }

  // Fallback a variables individuales
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'postgres',
  };
}

const dbConfig = parseDatabaseUrl();

export default new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  // Usar la carpeta de migraciones del proyecto
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
  // Desactivar synchronize para evitar que TypeORM modifique el schema automáticamente
  synchronize: false,
  logging: true,
  ssl: { rejectUnauthorized: false },
  extra: {
    timezone: 'America/Bogota',
  },
});

