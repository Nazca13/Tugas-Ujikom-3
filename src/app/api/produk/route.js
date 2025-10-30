import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET semua produk
export async function GET() {
  const produk = await prisma.produk.findMany();
  return NextResponse.json(produk);
}

// POST produk baru
export async function POST(request) {
  const body = await request.json();
  const produk = await prisma.produk.create({
    data: {
      nama: body.nama,
      harga: parseFloat(body.harga),
      stok: parseInt(body.stok),
    },
  });
  return NextResponse.json(produk);
}
