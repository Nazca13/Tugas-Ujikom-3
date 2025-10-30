'use client';
import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

// Komponen untuk setiap bagian laporan
const ReportCard = ({ title, value, isCurrency = false }) => (
    <motion.div className="overview-card" whileHover={{ scale: 1.05 }}>
        <h3>{title}</h3>
        <p>{isCurrency ? `Rp ${value.toLocaleString()}` : value}</p>
    </motion.div>
);

const LowStockWarning = ({ products }) => (
    <div className="low-stock-warning">
        <h4>⚠️ Low Stock Products</h4>
        {products.length > 0 ? (
            <ul>
                {products.map(p => <li key={p.id}>{p.nama} (Sisa: {p.stok})</li>)}
            </ul>
        ) : <p>All products have sufficient stock.</p>}
    </div>
);

export default function LaporanPage() {
    const [reportData, setReportData] = useState({ allSales: [], customers: [], lowStockProducts: [], salesByCustomer: [] });
    const [filters, setFilters] = useState({ customerId: '', startDate: '', endDate: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/laporan');
                const data = await res.json();
                setReportData(data);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            }
            setLoading(false);
        };
        fetchReportData();
    }, []);

    const filteredSales = useMemo(() => {
        return reportData.allSales.filter(sale => {
            const saleDate = new Date(sale.tanggal);
            const isCustomerMatch = filters.customerId ? sale.pelangganId === Number(filters.customerId) : true;
            const isStartDateMatch = filters.startDate ? saleDate >= new Date(filters.startDate) : true;
            const isEndDateMatch = filters.endDate ? saleDate <= new Date(filters.endDate) : true;
            return isCustomerMatch && isStartDateMatch && isEndDateMatch;
        });
    }, [reportData.allSales, filters]);

    const summary = useMemo(() => {
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalTransactions = filteredSales.length;
        return { totalRevenue, totalTransactions };
    }, [filteredSales]);

    const dailyChartData = useMemo(() => {
        const grouped = filteredSales.reduce((acc, sale) => {
            const date = new Date(sale.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            acc[date] = (acc[date] || 0) + sale.total;
            return acc;
        }, {});
        return Object.keys(grouped).map(date => ({ date, total: grouped[date] })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [filteredSales]);

    if (loading) return <p>Loading report...</p>;

    return (
        <main className="laporan-container">
            <motion.h1 className="laporan-title">Sales Report Dashboard</motion.h1>

            {/* Filters */}
            <motion.section className="filter-section">
                <select onChange={e => setFilters(f => ({ ...f, customerId: e.target.value }))} value={filters.customerId}>
                    <option value="">All Customers</option>
                    {reportData.customers.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
                <input type="date" onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} value={filters.startDate} />
                <input type="date" onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} value={filters.endDate} />
            </motion.section>

            {/* Summary Cards */}
            <motion.section className="overview-section">
                <ReportCard title="Total Revenue" value={summary.totalRevenue} isCurrency />
                <ReportCard title="Total Transactions" value={summary.totalTransactions} />
                <LowStockWarning products={reportData.lowStockProducts} />
            </motion.section>

            {/* Charts */}
            <motion.section className="chart-section">
                <h2>Daily Sales Revenue</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={val => `Rp ${val / 1000}k`} />
                        <Tooltip formatter={val => `Rp ${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="total" fill="#090909" name="Revenue" />
                    </BarChart>
                </ResponsiveContainer>
            </motion.section>

            {/* Detailed Sales Table */}
            <motion.section className="detail-section">
                <h2>Transaction Details</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th></tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(sale => (
                                <tr key={sale.id}>
                                    <td>{sale.id}</td>
                                    <td>{new Date(sale.tanggal).toLocaleString()}</td>
                                    <td>{sale.pelanggan.nama}</td>
                                    <td>
                                        <ul>
                                            {sale.detailPenjualan.map(d => <li key={d.id}>{d.produk.nama} (x{d.jumlah})</li>)}
                                        </ul>
                                    </td>
                                    <td>Rp {sale.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>
        </main>
    );
}
