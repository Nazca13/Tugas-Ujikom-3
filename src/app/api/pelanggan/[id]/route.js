import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { nama, email, alamat, nomorTelepon } = await request.json();

    const updatedPelanggan = await prisma.pelanggan.update({
      where: { id: Number(id) },
      data: { nama, email, alamat, nomorTelepon },
    });

    return NextResponse.json(updatedPelanggan);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update customer: ' + error.message },
      { status: 500 }
    );
  }
}

// Delete customer with transaction-based cascade delete
export async function DELETE(_, { params }) {
  try {
    const { id } = await params;
    const customerId = Number(id);
    
    // Deleting the customer will cascade to Penjualan and DetailPenjualan
    // due to the schema's onDelete: Cascade setting.
    await prisma.pelanggan.delete({
      where: { id: customerId },
    });
    
    return NextResponse.json({ 
      message: 'Customer and all related data deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete customer: ' + error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}
