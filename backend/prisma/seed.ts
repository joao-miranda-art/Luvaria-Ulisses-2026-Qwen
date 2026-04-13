/**
 * Seed Script — Dados iniciais para desenvolvimento
 * Executar: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============================================================
  // ADMIN padrão
  // ============================================================
  const adminPassword = await bcrypt.hash('Admin@2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@luvariaulisses.com' },
    update: {},
    create: {
      email: 'admin@luvariaulisses.com',
      name: 'Administrador',
      phone: '+5511999999999',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Admin criado: ${admin.email}`);

  // ============================================================
  // Cliente de exemplo
  // ============================================================
  const clientPassword = await bcrypt.hash('Cliente@2026!', 12);

  const client = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      email: 'cliente@exemplo.com',
      name: 'Maria Silva',
      phone: '+5511988887777',
      passwordHash: clientPassword,
      role: 'CLIENT',
      isActive: true,
    },
  });

  console.log(`✅ Cliente criado: ${client.email}`);

  // ============================================================
  // Materiais de exemplo
  // ============================================================
  const materials = [
    { name: 'Couro de Cabrito Italiano', type: 'LEATHER' as const, priceExtra: 0, stock: 50 },
    { name: 'Couro de Veado Premium', type: 'LEATHER' as const, priceExtra: 150, stock: 30 },
    { name: 'Couro de Pecari', type: 'LEATHER' as const, priceExtra: 200, stock: 20 },
    { name: 'Seda Natural', type: 'LINING' as const, priceExtra: 80, stock: 40 },
    { name: 'Caxemira', type: 'LINING' as const, priceExtra: 120, stock: 25 },
    { name: 'Alpaca', type: 'LINING' as const, priceExtra: 60, stock: 35 },
  ];

  for (const mat of materials) {
    await prisma.material.create({
      data: {
        name: mat.name,
        type: mat.type,
        description: `Material de alta qualidade: ${mat.name}`,
        priceExtra: mat.priceExtra,
        stock: mat.stock,
      },
    });
  }

  console.log(`✅ ${materials.length} materiais criados`);

  // ============================================================
  // Tamanhos de exemplo
  // ============================================================
  const sizes = [
    { value: '5.5', label: 'PP' },
    { value: '6', label: 'P' },
    { value: '6.5', label: 'P/M' },
    { value: '7', label: 'M' },
    { value: '7.5', label: 'M/G' },
    { value: '8', label: 'G' },
    { value: '8.5', label: 'GG' },
    { value: '9', label: 'XG' },
  ];

  for (const size of sizes) {
    await prisma.size.upsert({
      where: { value: size.value },
      update: {},
      create: size,
    });
  }

  console.log(`✅ ${sizes.length} tamanhos criados`);

  // ============================================================
  // Produtos de exemplo
  // ============================================================
  const products = [
    {
      name: 'Luva Clássica de Cabrito',
      description: 'A luva icônica da Luvaria Ulisses. Couro de cabrito italiano macio com acabamento artesanal.',
      basePrice: 890,
      category: 'Clássica',
    },
    {
      name: 'Luva de Cerimônia',
      description: 'Elegância suprema para ocasiões especiais. Couro extra fino com forro de seda.',
      basePrice: 1290,
      category: 'Cerimônia',
    },
    {
      name: 'Luva de Motorista',
      description: 'Design vintage com aberturas nos dedos para máximo controle ao volante.',
      basePrice: 750,
      category: 'Motorista',
    },
    {
      name: 'Luva Térmica de Inverno',
      description: 'Couro resistente com forro de caxemira para os dias mais frios.',
      basePrice: 1100,
      category: 'Inverno',
    },
  ];

  for (const prod of products) {
    const slug = prod.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: { ...prod, slug },
    });
  }

  console.log(`✅ ${products.length} produtos criados`);

  // ============================================================
  // Reserva VIP de exemplo
  // ============================================================
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  futureDate.setHours(14, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      userId: client.id,
      date: futureDate,
      notes: 'Gostaria de experimentar luvas de couro de veado com forro de caxemira.',
      status: 'CONFIRMED',
    },
  });

  console.log('✅ Reserva VIP de exemplo criada');

  console.log('\n🌱 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log(`   ADMIN: ${admin.email} / Admin@2026!`);
  console.log(`   CLIENT: ${client.email} / Cliente@2026!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
