// Seed completo para poblar la base de datos con datos de prueba
// Ejecutar con: npm run seed

import { DataSource } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Point } from '../../../modules/points/entities/point.entity';
import { Client } from '../../../modules/clients/entities/client.entity';
import { Beneficiary } from '../../../modules/beneficiaries/entities/beneficiary.entity';
import { Transaction } from '../../../modules/transactions/entities/transaction.entity';
import { TransactionHistory } from '../../../modules/transactions/entities/transaction-history.entity';
import { ExchangeRate } from '../../../modules/rates/entities/exchange-rate.entity';
import { UserRole } from '../../../common/enums/user-role.enum';
import { TransactionStatus } from '../../../common/enums/transaction-status.enum';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
config({ path: join(__dirname, '../../../../.env') });

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
            database: url.pathname.substring(1),
        };
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'venexpress',
    };
}

async function seed() {
    const dbConfig = parseDatabaseUrl();

    const dataSource = new DataSource({
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
        synchronize: true,
    });

    await dataSource.initialize();

    console.log('🌱 Iniciando seed completo...\\n');

    // 1. CREAR PUNTOS FÍSICOS
    console.log('📍 Creando puntos físicos...');
    const pointRepo = dataSource.getRepository(Point);

    const punto1 = pointRepo.create({
        name: 'Punto Centro',
        address: 'Calle 50 #25-30, Bogotá',
        phone: '3001234567',
    });

    const punto2 = pointRepo.create({
        name: 'Punto Norte',
        address: 'Cra 15 #120-45, Bogotá',
        phone: '3009876543',
    });

    await pointRepo.save([punto1, punto2]);
    console.log('✅ 2 puntos físicos creados\\n');

    // 2. CREAR USUARIOS
    console.log('👥 Creando usuarios...');
    const userRepo = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminColombia = userRepo.create({
        name: 'Admin Colombia',
        email: 'admin.colombia@venexpress.com',
        phone: '3001111111',
        password: hashedPassword,
        role: UserRole.ADMIN_COLOMBIA,
    });

    const adminVenezuela = userRepo.create({
        name: 'Admin Venezuela',
        email: 'admin.venezuela@venexpress.com',
        phone: '4121111111',
        password: hashedPassword,
        role: UserRole.ADMIN_VENEZUELA,
    });

    const vendedor1 = userRepo.create({
        name: 'Carlos Rodríguez',
        email: 'carlos@venexpress.com',
        phone: '3002222222',
        password: hashedPassword,
        role: UserRole.VENDEDOR,
        pointId: punto1.id,
    });

    const vendedor2 = userRepo.create({
        name: 'María González',
        email: 'maria@venexpress.com',
        phone: '3003333333',
        password: hashedPassword,
        role: UserRole.VENDEDOR,
        pointId: punto2.id,
    });

    const cliente1 = userRepo.create({
        name: 'Juan Pérez',
        email: 'juan.perez@gmail.com',
        phone: '3004444444',
        password: hashedPassword,
        role: UserRole.CLIENTE,
    });

    await userRepo.save([adminColombia, adminVenezuela, vendedor1, vendedor2, cliente1]);
    console.log('✅ 5 usuarios creados\\n');

    // 3. CREAR TASAS DE CAMBIO
    console.log('💱 Creando tasas de cambio...');
    const rateRepo = dataSource.getRepository(ExchangeRate);

    const rate1 = rateRepo.create({
        saleRate: 210.0,
        createdBy: adminVenezuela,
    });

    const rate2 = rateRepo.create({
        saleRate: 213.5,
        createdBy: adminVenezuela,
    });

    await rateRepo.save([rate1, rate2]);
    console.log('✅ 2 tasas de cambio creadas\\n');

    // 4. CREAR CLIENTES PRESENCIALES
    console.log('🧑‍🤝‍🧑 Creando clientes presenciales...');
    const clientRepo = dataSource.getRepository(Client);

    const clientePresencial1 = clientRepo.create({
        name: 'Pedro Martínez',
        phone: '3005555555',
        documentId: '1234567890',
        vendedor: vendedor1,
    });

    const clientePresencial2 = clientRepo.create({
        name: 'Ana López',
        phone: '3006666666',
        documentId: '9876543210',
        vendedor: vendedor1,
    });

    const clientePresencial3 = clientRepo.create({
        name: 'Luis Hernández',
        phone: '3007777777',
        documentId: '5555555555',
        vendedor: vendedor2,
    });

    await clientRepo.save([clientePresencial1, clientePresencial2, clientePresencial3]);
    console.log('✅ 3 clientes presenciales creados\\n');

    // 5. CREAR DestinatarioS/DESTINATARIOS
    console.log('🏦 Creando Destinatarios...');
    const beneficiaryRepo = dataSource.getRepository(Beneficiary);

    const Destinatario1 = beneficiaryRepo.create({
        fullName: 'María Martínez',
        documentId: 'V-12345678',
        bankName: 'Banco de Venezuela',
        accountNumber: '01020123456789012345',
        accountType: 'ahorro',
        phone: '04121234567',
        clientColombia: clientePresencial1,
    });

    const Destinatario2 = beneficiaryRepo.create({
        fullName: 'José Martínez',
        documentId: 'V-87654321',
        bankName: 'Banesco',
        accountNumber: '01340987654321098765',
        accountType: 'corriente',
        phone: '04149876543',
        clientColombia: clientePresencial1,
    });

    const Destinatario3 = beneficiaryRepo.create({
        fullName: 'Carmen López',
        documentId: 'V-11111111',
        bankName: 'Mercantil',
        accountNumber: '01050111111111111111',
        accountType: 'ahorro',
        phone: '04161111111',
        clientColombia: clientePresencial2,
    });

    const Destinatario4 = beneficiaryRepo.create({
        fullName: 'Roberto Hernández',
        documentId: 'V-22222222',
        bankName: 'Provincial',
        accountNumber: '01080222222222222222',
        accountType: 'ahorro',
        phone: '04142222222',
        clientColombia: clientePresencial3,
    });

    const Destinatario5 = beneficiaryRepo.create({
        fullName: 'Elena Pérez',
        documentId: 'V-33333333',
        bankName: 'Banco de Venezuela',
        accountNumber: '01020333333333333333',
        accountType: 'ahorro',
        phone: '04123333333',
        userApp: cliente1,
    });

    await beneficiaryRepo.save([Destinatario1, Destinatario2, Destinatario3, Destinatario4, Destinatario5]);
    console.log('✅ 5 Destinatarios creados\\n');

    // 6. CREAR TRANSACCIONES
    console.log('💸 Creando transacciones...');
    const transactionRepo = dataSource.getRepository(Transaction);
    const historyRepo = dataSource.getRepository(TransactionHistory);

    const trans1 = transactionRepo.create({
        createdBy: vendedor1,
        clientPresencial: clientePresencial1,
        beneficiary: Destinatario1,
        beneficiaryFullName: Destinatario1.fullName,
        beneficiaryDocumentId: Destinatario1.documentId,
        beneficiaryBankName: Destinatario1.bankName,
        beneficiaryAccountNumber: Destinatario1.accountNumber,
        beneficiaryAccountType: Destinatario1.accountType,
        beneficiaryPhone: Destinatario1.phone,
        amountCOP: 500000,
        amountBs: 500000 / 213.5,
        saleRate: 213.5,
        status: TransactionStatus.COMPLETADO,
        notes: 'Giro para gastos familiares',
        lastEditedAt: new Date(),
    });

    const trans2 = transactionRepo.create({
        createdBy: vendedor1,
        clientPresencial: clientePresencial1,
        beneficiary: Destinatario2,
        beneficiaryFullName: Destinatario2.fullName,
        beneficiaryDocumentId: Destinatario2.documentId,
        beneficiaryBankName: Destinatario2.bankName,
        beneficiaryAccountNumber: Destinatario2.accountNumber,
        beneficiaryAccountType: Destinatario2.accountType,
        beneficiaryPhone: Destinatario2.phone,
        amountCOP: 300000,
        amountBs: 300000 / 213.5,
        saleRate: 213.5,
        status: TransactionStatus.PENDIENTE,
        notes: 'Pago de servicios',
        lastEditedAt: new Date(),
    });

    const trans3 = transactionRepo.create({
        createdBy: vendedor1,
        clientPresencial: clientePresencial2,
        beneficiary: Destinatario3,
        beneficiaryFullName: Destinatario3.fullName,
        beneficiaryDocumentId: Destinatario3.documentId,
        beneficiaryBankName: Destinatario3.bankName,
        beneficiaryAccountNumber: Destinatario3.accountNumber,
        beneficiaryAccountType: Destinatario3.accountType,
        beneficiaryPhone: Destinatario3.phone,
        amountCOP: 750000,
        amountBs: 750000 / 213.5,
        saleRate: 213.5,
        status: TransactionStatus.PENDIENTE,
        notes: 'Envío mensual',
        lastEditedAt: new Date(),
    });

    const trans4 = transactionRepo.create({
        createdBy: vendedor2,
        clientPresencial: clientePresencial3,
        beneficiary: Destinatario4,
        beneficiaryFullName: Destinatario4.fullName,
        beneficiaryDocumentId: Destinatario4.documentId,
        beneficiaryBankName: Destinatario4.bankName,
        beneficiaryAccountNumber: Destinatario4.accountNumber,
        beneficiaryAccountType: Destinatario4.accountType,
        beneficiaryPhone: Destinatario4.phone,
        amountCOP: 1000000,
        amountBs: 1000000 / 213.5,
        saleRate: 213.5,
        status: TransactionStatus.PENDIENTE_VENEZUELA,
        notes: 'Giro urgente',
        lastEditedAt: new Date(),
    });

    const trans5 = transactionRepo.create({
        createdBy: cliente1,
        clientApp: cliente1,
        beneficiary: Destinatario5,
        beneficiaryFullName: Destinatario5.fullName,
        beneficiaryDocumentId: Destinatario5.documentId,
        beneficiaryBankName: Destinatario5.bankName,
        beneficiaryAccountNumber: Destinatario5.accountNumber,
        beneficiaryAccountType: Destinatario5.accountType,
        beneficiaryPhone: Destinatario5.phone,
        amountCOP: 200000,
        amountBs: 200000 / 213.5,
        saleRate: 213.5,
        status: TransactionStatus.PENDIENTE,
        comprobanteCliente: '/uploads/comprobante-ejemplo.jpg',
        notes: 'Desde la app',
        lastEditedAt: new Date(),
    });

    await transactionRepo.save([trans1, trans2, trans3, trans4, trans5]);
    console.log('✅ 5 transacciones creadas\\n');

    // 7. CREAR HISTORIAL DE TRANSACCIONES
    console.log('📝 Creando historial de transacciones...');

    const history1_1 = historyRepo.create({
        transaction: trans1,
        status: TransactionStatus.PENDIENTE,
        note: 'Transacción creada',
        changedBy: vendedor1,
    });

    const history1_2 = historyRepo.create({
        transaction: trans1,
        status: TransactionStatus.PENDIENTE_VENEZUELA,
        note: 'Enviado a Venezuela para procesamiento',
        changedBy: adminColombia,
    });

    const history1_3 = historyRepo.create({
        transaction: trans1,
        status: TransactionStatus.COMPLETADO,
        note: 'Transferencia realizada exitosamente',
        changedBy: adminVenezuela,
    });

    const history3_1 = historyRepo.create({
        transaction: trans3,
        status: TransactionStatus.PENDIENTE,
        note: 'Transacción creada',
        changedBy: vendedor1,
    });

    const history3_2 = historyRepo.create({
        transaction: trans3,
        status: TransactionStatus.COMPLETADO,
        note: 'En proceso de transferencia',
        changedBy: adminVenezuela,
    });

    await historyRepo.save([history1_1, history1_2, history1_3, history3_1, history3_2]);
    console.log('✅ Historial de transacciones creado\\n');

    console.log('🎉 Seed completado exitosamente!\\n');
    console.log('📊 RESUMEN DE DATOS CREADOS:');
    console.log('   • 2 Puntos físicos');
    console.log('   • 5 Usuarios (2 admins, 2 vendedores, 1 cliente)');
    console.log('   • 2 Tasas de cambio');
    console.log('   • 3 Clientes presenciales');
    console.log('   • 5 Destinatarios');
    console.log('   • 5 Transacciones');
    console.log('   • Historial de cambios de estado\\n');

    console.log('📧 CREDENCIALES DE ACCESO:');
    console.log('   ┌─────────────────────────────────────────────────────┐');
    console.log('   │ Admin Colombia:                                     │');
    console.log('   │   Email: admin.colombia@venexpress.com              │');
    console.log('   │   Pass:  admin123                                   │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ Admin Venezuela:                                    │');
    console.log('   │   Email: admin.venezuela@venexpress.com             │');
    console.log('   │   Pass:  admin123                                   │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ Vendedor 1 (Punto Centro):                         │');
    console.log('   │   Email: carlos@venexpress.com                      │');
    console.log('   │   Pass:  admin123                                   │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ Vendedor 2 (Punto Norte):                          │');
    console.log('   │   Email: maria@venexpress.com                       │');
    console.log('   │   Pass:  admin123                                   │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ Cliente App:                                        │');
    console.log('   │   Email: juan.perez@gmail.com                       │');
    console.log('   │   Pass:  admin123                                   │');
    console.log('   └─────────────────────────────────────────────────────┘\\n');

    await dataSource.destroy();
}

seed().catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
});
