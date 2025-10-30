'use client';
import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

// Komponen Card untuk metrik
const MetricCard = ({ title, value, isCurrency = false, icon }) => (
    <motion.div 
        className="metric-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
        transition={{ duration: 0.3 }}
    >
        <div className="metric-icon">{icon}</div>
        <div className="metric-content">
            <h3>{title}</h3>
            <p className="metric-value">{isCurrency ? `Rp ${value.toLocaleString()}` : value.toLocaleString()}</p>
        </div>
    </motion.div>
);

// Komponen untuk peringatan stok rendah
const LowStockAlert = ({ products }) => (
    <motion.div 
        className="low-stock-alert"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
    >
        <div className="alert-header">
            <h3>Low Stock Alert</h3>
        </div>
        <div className="alert-content">
            {products.length > 0 ? (
                <ul className="stock-list">
                    {products.map(p => (
                        <li key={p.id} className="stock-item">
                            <span className="product-name">{p.nama}</span>
                            <span className="stock-badge">{p.stok} left</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-alert">All products have sufficient stock</p>
            )}
        </div>
    </motion.div>
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
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalTransactions = filteredSales.length;
        return { totalRevenue, totalTransactions };
    }, [filteredSales]);

    const dailyChartData = useMemo(() => {
        const grouped = filteredSales.reduce((acc, sale) => {
            const date = new Date(sale.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            acc[date] = (acc[date] || 0) + (sale.total || 0);
            return acc;
        }, {});
        return Object.keys(grouped).map(date => ({ date, total: grouped[date] }));
    }, [filteredSales]);

    if (loading) {
        return (
            <main className="laporan-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading report data...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="laporan-container">
            <Toaster position="top-right" />
            
            <motion.div 
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">Sales Report Dashboard</h1>
                <p className="page-subtitle">Comprehensive overview of your sales performance</p>
            </motion.div>

            {/* Filter Section */}
            <motion.section 
                className="filter-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="filter-group">
                    <label>Customer</label>
                    <select 
                        onChange={e => setFilters(f => ({ ...f, customerId: e.target.value }))} 
                        value={filters.customerId}
                        className="filter-select"
                    >
                        <option value="">All Customers</option>
                        {reportData.customers.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Start Date</label>
                    <input 
                        type="date" 
                        onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} 
                        value={filters.startDate}
                        className="filter-input"
                    />
                </div>
                <div className="filter-group">
                    <label>End Date</label>
                    <input 
                        type="date" 
                        onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} 
                        value={filters.endDate}
                        className="filter-input"
                    />
                </div>
            </motion.section>

            {/* Metrics Grid */}
            <section className="metrics-grid">
                <MetricCard 
                    title="Total Revenue" 
                    value={summary.totalRevenue} 
                    isCurrency 
                />
                <MetricCard 
                    title="Total Transactions" 
                    value={summary.totalTransactions}
                />
                <LowStockAlert products={reportData.lowStockProducts} />
            </section>

            {/* Charts */}
            <motion.section 
                className="chart-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="chart-header">
                    <h2>Daily Sales Revenue</h2>
                    <p className="chart-subtitle">Revenue breakdown by date</p>
                </div>
                {dailyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart 
                            data={dailyChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#090909" stopOpacity={0.9}/>
                                    <stop offset="100%" stopColor="#404040" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
                            <XAxis 
                                dataKey="date" 
                                tick={{ fill: '#606060', fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis 
                                tickFormatter={val => `${(val / 1000000).toFixed(1)}M`}
                                tick={{ fill: '#606060', fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <Tooltip 
                                formatter={(val) => [`Rp ${val.toLocaleString()}`, 'Revenue']}
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                labelStyle={{ fontWeight: 'bold', color: '#090909' }}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="url(#colorRevenue)" 
                                radius={[8, 8, 0, 0]}
                                maxBarSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="chart-empty">
                        <p>No data available for chart</p>
                    </div>
                )}
            </motion.section>

            {/* Transaction Details Table */}
            <motion.section 
                className="transactions-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="section-header">
                    <h2>Transaction Details</h2>
                    <span className="transaction-count">{filteredSales.length} transactions</span>
                </div>
                
                {filteredSales.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map(sale => (
                                    <tr key={sale.id}>
                                        <td><span className="badge badge-id">#{sale.id}</span></td>
                                        <td>{new Date(sale.tanggal).toLocaleDateString('id-ID', { 
                                            day: 'numeric', 
                                            month: 'short', 
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</td>
                                        <td><strong>{sale.pelanggan.nama}</strong></td>
                                        <td>
                                            <div className="items-list">
                                                {sale.detailPenjualan.map(d => (
                                                    <span key={d.id} className="item-badge">
                                                        {d.produk.nama} <span className="qty">×{d.jumlah}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <strong className="total-amount">Rp {(sale.total || 0).toLocaleString()}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No transactions found for the selected filters</p>
                    </div>
                )}
            </motion.section>
        </main>
    );
}
