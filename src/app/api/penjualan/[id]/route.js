import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Temukan semua detail penjualan yang terkait
      const detailPenjualan = await tx.detailPenjualan.findMany({
        where: { penjualanId: Number(id) },
      });

      if (!detailPenjualan || detailPenjualan.length === 0) {
        // Jika tidak ada detail, mungkin penjualan ini kosong atau sudah diproses
        // Lanjutkan untuk menghapus penjualan utamanya saja
      }

      // 2. Kembalikan stok untuk setiap produk
      for (const item of detailPenjualan) {
        await tx.produk.update({
          where: { id: item.produkId },
          data: {
            stok: { increment: item.jumlah },
          },
        });
      }

      // 3. Hapus record Penjualan (ini akan men-trigger cascade delete untuk DetailPenjualan)
      await tx.penjualan.delete({
        where: { id: Number(id) },
      });
    });

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus dan stok dikembalikan.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
