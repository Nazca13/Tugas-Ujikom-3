import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const detail = await prisma.detailPenjualan.findMany({
    include: { penjualan: { include: { pelanggan: true } }, produk: true },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json(detail);
}

export async function POST(request) {
  const body = await request.json();
  const produk = await prisma.produk.findUnique({
    where: { id: Number(body.produkId) },
  });

  const subtotal = produk.harga * body.jumlah;

  const detail = await prisma.detailPenjualan.create({
    data: {
      penjualanId: Number(body.penjualanId),
      produkId: Number(body.produkId),
      jumlah: Number(body.jumlah),
      subtotal,
    },
  });

  // update stok produk
  await prisma.produk.update({
    where: { id: produk.id },
    data: { stok: produk.stok - body.jumlah },
  });

  return NextResponse.json(detail);
}
