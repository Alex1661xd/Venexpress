# 🚀 Inicio Rápido - Venexpress Backend

## 1. Instalación de Dependencias

```bash
npm install
```

## 2. Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=venexpress

# JWT
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRATION=7d

# Application
PORT=3001
NODE_ENV=development
```

## 3. Crear Base de Datos

```bash
# En PostgreSQL
createdb venexpress
```

O desde psql:

```sql
CREATE DATABASE venexpress;
```

## 4. Ejecutar Migraciones

```bash
# Sincronizar entidades (desarrollo)
npm run start:dev
```

O generar y ejecutar migraciones:

```bash
# Generar migración
npm run migration:generate -- src/shared/typeorm/migrations/InitialSchema

# Ejecutar migraciones
npm run migration:run
```

## 5. Poblar Base de Datos (Seed)

```bash
# Ejecutar seed de ejemplo
npx ts-node src/shared/typeorm/seeds/seed.example.ts
```

## 6. Iniciar la Aplicación

### Desarrollo

```bash
npm run start:dev
```

La API estará disponible en: `http://localhost:3001/api`

### Producción

```bash
npm run build
npm run start:prod
```

## 📍 Endpoints Principales

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere token)

### Tasas de Cambio

- `GET /api/rates/current` - Obtener tasa actual (público)
- `POST /api/rates` - Crear nueva tasa (admin Venezuela)

### Transacciones

- `POST /api/transactions` - Crear transacción
- `GET /api/transactions` - Listar transacciones
- `GET /api/transactions/:id` - Ver detalle
- `PATCH /api/transactions/:id/status` - Actualizar estado (admins)

### Usuarios

- `GET /api/users` - Listar usuarios (admin)
- `POST /api/users` - Crear usuario (admin)

### Puntos

- `GET /api/points` - Listar puntos
- `POST /api/points` - Crear punto (admin Colombia)

### Clientes

- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente (vendedor/admin)

### Destinatarios

- `GET /api/beneficiaries` - Listar destinatarios
- `POST /api/beneficiaries` - Crear destinatario

### Comprobantes

- `POST /api/proofs/upload` - Subir comprobante

### Notificaciones

- `GET /api/notifications` - Listar notificaciones
- `GET /api/notifications/unread-count` - Contador de no leídas
- `PATCH /api/notifications/:id/read` - Marcar como leída

## 🔑 Credenciales por Defecto (después del seed)

```
Admin Colombia:
  Email: admin.colombia@venexpress.com
  Password: admin123

Admin Venezuela:
  Email: admin.venezuela@venexpress.com
  Password: admin123

Vendedor:
  Email: vendedor@venexpress.com
  Password: admin123
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Ejemplo de Uso con cURL

### 1. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.colombia@venexpress.com","password":"admin123"}'
```

### 2. Obtener Tasa Actual

```bash
curl http://localhost:3001/api/rates/current
```

### 3. Crear Transacción (requiere token)

```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "beneficiaryId": 1,
    "amountCOP": 160000,
    "notes": "Giro de prueba"
  }'
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos

Verifica que PostgreSQL esté corriendo:

```bash
# Windows
Get-Service postgresql*

# Linux/Mac
sudo service postgresql status
```

### Puerto 3001 en uso

Cambia el puerto en `.env`:

```env
PORT=3002
```

### Error en migraciones

```bash
# Revertir última migración
npm run migration:revert

# Sincronizar en desarrollo (cuidado en producción!)
# Está habilitado por defecto en modo development
```

## 📚 Más Información

- Ver `ESTRUCTURA.md` para detalles de la arquitectura
- Ver `README.md` para documentación completa
- Documentación de NestJS: https://docs.nestjs.com
- Documentación de TypeORM: https://typeorm.io

