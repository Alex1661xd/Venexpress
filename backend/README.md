# Venexpress Backend

Sistema de giros Colombia-Venezuela - Backend API

## Tecnologías

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication

## Instalación

```bash
npm install
```

## Configuración

1. Copiar `.env.example` a `.env`
2. Configurar las variables de entorno

## Ejecución

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Migraciones

```bash
# Generar migración
npm run migration:generate -- src/shared/typeorm/migrations/MigrationName

# Ejecutar migraciones
npm run migration:run

# Revertir migración
npm run migration:revert
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

