import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const allSales = await prisma.penjualan.findMany({
      orderBy: { tanggal: 'desc' },
      include: {
        pelanggan: true,
        detailPenjualan: {
          include: {
            produk: true,
          },
        },
      },
    });

    const customers = await prisma.pelanggan.findMany({
      orderBy: { nama: 'asc' },
    });

    const lowStockProducts = await prisma.produk.findMany({
      where: {
        stok: {
          lt: 10, // Ambang batas stok rendah
        },
      },
      orderBy: { stok: 'asc' },
    });

    return NextResponse.json({ 
        allSales, 
        customers, 
        lowStockProducts 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
