import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const penjualan = await prisma.penjualan.findMany({
    include: { pelanggan: true },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json(penjualan);
}

export async function POST(request) {
  const { pelangganId, detail } = await request.json();

  if (!pelangganId || !detail || detail.length === 0) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }

  try {
    const newPenjualan = await prisma.$transaction(async (tx) => {
      // 1. Validasi stok semua produk dalam keranjang
      for (const item of detail) {
        const produk = await tx.produk.findUnique({
          where: { id: item.produkId },
        });
        if (!produk || produk.stok < item.jumlah) {
          throw new Error(`Stok untuk produk ${produk?.nama || 'ID ' + item.produkId} tidak mencukupi.`);
        }
      }

      // 2. Hitung total belanja
      const totalBelanja = detail.reduce((sum, item) => {
        return sum + item.harga * item.jumlah;
      }, 0);

      // 3. Buat record Penjualan utama
      const penjualan = await tx.penjualan.create({
        data: {
          pelangganId: Number(pelangganId),
          total: totalBelanja,
        },
      });

      // 3. Buat record DetailPenjualan dan update stok
      for (const item of detail) {
        // Buat detail penjualan
        await tx.detailPenjualan.create({
          data: {
            penjualanId: penjualan.id,
            produkId: item.produkId,
            jumlah: item.jumlah,
            hargaSatuan: item.harga, // Simpan harga saat itu
            subtotal: item.harga * item.jumlah,
          },
        });

        // Kurangi stok produk
        await tx.produk.update({
          where: { id: item.produkId },
          data: {
            stok: { decrement: item.jumlah },
          },
        });
      }

      return penjualan;
    });

    return NextResponse.json(newPenjualan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
