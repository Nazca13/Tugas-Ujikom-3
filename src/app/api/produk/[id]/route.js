import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { nama, harga, stok } = await request.json();

    const updatedProduk = await prisma.produk.update({
      where: { id: Number(id) },
      data: { 
        nama,
        harga: parseFloat(harga),
        stok: parseInt(stok)
      },
    });

    return NextResponse.json(updatedProduk);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product: ' + error.message },
      { status: 500 }
    );
  }
}

// Delete product with transaction-based cascade delete
export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    const productId = Number(id);
    
    // Deleting the product will cascade to DetailPenjualan
    // due to the schema's onDelete: Cascade setting.
    await prisma.produk.delete({
      where: { id: productId },
    });
    
    return NextResponse.json({ 
      message: 'Product and all related data deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete product: ' + error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}
    