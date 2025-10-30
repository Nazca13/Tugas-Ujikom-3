const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Hapus data lama
  await prisma.detailPenjualan.deleteMany({});
  await prisma.penjualan.deleteMany({});
  await prisma.produk.deleteMany({});
  await prisma.pelanggan.deleteMany({});

  // Buat Pelanggan
  const pelanggan1 = await prisma.pelanggan.create({
    data: {
      nama: 'Alice Johnson',
      email: 'alice@example.com',
    },
  });

  const pelanggan2 = await prisma.pelanggan.create({
    data: {
      nama: 'Bob Williams',
      email: 'bob@example.com',
    },
  });

  console.log('Created customers...');

  // Buat Produk
  const produk1 = await prisma.produk.create({
    data: {
      nama: 'Laptop Pro',
      harga: 15000000,
      stok: 50,
    },
  });

  const produk2 = await prisma.produk.create({
    data: {
      nama: 'Mouse Wireless',
      harga: 250000,
      stok: 200,
    },
  });

  const produk3 = await prisma.produk.create({
    data: {
      nama: 'Keyboard Mechanical',
      harga: 800000,
      stok: 100,
    },
  });

  console.log('Created products...');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
