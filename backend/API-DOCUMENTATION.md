# 📡 Documentación de la API - Venexpress

## Base URL

```
http://localhost:3001/api
```

## Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Después de hacer login, incluye el token en el header:

```
Authorization: Bearer {tu_token_jwt}
```

---

## 🔐 Auth Module

### Registrar Usuario

```http
POST /api/auth/register
```

**Body:**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "3001234567",
  "password": "password123",
  "role": "cliente" // opcional, por defecto "cliente"
}
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "3001234567",
    "role": "cliente"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```http
POST /api/auth/login
```

**Body:**

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Obtener Perfil

```http
GET /api/auth/profile
```

**Headers:** `Authorization: Bearer {token}`

---

## 💱 Rates Module (Tasas de Cambio)

### Obtener Tasa Actual

```http
GET /api/rates/current
```

**Público** - No requiere autenticación

**Response:**

```json
{
  "id": 1,
  "rate": 213.5,
  "createdAt": "2024-01-15T10:30:00Z",
  "createdBy": {
    "id": 2,
    "name": "Admin Venezuela"
  }
}
```

### Crear Nueva Tasa

```http
POST /api/rates
```

**Roles:** `admin_venezuela`

**Body:**

```json
{
  "rate": 215.0
}
```

### Historial de Tasas

```http
GET /api/rates/history?limit=10
```

**Roles:** `admin_colombia`, `admin_venezuela`

---

## 💸 Transactions Module (Giros)

### Crear Transacción

```http
POST /api/transactions
```

**Body:**

```json
{
  "beneficiaryId": 1,
  "amountCOP": 160000,
  // O alternativamente:
  // "amountBs": 751.17,
  "clientPresencialId": 1, // opcional, si es vendedor
  "comprobanteCliente": "/uploads/proof.jpg", // opcional
  "notes": "Giro para gastos médicos" // opcional
}
```

**Response:**

```json
{
  "id": 1,
  "amountCOP": 160000,
  "amountBs": 751.17,
  "rateUsed": 213.0,
  "status": "pendiente",
  "beneficiary": {...},
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Listar Transacciones

```http
GET /api/transactions?limit=10&offset=0
```

Filtra automáticamente según el rol:

- **Cliente:** Solo sus transacciones
- **Vendedor:** Transacciones que creó
- **Admins:** Todas

### Ver Transacción

```http
GET /api/transactions/:id
```

### Actualizar Estado

```http
PATCH /api/transactions/:id/status
```

**Roles:** `admin_colombia`, `admin_venezuela`

**Body:**

```json
{
  "status": "completado",
  "comprobanteVenezuela": "/uploads/proof-vzla.jpg", // opcional
  "notes": "Transferencia realizada exitosamente" // opcional
}
```

**Estados posibles:**

- `pendiente`
- `enviado_venezuela`
- `procesando`
- `completado`
- `rechazado`

### Ver Historial de Transacción

```http
GET /api/transactions/:id/history
```

---

## 👥 Users Module

### Listar Usuarios

```http
GET /api/users
```

**Roles:** `admin_colombia`, `admin_venezuela`

### Crear Usuario

```http
POST /api/users
```

**Roles:** `admin_colombia`

**Body:**

```json
{
  "name": "Nuevo Vendedor",
  "email": "vendedor@example.com",
  "phone": "3009876543",
  "password": "password123",
  "role": "vendedor",
  "pointId": 1 // si es vendedor
}
```

### Ver Usuario

```http
GET /api/users/:id
```

### Actualizar Usuario

```http
PATCH /api/users/:id
```

### Eliminar Usuario

```http
DELETE /api/users/:id
```

**Roles:** `admin_colombia`

---

## 📍 Points Module (Puntos Físicos)

### Listar Puntos

```http
GET /api/points
```

### Crear Punto

```http
POST /api/points
```

**Roles:** `admin_colombia`

**Body:**

```json
{
  "name": "Punto Centro",
  "address": "Calle 50 #25-30, Bogotá",
  "phone": "3001234567"
}
```

---

## 🧑‍🤝‍🧑 Clients Module (Clientes Presenciales)

### Listar Clientes

```http
GET /api/clients?search=juan
```

**Roles:** `vendedor`, `admin_colombia`

### Crear Cliente

```http
POST /api/clients
```

**Body:**

```json
{
  "name": "María González",
  "phone": "3012345678",
  "documentId": "123456789" // opcional
}
```

---

## 🏦 Beneficiaries Module (Destinatarios)

### Listar Destinatarios

```http
GET /api/beneficiaries?search=jose
```

### Crear Destinatario

```http
POST /api/beneficiaries
```

**Body:**

```json
{
  "fullName": "José Rodríguez",
  "documentId": "V-12345678",
  "bankName": "Banco de Venezuela",
  "accountNumber": "01020123456789012345",
  "accountType": "ahorro",
  "phone": "04121234567", // opcional
  "clientColombiaId": 1 // opcional, si es cliente presencial
}
```

---

## 📎 Proofs Module (Comprobantes)

### Subir Comprobante

```http
POST /api/proofs/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file`: Archivo (imagen o PDF, máx 5MB)

**Response:**

```json
{
  "message": "Archivo subido exitosamente",
  "url": "/uploads/proofs/proof-1234567890.jpg",
  "filename": "proof-1234567890.jpg",
  "originalName": "comprobante.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

---

## 🔔 Notifications Module

### Listar Notificaciones

```http
GET /api/notifications?limit=20&offset=0
```

### Contador de No Leídas

```http
GET /api/notifications/unread-count
```

**Response:**

```json
{
  "count": 5
}
```

### Marcar como Leída

```http
PATCH /api/notifications/:id/read
```

### Marcar Todas como Leídas

```http
PATCH /api/notifications/read-all
```

---

## 📊 Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## ⚠️ Formato de Errores

```json
{
  "statusCode": 400,
  "message": "Mensaje de error descriptivo",
  "errors": null, // detalles adicionales si aplica
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Paginación

Endpoints que retornan listas aceptan:

- `limit`: Número de resultados (default: 10)
- `offset`: Número de resultados a saltar (default: 0)

Ejemplo:

```
GET /api/transactions?limit=20&offset=40
```

---

## 🧪 Testing con Postman

Importa la colección de Postman (próximamente) o usa los ejemplos de cURL en `INICIO-RAPIDO.md`.

