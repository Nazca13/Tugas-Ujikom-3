'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function PenjualanPage() {
    // Data state
    const [penjualan, setPenjualan] = useState([]);
    const [pelanggan, setPelanggan] = useState([]);
    const [produk, setProduk] = useState([]);
    const [cart, setCart] = useState([]);

    // Customer search state
    const [pelangganId, setPelangganId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showPelangganDropdown, setShowPelangganDropdown] = useState(false);
    const customerSearchRef = useRef(null);

    // Product search state
    const [produkSearchTerm, setProdukSearchTerm] = useState('');
    const [showProdukDropdown, setShowProdukDropdown] = useState(false);
    const productSearchRef = useRef(null);

    // Cart modal state
    const [showCartModal, setShowCartModal] = useState(false);

    // Fetch initial data
    const fetchData = async () => {
        const [resPenjualan, resPelanggan, resProduk] = await Promise.all([
            fetch('/api/penjualan'),
            fetch('/api/pelanggan'),
            fetch('/api/produk'),
        ]);
        setPenjualan(await resPenjualan.json());
        setPelanggan(await resPelanggan.json());
        setProduk(await resProduk.json());
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
                setShowPelangganDropdown(false);
            }
            if (productSearchRef.current && !productSearchRef.current.contains(event.target)) {
                setShowProdukDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Customer Logic ---
    const filteredPelanggan = pelanggan.filter(p => p.nama.toLowerCase().includes(searchTerm.toLowerCase()));
    const handlePelangganSelect = (p) => {
        setPelangganId(p.id);
        setSearchTerm(p.nama);
        setShowPelangganDropdown(false);
    };

    // --- Product & Cart Logic ---
    const filteredProduk = produk.filter(p => p.nama.toLowerCase().includes(produkSearchTerm.toLowerCase()));
    const handleAddToCart = (p) => {
        const existingItem = cart.find(item => item.produkId === p.id);

        if (existingItem) {
            if (existingItem.jumlah >= p.stok) {
                toast.error(`Stok ${p.nama} tidak mencukupi!`);
                return;
            }
            setCart(currentCart =>
                currentCart.map(item =>
                    item.produkId === p.id ? { ...item, jumlah: item.jumlah + 1 } : item
                )
            );
        } else {
            if (p.stok < 1) {
                toast.error(`Stok ${p.nama} habis!`);
                return;
            }
            setCart(currentCart => [
                ...currentCart,
                { produkId: p.id, nama: p.nama, harga: p.harga, jumlah: 1, stok: p.stok },
            ]);
        }
        setProdukSearchTerm('');
        setShowProdukDropdown(false);
    };

    const handleQuantityChange = (produkId, newJumlah) => {
        const itemToUpdate = cart.find(item => item.produkId === produkId);
        if (!itemToUpdate) return;

        if (newJumlah > itemToUpdate.stok) {
            toast.error(`Stok ${itemToUpdate.nama} hanya sisa ${itemToUpdate.stok}!`);
            setCart(currentCart => currentCart.map(item =>
                item.produkId === produkId ? { ...item, jumlah: item.stok } : item
            ));
            return;
        }

        setCart(currentCart => currentCart.map(item =>
            item.produkId === produkId ? { ...item, jumlah: newJumlah > 0 ? newJumlah : 1 } : item
        ));
    };

    const handleRemoveFromCart = (produkId) => {
        setCart(currentCart => currentCart.filter(item => item.produkId !== produkId));
    };

    const handleHapusPenjualan = async (penjualanId) => {
        if (!confirm('Yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.')) return;

        const loadingToast = toast.loading('Menghapus transaksi...');
        try {
            const res = await fetch(`/api/penjualan/${penjualanId}`, { method: 'DELETE' });
            const result = await res.json();
            toast.dismiss(loadingToast);

            if (res.ok) {
                toast.success('Transaksi berhasil dihapus!');
                fetchData(); // Refresh data
            } else {
                toast.error(`Gagal: ${result.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(`Error: ${error.message}`);
        }
    };

    const totalBelanja = useMemo(() => {
        return cart.reduce((total, item) => total + (item.harga * item.jumlah), 0);
    }, [cart]);

    // --- Submit Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pelangganId) {
            toast.error('Pilih pelanggan terlebih dahulu!');
            return;
        }
        if (cart.length === 0) {
            toast.error('Keranjang belanja kosong!');
            return;
        }

        const loadingToast = toast.loading('Memproses transaksi...');
        try {
            const res = await fetch('/api/penjualan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pelangganId, detail: cart }),
            });

            const result = await res.json();
            toast.dismiss(loadingToast);

            if (res.ok) {
                toast.success('Transaksi berhasil!');
                setCart([]);
                setPelangganId('');
                setSearchTerm('');
                setShowCartModal(false);
                fetchData(); // Refresh all data
            } else {
                toast.error(`Gagal: ${result.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(`Error: ${error.message}`);
        }
    };

    return (
        <main>
            <Toaster position="top-right" />
            <h1>Create New Sale</h1>

            <form onSubmit={handleSubmit} className="sales-form-complex">
                {/* Customer & Product Selection */}
                <div className="selection-area">
                    <div className="search-container" ref={customerSearchRef}>
                        <input type="text" placeholder="Search customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onFocus={() => setShowPelangganDropdown(true)} required />
                        {showPelangganDropdown && filteredPelanggan.length > 0 && (
                            <div className="search-dropdown">
                                {filteredPelanggan.map(p => <div key={p.id} className="search-option" onClick={() => handlePelangganSelect(p)}>{p.nama}</div>)}
                            </div>
                        )}
                    </div>
                    <div className="search-container" ref={productSearchRef}>
                        <input type="text" placeholder="Search product to add..." value={produkSearchTerm} onChange={e => setProdukSearchTerm(e.target.value)} onFocus={() => setShowProdukDropdown(true)} />
                        {showProdukDropdown && filteredProduk.length > 0 && (
                            <div className="search-dropdown">
                                {filteredProduk.map(p => <div key={p.id} className="search-option" onClick={() => handleAddToCart(p)}>{p.nama} (Stok: {p.stok})</div>)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart Button */}
                {cart.length > 0 && (
                    <button 
                        type="button" 
                        className="cart-toggle-btn"
                        onClick={() => setShowCartModal(true)}
                    >
                        View Cart ({cart.length} items) - Rp {totalBelanja.toLocaleString()}
                    </button>
                )}

                <button type="submit" className="submit-sale-btn">Submit Sale</button>
            </form>

            {/* Cart Modal */}
            {showCartModal && (
                <>
                    <div className="modal-overlay" onClick={() => setShowCartModal(false)}></div>
                    <div className="cart-modal">
                        <div className="modal-header">
                            <h2>Shopping Cart</h2>
                            <button className="modal-close" onClick={() => setShowCartModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {cart.length > 0 ? (
                                <>
                                    <table className="cart-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Subtotal</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map(item => (
                                                <tr key={item.produkId}>
                                                    <td><strong>{item.nama}</strong></td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            value={item.jumlah} 
                                                            onChange={e => handleQuantityChange(item.produkId, parseInt(e.target.value))} 
                                                            min="1" 
                                                            max={item.stok}
                                                            className="qty-input"
                                                        />
                                                    </td>
                                                    <td>Rp {item.harga.toLocaleString()}</td>
                                                    <td><strong>Rp {(item.harga * item.jumlah).toLocaleString()}</strong></td>
                                                    <td>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleRemoveFromCart(item.produkId)} 
                                                            className="remove-btn"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="cart-total">
                                        <h3>Total: Rp {totalBelanja.toLocaleString()}</h3>
                                    </div>
                                </>
                            ) : (
                                <p className="empty-cart">Your cart is empty</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setShowCartModal(false)}>Continue Shopping</button>
                        </div>
                    </div>
                </>
            )}

            <h2>Recent Sales</h2>
            <table>
                <thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Action</th></tr></thead>
                <tbody>
                    {penjualan.map(pj => (
                        <tr key={pj.id}>
                            <td>{pj.id}</td>
                            <td>{pj.pelanggan?.nama || 'N/A'}</td>
                            <td>{new Date(pj.tanggal).toLocaleString()}</td>
                            <td>Rp {(pj.total || 0).toLocaleString()}</td>
                            <td>
                                <div class="action-buttons">
                                    <button type="button" onClick={() => handleHapusPenjualan(pj.id)} className="delete-btn">Hapus</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
