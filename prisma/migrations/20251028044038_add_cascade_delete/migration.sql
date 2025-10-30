-- DropForeignKey
ALTER TABLE "public"."DetailPenjualan" DROP CONSTRAINT "DetailPenjualan_penjualanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DetailPenjualan" DROP CONSTRAINT "DetailPenjualan_produkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Penjualan" DROP CONSTRAINT "Penjualan_pelangganId_fkey";

-- AddForeignKey
ALTER TABLE "Penjualan" ADD CONSTRAINT "Penjualan_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPenjualan" ADD CONSTRAINT "DetailPenjualan_penjualanId_fkey" FOREIGN KEY ("penjualanId") REFERENCES "Penjualan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPenjualan" ADD CONSTRAINT "DetailPenjualan_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
