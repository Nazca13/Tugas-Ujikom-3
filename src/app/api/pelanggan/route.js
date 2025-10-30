import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET semua pelanggan
export async function GET() {
  const pelanggan = await prisma.pelanggan.findMany();
  return NextResponse.json(pelanggan);
}

// POST pelanggan baru
export async function POST(request) {
  const body = await request.json();
  const pelanggan = await prisma.pelanggan.create({
    data: {
      nama: body.nama,
      email: body.email,
      alamat: body.alamat,
      nomorTelepon: body.nomorTelepon,
    },
  });
  return NextResponse.json(pelanggan);
}
