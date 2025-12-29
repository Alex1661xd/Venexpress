import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
const envPath = join(process.cwd(), '.env');
config({ path: envPath });

// Parsear DATABASE_URL si existe, sino usar variables individuales
function parseDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      return {
        host: url.hostname,
        port: parseInt(url.port, 10),
        username: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Remover el '/' inicial
      };
    } catch (error) {
      console.error('Error parsing DATABASE_URL:', error);
    }
  }

  // Fallback a variables individuales
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'venexpress',
  };
}

const dbConfig = parseDatabaseUrl();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  autoLoadEntities: true, // NestJS automáticamente carga entidades de los módulos
  migrations: [join(__dirname, '../shared/typeorm/migrations/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
};

// DataSource para migraciones (usa rutas explícitas)
export const AppDataSource = new DataSource({
  ...typeOrmConfig,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  autoLoadEntities: false, // Desactivar para migraciones
} as DataSourceOptions);

