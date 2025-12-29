# Estructura del Backend - Venexpress

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── main.ts                      # Punto de entrada de la aplicación
│   ├── app.module.ts                # Módulo principal
│   │
│   ├── config/                      # Configuraciones
│   │   ├── database.config.ts       # Configuración de PostgreSQL
│   │   ├── aws.config.ts            # Configuración de AWS S3
│   │   └── jwt.config.ts            # Configuración de JWT
│   │
│   ├── common/                      # Elementos compartidos
│   │   ├── guards/                  # Guards de autenticación y autorización
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/                 # Filtros de excepciones
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/            # Interceptores
│   │   │   └── transform.interceptor.ts
│   │   ├── decorators/              # Decoradores personalizados
│   │   │   ├── public.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── enums/                   # Enumeraciones
│   │   │   ├── user-role.enum.ts
│   │   │   └── transaction-status.enum.ts
│   │   └── dto/                     # DTOs compartidos
│   │       └── pagination.dto.ts
│   │
│   ├── modules/                     # Módulos de negocio
│   │   │
│   │   ├── auth/                    # Autenticación y autorización
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   │
│   │   ├── users/                   # Usuarios del sistema
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── points/                  # Puntos físicos de venta
│   │   │   ├── points.module.ts
│   │   │   ├── points.controller.ts
│   │   │   ├── points.service.ts
│   │   │   ├── entities/
│   │   │   │   └── point.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── clients/                 # Clientes presenciales
│   │   │   ├── clients.module.ts
│   │   │   ├── clients.controller.ts
│   │   │   ├── clients.service.ts
│   │   │   ├── entities/
│   │   │   │   └── client.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── beneficiaries/           # Destinatarios en Venezuela
│   │   │   ├── beneficiaries.module.ts
│   │   │   ├── beneficiaries.controller.ts
│   │   │   ├── beneficiaries.service.ts
│   │   │   ├── entities/
│   │   │   │   └── beneficiary.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── transactions/            # Giros/Transacciones
│   │   │   ├── transactions.module.ts
│   │   │   ├── transactions.controller.ts
│   │   │   ├── transactions.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── transaction.entity.ts
│   │   │   │   └── transaction-history.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-transaction.dto.ts
│   │   │       └── update-transaction-status.dto.ts
│   │   │
│   │   ├── rates/                   # Tasas de cambio
│   │   │   ├── rates.module.ts
│   │   │   ├── rates.controller.ts
│   │   │   ├── rates.service.ts
│   │   │   ├── entities/
│   │   │   │   └── exchange-rate.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── proofs/                  # Comprobantes/archivos
│   │   │   ├── proofs.module.ts
│   │   │   ├── proofs.controller.ts
│   │   │   └── proofs.service.ts
│   │   │
│   │   └── notifications/           # Notificaciones
│   │       ├── notifications.module.ts
│   │       ├── notifications.controller.ts
│   │       ├── notifications.service.ts
│   │       └── entities/
│   │           └── notification.entity.ts
│   │
│   ├── shared/                      # Servicios compartidos
│   │   ├── services/
│   │   │   ├── file.service.ts
│   │   │   └── s3.service.ts
│   │   └── typeorm/
│   │       └── migrations/          # Migraciones de base de datos
│   │
│   └── jobs/                        # Procesamiento asíncrono
│       ├── queue.processor.ts
│       └── cron.tasks.ts
│
├── test/                            # Tests E2E
├── uploads/                         # Archivos subidos (local)
├── ormconfig.ts                     # Configuración de TypeORM
├── tsconfig.json                    # Configuración de TypeScript
├── nest-cli.json                    # Configuración de NestJS CLI
├── package.json                     # Dependencias
└── README.md                        # Documentación
```

## 🔐 Roles del Sistema

- **admin_colombia**: Administrador en Colombia
- **admin_venezuela**: Administrador en Venezuela
- **vendedor**: Vendedor en punto físico
- **cliente**: Usuario final de la app

## 📊 Estados de Transacciones

1. **pendiente**: Transacción creada, esperando aprobación
2. **enviado_venezuela**: Aprobada y enviada a Venezuela
3. **procesando**: En proceso de transferencia en Venezuela
4. **completado**: Transferencia completada exitosamente
5. **rechazado**: Transacción rechazada

## 🚀 Próximos Pasos

1. Instalar dependencias: `npm install`
2. Configurar `.env` con las credenciales de base de datos
3. Ejecutar migraciones: `npm run migration:run`
4. Iniciar en desarrollo: `npm run start:dev`

## 📝 Notas

- Las entidades están configuradas con TypeORM
- JWT se usa para autenticación
- Los guards protegen rutas según roles
- Los comprobantes se guardan localmente por ahora (configurar S3 después)

