// Ejemplo de seed para datos iniciales
// Ejecutar con: ts-node src/shared/typeorm/seeds/seed.example.ts

import { DataSource } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Point } from '../../../modules/points/entities/point.entity';
import { ExchangeRate } from '../../../modules/rates/entities/exchange-rate.entity';
import { UserRole } from '../../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'venexpress',
    entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  await dataSource.initialize();

  console.log('🌱 Iniciando seed...');

  // Crear punto físico
  const pointRepo = dataSource.getRepository(Point);
  const point = pointRepo.create({
    name: 'Punto Principal',
    address: 'Calle 123, Bogotá',
    phone: '3001234567',
  });
  await pointRepo.save(point);
  console.log('✅ Punto físico creado');

  // Crear usuarios
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

  const vendedor = userRepo.create({
    name: 'Vendedor Test',
    email: 'vendedor@venexpress.com',
    phone: '3002222222',
    password: hashedPassword,
    role: UserRole.VENDEDOR,
    pointId: point.id,
  });

  await userRepo.save([adminColombia, adminVenezuela, vendedor]);
  console.log('✅ Usuarios creados');

  // Crear tasa de cambio inicial
  const rateRepo = dataSource.getRepository(ExchangeRate);
  const rate = rateRepo.create({
    saleRate: 213.5,
    createdBy: adminVenezuela,
  });
  await rateRepo.save(rate);
  console.log('✅ Tasa de cambio inicial creada');

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📧 Credenciales de acceso:');
  console.log('   Admin Colombia: admin.colombia@venexpress.com / admin123');
  console.log('   Admin Venezuela: admin.venezuela@venexpress.com / admin123');
  console.log('   Vendedor: vendedor@venexpress.com / admin123\n');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});

